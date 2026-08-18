/**
 * 背包乱斗武器商店的独立安装器。
 *
 * 功能：
 * - 每次刷新出现 5 把武器（从 flags.randomList 随机池抽取，默认池为全部武器定义）。
 * - 尚未使用任何一次初始免费购买时，刷新免费；之后刷新初始 10 金币，每次付费刷新涨价 1 金币。
 * - 购买武器初始 60 金币，每次购买后所有武器涨价 60 金币。
 * - 卡片显示图片 / 名称 / 稀有度 / 武器类型 / 价格；悬停显示详细属性（伤害/命中/间隔/奥义/特殊效果）。
 * - 稀有度按 core.status.thisMap.ratio（1~5）加权：ratio 越高高稀有度概率越大；
 *   五级稀有度在 ratio=5 时概率为 15%（权重表见 RARITY_WEIGHTS）。
 *
 * 打开方式：core.plugin["背包乱斗商店"].openBackpackShop()（可在事件脚本中调用）。
 */
var installBackpackShop_d7c3f1a9_5b2e_4a86_9d3f_7c1e2b8a44f6 = function (core, plugin) {
	"use strict";
	return (function () {
		const weaponDefs = weaponDefinitions_9f2e6f5b_4b2c_4f8c_9a3d_7e1b6c0d5a44;

		// 稀有度权重表：行 = ratio（1~5），列 = 稀有度（1~5），每行总和 100。
		// 五级稀有度在 ratio=5 时为 15/100 = 15%；ratio 越低高稀有权重越小（ratio=1 时仅 0.8%）。
		const RARITY_WEIGHTS = [
			[70, 20, 8, 1.2, 0.8],
			[55, 22, 15, 5, 3],
			[40, 22, 22, 10, 6],
			[28, 20, 28, 15, 9],
			[18, 17, 30, 20, 15]
		];
		const SLOT_COUNT = 5;            // 每次刷新出现的武器数量。
		const REFRESH_COST_BASE = 10;    // 刷新初始价格。
		const REFRESH_COST_STEP = 1;     // 每次刷新涨价。
		const BUY_COST_BASE = 60;        // 武器初始价格。
		const BUY_COST_STEP = 60;        // 每次购买后涨价。
		const FLAG_REFRESH = "__backpack_shop_refresh__"; // 累计刷新次数 flag。
		const FLAG_BUY = "__backpack_shop_buy__";         // 累计购买次数 flag。
		const FLAG_POOL = "randomList";  // 武器随机池 flag（用户可手动调整，存武器 ID 数组）。
		const FLAG_OFFER = "__backpack_shop_offer__";     // 当前货架 flag（刷新/购买后更新；打开商店不自动刷新）。

		let root = null;                 // 商店根节点；null 表示未打开。
		let currentOffer = [];           // 当前货架：[{ id, price }] 共 5 把。
		let replayChoiceMode = null;      // 回放时最近打开的是普通商店还是免费赠予选择器。
		let replayRewardOffer = [];       // 回放时按相同随机序列生成的免费赠予候选。

		// ---- 数值辅助 ----
		const toInt = function (value) { return Math.max(0, Math.floor(Number(value) || 0)); };
		const getRatio = function () {
			const ratio = Number(core.status && core.status.thisMap && core.status.thisMap.ratio);
			if (!isFinite(ratio) || ratio < 1) return 1;
			return Math.min(5, Math.floor(ratio) || 1);
		};
		const getPool = function () {
			let pool = core.getFlag(FLAG_POOL);
			if (!Array.isArray(pool) || !pool.length) {
				pool = Object.keys(weaponDefs);
				core.setFlag(FLAG_POOL, pool.slice());
				return pool;
			}
			// 清理池中已不存在的武器 ID：仅当清理后仍有有效武器时写回；
			// 若全部无效（如手动填了不存在的 ID），保留用户原设置不覆盖，由界面提示引导修正。
			const valid = pool.filter(function (id) { return !!weaponDefs[id]; });
			if (valid.length && valid.length !== pool.length) core.setFlag(FLAG_POOL, valid);
			return valid;
		};
		const getRefreshCount = function () { return toInt(core.getFlag(FLAG_REFRESH)); };
		const getBuyCount = function () { return toInt(core.getFlag(FLAG_BUY)); };
		// 初始 3 次免费购买仍完全未动用时允许免费刷新；只要购买过一次，就进入正常刷新价格。
		const canRefreshForFree = function () { return getBuyCount() === 0; };
		const refreshCost = function () {
			if (canRefreshForFree()) return 0;
			return REFRESH_COST_BASE + getRefreshCount() * REFRESH_COST_STEP;
		};
		// 前 3 次购买免费且不涨价（buyCount 0/1/2 → 0）；第 4 次起恢复正常：60 + 超出次数×60。
		const buyCost = function () {
			const count = getBuyCount();
			if (count < 3) return 0;
			return BUY_COST_BASE + (count - 3) * BUY_COST_STEP;
		};
		const getMoney = function () { return toInt(core.status.hero.money); };
		const randShop = function (num) {
			if (typeof core.randShop === "function") return core.randShop(num);
			if (typeof core.rand === "function") return core.rand(num);
			return num && num > 0 ? Math.floor(Math.random() * num) : Math.random();
		};

		// ---- 抽卡逻辑 ----
		const rollRarity = function () {
			const weights = RARITY_WEIGHTS[getRatio() - 1];
			let total = 0;
			weights.forEach(function (w) { total += w; });
			// 使用商店独立的 core.randShop()：读档后随机序列恢复，且不会影响战斗随机数。
			let r = randShop() * total;
			for (let i = 0; i < weights.length; i++) {
				r -= weights[i];
				if (r <= 0) return i + 1;
			}
			return weights.length;
		};
		const rollWeaponOfRarity = function (rarity) {
			const pool = getPool();
			const candidates = pool.filter(function (id) {
				return Number(weaponDefs[id].rarity || 1) === rarity;
			});
			if (!candidates.length) {
				const all = pool.filter(function (id) { return !!weaponDefs[id]; });
				return all.length ? all[randShop(all.length)] : null;
			}
			return candidates[randShop(candidates.length)];
		};
		const rollOne = function () { return rollWeaponOfRarity(rollRarity()); };

		/** 刷新货架：抽 5 把（同一次刷新内尽量不重复），并持久化到 flag（打开商店不会自动刷新）。 */
		const refreshOffer = function () {
			const ids = [];
			const seen = {};
			for (let i = 0; i < SLOT_COUNT; i++) {
				let id = rollOne();
				let guard = 0;
				while (id && seen[id] && guard++ < 25) id = rollOne();
				if (id && !seen[id]) {
					seen[id] = true;
					ids.push(id);
				}
			}
			const pool = getPool();
			while (ids.length < SLOT_COUNT && pool.length) {
				const id = pool[randShop(pool.length)];
				ids.push(id);
			}
			currentOffer = ids.map(function (id) { return { id: id }; });
			saveOffer();
		};
		/** 从 flag 加载上次货架；无存档返回 false（此时才需要首次生成）。 */
		const loadOffer = function () {
			const saved = core.getFlag(FLAG_OFFER);
			if (saved && Array.isArray(saved.ids) && saved.ids.length) {
				const loaded = saved.ids.filter(function (id) { return !!weaponDefs[id]; })
					.map(function (id) { return { id: id }; });
				if (loaded.length) {
					currentOffer = loaded;
					return true;
				}
			}
			return false;
		};
		const saveOffer = function () {
			core.setFlag(FLAG_OFFER, { ids: currentOffer.map(function (item) { return item.id; }) });
		};
		/** 生成免费赠予的 5 个候选；录制和回放共用，确保随机调用次数及顺序一致。 */
		const createRewardOffer = function () {
			const offer = [];
			const seen = {};
			for (let i = 0; i < SLOT_COUNT; i++) {
				let id = rollOne();
				let guard = 0;
				while (id && seen[id] && guard++ < 25) id = rollOne();
				if (id && !seen[id]) { seen[id] = true; offer.push({ id: id }); }
			}
			const pool = getPool();
			let fillGuard = 0;
			while (offer.length < SLOT_COUNT && pool.length && fillGuard++ < 100) {
				const id = pool[randShop(pool.length)];
				if (!seen[id]) { seen[id] = true; offer.push({ id: id }); }
			}
			// 随机池不足 5 种时允许重复，避免为了“尽量不重复”陷入死循环。
			while (offer.length < SLOT_COUNT && pool.length) {
				const id = pool[randShop(pool.length)];
				offer.push({ id: id });
			}
			return offer;
		};

		// ---- 交互 ----
		/** 正常游戏中记录一条商店选择；沿用样板的 choices:n 格式。 */
		const pushShopChoice = function (choiceIndex) {
			if (core.isReplaying && core.isReplaying()) return false;
			if (core.isPlaying && !core.isPlaying()) return false;
			if (!core.status || !Array.isArray(core.status.route)) return false;
			core.status.route.push("choices:" + choiceIndex);
			return true;
		};
		/** 操作失败时只撤销本次刚写入的 choices，不影响此前录像。 */
		const rollbackShopChoice = function (choiceIndex, recorded) {
			if (!recorded || !core.status || !Array.isArray(core.status.route)) return;
			const action = "choices:" + choiceIndex;
			if (core.status.route[core.status.route.length - 1] === action) core.status.route.pop();
		};
		const deductMoney = function (cost) {
			if (getMoney() < cost) {
				if (core.drawTip) core.drawTip("金币不足");
				return false;
			}
			core.status.hero.money = toInt(core.status.hero.money) - cost;
			if (core.updateStatusBar) core.updateStatusBar();
			return true;
		};
		const doRefresh = function (options) {
			options = options || {};
			const cost = refreshCost();
			if (!deductMoney(cost)) return false;
			if (options.recordChoice !== false) pushShopChoice(0);
			// 免费刷新不累计涨价次数，避免第一次购买后刷新价格被之前的免费刷新次数抬高。
			if (cost > 0) core.setFlag(FLAG_REFRESH, getRefreshCount() + 1);
			refreshOffer();
			render();
			if (!options.silent && core.playSound) core.playSound("item.mp3");
			return true;
		};
		/** 获得一把武器进背包（不扣钱、不涨价；用于购买与免费赠予共用）。返回是否成功。 */
		const grantWeapon = function (def) {
			// 优先走背包系统插件 API；插件缺失/未挂载时兜底直接写入背包状态 flag
			// （__backpack_state__，未放置武器进 inventory，刷新界面后即可在库存看到）。
			const backpack = core.plugin;
			if (backpack && typeof backpack.addBackpackWeapon === "function") {
				return backpack.addBackpackWeapon(def, { autoPlace: true }) != null;
			}
			const state = core.getFlag("__backpack_state__") || { version: 5, placed: [], inventory: [], unlockedCells: [] };
			const nextInstanceId = Math.floor(Number(core.getFlag("__backpack_instance_id__", 0)) || 0) + 1;
			core.setFlag("__backpack_instance_id__", nextInstanceId);
			state.inventory.push({
				instanceId: String(nextInstanceId),
				weapon: JSON.parse(JSON.stringify(def)),
				rotation: 0
			});
			core.setFlag("__backpack_state__", state);
			if (backpack && typeof backpack.updateBackpack === "function") backpack.updateBackpack();
			return true;
		};
		const buyWeapon = function (item, choiceIndex, options) {
			options = options || {};
			const def = weaponDefs[item.id];
			if (!def) return false;
			const cost = buyCost(); // 武器价格实时计算（60 + 购买次数×60）
			if (!deductMoney(cost)) return false;
			const recorded = options.recordChoice !== false && choiceIndex != null
				? pushShopChoice(choiceIndex)
				: false;
			if (!grantWeapon(def)) {
				rollbackShopChoice(choiceIndex, recorded);
				if (core.drawTip) core.drawTip("背包系统未安装，无法获得武器");
				core.status.hero.money = toInt(core.status.hero.money) + cost;
				if (core.updateStatusBar) core.updateStatusBar();
				return false;
			}
			core.setFlag(FLAG_BUY, getBuyCount() + 1);
			refreshOffer(); // 购买后刷新货架（武器价格随之上涨）
			render();
			if (!options.silent && core.playSound) core.playSound("item.mp3");
			return true;
		};
		/** choices:0 刷新；choices:1～5 购买对应栏位。正常点击和录像回放共用此入口。 */
		const applyShopChoice = function (choiceIndex, options) {
			choiceIndex = Math.floor(Number(choiceIndex));
			if (choiceIndex === 0) return doRefresh(options);
			if (choiceIndex < 1 || choiceIndex > SLOT_COUNT) return false;
			const item = currentOffer[choiceIndex - 1];
			return !!item && buyWeapon(item, choiceIndex, options);
		};
		/** 免费赠予使用 choices:1～5；选择动作必须先于 grantWeapon 记录，确保回放先创建实例。 */
		const applyRewardChoice = function (offer, choiceIndex, options) {
			options = options || {};
			choiceIndex = Math.floor(Number(choiceIndex));
			if (choiceIndex < 1 || choiceIndex > SLOT_COUNT) return false;
			const item = offer[choiceIndex - 1];
			const def = item && weaponDefs[item.id];
			if (!def) return false;
			const recorded = options.recordChoice !== false ? pushShopChoice(choiceIndex) : false;
			if (!grantWeapon(def)) {
				rollbackShopChoice(choiceIndex, recorded);
				if (!options.silent && core.drawTip) core.drawTip("背包系统未安装，无法获得武器");
				return false;
			}
			if (!options.silent && core.playSound) core.playSound("item.mp3");
			if (!options.silent && core.drawTip) core.drawTip("获得武器：" + (def.name || item.id));
			return true;
		};

		// ---- UI ----
		const rarityText = function (rarity) {
			const rarityNum = Number(rarity);
			const safe = isFinite(rarityNum) ? Math.max(0, Math.min(5, rarityNum)) : 0;
			return new Array(safe + 1).join("★");
		};
		// 武器图片与占格外缘之间保留 0.12 个格子的距离；横纵方向使用相同格子单位。
		const PREVIEW_IMAGE_INSET = 0.12;
		let particleHostSequence = 0;
		let activeParticleScenes = [];
		const SHOP_PARTICLE_PROFILES = {
			2: { count: 18, colors: ["#7fd88f", "#d2ffd8"], size: 2.4, speed: 0.95, opacity: 0.76 },
			3: { count: 34, colors: ["#5cb7f5", "#cfefff"], size: 3.1, speed: 1.25, opacity: 0.86 },
			4: { count: 56, colors: ["#b87ef5", "#efd5ff", "#d9a8ff"], size: 4, speed: 1.55, opacity: 0.94 },
			5: { count: 84, colors: ["#ffc138", "#fff7b7", "#ffd96a"], size: 5, speed: 1.9, opacity: 1 }
		};
		const formatDetailNumber = function (value, digits) {
			if (value == null || !isFinite(Number(value))) return "—";
			const factor = Math.pow(10, digits == null ? 2 : digits);
			return String(Math.round(Number(value) * factor) / factor);
		};
		const damageText = function (def) {
			if (def.minAttack == null && def.maxAttack == null && def.attack == null) return "—";
			const minimum = def.minAttack == null ? (def.maxAttack == null ? def.attack : def.maxAttack) : def.minAttack;
			const maximum = def.maxAttack == null ? (def.minAttack == null ? def.attack : def.minAttack) : def.maxAttack;
			return formatDetailNumber(minimum) + "～" + formatDetailNumber(maximum);
		};
		const ultimateText = function (value) {
			if (value == null || !isFinite(Number(value))) return "—";
			const number = Number(value);
			return (number > 0 ? "+" : "") + formatDetailNumber(number);
		};
		/** 把原 Tooltip 中的核心属性和特殊效果直接展示在商店卡片内。 */
		const buildWeaponDetails = function (def) {
			const details = document.createElement("section");
			details.className = "backpack-shop-details";
			const stats = document.createElement("dl");
			stats.className = "backpack-shop-detail-stats";
			[
				["伤害", damageText(def)],
				["命中", def.hitRate == null ? "—" : formatDetailNumber(Number(def.hitRate) * 100, 1) + "%"],
				["攻击间隔", def.attackInterval == null ? "—" : formatDetailNumber(def.attackInterval) + " 秒"],
				["奥义获取", ultimateText(def.ultimateGain)]
			].forEach(function (stat) {
				const item = document.createElement("div");
				const label = document.createElement("dt");
				label.textContent = stat[0];
				const value = document.createElement("dd");
				value.textContent = stat[1];
				item.appendChild(label);
				item.appendChild(value);
				stats.appendChild(item);
			});
			details.appendChild(stats);
			const effect = document.createElement("div");
			effect.className = "backpack-shop-detail-effect";
			const effectTitle = document.createElement("b");
			effectTitle.textContent = "特殊效果";
			const effectText = document.createElement("p");
			// 与背包 Tooltip 共用渲染器，保证箭头、转义与换行语义一致。
			effectText.innerHTML = backpackUiCommon_2c986f67_7621_44eb_972d_24f1e2c6ce61
				.formatSpecialEffectHtml(def.synergyText);
			effect.appendChild(effectTitle);
			effect.appendChild(effectText);
			details.appendChild(effect);
			return details;
		};
		/** 把武器定义统一成武器系统使用的 cells 格式；仅在插件缺失时做最小兜底。 */
		const normalizePreviewWeapon = function (def) {
			const weaponSystem = plugin.weaponSystem;
			if (weaponSystem && typeof weaponSystem.normalizeWeapon === "function") {
				return weaponSystem.normalizeWeapon(def);
			}
			const cells = [];
			const shape = Array.isArray(def.cells) ? null : (def.shape || def.size);
			if (Array.isArray(def.cells)) {
				def.cells.forEach(function (cell) {
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
			return Object.assign({}, def, { cells: cells.length ? cells : [[0, 0]] });
		};
		/**
		 * 计算商店预览棋盘。武器与联动格共用真实背包坐标，棋盘只在外围补一圈空格，
		 * 因此既能直观看出占格，也不会因武器联动距离不同而裁掉范围。
		 */
		const getPreviewGeometry = function (def) {
			const weapon = normalizePreviewWeapon(def);
			const weaponSystem = plugin.weaponSystem;
			const sourceCells = weaponSystem && typeof weaponSystem.getRotatedCells === "function"
				? weaponSystem.getRotatedCells(weapon, 0)
				: weapon.cells.slice();
			const entry = { weapon: weapon, col: 0, row: 0, rotation: 0 };
			const synergyCells = weaponSystem && typeof weaponSystem.getSynergyCells === "function"
				? weaponSystem.getSynergyCells(entry)
				: backpackWeaponSynergy_91f4c21e_7d37_4f12_9cc4_a9606ba62a83.getAffectedCells(weapon, sourceCells, 0);
			const allCells = sourceCells.map(function (cell) { return { col: cell[0], row: cell[1] }; })
				.concat(synergyCells);
			let minCol = Math.min.apply(null, allCells.map(function (cell) { return cell.col; })) - 1;
			let maxCol = Math.max.apply(null, allCells.map(function (cell) { return cell.col; })) + 1;
			let minRow = Math.min.apply(null, allCells.map(function (cell) { return cell.row; })) - 1;
			let maxRow = Math.max.apply(null, allCells.map(function (cell) { return cell.row; })) + 1;
			const sourceMinCol = Math.min.apply(null, sourceCells.map(function (cell) { return cell[0]; }));
			const sourceMaxCol = Math.max.apply(null, sourceCells.map(function (cell) { return cell[0]; }));
			const sourceMinRow = Math.min.apply(null, sourceCells.map(function (cell) { return cell[1]; }));
			const sourceMaxRow = Math.max.apply(null, sourceCells.map(function (cell) { return cell[1]; }));
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
		const positionPreviewCell = function (element, col, row, geometry) {
			element.style.left = ((col - geometry.minCol) / geometry.cols * 100) + "%";
			element.style.top = ((row - geometry.minRow) / geometry.rows * 100) + "%";
			element.style.width = (100 / geometry.cols) + "%";
			element.style.height = (100 / geometry.rows) + "%";
		};
		/**
		 * 把武器图片等比放进带格内边距的框中。imageCrop 的完整图片宽高和裁剪区域
		 * 使用同一个 uniformScale 换算，禁止分别拉伸横纵轴。
		 */
		const layoutPreviewImage = function (imageFrame, image, geometry) {
			const bounds = geometry.sourceBounds;
			const inset = Math.min(PREVIEW_IMAGE_INSET, (bounds.cols - 0.1) / 2, (bounds.rows - 0.1) / 2);
			const frameCol = bounds.col + inset;
			const frameRow = bounds.row + inset;
			const frameCols = bounds.cols - inset * 2;
			const frameRows = bounds.rows - inset * 2;
			imageFrame.dataset.insetCells = String(inset);
			imageFrame.style.left = ((frameCol - geometry.minCol) / geometry.cols * 100) + "%";
			imageFrame.style.top = ((frameRow - geometry.minRow) / geometry.rows * 100) + "%";
			imageFrame.style.width = (frameCols / geometry.cols * 100) + "%";
			imageFrame.style.height = (frameRows / geometry.rows * 100) + "%";

			const crop = geometry.weapon.imageCrop;
			if (!Array.isArray(crop) || crop.length < 6
				|| !(crop[2] > 0) || !(crop[3] > 0) || !(crop[4] > 0) || !(crop[5] > 0)) return;
			const cropX = Number(crop[0]) || 0;
			const cropY = Number(crop[1]) || 0;
			const cropWidth = Number(crop[2]);
			const cropHeight = Number(crop[3]);
			const naturalWidth = Number(crop[4]);
			const naturalHeight = Number(crop[5]);
			const uniformScale = Math.min(frameCols / cropWidth, frameRows / cropHeight);
			const displayedCropWidth = cropWidth * uniformScale;
			const displayedCropHeight = cropHeight * uniformScale;
			image.style.width = (naturalWidth * uniformScale / frameCols * 100) + "%";
			image.style.height = (naturalHeight * uniformScale / frameRows * 100) + "%";
			image.style.left = ((frameCols - displayedCropWidth) / 2 / frameCols * 100
				- cropX * uniformScale / frameCols * 100) + "%";
			image.style.top = ((frameRows - displayedCropHeight) / 2 / frameRows * 100
				- cropY * uniformScale / frameRows * 100) + "%";
		};
		/** 绘制与背包同语义的网格、武器真实占格和悬停联动层。 */
		const buildWeaponPreview = function (def) {
			const geometry = getPreviewGeometry(def);
			const preview = document.createElement("div");
			preview.className = "backpack-shop-preview" + (geometry.synergyCells.length ? " has-synergy" : "");
			preview.dataset.occupiedCells = String(geometry.sourceCells.length);
			preview.setAttribute("aria-label", "占 " + geometry.sourceCells.length + " 格"
				+ (geometry.synergyCells.length ? "，悬停显示联动区域" : "，无格子联动"));
			const stage = document.createElement("div");
			stage.className = "backpack-shop-preview-stage";
			stage.style.aspectRatio = geometry.cols + " / " + geometry.rows;
			if (geometry.cols >= geometry.rows) stage.style.width = "100%";
			else stage.style.height = "100%";
			preview.appendChild(stage);

			for (let row = 0; row < geometry.rows; row++) {
				for (let col = 0; col < geometry.cols; col++) {
					const gridCell = document.createElement("span");
					gridCell.className = "backpack-shop-preview-grid-cell";
					positionPreviewCell(gridCell, geometry.minCol + col, geometry.minRow + row, geometry);
					stage.appendChild(gridCell);
				}
			}

			const imageFrame = document.createElement("div");
			imageFrame.className = "backpack-shop-preview-image-frame";
			const image = document.createElement("img");
			image.src = geometry.weapon.image || "";
			image.alt = geometry.weapon.name || "";
			image.draggable = false;
			layoutPreviewImage(imageFrame, image, geometry);
			imageFrame.appendChild(image);
			stage.appendChild(imageFrame);

			geometry.sourceCells.forEach(function (sourceCell) {
				const cell = document.createElement("span");
				cell.className = "backpack-shop-footprint-cell";
				positionPreviewCell(cell, sourceCell[0], sourceCell[1], geometry);
				stage.appendChild(cell);
			});
			geometry.synergyCells.forEach(function (affectedCell) {
				const cell = document.createElement("span");
				cell.className = "backpack-shop-synergy-cell";
				positionPreviewCell(cell, affectedCell.col, affectedCell.row, geometry);
				const arrowDirections = affectedCell.arrowDirections && affectedCell.arrowDirections.length
					? affectedCell.arrowDirections
					: (affectedCell.directions || ["up"]);
				arrowDirections.forEach(function (direction) {
					const arrows = document.createElement("i");
					arrows.className = "backpack-synergy-arrows direction-" + direction;
					cell.appendChild(arrows);
				});
				stage.appendChild(cell);
			});

			const meta = document.createElement("div");
			meta.className = "backpack-shop-preview-meta";
			const bounds = geometry.sourceBounds;
			meta.innerHTML = "<b>占 " + geometry.sourceCells.length + " 格</b><span>"
				+ bounds.cols + "×" + bounds.rows + "</span><em>"
				+ (geometry.synergyCells.length ? "悬停看联动" : "无格子联动") + "</em>";
			preview.appendChild(meta);
			return preview;
		};

		/** particles.js 只负责稳定的逐帧绘制；这里把粒子的出生点和速度约束为卡牌边缘向外。 */
		const makeShopParticleConfig = function (profile, rarity) {
			return {
				particles: {
					number: { value: profile.count, density: { enable: false, value_area: 800 } },
					color: { value: profile.colors },
					shape: {
						type: rarity >= 5 ? ["circle", "star"] : "circle",
						stroke: { width: 0, color: "#ffffff" },
						polygon: { nb_sides: 5 }
					},
					opacity: {
						value: profile.opacity,
						random: true,
						anim: { enable: false, speed: 1, opacity_min: 0.05, sync: false }
					},
					size: {
						value: profile.size,
						random: true,
						anim: { enable: false, speed: 1, size_min: 0.4, sync: false }
					},
					line_linked: { enable: false, distance: 0, color: "#ffffff", opacity: 0, width: 0 },
					move: {
						enable: true,
						speed: profile.speed,
						direction: "none",
						random: false,
						straight: true,
						out_mode: "out",
						bounce: false,
						attract: { enable: false, rotateX: 3000, rotateY: 3000 }
					}
				},
				interactivity: {
					detect_on: "canvas",
					events: {
						onhover: { enable: false, mode: "repulse" },
						onclick: { enable: false, mode: "push" },
						resize: false
					}
				},
				retina_detect: true
			};
		};

		const refreshShopParticleBounds = function (scene) {
			const hostRect = scene.host.getBoundingClientRect();
			const cardRect = scene.card.getBoundingClientRect();
			const ratio = scene.state.canvas.pxratio || 1;
			scene.bounds = {
				left: (cardRect.left - hostRect.left) * ratio,
				top: (cardRect.top - hostRect.top) * ratio,
				right: (cardRect.right - hostRect.left) * ratio,
				bottom: (cardRect.bottom - hostRect.top) * ratio
			};
		};

		const getParticleOutwardDistance = function (particle, bounds) {
			switch (particle.__shopEdgeSide) {
				case "left": return bounds.left - particle.x;
				case "right": return particle.x - bounds.right;
				case "top": return bounds.top - particle.y;
				default: return particle.y - bounds.bottom;
			}
		};

		const getParticleTravelLimit = function (scene, particle) {
			const state = scene.state;
			const bounds = scene.bounds;
			switch (particle.__shopEdgeSide) {
				case "left": return bounds.left + particle.radius;
				case "right": return state.canvas.w - bounds.right + particle.radius;
				case "top": return bounds.top + particle.radius;
				default: return state.canvas.h - bounds.bottom + particle.radius;
			}
		};

		const resetShopParticle = function (scene, particle, distributeAlongPath) {
			const bounds = scene.bounds;
			if (!bounds) return;
			const width = Math.max(1, bounds.right - bounds.left);
			const height = Math.max(1, bounds.bottom - bounds.top);
			// 商店通常横排五张窄卡牌，左右夹缝很小；上下边各占 36%，确保外放粒子不会大多被邻卡遮住。
			const sidePick = Math.random();
			let side;
			let x;
			let y;
			let angle;
			const jitter = (Math.random() - 0.5) * 0.56;
			const insetX = Math.min(width * 0.12, 12 * (scene.state.canvas.pxratio || 1));
			const insetY = Math.min(height * 0.05, 12 * (scene.state.canvas.pxratio || 1));
			if (sidePick < 0.36) {
				side = "top";
				x = bounds.left + insetX + Math.random() * Math.max(1, width - insetX * 2);
				y = bounds.top;
				angle = -Math.PI / 2 + jitter;
			} else if (sidePick < 0.5) {
				side = "right";
				x = bounds.right;
				y = bounds.top + insetY + Math.random() * Math.max(1, height - insetY * 2);
				angle = jitter;
			} else if (sidePick < 0.86) {
				side = "bottom";
				x = bounds.left + insetX + Math.random() * Math.max(1, width - insetX * 2);
				y = bounds.bottom;
				angle = Math.PI / 2 + jitter;
			} else {
				side = "left";
				x = bounds.left;
				y = bounds.top + insetY + Math.random() * Math.max(1, height - insetY * 2);
				angle = Math.PI + jitter;
			}
			particle.__shopEdgeSide = side;
			particle.__shopBaseOpacity = scene.profile.opacity * (0.58 + Math.random() * 0.42);
			const velocity = 0.72 + Math.random() * 0.62;
			particle.vx = Math.cos(angle) * velocity;
			particle.vy = Math.sin(angle) * velocity;
			particle.x = x;
			particle.y = y;
			if (distributeAlongPath) {
				const limit = Math.max(1, getParticleTravelLimit(scene, particle));
				const initialDistance = Math.random() * limit * 0.9;
				particle.x += Math.cos(angle) * initialDistance;
				particle.y += Math.sin(angle) * initialDistance;
			}
		};

		const updateShopParticle = function (scene, particle) {
			if (!particle.__shopEdgeSide) resetShopParticle(scene, particle, true);
			let distance = getParticleOutwardDistance(particle, scene.bounds);
			let limit = Math.max(1, getParticleTravelLimit(scene, particle));
			if (!isFinite(distance) || distance < -particle.radius || distance >= limit) {
				resetShopParticle(scene, particle, false);
				distance = 0;
				limit = Math.max(1, getParticleTravelLimit(scene, particle));
			}
			const progress = Math.max(0, Math.min(1, distance / limit));
			// 正弦包络让粒子在边框处柔和出现、外缘处自然消失，重置时不会出现跳帧。
			particle.opacity = particle.__shopBaseOpacity * Math.sin(Math.PI * (0.16 + progress * 0.84));
		};

		const destroyShopParticleScenes = function () {
			activeParticleScenes.forEach(function (scene) {
				if (scene.resizeObserver) scene.resizeObserver.disconnect();
				if (scene.resizeFrame) cancelAnimationFrame(scene.resizeFrame);
				if (scene.state && scene.state.fn) {
					cancelAnimationFrame(scene.state.fn.drawAnimFrame);
					cancelAnimationFrame(scene.state.fn.checkAnimFrame);
					if (scene.state.fn.canvasClear) scene.state.fn.canvasClear();
				}
				if (Array.isArray(window.pJSDom)) {
					const index = window.pJSDom.indexOf(scene.instance);
					if (index >= 0) window.pJSDom.splice(index, 1);
				}
			});
			activeParticleScenes = [];
		};

		const mountShopParticleScene = function (shell) {
			const rarity = Number(shell.dataset.rarity) || 1;
			const profile = SHOP_PARTICLE_PROFILES[rarity];
			const host = shell.querySelector(".backpack-shop-particle-layer");
			if (!profile || !host || typeof window.particlesJS !== "function") return;
			if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
			window.particlesJS(host.id, makeShopParticleConfig(profile, rarity));
			const instance = Array.isArray(window.pJSDom) ? window.pJSDom[window.pJSDom.length - 1] : null;
			if (!instance || !instance.pJS) return;
			const scene = { shell: shell, host: host, card: shell.querySelector(".backpack-shop-card"), profile: profile, instance: instance, state: instance.pJS };
			refreshShopParticleBounds(scene);
			const originalUpdate = scene.state.fn.particlesUpdate;
			scene.state.fn.particlesUpdate = function () {
				originalUpdate();
				scene.state.particles.array.forEach(function (particle) {
					updateShopParticle(scene, particle);
				});
			};
			scene.state.particles.array.forEach(function (particle) {
				resetShopParticle(scene, particle, true);
			});
			if (typeof ResizeObserver === "function") {
				scene.resizeObserver = new ResizeObserver(function () {
					if (scene.resizeFrame) cancelAnimationFrame(scene.resizeFrame);
					scene.resizeFrame = requestAnimationFrame(function () {
						if (!scene.host.isConnected) return;
						const ratio = scene.state.canvas.pxratio || 1;
						scene.state.canvas.w = scene.state.canvas.el.offsetWidth * ratio;
						scene.state.canvas.h = scene.state.canvas.el.offsetHeight * ratio;
						scene.state.canvas.el.width = scene.state.canvas.w;
						scene.state.canvas.el.height = scene.state.canvas.h;
						refreshShopParticleBounds(scene);
						scene.state.particles.array.forEach(function (particle) {
							resetShopParticle(scene, particle, true);
						});
					});
				});
				scene.resizeObserver.observe(host);
			}
			activeParticleScenes.push(scene);
		};

		const mountShopParticleScenes = function (container) {
			Array.prototype.forEach.call(container.querySelectorAll(".backpack-shop-card-shell"), mountShopParticleScene);
		};

		const buildCard = function (item, onPick, choiceIndex) {
			const def = weaponDefs[item.id];
			const rarityValue = String(def.rarity == null ? 1 : def.rarity);
			const shell = document.createElement("div");
			shell.className = "backpack-shop-card-shell";
			shell.dataset.rarity = rarityValue;
			const particleLayer = document.createElement("div");
			particleLayer.className = "backpack-shop-particle-layer";
			particleLayer.id = "backpack-shop-particles-" + (++particleHostSequence);
			particleLayer.dataset.rarity = rarityValue;
			shell.appendChild(particleLayer);
			const card = document.createElement("div");
			card.className = "backpack-shop-card";
			card.tabIndex = 0;
			card.dataset.rarity = rarityValue;
			// 内联强制纵向 flex + 水平居中（防止样式表缓存导致图片靠左上角）。
			card.style.display = "flex";
			card.style.flexDirection = "column";
			card.style.alignItems = "center";
			card.style.textAlign = "center";
			card.appendChild(buildWeaponPreview(def));
			const name = document.createElement("div");
			name.className = "backpack-shop-name";
			backpackUiCommon_2c986f67_7621_44eb_972d_24f1e2c6ce61.renderWeaponName(name, def, { showHammer: false });
			card.appendChild(name);
			const rarity = document.createElement("div");
			rarity.className = "backpack-shop-rarity";
			rarity.textContent = rarityText(def.rarity);
			backpackUiCommon_2c986f67_7621_44eb_972d_24f1e2c6ce61.appendCraftHammer(rarity, def);
			card.appendChild(rarity);
			const types = document.createElement("div");
			types.className = "backpack-shop-types";
			(Array.isArray(def.weaponTypes) ? def.weaponTypes : []).forEach(function (type) {
				const tag = document.createElement("i");
				tag.textContent = type;
				types.appendChild(tag);
			});
			card.appendChild(types);
			card.appendChild(buildWeaponDetails(def));
			const buy = document.createElement("button");
			buy.type = "button";
			buy.className = "backpack-shop-buy";
			buy.textContent = onPick ? "获得" : (buyCost() > 0 ? "购买 " + buyCost() : "购买（免费）");
			buy.style.marginTop = "auto"; // flex 列布局：把购买按钮推到卡片底部
			buy.addEventListener("click", function (event) {
				event.stopPropagation();
				if (onPick) onPick(item, choiceIndex);
				else applyShopChoice(choiceIndex);
			});
			card.appendChild(buy);
			shell.appendChild(card);
			return shell;
		};
		const render = function () {
			if (!root) return;
			root.querySelector(".backpack-shop-money").textContent = "金币：" + getMoney();
			root.querySelector(".backpack-shop-refresh").textContent =
				"刷新（" + refreshCost() + " 金币）";
			const grid = root.querySelector(".backpack-shop-grid");
			destroyShopParticleScenes();
			grid.innerHTML = "";
			currentOffer.forEach(function (item, index) {
				grid.appendChild(buildCard(item, null, index + 1));
			});
			mountShopParticleScenes(grid);
		};
		/** 打开界面期间的持续锁定定时器（防止事件流程在打开后被误解锁导致仍可操作）。 */
		let shopLockTimer = null;
		/** 录像回放中不创建商店 DOM；选择由 choices:n 回放动作执行。 */
		const isReplayingNow = function () {
			return !!(core && ((typeof core.isReplaying === "function" && core.isReplaying())
				|| (core.status && core.status.replay && core.status.replay.route)));
		};
		/** 打开界面时锁定控制：直接置位 + 定时器持续强制锁定（防止事件结束/流程中的解锁把锁清掉）。 */
		const lockShopControls = function () {
			if (core.status) core.status.lockControl = true;
			if (core.lockControl) core.lockControl();
			if (shopLockTimer) clearInterval(shopLockTimer);
			shopLockTimer = setInterval(function () {
				if (core && core.status && root) core.status.lockControl = true;
				else if (shopLockTimer) { clearInterval(shopLockTimer); shopLockTimer = null; }
			}, 100);
		};
		const closeShop = function () {
			if (shopLockTimer) { clearInterval(shopLockTimer); shopLockTimer = null; }
			destroyShopParticleScenes();
			if (root && root.parentNode) root.parentNode.removeChild(root);
			root = null;
			if (core.clearMap && core.clearMap("data")) core.clearMap("data");
			// 关闭后无条件恢复操作：商店/选择器是玩家主动打开的，不因"打开前恰好处于锁定"而残留锁定。
			if (core.status) core.status.lockControl = false;
			if (core.unlockControl) core.unlockControl();
		};
		const openShop = function () {
			if (root) { render(); return; }
			// 回放时不创建 DOM，但必须按录制时相同的方式加载/首次生成货架，随后由 choices:n 执行操作。
			if (isReplayingNow()) {
				replayChoiceMode = "shop";
				replayRewardOffer = [];
				if (getPool().length && !loadOffer()) refreshOffer();
				return;
			}
			// 打开界面期间锁定控制，避免方向键/点击等意外操作；关闭时按原状态恢复。
			lockShopControls();
			if (getPool().length === 0) {
				if (core.drawTip) core.drawTip("随机池为空：flags.randomList 里的武器 ID 均不存在，请检查（打开 project/weapons.js 查看有效 ID）");
				closeShop(); // 清理锁定状态
				return;
			}
			// 打开商店不自动刷新：已有存档货架则直接展示，仅首次生成。
			if (!loadOffer()) {
				refreshOffer();
			}
			root = document.createElement("div");
			root.className = "backpack-shop-root";
			const panel = document.createElement("div");
			panel.className = "backpack-shop-panel";
			const header = document.createElement("div");
			header.className = "backpack-shop-header";
			const title = document.createElement("div");
			title.className = "backpack-shop-title";
			title.textContent = "武器商店";
			const money = document.createElement("div");
			money.className = "backpack-shop-money";
			money.textContent = "金币：" + getMoney();
			const close = document.createElement("button");
			close.type = "button";
			close.className = "backpack-shop-close";
			close.textContent = "×";
			close.addEventListener("click", closeShop);
			header.appendChild(title);
			header.appendChild(money);
			header.appendChild(close);
			panel.appendChild(header);
			const grid = document.createElement("div");
			grid.className = "backpack-shop-grid";
			panel.appendChild(grid);
			const footer = document.createElement("div");
			footer.className = "backpack-shop-footer";
			const refresh = document.createElement("button");
			refresh.type = "button";
			refresh.className = "backpack-shop-refresh";
			refresh.textContent = "刷新（" + refreshCost() + " 金币）";
			refresh.addEventListener("click", function () { applyShopChoice(0); });
			const ratioHint = document.createElement("div");
			ratioHint.className = "backpack-shop-ratio";
			// 显示"1级商店 概率为：★ xx% ★★ xx% ..."（按当前 ratio 权重表实时计算）。
			const updateRatioHint = function () {
				const weights = RARITY_WEIGHTS[getRatio() - 1];
				let total = 0;
				weights.forEach(function (w) { total += w; });
				const parts = weights.map(function (w, index) {
					const pct = Math.round(w / total * 1000) / 10;
					const stars = new Array(index + 2).join("★");
					return stars + " " + pct + "%";
				});
				ratioHint.textContent = getRatio() + "级商店 概率为：" + parts.join("，");
			};
			updateRatioHint();
			footer.appendChild(refresh);
			footer.appendChild(ratioHint);
			panel.appendChild(footer);
			root.appendChild(panel);
			root.addEventListener("pointerdown", function (event) {
				if (event.target === root) closeShop();
			});
			document.body.appendChild(root);
			if (core.insertAction) core.insertAction([]);
			render();
		};

		/**
		 * 免费赠予武器选择器：界面类似商店，但没有刷新按钮；
		 * 随机给出 5 把武器，点击"获得"后免费得到该武器（不扣钱、不涨商店购买次数），随后自动关闭。
		 * 每次调用重新随机一批，不影响商店货架。
		 */
		const openRewardPicker = function () {
			if (getPool().length === 0) {
				if (core.drawTip) core.drawTip("随机池为空：flags.randomList 里的武器 ID 均不存在，请检查");
				return;
			}
			// 录制和回放都在打开选择器时生成候选，保证 core.randShop() 调用次数完全一致。
			const offer = createRewardOffer();
			if (isReplayingNow()) {
				replayChoiceMode = "reward";
				replayRewardOffer = offer;
				return;
			}
			if (root) closeShop();
			// 打开界面期间锁定控制（关闭时由 closeShop 按原状态恢复）。
			lockShopControls();
			root = document.createElement("div");
			root.className = "backpack-shop-root";
			const panel = document.createElement("div");
			panel.className = "backpack-shop-panel backpack-shop-reward-panel";
			const header = document.createElement("div");
			header.className = "backpack-shop-header";
			const title = document.createElement("div");
			title.className = "backpack-shop-title";
			title.textContent = "选择武器（免费）";
			const close = document.createElement("button");
			close.type = "button";
			close.className = "backpack-shop-close";
			close.textContent = "×";
			close.addEventListener("click", closeShop);
			header.appendChild(title);
			header.appendChild(close);
			panel.appendChild(header);
			const grid = document.createElement("div");
			grid.className = "backpack-shop-grid";
			offer.forEach(function (item, index) {
				grid.appendChild(buildCard(item, function (picked, choiceIndex) {
					if (applyRewardChoice(offer, choiceIndex)) closeShop();
				}, index + 1));
			});
			panel.appendChild(grid);
			const footer = document.createElement("div");
			footer.className = "backpack-shop-footer";
			const hint = document.createElement("div");
			hint.className = "backpack-shop-ratio";
			hint.textContent = "选择一把武器免费获得（不影响商店价格）";
			footer.appendChild(hint);
			panel.appendChild(footer);
			root.appendChild(panel);
			root.addEventListener("pointerdown", function (event) {
				if (event.target === root) closeShop();
			});
			document.body.appendChild(root);
			mountShopParticleScenes(grid);
			if (core.insertAction) core.insertAction([]);
		};

		/** 成功执行商店 choices 回放后，把动作纳入当前路线并继续播放。 */
		const finishShopReplayChoice = function (action) {
			if (core.status && Array.isArray(core.status.route)) core.status.route.push(action);
			if (typeof core.replay === "function") core.replay();
			return true;
		};
		/** choices 属于样板的兜底可忽略动作；商店上下文中的非法选择必须主动判定录像失败。 */
		const failShopReplayChoice = function (action) {
			replayChoiceMode = null;
			replayRewardOffer = [];
			if (core.control && typeof core.control._replay_error === "function") {
				core.control._replay_error(action);
				return true;
			}
			return false;
		};
		if (core.control && typeof core.control.registerReplayAction === "function") {
			core.control.registerReplayAction("backpackShopChoice", function (action) {
				const matched = typeof action === "string" && action.match(/^choices:(-?\d+)$/);
				if (!matched || !replayChoiceMode) {
					// 一旦出现其他录像动作，视为已经离开自定义商店；后续 choices 交还给样板事件系统。
					if (replayChoiceMode && typeof action === "string" && action.indexOf("choices:") !== 0) {
						replayChoiceMode = null;
						replayRewardOffer = [];
					}
					return false;
				}
				const choiceIndex = Number(matched[1]);
				let success = false;
				if (replayChoiceMode === "shop") {
					success = applyShopChoice(choiceIndex, { recordChoice: false, silent: true });
				} else if (replayChoiceMode === "reward") {
					success = applyRewardChoice(replayRewardOffer, choiceIndex, { recordChoice: false, silent: true });
					if (success) {
						replayChoiceMode = null;
						replayRewardOffer = [];
					}
				}
				return success ? finishShopReplayChoice(action) : failShopReplayChoice(action);
			});
			// 样板的 ignoreInput 会兜底吞掉未在事件面板中消费的 choices:n；
			// 自定义 DOM 商店没有 type:"choices" 事件，因此必须让商店处理器先尝试消费。
			if (Array.isArray(core.control.replayActions)) {
				const actions = core.control.replayActions;
				const shopIndex = actions.findIndex(function (entry) { return entry.name === "backpackShopChoice"; });
				const ignoreIndex = actions.findIndex(function (entry) { return entry.name === "ignoreInput"; });
				if (shopIndex >= 0 && ignoreIndex >= 0 && shopIndex > ignoreIndex) {
					const shopAction = actions.splice(shopIndex, 1)[0];
					actions.splice(ignoreIndex, 0, shopAction);
				}
			}
		}

		plugin.openBackpackShop = openShop;
		plugin.openRewardPicker = openRewardPicker;
		plugin.closeBackpackShop = closeShop;
		plugin.getShopState = function () {
			return {
				ratio: getRatio(),
				poolSize: getPool().length,
				refreshCount: getRefreshCount(),
				buyCount: getBuyCount(),
				refreshCost: refreshCost(),
				buyCost: buyCost(),
				offer: currentOffer.map(function (item) { return item.id; })
			};
		};
		return plugin;
	})();
};
