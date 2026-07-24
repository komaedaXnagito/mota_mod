main.floors.MT10=
{
    "floorId": "MT10",
    "title": "魔塔 第10层",
    "name": "第 10 层",
    "width": 13,
    "height": 13,
    "map": [
    [  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1],
    [  1,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  1],
    [  1,  1,  1,  1,  1,  0,  0,  0,  1,  1,  1,  1,  1],
    [  1,209,209,209,  1,  1,  0,  1,  1,209,209,209,  1],
    [  1,  0,210,  0, 85,  0,211,  0, 85,  0,210,  0,  1],
    [  1,  1,  1,  1,  1,  0,  0,  0,  1,  1,  1,  1,  1],
    [  1,209, 28,209,  1,  1,  0,  1,  1,209, 27,209,  1],
    [  1,  0,210,  0,  1,  1,  0,  1,  1,  0,210,  0,  1],
    [  1,  0,  0,  0,  1,  1,  0,  1,  1,  0,  0,  0,  1],
    [  1, 81,  1, 81,  1,  1, 83,  1,  1, 81,  1, 81,  1],
    [  1,  0,  1,  0,  1,  0,  0,  0,  1,  0,  1,  0,  1],
    [  1, 88,  1,  0,217,  0, 87,  0,217,  0,  1, 32,  1],
    [  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1]
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
        "6,11": {
            "trigger": null,
            "enable": false,
            "noPass": null,
            "displayDamage": true,
            "data": []
        },
        "6,5": [
            {
                "type": "playBgm",
                "name": "SkeletonA.mp3"
            },
            {
                "type": "closeDoor",
                "id": "specialDoor",
                "loc": [
                    6,
                    7
                ],
                "async": true
            },
            {
                "type": "openDoor",
                "loc": [
                    4,
                    4
                ],
                "async": true
            },
            {
                "type": "openDoor",
                "loc": [
                    8,
                    4
                ],
                "async": true
            },
            {
                "type": "setBlock",
                "number": "0",
                "loc": [
                    [
                        5,
                        6
                    ]
                ]
            },
            {
                "type": "setBlock",
                "number": "0",
                "loc": [
                    [
                        7,
                        6
                    ]
                ]
            },
            {
                "type": "waitAsync"
            },
            "\t[骷髅队长,skeletonCaptain]哈哈哈 你是如此的幸运能安全到达这里 但现在好运离你而去了 你中埋伏了 弟兄们给我上",
            {
                "type": "move",
                "loc": [
                    6,
                    4
                ],
                "time": 1,
                "keep": true,
                "async": true,
                "steps": [
                    "up:3"
                ]
            },
            {
                "type": "move",
                "loc": [
                    2,
                    4
                ],
                "time": 1,
                "keep": true,
                "async": true,
                "steps": [
                    "right:3",
                    "down:2",
                    "right:1"
                ]
            },
            {
                "type": "move",
                "loc": [
                    10,
                    4
                ],
                "time": 1,
                "keep": true,
                "async": true,
                "steps": [
                    "left:4"
                ]
            },
            {
                "type": "move",
                "loc": [
                    3,
                    3
                ],
                "time": 1,
                "keep": true,
                "async": true,
                "steps": [
                    "down:1",
                    "right:2",
                    "down:2"
                ]
            },
            {
                "type": "move",
                "loc": [
                    9,
                    3
                ],
                "time": 1,
                "keep": true,
                "async": true,
                "steps": [
                    "down:1",
                    "left:2",
                    "down:2"
                ]
            },
            {
                "type": "move",
                "loc": [
                    2,
                    3
                ],
                "time": 1,
                "keep": true,
                "async": true,
                "steps": [
                    "down:1",
                    "right:3",
                    "down:1"
                ]
            },
            {
                "type": "move",
                "loc": [
                    10,
                    3
                ],
                "time": 1,
                "keep": true,
                "async": true,
                "steps": [
                    "down:1",
                    "left:3",
                    "down:1"
                ]
            },
            {
                "type": "move",
                "loc": [
                    1,
                    3
                ],
                "time": 1,
                "keep": true,
                "async": true,
                "steps": [
                    "down:1",
                    "right:4"
                ]
            },
            {
                "type": "move",
                "loc": [
                    11,
                    3
                ],
                "time": 1,
                "keep": true,
                "async": true,
                "steps": [
                    "down:1",
                    "left:4"
                ]
            },
            {
                "type": "waitAsync"
            },
            {
                "type": "closeDoor",
                "id": "specialDoor",
                "loc": [
                    4,
                    4
                ],
                "async": true
            },
            {
                "type": "closeDoor",
                "id": "specialDoor",
                "loc": [
                    6,
                    3
                ],
                "async": true
            },
            {
                "type": "closeDoor",
                "id": "specialDoor",
                "loc": [
                    8,
                    4
                ],
                "async": true
            },
            {
                "type": "waitAsync"
            },
            {
                "type": "setValue",
                "name": "switch:A",
                "value": "true"
            },
            {
                "type": "setValue",
                "name": "flag:10f机关",
                "value": "true"
            },
            {
                "type": "hide",
                "remove": true
            }
        ],
        "6,2": [
            "\t[骷髅队长,skeletonCaptain]你怎能杀出重围 我是绝不会让你通过的 来吧 我要与你决斗",
            {
                "type": "hide",
                "remove": true,
                "time": 0
            }
        ]
    },
    "changeFloor": {
        "6,11": {
            "floorId": ":next",
            "stair": "downFloor",
            "time": 0
        },
        "1,11": {
            "floorId": ":before",
            "stair": "upFloor",
            "time": 0
        }
    },
    "afterBattle": {
        "6,1": [
            "\t[骷髅队长,skeletonCaptain]不 这是不可能的 你怎会打败我 你别太得意 后面还有许多强大的对手和机关存在 你稍有疏忽就必死无疑",
            {
                "type": "playSound",
                "name": "开关门",
                "stop": true
            },
            {
                "type": "setBlock",
                "number": "27",
                "loc": [
                    [
                        1,
                        3
                    ]
                ]
            },
            {
                "type": "setBlock",
                "number": "27",
                "loc": [
                    [
                        2,
                        3
                    ]
                ]
            },
            {
                "type": "setBlock",
                "number": "27",
                "loc": [
                    [
                        3,
                        3
                    ]
                ]
            },
            {
                "type": "setBlock",
                "number": "28",
                "loc": [
                    [
                        9,
                        3
                    ]
                ]
            },
            {
                "type": "setBlock",
                "number": "28",
                "loc": [
                    [
                        10,
                        3
                    ]
                ]
            },
            {
                "type": "setBlock",
                "number": "28",
                "loc": [
                    [
                        11,
                        3
                    ]
                ]
            },
            {
                "type": "setBlock",
                "number": "32",
                "loc": [
                    [
                        1,
                        4
                    ]
                ]
            },
            {
                "type": "setBlock",
                "number": "32",
                "loc": [
                    [
                        2,
                        4
                    ]
                ]
            },
            {
                "type": "setBlock",
                "number": "32",
                "loc": [
                    [
                        3,
                        4
                    ]
                ]
            },
            {
                "type": "setBlock",
                "number": "21",
                "loc": [
                    [
                        9,
                        4
                    ]
                ]
            },
            {
                "type": "setBlock",
                "number": "21",
                "loc": [
                    [
                        10,
                        4
                    ]
                ]
            },
            {
                "type": "setBlock",
                "number": "21",
                "loc": [
                    [
                        11,
                        4
                    ]
                ]
            },
            {
                "type": "setBlock",
                "number": "0",
                "loc": [
                    [
                        6,
                        9
                    ]
                ]
            },
            {
                "type": "show",
                "loc": [
                    [
                        6,
                        9
                    ]
                ]
            },
            {
                "type": "show",
                "loc": [
                    [
                        6,
                        11
                    ]
                ]
            },
            {
                "type": "hide",
                "loc": [
                    [
                        6,
                        2
                    ]
                ],
                "remove": true
            },
            {
                "type": "hide",
                "loc": [
                    [
                        6,
                        5
                    ]
                ],
                "remove": true
            },
            {
                "type": "openDoor",
                "loc": [
                    4,
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
                "type": "openDoor",
                "loc": [
                    8,
                    4
                ],
                "async": true
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
    "upFloor": [
        6,
        10
    ],
    "downFloor": [
        1,
        10
    ],
    "autoEvent": {
        "6,3": {
            "0": {
                "condition": "flag:10f机关 && core.getBlockId(5,4) === null && core.getBlockId(6,4) === null && core.getBlockId(7,4) === null && core.getBlockId(5,5) === null && core.getBlockId(7,5) === null && core.getBlockId(5,6) === null && core.getBlockId(6,6) === null && core.getBlockId(7,6) === null",
                "currentFloor": true,
                "priority": 0,
                "delayExecute": false,
                "multiExecute": false,
                "data": [
                    {
                        "type": "openDoor"
                    },
                    {
                        "type": "setValue",
                        "name": "flag:door_MT10_6_3",
                        "value": "null"
                    }
                ]
            },
            "1": null
        }
    },
    "beforeBattle": {},
    "cannotMoveIn": {}
}