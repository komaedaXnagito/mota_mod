---
name: "h5-magic-tower"
description: "H5 魔塔游戏开发专家。基于 HTML5 魔塔样板（ckcz123/mota-js）构建经典魔塔 RPG 游戏。当用户提到魔塔、Magic Tower、魔塔游戏、H5魔塔、创建魔塔、做魔塔游戏时调用此 Skill。"
---

# H5 魔塔游戏开发 Skill（基于 HTML5 魔塔样板 v2.9.1）

## 一、样板概述

本 Skill 基于 **HTML5 魔塔样板**（作者：ckcz123/艾之葵，版本 v2.9.1），这是一套完整的 H5 魔塔游戏开发框架，包含游戏引擎和可视化编辑器。

**核心特性：**
- 纯 HTML5 Canvas 渲染，全平台支持（PC/Android/iOS）
- 10 层 Canvas 分层渲染架构
- 数据驱动设计：游戏逻辑与数据完全分离
- 内置可视化编辑器（Blockly 事件编辑 + CodeMirror 代码编辑）
- 模块化核心库（libs/）+ 项目数据（project/）分离
- 插件系统、存档系统、录像回放、天气系统
- 多样化的怪物特殊属性系统和战斗公式

## 二、项目目录结构

```
mota-js/
├── index.html              # 游戏入口
├── editor.html             # 可视化编辑器入口
├── main.js                 # 游戏主入口，加载配置和模块
├── libs/                   # 核心引擎库（不可修改）
│   ├── core.js             # 核心引擎，模块协调中心
│   ├── control.js          # 动画帧循环、事件绑定、天气/录像
│   ├── maps.js             # 地图加载、block 解析、楼层管理
│   ├── ui.js               # Canvas 2D 绘图 API
│   ├── events.js           # 事件系统、游戏流程（win/lose/restart）
│   ├── actions.js          # 用户交互处理（键盘/鼠标/触摸）
│   ├── items.js            # 道具系统（消耗品/装备/工具）
│   ├── enemys.js           # 怪物系统（属性/战斗/特殊属性）
│   ├── icons.js            # 图标映射（图片坐标）
│   ├── loader.js           # 资源加载器（图片/音频/动画）
│   ├── utils.js            # 工具库（clone/decompress/format/random/http）
│   ├── data.js             # 数据初始化（flags/values/firstData）
│   └── extensions.js       # 扩展加载器
├── project/                # 项目数据（用户可编辑）
│   ├── data.js             # 全塔主配置（firstData/values/flags/main）
│   ├── enemys.js           # 怪物数据表
│   ├── items.js            # 道具数据表
│   ├── maps.js             # 图块定义（ID -> 类型/属性映射）
│   ├── events.js           # 公共事件
│   ├── icons.js            # 图标坐标映射
│   ├── functions.js        # 自定义函数（resetGame/win/lose/changingFloor等）
│   ├── plugins.js          # 插件代码
│   ├── floors/             # 楼层数据（每个楼层一个 .js 文件）
│   │   ├── MT0.js          # 示例楼层
│   │   ├── sample0.js      # 样板楼层 0（含完整事件示例）
│   │   ├── sample1.js      # 样板楼层 1
│   │   └── sample2.js      # 样板楼层 2（26x26 大地图）
│   ├── images/             # 自定义图片
│   ├── sounds/             # 音效
│   ├── bgms/               # 背景音乐
│   ├── animates/           # 动画数据
│   ├── autotiles/          # 自动元件
│   ├── tilesets/           # 图块集
│   ├── materials/          # 素材图片
│   └── fonts/              # 字体
├── _server/                # 编辑器支持（Blockly/CodeMirror/编辑器JS）
├── _docs/                  # 使用文档
├── _codelab/               # 魔塔小课堂（编程教程）
├── extensions/             # 扩展工具（不随游戏发布加载）
└── _saves/                 # 存档目录
```

## 三、核心架构

### 3.1 模块关系

```
                    ┌──────────────┐
                    │   main.js    │  ← 入口，加载所有模块
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │   core.js    │  ← 核心枢纽，函数转发
                    └──┬───┬───┬──┘
        ┌──────────────┼───┼───┼──────────────┐
        │              │   │   │              │
   ┌────▼────┐   ┌────▼───▼───▼────┐   ┌─────▼────┐
   │ control │   │   events/actions │   │  loader  │
   │ (动画帧) │   │   (事件/交互)    │   │ (资源加载)│
   └────┬────┘   └────────┬────────┘   └──────────┘
        │                 │
   ┌────▼─────────────────▼────┐
   │  maps / ui / enemys /     │
   │  items / icons / utils    │
   └───────────────────────────┘
```

