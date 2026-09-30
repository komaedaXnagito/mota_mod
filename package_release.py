"""一键打包魔塔：python package_release.py；或双击「打包发布.bat」。

要求 Python 3.9+、Node.js 和 npx。首次运行可能需联网下载构建依赖。
输出到 dist：完整发布目录和 ZIP；源文件不改动。
字体在打包时按最新文案自动裁剪，完整源保存在 .release-font-sources。
"""
import argparse
import copy
from datetime import datetime, timedelta, timezone
import html
import os
from pathlib import Path
import re
import shutil
import stat
import subprocess
import sys
import tempfile
import zipfile


ROOT = Path(__file__).resolve().parent
EXCLUDED_DIRS = {
    "_saves", "tests", "tmp", "tools", "types", "webp_output", "常用工具",
    "_codelab", "_docs", "screenshoot", "screenshots",
    "node_modules", "__pycache__",
}
EXCLUDED_FILES = {
    "agents.md", "h5save-editor.html", "hero-walk-debugger.html",
    "jsonl-diff.css", "jsonl-diff.html", "jsonl-diff.js",
}
BUILD_FILES = {"package_release.py", "打包发布.bat"}
# 固定大版本，避免将来升级主版本导致 Node.js / 配置不兼容。
POSTCSS_PACKAGES = ("postcss@8", "postcss-cli@11", "autoprefixer@10", "cssnano@7")
VERSION_PARAMS = {"v", "ver", "version"}
FONT_EXTENSIONS = {".ttf", ".otf", ".woff", ".woff2"}
FONT_SOURCE_NAMES = {
    "TowerBattleSerif.woff2": "SourceHanSerifCN-VF.ttf",
    "NotoSansSC-Numbers.woff2": "NotoSansSC-Variable.ttf",
}
TEXT_EXTENSIONS = {".js", ".css", ".html", ".htm", ".json", ".txt", ".svg"}


def decode_text_characters(text, css=False):
    """收集源码字面字符及转义后的字符；不执行项目代码。"""
    decoded = re.sub(
        r"\\u([dD][89aAbB][0-9a-fA-F]{2})\\u([dD][c-fC-F][0-9a-fA-F]{2})",
        lambda match: chr(0x10000 + ((int(match[1], 16) - 0xD800) << 10)
                          + int(match[2], 16) - 0xDC00), text)

    def unicode_escape(match):
        point = int(next(value for value in match.groups() if value is not None), 16)
        return chr(point) if point <= 0x10FFFF else match[0]

    decoded = re.sub(r"\\u\{([0-9a-fA-F]{1,6})\}|\\u([0-9a-fA-F]{4})|\\x([0-9a-fA-F]{2})",
                     unicode_escape, decoded)
    if css:
        decoded = re.sub(r"\\([0-9a-fA-F]{1,6})(?:\s)?", unicode_escape, decoded)
    return {ord(char) for char in text + html.unescape(decoded)
            if not 0xD800 <= ord(char) <= 0xDFFF}


def collect_font_characters(stage, files):
    # 基础拉丁字母、数字、标点、货币及常用数学符号始终保留。
    characters = set(range(0x20, 0x100)) | set(range(0x2000, 0x2070)) | {0x20AC, 0x2212, 0x221E}
    for relative in files:
        if relative.suffix.casefold() in TEXT_EXTENSIONS:
            path = stage / relative
            try:
                text = path.read_bytes().decode("utf-8-sig")
            except UnicodeDecodeError:
                raise ValueError(f"无法扫描非 UTF-8 文案文件：{relative}，请转为 UTF-8 后重新打包。")
            characters.update(decode_text_characters(text, css=relative.suffix.casefold() == ".css"))
            if relative.suffix.casefold() in {".html", ".htm", ".svg"}:
                for match in re.finditer(r"<style\b[^>]*>(.*?)</style>|\bstyle\s*=\s*([\"'])(.*?)\2",
                                         text, flags=re.IGNORECASE | re.DOTALL):
                    characters.update(decode_text_characters(match[1] or match[3], css=True))
    return characters


