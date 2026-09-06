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
		const weaponDefs = weaponDefinitions_9f2e6f5b_4b2c_4f8c_9a3d_7e1b6c0d5a44;
		const recipesData = (typeof weaponRecipes_7f2e9c4a_3b5d_4f8a_9c1e_6d4b8a2f9c31 !== "undefined")
			? weaponRecipes_7f2e9c4a_3b5d_4f8a_9c1e_6d4b8a2f9c31 : { recipes: [] };
		const uiCommon = (typeof backpackUiCommon_2c986f67_7621_44eb_972d_24f1e2c6ce61 !== "undefined")
			? backpackUiCommon_2c986f67_7621_44eb_972d_24f1e2c6ce61 : null;

		const FLAG_STATE = "__backpack_state__"; // 背包状态 flag（与背包系统一致）。
		let root = null;   // 合成面板根节点。
		let slots = [null, null]; // 两个原料槽：[{ instanceId, weapon }]。
		let activeSlotIndex = 0;
		const EMPTY_ENTRY = { version: 6, placed: [], inventory: [], unlockedCells: [] };

		// ---- 背包访问 ----
		// 背包插件的方法直接挂在 core.plugin 顶层（如 core.plugin.addBackpackWeapon / removeBackpackWeapon）。
		const getBackpackPlugin = function () {
			return core.plugin;
		};
		const getWeaponDef = function (id) { return weaponDefs[id] || null; };
		/** 旧存档迁移只使用身份字段，绝不采用其中缓存的武器属性或战斗规则。 */
		const resolveDefinitionId = function (entry) {
			const weaponSystem = core.plugin && core.plugin.weaponSystem;
			if (weaponSystem && typeof weaponSystem.resolveDefinitionId === "function") {
				const resolved = weaponSystem.resolveDefinitionId(entry);
				if (resolved) return resolved;
			}
			if (!entry || typeof entry !== "object") return getWeaponDef(entry) ? String(entry) : null;
			const legacy = entry.weapon && typeof entry.weapon === "object" ? entry.weapon : entry;
			const direct = entry.definitionId || legacy.definitionId || entry.itemId
				|| entry.sourceItemId || legacy.sourceItemId;
			if (direct && getWeaponDef(direct)) return String(direct);
			const identityFields = ["id", "name", "sourceName"];
			for (let fieldIndex = 0; fieldIndex < identityFields.length; fieldIndex++) {
				const field = identityFields[fieldIndex];
				if (legacy[field] == null) continue;
				const matches = Object.keys(weaponDefs).filter(function (definitionId) {
					return weaponDefs[definitionId] && String(weaponDefs[definitionId][field]) === String(legacy[field]);
				});
				if (matches.length === 1) return matches[0];
			}
			return null;
		};
		const hydrateStoredEntry = function (entry) {
			const definitionId = resolveDefinitionId(entry);
			const definition = definitionId && getWeaponDef(definitionId);
			if (!entry || !definition) return null;
			return Object.assign({}, entry, {
				definitionId: definitionId,
				weapon: JSON.parse(JSON.stringify(definition))
			});
		};
		const readEntries = function () {
			const backpack = getBackpackPlugin();
			const state = backpack && typeof backpack.getBackpackState === "function"
				? backpack.getBackpackState()
				: (core.getFlag(FLAG_STATE) || EMPTY_ENTRY);
			return (state.placed || []).concat(state.inventory || [])
				.map(hydrateStoredEntry)
				.filter(function (entry) { return !!entry; });
		};
		const serializeEntry = function (entry) {
			const definitionId = resolveDefinitionId(entry);
			if (!definitionId) return null;
			const result = {
				instanceId: String(entry.instanceId),
				definitionId: definitionId,
				rotation: Math.round((Number(entry.rotation) || 0) / 90) * 90
			};
			if (entry.itemId) result.itemId = String(entry.itemId);
			if (entry.uniqueKey) result.uniqueKey = String(entry.uniqueKey);
			return result;
		};
		const getRecipeDisplayName = function (id) {
			const definition = getWeaponDef(id);
			const displayNames = recipesData.displayNames || {};
			return displayNames[id] || (definition && definition.name) || String(id || "未知武器");
		};
		const findRecipeWeaponIdByName = function (name) {
			const target = String(name || "").trim();
			const displayNames = recipesData.displayNames || {};
			for (const id in displayNames) {
				if (displayNames[id] === target && getWeaponDef(id)) return id;
			}
			for (const id in weaponDefs) {
				const definition = weaponDefs[id];
				if (definition && (definition.name === target || definition.sourceName === target)) return id;
			}
			return null;
		};

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
		const getEntryWeaponKey = function (entry) {
			return entry && entry.weapon ? getWeaponKey(entry.weapon) : null;
		};
		const findCurrentEntry = function (slot, entries) {
			if (!slot) return null;
			for (let i = 0; i < entries.length; i++) {
				if (entries[i] && entries[i].instanceId === slot.instanceId) return entries[i];
			}
			return null;
		};
		/** 为具体双材料配方挑出两把不同的背包实例；优先保留玩家已经选中的那一把。 */
		const findEntriesForRecipe = function (recipe, sourceEntries) {
			if (!recipe || !recipe.a || !recipe.b || !getWeaponDef(recipe.result)) return null;
			const entries = Array.isArray(sourceEntries) ? sourceEntries : readEntries();
			const findOther = function (key, excludedId) {
				for (let i = 0; i < entries.length; i++) {
					const entry = entries[i];
					if (entry && entry.instanceId !== excludedId && getEntryWeaponKey(entry) === key) return entry;
				}
				return null;
			};

			for (let slotIndex = 0; slotIndex < slots.length; slotIndex++) {
				const selected = findCurrentEntry(slots[slotIndex], entries);
				const selectedKey = getEntryWeaponKey(selected);
				if (!selected || (selectedKey !== recipe.a && selectedKey !== recipe.b)) continue;
				const otherKey = selectedKey === recipe.a ? recipe.b : recipe.a;
				const other = findOther(otherKey, selected.instanceId);
				if (!other) continue;
				return slotIndex === 0 ? [selected, other] : [other, selected];
			}

			const first = findOther(recipe.a, null);
			if (!first) return null;
			const second = findOther(recipe.b, first.instanceId);
			return second ? [first, second] : null;
		};
		const recipeUsesSelectedWeapon = function (recipe) {
			const selectedKeys = slots.map(function (slot) { return getEntryWeaponKey(slot); }).filter(Boolean);
			return selectedKeys.some(function (key) { return key === recipe.a || key === recipe.b; });
		};
		const getCatalogMaterials = function (recipes) {
			const pairs = [];
			const seen = {};
			recipes.forEach(function (recipe) {
				const pair = [getRecipeDisplayName(recipe.a), getRecipeDisplayName(recipe.b)];
				const key = pair.slice().sort().join("+");
				if (!seen[key]) {
					seen[key] = true;
					pairs.push(pair);
				}
			});
			if (pairs.length <= 1) return pairs[0] || [];
			let common = null;
			pairs[0].some(function (candidate) {
				if (pairs.every(function (pair) { return pair.indexOf(candidate) >= 0; })) {
					common = candidate;
					return true;
				}
				return false;
			});
			if (!common) {
				return [pairs.map(function (pair) { return pair.join(" + "); }).join(" / ")];
			}
			const alternatives = [];
			pairs.forEach(function (pair) {
				const copy = pair.slice();
				copy.splice(copy.indexOf(common), 1);
				const other = copy.join(" + ");
				if (alternatives.indexOf(other) < 0) alternatives.push(other);
			});
			return [common, alternatives.join(" / ")];
		};
		/** 将同一合成产物的多个“任选其一”具体配方合并为图鉴中的一行。 */
		const getRecipeCatalog = function () {
			const entries = readEntries();
			const recipes = Array.isArray(recipesData.recipes) ? recipesData.recipes : [];
			const groups = [];
			const groupsByResult = {};
			recipes.forEach(function (recipe, index) {
				if (!recipe || !recipe.a || !recipe.b || !recipe.result) return;
				let group = groupsByResult[recipe.result];
				if (!group) {
					group = groupsByResult[recipe.result] = {
						id: "result:" + recipe.result,
						resultId: recipe.result,
						resultName: getRecipeDisplayName(recipe.result),
						recipes: [],
						originalIndex: index
					};
					groups.push(group);
				}
				group.recipes.push(recipe);
			});

			const catalog = groups.map(function (group) {
				const concrete = group.recipes.map(function (recipe) {
					return {
						recipe: recipe,
						entries: findEntriesForRecipe(recipe, entries),
						selectedMatch: recipeUsesSelectedWeapon(recipe)
					};
				}).sort(function (left, right) {
					return Number(Boolean(right.entries)) - Number(Boolean(left.entries))
						|| Number(right.selectedMatch) - Number(left.selectedMatch);
				});
				const chosen = concrete[0] || {};
				const selectedMatch = concrete.some(function (item) { return item.selectedMatch; });
				return {
					id: group.id,
					resultId: group.resultId,
					resultName: group.resultName,
					materials: getCatalogMaterials(group.recipes),
					craftable: Boolean(chosen.entries),
					selectedMatch: selectedMatch,
					recipe: chosen.entries ? chosen.recipe : null,
					recipeIds: group.recipes.map(function (recipe) { return recipe.id; }),
					originalIndex: group.originalIndex,
					reason: chosen.entries
						? (selectedMatch ? "当前选择可用 · 点击填入" : "可合成 · 点击填入")
						: "材料不足"
				};
			});
			return catalog.sort(function (left, right) {
				return Number(right.craftable) - Number(left.craftable)
					|| Number(right.selectedMatch) - Number(left.selectedMatch)
					|| left.originalIndex - right.originalIndex;
			});
		};
		const fillRecipeSlots = function (recipe) {
			const entries = findEntriesForRecipe(recipe);
			if (!entries) return false;
			slots = entries.map(function (entry) {
				return { instanceId: entry.instanceId, weapon: entry.weapon };
			});
			render();
			return true;
		};

		// ---- 合成执行 ----
		const pushCraftRoute = function (firstInstanceId, secondInstanceId) {
			if (core.isReplaying && core.isReplaying()) return false;
			if (core.isPlaying && !core.isPlaying()) return false;
			if (!core.status || !Array.isArray(core.status.route)) return false;
			core.status.route.push("bp:-2:" + firstInstanceId + ":" + secondInstanceId);
			return true;
		};
		const craftBackpackWeaponsByInstanceIds = function (firstInstanceId, secondInstanceId, options) {
			options = options || {};
			firstInstanceId = String(firstInstanceId == null ? "" : firstInstanceId);
			secondInstanceId = String(secondInstanceId == null ? "" : secondInstanceId);
			if (!firstInstanceId || !secondInstanceId || firstInstanceId === secondInstanceId) return false;

			const entries = readEntries();
			const a = entries.find(function (entry) { return entry.instanceId === firstInstanceId; });
			const b = entries.find(function (entry) { return entry.instanceId === secondInstanceId; });
			if (!a || !b) return false;
			const recipe = findRecipe(a.weapon, b.weapon);
			const resultDefinition = recipe && getWeaponDef(recipe.result);
			if (!resultDefinition) return false;

			const backpack = getBackpackPlugin();
			if (backpack && typeof backpack.removeBackpackWeapon === "function"
				&& typeof backpack.addBackpackWeapon === "function") {
				if (!backpack.removeBackpackWeapon(a.instanceId)) return false;
				if (!backpack.removeBackpackWeapon(b.instanceId)) return false;
				if (backpack.addBackpackWeapon(resultDefinition, {
					definitionId: recipe.result,
					autoPlace: true,
					recordRoute: false
				}) == null) return false;
			} else {
				// 背包插件不可用时兜底：直接操作背包状态 flag。
				const state = core.getFlag(FLAG_STATE) || EMPTY_ENTRY;
				const keep = [];
				readEntries().forEach(function (entry) {
					if (entry.instanceId !== a.instanceId && entry.instanceId !== b.instanceId) {
						const serialized = serializeEntry(entry);
						if (serialized) keep.push(serialized);
					}
				});
				state.version = 6;
				state.placed = [];
				state.inventory = keep;
				const nextInstanceId = Math.floor(Number(core.getFlag("__backpack_instance_id__", 0)) || 0) + 1;
				core.setFlag("__backpack_instance_id__", nextInstanceId);
				state.inventory.push({
					instanceId: String(nextInstanceId),
					definitionId: recipe.result,
					rotation: 0
				});
				core.setFlag(FLAG_STATE, state);
				if (backpack && typeof backpack.updateBackpack === "function") backpack.updateBackpack();
			}

			if (options.recordRoute !== false) pushCraftRoute(a.instanceId, b.instanceId);
			slots = [null, null];
			if (!options.silent) {
				if (core.playSound) core.playSound("item.mp3");
				render();
				if (core.drawTip) core.drawTip("合成成功：" + (resultDefinition.name || recipe.result));
			}
			return true;
		};
		const doCraft = function () {
			const a = slots[0], b = slots[1];
			if (!a || !b) {
				if (core.drawTip) core.drawTip("请选择两把原料武器");
				return false;
			}
			const recipe = findRecipe(a.weapon, b.weapon);
			if (!recipe) {
				if (core.drawTip) core.drawTip("这两把武器无法合成");
				return false;
			}
			if (!craftBackpackWeaponsByInstanceIds(a.instanceId, b.instanceId)) {
				if (core.drawTip) core.drawTip("合成失败：原料武器状态已变化");
				return false;
			}
			return true;
		};

		// ---- UI ----
		const rarityText = function (rarity) {
			const n = Number(rarity);
			const safe = isFinite(n) ? Math.max(0, Math.min(5, n)) : 0;
			return new Array(safe + 1).join("★");
		};
		const PREVIEW_IMAGE_INSET = 0.12;
		/** 把合成界面的武器统一成 weaponSystem 使用的 cells 格式。 */
		const normalizePreviewWeapon = function (definition) {
			const weaponSystem = plugin.weaponSystem;
			if (weaponSystem && typeof weaponSystem.normalizeWeapon === "function") {
				return weaponSystem.normalizeWeapon(definition);
			}
			const cells = [];
			const shape = Array.isArray(definition.cells) ? null : (definition.shape || definition.size);
			if (Array.isArray(definition.cells)) {
				definition.cells.forEach(function (cell) {
					if (Array.isArray(cell) && cell.length >= 2) {
						cells.push([Number(cell[0]) || 0, Number(cell[1]) || 0]);
					}
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
		/**
		 * 合成预览只展示武器真实占格，不计算联动区域；外围补一圈空格，
		 * 让占格形状和武器轮廓都能直观看清。
		 */
		const getCraftPreviewGeometry = function (definition) {
			const weapon = normalizePreviewWeapon(definition);
			const weaponSystem = plugin.weaponSystem;
			const sourceCells = weaponSystem && typeof weaponSystem.getRotatedCells === "function"
				? weaponSystem.getRotatedCells(weapon, 0)
				: weapon.cells.slice();
			const safeCells = sourceCells.length ? sourceCells : [[0, 0]];
			const sourceMinCol = Math.min.apply(null, safeCells.map(function (cell) { return cell[0]; }));
			const sourceMaxCol = Math.max.apply(null, safeCells.map(function (cell) { return cell[0]; }));
			const sourceMinRow = Math.min.apply(null, safeCells.map(function (cell) { return cell[1]; }));
			const sourceMaxRow = Math.max.apply(null, safeCells.map(function (cell) { return cell[1]; }));
			const minCol = sourceMinCol - 1;
			const minRow = sourceMinRow - 1;
			return {
				weapon: weapon,
				sourceCells: safeCells,
				minCol: minCol,
				minRow: minRow,
				cols: sourceMaxCol - sourceMinCol + 3,
				rows: sourceMaxRow - sourceMinRow + 3,
				sourceBounds: {
					col: sourceMinCol,
					row: sourceMinRow,
					cols: sourceMaxCol - sourceMinCol + 1,
					rows: sourceMaxRow - sourceMinRow + 1
				}
			};
		};
		const positionCraftPreviewCell = function (element, col, row, geometry) {
			element.style.left = ((col - geometry.minCol) / geometry.cols * 100) + "%";
			element.style.top = ((row - geometry.minRow) / geometry.rows * 100) + "%";
			element.style.width = (100 / geometry.cols) + "%";
			element.style.height = (100 / geometry.rows) + "%";
		};
		/** 与商店相同：完整图片和裁剪区共用 uniformScale，禁止横纵轴分别拉伸。 */
		const layoutCraftPreviewImage = function (imageFrame, image, geometry) {
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
		/** 构建无联动、无 Tooltip 的格子占用预览；槽位、结果和候选列表共同使用。 */
		const buildCraftGridPreview = function (definition, options) {
			options = options || {};
			const geometry = getCraftPreviewGeometry(definition);
			const preview = document.createElement("div");
			preview.className = "backpack-craft-grid-preview" + (options.compact ? " compact" : "");
			preview.dataset.occupiedCells = String(geometry.sourceCells.length);
			preview.setAttribute("aria-label", "占 " + geometry.sourceCells.length + " 格");
			const stage = document.createElement("div");
			stage.className = "backpack-craft-grid-stage";
			stage.style.aspectRatio = geometry.cols + " / " + geometry.rows;
			// 主预览框为 168×108、紧凑预览为 48×48。根据容器宽高比选择铺满方向，
			// 避免正方形棋盘在宽槽位里被 max-height 压扁成矩形，连带拉伸武器图片。
			const containerRatio = options.compact ? 1 : 168 / 108;
			if (geometry.cols / geometry.rows >= containerRatio) stage.style.width = "100%";
			else stage.style.height = "100%";
			preview.appendChild(stage);

			for (let row = 0; row < geometry.rows; row++) {
				for (let col = 0; col < geometry.cols; col++) {
					const gridCell = document.createElement("span");
					gridCell.className = "backpack-craft-grid-cell";
					positionCraftPreviewCell(gridCell, geometry.minCol + col, geometry.minRow + row, geometry);
					stage.appendChild(gridCell);
				}
			}

			geometry.sourceCells.forEach(function (sourceCell) {
				const cell = document.createElement("span");
				cell.className = "backpack-craft-footprint-cell";
				positionCraftPreviewCell(cell, sourceCell[0], sourceCell[1], geometry);
				stage.appendChild(cell);
			});
			const imageFrame = document.createElement("div");
			imageFrame.className = "backpack-craft-grid-image-frame";
			const image = document.createElement("img");
			uiCommon.setWeaponImageSource(image, geometry.weapon.image || "");
			image.alt = geometry.weapon.name || "";
			image.draggable = false;
			layoutCraftPreviewImage(imageFrame, image, geometry);
			imageFrame.appendChild(image);
			stage.appendChild(imageFrame);
			return preview;
		};
		const makeWeaponPreview = function (weapon) {
			const box = document.createElement("div");
			box.className = "backpack-craft-preview";
			box.dataset.rarity = String(weapon.rarity == null ? 1 : weapon.rarity);
			box.appendChild(buildCraftGridPreview(weapon));
			const name = document.createElement("div");
			name.className = "backpack-craft-name";
			if (uiCommon) uiCommon.renderWeaponName(name, weapon, { showHammer: false });
			else name.textContent = weapon.name || "未命名";
			box.appendChild(name);
			const rarity = document.createElement("div");
			rarity.className = "backpack-craft-rarity";
			rarity.textContent = rarityText(weapon.rarity);
			if (uiCommon) uiCommon.appendCraftHammer(rarity, weapon);
			box.appendChild(rarity);
			const types = document.createElement("div");
			types.className = "backpack-craft-types";
			(Array.isArray(weapon.weaponTypes) ? weapon.weaponTypes : []).forEach(function (type) {
				const tag = document.createElement("i");
				tag.textContent = type;
				types.appendChild(tag);
			});
			box.appendChild(types);
			return box;
		};
		const fillSlot = function (index) {
			const slot = slots[index];
			const target = root.querySelector(".backpack-craft-slot-" + index);
			uiCommon.releaseWeaponUI(target);
			target.innerHTML = "";
			uiCommon.decorateWeaponSurface(target, { radius: 14, interactive: true });
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
		uiCommon.releaseWeaponUI(resultBox);
		resultBox.innerHTML = "";
		uiCommon.decorateWeaponSurface(resultBox, { radius: 14, fill: "gold", interactive: true });
		resultBox._buiWeapon = null;
		resultBox.classList.remove("has-result");
		resultBox.tabIndex = -1;
		if (uiCommon) {
			uiCommon.bindTooltip(resultBox, function () {
				const definition = resultBox._buiWeapon;
				return definition ? uiCommon.buildWeaponTooltip({
					weapon: definition,
					base: definition,
					current: definition,
					attributesOnly: true
				}) : "";
			});
		}
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
			const resultDefinition = getWeaponDef(recipe.result);
			resultBox._buiWeapon = resultDefinition;
			resultBox.classList.add("has-result");
			resultBox.tabIndex = 0;
			resultBox.appendChild(makeWeaponPreview(resultDefinition));
			root.querySelector(".backpack-craft-go").style.display = "";
		};
		const renderRecipeCatalog = function () {
			const list = root.querySelector(".backpack-craft-recipe-list");
			const summary = root.querySelector(".backpack-craft-recipe-summary");
			if (!list || !summary) return;
			const catalog = getRecipeCatalog();
			const craftableCount = catalog.filter(function (item) { return item.craftable; }).length;
			summary.textContent = "可合成 " + craftableCount + " / 共 " + catalog.length;
			if (uiCommon) uiCommon.hideTooltip();
			uiCommon.releaseWeaponUI(list);
			list.innerHTML = "";
			const makeRecipeWeaponName = function (label, weaponId) {
				const element = document.createElement("span");
				element.className = "backpack-craft-recipe-weapon";
				const id = weaponId || findRecipeWeaponIdByName(label);
				const definition = getWeaponDef(id);
				if (uiCommon && definition) uiCommon.renderWeaponName(element, definition, { label: label });
				else element.textContent = label;
				if (uiCommon && definition) {
					element.classList.add("has-tooltip");
					uiCommon.bindTooltip(element, function () {
						return uiCommon.buildWeaponTooltip({
							weapon: definition,
							base: definition,
							current: definition
						});
					});
				}
				return element;
			};
			const appendRecipeWeaponText = function (container, text) {
				String(text || "").split(/(\s+[+\/]\s+)/).forEach(function (part) {
					if (!part) return;
					if (/^\s+[+\/]\s+$/.test(part)) {
						container.appendChild(document.createTextNode(part));
						return;
					}
					const noteMatch = part.match(/^(.*?)(（[^）]+）)$/);
					const label = noteMatch ? noteMatch[1] : part;
					container.appendChild(makeRecipeWeaponName(label));
					if (noteMatch) container.appendChild(document.createTextNode(noteMatch[2]));
				});
			};
			catalog.forEach(function (item) {
				const card = document.createElement("div");
				if (item.craftable) {
					card.setAttribute("role", "button");
					card.tabIndex = 0;
				} else {
					card.setAttribute("role", "group");
				}
				card.className = "backpack-craft-recipe-card "
					+ (item.craftable ? "is-craftable" : "is-locked")
					+ (item.selectedMatch ? " uses-selected" : "");
				card.dataset.recipeId = item.id;
				card.setAttribute("aria-label", item.materials.join(" 加 ") + " 合成 " + item.resultName
					+ (item.craftable ? "" : "，" + item.reason));

				const formula = document.createElement("div");
				formula.className = "backpack-craft-recipe-formula";
				const materials = document.createElement("span");
				materials.className = "backpack-craft-recipe-materials";
				appendRecipeWeaponText(materials, item.materials.join(" + "));
				const arrow = document.createElement("b");
				arrow.textContent = "→";
				const result = document.createElement("span");
				result.className = "backpack-craft-recipe-result";
				result.appendChild(makeRecipeWeaponName(item.resultName, item.resultId));
				formula.appendChild(materials);
				formula.appendChild(arrow);
				formula.appendChild(result);
				card.appendChild(formula);

				const state = document.createElement("div");
				state.className = "backpack-craft-recipe-state";
				state.textContent = item.reason;
				card.appendChild(state);
				if (item.craftable && item.recipe) {
					card.addEventListener("click", function () { fillRecipeSlots(item.recipe); });
					card.addEventListener("keydown", function (event) {
						if (event.key !== "Enter" && event.key !== " ") return;
						event.preventDefault();
						fillRecipeSlots(item.recipe);
					});
				}
				list.appendChild(card);
				uiCommon.decorateWeaponSurface(card, { radius: 11, interactive: true,
					fill: item.selectedMatch ? "gold" : "pearl" });
			});
		};
		const render = function () {
			if (!root) return;
			fillSlot(0);
			fillSlot(1);
			renderResult();
			renderRecipeCatalog();
			const go = root.querySelector(".backpack-craft-go");
			const a = slots[0], b = slots[1];
			go.style.display = (a && b && findRecipe(a.weapon, b.weapon)) ? "" : "none";
			pickWeapon(activeSlotIndex);
		};
		const pickWeapon = function (slotIndex) {
			activeSlotIndex = slotIndex;
			// 展开背包武器选择列表。
			const list = root.querySelector(".backpack-craft-list");
			uiCommon.releaseWeaponUI(list);
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
				item.appendChild(buildCraftGridPreview(entry.weapon, { compact: true }));
				const label = document.createElement("span");
				if (uiCommon) uiCommon.renderWeaponName(label, entry.weapon, {
					label: (entry.weapon.name || "未命名") + " ×1"
				});
				else label.textContent = (entry.weapon.name || "未命名") + " ×1";
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
				uiCommon.decorateWeaponSurface(item, { radius: 10, interactive: true });
			});
		};
		const closeCraft = function () {
			if (uiCommon) uiCommon.hideTooltip();
			if (uiCommon) uiCommon.unregisterModal(root);
			if (uiCommon) uiCommon.releaseWeaponUI(root);
			if (root && root.parentNode) root.parentNode.removeChild(root);
			root = null;
		};
		const openCraftPanel = function () {
			if (root) { render(); return; }
			root = document.createElement("div");
			root.className = "backpack-craft-root";
			activeSlotIndex = 0;
			const dialog = document.createElement("div");
			dialog.className = "backpack-craft-dialog";
			const panel = document.createElement("div");
			panel.className = "backpack-craft-panel";
			const header = document.createElement("div");
			header.className = "backpack-craft-header";
			const title = document.createElement("div");
			title.className = "backpack-craft-title";
			title.textContent = "武器合成";
			const freeLabel = document.createElement("small");
			freeLabel.textContent = "免费";
			title.appendChild(freeLabel);
			const close = document.createElement("button");
			close.type = "button";
			close.className = "backpack-craft-close";
			close.textContent = "返回";
			close.setAttribute("aria-label", "关闭武器合成");
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

			const recipes = document.createElement("section");
			recipes.className = "backpack-craft-recipes";
			const recipesHeader = document.createElement("div");
			recipesHeader.className = "backpack-craft-recipes-header";
			const recipesTitle = document.createElement("div");
			recipesTitle.className = "backpack-craft-recipes-title";
			recipesTitle.textContent = "合成图鉴";
			const recipesSummary = document.createElement("div");
			recipesSummary.className = "backpack-craft-recipe-summary";
			recipesHeader.appendChild(recipesTitle);
			recipesHeader.appendChild(recipesSummary);
			recipes.appendChild(recipesHeader);
			const recipesList = document.createElement("div");
			recipesList.className = "backpack-craft-recipe-list";
			recipes.appendChild(recipesList);

			dialog.appendChild(panel);
			dialog.appendChild(recipes);
			root.appendChild(dialog);
			root.addEventListener("pointerdown", function (event) {
				if (event.target === root) closeCraft();
			});
			document.body.appendChild(root);
			uiCommon.decorateWeaponSurface(panel, { radius: 23, ornate: true, crest: true });
			uiCommon.decorateWeaponSurface(recipes, { radius: 23, ornate: true, crest: true });
			uiCommon.decorateWeaponSurface(close, { button: true });
			uiCommon.decorateWeaponSurface(go, { button: true, gold: true });
			if (uiCommon) uiCommon.registerModal(root, closeCraft, { name: "backpack-craft" });
			close.focus();
			render();
		};

		plugin.openCraftPanel = openCraftPanel;
		plugin.closeCraftPanel = closeCraft;
		plugin.getCraftRecipeCatalog = function () {
			return getRecipeCatalog().map(function (item) {
				return {
					id: item.id,
					materials: item.materials.slice(),
					result: item.resultName,
					craftable: item.craftable,
					selectedMatch: item.selectedMatch,
					reason: item.reason,
					recipeIds: item.recipeIds.slice()
				};
			});
		};
		plugin.fillCraftRecipe = function (catalogId) {
			const item = getRecipeCatalog().filter(function (candidate) { return candidate.id === catalogId; })[0];
			return Boolean(item && item.craftable && item.recipe && fillRecipeSlots(item.recipe));
		};
		plugin.craftBackpackWeaponsByInstanceIds = craftBackpackWeaponsByInstanceIds;
		plugin.getCraftState = function () {
			return {
				recipeCount: (Array.isArray(recipesData.recipes) ? recipesData.recipes : []).length,
				catalogCount: getRecipeCatalog().length,
				slots: slots.map(function (s) { return s ? s.weapon.name : null; })
			};
		};
		return plugin;
	})();
};
