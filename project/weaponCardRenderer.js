/**
 * 全局统一的武器卡片渲染组件。
 *
 * 商店、盲盒、图鉴等界面只负责传入数据和操作回调；武器预览、名称、稀有度、
 * 类型、属性、特殊效果、移动端列表交互与占格弹框统一由本组件输出。
 * 传入 { lock: true } 时只保留黑色轮廓，所有文本数据统一显示为 ???。
 */
var installWeaponCardRenderer_5ca7b6bd_8f36_4e6a_aa12_f8468a8ccf1c = function (core, plugin) {
	"use strict";
	if (plugin.weaponCardRenderer && plugin.weaponCardRenderer.__installed) return plugin.weaponCardRenderer;

	var uiCommon = (typeof backpackUiCommon_2c986f67_7621_44eb_972d_24f1e2c6ce61 !== "undefined")
		? backpackUiCommon_2c986f67_7621_44eb_972d_24f1e2c6ce61 : null;
	var synergyHelper = (typeof backpackWeaponSynergy_91f4c21e_7d37_4f12_9cc4_a9606ba62a83 !== "undefined")
		? backpackWeaponSynergy_91f4c21e_7d37_4f12_9cc4_a9606ba62a83 : null;
	// 武器图片与占格外缘之间保留 0.12 个格子的距离；横纵方向使用相同格子单位。
	var PREVIEW_IMAGE_INSET = 0.12;
	var previewModalRoot = null;
	var previewReturnFocus = null;
	var mobileDetailsSequence = 0;

	var rarityText = function (rarity) {
		var rarityNum = Number(rarity);
		var safe = isFinite(rarityNum) ? Math.max(0, Math.min(5, rarityNum)) : 0;
		return new Array(safe + 1).join("★");
	};

	var formatDetailNumber = function (value, digits) {
		if (value == null || !isFinite(Number(value))) return "—";
		var factor = Math.pow(10, digits == null ? 2 : digits);
		return String(Math.round(Number(value) * factor) / factor);
	};

	var damageText = function (definition) {
		if (definition.minAttack == null && definition.maxAttack == null && definition.attack == null) return "—";
		var minimum = definition.minAttack == null
			? (definition.maxAttack == null ? definition.attack : definition.maxAttack) : definition.minAttack;
		var maximum = definition.maxAttack == null
			? (definition.minAttack == null ? definition.attack : definition.minAttack) : definition.maxAttack;
		return formatDetailNumber(minimum) + "～" + formatDetailNumber(maximum);
	};

	var ultimateText = function (value) {
		if (value == null || !isFinite(Number(value))) return "—";
		var number = Number(value);
		return (number > 0 ? "+" : "") + formatDetailNumber(number);
	};

	var buildWeaponDetails = function (definition, options) {
		options = options || {};
		var locked = options.lock === true;
		var details = document.createElement("section");
		details.className = "weapon-card-details";
		var stats = document.createElement("dl");
		stats.className = "weapon-card-detail-stats";
		var values = locked ? ["???", "???", "???", "???"] : [
			damageText(definition),
			definition.hitRate == null ? "—" : formatDetailNumber(Number(definition.hitRate) * 100, 1) + "%",
			definition.attackInterval == null ? "—" : formatDetailNumber(definition.attackInterval) + " 秒",
			ultimateText(definition.ultimateGain)
		];
		["伤害", "命中", "攻击间隔", "奥义获取"].forEach(function (labelText, index) {
			var item = document.createElement("div");
			var label = document.createElement("dt");
			label.textContent = labelText;
			var value = document.createElement("dd");
			value.textContent = values[index];
			item.appendChild(label);
			item.appendChild(value);
			stats.appendChild(item);
		});
		details.appendChild(stats);

		var effect = document.createElement("div");
		effect.className = "weapon-card-detail-effect";
		var effectTitle = document.createElement("b");
		effectTitle.textContent = "特殊效果";
		var effectText = document.createElement("p");
		if (locked) effectText.textContent = "???";
		else if (uiCommon && typeof uiCommon.formatSpecialEffectHtml === "function") {
			effectText.innerHTML = uiCommon.formatSpecialEffectHtml(definition.synergyText);
		} else effectText.textContent = definition.synergyText || definition.description || "无";
		effect.appendChild(effectTitle);
		effect.appendChild(effectText);
		details.appendChild(effect);
		return details;
	};

	/** 把武器定义统一成武器系统使用的 cells 格式；仅在插件缺失时做最小兜底。 */
	var normalizePreviewWeapon = function (definition) {
		var weaponSystem = plugin.weaponSystem;
		if (weaponSystem && typeof weaponSystem.normalizeWeapon === "function") {
			return weaponSystem.normalizeWeapon(definition);
		}
		var cells = [];
		var shape = Array.isArray(definition.cells) ? null : (definition.shape || definition.size);
		if (Array.isArray(definition.cells)) {
			definition.cells.forEach(function (cell) {
				if (Array.isArray(cell) && cell.length >= 2) cells.push([Number(cell[0]) || 0, Number(cell[1]) || 0]);
			});
		} else if (Array.isArray(shape)) {
			shape.forEach(function (row, rowIndex) {
				if (!Array.isArray(row)) return;
				row.forEach(function (occupied, colIndex) {
					if (occupied) cells.push([colIndex, rowIndex]);
				});
			});
		}
		return Object.assign({}, definition, { cells: cells.length ? cells : [[0, 0]] });
	};

	/** 计算预览棋盘；锁定模式不计算联动格，避免提前泄露武器能力。 */
	var getPreviewGeometry = function (definition, options) {
		options = options || {};
		var weapon = normalizePreviewWeapon(definition);
		var weaponSystem = plugin.weaponSystem;
		var sourceCells = weaponSystem && typeof weaponSystem.getRotatedCells === "function"
			? weaponSystem.getRotatedCells(weapon, 0) : weapon.cells.slice();
		var entry = { weapon: weapon, col: 0, row: 0, rotation: 0 };
		var synergyCells = [];
		if (!options.lock && options.includeSynergy !== false) {
			if (weaponSystem && typeof weaponSystem.getSynergyCells === "function") {
				synergyCells = weaponSystem.getSynergyCells(entry);
			} else if (synergyHelper) synergyCells = synergyHelper.getAffectedCells(weapon, sourceCells, 0);
		}
		var allCells = sourceCells.map(function (cell) { return { col: cell[0], row: cell[1] }; }).concat(synergyCells);
		var paddingCells = options.paddingCells == null ? 1 : Math.max(0, Number(options.paddingCells) || 0);
		var minCol = Math.min.apply(null, allCells.map(function (cell) { return cell.col; })) - paddingCells;
		var maxCol = Math.max.apply(null, allCells.map(function (cell) { return cell.col; })) + paddingCells;
		var minRow = Math.min.apply(null, allCells.map(function (cell) { return cell.row; })) - paddingCells;
		var maxRow = Math.max.apply(null, allCells.map(function (cell) { return cell.row; })) + paddingCells;
		var sourceMinCol = Math.min.apply(null, sourceCells.map(function (cell) { return cell[0]; }));
		var sourceMaxCol = Math.max.apply(null, sourceCells.map(function (cell) { return cell[0]; }));
		var sourceMinRow = Math.min.apply(null, sourceCells.map(function (cell) { return cell[1]; }));
		var sourceMaxRow = Math.max.apply(null, sourceCells.map(function (cell) { return cell[1]; }));
		return {
			weapon: weapon,
			sourceCells: sourceCells,
			synergyCells: synergyCells,
			minCol: minCol,
			minRow: minRow,
			cols: maxCol - minCol + 1,
			rows: maxRow - minRow + 1,
			sourceBounds: {
				col: sourceMinCol,
				row: sourceMinRow,
				cols: sourceMaxCol - sourceMinCol + 1,
				rows: sourceMaxRow - sourceMinRow + 1
			}
		};
	};

	var positionPreviewCell = function (element, col, row, geometry) {
		element.style.left = ((col - geometry.minCol) / geometry.cols * 100) + "%";
		element.style.top = ((row - geometry.minRow) / geometry.rows * 100) + "%";
		element.style.width = (100 / geometry.cols) + "%";
		element.style.height = (100 / geometry.rows) + "%";
	};

	/** 图片保持等比缩放，imageCrop 的完整图与裁剪区域使用同一个 uniformScale。 */
	var layoutPreviewImage = function (imageFrame, image, geometry) {
		var bounds = geometry.sourceBounds;
		var inset = Math.min(PREVIEW_IMAGE_INSET, (bounds.cols - 0.1) / 2, (bounds.rows - 0.1) / 2);
		var frameCol = bounds.col + inset;
		var frameRow = bounds.row + inset;
		var frameCols = bounds.cols - inset * 2;
		var frameRows = bounds.rows - inset * 2;
		imageFrame.dataset.insetCells = String(inset);
		imageFrame.style.left = ((frameCol - geometry.minCol) / geometry.cols * 100) + "%";
		imageFrame.style.top = ((frameRow - geometry.minRow) / geometry.rows * 100) + "%";
		imageFrame.style.width = (frameCols / geometry.cols * 100) + "%";
		imageFrame.style.height = (frameRows / geometry.rows * 100) + "%";

		var crop = geometry.weapon.imageCrop;
		if (!Array.isArray(crop) || crop.length < 6
			|| !(crop[2] > 0) || !(crop[3] > 0) || !(crop[4] > 0) || !(crop[5] > 0)) return;
		var cropX = Number(crop[0]) || 0;
		var cropY = Number(crop[1]) || 0;
		var cropWidth = Number(crop[2]);
		var cropHeight = Number(crop[3]);
		var naturalWidth = Number(crop[4]);
		var naturalHeight = Number(crop[5]);
		var uniformScale = Math.min(frameCols / cropWidth, frameRows / cropHeight);
		var displayedCropWidth = cropWidth * uniformScale;
		var displayedCropHeight = cropHeight * uniformScale;
		image.style.width = (naturalWidth * uniformScale / frameCols * 100) + "%";
		image.style.height = (naturalHeight * uniformScale / frameRows * 100) + "%";
		image.style.left = ((frameCols - displayedCropWidth) / 2 / frameCols * 100
			- cropX * uniformScale / frameCols * 100) + "%";
		image.style.top = ((frameRows - displayedCropHeight) / 2 / frameRows * 100
			- cropY * uniformScale / frameRows * 100) + "%";
	};

	var buildWeaponPreview = function (definition, options) {
		options = options || {};
		var locked = options.lock === true;
		var geometry = getPreviewGeometry(definition, options);
		var preview = document.createElement("div");
		preview.className = "weapon-card-preview" + (locked ? " is-locked" : "")
			+ (geometry.synergyCells.length ? " has-synergy" : "");
		preview.dataset.occupiedCells = locked ? "?" : String(geometry.sourceCells.length);
		preview.setAttribute("aria-label", locked ? "未解锁武器" : ("占 " + geometry.sourceCells.length + " 格"
			+ (geometry.synergyCells.length ? "，悬停显示联动区域" : "，无格子联动")));
		var stage = document.createElement("div");
		stage.className = "weapon-card-preview-stage";
		stage.style.aspectRatio = geometry.cols + " / " + geometry.rows;
		if (geometry.cols >= geometry.rows) stage.style.width = "100%";
		else stage.style.height = "100%";
		preview.appendChild(stage);

		for (var row = 0; row < geometry.rows; row++) {
			for (var col = 0; col < geometry.cols; col++) {
				var gridCell = document.createElement("span");
				gridCell.className = "weapon-card-preview-grid-cell";
				positionPreviewCell(gridCell, geometry.minCol + col, geometry.minRow + row, geometry);
				stage.appendChild(gridCell);
			}
		}

		var imageFrame = document.createElement("div");
		imageFrame.className = "weapon-card-preview-image-frame";
		var image = document.createElement("img");
		uiCommon.setWeaponImageSource(image, geometry.weapon.image || "");
		image.alt = locked ? "未解锁武器" : (geometry.weapon.name || "");
		image.draggable = false;
		layoutPreviewImage(imageFrame, image, geometry);
		imageFrame.appendChild(image);
		stage.appendChild(imageFrame);

		geometry.sourceCells.forEach(function (sourceCell) {
			var cell = document.createElement("span");
			cell.className = "weapon-card-footprint-cell";
			positionPreviewCell(cell, sourceCell[0], sourceCell[1], geometry);
			stage.appendChild(cell);
		});
		geometry.synergyCells.forEach(function (affectedCell) {
			var cell = document.createElement("span");
			cell.className = "weapon-card-synergy-cell";
			positionPreviewCell(cell, affectedCell.col, affectedCell.row, geometry);
			var arrowDirections = affectedCell.arrowDirections && affectedCell.arrowDirections.length
				? affectedCell.arrowDirections : (affectedCell.directions || ["up"]);
			arrowDirections.forEach(function (direction) {
				var arrows = document.createElement("i");
				arrows.className = "backpack-synergy-arrows direction-" + direction;
				cell.appendChild(arrows);
			});
			stage.appendChild(cell);
		});

		var meta = document.createElement("div");
		meta.className = "weapon-card-preview-meta";
		var bounds = geometry.sourceBounds;
		meta.innerHTML = locked
			? "<b>占 ? 格</b><span>?×?</span><em>???</em>"
			: ("<b>占 " + geometry.sourceCells.length + " 格</b><span>" + bounds.cols + "×" + bounds.rows
				+ "</span><em>" + (geometry.synergyCells.length ? "悬停看联动" : "无格子联动") + "</em>");
		preview.appendChild(meta);
		return preview;
	};

	var isMobileListLayout = function () {
		if (typeof window === "undefined") return false;
		if (typeof window.matchMedia === "function") return window.matchMedia("(max-width: 700px)").matches;
		return Number(window.innerWidth) <= 700;
	};

	var closePreviewModal = function (restoreFocus) {
		if (!previewModalRoot) return false;
		var returnFocus = previewReturnFocus;
		if (uiCommon && typeof uiCommon.unregisterModal === "function") uiCommon.unregisterModal(previewModalRoot);
		previewModalRoot.remove();
		previewModalRoot = null;
		previewReturnFocus = null;
		if (restoreFocus !== false && returnFocus && returnFocus.isConnected
			&& typeof returnFocus.focus === "function") returnFocus.focus();
		return true;
	};

	/** 手机列表点击左侧缩略图时使用的统一占格与联动预览。 */
	var openPreviewModal = function (definition, options) {
		options = options || {};
		if (typeof document === "undefined" || (!options.force && !isMobileListLayout())) return false;
		closePreviewModal(false);
		var locked = options.lock === true || (definition && definition.lock === true);
		var overlay = document.createElement("div");
		overlay.className = "weapon-card-preview-modal-root";
		var panel = document.createElement("section");
		panel.className = "weapon-card-preview-modal-panel";
		panel.setAttribute("role", "dialog");
		panel.setAttribute("aria-modal", "true");
		panel.setAttribute("aria-label", locked ? "未解锁武器的占格预览"
			: String((definition && definition.name) || "武器") + "的占格与联动区域");
		var close = document.createElement("button");
		close.type = "button";
		close.className = "weapon-card-preview-modal-close";
		close.textContent = "×";
		close.setAttribute("aria-label", "关闭武器预览");
		var preview = buildWeaponPreview(definition || {}, { lock: locked });
		preview.classList.add("is-synergy-visible");
		if (!locked) {
			preview.setAttribute("aria-label", "武器占格与始终显示的联动区域");
			var hint = preview.querySelector(".weapon-card-preview-meta em");
			if (hint && preview.classList.contains("has-synergy")) hint.textContent = "联动区域";
		}
		panel.appendChild(preview);
		panel.appendChild(close);
		overlay.appendChild(panel);
		document.body.appendChild(overlay);
		previewModalRoot = overlay;
		previewReturnFocus = options.trigger || null;
		close.addEventListener("click", function (event) {
			event.stopPropagation();
			closePreviewModal();
		});
		overlay.addEventListener("click", function (event) {
			event.stopPropagation();
			if (event.target === overlay) closePreviewModal();
		});
		if (uiCommon && typeof uiCommon.registerModal === "function") {
			uiCommon.registerModal(overlay, closePreviewModal, { name: "weapon-card-preview" });
		}
		close.focus();
		return true;
	};

	var activateWithKeyboard = function (element, action) {
		if (!element || typeof element.addEventListener !== "function") return;
		element.addEventListener("keydown", function (event) {
			if (event.key !== "Enter" && event.key !== " ") return;
			if (!isMobileListLayout()) return;
			event.preventDefault();
			event.stopPropagation();
			action();
		});
	};

	var bindMobileListInteractions = function (card, definition, renderOptions, mobilePreview, summary, details) {
		if (!mobilePreview || !summary || !details || typeof mobilePreview.addEventListener !== "function") return;
		details.id = "weapon-card-mobile-details-" + (++mobileDetailsSequence);
		mobilePreview.tabIndex = 0;
		mobilePreview.setAttribute("role", "button");
		mobilePreview.setAttribute("aria-label", "打开武器图标、占格与联动区域");
		summary.tabIndex = 0;
		summary.setAttribute("role", "button");
		summary.setAttribute("aria-controls", details.id);
		summary.setAttribute("aria-expanded", "false");
		summary.setAttribute("aria-label", "展开武器属性与特殊效果");
		var toggleDetails = function () {
			if (!isMobileListLayout()) return;
			var expanded = card.classList.toggle("is-mobile-expanded");
			summary.setAttribute("aria-expanded", expanded ? "true" : "false");
			summary.setAttribute("aria-label", expanded
				? "收起武器属性与特殊效果" : "展开武器属性与特殊效果");
			if (typeof renderOptions.onMobileDetailsToggle === "function") {
				renderOptions.onMobileDetailsToggle(expanded, card);
			}
		};
		var openPreview = function () {
			openPreviewModal(definition, { lock: renderOptions.lock, trigger: mobilePreview });
		};
		mobilePreview.addEventListener("click", function (event) {
			if (!isMobileListLayout()) return;
			event.preventDefault();
			event.stopPropagation();
			openPreview();
		});
		summary.addEventListener("click", function (event) {
			if (!isMobileListLayout()) return;
			event.preventDefault();
			event.stopPropagation();
			toggleDetails();
		});
		activateWithKeyboard(mobilePreview, openPreview);
		activateWithKeyboard(summary, toggleDetails);
	};

	var buildActionButton = function (actionOptions) {
		if (!actionOptions) return null;
		var button = document.createElement("button");
		button.type = "button";
		button.className = "weapon-card-action" + (actionOptions.className ? " " + actionOptions.className : "");
		if (actionOptions.label != null) button.textContent = String(actionOptions.label);
		else if (actionOptions.price != null) {
			var price = Math.max(0, Number(actionOptions.price) || 0);
			button.textContent = price > 0 ? price + " 金币" : "免费";
		}
		else button.textContent = "";
		button.disabled = actionOptions.disabled === true;
		if (actionOptions.title) button.title = String(actionOptions.title);
		if (actionOptions.ariaLabel) button.setAttribute("aria-label", String(actionOptions.ariaLabel));
		if (actionOptions.price != null) button.dataset.price = String(actionOptions.price);
		button.addEventListener("click", function (event) {
			event.preventDefault();
			event.stopPropagation();
			if (!button.disabled && typeof actionOptions.onClick === "function") actionOptions.onClick(event, button);
		});
		return button;
	};

	/**
	 * 渲染完整武器卡片。
	 * options.lock: 未解锁脱敏模式；options.showCraftHammer: 是否显示可合成锤子；
	 * options.mobileListMode: 手机端使用图鉴式列表；options.actionButton: 摘要行右侧操作按钮。
	 */
	var createCard = function (definition, options) {
		definition = definition || {};
		options = options || {};
		// 同时接受 createCard(definition, { lock: true }) 和 definition.lock = true。
		var locked = options.lock === true || definition.lock === true;
		var renderOptions = Object.assign({}, options, { lock: locked });
		var mobileListMode = options.mobileListMode === true;
		var card = document.createElement(options.tagName || "article");
		card.className = "weapon-card" + (locked ? " is-locked" : "")
			+ (mobileListMode ? " weapon-card-mobile-list" : "")
			+ (options.className ? " " + options.className : "");
		card.tabIndex = options.tabIndex == null ? 0 : Number(options.tabIndex);
		card.dataset.rarity = locked ? "locked" : String(definition.rarity == null ? 1 : definition.rarity);
		card.dataset.locked = locked ? "true" : "false";
		if (locked) card.setAttribute("lock", "");
		if (definition.id != null) card.dataset.weaponId = String(definition.id);
		card.setAttribute("aria-label", locked ? "未解锁武器，资料未知" : String(definition.name || "未命名武器"));

		card.appendChild(buildWeaponPreview(definition, renderOptions));
		var mobilePreview = null;
		if (options.mobileCompactPreview === true || mobileListMode) {
			var mobilePreviewOptions = Object.assign({}, renderOptions, {
				includeSynergy: false,
				paddingCells: 0
			});
			var mobilePreview = buildWeaponPreview(definition, mobilePreviewOptions);
			mobilePreview.className += " weapon-card-mobile-preview";
			card.appendChild(mobilePreview);
		}
		var summary = document.createElement("div");
		summary.className = "weapon-card-summary";
		var name = document.createElement("div");
		name.className = "weapon-card-name";
		if (locked) name.textContent = "???";
		else if (uiCommon && typeof uiCommon.renderWeaponName === "function") {
			uiCommon.renderWeaponName(name, definition, { showHammer: false });
		} else name.textContent = definition.name || "未命名武器";
		summary.appendChild(name);

		var meta = document.createElement("div");
		meta.className = "weapon-card-meta";
		var types = document.createElement("div");
		types.className = "weapon-card-types";
		var weaponTypes = locked ? ["???"] : (Array.isArray(definition.weaponTypes) ? definition.weaponTypes : []);
		weaponTypes.forEach(function (type) {
			var tag = document.createElement("i");
			tag.textContent = type;
			types.appendChild(tag);
		});
		meta.appendChild(types);

		var rarity = document.createElement("div");
		rarity.className = "weapon-card-rarity";
		rarity.textContent = locked ? "???" : rarityText(definition.rarity);
		meta.appendChild(rarity);
		if (!locked && options.showCraftHammer !== false && uiCommon
			&& typeof uiCommon.appendCraftHammer === "function") uiCommon.appendCraftHammer(meta, definition);
		summary.appendChild(meta);
		var actionButton = buildActionButton(options.actionButton);
		if (actionButton) summary.appendChild(actionButton);
		var mobileToggle = document.createElement("span");
		mobileToggle.className = "weapon-card-mobile-toggle";
		mobileToggle.innerHTML = "<svg viewBox='0 0 16 16' focusable='false' aria-hidden='true'>"
			+ "<path d='M3.5 6l4.5 4 4.5-4' fill='none' stroke='currentColor' stroke-width='2'"
			+ " stroke-linecap='round' stroke-linejoin='round'/></svg>";
		mobileToggle.setAttribute("aria-hidden", "true");
		summary.appendChild(mobileToggle);
		card.appendChild(summary);
		var details = buildWeaponDetails(definition, renderOptions);
		card.appendChild(details);
		if (mobileListMode) bindMobileListInteractions(card, definition, renderOptions, mobilePreview, summary, details);
		return card;
	};

	var api = {
		__installed: true,
		createCard: createCard,
		buildWeaponPreview: buildWeaponPreview,
		buildWeaponDetails: buildWeaponDetails,
		getPreviewGeometry: getPreviewGeometry,
		openPreviewModal: openPreviewModal,
		closePreviewModal: closePreviewModal,
		isMobileListLayout: isMobileListLayout
	};
	if (uiCommon && typeof uiCommon.setWeaponCardRenderer === "function") {
		uiCommon.setWeaponCardRenderer(api);
	}
	plugin.weaponCardRenderer = api;
	return api;
};
