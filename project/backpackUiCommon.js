/** 背包与战斗共用的武器详情 Tooltip 和显示格式。 */
var backpackUiCommon_2c986f67_7621_44eb_972d_24f1e2c6ce61 = (function () {
	"use strict";

	var tooltip = null;
	var activeAnchor = null;
	var lastPointer = null;
	var tooltipHideTimer = null;
	var tooltipMoveFrame = null;
	var pendingTooltipPosition = null;
	var lastTooltipHtml = null;
	var TOOLTIP_HIDE_DELAY = 0;
	var recipePreviewRoot = null;

	var escapeHtml = function (value) {
		return String(value == null ? "" : value)
			.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;")
			.replace(/"/g, "&quot;")
			.replace(/'/g, "&#39;");
	};

	var formatNumber = function (value, digits) {
		if (value == null || !Number.isFinite(Number(value))) return "—";
		var factor = Math.pow(10, digits == null ? 2 : digits);
		var rounded = Math.round(Number(value) * factor) / factor;
		return String(rounded);
	};

	/** 奥义获取显示：正值带 + 前缀，负值（消耗型武器）原样显示负号，空值显示破折号。 */
	var formatUltimateGain = function (value) {
		if (value == null || !Number.isFinite(Number(value))) return "—";
		var number = Number(value);
		var text = formatNumber(number);
		return number > 0 ? "+" + text : text;
	};

	var formatPercent = function (value) {
		return value == null || !Number.isFinite(Number(value))
			? "—"
			: formatNumber(Number(value) * 100, 1) + "%";
	};

	/** 商店与背包共用：转义特殊效果文案，并把上方联动符号替换为黄色动态双箭头。 */
	var formatSpecialEffectHtml = function (text) {
		return String(text || "无特殊效果").split(/([\^∧＾])/g).map(function (part) {
			if (/^[\^∧＾]$/.test(part)) {
				return "<span class='bui-inline-synergy direction-up' role='img' aria-label='上方联动'></span>";
			}
			return escapeHtml(part);
		}).join("");
	};

	var getDamageText = function (source) {
		source = source || {};
		if (source.minAttack == null && source.maxAttack == null) return "—";
		var minimum = source.minAttack == null ? source.maxAttack : source.minAttack;
		var maximum = source.maxAttack == null ? source.minAttack : source.maxAttack;
		return formatNumber(minimum) + "～" + formatNumber(maximum);
	};

	var hasChanged = function (left, right) {
		if (left == null && right == null) return false;
		return Math.abs((Number(left) || 0) - (Number(right) || 0)) > 0.0001;
	};

	var statNames = {
		attack: "伤害",
		minAttack: "伤害下限",
		maxAttack: "伤害上限",
		hitRate: "命中率",
		attackInterval: "攻击间隔",
		attackIntervalTicks: "攻击间隔",
		ultimateGain: "奥义获取"
	};

	var describeBonus = function (bonus) {
		bonus = bonus || {};
		var stat = statNames[bonus.stat] || bonus.stat || "属性";
		var operation = bonus.operation || "add";
		var stacks = Math.max(1, Number(bonus.stacks) || 1);
		var value = Number(bonus.value) || 0;
		var text;
		if (operation === "multiply") text = "×" + formatNumber(Math.pow(value, stacks), 3);
		else if (operation === "set") text = "设为 " + formatNumber(value);
		else text = (value * stacks >= 0 ? "+" : "") + formatNumber(value * stacks);
		return escapeHtml(bonus.sourceName || "布局联动") + "：" + escapeHtml(stat + " " + text);
	};

	var makeValueWithBase = function (currentText, changed, baseText) {
		return "<strong>" + escapeHtml(currentText) + "</strong>"
			+ (changed ? "<small>基础 " + escapeHtml(baseText) + "</small>" : "");
	};

	var getWeaponDefinitions = function () {
		return typeof weaponDefinitions_9f2e6f5b_4b2c_4f8c_9a3d_7e1b6c0d5a44 !== "undefined"
			? weaponDefinitions_9f2e6f5b_4b2c_4f8c_9a3d_7e1b6c0d5a44 : {};
	};

	var getRecipeData = function () {
		return typeof weaponRecipes_7f2e9c4a_3b5d_4f8a_9c1e_6d4b8a2f9c31 !== "undefined"
			? weaponRecipes_7f2e9c4a_3b5d_4f8a_9c1e_6d4b8a2f9c31 : { recipes: [] };
	};

	/** 配方使用 weapons.js 的键；背包和战斗快照保存的是内部短 id，因此统一在这里反查。 */
	var getWeaponKey = function (weapon) {
		var definitions = getWeaponDefinitions();
		if (typeof weapon === "string" && definitions[weapon]) return weapon;
		if (!weapon) return null;
		for (var key in definitions) {
			if (!Object.prototype.hasOwnProperty.call(definitions, key)) continue;
			var definition = definitions[key];
			if (definition === weapon) return key;
			if (weapon.id != null && definition && definition.id === weapon.id) return key;
		}
		return null;
	};

	var getWeaponDefinition = function (weapon) {
		var key = getWeaponKey(weapon);
		return key ? getWeaponDefinitions()[key] : (typeof weapon === "object" ? weapon : null);
	};

	var getRecipeDisplayName = function (key) {
		var definitions = getWeaponDefinitions();
		var displayNames = getRecipeData().displayNames || {};
		return displayNames[key] || (definitions[key] && definitions[key].name) || String(key || "未知武器");
	};

	var getWeaponRecipes = function (weapon) {
		var key = getWeaponKey(weapon);
		if (!key) return [];
		var recipes = getRecipeData().recipes;
		return (Array.isArray(recipes) ? recipes : []).filter(function (recipe) {
			return recipe && (recipe.a === key || recipe.b === key);
		});
	};

	var canCraftWithWeapon = function (weapon) {
		return getWeaponRecipes(weapon).length > 0;
	};

	var buildCraftHammerHtml = function (weapon) {
		var key = getWeaponKey(weapon);
		if (!key || !canCraftWithWeapon(key)) return "";
		return "<button type='button' class='bui-craft-hammer' data-bui-craft-key='"
			+ escapeHtml(key) + "' title='预览这把武器的合成表' aria-label='预览"
			+ escapeHtml(getRecipeDisplayName(key)) + "的合成表'>🔨</button>";
	};

	var normalizeWeaponCells = function (weapon) {
		weapon = weapon || {};
		var cells = [];
		if (Array.isArray(weapon.cells)) {
			weapon.cells.forEach(function (cell) {
				if (Array.isArray(cell) && cell.length >= 2
					&& Number.isFinite(Number(cell[0])) && Number.isFinite(Number(cell[1]))) {
					cells.push([Number(cell[0]), Number(cell[1])]);
				}
			});
		}
		if (!cells.length) {
			var shape = weapon.shape || weapon.size;
			if (Array.isArray(shape)) {
				shape.forEach(function (row, rowIndex) {
					if (!Array.isArray(row)) return;
					row.forEach(function (occupied, colIndex) {
						if (occupied) cells.push([colIndex, rowIndex]);
					});
				});
			}
		}
		return cells.length ? cells : [[0, 0]];
	};

	var percentStyle = function (left, top, width, height) {
		return "left:" + left + "%;top:" + top + "%;width:" + width + "%;height:" + height + "%;";
	};

	/** Tooltip 内使用真实占格与等比裁剪，展示与合成槽一致的武器格子预览。 */
	var buildWeaponGridPreviewHtml = function (weapon) {
		weapon = getWeaponDefinition(weapon) || weapon || {};
		var cells = normalizeWeaponCells(weapon);
		var sourceMinCol = Math.min.apply(null, cells.map(function (cell) { return cell[0]; }));
		var sourceMaxCol = Math.max.apply(null, cells.map(function (cell) { return cell[0]; }));
		var sourceMinRow = Math.min.apply(null, cells.map(function (cell) { return cell[1]; }));
		var sourceMaxRow = Math.max.apply(null, cells.map(function (cell) { return cell[1]; }));
		var minCol = sourceMinCol - 1;
		var minRow = sourceMinRow - 1;
		var cols = sourceMaxCol - sourceMinCol + 3;
		var rows = sourceMaxRow - sourceMinRow + 3;
		var cellWidth = 100 / cols;
		var cellHeight = 100 / rows;
		var html = [
			"<div class='bui-weapon-grid-preview' aria-label='武器占 " + cells.length + " 格'>",
			"<div class='bui-weapon-grid-stage' style='aspect-ratio:" + cols + "/" + rows + "'>"
		];
		for (var row = 0; row < rows; row++) {
			for (var col = 0; col < cols; col++) {
				html.push("<span class='bui-weapon-grid-cell' style='"
					+ percentStyle(col * cellWidth, row * cellHeight, cellWidth, cellHeight) + "'></span>");
			}
		}
		cells.forEach(function (cell) {
			html.push("<span class='bui-weapon-footprint-cell' style='"
				+ percentStyle((cell[0] - minCol) * cellWidth, (cell[1] - minRow) * cellHeight, cellWidth, cellHeight)
				+ "'></span>");
		});

		var boundsCols = sourceMaxCol - sourceMinCol + 1;
		var boundsRows = sourceMaxRow - sourceMinRow + 1;
		var inset = Math.min(0.12, (boundsCols - 0.1) / 2, (boundsRows - 0.1) / 2);
		var frameCol = sourceMinCol + inset;
		var frameRow = sourceMinRow + inset;
		var frameCols = boundsCols - inset * 2;
		var frameRows = boundsRows - inset * 2;
		var frameStyle = percentStyle(
			(frameCol - minCol) / cols * 100,
			(frameRow - minRow) / rows * 100,
			frameCols / cols * 100,
			frameRows / rows * 100
		);
		var imageStyle = "";
		var crop = weapon.imageCrop;
		if (Array.isArray(crop) && crop.length >= 6 && crop[2] > 0 && crop[3] > 0 && crop[4] > 0 && crop[5] > 0) {
			var scale = Math.min(frameCols / Number(crop[2]), frameRows / Number(crop[3]));
			var shownCropWidth = Number(crop[2]) * scale;
			var shownCropHeight = Number(crop[3]) * scale;
			imageStyle = "width:" + (Number(crop[4]) * scale / frameCols * 100) + "%;height:"
				+ (Number(crop[5]) * scale / frameRows * 100) + "%;left:"
				+ (((frameCols - shownCropWidth) / 2 - (Number(crop[0]) || 0) * scale) / frameCols * 100) + "%;top:"
				+ (((frameRows - shownCropHeight) / 2 - (Number(crop[1]) || 0) * scale) / frameRows * 100) + "%;";
		}
		html.push("<div class='bui-weapon-grid-image-frame' style='" + frameStyle + "'><img src='"
			+ escapeHtml(weapon.image || "") + "' alt='' style='" + imageStyle + "'></div>");
		html.push("</div><small>占 " + cells.length + " 格 · " + boundsCols + "×" + boundsRows + "</small></div>");
		return html.join("");
	};

	var buildWeaponTooltip = function (data) {
		data = data || {};
		var weapon = data.weapon || {};
		var current = data.current || data.attributes || weapon;
		var base = data.base || weapon;
		var currentInterval = data.effectiveInterval == null ? current.attackInterval : data.effectiveInterval;
		var baseInterval = base.attackInterval;
		var types = current.weaponTypes || weapon.weaponTypes || [];
		var rarity = current.rarity == null ? weapon.rarity : current.rarity;
		var rarityText = rarity == null ? "未定" : new Array(Math.max(0, Math.min(5, Number(rarity))) + 1).join("★");
		var damageChanged = hasChanged(current.minAttack, base.minAttack)
			|| hasChanged(current.maxAttack, base.maxAttack);
		var attributesOnly = data.attributesOnly === true;
		var html = [
			"<article class='bui-weapon-tip'>",
			"<header><div><div class='bui-tip-title-row'><b>" + escapeHtml(weapon.name || current.name || "未命名武器") + "</b></div>",
			weapon.sourceName ? "<small>" + escapeHtml(weapon.sourceName) + "</small>" : "",
			"</div><div class='bui-rarity-row'><span class='bui-rarity'>" + escapeHtml(rarityText) + "</span>",
			buildCraftHammerHtml(weapon),
			"</div></header>",
			attributesOnly ? "" : "<div class='bui-type-row'>" + (types.length
				? types.map(function (type) { return "<i>" + escapeHtml(type) + "</i>"; }).join("")
				: "<i>未分类</i>") + "</div>",
			"<div class='bui-weapon-tip-main" + (attributesOnly ? " attributes-only" : "") + "'>",
			"<dl>",
			"<dt>伤害</dt><dd>" + makeValueWithBase(getDamageText(current), damageChanged, getDamageText(base)) + "</dd>",
			"<dt>命中率</dt><dd>" + makeValueWithBase(
				formatPercent(current.hitRate), hasChanged(current.hitRate, base.hitRate), formatPercent(base.hitRate)
			) + "</dd>",
			"<dt>攻击间隔</dt><dd>" + makeValueWithBase(
				formatNumber(currentInterval) + " 秒",
				hasChanged(currentInterval, baseInterval),
				formatNumber(baseInterval) + " 秒"
			) + "</dd>",
			"<dt>奥义获取</dt><dd><strong>"
				+ escapeHtml(formatUltimateGain(current.ultimateGain)) + "</strong></dd>"
		];
		if (data.cooldown) {
			html.push("<dt>距离下次攻击</dt><dd><strong>" + escapeHtml(formatNumber(data.cooldown.remainingTicks / 100))
				+ " 秒</strong></dd>");
		}
		html.push("</dl></div>");
		var specialText = weapon.synergyText || data.synergyText;
		if (!attributesOnly && data.showSpecialEffect !== false) {
			html.push("<section><h4>特殊效果</h4><p>" + formatSpecialEffectHtml(specialText) + "</p></section>");
		}
		var bonuses = current.bonuses || data.bonuses || [];
		if (!attributesOnly && bonuses.length) {
			html.push("<section><h4>当前布局加成</h4><ul>"
				+ bonuses.map(function (bonus) { return "<li>" + describeBonus(bonus) + "</li>"; }).join("")
				+ "</ul></section>");
		}
		html.push("</article>");
		return html.join("");
	};

	var closeWeaponRecipePreview = function () {
		if (recipePreviewRoot && recipePreviewRoot.parentNode) recipePreviewRoot.parentNode.removeChild(recipePreviewRoot);
		recipePreviewRoot = null;
	};

	var appendCraftHammer = function (container, weapon) {
		var key = getWeaponKey(weapon);
		if (!container || !key || !canCraftWithWeapon(key)) return null;
		var button = document.createElement("button");
		button.type = "button";
		button.className = "bui-craft-hammer";
		button.textContent = "🔨";
		button.dataset.buiCraftKey = key;
		button.title = "预览这把武器的合成表";
		button.setAttribute("aria-label", "预览" + getRecipeDisplayName(key) + "的合成表");
		button.addEventListener("pointerdown", function (event) { event.stopPropagation(); });
		button.addEventListener("click", function (event) {
			event.preventDefault();
			event.stopPropagation();
			openWeaponRecipePreview(key);
		});
		container.appendChild(button);
		return button;
	};

	/** 用于背包、商店、合成等可见名称，统一追加可点击的小锤子。 */
	var renderWeaponName = function (container, weapon, options) {
		if (!container) return container;
		options = options || {};
		container.textContent = "";
		container.classList.add("bui-weapon-name");
		var label = document.createElement("span");
		label.className = "bui-weapon-name-text";
		label.textContent = options.label || (weapon && weapon.name) || "未命名";
		container.appendChild(label);
		if (options.showHammer !== false) appendCraftHammer(container, weapon);
		return container;
	};

	var appendRecipeWeaponName = function (container, key, currentKey) {
		var span = document.createElement("span");
		span.className = "bui-recipe-preview-weapon" + (key === currentKey ? " is-current" : "");
		var definition = getWeaponDefinitions()[key];
		renderWeaponName(span, definition || key, { label: getRecipeDisplayName(key) });
		if (definition) {
			span.classList.add("has-tooltip");
			bindTooltip(span, function () {
				return buildWeaponTooltip({ weapon: definition, base: definition, current: definition });
			});
		}
		container.appendChild(span);
	};

	var openWeaponRecipePreview = function (weapon) {
		var key = getWeaponKey(weapon);
		var recipes = getWeaponRecipes(key);
		if (!key || !recipes.length || typeof document === "undefined") return false;
		hideTooltip();
		closeWeaponRecipePreview();
		var root = document.createElement("div");
		root.className = "bui-recipe-preview-root";
		var panel = document.createElement("section");
		panel.className = "bui-recipe-preview-panel";
		panel.setAttribute("role", "dialog");
		panel.setAttribute("aria-modal", "true");
		panel.setAttribute("aria-label", getRecipeDisplayName(key) + "的合成表");
		var header = document.createElement("header");
		var heading = document.createElement("div");
		heading.innerHTML = "<b>🔨 " + escapeHtml(getRecipeDisplayName(key)) + " 的合成表</b><small>共 "
			+ recipes.length + " 种方案</small>";
		var close = document.createElement("button");
		close.type = "button";
		close.className = "bui-recipe-preview-close";
		close.textContent = "×";
		close.setAttribute("aria-label", "关闭合成表预览");
		close.addEventListener("click", closeWeaponRecipePreview);
		header.appendChild(heading);
		header.appendChild(close);
		panel.appendChild(header);
		var list = document.createElement("div");
		list.className = "bui-recipe-preview-list";
		var seen = {};
		recipes.forEach(function (recipe) {
			var recipeKey = [recipe.a, recipe.b].sort().join("+") + "→" + recipe.result;
			if (seen[recipeKey]) return;
			seen[recipeKey] = true;
			var card = document.createElement("div");
			card.className = "bui-recipe-preview-card";
			appendRecipeWeaponName(card, recipe.a, key);
			card.appendChild(document.createTextNode(" + "));
			appendRecipeWeaponName(card, recipe.b, key);
			var arrow = document.createElement("b");
			arrow.className = "bui-recipe-preview-arrow";
			arrow.textContent = "→";
			card.appendChild(arrow);
			appendRecipeWeaponName(card, recipe.result, key);
			list.appendChild(card);
		});
		panel.appendChild(list);
		root.appendChild(panel);
		root.addEventListener("pointerdown", function (event) {
			if (event.target === root) closeWeaponRecipePreview();
		});
		document.body.appendChild(root);
		recipePreviewRoot = root;
		close.focus();
		return true;
	};

	var ensureTooltip = function () {
		if (tooltip && tooltip.isConnected) return tooltip;
		tooltip = document.createElement("div");
		lastTooltipHtml = null;
		tooltip.className = "bui-tooltip";
		tooltip.setAttribute("role", "tooltip");
		tooltip.addEventListener("pointerenter", function () {
			if (tooltipHideTimer) clearTimeout(tooltipHideTimer);
			tooltipHideTimer = null;
		});
		tooltip.addEventListener("pointerleave", function () { hideTooltip(); });
		tooltip.addEventListener("click", function (event) {
			var target = event.target;
			while (target && target !== tooltip && !target.dataset.buiCraftKey) target = target.parentNode;
			if (!target || !target.dataset.buiCraftKey) return;
			event.preventDefault();
			event.stopPropagation();
			openWeaponRecipePreview(target.dataset.buiCraftKey);
		});
		document.body.appendChild(tooltip);
		return tooltip;
	};

	var positionTooltip = function (event, anchor) {
		if (!tooltip || !tooltip.classList.contains("show") || window.innerWidth <= 680) return;
		var x;
		var y;
		if (event && Number.isFinite(event.clientX)) {
			x = event.clientX + 18;
			y = event.clientY + 18;
			lastPointer = { x: event.clientX, y: event.clientY };
		} else if (lastPointer) {
			x = lastPointer.x + 18;
			y = lastPointer.y + 18;
		} else {
			var rect = anchor.getBoundingClientRect();
			x = rect.right + 12;
			y = rect.top;
		}
		var tooltipRect = tooltip.getBoundingClientRect();
		if (x + tooltipRect.width > window.innerWidth - 8) x = Math.max(8, x - tooltipRect.width - 34);
		if (y + tooltipRect.height > window.innerHeight - 8) y = Math.max(8, window.innerHeight - tooltipRect.height - 8);
		tooltip.style.left = Math.max(8, x) + "px";
		tooltip.style.top = Math.max(8, y) + "px";
	};

	var cancelQueuedTooltipPosition = function () {
		pendingTooltipPosition = null;
		if (tooltipMoveFrame == null) return;
		if (typeof window.cancelAnimationFrame === "function") window.cancelAnimationFrame(tooltipMoveFrame);
		tooltipMoveFrame = null;
	};

	/** 鼠标高频移动只在下一帧做一次尺寸读取与定位，避免每个 pointermove 都强制布局。 */
	var queueTooltipPosition = function (event, anchor) {
		if (typeof window.requestAnimationFrame !== "function") {
			positionTooltip(event, anchor);
			return;
		}
		pendingTooltipPosition = {
			event: event && Number.isFinite(event.clientX)
				? { clientX: event.clientX, clientY: event.clientY } : null,
			anchor: anchor
		};
		if (tooltipMoveFrame != null) return;
		tooltipMoveFrame = window.requestAnimationFrame(function () {
			tooltipMoveFrame = null;
			var pending = pendingTooltipPosition;
			pendingTooltipPosition = null;
			if (pending) positionTooltip(pending.event, pending.anchor);
		});
	};

	var showTooltip = function (anchor, html, event) {
		if (!anchor || !html) return;
		if (tooltipHideTimer) clearTimeout(tooltipHideTimer);
		tooltipHideTimer = null;
		cancelQueuedTooltipPosition();
		ensureTooltip();
		if (activeAnchor && activeAnchor !== anchor) activeAnchor.classList.remove("bui-hover");
		activeAnchor = anchor;
		anchor.classList.add("bui-hover");
		if (lastTooltipHtml !== html) {
			tooltip.innerHTML = html;
			lastTooltipHtml = html;
		}
		tooltip.classList.add("show");
		positionTooltip(event, anchor);
	};

	var hideTooltip = function (anchor) {
		if (tooltipHideTimer) clearTimeout(tooltipHideTimer);
		tooltipHideTimer = null;
		if (anchor && activeAnchor && anchor !== activeAnchor) return;
		cancelQueuedTooltipPosition();
		if (activeAnchor) activeAnchor.classList.remove("bui-hover");
		if (tooltip) tooltip.classList.remove("show");
		activeAnchor = null;
	};

	var scheduleTooltipHide = function (anchor) {
		if (tooltipHideTimer) clearTimeout(tooltipHideTimer);
		tooltipHideTimer = setTimeout(function () { hideTooltip(anchor); }, TOOLTIP_HIDE_DELAY);
	};

	var bindTooltip = function (element, provider, options) {
		if (!element || element.dataset.buiTooltipBound) return;
		options = options || {};
		element.dataset.buiTooltipBound = "1";
		var hitTargets = options.hitTargets
			? Array.prototype.slice.call(options.hitTargets)
			: [element];
		var isSameHitArea = function (relatedTarget) {
			return !!relatedTarget && hitTargets.some(function (target) {
				return target === relatedTarget || (target.contains && target.contains(relatedTarget));
			});
		};
		var enter = function (event) {
			if (event.pointerType === "touch") return;
			var wasActive = activeAnchor === element;
			showTooltip(element, provider(), event);
			if (!wasActive && options.onEnter) options.onEnter(event);
		};
		var move = function (event) {
			if (activeAnchor === element) queueTooltipPosition(event, element);
		};
		var leave = function (event) {
			if (isSameHitArea(event.relatedTarget)) return;
			if (tooltip && event.relatedTarget && tooltip.contains(event.relatedTarget)) return;
			scheduleTooltipHide(element);
			if (options.onLeave) options.onLeave(event);
		};
		hitTargets.forEach(function (target) {
			target.addEventListener("pointerenter", enter);
			target.addEventListener("pointermove", move);
			target.addEventListener("pointerleave", leave);
		});
		element.addEventListener("focus", function () {
			var wasActive = activeAnchor === element;
			showTooltip(element, provider());
			if (!wasActive && options.onEnter) options.onEnter();
		});
		element.addEventListener("blur", function (event) {
			if (tooltip && event.relatedTarget && tooltip.contains(event.relatedTarget)) return;
			scheduleTooltipHide(element);
			if (options.onLeave) options.onLeave(event);
		});
	};

	var buildStatusTooltip = function (definition, stacks, description, remainingTicks) {
		var kind = definition.kind === "buff" ? "Buff" : "Debuff";
		return "<article class='bui-status-tip'><h3><span>" + escapeHtml(definition.name)
			+ "</span><small style='color:" + escapeHtml(definition.color || "#fff") + "'>" + kind + "</small></h3>"
			+ "<p>当前层数：<strong>" + escapeHtml(formatNumber(stacks, 1)) + "</strong></p>"
			+ "<p>" + escapeHtml(description) + "</p>"
			+ (definition.periodic ? "<p>距离下次结算：<strong>" + escapeHtml(formatNumber(remainingTicks / 100)) + " 秒</strong></p>" : "")
			+ "</article>";
	};

	return {
		escapeHtml: escapeHtml,
		formatNumber: formatNumber,
		formatPercent: formatPercent,
		formatSpecialEffectHtml: formatSpecialEffectHtml,
		getWeaponKey: getWeaponKey,
		getWeaponRecipes: getWeaponRecipes,
		canCraftWithWeapon: canCraftWithWeapon,
		buildWeaponGridPreviewHtml: buildWeaponGridPreviewHtml,
		buildWeaponTooltip: buildWeaponTooltip,
		buildStatusTooltip: buildStatusTooltip,
		renderWeaponName: renderWeaponName,
		appendCraftHammer: appendCraftHammer,
		openWeaponRecipePreview: openWeaponRecipePreview,
		closeWeaponRecipePreview: closeWeaponRecipePreview,
		bindTooltip: bindTooltip,
		showTooltip: showTooltip,
		hideTooltip: hideTooltip
	};
})();
