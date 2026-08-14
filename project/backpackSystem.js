/** 背包物品实例、摆放、拖拽、存档与界面的独立安装器。 */
var installBackpackSystem_97b6d981_3a73_47b8_ba94_2315c62f5658 = function (core, plugin) {
	"use strict";
	return (function () {
	// 背包乱斗的物品摆放层。这里只负责物品实例、占格、拖拽和存档；
	// 属性与战斗结算留给后续系统通过公开 API 读取。
	const CONFIG = {
		// 修改这里即可调整背包初始尺寸和扩展上限。
		// 初始区域会在最大网格内居中；最大行列可分别独立修改。
		initialCols: 8, // 新游戏默认解锁的列数。
		initialRows: 8, // 新游戏默认解锁的行数。
		maxCols: 10, // 背包允许扩展到的最大列数。
		maxRows: 10, // 背包允许扩展到的最大行数。
		maxCellSize: 40, // 单个格子的最大屏幕像素尺寸。
		expansionItemId: "I429", // 解锁一个格子时消耗的地图道具 ID。
		stateFlag: "__backpack_state__", // 保存完整背包状态的勇士 flag 名称。
		attackFlag: "__backpack_attack__", // 缓存已摆放武器总攻击的 flag 名称。
		stateVersion: 5, // v5：武器攻击改为上下限，并加入命中、间隔和奥义获取。
		eventId: "backpack", // 背包界面占用的事件面板 ID。
		sellPrice: 30 // 拖到售卖区出售武器时的固定售价（金币）。
	};
	const uiCommon = backpackUiCommon_2c986f67_7621_44eb_972d_24f1e2c6ce61;

	// state：当前内存中的背包数据；placed 是已摆放实例，inventory 是待摆放实例。
	// unlockedCells 保存已经解锁的 [列, 行] 坐标。
	let state = {
		version: CONFIG.stateVersion,
		placed: [],
		inventory: [],
		unlockedCells: []
	};
	let openedStateSignature = null; // 打开背包时的状态签名，用于判断整理后是否需要写入录像。
	let dragState = null; // 正在拖拽的实例、旋转角、鼠标位置和抓取偏移。
	let instanceSeed = 0; // 同一毫秒创建多个实例时使用的递增序号。
	let root = null; // 背包界面的根 DOM 节点；null 表示界面未打开。
	let bagCanvas = null; // 绘制背景、网格和拖拽合法性提示的画布。
	let bagContext = null; // bagCanvas 对应的 2D 绘图上下文。
	let inventoryPanel = null; // 左侧或上方的待摆放物品面板。
	let expansionLayer = null; // 放置虚线加号扩展按钮的 DOM 图层。
	let synergyLayer = null; // Hover 武器时显示结构化联动范围和方向动画。
	let expansionCountLabel = null; // 工具栏中显示背包格子数量的文字节点。
	let placedLayer = null; // 显示已摆放武器 DOM 元素的图层。
	let dragLayer = null; // 显示当前拖拽物视觉副本的最高层图层。
	let sellZone = null; // 背包右侧的售卖区：拖武器到这里自动出售（固定售价）。
	let gameGroup = null; // 魔塔引擎提供的游戏容器 DOM 节点。
	let layout = null; // 最近一次计算出的自适应尺寸和坐标结果。

	/** 深拷贝背包状态，避免存档对象和界面对象共享引用。 */
	const cloneData = function (data) {
		if (data == null) return data;
		if (core.clone) return core.clone(data);
		return JSON.parse(JSON.stringify(data));
	};

	/** 计算背包摆放布局的紧凑签名，用于判断打开前后是否发生整理。 */
	const buildStateSignature = function () {
		return JSON.stringify([
			state.placed.map(function (entry) {
				return [entry.instanceId, entry.col, entry.row, entry.rotation];
			}),
			state.inventory.map(function (entry) {
				return entry.instanceId;
			}),
			state.unlockedCells
		]);
	};

	/**
	 * 把当前背包状态编码为录像路线中的安全字符串。
	 * 先 URL 编码 JSON，再把裸括号转义为 %28/%29，
	 * 避免 decodeRoute 按第一个 ')' 截断自定义录像动作。
	 */
	const encodeBackpackPayload = function () {
		const snapshot = {
			placed: state.placed.map(function (entry) {
				return {
					instanceId: entry.instanceId,
					weapon: entry.weapon,
					col: entry.col,
					row: entry.row,
					rotation: entry.rotation
				};
			}),
			inventory: state.inventory.map(function (entry) {
				return {
					instanceId: entry.instanceId,
					weapon: entry.weapon,
					rotation: entry.rotation
				};
			}),
			unlockedCells: cloneData(state.unlockedCells)
		};
		return encodeURIComponent(JSON.stringify(snapshot))
			.replace(/\(/g, "%28")
			.replace(/\)/g, "%29");
	};

	/** 校验配置并计算初始可用区域在最大网格中的居中起点。 */
	const getGridConfig = function () {
		const maxCols = Math.max(1, Math.floor(Number(CONFIG.maxCols) || 10));
		const maxRows = Math.max(1, Math.floor(Number(CONFIG.maxRows) || 10));
		const initialCols = Math.min(maxCols, Math.max(1, Math.floor(Number(CONFIG.initialCols) || maxCols)));
		const initialRows = Math.min(maxRows, Math.max(1, Math.floor(Number(CONFIG.initialRows) || maxRows)));
		return {
			maxCols: maxCols,
			maxRows: maxRows,
			initialCols: initialCols,
			initialRows: initialRows,
			initialCol: Math.floor((maxCols - initialCols) / 2),
			initialRow: Math.floor((maxRows - initialRows) / 2)
		};
	};

	/** 把列、行坐标转为可用于对象去重的稳定字符串。 */
	const cellKey = function (col, row) {
		return Math.floor(Number(col)) + "," + Math.floor(Number(row));
	};

	/** 过滤越界/重复坐标，并按从上到下、从左到右排序。 */
	const normalizeUnlockedCells = function (cells) {
		const grid = getGridConfig();
		const used = {};
		const result = [];
		(cells || []).forEach(function (cell) {
			if (!Array.isArray(cell) || cell.length < 2) return;
			const col = Math.floor(Number(cell[0]));
			const row = Math.floor(Number(cell[1]));
			if (!Number.isFinite(col) || !Number.isFinite(row)
				|| col < 0 || row < 0 || col >= grid.maxCols || row >= grid.maxRows) return;
			const key = cellKey(col, row);
			if (used[key]) return;
			used[key] = true;
			result.push([col, row]);
		});
		return result.sort(function (a, b) { return a[1] - b[1] || a[0] - b[0]; });
	};

	/** 生成新游戏默认解锁的居中矩形格子列表。 */
	const getInitialUnlockedCells = function () {
		const grid = getGridConfig();
		const cells = [];
		for (let row = grid.initialRow; row < grid.initialRow + grid.initialRows; row++) {
			for (let col = grid.initialCol; col < grid.initialCol + grid.initialCols; col++) {
				cells.push([col, row]);
			}
		}
		return cells;
	};

	/** 生成最大网格内的全部坐标，专门用于旧存档容量迁移。 */
	const getAllGridCells = function () {
		const grid = getGridConfig();
		const cells = [];
		for (let row = 0; row < grid.maxRows; row++) {
			for (let col = 0; col < grid.maxCols; col++) cells.push([col, row]);
		}
		return cells;
	};

	/** 判断指定坐标当前是否允许摆放武器。 */
	const isCellUnlocked = function (col, row) {
		const key = cellKey(col, row);
		return state.unlockedCells.some(function (cell) {
			return cellKey(cell[0], cell[1]) === key;
		});
	};

	/** 判断锁定格是否紧邻可用区、应显示为可点击的扩展槽。 */
	const isExpansionCell = function (col, row) {
		const grid = getGridConfig();
		if (col < 0 || row < 0 || col >= grid.maxCols || row >= grid.maxRows
			|| isCellUnlocked(col, row)) return false;
		for (let dy = -1; dy <= 1; dy++) {
			for (let dx = -1; dx <= 1; dx++) {
				if ((dx || dy) && isCellUnlocked(col + dx, row + dy)) return true;
			}
		}
		return false;
	};

	/**
	 * 获取独立武器系统命名空间。延迟读取可避免插件初始化顺序造成空引用。
	 * @returns {object} 武器定义、旋转和联动计算 API。
	 */
	const getWeaponSystem = function () {
		const weaponSystemApi = core.plugin && core.plugin.weaponSystem;
		if (!weaponSystemApi) throw new Error("武器系统插件尚未初始化");
		return weaponSystemApi;
	};

	/** 从独立武器系统读取指定地图道具对应的完整中央定义。 */
	const getWeaponDefinition = function (itemId) {
		return getWeaponSystem().getDefinition(itemId);
	};
	/** 为每一次武器拾取创建不会与已有实例重复的 ID。 */
	const makeInstanceId = function () {
		instanceSeed++;
		return "backpack_" + Date.now().toString(36) + "_" + instanceSeed.toString(36);
	};

	/** 把角度吸附为武器系统支持的四种旋转角。 */
	const normalizeRotation = function (rotation) {
		return getWeaponSystem().normalizeRotation(rotation);
	};

	/** 通过武器系统校验并统一武器定义。 */
	const normalizeWeapon = function (weaponDefinition) {
		return getWeaponSystem().normalizeWeapon(weaponDefinition);
	};

	/** 获取武器旋转后的相对占格，用于碰撞和拖拽预览。 */
	const getRotatedCells = function (weaponDefinition, rotation) {
		return getWeaponSystem().getRotatedCells(weaponDefinition, rotation);
	};

	/** 获取武器旋转后的宽、高和占格集合。 */
	const getBounds = function (weaponDefinition, rotation) {
		return getWeaponSystem().getBounds(weaponDefinition, rotation);
	};

	/**
	 * 把存档或外部输入规范化为背包实例。placed=true 时还会校验列、行坐标。
	 * 旧存档中的武器会用中央定义表中的最新配置自动迁移。
	 */
	const normalizeEntry = function (entry, placed) {
		if (!entry || typeof entry !== "object") return null;
		let weapon = normalizeWeapon(entry.weapon || entry);
		if (!weapon) return null;
		// 已注册的地图道具以中央武器定义为准；修改任何属性后旧存档也会自动迁移。
		const latestWeaponDefinition = weapon.sourceItemId
			? getWeaponDefinition(weapon.sourceItemId)
			: null;
		if (latestWeaponDefinition) {
			weapon = normalizeWeapon(Object.assign(
				latestWeaponDefinition,
				{ sourceItemId: weapon.sourceItemId }
			));
		}
		const result = {
			instanceId: String(entry.instanceId || makeInstanceId()),
			weapon: weapon,
			rotation: normalizeRotation(entry.rotation)
		};
		if (placed) {
			result.col = Math.floor(Number(entry.col));
			result.row = Math.floor(Number(entry.row));
			if (!Number.isFinite(result.col) || !Number.isFinite(result.row)) return null;
		}
		return result;
	};

	/** 把武器实例的位置和旋转交给武器系统，换算成背包绝对格子。 */
	const occupiedCells = function (weaponEntry, column, row, rotation) {
		return getWeaponSystem().getOccupiedCells(weaponEntry, column, row, rotation);
	};

	/**
	 * 检查一个实例能否放在指定位置：所有占格必须在上限内、已经解锁且不与其他实例重叠。
	 * excludeInstanceId 用于移动现有实例时忽略它自己原来的占格。
	 */
	const canPlace = function (entry, col, row, rotation, excludeInstanceId) {
		const grid = getGridConfig();
		const cells = occupiedCells(entry, col, row, rotation);
		const inBag = cells.every(function (cell) {
			return cell[0] >= 0 && cell[1] >= 0
				&& cell[0] < grid.maxCols && cell[1] < grid.maxRows
				&& isCellUnlocked(cell[0], cell[1]);
		});
		if (!inBag) return false;
		const wanted = {};
		cells.forEach(function (cell) { wanted[cell[0] + "," + cell[1]] = true; });
		return !state.placed.some(function (placed) {
			if (placed.instanceId === excludeInstanceId) return false;
			return occupiedCells(placed).some(function (cell) {
				return wanted[cell[0] + "," + cell[1]];
			});
		});
	};

	/** 按旋转候选和从上到下、从左到右的顺序寻找第一个合法摆放位置。 */
	const findFirstFit = function (entry, rotations) {
		const grid = getGridConfig();
		rotations = rotations || [
			entry.rotation,
			entry.rotation + 90,
			entry.rotation + 180,
			entry.rotation + 270
		];
		const tested = {};
		for (let index = 0; index < rotations.length; index++) {
			const rotation = normalizeRotation(rotations[index]);
			if (tested[rotation]) continue;
			tested[rotation] = true;
			for (let row = 0; row < grid.maxRows; row++) {
				for (let col = 0; col < grid.maxCols; col++) {
					if (canPlace(entry, col, row, rotation, entry.instanceId)) {
						return { col: col, row: row, rotation: rotation };
					}
				}
			}
		}
		return null;
	};

	/**
	 * 从勇士 flag 读取背包存档，迁移旧版本，并把失效/越界的已摆放实例安全送回库存。
	 * @returns {object} 已写入内存的最新 state。
	 */
	const readState = function () {
		const raw = core.getFlag(CONFIG.stateFlag, null);
		const next = {
			version: CONFIG.stateVersion,
			placed: [],
			inventory: [],
			unlockedCells: []
		};
		const ids = {};
		const initialCells = getInitialUnlockedCells();
		if (raw && typeof raw === "object") {
			// v3 及更早版本没有格子解锁数据：保留旧存档在新上限内的已有容量。
			const storedCells = Number(raw.version) >= 4 && Array.isArray(raw.unlockedCells)
				? raw.unlockedCells
				: getAllGridCells();
			next.unlockedCells = normalizeUnlockedCells(storedCells.concat(initialCells));
		} else {
			next.unlockedCells = normalizeUnlockedCells(initialCells);
		}
		state = next;
		if (raw && typeof raw === "object") {
			(raw.placed || []).forEach(function (source) {
				const entry = normalizeEntry(source, true);
				if (!entry || ids[entry.instanceId]) return;
				ids[entry.instanceId] = true;
				if (canPlace(entry, entry.col, entry.row, entry.rotation, entry.instanceId)) {
					next.placed.push(entry);
				} else {
					delete entry.col;
					delete entry.row;
					next.inventory.push(entry);
				}
			});
			(raw.inventory || []).forEach(function (source) {
				const entry = normalizeEntry(source, false);
				if (!entry || ids[entry.instanceId]) return;
				ids[entry.instanceId] = true;
				next.inventory.push(entry);
			});
		}
		return next;
	};

	/** 保存背包状态，并同步缓存已摆放武器的最终总攻击。 */
	const persistState = function () {
		if (!core.status.hero || !core.status.hero.flags) return;
		core.setFlag(CONFIG.stateFlag, {
			version: CONFIG.stateVersion,
			placed: cloneData(state.placed),
			inventory: cloneData(state.inventory),
			unlockedCells: cloneData(state.unlockedCells)
		});
		const calculated = calculateBackpackAttributes();
		core.setFlag(CONFIG.attackFlag, {
			version: CONFIG.stateVersion,
			totalAttack: calculated.totalAttack,
			placedCount: calculated.entries.length
		});
		if (core.plugin && typeof core.plugin.onBackpackBattleLayoutChanged === "function") {
			core.plugin.onBackpackBattleLayoutChanged();
		}
	};

	/** 返回已摆放和待摆放实例组成的新数组，不改变两个原数组。 */
	const getAllEntries = function () {
		return state.placed.concat(state.inventory);
	};

	/** 按唯一实例 ID 查找武器；找不到时返回 null。 */
	const findEntry = function (instanceId) {
		return getAllEntries().find(function (entry) {
			return entry.instanceId === instanceId;
		}) || null;
	};

	/** 从已摆放区和库存区同时移除指定实例，供移动和删除流程复用。 */
	const removeEntryFromLists = function (instanceId) {
		state.placed = state.placed.filter(function (entry) {
			return entry.instanceId !== instanceId;
		});
		state.inventory = state.inventory.filter(function (entry) {
			return entry.instanceId !== instanceId;
		});
	};

	/** 返回一个背包实例的武器类型，供卡片和提示文本显示。 */
	const getWeaponTypes = function (weaponEntry) {
		return getWeaponSystem().getWeaponTypes(weaponEntry);
	};

	/** 以紧凑文本显示整数或小数，空值显示破折号。 */
	const formatWeaponNumber = function (value, suffix) {
		if (value == null || !Number.isFinite(Number(value))) return "—";
		const number = Number(value);
		const text = Number.isInteger(number) ? String(number) : String(Math.round(number * 100) / 100);
		return text + (suffix || "");
	};

	/** 显示伤害区间，例如 10~15；无攻击属性时显示破折号。 */
	const formatWeaponDamage = function (weaponDefinition) {
		const range = getWeaponSystem().getDamageRange(weaponDefinition);
		if (range.minAttack == null || range.maxAttack == null) return "—";
		return formatWeaponNumber(range.minAttack) + "~" + formatWeaponNumber(range.maxAttack);
	};

	/** 显示工作表中的 0~1 命中率。 */
	const formatWeaponHitRate = function (hitRate) {
		if (hitRate == null || !Number.isFinite(Number(hitRate))) return "—";
		return formatWeaponNumber(Number(hitRate) * 100, "%");
	};

	/** 汇总一把武器从工作表取得的四组战斗数值。 */
	const formatWeaponCombatStats = function (weaponDefinition) {
		return "伤害 " + formatWeaponDamage(weaponDefinition)
			+ " · 命中 " + formatWeaponHitRate(weaponDefinition.hitRate)
			+ " · 间隔 " + formatWeaponNumber(weaponDefinition.attackInterval, "秒")
			+ " · 奥义 " + formatWeaponNumber(weaponDefinition.ultimateGain);
	};

	/**
	 * 将当前已摆放实例交给独立武器系统计算属性与联动。
	 * 背包只提供实例和坐标，不再包含任何武器规则实现。
	 */
	const calculateBackpackAttributes = function (options) {
		return getWeaponSystem().calculateAttributes(state.placed, options);
	};

	/**
	 * 返回已摆放武器的最终总攻击。普通布局优先读取缓存；refresh 或战斗上下文会重新计算。
	 */
	const getBackpackAttack = function (options) {
		options = options || {};
		const hasCustomContext = options.context && Object.keys(options.context).length > 0;
		if (!options.refresh && !hasCustomContext) {
			const cached = core.getFlag(CONFIG.attackFlag, null);
			if (cached && cached.version === CONFIG.stateVersion && Number.isFinite(Number(cached.totalAttack))) {
				return Math.max(0, Number(cached.totalAttack));
			}
		}
		readState();
		const calculated = calculateBackpackAttributes(options);
		if (!hasCustomContext && core.status.hero && core.status.hero.flags) {
			core.setFlag(CONFIG.attackFlag, {
				version: CONFIG.stateVersion,
				totalAttack: calculated.totalAttack,
				placedCount: calculated.entries.length
			});
		}
		return calculated.totalAttack;
	};

	/** 把浏览器窗口坐标换算为背包根节点内部坐标。 */
	const pointToLocal = function (clientX, clientY) {
		const rect = root.getBoundingClientRect();
		return {
			x: (clientX - rect.left) * (root.clientWidth / rect.width),
			y: (clientY - rect.top) * (root.clientHeight / rect.height)
		};
	};

	/** 把数值四舍五入并转换成可写入 DOM style 的像素字符串。 */
	const px = function (value) {
		return Math.round(value) + "px";
	};

	/**
	 * 根据当前窗口宽高计算桌面/紧凑布局、库存面板位置、格子尺寸和网格原点。
	 * 计算结果写入 layout，后续所有绘制和命中检测共用同一坐标系。
	 */
	const computeLayout = function () {
		const grid = getGridConfig();
		const rect = root.getBoundingClientRect();
		const width = root.clientWidth || rect.width;
		const height = root.clientHeight || rect.height;
		const scale = rect.width ? width / rect.width : 1;
		const compact = rect.width < 620;
		const toolbarHeight = 46 * scale;
		let panelBox; // 库存面板的 left/top/width/height。
		let cellSize; // 根据可用空间缩放后的单格像素尺寸（不含格间缝隙）。
		let bagX; // 最大背包网格左上角的横坐标。
		let bagY; // 最大背包网格左上角的纵坐标。
		let availWidth; // 网格可用横向空间（不含面板/边距）。
		let availHeight; // 网格可用纵向空间。

		if (compact) {
			const panelHeight = 104 * scale;
			const availableHeight = Math.max(80 * scale, height - toolbarHeight - panelHeight - 22 * scale);
			availWidth = width - 18 * scale;
			availHeight = availableHeight;
			cellSize = Math.min(
				CONFIG.maxCellSize * scale,
				availWidth / grid.maxCols,
				availHeight / grid.maxRows
			);
			panelBox = {
				left: 8 * scale,
				top: toolbarHeight,
				width: width - 16 * scale,
				height: panelHeight - 6 * scale
			};
		} else {
			const panelWidth = 148 * scale;
			availWidth = width - panelWidth - 30 * scale;
			availHeight = height - toolbarHeight - 20 * scale;
			cellSize = Math.min(
				CONFIG.maxCellSize * scale,
				availWidth / grid.maxCols,
				availHeight / grid.maxRows
			);
			panelBox = {
				left: 8 * scale,
				top: toolbarHeight,
				width: panelWidth - 14 * scale,
				height: height - toolbarHeight - 8 * scale
			};
		}

		cellSize = Math.max(8, Math.floor(cellSize));
		// 格间缝隙：cellSize 的约 6%（至少 1px）。缝隙只用于格子定位，不参与武器尺寸/缩放计算
		//（武器仍按 cellSize 计算，1×1 武器只占 1 格内，4×4 武器只占 4×4 格内，不会扩大到缝隙）。
		const gap = Math.max(2, Math.round(cellSize * 0.1));
		// 含缝总尺寸超可用空间时缩小格子（缝隙固定），保证网格整体不溢出。
		cellSize = Math.max(8, Math.min(
			cellSize,
			Math.floor((availWidth - (grid.maxCols - 1) * gap) / grid.maxCols),
			Math.floor((availHeight - (grid.maxRows - 1) * gap) / grid.maxRows)
		));
		const step = cellSize + gap; // 相邻格子中心距（格距，含缝）。
		const totalWidth = grid.maxCols * cellSize + (grid.maxCols - 1) * gap;
		const totalHeight = grid.maxRows * cellSize + (grid.maxRows - 1) * gap;
		if (compact) {
			bagX = (width - totalWidth) / 2;
			bagY = toolbarHeight + 104 * scale + 10 * scale;
		} else {
			const panelWidth = 148 * scale;
			bagX = panelWidth + (width - panelWidth - totalWidth) / 2;
			bagY = toolbarHeight + (height - toolbarHeight - totalHeight) / 2;
		}

		layout = {
			width: width,
			height: height,
			scale: scale,
			compact: compact,
			cellSize: cellSize,
			gap: gap,
			step: step,
			bagX: bagX,
			bagY: bagY,
			bagWidth: totalWidth,
			bagHeight: totalHeight,
			panel: panelBox
		};
	};

	/**
	 * 创建武器 DOM 元素：按裁剪参数显示素材、应用旋转，并为每个占格添加轮廓。
	 * cellSize 为单格净尺寸；gap 为格间缝隙（可选，默认按 cellSize 的 10% 派生，与 computeLayout 一致）。
	 * 内部只使用本函数传入的 cellSize/gap，不再引用 layout.step/layout.gap——
	 * 这样库存小预览（previewCell）与背包网格大尺寸都能正确对齐占格，不会出现间距过宽/位置偏移。
	 */
	const createWeaponElement = function (weapon, rotation, cellSize, gap) {
		if (gap == null) gap = Math.max(2, Math.round(cellSize * 0.1));
		const bounds = getBounds(weapon, rotation);
		const element = document.createElement("div");
		element.className = "backpack-weapon";
		// 武器尺寸含内部格缝（N 格 = N×cellSize + (N-1)×gap），铺满占格区域但不越出边界；
		// 长条武器（如 1×3）沿长度方向延伸缝隙变长、宽度方向保持单格变窄。
		const spanW = function (n) { return n * cellSize + (n - 1) * gap; };
		const step = cellSize + gap;
		element.style.width = px(spanW(bounds.cols));
		element.style.height = px(spanW(bounds.rows));

		const baseBounds = getBounds(weapon, 0);
		const imageFrame = document.createElement("div");
		imageFrame.className = "backpack-image-frame";
		imageFrame.style.width = px(spanW(baseBounds.cols));
		imageFrame.style.height = px(spanW(baseBounds.rows));
		imageFrame.style.transformOrigin = "0 0";

		const image = document.createElement("img");
		image.draggable = false;
		image.alt = weapon.name;
		image.src = weapon.image;
		const crop = weapon.imageCrop;
		if (Array.isArray(crop) && crop.length >= 6 && crop[2] > 0 && crop[3] > 0) {
			const scaleX = spanW(baseBounds.cols) / crop[2];
			const scaleY = spanW(baseBounds.rows) / crop[3];
			image.style.width = px(crop[4] * scaleX);
			image.style.height = px(crop[5] * scaleY);
			image.style.left = px(-crop[0] * scaleX);
			image.style.top = px(-crop[1] * scaleY);
		} else {
			image.style.width = px(spanW(baseBounds.cols));
			image.style.height = px(spanW(baseBounds.rows));
		}
		imageFrame.appendChild(image);

		const normalized = normalizeRotation(rotation);
		if (normalized === 90) {
			imageFrame.style.left = px(spanW(bounds.cols));
			imageFrame.style.transform = "rotate(90deg)";
		} else if (normalized === 180) {
			imageFrame.style.left = px(spanW(bounds.cols));
			imageFrame.style.top = px(spanW(bounds.rows));
			imageFrame.style.transform = "rotate(180deg)";
		} else if (normalized === 270) {
			imageFrame.style.top = px(spanW(bounds.rows));
			imageFrame.style.transform = "rotate(270deg)";
		}
		element.appendChild(imageFrame);

		bounds.cells.forEach(function (cell) {
			// 占格轮廓/命中热区按本函数的格距（step）定位、按格子净尺寸（cellSize）显示：与背景格对齐。
			const outline = document.createElement("span");
			outline.className = "backpack-cell-outline";
			outline.style.left = px(cell[0] * step);
			outline.style.top = px(cell[1] * step);
			outline.style.width = px(cellSize);
			outline.style.height = px(cellSize);
			element.appendChild(outline);

			const hitCell = document.createElement("span");
			hitCell.className = "backpack-cell-hit";
			hitCell.style.left = px(cell[0] * step);
			hitCell.style.top = px(cell[1] * step);
			hitCell.style.width = px(cellSize);
			hitCell.style.height = px(cellSize);
			element.appendChild(hitCell);
		});
		return element;
	};

	/** 绘制背包背景、已解锁网格、拖拽合法性颜色和底部操作说明。 */
	const drawBag = function () {
		if (!bagContext || !layout) return;
		const grid = getGridConfig();
		bagContext.clearRect(0, 0, layout.width, layout.height);
		bagContext.fillStyle = "#241812";
		bagContext.fillRect(0, 0, layout.width, layout.height);

		bagContext.fillStyle = "#34241b";
		bagContext.fillRect(
			layout.bagX - 5 * layout.scale,
			layout.bagY - 5 * layout.scale,
			layout.bagWidth + 10 * layout.scale,
			layout.bagHeight + 10 * layout.scale
		);
		for (let row = 0; row < grid.maxRows; row++) {
			for (let col = 0; col < grid.maxCols; col++) {
				if (!isCellUnlocked(col, row)) continue;
				// 格子按格距（step = cellSize + gap）定位，尺寸仍为 cellSize，格间自然留出缝隙。
				const x = layout.bagX + col * layout.step;
				const y = layout.bagY + row * layout.step;
				bagContext.fillStyle = (row + col) % 2 ? "#4a4038" : "#51463d";
				bagContext.fillRect(x, y, layout.cellSize, layout.cellSize);
				bagContext.strokeStyle = "#80684f";
				bagContext.lineWidth = Math.max(1, layout.scale);
				bagContext.strokeRect(x, y, layout.cellSize, layout.cellSize);
			}
		}

		if (dragState) {
			const target = getDragTarget();
			if (target.inBag) {
				const entry = findEntry(dragState.instanceId);
				if (entry) {
					const cells = occupiedCells(entry, target.col, target.row, dragState.rotation);
					bagContext.fillStyle = target.valid
						? "rgba(74, 222, 128, 0.42)"
						: "rgba(248, 113, 113, 0.48)";
					cells.forEach(function (cell) {
						bagContext.fillRect(
							layout.bagX + cell[0] * layout.step,
							layout.bagY + cell[1] * layout.step,
							layout.cellSize,
							layout.cellSize
						);
					});
				}
			}
		}

		bagContext.fillStyle = "#d8c7ac";
		bagContext.font = px(13 * layout.scale) + " sans-serif";
		bagContext.textAlign = "center";
		bagContext.fillText(
			"拖动物品摆放 · 点击虚线 + 格扩容 · 拖拽时按 R 旋转",
			layout.bagX + layout.bagWidth / 2,
			Math.min(layout.height - 5 * layout.scale, layout.bagY + layout.bagHeight + 18 * layout.scale)
		);
	};

	/** 清空当前武器的联动范围提示。 */
	const clearSynergyHighlights = function () {
		if (synergyLayer) synergyLayer.innerHTML = "";
	};

	/** 按武器规则在背包格上绘制带方向的箭头条纹动画。 */
	const renderSynergyHighlights = function (entry) {
		clearSynergyHighlights();
		if (!entry || !synergyLayer || !layout) return;
		const grid = getGridConfig();
		getWeaponSystem().getSynergyCells(entry).forEach(function (affectedCell) {
			if (affectedCell.col < 0 || affectedCell.row < 0
				|| affectedCell.col >= grid.maxCols || affectedCell.row >= grid.maxRows
				|| !isCellUnlocked(affectedCell.col, affectedCell.row)) return;
			const cell = document.createElement("span");
			cell.className = "backpack-synergy-cell";
			cell.style.left = px(layout.bagX + affectedCell.col * layout.step);
			cell.style.top = px(layout.bagY + affectedCell.row * layout.step);
			cell.style.width = px(layout.cellSize);
			cell.style.height = px(layout.cellSize);
			cell.setAttribute("aria-hidden", "true");
			const arrowDirections = affectedCell.arrowDirections && affectedCell.arrowDirections.length
				? affectedCell.arrowDirections
				: (affectedCell.directions || ["right"]);
			arrowDirections.forEach(function (direction) {
				const arrows = document.createElement("i");
				arrows.className = "backpack-synergy-arrows direction-" + direction;
				cell.appendChild(arrows);
			});
			synergyLayer.appendChild(cell);
		});
	};

	/** 返回勇士当前持有的“背包格子”消耗品数量。 */
	const getExpansionItemCount = function () {
		return core.itemCount ? Math.max(0, Number(core.itemCount(CONFIG.expansionItemId)) || 0) : 0;
	};

	/**
	 * 消耗一个扩容道具并解锁指定候选格。失败时不修改道具或存档。
	 * @returns {boolean} 是否成功完成解锁。
	 */
	const unlockBackpackCell = function (col, row) {
		col = Math.floor(Number(col));
		row = Math.floor(Number(row));
		if (!isExpansionCell(col, row)) return false;
		if (getExpansionItemCount() <= 0) {
			if (core.playSound) core.playSound("操作失败");
			if (core.drawTip) core.drawTip("需要一个背包格子才能解锁", CONFIG.expansionItemId);
			return false;
		}
		if (!core.removeItem || !core.removeItem(CONFIG.expansionItemId, 1)) return false;
		state.unlockedCells = normalizeUnlockedCells(state.unlockedCells.concat([[col, row]]));
		persistState();
		renderAll();
		if (core.playSound) core.playSound("打开界面");
		if (core.drawTip) {
			core.drawTip("背包格子已解锁，剩余 " + getExpansionItemCount() + " 个", CONFIG.expansionItemId);
		}
		return true;
	};

	/** 重建所有可扩展格的虚线加号按钮，并刷新工具栏中的道具数量。 */
	const renderExpansionSlots = function () {
		if (!expansionLayer || !layout) return;
		const grid = getGridConfig();
		expansionLayer.innerHTML = "";
		if (expansionCountLabel) {
			expansionCountLabel.textContent = "背包格子 × " + getExpansionItemCount();
		}
		for (let row = 0; row < grid.maxRows; row++) {
			for (let col = 0; col < grid.maxCols; col++) {
				if (!isExpansionCell(col, row)) continue;
				const slot = document.createElement("button");
				slot.type = "button";
				slot.className = "backpack-expansion-slot";
				slot.textContent = "+";
				slot.title = "消耗 1 个背包格子解锁此位置";
				slot.style.left = px(layout.bagX + col * layout.step);
				slot.style.top = px(layout.bagY + row * layout.step);
				slot.style.width = px(layout.cellSize);
				slot.style.height = px(layout.cellSize);
				slot.style.fontSize = px(Math.max(13, layout.cellSize * 0.58));
				slot.addEventListener("pointerdown", function (event) {
					event.stopPropagation();
				});
				slot.addEventListener("click", function (event) {
					event.preventDefault();
					event.stopPropagation();
					unlockBackpackCell(col, row);
				});
				expansionLayer.appendChild(slot);
			}
		}
	};

	/** 重建已摆放武器图层，并显示计算后的伤害区间、命中、间隔、奥义和联动提示。 */
	const renderPlaced = function () {
		if (!placedLayer || !layout) return;
		clearSynergyHighlights();
		placedLayer.innerHTML = "";
		const calculated = calculateBackpackAttributes();
		state.placed.forEach(function (entry) {
			const element = createWeaponElement(entry.weapon, entry.rotation, layout.cellSize, layout.gap);
			element.classList.add("backpack-placed");
			element.dataset.instanceId = entry.instanceId;
			element.dataset.rarity = entry.weapon.rarity == null ? "0" : String(entry.weapon.rarity);
			element.tabIndex = 0;
			const attributes = calculated.byInstanceId[entry.instanceId];
			element.style.left = px(layout.bagX + entry.col * layout.step);
			element.style.top = px(layout.bagY + entry.row * layout.step);
			uiCommon.bindTooltip(element, function () {
				return uiCommon.buildWeaponTooltip({
					weapon: entry.weapon,
					base: entry.weapon,
					current: attributes || entry.weapon
				});
			}, {
				hitTargets: element.querySelectorAll(".backpack-cell-hit"),
				onEnter: function () { renderSynergyHighlights(entry); },
				onLeave: clearSynergyHighlights
			});
			element.addEventListener("pointerdown", function (event) {
				clearSynergyHighlights();
				startPointerDrag(event, entry.instanceId, "placed", element);
			});
			element.addEventListener("contextmenu", function (event) {
				event.preventDefault();
				rotatePlaced(entry.instanceId);
			});
			placedLayer.appendChild(element);
		});
	};

	/** 重建待摆放库存卡片；桌面纵向排列，窄屏横向排列。 */
	const renderInventory = function () {
		if (!inventoryPanel || !layout) return;
		inventoryPanel.innerHTML = "";
		inventoryPanel.style.left = px(layout.panel.left);
		inventoryPanel.style.top = px(layout.panel.top);
		inventoryPanel.style.width = px(layout.panel.width);
		inventoryPanel.style.height = px(layout.panel.height);
		inventoryPanel.style.flexDirection = layout.compact ? "row" : "column";

		if (!state.inventory.length) {
			const empty = document.createElement("div");
			empty.className = "backpack-empty";
			empty.textContent = state.placed.length ? "没有待摆放物品" : "背包中还没有物品";
			inventoryPanel.appendChild(empty);
			return;
		}

		state.inventory.forEach(function (entry) {
			const card = document.createElement("div");
			card.className = "backpack-card";
			card.tabIndex = 0;
			card.dataset.rarity = entry.weapon.rarity == null ? "0" : String(entry.weapon.rarity);
			uiCommon.bindTooltip(card, function () {
				return uiCommon.buildWeaponTooltip({
					weapon: entry.weapon,
					base: entry.weapon,
					current: entry.weapon
				});
			});
			const bounds = getBounds(entry.weapon, entry.rotation);
			const maxWidth = (layout.compact ? 68 : 90) * layout.scale;
			const maxHeight = (layout.compact ? 68 : 105) * layout.scale;
			const previewCell = Math.max(
				5,
				Math.min(layout.cellSize, maxWidth / bounds.cols, maxHeight / bounds.rows)
			);
			const preview = createWeaponElement(entry.weapon, entry.rotation, previewCell);
			preview.classList.add("backpack-preview");
			preview.addEventListener("pointerdown", function (event) {
				startPointerDrag(event, entry.instanceId, "inventory", preview);
			});

			const name = document.createElement("div");
			name.className = "backpack-card-name";
			name.textContent = entry.weapon.name;
			const rarity = document.createElement("div");
			rarity.className = "backpack-card-rarity";
			rarity.textContent = entry.weapon.rarity == null
				? "未定稀有度"
				: new Array(Math.max(0, Math.min(5, Number(entry.weapon.rarity))) + 1).join("★");

			const rotate = document.createElement("button");
			rotate.className = "backpack-mini-button";
			rotate.textContent = "旋转";
			rotate.addEventListener("pointerdown", function (event) {
				event.stopPropagation();
			});
			rotate.addEventListener("click", function () {
				entry.rotation = normalizeRotation(entry.rotation + 90);
				persistState();
				renderAll();
			});

			card.appendChild(preview);
			card.appendChild(name);
			card.appendChild(rarity);
			card.appendChild(rotate);
			inventoryPanel.appendChild(card);
		});
	};

	/** 统一执行尺寸计算、画布绘制、扩展槽、已摆放区和库存区渲染。 */
	const renderAll = function () {
		if (!root) return;
		computeLayout();
		bagCanvas.width = layout.width;
		bagCanvas.height = layout.height;
		drawBag();
		renderExpansionSlots();
		renderPlaced();
		renderInventory();
		if (dragState) updateDragElement();
	};

	/** 判断背包内部坐标是否落在库存面板范围内。 */
	const isPointInInventory = function (point) {
		if (!layout) return false;
		const panel = layout.panel;
		return point.x >= panel.left && point.x <= panel.left + panel.width
			&& point.y >= panel.top && point.y <= panel.top + panel.height;
	};

	/** 根据拖拽物左上角计算目标列行，并返回是否进入网格以及能否合法放置。 */
	const getDragTarget = function () {
		if (!dragState || !layout) return { inBag: false, valid: false };
		const left = dragState.point.x - dragState.offsetX;
		const top = dragState.point.y - dragState.offsetY;
		const col = Math.round((left - layout.bagX) / layout.step);
		const row = Math.round((top - layout.bagY) / layout.step);
		const entry = findEntry(dragState.instanceId);
		if (!entry) return { inBag: false, valid: false };
		const bounds = getBounds(entry.weapon, dragState.rotation);
		const inBag = left + (bounds.cols * layout.cellSize + (bounds.cols - 1) * layout.gap) >= layout.bagX
			&& top + (bounds.rows * layout.cellSize + (bounds.rows - 1) * layout.gap) >= layout.bagY
			&& left <= layout.bagX + layout.bagWidth
			&& top <= layout.bagY + layout.bagHeight;
		return {
			inBag: inBag,
			col: col,
			row: row,
			valid: inBag && canPlace(entry, col, row, dragState.rotation, entry.instanceId)
		};
	};

	/** 创建当前拖拽物的视觉副本，并按鼠标抓取比例重新计算偏移。 */
	const createDragElement = function () {
		if (!dragState || !dragLayer) return;
		dragLayer.innerHTML = "";
		const entry = findEntry(dragState.instanceId);
		if (!entry) return;
		const element = createWeaponElement(entry.weapon, dragState.rotation, layout.cellSize, layout.gap);
		element.classList.add("backpack-dragging");
		dragLayer.appendChild(element);
		dragState.element = element;
		const bounds = getBounds(entry.weapon, dragState.rotation);
		dragState.offsetX = dragState.gripX * (bounds.cols * layout.cellSize + (bounds.cols - 1) * layout.gap);
		dragState.offsetY = dragState.gripY * (bounds.rows * layout.cellSize + (bounds.rows - 1) * layout.gap);
		updateDragElement();
	};

	/** 让拖拽视觉副本跟随最新指针位置。 */
	const updateDragElement = function () {
		if (!dragState || !dragState.element) return;
		dragState.element.style.left = px(dragState.point.x - dragState.offsetX);
		dragState.element.style.top = px(dragState.point.y - dragState.offsetY);
	};

	/**
	 * 从已摆放区或库存区开始一次指针拖拽，并记录抓取点在元素内部的比例。
	 */
	const startPointerDrag = function (event, instanceId, source, sourceElement) {
		if (event.pointerType === "mouse" && event.button !== 0) return;
		uiCommon.hideTooltip();
		event.preventDefault();
		event.stopPropagation();
		const rect = sourceElement.getBoundingClientRect();
		const point = pointToLocal(event.clientX, event.clientY);
		dragState = {
			instanceId: instanceId,
			source: source,
			rotation: findEntry(instanceId).rotation,
			point: point,
			gripX: rect.width ? (event.clientX - rect.left) / rect.width : 0.5,
			gripY: rect.height ? (event.clientY - rect.top) / rect.height : 0.5,
			offsetX: 0,
			offsetY: 0,
			element: null
		};
		createDragElement();
		drawBag();
	};

	/** 把正在拖拽的武器顺时针旋转 90 度并立即刷新预览。 */
	const rotateDrag = function () {
		if (!dragState) return;
		dragState.rotation = normalizeRotation(dragState.rotation + 90);
		createDragElement();
		drawBag();
	};

	/**
	 * 结束拖拽：放到库存、放到合法网格或退回原位；只有状态改变时才写存档。
	 */
	const finishDrag = function (event) {
		if (!dragState) return;
		const point = pointToLocal(event.clientX, event.clientY);
		dragState.point = point;
		const entry = findEntry(dragState.instanceId);
		const target = getDragTarget();
		let changed = false;

		// 拖到售卖区：自动出售（删除武器 + 固定售价金币），不执行后续放置逻辑。
		if (entry && isInSellZone(event.clientX, event.clientY)) {
			const soldName = (entry.weapon && entry.weapon.name) || "武器";
			const instanceId = entry.instanceId;
			dragState = null;
			if (dragLayer) dragLayer.innerHTML = "";
			if (sellZone) sellZone.classList.remove("backpack-sell-zone-active");
			removeBackpackWeapon(instanceId); // 内部完成删除、持久化与界面刷新
			core.status.hero.money = Math.floor(Number(core.status.hero.money) || 0) + CONFIG.sellPrice;
			if (core.updateStatusBar) core.updateStatusBar();
			if (core.drawTip) core.drawTip("已出售：" + soldName + "，+" + CONFIG.sellPrice + " 金币");
			return;
		}

		if (entry && isPointInInventory(point)) {
			if (dragState.source === "placed") {
				removeEntryFromLists(entry.instanceId);
				delete entry.col;
				delete entry.row;
				entry.rotation = dragState.rotation;
				state.inventory.push(entry);
				changed = true;
			} else if (entry.rotation !== dragState.rotation) {
				entry.rotation = dragState.rotation;
				changed = true;
			}
		} else if (entry && target.valid) {
			removeEntryFromLists(entry.instanceId);
			entry.col = target.col;
			entry.row = target.row;
			entry.rotation = dragState.rotation;
			state.placed.push(entry);
			changed = true;
		} else if (core.drawTip) {
			core.drawTip("这里放不下，物品已回到原位");
		}

		dragState = null;
		if (dragLayer) dragLayer.innerHTML = "";
		if (changed) persistState();
		renderAll();
	};

	/** 取消当前拖拽并清除视觉副本，不修改实例位置。 */
	const cancelDrag = function () {
		dragState = null;
		if (dragLayer) dragLayer.innerHTML = "";
		if (sellZone) sellZone.classList.remove("backpack-sell-zone-active");
		drawBag();
	};

	/** 在原位置旋转已摆放武器；旋转后越界或重叠时拒绝操作。 */
	const rotatePlaced = function (instanceId) {
		const entry = state.placed.find(function (item) {
			return item.instanceId === instanceId;
		});
		if (!entry) return false;
		const rotation = normalizeRotation(entry.rotation + 90);
		if (!canPlace(entry, entry.col, entry.row, rotation, entry.instanceId)) {
			if (core.drawTip) core.drawTip("当前位置没有足够空间旋转");
			return false;
		}
		entry.rotation = rotation;
		persistState();
		renderAll();
		return true;
	};

	/** 按占格数量从大到小重新寻找位置，放不下的实例保留在库存。 */
	const autoArrange = function () {
		readState();
		const entries = getAllEntries().sort(function (a, b) {
			return b.weapon.cells.length - a.weapon.cells.length;
		});
		state.placed = [];
		state.inventory = [];
		entries.forEach(function (entry) {
			delete entry.col;
			delete entry.row;
			const fit = findFirstFit(entry);
			if (fit) {
				entry.col = fit.col;
				entry.row = fit.row;
				entry.rotation = fit.rotation;
				state.placed.push(entry);
			} else {
				state.inventory.push(entry);
			}
		});
		persistState();
		renderAll();
		if (core.drawTip) {
			core.drawTip(state.inventory.length ? "已整理，仍有物品放不下" : "背包整理完成");
		}
		return state.inventory.length === 0;
	};

	/** 把所有已摆放实例收回库存，并清除它们的列、行坐标。 */
	const collectAll = function () {
		readState();
		state.placed.forEach(function (entry) {
			delete entry.col;
			delete entry.row;
			state.inventory.push(entry);
		});
		state.placed = [];
		persistState();
		renderAll();
	};

	/** 创建工具栏按钮，并阻止 pointerdown 冒泡到游戏画布。 */
	const createButton = function (text, callback) {
		const button = document.createElement("button");
		button.className = "backpack-button";
		button.textContent = text;
		button.addEventListener("pointerdown", function (event) {
			event.stopPropagation();
		});
		button.addEventListener("click", callback);
		return button;
	};

	/** 创建背包所需 DOM 图层、工具栏和全局事件监听。 */
	const buildInterface = function () {
		gameGroup = document.getElementById("gameGroup");
		if (!gameGroup) return false;

		root = document.createElement("div");
		root.id = "backpack-system-root";

		bagCanvas = document.createElement("canvas");
		bagContext = bagCanvas.getContext("2d");
		root.appendChild(bagCanvas);

		expansionLayer = document.createElement("div");
		expansionLayer.className = "backpack-expansion-layer";
		root.appendChild(expansionLayer);

		placedLayer = document.createElement("div");
		placedLayer.className = "backpack-placed-layer";
		root.appendChild(placedLayer);

		synergyLayer = document.createElement("div");
		synergyLayer.className = "backpack-synergy-layer";
		root.appendChild(synergyLayer);

		inventoryPanel = document.createElement("div");
		inventoryPanel.className = "backpack-inventory";
		root.appendChild(inventoryPanel);

		dragLayer = document.createElement("div");
		dragLayer.className = "backpack-drag-layer";
		root.appendChild(dragLayer);

		// 售卖区：把武器拖到此处自动出售，每把固定 CONFIG.sellPrice 金币。
		sellZone = document.createElement("div");
		sellZone.className = "backpack-sell-zone";
		const sellTitle = document.createElement("div");
		sellTitle.className = "backpack-sell-title";
		sellTitle.textContent = "售卖区";
		const sellHint = document.createElement("div");
		sellHint.className = "backpack-sell-hint";
		sellHint.textContent = "拖武器到这里\n每把 +" + CONFIG.sellPrice + " 金币";
		sellZone.appendChild(sellTitle);
		sellZone.appendChild(sellHint);
		root.appendChild(sellZone);

		const toolbar = document.createElement("div");
		toolbar.className = "backpack-toolbar";
		const title = document.createElement("span");
		title.className = "backpack-toolbar-title";
		title.textContent = "背包";
		toolbar.appendChild(title);
		expansionCountLabel = document.createElement("span");
		expansionCountLabel.className = "backpack-expansion-count";
		toolbar.appendChild(expansionCountLabel);
		toolbar.appendChild(createButton("旋转拖拽物（R）", rotateDrag));
		toolbar.appendChild(createButton("自动整理", autoArrange));
		toolbar.appendChild(createButton("合成", function () {
			// 合成插件方法挂在 core.plugin 顶层（core.plugin.openCraftPanel）。
			const craft = core.plugin;
			if (craft && typeof craft.openCraftPanel === "function") {
				try {
					craft.openCraftPanel();
				} catch (err) {
					if (core.drawTip) core.drawTip("合成面板打开失败：" + (err && err.message ? err.message : "未知错误"));
					console.error("合成面板打开失败", err);
				}
			} else if (core.drawTip) {
				core.drawTip("合成系统未安装，请刷新页面（版本 2.10.15）");
			}
		}));
		toolbar.appendChild(createButton("全部收回", collectAll));
		toolbar.appendChild(createButton("关闭", function () { closeBackpack(); }));
		root.appendChild(toolbar);

		gameGroup.appendChild(root);
		window.addEventListener("resize", renderAll);
		document.addEventListener("pointermove", onPointerMove, true);
		document.addEventListener("pointerup", onPointerUp, true);
		document.addEventListener("pointercancel", onPointerCancel, true);
		document.addEventListener("keydown", onKeyDown, true);
		document.addEventListener("keyup", onKeyUp, true);
		renderAll();
		return true;
	};

	/** 判断页面坐标（clientX/clientY）是否落在售卖区内。 */
	const isInSellZone = function (clientX, clientY) {
		if (!sellZone) return false;
		const rect = sellZone.getBoundingClientRect();
		return clientX >= rect.left && clientX <= rect.right
			&& clientY >= rect.top && clientY <= rect.bottom;
	};

	/** 全局指针移动处理：更新拖拽物位置、目标格颜色和售卖区高亮。 */
	const onPointerMove = function (event) {
		if (!dragState || !root) return;
		event.preventDefault();
		dragState.point = pointToLocal(event.clientX, event.clientY);
		updateDragElement();
		drawBag();
		if (sellZone) sellZone.classList.toggle("backpack-sell-zone-active", isInSellZone(event.clientX, event.clientY));
	};

	/** 全局指针释放处理：提交当前拖拽结果。 */
	const onPointerUp = function (event) {
		if (!dragState || !root) return;
		event.preventDefault();
		event.stopPropagation();
		finishDrag(event);
	};

	/** 浏览器取消指针序列时恢复安全的非拖拽状态。 */
	const onPointerCancel = function () {
		if (dragState) cancelDrag();
	};

	/** 判断键盘事件是否为背包关闭键，同时兼容 key 与旧式 keyCode。 */
	const isBackpackCloseKey = function (event) {
		return event.key === "Escape" || event.key === "x" || event.key === "X"
			|| event.keyCode === 27 || event.keyCode === 88;
	};

	/**
	 * 背包键盘按下处理。关闭动作延迟到 keyup：否则 keydown 关闭并卸载监听后，
	 * 同一次 ESC 的 keyup 会继续到达引擎 body.onkeyup，从而打开系统菜单。
	 */
	const onKeyDown = function (event) {
		if (!root) return;
		if (isBackpackCloseKey(event)) {
			event.preventDefault();
			event.stopImmediatePropagation();
		} else if ((event.key === "r" || event.key === "R") && dragState) {
			event.preventDefault();
			event.stopImmediatePropagation();
			rotateDrag();
		}
	};

	/** 在捕获阶段消费 ESC/X 的 keyup，再关闭背包，避免事件落到系统菜单。 */
	const onKeyUp = function (event) {
		if (!root || !isBackpackCloseKey(event)) return;
		event.preventDefault();
		event.stopImmediatePropagation();
		closeBackpack();
	};

	/**
	 * 打开背包：同步道具实例、保存最新状态、锁定游戏控制并创建界面。
	 * 录像播放中禁止打开，避免产生无法复现的拖拽路线。
	 */
	const openBackpack = function () {
		if (root) return true;
		if (!core.isPlaying || !core.isPlaying()) return false;
		if (core.isReplaying && core.isReplaying()) {
			if (core.drawTip) core.drawTip("录像播放中不能整理背包");
			return false;
		}
		if (core.status.event && core.status.event.id && core.status.event.id !== CONFIG.eventId) {
			core.ui.closePanel();
		}
		syncBackpackItems();
		persistState();
		core.lockControl();
		core.status.event.id = CONFIG.eventId;
		core.status.event.data = null;
		const opened = buildInterface();
		if (opened) openedStateSignature = buildStateSignature();
		return opened;
	};

	/**
	 * 关闭背包并移除全部 DOM/事件监听。keepLocked 用于读档重置时保持引擎锁定状态。
	 */
	const closeBackpack = function (options) {
		options = options || {};
		const wasOpen = !!root;
		// 整理后背包状态与打开前不同时，把关闭时的状态写入录像路线，
		// 保证录像重放时背包布局与录制进程一致。
		const recordStateToReplay = wasOpen
			&& openedStateSignature != null
			&& buildStateSignature() !== openedStateSignature
			&& !(core.isReplaying && core.isReplaying())
			&& (core.isPlaying && core.isPlaying())
			&& core.status.route && Array.isArray(core.status.route);
		openedStateSignature = null;
		uiCommon.hideTooltip();
		cancelDrag();
		window.removeEventListener("resize", renderAll);
		document.removeEventListener("pointermove", onPointerMove, true);
		document.removeEventListener("pointerup", onPointerUp, true);
		document.removeEventListener("pointercancel", onPointerCancel, true);
		document.removeEventListener("keydown", onKeyDown, true);
		document.removeEventListener("keyup", onKeyUp, true);
		if (root) root.remove();
		root = null;
		sellZone = null;
		bagCanvas = null;
		bagContext = null;
		inventoryPanel = null;
		expansionLayer = null;
		expansionCountLabel = null;
		placedLayer = null;
		synergyLayer = null;
		dragLayer = null;
		gameGroup = null;
		layout = null;
		if (core.status.event && core.status.event.id === CONFIG.eventId) {
			core.status.event.id = null;
			core.status.event.data = null;
			core.status.event.selection = null;
			core.status.event.ui = null;
			core.status.event.interval = null;
			if (!options.keepLocked) core.unlockControl();
			if (core.updateStatusBar) core.updateStatusBar(true);
		}
		if (recordStateToReplay) {
			core.status.route.push("backpack:" + encodeBackpackPayload());
		}
		return true;
	};

	/**
	 * 从通用武器定义创建独立实例。autoPlace=true 时自动找位置，否则进入待摆放库存。
	 * uniqueKey 可用于需要全局唯一的特殊物品；普通同类武器默认允许重复。
	 */
	const addBackpackWeapon = function (weapon, options) {
		options = options || {};
		readState();
		const normalized = normalizeWeapon(weapon);
		if (!normalized) {
			if (core.drawTip) core.drawTip("物品形状数据无效");
			return null;
		}
		const uniqueKey = options.uniqueKey || normalized.uniqueKey;
		if (uniqueKey) {
			const existing = getAllEntries().find(function (entry) {
				return entry.weapon.uniqueKey === uniqueKey;
			});
			if (existing) return existing.instanceId;
			normalized.uniqueKey = uniqueKey;
		}
		const entry = {
			instanceId: options.instanceId || makeInstanceId(),
			weapon: normalized,
			rotation: normalizeRotation(options.rotation)
		};
		if (options.autoPlace) {
			const fit = findFirstFit(entry);
			if (fit) {
				entry.col = fit.col;
				entry.row = fit.row;
				entry.rotation = fit.rotation;
				state.placed.push(entry);
			} else {
				state.inventory.push(entry);
			}
		} else {
			state.inventory.push(entry);
		}
		persistState();
		renderAll();
		return entry.instanceId;
	};

	/** 按实例 ID 删除背包武器，并刷新存档和界面。 */
	const removeBackpackWeapon = function (instanceId) {
		readState();
		const exists = !!findEntry(instanceId);
		if (!exists) return false;
		removeEntryFromLists(instanceId);
		persistState();
		renderAll();
		return true;
	};

	/**
	 * 将地图道具引用的中央武器定义转换成独立实例。
	 * 默认不去重：拾取或使用同类武器多次，就会得到多个实例。
	 */
	const addBackpackItem = function (itemId, options) {
		options = options || {};
		const item = core.material.items[itemId];
		const weapon = item && getWeaponDefinition(item.backpackWeaponId || itemId);
		if (!item || !weapon) {
			if (core.drawTip) core.drawTip("该道具没有配置背包物品");
			return null;
		}
		weapon.sourceItemId = itemId;
		const instanceId = addBackpackWeapon(weapon, {
			rotation: options.rotation,
			autoPlace: options.autoPlace,
			uniqueKey: options.uniqueKey
		});
		if (options.open) openBackpack();
		return instanceId;
	};

	/**
	 * 对接旧存档及 core.addItem()：保证道具栏持有数量至少对应同数量的背包实例。
	 * @returns {number} 本次补建的实例数量。
	 */
	const syncBackpackItems = function () {
		readState();
		let added = 0;
		Object.keys(core.material.items || {}).forEach(function (itemId) {
			const item = core.material.items[itemId];
			if (!item || !item.backpackWeaponId) return;
			const sourceWeapon = getWeaponDefinition(item.backpackWeaponId);
			if (!sourceWeapon) return;
			const owned = core.itemCount(itemId);
			const existing = getAllEntries().filter(function (entry) {
				return entry.weapon.sourceItemId === itemId;
			}).length;
			for (let index = existing; index < owned; index++) {
				const weapon = normalizeWeapon(Object.assign(
					sourceWeapon,
					{ sourceItemId: itemId }
				));
				if (!weapon) break;
				state.inventory.push({
					instanceId: makeInstanceId(),
					weapon: weapon,
					rotation: 0
				});
				added++;
			}
		});
		if (added) persistState();
		renderAll();
		return added;
	};

	/** 兼容旧拖拽接口：创建新实例、加入库存并打开背包。 */
	const startDragWeapon = function (weapon, rotation) {
		const normalized = normalizeWeapon(weapon);
		if (!normalized) return null;
		const instanceId = addBackpackWeapon(normalized, {
			rotation: rotation
		});
		openBackpack();
		return instanceId;
	};

	// 公共界面 API：供状态栏道具、事件脚本和读档清理流程调用。
	this.openBackpack = openBackpack;
	this.closeBackpack = closeBackpack;

	// 公共配置对象：可在其他项目脚本中修改最大/初始行列。
	this.backpackConfig = CONFIG;

	/** 修改背包尺寸配置，随后迁移存档并刷新界面。 */
	this.configureBackpackGrid = function (options) {
		options = options || {};
		["maxCols", "maxRows", "initialCols", "initialRows"].forEach(function (key) {
			if (options[key] != null && Number.isFinite(Number(options[key]))) {
				CONFIG[key] = Math.max(1, Math.floor(Number(options[key])));
			}
		});
		readState();
		persistState();
		renderAll();
		return cloneData(getGridConfig());
	};

	/** 返回背包界面当前是否打开。 */
	this.isBackpackOpen = function () { return !!root; };

	/** 返回最新背包存档的安全副本。 */
	this.getBackpackState = function () {
		readState();
		return cloneData(state);
	};

	/** 返回独立武器系统计算后的已摆放武器属性。 */
	this.calculateBackpackAttributes = function (options) {
		readState();
		return cloneData(calculateBackpackAttributes(options));
	};
	// 旧名称兼容：联动计算与属性计算现在是同一个只读入口。
	this.evaluateBackpackSynergies = this.calculateBackpackAttributes;
	// 战斗系统兼容入口：返回背包提供的最终总攻击。
	this.getBackpackAttack = getBackpackAttack;

	/** 返回尺寸、已解锁格和扩容道具数量。 */
	this.getBackpackGridState = function () {
		readState();
		return {
			config: cloneData(getGridConfig()),
			unlockedCells: cloneData(state.unlockedCells),
			expansionItemId: CONFIG.expansionItemId,
			expansionItemCount: getExpansionItemCount()
		};
	};

	/** 公共扩容入口：读取最新状态后尝试消耗道具解锁坐标。 */
	this.unlockBackpackCell = function (col, row) {
		readState();
		return unlockBackpackCell(col, row);
	};

	// 武器伤害始终按单件属性与单件 CD 结算，不修改勇士状态栏攻击力。
	// 公共实例管理 API：分别支持通用定义、地图道具、旧存档同步、删除、整理和旧拖拽。
	this.addBackpackWeapon = addBackpackWeapon;
	this.addBackpackItem = addBackpackItem;
	this.syncBackpackItems = syncBackpackItems;
	this.removeBackpackWeapon = removeBackpackWeapon;
	this.autoArrangeBackpack = autoArrange;
	this.startDragWeapon = startDragWeapon;

	// 兼容已经写进 items.js 和状态栏中的旧接口。
	this.boxbar = openBackpack;
	this.closeBoxbar = closeBackpack;
	this.updateBackpack = renderAll;

	/**
	 * 恢复背包到指定布局快照（录像回放用）。
	 * snapshot.placed/inventory 中每个实例只需 instanceId、weapon 定义、rotation、
	 * 以及 placed 的 col/row；weapon.sourceItemId 存在时会自动迁移到最新中央定义。
	 */
	this.restoreBackpackState = function (snapshot) {
		if (!snapshot || typeof snapshot !== "object") return false;
		readState();
		const next = {
			version: CONFIG.stateVersion,
			placed: [],
			inventory: [],
			unlockedCells: normalizeUnlockedCells(snapshot.unlockedCells)
		};
		state = next;
		(Array.isArray(snapshot.placed) ? snapshot.placed : []).forEach(function (item) {
			const entry = normalizeEntry(item, true);
			if (!entry) return;
			if (canPlace(entry, entry.col, entry.row, entry.rotation, entry.instanceId)) {
				next.placed.push(entry);
			} else {
				delete entry.col;
				delete entry.row;
				next.inventory.push(entry);
			}
		});
		(Array.isArray(snapshot.inventory) ? snapshot.inventory : []).forEach(function (item) {
			const entry = normalizeEntry(item, false);
			if (entry) next.inventory.push(entry);
		});
		persistState();
		return true;
	};

	// 录像回放：执行 "backpack:<payload>" 动作，恢复背包状态并继续回放。
	if (core.control && typeof core.control.registerReplayAction === "function") {
		core.control.registerReplayAction("backpack", function (action) {
			if (typeof action !== "string" || action.indexOf("backpack:") !== 0) return false;
			try {
				const payload = action.substring("backpack:".length);
				const snapshot = JSON.parse(decodeURIComponent(payload));
				plugin.restoreBackpackState(snapshot);
				if (core.status.route && Array.isArray(core.status.route)) {
					core.status.route.push(action);
				}
			} catch (error) {
				if (console && console.error) console.error("背包状态回放失败", error);
			}
			if (typeof core.replay === "function") core.replay();
			return true;
		});
	}
	}).call(plugin);
};
