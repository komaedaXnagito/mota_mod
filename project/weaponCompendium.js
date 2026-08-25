/**
 * 武器图鉴（局外系统）。
 *
 * 职责边界：
 * - 只读取 project/weapons.js 的武器定义；
 * - 只通过背包公开 API 记录“本局获得过”的武器，不读写战斗状态；
 * - 永久解锁、奖励领取记录保存在 core.get/setLocalStorage 对应的局外存储中；
 * - 图鉴界面、搜索、筛选、奖励判定全部封装在本文件。
 */

/**
 * 图鉴配置。奖励数组默认留空，避免在未确定正式奖励前改变游戏数值。
 * 配置格式和所有支持项见根目录《武器图鉴系统设计文档.md》；示例：
 * {
 *   id: "unlock_10",
 *   title: "小有收藏",
 *   condition: { type: "unlockedCount", operator: ">=", value: 10 },
 *   rewards: [{ type: "metaValue", key: "compendiumPoints", operator: "add", value: 1, text: "图鉴点数 +1" }]
 * }
 */
var weaponCompendiumConfig_67d72d42_4e7b_4ad9_9fc1_72d6b8e78f31 = {
	storageKey: "weaponCompendiumProfileV1",
	runObtainedFlag: "__weapon_compendium_run_obtained__",
	runCommittedFlag: "__weapon_compendium_run_committed__",
	eventId: "weaponCompendium",
	// 仅用于从上一版错误命名迁移数据；所有新数据只写入 Compendium 键。
	legacyStorageKeys: ["weaponCodexProfileV1"],
	legacyRunObtainedFlags: ["__weapon_codex_run_obtained__"],
	legacyRunCommittedFlags: ["__weapon_codex_run_committed__"],
	rewards: []
};