def font_source(root, relative):
    """只在首次遇到字体时保存完整源；以后始终从保存的源重新生成。"""
    sources = root / ".release-font-sources"
    source_name = FONT_SOURCE_NAMES.get(relative.name, relative.name)
    source = sources / source_name
    if source.is_file():
        return source
    if relative.name in FONT_SOURCE_NAMES:
        candidate = root / "tmp" / source_name
        if not candidate.is_file():
            raise RuntimeError(f"缺少完整字体源：{source}\n请将 {source_name} 放入该目录。"
                               "不会使用发布子集继续裁剪，以免新字永久缺失。")
    else:
        candidate = root / relative
    sources.mkdir(parents=True, exist_ok=True)
    shutil.copy2(candidate, source)
    return source


def ensure_font_tools(root):
    def imports():
        from fontTools import subset
        from fontTools.ttLib import TTFont
        import brotli
        return subset, TTFont

    try:
        return imports()
    except ImportError:
        pass
    cache = root / ".release-font-tools"
    sys.path.insert(0, str(cache))
    # 迁移已有的本地构建依赖，之后清理 tmp 不会影响一键打包。
    legacy = root / "tmp" / "font-build"
    if not cache.exists() and (legacy / "fontTools").is_dir() and (legacy / "brotli.py").is_file():
        shutil.copytree(legacy, cache)
    try:
        return imports()
    except ImportError:
        print("安装本地字体裁剪依赖（fonttools / brotli）…", flush=True)
        subprocess.run([sys.executable, "-m", "pip", "install", "--disable-pip-version-check",
                        "--no-warn-script-location", "--target", str(cache),
                        "--cache-dir", str(root / ".release-pip-cache"),
                        "fonttools>=4.60,<5", "brotli>=1.1,<2"], check=True)
        import importlib
        importlib.invalidate_caches()
        return imports()


def subset_fonts(root, stage, files):
    fonts = [relative for relative in files if relative.parts[:2] == ("project", "fonts")
             and relative.suffix.casefold() in FONT_EXTENSIONS]
    if not fonts:
        return
    # 先确认完整源齐全；避免误用已有的宋体 / 数字子集作为原始字库。
    sources = {relative: font_source(root, relative) for relative in fonts}
    subset, TTFont = ensure_font_tools(root)
    characters = collect_font_characters(stage, files)
    print(f"字体裁剪：扫描得到 {len(characters):,} 种字符（含基础字符和转义文案）。", flush=True)
    before_total = after_total = 0
    for relative in fonts:
        target = stage / relative
        before = target.stat().st_size
        with TTFont(sources[relative]) as font:
            supported = set(font.getBestCmap())
            required = characters & supported
            if relative.name == "NotoSansSC-Numbers.woff2":
                # 这份字体只负责拉丁字母、数字及符号；中文必须继续回退到宋体。
                numeric_characters = set(range(0x20, 0x100)) | set(range(0x2000, 0x2800))
                required &= numeric_characters
            # 保持发布字体原有名称及版权信息；尤其是已重命名的思源宋体。
            with TTFont(root / relative) as original:
                font["name"] = copy.deepcopy(original["name"])
            options = subset.Options()
            options.name_IDs = ["*"]
            options.name_languages = ["*"]
            options.name_legacy = True
            options.layout_features = ["*"]  # 保留数字特性、连字及字重相关布局。
            subsetter = subset.Subsetter(options=options)
            subsetter.populate(unicodes=required)
            subsetter.subset(font)
            font.flavor = relative.suffix[1:].lower() if relative.suffix.casefold() in {".woff", ".woff2"} else None
            font.save(target)
        # 校验发布产物的字符覆盖，避免静默输出缺字的子集。
        with TTFont(target) as result:
            missing = required - set(result.getBestCmap())
            if missing:
                raise RuntimeError(f"字体裁剪校验失败：{relative} 缺少 {len(missing)} 个字符。")
        after = target.stat().st_size
        before_total += before
        after_total += after
        print(f"  {relative.name}：{len(required):,}/{len(supported):,} 个字符，"
              f"{before:,} → {after:,} 字节", flush=True)
    print(f"字体合计：{before_total:,} → {after_total:,} 字节。"
          "未被原字体覆盖的字符由浏览器后备字体显示。", flush=True)


