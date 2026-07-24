main.floors.MT41=
{
    "floorId": "MT41",
    "title": "魔塔 第41层",
    "name": "第 41 层",
    "width": 13,
    "height": 13,
    "map": [
    [  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1],
    [  1, 31,  1,  0, 22,  1, 88,  1, 22,  0,  1, 31,  1],
    [  1, 81,220,  0,  0,  1,  0,  1,  0,  0,220, 81,  1],
    [  1, 81,  1,  0,  1,  1,  0,  1,  1,  0,  1, 81,  1],
    [  1, 81,  1, 81,  1,246,  0,246,  1, 81,  1, 81,  1],
    [  1,  0,  0,219,  1,  1,  0,  1,  1,219,  0,  0,  1],
    [  1,207,  0,  0,  0, 82,  0, 82,  0,  0,  0,207,  1],
    [  1,  0,207,  0,204,  1, 81,  1,204,  0,207,  0,  1],
    [  1, 81,  1,  1, 81,  1, 81,  1, 81,  1,  1, 81,  1],
    [  1, 81,  1, 31,  0,  1, 81,  1,  0, 31,  1, 81,  1],
    [  1, 81,  1, 21, 21,  1,  0,  1, 21, 21,  1, 81,  1],
    [  1, 32,  1, 21, 27,  1, 87,  1, 28, 21,  1, 32,  1],
    [  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1]
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
    "events": {},
    "changeFloor": {
        "6,11": {
            "floorId": ":next",
            "stair": "downFloor",
            "time": 0
        },
        "6,1": {
            "floorId": ":before",
            "stair": "upFloor",
            "time": 0
        }
    },
    "afterBattle": {
        "2,2": [],
        "10,2": []
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
    "autoEvent": {
        "6,5": {
            "0": {
                "condition": "core.getBlockCls(2,2) !== 'enemys' && core.getBlockCls(10,2) !== 'enemys' ",
                "currentFloor": true,
                "priority": 0,
                "delayExecute": false,
                "multiExecute": false,
                "data": [
                    {
                        "type": "sleep",
                        "time": 200
                    },
                    {
                        "type": "playSound",
                        "name": "开关门"
                    },
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
                        "type": "setBlock",
                        "number": "yellowWall",
                        "loc": [
                            [
                                5,
                                6
                            ]
                        ]
                    },
                    {
                        "type": "setBlock",
                        "number": "yellowWall",
                        "loc": [
                            [
                                6,
                                6
                            ]
                        ]
                    },
                    {
                        "type": "setBlock",
                        "number": "yellowWall",
                        "loc": [
                            [
                                7,
                                6
                            ]
                        ]
                    },
                    {
                        "type": "hide",
                        "loc": [
                            [
                                5,
                                7
                            ],
                            [
                                7,
                                7
                            ]
                        ],
                        "remove": true
                    },
                    {
                        "type": "waitAsync"
                    },
                    {
                        "type": "setBlock",
                        "number": "downFly",
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
                    }
                ]
            }
        }
    },
    "beforeBattle": {},
    "cannotMoveIn": {}
}