### 3.2 函数转发机制

`core.js` 通过 `_forwardFuncs()` 将所有模块的公共方法（非 `_` 开头）转发到 `core` 对象上。因此在任何地方都可以通过 `core.xxx()` 调用各模块方法。

```javascript
// 转发示例：libs/maps.js 中的 loadFloor 方法
// 可以通过 core.loadFloor(floorId, map) 直接调用
```

### 3.3 10 层 Canvas 渲染管线

| 层级 | Canvas ID | 用途 |
|------|-----------|------|
| 1 | `bg` | 背景层（地面、墙壁） |
| 2 | `event` | 事件层（门、NPC、宝物） |
| 3 | `hero` | 勇士层 |
| 4 | `event2` | 二次事件层（怪物） |
| 5 | `fg` | 前景层（遮挡物） |
| 6 | `damage` | 伤害数字层 |
| 7 | `animate` | 动画层 |
| 8 | `curtain` | 幕布层（剧情过渡） |
| 9 | `ui` | UI 层（对话、面板） |
| 10 | `data` | 数据交互层（点击检测） |

## 四、核心数据结构

### 4.1 项目主配置（project/data.js）

```javascript
var data_a1e2fb4a... = {
  "main": {
    "floorIds": ["MT0", "MT1", "MT2", ...],   // 楼层 ID 列表
    "images": ["hero.png", "bg.jpg", ...],      // 全塔图片资源
    "tilesets": ["magictower.png", ...],         // 图块集
    "animates": ["hand", "sword", "zone"],       // 动画标识
    "bgms": ["bgm.mp3"],                         // 背景音乐
    "sounds": ["attack.mp3", "door.mp3", ...],   // 音效
    "levelChoose": [{                            // 难度选择
      "title": "简单", "name": "Easy", "hard": 1,
      "color": [64, 255, 85, 1], "action": [...]
    }],
    "equipName": ["武器", "盾牌"],               // 装备孔名称
    "styles": { /* 界面样式 */ },
  },
  "firstData": {
    "title": "游戏标题",
    "name": "模板名",
    "version": "V2.9",
    "floorId": "MT0",          // 初始楼层
    "hero": {                  // 初始角色
      "image": "hero.png", "name": "勇士",
      "lv": 1, "hp": 1000, "atk": 10, "def": 10,
      "mdef": 0, "money": 0, "exp": 0,
      "loc": { "direction": "up", "x": 7, "y": 7 },
      "items": { "constants": {}, "tools": {}, "equips": {} },
      "equipment": [],
    },
    "shops": [{               // 全局商店
      "id": "shop1", "text": "需要购买什么？",
      "choices": [{
        "text": "生命+800",
        "need": "status:money>=20",
        "action": [
          { "type": "setValue", "name": "status:money", "operator": "-=", "value": "20" },
          { "type": "setValue", "name": "status:hp", "operator": "+=", "value": "800" }
        ]
      }]
    }],
    "startText": [            // 开场剧情
      "\t[仙子,fairy]欢迎来到魔塔！",
      "\t[hero]我一定会救出公主！"
    ],
  },
  "values": {
    "redGem": 3, "blueGem": 3,       // 宝石加成值
    "redPotion": 100,                 // 血瓶恢复量
    "breakArmor": 0.9,               // 破甲系数
    "counterAttack": 0.1,            // 反击系数
    "animateSpeed": 300,             // 动画速度
    "moveSpeed": 100,                // 移动速度
    "floorChangeTime": 500,          // 换层动画时间
  },
  "flags": {
    "statusBarItems": [              // 状态栏显示项
      "enableFloor", "enableHP", "enableAtk", "enableDef",
      "enableMDef", "enableMoney", "enableKeys"
    ],
    "autoScale": true,               // 自动缩放
    "enableMoveDirectly": true,      // 允许瞬间移动
  }
};
```

### 4.2 怪物数据（project/enemys.js）

```javascript
var enemys_fcae963b... = {
  "greenSlime": {
    "name": "绿色史莱姆",
    "hp": 50, "atk": 20, "def": 1,
    "money": 1, "exp": 1, "point": 0,
    "special": [],       // 特殊属性数组
    "value": 0,          // 特殊属性数值
  },
  "redSlime": {
    "name": "红头怪",
    "hp": 0, "atk": 0, "def": 0,   // 0 表示需要在楼层中动态设置
    "money": 0, "exp": 0,
    "special": [16, 18],  // 特殊属性：吸血、中毒 等
    "value": 10,
  },
  "dragon": {
    "name": "巨龙",
    "hp": 5000, "atk": 500, "def": 300,
    "money": 200, "exp": 100,
    "bigImage": "dragon_0.png",  // 大型怪物图片（占多格）
  },
  "bearDown": {
    "name": "熊出没",
    "faceIds": {                  // 四方向行走图
      "down": "bearDown", "left": "bearLeft",
      "right": "bearRight", "up": "bearUp"
    },
    "bigImage": "bear.png",
  },
};
```

