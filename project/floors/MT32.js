main.floors.MT32=
{
    "floorId": "MT32",
    "title": "魔塔 第32层",
    "name": "第 32 层",
    "width": 13,
    "height": 13,
    "map": [
    [330,330,330,330,330,330,330,330,330,330,330,330,330],
    [330, 28,  0, 82,  0,  0,  0,  0,  0,  0,  0, 87,330],
    [330,  0, 27,  1,  1,  1,  0,  1,  1,  1,  0,  0,330],
    [330, 81,  1,  1,  0, 81,  0, 81,  0,  1,  1,  1,330],
    [330,225,  0,216,  0,  1,  0,  1,212,  1, 21, 32,330],
    [330,  0, 21,  0,216,  1,  0,  1,  0, 81,  0, 21,330],
    [330,  1,  1,  1,  1,  1,  0,  1,  0,  1,  1,  1,330],
    [330, 21, 21, 21, 21,  1,  0,  1,227,  1, 21, 22,330],
    [330,  0,  0,  0, 22,  1,  0,  1,  0, 81,  0, 21,330],
    [330,  1, 85,  1,  1,  1,  0,  1,  1,  1,  1,  1,330],
    [330,222,  0,222,  0,  0,  0,  0,  0,  7,131,  8,330],
    [330,  0,  0,  0,  0, 88,  0,  1,212,  0,  0,  0,330],
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
        "10,10": [
            {
                "type": "openShop",
                "id": "shop3",
                "open": true
            }
        ],
        "6,10": [
            {
                "type": "setEnemy",
                "id": "yellowKnight",
                "name": "special",
                "value": "[1]"
            },
            {
                "type": "setBlock",
                "number": "yellowKnight",
                "loc": [
                    [
                        10,
                        1
                    ]
                ],
                "time": 500
            },
            {
                "type": "move",
                "loc": [
                    10,
                    1
                ],
                "time": 200,
                "keep": true,
                "steps": [
                    "left:4"
                ]
            },
            "\t[骑士队长,yellowKnight]你打败了前2个区域的头目 这表明你是个勇士 但现在游戏结束了 我将在这里亲手杀死你",
            {
                "type": "callBook"
            },
            {
                "type": "move",
                "loc": [
                    6,
                    1
                ],
                "time": 200,
                "keep": true,
                "steps": [
                    "down:8"
                ]
            },
            {
                "type": "battle",
                "id": "yellowKnight"
            },
            {
                "type": "move",
                "loc": [
                    6,
                    9
                ],
                "time": 200,
                "keep": true,
                "steps": [
                    "up:8"
                ]
            },
            "\t[骑士队长,yellowKnight]你以为你已非常强大了吗 嘿嘿错了 只是我今天状态不佳而已 我走了 有本事到40楼与我再打一次",
            {
                "type": "move",
                "loc": [
                    6,
                    1
                ],
                "time": 200,
                "steps": [
                    "right:5"
                ]
            },
            {
                "type": "setEnemy",
                "id": "yellowKnight",
                "name": "special",
                "value": "[]"
            },
            {
                "type": "hide",
                "remove": true,
                "time": 0
            }
        ]
    },
    "changeFloor": {
        "5,11": {
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
        6,
        11
    ],
    "upFloor": [
        10,
        1
    ],
    "autoEvent": {},
    "beforeBattle": {},
    "cannotMoveIn": {},
    "bg2map": [],
    "fg2map": []
}