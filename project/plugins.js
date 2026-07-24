var plugins_bb40132b_638b_4a9f_b028_d3fe47acc8d1 = 
{
    "init": function () {
	this._afterLoadResources = function () {
		// 本函数将在所有资源加载完毕后，游戏开启前被执行
		core.ui.statusBar.init();
		core.registerEvent("setanimate", function (data) {
			data.px = data.px ?? 0;
			data.py = data.py ?? 0;
			core.setanimate(
				data.name,
				data.px,
				data.py,
				data.width,
				data.height,
				data.allFarme,
				data.imageList,
				data.soundList
			);
			core.doAction();
		});
		core.registerEvent("animatemove", function (data) {
			core.animatemove(data.id, data.px, data.py, data.relative, data.time, data.style);

			core.doAction();
		});
		core.registerEvent("moveAnimate", function (data) {
			core.maps.moveAnimate(data.id, data.px, data.py, data.relative, data.time, data.style);

			core.doAction();
		});

		core.registerEvent("animateloop", function (data) {
			core.animateloop(data.id, data.loop);

			core.doAction();
		});
		core.registerEvent("animatereverse", function (data) {
			core.animatereverse(data.id, data.reverse);

			core.doAction();
		});
		core.registerEvent("animatepause", function (data) {
			core.animatepause(data.id, data.pause);

			core.doAction();
		});
		core.registerEvent("clearanimate", function (data) {
			core.animateclear(data.id);

			core.doAction();
		});
		core.registerEvent("deleteanimate", function (data) {
			core.deleteanimate(data.name);
			core.doAction();
		});
		core.registerEvent("animateResize", function (data, x, y, prefix) {
			core.events._action_animateResize(data, x, y, prefix)

		});
		core.registerEvent("pauseAnimate", function (data, x, y, prefix) {
			core.maps.pauseAnimate(data.id)
			core.doAction();

		});
		core.registerEvent("remuseAnimate", function (data, x, y, prefix) {
			core.maps.remuseAnimate(data.id)
			core.doAction();
		});
		core.registerEvent("playanimate", function (data) {
			if (!main.replayChecking && !core.isReplaying()) {
				data.x = data.x ?? 0;
				data.y = data.y ?? 0;
				data.scalex = data.scalex ?? 1;
				data.scaley = data.scaley ?? 1;
				core.playanimate(
					data.name,
					data.id,
					data.x,
					data.y,
					data.hero,
					data.scalex,
					data.scaley,
					data.loop,
					data.reverse
				);
				core.doAction();
			} else {
				core.doAction();
			}
		});
	};
},
    "drawLight": function () {
    // 绘制灯光/漆黑层效果。调用方式 core.plugin.drawLight(...)
    // 【参数说明】
    // name：必填，要绘制到的画布名；可以是一个系统画布，或者是个自定义画布；如果不存在则创建
    // color：可选，只能是一个0~1之间的数，为不透明度的值。不填则默认为0.9。
    // lights：可选，一个数组，定义了每个独立的灯光。
    //        其中每一项是三元组 [x,y,r] x和y分别为该灯光的横纵坐标，r为该灯光的半径。
    // lightDec：可选，0到1之间，光从多少百分比才开始衰减（在此范围内保持全亮），不设置默认为0。
    //        比如lightDec为0.5代表，每个灯光部分内圈50%的范围全亮，50%以后才开始快速衰减。
    // 【调用样例】
    // core.plugin.drawLight('curtain'); // 在curtain层绘制全图不透明度0.9，等价于更改画面色调为[0,0,0,0.9]。
    // core.plugin.drawLight('ui', 0.95, [[25,11,46]]); // 在ui层绘制全图不透明度0.95，其中在(25,11)点存在一个半径为46的灯光效果。
    // core.plugin.drawLight('test', 0.2, [[25,11,46,0.1]]); // 创建一个test图层，不透明度0.2，其中在(25,11)点存在一个半径为46的灯光效果，灯光中心不透明度0.1。
    // core.plugin.drawLight('test2', 0.9, [[25,11,46],[105,121,88],[301,221,106]]); // 创建test2图层，且存在三个灯光效果，分别是中心(25,11)半径46，中心(105,121)半径88，中心(301,221)半径106。
    // core.plugin.drawLight('xxx', 0.3, [[25,11,46],[105,121,88,0.2]], 0.4); // 存在两个灯光效果，它们在内圈40%范围内保持全亮，40%后才开始衰减。
    this.drawLight = function (name, color, lights, lightDec) {
      // 清空色调层；也可以修改成其它层比如animate/weather层，或者用自己创建的canvas
      var ctx = core.getContextByName(name);
      if (ctx == null) {
        if (typeof name == "string")
          ctx = core.createCanvas(
            name,
            0,
            0,
            core._PX_ || core.__PIXELS__,
            core._PY_ || core.__PIXELS__,
            98
          );
        else return;
      }

      ctx.mozImageSmoothingEnabled = false;
      ctx.webkitImageSmoothingEnabled = false;
      ctx.msImageSmoothingEnabled = false;
      ctx.imageSmoothingEnabled = false;

      core.clearMap(name);
      // 绘制色调层，默认不透明度
      if (color == null) color = 0.9;
      ctx.fillStyle = "rgba(0,0,0," + color + ")";
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      lightDec = core.clamp(lightDec, 0, 1);

      // 绘制每个灯光效果
      ctx.globalCompositeOperation = "destination-out";
      lights.forEach(function (light) {
        // 坐标，半径，中心不透明度
        var x = light[0],
          y = light[1],
          r = light[2];
        // 计算衰减距离
        var decDistance = parseInt(r * lightDec);
        // 正方形区域的直径和左上角坐标
        var grd = ctx.createRadialGradient(x, y, decDistance, x, y, r);
        grd.addColorStop(0, "rgba(0,0,0,1)");
        grd.addColorStop(1, "rgba(0,0,0,0)");
        ctx.beginPath();
        ctx.fillStyle = grd;
        ctx.arc(x, y, r, 0, 2 * Math.PI);
        ctx.fill();
      });
      ctx.globalCompositeOperation = "source-over";
      // 可以在任何地方（如afterXXX或自定义脚本事件）调用函数，方法为  core.plugin.xxx();
    };
  },
    "shop": function () {
    // 【全局商店】相关的功能
    //
    // 打开一个全局商店
    // shopId：要打开的商店id；noRoute：是否不计入录像
    this.openShop = function (shopId, noRoute) {
      var shop = core.status.shops[shopId];
      // Step 1: 检查能否打开此商店
      if (!this.canOpenShop(shopId)) {
        core.drawTip("该商店尚未开启");
        return false;
      }

      // Step 2: （如有必要）记录打开商店的脚本事件
      if (!noRoute) {
        core.status.route.push("shop:" + shopId);
      }

      // Step 3: 检查道具商店 or 公共事件
      if (shop.item) {
        if (core.openItemShop) {
          core.openItemShop(shopId);
        } else {
          core.playSound("操作失败");
          core.insertAction("道具商店插件不存在！请检查是否存在该插件！");
        }
        return;
      }
      if (shop.commonEvent) {
        core.insertCommonEvent(shop.commonEvent, shop.args);
        return;
      }

      _shouldProcessKeyUp = true;

      // Step 4: 执行标准公共商店
      core.insertAction(this._convertShop(shop));
      return true;
    };

    ////// 将一个全局商店转变成可预览的公共事件 //////
    this._convertShop = function (shop) {
      return [
        {
          type: "function",
          function: "function() {core.addFlag('@temp@shop', 1);}",
        },
        {
          type: "while",
          condition: "true",
          data: [
            // 检测能否访问该商店
            {
              type: "if",
              condition: "core.isShopVisited('" + shop.id + "')",
              true: [
                // 可以访问，直接插入执行效果
                {
                  type: "function",
                  function:
                    "function() { core.plugin._convertShop_replaceChoices('" +
                    shop.id +
                    "', false) }",
                },
              ],
              false: [
                // 不能访问的情况下：检测能否预览
                {
                  type: "if",
                  condition: shop.disablePreview,
                  true: [
                    // 不可预览，提示并退出
                    { type: "playSound", name: "操作失败" },
                    "当前无法访问该商店！",
                    { type: "break" },
                  ],
                  false: [
                    // 可以预览：将商店全部内容进行替换
                    { type: "tip", text: "当前处于预览模式，不可购买" },
                    {
                      type: "function",
                      function:
                        "function() { core.plugin._convertShop_replaceChoices('" +
                        shop.id +
                        "', true) }",
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          type: "function",
          function: "function() {core.addFlag('@temp@shop', -1);}",
        },
      ];
    };

    this._convertShop_replaceChoices = function (shopId, previewMode) {
      var shop = core.status.shops[shopId];
      var choices = (shop.choices || [])
        .filter(function (choice) {
          if (choice.condition == null || choice.condition == "") return true;
          try {
            return core.calValue(choice.condition);
          } catch (e) {
            return true;
          }
        })
        .map(function (choice) {
          var ableToBuy = core.calValue(choice.need);
          return {
            text: core.replaceText(choice.text),
            icon: choice.icon,
            color:
              ableToBuy && !previewMode ? choice.color : [153, 153, 153, 1],
            action:
              ableToBuy && !previewMode
                ? [{ type: "playSound", name: "商店" }].concat(choice.action)
                : [
                    { type: "playSound", name: "操作失败" },
                    {
                      type: "tip",
                      text: previewMode ? "预览模式下不可购买" : "购买条件不足",
                    },
                  ],
          };
        })
        .concat({
          text: "离开",
          action: [{ type: "playSound", name: "取消" }, { type: "break" }],
        });
      core.insertAction({
        type: "choices",
        text: core.replaceText(shop.text),
        choices: choices,
      });
    };

    /// 是否访问过某个快捷商店
    this.isShopVisited = function (id) {
      if (!core.hasFlag("__shops__")) core.setFlag("__shops__", {});
      var shops = core.getFlag("__shops__");
      if (!shops[id]) shops[id] = {};
      return shops[id].visited;
    };

    /// 当前应当显示的快捷商店列表
    this.listShopIds = function () {
      return Object.keys(core.status.shops).filter(function (id) {
        return core.isShopVisited(id) || !core.status.shops[id].mustEnable;
      });
    };

    /// 是否能够打开某个商店
    this.canOpenShop = function (id) {
      if (this.isShopVisited(id)) return true;
      var shop = core.status.shops[id];
      if (shop.item || shop.commonEvent || shop.mustEnable) return false;
      return true;
    };

    /// 启用或禁用某个快捷商店
    this.setShopVisited = function (id, visited) {
      if (!core.hasFlag("__shops__")) core.setFlag("__shops__", {});
      var shops = core.getFlag("__shops__");
      if (!shops[id]) shops[id] = {};
      if (visited) shops[id].visited = true;
      else delete shops[id].visited;
    };

    /// 能否使用快捷商店
    this.canUseQuickShop = function (id) {
      // 如果返回一个字符串，表示不能，字符串为不能使用的提示
      // 返回null代表可以使用

      // 检查当前楼层的canUseQuickShop选项是否为false
      if (core.status.thisMap.canUseQuickShop === false)
        return "当前楼层不能使用快捷商店。";
      return null;
    };

    var _shouldProcessKeyUp = true;

    /// 允许商店X键退出
    core.registerAction(
      "keyUp",
      "shops",
      function (keycode) {
        if (!core.status.lockControl || core.status.event.id != "action")
          return false;
        if ((keycode == 13 || keycode == 32) && !_shouldProcessKeyUp) {
          _shouldProcessKeyUp = true;
          return true;
        }

        if (
          !core.hasFlag("@temp@shop") ||
          core.status.event.data.type != "choices"
        )
          return false;
        var data = core.status.event.data.current;
        var choices = data.choices;
        var topIndex = core.actions._getChoicesTopIndex(choices.length);
        if (keycode == 88 || keycode == 27) {
          // X, ESC
          core.actions._clickAction(
            core._HALF_WIDTH_ || core.__HALF_SIZE__,
            topIndex + choices.length - 1
          );
          return true;
        }
        return false;
      },
      60
    );

    /// 允许长按空格或回车连续执行操作
    core.registerAction(
      "keyDown",
      "shops",
      function (keycode) {
        if (
          !core.status.lockControl ||
          !core.hasFlag("@temp@shop") ||
          core.status.event.id != "action"
        )
          return false;
        if (core.status.event.data.type != "choices") return false;
        core.status.onShopLongDown = true;
        var data = core.status.event.data.current;
        var choices = data.choices;
        var topIndex = core.actions._getChoicesTopIndex(choices.length);
        if (keycode == 13 || keycode == 32) {
          // Space, Enter
          core.actions._clickAction(
            core._HALF_WIDTH_ || core.__HALF_SIZE__,
            topIndex + core.status.event.selection
          );
          _shouldProcessKeyUp = false;
          return true;
        }
        return false;
      },
      60
    );

    // 允许长按屏幕连续执行操作
    core.registerAction(
      "longClick",
      "shops",
      function (x, y, px, py) {
        if (
          !core.status.lockControl ||
          !core.hasFlag("@temp@shop") ||
          core.status.event.id != "action"
        )
          return false;
        if (core.status.event.data.type != "choices") return false;
        var data = core.status.event.data.current;
        var choices = data.choices;
        var topIndex = core.actions._getChoicesTopIndex(choices.length);
        if (
          Math.abs(x - (core._HALF_WIDTH_ || core.__HALF_SIZE__)) <= 2 &&
          y >= topIndex &&
          y < topIndex + choices.length
        ) {
          core.actions._clickAction(x, y);
          return true;
        }
        return false;
      },
      60
    );
  },
    "removeMap": function () {
    // 高层塔砍层插件，删除后不会存入存档，不可浏览地图也不可飞到。
    // 推荐用法：
    // 对于超高层或分区域塔，当在1区时将2区以后的地图删除；1区结束时恢复2区，进二区时删除1区地图，以此类推
    // 这样可以大幅减少存档空间，以及加快存读档速度

    // 删除楼层
    // core.removeMaps("MT1", "MT300") 删除MT1~MT300之间的全部层
    // core.removeMaps("MT10") 只删除MT10层
    this.removeMaps = function (fromId, toId) {
      toId = toId || fromId;
      var fromIndex = core.floorIds.indexOf(fromId),
        toIndex = core.floorIds.indexOf(toId);
      if (toIndex < 0) toIndex = core.floorIds.length - 1;
      flags.__visited__ = flags.__visited__ || {};
      flags.__removed__ = flags.__removed__ || [];
      flags.__disabled__ = flags.__disabled__ || {};
      flags.__leaveLoc__ = flags.__leaveLoc__ || {};
      for (var i = fromIndex; i <= toIndex; ++i) {
        var floorId = core.floorIds[i];
        if (core.status.maps[floorId].deleted) continue;
        delete flags.__visited__[floorId];
        flags.__removed__.push(floorId);
        delete flags.__disabled__[floorId];
        delete flags.__leaveLoc__[floorId];
        (core.status.autoEvents || []).forEach(function (event) {
          if (event.floorId == floorId && event.currentFloor) {
            core.autoEventExecuting(event.symbol, false);
            core.autoEventExecuted(event.symbol, false);
          }
        });
        core.status.maps[floorId].deleted = true;
        core.status.maps[floorId].canFlyTo = false;
        core.status.maps[floorId].canFlyFrom = false;
        core.status.maps[floorId].cannotViewMap = true;
      }
    };

    // 恢复楼层
    // core.resumeMaps("MT1", "MT300") 恢复MT1~MT300之间的全部层
    // core.resumeMaps("MT10") 只恢复MT10层
    this.resumeMaps = function (fromId, toId) {
      toId = toId || fromId;
      var fromIndex = core.floorIds.indexOf(fromId),
        toIndex = core.floorIds.indexOf(toId);
      if (toIndex < 0) toIndex = core.floorIds.length - 1;
      flags.__removed__ = flags.__removed__ || [];
      for (var i = fromIndex; i <= toIndex; ++i) {
        var floorId = core.floorIds[i];
        if (!core.status.maps[floorId].deleted) continue;
        flags.__removed__ = flags.__removed__.filter(function (f) {
          return f != floorId;
        });
        core.status.maps[floorId] = core.loadFloor(floorId);
      }
    };

    // 分区砍层相关
    var inAnyPartition = function (floorId) {
      var inPartition = false;
      (core.floorPartitions || []).forEach(function (floor) {
        var fromIndex = core.floorIds.indexOf(floor[0]);
        var toIndex = core.floorIds.indexOf(floor[1]);
        var index = core.floorIds.indexOf(floorId);
        if (fromIndex < 0 || index < 0) return;
        if (toIndex < 0) toIndex = core.floorIds.length - 1;
        if (index >= fromIndex && index <= toIndex) inPartition = true;
      });
      return inPartition;
    };

    // 分区砍层
    this.autoRemoveMaps = function (floorId) {
      if (main.mode != "play" || !inAnyPartition(floorId)) return;
      // 根据分区信息自动砍层与恢复
      (core.floorPartitions || []).forEach(function (floor) {
        var fromIndex = core.floorIds.indexOf(floor[0]);
        var toIndex = core.floorIds.indexOf(floor[1]);
        var index = core.floorIds.indexOf(floorId);
        if (fromIndex < 0 || index < 0) return;
        if (toIndex < 0) toIndex = core.floorIds.length - 1;
        if (index >= fromIndex && index <= toIndex) {
          core.resumeMaps(core.floorIds[fromIndex], core.floorIds[toIndex]);
        } else {
          core.removeMaps(core.floorIds[fromIndex], core.floorIds[toIndex]);
        }
      });
    };
  },
    "fiveLayers": function () {
    // 是否启用五图层（增加背景2层和前景2层） 将__enable置为true即会启用；启用后请保存后刷新编辑器
    // 背景层2将会覆盖背景层 被事件层覆盖 前景层2将会覆盖前景层
    // 另外 请注意加入两个新图层 会让大地图的性能降低一些
    // 插件作者：ad
    var __enable = false;
    if (!__enable) return;

    // 创建新图层
    function createCanvas(name, zIndex) {
      if (!name) return;
      var canvas = document.createElement("canvas");
      canvas.id = name;
      canvas.className = "gameCanvas anti-aliasing";
      // 编辑器模式下设置zIndex会导致加入的图层覆盖优先级过高
      if (main.mode != "editor") canvas.style.zIndex = zIndex || 0;
      // 将图层插入进游戏内容
      document.getElementById("gameDraw").appendChild(canvas);
      var ctx = canvas.getContext("2d");
      core.canvas[name] = ctx;
      canvas.width = core._PX_ || core.__PIXELS__;
      canvas.height = core._PY_ || core.__PIXELS__;
      return canvas;
    }

    var bg2Canvas = createCanvas("bg2", 20);
    var fg2Canvas = createCanvas("fg2", 63);
    // 大地图适配
    core.bigmap.canvas = [
      "bg2",
      "fg2",
      "bg",
      "event",
      "event2",
      "fg",
      "damage",
    ];
    core.initStatus.bg2maps = {};
    core.initStatus.fg2maps = {};

    if (main.mode == "editor") {
      /*插入编辑器的图层 不做此步新增图层无法在编辑器显示*/
      // 编辑器图层覆盖优先级 eui > efg > fg(前景层) > event2(48*32图块的事件层) > event(事件层) > bg(背景层)
      // 背景层2(bg2) 插入事件层(event)之前(即bg与event之间)
      document
        .getElementById("mapEdit")
        .insertBefore(bg2Canvas, document.getElementById("event"));
      // 前景层2(fg2) 插入编辑器前景(efg)之前(即fg之后)
      document
        .getElementById("mapEdit")
        .insertBefore(fg2Canvas, document.getElementById("ebm"));
      // 原本有三个图层 从4开始添加
      var num = 4;
      // 新增图层存入editor.dom中
      editor.dom.bg2c = core.canvas.bg2.canvas;
      editor.dom.bg2Ctx = core.canvas.bg2;
      editor.dom.fg2c = core.canvas.fg2.canvas;
      editor.dom.fg2Ctx = core.canvas.fg2;
      editor.dom.maps.push("bg2map", "fg2map");
      editor.dom.canvas.push("bg2", "fg2");

      // 创建编辑器上的按钮
      var createCanvasBtn = function (name) {
        // 电脑端创建按钮
        var input = document.createElement("input");
        // layerMod4/layerMod5
        var id = "layerMod" + num++;
        // bg2map/fg2map
        var value = name + "map";
        input.type = "radio";
        input.name = "layerMod";
        input.id = id;
        input.value = value;
        editor.dom[id] = input;
        input.onchange = function () {
          editor.uifunctions.setLayerMod(value);
        };
        return input;
      };

      var createCanvasBtn_mobile = function (name) {
        // 手机端往选择列表中添加子选项
        var input = document.createElement("option");
        var id = "layerMod" + num++;
        var value = name + "map";
        input.name = "layerMod";
        input.value = value;
        editor.dom[id] = input;
        return input;
      };
      if (!editor.isMobile) {
        var input = createCanvasBtn("bg2");
        var input2 = createCanvasBtn("fg2");
        // 获取事件层及其父节点
        var child = document.getElementById("layerMod"),
          parent = child.parentNode;
        // 背景层2插入事件层前
        parent.insertBefore(input, child);
        // 不能直接更改背景层2的innerText 所以创建文本节点
        var txt = document.createTextNode("bg2");
        // 插入事件层前(即新插入的背景层2前)
        parent.insertBefore(txt, child);
        // 向最后插入前景层2(即插入前景层后)
        parent.appendChild(input2);
        var txt2 = document.createTextNode("fg2");
        parent.appendChild(txt2);
        parent.childNodes[2].replaceWith("bg");
        parent.childNodes[6].replaceWith("事件");
        parent.childNodes[8].replaceWith("fg");
      } else {
        var input = createCanvasBtn_mobile("bg2");
        var input2 = createCanvasBtn_mobile("fg2");
        // 手机端因为是选项 所以可以直接改innerText
        input.innerText = "背景层2";
        input2.innerText = "前景层2";
        var parent = document.getElementById("layerMod");
        parent.insertBefore(input, parent.children[1]);
        parent.appendChild(input2);
      }
    }

    var _loadFloor_doNotCopy = core.maps._loadFloor_doNotCopy;
    core.maps._loadFloor_doNotCopy = function () {
      return ["bg2map", "fg2map"].concat(_loadFloor_doNotCopy());
    };
    ////// 绘制背景和前景层 //////
    core.maps._drawBg_draw = function (floorId, toDrawCtx, cacheCtx, config) {
      config.ctx = cacheCtx;
      core.maps._drawBg_drawBackground(floorId, config);
      // ------ 调整这两行的顺序来控制是先绘制贴图还是先绘制背景图块；后绘制的覆盖先绘制的。
      core.maps._drawFloorImages(
        floorId,
        config.ctx,
        "bg",
        null,
        null,
        config.onMap
      );
      core.maps._drawBgFgMap(floorId, "bg", config);
      if (config.onMap) {
        core.drawImage(
          toDrawCtx,
          cacheCtx.canvas,
          core.bigmap.v2 ? -32 : 0,
          core.bigmap.v2 ? -32 : 0
        );
        core.clearMap("bg2");
        core.clearMap(cacheCtx);
      }
      core.maps._drawBgFgMap(floorId, "bg2", config);
      if (config.onMap)
        core.drawImage(
          "bg2",
          cacheCtx.canvas,
          core.bigmap.v2 ? -32 : 0,
          core.bigmap.v2 ? -32 : 0
        );
      config.ctx = toDrawCtx;
    };
    core.maps._drawFg_draw = function (floorId, toDrawCtx, cacheCtx, config) {
      config.ctx = cacheCtx;
      // ------ 调整这两行的顺序来控制是先绘制贴图还是先绘制前景图块；后绘制的覆盖先绘制的。
      core.maps._drawFloorImages(
        floorId,
        config.ctx,
        "fg",
        null,
        null,
        config.onMap
      );
      core.maps._drawBgFgMap(floorId, "fg", config);
      if (config.onMap) {
        core.drawImage(
          toDrawCtx,
          cacheCtx.canvas,
          core.bigmap.v2 ? -32 : 0,
          core.bigmap.v2 ? -32 : 0
        );
        core.clearMap("fg2");
        core.clearMap(cacheCtx);
      }
      core.maps._drawBgFgMap(floorId, "fg2", config);
      if (config.onMap)
        core.drawImage(
          "fg2",
          cacheCtx.canvas,
          core.bigmap.v2 ? -32 : 0,
          core.bigmap.v2 ? -32 : 0
        );
      config.ctx = toDrawCtx;
    };
    ////// 移动判定 //////
    core.maps._generateMovableArray_arrays = function (floorId) {
      return {
        bgArray: this.getBgMapArray(floorId),
        fgArray: this.getFgMapArray(floorId),
        eventArray: this.getMapArray(floorId),
        bg2Array: this._getBgFgMapArray("bg2", floorId),
        fg2Array: this._getBgFgMapArray("fg2", floorId),
      };
    };
  },
    "itemShop": function () {
    // 道具商店相关的插件
    // 可在全塔属性-全局商店中使用「道具商店」事件块进行编辑（如果找不到可以在入口方块中找）

    var shopId = null; // 当前商店ID
    var type = 0; // 当前正在选中的类型，0买入1卖出
    var selectItem = 0; // 当前正在选中的道具
    var selectCount = 0; // 当前已经选中的数量
    var page = 0;
    var totalPage = 0;
    var totalMoney = 0;
    var list = [];
    var shopInfo = null; // 商店信息
    var choices = []; // 商店选项
    var use = "money";
    var useText = "金币";

    var bigFont = core.ui._buildFont(20, false),
      middleFont = core.ui._buildFont(18, false);

    this._drawItemShop = function () {
      // 绘制道具商店

      // Step 1: 背景和固定的几个文字
      core.ui._createUIEvent();
      core.clearMap("uievent");
      core.ui.clearUIEventSelector();
      core.setTextAlign("uievent", "left");
      core.setTextBaseline("uievent", "top");
      core.fillRect("uievent", 0, 0, 416, 416, "black");
      core.drawWindowSkin("winskin.png", "uievent", 0, 0, 416, 56);
      core.drawWindowSkin("winskin.png", "uievent", 0, 56, 312, 56);
      core.drawWindowSkin("winskin.png", "uievent", 0, 112, 312, 304);
      core.drawWindowSkin("winskin.png", "uievent", 312, 56, 104, 56);
      core.drawWindowSkin("winskin.png", "uievent", 312, 112, 104, 304);
      core.setFillStyle("uievent", "white");
      core.setStrokeStyle("uievent", "white");
      core.fillText("uievent", "购买", 32, 74, "white", bigFont);
      core.fillText("uievent", "卖出", 132, 74);
      core.fillText("uievent", "离开", 232, 74);
      core.fillText("uievent", "当前" + useText, 324, 66, null, middleFont);
      core.setTextAlign("uievent", "right");
      core.fillText(
        "uievent",
        core.formatBigNumber(core.status.hero[use]),
        405,
        89
      );
      core.setTextAlign("uievent", "left");
      core.ui.drawUIEventSelector(
        1,
        "winskin.png",
        22 + 100 * type,
        66,
        60,
        33
      );
      if (selectItem != null) {
        core.setTextAlign("uievent", "center");
        core.fillText(
          "uievent",
          type == 0 ? "买入个数" : "卖出个数",
          364,
          320,
          null,
          bigFont
        );
        core.fillText("uievent", "<   " + selectCount + "   >", 364, 350);
        core.fillText("uievent", "确定", 364, 380);
      }

      // Step 2：获得列表并展示
      list = choices.filter(function (one) {
        if (one.condition != null && one.condition != "") {
          try {
            if (!core.calValue(one.condition)) return false;
          } catch (e) {}
        }
        return (
          (type == 0 && one.money != null) || (type == 1 && one.sell != null)
        );
      });
      var per_page = 6;
      totalPage = Math.ceil(list.length / per_page);
      page = Math.floor((selectItem || 0) / per_page) + 1;

      // 绘制分页
      if (totalPage > 1) {
        var half = 156;
        core.setTextAlign("uievent", "center");
        core.fillText(
          "uievent",
          page + " / " + totalPage,
          half,
          388,
          null,
          middleFont
        );
        if (page > 1) core.fillText("uievent", "上一页", half - 80, 388);
        if (page < totalPage)
          core.fillText("uievent", "下一页", half + 80, 388);
      }
      core.setTextAlign("uievent", "left");

      // 绘制每一项
      var start = (page - 1) * per_page;
      for (var i = 0; i < per_page; ++i) {
        var curr = start + i;
        if (curr >= list.length) break;
        var item = list[curr];
        core.drawIcon("uievent", item.id, 10, 125 + i * 40);
        core.setTextAlign("uievent", "left");
        core.fillText(
          "uievent",
          core.material.items[item.id].name,
          50,
          132 + i * 40,
          null,
          bigFont
        );
        core.setTextAlign("uievent", "right");
        core.fillText(
          "uievent",
          (type == 0 ? core.calValue(item.money) : core.calValue(item.sell)) +
            useText +
            "/个",
          300,
          133 + i * 40,
          null,
          middleFont
        );
        core.setTextAlign("uievent", "left");
        if (curr == selectItem) {
          // 绘制描述，文字自动放缩
          var text =
            core.replaceText(core.material.items[item.id].text) ||
            "该道具暂无描述";
          if (text[0] == "," || text[0] == "，") text = text.substring(1);
          try {
            text = core.replaceText(text);
          } catch (e) {}
          for (var fontSize = 20; fontSize >= 8; fontSize -= 2) {
            var config = { left: 10, fontSize: fontSize, maxWidth: 403 };
            var height = core.getTextContentHeight(text, config);
            if (height <= 50) {
              config.top = (56 - height) / 2;
              core.drawTextContent("uievent", text, config);
              break;
            }
          }
          core.ui.drawUIEventSelector(
            2,
            "winskin.png",
            8,
            120 + i * 40,
            295,
            40
          );
          if (type == 0 && item.number != null) {
            core.fillText("uievent", "存货", 324, 132, null, bigFont);
            core.setTextAlign("uievent", "right");
            core.fillText("uievent", item.number, 406, 132, null, null, 40);
          } else if (type == 1) {
            core.fillText("uievent", "数量", 324, 132, null, bigFont);
            core.setTextAlign("uievent", "right");
            core.fillText(
              "uievent",
              core.itemCount(item.id),
              406,
              132,
              null,
              null,
              40
            );
          }
          core.setTextAlign("uievent", "left");
          core.fillText("uievent", "预计" + useText, 324, 250);
          core.setTextAlign("uievent", "right");
          totalMoney =
            selectCount *
            (type == 0 ? core.calValue(item.money) : core.calValue(item.sell));
          core.fillText("uievent", core.formatBigNumber(totalMoney), 405, 280);

          core.setTextAlign("uievent", "left");
          core.fillText(
            "uievent",
            type == 0 ? "已购次数" : "已卖次数",
            324,
            170
          );
          core.setTextAlign("uievent", "right");
          core.fillText(
            "uievent",
            (type == 0 ? item.money_count : item.sell_count) || 0,
            405,
            200
          );
        }
      }

      core.setTextAlign("uievent", "left");
      core.setTextBaseline("uievent", "alphabetic");
    };

    var _add = function (item, delta) {
      if (item == null) return;
      selectCount = core.clamp(
        selectCount + delta,
        0,
        Math.min(
          type == 0
            ? Math.floor(core.status.hero[use] / core.calValue(item.money))
            : core.itemCount(item.id),
          type == 0 && item.number != null
            ? item.number
            : Number.MAX_SAFE_INTEGER
        )
      );
    };

    var _confirm = function (item) {
      if (item == null || selectCount == 0) return;
      if (type == 0) {
        core.status.hero[use] -= totalMoney;
        core.getItem(item.id, selectCount);
        core.stopSound();
        core.playSound("确定");
        if (item.number != null) item.number -= selectCount;
        item.money_count = (item.money_count || 0) + selectCount;
      } else {
        core.status.hero[use] += totalMoney;
        core.removeItem(item.id, selectCount);
        core.playSound("确定");
        core.drawTip(
          "成功卖出" + selectCount + "个" + core.material.items[item.id].name,
          item.id
        );
        if (item.number != null) item.number += selectCount;
        item.sell_count = (item.sell_count || 0) + selectCount;
      }
      selectCount = 0;
    };

    this._performItemShopKeyBoard = function (keycode) {
      var item = list[selectItem] || null;
      // 键盘操作
      switch (keycode) {
        case 38: // up
          if (selectItem == null) break;
          if (selectItem == 0) selectItem = null;
          else selectItem--;
          selectCount = 0;
          break;
        case 37: // left
          if (selectItem == null) {
            if (type > 0) type--;
            break;
          }
          _add(item, -1);
          break;
        case 39: // right
          if (selectItem == null) {
            if (type < 2) type++;
            break;
          }
          _add(item, 1);
          break;
        case 40: // down
          if (selectItem == null) {
            if (list.length > 0) selectItem = 0;
            break;
          }
          if (list.length == 0) break;
          selectItem = Math.min(selectItem + 1, list.length - 1);
          selectCount = 0;
          break;
        case 13:
        case 32: // Enter/Space
          if (selectItem == null) {
            if (type == 2) core.insertAction({ type: "break" });
            else if (list.length > 0) selectItem = 0;
            break;
          }
          _confirm(item);
          break;
        case 27: // ESC
          if (selectItem == null) {
            core.insertAction({ type: "break" });
            break;
          }
          selectItem = null;
          break;
      }
    };

    this._performItemShopClick = function (px, py) {
      var item = list[selectItem] || null;
      // 鼠标操作
      if (px >= 22 && px <= 82 && py >= 71 && py <= 102) {
        // 买
        if (type != 0) {
          type = 0;
          selectItem = null;
          selectCount = 0;
        }
        return;
      }
      if (px >= 122 && px <= 182 && py >= 71 && py <= 102) {
        // 卖
        if (type != 1) {
          type = 1;
          selectItem = null;
          selectCount = 0;
        }
        return;
      }
      if (px >= 222 && px <= 282 && py >= 71 && py <= 102)
        // 离开
        return core.insertAction({ type: "break" });
      // < >
      if (px >= 318 && px <= 341 && py >= 348 && py <= 376)
        return _add(item, -1);
      if (px >= 388 && px <= 416 && py >= 348 && py <= 376)
        return _add(item, 1);
      // 确定
      if (px >= 341 && px <= 387 && py >= 380 && py <= 407)
        return _confirm(item);

      // 上一页/下一页
      if (px >= 45 && px <= 105 && py >= 388) {
        if (page > 1) {
          selectItem -= 6;
          selectCount = 0;
        }
        return;
      }
      if (px >= 208 && px <= 268 && py >= 388) {
        if (page < totalPage) {
          selectItem = Math.min(selectItem + 6, list.length - 1);
          selectCount = 0;
        }
        return;
      }

      // 实际区域
      if (px >= 9 && px <= 300 && py >= 120 && py < 360) {
        if (list.length == 0) return;
        var index = parseInt((py - 120) / 40);
        var newItem = 6 * (page - 1) + index;
        if (newItem >= list.length) newItem = list.length - 1;
        if (newItem != selectItem) {
          selectItem = newItem;
          selectCount = 0;
        }
        return;
      }
    };

    this._performItemShopAction = function () {
      if (flags.type == 0) return this._performItemShopKeyBoard(flags.keycode);
      else return this._performItemShopClick(flags.px, flags.py);
    };

    this.openItemShop = function (itemShopId) {
      shopId = itemShopId;
      type = 0;
      page = 0;
      selectItem = null;
      selectCount = 0;
      core.isShopVisited(itemShopId);
      shopInfo = flags.__shops__[shopId];
      if (shopInfo.choices == null)
        shopInfo.choices = core.clone(core.status.shops[shopId].choices);
      choices = shopInfo.choices;
      use = core.status.shops[shopId].use;
      if (use != "exp") use = "money";
      useText = use == "money" ? "金币" : "经验";

      core.insertAction([
        {
          type: "while",
          condition: "true",
          data: [
            {
              type: "function",
              function: "function () { core.plugin._drawItemShop(); }",
            },
            { type: "wait" },
            {
              type: "function",
              function: "function() { core.plugin._performItemShopAction(); }",
            },
          ],
        },
        {
          type: "function",
          function:
            "function () { core.deleteCanvas('uievent'); core.ui.clearUIEventSelector(); }",
        },
      ]);
    };
  },
    "enemyLevel": function () {
    // 此插件将提供怪物手册中的怪物境界显示
    // 使用此插件需要先给每个怪物定义境界，方法如下：
    // 点击怪物的【配置表格】，找到“【怪物】相关的表格配置”，然后在【名称】仿照增加境界定义：
    /*
		 "level": {
			  "_leaf": true,
			  "_type": "textarea",
			  "_string": true,
			  "_data": "境界"
		 },
		 */
    // 然后保存刷新，可以看到怪物的属性定义中出现了【境界】。再开启本插件即可。

    // 是否开启本插件，默认禁用；将此改成 true 将启用本插件。
    var __enable = false;
    if (!__enable) return;

    // 这里定义每个境界的显示颜色；可以写'red', '#RRGGBB' 或者[r,g,b,a]四元数组
    var levelToColors = {
      萌新一阶: "red",
      萌新二阶: "#FF0000",
      萌新三阶: [255, 0, 0, 1],
    };

    // 复写 _drawBook_drawName
    var originDrawBook = core.ui._drawBook_drawName;
    core.ui._drawBook_drawName = function (index, enemy, top, left, width) {
      // 如果没有境界，则直接调用原始代码绘制
      if (!enemy.level)
        return originDrawBook.call(core.ui, index, enemy, top, left, width);
      // 存在境界，则额外进行绘制
      core.setTextAlign("ui", "center");
      if (enemy.specialText.length == 0) {
        core.fillText(
          "ui",
          enemy.name,
          left + width / 2,
          top + 27,
          "#DDDDDD",
          this._buildFont(17, true)
        );
        core.fillText(
          "ui",
          enemy.level,
          left + width / 2,
          top + 51,
          core.arrayToRGBA(levelToColors[enemy.level] || "#DDDDDD"),
          this._buildFont(14, true)
        );
      } else {
        core.fillText(
          "ui",
          enemy.name,
          left + width / 2,
          top + 20,
          "#DDDDDD",
          this._buildFont(17, true),
          width
        );
        switch (enemy.specialText.length) {
          case 1:
            core.fillText(
              "ui",
              enemy.specialText[0],
              left + width / 2,
              top + 38,
              core.arrayToRGBA((enemy.specialColor || [])[0] || "#FF6A6A"),
              this._buildFont(14, true),
              width
            );
            break;
          case 2:
            // Step 1: 计算字体
            var text = enemy.specialText[0] + "  " + enemy.specialText[1];
            core.setFontForMaxWidth(
              "ui",
              text,
              width,
              this._buildFont(14, true)
            );
            // Step 2: 计算总宽度
            var totalWidth = core.calWidth("ui", text);
            var leftWidth = core.calWidth("ui", enemy.specialText[0]);
            var rightWidth = core.calWidth("ui", enemy.specialText[1]);
            // Step 3: 绘制
            core.fillText(
              "ui",
              enemy.specialText[0],
              left + (width + leftWidth - totalWidth) / 2,
              top + 38,
              core.arrayToRGBA((enemy.specialColor || [])[0] || "#FF6A6A")
            );
            core.fillText(
              "ui",
              enemy.specialText[1],
              left + (width + totalWidth - rightWidth) / 2,
              top + 38,
              core.arrayToRGBA((enemy.specialColor || [])[1] || "#FF6A6A")
            );
            break;
          default:
            core.fillText(
              "ui",
              "多属性...",
              left + width / 2,
              top + 38,
              "#FF6A6A",
              this._buildFont(14, true),
              width
            );
        }
        core.fillText(
          "ui",
          enemy.level,
          left + width / 2,
          top + 56,
          core.arrayToRGBA(levelToColors[enemy.level] || "#DDDDDD"),
          this._buildFont(14, true)
        );
      }
    };

    // 也可以复写其他的属性颜色如怪物攻防等，具体参见下面的例子的注释部分
    core.ui._drawBook_drawRow1 = function (
      index,
      enemy,
      top,
      left,
      width,
      position
    ) {
      // 绘制第一行
      core.setTextAlign("ui", "left");
      var b13 = this._buildFont(13, true),
        f13 = this._buildFont(13, false);
      var col1 = left,
        col2 = left + (width * 9) / 25,
        col3 = left + (width * 17) / 25;
      core.fillText("ui", "生命", col1, position, "#DDDDDD", f13);
      core.fillText(
        "ui",
        core.formatBigNumber(enemy.hp || 0),
        col1 + 30,
        position,
        /*'red' */ null,
        b13
      );
      core.fillText("ui", "攻击", col2, position, null, f13);
      core.fillText(
        "ui",
        core.formatBigNumber(enemy.atk || 0),
        col2 + 30,
        position,
        /* '#FF0000' */ null,
        b13
      );
      core.fillText("ui", "防御", col3, position, null, f13);
      core.fillText(
        "ui",
        core.formatBigNumber(enemy.def || 0),
        col3 + 30,
        position,
        /* [255, 0, 0, 1] */ null,
        b13
      );
    };
  },
    "multiHeros": function () {
    // 多角色插件
    // Step 1: 启用本插件
    // Step 2: 定义每个新的角色各项初始数据（参见下方注释）
    // Step 3: 在游戏中的任何地方都可以调用 `core.changeHero()` 进行切换；也可以 `core.changeHero(1)` 来切换到某个具体的角色上

    // 是否开启本插件，默认禁用；将此改成 true 将启用本插件。
    var __enable = false;
    if (!__enable) return;

    // 在这里定义全部的新角色属性
    // 请注意，在这里定义的内容不会多角色共用，在切换时会进行恢复。
    // 你也可以自行新增或删除，比如不共用金币则可以加上"money"的初始化，不共用道具则可以加上"items"的初始化，
    // 多角色共用hp的话则删除hp，等等。总之，不共用的属性都在这里进行定义就好。
    var hero1 = {
      floorId: "MT0", // 该角色初始楼层ID；如果共用楼层可以注释此项
      image: "brave.png", // 角色的行走图名称；此项必填不然会报错
      name: "1号角色",
      lv: 1,
      hp: 10000, // 如果HP共用可注释此项
      atk: 1000,
      def: 1000,
      mdef: 0,
      // "money": 0, // 如果要不共用金币则取消此项注释
      // "exp": 0, // 如果要不共用经验则取消此项注释
      loc: { x: 0, y: 0, direction: "up" }, // 该角色初始位置；如果共用位置可注释此项
      items: {
        tools: {}, // 如果共用消耗道具（含钥匙）则可注释此项
        // "constants": {}, // 如果不共用永久道具（如手册）可取消注释此项
        equips: {}, // 如果共用在背包的装备可注释此项
      },
      equipment: [], // 如果共用装备可注释此项；此项和上面的「共用在背包的装备」需要拥有相同状态，不然可能出现问题
    };
    // 也可以类似新增其他角色
    // 新增的角色，各项属性共用与不共用的选择必须和上面完全相同，否则可能出现问题。
    // var hero2 = { ...

    var heroCount = 2; // 包含默认角色在内总共多少个角色，该值需手动修改。

    this.initHeros = function () {
      core.setFlag("hero1", core.clone(hero1)); // 将属性值存到变量中
      // core.setFlag("hero2", core.clone(hero2)); // 更多的角色也存入变量中；每个定义的角色都需要新增一行

      // 检测是否存在装备
      if (hero1.equipment) {
        if (!hero1.items || !hero1.items.equips) {
          alert("多角色插件的equipment和道具中的equips必须拥有相同状态！");
        }
        // 存99号套装为全空
        var saveEquips = core.getFlag("saveEquips", []);
        saveEquips[99] = [];
        core.setFlag("saveEquips", saveEquips);
      } else {
        if (hero1.items && hero1.items.equips) {
          alert("多角色插件的equipment和道具中的equips必须拥有相同状态！");
        }
      }
    };

    // 在游戏开始注入initHeros
    var _startGame_setHard = core.events._startGame_setHard;
    core.events._startGame_setHard = function () {
      _startGame_setHard.call(core.events);
      core.initHeros();
    };

    // 切换角色
    // 可以使用 core.changeHero() 来切换到下一个角色
    // 也可以 core.changeHero(1) 来切换到某个角色（默认角色为0）
    this.changeHero = function (toHeroId) {
      var currHeroId = core.getFlag("heroId", 0); // 获得当前角色ID
      if (toHeroId == null) {
        toHeroId = (currHeroId + 1) % heroCount;
      }
      if (currHeroId == toHeroId) return;

      var saveList = Object.keys(hero1);

      // 保存当前内容
      var toSave = {};
      // 暂时干掉 drawTip 和 音效，避免切装时的提示
      var _drawTip = core.ui.drawTip;
      core.ui.drawTip = function () {};
      var _playSound = core.control.playSound;
      core.control.playSound = function () {};
      // 记录当前录像，因为可能存在换装问题
      core.clearRouteFolding();
      var routeLength = core.status.route.length;
      // 优先判定装备
      if (hero1.equipment) {
        core.items.quickSaveEquip(100 + currHeroId);
        core.items.quickLoadEquip(99);
      }

      saveList.forEach(function (name) {
        if (name == "floorId")
          toSave[name] = core.status.floorId; // 楼层单独设置
        else if (name == "items") {
          toSave.items = core.clone(core.status.hero.items);
          Object.keys(toSave.items).forEach(function (one) {
            if (!hero1.items[one]) delete toSave.items[one];
          });
        } else toSave[name] = core.clone(core.status.hero[name]); // 使用core.clone()来创建新对象
      });

      core.setFlag("hero" + currHeroId, toSave); // 将当前角色信息进行保存
      var data = core.getFlag("hero" + toHeroId); // 获得要切换的角色保存内容

      // 设置角色的属性值
      saveList.forEach(function (name) {
        if (name == "floorId");
        else if (name == "items") {
          Object.keys(core.status.hero.items).forEach(function (one) {
            if (data.items[one])
              core.status.hero.items[one] = core.clone(data.items[one]);
          });
        } else {
          core.status.hero[name] = core.clone(data[name]);
        }
      });
      // 最后装上装备
      if (hero1.equipment) {
        core.items.quickLoadEquip(100 + toHeroId);
      }

      core.ui.drawTip = _drawTip;
      core.control.playSound = _playSound;
      core.status.route = core.status.route.slice(0, routeLength);
      core.control._bindRoutePush();

      // 插入事件：改变角色行走图并进行楼层切换
      var toFloorId = data.floorId || core.status.floorId;
      var toLoc = data.loc || core.status.hero.loc;
      core.insertAction([
        { type: "setHeroIcon", name: data.image || "hero.png" }, // 改变行走图
        // 同层则用changePos，不同层则用changeFloor；这是为了避免共用楼层造成触发eachArrive
        toFloorId != core.status.floorId
          ? {
              type: "changeFloor",
              floorId: toFloorId,
              loc: [toLoc.x, toLoc.y],
              direction: toLoc.direction,
              time: 0, // 可以在这里设置切换时间
            }
          : {
              type: "changePos",
              loc: [toLoc.x, toLoc.y],
              direction: toLoc.direction,
            },
        // 你还可以在这里执行其他事件，比如增加或取消跟随效果
      ]);
      core.setFlag("heroId", toHeroId); // 保存切换到的角色ID
    };
  },
    "heroFourFrames": function () {
    // 样板的勇士/跟随者移动时只使用2、4两帧，观感较差。本插件可以将四帧全用上。

    // 是否启用本插件
    var __enable = true;
    if (!__enable) return;

    ["up", "down", "left", "right"].forEach(function (one) {
      // 指定中间帧动画
      core.material.icons.hero[one].midFoot = 2;
    });

    var heroMoving = function (timestamp) {
      if (core.status.heroMoving <= 0) return;
      if (timestamp - core.animateFrame.moveTime > core.values.moveSpeed) {
        core.animateFrame.leftLeg++;
        core.animateFrame.moveTime = timestamp;
      }
      core.drawHero(
        ["stop", "leftFoot", "midFoot", "rightFoot"][
          core.animateFrame.leftLeg % 4
        ],
        4 * core.status.heroMoving
      );
    };
    core.registerAnimationFrame("heroMoving", true, heroMoving);

    core.events._eventMoveHero_moving = function (step, moveSteps) {
      var curr = moveSteps[0];
      var direction = curr[0],
        x = core.getHeroLoc("x"),
        y = core.getHeroLoc("y");
      // ------ 前进/后退
      var o = direction == "backward" ? -1 : 1;
      if (direction == "forward" || direction == "backward")
        direction = core.getHeroLoc("direction");
      var faceDirection = direction;
      if (direction == "leftup" || direction == "leftdown")
        faceDirection = "left";
      if (direction == "rightup" || direction == "rightdown")
        faceDirection = "right";
      core.setHeroLoc("direction", direction);
      if (curr[1] <= 0) {
        core.setHeroLoc("direction", faceDirection);
        moveSteps.shift();
        return true;
      }
      if (step <= 4) core.drawHero("stop", 4 * o * step);
      else if (step <= 8) core.drawHero("leftFoot", 4 * o * step);
      else if (step <= 12) core.drawHero("midFoot", 4 * o * (step - 8));
      else if (step <= 16) core.drawHero("rightFoot", 4 * o * (step - 8)); // if (step == 8) {
      if (step == 8 || step == 16) {
        core.setHeroLoc("x", x + o * core.utils.scan2[direction].x, true);
        core.setHeroLoc("y", y + o * core.utils.scan2[direction].y, true);
        core.updateFollowers();
        curr[1]--;
        if (curr[1] <= 0) moveSteps.shift();
        core.setHeroLoc("direction", faceDirection);
        return step == 16;
      }
      return false;
    };
  },
    "routeFixing": function () {
    // 是否开启本插件，true 表示启用，false 表示禁用。
    var __enable = true;
    if (!__enable) return;
    /*
		 使用说明：启用本插件后，录像回放时您可以用数字键1或6分别切换到原速或24倍速，
		 暂停播放时按数字键7（电脑按N）可以单步播放。（手机端可以点击难度单词切换出数字键）
		 数字键2-5可以进行录像自助精修，具体描述见下（实际弹窗请求您输入时不要带有任何空格）：
		 
		 up down left right 勇士向某个方向「行走一步或撞击」
		 item:ID 使用某件道具，如 item:bomb 表示使用炸弹
		 unEquip:n 卸掉身上第(n+1)件装备（n从0开始），如 unEquip:1 默认表示卸掉盾牌
		 equip:ID 穿上某件装备，如 equip:sword1 表示装上铁剑
		 saveEquip:n 将身上的当前套装保存到第n套快捷套装（n从0开始）
		 loadEquip:n 快捷换上之前保存好的第n套套装
		 fly:ID 使用楼传飞到某一层，如 fly:MT10 表示飞到主塔10层
		 choices:none 确认框/选择项「超时」（作者未设置超时时间则此项视为缺失）
		 choices:n 确认框/选择项选择第(n+1)项（选择项n从0开始，确认框n为0表示「确定」，1表示「取消」）
		 选择项n为负数时表示选择倒数第 -n 项，如 -1 表示最后一项（V2.8.2起标准全局商店的「离开」项）
		 此项缺失的话，确认框将选择作者指定的默认项（初始光标位置），选择项将弹窗请求补选（后台录像验证中选最后一项，可以复写函数来修改）
		 shop:ID 打开某个全局商店，如 shop:itemShop 表示打开道具商店。因此连载塔千万不要中途修改商店ID！
		 turn 单击勇士（Z键）转身，core.turnHero() 会产生此项，因此通过事件等方式强制让勇士转向应该用 core.setHeroLoc()
		 turn:dir 勇士转向某个方向，dir 可以为 up down left right（此项一般是读取自动存档产生的，属于样板的不良特性，请勿滥用）
		 getNext 轻按获得身边道具，优先获得面前的（面前没有则按上下左右顺序依次获得），身边如果没有道具则此项会被跳过
		 input:none “等待用户操作事件”中超时（作者未设置超时时间则此项会导致报错）
		 input:xxx 可能表示“等待用户操作事件”的一个操作（如按键操作将直接记录 input:keycode ），
		 也可能表示一个“接受用户输入数字”的输入，后者的情况下 xxx 为输入的整数。此项缺失的话前者将直接报错，后者将用0代替（后者现在支持负数了）
		 input2:xxx 可能表示“读取全局存储（core.getGlobal）”读取到的值，也可能表示一个“接受用户输入文本”的输入，
		 两种情况下 xxx 都为 base64 编码。此项缺失的话前者将重新现场读取，后者将用空字符串代替
		 no 走到可穿透的楼梯上不触发楼层切换事件，通过本插件可以让勇士停在旁边没有障碍物的楼梯上哦～
		 move:x:y 尝试瞬移到 [x,y] 点（不改变朝向），该点甚至可以和勇士相邻或者位于视野外
		 key:n 松开键值为n的键，如 key:49 表示松开大键盘数字键1，默认会触发使用破墙镐
		 click:n:px:py 点击自绘状态栏，n为0表示横屏1表示竖屏，[px,py] 为点击的像素坐标
		 random:n 生成了随机数n，即 core.rand2(num) 的返回结果，n必须在 [0,num-1] 范围，num必须为正整数。此项缺失将导致现场重新随机生成数值，可能导致回放结果不一致！
		 作者自定义的新项（一般为js对象，可以先JSON.stringify()再core.encodeBase64()得到纯英文数字的内容）需要用(半角圆括弧)括起来。
		 
		 当您使用数字键5将一些项追加到即将播放内容的开头时，请注意要逆序逐项追加，或者每追加一项就按下数字键7或字母键N单步播放一步。
		 但是【input input2 random choices】是被动读取的，单步播放如果触发了相应的事件就会连续读取，这时候只能提前逐项追加好。
		 电脑端熟练以后推荐直接在控制台操作 core.status.route 和 core.status.replay.toReplay（后者录像回放时才有），配合 core.push() 和 core.unshift() 更加灵活自由哦！
		 */
    core.actions.registerAction(
      "onkeyUp",
      "_sys_onkeyUp_replay",
      function (e) {
        if (this._checkReplaying()) {
          if (e.keyCode == 27)
            // ESCAPE
            core.stopReplay();
          else if (e.keyCode == 90)
            // Z
            core.speedDownReplay();
          else if (e.keyCode == 67)
            // C
            core.speedUpReplay();
          else if (e.keyCode == 32)
            // SPACE
            core.triggerReplay();
          else if (e.keyCode == 65)
            // A
            core.rewindReplay();
          else if (e.keyCode == 83)
            // S
            core.control._replay_SL();
          else if (e.keyCode == 88)
            // X
            core.control._replay_book();
          else if (e.keyCode == 33 || e.keyCode == 34)
            // PgUp/PgDn
            core.control._replay_viewMap();
          else if (e.keyCode == 78)
            // N
            core.stepReplay();
          else if (e.keyCode == 84)
            // T
            core.control._replay_toolbox();
          else if (e.keyCode == 81)
            // Q
            core.control._replay_equipbox();
          else if (e.keyCode == 66)
            // B
            core.ui._drawStatistics();
          else if (e.keyCode == 49 || e.keyCode == 54)
            // 1/6，原速/24倍速播放
            core.setReplaySpeed(e.keyCode == 49 ? 1 : 24);
          else if (e.keyCode > 49 && e.keyCode < 54) {
            // 2-5，录像精修
            switch (e.keyCode - 48) {
              case 2: // pop
                alert(
                  "您已移除已录制内容的最后一项：" + core.status.route.pop()
                );
                break;
              case 3: // push
                core.utils.myprompt(
                  "请输入您要追加到已录制内容末尾的项：",
                  "",
                  function (value) {
                    if (value != null) core.status.route.push(value);
                  }
                );
                break;
              case 4: // shift
                alert(
                  "您已移除即将播放内容的第一项：" +
                    core.status.replay.toReplay.shift()
                );
                break;
              case 5: // unshift
                core.utils.myprompt(
                  "请输入您要追加到即将播放内容开头的项：",
                  "",
                  function (value) {
                    if (value != null)
                      core.status.replay.toReplay.unshift(value);
                  }
                );
            }
          }
          return true;
        }
      },
      100
    );
  },
    "numpad": function () {
    // 样板自带的整数输入事件为白屏弹窗且可以误输入任意非法内容但不支持负整数，观感较差。本插件可以将其美化成仿RM样式，使其支持负整数同时带有音效
    // 另一方面，4399等第三方平台不允许使用包括 core.myprompt() 和 core.myconfirm() 在内的弹窗，因此也需要此插件来替代，不然类似生命魔杖的道具就不好实现了
    // 关于负整数输入，V2.8.2原生支持其录像的压缩和解压，只是默认的 core.events._action_input() 函数将负数取了绝对值，可以只复写下面的 core.isReplaying() 部分来取消

    // 是否启用本插件，false表示禁用，true表示启用
    var __enable = true;
    if (!__enable) return;

    core.events._action_input = function (data, x, y, prefix) {
      // 复写整数输入事件
      if (core.isReplaying()) {
        // 录像回放时，处理方式不变，但增加负整数支持
        core.events.__action_getInput(
          core.replaceText(data.text, prefix),
          false,
          function (value) {
            value = parseInt(value) || 0; // 去掉了取绝对值的步骤
            core.status.route.push("input:" + value);
            core.setFlag("input", value);
            core.doAction();
          }
        );
      } else {
        // 正常游戏中，采用暂停录制的方式然后用事件流循环“绘制-等待-变量操作”三板斧实现（按照13*13适配的）。
        // 您可以自行修改循环内的内容来适配15*15或其他需求，或干脆作为公共事件编辑。
        core.insertAction(
          [
            // 记录当前录像长度，下面的循环结束后裁剪。达到“暂停录制”的效果
            {
              type: "function",
              function:
                "function(){flags['@temp@length']=core.status.route.length}",
            },
            { type: "setValue", name: "flag:input", value: "0" },
            {
              type: "while",
              condition: "true",
              data: [
                {
                  type: "drawBackground",
                  background: "winskin.png",
                  x: 16,
                  y: 16,
                  width: 384,
                  height: 384,
                },
                { type: "drawIcon", id: "X10181", x: 32, y: 288 },
                { type: "drawIcon", id: "X10185", x: 64, y: 288 },
                { type: "drawIcon", id: "X10186", x: 96, y: 288 },
                { type: "drawIcon", id: "X10187", x: 128, y: 288 },
                { type: "drawIcon", id: "X10188", x: 160, y: 288 },
                { type: "drawIcon", id: "X10189", x: 192, y: 288 },
                { type: "drawIcon", id: "X10193", x: 224, y: 288 },
                { type: "drawIcon", id: "X10194", x: 256, y: 288 },
                { type: "drawIcon", id: "X10195", x: 288, y: 288 },
                { type: "drawIcon", id: "X10196", x: 320, y: 288 },
                { type: "drawIcon", id: "X10197", x: 352, y: 288 },
                { type: "drawIcon", id: "X10286", x: 32, y: 352 },
                { type: "drawIcon", id: "X10169", x: 96, y: 352 },
                { type: "drawIcon", id: "X10232", x: 128, y: 352 },
                { type: "drawIcon", id: "X10185", x: 320, y: 352 },
                { type: "drawIcon", id: "X10242", x: 352, y: 352 },
                {
                  type: "fillBoldText",
                  x: 48,
                  y: 256,
                  style: [255, 255, 255, 1],
                  font: "bold 32px Consolas",
                  text: "${flag:input}",
                },
                {
                  type: "fillBoldText",
                  x: 32,
                  y: 48,
                  style: [255, 255, 255, 1],
                  font: "16px Consolas",
                  text: core.replaceText(data.text, prefix),
                },
                {
                  type: "wait",
                  forceChild: true,
                  data: [
                    {
                      case: "keyboard",
                      keycode: "48,49,50,51,52,53,54,55,56,57",
                      action: [
                        // 按下数字键，追加到已输入内容的末尾，但禁止越界。变量：keycode-48就是末位数字
                        { type: "playSound", name: "光标移动" },
                        {
                          type: "if",
                          condition: "(flag:input<0)",
                          true: [
                            {
                              type: "setValue",
                              name: "flag:input",
                              value: "10*flag:input-(flag:keycode-48)",
                            },
                          ],
                          false: [
                            {
                              type: "setValue",
                              name: "flag:input",
                              value: "10*flag:input+(flag:keycode-48)",
                            },
                          ],
                        },
                        {
                          type: "setValue",
                          name: "flag:input",
                          value: "core.clamp(flag:input,-9e15,9e15)",
                        },
                      ],
                    },
                    {
                      case: "keyboard",
                      keycode: "189",
                      action: [
                        // 按下减号键，变更已输入内容的符号
                        { type: "playSound", name: "跳跃" },
                        {
                          type: "setValue",
                          name: "flag:input",
                          value: "-flag:input",
                        },
                      ],
                    },
                    {
                      case: "keyboard",
                      keycode: "8",
                      action: [
                        // 按下退格键，从已输入内容的末尾删除一位
                        { type: "playSound", name: "取消" },
                        {
                          type: "setValue",
                          name: "flag:input",
                          operator: "//=",
                          value: "10",
                        },
                      ],
                    },
                    {
                      case: "keyboard",
                      keycode: "27",
                      action: [
                        // 按下ESC键，清空已输入内容
                        { type: "playSound", name: "读档" },
                        { type: "setValue", name: "flag:input", value: "0" },
                      ],
                    },
                    {
                      case: "keyboard",
                      keycode: "13",
                      action: [
                        // 按下回车键，确定
                        { type: "break", n: 1 },
                      ],
                    },
                    {
                      case: "mouse",
                      px: [32, 63],
                      py: [288, 320],
                      action: [
                        // 点击减号，变号。右边界写63防止和下面重叠
                        { type: "playSound", name: "跳跃" },
                        {
                          type: "setValue",
                          name: "flag:input",
                          value: "-flag:input",
                        },
                      ],
                    },
                    {
                      case: "mouse",
                      px: [64, 384],
                      py: [288, 320],
                      action: [
                        // 点击数字，追加到已输入内容的末尾，但禁止越界。变量：x-2就是末位数字
                        { type: "playSound", name: "光标移动" },
                        {
                          type: "if",
                          condition: "(flag:input<0)",
                          true: [
                            {
                              type: "setValue",
                              name: "flag:input",
                              value: "10*flag:input-(flag:x-2)",
                            },
                          ],
                          false: [
                            {
                              type: "setValue",
                              name: "flag:input",
                              value: "10*flag:input+(flag:x-2)",
                            },
                          ],
                        },
                        {
                          type: "setValue",
                          name: "flag:input",
                          value: "core.clamp(flag:input,-9e15,9e15)",
                        },
                      ],
                    },
                    {
                      case: "mouse",
                      px: [32, 64],
                      py: [352, 384],
                      action: [
                        // 点击左箭头，退格
                        { type: "playSound", name: "取消" },
                        {
                          type: "setValue",
                          name: "flag:input",
                          operator: "//=",
                          value: "10",
                        },
                      ],
                    },
                    {
                      case: "mouse",
                      px: [96, 160],
                      py: [352, 384],
                      action: [
                        // 点击CE，清空
                        { type: "playSound", name: "读档" },
                        { type: "setValue", name: "flag:input", value: "0" },
                      ],
                    },
                    {
                      case: "mouse",
                      px: [320, 384],
                      py: [352, 384],
                      action: [
                        // 点击OK，确定
                        { type: "break", n: 1 },
                      ],
                    },
                  ],
                },
              ],
            },
            { type: "clearMap" },
            // 裁剪录像，只保留'input:n'，然后继续录制
            {
              type: "function",
              function:
                "function(){core.status.route.splice(flags['@temp@length']);core.status.route.push('input:'+core.getFlag('input',0))}",
            },
          ],
          x,
          y
        );
        core.events.doAction();
      }
    };
  },
    "sprites": function () {
    // 基于canvas的sprite化，摘编整理自万宁魔塔
    //
    // ---------------------------------------- 第一部分 js代码 （必装） --------------------------------------- //

    /* ---------------- 用法说明 ---------------- *
     * 1. 创建sprite: var sprite = new Sprite(x, y, w, h, z, reference, name);
     *   其中x y w h为画布的横纵坐标及长宽，reference为参考系，只能填game（相对于游戏画面）和window（相对于窗口）
     *   且当为相对游戏画面时，长宽与坐标将会乘以放缩比例（相当于用createCanvas创建）
     *   z为纵深，表示不同元素之间的覆盖关系，大的覆盖小的
     *   name为自定义名称，可以不填
     * 2. 删除: sprite.destroy();
     * 3. 设置css特效: sprite.setCss(css);
     *   其中css直接填 box-shadow: 0px 0px 10px black;的形式即可，与style标签与css文件内写法相同
     *   对于已设置的特效，如果之后不需要再次设置，可以不填
     * 4. 添加事件监听器: sprite.addEventListener(); 用法与html元素的addEventListener完全一致
     * 5. 移除事件监听器: sprite.removeEventListener(); 用法与html元素的removeEventListener完全一致
     * 6. 属性列表
     *   (1) sprite.x | sprite.y | sprite.width | sprite.height | sprite.zIndex | sprite.reference 顾名思义
     *   (2) sprite.canvas 该sprite的画布
     *   (3) sprite.context 该画布的CanvasRenderingContext2d对象，即样板中常见的ctx
     *   (4) sprite.count 不要改这个玩意
     * 7. 使用样板api进行绘制
     *   示例：
     *   var ctx = sprite.context;
     *   core.fillText(ctx, 'xxx', 100, 100);
     *   core.fillRect(ctx, 0, 0, 50, 50);
     *   当然也可以使用原生js
     *   ctx.moveTo(0, 0);
     *   ctx.bezierCurveTo(50, 50, 100, 0, 100, 50);
     *   ctx.stroke();
     * ---------------- 用法说明 ---------------- */

    var count = 0;

    /** 创建一个sprite画布
     * @param {number} x
     * @param {number} y
     * @param {number} w
     * @param {number} h
     * @param {number} z
     * @param {'game' | 'window'} reference 参考系，游戏画面或者窗口
     * @param {string} name 可选，sprite的名称，方便通过core.dymCanvas获取
     */
    function Sprite(x, y, w, h, z, reference, name) {
      this.x = x;
      this.y = y;
      this.width = w;
      this.height = h;
      this.zIndex = z;
      this.reference = reference;
      this.canvas = null;
      this.context = null;
      this.count = 0;
      this.name = name || "_sprite_" + count;
      this.style = null;
      /** 初始化 */
      this.init = function () {
        if (reference === "window") {
          var canvas = document.createElement("canvas");
          this.canvas = canvas;
          this.context = canvas.getContext("2d");
          canvas.width = w;
          canvas.height = h;
          canvas.style.width = w + "px";
          canvas.style.height = h + "px";
          canvas.style.position = "absolute";
          canvas.style.top = y + "px";
          canvas.style.left = x + "px";
          canvas.style.zIndex = z.toString();
          document.body.appendChild(canvas);
          this.style = canvas.style;
        } else {
          this.context = core.createCanvas(
            this.name || "_sprite_" + count,
            x,
            y,
            w,
            h,
            z
          );
          this.canvas = this.context.canvas;
          this.canvas.style.pointerEvents = "auto";
          this.style = this.canvas.style;
        }
        this.count = count;
        count++;
      };
      this.init();

      /** 设置css特效
       * @param {string} css
       */
      this.setCss = function (css) {
        css = css.replace("\n", ";").replace(";;", ";");
        var effects = css.split(";");
        var self = this;
        effects.forEach(function (v) {
          var content = v.split(":");
          var name = content[0];
          var value = content[1];
          name = name
            .trim()
            .split("-")
            .reduce(function (pre, curr, i, a) {
              if (i === 0 && curr !== "") return curr;
              if (a[0] === "" && i === 1) return curr;
              return pre + curr.toUpperCase()[0] + curr.slice(1);
            }, "");
          var canvas = self.canvas;
          if (name in canvas.style) canvas.style[name] = value;
        });
        return this;
      };

      /**
       * 移动sprite
       * @param {boolean} isDelta 是否是相对位置，如果是，那么sprite会相对于原先的位置进行移动
       */
      this.move = function (x, y, isDelta) {
        if (x !== undefined && x !== null) this.x = x;
        if (y !== undefined && y !== null) this.y = y;
        if (this.reference === "window") {
          var ele = this.canvas;
          ele.style.left =
            x + (isDelta ? parseFloat(ele.style.left) : 0) + "px";
          ele.style.top = y + (isDelta ? parseFloat(ele.style.top) : 0) + "px";
        } else core.relocateCanvas(this.context, x, y, isDelta);
        return this;
      };

      /**
       * 重新设置sprite的大小
       * @param {boolean} styleOnly 是否只修改css效果，如果是，那么将会不高清，如果不是，那么会清空画布
       */
      this.resize = function (w, h, styleOnly) {
        if (w !== undefined && w !== null) this.w = w;
        if (h !== undefined && h !== null) this.h = h;
        if (reference === "window") {
          var ele = this.canvas;
          ele.style.width = w + "px";
          ele.style.height = h + "px";
          if (!styleOnly) {
            ele.width = w;
            ele.height = h;
          }
        } else core.resizeCanvas(this.context, w, h, styleOnly);
        return this;
      };

      /**
       * 旋转画布
       */
      this.rotate = function (angle, cx, cy) {
        if (this.reference === "window") {
          var left = this.x;
          var top = this.y;
          this.canvas.style.transformOrigin =
            cx - left + "px " + (cy - top) + "px";
          if (angle === 0) {
            canvas.style.transform = "";
          } else {
            canvas.style.transform = "rotate(" + angle + "deg)";
          }
        } else {
          core.rotateCanvas(this.context, angle, cx, cy);
        }
        return this;
      };

      /**
       * 清除sprite
       */
      this.clear = function (x, y, w, h) {
        if (this.reference === "window") {
          this.context.clearRect(x, y, w, h);
        } else {
          core.clearMap(this.context, x, y, w, h);
        }
        return this;
      };

      /** 删除 */
      this.destroy = function () {
        if (this.reference === "window") {
          if (this.canvas) document.body.removeChild(this.canvas);
        } else {
          core.deleteCanvas(this.name || "_sprite_" + this.count);
        }
      };

      /** 添加事件监听器 */
      this.addEventListener = function () {
        this.canvas.addEventListener.apply(this.canvas, arguments);
      };

      /** 移除事件监听器 */
      this.removeEventListener = function () {
        this.canvas.removeEventListener.apply(this.canvas, arguments);
      };
    }

    window.Sprite = Sprite;
  },
    "hotReload": function () {
    /* ---------- 功能说明 ---------- *

	1. 当 libs/ main.js index.html 中的任意一个文件被更改后，会自动刷新塔的页面
	2. 修改楼层文件后自动在塔的页面上显示出来，不需要刷新
	3. 修改脚本编辑或插件编写后也能自动更新更改的插件或脚本，但不保证不会出问题（一般都不会有问题的
	4. 修改图块属性、怪物属性等后会自动更新
	5. 当全塔属性被修改时，会自动刷新塔的页面
	6. 样板的 styles.css 被修改后也可以直接显示，不需要刷新
	7. 其余内容修改后不会自动更新也不会刷新

	/* ---------- 使用方式 ---------- *

	1. 前往 https://nodejs.org/en/ 下载node.js的LTS版本（点左边那个绿色按钮）并安装
	2. 将该插件复制到插件编写中
	3. 在造塔群的群文件-魔塔样板·改中找到server.js，下载并放到塔的根目录（与启动服务同一级）
	4. 在该目录下按下shift+鼠标右键（win11只按右键即可），选择在终端打开或在powershell打开
	5. 运行node server.js即可

	*/

    if (main.mode !== "play" || main.replayChecking) return;

    /**
     * 发送请求
     * @param {string} url
     * @param {string} type
     * @param {string} data
     * @returns {Promise<string>}
     */
    async function post(url, type, data) {
      const xhr = new XMLHttpRequest();
      xhr.open(type, url);
      xhr.send(data);
      const res = await new Promise((res) => {
        xhr.onload = (e) => {
          if (xhr.status !== 200) {
            console.error(`hot reload: http ${xhr.status}`);
            res("@error");
          } else res("success");
        };
        xhr.onerror = (e) => {
          res("@error");
          console.error(`hot reload: error on connection`);
        };
      });
      if (res === "success") return xhr.response;
      else return "@error";
    }

    /**
     * 热重载css
     * @param {string} data
     */
    function reloadCss(data) {
      const all = Array.from(document.getElementsByTagName("link"));
      all.forEach((v) => {
        if (v.rel !== "stylesheet") return;
        if (v.href === `http://127.0.0.1:3000/${data}`) {
          v.remove();
          const link = document.createElement("link");
          link.rel = "stylesheet";
          link.type = "text/css";
          link.href = data;
          document.head.appendChild(link);
          console.log(`css hot reload: ${data}`);
        }
      });
    }

    /**
     * 热重载楼层
     * @param {string} data
     */
    async function reloadFloor(data) {
      // 首先重新加载main.floors对应的楼层
      await import(`/project/floors/${data}.js?v=${Date.now()}`);
      // 然后写入core.floors并解析
      core.floors[data] = main.floors[data];
      const floor = core.loadFloor(data);
      if (core.isPlaying()) {
        core.status.maps[data] = floor;
        delete core.status.mapBlockObjs[data];
        core.extractBlocks(data);
        if (data === core.status.floorId) {
          core.drawMap(data);
          core.setWeather(
            core.animateFrame.weather.type,
            core.animateFrame.weather.level
          );
        }
        core.updateStatusBar(true, true);
      }
      console.log(`floor hot reload: ${data}`);
    }

    /**
     * 热重载脚本编辑及插件编写
     * @param {string} data
     */
    async function reloadScript(data) {
      if (data === "plugins") {
        // 插件编写比较好办
        const before = plugins_bb40132b_638b_4a9f_b028_d3fe47acc8d1;
        // 这里不能用动态导入，因为动态导入会变成模块，变量就不是全局的了
        const script = document.createElement("script");
        script.src = `/project/plugins.js?v=${Date.now()}`;
        document.body.appendChild(script);
        await new Promise((res) => {
          script.onload = () => res("success");
        });
        const after = plugins_bb40132b_638b_4a9f_b028_d3fe47acc8d1;
        // 找到差异的函数
        for (const id in before) {
          const fn = before[id];
          if (typeof fn !== "function") continue;
          if (fn.toString() !== after[id]?.toString()) {
            try {
              core.plugin[id] = after[id];
              core.plugin[id].call(core.plugin);
              core.updateStatusBar(true, true);
              console.log(`plugin hot reload: ${id}`);
            } catch (e) {
              console.error(e);
            }
          }
        }
      } else if (data === "functions") {
        // 脚本编辑略微麻烦点
        const before = functions_d6ad677b_427a_4623_b50f_a445a3b0ef8a;
        // 这里不能用动态导入，因为动态导入会变成模块，变量就不是全局的了
        const script = document.createElement("script");
        script.src = `/project/functions.js?v=${Date.now()}`;
        document.body.appendChild(script);
        await new Promise((res) => {
          script.onload = () => res("success");
        });
        const after = functions_d6ad677b_427a_4623_b50f_a445a3b0ef8a;
        // 找到差异的函数
        for (const mod in before) {
          const fns = before[mod];
          for (const id in fns) {
            const fn = fns[id];
            if (typeof fn !== "function" || id === "hasSpecial") continue;
            const now = after[mod][id];
            if (fn.toString() !== now.toString()) {
              try {
                if (mod === "events") {
                  core.events.eventdata[id] = now;
                } else if (mod === "enemys") {
                  core.enemys.enemydata[id] = now;
                } else if (mod === "actions") {
                  core.actions.actionsdata[id] = now;
                } else if (mod === "control") {
                  core.control.controldata[id] = now;
                } else if (mod === "ui") {
                  core.ui.uidata[id] = now;
                }
                core.updateStatusBar(true, true);
                console.log(`function hot reload: ${mod}.${id}`);
              } catch (e) {
                console.error(e);
              }
            }
          }
        }
      }
    }

    /**
     * 属性热重载，包括全塔属性等
     * @param {string} data
     */
    async function reloadData(data) {
      const script = document.createElement("script");
      script.src = `/project/${data}.js?v=${Date.now()}`;
      document.body.appendChild(script);
      await new Promise((res) => {
        script.onload = () => res("success");
      });

      let after;
      if (data === "data") after = data_a1e2fb4a_e986_4524_b0da_9b7ba7c0874d;
      if (data === "enemys")
        after = enemys_fcae963b_31c9_42b4_b48c_bb48d09f3f80;
      if (data === "icons") after = icons_4665ee12_3a1f_44a4_bea3_0fccba634dc1;
      if (data === "items") after = items_296f5d02_12fd_4166_a7c1_b5e830c9ee3a;
      if (data === "maps") after = maps_90f36752_8815_4be8_b32b_d7fad1d0542e;
      if (data === "events")
        after = events_c12a15a8_c380_4b28_8144_256cba95f760;

      if (data === "enemys") {
        core.enemys.enemys = after;
        for (var enemyId in after) {
          core.enemys.enemys[enemyId].id = enemyId;
        }
        core.material.enemys = core.getEnemys();
      } else if (data === "icons") {
        core.icons.icons = after;
        core.material.icons = core.getIcons();
      } else if (data === "items") {
        core.items.items = after;
        for (var itemId in after) {
          core.items.items[itemId].id = itemId;
        }
        core.material.items = core.getItems();
      } else if (data === "maps") {
        core.maps.blocksInfo = after;
        core.status.mapBlockObjs = {};
        core.status.number2block = {};
        Object.values(core.status.maps).forEach((v) => delete v.blocks);
        core.extractBlocks();
        core.setWeather(
          core.animateFrame.weather.type,
          core.animateFrame.weather.level
        );
        core.drawMap();
      } else if (data === "events") {
        core.events.commonEvent = after.commonEvent;
      } else if (data === "data") {
        location.reload();
      }
      core.updateStatusBar(true, true);
      console.log(`data hot reload: ${data}`);
    }

    // 初始化
    (async function () {
      const data = await post("/reload", "POST", "test");
      if (data === "@error") {
        console.log(`未检测到node服务，热重载插件将无法使用`);
      } else {
        console.log(`热重载插件加载成功`);
        // reload
        setInterval(async () => {
          const res = await post("/reload", "POST");
          if (res === "@error") return;
          if (res === "true") location.reload();
          else return;
        }, 1000);

        // hot reload
        setInterval(async () => {
          const res = await post("/hotReload", "POST");
          const data = res.split("@@");
          data.forEach((v) => {
            if (v === "") return;
            const [type, file] = v.split(":");
            if (type === "css") reloadCss(file);
            if (type === "data") reloadData(file);
            if (type === "floor") reloadFloor(file);
            if (type === "script") reloadScript(file);
          });
        }, 1000);
      }
    })();
  },
    "statusBar2": function () {
	//老版状态栏ui绘制，请作者在添加道具等操作时一并将新版状态栏一起添加，以供玩家自行选择ui，或通过提示让玩家选择作者想使用的ui。
	if (core.getLocalStorage("newStatusBar")) return
	main.dom.floorMsgGroup.style.display = 'none';
	main.dom.statusBar.style.display = 'none';
	main.dom.toolBar.style.display = 'none';
	const GAMEVIEW_WIDTH = 1920 * 1.03; //横屏画面宽度
	const GAMEVIEW_HEIGHT = 1266 * 1.03; //横屏画面高度

	const GAMEVIEW_WIDTH_VERTICAL = 1200 * 1.03; //竖屏画面宽度
	const GAMEVIEW_HEIGHT_VERTICAL = 1986 * 1.03; //竖屏画面高度

	const BAR_WIDTH = 140 * 3; //横屏左侧额外距离（即边栏宽度）
	const BAR_HEIGHT_VERTICAL = 145 * 3; //竖屏上侧额外距离（即边栏高度）
	const BORDER_WIDTH = 30 * 3; //游戏画面左侧偏移距离
	const BORDER_HEIGHT = 27 * 3; //游戏画面上侧偏移距离



	const outerBackground = document.createElement("canvas"); //背景画布设置
	outerBackground.style.position = "absolute";
	outerBackground.style.zIndex = 5;
	outerBackground.id = "outerBackground";
	main.dom.outerBackground = outerBackground;
	main.dom.startPanel.insertAdjacentElement("afterend", outerBackground);

	const outerUI = document.createElement("canvas"); //额外ui画布设置（状态栏所有绘制、点击都在额外ui上）
	outerUI.style.position = "absolute";
	outerUI.style.zIndex = 165;
	outerUI.id = "outerUI";
	main.dom.outerUI = outerUI;
	outerBackground.insertAdjacentElement("afterend", outerUI);
	setTimeout(function () {
		// Should be executed immediately after init()
		main.canvas.outerUI = outerUI.getContext("2d");
	});
	outerUI.onclick = function (e) {
		try {
			e.preventDefault();
			if (!core.isPlaying()) return false;
			const left = core.dom.gameGroup.offsetLeft;
			const top = core.dom.gameGroup.offsetTop;
			const px = Math.floor((e.clientX - left) / core.domStyle.scale),
				py = Math.floor((e.clientY - top) / core.domStyle.scale);
			core.ui.statusBar.onclick(px, py);

		} catch (ee) {
			main.log(ee);
		}
	};

	const _resize_gameGroup = function (obj) {
		//游戏画面自适应调节
		const gameGroup = core.dom.gameGroup;
		gameGroup.style.width = obj.totalWidth + "px";
		gameGroup.style.height = obj.totalHeight + "px";
		gameGroup.style.left = (obj.clientWidth - obj.totalWidth) / 2 + "px";
		gameGroup.style.top = (obj.clientHeight - obj.totalHeight) / 2 + "px";
		//floorMsgGroup为切换楼层中生效，显示时间可通过‘全塔属性’——‘切换楼层时间’或游戏内设置调整
		//显示内容为游戏名/版本号/楼层名
		// floorMsgGroup
		var floorMsgGroup = core.dom.floorMsgGroup;
		var globalAttribute =
			core.status.globalAttribute || core.initStatus.globalAttribute;
		floorMsgGroup.style = globalAttribute.floorChangingStyle;
		floorMsgGroup.style.height = floorMsgGroup.style.width =
			GAMEVIEW_HEIGHT / 3 * core.domStyle.scale + "px";
		floorMsgGroup.style.fontSize = 16 * core.domStyle.scale + "px";

		if (core.domStyle.isVertical) {
			floorMsgGroup.style.left = "0px";
			floorMsgGroup.style.top =
				((GAMEVIEW_HEIGHT_VERTICAL / 3 - GAMEVIEW_WIDTH_VERTICAL / 3) *
					core.domStyle.scale) /
				2 +
				"px";
		} else {
			floorMsgGroup.style.left =
				((GAMEVIEW_WIDTH / 3 - GAMEVIEW_HEIGHT / 3) * core.domStyle.scale) / 2 + "px";
			floorMsgGroup.style.top = "0px";
		}
		core.dom.musicBtn.style.right =
			(obj.clientWidth - obj.totalWidth) / 2 + "px";
		core.dom.musicBtn.style.bottom =
			(obj.clientHeight - obj.totalHeight) / 2 - 9 + "px";
		let startBackground = core.domStyle.isVertical ?
			main.styles.startVerticalBackground || main.styles.startBackground :
			main.styles.startBackground;
		if (main.dom.startBackground.getAttribute("__src__") != startBackground) {
			main.dom.startBackground.setAttribute("__src__", startBackground);
			main.dom.startBackground.src = startBackground;
		}
	};
	const _resize_canvas = function (obj) {
		//自适应画布
		main.dom.outerBackground.style.width = obj.totalWidth + "px";
		main.dom.outerBackground.style.height = obj.totalHeight + "px";
		main.dom.outerUI.style.width = obj.totalWidth + "px";
		main.dom.outerUI.style.height = obj.totalHeight + "px";

		const innerSize = obj.canvasWidth * core.domStyle.scale + "px";
		for (let i = 0; i < core.dom.gameCanvas.length; ++i)
			core.dom.gameCanvas[i].style.width = core.dom.gameCanvas[
				i
			].style.height = innerSize;
		core.dom.gif.style.width = core.dom.gif.style.height = innerSize;
		core.dom.gif2.style.width = core.dom.gif2.style.height = innerSize;

		core.dom.gameDraw.style.width = core.dom.gameDraw.style.height =
			innerSize;
		core.dom.gameDraw.style.top =
			obj.gameDrawBox.top * core.domStyle.scale + "px";
		core.dom.gameDraw.style.left =
			obj.gameDrawBox.left * core.domStyle.scale + "px";
		// resize bigmap
		core.bigmap.canvas.forEach(function (cn) {
			const ratio = core.canvas[cn].canvas.hasAttribute("isHD") ?
				core.domStyle.ratio :
				1;
			core.canvas[cn].canvas.style.width =
				(innerSize / ratio) * core.domStyle.scale + "px";
			core.canvas[cn].canvas.style.height =
				(innerSize / ratio) * core.domStyle.scale + "px";
		});
		// resize dynamic canvas
		for (const name in core.dymCanvas) {
			const ctx = core.dymCanvas[name],
				canvas = ctx.canvas;
			const ratio = canvas.hasAttribute("isHD") ? core.domStyle.ratio : 1;
			canvas.style.width = (innerSize / ratio) * core.domStyle.scale + "px";
			canvas.style.height = (innerSize / ratio) * core.domStyle.scale + "px";
			canvas.style.left =
				parseFloat(canvas.getAttribute("_left")) * core.domStyle.scale + "px";
			canvas.style.top =
				parseFloat(canvas.getAttribute("_top")) * core.domStyle.scale + "px";
		}
		// resize next
		main.dom.next.style.width = main.dom.next.style.height =
			5 * core.domStyle.scale + "px";
		main.dom.next.style.borderBottomWidth =
			main.dom.next.style.borderRightWidth = 4 * core.domStyle.scale + "px";
	};

	core.control.resize = function () {
		//自适应，可实现横竖屏切换
		if (main.mode == "editor") return;

		const clientWidth = main.dom.body.clientWidth,
			clientHeight = main.dom.body.clientHeight;
		const canvasWidth = core.__PIXELS__;

		const isVertical = clientHeight > clientWidth;
		core.domStyle.isVertical = isVertical;

		const totalWidth = isVertical ? GAMEVIEW_WIDTH_VERTICAL / 3 * 1.15 : GAMEVIEW_WIDTH / 3 * 1.15,
			totalHeight = isVertical ? GAMEVIEW_HEIGHT_VERTICAL / 3 * 1.15 : GAMEVIEW_HEIGHT / 3 * 1.15;

		const maxRatio = Math.min(
			clientWidth / totalWidth,
			clientHeight / totalHeight
		);

		core.domStyle.availableScale = [];
		[1, 1.25, 1.5, 1.75, 2].forEach(function (v) {
			if (maxRatio >= v) {
				core.domStyle.availableScale.push(v);
			}
		});

		if (core.domStyle.availableScale.indexOf(core.domStyle.scale) < 0) {
			core.domStyle.scale = Math.min(1, maxRatio);
		} else if (
			core.getLocalStorage("scale") == null &&
			core.domStyle.availableScale.length >= 2
		) {
			core.domStyle.scale =
				core.domStyle.availableScale[core.domStyle.availableScale.length - 2];
			core.setLocalStorage("scale", core.domStyle.scale);
		}

		const totalWidthScaled = totalWidth * core.domStyle.scale,
			totalHeightScaled = totalHeight * core.domStyle.scale;

		const gameDrawBox = isVertical ? {
			left: BORDER_WIDTH / 3,
			top: BAR_HEIGHT_VERTICAL / 3 + BORDER_HEIGHT / 3,
		} : { left: BAR_WIDTH / 3 + BORDER_WIDTH / 3, top: BORDER_HEIGHT / 3 };

		const obj = {
			clientWidth: clientWidth,
			clientHeight: clientHeight,
			canvasWidth: canvasWidth,
			totalWidth: totalWidthScaled,
			totalHeight: totalHeightScaled,
			gameDrawBox: gameDrawBox,
			globalAttribute: core.status.globalAttribute || core.initStatus.globalAttribute,
		};

		_resize_gameGroup(obj);
		_resize_canvas(obj);
		if (!core.domStyle.isVertical) { //横屏
			outerBackground.width = 1920;
			outerBackground.height = 1266;
		} else { //竖屏
			outerBackground.width = 1200;
			outerBackground.height = 1986;
		}
		if (!core.domStyle.isVertical) { //横屏
			outerUI.width = 1920;
			outerUI.height = 1266;
		} else { //竖屏
			outerUI.width = 1200;
			outerUI.height = 1986;
		}
		if (core.status.automaticRoute == null) core.status.automaticRoute = {};
		core.updateStatusBar();
	};


	function statusBar() { //道具列表
		this.itemMx = [ //道具栏1
			["book", "wand", "snow", "fly"],
			["knife", "superPotion", "pickaxe", "bomb"],
			["downFly", "centerFly", "upFly", "bigKey"],
			["cross", "coin", "earthquake", "none"],
		];

		this.itemMxp1 = [ //此处是额外的道具栏2
			["none", "none", "none"],
			["CP1", "shenxuan", "jicheng"],
			["jianban", "paoying", "shengfang"],
		];
		this.itemMxp2 = [
			["none", "none", "none"],
			["CP2", "hongcha", "shenqiang"],
			["zb", "jj", "xuejing"],
		];

		this.itemMx2 = [ //默认道具栏2
			["none", "none", "none"],
			["none", "none", "none"],
			["none", "none", "none"],
		];
	}
	statusBar.prototype.init = function () {

		if (!core.domStyle.isVertical) { //横屏背景图
			var bgx = 1920,
				bgy = 1200;
			var bg = core.material.images.images["statusBackground.jpg"];
		} else { //竖屏背景图
			var bgx = 1200,
				bgy = 1920;
			var bg = core.material.images.images["statusBackground3.jpg"];
		}
		var bgctx = document.getElementById("outerBackground").getContext("2d");
		bgctx.drawImage(bg, 0, 0, bgx, bgy);
		bgctx.fillStyle = "#484b6c";
		bgctx.fillRect(0, bgy, bgx, 66);
		core.setTextAlign('outerUI', 'center');


		this.toolbarAction = [
			[
				function () { core.doSL("autoSave", "load") },
				main.core.openQuickShop,
				function () { core.doSL("autoSave", "reload") }

			],
			[main.core.save, main.core.load, main.core.openSettings],
		];
		this.replayAction = [
			[core.triggerReplay, core.stopReplay, core.rewindReplay],
			[core.speedDownReplay, core.speedUpReplay, function () { core.control._replay_SL() }],
		];

	}
	statusBar.prototype.update = function () { //更新状态栏
		if (!core.isPlaying) return;
		statusBar.prototype.init();
		this._update_props();
		this._update_items();
		this._update_equips();
		this._update_keys();
		this._update_toolBox();
		this._update_infoWindow();
	}
	// 更新属性
	statusBar.prototype._update_props = function (updatedFloorTitle) {
		var exatk = 0;
		var exdef = 0;
		var tc = "#E1E1E1";
		//////额外属性设置的例子
		/*if (core.getFlag('nowWeapon', 0) == "jicheng") //此处exatk代表攻击力上升量，exdef代表防御力上升量，可为负。在此输入你使用技能让玩家攻防转换的值，将自动显示（+40）（-40）之类的提示
				exatk += 40;
			if (core.getFlag('shourenskill', 0) == 1)
				exdef += 50;*/
		if (!core.domStyle.isVertical) { //横屏模式
			core.clearMap("outerUI", 30, 120, 315, 630);
			core.setFont("outerUI", '48px beeB');
			// 设置楼层名
			if (!updatedFloorTitle && core.status.floorId) {
				updatedFloorTitle = core.status.maps[core.status.floorId].title;
			}
			if (updatedFloorTitle) {
				core.fillText("outerUI", updatedFloorTitle, 186, 183, tc);
			}
			core.setFont("outerUI", '48px num');
			var statusList = ['hp', 'atk', 'def', 'money'];
			var curh = 279;
			core.setTextAlign('outerUI', 'right');
			core.fillText("outerUI", core.formatBigNumber(core.getFlag("hp", core.getRealStatus('hp'))), 330, 279, tc);
			if (exatk > 0) {
				core.fillText("outerUI", core.getRealStatus('atk') + exatk, 330, 351, tc);
				core.setFont("outerUI", '26px num');
				core.setTextAlign('outerUI', 'left');
				core.fillText("outerUI", "（+" + exatk + "）", 131, 361, '#66E166');
				core.setFont("outerUI", '48px num');
				core.setTextAlign('outerUI', 'right');
			} else if (exatk < 0) {
				core.fillText("outerUI", core.getRealStatus('atk') + exatk, 330, 351, tc);
				core.setFont("outerUI", '26px num');
				core.setTextAlign('outerUI', 'left');
				core.fillText("outerUI", "（" + exatk + "）", 131, 361, '#E16666');
				core.setFont("outerUI", '48px num');
				core.setTextAlign('outerUI', 'right');
			} else {
				core.fillText("outerUI", core.getRealStatus('atk'), 330, 351, tc);
			}
			if (exdef > 0) {
				core.fillText("outerUI", core.getRealStatus('def') + exdef, 330, 423, tc);
				core.setFont("outerUI", '26px num');
				core.setTextAlign('outerUI', 'left');
				core.fillText("outerUI", "（+" + exdef + "）", 131, 433, '#66E166');
				core.setFont("outerUI", '48px num');
				core.setTextAlign('outerUI', 'right');
			} else if (exdef < 0) {
				core.fillText("outerUI", core.getRealStatus('def') + exdef, 330, 423, tc);
				core.setFont("outerUI", '26px num');
				core.setTextAlign('outerUI', 'left');
				core.fillText("outerUI", "（" + exdef + "）", 131, 433, '#E16666');
				core.setFont("outerUI", '48px num');
				core.setTextAlign('outerUI', 'right');
			} else {
				core.fillText("outerUI", core.getRealStatus('def'), 330, 423, tc);
			}

			core.fillText("outerUI", core.getRealStatus('money'), 330, 495, tc);
			core.setFont("outerUI", '36px beeB');
			//core.fillText("outerUI", "红雾弥漫", 342, 559, tc); //此处为物品栏状态额外显示
			core.setFont("outerUI", '48px beeB');
			//core.fillText("outerUI", (core.enemys.getEnemyInfo("darkKnight").atk + "+" + core.material.enemys.darkKnight.atk), 110, 69, tc);
			core.setTextAlign('outerUI', 'center');
		} else { //竖屏模式
			core.clearMap("outerUI", 30, 30, 340, 365);
			//core.fillRect("outerUI", 30, 30, 340, 365, "#000000");
			core.clearMap("outerUI", 420, 330, 360, 65);
			//core.fillRect("outerUI", 420, 330, 360, 65, "#000000");

			core.setFont("outerUI", '48px beeB');
			// 设置楼层名
			if (!updatedFloorTitle && core.status.floorId) {
				updatedFloorTitle = core.status.maps[core.status.floorId].title;
			}
			if (updatedFloorTitle) {
				core.fillText("outerUI", updatedFloorTitle, 600, 380, tc);
			}
			core.setFont("outerUI", '48px num');
			var statusList = ['hp', 'atk', 'def', 'money'];
			var curh = 130,
				shux = 340;
			core.setTextAlign('outerUI', 'right');
			core.fillText("outerUI", core.formatBigNumber(core.getFlag("hp", core.getRealStatus('hp'))), shux, curh, tc);
			if (exatk > 0) {
				core.fillText("outerUI", core.getRealStatus('atk') + exatk, shux, curh + 72, tc);
				core.setFont("outerUI", '26px num');
				core.setTextAlign('outerUI', 'left');
				core.fillText("outerUI", "(+" + exatk + ")", 131, curh + 66, '#66E166');
				core.setFont("outerUI", '48px num');
				core.setTextAlign('outerUI', 'right');
			} else if (exatk < 0) {
				core.fillText("outerUI", core.getRealStatus('atk') + exatk, shux, curh + 72, tc);
				core.setFont("outerUI", '26px num');
				core.setTextAlign('outerUI', 'left');
				core.fillText("outerUI", "(" + exatk + ")", 131, curh + 66, '#E16666');
				core.setFont("outerUI", '48px num');
				core.setTextAlign('outerUI', 'right');
			} else {
				core.fillText("outerUI", core.getRealStatus('atk'), shux, curh + 72, tc);
			}
			if (exdef > 0) {
				core.fillText("outerUI", core.getRealStatus('def') + exdef, shux, curh + 144, tc);
				core.setFont("outerUI", '26px num');
				core.setTextAlign('outerUI', 'left');
				core.fillText("outerUI", "(+" + exdef + ")", 131, curh + 138, '#66E166');
				core.setFont("outerUI", '48px num');
				core.setTextAlign('outerUI', 'right');
			} else if (exdef < 0) {
				core.fillText("outerUI", core.getRealStatus('def') + exdef, shux, curh + 144, tc);
				core.setFont("outerUI", '26px num');
				core.setTextAlign('outerUI', 'left');
				core.fillText("outerUI", "(" + exdef + ")", 131, curh + 138, '#E16666');
				core.setFont("outerUI", '48px num');
				core.setTextAlign('outerUI', 'right');
			} else {
				core.fillText("outerUI", core.getRealStatus('def'), shux, curh + 144, tc);
			}

			core.fillText("outerUI", core.getRealStatus('money'), shux, curh + 216, tc);
			core.setFont("outerUI", '36px beeB');
			core.setTextAlign('outerUI', 'center');
			core.clearMap(500, 1520, 230, 60);
			//core.fillRect("outerUI", 500, 1520, 230, 60, "#000");
			//core.fillText("outerUI", "红雾弥漫", 610, 1560, tc);//此处为物品栏状态额外显示
			core.setTextAlign('outerUI', 'right');
			core.setFont("outerUI", '48px beeB');
			//core.fillText("outerUI", (core.enemys.getEnemyInfo("darkKnight").atk + "+" + core.material.enemys.darkKnight.atk), 110, 69, tc);
			core.setTextAlign('outerUI', 'center');
		}
	}
	//更新道具栏
	statusBar.prototype._update_items = function () {
		let P2 = core.getFlag('2P', 0);
		let sp = function (atk) {
			return Math.round(10 * atk + 5 * core.getRealStatus('def'));
		};
		var skill01 = this.itemMx2;
		switch (core.getFlag('Player', 0)) { //此处判定条件来显示哪个物品栏2，此处修改只会影响图标，使用效果下面的onClick也要改
		case 1:
			skill01 = this.itemMxp1;
			break;
		case 2:
			skill01 = this.itemMxp2;
			break;
		default:
			skill01 = this.itemMx2;
			break;
		}
		if (!core.domStyle.isVertical) { //横屏模式
			core.clearMap("outerUI", 30, 630, 315, 288);
			for (var i = 0; i < this.itemMx.length; i++) {
				for (var j = 0; j < this.itemMx[i].length; j++) {
					var item = this.itemMx[i][j];
					if (core.hasItem(item)) {
						var icon = core.material.icons.items[item],
							image = core.material.images.items;
						var posx = 42 + j * 74.25,
							posy = 573 + i * 72;
						core.drawImage('outerUI', image, 0, 32 * icon, 32, 32, posx, posy, 72, 72);
						if (item == "superPotion") {
							core.fillBoldText('outerUI', sp(core.getRealStatus('atk')), posx + 35, posy + 28, '#FFFFFF', '#000000', "bold 24px cjk", 52);
						}
						if (item == "centerFly" || item == "hammer" || item == "pickaxe" || item == "bigKey" || item == "superPotion")
							core.fillBoldText('outerUI', core.itemCount(item), posx + 59.25, posy + 68, '#FFFFFF', '#000000', "bold 36px cjk");
						// if (this.selectId == item)
						//     core.strokeRect('outerUI', posx + 17, posy - 4, 40, 40, '#FFD700');
					}
				}
			}
			core.clearMap("outerUI", 30, 918, 330, 288);

			for (var i = 0; i < skill01.length; i++) {
				for (var j = 0; j < skill01[i].length; j++) {
					var item2 = skill01[i][j];
					if (core.hasItem(item2)) {
						var icon = core.material.icons.items[item2],
							image = core.material.images.items;
						var posx = 39 + j * 99,
							posy = 858 + i * 96;
						core.drawImage('outerUI', image, 0, 32 * icon, 32, 32, posx, posy, 96, 96);

						if (item2 == "hongcha") //此处显示道具栏2道具数量，此为范例
							core.fillBoldText('outerUI', core.itemCount(item2), posx + 75, posy + 84, '#FFFFFF', '#000000', "bold 36px cjk");
						// if (this.selectId == item)
						//     core.strokeRect('outerUI', posx + 17, posy - 4, 40, 40, '#FFD700');
					}
				}
			}
			var pos1x = 270,
				pos1y = 933;
			switch (core.getFlag('Player', 0)) { //这里是显示当前角色的部分，不需要可以注释掉，默认显示勇者名称。
			case "BEE":
				core.fillText('outerUI', '小蜜蜂', pos1x, pos1y, '#FFFFFF', "36px beeB");
				break;
			case 1:
				core.fillText('outerUI', core.status.hero.name, pos1x, pos1y, '#FFFFFF', "36px beeB");
				break;
			default:
				core.fillText('outerUI', core.status.hero.name, pos1x, pos1y, '#FFFFFF', "36px beeB");
				break;
			}
		} else { //竖屏模式

			core.clearMap("outerUI", 50, 1548, 377, 333);
			//core.fillRect("outerUI", 50, 1548, 377, 333, "#00F");
			for (var i = 0; i < this.itemMx.length; i++) {
				for (var j = 0; j < this.itemMx[i].length; j++) {
					var item = this.itemMx[i][j];
					if (core.hasItem(item)) {
						var icon = core.material.icons.items[item],
							image = core.material.images.items;
						var posx = 62 + j * 82.5,
							posy = 1551 + i * 80;
						core.drawImage('outerUI', image, 0, 32 * icon, 32, 32, posx, posy, 80, 80);
						if (item == "superPotion") {
							core.fillBoldText('outerUI', sp(core.getRealStatus('atk')), posx + 38.75, posy + 31, '#FFFFFF', '#000000', "bold 27px cjk", 52);
						}
						if (item == "centerFly" || item == "hammer" || item == "pickaxe" || item == "bigKey" || item == "superPotion")
							core.fillBoldText('outerUI', core.itemCount(item), posx + 65.83, posy + 75.5, '#FFFFFF', '#000000', "bold 40px cjk");
						// if (this.selectId == item)
						//     core.strokeRect('outerUI', posx + 17, posy - 4, 40, 40, '#FFD700');
					}
				}
			}
			core.clearMap("outerUI", 450, 1576, 340, 300);
			//core.fillRect("outerUI", 450, 1576, 340, 300, "#F00");

			for (var i = 0; i < skill01.length; i++) {
				for (var j = 0; j < skill01[i].length; j++) {
					var item2 = skill01[i][j];
					if (core.hasItem(item2)) {
						var icon = core.material.icons.items[item2],
							image = core.material.images.items;
						var posx = 459 + j * 99,
							posy = 1579 + i * 96;
						core.drawImage('outerUI', image, 0, 32 * icon, 32, 32, posx, posy, 96, 96);

						if (item2 == "hongcha") //此处显示道具栏2道具数量，此为范例
							core.fillBoldText('outerUI', core.itemCount(item2), posx + 75, posy + 84, '#FFFFFF', '#000000', "bold 36px cjk");
						// if (this.selectId == item)
						//     core.strokeRect('outerUI', posx + 17, posy - 4, 40, 40, '#FFD700');
					}
				}
			}
			var pos1x = 690,
				pos1y = 1654;

			switch (core.getFlag('Player', 0)) { //这里是显示当前角色的部分，不需要可以注释掉，默认显示勇者名称。
			case "BEE":
				core.fillText('outerUI', '小蜜蜂', pos1x, pos1y, '#FFFFFF', "36px beeB");
				break;
			case 1:
				core.fillText('outerUI', core.status.hero.name, pos1x, pos1y, '#FFFFFF', "36px beeB");
				break;
			default:
				core.fillText('outerUI', core.status.hero.name, pos1x, pos1y, '#FFFFFF', "36px beeB");
				break;
			}
		}

	}
	//更新装备
	statusBar.prototype._update_equips = function () {
		var drawEquip = function (baseX, baseY, id, color, back) {
			if (!id) core.fillText("outerUI", back, baseX + 150, baseY + 66, color);
			else {
				core.fillText("outerUI", core.material.items[id].name, baseX + 96, baseY + 66, color, '48px cjk', 160);
				var icon = core.material.icons.items[id];
				core.drawImage('outerUI', core.material.images.items, 0, 32 * icon, 32, 32, baseX + 192, baseY, 96, 96);
			}
		}
		if (!core.domStyle.isVertical) { //横屏模式
			core.clearMap("outerUI", 1575, 120, 315, 285);
			core.setFont("outerUI", '48px cjk');
			drawEquip(1575, 144, core.getFlag("nowWeapon"), "#FFCFAE", "无武器");
			drawEquip(1575, 288, core.getFlag("nowShield"), "#D1CEFF", "无防具");
		} else { //竖屏模式
			core.clearMap("outerUI", 860, 45, 300, 315);
			//core.fillRect("outerUI", 860, 45, 300, 315, "#000000");
			core.setFont("outerUI", '48px cjk');
			drawEquip(860, 85, core.getFlag("nowWeapon"), "#FFCFAE", "无武器");
			drawEquip(860, 229, core.getFlag("nowShield"), "#D1CEFF", "无防具");
		}
	}
	//更新钥匙盒
	statusBar.prototype._update_keys = function () {
		var todraw = [],
			keyList = ['yellowKey', 'blueKey', 'redKey', "greenKey"];
		keyList.forEach(function (key, i) {
			todraw[i] = core.itemCount(key);
		});
		var colork = ["#FFD188", "#B6A6FF", "#FFAAAA", "#AAFFBD"];
		var keycount = 0;
		for (var m = 0; m <= 3; m++) {
			keycount += todraw[m];
		}
		if (!core.domStyle.isVertical) { //横屏模式
			core.clearMap("outerUI", 1545, 420, 345, 225);

			//core.fillText("outerUI", keycount, 1584, 550, "#FFFFFF", '48px cjk', 160);

			if (keycount <= 28) {
				var baseX = 1584,
					baseY = 426,
					dn = 3,
					dc = 0;
				while (dn >= 0 && dc < 28) {
					if (todraw[dn]) {
						this.drawKey(keyList[dn], baseX + (dc % 7) * 42, baseY + parseInt(dc / 7) * 51);
						todraw[dn]--, dc++;
					} else dn--;
				}

			} else {
				var baseX = 1584,
					baseY = 426,
					dn = 3,
					dc = 0;
				while (dn >= 0 && dc < 21) {
					if (todraw[dn]) {
						this.drawKey(keyList[dn], baseX + (dc % 7) * 42, baseY + parseInt(dc / 7) * 51);
						todraw[dn]--, dc++;
					} else dn--;
				}
				core.setAlpha("outerUI", 0.3);
				core.fillRoundRect("outerUI", 1568, 572, 314, 60, 16, "#000000");
				core.setAlpha("outerUI", 1);
				if (core.itemCount(keyList[3]) != 0) {
					for (var k1 = 3; k1 >= 0; k1--) {
						//core.setAlpha("outerUI", 0.6);
						this.drawKey(keyList[k1], 1584 + 75 * k1, 576);
						//core.setAlpha("outerUI", 1);
						core.fillBoldText("outerUI", core.itemCount(keyList[k1]), 1638 + 75 * k1, 620, colork[k1], "#000000", '32px num', 160);
					}
				} else {
					for (var k1 = 2; k1 >= 0; k1--) {
						//core.setAlpha("outerUI", 0.6);
						this.drawKey(keyList[k1], 1584 + 100 * k1, 576);
						//core.setAlpha("outerUI", 1);
						core.fillBoldText("outerUI", core.itemCount(keyList[k1]), 1650 + 100 * k1, 620, colork[k1], "#000000", '32px num', 160);
					}
				}
			}
		} else { //竖屏模式
			var basekeyx = 800;
			core.clearMap("outerUI", basekeyx - 9, 1545, 150, 345);
			//core.fillRect("outerUI", basekeyx - 9, 1545, 150, 345, "#EEE");

			//core.fillText("outerUI", keycount, 1584, 550, "#FFFFFF", '48px cjk', 160);

			if (keycount <= -1) {
				var baseX = 426,
					baseY = 1584,
					dn = 3,
					dc = 0;
				while (dn >= 0 && dc < 28) {
					if (todraw[dn]) {
						this.drawKey(keyList[dn], baseX + (dc % 7) * 42, baseY + parseInt(dc / 7) * 51);
						todraw[dn]--, dc++;
					} else dn--;
				}

			} else {
				core.setAlpha("outerUI", 0.3);
				//core.fillRoundRect("outerUI", basekeyx, 1568, 80, 314, 16, "#000000");
				core.setAlpha("outerUI", 1);
				if (core.itemCount(keyList[3]) != 0) {
					for (var k1 = 3; k1 >= 0; k1--) {
						//core.setAlpha("outerUI", 0.6);
						this.drawKey(keyList[k1], basekeyx + 14, 1584 + 75 * k1);
						//core.setAlpha("outerUI", 1);
						core.fillBoldText("outerUI", core.itemCount(keyList[k1]), basekeyx + 85, 1632 + 75 * k1, colork[k1], "#000000", '40px num', 160);
					}
				} else {
					for (var k1 = 2; k1 >= 0; k1--) {
						//core.setAlpha("outerUI", 0.6);
						this.drawKey(keyList[k1], basekeyx + 14, 1598 + 100 * k1);
						//core.setAlpha("outerUI", 1);
						core.fillBoldText("outerUI", core.itemCount(keyList[k1]), basekeyx + 85, 1648 + 100 * k1, colork[k1], "#000000", '40px num', 160);
					}
				}
			}
		}
	}
	//绘制钥匙
	statusBar.prototype.drawKey = function (key, x, y) {

		var sx = 0,
			sy = 0;
		if (key == "blueKey") sx += 26;
		else if (key == "yellowKey") sx += 13;
		else if (key == "greenKey") sx += 39;
		core.drawImage("outerUI", 'maba.png', sx, sy, 12, 18, x, y, 36, 54);
	}
	//清除道具说明
	statusBar.prototype.clearItemInfo = statusBar.prototype._update_infoWindow = function () {
		if (!core.domStyle.isVertical) { //横屏模式
			core.clearMap("outerUI", 1575, 660, 315, 300);
		} else { //竖屏模式
			core.clearMap("outerUI", 360, 50, 480, 280);
			//core.fillRect("outerUI", 360, 50, 480, 280, "#0F0");
		}
		this.selectedItem = null;
	}

	//绘制道具说明
	statusBar.prototype.showInfo = function (itemId) {
		var icon = core.material.icons.items[itemId];
		if (!core.domStyle.isVertical) { //横屏模式
			core.clearMap("outerUI", 1575, 660, 315, 300);
			core.fillText("outerUI", core.material.items[itemId].name, 1580 + 96, 660 + 75, "#D1CEFF", '48px cjk', 170);
			core.drawImage('outerUI', core.material.images.items, 0, 32 * icon, 32, 32, 1575 + 192, 672, 96, 96);
			core.setFont("outerUI", '48px cjk');
			core.ui.drawTextContent("outerUI", core.material.items[itemId].text, {
				left: 1578,
				top: 768,
				maxWidth: 305,
				maxHeight: 290,
				color: "#D1CEFF",
				font: "cjk",
				fontSize: 27
			});
		} else { //竖屏模式
			core.clearMap("outerUI", 360, 50, 480, 280);
			core.fillText("outerUI", core.material.items[itemId].name, 365 + 179, 50 + 75, "#D1CEFF", '48px cjk', 335);
			core.drawImage('outerUI', core.material.images.items, 0, 32 * icon, 32, 32, 360 + 357, 62, 96, 96);
			core.setFont("outerUI", '48px cjk');
			core.ui.drawTextContent("outerUI", core.material.items[itemId].text, {
				left: 368,
				top: 158,
				maxWidth: 470,
				maxHeight: 290,
				color: "#D1CEFF",
				font: "cjk",
				fontSize: 30
			});
		}
		this.selectedItem = itemId;
	}
	//更新工具栏
	statusBar.prototype._update_toolBox = function () {

		const tools = core.isReplaying() ? [
			[core.status.replay.pausing ? "play" : "pause", "stop", "rewind"],
			["speedDown", "speedUp", "save"],
		] : [
			["T371", "shop", "T392"],
			["save", "load", "settings"],
		];

		if (!core.domStyle.isVertical) { //横屏模式
			core.clearMap("outerUI", 1560, 960, 345, 240);
			for (var i = 0; i < tools.length; i++) {
				for (var j = 0; j < tools[i].length; j++) {
					core.drawIcon("outerUI", tools[i][j], 1575 + j * 99, 954 + i * 99, 96, 96);
				}
			}
		} else { //竖屏模式
			core.clearMap("outerUI", 960, 1560, 240, 345);
			for (var i = 0; i < tools.length; i++) {
				for (var j = 0; j < tools[i].length; j++) {
					core.drawIcon("outerUI", tools[i][j], 954 + i * 99, 1575 + j * 99, 96, 96);
				}
			}
		}
	}
	//点击效果
	statusBar.prototype.onclick = function (x, y) {
		if (!core.domStyle.isVertical) { //横屏模式
			var x2 = x * core.domStyle.scale * 1920 / core.dom.gameGroup.clientWidth + 12;
			var y2 = y * core.domStyle.scale * 1266 / core.dom.gameGroup.clientHeight + 12;
			if (x2 <= 336 && x2 >= 39 && y2 <= 855 && y2 >= 570) {
				var itemId = this.itemMx[Math.floor((y2 - 561) / 72)][Math.floor((x2 - 30) / 75)];
				if (!core.hasItem(itemId)) return
				if (
					(core.status.event.id == "viewMaps" ||
						core.status.event.id == "fly") &&
					itemId === "book"
				)
					core.openBook(true);
				if (core.isReplaying() || core.status.lockControl || core.isMoving()) return;

				;
				if (core.material.items[itemId].cls == "constants") {
					switch (itemId) {
					case "book":
						core.openBook();
						break;
					case "fly":
						core.useFly(true)
						break;
					case "wand":
						core.insertAction({
							type: "useItem",
							id: itemId
						});
						break;
					case "snow":
						core.useItem("snow");
						break;
					default:
						this.showInfo(itemId);
					}
				} else if (itemId != this.selectedItem) {
					this.showInfo(itemId);
				} else {
					switch (itemId) {
					case "centerFly":
						core.ui._drawCenterFly();
						break;
					default:
						core.useItem(itemId);
					}
				}
				return;
			}

			if (x2 <= 336 && x2 >= 39 && y2 <= 1143 && y2 >= 855) {
				if (core.isReplaying() || core.status.lockControl || core.isMoving()) return;
				var itemId2 = this.itemMx2[Math.floor((y2 - 855) / 96)][Math.floor((x2 - 39) / 99)];
				switch (core.getFlag('Player', 0)) { //这里同样也要判断新的道具栏2
				case 1:
					itemId2 = this.itemMxp1[Math.floor((y2 - 855) / 96)][Math.floor((x2 - 39) / 99)];
					break;
				case 2:
					itemId2 = this.itemMxp2[Math.floor((y2 - 855) / 96)][Math.floor((x2 - 39) / 99)];
					break;
				default:
					itemId2 = this.itemMx2[Math.floor((y2 - 855) / 96)][Math.floor((x2 - 39) / 99)];
					break;
				}

				if (!core.hasItem(itemId2)) return;
				if (itemId2 != this.selectedItem) {
					this.showInfo(itemId2);
				} else {
					switch (itemId2) {
					default:
						core.useItem(itemId2);
					}
				}
				return;
			}
			if (x2 <= 1872 && x2 >= 1575 && y2 <= 1146 && y2 >= 951) {
				var row = Math.floor((x2 - 1575) / 99),
					col = Math.floor((y2 - 951) / 99);
				if (core.isReplaying()) {
					this.replayAction[col][row].call(core);
				} else if (core.isPlaying() && !core.status.lockControl && !core.isMoving()) {
					this.toolbarAction[col][row].call(core, true);

				}
				return;
			}
		} else { //竖屏模式
			var x2 = x * core.domStyle.scale * 1200 / core.dom.gameGroup.clientWidth + 12;
			var y2 = y * core.domStyle.scale * 1986 / core.dom.gameGroup.clientHeight + 12;
			if (x2 <= 390 && x2 >= 62 && y2 <= 1870 && y2 >= 1551) {
				var itemId = this.itemMx[Math.floor((y2 - 1551) / 80)][Math.floor((x2 - 62) / 82.5)];
				if (!core.hasItem(itemId)) return;
				if (
					(core.status.event.id == "viewMaps" ||
						core.status.event.id == "fly") &&
					itemId === "book"
				)
					core.openBook(true);
				if (core.isReplaying() || core.status.lockControl || core.isMoving()) return;


				if (core.material.items[itemId].cls == "constants") {
					switch (itemId) {
					case "book":
						core.openBook();
						break;
					case "fly":
						core.setFlag("平面楼传", true);
						if (core.flags.flyRecordPosition && core.getFlag("平面楼传")) { core.plugin.drawFlyMap() } else { core.useFly(true) }
						break;
					case "wand":
						core.insertAction({
							type: "useItem",
							id: itemId
						});
						break;
					case "snow":
						core.useItem("snow");
						break;
					default:
						this.showInfo(itemId);
					}
				} else if (itemId != this.selectedItem) {
					this.showInfo(itemId);
				} else {
					switch (itemId) {
					case "centerFly":
						core.ui._drawCenterFly();
						break;
					default:
						core.useItem(itemId);
					}
				}
				return;
			}
			if (x2 <= 756 && x2 >= 459 && y2 <= 1867 && y2 >= 1579) {

				if (core.isReplaying() || core.status.lockControl || core.isMoving()) return;
				var itemId2 = this.itemMx2[Math.floor((y2 - 1579) / 96)][Math.floor((x2 - 459) / 99)];
				switch (core.getFlag('Player', 0)) { //这里同样也要判断新的道具栏2
				case 1:
					itemId2 = this.itemMxp1[Math.floor((y2 - 1579) / 96)][Math.floor((x2 - 459) / 99)];
					break;
				case 2:
					itemId2 = this.itemMxp2[Math.floor((y2 - 1579) / 96)][Math.floor((x2 - 459) / 99)];
					break;
				default:
					itemId2 = this.itemMx2[Math.floor((y2 - 1579) / 96)][Math.floor((x2 - 459) / 99)];
					break;
				}
				if (!core.hasItem(itemId2)) return;
				if (itemId2 != this.selectedItem) {
					this.showInfo(itemId2);
				} else {
					switch (itemId2) {
					default:
						core.useItem(itemId2);
					}
				}
				return;
			}
			if (x2 <= 1152 && x2 >= 954 && y2 <= 1857 && y2 >= 1560) {
				var row = Math.floor((y2 - 1560) / 99),
					col = Math.floor((x2 - 954) / 99);
				if (core.isReplaying()) {
					this.replayAction[col][row].call(core);
				} else if (core.isPlaying() && !core.status.lockControl && !core.isMoving()) {
					this.toolbarAction[col][row].call(core, true);

				}
				return;
			}
		}
	}
	//绘制文字提示
	statusBar.prototype.print = function (text, cnt) {
		if (!core.domStyle.isVertical) { //横屏模式
			if (!text) {
				setTimeout(function () {
					if (!this.infocnt) core.clearMap("outerUI", 0, 1200, 1920, 66);
				}, 200);
				this.infocnt = 0;
				return;
			}
			core.clearMap("outerUI", 0, 1200, 1920, 66);
			core.setFont("outerUI", '48px cjk');
			core.setTextAlign('outerUI', 'left');
			core.fillText("outerUI", text, 30, 1250, "#E1E1E1");
			core.setTextAlign('outerUI', 'center');
			this.infocnt = cnt || 1;
		} else { //竖屏模式
			if (!text) {
				setTimeout(function () {
					if (!this.infocnt) core.clearMap("outerUI", 0, 1920, 1200, 66);
				}, 200);
				this.infocnt = 0;
				return;
			}
			core.clearMap("outerUI", 0, 1920, 1200, 66);
			core.setFont("outerUI", '48px cjk');
			core.setTextAlign('outerUI', 'left');
			core.fillText("outerUI", text, 30, 1970, "#E1E1E1");
			core.setTextAlign('outerUI', 'center');
			this.infocnt = cnt || 1;
		}
	}
	//提示语
	statusBar.prototype.infoRules = [
		{ id: "lava", text: "岩浆好热啊!" },
		{ id: "upFloor", text: "你看到了楼梯" },
		{ id: "downFloor", text: "你看到了楼梯" },
		{ id: "blueShop", text: "你看到了一个祭坛" },
		{ id: "man", text: "你看到了一个老人" },
		{ id: "woman", text: "你看到了一个商人" },
		{ id: "fairy", text: "你看到了一个商人" },
		{ id: "thief", text: "你看到了一个小偷" },
		{ id: "bee", text: "你看到了一只蜜蜂" },
		{ id: "ali", text: "你看到了一只红色狐狸" },
	]
	//检测周围图块输出提示语
	statusBar.prototype.printEnvironmentInfo = function () {
		if (!this.infocnt) {
			var ids = [];
			for (var i in core.status.thisMap.blocks) {
				var block = core.status.thisMap.blocks[i];
				if (!block.disable && core.nearHero(block.x, block.y)) ids.push(block.event.id);
			}
			for (var i in this.infoRules) {
				if (ids.indexOf(this.infoRules[i].id) >= 0) {
					this.print(this.infoRules[i].text);
					return;
				}
			}
		}
	}
	//清除提示
	statusBar.prototype.clearInfo = function (etype) {
		if (this.infocnt == 1) this.print();
		else if (this.infocnt > 1) this.infocnt--;
	}
	core.ui.statusBar = new statusBar();
	//复写清空状态栏
	core.control.clearStatusBar = function () {
		core.clearMap("outerUI");
	}
	core.ui.drawTip = function (text, id, clear) {
		core.ui.statusBar.print(text);
	}
	// init() called in `afterLoadResources`.
},
    "statusBar": function () {
	//新版鸽窝状态栏ui绘制，请作者在添加道具等操作时一并将老版状态栏一起添加，以供玩家自行选择ui，或通过提示让玩家选择作者想使用的ui。
	if (!core.getLocalStorage("newStatusBar")) return
	main.dom.floorMsgGroup.style.display = "none";
	main.dom.statusBar.style.display = "none";
	main.dom.toolBar.style.display = "none";

	const GAMEVIEW_WIDTH = 676 * 3; //横屏画面宽度
	const GAMEVIEW_HEIGHT = 416 * 3; //横屏画面高度

	const GAMEVIEW_WIDTH_VERTICAL = 416 * 3; //竖屏画面宽度
	const GAMEVIEW_HEIGHT_VERTICAL = 676 * 3; //竖屏画面高度

	const BAR_WIDTH = 130 * 3; //横屏左侧额外距离（即边栏宽度）
	const BAR_HEIGHT_VERTICAL = 130 * 3; //竖屏上侧额外距离（即边栏高度）
	const BORDER_WIDTH = 0; //游戏画面左侧偏移距离
	const BORDER_HEIGHT = 0; //游戏画面上侧偏移距离

	const ITEM_BOX_LEFT = 549 * 3; //横屏道具栏左侧距离（右侧边栏需增加BAR_WIDTH+GAMEVIEW_HEIGHT）
	const ITEM_BOX_TOP = 155 * 3; //横屏道具栏上侧距离
	const ITEM_BOX_LEFT_VERTICAL = 160 * 3; //竖屏道具栏左侧距离
	const ITEM_BOX_TOP_VERTICAL = 549 * 3; //竖屏道具栏上侧距离（下侧边栏需增加BAR_HEIGHT_VERTICAL+GAMEVIEW_WIDTH_VERTICAL）

	const EQUIP_BLOCK_LEFT = 549 * 3; //横屏装备栏左侧距离（右侧边栏需增加BAR_WIDTH+GAMEVIEW_HEIGHT）
	const EQUIP_BLOCK_TOP = 10 * 3; //横屏装备栏上侧距离
	const EQUIP_BLOCK_LEFT_VERTICAL = 10 * 3; //竖屏装备栏左侧距离
	const EQUIP_BLOCK_TOP_VERTICAL = 549 * 3; //竖屏装备栏上侧距离（下侧边栏需增加BAR_HEIGHT_VERTICAL+GAMEVIEW_WIDTH_VERTICAL）

	const KEY_BLOCK_LEFT = EQUIP_BLOCK_LEFT + 16 * 3; //横屏钥匙栏左侧距离（右侧边栏需增加BAR_WIDTH+GAMEVIEW_HEIGHT）
	const KEY_BLOCK_TOP = 110 * 3; //横屏钥匙栏上侧距离
	const KEY_BLOCK_LEFT_VERTICAL = 110 * 3; //竖屏钥匙栏左侧距离
	const KEY_BLOCK_TOP_VERTICAL = EQUIP_BLOCK_TOP_VERTICAL + 16 * 3; //竖屏钥匙栏上侧距离（下侧边栏需增加BAR_HEIGHT_VERTICAL+GAMEVIEW_WIDTH_VERTICAL）

	const INFO_BLOCK_LEFT = 10 * 3; //横屏道具说明左侧距离（右侧边栏需增加BAR_WIDTH+GAMEVIEW_HEIGHT）
	const INFO_BLOCK_TOP = 180 * 3; //横屏道具说明上侧距离
	const INFO_BLOCK_LEFT_VERTICAL = 113 * 3; //竖屏道具说明左侧距离
	const INFO_BLOCK_TOP_VERTICAL = 8 * 3; //竖屏道具说明上侧距离（下侧边栏需增加BAR_HEIGHT_VERTICAL+GAMEVIEW_WIDTH_VERTICAL）

	const TOOL_BOX_LEFT = EQUIP_BLOCK_LEFT; //横屏工具栏左侧距离（右侧边栏需增加BAR_WIDTH+GAMEVIEW_HEIGHT）
	const TOOL_BOX_TOP = 348 * 3; //横屏工具栏上侧距离
	const TOOL_BOX_LEFT_VERTICAL = 348 * 3; //竖屏工具栏左侧距离
	const TOOL_BOX_TOP_VERTICAL = 549 * 3; //竖屏工具栏上侧距离（下侧边栏需增加BAR_HEIGHT_VERTICAL+GAMEVIEW_WIDTH_VERTICAL）

	const TOOL_ICON_OUTER_SIZE = 34 * 3;

	const TEXT_COLOR = "#fff"; //默认文字颜色
	const globalAlpha = 0.7; //默认底框透明度
	const FORCE_COUNTABLE_ITEMS = ["centerFly"]; //常态显示数量的非永久道具，如果道具不在此数组中，则只有道具多余1时显示数量

	const outerBackground = document.createElement("canvas"); //背景画布设置
	outerBackground.style.position = "absolute";
	outerBackground.style.zIndex = 5;
	outerBackground.id = "outerBackground";
	main.dom.outerBackground = outerBackground;
	main.dom.startPanel.insertAdjacentElement("afterend", outerBackground);

	const outerUI = document.createElement("canvas"); //额外ui画布设置（状态栏所有绘制、点击都在额外ui上）
	outerUI.style.position = "absolute";
	outerUI.style.zIndex = 165;
	outerUI.id = "outerUI";
	main.dom.outerUI = outerUI;
	outerBackground.insertAdjacentElement("afterend", outerUI);
	setTimeout(function () {
		// Should be executed immediately after init()
		main.canvas.outerUI = outerUI.getContext("2d");
	});
	outerUI.onclick = function (e) {
		try {
			e.preventDefault();
			if (!core.isPlaying()) return false;
			const left = core.dom.gameGroup.offsetLeft;
			const top = core.dom.gameGroup.offsetTop;
			const px = Math.floor((e.clientX - left) / core.domStyle.scale),
				py = Math.floor((e.clientY - top) / core.domStyle.scale);
			core.ui.statusBar.onclick(px * 3, py * 3);
		} catch (ee) {
			main.log(ee);
		}
	};

	const _resize_gameGroup = function (obj) {
		//游戏画面自适应调节
		const gameGroup = core.dom.gameGroup;
		gameGroup.style.width = obj.totalWidth + "px";
		gameGroup.style.height = obj.totalHeight + "px";
		gameGroup.style.left = (obj.clientWidth - obj.totalWidth) / 2 + "px";
		gameGroup.style.top = (obj.clientHeight - obj.totalHeight) / 2 + "px";
		//floorMsgGroup为切换楼层中生效，显示时间可通过‘全塔属性’——‘切换楼层时间’或游戏内设置调整
		//显示内容为游戏名/版本号/楼层名
		// floorMsgGroup
		var floorMsgGroup = core.dom.floorMsgGroup;
		var globalAttribute =
			core.status.globalAttribute || core.initStatus.globalAttribute;
		floorMsgGroup.style = globalAttribute.floorChangingStyle;
		floorMsgGroup.style.height = floorMsgGroup.style.width =
			GAMEVIEW_HEIGHT / 3 * core.domStyle.scale + "px";
		floorMsgGroup.style.fontSize = 16 * core.domStyle.scale + "px";

		if (core.domStyle.isVertical) {
			floorMsgGroup.style.left = "0px";
			floorMsgGroup.style.top =
				((GAMEVIEW_HEIGHT_VERTICAL / 3 - GAMEVIEW_WIDTH_VERTICAL / 3) *
					core.domStyle.scale) /
				2 +
				"px";
		} else {
			floorMsgGroup.style.left =
				((GAMEVIEW_WIDTH / 3 - GAMEVIEW_HEIGHT / 3) * core.domStyle.scale) / 2 + "px";
			floorMsgGroup.style.top = "0px";
		}
		core.dom.musicBtn.style.right =
			(obj.clientWidth - obj.totalWidth) / 2 + "px";
		core.dom.musicBtn.style.bottom =
			(obj.clientHeight - obj.totalHeight) / 2 - 9 + "px";
		let startBackground = core.domStyle.isVertical ?
			main.styles.startVerticalBackground || main.styles.startBackground :
			main.styles.startBackground;
		if (main.dom.startBackground.getAttribute("__src__") != startBackground) {
			main.dom.startBackground.setAttribute("__src__", startBackground);
			main.dom.startBackground.src = startBackground;
		}
	};
	const _resize_canvas = function (obj) {
		//自适应画布
		main.dom.outerBackground.style.width = obj.totalWidth + "px";
		main.dom.outerBackground.style.height = obj.totalHeight + "px";
		main.dom.outerUI.style.width = obj.totalWidth + "px";
		main.dom.outerUI.style.height = obj.totalHeight + "px";

		const innerSize = obj.canvasWidth * core.domStyle.scale + "px";
		for (let i = 0; i < core.dom.gameCanvas.length; ++i)
			core.dom.gameCanvas[i].style.width = core.dom.gameCanvas[
				i
			].style.height = innerSize;
		core.dom.gif.style.width = core.dom.gif.style.height = innerSize;
		core.dom.gif2.style.width = core.dom.gif2.style.height = innerSize;

		core.dom.gameDraw.style.width = core.dom.gameDraw.style.height =
			innerSize;
		core.dom.gameDraw.style.top =
			obj.gameDrawBox.top * core.domStyle.scale + "px";
		core.dom.gameDraw.style.left =
			obj.gameDrawBox.left * core.domStyle.scale + "px";
		// resize bigmap
		core.bigmap.canvas.forEach(function (cn) {
			const ratio = core.canvas[cn].canvas.hasAttribute("isHD") ?
				core.domStyle.ratio :
				1;
			core.canvas[cn].canvas.style.width =
				(innerSize / ratio) * core.domStyle.scale + "px";
			core.canvas[cn].canvas.style.height =
				(innerSize / ratio) * core.domStyle.scale + "px";
		});
		// resize dynamic canvas
		for (const name in core.dymCanvas) {
			const ctx = core.dymCanvas[name],
				canvas = ctx.canvas;
			const ratio = canvas.hasAttribute("isHD") ? core.domStyle.ratio : 1;
			canvas.style.width = (innerSize / ratio) * core.domStyle.scale + "px";
			canvas.style.height = (innerSize / ratio) * core.domStyle.scale + "px";
			canvas.style.left =
				parseFloat(canvas.getAttribute("_left")) * core.domStyle.scale + "px";
			canvas.style.top =
				parseFloat(canvas.getAttribute("_top")) * core.domStyle.scale + "px";
		}
		// resize next
		main.dom.next.style.width = main.dom.next.style.height =
			5 * core.domStyle.scale + "px";
		main.dom.next.style.borderBottomWidth =
			main.dom.next.style.borderRightWidth = 4 * core.domStyle.scale + "px";
	};

	core.control.resize = function () {
		//自适应，可实现横竖屏切换
		if (main.mode == "editor") return;

		const clientWidth = main.dom.body.clientWidth,
			clientHeight = main.dom.body.clientHeight;
		const canvasWidth = core.__PIXELS__;

		const isVertical = clientHeight > clientWidth;
		core.domStyle.isVertical = isVertical;

		const totalWidth = isVertical ? GAMEVIEW_WIDTH_VERTICAL / 3 : GAMEVIEW_WIDTH / 3,
			totalHeight = isVertical ? GAMEVIEW_HEIGHT_VERTICAL / 3 : GAMEVIEW_HEIGHT / 3;

		const maxRatio = Math.min(
			clientWidth / totalWidth,
			clientHeight / totalHeight
		);

		core.domStyle.availableScale = [];
		[1, 1.25, 1.5, 1.75, 2].forEach(function (v) {
			if (maxRatio >= v) {
				core.domStyle.availableScale.push(v);
			}
		});

		if (core.domStyle.availableScale.indexOf(core.domStyle.scale) < 0) {
			core.domStyle.scale = Math.min(1, maxRatio);
		} else if (
			core.getLocalStorage("scale") == null &&
			core.domStyle.availableScale.length >= 2
		) {
			core.domStyle.scale =
				core.domStyle.availableScale[core.domStyle.availableScale.length - 2];
			core.setLocalStorage("scale", core.domStyle.scale);
		}

		const totalWidthScaled = totalWidth * core.domStyle.scale,
			totalHeightScaled = totalHeight * core.domStyle.scale;

		const gameDrawBox = isVertical ? {
			left: BORDER_WIDTH / 3,
			top: BAR_HEIGHT_VERTICAL / 3 + BORDER_HEIGHT / 3,
		} : { left: BAR_WIDTH / 3 + BORDER_WIDTH / 3, top: BORDER_HEIGHT / 3 };

		const obj = {
			clientWidth: clientWidth,
			clientHeight: clientHeight,
			canvasWidth: canvasWidth,
			totalWidth: totalWidthScaled,
			totalHeight: totalHeightScaled,
			gameDrawBox: gameDrawBox,
			globalAttribute: core.status.globalAttribute || core.initStatus.globalAttribute,
		};

		_resize_gameGroup(obj);
		_resize_canvas(obj);

		if (core.status.automaticRoute == null) core.status.automaticRoute = {};
		core.updateStatusBar();
	};

	const bgctx = main.dom.outerBackground.getContext("2d");
	const uictx = main.dom.outerUI.getContext("2d");
	class StatusBar {
		constructor() {
			//道具栏列表
			this.itemMx = [
				//空位用‘none’填充，当前ui至多4列6行
				["book", "wand", "I385", "fly"],
				["cross", "superPotion", "pickaxe"],
				["bomb", "centerFly", "upFly"],
				["I429", "none", "none"],
				["downFly", "knife", "snow"],
				["bigKey", "earthquake", "coin"],
			];
			this.once = ['book', 'fly', 'snow'] //单次点击即可使用的道具列表
		}
		//初始化内容（工具栏/录像操作执行函数）
		init() {
			this.toolbarAction = [
				[
					main.core.openKeyBoard,
					main.core.openQuickShop,
					core.openToolbox,
					core.doSL,
				],
				[main.core.save, main.core.load, main.core.openSettings, core.doSL],
			];
			this.replayAction = [
				[core.triggerReplay, core.stopReplay, core.rewindReplay],
				[core.speedDownReplay, core.speedUpReplay, function () { core.control._replay_SL() }],
			];
		}
		//更新
		update() {
			this._update_background(); //更新背景
			this._update_props(); //更新属性
			this._update_items(); //更新道具
			this._update_equips(); //更新装备
			this._update_keys(); //更新钥匙
			this._update_infoWindow(); //更新道具说明
			this._update_toolBox(); //更新工具栏
		}
		//更新背景
		_update_background(updatedFloorTitle) {
			if (core.domStyle.isVertical) {
				bgctx.canvas.width = GAMEVIEW_WIDTH_VERTICAL;
				bgctx.canvas.height = GAMEVIEW_HEIGHT_VERTICAL;
				uictx.canvas.width = GAMEVIEW_WIDTH_VERTICAL;
				uictx.canvas.height = GAMEVIEW_HEIGHT_VERTICAL;

				const bg = core.material.images.images["shangmian.png"]; //竖屏背景（上）
				bgctx.drawImage(
					bg,
					0,
					0,
					GAMEVIEW_WIDTH_VERTICAL,
					BAR_HEIGHT_VERTICAL
				);
				const bg2 = core.material.images.images["xiamian.png"]; //竖屏背景（下）
				bgctx.drawImage(
					bg2,
					0,
					BAR_HEIGHT_VERTICAL + GAMEVIEW_WIDTH_VERTICAL,
					GAMEVIEW_WIDTH_VERTICAL,
					BAR_HEIGHT_VERTICAL
				);
				bgctx.globalAlpha = globalAlpha;
				const bg3 = core.material.images.images["statusBackground2.png"]; //竖屏按钮
				bgctx.drawImage(
					bg3,
					0,
					0,
					GAMEVIEW_WIDTH_VERTICAL,
					GAMEVIEW_HEIGHT_VERTICAL
				);
				bgctx.globalAlpha = 1;
				core.setTextAlign("outerUI", "center");
			} else {
				bgctx.canvas.width = GAMEVIEW_WIDTH;
				bgctx.canvas.height = GAMEVIEW_HEIGHT;
				uictx.canvas.width = GAMEVIEW_WIDTH;
				uictx.canvas.height = GAMEVIEW_HEIGHT;

				const bg = core.material.images.images["zuobian.png"]; //横屏背景（左）
				bgctx.drawImage(bg, 0, 0, BAR_WIDTH, GAMEVIEW_HEIGHT);
				const bg2 = core.material.images.images["youbian.png"]; //横屏背景（右）
				bgctx.drawImage(
					bg2,
					BAR_WIDTH + GAMEVIEW_HEIGHT,
					0,
					BAR_WIDTH,
					GAMEVIEW_HEIGHT
				);
				bgctx.globalAlpha = globalAlpha;
				const bg3 = core.material.images.images["statusBackground.png"]; //横屏按钮
				bgctx.drawImage(bg3, 0, 0, GAMEVIEW_WIDTH, GAMEVIEW_HEIGHT);
				bgctx.globalAlpha = 1;
				core.setTextAlign("outerUI", "center");
			}
		}
		// 更新属性
		_update_props(updatedFloorTitle) {
			if (!updatedFloorTitle && core.status.floorId) {
				updatedFloorTitle = core.status.maps[core.status.floorId].title;
			}
			const statusList = ["hp", "atk", "def", "money"]; //属性列表，图标在函数复写core.statusBar.icons中声明，数字为project\materials\icons.png中的图标序号（可使用便捷ps追加，第一个序号为0）
			const drawStatusList = (baseX, baseY) => {
				let curh = baseY;
				core.setTextAlign("outerUI", "right");
				statusList.forEach((item) => {
					// 绘制图标
					core.drawIcon("outerUI", item, baseX - 95 * 3, curh - 18 * 3, 22 * 3, 22 * 3);

					// 四舍五入
					core.status.hero[item] = Math.round(core.status.hero[item]);
					// 大数据格式化
					core.fillBoldText(
						"outerUI",
						core.getRealStatus(item),
						baseX,
						curh,
						TEXT_COLOR, "#000", 8
					);
					curh += 24 * 3;
					if (curh > 130 * 3 && core.domStyle.isVertical) {
						curh = 24 * 3;
						baseX += 105 * 3;
					}
				});
				core.setTextAlign("outerUI", "center");
			};
			if (core.domStyle.isVertical) {
				core.clearMap("outerUI", 10 * 3, 0, 110 * 3, 120 * 3);
				core.setFont("outerUI", "bold 42px Verdana");
				if (updatedFloorTitle) {
					core.setTextAlign("outerUI", "center");
					core.fillBoldText("outerUI", updatedFloorTitle, 60 * 3, 22 * 3, TEXT_COLOR, "#000", 8);
				}
				drawStatusList(96 * 3, 46 * 3);
			} else {
				core.clearMap("outerUI", 10 * 3, 10 * 3, 105 * 3, 160 * 3);
				core.setFont("outerUI", "bold 42px Verdana");
				if (updatedFloorTitle) {
					core.setTextAlign("outerUI", "center");
					core.fillBoldText("outerUI", updatedFloorTitle, 62 * 3, 41 * 3, TEXT_COLOR, "#000", 8);
				}
				drawStatusList(110 * 3, 93 * 3);
			}
		}
		_update_items() {
			//更新道具栏
			const drawItemMx = (drawFn) => {
				for (let i = 0; i < this.itemMx.length; i++) {
					for (let j = 0; j < this.itemMx[i].length; j++) {
						var item = this.itemMx[i][j];
						drawFn(i, j, item);
					}
				}
			};
			const drawItem = (item, posx, posy) => {
				const icon = core.material.icons.items[item],
					image = core.material.images.items;
				core.drawImage(
					"outerUI",
					image,
					0,
					32 * icon,
					30,
					30,
					posx,
					posy,
					32 * 3,
					32 * 3
				);
				const cnt = core.itemCount(item);
				if (
					(core.items.items[item].cls === "tools" && cnt > 1) ||
					FORCE_COUNTABLE_ITEMS.includes(item)
				) {
					core.fillText(
						"outerUI",
						cnt,
						posx + 25 * 3,
						posy + 28 * 3,
						"#FFFFFF",
						"bold 36px Verdana"
					);
				}
			};
			if (core.domStyle.isVertical) {
				core.clearMap(
					"outerUI",
					ITEM_BOX_LEFT_VERTICAL,
					ITEM_BOX_TOP_VERTICAL,
					185 * 3,
					125 * 3
				);

				drawItemMx((i, j, item) => {
					if (core.hasItem(item)) {
						const posx = ITEM_BOX_LEFT_VERTICAL + i * 30 * 3,
							posy = ITEM_BOX_TOP_VERTICAL + j * 31 * 3;
						drawItem(item, posx, posy);
					}
				});
			} else {
				core.clearMap("outerUI", ITEM_BOX_LEFT, ITEM_BOX_TOP, 125 * 3, 185 * 3);

				drawItemMx((i, j, item) => {
					if (core.hasItem(item)) {
						const posx = ITEM_BOX_LEFT + j * 30 * 3,
							posy = ITEM_BOX_TOP + i * 31 * 3;
						drawItem(item, posx, posy);
					}
				});
			}
		}
		//       _update_equips() {
		//         core.setFont("outerUI", "bold 16px Verdana");
		//         const drawEquip = (baseX, baseY, id, color, back) => {
		//           if (!id)
		//             core.fillText("outerUI", back, baseX + 20, baseY + 22, color);
		//           else {
		//             var icon = core.material.icons.items[id];
		//             core.drawImage(
		//               "outerUI",
		//               core.material.images.items,
		//               0,
		//               32 * icon,
		//               32,
		//               32,
		//               baseX + 5,
		//               baseY,
		//               32,
		//               32
		//             );
		//           }
		//         };
		//         if (core.domStyle.isVertical) {
		//           core.clearMap(
		//             "outerUI",
		//             EQUIP_BLOCK_LEFT_VERTICAL,
		//             EQUIP_BLOCK_TOP_VERTICAL,
		//             90,
		//             130
		//           );
		//           drawEquip(
		//             EQUIP_BLOCK_LEFT_VERTICAL,
		//             EQUIP_BLOCK_TOP_VERTICAL,
		//             core.getEquip(0),
		//             "#D1CEFF",
		//             "无"
		//           );
		//           drawEquip(
		//             EQUIP_BLOCK_LEFT_VERTICAL + 45,
		//             EQUIP_BLOCK_TOP_VERTICAL,
		//             core.getEquip(1),
		//             "#D1CEFF",
		//             "无"
		//           );
		//           drawEquip(
		//             EQUIP_BLOCK_LEFT_VERTICAL,
		//             EQUIP_BLOCK_TOP_VERTICAL + 45,
		//             core.getEquip(2),
		//             "#D1CEFF",
		//             "无"
		//           );
		//           drawEquip(
		//             EQUIP_BLOCK_LEFT_VERTICAL + 45,
		//             EQUIP_BLOCK_TOP_VERTICAL + 45,
		//             core.getEquip(3),
		//             "#D1CEFF",
		//             "无"
		//           );
		//           drawEquip(
		//             EQUIP_BLOCK_LEFT_VERTICAL,
		//             EQUIP_BLOCK_TOP_VERTICAL + 90,
		//             core.getEquip(4),
		//             "#D1CEFF",
		//             "无"
		//           );
		//           drawEquip(
		//             EQUIP_BLOCK_LEFT_VERTICAL + 45,
		//             EQUIP_BLOCK_TOP_VERTICAL + 90,
		//             core.getEquip(5),
		//             "#D1CEFF",
		//             "无"
		//           );
		//         } else {
		//           core.clearMap("outerUI", EQUIP_BLOCK_LEFT, EQUIP_BLOCK_TOP, 130, 95);
		//           drawEquip(
		//             EQUIP_BLOCK_LEFT,
		//             EQUIP_BLOCK_TOP,
		//             core.getEquip(0),
		//             "#D1CEFF",
		//             "无"
		//           );
		//           drawEquip(
		//             EQUIP_BLOCK_LEFT + 42,
		//             EQUIP_BLOCK_TOP,
		//             core.getEquip(1),
		//             "#D1CEFF",
		//             "无"
		//           );
		//           drawEquip(
		//             EQUIP_BLOCK_LEFT + 85,
		//             EQUIP_BLOCK_TOP,
		//             core.getEquip(2),
		//             "#D1CEFF",
		//             "无"
		//           );
		//           drawEquip(
		//             EQUIP_BLOCK_LEFT,
		//             EQUIP_BLOCK_TOP + 45,
		//             core.getEquip(3),
		//             "#D1CEFF",
		//             "无"
		//           );
		//           drawEquip(
		//             EQUIP_BLOCK_LEFT + 42,
		//             EQUIP_BLOCK_TOP + 45,
		//             core.getEquip(4),
		//             "#D1CEFF",
		//             "无"
		//           );
		//           drawEquip(
		//             EQUIP_BLOCK_LEFT + 85,
		//             EQUIP_BLOCK_TOP + 45,
		//             core.getEquip(5),
		//             "#D1CEFF",
		//             "无"
		//           );
		//         }
		//       }

		_update_equips() {
			core.setFont("outerUI", 'bold 48px  cjk');
			const drawEquip = (baseX, baseY, id, color, back) => {
				if (core.domStyle.isVertical) {
					if (!id) core.fillBoldText("outerUI", back, baseX + 42 * 3, baseY + 48 * 3, color, "#000", 4);
					else {
						core.fillBoldText("outerUI", core.material.items[id].name, baseX + 42 * 3, baseY + 48 * 3, color, "#000", 4);
						var icon = core.material.icons.items[id];
						core.drawImage('outerUI', core.material.images.items, 0, 32 * icon, 32, 32, baseX + 24 * 3, baseY - 5 * 3, 32 * 3, 32 * 3);
					}

				} else {
					if (!id) core.fillBoldText("outerUI", back, baseX + 85 * 3, baseY + 11 * 3, color, "#000", 4);
					else {
						core.fillBoldText("outerUI", core.material.items[id].name, baseX + 85 * 3, baseY + 11 * 3, color, "#000", 4);
						var icon = core.material.icons.items[id];
						core.drawImage('outerUI', core.material.images.items, 0, 32 * icon, 32, 32, baseX + 2 * 3, baseY - 9 * 3, 32 * 3, 32 * 3);
					}
				}
			};
			if (core.domStyle.isVertical) {
				core.clearMap("outerUI", EQUIP_BLOCK_LEFT_VERTICAL, EQUIP_BLOCK_TOP_VERTICAL, 105 * 3, 95 * 3);
				drawEquip(EQUIP_BLOCK_LEFT_VERTICAL, EQUIP_BLOCK_TOP_VERTICAL + 9 * 3, core.getFlag("nowWeapon"), "#FFCFAE", "无武器");
				drawEquip(EQUIP_BLOCK_LEFT_VERTICAL, EQUIP_BLOCK_TOP_VERTICAL + 72 * 3, core.getFlag("nowShield"), "#D1CEFF", "无防具");
			} else {
				core.clearMap("outerUI", EQUIP_BLOCK_LEFT, EQUIP_BLOCK_TOP, 105 * 3, 95 * 3);
				drawEquip(EQUIP_BLOCK_LEFT, EQUIP_BLOCK_TOP + 10 * 3, core.getFlag("nowWeapon"), "#FFCFAE", "无武器");
				drawEquip(EQUIP_BLOCK_LEFT, EQUIP_BLOCK_TOP + 54 * 3, core.getFlag("nowShield"), "#D1CEFF", "无防具");
			}
		}

		_update_keys() {
			const drawKeyList = (baseX, baseY) => {
				const todraw = [],
					keyList = ['yellowKey', 'blueKey', 'redKey'];
				let total = 0;
				keyList.forEach(function (key, i) {
					todraw[i] = core.itemCount(key);
					total += todraw[i];
				});

				let dn = 2;
				for (let i = 0; i <= dn; i++) {

					let delta = i * 40 * 3;

					if (core.domStyle.isVertical) {
						this.drawKey(keyList[i], baseX + 12 * 3, baseY + delta - 16 * 3);
					} else {
						this.drawKey(keyList[i], baseX + delta - 8 * 3, baseY);
					}

					core.setFont("outerUI", 'bold 44px Verdana');
					core.setTextAlign("outerUI", "center");
					if (core.domStyle.isVertical) {
						core.fillBoldText("outerUI", todraw[i], baseX + 17 * 3, baseY + 17 * 3 + delta, "white", "#000", 8);
					} else {
						core.fillBoldText("outerUI", todraw[i], baseX + delta - 2 * 3 - 2, baseY + 33 * 3, "white", '#000', 8);
					}
				}

			};
			if (core.domStyle.isVertical) {
				core.clearMap(
					"outerUI",
					KEY_BLOCK_LEFT_VERTICAL,
					KEY_BLOCK_TOP_VERTICAL,
					45 * 3,
					130 * 3
				);
				drawKeyList(KEY_BLOCK_LEFT_VERTICAL + 3 * 3, KEY_BLOCK_TOP_VERTICAL + 5 * 3);
			} else {
				core.clearMap("outerUI", KEY_BLOCK_LEFT, KEY_BLOCK_TOP, 130 * 3, 45 * 3);
				drawKeyList(KEY_BLOCK_LEFT + 10 * 3, KEY_BLOCK_TOP);
			}
		}
		drawKey(key, x, y) {
			let sx = 0,
				sy = 0;

			if (key == "yellowKey") sx += 13;
			else if (key == "blueKey") sx += 26;
			else if (key == "greenKey") sx += 39;

			core.drawImage("outerUI", "maba.png", sx, sy, 13, 26, x, y, 13 * 3, 26 * 3);
		}
		_update_infoWindow() {
			const itemId = this.selectedItem;
			let text = "";
			if (this.selectedItem) {
				text = core.replaceText(core.material.items[itemId]?.text);
				if (text[0] == "," || text[0] == "，") text = text.substring(1);
			}
			if (core.domStyle.isVertical) {
				core.clearMap(
					"outerUI",
					INFO_BLOCK_LEFT_VERTICAL,
					INFO_BLOCK_TOP_VERTICAL,
					300 * 3,
					120 * 3
				);

				if (this.selectedItem) {
					const icon = core.material.icons.items[itemId];
					core.setTextAlign("outerUI", "left");
					core.fillText(
						"outerUI",
						core.material.items[itemId].name,
						INFO_BLOCK_LEFT_VERTICAL + 50 * 3,
						INFO_BLOCK_TOP_VERTICAL + 27 * 3,
						"#D1CEFF"
					);
					core.drawImage(
						"outerUI",
						core.material.images.items,
						0,
						32 * icon,
						32,
						32,
						INFO_BLOCK_LEFT_VERTICAL + 10 * 3,
						INFO_BLOCK_TOP_VERTICAL + 8 * 3,
						32 * 3,
						32 * 3
					);
					core.ui.drawTextContent("outerUI", text, {
						left: INFO_BLOCK_LEFT_VERTICAL + 10 * 3,
						top: INFO_BLOCK_TOP_VERTICAL + 40 * 3,
						maxWidth: 275 * 3,
						color: "#D1CEFF",
						fontSize: 36
					});
				}
			} else {
				core.clearMap("outerUI", INFO_BLOCK_LEFT, INFO_BLOCK_TOP, 115 * 3, 230 * 3);

				if (this.selectedItem) {
					const icon = core.material.icons.items[itemId];
					core.setTextAlign("outerUI", "center");
					core.fillText(
						"outerUI",
						core.material.items[itemId].name,
						INFO_BLOCK_LEFT + 60 * 3,
						INFO_BLOCK_TOP + 25 * 3,
						"#D1CEFF"
					);
					core.drawImage(
						"outerUI",
						core.material.images.items,
						0,
						32 * icon,
						32,
						32,
						INFO_BLOCK_LEFT + 45 * 3,
						INFO_BLOCK_TOP + 30 * 3,
						32 * 3,
						32 * 3
					);
					core.ui.drawTextContent("outerUI", text, {
						left: INFO_BLOCK_LEFT + 10 * 3,
						top: INFO_BLOCK_TOP + 60 * 3,
						maxWidth: 105 * 3,
						color: "#D1CEFF",
						fontSize: 36
					});
				}
			}
		}
		showItemInfo(itemId) {
			//展示道具说明
			this.selectedItem = itemId;
			this._update_infoWindow();
		}
		clearItemInfo() {
			//清除道具说明
			this.selectedItem = null;
			this._update_infoWindow();
		}
		_update_toolBox() {
			const tools = core.isReplaying() ? [
				[core.status.replay.pausing ? "play" : "pause", "stop", "rewind"],
				["speedDown", "speedUp", "save"],
			] : [
				["keyboard", "shop", "itembag", "T371"],
				["save", "load", "settings", "T392"],
			];
			if (core.domStyle.isVertical) {
				core.clearMap(
					"outerUI",
					TOOL_BOX_LEFT_VERTICAL,
					TOOL_BOX_TOP_VERTICAL,
					115,
					130
				);

				for (let i = 0; i < tools.length; i++) {
					for (let j = 0; j < tools[i].length; j++) {
						core.drawIcon(
							"outerUI",
							tools[i][j],
							TOOL_BOX_LEFT_VERTICAL + i * 31 * 3,
							TOOL_BOX_TOP_VERTICAL + j * 31 * 3,
							30 * 3,
							30 * 3
						);
					}
				}
			} else {
				core.clearMap("outerUI", TOOL_BOX_LEFT, TOOL_BOX_TOP, 130 * 3, 80 * 3);

				for (let i = 0; i < tools.length; i++) {
					for (let j = 0; j < tools[i].length; j++) {
						core.drawIcon(
							"outerUI",
							tools[i][j],
							TOOL_BOX_LEFT + j * 31 * 3,
							TOOL_BOX_TOP + i * 31 * 3,
							30 * 3,
							30 * 3
						);
					}
				}
			}
		}
		onclick(x, y) {
			const makeBox = ([x, y], [w, h]) => {
				return [
					[x, y],
					[x + w, y + h],
				];
			};
			const gridify = ([x, y], [gw, gh]) => {
				return [Math.floor(x / gw), Math.floor(y / gh)];
			};
			const useItem = (itemId) => {
				if (!core.hasItem(itemId)) return;

				if (itemId != this.selectedItem) {
					this.showItemInfo(itemId);
					if (this.once.indexOf(itemId) >= 0) {
						switch (itemId) {
						case "centerFly":
							core.ui._drawCenterFly();
							break;
						case "book":
							core.openBook(true);
							break;
						case "fly":
							core.useFly(true)
							break;
						case "wand":
							core.insertAction({
								type: "useItem",
								id: itemId,
							});
							break;
						default:
							core.useItem(itemId);
						}
					}
				} else {
					switch (itemId) {
					case "centerFly":
						core.ui._drawCenterFly();
						break;
					case "book":
						core.openBook(true);
						break;
					case "fly":
						core.useFly(true)
						break;
					case "wand":
						core.insertAction({
							type: "useItem",
							id: itemId,
						});
						break;
					default:
						core.useItem(itemId);
					}
				}
			};
			const inRect = ([x, y], [
				[sx, sy],
				[dx, dy]
			]) => {
				return sx <= x && x <= dx && sy <= y && y <= dy;
			};
			const relativeTo = ([x, y], [ax, ay]) => {
				return [x - ax, y - ay];
			};
			const pos = [x, y];
			if (core.domStyle.isVertical) {
				const itemBox = makeBox(
					[ITEM_BOX_LEFT_VERTICAL, ITEM_BOX_TOP_VERTICAL],
					[30 * 6 * 3, 31 * 4 * 3]
				);
				if (inRect(pos, itemBox)) {
					const [gx, gy] = gridify(relativeTo(pos, itemBox[0]), [30 * 3, 31 * 3]);
					const itemId = this.itemMx[gx][gy];
					if (
						(core.status.event.id == "viewMaps" ||
							core.status.event.id == "fly") &&
						itemId === "book"
					)
						core.openBook(true);
					if (
						core.isReplaying() ||
						core.status.lockControl ||
						core.isMoving()
					)
						return;
					useItem(itemId);
					return;
				}
				const toolBox = makeBox(
					[TOOL_BOX_LEFT_VERTICAL, TOOL_BOX_TOP_VERTICAL],
					[31 * 2 * 3, 31 * 4 * 3]
				);
				if (inRect(pos, toolBox)) {
					const [col, row] = gridify(relativeTo(pos, toolBox[0]), [31 * 3, 31 * 3]);
					if (core.isReplaying()) {
						this.replayAction[col][row].call(core);
					} else if (core.isPlaying()) {
						if (col === 0 && row === 3) {
							core.doSL("autoSave", "load");
						} else if (col === 1 && row === 3) {
							core.doSL("autoSave", "reload");
						} else {
							this.toolbarAction[col][row].call(core, true);
						}
					}
					return;
				}
				// 				const equipBox = makeBox(
				// 					[EQUIP_BLOCK_LEFT_VERTICAL, EQUIP_BLOCK_TOP_VERTICAL],
				// 					[90, 130]
				// 				);
				// 				if (inRect(pos, equipBox)) {
				// 					if (
				// 						core.isReplaying() ||
				// 						core.status.lockControl ||
				// 						core.isMoving()
				// 					)
				// 						return;
				// 					core.openEquipbox(true);
				// 					return;
				// 				}
			} else {
				// 				const equipBox = makeBox(
				// 					[EQUIP_BLOCK_LEFT, EQUIP_BLOCK_TOP],
				// 					[130, 95]
				// 				);
				// 				if (inRect(pos, equipBox)) {
				// 					if (
				// 						core.isReplaying() ||
				// 						core.status.lockControl ||
				// 						core.isMoving()
				// 					)
				// 						return;
				// 					core.openEquipbox(true);
				// 					return;
				// 				}
				const itemBox = makeBox(
					[ITEM_BOX_LEFT, ITEM_BOX_TOP],
					[31 * 4 * 3, 30 * 6 * 3]
				);
				if (inRect(pos, itemBox)) {
					const [gx, gy] = gridify(relativeTo(pos, itemBox[0]), [31 * 3, 30 * 3]);
					const itemId = this.itemMx[gy][gx];
					if (
						(core.status.event.id == "viewMaps" ||
							core.status.event.id == "fly") &&
						itemId === "book"
					)
						core.openBook(true);
					if (
						core.isReplaying() ||
						core.status.lockControl ||
						core.isMoving()
					)
						return;
					useItem(itemId);
					return;
				}
				const toolBox = makeBox(
					[TOOL_BOX_LEFT, TOOL_BOX_TOP],
					[31 * 4 * 3, 31 * 2 * 3]
				);
				if (inRect(pos, toolBox)) {
					const [row, col] = gridify(relativeTo(pos, toolBox[0]), [31 * 3, 31 * 3]);
					if (core.isReplaying()) {
						this.replayAction[col][row].call(core);
					} else if (core.isPlaying()) {
						if (col === 0 && row === 3) {
							core.doSL("autoSave", "load");
						} else if (col === 1 && row === 3) {
							core.doSL("autoSave", "reload");
						} else {
							this.toolbarAction[col][row].call(core, true);
						}
					}
					return;
				}
			}
		}
	}

	core.ui.statusBar = new StatusBar();

	core.control.clearStatusBar = function () {
		core.clearMap("outerUI");
	};
	// init() called in `afterLoadResources`.
},
    "override": function () {
	core.statusBar.icons = {
		floor: 0,
		name: null,
		lv: 1,
		hpmax: 2,
		hp: 3,
		atk: 4,
		def: 5,
		mdef: 6,
		money: 7,
		exp: 8,
		up: 9,
		book: 10,
		fly: 11,
		toolbox: 12,
		keyboard: 13,
		shop: 14,
		save: 15,
		load: 16,
		settings: 17,
		play: 18,
		pause: 19,
		stop: 20,
		speedDown: 21,
		speedUp: 22,
		rewind: 23,
		equipbox: 24,
		mana: 25,
		skill: 26,
		exit: 27,
		btn1: 28,
		btn2: 29,
		btn3: 30,
		btn4: 31,
		btn5: 32,
		btn6: 33,
		btn7: 34,
		alt: 35,
		keys: 36,
		help: 37,
		battle: 38,
	};
	core.actions._getClickLoc = function (x, y) {
		var size = 32 * core.domStyle.scale;
		var left = main.dom.gameDraw.offsetLeft + main.dom.gameGroup.offsetLeft;
		var top = main.dom.gameDraw.offsetTop + main.dom.gameGroup.offsetTop;
		var loc = {
			x: Math.max(x - left, 0),
			y: Math.max(y - top, 0),
			size: size,
		};
		return loc;
	};
	core.ui._drawWindowSelector = function (background, x, y, w, h) {
		w = Math.round(w) + 48;
		h = Math.round(h);
		var ctx = core.ui.createCanvas("_selector", x - 24, y, w, h, 165);
		ctx.canvas.id = "";
		this._drawSelector(ctx, background, w, h);
	};

	core.ui._drawSelector = function (ctx, background, w, h, left, top) {
		left = left || 0;
		top = top || 0;
		ctx = this.getContextByName(ctx);
		if (!ctx) return;
		if (typeof background == "string")
			background = core.material.images.images[background];
		if (!(background instanceof Image)) return;
		// badge
		ctx.drawImage(background, 132, 68, 24, 24, left + 4, top + 4, 24, 24);
		ctx.drawImage(
			background,
			132,
			68,
			24,
			24,
			w - left - 28,
			top + 4,
			24,
			24
		);
	};

	enemys.prototype._nextCriticals_useBinarySearch = function (
		enemy,
		info,
		number,
		x,
		y,
		floorId
	) {
		var mon_hp = info.mon_hp,
			hero_atk = core.status.hero.atk,
			mon_def = info.mon_def,
			pre = info.damage;
		var list = [];
		var start_atk = hero_atk;
		if (info.__over__) {
			start_atk += info.__overAtk__;
			list.push([info.__overAtk__, -info.damage]);
		}
		var calNext = function (currAtk, maxAtk) {
			var start = Math.floor(currAtk),
				end = Math.floor(maxAtk);
			if (start > end) return null;

			while (start < end) {
				var mid = Math.floor((start + end) / 2);
				if (mid - start > end - mid) mid--;
				var nextInfo = core.enemys.getDamageInfo(
					enemy, { atk: mid },
					x,
					y,
					floorId
				);
				if (nextInfo == null || typeof nextInfo == "number") return null;
				if (pre > nextInfo.damage) end = mid;
				else start = mid + 1;
			}
			var nextInfo = core.enemys.getDamageInfo(
				enemy, { atk: start },
				x,
				y,
				floorId
			);
			return nextInfo == null ||
				typeof nextInfo == "number" ||
				nextInfo.damage >= pre ?
				null : [start, nextInfo.damage];
		};
		var currAtk = start_atk;
		while (true) {
			var next = calNext(currAtk + 1, Number.MAX_SAFE_INTEGER, pre);
			if (next == null) break;
			currAtk = next[0];
			pre = next[1];
			list.push([currAtk - hero_atk, info.damage - pre]);
			if (pre <= 0 && !core.flags.enableNegativeDamage) break;
			if (list.length >= number) break;
		}
		if (list.length == 0) list.push([0, 0]);
		return list;
	};
	core.ui.clearMap = function (name, x, y, width, height) {
		if (name == "all") {
			for (var m in core.canvas) {
				core.canvas[m].clearRect(
					-32,
					-32,
					core.canvas[m].canvas.width + 32,
					core.canvas[m].canvas.height + 32
				);
			}
			core.clearMap("outerUI");
			core.dom.gif.innerHTML = "";
			core.removeGlobalAnimate();
			core.deleteCanvas(function (one) {
				return one.startsWith("_bigImage_");
			});
			core.setWeather(null);
		} else {
			var ctx = this.getContextByName(name);
			if (ctx)
				ctx.clearRect(
					x || 0,
					y || 0,
					width || ctx.canvas.width,
					height || ctx.canvas.height
				);
		}
	};
	events.prototype.openBook = function (fromUserAction) {
		if (core.isReplaying()) return;
		// 如果能恢复事件（从callBook事件触发）
		if (
			core.status.event.id == "book" &&
			core.events.recoverEvents(core.status.event.interval)
		)
			return;
		// 当前是book，且从“浏览地图”打开
		if (core.status.event.id == "book" && core.status.event.ui) {
			core.status.boxAnimateObjs = [];
			core.ui._drawViewMaps(core.status.event.ui);
			return;
		}
		// 从“浏览地图”页面打开
		if (core.status.event.id == "viewMaps" || core.status.event.id == "fly") {
			fromUserAction = false;
			core.status.event.ui = core.status.event.data;
		}
		if (!this._checkStatus("book", fromUserAction, true)) return;
		core.playSound("打开界面");
		core.useItem("book", true);
	};
	////// 怪物手册界面时，放开某个键的操作 //////
	core.actions._keyUpBook = function (keycode) {
		if (keycode == 27 || keycode == 88) {
			core.playSound("取消");
			if (core.events.recoverEvents(core.status.event.interval)) {
				return;
			} else if (core.status.event.ui != null) {
				core.status.boxAnimateObjs = [];
				if (typeof core.status.event.ui === "number") {
					core.status.event.id = "fly";
					core.ui.drawFly(core.status.event.ui);
				} else {
					core.ui._drawViewMaps(core.status.event.ui);
				}
			} else core.ui.closePanel();
			return;
		}
		if (keycode == 13 || keycode == 32 || keycode == 67) {
			var data = core.status.event.data;
			if (data != null) {
				core.ui._drawBookDetail(data);
			}
			return;
		}
	};
	////// 怪物手册界面的点击操作 //////
	actions.prototype._clickBook = function (x, y) {
		var pageinfo = core.ui._drawBook_pageinfo();
		// 上一页
		if (
			(x == this._HX_ - 2 || x == this._HX_ - 3) &&
			y === core._HEIGHT_ - 1
		) {
			core.playSound("光标移动");
			core.ui.drawBook(core.status.event.data - pageinfo.per_page);
			return;
		}
		// 下一页
		if (
			(x == this._HX_ + 2 || x == this._HX_ + 3) &&
			y === core._HEIGHT_ - 1
		) {
			core.playSound("光标移动");
			core.ui.drawBook(core.status.event.data + pageinfo.per_page);
			return;
		}
		// 返回
		if (x >= this.LAST - 2 && y === core._HEIGHT_ - 1) {
			core.playSound("取消");
			if (core.events.recoverEvents(core.status.event.interval)) {
				return;
			} else if (core.status.event.ui != null) {
				core.status.boxAnimateObjs = [];
				if (typeof core.status.event.ui === "number") {
					core.status.event.id = "fly";
					core.ui.drawFly(core.status.event.ui);
				} else {
					core.ui._drawViewMaps(core.status.event.ui);
				}
			} else core.ui.closePanel();
			return;
		}
		// 怪物信息
		var data = core.status.event.data;
		if (data != null && y < core._HEIGHT_ - 1) {
			var per_page = pageinfo.per_page,
				page = parseInt(data / per_page);
			var u = (core._HEIGHT_ - 1) / per_page;
			for (var i = 0; i < per_page; ++i) {
				if (y >= u * i && y < u * (i + 1)) {
					var index = per_page * page + i;
					core.ui.drawBook(index);
					core.ui._drawBookDetail(index);
					break;
				}
			}
			return;
		}
		return;
	};
	ui.prototype.fillBoldText = function (name, text, x, y, style, strokeStyle, lineWidth, font, maxWidth) {
		var ctx = this.getContextByName(name);
		if (!ctx) return;
		if (font) ctx.font = font;
		if (!style) style = ctx.fillStyle;
		style = core.arrayToRGBA(style);
		if (!strokeStyle) strokeStyle = '#000000';
		strokeStyle = core.arrayToRGBA(strokeStyle);
		if (maxWidth != null) {
			this.setFontForMaxWidth(ctx, text, maxWidth);
		}
		ctx.strokeStyle = strokeStyle;
		ctx.lineWidth = lineWidth ?? 2;
		ctx.strokeText(text, x, y);
		ctx.fillStyle = style;
		ctx.fillText(text, x, y);
	};
	////// 战斗 //////
	events.prototype.battle = function (id, x, y, force, callback) {
		core.saveAndStopAutomaticRoute();
		id = id || core.getBlockId(x, y);
		const cls = core.getClsFromId(id);
		if (!id || !cls || !(cls === 'enemys' || cls === 'enemy48')) return core.clearContinueAutomaticRoute(callback);
		if (!id) return core.clearContinueAutomaticRoute(callback);
		// 非强制战斗
		if (!core.enemys.canBattle(id, x, y) && !force && !core.status.event.id) {
			core.stopSound();
			core.playSound('操作失败');
			core.drawTip("你打不过此怪物！", id);
			return core.clearContinueAutomaticRoute(callback);
		}
		// 自动存档
		if (!core.status.event.id) core.autosave(true);
		// 战前事件
		if (!this.beforeBattle(id, x, y))
			return core.clearContinueAutomaticRoute(callback);
		// 战后事件
		this.afterBattle(id, x, y);
		if (callback) callback();
	}

},
    "额外信息": function () {
	/* 宝石血瓶左下角显示数值
	 * 注意！！！不要在道具属性中直接操作flags，使用core.status.hero.flags或core.setFlag系列函数代替！
	 * 需要将 变量：itemDetail改为true才可正常运行
	 * 请尽量减少勇士的属性数量，否则可能会出现严重卡顿（划掉，现在你放一万个属性也不会卡）
	 * 注意：这里的属性必须是core.status.hero里面的，flag无法显示
	 * 如果不想显示，可以core.setFlag("itemDetail", false);
	 * 然后再core.getItemDetail();
	 * 如有bug在大群或造塔群@古祠
	 */

	// 忽略的道具

	const ignore = ["superPotion"];

	// 取消注释下面这句可以减少超大地图的判定。
	// 如果地图宝石过多，可能会略有卡顿，可以尝试取消注释下面这句话来解决。
	// core.bigmap.threshold = 256;
	const origin = core.control.updateStatusBar;
	core.updateStatusBar = core.control.updateStatusBar = function () {
		if (core.getFlag("__statistics__")) return;
		else return origin.apply(core.control, arguments);
	};

	core.control.updateDamage = function (floorId, ctx) {
		floorId = floorId || core.status.floorId;
		if (!floorId || core.status.gameOver || main.mode != "play") return;
		const onMap = ctx == null;

		// 没有怪物手册
		if (!core.hasItem("book")) return;
		core.status.damage.posX = core.bigmap.posX;
		core.status.damage.posY = core.bigmap.posY;
		if (!onMap) {
			const width = core.floors[floorId].width,
				height = core.floors[floorId].height;
			// 地图过大的缩略图不绘制显伤
			if (width * height > core.bigmap.threshold) return;
		}
		this._updateDamage_damage(floorId, onMap);
		this._updateDamage_extraDamage(floorId, onMap);
		core.getItemDetail(floorId); // 宝石血瓶详细信息
		this.drawDamage(ctx);
	};
	// 获取宝石信息 并绘制
	this.getItemDetail = function (floorId) {
		if (!core.flags.itemDetail) return;
		if (!core.status.thisMap) return;
		floorId = floorId ?? core.status.thisMap.floorId;
		const beforeRatio = core.status.thisMap.ratio;
		core.status.thisMap.ratio = core.status.maps[floorId].ratio;
		let diff = {};
		const before = core.status.hero;
		const hero = core.clone(core.status.hero);
		const handler = {
			set(target, key, v) {
				diff[key] = v - (target[key] || 0);
				if (!diff[key]) diff[key] = void 0;
				return true;
			},
		};
		core.status.hero = new Proxy(hero, handler);
		core.status.maps[floorId].blocks.forEach(function (block) {
			if (
				block.event.cls !== "items" ||
				ignore.includes(block.event.id) ||
				block.disable
			)
				return;
			const x = block.x,
				y = block.y;
			// v2优化，只绘制范围内的部分
			if (core.bigmap.v2) {
				if (
					x < core.bigmap.posX - core.bigmap.extend ||
					x > core.bigmap.posX + core._WIDTH_ + core.bigmap.extend ||
					y < core.bigmap.posY - core.bigmap.extend ||
					y > core.bigmap.posY + core._HEIGHT_ + core.bigmap.extend
				) {
					return;
				}
			}
			diff = {};
			const id = block.event.id;
			const item = core.material.items[id];
			if (item.cls === "equips") {
				// 装备也显示
				const diff = item.equip.value ?? {};
				const per = item.equip.percentage ?? {};
				for (const name in per) {
					diff[name + "per"] = per[name].toString() + "%";
				}
				drawItemDetail(diff, x, y);
				return;
			}
			// 跟数据统计原理一样 执行效果 前后比较
			core.setFlag("__statistics__", true);
			try {
				eval(item.itemEffect);
			} catch (error) {}
			drawItemDetail(diff, x, y);
		});
		core.status.thisMap.ratio = beforeRatio;
		core.status.hero = before;
		window.hero = before;
		window.flags = before.flags;
	};

	// 绘制
	function drawItemDetail(diff, x, y) {
		const px = 32 * x + 2,
			py = 32 * y + 30;
		let content = "";
		// 获得数据和颜色
		let i = 0;
		for (const name in diff) {
			if (!diff[name]) continue;
			let color = "#fff";

			if (typeof diff[name] === "number")
				content = core.formatBigNumber(diff[name], true);
			else content = diff[name];
			switch (name) {
			case "atk":
			case "atkper":
				color = "#FF7A7A";
				break;
			case "def":
			case "defper":
				color = "#00E6F1";
				break;
			case "mdef":
			case "mdefper":
				color = "#6EFF83";
				break;
			case "hp":
				color = "#A4FF00";
				break;
			case "hpmax":
			case "hpmaxper":
				color = "#F9FF00";
				break;
			case "mana":
				color = "#c66";
				break;
			}
			// 绘制
			core.status.damage.data.push({
				text: content,
				px: px,
				py: py - 10 * i,
				color: color,
			});
			i++;
		}
	}
},
    "编辑器显伤": function () {
    // 在此增加新插件
    /////// 用户设置 ///////
    // 将__enable置为false将关闭插件
    var __enable = true;
    // 魔防攻速之类的属性可以在这里加 ['atk', 'def', 'mdef']
    var heroStatus = ["atk", "def", "mdef", "hp"];
    // saveHero为true 将会把每次造塔测试时的角色数据存下来 否则会读取初始属性
    // 用不着可以关了 节约缓存空间 (虽然根本没多少 还没一个存档大
    // 也可以手动清理 控制台输入core.removeLocalStorage('editorHero')即可
    var saveHero = true;

    // 下为具体实现 懒得写注释了 大概就是写HTML然后注册交互
    if (!__enable || main.mode != "editor") return;
    core.plugin.initEditorDamage = false;
    if (heroStatus.length >= 4 && !editor.isMobile)
      editor.dom.mid2.style.top = 650 + 30 * (heroStatus.length - 3) + "px";
    editor.statusRatio = core.getLocalStorage("statusRatio", 1);
    editor.saveHero = saveHero;
    editor._heroStatus = heroStatus;
    editor.dom.mapEdit.appendChild(core.canvas.damage.canvas);
    var HTML =
      "<input type='button' value='←'/><input type='button' value='↑'/><input type='button' value='↓'/><input type='button' value='→'/><input type='button' id='bigmapBtn' value='大地图'' style='margin-left: '5px'/>";

    //if (heroStatus.length >= 4 && !editor.isMobile) editor.dom.mid2.style.top = 650 + 30 * (heroStatus.length - 3) + 'px';
    heroStatus.forEach(function (status) {
      var id = status + "set",
        id2 = status + "add",
        id3 = status + "rec",
        id4 = status + "help";
      HTML +=
        "<br/><input type='text' size='15' id='" +
        id +
        "'><input type='button' id='" +
        id2 +
        "' value = '+'><input type='button' id='" +
        id3 +
        "' value = '-'><input type='button' value='?' id = '" +
        id4 +
        "'>";
    });
    document.getElementById("viewportButtons").innerHTML = HTML;
    ["set", "add", "rec", "help"].forEach(function (e) {
      heroStatus.forEach(function (status) {
        editor.dom[status + e] = document.getElementById(status + e);
      });
    });
    var _hasItem = core.items.hasItem;
    core.items.hasItem = function (itemId) {
      if (itemId == "book" && main.mode == "editor") return true;
      return _hasItem.call(core.items, itemId);
    };
    if (main.mode == "editor") {
      var applyList = [
        "getDamageString",
        "nextCriticals",
        "getEnemyInfo",
        "getEnemyValue",
      ];
      applyList.forEach(function (name) {
        var func = core.enemys[name];
        core.enemys[name] = function () {
          var args =
            arguments.length === 1
              ? [arguments[0]]
              : Array.apply(null, arguments);
          if (typeof args[0] == "string") args[0] = core.enemys.enemys[args[0]];
          return func.apply(core.enemys, args);
        };
      });
    }

    ////// 获得勇士属性 //////
    core.control.getStatus = function (name) {
      if (!core.status.hero) return null;
      if (name == "x" || name == "y" || name == "direction")
        return this.getHeroLoc(name);
      /*if ( main.mode == 'editor' && !core.hasFlag('__statistics__')) {
			return data_a1e2fb4a_e986_4524_b0da_9b7ba7c0874d.firstData.hero[name];
		}*/
      return core.status.hero[name];
    };

    core.control.updateDamage = function (floorId, ctx) {
      floorId = floorId || core.status.floorId;
      if (!floorId || core.status.gameOver) return;
      var onMap = ctx == null;
      if (main.mode == "editor") {
        ctx = core.canvas.damage;
        core.updateCheckBlock();
        core.clearMap(ctx);
        if (editor.uivalues.bigmap) return;
      }

      // 没有怪物手册
      if (!core.hasItem("book")) return;
      core.status.damage.posX = core.bigmap.posX;
      core.status.damage.posY = core.bigmap.posY;
      if (!onMap) {
        var width = core.floors[floorId].width,
          height = core.floors[floorId].height;
        // 地图过大的缩略图不绘制显伤
        if (width * height > core.bigmap.threshold) return;
      }
      this._updateDamage_damage(floorId, onMap);
      this._updateDamage_extraDamage(floorId, onMap);
      this.drawDamage(ctx);
    };

    core.control.drawDamage = function (ctx) {
      if (
        core.status.gameOver ||
        !core.status.damage /* || main.mode != 'play'*/
      )
        return;
      var onMap = false;
      if (ctx == null) {
        ctx = core.canvas.damage;
        core.clearMap("damage");
        onMap = true;
      }

      if (onMap && core.bigmap.v2) {
        // 检查是否需要重算...
        if (
          Math.abs(core.bigmap.posX - core.status.damage.posX) >=
            core.bigmap.extend - 1 ||
          Math.abs(core.bigmap.posY - core.status.damage.posY) >=
            core.bigmap.extend - 1
        ) {
          return this.updateDamage();
        }
      }
      return this._drawDamage_draw(ctx, onMap);
    };

    ////// 以x,y的形式返回每个点的事件 //////
    core.maps.getMapBlocksObj = function (floorId, noCache) {
      floorId = floorId || core.status.floorId;
      if (
        core.status.mapBlockObjs[floorId] &&
        !noCache &&
        main.mode != "editor"
      )
        return core.status.mapBlockObjs[floorId];

      var obj = {};
      core.extractBlocks(floorId);
      core.status.maps[floorId].blocks.forEach(function (block) {
        obj[block.x + "," + block.y] = block;
      });
      core.status.mapBlockObjs[floorId] = obj;
      return obj;
    };

    this.bignum = function (num, defaultValue) {
      if (num == null || num == "") return defaultValue;
      num = num + "";
      var list = {
        w: 1e4,
        e: 1e8,
        z: 1e12,
        j: 1e16,
        g: 1e20,
      };
      // 浮点数问题
      function checkFloat(num) {
        if (!core.isset(num)) return 0;
        num = num + "";
        var index = num.indexOf(".");
        if (index < 0) return 0;
        else return num.slice(index + 1).length;
      }
      var index = num.search(/w|e|z|j|g/);
      if (index <= 0) {
        num = parseInt(num);
        if (core.isset(num)) return num;
        else {
          alert("不正确的输入");
          return defaultValue;
        }
      }
      for (; index > 0; index = num.search(/w|e|z|j|g/)) {
        var p = num[index],
          q = list[p],
          n = num.slice(0, index),
          m = Math.pow(10, checkFloat(n));
        num = (n * m * q) / m + num.slice(index + 1);
      }
      return parseInt(num);
    };

    this.updateEditorDamage = function (noSave) {
      core.updateDamage();
      heroStatus.forEach(function (status) {
        editor.dom[status + "set"].value = core.status.hero[status];
      });
      if (!noSave && editor.saveHero)
        core.setLocalStorage("editorHero", core.status.hero);
    };

    var _resizeMap = core.maps.resizeMap;
    core.maps.resizeMap = function (floorId) {
      _resizeMap.call(core.maps, floorId);
      if (!core.plugin.initEditorDamage && main.mode == "editor") {
        core.plugin.initEditorDamage = true;
        var editorHero = core.getLocalStorage("editorHero");
        if (editorHero && saveHero) core.status.hero = editorHero;
        else core.removeLocalStorage("editorHero");
        editor._heroStatus.forEach(function (e) {
          editor.dom[e + "set"].onchange = function () {
            var status = this.id.slice(0, -3);
            core.status.hero[status] = core.bignum(
              this.value,
              core.status.hero[status]
            );
            core.updateEditorDamage();
          };
          editor.dom[e + "add"].onclick = function () {
            var status = this.id.slice(0, -3);
            core.status.hero[status] += editor.statusRatio;
            core.updateEditorDamage();
          };
          editor.dom[e + "rec"].onclick = function () {
            var status = this.id.slice(0, -3);
            core.status.hero[status] -= editor.statusRatio;
            core.updateEditorDamage();
          };
          editor.dom[e + "help"].onclick = function () {
            var status = this.id.slice(0, -4),
              name = core.getStatusLabel(status);
            var ratio = parseInt(
              prompt(
                "当前属性:" +
                  name +
                  "\n现在的点击按钮变化值:" +
                  editor.statusRatio +
                  ",请输入按下一次+/-按钮的属性变化量,可以写4w 10.2e这种字母缩写"
              )
            );
            if (!core.isset(ratio)) {
              printe("不合法的输入");
              return;
            }
            editor.statusRatio = ratio;
            core.setLocalStorage("statusRatio", ratio);
          };
        });
        var _updateMap = editor.updateMap;
        editor.updateMap = function () {
          _updateMap.call(editor);
          core.updateEditorDamage(true);
        };
        editor.mode.onmode = function (mode, callback) {
          if (editor_mode.mode != mode) {
            if (mode === "save") {
              editor_mode.doActionList(
                editor_mode.mode,
                editor_mode.actionList,
                function () {
                  if (callback) callback();
                  core.updateEditorDamage();
                }
              );
            }
            if (editor_mode.mode === "nextChange" && mode)
              editor_mode.showMode(mode);
            if (mode !== "save") editor_mode.mode = mode;
            editor_mode.actionList = [];
          }
        };
      }
    };
  },
    "手册区分特殊属性": function () {
	// 在此增加新插件
	this.arrsame = function (Arraya, Arrayb) {
		let a = Arraya || [];
		let b = Arrayb || [];
		if (typeof a === "number") a = [a];
		if (typeof b === "number") b = [b];
		let c = [...a, ...b];
		for (const i of c)
			if (!a.includes(i) || !b.includes(i)) {
				return false;
			}
		return true;
	};
	enemys.prototype.getCurrentEnemys = function (floorId) {
		floorId = floorId || core.status.floorId;
		var enemys = [],
			used = {};
		core.extractBlocks(floorId);
		core.status.maps[floorId].blocks.forEach(function (block) {
			if (!block.disable && block.event.cls.indexOf("enemy") == 0) {
				this._getCurrentEnemys_addEnemy(
					block.event.id,
					enemys,
					used,
					block.x,
					block.y,
					floorId
				);
			}
		}, this);
		return this._getCurrentEnemys_sort(enemys);
	};

	enemys.prototype._getCurrentEnemys_getEnemy = function (enemyId) {
		var enemy = core.material.enemys[enemyId];
		if (!enemy) return null;

		// 检查朝向；displayIdInBook
		return (
			core.material.enemys[enemy.displayIdInBook] ||
			core.material.enemys[(enemy.faceIds || {}).down] ||
			enemy
		);
	};

	enemys.prototype._getCurrentEnemys_addEnemy = function (
		enemyId,
		enemys,
		used,
		x,
		y,
		floorId
	) {
		var enemy = this._getCurrentEnemys_getEnemy(enemyId);
		if (enemy == null) return;

		var id = enemy.id;

		var enemyInfo = this.getEnemyInfo(enemy, null, null, null, floorId);
		var locEnemyInfo = this.getEnemyInfo(enemy, null, x, y, floorId);
		if (
			!core.flags.enableEnemyPoint ||
			(locEnemyInfo.atk == enemyInfo.atk &&
				locEnemyInfo.def == enemyInfo.def &&
				locEnemyInfo.hp == enemyInfo.hp &&
				core.plugin.arrsame(locEnemyInfo.special, enemyInfo.special))
		) {
			x = null;
			y = null;
		} else {
			// 检查enemys里面是否使用了存在的内容
			for (var i = 0; i < enemys.length; ++i) {
				var one = enemys[i];
				if (
					id == one.id &&
					one.locs != null &&
					locEnemyInfo.atk == one.atk &&
					locEnemyInfo.def == one.def &&
					locEnemyInfo.hp == one.hp &&
					core.plugin.arrsame(locEnemyInfo.special, one.special)
				) {
					one.locs.push([x, y]);
					return;
				}
			}
			enemyInfo = locEnemyInfo;
		}

		var id = enemy.id + ":" + x + ":" + y;
		if (used[id]) return;
		used[id] = true;

		var specialText = core.enemys.getSpecialText(enemy, x, y, floorId);
		var specialColor = core.enemys.getSpecialColor(enemy, x, y, floorId);

		var critical = this.nextCriticals(enemy, 1, x, y, floorId);
		if (critical.length > 0) critical = critical[0];

		var e = core.clone(enemy);
		for (var v in enemyInfo) {
			e[v] = enemyInfo[v];
		}
		if (x != null && y != null) {
			e.locs = [
				[x, y]
			];
		}
		e.name = core.getEnemyValue(enemy, "name", x, y, floorId);
		e.specialText = specialText;
		e.specialColor = specialColor;
		e.damage = this.getDamage(enemy, x, y, floorId);
		e.critical = critical[0];
		e.criticalDamage = critical[1];
		e.defDamage = this._getCurrentEnemys_addEnemy_defDamage(
			enemy,
			x,
			y,
			floorId
		);
		enemys.push(e);
	};

	enemys.prototype._getCurrentEnemys_addEnemy_defDamage = function (
		enemy,
		x,
		y,
		floorId
	) {
		var ratio = core.status.maps[floorId || core.status.floorId].ratio || 1;
		return this.getDefDamage(enemy, ratio, x, y, floorId);
	};

	enemys.prototype._getCurrentEnemys_sort = function (enemys) {
		return enemys.sort(function (a, b) {
			if (a.damage == b.damage) {
				return a.money - b.money;
			}
			if (a.damage == null) {
				return 1;
			}
			if (b.damage == null) {
				return -1;
			}
			return a.damage - b.damage;
		});
	};

	////// 获得所有特殊属性的名称 //////
	enemys.prototype.getSpecialText = function (enemy, x, y, floorId) {
		if (typeof enemy == "string")
			enemy = this.getEnemyInfo(enemy, null, x, y, floorId);
		if (!enemy) return [];
		var special = enemy.special;
		var text = [];

		var specials = this.getSpecials();
		if (specials) {
			for (var i = 0; i < specials.length; i++) {
				if (this.hasSpecial(special, specials[i][0]))
					text.push(this._calSpecialContent(enemy, specials[i][1]));
			}
		}
		return text;
	};

	////// 获得所有特殊属性的颜色 //////
	enemys.prototype.getSpecialColor = function (enemy, x, y, floorId) {
		if (typeof enemy == "string")
			enemy = this.getEnemyInfo(enemy, null, x, y, floorId);
		if (!enemy) return [];
		var special = enemy.special;
		var colors = [];

		var specials = this.getSpecials();
		if (specials) {
			for (var i = 0; i < specials.length; i++) {
				if (this.hasSpecial(special, specials[i][0]))
					colors.push(specials[i][3] || null);
			}
		}
		return colors;
	};

	////// 获得所有特殊属性的额外标记 //////
	enemys.prototype.getSpecialFlag = function (enemy, x, y, floorId) {
		if (typeof enemy == "string")
			enemy = getEnemyInfo(enemy, null, x, y, floorId);
		if (!enemy) return [];
		var special = enemy.special;
		var flag = 0;

		var specials = this.getSpecials();
		if (specials) {
			for (var i = 0; i < specials.length; i++) {
				if (this.hasSpecial(special, specials[i][0]))
					flag |= specials[i][4] || 0;
			}
		}
		return flag;
	};

	////// 获得每个特殊属性的说明 //////
	enemys.prototype.getSpecialHint = function (enemy, special) {
		var specials = this.getSpecials();
		if (special == null) {
			if (specials == null) return [];
			var hints = [];
			for (var i = 0; i < specials.length; i++) {
				if (this.hasSpecial(enemy, specials[i][0]))
					hints.push(
						"\r[" +
						core.arrayToRGBA(specials[i][3] || "#FF6A6A") +
						"]\\d" +
						this._calSpecialContent(enemy, specials[i][1]) +
						"：\\d\r[]" +
						this._calSpecialContent(enemy, specials[i][2])
					);
			}
			return hints;
		}

		if (specials == null) return "";
		for (var i = 0; i < specials.length; i++) {
			if (special == specials[i][0])
				return (
					"\r[#FF6A6A]\\d" +
					this._calSpecialContent(enemy, specials[i][1]) +
					"：\\d\r[]" +
					this._calSpecialContent(enemy, specials[i][2])
				);
		}
		return "";
	};
	ui.prototype._drawBook_drawName = function (
		index,
		enemy,
		top,
		left,
		width
	) {
		// 绘制第零列（名称和特殊属性）
		// 如果需要添加自己的比如怪物的称号等，也可以在这里绘制
		core.setTextAlign("ui", "center");
		if (core.enemys.getSpecialText(enemy).length == 0) {
			core.fillText(
				"ui",
				enemy.name,
				left + width / 2,
				top + 35,
				"#DDDDDD",
				this._buildFont(17, true),
				width
			);
		} else {
			core.fillText(
				"ui",
				enemy.name,
				left + width / 2,
				top + 28,
				"#DDDDDD",
				this._buildFont(17, true),
				width
			);
			switch (core.enemys.getSpecialText(enemy).length) {
			case 1:
				core.fillText(
					"ui",
					core.enemys.getSpecialText(enemy)[0],
					left + width / 2,
					top + 50,
					core.arrayToRGBA(
						(core.enemys.getSpecialColor(enemy) || [])[0] || "#FF6A6A"
					),
					this._buildFont(15, true),
					width
				);
				break;
			case 2:
				// Step 1: 计算字体
				var text =
					core.enemys.getSpecialText(enemy)[0] +
					"  " +
					core.enemys.getSpecialText(enemy)[1];
				core.setFontForMaxWidth(
					"ui",
					text,
					width,
					this._buildFont(15, true)
				);
				// Step 2: 计算总宽度
				var totalWidth = core.calWidth("ui", text);
				var leftWidth = core.calWidth(
					"ui",
					core.enemys.getSpecialText(enemy)[0]
				);
				var rightWidth = core.calWidth(
					"ui",
					core.enemys.getSpecialText(enemy)[1]
				);
				// Step 3: 绘制
				core.fillText(
					"ui",
					core.enemys.getSpecialText(enemy)[0],
					left + (width + leftWidth - totalWidth) / 2,
					top + 50,
					core.arrayToRGBA(
						(core.enemys.getSpecialColor(enemy) || [])[0] || "#FF6A6A"
					)
				);
				core.fillText(
					"ui",
					core.enemys.getSpecialText(enemy)[1],
					left + (width + totalWidth - rightWidth) / 2,
					top + 50,
					core.arrayToRGBA(
						(core.enemys.getSpecialColor(enemy) || [])[1] || "#FF6A6A"
					)
				);
				break;
			default:
				core.fillText(
					"ui",
					"多属性...",
					left + width / 2,
					top + 50,
					"#FF6A6A",
					this._buildFont(15, true),
					width
				);
			}
		}
	};
	ui.prototype._drawBookDetail_getInfo = function (index) {
		var floorId =
			core.floorIds[(core.status.event.ui || {}).index] ||
			core.status.floorId;
		// 清除浏览地图时的光环缓存
		if (floorId != core.status.floorId && core.status.checkBlock) {
			core.status.checkBlock.cache = {};
		}
		var enemys = core.enemys.getCurrentEnemys(floorId);
		//console.log(123);
		if (enemys.length == 0) return [];
		index = core.clamp(index, 0, enemys.length - 1);
		var enemy = enemys[index],
			enemyId = enemy.id;
		var texts = core.enemys.getSpecialHint(enemyId);
		if (texts.length == 0) texts.push("该怪物无特殊属性。");
		if (enemy.description) texts.push(enemy.description + "\r");
		this._drawBookDetail_getTexts(enemy, floorId, texts);
		texts.push("");
		return [enemy, texts];
	};
},
    "一防减伤": function () {
	// 在此增加新插件

	ui.prototype._drawBook_drawRow3 = function (
		index,
		enemy,
		top,
		left,
		width,
		position
	) {
		if (!core.flags.enableBookRow3) {

			// 绘制第三行
			core.setTextAlign('ui', 'left');
			var b13 = this._buildFont(13, true),
				f13 = this._buildFont(13, false);
			var col1 = left,
				col2 = left + width * 9 / 25,
				col3 = left + width * 17 / 25;
			core.fillText('ui', '临界', col1, position, '#DDDDDD', f13);
			core.fillText('ui', core.formatBigNumber(enemy.critical || 0), col1 + 30, position, null, b13);
			core.fillText('ui', '减伤', col2, position, null, f13);
			core.fillText('ui', core.formatBigNumber(enemy.criticalDamage || 0), col2 + 30, position, null, b13);
			core.fillText('ui', '加防', col3, position, null, f13);
			core.fillText('ui', core.formatBigNumber(enemy.defDamage || 0), col3 + 30, position, null, b13);

		} else {
			// 绘制第三行
			core.setTextAlign("ui", "left");
			var b13 = this._buildFont(13, true),
				f13 = this._buildFont(13, false);
			var col1 = left,
				col2 = left + (width * 9) / 25,
				col3 = left + (width * 17) / 25;
			core.fillText("ui", "临界", col1, position, "#DDDDDD", f13);
			core.fillText(
				"ui",
				core.formatBigNumber(enemy.critical || 0),
				col1 + 30,
				position,
				null,
				b13
			);
			core.fillText("ui", "减伤", col2, position, null, f13);
			core.fillText(
				"ui",
				core.formatBigNumber(enemy.criticalDamage || 0),
				col2 + 30,
				position,
				null,
				b13
			);
			//core.fillText('ui', '加防', col3, position, null, f13);
			core.fillText("ui", "1防", col3, position, null, f13);
			core.fillText(
				"ui",
				core.formatBigNumber(enemy.defDamage || 0),
				col3 + 30,
				position,
				null,
				b13
			);
		};
		////// 1防减伤计算 //////
		enemys.prototype.getDefDamage = function (enemy, k, x, y, floorId) {
			if (typeof enemy == "string") enemy = core.material.enemys[enemy];
			k = k || 1;
			var nowDamage = this._getDamage(enemy, null, x, y, floorId);
			var nextDamage = this._getDamage(
				enemy, { def: core.status.hero.def + k },
				x,
				y,
				floorId
			);
			if (nowDamage == null || nextDamage == null) return "???";
			return nowDamage - nextDamage;
		};
		//防御倍数
		enemys.prototype._getCurrentEnemys_addEnemy_defDamage = function (
			enemy,
			x,
			y,
			floorId
		) {
			var ratio = core.status.maps[floorId || core.status.floorId].ratio || 1;
			//第一行为按照ratio值计算减防，第二行为1防减伤
			//return this.getDefDamage(enemy, ratio, x, y, floorId);
			return this.getDefDamage(enemy, null, x, y, floorId);
		};
	}

},
    "新道具栏/装备栏": function () {
    // 在此增加新插件
    // 注：///// *** 裹起来的区域： 该区域内参数可以随意更改调整ui绘制 不会影响总体布局
    // 请尽量修改该区域而不是其他区域 修改的时候最好可以对照现有ui修改

    ///// *** 道具类型
    // cls对应name
    var itemClsName = {
      constants: "永久道具",
      tools: "消耗道具",
    };
    // 一页最大放的道具数量 将把整个道具左栏分成num份 每份是一个道具项
    var itemNum = 12;
    ///// ***

    // 背景设置
    this.drawBoxBackground = function (ctx) {
      core.setTextAlign(ctx, "left");
      core.clearMap(ctx);
      core.deleteCanvas("_selector");
      var info = core.status.thisUIEventInfo || {};

      ///// *** 背景设置
      var max = core.__PIXELS__;
      var x = 2,
        y = x,
        w = max - x * 2,
        h = w;
      var borderWidth = 2,
        borderRadius = 5, // radius:圆角矩形的圆角半径
        borderStyle = "#fff";
      var backgroundColor = "gray";
      // 设置背景不透明度(0.85)
      var backgroundAlpha = 0.85;
      ///// ***

      var start_x = x + borderWidth / 2,
        start_y = y + borderWidth / 2,
        width = max - start_x * 2,
        height = max - start_y * 2;

      // 渐变色背景的一个例子(黑色渐变白色)：
      // 有关渐变色的具体知识请网上搜索canvas createGradient了解
      /*
		   var grd = ctx.createLinearGradient(x, y, x + w, y);
		   grd.addColorStop(0, "black");
		   grd.addColorStop(1, "white");
		   backgroundColor = grd;
		*/
      // 使用图片背景要注释掉下面的strokeRect和fillRoundRect
      // 图片背景的一个例子：
      /*
		   core.drawImage(ctx, "xxx.png", x, y, w, h);
		   core.strokeRect(ctx, x, y, w, h, borderStyle, borderWidth);
		*/
      core.setAlpha(ctx, backgroundAlpha);
      core.strokeRoundRect(
        ctx,
        x,
        y,
        w,
        h,
        borderRadius,
        borderStyle,
        borderWidth
      );
      core.fillRoundRect(
        ctx,
        start_x,
        start_y,
        width,
        height,
        borderRadius,
        backgroundColor
      );
      core.setAlpha(ctx, 1);

      ///// *** 左栏配置
      var leftbar_height = height;
      // 左边栏宽度(width*0.6) 本身仅为坐标使用 需要与底下的rightbar_width(width*0.4)同时更改
      var leftbar_width = width * 0.6;
      ///// ***

      // xxx_right参数 代表最右侧坐标
      var leftbar_right = start_x + leftbar_width - borderWidth / 2;
      var leftbar_bottom = start_y + leftbar_height;
      var leftbar_x = start_x;
      var leftbar_y = start_y;

      ///// *** 道具栏配置
      var boxName_color = "#fff";
      var boxName_fontSize = 15;
      var boxName_font = core.ui._buildFont(boxName_fontSize, true);
      var arrow_x = 10 + start_x;
      var arrow_y = 10 + start_y;
      var arrow_width = 20;
      var arrow_style = "white";
      // 暂时只能是1 否则不太行 等待新样板(2.7.3)之后对drawArrow做优化
      var arrow_lineWidth = 1;
      // 右箭头
      var rightArrow_right = leftbar_right - 10;
      // 道具内栏顶部坐标 本质是通过该项 控制(道具栏顶部文字和箭头)与道具内栏顶部的间隔
      var itembar_top = arrow_y + 15;
      ///// ***

      var itembar_right = rightArrow_right;
      var boxName =
        core.status.event.id == "toolbox"
          ? "\r[yellow]道具栏\r | 装备栏"
          : "道具栏 | \r[yellow]装备栏\r";
      core.drawArrow(
        ctx,
        arrow_x + arrow_width,
        arrow_y,
        arrow_x,
        arrow_y,
        arrow_style,
        arrow_lineWidth
      );
      core.drawArrow(
        ctx,
        rightArrow_right - arrow_width,
        arrow_y,
        rightArrow_right,
        arrow_y,
        arrow_style,
        arrow_lineWidth
      );
      core.setTextAlign(ctx, "center");
      core.setTextBaseline(ctx, "middle");
      var changeBox = function () {
        var id = core.status.event.id;
        core.closePanel();
        if (id == "toolbox") core.openEquipbox();
        else core.openToolbox();
      };
      core.fillText(
        ctx,
        boxName,
        (leftbar_right + leftbar_x) / 2,
        arrow_y + 2,
        boxName_color,
        boxName_font
      );

      ///// *** 底栏按钮
      var pageBtn_radius = 8;
      // xxx_left 最左侧坐标
      var pageBtn_left = leftbar_x + 3;
      var pageBtn_right = leftbar_right - 3;
      // xxx_bottom 最底部坐标
      var pageBtn_bottom = leftbar_bottom - 2;
      var pageBtn_borderStyle = "#fff";
      var pageBtn_borderWidth = 2;
      var pageText_color = "#fff";
      // 底部按钮与上面的道具内栏的间隔大小
      var bottomSpace = 8;
      ///// ***

      core.drawItemListbox_setPageBtn(
        ctx,
        pageBtn_left,
        pageBtn_right,
        pageBtn_bottom,
        pageBtn_radius,
        pageBtn_borderStyle,
        pageBtn_borderWidth
      );
      var page = info.page || 1;
      var pageFontSize = pageBtn_radius * 2 - 4;
      var pageFont = core.ui._buildFont(pageFontSize);
      core.setPageItems(page);
      var num = itemNum;
      if (core.status.event.id == "equipbox") num -= 5;
      var maxPage = info.maxPage;
      var pageText = page + " / " + maxPage;
      core.setTextAlign(ctx, "center");
      core.setTextBaseline(ctx, "bottom");
      core.fillText(
        ctx,
        pageText,
        (leftbar_x + leftbar_right) / 2,
        pageBtn_bottom,
        pageText_color,
        pageFont
      );
      core.addUIEventListener(
        start_x,
        start_y,
        leftbar_right - start_x,
        arrow_y - start_y + 13,
        changeBox
      );
      var itembar_height = Math.ceil(
        pageBtn_bottom -
          pageBtn_radius * 2 -
          pageBtn_borderWidth / 2 -
          bottomSpace -
          itembar_top
      );
      var oneItemHeight = (itembar_height - 4) / itemNum;
      return {
        x: start_x,
        y: start_y,
        width: width,
        height: height,
        leftbar_right: leftbar_right,
        obj: {
          x: arrow_x,
          y: itembar_top,
          width: itembar_right - arrow_x,
          height: itembar_height,
          oneItemHeight: oneItemHeight,
        },
      };
    };

    this.drawItemListbox = function (ctx, obj) {
      ctx = ctx || core.canvas.ui;
      var itembar_x = obj.x,
        itembar_y = obj.y,
        itembar_width = obj.width,
        itembar_height = obj.height,
        itemNum = obj.itemNum,
        oneItemHeight = obj.oneItemHeight;
      var itembar_right = itembar_x + itembar_width;
      var info = core.status.thisUIEventInfo || {};
      var obj = {};
      var page = info.page || 1,
        index = info.index,
        select = info.select || {};

      ///// *** 道具栏内栏配置
      var itembar_style = "black";
      var itembar_alpha = 0.7;
      // 一个竖屏下减少道具显示的例子:
      // if (core.domStyle.isVertical) itemNum = 10;
      // 每个道具项的上下空隙占总高度的比例
      var itembar_marginHeightRatio = 0.2;
      // 左右间隔空隙
      var item_marginLeft = 2;
      var item_x = itembar_x + 2,
        item_y = itembar_y + 2,
        item_right = itembar_right - 2,
        itemName_color = "#fff";
      // 修改此项以更换闪烁光标
      var item_selector = "winskin.png";
      ///// ***

      core.setAlpha(ctx, itembar_alpha);
      core.fillRect(
        ctx,
        itembar_x,
        itembar_y,
        itembar_width,
        itembar_height,
        itembar_style
      );
      core.setAlpha(ctx, 1);
      var pageItems = core.setPageItems(page);
      var marginHeight = itembar_marginHeightRatio * oneItemHeight;
      core.setTextBaseline(ctx, "middle");
      var originColor = itemName_color;
      for (var i = 0; i < pageItems.length; i++) {
        itemName_color = originColor;
        var item = pageItems[i];
        // 设置某个的字体颜色的一个例子
        // if (item.id == "xxx") itemName_color = "green";
        core.drawItemListbox_drawItem(
          ctx,
          item_x,
          item_right,
          item_y,
          oneItemHeight,
          item_marginLeft,
          marginHeight,
          itemName_color,
          pageItems[i]
        );
        if (index == i + 1)
          core.ui._drawWindowSelector(
            item_selector,
            item_x + 1,
            item_y - 1,
            item_right - item_x - 2,
            oneItemHeight - 2
          );
        item_y += oneItemHeight;
      }
    };

    this.drawToolboxRightbar = function (ctx, obj) {
      ctx = ctx || core.canvas.ui;
      var info = core.status.thisUIEventInfo || {};
      var page = info.page || 1,
        index = info.index || 1,
        select = info.select || {};
      var start_x = obj.x,
        start_y = obj.y,
        width = obj.width,
        height = obj.height;
      var toolboxRight = start_x + width,
        toolboxBottom = start_y + height;

      ///// *** 侧边栏(rightbar)背景设置(物品介绍)
      var rightbar_width = width * 0.4;
      var rightbar_height = height;
      var rightbar_lineWidth = 2;
      var rightbar_lineStyle = "#fff";
      ///// ***

      var rightbar_x = toolboxRight - rightbar_width - rightbar_lineWidth / 2;
      var rightbar_y = start_y;
      core.drawLine(
        ctx,
        rightbar_x,
        rightbar_y,
        rightbar_x,
        rightbar_y + rightbar_height,
        rightbar_lineStyle,
        rightbar_lineWidth
      );

      // 获取道具id(有可能为null)
      var itemId = select.id;
      var item = core.material.items[itemId];

      ///// *** 侧边栏物品Icon信息
      var iconRect_y = rightbar_y + 10;
      // space：间距
      // 这里布局设定iconRect与侧边栏左边框 itemName与工具栏右边框 itemRect与itemName的间距均为space
      var space = 15;
      var iconRect_x = rightbar_x + space;
      var iconRect_radius = 2,
        iconRect_width = 32,
        iconRect_height = 32,
        iconRect_style = "#fff",
        iconRect_lineWidth = 2;
      ///// ***

      var iconRect_bottom = iconRect_y + iconRect_height,
        iconRect_right = iconRect_x + iconRect_width;

      ///// *** 侧边栏各项信息
      var itemTextFontSize = 15,
        itemText_x = iconRect_x - 4,
        itemText_y = Math.floor(start_y + rightbar_height * 0.25), // 坐标取整防止模糊
        itemClsFontSize = 15,
        itemClsFont = core.ui._buildFont(itemClsFontSize),
        itemClsColor = "#fff",
        itemCls_x = itemText_x - itemClsFontSize / 2,
        itemCls_middle = (iconRect_bottom + itemText_y) / 2, //_middle代表文字的中心y坐标
        itemNameFontSize = 18,
        itemNameColor = "#fff",
        itemNameFont = core.ui._buildFont(itemNameFontSize, true);
      var itemName_x = iconRect_right + space;
      var itemName_middle =
        iconRect_y + iconRect_height / 2 + iconRect_lineWidth;
      // 修改这里可以编辑未选中道具时的默认值
      var defaultItem = {
        cls: "constants",
        name: "未知道具",
        text: "没有道具最永久",
      };
      var defaultEquip = {
        cls: "equips",
        name: "未知装备",
        text: "一无所有，又何尝不是一种装备",
        equip: {
          type: "装备",
        },
      };
      ///// ***

      var originItem = item;
      if (core.status.event.id == "equipbox") item = item || defaultEquip;
      item = item || defaultItem;
      var itemCls = item.cls,
        itemName = item.name,
        itemText = item.text;
      itemText = core.replaceText(itemText);
      if (itemText[0] == "," || itemText[0] == "，")
        itemText = itemText.substring(1);
      /* 一个根据道具id修改道具名字(右栏)的例子
       * if (item.id == "xxx") itemNameColor = "red";
       */
      var itemClsName = core.getItemClsName(item);
      var itemNameMaxWidth =
        rightbar_width - iconRect_width - iconRect_lineWidth * 2 - space * 2;
      core.strokeRoundRect(
        ctx,
        iconRect_x,
        iconRect_y,
        iconRect_width,
        iconRect_height,
        iconRect_radius,
        iconRect_style,
        iconRect_lineWidth
      );
      if (item.id)
        core.drawIcon(
          ctx,
          item.id,
          iconRect_x + iconRect_lineWidth / 2,
          iconRect_y + iconRect_lineWidth / 2,
          iconRect_width - iconRect_lineWidth,
          iconRect_height - iconRect_lineWidth
        );
      core.setTextAlign(ctx, "left");
      core.setTextBaseline(ctx, "middle");
      core.fillText(
        ctx,
        itemName,
        itemName_x,
        itemName_middle,
        itemNameColor,
        itemNameFont,
        itemNameMaxWidth
      );
      core.fillText(
        ctx,
        "【" + itemClsName + "】",
        itemCls_x,
        itemCls_middle,
        itemClsColor,
        itemClsFont
      );
      var statusText = "";
      if (core.status.event.id == "equipbox") {
        var type = item.equip.type;
        if (typeof type == "string") type = core.getEquipTypeByName(type);
        var compare = core.compareEquipment(item.id, core.getEquip(type));
        if (info.select.action == "unload")
          compare = core.compareEquipment(null, item.id);
        // --- 变化值...
        for (var name in core.status.hero) {
          if (typeof core.status.hero[name] != "number") continue;
          var nowValue = core.getRealStatus(name);
          // 查询新值
          var newValue = Math.floor(
            ((core.getStatus(name) + (compare.value[name] || 0)) *
              (core.getBuff(name) * 100 + (compare.percentage[name] || 0))) /
              100
          );
          if (nowValue == newValue) continue;
          var color = newValue > nowValue ? "#00FF00" : "#FF0000";
          nowValue = core.formatBigNumber(nowValue);
          newValue = core.formatBigNumber(newValue);
          statusText +=
            core.getStatusLabel(name) +
            " " +
            nowValue +
            "->\r[" +
            color +
            "]" +
            newValue +
            "\r\n";
        }
      }
      itemText = statusText + itemText;
      core.drawTextContent(ctx, itemText, {
        left: itemText_x,
        top: itemText_y,
        bold: false,
        color: "white",
        align: "left",
        fontSize: itemTextFontSize,
        maxWidth:
          rightbar_width - (itemText_x - rightbar_x) * 2 + itemTextFontSize / 2,
      });

      ///// *** 退出按钮设置
      var btnRadius = 10;
      var btnBorderWidth = 2;
      var btnRight = toolboxRight - 2;
      var btnBottom = toolboxBottom - 2;
      var btnBorderStyle = "#fff";
      ///// ***

      // 获取圆心位置
      var btn_x = btnRight - btnRadius - btnBorderWidth / 2,
        btn_y = btnBottom - btnRadius - btnBorderWidth / 2;
      core.drawToolbox_setExitBtn(
        ctx,
        btn_x,
        btn_y,
        btnRadius,
        btnBorderStyle,
        btnBorderWidth
      );

      ///// *** 使用按钮设置
      var useBtnHeight = btnRadius * 2;
      // 这里不设置useBtnWidth而是根据各项数据自动得出width
      var useBtnRadius = useBtnHeight / 2;
      var useBtn_x = rightbar_x + 4,
        useBtn_y = btnBottom - useBtnHeight;
      var useBtnBorderStyle = "#fff";
      var useBtnBorderWidth = btnBorderWidth;
      ///// ***

      core.drawToolbox_setUseBtn(
        ctx,
        useBtn_x,
        useBtn_y,
        useBtnRadius,
        useBtnHeight,
        useBtnBorderStyle,
        useBtnBorderWidth
      );
    };

    this.drawEquipbox_drawOthers = function (ctx, obj) {
      var info = core.status.thisUIEventInfo;

      ///// *** 装备格设置
      var equipList_lineWidth = 2;
      var equipList_boxSize = 32;
      var equipList_borderWidth = 2;
      var equipList_borderStyle = "#fff";
      var equipList_nameColor = "#fff";
      ///// ***

      var equipList_x = obj.x + 4,
        equipList_bottom = obj.obj.y - equipList_lineWidth,
        equipList_y = equipList_bottom - obj.obj.oneItemHeight * reduceItem - 2,
        equipList_height = equipList_bottom - equipList_y;
      var equipList_right = obj.leftbar_right,
        equipList_width = equipList_right - equipList_x;
      core.drawLine(
        ctx,
        obj.x,
        equipList_bottom + equipList_lineWidth / 2,
        equipList_right,
        equipList_bottom + equipList_lineWidth / 2,
        equipList_borderStyle,
        equipList_lineWidth
      );
      var toDrawList = core.status.globalAttribute.equipName,
        len = toDrawList.length;

      ///// *** 装备格设置
      var maxItem = 4;
      var box_width = 32,
        box_height = 32,
        box_borderStyle = "#fff",
        box_selectBorderStyle = "gold", // 选中的装备格的颜色
        box_borderWidth = 2;
      var boxName_fontSize = 14,
        boxName_space = 2,
        boxName_color = "#fff"; // 装备格名称与上面的装备格框的距离
      var maxLine = Math.ceil(len / maxItem);
      ///// ***
      var l = Math.sqrt(len);
      if (Math.pow(l) == len && len != 4) {
        if (l <= maxItem) maxItem = l;
      }
      maxItem = Math.min(toDrawList.length, maxItem);
      info.equips = maxItem;

      var boxName_font = core.ui._buildFont(boxName_fontSize);
      // 总宽高减去所有装备格宽高得到空隙大小
      var oneBoxWidth = box_width + box_borderWidth * 2;
      var oneBoxHeight =
        box_height + boxName_fontSize + boxName_space + 2 * box_borderWidth;
      var space_y = (equipList_height - maxLine * oneBoxHeight) / (1 + maxLine),
        space_x = (equipList_width - maxItem * oneBoxWidth) / (1 + maxItem);
      var box_x = equipList_x + space_x,
        box_y = equipList_y + space_y;
      for (var i = 0; i < len; i++) {
        var id = core.getEquip(i),
          name = toDrawList[i];
        var selectBorder = false;
        if (core.status.thisUIEventInfo.select.type == i) selectBorder = true;
        var borderStyle = selectBorder
          ? box_selectBorderStyle
          : box_borderStyle;
        core.drawEquipbox_drawOne(
          ctx,
          name,
          id,
          box_x,
          box_y,
          box_width,
          box_height,
          boxName_space,
          boxName_font,
          boxName_color,
          borderStyle,
          box_borderWidth
        );
        var todo = new Function(
          "core.clickOneEquipbox('" + id + "'," + i + ")"
        );
        core.addUIEventListener(
          box_x - box_borderWidth / 2,
          box_y - box_borderWidth / 2,
          oneBoxWidth,
          oneBoxHeight,
          todo
        );
        box_x += space_x + oneBoxWidth;
        if ((i + 1) % maxItem == 0) {
          box_x = equipList_x + space_x;
          box_y += space_y + oneBoxHeight;
        }
      }
    };

    this.drawToolbox = function (ctx) {
      ctx = ctx || core.canvas.ui;
      core.status.thisEventClickArea = [];

      var info = core.drawBoxBackground(ctx);
      info.itemNum = itemNum;
      core.drawItemListbox(ctx, info.obj);
      core.drawToolboxRightbar(ctx, info);
      core.setTextBaseline(ctx, "alphabetic");
      core.setTextAlign("left");
    };

    var reduceItem = 4;
    this.drawEquipbox = function (ctx) {
      ctx = ctx || core.canvas.ui;
      core.status.thisEventClickArea = [];
      var info = core.drawBoxBackground(ctx);
      info.itemNum = itemNum - reduceItem;
      info.obj.y += info.obj.oneItemHeight * reduceItem;
      info.obj.height -= info.obj.oneItemHeight * reduceItem;
      core.drawItemListbox(ctx, info.obj);
      core.drawEquipbox_drawOthers(ctx, info);
      core.drawToolboxRightbar(ctx, info);
      core.setTextBaseline(ctx, "alphabetic");
      core.setTextAlign("left");
    };

    this.drawEquipbox_drawOne = function (
      ctx,
      name,
      id,
      x,
      y,
      width,
      height,
      space,
      font,
      color,
      style,
      lineWidth
    ) {
      if (id)
        core.drawIcon(
          ctx,
          id,
          x + lineWidth / 2,
          y + lineWidth / 2,
          width,
          height
        );
      core.strokeRect(
        ctx,
        x,
        y,
        width + lineWidth,
        height + lineWidth,
        style,
        lineWidth
      );
      core.setTextAlign(ctx, "center");
      core.setTextBaseline(ctx, "top");
      var tx = (x + x + lineWidth / 2 + width) / 2,
        ty = y + height + (lineWidth / 2) * 3 + space;
      core.fillText(ctx, name, tx, ty, color, font);
      core.setTextBaseline(ctx, "alphabetic");
      core.setTextAlign("left");
    };

    this.drawItemListbox_drawItem = function (
      ctx,
      left,
      right,
      top,
      height,
      marginLeft,
      marginHeight,
      style,
      id
    ) {
      var info = core.status.thisUIEventInfo;
      var nowClick = info.index;
      var item = core.material.items[id] || {};
      var name = item.name || "???";
      var num = core.itemCount(id) || 0;
      var fontSize = Math.floor(height - marginHeight * 2);
      core.setTextAlign(ctx, "right");
      var numText = "x" + num;
      core.fillText(
        ctx,
        numText,
        right - marginLeft,
        top + height / 2,
        style,
        core.ui._buildFont(fontSize)
      );
      if (name != "???")
        core.drawIcon(
          ctx,
          id,
          left + marginLeft,
          top + marginHeight,
          fontSize,
          fontSize
        );
      var text_x = left + marginLeft + fontSize + 2;
      var maxWidth = right - core.calWidth(ctx, numText) - text_x;
      core.setTextAlign(ctx, "left");
      core.fillText(
        ctx,
        name,
        text_x,
        top + height / 2,
        style,
        core.ui._buildFont(fontSize),
        maxWidth
      );
      var todo = new Function("core.clickItemFunc('" + id + "');");
      core.addUIEventListener(left, top, right - left, height, todo);
    };

    this.setPageItems = function (page) {
      var num = itemNum;
      if (core.status.event.id == "equipbox") num -= reduceItem;
      var info = core.status.thisUIEventInfo;
      if (!info) return;
      page = page || info.page;
      var items = core.getToolboxItems(
        core.status.event.id == "toolbox" ? "all" : "equips"
      );
      info.allItems = items;
      var maxPage = Math.ceil(items.length / num);
      info.maxPage = maxPage;
      var pageItems = items.slice((page - 1) * num, page * num);
      info.pageItems = pageItems;
      info.maxItem = pageItems.length;
      if (items.length == 0 && pageItems.length == 0) info.index = null;
      if (pageItems.length == 0 && info.page > 1) {
        info.page = Math.max(1, info.page - 1);
        return core.setPageItems(info.page);
      }
      return pageItems;
    };

    this.drawToolbox_setExitBtn = function (ctx, x, y, r, style, lineWidth) {
      core.strokeCircle(ctx, x, y, r, style, lineWidth);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      var textSize = Math.sqrt(2) * r;
      core.fillText(
        ctx,
        "x",
        x,
        y,
        style,
        core.ui._buildFont(textSize),
        textSize
      );
      core.setTextAlign(ctx, "start");
      core.setTextBaseline(ctx, "top");

      var todo = function () {
        core.closePanel();
      };
      core.addUIEventListener(x - r, y - r, r * 2, r * 2, todo);
    };

    this.drawToolbox_setUseBtn = function (ctx, x, y, r, h, style, lineWidth) {
      core.setTextAlign(ctx, "left");
      core.setTextBaseline(ctx, "top");
      var fontSize = h - 4;
      var font = core.ui._buildFont(fontSize);
      var text = core.status.event.id == "toolbox" ? "使用" : "装备";
      if (core.status.thisUIEventInfo.select.action == "unload") text = "卸下";
      var w = core.calWidth(ctx, text, font) + 2 * r + lineWidth / 2;

      core.strokeRoundRect(ctx, x, y, w, h, r, style, lineWidth);
      core.fillText(ctx, text, x + r, y + lineWidth / 2 + 2, style, font);

      var todo = function () {
        core.useSelectItemInBox();
      };
      core.addUIEventListener(x, y, w, h, todo);
    };

    this.drawItemListbox_setPageBtn = function (
      ctx,
      left,
      right,
      bottom,
      r,
      style,
      lineWidth
    ) {
      var offset = lineWidth / 2 + r;

      var x = left + offset;
      var y = bottom - offset;
      var pos = (Math.sqrt(2) / 2) * (r - lineWidth / 2);
      core.fillPolygon(
        ctx,
        [
          [x - pos, y],
          [x + pos - 2, y - pos],
          [x + pos - 2, y + pos],
        ],
        style
      );
      core.strokeCircle(ctx, x, y, r, style, lineWidth);
      var todo = function () {
        core.addItemListboxPage(-1);
      };
      core.addUIEventListener(x - r - 2, y - r - 2, r * 2 + 4, r * 2 + 4, todo);

      x = right - offset;
      core.fillPolygon(
        ctx,
        [
          [x + pos, y],
          [x - pos + 2, y - pos],
          [x - pos + 2, y + pos],
        ],
        style
      );
      core.strokeCircle(ctx, x, y, r, style, lineWidth);
      var todo = function () {
        core.addItemListboxPage(1);
      };
      core.addUIEventListener(x - r - 2, y - r - 2, r * 2 + 4, r * 2 + 4, todo);
    };

    this.clickItemFunc = function (id) {
      var info = core.status.thisUIEventInfo;
      if (!info) return;
      if (info.select.id == id) return core.useSelectItemInBox();
      info.select = {};
      info.select.id = id;
      core.setIndexAndSelect("index");
      core.refreshBox();
    };

    this.clickOneEquipbox = function (id, type) {
      var info = core.status.thisUIEventInfo;
      if (!info) return;
      if (info.select.id == id && info.select.type == type)
        core.useSelectItemInBox();
      else
        core.status.thisUIEventInfo.select = {
          id: id,
          type: type,
          action: "unload",
        };
      return core.refreshBox();
    };

    core.ui.getToolboxItems = function (cls) {
      var list = Object.keys(core.status.hero.items[cls] || {});
      if (cls == "all") {
        for (var name in core.status.hero.items) {
          if (name == "equips") continue;
          list = list.concat(Object.keys(core.status.hero.items[name]));
        }
        return list
          .filter(function (id) {
            return !core.material.items[id].hideInToolbox;
          })
          .sort();
      }

      if (this.uidata.getToolboxItems) {
        return this.uidata.getToolboxItems(cls);
      }
      return list
        .filter(function (id) {
          return !core.material.items[id].hideInToolbox;
        })
        .sort();
    };

    this.useSelectItemInBox = function () {
      var info = core.status.thisUIEventInfo;
      if (!info) return;
      if (!info.select.id) return;
      var id = info.select.id;
      if (core.status.event.id == "toolbox") {
        core.events.tryUseItem(id);
        // core.closePanel();
      } else if (core.status.event.id == "equipbox") {
        var action = info.select.action || "load";
        info.index = 1;
        if (action == "load") {
          var type = core.getEquipTypeById(id);
          core.loadEquip(id, function () {
            core.status.route.push("equip:" + id);
            info.select.type = type;
            core.setIndexAndSelect("select");
            core.drawEquipbox();
          });
        } else {
          var type = info.select.type;
          core.unloadEquip(type, function () {
            core.status.route.push("unEquip:" + type);
            info.select.type = type;
            //info.select.action = 'load'
            core.setIndexAndSelect("select");
            core.drawEquipbox();
          });
        }
      }
    };
    this.setIndexAndSelect = function (toChange) {
      var info = core.status.thisUIEventInfo;
      if (!info) return;
      core.setPageItems(info.page);
      var index = info.index || 1;
      var items = info.pageItems;
      if (info.select.type != null) {
        var type = info.select.type;
        id = core.getEquip(type);
        info.index = null;
        info.select = {
          id: id,
          action: "unload",
          type: type,
        };
        return;
      } else {
        info.select.action = null;
        info.select.type = null;
        if (toChange == "index") info.index = items.indexOf(info.select.id) + 1;
        info.select.id = items[info.index - 1];
      }
    };

    this.addItemListboxPage = function (num) {
      var info = core.status.thisUIEventInfo;
      if (!info) return;
      var maxPage = info.maxPage || 1;
      info.page = info.page || 1;
      info.page += num;
      if (info.page <= 0) info.page = maxPage;
      if (info.page > maxPage) info.page = 1;
      info.index = 1;
      core.setPageItems(info.page);
      core.setIndexAndSelect("select");
      core.refreshBox();
    };

    this.addItemListboxIndex = function (num) {
      var info = core.status.thisUIEventInfo;
      if (!info) return;
      var maxItem = info.maxItem || 0;
      info.index = info.index || 0;
      info.index += num;
      if (info.index <= 0) info.index = 1;
      if (info.index > maxItem) info.index = maxItem;
      core.setIndexAndSelect("select");
      core.refreshBox();
    };

    this.addEquipboxType = function (num) {
      var info = core.status.thisUIEventInfo;
      var type = info.select.type;
      if (type == null && num > 0) info.select.type = 0;
      else info.select.type = type + num;
      var max = core.status.globalAttribute.equipName.length;
      if (info.select.type >= max) {
        info.select = {};
        core.setIndexAndSelect("select");
        return core.addItemListboxPage(0);
      } else {
        var m = Math.abs(info.select.type);
        if (info.select.type < 0) info.select.type = max - m;
        core.setIndexAndSelect("select");
        core.refreshBox();
        return;
      }
    };

    core.actions._keyDownToolbox = function (keycode) {
      if (!core.status.thisEventClickArea) return;
      if (keycode == 37) {
        // left
        core.addItemListboxPage(-1);
        return;
      }
      if (keycode == 38) {
        // up
        core.addItemListboxIndex(-1);
        return;
      }
      if (keycode == 39) {
        // right
        core.addItemListboxPage(1);
        return;
      }
      if (keycode == 40) {
        // down
        core.addItemListboxIndex(1);
        return;
      }
    };

    ////// 工具栏界面时，放开某个键的操作 //////
    core.actions._keyUpToolbox = function (keycode) {
      if (keycode == 81) {
        core.ui.closePanel();
        if (core.isReplaying()) core.control._replay_equipbox();
        else core.openEquipbox();
        return;
      }
      if (keycode == 84 || keycode == 27 || keycode == 88) {
        core.closePanel();
        return;
      }
      if (keycode == 13 || keycode == 32 || keycode == 67) {
        var info = core.status.thisUIEventInfo;
        if (info.select) {
          core.useSelectItemInBox();
        }
        return;
      }
    };

    core.actions._keyDownEquipbox = function (keycode) {
      if (!core.status.thisEventClickArea) return;
      if (keycode == 37) {
        // left
        var info = core.status.thisUIEventInfo;
        if (info.index != null) return core.addItemListboxPage(-1);
        return core.addEquipboxType(-1);
      }
      if (keycode == 38) {
        // up
        var info = core.status.thisUIEventInfo;
        if (info.index == 1) {
          info.select.type = core.status.globalAttribute.equipName.length - 1;
          core.setIndexAndSelect();
          return core.refreshBox();
        }
        if (info.index) return core.addItemListboxIndex(-1);
        return core.addEquipboxType(-1 * info.equips);
      }
      if (keycode == 39) {
        // right
        var info = core.status.thisUIEventInfo;
        if (info.index != null) return core.addItemListboxPage(1);
        return core.addEquipboxType(1);
      }
      if (keycode == 40) {
        // down
        var info = core.status.thisUIEventInfo;
        if (info.index) return core.addItemListboxIndex(1);
        return core.addEquipboxType(info.equips);
      }
    };

    core.actions._keyUpEquipbox = function (keycode, altKey) {
      if (altKey && keycode >= 48 && keycode <= 57) {
        core.items.quickSaveEquip(keycode - 48);
        return;
      }
      if (keycode == 84) {
        core.ui.closePanel();
        if (core.isReplaying()) core.control._replay_toolbox();
        else core.openToolbox();
        return;
      }
      if (keycode == 81 || keycode == 27 || keycode == 88) {
        core.closePanel();
        return;
      }
      if (keycode == 13 || keycode == 32 || keycode == 67) {
        var info = core.status.thisUIEventInfo;
        if (info.select) core.useSelectItemInBox();
        return;
      }
    };

    core.registerAction(
      "ondown",
      "inEventClickAction",
      function (x, y, px, py) {
        if (!core.status.thisEventClickArea) return false;
        // console.log(px + "," + py);
        var info = core.status.thisEventClickArea;
        for (var i = 0; i < info.length; i++) {
          var obj = info[i];
          if (
            px >= obj.x &&
            px <= obj.x + obj.width &&
            py > obj.y &&
            py < obj.y + obj.height
          ) {
            if (obj.todo) obj.todo();
            break;
          }
        }
        return true;
      },
      51
    );
    core.registerAction(
      "onclick",
      "stopClick",
      function () {
        if (core.status.thisEventClickArea) return true;
      },
      51
    );

    this.addUIEventListener = function (x, y, width, height, todo) {
      if (!core.status.thisEventClickArea) return;
      var obj = {
        x: x,
        y: y,
        width: width,
        height: height,
        todo: todo,
      };
      core.status.thisEventClickArea.push(obj);
    };

    this.initThisEventInfo = function () {
      core.status.thisUIEventInfo = {
        page: 1,
        select: {},
      };
      core.status.thisEventClickArea = [];
    };

    this.refreshBox = function () {
      if (!core.status.event.id) return;
      if (core.status.event.id == "toolbox") core.drawToolbox();
      else core.drawEquipbox();
    };

    core.ui.closePanel = function () {
      if (core.status.hero && core.status.hero.flags) {
        // 清除全部临时变量
        Object.keys(core.status.hero.flags).forEach(function (name) {
          if (name.startsWith("@temp@") || /^arg\d+$/.test(name)) {
            delete core.status.hero.flags[name];
          }
        });
      }
      this.clearUI();
      core.maps.generateGroundPattern();
      core.updateStatusBar(true);
      core.unlockControl();
      core.status.event.data = null;
      core.status.event.id = null;
      core.status.event.selection = null;
      core.status.event.ui = null;
      core.status.event.interval = null;
      core.status.thisUIEventInfo = null;
      core.status.thisEventClickArea = null;
    };

    this.getItemClsName = function (item) {
      if (item == null) return itemClsName;
      if (item.cls == "equips") {
        if (typeof item.equip.type == "string") return item.equip.type;
        var type = core.getEquipTypeById(item.id);
        return core.status.globalAttribute.equipName[type];
      } else return itemClsName[item.cls] || item.cls;
    };

    core.events.openToolbox = function (fromUserAction) {
      if (core.isReplaying()) return;
      if (!this._checkStatus("toolbox", fromUserAction)) return;
      core.initThisEventInfo();
      let info = core.status.thisUIEventInfo;
      info.index = 1;
      core.setIndexAndSelect("select");
      core.drawToolbox();
    };

    core.events.openEquipbox = function (fromUserAction) {
      if (core.isReplaying()) return;
      if (!this._checkStatus("equipbox", fromUserAction)) return;
      core.initThisEventInfo();
      let info = core.status.thisUIEventInfo;
      info.select.type = 0;
      core.setIndexAndSelect("select");
      core.drawEquipbox();
    };

    core.control._replay_toolbox = function () {
      if (!core.isPlaying() || !core.isReplaying()) return;
      if (!core.status.replay.pausing) return core.drawTip("请先暂停录像");
      if (core.isMoving() || core.status.replay.animate || core.status.event.id)
        return core.drawTip("请等待当前事件的处理结束");

      core.lockControl();
      core.status.event.id = "toolbox";
      core.drawToolbox();
    };

    core.control._replay_equipbox = function () {
      if (!core.isPlaying() || !core.isReplaying()) return;
      if (!core.status.replay.pausing) return core.drawTip("请先暂停录像");
      if (core.isMoving() || core.status.replay.animate || core.status.event.id)
        return core.drawTip("请等待当前事件的处理结束");

      core.lockControl();
      core.status.event.id = "equipbox";
      core.drawEquipbox();
    };

    core.control._replayAction_item = function (action) {
      if (action.indexOf("item:") != 0) return false;
      var itemId = action.substring(5);
      if (!core.canUseItem(itemId)) return false;
      if (
        core.material.items[itemId].hideInReplay ||
        core.status.replay.speed == 24
      ) {
        core.useItem(itemId, false, core.replay);
        return true;
      }
      core.status.event.id = "toolbox";
      core.initThisEventInfo();
      var info = core.status.thisUIEventInfo;
      var items = core.getToolboxItems("all");
      core.setPageItems(1);
      var index = items.indexOf(itemId) + 1;
      info.page = Math.ceil(index / info.maxItem);
      info.index = index % info.maxItem || info.maxItem;
      core.setIndexAndSelect("select");
      core.setPageItems(info.page);
      core.drawToolbox();
      setTimeout(function () {
        core.ui.closePanel();
        core.useItem(itemId, false, core.replay);
      }, core.control.__replay_getTimeout());
      return true;
    };

    core.control._replayAction_equip = function (action) {
      if (action.indexOf("equip:") != 0) return false;
      var itemId = action.substring(6);
      var items = core.getToolboxItems("equips");
      var index = items.indexOf(itemId) + 1;
      if (index < 1) return false;
      core.status.route.push(action);
      if (
        core.material.items[itemId].hideInReplay ||
        core.status.replay.speed == 24
      ) {
        core.loadEquip(itemId, core.replay);
        return true;
      }
      core.status.event.id = "equipbox";
      core.initThisEventInfo();
      var info = core.status.thisUIEventInfo;
      core.setPageItems(1);
      info.page = Math.ceil(index / info.maxItem);
      info.index = index % info.maxItem || info.maxItem;
      core.setIndexAndSelect("select");
      core.setPageItems(info.page);
      core.drawEquipbox();
      setTimeout(function () {
        core.ui.closePanel();
        core.loadEquip(itemId, core.replay);
      }, core.control.__replay_getTimeout());
      return true;
    };

    core.control._replayAction_unEquip = function (action) {
      if (action.indexOf("unEquip:") != 0) return false;
      var equipType = parseInt(action.substring(8));
      if (!core.isset(equipType)) return false;
      core.status.route.push(action);
      if (core.status.replay.speed == 24) {
        core.unloadEquip(equipType, core.replay);
        return true;
      }
      core.status.event.id = "equipbox";
      core.initThisEventInfo();
      var info = core.status.thisUIEventInfo;
      core.setPageItems(1);
      info.select.type = equipType;
      core.setIndexAndSelect();
      core.drawEquipbox();
      setTimeout(function () {
        core.ui.closePanel();
        core.unloadEquip(equipType, core.replay);
      }, core.control.__replay_getTimeout());
      return true;
    };

    core.registerReplayAction("item", core.control._replayAction_item);
    core.registerReplayAction("equip", core.control._replayAction_equip);
    core.registerReplayAction("unEquip", core.control._replayAction_unEquip);
  },
    "技能树": function () {
    // 在此增加新插件
    //
    // 已学习的技能等级     flags._hasSkill_
    //打开技能树  core.myskilltree()
    //不需要自动连线可以在 core.myskilltree_draw_line开头取消return的注释

    core.AllStatus = function () {
      //////在这个函数填写技能列表

      var Skill_1 = {
        召唤之书: {
          name: "召唤之书",
          text: "每种召唤物至多存在一只，当存在召唤物时，伤害以花花、灰太狼、牛牛、蝴蝶、兔兔、勇士顺序进行结算，直到当前序列召唤物死亡前，下一序列不受伤。吸血、反伤、固伤等特殊属性直接作用于勇士",
          image: "I393",
          maxLv: 1,
          pos: [5, 7],
          need: null,
          exp: 0,
        },
        冥想: {
          name: "冥想",
          text: "默认主动技能，战斗后恢复技能等级的MP",
          image: "I395",
          maxLv: 5,
          pos: [5, 11],
          need: null,
          exp: 20 + 30 * flags._hasSkill_["冥想"], //基础+每个等级需求提升
        },
        召唤回收: {
          name: "召唤回收",
          text: "献祭召唤物，回复20MP，召唤物离场会导致对应图腾失效(涅槃图腾除外)",
          image: "I405",
          maxLv: 1,
          pos: [5, 5],
          need: [{ 召唤之书: 1 }],
          exp: 100,
        },
        蝴蝶: {
          name: "蝴蝶",
          text: "40MP，召唤50+30*Lv生命的蝴蝶，在场时提升0.5*LV点战后回蓝效果（向上取整）并提升Lv点经验获取",
          image: "I388",
          maxLv: 5,
          pos: [7, 9],
          need: [{ 召唤之书: 1 }],
          exp: 50 * flags._hasSkill_["蝴蝶"],
        },
        兔兔: {
          name: "兔兔",
          text: "40MP，召唤50+30*Lv生命的兔兔，在场时提勇士10%*LV金币获取",
          image: "I389",
          maxLv: 5,
          pos: [9, 9],
          need: [{ 召唤之书: 1 }],
          exp: 50 * flags._hasSkill_["兔兔"],
        },
        狼狼: {
          name: "狼狼",
          text: "40MP，召唤30+50*LV生命的灰太狼，在场时提升勇士2+4*LV点攻击",
          image: "I390",
          maxLv: 5,
          pos: [3, 9],
          need: [{ 召唤之书: 1 }],
          exp: 50 * flags._hasSkill_["狼狼"],
        },
        牛牛: {
          name: "牛牛",
          text: "40MP，召唤50+40*LV生命的牛牛，在场时提升勇士3%+5%*Lv伤害增幅",
          image: "I391",
          maxLv: 5,
          pos: [5, 9],
          need: [{ 召唤之书: 1 }],
          exp: 50 * flags._hasSkill_["牛牛"],
        },
        花花: {
          name: "花花",
          text: "40MP，召唤50+100*LV生命上限、具有同等生命的花花，战后回复15%已损失生命值",
          image: "I392",
          maxLv: 5,
          pos: [1, 9],
          need: [{ 召唤之书: 1 }],
          exp: 50 * flags._hasSkill_["花花"],
        },
      };

      var Skill_2 = {
        图腾之书: {
          name: "图腾之书",
          text: "学习后各图腾提升为1级，获得图腾之书，所有图腾共享20次公共战斗冷却",
          image: "I394",
          maxLv: 1,
          pos: [1, 7],
          need: null,
          exp: 200,
        },
        再生: {
          name: "再生",
          text: "召唤兽:花花在场时可使用，生命恢复提升10%*LV，召唤兽:花花离场后移除",
          image: "I392",
          maxLv: 5,
          pos: [1, 5],
          need: [{ 图腾之书: 1 }],
          exp: 50 * flags._hasSkill_["再生"],
        },
        嗜血: {
          name: "嗜血",
          text: "召唤兽:灰太狼在场时可使用，勇士获得3%*LV吸血，召唤兽:灰太狼离场后移除",
          image: "I390",
          maxLv: 5,
          pos: [3, 5],
          need: [{ 图腾之书: 1 }],
          exp: 50 * flags._hasSkill_["嗜血"],
        },
        顽强: {
          name: "顽强",
          text: "召唤兽:牛牛在场时可使用，除牛牛外所有召唤物战后增加5*Lv生命（花花不可超过生命上限），召唤兽:牛牛离场后移除",
          image: "I391",
          maxLv: 5,
          pos: [5, 5],
          need: [{ 图腾之书: 1 }],
          exp: 50 * flags._hasSkill_["顽强"],
        },
        涅槃: {
          name: "涅槃",
          text: "召唤兽:蝴蝶在场时可使用，战斗时任意召唤兽死亡时触发，召唤兽临时消失，该召唤兽生命变更为50*LV并在战斗结束后重新召唤，此技能触发后战斗结束后移除",
          image: "I388",
          maxLv: 5,
          pos: [7, 5],
          need: [{ 图腾之书: 1 }],
          exp: 50 * flags._hasSkill_["涅槃"],
        },
        贪婪: {
          name: "贪婪",
          text: "召唤兽:兔兔在场时可使用，每次战斗后额外获得0.5*Lv点法力（向上取整）0和LV点金币，召唤兽:兔兔离场后移除",
          image: "I389",
          maxLv: 5,
          pos: [9, 5],
          need: [{ 图腾之书: 1 }],
          exp: 50 * flags._hasSkill_["贪婪"],
        },
        攻击: {
          name: "攻击",
          text: "被动，提升勇者2点攻击",
          image: "atk",
          maxLv: null,
          pos: [3, 9],
          need: null,
          exp: 20 + 5 * flags._hasSkill_["攻击"],
        },
        防御: {
          name: "防御",
          text: "被动，提升勇者2点防御",
          image: "def",
          maxLv: null,
          pos: [5, 9],
          need: null,
          exp: 20 + 5 * flags._hasSkill_["防御"],
        },
        魔力上限: {
          name: "魔力上限",
          text: "被动，提升勇者10点MP上限",
          image: "mana",
          maxLv: null,
          pos: [7, 9],
          need: null,
          exp: 30 + 10 * flags._hasSkill_["魔力上限"],
        },
        火球: {
          name: "火球",
          text: "消耗8MP，第一回合不进行普通攻击，改为发出一枚100%+LV*20%攻击伤害的火球",
          image: "I397",
          maxLv: 5,
          pos: [3, 11],
          need: null,
          exp: 30 * flags._hasSkill_["火球"],
        },
        嘲讽: {
          name: "嘲讽",
          text: "消耗10MP，本次强制怪物以勇士为目标，同时勇士获得5%*LV减伤",
          image: "I399",
          maxLv: 5,
          pos: [5, 11],
          need: null,
          exp: 30 + 30 * flags._hasSkill_["嘲讽"],
        },
        治疗: {
          name: "治疗",
          text: "消耗10点MP，战斗时勇者第一回合改为为自己施加100%+20%*lv防御数值的治疗术",
          image: "I396",
          maxLv: 5,
          pos: [7, 11],
          need: null,
          exp: 20 + 20 * flags._hasSkill_["治疗"],
        },
      };

      var AllSkill = [Skill_1, Skill_2]; ///////////把每页技能数组id填入这里，比如三页技能要加上Skill3
      return AllSkill;
    };

    core.myskilltree = function () {
      //进入
      if (!flags._hasSkill_) flags._hasSkill_ = {};
      core.clearUI();
      core.status.holdingKeys = [];
      core.lockControl();
      core.status.event.page = 0;
      core.status.event.data = 0;
      let Skill = core.AllStatus()[core.status.event.page];
      core.status.event.pos = Object.values(Skill)[0].pos;
      //初始坐标
      core.status.event.id = "myskilltree";
      core.myskilltree_draw(); ///重绘页面
    };

    core.quit_myskilltree = function () {
      core.clearUI();
      core.status.event.id = null;
      core.unlockControl();
      if (core.isReplaying()) core.replay();
    };

    core.myskilltree_add = function () {
      //加点
      let Skill = core.AllStatus()[core.status.event.page];
      var Index = core.status.event.data;
      var id = Object.keys(Skill)[Index];
      var data = Object.values(Skill)[Index];

      let ness;
      if (data.need) {
        if (Array.isArray(data.need)) {
          //多前置
          for (var need of data.need) {
            var need_name = Object.keys(need);
            //if (!Object.keys(flags._hasSkill_).includes(need))
            if (
              !flags._hasSkill_[need_name] ||
              flags._hasSkill_[need_name] < need[need_name]
            ) {
              ness = true;
            }
          }
        } else {
          //单前置
          if (!Object.keys(flags._hasSkill_).includes(data.need)) {
            ness = true;
          }
        }
      }
      if (ness) {
        core.drawTip(id + " 未习得前置");
      } else if (hero.exp < data.exp) {
        core.drawTip(id + " 经验值不足");
      } else if (flags._hasSkill_[id] === data.maxLv) {
        core.drawTip(id + " 技能已满级");
      } else {
        ///学习成功
        flags._hasSkill_[id] = flags._hasSkill_[id] + 1 || 1;
        hero.exp -= data.exp;
        core.myskilltree_get(id);
        core.status.route.push(
          "skill:" +
            Index +
            ":" +
            data.pos[0] +
            ":" +
            data.pos[1] +
            ":" +
            core.status.event.page
        );
      }
      core.myskilltree_draw(); ///重绘页面
    };

    core.myskilltree_get = function (id) {
      ////技能升级效果
      switch (id) {
        case "图腾之书":
          flags._hasSkill_["再生"] = 1;
          flags._hasSkill_["嗜血"] = 1;
          flags._hasSkill_["顽强"] = 1;
          flags._hasSkill_["涅槃"] = 1;
          flags._hasSkill_["贪婪"] = 1;
          core.getItem("I394");
          break;
        case "攻击":
          core.status.hero.atk += 2;
          break;
        case "防御":
          core.status.hero.def += 2;
          break;
        case "魔力上限":
          core.status.hero.manamax += 10;
          break;
        case "嘲讽":
          core.getItem("I399");
          break;
        case "治疗":
          core.getItem("I396");
          break;
      }
    };

    core.myskilltree_draw = function () {
      //绘制  总
      core.clearMap("ui");
      let Skill = core.AllStatus()[core.status.event.page];
      var Index = core.status.event.data;

      ///推荐在此处 drawImage 绘制背景图

      core.setAlpha("ui", 0.8);
      core.setFillStyle("ui", "#dddddd");
      core.fillRect("ui", 0, 0, core.__PIXELS__, core.__PIXELS__, "#000000");
      core.setAlpha("ui", 1);
      let name = Object.keys(Skill)[Index];
      let text = Object.values(Skill)[Index].text;
      let exp = Object.values(Skill)[Index].exp;
      core.myskilltree_draw_text(name, text, exp);
      core.myskilltree_draw_tree();
      core.setTextAlign("ui", "right");
      core.fillText(
        "ui",
        "返回游戏",
        342,
        342,
        "#ffffff",
        ui.prototype._buildFont(15, true)
      );
      core.setTextAlign("ui", "center");
      core.fillText(
        "ui",
        "上页",
        352 / 2 - 50,
        342,
        "#ffffff",
        ui.prototype._buildFont(15, true)
      );
      core.fillText(
        "ui",
        "下页",
        352 / 2 + 50,
        342,
        "#ffffff",
        ui.prototype._buildFont(15, true)
      );
      core.fillText(
        "ui",
        core.status.event.page + 1 + "/" + core.AllStatus().length,
        352 / 2,
        342,
        "#ffffff",
        ui.prototype._buildFont(15, true)
      );
    };

    core.myskilltree_draw_tree = function () {
      //绘制  树
      let x0 = 0,
        y0 = -80; //相对坐标
      let nx = 32,
        ny = 32; //间隔
      let Skill = core.AllStatus()[core.status.event.page];
      for (var value of Object.values(Skill)) {
        //先绘制前置线条,否则会遮挡技能图标
        let posx = value.pos[0];
        let posy = value.pos[1];
        //前置技能
        if (value.need) {
          if (Array.isArray(value.need)) {
            //多前置
            for (var need of value.need) {
              var need_name = Object.keys(need);
              //if (!Object.keys(flags._hasSkill_).includes(need))
              if (
                !flags._hasSkill_[need_name] ||
                flags._hasSkill_[need_name] < need[need_name]
              ) {
                core.setFilter("ui", "brightness(50%)grayscale(70%)");
                core.setAlpha("ui", 0.7);
              }
              let need_x = Skill[need_name].pos[0];
              let need_y = Skill[need_name].pos[1];
              core.myskilltree_draw_line(
                x0 + posx * nx + 16,
                y0 + posy * ny + 16,
                x0 + posx * nx + 16,
                y0 + need_y * ny + 16,
                1
              ); //y
              core.myskilltree_draw_line(
                x0 + posx * nx + 16,
                y0 + need_y * ny + 16,
                x0 + need_x * nx + 16,
                y0 + need_y * ny + 16,
                2
              ); //x
            }
          } else {
            //单前置
            if (!Object.keys(flags._hasSkill_).includes(value.need)) {
              core.setFilter("ui", "brightness(50%)grayscale(70%)");
              core.setAlpha("ui", 0.7);
            }
            let need_x = Skill[value.need].pos[0];
            let need_y = Skill[value.need].pos[1];
            core.myskilltree_draw_line(
              x0 + posx * nx + 16,
              y0 + posy * ny + 16,
              x0 + posx * nx + 16,
              y0 + need_y * ny + 16,
              1
            ); //y
            core.myskilltree_draw_line(
              x0 + posx * nx + 16,
              y0 + need_y * ny + 16,
              x0 + need_x * nx + 16,
              y0 + need_y * ny + 16,
              2
            ); //x
          }
        }
        core.setFilter("ui", "");
        core.setAlpha("ui", 1);
      }
      core.setTextAlign("ui", "center");
      let Ex = core.status.event.pos[0];
      let Ey = core.status.event.pos[1];
      //技能图标
      for (var value of Object.values(Skill)) {
        let posx = value.pos[0];
        let posy = value.pos[1];
        let image = value.image;
        let boxx = x0 + posx * nx;
        let boxy = y0 + posy * ny;
        let name = value.name;
        let lv = flags._hasSkill_[name] || 0;
        //图标
        core.myskilltree_draw_box(boxx, boxy, image);
        //未学习前置的技能 黑色滤镜
        let ness;
        if (value.need) {
          if (Array.isArray(value.need)) {
            //多前置
            for (var need of value.need) {
              var need_name = Object.keys(need);
              //	if (!Object.keys(flags._hasSkill_).includes(need))
              if (
                !flags._hasSkill_[need_name] ||
                flags._hasSkill_[need_name] < need[need_name]
              ) {
                core.setFilter("ui", "brightness(0%)");
                core.setAlpha("ui", 0.7);
                ness = true;
              }
            }
          } else {
            //单前置
            if (!Object.keys(flags._hasSkill_).includes(value.need)) {
              core.setFilter("ui", "brightness(0%)");
              core.setAlpha("ui", 0.7);
              ness = true;
            }
          }
        }
        //未学习的技能 灰色滤镜
        if (!ness && !flags._hasSkill_[name]) {
          core.setFilter("ui", "brightness(50%)grayscale(70%)");
          core.setAlpha("ui", 0.7);
        }
        core.drawIcon("ui", image, boxx, boxy, 32, 32);
        //core.drawImage('ui', image, 0, 0, 32, 32, boxx, boxy, 32, 32);
        core.setFilter("ui", "");
        core.setAlpha("ui", 1);
        if (Ex === posx && Ey === posy)
          core.strokeRoundRect(
            "ui",
            boxx - 2,
            boxy - 2,
            36,
            36,
            4,
            "#ffff80",
            2
          );
        core.setAlpha("ui", 0.6);
        core.fillRoundRect("ui", boxx, boxy + 16 + 8, 32, 16, 4, "#000000");
        core.setAlpha("ui", 1);
        core.fillText(
          "ui",
          lv + (value.maxLv == null ? "" : "/" + value.maxLv),
          boxx + 16,
          boxy + 16 + 8 + 15,
          lv === value.maxLv ? "#ffff80" : "#ffffff",
          ui.prototype._buildFont(15, true)
        );
      }
    };
    core.myskilltree_draw_text = function (name, text, exp) {
      // 绘制  说明文本
      let x0 = 0,
        y0 = 50; //相对坐标
      core.setTextAlign("ui", "left");
      core.fillText(
        "ui",
        name,
        x0 + 10,
        y0 - 20,
        "#ffffff",
        ui.prototype._buildFont(22, true)
      );
      core.fillText(
        "ui",
        "升级经验:" + exp + "/" + hero.exp,
        x0 + 200,
        y0 - 20,
        "#ffffff",
        ui.prototype._buildFont(15, true)
      );
      var height = null;
      var max_height = 110;
      if (text) {
        for (var fontSize = 17; fontSize >= 9; fontSize -= 2) {
          var config = {
            left: x0 + 10,
            top: y0 - 12,
            fontSize: 12,
            maxWidth: 352 - 20,
            bold: true,
            color: "#E1E1E1",
          };
          height = 42 + core.getTextContentHeight(text, config);
          if (height < max_height || fontSize == 9) {
            core.drawTextContent("ui", text, config);
            break;
          }
        }
      }
    };

    core.myskilltree_draw_box = function (x, y, image) {
      //盒子包装
      let col = "#dddddd";
      core.fillRoundRect("ui", x, y, 32, 32, 4, col);
      core.strokeRoundRect("ui", x - 2, y - 2, 36, 36, 4, col, 1);
    };

    core.myskilltree_draw_line = function (x1, y1, x2, y2, type) {
      //线 包装
      //return;
      let col = "#dddddd";
      if (type === 1) {
        core.drawLine("ui", x1 - 4, y1, x2 - 4, y2, col, 1);
        core.drawLine("ui", x1 + 4, y1, x2 + 4, y2, col, 1);
        core.drawLine("ui", x1, y1, x2, y2, col, 4);
      } else if (type === 2) {
        core.drawLine("ui", x1, y1 - 4, x2, y2 - 4, col, 1);
        core.drawLine("ui", x1, y1 + 4, x2, y2 + 4, col, 1);
        core.drawLine("ui", x1, y1, x2, y2, col, 4);
      }
    };

    core.myChooseOnKey = function (dir) {
      //计算方向键应选择的坐标
      let Skill = core.AllStatus()[core.status.event.page];
      let x = core.status.event.pos[0];
      let y = core.status.event.pos[1];
      var temp = [];
      var temp2 = [];
      for (var i in Object.values(Skill)) {
        let posx = Object.values(Skill)[i].pos[0];
        let posy = Object.values(Skill)[i].pos[1];
        let Index = Number(i);
        let ok =
          (dir === "up" && posy < y) ||
          (dir === "down" && posy > y) ||
          (dir === "left" && posx < x) ||
          (dir === "right" && posx > x);
        let ok2 =
          ((dir === "up" || dir === "down") && x === posx) ||
          ((dir === "left" || dir === "right") && y === posy);
        if (ok) temp.push([posx, posy, Index]);
        if (ok && ok2) temp2.push([posx, posy, Index]);
      }
      if (temp2[0]) {
        if (temp2.length === 1) {
          return temp2[0];
        } else {
          let R = 999;
          let rx, ry, ri;
          for (var value of temp2) {
            let posx = value[0];
            let posy = value[1];
            let Index = value[2];
            let r = Math.abs(posx - x + posy - y);
            if (r < R) {
              R = r;
              rx = posx;
              ry = posy;
              ri = Index;
            }
          }
          return [rx, ry, ri];
        }
      } else if (temp.length === 1) {
        return temp[0];
      } else {
        let R = 9999;
        let rx, ry, ri;
        for (var value of temp) {
          let posx = value[0];
          let posy = value[1];
          let Index = value[2];
          let r = Math.pow(posx - x, 2) + Math.pow(posy - y, 2);
          if (r < R) {
            R = r;
            rx = posx;
            ry = posy;
            ri = Index;
          }
        }
        if (rx && ry) return [rx, ry, ri];
      }
    };

    this.myskilltree_keyDown = function (keycode) {
      if (core.status.event.id !== "myskilltree") return false;
      let Skill = core.AllStatus()[core.status.event.page];
      let temp;

      if (
        keycode === 37 &&
        !core.myChooseOnKey("left") &&
        core.status.event.page > 0
      ) {
        core.status.event.page = core.status.event.page - 1;
        core.status.event.data = 0;
        Skill = core.AllStatus()[core.status.event.page];
        core.status.event.pos = Object.values(Skill)[0].pos;
      } else if (
        keycode === 39 &&
        !core.myChooseOnKey("right") &&
        core.status.event.page < core.AllStatus().length - 1
      ) {
        core.status.event.page = core.status.event.page + 1;
        core.status.event.data = 0;
        Skill = core.AllStatus()[core.status.event.page];
        core.status.event.pos = Object.values(Skill)[0].pos;
      } else if (keycode === 38 && core.myChooseOnKey("up")) {
        temp = core.myChooseOnKey("up");
      } else if (keycode === 40 && core.myChooseOnKey("down")) {
        temp = core.myChooseOnKey("down");
      } else if (keycode === 37 && core.myChooseOnKey("left")) {
        temp = core.myChooseOnKey("left");
      } else if (keycode === 39 && core.myChooseOnKey("right")) {
        temp = core.myChooseOnKey("right");
      }

      if (temp) {
        core.status.event.pos[0] = temp[0];
        core.status.event.pos[1] = temp[1];
        core.status.event.data = temp[2];
      }
      if (keycode === 32 || keycode === 13 || keycode === 67)
        core.myskilltree_add();

      core.myskilltree_draw(); ///重绘页面

      return true;
    };
    core.registerAction("keyDown", "myskilltree", "myskilltree_keyDown", 100);

    var myskilltree = function (keycode) {
      if (core.status.event.id !== "myskilltree") return false;

      if (keycode == 88 || keycode == 70 || keycode == 27) {
        ////x、q和Esc退出
        core.quit_myskilltree();
      }
      return true; ///全部拦截
    };
    core.registerAction("keyUp", "myskilltree", myskilltree, 100);

    this.myskilltree_onmove = function (x, y, px, py) {
      if (core.status.event.id !== "myskilltree") return false;

      //if (core.domStyle.isVertical) return false

      let x0 = 0,
        y0 = -80; //相对坐标
      let nx = 32,
        ny = 32; //间隔
      if (py >= 65 && py <= 320) {
        let Skill = core.AllStatus()[core.status.event.page];
        for (var i in Object.values(Skill)) {
          let posx = Object.values(Skill)[i].pos[0];
          let posy = Object.values(Skill)[i].pos[1];
          let boxx = x0 + posx * nx;
          let boxy = y0 + posy * ny;
          if (px >= boxx && px <= boxx + 32 && py >= boxy && py <= boxy + 32) {
            if (core.status.event.data !== Number(i)) {
              core.status.event.pos[0] = posx;
              core.status.event.pos[1] = posy;
              core.status.event.data = Number(i);
              core.myskilltree_draw(); ///重绘页面
            }
            //core.status.event.mouse = Number(i)
            //if(core.status.event.mouse)
          }
        }
      }
      return true;
    };
    core.registerAction("onmove", "myskilltree", "myskilltree_onmove", 100);

    core.registerAction(
      "onclick",
      "myskilltree",
      function (x, y, px, py) {
        if (core.status.event.id !== "myskilltree") return false;

        let x0 = 0,
          y0 = -80; //相对坐标
        let nx = 32,
          ny = 32; //间隔
        let Skill = core.AllStatus()[core.status.event.page];
        //console.log(px + ',' + py);
        if (py >= 65 && py <= 320) {
          for (var i in Object.values(Skill)) {
            let posx = Object.values(Skill)[i].pos[0];
            let posy = Object.values(Skill)[i].pos[1];
            let boxx = x0 + posx * nx;
            let boxy = y0 + posy * ny;
            if (
              px >= boxx &&
              px <= boxx + 32 &&
              py >= boxy &&
              py <= boxy + 32
            ) {
              if (core.status.event.data === Number(i)) {
                core.myskilltree_add();
              } else if (core.status.event.data !== Number(i)) {
                core.status.event.pos[0] = posx;
                core.status.event.pos[1] = posy;
                core.status.event.data = Number(i);
                core.myskilltree_draw(); ///重绘页面
              }
            }
          }
        } else if (px >= 280 && py >= 320) {
          core.quit_myskilltree();
        } else if (
          px >= 90 &&
          px <= 165 &&
          py >= 320 &&
          core.status.event.page > 0
        ) {
          core.status.event.page = core.status.event.page - 1;
          core.status.event.data = 0;
          core.status.event.pos = Object.values(Skill)[0].pos;
          core.myskilltree_draw(); ///重绘页面
        } else if (
          px >= 190 &&
          px <= 280 &&
          py >= 320 &&
          core.status.event.page < core.AllStatus().length - 1
        ) {
          core.status.event.page = core.status.event.page + 1;
          core.status.event.data = 0;
          core.status.event.pos = Object.values(Skill)[0].pos;
          core.myskilltree_draw(); ///重绘页面
        }

        return true;
      },
      100
    );

    control.prototype._replayAction_skill = function (action) {
      if (action.indexOf("skill:") != 0) return false;
      core.myskilltree();
      var pos = action.substring(6).split(":");
      core.status.event.data = Number(pos[0]);
      core.status.event.pos[0] = Number(pos[1]);
      core.status.event.pos[1] = Number(pos[2]);
      core.status.event.page = Number(pos[3]);
      core.myskilltree_add();
      //core.myskilltree_draw();
      core.replay();
      if (core.status.replay.speed == 24) {
        core.quit_myskilltree();
        return true;
      }
      setTimeout(function () {
        core.quit_myskilltree();
        //core.ui.closePanel();
      }, core.control.__replay_getTimeout());
      return true;
    };
    core.registerReplayAction("skill", control.prototype._replayAction_skill);
  },
    "animate": function () {
	// -------------------- 插件说明 -------------------- //

	// github仓库：https://github.com/unanmed/animate
	// npm包名：mutate-animate
	// npm地址：https://www.npmjs.com/package/mutate-animate

	// 不要去尝试读这个插件，这个插件是经过了打包的，不是人类可读的(
	// 想读的话可以去github读

	// 该插件是一个轻量型多功能动画插件，可以允许你使用内置或自定义的速率曲线或轨迹等
	// 除此之外，你还可以自定义绘制函数，来让你的动画可视化

	// -------------------- 安装说明 -------------------- //

	// 直接复制到插件中即可，注意所有插件中不能出现插件名为animate的插件
	// 该插件分为动画和渐变两部分，教程分开，动画在前，渐变在后

	// -------------------- 动画使用教程 -------------------- //

	// 1. 首先创建一个异步函数
	//   async function ani() { }

	// 2. 引入插件中的类和函数，引入内容要看个人需求，所有可用的函数在本插件末尾可以看到
	//   const { Animation, linear, bezier, circle, hyper, trigo, power, inverseTrigo, shake, sleep } = core.plugin.animate

	// 3. 在函数内部创建一个动画
	//   const animate = new Animation();

	// 4. 为动画创建一个绘制函数，这里以绘制一个矩形为例，当然也可以使用core.fillRect替代ctx.fillRect来绘制矩形
	//   const ctx = core.createCanvas('animate', 0, 0, 416, 416, 100);
	//   ctx.save();
	//   const fn = () => {
	//      ctx.restore();
	//      ctx.save();
	//      ctx.clearRect(0, 0, 800, 800);
	//      ctx.translate(animate.x, animate.y);
	//      ctx.rotate(animate.angle * Math.PI / 180);
	//      const size = animate.size;
	//      ctx.fillRect(-30 * size, -30 * size, 60 * size, 60 * size);
	//   }
	//   animate.ticker.add(fn);

	// 5. 执行动画

	//   下面先对一些概念进行解释

	//   动画分为很多种，内置的有move(移动至某一点)  rotate(旋转)  scale(放缩)  moveAs(以指定路径移动)  shake(震动)
	//   对于不同的动画种类，其所对应的属性也不同，move moveAs shake均对应x和y这两个属性
	//   rotate对应angle，scale对应size。你也可以自定义属性，这个之后会提到

	//   除了执行动画之外，这里还提供了三个等待函数，可以等待某个动画执行完毕，以及一个等待指定时长的函数
	//   分别是animate.n(等待指定数量的动画执行完毕)
	//   animate.w(等待指定类型的动画执行完毕，也可以是自定义类型)
	//   animate.all(等待所有动画执行完毕)
	//   sleep(等待指定时长)

	//   执行动画时，要求一个渐变函数，当然这个插件内置了非常丰富的渐变函数，也就是速率曲线。

	//   线性渐变函数  linear()，该函数返回一个线性变化函数

	//   三角渐变函数  trigo('sin' | 'sec', EaseMode)，该函数返回一个指定属性的三角函数变化函数
	//       其中EaseMode可以填'in' 'out' 'in-out' 'center'
	//       分别表示 慢-快  快-慢  慢-快-慢  快-慢-快

	//   幂函数渐变  power(n, EaseMode)，该函数返回一个以x^n变化的函数，n是指数

	//   双曲渐变函数  hyper('sin' | 'tan' | 'sec', EaseMode)，该函数返回一个双曲函数，分别是双曲正弦、双曲正切、双曲正割

	//   反三角渐变函数  inverseTrigo('sin' | 'tan', EaseMode)，该函数返回一个反三角函数

	//   贝塞尔曲线渐变函数  bezier(...cps)，参数为贝塞尔曲线的控制点纵坐标（横坐标不能自定义，毕竟一个时刻不能对应多个速率）
	//       示例：bezier(0.4, 0.2, 0.7); // 三个控制点的四次贝塞尔曲线渐变函数

	//   了解完渐变函数以后，这里还有一个特殊的渐变函数-shake
	//   shake(power, timing)，这个函数是一个震荡函数，会让一个值来回变化，实现震动的效果
	//       其中power是震动的最大值，timing是渐变函数，描述了power在震动时大小的变化

	//   下面，我们就可以进行动画的执行了，我们以 运动 + 旋转 + 放缩为例

	//   animate.mode(hyper('sin', 'out'))  // 设置渐变函数为 双曲正弦 快 -> 慢，注意不能加分号
	//       .time(1000)  // 设置动画的执行时间为1000毫秒
	//       .move(300, 300)  // 移动至[300, 300]的位置
	//       .relative()  // 设置相对模式为相对之前，与之前为相加的关系
	//       .mode(power(3, 'center'))  // 设置为 x^3 快-慢-快 的渐变函数
	//       .time(3000)
	//       .rotate(720)  // 旋转720度
	//       .absolute()  // 设置相对模式为绝对
	//       .mode(trigo('sin', 'in'))  // 设置渐变函数为 正弦 慢 -> 快
	//       .time(1500)
	//       .scale(3);  // 放缩大小至3倍

	//   这样，我们就把三种基础动画都执行了一遍，同时，这种写法非常直观，出现问题时也可以很快地找到问题所在
	//   下面，我们需要等待动画执行完毕，因为同一种动画不可能同时执行两个

	//   await animate.n(1); // 等待任意一个动画执行完毕，别把await忘了
	//   await animate.w('scale'); // 等待放缩动画执行完毕
	//   await animate.all(); // 等待所有动画执行完毕
	//   await sleep(1000); // 等待1000毫秒

	//   下面，还有一个特殊的动画函数-moveAs
	//   这是一个非常强大的函数，它允许你让你的物体按照指定路线运动
	//   说到这，我们需要先了解一下运动函数。
	//   该插件内置了两个运动函数，分别是圆形运动和贝塞尔曲线运动

	//   圆形运动 circle(r, n, timing, inverse)，r是圆的半径，n是圈数，timing描述半径大小的变化，inverse说明了是否翻转timing函数，后面三个可以不填

	//   贝塞尔曲线 bezierPath(start, end, ...cps)
	//       其中start和end是起点和结束点，应当填入[x, y]数组，cps是控制点，也是[x, y]数组
	//       示例：bezierPath([0, 0], [200, 200], [100, 50], [300, 150], [200, 180]);
	//       这是一个起点为 [0, 0]，终点为[200, 200]，有三个控制点的四次贝塞尔曲线

	//   下面，我们就可以使用路径函数了

	//   animate.mode(hyper('sin', 'in-out'))  // 设置渐变曲线
	//       .time(5000)
	//       .relative()  // 设置为相对模式，这个比较必要，不然的话很可能出现瞬移
	//       .moveAs(circle(100, 5, linear()))  // 创建一个5圈的半径从0至100逐渐变大的圆轨迹（是个螺旋线）并让物体沿着它运动
	//
	//   最后，还有一个震动函数 shake(x, y)，x和y表示了在横向上和纵向上的震动幅度，1表示为震动幅度的100%
	//   示例：
	//   animate.mode(shake(5, hyper('sin', 'in')), true) // 这里第二个参数说明是震动函数
	//       .time(2000)
	//       .shake(1, 0.5)

	//   这样，所有内置动画就已经介绍完毕

	// 6. 自定义动画属性

	//   本插件允许你自定义一个动画属性，但功能可能不会像自带的属性那么强大
	//   你可以在创建动画之后使用animate.register(key, init)来注册一个自定义属性
	//   其中key是自定义属性的名称，init是自定义属性的初始值，这个值应当在0-1之间变化

	//   你可以通过animate.value[key]来获取你注册的自定义属性

	//   对于自定义属性的动画，你应当使用animate.apply(key, n, first)
	//   其中，key是你的自定义属性的名称，n是其目标值，first是一个布尔值，说明了是否将该动画插入到目前所有的动画之前，即每帧会优先执行该动画

	//   下面是一个不透明度的示例

	//   animate.register('opacity', 1); // 这句话应该放到刚创建动画之后

	//   ctx.globalAlpha = animate.value.opacity; // 这句话应当放到每帧绘制的函数里面，放在绘制之前

	//   animate.mode(bezier(0.9, 0.1, 0.05))  // 设置渐变函数
	//       .time(2000)
	//       .absolute()
	//       .apply('opacity', 0.3);  // 将不透明度按照渐变曲线更改为0.3

	// 7. 运行动画

	//   还记得刚开始定义的async function 吗，直接调用它就能执行动画了！
	//   示例：ani(); // 执行刚刚写的所有动画

	// 8. 自定义速率曲线和路径

	//   该插件中，速率曲线和路径均可自定义

	//   对于速率曲线，其类型为  (input: number) => number
	//   它接受一个范围在 0-1 的值，输出一个 0-1 的值，表示了动画的完成度，1表示动画已完成，0表示动画刚开始（当前大于1小于0也不会报错，也会执行相应的动画）

	//   对于路径，其类型为  (input: number) => [number, number]
	//   它与速率曲线类似，接收一个 0-1 的值，输出一个坐标数组

	// 9. 多个属性绑定

	//   该插件中，你可以绑定多个动画属性，你可以使用ani.bind(...attr)来绑定。
	//   绑定之后，这三个动画属性可以被一个返回了长度为3的数组的渐变函数执行。
	//   绑定使用ani.bind，设置渐变函数仍然使用ani.mode，注意它与单个动画属性是分开的，也就是它不会影响正常的渐变函数。
	//   然后使用ani.applyMulti即可执行动画

	//   例如：
	//   // 自定义的一个三属性渐变函数
	//   function b(input) {
	//       return [input * 100, input ** 2 * 100, input ** 3 * 100];
	//   }
	//   ani.bind('a', 'b', 'c') // 这样会绑定abc这三个动画属性
	//       .mode(b) // 自定义的一个返回了长度为3的数组的函数
	//       .time(5000)
	//       .absolute()
	//       .applyMulti(); // 执行这个动画

	// 9. 监听  动画的生命周期钩子

	//   这个插件还允许你去监听动画的状态，可以监听动画的开始、结束、运行
	//   你可以使用 animate.listen(type, fn)来监听，fn的类型是 (a: Animation, type: string) => void
	//   当然，一般情况下你不会用到这个功能，插件中已经帮你包装了三个等待函数，他们就是以这些监听为基础的

	// 10. 自定义时间获取函数

	//   你可以修改ani.getTime来修改动画的时间获取函数，例如想让动画速度变成一半可以写ani.getTime = () => Date.now() / 2
	//   这样可以允许你随意控制动画的运行速度，暂停，甚至是倒退。该值默认为`Date.now`

	// -------------------- 渐变使用教程 -------------------- //

	// 相比于动画，渐变属于一种较为简便的动画，它可以让你在设置一个属性后使属性缓慢变化值目标值而不是突变至目标值
	// 现在假设你已经了解了动画的使用，下面我们来了解渐变。

	// 1. 创建一个渐变实例
	//   与动画类似，你需要使用new来实例化一个渐变，当然别忘了引入
	//   const { Transition } = core.plugin.animate;
	//   const tran = new Transition();

	// 2. 绘制
	//   const ctx = core.createCanvas('transition', 0, 0, 416, 416, 100);
	//   ctx.save();
	//   const fn = () => {
	//      ctx.restore();
	//      ctx.save();
	//      ctx.clearRect(0, 0, 800, 800);
	//      ctx.beginPath();
	//      ctx.arc(tran.value.x, tran.value.y, 50, 0, Math.PI * 2); // 使用tran.value.xxx获取当前的属性
	//      ctx.fill();
	//      // 当然也可以用样板的api，例如core.fillCircle();等
	//   }
	//   animate.ticker.add(fn);

	// 3. 设置渐变
	//   同样，与动画类似，你可以使用tran.time()设置渐变时间，使用tran.mode()设置渐变函数，使用tran.absolute()和tran.relative()设置相对模式
	//   例如：
	//   tran.time(1000)
	//       .mode(hyper('sin', 'out'))
	//       .absolute();

	// 4. 初始化渐变属性
	//   与动画不同的是，动画在执行一个自定义属性前都需要register，而渐变不需要。
	//   你可以通过tran.value.xxx = yyy来设置动画属性或使用tran.transition('xxx', yyy)来设置
	//   你的首次赋值即是初始化了渐变属性，这时是不会执行渐变的，例如：
	//   tran.value.x = 200;
	//   tran.transition('y', 200);
	//   上述例子便是将 x 和 y 初始化成了200

	// 5. 执行渐变
	//   初始化完成后，便可以直接执行渐变了，有两种方法
	//   tran.value.x = 400; // 将 x 缓慢移动至400
	//   tran.transition('y', 400); // 将 y 缓慢移动至400

	// 6. 自定义时间获取函数
	//   与动画类似，你依然可以通过修改tran.getTime来修改时间获取函数

	if (main.replayChecking) return (core.plugin.animate = {});

	var M = Object.defineProperty;
	var E = (n, s, t) =>
		s in n ?
		M(n, s, { enumerable: !0, configurable: !0, writable: !0, value: t }) :
		(n[s] = t);
	var o = (n, s, t) => (E(n, typeof s != "symbol" ? s + "" : s, t), t);
	let b = [];
	const k = (n) => {
		for (const s of b)
			if (s.status === "running")
				try {
					for (const t of s.funcs) t(n - s.startTime);
				} catch (t) {
					s.destroy(), console.error(t);
				}
		requestAnimationFrame(k);
	};
	requestAnimationFrame(k);
	class I {
		constructor() {
			o(this, "funcs", []);
			o(this, "status", "stop");
			o(this, "startTime", 0);
			(this.status = "running"),
			b.push(this),
				requestAnimationFrame((s) => (this.startTime = s));
		}
		add(s, t = !1) {
			return t ? this.funcs.unshift(s) : this.funcs.push(s), this;
		}
		remove(s) {
			const t = this.funcs.findIndex((e) => e === s);
			if (t === -1)
				throw new ReferenceError(
					"You are going to remove nonexistent ticker function."
				);
			return this.funcs.splice(t, 1), this;
		}
		clear() {
			this.funcs = [];
		}
		destroy() {
			this.clear(), this.stop();
		}
		stop() {
			(this.status = "stop"), (b = b.filter((s) => s !== this));
		}
	}
	class F {
		constructor() {
			o(this, "timing");
			o(this, "relation", "absolute");
			o(this, "easeTime", 0);
			o(this, "applying", {});
			o(this, "getTime", Date.now);
			o(this, "ticker", new I());
			o(this, "value", {});
			o(this, "listener", {});
			this.timing = (s) => s;
		}
		async all() {
			if (Object.values(this.applying).every((s) => s === !0))
				throw new ReferenceError("There is no animates to be waited.");
			await new Promise((s) => {
				const t = () => {
					Object.values(this.applying).every((e) => e === !1) &&
						(this.unlisten("end", t), s("all animated."));
				};
				this.listen("end", t);
			});
		}
		async n(s) {
			const t = Object.values(this.applying).filter((i) => i === !0).length;
			if (t < s)
				throw new ReferenceError(
					`You are trying to wait ${s} animate, but there are only ${t} animate animating.`
				);
			let e = 0;
			await new Promise((i) => {
				const r = () => {
					e++, e === s && (this.unlisten("end", r), i(`${s} animated.`));
				};
				this.listen("end", r);
			});
		}
		async w(s) {
			if (this.applying[s] === !1)
				throw new ReferenceError(`The ${s} animate is not animating.`);
			await new Promise((t) => {
				const e = () => {
					this.applying[s] === !1 &&
						(this.unlisten("end", e), t(`${s} animated.`));
				};
				this.listen("end", e);
			});
		}
		listen(s, t) {
			var e, i;
			(i = (e = this.listener)[s]) != null || (e[s] = []),
				this.listener[s].push(t);
		}
		unlisten(s, t) {
			const e = this.listener[s].findIndex((i) => i === t);
			if (e === -1)
				throw new ReferenceError(
					"You are trying to remove a nonexistent listener."
				);
			this.listener[s].splice(e, 1);
		}
		hook(...s) {
			const t = Object.entries(this.listener).filter((e) => s.includes(e[0]));
			for (const [e, i] of t)
				for (const r of i) r(this, e);
		}
	}

	function T(n) {
		return n != null;
	}
	async function R(n) {
		return new Promise((s) => setTimeout(s, n));
	}
	class Y extends F {
		constructor() {
			super();
			o(this, "shakeTiming");
			o(this, "path");
			o(this, "multiTiming");
			o(this, "value", {});
			o(this, "size", 1);
			o(this, "angle", 0);
			o(this, "targetValue", {
				system: {
					move: [0, 0],
					moveAs: [0, 0],
					resize: 0,
					rotate: 0,
					shake: 0,
					"@@bind": [],
				},
				custom: {},
			});
			o(this, "animateFn", {
				system: {
					move: [() => 0, () => 0],
					moveAs: () => 0,
					resize: () => 0,
					rotate: () => 0,
					shake: () => 0,
					"@@bind": () => 0,
				},
				custom: {},
			});
			o(this, "ox", 0);
			o(this, "oy", 0);
			o(this, "sx", 0);
			o(this, "sy", 0);
			o(this, "bindInfo", []);
			(this.timing = (t) => t),
			(this.shakeTiming = (t) => t),
			(this.multiTiming = (t) => [t, t]),
			(this.path = (t) => [t, t]),
			(this.applying = {
				move: !1,
				scale: !1,
				rotate: !1,
				shake: !1,
			}),
			this.ticker.add(() => {
				const { running: t } = this.listener;
				if (T(t))
					for (const e of t) e(this, "running");
			});
		}
		get x() {
			return this.ox + this.sx;
		}
		get y() {
			return this.oy + this.sy;
		}
		mode(t, e = !1) {
			return (
				typeof t(0) == "number" ?
				e ?
				(this.shakeTiming = t) :
				(this.timing = t) :
				(this.multiTiming = t),
				this
			);
		}
		time(t) {
			return (this.easeTime = t), this;
		}
		relative() {
			return (this.relation = "relative"), this;
		}
		absolute() {
			return (this.relation = "absolute"), this;
		}
		bind(...t) {
			return (
				this.applying["@@bind"] === !0 && this.end(!1, "@@bind"),
				(this.bindInfo = t),
				this
			);
		}
		unbind() {
			return (
				this.applying["@@bind"] === !0 && this.end(!1, "@@bind"),
				(this.bindInfo = []),
				this
			);
		}
		move(t, e) {
			return (
				this.applying.move && this.end(!0, "move"),
				this.applySys("ox", t, "move"),
				this.applySys("oy", e, "move"),
				this
			);
		}
		rotate(t) {
			return this.applySys("angle", t, "rotate"), this;
		}
		scale(t) {
			return this.applySys("size", t, "resize"), this;
		}
		shake(t, e) {
			this.applying.shake === !0 && this.end(!0, "shake"),
				(this.applying.shake = !0);
			const { easeTime: i, shakeTiming: r } = this,
			h = this.getTime();
			if ((this.hook("start", "shakestart"), i <= 0))
				return this.end(!1, "shake"), this;
			const l = () => {
				const c = this.getTime() - h;
				if (c > i) {
					this.ticker.remove(l),
						(this.applying.shake = !1),
						(this.sx = 0),
						(this.sy = 0),
						this.hook("end", "shakeend");
					return;
				}
				const a = c / i,
					m = r(a);
				(this.sx = m * t), (this.sy = m * e);
			};
			return this.ticker.add(l), (this.animateFn.system.shake = l), this;
		}
		moveAs(t) {
			this.applying.moveAs && this.end(!0, "moveAs"),
				(this.applying.moveAs = !0),
				(this.path = t);
			const { easeTime: e, relation: i, timing: r } = this,
			h = this.getTime(),
				[l, u] = [this.x, this.y],
				[c, a] = (() => {
					if (i === "absolute") return t(1); {
						const [d, f] = t(1);
						return [l + d, u + f];
					}
				})();
			if ((this.hook("start", "movestart"), e <= 0))
				return this.end(!1, "moveAs"), this;
			const m = () => {
				const f = this.getTime() - h;
				if (f > e) {
					this.end(!0, "moveAs");
					return;
				}
				const v = f / e,
					[g, w] = t(r(v));
				i === "absolute" ?
					((this.ox = g), (this.oy = w)) :
					((this.ox = l + g), (this.oy = u + w));
			};
			return (
				this.ticker.add(m, !0),
				(this.animateFn.system.moveAs = m),
				(this.targetValue.system.moveAs = [c, a]),
				this
			);
		}
		register(t, e) {
			if (typeof this.value[t] == "number")
				return this.error(
					`Property ${t} has been regietered twice.`,
					"reregister"
				);
			(this.value[t] = e), (this.applying[t] = !1);
		}
		apply(t, e, i = !1) {
			this.applying[t] === !0 && this.end(!1, t),
				t in this.value ||
				this.error(`You are trying to execute nonexistent property ${t}.`),
				(this.applying[t] = !0);
			const r = this.value[t],
				h = this.getTime(),
				{ timing: l, relation: u, easeTime: c } = this,
				a = u === "absolute" ? e - r : e;
			if ((this.hook("start"), c <= 0)) return this.end(!1, t), this;
			const m = () => {
				const f = this.getTime() - h;
				if (f > c) {
					this.end(!1, t);
					return;
				}
				const v = f / c,
					g = l(v);
				this.value[t] = r + g * a;
			};
			return (
				this.ticker.add(m, i),
				(this.animateFn.custom[t] = m),
				(this.targetValue.custom[t] = a + r),
				this
			);
		}
		applyMulti(t = !1) {
			this.applying["@@bind"] === !0 && this.end(!1, "@@bind"),
				(this.applying["@@bind"] = !0);
			const e = this.bindInfo,
				i = e.map((m) => this.value[m]),
				r = this.getTime(),
				{ multiTiming: h, relation: l, easeTime: u } = this,
				c = h(1);
			if (c.length !== i.length)
				throw new TypeError(
					`The number of binded animate attributes and timing function returns's length does not match. binded: ${e.length}, timing: ${c.length}`
				);
			if ((this.hook("start"), u <= 0)) return this.end(!1, "@@bind"), this;
			const a = () => {
				const d = this.getTime() - r;
				if (d > u) {
					this.end(!1, "@@bind");
					return;
				}
				const f = d / u,
					v = h(f);
				e.forEach((g, w) => {
					l === "absolute" ?
						(this.value[g] = v[w]) :
						(this.value[g] = i[w] + v[w]);
				});
			};
			return (
				this.ticker.add(a, t),
				(this.animateFn.custom["@@bind"] = a),
				(this.targetValue.system["@@bind"] = c),
				this
			);
		}
		applySys(t, e, i) {
			i !== "move" && this.applying[i] === !0 && this.end(!0, i),
				(this.applying[i] = !0);
			const r = this[t],
				h = this.getTime(),
				l = this.timing,
				u = this.relation,
				c = this.easeTime,
				a = u === "absolute" ? e - r : e;
			if ((this.hook("start", `${i}start`), c <= 0)) return this.end(!1, i);
			const m = () => {
				const f = this.getTime() - h;
				if (f > c) {
					this.end(!0, i);
					return;
				}
				const v = f / c,
					g = l(v);
				(this[t] = r + a * g), t !== "oy" && this.hook(i);
			};
			this.ticker.add(m, !0),
				t === "ox" ?
				(this.animateFn.system.move[0] = m) :
				t === "oy" ?
				(this.animateFn.system.move[1] = m) :
				(this.animateFn.system[i] = m),
				i === "move" ?
				(t === "ox" && (this.targetValue.system.move[0] = a + r),
					t === "oy" && (this.targetValue.system.move[1] = a + r)) :
				i !== "shake" && (this.targetValue.system[i] = a + r);
		}
		error(t, e) {
			throw e === "repeat" ?
				new Error(`Cannot execute the same animation twice. Info: ${t}`) :
				e === "reregister" ?
				new Error(`Cannot register an animated property twice. Info: ${t}`) :
				new Error(t);
		}
		end(t, e) {
			if (t === !0)
				if (
					((this.applying[e] = !1),
						e === "move" ?
						(this.ticker.remove(this.animateFn.system.move[0]),
							this.ticker.remove(this.animateFn.system.move[1])) :
						e === "moveAs" ?
						this.ticker.remove(this.animateFn.system.moveAs) :
						e === "@@bind" ?
						this.ticker.remove(this.animateFn.system["@@bind"]) :
						this.ticker.remove(this.animateFn.system[e]),
						e === "move")
				) {
					const [i, r] = this.targetValue.system.move;
					(this.ox = i), (this.oy = r), this.hook("moveend", "end");
				} else if (e === "moveAs") {
				const [i, r] = this.targetValue.system.moveAs;
				(this.ox = i), (this.oy = r), this.hook("moveend", "end");
			} else
				e === "rotate" ?
				((this.angle = this.targetValue.system.rotate),
					this.hook("rotateend", "end")) :
				e === "resize" ?
				((this.size = this.targetValue.system.resize),
					this.hook("resizeend", "end")) :
				e === "@@bind" ?
				this.bindInfo.forEach((r, h) => {
					this.value[r] = this.targetValue.system["@@bind"][h];
				}) :
				((this.sx = 0), (this.sy = 0), this.hook("shakeend", "end"));
			else
				(this.applying[e] = !1),
				this.ticker.remove(this.animateFn.custom[e]),
				(this.value[e] = this.targetValue.custom[e]),
				this.hook("end");
		}
	}
	class j extends F {
		constructor() {
			super();
			o(this, "now", {});
			o(this, "target", {});
			o(this, "transitionFn", {});
			o(this, "value");
			o(this, "handleSet", (t, e, i) => (this.transition(e, i), !0));
			o(this, "handleGet", (t, e) => this.now[e]);
			(this.timing = (t) => t),
			(this.value = new Proxy(this.target, {
				set: this.handleSet,
				get: this.handleGet,
			}));
		}
		mode(t) {
			return (this.timing = t), this;
		}
		time(t) {
			return (this.easeTime = t), this;
		}
		relative() {
			return (this.relation = "relative"), this;
		}
		absolute() {
			return (this.relation = "absolute"), this;
		}
		transition(t, e) {
			if (e === this.target[t]) return this;
			if (!T(this.now[t])) return (this.now[t] = e), this;
			this.applying[t] && this.end(t, !0),
				(this.applying[t] = !0),
				this.hook("start");
			const i = this.getTime(),
				r = this.easeTime,
				h = this.timing,
				l = this.now[t],
				u = e + (this.relation === "absolute" ? 0 : l),
				c = u - l;
			this.target[t] = u;
			const a = () => {
				const d = this.getTime() - i;
				if (d >= r) {
					this.end(t);
					return;
				}
				const f = d / r;
				(this.now[t] = h(f) * c + l), this.hook("running");
			};
			return (
				(this.transitionFn[t] = a),
				r <= 0 ? (this.end(t), this) : (this.ticker.add(a), this)
			);
		}
		end(t, e = !1) {
			const i = this.transitionFn[t];
			if (!T(i))
				throw new ReferenceError(
					`You are trying to end an ended transition: ${t}`
				);
			this.ticker.remove(this.transitionFn[t]),
				delete this.transitionFn[t],
				(this.applying[t] = !1),
				this.hook("end"),
				e || (this.now[t] = this.target[t]);
		}
	}
	const x = (...n) => n.reduce((s, t) => s + t, 0),
		y = (n) => {
			if (n === 0) return 1;
			let s = n;
			for (; n > 1;) n--, (s *= n);
			return s;
		},
		A = (n, s) => Math.round(y(s) / (y(n) * y(s - n))),
		p = (n, s, t = (e) => 1 - s(1 - e)) =>
		n === "in" ?
		s :
		n === "out" ?
		t :
		n === "in-out" ?
		(e) => (e < 0.5 ? s(e * 2) / 2 : 0.5 + t((e - 0.5) * 2) / 2) :
		(e) => (e < 0.5 ? t(e * 2) / 2 : 0.5 + s((e - 0.5) * 2) / 2),
		$ = Math.cosh(2),
		z = Math.acosh(2),
		V = Math.tanh(3),
		P = Math.atan(5);

	function O() {
		return (n) => n;
	}

	function q(...n) {
		const s = [0].concat(n);
		s.push(1);
		const t = s.length,
			e = Array(t)
			.fill(0)
			.map((i, r) => A(r, t - 1));
		return (i) => {
			const r = e.map((h, l) => h * s[l] * (1 - i) ** (t - l - 1) * i ** l);
			return x(...r);
		};
	}

	function U(n, s) {
		if (n === "sin") {
			const t = (i) => Math.sin((i * Math.PI) / 2);
			return p(s, (i) => 1 - t(1 - i), t);
		}
		if (n === "sec") {
			const t = (i) => 1 / Math.cos(i);
			return p(s, (i) => t((i * Math.PI) / 3) - 1);
		}
		throw new TypeError(
			"Unexpected parameters are delivered in trigo timing function."
		);
	}

	function C(n, s) {
		if (!Number.isInteger(n))
			throw new TypeError(
				"The first parameter of power timing function only allow integer."
			);
		return p(s, (e) => e ** n);
	}

	function G(n, s) {
		if (n === "sin") return p(s, (e) => (Math.cosh(e * 2) - 1) / ($ - 1));
		if (n === "tan") {
			const t = (i) => (Math.tanh(i * 3) * 1) / V;
			return p(s, (i) => 1 - t(1 - i), t);
		}
		if (n === "sec") {
			const t = (i) => 1 / Math.cosh(i);
			return p(s, (i) => 1 - (t(i * z) - 0.5) * 2);
		}
		throw new TypeError(
			"Unexpected parameters are delivered in hyper timing function."
		);
	}

	function N(n, s) {
		if (n === "sin") {
			const t = (i) => (Math.asin(i) / Math.PI) * 2;
			return p(s, (i) => 1 - t(1 - i), t);
		}
		if (n === "tan") {
			const t = (i) => Math.atan(i * 5) / P;
			return p(s, (i) => 1 - t(1 - i), t);
		}
		throw new TypeError(
			"Unexpected parameters are delivered in inverse trigo timing function."
		);
	}

	function B(n, s = () => 1) {
		let t = -1;
		return (e) => (
			(t *= -1), e < 0.5 ? n * s(e * 2) * t : n * s((1 - e) * 2) * t
		);
	}

	function D(n, s = 1, t = [0, 0], e = 0, i = (h) => 1, r = !1) {
		return (h) => {
			const l = s * h * Math.PI * 2 + (e * Math.PI) / 180,
				u = Math.cos(l),
				c = Math.sin(l),
				a = n * i(i(r ? 1 - h : h));
			return [a * u + t[0], a * c + t[1]];
		};
	}

	function H(n, s, ...t) {
		const e = [n].concat(t);
		e.push(s);
		const i = e.length,
			r = Array(i)
			.fill(0)
			.map((h, l) => A(l, i - 1));
		return (h) => {
			const l = r.map(
					(c, a) => c * e[a][0] * (1 - h) ** (i - a - 1) * h ** a
				),
				u = r.map((c, a) => c * e[a][1] * (1 - h) ** (i - a - 1) * h ** a);
			return [x(...l), x(...u)];
		};
	}

	if ("animate" in core.plugin)
		throw new ReferenceError(`插件中已存在名为animate的属性！`);

	core.plugin.animate = {
		Animation: Y,
		AnimationBase: F,
		Ticker: I,
		Transition: j,
		sleep: R,
		circle: D,
		bezierPath: H,
		linear: O,
		bezier: q,
		trigo: U,
		power: C,
		hyper: G,
		inverseTrigo: N,
		shake: B,
	};
},
    "func": function () {
    // 功能函数集，具体有哪些函数看每个函数前的注释即可
    // 安装方式：直接复制到插件里面，注意新建插件自带的 function () { } 不能删
    // 使用方式：可以直接使用对象解构按需引入
    // 例如：const { has, slide } = core.plugin.utils;
    // slide([1, 2, 3], -1); // [2, 3, 1]

    /**
     * 滑动数组，使数组元素平移若干项
     * @example slide([1, 2, 3], -1); // [2, 3, 1]
     * @example slide([1, 3, 5], 10); // [5, 3, 1];
     * @param {any[]} arr 需要滑动的数组
     * @param {number} delta 滑动的项数，正负均可
     */
    function slide(arr, delta) {
      if (delta === 0) return arr;
      delta %= arr.length;
      if (delta > 0) {
        arr.unshift(...arr.splice(arr.length - delta, delta));
        return arr;
      }
      if (delta < 0) {
        arr.push(...arr.splice(0, -delta));
        return arr;
      }
    }

    /**
     * 获取一个方向的反方向
     * @example backDir('up'); // 'down'
     * @example backDir('leftup'); // 'rightdown'
     * @param {string} dir 方向
     */
    function backDir(dir) {
      const map = {
        up: "down",
        down: "up",
        left: "right",
        right: "left",
        leftup: "rightdown",
        leftdown: "rightup",
        rightdown: "leftup",
        rightup: "leftdown",
      };
      if (!dir in map) {
        throw new TypeError(
          `Wrong dir is delivered when getting back direction.`
        );
      }
      return map[dir];
    }

    /**
     * 判断一个值是否不是undefined和null
     * @example has(0); // true
     * @example has(false); // true
     * @example has(NaN); // true
     * @example has(null); // false
     * @param {any} v 要判断的值
     */
    function has(v) {
      return v !== null && v !== void 0;
    }

    /**
     * 解析css字符串为CSSStyleDeclaration对象
     * @example
     *     parseCss('background-color: cyan; cursor: pointer; user-select: none');
     *     // 输出 { backgroundColor: 'cyan', cursor: 'pointer', userSelect: 'none' }
     * @param {string} css 要解析的css字符串
     */
    function parseCss(css) {
      const str = css.replace(/[\n\s\t]*/g, "").replace(/;*/g, ";");
      const styles = str.split(";");
      const res = {};

      for (const one of styles) {
        const [key, data] = one.split(":");
        const cssKey = key.replace(/\-([a-z])/g, (str, $1) => $1.toUpperCase());
        res[cssKey] = data;
      }
      return res;
    }

    /**
     * 等待一段时间，需在async function中使用，否则报错
     * @example await sleep(500); // 等待500毫秒
     * @param {number} time 等待的毫秒数
     */
    async function sleep(time) {
      return new Promise((res) => setTimeout(res, time));
    }

    /**
     * 在下一帧的下一帧执行一个函数
     * @example nextFrame(() => console.log(1)); // 两帧后在控制台输出1
     * @param cb 执行的函数
     */
    function nextFrame(cb) {
      requestAnimationFrame(() => {
        requestAnimationFrame(cb);
      });
    }

    /**
     * 将一个css颜色解析成一个rgba数组
     * 目前仅支持 #RGB #RGBA #RRGGBB #RRGGBBAA rgb() rgba() hsl() hsla() css自带颜色 这几种的转换
     * @exmaple parseColor('#fff'); // [255, 255, 255]
     * @example parseColor('#abcd'); // [170, 187, 204, 0.8666666666666667]
     * @example parseColor('rgba(170, 230, 13, 0.2)'); // [170, 230, 13, 0.2]
     * @example parseColor('cyan'); // [0, 255, 255]
     * @example parseColor('lightcoral'); // [240, 128, 128]
     * @example parseColor('hsla(0.2, 0.3, 0.4, 0.2)'); // [120, 133, 71, 0.2]
     * @example parseColor('rgba(20%, 50, 33%, 0.2)'); // [51, 50, 84.15, 0.2]
     * @param color 要解析的颜色字符串
     */
    function parseColor(color) {
      if (color.startsWith("rgb")) {
        // rgb
        const match = color.match(/rgba?\([\d\,\s\.%]+\)/);
        if (!has(match)) throw new Error(`Invalid color is delivered!`);
        const l = color.includes("a");
        return match[0]
          .slice(l ? 5 : 4, -1)
          .split(",")
          .map((v, i) => {
            const vv = v.trim();
            if (vv.endsWith("%")) {
              if (i === 3) {
                return parseInt(vv) / 100;
              } else {
                return (parseInt(vv) * 255) / 100;
              }
            } else return parseFloat(vv);
          })
          .slice(0, l ? 4 : 3);
      } else if (color.startsWith("#")) {
        // 十六进制
        const content = color.slice(1);
        if (![3, 4, 6, 8].includes(content.length)) {
          throw new Error(`Invalid color is delivered!`);
        }

        if (content.length <= 4) {
          const res = content.split("").map((v) => Number(`0x${v}${v}`));
          if (res.length === 4) res[3] /= 255;
          return res;
        } else {
          const res = Array(content.length / 2)
            .fill(1)
            .map((v, i) => Number(`0x${content[i * 2]}${content[i * 2 + 1]}`));
          if (res.length === 4) res[3] /= 255;
          return res;
        }
      } else if (color.startsWith("hsl")) {
        // hsl，转成rgb后输出
        const match = color.match(/hsla?\([\d\,\s\.%]+\)/);
        if (!has(match)) throw new Error(`Invalid color is delivered!`);
        const l = color.includes("a");
        const hsl = match[0]
          .slice(l ? 5 : 4, -1)
          .split(",")
          .map((v) => {
            const vv = v.trim();
            if (vv.endsWith("%")) return parseInt(vv) / 100;
            else return parseFloat(vv);
          });
        const rgb = hslToRgb(hsl[0], hsl[1], hsl[2]);
        return l ? rgb.concat([hsl[3]]) : rgb;
      } else {
        // 单词
        const rgb = cssColors[color];
        if (!has(rgb)) {
          throw new Error(`Invalid color is delivered!`);
        }
        return parseColor(rgb);
      }
    }

    /**
     * hsl转rgb
     * @param h 色相
     * @param s 饱和度
     * @param l 亮度
     */
    function hslToRgb(h, s, l) {
      if (s == 0) {
        return [0, 0, 0];
      } else {
        const hue2rgb = (p, q, t) => {
          if (t < 0) t += 1;
          if (t > 1) t -= 1;
          if (t < 1 / 6) return p + (q - p) * 6 * t;
          if (t < 1 / 2) return q;
          if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
          return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        const r = hue2rgb(p, q, h + 1 / 3);
        const g = hue2rgb(p, q, h);
        const b = hue2rgb(p, q, h - 1 / 3);
        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
      }
    }

    /**
     * 确保一个变量是一个数组，不是的话转为数组并返回，是的话直接返回传入的数组
     * @param arr 要判断的变量
     * @example ensureArray(1); // [1]
     * @example ensureArray([1, 2]); // [1, 2]
     * @example ensureArray('test'); // ['test']
     */
    function ensureArray(arr) {
      // @ts-ignore
      return arr instanceof Array ? arr : [arr];
    }

    /**
     * 返回一个坐标在某个方向上移动 d 格后的坐标
     * @param d 移动多少格，默认为1
     * @example ofDir(7, 7, 'left'); // [6, 7]
     * @example ofDir(10, 8, 'leftup', 5); // [5, 3]
     */
    function ofDir(x, y, dir, d = 1) {
      const { x: dx, y: dy } = core.utils.scan2[dir];
      return [x + dx * d, y + dy * d];
    }

    const cssColors = {
      black: "#000000",
      silver: "#c0c0c0",
      gray: "#808080",
      white: "#ffffff",
      maroon: "#800000",
      red: "#ff0000",
      purple: "#800080",
      fuchsia: "#ff00ff",
      green: "#008000",
      lime: "#00ff00",
      olive: "#808000",
      yellow: "#ffff00",
      navy: "#000080",
      blue: "#0000ff",
      teal: "#008080",
      aqua: "#00ffff",
      orange: "#ffa500",
      aliceblue: "#f0f8ff",
      antiquewhite: "#faebd7",
      aquamarine: "#7fffd4",
      azure: "#f0ffff",
      beige: "#f5f5dc",
      bisque: "#ffe4c4",
      blanchedalmond: "#ffebcd",
      blueviolet: "#8a2be2",
      brown: "#a52a2a",
      burlywood: "#deb887",
      cadetblue: "#5f9ea0",
      chartreuse: "#7fff00",
      chocolate: "#d2691e",
      coral: "#ff7f50",
      cornflowerblue: "#6495ed",
      cornsilk: "#fff8dc",
      crimson: "#dc143c",
      cyan: "#00ffff",
      darkblue: "#00008b",
      darkcyan: "#008b8b",
      darkgoldenrod: "#b8860b",
      darkgray: "#a9a9a9",
      darkgreen: "#006400",
      darkgrey: "#a9a9a9",
      darkkhaki: "#bdb76b",
      darkmagenta: "#8b008b",
      darkolivegreen: "#556b2f",
      darkorange: "#ff8c00",
      darkorchid: "#9932cc",
      darkred: "#8b0000",
      darksalmon: "#e9967a",
      darkseagreen: "#8fbc8f",
      darkslateblue: "#483d8b",
      darkslategray: "#2f4f4f",
      darkslategrey: "#2f4f4f",
      darkturquoise: "#00ced1",
      darkviolet: "#9400d3",
      deeppink: "#ff1493",
      deepskyblue: "#00bfff",
      dimgray: "#696969",
      dimgrey: "#696969",
      dodgerblue: "#1e90ff",
      firebrick: "#b22222",
      floralwhite: "#fffaf0",
      forestgreen: "#228b22",
      gainsboro: "#dcdcdc",
      ghostwhite: "#f8f8ff",
      gold: "#ffd700",
      goldenrod: "#daa520",
      greenyellow: "#adff2f",
      grey: "#808080",
      honeydew: "#f0fff0",
      hotpink: "#ff69b4",
      indianred: "#cd5c5c",
      indigo: "#4b0082",
      ivory: "#fffff0",
      khaki: "#f0e68c",
      lavender: "#e6e6fa",
      lavenderblush: "#fff0f5",
      lawngreen: "#7cfc00",
      lemonchiffon: "#fffacd",
      lightblue: "#add8e6",
      lightcoral: "#f08080",
      lightcyan: "#e0ffff",
      lightgoldenrodyellow: "#fafad2",
      lightgray: "#d3d3d3",
      lightgreen: "#90ee90",
      lightgrey: "#d3d3d3",
      lightpink: "#ffb6c1",
      lightsalmon: "#ffa07a",
      lightseagreen: "#20b2aa",
      lightskyblue: "#87cefa",
      lightslategray: "#778899",
      lightslategrey: "#778899",
      lightsteelblue: "#b0c4de",
      lightyellow: "#ffffe0",
      limegreen: "#32cd32",
      linen: "#faf0e6",
      magenta: "#ff00ff",
      mediumaquamarine: "#66cdaa",
      mediumblue: "#0000cd",
      mediumorchid: "#ba55d3",
      mediumpurple: "#9370db",
      mediumseagreen: "#3cb371",
      mediumslateblue: "#7b68ee",
      mediumspringgreen: "#00fa9a",
      mediumturquoise: "#48d1cc",
      mediumvioletred: "#c71585",
      midnightblue: "#191970",
      mintcream: "#f5fffa",
      mistyrose: "#ffe4e1",
      moccasin: "#ffe4b5",
      navajowhite: "#ffdead",
      oldlace: "#fdf5e6",
      olivedrab: "#6b8e23",
      orangered: "#ff4500",
      orchid: "#da70d6",
      palegoldenrod: "#eee8aa",
      palegreen: "#98fb98",
      paleturquoise: "#afeeee",
      palevioletred: "#db7093",
      papayawhip: "#ffefd5",
      peachpuff: "#ffdab9",
      peru: "#cd853f",
      pink: "#ffc0cb",
      plum: "#dda0dd",
      powderblue: "#b0e0e6",
      rosybrown: "#bc8f8f",
      royalblue: "#4169e1",
      saddlebrown: "#8b4513",
      salmon: "#fa8072",
      sandybrown: "#f4a460",
      seagreen: "#2e8b57",
      seashell: "#fff5ee",
      sienna: "#a0522d",
      skyblue: "#87ceeb",
      slateblue: "#6a5acd",
      slategray: "#708090",
      slategrey: "#708090",
      snow: "#fffafa",
      springgreen: "#00ff7f",
      steelblue: "#4682b4",
      tan: "#d2b48c",
      thistle: "#d8bfd8",
      tomato: "#ff6347",
      turquoise: "#40e0d0",
      violet: "#ee82ee",
      wheat: "#f5deb3",
      whitesmoke: "#f5f5f5",
      yellowgreen: "#9acd32",
      transparent: "#0000",
    };

    if (has(core.plugin.utils)) {
      throw new ReferenceError(
        `core.plugin上已经有'utils'属性，因此功能函数插件将无法使用！`
      );
    }
    core.plugin.utils = {
      has,
      slide,
      backDir,
      parseCss,
      sleep,
      nextFrame,
      parseColor,
      hslToRgb,
      ensureArray,
      ofDir,
    };
    // Utility.js
    // 通用函數插件
    // 本插件與古祠發佈的《功能插件 --- 实用功能函数集》不同，函數是定義在全域的。
    // 自訂常見事件模板插件(editorBlocklyconfigPlus.js)的前置插件

    /**
     * 使js暫停指定時間
     * async環境下await Sleep(500)
     * @param {number} millisecond 暫停毫秒數
     */
    self.Sleep = async function (millisecond) {
      return new Promise((resolve) => setTimeout(resolve, millisecond));
    };

    /**
     * 使js暫停一幀
     * async環境下await SleepFrame()
     */
    self.SleepFrame = async function () {
      return new Promise((resolve) => requestAnimationFrame(resolve));
    };

    /**
     * editor_file的isset函數
     */
    self.isset = function (val) {
      if (val == undefined || val == null) {
        return false;
      }
      return true;
    };

    /**
     * editor_file的checkCallback函數
     */
    self.checkCallback = function (callback) {
      if (!isset(callback)) {
        printe("未设置callback");
        throw "未设置callback";
      }
    };
  },
    "自定义常用事件": function () {
	// editorBlocklyconfigPlus.js
	// 自訂常見事件模板插件
	// 本插件引用了通用函數插件(Utility.js)
	// 適用樣板：2.10.3
	// 請注意：
	// 此插件對事件編輯器(editor_blocklyconfig)進行複寫，若還有其它針對事件編輯器做複寫的插件，請謹慎使用！
	// 此插件對表格操作行為(editor_mode.doActionList)進行複寫，若還有其它對表格操作行為做複寫的插件，請謹慎使用！
	// 使用方法：
	// 現在在主頁下拉選單多了個常用事件模版，在那邊可以自由設定常用事件模板。
	// 設定完後按F5刷新，再到事件編輯器看就有你設定好的常用事件模板了。

	if (main.mode == "editor") {
		//#region 配置表格初始化
		let TableFileName = "project/table/CommonEventTemplate_comment.js";
		let TableRow = `
				var CommonEventTemplate_comment = {"_type": "object",
				"_data": {
					"CommonEventTemplate": {
						"_type": "object",
						"_data": function (key) {
							var obj = {
								"检测音乐如果没有开启则系统提示开启": {
									"_leaf": true,
									"_type": "event",
									"_event": "commonEvent",
									"_data": "检测音乐如果没有开启则系统提示开启"
								},
								"仿新新魔塔一次性商人": {
									"_leaf": true,
									"_type": "event",
									"_event": "commonEvent",
									"_data": "仿新新魔塔一次性商人"
								},
								"全地图选中一个点": {
									"_leaf": true,
									"_type": "event",
									"_event": "commonEvent",
									"_data": "全地图选中一个点"
								},
								"多阶段Boss战斗": {
									"_leaf": true,
									"_type": "event",
									"_event": "commonEvent",
									"_data": "多阶段Boss战斗"
								},
							}
							if (obj[key]) return obj[key];
							return {
								"_leaf": true,
								"_type": "event",
								"_event": "commonEvent",
								"_data": "常見事件模板"
							}
						}
					}
				}}
			`;
		if (!events_c12a15a8_c380_4b28_8144_256cba95f760.CommonEventTemplate) {
			/**
			 * @type {{[EvnetName:actionParserJson]}}
			 */
			events_c12a15a8_c380_4b28_8144_256cba95f760.CommonEventTemplate = {
				检测音乐如果没有开启则系统提示开启: [{
					type: "if",
					condition: "!core.musicStatus.bgmStatus",
					true: [
						"\t[系统提示]你当前音乐处于关闭状态，本塔开音乐游戏效果更佳",
					],
					false: [],
				}, ],
				仿新新魔塔一次性商人: [{
					type: "if",
					condition: "switch:A",
					true: [
						"\t[行商,trader]\b[this]这是购买我的道具后我给玩家的提示。",
						{
							type: "comment",
							text: "下一条指令可视情况使用或不使用",
						},
						{
							type: "hide",
							remove: true,
							time: 250,
						},
					],
					false: [{
						type: "confirm",
						text: "我有3把黄钥匙，\n你出50金币就卖给你。",
						yes: [{
							type: "if",
							condition: "status:money>=50",
							true: [{
									type: "setValue",
									name: "status:money",
									operator: "-=",
									value: "50",
								},
								{
									type: "setValue",
									name: "item:yellowKey",
									operator: "+=",
									value: "3",
								},
								{
									type: "playSound",
									name: "确定",
									stop: true,
								},
								{
									type: "setValue",
									name: "switch:A",
									value: "true",
								},
							],
							false: [{
									type: "playSound",
									name: "操作失败",
								},
								"\t[行商,trader]\b[this]你的金币不足！",
							],
						}, ],
						no: [],
					}, ],
				}, ],
				全地图选中一个点: [{
						type: "comment",
						text: "全地图选中一个点，需要用鼠标或触屏操作",
					},
					{
						type: "setValue",
						name: "temp:X",
						value: "status:x",
					},
					{
						type: "setValue",
						name: "temp:Y",
						value: "status:y",
					},
					{
						type: "tip",
						text: "再次点击闪烁位置确认",
					},
					{
						type: "while",
						condition: "true",
						data: [{
								type: "drawSelector",
								image: "winskin.png",
								code: 1,
								x: "32*temp:X",
								y: "32*temp:Y",
								width: 32,
								height: 32,
							},
							{
								type: "wait",
							},
							{
								type: "if",
								condition: "(flag:type === 1)",
								true: [{
										type: "if",
										condition: "((temp:X===flag:x)&&(temp:Y===flag:y))",
										true: [{
											type: "break",
											n: 1,
										}, ],
									},
									{
										type: "setValue",
										name: "temp:X",
										value: "flag:x",
									},
									{
										type: "setValue",
										name: "temp:Y",
										value: "flag:y",
									},
								],
							},
						],
					},
					{
						type: "drawSelector",
						code: 1,
					},
					{
						type: "comment",
						text: "流程进行到这里可以对[X,Y]点进行处理，比如",
					},
					{
						type: "closeDoor",
						id: "yellowDoor",
						loc: ["temp:X", "temp:Y"],
					},
				],
				多阶段Boss战斗: [{
						type: "comment",
						text: "多阶段boss，请直接作为战后事件使用",
					},
					{
						type: "setValue",
						name: "switch:A",
						operator: "+=",
						value: "1",
					},
					{
						type: "switch",
						condition: "switch:A",
						caseList: [{
								case: "1",
								action: [{
										type: "setBlock",
										number: "redSlime",
									},
									"\t[2阶段boss,redSlime]\b[this]你以为你已经打败我了吗？没听说过史莱姆有九条命吗？",
								],
							},
							{
								case: "2",
								action: [{
										type: "setBlock",
										number: "blackSlime",
									},
									"\t[3阶段boss,blackSlime]\b[this]不能消灭我的，只会让我更强大！",
								],
							},
							{
								case: "3",
								action: [{
										type: "setBlock",
										number: "slimelord",
									},
									"\t[4阶段boss,slimelord]\b[this]我还能打！",
								],
							},
							{
								case: "4",
								action: ["\t[4阶段boss,slimelord]我一定会回来的！"],
							},
						],
					},
				],
			};
		}
		//#endregion

		// 新增模板選項
		let editModeSelect = document.getElementById("editModeSelect");
		let newEditModeOption = document.createElement("option");
		newEditModeOption.value = "CommonEventTemplate";
		newEditModeOption.text = "常見事件模板";
		editModeSelect.add(newEditModeOption);

		//檢查可用的編輯模板ID
		let leftIDNumber = 11 - 1;
		let ExistLeftElement = document.querySelector(".main");
		while (ExistLeftElement) {
			leftIDNumber++;
			ExistLeftElement = document.getElementById(`left${leftIDNumber}`);
		}

		//新增編輯模板
		let MainDiv = document.querySelector(".main");

		let CommonEventTemplateMainDiv = document.createElement("div");
		CommonEventTemplateMainDiv.id = `left${leftIDNumber}`;
		CommonEventTemplateMainDiv.className = "leftTab";
		CommonEventTemplateMainDiv.style.zIndex = "-1";
		CommonEventTemplateMainDiv.style.opacity = "0";

		CommonEventTemplateMainDiv.innerHTML = `
				<!-- CommonEventTemplate -->
				<h3 class="leftTabHeader">
				常見事件模板  
				<button onclick="editor.mode.onmode('save')">保存</button>  
				<button onclick="editor.table.CommonEventTemplateAddFunc()">添加</button>  
				<button onclick="editor.mode.changeDoubleClickModeByButton('delete')">删除</button>  
				<button onclick="editor_multi.CommonEventTemplateEditCommentJs('CommonEventTemplate')">配置表格</button>
				</h3>
				<div class="leftTabContent">
					<div class='etable'>
						<table>
							<tbody id='table_298572d8-93dd-4c6e-a278-6a7d49831e3a'>
							<tr>
								<td>条目</td>
								<td>注释</td>
								<td>值</td>
							</tr>
							</tbody>
						</table>
					</div>
				</div>
			`;
		MainDiv.appendChild(CommonEventTemplateMainDiv);

		(async function () {
			//等待編輯器初始化
			while (!editor_mode.ids) {
				await Sleep(100);
			}
			//新增編輯模板ID
			editor_mode.ids["CommonEventTemplate"] = `left${leftIDNumber}`;
			editor_mode.init_dom_ids();
			//切換至常見事件模板
			editor_mode.CommonEventTemplate = function (callback) {
				var objs = [];
				editor.file.editCommonEventTemplate([], function (objs_) {
					objs = objs_;
					//console.log(objs_)
				});
				//只查询不修改时,内部实现不是异步的,所以可以这么写
				var tableinfo = editor.table.objToTable(objs[0], objs[1]);
				document.getElementById(
					"table_298572d8-93dd-4c6e-a278-6a7d49831e3a"
				).innerHTML = tableinfo.HTML;
				tableinfo.listen(tableinfo.guids);
				if (Boolean(callback)) callback();
			};

			//檢查配置表格存在
			let TableRowExist = null;
			fs.readFile(TableFileName, "base64", function (err, data) {
				if (err) {
					console.log(`察覺常見事件模板配置表格不存在，原因：${err}`);
					console.log("新建一個常見事件模板配置表格。");
					TableRowExist = false;
				} else {
					TableRowExist = true;
				}
			});
			//等待配置表格載入完畢(最多0.3秒，超過則視為失敗)
			for (let i = 0; i < 3; i++) {
				if (TableRowExist == null) {
					await Sleep(100);
				}
			}
			//配置表格初始化
			if (TableRowExist != true) {
				fs.mkdir("project/table", function (err, data) {
					if (err) throw `常見事件模板配置表格目錄初始化失敗，原因：${err}`;
				});
				fs.writeFile(
					TableFileName,
					editor.util.encode64(TableRow || ""),
					"base64",
					function (err, data) {
						if (err) throw `常見事件模板配置表格文件初始化失敗，原因：${err}`;
					}
				);
			}
			//載入配置表格
			//editor.file.loadCommentjs(callback);
			(function () {
				var key = "CommonEventTemplate_comment";
				var script = document.createElement("script");
				script.src = "project/table/" + key + ".js";
				document.body.appendChild(script);
				script.onload = function () {
					editor.file[key] = eval(key.replace(".", "_"));
					var loaded = Boolean(editor.file[key]);
				};
			})();
			//按下配置表格
			editor_multi.CommonEventTemplateEditCommentJs = function (mod) {
				editor_multi.lintAutocomplete = true;
				editor_multi.setLint();
				editor_multi.importFile(TableFileName);
			};

			//定義表格操作行為
			editor_mode.OriginDoActionList = editor_mode.doActionList;
			editor_mode.doActionList = function (mode, actionList, callback) {
				if (editor_mode.mode == "CommonEventTemplate") {
					if (actionList.length == 0) return;
					printf("修改中...");
					var cb = function (objs_) {
						if (objs_.slice(-1)[0] != null) {
							printe(objs_.slice(-1)[0]);
							throw objs_.slice(-1)[0];
						}
						var str = "修改成功！";
						if (
							data_a1e2fb4a_e986_4524_b0da_9b7ba7c0874d.firstData.name ==
							"template"
						)
							str += "<br/>请注意：全塔属性的name尚未修改，请及时予以设置。";
						printf(str);
						if (callback) callback();
					};
					editor.file.editCommonEventTemplate(actionList, cb);
				} else {
					editor_mode.OriginDoActionList(mode, actionList, callback);
				}
			};
			//添加表格列
			editor.table.CommonEventTemplateAddFunc = function () {
				let obj = events_c12a15a8_c380_4b28_8144_256cba95f760;

				// 1.输入id
				let newid = prompt("请输入新项的ID（支持中文）");
				if (newid == null || newid.length == 0) {
					return;
				}

				// 2.检查id是否符合规范或与已有id重复
				var conflict = true;
				var basefield = "".replace(/\[[^\[]*\]$/, "");

				try {
					var baseobj = eval("obj" + basefield);
					conflict = newid in baseobj;
				} catch (ee) {
					// 理论上这里不会发生错误
					printe(ee);
					throw ee;
				}

				if (conflict) {
					printe("id已存在, 请直接修改该项的值");
					return;
				}

				// 3.添加
				editor_mode.addAction(["add", basefield + "['" + newid + "']", null]);
				editor_mode.onmode("save", function () {
					printf("添加成功，刷新后生效；也可以继续新增其他项目。");
				}); //自动保存 删掉此行的话点保存按钮才会保存
			};
			//對表格的存讀
			editor.file.editCommonEventTemplate = function (actionList, callback) {
				/*actionList:[
				  ["change","['test']",['123']],
				]
				为[]时只查询不修改
				*/
				var data_obj =
					events_c12a15a8_c380_4b28_8144_256cba95f760.CommonEventTemplate;
				checkCallback(callback);
				if (isset(actionList) && actionList.length > 0) {
					actionList.forEach(function (value) {
						value[1] = "['CommonEventTemplate']" + value[1];
					});
					editor.file.saveSetting("events", actionList, function (err) {
						callback([err]);
					});
				} else {
					callback([
						Object.assign({}, data_obj),
						editor.file.CommonEventTemplate_comment._data.CommonEventTemplate,
						null,
					]);
				}
			};
		})();

		//複寫事件編輯器(editor_blocklyconfig)
		editor_blocklyconfig = function () {
				// start mark sfergsvae

				(function () {
					var getCategory = function (name, custom) {
						for (var node of document.getElementById("toolbox").children) {
							if (node.getAttribute("name") == name) return node;
						}
						var node = document.createElement("category");
						node.setAttribute("name", name);
						if (custom) node.setAttribute("custom", custom);
						document.getElementById("toolbox").appendChild(node);
						return node;
					};

					var toolboxObj = {
						入口方块: [
							'<label text="入口方块会根据当前类型在此数组中筛选,具体控制在editor_blockly.entranceCategoryCallback中"></label>',
							MotaActionFunctions.actionParser.parse(
								[
									"欢迎使用事件编辑器",
									"本事件触发一次后会消失",
									{ type: "hide", time: 500 },
								],
								"event"
							),
							MotaActionFunctions.actionParser.parse({
									condition: "flag:__door__===2",
									currentFloor: true,
									priority: 0,
									delayExecute: false,
									multiExecute: false,
									data: [{ type: "openDoor", loc: [10, 5] }],
								},
								"autoEvent"
							),
							MotaActionBlocks["changeFloor_m"].xmlText(),
							MotaActionFunctions.actionParser.parse(
								[{
										id: "shop1",
										text: "\t[贪婪之神,moneyShop]勇敢的武士啊, 给我${20+2*flag:shop1}金币就可以：",
										textInList: "1F金币商店",
										choices: [{
											text: "生命+800",
											need: "status:money>=20+2*flag:shop1",
											action: [{
													type: "comment",
													text: "新版商店中需要手动扣减金币和增加访问次数",
												},
												{
													type: "setValue",
													name: "status:money",
													operator: "-=",
													value: "20+2*flag:shop1",
												},
												{
													type: "setValue",
													name: "flag:shop1",
													operator: "+=",
													value: "1",
												},
												{
													type: "setValue",
													name: "status:hp",
													operator: "+=",
													value: "800",
												},
											],
										}, ],
									},
									{
										id: "itemShop",
										item: true,
										textInList: "道具商店",
										choices: [{ id: "yellowKey", number: 10, money: 10 }],
									},
									{
										id: "keyShop1",
										textInList: "回收钥匙商店",
										commonEvent: "回收钥匙商店",
										args: "",
									},
								],
								"shop"
							),
							MotaActionBlocks["common_m"].xmlText(),
							MotaActionBlocks["beforeBattle_m"].xmlText(),
							MotaActionBlocks["afterBattle_m"].xmlText(),
							MotaActionBlocks["afterGetItem_m"].xmlText(),
							MotaActionBlocks["afterOpenDoor_m"].xmlText(),
							MotaActionBlocks["firstArrive_m"].xmlText(),
							MotaActionBlocks["eachArrive_m"].xmlText(),
							MotaActionBlocks["level_m"].xmlText(),
							MotaActionFunctions.actionParser.parse(
								[
									["MTx", ""]
								],
								"floorPartition"
							),
							MotaActionBlocks["commonEvent_m"].xmlText(),
							MotaActionBlocks["item_m"].xmlText(),
							MotaActionFunctions.actionParser.parse(
								[{
									title: "简单",
									name: "Easy",
									hard: 1,
									action: [
										{ type: "comment", text: "在这里写该难度需执行的事件" },
									],
								}, ],
								"levelChoose"
							),
							MotaActionFunctions.actionParser.parse({
									type: 0,
									value: { atk: 10 },
									percentage: { speed: 10 },
								},
								"equip"
							),
							MotaActionFunctions.actionParser.parse(
								[{
									name: "bg.jpg",
									x: 0,
									y: 0,
									canvas: "bg",
								}, ],
								"floorImage"
							),
							MotaActionFunctions.actionParser.parse({
									time: 160,
									openSound: "door.mp3",
									closeSound: "door.mp3",
									keys: { yellowKey: 1, orangeKey: 1 },
								},
								"doorInfo"
							),
							MotaActionBlocks["faceIds_m"].xmlText(),
							MotaActionBlocks["mainStyle_m"].xmlText(),
							MotaActionFunctions.actionParser.parse({
									背景音乐: "bgm.mp3",
									确定: "confirm.mp3",
									攻击: "attack.mp3",
									背景图: "bg.jpg",
									领域: "zone",
									文件名: "file.jpg",
								},
								"nameMap"
							),
							MotaActionFunctions.actionParser.parse(
								[{ name: "hero.png", width: 32, height: 32, prefix: "hero_" }],
								"splitImages"
							),
						],
						显示文字: [
							MotaActionBlocks["text_0_s"].xmlText(),
							MotaActionBlocks["text_1_s"].xmlText(),
							MotaActionFunctions.actionParser.parseList(
								"\t[小妖精,fairy]\f[fairy.png,0,0]欢迎使用事件编辑器(双击方块可直接预览)"
							),
							MotaActionBlocks["moveTextBox_s"].xmlText(),
							MotaActionBlocks["clearTextBox_s"].xmlText(),
							MotaActionBlocks["comment_s"].xmlText(),
							MotaActionBlocks["autoText_s"].xmlText(),
							MotaActionBlocks["scrollText_s"].xmlText(),
							MotaActionBlocks["setText_s"].xmlText(),
							MotaActionBlocks["tip_s"].xmlText(),
							MotaActionBlocks["confirm_s"].xmlText(),
							MotaActionBlocks["choices_s"].xmlText([
								"选择剑或者盾",
								"流浪者",
								"man",
								0,
								"",
								MotaActionBlocks["choicesContext"].xmlText([
									"剑",
									"",
									"",
									null,
									"",
									"",
									MotaActionFunctions.actionParser.parseList([
										{ type: "openDoor", loc: [3, 3] },
									]),
								]),
							]),
							MotaActionBlocks["win_s"].xmlText(),
							MotaActionBlocks["lose_s"].xmlText(),
							MotaActionBlocks["restart_s"].xmlText(),
						],
						数据相关: [
							MotaActionBlocks["setValue_s"].xmlText([
								MotaActionBlocks["idIdList_e"].xmlText(["status", "生命"]),
								"=",
								"",
								false,
							]),
							MotaActionBlocks["setEnemy_s"].xmlText(),
							MotaActionBlocks["setEnemyOnPoint_s"].xmlText(),
							MotaActionBlocks["resetEnemyOnPoint_s"].xmlText(),
							MotaActionBlocks["moveEnemyOnPoint_s"].xmlText(),
							MotaActionBlocks["moveEnemyOnPoint_1_s"].xmlText(),
							MotaActionBlocks["setEquip_s"].xmlText(),
							MotaActionBlocks["setFloor_s"].xmlText(),
							MotaActionBlocks["setGlobalAttribute_s"].xmlText(),
							MotaActionBlocks["setGlobalValue_s"].xmlText(),
							MotaActionBlocks["setGlobalFlag_s"].xmlText(),
							MotaActionBlocks["setNameMap_s"].xmlText(),
							MotaActionBlocks["input_s"].xmlText(),
							MotaActionBlocks["input2_s"].xmlText(),
							MotaActionBlocks["update_s"].xmlText(),
							MotaActionBlocks["moveAction_s"].xmlText(),
							MotaActionBlocks["changeFloor_s"].xmlText(),
							MotaActionBlocks["changePos_s"].xmlText(),
							MotaActionBlocks["battle_s"].xmlText(),
							MotaActionBlocks["useItem_s"].xmlText(),
							MotaActionBlocks["loadEquip_s"].xmlText(),
							MotaActionBlocks["unloadEquip_s"].xmlText(),
							MotaActionBlocks["openShop_s"].xmlText(),
							MotaActionBlocks["disableShop_s"].xmlText(),
							MotaActionBlocks["setHeroIcon_s"].xmlText(),
							MotaActionBlocks["follow_s"].xmlText(),
							MotaActionBlocks["unfollow_s"].xmlText(),
						],
						地图处理: [
							MotaActionBlocks["battle_1_s"].xmlText(),
							MotaActionBlocks["openDoor_s"].xmlText(),
							MotaActionBlocks["closeDoor_s"].xmlText(),
							MotaActionBlocks["show_s"].xmlText(),
							MotaActionBlocks["hide_s"].xmlText(),
							MotaActionBlocks["setBlock_s"].xmlText(),
							MotaActionBlocks["setBlockOpacity_s"].xmlText(),
							MotaActionBlocks["setBlockFilter_s"].xmlText(),
							MotaActionBlocks["turnBlock_s"].xmlText(),
							MotaActionBlocks["moveHero_s"].xmlText(),
							MotaActionBlocks["move_s"].xmlText(),
							MotaActionBlocks["jumpHero_s"].xmlText(),
							MotaActionBlocks["jumpHero_1_s"].xmlText(),
							MotaActionBlocks["jump_s"].xmlText(),
							MotaActionBlocks["jump_1_s"].xmlText(),
							MotaActionBlocks["showBgFgMap_s"].xmlText(),
							MotaActionBlocks["hideBgFgMap_s"].xmlText(),
							MotaActionBlocks["setBgFgBlock_s"].xmlText(),
							MotaActionBlocks["showFloorImg_s"].xmlText(),
							MotaActionBlocks["hideFloorImg_s"].xmlText(),
						],
						事件控制: [
							MotaActionBlocks["if_1_s"].xmlText(),
							MotaActionBlocks["if_s"].xmlText(),
							MotaActionFunctions.actionParser.parseList({
								type: "switch",
								condition: "判别值",
								caseList: [{
										action: [
											{ type: "comment", text: "当判别值是值的场合执行此事件" },
										],
									},
									{
										case: "default",
										action: [{
											type: "comment",
											text: "当没有符合的值的场合执行default事件",
										}, ],
									},
								],
							}),
							MotaActionFunctions.actionParser.parseList({
								type: "for",
								name: "temp:A",
								from: "0",
								to: "12",
								step: "1",
								data: [],
							}),
							MotaActionFunctions.actionParser.parseList({
								type: "forEach",
								name: "temp:A",
								list: ["status:atk", "status:def"],
								data: [],
							}),
							MotaActionBlocks["while_s"].xmlText(),
							MotaActionBlocks["dowhile_s"].xmlText(),
							MotaActionBlocks["break_s"].xmlText(),
							MotaActionBlocks["continue_s"].xmlText(),
							MotaActionBlocks["exit_s"].xmlText(),
							MotaActionBlocks["trigger_s"].xmlText(),
							MotaActionBlocks["insert_1_s"].xmlText(),
							MotaActionBlocks["insert_2_s"].xmlText(),
						],
						特效表现: [
							MotaActionBlocks["sleep_s"].xmlText(),
							MotaActionFunctions.actionParser.parseList({
								type: "wait",
								timeout: 0,
								data: [{
										case: "keyboard",
										keycode: "13,32",
										action: [{
											type: "comment",
											text: "当按下回车(keycode=13)或空格(keycode=32)时执行此事件\n超时剩余时间会写入flag:timeout",
										}, ],
									},
									{
										case: "mouse",
										px: [0, 32],
										py: [0, 32],
										action: [{
											type: "comment",
											text: "当点击地图左上角时执行此事件\n超时剩余时间会写入flag:timeout",
										}, ],
									},
									{
										case: "condition",
										condition: "flag:type==0\n&&flag:keycode==13",
										action: [{
											type: "comment",
											text: "当满足自定义条件时会执行此事件\n超时剩余时间会写入flag:timeout",
										}, ],
									},
									{
										case: "timeout",
										action: [
											{ type: "comment", text: "当超时未操作时执行此事件" },
										],
									},
								],
							}),
							MotaActionBlocks["waitAsync_s"].xmlText(),
							MotaActionBlocks["stopAsync_s"].xmlText(),
							MotaActionBlocks["vibrate_s"].xmlText(),
							MotaActionBlocks["animate_s"].xmlText(),
							MotaActionBlocks["animate_1_s"].xmlText(),
							MotaActionBlocks["animateResize_s"].xmlText(),
							MotaActionBlocks["moveAnimate_s"].xmlText(),
							MotaActionBlocks["pauseAnimate_s"].xmlText(),
							MotaActionBlocks["remuseAnimate_s"].xmlText(),
							MotaActionBlocks["stopAnimate_s"].xmlText(),
							MotaActionBlocks["setViewport_s"].xmlText(),
							MotaActionBlocks["setViewport_1_s"].xmlText(),
							MotaActionBlocks["lockViewport_s"].xmlText(),
							MotaActionBlocks["showStatusBar_s"].xmlText(),
							MotaActionBlocks["hideStatusBar_s"].xmlText(),
							MotaActionBlocks["setHeroOpacity_s"].xmlText(),
							MotaActionBlocks["setCurtain_0_s"].xmlText(),
							MotaActionBlocks["setCurtain_1_s"].xmlText(),
							MotaActionBlocks["screenFlash_s"].xmlText(),
							MotaActionBlocks["setWeather_s"].xmlText(),
							MotaActionBlocks["callBook_s"].xmlText(),
							MotaActionBlocks["callSave_s"].xmlText(),
							MotaActionBlocks["autoSave_s"].xmlText(),
							MotaActionBlocks["forbidSave_s"].xmlText(),
							MotaActionBlocks["callLoad_s"].xmlText(),
						],
						音像处理: [
							MotaActionBlocks["setanimate_s"].xmlText(),
							MotaActionBlocks["deleteanimate_s"].xmlText(),
							MotaActionBlocks["playanimate_s"].xmlText(),
							MotaActionBlocks["clearanimate_s"].xmlText(),
							MotaActionBlocks["animateloop_s"].xmlText(),
							MotaActionBlocks["animatereverse_s"].xmlText(),
							MotaActionBlocks["animatepause_s"].xmlText(),
							MotaActionBlocks["animatemove_s"].xmlText(),
							MotaActionBlocks["showImage_s"].xmlText(),
							MotaActionBlocks["showImage_1_s"].xmlText(),
							MotaActionBlocks["hideImage_s"].xmlText(),
							MotaActionBlocks["showTextImage_s"].xmlText(),
							MotaActionBlocks["moveImage_s"].xmlText(),
							MotaActionBlocks["rotateImage_s"].xmlText(),
							MotaActionBlocks["scaleImage_s"].xmlText(),
							MotaActionBlocks["showGif_s"].xmlText(),
							MotaActionBlocks["playBgm_s"].xmlText(),
							MotaActionBlocks["pauseBgm_s"].xmlText(),
							MotaActionBlocks["resumeBgm_s"].xmlText(),
							MotaActionBlocks["loadBgm_s"].xmlText(),
							MotaActionBlocks["freeBgm_s"].xmlText(),
							MotaActionBlocks["playSound_s"].xmlText(),
							MotaActionBlocks["playSound_1_s"].xmlText(),
							MotaActionBlocks["stopSound_s"].xmlText(),
							MotaActionBlocks["setVolume_s"].xmlText(),
							MotaActionBlocks["setBgmSpeed_s"].xmlText(),
						],
						UI绘制: [
							MotaActionBlocks["previewUI_s"].xmlText(),
							MotaActionBlocks["clearMap_s"].xmlText(),
							MotaActionBlocks["setAttribute_s"].xmlText(),
							MotaActionBlocks["setFilter_s"].xmlText(),
							MotaActionBlocks["fillText_s"].xmlText(),
							MotaActionBlocks["fillBoldText_s"].xmlText(),
							MotaActionBlocks["drawTextContent_s"].xmlText(),
							MotaActionBlocks["fillRect_s"].xmlText(),
							MotaActionBlocks["strokeRect_s"].xmlText(),
							MotaActionBlocks["drawLine_s"].xmlText(),
							MotaActionBlocks["drawArrow_s"].xmlText(),
							MotaActionBlocks["fillPolygon_s"].xmlText(),
							MotaActionBlocks["strokePolygon_s"].xmlText(),
							MotaActionBlocks["fillEllipse_s"].xmlText(),
							MotaActionBlocks["strokeEllipse_s"].xmlText(),
							MotaActionBlocks["fillArc_s"].xmlText(),
							MotaActionBlocks["strokeArc_s"].xmlText(),
							MotaActionBlocks["drawImage_s"].xmlText(),
							MotaActionBlocks["drawImage_1_s"].xmlText(),
							MotaActionBlocks["drawIcon_s"].xmlText(),
							MotaActionBlocks["drawBackground_s"].xmlText(),
							MotaActionBlocks["drawSelector_s"].xmlText(),
							MotaActionBlocks["drawSelector_1_s"].xmlText(),
						],
						原生脚本: [
							MotaActionBlocks["function_s"].xmlText(),
							MotaActionBlocks["unknown_s"].xmlText(),
						],
						值块: [
							MotaActionBlocks["setValue_s"].xmlText([
								MotaActionBlocks["idIdList_e"].xmlText(["status", "生命"]),
								"=",
								"",
								false,
							]),
							MotaActionBlocks["expression_arithmetic_0"].xmlText(),
							MotaActionBlocks["idFlag_e"].xmlText(),
							MotaActionBlocks["idTemp_e"].xmlText(),
							MotaActionBlocks["negate_e"].xmlText(),
							MotaActionBlocks["unaryOperation_e"].xmlText(),
							MotaActionBlocks["bool_e"].xmlText(),
							MotaActionBlocks["idString_e"].xmlText(),
							MotaActionBlocks["idIdList_e"].xmlText(),
							MotaActionBlocks["idFixedList_e"].xmlText(),
							MotaActionBlocks["enemyattr_e"].xmlText(),
							MotaActionBlocks["blockId_e"].xmlText(),
							MotaActionBlocks["blockNumber_e"].xmlText(),
							MotaActionBlocks["blockCls_e"].xmlText(),
							MotaActionBlocks["hasEquip_e"].xmlText(),
							MotaActionBlocks["equip_e"].xmlText(),
							MotaActionBlocks["nextXY_e"].xmlText(),
							MotaActionBlocks["isReplaying_e"].xmlText(),
							MotaActionBlocks["hasVisitedFloor_e"].xmlText(),
							MotaActionBlocks["isShopVisited_e"].xmlText(),
							MotaActionBlocks["canBattle_e"].xmlText(),
							MotaActionBlocks["damage_e"].xmlText(),
							MotaActionBlocks["damage_1_e"].xmlText(),
							MotaActionBlocks["rand_e"].xmlText(),
							MotaActionBlocks["evalString_e"].xmlText(),
						],
						常见事件模板: [
							'<label text="此处只是占位符,实际定义在#region 動態常見事件模板"></label>',
						],
						最近使用事件: [
							'<label text="此处只是占位符,实际定义在editor_blockly.searchBlockCategoryCallback中"></label>',
						],
					};
					var toolboxgap = '<sep gap="5"></sep>';
					//xml_text = MotaActionFunctions.actionParser.parse(obj,type||'event')
					//MotaActionBlocks['idString_e'].xmlText()

					//#region 動態常見事件模板
					let CommonEventTemplateHTML = [];

					for (let commonEventName in events_c12a15a8_c380_4b28_8144_256cba95f760.CommonEventTemplate) {
						if (
							events_c12a15a8_c380_4b28_8144_256cba95f760.CommonEventTemplate.hasOwnProperty(
								commonEventName
							)
						) {
							let actionParserJson = Array.from(
								events_c12a15a8_c380_4b28_8144_256cba95f760.CommonEventTemplate[
									commonEventName
								] ?? []
							);

							let labelHTML = "";
							let blockHTML = "";

							labelHTML = `<label text="${commonEventName}"></label>`;

							if (actionParserJson.length > 1) {
								actionParserJson = {
									type: "if",
									condition: "true",
									true: actionParserJson,
								};
							} else if (actionParserJson.length < 1) {
								actionParserJson = [
									"空的常用事件模板。\n請在主頁下拉菜單中，選擇常用事件模板，進行編輯。\n編輯後需按F5刷新事件編輯器。",
								];
							}
							blockHTML =
								MotaActionFunctions.actionParser.parseList(actionParserJson);

							CommonEventTemplateHTML.push(labelHTML);
							CommonEventTemplateHTML.push(blockHTML);
						}
					}

					toolboxObj["常见事件模板"] = CommonEventTemplateHTML;
					//#endregion

					for (var name in toolboxObj) {
						var custom = null;
						if (name == "最近使用事件") custom = "searchBlockCategory";
						if (name == "入口方块") custom = "entranceCategory";
						getCategory(name, custom).innerHTML =
							toolboxObj[name].join(toolboxgap);
					}

					var blocklyArea = document.getElementById("blocklyArea");
					var blocklyDiv = document.getElementById("blocklyDiv");
					var workspace = Blockly.inject(blocklyDiv, {
						media: "_server/blockly/media/",
						toolbox: document.getElementById("toolbox"),
						zoom: {
							controls: true,
							wheel: false, //滚轮改为上下(shift:左右)翻滚
							startScale: 1.0,
							maxScale: 3,
							minScale: 0.3,
							scaleSpeed: 1.08,
						},
						trashcan: false,
					});

					editor_blockly.isCommonEntry = function () {
						var commonEntries = [
							"beforeBattle",
							"afterBattle",
							"afterOpenDoor",
							"firstArrive",
							"eachArrive",
							"commonEvent",
							"item",
						];
						return commonEntries.indexOf(editor_blockly.entryType) >= 0;
					};

					editor_blockly.entranceCategoryCallback = function (workspace) {
						var list = toolboxObj["入口方块"];
						var xmlList = [];
						var eventType =
							(editor_blockly.isCommonEntry() ?
								"common" :
								editor_blockly.entryType) + "_m";
						for (var ii = 0, blockText;
							(blockText = list[ii]); ii++) {
							if (
								new RegExp('<block type="' + eventType + '">').exec(blockText)
							) {
								var block = Blockly.Xml.textToDom(
									"<xml>" + blockText + "</xml>"
								).firstChild;
								block.setAttribute("gap", 5);
								xmlList.push(block);
							}
						}
						return xmlList;
					};

					workspace.registerToolboxCategoryCallback(
						"entranceCategory",
						editor_blockly.entranceCategoryCallback
					);

					editor_blockly.searchBlockCategoryCallback = function (workspace) {
						var xmlList = [];
						var labels = editor_blockly.searchBlock();
						for (var i = 0; i < labels.length; i++) {
							var blockText =
								"<xml>" + MotaActionBlocks[labels[i]].xmlText() + "</xml>";
							var block = Blockly.Xml.textToDom(blockText).firstChild;
							block.setAttribute("gap", 5);
							xmlList.push(block);
						}
						return xmlList;
					};

					workspace.registerToolboxCategoryCallback(
						"searchBlockCategory",
						editor_blockly.searchBlockCategoryCallback
					);

					var onresize = function (e) {
						blocklyDiv.style.width = blocklyArea.offsetWidth + "px";
						blocklyDiv.style.height = blocklyArea.offsetHeight + "px";
						Blockly.svgResize(workspace);
					};
					if (typeof editor !== "undefined" && !editor.isMobile)
						window.addEventListener("resize", onresize, false);
					onresize();
					//Blockly.svgResize(workspace);

					//Blockly.bindEventWithChecks_(workspace.svgGroup_,"wheel",workspace,function(e){});
					document.getElementById("blocklyDiv").onmousewheel = function (e) {
						//console.log(e);
						e.preventDefault();
						var hvScroll = e.shiftKey ? "hScroll" : "vScroll";
						var mousewheelOffsetValue =
							(20 / 380) * workspace.scrollbar[hvScroll].handleLength_ * 3;
						workspace.scrollbar[hvScroll].handlePosition_ +=
							(e.deltaY || 0) + (e.detail || 0) > 0 ?
							mousewheelOffsetValue :
							-mousewheelOffsetValue;
						workspace.scrollbar[hvScroll].onScroll_();
						// workspace.setScale(workspace.scale);
					};

					var doubleClickCheck = [
						[0, "abc"]
					];

					function omitedcheckUpdateFunction(event) {
						if (event.type === "create") {
							editor_blockly.addIntoLastUsedType(event.blockId);
						}
						if (event.type === "ui" && event.element == "click") {
							var newClick = [new Date().getTime(), event.blockId];
							var lastClick = doubleClickCheck.shift();
							doubleClickCheck.push(newClick);
							if (newClick[0] - lastClick[0] < 500) {
								if (newClick[1] === lastClick[1]) {
									editor_blockly.doubleClickBlock(newClick[1]);
								}
							}
						}
						// Only handle these events
						if (["create", "move", "change", "delete"].indexOf(event.type) < 0)
							return;
						if (editor_blockly.workspace.topBlocks_.length >= 2) {
							editor_blockly.setValue("入口方块只能有一个");
							return;
						}
						var eventType = editor_blockly.entryType;
						if (editor_blockly.workspace.topBlocks_.length == 1) {
							var blockType = editor_blockly.workspace.topBlocks_[0].type;
							if (
								blockType !== eventType + "_m" &&
								!(editor_blockly.isCommonEntry() && blockType == "common_m")
							) {
								editor_blockly.setValue("入口方块类型错误");
								return;
							}
						}
						try {
							var code = Blockly.JavaScript.workspaceToCode(workspace).replace(
								/\\(i|c|d|e|g|z)/g,
								"\\\\$1"
							);
							editor_blockly.setValue(code);
						} catch (error) {
							editor_blockly.setValue(String(error));
							if (error instanceof OmitedError) {
								var blockName = error.blockName;
								var varName = error.varName;
								var block = error.block;
							}
							// console.log(error);
						}
					}

					workspace.addChangeListener(omitedcheckUpdateFunction);

					workspace.addChangeListener(Blockly.Events.disableOrphans);

					editor_blockly.workspace = workspace;

					MotaActionFunctions.workspace = function () {
						return editor_blockly.workspace;
					};

					// 因为在editor_blockly.parse里已经HTML转义过一次了,所以这里要覆盖掉以避免在注释中出现<等
					MotaActionFunctions.xmlText = function (
						ruleName,
						inputs,
						isShadow,
						comment,
						collapsed,
						disabled
					) {
						var rule = MotaActionBlocks[ruleName];
						var blocktext = isShadow ? "shadow" : "block";
						var xmlText = [];
						xmlText.push(
							"<" +
							blocktext +
							' type="' +
							ruleName +
							'"' +
							(collapsed ? ' collapsed="true"' : "") +
							(disabled ? ' disabled="true"' : "") +
							">"
						);
						if (!inputs) inputs = [];
						for (var ii = 0, inputType;
							(inputType = rule.argsType[ii]); ii++) {
							var input = inputs[ii];
							var _input = "";
							var noinput = input === null || input === undefined;
							if (
								noinput &&
								inputType === "field" &&
								MotaActionBlocks[rule.argsGrammarName[ii]].type !==
								"field_dropdown"
							)
								continue;
							if (noinput && inputType === "field") {
								noinput = false;
								input = rule.fieldDefault(rule.args[ii]);
							}
							if (noinput) input = "";
							if (
								inputType === "field" &&
								MotaActionBlocks[rule.argsGrammarName[ii]].type ===
								"field_checkbox"
							)
								input = input ? "TRUE" : "FALSE";
							if (inputType !== "field") {
								var subList = false;
								var subrulename = rule.argsGrammarName[ii];
								var subrule = MotaActionBlocks[subrulename];
								if (subrule instanceof Array) {
									subrulename = subrule[subrule.length - 1];
									subrule = MotaActionBlocks[subrulename];
									subList = true;
								}
								_input = subrule.xmlText([], true);
								if (noinput && !subList && !isShadow) {
									//无输入的默认行为是: 如果语句块的备选方块只有一个,直接代入方块
									input = subrule.xmlText();
								}
							}
							xmlText.push("<" + inputType + ' name="' + rule.args[ii] + '">');
							xmlText.push(_input + input);
							xmlText.push("</" + inputType + ">");
						}
						if (comment) {
							xmlText.push("<comment>");
							xmlText.push(comment);
							xmlText.push("</comment>");
						}
						var next = inputs[rule.args.length];
						if (next) {
							//next
							xmlText.push("<next>");
							xmlText.push(next);
							xmlText.push("</next>");
						}
						xmlText.push("</" + blocktext + ">");
						return xmlText.join("");
					};
				})();

				// end mark sfergsvae
			}
			.toString()
			.split("// start mark sfergsvae")[1]
			.split("// end mark sfergsvae")[0];
	}
},
    "夹击激光动画": function () {
    function createCanvas(name, zIndex) {
      if (!name) return;
      var canvas = document.createElement("canvas");
      canvas.id = name;
      canvas.className = "gameCanvas";
      // 将图层插入进游戏内容
      document.getElementById("gameDraw").appendChild(canvas);
      canvas.style.zIndex = zIndex || 0;
      var ctx = canvas.getContext("2d");
      core.canvas[name] = ctx;
      canvas.width = core.__PIXELS__;
      canvas.height = core.__PIXELS__;
      return canvas;
    }

    var bg3Canvas = createCanvas("bg3", 25);
    if (main.mode == "editor") {
      // 与编辑器显伤的神秘联动（（（
      editor.dom.mapEdit.insertBefore(bg3Canvas, core.canvas.event.canvas);
      bg3Canvas.style.zIndex = null;
    }
    core.bigmap.canvas = ["bg", "bg3", "event", "event2", "fg", "damage"];

    core.plugin._betCanvas = "bg3";
    this._drawBetweenAttack = function (x, y, pos, frame) {
      var ctx = core.plugin._betCanvas;
      var w = 32,
        h = 68,
        ix = x * 32,
        iy = y * 32;
      // 左右夹击
      if (pos[0])
        core.drawImage(
          ctx,
          "light.png",
          32 * (frame - 1),
          0,
          32,
          68,
          ix,
          iy - 18,
          w,
          h,
          (90 * Math.PI) / 180
        );
      // 上下夹击
      if (pos[1])
        core.drawImage(
          ctx,
          "light.png",
          32 * (frame - 1),
          0,
          32,
          68,
          ix,
          iy - 18,
          w,
          h
        );
    };

    core.registerAnimationFrame("betweenAttack", true, function (timestamp) {
      if (!flags.betweenAttackData) {
        core.clearMap(
          core.plugin._betCanvas,
          0,
          0,
          core.__PIXELS__,
          core.__PIXELS__
        );
        return;
      }
      var time = core.events._timestamp;
      if (time && timestamp - time < 400) return;

      core.clearMap(
        core.plugin._betCanvas,
        0,
        0,
        core.__PIXELS__,
        core.__PIXELS__
      );
      core.events._timestamp = timestamp;
      var data = flags.betweenAttackData || {};
      flags._frame = flags._frame || 1;
      var frame = flags._frame;

      for (var loc in data) {
        var l = loc.split(",");
        var x = parseInt(l[0]),
          y = parseInt(l[1]);
        core.plugin._drawBetweenAttack(x, y, data[loc], frame);
      }
      flags._frame = frame + 1;
      if (flags._frame > 4) flags._frame = 1;
    });
    var origin_extraDamage = core.control._updateDamage_extraDamage;
    core.control._updateDamage_extraDamage = function (floorId, onMap) {
      flags.betweenAttackData = null;
      if (!flags.useBetweenLight)
        return origin_extraDamage.call(core.control, floorId, onMap);
      else {
        core.status.damage.extraData = [];
        if (!core.flags.displayExtraDamage) return;

        var width = core.floors[floorId].width,
          height = core.floors[floorId].height;
        var startX =
          onMap && core.bigmap.v2
            ? Math.max(0, core.bigmap.posX - core.bigmap.extend)
            : 0;
        var endX =
          onMap && core.bigmap.v2
            ? Math.min(
                width,
                core.bigmap.posX + core.__SIZE__ + core.bigmap.extend + 1
              )
            : width;
        var startY =
          onMap && core.bigmap.v2
            ? Math.max(0, core.bigmap.posY - core.bigmap.extend)
            : 0;
        var endY =
          onMap && core.bigmap.v2
            ? Math.min(
                height,
                core.bigmap.posY + core.__SIZE__ + core.bigmap.extend + 1
              )
            : height;
        const find = function (x, y) {
          return core.status.damage.extraData.find(function (data) {
            return data.x == x && data.y == y;
          });
        };
        for (var x = startX; x < endX; x++) {
          for (var y = startY; y < endY; y++) {
            var alpha = 1;
            if (core.noPass(x, y, floorId)) {
              if (core.flags.extraDamageType == 2) alpha = 0;
              else if (core.flags.extraDamageType == 1) alpha = 0.6;
            }
            var loc = x + "," + y;
            var damage = core.status.checkBlock.damage[loc] || 0;
            var getEnemy = function (x, y) {
              var id = core.getBlockId(x, y, floorId);
              var e = core.material.enemys[id];
              if (main.mode == "editor") e = core.enemys.enemys[id];
              return e;
            };
            if (damage > 0) {
              // 该点伤害
              damage = core.formatBigNumber(damage, true);
              var left = false,
                top = false;
              var e_left = getEnemy(x - 1, y),
                e_right = getEnemy(x + 1, y);
              var e_bottom = getEnemy(x, y - 1),
                e_top = getEnemy(x, y + 1);

              if (
                core.hasSpecial(e_left, 16) &&
                core.hasSpecial(e_right, 16) &&
                e_left.id == e_right.id
              )
                left = true;
              if (
                core.hasSpecial(e_bottom, 16) &&
                core.hasSpecial(e_top, 16) &&
                e_bottom.id == e_top.id
              )
                top = true;
              flags.betweenAttackData = flags.betweenAttackData || {};
              if (flags.betweenAttackData[x + "," + y]) continue;
              var data = [left, top];
              let [px, py] = [32 * x + 16, 32 * (y + 1) - 14];
              if (left || top) {
                px += 15;
                py -= 10;
                flags.betweenAttackData[x + "," + y] = data;
              }
              core.plugin._drawBetweenAttack(x, y, data, 1);

              if (left) {
                if (!find(x - 1, y))
                  core.status.damage.extraData.push({
                    x: x,
                    y: y,
                    text: damage,
                    px: 32 * x + 16,
                    py: 32 * (y + 1) - 14,
                    color: "#ffaa33",
                    alpha: alpha,
                  });
              } else if (top) {
                if (!find(x, y - 1))
                  core.status.damage.extraData.push({
                    x: x,
                    y: y,
                    text: damage,
                    px: 32 * x + 16,
                    py: 32 * (y + 1) - 14,
                    color: "#ffaa33",
                    alpha: alpha,
                  });
              } else {
                core.status.damage.extraData.push({
                  text: damage,
                  px: 32 * x + 16,
                  py: 32 * (y + 1) - 14,
                  color: "#ffaa33",
                  alpha: alpha,
                });
              }
            } else {
              // 检查捕捉
              if (core.status.checkBlock.ambush[x + "," + y]) {
                core.status.damage.extraData.push({
                  text: "!",
                  px: 32 * x + 16,
                  py: 32 * (y + 1) - 14,
                  color: "#ffaa33",
                  alpha: alpha,
                });
              }
            }
          }
        }
      }
    };
  },
    "pop": function () {
	function popMove() {
		// 通过flag检查开关状态（0=开启，1=关闭）
		if (core.getLocalStorage("enablePopMove", true) === false) {
			var ctx = core.getContextByName("popMove");
			if (ctx) core.clearMap(ctx);
			return;
		}
		var ctx = core.getContextByName("popMove");
		if (!ctx) {
			ctx = core.createCanvas("popMove", 0, 0, core.__PIXELS__, core.__PIXELS__, 71);
			core.dymCanvas.popMove.lastScale = core.domStyle.scale;
			core.dymCanvas.popMove.canvas.style.width = core.__PIXELS__ * core.domStyle.scale + "px";
			core.dymCanvas.popMove.canvas.style.height = core.__PIXELS__ * core.domStyle.scale + "px";
		} else {
			var currentScale = core.domStyle.scale;
			if (core.dymCanvas.popMove.lastScale !== currentScale) {
				core.dymCanvas.popMove.canvas.style.width = core.__PIXELS__ * currentScale + "px";
				core.dymCanvas.popMove.canvas.style.height = core.__PIXELS__ * currentScale + "px";
				core.dymCanvas.popMove.lastScale = currentScale;
			}
		}

		core.clearMap(ctx);
		if (core.status.replay.speed <= 3 && !flags.stopPop) {
			var list = core.status.popMove || [];
			var newList = [];
			var segments = 16;

			list.forEach(function (one) {
				one.frame++;
				var dx = one.px2 - one.px;
				var dy = one.py2 - one.py;
				var lx = dx / segments;
				var ly = dy / segments;
				var baseAlpha = 1 - Math.min(one.frame / 30, 1);

				core.setAlpha(ctx, baseAlpha);
				core.strokeCircle("popMove", one.px, one.py, 6, "#E1E1E1", 3);

				for (var i = 0; i < segments; i++) {
					var gradientAlpha = baseAlpha * ((i / segments) * 0.8 + 0.2);
					core.setAlpha(ctx, gradientAlpha);
					core.drawLine(
						"popMove",
						one.px + i * lx,
						one.py + i * ly,
						one.px + (i + 0.5) * lx,
						one.py + (i + 0.5) * ly,
						"#E1E1E1",
						6
					);
				}

				core.setAlpha(ctx, baseAlpha);
				core.strokeCircle(
					"popMove",
					one.px2,
					one.py2,
					6 + (16 * one.frame) / 30,
					"#E1E1E1",
					6 * baseAlpha
				);

				if (one.frame < 30) newList.push(one);
			});

			core.status.popMove = newList;
		}
	}

	if (!main.replayChecking) {
		core.registerAnimationFrame("popMove", true, popMove);
	}

	/**
	 * 添加轨迹动画
	 * @param {number} px  起点x坐标
	 * @param {number} py  起点y坐标
	 * @param {number} px2 终点x坐标
	 * @param {number} py2 终点y坐标
	 * @param {number} [frame=0] 初始帧数
	 */
	this.addPopMove = function (px, py, px2, py2, frame) {
		if (core.getLocalStorage("enablePopMove", true) === false) return;
		if (core.status.replay.speed > 3) return;

		(core.status.popMove || (core.status.popMove = [])).push({
			px: px,
			py: py,
			px2: px2,
			py2: py2,
			frame: frame || 0
		});
	};

	/**
	 * 切换插件状态
	 * @param {boolean} [state] 可选，true强制开启/false强制关闭
	 * @returns {boolean} 当前实际状态
	 */
	this.togglePopMove = function (state) {
		var newState;
		if (typeof state === "boolean") {
			newState = state ? true : false; // true转0(开启)，false转1(关闭)
		} else {
			newState = core.getLocalStorage("enablePopMove", true) === true ? false : true;
		}
		core.setFlag("enablePopMove", newState);

		// 关闭时清理资源
		if (newState === false) {
			if (core.status.popMove) core.status.popMove.length = 0;
			var ctx = core.getContextByName("popMove");
			if (ctx) core.clearMap(ctx);
		}
		return newState === true;
	};

	/**
	 * 获取插件启用状态
	 * @returns {boolean} true=正在运行
	 */
	this.isPopMoveEnabled = function () {
		return core.getLocalStorage("enablePopMove", true) === true;
	};
},
    "帧动画": function () {
	// 在此增加新插件
	// 在此增加新插件
	const animate2 = document.createElement("canvas"); //画布设置
	animate2.style.zIndex = 71;
	animate2.id = "animate2";
	animate2.classList.add("gameCanvas", "anti-aliasing");
	animate2.style.display = "block";
	animate2.width = 416;
	animate2.height = 416;
	animate2.style.width = core.__PIXELS__ * core.domStyle.scale + "px";
	animate2.style.height = core.__PIXELS__ * core.domStyle.scale + "px";
	main.dom.animate2 = animate2;
	const anctx = animate2.getContext("2d");

	main.dom.gameDraw.appendChild(animate2);

	core.plugin.playing = new Set();
	const { Transition, linear, bezier, circle, hyper, trigo, power, inverseTrigo, shake, sleep } = core.plugin.animate;
	const tran = new Transition();
	this.animatemove = function (id, px, py, relative, time, style) {
		if (!id) return
		core.plugin.playing.forEach(v => {
			if (v.id === id) {
				if (v.hero) return
				if (!style) tran.mode(linear())
				else if (style === "in") {
					tran.mode(trigo('sin', "in"))
				} else if (style === "out") {
					tran.mode(trigo('sin', "out"))
				} else if (style === "in-out") {
					tran.mode(trigo('sin', "in-out"))
				} else if (style === "center") {
					tran.mode(trigo('sin', "center"))
				}
				if (relative) { tran.relative() } else { tran.absolute() }
				tran.time(time)
				tran.value[v.id + v.name + "x"] = px
				tran.value[v.id + v.name + "y"] = py

			}
		})
	}
	this.setanimate = function (
		name,
		px,
		py,
		width,
		height,
		allFarme,
		imageList,
		soundList
	) {
		const data = {
			px: px,
			py: py,
			width: width,
			height: height,
			allFarme: allFarme,
			imageList: imageList,
			soundList: soundList,
		};
		core.setFlag("animate_" + name, data);
	};
	this.deleteanimate = function (name) {
		core.setFlag("animate_" + name);
	};
	let thistime = 0;
	this.playanimate = function (name, id, x, y, hero, scalex, scaley, loop, reverse) {
		if (!id) id = setTimeout(null)
		tran.mode(linear()).time(1).absolute()
		if (!hero) tran.value[id + name + "x"] = x
		if (!hero) tran.value[id + name + "y"] = y

		const data = {
			id: id,
			name: name,
			x: x,
			y: y,
			hero: hero,
			scalex: scalex,
			scaley: scaley,
			start: 0,
			pause: false,
			loop: loop,
			reverse: reverse,
			pausetime: 0,
			farme: 0,
			sounds: []
		};

		core.plugin.playing.add(data);
		return id
	};
	this.animateloop = function (id, loop) {
		core.plugin.playing.forEach(v => {
			if (!id || v.id === id) v.loop = loop
		})
	}
	this.animatereverse = function (id, reverse) {
		core.plugin.playing.forEach(v => {
			if (!id || v.id === id) {
				const data = flags["animate_" + v.name]
				if (reverse && !v.reverse) v.start -= (data.allFarme - v.farme * 2) * (1000 / 60)
				if (!reverse && v.reverse) v.start -= (v.farme * 2 - data.allFarme) * (1000 / 60)
				v.reverse = reverse
			}
		})
	}
	this.animatepause = function (id, pause) {
		core.plugin.playing.forEach(v => {
			if (!id || v.id === id) v.pause = pause
		})
	}
	this.animateclear = function (id) {
		core.plugin.playing.forEach(v => {
			if (!id || v.id === id) core.plugin.playing.delete(v)
		})
	}
	core.registerAnimationFrame("animateonmap", true, function (timestamp) {
		let frametime = timestamp - thistime
		thistime = timestamp;


		core.clearMap(anctx);
		core.plugin.playing.forEach((one) => {
			const data = flags["animate_" + one.name];
			if (!data) {
				core.plugin.playing.delete(one);
			} else {
				if (one.start === 0) one.start = thistime
				if (one.pause) one.pausetime += frametime
				one.farme = Math.floor((thistime - one.start - one.pausetime) / (1000 / 60))

				if (one.reverse) one.farme = data.allFarme - one.farme
				if ((!one.reverse && one.farme > data.allFarme) || (one.reverse && one.farme < 0)) {
					if (one.loop) {
						if (one.reverse) {
							one.farme = data.allFarme
							one.start = thistime
							one.pausetime = 0
							one.sounds = []
						} else {
							one.start = thistime
							one.farme = 0
							one.pausetime = 0
							one.sounds = []
						}
					}
				}
				if ((!one.reverse && one.farme > data.allFarme) || (one.reverse && one.farme < 0)) {
					delete tran.value[one.id + one.name + "x"]
					delete tran.value[one.id + one.name + "y"]
					core.plugin.playing.delete(one)

					return
				}

				data.imageList.forEach(function (image) {
					if (
						one.farme >= (image.beforefarme ?? 0) &&
						one.farme <= (image.afterfarme ?? data.allFarme)
					) {

						const img = core.material.images.images?.[image.image];
						if (img) {
							const gla = image.globalAlpha ?? 100;
							const agla = image.aglobalAlpha ?? gla,
								beforefarme = image.beforefarme ?? 0;
							const afterfarme = image.afterfarme ?? data.allFarme;

							anctx.globalAlpha =
								(gla +
									((agla - gla) * (one.farme - beforefarme)) /
									(afterfarme - beforefarme || 1)) /
								100;

							const cx =
								(image.cx ?? 0) +
								(((image.acx ?? 0) - (image.cx ?? 0)) *
									(one.farme - beforefarme)) /
								(afterfarme - beforefarme || 1),
								cy =
								(image.cy ?? 0) +
								(((image.acy ?? 0) - (image.cy ?? 0)) *
									(one.farme - beforefarme)) /
								(afterfarme - beforefarme || 1),
								cw =
								(image.cw ?? img.width) +
								(((image.acw ?? img.width) - (image.cw ?? img.width)) *
									(one.farme - beforefarme)) /
								(afterfarme - beforefarme || 1),
								ch =
								(image.ch ?? img.height) +
								(((image.acw ?? img.height) - (image.cw ?? img.height)) *
									(one.farme - beforefarme)) /
								(afterfarme - beforefarme || 1),
								x =
								(image.x ?? 0) +
								(((image.ax ?? 0) - (image.x ?? 0)) *
									(one.farme - beforefarme)) /
								(afterfarme - beforefarme || 1),
								y =
								(image.y ?? 0) +
								(((image.ay ?? 0) - (image.y ?? 0)) *
									(one.farme - beforefarme)) /
								(afterfarme - beforefarme || 1),
								w =
								(image.w ?? img.width) +
								(((image.aw ?? img.width) - (image.w ?? img.width)) *
									(one.farme - beforefarme)) /
								(afterfarme - beforefarme || 1),
								h =
								(image.h ?? img.height) +
								(((image.aw ?? img.height) - (image.w ?? img.height)) *
									(one.farme - beforefarme)) /
								(afterfarme - beforefarme || 1),
								angle =
								(Math.PI *
									((image.angle ?? 0) +
										(((image.aangle ?? 0) - (image.angle ?? 0)) *
											(one.farme - beforefarme)) /
										(afterfarme - beforefarme || 1))) /
								180;

							if (one.hero) {
								let sx, sy;
								if (core.status.heroMoving < 0) {
									sx = 0;
									sy = 0;
								} else {
									sx =
										core.utils.scan[core.status.hero.loc.direction].x *
										4 *
										core.status.heroMoving;
									sy =
										core.utils.scan[core.status.hero.loc.direction].y *
										4 *
										core.status.heroMoving;
								}
								const herox = core.status.hero.loc.x * 32 + 16 + sx;
								const heroy = core.status.hero.loc.y * 32 + 16 + sy;
								core.drawImage(
									anctx,
									img,
									cx,
									cy,
									cw,
									ch,
									herox + (x - data.px) * one.scalex,
									heroy + (y - data.py) * one.scaley,
									w * one.scalex,
									h * one.scaley,
									angle
								);


							} else {

								core.drawImage(
									anctx,
									img,
									cx,
									cy,
									cw,
									ch,
									tran.value[one.id + one.name + "x"] + (x - data.px) * one.scalex,
									tran.value[one.id + one.name + "y"] + (y - data.py) * one.scaley,
									w * one.scalex,
									h * one.scaley,
									angle
								);
							}
						}
					}
				});
				data.soundList.forEach(function (sound) {
					const lisen =
						sound.sound &&
						core.material.sounds[sound.sound] &&
						core.musicStatus.soundStatus;
					if (one.farme == sound.startfarme && lisen && one.sounds.includes(one.farme)) {
						if (sound.stopbefore) core.stopSound();
						core.playSound(sound.sound);
						one.sounds.push(one.farme)
					}
				});

			}
		});

	});
},
    "移动事件": function () {
	maps.prototype.moveBlock = function (x, y, steps, time, keep, callback) {
		if (core.status.replay.speed == 24) time = 1;
		time = time || 500;
		var blockArr = this._getAndRemoveBlock(x, y);
		if (blockArr == null) {
			if (callback) callback();
			return;
		}
		var block = blockArr[0],
			blockInfo = blockArr[1];

		// 支持 wait 指令
		var moveSteps = (steps || []).map(function (t) {
			var parts = t.split(':');
			return [parts[0], parseInt(parts[1] || "0")];
		}).filter(function (t) {
			var valid = ['up', 'down', 'left', 'right', 'forward', 'backward',
				'leftup', 'leftdown', 'rightup', 'rightdown', 'speed', 'wait'
			];
			return valid.includes(t[0]) &&
				!(t[0] === 'speed' && t[1] < 16) &&
				!(t[0] === 'wait' && t[1] <= 0);
		});

		var canvases = this._initDetachedBlock(blockInfo, x, y, block.event.animate !== false);
		this._moveDetachedBlock(blockInfo, 32 * x, 32 * y, 1, canvases);

		var moveInfo = {
			sx: x,
			sy: y,
			x: x,
			y: y,
			px: 32 * x,
			py: 32 * y,
			opacity: 1,
			keep: keep,
			lastDirection: null,
			offset: 1,
			moveSteps: moveSteps,
			step: 0,
			per_time: time / 16 / (core.status.replay.speed || 1),
			isWaiting: false, // 等待状态
			waitStart: 0 // 等待开始时间戳
		};
		this._moveBlock_doMove(blockInfo, canvases, moveInfo, callback);
	}

	maps.prototype._moveBlock_doMove = function (blockInfo, canvases, moveInfo, callback) {
		var animateTotal = blockInfo.animate,
			animateTime = 0;
		if (!blockInfo.doorInfo && !blockInfo.bigImage && blockInfo.cls == 'npc48') animateTotal = 4;

		var _run = function () {
			var cb = function () {
				core.maps._deleteDetachedBlock(canvases);
				if (moveInfo.keep) {
					core.setBlock(blockInfo.number, moveInfo.x, moveInfo.y);
					core.showBlock(moveInfo.x, moveInfo.y);
					core.moveEnemyOnPoint(moveInfo.sx, moveInfo.sy, moveInfo.x, moveInfo.y);
				}
				if (callback) callback();
			};

			var animate = window.setInterval(function () {
				// 关键修改点：无论是否等待都更新动画帧
				if (blockInfo.cls != 'tileset') {
					animateTime += moveInfo.per_time;
					if (animateTime > core.values.animateSpeed) {
						animateTime = 0;
						blockInfo.posX = (blockInfo.posX + 1) % animateTotal;
					}
				}

				// 处理等待状态
				if (moveInfo.isWaiting) {
					if (Date.now() - moveInfo.waitStart >= moveInfo.currentWaitTime) {
						moveInfo.isWaiting = false;
					} else {
						// 保持渲染当前位置（动画持续）
						core.maps._moveDetachedBlock(blockInfo, moveInfo.px, moveInfo.py, moveInfo.opacity, canvases);
						return;
					}
				}

				if (moveInfo.moveSteps.length > 0) {
					// 处理 wait 指令
					if (moveInfo.moveSteps[0][0] === 'wait') {
						moveInfo.isWaiting = true;
						moveInfo.waitStart = Date.now();
						moveInfo.currentWaitTime = moveInfo.moveSteps[0][1];
						moveInfo.moveSteps.shift();
						return;
					}

					if (core.maps._moveBlock_updateSpeed(moveInfo)) {
						clearInterval(animate);
						delete core.animateFrame.asyncId[animate];
						_run();
					} else {
						core.maps._moveBlock_moving(blockInfo, canvases, moveInfo);
					}
				} else {
					core.maps._moveJumpBlock_finished(blockInfo, canvases, moveInfo, animate, cb);
				}
			}, moveInfo.per_time);

			core.animateFrame.lastAsyncId = animate;
			core.animateFrame.asyncId[animate] = cb;
		};
		_run();
	};

	maps.prototype._moveBlock_moving = function (blockInfo, canvases, moveInfo) {
		if (moveInfo.isWaiting) return; // 等待时只更新动画，不移动

		if (moveInfo.step == 0) {
			if (!this._moveBlock_updateDirection(blockInfo, moveInfo)) return;
		}
		var curr = moveInfo.moveSteps[0];
		moveInfo.step++;
		moveInfo.px += core.utils.scan2[curr[0]].x * 2 * moveInfo.offset;
		moveInfo.py += core.utils.scan2[curr[0]].y * 2 * moveInfo.offset;
		this._moveDetachedBlock(blockInfo, moveInfo.px, moveInfo.py, moveInfo.opacity, canvases);
		if (moveInfo.step == 16) {
			moveInfo.step = 0;
			moveInfo.moveSteps[0][1]--;
			if (moveInfo.moveSteps[0][1] <= 0) {
				moveInfo.moveSteps.shift();
			}
		}
	};
},
    "动画": function () {

	// 在此增加新插件
	const { Transition, linear, bezier, circle, hyper, trigo, power, inverseTrigo, shake, sleep } = core.plugin.animate;
	//////移动动画//////
	const tran = new Transition();
	maps.prototype.moveAnimate = function (id, px, py, relative, time, style) {
		if (!id) return
		core.status.animateObjs.forEach(v => {
			if (v.id === id) {
				if (v.hero) return
				if (!style) tran.mode(linear())
				else if (style === "in") {
					tran.mode(trigo('sin', "in"))
				} else if (style === "out") {
					tran.mode(trigo('sin', "out"))
				} else if (style === "in-out") {
					tran.mode(trigo('sin', "in-out"))
				} else if (style === "center") {
					tran.mode(trigo('sin', "center"))
				}
				if (relative) { tran.relative() } else { tran.absolute() }
				tran.time(time)
				tran.value[v.id + v.name + "x"] = px
				tran.value[v.id + v.name + "y"] = py

			}
		})
	}

	control.prototype._animationFrame_animate = function (timestamp) {
		let frametime = timestamp - core.animateFrame.animateTime
		core.animateFrame.animateTime = timestamp;
		if (!core.status.animateObjs || core.status.animateObjs.length == 0) return;

		core.clearMap('animate');
		// 更新帧
		for (var i = 0; i < core.status.animateObjs.length; i++) {
			var obj = core.status.animateObjs[i];
			if (obj.pause) obj.pausetime += frametime

			if (obj.start === 0) {
				obj.sounds = []
				obj.start = core.animateFrame.animateTime
			}

			obj.index = Math.floor((core.animateFrame.animateTime - obj.start - obj.pausetime) / (1000 / (core.data.flags["60FPS"] ? 60 : 20)))


			if (obj.reverse) obj.index = obj.animate.frames.length - obj.index
			if ((!obj.reverse && obj.index >= obj.animate.frames.length) || (obj.reverse && obj.index <= 0)) {
				if (obj.loop) {
					if (obj.reverse) {
						obj.index = obj.animate.frames.length
						obj.start = core.animateFrame.animateTime
						obj.sounds = []
						obj.pausetime = 0
					} else {
						obj.start = core.animateFrame.animateTime
						obj.sounds = []
						obj.index = 0
						obj.pausetime = 0
					}
				} else
					(function (callback) {
						setTimeout(function () {
							if (callback) callback();
						});
					})(obj.callback);
			}
		}
		core.status.animateObjs = core.status.animateObjs.filter(function (obj) {
			return (!obj.reverse && obj.index < obj.animate.frames.length) || (obj.reverse && obj.index > 0);
		});
		let sx, sy;
		if (core.status.heroMoving < 0) {
			sx = 0;
			sy = 0;
		} else {
			sx =
				core.utils.scan[core.status.hero.loc.direction].x *
				4 *
				core.status.heroMoving;
			sy =
				core.utils.scan[core.status.hero.loc.direction].y *
				4 *
				core.status.heroMoving;
		}
		const herox = core.status.hero.loc.x * 32 + 16 + sx;
		const heroy = core.status.hero.loc.y * 32 + 32 + sy - core.material.icons.hero.height / 2;

		core.status.animateObjs.forEach(function (obj) {
			if (obj.hero) {

				core.maps._drawAnimateFrame('animate', obj.animate, herox, heroy, obj.index, obj.sounds);
			} else {

				core.maps._drawAnimateFrame('animate', obj.animate, tran.value[obj.id + obj.name + "x"], tran.value[obj.id + obj.name + "y"], obj.index, obj.sounds);
			}
		});
	}
	core.registerAnimationFrame("animate", true, core.control._animationFrame_animate);

	////// 绘制动画 //////
	maps.prototype.drawAnimate = function (name, x, y, alignWindow, callback) {
		name = core.getMappedName(name);

		// 正在播放录像：不显示动画
		if (core.isReplaying() || !core.material.animates[name] || x == null || y == null) {
			if (callback) callback();
			return -1;
		}

		// 开始绘制
		var animate = core.material.animates[name],
			centerX = 32 * x + 16,
			centerY = 32 * y + 16;
		if (alignWindow) {
			centerX += core.bigmap.offsetX;
			centerY += core.bigmap.offsetY;
		}
		var id = setTimeout(null);
		animate.se = animate.se || {};
		if (typeof animate.se == 'string') animate.se = { 1: animate.se };
		tran.mode(linear()).time(1).absolute()
		tran.value[id + name + "x"] = centerX
		tran.value[id + name + "y"] = centerY
		core.status.animateObjs.push({
			"name": name,
			"id": id,
			"animate": animate,
			"centerX": centerX,
			"centerY": centerY,
			"start": 0,
			"pause": false,
			"pausetime": 0,
			"index": 0,
			"callback": callback
		});

		return id;
	}

	////// 绘制反转动画 //////
	maps.prototype.drawResizeAnimate = function (name, id, centerX, centerY, hero, reverse, loop, callback) {
		name = core.getMappedName(name);

		// 正在播放录像：不显示动画
		if (core.isReplaying() || !core.material.animates[name]) {
			if (callback) callback();
			return -1;
		}

		// 开始绘制
		var animate = core.material.animates[name],
			centerX = core.calValue(centerX)
		centerY = core.calValue(centerY)

		animate.se = animate.se || {};
		if (typeof animate.se == 'string') animate.se = { 1: animate.se };

		var id = id || setTimeout(null);
		tran.mode(linear()).time(1).absolute()
		if (!hero) tran.value[id + name + "x"] = centerX
		if (!hero) tran.value[id + name + "y"] = centerY
		if (hero) core.status.animateObjs.push({
			"name": name,
			"id": id,
			"animate": animate,
			"hero": true,
			"reverse": reverse,
			"start": 0,
			"pause": false,
			"loop": loop,
			"pausetime": 0,
			"index": 0,
			"callback": callback
		})
		else core.status.animateObjs.push({
			"name": name,
			"id": id,
			"animate": animate,
			"centerX": centerX,
			"centerY": centerY,
			"reverse": reverse,
			"start": 0,
			"pause": false,
			"loop": loop,
			"pausetime": 0,
			"index": 0,
			"callback": callback
		});

		return id;
	}
	events.prototype._action_animateResize = function (data, x, y, prefix) {
		core.events.__action_doAsyncFunc(data.async, core.maps.drawResizeAnimate, data.name, data.id, data.centerX, data.centerY, data.hero, data.reverse, data.loop);
	};
	////// 绘制一个跟随勇士的动画 //////
	maps.prototype.drawHeroAnimate = function (name, callback) {
		name = core.getMappedName(name);

		// 正在播放录像或动画不存在：不显示动画
		if (core.isReplaying() || !core.material.animates[name]) {
			if (callback) callback();
			return -1;
		}

		// 开始绘制
		var animate = core.material.animates[name];
		animate.se = animate.se || {};
		if (typeof animate.se == 'string') animate.se = { 1: animate.se };

		var id = setTimeout(null);
		core.status.animateObjs.push({
			"name": name,
			"id": id,
			"animate": animate,
			"hero": true,
			"start": 0,
			"pause": false,
			"pausetime": 0,
			"index": 0,
			"callback": callback
		});

		return id;
	}

	////// 获得当前正在播放的所有（指定）动画的id列表 //////
	maps.prototype.getPlayingAnimates = function (name) {
		return (core.status.animateObjs || []).filter(function (one) {
			return name == null || one.name == name;
		}).map(function (one) { return one.id });
	}


	////// 绘制动画的某一帧 //////
	maps.prototype._drawAnimateFrame = function (name, animate, centerX, centerY, index, sounds) {
		var ctx = core.getContextByName(name);
		if (!ctx) return;
		var frame = animate.frames[index % animate.frame];
		if (!sounds.includes(index)) {
			core.playSound((animate.se || {})[index % animate.frame + 1], (animate.pitch || {})[index % animate.frame + 1]);
			sounds.push(index)
		}
		var ratio = animate.ratio;
		frame.forEach(function (t) {
			var image = animate.images[t.index];
			if (!image) return;

			var realWidth = image.width * ratio * t.zoom / 100;
			var realHeight = image.height * ratio * t.zoom / 100;
			core.setAlpha(ctx, t.opacity / 255);

			var cx = centerX + t.x,
				cy = centerY + t.y;

			var ix = cx - realWidth / 2 - core.bigmap.offsetX,
				iy = cy - realHeight / 2 - core.bigmap.offsetY;

			var mirror = t.mirror ? 'x' : null;
			var angle = t.angle ? -t.angle * Math.PI / 180 : null;
			core.drawImage(ctx, image, ix, iy, realWidth, realHeight, null, null, null, null, angle, mirror);

			core.setAlpha(ctx, 1);
		})
	}
	////// 暂停动画 //////
	maps.prototype.pauseAnimate = function (id) {
		for (var i = 0; i < core.status.animateObjs.length; i++) {
			var obj = core.status.animateObjs[i];
			if (id == null || obj.id == id) {
				obj.pause = true

			}
		}

	}
	////// 继续动画 //////
	maps.prototype.remuseAnimate = function (id) {
		for (var i = 0; i < core.status.animateObjs.length; i++) {
			var obj = core.status.animateObjs[i];
			if (id == null || obj.id == id) {
				obj.pause = false
			}

		}

	}
	////// 停止动画 //////
	maps.prototype.stopAnimate = function (id, doCallback) {
		for (var i = 0; i < core.status.animateObjs.length; i++) {
			var obj = core.status.animateObjs[i];
			if (id == null || obj.id == id) {
				if (doCallback) {
					(function (callback) {
						setTimeout(function () {
							if (callback) callback();
						});
					})(obj.callback);
				}
			}
		}
		core.status.animateObjs = core.status.animateObjs.filter(function (x) { return id != null && x.id != id });
		if (core.status.animateObjs.length == 0)
			core.clearMap('animate');
	}
},
    "武器实例": undefined,
    "背包旧版": undefined,
    "武器系统": function () {
	// 武器系统只管理“武器是什么、如何旋转、如何计算属性与联动”。
	// 它不读取背包存档、不创建界面，也不决定武器能否放进某个背包格。

	/**
	 * 深拷贝武器配置，防止调用方修改返回值时污染原始道具表。
	 * @param {*} sourceData 需要复制的数据。
	 * @returns {*} 与输入内容相同、引用独立的副本。
	 */
	const cloneWeaponData = function (sourceData) {
		if (sourceData == null) return sourceData;
		if (core.clone) return core.clone(sourceData);
		return JSON.parse(JSON.stringify(sourceData));
	};

	// 武器属性表来自“新建 XLSX 工作表.xlsx”。
	// 字段说明：sourceName=正式名称，attack=平均攻击向上取整，rarity=稀有度，
	// weaponTypes=武器类型，synergyText=联动说明，synergyRules=可执行联动规则。
	const WEAPON_METADATA = {
		"I372": { sourceName: "薛定谔", attack: 5, rarity: 4, weaponTypes: ["刀"], synergyText: "右上两格和左下两格内剑和刀命中时，自身高扬+1" },
		"I384": { sourceName: "炎威之翼镰", attack: 13, rarity: 4, weaponTypes: ["斧"] },
		"I386": { sourceName: "呪蚀之骸枪", attack: 15, rarity: 4, weaponTypes: ["枪"], synergyText: "战斗开始时，两侧每有一个物品，敌人虚脱+1" },
		"I387": { sourceName: "科罗萨斯之拳·玛格纳", attack: 2, rarity: 3, weaponTypes: ["拳"] },
		"I388": { sourceName: "塞勒斯特之镰·玛格纳", attack: 8, rarity: 3, weaponTypes: ["斧"] },
		"I389": { sourceName: "暗黑被提·拟像", attack: 19, rarity: 5, weaponTypes: ["精灵"] },
		"I390": { sourceName: "安心与信赖的红盒护身符", attack: 6, rarity: 5, weaponTypes: ["枪"] },
		"I391": { sourceName: "大红", attack: 0, rarity: 2, weaponTypes: ["饮料"], synergyText: "触发时5秒内所有武器攻击+2，并立即触发上方饮料" },
		"I393": { sourceName: "海鳗", attack: 16, rarity: 4, weaponTypes: ["斧", "食物"], synergyText: "周围每有一个食物，自身间隔-10%" },
		"I394": { sourceName: "祈愿滚箱的金盒护身符", attack: 3, rarity: 3, weaponTypes: ["枪"] },
		"I395": { sourceName: "方天画戟", attack: 4, rarity: 5, weaponTypes: ["拳"] },
		"I396": { sourceName: "劫风之翼锐", attack: 5, rarity: 4, weaponTypes: ["短"], synergyText: "每攻击5次，自身和上下方武器间隔-10%" },
		"I397": { sourceName: "远走高飞", attack: 8, rarity: 4, weaponTypes: ["斧", "吉他"], synergyText: "上方三角和下方三角内存在吉他时触发联动" },
		"I398": { sourceName: "提亚玛特弩枪·玛格纳", attack: 13, rarity: 3, weaponTypes: ["铳"] },
		"I399": { sourceName: "穿心枪盖尔伯格", attack: 13, rarity: 5, weaponTypes: ["枪"], synergyText: "上方三角和下方三角内每个物品使本武器增伤触发概率+20%" },
		"I400": { sourceName: "修瓦利耶之剑·玛格纳", attack: 5, rarity: 3, weaponTypes: ["剑"] },
		"I401": { sourceName: "威光之逆鳞", attack: 4, rarity: 4, weaponTypes: ["拳"] },
		"I402": {
			sourceName: "圣诞炒锅", attack: 5, rarity: 3, weaponTypes: ["剑"],
			synergyText: "周围每连接一个食物，自身攻击+1；连接的食物间隔-10%",
			synergyRules: [{
				id: "linkedFoodBoostsPan",
				trigger: "layout",
				conditions: [{
					id: "linkedFoods", kind: "nearby", relation: "orthogonal",
					directions: ["up", "down", "left", "right"], distance: 1,
					filter: { weaponTypes: ["食物"] }, min: 1
				}],
				effects: [{
					target: "self", stat: "attack", operation: "add", value: 1,
					perMatch: true, conditionId: "linkedFoods"
				}]
			}]
		},
		"I403": { sourceName: "Flying A", attack: 8, rarity: 4, weaponTypes: ["枪", "吉他"], synergyText: "上方三角和下方三角内存在吉他时触发联动" },
		"I404": { sourceName: "残暴之血", attack: 8, rarity: 4, weaponTypes: ["斧", "吉他"], synergyText: "上方三角和下方三角内存在吉他时触发联动" },
		"I405": { sourceName: "月丘", attack: 0, rarity: 4, weaponTypes: ["盾"], synergyText: "左右盾发动时，自身防御+1" },
		"I406": { sourceName: "金刚晶", attack: 0, rarity: 5, weaponTypes: ["道具"] },
		"I407": { sourceName: "金色史莱姆铃铛", attack: 9, rarity: 5, weaponTypes: ["乐器"], synergyText: "左右武器每攻击3次，自身恢复生命并强化" },
		"I408": { sourceName: "迷你威尔纳斯", attack: 14, rarity: 4, weaponTypes: ["精灵"], synergyText: "战斗开始时，周围每有一把武器或精灵，使敌人烧伤+2" },
		"I409": { sourceName: "迷你欧罗巴", attack: 11, rarity: 3, weaponTypes: ["精灵"], synergyText: "战斗开始时，周围每有一把武器和精灵，使敌人冰洁+1" },
		"I410": { sourceName: "利维坦凝视·玛格纳", attack: 3, rarity: 3, weaponTypes: ["短"] },
		"I411": {
			sourceName: "神尽克尽·无量慈悲", attack: 7, rarity: 5, weaponTypes: ["短"],
			synergyText: "敌方每3层烧伤，上下物品攻击+2",
			synergyRules: [{
				id: "burnBoostsVerticalItems",
				trigger: "battleState",
				conditions: [
					{ id: "burnStacks", kind: "context", path: "enemy.burn", operator: "gte", value: 3 },
					{
						id: "verticalItems", kind: "nearby", relation: "orthogonal",
						directions: ["up", "down"], distance: 1,
						filter: { hasAttack: true }, min: 1
					}
				],
				effects: [{
					target: "matches", conditionId: "verticalItems",
					stat: "attack", operation: "add", value: 2,
					stacksFrom: { kind: "contextFloor", path: "enemy.burn", divisor: 3 }
				}]
			}]
		},
		"I412": {
			sourceName: "雅雅的炒饭", attack: 12, rarity: 4, weaponTypes: ["剑", "食物"],
			synergyText: "右侧4×4区域每有一个食物，自身攻击+3",
			synergyRules: [{
				id: "rightFoodBoostsMeal",
				trigger: "layout",
				conditions: [{
					id: "rightFoods", kind: "nearby", relation: "sideBox",
					directions: ["right"], distance: 4, span: 4,
					filter: { weaponTypes: ["食物"] }, min: 1
				}],
				effects: [{
					target: "self", stat: "attack", operation: "add", value: 3,
					perMatch: true, conditionId: "rightFoods"
				}]
			}]
		},
		"I413": { sourceName: "红色帝王蟹", attack: 11, rarity: 4, weaponTypes: ["剑", "食物"], synergyText: "周围每有2个食物，自身攻击次数+1" },
		"I414": { sourceName: "七星剑", attack: 3, rarity: 3, weaponTypes: ["剑"] },
		"I415": { sourceName: "亵渎的魔弹", attack: 37, rarity: 5, weaponTypes: ["铳"], synergyText: "周围盾发动时，本武器攻击+2、间隔-10%" },
		"I416": {
			sourceName: "雷神之锤", attack: 45, rarity: 5, weaponTypes: ["斧"],
			synergyText: "周围每个物品使本武器攻击+5、间隔-10%（间隔最多-50%）",
			synergyRules: [{
				id: "nearbyItemsBoostHammer",
				trigger: "layout",
				conditions: [{
					id: "nearbyItems", kind: "nearby", relation: "orthogonal",
					directions: ["up", "down", "left", "right"], distance: 1, min: 1
				}],
				effects: [{
					target: "self", stat: "attack", operation: "add", value: 5,
					perMatch: true, conditionId: "nearbyItems"
				}]
			}]
		},
		"I417": { sourceName: "赫拉克勒斯", attack: 9, rarity: 5, weaponTypes: ["弓"], synergyText: "战斗开始时，上下武器攻击次数+1" },
		"I418": { sourceName: "佐西莫斯", attack: 20, rarity: 5, weaponTypes: ["杖"], synergyText: "周围武器和精灵每命中3次，自身暗刻印+1；暗刻印每10层使所有精灵攻击+5" },
		"I419": { sourceName: "寒冰骑士", attack: 6, rarity: 4, weaponTypes: ["短"] },
		"I420": { sourceName: "水祸之丽伞", attack: 11, rarity: 4, weaponTypes: ["斧"] },
		"I421": { sourceName: "天羽羽斩", attack: 8, rarity: 5, weaponTypes: ["刀"], synergyText: "周围每把刀使九连击概率+10%" },
		"I422": { sourceName: "真龙之盾", attack: 0, rarity: 3, weaponTypes: ["盾"] },
		"I423": {
			sourceName: "巖迫之躯杖", attack: 9, rarity: 4, weaponTypes: ["杖"],
			synergyText: "同名武器达到3把时，自身攻击+5",
			synergyRules: [{
				id: "threeEarthStaves",
				trigger: "layout",
				conditions: [{
					id: "sameStaves", kind: "count", filter: { itemIds: ["I423"] },
					includeSelf: true, min: 3
				}],
				effects: [{ target: "self", stat: "attack", operation: "add", value: 5 }]
			}]
		},
		"I424": { sourceName: "世界树的晶剑·玛格纳", attack: 4, rarity: 3, weaponTypes: ["剑"] },
		"I425": {
			sourceName: "神意之盾", attack: 0, rarity: 5, weaponTypes: ["盾"],
			synergyText: "左右武器间隔-20%、攻击+3；左右武器攻击时自身防御+2",
			synergyRules: [{
				id: "shieldBoostsSideWeapons",
				trigger: "layout",
				conditions: [{
					id: "sideWeapons", kind: "nearby", relation: "orthogonal",
					directions: ["left", "right"], distance: 1,
					filter: { hasAttack: true }, min: 1
				}],
				effects: [{
					target: "matches", conditionId: "sideWeapons",
					stat: "attack", operation: "add", value: 3
				}]
			}]
		},
		"I426": { sourceName: "银色史莱姆铃铛", attack: 4, rarity: 3, weaponTypes: ["乐器"], synergyText: "左右武器每攻击4次，自身恢复生命并强化" },
		// 炸虾在工作表中没有对应行，因此不猜测其数值与稀有度。
		"I428": { sourceName: "七星剑·煌", attack: 6, rarity: 4, weaponTypes: ["剑"] }
	};

	/** 将表格属性合并进道具表，使地图拾取和背包读取同一份武器数据。 */
	const applyWeaponMetadata = function () {
		Object.keys(WEAPON_METADATA).forEach(function (itemId) {
			const itemDefinition = core.material.items[itemId];
			if (!itemDefinition || !itemDefinition.backpackWeapon) return;
			Object.assign(itemDefinition.backpackWeapon, cloneWeaponData(WEAPON_METADATA[itemId]));
		});
	};

	/**
	 * 合并某个地图道具的形状配置与武器属性配置。
	 * @param {string} itemId 地图道具 ID。
	 * @param {object} weaponDefinition items.js 中的 backpackWeapon 配置。
	 * @returns {object} 可安全修改的完整武器定义。
	 */
	const mergeWeaponMetadata = function (itemId, weaponDefinition) {
		return Object.assign(
			{},
			cloneWeaponData(weaponDefinition || {}),
			cloneWeaponData(WEAPON_METADATA[itemId] || {})
		);
	};

	/** 把任意角度吸附为 0/90/180/270 四种背包旋转角。 */
	const normalizeWeaponRotation = function (rotation) {
		rotation = Number(rotation) || 0;
		rotation = Math.round(rotation / 90) * 90;
		return ((rotation % 360) + 360) % 360;
	};

	/** 去重并平移格子坐标，让武器左上角始终从 [0,0] 开始。 */
	const normalizeWeaponCells = function (sourceCells) {
		if (!Array.isArray(sourceCells)) return [];
		const normalizedCells = [];
		const usedCellKeys = {};
		sourceCells.forEach(function (sourceCell) {
			if (!Array.isArray(sourceCell) || sourceCell.length < 2) return;
			const cellX = Math.floor(Number(sourceCell[0]));
			const cellY = Math.floor(Number(sourceCell[1]));
			if (!Number.isFinite(cellX) || !Number.isFinite(cellY)) return;
			const key = cellX + "," + cellY;
			if (usedCellKeys[key]) return;
			usedCellKeys[key] = true;
			normalizedCells.push([cellX, cellY]);
		});
		if (!normalizedCells.length) return [];
		const minimumX = Math.min.apply(null, normalizedCells.map(function (cell) { return cell[0]; }));
		const minimumY = Math.min.apply(null, normalizedCells.map(function (cell) { return cell[1]; }));
		return normalizedCells
			.map(function (cell) { return [cell[0] - minimumX, cell[1] - minimumY]; })
			.sort(function (leftCell, rightCell) {
				return leftCell[1] - rightCell[1] || leftCell[0] - rightCell[0];
			});
	};

	/** 把 items.js 中的二维 0/1 形状矩阵转换为坐标数组。 */
	const weaponMatrixToCells = function (shapeMatrix) {
		if (!Array.isArray(shapeMatrix)) return [];
		const occupiedCells = [];
		shapeMatrix.forEach(function (matrixRow, rowIndex) {
			if (!Array.isArray(matrixRow)) return;
			matrixRow.forEach(function (isOccupied, columnIndex) {
				if (isOccupied) occupiedCells.push([columnIndex, rowIndex]);
			});
		});
		return occupiedCells;
	};

	/** 校验并统一武器定义，供新实例、旧存档和外部 API 共用。 */
	const normalizeWeaponDefinition = function (sourceWeapon) {
		if (!sourceWeapon || typeof sourceWeapon !== "object") return null;
		const occupiedCells = normalizeWeaponCells(
			Array.isArray(sourceWeapon.cells)
				? sourceWeapon.cells
				: weaponMatrixToCells(sourceWeapon.shape || sourceWeapon.size)
		);
		if (!occupiedCells.length) return null;
		const normalizedWeapon = {
			id: sourceWeapon.id == null ? "weapon_" + Date.now().toString(36) : String(sourceWeapon.id),
			name: String(sourceWeapon.name || "未命名物品"),
			image: String(sourceWeapon.image || ""),
			cells: occupiedCells
		};
		[
			"rarity", "attack", "defense", "attackSpeed", "critRate",
			"description", "sourceItemId", "sourceName", "uniqueKey", "imageCrop",
			"weaponTypes", "synergyText", "synergyRules"
		].forEach(function (optionalPropertyName) {
			if (sourceWeapon[optionalPropertyName] != null) {
				normalizedWeapon[optionalPropertyName] = cloneWeaponData(sourceWeapon[optionalPropertyName]);
			}
		});
		return normalizedWeapon;
	};

	/** 根据指定旋转角返回武器实际占用的相对格子。 */
	const getRotatedWeaponCells = function (weaponDefinition, rotation) {
		let rotatedCells = normalizeWeaponCells(weaponDefinition.cells);
		const clockwiseQuarterTurns = normalizeWeaponRotation(rotation) / 90;
		for (let turnIndex = 0; turnIndex < clockwiseQuarterTurns; turnIndex++) {
			const maximumY = Math.max.apply(null, rotatedCells.map(function (cell) { return cell[1]; }));
			rotatedCells = normalizeWeaponCells(rotatedCells.map(function (cell) {
				return [maximumY - cell[1], cell[0]];
			}));
		}
		return rotatedCells;
	};

	/** 返回旋转后武器的占用格、宽度和高度。 */
	const getWeaponBounds = function (weaponDefinition, rotation) {
		const occupiedCells = getRotatedWeaponCells(weaponDefinition, rotation);
		return {
			cells: occupiedCells,
			cols: Math.max.apply(null, occupiedCells.map(function (cell) { return cell[0]; })) + 1,
			rows: Math.max.apply(null, occupiedCells.map(function (cell) { return cell[1]; })) + 1
		};
	};

	/** 把实例的相对形状换算成背包中的绝对格子坐标。 */
	const getOccupiedWeaponCells = function (weaponEntry, column, row, rotation) {
		return getRotatedWeaponCells(
			weaponEntry.weapon,
			rotation == null ? weaponEntry.rotation : rotation
		).map(function (relativeCell) {
			return [
				(column == null ? weaponEntry.col : column) + relativeCell[0],
				(row == null ? weaponEntry.row : row) + relativeCell[1]
			];
		});
	};

	/** 返回实例的武器类型数组；缺失时返回空数组。 */
	const getWeaponTypes = function (weaponEntry) {
		return Array.isArray(weaponEntry.weapon.weaponTypes)
			? weaponEntry.weapon.weaponTypes.map(String)
			: [];
	};

	/** 判断一个实例是否满足联动规则中的 ID、类型或攻击条件。 */
	const matchesWeaponFilter = function (weaponEntry, weaponFilter) {
		weaponFilter = weaponFilter || {};
		if (Array.isArray(weaponFilter.itemIds)
			&& weaponFilter.itemIds.indexOf(weaponEntry.weapon.sourceItemId) < 0) return false;
		if (Array.isArray(weaponFilter.weaponIds)
			&& weaponFilter.weaponIds.indexOf(weaponEntry.weapon.id) < 0) return false;
		if (Array.isArray(weaponFilter.weaponTypes)) {
			const entryWeaponTypes = getWeaponTypes(weaponEntry);
			if (!weaponFilter.weaponTypes.some(function (type) {
				return entryWeaponTypes.indexOf(type) >= 0;
			})) return false;
		}
		if (weaponFilter.hasAttack === true && !(Number(weaponEntry.weapon.attack) > 0)) return false;
		if (weaponFilter.hasAttack === false && Number(weaponEntry.weapon.attack) > 0) return false;
		return true;
	};

	/** 判断两个格子的位移是否落在指定方向和距离内。 */
	const matchesDirection = function (deltaX, deltaY, direction, maximumDistance) {
		if (direction === "left") return deltaY === 0 && deltaX < 0 && -deltaX <= maximumDistance;
		if (direction === "right") return deltaY === 0 && deltaX > 0 && deltaX <= maximumDistance;
		if (direction === "up") return deltaX === 0 && deltaY < 0 && -deltaY <= maximumDistance;
		if (direction === "down") return deltaX === 0 && deltaY > 0 && deltaY <= maximumDistance;
		return false;
	};

	/** 判断目标是否位于来源武器某一侧的矩形扫描区域内。 */
	const isTargetInSideBox = function (sourceEntry, targetEntry, condition) {
		const sourceCells = getOccupiedWeaponCells(sourceEntry);
		const targetCells = getOccupiedWeaponCells(targetEntry);
		const minimumX = Math.min.apply(null, sourceCells.map(function (cell) { return cell[0]; }));
		const maximumX = Math.max.apply(null, sourceCells.map(function (cell) { return cell[0]; }));
		const minimumY = Math.min.apply(null, sourceCells.map(function (cell) { return cell[1]; }));
		const maximumY = Math.max.apply(null, sourceCells.map(function (cell) { return cell[1]; }));
		const scanDistance = Math.max(1, Math.floor(Number(condition.distance) || 1));
		const scanSpan = Math.max(1, Math.floor(Number(condition.span) || scanDistance));
		const scanDirections = condition.directions || ["up", "down", "left", "right"];
		return targetCells.some(function (targetCell) {
			return scanDirections.some(function (direction) {
				if (direction === "left" || direction === "right") {
					const verticalCenter = (minimumY + maximumY) / 2;
					const firstRow = Math.floor(verticalCenter - (scanSpan - 1) / 2);
					const isInsideRows = targetCell[1] >= firstRow && targetCell[1] < firstRow + scanSpan;
					return isInsideRows && (direction === "left"
						? targetCell[0] < minimumX && targetCell[0] >= minimumX - scanDistance
						: targetCell[0] > maximumX && targetCell[0] <= maximumX + scanDistance);
				}
				const horizontalCenter = (minimumX + maximumX) / 2;
				const firstColumn = Math.floor(horizontalCenter - (scanSpan - 1) / 2);
				const isInsideColumns = targetCell[0] >= firstColumn && targetCell[0] < firstColumn + scanSpan;
				return isInsideColumns && (direction === "up"
					? targetCell[1] < minimumY && targetCell[1] >= minimumY - scanDistance
					: targetCell[1] > maximumY && targetCell[1] <= maximumY + scanDistance);
			});
		});
	};

	/** 判断两个武器是否满足 orthogonal 或 sideBox 空间关系。 */
	const matchesSpatialCondition = function (sourceEntry, targetEntry, condition) {
		if (condition.relation === "sideBox") return isTargetInSideBox(sourceEntry, targetEntry, condition);
		const maximumDistance = Math.max(1, Math.floor(Number(condition.distance) || 1));
		const directions = condition.directions || ["up", "down", "left", "right"];
		const sourceCells = getOccupiedWeaponCells(sourceEntry);
		const targetCells = getOccupiedWeaponCells(targetEntry);
		return sourceCells.some(function (sourceCell) {
			return targetCells.some(function (targetCell) {
				const deltaX = targetCell[0] - sourceCell[0];
				const deltaY = targetCell[1] - sourceCell[1];
				return directions.some(function (direction) {
					return matchesDirection(deltaX, deltaY, direction, maximumDistance);
				});
			});
		});
	};

	/** 按点号路径读取战斗上下文，例如 enemy.burn。 */
	const getWeaponContextValue = function (context, propertyPath) {
		return String(propertyPath || "").split(".").filter(Boolean).reduce(function (currentValue, propertyName) {
			return currentValue == null ? undefined : currentValue[propertyName];
		}, context);
	};

	/** 执行联动条件中的比较运算。 */
	const compareWeaponConditionValue = function (actualValue, operator, expectedValue) {
		if (operator === "gt") return actualValue > expectedValue;
		if (operator === "gte") return actualValue >= expectedValue;
		if (operator === "lt") return actualValue < expectedValue;
		if (operator === "lte") return actualValue <= expectedValue;
		if (operator === "neq") return actualValue !== expectedValue;
		if (operator === "in") return Array.isArray(expectedValue) && expectedValue.indexOf(actualValue) >= 0;
		return actualValue === expectedValue;
	};

	/** 计算单条联动条件，并返回是否通过及匹配到的武器。 */
	const evaluateWeaponCondition = function (sourceEntry, condition, placedEntries, context) {
		if (condition.kind === "context") {
			const actualValue = getWeaponContextValue(context, condition.path);
			return {
				passed: compareWeaponConditionValue(actualValue, condition.operator || "eq", condition.value),
				matches: [],
				value: actualValue
			};
		}
		const shouldIncludeSource = condition.includeSelf === true;
		const matchingEntries = placedEntries.filter(function (candidateEntry) {
			if (!shouldIncludeSource && candidateEntry.instanceId === sourceEntry.instanceId) return false;
			if (!matchesWeaponFilter(candidateEntry, condition.filter)) return false;
			if (condition.kind === "nearby") {
				return matchesSpatialCondition(sourceEntry, candidateEntry, condition);
			}
			return condition.kind === "count";
		});
		const minimumMatches = condition.min == null ? 1 : Number(condition.min);
		const maximumMatches = condition.max == null ? Infinity : Number(condition.max);
		return {
			passed: matchingEntries.length >= minimumMatches && matchingEntries.length <= maximumMatches,
			matches: matchingEntries,
			value: matchingEntries.length
		};
	};

	/** 根据匹配数量或战斗上下文计算一条效果应该叠加几次。 */
	const getWeaponEffectStacks = function (effect, conditionResults, context) {
		let stackCount = 1;
		if (effect.perMatch) {
			const matchingCondition = conditionResults[effect.conditionId];
			stackCount = matchingCondition ? matchingCondition.matches.length : 0;
		}
		if (effect.stacksFrom && effect.stacksFrom.kind === "contextFloor") {
			const contextNumber = Number(getWeaponContextValue(context, effect.stacksFrom.path)) || 0;
			const stackDivisor = Math.max(1, Number(effect.stacksFrom.divisor) || 1);
			stackCount = Math.floor(contextNumber / stackDivisor);
		}
		if (effect.maxStacks != null) stackCount = Math.min(stackCount, Number(effect.maxStacks));
		return Math.max(0, stackCount);
	};

	/**
	 * 计算已摆放武器的最终属性。每条规则的 conditions 使用 AND；effects 可作用于
	 * 自身、条件匹配对象或全部武器。函数只读输入，不修改背包状态或勇士属性。
	 */
	const calculateWeaponAttributes = function (placedEntries, options) {
		options = options || {};
		const calculationContext = Object.assign({ trigger: "layout" }, options.context || {});
		const safePlacedEntries = Array.isArray(placedEntries) ? placedEntries.slice() : [];
		const attributesByInstanceId = {};
		safePlacedEntries.forEach(function (weaponEntry) {
			const baseAttack = Math.max(0, Number(weaponEntry.weapon.attack) || 0);
			attributesByInstanceId[weaponEntry.instanceId] = {
				instanceId: weaponEntry.instanceId,
				sourceItemId: weaponEntry.weapon.sourceItemId || null,
				name: weaponEntry.weapon.name,
				sourceName: weaponEntry.weapon.sourceName || weaponEntry.weapon.name,
				rarity: weaponEntry.weapon.rarity == null ? null : Number(weaponEntry.weapon.rarity),
				weaponTypes: getWeaponTypes(weaponEntry),
				baseAttack: baseAttack,
				attack: baseAttack,
				bonuses: []
			};
		});

		safePlacedEntries.forEach(function (sourceEntry) {
			const synergyRules = Array.isArray(sourceEntry.weapon.synergyRules)
				? sourceEntry.weapon.synergyRules
				: [];
			synergyRules.forEach(function (synergyRule) {
				if (synergyRule.trigger
					&& synergyRule.trigger !== "layout"
					&& synergyRule.trigger !== calculationContext.trigger) return;
				const conditionResults = {};
				const ruleConditions = Array.isArray(synergyRule.conditions) ? synergyRule.conditions : [];
				const allConditionsPassed = ruleConditions.every(function (condition, conditionIndex) {
					const conditionId = condition.id || "condition" + conditionIndex;
					conditionResults[conditionId] = evaluateWeaponCondition(
						sourceEntry,
						condition,
						safePlacedEntries,
						calculationContext
					);
					return conditionResults[conditionId].passed;
				});
				if (!allConditionsPassed) return;

				(synergyRule.effects || []).forEach(function (effect) {
					let recipientEntries = [];
					if (effect.target === "matches") {
						const matchingCondition = conditionResults[effect.conditionId];
						recipientEntries = matchingCondition ? matchingCondition.matches : [];
					} else if (effect.target === "all") {
						recipientEntries = safePlacedEntries.slice();
					} else {
						recipientEntries = [sourceEntry];
					}
					const stackCount = getWeaponEffectStacks(effect, conditionResults, calculationContext);
					const effectValue = Number(effect.value) || 0;
					recipientEntries.forEach(function (recipientEntry) {
						const recipientAttributes = attributesByInstanceId[recipientEntry.instanceId];
						if (!recipientAttributes || !effect.stat || stackCount <= 0) return;
						const valueBeforeEffect = Number(recipientAttributes[effect.stat]) || 0;
						if (effect.operation === "multiply") {
							recipientAttributes[effect.stat] = valueBeforeEffect * Math.pow(effectValue, stackCount);
						} else if (effect.operation === "set") {
							recipientAttributes[effect.stat] = effectValue;
						} else {
							recipientAttributes[effect.stat] = valueBeforeEffect + effectValue * stackCount;
						}
						recipientAttributes.bonuses.push({
							sourceInstanceId: sourceEntry.instanceId,
							sourceName: sourceEntry.weapon.name,
							ruleId: synergyRule.id || "unnamedRule",
							stat: effect.stat,
							operation: effect.operation || "add",
							value: effectValue,
							stacks: stackCount
						});
					});
				});
			});
		});

		const calculatedEntries = safePlacedEntries.map(function (weaponEntry) {
			return attributesByInstanceId[weaponEntry.instanceId];
		});
		return {
			context: cloneWeaponData(calculationContext),
			entries: calculatedEntries,
			totalAttack: calculatedEntries.reduce(function (totalAttack, weaponAttributes) {
				return totalAttack + Math.max(0, Number(weaponAttributes.attack) || 0);
			}, 0),
			byInstanceId: attributesByInstanceId
		};
	};

	// 初始化时立即把属性写入 core.material.items，保证背包随后读取到完整定义。
	applyWeaponMetadata();

	// 对外只暴露武器领域 API；背包插件通过这个命名空间与武器系统对接。
	this.weaponSystem = {
		// 读取完整武器属性表的副本。
		getMetadata: function () { return cloneWeaponData(WEAPON_METADATA); },
		// 将属性表重新应用到 core.material.items。
		applyMetadata: applyWeaponMetadata,
		// 合并指定地图道具的形状与属性。
		mergeMetadata: mergeWeaponMetadata,
		// 标准化四向旋转角。
		normalizeRotation: normalizeWeaponRotation,
		// 标准化武器定义。
		normalizeWeapon: normalizeWeaponDefinition,
		// 读取旋转后的相对占格。
		getRotatedCells: getRotatedWeaponCells,
		// 读取旋转后的宽、高和占格。
		getBounds: getWeaponBounds,
		// 读取实例在背包中的绝对占格。
		getOccupiedCells: getOccupiedWeaponCells,
		// 读取实例类型数组。
		getWeaponTypes: getWeaponTypes,
		// 计算一组已摆放实例的最终属性与联动。
		calculateAttributes: calculateWeaponAttributes
	};
},
    "背包": function () {
	// 背包乱斗的物品摆放层。这里只负责物品实例、占格、拖拽和存档；
	// 属性与战斗结算留给后续系统通过公开 API 读取。
	const CONFIG = {
		// 修改这里即可调整背包初始尺寸和扩展上限。
		// 初始区域会在最大网格内居中；最大行列可分别独立修改。
		initialCols: 8, // 新游戏默认解锁的列数。
		initialRows: 8, // 新游戏默认解锁的行数。
		maxCols: 10, // 背包允许扩展到的最大列数。
		maxRows: 10, // 背包允许扩展到的最大行数。
		maxCellSize: 40, // 单个格子的最大屏幕像素尺寸。
		expansionItemId: "I429", // 解锁一个格子时消耗的地图道具 ID。
		stateFlag: "__backpack_state__", // 保存完整背包状态的勇士 flag 名称。
		attackFlag: "__backpack_attack__", // 缓存已摆放武器总攻击的 flag 名称。
		stateVersion: 4, // 背包存档结构版本，用于兼容旧存档迁移。
		eventId: "backpack" // 背包界面占用的事件面板 ID。
	};

	// state：当前内存中的背包数据；placed 是已摆放实例，inventory 是待摆放实例。
	// unlockedCells 保存已经解锁的 [列, 行] 坐标。
	let state = {
		version: CONFIG.stateVersion,
		placed: [],
		inventory: [],
		unlockedCells: []
	};
	let dragState = null; // 正在拖拽的实例、旋转角、鼠标位置和抓取偏移。
	let instanceSeed = 0; // 同一毫秒创建多个实例时使用的递增序号。
	let root = null; // 背包界面的根 DOM 节点；null 表示界面未打开。
	let bagCanvas = null; // 绘制背景、网格和拖拽合法性提示的画布。
	let bagContext = null; // bagCanvas 对应的 2D 绘图上下文。
	let inventoryPanel = null; // 左侧或上方的待摆放物品面板。
	let expansionLayer = null; // 放置虚线加号扩展按钮的 DOM 图层。
	let expansionCountLabel = null; // 工具栏中显示背包格子数量的文字节点。
	let placedLayer = null; // 显示已摆放武器 DOM 元素的图层。
	let dragLayer = null; // 显示当前拖拽物视觉副本的最高层图层。
	let gameGroup = null; // 魔塔引擎提供的游戏容器 DOM 节点。
	let layout = null; // 最近一次计算出的自适应尺寸和坐标结果。

	/** 深拷贝背包状态，避免存档对象和界面对象共享引用。 */
	const cloneData = function (data) {
		if (data == null) return data;
		if (core.clone) return core.clone(data);
		return JSON.parse(JSON.stringify(data));
	};

	/** 校验配置并计算初始可用区域在最大网格中的居中起点。 */
	const getGridConfig = function () {
		const maxCols = Math.max(1, Math.floor(Number(CONFIG.maxCols) || 10));
		const maxRows = Math.max(1, Math.floor(Number(CONFIG.maxRows) || 10));
		const initialCols = Math.min(maxCols, Math.max(1, Math.floor(Number(CONFIG.initialCols) || maxCols)));
		const initialRows = Math.min(maxRows, Math.max(1, Math.floor(Number(CONFIG.initialRows) || maxRows)));
		return {
			maxCols: maxCols,
			maxRows: maxRows,
			initialCols: initialCols,
			initialRows: initialRows,
			initialCol: Math.floor((maxCols - initialCols) / 2),
			initialRow: Math.floor((maxRows - initialRows) / 2)
		};
	};

	/** 把列、行坐标转为可用于对象去重的稳定字符串。 */
	const cellKey = function (col, row) {
		return Math.floor(Number(col)) + "," + Math.floor(Number(row));
	};

	/** 过滤越界/重复坐标，并按从上到下、从左到右排序。 */
	const normalizeUnlockedCells = function (cells) {
		const grid = getGridConfig();
		const used = {};
		const result = [];
		(cells || []).forEach(function (cell) {
			if (!Array.isArray(cell) || cell.length < 2) return;
			const col = Math.floor(Number(cell[0]));
			const row = Math.floor(Number(cell[1]));
			if (!Number.isFinite(col) || !Number.isFinite(row)
				|| col < 0 || row < 0 || col >= grid.maxCols || row >= grid.maxRows) return;
			const key = cellKey(col, row);
			if (used[key]) return;
			used[key] = true;
			result.push([col, row]);
		});
		return result.sort(function (a, b) { return a[1] - b[1] || a[0] - b[0]; });
	};

	/** 生成新游戏默认解锁的居中矩形格子列表。 */
	const getInitialUnlockedCells = function () {
		const grid = getGridConfig();
		const cells = [];
		for (let row = grid.initialRow; row < grid.initialRow + grid.initialRows; row++) {
			for (let col = grid.initialCol; col < grid.initialCol + grid.initialCols; col++) {
				cells.push([col, row]);
			}
		}
		return cells;
	};

	/** 生成最大网格内的全部坐标，专门用于旧存档容量迁移。 */
	const getAllGridCells = function () {
		const grid = getGridConfig();
		const cells = [];
		for (let row = 0; row < grid.maxRows; row++) {
			for (let col = 0; col < grid.maxCols; col++) cells.push([col, row]);
		}
		return cells;
	};

	/** 判断指定坐标当前是否允许摆放武器。 */
	const isCellUnlocked = function (col, row) {
		const key = cellKey(col, row);
		return state.unlockedCells.some(function (cell) {
			return cellKey(cell[0], cell[1]) === key;
		});
	};

	/** 判断锁定格是否紧邻可用区、应显示为可点击的扩展槽。 */
	const isExpansionCell = function (col, row) {
		const grid = getGridConfig();
		if (col < 0 || row < 0 || col >= grid.maxCols || row >= grid.maxRows
			|| isCellUnlocked(col, row)) return false;
		for (let dy = -1; dy <= 1; dy++) {
			for (let dx = -1; dx <= 1; dx++) {
				if ((dx || dy) && isCellUnlocked(col + dx, row + dy)) return true;
			}
		}
		return false;
	};

	/**
	 * 获取独立武器系统命名空间。延迟读取可避免插件初始化顺序造成空引用。
	 * @returns {object} 武器定义、旋转和联动计算 API。
	 */
	const getWeaponSystem = function () {
		const weaponSystemApi = core.plugin && core.plugin.weaponSystem;
		if (!weaponSystemApi) throw new Error("武器系统插件尚未初始化");
		return weaponSystemApi;
	};

	/** 把 items.js 的形状配置与独立武器系统中的属性配置合并。 */
	const mergeWeaponMetadata = function (itemId, weaponDefinition) {
		return getWeaponSystem().mergeMetadata(itemId, weaponDefinition);
	};
	/** 为每一次武器拾取创建不会与已有实例重复的 ID。 */
	const makeInstanceId = function () {
		instanceSeed++;
		return "backpack_" + Date.now().toString(36) + "_" + instanceSeed.toString(36);
	};

	/** 把角度吸附为武器系统支持的四种旋转角。 */
	const normalizeRotation = function (rotation) {
		return getWeaponSystem().normalizeRotation(rotation);
	};

	/** 通过武器系统校验并统一武器定义。 */
	const normalizeWeapon = function (weaponDefinition) {
		return getWeaponSystem().normalizeWeapon(weaponDefinition);
	};

	/** 获取武器旋转后的相对占格，用于碰撞和拖拽预览。 */
	const getRotatedCells = function (weaponDefinition, rotation) {
		return getWeaponSystem().getRotatedCells(weaponDefinition, rotation);
	};

	/** 获取武器旋转后的宽、高和占格集合。 */
	const getBounds = function (weaponDefinition, rotation) {
		return getWeaponSystem().getBounds(weaponDefinition, rotation);
	};

	/**
	 * 把存档或外部输入规范化为背包实例。placed=true 时还会校验列、行坐标。
	 * 旧存档中的武器会用 items.js 的最新形状和武器系统的最新属性自动迁移。
	 */
	const normalizeEntry = function (entry, placed) {
		if (!entry || typeof entry !== "object") return null;
		let weapon = normalizeWeapon(entry.weapon || entry);
		if (!weapon) return null;
		// 已注册的地图道具以 items.js 中的最新配置为准；
		// 修改图片或形状后，旧存档中的实例也会自动迁移。
		if (weapon.sourceItemId
			&& core.material
			&& core.material.items
			&& core.material.items[weapon.sourceItemId]
			&& core.material.items[weapon.sourceItemId].backpackWeapon) {
			weapon = normalizeWeapon(Object.assign(
				mergeWeaponMetadata(
					weapon.sourceItemId,
					core.material.items[weapon.sourceItemId].backpackWeapon
				),
				{ sourceItemId: weapon.sourceItemId }
			));
		}
		const result = {
			instanceId: String(entry.instanceId || makeInstanceId()),
			weapon: weapon,
			rotation: normalizeRotation(entry.rotation)
		};
		if (placed) {
			result.col = Math.floor(Number(entry.col));
			result.row = Math.floor(Number(entry.row));
			if (!Number.isFinite(result.col) || !Number.isFinite(result.row)) return null;
		}
		return result;
	};

	/** 把武器实例的位置和旋转交给武器系统，换算成背包绝对格子。 */
	const occupiedCells = function (weaponEntry, column, row, rotation) {
		return getWeaponSystem().getOccupiedCells(weaponEntry, column, row, rotation);
	};

	/**
	 * 检查一个实例能否放在指定位置：所有占格必须在上限内、已经解锁且不与其他实例重叠。
	 * excludeInstanceId 用于移动现有实例时忽略它自己原来的占格。
	 */
	const canPlace = function (entry, col, row, rotation, excludeInstanceId) {
		const grid = getGridConfig();
		const cells = occupiedCells(entry, col, row, rotation);
		const inBag = cells.every(function (cell) {
			return cell[0] >= 0 && cell[1] >= 0
				&& cell[0] < grid.maxCols && cell[1] < grid.maxRows
				&& isCellUnlocked(cell[0], cell[1]);
		});
		if (!inBag) return false;
		const wanted = {};
		cells.forEach(function (cell) { wanted[cell[0] + "," + cell[1]] = true; });
		return !state.placed.some(function (placed) {
			if (placed.instanceId === excludeInstanceId) return false;
			return occupiedCells(placed).some(function (cell) {
				return wanted[cell[0] + "," + cell[1]];
			});
		});
	};

	/** 按旋转候选和从上到下、从左到右的顺序寻找第一个合法摆放位置。 */
	const findFirstFit = function (entry, rotations) {
		const grid = getGridConfig();
		rotations = rotations || [
			entry.rotation,
			entry.rotation + 90,
			entry.rotation + 180,
			entry.rotation + 270
		];
		const tested = {};
		for (let index = 0; index < rotations.length; index++) {
			const rotation = normalizeRotation(rotations[index]);
			if (tested[rotation]) continue;
			tested[rotation] = true;
			for (let row = 0; row < grid.maxRows; row++) {
				for (let col = 0; col < grid.maxCols; col++) {
					if (canPlace(entry, col, row, rotation, entry.instanceId)) {
						return { col: col, row: row, rotation: rotation };
					}
				}
			}
		}
		return null;
	};

	/**
	 * 从勇士 flag 读取背包存档，迁移旧版本，并把失效/越界的已摆放实例安全送回库存。
	 * @returns {object} 已写入内存的最新 state。
	 */
	const readState = function () {
		const raw = core.getFlag(CONFIG.stateFlag, null);
		const next = {
			version: CONFIG.stateVersion,
			placed: [],
			inventory: [],
			unlockedCells: []
		};
		const ids = {};
		const initialCells = getInitialUnlockedCells();
		if (raw && typeof raw === "object") {
			// v3 及更早版本没有格子解锁数据：保留旧存档在新上限内的已有容量。
			const storedCells = Number(raw.version) >= 4 && Array.isArray(raw.unlockedCells)
				? raw.unlockedCells
				: getAllGridCells();
			next.unlockedCells = normalizeUnlockedCells(storedCells.concat(initialCells));
		} else {
			next.unlockedCells = normalizeUnlockedCells(initialCells);
		}
		state = next;
		if (raw && typeof raw === "object") {
			(raw.placed || []).forEach(function (source) {
				const entry = normalizeEntry(source, true);
				if (!entry || ids[entry.instanceId]) return;
				ids[entry.instanceId] = true;
				if (canPlace(entry, entry.col, entry.row, entry.rotation, entry.instanceId)) {
					next.placed.push(entry);
				} else {
					delete entry.col;
					delete entry.row;
					next.inventory.push(entry);
				}
			});
			(raw.inventory || []).forEach(function (source) {
				const entry = normalizeEntry(source, false);
				if (!entry || ids[entry.instanceId]) return;
				ids[entry.instanceId] = true;
				next.inventory.push(entry);
			});
		}
		return next;
	};

	/** 保存背包状态，并同步缓存已摆放武器的最终总攻击。 */
	const persistState = function () {
		if (!core.status.hero || !core.status.hero.flags) return;
		core.setFlag(CONFIG.stateFlag, {
			version: CONFIG.stateVersion,
			placed: cloneData(state.placed),
			inventory: cloneData(state.inventory),
			unlockedCells: cloneData(state.unlockedCells)
		});
		const calculated = calculateBackpackAttributes();
		core.setFlag(CONFIG.attackFlag, {
			version: CONFIG.stateVersion,
			totalAttack: calculated.totalAttack,
			placedCount: calculated.entries.length
		});
	};

	/** 返回已摆放和待摆放实例组成的新数组，不改变两个原数组。 */
	const getAllEntries = function () {
		return state.placed.concat(state.inventory);
	};

	/** 按唯一实例 ID 查找武器；找不到时返回 null。 */
	const findEntry = function (instanceId) {
		return getAllEntries().find(function (entry) {
			return entry.instanceId === instanceId;
		}) || null;
	};

	/** 从已摆放区和库存区同时移除指定实例，供移动和删除流程复用。 */
	const removeEntryFromLists = function (instanceId) {
		state.placed = state.placed.filter(function (entry) {
			return entry.instanceId !== instanceId;
		});
		state.inventory = state.inventory.filter(function (entry) {
			return entry.instanceId !== instanceId;
		});
	};

	/** 返回一个背包实例的武器类型，供卡片和提示文本显示。 */
	const getWeaponTypes = function (weaponEntry) {
		return getWeaponSystem().getWeaponTypes(weaponEntry);
	};

	/**
	 * 将当前已摆放实例交给独立武器系统计算属性与联动。
	 * 背包只提供实例和坐标，不再包含任何武器规则实现。
	 */
	const calculateBackpackAttributes = function (options) {
		return getWeaponSystem().calculateAttributes(state.placed, options);
	};

	/**
	 * 返回已摆放武器的最终总攻击。普通布局优先读取缓存；refresh 或战斗上下文会重新计算。
	 */
	const getBackpackAttack = function (options) {
		options = options || {};
		const hasCustomContext = options.context && Object.keys(options.context).length > 0;
		if (!options.refresh && !hasCustomContext) {
			const cached = core.getFlag(CONFIG.attackFlag, null);
			if (cached && cached.version === CONFIG.stateVersion && Number.isFinite(Number(cached.totalAttack))) {
				return Math.max(0, Number(cached.totalAttack));
			}
		}
		readState();
		const calculated = calculateBackpackAttributes(options);
		if (!hasCustomContext && core.status.hero && core.status.hero.flags) {
			core.setFlag(CONFIG.attackFlag, {
				version: CONFIG.stateVersion,
				totalAttack: calculated.totalAttack,
				placedCount: calculated.entries.length
			});
		}
		return calculated.totalAttack;
	};

	/** 把浏览器窗口坐标换算为背包根节点内部坐标。 */
	const pointToLocal = function (clientX, clientY) {
		const rect = root.getBoundingClientRect();
		return {
			x: (clientX - rect.left) * (root.clientWidth / rect.width),
			y: (clientY - rect.top) * (root.clientHeight / rect.height)
		};
	};

	/** 把数值四舍五入并转换成可写入 DOM style 的像素字符串。 */
	const px = function (value) {
		return Math.round(value) + "px";
	};

	/**
	 * 根据当前窗口宽高计算桌面/紧凑布局、库存面板位置、格子尺寸和网格原点。
	 * 计算结果写入 layout，后续所有绘制和命中检测共用同一坐标系。
	 */
	const computeLayout = function () {
		const grid = getGridConfig();
		const rect = root.getBoundingClientRect();
		const width = root.clientWidth || rect.width;
		const height = root.clientHeight || rect.height;
		const scale = rect.width ? width / rect.width : 1;
		const compact = rect.width < 620;
		const toolbarHeight = 46 * scale;
		let panelBox; // 库存面板的 left/top/width/height。
		let cellSize; // 根据可用空间缩放后的单格像素尺寸。
		let bagX; // 最大背包网格左上角的横坐标。
		let bagY; // 最大背包网格左上角的纵坐标。

		if (compact) {
			const panelHeight = 104 * scale;
			const availableHeight = Math.max(80 * scale, height - toolbarHeight - panelHeight - 22 * scale);
			cellSize = Math.min(
				CONFIG.maxCellSize * scale,
				(width - 18 * scale) / grid.maxCols,
				availableHeight / grid.maxRows
			);
			bagX = (width - grid.maxCols * cellSize) / 2;
			bagY = toolbarHeight + panelHeight + 10 * scale;
			panelBox = {
				left: 8 * scale,
				top: toolbarHeight,
				width: width - 16 * scale,
				height: panelHeight - 6 * scale
			};
		} else {
			const panelWidth = 148 * scale;
			cellSize = Math.min(
				CONFIG.maxCellSize * scale,
				(width - panelWidth - 30 * scale) / grid.maxCols,
				(height - toolbarHeight - 20 * scale) / grid.maxRows
			);
			bagX = panelWidth + (width - panelWidth - grid.maxCols * cellSize) / 2;
			bagY = toolbarHeight + (height - toolbarHeight - grid.maxRows * cellSize) / 2;
			panelBox = {
				left: 8 * scale,
				top: toolbarHeight,
				width: panelWidth - 14 * scale,
				height: height - toolbarHeight - 8 * scale
			};
		}

		cellSize = Math.max(8, cellSize);
		layout = {
			width: width,
			height: height,
			scale: scale,
			compact: compact,
			cellSize: cellSize,
			bagX: bagX,
			bagY: bagY,
			bagWidth: grid.maxCols * cellSize,
			bagHeight: grid.maxRows * cellSize,
			panel: panelBox
		};
	};

	/**
	 * 创建武器 DOM 元素：按裁剪参数显示素材、应用旋转，并为每个占格添加轮廓。
	 */
	const createWeaponElement = function (weapon, rotation, cellSize) {
		const bounds = getBounds(weapon, rotation);
		const element = document.createElement("div");
		element.className = "backpack-weapon";
		element.style.width = px(bounds.cols * cellSize);
		element.style.height = px(bounds.rows * cellSize);

		const baseBounds = getBounds(weapon, 0);
		const imageFrame = document.createElement("div");
		imageFrame.className = "backpack-image-frame";
		imageFrame.style.width = px(baseBounds.cols * cellSize);
		imageFrame.style.height = px(baseBounds.rows * cellSize);
		imageFrame.style.transformOrigin = "0 0";

		const image = document.createElement("img");
		image.draggable = false;
		image.alt = weapon.name;
		image.src = weapon.image;
		const crop = weapon.imageCrop;
		if (Array.isArray(crop) && crop.length >= 6 && crop[2] > 0 && crop[3] > 0) {
			const scaleX = baseBounds.cols * cellSize / crop[2];
			const scaleY = baseBounds.rows * cellSize / crop[3];
			image.style.width = px(crop[4] * scaleX);
			image.style.height = px(crop[5] * scaleY);
			image.style.left = px(-crop[0] * scaleX);
			image.style.top = px(-crop[1] * scaleY);
		} else {
			image.style.width = px(baseBounds.cols * cellSize);
			image.style.height = px(baseBounds.rows * cellSize);
		}
		imageFrame.appendChild(image);

		const normalized = normalizeRotation(rotation);
		if (normalized === 90) {
			imageFrame.style.left = px(bounds.cols * cellSize);
			imageFrame.style.transform = "rotate(90deg)";
		} else if (normalized === 180) {
			imageFrame.style.left = px(bounds.cols * cellSize);
			imageFrame.style.top = px(bounds.rows * cellSize);
			imageFrame.style.transform = "rotate(180deg)";
		} else if (normalized === 270) {
			imageFrame.style.top = px(bounds.rows * cellSize);
			imageFrame.style.transform = "rotate(270deg)";
		}
		element.appendChild(imageFrame);

		bounds.cells.forEach(function (cell) {
			const outline = document.createElement("span");
			outline.className = "backpack-cell-outline";
			outline.style.left = px(cell[0] * cellSize);
			outline.style.top = px(cell[1] * cellSize);
			outline.style.width = px(cellSize);
			outline.style.height = px(cellSize);
			element.appendChild(outline);
		});
		return element;
	};

	/** 绘制背包背景、已解锁网格、拖拽合法性颜色和底部操作说明。 */
	const drawBag = function () {
		if (!bagContext || !layout) return;
		const grid = getGridConfig();
		bagContext.clearRect(0, 0, layout.width, layout.height);
		bagContext.fillStyle = "#241812";
		bagContext.fillRect(0, 0, layout.width, layout.height);

		bagContext.fillStyle = "#34241b";
		bagContext.fillRect(
			layout.bagX - 5 * layout.scale,
			layout.bagY - 5 * layout.scale,
			layout.bagWidth + 10 * layout.scale,
			layout.bagHeight + 10 * layout.scale
		);
		for (let row = 0; row < grid.maxRows; row++) {
			for (let col = 0; col < grid.maxCols; col++) {
				if (!isCellUnlocked(col, row)) continue;
				const x = layout.bagX + col * layout.cellSize;
				const y = layout.bagY + row * layout.cellSize;
				bagContext.fillStyle = (row + col) % 2 ? "#4a4038" : "#51463d";
				bagContext.fillRect(x, y, layout.cellSize - 1, layout.cellSize - 1);
				bagContext.strokeStyle = "#80684f";
				bagContext.lineWidth = Math.max(1, layout.scale);
				bagContext.strokeRect(x, y, layout.cellSize - 1, layout.cellSize - 1);
			}
		}

		if (dragState) {
			const target = getDragTarget();
			if (target.inBag) {
				const entry = findEntry(dragState.instanceId);
				if (entry) {
					const cells = occupiedCells(entry, target.col, target.row, dragState.rotation);
					bagContext.fillStyle = target.valid
						? "rgba(74, 222, 128, 0.42)"
						: "rgba(248, 113, 113, 0.48)";
					cells.forEach(function (cell) {
						bagContext.fillRect(
							layout.bagX + cell[0] * layout.cellSize,
							layout.bagY + cell[1] * layout.cellSize,
							layout.cellSize - 1,
							layout.cellSize - 1
						);
					});
				}
			}
		}

		bagContext.fillStyle = "#d8c7ac";
		bagContext.font = px(13 * layout.scale) + " sans-serif";
		bagContext.textAlign = "center";
		bagContext.fillText(
			"拖动物品摆放 · 点击虚线 + 格扩容 · 拖拽时按 R 旋转",
			layout.bagX + layout.bagWidth / 2,
			Math.min(layout.height - 5 * layout.scale, layout.bagY + layout.bagHeight + 18 * layout.scale)
		);
	};

	/** 返回勇士当前持有的“背包格子”消耗品数量。 */
	const getExpansionItemCount = function () {
		return core.itemCount ? Math.max(0, Number(core.itemCount(CONFIG.expansionItemId)) || 0) : 0;
	};

	/**
	 * 消耗一个扩容道具并解锁指定候选格。失败时不修改道具或存档。
	 * @returns {boolean} 是否成功完成解锁。
	 */
	const unlockBackpackCell = function (col, row) {
		col = Math.floor(Number(col));
		row = Math.floor(Number(row));
		if (!isExpansionCell(col, row)) return false;
		if (getExpansionItemCount() <= 0) {
			if (core.playSound) core.playSound("操作失败");
			if (core.drawTip) core.drawTip("需要一个背包格子才能解锁", CONFIG.expansionItemId);
			return false;
		}
		if (!core.removeItem || !core.removeItem(CONFIG.expansionItemId, 1)) return false;
		state.unlockedCells = normalizeUnlockedCells(state.unlockedCells.concat([[col, row]]));
		persistState();
		renderAll();
		if (core.playSound) core.playSound("打开界面");
		if (core.drawTip) {
			core.drawTip("背包格子已解锁，剩余 " + getExpansionItemCount() + " 个", CONFIG.expansionItemId);
		}
		return true;
	};

	/** 重建所有可扩展格的虚线加号按钮，并刷新工具栏中的道具数量。 */
	const renderExpansionSlots = function () {
		if (!expansionLayer || !layout) return;
		const grid = getGridConfig();
		expansionLayer.innerHTML = "";
		if (expansionCountLabel) {
			expansionCountLabel.textContent = "背包格子 × " + getExpansionItemCount();
		}
		for (let row = 0; row < grid.maxRows; row++) {
			for (let col = 0; col < grid.maxCols; col++) {
				if (!isExpansionCell(col, row)) continue;
				const slot = document.createElement("button");
				slot.type = "button";
				slot.className = "backpack-expansion-slot";
				slot.textContent = "+";
				slot.title = "消耗 1 个背包格子解锁此位置";
				slot.style.left = px(layout.bagX + col * layout.cellSize);
				slot.style.top = px(layout.bagY + row * layout.cellSize);
				slot.style.width = px(layout.cellSize - 1);
				slot.style.height = px(layout.cellSize - 1);
				slot.style.fontSize = px(Math.max(13, layout.cellSize * 0.58));
				slot.addEventListener("pointerdown", function (event) {
					event.stopPropagation();
				});
				slot.addEventListener("click", function (event) {
					event.preventDefault();
					event.stopPropagation();
					unlockBackpackCell(col, row);
				});
				expansionLayer.appendChild(slot);
			}
		}
	};

	/** 重建已摆放武器图层，并显示武器系统计算后的攻击、稀有度、类型和联动提示。 */
	const renderPlaced = function () {
		if (!placedLayer || !layout) return;
		placedLayer.innerHTML = "";
		const calculated = calculateBackpackAttributes();
		state.placed.forEach(function (entry) {
			const element = createWeaponElement(entry.weapon, entry.rotation, layout.cellSize);
			element.classList.add("backpack-placed");
			element.dataset.instanceId = entry.instanceId;
			const attributes = calculated.byInstanceId[entry.instanceId];
			const detail = attributes
				? "攻击 " + attributes.attack + " · 稀有 " + (attributes.rarity == null ? "—" : attributes.rarity)
					+ " · " + (attributes.weaponTypes.join("/") || "未分类")
				: "属性未配置";
			element.title = entry.weapon.name + " · " + detail
				+ (entry.weapon.synergyText ? "\n联动：" + entry.weapon.synergyText : "")
				+ "\n右键旋转";
			element.style.left = px(layout.bagX + entry.col * layout.cellSize);
			element.style.top = px(layout.bagY + entry.row * layout.cellSize);
			element.addEventListener("pointerdown", function (event) {
				startPointerDrag(event, entry.instanceId, "placed", element);
			});
			element.addEventListener("contextmenu", function (event) {
				event.preventDefault();
				rotatePlaced(entry.instanceId);
			});
			placedLayer.appendChild(element);
		});
	};

	/** 重建待摆放库存卡片；桌面纵向排列，窄屏横向排列。 */
	const renderInventory = function () {
		if (!inventoryPanel || !layout) return;
		inventoryPanel.innerHTML = "";
		inventoryPanel.style.left = px(layout.panel.left);
		inventoryPanel.style.top = px(layout.panel.top);
		inventoryPanel.style.width = px(layout.panel.width);
		inventoryPanel.style.height = px(layout.panel.height);
		inventoryPanel.style.flexDirection = layout.compact ? "row" : "column";

		if (!state.inventory.length) {
			const empty = document.createElement("div");
			empty.className = "backpack-empty";
			empty.textContent = state.placed.length ? "没有待摆放物品" : "背包中还没有物品";
			inventoryPanel.appendChild(empty);
			return;
		}

		state.inventory.forEach(function (entry) {
			const card = document.createElement("div");
			card.className = "backpack-card";
			card.title = entry.weapon.name
				+ (entry.weapon.sourceName ? "（" + entry.weapon.sourceName + "）" : "")
				+ (entry.weapon.synergyText ? "\n联动：" + entry.weapon.synergyText : "");
			const bounds = getBounds(entry.weapon, entry.rotation);
			const maxWidth = (layout.compact ? 58 : 74) * layout.scale;
			const maxHeight = (layout.compact ? 58 : 80) * layout.scale;
			const previewCell = Math.max(
				5,
				Math.min(layout.cellSize, maxWidth / bounds.cols, maxHeight / bounds.rows)
			);
			const preview = createWeaponElement(entry.weapon, entry.rotation, previewCell);
			preview.classList.add("backpack-preview");
			preview.addEventListener("pointerdown", function (event) {
				startPointerDrag(event, entry.instanceId, "inventory", preview);
			});

			const name = document.createElement("div");
			name.className = "backpack-card-name";
			name.textContent = entry.weapon.name;
			const meta = document.createElement("div");
			meta.className = "backpack-card-meta";
			meta.textContent = "攻 " + (entry.weapon.attack == null ? "—" : entry.weapon.attack)
				+ " · 稀有 " + (entry.weapon.rarity == null ? "—" : entry.weapon.rarity)
				+ " · " + (getWeaponTypes(entry).join("/") || "未分类");

			const rotate = document.createElement("button");
			rotate.className = "backpack-mini-button";
			rotate.textContent = "旋转";
			rotate.addEventListener("pointerdown", function (event) {
				event.stopPropagation();
			});
			rotate.addEventListener("click", function () {
				entry.rotation = normalizeRotation(entry.rotation + 90);
				persistState();
				renderAll();
			});

			card.appendChild(preview);
			card.appendChild(name);
			card.appendChild(meta);
			card.appendChild(rotate);
			inventoryPanel.appendChild(card);
		});
	};

	/** 统一执行尺寸计算、画布绘制、扩展槽、已摆放区和库存区渲染。 */
	const renderAll = function () {
		if (!root) return;
		computeLayout();
		bagCanvas.width = layout.width;
		bagCanvas.height = layout.height;
		drawBag();
		renderExpansionSlots();
		renderPlaced();
		renderInventory();
		if (dragState) updateDragElement();
	};

	/** 判断背包内部坐标是否落在库存面板范围内。 */
	const isPointInInventory = function (point) {
		if (!layout) return false;
		const panel = layout.panel;
		return point.x >= panel.left && point.x <= panel.left + panel.width
			&& point.y >= panel.top && point.y <= panel.top + panel.height;
	};

	/** 根据拖拽物左上角计算目标列行，并返回是否进入网格以及能否合法放置。 */
	const getDragTarget = function () {
		if (!dragState || !layout) return { inBag: false, valid: false };
		const left = dragState.point.x - dragState.offsetX;
		const top = dragState.point.y - dragState.offsetY;
		const col = Math.round((left - layout.bagX) / layout.cellSize);
		const row = Math.round((top - layout.bagY) / layout.cellSize);
		const entry = findEntry(dragState.instanceId);
		if (!entry) return { inBag: false, valid: false };
		const bounds = getBounds(entry.weapon, dragState.rotation);
		const inBag = left + bounds.cols * layout.cellSize >= layout.bagX
			&& top + bounds.rows * layout.cellSize >= layout.bagY
			&& left <= layout.bagX + layout.bagWidth
			&& top <= layout.bagY + layout.bagHeight;
		return {
			inBag: inBag,
			col: col,
			row: row,
			valid: inBag && canPlace(entry, col, row, dragState.rotation, entry.instanceId)
		};
	};

	/** 创建当前拖拽物的视觉副本，并按鼠标抓取比例重新计算偏移。 */
	const createDragElement = function () {
		if (!dragState || !dragLayer) return;
		dragLayer.innerHTML = "";
		const entry = findEntry(dragState.instanceId);
		if (!entry) return;
		const element = createWeaponElement(entry.weapon, dragState.rotation, layout.cellSize);
		element.classList.add("backpack-dragging");
		dragLayer.appendChild(element);
		dragState.element = element;
		const bounds = getBounds(entry.weapon, dragState.rotation);
		dragState.offsetX = dragState.gripX * bounds.cols * layout.cellSize;
		dragState.offsetY = dragState.gripY * bounds.rows * layout.cellSize;
		updateDragElement();
	};

	/** 让拖拽视觉副本跟随最新指针位置。 */
	const updateDragElement = function () {
		if (!dragState || !dragState.element) return;
		dragState.element.style.left = px(dragState.point.x - dragState.offsetX);
		dragState.element.style.top = px(dragState.point.y - dragState.offsetY);
	};

	/**
	 * 从已摆放区或库存区开始一次指针拖拽，并记录抓取点在元素内部的比例。
	 */
	const startPointerDrag = function (event, instanceId, source, sourceElement) {
		if (event.pointerType === "mouse" && event.button !== 0) return;
		event.preventDefault();
		event.stopPropagation();
		const rect = sourceElement.getBoundingClientRect();
		const point = pointToLocal(event.clientX, event.clientY);
		dragState = {
			instanceId: instanceId,
			source: source,
			rotation: findEntry(instanceId).rotation,
			point: point,
			gripX: rect.width ? (event.clientX - rect.left) / rect.width : 0.5,
			gripY: rect.height ? (event.clientY - rect.top) / rect.height : 0.5,
			offsetX: 0,
			offsetY: 0,
			element: null
		};
		createDragElement();
		drawBag();
	};

	/** 把正在拖拽的武器顺时针旋转 90 度并立即刷新预览。 */
	const rotateDrag = function () {
		if (!dragState) return;
		dragState.rotation = normalizeRotation(dragState.rotation + 90);
		createDragElement();
		drawBag();
	};

	/**
	 * 结束拖拽：放到库存、放到合法网格或退回原位；只有状态改变时才写存档。
	 */
	const finishDrag = function (event) {
		if (!dragState) return;
		const point = pointToLocal(event.clientX, event.clientY);
		dragState.point = point;
		const entry = findEntry(dragState.instanceId);
		const target = getDragTarget();
		let changed = false;

		if (entry && isPointInInventory(point)) {
			if (dragState.source === "placed") {
				removeEntryFromLists(entry.instanceId);
				delete entry.col;
				delete entry.row;
				entry.rotation = dragState.rotation;
				state.inventory.push(entry);
				changed = true;
			} else if (entry.rotation !== dragState.rotation) {
				entry.rotation = dragState.rotation;
				changed = true;
			}
		} else if (entry && target.valid) {
			removeEntryFromLists(entry.instanceId);
			entry.col = target.col;
			entry.row = target.row;
			entry.rotation = dragState.rotation;
			state.placed.push(entry);
			changed = true;
		} else if (core.drawTip) {
			core.drawTip("这里放不下，物品已回到原位");
		}

		dragState = null;
		if (dragLayer) dragLayer.innerHTML = "";
		if (changed) persistState();
		renderAll();
	};

	/** 取消当前拖拽并清除视觉副本，不修改实例位置。 */
	const cancelDrag = function () {
		dragState = null;
		if (dragLayer) dragLayer.innerHTML = "";
		drawBag();
	};

	/** 在原位置旋转已摆放武器；旋转后越界或重叠时拒绝操作。 */
	const rotatePlaced = function (instanceId) {
		const entry = state.placed.find(function (item) {
			return item.instanceId === instanceId;
		});
		if (!entry) return false;
		const rotation = normalizeRotation(entry.rotation + 90);
		if (!canPlace(entry, entry.col, entry.row, rotation, entry.instanceId)) {
			if (core.drawTip) core.drawTip("当前位置没有足够空间旋转");
			return false;
		}
		entry.rotation = rotation;
		persistState();
		renderAll();
		return true;
	};

	/** 按占格数量从大到小重新寻找位置，放不下的实例保留在库存。 */
	const autoArrange = function () {
		readState();
		const entries = getAllEntries().sort(function (a, b) {
			return b.weapon.cells.length - a.weapon.cells.length;
		});
		state.placed = [];
		state.inventory = [];
		entries.forEach(function (entry) {
			delete entry.col;
			delete entry.row;
			const fit = findFirstFit(entry);
			if (fit) {
				entry.col = fit.col;
				entry.row = fit.row;
				entry.rotation = fit.rotation;
				state.placed.push(entry);
			} else {
				state.inventory.push(entry);
			}
		});
		persistState();
		renderAll();
		if (core.drawTip) {
			core.drawTip(state.inventory.length ? "已整理，仍有物品放不下" : "背包整理完成");
		}
		return state.inventory.length === 0;
	};

	/** 把所有已摆放实例收回库存，并清除它们的列、行坐标。 */
	const collectAll = function () {
		readState();
		state.placed.forEach(function (entry) {
			delete entry.col;
			delete entry.row;
			state.inventory.push(entry);
		});
		state.placed = [];
		persistState();
		renderAll();
	};

	/** 首次打开背包时注入一次界面 CSS，重复打开不会创建重复 style 标签。 */
	const ensureStyle = function () {
		if (document.getElementById("backpack-system-style")) return;
		const style = document.createElement("style");
		style.id = "backpack-system-style";
		style.textContent = `
			#backpack-system-root { position:absolute; inset:0; z-index:260; overflow:hidden; touch-action:none; user-select:none; }
			#backpack-system-root canvas { position:absolute; inset:0; width:100%; height:100%; pointer-events:none; }
			.backpack-toolbar { position:absolute; z-index:4; left:0; right:0; top:0; display:flex; align-items:center; justify-content:center; gap:8px; padding:6px; }
			.backpack-toolbar-title { color:#ffe8bd; font:bold 16px sans-serif; margin-right:10px; }
			.backpack-expansion-count { color:#d7c39f; font:12px sans-serif; white-space:nowrap; }
			.backpack-button, .backpack-mini-button { border:1px solid #c29458; border-radius:5px; color:#fff7e8; background:#6b4529; cursor:pointer; }
			.backpack-button { padding:6px 12px; font-size:13px; }
			.backpack-button:hover, .backpack-mini-button:hover { background:#8a5a34; }
			.backpack-inventory { position:absolute; z-index:3; display:flex; gap:7px; padding:5px; box-sizing:border-box; overflow:auto; border:1px solid #80684f; border-radius:7px; background:rgba(45,31,23,.94); }
			.backpack-card { flex:0 0 auto; min-width:82px; padding:5px; box-sizing:border-box; border:1px solid #80684f; border-radius:5px; background:#3d3028; color:#f4e4c7; text-align:center; }
			.backpack-card-name { max-width:90px; overflow:hidden; white-space:nowrap; text-overflow:ellipsis; font:12px sans-serif; margin:3px auto; }
			.backpack-card-meta { max-width:96px; overflow:hidden; white-space:nowrap; text-overflow:ellipsis; color:#d3bc97; font:10px sans-serif; margin:2px auto 4px; }
			.backpack-mini-button { padding:3px 8px; font-size:11px; }
			.backpack-empty { margin:auto; color:#c4ae8d; font:13px sans-serif; text-align:center; }
			.backpack-expansion-layer { position:absolute; inset:0; z-index:1; pointer-events:none; }
			.backpack-expansion-slot { position:absolute; display:flex; align-items:center; justify-content:center; box-sizing:border-box; margin:0; padding:0; border:2px dashed rgba(224,190,135,.78); border-radius:3px; color:#e9c98f; background:rgba(43,32,25,.78); font-family:monospace; line-height:1; cursor:pointer; pointer-events:auto; }
			.backpack-expansion-slot:hover { color:#fff2c6; border-color:#ffe0a1; background:rgba(103,75,46,.88); }
			.backpack-placed-layer, .backpack-drag-layer { position:absolute; inset:0; z-index:2; pointer-events:none; }
			.backpack-drag-layer { z-index:6; }
			.backpack-weapon { position:absolute; overflow:visible; box-sizing:border-box; }
			.backpack-image-frame { position:absolute; left:0; top:0; overflow:hidden; pointer-events:none; }
			.backpack-image-frame img { position:absolute; left:0; top:0; object-fit:fill; pointer-events:none; -webkit-user-drag:none; }
			.backpack-cell-outline { position:absolute; box-sizing:border-box; border:1px solid rgba(255,230,180,.28); pointer-events:none; }
			.backpack-placed, .backpack-preview { pointer-events:auto; cursor:grab; }
			.backpack-placed:active, .backpack-preview:active { cursor:grabbing; }
			.backpack-dragging { opacity:.82; filter:drop-shadow(0 3px 4px rgba(0,0,0,.65)); pointer-events:none; }
			.backpack-card .backpack-preview { position:relative; margin:0 auto; }
		`;
		document.head.appendChild(style);
	};

	/** 创建工具栏按钮，并阻止 pointerdown 冒泡到游戏画布。 */
	const createButton = function (text, callback) {
		const button = document.createElement("button");
		button.className = "backpack-button";
		button.textContent = text;
		button.addEventListener("pointerdown", function (event) {
			event.stopPropagation();
		});
		button.addEventListener("click", callback);
		return button;
	};

	/** 创建背包所需 DOM 图层、工具栏和全局事件监听。 */
	const buildInterface = function () {
		ensureStyle();
		gameGroup = document.getElementById("gameGroup");
		if (!gameGroup) return false;

		root = document.createElement("div");
		root.id = "backpack-system-root";

		bagCanvas = document.createElement("canvas");
		bagContext = bagCanvas.getContext("2d");
		root.appendChild(bagCanvas);

		expansionLayer = document.createElement("div");
		expansionLayer.className = "backpack-expansion-layer";
		root.appendChild(expansionLayer);

		placedLayer = document.createElement("div");
		placedLayer.className = "backpack-placed-layer";
		root.appendChild(placedLayer);

		inventoryPanel = document.createElement("div");
		inventoryPanel.className = "backpack-inventory";
		root.appendChild(inventoryPanel);

		dragLayer = document.createElement("div");
		dragLayer.className = "backpack-drag-layer";
		root.appendChild(dragLayer);

		const toolbar = document.createElement("div");
		toolbar.className = "backpack-toolbar";
		const title = document.createElement("span");
		title.className = "backpack-toolbar-title";
		title.textContent = "背包";
		toolbar.appendChild(title);
		expansionCountLabel = document.createElement("span");
		expansionCountLabel.className = "backpack-expansion-count";
		toolbar.appendChild(expansionCountLabel);
		toolbar.appendChild(createButton("旋转拖拽物（R）", rotateDrag));
		toolbar.appendChild(createButton("自动整理", autoArrange));
		toolbar.appendChild(createButton("全部收回", collectAll));
		toolbar.appendChild(createButton("关闭", function () { closeBackpack(); }));
		root.appendChild(toolbar);

		gameGroup.appendChild(root);
		window.addEventListener("resize", renderAll);
		document.addEventListener("pointermove", onPointerMove, true);
		document.addEventListener("pointerup", onPointerUp, true);
		document.addEventListener("pointercancel", onPointerCancel, true);
		document.addEventListener("keydown", onKeyDown, true);
		renderAll();
		return true;
	};

	/** 全局指针移动处理：更新拖拽物位置和目标格颜色。 */
	const onPointerMove = function (event) {
		if (!dragState || !root) return;
		event.preventDefault();
		dragState.point = pointToLocal(event.clientX, event.clientY);
		updateDragElement();
		drawBag();
	};

	/** 全局指针释放处理：提交当前拖拽结果。 */
	const onPointerUp = function (event) {
		if (!dragState || !root) return;
		event.preventDefault();
		event.stopPropagation();
		finishDrag(event);
	};

	/** 浏览器取消指针序列时恢复安全的非拖拽状态。 */
	const onPointerCancel = function () {
		if (dragState) cancelDrag();
	};

	/** 背包键盘处理：Esc/X 关闭界面，拖拽时 R 旋转。 */
	const onKeyDown = function (event) {
		if (!root) return;
		if (event.key === "Escape" || event.key === "x" || event.key === "X") {
			event.preventDefault();
			event.stopPropagation();
			closeBackpack();
		} else if ((event.key === "r" || event.key === "R") && dragState) {
			event.preventDefault();
			event.stopPropagation();
			rotateDrag();
		}
	};

	/**
	 * 打开背包：同步道具实例、保存最新状态、锁定游戏控制并创建界面。
	 * 录像播放中禁止打开，避免产生无法复现的拖拽路线。
	 */
	const openBackpack = function () {
		if (root) return true;
		if (!core.isPlaying || !core.isPlaying()) return false;
		if (core.isReplaying && core.isReplaying()) {
			if (core.drawTip) core.drawTip("录像播放中不能整理背包");
			return false;
		}
		if (core.status.event && core.status.event.id && core.status.event.id !== CONFIG.eventId) {
			core.ui.closePanel();
		}
		syncBackpackItems();
		persistState();
		core.lockControl();
		core.status.event.id = CONFIG.eventId;
		core.status.event.data = null;
		return buildInterface();
	};

	/**
	 * 关闭背包并移除全部 DOM/事件监听。keepLocked 用于读档重置时保持引擎锁定状态。
	 */
	const closeBackpack = function (options) {
		options = options || {};
		cancelDrag();
		window.removeEventListener("resize", renderAll);
		document.removeEventListener("pointermove", onPointerMove, true);
		document.removeEventListener("pointerup", onPointerUp, true);
		document.removeEventListener("pointercancel", onPointerCancel, true);
		document.removeEventListener("keydown", onKeyDown, true);
		if (root) root.remove();
		root = null;
		bagCanvas = null;
		bagContext = null;
		inventoryPanel = null;
		expansionLayer = null;
		expansionCountLabel = null;
		placedLayer = null;
		dragLayer = null;
		gameGroup = null;
		layout = null;
		if (core.status.event && core.status.event.id === CONFIG.eventId) {
			core.status.event.id = null;
			core.status.event.data = null;
			core.status.event.selection = null;
			core.status.event.ui = null;
			core.status.event.interval = null;
			if (!options.keepLocked) core.unlockControl();
			if (core.updateStatusBar) core.updateStatusBar(true);
		}
		return true;
	};

	/**
	 * 从通用武器定义创建独立实例。autoPlace=true 时自动找位置，否则进入待摆放库存。
	 * uniqueKey 可用于需要全局唯一的特殊物品；普通同类武器默认允许重复。
	 */
	const addBackpackWeapon = function (weapon, options) {
		options = options || {};
		readState();
		const normalized = normalizeWeapon(weapon);
		if (!normalized) {
			if (core.drawTip) core.drawTip("物品形状数据无效");
			return null;
		}
		const uniqueKey = options.uniqueKey || normalized.uniqueKey;
		if (uniqueKey) {
			const existing = getAllEntries().find(function (entry) {
				return entry.weapon.uniqueKey === uniqueKey;
			});
			if (existing) return existing.instanceId;
			normalized.uniqueKey = uniqueKey;
		}
		const entry = {
			instanceId: options.instanceId || makeInstanceId(),
			weapon: normalized,
			rotation: normalizeRotation(options.rotation)
		};
		if (options.autoPlace) {
			const fit = findFirstFit(entry);
			if (fit) {
				entry.col = fit.col;
				entry.row = fit.row;
				entry.rotation = fit.rotation;
				state.placed.push(entry);
			} else {
				state.inventory.push(entry);
			}
		} else {
			state.inventory.push(entry);
		}
		persistState();
		renderAll();
		return entry.instanceId;
	};

	/** 按实例 ID 删除背包武器，并刷新存档和界面。 */
	const removeBackpackWeapon = function (instanceId) {
		readState();
		const exists = !!findEntry(instanceId);
		if (!exists) return false;
		removeEntryFromLists(instanceId);
		persistState();
		renderAll();
		return true;
	};

	/**
	 * 将魔塔道具表中的 backpackWeapon 配置转换成独立实例。
	 * 默认不去重：拾取或使用同类武器多次，就会得到多个实例。
	 */
	const addBackpackItem = function (itemId, options) {
		options = options || {};
		const item = core.material.items[itemId];
		if (!item || !item.backpackWeapon) {
			if (core.drawTip) core.drawTip("该道具没有配置背包物品");
			return null;
		}
		const weapon = mergeWeaponMetadata(itemId, item.backpackWeapon);
		weapon.sourceItemId = itemId;
		const instanceId = addBackpackWeapon(weapon, {
			rotation: options.rotation,
			autoPlace: options.autoPlace,
			uniqueKey: options.uniqueKey
		});
		if (options.open) openBackpack();
		return instanceId;
	};

	/**
	 * 对接旧存档及 core.addItem()：保证道具栏持有数量至少对应同数量的背包实例。
	 * @returns {number} 本次补建的实例数量。
	 */
	const syncBackpackItems = function () {
		readState();
		let added = 0;
		Object.keys(core.material.items || {}).forEach(function (itemId) {
			const item = core.material.items[itemId];
			if (!item || !item.backpackWeapon) return;
			const owned = core.itemCount(itemId);
			const existing = getAllEntries().filter(function (entry) {
				return entry.weapon.sourceItemId === itemId;
			}).length;
			for (let index = existing; index < owned; index++) {
				const weapon = normalizeWeapon(Object.assign(
					mergeWeaponMetadata(itemId, item.backpackWeapon),
					{ sourceItemId: itemId }
				));
				if (!weapon) break;
				state.inventory.push({
					instanceId: makeInstanceId(),
					weapon: weapon,
					rotation: 0
				});
				added++;
			}
		});
		if (added) persistState();
		renderAll();
		return added;
	};

	/** 兼容旧拖拽接口：创建新实例、加入库存并打开背包。 */
	const startDragWeapon = function (weapon, rotation) {
		const normalized = normalizeWeapon(weapon);
		if (!normalized) return null;
		const instanceId = addBackpackWeapon(normalized, {
			rotation: rotation
		});
		openBackpack();
		return instanceId;
	};

	// 公共界面 API：供状态栏道具、事件脚本和读档清理流程调用。
	this.openBackpack = openBackpack;
	this.closeBackpack = closeBackpack;

	// 公共配置对象：可在其他项目脚本中修改最大/初始行列。
	this.backpackConfig = CONFIG;

	/** 修改背包尺寸配置，随后迁移存档并刷新界面。 */
	this.configureBackpackGrid = function (options) {
		options = options || {};
		["maxCols", "maxRows", "initialCols", "initialRows"].forEach(function (key) {
			if (options[key] != null && Number.isFinite(Number(options[key]))) {
				CONFIG[key] = Math.max(1, Math.floor(Number(options[key])));
			}
		});
		readState();
		persistState();
		renderAll();
		return cloneData(getGridConfig());
	};

	/** 返回背包界面当前是否打开。 */
	this.isBackpackOpen = function () { return !!root; };

	/** 返回最新背包存档的安全副本。 */
	this.getBackpackState = function () {
		readState();
		return cloneData(state);
	};

	/** 返回独立武器系统计算后的已摆放武器属性。 */
	this.calculateBackpackAttributes = function (options) {
		readState();
		return cloneData(calculateBackpackAttributes(options));
	};
	// 旧名称兼容：联动计算与属性计算现在是同一个只读入口。
	this.evaluateBackpackSynergies = this.calculateBackpackAttributes;
	// 战斗系统兼容入口：返回背包提供的最终总攻击。
	this.getBackpackAttack = getBackpackAttack;

	/** 返回尺寸、已解锁格和扩容道具数量。 */
	this.getBackpackGridState = function () {
		readState();
		return {
			config: cloneData(getGridConfig()),
			unlockedCells: cloneData(state.unlockedCells),
			expansionItemId: CONFIG.expansionItemId,
			expansionItemCount: getExpansionItemCount()
		};
	};

	/** 公共扩容入口：读取最新状态后尝试消耗道具解锁坐标。 */
	this.unlockBackpackCell = function (col, row) {
		readState();
		return unlockBackpackCell(col, row);
	};

	// 状态栏显示有效攻击，但不改写 hero.atk；伤害公式中的假设攻击值仍由
	// functions.js 的 getDamageInfo/getEnemyInfo 单独接入，避免临界计算重复相加。
	if (!core.__backpackRealStatusWrapped && typeof core.getRealStatus === "function") {
		const originalGetRealStatus = core.getRealStatus;
		core.getRealStatus = function (name) {
			const value = originalGetRealStatus.apply(core, arguments);
			if (name === "atk" && core.status.hero && core.plugin && core.plugin.getBackpackAttack) {
				return value + core.plugin.getBackpackAttack();
			}
			return value;
		};
		core.__backpackRealStatusWrapped = true;
	}
	// 公共实例管理 API：分别支持通用定义、地图道具、旧存档同步、删除、整理和旧拖拽。
	this.addBackpackWeapon = addBackpackWeapon;
	this.addBackpackItem = addBackpackItem;
	this.syncBackpackItems = syncBackpackItems;
	this.removeBackpackWeapon = removeBackpackWeapon;
	this.autoArrangeBackpack = autoArrange;
	this.startDragWeapon = startDragWeapon;

	// 兼容已经写进 items.js 和状态栏中的旧接口。
	this.boxbar = openBackpack;
	this.closeBoxbar = closeBackpack;
	this.updateBackpack = renderAll;
}
}