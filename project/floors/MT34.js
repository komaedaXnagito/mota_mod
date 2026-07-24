main.floors.MT34=
{
    "floorId": "MT34",
    "title": "魔塔 第34层",
    "name": "第 34 层",
    "width": 13,
    "height": 13,
    "map": [
    [330,330,330,330,330,330,330,330,330,330,330,330,330],
    [330, 88,  0, 31,  1,  0, 21,  0,  1, 21, 21, 28,330],
    [330,  0,  0,  0, 81,216,  0,227, 81,  0, 21, 31,330],
    [330,  0,216,  0,  1,  1,  1,  1,  1,  1,  1,  1,330],
    [330,  1, 81,  1,  1,201,  1,224,  1,203,  1,225,330],
    [330,  0,  0,  0,  1, 81,  1, 81,  1, 81,  1, 81,330],
    [330,  0,  1,  0,  0,  0,  0,  0,  0,  0,  0,  0,330],
    [330,  0,  0,  0,  1, 81,  1, 81,  1, 81,  1, 81,330],
    [330,  1, 81,  1,  1,212,  1,202,  1,227,  1,205,330],
    [330,  0,  0,212,  1,  1,  1,  1,  1,  1,  1,  1,330],
    [330,224,  1,  0, 81,  0,  0,  0, 81,225,  0, 31,330],
    [330, 32,225,  0,  1,  0, 87,  0,  1,  0, 21, 27,330],
    [330,330,330,330,330,330,330,330,330,330,330,330,330]
],
    "canFlyTo": true,
    "canFlyFrom": true,
    "canUseQuickShop": true,
    "images": [],
    "ratio": 4,
    "defaultGround": "ground",
    "bgm": "section4.mp3",
    "firstArrive": [],
    "eachArrive": [],
    "parallelDo": "",
    "events": {},
    "changeFloor": {
        "1,1": {
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
                "function": "function(){\nvar bool = true;\nvar loc_arr = [\n\t[5, 4],\n\t[7, 4],\n\t[9, 4],\n\t[11, 4],\n\t[5, 8],\n\t[7, 8],\n\t[9, 8],\n\t[11, 8],\n]\nloc_arr.forEach(loc => {\n\tif (core.getBlockCls(loc[0], loc[1]) == \"enemys\") {\n\t\tbool = false;\n\t}\n});\ncore.setFlag(\"open_yes\", bool)\n}"
            },
            {
                "type": "if",
                "condition": "flag:open_yes",
                "true": [
                    {
                        "type": "playSound",
                        "name": "door.mp3"
                    },
                    {
                        "type": "setBlock",
                        "number": "21",
                        "loc": [
                            [
                                1,
                                5
                            ]
                        ],
                        "async": true
                    },
                    {
                        "type": "setBlock",
                        "number": "21",
                        "loc": [
                            [
                                3,
                                5
                            ]
                        ],
                        "async": true
                    },
                    {
                        "type": "setBlock",
                        "number": "21",
                        "loc": [
                            [
                                1,
                                7
                            ]
                        ],
                        "async": true
                    },
                    {
                        "type": "setBlock",
                        "number": "21",
                        "loc": [
                            [
                                3,
                                7
                            ]
                        ],
                        "async": true
                    },
                    {
                        "type": "setBlock",
                        "number": "23",
                        "loc": [
                            [
                                2,
                                6
                            ]
                        ],
                        "async": true
                    },
                    {
                        "type": "waitAsync"
                    }
                ]
            }
        ],
        "5,8": [
            {
                "type": "function",
                "function": "function(){\nvar bool = true;\nvar loc_arr = [\n\t[5, 4],\n\t[7, 4],\n\t[9, 4],\n\t[11, 4],\n\t[5, 8],\n\t[7, 8],\n\t[9, 8],\n\t[11, 8],\n]\nloc_arr.forEach(loc => {\n\tif (core.getBlockCls(loc[0], loc[1]) == \"enemys\") {\n\t\tbool = false;\n\t}\n});\ncore.setFlag(\"open_yes\", bool)\n}"
            },
            {
                "type": "if",
                "condition": "flag:open_yes",
                "true": [
                    {
                        "type": "playSound",
                        "name": "door.mp3"
                    },
                    {
                        "type": "setBlock",
                        "number": "21",
                        "loc": [
                            [
                                1,
                                5
                            ]
                        ],
                        "async": true
                    },
                    {
                        "type": "setBlock",
                        "number": "21",
                        "loc": [
                            [
                                3,
                                5
                            ]
                        ],
                        "async": true
                    },
                    {
                        "type": "setBlock",
                        "number": "21",
                        "loc": [
                            [
                                1,
                                7
                            ]
                        ],
                        "async": true
                    },
                    {
                        "type": "setBlock",
                        "number": "21",
                        "loc": [
                            [
                                3,
                                7
                            ]
                        ],
                        "async": true
                    },
                    {
                        "type": "setBlock",
                        "number": "23",
                        "loc": [
                            [
                                2,
                                6
                            ]
                        ],
                        "async": true
                    },
                    {
                        "type": "waitAsync"
                    }
                ]
            }
        ],
        "7,4": [
            {
                "type": "function",
                "function": "function(){\nvar bool = true;\nvar loc_arr = [\n\t[5, 4],\n\t[7, 4],\n\t[9, 4],\n\t[11, 4],\n\t[5, 8],\n\t[7, 8],\n\t[9, 8],\n\t[11, 8],\n]\nloc_arr.forEach(loc => {\n\tif (core.getBlockCls(loc[0], loc[1]) == \"enemys\") {\n\t\tbool = false;\n\t}\n});\ncore.setFlag(\"open_yes\", bool)\n}"
            },
            {
                "type": "if",
                "condition": "flag:open_yes",
                "true": [
                    {
                        "type": "playSound",
                        "name": "door.mp3"
                    },
                    {
                        "type": "setBlock",
                        "number": "21",
                        "loc": [
                            [
                                1,
                                5
                            ]
                        ],
                        "async": true
                    },
                    {
                        "type": "setBlock",
                        "number": "21",
                        "loc": [
                            [
                                3,
                                5
                            ]
                        ],
                        "async": true
                    },
                    {
                        "type": "setBlock",
                        "number": "21",
                        "loc": [
                            [
                                1,
                                7
                            ]
                        ],
                        "async": true
                    },
                    {
                        "type": "setBlock",
                        "number": "21",
                        "loc": [
                            [
                                3,
                                7
                            ]
                        ],
                        "async": true
                    },
                    {
                        "type": "setBlock",
                        "number": "23",
                        "loc": [
                            [
                                2,
                                6
                            ]
                        ],
                        "async": true
                    },
                    {
                        "type": "waitAsync"
                    }
                ]
            }
        ],
        "7,8": [
            {
                "type": "function",
                "function": "function(){\nvar bool = true;\nvar loc_arr = [\n\t[5, 4],\n\t[7, 4],\n\t[9, 4],\n\t[11, 4],\n\t[5, 8],\n\t[7, 8],\n\t[9, 8],\n\t[11, 8],\n]\nloc_arr.forEach(loc => {\n\tif (core.getBlockCls(loc[0], loc[1]) == \"enemys\") {\n\t\tbool = false;\n\t}\n});\ncore.setFlag(\"open_yes\", bool)\n}"
            },
            {
                "type": "if",
                "condition": "flag:open_yes",
                "true": [
                    {
                        "type": "playSound",
                        "name": "door.mp3"
                    },
                    {
                        "type": "setBlock",
                        "number": "21",
                        "loc": [
                            [
                                1,
                                5
                            ]
                        ],
                        "async": true
                    },
                    {
                        "type": "setBlock",
                        "number": "21",
                        "loc": [
                            [
                                3,
                                5
                            ]
                        ],
                        "async": true
                    },
                    {
                        "type": "setBlock",
                        "number": "21",
                        "loc": [
                            [
                                1,
                                7
                            ]
                        ],
                        "async": true
                    },
                    {
                        "type": "setBlock",
                        "number": "21",
                        "loc": [
                            [
                                3,
                                7
                            ]
                        ],
                        "async": true
                    },
                    {
                        "type": "setBlock",
                        "number": "23",
                        "loc": [
                            [
                                2,
                                6
                            ]
                        ],
                        "async": true
                    },
                    {
                        "type": "waitAsync"
                    }
                ]
            }
        ],
        "9,4": [
            {
                "type": "function",
                "function": "function(){\nvar bool = true;\nvar loc_arr = [\n\t[5, 4],\n\t[7, 4],\n\t[9, 4],\n\t[11, 4],\n\t[5, 8],\n\t[7, 8],\n\t[9, 8],\n\t[11, 8],\n]\nloc_arr.forEach(loc => {\n\tif (core.getBlockCls(loc[0], loc[1]) == \"enemys\") {\n\t\tbool = false;\n\t}\n});\ncore.setFlag(\"open_yes\", bool)\n}"
            },
            {
                "type": "if",
                "condition": "flag:open_yes",
                "true": [
                    {
                        "type": "playSound",
                        "name": "door.mp3"
                    },
                    {
                        "type": "setBlock",
                        "number": "21",
                        "loc": [
                            [
                                1,
                                5
                            ]
                        ],
                        "async": true
                    },
                    {
                        "type": "setBlock",
                        "number": "21",
                        "loc": [
                            [
                                3,
                                5
                            ]
                        ],
                        "async": true
                    },
                    {
                        "type": "setBlock",
                        "number": "21",
                        "loc": [
                            [
                                1,
                                7
                            ]
                        ],
                        "async": true
                    },
                    {
                        "type": "setBlock",
                        "number": "21",
                        "loc": [
                            [
                                3,
                                7
                            ]
                        ],
                        "async": true
                    },
                    {
                        "type": "setBlock",
                        "number": "23",
                        "loc": [
                            [
                                2,
                                6
                            ]
                        ],
                        "async": true
                    },
                    {
                        "type": "waitAsync"
                    }
                ]
            }
        ],
        "9,8": [
            {
                "type": "function",
                "function": "function(){\nvar bool = true;\nvar loc_arr = [\n\t[5, 4],\n\t[7, 4],\n\t[9, 4],\n\t[11, 4],\n\t[5, 8],\n\t[7, 8],\n\t[9, 8],\n\t[11, 8],\n]\nloc_arr.forEach(loc => {\n\tif (core.getBlockCls(loc[0], loc[1]) == \"enemys\") {\n\t\tbool = false;\n\t}\n});\ncore.setFlag(\"open_yes\", bool)\n}"
            },
            {
                "type": "if",
                "condition": "flag:open_yes",
                "true": [
                    {
                        "type": "playSound",
                        "name": "door.mp3"
                    },
                    {
                        "type": "setBlock",
                        "number": "21",
                        "loc": [
                            [
                                1,
                                5
                            ]
                        ],
                        "async": true
                    },
                    {
                        "type": "setBlock",
                        "number": "21",
                        "loc": [
                            [
                                3,
                                5
                            ]
                        ],
                        "async": true
                    },
                    {
                        "type": "setBlock",
                        "number": "21",
                        "loc": [
                            [
                                1,
                                7
                            ]
                        ],
                        "async": true
                    },
                    {
                        "type": "setBlock",
                        "number": "21",
                        "loc": [
                            [
                                3,
                                7
                            ]
                        ],
                        "async": true
                    },
                    {
                        "type": "setBlock",
                        "number": "23",
                        "loc": [
                            [
                                2,
                                6
                            ]
                        ],
                        "async": true
                    },
                    {
                        "type": "waitAsync"
                    }
                ]
            }
        ],
        "11,8": [
            {
                "type": "function",
                "function": "function(){\nvar bool = true;\nvar loc_arr = [\n\t[5, 4],\n\t[7, 4],\n\t[9, 4],\n\t[11, 4],\n\t[5, 8],\n\t[7, 8],\n\t[9, 8],\n\t[11, 8],\n]\nloc_arr.forEach(loc => {\n\tif (core.getBlockCls(loc[0], loc[1]) == \"enemys\") {\n\t\tbool = false;\n\t}\n});\ncore.setFlag(\"open_yes\", bool)\n}"
            },
            {
                "type": "if",
                "condition": "flag:open_yes",
                "true": [
                    {
                        "type": "playSound",
                        "name": "door.mp3"
                    },
                    {
                        "type": "setBlock",
                        "number": "21",
                        "loc": [
                            [
                                1,
                                5
                            ]
                        ],
                        "async": true
                    },
                    {
                        "type": "setBlock",
                        "number": "21",
                        "loc": [
                            [
                                3,
                                5
                            ]
                        ],
                        "async": true
                    },
                    {
                        "type": "setBlock",
                        "number": "21",
                        "loc": [
                            [
                                1,
                                7
                            ]
                        ],
                        "async": true
                    },
                    {
                        "type": "setBlock",
                        "number": "21",
                        "loc": [
                            [
                                3,
                                7
                            ]
                        ],
                        "async": true
                    },
                    {
                        "type": "setBlock",
                        "number": "23",
                        "loc": [
                            [
                                2,
                                6
                            ]
                        ],
                        "async": true
                    },
                    {
                        "type": "waitAsync"
                    }
                ]
            }
        ],
        "11,4": [
            {
                "type": "function",
                "function": "function(){\nvar bool = true;\nvar loc_arr = [\n\t[5, 4],\n\t[7, 4],\n\t[9, 4],\n\t[11, 4],\n\t[5, 8],\n\t[7, 8],\n\t[9, 8],\n\t[11, 8],\n]\nloc_arr.forEach(loc => {\n\tif (core.getBlockCls(loc[0], loc[1]) == \"enemys\") {\n\t\tbool = false;\n\t}\n});\ncore.setFlag(\"open_yes\", bool)\n}"
            },
            {
                "type": "if",
                "condition": "flag:open_yes",
                "true": [
                    {
                        "type": "playSound",
                        "name": "door.mp3"
                    },
                    {
                        "type": "setBlock",
                        "number": "21",
                        "loc": [
                            [
                                1,
                                5
                            ]
                        ],
                        "async": true
                    },
                    {
                        "type": "setBlock",
                        "number": "21",
                        "loc": [
                            [
                                3,
                                5
                            ]
                        ],
                        "async": true
                    },
                    {
                        "type": "setBlock",
                        "number": "21",
                        "loc": [
                            [
                                1,
                                7
                            ]
                        ],
                        "async": true
                    },
                    {
                        "type": "setBlock",
                        "number": "21",
                        "loc": [
                            [
                                3,
                                7
                            ]
                        ],
                        "async": true
                    },
                    {
                        "type": "setBlock",
                        "number": "23",
                        "loc": [
                            [
                                2,
                                6
                            ]
                        ],
                        "async": true
                    },
                    {
                        "type": "waitAsync"
                    }
                ]
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
        2
    ],
    "autoEvent": {},
    "beforeBattle": {},
    "cannotMoveIn": {},
    "bg2map": [],
    "fg2map": []
}