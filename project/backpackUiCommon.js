/** 背包与战斗共用的武器详情 Tooltip 和显示格式。 */
var backpackUiCommon_2c986f67_7621_44eb_972d_24f1e2c6ce61 = (function () {
	"use strict";

	var tooltip = null;
	var activeAnchor = null;
	var lastPointer = null;

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
		var html = [
			"<article class='bui-weapon-tip'>",
			"<header><div><b>" + escapeHtml(weapon.name || current.name || "未命名武器") + "</b>",
			weapon.sourceName ? "<small>" + escapeHtml(weapon.sourceName) + "</small>" : "",
			"</div><span class='bui-rarity'>" + escapeHtml(rarityText) + "</span></header>",
			"<div class='bui-type-row'>" + (types.length
				? types.map(function (type) { return "<i>" + escapeHtml(type) + "</i>"; }).join("")
				: "<i>未分类</i>") + "</div>",
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
		html.push("</dl>");
		var specialText = weapon.synergyText || data.synergyText;
		html.push("<section><h4>特殊效果</h4><p>" + escapeHtml(specialText || "无特殊效果") + "</p></section>");
		var bonuses = current.bonuses || data.bonuses || [];
		if (bonuses.length) {
			html.push("<section><h4>当前布局加成</h4><ul>"
				+ bonuses.map(function (bonus) { return "<li>" + describeBonus(bonus) + "</li>"; }).join("")
				+ "</ul></section>");
		}
		html.push("</article>");
		return html.join("");
	};

	var ensureTooltip = function () {
		if (tooltip && tooltip.isConnected) return tooltip;
		tooltip = document.createElement("div");
		tooltip.className = "bui-tooltip";
		tooltip.setAttribute("role", "tooltip");
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

	var showTooltip = function (anchor, html, event) {
		if (!anchor || !html) return;
		ensureTooltip();
		if (activeAnchor && activeAnchor !== anchor) activeAnchor.classList.remove("bui-hover");
		activeAnchor = anchor;
		anchor.classList.add("bui-hover");
		tooltip.innerHTML = html;
		tooltip.classList.add("show");
		positionTooltip(event, anchor);
	};

	var hideTooltip = function (anchor) {
		if (anchor && activeAnchor && anchor !== activeAnchor) return;
		if (activeAnchor) activeAnchor.classList.remove("bui-hover");
		if (tooltip) tooltip.classList.remove("show");
		activeAnchor = null;
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
			if (activeAnchor === element) positionTooltip(event, element);
		};
		var leave = function (event) {
			if (isSameHitArea(event.relatedTarget)) return;
			hideTooltip(element);
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
			hideTooltip(element);
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
		buildWeaponTooltip: buildWeaponTooltip,
		buildStatusTooltip: buildStatusTooltip,
		bindTooltip: bindTooltip,
		showTooltip: showTooltip,
		hideTooltip: hideTooltip
	};
})();