**怪物特殊属性说明：** `special` 数组中的数字代表不同的特殊能力（如吸血、中毒、诅咒、领域、光环、闪避、暴击、穿刺、冰冻、破甲、反击等），通过 `enemys.js` 的 `getSpecials()` 和 `getSpecialText()` 解析。

### 4.3 道具数据（project/items.js）

```javascript
var items_296f5d02... = {
  "yellowKey": {
    "cls": "tools",          // 类别：tools/items/constants
    "name": "黄钥匙",
    "text": "可以打开一扇黄门",
    "hideInToolbox": true,   // 不在快捷栏显示
  },
  "redGem": {
    "cls": "items",
    "name": "红宝石",
    "text": "攻击+${core.values.redGem}",
    "itemEffect": "core.status.hero.atk += core.values.redGem * core.status.thisMap.ratio",
    "itemEffectTip": "，攻击+${core.values.redGem * core.status.thisMap.ratio}",
  },
  "sword1": {
    "cls": "items",
    "name": "铁剑",
    "text": "一把很普通的铁剑",
    "equip": { "type": 0, "animate": "sword", "value": { "atk": 10 } },
    "itemEffect": "core.status.hero.atk += 10",
  },
  "fly": {
    "cls": "tools",
    "name": "飞行器",
    "text": "可以飞到任意已到达的楼层",
    "useItemEffect": "core.events.fly()",
  },
  "bomb": {
    "cls": "tools",
    "name": "炸弹",
    "text": "炸死面前的怪物",
    "useItemEffect": "core.events.bomb()",
  },
};
```

**道具类别说明：**
- `items`：即捡即用类（捡到就生效，如宝石、药水、剑盾）
- `tools`：永久工具类（放入背包，可多次使用，如钥匙、炸弹、飞行器）
- `constants`：永久道具（最多 1 个，如神圣剑、神圣盾）
- `equips`：装备类（穿在装备孔上，可随时换装）

### 4.4 图块定义（project/maps.js）

图块 ID 是地图的核心数据，每个 ID 对应一个具体的图块类型：

```javascript
var maps_90f36752... = {
  "1": {                                         // 黄墙
    "cls": "animates", "id": "yellowWall",
    "canBreak": true, "animate": 1,
    "doorInfo": { "time": 160, "openSound": "door.mp3", "keys": {} }
  },
  "81": {                                        // 黄门
    "cls": "animates", "id": "yellowDoor",
    "trigger": "openDoor", "animate": 1,
    "doorInfo": { "time": 160, "openSound": "door.mp3", "keys": { "yellowKey": 1 } }
  },
  "21": { "cls": "items", "id": "yellowKey" },   // 黄钥匙
  "27": { "cls": "items", "id": "redGem" },       // 红宝石
  "201": { "cls": "enemys", "id": "greenSlime" }, // 绿色史莱姆
  "121": { "cls": "npcs", "id": "man", "trigger": "pushBox" },  // NPC
  "133": {                                        // 四方向 NPC
    "cls": "npc48", "id": "npc0",
    "faceIds": { "down": "npc0", "left": "npc1", "right": "npc2", "up": "npc3" },
  },
  "87": { "cls": "terrains", "id": "upFloor", "canPass": true },  // 上楼梯
  "300": { "cls": "terrains", "id": "ground" },  // 地面
  "149": {                                        // 自动元件
    "cls": "autotile", "id": "autotile18",
    "cannotOut": [], "cannotIn": []
  },
  "50000": { "cls": "tileset", "id": "X50000", "animate": 4 },  // 图块集
};
```

**图块类别（cls）：**
- `terrains`：地形（地面、楼梯、墙等）
- `animates`：动画门/墙（黄门、蓝门、红门等）
- `items`：道具（钥匙、宝石、血瓶等）
- `enemys` / `enemy48`：32px/48px 怪物
- `npcs` / `npc48`：32px/48px NPC
- `autotile`：自动元件（自动拼接）
- `tileset`：图块集（大图切分）

### 4.5 图标映射（project/icons.js）

定义材质图片中每个图标的坐标位置：

