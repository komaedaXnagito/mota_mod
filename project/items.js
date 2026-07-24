var items_296f5d02_12fd_4166_a7c1_b5e830c9ee3a = 
{
	"yellowKey": {
		"cls": "tools",
		"name": "黄钥匙",
		"text": "可以打开一扇黄门",
		"hideInToolbox": true,
		"hideInReplay": true
	},
	"blueKey": {
		"cls": "tools",
		"name": "蓝钥匙",
		"text": "可以打开一扇蓝门",
		"hideInToolbox": true,
		"hideInReplay": true
	},
	"redKey": {
		"cls": "tools",
		"name": "红钥匙",
		"text": "可以打开一扇红门",
		"hideInToolbox": true,
		"hideInReplay": true
	},
	"redGem": {
		"cls": "items",
		"name": "红宝石",
		"text": "攻击+${core.values.redGem}",
		"itemEffect": "core.status.hero.atk += core.values.redGem * core.status.thisMap.ratio",
		"itemEffectTip": "，提升 ${core.values.redGem * core.status.thisMap.ratio} 点攻击",
		"useItemEffect": "core.status.hero.atk += core.values.redGem",
		"canUseItemEffect": "true"
	},
	"blueGem": {
		"cls": "items",
		"name": "蓝宝石",
		"text": "，防御+${core.values.blueGem}",
		"itemEffect": "core.status.hero.def += core.values.blueGem * core.status.thisMap.ratio",
		"itemEffectTip": "，提升 ${core.values.blueGem * core.status.thisMap.ratio} 点防御",
		"useItemEffect": "core.status.hero.def += core.values.blueGem",
		"canUseItemEffect": "true"
	},
	"greenGem": {
		"cls": "items",
		"name": "绿宝石",
		"text": "，护盾+${core.values.greenGem}",
		"itemEffect": "core.status.hero.mdef += core.values.greenGem * core.status.thisMap.ratio",
		"itemEffectTip": "，护盾+${core.values.greenGem * core.status.thisMap.ratio}",
		"useItemEffect": "core.status.hero.mdef += core.values.greenGem",
		"canUseItemEffect": "true"
	},
	"yellowGem": {
		"cls": "items",
		"name": "黄宝石",
		"text": "可以进行加点",
		"itemEffect": "core.status.hero.hp+=1000;core.status.hero.atk+=6;core.status.hero.def+=6;core.status.hero.mdef+=10;",
		"itemEffectTip": "，全属性提升",
		"useItemEvent": [
			{
				"type": "choices",
				"choices": [
					{
						"text": "攻击+1",
						"action": [
							{
								"type": "setValue",
								"name": "status:atk",
								"operator": "+=",
								"value": "1"
							}
						]
					},
					{
						"text": "防御+2",
						"action": [
							{
								"type": "setValue",
								"name": "status:def",
								"operator": "+=",
								"value": "2"
							}
						]
					},
					{
						"text": "生命+200",
						"action": [
							{
								"type": "setValue",
								"name": "status:hp",
								"operator": "+=",
								"value": "200"
							}
						]
					}
				]
			}
		],
		"canUseItemEffect": "true"
	},
	"redPotion": {
		"cls": "items",
		"name": "红血瓶",
		"text": "，生命+${core.values.redPotion}",
		"itemEffect": "core.status.hero.hp += core.values.redPotion * core.status.thisMap.ratio",
		"itemEffectTip": "，提升 ${core.values.redPotion * core.status.thisMap.ratio} 点生命",
		"useItemEffect": "core.status.hero.hp += core.values.redPotion",
		"canUseItemEffect": "true"
	},
	"bluePotion": {
		"cls": "items",
		"name": "蓝血瓶",
		"text": "，生命+${core.values.bluePotion}",
		"itemEffect": "core.status.hero.hp += core.values.bluePotion * core.status.thisMap.ratio",
		"itemEffectTip": "，提升 ${core.values.bluePotion * core.status.thisMap.ratio} 点生命",
		"useItemEffect": "core.status.hero.hp += core.values.bluePotion",
		"canUseItemEffect": "true"
	},
	"yellowPotion": {
		"cls": "items",
		"name": "黄血瓶",
		"text": "，生命+${core.values.yellowPotion}",
		"itemEffect": "core.status.hero.hp += core.values.yellowPotion * core.status.thisMap.ratio",
		"itemEffectTip": "，生命+${core.values.yellowPotion * core.status.thisMap.ratio}",
		"useItemEffect": "core.status.hero.hp += core.values.yellowPotion",
		"canUseItemEffect": "true"
	},
	"greenPotion": {
		"cls": "items",
		"name": "绿血瓶",
		"text": "，生命+${core.values.greenPotion}",
		"itemEffect": "core.status.hero.hp += core.values.greenPotion * core.status.thisMap.ratio",
		"itemEffectTip": "，生命+${core.values.greenPotion * core.status.thisMap.ratio}",
		"useItemEffect": "core.status.hero.hp += core.values.greenPotion",
		"canUseItemEffect": "true"
	},
	"sword0": {
		"cls": "items",
		"name": "破旧的剑",
		"text": "一把已经生锈的剑",
		"equip": {
			"type": 0,
			"animate": "sword",
			"value": {
				"atk": 0
			},
			"percentage": {}
		},
		"itemEffect": "core.status.hero.atk += 0",
		"itemEffectTip": "，攻击+0"
	},
	"sword1": {
		"cls": "items",
		"name": "铁剑",
		"text": "一把很普通的铁剑",
		"equip": {
			"type": 0,
			"animate": "sword",
			"value": {
				"atk": 10
			}
		},
		"itemEffect": "core.status.hero.atk += 10;\ncore.setFlag('nowWeapon', 'sword1');",
		"itemEffectTip": "，提升 10 点攻击"
	},
	"sword2": {
		"cls": "items",
		"name": "银剑",
		"text": "一把很普通的银剑",
		"equip": {
			"type": 0,
			"animate": "sword",
			"value": {
				"atk": 20
			},
			"percentage": {}
		},
		"itemEffect": "core.status.hero.atk += 20;\ncore.setFlag('nowWeapon', 'sword2');",
		"itemEffectTip": "，提升 20 点攻击"
	},
	"sword3": {
		"cls": "items",
		"name": "骑士剑",
		"text": "一把很普通的骑士剑",
		"equip": {
			"type": 0,
			"animate": "sword",
			"value": {
				"atk": 40
			}
		},
		"itemEffect": "core.status.hero.atk += 40;\ncore.setFlag('nowWeapon', 'sword3');",
		"itemEffectTip": "，提升 40 点攻击"
	},
	"sword4": {
		"cls": "items",
		"name": "圣剑",
		"text": "一把很普通的圣剑",
		"equip": {
			"type": 0,
			"animate": "sword",
			"value": {
				"atk": 50
			}
		},
		"itemEffect": "core.status.hero.atk += 50;\ncore.setFlag('nowWeapon', 'sword4');",
		"itemEffectTip": "，提升 50 点攻击"
	},
	"sword5": {
		"cls": "items",
		"name": "神圣剑",
		"text": "一把很普通的神圣剑",
		"equip": {
			"type": 0,
			"animate": "sword",
			"value": {
				"atk": 100
			}
		},
		"itemEffect": "core.status.hero.atk += 100;\ncore.setFlag('nowWeapon', 'sword5');",
		"itemEffectTip": "，提升 100 点攻击"
	},
	"shield0": {
		"cls": "items",
		"name": "破旧的盾",
		"text": "一个很破旧的铁盾",
		"equip": {
			"type": 1,
			"value": {
				"def": 0
			}
		},
		"itemEffect": "core.status.hero.def += 0",
		"itemEffectTip": "，防御+0"
	},
	"shield1": {
		"cls": "items",
		"name": "铁盾",
		"text": "一个很普通的铁盾",
		"equip": {
			"type": 1,
			"value": {
				"def": 10
			}
		},
		"itemEffect": "core.status.hero.def += 10;\ncore.setFlag('nowShield', 'shield1');",
		"itemEffectTip": "，提升 10 点防御"
	},
	"shield2": {
		"cls": "items",
		"name": "银盾",
		"text": "一个很普通的银盾",
		"equip": {
			"type": 1,
			"value": {
				"def": 20
			}
		},
		"itemEffect": "core.status.hero.def += 20;\ncore.setFlag('nowShield', 'shield2');",
		"itemEffectTip": "，提升 20 点防御"
	},
	"shield3": {
		"cls": "items",
		"name": "骑士盾",
		"text": "一个很普通的骑士盾",
		"equip": {
			"type": 1,
			"value": {
				"def": 40
			}
		},
		"itemEffect": "core.status.hero.def += 40;\ncore.setFlag('nowShield', 'shield3');",
		"itemEffectTip": "，提升 40 点防御"
	},
	"shield4": {
		"cls": "items",
		"name": "圣盾",
		"text": "一个很普通的圣盾",
		"equip": {
			"type": 1,
			"value": {
				"def": 50
			}
		},
		"itemEffect": "core.status.hero.def += 50;\ncore.setFlag('nowShield', 'shield4');",
		"itemEffectTip": "，提升 50 点防御"
	},
	"shield5": {
		"cls": "items",
		"name": "神圣盾",
		"text": "一个很普通的神圣盾",
		"equip": {
			"type": 1,
			"value": {
				"def": 100,
				"mdef": 100
			}
		},
		"itemEffect": "core.status.hero.def += 100;\ncore.setFlag('nowShield', 'shield5');\ncore.setFlag('shield5', 1);",
		"itemEffectTip": "，提升 100 点防御，并免疫魔法伤害"
	},
	"superPotion": {
		"cls": "tools",
		"name": "圣水",
		"itemEffect": "core.status.hero.hp *= 2",
		"itemEffectTip": "增加10倍攻击+5倍防御的生命",
		"useItemEffect": "var hp = Math.round(10 * core.status.hero.atk + 5 * core.status.hero.def)\ncore.status.hero.hp += hp;\ncore.insertAction([\n\t{ \"type\": \"playSound\", \"name\": \"item.mp3\" },\n\t{ \"type\": \"tip\", \"text\": \"使用圣水，增加 \" + hp + \" 生命\" },\n]);",
		"canUseItemEffect": "true",
		"text": "增加10倍攻击+5倍防御的生命",
		"hideInToolbox": true,
		"hideInReplay": true
	},
	"book": {
		"cls": "constants",
		"name": "怪物手册",
		"text": "可以查看当前楼层各怪物属性",
		"hideInToolbox": true,
		"useItemEffect": "core.ui.drawBook(0)",
		"canUseItemEffect": "true",
		"hideInReplay": true
	},
	"fly": {
		"cls": "constants",
		"name": "楼层传送器",
		"text": "可以自由往来去过的楼层",
		"hideInReplay": true,
		"hideInToolbox": true,
		"useItemEffect": "core.ui.drawFly(core.floorIds.indexOf(core.status.floorId));\n//core.ui.drawFly(core.floorIds.indexOf(core.status.floorId));",
		"canUseItemEffect": "(function () {\n\treturn core.status.maps[core.status.floorId].canFlyFrom;\n})();"
	},
	"coin": {
		"cls": "constants",
		"name": "幸运金币",
		"text": "持有时打败怪物可得双倍金币",
		"hideInToolbox": true,
		"hideInReplay": true
	},
	"snow": {
		"cls": "constants",
		"name": "冰冻徽章",
		"text": "可以将面前的熔岩变成平地",
		"useItemEffect": "(function () {\n\tvar success = false;\n\n\tvar snowFourDirections = true; // 是否多方向雪花；如果是将其改成true\n\tif (snowFourDirections) {\n\t\t// 多方向雪花\n\t\tfor (var direction in core.utils.scan) { // 多方向雪花默认四方向，如需改为八方向请将这两个scan改为scan2\n\t\t\tvar delta = core.utils.scan[direction];\n\t\t\tvar nx = core.getHeroLoc('x') + delta.x,\n\t\t\t\tny = core.getHeroLoc('y') + delta.y;\n\t\t\tif (core.getBlockId(nx, ny) == 'lava') {\n\t\t\t\tcore.removeBlock(nx, ny);\n\t\t\t\tsuccess = true;\n\t\t\t}\n\t\t}\n\t} else {\n\t\tif (core.getBlockId(core.nextX(), core.nextY()) == 'lava') {\n\t\t\tcore.removeBlock(core.nextX(), core.nextY());\n\t\t\tsuccess = true;\n\t\t}\n\t}\n\n\tif (success) {\n\t\tcore.playSound('打开界面');\n\t\tcore.drawTip(core.material.items[itemId].name + '使用成功', itemId);\n\t} else {\n\t\tcore.playSound('操作失败');\n\t\tcore.drawTip(\"当前无法使用\" + core.material.items[itemId].name, itemId);\n\t\tcore.addItem(itemId, 1);\n\t\treturn;\n\t}\n})();",
		"canUseItemEffect": "true",
		"hideInToolbox": true,
		"hideInReplay": true
	},
	"cross": {
		"cls": "constants",
		"name": "十字架",
		"text": "持有后无视怪物的无敌属性",
		"hideInToolbox": true,
		"hideInReplay": true
	},
	"knife": {
		"cls": "constants",
		"name": "屠龙匕首",
		"text": "对魔龙攻击加倍",
		"hideInToolbox": true,
		"hideInReplay": true
	},
	"amulet": {
		"cls": "constants",
		"name": "护符",
		"text": "持有时无视负面地形",
		"hideInToolbox": true,
		"hideInReplay": true
	},
	"bigKey": {
		"cls": "tools",
		"name": "大黄门钥匙",
		"text": "可以开启当前层所有黄门",
		"itemEffect": "core.addItem('yellowKey', 1);\ncore.addItem('blueKey', 1);\ncore.addItem('redKey', 1);",
		"itemEffectTip": "，全钥匙+1",
		"useItemEffect": "(function () {\n\tvar actions = core.searchBlock(\"yellowDoor\").map(function (block) {\n\t\treturn { \"type\": \"openDoor\", \"loc\": [block.x, block.y], \"async\": true };\n\t});\n\tactions.push({ \"type\": \"waitAsync\" });\n\tactions.push({ \"type\": \"tip\", \"text\": core.material.items[itemId].name + \"使用成功\" });\n\tcore.insertAction(actions);\n})();",
		"canUseItemEffect": "(function () {\n\treturn core.searchBlock('yellowDoor').length > 0;\n})();",
		"hideInToolbox": true,
		"hideInReplay": true
	},
	"greenKey": {
		"cls": "tools",
		"name": "绿钥匙",
		"text": "可以打开一扇绿门",
		"hideInToolbox": true,
		"hideInReplay": true
	},
	"steelKey": {
		"cls": "tools",
		"name": "铁门钥匙",
		"text": "可以打开一扇铁门",
		"hideInToolbox": true,
		"hideInReplay": true
	},
	"pickaxe": {
		"cls": "tools",
		"name": "破墙镐",
		"text": "可以破坏勇士面前的墙壁",
		"useItemEffect": "(function () {\n\tvar canBreak = function (x, y) {\n\t\tvar block = core.getBlock(x, y);\n\t\tif (block == null || block.disable) return false;\n\t\treturn block.event.canBreak;\n\t};\n\n\tvar success = false;\n\tvar pickaxeFourDirections = true; // 是否多方向破；如果是将其改成true\n\tif (pickaxeFourDirections) {\n\t\t// 多方向破\n\t\tfor (var direction in core.utils.scan) { // 多方向破默认四方向，如需改成八方向请将这两个scan改为scan2\n\t\t\tvar delta = core.utils.scan[direction];\n\t\t\tvar nx = core.getHeroLoc('x') + delta.x,\n\t\t\t\tny = core.getHeroLoc('y') + delta.y;\n\t\t\ttrue\n\t\t\tif (canBreak(nx, ny)) {\n\t\t\t\tcore.removeBlock(nx, ny);\n\t\t\t\tsuccess = true;\n\t\t\t}\n\t\t}\n\t} else {\n\t\t// 仅破当前\n\t\tif (canBreak(core.nextX(), core.nextY())) {\n\t\t\tcore.removeBlock(core.nextX(), core.nextY());\n\t\t\tsuccess = true;\n\t\t}\n\t}\n\n\tif (success) {\n\t\tcore.playSound('破墙镐');\n\t\tcore.drawTip(core.material.items[itemId].name + '使用成功', itemId);\n\t} else {\n\t\t// 无法使用\n\t\tcore.playSound('操作失败');\n\t\tcore.drawTip(\"当前无法使用\" + core.material.items[itemId].name, itemId);\n\t\tcore.addItem(itemId, 1);\n\t\treturn;\n\t}\n})();",
		"canUseItemEffect": "true",
		"hideInToolbox": true,
		"hideInReplay": true
	},
	"icePickaxe": {
		"cls": "tools",
		"name": "破冰镐",
		"text": "可以破坏勇士面前的一堵冰墙",
		"useItemEffect": "(function () {\n\tcore.drawTip(core.material.items[itemId].name + '使用成功', itemId);\n\tcore.insertAction({ \"type\": \"openDoor\", \"loc\": [\"core.nextX()\", \"core.nextY()\"] });\n})();",
		"canUseItemEffect": "(function () {\n\treturn core.getBlockId(core.nextX(), core.nextY()) == 'ice';\n})();",
		"hideInToolbox": true,
		"hideInReplay": true
	},
	"bomb": {
		"cls": "tools",
		"name": "炸弹",
		"text": "可以炸掉勇士面前的怪物",
		"useItemEffect": "(function () {\n\tvar bombList = []; // 炸掉的怪物坐标列表\n\tvar todo = []; // 炸弹后事件\n\tvar money = 0,\n\t\texp = 0; // 炸弹获得的金币和经验\n\n\tvar canBomb = function (x, y) {\n\t\tvar block = core.getBlock(x, y);\n\t\tif (block == null || block.disable || block.event.cls.indexOf('enemy') != 0) return false;\n\t\tvar enemy = core.material.enemys[block.event.id];\n\t\treturn enemy && !enemy.notBomb;\n\t};\n\n\tvar bomb = function (x, y) {\n\t\tif (!canBomb(x, y)) return;\n\t\tbombList.push([x, y]);\n\t\tvar id = core.getBlockId(x, y),\n\t\t\tenemy = core.material.enemys[id];\n\t\tmoney += core.getEnemyValue(enemy, 'money', x, y) || 0;\n\t\texp += core.getEnemyValue(enemy, 'exp', x, y) || 0;\n\t\tcore.push(todo, core.floors[core.status.floorId].afterBattle[x + \",\" + y]);\n\t\tcore.push(todo, enemy.afterBattle);\n\t\tcore.removeBlock(x, y);\n\t}\n\n\t// 如果要多方向可炸，把这里的false改成true\n\tif (true) {\n\t\tvar scan = core.utils.scan; // 多方向炸时默认四方向，如果要改成八方向炸可以改成 core.utils.scan2\n\t\tfor (var direction in scan) {\n\t\t\tvar delta = scan[direction];\n\t\t\tbomb(core.getHeroLoc('x') + delta.x, core.getHeroLoc('y') + delta.y);\n\t\t}\n\t} else {\n\t\t// 仅炸当前\n\t\tbomb(core.nextX(), core.nextY());\n\t}\n\n\tif (bombList.length == 0) {\n\t\tcore.playSound('操作失败');\n\t\tcore.drawTip('当前无法使用' + core.material.items[itemId].name, itemId);\n\t\tcore.addItem(itemId, 1);\n\t\treturn;\n\t}\n\n\tcore.playSound('炸弹');\n\tcore.drawTip(core.material.items[itemId].name + '使用成功', itemId);\n\n\t// 取消这里的注释可以炸弹后获得金币和经验\n\t//core.status.hero.money += money;\n\t//core.status.hero.exp += exp;\n\n\t// 取消这里的注释可以炸弹引发战后事件\n\tif (todo.length > 0) core.insertAction(todo);\n\n})();",
		"canUseItemEffect": "true",
		"hideInToolbox": true,
		"hideInReplay": true
	},
	"centerFly": {
		"cls": "tools",
		"name": "对称飞行器",
		"text": "可以飞向当前楼层中心对称的位置",
		"useItemEffect": "core.playSound('centerFly.mp3');\ncore.clearMap('hero');\ncore.setHeroLoc('x', core.bigmap.width - 1 - core.getHeroLoc('x'));\ncore.setHeroLoc('y', core.bigmap.height - 1 - core.getHeroLoc('y'));\ncore.drawHero();\ncore.setFlag('talking', 0);\ncore.drawTip(core.material.items[itemId].name + '使用成功');",
		"canUseItemEffect": "(function () {\n\tvar toX = core.bigmap.width - 1 - core.getHeroLoc('x'),\n\t\ttoY = core.bigmap.height - 1 - core.getHeroLoc('y');\n\tvar id = core.getBlockId(toX, toY);\n\treturn id == null;\n})();",
		"hideInToolbox": true,
		"hideInReplay": true,
		"useItemEvent": null
	},
	"upFly": {
		"cls": "tools",
		"name": "上楼器",
		"text": "可以飞往楼上的相同位置",
		"useItemEffect": "(function () {\n\tvar floorId = core.floorIds[core.floorIds.indexOf(core.status.floorId) + 1];\n\tif (core.status.event.id == 'action') {\n\t\tcore.insertAction([\n\t\t\t{ \"type\": \"changeFloor\", \"loc\": [core.getHeroLoc('x'), core.getHeroLoc('y')], \"floorId\": floorId },\n\t\t\t{ \"type\": \"tip\", \"text\": core.material.items[itemId].name + '使用成功' }\n\t\t]);\n\t} else {\n\t\tcore.changeFloor(floorId, null, core.status.hero.loc, null, function () {\n\t\t\tcore.drawTip(core.material.items[itemId].name + '使用成功');\n\t\t\tcore.replay();\n\t\t});\n\t}\n})();",
		"canUseItemEffect": "(function () {\n\tvar floorId = core.status.floorId,\n\t\tindex = core.floorIds.indexOf(floorId);\n\tif (floorId == 'MT49') return false;\n\tif (index < core.floorIds.length - 1) {\n\t\tvar toId = core.floorIds[index + 1],\n\t\t\ttoX = core.getHeroLoc('x'),\n\t\t\ttoY = core.getHeroLoc('y');\n\t\tvar mw = core.floors[toId].width,\n\t\t\tmh = core.floors[toId].height;\n\t\tif (toX >= 0 && toX < mw && toY >= 0 && toY < mh && core.getBlock(toX, toY, toId) == null) {\n\t\t\treturn true;\n\t\t}\n\t}\n\treturn false;\n})();",
		"hideInToolbox": true,
		"hideInReplay": true
	},
	"downFly": {
		"cls": "tools",
		"name": "下楼器",
		"text": "可以飞往楼下的相同位置",
		"useItemEffect": "(function () {\n\tvar floorId = core.floorIds[core.floorIds.indexOf(core.status.floorId) - 1];\n\tif (core.status.event.id == 'action') {\n\t\tcore.insertAction([\n\t\t\t{ \"type\": \"changeFloor\", \"loc\": [core.getHeroLoc('x'), core.getHeroLoc('y')], \"floorId\": floorId },\n\t\t\t{ \"type\": \"tip\", \"text\": core.material.items[itemId].name + '使用成功' }\n\t\t]);\n\t} else {\n\t\tcore.changeFloor(floorId, null, core.status.hero.loc, null, function () {\n\t\t\tcore.drawTip(core.material.items[itemId].name + '使用成功');\n\t\t\tcore.replay();\n\t\t});\n\t}\n})();",
		"canUseItemEffect": "(function () {\n\tvar floorId = core.status.floorId,\n\t\tindex = core.floorIds.indexOf(floorId);\n\tif (floorId == \"MT50\") return false;\n\tif (index > 0) {\n\t\tvar toId = core.floorIds[index - 1],\n\t\t\ttoX = core.getHeroLoc('x'),\n\t\t\ttoY = core.getHeroLoc('y');\n\t\tvar mw = core.floors[toId].width,\n\t\t\tmh = core.floors[toId].height;\n\t\tif (toX >= 0 && toX < mw && toY >= 0 && toY < mh && core.getBlock(toX, toY, toId) == null) {\n\t\t\treturn true;\n\t\t}\n\t}\n\treturn false;\n})();",
		"hideInToolbox": true,
		"hideInReplay": true
	},
	"earthquake": {
		"cls": "tools",
		"name": "地震卷轴",
		"text": "可以破坏当前层的所有墙壁",
		"useItemEffect": "(function () {\n\tcore.autosave();\n\tvar indexes = [];\n\tfor (var index in core.status.thisMap.blocks) {\n\t\tvar block = core.status.thisMap.blocks[index];\n\t\tif (!block.disable && block.event.canBreak) {\n\t\t\tindexes.push(index);\n\t\t}\n\t}\n\tcore.removeBlockByIndexes(indexes);\n\tcore.drawMap();\n\tcore.playSound('door.mp3');\n\tcore.drawTip(core.material.items[itemId].name + '使用成功');\n})();",
		"canUseItemEffect": "(function () {\n\treturn core.status.thisMap.blocks.filter(function (block) {\n\t\treturn !block.disable && block.event.canBreak;\n\t}).length > 0;\n})();",
		"hideInToolbox": true,
		"hideInReplay": true
	},
	"poisonWine": {
		"cls": "tools",
		"name": "解毒药水",
		"text": "可以解除中毒状态",
		"useItemEffect": "core.triggerDebuff('remove', 'poison');",
		"canUseItemEffect": "core.hasFlag('poison');"
	},
	"weakWine": {
		"cls": "tools",
		"name": "解衰药水",
		"text": "可以解除衰弱状态",
		"useItemEffect": "core.triggerDebuff('remove', 'weak');",
		"canUseItemEffect": "core.hasFlag('weak');"
	},
	"curseWine": {
		"cls": "tools",
		"name": "解咒药水",
		"text": "可以解除诅咒状态",
		"useItemEffect": "core.triggerDebuff('remove', 'curse');",
		"canUseItemEffect": "core.hasFlag('curse');"
	},
	"superWine": {
		"cls": "tools",
		"name": "万能药水",
		"text": "可以解除所有不良状态",
		"useItemEffect": "core.triggerDebuff('remove', ['poison', 'weak', 'curse']);",
		"canUseItemEffect": "(function() {\n\treturn core.hasFlag('poison') || core.hasFlag('weak') || core.hasFlag('curse');\n})();"
	},
	"hammer": {
		"cls": "tools",
		"name": "圣锤",
		"text": "该道具尚未被定义"
	},
	"lifeWand": {
		"cls": "tools",
		"name": "生命魔杖",
		"text": "可以恢复100点生命值",
		"useItemEvent": [
			{
				"type": "comment",
				"text": "先恢复一个魔杖（因为使用道具必须消耗一个）"
			},
			{
				"type": "function",
				"function": "function(){\ncore.addItem('lifeWand', 1);\n}"
			},
			{
				"type": "playSound",
				"name": "打开界面"
			},
			{
				"type": "input",
				"text": "请输入生命魔杖使用次数：(0-${item:lifeWand})"
			},
			{
				"type": "comment",
				"text": "【接受用户输入】弹窗输入的结果将会保存在“flag:input”中\n如果需要更多帮助，请查阅帮助文档"
			},
			{
				"type": "if",
				"condition": "flag:input<=item:lifeWand",
				"true": [
					{
						"type": "setValue",
						"name": "item:lifeWand",
						"operator": "-=",
						"value": "flag:input"
					},
					{
						"type": "setValue",
						"name": "status:hp",
						"operator": "+=",
						"value": "flag:input*100"
					},
					{
						"type": "playSound",
						"name": "回血"
					},
					"成功使用${flag:input}次生命魔杖，恢复${flag:input*100}点生命。"
				],
				"false": [
					{
						"type": "playSound",
						"name": "操作失败"
					},
					"输入不合法！"
				]
			}
		],
		"canUseItemEffect": "true"
	},
	"jumpShoes": {
		"cls": "tools",
		"name": "跳跃靴",
		"text": "能跳跃到前方两格处",
		"useItemEffect": "core.playSound(\"跳跃\");\ncore.insertAction({ \"type\": \"jumpHero\", \"loc\": [core.nextX(2), core.nextY(2)] });",
		"canUseItemEffect": "(function () {\n\tvar nx = core.nextX(2),\n\t\tny = core.nextY(2);\n\treturn nx >= 0 && nx < core.bigmap.width && ny >= 0 && ny < core.bigmap.height && core.getBlockId(nx, ny) == null;\n})();"
	},
	"skill1": {
		"cls": "constants",
		"name": "技能：二倍斩",
		"text": "可以打开或关闭主动技能二倍斩",
		"hideInReplay": true,
		"useItemEffect": "(function () {\n\tvar skillValue = 1; // 技能的flag:skill值，可用于当前开启技能的判定；对于新技能可以依次改成2，3等等\n\tvar skillNeed = 5; // 技能的需求\n\tvar skillName = '二倍斩'; // 技能的名称\n\n\tif (core.getFlag('skill', 0) != skillValue) { // 判断当前是否已经开了技能\n\t\tif (core.getStatus('mana') >= skillNeed) { // 这里要写当前能否开技能的条件判断，比如魔力值至少要多少\n\t\t\tcore.playSound('打开界面');\n\t\t\tcore.setFlag('skill', skillValue); // 开技能1\n\t\t\tcore.setFlag('skillName', skillName); // 设置技能名\n\t\t} else {\n\t\t\tcore.playSound('操作失败');\n\t\t\tcore.drawTip('魔力不足，无法开启技能');\n\t\t}\n\t} else { // 关闭技能\n\t\tcore.setFlag('skill', 0); // 关闭技能状态\n\t\tcore.setFlag('skillName', '无');\n\t}\n})();",
		"canUseItemEffect": "true"
	},
	"wand": {
		"cls": "constants",
		"name": "记事本",
		"text": "可以记录并查看老人和商人说的话",
		"itemEffect": null,
		"canUseItemEffect": "true",
		"hideInToolbox": true,
		"hideInReplay": true,
		"useItemEffect": "core.insertCommonEvent(\"记事本\");"
	},
	"pack": {
		"cls": "items",
		"name": "钱袋",
		"itemEffect": "core.status.hero.money += 500",
		"itemEffectTip": "，金币+500"
	},
	"I300": {
		"cls": "constants",
		"name": "帮助",
		"text": "使用后可以查看帮助",
		"itemEffect": "core.insertCommonEvent(\"帮助\");",
		"canUseItemEffect": "true",
		"hideInToolbox": true,
		"hideInReplay": true
	},
	"itembag": {
		"cls": "items",
		"name": "新物品",
		"canUseItemEffect": "true"
	},
	"itemequip": {
		"cls": "items",
		"name": "新物品",
		"canUseItemEffect": "true"
	},
	"I359": {
		"cls": "items",
		"name": "新物品",
		"canUseItemEffect": "true"
	},
	"I360": {
		"cls": "items",
		"name": "新物品",
		"canUseItemEffect": "true"
	},
	"I361": {
		"cls": "items",
		"name": "新物品",
		"canUseItemEffect": "true"
	},
	"I362": {
		"cls": "items",
		"name": "新物品",
		"canUseItemEffect": "true"
	},
	"I363": {
		"cls": "items",
		"name": "新物品",
		"canUseItemEffect": "true"
	},
	"I383": {
		"cls": "items",
		"name": "新物品",
		"canUseItemEffect": "true"
	},
	"I384": {
		"cls": "items",
		"name": "火龙斧",
		"text": "拾取后直接进入背包，占用上宽下窄的 2×4 格。",
		"backpackWeapon": {
			"id": "fireDragonAxe",
			"name": "火龙斧",
			"shape": [
				[
					1,
					1
				],
				[
					1,
					1
				],
				[
					1,
					0
				],
				[
					1,
					0
				]
			],
			"image": "project/images/fireDragonAxe.png",
			"imageCrop": [
				3,
				15,
				149,
				285,
				312,
				312
			]
		},
		"itemEffectTip": "，已放入背包"
	},
	"I385": {
		"cls": "constants",
		"name": "新物品",
		"canUseItemEffect": "true",
		"useItemEffect": "core.plugin.boxbar()",
		"text": ""
	},
	"I386": {
		"cls": "items",
		"name": "暗龙枪",
		"text": "拾取后直接进入背包，占用展开式的 3×5 格。",
		"backpackWeapon": {
			"id": "darkDragonSpear",
			"name": "暗龙枪",
			"shape": [
				[
					0,
					1,
					0
				],
				[
					1,
					1,
					1
				],
				[
					0,
					1,
					0
				],
				[
					0,
					1,
					0
				],
				[
					0,
					1,
					0
				]
			],
			"image": "project/images/darkDragonSpear.png",
			"imageCrop": [
				7,
				7,
				139,
				299,
				312,
				312
			]
		},
		"itemEffectTip": "，已放入背包"
	},
	"I387": {
		"cls": "items",
		"name": "高达拳",
		"text": "拾取后直接进入背包，占用紧凑的 2×3 格。",
		"backpackWeapon": {
			"id": "gundamFist",
			"name": "高达拳",
			"shape": [
				[
					1,
					1
				],
				[
					1,
					1
				],
				[
					1,
					0
				]
			],
			"image": "project/images/gundamFist.png",
			"imageCrop": [
				3,
				14,
				70,
				135,
				312,
				312
			]
		},
		"itemEffectTip": "，已放入背包"
	},
	"I372": {
		"cls": "items",
		"name": "薛定谔",
		"text": "拾取后直接进入背包，占用 1×3 格。",
		"backpackWeapon": {
			"id": "xde",
			"name": "薛定谔",
			"shape": [
				[
					1
				],
				[
					1
				],
				[
					1
				]
			],
			"image": "project/images/xde.png"
		},
		"itemEffectTip": "，已放入背包",
		"shape": "[\n\t[1, 0],\n\t[1, 1],\n\t[1, 1]\n]"
	},
	"I388": {
		"cls": "items",
		"name": "暗斧",
		"text": "拾取后直接进入背包，占用斧头轮廓的 2×4 格。",
		"backpackWeapon": {
			"id": "darkAxe",
			"name": "暗斧",
			"shape": [
				[
					1,
					1
				],
				[
					0,
					1
				],
				[
					0,
					1
				],
				[
					0,
					1
				]
			],
			"image": "project/images/darkAxe.png",
			"imageCrop": [
				24,
				8,
				133,
				286,
				312,
				312
			]
		},
		"itemEffectTip": "，已放入背包"
	},
	"I389": {
		"cls": "items",
		"name": "暗书",
		"text": "拾取后直接进入背包，占用 2×2 格。",
		"backpackWeapon": {
			"id": "darkBook",
			"name": "暗书",
			"shape": [
				[
					1,
					1
				],
				[
					1,
					1
				]
			],
			"image": "project/images/darkBook.png",
			"imageCrop": [
				8,
				3,
				59,
				71,
				312,
				312
			]
		},
		"itemEffectTip": "，已放入背包"
	},
	"I390": {
		"cls": "items",
		"name": "大掉宝杖",
		"text": "拾取后直接进入背包，占用 1×4 格。",
		"backpackWeapon": {
			"id": "largeDropStaff",
			"name": "大掉宝杖",
			"shape": [
				[
					1
				],
				[
					1
				],
				[
					1
				],
				[
					1
				]
			],
			"image": "project/images/largeDropStaff.png",
			"imageCrop": [
				2,
				25,
				72,
				272,
				312,
				312
			]
		},
		"itemEffectTip": "，已放入背包"
	},
	"I391": {
		"cls": "items",
		"name": "大红",
		"text": "拾取后直接进入背包，占用 1×1 格。",
		"backpackWeapon": {
			"id": "bigRedPotion",
			"name": "大红",
			"shape": [
				[
					1
				]
			],
			"image": "project/images/bigRedPotion.png",
			"imageCrop": [
				3,
				4,
				67,
				68,
				312,
				312
			]
		},
		"itemEffectTip": "，已放入背包"
	},
	"I393": {
		"cls": "items",
		"name": "电鳗",
		"text": "拾取后直接进入背包，占用弯曲轮廓的 2×5 格。",
		"backpackWeapon": {
			"id": "electricEel",
			"name": "电鳗",
			"shape": [
				[
					1,
					1
				],
				[
					0,
					1
				],
				[
					0,
					1
				],
				[
					0,
					1
				],
				[
					0,
					1
				]
			],
			"image": "project/images/electricEel.png",
			"imageCrop": [
				8,
				4,
				125,
				301,
				312,
				312
			]
		},
		"itemEffectTip": "，已放入背包"
	},
	"I394": {
		"cls": "items",
		"name": "掉宝杖",
		"text": "拾取后直接进入背包，占用 1×4 格。",
		"backpackWeapon": {
			"id": "dropStaff",
			"name": "掉宝杖",
			"shape": [
				[
					1
				],
				[
					1
				],
				[
					1
				],
				[
					1
				]
			],
			"image": "project/images/dropStaff.png",
			"imageCrop": [
				2,
				25,
				72,
				272,
				312,
				312
			]
		},
		"itemEffectTip": "，已放入背包"
	},
	"I395": {
		"cls": "items",
		"name": "方天",
		"text": "拾取后直接进入背包，占用 2×2 格。",
		"backpackWeapon": {
			"id": "fangTian",
			"name": "方天",
			"shape": [
				[
					1,
					1
				],
				[
					1,
					1
				]
			],
			"image": "project/images/fangTian.png",
			"imageCrop": [
				2,
				23,
				80,
				115,
				312,
				312
			]
		},
		"itemEffectTip": "，已放入背包"
	},
	"I396": {
		"cls": "items",
		"name": "风短",
		"text": "拾取后直接进入背包，占用 1×2 格。",
		"backpackWeapon": {
			"id": "windDagger",
			"name": "风短",
			"shape": [
				[
					1
				],
				[
					1
				]
			],
			"image": "project/images/windDagger.png",
			"imageCrop": [
				4,
				6,
				64,
				145,
				312,
				312
			]
		},
		"itemEffectTip": "，已放入背包"
	},
	"I397": {
		"cls": "items",
		"name": "风吉他",
		"text": "拾取后直接进入背包，占用琴身轮廓的 2×4 格。",
		"backpackWeapon": {
			"id": "windGuitar",
			"name": "风吉他",
			"shape": [
				[
					1,
					0
				],
				[
					1,
					0
				],
				[
					1,
					0
				],
				[
					1,
					1
				]
			],
			"image": "project/images/windGuitar.png",
			"imageCrop": [
				2,
				13,
				77,
				278,
				312,
				312
			]
		},
		"itemEffectTip": "，已放入背包"
	},
	"I398": {
		"cls": "items",
		"name": "风妈铳",
		"text": "拾取后直接进入背包，占用 1×3 格。",
		"backpackWeapon": {
			"id": "windGun",
			"name": "风妈铳",
			"shape": [
				[
					1
				],
				[
					1
				],
				[
					1
				]
			],
			"image": "project/images/windGun.png",
			"imageCrop": [
				7,
				9,
				62,
				221,
				312,
				312
			]
		},
		"itemEffectTip": "，已放入背包"
	},
	"I399": {
		"cls": "items",
		"name": "给爆",
		"text": "拾取后直接进入背包，占用 1×4 格。",
		"backpackWeapon": {
			"id": "giBao",
			"name": "给爆",
			"shape": [
				[
					1
				],
				[
					1
				],
				[
					1
				],
				[
					1
				]
			],
			"image": "project/images/giBao.png",
			"imageCrop": [
				2,
				7,
				70,
				299,
				312,
				312
			]
		},
		"itemEffectTip": "，已放入背包"
	},
	"I400": {
		"cls": "items",
		"name": "光剑",
		"text": "拾取后直接进入背包，占用 1×4 格。",
		"backpackWeapon": {
			"id": "lightSword",
			"name": "光剑",
			"shape": [
				[
					1
				],
				[
					1
				],
				[
					1
				],
				[
					1
				]
			],
			"image": "project/images/lightSword.png",
			"imageCrop": [
				2,
				22,
				71,
				264,
				312,
				312
			]
		},
		"itemEffectTip": "，已放入背包"
	},
	"I401": {
		"cls": "items",
		"name": "光龙拳",
		"text": "拾取后直接进入背包，占用 2×2 格。",
		"backpackWeapon": {
			"id": "lightDragonFist",
			"name": "光龙拳",
			"shape": [
				[
					1,
					1
				],
				[
					1,
					1
				]
			],
			"image": "project/images/lightDragonFist.png",
			"imageCrop": [
				2,
				12,
				72,
				102,
				312,
				312
			]
		},
		"itemEffectTip": "，已放入背包"
	},
	"I402": {
		"cls": "items",
		"name": "锅",
		"text": "拾取后直接进入背包，占用 1×3 格。",
		"backpackWeapon": {
			"id": "pan",
			"name": "锅",
			"shape": [
				[
					1
				],
				[
					1
				],
				[
					1
				]
			],
			"image": "project/images/pan.png",
			"imageCrop": [
				2,
				39,
				72,
				169,
				312,
				312
			]
		},
		"itemEffectTip": "，已放入背包"
	},
	"I403": {
		"cls": "items",
		"name": "火贝斯",
		"text": "拾取后直接进入背包，占用 1×3 格。",
		"backpackWeapon": {
			"id": "fireBass",
			"name": "火贝斯",
			"shape": [
				[
					1
				],
				[
					1
				],
				[
					1
				]
			],
			"image": "project/images/fireBass.png",
			"imageCrop": [
				2,
				6,
				72,
				223,
				312,
				312
			]
		},
		"itemEffectTip": "，已放入背包"
	},
	"I404": {
		"cls": "items",
		"name": "火吉他",
		"text": "拾取后直接进入背包，占用 1×3 格。",
		"backpackWeapon": {
			"id": "fireGuitar",
			"name": "火吉他",
			"shape": [
				[
					1
				],
				[
					1
				],
				[
					1
				]
			],
			"image": "project/images/fireGuitar.png",
			"imageCrop": [
				1,
				4,
				71,
				224,
				312,
				312
			]
		},
		"itemEffectTip": "，已放入背包"
	},
	"I405": {
		"cls": "items",
		"name": "机神盾",
		"text": "拾取后直接进入背包，占用 2×3 格。",
		"backpackWeapon": {
			"id": "machineGodShield",
			"name": "机神盾",
			"shape": [
				[
					1,
					1
				],
				[
					1,
					1
				],
				[
					1,
					1
				]
			],
			"image": "project/images/machineGodShield.png",
			"imageCrop": [
				3,
				11,
				149,
				216,
				312,
				312
			]
		},
		"itemEffectTip": "，已放入背包"
	},
	"I406": {
		"cls": "items",
		"name": "金刚晶",
		"text": "拾取后直接进入背包，占用 1×1 格。",
		"backpackWeapon": {
			"id": "diamondCrystal",
			"name": "金刚晶",
			"shape": [
				[
					1
				]
			],
			"image": "project/images/diamondCrystal.png",
			"imageCrop": [
				8,
				4,
				58,
				69,
				312,
				312
			]
		},
		"itemEffectTip": "，已放入背包"
	},
	"I407": {
		"cls": "items",
		"name": "金罐子",
		"text": "拾取后直接进入背包，占用 2×2 格。",
		"backpackWeapon": {
			"id": "goldJar",
			"name": "金罐子",
			"shape": [
				[
					1,
					1
				],
				[
					1,
					1
				]
			],
			"image": "project/images/goldJar.png",
			"imageCrop": [
				3,
				7,
				147,
				143,
				312,
				312
			]
		},
		"itemEffectTip": "，已放入背包"
	},
	"I408": {
		"cls": "items",
		"name": "精灵火龙",
		"text": "拾取后直接进入背包，占用 2×2 格。",
		"backpackWeapon": {
			"id": "spiritFireDragon",
			"name": "精灵火龙",
			"shape": [
				[
					1,
					1
				],
				[
					1,
					1
				]
			],
			"image": "project/images/spiritFireDragon.png",
			"imageCrop": [
				12,
				5,
				138,
				151,
				312,
				312
			]
		},
		"itemEffectTip": "，已放入背包"
	},
	"I409": {
		"cls": "items",
		"name": "精灵欧罗巴",
		"text": "拾取后直接进入背包，占用 2×2 格。",
		"backpackWeapon": {
			"id": "spiritEuropa",
			"name": "精灵欧罗巴",
			"shape": [
				[
					1,
					1
				],
				[
					1,
					1
				]
			],
			"image": "project/images/spiritEuropa.png",
			"imageCrop": [
				8,
				4,
				144,
				151,
				312,
				312
			]
		},
		"itemEffectTip": "，已放入背包"
	},
	"I410": {
		"cls": "items",
		"name": "兰短",
		"text": "拾取后直接进入背包，占用 1×2 格。",
		"backpackWeapon": {
			"id": "blueDagger",
			"name": "兰短",
			"shape": [
				[
					1
				],
				[
					1
				]
			],
			"image": "project/images/blueDagger.png",
			"imageCrop": [
				16,
				7,
				40,
				145,
				312,
				312
			]
		},
		"itemEffectTip": "，已放入背包"
	},
	"I411": {
		"cls": "items",
		"name": "连战短",
		"text": "拾取后直接进入背包，占用 1×2 格。",
		"backpackWeapon": {
			"id": "comboDagger",
			"name": "连战短",
			"shape": [
				[
					1
				],
				[
					1
				]
			],
			"image": "project/images/comboDagger.png",
			"imageCrop": [
				8,
				5,
				58,
				147,
				312,
				312
			]
		},
		"itemEffectTip": "，已放入背包"
	},
	"I412": {
		"cls": "items",
		"name": "派",
		"text": "拾取后直接进入背包，占用 1×2 格。",
		"backpackWeapon": {
			"id": "pie",
			"name": "派",
			"shape": [
				[
					1
				],
				[
					1
				]
			],
			"image": "project/images/pie.png",
			"imageCrop": [
				2,
				17,
				72,
				119,
				312,
				312
			]
		},
		"itemEffectTip": "，已放入背包"
	},
	"I413": {
		"cls": "items",
		"name": "螃蟹",
		"text": "拾取后直接进入背包，占用上宽下窄的 2×4 格。",
		"backpackWeapon": {
			"id": "crab",
			"name": "螃蟹",
			"shape": [
				[
					1,
					1
				],
				[
					1,
					1
				],
				[
					0,
					1
				],
				[
					0,
					1
				]
			],
			"image": "project/images/crab.png",
			"imageCrop": [
				1,
				3,
				153,
				271,
				312,
				312
			]
		},
		"itemEffectTip": "，已放入背包"
	},
	"I414": {
		"cls": "items",
		"name": "七星剑",
		"text": "拾取后直接进入背包，占用 1×3 格。",
		"backpackWeapon": {
			"id": "sevenStarSword",
			"name": "七星剑",
			"shape": [
				[
					1
				],
				[
					1
				],
				[
					1
				]
			],
			"image": "project/images/sevenStarSword.png",
			"imageCrop": [
				10,
				10,
				55,
				216,
				312,
				312
			]
		},
		"itemEffectTip": "，已放入背包"
	},
	"I415": {
		"cls": "items",
		"name": "石油铳",
		"text": "拾取后直接进入背包，占用 1×2 格。",
		"backpackWeapon": {
			"id": "oilGun",
			"name": "石油铳",
			"shape": [
				[
					1
				],
				[
					1
				]
			],
			"image": "project/images/oilGun.png",
			"imageCrop": [
				6,
				7,
				62,
				141,
				312,
				312
			]
		},
		"itemEffectTip": "，已放入背包"
	},
	"I416": {
		"cls": "items",
		"name": "石油斧",
		"text": "拾取后直接进入背包，占用巨斧轮廓的 3×5 格。",
		"backpackWeapon": {
			"id": "oilAxe",
			"name": "石油斧",
			"shape": [
				[
					1,
					1,
					1
				],
				[
					1,
					1,
					1
				],
				[
					0,
					1,
					0
				],
				[
					0,
					1,
					0
				],
				[
					0,
					1,
					0
				]
			],
			"image": "project/images/oilAxe.png",
			"imageCrop": [
				29,
				5,
				177,
				304,
				312,
				312
			]
		},
		"itemEffectTip": "，已放入背包"
	},
	"I417": {
		"cls": "items",
		"name": "石油弓",
		"text": "拾取后直接进入背包，占用 1×3 格。",
		"backpackWeapon": {
			"id": "oilBow",
			"name": "石油弓",
			"shape": [
				[
					1
				],
				[
					1
				],
				[
					1
				]
			],
			"image": "project/images/oilBow.png",
			"imageCrop": [
				6,
				6,
				63,
				222,
				312,
				312
			]
		},
		"itemEffectTip": "，已放入背包"
	},
	"I418": {
		"cls": "items",
		"name": "石油杖",
		"text": "拾取后直接进入背包，占用 1×3 格。",
		"backpackWeapon": {
			"id": "oilStaff",
			"name": "石油杖",
			"shape": [
				[
					1
				],
				[
					1
				],
				[
					1
				]
			],
			"image": "project/images/oilStaff.png",
			"imageCrop": [
				1,
				6,
				76,
				211,
				312,
				312
			]
		},
		"itemEffectTip": "，已放入背包"
	},
	"I419": {
		"cls": "items",
		"name": "水短",
		"text": "拾取后直接进入背包，占用 1×2 格。",
		"backpackWeapon": {
			"id": "waterDagger",
			"name": "水短",
			"shape": [
				[
					1
				],
				[
					1
				]
			],
			"image": "project/images/waterDagger.png",
			"imageCrop": [
				20,
				5,
				41,
				149,
				312,
				312
			]
		},
		"itemEffectTip": "，已放入背包"
	},
	"I420": {
		"cls": "items",
		"name": "水龙伞",
		"text": "拾取后直接进入背包，占用伞盖轮廓的 2×3 格。",
		"backpackWeapon": {
			"id": "waterDragonUmbrella",
			"name": "水龙伞",
			"shape": [
				[
					1,
					1
				],
				[
					1,
					1
				],
				[
					0,
					1
				]
			],
			"image": "project/images/waterDragonUmbrella.png",
			"imageCrop": [
				11,
				3,
				132,
				231,
				312,
				312
			]
		},
		"itemEffectTip": "，已放入背包"
	},
	"I421": {
		"cls": "items",
		"name": "天羽羽斩",
		"text": "拾取后直接进入背包，占用 1×4 格。",
		"backpackWeapon": {
			"id": "ameNoHabakiri",
			"name": "天羽羽斩",
			"shape": [
				[
					1
				],
				[
					1
				],
				[
					1
				],
				[
					1
				]
			],
			"image": "project/images/ameNoHabakiri.png",
			"imageCrop": [
				4,
				11,
				77,
				290,
				312,
				312
			]
		},
		"itemEffectTip": "，已放入背包"
	},
	"I422": {
		"cls": "items",
		"name": "铜盾",
		"text": "拾取后直接进入背包，占用 2×2 格。",
		"backpackWeapon": {
			"id": "bronzeShield",
			"name": "铜盾",
			"shape": [
				[
					1,
					1
				],
				[
					1,
					1
				]
			],
			"image": "project/images/bronzeShield.png",
			"imageCrop": [
				2,
				2,
				152,
				153,
				312,
				312
			]
		},
		"itemEffectTip": "，已放入背包"
	},
	"I423": {
		"cls": "items",
		"name": "土龙杖",
		"text": "拾取后直接进入背包，占用 1×3 格。",
		"backpackWeapon": {
			"id": "earthDragonStaff",
			"name": "土龙杖",
			"shape": [
				[
					1
				],
				[
					1
				],
				[
					1
				]
			],
			"image": "project/images/earthDragonStaff.png",
			"imageCrop": [
				3,
				7,
				72,
				221,
				312,
				312
			]
		},
		"itemEffectTip": "，已放入背包"
	},
	"I424": {
		"cls": "items",
		"name": "土妹剑",
		"text": "拾取后直接进入背包，占用 1×3 格。",
		"backpackWeapon": {
			"id": "earthGirlSword",
			"name": "土妹剑",
			"shape": [
				[
					1
				],
				[
					1
				],
				[
					1
				]
			],
			"image": "project/images/earthGirlSword.png",
			"imageCrop": [
				2,
				21,
				72,
				196,
				312,
				312
			]
		},
		"itemEffectTip": "，已放入背包"
	},
	"I425": {
		"cls": "items",
		"name": "银盾",
		"text": "拾取后直接进入背包，占用盾牌轮廓的 2×3 格。",
		"backpackWeapon": {
			"id": "silverShield",
			"name": "银盾",
			"shape": [
				[
					1,
					1
				],
				[
					1,
					1
				],
				[
					0,
					1
				]
			],
			"image": "project/images/silverShield.png",
			"imageCrop": [
				2,
				7,
				151,
				220,
				312,
				312
			]
		},
		"itemEffectTip": "，已放入背包"
	},
	"I426": {
		"cls": "items",
		"name": "银罐子",
		"text": "拾取后直接进入背包，占用 2×2 格。",
		"backpackWeapon": {
			"id": "silverJar",
			"name": "银罐子",
			"shape": [
				[
					1,
					1
				],
				[
					1,
					1
				]
			],
			"image": "project/images/silverJar.png",
			"imageCrop": [
				21,
				16,
				119,
				120,
				312,
				312
			]
		},
		"itemEffectTip": "，已放入背包"
	},
	"I427": {
		"cls": "items",
		"name": "炸虾",
		"text": "拾取后直接进入背包，占用 1×3 格。",
		"backpackWeapon": {
			"id": "friedShrimp",
			"name": "炸虾",
			"shape": [
				[
					1
				],
				[
					1
				],
				[
					1
				]
			],
			"image": "project/images/friedShrimp.png",
			"imageCrop": [
				3,
				23,
				69,
				182,
				312,
				312
			]
		},
		"itemEffectTip": "，已放入背包"
	},
	"I428": {
		"cls": "items",
		"name": "真化七星剑",
		"text": "拾取后直接进入背包，占用 1×3 格。",
		"backpackWeapon": {
			"id": "trueSevenStarSword",
			"name": "真化七星剑",
			"shape": [
				[
					1
				],
				[
					1
				],
				[
					1
				]
			],
			"image": "project/images/trueSevenStarSword.png",
			"imageCrop": [
				10,
				10,
				55,
				215,
				312,
				312
			]
		},
		"itemEffectTip": "，已放入背包"
	},
	"I429": {
		"cls": "tools",
		"name": "背包格子",
		"text": "用于解锁一个背包格子。打开背包后，点击带加号的虚线格即可消耗一个。",
		"canUseItemEffect": "false"
	}
}