/** 背包战斗：上方双方对战，下方兵装、操作、日志与实际伤害统计。 */
var createBackpackBattleUI_877f7cd8_53d6_448c_94ab_15ef82119bb2 = function (core, runtime) {
	"use strict";

	var registry = backpackBattleStatusDefinitions_7d94f05e_2f6d_4b8e_9c23_5a317ccab120;
	var common = backpackUiCommon_2c986f67_7621_44eb_972d_24f1e2c6ce61;
	var rules = backpackBattleRules_36e4a689_0f48_476f_92a7_1c12b3903e87;
	var root = null;
	var nodes = {};
	var weaponNodes = {};
	var statusIconNodes = {};
	var latestSnapshot = null;
	var unsubscribe = null;
	var resizeHandler = null;
	var boardObserver = null;
	var viewportObserver = null;
	var damageNodes = {};
	var logSignature = "";
	var playerPortraitSignature = "";
	var enemyPortraitSignature = "";
	var attackFeedback = null;
	var weaponFlightFeedback = null;
	var portraitAttackAge = -1;
	var delayedOpenTimer = null;
	var guideTour = null;
	var releaseGuideViewport = null;
	var guideStarted = false;
	var guideStartFrame = null;
	var guideLayoutFrame = null;
	var guideTargets = [];
	var guideResumeHandler = null;
	var INSTANT_OPEN_DELAY = 100;
	var gridLayout = null;
	var gridCellSize = 0;
	var SVG_NS = "http://www.w3.org/2000/svg";
	var XLINK_NS = "http://www.w3.org/1999/xlink";

	var format = function (value, digits) {
		return common.formatNumber(value, digits == null ? 1 : digits);
	};

	var isGuideBattle = function () {
		return !!(core.getFlag && core.getFlag("inGuide"))
			&& !(core.isReplaying && core.isReplaying());
	};

	/** 将所有状态矢量图形注册为当前战斗面板内的 SVG symbol，不再发起图标图片请求。 */
	var buildStatusSprite = function () {
		var sprite = document.createElementNS(SVG_NS, "svg");
		sprite.setAttribute("class", "bb-status-sprite");
		sprite.setAttribute("aria-hidden", "true");
		sprite.setAttribute("focusable", "false");
		var definitions = document.createElementNS(SVG_NS, "defs");
		(registry.order || []).forEach(function (statusId) {
			var definition = registry.definitions[statusId];
			if (!definition || !definition.iconSvg) return;
			var symbol = document.createElementNS(SVG_NS, "symbol");
			symbol.setAttribute("id", "bb-status-icon-" + statusId);
			symbol.setAttribute("viewBox", "0 0 64 64");
			// 图标配置是项目内可信静态数据；这里只在面板 build 时解析一次。
			symbol.innerHTML = definition.iconSvg;
			definitions.appendChild(symbol);
		});
		sprite.appendChild(definitions);
		root.appendChild(sprite);
	};

	/**
	 * 为一侧战斗单位一次性创建全部状态 SVG 槽位。
	 * 战斗帧渲染只更新这些节点的显隐、层数和 CD，不创建或销毁 DOM。
	 */
	var buildStatusNodes = function (container, sideKey) {
		var cached = statusIconNodes[sideKey] = {};
		(registry.order || []).forEach(function (statusId) {
			var definition = registry.definitions[statusId];
			if (!definition || !definition.iconSvg) return;
			var icon = document.createElement("button");
			icon.type = "button";
			icon.className = "bb-status";
			icon.hidden = true;
			icon.dataset.statusId = statusId;
			icon.style.color = definition.color;

			var svg = document.createElementNS(SVG_NS, "svg");
			svg.setAttribute("class", "bb-status-svg");
			svg.setAttribute("viewBox", "0 0 64 64");
			svg.setAttribute("aria-hidden", "true");
			svg.setAttribute("focusable", "false");
			var use = document.createElementNS(SVG_NS, "use");
			var symbolHref = "#bb-status-icon-" + statusId;
			use.setAttribute("href", symbolHref);
			use.setAttributeNS(XLINK_NS, "xlink:href", symbolHref);
			svg.appendChild(use);
			icon.appendChild(svg);

			var count = document.createElement("small");
			count.className = "bb-status-count";
			icon.appendChild(count);
			var cooldown = null;
			if (definition.periodic) {
				cooldown = document.createElement("i");
				cooldown.className = "bb-status-cd";
				icon.appendChild(cooldown);
			}
			container.appendChild(icon);

			common.bindTooltip(icon, function () {
				if (!latestSnapshot) return "";
				var currentSide = latestSnapshot[sideKey];
				if (!currentSide) return "";
				var combined = currentSide.buffs.concat(currentSide.debuffs);
				var current = null;
				for (var i = 0; i < combined.length; i++) {
					if (combined[i].id === statusId) { current = combined[i]; break; }
				}
				if (!current || current.stacks <= 0) return "";
				var remaining = definition.periodic
					? rules.getRoundRemainingTicks(latestSnapshot.tick) : 0;
				var description = definition.description(current.stacks, {
					remainingTicks: remaining,
					tick: latestSnapshot.tick
				});
				return common.buildStatusTooltip(definition, current.stacks, description, remaining);
			});
			cached[statusId] = { icon: icon, svg: svg, count: count, cooldown: cooldown };
		});
	};

	// 与背包使用相同的逻辑密度，显示边界始终贴合游戏画布。
	// 保留 body 下的独立弹层，保证教程解除 inert 后能点击“继续”。
	var syncBattleViewport = function () {
		if (!root) return;
		var outer = document.getElementById("outerUI") || document.getElementById("gameGroup");
		var rect = outer ? outer.getBoundingClientRect() : { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };
		var domStyle = core.domStyle || {};
		var vertical = typeof domStyle.isVertical === "boolean" ? domStyle.isVertical : rect.height > rect.width;
		var globalScale = Number(domStyle.scale) || 1;
		var scale = outer && domStyle.scale ? globalScale / (vertical ? 1 : 1.5) : 1;
		root.style.left = rect.left + "px";
		root.style.top = rect.top + "px";
		root.style.width = rect.width / scale + "px";
		root.style.height = rect.height / scale + "px";
		root.style.transform = "scale(" + scale + ")";
		root.dataset.mobile = vertical ? "true" : "false";
		root.dataset.narrow = rect.width / scale <= 1280 ? "true" : "false";
	};

	var build = function () {
		if (root) return;
		root = document.createElement("div");
		root.className = "bb-overlay bb-sky-battle weapon-ui-skin";
		root.dataset.mobile = core.domStyle && core.domStyle.isVertical ? "true" : "false";
		root.innerHTML = [
			"<section class='bb-panel' role='dialog' aria-label='背包乱斗战斗'>",
			"<header class='bb-topbar'><div class='bb-location'><button class='bb-button bb-exit' aria-label='退出本场战斗'>返回</button><div><strong class='bb-floor-name'>背包战斗</strong><small>背包兵装 · 自动战斗</small></div></div><div class='bb-battle-heading'><strong class='bb-battle-state'>战斗中</strong><time class='bb-elapsed'>00:00</time></div><span class='bb-top-note'>武器冷却完毕后自动攻击</span></header>",
			"<section class='bb-arena' aria-label='双方战况'>",
			"<div class='bb-weapon-flight-layer' aria-hidden='true'></div>",
			"<div class='bb-combatant-art player'><img class='bb-player-art' alt='' hidden><canvas class='bb-portrait bb-player-portrait' width='384' height='384' aria-label='当前勇士'></canvas><canvas class='bb-player-impact' width='384' height='384' aria-hidden='true' hidden></canvas></div>",
			"<div class='bb-combatant-art enemy'><canvas class='bb-portrait bb-enemy-portrait' width='384' height='384' aria-label='当前敌人'></canvas></div>",
			"<article class='bb-side player'><header class='bb-side-heading'><span class='bb-faction'>我方</span><div class='bb-side-name bb-player-name'></div></header><div class='bb-guide-player-stats'><div class='bb-hp-line'><span>生命</span><strong class='bb-player-hp-text'></strong></div><div class='bb-bar bb-player-hp'><i></i></div><div class='bb-side-meta bb-player-meta'></div></div><div class='bb-status-row'><span>状态</span><div class='bb-statuses bb-player-statuses'></div></div><div class='bb-guide-ultimates bb-ultimate-meter'><span>奥义</span><div class='bb-bar bb-ultimate-bar'><i></i></div><strong class='bb-ultimate-text'></strong></div></article>",
			"<article class='bb-side enemy'><header class='bb-side-heading'><span class='bb-faction'>敌方</span><div class='bb-side-name bb-enemy-name'></div></header><div class='bb-guide-enemy-data'><div class='bb-hp-line'><span>生命</span><strong class='bb-enemy-hp-text'></strong></div><div class='bb-bar bb-enemy-hp'><i></i></div><div class='bb-side-meta bb-enemy-meta'></div><div class='bb-status-row'><span>状态</span><div class='bb-statuses bb-enemy-statuses'></div></div></div><div class='bb-enemy-ultimate bb-ultimate-meter'><span>奥义</span><div class='bb-bar bb-enemy-ultimate-bar'><i></i></div><strong class='bb-enemy-ultimate-text'></strong></div></article>",
			"<div class='bb-enemy-action'>",
			"<svg class='bb-action-ring' viewBox='0 0 160 160' aria-hidden='true' focusable='false'>",
			"<defs><linearGradient id='bb-dial-metal' x1='0' y1='0' x2='1' y2='1'><stop stop-color='#fff0bb'/><stop offset='.22' stop-color='#d48264'/><stop offset='.5' stop-color='#773d43'/><stop offset='.76' stop-color='#ec9a75'/><stop offset='1' stop-color='#9b4f4d'/></linearGradient><linearGradient id='bb-dial-charge' x1='0' y1='1' x2='1' y2='0'><stop stop-color='#ffe3a1'/><stop offset='.45' stop-color='#ffb578'/><stop offset='1' stop-color='#e9685d'/></linearGradient><radialGradient id='bb-dial-face' cx='.36' cy='.28' r='.8'><stop stop-color='#36445b' stop-opacity='.95'/><stop offset='1' stop-color='#18283e' stop-opacity='.98'/></radialGradient></defs>",
			"<circle class='bb-action-rim-shadow' cx='80' cy='80' r='73'/><circle class='bb-action-face' cx='80' cy='80' r='70'/><circle class='bb-action-rim' cx='80' cy='80' r='73'/><circle class='bb-action-rim-inner' cx='80' cy='80' r='69'/><circle class='bb-action-ticks' cx='80' cy='80' r='71' pathLength='100'/>",
			"<circle class='bb-action-track' cx='80' cy='80' r='62'/><circle class='bb-action-progress' cx='80' cy='80' r='62' pathLength='100' transform='rotate(90 80 80)'/><circle class='bb-action-inner-line' cx='80' cy='80' r='57'/>",
			"<path class='bb-action-accents' d='M9 80h14m114 0h14M80 137v14M29 29l5 5m92 92 5 5M29 131l5-5m92-92 5-5'/><path class='bb-action-crest' d='M66 9 80 3 94 9 90 22 80 35 70 22Z'/><path class='bb-action-crest-facet' d='m80 8 5 12-5 9-5-9Z'/><path class='bb-action-crest-light' d='m80 8-5 12 5 9'/>",
			"<g class='bb-action-pointer'><path class='bb-action-pointer-tail' d='M80 134v18'/><path class='bb-action-pointer-gem' d='m80 136 4 8-4 9-4-9Z'/><circle class='bb-action-pointer-light' cx='80' cy='142' r='1.7'/></g></svg>",
			"<span class='bb-enemy-action-label'>敌方下次攻击</span><strong class='bb-enemy-action-text'></strong><span class='bb-enemy-action-caption' aria-hidden='true'>倒计时</span><div class='bb-bar bb-enemy-action-bar'><i></i></div></div>",
			"</section><div class='bb-workspace'>",
			"<section class='bb-arsenal'><div class='bb-arsenal-title'>当前背包兵装 <small class='bb-weapon-count'></small></div><div class='bb-weapon-board'><div class='bb-weapon-stage'><div class='bb-synergy-layer'></div></div><div class='bb-weapon-empty'>尚未摆放武器</div></div></section>",
			"<section class='bb-operations'><h2>战斗操作</h2><div class='bb-controls'><div class='bb-guide-speed'><span class='bb-speed-label'>战速</span>",
			"<button class='bb-button bb-speed' data-speed='0.25'>0.25×</button><button class='bb-button bb-speed' data-speed='0.5'>0.5×</button><button class='bb-button bb-speed' data-speed='1'>1×</button><button class='bb-button bb-speed' data-speed='2'>2×</button><button class='bb-button bb-speed' data-speed='3'>3×</button><button class='bb-button bb-speed' data-speed='10'>10×</button>",
			"<select class='bb-speed-select' aria-label='战斗速度'><option value='0.25'>0.25×</option><option value='0.5'>0.5×</option><option value='1'>1×</option><option value='2'>2×</option><option value='3'>3×</option><option value='10'>10×</option></select>",
			"</div><button class='bb-button bb-pause'>暂停战斗</button><button class='bb-button bb-fast'>立即</button></div></section>",
			"<section class='bb-log'><div class='bb-log-heading'><button type='button' class='bb-log-toggle' aria-expanded='true'>战斗日志 ▾</button><select class='bb-log-filter' aria-label='筛选战斗日志'><option value='all'>全部</option><option value='damage'>伤害</option><option value='heal'>治疗</option><option value='status'>状态</option><option value='ultimate'>奥义</option></select></div><div class='bb-log-list'></div></section>",
			"<section class='bb-damage'><header class='bb-damage-heading'><h2>DPS 统计</h2><span>总 DPS <strong class='bb-total-dps'>0</strong></span></header><div class='bb-damage-list'></div><small class='bb-damage-note'>累计伤害 / 战斗秒数 · 右侧为伤害占比</small></section>",
			"</div></section>"
		].join("");
		document.body.appendChild(root);
		syncBattleViewport();
		root.querySelectorAll(".bb-arsenal,.bb-side,.bb-operations,.bb-log,.bb-damage").forEach(function (panel) {
			common.decorateWeaponSurface(panel, { radius: 18, ornate: true });
		});
		root.querySelectorAll(".bb-button").forEach(function (button) {
			common.decorateWeaponSurface(button, { button: true, gold: button.classList.contains("bb-fast") });
		});
		nodes.damageList = root.querySelector(".bb-damage-list");
		nodes.totalDps = root.querySelector(".bb-total-dps");
		nodes.elapsed = root.querySelector(".bb-elapsed");
		nodes.battleState = root.querySelector(".bb-battle-state");
		nodes.logFilter = root.querySelector(".bb-log-filter");
		nodes.actionRing = root.querySelector(".bb-action-progress");
		nodes.actionPointer = root.querySelector(".bb-action-pointer");
		nodes.playerArt = root.querySelector(".bb-player-art");
		nodes.playerFigure = root.querySelector(".bb-combatant-art.player");
		nodes.playerImpact = root.querySelector(".bb-player-impact");
		attackFeedback = createBackpackBattleFeedback_245cd186_8d73_4ad6_8e23_114d7eaf0d89(core, nodes.playerImpact, function (age, recoil) {
			portraitAttackAge = age;
			nodes.playerFigure.style.setProperty("--bb-player-recoil", (recoil * 3).toFixed(2) + "px");
			nodes.playerFigure.style.setProperty("--bb-player-brightness", (1 + recoil * .35).toFixed(3));
			if (latestSnapshot && nodes.enemyPortrait) drawPortraits(latestSnapshot);
		});
		nodes.weaponBoard = root.querySelector(".bb-weapon-board");
		nodes.weaponStage = root.querySelector(".bb-weapon-stage");
		nodes.gridLayer = document.createElement("div");
		nodes.gridLayer.className = "bb-grid-layer";
		nodes.gridLayer.setAttribute("aria-hidden", "true");
		nodes.weaponStage.insertBefore(nodes.gridLayer, nodes.weaponStage.firstChild);
		nodes.synergyLayer = root.querySelector(".bb-synergy-layer");
		nodes.weaponEmpty = root.querySelector(".bb-weapon-empty");
		nodes.weaponCount = root.querySelector(".bb-weapon-count");
		nodes.playerPortrait = root.querySelector(".bb-player-portrait");
		nodes.enemyPortrait = root.querySelector(".bb-enemy-portrait");
		nodes.weaponFlightLayer = root.querySelector(".bb-weapon-flight-layer");
		weaponFlightFeedback = createBackpackWeaponFlightFeedback(nodes.weaponFlightLayer, getWeaponFlightLayout, function (weapon, size) {
			// 复用武器的透明裁剪和等比缩放，飞行时不携带棋盘底格、倒计时。
			var flyingWeapon = Object.assign({}, weapon, { rotation: 0 });
			var bounds = getBounds(normalizeCells(weapon.baseCells || weapon.cells));
			var cellSize = size / Math.max(bounds.cols, bounds.rows);
			var art = createArt(flyingWeapon, cellSize, "bb-weapon-flight").element;
			art.style.width = bounds.cols * cellSize + "px";
			art.style.height = bounds.rows * cellSize + "px";
			art.dataset.weaponId = weapon.instanceId;
			return art;
		}, function (damage, weaponId) {
			var number = document.createElement("span");
			number.className = "bb-hit-damage";
			number.dataset.weaponId = weaponId;
			number.textContent = format(damage, 3);
			return number;
		});
		nodes.playerName = root.querySelector(".bb-player-name");
		nodes.playerHpText = root.querySelector(".bb-player-hp-text");
		nodes.playerHp = root.querySelector(".bb-player-hp i");
		nodes.playerMeta = root.querySelector(".bb-player-meta");
		nodes.playerStatuses = root.querySelector(".bb-player-statuses");
		nodes.enemyName = root.querySelector(".bb-enemy-name");
		nodes.enemyHpText = root.querySelector(".bb-enemy-hp-text");
		nodes.enemyHp = root.querySelector(".bb-enemy-hp i");
		nodes.enemyMeta = root.querySelector(".bb-enemy-meta");
		nodes.enemyStatuses = root.querySelector(".bb-enemy-statuses");
		nodes.ultimateText = root.querySelector(".bb-ultimate-text");
		nodes.ultimateBar = root.querySelector(".bb-ultimate-bar i");
		nodes.enemyUltimateText = root.querySelector(".bb-enemy-ultimate-text");
		nodes.enemyUltimateBar = root.querySelector(".bb-enemy-ultimate-bar i");
		nodes.enemyActionText = root.querySelector(".bb-enemy-action-text");
		nodes.enemyActionBar = root.querySelector(".bb-enemy-action-bar i");
		nodes.logSection = root.querySelector(".bb-log");
		nodes.logToggle = root.querySelector(".bb-log-toggle");
		nodes.log = root.querySelector(".bb-log-list");
		nodes.pause = root.querySelector(".bb-pause");
		nodes.speedSelect = root.querySelector(".bb-speed-select");
		nodes.fast = root.querySelector(".bb-fast");
		var exitBattle = function () {
			if (!runtime.stop || runtime.stop("用户退出战斗弹层") === false) close();
		};
		root.querySelector(".bb-exit").onclick = exitBattle;
		nodes.logFilter.onchange = function () { if (latestSnapshot) renderLog(latestSnapshot, true); };
		var careerSelect = core.plugin && core.plugin.careerSelect;
		var careerId = core.getFlag && core.getFlag("kaiju");
		var career = careerSelect && careerSelect.getCareers().find(function (item) { return item.id === careerId; });
		if (career && career.portrait) {
			var playerArt = nodes.playerArt;
			playerArt.onload = function () {
				if (nodes.playerArt !== playerArt) return;
				playerArt.hidden = false; nodes.playerPortrait.hidden = true;
			};
			common.setWeaponImageSource(nodes.playerArt, "project/images/" + career.portrait);
		}
		if (common.registerModal) {
			common.registerModal(root, function () {
				if (!runtime.stop || runtime.stop("用户按 Esc 关闭战斗弹层") === false) close();
			}, { name: "backpack-battle", viewport: false });
		}
		buildStatusSprite();
		buildStatusNodes(nodes.playerStatuses, "player");
		buildStatusNodes(nodes.enemyStatuses, "enemy");

		nodes.pause.onclick = function () {
			if (!latestSnapshot) return;
			if (latestSnapshot.paused) runtime.resume();
			else runtime.pause();
		};
		root.querySelectorAll(".bb-speed").forEach(function (button) {
			button.onclick = function () {
				if (typeof runtime.setPreferredSpeed === "function") {
					runtime.setPreferredSpeed(Number(button.dataset.speed));
				} else runtime.setSpeed(Number(button.dataset.speed));
			};
		});
		nodes.speedSelect.onchange = function () {
			var speed = Number(nodes.speedSelect.value);
			if (typeof runtime.setPreferredSpeed === "function") runtime.setPreferredSpeed(speed);
			else runtime.setSpeed(speed);
		};
		nodes.fast.onclick = function () {
			if (typeof runtime.setPreferredSpeed === "function") runtime.setPreferredSpeed("instant");
			else runtime.fastForward();
		};
		nodes.logToggle.onclick = function () {
			var collapsed = nodes.logSection.classList.toggle("collapsed");
			nodes.logToggle.setAttribute("aria-expanded", collapsed ? "false" : "true");
			nodes.logToggle.textContent = collapsed ? "战斗日志 ▸" : "战斗日志 ▾";
		};
		root.addEventListener("contextmenu", function (event) { event.preventDefault(); });
		resizeHandler = function () {
			syncBattleViewport();
			if (latestSnapshot && root) renderWeapons(latestSnapshot, true);
			if (weaponFlightFeedback) weaponFlightFeedback.refresh();
			syncGuideTargets();
		};
		window.addEventListener("resize", resizeHandler);
		if (core.registerResize) core.registerResize("backpackBattleViewport", resizeHandler);
		if (typeof ResizeObserver !== "undefined") {
			boardObserver = new ResizeObserver(function () { if (root && latestSnapshot) renderWeapons(latestSnapshot, true); });
			boardObserver.observe(nodes.weaponBoard);
			var viewport = document.getElementById("outerUI") || document.getElementById("gameGroup");
			if (viewport) {
				viewportObserver = new ResizeObserver(resizeHandler);
				viewportObserver.observe(viewport);
			}
		}
		if (nodes.pause && nodes.pause.focus) nodes.pause.focus();
	};

	var normalizeCells = function (cells) {
		if (!Array.isArray(cells) || !cells.length) return [[0, 0]];
		var clean = cells.map(function (cell) {
			return [Math.floor(Number(cell[0]) || 0), Math.floor(Number(cell[1]) || 0)];
		});
		var minX = Math.min.apply(null, clean.map(function (cell) { return cell[0]; }));
		var minY = Math.min.apply(null, clean.map(function (cell) { return cell[1]; }));
		return clean.map(function (cell) { return [cell[0] - minX, cell[1] - minY]; });
	};

	var rotateCells = function (cells, rotation) {
		var result = normalizeCells(cells);
		var turns = ((Math.round((Number(rotation) || 0) / 90) % 4) + 4) % 4;
		for (var turn = 0; turn < turns; turn++) {
			var maxY = Math.max.apply(null, result.map(function (cell) { return cell[1]; }));
			result = normalizeCells(result.map(function (cell) { return [maxY - cell[1], cell[0]]; }));
		}
		return result;
	};

	var getBounds = function (cells) {
		return {
			cells: cells,
			cols: Math.max.apply(null, cells.map(function (cell) { return cell[0]; })) + 1,
			rows: Math.max.apply(null, cells.map(function (cell) { return cell[1]; })) + 1
		};
	};

	// 只裁去未解锁的外圈；不规则扩容中的空洞也不绘制格子。
	var getBattleGridLayout = function (gridState, weapons) {
		var cells = [];
		var unlocked = Object.create(null);
		var addCell = function (col, row) {
			col = Number(col); row = Number(row);
			if (!Number.isInteger(col) || !Number.isInteger(row) || col < 0 || row < 0) return;
			var key = col + "," + row;
			if (unlocked[key]) return;
			unlocked[key] = true;
			cells.push([col, row]);
		};
		(gridState && gridState.unlockedCells || []).forEach(function (cell) {
			if (Array.isArray(cell)) addCell(cell[0], cell[1]);
		});
		// 独立战斗预览没有背包存档时，以武器实际占格作为显示范围。
		if (!cells.length) (weapons || []).forEach(function (weapon) {
			rotateCells(weapon.baseCells || weapon.cells, weapon.rotation).forEach(function (cell) {
				addCell((Number(weapon.col) || 0) + cell[0], (Number(weapon.row) || 0) + cell[1]);
			});
		});
		var minCol = cells.length ? Math.min.apply(null, cells.map(function (cell) { return cell[0]; })) : 0;
		var minRow = cells.length ? Math.min.apply(null, cells.map(function (cell) { return cell[1]; })) : 0;
		return {
			cells: cells, unlocked: unlocked, minCol: minCol, minRow: minRow,
			cols: cells.length ? Math.max.apply(null, cells.map(function (cell) { return cell[0]; })) - minCol + 1 : 1,
			rows: cells.length ? Math.max.apply(null, cells.map(function (cell) { return cell[1]; })) - minRow + 1 : 1
		};
	};

	var BATTLE_IMAGE_INSET_CELLS = 0.12;

	var createArt = function (weapon, cellSize, className) {
		var baseCells = normalizeCells(weapon.baseCells || weapon.cells);
		var baseBounds = getBounds(baseCells);
		var rotation = ((Math.round((Number(weapon.rotation) || 0) / 90) % 4) + 4) % 4 * 90;
		var bounds = getBounds(rotateCells(baseCells, rotation));
		var baseWidth = baseBounds.cols * cellSize;
		var baseHeight = baseBounds.rows * cellSize;
		// 与背包、商店一致：图片和格子边缘留出固定比例的距离，同时保证图片框始终为正尺寸。
		var imageInset = Math.min(
			cellSize * BATTLE_IMAGE_INSET_CELLS,
			Math.max(0, (baseWidth - 1) / 2),
			Math.max(0, (baseHeight - 1) / 2)
		);
		var frameWidth = baseWidth - imageInset * 2;
		var frameHeight = baseHeight - imageInset * 2;
		var art = document.createElement("div");
		art.className = "bb-art " + className;
		var frame = document.createElement("div");
		frame.className = "bb-art-frame";
		frame.dataset.insetCells = String(BATTLE_IMAGE_INSET_CELLS);
		frame.style.width = frameWidth + "px";
		frame.style.height = frameHeight + "px";
		frame.style.transformOrigin = "0 0";
		var image = document.createElement("img");
		image.alt = weapon.name || "武器";
		image.draggable = false;
		common.setWeaponImageSource(image, weapon.image || "");
		var crop = weapon.imageCrop;
		if (Array.isArray(crop) && crop.length >= 6 && crop[2] > 0 && crop[3] > 0) {
			// 完整图片和裁剪区域共用同一个缩放值，禁止横纵轴分别拉伸。
			var uniformScale = Math.min(frameWidth / crop[2], frameHeight / crop[3]);
			var displayedCropWidth = crop[2] * uniformScale;
			var displayedCropHeight = crop[3] * uniformScale;
			image.style.width = (crop[4] * uniformScale) + "px";
			image.style.height = (crop[5] * uniformScale) + "px";
			image.style.left = ((frameWidth - displayedCropWidth) / 2 - crop[0] * uniformScale) + "px";
			image.style.top = ((frameHeight - displayedCropHeight) / 2 - crop[1] * uniformScale) + "px";
		} else {
			image.style.width = frameWidth + "px";
			image.style.height = frameHeight + "px";
		}
		frame.appendChild(image);
		if (rotation === 90) {
			frame.style.left = (bounds.cols * cellSize - imageInset) + "px";
			frame.style.top = imageInset + "px";
			frame.style.transform = "rotate(90deg)";
		} else if (rotation === 180) {
			frame.style.left = (bounds.cols * cellSize - imageInset) + "px";
			frame.style.top = (bounds.rows * cellSize - imageInset) + "px";
			frame.style.transform = "rotate(180deg)";
		} else if (rotation === 270) {
			frame.style.left = imageInset + "px";
			frame.style.top = (bounds.rows * cellSize - imageInset) + "px";
			frame.style.transform = "rotate(270deg)";
		} else {
			frame.style.left = imageInset + "px";
			frame.style.top = imageInset + "px";
		}
		art.appendChild(frame);
		bounds.cells.forEach(function (cell) {
			var outline = document.createElement("span");
			outline.className = "bb-art-cell";
			outline.style.left = (cell[0] * cellSize) + "px";
			outline.style.top = (cell[1] * cellSize) + "px";
			outline.style.width = cellSize + "px";
			outline.style.height = cellSize + "px";
			art.appendChild(outline);
		});
		return { element: art, bounds: bounds };
	};

	var getWeaponTooltipHtml = function (instanceId) {
		if (!latestSnapshot) return "";
		var weapon = latestSnapshot.weapons.find(function (candidate) { return candidate.instanceId === instanceId; });
		if (!weapon) return "";
		var attributes = weapon.attributes || {};
		var interval = Math.max(0, Number(weapon.effectiveIntervalTicks) || 0);
		var remaining = Math.max(0, interval - (Number(weapon.cooldownTicks) || 0));
		return common.buildWeaponTooltip({
			weapon: weapon,
			base: {
				minAttack: attributes.baseMinAttack,
				maxAttack: attributes.baseMaxAttack,
				hitRate: attributes.baseHitRate,
				attackInterval: attributes.baseAttackInterval,
				ultimateGain: attributes.baseUltimateGain
			},
			current: attributes,
			effectiveInterval: interval / 100,
			cooldown: { remainingTicks: remaining }
		});
	};

	var clearWeaponSynergy = function () {
		if (nodes.synergyLayer) nodes.synergyLayer.innerHTML = "";
	};

	var renderWeaponSynergy = function (instanceId) {
		clearWeaponSynergy();
		if (!latestSnapshot || !nodes.synergyLayer) return;
		var weapon = latestSnapshot.weapons.find(function (candidate) {
			return candidate.instanceId === instanceId;
		});
		var weaponNode = weaponNodes[instanceId];
		if (!weapon || !weaponNode) return;
		(weapon.synergyCells || []).forEach(function (affectedCell) {
			var col = Math.floor(Number(affectedCell.col));
			var row = Math.floor(Number(affectedCell.row));
			if (!gridLayout || !gridLayout.unlocked[col + "," + row]) return;
			var cell = document.createElement("span");
			cell.className = "bb-synergy-cell";
			cell.style.left = ((col - gridLayout.minCol) * weaponNode.cellSize) + "px";
			cell.style.top = ((row - gridLayout.minRow) * weaponNode.cellSize) + "px";
			cell.style.width = weaponNode.cellSize + "px";
			cell.style.height = weaponNode.cellSize + "px";
			cell.setAttribute("aria-hidden", "true");
			var arrowDirections = affectedCell.arrowDirections && affectedCell.arrowDirections.length
				? affectedCell.arrowDirections
				: (affectedCell.directions || ["right"]);
			arrowDirections.forEach(function (direction) {
				var arrows = document.createElement("i");
				arrows.className = "bb-synergy-arrows direction-" + direction;
				cell.appendChild(arrows);
			});
			nodes.synergyLayer.appendChild(cell);
		});
	};

	var renderWeapons = function (snapshot, forceRebuild) {
		if (forceRebuild) clearWeaponSynergy();
		var boardWidth = nodes.weaponBoard.clientWidth;
		var boardHeight = nodes.weaponBoard.clientHeight;
		// 战斗期间占格不会改变；每场只读取一次背包，避免每帧克隆整个背包状态。
		if (!gridLayout) {
			var gridState = core.plugin && core.plugin.getBackpackGridState && core.plugin.getBackpackGridState();
			gridLayout = getBattleGridLayout(gridState, snapshot.weapons);
		}
		var cellSize = Math.max(6, Math.floor(Math.min((boardWidth - 4) / gridLayout.cols, (boardHeight - 4) / gridLayout.rows)));
		var stageWidth = cellSize * gridLayout.cols;
		var stageHeight = cellSize * gridLayout.rows;
		nodes.weaponStage.style.width = stageWidth + "px";
		nodes.weaponStage.style.height = stageHeight + "px";
		nodes.weaponStage.style.left = Math.max(0, Math.floor((boardWidth - stageWidth) / 2)) + "px";
		nodes.weaponStage.style.top = Math.max(0, Math.floor((boardHeight - stageHeight) / 2)) + "px";
		if (gridCellSize !== cellSize) {
			nodes.gridLayer.innerHTML = "";
			gridLayout.cells.forEach(function (cell) {
				var tile = document.createElement("span");
				tile.className = "bb-grid-cell";
				tile.style.left = ((cell[0] - gridLayout.minCol) * cellSize) + "px";
				tile.style.top = ((cell[1] - gridLayout.minRow) * cellSize) + "px";
				tile.style.width = tile.style.height = (cellSize + 1) + "px";
				nodes.gridLayer.appendChild(tile);
			});
			gridCellSize = cellSize;
		}
		nodes.weaponCount.textContent = snapshot.weapons.length + " 件";
		nodes.weaponEmpty.style.display = snapshot.weapons.length ? "none" : "grid";

		var activeIds = {};
		snapshot.weapons.forEach(function (weapon) {
			activeIds[weapon.instanceId] = true;
			var node = weaponNodes[weapon.instanceId];
			if (!node || forceRebuild || node.cellSize !== cellSize) {
				if (node && node.root.parentNode) node.root.remove();
				var baseCells = normalizeCells(weapon.baseCells || weapon.cells);
				var bounds = getBounds(rotateCells(baseCells, weapon.rotation));
				var unit = document.createElement("div");
				unit.className = "bb-weapon-unit";
				unit.tabIndex = 0;
				unit.setAttribute("aria-label", weapon.name || "武器");
				unit.style.width = (bounds.cols * cellSize) + "px";
				unit.style.height = (bounds.rows * cellSize) + "px";
				var muted = createArt(weapon, cellSize, "muted");
				var color = createArt(weapon, cellSize, "color");
				var cdText = document.createElement("span");
				cdText.className = "bb-weapon-cd-text";
				unit.appendChild(muted.element);
				unit.appendChild(color.element);
				bounds.cells.forEach(function (cell) {
					var hitCell = document.createElement("span");
					hitCell.className = "bb-weapon-hit-cell";
					hitCell.style.left = (cell[0] * cellSize) + "px";
					hitCell.style.top = (cell[1] * cellSize) + "px";
					hitCell.style.width = cellSize + "px";
					hitCell.style.height = cellSize + "px";
					unit.appendChild(hitCell);
				});
				unit.appendChild(cdText);
				nodes.weaponStage.appendChild(unit);
				node = weaponNodes[weapon.instanceId] = {
					root: unit,
					color: color.element,
					cdText: cdText,
					cellSize: cellSize,
					attackSequence: -1
				};
				(function (instanceId) {
					common.bindTooltip(unit, function () { return getWeaponTooltipHtml(instanceId); }, {
						hitTargets: unit.querySelectorAll(".bb-weapon-hit-cell"),
						onEnter: function () { renderWeaponSynergy(instanceId); },
						onLeave: clearWeaponSynergy
					});
				})(weapon.instanceId);
			}
			node.root.style.left = (((Number(weapon.col) || 0) - gridLayout.minCol) * cellSize) + "px";
			node.root.style.top = (((Number(weapon.row) || 0) - gridLayout.minRow) * cellSize) + "px";
			var canAttack = Number(weapon.effectiveIntervalTicks) > 0;
			var progress = Math.max(0, Math.min(1, Number(weapon.cooldownProgress) || 0));
			// 无法攻击的武器（间隔为 null）：彩色层完整显示（图案不灰暗）、常亮、且不显示 0s 倒计时。
			if (canAttack) {
				node.color.style.clipPath = "inset(" + ((1 - progress) * 100) + "% 0 0 0)";
			} else {
				node.color.style.clipPath = "";
			}
			node.root.classList.toggle("ready", canAttack ? progress >= 0.999 : true);
			if (canAttack) {
				var remainingSeconds = Math.max(0, ((Number(weapon.effectiveIntervalTicks) || 0) - (Number(weapon.cooldownTicks) || 0)) / 100);
				node.cdText.textContent = format(remainingSeconds, 1) + "s";
			} else {
				node.cdText.textContent = "";
			}
			if (node.attackSequence !== -1 && node.attackSequence !== weapon.attackSequence) {
				node.root.classList.remove("firing");
				void node.root.offsetWidth;
				node.root.classList.add("firing");
			}
			node.attackSequence = weapon.attackSequence;
		});

		Object.keys(weaponNodes).forEach(function (instanceId) {
			if (activeIds[instanceId]) return;
			weaponNodes[instanceId].root.remove();
			delete weaponNodes[instanceId];
		});
	};

	var getWeaponFlightLayout = function () {
		var layer = nodes.weaponFlightLayer;
		if (!layer || !layer.clientWidth || !layer.clientHeight) return null;
		var rect = layer.getBoundingClientRect();
		if (!rect.width || !rect.height) return null;
		var scaleX = rect.width / layer.clientWidth, scaleY = rect.height / layer.clientHeight;
		var player = nodes.playerArt.hidden ? nodes.playerPortrait : nodes.playerArt;
		var playerRect = player.getBoundingClientRect(), enemyRect = nodes.enemyPortrait.getBoundingClientRect();
		var aspect = player.naturalWidth && player.naturalHeight ? player.naturalWidth / player.naturalHeight : 1;
		var playerHeight = Math.min(playerRect.height, playerRect.width / aspect);
		var enemySize = Math.min(enemyRect.width, enemyRect.height);
		var info = core.getBlockInfo && latestSnapshot ? core.getBlockInfo(latestSnapshot.enemy.id) : null;
		var frame = getEnemyPortraitFrame(info, 0);
		var enemyHeight = enemySize * .94 * (frame ? Math.min(1, frame.sh / frame.sw) : 1);
		var mobile = root.dataset.mobile === "true", size = mobile ? 52 : 84;
		return {
			start: { x: (playerRect.left + playerRect.width / 2 - rect.left) / scaleX,
				y: (playerRect.bottom - playerHeight * .52 - rect.top) / scaleY },
			spread: { x: Math.min(130, playerRect.width * .46 / scaleX), y: Math.min(110, playerHeight * .42 / scaleY) },
			// 横屏从左侧状态卡右边开始散开；竖屏不落到人物下方的状态卡中。
			spawnBounds: { minX: mobile ? 0 : (playerRect.left + playerRect.width * .15 - rect.left) / scaleX + size * .65,
				maxY: (playerRect.bottom - rect.top) / scaleY - size * .4 },
			width: layer.clientWidth, height: layer.clientHeight,
			end: { x: (enemyRect.left + enemyRect.width / 2 - rect.left) / scaleX,
				y: (enemyRect.bottom - enemySize * 4 / 384 - enemyHeight * .5 - rect.top) / scaleY },
			size: size
		};
	};

	var drawContain = function (ctx, image, sx, sy, sw, sh) {
		if (!image || !sw || !sh) return;
		var size = ctx.canvas.width;
		var maxSize = size * .94;
		var scale = Math.min(maxSize / sw, maxSize / sh);
		var width = sw * scale;
		var height = sh * scale;
		ctx.drawImage(image, sx, sy, sw, sh, (size - width) / 2, size - height - 4, width, height);
	};

	/** 帧索引只读取战斗 Tick；暂停不推进，普通素材只切横向帧，大图保留朝向。 */
	var getEnemyPortraitFrame = function (info, tick) {
		if (!info) return null;
		var image = info.bigImage || info.image;
		if (!image || !image.width || !image.height) return null;
		var frameCount = Math.max(1, Math.floor(Number(info.animate) || (info.bigImage ? 4 : 1)));
		frameCount = Math.min(frameCount, info.bigImage ? 4 : Math.max(1, Math.floor(image.width / 32)));
		var frameMilliseconds = Math.max(80, Number(core.values && core.values.animateSpeed) || 300);
		var index = Math.floor(Math.max(0, tick) * 10 / frameMilliseconds) % frameCount;
		if (info.bigImage) {
			var frame = core.maps && core.maps._getBigImageInfo && core.maps._getBigImageInfo(image, info.face, index);
			if (!frame) {
				// 预览环境缺少引擎方法时，仍按引擎的 1×4 / 4×4 图集约定切单帧。
				var width = image.width / 4, height = image.height / 4;
				var directions = { down: 0, left: 1, right: 2, up: 3 };
				var row = directions[info.face] || 0;
				if (height <= width / 2) { height = image.height; row = 0; }
				frame = { sx: index * width, sy: row * height, per_width: width, per_height: height };
			}
			return { image: image, sx: frame.sx, sy: frame.sy, sw: frame.per_width, sh: frame.per_height };
		}
		var column = frameCount > 1 && info.cls !== "tileset" ? index : info.posX || 0;
		var spriteHeight = info.height || 32;
		return { image: image, sx: 32 * column, sy: spriteHeight * (info.posY || 0), sw: 32, sh: spriteHeight };
	};

	var getEnemyPortraitTransform = function (tick, lastAttackTick, visualAttackAge) {
		var breath = (1 - Math.cos(tick * Math.PI / 120)) / 2;
		var attackAge = Number.isFinite(lastAttackTick) && lastAttackTick >= 0 ? tick - lastAttackTick : -1;
		if (visualAttackAge != null) attackAge = visualAttackAge;
		var lunge = attackAge >= 0 && attackAge < 3 ? attackAge / 3
			: attackAge >= 3 && attackAge < 15 ? Math.pow(1 - (attackAge - 3) / 12, 2) : 0;
		return "translate(calc(var(--bb-enemy-lunge) * " + (-lunge).toFixed(4) + "), "
			+ (-breath * 2 - lunge).toFixed(3) + "px) scale("
			+ (1 + breath * .008 + lunge * .01).toFixed(4) + ", " + (1 + breath * .018).toFixed(4) + ")";
	};

	var drawPortraits = function (snapshot) {
		var heroImage = core.material && core.material.images && core.material.images.hero;
		var heroSignature = [heroImage && heroImage.src, heroImage && heroImage.width, heroImage && heroImage.height].join("|");
		if (heroSignature !== playerPortraitSignature) {
			playerPortraitSignature = heroSignature;
			var playerContext = nodes.playerPortrait.getContext("2d");
			playerContext.clearRect(0, 0, playerContext.canvas.width, playerContext.canvas.height);
			playerContext.imageSmoothingEnabled = false;
			if (heroImage && heroImage.width && heroImage.height) {
				drawContain(playerContext, heroImage, 0, 0, heroImage.width / 4, heroImage.height / 4);
			}
		}
		var reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		var tick = reducedMotion || snapshot.fastForwarding ? 0 : snapshot.tick;
		nodes.enemyPortrait.style.transform = reducedMotion || snapshot.fastForwarding ? "none"
			: getEnemyPortraitTransform(tick, null, portraitAttackAge);
		var info = core.getBlockInfo ? core.getBlockInfo(snapshot.enemy.id) : null;
		var frame = getEnemyPortraitFrame(info, tick);
		var signature = frame ? [snapshot.enemy.id, frame.image.src, frame.image.width, frame.image.height,
			frame.sx, frame.sy, frame.sw, frame.sh].join("|") : "empty";
		if (signature === enemyPortraitSignature) return;
		enemyPortraitSignature = signature;
		var enemyContext = nodes.enemyPortrait.getContext("2d");
		enemyContext.clearRect(0, 0, enemyContext.canvas.width, enemyContext.canvas.height);
		enemyContext.imageSmoothingEnabled = false;
		if (frame) drawContain(enemyContext, frame.image, frame.sx, frame.sy, frame.sw, frame.sh);
	};

	var renderStatuses = function (sideKey, side, snapshot) {
		var cached = statusIconNodes[sideKey];
		if (!cached) return;
		var statuses = {};
		side.buffs.concat(side.debuffs).forEach(function (status) {
			if (status && status.stacks > 0) statuses[status.id] = status;
		});
		(registry.order || []).forEach(function (statusId) {
			var node = cached[statusId];
			if (!node) return;
			var status = statuses[statusId];
			node.icon.hidden = !status;
			if (!status) return;
			var definition = registry.definitions[statusId];
			var remaining = definition.periodic ? rules.getRoundRemainingTicks(snapshot.tick) : 0;
			node.icon.setAttribute("aria-label", definition.name + " " + status.stacks + "层；"
				+ definition.description(status.stacks, { remainingTicks: remaining, tick: snapshot.tick }));
			node.count.textContent = format(status.stacks, 1);
			if (node.cooldown) node.cooldown.style.height = remaining + "%";
		});
	};

	var formatTime = function (ticks) {
		var seconds = Math.max(0, Math.floor((Number(ticks) || 0) / rules.TICKS_PER_SECOND));
		return String(Math.floor(seconds / 60)).padStart(2, "0") + ":" + String(seconds % 60).padStart(2, "0");
	};

	var getDamageSummary = function (snapshot) {
		var total = Math.max(0, Number(snapshot.enemy.damageTaken) || 0);
		var attributed = 0;
		var seconds = Math.max(0, (Number(snapshot.tick) || 0) / rules.TICKS_PER_SECOND);
		var rows = snapshot.weapons.map(function (weapon, index) {
			var damage = Math.max(0, Number(weapon.damageDealt) || 0);
			attributed += damage;
			return { id: weapon.instanceId, name: weapon.name, weapon: weapon, damage: damage, index: index };
		});
		var other = Math.max(0, Math.round((total - attributed) * 1000) / 1000);
		if (other > 0) rows.push({ id: "__other__", name: "其他效果", damage: other, index: rows.length });
		rows.sort(function (a, b) { return b.damage - a.damage || a.index - b.index; });
		rows.forEach(function (row) { row.share = total > 0 ? row.damage / total * 100 : 0; });
		return { total: total, dps: seconds > 0 ? total / seconds : 0, rows: rows };
	};

	var formatDamage = function (value) {
		return value >= 100000000 ? format(value / 100000000, 1) + "亿"
			: value >= 10000 ? format(value / 10000, 1) + "万" : format(value, 1);
	};

	var renderDamage = function (snapshot) {
		var summary = getDamageSummary(snapshot);
		nodes.totalDps.textContent = formatDamage(summary.dps);
		nodes.totalDps.title = "累计伤害 " + format(summary.total, 1) + " / 战斗时间 " + format(snapshot.tick / rules.TICKS_PER_SECOND, 2) + " 秒";
		var active = {};
		summary.rows.forEach(function (row, index) {
			active[row.id] = true;
			var node = damageNodes[row.id];
			if (!node) {
				var element = document.createElement("div");
				element.className = "bb-damage-row";
				element.dataset.instanceId = row.id;
				element.innerHTML = "<div class='bb-damage-icon'></div><div class='bb-damage-info'><span class='bb-damage-name'></span><span class='bb-damage-values'><span class='bb-damage-value'></span><span class='bb-damage-share'></span></span></div><div class='bb-damage-bar'><i></i></div>";
				var icon = element.querySelector(".bb-damage-icon");
				if (row.weapon) {
					var bounds = getBounds(rotateCells(row.weapon.baseCells || row.weapon.cells, row.weapon.rotation));
					var cellSize = Math.min(34 / bounds.cols, 34 / bounds.rows);
					var art = createArt(row.weapon, cellSize, "stats").element;
					art.style.width = bounds.cols * cellSize + "px"; art.style.height = bounds.rows * cellSize + "px";
					icon.appendChild(art);
				} else icon.textContent = "◇";
				element.querySelector(".bb-damage-name").textContent = row.name;
				node = damageNodes[row.id] = { root: element, value: element.querySelector(".bb-damage-value"), share: element.querySelector(".bb-damage-share"), bar: element.querySelector(".bb-damage-bar i") };
			}
			node.value.textContent = formatDamage(row.damage);
			node.share.textContent = format(row.share, 1) + "%";
			node.bar.style.width = Math.min(100, row.share) + "%";
			node.root.title = row.name + " · 累计伤害 " + format(row.damage, 1) + " · 占比 " + format(row.share, 1) + "%";
			if (nodes.damageList.children[index] !== node.root) nodes.damageList.insertBefore(node.root, nodes.damageList.children[index] || null);
		});
		Object.keys(damageNodes).forEach(function (id) { if (!active[id]) { damageNodes[id].root.remove(); delete damageNodes[id]; } });
	};

	var renderLog = function (snapshot, force) {
		var filter = nodes.logFilter.value;
		var source = snapshot.battleLog || [];
		var last = source[source.length - 1];
		var signature = [filter, source.length, last && last.tick, last && last.kind, last && last.text].join("|");
		if (!force && signature === logSignature) return;
		logSignature = signature;
		var follow = force || nodes.log.scrollHeight - nodes.log.scrollTop - nodes.log.clientHeight < 24;
		var oldScroll = nodes.log.scrollTop;
		var lines = source.filter(function (line) {
			return filter === "all" || line.kind === filter || (filter === "damage" && line.kind === "attack");
		}).slice(-120);
		nodes.log.innerHTML = "";
		lines.forEach(function (line) {
			var element = document.createElement("div");
			element.className = "bb-log-line " + line.kind;
			var time = document.createElement("time"); time.textContent = formatTime(line.tick);
			var text = document.createElement("span"); text.textContent = line.text;
			element.appendChild(time); element.appendChild(text);
			nodes.log.appendChild(element);
		});
		if (!lines.length) nodes.log.textContent = "暂无此类战斗记录";
		nodes.log.scrollTop = follow ? nodes.log.scrollHeight : oldScroll;
	};

	var cancelDelayedOpen = function () {
		if (delayedOpenTimer == null) return;
		clearTimeout(delayedOpenTimer);
		delayedOpenTimer = null;
	};

	/**
	 * 战斗面板自身是一个固定定位堆叠上下文，Guides.js 无法直接把内部节点提到遮罩之上。
	 * 因此按选择器为每个步骤创建一个 body 直属定位层：它只负责高亮和箭头定位，事件仍由真实控件处理。
	 */
	var syncGuideTargets = function () {
		guideTargets.forEach(function (entry) {
			if (!entry.source || !entry.proxy || !entry.source.isConnected) return;
			var rect = entry.source.getBoundingClientRect();
			entry.proxy.style.left = Math.round(rect.left) + "px";
			entry.proxy.style.top = Math.round(rect.top) + "px";
			entry.proxy.style.width = Math.max(1, Math.round(rect.width)) + "px";
			entry.proxy.style.height = Math.max(1, Math.round(rect.height)) + "px";
		});
	};

	var removeGuideResumeMode = function () {
		document.body.classList.remove("bb-battle-guide-await-resume");
		if (root && guideTour && guideTour.inProgress) {
			root.inert = true;
			root.setAttribute("aria-hidden", "true");
		}
		if (nodes.pause && guideResumeHandler) {
			nodes.pause.removeEventListener("click", guideResumeHandler);
		}
		guideResumeHandler = null;
	};

	var enableGuideResumeMode = function () {
		removeGuideResumeMode();
		if (!root || !nodes.pause) return;
		// Guides 默认锁定背景；最后一步只解锁战斗根节点，并让点击穿过遮罩抵达真实“继续”按钮。
		root.inert = false;
		root.removeAttribute("aria-hidden");
		document.body.classList.add("bb-battle-guide-await-resume");
		guideResumeHandler = function () {
			if (guideTour && guideTour.inProgress) guideTour.end();
		};
		nodes.pause.addEventListener("click", guideResumeHandler);
	};

	var cleanupBattleGuide = function () {
		if (releaseGuideViewport) releaseGuideViewport();
		releaseGuideViewport = null;
		removeGuideResumeMode();
		document.body.classList.remove("bb-battle-guide-active");
		guideTargets.forEach(function (entry) {
			if (entry.proxy && entry.proxy.parentNode) entry.proxy.parentNode.removeChild(entry.proxy);
		});
		guideTargets = [];
	};

	var endBattleGuide = function () {
		var wasActive = !!guideTour || guideStartFrame != null || guideLayoutFrame != null
			|| guideTargets.length > 0;
		if (!wasActive) return;
		if (guideStartFrame != null) cancelAnimationFrame(guideStartFrame);
		if (guideLayoutFrame != null) cancelAnimationFrame(guideLayoutFrame);
		guideStartFrame = null;
		guideLayoutFrame = null;
		var currentTour = guideTour;
		if (currentTour && currentTour.inProgress) currentTour.end();
		guideTour = null;
		cleanupBattleGuide();
	};

	var startBattleGuide = function () {
		guideStartFrame = null;
		if (!root || !latestSnapshot || !latestSnapshot.active || !latestSnapshot.paused || !isGuideBattle()) return;
		var GuidesConstructor = window.Guides && (window.Guides.default || window.Guides);
		if (typeof GuidesConstructor !== "function") {
			guideStarted = true;
			console.error("战斗教程启动失败：Guides.js 未加载");
			return;
		}
		guideStarted = true;
		var definitions = [
			[".bb-guide-player-stats", "这里是你的当前生命值、战斗内生命上限、当前基础命中率"],
			[".bb-player-statuses", "这里会展示你的Buff和Debuff，点击或悬浮查看详细数据"],
			[".bb-guide-enemy-data", "怪物的数据在这里"],
			[".bb-guide-ultimates", "这里是奥义条，攻击命中会获得奥义，奥义满后会触发奥义效果"],
			[".bb-enemy-action", "这是怪物的攻击倒计时，圆环蓄满后怪物会发起攻击"],
			[".bb-arsenal", "背包中的武器会按各自频率自动攻击，填色表示冷却进度。悬停或点击武器可查看详情与剩余冷却时间"],
			[".bb-log", "这里可以看到详细的战斗日志"],
			[".bb-guide-speed", "这里可以调节战斗动画播放的速率，初次战斗就让我们完整的看完吧"],
			[".bb-pause", "接下来点击继续开始战斗吧！", true]
		];
		var guides = [];
		definitions.forEach(function (definition, index) {
			var source = root.querySelector(definition[0]);
			if (!source) {
				console.warn("战斗教程未找到目标：" + definition[0]);
				return;
			}
			var proxy = document.createElement("div");
			proxy.className = "bb-guide-target-proxy";
			proxy.setAttribute("aria-hidden", "true");
			document.body.appendChild(proxy);
			guideTargets.push({ source: source, proxy: proxy });
			guides.push({
				target: proxy,
				html: definition[1] + "<small class='bb-guide-progress'>" + (index + 1) + " / " + definitions.length + "</small>",
				awaitResume: !!definition[2]
			});
		});
		if (!guides.length) {
			cleanupBattleGuide();
			return;
		}
		syncGuideTargets();
		document.body.classList.add("bb-battle-guide-active");
		try {
			guideTour = new GuidesConstructor({
				color: "#f2c86f",
				distance: 36,
				className: "bb-battle-guide",
				guides: guides,
				render: function (event) {
					syncGuideTargets();
					if (event.guide && event.guide.awaitResume) enableGuideResumeMode();
					else removeGuideResumeMode();
				},
				end: function (event) {
					cleanupBattleGuide();
					if (guideTour === event.sender) guideTour = null;
				}
			});
			guideTour.start();
			if (common.bindGuideViewport) releaseGuideViewport = common.bindGuideViewport(guideTour.canvas);
		} catch (error) {
			guideTour = null;
			cleanupBattleGuide();
			console.error("战斗教程启动失败", error);
		}
	};

	var queueBattleGuide = function () {
		if (guideStarted || guideStartFrame != null || guideLayoutFrame != null || !isGuideBattle()) return;
		guideStartFrame = requestAnimationFrame(function () {
			guideStartFrame = null;
			guideLayoutFrame = requestAnimationFrame(function () {
				guideLayoutFrame = null;
				startBattleGuide();
			});
		});
	};

	var render = function (snapshot, allowInstantOpen) {
		if (!snapshot || snapshot.active === false) {
			close();
			return;
		}
		if (core.isReplaying && core.isReplaying()) {
			close();
			return;
		}
		latestSnapshot = snapshot;
		var preferredSpeed = !isGuideBattle() && typeof runtime.getPreferredSpeed === "function"
			? runtime.getPreferredSpeed() : snapshot.speed;
		// “立即”先静默模拟 100ms：期间完成则从未创建过面板，较慢的战斗才补显示结算进度。
		if (preferredSpeed === "instant" && !root && !allowInstantOpen) {
			if (delayedOpenTimer == null) {
				delayedOpenTimer = setTimeout(function () {
					delayedOpenTimer = null;
					var current = runtime.getSnapshot();
					if (current && current.active) render(current, true);
				}, INSTANT_OPEN_DELAY);
			}
			return;
		}
		cancelDelayedOpen();
		build();
		var floorId = snapshot.meta && snapshot.meta.floorId;
		var floor = core.status && core.status.maps && core.status.maps[floorId];
		root.querySelector(".bb-floor-name").textContent = floor && floor.title || "背包战斗";
		nodes.elapsed.textContent = formatTime(snapshot.tick);
		nodes.battleState.textContent = snapshot.fastForwarding ? "结算中" : snapshot.paused ? "已暂停" : "战斗中";
		nodes.playerName.textContent = snapshot.player.name;
		nodes.playerHpText.textContent = format(snapshot.player.hp, 1) + " / " + format(snapshot.player.maxHp, 1);
		nodes.playerHp.style.width = Math.max(0, Math.min(100, snapshot.player.hp / Math.max(1, snapshot.player.maxHp) * 100)) + "%";
		nodes.playerMeta.textContent = "攻击 " + format(snapshot.player.atk, 1) + " · 命中率 "
			+ format(rules.getEffectiveHitRate(snapshot.player, snapshot.player.hitRate) * 100, 0) + "%";
		nodes.enemyName.textContent = snapshot.enemy.name;
		nodes.enemyHpText.textContent = format(snapshot.enemy.hp, 1) + " / " + format(snapshot.enemy.maxHp, 1);
		nodes.enemyHp.style.width = Math.max(0, Math.min(100, snapshot.enemy.hp / Math.max(1, snapshot.enemy.maxHp) * 100)) + "%";
		nodes.enemyMeta.textContent = "攻击 " + format(snapshot.enemy.atk, 1) + " · 命中率 "
			+ format(rules.getEffectiveHitRate(snapshot.enemy, snapshot.enemy.hitRate) * 100, 0) + "%";
		renderStatuses("player", snapshot.player, snapshot);
		renderStatuses("enemy", snapshot.enemy, snapshot);
		renderWeapons(snapshot, false);
		renderLog(snapshot);
		renderDamage(snapshot);
		drawPortraits(snapshot);
		attackFeedback.update(snapshot);
		weaponFlightFeedback.update(snapshot);
		common.setWeaponButtonLabel(nodes.pause, snapshot.paused ? "继续战斗" : "暂停战斗");
		nodes.fast.disabled = !!snapshot.fastForwarding;
		common.setWeaponButtonLabel(nodes.fast, snapshot.fastForwarding ? "结算中…" : "立即结算");
		nodes.fast.classList.toggle("active", preferredSpeed === "instant");
		root.querySelectorAll(".bb-speed").forEach(function (button) {
			button.classList.toggle("active", preferredSpeed !== "instant"
				&& Number(button.dataset.speed) === Number(preferredSpeed));
			button.setAttribute("aria-pressed", String(preferredSpeed !== "instant" && Number(button.dataset.speed) === Number(preferredSpeed)));
		});
		if (nodes.speedSelect && preferredSpeed !== "instant") {
			nodes.speedSelect.value = String(Number(preferredSpeed));
		}
		nodes.ultimateText.textContent = format(snapshot.player.ultimate, 1) + "%";
		nodes.ultimateBar.style.width = Math.min(100, snapshot.player.ultimate) + "%";
		// 怪物奥义条（有 ultimateGain 词条的怪物才会累计；颜色与玩家奥义条区分）。
		nodes.enemyUltimateText.textContent = format(snapshot.enemy.ultimate, 1) + "%";
		nodes.enemyUltimateBar.style.width = Math.min(100, snapshot.enemy.ultimate) + "%";
		var enemyProgress = Math.max(0, Math.min(1, snapshot.enemy.cooldownProgress || 0));
		nodes.enemyActionBar.style.width = (enemyProgress * 100) + "%";
		nodes.actionRing.style.strokeDashoffset = String((1 - enemyProgress) * 100);
		nodes.actionPointer.setAttribute("transform", "rotate(" + (enemyProgress * 360) + " 80 80)");
		nodes.enemyActionText.textContent = enemyProgress >= 0.999 ? "就绪" : format((1 - enemyProgress) * snapshot.enemy.effectiveIntervalTicks / 100, 1) + "s";
		if (snapshot.paused) queueBattleGuide();
	};

	var close = function () {
		cancelDelayedOpen();
		if (attackFeedback) attackFeedback.destroy();
		attackFeedback = null;
		if (weaponFlightFeedback) weaponFlightFeedback.destroy();
		weaponFlightFeedback = null;
		portraitAttackAge = -1;
		endBattleGuide();
		common.hideTooltip();
		if (resizeHandler) window.removeEventListener("resize", resizeHandler);
		if (resizeHandler && core.unregisterResize) core.unregisterResize("backpackBattleViewport");
		resizeHandler = null;
		if (boardObserver) boardObserver.disconnect();
		boardObserver = null;
		if (viewportObserver) viewportObserver.disconnect();
		viewportObserver = null;
		if (common.unregisterModal) common.unregisterModal(root);
		if (root) {
			common.releaseWeaponUI(root);
			root.remove();
		}
		root = null;
		nodes = {};
		weaponNodes = {};
		statusIconNodes = {};
		damageNodes = {};
		logSignature = "";
		playerPortraitSignature = "";
		enemyPortraitSignature = "";
		gridLayout = null;
		gridCellSize = 0;
		latestSnapshot = null;
		guideStarted = false;
	};

	unsubscribe = runtime.subscribe(render);

	return {
		render: render,
		close: close,
		destroy: function () {
			if (unsubscribe) unsubscribe();
			unsubscribe = null;
			close();
		},
		isOpen: function () { return !!root; }
	};
};
