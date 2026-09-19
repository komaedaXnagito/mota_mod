"""生成思源宋体中文子集与 Noto Sans 数字子集；依赖 fonttools、brotli。"""
import argparse
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont


def game_codepoints(directory):
    codepoints = set(range(0x20, 0x7F))
    # 保留 GB2312 全字符，避免玩家名字及后续常用文案需要重新构建字体。
    for high in range(0xA1, 0xF8):
        for low in range(0xA1, 0xFF):
            try:
                codepoints.add(ord(bytes([high, low]).decode("gb2312")))
            except UnicodeDecodeError:
                pass
    # 补充现有项目中的稀有字、标点与符号；没有的字仍由 CSS 后备字体显示。
    for source in directory.parent.rglob("*"):
        if source.suffix in (".js", ".css"):
            codepoints.update(map(ord, source.read_text(encoding="utf-8-sig")))
    return codepoints


def build(source, destination, codepoints, rename_serif=False):
    font = TTFont(source)
    supported = set(font.getBestCmap())
    options = subset.Options()
    options.flavor = "woff2"
    options.name_IDs = ["*"]  # 保留作者、版权及授权元数据。
    options.name_languages = ["*"]
    subsetter = subset.Subsetter(options=options)
    subsetter.populate(unicodes=codepoints & supported)
    subsetter.subset(font)
    if rename_serif:
        # OFL 保留名称为 Source；子集不更改笔形，但必须另起内部字体名称。
        names = {1: "Tower Battle Serif", 3: "TowerBattleSerif-2.003-BattleSubset",
                 4: "Tower Battle Serif", 6: "TowerBattleSerif-Regular",
                 16: "Tower Battle Serif", 21: "Tower Battle Serif", 25: "TowerBattleSerif"}
        postscript_ids = {instance.postscriptNameID for instance in font["fvar"].instances}
        for name in font["name"].names:
            value = names.get(name.nameID)
            if name.nameID in postscript_ids:
                value = name.toUnicode().replace("SourceHanSerifCNVF", "TowerBattleSerif")
            if value:
                name.string = value.encode(name.getEncoding())
    font.flavor = "woff2"
    font.save(destination)
    print(f"{destination.name}: {destination.stat().st_size:,} bytes, {len(codepoints & supported):,} codepoints")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("serif", type=Path, help="官方 SourceHanSerifCN-VF.ttf")
    parser.add_argument("sans", type=Path, help="官方 NotoSansSC[wght].ttf")
    args = parser.parse_args()
    directory = Path(__file__).resolve().parent
    build(args.serif, directory / "TowerBattleSerif.woff2", game_codepoints(directory), rename_serif=True)
    numbers = set(range(0x20, 0x100)) | {0x2013, 0x2014, 0x2212, 0x221E}
    build(args.sans, directory / "NotoSansSC-Numbers.woff2", numbers)


if __name__ == "__main__":
    main()
