main.floors.MT3=
{
    "floorId": "MT3",
    "title": "魔塔 第03层",
    "name": "第 3 层",
    "width": 13,
    "height": 13,
    "map": [
    [330,330,330,330,330,330,330,330,330,330,330,330,330],
    [330, 21, 28,  1, 21, 32, 21,  1,  0,  1,  0, 31,330],
    [330,  0, 31,  1, 32, 21, 32,  1,  0, 81,205,  0,330],
    [330,217,  0,  1, 21, 22, 21,  1,  0,  1,  1,  1,330],
    [330, 81,  1,  1,  1,  0,  1,  1,  0,  1,  0,121,330],
    [330,  0,  0,205,  0,  0,  0,201,  0,  0,  0,  0,330],
    [330, 81,  1,  1,  0,  0,  0,  1,  0,  1,  1,  1,330],
    [330,209,  0,  1,  1,  0,  1,  1,  0,  1,  0, 31,330],
    [330,  0, 21,  1,  0,  0,  0,  1,  0, 81,217, 21,330],
    [330, 31, 27,  1,  0,  0,  0,  1,  0,  1,  1,  1,330],
    [330,  1,  1,  1,  1,  0,  1,  1,202,  1,  0,  0,330],
    [330, 88,  0,  0,  0,  0,  0,  1,  0, 81,  0, 87,330],
    [330,330,330,330,330,330,330,330,330,330,330,330,330]
],
    "canFlyTo": true,
    "canFlyFrom": true,
    "canUseQuickShop": true,
    "images": [],
    "ratio": 1,
    "defaultGround": "ground",
    "bgm": "section1.mp3",
    "firstArrive": [],
    "eachArrive": [],
    "parallelDo": "",
    "events": {
        "5,9": [
            {
                "type": "setValue",
                "name": "flag:3f剧情",
                "value": "1"
            },
            {
                "type": "setBlock",
                "number": "redKing",
                "loc": [
                    [
                        5,
                        7
                    ]
                ],
                "time": 500
            },
            "\t[魔王,redKing]欢迎来到魔塔 你是第100位挑战者 你若能打败我所有的手下 我就与你一对一的决斗 现在你必须接受我的安排",
            {
                "type": "setBlock",
                "number": "womanMagician",
                "loc": [
                    [
                        5,
                        8
                    ]
                ],
                "time": 500,
                "async": true
            },
            {
                "type": "setBlock",
                "number": "womanMagician",
                "loc": [
                    [
                        4,
                        9
                    ]
                ],
                "time": 500,
                "async": true
            },
            {
                "type": "setBlock",
                "number": "womanMagician",
                "loc": [
                    [
                        5,
                        10
                    ]
                ],
                "time": 500,
                "async": true
            },
            {
                "type": "setBlock",
                "number": "womanMagician",
                "loc": [
                    [
                        6,
                        9
                    ]
                ],
                "time": 500,
                "async": true
            },
            "\t[hero]什么？啊！",
            {
                "type": "setCurtain",
                "color": [
                    0,
                    0,
                    0,
                    1
                ],
                "time": 1000,
                "keep": true,
                "async": true
            },
            {
                "type": "sleep",
                "time": 300
            },
            {
                "type": "waitAsync"
            },
            {
                "type": "setValue",
                "name": "status:hp",
                "value": "400"
            },
            {
                "type": "setValue",
                "name": "status:atk",
                "value": "10"
            },
            {
                "type": "setValue",
                "name": "status:def",
                "value": "10"
            },
            {
                "type": "setValue",
                "name": "flag:nowWeapon",
                "value": "null"
            },
            {
                "type": "setValue",
                "name": "flag:nowShield",
                "value": "null"
            },
            {
                "type": "hide",
                "loc": [
                    [
                        5,
                        7
                    ],
                    [
                        5,
                        8
                    ],
                    [
                        4,
                        9
                    ],
                    [
                        6,
                        9
                    ],
                    [
                        5,
                        10
                    ]
                ],
                "remove": true,
                "time": 0
            },
            {
                "type": "sleep",
                "time": 1000
            },
            {
                "type": "changeFloor",
                "floorId": "MT2",
                "loc": [
                    3,
                    8
                ],
                "direction": "down",
                "time": 0
            }
        ],
        "11,4": [
            "\t[老登,man]按X使用怪物手册，预知与当前楼层怪物的对战结果，记得经常使用。",
            {
                "type": "hide",
                "remove": true,
                "time": 200
            }
        ]
    },
    "changeFloor": {
        "1,11": {
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
        10,
        11
    ],
    "downFloor": [
        2,
        11
    ],
    "autoEvent": {},
    "beforeBattle": {},
    "cannotMoveIn": {},
    "bg2map": [],
    "fg2map": []
}