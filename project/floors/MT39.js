main.floors.MT39=
{
    "floorId": "MT39",
    "title": "魔塔 第39层",
    "name": "第 39 层",
    "width": 13,
    "height": 13,
    "map": [
    [330,330,330,330,330,330,330,330,330,330,330,330,330],
    [330,  0,  0,  0,  0,  0,  0,  0,  1,  0,  0, 88,330],
    [330,  0, 81,  0, 81,  0, 81,  0,  1,122,  0,  0,330],
    [330,  0,  0,  0,  0,  0,  0,  0,  1,  0,  0, 21,330],
    [330,  0, 81,  0, 81,  0, 81,  0,  1,  1, 81,  1,330],
    [330,  0,  0,  0,  0,  0,  0,  0,  1,  0,  0,225,330],
    [330,  0, 81,  0, 81,  0, 81,  0,  1,216,  1, 27,330],
    [330,  0,  0,  0,  0,  0,  0,  0,  1,  0,  0,212,330],
    [330,  1, 82,  1,  1,  1,  1,  1,  1,  1, 81,  1,330],
    [330,  0,  0,212,  1,224, 28,227,  1,  0,227,  0,330],
    [330,  1,212,  0, 81,  0,  1,  0, 81,  0,  0,  0,330],
    [330,121,  0, 21,  1,  0,216,  0,  1, 31,  0, 87,330],
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
        "9,2": [
            {
                "type": "comment",
                "text": "\\d\\c[24]\\i[I361]\\c\r[rgb(244,108,108)](-2000G)\\c[24]\\i[T358]\\i[blueKey]\\c\r[rgb(170,170,221)](+3)"
            },
            {
                "type": "if",
                "condition": "switch:A",
                "true": [
                    "\t[商人,woman]你居然买了我的钥匙 那我就告诉你一个秘密 神圣剑有3种方法可以得到 不同的方法路线也会不同",
                    {
                        "type": "hide",
                        "remove": true
                    }
                ],
                "false": [
                    {
                        "type": "choices",
                        "text": "\t[商人,woman]我2000金币卖3把蓝钥匙，你买吗？",
                        "choices": [
                            {
                                "text": "我太需要了",
                                "need": "status:money>=2000",
                                "action": [
                                    {
                                        "type": "setValue",
                                        "name": "status:money",
                                        "operator": "-=",
                                        "value": "2000"
                                    },
                                    {
                                        "type": "setValue",
                                        "name": "item:blueKey",
                                        "operator": "+=",
                                        "value": "3"
                                    },
                                    {
                                        "type": "setValue",
                                        "name": "switch:A",
                                        "value": "true"
                                    }
                                ]
                            },
                            {
                                "text": "离开",
                                "action": []
                            }
                        ]
                    }
                ]
            }
        ],
        "1,11": [
            "\t[老登,man]在3点钟方向，可以空间传送的秘宝将会出现。",
            {
                "type": "hide",
                "remove": true,
                "time": 200
            }
        ],
        "4,4": {
            "trigger": "action",
            "enable": true,
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
            "data": [
                {
                    "type": "if",
                    "condition": "(blockId:4,4==='centerFly')",
                    "true": [
                        {
                            "type": "addValue",
                            "name": "item:centerFly",
                            "value": "3"
                        },
                        {
                            "type": "hide",
                            "time": 0
                        }
                    ],
                    "false": [
                        {
                            "type": "openDoor",
                            "needKey": true
                        }
                    ]
                }
            ]
        }
    },
    "changeFloor": {
        "11,1": {
            "floorId": ":before",
            "stair": "upFloor"
        },
        "11,11": {
            "floorId": ":next",
            "stair": "downFloor"
        }
    },
    "afterBattle": {},
    "afterGetItem": {},
    "afterOpenDoor": {
        "4,2": [
            {
                "type": "function",
                "function": "function(){\nvar bool = true;\nvar loc_arr = [\n\t[4, 2],\n\t[6, 4],\n]\nloc_arr.forEach(loc => {\n\tif (core.getBlockId(loc[0], loc[1]) == \"yellowDoor\") {\n\t\tbool = false;\n\t}\n});\nvar loc_arr = [\n\t[2, 2],\n\t[2, 4],\n\t[2, 6],\n\t[4, 4],\n\t[4, 6],\n\t[6, 2],\n\t[6, 6],\n]\nloc_arr.forEach(loc => {\n\tif (core.getBlockId(loc[0], loc[1]) != \"yellowDoor\") {\n\t\tbool = false;\n\t}\n});\ncore.setFlag(\"open_yes\", bool)\n}"
            },
            {
                "type": "if",
                "condition": "flag:open_yes",
                "true": [
                    {
                        "type": "setBlock",
                        "number": "centerFly",
                        "loc": [
                            [
                                4,
                                4
                            ]
                        ],
                        "time": 500
                    }
                ]
            }
        ],
        "6,4": [
            {
                "type": "function",
                "function": "function(){\nvar bool = true;\nvar loc_arr = [\n\t[4, 2],\n\t[6, 4],\n]\nloc_arr.forEach(loc => {\n\tif (core.getBlockId(loc[0], loc[1]) == \"yellowDoor\") {\n\t\tbool = false;\n\t}\n});\nvar loc_arr = [\n\t[2, 2],\n\t[2, 4],\n\t[2, 6],\n\t[4, 4],\n\t[4, 6],\n\t[6, 2],\n\t[6, 6],\n]\nloc_arr.forEach(loc => {\n\tif (core.getBlockId(loc[0], loc[1]) != \"yellowDoor\") {\n\t\tbool = false;\n\t}\n});\ncore.setFlag(\"open_yes\", bool)\n}"
            },
            {
                "type": "if",
                "condition": "flag:open_yes",
                "true": [
                    {
                        "type": "setBlock",
                        "number": "centerFly",
                        "loc": [
                            [
                                4,
                                4
                            ]
                        ],
                        "time": 500
                    }
                ]
            }
        ]
    },
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
        11,
        10
    ],
    "downFloor": [
        11,
        2
    ],
    "autoEvent": {},
    "beforeBattle": {},
    "cannotMoveIn": {},
    "bg2map": [],
    "fg2map": []
}