```javascript
var icons_4665ee12... = {
  "hero": {
    "down": { "loc": 0, "stop": 0, "leftFoot": 1, "rightFoot": 3 },
    "left": { "loc": 1, "stop": 0, "leftFoot": 1, "rightFoot": 3 },
    "right": { "loc": 2, "stop": 0, "leftFoot": 1, "rightFoot": 3 },
    "up": { "loc": 3, "stop": 0, "leftFoot": 1, "rightFoot": 3 },
    "width": 32, "height": 48
  },
  "terrains": { "ground": 0, "upFloor": 6, "downFloor": 5, ... },
  "enemys": { "greenSlime": 0, "redSlime": 1, "blackKing": 28, ... },
  "enemy48": { "bearDown": 4, "dragon": 8, ... },
  "npcs": { "fairy": 0, "wizard": 1, "man": 2, ... },
  "items": { "yellowKey": 0, "blueKey": 1, "redGem": 16, "sword1": 50, ... },
  "animates": { "yellowDoor": 0, "blueDoor": 1, "yellowWall": 3, ... },
  "autotile": { "autotile18": 0, ... },
};
```

### 4.6 楼层数据格式（project/floors/xxx.js）

每个楼层文件挂载到 `main.floors` 下：

```javascript
main.floors.MT0 = {
  "floorId": "MT0",            // 楼层唯一 ID
  "title": "主塔 0 层",         // 显示名称
  "name": "0",                  // 简短名称
  "width": 15,                  // 地图宽度（列数）
  "height": 15,                 // 地图高度（行数）
  "canFlyTo": true,             // 是否可以飞到该层
  "canFlyFrom": true,           // 是否可以从该层飞出
  "cannotViewMap": false,       // 是否禁止查看地图
  "defaultGround": "ground",    // 默认地面
  "ratio": 1,                   // 楼层属性系数（1 表示标准，可用于动态调整怪物属性）
  "images": [],                 // 楼层自定义图片
  "weather": ["snow", 6],       // 天气效果（可选）
  "bgm": "bgm.mp3",             // 楼层背景音乐（可选）

  // 主地图：二维数组，每个元素是图块 ID
  "map": [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 21, 0, 0, 81, 0, 0, 27, 0, 0, 0, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1],
    [1, 0, 0, 0, 201, 0, 0, 87, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  ],
  // 前景层：覆盖在勇士和怪物之上的图层
  "fgmap": [],

  // 事件：按 "x,y" 坐标字符串索引
  "events": {
    "3,6": [
      "\t[老人,wizard]欢迎来到魔塔！往前走可以捡到宝石。",
      { "type": "hide", "time": 500 }
    ],
    "7,3": {                              // 对象格式（支持更多选项）
      "trigger": "action",                // 触发器：action/auto/none
      "enable": true,                     // 是否启用
      "noPass": null,                     // 是否不可通行
      "displayDamage": true,              // 是否显示伤害
      "data": [
        "\t[仙子,fairy]你好，勇士！",
        { "type": "hide", "time": 500 }
      ]
    }
  },

  // 首次到达事件
  "firstArrive": [
    "\t[hero]这里就是魔塔的第一层...",
    { "type": "setText", "background": "winskin.png", "time": 0 },
  ],
  // 每次到达事件
  "eachArrive": [],

  // 楼层切换点：楼梯/传送门
  "changeFloor": {
    "7,3": { "floorId": "MT1", "stair": "upFloor" },       // 上楼
    "7,11": { "floorId": "MT0", "stair": "downFloor" },     // 下楼
    "4,13": { "floorId": "MT0", "loc": [7, 2], "direction": "up" },  // 传送到本层某点
    "6,13": { "floorId": "MT2", "loc": [7, 11], "time": 0 },          // 瞬间传送
  },

  // 战后事件
  "afterBattle": {
    "3,7": ["\t[ghostSoldier]不可能，你怎么可能打败我！"]
  },
  // 拾取道具后事件
  "afterGetItem": {
    "10,2": ["你获得了一件特殊道具！"]
  },
  // 开门后事件
  "afterOpenDoor": {
    "12,13": ["你打开了一扇门！"]
  },
  // 战前事件
  "beforeBattle": {},
  // 自动事件
  "autoEvent": {},
  // 不可移动
  "cannotMove": {},
  // 不可进入
  "cannotMoveIn": {},
};
```

### 4.7 自定义函数（project/functions.js）

