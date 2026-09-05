/** 碧蓝幻想公共美术组件。规范见 UI美术规范.md；Canvas 与 DOM 共用同一套边框几何。 */
var fantasyUI_6f31b8ea_7c4d_4b67_a215_03b247f8e903 = (function () {
	"use strict";
	var UI_INK = "#214b70";
	var UI_GOLD = "#dac58a";
	var UI_SERIF = "'Noto Serif SC', 'Songti SC', 'SimSun', serif";
	var UI_SANS = "'Microsoft YaHei', sans-serif";

	var drawLabelOn = function (context, text, x, y, size, color, align, weight, serif) {
		context.save();
		context.font = (weight || "normal") + " " + size + "px " + (serif ? UI_SERIF : UI_SANS);
		context.fillStyle = color || UI_INK;
		context.textAlign = align || "left";
		context.textBaseline = "alphabetic";
		var value = String(text);
		var metrics = context.measureText(value);
		var ascent = metrics.actualBoundingBoxAscent || size * 0.78;
		var descent = metrics.actualBoundingBoxDescent || size * 0.22;
		context.fillText(value, x, y + (ascent - descent) / 2);
		context.restore();
	};

	var diamondOn = function (context, x, y, width, height, color) {
		context.beginPath();
		context.moveTo(x, y - height / 2);
		context.lineTo(x + width / 2, y);
		context.lineTo(x, y + height / 2);
		context.lineTo(x - width / 2, y);
		context.closePath();
		context.fillStyle = color;
		context.fill();
	};

	var arcFramePath = function (context, box, inset, radius) {
		var x = box.x + inset, y = box.y + inset;
		var w = box.w - inset * 2, h = box.h - inset * 2;
		var r = Math.max(2, Math.min(radius - inset * 0.45, w / 4, h / 4));
		context.beginPath();
		context.moveTo(x + r, y);
		context.lineTo(x + w - r, y);
		context.arc(x + w, y, r, Math.PI, Math.PI / 2, true);
		context.lineTo(x + w, y + h - r);
		context.arc(x + w, y + h, r, -Math.PI / 2, -Math.PI, true);
		context.lineTo(x + r, y + h);
		context.arc(x, y + h, r, 0, -Math.PI / 2, true);
		context.lineTo(x, y + r);
		context.arc(x, y, r, Math.PI / 2, 0, true);
		context.closePath();
	};

	var metalGradient = function (context, box) {
		var gold = context.createLinearGradient(box.x, box.y, box.x + box.w * 0.3, box.y + box.h);
		gold.addColorStop(0, "#f9e8ad");
		gold.addColorStop(0.19, "#dac18a");
		gold.addColorStop(0.42, "#fff8cf");
		gold.addColorStop(0.64, "#c6a466");
		gold.addColorStop(0.82, "#fff2b9");
		gold.addColorStop(1, "#d2b679");
		return gold;
	};

	var cornerFlourishOn = function (context, x, y, flipX, flipY, radius, ornate) {
		context.save();
		context.translate(x, y);
		context.scale(flipX, flipY);
		context.strokeStyle = "rgba(223,203,145,0.85)";
		context.lineWidth = 0.65;
		context.beginPath();
		context.moveTo(7, radius + 12);
		context.quadraticCurveTo(8, radius + 2, radius + 2, 8);
		context.lineTo(radius + 12, 7);
		context.stroke();
		diamondOn(context, 12, radius + 7, 2.5, 4.5, "#eedda3");
		if (ornate) {
			context.beginPath();
			context.moveTo(10, radius + 28);
			context.bezierCurveTo(10, radius + 9, 25, 24, radius + 27, 11);
			context.moveTo(13, radius + 22);
			context.quadraticCurveTo(25, 25, 20, 16);
			context.quadraticCurveTo(30, 22, radius + 22, 13);
			context.stroke();
			diamondOn(context, 24, 24, 3, 7, "#ecdaa0");
		}
		context.restore();
	};

	var drawCrestOn = function (context, x, y, size) {
		if (size >= 10) {
			context.save();
			context.strokeStyle = "#f2dfaa";
			context.lineWidth = 1.2;
			[-1, 1].forEach(function (direction) {
				context.save();
				context.translate(x, y);
				context.scale(direction, 1);
				context.beginPath();
				context.moveTo(size * 0.92, -2);
				context.quadraticCurveTo(size * 1.3, 5, size * 1.85, 3);
				context.quadraticCurveTo(size * 1.3, 2, size * 1.24, -3);
				context.stroke();
				diamondOn(context, size * 2.15, 2, 4, 2.5, "#f5e2aa");
				context.restore();
			});
			context.restore();
		}
		diamondOn(context, x, y, size * 1.55, size * 1.7, "#b6a16f");
		diamondOn(context, x, y, size * 1.28, size * 1.44, "#ffefb7");
		diamondOn(context, x, y, size * 0.87, size * 1.06, "#79a7c4");
		diamondOn(context, x, y, size * 0.42, size * 0.83, "#fff4c4");
	};

	var drawArcFrameOn = function (context, box, options) {
		options = options || {};
		var radius = options.radius || 12;
		context.save();
		if (options.fill) {
			arcFramePath(context, box, 1, radius);
			context.fillStyle = options.fill;
			context.shadowColor = "rgba(37,67,78,0.2)";
			context.shadowBlur = 7;
			context.shadowOffsetY = 2;
			context.fill();
			context.shadowBlur = 0;
			context.shadowOffsetY = 0;
		}
		// 一条较粗的暗金底沿托住两道反光，避免只有平涂黄线。
		[
			[0.6, 2.7, "rgba(137,111,61,0.60)"],
			[1.05, 1.65, metalGradient(context, box)],
			[2.35, 0.65, "#fff8d8"],
			[4.1, 0.7, "rgba(215,188,122,0.92)"],
			[6.3, 0.55, "rgba(255,253,226,0.8)"]
		].forEach(function (stroke) {
			arcFramePath(context, box, stroke[0], radius);
			context.strokeStyle = stroke[2];
			context.lineWidth = stroke[1];
			context.stroke();
		});
		if (options.selected || options.hovered) {
			arcFramePath(context, box, 1, radius);
			context.strokeStyle = options.selected ? "#ffdd77" : "#fff4c6";
			context.lineWidth = options.selected ? 3 : 1.8;
			context.shadowColor = "#ffd566";
			context.shadowBlur = options.selected ? 13 : 6;
			context.stroke();
			context.shadowBlur = 0;
			arcFramePath(context, box, 3.1, radius);
			context.strokeStyle = "#fffbdc";
			context.lineWidth = options.selected ? 1.1 : 0.6;
			context.stroke();
		}
		[[box.x, box.y, 1, 1], [box.x + box.w, box.y, -1, 1],
			[box.x, box.y + box.h, 1, -1], [box.x + box.w, box.y + box.h, -1, -1]]
			.forEach(function (corner) {
				cornerFlourishOn(context, corner[0], corner[1], corner[2], corner[3], radius, options.ornate);
			});
		if (options.crest) drawCrestOn(context, box.x + box.w / 2, box.y + 1, 12);
		context.restore();
	};

	var hexButtonPath = function (context, box, inset) {
		var x = box.x + inset, y = box.y + inset;
		var w = box.w - inset * 2, h = box.h - inset * 2;
		var cut = h * 0.40;
		context.beginPath();
		context.moveTo(x + cut, y);
		context.lineTo(x + w - cut, y);
		context.lineTo(x + w, y + h / 2);
		context.lineTo(x + w - cut, y + h);
		context.lineTo(x + cut, y + h);
		context.lineTo(x, y + h / 2);
		context.closePath();
	};

	var drawHexButtonOn = function (context, box, text, gold, selected, fontSize) {
		context.save();
		hexButtonPath(context, box, 0);
		context.fillStyle = "#92754c";
		context.shadowColor = selected ? "rgba(255,215,101,0.95)" : gold ? "rgba(255,231,158,0.65)" : "rgba(19,48,65,0.35)";
		context.shadowBlur = selected ? 15 : gold ? 7 : 4;
		context.shadowOffsetY = 2;
		context.fill();
		context.shadowBlur = 0;
		context.shadowOffsetY = 0;
		hexButtonPath(context, box, 0.9);
		context.fillStyle = metalGradient(context, box);
		context.fill();
		hexButtonPath(context, box, 2.4);
		context.strokeStyle = "#fff6cf";
		context.lineWidth = 1;
		context.stroke();
		hexButtonPath(context, box, 3.7);
		var fill = context.createLinearGradient(0, box.y, 0, box.y + box.h);
		if (gold) {
			fill.addColorStop(0, "#ffedb7");
			fill.addColorStop(0.36, "#e8bd68");
			fill.addColorStop(0.72, "#f5d790");
			fill.addColorStop(1, "#fff0b9");
		} else {
			fill.addColorStop(0, selected ? "#336597" : "#29537f");
			fill.addColorStop(0.40, "#467da6");
			fill.addColorStop(1, "#9bd1de");
		}
		context.fillStyle = fill;
		context.fill();
		context.strokeStyle = gold ? "#a57943" : "#a7bac0";
		context.lineWidth = 0.8;
		context.stroke();
		hexButtonPath(context, box, 6);
		context.strokeStyle = gold ? "rgba(255,248,199,0.72)" : "rgba(215,239,239,0.52)";
		context.lineWidth = 0.55;
		context.stroke();
		var middle = box.y + box.h / 2;
		var shine = context.createRadialGradient(box.x + box.w / 2, box.y + box.h, 0, box.x + box.w / 2, box.y + box.h, box.w * 0.35);
		shine.addColorStop(0, "rgba(255,255,214,0.55)");
		shine.addColorStop(1, "rgba(255,255,214,0)");
		hexButtonPath(context, box, 3.9);
		context.fillStyle = shine;
		context.fill();
		// 斜肩内侧的弧形反光与两端菱形呼应参考图的金属雕花。
		var glintScale = box.h / 40;
		[-1, 1].forEach(function (side) {
			[-1, 1].forEach(function (edge) {
				context.save();
				context.translate(side === 1 ? box.x : box.x + box.w, edge === 1 ? box.y : box.y + box.h);
				context.scale(side * glintScale, edge * glintScale);
				context.beginPath();
				context.moveTo(19, 10);
				context.quadraticCurveTo(22, 6.8, 28, 7.5);
				context.quadraticCurveTo(22, 8.5, 19, 13);
				context.closePath();
				context.fillStyle = gold ? "rgba(255,246,192,0.82)" : "rgba(210,233,228,0.5)";
				context.fill();
				context.restore();
			});
		});
		diamondOn(context, box.x + box.h * 0.43, middle, 4, 2.8, gold ? "#b5894d" : "#f9e8aa");
		diamondOn(context, box.x + box.w - box.h * 0.43, middle, 4, 2.8, gold ? "#b5894d" : "#f9e8aa");
		if (selected) {
			// 悬停时沿六边形轮廓发光，保留原有的多层金属边沿。
			hexButtonPath(context, box, 0.8);
			context.strokeStyle = "#ffe18a";
			context.lineWidth = 2.1;
			context.shadowColor = "#ffd567";
			context.shadowBlur = 10;
			context.stroke();
			context.shadowBlur = 0;
			hexButtonPath(context, box, 2.7);
			context.strokeStyle = "#fffde4";
			context.lineWidth = 1.25;
			context.stroke();
		}
		context.shadowColor = gold ? "rgba(255,249,204,0.85)" : "rgba(17,48,79,0.55)";
		context.shadowOffsetY = 1;
		context.shadowBlur = 1;
		drawLabelOn(context, text, box.x + box.w / 2, middle, fontSize, gold ? "#70471f" : "#fff5cf", "center", "bold", true);
		context.restore();
	};


	var tokens = {
		ink: UI_INK, gold: UI_GOLD, serif: UI_SERIF, sans: UI_SANS,
		goldShadow: "#92754c", ivory: "#fff8d8", blue: "#29537f",
		blueLight: "#9bd1de", hover: "#ffe18a"
	};

	var pearlGradient = function (context, box, variant) {
		var fill = context.createLinearGradient(0, box.y, 0, box.y + box.h);
		if (variant === "gold") {
			fill.addColorStop(0, "#fff2cc");
			fill.addColorStop(0.5, "#fffbee");
			fill.addColorStop(1, "#f4e5b9");
		} else {
			fill.addColorStop(0, variant === "blue" ? "rgba(96,152,201,.96)" : "rgba(238,249,253,.96)");
			fill.addColorStop(0.5, "rgba(231,245,247,.98)");
			fill.addColorStop(1, "rgba(255,252,231,.98)");
		}
		return fill;
	};

	var installStyles = function () {
		if (document.getElementById("fantasy-ui-style")) return;
		var style = document.createElement("style");
		style.id = "fantasy-ui-style";
		style.textContent = ".fantasy-ui-surface{position:relative;isolation:isolate}"
			+ ".fantasy-ui-art{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:0}"
			+ ".fantasy-ui-surface>:not(.fantasy-ui-art){position:relative;z-index:1}"
			+ ".fantasy-ui-button{appearance:none;border:0;background:transparent;overflow:visible;cursor:pointer;color:#fff5cf;font-weight:bold;font-family:" + UI_SERIF + ";text-shadow:0 1px 1px #214b70}"
			+ ".fantasy-ui-button[data-gold=true]{color:#70471f;text-shadow:0 1px 1px #fff8d8}"
			+ ".fantasy-ui-button:focus-visible{outline:none}";
		document.head.appendChild(style);
	};

	// DOM 承载内容和点击；装饰复用原始 Canvas 路径，缩放不拉伸弧角。
	var decorations = new Map();
	var observer = null;
	var decorate = function (element, options) {
		installStyles();
		options = options || {};
		var art = document.createElement("canvas");
		art.className = "fantasy-ui-art";
		art.setAttribute("aria-hidden", "true");
		// Canvas 位图自身也会裁切阴影；额外留出绘制区域，不能只设 overflow:visible。
		// 按钮默认扩展；固定筛选卡可显式指定，滚动列表卡片默认不扩展。
		var bleed = options.button ? 24 : Math.max(0, Math.min(24, Number(options.bleed) || 0));
		if (bleed) {
			art.style.inset = -bleed + "px";
			art.style.width = "calc(100% + " + bleed * 2 + "px)";
			art.style.height = "calc(100% + " + bleed * 2 + "px)";
		}
		element.classList.add("fantasy-ui-surface");
		if (options.button) {
			element.classList.add("fantasy-ui-button");
			element.dataset.gold = String(!!options.gold);
			var label = document.createElement("span");
			while (element.firstChild) label.appendChild(element.firstChild);
			element.appendChild(label);
		}
		element.insertBefore(art, element.firstChild);
		var hovered = false;
		var focused = false;
		var paint = function () {
			var width = element.clientWidth, height = element.clientHeight;
			if (!width || !height) return;
			var ratio = Math.min(window.devicePixelRatio || 1, 3);
			art.width = Math.round((width + bleed * 2) * ratio);
			art.height = Math.round((height + bleed * 2) * ratio);
			var context = art.getContext("2d");
			context.setTransform(ratio, 0, 0, ratio, bleed * ratio, bleed * ratio);
			var box = { x: 3, y: options.crest ? 10 : 3, w: width - 6, h: height - (options.crest ? 13 : 6) };
			if (options.button) {
				drawHexButtonOn(context, box, "", options.gold, hovered || focused, 16);
			} else {
				drawArcFrameOn(context, box, {
					radius: options.radius || 16, ornate: options.ornate, crest: options.crest,
					fill: pearlGradient(context, box, options.fill),
					selected: options.selected, hovered: hovered || focused
				});
			}
		};
		var enter = function () { hovered = true; paint(); };
		var leave = function () { hovered = false; paint(); };
		var focus = function () { focused = true; paint(); };
		var blur = function (event) { if (!element.contains(event.relatedTarget)) { focused = false; paint(); } };
		if (options.interactive || options.button) {
			element.addEventListener("pointerenter", enter);
			element.addEventListener("pointerleave", leave);
			element.addEventListener("focusin", focus);
			element.addEventListener("focusout", blur);
		}
		if (!observer && typeof ResizeObserver !== "undefined") {
			observer = new ResizeObserver(function (entries) {
				entries.forEach(function (entry) {
					var record = decorations.get(entry.target);
					if (record) record.paint();
				});
			});
		}
		decorations.set(element, { paint: paint, dispose: function () {
			if (observer) observer.unobserve(element);
			element.removeEventListener("pointerenter", enter);
			element.removeEventListener("pointerleave", leave);
			element.removeEventListener("focusin", focus);
			element.removeEventListener("focusout", blur);
			art.remove();
			decorations.delete(element);
		} });
		if (observer) observer.observe(element);
		paint();
	};
	var releaseTree = function (root) {
		if (!root) return;
		decorations.forEach(function (record, element) {
			if (element === root || root.contains(element)) record.dispose();
		});
	};
	window.addEventListener("resize", function () {
		decorations.forEach(function (record) { record.paint(); });
	});

	return {
		tokens: tokens, drawLabelOn: drawLabelOn, diamondOn: diamondOn,
		arcFramePath: arcFramePath, metalGradient: metalGradient, cornerFlourishOn: cornerFlourishOn,
		drawCrestOn: drawCrestOn, drawArcFrameOn: drawArcFrameOn,
		hexButtonPath: hexButtonPath, drawHexButtonOn: drawHexButtonOn,
		pearlGradient: pearlGradient, decorate: decorate, releaseTree: releaseTree
	};
})();
