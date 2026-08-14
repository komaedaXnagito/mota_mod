# -*- coding: utf-8 -*-
import io
p = 'project/backpack.css'
css = """
/* ===== 背包乱斗武器商店 ===== */
.backpack-shop-root {
	position: fixed;
	inset: 0;
	z-index: 10060;
	display: flex;
	align-items: center;
	justify-content: center;
	background: rgba(8, 6, 5, .62);
	touch-action: none;
	user-select: none;
}
.backpack-shop-panel {
	width: min(860px, calc(100vw - 24px));
	box-sizing: border-box;
	padding: 16px 18px;
	border: 1px solid #c29458;
	border-radius: 14px;
	background: linear-gradient(150deg, #3a2c20, #221a16);
	color: #f7ead2;
	box-shadow: 0 18px 48px rgba(0, 0, 0, .7);
	font: 13px/1.4 'Microsoft YaHei', sans-serif;
}
.backpack-shop-header {
	display: flex;
	align-items: center;
	gap: 14px;
	margin-bottom: 12px;
}
.backpack-shop-title { flex: 1; font: bold 19px sans-serif; color: #ffe8bd; }
.backpack-shop-money { color: #f2c86f; font: 15px sans-serif; }
.backpack-shop-close {
	border: 1px solid #c29458;
	border-radius: 6px;
	color: #fff7e8;
	background: #6b4529;
	cursor: pointer;
	font: bold 15px sans-serif;
	width: 30px;
	height: 30px;
	line-height: 1;
}
.backpack-shop-close:hover { background: #8a5a34; }
.backpack-shop-grid {
	display: grid;
	grid-template-columns: repeat(5, 1fr);
	gap: 12px;
	margin-bottom: 14px;
}
.backpack-shop-card {
	position: relative;
	box-sizing: border-box;
	padding: 8px 8px 10px;
	border: 1px solid #7d6248;
	border-radius: 10px;
	background: linear-gradient(145deg, #49382b, #2d2723);
	text-align: center;
	cursor: default;
}
.backpack-shop-card[data-rarity='5'] { border-color: #d8ad4e; box-shadow: inset 0 0 8px rgba(255, 210, 98, .16); }
.backpack-shop-card[data-rarity='4'] { border-color: #b389e8; }
.backpack-shop-card[data-rarity='3'] { border-color: #6fb6e8; }
.backpack-shop-card[data-rarity='2'] { border-color: #7fd88f; }
.backpack-shop-card:hover { border-color: #e1bd78; box-shadow: 0 0 12px rgba(233, 193, 112, .35); }
.backpack-shop-image {
	width: 64px;
	height: 64px;
	object-fit: contain;
	margin: 2px auto 4px;
	display: block;
	image-rendering: pixelated;
	filter: drop-shadow(0 2px 3px rgba(0, 0, 0, .55));
}
.backpack-shop-name { font: bold 13px sans-serif; color: #f4e4c7; margin-bottom: 2px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
.backpack-shop-rarity { color: #f0c760; font: 11px sans-serif; letter-spacing: 1px; margin-bottom: 4px; }
.backpack-shop-types { display: flex; justify-content: center; gap: 4px; flex-wrap: wrap; min-height: 18px; margin-bottom: 6px; }
.backpack-shop-types i {
	font-style: normal;
	font-size: 10px;
	padding: 1px 6px;
	border: 1px solid #9a7a52;
	border-radius: 9px;
	color: #e9c98f;
	background: rgba(60, 44, 30, .6);
}
.backpack-shop-buy {
	width: 100%;
	border: 1px solid #c29458;
	border-radius: 6px;
	color: #fff7e8;
	background: #6b4529;
	cursor: pointer;
	font: bold 13px sans-serif;
	padding: 6px 0;
}
.backpack-shop-buy:hover { background: #8a5a34; }
.backpack-shop-footer { display: flex; align-items: center; gap: 14px; }
.backpack-shop-refresh {
	border: 1px solid #c29458;
	border-radius: 6px;
	color: #fff7e8;
	background: #6b4529;
	cursor: pointer;
	font: bold 14px sans-serif;
	padding: 8px 18px;
}
.backpack-shop-refresh:hover { background: #8a5a34; }
.backpack-shop-ratio { color: #c4ae8d; font: 12px sans-serif; }
"""
with io.open(p, 'a', encoding='utf-8', newline='') as f:
    f.write(css)
print('css appended')
