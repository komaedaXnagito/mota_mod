main.floors.MT25=
{
    "floorId": "MT25",
    "title": "魔塔 第25层",
    "name": "第 25 层",
    "width": 13,
    "height": 13,
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
        "6,9": [
            "\t[大法师,blackMagician]杀死入侵者",
            {
                "type": "playBgm",
                "name": "boss3.mp3"
            },
            {
                "type": "hide",
                "remove": true,
                "time": 0
            }
        ],
        "1,1": {
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
                "\t[魔王,redKing]我出现在这里，只是为了让你提前看最终boss的属性。"
            ]
        }
    },
    "changeFloor": {
        "2,10": {
            "floorId": ":before",
            "stair": "upFloor"
        },
        "1,11": {
            "floorId": ":next",
            "stair": "downFloor"
        }
    },
    "afterBattle": {
        "6,6": [
            {
                "type": "setBlock",
                "number": "23",
                "loc": [
                    [
                        4,
                        8
                    ]
                ]
            },
            {
                "type": "setBlock",
                "number": "23",
                "loc": [
                    [
                        5,
                        8
                    ]
                ]
            },
            {
                "type": "setBlock",
                "number": "23",
                "loc": [
                    [
                        7,
                        8
                    ]
                ]
            },
            {
                "type": "setBlock",
                "number": "23",
                "loc": [
                    [
                        8,
                        8
                    ]
                ]
            },
            {
                "type": "hide",
                "loc": [
                    [
                        6,
                        9
                    ]
                ],
                "time": 0
            }
        ]
    },
    "afterGetItem": {},
    "afterOpenDoor": {},
    "cannotMove": {},
    "map": [
    [330,330,330,330,330,330,330,330,330,330,330,330,330],
    [330,249,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,330],
    [330,  0,  0,  0,  1,  1,  1,  1,  1,  0,  0,  0,330],
    [330,  0,  0,  1,  1,  0,  0,  0,  1,  1,  0,  0,330],
    [330,  0,  1,  1,  0,  0,  0,  0,  0,  1,  1,  0,330],
    [330,  0,  1,  0,  0,  1,  0,  1,  0,  0,  1,  0,330],
    [330,  0,  1,  0,  0,  0,247,  0,  0,  0,  1,  0,330],
    [330,  0,  1,  0,  0,  1,  0,  1,  0,  0,  1,  0,330],
    [330,  0,  1,  1,  0,  0,  0,  0,  0,  1,  1,  0,330],
    [330,  0,  0,  1,  1,  0,  0,  0,  1,  1,  0,  0,330],
    [330,  0, 88,  0,  1,  1, 83,  1,  1,  0,  0,  0,330],
    [330, 87,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,330],
    [330,330,330,330,330,330,330,330,330,330,330,330,330]
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
    "fgmap": [

],
    "upFloor": [
        2,
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