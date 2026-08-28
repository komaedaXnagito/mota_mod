/**
 * 开局职业选择界面。
 *
 * 只负责展示和提交初始职业；现有 flags.randomList 的共享基础武器池保持不变，
 * 29 层转职继续由楼层事件负责追加专属武器。
 */
var installCareerSelect_54c7b8d1_6f26_4c48_9f45_1d87a2bb4df0 = function (core, plugin) {
	"use strict";

	var CAREERS = [
		{
			id: "剑",
			name: "剑士",
			tagline: "攻守兼备的近战起点",
			color: "#ffb45b",
			accent: "#ff6b4a",
			portrait: "career-sword.png",
			portraitFilter: "none",
			promotions: ["狂战士", "双剑士", "盾誓士", "魔剑士"],
			poolTypes: ["剑", "盾", "短", "斧"],
			poolPreview: "七星剑、修瓦利耶之剑、真龙之盾",
			unlockText: "29层解锁刀类；狂战士额外解锁专属斧。"
		},
		{
			id: "琴",
			name: "乐师",
			tagline: "围绕节奏与联动展开战斗",
			color: "#53e4ff",
			accent: "#8b7bff",
			portrait: "career-qin.png",
			portraitFilter: "none",
			promotions: ["兽王", "摇滚巨星", "极乐净土"],
			poolTypes: ["乐器", "食物", "饮料"],
			poolPreview: "追忆小提琴、语部之弦、史莱姆铃铛",
			unlockText: "29层可追加动物或吉他相关武器。"
		},
		{
			id: "杖",
			name: "术士",
			tagline: "法术、召唤与资源循环",
			color: "#c79cff",
			accent: "#53d8b4",
			portrait: "career-staff.png",
			portraitFilter: "none",
			promotions: ["黑猫道士", "使役者"],
			poolTypes: ["杖", "召唤石", "道具"],
			poolPreview: "巖迫之躯杖、钢棍、格里姆尼尔",
			unlockText: "29层可追加专属法杖或精灵相关武器。"
		}
	];

	var canvas = null;
	var ctx = null;
	var titleCanvas = null;
	var titleCtx = null;
	var titleVideo = null;
	var titleImage = null;
	var buttonFrameImage = null;
	var titleAnimationFrame = null;
	var titleLastFrame = 0;
	var titleHitboxes = [];
	var titleSelection = 0;
	var selectedIndex = 0;
	var visible = false;
	var walkFrame = 0;
	var walkTimer = null;
	var hitboxes = [];

	var roundRect = function (context, x, y, width, height, radius) {
		radius = Math.max(0, Math.min(radius, Math.min(width, height) / 2));
		context.beginPath();
		context.moveTo(x + radius, y);
		context.lineTo(x + width - radius, y);
		context.quadraticCurveTo(x + width, y, x + width, y + radius);
		context.lineTo(x + width, y + height - radius);
		context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
		context.lineTo(x + radius, y + height);
		context.quadraticCurveTo(x, y + height, x, y + height - radius);
		context.lineTo(x, y + radius);
		context.quadraticCurveTo(x, y, x + radius, y);
		context.closePath();
	};

	var fillRoundRect = function (x, y, width, height, radius, color) {
		ctx.save();
		roundRect(ctx, x, y, width, height, radius);
		ctx.fillStyle = color;
		ctx.fill();
		ctx.restore();
	};

	var strokeRoundRect = function (x, y, width, height, radius, color, lineWidth) {
		ctx.save();
		roundRect(ctx, x, y, width, height, radius);
		ctx.strokeStyle = color;
		ctx.lineWidth = lineWidth || 1;
		ctx.stroke();
		ctx.restore();
	};

	var drawText = function (text, x, y, size, color, align, weight) {
		ctx.save();
		ctx.font = (weight || "normal") + " " + size + "px 'Microsoft YaHei', sans-serif";
		ctx.fillStyle = color || "#fff";
		ctx.textAlign = align || "left";
		ctx.textBaseline = "middle";
		ctx.fillText(String(text), x, y);
		ctx.restore();
	};

	var drawWrappedText = function (text, x, y, maxWidth, lineHeight, maxLines, color, size) {
		ctx.save();
		ctx.font = (size || 12) + "px 'Microsoft YaHei', sans-serif";
		ctx.fillStyle = color || "#dce5f3";
		ctx.textAlign = "left";
		ctx.textBaseline = "top";
		var line = "";
		var lines = [];
		String(text).split("").forEach(function (character) {
			var next = line + character;
			if (line && ctx.measureText(next).width > maxWidth) {
				lines.push(line);
				line = character;
			} else line = next;
		});
		if (line) lines.push(line);
		lines.slice(0, maxLines || lines.length).forEach(function (one, index) {
			ctx.fillText(one, x, y + index * lineHeight);
		});
		ctx.restore();
	};

	var drawTag = function (text, x, y, color) {
		ctx.save();
		ctx.font = "bold 12px 'Microsoft YaHei', sans-serif";
		var width = Math.ceil(ctx.measureText(text).width) + 18;
		ctx.restore();
		fillRoundRect(x, y, width, 24, 12, "rgba(255,255,255,0.08)");
		strokeRoundRect(x, y, width, 24, 12, color, 1.5);
		drawText(text, x + width / 2, y + 12, 12, color, "center", "bold");
		return width;
	};

	var drawBackground = function (width, height) {
		var gradient = ctx.createLinearGradient(0, 0, width, height);
		gradient.addColorStop(0, "#111827");
		gradient.addColorStop(0.55, "#172036");
		gradient.addColorStop(1, "#24172e");
		ctx.fillStyle = gradient;
		ctx.fillRect(0, 0, width, height);

		ctx.save();
		ctx.globalAlpha = 0.08;
		ctx.strokeStyle = "#ffffff";
		ctx.lineWidth = 1;
		for (var line = -height; line < width + height; line += 28) {
			ctx.beginPath();
			ctx.moveTo(line, 0);
			ctx.lineTo(line - height, height);
			ctx.stroke();
		}
		ctx.restore();

		var glow = ctx.createRadialGradient(width * 0.58, height * 0.34, 10, width * 0.58, height * 0.34, width * 0.45);
		glow.addColorStop(0, CAREERS[selectedIndex].color + "30");
		glow.addColorStop(1, "rgba(0,0,0,0)");
		ctx.fillStyle = glow;
		ctx.fillRect(0, 0, width, height);
	};

	var drawCareerCard = function (career, index, box) {
		var selected = index === selectedIndex;
		fillRoundRect(box.x, box.y, box.w, box.h, 10, selected ? "rgba(255,255,255,0.13)" : "rgba(5,10,22,0.68)");
		strokeRoundRect(box.x, box.y, box.w, box.h, 10, selected ? career.color : "rgba(255,255,255,0.20)", selected ? 3 : 1.5);
		fillRoundRect(box.x + 9, box.y + 12, 38, 38, 19, selected ? career.color : "rgba(255,255,255,0.12)");
		drawText(career.id, box.x + 28, box.y + 31, 22, selected ? "#101522" : "#d8dfeb", "center", "bold");
		drawText(career.name, box.x + 57, box.y + 23, 18, selected ? "#ffffff" : "#d7dce7", "left", "bold");
		drawWrappedText(career.tagline, box.x + 57, box.y + 43, box.w - 66, 15, 2, selected ? career.color : "#8792a7", 11);
		if (selected) {
			ctx.fillStyle = career.color;
			ctx.beginPath();
			ctx.moveTo(box.x + box.w - 12, box.y + box.h / 2 - 7);
			ctx.lineTo(box.x + box.w - 4, box.y + box.h / 2);
			ctx.lineTo(box.x + box.w - 12, box.y + box.h / 2 + 7);
			ctx.closePath();
			ctx.fill();
		}
		hitboxes.push({ type: "career", index: index, x: box.x, y: box.y, w: box.w, h: box.h });
	};

	var getPortraitImage = function (career) {
		return core.material && core.material.images && core.material.images.images
			? core.material.images.images[career.portrait] : null;
	};

	var drawPortrait = function (career, box) {
		ctx.save();
		roundRect(ctx, box.x, box.y, box.w, box.h, 12);
		ctx.clip();
		var gradient = ctx.createLinearGradient(box.x, box.y, box.x, box.y + box.h);
		gradient.addColorStop(0, career.color + "35");
		gradient.addColorStop(1, "#080d18");
		ctx.fillStyle = gradient;
		ctx.fillRect(box.x, box.y, box.w, box.h);

		var image = getPortraitImage(career);
		if (image && image.width && image.height) {
			var targetRatio = box.w / box.h;
			var imageRatio = image.width / image.height;
			var sx = 0;
			var sy = 0;
			var sw = image.width;
			var sh = image.height;
			if (imageRatio < targetRatio) {
				sh = image.width / targetRatio;
				sy = Math.min(image.height - sh, image.height * 0.035);
			} else {
				sw = image.height * targetRatio;
				sx = (image.width - sw) / 2;
			}
			ctx.filter = career.portraitFilter || "none";
			ctx.drawImage(image, sx, sy, sw, sh, box.x, box.y, box.w, box.h);
			ctx.filter = "none";
		} else {
			drawText(career.id, box.x + box.w / 2, box.y + box.h / 2, 96, career.color, "center", "bold");
		}
		var shade = ctx.createLinearGradient(0, box.y + box.h - 72, 0, box.y + box.h);
		shade.addColorStop(0, "rgba(5,9,18,0)");
		shade.addColorStop(1, "rgba(5,9,18,0.92)");
		ctx.fillStyle = shade;
		ctx.fillRect(box.x, box.y + box.h - 72, box.w, 72);
		ctx.restore();
		strokeRoundRect(box.x, box.y, box.w, box.h, 12, career.color, 2);
		drawText("临时职业立绘", box.x + box.w / 2, box.y + box.h - 16, 12, "#ffffff", "center", "bold");
	};

	var drawHeroSprite = function (x, y, size, career) {
		fillRoundRect(x, y, size, size, 9, "rgba(5,10,22,0.72)");
		strokeRoundRect(x, y, size, size, 9, career.color, 1.5);
		var heroImage = core.material && core.material.images ? core.material.images.hero : null;
		if (heroImage && heroImage.width && heroImage.height) {
			var frameWidth = heroImage.width / 4;
			var frameHeight = heroImage.height / 4;
			ctx.imageSmoothingEnabled = false;
			ctx.drawImage(heroImage, walkFrame * frameWidth, 0, frameWidth, frameHeight, x + 8, y + 8, size - 16, size - 16);
			ctx.imageSmoothingEnabled = true;
		} else drawText("勇", x + size / 2, y + size / 2, 24, career.color, "center", "bold");
	};

	var drawPromotions = function (career, x, y, maxWidth, compact) {
		var cursorX = x;
		var cursorY = y;
		var rowHeight = compact ? 27 : 29;
		career.promotions.forEach(function (promotion) {
			ctx.save();
			ctx.font = "bold " + (compact ? 11 : 12) + "px 'Microsoft YaHei', sans-serif";
			var width = Math.ceil(ctx.measureText(promotion).width) + (compact ? 16 : 20);
			ctx.restore();
			if (cursorX + width > x + maxWidth) {
				cursorX = x;
				cursorY += rowHeight;
			}
			fillRoundRect(cursorX, cursorY, width, compact ? 22 : 24, 6, "rgba(255,255,255,0.08)");
			strokeRoundRect(cursorX, cursorY, width, compact ? 22 : 24, 6, career.color, 1);
			drawText(promotion, cursorX + width / 2, cursorY + (compact ? 11 : 12), compact ? 11 : 12, "#ffffff", "center", "bold");
			cursorX += width + 7;
		});
		return cursorY + (compact ? 22 : 24);
	};

	var drawPool = function (career, x, y, maxWidth, compact) {
		var cursorX = x;
		career.poolTypes.forEach(function (type) {
			var width = drawTag(type, cursorX, y, career.color);
			cursorX += width + 6;
		});
		drawWrappedText("代表武器：" + career.poolPreview, x, y + 33, maxWidth, compact ? 15 : 17, 2, "#e5ebf5", compact ? 11 : 12);
		drawWrappedText(career.unlockText, x, y + (compact ? 66 : 71), maxWidth, compact ? 15 : 17, 2, career.color, compact ? 11 : 12);
	};

	var drawConfirmButton = function (box, career) {
		var gradient = ctx.createLinearGradient(box.x, box.y, box.x + box.w, box.y);
		gradient.addColorStop(0, career.accent);
		gradient.addColorStop(1, career.color);
		fillRoundRect(box.x, box.y, box.w, box.h, box.h / 2, gradient);
		strokeRoundRect(box.x, box.y, box.w, box.h, box.h / 2, "rgba(255,255,255,0.86)", 2);
		drawText("以" + career.name + "开始", box.x + box.w / 2, box.y + box.h / 2, 16, "#111827", "center", "bold");
		hitboxes.push({ type: "confirm", x: box.x, y: box.y, w: box.w, h: box.h });
	};

	var renderLandscape = function () {
		var career = CAREERS[selectedIndex];
		drawBackground(676, 416);
		drawText("选择初始职业", 18, 26, 23, "#ffffff", "left", "bold");
		drawText("职业决定29层的转职路线；当前基础武器池保持共享", 658, 27, 12, "#aab5c8", "right", "normal");

		CAREERS.forEach(function (one, index) {
			drawCareerCard(one, index, { x: 14, y: 57 + index * 89, w: 148, h: 78 });
		});
		fillRoundRect(14, 329, 148, 69, 10, "rgba(5,10,22,0.62)");
		strokeRoundRect(14, 329, 148, 69, 10, "rgba(255,255,255,0.16)", 1);
		drawText("操作提示", 25, 345, 12, career.color, "left", "bold");
		drawWrappedText("点击左侧职业查看详情，确认后进入游戏。", 25, 358, 126, 16, 3, "#aab5c8", 11);

		drawPortrait(career, { x: 174, y: 57, w: 220, h: 341 });

		fillRoundRect(406, 57, 256, 341, 12, "rgba(5,10,22,0.72)");
		strokeRoundRect(406, 57, 256, 341, 12, "rgba(255,255,255,0.18)", 1.5);
		drawText(career.name, 422, 80, 25, "#ffffff", "left", "bold");
		drawText(career.id + "系初始职业", 422, 105, 12, career.color, "left", "bold");
		drawHeroSprite(596, 70, 48, career);
		drawText("行走图：勇者（临时）", 644, 126, 10, "#93a0b6", "right", "normal");

		drawText("进一步转职", 422, 147, 13, "#ffffff", "left", "bold");
		var promotionBottom = drawPromotions(career, 422, 163, 224, false);
		drawText("职业武器池", 422, promotionBottom + 19, 13, "#ffffff", "left", "bold");
		drawPool(career, 422, promotionBottom + 34, 224, false);
		drawConfirmButton({ x: 476, y: 354, w: 168, h: 34 }, career);
	};

	var renderVertical = function () {
		var career = CAREERS[selectedIndex];
		drawBackground(416, 676);
		drawText("选择初始职业", 14, 27, 22, "#ffffff", "left", "bold");
		drawText("点击左侧切换", 402, 28, 11, "#aab5c8", "right", "normal");

		CAREERS.forEach(function (one, index) {
			drawCareerCard(one, index, { x: 10, y: 55 + index * 89, w: 103, h: 78 });
		});
		drawPortrait(career, { x: 123, y: 55, w: 283, h: 256 });
		drawHeroSprite(348, 67, 46, career);
		drawText("勇者行走图", 371, 121, 9, "#ffffff", "center", "bold");

		fillRoundRect(10, 323, 396, 343, 12, "rgba(5,10,22,0.75)");
		strokeRoundRect(10, 323, 396, 343, 12, "rgba(255,255,255,0.18)", 1.5);
		drawText(career.name, 24, 350, 24, "#ffffff", "left", "bold");
		drawText(career.tagline, 392, 351, 11, career.color, "right", "bold");
		drawText("进一步转职", 24, 383, 13, "#ffffff", "left", "bold");
		var promotionBottom = drawPromotions(career, 24, 400, 368, true);
		drawText("职业武器池", 24, promotionBottom + 21, 13, "#ffffff", "left", "bold");
		drawPool(career, 24, promotionBottom + 38, 368, true);
		drawWrappedText("基础池当前为三职业共享；转职后按路线追加专属武器。", 24, 581, 368, 16, 2, "#93a0b6", 11);
		drawConfirmButton({ x: 116, y: 621, w: 184, h: 34 }, career);
	};

	var render = function () {
		if (!visible || !canvas || !ctx) return;
		hitboxes = [];
		var vertical = !!(core.domStyle && core.domStyle.isVertical);
		var groupRect = core.dom.gameGroup.getBoundingClientRect();
		canvas.style.width = groupRect.width + "px";
		canvas.style.height = groupRect.height + "px";
		if (core.maps && typeof core.maps._setHDCanvasSize === "function") {
			core.maps._setHDCanvasSize(ctx, vertical ? 416 : 676, vertical ? 676 : 416);
		} else {
			canvas.width = vertical ? 416 : 676;
			canvas.height = vertical ? 676 : 416;
		}
		ctx.clearRect(0, 0, vertical ? 416 : 676, vertical ? 676 : 416);
		if (vertical) renderVertical();
		else renderLandscape();
	};

	var isInside = function (x, y, box) {
		return x >= box.x && x <= box.x + box.w && y >= box.y && y <= box.y + box.h;
	};

	var getPointerPosition = function (event) {
		var rect = canvas.getBoundingClientRect();
		return {
			x: (event.clientX - rect.left) * (core.domStyle && core.domStyle.isVertical ? 416 : 676) / rect.width,
			y: (event.clientY - rect.top) * (core.domStyle && core.domStyle.isVertical ? 676 : 416) / rect.height
		};
	};

	var chooseCareer = function (index) {
		selectedIndex = Math.max(0, Math.min(CAREERS.length - 1, index));
		render();
	};

	var confirm = function () {
		if (!visible) return;
		var career = CAREERS[selectedIndex];
		core.setFlag("kaiju", career.id);
		if (core.status && Array.isArray(core.status.route) && !(core.isReplaying && core.isReplaying())) {
			core.status.route.push("input2:" + core.encodeBase64(core.encodeBase64(career.id)));
		}
		visible = false;
		canvas.style.display = "none";
		if (walkTimer) clearInterval(walkTimer);
		walkTimer = null;
		if (main.dom.outerBackground) main.dom.outerBackground.style.display = "block";
		if (main.dom.outerUI) main.dom.outerUI.style.display = "block";
		core.doAction();
	};

	var createCanvas = function () {
		if (canvas) return;
		canvas = document.createElement("canvas");
		canvas.id = "careerSelect";
		canvas.style.position = "fixed";
		canvas.style.left = "50%";
		canvas.style.top = "50%";
		canvas.style.transform = "translate(-50%, -50%)";
		canvas.style.zIndex = "10000";
		canvas.style.display = "none";
		canvas.style.touchAction = "none";
		canvas.style.cursor = "default";
		canvas.style.background = "#050912";
		canvas.style.boxShadow = "0 0 0 9999px #000";
		canvas.tabIndex = 0;
		canvas.setAttribute("role", "dialog");
		canvas.setAttribute("aria-label", "选择初始职业");
		core.dom.gameGroup.insertAdjacentElement("afterend", canvas);
		ctx = canvas.getContext("2d");

		canvas.addEventListener("click", function (event) {
			if (!visible) return;
			var point = getPointerPosition(event);
			for (var index = 0; index < hitboxes.length; index++) {
				var box = hitboxes[index];
				if (!isInside(point.x, point.y, box)) continue;
				if (box.type === "career") chooseCareer(box.index);
				else if (box.type === "confirm") confirm();
				break;
			}
		});

		canvas.addEventListener("mousemove", function (event) {
			if (!visible) return;
			var point = getPointerPosition(event);
			canvas.style.cursor = hitboxes.some(function (box) { return isInside(point.x, point.y, box); }) ? "pointer" : "default";
		});

		canvas.addEventListener("keydown", function (event) {
			if (!visible) return;
			if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
				event.preventDefault();
				chooseCareer((selectedIndex + CAREERS.length - 1) % CAREERS.length);
			} else if (event.key === "ArrowDown" || event.key === "ArrowRight") {
				event.preventDefault();
				chooseCareer((selectedIndex + 1) % CAREERS.length);
			} else if (event.key === "Enter" || event.key === " ") {
				event.preventDefault();
				confirm();
			}
		});

		window.addEventListener("resize", function () {
			if (visible) window.requestAnimationFrame(render);
		});
	};

	var prepare = function () {
		createCanvas();
		selectedIndex = 0;
		walkFrame = 0;
		visible = true;
		if (main.dom.outerBackground) main.dom.outerBackground.style.display = "none";
		if (main.dom.outerUI) main.dom.outerUI.style.display = "none";
		canvas.style.display = "block";
		render();
		if (walkTimer) clearInterval(walkTimer);
		walkTimer = setInterval(function () {
			if (!visible) return;
			walkFrame = (walkFrame + 1) % 4;
			render();
		}, 360);
	};

	var open = function () {
		if (!visible) prepare();
		canvas.focus();
		render();
	};

	var titleRoundRect = function (x, y, width, height, radius) {
		roundRect(titleCtx, x, y, width, height, radius);
	};

	var titleText = function (textValue, x, y, size, color, weight) {
		titleCtx.save();
		titleCtx.font = (weight || "normal") + " " + size + "px 'Microsoft YaHei', sans-serif";
		titleCtx.fillStyle = color || "#fff";
		titleCtx.textAlign = "center";
		// Canvas 的 middle 基线并不是字形视觉中心；按实际字形边界反推基线，
		// 让中文文字的可见区域在按钮中严格上下居中。
		titleCtx.textBaseline = "alphabetic";
		var metrics = titleCtx.measureText(textValue);
		var ascent = metrics.actualBoundingBoxAscent || size * 0.78;
		var descent = metrics.actualBoundingBoxDescent || size * 0.22;
		titleCtx.fillText(textValue, x, y + (ascent - descent) / 2);
		titleCtx.restore();
	};

	// buttons.png 中央透明开口的原图坐标。按开口而不是整图对齐，
	// 可以让两侧正半圆精确包住胶囊按钮，同时保留龙纹向外延展的比例。
	var BUTTON_FRAME_OPENING = { x: 245, y: 292, w: 1188, h: 330 };
	// 从 buttons.png 边框取样得到的金色组，统一用于 hover、键盘选中和发光。
	var BUTTON_GOLD = "#d0a068";
	var BUTTON_GOLD_LIGHT = "#f0d0a0";
	var BUTTON_GOLD_DARK = "#987850";
	// 标题按钮的唯一尺寸/位置配置。后续想调整大小，只改 widthRatio；
	// 想调整扁平程度则改 buttonAspectRatio，数值越大按钮越扁。
	// x、y、高度、字号、龙纹框和点击区域都会自动跟随。
	var TITLE_BUTTON_LAYOUT = {
		buttonAspectRatio: 4.6,
		primaryFontHeightRatio: 0.44,
		secondaryFontHeightRatio: 0.48,
		primaryFontWidthRatio: 0.095,
		secondaryFontWidthRatio: 0.125,
		landscape: {
			primaryWidthRatio: 0.21,
			secondaryWidthRatio: 0.15,
			secondaryGroupSpanRatio: 0.42,
			groupOffsetYRatio: 0.075,
			primaryCenterYRatio: 0.63,
			secondaryCenterYRatio: 0.8
		},
		portrait: {
			primaryWidthRatio: 0.34,
			secondaryWidthRatio: 0.17,
			secondaryGroupSpanRatio: 0.46,
			groupOffsetYRatio: 0.075,
			primaryCenterYRatio: 0.7,
			secondaryCenterYRatio: 0.81
		}
	};
	var TITLE_IMAGE_LAYOUT = {
		landscape: { topRatio: 0.024, opacityBoost: 0.28 },
		portrait: { topRatio: 0.077, opacityBoost: 0 }
	};

	var makeTitleButtonBox = function (centerX, centerY, width) {
		var height = width / TITLE_BUTTON_LAYOUT.buttonAspectRatio;
		return {
			x: centerX - width / 2,
			y: centerY - height / 2,
			w: width,
			h: height
		};
	};

	var getTitleButtonLayout = function (width, height, vertical) {
		var config = vertical ? TITLE_BUTTON_LAYOUT.portrait : TITLE_BUTTON_LAYOUT.landscape;
		var primaryWidth = width * config.primaryWidthRatio;
		var secondaryWidth = width * config.secondaryWidthRatio;
		var groupOffsetY = height * config.groupOffsetYRatio;
		var secondaryY = height * config.secondaryCenterYRatio + groupOffsetY;
		var secondaryGroupSpan = width * config.secondaryGroupSpanRatio;
		return {
			primary: makeTitleButtonBox(width / 2, height * config.primaryCenterYRatio + groupOffsetY, primaryWidth),
			secondary: [-0.5, 0, 0.5].map(function (groupPosition) {
				return makeTitleButtonBox(width / 2 + secondaryGroupSpan * groupPosition, secondaryY, secondaryWidth);
			})
		};
	};

	var drawButtonFrame = function (box, accent, selected) {
		if (!buttonFrameImage || !buttonFrameImage.complete || !buttonFrameImage.naturalWidth) return;
		var opening = BUTTON_FRAME_OPENING;
		var scaleX = box.w / opening.w;
		var scaleY = box.h / opening.h;
		var drawX = box.x - opening.x * scaleX;
		var drawY = box.y - opening.y * scaleY;
		var pulse = selected ? 0.5 + Math.sin(Date.now() / 260) * 0.5 : 0;

		titleCtx.save();
		titleCtx.globalAlpha = selected ? 1 : 0.88;
		titleCtx.shadowColor = accent;
		titleCtx.shadowBlur = selected ? 10 + pulse * 8 : 3;
		titleCtx.drawImage(
			buttonFrameImage,
			drawX,
			drawY,
			buttonFrameImage.naturalWidth * scaleX,
			buttonFrameImage.naturalHeight * scaleY
		);
		titleCtx.restore();
	};

	var drawTitleButton = function (index, textValue, box, accent, primary) {
		var selected = index === titleSelection;
		var fontHeightRatio = primary
			? TITLE_BUTTON_LAYOUT.primaryFontHeightRatio
			: TITLE_BUTTON_LAYOUT.secondaryFontHeightRatio;
		var fontWidthRatio = primary
			? TITLE_BUTTON_LAYOUT.primaryFontWidthRatio
			: TITLE_BUTTON_LAYOUT.secondaryFontWidthRatio;
		var fontSize = Math.max(1, Math.round(Math.max(
			box.h * fontHeightRatio,
			box.w * fontWidthRatio
		)));
		var gradient = titleCtx.createLinearGradient(box.x, box.y, box.x + box.w, box.y + box.h);
		gradient.addColorStop(0, selected ? BUTTON_GOLD_LIGHT : "rgba(15,24,45,0.88)");
		gradient.addColorStop(0.48, selected ? accent : "rgba(10,17,32,0.91)");
		gradient.addColorStop(1, selected ? BUTTON_GOLD_DARK : "rgba(7,12,26,0.92)");
		titleRoundRect(box.x, box.y, box.w, box.h, box.h / 2);
		titleCtx.fillStyle = gradient;
		titleCtx.fill();
		drawButtonFrame(box, accent, selected);
		titleText(textValue, box.x + box.w / 2, box.y + box.h / 2, fontSize, "#ffffff", "bold");
		titleHitboxes.push({ type: "title", index: index, x: box.x, y: box.y, w: box.w, h: box.h });
	};

	var drawTitleImage = function (vertical, canvasWidth, canvasHeight) {
		if (!titleImage || !titleImage.complete || !titleImage.naturalWidth) return;
		var layout = vertical ? TITLE_IMAGE_LAYOUT.portrait : TITLE_IMAGE_LAYOUT.landscape;
		var maxWidth = vertical ? canvasWidth - 36 : 630;
		var maxHeight = vertical ? 118 : 130;
		var scale = Math.min(maxWidth / titleImage.naturalWidth, maxHeight / titleImage.naturalHeight);
		var drawWidth = titleImage.naturalWidth * scale;
		var drawHeight = titleImage.naturalHeight * scale;
		var drawX = (canvasWidth - drawWidth) / 2;
		var drawY = canvasHeight * layout.topRatio;
		titleCtx.save();
		titleCtx.drawImage(titleImage, drawX, drawY, drawWidth, drawHeight);
		// 第二次轻叠绘只增强素材中的半透明像素，完全不透明区域不会改变颜色。
		if (layout.opacityBoost > 0) {
			titleCtx.globalAlpha = layout.opacityBoost;
			titleCtx.drawImage(titleImage, drawX, drawY, drawWidth, drawHeight);
		}
		titleCtx.restore();
	};

	var renderTitle = function () {
		if (!titleCanvas || titleCanvas.style.display === "none") return;
		var vertical = !!(core.domStyle && core.domStyle.isVertical);
		if (main.dom.startBackground) {
			main.dom.startBackground.style.objectFit = "cover";
			main.dom.startBackground.style.objectPosition = vertical ? "57% center" : "center center";
		}
		if (titleVideo) titleVideo.style.objectPosition = vertical ? "57% center" : "center center";
		var width = vertical ? 416 : 676;
		var height = vertical ? 676 : 416;
		core.maps._setHDCanvasSize(titleCtx, width, height);
		titleCtx.clearRect(0, 0, width, height);
		titleHitboxes = [];

		var shade = titleCtx.createLinearGradient(0, 0, 0, height);
		shade.addColorStop(0, "rgba(4,8,22,0.18)");
		shade.addColorStop(0.55, "rgba(4,8,22,0.06)");
		shade.addColorStop(1, "rgba(3,7,18,0.76)");
		titleCtx.fillStyle = shade;
		titleCtx.fillRect(0, 0, width, height);

		var glow = titleCtx.createRadialGradient(width / 2, vertical ? 132 : 82, 10, width / 2, vertical ? 132 : 82, vertical ? 210 : 160);
		glow.addColorStop(0, "rgba(92,126,255,0.36)");
		glow.addColorStop(1, "rgba(92,126,255,0)");
		titleCtx.fillStyle = glow;
		titleCtx.fillRect(0, 0, width, height);

		drawTitleImage(vertical, width, height);
		var buttonLayout = getTitleButtonLayout(width, height, vertical);
		drawTitleButton(0, "开始冒险", buttonLayout.primary, BUTTON_GOLD, true);
		drawTitleButton(1, "续关再战", buttonLayout.secondary[0], BUTTON_GOLD, false);
		drawTitleButton(3, "武器图鉴", buttonLayout.secondary[1], BUTTON_GOLD, false);
		drawTitleButton(2, "精彩回放", buttonLayout.secondary[2], BUTTON_GOLD, false);
	};

	var runTitleAction = function (index) {
		titleSelection = index;
		if (index === 0) {
			core.control.checkBgm();
			core.events.startGame("");
		} else if (index === 1) {
			core.control.checkBgm();
			core.load();
		} else if (index === 2) {
			core.control.checkBgm();
			core.chooseReplayFile();
		} else if (index === 3 && core.plugin.weaponCompendium) {
			core.plugin.weaponCompendium.open();
		}
	};

	var showTitle = function () {
		if (!titleCanvas) return;
		titleSelection = 0;
		main.dom.startButtonGroup.style.display = "none";
		main.dom.startButtons.style.display = "none";
		main.dom.levelChooseButtons.style.display = "none";
		if (titleVideo) {
			titleVideo.style.display = "block";
			var playPromise = titleVideo.play();
			if (playPromise && playPromise.catch) playPromise.catch(function () {});
		}
		titleCanvas.style.display = "block";
		renderTitle();
		if (!titleAnimationFrame) {
			var animateTitle = function (timestamp) {
				if (!titleCanvas || titleCanvas.style.display === "none") {
					titleAnimationFrame = null;
					return;
				}
				if (timestamp - titleLastFrame >= 70) {
					titleLastFrame = timestamp;
					renderTitle();
				}
				titleAnimationFrame = window.requestAnimationFrame(animateTitle);
			};
			titleAnimationFrame = window.requestAnimationFrame(animateTitle);
		}
		titleCanvas.focus();
	};

	var hideTitle = function () {
		if (titleCanvas) titleCanvas.style.display = "none";
		if (titleAnimationFrame) window.cancelAnimationFrame(titleAnimationFrame);
		titleAnimationFrame = null;
		titleLastFrame = 0;
		if (titleVideo) {
			titleVideo.pause();
			titleVideo.style.display = "none";
		}
	};

	var createTitleVideo = function () {
		titleVideo = document.createElement("video");
		titleVideo.id = "careerTitleVideo";
		titleVideo.src = "project/video/background.mp4";
		titleVideo.poster = "project/images/origin_background.png";
		titleVideo.autoplay = true;
		titleVideo.loop = true;
		titleVideo.muted = true;
		titleVideo.defaultMuted = true;
		titleVideo.playsInline = true;
		titleVideo.preload = "auto";
		titleVideo.setAttribute("muted", "");
		titleVideo.setAttribute("playsinline", "");
		titleVideo.setAttribute("webkit-playsinline", "");
		titleVideo.setAttribute("aria-hidden", "true");
		titleVideo.style.position = "absolute";
		titleVideo.style.left = "0";
		titleVideo.style.top = "0";
		titleVideo.style.width = "100%";
		titleVideo.style.height = "100%";
		titleVideo.style.objectFit = "cover";
		titleVideo.style.zIndex = "270";
		titleVideo.style.opacity = "0";
		titleVideo.style.transition = "opacity 240ms ease";
		titleVideo.style.pointerEvents = "none";
		titleVideo.style.display = "none";
		titleVideo.addEventListener("canplay", function () {
			titleVideo.style.opacity = "1";
		});
		core.dom.startPanel.appendChild(titleVideo);
	};

	var loadTitleImage = function () {
		titleImage = new Image();
		titleImage.onload = function () {
			if (titleCanvas && titleCanvas.style.display !== "none") renderTitle();
		};
		titleImage.src = "project/images/title2.png";
		buttonFrameImage = new Image();
		buttonFrameImage.onload = function () {
			if (titleCanvas && titleCanvas.style.display !== "none") renderTitle();
		};
		buttonFrameImage.src = "project/images/buttons.png";
	};

	var createTitleCanvas = function () {
		titleCanvas = document.createElement("canvas");
		titleCanvas.id = "careerTitleCanvas";
		titleCanvas.style.position = "absolute";
		titleCanvas.style.left = "0";
		titleCanvas.style.top = "0";
		titleCanvas.style.width = "100%";
		titleCanvas.style.height = "100%";
		titleCanvas.style.zIndex = "320";
		titleCanvas.style.display = "none";
		titleCanvas.style.touchAction = "none";
		titleCanvas.style.cursor = "default";
		titleCanvas.tabIndex = 0;
		titleCanvas.setAttribute("role", "menu");
		titleCanvas.setAttribute("aria-label", "游戏标题菜单");
		core.dom.startPanel.appendChild(titleCanvas);
		titleCtx = titleCanvas.getContext("2d");

		titleCanvas.addEventListener("click", function (event) {
			var rect = titleCanvas.getBoundingClientRect();
			var vertical = !!(core.domStyle && core.domStyle.isVertical);
			var point = {
				x: (event.clientX - rect.left) * (vertical ? 416 : 676) / rect.width,
				y: (event.clientY - rect.top) * (vertical ? 676 : 416) / rect.height
			};
			titleHitboxes.some(function (box) {
				if (!isInside(point.x, point.y, box)) return false;
				runTitleAction(box.index);
				return true;
			});
		});

		titleCanvas.addEventListener("mousemove", function (event) {
			var rect = titleCanvas.getBoundingClientRect();
			var vertical = !!(core.domStyle && core.domStyle.isVertical);
			var x = (event.clientX - rect.left) * (vertical ? 416 : 676) / rect.width;
			var y = (event.clientY - rect.top) * (vertical ? 676 : 416) / rect.height;
			var next = titleHitboxes.filter(function (box) { return isInside(x, y, box); })[0];
			titleCanvas.style.cursor = next ? "pointer" : "default";
			if (next && next.index !== titleSelection) {
				titleSelection = next.index;
				renderTitle();
			}
		});

		titleCanvas.addEventListener("keydown", function (event) {
			var order = [0, 1, 3, 2];
			var current = Math.max(0, order.indexOf(titleSelection));
			if (event.key === "ArrowLeft" || event.key === "ArrowUp") current = (current + order.length - 1) % order.length;
			else if (event.key === "ArrowRight" || event.key === "ArrowDown") current = (current + 1) % order.length;
			else if (event.key === "Enter" || event.key === " ") return runTitleAction(titleSelection);
			else return;
			event.preventDefault();
			titleSelection = order[current];
			renderTitle();
		});

		window.addEventListener("resize", function () {
			if (titleCanvas.style.display !== "none") window.requestAnimationFrame(renderTitle);
		});
	};

	createTitleVideo();
	loadTitleImage();
	createTitleCanvas();

	plugin.careerSelect = {
		prepare: prepare,
		open: open,
		confirm: confirm,
		showTitle: showTitle,
		hideTitle: hideTitle,
		getSelectedCareer: function () { return CAREERS[selectedIndex].id; },
		getCareers: function () { return CAREERS.slice(); },
		titleButtonLayout: TITLE_BUTTON_LAYOUT,
		getTitleButtonLayout: getTitleButtonLayout,
		render: render,
		renderTitle: renderTitle
	};

	// 参照 AstralParty：先显示独立于游戏画布的职业选择层，再执行游戏重置。
	// resetGame 即使清空全部游戏 Canvas，也不会影响职业选择层，因此不会闪出地图。
	var originalStartGame = core.events.startGame;
	var startGameWithCareerSelect = function (hard, seed, route, callback) {
		if (route == null) {
			if (main.mode !== "play") return;
			prepare();
			hideTitle();
			main.dom.levelChooseButtons.style.display = "none";
			main.dom.startButtonGroup.style.display = "none";
			core.dom.startPanel.style.display = "none";
			return core.events._startGame_start(hard || "", seed, route, callback);
		}
		hideTitle();
		return originalStartGame.call(core.events, hard, seed, route, callback);
	};
	core.events.startGame = startGameWithCareerSelect;
	core.startGame = startGameWithCareerSelect;

	// 引擎每次进入或返回标题页时都会走这里；旧按钮仍由引擎维护，
	// 自定义 Canvas 在其完成后接管显示和键鼠操作。
	var originalShowStartFinished = core.control._showStartAnimate_finished;
	core.control._showStartAnimate_finished = function (start, callback) {
		var result = originalShowStartFinished.call(core.control, start, callback);
		if (!start) showTitle();
		return result;
	};
};
