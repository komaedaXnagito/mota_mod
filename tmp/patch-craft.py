# -*- coding: utf-8 -*-
import io

css = """
/* ===== 背包乱斗武器合成 ===== */
.backpack-craft-root {
	position: fixed;
	inset: 0;
	z-index: 10070;
	display: flex;
	align-items: center;
	justify-content: center;
	background: rgba(8, 6, 5, .62);
	touch-action: none;
	user-select: none;
}
.backpack-craft-panel {
	width: min(760px, calc(100vw - 24px));
	max-height: 90vh;
	overflow-y: auto;
	box-sizing: border-box;
	padding: 16px 18px;
	border: 1px solid #c29458;
	border-radius: 14px;
	background: linear-gradient(150deg, #3a2c20, #221a16);
	color: #f7ead2;
	box-shadow: 0 18px 48px rgba(0, 0, 0, .7);
	font: 13px/1.4 'Microsoft YaHei', sans-serif;
}
.backpack-craft-header { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
.backpack-craft-title { flex: 1; font: bold 18px sans-serif; color: #ffe8bd; }
.backpack-craft-close {
	border: 1px solid #c29458; border-radius: 6px; color: #fff7e8;
	background: #6b4529; cursor: pointer; font: bold 15px sans-serif;
	width: 30px; height: 30px; line-height: 1;
}
.backpack-craft-close:hover { background: #8a5a34; }
.backpack-craft-main { display: flex; flex-direction: column; gap: 12px; }
.backpack-craft-slots { display: flex; align-items: stretch; gap: 10px; }
.backpack-craft-slot {
	position: relative;
	flex: 1;
	min-height: 200px;
	box-sizing: border-box;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	border: 2px dashed #8a6a48;
	border-radius: 10px;
	background: rgba(45, 31, 23, .55);
	cursor: pointer;
	text-align: center;
}
.backpack-craft-slot:hover { border-color: #e1bd78; }
.backpack-craft-slot-hint { color: #c4ae8d; font: 13px sans-serif; }
.backpack-craft-slot-clear {
	position: absolute; top: 4px; right: 4px; z-index: 2;
	border: 1px solid #c29458; border-radius: 5px; color: #fff7e8;
	background: #6b4529; cursor: pointer; width: 22px; height: 22px; line-height: 1;
}
.backpack-craft-arrow {
	align-self: center;
	color: #f2c86f;
	font: bold 26px sans-serif;
	padding: 0 2px;
}
.backpack-craft-result {
	flex: 1;
	min-height: 200px;
	box-sizing: border-box;
	display: flex;
	align-items: center;
	justify-content: center;
	border: 2px dashed #7fa04f;
	border-radius: 10px;
	background: rgba(40, 60, 34, .4);
	text-align: center;
}
.backpack-craft-preview {
	width: 100%;
	box-sizing: border-box;
	padding: 6px 8px;
	text-align: center;
}
.backpack-craft-preview[data-rarity='5'] { color: #f0c760; }
.backpack-craft-preview[data-rarity='4'] { color: #d3b0f2; }
.backpack-craft-preview[data-rarity='3'] { color: #a8d4f5; }
.backpack-craft-name { font: bold 14px sans-serif; color: #f4e4c7; }
.backpack-craft-rarity { color: #f0c760; font: 12px sans-serif; letter-spacing: 1px; }
.backpack-craft-types { display: flex; justify-content: center; gap: 4px; flex-wrap: wrap; min-height: 16px; margin-top: 3px; }
.backpack-craft-types i {
	font-style: normal; font-size: 10px; padding: 1px 6px;
	border: 1px solid #9a7a52; border-radius: 9px; color: #e9c98f;
	background: rgba(60, 44, 30, .6);
}
.backpack-craft-norecipe { color: #e07a6a; font: 14px sans-serif; }
.backpack-craft-list {
	display: flex;
	flex-wrap: wrap;
	gap: 8px;
	max-height: 190px;
	overflow-y: auto;
	padding: 8px;
	border: 1px solid #7d6248;
	border-radius: 10px;
	background: rgba(45, 31, 23, .5);
}
.backpack-craft-list-empty { color: #c4ae8d; font: 13px sans-serif; width: 100%; text-align: center; padding: 10px 0; }
.backpack-craft-list-item {
	display: flex;
	align-items: center;
	gap: 6px;
	padding: 4px 8px;
	border: 1px solid #7d6248;
	border-radius: 8px;
	background: linear-gradient(145deg, #49382b, #2d2723);
	cursor: pointer;
	font: 13px sans-serif;
	color: #f4e4c7;
}
.backpack-craft-list-item:hover { border-color: #e1bd78; }
.backpack-craft-list-item img { width: 34px; height: 34px; object-fit: contain; image-rendering: pixelated; }
.backpack-craft-list-item[data-rarity='5'] { border-color: #d8ad4e; }
.backpack-craft-go {
	width: 100%;
	margin-top: 12px;
	padding: 10px 0;
	border: 1px solid #c29458;
	border-radius: 8px;
	color: #fff7e8;
	background: #6b4529;
	cursor: pointer;
	font: bold 15px sans-serif;
}
.backpack-craft-go:hover { background: #8a5a34; }
"""
with io.open('project/backpack.css', 'a', encoding='utf-8', newline='') as f:
    f.write(css)
print('css appended')

s2 = io.open('index.html', encoding='utf-8').read()
old = "href='project/backpack.css?v=4'"
assert s2.count(old) == 1, 'css link 匹配异常'
s2 = s2.replace(old, "href='project/backpack.css?v=5'")
io.open('index.html', 'w', encoding='utf-8', newline='').write(s2)
print('css version 5')

s3 = io.open('main.js', encoding='utf-8').read()
old3 = "this.version = '2.10.12';"
assert s3.count(old3) == 1, 'version 匹配异常'
s3 = s3.replace(old3, "this.version = '2.10.13';")
io.open('main.js', 'w', encoding='utf-8', newline='').write(s3)
print('version 2.10.13')