```javascript
var functions_d6ad677b... = {
  "events": {
    "resetGame": function(hero, hard, floorId, maps, values) { /* 重置游戏 */ },
    "win": function(reason, norank, noexit) { /* 胜利处理 */ },
    "lose": function(reason) { /* 失败处理 */ },
    "changingFloor": function(floorId, heroLoc) { /* 换层中处理 */ },
    "afterChangeFloor": function(floorId) { /* 换层后处理 */ },
    "flyTo": function(toId, callback) { /* 飞行处理 */ },
  },
  "enemys": {
    // 自定义怪物属性计算函数
    "getDamageInfo": function(enemy, hero, x, y, floorId) { /* 计算伤害 */ },
    "getSpecials": function() { /* 获取特殊属性列表 */ },
    "getEnemyInfo": function(enemy, hero, x, y, floorId) { /* 获取怪物完整信息 */ },
  },
  "control": {
    // 自定义按键处理函数
  },
};
```

## 五、核心 API 参考

### 5.1 状态访问（core.status）

```javascript
core.status.hero              // 当前勇士数据
core.status.hero.hp           // 当前生命
core.status.hero.atk          // 当前攻击
core.status.hero.def          // 当前防御
core.status.hero.mdef         // 魔防
core.status.hero.money        // 金币
core.status.hero.exp          // 经验
core.status.hero.loc          // 位置 { x, y, direction }
core.status.hero.items        // 道具 { tools, equips, constants }
core.status.hero.equipment    // 装备列表
core.status.floorId           // 当前楼层 ID
core.status.thisMap           // 当前楼层数据
core.status.maps              // 所有楼层数据
core.status.played            // 是否已开始游戏
core.status.hard              // 当前难度
core.flags                    // 所有游戏开关
core.values                   // 所有游戏数值
```

### 5.2 常用核心方法

```javascript
// 地图操作
core.loadFloor(floorId, map)           // 加载楼层
core.drawMap(floorId)                  // 绘制楼层
core.getBlock(x, y, floorId)           // 获取某点 block
core.getBlockId(x, y, floorId)         // 获取某点 block ID
core.setBlock(number, x, y, floorId)   // 设置某点 block
core.getBlockCls(x, y, floorId)        // 获取某点 block 类别

// 勇士操作
core.moveHero(x, y, time)              // 移动勇士
core.setHeroLoc(x, y, direction)       // 设置勇士位置
core.getHeroLoc()                      // 获取勇士位置

// 事件操作
core.insertAction(actions)             // 插入动作队列
core.doAction()                        // 执行下一个动作
core.trigger(x, y)                     // 触发某点事件
core.changeFloor(floorId, loc)         // 切换楼层

// 道具操作
core.getItemEffect(itemId)             // 获取道具效果
core.getItemEffectTip(itemId)          // 获取道具效果提示
core.addItem(itemId, num)              // 添加道具
core.removeItem(itemId, num)           // 移除道具
core.hasItem(itemId)                   // 检查是否拥有道具
core.itemCount(itemId)                 // 获取道具数量
core.useItem(itemId)                   // 使用道具

// 装备操作
core.loadEquip(equipId, callback)      // 装备
core.unloadEquip(equipType, callback)  // 卸下装备
core.hasEquip(equipId)                 // 是否已装备
core.getEquip(equipType)              // 获取当前装备

// 怪物操作
core.getEnemyInfo(enemy, hero, x, y, floorId)  // 获取怪物信息
core.getDamage(enemy, x, y, floorId)            // 计算伤害
core.canBattle(enemy, x, y, floorId)            // 能否战胜
core.getCurrentEnemys(floorId)                  // 获取楼层怪物列表
core.hasEnemyLeft(enemyId, floorId)             // 怪物是否还存在
core.nextCriticals(enemy, number, x, y, floorId) // 计算临界值

// 标记系统
core.setFlag(name, value)              // 设置标记
core.getFlag(name, defaultValue)       // 获取标记
core.hasFlag(name)                     // 是否有标记
core.removeFlag(name)                  // 移除标记

// UI 操作
core.drawText(texts, callback)         // 显示对话
core.drawTip(text)                     // 显示提示
core.closePanel()                      // 关闭面板
core.clearMap(name)                    // 清除画布
core.fillText(name, text, x, y, style) // 绘制文字
core.fillRect(name, x, y, w, h, style) // 绘制矩形
core.drawImage(name, img, sx, sy, sw, sh, dx, dy, dw, dh) // 绘制图片

// 工具方法
core.clone(data)                       // 深拷贝
core.calValue(value)                   // 计算表达式值
core.replaceText(text)                 // 替换 ${...} 表达式
core.formatBigNumber(x, digits)        // 格式化大数字
core.waitHeroToStop(callback)          // 等待勇士停止
core.lockControl(b)                    // 锁定/解锁控制
core.setStatusBarInnerHTML(name, value, css)  // 设置状态栏

// 存档
core.save(saveIndex)                   // 存档
core.load(saveIndex)                   // 读档
core.autoSave()                        // 自动存档
```

