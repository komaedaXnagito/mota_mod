/**
 * 背包乱斗武器商店的独立安装器。
 *
 * 功能：
 * - 每次刷新出现 5 把武器（从 flags.randomList 随机池抽取，默认池为全部武器定义）。
 * - 刷新初始 10 金币，每次刷新涨价 1 金币。
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
		const uiCommon = backpackUiCommon_2c986f67_7621_44eb_972d_24f1e2c6ce61;
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
		const refreshCost = function () { return REFRESH_COST_BASE + getRefreshCount() * REFRESH_COST_STEP; };
		// 前 3 次购买免费且不涨价（buyCount 0/1/2 → 0）；第 4 次起恢复正常：60 + 超出次数×60。
		const buyCost = function () {
			const count = getBuyCount();
			if (count < 3) return 0;
			return BUY_COST_BASE + (count - 3) * BUY_COST_STEP;
		};
		const getMoney = function () { return toInt(core.status.hero.money); };

		// ---- 抽卡逻辑 ----
		const rollRarity = function () {
			const weights = RARITY_WEIGHTS[getRatio() - 1];
			let total = 0;
			weights.forEach(function (w) { total += w; });
			// 使用样板自带的 core.rand()（基于 __rand__ 种子）：读档后随机序列恢复，货架结果可复现。
			let r = (typeof core.rand === "function" ? core.rand() : Math.random()) * total;
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
				return all.length ? all[(typeof core.rand === "function" ? core.rand(all.length) : Math.floor(Math.random() * all.length))] : null;
			}
			return candidates[(typeof core.rand === "function" ? core.rand(candidates.length) : Math.floor(Math.random() * candidates.length))];
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
				const id = pool[(typeof core.rand === "function" ? core.rand(pool.length) : Math.floor(Math.random() * pool.length))];
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

		// ---- 交互 ----
		const deductMoney = function (cost) {
			if (getMoney() < cost) {
				if (core.drawTip) core.drawTip("金币不足");
				return false;
			}
			core.status.hero.money = toInt(core.status.hero.money) - cost;
			if (core.updateStatusBar) core.updateStatusBar();
			return true;
		};
		const doRefresh = function () {
			const cost = refreshCost();
			if (!deductMoney(cost)) return;
			core.setFlag(FLAG_REFRESH, getRefreshCount() + 1);
			refreshOffer();
			render();
			if (core.playSound) core.playSound("item.mp3");
		};
		/** 获得一把武器进背包（不扣钱、不涨价；用于购买与免费赠予共用）。返回是否成功。 */
		const grantWeapon = function (def) {
			// 优先走背包系统插件 API；插件缺失/未挂载时兜底直接写入背包状态 flag
			// （__backpack_state__，未放置武器进 inventory，刷新界面后即可在库存看到）。
			const backpack = core.plugin;
			if (backpack && typeof backpack.addBackpackWeapon === "function") {
				backpack.addBackpackWeapon(def, { autoPlace: true });
				return true;
			}
			const state = core.getFlag("__backpack_state__") || { version: 5, placed: [], inventory: [], unlockedCells: [] };
			state.inventory.push({
				instanceId: "bw_" + Date.now() + "_" + Math.floor(100000 * (typeof core.rand === "function" ? core.rand() : Math.random())),
				weapon: JSON.parse(JSON.stringify(def)),
				rotation: 0
			});
			core.setFlag("__backpack_state__", state);
			if (backpack && typeof backpack.updateBackpack === "function") backpack.updateBackpack();
			return true;
		};
		const buyWeapon = function (item) {
			const def = weaponDefs[item.id];
			if (!def) return;
			const cost = buyCost(); // 武器价格实时计算（60 + 购买次数×60）
			if (!deductMoney(cost)) return;
			if (!grantWeapon(def)) {
				if (core.drawTip) core.drawTip("背包系统未安装，无法获得武器");
				core.status.hero.money = toInt(core.status.hero.money) + cost;
				if (core.updateStatusBar) core.updateStatusBar();
				return;
			}
			core.setFlag(FLAG_BUY, getBuyCount() + 1);
			refreshOffer(); // 购买后刷新货架（武器价格随之上涨）
			render();
			if (core.playSound) core.playSound("item.mp3");
		};

		// ---- UI ----
		const rarityText = function (rarity) {
			const rarityNum = Number(rarity);
			const safe = isFinite(rarityNum) ? Math.max(0, Math.min(5, rarityNum)) : 0;
			return new Array(safe + 1).join("★");
		};
		const buildCard = function (item, onPick) {
			const def = weaponDefs[item.id];
			const card = document.createElement("div");
			card.className = "backpack-shop-card";
			card.dataset.rarity = String(def.rarity == null ? 1 : def.rarity);
			// 内联强制纵向 flex + 水平居中（防止样式表缓存导致图片靠左上角）。
			card.style.display = "flex";
			card.style.flexDirection = "column";
			card.style.alignItems = "center";
			card.style.textAlign = "center";
			card.style.minHeight = "380px";
			// 图片：contain 居中显示整张素材（防裁切到空白）；加载后若有 imageCrop，
			// 用 clip-path 裁切到武器有效区域，让武器本体居中（不缩在角落）。
			const img = document.createElement("img");
			img.className = "backpack-shop-image";
			img.src = def.image || "";
			img.alt = def.name || "";
			img.draggable = false;
			img.style.display = "block";
			img.style.width = "100%";
			img.style.height = "220px";
			img.style.objectFit = "contain";
			img.style.margin = "0 0 8px";
			const applyCrop = function () {
				if (!Array.isArray(def.imageCrop) || def.imageCrop.length < 6) return;
				const nw = img.naturalWidth, nh = img.naturalHeight;
				if (!nw || !nh) return;
				const sx = def.imageCrop[0], sy = def.imageCrop[1];
				const sw = def.imageCrop[2], sh = def.imageCrop[3];
				img.style.clipPath = "inset("
					+ (sy / nh * 100) + "% "
					+ ((nw - sx - sw) / nw * 100) + "% "
					+ ((nh - sy - sh) / nh * 100) + "% "
					+ (sx / nw * 100) + "%)";
			};
			if (img.complete) applyCrop();
			else img.addEventListener("load", applyCrop);
			card.appendChild(img);
			const name = document.createElement("div");
			name.className = "backpack-shop-name";
			name.textContent = def.name || "未命名";
			card.appendChild(name);
			const rarity = document.createElement("div");
			rarity.className = "backpack-shop-rarity";
			rarity.textContent = rarityText(def.rarity);
			card.appendChild(rarity);
			const types = document.createElement("div");
			types.className = "backpack-shop-types";
			(Array.isArray(def.weaponTypes) ? def.weaponTypes : []).forEach(function (type) {
				const tag = document.createElement("i");
				tag.textContent = type;
				types.appendChild(tag);
			});
			card.appendChild(types);
			const buy = document.createElement("button");
			buy.type = "button";
			buy.className = "backpack-shop-buy";
			buy.textContent = onPick ? "获得" : (buyCost() > 0 ? "购买 " + buyCost() : "购买（免费）");
			buy.style.marginTop = "auto"; // flex 列布局：把购买按钮推到卡片底部
			buy.addEventListener("click", function (event) {
				event.stopPropagation();
				if (onPick) onPick(item);
				else buyWeapon(item);
			});
			card.appendChild(buy);
			// 悬停显示详细属性（伤害/命中/间隔/奥义/特殊效果）。
			uiCommon.bindTooltip(card, function () {
				return uiCommon.buildWeaponTooltip({ weapon: def, base: def, current: def });
			}, { hitTargets: [card] });
			return card;
		};
		const render = function () {
			if (!root) return;
			root.querySelector(".backpack-shop-money").textContent = "金币：" + getMoney();
			root.querySelector(".backpack-shop-refresh").textContent =
				"刷新（" + refreshCost() + " 金币）";
			const grid = root.querySelector(".backpack-shop-grid");
			grid.innerHTML = "";
			currentOffer.forEach(function (item) {
				grid.appendChild(buildCard(item));
			});
		};
		const closeShop = function () {
			if (root && root.parentNode) root.parentNode.removeChild(root);
			root = null;
			if (core.clearMap && core.clearMap("data")) core.clearMap("data");
		};
		const openShop = function () {
			if (root) { render(); return; }
			if (getPool().length === 0) {
				if (core.drawTip) core.drawTip("随机池为空：flags.randomList 里的武器 ID 均不存在，请检查（打开 project/weapons.js 查看有效 ID）");
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
			refresh.addEventListener("click", doRefresh);
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
			if (root) closeShop();
			// 每次随机 5 把（独立于商店货架，不写入 FLAG_OFFER）。
			const offer = [];
			const seen = {};
			for (let i = 0; i < SLOT_COUNT; i++) {
				let id = rollOne();
				let guard = 0;
				while (id && seen[id] && guard++ < 25) id = rollOne();
				if (id && !seen[id]) { seen[id] = true; offer.push({ id: id }); }
			}
			const pool = getPool();
			while (offer.length < SLOT_COUNT && pool.length) {
				const id = pool[typeof core.rand === "function" ? core.rand(pool.length) : Math.floor(Math.random() * pool.length)];
				if (!seen[id]) { seen[id] = true; offer.push({ id: id }); }
			}
			root = document.createElement("div");
			root.className = "backpack-shop-root";
			const panel = document.createElement("div");
			panel.className = "backpack-shop-panel";
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
			offer.forEach(function (item) {
				grid.appendChild(buildCard(item, function (picked) {
					const def = weaponDefs[picked.id];
					if (!def) return;
					if (!grantWeapon(def)) {
						if (core.drawTip) core.drawTip("背包系统未安装，无法获得武器");
						return;
					}
					if (core.playSound) core.playSound("item.mp3");
					if (core.drawTip) core.drawTip("获得武器：" + (def.name || picked.id));
					closeShop();
				}));
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
			if (core.insertAction) core.insertAction([]);
		};

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
