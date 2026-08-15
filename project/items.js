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
		"name": "炎威之翼镰",
		"text": "null",
		"backpackWeaponId": "I384",
		"itemEffectTip": "，已放入背包"
	},
	"I385": {
		"cls": "constants",
		"name": "背包",
		"canUseItemEffect": "true",
		"useItemEffect": "core.plugin.boxbar()",
		"text": ""
	},
	"I386": {
		"cls": "items",
		"name": "呪蚀之骸枪",
		"text": "null",
		"backpackWeaponId": "I386",
		"itemEffectTip": "，已放入背包"
	},
	"I387": {
		"cls": "items",
		"name": "科罗萨斯之拳·玛格纳",
		"text": "null",
		"backpackWeaponId": "I387",
		"itemEffectTip": "，已放入背包"
	},
	"I372": {
		"cls": "items",
		"name": "薛定谔",
		"text": "null",
		"backpackWeaponId": "I372",
		"itemEffectTip": "，已放入背包"
	},
	"I388": {
		"cls": "items",
		"name": "塞勒斯特之镰·玛格纳",
		"text": "null",
		"backpackWeaponId": "I388",
		"itemEffectTip": "，已放入背包"
	},
	"I389": {
		"cls": "items",
		"name": "佐西莫斯",
		"text": "null",
		"backpackWeaponId": "I389",
		"itemEffectTip": "，已放入背包"
	},
	"I390": {
		"cls": "items",
		"name": "安心与信赖的红箱御守",
		"text": "null",
		"backpackWeaponId": "I390",
		"itemEffectTip": "，已放入背包"
	},
	"I391": {
		"cls": "items",
		"name": "全能药",
		"text": "",
		"backpackWeaponId": "I391",
		"itemEffectTip": "，已放入背包"
	},
	"I393": {
		"cls": "items",
		"name": "海鳗",
		"text": "",
		"backpackWeaponId": "I393",
		"itemEffectTip": "，已放入背包"
	},
	"I394": {
		"cls": "items",
		"name": "祈愿滚箱的金箱御守",
		"text": "null",
		"backpackWeaponId": "I394",
		"itemEffectTip": "，已放入背包"
	},
	"I395": {
		"cls": "items",
		"name": "方天画戟",
		"text": "null",
		"backpackWeaponId": "I395",
		"itemEffectTip": "，已放入背包"
	},
	"I396": {
		"cls": "items",
		"name": "劫风之翼锐",
		"text": "null",
		"backpackWeaponId": "I396",
		"itemEffectTip": "，已放入背包"
	},
	"I397": {
		"cls": "items",
		"name": "残暴之血",
		"text": "null",
		"backpackWeaponId": "I397",
		"itemEffectTip": "，已放入背包"
	},
	"I398": {
		"cls": "items",
		"name": "提亚玛特弩枪·玛格纳",
		"text": "null",
		"backpackWeaponId": "I398",
		"itemEffectTip": "，已放入背包"
	},
	"I399": {
		"cls": "items",
		"name": "穿心枪盖尔伯格",
		"text": "null",
		"backpackWeaponId": "I399",
		"itemEffectTip": "，已放入背包"
	},
	"I400": {
		"cls": "items",
		"name": "修瓦利耶之剑·玛格纳",
		"text": "null",
		"backpackWeaponId": "I400",
		"itemEffectTip": "，已放入背包"
	},
	"I401": {
		"cls": "items",
		"name": "威光之逆鳞",
		"text": "null",
		"backpackWeaponId": "I401",
		"itemEffectTip": "，已放入背包"
	},
	"I402": {
		"cls": "items",
		"name": "圣诞炒锅",
		"text": "null",
		"backpackWeaponId": "I402",
		"itemEffectTip": "，已放入背包"
	},
	"I403": {
		"cls": "items",
		"name": "Flying A",
		"text": "null",
		"backpackWeaponId": "I403",
		"itemEffectTip": "，已放入背包"
	},
	"I404": {
		"cls": "items",
		"name": "远走高飞",
		"text": "null",
		"backpackWeaponId": "I404",
		"itemEffectTip": "，已放入背包"
	},
	"I405": {
		"cls": "items",
		"name": "月丘",
		"text": "拾取后直接进入背包，占用 2×3 格。",
		"backpackWeaponId": "I405",
		"itemEffectTip": "，已放入背包"
	},
	"I406": {
		"cls": "items",
		"name": "金刚晶",
		"text": "拾取后直接进入背包，占用 1×1 格。",
		"backpackWeaponId": "I406",
		"itemEffectTip": "，已放入背包"
	},
	"I407": {
		"cls": "items",
		"name": "金色史莱姆铃铛",
		"text": "null",
		"backpackWeaponId": "I407",
		"itemEffectTip": "，已放入背包"
	},
	"I408": {
		"cls": "items",
		"name": "迷你威尔纳斯",
		"text": "null",
		"backpackWeaponId": "I408",
		"itemEffectTip": "，已放入背包"
	},
	"I409": {
		"cls": "items",
		"name": "迷你欧罗巴",
		"text": "null",
		"backpackWeaponId": "I409",
		"itemEffectTip": "，已放入背包"
	},
	"I410": {
		"cls": "items",
		"name": "冰之骑士",
		"text": "null",
		"backpackWeaponId": "I410",
		"itemEffectTip": "，已放入背包"
	},
	"I411": {
		"cls": "items",
		"name": "神尽克尽·无量慈悲",
		"text": "null",
		"backpackWeaponId": "I411",
		"itemEffectTip": "，已放入背包"
	},
	"I412": {
		"cls": "items",
		"name": "雅雅的炒饭",
		"text": "null",
		"backpackWeaponId": "I412",
		"itemEffectTip": "，已放入背包"
	},
	"I413": {
		"cls": "items",
		"name": "红色帝王蟹",
		"text": "null",
		"backpackWeaponId": "I413",
		"itemEffectTip": "，已放入背包"
	},
	"I414": {
		"cls": "items",
		"name": "七星剣・煌",
		"text": "null",
		"backpackWeaponId": "I414",
		"itemEffectTip": "，已放入背包"
	},
	"I415": {
		"cls": "items",
		"name": "亵渎的魔弹",
		"text": "null",
		"backpackWeaponId": "I415",
		"itemEffectTip": "，已放入背包"
	},
	"I416": {
		"cls": "items",
		"name": "雷神之锤",
		"text": "null",
		"backpackWeaponId": "I416",
		"itemEffectTip": "，已放入背包"
	},
	"I417": {
		"cls": "items",
		"name": "赫拉克勒斯",
		"text": "null",
		"backpackWeaponId": "I417",
		"itemEffectTip": "，已放入背包"
	},
	"I418": {
		"cls": "items",
		"name": "墨丘利的节杖",
		"text": "null",
		"backpackWeaponId": "I418",
		"itemEffectTip": "，已放入背包"
	},
	"I419": {
		"cls": "items",
		"name": "利维坦之视·玛格纳",
		"text": "null",
		"backpackWeaponId": "I419",
		"itemEffectTip": "，已放入背包"
	},
	"I420": {
		"cls": "items",
		"name": "水祸之丽伞",
		"text": "null",
		"backpackWeaponId": "I420",
		"itemEffectTip": "，已放入背包"
	},
	"I421": {
		"cls": "items",
		"name": "天羽羽斩",
		"text": "null",
		"backpackWeaponId": "I421",
		"itemEffectTip": "，已放入背包"
	},
	"I422": {
		"cls": "items",
		"name": "真龙之盾",
		"text": "null",
		"backpackWeaponId": "I422",
		"itemEffectTip": "，已放入背包"
	},
	"I423": {
		"cls": "items",
		"name": "巖迫之躯杖",
		"text": "null",
		"backpackWeaponId": "I423",
		"itemEffectTip": "，已放入背包"
	},
	"I424": {
		"cls": "items",
		"name": "世界树的晶剑·玛格纳",
		"text": "null",
		"backpackWeaponId": "I424",
		"itemEffectTip": "，已放入背包"
	},
	"I425": {
		"cls": "items",
		"name": "神意之盾",
		"text": "null",
		"backpackWeaponId": "I425",
		"itemEffectTip": "，已放入背包"
	},
	"I426": {
		"cls": "items",
		"name": "银色史莱姆铃铛",
		"text": "null",
		"backpackWeaponId": "I426",
		"itemEffectTip": "，已放入背包"
	},
	"I427": {
		"cls": "items",
		"name": "黄金超值之剑",
		"text": "null",
		"backpackWeaponId": "I427",
		"itemEffectTip": "，已放入背包"
	},
	"I428": {
		"cls": "items",
		"name": "七星剑·白天",
		"text": "null",
		"backpackWeaponId": "I428",
		"itemEffectTip": "，已放入背包"
	},
	"I429": {
		"cls": "tools",
		"name": "背包格子",
		"text": "用于解锁一个背包格子。打开背包后，点击带加号的虚线格即可消耗一个。",
		"canUseItemEffect": "false"
	},
	"I500": {
		"cls": "items",
		"name": "手甲",
		"text": "null",
		"backpackWeaponId": "I500",
		"itemEffectTip": "，已放入背包"
	},
	"I501": {
		"cls": "items",
		"name": "钢制战斧",
		"text": "null",
		"backpackWeaponId": "I501",
		"itemEffectTip": "，已放入背包"
	},
	"I502": {
		"cls": "items",
		"name": "塞勒斯特之镰",
		"text": "null",
		"backpackWeaponId": "I502",
		"itemEffectTip": "，已放入背包"
	},
	"I503": {
		"cls": "items",
		"name": "钢棍",
		"text": "null",
		"backpackWeaponId": "I503",
		"itemEffectTip": "，已放入背包"
	},
	"I504": {
		"cls": "items",
		"name": "钢铁游击矛",
		"text": "null",
		"backpackWeaponId": "I504",
		"itemEffectTip": "，已放入背包"
	},
	"I505": {
		"cls": "items",
		"name": "钢制匕首",
		"text": "null",
		"backpackWeaponId": "I505",
		"itemEffectTip": "，已放入背包"
	},
	"I506": {
		"cls": "items",
		"name": "提亚玛特弩枪",
		"text": "null",
		"backpackWeaponId": "I506",
		"itemEffectTip": "，已放入背包"
	},
	"I507": {
		"cls": "items",
		"name": "科罗萨斯之拳",
		"text": "null",
		"backpackWeaponId": "I507",
		"itemEffectTip": "，已放入背包"
	},
	"I508": {
		"cls": "items",
		"name": "高万泰因",
		"text": "null",
		"backpackWeaponId": "I508",
		"itemEffectTip": "，已放入背包"
	},
	"I509": {
		"cls": "items",
		"name": "一期一振",
		"text": "null",
		"backpackWeaponId": "I509",
		"itemEffectTip": "，已放入背包"
	},
	"I510": {
		"cls": "items",
		"name": "七星剑",
		"text": "null",
		"backpackWeaponId": "I510",
		"itemEffectTip": "，已放入背包"
	},
	"I511": {
		"cls": "items",
		"name": "吉斯拉",
		"text": "null",
		"backpackWeaponId": "I511",
		"itemEffectTip": "，已放入背包"
	},
	"I512": {
		"cls": "items",
		"name": "你与我的桃色水平线",
		"text": "null",
		"backpackWeaponId": "I512",
		"itemEffectTip": "，已放入背包"
	},
	"I513": {
		"cls": "items",
		"name": "使役者之证",
		"text": "null",
		"backpackWeaponId": "I513",
		"itemEffectTip": "，已放入背包"
	},
	"I514": {
		"cls": "items",
		"name": "蔑笑妖",
		"text": "null",
		"backpackWeaponId": "I514",
		"itemEffectTip": "，已放入背包"
	},
	"I515": {
		"cls": "items",
		"name": "充气露·欧",
		"text": "null",
		"backpackWeaponId": "I515",
		"itemEffectTip": "，已放入背包"
	},
	"I516": {
		"cls": "items",
		"name": "森人之证",
		"text": "null",
		"backpackWeaponId": "I516",
		"itemEffectTip": "，已放入背包"
	},
	"I517": {
		"cls": "items",
		"name": "格里姆尼尔(解放1)",
		"text": "null",
		"backpackWeaponId": "I517",
		"itemEffectTip": "，已放入背包"
	},
	"I518": {
		"cls": "items",
		"name": "追忆的咖啡冻",
		"text": "null",
		"backpackWeaponId": "I518",
		"itemEffectTip": "，已放入背包"
	},
	"I519": {
		"cls": "items",
		"name": "朱雀翼弦",
		"text": "null",
		"backpackWeaponId": "I519",
		"itemEffectTip": "，已放入背包"
	},
	"I520": {
		"cls": "items",
		"name": "切片菠萝",
		"text": "null",
		"backpackWeaponId": "I520",
		"itemEffectTip": "，已放入背包"
	},
	"I521": {
		"cls": "items",
		"name": "压制之斧",
		"text": "null",
		"backpackWeaponId": "I521",
		"itemEffectTip": "，已放入背包"
	},
	"I522": {
		"cls": "items",
		"name": "双剑士之证",
		"text": "null",
		"backpackWeaponId": "I522",
		"itemEffectTip": "，已放入背包"
	},
	"I523": {
		"cls": "items",
		"name": "甄选吉他拨片",
		"text": "null",
		"backpackWeaponId": "I523",
		"itemEffectTip": "，已放入背包"
	},
	"I524": {
		"cls": "items",
		"name": "吟游诗人之证",
		"text": "null",
		"backpackWeaponId": "I524",
		"itemEffectTip": "，已放入背包"
	},
	"I525": {
		"cls": "items",
		"name": "充气伽莱翁",
		"text": "null",
		"backpackWeaponId": "I525",
		"itemEffectTip": "，已放入背包"
	},
	"I526": {
		"cls": "items",
		"name": "垂泪曼陀铃",
		"text": "null",
		"backpackWeaponId": "I526",
		"itemEffectTip": "，已放入背包"
	},
	"I527": {
		"cls": "items",
		"name": "合一之魂",
		"text": "null",
		"backpackWeaponId": "I527",
		"itemEffectTip": "，已放入背包"
	},
	"I528": {
		"cls": "items",
		"name": "塔赫尔玛萨拉",
		"text": "null",
		"backpackWeaponId": "I528",
		"itemEffectTip": "，已放入背包"
	},
	"I529": {
		"cls": "items",
		"name": "威尔士天浆",
		"text": "null",
		"backpackWeaponId": "I529",
		"itemEffectTip": "，已放入背包"
	},
	"I530": {
		"cls": "items",
		"name": "修瓦利耶之剑",
		"text": "null",
		"backpackWeaponId": "I530",
		"itemEffectTip": "，已放入背包"
	},
	"I531": {
		"cls": "items",
		"name": "世界树的晶剑",
		"text": "null",
		"backpackWeaponId": "I531",
		"itemEffectTip": "，已放入背包"
	},
	"I532": {
		"cls": "items",
		"name": "熟悉的银箱御守",
		"text": "null",
		"backpackWeaponId": "I532",
		"itemEffectTip": "，已放入背包"
	},
	"I533": {
		"cls": "items",
		"name": "利维坦之视",
		"text": "null",
		"backpackWeaponId": "I533",
		"itemEffectTip": "，已放入背包"
	},
	"I534": {
		"cls": "items",
		"name": "半瓶秘药",
		"text": "null",
		"backpackWeaponId": "I534",
		"itemEffectTip": "，已放入背包"
	},
	"I535": {
		"cls": "items",
		"name": "少女蜜露",
		"text": "null",
		"backpackWeaponId": "I535",
		"itemEffectTip": "，已放入背包"
	},
	"I536": {
		"cls": "items",
		"name": "尼伯龙根之杯",
		"text": "null",
		"backpackWeaponId": "I536",
		"itemEffectTip": "，已放入背包"
	},
	"I537": {
		"cls": "items",
		"name": "痛苦与苦难",
		"text": "null",
		"backpackWeaponId": "I537",
		"itemEffectTip": "，已放入背包"
	},
	"I538": {
		"cls": "items",
		"name": "巴哈姆特之盾",
		"text": "null",
		"backpackWeaponId": "I538",
		"itemEffectTip": "，已放入背包"
	},
	"I539": {
		"cls": "items",
		"name": "乐师之证",
		"text": "null",
		"backpackWeaponId": "I539",
		"itemEffectTip": "，已放入背包"
	},
	"I540": {
		"cls": "items",
		"name": "彗星猎手",
		"text": "null",
		"backpackWeaponId": "I540",
		"itemEffectTip": "，已放入背包"
	},
	"I541": {
		"cls": "items",
		"name": "恶灭之雷",
		"text": "null",
		"backpackWeaponId": "I541",
		"itemEffectTip": "，已放入背包"
	},
	"I542": {
		"cls": "items",
		"name": "贝尼迪",
		"text": "null",
		"backpackWeaponId": "I542",
		"itemEffectTip": "，已放入背包"
	},
	"I543": {
		"cls": "items",
		"name": "宿命铁拳",
		"text": "null",
		"backpackWeaponId": "I543",
		"itemEffectTip": "，已放入背包"
	},
	"I544": {
		"cls": "items",
		"name": "恶戏妖",
		"text": "null",
		"backpackWeaponId": "I544",
		"itemEffectTip": "，已放入背包"
	},
	"I545": {
		"cls": "items",
		"name": "充气菲迪埃尔",
		"text": "null",
		"backpackWeaponId": "I545",
		"itemEffectTip": "，已放入背包"
	},
	"I547": {
		"cls": "items",
		"name": "超值之剑",
		"text": "null",
		"backpackWeaponId": "I427",
		"itemEffectTip": "，已放入背包"
	},
	"I548": {
		"cls": "items",
		"name": "斯拉德战斧",
		"text": "null",
		"backpackWeaponId": "I548",
		"itemEffectTip": "，已放入背包"
	},
	"I549": {
		"cls": "items",
		"name": "欧罗巴(未解放)",
		"text": "null",
		"backpackWeaponId": "I549",
		"itemEffectTip": "，已放入背包"
	},
	"I550": {
		"cls": "items",
		"name": "圣诞瓦姆杜斯",
		"text": "null",
		"backpackWeaponId": "I550",
		"itemEffectTip": "，已放入背包"
	},
	"I551": {
		"cls": "items",
		"name": "暗黑被提·拟像",
		"text": "null",
		"backpackWeaponId": "I551",
		"itemEffectTip": "，已放入背包"
	},
	"I552": {
		"cls": "items",
		"name": "混沌之源",
		"text": "null",
		"backpackWeaponId": "I552",
		"itemEffectTip": "，已放入背包"
	},
	"I553": {
		"cls": "items",
		"name": "湿婆（解放1）",
		"text": "null",
		"backpackWeaponId": "I553",
		"itemEffectTip": "，已放入背包"
	},
	"I554": {
		"cls": "items",
		"name": "红色星球",
		"text": "null",
		"backpackWeaponId": "I554",
		"itemEffectTip": "，已放入背包"
	},
	"I555": {
		"cls": "items",
		"name": "威尔纳斯灯笼",
		"text": "null",
		"backpackWeaponId": "I555",
		"itemEffectTip": "，已放入背包"
	},
	"I556": {
		"cls": "items",
		"name": "迷你乌洛波洛斯",
		"text": "null",
		"backpackWeaponId": "I556",
		"itemEffectTip": "，已放入背包"
	},
	"I557": {
		"cls": "items",
		"name": "卡瓦酒烤鳗鱼",
		"text": "null",
		"backpackWeaponId": "I557",
		"itemEffectTip": "，已放入背包"
	},
	"I558": {
		"cls": "items",
		"name": "钢腕猛击的大熊",
		"text": "null",
		"backpackWeaponId": "I558",
		"itemEffectTip": "，已放入背包"
	},
	"I559": {
		"cls": "items",
		"name": "狂战士之怒",
		"text": "null",
		"backpackWeaponId": "I559",
		"itemEffectTip": "，已放入背包"
	},
	"I560": {
		"cls": "items",
		"name": "狂战士之证",
		"text": "null",
		"backpackWeaponId": "I560",
		"itemEffectTip": "，已放入背包"
	},
	"I561": {
		"cls": "items",
		"name": "狮子王战拳",
		"text": "null",
		"backpackWeaponId": "I561",
		"itemEffectTip": "，已放入背包"
	},
	"I562": {
		"cls": "items",
		"name": "芬布尔之冬",
		"text": "null",
		"backpackWeaponId": "I562",
		"itemEffectTip": "，已放入背包"
	},
	"I563": {
		"cls": "items",
		"name": "围巾狗",
		"text": "null",
		"backpackWeaponId": "I563",
		"itemEffectTip": "，已放入背包"
	},
	"I564": {
		"cls": "items",
		"name": "剑玉米",
		"text": "null",
		"backpackWeaponId": "I564",
		"itemEffectTip": "，已放入背包"
	},
	"I565": {
		"cls": "items",
		"name": "玉钢",
		"text": "null",
		"backpackWeaponId": "I565",
		"itemEffectTip": "，已放入背包"
	},
	"I566": {
		"cls": "items",
		"name": "琴师之证",
		"text": "null",
		"backpackWeaponId": "I566",
		"itemEffectTip": "，已放入背包"
	},
	"I567": {
		"cls": "items",
		"name": "疯狂扫帚",
		"text": "null",
		"backpackWeaponId": "I567",
		"itemEffectTip": "，已放入背包"
	},
	"I568": {
		"cls": "items",
		"name": "盾骑士之证",
		"text": "null",
		"backpackWeaponId": "I568",
		"itemEffectTip": "，已放入背包"
	},
	"I569": {
		"cls": "items",
		"name": "石像鬼之刃",
		"text": "null",
		"backpackWeaponId": "I569",
		"itemEffectTip": "，已放入背包"
	},
	"I571": {
		"cls": "items",
		"name": "神域守护·布洛蒂亚(解放1)",
		"text": "null",
		"backpackWeaponId": "I571",
		"itemEffectTip": "，已放入背包"
	},
	"I572": {
		"cls": "items",
		"name": "蜂鸟",
		"text": "null",
		"backpackWeaponId": "I572",
		"itemEffectTip": "，已放入背包"
	},
	"I573": {
		"cls": "items",
		"name": "鹰眼",
		"text": "null",
		"backpackWeaponId": "I573",
		"itemEffectTip": "，已放入背包"
	},
	"I574": {
		"cls": "items",
		"name": "蓝色星球",
		"text": "null",
		"backpackWeaponId": "I574",
		"itemEffectTip": "，已放入背包"
	},
	"I575": {
		"cls": "items",
		"name": "绝拳",
		"text": "null",
		"backpackWeaponId": "I575",
		"itemEffectTip": "，已放入背包"
	},
	"I576": {
		"cls": "items",
		"name": "绯绯色金",
		"text": "null",
		"backpackWeaponId": "I576",
		"itemEffectTip": "，已放入背包"
	},
	"I577": {
		"cls": "items",
		"name": "绽花瓶",
		"text": "null",
		"backpackWeaponId": "I577",
		"itemEffectTip": "，已放入背包"
	},
	"I578": {
		"cls": "items",
		"name": "胡萝卜剑",
		"text": "null",
		"backpackWeaponId": "I578",
		"itemEffectTip": "，已放入背包"
	},
	"I579": {
		"cls": "items",
		"name": "蔚蓝闪电",
		"text": "null",
		"backpackWeaponId": "I579",
		"itemEffectTip": "，已放入背包"
	},
	"I581": {
		"cls": "items",
		"name": "虹之弓",
		"text": "null",
		"backpackWeaponId": "I581",
		"itemEffectTip": "，已放入背包"
	},
	"I582": {
		"cls": "items",
		"name": "裙䙓利刃",
		"text": "null",
		"backpackWeaponId": "I582",
		"itemEffectTip": "，已放入背包"
	},
	"I583": {
		"cls": "items",
		"name": "语部之弦",
		"text": "null",
		"backpackWeaponId": "I583",
		"itemEffectTip": "，已放入背包"
	},
	"I584": {
		"cls": "items",
		"name": "贤者之证",
		"text": "null",
		"backpackWeaponId": "I584",
		"itemEffectTip": "，已放入背包"
	},
	"I585": {
		"cls": "items",
		"name": "伊甸",
		"text": "null",
		"backpackWeaponId": "I585",
		"itemEffectTip": "，已放入背包"
	},
	"I586": {
		"cls": "items",
		"name": "这就是生活",
		"text": "null",
		"backpackWeaponId": "I586",
		"itemEffectTip": "，已放入背包"
	},
	"I587": {
		"cls": "items",
		"name": "追忆小提琴",
		"text": "null",
		"backpackWeaponId": "I587",
		"itemEffectTip": "，已放入背包"
	},
	"I588": {
		"cls": "items",
		"name": "野猪达尔克",
		"text": "null",
		"backpackWeaponId": "I588",
		"itemEffectTip": "，已放入背包"
	},
	"I589": {
		"cls": "items",
		"name": "金刚晶碎片",
		"text": "null",
		"backpackWeaponId": "I589",
		"itemEffectTip": "，已放入背包"
	},
	"I590": {
		"cls": "items",
		"name": "决斗盾",
		"text": "null",
		"backpackWeaponId": "I590",
		"itemEffectTip": "，已放入背包"
	},
	"I591": {
		"cls": "items",
		"name": "平底锅",
		"text": "null",
		"backpackWeaponId": "I591",
		"itemEffectTip": "，已放入背包"
	},
	"I592": {
		"cls": "items",
		"name": "史莱姆铃铛",
		"text": "null",
		"backpackWeaponId": "I592",
		"itemEffectTip": "，已放入背包"
	},
	"I593": {
		"cls": "items",
		"name": "阿斯克勒庇俄斯之杖",
		"text": "null",
		"backpackWeaponId": "I593",
		"itemEffectTip": "，已放入背包"
	},
	"I594": {
		"cls": "items",
		"name": "亥姆霍兹",
		"text": "null",
		"backpackWeaponId": "I594",
		"itemEffectTip": "，已放入背包"
	},
	"I595": {
		"cls": "items",
		"name": "打扰一下",
		"text": "null",
		"backpackWeaponId": "I595",
		"itemEffectTip": "，已放入背包"
	},
	"I596": {
		"cls": "items",
		"name": "香榭丽舍",
		"text": "null",
		"backpackWeaponId": "I596",
		"itemEffectTip": "，已放入背包"
	},
	"I597": {
		"cls": "items",
		"name": "好香蕉",
		"text": "null",
		"backpackWeaponId": "I597",
		"itemEffectTip": "，已放入背包"
	},
	"I598": {
		"cls": "items",
		"name": "鬼丸国綱",
		"text": "null",
		"backpackWeaponId": "I598",
		"itemEffectTip": "，已放入背包"
	},
	"I599": {
		"cls": "items",
		"name": "魔剑士之证",
		"text": "null",
		"backpackWeaponId": "I599",
		"itemEffectTip": "，已放入背包"
	},
	"I600": {
		"cls": "items",
		"name": "暗夜鲸头鹳",
		"text": "null",
		"backpackWeaponId": "I600",
		"itemEffectTip": "，已放入背包"
	},
	"I601": {
		"cls": "items",
		"name": "守卫之鹿",
		"text": "null",
		"backpackWeaponId": "I601",
		"itemEffectTip": "，已放入背包"
	},
	"I373": {
		"cls": "items",
		"name": "随机武器",
		"canUseItemEffect": "true",
		"itemEffect": "core.insertCommonEvent('记事本')"
	},
	"I374": {
		"cls": "items",
		"name": "新物品",
		"canUseItemEffect": "true"
	},
	"I430": {
		"cls": "items",
		"name": "新物品",
		"canUseItemEffect": "true"
	},
	"I431": {
		"cls": "items",
		"name": "新物品",
		"canUseItemEffect": "true"
	},
	"I432": {
		"cls": "items",
		"name": "新物品",
		"canUseItemEffect": "true"
	},
	"I433": {
		"cls": "items",
		"name": "新物品",
		"canUseItemEffect": "true"
	},
	"I434": {
		"cls": "items",
		"name": "新物品",
		"canUseItemEffect": "true"
	}
}