def is_link(path):
    attributes = getattr(path.lstat(), "st_file_attributes", 0)
    return path.is_symlink() or bool(attributes & getattr(stat, "FILE_ATTRIBUTE_REPARSE_POINT", 0))


def collect_files(root, output):
    """按相对路径筛选；目录规则递归生效，MD / XLSX 规则仅作用于根目录。"""
    root, output = Path(root).resolve(), Path(output).resolve()
    files = []
    for current, directories, names in os.walk(root, followlinks=False):
        current = Path(current)
        directories[:] = sorted(
            name for name in directories
            if not name.startswith(".") and name.casefold() not in EXCLUDED_DIRS
            and (current / name).resolve() not in {output, root / "dist"}
            and not is_link(current / name)
        )
        for name in sorted(names):
            path = current / name
            relative = path.relative_to(root)
            lowered = name.casefold()
            if lowered in EXCLUDED_FILES or lowered.endswith(".d.ts") or is_link(path):
                continue
            if len(relative.parts) == 1:
                if lowered in BUILD_FILES or path.suffix.casefold() in {".md", ".xlsx"}:
                    continue
            files.append(relative)
    return files


def strip_version(url):
    match = re.fullmatch(r"([^?#]+\.(?:js|css))\?([^#]*)(#.*)?", url, re.IGNORECASE)
    if not match:
        return url
    base, query, fragment = match.groups()
    params = re.split(r"&(?:amp;)?", query)
    kept = [param for param in params
            if html.unescape(param.split("=", 1)[0]).casefold() not in VERSION_PARAMS]
    if len(params) == 1 and re.fullmatch(r"v?\d[\w.-]*", query, re.IGNORECASE):
        kept = []  # 兼容 main.js?210190 等直接附加版本号的写法
    separator = "&amp;" if "&amp;" in query else "&"
    return base + ("?" + separator.join(kept) if kept else "") + (fragment or "")


def clean_index(content):
    count = 0

    def attribute(match):
        nonlocal count
        prefix, quote, url = match.groups()
        cleaned = strip_version(url)
        if cleaned != url:
            count += 1
        return prefix + quote + cleaned + quote

    def tag(match):
        return re.sub(r"(\b(?:src|href)\s*=\s*)([\"'])(.*?)\2", attribute,
                      match.group(0), flags=re.IGNORECASE | re.DOTALL)

    content = re.sub(r"<(?:script|link)\b[^>]*>", tag, content, flags=re.IGNORECASE)
    return content, count


def run_postcss(stage, css_files, cache):
    npx = shutil.which("npx")
    if not npx:
        raise RuntimeError("找不到 npx，请先安装 Node.js（包含 npm / npx）并重新打开终端。")
    args = [npx, "--yes"]
    args.extend("--package=" + package for package in POSTCSS_PACKAGES)
    args.extend(["--", "postcss"])
    # 由 CLI 展开固定 glob；不让 npx 的二次 CMD 调用解析素材文件名。
    # 发布副本已完成过滤，所以匹配结果恰好是需要处理的 project CSS。
    args.extend(["project/**/*.[cC][sS][sS]", "--include-dotfiles",
                 "--replace", "--no-map", "--use", "autoprefixer", "cssnano"])
    env = os.environ.copy()
    env["npm_config_cache"] = str(cache)
    env["npm_config_audit"] = "false"
    env["npm_config_fund"] = "false"
    print("运行 npx postcss（补兼容前缀并压缩；首次运行可能需要下载依赖）…", flush=True)
    if os.name == "nt":
        # CMD 只解析固定占位符；参数值置于引号内，兼容中文、空格、& 等路径。
        # 禁用 delayed expansion，防止文件名中的 ! 被解释。
        placeholders = []
        for index, value in enumerate(args):
            key = f"TOWER_PACK_ARGUMENT_{index}"
            env[key] = str(value)
            placeholders.append(f'"%{key}%"')
        command = subprocess.list2cmdline([
            os.environ.get("COMSPEC", "cmd.exe"), "/d", "/v:off", "/s", "/c"
        ]) + ' "' + " ".join(placeholders) + '"'
    else:
        command = args
    subprocess.run(command, cwd=stage, env=env, check=True)


