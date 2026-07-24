main.floors.MT40=
{
    "floorId": "MT40",
    "title": "魔塔 第40层",
    "name": "第 40 层",
    "width": 13,
    "height": 13,
    "map": [
    [330,330,330,330,330,330,330,330,330,330,330,330,330],
    [330,  0,  0,  0,  0,  0,226,  0,  0,  0,  0,  0,330],
    [330,  0,224,224,224,  0,  0,  0,227,227,227,  0,330],
    [330,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,330],
    [330,  0,  0,212,212,212,  0,225,225,225,  0,  0,330],
    [330,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,330],
    [330,  1,  1,  1,  0,  0,  0,  0,  0,  1,  1,  1,330],
    [330,  1,  1,  1,  0,  0,  0,  0,  0,  1,  1,  1,330],
    [330,  1,  1,  1,  1,  1, 83,  1,  1,  1,  1,  1,330],
    [330, 28, 21,  0,  1,216,  0,216,  1, 31,224,  0,330],
    [330, 32,  0,  0,  1,  0,  0,  0,  1,225,  0,  0,330],
    [330, 27,  0,227, 82,  0,  0,  0, 81,  0,  0, 88,330],
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
    "events": {
        "6,7": [
            {
                "type": "if",
                "condition": "(core.getBlockId(6,8)=='redDoor')",
                "true": [],
                "false": [
                    {
                        "type": "closeDoor",
                        "id": "specialDoor",
                        "loc": [
                            6,
                            8
                        ]
                    }
                ]
            },
            {
                "type": "setEnemy",
                "id": "ghostSkeleton",
                "name": "special",
                "value": "[1]"
            },
            {
                "type": "setEnemy",
                "id": "soldier",
                "name": "special",
                "value": "[1]"
            },
            {
                "type": "setEnemy",
                "id": "swordsman",
                "name": "special",
                "value": "[1]"
            },
            {
                "type": "setEnemy",
                "id": "redKnight",
                "name": "special",
                "value": "[1]"
            },
            {
                "type": "setEnemy",
                "id": "yellowKnight",
                "name": "special",
                "value": "[1]"
            },
            "\t[骑士队长,yellowKnight]我还在担心你不能来了。我确信这次我一定能杀了你。给我上！",
            {
                "type": "playBgm",
                "name": "boss4.mp3"
            },
            {
                "type": "function",
                "function": "function(){\nvar a = new Array([3, 4], [4, 4], [5, 4], [7, 4], [8, 4], [9, 4], [2, 2], [3, 2], [4, 2], [8, 2], [9, 2], [10, 2]);\nfor (var i = 11; i > -1; i--) {\n\tcore.insertAction([{ \"type\": \"sleep\", \"time\": 300 }, ]);\n\tif (core.getBlockCls(a[i][0], a[i][1]) == \"enemys\") {\n\t\tcore.insertAction([{\n\t\t\t\"type\": \"battle\",\n\t\t\t\"loc\": [\n\t\t\t\ta[i][0], a[i][1]\n\t\t\t]\n\t\t}, ]);\n\t}\n}\n}"
            },
            {
                "type": "if",
                "condition": "(flag:40F!=1)",
                "true": [
                    "\t[骑士队长,yellowKnight]你怎会击败我所有的手下？我和你誓不两立我决不认输。",
                    {
                        "type": "battle",
                        "loc": [
                            6,
                            1
                        ]
                    }
                ]
            },
            {
                "type": "setEnemy",
                "id": "ghostSkeleton",
                "name": "special",
                "value": "[]"
            },
            {
                "type": "setEnemy",
                "id": "soldier",
                "name": "special",
                "value": "[]"
            },
            {
                "type": "setEnemy",
                "id": "swordsman",
                "name": "special",
                "value": "[]"
            },
            {
                "type": "setEnemy",
                "id": "redKnight",
                "name": "special",
                "value": "[]"
            },
            {
                "type": "setEnemy",
                "id": "yellowKnight",
                "name": "special",
                "value": "[]"
            },
            {
                "type": "if",
                "condition": "(core.getBlockId(6,8)=='redDoor')",
                "true": [],
                "false": [
                    {
                        "type": "openDoor",
                        "loc": [
                            6,
                            8
                        ]
                    }
                ]
            },
            {
                "type": "hide",
                "loc": [
                    [
                        6,
                        7
                    ]
                ],
                "remove": true,
                "time": 0
            }
        ],
        "6,1": [
            {
                "type": "if",
                "condition": "flag:40F",
                "true": [
                    {
                        "type": "changeFloor",
                        "floorId": "MT41",
                        "loc": [
                            6,
                            2
                        ],
                        "direction": "down",
                        "time": 0
                    }
                ],
                "false": []
            }
        ]
    },
    "changeFloor": {
        "11,11": {
            "floorId": ":before",
            "stair": "upFloor"
        }
    },
    "afterBattle": {
        "2,2": [
            {
                "type": "function",
                "function": "function(){\nvar bool = true;\nvar loc_arr = [\n\t[3, 4],\n\t[4, 4],\n\t[5, 4],\n\t[7, 4],\n\t[8, 4],\n\t[9, 4],\n\t[2, 2],\n\t[3, 2],\n\t[4, 2],\n\t[8, 2],\n\t[9, 2],\n\t[10, 2],\n\t[6, 1]\n]\nloc_arr.forEach(loc => {\n\tif (core.getBlockCls(loc[0], loc[1]) == \"enemys\") {\n\t\tbool = false;\n\t}\n});\ncore.setFlag(\"open_yes\", bool)\n}"
            },
            {
                "type": "if",
                "condition": "flag:open_yes",
                "true": [
                    "\t[骑士队长,yellowKnight]这次先饶了你，下次碰到我会和你正式的决斗，你最好投降。",
                    {
                        "type": "playSound",
                        "name": "door.mp3"
                    },
                    {
                        "type": "setBlock",
                        "number": "21",
                        "loc": [
                            [
                                2,
                                2
                            ]
                        ]
                    },
                    {
                        "type": "setBlock",
                        "number": "21",
                        "loc": [
                            [
                                3,
                                2
                            ]
                        ]
                    },
                    {
                        "type": "setBlock",
                        "number": "21",
                        "loc": [
                            [
                                4,
                                2
                            ]
                        ]
                    },
                    {
                        "type": "setBlock",
                        "number": "27",
                        "loc": [
                            [
                                8,
                                2
                            ]
                        ]
                    },
                    {
                        "type": "setBlock",
                        "number": "27",
                        "loc": [
                            [
                                9,
                                2
                            ]
                        ]
                    },
                    {
                        "type": "setBlock",
                        "number": "27",
                        "loc": [
                            [
                                10,
                                2
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
                        "number": "32",
                        "loc": [
                            [
                                4,
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
                                4
                            ]
                        ]
                    },
                    {
                        "type": "setBlock",
                        "number": "28",
                        "loc": [
                            [
                                7,
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
                        "type": "show",
                        "loc": [
                            [
                                6,
                                1
                            ]
                        ]
                    },
                    {
                        "type": "show",
                        "loc": [
                            [
                                6,
                                10
                            ]
                        ],
                        "floorId": "MT42"
                    },
                    {
                        "type": "setBlock",
                        "number": "87",
                        "loc": [
                            [
                                6,
                                1
                            ]
                        ]
                    },
                    {
                        "type": "hide",
                        "loc": [
                            [
                                6,
                                7
                            ]
                        ],
                        "time": 0
                    },
                    {
                        "type": "setValue",
                        "name": "flag:40F",
                        "value": "1"
                    }
                ]
            }
        ],
        "3,2": [
            {
                "type": "function",
                "function": "function(){\nvar bool = true;\nvar loc_arr = [\n\t[3, 4],\n\t[4, 4],\n\t[5, 4],\n\t[7, 4],\n\t[8, 4],\n\t[9, 4],\n\t[2, 2],\n\t[3, 2],\n\t[4, 2],\n\t[8, 2],\n\t[9, 2],\n\t[10, 2],\n\t[6, 1]\n]\nloc_arr.forEach(loc => {\n\tif (core.getBlockCls(loc[0], loc[1]) == \"enemys\") {\n\t\tbool = false;\n\t}\n});\ncore.setFlag(\"open_yes\", bool)\n}"
            },
            {
                "type": "if",
                "condition": "flag:open_yes",
                "true": [
                    "\t[骑士队长,yellowKnight]这次先饶了你，下次碰到我会和你正式的决斗，你最好投降。",
                    {
                        "type": "playSound",
                        "name": "door.mp3"
                    },
                    {
                        "type": "setBlock",
                        "number": "21",
                        "loc": [
                            [
                                2,
                                2
                            ]
                        ]
                    },
                    {
                        "type": "setBlock",
                        "number": "21",
                        "loc": [
                            [
                                3,
                                2
                            ]
                        ]
                    },
                    {
                        "type": "setBlock",
                        "number": "21",
                        "loc": [
                            [
                                4,
                                2
                            ]
                        ]
                    },
                    {
                        "type": "setBlock",
                        "number": "27",
                        "loc": [
                            [
                                8,
                                2
                            ]
                        ]
                    },
                    {
                        "type": "setBlock",
                        "number": "27",
                        "loc": [
                            [
                                9,
                                2
                            ]
                        ]
                    },
                    {
                        "type": "setBlock",
                        "number": "27",
                        "loc": [
                            [
                                10,
                                2
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
                        "number": "32",
                        "loc": [
                            [
                                4,
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
                                4
                            ]
                        ]
                    },
                    {
                        "type": "setBlock",
                        "number": "28",
                        "loc": [
                            [
                                7,
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
                        "type": "show",
                        "loc": [
                            [
                                6,
                                1
                            ]
                        ]
                    },
                    {
                        "type": "show",
                        "loc": [
                            [
                                6,
                                10
                            ]
                        ],
                        "floorId": "MT42"
                    },
                    {
                        "type": "setBlock",
                        "number": "87",
                        "loc": [
                            [
                                6,
                                1
                            ]
                        ]
                    },
                    {
                        "type": "hide",
                        "loc": [
                            [
                                6,
                                7
                            ]
                        ],
                        "time": 0
                    },
                    {
                        "type": "setValue",
                        "name": "flag:40F",
                        "value": "1"
                    }
                ]
            }
        ],
        "4,2": [
            {
                "type": "function",
                "function": "function(){\nvar bool = true;\nvar loc_arr = [\n\t[3, 4],\n\t[4, 4],\n\t[5, 4],\n\t[7, 4],\n\t[8, 4],\n\t[9, 4],\n\t[2, 2],\n\t[3, 2],\n\t[4, 2],\n\t[8, 2],\n\t[9, 2],\n\t[10, 2],\n\t[6, 1]\n]\nloc_arr.forEach(loc => {\n\tif (core.getBlockCls(loc[0], loc[1]) == \"enemys\") {\n\t\tbool = false;\n\t}\n});\ncore.setFlag(\"open_yes\", bool)\n}"
            },
            {
                "type": "if",
                "condition": "flag:open_yes",
                "true": [
                    "\t[骑士队长,yellowKnight]这次先饶了你，下次碰到我会和你正式的决斗，你最好投降。",
                    {
                        "type": "playSound",
                        "name": "door.mp3"
                    },
                    {
                        "type": "setBlock",
                        "number": "21",
                        "loc": [
                            [
                                2,
                                2
                            ]
                        ]
                    },
                    {
                        "type": "setBlock",
                        "number": "21",
                        "loc": [
                            [
                                3,
                                2
                            ]
                        ]
                    },
                    {
                        "type": "setBlock",
                        "number": "21",
                        "loc": [
                            [
                                4,
                                2
                            ]
                        ]
                    },
                    {
                        "type": "setBlock",
                        "number": "27",
                        "loc": [
                            [
                                8,
                                2
                            ]
                        ]
                    },
                    {
                        "type": "setBlock",
                        "number": "27",
                        "loc": [
                            [
                                9,
                                2
                            ]
                        ]
                    },
                    {
                        "type": "setBlock",
                        "number": "27",
                        "loc": [
                            [
                                10,
                                2
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
                        "number": "32",
                        "loc": [
                            [
                                4,
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
                                4
                            ]
                        ]
                    },
                    {
                        "type": "setBlock",
                        "number": "28",
                        "loc": [
                            [
                                7,
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
                        "type": "show",
                        "loc": [
                            [
                                6,
                                1
                            ]
                        ]
                    },
                    {
                        "type": "show",
                        "loc": [
                            [
                                6,
                                10
                            ]
                        ],
                        "floorId": "MT42"
                    },
                    {
                        "type": "setBlock",
                        "number": "87",
                        "loc": [
                            [
                                6,
                                1
                            ]
                        ]
                    },
                    {
                        "type": "hide",
                        "loc": [
                            [
                                6,
                                7
                            ]
                        ],
                        "time": 0
                    },
                    {
                        "type": "setValue",
                        "name": "flag:40F",
                        "value": "1"
                    }
                ]
            }
        ],
        "8,2": [
            {
                "type": "function",
                "function": "function(){\nvar bool = true;\nvar loc_arr = [\n\t[3, 4],\n\t[4, 4],\n\t[5, 4],\n\t[7, 4],\n\t[8, 4],\n\t[9, 4],\n\t[2, 2],\n\t[3, 2],\n\t[4, 2],\n\t[8, 2],\n\t[9, 2],\n\t[10, 2],\n\t[6, 1]\n]\nloc_arr.forEach(loc => {\n\tif (core.getBlockCls(loc[0], loc[1]) == \"enemys\") {\n\t\tbool = false;\n\t}\n});\ncore.setFlag(\"open_yes\", bool)\n}"
            },
            {
                "type": "if",
                "condition": "flag:open_yes",
                "true": [
                    "\t[骑士队长,yellowKnight]这次先饶了你，下次碰到我会和你正式的决斗，你最好投降。",
                    {
                        "type": "playSound",
                        "name": "door.mp3"
                    },
                    {
                        "type": "setBlock",
                        "number": "21",
                        "loc": [
                            [
                                2,
                                2
                            ]
                        ]
                    },
                    {
                        "type": "setBlock",
                        "number": "21",
                        "loc": [
                            [
                                3,
                                2
                            ]
                        ]
                    },
                    {
                        "type": "setBlock",
                        "number": "21",
                        "loc": [
                            [
                                4,
                                2
                            ]
                        ]
                    },
                    {
                        "type": "setBlock",
                        "number": "27",
                        "loc": [
                            [
                                8,
                                2
                            ]
                        ]
                    },
                    {
                        "type": "setBlock",
                        "number": "27",
                        "loc": [
                            [
                                9,
                                2
                            ]
                        ]
                    },
                    {
                        "type": "setBlock",
                        "number": "27",
                        "loc": [
                            [
                                10,
                                2
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
                        "number": "32",
                        "loc": [
                            [
                                4,
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
                                4
                            ]
                        ]
                    },
                    {
                        "type": "setBlock",
                        "number": "28",
                        "loc": [
                            [
                                7,
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
                        "type": "show",
                        "loc": [
                            [
                                6,
                                1
                            ]
                        ]
                    },
                    {
                        "type": "setBlock",
                        "number": "87",
                        "loc": [
                            [
                                6,
                                1
                            ]
                        ]
                    },
                    {
                        "type": "hide",
                        "loc": [
                            [
                                6,
                                7
                            ]
                        ],
                        "time": 0
                    },
                    {
                        "type": "setValue",
                        "name": "flag:40F",
                        "value": "1"
                    }
                ]
            }
        ],
        "9,2": [
            {
                "type": "function",
                "function": "function(){\nvar bool = true;\nvar loc_arr = [\n\t[3, 4],\n\t[4, 4],\n\t[5, 4],\n\t[7, 4],\n\t[8, 4],\n\t[9, 4],\n\t[2, 2],\n\t[3, 2],\n\t[4, 2],\n\t[8, 2],\n\t[9, 2],\n\t[10, 2],\n\t[6, 1]\n]\nloc_arr.forEach(loc => {\n\tif (core.getBlockCls(loc[0], loc[1]) == \"enemys\") {\n\t\tbool = false;\n\t}\n});\ncore.setFlag(\"open_yes\", bool)\n}"
            },
            {
                "type": "if",
                "condition": "flag:open_yes",
                "true": [
                    "\t[骑士队长,yellowKnight]这次先饶了你，下次碰到我会和你正式的决斗，你最好投降。",
                    {
                        "type": "playSound",
                        "name": "door.mp3"
                    },
                    {
                        "type": "setBlock",
                        "number": "21",
                        "loc": [
                            [
                                2,
                                2
                            ]
                        ]
                    },
                    {
                        "type": "setBlock",
                        "number": "21",
                        "loc": [
                            [
                                3,
                                2
                            ]
                        ]
                    },
                    {
                        "type": "setBlock",
                        "number": "21",
                        "loc": [
                            [
                                4,
                                2
                            ]
                        ]
                    },
                    {
                        "type": "setBlock",
                        "number": "27",
                        "loc": [
                            [
                                8,
                                2
                            ]
                        ]
                    },
                    {
                        "type": "setBlock",
                        "number": "27",
                        "loc": [
                            [
                                9,
                                2
                            ]
                        ]
                    },
                    {
                        "type": "setBlock",
                        "number": "27",
                        "loc": [
                            [
                                10,
                                2
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
                        "number": "32",
                        "loc": [
                            [
                                4,
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
                                4
                            ]
                        ]
                    },
                    {
                        "type": "setBlock",
                        "number": "28",
                        "loc": [
                            [
                                7,
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
                        "type": "show",
                        "loc": [
                            [
                                6,
                                1
                            ]
                        ]
                    },
                    {
                        "type": "show",
                        "loc": [
                            [
                                6,
                                10
                            ]
                        ],
                        "floorId": "MT42"
                    },
                    {
                        "type": "setBlock",
                        "number": "87",
                        "loc": [
                            [
                                6,
                                1
                            ]
                        ]
                    },
                    {
                        "type": "hide",
                        "loc": [
                            [
                                6,
                                7
                            ]
                        ],
                        "time": 0
                    },
                    {
                        "type": "setValue",
                        "name": "flag:40F",
                        "value": "1"
                    }
                ]
            }
        ],
        "10,2": [
            {
                "type": "function",
                "function": "function(){\nvar bool = true;\nvar loc_arr = [\n\t[3, 4],\n\t[4, 4],\n\t[5, 4],\n\t[7, 4],\n\t[8, 4],\n\t[9, 4],\n\t[2, 2],\n\t[3, 2],\n\t[4, 2],\n\t[8, 2],\n\t[9, 2],\n\t[10, 2],\n\t[6, 1]\n]\nloc_arr.forEach(loc => {\n\tif (core.getBlockCls(loc[0], loc[1]) == \"enemys\") {\n\t\tbool = false;\n\t}\n});\ncore.setFlag(\"open_yes\", bool)\n}"
            },
            {
                "type": "if",
                "condition": "flag:open_yes",
                "true": [
                    "\t[骑士队长,yellowKnight]这次先饶了你，下次碰到我会和你正式的决斗，你最好投降。",
                    {
                        "type": "playSound",
                        "name": "door.mp3"
                    },
                    {
                        "type": "setBlock",
                        "number": "21",
                        "loc": [
                            [
                                2,
                                2
                            ]
                        ]
                    },
                    {
                        "type": "setBlock",
                        "number": "21",
                        "loc": [
                            [
                                3,
                                2
                            ]
                        ]
                    },
                    {
                        "type": "setBlock",
                        "number": "21",
                        "loc": [
                            [
                                4,
                                2
                            ]
                        ]
                    },
                    {
                        "type": "setBlock",
                        "number": "27",
                        "loc": [
                            [
                                8,
                                2
                            ]
                        ]
                    },
                    {
                        "type": "setBlock",
                        "number": "27",
                        "loc": [
                            [
                                9,
                                2
                            ]
                        ]
                    },
                    {
                        "type": "setBlock",
                        "number": "27",
                        "loc": [
                            [
                                10,
                                2
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
                        "number": "32",
                        "loc": [
                            [
                                4,
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
                                4
                            ]
                        ]
                    },
                    {
                        "type": "setBlock",
                        "number": "28",
                        "loc": [
                            [
                                7,
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
                        "type": "show",
                        "loc": [
                            [
                                6,
                                1
                            ]
                        ]
                    },
                    {
                        "type": "show",
                        "loc": [
                            [
                                6,
                                10
                            ]
                        ],
                        "floorId": "MT42"
                    },
                    {
                        "type": "setBlock",
                        "number": "87",
                        "loc": [
                            [
                                6,
                                1
                            ]
                        ]
                    },
                    {
                        "type": "hide",
                        "loc": [
                            [
                                6,
                                7
                            ]
                        ],
                        "time": 0
                    },
                    {
                        "type": "setValue",
                        "name": "flag:40F",
                        "value": "1"
                    }
                ]
            }
        ],
        "3,4": [
            {
                "type": "function",
                "function": "function(){\nvar bool = true;\nvar loc_arr = [\n\t[3, 4],\n\t[4, 4],\n\t[5, 4],\n\t[7, 4],\n\t[8, 4],\n\t[9, 4],\n\t[2, 2],\n\t[3, 2],\n\t[4, 2],\n\t[8, 2],\n\t[9, 2],\n\t[10, 2],\n\t[6, 1]\n]\nloc_arr.forEach(loc => {\n\tif (core.getBlockCls(loc[0], loc[1]) == \"enemys\") {\n\t\tbool = false;\n\t}\n});\ncore.setFlag(\"open_yes\", bool)\n}"
            },
            {
                "type": "if",
                "condition": "flag:open_yes",
                "true": [
                    "\t[骑士队长,yellowKnight]这次先饶了你，下次碰到我会和你正式的决斗，你最好投降。",
                    {
                        "type": "playSound",
                        "name": "door.mp3"
                    },
                    {
                        "type": "setBlock",
                        "number": "21",
                        "loc": [
                            [
                                2,
                                2
                            ]
                        ]
                    },
                    {
                        "type": "setBlock",
                        "number": "21",
                        "loc": [
                            [
                                3,
                                2
                            ]
                        ]
                    },
                    {
                        "type": "setBlock",
                        "number": "21",
                        "loc": [
                            [
                                4,
                                2
                            ]
                        ]
                    },
                    {
                        "type": "setBlock",
                        "number": "27",
                        "loc": [
                            [
                                8,
                                2
                            ]
                        ]
                    },
                    {
                        "type": "setBlock",
                        "number": "27",
                        "loc": [
                            [
                                9,
                                2
                            ]
                        ]
                    },
                    {
                        "type": "setBlock",
                        "number": "27",
                        "loc": [
                            [
                                10,
                                2
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
                        "number": "32",
                        "loc": [
                            [
                                4,
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
                                4
                            ]
                        ]
                    },
                    {
                        "type": "setBlock",
                        "number": "28",
                        "loc": [
                            [
                                7,
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
                        "type": "show",
                        "loc": [
                            [
                                6,
                                1
                            ]
                        ]
                    },
                    {
                        "type": "show",
                        "loc": [
                            [
                                6,
                                10
                            ]
                        ],
                        "floorId": "MT42"
                    },
                    {
                        "type": "setBlock",
                        "number": "87",
                        "loc": [
                            [
                                6,
                                1
                            ]
                        ]
                    },
                    {
                        "type": "hide",
                        "loc": [
                            [
                                6,
                                7
                            ]
                        ],
                        "time": 0
                    },
                    {
                        "type": "setValue",
                        "name": "flag:40F",
                        "value": "1"
                    }
                ]
            }
        ],
        "4,4": [
            {
                "type": "function",
                "function": "function(){\nvar bool = true;\nvar loc_arr = [\n\t[3, 4],\n\t[4, 4],\n\t[5, 4],\n\t[7, 4],\n\t[8, 4],\n\t[9, 4],\n\t[2, 2],\n\t[3, 2],\n\t[4, 2],\n\t[8, 2],\n\t[9, 2],\n\t[10, 2],\n\t[6, 1]\n]\nloc_arr.forEach(loc => {\n\tif (core.getBlockCls(loc[0], loc[1]) == \"enemys\") {\n\t\tbool = false;\n\t}\n});\ncore.setFlag(\"open_yes\", bool)\n}"
            },
            {
                "type": "if",
                "condition": "flag:open_yes",
                "true": [
                    "\t[骑士队长,yellowKnight]这次先饶了你，下次碰到我会和你正式的决斗，你最好投降。",
                    {
                        "type": "playSound",
                        "name": "door.mp3"
                    },
                    {
                        "type": "setBlock",
                        "number": "21",
                        "loc": [
                            [
                                2,
                                2
                            ]
                        ]
                    },
                    {
                        "type": "setBlock",
                        "number": "21",
                        "loc": [
                            [
                                3,
                                2
                            ]
                        ]
                    },
                    {
                        "type": "setBlock",
                        "number": "21",
                        "loc": [
                            [
                                4,
                                2
                            ]
                        ]
                    },
                    {
                        "type": "setBlock",
                        "number": "27",
                        "loc": [
                            [
                                8,
                                2
                            ]
                        ]
                    },
                    {
                        "type": "setBlock",
                        "number": "27",
                        "loc": [
                            [
                                9,
                                2
                            ]
                        ]
                    },
                    {
                        "type": "setBlock",
                        "number": "27",
                        "loc": [
                            [
                                10,
                                2
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
                        "number": "32",
                        "loc": [
                            [
                                4,
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
                                4
                            ]
                        ]
                    },
                    {
                        "type": "setBlock",
                        "number": "28",
                        "loc": [
                            [
                                7,
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
                        "type": "show",
                        "loc": [
                            [
                                6,
                                1
                            ]
                        ]
                    },
                    {
                        "type": "show",
                        "loc": [
                            [
                                6,
                                10
                            ]
                        ],
                        "floorId": "MT42"
                    },
                    {
                        "type": "setBlock",
                        "number": "87",
                        "loc": [
                            [
                                6,
                                1
                            ]
                        ]
                    },
                    {
                        "type": "hide",
                        "loc": [
                            [
                                6,
                                7
                            ]
                        ],
                        "time": 0
                    },
                    {
                        "type": "setValue",
                        "name": "flag:40F",
                        "value": "1"
                    }
                ]
            }
        ],
        "5,4": [
            {
                "type": "function",
                "function": "function(){\nvar bool = true;\nvar loc_arr = [\n\t[3, 4],\n\t[4, 4],\n\t[5, 4],\n\t[7, 4],\n\t[8, 4],\n\t[9, 4],\n\t[2, 2],\n\t[3, 2],\n\t[4, 2],\n\t[8, 2],\n\t[9, 2],\n\t[10, 2],\n\t[6, 1]\n]\nloc_arr.forEach(loc => {\n\tif (core.getBlockCls(loc[0], loc[1]) == \"enemys\") {\n\t\tbool = false;\n\t}\n});\ncore.setFlag(\"open_yes\", bool)\n}"
            },
            {
                "type": "if",
                "condition": "flag:open_yes",
                "true": [
                    "\t[骑士队长,yellowKnight]这次先饶了你，下次碰到我会和你正式的决斗，你最好投降。",
                    {
                        "type": "playSound",
                        "name": "door.mp3"
                    },
                    {
                        "type": "setBlock",
                        "number": "21",
                        "loc": [
                            [
                                2,
                                2
                            ]
                        ]
                    },
                    {
                        "type": "setBlock",
                        "number": "21",
                        "loc": [
                            [
                                3,
                                2
                            ]
                        ]
                    },
                    {
                        "type": "setBlock",
                        "number": "21",
                        "loc": [
                            [
                                4,
                                2
                            ]
                        ]
                    },
                    {
                        "type": "setBlock",
                        "number": "27",
                        "loc": [
                            [
                                8,
                                2
                            ]
                        ]
                    },
                    {
                        "type": "setBlock",
                        "number": "27",
                        "loc": [
                            [
                                9,
                                2
                            ]
                        ]
                    },
                    {
                        "type": "setBlock",
                        "number": "27",
                        "loc": [
                            [
                                10,
                                2
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
                        "number": "32",
                        "loc": [
                            [
                                4,
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
                                4
                            ]
                        ]
                    },
                    {
                        "type": "setBlock",
                        "number": "28",
                        "loc": [
                            [
                                7,
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
                        "type": "show",
                        "loc": [
                            [
                                6,
                                1
                            ]
                        ]
                    },
                    {
                        "type": "show",
                        "loc": [
                            [
                                6,
                                10
                            ]
                        ],
                        "floorId": "MT42"
                    },
                    {
                        "type": "setBlock",
                        "number": "87",
                        "loc": [
                            [
                                6,
                                1
                            ]
                        ]
                    },
                    {
                        "type": "hide",
                        "loc": [
                            [
                                6,
                                7
                            ]
                        ],
                        "time": 0
                    },
                    {
                        "type": "setValue",
                        "name": "flag:40F",
                        "value": "1"
                    }
                ]
            }
        ],
        "7,4": [
            {
                "type": "function",
                "function": "function(){\nvar bool = true;\nvar loc_arr = [\n\t[3, 4],\n\t[4, 4],\n\t[5, 4],\n\t[7, 4],\n\t[8, 4],\n\t[9, 4],\n\t[2, 2],\n\t[3, 2],\n\t[4, 2],\n\t[8, 2],\n\t[9, 2],\n\t[10, 2],\n\t[6, 1]\n]\nloc_arr.forEach(loc => {\n\tif (core.getBlockCls(loc[0], loc[1]) == \"enemys\") {\n\t\tbool = false;\n\t}\n});\ncore.setFlag(\"open_yes\", bool)\n}"
            },
            {
                "type": "if",
                "condition": "flag:open_yes",
                "true": [
                    "\t[骑士队长,yellowKnight]这次先饶了你，下次碰到我会和你正式的决斗，你最好投降。",
                    {
                        "type": "playSound",
                        "name": "door.mp3"
                    },
                    {
                        "type": "setBlock",
                        "number": "21",
                        "loc": [
                            [
                                2,
                                2
                            ]
                        ]
                    },
                    {
                        "type": "setBlock",
                        "number": "21",
                        "loc": [
                            [
                                3,
                                2
                            ]
                        ]
                    },
                    {
                        "type": "setBlock",
                        "number": "21",
                        "loc": [
                            [
                                4,
                                2
                            ]
                        ]
                    },
                    {
                        "type": "setBlock",
                        "number": "27",
                        "loc": [
                            [
                                8,
                                2
                            ]
                        ]
                    },
                    {
                        "type": "setBlock",
                        "number": "27",
                        "loc": [
                            [
                                9,
                                2
                            ]
                        ]
                    },
                    {
                        "type": "setBlock",
                        "number": "27",
                        "loc": [
                            [
                                10,
                                2
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
                        "number": "32",
                        "loc": [
                            [
                                4,
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
                                4
                            ]
                        ]
                    },
                    {
                        "type": "setBlock",
                        "number": "28",
                        "loc": [
                            [
                                7,
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
                        "type": "show",
                        "loc": [
                            [
                                6,
                                1
                            ]
                        ]
                    },
                    {
                        "type": "show",
                        "loc": [
                            [
                                6,
                                10
                            ]
                        ],
                        "floorId": "MT42"
                    },
                    {
                        "type": "setBlock",
                        "number": "87",
                        "loc": [
                            [
                                6,
                                1
                            ]
                        ]
                    },
                    {
                        "type": "hide",
                        "loc": [
                            [
                                6,
                                7
                            ]
                        ],
                        "time": 0
                    },
                    {
                        "type": "setValue",
                        "name": "flag:40F",
                        "value": "1"
                    }
                ]
            }
        ],
        "8,4": [
            {
                "type": "function",
                "function": "function(){\nvar bool = true;\nvar loc_arr = [\n\t[3, 4],\n\t[4, 4],\n\t[5, 4],\n\t[7, 4],\n\t[8, 4],\n\t[9, 4],\n\t[2, 2],\n\t[3, 2],\n\t[4, 2],\n\t[8, 2],\n\t[9, 2],\n\t[10, 2],\n\t[6, 1]\n]\nloc_arr.forEach(loc => {\n\tif (core.getBlockCls(loc[0], loc[1]) == \"enemys\") {\n\t\tbool = false;\n\t}\n});\ncore.setFlag(\"open_yes\", bool)\n}"
            },
            {
                "type": "if",
                "condition": "flag:open_yes",
                "true": [
                    "\t[骑士队长,yellowKnight]这次先饶了你，下次碰到我会和你正式的决斗，你最好投降。",
                    {
                        "type": "playSound",
                        "name": "door.mp3"
                    },
                    {
                        "type": "setBlock",
                        "number": "21",
                        "loc": [
                            [
                                2,
                                2
                            ]
                        ]
                    },
                    {
                        "type": "setBlock",
                        "number": "21",
                        "loc": [
                            [
                                3,
                                2
                            ]
                        ]
                    },
                    {
                        "type": "setBlock",
                        "number": "21",
                        "loc": [
                            [
                                4,
                                2
                            ]
                        ]
                    },
                    {
                        "type": "setBlock",
                        "number": "27",
                        "loc": [
                            [
                                8,
                                2
                            ]
                        ]
                    },
                    {
                        "type": "setBlock",
                        "number": "27",
                        "loc": [
                            [
                                9,
                                2
                            ]
                        ]
                    },
                    {
                        "type": "setBlock",
                        "number": "27",
                        "loc": [
                            [
                                10,
                                2
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
                        "number": "32",
                        "loc": [
                            [
                                4,
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
                                4
                            ]
                        ]
                    },
                    {
                        "type": "setBlock",
                        "number": "28",
                        "loc": [
                            [
                                7,
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
                        "type": "show",
                        "loc": [
                            [
                                6,
                                1
                            ]
                        ]
                    },
                    {
                        "type": "show",
                        "loc": [
                            [
                                6,
                                10
                            ]
                        ],
                        "floorId": "MT42"
                    },
                    {
                        "type": "setBlock",
                        "number": "87",
                        "loc": [
                            [
                                6,
                                1
                            ]
                        ]
                    },
                    {
                        "type": "hide",
                        "loc": [
                            [
                                6,
                                7
                            ]
                        ],
                        "time": 0
                    },
                    {
                        "type": "setValue",
                        "name": "flag:40F",
                        "value": "1"
                    }
                ]
            }
        ],
        "9,4": [
            {
                "type": "function",
                "function": "function(){\nvar bool = true;\nvar loc_arr = [\n\t[3, 4],\n\t[4, 4],\n\t[5, 4],\n\t[7, 4],\n\t[8, 4],\n\t[9, 4],\n\t[2, 2],\n\t[3, 2],\n\t[4, 2],\n\t[8, 2],\n\t[9, 2],\n\t[10, 2],\n\t[6, 1]\n]\nloc_arr.forEach(loc => {\n\tif (core.getBlockCls(loc[0], loc[1]) == \"enemys\") {\n\t\tbool = false;\n\t}\n});\ncore.setFlag(\"open_yes\", bool)\n}"
            },
            {
                "type": "if",
                "condition": "flag:open_yes",
                "true": [
                    "\t[骑士队长,yellowKnight]这次先饶了你，下次碰到我会和你正式的决斗，你最好投降。",
                    {
                        "type": "playSound",
                        "name": "door.mp3"
                    },
                    {
                        "type": "setBlock",
                        "number": "21",
                        "loc": [
                            [
                                2,
                                2
                            ]
                        ]
                    },
                    {
                        "type": "setBlock",
                        "number": "21",
                        "loc": [
                            [
                                3,
                                2
                            ]
                        ]
                    },
                    {
                        "type": "setBlock",
                        "number": "21",
                        "loc": [
                            [
                                4,
                                2
                            ]
                        ]
                    },
                    {
                        "type": "setBlock",
                        "number": "27",
                        "loc": [
                            [
                                8,
                                2
                            ]
                        ]
                    },
                    {
                        "type": "setBlock",
                        "number": "27",
                        "loc": [
                            [
                                9,
                                2
                            ]
                        ]
                    },
                    {
                        "type": "setBlock",
                        "number": "27",
                        "loc": [
                            [
                                10,
                                2
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
                        "number": "32",
                        "loc": [
                            [
                                4,
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
                                4
                            ]
                        ]
                    },
                    {
                        "type": "setBlock",
                        "number": "28",
                        "loc": [
                            [
                                7,
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
                        "type": "show",
                        "loc": [
                            [
                                6,
                                1
                            ]
                        ]
                    },
                    {
                        "type": "show",
                        "loc": [
                            [
                                6,
                                10
                            ]
                        ],
                        "floorId": "MT42"
                    },
                    {
                        "type": "setBlock",
                        "number": "87",
                        "loc": [
                            [
                                6,
                                1
                            ]
                        ]
                    },
                    {
                        "type": "hide",
                        "loc": [
                            [
                                6,
                                7
                            ]
                        ],
                        "time": 0
                    },
                    {
                        "type": "setValue",
                        "name": "flag:40F",
                        "value": "1"
                    }
                ]
            }
        ],
        "6,1": [
            {
                "type": "function",
                "function": "function(){\nvar bool = true;\nvar loc_arr = [\n\t[3, 4],\n\t[4, 4],\n\t[5, 4],\n\t[7, 4],\n\t[8, 4],\n\t[9, 4],\n\t[2, 2],\n\t[3, 2],\n\t[4, 2],\n\t[8, 2],\n\t[9, 2],\n\t[10, 2],\n\t[6, 1]\n]\nloc_arr.forEach(loc => {\n\tif (core.getBlockCls(loc[0], loc[1]) == \"enemys\") {\n\t\tbool = false;\n\t}\n});\ncore.setFlag(\"open_yes\", bool)\n}"
            },
            {
                "type": "if",
                "condition": "flag:open_yes",
                "true": [
                    "\t[骑士队长,yellowKnight]这次先饶了你，下次碰到我会和你正式的决斗，你最好投降。",
                    {
                        "type": "playSound",
                        "name": "door.mp3"
                    },
                    {
                        "type": "setBlock",
                        "number": "21",
                        "loc": [
                            [
                                2,
                                2
                            ]
                        ]
                    },
                    {
                        "type": "setBlock",
                        "number": "21",
                        "loc": [
                            [
                                3,
                                2
                            ]
                        ]
                    },
                    {
                        "type": "setBlock",
                        "number": "21",
                        "loc": [
                            [
                                4,
                                2
                            ]
                        ]
                    },
                    {
                        "type": "setBlock",
                        "number": "27",
                        "loc": [
                            [
                                8,
                                2
                            ]
                        ]
                    },
                    {
                        "type": "setBlock",
                        "number": "27",
                        "loc": [
                            [
                                9,
                                2
                            ]
                        ]
                    },
                    {
                        "type": "setBlock",
                        "number": "27",
                        "loc": [
                            [
                                10,
                                2
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
                        "number": "32",
                        "loc": [
                            [
                                4,
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
                                4
                            ]
                        ]
                    },
                    {
                        "type": "setBlock",
                        "number": "28",
                        "loc": [
                            [
                                7,
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
                        "type": "show",
                        "loc": [
                            [
                                6,
                                1
                            ]
                        ]
                    },
                    {
                        "type": "show",
                        "loc": [
                            [
                                6,
                                10
                            ]
                        ],
                        "floorId": "MT42"
                    },
                    {
                        "type": "setBlock",
                        "number": "87",
                        "loc": [
                            [
                                6,
                                1
                            ]
                        ]
                    },
                    {
                        "type": "hide",
                        "loc": [
                            [
                                6,
                                7
                            ]
                        ],
                        "time": 0
                    },
                    {
                        "type": "setValue",
                        "name": "flag:40F",
                        "value": "1"
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
    "upFloor": [
        6,
        2
    ],
    "downFloor": [
        10,
        11
    ],
    "autoEvent": {
        "0,7": {
            "0": null,
            "1": null
        }
    },
    "beforeBattle": {},
    "cannotMoveIn": {},
    "bg2map": [],
    "fg2map": []
}