/** 安装独立武器图鉴。 */
var installWeaponCompendium_1a6d635c_008d_4bb5_a44a_e62e80ffad37 = function (core, plugin) {
	"use strict";
	if (plugin.weaponCompendium && plugin.weaponCompendium.__installed) return plugin.weaponCompendium;

	var CONFIG = weaponCompendiumConfig_67d72d42_4e7b_4ad9_9fc1_72d6b8e78f31;
	var DEFINITIONS = weaponDefinitions_9f2e6f5b_4b2c_4f8c_9a3d_7e1b6c0d5a44 || {};
	var definitionKeys = Object.keys(DEFINITIONS);
	var runtimeIdToKey = {};
	var root = null;
	var openedWhilePlaying = false;
	var modalKeyDown = null;
	var modalKeyUp = null;
	var cardRenderer = plugin.weaponCardRenderer
		|| (typeof installWeaponCardRenderer_5ca7b6bd_8f36_4e6a_aa12_f8468a8ccf1c === "function"
			? installWeaponCardRenderer_5ca7b6bd_8f36_4e6a_aa12_f8468a8ccf1c(core, plugin) : null);

	definitionKeys.forEach(function (key) {
		var definition = DEFINITIONS[key];
		if (definition && definition.id != null) runtimeIdToKey[String(definition.id)] = key;
	});

	var cloneData = function (value) {
		if (value == null) return value;
		if (core.clone) return core.clone(value);
		return JSON.parse(JSON.stringify(value));
	};

	var uniqueStrings = function (values) {
		var seen = {};
		return (Array.isArray(values) ? values : []).map(function (value) {
			return String(value);
		}).filter(function (value) {
			if (!value || seen[value]) return false;
			seen[value] = true;
			return true;
		});
	};

	var defaultProfile = function () {
		return {
			version: 2,
			unlockedWeaponIds: [],
			clearedWeaponIds: [],
			claimedRewardIds: [],
			values: {},
			stats: {
				victories: 0,
				unlockEvents: 0,
				lastUnlockedAt: null
			}
		};
	};

	var normalizeProfile = function (source) {
		source = source && typeof source === "object" ? source : {};
		var profile = defaultProfile();
		profile.unlockedWeaponIds = uniqueStrings(source.unlockedWeaponIds).filter(function (key) {
			return !!DEFINITIONS[key];
		});
		profile.clearedWeaponIds = uniqueStrings(source.clearedWeaponIds).filter(function (key) {
			return !!DEFINITIONS[key];
		});
		// 能被记录为“使用其通关”的武器必然也已经解锁；兼容手工编辑和未来迁移数据。
		profile.clearedWeaponIds.forEach(function (key) {
			if (profile.unlockedWeaponIds.indexOf(key) < 0) profile.unlockedWeaponIds.push(key);
		});
		profile.claimedRewardIds = uniqueStrings(source.claimedRewardIds);
		profile.values = source.values && typeof source.values === "object" && !Array.isArray(source.values)
			? cloneData(source.values) : {};
		var stats = source.stats && typeof source.stats === "object" ? source.stats : {};
		profile.stats.victories = Math.max(0, Math.floor(Number(stats.victories) || 0));
		profile.stats.unlockEvents = Math.max(0, Math.floor(Number(stats.unlockEvents) || 0));
		profile.stats.lastUnlockedAt = stats.lastUnlockedAt == null ? null : String(stats.lastUnlockedAt);
		return profile;
	};

	var readProfile = function () {
		var source = core.getLocalStorage(CONFIG.storageKey, null);
		if (source == null) {
			(Array.isArray(CONFIG.legacyStorageKeys) ? CONFIG.legacyStorageKeys : []).some(function (legacyKey) {
				source = core.getLocalStorage(legacyKey, null);
				return source != null;
			});
			if (source != null) core.setLocalStorage(CONFIG.storageKey, normalizeProfile(source));
		}
		return normalizeProfile(source);
	};

	var writeProfile = function (profile) {
		return core.setLocalStorage(CONFIG.storageKey, normalizeProfile(profile)) !== false;
	};

	/** 将地图物品 ID、中央定义 key 或运行时武器对象统一成中央定义 key。 */
	var resolveWeaponKey = function (weaponOrId) {
		if (weaponOrId == null) return null;
		if (typeof weaponOrId === "string" || typeof weaponOrId === "number") {
			var direct = String(weaponOrId);
			if (DEFINITIONS[direct]) return direct;
			var item = core.material && core.material.items && core.material.items[direct];
			if (item && item.backpackWeaponId && DEFINITIONS[item.backpackWeaponId]) {
				return item.backpackWeaponId;
			}
			return runtimeIdToKey[direct] || null;
		}
		if (typeof weaponOrId !== "object") return null;
		if (weaponOrId.definitionId && DEFINITIONS[weaponOrId.definitionId]) {
			return String(weaponOrId.definitionId);
		}
		if (weaponOrId.weapon && typeof weaponOrId.weapon === "object") {
			var nestedKey = resolveWeaponKey(weaponOrId.weapon);
			if (nestedKey) return nestedKey;
		}
		if (weaponOrId.compendiumId && DEFINITIONS[weaponOrId.compendiumId]) return weaponOrId.compendiumId;
		if (weaponOrId.codexId && DEFINITIONS[weaponOrId.codexId]) return weaponOrId.codexId;
		if (weaponOrId.sourceItemId) {
			var sourceKey = resolveWeaponKey(weaponOrId.sourceItemId);
			if (sourceKey) return sourceKey;
		}
		if (weaponOrId.id != null && runtimeIdToKey[String(weaponOrId.id)]) {
			return runtimeIdToKey[String(weaponOrId.id)];
		}
		return null;
	};

	var readRunObtained = function () {
		if (!core.getFlag) return [];
		var obtained = core.getFlag(CONFIG.runObtainedFlag, []);
		(Array.isArray(CONFIG.legacyRunObtainedFlags) ? CONFIG.legacyRunObtainedFlags : []).forEach(function (legacyFlag) {
			obtained = (Array.isArray(obtained) ? obtained : []).concat(core.getFlag(legacyFlag, []) || []);
		});
		return uniqueStrings(obtained).filter(function (key) {
			return !!DEFINITIONS[key];
		});
	};

	var isRunCommitted = function () {
		if (!core.getFlag) return false;
		if (core.getFlag(CONFIG.runCommittedFlag, false)) return true;
		return (Array.isArray(CONFIG.legacyRunCommittedFlags) ? CONFIG.legacyRunCommittedFlags : [])
			.some(function (legacyFlag) { return !!core.getFlag(legacyFlag, false); });
	};

	/** 只记录到当前存档 flag；出售武器不会删除这个集合。 */
	var recordObtained = function (weaponOrId) {
		var key = resolveWeaponKey(weaponOrId);
		if (!key || !core.setFlag) return false;
		var obtained = readRunObtained();
		if (obtained.indexOf(key) >= 0) return false;
		obtained.push(key);
		core.setFlag(CONFIG.runObtainedFlag, obtained);
		return true;
	};

	/** 把当前仍在背包内的武器并入本局历史，兼容旧存档和外部脚本直接写背包 flag。 */
	var recordCurrentBackpack = function () {
		if (!core.getFlag) return [];
		var state = core.getFlag("__backpack_state__", {}) || {};
		var keys = [];
		(Array.isArray(state.placed) ? state.placed : [])
			.concat(Array.isArray(state.inventory) ? state.inventory : [])
			.forEach(function (entry) {
				var key = resolveWeaponKey(entry);
				if (!key) return;
				recordObtained(key);
				keys.push(key);
			});
		return uniqueStrings(keys);
	};

	var getUnlockedLookup = function (profile) {
		var lookup = {};
		profile.unlockedWeaponIds.forEach(function (key) { lookup[key] = true; });
		return lookup;
	};

	var countUnlockedType = function (profile, weaponType) {
		var unlocked = getUnlockedLookup(profile);
		return definitionKeys.filter(function (key) {
			var types = DEFINITIONS[key] && DEFINITIONS[key].weaponTypes;
			return unlocked[key] && Array.isArray(types) && types.indexOf(weaponType) >= 0;
		}).length;
	};

	var compare = function (actual, operator, expected) {
		switch (operator || ">=") {
			case ">": return actual > expected;
			case "<=": return actual <= expected;
			case "<": return actual < expected;
			case "==": case "=": return actual == expected; // 配置值允许数字字符串。
			case "===": return actual === expected;
			case "!=": return actual != expected;
			case "!==": return actual !== expected;
			default: return actual >= expected;
		}
	};

	/** 奖励条件解释器：仅消费数据对象，不执行配置中的任意代码。 */
	var evaluateCondition = function (condition, profile) {
		if (Array.isArray(condition)) {
			return condition.every(function (item) { return evaluateCondition(item, profile); });
		}
		if (!condition || typeof condition !== "object") return false;
		if (condition.type === "all") {
			return (condition.conditions || []).every(function (item) { return evaluateCondition(item, profile); });
		}
		if (condition.type === "any") {
			return (condition.conditions || []).some(function (item) { return evaluateCondition(item, profile); });
		}
		if (condition.type === "not") return !evaluateCondition(condition.condition, profile);

		var actual;
		if (condition.type === "unlockedCount") actual = profile.unlockedWeaponIds.length;
		else if (condition.type === "unlockedRatio") {
			actual = definitionKeys.length ? profile.unlockedWeaponIds.length / definitionKeys.length : 0;
		}
		else if (condition.type === "weaponUnlocked") {
			var key = resolveWeaponKey(condition.weaponId);
			return !!key && profile.unlockedWeaponIds.indexOf(key) >= 0;
		}
		else if (condition.type === "weaponTypeCount") {
			actual = countUnlockedType(profile, String(condition.weaponType || ""));
		}
		else if (condition.type === "allWeaponsUnlocked") {
			return definitionKeys.length > 0 && profile.unlockedWeaponIds.length >= definitionKeys.length;
		}
		else if (condition.type === "metaValue") {
			actual = profile.values[String(condition.key || "")];
		}
		else return false;
		return compare(Number(actual) || 0, condition.operator, Number(condition.value) || 0);
	};

	var unlockInProfile = function (profile, weaponIds) {
		var unlocked = getUnlockedLookup(profile);
		var added = [];
		(weaponIds || []).forEach(function (weaponId) {
			var key = resolveWeaponKey(weaponId);
			if (!key || unlocked[key]) return;
			unlocked[key] = true;
			profile.unlockedWeaponIds.push(key);
			added.push(key);
		});
		return added;
	};

	var rewardTypes = {
		metaValue: true,
		unlockWeapons: true,
		unlockWeaponType: true
	};

	/** 执行一个白名单奖励动作。 */
	var applyRewardAction = function (profile, reward) {
		if (!reward || !rewardTypes[reward.type]) return false;
		if (reward.type === "metaValue") {
			var key = String(reward.key || "");
			if (!key) return false;
			var current = Number(profile.values[key]) || 0;
			var value = Number(reward.value) || 0;
			if (reward.operator === "set") profile.values[key] = value;
			else if (reward.operator === "max") profile.values[key] = Math.max(current, value);
			else profile.values[key] = current + value;
			return true;
		}
		if (reward.type === "unlockWeapons") {
			unlockInProfile(profile, reward.weaponIds || []);
			return true;
		}
		if (reward.type === "unlockWeaponType") {
			var type = String(reward.weaponType || "");
			unlockInProfile(profile, definitionKeys.filter(function (definitionKey) {
				var types = DEFINITIONS[definitionKey] && DEFINITIONS[definitionKey].weaponTypes;
				return Array.isArray(types) && types.indexOf(type) >= 0;
			}));
			return true;
		}
		return false;
	};

	/**
	 * 反复结算尚未领取且已满足的奖励。奖励可解锁武器并继续触发后续奖励；
	 * 每个配置 ID 永久只领取一次，循环次数有硬上限。
	 */
	var processRewards = function (profile) {
		var configs = Array.isArray(CONFIG.rewards) ? CONFIG.rewards : [];
		var claimedLookup = {};
		profile.claimedRewardIds.forEach(function (id) { claimedLookup[id] = true; });
		var newlyClaimed = [];
		var maximumPasses = configs.length + 1;
		for (var pass = 0; pass < maximumPasses; pass++) {
			var changed = false;
			configs.forEach(function (rewardConfig) {
				if (!rewardConfig || rewardConfig.id == null) return;
				var id = String(rewardConfig.id);
				if (!id || claimedLookup[id] || !evaluateCondition(rewardConfig.condition, profile)) return;
				var actions = Array.isArray(rewardConfig.rewards) ? rewardConfig.rewards : [];
				if (actions.some(function (action) { return !action || !rewardTypes[action.type]; })) {
					console.warn("图鉴奖励包含不支持的动作，已跳过：" + id);
					return;
				}
				claimedLookup[id] = true;
				profile.claimedRewardIds.push(id);
				actions.forEach(function (action) { applyRewardAction(profile, action); });
				newlyClaimed.push({
					id: id,
					title: String(rewardConfig.title || id),
					rewards: cloneData(actions)
				});
				changed = true;
			});
			if (!changed) break;
		}
		return newlyClaimed;
	};

	var unlockWeapons = function (weaponIds, options) {
		options = options || {};
		if (core.isReplaying && core.isReplaying() && !options.allowReplay) {
			return { unlockedWeaponIds: [], claimedRewards: [], skippedReplay: true };
		}
		var profile = readProfile();
		var added = unlockInProfile(profile, Array.isArray(weaponIds) ? weaponIds : [weaponIds]);
		if (added.length) {
			profile.stats.unlockEvents += 1;
			profile.stats.lastUnlockedAt = new Date().toISOString();
		}
		var claimed = processRewards(profile);
		if (added.length || claimed.length || options.forceSave) writeProfile(profile);
		return { unlockedWeaponIds: added, claimedRewards: claimed, skippedReplay: false };
	};

	/** 游戏过程中成功获得武器时：记录本局历史，并立刻写入局外解锁。 */
	var recordAndUnlock = function (weaponOrId) {
		var key = resolveWeaponKey(weaponOrId);
		if (!key) return { unlockedWeaponIds: [], claimedRewards: [], invalidWeapon: true };
		recordObtained(key);
		return unlockWeapons([key]);
	};

	var markClearedInProfile = function (profile, weaponIds) {
		var marked = {};
		profile.clearedWeaponIds.forEach(function (key) { marked[key] = true; });
		var added = [];
		(weaponIds || []).forEach(function (weaponId) {
			var key = resolveWeaponKey(weaponId);
			if (!key || marked[key]) return;
			marked[key] = true;
			profile.clearedWeaponIds.push(key);
			added.push(key);
		});
		return added;
	};

	/** 50 层魔王战后调用：给通关瞬间仍在背包中的武器添加永久通关标记。 */
	var completeRun = function () {
		var currentWeaponIds = recordCurrentBackpack();
		if (isRunCommitted()) {
			return { unlockedWeaponIds: [], clearedWeaponIds: [], claimedRewards: [], alreadyCommitted: true };
		}
		if (core.isReplaying && core.isReplaying()) {
			return { unlockedWeaponIds: [], clearedWeaponIds: [], claimedRewards: [], skippedReplay: true };
		}
		var profile = readProfile();
		// 当前背包扫描同时作为旧存档兜底，防止接入即时解锁前的武器漏记。
		var added = unlockInProfile(profile, currentWeaponIds);
		var cleared = markClearedInProfile(profile, currentWeaponIds);
		profile.stats.victories += 1;
		if (added.length) {
			profile.stats.unlockEvents += 1;
			profile.stats.lastUnlockedAt = new Date().toISOString();
		}
		var claimed = processRewards(profile);
		if (!writeProfile(profile)) {
			if (core.drawTip) core.drawTip("图鉴写入失败，请检查浏览器存储权限");
			return { unlockedWeaponIds: [], clearedWeaponIds: [], claimedRewards: [], storageFailed: true };
		}
		if (core.setFlag) core.setFlag(CONFIG.runCommittedFlag, true);
		if (core.drawTip) {
			var tip = cleared.length ? cleared.length + " 把武器获得通关标记" : "当前背包武器均已有通关标记";
			if (added.length) tip += "，补录解锁 " + added.length + " 把";
			if (claimed.length) tip += "，领取 " + claimed.length + " 项奖励";
			core.drawTip(tip);
		}
		return { unlockedWeaponIds: added, clearedWeaponIds: cleared, claimedRewards: claimed, alreadyCommitted: false };
	};

	var getWeaponTypes = function () {
		var types = {};
		definitionKeys.forEach(function (key) {
			var list = DEFINITIONS[key] && DEFINITIONS[key].weaponTypes;
			(Array.isArray(list) ? list : []).forEach(function (type) {
				if (type != null && String(type)) types[String(type)] = true;
			});
		});
		return Object.keys(types).sort(function (a, b) { return a.localeCompare(b, "zh-CN"); });
	};

	/** 返回已经脱敏的图鉴条目；锁定条目不会通过 API 泄露名称、属性或描述。 */
	var getEntries = function (filters) {
		filters = filters || {};
		var search = String(filters.search || "").trim().toLocaleLowerCase("zh-CN");
		var weaponType = String(filters.weaponType || "");
		var collectionStatus = String(filters.collectionStatus || "");
		if (["unlocked", "locked", "cleared", "uncleared"].indexOf(collectionStatus) < 0) collectionStatus = "";
		var profile = readProfile();
		var unlocked = getUnlockedLookup(profile);
		var cleared = {};
		profile.clearedWeaponIds.forEach(function (key) { cleared[key] = true; });
		return definitionKeys.filter(function (key) {
			var definition = DEFINITIONS[key] || {};
			var isUnlocked = !!unlocked[key];
			var nameMatches = !search || (isUnlocked
				? String(definition.name || "").toLocaleLowerCase("zh-CN").indexOf(search) >= 0
				: search === "???");
			var types = Array.isArray(definition.weaponTypes) ? definition.weaponTypes : [];
			var isCleared = !!cleared[key];
			var statusMatches = !collectionStatus
				|| (collectionStatus === "unlocked" && isUnlocked)
				|| (collectionStatus === "locked" && !isUnlocked)
				|| (collectionStatus === "cleared" && isCleared)
				|| (collectionStatus === "uncleared" && !isCleared);
			return nameMatches && statusMatches && (!weaponType || types.indexOf(weaponType) >= 0);
		}).map(function (key) {
			var definition = DEFINITIONS[key] || {};
			var isUnlocked = !!unlocked[key];
			return {
				weaponId: key,
				unlocked: isUnlocked,
				cleared: !!cleared[key],
				image: String(definition.image || ""),
				imageCrop: cloneData(definition.imageCrop),
				name: isUnlocked ? String(definition.name || "未命名武器") : "???",
				rarity: isUnlocked ? definition.rarity : "???",
				minAttack: isUnlocked ? definition.minAttack : "???",
				maxAttack: isUnlocked ? definition.maxAttack : "???",
				hitRate: isUnlocked ? definition.hitRate : "???",
				attackInterval: isUnlocked ? definition.attackInterval : "???",
				ultimateGain: isUnlocked ? definition.ultimateGain : "???",
				weaponTypes: isUnlocked ? cloneData(definition.weaponTypes || []) : ["???"],
				description: isUnlocked
					? String(definition.synergyText || definition.description || "无特殊描述") : "???"
			};
		});
	};

	var normalizeGroupMode = function (value) {
		return value === "rarity" ? "rarity" : "type";
	};

	var normalizeSortMode = function (value) {
		var supported = {
			default: true,
			nameAsc: true,
			nameDesc: true,
			rarityDesc: true,
			rarityAsc: true,
			collectedFirst: true,
			uncollectedFirst: true
		};
		return supported[value] ? value : "default";
	};

	var getDefinitionOrder = function (entry) {
		var index = definitionKeys.indexOf(entry && entry.weaponId);
		return index < 0 ? definitionKeys.length : index;
	};

	var sortEntries = function (entries, sortMode) {
		sortMode = normalizeSortMode(sortMode);
		return entries.slice().sort(function (left, right) {
			var result = 0;
			var leftDefinition = DEFINITIONS[left.weaponId] || {};
			var rightDefinition = DEFINITIONS[right.weaponId] || {};
			if (sortMode === "nameAsc" || sortMode === "nameDesc") {
				result = String(left.name || "").localeCompare(String(right.name || ""), "zh-CN");
				if (sortMode === "nameDesc") result *= -1;
			}
			else if (sortMode === "rarityDesc" || sortMode === "rarityAsc") {
				result = (Number(leftDefinition.rarity) || 0) - (Number(rightDefinition.rarity) || 0);
				if (sortMode === "rarityDesc") result *= -1;
			}
			else if (sortMode === "collectedFirst" || sortMode === "uncollectedFirst") {
				result = Number(left.unlocked) - Number(right.unlocked);
				if (sortMode === "collectedFirst") result *= -1;
			}
			return result || getDefinitionOrder(left) - getDefinitionOrder(right);
		});
	};

	var getEntryGroups = function (entry, groupMode, weaponType) {
		var definition = DEFINITIONS[entry.weaponId] || {};
		if (groupMode === "rarity") {
			var rarity = Number(definition.rarity);
			var safeRarity = isFinite(rarity) && rarity > 0 ? rarity : 0;
			return [{ key: "rarity:" + safeRarity, title: safeRarity ? safeRarity + " 星" : "未知稀有度", rank: safeRarity }];
		}
		var types = (Array.isArray(definition.weaponTypes) ? definition.weaponTypes : [])
			.map(function (type) { return String(type || ""); }).filter(Boolean);
		if (weaponType) types = types.indexOf(weaponType) >= 0 ? [weaponType] : [];
		if (!types.length && !weaponType) types = ["未分类"];
		return types.map(function (type) {
			return { key: "type:" + type, title: type, rank: 0 };
		});
	};

	/** 按类型或稀有度构造分组；多类型武器会出现在其所属的每个类型中。 */
	var buildEntryGroups = function (entries, groupMode, sortMode, options) {
		groupMode = normalizeGroupMode(groupMode);
		options = options || {};
		var lookup = {};
		(entries || []).forEach(function (entry) {
			getEntryGroups(entry, groupMode, String(options.weaponType || "")).forEach(function (descriptor) {
				if (!lookup[descriptor.key]) lookup[descriptor.key] = {
					key: descriptor.key,
					title: descriptor.title,
					rank: descriptor.rank,
					entries: []
				};
				lookup[descriptor.key].entries.push(entry);
			});
		});
		return Object.keys(lookup).map(function (key) {
			var group = lookup[key];
			group.entries = sortEntries(group.entries, sortMode);
			group.unlockedCount = group.entries.filter(function (entry) { return entry.unlocked; }).length;
			group.clearedCount = group.entries.filter(function (entry) { return entry.cleared; }).length;
			group.totalCount = group.entries.length;
			return group;
		}).sort(function (left, right) {
			if (groupMode === "rarity") return right.rank - left.rank;
			if (left.title === "未分类") return 1;
			if (right.title === "未分类") return -1;
			return left.title.localeCompare(right.title, "zh-CN");
		});
	};

	/** 分组进度不受名称搜索和收集状态筛选影响，但会尊重当前类型筛选。 */
	var getGroupedEntries = function (options) {
		options = options || {};
		var groupMode = normalizeGroupMode(options.groupMode);
		var sortMode = normalizeSortMode(options.sortMode);
		var weaponType = String(options.weaponType || "");
		var visibleEntries = getEntries({
			search: options.search,
			weaponType: weaponType,
			collectionStatus: options.collectionStatus
		});
		var progressEntries = getEntries({ weaponType: weaponType });
		var progressLookup = {};
		buildEntryGroups(progressEntries, groupMode, "default", { weaponType: weaponType }).forEach(function (group) {
			progressLookup[group.key] = group;
		});
		return buildEntryGroups(visibleEntries, groupMode, sortMode, { weaponType: weaponType }).map(function (group) {
			var progress = progressLookup[group.key] || group;
			group.unlockedCount = progress.unlockedCount;
			group.clearedCount = progress.clearedCount;
			group.totalCount = progress.totalCount;
			return group;
		});
	};

	var createCard = function (entry) {
		if (!cardRenderer) throw new Error("武器卡片渲染组件未安装");
		var card = cardRenderer.createCard(DEFINITIONS[entry.weaponId] || {}, {
			lock: !entry.unlocked,
			showCraftHammer: false,
			mobileListMode: true,
			className: "weapon-compendium-entry" + (entry.cleared ? " has-cleared-run" : "")
		});
		card.dataset.weaponId = entry.weaponId;
		card.dataset.cleared = entry.cleared ? "true" : "false";
		if (entry.cleared) {
			card.title = "已使用该武器通关";
			card.setAttribute("aria-label", (card.getAttribute("aria-label") || "") + "，已使用该武器通关");
		}
		return card;
	};

	var rewardLabel = function (rewardConfig) {
		if (!rewardConfig) return "未命名奖励";
		return String(rewardConfig.title || rewardConfig.id || "未命名奖励");
	};

	var closeCompendium = function () {
		if (!root) return false;
		if (cardRenderer) cardRenderer.closePreviewModal(false);
		document.removeEventListener("keydown", modalKeyDown, true);
		document.removeEventListener("keyup", modalKeyUp, true);
		root.remove();
		root = null;
		if (openedWhilePlaying && core.status && core.status.event && core.status.event.id === CONFIG.eventId) {
			core.status.event.id = null;
			core.status.event.data = null;
			core.status.event.selection = null;
			core.unlockControl();
			if (core.updateStatusBar) core.updateStatusBar(true);
		}
		openedWhilePlaying = false;
		return true;
	};

	var openCompendium = function () {
		if (root) return true;
		var gameGroup = document.getElementById("gameGroup") || document.body;
		openedWhilePlaying = !!(core.isPlaying && core.isPlaying());
		if (openedWhilePlaying) {
			if (core.status && core.status.event && core.status.event.id && core.status.event.id !== CONFIG.eventId
				&& core.ui && core.ui.closePanel) core.ui.closePanel();
			core.lockControl();
			core.status.event.id = CONFIG.eventId;
			core.status.event.data = null;
		}

		root = document.createElement("div");
		root.id = "weapon-compendium-root";
		root.setAttribute("role", "dialog");
		root.setAttribute("aria-modal", "true");
		root.setAttribute("aria-label", "武器图鉴");

		var panel = document.createElement("section");
		panel.className = "weapon-compendium-panel";
		var header = document.createElement("header");
		header.className = "weapon-compendium-header";
		var title = document.createElement("div");
		title.className = "weapon-compendium-title";
		title.textContent = "武器图鉴";
		var summary = document.createElement("div");
		summary.className = "weapon-compendium-summary";
		var search = document.createElement("input");
		search.className = "weapon-compendium-search";
		search.type = "search";
		search.placeholder = "搜索已解锁武器名称";
		search.setAttribute("aria-label", "按武器名称搜索");
		var filter = document.createElement("select");
		filter.className = "weapon-compendium-filter";
		filter.setAttribute("aria-label", "按武器类型筛选");
		var allOption = document.createElement("option");
		allOption.value = "";
		allOption.textContent = "全部类型";
		filter.appendChild(allOption);
		getWeaponTypes().forEach(function (type) {
			var option = document.createElement("option");
			option.value = type;
			option.textContent = type;
			filter.appendChild(option);
		});
		var close = document.createElement("button");
		close.className = "weapon-compendium-close";
		close.type = "button";
		close.title = "关闭";
		close.setAttribute("aria-label", "关闭武器图鉴");
		close.textContent = "×";
		header.appendChild(title);
		header.appendChild(summary);
		header.appendChild(search);
		header.appendChild(filter);
		header.appendChild(close);
		panel.appendChild(header);

		var toolbar = document.createElement("div");
		toolbar.className = "weapon-compendium-toolbar";
		var createControl = function (labelText, ariaLabel, options) {
			var label = document.createElement("label");
			label.className = "weapon-compendium-control";
			var text = document.createElement("span");
			text.textContent = labelText;
			var select = document.createElement("select");
			select.setAttribute("aria-label", ariaLabel);
			options.forEach(function (optionConfig) {
				var option = document.createElement("option");
				option.value = optionConfig[0];
				option.textContent = optionConfig[1];
				select.appendChild(option);
			});
			label.appendChild(text);
			label.appendChild(select);
			toolbar.appendChild(label);
			return select;
		};
		var groupMode = createControl("分组方式", "选择图鉴分组方式", [
			["type", "按类型分组"],
			["rarity", "按稀有度分组"]
		]);
		var sortMode = createControl("武器排序", "选择组内武器排序方式", [
			["default", "默认顺序"],
			["collectedFirst", "已收集优先"],
			["uncollectedFirst", "未收集优先"],
			["nameAsc", "名称升序"],
			["nameDesc", "名称降序"],
			["rarityDesc", "稀有度降序"],
			["rarityAsc", "稀有度升序"]
		]);
		var collectionStatus = createControl("收集状态", "按解锁或通关状态筛选", [
			["", "全部武器"],
			["unlocked", "只看已解锁"],
			["locked", "只看未解锁"],
			["cleared", "只看已通关"],
			["uncleared", "只看未通关"]
		]);
		panel.appendChild(toolbar);

		var rewardBar = document.createElement("div");
		rewardBar.className = "weapon-compendium-rewards";
		var rewardConfigs = Array.isArray(CONFIG.rewards) ? CONFIG.rewards : [];
		if (!rewardConfigs.length) rewardBar.style.display = "none";
		panel.appendChild(rewardBar);
		var grid = document.createElement("div");
		grid.className = "weapon-compendium-grid";
		panel.appendChild(grid);
		root.appendChild(panel);
		gameGroup.appendChild(root);

		var render = function () {
			if (cardRenderer) cardRenderer.closePreviewModal(false);
			var profile = readProfile();
			var groups = getGroupedEntries({
				search: search.value,
				weaponType: filter.value,
				collectionStatus: collectionStatus.value,
				groupMode: groupMode.value,
				sortMode: sortMode.value
			});
			summary.textContent = "已收集 " + profile.unlockedWeaponIds.length + " / " + definitionKeys.length
				+ "　已通关 " + profile.clearedWeaponIds.length + " / " + definitionKeys.length
				+ (rewardConfigs.length ? "　奖励 " + profile.claimedRewardIds.length + " / " + rewardConfigs.length : "");
			grid.innerHTML = "";
			if (!groups.length) {
				var empty = document.createElement("div");
				empty.className = "weapon-compendium-empty";
				empty.textContent = "没有符合条件的武器";
				grid.appendChild(empty);
			} else groups.forEach(function (group) {
				var section = document.createElement("section");
				section.className = "weapon-compendium-group";
				section.dataset.groupKey = group.key;
				var groupHeader = document.createElement("header");
				groupHeader.className = "weapon-compendium-group-header";
				var groupTitle = document.createElement("h2");
				groupTitle.className = "weapon-compendium-group-title";
				groupTitle.textContent = group.title;
				var groupProgress = document.createElement("span");
				groupProgress.className = "weapon-compendium-group-progress";
				groupProgress.innerHTML = "已收集 <b>" + group.unlockedCount + "</b> / " + group.totalCount
					+ "　已通关 <b>" + group.clearedCount + "</b> / " + group.totalCount;
				groupHeader.appendChild(groupTitle);
				groupHeader.appendChild(groupProgress);
				var groupGrid = document.createElement("div");
				groupGrid.className = "weapon-compendium-group-grid";
				group.entries.forEach(function (entry) { groupGrid.appendChild(createCard(entry)); });
				section.appendChild(groupHeader);
				section.appendChild(groupGrid);
				grid.appendChild(section);
			});
			rewardBar.innerHTML = "";
			rewardConfigs.forEach(function (rewardConfig) {
				var badge = document.createElement("span");
				var claimed = rewardConfig && profile.claimedRewardIds.indexOf(String(rewardConfig.id)) >= 0;
				badge.className = "weapon-compendium-reward" + (claimed ? " claimed" : "");
				badge.textContent = (claimed ? "✓ " : "○ ") + rewardLabel(rewardConfig);
				rewardBar.appendChild(badge);
			});
		};

		search.addEventListener("input", render);
		filter.addEventListener("change", render);
		groupMode.addEventListener("change", render);
		sortMode.addEventListener("change", render);
		collectionStatus.addEventListener("change", render);
		close.addEventListener("click", closeCompendium);
		root.addEventListener("pointerdown", function (event) { event.stopPropagation(); });
		root.addEventListener("click", function (event) {
			event.stopPropagation();
			if (event.target === root) closeCompendium();
		});
		modalKeyDown = function (event) {
			if (!root) return;
			event.stopImmediatePropagation();
			if (event.key === "Escape" || event.keyCode === 27) event.preventDefault();
		};
		modalKeyUp = function (event) {
			if (!root) return;
			event.stopImmediatePropagation();
			if (event.key === "Escape" || event.keyCode === 27) {
				event.preventDefault();
				if (!cardRenderer || !cardRenderer.closePreviewModal()) closeCompendium();
			}
		};
		document.addEventListener("keydown", modalKeyDown, true);
		document.addEventListener("keyup", modalKeyUp, true);
		render();
		setTimeout(function () { if (root) search.focus(); }, 0);
		return true;
	};

	/** 在标题菜单中添加局外入口，不修改 index.html，也不占用背包或战斗界面。 */
	var installStartButton = function () {
		var startButtons = document.getElementById("startButtons");
		if (!startButtons || document.getElementById("weaponCompendiumButton")) return;
		var button = document.createElement("span");
		button.className = "startButton";
		button.id = "weaponCompendiumButton";
		button.textContent = "武器图鉴";
		button.onclick = function (event) {
			if (event) event.stopPropagation();
			openCompendium();
		};
		startButtons.appendChild(button);
	};

	/**
	 * 只装饰背包公开入口：原返回值、参数和内部状态均不改变。
	 * 图鉴从成功的“添加”结果记录历史并立即解锁，因此出售、合成消耗都不会反向回锁。
	 */
	var wrapBackpackAcquisitionApis = function () {
		var originalRemove = plugin.removeBackpackWeapon;
		if (typeof originalRemove === "function" && !originalRemove.__weaponCompendiumWrapped) {
			var wrappedRemove = function (instanceId) {
				// 删除前从公开存档状态补记一次；出售和合成消耗因此也覆盖旧存档的未记录实例。
				var state = typeof plugin.getBackpackState === "function"
					? plugin.getBackpackState()
					: (core.getFlag ? (core.getFlag("__backpack_state__", {}) || {}) : {});
				(Array.isArray(state.placed) ? state.placed : [])
					.concat(Array.isArray(state.inventory) ? state.inventory : [])
					.some(function (entry) {
						if (!entry || String(entry.instanceId) !== String(instanceId)) return false;
						recordAndUnlock(entry);
						return true;
					});
				return originalRemove.apply(this, arguments);
			};
			wrappedRemove.__weaponCompendiumWrapped = true;
			wrappedRemove.__weaponCompendiumOriginal = originalRemove;
			plugin.removeBackpackWeapon = wrappedRemove;
		}

		var wrap = function (name, resolver, after) {
			var original = plugin[name];
			if (typeof original !== "function" || original.__weaponCompendiumWrapped) return;
			var wrapped = function () {
				var args = Array.prototype.slice.call(arguments);
				var result = original.apply(this, args);
				if (result !== null && result !== undefined && result !== false && resolver) {
					recordAndUnlock(resolver(args, result));
				}
				if (after) after(args, result);
				return result;
			};
			wrapped.__weaponCompendiumWrapped = true;
			wrapped.__weaponCompendiumOriginal = original;
			plugin[name] = wrapped;
		};
		wrap("addBackpackWeapon", function (args) { return args[0]; });
		wrap("addBackpackItem", function (args) { return args[0]; });
		wrap("syncBackpackItems", null, function () {
			var currentWeaponIds = recordCurrentBackpack();
			if (currentWeaponIds.length) unlockWeapons(currentWeaponIds);
		});
	};

	var api = {
		__installed: true,
		getProfile: function () { return cloneData(readProfile()); },
		getEntries: function (filters) { return cloneData(getEntries(filters)); },
		getGroupedEntries: function (options) { return cloneData(getGroupedEntries(options)); },
		getWeaponTypes: getWeaponTypes,
		getRunObtainedWeaponIds: function () { return cloneData(readRunObtained()); },
		recordObtained: recordObtained,
		recordCurrentBackpack: recordCurrentBackpack,
		unlockWeapons: unlockWeapons,
		completeRun: completeRun,
		unlockRunWeapons: completeRun,
		evaluateRewards: function () {
			var profile = readProfile();
			var claimed = processRewards(profile);
			if (claimed.length) writeProfile(profile);
			return cloneData(claimed);
		},
		evaluateCondition: function (condition) { return evaluateCondition(condition, readProfile()); },
		getConfig: function () { return cloneData(CONFIG); },
		open: openCompendium,
		close: closeCompendium,
		isOpen: function () { return !!root; }
	};

	plugin.weaponCompendium = api;
	plugin.openWeaponCompendium = openCompendium;
	plugin.closeWeaponCompendium = closeCompendium;
	plugin.completeWeaponCompendiumRun = completeRun;
	plugin.unlockRunWeaponCompendium = completeRun;
	wrapBackpackAcquisitionApis();
	installStartButton();
	return api;
};
