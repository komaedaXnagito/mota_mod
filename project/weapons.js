/**
 * 背包乱斗武器的唯一配置源。
 * 本文件可由 editor.html 的物品图块属性表直接编辑。
 * project/items.js 只保存地图道具入口和 backpackWeaponId 映射。
 */
var weaponDefinitions_9f2e6f5b_4b2c_4f8c_9a3d_7e1b6c0d5a44 = {
	"I372": {
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
			],
			[
				1
			]
		],
		"image": "project/images/xde.png",
		"sourceName": "薛定谔",
		"rarity": 4,
		"minAttack": 3,
		"maxAttack": 6,
		"hitRate": 1,
		"attackInterval": 1.6,
		"ultimateGain": 10,
		"weaponTypes": [
			"刀"
		],
		"synergyText": "奥义发动时，自身hp+5，再生+1\n配置在∧内剑和刀命中时，自身高扬+1",
		"combatRules": [
			{
				"id": "ultimateHealAndRegen",
				"trigger": "afterUltimate",
				"conditions": [],
				"effects": [
					{
						"type": "heal",
						"target": "player",
						"value": 5
					},
					{
						"type": "applyStatus",
						"target": "player",
						"status": "regeneration",
						"stacks": 1
					}
				]
			},
			{
				"id": "leftRightBladeHitGrantsHighSpirit",
				"trigger": "afterLinkedWeaponHit",
				"conditions": [
					{
						"kind": "linkedWeapon",
						"directions": [
							"left",
							"right"
						],
						"distance": 1,
						"filter": {
							"weaponTypes": [
								"剑",
								"刀"
							]
						}
					}
				],
				"effects": [
					{
						"type": "applyStatus",
						"target": "player",
						"status": "highSpirit",
						"stacks": 1
					}
				]
			}
		]
	},
	"I384": {
		"id": "fireDragonAxe",
		"name": "炎威之翼镰",
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
		],
		"sourceName": "炎威之翼镰",
		"rarity": 4,
		"minAttack": 10,
		"maxAttack": 15,
		"hitRate": 0.75,
		"attackInterval": 2.2,
		"ultimateGain": 5,
		"weaponTypes": [
			"斧"
		],
		"combatRules": [
			{
				"id": "hitBurnAndHighSpirit",
				"trigger": "afterHit",
				"conditions": [],
				"effects": [
					{
						"type": "applyStatus",
						"target": "opponent",
						"status": "burn",
						"stacks": 2
					},
					{
						"type": "applyStatus",
						"target": "self",
						"status": "highSpirit",
						"stacks": 1
					}
				]
			},
			{
				"id": "burnDamageBonus",
				"trigger": "battleStart",
				"effects": [
					{
						"type": "statusDamageBonus",
						"id": "burnBonus",
						"target": "enemy",
						"status": "burn",
						"every": 2,
						"value": 1,
						"weaponTypes": [
							"你的武器类型"
						]
					}
				]
			}
		],
		"synergyText": "攻击命中时：敌方烧伤+2/自身高扬+1\n敌方每有2层烧伤，伤害+1"
	},
	"I386": {
		"id": "darkDragonSpear",
		"name": "呪蚀之骸枪",
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
		"image": "project/images/darkDragonSpear.png",
		"imageCrop": [
			7,
			7,
			139,
			299,
			312,
			312
		],
		"sourceName": "呪蚀之骸枪",
		"rarity": 4,
		"minAttack": 12,
		"maxAttack": 17,
		"hitRate": 0.95,
		"attackInterval": 2.2,
		"ultimateGain": 2,
		"weaponTypes": [
			"枪"
		],
		"synergyText": "攻击命中时：敌方虚脱+2/随机弱体效果+1",
		"combatRules": [
			{
				"id": "hitExhaustAndRandomDebuff",
				"trigger": "afterHit",
				"conditions": [],
				"effects": [
					{
						"type": "applyStatus",
						"target": "opponent",
						"status": "exhaustion",
						"stacks": 2
					},
					{
						"type": "applyRandomDebuff",
						"target": "opponent",
						"stacks": 1
					}
				]
			}
		]
	},
	"I387": {
		"id": "gundamFist",
		"name": "科罗萨斯之拳·玛格纳",
		"shape": [
			[
				1
			],
			[
				1
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
		],
		"sourceName": "科罗萨斯之拳·玛格纳",
		"rarity": 3,
		"minAttack": 1,
		"maxAttack": 3,
		"hitRate": 0.95,
		"attackInterval": 1.1,
		"ultimateGain": 1,
		"weaponTypes": [
			"拳"
		],
		"combatRules": {
			"id": "hitAddsBurn",
			"trigger": "afterHit",
			"conditions": [],
			"effects": [
				{
					"type": "applyStatus",
					"target": "opponent",
					"status": "burn",
					"stacks": 1
				}
			]
		},
		"synergyText": "攻击命中时：敌方烧伤+1"
	},
	"I388": {
		"id": "darkAxe",
		"name": "塞勒斯特之镰·玛格纳",
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
		],
		"sourceName": "塞勒斯特之镰·玛格纳",
		"rarity": 3,
		"minAttack": 6,
		"maxAttack": 10,
		"hitRate": 0.75,
		"attackInterval": 2.2,
		"ultimateGain": 5,
		"weaponTypes": [
			"斧"
		],
		"combatRules": [
			{
				"id": "hitDispelsOneRandomBuff",
				"trigger": "afterHit",
				"conditions": [],
				"effects": [
					{
						"type": "dispelRandomBuff",
						"target": "opponent"
					}
				]
			}
		],
		"synergyText": "攻击命中时：随机驱散敌方1个强化效果"
	},
	"I389": {
		"id": "darkBook",
		"name": "佐西莫斯",
		"shape": [
			[
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
		],
		"sourceName": "佐西莫斯",
		"rarity": 5,
		"minAttack": 18,
		"maxAttack": 22,
		"hitRate": 0.9,
		"attackInterval": 2.8,
		"ultimateGain": 2,
		"weaponTypes": [
			"杖"
		],
		"synergyText": "配置在∧的武器攻击每命中3回：自身刻印 +1\n精灵攻击时：不消耗奥义值\n自身每拥有10层刻印，精灵的伤害 +5",
		"synergyRules": [
			{
				"id": "setElfUltimateGainZero",
				"trigger": "layout",
				"conditions": [
					{
						"id": "elfWeapons",
						"kind": "count",
						"filter": {
							"weaponTypes": [
								"精灵"
							]
						},
						"includeSelf": true,
						"min": 1
					}
				],
				"effects": [
					{
						"target": "matches",
						"conditionId": "elfWeapons",
						"stat": "ultimateGain",
						"operation": "set",
						"value": 0
					}
				]
			}
		],
		"combatRules": [
			{
				"id": "nearbyWeaponEvery3HitsAddMark",
				"trigger": "afterLinkedWeaponHit",
				"every": 3,
				"conditions": [
					{
						"kind": "linkedWeapon",
						"directions": [
							"up",
							"down",
							"left",
							"right"
						],
						"distance": 1,
						"filter": {}
					}
				],
				"effects": [
					{
						"type": "applyStatus",
						"target": "player",
						"status": "mark",
						"stacks": 1
					}
				]
			},
			{
				"id": "markBonusForElves",
				"trigger": "battleStart",
				"conditions": [],
				"effects": [
					{
						"type": "statusDamageBonus",
						"id": "markBonus",
						"status": "mark",
						"every": 10,
						"value": 5,
						"weaponTypes": [
							"精灵"
						]
					}
				]
			}
		]
	},
	"I390": {
		"id": "largeDropStaff",
		"name": "安心与信赖的红箱御守",
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
		],
		"sourceName": "安心与信赖的红箱御守",
		"rarity": 5,
		"minAttack": 4,
		"maxAttack": 8,
		"hitRate": 0.95,
		"attackInterval": 2,
		"ultimateGain": 5,
		"weaponTypes": [
			"枪"
		],
		"synergyText": "战斗后获得的金币增加1倍",
		"combatRules": [
			{
				"id": "doubleGold",
				"trigger": "battleEnd",
				"conditions": [],
				"effects": [
					{
						"type": "goldMultiplier",
						"value": 1
					}
				]
			}
		]
	},
	"I391": {
		"id": "bigRedPotion",
		"name": "全能药",
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
		],
		"sourceName": "全能药",
		"rarity": 2,
		"minAttack": null,
		"maxAttack": null,
		"hitRate": null,
		"attackInterval": null,
		"ultimateGain": null,
		"weaponTypes": [
			"饮料"
		],
		"synergyText": "生命值跌落到1/3以下时，仅生效一次：回复10HP/5秒内武器伤害+2/发动∧的饮料效果",
		"combatRules": [
			{
				"id": "lowHpTriggerOnce",
				"trigger": "afterTakeDamage",
				"once": true,
				"conditions": [
					{
						"kind": "hpPercent",
						"target": "self",
						"operator": "lte",
						"value": 0.3333
					}
				],
				"effects": [
					{
						"type": "heal",
						"target": "self",
						"value": 10
					},
					{
						"type": "modifyWeaponStat",
						"weaponTarget": "all",
						"stat": "attack",
						"operation": "add",
						"value": 2,
						"durationTicks": 500
					},
					{
						"type": "triggerWeaponEffects",
						"directions": [
							"up"
						],
						"distance": 1,
						"filter": {
							"weaponTypes": [
								"饮料"
							]
						}
					}
				]
			}
		]
	},
	"I393": {
		"id": "electricEel",
		"name": "海鳗",
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
		"image": "project/images/electricEel.png",
		"imageCrop": [
			8,
			4,
			125,
			301,
			312,
			312
		],
		"sourceName": "海鳗",
		"rarity": 4,
		"minAttack": 13,
		"maxAttack": 18,
		"hitRate": 0.75,
		"attackInterval": 2.8,
		"ultimateGain": 5,
		"weaponTypes": [
			"斧",
			"食物"
		],
		"synergyText": "攻击命中时：敌方虚脱 +1/黑暗 +1/拥有的强化效果层数减半\n每有2个配置在∧内的食物，自身使用间隔-0.1",
		"combatRules": [
			{
				"id": "hitApplyDebuffsAndDispel",
				"trigger": "afterHit",
				"conditions": [],
				"effects": [
					{
						"type": "applyStatus",
						"target": "opponent",
						"status": "exhaustion",
						"stacks": 1
					},
					{
						"type": "applyStatus",
						"target": "opponent",
						"status": "darkness",
						"stacks": 1
					},
					{
						"type": "dispelBuffPercent",
						"target": "opponent",
						"percent": 0.5
					}
				]
			}
		],
		"synergyRules": [
			{
				"id": "foodReducesInterval",
				"trigger": "layout",
				"conditions": [
					{
						"id": "nearbyFoods",
						"kind": "nearby",
						"relation": "orthogonal",
						"directions": [
							"up",
							"down",
							"left",
							"right"
						],
						"distance": 1,
						"filter": {
							"weaponTypes": [
								"食物"
							]
						},
						"min": 2
					}
				],
				"effects": [
					{
						"target": "self",
						"stat": "attackInterval",
						"operation": "add",
						"value": -0.1,
						"stacksFrom": {
							"kind": "matchCount",
							"conditionId": "nearbyFoods",
							"divisor": 2
						}
					}
				]
			}
		]
	},
	"I394": {
		"id": "dropStaff",
		"name": "祈愿滚箱的金箱御守",
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
		],
		"sourceName": "祈愿滚箱的金箱御守",
		"rarity": 3,
		"minAttack": 2,
		"maxAttack": 3,
		"hitRate": 0.95,
		"attackInterval": 2.3,
		"ultimateGain": 2,
		"weaponTypes": [
			"枪"
		],
		"synergyText": "战斗后获得的金币增加0.5倍",
		"combatRules": [
			{
				"id": "doubleGold",
				"trigger": "battleEnd",
				"conditions": [],
				"effects": [
					{
						"type": "goldMultiplier",
						"value": 0.5
					}
				]
			}
		]
	},
	"I395": {
		"id": "fangTian",
		"name": "方天画戟",
		"shape": [
			[
				1
			],
			[
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
		],
		"sourceName": "方天画戟",
		"rarity": 5,
		"minAttack": 9,
		"maxAttack": 12,
		"hitRate": 1,
		"attackInterval": 0.7,
		"ultimateGain": 6,
		"weaponTypes": [
			"拳"
		],
		"combatRules": [
			{
				"id": "attackSelfDamage5",
				"trigger": "afterAttack",
				"conditions": [],
				"effects": [
					{
						"type": "damageSelf",
						"value": 5
					}
				]
			},
			{
				"id": "hpBelow80DamageUp",
				"trigger": "beforeAttack",
				"conditions": [
					{
						"kind": "hpPercent",
						"target": "self",
						"operator": "lte",
						"value": 0.8
					}
				],
				"effects": [
					{
						"type": "modifyAttackDamage",
						"operation": "add",
						"value": 10
					}
				]
			}
		],
		"synergyText": "攻击后自身hp-5\n自身hp在80%以下时，伤害增加10点"
	},
	"I396": {
		"id": "windDagger",
		"name": "劫风之翼锐",
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
		],
		"sourceName": "劫风之翼锐",
		"rarity": 4,
		"minAttack": 4,
		"maxAttack": 6,
		"hitRate": 0.85,
		"attackInterval": 1.4,
		"ultimateGain": 5,
		"weaponTypes": [
			"短"
		],
		"synergyText": "每攻击5次，自身和配置在∧的武器间隔-0.1",
		"combatRules": [
			{
				"id": "intervalReduceEvery5Hits",
				"trigger": "afterHit",
				"every": 5,
				"conditions": [],
				"effects": [
					{
						"type": "modifyWeaponStat",
						"stat": "attackInterval",
						"operation": "add",
						"value": -0.1,
						"weaponTarget": "nearby",
						"directions": [
							"up",
							"down"
						],
						"distance": 1
					}
				]
			}
		]
	},
	"I397": {
		"id": "windGuitar",
		"name": "残暴之血",
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
		"image": "project/images/windGuitar.png",
		"imageCrop": [
			2,
			13,
			77,
			278,
			312,
			312
		],
		"sourceName": "残暴之血",
		"rarity": 4,
		"minAttack": 5,
		"maxAttack": 10,
		"hitRate": 0.95,
		"attackInterval": 1.8,
		"ultimateGain": 5,
		"weaponTypes": [
			"斧",
			"吉他"
		],
		"synergyText": "攻击命中时：有吉他配置在∧时，驱散敌方1个强化效果\n奥义发动时：自身拥有10层以上激奏时，敌方黑暗 +3\n每拥有1层激奏，伤害 +1",
		"combatRules": [
			{
				"id": "hitDispelsIfGuitarAbove",
				"trigger": "afterHit",
				"conditions": [
					{
						"kind": "nearbyCount",
						"relation": "sideBox",
						"directions": [
							"up"
						],
						"distance": 1,
						"span": 3,
						"filter": {
							"weaponTypes": [
								"吉他"
							]
						},
						"operator": "gte",
						"value": 1
					}
				],
				"effects": [
					{
						"type": "dispelRandomBuff",
						"target": "opponent"
					}
				]
			},
			{
				"id": "ultimateDarknessIfExcitation10",
				"trigger": "afterUltimate",
				"conditions": [
					{
						"kind": "status",
						"target": "player",
						"status": "excitation",
						"operator": "gte",
						"value": 10
					}
				],
				"effects": [
					{
						"type": "applyStatus",
						"target": "opponent",
						"status": "darkness",
						"stacks": 3
					}
				]
			},
			{
				"id": "excitationDamageBonus",
				"trigger": "battleStart",
				"effects": [
					{
						"type": "statusDamageBonus",
						"id": "excitationBonus",
						"status": "excitation",
						"every": 1,
						"value": 1
					}
				]
			}
		]
	},
	"I398": {
		"id": "windGun",
		"name": "提亚玛特弩枪·玛格纳",
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
		],
		"sourceName": "提亚玛特弩枪·玛格纳",
		"rarity": 3,
		"minAttack": 10,
		"maxAttack": 15,
		"hitRate": 0.75,
		"attackInterval": 4,
		"ultimateGain": 5,
		"weaponTypes": [
			"铳"
		],
		"combatRules": {
			"id": "hitAddsExhaustion",
			"trigger": "afterHit",
			"conditions": [],
			"effects": [
				{
					"type": "applyStatus",
					"target": "opponent",
					"status": "exhaustion",
					"stacks": 1
				}
			]
		},
		"synergyText": "攻击命中时：敌方虚脱+1"
	},
	"I399": {
		"id": "giBao",
		"name": "穿心枪盖尔伯格",
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
		],
		"sourceName": "穿心枪盖尔伯格",
		"rarity": 5,
		"minAttack": 10,
		"maxAttack": 15,
		"hitRate": 1,
		"attackInterval": 1.8,
		"ultimateGain": 5,
		"weaponTypes": [
			"枪"
		],
		"synergyText": "攻击时：20%概率使该武器伤害 +30，每有一个配置在∧内的武器，该发动概率 +20%\n本武器攻击必定命中（不受黑暗效果影响）",
		"combatRules": [
			{
				"id": "chanceDamageBoost",
				"trigger": "beforeAttack",
				"conditions": [
					{
						"kind": "chance",
						"base": 0.2,
						"nearbyBonus": 0.2,
						"relation": "sideBox",
						"directions": [
							"up",
							"down"
						],
						"distance": 1,
						"span": 3
					}
				],
				"effects": [
					{
						"type": "modifyAttackDamage",
						"operation": "add",
						"value": 30
					}
				]
			},
			{
				"id": "guaranteeHit",
				"trigger": "beforeAttack",
				"effects": [
					{
						"type": "guaranteeHit"
					}
				]
			}
		]
	},
	"I400": {
		"id": "lightSword",
		"name": "修瓦利耶之剑·玛格纳",
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
		],
		"sourceName": "修瓦利耶之剑·玛格纳",
		"rarity": 3,
		"minAttack": 3,
		"maxAttack": 6,
		"hitRate": 0.8,
		"attackInterval": 1.6,
		"ultimateGain": 5,
		"weaponTypes": [
			"剑"
		],
		"combatRules": [
			{
				"id": "hitHealSelf",
				"trigger": "afterHit",
				"conditions": [],
				"effects": [
					{
						"type": "heal",
						"target": "self",
						"value": 2
					},
					{
						"type": "modifyBattleMaxHp",
						"target": "self",
						"value": 3
					}
				]
			}
		],
		"synergyText": "攻击命中时：自身hp+2,最大hp+3"
	},
	"I401": {
		"id": "lightDragonFist",
		"name": "威光之逆鳞",
		"shape": [
			[
				1
			],
			[
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
		],
		"sourceName": "威光之逆鳞",
		"rarity": 4,
		"minAttack": 3,
		"maxAttack": 4,
		"hitRate": 0.95,
		"attackInterval": 0.9,
		"ultimateGain": 1,
		"weaponTypes": [
			"拳"
		],
		"combatRules": [
			{
				"id": "battleStartRegenHighSpiritMaxHp",
				"trigger": "battleStart",
				"effects": [
					{
						"type": "applyStatus",
						"target": "self",
						"status": "regeneration",
						"stacks": 5
					},
					{
						"type": "applyStatus",
						"target": "self",
						"status": "highSpirit",
						"stacks": 5
					},
					{
						"type": "modifyBattleMaxHp",
						"target": "self",
						"value": 25
					}
				]
			}
		],
		"synergyText": "战斗开始时：自身再生 +5,高扬 +5，最大hp+25"
	},
	"I402": {
		"id": "pan",
		"name": "圣诞炒锅",
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
		],
		"sourceName": "圣诞炒锅",
		"rarity": 3,
		"minAttack": 4,
		"maxAttack": 6,
		"hitRate": 0.8,
		"attackInterval": 2.8,
		"ultimateGain": 5,
		"weaponTypes": [
			"剑"
		],
		"synergyText": "∧每配置一个食物，伤害+1；\n∧配置的食物使用间隔-0.1",
		"synergyRules": [
			{
				"id": "foodBonusSelfAttack",
				"trigger": "layout",
				"conditions": [
					{
						"id": "nearbyFoods",
						"kind": "nearby",
						"relation": "orthogonal",
						"directions": [
							"up",
							"down",
							"left",
							"right"
						],
						"distance": 1,
						"filter": {
							"weaponTypes": [
								"食物"
							]
						},
						"min": 1
					}
				],
				"effects": [
					{
						"target": "self",
						"stat": "attack",
						"operation": "add",
						"value": 1,
						"perMatch": true,
						"conditionId": "nearbyFoods"
					}
				]
			},
			{
				"id": "foodIntervalReduce",
				"trigger": "layout",
				"conditions": [
					{
						"id": "nearbyFoods2",
						"kind": "nearby",
						"relation": "orthogonal",
						"directions": [
							"up",
							"down",
							"left",
							"right"
						],
						"distance": 1,
						"filter": {
							"weaponTypes": [
								"食物"
							]
						},
						"min": 1
					}
				],
				"effects": [
					{
						"target": "matches",
						"conditionId": "nearbyFoods2",
						"stat": "attackInterval",
						"operation": "add",
						"value": -0.1
					}
				]
			}
		]
	},
	"I403": {
		"id": "fireBass",
		"name": "Flying A",
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
		],
		"sourceName": "Flying A",
		"rarity": 4,
		"minAttack": 5,
		"maxAttack": 10,
		"hitRate": 0.95,
		"attackInterval": 1.8,
		"ultimateGain": 5,
		"weaponTypes": [
			"斧",
			"吉他"
		],
		"synergyText": "攻击命中时：有吉他配置在∧时，敌方黑暗 +1\n奥义发动时：自身拥有10层以上激奏时，每有1个配置在∧的吉他，自身高扬 +2\n每拥有1层激奏，伤害 +1",
		"combatRules": [
			{
				"id": "hitDarknessIfGuitarAbove",
				"trigger": "afterHit",
				"conditions": [
					{
						"kind": "nearbyCount",
						"relation": "sideBox",
						"directions": [
							"up"
						],
						"distance": 1,
						"span": 3,
						"filter": {
							"weaponTypes": [
								"吉他"
							]
						},
						"operator": "gte",
						"value": 1
					}
				],
				"effects": [
					{
						"type": "applyStatus",
						"target": "opponent",
						"status": "darkness",
						"stacks": 1
					}
				]
			},
			{
				"id": "ultimateHighSpiritPerGuitar",
				"trigger": "afterUltimate",
				"conditions": [
					{
						"kind": "status",
						"target": "player",
						"status": "excitation",
						"operator": "gte",
						"value": 10
					}
				],
				"effects": [
					{
						"type": "applyStatus",
						"target": "self",
						"status": "highSpirit",
						"stacksFrom": {
							"kind": "nearbyCount",
							"relation": "sideBox",
							"directions": [
								"up"
							],
							"distance": 1,
							"span": 3,
							"filter": {
								"weaponTypes": [
									"吉他"
								]
							},
							"multiplier": 2
						}
					}
				]
			},
			{
				"id": "excitationDamageBonus",
				"trigger": "battleStart",
				"effects": [
					{
						"type": "statusDamageBonus",
						"id": "excitationBonus",
						"status": "excitation",
						"every": 1,
						"value": 1
					}
				]
			}
		]
	},
	"I404": {
		"id": "fireGuitar",
		"name": "远走高飞",
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
		],
		"sourceName": "远走高飞",
		"rarity": 4,
		"minAttack": 5,
		"maxAttack": 10,
		"hitRate": 0.95,
		"attackInterval": 1.8,
		"ultimateGain": 5,
		"weaponTypes": [
			"斧",
			"吉他"
		],
		"synergyText": "攻击命中时：有乐器配置在∧时，敌方格挡-10\n奥义发动时：自身拥有10层以上激奏时，本次伤害+10\n每拥有1层激奏，伤害+1",
		"combatRules": [
			{
				"id": "hitRemoveBlockIfGuitarAbove",
				"trigger": "afterHit",
				"conditions": [
					{
						"kind": "nearbyCount",
						"relation": "sideBox",
						"directions": [
							"up"
						],
						"distance": 1,
						"span": 3,
						"filter": {
							"weaponTypes": [
								"吉他"
							]
						},
						"operator": "gte",
						"value": 1
					}
				],
				"effects": [
					{
						"type": "removeStatus",
						"target": "opponent",
						"status": "block",
						"stacks": 10
					}
				]
			},
			{
				"id": "ultimateDamageBoostIfExcitation10",
				"trigger": "beforeAttack",
				"conditions": [
					{
						"kind": "attackOrigin",
						"value": "ultimate"
					},
					{
						"kind": "status",
						"target": "player",
						"status": "excitation",
						"operator": "gte",
						"value": 10
					}
				],
				"effects": [
					{
						"type": "modifyAttackDamage",
						"operation": "add",
						"value": 10
					}
				]
			},
			{
				"id": "excitationDamageBonus",
				"trigger": "battleStart",
				"effects": [
					{
						"type": "statusDamageBonus",
						"id": "excitationBonus",
						"status": "excitation",
						"every": 1,
						"value": 1
					}
				]
			}
		]
	},
	"I405": {
		"id": "machineGodShield",
		"name": "月丘",
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
		],
		"sourceName": "月丘",
		"rarity": 4,
		"minAttack": null,
		"maxAttack": null,
		"hitRate": null,
		"attackInterval": null,
		"ultimateGain": null,
		"weaponTypes": [
			"盾"
		],
		"synergyText": "被攻击时：20%概率降低受到的7点伤害\n被攻击时：自身再生 +1,奥义值 +10%,敌方奥义值 -10%\n配置在∧的盾牌的被攻击效果发动时：自身格挡 +1",
		"combatRules": [
			{
				"id": "defenseDamageReduction",
				"trigger": "beforeReceiveDamage",
				"conditions": [
					{
						"kind": "chance",
						"base": 0.2
					}
				],
				"effects": [
					{
						"type": "modifyReceivedDamage",
						"operation": "add",
						"value": -7
					}
				]
			},
			{
				"id": "defenseOtherEffects",
				"trigger": "beforeReceiveDamage",
				"conditions": [],
				"effects": [
					{
						"type": "applyStatus",
						"target": "self",
						"status": "regeneration",
						"stacks": 1
					},
					{
						"type": "modifyUltimate",
						"operation": "add",
						"value": 10
					},
					{
						"type": "modifyUltimate",
						"operation": "percent",
						"value": -0.1,
						"target": "enemy"
					}
				]
			},
			{
				"id": "shieldTriggeredBlock",
				"trigger": "afterShieldEffect",
				"conditions": [
					{
						"kind": "nearbyShieldTriggered",
						"directions": [
							"left",
							"right"
						],
						"distance": 1,
						"filter": {
							"weaponTypes": [
								"盾"
							]
						}
					}
				],
				"effects": [
					{
						"type": "applyStatus",
						"target": "self",
						"status": "block",
						"stacks": 1
					}
				]
			}
		]
	},
	"I406": {
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
		],
		"sourceName": "金刚晶",
		"rarity": 5,
		"minAttack": null,
		"maxAttack": null,
		"hitRate": null,
		"attackInterval": 8,
		"ultimateGain": null,
		"weaponTypes": [
			"道具"
		],
		"combatRules": [
			{
				"id": "attackGainRandomBuffs",
				"trigger": "afterAttack",
				"conditions": [],
				"effects": [
					{
						"type": "applyRandomBuffs",
						"target": "self",
						"count": 6,
						"stacks": 1
					}
				]
			}
		],
		"synergyText": "攻击后随机获得6个buff"
	},
	"I407": {
		"id": "goldJar",
		"name": "金色史莱姆铃铛",
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
		],
		"sourceName": "金色史莱姆铃铛",
		"rarity": 5,
		"minAttack": 6,
		"maxAttack": 11,
		"hitRate": 0.95,
		"attackInterval": 2.6,
		"ultimateGain": 3,
		"weaponTypes": [
			"乐器"
		],
		"synergyText": "配置在∧的武器每攻击3回时：自身回复5hp，再生 +1，最大hp+5，随机获得3个buff",
		"combatRules": [
			{
				"id": "sideWeaponHitsTriggerHealRegenBuffs",
				"trigger": "afterLinkedWeaponHit",
				"every": 3,
				"conditions": [
					{
						"kind": "linkedWeapon",
						"directions": [
							"left",
							"right"
						],
						"distance": 1,
						"filter": {}
					}
				],
				"effects": [
					{
						"type": "heal",
						"target": "self",
						"value": 5
					},
					{
						"type": "modifyBattleMaxHp",
						"value": 5
					},
					{
						"type": "applyStatus",
						"target": "self",
						"status": "regeneration",
						"stacks": 1
					},
					{
						"type": "applyRandomBuffs",
						"target": "self",
						"count": 3,
						"stacks": 1
					}
				]
			}
		]
	},
	"I408": {
		"id": "spiritFireDragon",
		"name": "迷你威尔纳斯",
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
		],
		"sourceName": "迷你威尔纳斯",
		"rarity": 4,
		"minAttack": 11,
		"maxAttack": 17,
		"hitRate": 1,
		"attackInterval": 4.3,
		"ultimateGain": -30,
		"weaponTypes": [
			"精灵"
		],
		"synergyText": "战斗开始时，周围每有一把武器或精灵，使敌人烧伤+2",
		"combatRules": [
			{
				"id": "burn10Dispel",
				"trigger": "beforeAttack",
				"conditions": [
					{
						"kind": "status",
						"target": "enemy",
						"status": "burn",
						"operator": "gte",
						"value": 10
					}
				],
				"effects": [
					{
						"type": "dispelRandomBuff",
						"target": "opponent"
					}
				]
			},
			{
				"id": "hitBurn2",
				"trigger": "afterHit",
				"conditions": [],
				"effects": [
					{
						"type": "applyStatus",
						"target": "opponent",
						"status": "burn",
						"stacks": 2
					}
				]
			},
			{
				"id": "mark5IgnoreBlock",
				"trigger": "beforeAttack",
				"conditions": [
					{
						"kind": "status",
						"target": "self",
						"status": "mark",
						"operator": "gte",
						"value": 5
					}
				],
				"effects": [
					{
						"type": "ignoreBlock"
					}
				]
			}
		]
	},
	"I409": {
		"id": "spiritEuropa",
		"name": "迷你欧罗巴",
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
		],
		"sourceName": "迷你欧罗巴",
		"rarity": 3,
		"minAttack": 8,
		"maxAttack": 13,
		"hitRate": 1,
		"attackInterval": 3.8,
		"ultimateGain": -20,
		"weaponTypes": [
			"精灵"
		],
		"synergyText": "攻击命中时：敌方冰结 +2\n敌方每有10层冰结，自身攻击次数+1\n自身刻印5层以上时，攻击无视敌方格挡",
		"combatRules": [
			{
				"id": "hitIce2",
				"trigger": "afterHit",
				"conditions": [],
				"effects": [
					{
						"type": "applyStatus",
						"target": "opponent",
						"status": "ice",
						"stacks": 2
					}
				]
			},
			{
				"id": "iceExtraAttack",
				"trigger": "battleStart",
				"conditions": [],
				"effects": [
					{
						"type": "statusExtraAttack",
						"id": "iceExtraAttack",
						"target": "enemy",
						"status": "ice",
						"every": 10,
						"value": 1
					}
				]
			},
			{
				"id": "mark5IgnoreBlock",
				"trigger": "beforeAttack",
				"conditions": [
					{
						"kind": "status",
						"target": "self",
						"status": "mark",
						"operator": "gte",
						"value": 5
					}
				],
				"effects": [
					{
						"type": "ignoreBlock"
					}
				]
			}
		]
	},
	"I410": {
		"id": "blueDagger",
		"name": "冰之骑士",
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
		],
		"sourceName": "冰之骑士",
		"rarity": 3,
		"minAttack": 4,
		"maxAttack": 8,
		"hitRate": 0.85,
		"attackInterval": 1.2,
		"ultimateGain": 5,
		"weaponTypes": [
			"短"
		],
		"combatRules": [
			{
				"id": "hitIce1",
				"trigger": "afterHit",
				"conditions": [],
				"effects": [
					{
						"type": "applyStatus",
						"target": "opponent",
						"status": "ice",
						"stacks": 1
					}
				]
			},
			{
				"id": "every2HitsAddDamage",
				"trigger": "afterHit",
				"every": 2,
				"conditions": [],
				"effects": [
					{
						"type": "modifyWeaponStat",
						"stat": "attack",
						"operation": "add",
						"value": 1
					}
				]
			},
			{
				"id": "iceDamageBonus",
				"trigger": "battleStart",
				"conditions": [],
				"effects": [
					{
						"type": "statusDamageBonus",
						"id": "iceBonus",
						"target": "enemy",
						"status": "ice",
						"every": 1,
						"value": 1
					}
				]
			}
		],
		"synergyText": "攻击命中时：敌方冰结 +1\n攻击每发动2次，伤害 +1\n敌方每有1层冰洁，伤害 +1"
	},
	"I411": {
		"id": "comboDagger",
		"name": "神尽克尽·无量慈悲",
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
		],
		"sourceName": "神尽克尽·无量慈悲",
		"rarity": 5,
		"minAttack": 5,
		"maxAttack": 9,
		"hitRate": 0.85,
		"attackInterval": 1.2,
		"ultimateGain": 5,
		"weaponTypes": [
			"短"
		],
		"synergyText": "攻击命中时：敌方火伤 +1\n敌方每有1层火伤，自身伤害 +1\n敌方每有5层火伤，配置在∧的武器伤害 +1",
		"synergyRules": null,
		"combatRules": [
			{
				"id": "hitBurn1",
				"trigger": "afterHit",
				"effects": [
					{
						"type": "applyStatus",
						"target": "opponent",
						"status": "burn",
						"stacks": 1
					}
				]
			},
			{
				"id": "burnDamageSelf",
				"trigger": "battleStart",
				"effects": [
					{
						"type": "statusDamageBonus",
						"id": "burnSelf",
						"target": "enemy",
						"status": "burn",
						"every": 1,
						"value": 1
					}
				]
			},
			{
				"id": "burnDamageVertical",
				"trigger": "battleStart",
				"effects": [
					{
						"type": "statusDamageBonus",
						"id": "burnVertical",
						"scope": "nearby",
						"target": "enemy",
						"status": "burn",
						"every": 5,
						"value": 1,
						"directions": [
							"up",
							"down"
						],
						"distance": 1
					}
				]
			}
		]
	},
	"I412": {
		"id": "pie",
		"name": "雅雅的炒饭",
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
		],
		"sourceName": "雅雅的炒饭",
		"rarity": 4,
		"minAttack": 10,
		"maxAttack": 13,
		"hitRate": 0.8,
		"attackInterval": 2.5,
		"ultimateGain": 5,
		"weaponTypes": [
			"剑",
			"食物"
		],
		"synergyText": "战后获得金币增加5点\n攻击时：随机消耗10个强化效果使∧内食物发动次数+1\n∧内每配置一个食物，本武器伤害+3",
		"synergyRules": [
			{
				"id": "rightFoodBoostsMeal",
				"trigger": "layout",
				"conditions": [
					{
						"id": "rightFoods",
						"kind": "nearby",
						"relation": "sideBox",
						"directions": [
							"right"
						],
						"distance": 4,
						"span": 4,
						"filter": {
							"weaponTypes": [
								"食物"
							]
						},
						"min": 1
					}
				],
				"effects": [
					{
						"target": "self",
						"stat": "attack",
						"operation": "add",
						"value": 3,
						"perMatch": true,
						"conditionId": "rightFoods"
					}
				]
			}
		],
		"combatRules": [
			{
				"id": "goldBonus5",
				"trigger": "battleEnd",
				"effects": [
					{
						"type": "goldBonus",
						"value": 5
					}
				]
			},
			{
				"id": "consumeBuffsAddExtraAttack",
				"trigger": "beforeAttack",
				"conditions": [
					{
						"kind": "buffStacks",
						"operator": "gte",
						"value": 10
					}
				],
				"effects": [
					{
						"type": "consumeBuffs",
						"count": 10
					},
					{
						"type": "addExtraAttack",
						"directions": [
							"right"
						],
						"distance": 4,
						"filter": {
							"weaponTypes": [
								"食物"
							]
						}
					}
				]
			},
			{
				"id": "nearbyFoodDamage",
				"trigger": "battleStart",
				"effects": [
					{
						"type": "nearbyDamageBonus",
						"id": "foodDamage",
						"relation": "sideBox",
						"directions": [
							"right"
						],
						"distance": 4,
						"span": 4,
						"filter": {
							"weaponTypes": [
								"食物"
							]
						},
						"value": 3
					}
				]
			}
		]
	},
	"I413": {
		"id": "crab",
		"name": "红色帝王蟹",
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
		"image": "project/images/crab.png",
		"imageCrop": [
			1,
			3,
			153,
			271,
			312,
			312
		],
		"sourceName": "红色帝王蟹",
		"rarity": 4,
		"minAttack": 9,
		"maxAttack": 13,
		"hitRate": 0.8,
		"attackInterval": 3,
		"ultimateGain": 5,
		"weaponTypes": [
			"剑",
			"食物"
		],
		"synergyText": "攻击命中时：敌方格挡和反射-8层，随机驱散1个强化效果\n∧每配置2个食物，本物品攻击次数+1\n本武器的伤害无视敌方的格挡",
		"combatRules": [
			{
				"id": "hitRemoveBlockReflectionAndDispel",
				"trigger": "afterHit",
				"effects": [
					{
						"type": "removeStatus",
						"target": "opponent",
						"status": "block",
						"stacks": 8
					},
					{
						"type": "removeStatus",
						"target": "opponent",
						"status": "reflection",
						"stacks": 8
					},
					{
						"type": "dispelBuff",
						"target": "opponent"
					}
				]
			},
			{
				"id": "nearbyFoodExtraAttack",
				"trigger": "battleStart",
				"effects": [
					{
						"type": "nearbyExtraAttack",
						"id": "foodExtra",
						"directions": [
							"up",
							"down",
							"left",
							"right"
						],
						"distance": 1,
						"filter": {
							"weaponTypes": [
								"食物"
							]
						},
						"every": 2,
						"value": 1
					}
				]
			},
			{
				"id": "alwaysIgnoreBlock",
				"trigger": "battleStart",
				"effects": [
					{
						"type": "ignoreBlockAlways"
					}
				]
			}
		]
	},
	"I414": {
		"id": "sevenStarSword",
		"name": "七星剣・煌",
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
		],
		"sourceName": "七星剣・煌",
		"rarity": 4,
		"minAttack": 4,
		"maxAttack": 7,
		"hitRate": 0.8,
		"attackInterval": 1.3,
		"ultimateGain": 10,
		"weaponTypes": [
			"剑"
		],
		"combatRules": [
			{
				"id": "battleStartUltimate10",
				"trigger": "battleStart",
				"effects": [
					{
						"type": "modifyUltimate",
						"operation": "add",
						"value": 10
					}
				]
			},
			{
				"id": "onHitBlockChance",
				"trigger": "beforeReceiveDamage",
				"conditions": [
					{
						"kind": "chance",
						"base": 0.1
					}
				],
				"effects": [
					{
						"type": "applyStatus",
						"target": "self",
						"status": "block",
						"stacks": 2
					}
				]
			}
		],
		"synergyText": "战斗开始时：自身奥义值 +10\n被攻击时：10%概率自身格挡 +2"
	},
	"I415": {
		"id": "oilGun",
		"name": "亵渎的魔弹",
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
		],
		"sourceName": "亵渎的魔弹",
		"rarity": 5,
		"minAttack": 33,
		"maxAttack": 50,
		"hitRate": 0.75,
		"attackInterval": 3.4,
		"ultimateGain": 5,
		"weaponTypes": [
			"铳"
		],
		"synergyText": "攻击命中时：敌方黑暗 +1\n配置在∧的盾牌的被攻击效果发动时：本武器伤害+2，使用间隔-0.3",
		"combatRules": [
			{
				"id": "hitDarkness1",
				"trigger": "afterHit",
				"effects": [
					{
						"type": "applyStatus",
						"target": "opponent",
						"status": "darkness",
						"stacks": 1
					}
				]
			},
			{
				"id": "shieldDynamicBonus",
				"trigger": "beforeReceiveDamage",
				"effects": [
					{
						"type": "nearbyDamageBonus",
						"id": "shieldDmg",
						"directions": [
							"up",
							"down",
							"left",
							"right"
						],
						"distance": 1,
						"filter": {
							"weaponTypes": [
								"盾"
							]
						},
						"value": 2
					},
					{
						"type": "nearbyIntervalBonus",
						"id": "shieldInterval",
						"directions": [
							"up",
							"down",
							"left",
							"right"
						],
						"distance": 1,
						"filter": {
							"weaponTypes": [
								"盾"
							]
						},
						"value": -0.3
					}
				]
			}
		]
	},
	"I416": {
		"id": "oilAxe",
		"name": "雷神之锤",
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
		],
		"sourceName": "雷神之锤",
		"rarity": 5,
		"minAttack": 40,
		"maxAttack": 50,
		"hitRate": 0.5,
		"attackInterval": 4,
		"ultimateGain": 15,
		"weaponTypes": [
			"斧"
		],
		"synergyText": "每有1个配置在∧的物品，伤害 +5/使用间隔 -0.1\n狼皮效果中：命中率 +50%\n该武器造成的伤害无视敌方格挡",
		"synergyRules": [
			{
				"id": "nearbyWeaponBoost",
				"trigger": "layout",
				"conditions": [
					{
						"id": "nearbyAll",
						"kind": "nearby",
						"relation": "orthogonal",
						"directions": [
							"up",
							"down",
							"left",
							"right"
						],
						"distance": 1,
						"filter": {}
					}
				],
				"effects": [
					{
						"target": "self",
						"stat": "attack",
						"operation": "add",
						"value": 5,
						"perMatch": true,
						"conditionId": "nearbyAll"
					},
					{
						"target": "self",
						"stat": "attackInterval",
						"operation": "add",
						"value": -0.1,
						"perMatch": true,
						"conditionId": "nearbyAll"
					}
				]
			}
		],
		"combatRules": [
			{
				"id": "wolfSkinHitRate",
				"trigger": "beforeAttack",
				"effects": [
					{
						"type": "statusHitRateBonus",
						"status": "wolfSkin",
						"value": 0.5
					}
				]
			},
			{
				"id": "ignoreBlockAlways",
				"trigger": "battleStart",
				"effects": [
					{
						"type": "ignoreBlockAlways"
					}
				]
			}
		]
	},
	"I417": {
		"id": "oilBow",
		"name": "赫拉克勒斯",
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
		],
		"sourceName": "赫拉克勒斯",
		"rarity": 5,
		"minAttack": 7,
		"maxAttack": 11,
		"hitRate": 0.85,
		"attackInterval": 1,
		"ultimateGain": 5,
		"weaponTypes": [
			"弓"
		],
		"synergyText": "战斗开始时：配置在∧的武器攻击回数+1",
		"combatRules": [
			{
				"id": "hitDarkness1",
				"trigger": "afterHit",
				"effects": [
					{
						"type": "applyStatus",
						"target": "opponent",
						"status": "darkness",
						"stacks": 1
					}
				]
			},
			{
				"id": "addExtraAttackToNearbyOnce",
				"trigger": "beforeAttack",
				"once": true,
				"effects": [
					{
						"type": "addExtraAttack",
						"directions": [
							"up",
							"down"
						],
						"distance": 1,
						"filter": {}
					}
				]
			}
		]
	},
	"I418": {
		"id": "oilStaff",
		"name": "墨丘利的节杖",
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
		],
		"sourceName": "墨丘利的节杖",
		"rarity": 5,
		"minAttack": 9,
		"maxAttack": 15,
		"hitRate": 0.9,
		"attackInterval": 1.4,
		"ultimateGain": 2,
		"weaponTypes": [
			"杖"
		],
		"synergyText": "战斗开始时：自身MP +5\n攻击命中时：自身MP +3，回复3HP，再生+1，净化一个弱体状态\n奥义发动时：额外造成本次战斗中累计消耗的MP值×1的伤害\n黑之魅力效果中：攻击时，5秒内受到的伤害降至0，每场战斗只能触发1次",
		"combatRules": [
			{
				"trigger": "battleStart",
				"effects": [
					{
						"type": "applyStatus",
						"target": "self",
						"status": "mp",
						"stacks": 5
					}
				]
			},
			{
				"trigger": "afterHit",
				"effects": [
					{
						"type": "applyStatus",
						"target": "self",
						"status": "mp",
						"stacks": 3
					},
					{
						"type": "heal",
						"target": "self",
						"stacks": 3
					},
					{
						"type": "applyStatus",
						"target": "self",
						"status": "regeneration",
						"stacks": 1
					},
					{
						"type": "cleanseOneDebuff",
						"target": "self"
					}
				]
			},
			{
				"trigger": "afterUltimate",
				"effects": [
					{
						"type": "dealMpConsumedDamage",
						"multiplier": 1
					}
				]
			},
			{
				"trigger": "afterAttack",
				"conditions": [
					{
						"kind": "status",
						"target": "self",
						"status": "blackCharm",
						"operator": "gte",
						"value": 1
					}
				],
				"once": true,
				"effects": [
					{
						"type": "setInvincible",
						"durationTicks": 500
					}
				]
			}
		]
	},
	"I419": {
		"id": "waterDagger",
		"name": "利维坦之视·玛格纳",
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
		],
		"sourceName": "利维坦之视·玛格纳",
		"rarity": 3,
		"minAttack": 2,
		"maxAttack": 4,
		"hitRate": 0.85,
		"attackInterval": 1.4,
		"ultimateGain": 5,
		"weaponTypes": [
			"短"
		],
		"combatRules": [
			{
				"id": "hitIce1",
				"trigger": "afterHit",
				"conditions": [],
				"effects": [
					{
						"type": "applyStatus",
						"target": "opponent",
						"status": "ice",
						"stacks": 1
					}
				]
			}
		],
		"synergyText": "攻击命中时：敌方冰结+1"
	},
	"I420": {
		"id": "waterDragonUmbrella",
		"name": "水祸之丽伞",
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
		"image": "project/images/waterDragonUmbrella.png",
		"imageCrop": [
			11,
			3,
			132,
			231,
			312,
			312
		],
		"sourceName": "水祸之丽伞",
		"rarity": 4,
		"minAttack": 9,
		"maxAttack": 13,
		"hitRate": 0.75,
		"attackInterval": 2.4,
		"ultimateGain": 5,
		"weaponTypes": [
			"斧"
		],
		"combatRules": [
			{
				"id": "battleStartMaxHp15",
				"trigger": "battleStart",
				"effects": [
					{
						"type": "modifyBattleMaxHp",
						"target": "self",
						"value": 15
					}
				]
			},
			{
				"id": "hitIceBlockHealDispel",
				"trigger": "afterHit",
				"effects": [
					{
						"type": "applyStatus",
						"target": "opponent",
						"status": "ice",
						"stacks": 1
					},
					{
						"type": "applyStatus",
						"target": "self",
						"status": "block",
						"stacks": 5
					},
					{
						"type": "heal",
						"target": "self",
						"value": 5
					},
					{
						"type": "dispelBuff",
						"target": "opponent"
					}
				]
			},
			{
				"id": "iceDamageBonus",
				"trigger": "battleStart",
				"effects": [
					{
						"type": "statusDamageBonus",
						"id": "iceBonus",
						"target": "enemy",
						"status": "ice",
						"every": 2,
						"value": 1
					}
				]
			}
		],
		"synergyText": "战斗开始时：自身最大HP+15\n攻击命中时：敌方冰结+1，自身格挡+5，自身hp+5，敌方强化效果随机1个无效化\n敌方每2层冰结伤害+1"
	},
	"I421": {
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
		],
		"sourceName": "天羽羽斩",
		"rarity": 5,
		"minAttack": 13,
		"maxAttack": 17,
		"hitRate": 1,
		"attackInterval": 1.5,
		"ultimateGain": 20,
		"weaponTypes": [
			"刀"
		],
		"synergyText": "攻击命中时：随机驱散敌方1个强化效果，自身反射 +1\n奥义发动时：30%概率使该武器的攻击发动9次，每有1把配置在∧的刀，发动概率 +10%\n该武器造成的伤害无视敌方格挡",
		"combatRules": [
			{
				"id": "hitDispelAndReflection",
				"trigger": "afterHit",
				"effects": [
					{
						"type": "dispelBuff",
						"target": "opponent"
					},
					{
						"type": "applyStatus",
						"target": "self",
						"status": "reflection",
						"stacks": 1
					}
				]
			},
			{
				"id": "ultimateRepeatAttack",
				"trigger": "afterUltimate",
				"conditions": [
					{
						"kind": "chance",
						"base": 0.3,
						"nearbyBonus": 0.1,
						"directions": [
							"up",
							"down",
							"left",
							"right"
						],
						"distance": 1,
						"filter": {
							"weaponTypes": [
								"刀"
							]
						}
					}
				],
				"effects": [
					{
						"type": "repeatAttack",
						"count": 8
					}
				]
			},
			{
				"id": "ignoreBlockAlways",
				"trigger": "battleStart",
				"effects": [
					{
						"type": "ignoreBlockAlways"
					}
				]
			}
		]
	},
	"I422": {
		"id": "bronzeShield",
		"name": "真龙之盾",
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
		],
		"sourceName": "真龙之盾",
		"rarity": 3,
		"minAttack": null,
		"maxAttack": null,
		"hitRate": null,
		"attackInterval": null,
		"ultimateGain": null,
		"weaponTypes": [
			"盾"
		],
		"synergyText": "被攻击时：20%概率降低受到的5点伤害\n被攻击时：自身反射+1",
		"combatRules": [
			{
				"id": "chanceReduceDamage",
				"trigger": "beforeReceiveDamage",
				"conditions": [
					{
						"kind": "chance",
						"base": 0.2
					}
				],
				"effects": [
					{
						"type": "modifyReceivedDamage",
						"operation": "add",
						"value": -5
					}
				]
			},
			{
				"id": "onHitAddReflection",
				"trigger": "beforeReceiveDamage",
				"conditions": [],
				"effects": [
					{
						"type": "applyStatus",
						"target": "self",
						"status": "reflection",
						"stacks": 1
					}
				]
			}
		]
	},
	"I423": {
		"id": "earthDragonStaff",
		"name": "巖迫之躯杖",
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
		],
		"sourceName": "巖迫之躯杖",
		"rarity": 4,
		"minAttack": 6,
		"maxAttack": 12,
		"hitRate": 0.75,
		"attackInterval": 1.9,
		"ultimateGain": 2,
		"weaponTypes": [
			"杖"
		],
		"synergyText": "被攻击时：配置3个以上同名道具时，自身格挡+5，随机驱散敌方1个强化效果\n配置3个以上同名道具时，伤害+5",
		"synergyRules": null,
		"combatRules": [
			{
				"id": "defenseWhenSameName",
				"trigger": "beforeReceiveDamage",
				"conditions": [
					{
						"kind": "sameNameCount",
						"operator": "gte",
						"value": 3
					}
				],
				"effects": [
					{
						"type": "applyStatus",
						"target": "self",
						"status": "block",
						"stacks": 5
					},
					{
						"type": "dispelBuff",
						"target": "opponent"
					}
				]
			},
			{
				"id": "sameNameDamageBonus",
				"trigger": "battleStart",
				"effects": [
					{
						"type": "sameNameDamageBonus",
						"id": "sameNameAtk",
						"threshold": 3,
						"value": 5
					}
				]
			}
		]
	},
	"I424": {
		"id": "earthGirlSword",
		"name": "世界树的晶剑·玛格纳",
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
		],
		"sourceName": "世界树的晶剑·玛格纳",
		"rarity": 3,
		"minAttack": 3,
		"maxAttack": 5,
		"hitRate": 0.8,
		"attackInterval": 1.6,
		"ultimateGain": 5,
		"weaponTypes": [
			"剑"
		],
		"combatRules": [
			{
				"id": "hitCleanseOneDebuff",
				"trigger": "afterHit",
				"conditions": [],
				"effects": [
					{
						"type": "cleanseOneDebuff",
						"target": "self"
					}
				]
			}
		],
		"synergyText": "攻击命中时：随机净化自身1个debuff"
	},
	"I425": {
		"id": "silverShield",
		"name": "神意之盾",
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
		"image": "project/images/silverShield.png",
		"imageCrop": [
			2,
			7,
			151,
			220,
			312,
			312
		],
		"sourceName": "神意之盾",
		"rarity": 5,
		"minAttack": null,
		"maxAttack": null,
		"hitRate": null,
		"attackInterval": null,
		"ultimateGain": null,
		"weaponTypes": [
			"盾"
		],
		"synergyText": "被攻击时：20%概率降低受到的10点伤害/敌方耐力降低0.4\n∧的武器攻击时：格挡+2\n∧的武器的使用间隔 -0.2，伤害 +3",
		"synergyRules": [
			{
				"id": "nearbyWeaponBoost",
				"trigger": "layout",
				"conditions": [
					{
						"id": "nearbyWeapons",
						"kind": "nearby",
						"relation": "orthogonal",
						"directions": [
							"left",
							"right"
						],
						"distance": 1,
						"filter": {},
						"min": 1
					}
				],
				"effects": [
					{
						"target": "matches",
						"conditionId": "nearbyWeapons",
						"stat": "attackInterval",
						"operation": "add",
						"value": -0.2
					},
					{
						"target": "matches",
						"conditionId": "nearbyWeapons",
						"stat": "attack",
						"operation": "add",
						"value": 3
					}
				]
			}
		],
		"combatRules": [
			{
				"id": "chanceReduceDamage",
				"trigger": "beforeReceiveDamage",
				"conditions": [
					{
						"kind": "chance",
						"base": 0.2
					}
				],
				"effects": [
					{
						"type": "modifyReceivedDamage",
						"operation": "add",
						"value": -10
					}
				]
			},
			{
				"id": "nearbyWeaponHitGrantsBlock",
				"trigger": "afterLinkedWeaponHit",
				"conditions": [
					{
						"kind": "linkedWeapon",
						"directions": [
							"left",
							"right"
						],
						"distance": 1,
						"filter": {}
					}
				],
				"effects": [
					{
						"type": "applyStatus",
						"target": "self",
						"status": "block",
						"stacks": 2
					}
				]
			}
		]
	},
	"I426": {
		"id": "silverJar",
		"name": "银色史莱姆铃铛",
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
		],
		"sourceName": "银色史莱姆铃铛",
		"rarity": 3,
		"minAttack": 3,
		"maxAttack": 4,
		"hitRate": 0.95,
		"attackInterval": 3.1,
		"ultimateGain": 2,
		"weaponTypes": [
			"乐器"
		],
		"synergyText": "∧的武器每攻击4次：自身HP+3，再生+1，最大hp+5",
		"combatRules": [
			{
				"id": "nearbyWeaponHitsHealRegen",
				"trigger": "afterLinkedWeaponHit",
				"every": 4,
				"conditions": [
					{
						"kind": "linkedWeapon",
						"directions": [
							"left",
							"right"
						],
						"distance": 1,
						"filter": {}
					}
				],
				"effects": [
					{
						"type": "heal",
						"target": "self",
						"value": 3
					},
					{
						"type": "applyStatus",
						"target": "self",
						"status": "regeneration",
						"stacks": 1
					},
					{
						"type": "modifyBattleMaxHp",
						"target": "self",
						"value": 5
					}
				]
			}
		]
	},
	"I427": {
		"id": "friedShrimp",
		"name": "黄金超值之剑",
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
		],
		"minAttack": 10,
		"maxAttack": 13,
		"hitRate": 0.8,
		"attackInterval": 2.1,
		"ultimateGain": 5,
		"sourceName": "黄金超值之剑",
		"rarity": 5,
		"weaponTypes": [
			"剑"
		],
		"synergyText": "∧每配置一个食物，本物品使用间隔-0.1\n攻击命中时：每有1个配置在∧的食物，自身随机获得1个buff，并净化1个debuff",
		"synergyRules": [
			{
				"id": "foodIntervalReduce",
				"trigger": "layout",
				"conditions": [
					{
						"id": "nearbyFoods",
						"kind": "nearby",
						"relation": "orthogonal",
						"directions": [
							"up",
							"down",
							"left",
							"right"
						],
						"distance": 1,
						"filter": {
							"weaponTypes": [
								"食物"
							]
						},
						"min": 1
					}
				],
				"effects": [
					{
						"target": "self",
						"stat": "attackInterval",
						"operation": "add",
						"value": -0.1,
						"perMatch": true,
						"conditionId": "nearbyFoods"
					}
				]
			}
		],
		"combatRules": [
			{
				"trigger": "afterHit",
				"effects": [
					{
						"type": "nearbyRandomBuff",
						"id": "foodBuff",
						"target": "self",
						"directions": [
							"up",
							"down",
							"left",
							"right"
						],
						"distance": 1,
						"filter": {
							"weaponTypes": [
								"食物"
							]
						},
						"every": 1
					},
					{
						"type": "nearbyCleanseDebuff",
						"id": "foodCleanse",
						"target": "self",
						"directions": [
							"up",
							"down",
							"left",
							"right"
						],
						"distance": 1,
						"filter": {
							"weaponTypes": [
								"食物"
							]
						},
						"every": 1
					}
				]
			}
		]
	},
	"I428": {
		"id": "trueSevenStarSword",
		"name": "七星剑·白天",
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
		],
		"sourceName": "七星剑·白天",
		"rarity": 5,
		"minAttack": 7,
		"maxAttack": 10,
		"hitRate": 0.8,
		"attackInterval": 1.3,
		"ultimateGain": 10,
		"weaponTypes": [
			"剑"
		],
		"combatRules": [
			{
				"id": "battleStartUltimate20",
				"trigger": "battleStart",
				"effects": [
					{
						"type": "modifyUltimate",
						"operation": "add",
						"value": 20
					}
				]
			},
			{
				"id": "onHitBlockChance",
				"trigger": "beforeReceiveDamage",
				"conditions": [
					{
						"kind": "chance",
						"base": 0.1
					}
				],
				"effects": [
					{
						"type": "applyStatus",
						"target": "self",
						"status": "block",
						"stacks": 3
					}
				]
			},
			{
				"id": "ultimateDamageBoost",
				"trigger": "beforeAttack",
				"conditions": [
					{
						"kind": "attackOrigin",
						"value": "ultimate"
					}
				],
				"effects": [
					{
						"type": "modifyAttackDamage",
						"operation": "add",
						"value": 3
					}
				]
			}
		],
		"synergyText": "战斗开始时：自身奥义值+20\n被攻击时：10%概率时自身格挡+3\n奥义发动时：造成的伤害+3"
	},
	"I500": {
		"id": "手甲",
		"name": "手甲",
		"shape": [
			[
				1
			],
			[
				1
			]
		],
		"image": "project/images/rquan.png",
		"imageCrop": [
			6,
			20,
			64,
			111,
			312,
			312
		],
		"sourceName": "R拳",
		"rarity": 1,
		"minAttack": 1,
		"maxAttack": 2,
		"hitRate": 0.95,
		"attackInterval": 1.2,
		"ultimateGain": 1,
		"weaponTypes": [
			"拳"
		]
	},
	"I501": {
		"id": "钢制战斧",
		"name": "钢制战斧",
		"shape": [
			[
				1
			],
			[
				1
			]
		],
		"image": "project/images/rfu.png",
		"imageCrop": [
			11,
			9,
			53,
			141,
			312,
			312
		],
		"sourceName": "钢制战斧",
		"rarity": 1,
		"minAttack": 2,
		"maxAttack": 5,
		"hitRate": 0.75,
		"attackInterval": 2,
		"ultimateGain": 2,
		"weaponTypes": [
			"斧"
		]
	},
	"I502": {
		"id": "塞勒斯特之镰",
		"name": "塞勒斯特之镰",
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
		"image": "project/images/ranfu.png",
		"imageCrop": [
			33,
			5,
			106,
			224,
			312,
			312
		],
		"sourceName": "塞勒斯特之镰",
		"rarity": 1,
		"minAttack": 3,
		"maxAttack": 7,
		"hitRate": 0.75,
		"attackInterval": 2.2,
		"ultimateGain": 5,
		"synergyText": "攻击命中时：60%概率随机驱散敌方1个buff",
		"combatRules": [
			{
				"id": "hit60Dispel",
				"trigger": "afterHit",
				"conditions": [
					{
						"kind": "chance",
						"base": 0.6
					}
				],
				"effects": [
					{
						"type": "dispelRandomBuff",
						"target": "opponent"
					}
				]
			}
		],
		"weaponTypes": [
			"斧"
		]
	},
	"I503": {
		"id": "钢棍",
		"name": "钢棍",
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
		"image": "project/images/rzhang.png",
		"imageCrop": [
			2,
			31,
			72,
			258,
			312,
			312
		],
		"sourceName": "钢棍",
		"rarity": 1,
		"minAttack": 3,
		"maxAttack": 8,
		"hitRate": 0.9,
		"attackInterval": 3.1,
		"ultimateGain": 5,
		"weaponTypes": [
			"杖"
		]
	},
	"I504": {
		"id": "钢铁游击矛",
		"name": "钢铁游击矛",
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
		"image": "project/images/rqiang.png",
		"imageCrop": [
			13,
			6,
			50,
			301,
			312,
			312
		],
		"sourceName": "钢铁游击矛",
		"rarity": 1,
		"minAttack": 3,
		"maxAttack": 7,
		"hitRate": 0.95,
		"attackInterval": 2.5,
		"ultimateGain": 2,
		"weaponTypes": [
			"枪"
		]
	},
	"I505": {
		"id": "钢制匕首",
		"name": "钢制匕首",
		"shape": [
			[
				1
			],
			[
				1
			]
		],
		"image": "project/images/rduan.png",
		"imageCrop": [
			4,
			10,
			66,
			136,
			312,
			312
		],
		"sourceName": "钢制匕首",
		"rarity": 1,
		"minAttack": 1,
		"maxAttack": 3,
		"hitRate": 0.85,
		"attackInterval": 1.4,
		"ultimateGain": 2,
		"weaponTypes": [
			"短"
		]
	},
	"I506": {
		"id": "提亚玛特弩枪",
		"name": "提亚玛特弩枪",
		"shape": [
			[
				1
			],
			[
				1
			]
		],
		"image": "project/images/rchong.png",
		"imageCrop": [
			5,
			12,
			64,
			133,
			312,
			312
		],
		"sourceName": "提亚玛特弩枪",
		"rarity": 1,
		"minAttack": 6,
		"maxAttack": 10,
		"hitRate": 0.75,
		"attackInterval": 4,
		"ultimateGain": 5,
		"weaponTypes": [
			"铳"
		],
		"synergyText": "攻击命中时：60%概率敌方虚脱+1",
		"combatRules": [
			{
				"id": "hit60Exhaustion",
				"trigger": "afterHit",
				"conditions": [
					{
						"kind": "chance",
						"base": 0.6
					}
				],
				"effects": [
					{
						"type": "applyStatus",
						"target": "opponent",
						"status": "exhaustion",
						"stacks": 1
					}
				]
			}
		]
	},
	"I507": {
		"id": "科罗萨斯之拳",
		"name": "科罗萨斯之拳",
		"shape": [
			[
				1
			],
			[
				1
			]
		],
		"image": "project/images/rgaodaquan.png",
		"imageCrop": [
			7,
			13,
			62,
			137,
			312,
			312
		],
		"sourceName": "科罗萨斯之拳",
		"rarity": 1,
		"combatRules": [
			{
				"id": "hit60Exhaustion",
				"trigger": "afterHit",
				"conditions": [
					{
						"kind": "chance",
						"base": 0.6
					}
				],
				"effects": [
					{
						"type": "applyStatus",
						"target": "opponent",
						"status": "burn",
						"stacks": 1
					}
				]
			}
		],
		"minAttack": 1,
		"maxAttack": 2,
		"hitRate": 0.95,
		"attackInterval": 1.2,
		"ultimateGain": 1,
		"weaponTypes": [
			"拳"
		],
		"synergyText": "攻击命中时：60%概率敌方火伤+1"
	},
	"I508": {
		"id": "高万泰因",
		"name": "高万泰因",
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
		"image": "project/images/iozhang.png",
		"imageCrop": [
			4,
			17,
			75,
			285,
			312,
			312
		],
		"sourceName": "高万泰因",
		"rarity": 4,
		"minAttack": 6,
		"maxAttack": 12,
		"hitRate": 0.9,
		"attackInterval": 1.8,
		"ultimateGain": 2,
		"weaponTypes": [
			"杖"
		],
		"combatRules": [
			{
				"id": "hitMpAndDispel",
				"trigger": "afterHit",
				"effects": [
					{
						"type": "applyStatus",
						"target": "self",
						"status": "mp",
						"stacks": 1
					},
					{
						"type": "dispelBuff",
						"target": "opponent"
					}
				]
			},
			{
				"id": "ultimateRegen5",
				"trigger": "afterUltimate",
				"effects": [
					{
						"type": "applyStatus",
						"target": "self",
						"status": "regeneration",
						"stacks": 5
					}
				]
			},
			{
				"id": "blackCharmPassive",
				"trigger": "battleStart",
				"effects": [
					{
						"type": "statusDamageBonus",
						"id": "blackCharmDmg",
						"target": "self",
						"status": "blackCharm",
						"every": 1,
						"value": 3
					},
					{
						"type": "statusExtraAttack",
						"id": "blackCharmExtra",
						"target": "self",
						"status": "blackCharm",
						"every": 1,
						"value": 1
					}
				]
			}
		],
		"synergyText": "攻击命中时：自身MP+1，随机驱散敌方一个buff\n奥义发动时：自身再生+5\n若有黑之魅力buff，本武器伤害+3，本武器攻击次数+1"
	},
	"I509": {
		"id": "一期一振",
		"name": "一期一振",
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
		"image": "project/images/yiqiyizhen.png",
		"imageCrop": [
			14,
			9,
			49,
			295,
			312,
			312
		],
		"sourceName": "一期一振",
		"rarity": 4,
		"weaponTypes": [
			"刀"
		],
		"minAttack": 3,
		"maxAttack": 8,
		"hitRate": 1,
		"attackInterval": 1.7,
		"ultimateGain": 10,
		"synergyText": "攻击命中时：驱散敌方1个强化效果\n50%概率使攻击发动次数+1",
		"combatRules": [
			{
				"id": "hitDispel",
				"trigger": "afterHit",
				"effects": [
					{
						"type": "dispelBuff",
						"target": "opponent"
					}
				]
			},
			{
				"id": "hitExtraAttackChance",
				"trigger": "afterHit",
				"conditions": [
					{
						"kind": "chance",
						"base": 0.5
					}
				],
				"effects": [
					{
						"type": "triggerWeaponAttack"
					}
				]
			}
		]
	},
	"I510": {
		"id": "七星剑",
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
		"image": "project/images/qixingjianpeizi.png",
		"imageCrop": [
			10,
			10,
			55,
			216,
			312,
			312
		],
		"sourceName": "七星剑",
		"rarity": 3,
		"minAttack": 2,
		"maxAttack": 4,
		"hitRate": 0.8,
		"attackInterval": 1.3,
		"ultimateGain": 10,
		"weaponTypes": [
			"剑"
		],
		"combatRules": [
			{
				"id": "onHitBlockChance5",
				"trigger": "beforeReceiveDamage",
				"conditions": [
					{
						"kind": "chance",
						"base": 0.05
					}
				],
				"effects": [
					{
						"type": "applyStatus",
						"target": "self",
						"status": "block",
						"stacks": 2
					}
				]
			}
		],
		"synergyText": "被攻击时：5%概率使自身格挡+2"
	},
	"I511": {
		"id": "吉斯拉",
		"name": "吉斯拉",
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
		"image": "project/images/choushan.png",
		"imageCrop": [
			3,
			7,
			71,
			300,
			312,
			312
		],
		"sourceName": "吉斯拉",
		"rarity": 4,
		"minAttack": 5,
		"maxAttack": 10,
		"hitRate": 0.95,
		"attackInterval": 1.8,
		"ultimateGain": 2,
		"weaponTypes": [
			"枪"
		],
		"synergyText": "战斗开始时：∧内每配置1物品，自身HP-50\n自身HP50%以下时，攻击次数+2，本武器伤害+20",
		"combatRules": [
			{
				"id": "registerLowHpExtra",
				"trigger": "battleStart",
				"effects": [
					{
						"type": "statusExtraAttack",
						"id": "lowHpExtra",
						"status": "lowHpMark",
						"every": 1,
						"value": 2
					}
				]
			},
			{
				"id": "lowHpStateAndDamage",
				"trigger": "beforeAttack",
				"conditions": [
					{
						"kind": "hpPercent",
						"target": "self",
						"operator": "lte",
						"value": 0.5
					}
				],
				"effects": [
					{
						"type": "removeStatus",
						"target": "self",
						"status": "lowHpMark",
						"stacks": 100
					},
					{
						"type": "applyStatus",
						"target": "self",
						"status": "lowHpMark",
						"stacks": 1
					},
					{
						"type": "modifyAttackDamage",
						"operation": "add",
						"value": 20
					}
				]
			},
			{
				"id": "removeLowHpState",
				"trigger": "beforeAttack",
				"conditions": [
					{
						"kind": "hpPercent",
						"target": "self",
						"operator": "gt",
						"value": 0.5
					}
				],
				"effects": [
					{
						"type": "removeStatus",
						"target": "self",
						"status": "lowHpMark",
						"stacks": 100
					}
				]
			},
			{
				"trigger": "battleStart",
				"effects": [
					{
						"type": "nearbyDamageSelf",
						"value": 50,
						"directions": [
							"up",
							"down"
						],
						"distance": 1,
						"relation": "sideBox",
						"span": 3,
						"filter": {},
						"every": 1
					}
				]
			}
		]
	},
	"I512": {
		"id": "你与我的桃色水平线",
		"name": "你与我的桃色水平线",
		"shape": [
			[
				1
			]
		],
		"image": "project/images/niyuwodetaoseshuipingxian.png",
		"imageCrop": [
			9,
			3,
			58,
			70,
			312,
			312
		],
		"sourceName": "你与我的桃色水平线",
		"synergyText": "攻击命中时：自身高扬+1\n∧每配置一个武器，本武器使用间隔-0.1",
		"rarity": 3,
		"weaponTypes": [
			"杖"
		],
		"minAttack": 4,
		"maxAttack": 8,
		"hitRate": 0.9,
		"attackInterval": 2.9,
		"ultimateGain": 5,
		"combatRules": [
			{
				"id": "hitHighSpirit",
				"trigger": "afterHit",
				"conditions": [],
				"effects": [
					{
						"type": "applyStatus",
						"target": "self",
						"status": "highSpirit",
						"stacks": 1
					}
				]
			}
		],
		"synergyRules": [
			{
				"id": "nearbyWeaponIntervalReduce",
				"trigger": "layout",
				"conditions": [
					{
						"id": "nearbyAll",
						"kind": "nearby",
						"relation": "orthogonal",
						"directions": [
							"up",
							"down",
							"left",
							"right"
						],
						"distance": 1,
						"filter": {}
					}
				],
				"effects": [
					{
						"target": "self",
						"stat": "attackInterval",
						"operation": "add",
						"value": -0.1,
						"perMatch": true,
						"conditionId": "nearbyAll"
					}
				]
			}
		]
	},
	"I513": {
		"id": "使役者之证",
		"name": "使役者之证",
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
		"image": "project/images/shiyizhezhizheng.png",
		"imageCrop": [
			3,
			6,
			69,
			66,
			312,
			312
		],
		"sourceName": "使役者之证",
		"rarity": 4,
		"synergyText": "使役者的证明，持有本证明时，可获得精灵\n自身所有武器的奥义获得量+20\n配置在∧的武器每攻击10次：自身刻印+1，奥义值+10",
		"synergyRules": [
			{
				"id": "allWeaponsUltimateGainPlus20",
				"trigger": "layout",
				"conditions": [],
				"effects": [
					{
						"target": "all",
						"stat": "ultimateGain",
						"operation": "add",
						"value": 20
					}
				]
			}
		],
		"combatRules": [
			{
				"id": "nearbyWeaponEvery10HitsMarkAndUltimate",
				"trigger": "afterLinkedWeaponHit",
				"every": 10,
				"conditions": [
					{
						"kind": "linkedWeapon",
						"directions": [
							"up",
							"down",
							"left",
							"right"
						],
						"distance": 1,
						"filter": {}
					}
				],
				"effects": [
					{
						"type": "applyStatus",
						"target": "self",
						"status": "mark",
						"stacks": 1
					},
					{
						"type": "gainUltimate",
						"value": 10
					}
				]
			}
		],
		"weaponTypes": [
			"道具"
		]
	},
	"I514": {
		"id": "蔑笑妖",
		"name": "蔑笑妖",
		"shape": [
			[
				1
			],
			[
				1
			]
		],
		"image": "project/images/guangxiaojingling.png",
		"imageCrop": [
			1,
			13,
			73,
			122,
			312,
			312
		],
		"sourceName": "光小精灵",
		"rarity": 2,
		"minAttack": 7,
		"maxAttack": 9,
		"attackInterval": 4.5,
		"hitRate": 1,
		"ultimateGain": 0,
		"weaponTypes": [
			"精灵"
		],
		"combatRules": [
			{
				"id": "hitRandomBuff",
				"trigger": "afterHit",
				"effects": [
					{
						"type": "applyRandomBuffs",
						"target": "self",
						"count": 1,
						"stacks": 1
					}
				]
			},
			{
				"id": "markIgnoreBlock",
				"trigger": "beforeAttack",
				"conditions": [
					{
						"kind": "status",
						"target": "self",
						"status": "mark",
						"operator": "gte",
						"value": 5
					}
				],
				"effects": [
					{
						"type": "ignoreBlock"
					}
				]
			}
		],
		"synergyText": "攻击命中时：自身随机buff+1；\n自身刻印5个以上时，造成的伤害无视格挡"
	},
	"I515": {
		"id": "充气露·欧",
		"name": "充气露·欧",
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
		"image": "project/images/guanglongwanou.png",
		"imageCrop": [
			15,
			15,
			129,
			127,
			312,
			312
		],
		"sourceName": "充气露·欧",
		"rarity": 3,
		"minAttack": 5,
		"maxAttack": 7,
		"hitRate": 1,
		"attackInterval": 4,
		"ultimateGain": 0,
		"weaponTypes": [
			"乐器"
		],
		"synergyText": "配置在∧的武器攻击命中时：50%概率使自身再生+1和高扬+1",
		"combatRules": [
			{
				"id": "nearbyHitRegenAndHighSpirit",
				"trigger": "afterLinkedWeaponHit",
				"conditions": [
					{
						"kind": "linkedWeapon",
						"directions": [
							"left",
							"right"
						],
						"distance": 1,
						"filter": {}
					},
					{
						"kind": "chance",
						"base": 0.5
					}
				],
				"effects": [
					{
						"type": "applyStatus",
						"target": "self",
						"status": "regeneration",
						"stacks": 1
					},
					{
						"type": "applyStatus",
						"target": "self",
						"status": "highSpirit",
						"stacks": 1
					}
				]
			}
		]
	},
	"I516": {
		"id": "森人之证",
		"name": "森人之证",
		"shape": [
			[
				1
			]
		],
		"image": "project/images/shouwangzhizheng.png",
		"imageCrop": [
			4,
			11,
			67,
			56,
			312,
			312
		],
		"sourceName": "森人之证",
		"rarity": 4,
		"weaponTypes": [
			"道具"
		],
		"attackInterval": 5,
		"synergyText": "森林兽王的证明，持有本证明时，可获得动物\n攻击命中时：每有1个配置在∧的动物，自身随机获得1个强化效果\n配置在∧的动物的使用间隔 -0.1",
		"combatRules": [
			{
				"trigger": "afterHit",
				"effects": [
					{
						"type": "nearbyRandomBuff",
						"id": "animalBuffHit",
						"target": "self",
						"directions": [
							"up",
							"down",
							"left",
							"right"
						],
						"distance": 1,
						"filter": {
							"weaponTypes": [
								"动物"
							]
						},
						"every": 1
					}
				]
			}
		],
		"synergyRules": [
			{
				"id": "animalIntervalReduce",
				"trigger": "layout",
				"conditions": [
					{
						"id": "nearbyAnimals",
						"kind": "nearby",
						"relation": "orthogonal",
						"directions": [
							"up",
							"down",
							"left",
							"right"
						],
						"distance": 1,
						"filter": {
							"weaponTypes": [
								"动物"
							]
						},
						"min": 1
					}
				],
				"effects": [
					{
						"target": "matches",
						"conditionId": "nearbyAnimals",
						"stat": "attackInterval",
						"operation": "add",
						"value": -0.1
					}
				]
			}
		]
	},
	"I517": {
		"id": "格里姆尼尔(解放1)",
		"name": "格里姆尼尔(解放1)",
		"shape": [
			[
				1
			],
			[
				1
			]
		],
		"image": "project/images/junshen.png",
		"imageCrop": [
			7,
			15,
			68,
			125,
			312,
			312
		],
		"sourceName": "格里姆尼尔(解放1)",
		"rarity": 5,
		"attackInterval": 8,
		"synergyText": "战斗开始时：自身格挡 +20\n攻击时：自身反射+3",
		"minAttack": 3,
		"maxAttack": 3,
		"hitRate": 1,
		"ultimateGain": 5,
		"combatRules": [
			{
				"id": "battleStartBlock20",
				"trigger": "battleStart",
				"effects": [
					{
						"type": "applyStatus",
						"target": "self",
						"status": "block",
						"stacks": 20
					}
				]
			},
			{
				"id": "hitReflection3",
				"trigger": "afterHit",
				"effects": [
					{
						"type": "applyStatus",
						"target": "self",
						"status": "reflection",
						"stacks": 3
					}
				]
			}
		]
	},
	"I518": {
		"id": "追忆的咖啡冻",
		"name": "追忆的咖啡冻",
		"shape": [
			[
				1
			]
		],
		"image": "project/images/bingqilin.png",
		"imageCrop": [
			7,
			3,
			62,
			76,
			312,
			312
		],
		"sourceName": "追忆的咖啡冻",
		"rarity": 3,
		"attackInterval": 2.8,
		"synergyText": "攻击时：自身HP+2，随机净化自身1个debuff\n∧每配置一个食物，本武器间隔-0.1",
		"synergyRules": [
			{
				"id": "foodIntervalReduce",
				"trigger": "layout",
				"conditions": [
					{
						"id": "nearbyFoods",
						"kind": "nearby",
						"relation": "orthogonal",
						"directions": [
							"up",
							"down",
							"left",
							"right"
						],
						"distance": 1,
						"filter": {
							"weaponTypes": [
								"食物"
							]
						},
						"min": 1
					}
				],
				"effects": [
					{
						"target": "self",
						"stat": "attackInterval",
						"operation": "add",
						"value": -0.1,
						"perMatch": true,
						"conditionId": "nearbyFoods"
					}
				]
			}
		],
		"combatRules": [
			{
				"id": "attackHealCleanse",
				"trigger": "afterAttack",
				"conditions": [],
				"effects": [
					{
						"type": "heal",
						"target": "self",
						"value": 2
					},
					{
						"type": "cleanseOneDebuff",
						"target": "self"
					}
				]
			}
		],
		"weaponTypes": [
			"食物"
		]
	},
	"I519": {
		"id": "凤凰琴",
		"name": "朱雀翼弦",
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
			]
		],
		"image": "project/images/fenghuangqin.png",
		"imageCrop": [
			28,
			5,
			177,
			225,
			312,
			312
		],
		"sourceName": "朱雀翼弦",
		"rarity": 5,
		"minAttack": 19,
		"maxAttack": 23,
		"hitRate": 0.95,
		"attackInterval": 2.4,
		"ultimateGain": 5,
		"weaponTypes": [
			"乐器"
		],
		"combatRules": [
			{
				"trigger": "afterAttack",
				"conditions": [
					{
						"kind": "combatFlag",
						"key": "sacrificeDone",
						"negate": true
					}
				],
				"effects": [
					{
						"type": "damageSelf",
						"value": 20
					}
				]
			},
			{
				"trigger": "afterAttack",
				"conditions": [
					{
						"kind": "combatFlag",
						"key": "sacrificeDone",
						"negate": true
					},
					{
						"kind": "hpPercent",
						"target": "self",
						"operator": "lte",
						"value": 0.3334
					}
				],
				"once": true,
				"effects": [
					{
						"type": "healPercent",
						"value": 0.3334
					},
					{
						"type": "setCombatFlag",
						"key": "sacrificeDone"
					}
				]
			},
			{
				"trigger": "afterTakeDamage",
				"conditions": [
					{
						"kind": "combatFlag",
						"key": "sacrificeDone",
						"negate": true
					},
					{
						"kind": "hpPercent",
						"target": "self",
						"operator": "lte",
						"value": 0.3334
					}
				],
				"once": true,
				"effects": [
					{
						"type": "healPercent",
						"value": 0.3334
					},
					{
						"type": "setCombatFlag",
						"key": "sacrificeDone"
					}
				]
			}
		],
		"synergyText": "攻击时：自身hp-20，\n自身hp掉到1/3以下时：恢复1/3的hp，仅触发一次，该效果触发后，本武器攻击不再扣除自身hp"
	},
	"I520": {
		"id": "切片菠萝",
		"name": "切片菠萝",
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
		"image": "project/images/qiepianboluo.png",
		"imageCrop": [
			4,
			6,
			65,
			65,
			312,
			312
		],
		"sourceName": "切片菠萝",
		"attackInterval": 4,
		"synergyText": "攻击时：自身格挡+2；\n∧每配置一个食物，本武器使用间隔-0.1",
		"combatRules": [
			{
				"id": "attackGainBlock",
				"trigger": "afterAttack",
				"conditions": [],
				"effects": [
					{
						"type": "applyStatus",
						"target": "self",
						"status": "block",
						"stacks": 2
					}
				]
			}
		],
		"synergyRules": [
			{
				"id": "foodIntervalReduce",
				"trigger": "layout",
				"conditions": [
					{
						"id": "nearbyFoods",
						"kind": "nearby",
						"relation": "orthogonal",
						"directions": [
							"up",
							"down",
							"left",
							"right"
						],
						"distance": 1,
						"filter": {
							"weaponTypes": [
								"食物"
							]
						},
						"min": 1
					}
				],
				"effects": [
					{
						"target": "self",
						"stat": "attackInterval",
						"operation": "add",
						"value": -0.1,
						"perMatch": true,
						"conditionId": "nearbyFoods"
					}
				]
			}
		],
		"rarity": 2,
		"weaponTypes": [
			"食物"
		]
	},
	"I521": {
		"id": "压制之斧",
		"name": "压制之斧",
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
		"image": "project/images/yazhizhifu.png",
		"imageCrop": [
			12,
			7,
			138,
			299,
			312,
			312
		],
		"sourceName": "压制之斧",
		"rarity": 3,
		"combatRules": [
			{
				"id": "onHitBlockPerShield",
				"trigger": "beforeReceiveDamage",
				"conditions": [],
				"effects": [
					{
						"type": "applyStatus",
						"target": "self",
						"status": "block",
						"stacksFrom": {
							"kind": "nearbyCount",
							"directions": [
								"up",
								"down",
								"left",
								"right"
							],
							"distance": 1,
							"filter": {
								"weaponTypes": [
									"盾"
								]
							},
							"multiplier": 1
						}
					}
				]
			}
		],
		"synergyText": "被攻击时：每有一个配置在∧的盾，自身格挡+1",
		"minAttack": 7,
		"maxAttack": 11,
		"hitRate": 0.75,
		"attackInterval": 2.4,
		"ultimateGain": 5,
		"weaponTypes": [
			"斧"
		]
	},
	"I522": {
		"id": "双剑士之证",
		"name": "双剑士之证",
		"shape": [
			[
				1
			]
		],
		"image": "project/images/shuangjianzhizheng.png",
		"imageCrop": [
			15,
			7,
			43,
			63,
			312,
			312
		],
		"sourceName": "双剑之证",
		"rarity": 4,
		"combatRules": [
			{
				"id": "globalUltimateGain",
				"trigger": "battleStart",
				"effects": [
					{
						"type": "globalUltimateGainBonus",
						"value": 20
					}
				]
			},
			{
				"id": "nearbySwordKnifeInterval",
				"trigger": "battleStart",
				"effects": [
					{
						"type": "nearbyIntervalBonus",
						"directions": [
							"up",
							"down",
							"left",
							"right"
						],
						"distance": 1,
						"filter": {
							"weaponTypes": [
								"刀",
								"剑"
							]
						},
						"every": 1,
						"value": -0.1
					}
				]
			},
			{
				"id": "nearbySwordKnifeExtraAttack",
				"trigger": "battleStart",
				"effects": [
					{
						"type": "nearbyExtraAttack",
						"directions": [
							"up",
							"down",
							"left",
							"right"
						],
						"distance": 1,
						"filter": {
							"weaponTypes": [
								"刀",
								"剑"
							]
						},
						"every": 1,
						"value": 1
					}
				]
			}
		],
		"synergyText": "双剑士的证明\n所有武器奥义获得量+20\n配置在∧的刀和剑的间隔-0.1，攻击次数+1",
		"weaponTypes": [
			"道具"
		]
	},
	"I523": {
		"id": "甄选吉他拨片",
		"name": "甄选吉他拨片",
		"shape": [
			[
				1
			]
		],
		"image": "project/images/faka.png",
		"imageCrop": [
			13,
			12,
			49,
			54,
			312,
			312
		],
		"sourceName": "甄选吉他拨片",
		"rarity": 3,
		"weaponTypes": [
			"道具"
		]
	},
	"I524": {
		"id": "吟游诗人之证",
		"name": "吟游诗人之证",
		"shape": [
			[
				1
			]
		],
		"image": "project/images/yinyoushirenzhizheng.png",
		"imageCrop": [
			7,
			5,
			58,
			68,
			312,
			312
		],
		"sourceName": "吟游诗人之证",
		"rarity": 4,
		"weaponTypes": [
			"道具"
		],
		"combatRules": [
			{
				"trigger": "battleStart",
				"effects": [
					{
						"type": "buffGainCounter",
						"id": "buffDmg",
						"every": 10,
						"damage": 10
					}
				]
			},
			{
				"trigger": "afterLinkedWeaponHit",
				"conditions": [
					{
						"kind": "linkedWeapon",
						"directions": [
							"up",
							"down",
							"left",
							"right"
						],
						"distance": 1,
						"filter": {
							"weaponTypes": [
								"乐器"
							]
						}
					}
				],
				"effects": [
					{
						"type": "applyRandomBuffs",
						"target": "self",
						"count": 5
					}
				]
			}
		],
		"synergyText": "吟游诗人的证明\n自身每获得10个强化效果时：对敌方造成10点伤害\n配置在∧的乐器的攻击命中时：自身随机获得5个强化效果"
	},
	"I525": {
		"id": "充气伽莱翁",
		"name": "充气伽莱翁",
		"shape": [
			[
				1
			],
			[
				1
			]
		],
		"image": "project/images/tulongwanou.png",
		"imageCrop": [
			2,
			3,
			71,
			149,
			312,
			312
		],
		"sourceName": "充气伽莱翁",
		"rarity": 3,
		"minAttack": 7,
		"maxAttack": 9,
		"attackInterval": 4,
		"ultimateGain": 0,
		"hitRate": 1,
		"weaponTypes": [
			"乐器"
		],
		"combatRules": [
			{
				"id": "hitBlock3",
				"trigger": "afterHit",
				"conditions": [],
				"effects": [
					{
						"type": "applyStatus",
						"target": "self",
						"status": "block",
						"stacks": 3
					}
				]
			}
		],
		"synergyText": "攻击命中时：自身格挡+3"
	},
	"I526": {
		"id": "垂泪曼陀铃",
		"name": "垂泪曼陀铃",
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
		"image": "project/images/chuileimantuoling.png",
		"imageCrop": [
			2,
			21,
			72,
			197,
			312,
			312
		],
		"sourceName": "垂泪曼陀铃",
		"rarity": 2,
		"minAttack": 2,
		"maxAttack": 5,
		"hitRate": 0.95,
		"attackInterval": 2.4,
		"ultimateGain": 5,
		"weaponTypes": [
			"乐器"
		],
		"combatRules": [
			{
				"id": "hitHighSpiritBase",
				"trigger": "afterHit",
				"effects": [
					{
						"type": "applyStatus",
						"target": "self",
						"status": "highSpirit",
						"stacks": 1
					}
				]
			},
			{
				"id": "hitHighSpiritExtra",
				"trigger": "afterHit",
				"conditions": [
					{
						"kind": "buffStacks",
						"operator": "gte",
						"value": 10
					}
				],
				"effects": [
					{
						"type": "applyStatus",
						"target": "self",
						"status": "highSpirit",
						"stacks": 1
					}
				]
			}
		],
		"synergyRules": [
			{
				"id": "instrumentIntervalReduce",
				"trigger": "layout",
				"conditions": [
					{
						"id": "nearbyInstruments",
						"kind": "nearby",
						"relation": "orthogonal",
						"directions": [
							"up",
							"down",
							"left",
							"right"
						],
						"distance": 1,
						"filter": {
							"weaponTypes": [
								"乐器"
							]
						},
						"min": 1
					}
				],
				"effects": [
					{
						"target": "self",
						"stat": "attackInterval",
						"operation": "add",
						"value": -0.1,
						"perMatch": true,
						"conditionId": "nearbyInstruments"
					}
				]
			}
		],
		"synergyText": "攻击命中时：自身高扬+1，自身强化效果10个以上时，额外高扬+1；\n∧每配置一个乐器，本武器使用间隔-0.1"
	},
	"I527": {
		"id": "合一之魂",
		"name": "合一之魂",
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
		"image": "project/images/jichudun.png",
		"imageCrop": [
			11,
			6,
			132,
			218,
			312,
			312
		],
		"sourceName": "合一之魂",
		"rarity": 3,
		"combatRules": [
			{
				"id": "chanceReduceDamage",
				"trigger": "beforeReceiveDamage",
				"conditions": [
					{
						"kind": "chance",
						"base": 0.2
					}
				],
				"effects": [
					{
						"type": "modifyReceivedDamage",
						"operation": "add",
						"value": -5
					}
				]
			},
			{
				"id": "shieldBlockOnHit",
				"trigger": "beforeReceiveDamage",
				"conditions": [],
				"effects": [
					{
						"type": "applyStatus",
						"target": "self",
						"status": "block",
						"stacksFrom": {
							"kind": "nearbyCount",
							"directions": [
								"left",
								"right"
							],
							"distance": 1,
							"filter": {
								"weaponTypes": [
									"盾"
								]
							},
							"multiplier": 1
						}
					}
				]
			}
		],
		"weaponTypes": [
			"盾"
		],
		"synergyText": "被攻击时：20%概率降低受到的5点伤害\n被攻击时：每有1个配置在∧的盾，自身格挡+1"
	},
	"I528": {
		"id": "塔赫尔玛萨拉",
		"name": "塔赫尔玛萨拉",
		"shape": [
			[
				1,
				1
			]
		],
		"image": "project/images/taheermasala.png",
		"imageCrop": [
			7,
			5,
			141,
			72,
			312,
			312
		],
		"sourceName": "塔赫尔玛萨拉",
		"rarity": 4,
		"attackInterval": 4.2,
		"weaponTypes": [
			"食物"
		],
		"synergyRules": [
			{
				"id": "foodIntervalReduce",
				"trigger": "layout",
				"conditions": [
					{
						"id": "nearbyFoods",
						"kind": "nearby",
						"relation": "orthogonal",
						"directions": [
							"up",
							"down",
							"left",
							"right"
						],
						"distance": 1,
						"filter": {
							"weaponTypes": [
								"食物"
							]
						},
						"min": 1
					}
				],
				"effects": [
					{
						"target": "self",
						"stat": "attackInterval",
						"operation": "add",
						"value": -0.1,
						"perMatch": true,
						"conditionId": "nearbyFoods"
					}
				]
			}
		],
		"combatRules": [
			{
				"id": "attackHighSpiritExcitation",
				"trigger": "afterAttack",
				"conditions": [],
				"effects": [
					{
						"type": "applyStatus",
						"target": "self",
						"status": "highSpirit",
						"stacks": 1
					},
					{
						"type": "applyStatus",
						"target": "self",
						"status": "excitation",
						"stacks": 1
					}
				]
			}
		],
		"synergyText": "攻击时：自身高扬 +1/激奏 +1\n每有1个配置在∧的食物，使用间隔-0.1"
	},
	"I529": {
		"id": "威尔士天浆",
		"name": "威尔士天浆",
		"shape": [
			[
				1
			],
			[
				1
			]
		],
		"image": "project/images/weiershitianjiang.png",
		"imageCrop": [
			19,
			9,
			38,
			136,
			312,
			312
		],
		"sourceName": "威尔士天浆",
		"rarity": 4,
		"combatRules": [
			{
				"id": "buff10TriggerOnce",
				"trigger": "afterAttack",
				"once": true,
				"conditions": [
					{
						"kind": "buffStacks",
						"operator": "gte",
						"value": 10
					}
				],
				"effects": [
					{
						"type": "applyRandomBuffs",
						"target": "self",
						"count": 5
					},
					{
						"type": "heal",
						"target": "self",
						"value": 20
					},
					{
						"type": "triggerWeaponEffects",
						"directions": [
							"up"
						],
						"distance": 1,
						"filter": {
							"weaponTypes": [
								"饮品"
							]
						}
					}
				]
			}
		],
		"synergyText": "自身拥有10个以上强化效果时：随机获得5个强化效果，回复20HP，立即发动配置在∧的饮品的效果，每场战斗只能触发1次",
		"minAttack": null,
		"maxAttack": null,
		"attackInterval": null,
		"hitRate": null,
		"weaponTypes": [
			"饮料"
		]
	},
	"I530": {
		"id": "修瓦利耶之剑",
		"name": "修瓦利耶之剑",
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
		"image": "project/images/xiaoguangjian.png",
		"imageCrop": [
			6,
			17,
			64,
			200,
			312,
			312
		],
		"sourceName": "修瓦利耶之剑",
		"rarity": 1,
		"minAttack": 2,
		"maxAttack": 3,
		"hitRate": 0.8,
		"attackInterval": 1.6,
		"ultimateGain": 5,
		"weaponTypes": [
			"剑"
		],
		"combatRules": [
			{
				"id": "hitChanceHealAndMaxHp",
				"trigger": "afterHit",
				"conditions": [
					{
						"kind": "chance",
						"base": 0.6
					}
				],
				"effects": [
					{
						"type": "heal",
						"target": "self",
						"value": 1
					},
					{
						"type": "modifyBattleMaxHp",
						"target": "self",
						"value": 2
					}
				]
			}
		],
		"synergyText": "攻击命中时：60%概率回复自身1HP,最大HP+2"
	},
	"I531": {
		"id": "世界树的晶剑",
		"name": "世界树的晶剑",
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
		"image": "project/images/xiaotumeijian.png",
		"imageCrop": [
			11,
			20,
			54,
			198,
			312,
			312
		],
		"sourceName": "世界树的晶剑",
		"rarity": 1,
		"minAttack": 2,
		"maxAttack": 3,
		"hitRate": 0.8,
		"attackInterval": 1.6,
		"ultimateGain": 5,
		"synergyText": "攻击命中时：60%概率回复自身1HP,最大HP+2",
		"weaponTypes": [
			"剑"
		],
		"combatRules": [
			{
				"id": "hitChanceHealAndMaxHp",
				"trigger": "afterHit",
				"conditions": [
					{
						"kind": "chance",
						"base": 0.6
					}
				],
				"effects": [
					{
						"type": "heal",
						"target": "self",
						"value": 1
					},
					{
						"type": "modifyBattleMaxHp",
						"target": "self",
						"value": 2
					}
				]
			}
		]
	},
	"I532": {
		"id": "熟悉的银箱御守",
		"name": "熟悉的银箱御守",
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
		"image": "project/images/xiaodiaobaozhang.png",
		"imageCrop": [
			2,
			25,
			71,
			272,
			312,
			312
		],
		"sourceName": "小掉宝杖",
		"rarity": 1,
		"minAttack": 1,
		"maxAttack": 1,
		"hitRate": 0.95,
		"attackInterval": 2.5,
		"ultimateGain": 1,
		"weaponTypes": [
			"枪"
		],
		"synergyText": "战斗后获得的金币增加0.25倍",
		"combatRules": [
			{
				"id": "doubleGold",
				"trigger": "battleEnd",
				"conditions": [],
				"effects": [
					{
						"type": "goldMultiplier",
						"value": 0.25
					}
				]
			}
		]
	},
	"I533": {
		"id": "利维坦之视",
		"name": "利维坦之视",
		"shape": [
			[
				1
			],
			[
				1
			]
		],
		"image": "project/images/xiaoshuiduan.png",
		"imageCrop": [
			19,
			21,
			41,
			115,
			312,
			312
		],
		"sourceName": "利维坦之视",
		"rarity": 1,
		"weaponTypes": [
			"短"
		],
		"minAttack": 1,
		"maxAttack": 3,
		"hitRate": 0.85,
		"attackInterval": 1.4,
		"ultimateGain": 5,
		"synergyText": "攻击命中时：60%概率敌方冰结+1",
		"combatRules": [
			{
				"id": "hit60Ice1",
				"trigger": "afterHit",
				"conditions": [
					{
						"kind": "chance",
						"base": 0.6
					}
				],
				"effects": [
					{
						"type": "applyStatus",
						"target": "opponent",
						"status": "ice",
						"stacks": 1
					}
				]
			}
		]
	},
	"I534": {
		"id": "半瓶秘药",
		"name": "半瓶秘药",
		"shape": [
			[
				1
			]
		],
		"image": "project/images/xiaohong.png",
		"imageCrop": [
			7,
			4,
			62,
			69,
			312,
			312
		],
		"sourceName": "小红",
		"rarity": 1,
		"synergyText": "生命值跌落到1/3以下时，仅生效一次：回复5HP,发动∧的饮料效果",
		"combatRules": [
			{
				"id": "lowHpTriggerOnce",
				"trigger": "afterTakeDamage",
				"once": true,
				"conditions": [
					{
						"kind": "hpPercent",
						"target": "self",
						"operator": "lte",
						"value": 0.3333
					}
				],
				"effects": [
					{
						"type": "heal",
						"target": "self",
						"value": 5
					},
					{
						"type": "triggerWeaponEffects",
						"directions": [
							"up"
						],
						"distance": 1,
						"filter": {
							"weaponTypes": [
								"饮料"
							]
						}
					}
				]
			}
		],
		"weaponTypes": [
			"饮料"
		]
	},
	"I535": {
		"id": "少女蜜露",
		"name": "少女蜜露",
		"shape": [
			[
				1
			],
			[
				1
			]
		],
		"image": "project/images/shaonvmilu.png",
		"imageCrop": [
			5,
			30,
			65,
			107,
			312,
			312
		],
		"sourceName": "少女蜜露",
		"rarity": 3,
		"combatRules": [
			{
				"trigger": "afterHeal",
				"once": true,
				"effects": [
					{
						"type": "applyStatus",
						"target": "self",
						"status": "excitation",
						"stacks": 5
					},
					{
						"type": "heal",
						"target": "self",
						"value": 15
					},
					{
						"type": "triggerWeaponEffects",
						"directions": [
							"up"
						],
						"distance": 1,
						"filter": {
							"weaponTypes": [
								"饮料"
							]
						}
					}
				]
			}
		],
		"synergyText": "自身HP回复时仅触发一次：5层激奏/HP+15/发动上方一格内的饮料效果",
		"weaponTypes": [
			"饮料"
		]
	},
	"I536": {
		"id": "尼伯龙根之杯",
		"name": "尼伯龙根之杯",
		"shape": [
			[
				1
			],
			[
				1
			]
		],
		"image": "project/images/nibolonggenzhibei.png",
		"imageCrop": [
			6,
			26,
			65,
			107,
			312,
			312
		],
		"sourceName": "尼伯龙根之杯",
		"rarity": 4,
		"combatRules": [
			{
				"id": "onHitDefenseOnce",
				"trigger": "beforeReceiveDamage",
				"once": true,
				"conditions": [],
				"effects": [
					{
						"type": "applyStatus",
						"target": "self",
						"status": "block",
						"stacks": 60
					},
					{
						"type": "heal",
						"target": "self",
						"value": 20
					},
					{
						"type": "triggerWeaponEffects",
						"directions": [
							"up"
						],
						"distance": 1,
						"filter": {
							"weaponTypes": [
								"饮品"
							]
						}
					}
				]
			}
		],
		"synergyText": "被攻击时：自身格挡 +60/回复20HP/立即发动配置在∧的饮品的效果，每场战斗只能触发1次"
	},
	"I537": {
		"id": "痛苦与苦难",
		"name": "痛苦与苦难",
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
			]
		],
		"image": "project/images/wuyaofu.png",
		"imageCrop": [
			6,
			4,
			143,
			221,
			312,
			312
		],
		"sourceName": "痛苦与苦难",
		"rarity": 4,
		"synergyRules": [
			{
				"id": "leftAxeBoost",
				"trigger": "layout",
				"conditions": [
					{
						"id": "leftAxes",
						"kind": "nearby",
						"relation": "orthogonal",
						"directions": [
							"left"
						],
						"distance": 1,
						"filter": {
							"weaponTypes": [
								"斧"
							]
						}
					}
				],
				"effects": [
					{
						"target": "self",
						"stat": "attack",
						"operation": "add",
						"value": 2,
						"perMatch": true,
						"conditionId": "leftAxes"
					},
					{
						"target": "self",
						"stat": "attackInterval",
						"operation": "add",
						"value": -0.1,
						"perMatch": true,
						"conditionId": "leftAxes"
					}
				]
			}
		],
		"combatRules": [
			{
				"id": "wolfSkinStripBlock",
				"trigger": "afterHit",
				"conditions": [
					{
						"kind": "status",
						"target": "self",
						"status": "wolfSkin",
						"operator": "gte",
						"value": 1
					}
				],
				"effects": [
					{
						"type": "removeStatus",
						"target": "opponent",
						"status": "block",
						"stacks": 10
					}
				]
			}
		],
		"synergyText": "∧每配置一把斧，本物品伤害+2/使用间隔-0.1\n狼皮效果中：攻击命中时，格挡-10",
		"minAttack": 19,
		"maxAttack": 22,
		"hitRate": 0.75,
		"attackInterval": 3.2,
		"ultimateGain": 5,
		"weaponTypes": [
			"斧"
		]
	},
	"I538": {
		"id": "巴哈姆特之盾",
		"name": "巴哈姆特之盾",
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
		"image": "project/images/bahamutezhidun.png",
		"imageCrop": [
			2,
			7,
			151,
			220,
			312,
			312
		],
		"sourceName": "巴哈姆特之盾",
		"synergyRules": [
			{
				"id": "sideWeaponIntervalReduce",
				"trigger": "layout",
				"conditions": [
					{
						"id": "sideWeapons",
						"kind": "nearby",
						"relation": "orthogonal",
						"directions": [
							"left",
							"right"
						],
						"distance": 1,
						"filter": {},
						"min": 1
					}
				],
				"effects": [
					{
						"target": "matches",
						"conditionId": "sideWeapons",
						"stat": "attackInterval",
						"operation": "add",
						"value": -0.1
					}
				]
			}
		],
		"combatRules": [
			{
				"id": "chanceReduceDamage",
				"trigger": "beforeReceiveDamage",
				"conditions": [
					{
						"kind": "chance",
						"base": 0.2
					}
				],
				"effects": [
					{
						"type": "modifyReceivedDamage",
						"operation": "add",
						"value": -7
					}
				]
			}
		],
		"synergyText": "被攻击时：20%概率降低受到的7点伤害\n配置在∧的武器的使用间隔-0.1",
		"rarity": 4
	},
	"I539": {
		"id": "乐师之证",
		"name": "乐师之证",
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
		"image": "project/images/yingyuanzhezhizheng.png",
		"imageCrop": [
			5,
			4,
			64,
			66,
			312,
			312
		],
		"sourceName": "乐师之证",
		"combatRules": [
			{
				"id": "nearbyGuitarHitBuffs",
				"trigger": "afterLinkedWeaponHit",
				"conditions": [
					{
						"kind": "linkedWeapon",
						"directions": [
							"up",
							"down",
							"left",
							"right"
						],
						"distance": 1,
						"filter": {
							"weaponTypes": [
								"吉他"
							]
						}
					}
				],
				"effects": [
					{
						"type": "applyStatus",
						"target": "self",
						"status": "excitation",
						"stacks": 1
					},
					{
						"type": "applyStatus",
						"target": "self",
						"status": "highSpirit",
						"stacks": 1
					}
				]
			},
			{
				"id": "ultimateGuitarExtraAttack",
				"trigger": "beforeAttack",
				"conditions": [
					{
						"kind": "attackOrigin",
						"value": "ultimate"
					},
					{
						"kind": "status",
						"target": "self",
						"status": "excitation",
						"operator": "gte",
						"value": 15
					}
				],
				"effects": [
					{
						"type": "addExtraAttack",
						"directions": [
							"up",
							"down",
							"left",
							"right"
						],
						"distance": 1,
						"filter": {
							"weaponTypes": [
								"吉他"
							]
						}
					}
				]
			}
		],
		"rarity": 4,
		"weaponTypes": [
			"道具"
		],
		"synergyText": "乐师的证明，你才是真正的摇滚巨星！！\n配置在∧的吉他的攻击命中时：自身激奏 +1/高扬 +1\n自身拥有15层以上激奏时，配置在∧的吉他奥义发动时的攻击次数 +1"
	},
	"I540": {
		"id": "彗星猎手",
		"name": "彗星猎手",
		"shape": [
			[
				1
			],
			[
				1
			]
		],
		"image": "project/images/huixinglieshou.png",
		"imageCrop": [
			12,
			14,
			54,
			131,
			312,
			312
		],
		"sourceName": "彗星猎手",
		"rarity": 3,
		"minAttack": 3,
		"maxAttack": 5,
		"hitRate": 0.85,
		"attackInterval": 1.2,
		"ultimateGain": 5,
		"weaponTypes": [
			"短"
		],
		"combatRules": [
			{
				"id": "attackBoostsNearbyElves",
				"trigger": "beforeAttack",
				"conditions": [],
				"effects": [
					{
						"type": "modifyWeaponStat",
						"weaponTarget": "nearby",
						"stat": "attack",
						"operation": "add",
						"value": 1,
						"directions": [
							"up",
							"down",
							"left",
							"right"
						],
						"distance": 1,
						"filter": {
							"weaponTypes": [
								"精灵"
							]
						}
					}
				]
			}
		],
		"synergyText": "获得本武器时，提高商店出现精灵的概率\n攻击时：∧的使魔伤害+1"
	},
	"I541": {
		"id": "恶灭之雷",
		"name": "恶灭之雷",
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
		"image": "project/images/emiezhilei.png",
		"imageCrop": [
			11,
			14,
			55,
			290,
			312,
			312
		],
		"sourceName": "恶灭之雷",
		"rarity": 4,
		"minAttack": 4,
		"maxAttack": 5,
		"hitRate": 0.85,
		"attackInterval": 1.4,
		"ultimateGain": 3,
		"weaponTypes": [
			"弓"
		],
		"combatRules": [
			{
				"trigger": "beforeAttack",
				"conditions": [
					{
						"kind": "attackOrigin",
						"value": "ultimate"
					},
					{
						"kind": "status",
						"target": "enemy",
						"status": "burn",
						"operator": "gte",
						"value": 10
					}
				],
				"effects": [
					{
						"type": "modifyAttackDamage",
						"operation": "add",
						"value": 20
					}
				]
			}
		],
		"synergyText": "攻击命中时：敌方火伤 +1\n奥义发动时，若敌方火伤≥10，伤害+20"
	},
	"I542": {
		"id": "拉卡姆铳",
		"name": "贝尼迪",
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
		"image": "project/images/lakamuchong.png",
		"imageCrop": [
			17,
			7,
			42,
			223,
			312,
			312
		],
		"sourceName": "贝尼迪",
		"synergyText": "奥义发动时的伤害 +3\n被攻击时：每有一个配置∧的盾牌，本武器使用间隔-0.2",
		"combatRules": [
			{
				"trigger": "beforeAttack",
				"conditions": [
					{
						"kind": "attackOrigin",
						"value": "ultimate"
					}
				],
				"effects": [
					{
						"type": "modifyAttackDamage",
						"operation": "add",
						"value": 3
					}
				]
			},
			{
				"trigger": "beforeReceiveDamage",
				"effects": [
					{
						"type": "nearbyIntervalBonus",
						"id": "shieldInterval",
						"value": -0.2,
						"directions": [
							"up",
							"down",
							"left",
							"right"
						],
						"distance": 1,
						"filter": {
							"weaponTypes": [
								"盾"
							]
						}
					}
				]
			}
		],
		"rarity": 4,
		"minAttack": 16,
		"maxAttack": 25,
		"hitRate": 0.75,
		"attackInterval": 36,
		"ultimateGain": 5
	},
	"I543": {
		"id": "宿命铁拳",
		"name": "宿命铁拳",
		"shape": [
			[
				1
			]
		],
		"image": "project/images/zhihu.png",
		"imageCrop": [
			3,
			10,
			70,
			59,
			312,
			312
		],
		"sourceName": "宿命铁拳",
		"rarity": 2,
		"minAttack": 1,
		"maxAttack": 2,
		"hitRate": 0.95,
		"attackInterval": 1,
		"ultimateGain": 1,
		"synergyRules": [
			{
				"id": "nearbyWeaponAttackPlus1",
				"trigger": "layout",
				"conditions": [
					{
						"id": "nearbyWeapons",
						"kind": "nearby",
						"relation": "orthogonal",
						"directions": [
							"up",
							"down",
							"left",
							"right"
						],
						"distance": 1,
						"filter": {},
						"min": 1
					}
				],
				"effects": [
					{
						"target": "matches",
						"conditionId": "nearbyWeapons",
						"stat": "attack",
						"operation": "add",
						"value": 1
					}
				]
			}
		],
		"combatRules": [
			{
				"id": "battleStartSelfDamage20",
				"trigger": "battleStart",
				"effects": [
					{
						"type": "damageSelf",
						"value": 20
					}
				]
			}
		],
		"synergyText": "战斗开始时，自身受到20点伤害\n配置在∧的武器伤害+1"
	},
	"I544": {
		"id": "恶戏妖",
		"name": "恶戏妖",
		"shape": [
			[
				1
			],
			[
				1
			]
		],
		"image": "project/images/anxiaojingling.png",
		"imageCrop": [
			1,
			12,
			78,
			118,
			312,
			312
		],
		"sourceName": "恶戏妖",
		"rarity": 2,
		"minAttack": 6,
		"maxAttack": 10,
		"hitRate": 1,
		"attackInterval": 4.5,
		"ultimateGain": 0,
		"weaponTypes": [
			"精灵"
		],
		"combatRules": [
			{
				"id": "hitRandomDebuff",
				"trigger": "afterHit",
				"effects": [
					{
						"type": "applyRandomDebuff",
						"target": "opponent",
						"stacks": 1
					}
				]
			},
			{
				"id": "markIgnoreBlock",
				"trigger": "beforeAttack",
				"conditions": [
					{
						"kind": "status",
						"target": "self",
						"status": "mark",
						"operator": "gte",
						"value": 5
					}
				],
				"effects": [
					{
						"type": "ignoreBlock"
					}
				]
			}
		],
		"synergyText": "攻击命中时：敌方随机debuff+1；\n自身刻印5个以上时，造成的伤害无视格挡"
	},
	"I545": {
		"id": "充气菲迪埃尔",
		"name": "充气菲迪埃尔",
		"shape": [
			[
				1,
				0
			],
			[
				1,
				1
			]
		],
		"image": "project/images/anlongwanou.png",
		"imageCrop": [
			5,
			19,
			99,
			133,
			312,
			312
		],
		"sourceName": "充气菲迪埃尔",
		"rarity": 3,
		"minAttack": 4,
		"maxAttack": 7,
		"hitRate": 1,
		"attackInterval": 4,
		"ultimateGain": 0,
		"weaponTypes": [
			"乐器"
		],
		"combatRules": [
			{
				"id": "sideWeaponHitRandomDebuff",
				"trigger": "afterLinkedWeaponHit",
				"conditions": [
					{
						"kind": "linkedWeapon",
						"directions": [
							"left",
							"right"
						],
						"distance": 1,
						"filter": {}
					},
					{
						"kind": "chance",
						"base": 0.5
					}
				],
				"effects": [
					{
						"type": "applyRandomDebuff",
						"target": "opponent",
						"stacks": 1
					}
				]
			}
		],
		"synergyText": "配置在∧的武器命中时：50%概率使敌方随机debuff+1"
	},
	"I548": {
		"id": "斯拉德战斧",
		"name": "斯拉德战斧",
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
		"image": "project/images/mengxiang.png",
		"imageCrop": [
			3,
			14,
			137,
			288,
			312,
			312
		],
		"sourceName": "斯拉德战斧",
		"rarity": 4,
		"minAttack": 16,
		"maxAttack": 20,
		"hitRate": 0.75,
		"attackInterval": 3,
		"ultimateGain": 10,
		"weaponTypes": [
			"斧"
		],
		"synergyText": "狼皮效果中：伤害+10，本武器的伤害无视格挡",
		"combatRules": [
			{
				"trigger": "beforeAttack",
				"conditions": [
					{
						"kind": "status",
						"target": "self",
						"status": "wolfSkin",
						"operator": "gte",
						"value": 1
					}
				],
				"effects": [
					{
						"type": "ignoreBlock"
					}
				]
			},
			{
				"trigger": "battleStart",
				"effects": [
					{
						"type": "statusDamageBonus",
						"id": "wolfSkinDmg",
						"target": "self",
						"status": "wolfSkin",
						"every": 1,
						"value": 10
					}
				]
			}
		]
	},
	"I549": {
		"id": "欧罗巴(未解放)",
		"name": "欧罗巴(未解放)",
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
		"image": "project/images/ouluoba.png",
		"imageCrop": [
			7,
			15,
			68,
			125,
			312,
			312
		],
		"sourceName": "欧罗巴(未解放)",
		"rarity": 5
	},
	"I550": {
		"id": "圣诞瓦姆杜斯",
		"name": "圣诞瓦姆杜斯",
		"shape": [
			[
				1
			]
		],
		"image": "project/images/shuilongwanou.png",
		"imageCrop": [
			8,
			2,
			65,
			76,
			312,
			312
		],
		"sourceName": "水龙玩偶",
		"weaponTypes": [
			"乐器"
		],
		"combatRules": [
			{
				"id": "nearbyHitIceChance",
				"trigger": "afterLinkedWeaponHit",
				"conditions": [
					{
						"kind": "linkedWeapon",
						"directions": [
							"up",
							"down",
							"left",
							"right"
						],
						"distance": 1,
						"filter": {}
					},
					{
						"kind": "chance",
						"base": 0.5
					}
				],
				"effects": [
					{
						"type": "applyStatus",
						"target": "opponent",
						"status": "ice",
						"stacks": 1
					}
				]
			}
		],
		"synergyText": "∧的武器命中时：50%概率使敌方冰结+1",
		"rarity": 3,
		"minAttack": 4,
		"maxAttack": 5,
		"hitRate": 1,
		"attackInterval": 4,
		"ultimateGain": 0
	},
	"I551": {
		"id": "暗黑被提·拟像",
		"name": "暗黑被提·拟像",
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
		"image": "project/images/fasangxiaojingling.png",
		"imageCrop": [
			9,
			3,
			142,
			154,
			312,
			312
		],
		"sourceName": "暗黑被提·拟像",
		"rarity": 5,
		"minAttack": 16,
		"maxAttack": 21,
		"hitRate": 1,
		"attackInterval": 4.2,
		"ultimateGain": -30,
		"weaponTypes": [
			"精灵"
		],
		"synergyText": "攻击发动6次\n自身拥有5层以上刻印时，伤害 +5，造成的伤害无视敌方格挡\n攻击时，自身hp-5",
		"combatRules": [
			{
				"id": "battleStartMark",
				"trigger": "battleStart",
				"effects": [
					{
						"type": "applyStatus",
						"target": "self",
						"status": "mark",
						"stacks": 1
					}
				]
			},
			{
				"id": "markExtraAttack",
				"trigger": "battleStart",
				"effects": [
					{
						"type": "statusExtraAttack",
						"id": "extraAttack",
						"status": "mark",
						"every": 1,
						"value": 5
					}
				]
			},
			{
				"id": "markDamageIgnoreBlock",
				"trigger": "beforeAttack",
				"conditions": [
					{
						"kind": "status",
						"target": "self",
						"status": "mark",
						"operator": "gte",
						"value": 5
					}
				],
				"effects": [
					{
						"type": "modifyAttackDamage",
						"operation": "add",
						"value": 5
					},
					{
						"type": "ignoreBlock"
					}
				]
			},
			{
				"id": "selfDamage5",
				"trigger": "afterAttack",
				"effects": [
					{
						"type": "damageSelf",
						"value": 5
					}
				]
			}
		]
	},
	"I552": {
		"id": "混沌之源",
		"name": "混沌之源",
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
		"image": "project/images/hundunzhiyuan.png",
		"imageCrop": [
			7,
			8,
			57,
			220,
			312,
			312
		],
		"sourceName": "混沌之源",
		"rarity": 4,
		"weaponTypes": [
			"剑"
		],
		"minAttack": 4,
		"maxAttack": 6,
		"hitRate": 0.8,
		"attackInterval": 1.3,
		"ultimateGain": 5,
		"combatRules": [
			{
				"id": "leftUpHitRandomDebuff",
				"trigger": "afterLinkedWeaponHit",
				"conditions": [
					{
						"kind": "linkedWeapon",
						"directions": [
							"left",
							"up"
						],
						"distance": 1,
						"filter": {}
					},
					{
						"kind": "chance",
						"base": 0.5
					}
				],
				"effects": [
					{
						"type": "applyRandomDebuff",
						"target": "opponent",
						"stacks": 1
					}
				]
			},
			{
				"id": "debuffDamageIce",
				"trigger": "battleStart",
				"effects": [
					{
						"type": "statusDamageBonus",
						"id": "iceDmg",
						"target": "enemy",
						"status": "ice",
						"every": 1,
						"value": 1
					}
				]
			},
			{
				"id": "debuffDamageBurn",
				"trigger": "battleStart",
				"effects": [
					{
						"type": "statusDamageBonus",
						"id": "burnDmg",
						"target": "enemy",
						"status": "burn",
						"every": 1,
						"value": 1
					}
				]
			},
			{
				"id": "debuffDamageDarkness",
				"trigger": "battleStart",
				"effects": [
					{
						"type": "statusDamageBonus",
						"id": "darknessDmg",
						"target": "enemy",
						"status": "darkness",
						"every": 1,
						"value": 1
					}
				]
			},
			{
				"id": "debuffDamageExhaustion",
				"trigger": "battleStart",
				"effects": [
					{
						"type": "statusDamageBonus",
						"id": "exhaustionDmg",
						"target": "enemy",
						"status": "exhaustion",
						"every": 1,
						"value": 1
					}
				]
			}
		],
		"synergyText": "∧的武器命中时：50%概率使敌方随机debuff+1\n敌方每有一个debuff，本武器伤害+1"
	},
	"I553": {
		"id": "湿婆（解放1）",
		"name": "湿婆（解放1）",
		"shape": [
			[
				1
			],
			[
				1
			]
		],
		"image": "project/images/shipo.png",
		"imageCrop": [
			7,
			15,
			68,
			125,
			312,
			312
		],
		"sourceName": "湿婆",
		"rarity": 5,
		"synergyRules": [
			{
				"id": "allWeaponsAttackPlus1",
				"trigger": "layout",
				"conditions": [],
				"effects": [
					{
						"target": "all",
						"stat": "attack",
						"operation": "add",
						"value": 1
					}
				]
			}
		],
		"synergyText": "战斗开始时：所有武器伤害 +1"
	},
	"I554": {
		"id": "红色星球",
		"name": "红色星球",
		"shape": [
			[
				1
			]
		],
		"image": "project/images/huozuzhangqiu.png",
		"imageCrop": [
			3,
			5,
			69,
			68,
			312,
			312
		],
		"sourceName": "红色星球",
		"combatRules": [
			{
				"id": "hitConsumeMpBurn",
				"trigger": "afterHit",
				"conditions": [
					{
						"kind": "status",
						"target": "self",
						"status": "mp",
						"operator": "gte",
						"value": 3
					}
				],
				"effects": [
					{
						"type": "consumeStatus",
						"target": "self",
						"status": "mp",
						"stacks": 3
					},
					{
						"type": "applyStatus",
						"target": "opponent",
						"status": "burn",
						"stacks": 1
					}
				]
			},
			{
				"id": "nearbyWeaponHitMp",
				"trigger": "afterLinkedWeaponHit",
				"conditions": [
					{
						"kind": "linkedWeapon",
						"directions": [
							"up",
							"down",
							"left",
							"right"
						],
						"distance": 1,
						"filter": {}
					}
				],
				"effects": [
					{
						"type": "applyStatus",
						"target": "self",
						"status": "mp",
						"stacks": 1
					}
				]
			}
		],
		"synergyText": "攻击命中时：消耗3MP，使敌方火伤+1；\n∧的武器攻击时，自身MP+1",
		"rarity": 2,
		"weaponTypes": [
			"杖"
		],
		"minAttack": 4,
		"maxAttack": 7,
		"hitRate": 0.9,
		"attackInterval": 2.3,
		"ultimateGain": 2
	},
	"I555": {
		"id": "火龙玩偶",
		"name": "威尔纳斯灯笼",
		"shape": [
			[
				1
			]
		],
		"image": "project/images/huolongwanou.png",
		"imageCrop": [
			5,
			3,
			64,
			74,
			312,
			312
		],
		"sourceName": "威尔纳斯灯笼",
		"rarity": 3,
		"weaponTypes": [
			"乐器"
		],
		"minAttack": 3,
		"maxAttack": 6,
		"hitRate": 1,
		"attackInterval": 4,
		"ultimateGain": 0,
		"combatRules": [
			{
				"id": "nearbyWeaponHitBurnChance",
				"trigger": "afterLinkedWeaponHit",
				"conditions": [
					{
						"kind": "linkedWeapon",
						"directions": [
							"up",
							"down",
							"left",
							"right"
						],
						"distance": 1,
						"filter": {}
					},
					{
						"kind": "chance",
						"base": 0.5
					}
				],
				"effects": [
					{
						"type": "applyStatus",
						"target": "opponent",
						"status": "burn",
						"stacks": 1
					}
				]
			}
		],
		"synergyText": "∧的武器命中时：50%概率使敌方火伤+1"
	},
	"I556": {
		"id": "迷你乌洛波洛斯",
		"name": "迷你乌洛波洛斯",
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
		"image": "project/images/lianjinlong.png",
		"imageCrop": [
			22,
			5,
			121,
			146,
			312,
			312
		],
		"sourceName": "迷你乌洛波洛斯",
		"combatRules": [
			{
				"id": "hitRandomDebuff",
				"trigger": "afterHit",
				"conditions": [],
				"effects": [
					{
						"type": "applyRandomDebuff",
						"target": "opponent",
						"stacks": 1
					}
				]
			},
			{
				"id": "mark5DamageIgnoreBlock",
				"trigger": "beforeAttack",
				"conditions": [
					{
						"kind": "status",
						"target": "self",
						"status": "mark",
						"operator": "gte",
						"value": 5
					}
				],
				"effects": [
					{
						"type": "modifyAttackDamage",
						"operation": "add",
						"value": 5
					},
					{
						"type": "ignoreBlock"
					}
				]
			}
		],
		"weaponTypes": [
			"精灵"
		],
		"synergyText": "攻击命中时：对敌方随机施加1个debuff\n自身拥有5层以上刻印时，伤害 +5，造成的伤害无视格挡",
		"minAttack": 12,
		"maxAttack": 17,
		"hitRate": 1,
		"attackInterval": 4,
		"ultimateGain": -30,
		"rarity": 3
	},
	"I557": {
		"id": "卡瓦酒烤鳗鱼",
		"name": "卡瓦酒烤鳗鱼",
		"shape": [
			[
				1
			],
			[
				1
			]
		],
		"image": "project/images/kaorou.png",
		"imageCrop": [
			5,
			32,
			67,
			107,
			312,
			312
		],
		"sourceName": "卡瓦酒烤鳗鱼",
		"rarity": 1,
		"weaponTypes": [
			"食物"
		],
		"attackInterval": 2.5,
		"synergyText": "攻击时：再生+1；\n∧每配置1个食物，本武器使用间隔-0.1",
		"combatRules": [
			{
				"id": "foodIntervalReduce",
				"trigger": "layout",
				"conditions": [
					{
						"id": "nearbyFoods",
						"kind": "nearby",
						"relation": "orthogonal",
						"directions": [
							"up",
							"down",
							"left",
							"right"
						],
						"distance": 1,
						"filter": {
							"weaponTypes": [
								"食物"
							]
						},
						"min": 1
					}
				],
				"effects": [
					{
						"target": "self",
						"stat": "attackInterval",
						"operation": "add",
						"value": -0.1,
						"perMatch": true,
						"conditionId": "nearbyFoods"
					}
				]
			}
		],
		"synergyRules": [
			{
				"id": "foodIntervalReduce",
				"trigger": "layout",
				"conditions": [
					{
						"id": "nearbyFoods",
						"kind": "nearby",
						"relation": "orthogonal",
						"directions": [
							"up",
							"down",
							"left",
							"right"
						],
						"distance": 1,
						"filter": {
							"weaponTypes": [
								"食物"
							]
						}
					}
				],
				"effects": [
					{
						"target": "self",
						"stat": "attackInterval",
						"operation": "add",
						"value": -0.1,
						"perMatch": true,
						"conditionId": "nearbyFoods"
					}
				]
			}
		]
	},
	"I558": {
		"id": "钢腕猛击的大熊",
		"name": "钢腕猛击的大熊",
		"shape": [
			[
				1,
				1,
				0
			],
			[
				1,
				1,
				1
			],
			[
				1,
				1,
				1
			]
		],
		"image": "project/images/xiong.png",
		"imageCrop": [
			6,
			8,
			211,
			219,
			312,
			312
		],
		"sourceName": "钢腕猛击的大熊",
		"rarity": 5,
		"weaponTypes": [
			"动物"
		],
		"minAttack": 15,
		"maxAttack": 19,
		"hitRate": 0.9,
		"attackInterval": 3.5,
		"ultimateGain": 0,
		"synergyText": "每有1个配置在∧的食物或动物，伤害 +2\n在∧配置的食物与动物达到5个以上时，攻击回数 +2",
		"synergyRules": [
			{
				"id": "foodAnimalDamageBoost",
				"trigger": "layout",
				"conditions": [
					{
						"id": "nearbyFoodAnimals",
						"kind": "nearby",
						"relation": "orthogonal",
						"directions": [
							"up",
							"down",
							"left",
							"right"
						],
						"distance": 1,
						"filter": {
							"weaponTypes": [
								"食物",
								"动物"
							]
						}
					}
				],
				"effects": [
					{
						"target": "self",
						"stat": "attack",
						"operation": "add",
						"value": 2,
						"perMatch": true,
						"conditionId": "nearbyFoodAnimals"
					}
				]
			}
		],
		"combatRules": [
			{
				"trigger": "battleStart",
				"effects": [
					{
						"type": "nearbyThresholdExtraAttack",
						"id": "foodAnimal5",
						"value": 2,
						"threshold": 5,
						"directions": [
							"up",
							"down",
							"left",
							"right"
						],
						"distance": 1,
						"filter": {
							"weaponTypes": [
								"食物",
								"动物"
							]
						}
					}
				]
			}
		]
	},
	"I559": {
		"id": "狂战士之怒",
		"name": "狂战士之怒",
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
		"image": "project/images/kuangzhanshizhinu.png",
		"imageCrop": [
			3,
			15,
			153,
			282,
			312,
			312
		],
		"sourceName": "狂战士之怒",
		"rarity": 3,
		"weaponTypes": [
			"斧"
		],
		"minAttack": 10,
		"maxAttack": 15,
		"hitRate": 0.75,
		"attackInterval": 3.2,
		"ultimateGain": 10,
		"combatRules": [
			{
				"id": "lowHpUltimateOnce",
				"trigger": "afterTakeDamage",
				"once": true,
				"conditions": [
					{
						"kind": "hpPercent",
						"target": "self",
						"operator": "lte",
						"value": 0.5
					}
				],
				"effects": [
					{
						"type": "modifyUltimate",
						"operation": "add",
						"value": 100
					}
				]
			},
			{
				"id": "wolfSkinDamageBonus",
				"trigger": "battleStart",
				"effects": [
					{
						"type": "statusDamageBonus",
						"id": "wolfSkinDmg",
						"target": "self",
						"status": "wolfSkin",
						"every": 1,
						"value": 4
					}
				]
			}
		],
		"synergyText": "生命值50%以下时仅触发一次：自身奥义+100%；\n狼皮效果中：造成的伤害+4"
	},
	"I560": {
		"id": "狂战士之证",
		"name": "狂战士之证",
		"shape": [
			[
				1
			]
		],
		"image": "project/images/kuangzhanshizhizheng.png",
		"imageCrop": [
			3,
			6,
			68,
			66,
			312,
			312
		],
		"sourceName": "狂战士之证",
		"synergyText": "剑斗士的证书，狂战士的最爱\n无法发动奥义\n自身奥义100%时，消耗全部奥义获得10秒狼皮效果",
		"combatRules": [
			{
				"trigger": "battleStart",
				"effects": [
					{
						"type": "disableUltimate"
					}
				]
			},
			{
				"trigger": "afterAttack",
				"conditions": [
					{
						"kind": "ultimatePercent",
						"operator": "gte",
						"value": 100
					}
				],
				"effects": [
					{
						"type": "modifyUltimate",
						"operation": "set",
						"value": 0
					},
					{
						"type": "applyStatus",
						"target": "self",
						"status": "wolfSkin",
						"stacks": 10
					}
				]
			}
		],
		"rarity": 4,
		"weaponTypes": [
			"道具"
		]
	},
	"I561": {
		"id": "狮子王战拳",
		"name": "狮子王战拳",
		"shape": [
			[
				1
			],
			[
				1
			]
		],
		"image": "project/images/shiziwangzhanquan.png",
		"imageCrop": [
			3,
			14,
			72,
			130,
			312,
			312
		],
		"sourceName": "狮子王战拳",
		"rarity": 4,
		"minAttack": 2,
		"maxAttack": 3,
		"hitRate": 1,
		"attackInterval": 0.8,
		"ultimateGain": 1,
		"weaponTypes": [
			"拳"
		],
		"combatRules": [
			{
				"id": "ultimateEnemyUltimateMinus20",
				"trigger": "afterUltimate",
				"effects": [
					{
						"type": "modifyUltimate",
						"target": "enemy",
						"operation": "add",
						"value": -20
					}
				]
			}
		],
		"synergyText": "奥义发动时：敌方奥义值-20"
	},
	"I562": {
		"id": "芬布尔之冬",
		"name": "芬布尔之冬",
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
		"image": "project/images/langgong.png",
		"imageCrop": [
			2,
			24,
			73,
			185,
			312,
			312
		],
		"sourceName": "芬布尔之冬",
		"rarity": 3,
		"minAttack": 4,
		"maxAttack": 6,
		"hitRate": 0.85,
		"attackInterval": 1.4,
		"ultimateGain": 1,
		"weaponTypes": [
			"弓"
		],
		"synergyText": "生命值在50%以上时，伤害+3",
		"combatRules": [
			{
				"id": "hpAboveHalfDamageBonus",
				"trigger": "beforeAttack",
				"conditions": [
					{
						"kind": "hpPercent",
						"target": "self",
						"operator": "gte",
						"value": 0.5
					}
				],
				"effects": [
					{
						"type": "modifyAttackDamage",
						"operation": "add",
						"value": 3
					}
				]
			}
		]
	},
	"I563": {
		"id": "围巾狗",
		"name": "围巾狗",
		"shape": [
			[
				1,
				0
			],
			[
				1,
				1
			]
		],
		"image": "project/images/liequan.png",
		"imageCrop": [
			2,
			8,
			144,
			141,
			312,
			312
		],
		"sourceName": "围巾狗",
		"synergyRules": [
			{
				"id": "foodAnimalIntervalReduce",
				"trigger": "layout",
				"conditions": [
					{
						"id": "nearbyFoodAnimals",
						"kind": "nearby",
						"relation": "orthogonal",
						"directions": [
							"up",
							"down",
							"left",
							"right"
						],
						"distance": 1,
						"filter": {
							"weaponTypes": [
								"食物",
								"动物"
							]
						},
						"min": 1
					}
				],
				"effects": [
					{
						"target": "self",
						"stat": "attackInterval",
						"operation": "add",
						"value": -0.1,
						"perMatch": true,
						"conditionId": "nearbyFoodAnimals"
					}
				]
			}
		],
		"synergyText": "∧每配置一个食物或动物，本物品使用间隔-0.1",
		"weaponTypes": [
			"动物"
		],
		"rarity": 2,
		"minAttack": 4,
		"maxAttack": 7,
		"hitRate": 0.9,
		"attackInterval": 2.8,
		"ultimateGain": 0
	},
	"I564": {
		"id": "剑玉米",
		"name": "剑玉米",
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
		"image": "project/images/yumi.png",
		"imageCrop": [
			2,
			44,
			73,
			162,
			312,
			312
		],
		"sourceName": "剑玉米",
		"rarity": 2,
		"synergyRules": [
			{
				"id": "foodIntervalReduce",
				"trigger": "layout",
				"conditions": [
					{
						"id": "nearbyFoods",
						"kind": "nearby",
						"relation": "orthogonal",
						"directions": [
							"up",
							"down",
							"left",
							"right"
						],
						"distance": 1,
						"filter": {
							"weaponTypes": [
								"食物"
							]
						},
						"min": 1
					}
				],
				"effects": [
					{
						"target": "self",
						"stat": "attackInterval",
						"operation": "add",
						"value": -0.1,
						"perMatch": true,
						"conditionId": "nearbyFoods"
					}
				]
			}
		],
		"combatRules": [
			{
				"id": "attackReflection2",
				"trigger": "afterAttack",
				"conditions": [],
				"effects": [
					{
						"type": "applyStatus",
						"target": "self",
						"status": "reflection",
						"stacks": 2
					}
				]
			}
		],
		"attackInterval": 4.2,
		"ultimateGain": 3,
		"synergyText": "攻击时：自身反射+2；\n∧每配置一个食物，本物品使用间隔-0.1",
		"weaponTypes": [
			"食物"
		]
	},
	"I565": {
		"id": "玉钢",
		"name": "玉钢",
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
		"image": "project/images/yugang.png",
		"imageCrop": [
			2,
			4,
			74,
			70,
			312,
			312
		],
		"sourceName": "玉钢",
		"rarity": 1,
		"weaponTypes": [
			"道具"
		],
		"synergyText": "战斗开始时：∧的武器伤害+1",
		"synergyRules": [
			{
				"id": "boostNearbyWeapons",
				"trigger": "layout",
				"conditions": [
					{
						"id": "nearbyAll",
						"kind": "nearby",
						"relation": "orthogonal",
						"directions": [
							"up",
							"down",
							"left",
							"right"
						],
						"distance": 1,
						"filter": {}
					}
				],
				"effects": [
					{
						"target": "matches",
						"conditionId": "nearbyAll",
						"stat": "attack",
						"operation": "add",
						"value": 1
					}
				]
			}
		]
	},
	"I566": {
		"id": "琴师之证",
		"name": "琴师之证",
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
		"image": "project/images/qinshizhizheng.png",
		"imageCrop": [
			2,
			42,
			71,
			82,
			312,
			312
		],
		"sourceName": "琴师之证"
	},
	"I567": {
		"id": "疯狂扫帚",
		"name": "疯狂扫帚",
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
		"image": "project/images/fengkuangsaozhou.png",
		"imageCrop": [
			4,
			13,
			64,
			286,
			312,
			312
		],
		"sourceName": "疯狂扫帚",
		"combatRules": [
			{
				"id": "battleStartMpFromStaves",
				"trigger": "battleStart",
				"effects": [
					{
						"type": "applyStatus",
						"target": "self",
						"status": "mp",
						"stacksFrom": {
							"kind": "nearbyCount",
							"directions": [
								"up",
								"down",
								"left",
								"right"
							],
							"distance": 1,
							"filter": {
								"weaponTypes": [
									"杖"
								]
							},
							"multiplier": 2
						}
					}
				]
			},
			{
				"id": "nearbyWeaponHitMp",
				"trigger": "afterLinkedWeaponHit",
				"conditions": [
					{
						"kind": "linkedWeapon",
						"directions": [
							"up",
							"down",
							"left",
							"right"
						],
						"distance": 1,
						"filter": {}
					}
				],
				"effects": [
					{
						"type": "applyStatus",
						"target": "self",
						"status": "mp",
						"stacks": 1
					}
				]
			}
		],
		"synergyText": "战斗开始时：∧每配置1个杖，自身MP+2：\n∧配置的武器攻击命中时，自身MP+1",
		"rarity": 3,
		"minAttack": 5,
		"maxAttack": 9,
		"hitRate": 0.9,
		"attackInterval": 2.1,
		"ultimateGain": 2,
		"weaponTypes": [
			"杖"
		]
	},
	"I568": {
		"id": "盾骑士之证",
		"name": "盾骑士之证",
		"shape": [
			[
				1
			]
		],
		"image": "project/images/dunfuzhizheng.png",
		"imageCrop": [
			3,
			9,
			69,
			60,
			312,
			312
		],
		"sourceName": "盾骑士之证",
		"rarity": 4,
		"weaponTypes": [
			"道具"
		],
		"combatRules": [
			{
				"trigger": "beforeReceiveDamage",
				"conditions": [
					{
						"kind": "chance",
						"base": 0,
						"nearbyBonus": 0.2,
						"directions": [
							"up",
							"down",
							"left",
							"right"
						],
						"distance": 1,
						"filter": {
							"weaponTypes": [
								"盾"
							]
						}
					}
				],
				"effects": [
					{
						"type": "nearbyApplyStatus",
						"id": "shieldBlock",
						"target": "self",
						"status": "block",
						"stacks": 2,
						"directions": [
							"up",
							"down",
							"left",
							"right"
						],
						"distance": 1,
						"filter": {
							"weaponTypes": [
								"盾"
							]
						},
						"every": 1
					},
					{
						"type": "nearbyApplyStatus",
						"id": "shieldHigh",
						"target": "self",
						"status": "highSpirit",
						"stacks": 1,
						"directions": [
							"up",
							"down",
							"left",
							"right"
						],
						"distance": 1,
						"filter": {
							"weaponTypes": [
								"盾"
							]
						},
						"every": 1
					}
				]
			}
		],
		"synergyText": "盾骑士的证书，最坚实的城墙！\n∧的盾牌被攻击时的效果触发概率+20%\n所有铳和斧伤害+3\n被攻击时：∧每配置一个盾牌，自身格挡+2，高扬+1",
		"synergyRules": [
			{
				"id": "allAxeGunDamageUp",
				"trigger": "layout",
				"conditions": [
					{
						"id": "axeGunWeapons",
						"kind": "count",
						"filter": {
							"weaponTypes": [
								"斧",
								"铳"
							]
						},
						"includeSelf": true,
						"min": 1
					}
				],
				"effects": [
					{
						"target": "matches",
						"conditionId": "axeGunWeapons",
						"stat": "attack",
						"operation": "add",
						"value": 3
					}
				]
			}
		]
	},
	"I569": {
		"id": "石像鬼之刃",
		"name": "石像鬼之刃",
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
		"image": "project/images/shixiangguizhiren.png",
		"imageCrop": [
			5,
			12,
			66,
			284,
			312,
			312
		],
		"sourceName": "石像鬼之刃",
		"rarity": 4,
		"minAttack": 5,
		"maxAttack": 8,
		"hitRate": 0.8,
		"attackInterval": 1.7,
		"ultimateGain": 10,
		"weaponTypes": [
			"剑"
		],
		"combatRules": [
			{
				"id": "ultimateBoostNearby",
				"trigger": "afterUltimate",
				"effects": [
					{
						"type": "modifyWeaponStat",
						"weaponTarget": "nearby",
						"stat": "attack",
						"operation": "add",
						"value": 1,
						"directions": [
							"up",
							"down",
							"left",
							"right"
						],
						"distance": 1,
						"durationTicks": 1000
					}
				]
			}
		],
		"synergyText": "奥义发动后：10秒内，∧的武器伤害+1"
	},
	"I571": {
		"id": "神域守护·布洛蒂亚(解放1)",
		"name": "神域守护·布洛蒂亚(解放1)",
		"shape": [
			[
				1
			],
			[
				1
			]
		],
		"image": "project/images/shendun.png",
		"imageCrop": [
			7,
			15,
			68,
			125,
			312,
			312
		],
		"sourceName": "神域守护·布洛蒂亚(解放1)",
		"rarity": 5,
		"weaponTypes": [
			"道具"
		],
		"attackInterval": 8,
		"combatRules": [
			{
				"id": "battleStartInvincible",
				"trigger": "battleStart",
				"effects": [
					{
						"type": "setInvincible",
						"durationTicks": 100
					}
				]
			},
			{
				"id": "attackInvincible",
				"trigger": "beforeAttack",
				"effects": [
					{
						"type": "setInvincible",
						"durationTicks": 100
					}
				]
			}
		],
		"synergyText": "战斗开始时：1秒内免疫伤害\n攻击时：1秒内免疫伤害"
	},
	"I572": {
		"id": "蜂鸟",
		"name": "蜂鸟",
		"shape": [
			[
				1
			]
		],
		"image": "project/images/jinglingniao.png",
		"imageCrop": [
			4,
			11,
			67,
			60,
			312,
			312
		],
		"sourceName": "蜂鸟",
		"rarity": 1,
		"weaponTypes": [
			"动物"
		],
		"minAttack": 3,
		"maxAttack": 4,
		"hitRate": 0.9,
		"attackInterval": 3.4,
		"ultimateGain": 0,
		"combatRules": [
			{
				"trigger": "battleStart",
				"effects": [
					{
						"type": "applyStatus",
						"target": "self",
						"status": "regeneration",
						"stacks": 1
					},
					{
						"type": "nearbyMaxHpBonus",
						"directions": [
							"up",
							"down",
							"left",
							"right"
						],
						"distance": 1,
						"filter": {
							"weaponTypes": [
								"乐器",
								"动物"
							]
						},
						"value": 3
					}
				]
			}
		],
		"synergyText": "战斗开始时：自身再生+1\n∧每配置一的乐器或动物，自身最大HP+3"
	},
	"I573": {
		"id": "鹰眼",
		"name": "鹰眼",
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
		"image": "project/images/zongqingzhimu.png",
		"imageCrop": [
			5,
			10,
			70,
			187,
			312,
			312
		],
		"sourceName": "鹰眼",
		"rarity": 4,
		"minAttack": 18,
		"maxAttack": 31,
		"hitRate": 0.75,
		"attackInterval": 4,
		"ultimateGain": 5,
		"weaponTypes": [
			"铳"
		],
		"combatRules": [
			{
				"id": "hitDarkness1",
				"trigger": "afterHit",
				"effects": [
					{
						"type": "applyStatus",
						"target": "opponent",
						"status": "darkness",
						"stacks": 1
					}
				]
			},
			{
				"id": "shieldDamageOnHit",
				"trigger": "beforeReceiveDamage",
				"effects": [
					{
						"type": "nearbyDamageBonus",
						"id": "shieldDmgBonus",
						"directions": [
							"up",
							"down",
							"left",
							"right"
						],
						"distance": 1,
						"filter": {
							"weaponTypes": [
								"盾"
							]
						},
						"value": 1
					}
				]
			}
		],
		"synergyText": "攻击命中时：敌方黑暗+1\n被攻击时，上下左右一格内每有一个盾：本武器伤害+1"
	},
	"I574": {
		"id": "蓝色星球",
		"name": "蓝色星球",
		"shape": [
			[
				1
			]
		],
		"image": "project/images/zuzhangqiu.png",
		"imageCrop": [
			3,
			5,
			69,
			68,
			312,
			312
		],
		"sourceName": "蓝色星球",
		"rarity": 4,
		"minAttack": 8,
		"maxAttack": 12,
		"hitRate": 0.9,
		"attackInterval": 2.1,
		"ultimateGain": 2,
		"weaponTypes": [
			"杖"
		],
		"synergyText": "攻击命中时：消耗3MP，使敌方冰结+1；\n每消耗10点MP：自身奥义+5；\n∧的武器攻击时，自身MP+1",
		"combatRules": [
			{
				"trigger": "afterHit",
				"conditions": [
					{
						"kind": "status",
						"target": "self",
						"status": "mp",
						"operator": "gte",
						"value": 3
					}
				],
				"effects": [
					{
						"type": "consumeStatus",
						"target": "self",
						"status": "mp",
						"value": 3
					},
					{
						"type": "applyStatus",
						"target": "enemy",
						"status": "ice",
						"stacks": 1
					}
				]
			},
			{
				"trigger": "battleStart",
				"effects": [
					{
						"type": "mpConsumeCounter",
						"id": "mpUlt",
						"every": 10,
						"value": 5
					}
				]
			},
			{
				"trigger": "afterLinkedWeaponHit",
				"conditions": [
					{
						"kind": "linkedWeapon",
						"directions": [
							"up",
							"down",
							"left",
							"right"
						],
						"distance": 1
					}
				],
				"effects": [
					{
						"type": "applyStatus",
						"target": "self",
						"status": "mp",
						"stacks": 1
					}
				]
			}
		]
	},
	"I575": {
		"id": "绝拳",
		"name": "绝拳",
		"shape": [
			[
				1
			],
			[
				1
			]
		],
		"image": "project/images/juequan.png",
		"imageCrop": [
			3,
			21,
			70,
			116,
			312,
			312
		],
		"sourceName": "绝拳",
		"rarity": 4,
		"weaponTypes": [
			"拳"
		],
		"minAttack": 2,
		"maxAttack": 3,
		"attackInterval": 0.8,
		"hitRate": 1,
		"ultimateGain": 1,
		"combatRules": [
			{
				"id": "attackChanceDamage",
				"trigger": "beforeAttack",
				"conditions": [
					{
						"kind": "chance",
						"base": 0.5
					}
				],
				"effects": [
					{
						"type": "modifyAttackDamage",
						"operation": "add",
						"value": 10
					}
				]
			},
			{
				"id": "lowHpDamage",
				"trigger": "beforeAttack",
				"conditions": [
					{
						"kind": "hpPercent",
						"target": "self",
						"operator": "lte",
						"value": 0.5
					}
				],
				"effects": [
					{
						"type": "modifyAttackDamage",
						"operation": "add",
						"value": 10
					}
				]
			}
		],
		"synergyText": "攻击时：50%概率伤害+10\n生命值低于50%时：伤害+10"
	},
	"I576": {
		"id": "绯绯色金",
		"name": "绯绯色金",
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
		"image": "project/images/feifeisejin.png",
		"imageCrop": [
			2,
			5,
			74,
			69,
			312,
			312
		],
		"sourceName": "绯绯色金",
		"rarity": 5,
		"attackInterval": 8,
		"combatRules": [
			{
				"id": "attackRandomBuffs6",
				"trigger": "afterAttack",
				"effects": [
					{
						"type": "applyRandomBuffs",
						"target": "self",
						"count": 6,
						"stacks": 1
					}
				]
			}
		],
		"synergyText": "攻击时：自身随机获得6个buff"
	},
	"I577": {
		"id": "绽花瓶",
		"name": "绽花瓶",
		"shape": [
			[
				1
			],
			[
				1
			]
		],
		"image": "project/images/zhanhuaping.png",
		"imageCrop": [
			17,
			7,
			43,
			143,
			312,
			312
		],
		"sourceName": "绽花瓶",
		"rarity": 2,
		"weaponTypes": [
			"饮料"
		],
		"synergyText": "HP50以下时仅触发一次：回复自身30HP，随机净化自身1个debuff，发动∧的饮料效果",
		"combatRules": [
			{
				"id": "lowHpHealCleanseDrink",
				"trigger": "afterTakeDamage",
				"once": true,
				"conditions": [
					{
						"kind": "hpPercent",
						"target": "self",
						"operator": "lte",
						"value": 0.5
					}
				],
				"effects": [
					{
						"type": "heal",
						"target": "self",
						"value": 30
					},
					{
						"type": "cleanseOneDebuff",
						"target": "self"
					},
					{
						"type": "triggerWeaponEffects",
						"directions": [
							"up"
						],
						"distance": 1,
						"filter": {
							"weaponTypes": [
								"饮料"
							]
						}
					}
				]
			}
		]
	},
	"I578": {
		"id": "胡萝卜剑",
		"name": "胡萝卜剑",
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
		"image": "project/images/huluobo.png",
		"imageCrop": [
			5,
			33,
			64,
			234,
			312,
			312
		],
		"sourceName": "胡萝卜剑",
		"rarity": 3,
		"attackInterval": 3.8,
		"synergyRules": [
			{
				"id": "foodIntervalReduce",
				"trigger": "layout",
				"conditions": [
					{
						"id": "nearbyFoods",
						"kind": "nearby",
						"relation": "orthogonal",
						"directions": [
							"up",
							"down",
							"left",
							"right"
						],
						"distance": 1,
						"filter": {
							"weaponTypes": [
								"食物"
							]
						},
						"min": 1
					}
				],
				"effects": [
					{
						"target": "self",
						"stat": "attackInterval",
						"operation": "add",
						"value": -0.1,
						"perMatch": true,
						"conditionId": "nearbyFoods"
					}
				]
			}
		],
		"combatRules": [
			{
				"id": "attackHealAndBoostNearby",
				"trigger": "afterAttack",
				"conditions": [],
				"effects": [
					{
						"type": "heal",
						"target": "self",
						"value": 5
					},
					{
						"type": "modifyBattleMaxHp",
						"target": "self",
						"value": 10
					},
					{
						"type": "modifyWeaponStat",
						"weaponTarget": "nearby",
						"stat": "attack",
						"operation": "add",
						"value": 1,
						"directions": [
							"up",
							"down",
							"left",
							"right"
						],
						"distance": 1,
						"filter": {},
						"durationTicks": 100
					}
				]
			}
		],
		"synergyText": "攻击时：自身hp+5，最大HP+10，∧的武器1秒内伤害+1；\n∧内每配置一个食物，本物品使用间隔-0.1",
		"weaponTypes": [
			"食物"
		]
	},
	"I579": {
		"id": "蔚蓝闪电",
		"name": "蔚蓝闪电",
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
			]
		],
		"image": "project/images/weilanshandian.png",
		"imageCrop": [
			29,
			11,
			179,
			284,
			312,
			312
		],
		"sourceName": "蔚蓝闪电",
		"rarity": 5,
		"weaponTypes": [
			"剑"
		],
		"minAttack": 40,
		"maxAttack": 50,
		"hitRate": 0.8,
		"attackInterval": 6,
		"ultimateGain": 30,
		"combatRules": [
			{
				"id": "attackCleanseHealMaxHp",
				"trigger": "afterAttack",
				"conditions": [],
				"effects": [
					{
						"type": "cleanseOneDebuff",
						"target": "self"
					},
					{
						"type": "cleanseOneDebuff",
						"target": "self"
					},
					{
						"type": "cleanseOneDebuff",
						"target": "self"
					},
					{
						"type": "cleanseOneDebuff",
						"target": "self"
					},
					{
						"type": "cleanseOneDebuff",
						"target": "self"
					},
					{
						"type": "heal",
						"target": "self",
						"value": 3
					},
					{
						"type": "modifyBattleMaxHp",
						"target": "self",
						"value": 5
					}
				]
			},
			{
				"id": "ultimateExtraDamage10",
				"trigger": "afterUltimate",
				"effects": [
					{
						"type": "dealDamage",
						"target": "opponent",
						"value": 10,
						"direct": true
					}
				]
			}
		],
		"synergyText": "攻击时：净化自身5个debuff，自身HP+3，最大hp+5\n奥义发动时：额外造成10点的伤害"
	},
	"I581": {
		"id": "虹之弓",
		"name": "虹之弓",
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
		"image": "project/images/hongzhigong.png",
		"imageCrop": [
			4,
			4,
			69,
			225,
			312,
			312
		],
		"sourceName": "虹之弓",
		"synergyText": "攻击命中时：敌方冰结 +1\n奥义发动时：敌方每有1层冰结，伤害 +2",
		"rarity": 4,
		"weaponTypes": [
			"弓"
		],
		"minAttack": 3,
		"maxAttack": 4,
		"hitRate": 0.85,
		"attackInterval": 1.1,
		"ultimateGain": 3,
		"combatRules": [
			{
				"id": "hitIce1",
				"trigger": "afterHit",
				"effects": [
					{
						"type": "applyStatus",
						"target": "opponent",
						"status": "ice",
						"stacks": 1
					}
				]
			},
			{
				"id": "iceDamageBonus",
				"trigger": "battleStart",
				"effects": [
					{
						"type": "statusDamageBonus",
						"id": "iceBonus",
						"target": "enemy",
						"status": "ice",
						"every": 1,
						"value": 2
					}
				]
			}
		]
	},
	"I582": {
		"id": "裙䙓利刃",
		"name": "裙䙓利刃",
		"shape": [
			[
				1,
				1
			],
			[
				1,
				0
			]
		],
		"image": "project/images/qunbailiren.png",
		"imageCrop": [
			10,
			22,
			138,
			128,
			312,
			312
		],
		"sourceName": "裙䙓利刃",
		"combatRules": [
			{
				"trigger": "battleStart",
				"effects": [
					{
						"type": "statusDamageBonus",
						"id": "debuffDmg",
						"target": "enemy",
						"status": "allDebuffs",
						"every": 5,
						"value": 1
					}
				]
			}
		],
		"synergyText": "敌方每有5个debuff，本武器伤害+1",
		"rarity": 2,
		"minAttack": 2,
		"maxAttack": 3,
		"hitRate": 0.85,
		"attackInterval": 1.6,
		"ultimateGain": 5,
		"weaponTypes": [
			"短"
		]
	},
	"I583": {
		"id": "语部之弦",
		"name": "语部之弦",
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
		"image": "project/images/yubuzhixian.png",
		"imageCrop": [
			1,
			37,
			74,
			172,
			312,
			312
		],
		"sourceName": "语部之弦",
		"rarity": 2,
		"weaponTypes": [
			"乐器"
		],
		"synergyText": "攻击命中时：随机净化一个debuff，若自身buff10个以上，再随机净化一个debuff\n∧每配置一个乐器，本武器使用间隔-0.1",
		"synergyRules": [
			{
				"id": "instrumentIntervalReduce",
				"trigger": "layout",
				"conditions": [
					{
						"id": "nearbyInstruments",
						"kind": "nearby",
						"relation": "orthogonal",
						"directions": [
							"up",
							"down",
							"left",
							"right"
						],
						"distance": 1,
						"filter": {
							"weaponTypes": [
								"乐器"
							]
						}
					}
				],
				"effects": [
					{
						"target": "self",
						"stat": "attackInterval",
						"operation": "add",
						"value": -0.1,
						"perMatch": true,
						"conditionId": "nearbyInstruments"
					}
				]
			}
		],
		"combatRules": [
			{
				"id": "hitCleanseBase",
				"trigger": "afterHit",
				"effects": [
					{
						"type": "cleanseOneDebuff",
						"target": "self"
					}
				]
			},
			{
				"id": "hitCleanseExtra",
				"trigger": "afterHit",
				"conditions": [
					{
						"kind": "buffStacks",
						"operator": "gte",
						"value": 10
					}
				],
				"effects": [
					{
						"type": "cleanseOneDebuff",
						"target": "self"
					}
				]
			}
		],
		"minAttack": 2,
		"maxAttack": 5,
		"hitRate": 0.95,
		"attackInterval": 2.4,
		"ultimateGain": 5
	},
	"I584": {
		"id": "贤者之证",
		"name": "贤者之证",
		"shape": [
			[
				1
			]
		],
		"image": "project/images/xianzhezhizheng.png",
		"imageCrop": [
			6,
			7,
			60,
			64,
			312,
			312
		],
		"sourceName": "贤者之证",
		"synergyText": "贤者的证明，偷偷告诉你，贤者喜欢黑猫\nMP20以上时：自身获得黑之魅力效果\n黑之魅力效果中：配置在∧的武器的攻击命中时，所有配置在∧的武器伤害+1，并驱散敌方1个buff",
		"combatRules": [
			{
				"id": "applyBlackCharmIfMp20",
				"trigger": "afterAttack",
				"conditions": [
					{
						"kind": "status",
						"target": "self",
						"status": "mp",
						"operator": "gte",
						"value": 20
					}
				],
				"effects": [
					{
						"type": "applyStatus",
						"target": "self",
						"status": "blackCharm",
						"stacks": 1
					}
				]
			},
			{
				"id": "blackCharmNearbyHitBoost",
				"trigger": "afterLinkedWeaponHit",
				"conditions": [
					{
						"kind": "linkedWeapon",
						"directions": [
							"up",
							"down",
							"left",
							"right"
						],
						"distance": 1,
						"filter": {}
					},
					{
						"kind": "status",
						"target": "self",
						"status": "blackCharm",
						"operator": "gte",
						"value": 1
					}
				],
				"effects": [
					{
						"type": "modifyWeaponStat",
						"weaponTarget": "nearby",
						"stat": "attack",
						"operation": "add",
						"value": 1,
						"directions": [
							"up",
							"down",
							"left",
							"right"
						],
						"distance": 1,
						"filter": {}
					},
					{
						"type": "dispelBuff",
						"target": "opponent"
					}
				]
			}
		],
		"rarity": 4,
		"weaponTypes": [
			"道具"
		]
	},
	"I585": {
		"id": "伊甸",
		"name": "伊甸",
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
		"image": "project/images/luqiang.png",
		"imageCrop": [
			22,
			13,
			32,
			287,
			312,
			312
		],
		"sourceName": "伊甸",
		"rarity": 4,
		"weaponTypes": [
			"枪"
		],
		"minAttack": 7,
		"maxAttack": 12,
		"hitRate": 0.95,
		"attackInterval": 2.4,
		"ultimateGain": 2,
		"combatRules": [
			{
				"id": "battleStartNearbyBonuses",
				"trigger": "battleStart",
				"effects": [
					{
						"type": "nearbyApplyStatus",
						"target": "self",
						"status": "block",
						"stacks": 5,
						"directions": [
							"up"
						],
						"distance": 1,
						"relation": "sideBox",
						"span": 3,
						"filter": {},
						"every": 1
					},
					{
						"type": "nearbyApplyStatus",
						"target": "self",
						"status": "block",
						"stacks": 5,
						"directions": [
							"down"
						],
						"distance": 1,
						"relation": "sideBox",
						"span": 3,
						"filter": {},
						"every": 1
					},
					{
						"type": "nearbyApplyStatus",
						"target": "self",
						"status": "regeneration",
						"stacks": 1,
						"directions": [
							"up"
						],
						"distance": 1,
						"relation": "sideBox",
						"span": 3,
						"filter": {},
						"every": 1
					},
					{
						"type": "nearbyApplyStatus",
						"target": "self",
						"status": "regeneration",
						"stacks": 1,
						"directions": [
							"down"
						],
						"distance": 1,
						"relation": "sideBox",
						"span": 3,
						"filter": {},
						"every": 1
					},
					{
						"type": "nearbyMaxHpBonus",
						"target": "self",
						"value": 10,
						"directions": [
							"up"
						],
						"distance": 1,
						"relation": "sideBox",
						"span": 3,
						"filter": {},
						"every": 1
					},
					{
						"type": "nearbyMaxHpBonus",
						"target": "self",
						"value": 10,
						"directions": [
							"down"
						],
						"distance": 1,
						"relation": "sideBox",
						"span": 3,
						"filter": {},
						"every": 1
					}
				]
			},
			{
				"id": "hpAboveHalfDamage",
				"trigger": "beforeAttack",
				"conditions": [
					{
						"kind": "hpPercent",
						"target": "self",
						"operator": "gte",
						"value": 0.5
					}
				],
				"effects": [
					{
						"type": "modifyAttackDamage",
						"operation": "add",
						"value": 5
					}
				]
			}
		],
		"synergyText": "战斗开始时：∧内每配置1个武器，格挡+5，再生+1，最大hp+10\n自身血量在50%以上时，伤害增加5点"
	},
	"I586": {
		"id": "这就是生活",
		"name": "这就是生活",
		"shape": [
			[
				1
			],
			[
				1
			]
		],
		"image": "project/images/zhejiushishenghuo.png",
		"imageCrop": [
			20,
			7,
			35,
			141,
			312,
			312
		],
		"sourceName": "这就是生活",
		"rarity": 3,
		"weaponTypes": [
			"饮料"
		],
		"synergyText": "自身弱体效果10个以上时，仅发动一次：净化10个debuff，回复15HP，发动∧的饮料效果",
		"combatRules": [
			{
				"id": "debuff10TriggerOnce",
				"trigger": "afterTakeDamage",
				"once": true,
				"conditions": [
					{
						"kind": "debuffStacks",
						"target": "self",
						"operator": "gte",
						"value": 10
					}
				],
				"effects": [
					{
						"type": "heal",
						"target": "self",
						"value": 15
					},
					{
						"type": "cleanseOneDebuff",
						"target": "self"
					},
					{
						"type": "triggerWeaponEffects",
						"directions": [
							"up"
						],
						"distance": 1,
						"filter": {
							"weaponTypes": [
								"饮料"
							]
						}
					}
				]
			}
		]
	},
	"I587": {
		"id": "追忆小提琴",
		"name": "追忆小提琴",
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
		"image": "project/images/zhuiyixiaotiqin.png",
		"imageCrop": [
			2,
			8,
			71,
			217,
			312,
			312
		],
		"sourceName": "追忆小提琴",
		"rarity": 2,
		"weaponTypes": [
			"乐器"
		],
		"synergyRules": [
			{
				"id": "instrumentIntervalUp",
				"trigger": "layout",
				"conditions": [
					{
						"id": "instrumentsUp",
						"kind": "nearby",
						"relation": "sideBox",
						"directions": [
							"up"
						],
						"distance": 1,
						"span": 3,
						"filter": {
							"weaponTypes": [
								"乐器"
							]
						}
					}
				],
				"effects": [
					{
						"target": "self",
						"stat": "attackInterval",
						"operation": "add",
						"value": -0.1,
						"perMatch": true,
						"conditionId": "instrumentsUp"
					}
				]
			},
			{
				"id": "instrumentIntervalDown",
				"trigger": "layout",
				"conditions": [
					{
						"id": "instrumentsDown",
						"kind": "nearby",
						"relation": "sideBox",
						"directions": [
							"down"
						],
						"distance": 1,
						"span": 3,
						"filter": {
							"weaponTypes": [
								"乐器"
							]
						}
					}
				],
				"effects": [
					{
						"target": "self",
						"stat": "attackInterval",
						"operation": "add",
						"value": -0.1,
						"perMatch": true,
						"conditionId": "instrumentsDown"
					}
				]
			}
		],
		"combatRules": [
			{
				"id": "hitReflection1",
				"trigger": "afterHit",
				"effects": [
					{
						"type": "applyStatus",
						"target": "self",
						"status": "reflection",
						"stacks": 1
					}
				]
			},
			{
				"id": "hitReflectionExtra",
				"trigger": "afterHit",
				"conditions": [
					{
						"kind": "buffStacks",
						"operator": "gte",
						"value": 10
					}
				],
				"effects": [
					{
						"type": "applyStatus",
						"target": "self",
						"status": "reflection",
						"stacks": 1
					}
				]
			}
		],
		"synergyText": "攻击命中时：自身反射+1，若自身buff10个以上，额外反射+1；\n∧每配置一个乐器，本物品使用间隔-0.1",
		"minAttack": 2,
		"maxAttack": 5,
		"hitRate": 0.95,
		"attackInterval": 2.4,
		"ultimateGain": 5
	},
	"I588": {
		"id": "野猪达尔克",
		"name": "野猪达尔克",
		"shape": [
			[
				1,
				1
			]
		],
		"image": "project/images/yezhu.png",
		"imageCrop": [
			9,
			5,
			135,
			69,
			312,
			312
		],
		"sourceName": "野猪达尔克",
		"rarity": 3,
		"weaponTypes": [
			"动物"
		],
		"synergyRules": [
			{
				"id": "foodAnimalIntervalReduce",
				"trigger": "layout",
				"conditions": [
					{
						"id": "nearbyFoodAnimals",
						"kind": "nearby",
						"relation": "orthogonal",
						"directions": [
							"up",
							"down",
							"left",
							"right"
						],
						"distance": 1,
						"filter": {
							"weaponTypes": [
								"食物",
								"动物"
							]
						}
					}
				],
				"effects": [
					{
						"target": "self",
						"stat": "attackInterval",
						"operation": "add",
						"value": -0.1,
						"perMatch": true,
						"conditionId": "nearbyFoodAnimals"
					}
				]
			}
		],
		"combatRules": [
			{
				"id": "hitRemoveBlock5",
				"trigger": "afterHit",
				"effects": [
					{
						"type": "removeStatus",
						"target": "opponent",
						"status": "block",
						"stacks": 5
					}
				]
			}
		],
		"synergyText": "攻击时：敌方格挡-5\n∧内每配置一个食物或动物，本物品使用间隔-0.1",
		"minAttack": 7,
		"maxAttack": 10,
		"hitRate": 0.9,
		"attackInterval": 2.6,
		"ultimateGain": 0
	},
	"I589": {
		"id": "金刚晶碎片",
		"name": "金刚晶碎片",
		"shape": [
			[
				1
			]
		],
		"image": "project/images/jingangjingsuipian.png",
		"imageCrop": [
			23,
			14,
			28,
			49,
			312,
			312
		],
		"sourceName": "金刚晶碎片",
		"rarity": 2,
		"weaponTypes": [
			"道具"
		],
		"combatRules": [
			{
				"id": "battleStartRandomBuffs2",
				"trigger": "battleStart",
				"effects": [
					{
						"type": "applyRandomBuffs",
						"target": "self",
						"count": 2,
						"stacks": 1
					}
				]
			}
		],
		"synergyText": "战斗开始时：自身随机buff+2"
	},
	"I590": {
		"id": "决斗盾",
		"name": "决斗盾",
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
		"image": "project/images/tiedun.png",
		"imageCrop": [
			14,
			14,
			129,
			129,
			312,
			312
		],
		"sourceName": "决斗盾",
		"rarity": 1,
		"combatRules": [
			{
				"id": "chanceReduceDamage",
				"trigger": "beforeReceiveDamage",
				"conditions": [
					{
						"kind": "chance",
						"base": 0.2
					}
				],
				"effects": [
					{
						"type": "modifyReceivedDamage",
						"operation": "add",
						"value": -5
					}
				]
			}
		],
		"synergyText": "被攻击时：20%概率降低受到的5点伤害",
		"weaponTypes": [
			"盾"
		]
	},
	"I591": {
		"id": "平底锅",
		"name": "平底锅",
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
		"image": "project/images/tieguo.png",
		"imageCrop": [
			2,
			39,
			72,
			169,
			312,
			312
		],
		"sourceName": "平底锅",
		"rarity": 2,
		"synergyRules": [
			{
				"id": "foodDamageBoost",
				"trigger": "layout",
				"conditions": [
					{
						"id": "nearbyFoods",
						"kind": "nearby",
						"relation": "orthogonal",
						"directions": [
							"up",
							"down",
							"left",
							"right"
						],
						"distance": 1,
						"filter": {
							"weaponTypes": [
								"食物"
							]
						}
					}
				],
				"effects": [
					{
						"target": "self",
						"stat": "attack",
						"operation": "add",
						"value": 1,
						"perMatch": true,
						"conditionId": "nearbyFoods"
					}
				]
			}
		],
		"synergyText": "∧每配置一个食物，本物品伤害+1",
		"minAttack": 3,
		"maxAttack": 5,
		"hitRate": 0.8,
		"attackInterval": 2.4,
		"ultimateGain": 5,
		"weaponTypes": [
			"剑"
		]
	},
	"I592": {
		"id": "史莱姆铃铛",
		"name": "史莱姆铃铛",
		"shape": [
			[
				1
			],
			[
				1
			]
		],
		"image": "project/images/tongguanzi.png",
		"imageCrop": [
			1,
			34,
			74,
			94,
			312,
			312
		],
		"sourceName": "史莱姆铃铛",
		"weaponTypes": [
			"乐器"
		],
		"rarity": 2,
		"minAttack": 1,
		"maxAttack": 2,
		"hitRate": 0.95,
		"attackInterval": 3.5,
		"ultimateGain": 1,
		"combatRules": [
			{
				"id": "nearbyWeaponHitsHealRegen",
				"trigger": "afterLinkedWeaponHit",
				"every": 5,
				"conditions": [
					{
						"kind": "linkedWeapon",
						"directions": [
							"up",
							"down",
							"left",
							"right"
						],
						"distance": 1,
						"filter": {}
					}
				],
				"effects": [
					{
						"type": "heal",
						"target": "self",
						"value": 5
					},
					{
						"type": "applyStatus",
						"target": "self",
						"status": "regeneration",
						"stacks": 1
					}
				]
			}
		],
		"synergyText": "∧的武器每攻击5次，回复5HP,再生+1"
	},
	"I593": {
		"id": "阿斯克勒庇俄斯之杖",
		"name": "阿斯克勒庇俄斯之杖",
		"shape": [
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
			]
		],
		"image": "project/images/asikeleibiesizhizhang.png",
		"imageCrop": [
			32,
			5,
			167,
			228,
			312,
			312
		],
		"sourceName": "阿斯克勒庇俄斯之杖",
		"rarity": 4,
		"synergyText": "攻击命中时：自身MP +1，净化1个debuff\n生命值50%以下时：若处于黑之魅力中，仅触发一次，恢复100生命值",
		"combatRules": [
			{
				"id": "hitMpCleanse",
				"trigger": "afterHit",
				"conditions": [],
				"effects": [
					{
						"type": "applyStatus",
						"target": "self",
						"status": "mp",
						"stacks": 1
					},
					{
						"type": "cleanseOneDebuff",
						"target": "self"
					}
				]
			},
			{
				"id": "blackCharmLowHpHeal",
				"trigger": "afterTakeDamage",
				"once": true,
				"conditions": [
					{
						"kind": "hpPercent",
						"target": "self",
						"operator": "lte",
						"value": 0.5
					},
					{
						"kind": "status",
						"target": "self",
						"status": "blackCharm",
						"operator": "gte",
						"value": 1
					}
				],
				"effects": [
					{
						"type": "heal",
						"target": "self",
						"value": 100
					}
				]
			}
		],
		"minAttack": 9,
		"maxAttack": 13,
		"hitRate": 0.9,
		"attackInterval": 2.1,
		"ultimateGain": 2,
		"weaponTypes": [
			"杖"
		]
	},
	"I594": {
		"id": "亥姆霍兹",
		"name": "亥姆霍兹",
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
		"image": "project/images/yinxiang.png",
		"imageCrop": [
			6,
			8,
			140,
			142,
			312,
			312
		],
		"sourceName": "亥姆霍兹",
		"rarity": 3,
		"minAttack": 3,
		"maxAttack": 5,
		"hitRate": 0.95,
		"attackInterval": 1.8,
		"ultimateGain": 5,
		"weaponTypes": [
			"乐器"
		],
		"combatRules": [
			{
				"id": "nearbyGuitarHitBuffs",
				"trigger": "afterLinkedWeaponHit",
				"conditions": [
					{
						"kind": "linkedWeapon",
						"directions": [
							"left",
							"right"
						],
						"distance": 1,
						"filter": {
							"weaponTypes": [
								"吉他"
							]
						}
					}
				],
				"effects": [
					{
						"type": "applyStatus",
						"target": "self",
						"status": "excitation",
						"stacks": 1
					},
					{
						"type": "applyStatus",
						"target": "self",
						"status": "highSpirit",
						"stacks": 1
					}
				]
			},
			{
				"trigger": "battleStart",
				"effects": [
					{
						"type": "statusExtraAttack",
						"id": "excitationExtra",
						"target": "self",
						"status": "excitation",
						"every": 10,
						"value": 1
					}
				]
			}
		],
		"synergyText": "∧的吉他命中时：自身激奏+1，高扬+1；\n自身激奏每10层,本武器攻击次数+1"
	},
	"I595": {
		"id": "打扰一下",
		"name": "打扰一下",
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
		"image": "project/images/fenglongwanou.png",
		"imageCrop": [
			11,
			5,
			122,
			146,
			312,
			312
		],
		"sourceName": "打扰一下",
		"rarity": 3,
		"weaponTypes": [
			"乐器"
		],
		"synergyRules": [
			{
				"id": "nearbyWeaponIntervalReduce",
				"trigger": "layout",
				"conditions": [
					{
						"id": "nearbyAll",
						"kind": "nearby",
						"relation": "orthogonal",
						"directions": [
							"up",
							"down",
							"left",
							"right"
						],
						"distance": 1,
						"filter": {}
					}
				],
				"effects": [
					{
						"target": "matches",
						"conditionId": "nearbyAll",
						"stat": "attackInterval",
						"operation": "add",
						"value": -0.2
					}
				]
			}
		],
		"synergyText": "∧内的武器使用间隔-0.2",
		"minAttack": 5,
		"maxAttack": 7,
		"hitRate": 1,
		"attackInterval": 4,
		"ultimateGain": 0
	},
	"I596": {
		"id": "香榭丽舍",
		"name": "香榭丽舍",
		"shape": [
			[
				1
			],
			[
				1
			]
		],
		"image": "project/images/xiangxielishe.png",
		"imageCrop": [
			2,
			7,
			73,
			132,
			312,
			312
		],
		"sourceName": "香榭丽舍",
		"rarity": 3,
		"minAttack": 3,
		"maxAttack": 5,
		"hitRate": 0.95,
		"attackInterval": 2.4,
		"ultimateGain": 5,
		"weaponTypes": [
			"乐器"
		],
		"combatRules": [
			{
				"id": "hitNearbyLeftRandomBuff",
				"trigger": "afterHit",
				"effects": [
					{
						"type": "nearbyRandomBuff",
						"target": "self",
						"directions": [
							"left"
						],
						"distance": 1,
						"filter": {},
						"every": 1,
						"stacks": 1
					}
				]
			},
			{
				"trigger": "afterHit",
				"once": true,
				"conditions": [
					{
						"kind": "buffStacks",
						"operator": "gte",
						"value": 20
					}
				],
				"effects": [
					{
						"type": "modifyWeaponStat",
						"stat": "attack",
						"operation": "add",
						"value": 3
					}
				]
			}
		],
		"synergyText": "攻击命中时：∧内每配置一个物品自身随机buff+1，\n自身buff20个以上时，伤害+3"
	},
	"I597": {
		"id": "好香蕉",
		"name": "好香蕉",
		"shape": [
			[
				1,
				0
			],
			[
				1,
				1
			]
		],
		"image": "project/images/xiangjiao.png",
		"imageCrop": [
			15,
			12,
			128,
			130,
			312,
			312
		],
		"sourceName": "好香蕉",
		"rarity": 1,
		"attackInterval": 3.5,
		"synergyRules": [
			{
				"id": "foodIntervalReduce",
				"trigger": "layout",
				"conditions": [
					{
						"id": "nearbyFoods",
						"kind": "nearby",
						"relation": "orthogonal",
						"directions": [
							"up",
							"down",
							"left",
							"right"
						],
						"distance": 1,
						"filter": {
							"weaponTypes": [
								"食物"
							]
						}
					}
				],
				"effects": [
					{
						"target": "self",
						"stat": "attackInterval",
						"operation": "add",
						"value": -0.1,
						"perMatch": true,
						"conditionId": "nearbyFoods"
					}
				]
			}
		],
		"combatRules": [
			{
				"id": "attackHeal4",
				"trigger": "afterAttack",
				"conditions": [],
				"effects": [
					{
						"type": "heal",
						"target": "self",
						"value": 4
					}
				]
			}
		],
		"synergyText": "攻击时：回复自身4HP，\n∧内每配置1个食物，本武器使用间隔-0.1",
		"weaponTypes": [
			"食物"
		]
	},
	"I598": {
		"id": "鬼丸国綱",
		"name": "鬼丸国綱",
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
		"image": "project/images/guiwanguogang.png",
		"imageCrop": [
			11,
			20,
			54,
			272,
			312,
			312
		],
		"sourceName": "鬼丸国綱",
		"rarity": 4,
		"minAttack": 4,
		"maxAttack": 7,
		"hitRate": 1,
		"attackInterval": 1.6,
		"ultimateGain": 10,
		"combatRules": [
			{
				"id": "ignoreBlockAlways",
				"trigger": "battleStart",
				"effects": [
					{
						"type": "ignoreBlockAlways"
					}
				]
			},
			{
				"id": "chanceDamagePlus3",
				"trigger": "beforeAttack",
				"conditions": [
					{
						"kind": "chance",
						"base": 0.5
					}
				],
				"effects": [
					{
						"type": "modifyAttackDamage",
						"operation": "add",
						"value": 3
					}
				]
			}
		],
		"synergyText": "攻击时：50%概率使本次攻击伤害 +3\n该武器造成的伤害无视敌方格挡",
		"weaponTypes": [
			"刀"
		]
	},
	"I599": {
		"id": "魔剑士之证",
		"name": "魔剑士之证",
		"shape": [
			[
				1
			]
		],
		"image": "project/images/mojianshizhizheng.png",
		"imageCrop": [
			7,
			7,
			60,
			60,
			312,
			312
		],
		"sourceName": "魔剑士之证",
		"synergyText": "魔剑士的证明，混沌的魔剑士擅长干坏事\n战斗开始时：每有1个配置在∧内的武器，对敌方随机施加1个debuff\n奥义发动时：对敌方随机施加12个debuff\n配置∧内的武器的武器攻击命中时：对敌方随机施加1个debuff",
		"combatRules": [
			{
				"id": "battleStartRandomDebuffPerNearby",
				"trigger": "battleStart",
				"effects": [
					{
						"type": "applyRandomDebuff",
						"target": "opponent",
						"stacksFrom": {
							"kind": "nearbyCount",
							"directions": [
								"up",
								"down",
								"left",
								"right"
							],
							"distance": 1,
							"filter": {},
							"multiplier": 1
						}
					}
				]
			},
			{
				"id": "ultimateRandomDebuff12",
				"trigger": "afterUltimate",
				"effects": [
					{
						"type": "applyRandomDebuff",
						"target": "opponent",
						"stacks": 12
					}
				]
			},
			{
				"id": "nearbyWeaponHitRandomDebuff",
				"trigger": "afterLinkedWeaponHit",
				"conditions": [
					{
						"kind": "linkedWeapon",
						"directions": [
							"up",
							"down",
							"left",
							"right"
						],
						"distance": 1,
						"filter": {}
					}
				],
				"effects": [
					{
						"type": "applyRandomDebuff",
						"target": "opponent",
						"stacks": 1
					}
				]
			}
		],
		"rarity": 4,
		"weaponTypes": [
			"道具"
		]
	},
	"I600": {
		"id": "暗夜鲸头鹳",
		"name": "暗夜鲸头鹳",
		"shape": [
			[
				0,
				1,
				0
			],
			[
				0,
				1,
				1
			],
			[
				0,
				1,
				0
			]
		],
		"image": "project/images/tuoniao.png",
		"imageCrop": [
			6,
			9,
			122,
			214,
			312,
			312
		],
		"sourceName": "暗夜鲸头鹳",
		"rarity": 4,
		"weaponTypes": [
			"动物"
		],
		"minAttack": 7,
		"maxAttack": 10,
		"hitRate": 0.9,
		"attackInterval": 2.2,
		"ultimateGain": 0,
		"synergyRules": [
			{
				"id": "foodAnimalIntervalReduce",
				"trigger": "layout",
				"conditions": [
					{
						"id": "nearbyFoodAnimals",
						"kind": "nearby",
						"relation": "orthogonal",
						"directions": [
							"up",
							"down",
							"left",
							"right"
						],
						"distance": 1,
						"filter": {
							"weaponTypes": [
								"食物",
								"动物"
							]
						}
					}
				],
				"effects": [
					{
						"target": "self",
						"stat": "attackInterval",
						"operation": "add",
						"value": -0.1,
						"perMatch": true,
						"conditionId": "nearbyFoodAnimals"
					}
				]
			}
		],
		"combatRules": [
			{
				"id": "hitDarkness1",
				"trigger": "afterHit",
				"effects": [
					{
						"type": "applyStatus",
						"target": "opponent",
						"status": "darkness",
						"stacks": 1
					}
				]
			}
		],
		"synergyText": "攻击命中时：敌方黑暗 +1\n每有1个配置∧内的食物或动物，使用间隔 -0.1"
	},
	"I601": {
		"id": "守卫之鹿",
		"name": "守卫之鹿",
		"shape": [
			[
				1
			],
			[
				1
			]
		],
		"image": "project/images/lu.png",
		"imageCrop": [
			2,
			33,
			74,
			99,
			312,
			312
		],
		"sourceName": "守卫之鹿",
		"rarity": 3,
		"weaponTypes": [
			"动物"
		],
		"synergyText": "攻击命中时：自身格挡+3\n每有1个配置在∧内的食物或动物，使用间隔-0.1",
		"minAttack": 5,
		"maxAttack": 8,
		"hitRate": 0.9,
		"attackInterval": 2.4,
		"ultimateGain": 0,
		"combatRules": [
			{
				"id": "hitBlock3",
				"trigger": "afterHit",
				"effects": [
					{
						"type": "applyStatus",
						"target": "self",
						"status": "block",
						"stacks": 3
					}
				]
			}
		],
		"synergyRules": [
			{
				"id": "foodAnimalIntervalReduce",
				"trigger": "layout",
				"conditions": [
					{
						"id": "nearbyFoodAnimals",
						"kind": "nearby",
						"relation": "orthogonal",
						"directions": [
							"up",
							"down",
							"left",
							"right"
						],
						"distance": 1,
						"filter": {
							"weaponTypes": [
								"食物",
								"动物"
							]
						}
					}
				],
				"effects": [
					{
						"target": "self",
						"stat": "attackInterval",
						"operation": "add",
						"value": -0.1,
						"perMatch": true,
						"conditionId": "nearbyFoodAnimals"
					}
				]
			}
		]
	}
}
