/** 背包物品实例、摆放、拖拽、存档与界面的独立安装器。 */
var installBackpackSystem_97b6d981_3a73_47b8_ba94_2315c62f5658 = function (core, plugin) {
	"use strict";
	return (function () {
	// 背包乱斗的物品摆放层。这里只负责物品实例、占格、拖拽和存档；
	// 属性与战斗结算留给后续系统通过公开 API 读取。
	const CONFIG = {
		// 修改这里即可调整背包初始尺寸和扩展上限。
		// 初始区域会在最大网格内居中；最大行列可分别独立修改。
		initialCols: 7, // 新游戏默认解锁的列数。
		initialRows: 6, // 新游戏默认解锁的行数。
		maxCols: 11, // 背包允许向左右各扩展两圈（初始 8 列，最大 12 列）。
		maxRows: 10, // 背包允许向上下各扩展两圈（初始 8 行，最大 12 行）。
		maxCellSize: 40, // 单个格子的最大屏幕像素尺寸。
		expansionItemId: "I429", // 解锁一个格子时消耗的地图道具 ID。
		stateFlag: "__backpack_state__", // 只保存定义 ID、实例 ID、位置和旋转等基础信息。
		attackFlag: "__backpack_attack__", // 缓存已摆放武器总攻击的 flag 名称。
		instanceIdFlag: "__backpack_instance_id__", // 已分配的最大实例 ID；新游戏从 1 开始自增。
		stateVersion: 6, // v6：不再保存完整武器定义，读档时始终从中央定义表重建。
		eventId: "backpack", // 背包界面占用的事件面板 ID。
		sellPrice: 30, // 拖到售卖区出售武器时的固定售价（金币）。
		imageInsetCells: 0.12 // 武器图片与占格外缘之间保留的格子距离，与商店预览一致。
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
	let dragState = null; // 正在拖拽的实例、旋转角、鼠标位置和抓取偏移。
	let dragScrollFrame = null;
	let root = null; // 背包界面的根 DOM 节点；null 表示界面未打开。
	let viewportObserver = null;
	let boardPanel = null;
	let boardControls = null;
	let detailPanel = null;
	let detailContent = null;
	let returnButton = null;
	let selectedInstanceId = null;
	let detailPinned = false;
	let bagCanvas = null; // 绘制背景、网格和拖拽合法性提示的画布。
	let bagContext = null; // bagCanvas 对应的 2D 绘图上下文。
	let inventoryPanel = null; // 网格下方的横向待摆放物品栏。
	let expansionLayer = null; // 放置虚线加号扩展按钮的 DOM 图层。
	let synergyLayer = null; // Hover 武器时显示结构化联动范围和方向动画。
	let expansionCountLabel = null; // 工具栏中显示背包格子数量的文字节点。
	let battleSpeedSelect = null; // 工具栏中的默认战斗速度选择器。
	let placedLayer = null; // 显示已摆放武器 DOM 元素的图层。
	let dragLayer = null; // 显示当前拖拽物视觉副本的最高层图层。
	let sellZone = null; // 下方的售卖区：拖武器到这里自动出售（固定售价）。
	let dragActions = null; // 拖拽时覆盖物品栏、旋转栏和售卖区的命中区域。
	let pendingDropZone = null;
	let rotateDropZone = null;
	let sellDropZone = null;
	let toolbarElement = null; // 底部战速、合成与一键收回工具栏。
	let secondaryActions = null; // 手机端“更多操作”二级菜单。
	let secondaryActionsToggle = null;
	let expandedInventoryDetailsId = null; // 正在展开属性详情的待放置武器。
	let inventoryTypeFilter = "all"; // 待放置列表的武器类型筛选。
	let inventoryRarityFilter = "all"; // 待放置列表的武器星级筛选。
	let inventoryDragGesture = null; // 手机端库存武器图标的待判定拖拽手势。
	let suppressInventoryClickUntil = 0; // 拖拽生效后吞掉紧随其后的 click。
	let placedDragGesture = null; // 手机端已摆放武器的待判定轻点/拖拽手势。
	let suppressPlacedClickUntil = 0; // 拖拽生效后吞掉紧随其后的 click。
	let tooltipPlacementSource = null; // 当前详情来自待放置区还是已放置区，用于桌面端定位。
	let tooltipPlacementAnchor = null; // 待放置 Tooltip 当前对齐的武器卡片。
	let gameGroup = null; // 魔塔引擎提供的游戏容器 DOM 节点。
	let layout = null; // 最近一次计算出的自适应尺寸和坐标结果。
	let backpackGuideTour = null; // 当前背包 Guides.js 教程实例。
	let backpackGuideStarted = false;
	let backpackGuideStartFrame = null;
	let backpackGuideLayoutFrame = null;
	let backpackGuideTargets = [];
	let backpackGuideStep = null;
	let backpackGuideStepIndex = -1;
	let backpackGuideActionTarget = null;
	let backpackGuideActionHandler = null;
	let backpackGuideKeyHandler = null;
	let backpackGuideCompletionDialoguePending = false;

	/** 深拷贝背包状态，避免存档对象和界面对象共享引用。 */
	const cloneData = function (data) {
		if (data == null) return data;
		if (core.clone) return core.clone(data);
		return JSON.parse(JSON.stringify(data));
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

	/** 最大网格内部坐标转为以初始 8×8 左上角为 (0,0) 的录像逻辑坐标。 */
	const toLogicalCell = function (col, row) {
		const grid = getGridConfig();
		return {
			x: Math.floor(Number(col)) - grid.initialCol,
			y: Math.floor(Number(row)) - grid.initialRow
		};
	};

	/** 录像逻辑坐标转回最大网格内部坐标；向上、向左扩展时逻辑坐标可以为负数。 */
	const fromLogicalCell = function (x, y) {
		const grid = getGridConfig();
		return {
			col: Math.floor(Number(x)) + grid.initialCol,
			row: Math.floor(Number(y)) + grid.initialRow
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

	/** 获取商店、图鉴和手机待放置区共用的武器卡片渲染器。 */
	const getWeaponCardRenderer = function () {
		return plugin.weaponCardRenderer
			|| (core.plugin && core.plugin.weaponCardRenderer)
			|| null;
	};

	/** 从独立武器系统读取指定地图道具对应的完整中央定义。 */
	const getWeaponDefinition = function (itemId) {
		return getWeaponSystem().getDefinition(itemId);
	};
	/** 读取保存在勇士 flag 中的实例 ID 计数器。 */
	const getInstanceIdCounter = function () {
		const counter = Math.floor(Number(core.getFlag(CONFIG.instanceIdFlag, 0)) || 0);
		return Number.isFinite(counter) && counter > 0 ? counter : 0;
	};

	/** 把已有纯数字实例 ID 同步到计数器，兼容读档和旧存档迁移。 */
	const syncInstanceIdCounter = function (entries) {
		let counter = getInstanceIdCounter();
		(entries || []).forEach(function (entry) {
			const instanceId = entry && String(entry.instanceId || "");
			if (!/^[1-9]\d*$/.test(instanceId)) return;
			const numericId = Number(instanceId);
			if (Number.isSafeInteger(numericId)) counter = Math.max(counter, numericId);
		});
		core.setFlag(CONFIG.instanceIdFlag, counter);
		return counter;
	};

	/** 为每一次武器拾取创建从 1 开始、记录在勇士 flag 中的自增 ID。 */
	const makeInstanceId = function () {
		const instanceId = getInstanceIdCounter() + 1;
		core.setFlag(CONFIG.instanceIdFlag, instanceId);
		// DOM dataset 只保存字符串，因此实例 ID 在背包系统内统一使用数字字符串。
		return String(instanceId);
	};

	/** 把角度吸附为武器系统支持的四种旋转角。 */
	const normalizeRotation = function (rotation) {
		return getWeaponSystem().normalizeRotation(rotation);
	};

	/** 只有正常游戏录制阶段才允许追加背包增量录像动作。 */
	const canRecordBackpackRoute = function () {
		if (core.isReplaying && core.isReplaying()) return false;
		if (core.isPlaying && !core.isPlaying()) return false;
		return !!(core.status && Array.isArray(core.status.route));
	};

	/** 追加一条不含 JSON/URL 编码的 bp 增量录像动作。 */
	const pushBackpackRoute = function (action) {
		if (!canRecordBackpackRoute()) return false;
		core.status.route.push(action);
		return true;
	};

	/** 记录武器由待摆放区进入装备格；实际角度和位置紧随其后的 m 动作记录。 */
	const recordWeaponEnter = function (entry) {
		return entry ? pushBackpackRoute("bp:" + entry.instanceId + ":i") : false;
	};

	/** 记录武器由装备格移回待摆放区。 */
	const recordWeaponOut = function (entry) {
		return entry ? pushBackpackRoute("bp:" + entry.instanceId + ":o") : false;
	};

	/** 记录武器出售；出售与移回待摆放区是两个不同动作。 */
	const recordWeaponSale = function (entry) {
		return entry ? pushBackpackRoute("bp:" + entry.instanceId + ":s") : false;
	};

	/** 记录已摆放武器最终的旋转象限及其旋转后包围盒左上角逻辑坐标。 */
	const recordWeaponMove = function (entry) {
		if (!entry) return false;
		const logical = toLogicalCell(entry.col, entry.row);
		const rotationIndex = Math.floor(normalizeRotation(entry.rotation) / 90);
		return pushBackpackRoute(
			"bp:" + entry.instanceId + ":m:" + rotationIndex + ":" + logical.x + ":" + logical.y
		);
	};

	/** 通过武器系统校验并统一武器定义。 */
	const normalizeWeapon = function (weaponDefinition) {
		return getWeaponSystem().normalizeWeapon(weaponDefinition);
	};

	/** 将中央定义 ID、地图物品 ID 或旧版武器身份字段统一成稳定的 definitionId。 */
	const resolveWeaponDefinitionId = function (weaponOrId) {
		const resolver = getWeaponSystem().resolveDefinitionId;
		return typeof resolver === "function" ? resolver(weaponOrId) : null;
	};

	/**
	 * 从 weapons.js 读取最新定义并构造运行时武器。itemId 只表示地图道具来源，
	 * 不存在时仍用 definitionId 填充运行时 sourceItemId，供战斗规则按物品 ID 过滤。
	 */
	const buildRuntimeWeapon = function (definitionId, itemId, uniqueKey) {
		const latestDefinition = getWeaponDefinition(definitionId);
		if (!latestDefinition) return null;
		const runtimeDefinition = Object.assign(latestDefinition, {
			definitionId: definitionId,
			sourceItemId: itemId || definitionId
		});
		if (uniqueKey) runtimeDefinition.uniqueKey = uniqueKey;
		return normalizeWeapon(runtimeDefinition);
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
	 * 旧存档只提取 definitionId/itemId 等身份信息；所有详细属性均从中央定义表重建。
	 */
	const normalizeEntry = function (entry, placed) {
		if (!entry || typeof entry !== "object") return null;
		const definitionId = resolveWeaponDefinitionId(entry);
		if (!definitionId) return null;
		const legacyWeapon = entry.weapon && typeof entry.weapon === "object" ? entry.weapon : null;
		const sourceItemCandidate = entry.itemId || entry.sourceItemId
			|| (legacyWeapon && legacyWeapon.sourceItemId);
		const itemId = sourceItemCandidate
			&& resolveWeaponDefinitionId(sourceItemCandidate) === definitionId
			? String(sourceItemCandidate)
			: null;
		const uniqueKey = entry.uniqueKey == null ? null : String(entry.uniqueKey);
		const weapon = buildRuntimeWeapon(definitionId, itemId, uniqueKey);
		if (!weapon) return null;
		const result = {
			instanceId: String(entry.instanceId || makeInstanceId()),
			definitionId: definitionId,
			itemId: itemId,
			weapon: weapon,
			rotation: normalizeRotation(entry.rotation)
		};
		if (uniqueKey) result.uniqueKey = uniqueKey;
		if (placed) {
			result.col = Math.floor(Number(entry.col));
			result.row = Math.floor(Number(entry.row));
			if (!Number.isFinite(result.col) || !Number.isFinite(result.row)) return null;
		}
		return result;
	};

	/** 将运行时实例压缩为可持久化的基础信息，绝不写入 weapon 详细对象。 */
	const serializeEntry = function (entry, placed) {
		const result = {
			instanceId: String(entry.instanceId),
			definitionId: String(entry.definitionId),
			rotation: normalizeRotation(entry.rotation)
		};
		if (entry.itemId) result.itemId = String(entry.itemId);
		if (entry.uniqueKey) result.uniqueKey = String(entry.uniqueKey);
		if (placed) {
			result.col = Math.floor(Number(entry.col));
			result.row = Math.floor(Number(entry.row));
		}
		return result;
	};

	/** 返回可直接写进勇士 flag 的 v6 紧凑存档。 */
	const serializeState = function () {
		return {
			version: CONFIG.stateVersion,
			placed: state.placed.map(function (entry) { return serializeEntry(entry, true); }),
			inventory: state.inventory.map(function (entry) { return serializeEntry(entry, false); }),
			unlockedCells: cloneData(state.unlockedCells)
		};
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
		syncInstanceIdCounter(next.placed.concat(next.inventory));
		// 旧版本或仍含完整 weapon 对象的存档在首次读取后立即压缩，避免再次随整档保存。
		const rawEntries = raw && typeof raw === "object"
			? (raw.placed || []).concat(raw.inventory || [])
			: [];
		const needsMigration = raw && typeof raw === "object"
			&& (Number(raw.version) !== CONFIG.stateVersion || rawEntries.some(function (entry) {
				return entry && (entry.weapon || !entry.definitionId);
			}));
		if (needsMigration && core.status && core.status.hero && core.status.hero.flags && core.setFlag) {
			core.setFlag(CONFIG.stateFlag, serializeState());
		}
		return next;
	};

	/** 保存背包状态，并同步缓存已摆放武器的最终总攻击。 */
	const persistState = function () {
		if (!core.status.hero || !core.status.hero.flags) return;
		core.setFlag(CONFIG.stateFlag, serializeState());
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
			x: (clientX - rect.left) * (root.clientWidth / rect.width) + root.scrollLeft,
			y: (clientY - rect.top) * (root.clientHeight / rect.height) + root.scrollTop
		};
	};

	/** 把数值四舍五入并转换成可写入 DOM style 的像素字符串。 */
	const px = function (value) {
		return Math.round(value) + "px";
	};

	/** 拖拽越出背包区域时也暂时禁止整页文本选择，结束后立即恢复。 */
	const setDragSelectionLocked = function (locked) {
		if (typeof document === "undefined" || !document.body) return;
		document.body.classList.toggle("backpack-drag-selection-locked", !!locked);
	};

	/**
	 * 拖拽开始时界面会重建武器节点；把焦点收回背包根节点，确保 R 键不会被
	 * 通用弹层的“焦点在弹层外”保护逻辑提前拦截。
	 */
	const focusBackpackForDrag = function () {
		if (!root || typeof root.focus !== "function") return;
		try { root.focus({ preventScroll: true }); } catch (_) { root.focus(); }
	};

	/** 清除背包专用 Tooltip 定位，避免关闭背包后影响商店、图鉴等界面。 */
	const clearBackpackTooltipPlacement = function () {
		if (typeof document === "undefined") return;
		tooltipPlacementSource = null;
		tooltipPlacementAnchor = null;
		const tooltip = document.querySelector(".bui-tooltip.backpack-panel-tooltip");
		if (!tooltip) return;
		tooltip.classList.remove("backpack-panel-tooltip");
		[
			"--backpack-tooltip-left",
			"--backpack-tooltip-top",
			"--backpack-tooltip-width",
			"--backpack-tooltip-height"
		].forEach(function (name) { tooltip.style.removeProperty(name); });
	};

	/**
	 * 固定武器详情：紧凑布局统一沿用顶部待放置区；桌面端待放置详情贴在左侧面板右边。
	 * 待放置武器详情与对应卡片顶部对齐，并在接近背包根节点边缘时自动收回。
	 * Tooltip 挂在 body 下，因此需要把背包内部坐标换算成视口坐标。
	 */
	const positionBackpackTooltip = function (source, anchor) {
		if (!root || !layout || typeof document === "undefined") return;
		const tooltip = document.querySelector(".bui-tooltip.show");
		if (!tooltip) return;
		if (source === "inventory" || source === "placed") {
			tooltipPlacementSource = source;
			tooltipPlacementAnchor = source === "inventory" ? (anchor || tooltipPlacementAnchor) : null;
		}
		const panel = layout.panel;
		const rootRect = root.getBoundingClientRect();
		const scaleX = layout.width ? rootRect.width / layout.width : 1;
		const scaleY = layout.height ? rootRect.height / layout.height : 1;
		const edgeMargin = 8;
		const boundaryLeft = rootRect.left + edgeMargin;
		const boundaryTop = rootRect.top + edgeMargin;
		const boundaryRight = rootRect.right - edgeMargin;
		const boundaryBottom = rootRect.bottom - edgeMargin;
		const tooltipWidth = Math.min(panel.width * scaleX, Math.max(0, boundaryRight - boundaryLeft));
		const tooltipMaxHeight = Math.min(panel.height * scaleY, Math.max(0, boundaryBottom - boundaryTop));
		let tooltipLeft = rootRect.left + panel.left * scaleX;
		let tooltipTop = rootRect.top + panel.top * scaleY;
		if (!layout.compact && tooltipPlacementSource === "inventory"
			&& tooltipPlacementAnchor && tooltipPlacementAnchor.isConnected !== false
			&& typeof tooltipPlacementAnchor.getBoundingClientRect === "function") {
			const inventoryRect = inventoryPanel && typeof inventoryPanel.getBoundingClientRect === "function"
				? inventoryPanel.getBoundingClientRect() : null;
			tooltipLeft = inventoryRect ? inventoryRect.right + 6
				: rootRect.left + (panel.left + panel.width) * scaleX + 6;
			tooltipTop = tooltipPlacementAnchor.getBoundingClientRect().top;
		}
		tooltipLeft = Math.max(boundaryLeft, Math.min(tooltipLeft, boundaryRight - tooltipWidth));
		tooltip.classList.add("backpack-panel-tooltip");
		tooltip.style.setProperty("--backpack-tooltip-left", px(tooltipLeft));
		tooltip.style.setProperty("--backpack-tooltip-top", px(tooltipTop));
		tooltip.style.setProperty("--backpack-tooltip-width", px(tooltipWidth));
		tooltip.style.setProperty("--backpack-tooltip-height", px(tooltipMaxHeight));
		const tooltipRect = tooltip.getBoundingClientRect();
		tooltipTop = Math.max(boundaryTop,
			Math.min(tooltipTop, boundaryBottom - Math.min(tooltipRect.height, tooltipMaxHeight)));
		tooltip.style.setProperty("--backpack-tooltip-top", px(tooltipTop));
	};

	/**
	 * 根据当前窗口宽高计算桌面/紧凑布局、库存面板位置、格子尺寸和网格原点。
	 * 计算结果写入 layout，后续所有绘制和命中检测共用同一坐标系。
	 */
	/** 以 outerUI 为宿主，整体缩放；桌面采用 1.5 倍逻辑密度，竖屏采用原始逻辑尺寸。 */
	const syncBackpackViewport = function () {
		if (!root || !gameGroup) return;
		const outer = document.getElementById("outerUI") || gameGroup;
		const domStyle = core.domStyle || {};
		const vertical = typeof domStyle.isVertical === "boolean" ? domStyle.isVertical : outer.clientHeight > outer.clientWidth;
		const globalScale = Number(domStyle.scale) || 1;
		const scale = domStyle.scale ? globalScale / (vertical ? 1 : 1.5) : 1;
		const outerStyle = getComputedStyle(outer);
		const outerWidth = parseFloat(outerStyle.width) || outer.clientWidth;
		const outerHeight = parseFloat(outerStyle.height) || outer.clientHeight;
		root.style.left = (outer === gameGroup ? 0 : outer.offsetLeft) + "px";
		root.style.top = (outer === gameGroup ? 0 : outer.offsetTop) + "px";
		root.style.width = outerWidth / scale + "px";
		root.style.height = outerHeight / scale + "px";
		root.style.transform = "scale(" + scale + ")";
		root.dataset.compact = vertical ? "true" : "false";
	};

	const computeLayout = function () {
		const grid = getGridConfig();
		const width = root.clientWidth;
		const viewportHeight = root.clientHeight;
		const compact = root.dataset.compact === "true";
		root.dataset.compact = compact ? "true" : "false";
		root.dataset.narrow = width < 1000 ? "true" : "false";
		root.dataset.inventoryExpanded = "true";
		root.dataset.dragging = dragState ? "true" : "false";
		// 只裁去尚不可扩展的空白。解锁区及其最外圈候选格全部参与布局。
		const visible = { minCol: grid.maxCols, minRow: grid.maxRows, maxCol: 0, maxRow: 0 };
		for (let row = 0; row < grid.maxRows; row++) for (let col = 0; col < grid.maxCols; col++) {
			if (!isCellUnlocked(col, row) && !isExpansionCell(col, row)) continue;
			visible.minCol = Math.min(visible.minCol, col); visible.maxCol = Math.max(visible.maxCol, col);
			visible.minRow = Math.min(visible.minRow, row); visible.maxRow = Math.max(visible.maxRow, row);
		}
		if (visible.minCol > visible.maxCol) { visible.minCol = 0; visible.minRow = 0; visible.maxCol = grid.maxCols - 1; visible.maxRow = grid.maxRows - 1; }
		const cols = visible.maxCol - visible.minCol + 1, rows = visible.maxRow - visible.minRow + 1;
		const margin = compact ? 10 : Math.max(24, (width - Math.min(1320, width * .88)) / 2);
		const contentWidth = width - margin * 2;
		const gutter = compact ? 10 : 14;
		const top = compact ? Math.max(28, parseFloat(getComputedStyle(root).paddingTop) || 0) : 62;
		const bottom = compact ? Math.max(32, parseFloat(getComputedStyle(root).paddingBottom) || 0) : 24;
		const sideWidth = compact ? 68 : 92;
		let board, detail, panel, pending, sell, actions, cellSize, gap;
		if (compact) {
			gap = 2;
			actions = { left: margin, top: top, width: contentWidth, height: 56 };
			const boardTop = actions.top + actions.height + 8;
			const availableBoardHeight = viewportHeight - boardTop - gutter - 140 - bottom;
			cellSize = Math.max(12, Math.min(CONFIG.maxCellSize,
				Math.floor((contentWidth - sideWidth - 24 - (cols - 1) * gap) / cols),
				Math.floor((availableBoardHeight - 70 - (rows - 1) * gap) / rows)));
			const boardHeight = Math.max(availableBoardHeight, rows * cellSize + (rows - 1) * gap + 70);
			board = { left: margin, top: boardTop, width: contentWidth, height: boardHeight };
			panel = { left: margin, top: boardTop + boardHeight + gutter, width: contentWidth, height: 140 };
			// 详情悬浮覆盖物品栏及其上方的少量网格，不占常驻布局空间。
			const detailHeight = Math.min(272, Math.max(224, Math.round(viewportHeight * .42)));
			detail = { left: margin, top: panel.top + panel.height - detailHeight, width: contentWidth, height: detailHeight };
			const dropWidth = contentWidth - 6;
			pending = { left: panel.left, top: panel.top, width: dropWidth * 2 / 3, height: panel.height };
			sell = { left: pending.left + pending.width + 6, top: panel.top, width: dropWidth / 3, height: panel.height };
		} else {
			const mainHeight = Math.max(300, Math.min(680, viewportHeight - top - 178));
			const leftWidth = Math.round(contentWidth * (width < 1050 ? .57 : .62));
			board = { left: margin, top: top, width: leftWidth, height: mainHeight };
			detail = { left: margin + leftWidth + gutter, top: top, width: contentWidth - leftWidth - gutter, height: mainHeight };
			const sellWidth = Math.max(148, Math.round(leftWidth * .27));
			panel = { left: margin, top: top + mainHeight + gutter, width: leftWidth - sellWidth - gutter, height: 140 };
			pending = panel;
			sell = { left: margin + panel.width + gutter, top: panel.top, width: sellWidth, height: panel.height };
			actions = { left: detail.left, top: panel.top, width: detail.width, height: panel.height };
			gap = 4;
			cellSize = Math.max(12, Math.min(Math.round(CONFIG.maxCellSize * 1.4),
				Math.floor((board.width - sideWidth - 40 - (cols - 1) * gap) / cols),
				Math.floor((board.height - 76 - (rows - 1) * gap) / rows)));
		}
		const step = cellSize + gap;
		const visibleWidth = cols * cellSize + (cols - 1) * gap;
		const visibleHeight = rows * cellSize + (rows - 1) * gap;
		const gridX = Math.round(board.left + (board.width - sideWidth - visibleWidth) / 2);
		const gridY = Math.round(board.top + (compact ? 54 : 46) + (board.height - (compact ? 70 : 62) - visibleHeight) / 2);
		const height = Math.max(viewportHeight, panel.top + panel.height + bottom);
		layout = { width: width, height: height, scale: 1, compact: compact,
			cellSize: cellSize, gap: gap, step: step,
			bagX: gridX - visible.minCol * step, bagY: gridY - visible.minRow * step,
			bagWidth: grid.maxCols * cellSize + (grid.maxCols - 1) * gap,
			bagHeight: grid.maxRows * cellSize + (grid.maxRows - 1) * gap,
			gridVisible: { left: gridX, top: gridY, width: visibleWidth, height: visibleHeight },
			board: board, detail: detail, panel: panel, pending: pending, sell: sell, actions: actions,
			rotate: { left: board.left + board.width - sideWidth - 7, top: gridY + Math.max(6, visibleHeight * .2), width: sideWidth, height: Math.min(180, visibleHeight * .65) }
		};
		const place = function (element, box) {
			if (!element) return;
			element.style.left = px(box.left); element.style.top = px(box.top);
			element.style.width = px(box.width); element.style.height = px(box.height);
		};
		place(boardPanel, board); place(detailPanel, detail); place(toolbarElement, actions); place(boardControls, layout.rotate);
		if (returnButton) { returnButton.style.left = px(compact ? board.left + board.width - 94 : margin); returnButton.style.top = px(compact ? board.top + 10 : 18); }
		bagCanvas.style.height = px(height);
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
		const baseWidth = spanW(baseBounds.cols);
		const baseHeight = spanW(baseBounds.rows);
		const imageInset = Math.min(
			cellSize * CONFIG.imageInsetCells,
			Math.max(0, (baseWidth - 1) / 2),
			Math.max(0, (baseHeight - 1) / 2)
		);
		const frameWidth = baseWidth - imageInset * 2;
		const frameHeight = baseHeight - imageInset * 2;
		const imageFrame = document.createElement("div");
		imageFrame.className = "backpack-image-frame";
		imageFrame.dataset.insetCells = String(CONFIG.imageInsetCells);
		imageFrame.style.width = px(frameWidth);
		imageFrame.style.height = px(frameHeight);
		imageFrame.style.transformOrigin = "0 0";

		const image = document.createElement("img");
		image.draggable = false;
		image.alt = weapon.name;
		uiCommon.setWeaponImageSource(image, weapon.image);
		const crop = weapon.imageCrop;
		if (Array.isArray(crop) && crop.length >= 6 && crop[2] > 0 && crop[3] > 0) {
			// 裁剪素材横纵方向使用同一个比例，并把裁剪区域等比居中到留白后的图片框内。
			const uniformScale = Math.min(frameWidth / crop[2], frameHeight / crop[3]);
			const displayedCropWidth = crop[2] * uniformScale;
			const displayedCropHeight = crop[3] * uniformScale;
			image.style.width = px(crop[4] * uniformScale);
			image.style.height = px(crop[5] * uniformScale);
			image.style.left = px((frameWidth - displayedCropWidth) / 2 - crop[0] * uniformScale);
			image.style.top = px((frameHeight - displayedCropHeight) / 2 - crop[1] * uniformScale);
		} else {
			image.style.width = "100%";
			image.style.height = "100%";
		}
		imageFrame.appendChild(image);

		const normalized = normalizeRotation(rotation);
		if (normalized === 90) {
			imageFrame.style.left = px(spanW(bounds.cols) - imageInset);
			imageFrame.style.top = px(imageInset);
			imageFrame.style.transform = "rotate(90deg)";
		} else if (normalized === 180) {
			imageFrame.style.left = px(spanW(bounds.cols) - imageInset);
			imageFrame.style.top = px(spanW(bounds.rows) - imageInset);
			imageFrame.style.transform = "rotate(180deg)";
		} else if (normalized === 270) {
			imageFrame.style.left = px(imageInset);
			imageFrame.style.top = px(spanW(bounds.rows) - imageInset);
			imageFrame.style.transform = "rotate(270deg)";
		} else {
			imageFrame.style.left = px(imageInset);
			imageFrame.style.top = px(imageInset);
		}
		element.appendChild(imageFrame);

		const occupiedCells = {};
		bounds.cells.forEach(function (cell) { occupiedCells[cell[0] + "," + cell[1]] = true; });
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
			// 只连接同一武器横向/纵向相邻占格之间的缝隙，避免跨格 hover 闪断；
			// 外侧和凹形缺口不扩张，因此不会退化成覆盖整个外接矩形的误命中区域。
			hitCell.style.width = px(cellSize + (occupiedCells[(cell[0] + 1) + "," + cell[1]] ? gap : 0));
			hitCell.style.height = px(cellSize + (occupiedCells[cell[0] + "," + (cell[1] + 1)] ? gap : 0));
			element.appendChild(hitCell);
		});
		return element;
	};

	/** 绘制背包背景、已解锁网格、拖拽合法性颜色和底部操作说明。 */
	const drawBag = function () {
		if (!bagContext || !layout) return;
		const grid = getGridConfig();
		bagContext.clearRect(0, 0, layout.width, layout.height);

		for (let row = 0; row < grid.maxRows; row++) {
			for (let col = 0; col < grid.maxCols; col++) {
				if (!isCellUnlocked(col, row)) continue;
				// 格子按格距（step = cellSize + gap）定位，尺寸仍为 cellSize，格间自然留出缝隙。
				const x = layout.bagX + col * layout.step;
				const y = layout.bagY + row * layout.step;
				bagContext.fillStyle = (row + col) % 2 ? "#d9e8ec" : "#e2edf0";
				bagContext.fillRect(x, y, layout.cellSize, layout.cellSize);
				bagContext.strokeStyle = "#b4a77b";
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
	const unlockBackpackCell = function (col, row, options) {
		options = options || {};
		col = Math.floor(Number(col));
		row = Math.floor(Number(row));
		if (!isExpansionCell(col, row)) return false;
		if (getExpansionItemCount() <= 0) {
			if (!options.silent && core.playSound) core.playSound("操作失败");
			if (!options.silent && core.drawTip) core.drawTip("需要一个背包格子才能解锁", CONFIG.expansionItemId);
			return false;
		}
		if (!core.removeItem || !core.removeItem(CONFIG.expansionItemId, 1)) return false;
		state.unlockedCells = normalizeUnlockedCells(state.unlockedCells.concat([[col, row]]));
		persistState();
		renderAll();
		if (options.recordRoute !== false) {
			const logical = toLogicalCell(col, row);
			pushBackpackRoute("bp:-1:" + logical.x + ":" + logical.y);
		}
		if (!options.silent && core.playSound) core.playSound("打开界面");
		if (!options.silent && core.drawTip) {
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
				slot.dataset.col = String(col); slot.dataset.row = String(row);
				slot.setAttribute("aria-label", "解锁背包格子 " + col + "," + row);
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
		clearPlacedDragGesture();
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
			const detailsProvider = function () {
				return uiCommon.buildWeaponTooltip({
					weapon: entry.weapon,
					base: entry.weapon,
					current: attributes || entry.weapon
				});
			};
			element.addEventListener("pointerenter", function () {
				if (!detailPinned && !dragState) selectWeapon(entry.instanceId, false);
			});
			element.addEventListener("pointerleave", function () {
				if (!detailPinned && selectedInstanceId === entry.instanceId) clearWeaponSelection();
			});
			bindPlacedInteraction(element, entry, detailsProvider);
			element.addEventListener("contextmenu", function (event) {
				event.preventDefault();
				rotatePlaced(entry.instanceId);
			});
			placedLayer.appendChild(element);
		});
	};

	const clearPlacedDragGesture = function () {
		placedDragGesture = null;
	};

	/**
	 * 手机和桌面统一：轻点固定详情与联动范围，移动超过阈值才开始拖拽。
	 * 固定后其他武器的 Hover 不再切换；再次点击武器才切换，点击空白处取消。
	 */
	const bindPlacedInteraction = function (element, entry, detailsProvider) {
		const showPlacedDetails = function () {
			if (!root || dragState) return;
			if (element.focus) {
				try { element.focus({ preventScroll: true }); } catch (_) { element.focus(); }
			}
			selectWeapon(entry.instanceId, true);
			renderSynergyHighlights(entry);
		};
		element.addEventListener("keydown", function (event) {
			if (event.key !== "Enter" && event.key !== " ") return;
			event.preventDefault();
			showPlacedDetails();
		});
		element.addEventListener("pointerdown", function (event) {
			if (event.pointerType === "mouse" && event.button !== 0) return;
			clearPlacedDragGesture();
			clearSynergyHighlights();
			event.stopPropagation();
			placedDragGesture = {
				instanceId: entry.instanceId,
				element: element,
				pointerId: event.pointerId,
				startX: event.clientX,
				startY: event.clientY,
				startEvent: {
					pointerType: event.pointerType,
					button: 0,
					clientX: event.clientX,
					clientY: event.clientY,
					preventDefault: function () {},
					stopPropagation: function () {}
				}
			};
			const captureTarget = event.target && event.target.setPointerCapture ? event.target : element;
			if (captureTarget.setPointerCapture) {
				try { captureTarget.setPointerCapture(event.pointerId); } catch (_) {}
			}
		});
		element.addEventListener("pointermove", function (event) {
			const gesture = placedDragGesture;
			if (!gesture || gesture.pointerId !== event.pointerId) return;
			if (Math.hypot(event.clientX - gesture.startX, event.clientY - gesture.startY) < 8) return;
			event.preventDefault();
			event.stopPropagation();
			clearPlacedDragGesture();
			suppressPlacedClickUntil = Date.now() + 600;
			startPointerDrag(gesture.startEvent, gesture.instanceId, "placed", gesture.element);
			if (dragState) dragState.point = pointToLocal(event.clientX, event.clientY);
			collapseInventoryForDrag();
		});
		element.addEventListener("pointerup", function (event) {
			const gesture = placedDragGesture;
			if (!gesture || gesture.pointerId !== event.pointerId) return;
			clearPlacedDragGesture();
			event.preventDefault();
			event.stopPropagation();
			showPlacedDetails();
		});
		element.addEventListener("pointercancel", clearPlacedDragGesture);
		element.addEventListener("click", function () {
			if (Date.now() < suppressPlacedClickUntil || (selectedInstanceId === entry.instanceId && detailPinned)) return;
			showPlacedDetails();
		});
		element.addEventListener("click", function (event) {
			event.preventDefault();
			if (Date.now() < suppressPlacedClickUntil) {
				event.stopImmediatePropagation();
				return;
			}
			event.stopPropagation();
			// 真机或旧 WebView 可能不稳定派发 pointerup；标准 click 作为轻触兜底。
			showPlacedDetails();
		}, true);
	};

	const clearInventoryDragGesture = function () {
		inventoryDragGesture = null;
	};

	/** 开始拖拽后把库存区域切换成三块拖拽操作区；手机端同时收起卡片详情。 */
	const collapseInventoryForDrag = function () {
		if (!layout) return;
		if (layout.compact) {
			expandedInventoryDetailsId = null;
		}
		renderAll();
		createDragElement();
		drawBag();
		focusBackpackForDrag();
	};

	/**
	 * 手机端只允许从武器图标开始拖拽。图标禁用原生滚动手势，移动超过阈值即拖拽；
	 * 卡片其余区域不绑定拖拽，继续承担横向/纵向列表滚动和详情点击。
	 */
	const bindCompactInventoryDrag = function (card, entry) {
		const preview = card.querySelector(".weapon-card-mobile-preview")
			|| card.querySelector(".weapon-card-preview") || card;
		preview.title = "拖动武器到背包";
		preview.setAttribute("aria-label", (entry.weapon.name || "武器") + "，点击查看，拖动到背包");
		preview.addEventListener("pointerdown", function (event) {
			if (event.pointerType === "mouse" && event.button !== 0) return;
			clearInventoryDragGesture();
			event.stopPropagation();
			inventoryDragGesture = {
				instanceId: entry.instanceId,
				preview: preview,
				pointerId: event.pointerId,
				startX: event.clientX,
				startY: event.clientY,
				startEvent: {
					pointerType: event.pointerType,
					button: 0,
					clientX: event.clientX,
					clientY: event.clientY,
					preventDefault: function () {},
					stopPropagation: function () {}
				}
			};
			if (preview.setPointerCapture) {
				try { preview.setPointerCapture(event.pointerId); } catch (_) {}
			}
		});
		preview.addEventListener("pointermove", function (event) {
			const gesture = inventoryDragGesture;
			if (!gesture || gesture.pointerId !== event.pointerId) return;
			if (Math.hypot(event.clientX - gesture.startX, event.clientY - gesture.startY) < 8) return;
			event.preventDefault();
			event.stopPropagation();
			clearInventoryDragGesture();
			suppressInventoryClickUntil = Date.now() + 600;
			startPointerDrag(gesture.startEvent, gesture.instanceId, "inventory", gesture.preview);
			if (dragState) dragState.point = pointToLocal(event.clientX, event.clientY);
			collapseInventoryForDrag();
		});
		preview.addEventListener("pointerup", clearInventoryDragGesture);
		preview.addEventListener("pointercancel", clearInventoryDragGesture);
		preview.addEventListener("contextmenu", function (event) { event.preventDefault(); });
		card.addEventListener("click", function (event) {
			if (Date.now() >= suppressInventoryClickUntil) return;
			event.preventDefault();
			event.stopImmediatePropagation();
		}, true);
	};

	/**
	 * 桌面端整张横向武器卡片可拖拽；移动超过阈值才真正起拖，普通单击固定右侧详情。
	 * 卡片内独立按钮继续执行自身行为，不触发拖拽或详情切换。
	 */
	const bindDesktopInventoryDrag = function (card, entry, detailsProvider) {
		card.title = "拖动武器到背包";
		card.addEventListener("pointerdown", function (event) {
			if (event.pointerType === "mouse" && event.button !== 0) return;
			if (event.target && event.target.closest && event.target.closest("button")) return;
			clearInventoryDragGesture();
			event.stopPropagation();
			inventoryDragGesture = {
				instanceId: entry.instanceId,
				preview: card,
				pointerId: event.pointerId,
				startX: event.clientX,
				startY: event.clientY,
				startEvent: {
					pointerType: event.pointerType,
					button: 0,
					clientX: event.clientX,
					clientY: event.clientY,
					preventDefault: function () {},
					stopPropagation: function () {}
				}
			};
			if (card.setPointerCapture) {
				try { card.setPointerCapture(event.pointerId); } catch (_) {}
			}
		});
		card.addEventListener("pointermove", function (event) {
			const gesture = inventoryDragGesture;
			if (!gesture || gesture.pointerId !== event.pointerId) return;
			if (Math.hypot(event.clientX - gesture.startX, event.clientY - gesture.startY) < 8) return;
			event.preventDefault();
			event.stopPropagation();
			clearInventoryDragGesture();
			suppressInventoryClickUntil = Date.now() + 600;
			startPointerDrag(gesture.startEvent, gesture.instanceId, "inventory", gesture.preview);
			if (dragState) dragState.point = pointToLocal(event.clientX, event.clientY);
			collapseInventoryForDrag();
		});
		card.addEventListener("pointerup", clearInventoryDragGesture);
		card.addEventListener("pointercancel", clearInventoryDragGesture);
		card.addEventListener("click", function (event) {
			if (Date.now() < suppressInventoryClickUntil) {
				event.preventDefault();
				event.stopImmediatePropagation();
				return;
			}
			if (event.target && event.target.closest && event.target.closest("button")) return;
			selectWeapon(entry.instanceId, true);
		});
	};

	/** 返回经过类型和星级筛选后的待放置实例，不修改原库存顺序。 */
	const getFilteredInventoryEntries = function () {
		return state.inventory.filter(function (entry) {
			if (inventoryTypeFilter !== "all"
				&& getWeaponTypes(entry).indexOf(inventoryTypeFilter) < 0) return false;
			const rarity = entry.weapon.rarity == null ? "0" : String(entry.weapon.rarity);
			return inventoryRarityFilter === "all" || rarity === inventoryRarityFilter;
		});
	};

	const createInventoryFilter = function (className, ariaLabel, options, value, onChange) {
		const select = document.createElement("select");
		select.className = "backpack-inventory-filter " + className;
		select.setAttribute("aria-label", ariaLabel);
		options.forEach(function (item) {
			const option = document.createElement("option");
			option.value = item.value;
			option.textContent = item.text;
			select.appendChild(option);
		});
		select.value = value;
		select.addEventListener("pointerdown", function (event) { event.stopPropagation(); });
		select.addEventListener("change", function (event) {
			event.stopPropagation();
			onChange(select.value);
			renderInventory();
		});
		return select;
	};

	/** 创建待放置列表标题和类型/星级筛选；手机端列表固定保持展开。 */
	const buildInventoryHeader = function (filteredCount) {
		const header = document.createElement("div");
		header.className = "backpack-inventory-header";
		const label = document.createElement("span");
		label.className = "backpack-inventory-count";
		label.textContent = "物品栏 · " + (filteredCount === state.inventory.length ? state.inventory.length : filteredCount + "/" + state.inventory.length);
		const filters = document.createElement("div");
		filters.className = "backpack-inventory-filters";
		const typeNames = [];
		state.inventory.forEach(function (entry) {
			getWeaponTypes(entry).forEach(function (typeName) {
				if (typeNames.indexOf(typeName) < 0) typeNames.push(typeName);
			});
		});
		if (inventoryTypeFilter !== "all" && typeNames.indexOf(inventoryTypeFilter) < 0) {
			typeNames.push(inventoryTypeFilter);
		}
		typeNames.sort(function (a, b) { return String(a).localeCompare(String(b), "zh-CN"); });
		const typeOptions = [{ value: "all", text: "全部类型" }].concat(typeNames.map(function (typeName) {
			return { value: typeName, text: typeName };
		}));
		filters.appendChild(createInventoryFilter(
			"backpack-inventory-filter-type", "按武器类型筛选", typeOptions, inventoryTypeFilter,
			function (value) { inventoryTypeFilter = value; }
		));
		const rarityOptions = [{ value: "all", text: "全部星级" }];
		for (let rarity = 1; rarity <= 5; rarity++) {
			rarityOptions.push({ value: String(rarity), text: rarity + "星" });
		}
		if (state.inventory.some(function (entry) { return entry.weapon.rarity == null; })) {
			rarityOptions.push({ value: "0", text: "未定星级" });
		}
		filters.appendChild(createInventoryFilter(
			"backpack-inventory-filter-rarity", "按武器星级筛选", rarityOptions, inventoryRarityFilter,
			function (value) { inventoryRarityFilter = value; }
		));
		header.appendChild(label);
		header.appendChild(filters);
		return header;
	};

	/** 重建待摆放库存卡片；两端共用横向卡片，手机拖图标、桌面拖整张卡片。 */
	const renderInventory = function () {
		if (!inventoryPanel || !layout) return;
		const inventoryScroll = inventoryPanel.querySelector(".backpack-inventory-list");
		const scrollLeft = inventoryScroll ? inventoryScroll.scrollLeft : 0;
		uiCommon.releaseWeaponUI(inventoryPanel);
		inventoryPanel.innerHTML = "";
		inventoryPanel.style.left = px(layout.panel.left);
		inventoryPanel.style.top = px(layout.panel.top);
		inventoryPanel.style.width = px(layout.panel.width);
		inventoryPanel.style.height = px(layout.panel.height);
		const filteredEntries = getFilteredInventoryEntries();
		inventoryPanel.appendChild(buildInventoryHeader(filteredEntries.length));
		const list = document.createElement("div");
		list.className = "backpack-inventory-list";
		inventoryPanel.appendChild(list);
		uiCommon.decorateWeaponSurface(inventoryPanel, { radius: 18, ornate: true });

		if (!filteredEntries.length) {
			const empty = document.createElement("div");
			empty.className = "backpack-empty";
			empty.textContent = state.inventory.length
				? "没有符合筛选条件的武器"
				: (state.placed.length ? "没有待摆放物品" : "背包中还没有物品");
			list.appendChild(empty);
			return;
		}

		filteredEntries.forEach(function (entry) {
			if (getWeaponCardRenderer()) {
				const detailsProvider = function () {
					return uiCommon.buildWeaponTooltip({
						weapon: entry.weapon,
						base: entry.weapon,
						current: entry.weapon
					});
				};
				const card = getWeaponCardRenderer().createCard(entry.weapon, {
					className: "backpack-inventory-card backpack-inventory-tile",
					includeSynergy: false,
					paddingCells: 0,
					frameRadius: 9,
					showCraftHammer: false,
					mobileCompactPreview: true,
					mobileListMode: false,
					onMobileDetailsToggle: function (expanded) {
						expandedInventoryDetailsId = expanded ? entry.instanceId : null;
					},
					tagName: "div"
				});
				card.dataset.instanceId = entry.instanceId;
				card.dataset.rotation = String(entry.rotation || 0);
				if (expandedInventoryDetailsId === entry.instanceId) {
					card.classList.add("is-mobile-expanded");
					const summary = card.querySelector(".weapon-card-summary");
					if (summary) {
						summary.setAttribute("aria-expanded", "true");
						summary.setAttribute("aria-label", "收起武器属性与特殊效果");
					}
				}
				if (layout.compact) {
					bindCompactInventoryDrag(card, entry);
					card.addEventListener("click", function () { selectWeapon(entry.instanceId, true); });
				} else {
					card.addEventListener("pointerenter", function () { if (!detailPinned && !dragState) selectWeapon(entry.instanceId, false); });
					card.addEventListener("pointerleave", function () { if (!detailPinned && selectedInstanceId === entry.instanceId) clearWeaponSelection(); });
					bindDesktopInventoryDrag(card, entry, detailsProvider);
				}
				card.addEventListener("keydown", function (event) {
					if (event.key === "Enter" || event.key === " ") { event.preventDefault(); selectWeapon(entry.instanceId, true); }
				});
				list.appendChild(card);
				return;
			}

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
				collapseInventoryForDrag();
			});

			const name = document.createElement("div");
			name.className = "backpack-card-name";
			uiCommon.renderWeaponName(name, entry.weapon, { showHammer: false });
			const rarity = document.createElement("div");
			rarity.className = "backpack-card-rarity";
			rarity.textContent = entry.weapon.rarity == null
				? "未定稀有度"
				: new Array(Math.max(0, Math.min(5, Number(entry.weapon.rarity))) + 1).join("★");
			uiCommon.appendCraftHammer(rarity, entry.weapon);

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
			list.appendChild(card);
		});
		list.scrollLeft = scrollLeft;
	};

	/** 按同一份响应式布局定位售卖区，确保它永远位于棋盘预留空间内。 */
	const renderSellZone = function () {
		if (!sellZone || !layout || !layout.sell) return;
		const sell = layout.sell;
		sellZone.style.left = px(sell.left);
		sellZone.style.top = px(sell.top);
		sellZone.style.right = "auto";
		sellZone.style.width = px(sell.width);
		sellZone.style.height = px(sell.height);
		sellZone.style.minHeight = "0";
	};

	/** 拖拽命中区与可见的物品栏、旋转栏、售卖区保持一致。 */
	const renderDragActions = function () {
		if (!dragActions || !layout) return;
		[[pendingDropZone, layout.pending || layout.panel], [rotateDropZone, layout.rotate], [sellDropZone, layout.sell]].forEach(function (pair) {
			const zone = pair[0], box = pair[1];
			zone.style.left = px(box.left); zone.style.top = px(box.top);
			zone.style.width = px(box.width); zone.style.height = px(box.height);
		});
	};

	/** 统一执行尺寸计算、画布绘制、扩展槽、已摆放区和库存区渲染。 */
	const renderAll = function () {
		if (!root) return;
		syncBackpackViewport();
		computeLayout();
		bagCanvas.width = layout.width;
		bagCanvas.height = layout.height;
		drawBag();
		renderExpansionSlots();
		renderPlaced();
		renderInventory();
		renderSellZone();
		renderDragActions();
		renderWeaponDetails();
		if (document.querySelector(".bui-tooltip.backpack-panel-tooltip.show")) {
			positionBackpackTooltip();
		}
		if (dragState) updateDragElement();
	};

	/** 判断背包内部坐标是否落在库存面板范围内。 */
	const isPointInInventory = function (point) {
		if (!layout) return false;
		const panel = layout.pending || layout.panel;
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
		if (layout && layout.compact) clearWeaponSelection();
		if (root) root.dataset.tooltipPinned = "false";
		event.preventDefault();
		event.stopPropagation();
		const rect = sourceElement.getBoundingClientRect();
		const point = pointToLocal(event.clientX, event.clientY);
		dragState = {
			instanceId: instanceId,
			source: source,
			rotation: findEntry(instanceId).rotation,
			dropAction: null,
			point: point,
			gripX: rect.width ? (event.clientX - rect.left) / rect.width : 0.5,
			gripY: rect.height ? (event.clientY - rect.top) / rect.height : 0.5,
			offsetX: 0,
			offsetY: 0,
			element: null
		};
		setDragSelectionLocked(true);
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

	/** 返回当前指针所在的待放置、旋转或售卖操作区。 */
	const getDragAction = function (clientX, clientY) {
		if (!dragState || !layout || !dragActions) return null;
		const zones = [
			["pending", pendingDropZone],
			["rotate", rotateDropZone],
			["sell", sellDropZone]
		];
		for (let index = 0; index < zones.length; index++) {
			const zone = zones[index][1];
			if (!zone) continue;
			const rect = zone.getBoundingClientRect();
			if (clientX >= rect.left && clientX <= rect.right
				&& clientY >= rect.top && clientY <= rect.bottom) return zones[index][0];
		}
		return null;
	};

	/** 更新三块操作区高亮；旋转只在从区外进入旋转区的瞬间执行一次。 */
	const updateDragAction = function (action) {
		if (!dragState) return;
		const previous = dragState.dropAction;
		dragState.dropAction = action;
		[
			["pending", pendingDropZone],
			["rotate", rotateDropZone],
			["sell", sellDropZone]
		].forEach(function (item) {
			if (item[1]) item[1].classList.toggle("is-active", item[0] === action);
		});
		if (action === "rotate" && previous !== "rotate") rotateDrag();
	};

	const clearDragAction = function () {
		[pendingDropZone, rotateDropZone, sellDropZone].forEach(function (zone) {
			if (zone) zone.classList.remove("is-active");
		});
	};

	/**
	 * 结束拖拽：放到库存、放到合法网格或退回原位；只有状态改变时才写存档。
	 */
	const finishDrag = function (event) {
		if (!dragState) return;
		stopDragScroll();
		const point = pointToLocal(event.clientX, event.clientY);
		dragState.point = point;
		const entry = findEntry(dragState.instanceId);
		const target = getDragTarget();
		const dropAction = getDragAction(event.clientX, event.clientY);
		let changed = false;

		// 旋转区只负责旋转预览，不作为落点；松手时恢复原位。
		if (dropAction === "rotate") {
			cancelDrag();
			return;
		}

		// 拖到售卖区：自动出售（删除武器 + 固定售价金币），不执行后续放置逻辑。
		if (entry && isInSellZone(event.clientX, event.clientY)) {
			const soldName = (entry.weapon && entry.weapon.name) || "武器";
			const instanceId = entry.instanceId;
			dragState = null;
			setDragSelectionLocked(false);
			if (dragLayer) dragLayer.innerHTML = "";
			if (sellZone) sellZone.classList.remove("backpack-sell-zone-active");
			clearDragAction();
			if (!removeBackpackWeapon(instanceId)) return; // 内部完成删除、持久化与界面刷新
			core.status.hero.money = Math.floor(Number(core.status.hero.money) || 0) + CONFIG.sellPrice;
			recordWeaponSale(entry);
			if (core.updateStatusBar) core.updateStatusBar();
			if (core.drawTip) core.drawTip("已出售：" + soldName + "，+" + CONFIG.sellPrice + " 金币");
			return;
		}

		let replayOperation = null;
		// 第一个“待放置”框是明确的收回落点：已摆放武器在此松手后进入待放置列表。
		if (entry && (dropAction === "pending" || isPointInInventory(point))) {
			if (dragState.source === "placed") {
				removeEntryFromLists(entry.instanceId);
				delete entry.col;
				delete entry.row;
				entry.rotation = dragState.rotation;
				state.inventory.push(entry);
				changed = true;
				replayOperation = "out";
			} else if (entry.rotation !== dragState.rotation) {
				entry.rotation = dragState.rotation;
				changed = true;
			}
		} else if (entry && target.valid) {
			const moved = dragState.source !== "placed"
				|| entry.col !== target.col
				|| entry.row !== target.row
				|| entry.rotation !== dragState.rotation;
			removeEntryFromLists(entry.instanceId);
			entry.col = target.col;
			entry.row = target.row;
			entry.rotation = dragState.rotation;
			state.placed.push(entry);
			changed = moved;
			replayOperation = dragState.source === "placed" ? (moved ? "move" : null) : "enter";
		} else if (core.drawTip) {
			core.drawTip("这里放不下，物品已回到原位");
		}

		dragState = null;
		setDragSelectionLocked(false);
		if (dragLayer) dragLayer.innerHTML = "";
		clearDragAction();
		if (changed) {
			persistState();
			if (replayOperation === "out") recordWeaponOut(entry);
			else if (replayOperation === "enter") {
				recordWeaponEnter(entry);
				recordWeaponMove(entry);
			} else if (replayOperation === "move") recordWeaponMove(entry);
		}
		renderAll();
	};

	/** 取消当前拖拽并清除视觉副本，不修改实例位置。 */
	const cancelDrag = function () {
		dragState = null;
		setDragSelectionLocked(false);
		stopDragScroll();
		if (dragLayer) dragLayer.innerHTML = "";
		if (sellZone) sellZone.classList.remove("backpack-sell-zone-active");
		clearDragAction();
		if (root) renderAll();
		else drawBag();
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
		recordWeaponMove(entry);
		renderAll();
		return true;
	};

	/** 把所有已摆放实例收回库存，并清除它们的列、行坐标。 */
	const collectAll = function () {
		readState();
		const collected = state.placed.slice();
		state.placed.forEach(function (entry) {
			delete entry.col;
			delete entry.row;
			state.inventory.push(entry);
		});
		state.placed = [];
		persistState();
		collected.forEach(recordWeaponOut);
		renderAll();
	};

	/** 创建工具栏按钮，并阻止 pointerdown 冒泡到游戏画布。 */
	const createButton = function (text, callback, gold) {
		const button = document.createElement("button");
		button.className = "backpack-button";
		button.textContent = text;
		button.addEventListener("pointerdown", function (event) {
			event.stopPropagation();
		});
		button.addEventListener("click", callback);
		uiCommon.decorateWeaponSurface(button, { button: true, gold: !!gold });
		return button;
	};

	const closeSecondaryActions = function () {
		if (secondaryActions) secondaryActions.classList.remove("is-open");
		if (secondaryActionsToggle) secondaryActionsToggle.setAttribute("aria-expanded", "false");
	};

	const openCraftPanel = function () {
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
	};

	/** 桌面端展开为操作按钮，手机端收进“操作”二级菜单。 */
	const createSecondaryActions = function () {
		secondaryActions = document.createElement("div");
		secondaryActions.className = "backpack-secondary-actions";
		secondaryActionsToggle = document.createElement("button");
		secondaryActionsToggle.type = "button";
		secondaryActionsToggle.className = "backpack-button backpack-secondary-actions-toggle";
		secondaryActionsToggle.innerHTML = "<span>操作</span><svg viewBox='0 0 16 16' focusable='false' aria-hidden='true'>"
			+ "<path d='M3.5 6l4.5 4 4.5-4' fill='none' stroke='currentColor' stroke-width='2'"
			+ " stroke-linecap='round' stroke-linejoin='round'/></svg>";
		secondaryActionsToggle.setAttribute("aria-haspopup", "menu");
		uiCommon.decorateWeaponSurface(secondaryActionsToggle, { button: true });
		secondaryActionsToggle.setAttribute("aria-expanded", "false");
		secondaryActionsToggle.addEventListener("pointerdown", function (event) { event.stopPropagation(); });
		secondaryActionsToggle.addEventListener("click", function (event) {
			event.preventDefault();
			event.stopPropagation();
			const open = secondaryActions.classList.toggle("is-open");
			secondaryActionsToggle.setAttribute("aria-expanded", open ? "true" : "false");
		});
		const menu = document.createElement("div");
		menu.className = "backpack-secondary-actions-menu";
		menu.setAttribute("role", "menu");
		[
			["合成", openCraftPanel],
			["全部收回", collectAll]
		].forEach(function (action) {
			const button = createButton(action[0], function () {
				closeSecondaryActions();
				action[1]();
			});
			button.classList.add("backpack-secondary-action");
			button.classList.add(action[0] === "合成"
				? "backpack-action-craft" : "backpack-action-collect-all");
			button.setAttribute("role", "menuitem");
			menu.appendChild(button);
		});
		secondaryActions.appendChild(secondaryActionsToggle);
		secondaryActions.appendChild(menu);
		return secondaryActions;
	};

	const BATTLE_SPEED_OPTIONS = [
		{ value: "0.25", label: "0.25×" },
		{ value: "0.5", label: "0.5×" },
		{ value: "1", label: "1×" },
		{ value: "2", label: "2×" },
		{ value: "3", label: "3×" },
		{ value: "10", label: "10×" },
		{ value: "instant", label: "立即" }
	];

	/** 读取战斗插件中持久化的速度偏好，并同步到背包工具栏。 */
	const renderBattleSpeedControl = function () {
		if (!battleSpeedSelect) return;
		const battle = core.plugin && core.plugin.backpackBattle;
		const available = battle && typeof battle.getPreferredSpeed === "function"
			&& typeof battle.setPreferredSpeed === "function";
		battleSpeedSelect.disabled = !available;
		if (!available) return;
		const preference = battle.getPreferredSpeed();
		battleSpeedSelect.value = preference === "instant" ? "instant" : String(preference);
	};

	/** 创建紧凑下拉框，避免七个倍速按钮挤占背包的小分辨率工具栏。 */
	const createBattleSpeedControl = function () {
		const control = document.createElement("label");
		control.className = "backpack-battle-speed-control";
		const caption = document.createElement("span");
		caption.textContent = "战速";
		battleSpeedSelect = document.createElement("select");
		battleSpeedSelect.className = "backpack-battle-speed-select";
		battleSpeedSelect.setAttribute("aria-label", "默认战斗速度");
		BATTLE_SPEED_OPTIONS.forEach(function (speed) {
			const option = document.createElement("option");
			option.value = speed.value;
			option.textContent = speed.label;
			battleSpeedSelect.appendChild(option);
		});
		battleSpeedSelect.addEventListener("pointerdown", function (event) { event.stopPropagation(); });
		battleSpeedSelect.addEventListener("change", function (event) {
			event.stopPropagation();
			const battle = core.plugin && core.plugin.backpackBattle;
			if (!battle || typeof battle.setPreferredSpeed !== "function") return;
			const value = battleSpeedSelect.value === "instant"
				? "instant" : Number(battleSpeedSelect.value);
			if (!battle.setPreferredSpeed(value)) return;
			renderBattleSpeedControl();
			if (core.drawTip) core.drawTip("默认战斗速度：" + battleSpeedSelect.options[battleSpeedSelect.selectedIndex].text);
		});
		control.appendChild(caption);
		control.appendChild(battleSpeedSelect);
		return control;
	};

	const createDragZone = function (kind, titleText, hintText) {
		const zone = document.createElement("div");
		zone.className = "backpack-drag-zone backpack-drag-zone-" + kind;
		zone.dataset.action = kind;
		const title = document.createElement("div");
		title.className = "backpack-drag-title";
		title.textContent = titleText;
		const hint = document.createElement("div");
		hint.className = "backpack-drag-hint";
		hint.textContent = hintText;
		zone.appendChild(title);
		zone.appendChild(hint);
		return zone;
	};

	/** 创建拖拽时显示的待放置、旋转和售卖操作区。 */
	const createDragActions = function () {
		dragActions = document.createElement("div");
		dragActions.className = "backpack-drag-actions";
		dragActions.setAttribute("aria-hidden", "true");
		pendingDropZone = createDragZone("pending", "待放置", "拖到这里\n收回武器");
		rotateDropZone = createDragZone("rotate", "旋转区", "拖入一次\n旋转 90°");
		sellDropZone = createDragZone("sell", "售卖区", "每把 +" + CONFIG.sellPrice + " 金币");
		dragActions.appendChild(pendingDropZone);
		dragActions.appendChild(rotateDropZone);
		dragActions.appendChild(sellDropZone);
		return dragActions;
	};

	const isGuideBackpack = function () {
		return !!(core.getFlag && core.getFlag("inGuide"))
			&& !(core.isReplaying && core.isReplaying());
	};

	/** Guides.js 锁定 body 直属节点；交互步骤临时解锁背包所在的宿主。 */
	const getBackpackGuideHost = function () {
		let host = root;
		while (host && host.parentNode && host.parentNode !== document.body) host = host.parentNode;
		return host || root;
	};

	const getTopLeftPlacedWeapon = function () {
		return Array.prototype.slice.call(root ? root.querySelectorAll(".backpack-placed") : [])
			.sort(function (left, right) {
				const leftRect = left.getBoundingClientRect();
				const rightRect = right.getBoundingClientRect();
				return leftRect.top - rightRect.top || leftRect.left - rightRect.left;
			})[0] || null;
	};

	const getBackpackPlacementRect = function () {
		if (!root || !layout) return null;
		const rootRect = root.getBoundingClientRect();
		const scaleX = root.clientWidth ? rootRect.width / root.clientWidth : 1;
		const scaleY = root.clientHeight ? rootRect.height / root.clientHeight : 1;
		return {
			left: rootRect.left + (layout.gridVisible.left - root.scrollLeft) * scaleX,
			top: rootRect.top + (layout.gridVisible.top - root.scrollTop) * scaleY,
			width: layout.gridVisible.width * scaleX,
			height: layout.gridVisible.height * scaleY
		};
	};

	/** 返回当前最外圈所有可扩展格子的整体区域，供教程随网格布局动态定位。 */
	const getBackpackExpansionRect = function () {
		const slots = Array.prototype.slice.call(
			expansionLayer ? expansionLayer.querySelectorAll(".backpack-expansion-slot") : []
		);
		if (!slots.length) return getBackpackPlacementRect();
		const rects = slots.map(function (slot) { return slot.getBoundingClientRect(); });
		const left = Math.min.apply(null, rects.map(function (rect) { return rect.left; }));
		const top = Math.min.apply(null, rects.map(function (rect) { return rect.top; }));
		const right = Math.max.apply(null, rects.map(function (rect) { return rect.right; }));
		const bottom = Math.max.apply(null, rects.map(function (rect) { return rect.bottom; }));
		return { left: left, top: top, width: right - left, height: bottom - top };
	};

	/** 定位代理绕开 gameGroup 的堆叠上下文，目标元素重绘后也能通过 resolver 重新获取。 */
	const syncBackpackGuideTargets = function () {
		backpackGuideTargets.forEach(function (entry) {
			if (!entry.proxy) return;
			const source = entry.resolve && entry.resolve();
			const rect = source && typeof source.getBoundingClientRect === "function"
				? source.getBoundingClientRect() : source;
			if (!rect || !Number.isFinite(Number(rect.left)) || !Number.isFinite(Number(rect.top))) {
				entry.proxy.style.visibility = "hidden";
				return;
			}
			entry.proxy.style.visibility = "visible";
			entry.proxy.style.left = Math.round(rect.left) + "px";
			entry.proxy.style.top = Math.round(rect.top) + "px";
			entry.proxy.style.width = Math.max(1, Math.round(rect.width)) + "px";
			entry.proxy.style.height = Math.max(1, Math.round(rect.height)) + "px";
		});
	};

	/** 工作台在矮屏中可滚动；教程先展示目标，再同步高亮代理的位置。 */
	const revealBackpackGuideTarget = function (step) {
		if (!root || !step || !step.target) return;
		const target = step.target();
		if (!target) return;
		if (typeof target.getBoundingClientRect === "function") {
			if (root.contains(target)) target.scrollIntoView({ block: "nearest", inline: "nearest" });
			return;
		}
		const viewport = root.getBoundingClientRect();
		if (target.top < viewport.top + 20 || target.top + target.height > viewport.bottom - 20) {
			root.scrollTop += target.top + target.height / 2 - viewport.top - viewport.height / 2;
		}
	};

	const disableBackpackGuideInteraction = function () {
		document.body.classList.remove("backpack-guide-interactive");
		if (backpackGuideActionTarget && backpackGuideActionHandler) {
			backpackGuideActionTarget.removeEventListener("click", backpackGuideActionHandler, true);
			backpackGuideActionTarget.classList.remove("backpack-guide-action-target");
		}
		backpackGuideActionTarget = null;
		backpackGuideActionHandler = null;
		const host = getBackpackGuideHost();
		if (host && backpackGuideTour && backpackGuideTour.inProgress) {
			host.inert = true;
			host.setAttribute("aria-hidden", "true");
		}
	};

	const advanceBackpackGuide = function () {
		if (backpackGuideTour && backpackGuideTour.inProgress) backpackGuideTour.next();
	};

	const enableBackpackGuideInteraction = function (step) {
		disableBackpackGuideInteraction();
		const target = step && step.actionTarget && step.actionTarget();
		const host = getBackpackGuideHost();
		if (!target || !host) return;
		host.inert = false;
		host.removeAttribute("aria-hidden");
		document.body.classList.add("backpack-guide-interactive");
		target.classList.add("backpack-guide-action-target");
		backpackGuideActionTarget = target;
		backpackGuideActionHandler = function () {
			requestAnimationFrame(function () {
				if (!backpackGuideTour || !backpackGuideTour.inProgress) return;
				syncBackpackGuideTargets();
				advanceBackpackGuide();
			});
		};
		// 已摆放武器会在自身捕获监听中阻止冒泡，教程也使用捕获阶段才能可靠感知单击。
		target.addEventListener("click", backpackGuideActionHandler, true);
	};

	const openSecondaryActionsForGuide = function () {
		if (!secondaryActions || !secondaryActionsToggle) return;
		secondaryActions.classList.add("is-open");
		secondaryActionsToggle.setAttribute("aria-expanded", "true");
	};

	const cleanupBackpackGuide = function () {
		disableBackpackGuideInteraction();
		document.body.classList.remove("backpack-guide-active");
		if (root) root.classList.remove("backpack-guide-show-drag-actions");
		if (backpackGuideKeyHandler) document.body.removeEventListener("keyup", backpackGuideKeyHandler, true);
		backpackGuideKeyHandler = null;
		backpackGuideTargets.forEach(function (entry) {
			if (entry.proxy && entry.proxy.parentNode) entry.proxy.parentNode.removeChild(entry.proxy);
		});
		backpackGuideTargets = [];
		backpackGuideStep = null;
		backpackGuideStepIndex = -1;
		if (document.querySelector(".backpack-craft-root")
			&& plugin && typeof plugin.closeCraftPanel === "function") plugin.closeCraftPanel();
	};

	const endBackpackGuide = function () {
		const wasActive = !!backpackGuideTour || backpackGuideStartFrame != null
			|| backpackGuideLayoutFrame != null || backpackGuideTargets.length > 0
			|| document.body.classList.contains("backpack-guide-active");
		if (!wasActive) return;
		if (backpackGuideStartFrame != null) cancelAnimationFrame(backpackGuideStartFrame);
		if (backpackGuideLayoutFrame != null) cancelAnimationFrame(backpackGuideLayoutFrame);
		backpackGuideStartFrame = null;
		backpackGuideLayoutFrame = null;
		const currentTour = backpackGuideTour;
		if (currentTour && currentTour.inProgress) currentTour.end();
		backpackGuideTour = null;
		cleanupBackpackGuide();
	};

	const startBackpackGuide = function () {
		backpackGuideStartFrame = null;
		if (!root || !layout || !isGuideBackpack() || !getTopLeftPlacedWeapon()) return;
		const GuidesConstructor = window.Guides && (window.Guides.default || window.Guides);
		if (typeof GuidesConstructor !== "function") {
			backpackGuideStarted = true;
			console.error("背包教程启动失败：Guides.js 未加载");
			return;
		}
		backpackGuideStarted = true;
		const compact = layout.compact;
		const tooltip = function () {
			return detailPanel;
		};
		const craftArea = function () {
			const currentTooltip = detailPanel;
			return currentTooltip && (currentTooltip.querySelector(".bui-rarity-row")
				|| currentTooltip.querySelector("header") || currentTooltip);
		};
		const actionButton = function (className) {
			return root && root.querySelector("." + className);
		};
		const steps = [
			{ target: getBackpackPlacementRect, text: "这里就是会出战的武器，你需要自行规划武器的摆放以及方向，拖拽武器可以移动武器的位置" },
			{
				target: getTopLeftPlacedWeapon,
				text: "单击武器可以查看该武器的详细说明",
				leave: function () {
					const weapon = getTopLeftPlacedWeapon();
					if (weapon) weapon.click();
				}
			},
			{ target: tooltip, text: "这里会展示武器的名称、稀有度、伤害、命中率、攻击间隔、奥义获取、以及特殊效果" },
			{ target: craftArea, text: "如果武器可以向上合成，这里会出现合成提示按钮，点击可以查看该武器的合成表" },
			{
				target: function () { return root && root.querySelector(".backpack-battle-speed-control"); },
				text: "这里可以调整战斗动画的播放速度",
				beforeEnter: function () {
					uiCommon.hideTooltip();
					if (root) root.dataset.tooltipPinned = "false";
				}
			},
			{
				target: function () { return actionButton("backpack-action-craft"); },
				text: "这里可以开启合成窗口",
				beforeEnter: compact ? openSecondaryActionsForGuide : null,
				leave: function () {
					closeSecondaryActions();
					openCraftPanel();
				}
			},
			{ target: function () { return document.querySelector(".backpack-craft-recipes"); }, text: "当背包中武器可以合成时，可以点击高亮的选项快速填充合成材料" },
			{
				target: function () { return actionButton("backpack-action-collect-all"); },
				text: "可以快速将战斗区的武器全部收回到背包中",
				beforeEnter: function () {
					if (plugin && typeof plugin.closeCraftPanel === "function") plugin.closeCraftPanel();
					if (compact) openSecondaryActionsForGuide();
				},
				leave: function () {
					closeSecondaryActions();
					collectAll();
				}
			},
			{ target: function () { return inventoryPanel; }, text: "嘿嘿，我帮你全收回来了，这里是你拥有的所有武器，在待放置区域中并不会参与战斗，也不会提供联动效果" },
			{ target: function () { return root && root.querySelector(".backpack-inventory-filters"); }, text: "武器较多时可以按类型 或 星级进行筛选，快速找到想要的武器" },
			{
				target: function () { return root && root.querySelector(".backpack-inventory-list"); },
				text: compact
					? "点击武器可在下方查看详情，拖动武器图标放入背包后即可参与战斗"
					: "鼠标悬浮在武器上，可以看到武器的详细信息，通过拖拽武器，可以将该武器参与战斗"
			},
			{
				target: function () { return pendingDropZone; },
				text: "武器进入拖拽模式后，在这里松手可以将武器放回待放置中",
				beforeEnter: function () { if (root) root.classList.add("backpack-guide-show-drag-actions"); }
			},
			{ target: function () { return rotateDropZone; }, text: compact ? "将武器拖入该区域可以将武器旋转90°" : "将武器拖入该区域，或按R键，可以将武器旋转90°" },
			{
				target: function () { return sellDropZone; },
				text: "将武器拖入该区域并松手，可以卖出武器",
				leave: function () { if (root) root.classList.remove("backpack-guide-show-drag-actions"); }
			},
			{
				target: getBackpackExpansionRect,
				text: "使用背包格子解锁战斗区域，可以让你能够摆下更多的武器"
			},
			{
				target: function () { return root && root.querySelector(".backpack-close-button"); },
				text: "点击这里可以关闭背包，关闭之前确保你已经装备了足够多的武器，接下来你可能会面临一场恶战！"
			}
		];

		const guides = steps.map(function (step, index) {
			const proxy = document.createElement("div");
			proxy.className = "backpack-guide-target-proxy";
			proxy.setAttribute("aria-hidden", "true");
			document.body.appendChild(proxy);
			backpackGuideTargets.push({ resolve: step.target, proxy: proxy });
			return {
				target: proxy,
				html: step.text + "<small class='bb-guide-progress'>" + (index + 1) + " / " + steps.length + "</small>",
				backpackStep: step,
				backpackStepIndex: index
			};
		});
		syncBackpackGuideTargets();
		document.body.classList.add("backpack-guide-active");
		backpackGuideKeyHandler = function (event) {
			if (!backpackGuideTour || !backpackGuideTour.inProgress || event.key === "Escape") return;
			if (["ArrowRight", "ArrowLeft", " ", "Backspace"].indexOf(event.key) < 0) return;
			event.preventDefault();
			event.stopImmediatePropagation();
			if ((event.key === "ArrowRight" || event.key === " ")
				&& backpackGuideStep && !backpackGuideStep.requireAction) advanceBackpackGuide();
		};
		document.body.addEventListener("keyup", backpackGuideKeyHandler, true);
		try {
			backpackGuideTour = new GuidesConstructor({
				color: "#f2c86f",
				distance: 36,
				className: "bb-battle-guide backpack-guide",
				guides: guides,
				render: function (event) {
					const nextIndex = event.guide.backpackStepIndex;
					if (backpackGuideStep && nextIndex > backpackGuideStepIndex
						&& typeof backpackGuideStep.leave === "function") backpackGuideStep.leave();
					disableBackpackGuideInteraction();
					backpackGuideStep = event.guide.backpackStep;
					backpackGuideStepIndex = nextIndex;
					if (typeof backpackGuideStep.beforeEnter === "function") backpackGuideStep.beforeEnter();
					revealBackpackGuideTarget(backpackGuideStep);
					syncBackpackGuideTargets();
					if (backpackGuideStep.requireAction) {
						requestAnimationFrame(function () { enableBackpackGuideInteraction(backpackGuideStep); });
					}
				},
				end: function (event) {
					const completed = event.sender.current >= steps.length;
					cleanupBackpackGuide();
					if (backpackGuideTour === event.sender) backpackGuideTour = null;
					if (completed) {
						backpackGuideCompletionDialoguePending = true;
						if (core.setFlag) core.setFlag("inGuide", false);
					}
				}
			});
			backpackGuideTour.start();
		} catch (error) {
			backpackGuideTour = null;
			cleanupBackpackGuide();
			console.error("背包教程启动失败", error);
		}
	};

	const queueBackpackGuide = function () {
		if (backpackGuideStarted || backpackGuideStartFrame != null
			|| backpackGuideLayoutFrame != null || !isGuideBackpack()) return;
		backpackGuideStartFrame = requestAnimationFrame(function () {
			backpackGuideStartFrame = null;
			backpackGuideLayoutFrame = requestAnimationFrame(function () {
				backpackGuideLayoutFrame = null;
				startBackpackGuide();
			});
		});
	};

	/** 共用详情区读取实例属性；桌面支持悬停，竖屏仅点击后展开浮层。 */
	const selectWeapon = function (instanceId, pinned) {
		if (!root || dragState || !findEntry(instanceId)) return;
		if (layout && layout.compact && !pinned) return;
		selectedInstanceId = instanceId;
		if (pinned) detailPinned = true;
		renderWeaponDetails();
	};

	const clearWeaponSelection = function () {
		if (!root || dragState) return;
		selectedInstanceId = null;
		detailPinned = false;
		clearSynergyHighlights();
		renderWeaponDetails();
	};

	const renderWeaponDetails = function () {
		if (!detailContent) return;
		const entry = findEntry(selectedInstanceId);
		const previousId = detailPanel.dataset.instanceId;
		const scrollTop = detailContent.scrollTop;
		uiCommon.releaseWeaponUI(detailContent);
		detailContent.innerHTML = "";
		selectedInstanceId = entry ? entry.instanceId : null;
		detailPanel.dataset.instanceId = selectedInstanceId || "";
		root.dataset.detailOpen = entry && detailPinned && !dragState ? "true" : "false";
		root.querySelectorAll(".backpack-placed, .backpack-inventory-tile").forEach(function (element) {
			const selected = !!entry && element.dataset.instanceId === String(entry.instanceId);
			element.classList.toggle("is-selected", selected);
			element.setAttribute("aria-selected", String(selected));
		});
		if (!entry) {
			detailPinned = false;
			clearSynergyHighlights();
			detailContent.innerHTML = "<div class='backpack-detail-empty'><span aria-hidden='true'>◇</span><h2>武器详情</h2><p>点击武器查看属性与合成配方</p><small>将物品拖入背包，组建你的战斗阵容</small></div>";
			return;
		}
		const attributes = entry.col != null ? calculateBackpackAttributes().byInstanceId[entry.instanceId] : entry.weapon;
		detailContent.innerHTML = uiCommon.buildWeaponTooltip({ weapon: entry.weapon, base: entry.weapon, current: attributes || entry.weapon });
		const article = detailContent.querySelector("article");
		const sourceName = article.querySelector("header small");
		if (sourceName && sourceName.textContent === entry.weapon.name) sourceName.remove();
		const overview = document.createElement("div");
		overview.className = "backpack-detail-overview";
		const effects = document.createElement("div");
		effects.className = "backpack-detail-effects";
		const portrait = document.createElement("div");
		portrait.className = "backpack-detail-portrait";
		portrait.appendChild(getWeaponCardRenderer().buildWeaponPreview(entry.weapon, { includeSynergy: false, paddingCells: 0 }));
		const view = createButton("查看大图", function () {
			getWeaponCardRenderer().openPreviewModal(entry.weapon, { force: true, trigger: view });
		});
		portrait.appendChild(view);
		overview.appendChild(portrait);
		["header", ".bui-type-row", ".bui-weapon-tip-main"].forEach(function (selector) {
			const part = article.querySelector(selector); if (part) overview.appendChild(part);
		});
		const bounds = getBounds(entry.weapon, entry.rotation);
		const sizeTag = document.createElement("i");
		sizeTag.textContent = bounds.cols + " × " + bounds.rows;
		overview.querySelector(".bui-type-row").appendChild(sizeTag);
		Array.from(article.querySelectorAll("section")).forEach(function (section) { effects.appendChild(section); });
		article.appendChild(overview); article.appendChild(effects);
		const recipes = uiCommon.getWeaponRecipes(entry.weapon);
		const recipeSection = document.createElement("section");
		recipeSection.className = "backpack-detail-crafting";
		recipeSection.innerHTML = "<h4>合成提示</h4>";
		if (recipes.length) {
			const recipe = recipes[0];
			const definitions = weaponDefinitions_9f2e6f5b_4b2c_4f8c_9a3d_7e1b6c0d5a44;
			const formula = document.createElement("div");
			formula.className = "backpack-detail-recipe";
			[recipe.a, "+", recipe.b, "→", recipe.result].forEach(function (key) {
				const item = document.createElement("span");
				if (definitions[key]) {
					item.className = "backpack-detail-recipe-item";
					item.title = definitions[key].name;
					item.appendChild(getWeaponCardRenderer().buildWeaponPreview(definitions[key], { includeSynergy: false, paddingCells: 0 }));
				} else { item.className = "backpack-detail-recipe-symbol"; item.textContent = key; }
				formula.appendChild(item);
			});
			recipeSection.appendChild(formula);
			const recipeButton = createButton("查看配方", function () { uiCommon.openWeaponRecipePreview(entry.weapon); });
			recipeSection.appendChild(recipeButton);
		} else recipeSection.innerHTML += "<p>此武器暂无合成配方</p>";
		effects.appendChild(recipeSection);
		detailContent.scrollTop = previousId === String(entry.instanceId) ? scrollTop : 0;
		if (entry.col != null) renderSynergyHighlights(entry); else clearSynergyHighlights();
	};

	const rotateSelection = function () {
		if (dragState) { rotateDrag(); return; }
		const entry = findEntry(selectedInstanceId);
		if (!entry) return;
		if (entry.col != null) rotatePlaced(entry.instanceId);
		else { entry.rotation = normalizeRotation(entry.rotation + 90); persistState(); renderAll(); }
	};

	const createWorkspacePanels = function () {
		boardPanel = document.createElement("section");
		boardPanel.className = "backpack-board-panel";
		boardPanel.innerHTML = "<header class='backpack-board-heading'><h1>我的背包</h1><span>拖动 · 旋转 · 构筑你的战斗组合</span></header>";
		expansionCountLabel = document.createElement("span");
		expansionCountLabel.className = "backpack-expansion-count";
		boardPanel.querySelector("header").appendChild(expansionCountLabel);
		root.appendChild(boardPanel);
		boardControls = document.createElement("aside");
		boardControls.className = "backpack-board-controls";
		const rotateButton = createButton("旋转 R", rotateSelection);
		rotateButton.classList.add("backpack-rotate-drag-button");
		boardControls.appendChild(rotateButton);
		const hint = document.createElement("p"); hint.innerHTML = "拖动摆放<br>点击查看<br><span aria-hidden='true'>◇<br>│<br>✦</span>";
		boardControls.appendChild(hint); root.appendChild(boardControls);
		detailPanel = document.createElement("section");
		detailPanel.className = "backpack-details weapon-ui-skin";
		detailPanel.setAttribute("aria-label", "武器详情");
		const detailHeading = document.createElement("div");
		detailHeading.className = "backpack-detail-heading";
		const detailTitle = document.createElement("span");
		detailTitle.textContent = "武器详情";
		detailHeading.appendChild(detailTitle);
		const closeDetails = createButton("收起", function () {
			clearWeaponSelection();
			focusBackpackForDrag();
		});
		closeDetails.setAttribute("aria-label", "收起武器详情");
		detailHeading.appendChild(closeDetails);
		detailPanel.appendChild(detailHeading);
		detailContent = document.createElement("div");
		detailContent.className = "backpack-detail-content";
		detailPanel.appendChild(detailContent);
		detailPanel.addEventListener("click", function (event) {
			const hammer = event.target.closest("[data-bui-craft-key]");
			if (hammer) { event.stopPropagation(); uiCommon.openWeaponRecipePreview(hammer.dataset.buiCraftKey); }
		});
		root.appendChild(detailPanel);
	};

	/** 创建背包所需 DOM 图层、工具栏和全局事件监听。 */
	const buildInterface = function () {
		gameGroup = document.getElementById("gameGroup");
		if (!gameGroup) return false;
		expandedInventoryDetailsId = null;
		inventoryTypeFilter = "all";
		inventoryRarityFilter = "all";
		clearInventoryDragGesture();
		suppressInventoryClickUntil = 0;
		clearPlacedDragGesture();
		suppressPlacedClickUntil = 0;

		root = document.createElement("div");
		root.id = "backpack-system-root";
		root.dataset.layout = "atelier";
		selectedInstanceId = null; detailPinned = false;

		createWorkspacePanels();
		bagCanvas = document.createElement("canvas");
		bagCanvas.className = "backpack-grid-canvas";
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
		root.appendChild(createDragActions());

		dragLayer = document.createElement("div");
		dragLayer.className = "backpack-drag-layer";
		root.appendChild(dragLayer);

		// 售卖区：把武器拖到此处自动出售，每把固定 CONFIG.sellPrice 金币。
		sellZone = document.createElement("div");
		sellZone.className = "backpack-sell-zone";
		const sellTitle = document.createElement("div");
		sellTitle.className = "backpack-sell-title";
		sellTitle.textContent = "拖到此处出售";
		const sellHint = document.createElement("div");
		sellHint.className = "backpack-sell-hint";
		sellHint.textContent = "每把获得 " + CONFIG.sellPrice + " 金币";
		sellZone.appendChild(sellTitle);
		sellZone.appendChild(sellHint);
		root.appendChild(sellZone);

		toolbarElement = document.createElement("div");
		toolbarElement.className = "backpack-toolbar";
		const speedControl = createBattleSpeedControl();
		toolbarElement.appendChild(speedControl);
		uiCommon.decorateWeaponSurface(speedControl, { button: true });
		const craftButton = createButton("合成", openCraftPanel, true);
		craftButton.classList.add("backpack-action-craft");
		toolbarElement.appendChild(craftButton);
		const collectButton = createButton("一键收回", collectAll);
		collectButton.classList.add("backpack-action-collect-all");
		toolbarElement.appendChild(collectButton);
		returnButton = createButton("返回", function () { closeBackpack(); });
		returnButton.classList.add("backpack-close-button");
		root.appendChild(returnButton);
		root.appendChild(toolbarElement);
		root.addEventListener("pointerdown", function (event) {
			if (secondaryActions && !secondaryActions.contains(event.target)) closeSecondaryActions();
			const control = event.target && event.target.closest
				? event.target.closest(".backpack-placed, .backpack-inventory-tile, .backpack-details, button, select, label") : null;
			if (!control) clearWeaponSelection();
		});
		renderBattleSpeedControl();

		document.documentElement.classList.add("backpack-workspace-open");
		document.body.classList.add("backpack-workspace-open");
		gameGroup.appendChild(root);
		[boardPanel, detailPanel, sellZone].forEach(function (panel) { uiCommon.decorateWeaponSurface(panel, { radius: 22, ornate: true }); });
		uiCommon.registerModal(root, closeBackpack, { name: "backpack" });
		window.addEventListener("resize", renderAll);
		if (typeof ResizeObserver !== "undefined") {
			viewportObserver = new ResizeObserver(function () { if (root) renderAll(); });
			viewportObserver.observe(document.getElementById("outerUI") || gameGroup);
		}
		document.addEventListener("pointermove", onPointerMove, true);
		document.addEventListener("pointerup", onPointerUp, true);
		document.addEventListener("pointercancel", onPointerCancel, true);
		document.addEventListener("keydown", onKeyDown, true);
		document.addEventListener("keyup", onKeyUp, true);
		renderAll();
		queueBackpackGuide();
		return true;
	};

	/** 判断页面坐标（clientX/clientY）是否落在售卖区内。 */
	const isInSellZone = function (clientX, clientY) {
		return getDragAction(clientX, clientY) === "sell";
	};

	const stopDragScroll = function () {
		if (dragScrollFrame != null) cancelAnimationFrame(dragScrollFrame);
		dragScrollFrame = null;
	};

	/** 矮屏拖到上下边缘时滚动工作区，保持武器在指针下并重新计算落点。 */
	const scrollDuringDrag = function () {
		dragScrollFrame = null;
		if (!root || !dragState || !dragState.clientPoint) return;
		const point = dragState.clientPoint, rect = root.getBoundingClientRect();
		const edge = 44;
		const velocity = point.y < rect.top + edge ? -Math.min(10, (rect.top + edge - point.y) / 4)
			: point.y > rect.bottom - edge ? Math.min(10, (point.y - rect.bottom + edge) / 4) : 0;
		if (!velocity) return;
		const previous = root.scrollTop;
		root.scrollTop += velocity;
		if (root.scrollTop === previous) return;
		dragState.point = pointToLocal(point.x, point.y);
		updateDragElement(); drawBag(); updateDragAction(getDragAction(point.x, point.y));
		dragScrollFrame = requestAnimationFrame(scrollDuringDrag);
	};

	/** 全局指针移动处理：更新拖拽物位置、目标格颜色和售卖区高亮。 */
	const onPointerMove = function (event) {
		if (!dragState || !root) return;
		event.preventDefault();
		dragState.clientPoint = { x: event.clientX, y: event.clientY };
		if (dragScrollFrame == null) dragScrollFrame = requestAnimationFrame(scrollDuringDrag);
		dragState.point = pointToLocal(event.clientX, event.clientY);
		updateDragElement();
		drawBag();
		const dropAction = getDragAction(event.clientX, event.clientY);
		updateDragAction(dropAction);
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
		clearInventoryDragGesture();
		clearPlacedDragGesture();
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
		if (!root || !uiCommon.isTopModal(root)) return;
		if (isBackpackCloseKey(event)) {
			event.preventDefault();
			event.stopImmediatePropagation();
		} else if ((event.key === "r" || event.key === "R") && (dragState || selectedInstanceId)
			&& !/^(INPUT|SELECT|TEXTAREA)$/.test(event.target && event.target.tagName || "")) {
			event.preventDefault();
			event.stopImmediatePropagation();
			rotateSelection();
		}
	};

	/** 在捕获阶段消费 ESC/X 的 keyup，再关闭背包，避免事件落到系统菜单。 */
	const onKeyUp = function (event) {
		if (!root || !uiCommon.isTopModal(root) || !isBackpackCloseKey(event)) return;
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
		if (core.getFlag && core.getFlag("disableOpenBackpack")) {
			if (core.drawTip) core.drawTip("当前无法操作背包");
			return false;
		}
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
		return buildInterface();
	};

	/**
	 * 关闭背包并移除全部 DOM/事件监听。keepLocked 用于读档重置时保持引擎锁定状态。
	 */
	const closeBackpack = function (options) {
		options = options || {};
		const showGuideCompletionDialogue = backpackGuideCompletionDialoguePending && !options.keepLocked;
		backpackGuideCompletionDialoguePending = false;
		endBackpackGuide();
		backpackGuideStarted = false;
		uiCommon.hideTooltip();
		clearBackpackTooltipPlacement();
		clearInventoryDragGesture();
		clearPlacedDragGesture();
		closeSecondaryActions();
		cancelDrag();
		window.removeEventListener("resize", renderAll);
		if (viewportObserver) viewportObserver.disconnect();
		viewportObserver = null;
		document.removeEventListener("pointermove", onPointerMove, true);
		document.removeEventListener("pointerup", onPointerUp, true);
		document.removeEventListener("pointercancel", onPointerCancel, true);
		document.removeEventListener("keydown", onKeyDown, true);
		document.removeEventListener("keyup", onKeyUp, true);
		uiCommon.unregisterModal(root);
		uiCommon.releaseWeaponUI(root);
		if (root) root.remove();
		document.documentElement.classList.remove("backpack-workspace-open");
		document.body.classList.remove("backpack-workspace-open");
		root = null;
		boardPanel = boardControls = detailPanel = detailContent = returnButton = null;
		selectedInstanceId = null; detailPinned = false;
		sellZone = null;
		dragActions = null;
		pendingDropZone = null;
		rotateDropZone = null;
		sellDropZone = null;
		toolbarElement = null;
		secondaryActions = null;
		secondaryActionsToggle = null;
		expandedInventoryDetailsId = null;
		inventoryTypeFilter = "all";
		inventoryRarityFilter = "all";
		suppressPlacedClickUntil = 0;
		bagCanvas = null;
		bagContext = null;
		inventoryPanel = null;
		expansionLayer = null;
		expansionCountLabel = null;
		battleSpeedSelect = null;
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
		if (showGuideCompletionDialogue && core.insertAction) {
			core.insertAction([
				"\t[艾露达,N447]很好，你已经学会了所有内容，是时候来场真男人之间1V1的决斗了，来战胜我，迈出征服魔塔的第一步吧！"
			]);
		}
		return true;
	};

	/**
	 * 从中央武器定义创建独立实例。传入对象时也只读取身份字段，再按 definitionId 取最新定义。
	 * autoPlace=true 时自动找位置，否则进入待摆放库存。
	 * uniqueKey 可用于需要全局唯一的特殊物品；普通同类武器默认允许重复。
	 */
	const addBackpackWeapon = function (weapon, options) {
		options = options || {};
		readState();
		const definitionId = resolveWeaponDefinitionId(options.definitionId)
			|| resolveWeaponDefinitionId(weapon);
		const sourceItemCandidate = options.itemId || options.sourceItemId
			|| (weapon && typeof weapon === "object" && weapon.sourceItemId);
		const itemId = sourceItemCandidate
			&& resolveWeaponDefinitionId(sourceItemCandidate) === definitionId
			? String(sourceItemCandidate)
			: null;
		const requestedUniqueKey = options.uniqueKey == null ? null : String(options.uniqueKey);
		const normalized = definitionId
			? buildRuntimeWeapon(definitionId, itemId, requestedUniqueKey)
			: null;
		if (!normalized) {
			if (core.drawTip) core.drawTip("找不到武器中央定义，无法加入背包");
			return null;
		}
		const uniqueKey = requestedUniqueKey || normalized.uniqueKey;
		if (uniqueKey) {
			const existing = getAllEntries().find(function (entry) {
				return entry.weapon.uniqueKey === uniqueKey;
			});
			if (existing) return existing.instanceId;
			normalized.uniqueKey = uniqueKey;
		}
		const entry = {
			instanceId: String(options.instanceId || makeInstanceId()),
			definitionId: definitionId,
			itemId: itemId,
			weapon: normalized,
			rotation: normalizeRotation(options.rotation)
		};
		if (uniqueKey) entry.uniqueKey = uniqueKey;
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
		syncInstanceIdCounter([entry]);
		persistState();
		if (options.recordRoute !== false && state.placed.indexOf(entry) >= 0) {
			recordWeaponEnter(entry);
			recordWeaponMove(entry);
		}
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

	/** 清空已摆放与待摆放物品；可同时把扩展区域恢复为新游戏初始格子。 */
	const clearBackpackItems = function (options) {
		options = options || {};
		readState();
		const removedCount = state.placed.length + state.inventory.length;
		state.placed = [];
		state.inventory = [];
		if (options.resetUnlockedCells) {
			state.unlockedCells = normalizeUnlockedCells(getInitialUnlockedCells());
		}
		core.setFlag(CONFIG.instanceIdFlag, 0);
		persistState();
		renderAll();
		return removedCount;
	};

	/**
	 * 将地图道具引用的中央武器定义转换成独立实例。
	 * 默认不去重：拾取或使用同类武器多次，就会得到多个实例。
	 */
	const addBackpackItem = function (itemId, options) {
		options = options || {};
		const item = core.material.items[itemId];
		const definitionId = item && resolveWeaponDefinitionId(item.backpackWeaponId || itemId);
		const weapon = definitionId && getWeaponDefinition(definitionId);
		if (!item || !weapon) {
			if (core.drawTip) core.drawTip("该道具没有配置背包物品");
			return null;
		}
		const instanceId = addBackpackWeapon(weapon, {
			definitionId: definitionId,
			itemId: itemId,
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
			const definitionId = resolveWeaponDefinitionId(item.backpackWeaponId);
			const sourceWeapon = definitionId && getWeaponDefinition(definitionId);
			if (!sourceWeapon) return;
			const owned = core.itemCount(itemId);
			const existing = getAllEntries().filter(function (entry) {
				return entry.itemId === itemId;
			}).length;
			for (let index = existing; index < owned; index++) {
				const weapon = buildRuntimeWeapon(definitionId, itemId);
				if (!weapon) break;
				state.inventory.push({
					instanceId: makeInstanceId(),
					definitionId: definitionId,
					itemId: itemId,
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
	// 公共实例管理 API：分别支持通用定义、地图道具、旧存档同步、删除和旧拖拽。
	this.addBackpackWeapon = addBackpackWeapon;
	this.addBackpackItem = addBackpackItem;
	this.syncBackpackItems = syncBackpackItems;
	this.removeBackpackWeapon = removeBackpackWeapon;
	this.clearBackpackItems = clearBackpackItems;
	this.startDragWeapon = startDragWeapon;

	// 兼容已经写进 items.js 和状态栏中的旧接口。
	this.boxbar = openBackpack;
	this.closeBoxbar = closeBackpack;
	this.updateBackpack = renderAll;

	/** 成功执行一条背包录像后，把动作纳入当前路线并继续回放。 */
	const finishBackpackReplayAction = function (action) {
		if (core.status && Array.isArray(core.status.route)) core.status.route.push(action);
		if (typeof core.replay === "function") core.replay();
		return true;
	};

	/**
	 * 录像回放：只接受 bp 增量动作。instanceId 找不到、位置冲突或扩容不合法时返回 false，
	 * 由录像系统按无法识别的错误动作处理，避免静默产生与原录像不同的背包。
	 */
	if (core.control && typeof core.control.registerReplayAction === "function") {
		core.control.registerReplayAction("bp", function (action) {
			if (typeof action !== "string" || action.indexOf("bp:") !== 0) return false;
			readState();

			let matched = action.match(/^bp:-1:(-?\d+):(-?\d+)$/);
			if (matched) {
				const cell = fromLogicalCell(Number(matched[1]), Number(matched[2]));
				if (!unlockBackpackCell(cell.col, cell.row, { recordRoute: false, silent: true })) return false;
				return finishBackpackReplayAction(action);
			}

			matched = action.match(/^bp:-2:([^:]+):([^:]+)$/);
			if (matched) {
				const firstInstanceId = matched[1];
				const secondInstanceId = matched[2];
				if (firstInstanceId === secondInstanceId) return false;
				const craft = core.plugin && core.plugin.craftBackpackWeaponsByInstanceIds;
				if (typeof craft !== "function") return false;
				if (!craft(firstInstanceId, secondInstanceId, { recordRoute: false, silent: true })) return false;
				readState();
				return finishBackpackReplayAction(action);
			}

			matched = action.match(/^bp:([^:]+):([ios])$/);
			if (matched) {
				const instanceId = matched[1];
				const operation = matched[2];
				const entry = findEntry(instanceId);
				if (!entry) return false;
				if (operation === "i") return finishBackpackReplayAction(action);
				if (operation === "o") {
					if (!state.placed.some(function (placed) { return placed.instanceId === instanceId; })) return false;
					removeEntryFromLists(instanceId);
					delete entry.col;
					delete entry.row;
					state.inventory.push(entry);
					persistState();
					return finishBackpackReplayAction(action);
				}
				removeEntryFromLists(instanceId);
				persistState();
				core.status.hero.money = Math.floor(Number(core.status.hero.money) || 0) + CONFIG.sellPrice;
				if (core.updateStatusBar) core.updateStatusBar();
				return finishBackpackReplayAction(action);
			}

			matched = action.match(/^bp:([^:]+):m:([0-3]):(-?\d+):(-?\d+)$/);
			if (!matched) return false;
			const instanceId = matched[1];
			const entry = findEntry(instanceId);
			if (!entry) return false;
			const rotation = Number(matched[2]) * 90;
			const cell = fromLogicalCell(Number(matched[3]), Number(matched[4]));
			if (!canPlace(entry, cell.col, cell.row, rotation, instanceId)) return false;
			removeEntryFromLists(instanceId);
			entry.col = cell.col;
			entry.row = cell.row;
			entry.rotation = rotation;
			state.placed.push(entry);
			persistState();
			return finishBackpackReplayAction(action);
		});
	}
	}).call(plugin);
};
