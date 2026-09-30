/** 背包与战斗共用的武器详情 Tooltip 和显示格式。 */
var backpackUiCommon_2c986f67_7621_44eb_972d_24f1e2c6ce61;
// 显式定义导出对象；块级变量保留私有状态，加载时不调用初始化函数。
{

	/** The engine's server checker sets replayChecking before plugin initialization.
	 * Browser replay still has presentation and must not be treated as headless. */
	let isHeadlessReplay = function () {
		return typeof main !== "undefined" && !!main.replayChecking;
	};
	let canUseDOM = function () {
		return !isHeadlessReplay() && typeof document !== "undefined"
			&& typeof document.createElement === "function"
			&& typeof document.querySelector === "function"
			&& typeof window !== "undefined" && typeof window.addEventListener === "function";
	};

	let tooltip = null;
	let activeAnchor = null;
	let pinnedAnchor = null;
	let lastPointer = null;
	let tooltipHideTimer = null;
	let releaseTooltipViewport = null;
	let tooltipMoveFrame = null;
	let pendingTooltipPosition = null;
	let lastTooltipHtml = null;
	let TOOLTIP_HIDE_DELAY = 0;
	let recipePreviewRoot = null;
	let recipeWeaponDetailRoot = null;
	let recipeWeaponDetailReturnFocus = null;
	let weaponCardRenderer = null;
	let modalStack = [];
	let modalKeyboardInstalled = false;
	// 武器定义保存项目相对路径，引擎则按文件名缓存已加载的 Image。
	// 在这里统一两者，避免各界面使用无版本参数的 URL 再请求一次相同文件。
	let weaponImageCache = Object.create(null);
	let weaponImageCore = null;

	// 所有武器入口共用这一层；读取主题放在调用时，兼容纯数据脚本并行加载。
	let weaponTheme = function () {
		"use strict";
		return typeof fantasyUI_6f31b8ea_7c4d_4b67_a215_03b247f8e903 === "undefined"
			? null : fantasyUI_6f31b8ea_7c4d_4b67_a215_03b247f8e903;
	};
	let decorateWeaponSurface = function (element, options) {
		"use strict";
		var theme = weaponTheme();
		if (!element || !theme) return;
		element.classList.add("weapon-ui-surface");
		theme.decorate(element, options || { radius: 15, interactive: true });
	};
	// 仅装饰使用固定序列，不消耗游戏/商店随机数。离屏、后台与关闭时停止动画。
	let particleHosts = new Map();
	let particleObserver = null;
	let syncParticleVisibility = function () {
		"use strict";
		particleHosts.forEach(function (record) {
			record.layer.classList.toggle("is-running", record.visible && !document.hidden);
		});
	};
	let decorateWeaponParticles = function (element, rarity) {
		"use strict";
		var counts = { 3: 18, 4: 26, 5: 38 };
		var count = counts[rarity];
		if (!element || !count || particleHosts.has(element) || !element.style.setProperty) return;
		var layer = document.createElement("span");
		layer.className = "weapon-card-particles";
		layer.setAttribute("aria-hidden", "true");
		var seed = 0;
		var identity = String(element.dataset && element.dataset.weaponId || rarity);
		for (var j = 0; j < identity.length; j++) seed = (seed * 31 + identity.charCodeAt(j)) % 997;
		for (var i = 0; i < count; i++) {
			var mote = document.createElement("i");
			var side = i % 4;
			var along = 12 + ((Math.floor(i / 4) * 29 + side * 17 + seed) % 76);
			mote.className = "weapon-card-mote" + (i % 3 !== 1 ? " is-star" : "") + (i % 5 === 1 ? " is-warm" : "");
			mote.style.left = side === 0 ? "17px" : side === 1 ? "calc(100% - 17px)" : along + "%";
			mote.style.top = (side === 2 ? 5 : side === 3 ? 96 : along) + "%";
			mote.style.setProperty("--mote-size", (i % 3 !== 1 ? 12 + Number(rarity) * 2 + i % 3 : 4 + i % 3) + "px");
			mote.style.setProperty("--mote-dx", (side === 0 ? -8 : side === 1 ? 8 : (i % 5 - 2) * 8) + "px");
			mote.style.setProperty("--mote-dy", (side === 3 ? -38 : -46 - i % 29) + "px");
			mote.style.setProperty("--mote-duration", (2.8 + (i % 7) * .24) + "s");
			mote.style.setProperty("--mote-delay", (-i * .73 - Number(rarity) * .31 - (seed % 97) * .037) + "s");
			layer.appendChild(mote);
		}
		element.appendChild(layer);
		if (!particleHosts.size) document.addEventListener("visibilitychange", syncParticleVisibility);
		particleHosts.set(element, { layer: layer, visible: false });
		if (typeof IntersectionObserver !== "undefined") {
			if (!particleObserver) particleObserver = new IntersectionObserver(function (entries) {
				entries.forEach(function (entry) {
					var record = particleHosts.get(entry.target);
					if (record) record.visible = entry.isIntersecting;
				});
				syncParticleVisibility();
			});
			particleObserver.observe(element);
		}
		// 不支持观察器时保留静态星光，避免整本图鉴持续运行动画。
	};
	let releaseWeaponUI = function (root) {
		"use strict";
		if (!root) return;
		particleHosts.forEach(function (record, element) {
			if (root !== element && !(root.contains && root.contains(element))) return;
			if (particleObserver) particleObserver.unobserve(element);
			record.layer.remove();
			particleHosts.delete(element);
		});
		if (!particleHosts.size) {
			if (particleObserver) { particleObserver.disconnect(); particleObserver = null; }
			if (typeof document !== "undefined") document.removeEventListener("visibilitychange", syncParticleVisibility);
		}
		var theme = weaponTheme();
		if (theme) theme.releaseTree(root);
	};
	let setWeaponButtonLabel = function (button, text) {
		"use strict";
		if (!button) return;
		var label = button.classList.contains("fantasy-ui-button") ? button.querySelector("span") : null;
		(label || button).textContent = text;
	};

	let normalizeImagePath = function (source) {
		"use strict";
		return String(source || "").replace(/\\/g, "/");
	};

	let stripImageQuery = function (source) {
		"use strict";
		return normalizeImagePath(source).split("#")[0].split("?")[0];
	};

	/** 把 project/images/foo.webp 转成引擎图片缓存使用的 foo.webp。 */
	let getWeaponImageKey = function (source) {
		"use strict";
		var path = stripImageQuery(source);
		var marker = "project/images/";
		var markerIndex = path.indexOf(marker);
		if (markerIndex >= 0) return path.substring(markerIndex + marker.length);
		if (/^(?:data|blob):/i.test(path)) return "";
		return path;
	};

	let getEngineWeaponImage = function (source, coreRef) {
		"use strict";
		coreRef = coreRef || weaponImageCore || (typeof core !== "undefined" ? core : null);
		var images = coreRef && coreRef.material && coreRef.material.images
			? coreRef.material.images.images : null;
		var key = getWeaponImageKey(source);
		return images && key ? images[key] || null : null;
	};

	/** 旧存档的图片名称仍可访问已预加载的 WebP，不请求已移除的 PNG/JPEG。 */
	let registerLegacyImageAliases = function (coreRef) {
		"use strict";
		var images = coreRef && coreRef.material && coreRef.material.images
			? coreRef.material.images.images : null;
		if (!images) return 0;
		var added = 0;
		Object.keys(images).forEach(function (name) {
			if (!/\.webp$/i.test(name)) return;
			["png", "jpg", "jpeg"].forEach(function (extension) {
				var legacyName = name.replace(/\.webp$/i, "." + extension);
				if (images[legacyName]) return;
				images[legacyName] = images[name];
				added++;
			});
		});
		// 模板对话头像只识别 .png；通过缓存别名支持 WebP，保留标题和原有图块解析。
		var original = coreRef.ui && coreRef.ui._getTitleAndIcon;
		if (typeof original === "function" && !original._supportsWebpPortrait) {
			var wrapped = function (content) {
				return original.call(this, content.replace(/(\t|\\t)\[(([^\],]+),)?([^\],]+)\.webp\]/gi,
					function (tag, prefix, titlePart, title, name) {
						return prefix + "[" + (titlePart || "") + name + ".png]";
					}));
			};
			wrapped._supportsWebpPortrait = true;
			coreRef.ui._getTitleAndIcon = wrapped;
		}
		return added;
	};

	let buildVersionedImageSource = function (source) {
		"use strict";
		var path = normalizeImagePath(source);
		if (!path || /^(?:data|blob):/i.test(path)) return path;
		if (/^(?:https?:)?\/\//i.test(path)) return path;
		if (/[?&]v=/.test(path)) return path;
		var version = typeof main !== "undefined" && main ? main.version : null;
		return version == null || version === "" ? path : path + (path.indexOf("?") >= 0 ? "&" : "?") + "v=" + version;
	};

	/** 压缩资源使用会被释放的 blob URL；转为稳定 data URL 后才能供后续 DOM 图片复用。 */
	let makeStableEngineImageSource = function (image, fallbackSource) {
		"use strict";
		if (!image || !image.src) return buildVersionedImageSource(fallbackSource);
		if (!/^blob:/i.test(image.src)) return image.src;
		if (typeof document === "undefined" || typeof document.createElement !== "function") {
			return buildVersionedImageSource(fallbackSource);
		}
		try {
			var width = image.naturalWidth || image.width;
			var height = image.naturalHeight || image.height;
			if (!width || !height) return buildVersionedImageSource(fallbackSource);
			var canvas = document.createElement("canvas");
			canvas.width = width;
			canvas.height = height;
			canvas.getContext("2d").drawImage(image, 0, 0);
			return canvas.toDataURL("image/png");
		}
		catch (e) {
			return buildVersionedImageSource(fallbackSource);
		}
	};

	let cacheWeaponImage = function (source, coreRef) {
		"use strict";
		var key = getWeaponImageKey(source);
		if (!key) return { key: "", src: normalizeImagePath(source), image: null, ready: null };
		var record = weaponImageCache[key] || { key: key, src: "", image: null, ready: null };
		var engineImage = getEngineWeaponImage(source, coreRef);
		if (engineImage) {
			if (record.image !== engineImage || !record.src) {
				record.src = makeStableEngineImageSource(engineImage, source);
			}
			record.image = engineImage;
			record.ready = typeof Promise === "function" ? Promise.resolve(engineImage) : null;
			weaponImageCache[key] = record;
			return record;
		}
		if (record.image) return record;

		record.src = buildVersionedImageSource(source);
		if (typeof Image === "undefined") {
			weaponImageCache[key] = record;
			return record;
		}
		var image = new Image();
		image.decoding = "async";
		record.image = image;
		if (typeof Promise === "function") {
			record.ready = new Promise(function (resolve) {
				image.onload = function () { resolve(image); };
				image.onerror = function () { resolve(null); };
			});
		}
		image.src = record.src;
		weaponImageCache[key] = record;
		return record;
	};

	/** 在引擎开始加载资源前，把所有武器图自动并入 core.images。 */
	let registerWeaponImages = function (coreRef, definitions) {
		"use strict";
		weaponImageCore = coreRef || weaponImageCore;
		if (!coreRef || !Array.isArray(coreRef.images)) return 0;
		var known = Object.create(null);
		coreRef.images.forEach(function (name) { known[normalizeImagePath(name)] = true; });
		var added = 0;
		Object.keys(definitions || {}).forEach(function (definitionId) {
			var name = getWeaponImageKey(definitions[definitionId] && definitions[definitionId].image);
			if (!name || known[name]) return;
			known[name] = true;
			coreRef.images.push(name);
			added++;
		});
		return added;
	};

	/** 资源加载完成后，将武器路径一次性映射到引擎已加载的 Image。 */
	let preloadWeaponImages = function (coreRef, definitions) {
		"use strict";
		weaponImageCore = coreRef || weaponImageCore;
		var waits = [];
		Object.keys(definitions || {}).forEach(function (definitionId) {
			var source = definitions[definitionId] && definitions[definitionId].image;
			if (!source) return;
			var record = cacheWeaponImage(source, coreRef);
			if (record.ready) waits.push(record.ready);
		});
		return typeof Promise === "function" ? Promise.all(waits) : null;
	};

	let getWeaponImageSource = function (source) {
		"use strict";
		return cacheWeaponImage(source, weaponImageCore).src || normalizeImagePath(source);
	};

	let setWeaponImageSource = function (imageElement, source) {
		"use strict";
		if (!imageElement) return imageElement;
		imageElement.decoding = "async";
		imageElement.src = getWeaponImageSource(source);
		return imageElement;
	};

	/** 背景只读取模板预加载图片，不另行加载原文件；压缩包图片沿用稳定地址缓存。 */
	let setPreloadedBackground = function (element, source, coreRef) {
		"use strict";
		if (!element) return element;
		var record = getEngineWeaponImage(source, coreRef) ? cacheWeaponImage(source, coreRef) : null;
		element.style.backgroundImage = record ? "url(" + JSON.stringify(record.src) + ")" : "none";
		return element;
	};

	let getCachedWeaponImage = function (source) {
		"use strict";
		return cacheWeaponImage(source, weaponImageCore).image;
	};

	let getWeaponImageCacheStats = function () {
		"use strict";
		var keys = Object.keys(weaponImageCache);
		return {
			count: keys.length,
			loaded: keys.filter(function (key) { return !!weaponImageCache[key].image; }).length
		};
	};

	/**
	 * 弹层会在捕获阶段拦截方向键的 keyup；若玩家在弹层打开前正按着方向键，
	 * 引擎便收不到松键通知。接管或归还弹层焦点时主动终止移动，避免关闭后继续行走。
	 */
	let clearHeldMovementKeys = function () {
		"use strict";
		if (typeof core === "undefined" || !core || !core.status) return;
		core.status.holdingKeys = [];
		core.status.heroStop = true;
	};

	let isEscapeKey = function (event) {
		"use strict";
		return event && (event.key === "Escape" || event.key === "Esc" || event.keyCode === 27);
	};

	/** DOM 弹层与地图共用 outerUI 的边界和缩放密度，不能使用浏览器视口。 */
	let getGameViewport = function (coreRef) {
		"use strict";
		if (isHeadlessReplay()) return null;
		coreRef = coreRef || (typeof core !== "undefined" ? core : weaponImageCore);
		var outer = typeof document !== "undefined" && document.getElementById
			? document.getElementById("outerUI") || document.getElementById("gameGroup") : null;
		var rect = outer && typeof outer.getBoundingClientRect === "function" && outer.getBoundingClientRect();
		if (rect && (!rect.width || !rect.height)) {
			outer = document.getElementById("gameGroup");
			rect = outer && typeof outer.getBoundingClientRect === "function" && outer.getBoundingClientRect();
		}
		if (!rect || !rect.width || !rect.height) return null;
		var domStyle = coreRef && coreRef.domStyle || {};
		var vertical = typeof domStyle.isVertical === "boolean" ? domStyle.isVertical : rect.height > rect.width;
		var scale = Number(domStyle.scale) > 0 ? Number(domStyle.scale) / (vertical ? 1 : 1.5) : 1;
		return { element: outer, left: rect.left, top: rect.top, width: rect.width / scale,
			height: rect.height / scale, scale: scale, vertical: vertical };
	};

	let viewportBindingId = 0;
	let bindGameViewport = function (root, coreRef, onResize) {
		"use strict";
		if (isHeadlessReplay() || !root || !root.style || typeof window === "undefined"
			|| typeof window.addEventListener !== "function" || typeof window.removeEventListener !== "function") return function () {};
		coreRef = coreRef || (typeof core !== "undefined" ? core : weaponImageCore);
		var resizeName = "gameModalViewport" + (++viewportBindingId);
		var sync = function () {
			var viewport = getGameViewport(coreRef);
			if (!viewport) return;
			if (onResize) { onResize(viewport); return; }
			root.classList.add("game-viewport-bound");
			root.dataset.gameMobile = viewport.width <= 700 ? "true" : "false";
			root.style.left = viewport.left + "px";
			root.style.top = viewport.top + "px";
			root.style.width = viewport.width + "px";
			root.style.height = viewport.height + "px";
			root.style.transform = "scale(" + viewport.scale + ")";
			root.style.setProperty("--game-ui-width", viewport.width + "px");
			root.style.setProperty("--game-ui-height", viewport.height + "px");
		};
		sync();
		window.addEventListener("resize", sync);
		window.addEventListener("scroll", sync, true);
		if (coreRef && coreRef.registerResize) coreRef.registerResize(resizeName, sync);
		var viewport = getGameViewport(coreRef);
		var observer = typeof ResizeObserver === "function" && viewport ? new ResizeObserver(sync) : null;
		if (observer) observer.observe(viewport.element);
		var outer = document.getElementById("outerUI");
		if (observer && outer && outer !== viewport.element) observer.observe(outer);
		// 只移动/居中游戏窗口时尺寸可能不变，仍需同步弹层位置。
		var positionObserver = typeof MutationObserver === "function" && viewport ? new MutationObserver(sync) : null;
		if (positionObserver) {
			positionObserver.observe(viewport.element, { attributes: true, attributeFilter: ["style", "class"] });
			if (outer && outer !== viewport.element) positionObserver.observe(outer, { attributes: true, attributeFilter: ["style", "class"] });
			var group = document.getElementById("gameGroup");
			if (group && group !== viewport.element) positionObserver.observe(group, { attributes: true, attributeFilter: ["style", "class"] });
		}
		return function () {
			window.removeEventListener("resize", sync);
			window.removeEventListener("scroll", sync, true);
			if (coreRef && coreRef.unregisterResize) coreRef.unregisterResize(resizeName);
			if (observer) observer.disconnect();
			if (positionObserver) positionObserver.disconnect();
		};
	};

	let removeModalEntry = function (entry) {
		"use strict";
		if (!entry) return;
		if (entry.releaseViewport) entry.releaseViewport();
		if (entry.root && entry.keyGuard && typeof entry.root.removeEventListener === "function") {
			entry.root.removeEventListener("keydown", entry.keyGuard);
			entry.root.removeEventListener("keyup", entry.keyGuard);
		}
		var index = modalStack.indexOf(entry);
		if (index >= 0) modalStack.splice(index, 1);
	};

	/** Guides 使用视口坐标画箭头；保留坐标系，只收拢提示并裁剪遮罩。 */
	let bindGuideViewport = function (canvas) {
		"use strict";
		if (isHeadlessReplay() || !canvas) return function () {};
		var theme = weaponTheme();
		var surfaces = new Map();
		var releaseSurface = function (surface) {
			if (theme) theme.releaseTree(surface);
			surfaces.delete(surface);
		};
		var sync = function (viewport) {
			// Guides 切步和窗口缩放都会替换提示节点，及时释放旧金框的尺寸观察器。
			surfaces.forEach(function (_, surface) {
				if (!canvas.contains(surface)) releaseSurface(surface);
			});
			var scale = viewport.scale, left = viewport.left, top = viewport.top;
			var right = left + viewport.width * scale, bottom = top + viewport.height * scale;
			canvas.style.clipPath = "inset(" + top + "px " + Math.max(0, window.innerWidth - right)
				+ "px " + Math.max(0, window.innerHeight - bottom) + "px " + left + "px)";
			document.querySelectorAll(".bb-guide-target-proxy,.backpack-guide-target-proxy").forEach(function (proxy) {
				var rect = proxy.getBoundingClientRect();
				proxy.style.clipPath = "inset(" + (top - rect.top) + "px " + (rect.right - right)
					+ "px " + (rect.bottom - bottom) + "px " + (left - rect.left) + "px)";
			});
			canvas.querySelectorAll(".guides-guide").forEach(function (guide) {
				var copy = guide.querySelector("span");
				if (copy) {
					var content = surfaces.get(copy);
					if (!content) {
						content = document.createElement("span");
						content.className = "bb-guide-content";
						while (copy.firstChild) content.appendChild(copy.firstChild);
						copy.appendChild(content);
						surfaces.set(copy, content);
						if (theme) theme.decorate(copy, { radius: 16, crest: true });
					}
					copy.style.maxWidth = Math.min(390, viewport.width - 96) + "px";
					// 只滚动正文，凹角金框和顶部徽记保持固定。
					content.style.maxHeight = Math.max(40, viewport.height - 140) + "px";
				}
				guide.style.transformOrigin = "top left";
				guide.style.transform = "scale(" + scale + ")";
				var rect = guide.getBoundingClientRect(), margin = 8 * scale;
				var x = Math.max(left + margin, Math.min(rect.left, right - rect.width - margin));
				var y = Math.max(top + margin, Math.min(rect.top, bottom - rect.height - margin));
				guide.style.transform = "translate(" + (x - rect.left) + "px," + (y - rect.top) + "px) scale(" + scale + ")";
			});
		};
		var release = bindGameViewport(canvas, null, sync);
		var observer = new MutationObserver(function () {
			var viewport = getGameViewport();
			if (viewport) sync(viewport);
		});
		observer.observe(canvas, { childList: true, subtree: true });
		return function () {
			release();
			observer.disconnect();
			surfaces.forEach(function (_, surface) { releaseSurface(surface); });
		};
	};

	/** 丢弃已被外部代码移除的弹层，避免失效节点继续拦截键盘。 */
	let pruneModalStack = function () {
		"use strict";
		for (var index = modalStack.length - 1; index >= 0; index--) {
			var entry = modalStack[index];
			if (!entry.root || entry.root.isConnected === false) removeModalEntry(entry);
		}
	};

	let getTopModal = function () {
		"use strict";
		pruneModalStack();
		return modalStack.length ? modalStack[modalStack.length - 1] : null;
	};

	/**
	 * 捕获所有键盘事件：Esc 在 keyup 时关闭栈顶，避免同一次按键继续触发引擎菜单；
	 * 其他按键仅允许送入栈顶弹层，随后由根节点阻止它冒泡到 body 快捷键。
	 */
	let handleModalKeyboard = function (event) {
		"use strict";
		var top = getTopModal();
		if (!top) return;
		if (isEscapeKey(event)) {
			if (event.preventDefault) event.preventDefault();
			if (event.stopImmediatePropagation) event.stopImmediatePropagation();
			else if (event.stopPropagation) event.stopPropagation();
			if (event.type === "keyup") closeTopModal();
			return;
		}
		if (!top.root.contains || !top.root.contains(event.target)) {
			if (event.preventDefault) event.preventDefault();
			if (event.stopImmediatePropagation) event.stopImmediatePropagation();
			else if (event.stopPropagation) event.stopPropagation();
		}
	};

	let installModalKeyboard = function () {
		"use strict";
		if (modalKeyboardInstalled || typeof document === "undefined") return;
		document.addEventListener("keydown", handleModalKeyboard, true);
		document.addEventListener("keyup", handleModalKeyboard, true);
		modalKeyboardInstalled = true;
	};

	let uninstallModalKeyboard = function () {
		"use strict";
		if (!modalKeyboardInstalled || modalStack.length || typeof document === "undefined") return;
		document.removeEventListener("keydown", handleModalKeyboard, true);
		document.removeEventListener("keyup", handleModalKeyboard, true);
		modalKeyboardInstalled = false;
	};

	/** 把弹层压入栈；同一根节点重复注册时会移动到栈顶。 */
	let registerModal = function (root, close, options) {
		"use strict";
		if (!root || typeof close !== "function") return false;
		clearHeldMovementKeys();
		unregisterModal(root, { restoreFocus: false });
		options = options || {};
		var entry = {
			root: root,
			close: close,
			name: options.name || root.className || "modal",
			closing: false,
			previousFocus: typeof document !== "undefined" ? document.activeElement : null,
			keyGuard: null
		};
		if (options.viewport !== false) entry.releaseViewport = bindGameViewport(root);
		entry.keyGuard = function (event) {
			if (getTopModal() === entry && event.stopPropagation) event.stopPropagation();
		};
		if (typeof root.addEventListener === "function") {
			root.addEventListener("keydown", entry.keyGuard);
			root.addEventListener("keyup", entry.keyGuard);
		}
		if (typeof root.hasAttribute === "function" && !root.hasAttribute("tabindex")) root.tabIndex = -1;
		modalStack.push(entry);
		installModalKeyboard();
		if (options.focus !== false && typeof root.focus === "function") root.focus();
		return true;
	};

	/** 从弹层栈移除指定节点，并把焦点还给打开它之前的弹层。 */
	let unregisterModal = function (root, options) {
		"use strict";
		options = options || {};
		var removed = null;
		var wasTop = false;
		for (var index = modalStack.length - 1; index >= 0; index--) {
			if (modalStack[index].root !== root) continue;
			wasTop = index === modalStack.length - 1;
			removed = modalStack[index];
			removeModalEntry(removed);
		}
		uninstallModalKeyboard();
		if (removed) clearHeldMovementKeys();
		if (removed && wasTop && options.restoreFocus !== false) {
			var focusTarget = removed.previousFocus;
			if (!focusTarget || focusTarget.isConnected === false) {
				var top = getTopModal();
				focusTarget = top && top.root;
			}
			if (focusTarget && typeof focusTarget.focus === "function") focusTarget.focus();
		}
		return !!removed;
	};

	/** 只关闭当前栈顶弹层，形成后进先出的 Esc 行为。 */
	let closeTopModal = function () {
		"use strict";
		var top = getTopModal();
		if (!top || top.closing) return false;
		top.closing = true;
		try {
			top.close();
		} finally {
			top.closing = false;
			unregisterModal(top.root);
		}
		return true;
	};

	let isTopModal = function (root) {
		"use strict";
		var top = getTopModal();
		return !!top && top.root === root;
	};

	let hasOpenModal = function () {
		"use strict";
		return !!getTopModal();
	};

	let getModalDepth = function () {
		"use strict";
		pruneModalStack();
		return modalStack.length;
	};

	let escapeHtml = function (value) {
		"use strict";
		return String(value == null ? "" : value)
			.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;")
			.replace(/"/g, "&quot;")
			.replace(/'/g, "&#39;");
	};

	let formatNumber = function (value, digits) {
		"use strict";
		if (value == null || !Number.isFinite(Number(value))) return "—";
		var factor = Math.pow(10, digits == null ? 2 : digits);
		var rounded = Math.round(Number(value) * factor) / factor;
		return String(rounded);
	};

	/** 奥义获取显示：正值带 + 前缀，负值（消耗型武器）原样显示负号，空值显示破折号。 */
	let formatUltimateGain = function (value) {
		"use strict";
		if (value == null || !Number.isFinite(Number(value))) return "—";
		var number = Number(value);
		var text = formatNumber(number);
		return number > 0 ? "+" + text : text;
	};

	let formatPercent = function (value) {
		"use strict";
		return value == null || !Number.isFinite(Number(value))
			? "—"
			: formatNumber(Number(value) * 100, 1) + "%";
	};

	/** 商店与背包共用：转义特殊效果文案，并把上方联动符号替换为黄色动态双箭头。 */
	let formatSpecialEffectHtml = function (text) {
		"use strict";
		return String(text || "无特殊效果").split(/([\^∧＾])/g).map(function (part) {
			if (/^[\^∧＾]$/.test(part)) {
				return "<span class='bui-inline-synergy direction-up' role='img' aria-label='上方联动'></span>";
			}
			return escapeHtml(part);
		}).join("");
	};

	let getDamageText = function (source) {
		"use strict";
		source = source || {};
		if (source.minAttack == null && source.maxAttack == null) return "—";
		var minimum = source.minAttack == null ? source.maxAttack : source.minAttack;
		var maximum = source.maxAttack == null ? source.minAttack : source.maxAttack;
		return formatNumber(minimum) + "～" + formatNumber(maximum);
	};

	let hasChanged = function (left, right) {
		"use strict";
		if (left == null && right == null) return false;
		return Math.abs((Number(left) || 0) - (Number(right) || 0)) > 0.0001;
	};

	let statNames = {
		attack: "伤害",
		minAttack: "伤害下限",
		maxAttack: "伤害上限",
		hitRate: "命中率",
		attackInterval: "攻击间隔",
		attackIntervalTicks: "攻击间隔",
		ultimateGain: "奥义获取"
	};

	let describeBonus = function (bonus) {
		"use strict";
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

	let makeValueWithBase = function (currentText, changed, baseText) {
		"use strict";
		return "<strong>" + escapeHtml(currentText) + "</strong>"
			+ (changed ? "<small>基础 " + escapeHtml(baseText) + "</small>" : "");
	};

	let getWeaponDefinitions = function () {
		"use strict";
		return typeof weaponDefinitions_9f2e6f5b_4b2c_4f8c_9a3d_7e1b6c0d5a44 !== "undefined"
			? weaponDefinitions_9f2e6f5b_4b2c_4f8c_9a3d_7e1b6c0d5a44 : {};
	};

	let getRecipeData = function () {
		"use strict";
		return typeof weaponRecipes_7f2e9c4a_3b5d_4f8a_9c1e_6d4b8a2f9c31 !== "undefined"
			? weaponRecipes_7f2e9c4a_3b5d_4f8a_9c1e_6d4b8a2f9c31 : { recipes: [] };
	};

	/** 配方使用 weapons.js 的键；背包和战斗快照保存的是内部短 id，因此统一在这里反查。 */
	let getWeaponKey = function (weapon) {
		"use strict";
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

	let getWeaponDefinition = function (weapon) {
		"use strict";
		var key = getWeaponKey(weapon);
		return key ? getWeaponDefinitions()[key] : (typeof weapon === "object" ? weapon : null);
	};

	let getRecipeDisplayName = function (key) {
		"use strict";
		var definitions = getWeaponDefinitions();
		var displayNames = getRecipeData().displayNames || {};
		return displayNames[key] || (definitions[key] && definitions[key].name) || String(key || "未知武器");
	};

	let getWeaponRecipes = function (weapon) {
		"use strict";
		var key = getWeaponKey(weapon);
		if (!key) return [];
		var recipes = getRecipeData().recipes;
		return (Array.isArray(recipes) ? recipes : []).filter(function (recipe) {
			return recipe && (recipe.a === key || recipe.b === key);
		});
	};

	let canCraftWithWeapon = function (weapon) {
		"use strict";
		return getWeaponRecipes(weapon).length > 0;
	};

	let buildCraftHammerHtml = function (weapon) {
		"use strict";
		var key = getWeaponKey(weapon);
		if (!key || !canCraftWithWeapon(key)) return "";
		return "<button type='button' class='bui-craft-hammer' data-bui-craft-key='"
			+ escapeHtml(key) + "' title='预览这把武器的合成表' aria-label='预览"
			+ escapeHtml(getRecipeDisplayName(key)) + "的合成表'>🔨</button>";
	};

	let normalizeWeaponCells = function (weapon) {
		"use strict";
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

	let percentStyle = function (left, top, width, height) {
		"use strict";
		return "left:" + left + "%;top:" + top + "%;width:" + width + "%;height:" + height + "%;";
	};
	/** 用真实占格校正图片留白：细长武器放开短边，不规则武器避免按整个外接矩形放大。 */
	let getWeaponImageInset = function (weapon, baseInset) {
		"use strict";
		weapon = weapon || {};
		var cells = normalizeWeaponCells(weapon.baseCells ? { cells: weapon.baseCells } : weapon);
		var occupied = Object.create(null);
		cells.forEach(function (cell) { occupied[cell[0] + "," + cell[1]] = true; });
		var cols = Math.max.apply(null, cells.map(function (cell) { return cell[0]; }))
			- Math.min.apply(null, cells.map(function (cell) { return cell[0]; })) + 1;
		var rows = Math.max.apply(null, cells.map(function (cell) { return cell[1]; }))
			- Math.min.apply(null, cells.map(function (cell) { return cell[1]; })) + 1;
		var inset = baseInset == null ? .12 : baseInset;
		if (Math.max(cols, rows) / Math.min(cols, rows) >= 2) inset = .04;
		var coverage = Object.keys(occupied).length / (cols * rows);
		inset += Math.min(.18, Math.max(0, 1 - coverage) * .6);
		return Math.min(inset, (Math.min(cols, rows) - .1) / 2);
	};

	/** Tooltip 内使用真实占格与等比裁剪，展示与合成槽一致的武器格子预览。 */
	let buildWeaponGridPreviewHtml = function (weapon) {
		"use strict";
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
		var inset = getWeaponImageInset(weapon);
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
			+ escapeHtml(getWeaponImageSource(weapon.image || "")) + "' alt='' decoding='async' style='" + imageStyle + "'></div>");
		html.push("</div><small>占 " + cells.length + " 格 · " + boundsCols + "×" + boundsRows + "</small></div>");
		return html.join("");
	};

	let buildWeaponTooltip = function (data) {
		"use strict";
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

	let setWeaponCardRenderer = function (renderer) {
		"use strict";
		weaponCardRenderer = renderer || null;
	};

	let isMobileRecipeLayout = function () {
		"use strict";
		if (weaponCardRenderer && typeof weaponCardRenderer.isMobileListLayout === "function") {
			return weaponCardRenderer.isMobileListLayout();
		}
		if (typeof window === "undefined") return false;
		if (typeof window.matchMedia === "function") return window.matchMedia("(max-width: 700px)").matches;
		return Number(window.innerWidth) <= 700;
	};

	let closeRecipeWeaponDetail = function (restoreFocus) {
		"use strict";
		if (!recipeWeaponDetailRoot) return false;
		var returnFocus = recipeWeaponDetailReturnFocus;
		unregisterModal(recipeWeaponDetailRoot);
		releaseWeaponUI(recipeWeaponDetailRoot);
		recipeWeaponDetailRoot.remove();
		recipeWeaponDetailRoot = null;
		recipeWeaponDetailReturnFocus = null;
		if (restoreFocus !== false && returnFocus && returnFocus.isConnected
			&& typeof returnFocus.focus === "function") returnFocus.focus();
		return true;
	};

	/** 移动端点击配方武器名后，用统一卡片组件弹出并默认展开完整详情。 */
	let openRecipeWeaponDetail = function (definition, trigger) {
		"use strict";
		if (!definition || !weaponCardRenderer || typeof document === "undefined") return false;
		closeRecipeWeaponDetail(false);
		var root = document.createElement("div");
		root.className = "bui-recipe-weapon-detail-root";
		var panel = document.createElement("section");
		panel.className = "bui-recipe-weapon-detail-panel";
		panel.setAttribute("role", "dialog");
		panel.setAttribute("aria-modal", "true");
		panel.setAttribute("aria-label", String(definition.name || "武器") + "的详细信息");
		var close = document.createElement("button");
		close.type = "button";
		close.className = "bui-recipe-preview-close bui-recipe-weapon-detail-close";
		close.textContent = "返回";
		close.setAttribute("aria-label", "关闭武器详情");
		var card = weaponCardRenderer.createCard(definition, {
			showCraftHammer: false,
			mobileListMode: true,
			className: "bui-recipe-weapon-detail-card"
		});
		card.classList.add("is-mobile-expanded");
		var summary = card.querySelector(".weapon-card-summary");
		if (summary) {
			summary.setAttribute("aria-expanded", "true");
			summary.setAttribute("aria-label", "收起武器属性与特殊效果");
		}
		panel.appendChild(close);
		panel.appendChild(card);
		root.appendChild(panel);
		document.body.appendChild(root);
		decorateWeaponSurface(panel, { radius: 23, ornate: true, crest: true });
		decorateWeaponSurface(close, { button: true });
		recipeWeaponDetailRoot = root;
		recipeWeaponDetailReturnFocus = trigger || null;
		close.addEventListener("click", function (event) {
			event.stopPropagation();
			closeRecipeWeaponDetail();
		});
		root.addEventListener("click", function (event) {
			event.stopPropagation();
			if (event.target === root) closeRecipeWeaponDetail();
		});
		registerModal(root, closeRecipeWeaponDetail, { name: "recipe-weapon-detail" });
		close.focus();
		return true;
	};

	let closeWeaponRecipePreview = function () {
		"use strict";
		closeRecipeWeaponDetail(false);
		unregisterModal(recipePreviewRoot);
		releaseWeaponUI(recipePreviewRoot);
		if (recipePreviewRoot && recipePreviewRoot.parentNode) recipePreviewRoot.parentNode.removeChild(recipePreviewRoot);
		recipePreviewRoot = null;
	};

	let appendCraftHammer = function (container, weapon) {
		"use strict";
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
	let renderWeaponName = function (container, weapon, options) {
		"use strict";
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

	let appendRecipeWeaponName = function (container, key, currentKey, onActivate) {
		"use strict";
		var span = document.createElement("span");
		span.className = "bui-recipe-preview-weapon" + (key === currentKey ? " is-current" : "");
		span.dataset.weaponKey = key;
		var definition = getWeaponDefinitions()[key];
		renderWeaponName(span, definition || key, { label: getRecipeDisplayName(key) });
		if (definition) {
			span.classList.add("has-details");
			span.tabIndex = 0;
			span.setAttribute("role", "button");
			span.setAttribute("aria-label", "查看" + getRecipeDisplayName(key) + "的武器详情");
			var activate = function () { if (typeof onActivate === "function") onActivate(key, definition, span); };
			span.addEventListener("click", function (event) {
				event.preventDefault();
				event.stopPropagation();
				activate();
			});
			span.addEventListener("keydown", function (event) {
				if (event.key !== "Enter" && event.key !== " ") return;
				event.preventDefault();
				event.stopPropagation();
				activate();
			});
		}
		container.appendChild(span);
	};

	let openWeaponRecipePreview = function (weapon) {
		"use strict";
		var key = getWeaponKey(weapon);
		var recipes = getWeaponRecipes(key);
		if (!key || !recipes.length || typeof document === "undefined") return false;
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
		close.textContent = "返回";
		close.setAttribute("aria-label", "关闭合成表预览");
		close.addEventListener("click", closeWeaponRecipePreview);
		header.appendChild(heading);
		header.appendChild(close);
		panel.appendChild(header);
		var content = document.createElement("div");
		content.className = "bui-recipe-preview-content";
		var detailHost = document.createElement("aside");
		detailHost.className = "bui-recipe-preview-detail";
		detailHost.setAttribute("aria-live", "polite");
		var list = document.createElement("div");
		list.className = "bui-recipe-preview-list";
		var showWeaponDetails = function (selectedKey, definition, trigger) {
			if (!definition || !weaponCardRenderer) return false;
			if (isMobileRecipeLayout()) return openRecipeWeaponDetail(definition, trigger);
			releaseWeaponUI(detailHost);
			detailHost.textContent = "";
			detailHost.appendChild(weaponCardRenderer.createCard(definition, {
				showCraftHammer: false,
				className: "bui-recipe-preview-detail-card"
			}));
			Array.prototype.forEach.call(panel.querySelectorAll(".bui-recipe-preview-weapon"), function (name) {
				name.classList.toggle("is-selected", name.dataset.weaponKey === selectedKey);
			});
			return true;
		};
		var seen = {};
		recipes.forEach(function (recipe) {
			var recipeKey = [recipe.a, recipe.b].sort().join("+") + "→" + recipe.result;
			if (seen[recipeKey]) return;
			seen[recipeKey] = true;
			var card = document.createElement("div");
			card.className = "bui-recipe-preview-card";
			appendRecipeWeaponName(card, recipe.a, key, showWeaponDetails);
			var plus = document.createElement("span");
			plus.className = "bui-recipe-preview-plus";
			plus.textContent = "+";
			card.appendChild(plus);
			appendRecipeWeaponName(card, recipe.b, key, showWeaponDetails);
			var arrow = document.createElement("b");
			arrow.className = "bui-recipe-preview-arrow";
			arrow.textContent = "→";
			card.appendChild(arrow);
			appendRecipeWeaponName(card, recipe.result, key, showWeaponDetails);
			list.appendChild(card);
			decorateWeaponSurface(card, { radius: 11, interactive: true });
		});
		content.appendChild(detailHost);
		content.appendChild(list);
		panel.appendChild(content);
		root.appendChild(panel);
		root.addEventListener("pointerdown", function (event) {
			if (event.target === root) closeWeaponRecipePreview();
		});
		document.body.appendChild(root);
		decorateWeaponSurface(panel, { radius: 23, ornate: true, crest: true });
		decorateWeaponSurface(close, { button: true });
		recipePreviewRoot = root;
		registerModal(root, closeWeaponRecipePreview, { name: "weapon-recipe-preview" });
		if (!isMobileRecipeLayout()) showWeaponDetails(key, getWeaponDefinitions()[key], null);
		close.focus();
		return true;
	};

	let ensureTooltip = function () {
		"use strict";
		if (tooltip && tooltip.isConnected) return tooltip;
		tooltip = document.createElement("div");
		lastTooltipHtml = null;
		tooltip.className = "bui-tooltip";
		tooltip.setAttribute("role", "tooltip");
		tooltip.addEventListener("pointerenter", function () {
			if (tooltipHideTimer) clearTimeout(tooltipHideTimer);
			tooltipHideTimer = null;
		});
		tooltip.addEventListener("pointerleave", function () {
			if (!pinnedAnchor) hideTooltip();
		});
		tooltip.addEventListener("pointerdown", function (event) {
			event.stopPropagation();
		});
		tooltip.addEventListener("click", function (event) {
			event.stopPropagation();
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

	let positionTooltip = function (event, anchor) {
		"use strict";
		if (!tooltip || !tooltip.classList.contains("show") || !anchor) return;
		// 背包详情有独立的贴边定位，保持其已有的物理像素坐标。
		if (tooltip.classList.contains("backpack-panel-tooltip")) return;
		var viewport = getGameViewport() || { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight, scale: 1 };
		var scale = viewport.scale;
		var margin = 8 * scale;
		var left = viewport.left + margin, top = viewport.top + margin;
		var right = viewport.left + viewport.width * scale - margin;
		var bottom = viewport.top + viewport.height * scale - margin;
		var mobile = viewport.width <= 700;
		tooltip.style.setProperty("--game-tip-scale", scale);
		tooltip.style.setProperty("--game-tip-width", Math.min(370, viewport.width - 16) + "px");
		tooltip.style.setProperty("--game-tip-height", Math.min(520, viewport.height * (mobile ? 0.48 : 1) - 16) + "px");
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
		var width = tooltip.offsetWidth * scale, height = tooltip.offsetHeight * scale;
		if (mobile) { x = left; y = bottom - height; }
		else if (x + width > right) x -= width + 34 * scale;
		tooltip.style.setProperty("--game-tip-left", Math.max(left, Math.min(x, right - width)) + "px");
		tooltip.style.setProperty("--game-tip-top", Math.max(top, Math.min(y, bottom - height)) + "px");
	};

	let cancelQueuedTooltipPosition = function () {
		"use strict";
		pendingTooltipPosition = null;
		if (tooltipMoveFrame == null) return;
		if (typeof window.cancelAnimationFrame === "function") window.cancelAnimationFrame(tooltipMoveFrame);
		tooltipMoveFrame = null;
	};

	/** 鼠标高频移动只在下一帧做一次尺寸读取与定位，避免每个 pointermove 都强制布局。 */
	let queueTooltipPosition = function (event, anchor) {
		"use strict";
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

	let showTooltip = function (anchor, html, event) {
		"use strict";
		if (isHeadlessReplay() || !anchor || !html) return;
		if (tooltipHideTimer) clearTimeout(tooltipHideTimer);
		tooltipHideTimer = null;
		cancelQueuedTooltipPosition();
		ensureTooltip();
		if (activeAnchor && activeAnchor !== anchor) activeAnchor.classList.remove("bui-hover");
		activeAnchor = anchor;
		anchor.classList.add("bui-hover");
		if (lastTooltipHtml !== html) {
			releaseWeaponUI(tooltip);
			tooltip.innerHTML = html;
			var weaponTip = tooltip.querySelector(".bui-weapon-tip");
			tooltip.classList.toggle("weapon-ui-tooltip", !!weaponTip);
			if (weaponTip) decorateWeaponSurface(weaponTip, { radius: 16, ornate: true });
			lastTooltipHtml = html;
		}
		tooltip.classList.add("show");
		positionTooltip(event, anchor);
		if (!releaseTooltipViewport) releaseTooltipViewport = bindGameViewport(tooltip, null, function () {
			positionTooltip(null, activeAnchor);
		});
	};

	/** 点击武器后固定 Tooltip；再次固定其他武器时直接切换内容与锚点。 */
	let pinTooltip = function (anchor, html, event) {
		"use strict";
		if (isHeadlessReplay() || !anchor || !html) return;
		pinnedAnchor = anchor;
		showTooltip(anchor, html, event);
	};

	let hideTooltip = function (anchor) {
		"use strict";
		if (tooltipHideTimer) clearTimeout(tooltipHideTimer);
		tooltipHideTimer = null;
		if (anchor && activeAnchor && anchor !== activeAnchor) return;
		cancelQueuedTooltipPosition();
		if (activeAnchor) activeAnchor.classList.remove("bui-hover");
		if (releaseTooltipViewport) releaseTooltipViewport();
		releaseTooltipViewport = null;
		if (tooltip) tooltip.classList.remove("show");
		activeAnchor = null;
		pinnedAnchor = null;
	};

	let unpinTooltip = function () {
		"use strict";
		hideTooltip();
	};

	let isTooltipPinned = function (anchor) {
		"use strict";
		return !!pinnedAnchor && (!anchor || pinnedAnchor === anchor);
	};

	let scheduleTooltipHide = function (anchor) {
		"use strict";
		if (pinnedAnchor) return;
		if (tooltipHideTimer) clearTimeout(tooltipHideTimer);
		tooltipHideTimer = setTimeout(function () { hideTooltip(anchor); }, TOOLTIP_HIDE_DELAY);
	};

	let bindTooltip = function (element, provider, options) {
		"use strict";
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
			if (pinnedAnchor) return;
			var wasActive = activeAnchor === element;
			showTooltip(element, provider(), event);
			if (!wasActive && options.onEnter) options.onEnter(event);
		};
		var move = function (event) {
			if (pinnedAnchor) return;
			if (activeAnchor === element) queueTooltipPosition(event, element);
		};
		var leave = function (event) {
			if (pinnedAnchor) return;
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
			if (pinnedAnchor && pinnedAnchor !== element) return;
			var wasActive = activeAnchor === element;
			showTooltip(element, provider());
			if (!wasActive && options.onEnter) options.onEnter();
		});
		element.addEventListener("blur", function (event) {
			if (pinnedAnchor) return;
			if (tooltip && event.relatedTarget && tooltip.contains(event.relatedTarget)) return;
			scheduleTooltipHide(element);
			if (options.onLeave) options.onLeave(event);
		});
		if (options.openOnMobileClick) {
			element.addEventListener("click", function (event) {
				if (typeof window === "undefined") return;
				var coarsePointer = typeof window.matchMedia === "function"
					&& window.matchMedia("(hover: none), (pointer: coarse)").matches;
				if (window.innerWidth > 680 && !coarsePointer) return;
				if (event.preventDefault) event.preventDefault();
				if (event.stopPropagation) event.stopPropagation();
				showTooltip(element, provider());
			});
		}
	};

	let buildStatusTooltip = function (definition, stacks, description, remainingTicks) {
		"use strict";
		var kind = definition.kind === "buff" ? "Buff" : "Debuff";
		return "<article class='bui-status-tip'><h3><span>" + escapeHtml(definition.name)
			+ "</span><small style='color:" + escapeHtml(definition.color || "#fff") + "'>" + kind + "</small></h3>"
			+ "<p>当前层数：<strong>" + escapeHtml(formatNumber(stacks, 1)) + "</strong></p>"
			+ "<p>" + escapeHtml(description) + "</p>"
			+ (definition.periodic ? "<p>距离下次结算：<strong>" + escapeHtml(formatNumber(remainingTicks / 100)) + " 秒</strong></p>" : "")
			+ "</article>";
	};

	backpackUiCommon_2c986f67_7621_44eb_972d_24f1e2c6ce61 = {
		decorateWeaponSurface: decorateWeaponSurface,
		decorateWeaponParticles: decorateWeaponParticles,
		releaseWeaponUI: releaseWeaponUI,
		setWeaponButtonLabel: setWeaponButtonLabel,
		escapeHtml: escapeHtml,
		registerWeaponImages: registerWeaponImages,
		registerLegacyImageAliases: registerLegacyImageAliases,
		preloadWeaponImages: preloadWeaponImages,
		getWeaponImageSource: getWeaponImageSource,
		setWeaponImageSource: setWeaponImageSource,
		setPreloadedBackground: setPreloadedBackground,
		getWeaponImageInset: getWeaponImageInset,
		getCachedWeaponImage: getCachedWeaponImage,
		getWeaponImageCacheStats: getWeaponImageCacheStats,
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
		setWeaponCardRenderer: setWeaponCardRenderer,
		openWeaponRecipePreview: openWeaponRecipePreview,
		closeWeaponRecipePreview: closeWeaponRecipePreview,
		registerModal: registerModal,
		unregisterModal: unregisterModal,
		closeTopModal: closeTopModal,
		isTopModal: isTopModal,
		hasOpenModal: hasOpenModal,
		getModalDepth: getModalDepth,
		isHeadlessReplay: isHeadlessReplay,
		canUseDOM: canUseDOM,
		getGameViewport: getGameViewport,
		bindGameViewport: bindGameViewport,
		bindGuideViewport: bindGuideViewport,
		bindTooltip: bindTooltip,
		showTooltip: showTooltip,
		pinTooltip: pinTooltip,
		unpinTooltip: unpinTooltip,
		isTooltipPinned: isTooltipPinned,
		hideTooltip: hideTooltip
	};
}
