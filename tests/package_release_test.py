"""Run: python -B tests/package_release_test.py"""
import importlib.util
import shutil
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch
import zipfile


ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("package_release", ROOT / "package_release.py")
tool = importlib.util.module_from_spec(spec)
spec.loader.exec_module(tool)


class ReleaseFixture(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix="tower-release-test-")
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)

    def write(self, name, content="fixture"):
        path = self.root / name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(content, encoding="utf-8")
        return path


class ReleaseTest(ReleaseFixture):
    def test_filters_at_every_level_and_root_only_rules(self):
        excluded = [".git/config", "project/.private/a", "dist/old/index.html",
                    "AGENTS.md", "h5save-editor.html", "hero-walk-debugger.html",
                    "jsonl-diff.css", "jsonl-diff.html", "jsonl-diff.js",
                    "runtime.d.ts", "project/nested/types.d.ts", "README.md", "表格.xlsx",
                    "package_release.py", "打包发布.bat",
                    "_codelab/tutorial/index.html", "_docs/guide/index.html",
                    "screenshoot/debug.png", "screenshots/debug.png"]
        for directory in tool.EXCLUDED_DIRS:
            excluded.extend([directory + "/a.txt", "project/nested/" + directory + "/a.txt"])
        included = ["index.html", "main.js", "project/style.css", "project/nested/readme.md",
                    "project/nested/table.xlsx", "_server/editor.js", "libs/core.js", ".gitignore"]
        for name in excluded + included:
            self.write(name)
        result = {path.as_posix() for path in tool.collect_files(self.root, self.root / "dist")}
        self.assertEqual(result, set(included))

    def test_removes_only_script_and_stylesheet_versions(self):
        before = '''<link href="a.css?v=1&amp;theme=dark#anchor">
<script SRC='main.js?version=2'></script><script src="other.js?210190"></script>
<img src="hero.png?v=3"><script>const example="thing.js?v=5";</script>'''
        expected = '''<link href="a.css?theme=dark#anchor">
<script SRC='main.js'></script><script src="other.js"></script>
<img src="hero.png?v=3"><script>const example="thing.js?v=5";</script>'''
        after, count = tool.clean_index(before)
        self.assertEqual(after, expected)
        self.assertEqual(count, 3)

    def test_output_contains_processed_css_and_sources_are_unchanged(self):
        index = self.write("index.html", '<script src="main.js?v=42"></script>')
        source_css = self.write("project/sub/style.css", ".a { color: red; }")
        self.write("main.js")
        self.write("tests/ignored.js")
        originals = index.read_bytes(), source_css.read_bytes()

        def process(stage, css_files, cache):
            self.assertEqual(css_files, [Path("project/sub/style.css")])
            (stage / css_files[0]).write_text(".a{color:red}", encoding="utf-8")

        with patch.object(tool.shutil, "which", return_value="npx"), patch.object(tool, "run_postcss", side_effect=process):
            folder, archive = tool.package_release(self.root, self.root / "dist")
        self.assertEqual((folder / "project/sub/style.css").read_text(), ".a{color:red}")
        self.assertEqual((folder / "index.html").read_text(), '<script src="main.js"></script>')
        with zipfile.ZipFile(archive) as bundle:
            prefix = folder.name + "/"
            self.assertEqual(set(bundle.namelist()), {
                prefix + "index.html", prefix + "main.js", prefix + "project/sub/style.css"
            })
            self.assertEqual(bundle.read(prefix + "project/sub/style.css"), b".a{color:red}")
        self.assertEqual((index.read_bytes(), source_css.read_bytes()), originals)

    def test_postcss_failure_does_not_publish_partial_package(self):
        self.write("index.html")
        css = self.write("project/style.css", "bad CSS")
        with patch.object(tool.shutil, "which", return_value="npx"), patch.object(tool, "run_postcss", side_effect=RuntimeError("failed")):
            with self.assertRaises(RuntimeError):
                tool.package_release(self.root, self.root / "dist")
        self.assertEqual(list((self.root / "dist").iterdir()), [])
        self.assertEqual(css.read_text(), "bad CSS")

    def test_custom_output_and_invalid_root_output(self):
        self.write("publish/old.txt")
        self.write("index.html")
        self.assertEqual(tool.collect_files(self.root, self.root / "publish"), [Path("index.html")])
        with self.assertRaises(ValueError):
            tool.package_release(self.root, self.root)

    def test_character_scan_decodes_js_css_and_html(self):
        self.write("project/event.js", r'"\u9F98\u{20000}\uD840\uDC01\x41"')
        self.write("project/style.css", r'.label::after { content: "\9750 "; }')
        self.write("index.html", '&#x9F49; &amp; <style>.x{content:"\\9b31 "}</style>')
        files = tool.collect_files(self.root, self.root / "dist")
        points = tool.collect_font_characters(self.root, files)
        self.assertTrue({0x9F98, 0x20000, 0x20001, 0x41, 0x9750, 0x9F49, 0x26, 0x9B31} <= points)
        self.assertFalse(any(0xD800 <= point <= 0xDFFF for point in points))

    def test_missing_full_serif_source_stops_build(self):
        self.write("project/fonts/TowerBattleSerif.woff2")
        with self.assertRaisesRegex(RuntimeError, "完整字体源"):
            tool.font_source(self.root, Path("project/fonts/TowerBattleSerif.woff2"))