### 5.3 值表达式语法

在事件和配置中可以使用冒号缩写量：

```
status:xxx      → core.status.hero.xxx（如 status:hp, status:atk）
item:xxx        → core.status.hero.items.tools[xxx]（道具数量）
flag:xxx        → core.flags.xxx（自定义标记）
switch:xxx      → core.status.xxx（切换状态）
temp:xxx        → core.temp.xxx（临时变量）
global:xxx      → core.global.xxx（全局变量）
buff:xxx        → core.status.hero.buffs[xxx]（buff 值）
```

## 六、事件系统

### 6.1 事件类型

事件系统中的 `type` 字段支持以下类型：

| type | 说明 | 示例 |
|------|------|------|
| `comment` | 注释 | `{ "type": "comment", "text": "说明文字" }` |
| `setText` | 设置对话框样式 | `{ "type": "setText", "background": "winskin.png", "time": 0 }` |
| `setValue` | 设置数值 | `{ "type": "setValue", "name": "status:hp", "operator": "+=", "value": "800" }` |
| `setBlock` | 设置图块 | `{ "type": "setBlock", "number": "redKing", "loc": [2, 6], "time": 1500 }` |
| `hide` | 隐藏事件 | `{ "type": "hide", "time": 500 }` |
| `sleep` | 等待 | `{ "type": "sleep", "time": 500 }` |
| `openDoor` | 开门 | `{ "type": "openDoor" }` |
| `changeFloor` | 切换楼层 | `{ "type": "changeFloor", "floorId": "MT1", "loc": [7, 7], "direction": "up" }` |
| `battle` | 战斗 | `{ "type": "battle", "id": "greenSlime" }` |
| `choices` | 选项 | `{ "type": "choices", "choices": [{ "text": "选项1", "action": [...] }] }` |
| `if` | 条件判断 | `{ "type": "if", "condition": "flag:xxx==1", "true": [...], "false": [...] }` |
| `while` | 循环 | `{ "type": "while", "condition": "flag:xxx<5", "data": [...] }` |
| `switch` | 多分支 | `{ "type": "switch", "condition": "flag:xxx", "case": { "1": [...], "2": [...] } }` |
| `openShop` | 打开商店 | `{ "type": "openShop", "id": "shop1" }` |
| `animate` | 动画 | `{ "type": "animate", "name": "sword", "x": 7, "y": 7 }` |
| `exit` | 退出事件 | `{ "type": "exit" }` |
| `callLoad` | 调用存档 | `{ "type": "callLoad" }` |

### 6.2 对话文本格式

```javascript
"\t[显示名称,行走图ID]对话内容\n第二行对话"
// 示例：
"\t[仙子,fairy]欢迎来到魔塔！\n这里危机四伏，请小心。"
"\t[hero]我准备好了！"
"\t[老人,wizard]\b[this]这个老人会在原地说话。"  // \b[this] 表示在事件点显示
"\t[redKing]\b[this,2,6]在 (2,6) 处显示对话。"   // \b[this,x,y] 指定坐标
```

### 6.3 触发器类型

- `action`：主动触发（玩家走到该点后按空格/点击）
- `auto`：自动触发（玩家走到该点自动触发）
- `openDoor`：开门触发
- `battle`：战斗触发
- `getItem`：拾取道具触发
- `pushBox`：推箱子触发
- `ski`：滑冰触发
- `none`：不触发

### 6.4 自动事件

```javascript
"autoEvent": {
  "11,6": {
    "0": {
      "condition": "flag:door==2",     // 触发条件
      "currentFloor": true,            // 仅本层生效
      "priority": 0,                   // 优先级
      "delayExecute": false,           // 是否延迟执行
      "multiExecute": false,           // 是否可多次执行
      "data": [
        { "type": "openDoor" }
      ]
    }
  }
}
```

## 七、插件系统

### 7.1 插件编写（project/plugins.js）