def package_release(root, output):
    root, output = Path(root).resolve(), Path(output).resolve()
    if output == root or output in root.parents:
        raise ValueError("输出目录不能是项目根目录或它的上级目录。")
    if not (root / "index.html").is_file() or not (root / "project").is_dir():
        raise ValueError("项目根目录中必须有 index.html 和 project 文件夹。")
    if not shutil.which("npx"):
        raise RuntimeError("找不到 npx，请先安装 Node.js（包含 npm / npx）。")
    files = collect_files(root, output)
    css_files = [path for path in files if path.parts[0] == "project" and path.suffix.casefold() == ".css"]
    if not css_files:
        raise ValueError("project 中没有可处理的 CSS 文件，请检查目录。")
    stamp = datetime.now(timezone(timedelta(hours=8))).strftime("%Y%m%d-%H%M%S-%f")
    name = f"tower-release-{stamp}"
    output.mkdir(parents=True, exist_ok=True)
    final_folder, final_zip = output / name, output / (name + ".zip")
    print(f"筛选后共 {len(files)} 个文件，其中 project CSS {len(css_files)} 个。", flush=True)
    # 临时副本完全处理成功后才发布，失败不会留下看似完整的发布包。
    with tempfile.TemporaryDirectory(prefix=".tower-pack-", dir=output) as temporary:
        temporary = Path(temporary)
        stage = temporary / "tower"
        stage.mkdir()
        for relative in files:
            target = stage / relative
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(root / relative, target)
        index_path = stage / "index.html"
        # 保留原换行风格，避免无关内容变化。
        index = index_path.read_bytes().decode("utf-8-sig")
        cleaned, count = clean_index(index)
        index_path.write_bytes(cleaned.encode("utf-8"))
        print(f"index.html 已移除 {count} 处 JS / CSS 加载版本号。", flush=True)
        # 在 CSS 压缩前扫描，保证 content 字符串及字体相关文案都能被纳入。
        subset_fonts(root, stage, files)
        before = sum((stage / path).stat().st_size for path in css_files)
        run_postcss(stage, css_files, root / ".release-npm-cache")
        after = sum((stage / path).stat().st_size for path in css_files)
        print(f"CSS 处理完成：{before:,} → {after:,} 字节。", flush=True)
        archive = temporary / "tower.zip"
        with zipfile.ZipFile(archive, "w", zipfile.ZIP_DEFLATED, compresslevel=6) as bundle:
            for relative in files:
                bundle.write(stage / relative, f"{name}/{relative.as_posix()}")
        # ZIP 内套一层同名发布文件夹，解压后文件不会散落在目标目录。
        stage.rename(final_folder)
        archive.rename(final_zip)
    return final_folder, final_zip


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("-o", "--output", type=Path, default=ROOT / "dist", help="输出目录（默认：项目根目录/dist）")
    args = parser.parse_args()
    try:
        folder, archive = package_release(ROOT, args.output)
    except subprocess.CalledProcessError as exc:
        print(f"\n打包失败：构建命令执行失败（退出码 {exc.returncode}）。"
              "\n请检查上方依赖安装或 CSS 错误后重试。源文件未被修改。", flush=True)
        return 1
    except (OSError, ValueError, RuntimeError) as exc:
        print(f"\n打包失败：{exc}\n请解决上述问题后重试。源文件未被修改。", flush=True)
        return 1
    print(f"\n打包成功！\n发布目录：{folder}\nZIP 文件：{archive}\nZIP 大小：{archive.stat().st_size / 1024 / 1024:.2f} MB", flush=True)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
