main.floors.MT45=
{
    "floorId": "MT45",
    "title": "魔塔 第45层",
    "name": "第 45 层",
    "width": 13,
    "height": 13,
    "map": [
    [330,330,330,330,330,330,330,330,330,330,330,330,330],
    [330, 88,  0,  0,  0,  0,  0,  0,  0,  0,  0, 87,330],
    [330,  1,  1,  1,  1,  1, 81,  1,  1,  1,  1,  1,330],
    [330, 27, 27,  0,  1,219,  0,220,  1,122,  0,  0,330],
    [330, 82,  1,228,  1,  0,  0,  0,  1,  0,  0,204,330],
    [330, 28, 28,  0,  1,220,  0,219,  1,  1,  1, 81,330],
    [330, 82,  1,228,  1,  1, 81,  1,  1,121,  1,  0,330],
    [330,  0,  0,  0, 81,  0,  0,207,  0,  0,  0, 21,330],
    [330,  1, 83,  1,  1,  1,  1,  1,  1,  1,220,  0,330],
    [330,  0,  0,  0,  1,228,  0,  1,246,  1,  1, 81,330],
    [330,  0, 51,  0, 85,  0,  0, 85,  0, 81,  0,  0,330],
    [330,  0,  0,  0,  1,228,  0,  1,246,  1,  0, 32,330],
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
        "9,3": [
            {
                "type": "comment",
                "text": "\\d\\c[24]\\i[I361]\\c\r[rgb(244,108,108)](-1000G)\\c[24]\\i[T358]\\i[I360]\\c\r[rgb(66,185,131)](+2000)"
            },
            {
                "type": "if",
                "condition": "switch:A",
                "true": [
                    "\t[商人,woman]神圣盾可以让你抵挡魔法攻击。我听说它被藏在某不存在的楼层中。",
                    {
                        "type": "hide",
                        "remove": true,
                        "time": 200
                    }
                ],
                "false": [
                    {
                        "type": "choices",
                        "text": "\t[商人,woman]给我1000金币我就恢复你2000生命",
                        "choices": [
                            {
                                "text": "是",
                                "action": [
                                    {
                                        "type": "if",
                                        "condition": "(status:money>=1000)",
                                        "true": [
                                            {
                                                "type": "setValue",
                                                "name": "status:money",
                                                "operator": "-=",
                                                "value": "1000"
                                            },
                                            {
                                                "type": "setValue",
                                                "name": "status:hp",
                                                "operator": "+=",
                                                "value": "2000"
                                            },
                                            {
                                                "type": "playSound",
                                                "name": "确定"
                                            },
                                            {
                                                "type": "setValue",
                                                "name": "switch:A",
                                                "value": "true"
                                            },
                                            "\t[商人,woman]感谢惠顾。"
                                        ],
                                        "false": [
                                            {
                                                "type": "playSound",
                                                "name": "操作失败"
                                            },
                                            "\t[商人,woman]你的金币不足！"
                                        ]
                                    }
                                ]
                            },
                            {
                                "text": "否",
                                "action": []
                            }
                        ]
                    }
                ]
            }
        ],
        "9,6": [
            "\t[老登,man]44楼被藏在异空间 你只能用移动宝物才能到达",
            {
                "type": "hide",
                "remove": true
            }
        ]
    },
    "changeFloor": {
        "1,1": {
            "floorId": "MT43",
            "stair": "upFloor"
        },
        "11,1": {
            "floorId": ":next",
            "stair": "downFloor"
        }
    },
    "afterBattle": {
        "8,9": [
            {
                "type": "function",
                "function": "function(){\nvar bool = true;\nvar loc_arr = [\n\t[8, 9],\n\t[8, 11],\n]\nloc_arr.forEach(loc => {\n\tif (core.getBlockCls(loc[0], loc[1]) == \"enemys\") {\n\t\tbool = false;\n\t}\n});\ncore.setFlag(\"open_yes\", bool)\n}"
            },
            {
                "type": "if",
                "condition": "flag:open_yes",
                "true": [
                    {
                        "type": "openDoor",
                        "loc": [
                            7,
                            10
                        ]
                    },
                    {
                        "type": "hide",
                        "time": 0
                    }
                ]
            }
        ],
        "8,11": [
            {
                "type": "function",
                "function": "function(){\nvar bool = true;\nvar loc_arr = [\n\t[8, 9],\n\t[8, 11],\n]\nloc_arr.forEach(loc => {\n\tif (core.getBlockCls(loc[0], loc[1]) == \"enemys\") {\n\t\tbool = false;\n\t}\n});\ncore.setFlag(\"open_yes\", bool)\n}"
            },
            {
                "type": "if",
                "condition": "flag:open_yes",
                "true": [
                    {
                        "type": "openDoor",
                        "loc": [
                            7,
                            10
                        ]
                    },
                    {
                        "type": "hide",
                        "time": 0
                    }
                ]
            }
        ],
        "5,9": [
            {
                "type": "function",
                "function": "function(){\nvar bool = true;\nvar loc_arr = [\n\t[5, 9],\n\t[5, 11],\n]\nloc_arr.forEach(loc => {\n\tif (core.getBlockCls(loc[0], loc[1]) == \"enemys\") {\n\t\tbool = false;\n\t}\n});\ncore.setFlag(\"open_yes\", bool)\n}"
            },
            {
                "type": "if",
                "condition": "flag:open_yes",
                "true": [
                    {
                        "type": "openDoor",
                        "loc": [
                            4,
                            10
                        ]
                    },
                    {
                        "type": "hide",
                        "time": 0
                    }
                ]
            }
        ],
        "5,11": [
            {
                "type": "function",
                "function": "function(){\nvar bool = true;\nvar loc_arr = [\n\t[5, 9],\n\t[5, 11],\n]\nloc_arr.forEach(loc => {\n\tif (core.getBlockCls(loc[0], loc[1]) == \"enemys\") {\n\t\tbool = false;\n\t}\n});\ncore.setFlag(\"open_yes\", bool)\n}"
            },
            {
                "type": "if",
                "condition": "flag:open_yes",
                "true": [
                    {
                        "type": "openDoor",
                        "loc": [
                            4,
                            10
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
        10,
        1
    ],
    "downFloor": [
        2,
        1
    ],
    "autoEvent": {},
    "beforeBattle": {},
    "cannotMoveIn": {},
    "bg2map": [],
    "fg2map": []
}