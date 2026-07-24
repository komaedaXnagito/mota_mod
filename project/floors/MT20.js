main.floors.MT20=
{
    "floorId": "MT20",
    "title": "魔塔 第20层",
    "name": "第 20 层",
    "width": 13,
    "height": 13,
    "map": [
    [330,330,330,330,330,330,330,330,330,330,330,330,330],
    [330,  0,  0,  0,  0,  0, 87,  0,  0,  0,  0,  0,330],
    [330,  1,  1,  1,  1,  0,  0,  0,  1,  1,  1,  1,330],
    [330,  1,  1,  1,  1,  1, 85,  1,  1,  1,  1,  1,330],
    [330, 28, 27,  1,  0,  0,  0,  0,  0,  1, 31, 32,330],
    [330, 21,  0,  1,  0,206,206,206,  0,  1,  0, 21,330],
    [330,  1, 82,  1,  0,206,208,206,  0,  1, 82,  1,330],
    [330,205,  0,  1,  0,206,206,206,  0,  1,  0,205,330],
    [330,  0,205,  1,  0,  0,  0,  0,  0,  1,205,  0,330],
    [330, 81,  1,  1,  1,  1, 83,  1,  1,  1,  1, 81,330],
    [330,  0,215,  0,  1,  0,  0,  0,  1,  0,215,  0,330],
    [330, 31,  0,  0,218,  0, 88,  0,218,  0,  0, 31,330],
    [330,330,330,330,330,330,330,330,330,330,330,330,330]
],
    "canFlyTo": true,
    "canFlyFrom": true,
    "canUseQuickShop": true,
    "images": [],
    "ratio": 2,
    "defaultGround": "ground",
    "bgm": "section2.mp3",
    "firstArrive": [],
    "eachArrive": [],
    "parallelDo": "",
    "events": {
        "6,8": [
            {
                "type": "openDoor",
                "loc": [
                    6,
                    9
                ]
            },
            {
                "type": "closeDoor",
                "id": "specialDoor",
                "loc": [
                    6,
                    9
                ]
            },
            {
                "type": "move",
                "loc": [
                    5,
                    5
                ],
                "time": 1000,
                "async": true,
                "steps": [
                    "rightdown:1"
                ]
            },
            {
                "type": "move",
                "loc": [
                    6,
                    5
                ],
                "time": 1000,
                "async": true,
                "steps": [
                    "down:1"
                ]
            },
            {
                "type": "move",
                "loc": [
                    7,
                    5
                ],
                "time": 1000,
                "async": true,
                "steps": [
                    "leftdown:1"
                ]
            },
            {
                "type": "move",
                "loc": [
                    5,
                    6
                ],
                "time": 1000,
                "async": true,
                "steps": [
                    "right:1"
                ]
            },
            {
                "type": "move",
                "loc": [
                    7,
                    6
                ],
                "time": 1000,
                "async": true,
                "steps": [
                    "left:1"
                ]
            },
            {
                "type": "move",
                "loc": [
                    5,
                    7
                ],
                "time": 1000,
                "async": true,
                "steps": [
                    "rightup:1"
                ]
            },
            {
                "type": "move",
                "loc": [
                    6,
                    7
                ],
                "time": 1000,
                "async": true,
                "steps": [
                    "up:1"
                ]
            },
            {
                "type": "move",
                "loc": [
                    7,
                    7
                ],
                "time": 1000,
                "steps": [
                    "leftup:1"
                ]
            },
            {
                "type": "waitAsync"
            },
            {
                "type": "setBlockOpacity",
                "loc": [
                    [
                        6,
                        6
                    ]
                ],
                "opacity": 1,
                "time": 1000
            },
            {
                "type": "sleep",
                "time": 200
            },
            {
                "type": "waitAsync"
            },
            "\t[吸血鬼,vampire]很好 你打败了骷髅族 但别想象藐视骷髅人那样藐视我 我对于你就像是神一样 是不可战胜的 来吧",
            {
                "type": "playBgm",
                "name": "boss2.mp3"
            },
            {
                "type": "hide",
                "remove": true
            }
        ],
        "6,6": {
            "trigger": null,
            "enable": true,
            "noPass": null,
            "displayDamage": true,
            "opacity": 0.2,
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
        "6,6": [
            "\t[吸血鬼,vampire]上帝啊 我做梦也没想到我会被别人打败 毫无疑问你是比我强 但以你现在的状态对于大法师来说又太弱了 你仅仅取得了一个暂时的胜利",
            {
                "type": "hide",
                "loc": [
                    [
                        6,
                        8
                    ]
                ],
                "remove": true
            },
            {
                "type": "hide",
                "loc": [
                    [
                        5,
                        5
                    ],
                    [
                        6,
                        5
                    ],
                    [
                        7,
                        5
                    ],
                    [
                        7,
                        6
                    ],
                    [
                        7,
                        7
                    ],
                    [
                        6,
                        7
                    ],
                    [
                        5,
                        7
                    ],
                    [
                        5,
                        6
                    ]
                ],
                "remove": true
            },
            {
                "type": "show",
                "loc": [
                    [
                        6,
                        8
                    ]
                ]
            },
            {
                "type": "setBlock",
                "number": "21",
                "loc": [
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
                ]
            },
            {
                "type": "setBlock",
                "number": "27",
                "loc": [
                    [
                        4,
                        5
                    ],
                    [
                        4,
                        6
                    ],
                    [
                        4,
                        7
                    ]
                ]
            },
            {
                "type": "setBlock",
                "number": "28",
                "loc": [
                    [
                        8,
                        5
                    ],
                    [
                        8,
                        6
                    ],
                    [
                        8,
                        7
                    ]
                ]
            },
            {
                "type": "setBlock",
                "number": "32",
                "loc": [
                    [
                        7,
                        8
                    ],
                    [
                        5,
                        8
                    ],
                    [
                        6,
                        8
                    ]
                ]
            },
            {
                "type": "openDoor",
                "loc": [
                    6,
                    3
                ],
                "async": true
            },
            {
                "type": "openDoor",
                "loc": [
                    6,
                    9
                ]
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
    "downFloor": [
        6,
        10
    ],
    "upFloor": [
        6,
        2
    ],
    "autoEvent": {},
    "beforeBattle": {},
    "cannotMoveIn": {},
    "bg2map": [],
    "fg2map": []
}