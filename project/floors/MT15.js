main.floors.MT15=
{
    "floorId": "MT15",
    "title": "魔塔 第15层",
    "name": "第 15 层",
    "width": 13,
    "height": 13,
    "map": [
    [330,330,330,330,330,330,330,330,330,330,330,330,330],
    [330, 28,214,  0, 81,  0, 87,  0,  1,123,  0,  0,330],
    [330,213,  0,  0,  1,  0,  0,  0,  1,  0,  0,203,330],
    [330,  0,  0,203,  1,  1, 85,  1,  1,  1,  1, 81,330],
    [330, 81,  1,  1,  1,  0,  0,  0,  1,206,  0,  0,330],
    [330,  0,  1, 21,  1,181,182,183,  1,  0,206,  0,330],
    [330,  0,  1, 22,  1,184,185,186,  1, 81,  1,218,330],
    [330,203,  1, 21,  1,187,258,188,  1,  0,  1,  0,330],
    [330,  0,  1,  0,  1,  0,  0,  0,  1,  0,  1, 32,330],
    [330,  0, 81,  0,  1,  1,  0,  1,  1, 81,  1,  1,330],
    [330,206,  1,206,  1,  0,  0,  0,  1,  0,205,  0,330],
    [330,  0,218,  0,  1,  0, 88,  0, 81,205,  0,122,330],
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
        "11,11": [
            {
                "type": "comment",
                "text": "\\d\\c[24]\\i[I361]\\c\r[rgb(244,108,108)](-200G)\\c[24]\\i[T358]\\i[blueKey]\\c\r[rgb(170,170,221)](+1)"
            },
            {
                "type": "if",
                "condition": "switch:A",
                "true": [
                    "\t[商人,woman]如果你拥有十字架，在对战丧尸和吸血鬼的时候攻击力翻倍。没有十字架的时候很难打倒他们，特别是吸血鬼。十字架藏在更高的楼层。",
                    {
                        "type": "hide",
                        "remove": true
                    }
                ],
                "false": [
                    {
                        "type": "choices",
                        "text": "\t[商人,woman]我200金币卖1把蓝钥匙，你买吗？",
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
                                        "name": "item:blueKey",
                                        "operator": "+=",
                                        "value": "1"
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
        "9,1": [
            "\t[小偷,thief]阿哈 你还好吗 这大章鱼挡住了我前进的道路 现在暗道终于完工了 你现在最好也躲开它 我要走了 再见",
            {
                "type": "openDoor",
                "loc": [
                    8,
                    1
                ]
            },
            {
                "type": "move",
                "time": 200,
                "steps": [
                    "left:2"
                ]
            },
            {
                "type": "hide",
                "remove": true
            }
        ],
        "6,8": [
            {
                "type": "closeDoor",
                "id": "specialDoor",
                "loc": [
                    6,
                    9
                ]
            },
            {
                "type": "hide",
                "remove": true
            }
        ]
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
        "6,7": [
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
                ],
                "async": true
            },
            {
                "type": "setBlock",
                "number": "0",
                "loc": [
                    [
                        5,
                        7
                    ],
                    [
                        5,
                        6
                    ],
                    [
                        6,
                        6
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
                        7,
                        5
                    ],
                    [
                        6,
                        5
                    ],
                    [
                        5,
                        5
                    ]
                ]
            },
            {
                "type": "setBlock",
                "number": "pickaxe",
                "loc": [
                    [
                        6,
                        4
                    ]
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
        6,
        2
    ],
    "downFloor": [
        6,
        10
    ],
    "autoEvent": {},
    "beforeBattle": {},
    "cannotMoveIn": {},
    "bg2map": [],
    "fg2map": []
}