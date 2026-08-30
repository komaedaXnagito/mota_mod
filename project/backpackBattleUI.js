/** 背包乱斗战斗面板。武器展示约占70%，人物、HUD和日志约占30%。 */
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
	var delayedOpenTimer = null;
	var guideTour = null;
	var guideStarted = false;
	var guideStartFrame = null;
	var guideLayoutFrame = null;
	var guideTargets = [];
	var guideResumeHandler = null;
	var INSTANT_OPEN_DELAY = 100;
	var GRID_COLS = 10;
	var GRID_ROWS = 10;
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

	var build = function () {
		if (root) return;
		root = document.createElement("div");
		root.className = "bb-overlay";
		root.dataset.mobile = core.domStyle && core.domStyle.isVertical ? "true" : "false";
		root.innerHTML = [
			"<section class='bb-panel' role='dialog' aria-label='背包乱斗战斗'>",
			"<header class='bb-topbar'><div class='bb-brand'>背包战斗</div><div class='bb-controls'>",
			"<button class='bb-button bb-pause'>暂停</button><div class='bb-guide-speed'><span class='bb-speed-label'>速度</span>",
			"<button class='bb-button bb-speed' data-speed='0.25'>0.25×</button><button class='bb-button bb-speed' data-speed='0.5'>0.5×</button><button class='bb-button bb-speed' data-speed='1'>1×</button><button class='bb-button bb-speed' data-speed='2'>2×</button><button class='bb-button bb-speed' data-speed='3'>3×</button><button class='bb-button bb-speed' data-speed='10'>10×</button>",
			"<select class='bb-speed-select' aria-label='战斗速度'><option value='0.25'>0.25×</option><option value='0.5'>0.5×</option><option value='1'>1×</option><option value='2'>2×</option><option value='3'>3×</option><option value='10'>10×</option></select>",
			"<button class='bb-button bb-fast'>立即</button></div></div></header>",
			"<div class='bb-content'>",
			"<section class='bb-arsenal'><div class='bb-arsenal-title'>武器阵列 <small class='bb-weapon-count'></small></div><div class='bb-weapon-board'><div class='bb-weapon-stage'><div class='bb-synergy-layer'></div></div><div class='bb-weapon-empty'>尚未摆放武器</div></div></section>",
			"<aside class='bb-sidebar'>",
			"<div class='bb-duel'>",
			"<article class='bb-side player'><div class='bb-portrait-wrap'><span class='bb-side-tag'>勇士</span><canvas class='bb-portrait bb-player-portrait' width='128' height='128'></canvas></div><div class='bb-side-name bb-player-name'></div><div class='bb-guide-player-stats'><div class='bb-hp-line'><span>HP</span><strong class='bb-player-hp-text'></strong></div><div class='bb-bar bb-player-hp'><i></i></div><div class='bb-side-meta bb-player-meta'></div></div><div class='bb-statuses bb-player-statuses'></div></article>",
			"<article class='bb-side enemy'><div class='bb-portrait-wrap'><span class='bb-side-tag'>敌人</span><canvas class='bb-portrait bb-enemy-portrait' width='128' height='128'></canvas></div><div class='bb-side-name bb-enemy-name'></div><div class='bb-guide-enemy-data'><div class='bb-hp-line'><span>HP</span><strong class='bb-enemy-hp-text'></strong></div><div class='bb-bar bb-enemy-hp'><i></i></div><div class='bb-side-meta bb-enemy-meta'></div><div class='bb-statuses bb-enemy-statuses'></div></div></article>",
			"</div>",
			"<section class='bb-resource'><div class='bb-guide-ultimates'><div class='bb-resource-row'><span>奥义</span><strong class='bb-ultimate-text'></strong></div><div class='bb-bar bb-ultimate-bar'><i></i></div><div class='bb-enemy-ultimate'><div class='bb-resource-row'><span>敌方奥义</span><strong class='bb-enemy-ultimate-text'></strong></div><div class='bb-bar bb-enemy-ultimate-bar'><i></i></div></div></div><div class='bb-enemy-action'><div class='bb-resource-row'><span>敌方攻击准备</span><strong class='bb-enemy-action-text'></strong></div><div class='bb-bar bb-enemy-action-bar'><i></i></div></div></section>",
			"<section class='bb-log'><button type='button' class='bb-log-toggle' aria-expanded='true'>战斗日志 ▾</button><div class='bb-log-list'></div></section>",
			"</aside></div></section>"
		].join("");
		document.body.appendChild(root);
		nodes.weaponBoard = root.querySelector(".bb-weapon-board");
		nodes.weaponStage = root.querySelector(".bb-weapon-stage");
		nodes.synergyLayer = root.querySelector(".bb-synergy-layer");
		nodes.weaponEmpty = root.querySelector(".bb-weapon-empty");
		nodes.weaponCount = root.querySelector(".bb-weapon-count");
		nodes.playerPortrait = root.querySelector(".bb-player-portrait");
		nodes.enemyPortrait = root.querySelector(".bb-enemy-portrait");
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
		if (common.registerModal) {
			common.registerModal(root, function () {
				if (!runtime.stop || runtime.stop("用户按 Esc 关闭战斗弹层") === false) close();
			}, { name: "backpack-battle" });
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
			if (root) root.dataset.mobile = core.domStyle && core.domStyle.isVertical ? "true" : "false";
			if (latestSnapshot && root) renderWeapons(latestSnapshot, true);
			syncGuideTargets();
		};
		window.addEventListener("resize", resizeHandler);
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
			if (!Number.isFinite(col) || !Number.isFinite(row)
				|| col < 0 || row < 0 || col >= GRID_COLS || row >= GRID_ROWS) return;
			var cell = document.createElement("span");
			cell.className = "bb-synergy-cell";
			cell.style.left = (col * weaponNode.cellSize) + "px";
			cell.style.top = (row * weaponNode.cellSize) + "px";
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
		var cellSize = Math.max(18, Math.floor(Math.min((boardWidth - 18) / GRID_COLS, (boardHeight - 18) / GRID_ROWS)));
		var stageWidth = cellSize * GRID_COLS;
		var stageHeight = cellSize * GRID_ROWS;
		nodes.weaponStage.style.width = stageWidth + "px";
		nodes.weaponStage.style.height = stageHeight + "px";
		nodes.weaponStage.style.left = Math.max(0, Math.floor((boardWidth - stageWidth) / 2)) + "px";
		nodes.weaponStage.style.top = Math.max(0, Math.floor((boardHeight - stageHeight) / 2)) + "px";
		nodes.weaponStage.style.backgroundSize = cellSize + "px " + cellSize + "px";
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
			node.root.style.left = (Math.max(0, Number(weapon.col) || 0) * cellSize) + "px";
			node.root.style.top = (Math.max(0, Number(weapon.row) || 0) * cellSize) + "px";
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

	var drawContain = function (ctx, image, sx, sy, sw, sh) {
		if (!image || !sw || !sh) return;
		var maxSize = 104;
		var scale = Math.min(maxSize / sw, maxSize / sh);
		var width = sw * scale;
		var height = sh * scale;
		ctx.drawImage(image, sx, sy, sw, sh, (128 - width) / 2, 128 - height - 5, width, height);
	};

	var drawPortraits = function (snapshot) {
		var playerContext = nodes.playerPortrait.getContext("2d");
		var enemyContext = nodes.enemyPortrait.getContext("2d");
		[playerContext, enemyContext].forEach(function (ctx) {
			ctx.clearRect(0, 0, 128, 128);
			ctx.imageSmoothingEnabled = false;
		});
		var heroImage = core.material && core.material.images && core.material.images.hero;
		if (heroImage && heroImage.width && heroImage.height) {
			var heroWidth = heroImage.width / 4;
			var heroHeight = heroImage.height / 4;
			drawContain(playerContext, heroImage, 0, 0, heroWidth, heroHeight);
		}
		var info = core.getBlockInfo ? core.getBlockInfo(snapshot.enemy.id) : null;
		if (info) {
			if (info.bigImage && info.bigImage.width && info.bigImage.height) {
				drawContain(enemyContext, info.bigImage, 0, 0, info.bigImage.width, info.bigImage.height);
			} else if (info.image) {
				drawContain(enemyContext, info.image, 32 * (info.posX || 0), info.height * info.posY, 32, info.height);
			}
		}
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

	var renderLog = function (snapshot) {
		var lines = snapshot.battleLog.slice(-120);
		nodes.log.innerHTML = "";
		lines.forEach(function (line) {
			var element = document.createElement("div");
			element.className = "bb-log-line " + line.kind;
			element.textContent = line.text;
			nodes.log.appendChild(element);
		});
		nodes.log.scrollTop = nodes.log.scrollHeight;
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
			[".bb-enemy-action", "这是怪物的攻击进度条，满了后怪物会发起攻击"],
			[".bb-arsenal", "每把放置在背包内的武器都会自动进行攻击，武器有不同的攻击频率，武器下方的倒计时可以看到还有多长时间该武器会发动一次攻击"],
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
		drawPortraits(snapshot);
		nodes.pause.textContent = snapshot.paused ? "继续" : "暂停";
		nodes.fast.disabled = !!snapshot.fastForwarding;
		nodes.fast.textContent = snapshot.fastForwarding ? "结算中…" : "立即";
		nodes.fast.classList.toggle("active", preferredSpeed === "instant");
		root.querySelectorAll(".bb-speed").forEach(function (button) {
			button.classList.toggle("active", preferredSpeed !== "instant"
				&& Number(button.dataset.speed) === Number(preferredSpeed));
		});
		if (nodes.speedSelect && preferredSpeed !== "instant") {
			nodes.speedSelect.value = String(Number(preferredSpeed));
		}
		nodes.ultimateText.textContent = format(snapshot.player.ultimate, 1) + " / 100";
		nodes.ultimateBar.style.width = Math.min(100, snapshot.player.ultimate) + "%";
		// 怪物奥义条（有 ultimateGain 词条的怪物才会累计；颜色与玩家奥义条区分）。
		nodes.enemyUltimateText.textContent = format(snapshot.enemy.ultimate, 1) + " / 100";
		nodes.enemyUltimateBar.style.width = Math.min(100, snapshot.enemy.ultimate) + "%";
		var enemyProgress = Math.max(0, Math.min(1, snapshot.enemy.cooldownProgress || 0));
		nodes.enemyActionBar.style.width = (enemyProgress * 100) + "%";
		nodes.enemyActionText.textContent = enemyProgress >= 0.999 ? "就绪" : format((1 - enemyProgress) * snapshot.enemy.effectiveIntervalTicks / 100, 1) + "s";
		if (snapshot.paused) queueBattleGuide();
	};

	var close = function () {
		cancelDelayedOpen();
		endBattleGuide();
		common.hideTooltip();
		if (resizeHandler) window.removeEventListener("resize", resizeHandler);
		resizeHandler = null;
		if (common.unregisterModal) common.unregisterModal(root);
		if (root) root.remove();
		root = null;
		nodes = {};
		weaponNodes = {};
		statusIconNodes = {};
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
