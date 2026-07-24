main.floors.MT10=
{
    "floorId": "MT10",
    "title": "魔塔 第10层",
    "name": "第 10 层",
    "width": 13,
    "height": 13,
    "map": [
    [330,330,330,330,330,330,330,330,330,330,330,330,330],
    [330,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,330],
    [330,  1,  1,  1,  1,  0,  0,  0,  1,  1,  1,  1,330],
    [330,209,209,209,  1,  1,  0,  1,  1,209,209,209,330],
    [330,  0,210,  0, 85,  0,211,  0, 85,  0,210,  0,330],
    [330,  1,  1,  1,  1,  0,  0,  0,  1,  1,  1,  1,330],
    [330,209, 28,209,  1,  1,  0,  1,  1,209, 27,209,330],
    [330,  0,210,  0,  1,  1,  0,  1,  1,  0,210,  0,330],
    [330,  0,  0,  0,  1,  1,  0,  1,  1,  0,  0,  0,330],
    [330, 81,  1, 81,  1,  1, 83,  1,  1, 81,  1, 81,330],
    [330,  0,  1,  0,  1,  0,  0,  0,  1,  0,  1,  0,330],
    [330, 88,  1,  0,217,  0, 87,  0,217,  0,  1, 32,330],
    [330,330,330,330,330,330,330,330,330,330,330,330,330]
],
    "canFlyTo": true,
    "canFlyFrom": true,
    "canUseQuickShop": true,
    "images": [],
    "ratio": 1,
    "defaultGround": "ground",
    "bgm": "section1.mp3",
    "firstArrive": [],
    "eachArrive": [],
    "parallelDo": "",
    "events": {
        "6,5": [
            {
                "type": "if",
                "condition": "blockId:6,4",
                "true": [
                    {
                        "type": "if",
                        "condition": "blockId:6,1",
                        "true": [],
                        "false": [
                            {
                                "type": "closeDoor",
                                "id": "specialDoor",
                                "loc": [
                                    6,
                                    7
                                ],
                                "async": true
                            },
                            {
                                "type": "openDoor",
                                "loc": [
                                    4,
                                    4
                                ],
                                "async": true
                            },
                            {
                                "type": "openDoor",
                                "loc": [
                                    8,
                                    4
                                ],
                                "async": true
                            },
                            {
                                "type": "setBlock",
                                "number": "0",
                                "loc": [
                                    [
                                        5,
                                        6
                                    ]
                                ]
                            },
                            {
                                "type": "setBlock",
                                "number": "0",
                                "loc": [
                                    [
                                        7,
                                        6
                                    ]
                                ]
                            },
                            {
                                "type": "waitAsync"
                            },
                            "\t[骷髅队长,skeletonCaptain]哈哈哈 你是如此的幸运能安全到达这里 但现在好运离你而去了 你中埋伏了 弟兄们给我上",
                            {
                                "type": "playBgm",
                                "name": "boss1.mp3"
                            },
                            {
                                "type": "move",
                                "loc": [
                                    6,
                                    4
                                ],
                                "time": 200,
                                "keep": true,
                                "async": true,
                                "steps": [
                                    "up:3"
                                ]
                            },
                            {
                                "type": "move",
                                "loc": [
                                    2,
                                    4
                                ],
                                "time": 200,
                                "keep": true,
                                "async": true,
                                "steps": [
                                    "right:3",
                                    "down:2",
                                    "right:1"
                                ]
                            },
                            {
                                "type": "move",
                                "loc": [
                                    10,
                                    4
                                ],
                                "time": 200,
                                "keep": true,
                                "async": true,
                                "steps": [
                                    "left:4"
                                ]
                            },
                            {
                                "type": "sleep",
                                "time": 600
                            },
                            {
                                "type": "move",
                                "loc": [
                                    3,
                                    3
                                ],
                                "time": 200,
                                "keep": true,
                                "async": true,
                                "steps": [
                                    "down:1",
                                    "right:2",
                                    "down:2"
                                ]
                            },
                            {
                                "type": "move",
                                "loc": [
                                    9,
                                    3
                                ],
                                "time": 200,
                                "keep": true,
                                "async": true,
                                "steps": [
                                    "down:1",
                                    "left:2",
                                    "down:2"
                                ]
                            },
                            {
                                "type": "sleep",
                                "time": 200
                            },
                            {
                                "type": "move",
                                "loc": [
                                    2,
                                    3
                                ],
                                "time": 200,
                                "keep": true,
                                "async": true,
                                "steps": [
                                    "down:1",
                                    "right:3",
                                    "down:1"
                                ]
                            },
                            {
                                "type": "move",
                                "loc": [
                                    10,
                                    3
                                ],
                                "time": 200,
                                "keep": true,
                                "async": true,
                                "steps": [
                                    "down:1",
                                    "left:3",
                                    "down:1"
                                ]
                            },
                            {
                                "type": "sleep",
                                "time": 200
                            },
                            {
                                "type": "move",
                                "loc": [
                                    1,
                                    3
                                ],
                                "time": 200,
                                "keep": true,
                                "async": true,
                                "steps": [
                                    "down:1",
                                    "right:4"
                                ]
                            },
                            {
                                "type": "move",
                                "loc": [
                                    11,
                                    3
                                ],
                                "time": 200,
                                "keep": true,
                                "async": true,
                                "steps": [
                                    "down:1",
                                    "left:4"
                                ]
                            },
                            {
                                "type": "waitAsync"
                            },
                            {
                                "type": "closeDoor",
                                "id": "specialDoor",
                                "loc": [
                                    4,
                                    4
                                ],
                                "async": true
                            },
                            {
                                "type": "closeDoor",
                                "id": "specialDoor",
                                "loc": [
                                    6,
                                    3
                                ],
                                "async": true
                            },
                            {
                                "type": "closeDoor",
                                "id": "specialDoor",
                                "loc": [
                                    8,
                                    4
                                ],
                                "async": true
                            },
                            {
                                "type": "waitAsync"
                            },
                            {
                                "type": "hide",
                                "remove": true
                            }
                        ]
                    }
                ]
            }
        ],
        "6,9": [
            {
                "type": "if",
                "condition": "blockId:6,1",
                "true": [],
                "false": [
                    {
                        "type": "if",
                        "condition": "blockId:6,4",
                        "true": [],
                        "false": [
                            {
                                "type": "setBlock",
                                "number": "thief",
                                "loc": [
                                    [
                                        1,
                                        10
                                    ]
                                ],
                                "time": 500
                            },
                            {
                                "type": "move",
                                "loc": [
                                    1,
                                    10
                                ],
                                "time": 200,
                                "keep": true,
                                "steps": [
                                    "up:2",
                                    "right:2",
                                    "down:3",
                                    "right:2",
                                    "up:1",
                                    "right:1"
                                ]
                            },
                            "\t[小偷,thief]你总算是帮我解决了这麻烦的骷髅队长 我终于可以上去了 我听说银盾在11楼 银剑在17楼 这消息不知道对你是否有用 下次见",
                            {
                                "type": "hide",
                                "loc": [
                                    [
                                        6,
                                        10
                                    ]
                                ],
                                "remove": true,
                                "time": 300
                            },
                            {
                                "type": "hide",
                                "remove": true,
                                "time": 0
                            }
                        ]
                    }
                ]
            }
        ],
        "6,2": [
            {
                "type": "if",
                "condition": "blockId:6,1",
                "true": [
                    "\t[骷髅队长,skeletonCaptain]你怎能杀出重围 我是绝不会让你通过的 来吧 我要与你决斗",
                    {
                        "type": "hide",
                        "remove": true
                    }
                ]
            }
        ],
        "6,11": {
            "trigger": null,
            "enable": false,
            "noPass": null,
            "displayDamage": true,
            "opacity": 1,
            "filter": {
                "blur": 0,
                "hue": 0,
                "grayscale": 0,
                "invert": false,
                "shadow": 0
            },
            "data": []
        }
    },
    "changeFloor": {
        "1,11": {
            "floorId": ":before",
            "stair": "upFloor"
        },
        "6,11": {
            "floorId": ":next",
            "stair": "downFloor"
        }
    },
    "afterBattle": {
        "5,4": [
            {
                "type": "function",
                "function": "function(){\nvar bool = true;\nvar loc_arr = [\n\t[5, 4],\n\t[6, 4],\n\t[7, 4],\n\t[5, 5],\n\t[7, 5],\n\t[5, 6],\n\t[6, 6],\n\t[7, 6],\n]\nloc_arr.forEach(loc => {\n\tif (core.getBlockCls(loc[0], loc[1]) == \"enemys\") {\n\t\tbool = false;\n\t}\n});\ncore.setFlag(\"open_yes\", bool)\n}"
            },
            {
                "type": "if",
                "condition": "flag:open_yes",
                "true": [
                    {
                        "type": "openDoor",
                        "loc": [
                            6,
                            3
                        ]
                    }
                ]
            }
        ],
        "5,5": [
            {
                "type": "function",
                "function": "function(){\nvar bool = true;\nvar loc_arr = [\n\t[5, 4],\n\t[6, 4],\n\t[7, 4],\n\t[5, 5],\n\t[7, 5],\n\t[5, 6],\n\t[6, 6],\n\t[7, 6],\n]\nloc_arr.forEach(loc => {\n\tif (core.getBlockCls(loc[0], loc[1]) == \"enemys\") {\n\t\tbool = false;\n\t}\n});\ncore.setFlag(\"open_yes\", bool)\n}"
            },
            {
                "type": "if",
                "condition": "flag:open_yes",
                "true": [
                    {
                        "type": "openDoor",
                        "loc": [
                            6,
                            3
                        ]
                    }
                ]
            }
        ],
        "5,6": [
            {
                "type": "function",
                "function": "function(){\nvar bool = true;\nvar loc_arr = [\n\t[5, 4],\n\t[6, 4],\n\t[7, 4],\n\t[5, 5],\n\t[7, 5],\n\t[5, 6],\n\t[6, 6],\n\t[7, 6],\n]\nloc_arr.forEach(loc => {\n\tif (core.getBlockCls(loc[0], loc[1]) == \"enemys\") {\n\t\tbool = false;\n\t}\n});\ncore.setFlag(\"open_yes\", bool)\n}"
            },
            {
                "type": "if",
                "condition": "flag:open_yes",
                "true": [
                    {
                        "type": "openDoor",
                        "loc": [
                            6,
                            3
                        ]
                    }
                ]
            }
        ],
        "6,6": [
            {
                "type": "function",
                "function": "function(){\nvar bool = true;\nvar loc_arr = [\n\t[5, 4],\n\t[6, 4],\n\t[7, 4],\n\t[5, 5],\n\t[7, 5],\n\t[5, 6],\n\t[6, 6],\n\t[7, 6],\n]\nloc_arr.forEach(loc => {\n\tif (core.getBlockCls(loc[0], loc[1]) == \"enemys\") {\n\t\tbool = false;\n\t}\n});\ncore.setFlag(\"open_yes\", bool)\n}"
            },
            {
                "type": "if",
                "condition": "flag:open_yes",
                "true": [
                    {
                        "type": "openDoor",
                        "loc": [
                            6,
                            3
                        ]
                    }
                ]
            }
        ],
        "7,6": [
            {
                "type": "function",
                "function": "function(){\nvar bool = true;\nvar loc_arr = [\n\t[5, 4],\n\t[6, 4],\n\t[7, 4],\n\t[5, 5],\n\t[7, 5],\n\t[5, 6],\n\t[6, 6],\n\t[7, 6],\n]\nloc_arr.forEach(loc => {\n\tif (core.getBlockCls(loc[0], loc[1]) == \"enemys\") {\n\t\tbool = false;\n\t}\n});\ncore.setFlag(\"open_yes\", bool)\n}"
            },
            {
                "type": "if",
                "condition": "flag:open_yes",
                "true": [
                    {
                        "type": "openDoor",
                        "loc": [
                            6,
                            3
                        ]
                    }
                ]
            }
        ],
        "7,4": [
            {
                "type": "function",
                "function": "function(){\nvar bool = true;\nvar loc_arr = [\n\t[5, 4],\n\t[6, 4],\n\t[7, 4],\n\t[5, 5],\n\t[7, 5],\n\t[5, 6],\n\t[6, 6],\n\t[7, 6],\n]\nloc_arr.forEach(loc => {\n\tif (core.getBlockCls(loc[0], loc[1]) == \"enemys\") {\n\t\tbool = false;\n\t}\n});\ncore.setFlag(\"open_yes\", bool)\n}"
            },
            {
                "type": "if",
                "condition": "flag:open_yes",
                "true": [
                    {
                        "type": "openDoor",
                        "loc": [
                            6,
                            3
                        ]
                    }
                ]
            }
        ],
        "7,5": [
            {
                "type": "function",
                "function": "function(){\nvar bool = true;\nvar loc_arr = [\n\t[5, 4],\n\t[6, 4],\n\t[7, 4],\n\t[5, 5],\n\t[7, 5],\n\t[5, 6],\n\t[6, 6],\n\t[7, 6],\n]\nloc_arr.forEach(loc => {\n\tif (core.getBlockCls(loc[0], loc[1]) == \"enemys\") {\n\t\tbool = false;\n\t}\n});\ncore.setFlag(\"open_yes\", bool)\n}"
            },
            {
                "type": "if",
                "condition": "flag:open_yes",
                "true": [
                    {
                        "type": "openDoor",
                        "loc": [
                            6,
                            3
                        ]
                    }
                ]
            }
        ],
        "6,4": [
            {
                "type": "if",
                "condition": "blockId:6,1",
                "true": [
                    {
                        "type": "function",
                        "function": "function(){\nvar bool = true;\nvar loc_arr = [\n\t[5, 4],\n\t[6, 4],\n\t[7, 4],\n\t[5, 5],\n\t[7, 5],\n\t[5, 6],\n\t[6, 6],\n\t[7, 6],\n]\nloc_arr.forEach(loc => {\n\tif (core.getBlockCls(loc[0], loc[1]) == \"enemys\") {\n\t\tbool = false;\n\t}\n});\ncore.setFlag(\"open_yes\", bool)\n}"
                    },
                    {
                        "type": "if",
                        "condition": "flag:open_yes",
                        "true": [
                            {
                                "type": "openDoor",
                                "loc": [
                                    6,
                                    3
                                ]
                            }
                        ]
                    }
                ],
                "false": [
                    "\t[骷髅队长,skeletonCaptain]不 这是不可能的 你怎会打败我 你别太得意 后面还有许多强大的对手和机关存在 你稍有疏忽就必死无疑",
                    {
                        "type": "playSound",
                        "name": "door.mp3",
                        "stop": true
                    },
                    {
                        "type": "setBlock",
                        "number": "27",
                        "loc": [
                            [
                                1,
                                3
                            ]
                        ]
                    },
                    {
                        "type": "setBlock",
                        "number": "27",
                        "loc": [
                            [
                                2,
                                3
                            ]
                        ]
                    },
                    {
                        "type": "setBlock",
                        "number": "27",
                        "loc": [
                            [
                                3,
                                3
                            ]
                        ]
                    },
                    {
                        "type": "setBlock",
                        "number": "28",
                        "loc": [
                            [
                                9,
                                3
                            ]
                        ]
                    },
                    {
                        "type": "setBlock",
                        "number": "28",
                        "loc": [
                            [
                                10,
                                3
                            ]
                        ]
                    },
                    {
                        "type": "setBlock",
                        "number": "28",
                        "loc": [
                            [
                                11,
                                3
                            ]
                        ]
                    },
                    {
                        "type": "setBlock",
                        "number": "32",
                        "loc": [
                            [
                                1,
                                4
                            ]
                        ]
                    },
                    {
                        "type": "setBlock",
                        "number": "32",
                        "loc": [
                            [
                                2,
                                4
                            ]
                        ]
                    },
                    {
                        "type": "setBlock",
                        "number": "32",
                        "loc": [
                            [
                                3,
                                4
                            ]
                        ]
                    },
                    {
                        "type": "setBlock",
                        "number": "21",
                        "loc": [
                            [
                                9,
                                4
                            ]
                        ]
                    },
                    {
                        "type": "setBlock",
                        "number": "21",
                        "loc": [
                            [
                                10,
                                4
                            ]
                        ]
                    },
                    {
                        "type": "setBlock",
                        "number": "21",
                        "loc": [
                            [
                                11,
                                4
                            ]
                        ]
                    },
                    {
                        "type": "setBlock",
                        "number": "0",
                        "loc": [
                            [
                                6,
                                9
                            ]
                        ]
                    },
                    {
                        "type": "show",
                        "loc": [
                            [
                                6,
                                9
                            ]
                        ],
                        "time": 0
                    },
                    {
                        "type": "show",
                        "loc": [
                            [
                                6,
                                11
                            ]
                        ],
                        "time": 0
                    },
                    {
                        "type": "openDoor",
                        "loc": [
                            4,
                            4
                        ],
                        "async": true
                    },
                    {
                        "type": "openDoor",
                        "loc": [
                            6,
                            7
                        ],
                        "async": true
                    },
                    {
                        "type": "openDoor",
                        "loc": [
                            8,
                            4
                        ],
                        "async": true
                    },
                    {
                        "type": "waitAsync"
                    }
                ]
            }
        ],
        "6,1": [
            "\t[骷髅队长,skeletonCaptain]不 这是不可能的 你怎会打败我 你别太得意 后面还有许多强大的对手和机关存在 你稍有疏忽就必死无疑",
            {
                "type": "playSound",
                "name": "door.mp3",
                "stop": true
            },
            {
                "type": "setBlock",
                "number": "27",
                "loc": [
                    [
                        1,
                        3
                    ]
                ]
            },
            {
                "type": "setBlock",
                "number": "27",
                "loc": [
                    [
                        2,
                        3
                    ]
                ]
            },
            {
                "type": "setBlock",
                "number": "27",
                "loc": [
                    [
                        3,
                        3
                    ]
                ]
            },
            {
                "type": "setBlock",
                "number": "28",
                "loc": [
                    [
                        9,
                        3
                    ]
                ]
            },
            {
                "type": "setBlock",
                "number": "28",
                "loc": [
                    [
                        10,
                        3
                    ]
                ]
            },
            {
                "type": "setBlock",
                "number": "28",
                "loc": [
                    [
                        11,
                        3
                    ]
                ]
            },
            {
                "type": "setBlock",
                "number": "32",
                "loc": [
                    [
                        1,
                        4
                    ]
                ]
            },
            {
                "type": "setBlock",
                "number": "32",
                "loc": [
                    [
                        2,
                        4
                    ]
                ]
            },
            {
                "type": "setBlock",
                "number": "32",
                "loc": [
                    [
                        3,
                        4
                    ]
                ]
            },
            {
                "type": "setBlock",
                "number": "21",
                "loc": [
                    [
                        9,
                        4
                    ]
                ]
            },
            {
                "type": "setBlock",
                "number": "21",
                "loc": [
                    [
                        10,
                        4
                    ]
                ]
            },
            {
                "type": "setBlock",
                "number": "21",
                "loc": [
                    [
                        11,
                        4
                    ]
                ]
            },
            {
                "type": "setBlock",
                "number": "0",
                "loc": [
                    [
                        6,
                        9
                    ]
                ]
            },
            {
                "type": "show",
                "loc": [
                    [
                        6,
                        9
                    ]
                ],
                "time": 0
            },
            {
                "type": "show",
                "loc": [
                    [
                        6,
                        11
                    ]
                ],
                "time": 0
            },
            {
                "type": "openDoor",
                "loc": [
                    4,
                    4
                ],
                "async": true
            },
            {
                "type": "openDoor",
                "loc": [
                    6,
                    7
                ],
                "async": true
            },
            {
                "type": "openDoor",
                "loc": [
                    8,
                    4
                ],
                "async": true
            },
            {
                "type": "waitAsync"
            }
        ]
    },
    "afterGetItem": {},
    "afterOpenDoor": {},
    "cannotMove": {},
    "fgmap": [

],
    "bgmap": [
    [ 17, 17, 17, 17, 17, 17, 17, 17, 17, 17, 17, 17, 17],
    [ 17,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0, 17],
    [ 17,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0, 17],
    [ 17,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0, 17],
    [ 17,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0, 17],
    [ 17,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0, 17],
    [ 17,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0, 17],
    [ 17,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0, 17],
    [ 17,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0, 17],
    [ 17,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0, 17],
    [ 17,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0, 17],
    [ 17,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0, 17],
    [ 17, 17, 17, 17, 17, 17, 17, 17, 17, 17, 17, 17, 17]
],
    "upFloor": [
        6,
        10
    ],
    "downFloor": [
        1,
        10
    ],
    "autoEvent": {
        "6,3": {
            "0": null,
            "1": null
        }
    },
    "beforeBattle": {},
    "cannotMoveIn": {},
    "bg2map": [],
    "fg2map": []
}