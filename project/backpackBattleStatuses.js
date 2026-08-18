/**
 * 背包乱斗持续状态的唯一注册表。
 *
 * 该文件不依赖 core、DOM 或随机服务，可被主线程和预计伤害 Worker 共同加载。
 */
var backpackBattleStatusDefinitions_7d94f05e_2f6d_4b8e_9c23_5a317ccab120 = {
	"version": 1,
	"order": [
		"ice",
		"burn",
		"darkness",
		"exhaustion",
		"reflection",
		"block",
		"mark",
		"highSpirit",
		"excitation",
		"regeneration",
		"wolfSkin",
		"mp",
		"blackCharm"
	],
	"definitions": {
		"ice": {
			"id": "ice",
			"name": "冰洁",
			"kind": "debuff",
			"iconPath": "project/images/status/ice.svg",
			"iconSvg": "<defs><linearGradient id='bb-status-gradient-ice' x1='0' y1='0' x2='1' y2='1'><stop stop-color='#e9fbff'/><stop offset='1' stop-color='#45aee8'/></linearGradient></defs><path d='M32 6v52M10 19l44 26M10 45l44-26M32 6l-6 8m6-8 6 8M32 58l-6-8m6 8 6-8M10 19l10 1m-10-1 4 9M54 45l-10-1m10 1-4-9M10 45l10-1m-10 1 4-9M54 19l-10 1m10-1-4 9' fill='none' stroke='#17384f' stroke-width='8' stroke-linecap='round' stroke-linejoin='round'/><path d='M32 6v52M10 19l44 26M10 45l44-26M32 6l-6 8m6-8 6 8M32 58l-6-8m6 8 6-8M10 19l10 1m-10-1 4 9M54 45l-10-1m10 1-4-9M10 45l10-1m-10 1 4-9M54 19l-10 1m10-1-4 9' fill='none' stroke='url(#bb-status-gradient-ice)' stroke-width='4' stroke-linecap='round' stroke-linejoin='round'/>",
			"color": "#69c9ff",
			"stackable": true,
			"periodic": false,
			"periodTicks": 0,
			"priority": 10,
			"description": function (stacks) {
				return "全部攻击间隔 +" + (stacks / 100).toFixed(2) + " 回合";
			}
		},
		"burn": {
			"id": "burn",
			"name": "烧伤",
			"kind": "debuff",
			"iconPath": "project/images/status/burn.svg",
			"iconSvg": "<defs><linearGradient id='bb-status-gradient-burn' x1='0' y1='0' x2='0' y2='1'><stop stop-color='#fff17a'/><stop offset='.45' stop-color='#ff9b32'/><stop offset='1' stop-color='#e53935'/></linearGradient></defs><path d='M34 5c5 13-7 16-1 27 3-7 9-9 10-18 10 10 15 22 11 33-4 10-13 14-23 14S12 56 9 47C5 34 16 24 24 15c0 9 2 13 6 16 0-10 2-17 4-26Z' fill='#4c1a18' stroke='#2b1111' stroke-width='5' stroke-linejoin='round'/><path d='M34 7c5 13-7 16-1 27 3-7 9-9 10-18 10 10 14 21 10 31-4 9-12 12-22 12S14 55 11 46c-4-11 6-21 13-29 0 9 2 14 7 17-1-11 1-19 3-27Z' fill='url(#bb-status-gradient-burn)'/><path d='M31 54c-6-1-9-5-8-10 1-4 5-7 8-11 0 6 5 7 4 13 2-3 4-5 5-8 5 8 1 15-9 16Z' fill='#fff5aa'/>",
			"color": "#ff7043",
			"stackable": true,
			"periodic": true,
			"periodTicks": 100,
			"priority": 20,
			"description": function (stacks) {
				return "下次周期结算造成 " + (stacks * 10) + " 点直接伤害";
			}
		},
		"darkness": {
			"id": "darkness",
			"name": "黑暗",
			"kind": "debuff",
			"iconPath": "project/images/status/darkness.svg",
			"iconSvg": "<path d='M5 33C13 19 21 13 32 13s19 6 27 20c-8 12-16 18-27 18S13 45 5 33Z' fill='#271d3c' stroke='#140e22' stroke-width='5'/><path d='M9 33c7-10 14-15 23-15s16 5 23 15c-7 9-14 13-23 13S16 42 9 33Z' fill='#9d7ce4'/><circle cx='32' cy='32' r='11' fill='#17121f'/><circle cx='35' cy='28' r='3' fill='#e4dbff'/><path d='M12 10 53 54' stroke='#15101e' stroke-width='10' stroke-linecap='round'/><path d='M12 10 53 54' stroke='#5b477c' stroke-width='5' stroke-linecap='round'/>",
			"color": "#8d78c9",
			"stackable": true,
			"periodic": false,
			"periodTicks": 0,
			"priority": 30,
			"description": function (stacks) {
				return "命中率 -" + (stacks * 5) + "%";
			}
		},
		"exhaustion": {
			"id": "exhaustion",
			"name": "虚脱",
			"kind": "debuff",
			"iconPath": "project/images/status/exhaustion.svg",
			"iconSvg": "<defs><linearGradient id='bb-status-exhaustion-sky' x1='0' y1='0' x2='0' y2='1'><stop stop-color='#3f9df0'/><stop offset='.52' stop-color='#1671ca'/><stop offset='1' stop-color='#8bdcf3'/></linearGradient><linearGradient id='bb-status-exhaustion-arrow' x1='0' y1='0' x2='0' y2='1'><stop stop-color='#18e5ef'/><stop offset='.55' stop-color='#09aee8'/><stop offset='1' stop-color='#1674e8'/></linearGradient><clipPath id='bb-status-exhaustion-orb'><circle cx='27' cy='27' r='22'/></clipPath></defs><circle cx='27' cy='27' r='24' fill='#142536' opacity='.9'/><g clip-path='url(#bb-status-exhaustion-orb)'><circle cx='27' cy='27' r='22' fill='url(#bb-status-exhaustion-sky)'/><path d='M3 27c8-5 18-7 28-5 8 1 14 4 20 7v11H3Z' fill='#2a2a31' opacity='.92'/><circle cx='17' cy='29' r='7' fill='#ffc52f'/><circle cx='17' cy='29' r='3.5' fill='#ffe96a'/><path d='M3 38c10 2 20 1 30-1 7-1 13 0 18 3v13H3Z' fill='#69c9ef'/><path d='M7 15c8-8 24-12 37-3' fill='none' stroke='#c8ecff' stroke-width='5' stroke-linecap='round' opacity='.58'/><path d='M9 44c9 3 18 3 27 0' fill='none' stroke='#b7efff' stroke-width='3' stroke-linecap='round' opacity='.65'/></g><circle cx='27' cy='27' r='22' fill='none' stroke='#d7e5ec' stroke-width='4' opacity='.82'/><path d='M44 27h12v16h6L50 60 38 43h6Z' fill='#10283b' stroke='#10283b' stroke-width='7' stroke-linejoin='round'/><path d='M44 27h12v16h6L50 60 38 43h6Z' fill='url(#bb-status-exhaustion-arrow)' stroke='#38dff2' stroke-width='2' stroke-linejoin='round'/>",
			"color": "#8b95a5",
			"stackable": true,
			"periodic": false,
			"periodTicks": 0,
			"priority": 40,
			"description": function (stacks) {
				return "每次奥义获取 -" + (stacks * 2);
			}
		},
		"reflection": {
			"id": "reflection",
			"name": "反射",
			"kind": "buff",
			"iconPath": "project/images/status/reflection.svg",
			"iconSvg": "<defs><linearGradient id='bb-status-reflection-rim' x1='0' y1='0' x2='1' y2='1'><stop stop-color='#ffffff'/><stop offset='.3' stop-color='#a8bbc9'/><stop offset='.58' stop-color='#f2fbff'/><stop offset='1' stop-color='#687985'/></linearGradient><linearGradient id='bb-status-reflection-dark' x1='0' y1='0' x2='1' y2='1'><stop stop-color='#16283c'/><stop offset='1' stop-color='#07111f'/></linearGradient><linearGradient id='bb-status-reflection-blue' x1='0' y1='0' x2='1' y2='1'><stop stop-color='#43bdff'/><stop offset='.48' stop-color='#1689e9'/><stop offset='1' stop-color='#0755b5'/></linearGradient><linearGradient id='bb-status-reflection-arrow' x1='0' y1='0' x2='0' y2='1'><stop stop-color='#f5ff9a'/><stop offset='.48' stop-color='#e9f43f'/><stop offset='1' stop-color='#ffd51f'/></linearGradient><clipPath id='bb-status-reflection-disc'><circle cx='32' cy='32' r='25'/></clipPath></defs><circle cx='32' cy='32' r='29' fill='#253240' stroke='#111923' stroke-width='3'/><g clip-path='url(#bb-status-reflection-disc)'><circle cx='32' cy='32' r='25' fill='url(#bb-status-reflection-dark)'/><path d='M34 5h29v54H34c5-8 7-17 7-27S39 13 34 5Z' fill='url(#bb-status-reflection-blue)'/><path d='M11 16c10-10 27-13 40-5' fill='none' stroke='#d9f3ff' stroke-width='5' stroke-linecap='round' opacity='.5'/><path d='M42 8c9 8 14 20 13 31' fill='none' stroke='#78d8ff' stroke-width='5' stroke-linecap='round' opacity='.4'/></g><circle cx='32' cy='32' r='26' fill='none' stroke='url(#bb-status-reflection-rim)' stroke-width='4'/><path d='M14 13 50 31 32 43l7 3-26 10 8-22 6 6 15-9-31-14Z' fill='url(#bb-status-reflection-arrow)' stroke='#29320e' stroke-width='5' stroke-linecap='round' stroke-linejoin='round'/><path d='M14 13 50 31 32 43l7 3-26 10 8-22 6 6 15-9-31-14Z' fill='url(#bb-status-reflection-arrow)' stroke='#fbffb3' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/><path d='m47 28 5 3-5 4' fill='none' stroke='#fffbd1' stroke-width='2.5' stroke-linecap='round'/>",
			"color": "#8ccaff",
			"stackable": true,
			"periodic": false,
			"periodTicks": 0,
			"priority": 50,
			"description": function (stacks) {
				return "可反射接下来 " + stacks + " 层 Debuff";
			}
		},
		"block": {
			"id": "block",
			"name": "格挡",
			"kind": "buff",
			"iconPath": "project/images/status/block.svg",
			"iconSvg": "<defs><linearGradient id='bb-status-gradient-block' x1='0' y1='0' x2='1' y2='1'><stop stop-color='#d8f3ff'/><stop offset='1' stop-color='#4f9ed0'/></linearGradient></defs><path d='M32 5 54 13v16c0 14-8 24-22 30C18 53 10 43 10 29V13Z' fill='#17364a' stroke='#0d2636' stroke-width='5' stroke-linejoin='round'/><path d='M32 10 49 16v13c0 11-6 19-17 24-11-5-17-13-17-24V16Z' fill='url(#bb-status-gradient-block)'/><path d='M32 13v37M16 27h33' stroke='#edfaff' stroke-width='4' opacity='.7'/><path d='m50 8 2 6 6 2-6 2-2 6-2-6-6-2 6-2Z' fill='#fff6a1' stroke='#8d681c' stroke-width='2'/>",
			"color": "#70b7e6",
			"stackable": true,
			"periodic": false,
			"periodTicks": 0,
			"priority": 60,
			"description": function (stacks) {
				return "每层抵挡 3 点税前伤害，当前最多可挡 " + (stacks * 3) + " 点（不足 3 点的伤害也会消耗 1 层）";
			}
		},
		"mark": {
			"id": "mark",
			"name": "刻印",
			"kind": "buff",
			"iconPath": "project/images/status/mark.svg",
			"iconSvg": "<defs><linearGradient id='bb-status-gradient-mark' x1='0' y1='0' x2='0' y2='1'><stop stop-color='#ffe994'/><stop offset='1' stop-color='#c48724'/></linearGradient></defs><path d='m32 5 22 14v26L32 59 10 45V19Z' fill='#342615' stroke='#1c130b' stroke-width='5'/><path d='m32 11 16 11v20L32 53 16 42V22Z' fill='url(#bb-status-gradient-mark)'/><path d='m32 17 5 10 10 5-10 5-5 10-5-10-10-5 10-5Z' fill='#fff5c1' stroke='#704913' stroke-width='3'/><circle cx='32' cy='32' r='4' fill='#8b5e18'/>",
			"color": "#e3b55c",
			"stackable": true,
			"periodic": false,
			"periodTicks": 0,
			"exclusive": true,
			"priority": 70,
			"description": function (stacks) {
				return "当前资源：" + stacks + " 层";
			}
		},
		"highSpirit": {
			"id": "highSpirit",
			"name": "高扬",
			"kind": "buff",
			"iconPath": "project/images/status/highSpirit.svg",
			"iconSvg": "<defs><linearGradient id='bb-status-high-spirit-sky' x1='0' y1='0' x2='0' y2='1'><stop stop-color='#ffc44a'/><stop offset='.5' stop-color='#f39b12'/><stop offset='1' stop-color='#fff17a'/></linearGradient><linearGradient id='bb-status-high-spirit-arrow' x1='0' y1='0' x2='0' y2='1'><stop stop-color='#ffad62'/><stop offset='.5' stop-color='#ff6236'/><stop offset='1' stop-color='#ed2415'/></linearGradient><clipPath id='bb-status-high-spirit-orb'><circle cx='27' cy='27' r='22'/></clipPath></defs><circle cx='27' cy='27' r='24' fill='#30251c' opacity='.92'/><g clip-path='url(#bb-status-high-spirit-orb)'><circle cx='27' cy='27' r='22' fill='url(#bb-status-high-spirit-sky)'/><path d='M3 27c8-5 18-7 28-5 8 1 14 4 20 7v11H3Z' fill='#473025' opacity='.92'/><circle cx='17' cy='29' r='7' fill='#ffd23f'/><circle cx='17' cy='29' r='3.5' fill='#fff16b'/><path d='M3 38c10 2 20 1 30-1 7-1 13 0 18 3v13H3Z' fill='#fff06a'/><path d='M7 15c8-8 24-12 37-3' fill='none' stroke='#fff0c2' stroke-width='5' stroke-linecap='round' opacity='.58'/><path d='M9 44c9 3 18 3 27 0' fill='none' stroke='#fff9ae' stroke-width='3' stroke-linecap='round' opacity='.72'/></g><circle cx='27' cy='27' r='22' fill='none' stroke='#eadfcf' stroke-width='4' opacity='.82'/><path d='m50 25 12 17h-6v17H44V42h-6Z' fill='#351c19' stroke='#351c19' stroke-width='7' stroke-linejoin='round'/><path d='m50 25 12 17h-6v17H44V42h-6Z' fill='url(#bb-status-high-spirit-arrow)' stroke='#ff9862' stroke-width='2' stroke-linejoin='round'/>",
			"color": "#ffd15a",
			"stackable": true,
			"periodic": false,
			"periodTicks": 0,
			"priority": 80,
			"description": function (stacks) {
				return "每次奥义获取 +" + (stacks * 2);
			}
		},
		"excitation": {
			"id": "excitation",
			"name": "激奏",
			"kind": "buff",
			"iconPath": "project/images/status/excitation.svg",
			"iconSvg": "<defs><linearGradient id='bb-status-excitation-purple' gradientUnits='userSpaceOnUse' x1='0' y1='450' x2='0' y2='1750'><stop stop-color='#f4e6ff'/><stop offset='.42' stop-color='#c77dff'/><stop offset='1' stop-color='#7134ad'/></linearGradient><path id='bb-status-excitation-note' d='M567.126,1072.933c-13.184-3.282-26.498-4.992-39.828-5.399c-0.122-43.663-0.024-87.294,0.432-130.884 c36.041-30.121,70.91-63.345,100.909-99.118c38.02-44.755,65.764-96.993,83.557-152.537 c20.781-63.011,22.972-134.394-4.731-196.583c-3.184-7.37-6.93-14.731-10.741-21.889c-0.204-0.391-0.44-0.806-0.692-1.238 c-11.465-19.486-37.874-23.753-55.243-9.275c-2.125,1.775-3.518,2.932-3.518,2.932c-53.484,46.741-97.294,105.331-120.909,172.414 c-12.125,35.39-15.496,72.677-16.018,109.289c0.643,36.66,1.27,73.321,1.832,109.989c-44.909,29.087-90.722,57.621-132.725,91.284 c-89.403,69.062-168.554,159.352-158.375,280.473c6.751,92.514,57.865,180.818,143.539,220.572 c44.877,21.107,94.281,27.687,143.221,25.162c0.725-0.033,1.441-0.073,2.166-0.114c-0.366,43.557-0.594,86.757-0.603,128.816 c0.619,21.872-3.51,44.038-13.493,63.581c-18.167,36.302-50.821,57.099-91.284,59.388c-41.058,2.689-88.142-8.627-113.211-42.167 c2.59,0.411,5.229,0.713,7.922,0.865c34.901,1.974,64.487-19.285,66.081-47.483c1.595-28.198-25.427-52.309-60.306-54.631 c-32.01-2.131-60.217,16.034-66.081,47.483c-11.1,59.53,48.66,107.528,92.713,119.588c23.949,6.8,53.997,10.504,78.378,8.672 c61.09-4.536,107.391-44.339,125.021-102.31c5.236-17.125,7.239-35.129,6.865-52.987c0.016-43.981-0.244-88.035-0.643-132.13 c83.125-13.558,153.286-64.493,175.639-151.446c6.971-27.915,8.909-57.441,3.347-85.633 C696.504,1154.779,640.056,1090.416,567.126,1072.933z M566.141,634.809c22.581-34.103,54.298-62.588,91.496-79.485 c3.762,4.202,7.06,8.892,9.829,13.819c14.69,25.977,16.254,58.573,8.119,87.074c-13.933,52.499-45.569,100.405-87.652,134.337 c-7.337,6.034-14.902,11.791-22.556,17.434c-11.718,8.428-23.672,16.612-35.765,24.665 C531.606,766.076,527.388,691.68,566.141,634.809z M336.921,1256.527c2.63,34.111,19.324,69.436,48.72,88.369 c13.55,9.039,29.494,14.568,45.772,15.268c2.386,0.033,4.731,0.008,7.093-0.163c0.79-0.09,1.572-0.179,2.353-0.309 c-0.611-0.497-1.189-1.01-1.759-1.531c-3.835-3.412-7.614-7.109-11.05-10.847c-20.846-22.638-32.059-48.126-32.621-78.85 c-2.362-60.967,36.408-107.79,98.255-112.513c3.371-0.309,6.767-0.497,10.154-0.586c-0.22,24.959-0.537,49.917-1.01,74.868 c-0.871,65.642-1.816,133.954-2.492,201.941c-9.308,1.213-19.006,1.645-29.055,1.246 c-120.624-2.443-198.928-88.882-194.514-208.374c3.591-117.774,117.554-185.02,202.625-250.189 c8.037-6.026,16.107-12.223,24.152-18.574c0.375,37.287,0.603,74.567,0.635,111.846c-7.687,0.619-15.358,1.62-22.98,3.005 C390.283,1087.069,328.199,1163.834,336.921,1256.527z M616.685,1323.008c-11.661,50.87-42.564,86.398-85.723,101.87 c-0.961-89.273-2.345-178.692-3.127-268.063c13.127,2.003,25.838,6.091,37.336,12.817c27.833,15.985,48.305,45.023,55.389,76.171 c1.246,5.635,1.979,11.026,2.158,16.612C623.135,1282.838,621.351,1303.252,616.685,1323.008z'/></defs><g transform='translate(5 -16.3) scale(.058 .0435)'><use href='#bb-status-excitation-note' fill='#241332' stroke='#241332' stroke-width='6' vector-effect='non-scaling-stroke' stroke-linejoin='round'/><use href='#bb-status-excitation-note' fill='url(#bb-status-excitation-purple)' stroke='#e4c9ff' stroke-width='1.4' vector-effect='non-scaling-stroke' stroke-linejoin='round'/></g>",
			"color": "#bd7cff",
			"stackable": true,
			"periodic": false,
			"periodTicks": 0,
			"priority": 90,
			"description": function (stacks) {
				return "全部武器攻击间隔 -" + (stacks / 100).toFixed(2) + " 回合";
			}
		},
		"regeneration": {
			"id": "regeneration",
			"name": "再生",
			"kind": "buff",
			"iconPath": "project/images/status/regeneration.svg",
			"iconSvg": "<defs><linearGradient id='bb-status-regeneration-heart' x1='0' y1='0' x2='0' y2='1'><stop stop-color='#ff8b88'/><stop offset='.48' stop-color='#f04c55'/><stop offset='1' stop-color='#c92135'/></linearGradient></defs><path d='M32 58C28 53 8 41 8 24 8 14 15 8 24 8c4 0 7 2 8 5 1-3 4-5 8-5 9 0 16 6 16 16 0 17-20 29-24 34Z' fill='#40151d' stroke='#251015' stroke-width='5' stroke-linejoin='round'/><path d='M32 52C27 47 13 37 13 24c0-6 4-11 11-11 4 0 7 3 8 7 1-4 4-7 8-7 7 0 11 5 11 11 0 13-14 23-19 28Z' fill='url(#bb-status-regeneration-heart)'/><path d='M32 25v14M25 32h14' fill='none' stroke='#8d1f2d' stroke-width='7' stroke-linecap='round'/><path d='M32 25v14M25 32h14' fill='none' stroke='#fff' stroke-width='3.5' stroke-linecap='round'/>",
			"color": "#ff6b72",
			"stackable": true,
			"periodic": true,
			"periodTicks": 200,
			"priority": 100,
			"description": function (stacks) {
				return "每 2 秒触发一次：恢复 " + (stacks * 5) + " HP（每层回 5），随后变为 "
					+ Math.max(0, stacks - 2) + " 层";
			}
		},
		"wolfSkin": {
			"id": "wolfSkin",
			"name": "狼皮",
			"kind": "buff",
			"iconPath": "project/images/status/wolfSkin.svg",
			"iconSvg": "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><circle cx='32' cy='32' r='29' fill='#1a3a14' stroke='#0d2609' stroke-width='3'/><circle cx='32' cy='32' r='25' fill='#5fae3f'/><path d='M32 14c-9 0-15 6-15 15 0 6 4 11 9 14 3 1 5 1 6 1s3 0 6-1c5-3 9-8 9-14 0-9-6-15-15-15z' fill='#ffffff' stroke='#0d2609' stroke-width='2'/><ellipse cx='25' cy='30' rx='3' ry='3' fill='#f7c843'/><ellipse cx='39' cy='30' rx='3' ry='3' fill='#f7c843'/><circle cx='25' cy='30' r='1' fill='#000'/><circle cx='39' cy='30' r='1' fill='#000'/></svg>",
			"color": "#5fae3f",
			"stackable": false,
			"periodic": true,
			"periodTicks": 100,
			"exclusive": true,
			"priority": 110,
			"description": function (stacks) {
				return "剩余 " + stacks + " 秒。存在时剑/斧攻击次数+1、伤害+5；所有弱体效果对自身无效（和层数无关，层数仅控制持续时间）";
			}
		},
		"mp": {
			"id": "mp",
			"name": "MP",
			"kind": "buff",
			"iconPath": "project/images/status/mp.svg",
			"iconSvg": "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><circle cx='32' cy='32' r='29' fill='#0a0518' stroke='#000000' stroke-width='3'/><circle cx='32' cy='32' r='25' fill='#2a1a52'/><circle cx='32' cy='32' r='25' fill='none' stroke='#8a63c9' stroke-width='2' opacity='0.55'/><text x='32' y='37' text-anchor='middle' font-family='Verdana,Geneva,sans-serif' font-weight='900' font-size='21' fill='#ffffff' stroke='#1a0f30' stroke-width='2.5'>MP</text></svg>",
			"color": "#7a4dc7",
			"stackable": true,
			"periodic": false,
			"periodTicks": 0,
			"exclusive": true,
			"priority": 120,
			"description": function (stacks) {
				return "指示物 buff：当前 " + stacks + " 层（无任何战斗效果，仅作为状态指示符；专属 buff 不可被驱散或随机出）";
			}
		},
		"blackCharm": {
			"id": "blackCharm",
			"name": "黑之魅力",
			"kind": "buff",
			"iconPath": "project/images/status/blackCharm.svg",
			"iconSvg": "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><circle cx='32' cy='32' r='29' fill='#080510' stroke='#000000' stroke-width='3'/><circle cx='32' cy='32' r='25' fill='#15101f'/><path d='M16 22 Q20 14 26 18 Q28 22 24 24 Q18 26 16 22 Z' fill='#a66cde'/><path d='M48 22 Q44 14 38 18 Q36 22 40 24 Q46 26 48 22 Z' fill='#a66cde'/><path d='M32 19 C24 19 20 24 20 30 C20 36 24 40 32 44 C40 40 44 36 44 30 C44 24 40 19 32 19 Z' fill='#2d1858' stroke='#080510'/><path d='M32 21 C26 21 23 25 23 30 C23 34 26 38 32 41 C38 38 41 34 41 30 C41 25 38 21 32 21 Z' fill='#7a3fc4'/><path d='M22 46 Q28 42 32 46 Q28 50 24 50 Q22 49 22 46 Z' fill='#c98a3e'/><path d='M42 46 Q36 42 32 46 Q36 50 40 50 Q42 49 42 46 Z' fill='#c98a3e'/></svg>",
			"color": "#9a5cde",
			"stackable": true,
			"periodic": true,
			"periodTicks": 100,
			"exclusive": true,
			"priority": 130,
			"description": function (stacks) {
				return "每秒反射+1/再生+1/格挡+1，每秒消耗4层MP；MP 不足时解除该效果（专属 buff 不可被驱散或随机出）";
			}
		}
	}
};
