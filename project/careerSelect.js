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
			shortTagline: "攻守兼备",
			tagline: "攻守兼备的近战起点",
			color: "#ffb45b",
			accent: "#ff6b4a",
			portrait: "sword_character.png",
			portraitFilter: "none",
			promotions: ["狂战士", "双剑士", "盾誓士", "魔剑士"],
			poolTypes: ["剑", "盾", "短", "斧"],
			poolPreview: "七星剑、修瓦利耶之剑、真龙之盾",
			unlockText: "转职后解锁刀类；狂战士额外解锁专属斧。",
			walk: "sword_walk.png"
		},
		{
			id: "琴",
			name: "琴师",
			shortTagline: "节奏联动",
			tagline: "围绕节奏与联动展开战斗",
			color: "#53e4ff",
			accent: "#8b7bff",
			portrait: "harp_chatacter.png",
			portraitFilter: "none",
			promotions: ["兽王", "摇滚巨星", "极乐净土"],
			poolTypes: ["乐器", "食物", "饮料"],
			poolPreview: "追忆小提琴、语部之弦、史莱姆铃铛",
			unlockText: "转职后可追加动物或吉他相关武器。",
			walk: "harp_walk.png"
		},
		{
			id: "杖",
			name: "术士",
			shortTagline: "法术召唤",
			tagline: "法术、召唤与资源循环",
			color: "#c79cff",
			accent: "#53d8b4",
			portrait: "witch_character.png",
			portraitFilter: "none",
			promotions: ["黑猫道士", "使役者"],
			poolTypes: ["杖", "召唤石", "道具"],
			poolPreview: "巖迫之躯杖、钢棍、格里姆尼尔",
			unlockText: "转职后可追加专属法杖或精灵相关武器。",
			walk: "witch_walk.png"
		}
	];

	var canvas = null;
	var ctx = null;
	var titleCanvas = null;
	var titleCtx = null;
	var titleVideo = null;
	var careerVideo = null;
	var titleImage = null;
	var titleCharacterMaskImage = null;
	var titleCharacterMaskSource = null;
	var titleCharacterMaskCache = {};
	var titleCompositeCache = {};
	var titleAnimatedComposite = null;
	var buttonFrameImage = null;
	var titleAnimationFrame = null;
	var titleLastFrame = 0;
	var titleEntranceStart = null;
	var titleEntrancePlayed = false;
	var titleEntrancePending = false;
	var titleEntranceStartScheduled = false;
	var titleEntranceVisibilityObserver = null;
	var titleHitboxes = [];
	var titleSelection = 0;
	var selectedIndex = 0;
	var visible = false;
	var walkFrame = 0;
	var walkTimer = null;
	var hitboxes = [];
	var canvasLogicalWidth = 676;
	var canvasLogicalHeight = 416;

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
		var textValue = String(text);
		ctx.font = (weight || "normal") + " " + size + "px 'Microsoft YaHei', sans-serif";
		ctx.fillStyle = color || "#fff";
		ctx.textAlign = align || "left";
		ctx.textBaseline = "alphabetic";
		var metrics = ctx.measureText(textValue);
		var ascent = metrics.actualBoundingBoxAscent || size * 0.78;
		var descent = metrics.actualBoundingBoxDescent || size * 0.22;
		ctx.fillText(textValue, x, y + (ascent - descent) / 2);
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
		fillRoundRect(x, y, width, 24, 12, "rgba(8,15,31,0.82)");
		strokeRoundRect(x, y, width, 24, 12, color, 1.5);
		drawText(text, x + width / 2, y + 12, 12, color, "center", "bold");
		return width;
	};

	var drawBackground = function (width, height) {
		var shade = ctx.createLinearGradient(0, 0, 0, height);
		shade.addColorStop(0, "rgba(4,8,22,0.42)");
		shade.addColorStop(0.5, "rgba(4,9,22,0.57)");
		shade.addColorStop(1, "rgba(3,7,18,0.86)");
		ctx.fillStyle = shade;
		ctx.fillRect(0, 0, width, height);

		var glow = ctx.createRadialGradient(width * 0.5, 26, 8, width * 0.5, 26, width * 0.7);
		glow.addColorStop(0, "rgba(92,126,255,0.22)");
		glow.addColorStop(0.68, CAREERS[selectedIndex].color + "12");
		glow.addColorStop(1, "rgba(0,0,0,0)");
		ctx.fillStyle = glow;
		ctx.fillRect(0, 0, width, height);

		ctx.save();
		ctx.strokeStyle = "rgba(208,160,104,0.72)";
		ctx.lineWidth = 1.2;
		ctx.strokeRect(1, 1, width - 2, height - 2);
		ctx.restore();
	};

	var drawCareerCard = function (career, index, box) {
		var selected = index === selectedIndex;
		var compact = box.w <= 110;
		var textX = box.x + (compact ? 53 : 57);
		fillRoundRect(box.x, box.y, box.w, box.h, 10, selected ? "rgba(25,31,46,0.92)" : "rgba(6,12,27,0.78)");
		strokeRoundRect(box.x, box.y, box.w, box.h, 10, selected ? BUTTON_GOLD_LIGHT : "rgba(208,160,104,0.48)", selected ? 2.5 : 1.2);
		fillRoundRect(box.x + 9, box.y + 12, 38, 38, 19, selected ? BUTTON_GOLD_LIGHT : "rgba(208,160,104,0.16)");
		drawText(career.id, box.x + 28, box.y + 31, 22, selected ? "#17111a" : "#ead1aa", "center", "bold");
		drawText(career.name, textX, box.y + 23, compact ? 17 : 18, selected ? "#ffffff" : "#d8dce5", "left", "bold");
		drawText(career.shortTagline || career.tagline, textX, box.y + 52, compact ? 9 : 11, selected ? "#f0d0a0" : "#929db0", "left", "normal");
		if (selected) {
			ctx.fillStyle = BUTTON_GOLD_LIGHT;
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
		gradient.addColorStop(0, career.color + "28");
		gradient.addColorStop(0.55, "rgba(9,15,30,0.36)");
		gradient.addColorStop(1, "#070c18");
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
		strokeRoundRect(box.x, box.y, box.w, box.h, 12, BUTTON_GOLD_LIGHT, 2);
		// drawText("临时职业立绘", box.x + box.w / 2, box.y + box.h - 16, 12, "#ffffff", "center", "bold");
	};

	var drawHeroSprite = function (x, y, size, career) {
		fillRoundRect(x, y, size, size, 9, "rgba(6,12,27,0.86)");
		strokeRoundRect(x, y, size, size, 9, BUTTON_GOLD_LIGHT, 1.5);
		var heroImage = core.material && core.material.images ? core.material.images.hero : null;
		if (career.walk && core.material?.images?.images?.[career.walk]) {
			heroImage = core.material.images.images[career.walk]
		}
		if (career.walk && core.material?.images?.images?.[career.walk]) {
			heroImage = core.material.images.images[career.walk]
		}

		if (heroImage && heroImage.width && heroImage.height) {
			var frameWidth = heroImage.width / 4;
			var frameHeight = heroImage.height / 4;
			ctx.imageSmoothingEnabled = false;
			const smallSize = 15;
			const renderW = frameWidth - smallSize * (frameWidth / frameHeight);
			const renderH = frameHeight - smallSize;
			ctx.drawImage(heroImage, walkFrame * frameWidth, 0, frameWidth, frameHeight, x + size / 2 - renderW / 2 + 1 , y + size / 2 - renderH / 2, renderW, renderH);
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
			fillRoundRect(cursorX, cursorY, width, compact ? 22 : 24, 6, "rgba(8,15,31,0.82)");
			strokeRoundRect(cursorX, cursorY, width, compact ? 22 : 24, 6, "rgba(208,160,104,0.78)", 1);
			drawText(promotion, cursorX + width / 2, cursorY + (compact ? 11 : 12), compact ? 11 : 12, "#ffffff", "center", "bold");
			cursorX += width + 7;
		});
		return cursorY + (compact ? 22 : 24);
	};

	var drawPool = function (career, x, y, maxWidth, compact) {
		var cursorX = x;
		career.poolTypes.forEach(function (type) {
			var width = drawTag(type, cursorX, y, BUTTON_GOLD_LIGHT);
			cursorX += width + 6;
		});
		drawWrappedText("代表武器：" + career.poolPreview, x, y + (compact ? 30 : 33), maxWidth, compact ? 15 : 17, 2, "#e5ebf5", compact ? 11 : 12);
		if (!compact) drawWrappedText(career.unlockText, x, y + 71, maxWidth, 17, 2, career.color, 12);
	};

	var drawConfirmButton = function (box, career) {
		var gradient = ctx.createLinearGradient(box.x, box.y, box.x + box.w, box.y + box.h);
		gradient.addColorStop(0, BUTTON_GOLD_LIGHT);
		gradient.addColorStop(0.48, BUTTON_GOLD);
		gradient.addColorStop(1, BUTTON_GOLD_DARK);
		fillRoundRect(box.x, box.y, box.w, box.h, box.h / 2, gradient);
		drawButtonFrameOn(ctx, box, BUTTON_GOLD, true);
		drawText("以" + career.name + "开始", box.x + box.w / 2, box.y + box.h / 2, 12, "#ffffff", "center", "bold");
		hitboxes.push({ type: "confirm", x: box.x, y: box.y, w: box.w, h: box.h });
	};

	var drawBackButton = function (box) {
		var gradient = ctx.createLinearGradient(box.x, box.y, box.x, box.y + box.h);
		gradient.addColorStop(0, "rgba(38,47,69,0.96)");
		gradient.addColorStop(1, "rgba(10,17,33,0.96)");
		fillRoundRect(box.x, box.y, box.w, box.h, 6, gradient);
		strokeRoundRect(box.x, box.y, box.w, box.h, 6, BUTTON_GOLD, 1.2);
		drawText("返回标题", box.x + box.w / 2, box.y + box.h / 2, 11, "#f5deb5", "center", "bold");
		hitboxes.push({ type: "back", x: box.x, y: box.y, w: box.w, h: box.h });
	};

	var renderLandscape = function () {
		var career = CAREERS[selectedIndex];
		drawBackground(676, 416);
		fillRoundRect(12, 8, 652, 39, 9, "rgba(7,13,29,0.78)");
		strokeRoundRect(12, 8, 652, 39, 9, "rgba(208,160,104,0.74)", 1.2);
		drawText("选择初始职业", 23, 27, 22, "#ffffff", "left", "bold");
		drawBackButton({ x: 574, y: 14, w: 76, h: 26 });

		CAREERS.forEach(function (one, index) {
			drawCareerCard(one, index, { x: 14, y: 57 + index * 89, w: 148, h: 78 });
		});

		drawPortrait(career, { x: 174, y: 57, w: 220, h: 341 });

		fillRoundRect(406, 57, 256, 341, 12, "rgba(6,12,27,0.86)");
		strokeRoundRect(406, 57, 256, 341, 12, "rgba(208,160,104,0.70)", 1.4);
		drawText(career.name, 422, 80, 25, "#ffffff", "left", "bold");
		drawText(career.id + "系初始职业", 422, 105, 12, BUTTON_GOLD_LIGHT, "left", "bold");
		drawHeroSprite(596, 70, 48, career);

		drawText("进一步转职", 422, 147, 13, "#ffffff", "left", "bold");
		var promotionBottom = drawPromotions(career, 422, 163, 224, false);
		drawText("职业武器池", 422, promotionBottom + 19, 13, "#ffffff", "left", "bold");
		drawPool(career, 422, promotionBottom + 34, 224, false);
		drawConfirmButton({ x: 478, y: 361, w: 112, h: 24 }, career);
	};

	var renderVertical = function (viewHeight) {
		var career = CAREERS[selectedIndex];
		var detailHeight = 233;
		var bottomPadding = 7;
		var sectionGap = 12;
		var portraitY = 55;
		var detailY = viewHeight - bottomPadding - detailHeight;
		var portraitHeight = detailY - sectionGap - portraitY;

		drawBackground(416, viewHeight);
		fillRoundRect(8, 8, 400, 39, 9, "rgba(7,13,29,0.80)");
		strokeRoundRect(8, 8, 400, 39, 9, "rgba(208,160,104,0.74)", 1.2);
		drawText("选择初始职业", 18, 27, 21, "#ffffff", "left", "bold");
		drawBackButton({ x: 320, y: 14, w: 76, h: 26 });

		CAREERS.forEach(function (one, index) {
			drawCareerCard(one, index, { x: 10, y: 55 + index * 89, w: 103, h: 78 });
		});
		drawPortrait(career, { x: 123, y: portraitY, w: 283, h: portraitHeight });
		drawHeroSprite(342, 63, 54, career);

		fillRoundRect(10, detailY, 396, detailHeight, 12, "rgba(6,12,27,0.87)");
		strokeRoundRect(10, detailY, 396, detailHeight, 12, "rgba(208,160,104,0.70)", 1.4);
		drawText(career.name, 24, detailY + 24, 24, "#ffffff", "left", "bold");
		drawText(career.tagline, 392, detailY + 25, 11, career.color, "right", "bold");
		drawText(career.unlockText, 392, detailY + 42, 10, career.color, "right", "normal");
		drawText("进一步转职", 24, detailY + 59, 13, "#ffffff", "left", "bold");
		var promotionBottom = drawPromotions(career, 24, detailY + 75, 368, true);
		drawText("职业武器池", 24, promotionBottom + 14, 13, "#ffffff", "left", "bold");
		drawPool(career, 24, promotionBottom + 29, 368, true);
		drawConfirmButton({ x: 244, y: detailY + 196, w: 124, h: 24 }, career);
	};

	var render = function () {
		if (!visible || !canvas || !ctx) return;
		hitboxes = [];
		var vertical = !!(core.domStyle && core.domStyle.isVertical);
		var groupRect = core.dom.gameGroup.getBoundingClientRect();
		canvasLogicalWidth = vertical ? 416 : 676;
		canvasLogicalHeight = vertical
			? Math.max(676, Math.round(canvasLogicalWidth * groupRect.height / Math.max(1, groupRect.width)))
			: 416;
		canvas.style.width = groupRect.width + "px";
		canvas.style.height = groupRect.height + "px";
		if (careerVideo) {
			careerVideo.style.width = groupRect.width + "px";
			careerVideo.style.height = groupRect.height + "px";
			careerVideo.style.objectPosition = vertical ? "57% center" : "center center";
		}
		if (core.maps && typeof core.maps._setHDCanvasSize === "function") {
			core.maps._setHDCanvasSize(ctx, canvasLogicalWidth, canvasLogicalHeight);
		} else {
			canvas.width = canvasLogicalWidth;
			canvas.height = canvasLogicalHeight;
		}
		ctx.clearRect(0, 0, canvasLogicalWidth, canvasLogicalHeight);
		if (vertical) renderVertical(canvasLogicalHeight);
		else renderLandscape();
	};

	var isInside = function (x, y, box) {
		return x >= box.x && x <= box.x + box.w && y >= box.y && y <= box.y + box.h;
	};

	var getPointerPosition = function (event) {
		var rect = canvas.getBoundingClientRect();
		return {
			x: (event.clientX - rect.left) * canvasLogicalWidth / rect.width,
			y: (event.clientY - rect.top) * canvasLogicalHeight / rect.height
		};
	};

	var chooseCareer = function (index) {
		selectedIndex = Math.max(0, Math.min(CAREERS.length - 1, index));
		render();
	};

	var getGameBackgroundVideos = function () {
		if (main.dom.outerBackgroundVideos && main.dom.outerBackgroundVideos.length) {
			return main.dom.outerBackgroundVideos.slice();
		}
		return main.dom.outerBackgroundVideo ? [main.dom.outerBackgroundVideo] : [];
	};

	var hideCareer = function (targetVideos) {
		visible = false;
		if (canvas) canvas.style.display = "none";
		if (!Array.isArray(targetVideos)) targetVideos = targetVideos ? [targetVideos] : [];
		if (careerVideo && careerVideo.readyState >= 1) {
			targetVideos.forEach(function (targetVideo) {
				try { targetVideo.currentTime = careerVideo.currentTime; } catch (error) { }
			});
		}
		if (careerVideo) {
			careerVideo.pause();
			careerVideo.style.display = "none";
		}
		if (walkTimer) clearInterval(walkTimer);
		walkTimer = null;
	};

	var returnToTitle = function () {
		if (!visible) return;
		hideCareer(titleVideo);
		core.showStartAnimate(true);
	};

	var confirm = function () {
		if (!visible) return;
		var career = CAREERS[selectedIndex];
		core.setFlag("kaiju", career.id);
		if (core.status && Array.isArray(core.status.route) && !(core.isReplaying && core.isReplaying())) {
			core.status.route.push("input2:" + core.encodeBase64(core.encodeBase64(career.id)));
		}
		var backgroundVideos = getGameBackgroundVideos();
		hideCareer(backgroundVideos);
		if (main.dom.outerBackground) main.dom.outerBackground.style.display = "block";
		if (main.dom.outerUI) main.dom.outerUI.style.display = "block";
		backgroundVideos.forEach(function (backgroundVideo) {
			backgroundVideo.style.display = "block";
			var backgroundPlayPromise = backgroundVideo.play();
			if (backgroundPlayPromise && backgroundPlayPromise.catch) backgroundPlayPromise.catch(function () { });
		});
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
		canvas.style.background = "transparent";
		canvas.style.boxShadow = "0 0 0 9999px #000";
		canvas.style.outline = "none";
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
				else if (box.type === "back") returnToTitle();
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
			} else if (event.key === "Escape") {
				event.preventDefault();
				returnToTitle();
			}
		});

		window.addEventListener("resize", function () {
			if (visible) window.requestAnimationFrame(render);
		});
	};

	var createCareerVideo = function () {
		if (careerVideo) return;
		careerVideo = document.createElement("video");
		careerVideo.id = "careerSelectVideo";
		careerVideo.src = "project/video/background.mp4";
		careerVideo.poster = "project/images/origin_background.png";
		careerVideo.autoplay = true;
		careerVideo.loop = true;
		careerVideo.muted = true;
		careerVideo.defaultMuted = true;
		careerVideo.playsInline = true;
		careerVideo.preload = "auto";
		careerVideo.setAttribute("muted", "");
		careerVideo.setAttribute("playsinline", "");
		careerVideo.setAttribute("webkit-playsinline", "");
		careerVideo.setAttribute("aria-hidden", "true");
		careerVideo.style.position = "fixed";
		careerVideo.style.left = "50%";
		careerVideo.style.top = "50%";
		careerVideo.style.transform = "translate(-50%, -50%)";
		careerVideo.style.objectFit = "cover";
		careerVideo.style.zIndex = "9999";
		careerVideo.style.pointerEvents = "none";
		careerVideo.style.display = "none";
		careerVideo.style.boxShadow = "0 0 0 9999px #000";
		core.dom.gameGroup.insertAdjacentElement("afterend", careerVideo);
	};

	var prepare = function () {
		createCareerVideo();
		createCanvas();
		selectedIndex = 0;
		walkFrame = 0;
		visible = true;
		if (main.dom.outerBackground) main.dom.outerBackground.style.display = "none";
		if (main.dom.outerUI) main.dom.outerUI.style.display = "none";
		if (careerVideo) {
			careerVideo.style.display = "block";
			if (titleVideo && titleVideo.readyState >= 1) {
				try { careerVideo.currentTime = titleVideo.currentTime; } catch (error) { }
			}
			var playPromise = careerVideo.play();
			if (playPromise && playPromise.catch) playPromise.catch(function () { });
		}
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
			secondaryGroupSpanRatio: 0.62,
			groupOffsetYRatio: 0.075,
			primaryCenterYRatio: 0.63,
			secondaryCenterYRatio: 0.8
		},
		portrait: {
			primaryWidthRatio: 0.34,
			secondaryWidthRatio: 0.23,
			secondaryGroupSpanRatio: 0.42,
			secondaryRowGapRatio: 0.074,
			groupOffsetYRatio: 0.075,
			primaryCenterYRatio: 0.7,
			secondaryCenterYRatio: 0.803
		}
	};
	var TITLE_IMAGE_LAYOUT = {
		landscape: { topRatio: 0.024, opacity: 1 },
		portrait: { topRatio: 0.077, opacity: 1 }
	};
	var TITLE_ENTRANCE = {
		duration: 700,
		titleOffsetY: 24,
		buttonOffsetY: 28
	};
	// 最终蒙版中：人物为黑、背景为白，边缘已经包含 10px 羽化。
	var TITLE_CHARACTER_MASK_PATH = "project/images/title-character-mask.png";
	// 生成的人物轮廓比底图人物约大 9%，围绕背景焦点等比收缩后再参与遮罩。
	var TITLE_CHARACTER_MASK_LAYOUT = {
		landscape: { scale: 0.91, offsetX: 0, offsetY: 0 },
		portrait: { scale: 0.91, offsetX: 0, offsetY: 0 }
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

	var offsetTitleButtonBox = function (box, offsetY) {
		return { x: box.x, y: box.y + offsetY, w: box.w, h: box.h };
	};

	var getTitleButtonLayout = function (width, height, vertical) {
		var config = vertical ? TITLE_BUTTON_LAYOUT.portrait : TITLE_BUTTON_LAYOUT.landscape;
		var primaryWidth = width * config.primaryWidthRatio;
		var secondaryWidth = width * config.secondaryWidthRatio;
		var groupOffsetY = height * config.groupOffsetYRatio;
		var secondaryY = height * config.secondaryCenterYRatio + groupOffsetY;
		var secondaryGroupSpan = width * config.secondaryGroupSpanRatio;
		var secondary;
		if (vertical) {
			var rowGap = height * config.secondaryRowGapRatio;
			secondary = [
				[-0.5, 0], [0.5, 0],
				[-0.5, rowGap], [0.5, rowGap]
			].map(function (position) {
				return makeTitleButtonBox(width / 2 + secondaryGroupSpan * position[0], secondaryY + position[1], secondaryWidth);
			});
		} else {
			secondary = [-0.5, -1 / 6, 1 / 6, 0.5].map(function (groupPosition) {
				return makeTitleButtonBox(width / 2 + secondaryGroupSpan * groupPosition, secondaryY, secondaryWidth);
			});
		}
		return {
			primary: makeTitleButtonBox(width / 2, height * config.primaryCenterYRatio + groupOffsetY, primaryWidth),
			secondary: secondary
		};
	};

	var drawButtonFrameOn = function (context, box, accent, selected) {
		if (!buttonFrameImage || !buttonFrameImage.complete || !buttonFrameImage.naturalWidth) return;
		var opening = BUTTON_FRAME_OPENING;
		var scaleX = box.w / opening.w;
		var scaleY = box.h / opening.h;
		var drawX = box.x - opening.x * scaleX;
		var drawY = box.y - opening.y * scaleY;
		var pulse = selected ? 0.5 + Math.sin(Date.now() / 260) * 0.5 : 0;

		var entranceAlpha = context.globalAlpha;
		context.save();
		context.globalAlpha = entranceAlpha * (selected ? 1 : 0.88);
		context.shadowColor = accent;
		context.shadowBlur = selected ? 10 + pulse * 8 : 3;
		context.drawImage(
			buttonFrameImage,
			drawX,
			drawY,
			buttonFrameImage.naturalWidth * scaleX,
			buttonFrameImage.naturalHeight * scaleY
		);
		context.restore();
	};

	var drawButtonFrame = function (box, accent, selected) {
		drawButtonFrameOn(titleCtx, box, accent, selected);
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

	var prepareTitleCharacterMask = function () {
		if (!titleCharacterMaskImage || !titleCharacterMaskImage.naturalWidth) return;
		var width = titleCharacterMaskImage.naturalWidth;
		var height = titleCharacterMaskImage.naturalHeight;
		var maskCanvas = document.createElement("canvas");
		maskCanvas.width = width;
		maskCanvas.height = height;
		var maskCtx = maskCanvas.getContext("2d", { willReadFrequently: true });
		maskCtx.drawImage(titleCharacterMaskImage, 0, 0);

		try {
			var imageData = maskCtx.getImageData(0, 0, width, height);
			var pixels = imageData.data;
			for (var offset = 0; offset < pixels.length; offset += 4) {
				var luminance = Math.round(
					pixels[offset] * 0.2126 +
					pixels[offset + 1] * 0.7152 +
					pixels[offset + 2] * 0.0722
				);
				pixels[offset] = pixels[offset + 1] = pixels[offset + 2] = 255;
				// destination-out 需要人物为不透明、背景为透明。
				pixels[offset + 3] = 255 - luminance;
			}
			maskCtx.putImageData(imageData, 0, 0);
			titleCharacterMaskSource = maskCanvas;
			titleCharacterMaskCache = {};
			titleCompositeCache = {};
			if (titleCanvas && titleCanvas.style.display !== "none") renderTitle();
		} catch (error) {
			console.warn("标题人物蒙版初始化失败，将保留未遮罩标题。", error);
		}
	};

	var getTitleCharacterMask = function (vertical, canvasWidth, canvasHeight, renderRatio) {
		if (!titleCharacterMaskSource) return null;
		renderRatio = renderRatio || 1;
		var cacheKey = (vertical ? "portrait" : "landscape") + "@" +
			canvasWidth + "x" + canvasHeight + "@" + renderRatio.toFixed(3);
		if (titleCharacterMaskCache[cacheKey]) return titleCharacterMaskCache[cacheKey];

		var fittedMask = document.createElement("canvas");
		fittedMask.width = Math.max(1, Math.round(canvasWidth * renderRatio));
		fittedMask.height = Math.max(1, Math.round(canvasHeight * renderRatio));
		var fittedCtx = fittedMask.getContext("2d");
		fittedCtx.setTransform(renderRatio, 0, 0, renderRatio, 0, 0);
		fittedCtx.imageSmoothingEnabled = true;
		if ("imageSmoothingQuality" in fittedCtx) fittedCtx.imageSmoothingQuality = "high";
		var sourceWidth = titleCharacterMaskSource.width;
		var sourceHeight = titleCharacterMaskSource.height;
		var fitScale = Math.max(canvasWidth / sourceWidth, canvasHeight / sourceHeight);
		var layout = vertical ? TITLE_CHARACTER_MASK_LAYOUT.portrait : TITLE_CHARACTER_MASK_LAYOUT.landscape;
		var drawWidth = sourceWidth * fitScale * layout.scale;
		var drawHeight = sourceHeight * fitScale * layout.scale;
		// 与启动背景的 object-fit: cover / object-position 保持一致。
		var positionX = vertical ? 0.57 : 0.5;
		var drawX = (canvasWidth - drawWidth) * positionX + layout.offsetX;
		var drawY = (canvasHeight - drawHeight) * 0.5 + layout.offsetY;
		fittedCtx.drawImage(titleCharacterMaskSource, drawX, drawY, drawWidth, drawHeight);

		// 位图已完成 10px 羽化，这里只做与背景一致的 cover 适配。
		titleCharacterMaskCache[cacheKey] = fittedMask;
		return fittedMask;
	};

	var getTitleComposite = function (vertical, canvasWidth, canvasHeight, offsetY) {
		if (!titleImage || !titleImage.complete || !titleImage.naturalWidth) return null;
		offsetY = offsetY || 0;
		var canCache = offsetY === 0;
		var renderRatio = titleCtx && titleCtx.canvas.width
			? titleCtx.canvas.width / canvasWidth : 1;
		var pixelWidth = Math.max(1, Math.round(canvasWidth * renderRatio));
		var pixelHeight = Math.max(1, Math.round(canvasHeight * renderRatio));
		var cacheKey = (vertical ? "portrait" : "landscape") + "@" +
			canvasWidth + "x" + canvasHeight + "@" + renderRatio.toFixed(3);
		if (canCache && titleCompositeCache[cacheKey]) return titleCompositeCache[cacheKey];
		var layout = vertical ? TITLE_IMAGE_LAYOUT.portrait : TITLE_IMAGE_LAYOUT.landscape;
		var maxWidth = vertical ? canvasWidth * 0.8 : 630;
		var scale = vertical
			? maxWidth / titleImage.naturalWidth
			: Math.min(maxWidth / titleImage.naturalWidth, 130 / titleImage.naturalHeight);
		var drawWidth = titleImage.naturalWidth * scale;
		var drawHeight = titleImage.naturalHeight * scale;
		var drawX = (canvasWidth - drawWidth) / 2;
		var drawY = canvasHeight * layout.topRatio + offsetY;
		var composite = canCache ? document.createElement("canvas") : titleAnimatedComposite;
		if (!composite || composite.width !== pixelWidth || composite.height !== pixelHeight) {
			composite = document.createElement("canvas");
			composite.width = pixelWidth;
			composite.height = pixelHeight;
			if (!canCache) titleAnimatedComposite = composite;
		}
		var compositeCtx = composite.getContext("2d");
		compositeCtx.setTransform(1, 0, 0, 1, 0, 0);
		compositeCtx.clearRect(0, 0, composite.width, composite.height);
		compositeCtx.globalCompositeOperation = "source-over";
		compositeCtx.globalAlpha = 1;
		compositeCtx.setTransform(renderRatio, 0, 0, renderRatio, 0, 0);
		compositeCtx.imageSmoothingEnabled = true;
		if ("imageSmoothingQuality" in compositeCtx) compositeCtx.imageSmoothingQuality = "high";
		compositeCtx.globalAlpha = layout.opacity;
		compositeCtx.drawImage(titleImage, drawX, drawY, drawWidth, drawHeight);

		var characterMask = getTitleCharacterMask(vertical, canvasWidth, canvasHeight, renderRatio);
		if (characterMask) {
			compositeCtx.globalAlpha = 1;
			compositeCtx.globalCompositeOperation = "destination-out";
			compositeCtx.drawImage(characterMask, 0, 0, canvasWidth, canvasHeight);
		}
		if (canCache) titleCompositeCache[cacheKey] = composite;
		return composite;
	};

	var drawTitleImage = function (vertical, canvasWidth, canvasHeight, opacity, offsetY) {
		var composite = getTitleComposite(vertical, canvasWidth, canvasHeight, offsetY);
		if (!composite) return;
		titleCtx.save();
		titleCtx.globalAlpha = opacity;
		titleCtx.drawImage(composite, 0, 0, canvasWidth, canvasHeight);
		titleCtx.restore();
	};

	var getTitleEntranceState = function () {
		if (titleEntrancePending) return { opacity: 0, eased: 0 };
		if (titleEntranceStart == null) return { opacity: 1, eased: 1 };
		var now = window.performance && window.performance.now
			? window.performance.now() : Date.now();
		var progress = Math.max(0, Math.min(1,
			(now - titleEntranceStart) / TITLE_ENTRANCE.duration
		));
		if (progress >= 1) titleEntranceStart = null;
		return {
			opacity: progress,
			eased: 1 - Math.pow(1 - progress, 3)
		};
	};

	var startTitleEntranceWhenVisible = function () {
		if (!titleEntrancePending || titleEntranceStartScheduled ||
			!titleCanvas || titleCanvas.style.display === "none") return;
		var openingOverlay = document.getElementById("startImageBackgroundDiv");
		if (openingOverlay && getComputedStyle(openingOverlay).display !== "none") {
			if (!titleEntranceVisibilityObserver) {
				titleEntranceVisibilityObserver = new MutationObserver(startTitleEntranceWhenVisible);
				titleEntranceVisibilityObserver.observe(openingOverlay, {
					attributes: true,
					attributeFilter: ["style"]
				});
			}
			return;
		}
		if (titleEntranceVisibilityObserver) {
			titleEntranceVisibilityObserver.disconnect();
			titleEntranceVisibilityObserver = null;
		}
		titleEntranceStartScheduled = true;
		// 先让首页 Canvas 的透明首帧真正提交，再从下一帧开始计时。
		window.requestAnimationFrame(function () {
			window.requestAnimationFrame(function (timestamp) {
				titleEntranceStartScheduled = false;
				if (!titleEntrancePending || !titleCanvas || titleCanvas.style.display === "none") return;
				titleEntrancePending = false;
				titleEntranceStart = timestamp;
				renderTitle();
			});
		});
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
		titleCtx.imageSmoothingEnabled = true;
		if ("imageSmoothingQuality" in titleCtx) titleCtx.imageSmoothingQuality = "high";
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

		var entrance = getTitleEntranceState();
		var titleOffsetY = -TITLE_ENTRANCE.titleOffsetY * (1 - entrance.eased);
		var buttonOffsetY = TITLE_ENTRANCE.buttonOffsetY * (1 - entrance.eased);
		drawTitleImage(vertical, width, height, entrance.opacity, titleOffsetY);
		var buttonLayout = getTitleButtonLayout(width, height, vertical);
		titleCtx.save();
		titleCtx.globalAlpha = entrance.opacity;
		drawTitleButton(0, "开始冒险", offsetTitleButtonBox(buttonLayout.primary, buttonOffsetY), BUTTON_GOLD, true);
		drawTitleButton(1, "续关再战", offsetTitleButtonBox(buttonLayout.secondary[0], buttonOffsetY), BUTTON_GOLD, false);
		drawTitleButton(3, "武器图鉴", offsetTitleButtonBox(buttonLayout.secondary[1], buttonOffsetY), BUTTON_GOLD, false);
		drawTitleButton(4, "成就预览", offsetTitleButtonBox(buttonLayout.secondary[2], buttonOffsetY), BUTTON_GOLD, false);
		drawTitleButton(2, "精彩回放", offsetTitleButtonBox(buttonLayout.secondary[3], buttonOffsetY), BUTTON_GOLD, false);
		titleCtx.restore();
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
		} else if (index === 4 && core.plugin.achievementSystem) {
			core.plugin.achievementSystem.open();
		}
	};

	var showTitle = function () {
		if (!titleCanvas) return;
		titleSelection = 0;
		if (!titleEntrancePlayed) {
			titleEntrancePlayed = true;
			titleEntrancePending = true;
			titleEntranceStart = null;
		}
		main.dom.startButtonGroup.style.display = "none";
		main.dom.startButtons.style.display = "none";
		main.dom.levelChooseButtons.style.display = "none";
		if (titleVideo) {
			titleVideo.style.display = "block";
			var playPromise = titleVideo.play();
			if (playPromise && playPromise.catch) playPromise.catch(function () { });
		}
		titleCanvas.style.display = "block";
		renderTitle();
		startTitleEntranceWhenVisible();
		if (!titleAnimationFrame) {
			var animateTitle = function (timestamp) {
				if (!titleCanvas || titleCanvas.style.display === "none") {
					titleAnimationFrame = null;
					return;
				}
				if (titleEntranceStart != null || timestamp - titleLastFrame >= 70) {
					titleLastFrame = timestamp;
					renderTitle();
				}
				titleAnimationFrame = window.requestAnimationFrame(animateTitle);
			};
			titleAnimationFrame = window.requestAnimationFrame(animateTitle);
		}
		titleCanvas.focus();
		// 主界面已显示后提前缓存成就预览小图，避免首次打开成就面板时逐张等待。
		if (core.plugin.achievementSystem && core.plugin.achievementSystem.preloadPreviewImages) {
			core.plugin.achievementSystem.preloadPreviewImages();
		}
	};

	var hideTitle = function () {
		if (titleCanvas) titleCanvas.style.display = "none";
		if (titleEntranceVisibilityObserver) titleEntranceVisibilityObserver.disconnect();
		titleEntranceVisibilityObserver = null;
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
			titleCompositeCache = {};
			if (titleCanvas && titleCanvas.style.display !== "none") renderTitle();
		};
		titleImage.src = "project/images/title2.png";
		titleCharacterMaskImage = new Image();
		titleCharacterMaskImage.onload = prepareTitleCharacterMask;
		titleCharacterMaskImage.src = TITLE_CHARACTER_MASK_PATH;
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
		titleCanvas.style.outline = "none";
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
			var order = [0, 1, 3, 4, 2];
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
		returnToTitle: returnToTitle,
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
