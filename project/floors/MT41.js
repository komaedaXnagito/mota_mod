main.floors.MT41=
{
    "floorId": "MT41",
    "title": "魔塔 第41层",
    "name": "第 41 层",
    "width": 13,
    "height": 13,
    "map": [
    [330,330,330,330,330,330,330,330,330,330,330,330,330],
    [330, 31,  1,  0, 22,  1, 88,  1, 22,  0,  1, 31,330],
    [330, 81,220,  0,  0,  1,  0,  1,  0,  0,  1, 81,330],
    [330, 81,  1,  0,  1,  1,  0,  1,  1,  0,  1, 81,330],
    [330, 81,  1, 81,  1,246,  0,246,  1, 81,  1, 81,330],
    [330,  0,  0,219,  1,  1,  0,  1,  1,219,  0,  0,330],
    [330,207,  0,  0,  0, 82,  0, 82,  0,  0,  0,207,330],
    [330,  0,207,  0,204,  1, 81,  1,204,  0,207,  0,330],
    [330, 81,  1,  1, 81,  1, 81,  1, 81,  1,  1, 81,330],
    [330, 81,  1, 31,  0,  1, 81,  1,  0, 31,  1, 81,330],
    [330, 81,  1, 21, 21,  1,  0,  1, 21, 21,  1, 81,330],
    [330, 32,  1, 21, 27,  1, 87,  1, 28, 21,  1, 32,330],
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
        "10,2": [
            {
                "type": "if",
                "condition": "(flag:41层机关===1)",
                "true": [
                    {
                        "type": "sleep",
                        "time": 200
                    },
                    {
                        "type": "setBlock",
                        "number": "220"
                    },
                    {
                        "type": "sleep",
                        "time": 200
                    }
                ]
            }
        ]
    },
    "changeFloor": {
        "6,1": {
            "floorId": ":before",
            "stair": "upFloor"
        },
        "6,11": {
            "floorId": ":next",
            "stair": "downFloor"
        }
    },
    "afterBattle": {
        "2,2": [
            {
                "type": "setValue",
                "name": "flag:41层机关",
                "value": "1"
            }
        ],
        "10,2": [
            {
                "type": "setBlock",
                "number": "none",
                "loc": [
                    [
                        5,
                        6
                    ]
                ]
            },
            {
                "type": "setBlock",
                "number": "none",
                "loc": [
                    [
                        7,
                        6
                    ]
                ]
            },
            {
                "type": "closeDoor",
                "id": "yellowWall",
                "loc": [
                    5,
                    6
                ],
                "async": true
            },
            {
                "type": "closeDoor",
                "id": "yellowWall",
                "loc": [
                    6,
                    6
                ],
                "async": true
            },
            {
                "type": "closeDoor",
                "id": "yellowWall",
                "loc": [
                    7,
                    6
                ],
                "async": true
            },
            {
                "type": "openDoor",
                "loc": [
                    5,
                    7
                ],
                "async": true
            },
            {
                "type": "openDoor",
                "loc": [
                    7,
                    7
                ],
                "async": true
            },
            {
                "type": "waitAsync"
            },
            {
                "type": "setBlock",
                "number": "52",
                "loc": [
                    [
                        6,
                        5
                    ]
                ]
            },
            {
                "type": "tip",
                "text": "降临之翼出现了"
            },
            {
                "type": "hide",
                "remove": true,
                "time": 0
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
        6,
        2
    ],
    "autoEvent": {},
    "beforeBattle": {},
    "cannotMoveIn": {},
    "bg2map": [],
    "fg2map": []
}