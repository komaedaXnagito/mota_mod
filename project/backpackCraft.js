/**
 * 背包乱斗武器合成系统的独立安装器。
 *
 * 功能：
 * - 打开合成面板（背包工具栏"合成"按钮或 core.plugin["背包乱斗合成"].openCraftPanel()）。
 * - 从背包（已放置 + 未放置）选择两把武器作为原料，自动匹配配方表（weaponRecipes）。
 * - 匹配成功显示结果武器预览，点击"合成"：消耗两把原料、免费获得一把结果武器（自动摆放）。
 * - 配方表：project/weaponRecipes.js（两把武器合成另一把，顺序不敏感，a 可等于 b）。
 */
var installBackpackCraft_9c4e7b2a_6f1d_4a8c_9e3b_5d7f2c1a8e64 = function (core, plugin) {
	"use strict";
	return (function () {
		const uiCommon = backpackUiCommon_2c986f67_7621_44eb_972d_24f1e2c6ce61;
		const weaponDefs = weaponDefinitions_9f2e6f5b_4b2c_4f8c_9a3d_7e1b6c0d5a44;
		const recipesData = (typeof weaponRecipes_7f2e9c4a_3b5d_4f8a_9c1e_6d4b8a2f9c31 !== "undefined")
			? weaponRecipes_7f2e9c4a_3b5d_4f8a_9c1e_6d4b8a2f9c31 : { recipes: [] };

		const FLAG_STATE = "__backpack_state__"; // 背包状态 flag（与背包系统一致）。
		let root = null;   // 合成面板根节点。
		let slots = [null, null]; // 两个原料槽：[{ instanceId, weapon }]。
		const EMPTY_ENTRY = { version: 5, placed: [], inventory: [], unlockedCells: [] };

		// ---- 背包访问 ----
		// 背包插件的方法直接挂在 core.plugin 顶层（如 core.plugin.addBackpackWeapon / removeBackpackWeapon）。
		const getBackpackPlugin = function () {
			return core.plugin;
		};
		const readEntries = function () {
			const state = core.getFlag(FLAG_STATE) || EMPTY_ENTRY;
			return (state.placed || []).concat(state.inventory || []);
		};
		const getWeaponDef = function (id) { return weaponDefs[id] || null; };

		// ---- 配方 ----
		const recipeKey = function (a, b) { return [a, b].sort().join("+"); };
		const buildIndex = function () {
			const index = {};
			(Array.isArray(recipesData.recipes) ? recipesData.recipes : []).forEach(function (r) {
				if (r && r.a && r.b && r.result && getWeaponDef(r.result)) {
					index[recipeKey(String(r.a), String(r.b))] = r;
				}
			});
			return index;
		};
		/** 由武器定义反查它在 weapons.js 里的键（如 I372）：配方表使用 weapons.js 的键，而背包实例里 weapon.id 是内部短 id（如 "xde"）。 */
		const getWeaponKey = function (weapon) {
			if (!weapon || weapon.id == null) return null;
			for (const key in weaponDefs) {
				if (weaponDefs[key] && weaponDefs[key].id === weapon.id) return key;
			}
			return null;
		};
		const findRecipe = function (weaponA, weaponB) {
			if (!weaponA || !weaponB) return null;
			const ka = getWeaponKey(weaponA), kb = getWeaponKey(weaponB);
			if (!ka || !kb) return null;
			return buildIndex()[recipeKey(ka, kb)] || null;
		};

		// ---- 合成执行 ----
		const doCraft = function () {
			const a = slots[0], b = slots[1];
			if (!a || !b) {
				if (core.drawTip) core.drawTip("请选择两把原料武器");
				return;
			}
			const recipe = findRecipe(a.weapon, b.weapon);
			if (!recipe) {
				if (core.drawTip) core.drawTip("这两把武器无法合成");
				return;
			}
			const backpack = getBackpackPlugin();
			if (backpack && typeof backpack.removeBackpackWeapon === "function") {
				backpack.removeBackpackWeapon(a.instanceId);
				backpack.removeBackpackWeapon(b.instanceId);
				backpack.addBackpackWeapon(getWeaponDef(recipe.result), { autoPlace: true });
			} else {
				// 背包插件不可用时兜底：直接操作背包状态 flag。
				const state = core.getFlag(FLAG_STATE) || { version: 5, placed: [], inventory: [], unlockedCells: [] };
				const keep = [];
				(state.placed || []).concat(state.inventory || []).forEach(function (entry) {
					if (entry.instanceId !== a.instanceId && entry.instanceId !== b.instanceId) keep.push(entry);
				});
				state.placed = [];
				state.inventory = keep;
				state.inventory.push({
					instanceId: "bw_" + Date.now() + "_" + Math.floor(100000 * (typeof core.rand === "function" ? core.rand() : Math.random())),
					weapon: JSON.parse(JSON.stringify(getWeaponDef(recipe.result))),
					rotation: 0
				});
				core.setFlag(FLAG_STATE, state);
				if (backpack && typeof backpack.updateBackpack === "function") backpack.updateBackpack();
			}
			slots = [null, null];
			if (core.playSound) core.playSound("item.mp3");
			render();
			if (core.drawTip) core.drawTip("合成成功：" + (getWeaponDef(recipe.result).name || recipe.result));
		};

		// ---- UI ----
		const rarityText = function (rarity) {
			const n = Number(rarity);
			const safe = isFinite(n) ? Math.max(0, Math.min(5, n)) : 0;
			return new Array(safe + 1).join("★");
		};
		const makeWeaponPreview = function (weapon) {
			const box = document.createElement("div");
			box.className = "backpack-craft-preview";
			box.dataset.rarity = String(weapon.rarity == null ? 1 : weapon.rarity);
			const img = document.createElement("img");
			img.src = weapon.image || "";
			img.alt = weapon.name || "";
			img.draggable = false;
			img.style.display = "block";
			img.style.width = "100%";
			img.style.height = "90px";
			img.style.objectFit = "contain";
			img.style.margin = "0 auto 4px";
			box.appendChild(img);
			const name = document.createElement("div");
			name.className = "backpack-craft-name";
			name.textContent = weapon.name || "未命名";
			box.appendChild(name);
			const rarity = document.createElement("div");
			rarity.className = "backpack-craft-rarity";
			rarity.textContent = rarityText(weapon.rarity);
			box.appendChild(rarity);
			const types = document.createElement("div");
			types.className = "backpack-craft-types";
			(Array.isArray(weapon.weaponTypes) ? weapon.weaponTypes : []).forEach(function (type) {
				const tag = document.createElement("i");
				tag.textContent = type;
				types.appendChild(tag);
			});
			box.appendChild(types);
			uiCommon.bindTooltip(box, function () {
				return uiCommon.buildWeaponTooltip({ weapon: weapon, base: weapon, current: weapon });
			}, { hitTargets: [box] });
			return box;
		};
		const fillSlot = function (index) {
			const slot = slots[index];
			const target = root.querySelector(".backpack-craft-slot-" + index);
			target.innerHTML = "";
			if (!slot) {
				const hint = document.createElement("div");
				hint.className = "backpack-craft-slot-hint";
				hint.textContent = index === 0 ? "点击选择第一把原料" : "点击选择第二把原料";
				target.appendChild(hint);
				return;
			}
			const preview = makeWeaponPreview(slot.weapon);
			const close = document.createElement("button");
			close.type = "button";
			close.className = "backpack-craft-slot-clear";
			close.textContent = "×";
			close.addEventListener("click", function (event) {
				event.stopPropagation();
				slots[index] = null;
				render();
			});
			target.appendChild(preview);
			target.appendChild(close);
		};
		const renderResult = function () {
		const a = slots[0], b = slots[1];
		const resultBox = root.querySelector(".backpack-craft-result");
		resultBox.innerHTML = "";
		if (!a || !b) {
			// 空槽时显示文字提示，避免渲染空 src 的 img 导致破图图标。
			const hint = document.createElement("div");
			hint.className = "backpack-craft-hint";
			hint.textContent = "请放入两把武器";
			resultBox.appendChild(hint);
			return;
		}
		const recipe = findRecipe(a.weapon, b.weapon);
			if (!recipe) {
				const no = document.createElement("div");
				no.className = "backpack-craft-norecipe";
				no.textContent = "未找到合成配方";
				resultBox.appendChild(no);
				return;
			}
			resultBox.appendChild(makeWeaponPreview(getWeaponDef(recipe.result)));
			root.querySelector(".backpack-craft-go").style.display = "";
		};
		const render = function () {
			if (!root) return;
			fillSlot(0);
			fillSlot(1);
			renderResult();
			const go = root.querySelector(".backpack-craft-go");
			const a = slots[0], b = slots[1];
			go.style.display = (a && b && findRecipe(a.weapon, b.weapon)) ? "" : "none";
		};
		const pickWeapon = function (slotIndex) {
			// 展开背包武器选择列表。
			const list = root.querySelector(".backpack-craft-list");
			list.innerHTML = "";
			const entries = readEntries();
			if (!entries.length) {
				const empty = document.createElement("div");
				empty.className = "backpack-craft-list-empty";
				empty.textContent = "背包里没有武器";
				list.appendChild(empty);
				return;
			}
			entries.forEach(function (entry) {
				const item = document.createElement("div");
				item.className = "backpack-craft-list-item";
				item.dataset.rarity = String(entry.weapon.rarity == null ? 1 : entry.weapon.rarity);
				const img = document.createElement("img");
				img.src = entry.weapon.image || "";
				img.alt = entry.weapon.name || "";
				img.draggable = false;
				item.appendChild(img);
				const label = document.createElement("span");
				label.textContent = (entry.weapon.name || "未命名") + " ×1";
				item.appendChild(label);
				item.addEventListener("click", function () {
					// 同一把武器（同 instanceId）不能同时占两个合成框。
					const other = slots[1 - slotIndex];
					if (other && other.instanceId === entry.instanceId) {
						if (core.drawTip) core.drawTip("这把武器已经在另一个合成框里了");
						return;
					}
					slots[slotIndex] = { instanceId: entry.instanceId, weapon: entry.weapon };
					render();
				});
				list.appendChild(item);
			});
		};
		const closeCraft = function () {
			if (root && root.parentNode) root.parentNode.removeChild(root);
			root = null;
		};
		const openCraftPanel = function () {
			if (root) { render(); return; }
			root = document.createElement("div");
			root.className = "backpack-craft-root";
			const panel = document.createElement("div");
			panel.className = "backpack-craft-panel";
			const header = document.createElement("div");
			header.className = "backpack-craft-header";
			const title = document.createElement("div");
			title.className = "backpack-craft-title";
			title.textContent = "武器合成（免费）";
			const close = document.createElement("button");
			close.type = "button";
			close.className = "backpack-craft-close";
			close.textContent = "×";
			close.addEventListener("click", closeCraft);
			header.appendChild(title);
			header.appendChild(close);
			panel.appendChild(header);
			const main = document.createElement("div");
			main.className = "backpack-craft-main";
			const slotsBox = document.createElement("div");
			slotsBox.className = "backpack-craft-slots";
			for (let i = 0; i < 2; i++) {
				const slot = document.createElement("div");
				slot.className = "backpack-craft-slot backpack-craft-slot-" + i;
				slot.addEventListener("click", function () { pickWeapon(i); });
				slotsBox.appendChild(slot);
			}
			const arrow = document.createElement("div");
			arrow.className = "backpack-craft-arrow";
			arrow.textContent = "→";
			const result = document.createElement("div");
			result.className = "backpack-craft-result";
			slotsBox.appendChild(arrow);
			slotsBox.appendChild(result);
			main.appendChild(slotsBox);
			const list = document.createElement("div");
			list.className = "backpack-craft-list";
			main.appendChild(list);
			panel.appendChild(main);
			const go = document.createElement("button");
			go.type = "button";
			go.className = "backpack-craft-go";
			go.textContent = "合成";
			go.style.display = "none";
			go.addEventListener("click", doCraft);
			panel.appendChild(go);
			root.appendChild(panel);
			root.addEventListener("pointerdown", function (event) {
				if (event.target === root) closeCraft();
			});
			document.body.appendChild(root);
			render();
		};

		plugin.openCraftPanel = openCraftPanel;
		plugin.closeCraftPanel = closeCraft;
		plugin.getCraftState = function () {
			return {
				recipeCount: (Array.isArray(recipesData.recipes) ? recipesData.recipes : []).length,
				slots: slots.map(function (s) { return s ? s.weapon.name : null; })
			};
		};
		return plugin;
	})();
};
