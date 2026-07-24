main.floors.MT50=
{
    "floorId": "MT50",
    "title": "魔塔 第50层",
    "name": "第 50 层",
    "width": 13,
    "height": 13,
    "map": [
    [  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  4],
    [  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  4],
    [  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  4],
    [  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  4],
    [  4,  4,  4,  4,  1,  1,  1,  1,  1,  4,  4,  4,  4],
    [  4,  4,  4,  4,  1,  0,123,  0,  1,  4,  4,  4,  4],
    [  4,  4,  4,  4,  1,  0,  0,  0,  1,  4,  4,  4,  4],
    [  4,  4,  4,  4,  1,  0,  0,  0,  1,  4,  4,  4,  4],
    [  4,  4,  4,  4,  1,  1,  1,  1,  1,  4,  4,  4,  4],
    [  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  4],
    [  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  4],
    [  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  4],
    [  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  4]
],
    "canFlyTo": false,
    "canFlyFrom": false,
    "canUseQuickShop": true,
    "images": [],
    "ratio": 5,
    "defaultGround": "ground",
    "bgm": null,
    "firstArrive": [],
    "eachArrive": [],
    "parallelDo": "",
    "events": {
        "6,5": [
            {
                "type": "playBgm",
                "name": "LastFight.mp3"
            },
            {
                "type": "hide",
                "time": 500
            },
            {
                "type": "setBlock",
                "number": "yellowKing"
            },
            {
                "type": "show",
                "time": 500
            },
            "\t[hero]勇者问：“啊！你就是魔王！你怎么还活着？”",
            "\t[yellowKing]魔王回答：“我是不会死的。以前我只是对你的能力做测试而已。”",
            "\t[hero]勇者问：“什么？你这是什么意思？你为什么要做这样的事情？”",
            "\t[yellowKing]魔王回答：“神圣剑 就是你装备的武器，智慧权杖 我所装备的武器。先知说过无论谁使用它们都必需要有足够的智慧，且剑只能被真正的战士使用。”",
            "\t[hero]勇者问：“如你所说我就是那个战士”",
            "\t[yellowKing]魔王回答：“是的，你是最合适的人选。但你刚到魔塔时，你的能力还不足以支配神圣剑。因此我在塔内安排了各类机关，让你通过战斗直到可以控制神圣剑。”",
            "\t[hero]勇者问：“很好，那么外面传说有一个公主被困在魔塔，就是为了把我骗到这里。是这样的吗？”",
            "\t[yellowKing]魔王回答：“是的。现在如果我们能够合作那么这场闹剧就结束了。现在让我们一起用权杖破坏神圣剑，这样伟大的时代就要降临了。”",
            {
                "type": "setValue",
                "name": "flag:与50层小偷对话",
                "value": "true"
            }
        ]
    },
    "changeFloor": {},
    "afterBattle": {
        "6,5": [
            {
                "type": "switch",
                "condition": "flag:难度",
                "caseList": [
                    {
                        "case": "1",
                        "action": []
                    },
                    {
                        "case": "2",
                        "action": []
                    }
                ]
            },
            {
                "type": "switch",
                "condition": "flag:模式",
                "caseList": [
                    {
                        "case": "1",
                        "action": []
                    },
                    {
                        "case": "2",
                        "action": []
                    }
                ]
            },
            {
                "type": "while",
                "condition": "true",
                "data": [
                    {
                        "type": "choices",
                        "text": "\t[king]选择要提交的榜单！",
                        "choices": [
                            {
                                "text": "生命值",
                                "action": [
                                    {
                                        "type": "setValue",
                                        "name": "flag:rankType",
                                        "value": "\"生命\""
                                    },
                                    {
                                        "type": "break",
                                        "n": 1
                                    }
                                ]
                            },
                            {
                                "text": "攻击值（最高）",
                                "action": [
                                    {
                                        "type": "setValue",
                                        "name": "flag:rankType",
                                        "value": "\"最高攻击\""
                                    },
                                    {
                                        "type": "setValue",
                                        "name": "status:hp",
                                        "value": "status:atk",
                                        "norefresh": true
                                    },
                                    {
                                        "type": "break",
                                        "n": 1
                                    }
                                ]
                            },
                            {
                                "text": "防御值（最高）",
                                "action": [
                                    {
                                        "type": "setValue",
                                        "name": "flag:rankType",
                                        "value": "\"最高防御\""
                                    },
                                    {
                                        "type": "setValue",
                                        "name": "status:hp",
                                        "value": "status:def",
                                        "norefresh": true
                                    },
                                    {
                                        "type": "break",
                                        "n": 1
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                "type": "win",
                "reason": "${flag:versionType}-${flag:endingType}（${flag:rankType}）"
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
    "autoEvent": {},
    "beforeBattle": {},
    "cannotMoveIn": {}
}