main.floors.MT33=
{
    "floorId": "MT33",
    "title": "魔塔 第33层",
    "name": "第 33 层",
    "width": 13,
    "height": 13,
    "map": [
    [330,330,330,330,330,330,330,330,330,330,330,330,330],
    [330, 87,  0, 81,214,  0,216, 81,  0,  0,  0, 88,330],
    [330,  0,  0,  1,  0, 31,  0,  1, 81,  1,  1,  1,330],
    [330, 82,  1,  1,121,  0, 21,  1,  0,  0,  0, 32,330],
    [330,  0, 31,  1,  1, 81,  1,  1,  1,  1,  0,  1,330],
    [330,216,  0,  1,  0,  0,214,  0,  1,212,  0,212,330],
    [330,  0,  0,  1,224,  1,  1, 81,  1,  0,  0,  0,330],
    [330,  0,216, 81,  0,  0,212,  0,  1,225,  0,225,330],
    [330, 81,  1,  1,  1,  1,  1,  1,  1,  1,  0,  1,330],
    [330,  0,  0,214,  1,  0,225,  0,  1,  0,  0,  0,330],
    [330,224,  1,  0,  1, 21,  1,216,  0,  0, 39,  0,330],
    [330, 21,225,  0, 82,  0, 81,  0,  1,  0,  0,  0,330],
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
        "9,10": [
            {
                "type": "closeDoor",
                "id": "yellowWall",
                "loc": [
                    8,
                    10
                ]
            },
            {
                "type": "hide",
                "remove": true,
                "time": 0
            }
        ],
        "10,5": [
            {
                "type": "closeDoor",
                "id": "specialDoor",
                "loc": [
                    10,
                    4
                ],
                "async": true
            },
            {
                "type": "closeDoor",
                "id": "specialDoor",
                "loc": [
                    10,
                    8
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
        "4,3": [
            "\t[老人,man]欲速则不达。",
            {
                "type": "hide",
                "remove": true,
                "time": 200
            }
        ]
    },
    "changeFloor": {
        "11,1": {
            "floorId": ":before",
            "stair": "upFloor"
        },
        "1,1": {
            "floorId": ":next",
            "stair": "downFloor"
        }
    },
    "afterBattle": {
        "9,5": [
            {
                "type": "function",
                "function": "function(){\nvar bool = true;\nvar loc_arr = [\n\t[9, 5],\n\t[11, 5],\n\t[9, 7],\n\t[11, 7],\n]\nloc_arr.forEach(loc => {\n\tif (core.getBlockCls(loc[0], loc[1]) == \"enemys\") {\n\t\tbool = false;\n\t}\n});\ncore.setFlag(\"open_yes\", bool)\n}"
            },
            {
                "type": "if",
                "condition": "flag:open_yes",
                "true": [
                    {
                        "type": "openDoor",
                        "loc": [
                            10,
                            4
                        ],
                        "async": true
                    },
                    {
                        "type": "openDoor",
                        "loc": [
                            10,
                            8
                        ]
                    },
                    {
                        "type": "waitAsync"
                    },
                    {
                        "type": "hide",
                        "loc": [
                            [
                                10,
                                5
                            ]
                        ],
                        "remove": true
                    }
                ]
            }
        ],
        "9,7": [
            {
                "type": "function",
                "function": "function(){\nvar bool = true;\nvar loc_arr = [\n\t[9, 5],\n\t[11, 5],\n\t[9, 7],\n\t[11, 7],\n]\nloc_arr.forEach(loc => {\n\tif (core.getBlockCls(loc[0], loc[1]) == \"enemys\") {\n\t\tbool = false;\n\t}\n});\ncore.setFlag(\"open_yes\", bool)\n}"
            },
            {
                "type": "if",
                "condition": "flag:open_yes",
                "true": [
                    {
                        "type": "openDoor",
                        "loc": [
                            10,
                            4
                        ],
                        "async": true
                    },
                    {
                        "type": "openDoor",
                        "loc": [
                            10,
                            8
                        ]
                    },
                    {
                        "type": "waitAsync"
                    },
                    {
                        "type": "hide",
                        "loc": [
                            [
                                10,
                                5
                            ]
                        ],
                        "remove": true
                    }
                ]
            }
        ],
        "11,7": [
            {
                "type": "function",
                "function": "function(){\nvar bool = true;\nvar loc_arr = [\n\t[9, 5],\n\t[11, 5],\n\t[9, 7],\n\t[11, 7],\n]\nloc_arr.forEach(loc => {\n\tif (core.getBlockCls(loc[0], loc[1]) == \"enemys\") {\n\t\tbool = false;\n\t}\n});\ncore.setFlag(\"open_yes\", bool)\n}"
            },
            {
                "type": "if",
                "condition": "flag:open_yes",
                "true": [
                    {
                        "type": "openDoor",
                        "loc": [
                            10,
                            4
                        ],
                        "async": true
                    },
                    {
                        "type": "openDoor",
                        "loc": [
                            10,
                            8
                        ]
                    },
                    {
                        "type": "waitAsync"
                    },
                    {
                        "type": "hide",
                        "loc": [
                            [
                                10,
                                5
                            ]
                        ],
                        "remove": true
                    }
                ]
            }
        ],
        "11,5": [
            {
                "type": "function",
                "function": "function(){\nvar bool = true;\nvar loc_arr = [\n\t[9, 5],\n\t[11, 5],\n\t[9, 7],\n\t[11, 7],\n]\nloc_arr.forEach(loc => {\n\tif (core.getBlockCls(loc[0], loc[1]) == \"enemys\") {\n\t\tbool = false;\n\t}\n});\ncore.setFlag(\"open_yes\", bool)\n}"
            },
            {
                "type": "if",
                "condition": "flag:open_yes",
                "true": [
                    {
                        "type": "openDoor",
                        "loc": [
                            10,
                            4
                        ],
                        "async": true
                    },
                    {
                        "type": "openDoor",
                        "loc": [
                            10,
                            8
                        ]
                    },
                    {
                        "type": "waitAsync"
                    },
                    {
                        "type": "hide",
                        "loc": [
                            [
                                10,
                                5
                            ]
                        ],
                        "remove": true
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
        2,
        1
    ],
    "downFloor": [
        10,
        1
    ],
    "autoEvent": {},
    "beforeBattle": {},
    "cannotMoveIn": {},
    "bg2map": [],
    "fg2map": []
}