class FontSubsetTest(ReleaseFixture):
    @classmethod
    def setUpClass(cls):
        _, cls.TTFont = tool.ensure_font_tools(ROOT)

    def make_font(self, name, characters, woff2=False):
        from fontTools.fontBuilder import FontBuilder
        from fontTools.pens.ttGlyphPen import TTGlyphPen
        path = self.root / name
        path.parent.mkdir(parents=True, exist_ok=True)
        builder = FontBuilder(1000, isTTF=True)
        cmap = {ord(char): f"u{ord(char):06x}" for char in characters}
        order = [".notdef"] + list(cmap.values())
        builder.setupGlyphOrder(order)
        builder.setupCharacterMap(cmap)
        glyphs = {}
        for glyph in order:
            pen = TTGlyphPen(None)
            pen.moveTo((0, 0))
            pen.lineTo((400, 0))
            pen.lineTo((400, 600))
            pen.lineTo((0, 600))
            pen.closePath()
            glyphs[glyph] = pen.glyph()
        builder.setupGlyf(glyphs)
        builder.setupHorizontalMetrics({name: (600, 0) for name in order})
        builder.setupHorizontalHeader(ascent=800, descent=-200)
        builder.setupNameTable({"familyName": "Release Font Test", "styleName": "Regular",
                                "uniqueFontIdentifier": "ReleaseFontTest", "fullName": "Release Font Test",
                                "psName": "ReleaseFontTest"})
        builder.setupOS2(sTypoAscender=800, sTypoDescender=-200, usWinAscent=800, usWinDescent=200)
        builder.setupPost()
        if woff2:
            builder.font.flavor = "woff2"
        builder.save(path)
        return path

    def test_later_build_adds_new_character_from_preserved_full_source(self):
        relative = Path("project/fonts/beeB.ttf")
        original = self.make_font(relative, "A中龘")
        original_bytes = original.read_bytes()
        self.write("project/event.js", '"中"')
        files = tool.collect_files(self.root, self.root / "dist")

        def build_snapshot(name):
            stage = self.root / "dist" / name
            for path in files:
                target = stage / path
                target.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(self.root / path, target)
            tool.subset_fonts(self.root, stage, files)
            return stage

        first = build_snapshot("first")
        with self.TTFont(first / relative) as font:
            self.assertIn(ord("中"), font.getBestCmap())
            self.assertNotIn(ord("龘"), font.getBestCmap())
        # 用新增的 Unicode 转义文案重建，旧产物不会作为下一次裁剪的输入。
        self.write("project/event.js", r'"中\u9F98"')
        second = build_snapshot("second")
        with self.TTFont(second / relative) as font:
            self.assertTrue({ord("中"), ord("龘")} <= set(font.getBestCmap()))
            self.assertEqual(font["name"].getDebugName(1), "Release Font Test")
        self.assertEqual(original.read_bytes(), original_bytes)
        self.assertEqual((self.root / ".release-font-sources/beeB.ttf").read_bytes(), original_bytes)

    def test_numeric_font_keeps_symbols_without_taking_over_chinese(self):
        relative = Path("project/fonts/NotoSansSC-Numbers.woff2")
        self.make_font("tmp/NotoSansSC-Variable.ttf", "01中龘→")
        self.make_font(relative, "01", woff2=True)
        self.write("project/event.js", r'"中龘\u2192"')
        files = tool.collect_files(self.root, self.root / "dist")
        stage = self.root / "dist" / "numeric"
        for path in files:
            target = stage / path
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(self.root / path, target)
        tool.subset_fonts(self.root, stage, files)
        with self.TTFont(stage / relative) as font:
            self.assertEqual(font.flavor, "woff2")
            self.assertTrue({ord("0"), ord("1"), ord("→")} <= set(font.getBestCmap()))
            self.assertNotIn(ord("中"), font.getBestCmap())
            self.assertNotIn(ord("龘"), font.getBestCmap())


if __name__ == "__main__":
    unittest.main()
