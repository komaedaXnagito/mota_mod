main.floors.MT38=
{
    "floorId": "MT38",
    "title": "魔塔 第38层",
    "name": "第 38 层",
    "width": 13,
    "height": 13,
    "map": [
    [330,330,330,330,330,330,330,330,330,330,330,330,330],
    [330, 88,  0, 83,216,  0,  0,  0,216, 81,  0, 87,330],
    [330,  0,  0,  1,  0,122, 21,  0,  0,  1,  0,  0,330],
    [330,212,  1,  1,  1,  1,  1, 81,  1,  1,  1, 81,330],
    [330,  0,  0,225,225,  0,  1,  0,  1, 21,  1,  0,330],
    [330,  1,  0,  1,  1, 82,  1,  0,  1, 21,  1,  0,330],
    [330,  0,  0,  0, 82, 82,  1,212,  1, 21,  1,212,330],
    [330,  0, 40,  0,  1,  1,  1,224,  1,  0,227,  0,330],
    [330,  0,  0,  0,  1, 28, 31,  0,  1,  1,  1, 81,330],
    [330,  1,  1,  1,  1,  1,  1,  1,  1, 21,  0,212,330],
    [330,222,  0,222,  1,  0,  0,  0,  1,  0,227,  0,330],
    [330,  0,  0,  0, 81,224,  0,213, 81,225,  0, 32,330],
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
        "2,6": [
            {
                "type": "closeDoor",
                "id": "yellowWall",
                "loc": [
                    2,
                    5
                ]
            },
            {
                "type": "hide",
                "remove": true,
                "time": 0
            }
        ],
        "5,2": [
            {
                "type": "comment",
                "text": "\\d\\c[24]\\i[I361]\\c\r[rgb(244,108,108)](-200G)\\c[24]\\i[T358]\\i[yellowKey]\\c\r[rgb(224,210,69)](+3)"
            },
            {
                "type": "if",
                "condition": "switch:A",
                "true": [
                    "\t[商人,woman]永远不存在没有门卫的特殊门。换言之，一定有门卫守卫同楼层的特殊门。所以……",
                    {
                        "type": "hide",
                        "remove": true
                    }
                ],
                "false": [
                    {
                        "type": "choices",
                        "text": "\t[商人,woman]我以200金币特价卖3把黄钥匙，先到先得。",
                        "choices": [
                            {
                                "text": "我太需要了",
                                "need": "status:money>=200",
                                "action": [
                                    {
                                        "type": "setValue",
                                        "name": "status:money",
                                        "operator": "-=",
                                        "value": "200"
                                    },
                                    {
                                        "type": "setValue",
                                        "name": "item:yellowKey",
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
        ]
    },
    "changeFloor": {
        "1,1": {
            "floorId": ":before",
            "stair": "upFloor"
        },
        "11,1": {
            "floorId": ":next",
            "stair": "downFloor"
        }
    },
    "afterBattle": {
        "1,10": [
            {
                "type": "function",
                "function": "function(){\nvar bool = true;\nvar loc_arr = [\n\t[1, 10],\n\t[3, 10],\n]\nloc_arr.forEach(loc => {\n\tif (core.getBlockCls(loc[0], loc[1]) == \"enemys\") {\n\t\tbool = false;\n\t}\n});\ncore.setFlag(\"open_yes\", bool)\n}"
            },
            {
                "type": "if",
                "condition": "flag:open_yes",
                "true": [
                    {
                        "type": "openDoor",
                        "loc": [
                            2,
                            9
                        ]
                    }
                ]
            }
        ],
        "3,10": [
            {
                "type": "function",
                "function": "function(){\nvar bool = true;\nvar loc_arr = [\n\t[1, 10],\n\t[3, 10],\n]\nloc_arr.forEach(loc => {\n\tif (core.getBlockCls(loc[0], loc[1]) == \"enemys\") {\n\t\tbool = false;\n\t}\n});\ncore.setFlag(\"open_yes\", bool)\n}"
            },
            {
                "type": "if",
                "condition": "flag:open_yes",
                "true": [
                    {
                        "type": "openDoor",
                        "loc": [
                            2,
                            9
                        ]
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