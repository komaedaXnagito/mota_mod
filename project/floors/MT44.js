main.floors.MT44=
{
    "floorId": "MT44",
    "title": "魔塔 第44层",
    "name": "第 44 层",
    "width": 13,
    "height": 13,
    "map": [
    [330,330,330,330,330,330,330,330,330,330,330,330,330],
    [330, 87,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,330],
    [330,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,330],
    [330,  0,  0,  0,  0,  0,  1,  0,  0,  0,  0,  0,330],
    [330,  0,  0,  0,  0,  1,  1,  1,  0,  0,  0,  0,330],
    [330,  0,  0,  0,  1,  1, 31,  1,  1,  0,  0,  0,330],
    [330,  0,  0,  1,  1, 31, 44, 31,  1,  1,  0,  0,330],
    [330,  0,  0,  0,  1,  1, 31,  1,  1,  0,  0,  0,330],
    [330,  0,  0,  0,  0,  1, 85,  1,  0,  0,  0,  0,330],
    [330,  0,  0,  0,  0,223,  0,223,  0,  0,  0,  0,330],
    [330,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,330],
    [330, 88,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,330],
    [330,330,330,330,330,330,330,330,330,330,330,330,330]
],
    "canFlyTo": false,
    "canFlyFrom": false,
    "canUseQuickShop": false,
    "images": [],
    "ratio": 5,
    "defaultGround": "ground",
    "bgm": "section5.mp3",
    "firstArrive": [],
    "eachArrive": [],
    "parallelDo": "",
    "events": {},
    "changeFloor": {
        "1,11": {
            "floorId": ":before",
            "stair": "upFloor"
        },
        "1,1": {
            "floorId": ":next",
            "stair": "downFloor"
        }
    },
    "afterBattle": {
        "5,9": [
            {
                "type": "function",
                "function": "function(){\nvar bool = true;\nvar loc_arr = [\n\t[5, 9],\n\t[7, 9],\n]\nloc_arr.forEach(loc => {\n\tif (core.getBlockCls(loc[0], loc[1]) == \"enemys\") {\n\t\tbool = false;\n\t}\n});\ncore.setFlag(\"open_yes\", bool)\n}"
            },
            {
                "type": "if",
                "condition": "flag:open_yes",
                "true": [
                    {
                        "type": "openDoor",
                        "loc": [
                            6,
                            8
                        ]
                    },
                    {
                        "type": "hide",
                        "time": 0
                    }
                ]
            }
        ],
        "7,9": [
            {
                "type": "function",
                "function": "function(){\nvar bool = true;\nvar loc_arr = [\n\t[5, 9],\n\t[7, 9],\n]\nloc_arr.forEach(loc => {\n\tif (core.getBlockCls(loc[0], loc[1]) == \"enemys\") {\n\t\tbool = false;\n\t}\n});\ncore.setFlag(\"open_yes\", bool)\n}"
            },
            {
                "type": "if",
                "condition": "flag:open_yes",
                "true": [
                    {
                        "type": "openDoor",
                        "loc": [
                            6,
                            8
                        ]
                    },
                    {
                        "type": "hide",
                        "time": 0
                    }
                ]
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
    "autoEvent": {},
    "beforeBattle": {},
    "cannotMoveIn": {},
    "bg2map": [],
    "fg2map": []
}