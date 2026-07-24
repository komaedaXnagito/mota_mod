main.floors.MT12=
{
    "floorId": "MT12",
    "title": "魔塔 第12层",
    "name": "第 12 层",
    "width": 13,
    "height": 13,
    "map": [
    [330,330,330,330,330,330,330,330,330,330,330,330,330],
    [330,122,  3,  0,  1, 21, 27, 21,  1,  0,  3,320,330],
    [330,  1,  1,206,  1,  0,  1,  0,  1,  0,  1,  1,330],
    [330,  0,  0,  0,  1,218,  0,218,  1,  0,213,  0,330],
    [330, 81,  1,  1,  1,  1, 81,  1,  1,  1,  1,  0,330],
    [330,  0,218,  0, 81,  0,213,  0,  1, 31,  0,206,330],
    [330,  1,  1,  1,  1,  0,  0,218, 81,  0, 28,  0,330],
    [330, 21, 21,  0,  1,  0, 32,  0,  1, 21,  0,203,330],
    [330, 21, 22,  0,  1,  1,  1,  1,  1, 82,  1, 81,330],
    [330,  0,  0,213,  1,  7,131,  8,  1,203,  0,213,330],
    [330,  1,  1, 81,  1, 31,  0, 31,  1,  1,  0,  1,330],
    [330, 87,  0,  0,205,  0,  0,  0,205,  0,  0, 88,330],
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
        "1,1": [
            {
                "type": "comment",
                "text": "\\d\\c[24]\\i[I361]\\c\r[rgb(244,108,108)](-800G)\\c[24]\\i[T358]\\i[redKey]\\c\r[rgb(244,108,108](+1)"
            },
            {
                "type": "if",
                "condition": "switch:A",
                "true": [
                    "\t[商人,woman]你注意到9、16、18层的暗道了吗？",
                    {
                        "type": "hide",
                        "remove": true
                    }
                ],
                "false": [
                    {
                        "type": "choices",
                        "text": "\t[商人,woman]我800金币卖1把珍稀的红钥匙，你买吗？",
                        "choices": [
                            {
                                "text": "我太需要了",
                                "need": "status:money>=800",
                                "action": [
                                    {
                                        "type": "setValue",
                                        "name": "status:money",
                                        "operator": "-=",
                                        "value": "800"
                                    },
                                    {
                                        "type": "setValue",
                                        "name": "item:redKey",
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
        "6,9": [
            {
                "type": "openShop",
                "id": "shop2",
                "open": true
            }
        ],
        "11,1": {
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
                    "type": "comment",
                    "text": "\\d\\c[24]\\i[I361]\\c\r[rgb(244,108,108)](-1000G)\\c[24]\\i[T358]\\i[yellowKey]\\c\r[rgb(224,210,69)](+1)"
                },
                {
                    "type": "setBlock",
                    "number": "woman"
                },
                {
                    "type": "choices",
                    "text": "\t[商人,trader]无限量出售黄钥匙，1000金币一把，你买吗？",
                    "choices": [
                        {
                            "text": "是",
                            "action": [
                                {
                                    "type": "if",
                                    "condition": "(status:money>=1000)",
                                    "true": [
                                        {
                                            "type": "setValue",
                                            "name": "status:money",
                                            "operator": "-=",
                                            "value": "1000"
                                        },
                                        {
                                            "type": "setValue",
                                            "name": "item:yellowKey",
                                            "operator": "+=",
                                            "value": "1"
                                        },
                                        {
                                            "type": "playSound",
                                            "name": "确定"
                                        },
                                        "\t[商人,trader]感谢惠顾。"
                                    ],
                                    "false": [
                                        {
                                            "type": "playSound",
                                            "name": "操作失败"
                                        },
                                        "\t[商人,trader]你的金币不足！"
                                    ]
                                }
                            ]
                        },
                        {
                            "text": "否",
                            "action": []
                        }
                    ]
                }
            ]
        }
    },
    "changeFloor": {
        "11,11": {
            "floorId": ":before",
            "stair": "upFloor"
        },
        "1,11": {
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
        2,
        11
    ],
    "downFloor": [
        10,
        11
    ],
    "autoEvent": {},
    "beforeBattle": {},
    "cannotMoveIn": {
        "10,1": [],
        "11,2": [
            "up",
            "down",
            "left",
            "right"
        ]
    },
    "bg2map": [],
    "fg2map": []
}