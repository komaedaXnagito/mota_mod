main.floors.MT30=
{
    "floorId": "MT30",
    "title": "魔塔 第30层",
    "name": "第 30 层",
    "width": 13,
    "height": 13,
    "map": [
    [330,330,330,330,330,330,330,330,330,330,330,330,330],
    [330,  1,  1,  1,  1,  0, 87,  0,  1,  1,  1,  1,330],
    [330,  1,  1,  1,  1,  0,  0,  0,  1,  1,  1,  1,330],
    [330,  1,  1,  1,  1,  1,  0,  1,  1,  1,  1,  1,330],
    [330,  1,  1,  1,  1,  1,  0,  1,  1,  1,  1,  1,330],
    [330,  0,  0,203,202,201,  0,201,202,203,  0,  0,330],
    [330,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,330],
    [330,  1,  1,  1,  1,  1,  0,  1,  1,  1,  1,  1,330],
    [330,  1,  1,  1,  1,  1,  0,  1,  1,  1,  1,  1,330],
    [330,  1,  1,  1,  1,  0,  0,  0,  1,  1,  1,  1,330],
    [330,  1,  1,  1,  1,  0,  0,  0,  1,  1,  1,  1,330],
    [330,  1,  1,  1,  1,  0, 88,  0,  1,  1,  1,  1,330],
    [330,330,330,330,330,330,330,330,330,330,330,330,330]
],
    "canFlyTo": true,
    "canFlyFrom": true,
    "canUseQuickShop": true,
    "images": [],
    "ratio": 3,
    "defaultGround": "ground",
    "bgm": "section3.mp3",
    "firstArrive": [],
    "eachArrive": [],
    "parallelDo": "",
    "events": {
        "6,6": [
            {
                "type": "closeDoor",
                "id": "specialDoor",
                "loc": [
                    6,
                    4
                ],
                "async": true
            },
            {
                "type": "closeDoor",
                "id": "specialDoor",
                "loc": [
                    6,
                    7
                ]
            },
            {
                "type": "waitAsync"
            },
            {
                "type": "hide",
                "remove": true
            }
        ],
        "6,1": {
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
        "6,11": {
            "floorId": ":before",
            "stair": "upFloor"
        },
        "6,1": {
            "floorId": ":next",
            "stair": "downFloor"
        }
    },
    "afterBattle": {
        "5,5": [
            {
                "type": "function",
                "function": "function(){\nvar bool = true;\nvar loc_arr = [\n\t[3, 5],\n\t[4, 5],\n\t[5, 5],\n\t[7, 5],\n\t[8, 5],\n\t[9, 5],\n]\nloc_arr.forEach(loc => {\n\tif (core.getBlockCls(loc[0], loc[1]) == \"enemys\") {\n\t\tbool = false;\n\t}\n});\ncore.setFlag(\"open_yes\", bool)\n}"
            },
            {
                "type": "if",
                "condition": "flag:open_yes",
                "true": [
                    {
                        "type": "openDoor",
                        "loc": [
                            6,
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
                        "type": "show",
                        "loc": [
                            [
                                6,
                                1
                            ]
                        ]
                    },
                    {
                        "type": "waitAsync"
                    }
                ]
            }
        ],
        "3,5": [
            {
                "type": "function",
                "function": "function(){\nvar bool = true;\nvar loc_arr = [\n\t[3, 5],\n\t[4, 5],\n\t[5, 5],\n\t[7, 5],\n\t[8, 5],\n\t[9, 5],\n]\nloc_arr.forEach(loc => {\n\tif (core.getBlockCls(loc[0], loc[1]) == \"enemys\") {\n\t\tbool = false;\n\t}\n});\ncore.setFlag(\"open_yes\", bool)\n}"
            },
            {
                "type": "if",
                "condition": "flag:open_yes",
                "true": [
                    {
                        "type": "openDoor",
                        "loc": [
                            6,
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
                        "type": "show",
                        "loc": [
                            [
                                6,
                                1
                            ]
                        ]
                    },
                    {
                        "type": "waitAsync"
                    }
                ]
            }
        ],
        "4,5": [
            {
                "type": "function",
                "function": "function(){\nvar bool = true;\nvar loc_arr = [\n\t[3, 5],\n\t[4, 5],\n\t[5, 5],\n\t[7, 5],\n\t[8, 5],\n\t[9, 5],\n]\nloc_arr.forEach(loc => {\n\tif (core.getBlockCls(loc[0], loc[1]) == \"enemys\") {\n\t\tbool = false;\n\t}\n});\ncore.setFlag(\"open_yes\", bool)\n}"
            },
            {
                "type": "if",
                "condition": "flag:open_yes",
                "true": [
                    {
                        "type": "openDoor",
                        "loc": [
                            6,
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
                        "type": "show",
                        "loc": [
                            [
                                6,
                                1
                            ]
                        ]
                    },
                    {
                        "type": "waitAsync"
                    }
                ]
            }
        ],
        "7,5": [
            {
                "type": "function",
                "function": "function(){\nvar bool = true;\nvar loc_arr = [\n\t[3, 5],\n\t[4, 5],\n\t[5, 5],\n\t[7, 5],\n\t[8, 5],\n\t[9, 5],\n]\nloc_arr.forEach(loc => {\n\tif (core.getBlockCls(loc[0], loc[1]) == \"enemys\") {\n\t\tbool = false;\n\t}\n});\ncore.setFlag(\"open_yes\", bool)\n}"
            },
            {
                "type": "if",
                "condition": "flag:open_yes",
                "true": [
                    {
                        "type": "openDoor",
                        "loc": [
                            6,
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
                        "type": "show",
                        "loc": [
                            [
                                6,
                                1
                            ]
                        ]
                    },
                    {
                        "type": "waitAsync"
                    }
                ]
            }
        ],
        "8,5": [
            {
                "type": "function",
                "function": "function(){\nvar bool = true;\nvar loc_arr = [\n\t[3, 5],\n\t[4, 5],\n\t[5, 5],\n\t[7, 5],\n\t[8, 5],\n\t[9, 5],\n]\nloc_arr.forEach(loc => {\n\tif (core.getBlockCls(loc[0], loc[1]) == \"enemys\") {\n\t\tbool = false;\n\t}\n});\ncore.setFlag(\"open_yes\", bool)\n}"
            },
            {
                "type": "if",
                "condition": "flag:open_yes",
                "true": [
                    {
                        "type": "openDoor",
                        "loc": [
                            6,
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
                        "type": "show",
                        "loc": [
                            [
                                6,
                                1
                            ]
                        ]
                    },
                    {
                        "type": "waitAsync"
                    }
                ]
            }
        ],
        "9,5": [
            {
                "type": "function",
                "function": "function(){\nvar bool = true;\nvar loc_arr = [\n\t[3, 5],\n\t[4, 5],\n\t[5, 5],\n\t[7, 5],\n\t[8, 5],\n\t[9, 5],\n]\nloc_arr.forEach(loc => {\n\tif (core.getBlockCls(loc[0], loc[1]) == \"enemys\") {\n\t\tbool = false;\n\t}\n});\ncore.setFlag(\"open_yes\", bool)\n}"
            },
            {
                "type": "if",
                "condition": "flag:open_yes",
                "true": [
                    {
                        "type": "openDoor",
                        "loc": [
                            6,
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
                        "type": "show",
                        "loc": [
                            [
                                6,
                                1
                            ]
                        ]
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
    "downFloor": [
        6,
        10
    ],
    "upFloor": [
        6,
        2
    ],
    "autoEvent": {
        "6,7": {
            "0": null,
            "1": null
        }
    },
    "beforeBattle": {},
    "cannotMoveIn": {},
    "bg2map": [],
    "fg2map": []
}