```javascript
var plugins_bb40132b... = {
  "myPlugin": function() {
    // 1. 资源加载后执行的初始化
    this._afterLoadResources = function() {
      // 在这里进行图片切分等操作
      // core.splitImage(image, width, height)
    };

    // 2. 复写核心函数
    // 例如：修改怪物伤害计算
    var oldGetDamage = core.getDamage;
    core.getDamage = function(enemy, x, y, floorId) {
      // 自定义逻辑
      return oldGetDamage.call(this, enemy, x, y, floorId);
    };
  },

  "init": function() {
    // 插件初始化（资源加载前执行）
    console.log("插件编写测试");
  },

  "drawLight": function() {
    // 绘制灯光效果
    // core.plugin.drawLight(name, color, lights, lightDec)
  },

  "shop": function() {
    // 全局商店功能
    this.openShop = function(shopId, noRoute) { /* ... */ };
    this.canOpenShop = function(shopId) { /* ... */ };
  },

  "removeMap": function() {
    // 砍层插件（移除某些楼层）
    this.removeMaps = function(fromId, toId) { /* ... */ };
  },

  "fiveLayers": function() {
    // 五图层插件（新增 bg2 和 fg2 图层）
  },

  "multiHeros": function() {
    // 多角色插件
  },

  "heroFourFrames": function() {
    // 勇士四帧动画插件
  },

  "startCanvas": function() {
    // 自定义标题界面插件
  },
};
```

### 7.2 扩展注册函数

```javascript
// 注册自定义交互行为
core.registerAction(action, name, func, priority)
// action: 'onkeyDown'|'onkeyUp'|'pressKey'|'keyDown'|'keyUp'|'ondown'|'onmove'|'onup'|'onmousewheel'|'longClick'

// 注册动画帧回调
core.registerAnimationFrame(name, needPlaying, func)

// 注册天气效果
core.registerWeather(type, initFunc, frameFunc)

// 注册录像动作
core.registerReplayAction(type, func)

// 注册系统事件
core.registerSystemEvent(type, func)

// 注册窗口缩放回调
core.registerResize(type, func)
```

## 八、游戏初始化流程

### 8.1 main.js 加载流程

```
1. 加载第三方库：lz-string, priority-queue, localforage, zip
2. 加载 project/ 下的纯数据文件：
   data.js → enemys.js → icons.js → maps.js → items.js → functions.js → events.js → plugins.js
3. 加载 libs/ 下的核心 JS 文件：
   loader → control → utils → items → icons → maps → enemys → events → actions → data → ui → extensions → core
4. 加载楼层文件（project/floors/*.js）
5. 调用 core.init(coreData, callback) 初始化游戏
6. 调用 main.listen() 绑定输入事件
```

### 8.2 core.init 初始化流程

```
1. _init_flags() → 初始化 flags/values/firstData
2. _init_sys_flags() → 初始化系统标志
3. _init_platform() → 平台检测
4. _init_others() → 初始化辅助 canvas
5. _load(callback) → 加载所有资源（图片/音频/动画）
6. _afterLoadResources() → 后处理（图片裁剪、地图初始化）
7. _init_plugins() → 初始化插件
8. _forwardFuncs() → 转发所有公共方法到 core
9. showStartAnimate() → 显示开始动画
10. 等待用户点击开始
```

## 九、编辑器使用

### 9.1 编辑器页面结构

编辑器通过 `editor.html` 启动，包含三栏布局：

- **左侧数据区**：10 个 Tab 页
  - Z：地图编辑（新建/导出/导入/清除/删除地图）
  - M：追加素材（色相调节、自动注册）
  - X：地图选点（坐标显示、事件配置）
  - C：图块属性（ID、名称、触发器、通行性）
  - V：楼层属性（楼层表格）
  - B：全塔属性（全塔表格）
  - 事件编辑器：Blockly 可视化事件编辑
  - 多行文本编辑器：CodeMirror 代码编辑
  - N：脚本编辑（functions.js）
  - 公共事件：公共事件表格
  - 插件编写：plugins.js 表格
- **中间地图区**：3 层 Canvas（主地图/前景/UI）
- **右侧素材区**：素材图片预览

### 9.2 造塔流程

1. 启动 HTTP 服务（`python -m http.server 8000` 或使用项目自带启动器）
2. 打开 `editor.html` 进入编辑器
3. 编辑全塔属性（B）：设置游戏标题、初始楼层、勇士属性
4. 编辑楼层属性（V）：设置楼层名称、尺寸
5. 绘制地图（Z）：在画布上点击放置图块
6. 编辑怪物属性（data.js/enemys.js 表格）
7. 设置事件（X → 事件编辑器）
8. 验证胜利条件（functions.js 中的 win 函数）
9. 打开 `index.html` 测试游戏

## 十、关键数值与战斗公式

### 10.1 战斗公式

