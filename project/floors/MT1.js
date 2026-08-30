main.floors.MT1=
{
    "floorId": "MT1",
    "title": "魔塔 第01层",
    "name": "第 1 层",
    "width": 13,
    "height": 13,
    "map": [
    [330,330,330,330,330,330,330,330,330,330,330,330,330],
    [330, 87,  0,201,202,201,  0,  0,  0,  0,  0,  0,330],
    [330,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  0,330],
    [330, 31,  0,  0, 81,  0,  1,373, 21,  0,  1,  0,330],
    [330,  0,209,  0,  1,  0,  1,373, 31,  0,  1,  0,330],
    [330,  1, 81,  1,  1,  0,  1,  1,  1, 81,  1,  0,330],
    [330, 21,  0,  0,  1,  0, 81,205,217,205,  1,  0,330],
    [330,  0,210,  0,  1,  0,  1,  1,  1,  1,  1,  0,330],
    [330,  1, 81,  1,  1,  0,  0,  0,  0,  0,  0,  0,330],
    [330,  0,  0,  0,  1,  1,447,  1,  1,  1, 81,  1,330],
    [330, 31,  0, 21,131,  0,  0,  0,  1,  0,205,  0,330],
    [330, 31,  0, 21,130,  0,  0,  0,131,201, 32,201,330],
    [330,330,330,330,330,330,330,330,330,330,330,330,330]
],
    "canFlyTo": true,
    "canFlyFrom": true,
    "canUseQuickShop": true,
    "images": [],
    "ratio": 1,
    "defaultGround": "ground",
    "bgm": "section1.mp3",
    "firstArrive": [
        {
            "type": "function",
            "function": "function(){\n// 教程结束后进入正式一楼时重置开局资源、背包和商店进度。\ncore.status.hero.hp = 1000;\ncore.status.hero.money = 0;\n[\"I385\", \"I429\"].forEach(function (itemId) {\n\tvar count = core.itemCount(itemId);\n\tif (count > 0) core.removeItem(itemId, count);\n});\nif (core.plugin && typeof core.plugin.clearBackpackItems === \"function\") {\n\tcore.plugin.clearBackpackItems({ resetUnlockedCells: true });\n} else {\n\tvar backpackState = core.getFlag(\"__backpack_state__\", {}) || {};\n\tvar grid = core.plugin && core.plugin.backpackConfig || { initialCols: 7, initialRows: 6, maxCols: 11, maxRows: 10 };\n\tvar startCol = Math.floor((grid.maxCols - grid.initialCols) / 2);\n\tvar startRow = Math.floor((grid.maxRows - grid.initialRows) / 2);\n\tvar initialCells = [];\n\tfor (var row = startRow; row < startRow + grid.initialRows; row++) {\n\t\tfor (var col = startCol; col < startCol + grid.initialCols; col++) initialCells.push([col, row]);\n\t}\n\tbackpackState.version = 6;\n\tbackpackState.placed = [];\n\tbackpackState.inventory = [];\n\tbackpackState.unlockedCells = initialCells;\n\tcore.setFlag(\"__backpack_state__\", backpackState);\n\tcore.setFlag(\"__backpack_attack__\", { version: 6, totalAttack: 0, placedCount: 0 });\n\tcore.setFlag(\"__backpack_instance_id__\", 0);\n}\nif (core.plugin && typeof core.plugin.resetBackpackShopProgress === \"function\") {\n\tcore.plugin.resetBackpackShopProgress();\n} else {\n\t[\"__backpack_shop_refresh__\", \"__backpack_shop_buy__\", \"__backpack_shop_offer__\"].forEach(function (flagName) {\n\t\tif (typeof core.removeFlag === \"function\") core.removeFlag(flagName);\n\t\telse core.setFlag(flagName, null);\n\t});\n}\ncore.updateStatusBar(true);\n}"
        },
        {
            "type": "function",
            "function": "function(){\n// 怪物生命增加其防御的 2 倍，并通过 enemyInfo 写入存档。\nObject.keys(core.material.enemys).forEach(function (id) {\n\tvar enemy = core.material.enemys[id];\n\t// 四方向怪物共用朝下形态的数据，只修改并保存源怪物，避免同一份 HP 重复累加。\n\tvar canonicalId = enemy && enemy.faceIds && enemy.faceIds.down;\n\tif (canonicalId && canonicalId !== id) return;\n\tvar hp = Number(enemy && enemy.hp);\n\tvar def = Number(enemy && enemy.def);\n\tif (!Number.isFinite(hp) || !Number.isFinite(def) || def <= 0) return;\n\tcore.setEnemy(id, \"hp\", hp + 2 * def, null, null, true);\n});\n}"
        },
        {
            "type": "function",
            "function": "function(){\n// ===== 给 MT1~MT50 的怪物按首次出现楼层随机加能力（全样板 API，写入存档）=====\nvar abilityFields = [\n\t\"burn\", \"ice\", \"darkness\", \"exhaustion\",\n\t\"reflection\", \"block\", \"highSpirit\", \"excitation\", \"regeneration\"\n];\n\n// 1. 样板 API：获取每个楼层的怪物列表，记录首次出现楼层\n//    （getCurrentEnemys 内部会自动加载楼层地图，startText 阶段也能用）\nvar firstSeen = {};\nfor (var fn = 1; fn <= 50; fn++) {\n\tvar list = core.enemys.getCurrentEnemys(\"MT\" + fn);\n\tif (!list || !list.length) continue;\n\tlist.forEach(function (enemy) {\n\t\tif (enemy && enemy.id && core.material.enemys[enemy.id] && !(enemy.id in firstSeen)) {\n\t\t\tfirstSeen[enemy.id] = fn; // 只记第一次\n\t\t}\n\t});\n}\n\n// 2. 按首次楼层定档位，随机能力并写入存档\nObject.keys(firstSeen).forEach(function (id) {\n\tvar fn = firstSeen[id];\n\tif (fn <= 10) return; // MT1-10：不给特殊属性\n\tvar group = Math.floor((fn - 11) / 10); // 0~3（11-20→0、21-30→1、31-40→2、41-50→3）\n\tvar count = group + 1; // 1~4 个\n\n\tvar e = core.material.enemys[id];\n\t// 只挑该怪物还没有的能力\n\tvar pool = abilityFields.filter(function (f) {\n\t\treturn !(core.getEnemyValue(e, f, null, null, \"MT\" + fn) > 0);\n\t});\n\tvar chosen = [];\n\tfor (var i = 0; i < count && pool.length; i++) {\n\t\tchosen.push(pool.splice(core.randBattle(pool.length, {\n\t\t\tsource: \"MT1.monsterAbility.field\",\n\t\t\tenemyId: id,\n\t\t\tfirstSeenFloorId: \"MT\" + fn\n\t\t}), 1)[0]);\n\t}\n\tchosen.forEach(function (field) {\n\t\tvar value = 1 + core.randBattle(3, {\n\t\t\tsource: \"MT1.monsterAbility.value\",\n\t\t\tenemyId: id,\n\t\t\tfield: field,\n\t\t\tfirstSeenFloorId: \"MT\" + fn\n\t\t}); // 数值统一 1~3；使用战斗随机种子保证回放一致\n\t\tcore.setEnemy(id, field, value, null, null, true); // 写入存档 + 内存生效\n\t});\n});\n}"
        },
        {
            "type": "switch",
            "condition": "flags.kaiju",
            "caseList": [
                {
                    "case": "'剑'",
                    "action": [
                        {
                            "type": "function",
                            "function": "function(){\ncore.plugin.addOdds('剑', 1);\n}"
                        }
                    ]
                },
                {
                    "case": "'琴'",
                    "action": [
                        {
                            "type": "function",
                            "function": "function(){\ncore.plugin.addOdds('乐器', 1)\n}"
                        }
                    ]
                },
                {
                    "case": "'杖'",
                    "action": [
                        {
                            "type": "function",
                            "function": "function(){\ncore.plugin.addOdds('杖', 1)\n}"
                        }
                    ]
                }
            ]
        }
    ],
    "eachArrive": [],
    "parallelDo": "",
    "events": {
        "4,10": [
            {
                "type": "function",
                "function": "function(){\ncore.plugin.openBackpackShop()\n}"
            }
        ],
        "4,11": [
            {
                "type": "openShop",
                "id": "shop1",
                "open": true
            }
        ],
        "8,11": [
            {
                "type": "openShop",
                "id": "shop2",
                "open": true
            }
        ],
        "6,9": [
            "\t[艾露达,N447]你来了，看你怪可怜的，给你点施舍吧",
            {
                "type": "setValue",
                "name": "item:I385",
                "operator": "+=",
                "value": "1"
            },
            {
                "type": "setValue",
                "name": "status:money",
                "operator": "+=",
                "value": "300"
            },
            "\t[艾露达,N447]去左边的商店挑选你初始的武器吧，没有获取武器之前，是可以一直免费刷新的哦",
            {
                "type": "hide",
                "remove": true
            }
        ]
    },
    "changeFloor": {
        "1,1": {
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
        2,
        1
    ],
    "downFloor": [
        6,
        11
    ],
    "autoEvent": {},
    "beforeBattle": {},
    "cannotMoveIn": {},
    "bg2map": [],
    "fg2map": []
}
