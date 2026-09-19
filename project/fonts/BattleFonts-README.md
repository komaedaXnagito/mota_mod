# 战斗与商店界面字体

战斗、武器商店、免费武器选择和完整武器档案使用两份本地可变字体，由共用 `project/weaponUI.css` 注册，无需先进入战斗即可加载：

- 思源宋体中文子集：主要标题使用 600，角色名、武器名、按钮和战斗状态使用 500，正文使用 400。保留官方字形，避免依赖系统宋体。
- Noto Sans SC 数字子集：血量、奥义、DPS、伤害、时间及冷却数字使用无衬线字形，并显式启用等高、等宽数字特性。

## 思源宋体

来源：[Adobe 官方仓库](https://github.com/adobe-fonts/source-han-serif)，版本 2.003，原文件为 `Variable/TTF/Subset/SourceHanSerifCN-VF.ttf`，于 2026-09-19 下载，SHA-256：`8e052cbcdbd0f03496c9ad05da7d57901549286d5efd30f3caf66a393f6c389b`。

产物为 `TowerBattleSerif.woff2`，保留原字体支持的 GB2312、ASCII 及当前项目 JS/CSS 中的字符，共 7,596 个 Unicode 字符，约 2.52 MiB。字重轴为 250–900。子集没有改动笔形；遵循 OFL 对保留名称 `Source` 的要求，内部字体家族重命名为 `Tower Battle Serif`。版权与完整许可保存在 `SourceHanSerif-OFL.txt` 及字体内部。

## Noto Sans SC 数字

来源：[Google Fonts 官方仓库](https://github.com/google/fonts/tree/main/ofl/notosanssc)。原文件为 `NotoSansSC[wght].ttf`，于 2026-09-19 下载，SHA-256：`a3041811a78c361b1de50f953c805e0244951c21c5bd412f7232ef0d899af0da`。

许可：SIL Open Font License 1.1，可随游戏嵌入和分发；完整版权与许可证保存在同目录的 `NotoSansSC-OFL.txt`，字体内部版权元数据也予以保留。

`NotoSansSC-Numbers.woff2` 保留原字体支持的 ASCII、Latin-1 和常用数学符号，共 195 个 Unicode 字符，约 22 KiB，字重轴为 100–900。中文交由思源宋体显示。两份字体均只从游戏本地加载，不请求外部字体服务；未覆盖的生僻字使用系统后备字体。

需要更新字库时，安装 `fonttools` 与 `brotli`，下载上述官方 TTF，再从仓库根目录执行：

```sh
python project/fonts/subset_battle_fonts.py /path/to/SourceHanSerifCN-VF.ttf /path/to/NotoSansSC-Variable.ttf
```

当前产物使用 fonttools 4.65.0、brotli 1.2.0 构建。