```javascript
// 伤害计算（核心公式）
function getDamage(enemy, x, y, floorId) {
  var hero = core.status.hero;
  var heroAtk = hero.atk;
  var heroDef = hero.def;
  var enemyAtk = enemy.atk;
  var enemyDef = enemy.def;

  // 玩家对怪物伤害
  var playerDamage = Math.max(0, heroAtk - enemyDef);
  // 怪物对玩家伤害
  var enemyDamage = Math.max(0, enemyAtk - heroDef);

  // 回合数（向上取整）
  var rounds = Math.ceil(enemy.hp / playerDamage);
  // 总损失 = (回合数 - 1) * 怪物伤害（怪物先手）
  var totalLoss = (rounds - 1) * enemyDamage;

  return totalLoss;
}
```

### 10.2 楼层系数

`ratio` 字段用于动态缩放楼层怪物属性：

```javascript
// 怪物实际属性 = 基础属性 * 楼层系数
realEnemy.atk = enemy.atk * core.status.thisMap.ratio;
realEnemy.def = enemy.def * core.status.thisMap.ratio;
```

### 10.3 特殊属性

怪物特殊属性（`special` 数组）是通过 `enemys.js` 的函数动态计算的，支持：
- 吸血、中毒、诅咒、衰弱
- 领域、光环、魔防
- 闪避、暴击、穿刺、冰冻
- 破甲、反击、净化
- 仇恨、狙击、激光

## 十一、开发指南

### 11.1 创建新楼层

1. 在 `project/floors/` 下创建新 JS 文件
2. 设置楼层数据挂载到 `main.floors.xxx`
3. 在 `project/data.js` 的 `main.floorIds` 中添加楼层 ID
4. 确保 `project/icons.js` 中注册了所有用到的图块图标
5. 使用编辑器或手动编写地图数组

### 11.2 添加新怪物

1. 在 `project/enemys.js` 中添加怪物数据
2. 在 `project/maps.js` 中添加一个图块 ID 映射到该怪物
3. 在 `project/icons.js` 的 `enemys` 中注册坐标
4. 确保怪物对应的素材图片存在

### 11.3 添加新道具

1. 在 `project/items.js` 中添加道具数据
2. 在 `project/maps.js` 中添加一个图块 ID 映射到该道具
3. 在 `project/icons.js` 的 `items` 中注册坐标
4. 设置 `itemEffect` 和 `itemEffectTip`

### 11.4 设置胜利条件

在 `project/functions.js` 的 `events.win` 函数中定义胜利逻辑：

```javascript
"win": function(reason, norank, noexit) {
  core.ui.closePanel();
  core.waitHeroToStop(function() {
    core.clearMap('all');
    core.deleteAllCanvas();
    core.drawText([
      "\t[" + (reason || "恭喜通关") + "]你的分数是${status:hp}。"
    ], function() {
      core.events.gameOver(reason || '', false, norank);
    })
  });
}
```

### 11.5 调试技巧

打开浏览器控制台（F12），可以执行以下命令：

```javascript
core.status.hero.hp = 99999;    // 修改生命值
core.status.hero.atk = 9999;    // 修改攻击力
core.status.hero.def = 9999;    // 修改防御力
core.status.floorId             // 查看当前楼层
core.flags                      // 查看所有标记
core.values                     // 查看所有数值
core.setFlag("xxx", value)      // 设置标记
core.getFlag("xxx")             // 获取标记
core.debug(func)                // 调试函数
core.clone(data)                // 克隆数据
```

### 11.6 启动本地服务

```bash
# 在项目根目录下启动 HTTP 服务
python -m http.server 8000
# 或使用项目自带启动器
启动服务.exe
```

## 十二、注意事项

1. **不要修改 `libs/` 目录下的文件**，除非你清楚自己在做什么。所有自定义逻辑应写在 `project/` 中。
2. **数据文件命名规则**：`project/` 下的 JS 文件变量名带有哈希后缀（如 `data_a1e2fb4a...`），这是编译器自动生成的，不要手动修改。
3. **编辑器与游戏文件同步**：在编辑器中修改数据后，需要导出才会更新 `project/` 下的文件。
4. **地图 ID 范围**：建议使用统一的 ID 分配规范，避免冲突。常见范围：1-100 门/墙，101-200 NPC，201-300 怪物，21-100 道具。
5. **存档兼容性**：修改 `firstData` 结构后，旧存档可能无法读取。
6. **移动端适配**：通过 `autoScale` flag 控制自动缩放，虚拟方向键会自动显示。
7. **性能注意**：15x15 地图使用 32px 格子，大尺寸地图建议使用 16px 或更小的格子。