main.floors.MT29=
{
    "floorId": "MT29",
    "title": "魔塔 第29层",
    "name": "第 29 层",
    "width": 13,
    "height": 13,
    "map": [
    [330,330,330,330,330,330,330,330,330,330,330,330,330],
    [330,  0,  0,  0,  0,  0,  0,  0,  1,  1,  1,  1,330],
    [330,  0,  0,  1,  1,  0,123,  0,  1,  1,  1,  1,330],
    [330,  0,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,330],
    [330,  0,  1,  1,  1,  1,  0,  1,  1,  1,  1,  1,330],
    [330,  0,  1,  1,  1,  1,  0,  1,  1,  1,  1,  1,330],
    [330,  0,  1,  1,  1,  1,  0,  1,  1,  1,  1,  1,330],
    [330,  0,  1,  1,  1,  1,  0,  1,  1,  1,  1,  1,330],
    [330,  0,  1,  1,  1,  1,  0,  1,  1,  1,  1,  1,330],
    [330,  0,  1,  1,  1,  1,  0,  1,  1,  1,  1,  1,330],
    [330,  0,  0,  1,  1,  0,  0,  0,  1,  1,  1,  1,330],
    [330, 88,  0,  1,  1,  0, 87,  0,  1,  1,  1,  1,330],
    [330,330,330,330,330,330,330,330,330,330,330,330,330]
],
    "canFlyTo": true,
    "canFlyFrom": true,
    "canUseQuickShop": true,
    "images": [],
    "ratio": 3,
    "defaultGround": "ground",
    "bgm": "section3.mp3",
    "firstArrive": [],
    "eachArrive": [],
    "parallelDo": "",
    "events": {
        "6,2": [
            {
                "type": "switch",
                "condition": "flags.kaiju",
                "caseList": [
                    {
                        "case": "'剑'",
                        "action": [
                            {
                                "type": "choices",
                                "text": "\t[流浪者,man]你可以转职了",
                                "choices": [
                                    {
                                        "text": "狂战士",
                                        "action": [
                                            {
                                                "type": "setValue",
                                                "name": "item:I560",
                                                "operator": "+=",
                                                "value": "1"
                                            }
                                        ]
                                    },
                                    {
                                        "text": "双剑士",
                                        "action": [
                                            {
                                                "type": "setValue",
                                                "name": "item:I522",
                                                "operator": "+=",
                                                "value": "1"
                                            }
                                        ]
                                    },
                                    {
                                        "text": "盾誓士",
                                        "action": [
                                            {
                                                "type": "setValue",
                                                "name": "item:I568",
                                                "operator": "+=",
                                                "value": "1"
                                            }
                                        ]
                                    },
                                    {
                                        "text": "魔剑士",
                                        "action": [
                                            {
                                                "type": "setValue",
                                                "name": "item:I599",
                                                "operator": "+=",
                                                "value": "1"
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "case": "'杖'",
                        "action": [
                            {
                                "type": "choices",
                                "text": "\t[流浪者,man]你可以转职了",
                                "choices": [
                                    {
                                        "text": "黑猫道士",
                                        "action": [
                                            {
                                                "type": "setValue",
                                                "name": "item:I584",
                                                "operator": "+=",
                                                "value": "1"
                                            }
                                        ]
                                    },
                                    {
                                        "text": "使役者",
                                        "action": [
                                            {
                                                "type": "setValue",
                                                "name": "item:I513",
                                                "operator": "+=",
                                                "value": "1"
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "case": "'琴'",
                        "action": [
                            {
                                "type": "choices",
                                "text": "\t[流浪者,man]你可以转职了",
                                "choices": [
                                    {
                                        "text": "兽王",
                                        "action": [
                                            {
                                                "type": "setValue",
                                                "name": "item:I516",
                                                "operator": "+=",
                                                "value": "1"
                                            }
                                        ]
                                    },
                                    {
                                        "text": "摇滚巨星",
                                        "action": [
                                            {
                                                "type": "setValue",
                                                "name": "item:I539",
                                                "operator": "+=",
                                                "value": "1"
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
            "\t[小偷,thief]你来的正好 我这边暗道完工了 一起走吧",
            {
                "type": "openDoor",
                "loc": [
                    6,
                    3
                ]
            },
            {
                "type": "move",
                "loc": [
                    6,
                    2
                ],
                "time": 200,
                "steps": [
                    "down:9"
                ]
            },
            {
                "type": "show",
                "loc": [
                    [
                        11,
                        11
                    ]
                ],
                "floorId": "MT2",
                "time": 0
            },
            {
                "type": "hide",
                "remove": true
            }
        ]
    },
    "changeFloor": {
        "1,11": {
            "floorId": ":before",
            "stair": "upFloor"
        },
        "6,11": {
            "floorId": ":next",
            "stair": "downFloor"
        }
    },
    "afterBattle": {},
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
    "autoEvent": {},
    "beforeBattle": {},
    "cannotMoveIn": {},
    "bg2map": [],
    "fg2map": []
}