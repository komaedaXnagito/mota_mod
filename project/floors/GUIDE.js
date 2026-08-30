main.floors.GUIDE=
{
    "floorId": "GUIDE",
    "title": "魔塔 第50层",
    "name": "第 50 层",
    "width": 13,
    "height": 13,
    "canFlyTo": false,
    "canFlyFrom": false,
    "canUseQuickShop": false,
    "images": [],
    "ratio": 5,
    "defaultGround": "ground",
    "firstArrive": [
        {
            "type": "setValue",
            "name": "flag:disableOpenBackpack",
            "value": "true"
        }
    ],
    "eachArrive": [],
    "parallelDo": "",
    "events": {
        "4,9": [
            "\t[艾露达,N447]你好，欢迎来到碧蓝幻想的世界，我是艾露达，接下来由我带你了解这个世界",
            "\t[艾露达,N447]首先，我要没收你的双手！",
            "\t[勇者,hero]什么？那我怎么拿起我的剑盾，我怎么和怪物战斗？你这坏猫！",
            "\t[艾露达,N447]别担心，在碧蓝幻想里，不需要你自己战斗，我会赐予你魔法背包，你可以驱使其中的武器完成战斗",
            {
                "type": "setBlock",
                "number": "I385",
                "loc": [
                    [
                        5,
                        9
                    ]
                ]
            },
            "\t[艾露达,N447]去捡起魔法背包吧，我给你1000金币，你可以去商店消费一波",
            {
                "type": "setValue",
                "name": "status:money",
                "value": "1000"
            },
            {
                "type": "setBlock",
                "number": "blueShop",
                "loc": [
                    [
                        4,
                        11
                    ]
                ]
            },
            {
                "type": "setBlock",
                "number": "N447",
                "loc": [
                    [
                        6,
                        9
                    ]
                ]
            },
            {
                "type": "setValue",
                "name": "flag:guideWeaponShop",
                "value": "1"
            },
            {
                "type": "hide",
                "remove": true,
                "time": 0
            }
        ],
        "4,11": [
            {
                "type": "if",
                "condition": "(flag:guideWeaponShop===1)",
                "true": [
                    {
                        "type": "function",
                        "function": "function(){\ncore.plugin.openBackpackShop()\n}"
                    }
                ]
            }
        ],
        "6,9": [
            {
                "type": "if",
                "condition": "(core.plugin.getBackpackState().placed.length === 0)",
                "true": [
                    "\t[艾露达,N447]你去商店看看呀，给你钱你就要花"
                ],
                "false": [
                    "\t[艾露达,N447]你消费完啦，那我们来试试战斗吧",
                    {
                        "type": "setBlock",
                        "number": "greenSlime",
                        "loc": [
                            [
                                7,
                                9
                            ]
                        ]
                    },
                    {
                        "type": "setBlock",
                        "number": "N447",
                        "loc": [
                            [
                                8,
                                9
                            ]
                        ]
                    },
                    {
                        "type": "hide",
                        "remove": true,
                        "time": 0
                    }
                ]
            }
        ],
        "8,9": [
            "\t[艾露达,N447]怎么样，很神奇吧，哪怕你失去了双手，魔法背包内的武器都可以自行战斗哦",
            "\t[艾露达,N447]相信你也看到了，你的背包能够装备的武器是有限的，并且不同的武器之间有特殊的联动效果",
            "\t[艾露达,N447]我再给你1000块钱，前面的商店可以购买背包格子，去买一点格子吧",
            {
                "type": "setValue",
                "name": "status:money",
                "operator": "+=",
                "value": "1000"
            },
            {
                "type": "setBlock",
                "number": "blueShop",
                "loc": [
                    [
                        8,
                        11
                    ]
                ]
            },
            {
                "type": "setBlock",
                "number": "0",
                "loc": [
                    [
                        8,
                        10
                    ]
                ]
            },
            {
                "type": "setBlock",
                "number": "N447",
                "loc": [
                    [
                        6,
                        8
                    ]
                ]
            },
            {
                "type": "hide",
                "remove": true,
                "time": 0
            }
        ],
        "8,11": [
            {
                "type": "openShop",
                "id": "shop2",
                "open": true
            }
        ],
        "6,8": [
            {
                "type": "if",
                "condition": "(item:I429===0)",
                "true": [
                    "\t[艾露达,N447]你去商店看看呀，给你钱你就要花"
                ],
                "false": [
                    "\t[艾露达,N447]背包格子需要在背包界面操作扩容，点击道具栏的背包可以打开背包哦",
                    {
                        "type": "setValue",
                        "name": "flag:inGuide",
                        "value": "true"
                    },
                    {
                        "type": "setValue",
                        "name": "flag:disableOpenBackpack",
                        "value": "false"
                    },
                    {
                        "type": "hide",
                        "remove": true
                    },
                    {
                        "type": "setBlock",
                        "number": "E448",
                        "loc": [
                            [
                                6,
                                1
                            ]
                        ]
                    },
                    {
                        "type": "setBlock",
                        "number": "32",
                        "loc": [
                            [
                                6,
                                2
                            ]
                        ]
                    },
                    {
                        "type": "setBlock",
                        "number": "32",
                        "loc": [
                            [
                                6,
                                3
                            ]
                        ]
                    },
                    {
                        "type": "setBlock",
                        "number": "32",
                        "loc": [
                            [
                                6,
                                4
                            ]
                        ]
                    },
                    {
                        "type": "setBlock",
                        "number": "32",
                        "loc": [
                            [
                                6,
                                5
                            ]
                        ]
                    },
                    {
                        "type": "setBlock",
                        "number": "32",
                        "loc": [
                            [
                                6,
                                6
                            ]
                        ]
                    },
                    {
                        "type": "setBlock",
                        "number": "32",
                        "loc": [
                            [
                                6,
                                7
                            ]
                        ]
                    },
                    {
                        "type": "setBlock",
                        "number": "32",
                        "loc": [
                            [
                                6,
                                8
                            ]
                        ]
                    },
                    {
                        "type": "setBlock",
                        "number": "32",
                        "loc": [
                            [
                                6,
                                9
                            ]
                        ]
                    },
                    {
                        "type": "useItem",
                        "id": "I385"
                    }
                ]
            }
        ]
    },
    "changeFloor": {},
    "beforeBattle": {
        "7,9": [
            {
                "type": "setValue",
                "name": "flag:inGuide",
                "value": "true"
            }
        ]
    },
    "afterBattle": {
        "6,1": [
            "\t[艾露达,N447]你以为你已非常强大了吗 嘿嘿错了 只是我今天状态不佳而已 ",
            "\t[艾露达,N447]期待在魔塔中与你正式的相会",
            {
                "type": "win",
                "reason": "教程-击败艾露达"
            }
        ],
        "7,9": [
            {
                "type": "setValue",
                "name": "flag:inGuide",
                "value": "false"
            }
        ]
    },
    "afterGetItem": {},
    "afterOpenDoor": {},
    "autoEvent": {},
    "cannotMove": {},
    "cannotMoveIn": {},
    "map": [
    [331,331,331,331,331,331,331,331,331,331,331,331,331],
    [331,331,331,331,331,331,331,331,331,331,331,331,331],
    [331,331,331,331,331,331,331,331,331,331,331,331,331],
    [331,331,331,331,331,331,331,331,331,331,331,331,331],
    [331,331,331,331,331,331,331,331,331,331,331,331,331],
    [331,331,331,331,331,331,331,331,331,331,331,331,331],
    [331,331,331,331,331,331,331,331,331,331,331,331,331],
    [331,331,331,331,331,331,331,331,331,331,331,331,331],
    [331,331,331,331,331,331,331,331,331,331,331,331,331],
    [331,331,331,331,447,331,331,331,331,331,331,331,331],
    [331,331,331,331,  0,331,331,331,331,331,331,331,331],
    [331,331,331,331,331,331,331,331,331,331,331,331,331],
    [331,331,331,331,331,331,331,331,331,331,331,331,331]
],
    "bgmap": [

],
    "fgmap": [

]
}