main.floors.MT49=
{
    "floorId": "MT49",
    "title": "魔塔 第49层",
    "name": "第 49 层",
    "width": 13,
    "height": 13,
    "map": [
    [330,330,330,330,330,330,330,330,330,330,330,330,330],
    [330,  1,  1,  1,  0,  0,  0,  0,  0,  1,  1,  1,330],
    [330,  1,  1,  0,  0,  0,  0,  0,  0,  0,  1,  1,330],
    [330,  1,  0,  0,  0,  0,  0,  0,  0,  0,  0,  1,330],
    [330,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,330],
    [330,  0,  1,  0,  0,  0,  0,  0,  0,  0,  1,  0,330],
    [330,  0,  1,  0,  0,  0,  0,  0,  0,  0,  1,  0,330],
    [330,  0,  1,  0,  1,  1, 85,  1,  1,  0,  1,  0,330],
    [330,  0,  1,  0,  1,228,  0,228,  1,  0,  1,  0,330],
    [330,  0,  0,  0,  1,  1, 85,  1,  1,  0,  0,  0,330],
    [330,  1,  1,  1,  1,220,  0,220,  1,  1,  1,  1,330],
    [330, 88,  0, 83,  0,  0,  0,  0,  0,  0,  0,  0,330],
    [330,330,330,330,330,330,330,330,330,330,330,330,330]
],
    "canFlyTo": true,
    "canFlyFrom": true,
    "canUseQuickShop": true,
    "images": [],
    "ratio": 5,
    "defaultGround": "ground",
    "bgm": "section5.mp3",
    "firstArrive": [],
    "eachArrive": [],
    "parallelDo": "",
    "events": {
        "6,6": [
            {
                "type": "if",
                "condition": "(core.getBlockId(6,7)=='specialDoor')",
                "true": [],
                "false": [
                    {
                        "type": "closeDoor",
                        "id": "specialDoor",
                        "loc": [
                            6,
                            7
                        ]
                    }
                ]
            },
            {
                "type": "setBlock",
                "number": "redKing",
                "loc": [
                    [
                        6,
                        3
                    ]
                ],
                "time": 500
            },
            "\t[魔王,redKing]你终于来啦 我好想和你干一把 但是我的部下不同意",
            {
                "type": "setBlock",
                "number": "whiteKing",
                "loc": [
                    [
                        5,
                        2
                    ],
                    [
                        6,
                        2
                    ],
                    [
                        7,
                        2
                    ],
                    [
                        5,
                        3
                    ],
                    [
                        7,
                        3
                    ],
                    [
                        5,
                        4
                    ],
                    [
                        6,
                        4
                    ],
                    [
                        7,
                        4
                    ]
                ],
                "time": 500
            },
            {
                "type": "playBgm",
                "name": "boss5.mp3"
            },
            {
                "type": "hide",
                "remove": true,
                "time": 0
            }
        ]
    },
    "changeFloor": {
        "1,11": {
            "floorId": ":before",
            "stair": "upFloor"
        }
    },
    "afterBattle": {
        "5,10": [
            {
                "type": "function",
                "function": "function(){\nvar bool = true;\nvar loc_arr = [\n\t[5, 10],\n\t[7, 10],\n]\nloc_arr.forEach(loc => {\n\tif (core.getBlockCls(loc[0], loc[1]) == \"enemys\") {\n\t\tbool = false;\n\t}\n});\ncore.setFlag(\"open_yes\", bool)\n}"
            },
            {
                "type": "if",
                "condition": "flag:open_yes",
                "true": [
                    {
                        "type": "openDoor",
                        "loc": [
                            6,
                            9
                        ]
                    },
                    {
                        "type": "hide",
                        "time": 0
                    }
                ]
            }
        ],
        "7,10": [
            {
                "type": "function",
                "function": "function(){\nvar bool = true;\nvar loc_arr = [\n\t[5, 10],\n\t[7, 10],\n]\nloc_arr.forEach(loc => {\n\tif (core.getBlockCls(loc[0], loc[1]) == \"enemys\") {\n\t\tbool = false;\n\t}\n});\ncore.setFlag(\"open_yes\", bool)\n}"
            },
            {
                "type": "if",
                "condition": "flag:open_yes",
                "true": [
                    {
                        "type": "openDoor",
                        "loc": [
                            6,
                            9
                        ]
                    },
                    {
                        "type": "hide",
                        "time": 0
                    }
                ]
            }
        ],
        "7,8": [
            {
                "type": "function",
                "function": "function(){\nvar bool = true;\nvar loc_arr = [\n\t[5, 8],\n\t[7, 8],\n]\nloc_arr.forEach(loc => {\n\tif (core.getBlockCls(loc[0], loc[1]) == \"enemys\") {\n\t\tbool = false;\n\t}\n});\ncore.setFlag(\"open_yes\", bool)\n}"
            },
            {
                "type": "if",
                "condition": "flag:open_yes",
                "true": [
                    {
                        "type": "openDoor",
                        "loc": [
                            6,
                            7
                        ]
                    },
                    {
                        "type": "hide",
                        "time": 0
                    }
                ]
            }
        ],
        "6,4": [
            {
                "type": "function",
                "function": "function(){\nvar bool = true;\nvar loc_arr = [\n\t[6, 2],\n\t[6, 4],\n\t[5, 3],\n\t[7, 3],\n]\nloc_arr.forEach(loc => {\n\tif (core.getBlockCls(loc[0], loc[1]) == \"enemys\") {\n\t\tbool = false;\n\t}\n});\nvar loc_arr = [\n\t[5, 2],\n\t[7, 2],\n\t[5, 4],\n\t[7, 4],\n]\nloc_arr.forEach(loc => {\n\tif (core.getBlockCls(loc[0], loc[1]) != \"enemys\") {\n\t\tbool = false;\n\t}\n});\ncore.setFlag(\"open_yes\", bool)\n}"
            },
            {
                "type": "if",
                "condition": "flag:open_yes",
                "true": [
                    {
                        "type": "setEnemy",
                        "id": "redKing",
                        "name": "atk",
                        "operator": "/=",
                        "value": "10"
                    },
                    {
                        "type": "setEnemy",
                        "id": "redKing",
                        "name": "def",
                        "operator": "/=",
                        "value": "10"
                    },
                    {
                        "type": "setEnemy",
                        "id": "redKing",
                        "name": "hp",
                        "operator": "/=",
                        "value": "10"
                    },
                    {
                        "type": "update"
                    },
                    "\t[魔王,redKing]完蛋了 我被封印了 功力只剩一成"
                ]
            }
        ],
        "5,3": [
            {
                "type": "function",
                "function": "function(){\nvar bool = true;\nvar loc_arr = [\n\t[6, 2],\n\t[6, 4],\n\t[5, 3],\n\t[7, 3],\n]\nloc_arr.forEach(loc => {\n\tif (core.getBlockCls(loc[0], loc[1]) == \"enemys\") {\n\t\tbool = false;\n\t}\n});\nvar loc_arr = [\n\t[5, 2],\n\t[7, 2],\n\t[5, 4],\n\t[7, 4],\n]\nloc_arr.forEach(loc => {\n\tif (core.getBlockCls(loc[0], loc[1]) != \"enemys\") {\n\t\tbool = false;\n\t}\n});\ncore.setFlag(\"open_yes\", bool)\n}"
            },
            {
                "type": "if",
                "condition": "flag:open_yes",
                "true": [
                    {
                        "type": "setEnemy",
                        "id": "redKing",
                        "name": "atk",
                        "operator": "/=",
                        "value": "10"
                    },
                    {
                        "type": "setEnemy",
                        "id": "redKing",
                        "name": "def",
                        "operator": "/=",
                        "value": "10"
                    },
                    {
                        "type": "setEnemy",
                        "id": "redKing",
                        "name": "hp",
                        "operator": "/=",
                        "value": "10"
                    },
                    {
                        "type": "update"
                    },
                    "\t[魔王,redKing]完蛋了 我被封印了 功力只剩一成"
                ]
            }
        ],
        "6,2": [
            {
                "type": "function",
                "function": "function(){\nvar bool = true;\nvar loc_arr = [\n\t[6, 2],\n\t[6, 4],\n\t[5, 3],\n\t[7, 3],\n]\nloc_arr.forEach(loc => {\n\tif (core.getBlockCls(loc[0], loc[1]) == \"enemys\") {\n\t\tbool = false;\n\t}\n});\nvar loc_arr = [\n\t[5, 2],\n\t[7, 2],\n\t[5, 4],\n\t[7, 4],\n]\nloc_arr.forEach(loc => {\n\tif (core.getBlockCls(loc[0], loc[1]) != \"enemys\") {\n\t\tbool = false;\n\t}\n});\ncore.setFlag(\"open_yes\", bool)\n}"
            },
            {
                "type": "if",
                "condition": "flag:open_yes",
                "true": [
                    {
                        "type": "setEnemy",
                        "id": "redKing",
                        "name": "atk",
                        "operator": "/=",
                        "value": "10"
                    },
                    {
                        "type": "setEnemy",
                        "id": "redKing",
                        "name": "def",
                        "operator": "/=",
                        "value": "10"
                    },
                    {
                        "type": "setEnemy",
                        "id": "redKing",
                        "name": "hp",
                        "operator": "/=",
                        "value": "10"
                    },
                    {
                        "type": "update"
                    },
                    "\t[魔王,redKing]完蛋了 我被封印了 功力只剩一成"
                ]
            }
        ],
        "7,3": [
            {
                "type": "function",
                "function": "function(){\nvar bool = true;\nvar loc_arr = [\n\t[6, 2],\n\t[6, 4],\n\t[5, 3],\n\t[7, 3],\n]\nloc_arr.forEach(loc => {\n\tif (core.getBlockCls(loc[0], loc[1]) == \"enemys\") {\n\t\tbool = false;\n\t}\n});\nvar loc_arr = [\n\t[5, 2],\n\t[7, 2],\n\t[5, 4],\n\t[7, 4],\n]\nloc_arr.forEach(loc => {\n\tif (core.getBlockCls(loc[0], loc[1]) != \"enemys\") {\n\t\tbool = false;\n\t}\n});\ncore.setFlag(\"open_yes\", bool)\n}"
            },
            {
                "type": "if",
                "condition": "flag:open_yes",
                "true": [
                    {
                        "type": "setEnemy",
                        "id": "redKing",
                        "name": "atk",
                        "operator": "/=",
                        "value": "10"
                    },
                    {
                        "type": "setEnemy",
                        "id": "redKing",
                        "name": "def",
                        "operator": "/=",
                        "value": "10"
                    },
                    {
                        "type": "setEnemy",
                        "id": "redKing",
                        "name": "hp",
                        "operator": "/=",
                        "value": "10"
                    },
                    {
                        "type": "update"
                    },
                    "\t[魔王,redKing]完蛋了 我被封印了 功力只剩一成"
                ]
            }
        ],
        "6,3": [
            "\t[魔王,redKing]很好嘛 你通过了我的面试 你是个合格的勇士",
            {
                "type": "setBlock",
                "number": "23",
                "loc": [
                    [
                        5,
                        1
                    ]
                ]
            },
            {
                "type": "setBlock",
                "number": "62",
                "loc": [
                    [
                        7,
                        1
                    ]
                ]
            },
            {
                "type": "setBlock",
                "number": "27",
                "loc": [
                    [
                        2,
                        4
                    ]
                ]
            },
            {
                "type": "setBlock",
                "number": "27",
                "loc": [
                    [
                        3,
                        4
                    ]
                ]
            },
            {
                "type": "setBlock",
                "number": "27",
                "loc": [
                    [
                        4,
                        4
                    ]
                ]
            },
            {
                "type": "setBlock",
                "number": "28",
                "loc": [
                    [
                        8,
                        4
                    ]
                ]
            },
            {
                "type": "setBlock",
                "number": "28",
                "loc": [
                    [
                        9,
                        4
                    ]
                ]
            },
            {
                "type": "setBlock",
                "number": "28",
                "loc": [
                    [
                        10,
                        4
                    ]
                ]
            },
            {
                "type": "setBlock",
                "number": "32",
                "loc": [
                    [
                        5,
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
                        5
                    ]
                ]
            },
            {
                "type": "setBlock",
                "number": "32",
                "loc": [
                    [
                        7,
                        5
                    ]
                ]
            },
            {
                "type": "setBlock",
                "number": "0",
                "loc": [
                    [
                        5,
                        2
                    ],
                    [
                        6,
                        2
                    ],
                    [
                        7,
                        2
                    ],
                    [
                        7,
                        3
                    ],
                    [
                        7,
                        4
                    ],
                    [
                        6,
                        4
                    ],
                    [
                        5,
                        4
                    ],
                    [
                        5,
                        3
                    ]
                ]
            },
            {
                "type": "openDoor",
                "loc": [
                    6,
                    7
                ]
            }
        ],
        "5,8": [
            {
                "type": "function",
                "function": "function(){\nvar bool = true;\nvar loc_arr = [\n\t[5, 8],\n\t[7, 8],\n]\nloc_arr.forEach(loc => {\n\tif (core.getBlockCls(loc[0], loc[1]) == \"enemys\") {\n\t\tbool = false;\n\t}\n});\ncore.setFlag(\"open_yes\", bool)\n}"
            },
            {
                "type": "if",
                "condition": "flag:open_yes",
                "true": [
                    {
                        "type": "openDoor",
                        "loc": [
                            6,
                            7
                        ]
                    },
                    {
                        "type": "hide",
                        "time": 0
                    }
                ]
            }
        ]
    },
    "afterGetItem": {},
    "afterOpenDoor": {},
    "cannotMove": {},
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
    "fgmap": [

],
    "downFloor": [
        2,
        11
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