"""Run: python -B tests/png_to_webp_test.py"""
import importlib.util
from pathlib import Path
import tempfile
import threading
import unittest

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("png_to_webp", ROOT / "常用工具" / "png_to_webp.py")
tool = importlib.util.module_from_spec(spec)
spec.loader.exec_module(tool)


class ConverterTest(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix="png-webp-")
        self.addCleanup(self.temp.cleanup)
        self.source = Path(self.temp.name) / "中文输入"
        self.source.mkdir()
        self.output = Path(self.temp.name) / "中文输出"

    def image(self, name="透明.PNG"):
        path = self.source / name
        path.parent.mkdir(parents=True, exist_ok=True)
        with Image.new("RGBA", (3, 2)) as image:
            image.putdata([(20, 30, 40, 0), (90, 70, 20, 128), (200, 5, 99, 255)] * 2)
            image.save(path)
        return path

    def test_lossless_preserves_pixels_and_source(self):
        path = self.image()
        original = path.read_bytes()
        result = tool.convert_batch(self.source, self.output)
        self.assertEqual(result["success"], 1)
        with Image.open(path) as png, Image.open(self.output / "透明.webp") as webp:
            self.assertEqual(webp.format, "WEBP")
            self.assertEqual(png.size, webp.size)
            self.assertEqual(png.convert("RGBA").tobytes(), webp.convert("RGBA").tobytes())
        self.assertEqual(path.read_bytes(), original)

    def test_recursive_paths_and_existing_output(self):
        self.image("a/同名.png")
        self.image("b/同名.png")
        tool.convert_batch(self.source, self.output)
        before = (self.output / "a/同名.webp").read_bytes()
        result = tool.convert_batch(self.source, self.output)
        self.assertEqual(result["skipped"], 2)
        self.assertEqual((self.output / "a/同名.webp").read_bytes(), before)
        self.assertTrue((self.output / "b/同名.webp").exists())

    def test_lossy_preserves_alpha_and_overwrite(self):
        path = self.image()
        self.output.mkdir()
        target = self.output / "透明.webp"
        target.write_bytes(b"old output")
        result = tool.convert_batch(self.source, self.output, lossless=False, quality=80, overwrite=True)
        self.assertEqual(result["success"], 1)
        with Image.open(path) as png, Image.open(target) as webp:
            self.assertEqual(webp.size, png.size)
            self.assertEqual(png.getchannel("A").tobytes(), webp.convert("RGBA").getchannel("A").tobytes())

    def test_corrupt_and_animated_png_do_not_stop_batch(self):
        (self.source / "坏图.png").write_bytes(b"not an image")
        with Image.new("RGBA", (3, 2), "red") as first, Image.new("RGBA", (3, 2), "blue") as second:
            first.save(self.source / "动画.png", save_all=True, append_images=[second], duration=100)
        self.image()
        result = tool.convert_batch(self.source, self.output)
        self.assertEqual(result["success"], 1)
        self.assertEqual(result["failed"], 2)
        self.assertFalse((self.output / "动画.webp").exists())
        self.assertEqual(list(self.output.glob("*.tmp")), [])

    def test_non_recursive_and_empty_folder(self):
        self.image("nested/图.png")
        result = tool.convert_batch(self.source, self.output, recursive=False)
        self.assertEqual(result["success"], 0)
        self.assertEqual(result["failed"], 0)

    def test_cancel_and_invalid_quality(self):
        self.image()
        cancel = threading.Event()
        cancel.set()
        result = tool.convert_batch(self.source, self.output, cancel=cancel)
        self.assertTrue(result["cancelled"])
        self.assertFalse(self.output.exists())
        with self.assertRaises(ValueError):
            tool.convert_batch(self.source, self.output, quality=101)

    def test_same_folder_keeps_original(self):
        path = self.image()
        original = path.read_bytes()
        tool.convert_batch(self.source, self.source)
        self.assertEqual(path.read_bytes(), original)
        self.assertTrue(path.with_suffix(".webp").exists())


if __name__ == "__main__":
    unittest.main()
