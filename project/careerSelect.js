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
	// 标题与职业选择共用此视频；切换页面不重建节点、不重新加载或定位进度。
	var titleVideo = null;
	var titleImage = null;
	var titleCharacterMaskImage = null;
	var titleCharacterMaskSource = null;
	var titleCharacterMaskCache = {};
	var titleCompositeCache = {};
	var titleAnimatedComposite = null;
	var titleAnimationFrame = null;
	var titleLastFrame = 0;
	var titleEntranceStart = null;
	var titleEntrancePlayed = false;
	var titleEntrancePending = false;
	var titleEntranceStartScheduled = false;
	var titleEntranceVisibilityObserver = null;
	var titleHitboxes = [];
	var titleSelection = 0;
	var titleHoverIndex = -1;
	var titleKeyboardFocus = false;
	var selectedIndex = 0;
	var hoveredHit = null;
	var walkAnimationTimer = null;
	var walkFrame = 0;
	var visible = false;
	var hitboxes = [];
	var canvasLogicalWidth = 676;
	var canvasLogicalHeight = 416;

	// 参考图的金属边框：内凹圆弧、暗金底沿、香槟金、白色反光、内侧细线。
	// 所有几何都使用逻辑坐标绘制，沿用引擎的高清 Canvas 缩放。
	var theme = fantasyUI_6f31b8ea_7c4d_4b67_a215_03b247f8e903;
	var UI_INK = theme.tokens.ink;
	var UI_GOLD = theme.tokens.gold;
	var UI_SERIF = theme.tokens.serif;
	var UI_SANS = theme.tokens.sans;
	var drawLabelOn = theme.drawLabelOn;
	var drawText = function (text, x, y, size, color, align, weight, serif) {
		drawLabelOn(ctx, text, x, y, size, color, align, weight, serif);
	};

	var drawWrappedText = function (text, x, y, maxWidth, lineHeight, color, size) {
		ctx.save();
		ctx.font = (size || 12) + "px " + UI_SANS;
		var line = "";
		var lines = [];
		String(text).split("").forEach(function (character) {
			if (line && ctx.measureText(line + character).width > maxWidth) {
				lines.push(line);
				line = character;
			} else line += character;
		});
		if (line) lines.push(line);
		lines.forEach(function (one, index) {
			drawText(one, x, y + index * lineHeight, size || 12, color);
		});
		ctx.restore();
		return y + lines.length * lineHeight;
	};

	var diamondOn = theme.diamondOn;
	var arcFramePath = theme.arcFramePath;
	var metalGradient = theme.metalGradient;
	var cornerFlourishOn = theme.cornerFlourishOn;
	var drawCrestOn = theme.drawCrestOn;
	var drawArcFrameOn = theme.drawArcFrameOn;
	var hexButtonPath = theme.hexButtonPath;
	var drawHexButtonOn = theme.drawHexButtonOn;
	var pearlFill = function (box, blue) {
		var gradient = ctx.createLinearGradient(0, box.y, 0, box.y + box.h);
		gradient.addColorStop(0, blue ? "rgba(96,152,201,0.94)" : "rgba(238,249,253,0.88)");
		gradient.addColorStop(0.5, blue ? "rgba(231,245,247,0.97)" : "rgba(231,245,247,0.94)");
		gradient.addColorStop(1, "rgba(255,252,231,0.97)");
		return gradient;
	};

	var drawBackgroundOn = function (context, width, height) {
		var shade = context.createLinearGradient(0, 0, 0, height);
		shade.addColorStop(0, "rgba(106,166,213,0.04)");
		shade.addColorStop(0.55, "rgba(220,242,247,0.12)");
		shade.addColorStop(1, "rgba(217,237,233,0.47)");
		context.fillStyle = shade;
		context.fillRect(0, 0, width, height);
	};

	var getPortraitImage = function (career) {
		return core.material && core.material.images && core.material.images.images
			? core.material.images.images[career.portrait] : null;
	};

	var drawCharacter = function (career, box, fullFigure) {
		var image = getPortraitImage(career);
		if (!image || !image.width || !image.height) {
			drawText(career.id, box.x + box.w / 2, box.y + box.h / 2, 44, UI_INK, "center", "bold", true);
			return;
		}
		// 横屏窄卡片保留头部、身体；竖屏展示整幅立绘。
		var scale = fullFigure ? Math.min(box.w / image.width, box.h / image.height)
			: Math.max(box.w / image.width, box.h / image.height);
		var w = image.width * scale, h = image.height * scale;
		ctx.save();
		ctx.imageSmoothingEnabled = true;
		ctx.imageSmoothingQuality = "high";
		ctx.filter = career.portraitFilter || "none";
		ctx.drawImage(image, box.x + (box.w - w) / 2, box.y + (fullFigure ? box.h - h : 4), w, h);
		ctx.restore();
	};

	var drawWalkPreview = function (career, centerX, feetY) {
		var image = core.material.images.images[career.walk];
		if (!image || !image.width || !image.height) return;
		// 与开局配置使用同一张四向行走图，按引擎的朝下帧序播放。
		var down = core.material.icons.hero.down;
		var frames = [down.stop, down.leftFoot, down.stop, down.rightFoot];
		var frameWidth = image.width / 4, frameHeight = image.height / 4;
		var scale = Math.min(36 / frameWidth, 50 / frameHeight);
		ctx.save();
		var glow = ctx.createRadialGradient(centerX, feetY - 15, 1, centerX, feetY - 15, 32);
		glow.addColorStop(0, "rgba(255,240,181,0.6)");
		glow.addColorStop(1, "rgba(255,240,181,0)");
		ctx.fillStyle = glow;
		ctx.fillRect(centerX - 32, feetY - 47, 64, 64);
		ctx.beginPath();
		ctx.ellipse(centerX, feetY - 1, 23, 5, 0, 0, Math.PI * 2);
		ctx.fillStyle = "rgba(101,150,164,0.16)";
		ctx.fill();
		ctx.strokeStyle = "rgba(197,168,102,0.8)";
		ctx.lineWidth = 0.7;
		ctx.stroke();
		ctx.imageSmoothingEnabled = false;
		ctx.drawImage(image, frames[walkFrame] * frameWidth, down.loc * frameHeight, frameWidth, frameHeight,
			Math.round(centerX - frameWidth * scale / 2), Math.round(feetY - frameHeight * scale),
			Math.round(frameWidth * scale), Math.round(frameHeight * scale));
		ctx.restore();
	};

	var drawPortraitCard = function (career, index, box) {
		var selected = selectedIndex === index;
		ctx.save();
		arcFramePath(ctx, box, 2, 11);
		ctx.clip();
		var fill = ctx.createLinearGradient(0, box.y, 0, box.y + box.h);
		fill.addColorStop(0, selected ? "#7bb2d1" : index === 2 ? "#798ec0" : "#6f9fc2");
		fill.addColorStop(0.65, "#c6e0e6");
		fill.addColorStop(1, "#f5f7dc");
		ctx.fillStyle = fill;
		ctx.fillRect(box.x, box.y, box.w, box.h);
		// 细星轨压在人物下方，沿用参考图的轻盈蓝白底色。
		ctx.strokeStyle = "rgba(239,247,253,0.35)";
		ctx.lineWidth = 0.65;
		[0.7, 0.88].forEach(function (ratio) {
			ctx.beginPath();
			ctx.ellipse(box.x + box.w / 2, box.y + box.h * 0.42, box.w * ratio, box.h * 0.4, 0.28, 0, Math.PI * 2);
			ctx.stroke();
		});
		drawCharacter(career, { x: box.x + 3, y: box.y + 13, w: box.w - 6, h: box.h - 25 }, false);
		if (!selected) {
			ctx.fillStyle = "rgba(63,91,119,0.19)";
			ctx.fillRect(box.x, box.y, box.w, box.h);
		}
		var veil = ctx.createLinearGradient(0, box.y + box.h - 65, 0, box.y + box.h);
		veil.addColorStop(0, "rgba(240,252,247,0)");
		veil.addColorStop(0.65, selected ? "rgba(255,232,170,0.95)" : "rgba(235,245,234,0.85)");
		veil.addColorStop(1, selected ? "#f3d18b" : "#f5f7e9");
		ctx.fillStyle = veil;
		ctx.fillRect(box.x, box.y + box.h - 65, box.w, 65);
		ctx.restore();
		drawArcFrameOn(ctx, box, { radius: 11, selected: selected, hovered: hoveredHit === "career:" + index });
		var badge = { x: box.x + 9, y: box.y + 17, w: 15, h: 35 };
		// 窄铭牌只用两道细线，避免把大面板的五层边沿压进小尺寸。
		arcFramePath(ctx, badge, 0, 4);
		ctx.fillStyle = "rgba(247,250,231,0.9)";
		ctx.fill();
		ctx.lineWidth = 0.8;
		ctx.strokeStyle = "#d3bd7e";
		ctx.stroke();
		arcFramePath(ctx, badge, 1.7, 4);
		ctx.lineWidth = 0.5;
		ctx.stroke();
		career.name.split("").forEach(function (letter, i) {
			drawText(letter, badge.x + 7.5, badge.y + 12 + i * 11, 9, UI_INK, "center", "normal", true);
		});
		var nameY = box.y + box.h - 17;
		drawText(career.name, box.x + box.w / 2, nameY, 20, selected ? "#784c22" : "#48728b", "center", "bold", true);
		diamondOn(ctx, box.x + 19, nameY, 3, 5, "#fffde5");
		diamondOn(ctx, box.x + box.w - 19, nameY, 3, 5, "#fffde5");
		if (selected) {
			drawCrestOn(ctx, box.x + box.w / 2, box.y + 1, 7);
			var selectionBadge = { x: box.x + box.w - 65, y: box.y + 11, w: 54, h: 16 };
			hexButtonPath(ctx, selectionBadge, 0);
			ctx.fillStyle = metalGradient(ctx, selectionBadge);
			ctx.fill();
			ctx.strokeStyle = "#fff8d8";
			ctx.lineWidth = 0.7;
			ctx.stroke();
			drawText("✓ 已选择", selectionBadge.x + 27, selectionBadge.y + 8, 8.5, "#784c22", "center", "bold");
		}
		hitboxes.push({ type: "career", index: index, x: box.x, y: box.y, w: box.w, h: box.h });
	};

	var drawCareerTabs = function (box) {
		drawArcFrameOn(ctx, box, { radius: 10, fill: pearlFill(box), ornate: false });
		var width = (box.w - 16) / CAREERS.length;
		CAREERS.forEach(function (career, index) {
			var x = box.x + 8 + index * width;
			var centerX = x + width / 2;
			var selected = selectedIndex === index;
			if (index) {
				var divider = ctx.createLinearGradient(0, box.y + 9, 0, box.y + box.h - 9);
				divider.addColorStop(0, "rgba(220,201,147,0)");
				divider.addColorStop(0.5, "#d6c594");
				divider.addColorStop(1, "rgba(220,201,147,0)");
				ctx.fillStyle = divider;
				ctx.fillRect(x, box.y + 9, 0.7, box.h - 18);
			}
			var cy = box.y + 26, r = 18;
			ctx.save();
			ctx.beginPath();
			ctx.arc(centerX, cy, r, 0, Math.PI * 2);
			ctx.fillStyle = "#436b8a";
			ctx.fill();
			ctx.clip();
			var image = getPortraitImage(career);
			if (image && image.width) {
				var crop = Math.min(image.width, image.height * 0.34);
				ctx.drawImage(image, (image.width - crop) / 2, image.height * 0.015, crop, crop, centerX - r, cy - r, r * 2, r * 2);
			}
			ctx.restore();
			[ [r + 1.4, selected || hoveredHit === "career:" + index ? 2.5 : 1.5, selected || hoveredHit === "career:" + index ? "#d2b76e" : "#ded3ad"], [r + 3.8, 0.7, "#bcd3da"] ].forEach(function (ring) {
				ctx.beginPath();
				ctx.arc(centerX, cy, ring[0], 0, Math.PI * 2);
				ctx.strokeStyle = ring[2];
				ctx.lineWidth = ring[1];
				ctx.stroke();
			});
			drawText(career.name, centerX, box.y + 54, 17, selected ? "#805a2e" : "#668092", "center", "bold", true);
			if (selected) {
				diamondOn(ctx, centerX - 30, cy, 4, 7, UI_GOLD);
				diamondOn(ctx, centerX + 30, cy, 4, 7, UI_GOLD);
			}
			hitboxes.push({ type: "career", index: index, x: x, y: box.y + 4, w: width, h: box.h - 8 });
		});
	};

	var drawHeading = function (text, centerX, y, width, light) {
		var line = ctx.createLinearGradient(centerX - width / 2, 0, centerX + width / 2, 0);
		line.addColorStop(0, "rgba(218,197,138,0)");
		line.addColorStop(0.3, "#d7c28d");
		line.addColorStop(0.5, "#fff3bf");
		line.addColorStop(0.7, "#d7c28d");
		line.addColorStop(1, "rgba(218,197,138,0)");
		ctx.fillStyle = line;
		ctx.fillRect(centerX - width / 2, y + 16, width, 0.7);
		drawText(text, centerX, y, 23, light ? "#fff5c9" : UI_INK, "center", "bold", true);
		diamondOn(ctx, centerX - 65, y, 4, 8, UI_GOLD);
		diamondOn(ctx, centerX + 65, y, 4, 8, UI_GOLD);
		diamondOn(ctx, centerX, y + 17, 6, 8, "#e2c987");
		diamondOn(ctx, centerX, y + 17, 2, 4, "#fffbd8");
	};

	var drawCareerDetails = function (career, box, vertical) {
		var x = box.x + (vertical ? 25 : 15);
		var width = box.w - (vertical ? 50 : 30);
		drawHeading("职业简介", box.x + box.w / 2, box.y + 25, width, vertical);
		var y = box.y + 65;
		var size = vertical ? 14 : 12;
		var row = vertical ? 27 : 25;
		[
			["职业", career.name],
			["武器", career.poolTypes.join(" · ")]
		].forEach(function (entry) {
			drawText(entry[0] + "：", x, y, size, UI_INK, "left", "bold");
			drawText(entry[1], x + size * 3, y, size, UI_INK);
			y += row;
		});
		drawText("转职：", x, y, size, UI_INK, "left", "bold");
		y = drawWrappedText(career.promotions.join(" · "), x + size * 3, y, width - size * 3, 19, UI_INK, vertical ? 12 : 10.5) + 7;
		ctx.fillStyle = "rgba(152,182,190,0.32)";
		ctx.fillRect(x, y - 2, width, 0.6);
		y += 11;
		y = drawWrappedText("代表：" + career.poolPreview, x, y, width, 18, "#38617b", vertical ? 12 : 10.5) + 5;
		drawWrappedText(career.unlockText, x, y, width, 17, "#4e7384", vertical ? 11 : 10);
	};

	var drawConfirmButton = function (box) {
		drawHexButtonOn(ctx, box, "确认选择", true, hoveredHit === "confirm", box.h * 0.43);
		hitboxes.push({ type: "confirm", x: box.x, y: box.y, w: box.w, h: box.h });
	};

	var drawBackButton = function (box) {
		drawHexButtonOn(ctx, box, "返回", false, hoveredHit === "back", box.h * 0.43);
		hitboxes.push({ type: "back", x: box.x, y: box.y, w: box.w, h: box.h });
	};

	var renderLandscape = function () {
		var career = CAREERS[selectedIndex];
		drawBackgroundOn(ctx, 676, 416);
		var panel = { x: 20, y: 64, w: 636, h: 309 };
		drawArcFrameOn(ctx, panel, { radius: 14, fill: pearlFill(panel), crest: true, ornate: true });
		CAREERS.forEach(function (one, index) {
			drawPortraitCard(one, index, { x: 37 + index * 119, y: 80, w: 110, h: 277 });
		});
		ctx.fillStyle = "rgba(255,255,241,0.8)";
		ctx.fillRect(397, 80, 1, 277);
		ctx.fillStyle = "rgba(201,215,197,0.6)";
		ctx.fillRect(400, 80, 0.5, 277);
		drawCareerDetails(career, { x: 406, y: 80, w: 230, h: 269 }, false);
		drawWalkPreview(career, 451, 335);
		drawBackButton({ x: 503, y: 320, w: 99, h: 29 });
		drawConfirmButton({ x: 265, y: 362, w: 146, h: 32 });
	};

	var renderVertical = function (viewHeight) {
		var career = CAREERS[selectedIndex];
		drawBackgroundOn(ctx, 416, viewHeight);
		var mist = ctx.createRadialGradient(208, viewHeight * 0.3, 45, 208, viewHeight * 0.3, 350);
		mist.addColorStop(0, "rgba(224,242,246,0.54)");
		mist.addColorStop(1, "rgba(224,242,246,0.10)");
		ctx.fillStyle = mist;
		ctx.fillRect(0, 0, 416, viewHeight);
		drawArcFrameOn(ctx, { x: 11, y: 11, w: 394, h: viewHeight - 25 }, { radius: 13, crest: true });
		var detailHeight = 266;
		var detailY = viewHeight - detailHeight - 25;
		var tabs = { x: 23, y: detailY - 80, w: 370, h: 68 };
		// 立绘下部自然融入职业栏，避免竖排按钮挤占人物展示空间。
		drawCharacter(career, { x: 33, y: 27, w: 350, h: tabs.y - 20 }, true);
		var veil = ctx.createLinearGradient(0, tabs.y - 32, 0, tabs.y + 5);
		veil.addColorStop(0, "rgba(230,245,235,0)");
		veil.addColorStop(1, "rgba(239,248,232,0.7)");
		ctx.fillStyle = veil;
		ctx.fillRect(24, tabs.y - 32, 368, 37);
		drawCareerTabs(tabs);
		var detail = { x: 21, y: detailY, w: 374, h: detailHeight };
		drawArcFrameOn(ctx, detail, { radius: 12, fill: pearlFill(detail, true), ornate: true });
		drawCareerDetails(career, detail, true);
		drawWalkPreview(career, 70, viewHeight - 53);
		drawConfirmButton({ x: 124, y: viewHeight - 57, w: 168, h: 40 });
		drawBackButton({ x: 307, y: viewHeight - 56, w: 65, h: 29 });
	};

	var paintCareer = function () {
		if (!visible || !ctx) return;
		hitboxes = [];
		ctx.clearRect(0, 0, canvasLogicalWidth, canvasLogicalHeight);
		if (core.domStyle && core.domStyle.isVertical) renderVertical(canvasLogicalHeight);
		else renderLandscape();
	};

	var startWalkAnimation = function () {
		if (walkAnimationTimer) window.clearInterval(walkAnimationTimer);
		walkFrame = 0;
		walkAnimationTimer = window.setInterval(function () {
			if (!visible || document.hidden) return;
			walkFrame = (walkFrame + 1) % 4;
			// 只重绘界面，不调整 Canvas 尺寸或触碰背景视频的播放进度。
			paintCareer();
		}, 180);
	};

	var render = function () {
		if (!visible || !canvas || !ctx) return;
		var vertical = !!(core.domStyle && core.domStyle.isVertical);
		var groupRect = core.dom.gameGroup.getBoundingClientRect();
		// 职业选择是独立的固定层，竖屏使用完整视口，不继承游戏地图的上下黑边。
		if (vertical) groupRect = { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };
		canvasLogicalWidth = vertical ? 416 : 676;
		canvasLogicalHeight = vertical
			? Math.max(540, Math.round(canvasLogicalWidth * groupRect.height / Math.max(1, groupRect.width)))
			: 416;
		canvas.style.width = groupRect.width + "px";
		canvas.style.height = groupRect.height + "px";
		if (titleVideo) {
			titleVideo.style.left = groupRect.left + "px";
			titleVideo.style.top = groupRect.top + "px";
			titleVideo.style.width = groupRect.width + "px";
			titleVideo.style.height = groupRect.height + "px";
			titleVideo.style.objectPosition = vertical ? "57% center" : "center center";
			titleVideo.style.filter = vertical ? "blur(2px) saturate(0.88)" : "none";
		}
		if (core.maps && typeof core.maps._setHDCanvasSize === "function") {
			core.maps._setHDCanvasSize(ctx, canvasLogicalWidth, canvasLogicalHeight);
		} else {
			canvas.width = canvasLogicalWidth;
			canvas.height = canvasLogicalHeight;
		}
		paintCareer();
		canvas.setAttribute("aria-label", "选择初始职业，当前" + CAREERS[selectedIndex].name + "。方向键切换，回车确认，Esc返回。");
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
		walkFrame = 0;
		render();
	};

	var getGameBackgroundVideos = function () {
		if (main.dom.outerBackgroundVideos && main.dom.outerBackgroundVideos.length) {
			return main.dom.outerBackgroundVideos.slice();
		}
		return main.dom.outerBackgroundVideo ? [main.dom.outerBackgroundVideo] : [];
	};

	var pauseGameBackgroundVideos = function () {
		getGameBackgroundVideos().forEach(function (video) { video.pause(); });
	};

	var playBackgroundVideo = function (video) {
		if (!video || document.hidden) return;
		video.muted = true;
		// 浏览器回收隐藏视频的解码器后，play() 不能自行清除终止的媒体错误。
		if (video.error) video.load();
		var playPromise = video.play();
		if (playPromise && playPromise.catch) playPromise.catch(function (error) {
			// 切换页面会主动 pause；自动播放被阻止时由下次用户交互恢复。
			if (error.name !== "AbortError" && error.name !== "NotAllowedError") {
				console.warn("背景视频暂未播放：", video.id, error.message);
			}
		});
	};

	var resumeActiveBackgroundVideo = function () {
		if (visible) {
			pauseGameBackgroundVideos();
			playBackgroundVideo(titleVideo);
		} else if (titleCanvas && titleCanvas.style.display !== "none" && core.dom.startPanel.style.display !== "none") {
			pauseGameBackgroundVideos();
			playBackgroundVideo(titleVideo);
		}
	};

	var hideCareer = function (targetVideos) {
		visible = false;
		hoveredHit = null;
		if (walkAnimationTimer) window.clearInterval(walkAnimationTimer);
		walkAnimationTimer = null;
		if (canvas) canvas.style.display = "none";
		if (!Array.isArray(targetVideos)) targetVideos = targetVideos ? [targetVideos] : [];
		if (titleVideo && titleVideo.readyState >= 1) {
			targetVideos.forEach(function (targetVideo) {
				if (targetVideo === titleVideo) return;
				try { targetVideo.currentTime = titleVideo.currentTime; } catch (error) { }
			});
		}
		// 返回主界面时继续用同一视频；只有进入游戏才暂停菜单背景。
		if (titleVideo && targetVideos.indexOf(titleVideo) < 0) {
			titleVideo.pause();
			titleVideo.style.display = "none";
		}
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
			var next = hitboxes.filter(function (box) { return isInside(point.x, point.y, box); })[0];
			var nextHit = next ? next.type === "career" ? "career:" + next.index : next.type : null;
			canvas.style.cursor = next ? "pointer" : "default";
			if (nextHit !== hoveredHit) {
				hoveredHit = nextHit;
				paintCareer();
			}
		});

		canvas.addEventListener("mouseleave", function () {
			hoveredHit = null;
			canvas.style.cursor = "default";
			paintCareer();
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

	var prepare = function () {
		createCanvas();
		pauseGameBackgroundVideos();
		selectedIndex = 0;
		hoveredHit = null;
		canvas.style.cursor = "default";
		visible = true;
		if (main.dom.outerBackground) main.dom.outerBackground.style.display = "none";
		if (main.dom.outerUI) main.dom.outerUI.style.display = "none";
		if (titleVideo) {
			titleVideo.style.display = "block";
			titleVideo.style.zIndex = "9999";
			playBackgroundVideo(titleVideo);
		}
		canvas.style.display = "block";
		render();
		startWalkAnimation();
	};

	var open = function () {
		if (!visible) prepare();
		canvas.focus();
		render();
	};

	// 标题与职业选择共用参考图的六边形金框。
	var BUTTON_GOLD = "#dac58a";
	// 标题按钮尺寸、字重和点击区域统一从布局配置派生。
	var TITLE_BUTTON_LAYOUT = {
		buttonAspectRatio: 4.2,
		primaryFontHeightRatio: 0.43,
		secondaryFontHeightRatio: 0.41,
		primaryFontWidthRatio: 0.095,
		secondaryFontWidthRatio: 0.095,
		landscape: {
			primaryWidthRatio: 0.25,
			secondaryWidthRatio: 0.18,
			secondaryGroupSpanRatio: 0.64,
			groupOffsetYRatio: 0.075,
			primaryCenterYRatio: 0.63,
			secondaryCenterYRatio: 0.8
		},
		portrait: {
			primaryWidthRatio: 0.44,
			secondaryWidthRatio: 0.30,
			secondaryGroupSpanRatio: 0.42,
			secondaryRowGapRatio: 0.074,
			groupOffsetYRatio: 0.075,
			primaryCenterYRatio: 0.7,
			secondaryCenterYRatio: 0.785
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

	var drawTitleButton = function (index, textValue, box, accent, primary) {
		var selected = index === titleHoverIndex || (titleKeyboardFocus && index === titleSelection);
		var fontSize = Math.round(Math.max(
			box.h * (primary ? TITLE_BUTTON_LAYOUT.primaryFontHeightRatio : TITLE_BUTTON_LAYOUT.secondaryFontHeightRatio),
			box.w * (primary ? TITLE_BUTTON_LAYOUT.primaryFontWidthRatio : TITLE_BUTTON_LAYOUT.secondaryFontWidthRatio)
		));
		drawHexButtonOn(titleCtx, box, textValue, primary, selected, fontSize);
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
		if (titleVideo) {
			var groupRect = core.dom.gameGroup.getBoundingClientRect();
			titleVideo.style.left = groupRect.left + "px";
			titleVideo.style.top = groupRect.top + "px";
			titleVideo.style.width = groupRect.width + "px";
			titleVideo.style.height = groupRect.height + "px";
			titleVideo.style.objectPosition = vertical ? "57% center" : "center center";
			titleVideo.style.filter = "none";
		}
		var width = vertical ? 416 : 676;
		var height = vertical ? 676 : 416;
		core.maps._setHDCanvasSize(titleCtx, width, height);
		titleCtx.imageSmoothingEnabled = true;
		if ("imageSmoothingQuality" in titleCtx) titleCtx.imageSmoothingQuality = "high";
		titleCtx.clearRect(0, 0, width, height);
		titleHitboxes = [];

		drawBackgroundOn(titleCtx, width, height);

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
		pauseGameBackgroundVideos();
		titleSelection = 0;
		titleHoverIndex = -1;
		titleKeyboardFocus = false;
		titleCanvas.style.cursor = "default";
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
			titleVideo.style.zIndex = "299";
			if (titleVideo.readyState >= 2) titleVideo.style.opacity = "1";
			playBackgroundVideo(titleVideo);
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
		if (titleVideo && !visible) {
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
		titleVideo.style.position = "fixed";
		titleVideo.style.left = "0";
		titleVideo.style.top = "0";
		titleVideo.style.width = "100%";
		titleVideo.style.height = "100%";
		titleVideo.style.objectFit = "cover";
		titleVideo.style.zIndex = "299";
		titleVideo.style.opacity = "0";
		titleVideo.style.transition = "opacity 240ms ease";
		titleVideo.style.pointerEvents = "none";
		titleVideo.style.display = "none";
		["loadeddata", "canplay", "playing"].forEach(function (eventName) {
			titleVideo.addEventListener(eventName, function () {
				titleVideo.style.opacity = "1";
				main.dom.startBackground.style.visibility = "hidden";
			});
		});
		titleVideo.addEventListener("error", function () {
			titleVideo.style.opacity = "0";
			main.dom.startBackground.style.visibility = "visible";
		});
		core.dom.startPanel.style.backgroundColor = "transparent";
		core.dom.gameGroup.insertAdjacentElement("afterend", titleVideo);
	};

	var loadTitleImage = function () {
		titleImage = new Image();
		titleImage.onload = function () {
			titleCompositeCache = {};
			if (titleCanvas && titleCanvas.style.display !== "none") renderTitle();
		};
		titleImage.src = "project/images/title2.png?v=" + main.version;
		titleCharacterMaskImage = new Image();
		titleCharacterMaskImage.onload = prepareTitleCharacterMask;
		titleCharacterMaskImage.src = TITLE_CHARACTER_MASK_PATH;
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
			var nextIndex = next ? next.index : -1;
			if (nextIndex !== titleHoverIndex || titleKeyboardFocus) {
				titleHoverIndex = nextIndex;
				titleKeyboardFocus = false;
				if (next) titleSelection = next.index;
				renderTitle();
			}
		});

		titleCanvas.addEventListener("mouseleave", function () {
			titleHoverIndex = -1;
			titleCanvas.style.cursor = "default";
			renderTitle();
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
			titleHoverIndex = -1;
			titleKeyboardFocus = true;
			renderTitle();
		});

		window.addEventListener("resize", function () {
			if (titleCanvas.style.display !== "none") window.requestAnimationFrame(renderTitle);
		});
	};

	createTitleVideo();
	loadTitleImage();
	createTitleCanvas();
	// 重新聚焦或首次交互时补偿浏览器的媒体暂停策略。
	document.addEventListener("visibilitychange", function () {
		if (!document.hidden) resumeActiveBackgroundVideo();
	});
	document.addEventListener("pointerdown", resumeActiveBackgroundVideo, true);
	document.addEventListener("keydown", resumeActiveBackgroundVideo, true);

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
