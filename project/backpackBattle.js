/** 项目层接入：战斗入口、背包快照、奖励桥接、预计显伤和怪物手册。 */
var installBackpackBattleSystem_3a1b88da_43f6_4f51_89e7_be56dc57f84e = function (core, plugin) {
	"use strict";

	var rules = backpackBattleRules_36e4a689_0f48_476f_92a7_1c12b3903e87;
	var statusRegistry = backpackBattleStatusDefinitions_7d94f05e_2f6d_4b8e_9c23_5a317ccab120;
	var debugLogEntries = [];
	var debugLogSequence = 0;
	var debugSessionStartedAt = null;
	var cloneDebugValue = function (value) {
		try { return JSON.parse(JSON.stringify(value)); }
		catch (error) { return { serializationError: error.message || String(error) }; }
	};
	var recordBackpackBattleDebugLog = function (phase, payload) {
		// var entry = cloneDebugValue(payload || {});
		// var replay = core.status && core.status.replay || {};
		// entry.logIndex = ++debugLogSequence;
		// entry.recordedAt = new Date().toISOString();
		// entry.sessionStartedAt = debugSessionStartedAt;
		// entry.phase = String(phase || entry.phase || "debug");
		// entry.replaying = replay.replaying === true;
		// entry.replayStep = replay.steps == null ? null : replay.steps;
		// entry.replayRemainingActions = Array.isArray(replay.toReplay) ? replay.toReplay.length : null;
		// entry.routeLength = core.status && Array.isArray(core.status.route) ? core.status.route.length : null;
		// debugLogEntries.push(entry);
		// if (typeof console !== "undefined" && typeof console.log === "function") {
			// console.log("[背包战斗调试][" + entry.phase + "]", entry);
		// }
		// return cloneDebugValue(entry);
	};
	var clearBackpackBattleDebugLog = function () {
		debugLogEntries = [];
		debugLogSequence = 0;
		debugSessionStartedAt = new Date().toISOString();
		return true;
	};
	var getBackpackBattleDebugLog = function () {
		return cloneDebugValue(debugLogEntries);
	};
	var downloadBackpackBattleDebugLog = function (filename) {
		if (!debugLogEntries.length) {
			if (core.drawTip) core.drawTip("当前没有背包战斗调试日志");
			return false;
		}
		var stamp = core.formatDate2 ? core.formatDate2(new Date()) : String(Date.now());
		filename = filename || ((core.firstData && core.firstData.name || "backpack-battle")
			+ "_背包战斗调试日志_" + stamp + ".jsonl");
		var content = debugLogEntries.map(function (entry) { return JSON.stringify(entry); }).join("\n");
		core.download(filename, content);
		return true;
	};
	plugin.recordBackpackBattleDebugLog = recordBackpackBattleDebugLog;
	plugin.clearBackpackBattleDebugLog = clearBackpackBattleDebugLog;
	plugin.getBackpackBattleDebugLog = getBackpackBattleDebugLog;
	plugin.downloadBackpackBattleDebugLog = downloadBackpackBattleDebugLog;
	clearBackpackBattleDebugLog();

	var runtime = createBackpackBattleRuntime_2f8f7df2_bf4f_45ea_8ec4_628e0e25a0dc(core);
	var battleUi = createBackpackBattleUI_877f7cd8_53d6_448c_94ab_15ef82119bb2(core, runtime);
	var pendingSettlement = null;
	var activeBattleContext = null;
	var lastLayoutSignature = null;
	var EVENT_ID = "backpackBattle";
	var BATTLE_RULE_VERSION = 7;
	var WEAPON_CONFIG_VERSION = 1;

	var clone = function (value) {
		return value == null ? value : (core.clone ? core.clone(value) : JSON.parse(JSON.stringify(value)));
	};

	var getPlacedWeaponSnapshots = function () {
		if (!plugin.getBackpackState || !plugin.calculateBackpackAttributes || !plugin.weaponSystem) return [];
		var backpackState = plugin.getBackpackState();
		var calculated = plugin.calculateBackpackAttributes();
		return (backpackState.placed || []).map(function (entry) {
			var attributes = clone(calculated.byInstanceId[entry.instanceId] || {});
			attributes.hitRate = attributes.hitRate == null ? 1 : Number(attributes.hitRate);
			// 是否能主动攻击由武器原始间隔决定：原始 0 永久锁定，原始正数最低 10 Tick。
			var hasBaseAttackInterval = Number(attributes.baseAttackInterval) > 0;
			attributes.attackInterval = hasBaseAttackInterval
				? Math.max(0.1, Number(attributes.attackInterval) || 0)
				: 0;
			attributes.attackIntervalTicks = attributes.attackInterval > 0
				? Math.max(1, Math.round(attributes.attackInterval * 100))
				: 0;
			attributes.ultimateGain = attributes.ultimateGain == null ? 0 : Number(attributes.ultimateGain);
			return {
				instanceId: entry.instanceId,
				weaponId: entry.weapon.id || null,
				sourceItemId: entry.weapon.sourceItemId || null,
				name: entry.weapon.name,
				sourceName: entry.weapon.sourceName || null,
				image: entry.weapon.image,
				imageCrop: clone(entry.weapon.imageCrop || null),
				baseCells: clone(entry.weapon.cells || []),
				col: entry.col,
				row: entry.row,
				rotation: entry.rotation,
				cells: plugin.weaponSystem.getOccupiedCells(entry),
				synergyCells: clone(plugin.weaponSystem.getSynergyCells(entry)),
				weaponTypes: clone(entry.weapon.weaponTypes || []),
				rarity: entry.weapon.rarity == null ? null : Number(entry.weapon.rarity),
				synergyText: entry.weapon.synergyText || "",
				attributes: attributes,
				combatRules: clone(entry.weapon.combatRules || [])
			};
		});
	};

	var getHeroSnapshot = function () {
		var hero = core.status.hero || {};
		var hp = Math.max(0, Number(core.getRealStatus ? core.getRealStatus("hp") : hero.hp) || 0);
		var hpmax = Number(core.getRealStatus ? core.getRealStatus("hpmax") : hero.hpmax);
		if (!Number.isFinite(hpmax) || hpmax <= 0) hpmax = hp;
		return {
			name: hero.name || "勇士",
			hp: hp,
			maxHp: Math.max(hp, hpmax),
			atk: Math.max(0, Number(core.getRealStatus ? core.getRealStatus("atk") : hero.atk) || 0),
			def: Math.max(0, Number(core.getRealStatus ? core.getRealStatus("def") : hero.def) || 0),
			hitRate: 1,
			ultimate: 0,
			buffs: [],
			debuffs: []
		};
	};

	var buildEnemyCombatRules = function (source, x, y, floorId) {
		var readField = function (field) {
			var value = null;
			if (typeof core.getEnemyValue === "function") {
				value = core.getEnemyValue(source, field, x, y, floorId);
			}
			if (value == null && source) value = source[field];
			return value;
		};

		var effects = [];

		var debuffFields = {
			burn: "burn",
			ice: "ice",
			darkness: "darkness",
			exhaustion: "exhaustion"
		};
		Object.keys(debuffFields).forEach(function (field) {
			var stacks = Number(readField(field));
			if (Number.isFinite(stacks) && stacks > 0) {
				effects.push({
					type: "applyStatus",
					target: "opponent",
					status: debuffFields[field],
					stacks: stacks
				});
			}
		});

		var buffFields = {
			reflection: "reflection",
			block: "block",
			mark: "mark",
			highSpirit: "highSpirit",
			excitation: "excitation",
			regeneration: "regeneration"
		};
		Object.keys(buffFields).forEach(function (field) {
			var stacks = Number(readField(field));
			if (Number.isFinite(stacks) && stacks > 0) {
				effects.push({
					type: "applyStatus",
					target: "self",
					status: buffFields[field],
					stacks: stacks
				});
			}
		});

		var cleanse = readField("cleanse");
		if (cleanse === true || Number(cleanse) === 1) {
			effects.push({ type: "cleanseAllDebuffs", target: "self" });
		}

		var dispel = Number(readField("dispel"));
		if (Number.isFinite(dispel) && dispel > 0) {
			for (var i = 0; i < dispel; i++) {
				effects.push({ type: "dispelRandomBuff", target: "opponent" });
			}
		}

		var combatRules = [];
		if (effects.length > 0) {
			combatRules.push({
				id: "enemyOnHitEffects",
				trigger: "afterHit",
				effects: effects
			});
		}

		var customRules = readField("combatRules");
		if (Array.isArray(customRules)) {
			combatRules = combatRules.concat(clone(customRules));
		}

		return combatRules;
	};

	var getStatusName = function (statusId) {
		var definition = statusRegistry && statusRegistry.definitions
			? statusRegistry.definitions[statusId] : null;
		return definition ? definition.name : statusId;
	};

	/** 将一条战斗效果翻译为人类可读描述；无法识别的效果返回 null。 */
	var describeEnemyEffect = function (effect) {
		if (!effect || !effect.type) return null;
		var amount = effect.stacks == null ? (effect.value == null ? 1 : effect.value) : effect.stacks;
		if (effect.type === "applyStatus") {
			return "对" + (effect.target === "opponent" ? "勇士" : "自身") + "施加 "
				+ getStatusName(effect.status) + "×" + amount;
		}
		if (effect.type === "applyRandomDebuff") {
			var poolText = Array.isArray(effect.pool) && effect.pool.length
				? effect.pool.map(getStatusName).join("/") : "弱体效果";
			return "对" + (effect.target === "opponent" ? "勇士" : "自身") + "随机施加1个"
				+ poolText + "×" + amount;
		}
		if (effect.type === "applyRandomBuffs") {
			var buffPoolText = Array.isArray(effect.pool) && effect.pool.length
				? effect.pool.map(getStatusName).join("/") : "增益";
			return "对" + (effect.target === "opponent" ? "勇士" : "自身") + "随机" + (effect.count || 1)
				+ "次获得" + buffPoolText + "×" + amount;
		}
		if (effect.type === "cleanseAllDebuffs") return "净化自身所有减益各1层";
		if (effect.type === "dispelRandomBuff" || effect.type === "dispelBuff") return "驱散勇士1个增益";
		if (effect.type === "dispelBuffPercent") {
			var percent = effect.percent == null ? effect.value : effect.percent;
			return "驱散勇士每种增益" + Math.round((Number(percent) || 0) * 100) + "%";
		}
		if (effect.type === "dealDamage") {
			return "造成" + amount + "点" + (effect.direct === true ? "直接" : "") + "伤害";
		}
		if (effect.type === "heal") return "恢复" + amount + " HP";
		if (effect.type === "removeStatus" || effect.type === "consumeStatus") {
			return "移除" + getStatusName(effect.status) + "×" + amount;
		}
		if (effect.type === "gainUltimate") return "获得" + amount + "点奥义";
		if (effect.type === "statusDamageBonus") {
			var typeText = effect.scope === "all"
				? (Array.isArray(effect.weaponTypes) && effect.weaponTypes.length
					? effect.weaponTypes.join("/") + "类武器" : "所有武器")
				: (effect.scope === "nearby" ? "范围内武器" : "本武器");
			var damageStatusText = effect.mode === "presence"
				? "自身拥有" + getStatusName(effect.status || "mark") + "时"
				: "自身每拥有" + (effect.every || 10) + "层" + getStatusName(effect.status || "mark");
			return damageStatusText
				+ "，" + typeText + "攻击伤害+" + (effect.value || 0);
		}
		if (effect.type === "statusIntervalBonus") {
			var intervalTypeText = effect.scope === "all"
				? (Array.isArray(effect.weaponTypes) && effect.weaponTypes.length
					? effect.weaponTypes.join("/") + "类武器" : "所有武器")
				: "本武器";
			var who = effect.target === "enemy" || effect.target === "opponent" ? "敌方" : "自身";
			var intervalStatusText = effect.mode === "presence"
				? who + "拥有" + getStatusName(effect.status || "ice") + "时"
				: who + "每有" + (effect.every || 10) + "层" + getStatusName(effect.status || "ice");
			return intervalStatusText
				+ "，" + intervalTypeText + "攻击间隔" + (Number(effect.value) < 0 ? "" : "+") + (effect.value || 0) + "回合";
		}
		if (effect.type === "statusExtraAttack") {
			var extraWho = effect.target === "enemy" || effect.target === "opponent" ? "敌方" : "自身";
			var extraTargetText = effect.scope === "all"
				? (Array.isArray(effect.weaponTypes) && effect.weaponTypes.length
					? effect.weaponTypes.join("/") + "类武器" : "所有武器")
				: "本武器";
			var extraStatusText = effect.mode === "presence"
				? extraWho + "拥有" + getStatusName(effect.status || "ice") + "时"
				: extraWho + "每有" + (effect.every || 10) + "层" + getStatusName(effect.status || "ice");
			return extraStatusText + "，" + extraTargetText + "攻击次数+" + (effect.value || 1)
				+ "（多次伤害/联动，奥义只判一次）";
		}
		if (effect.type === "modifyCurrentAttackCount") return "本次攻击次数+" + (effect.value || 0);
		if (effect.type === "statusHitRateBonus") {
			var hitWho = effect.target === "enemy" || effect.target === "opponent" ? "敌方" : "自身";
			return hitWho + "拥有" + getStatusName(effect.status || "wolfSkin") + "时，本武器命中率+"
				+ Math.round((Number(effect.value) || 0) * 100) + "%";
		}
		if (effect.type === "goldMultiplier") {
			var extra = Math.max(0, Number(effect.value) || 0);
			return "击败敌人获得的金币增加" + (extra === 1 ? "一倍" : extra * 100 + "%");
		}
		if (effect.type === "goldBonus") return "战后获得金币增加" + (effect.value || 0) + "点";
		if (effect.type === "consumeBuffs") return "随机消耗自身" + (effect.count || effect.value || 1) + "层强化效果";
		if (effect.type === "addExtraAttack") {
			var foodTypeText = Array.isArray(effect.filter && effect.filter.weaponTypes) && effect.filter.weaponTypes.length
				? effect.filter.weaponTypes.join("/") : "附近武器";
			return "使" + foodTypeText + "发动次数+1（造成多次伤害、多次联动，奥义只判一次）";
		}
		if (effect.type === "nearbyDamageBonus") {
			var nearbyTypeText = Array.isArray(effect.filter && effect.filter.weaponTypes) && effect.filter.weaponTypes.length
				? effect.filter.weaponTypes.join("/") : "武器";
			return "范围内每配置一个" + nearbyTypeText + "，本武器伤害+" + (effect.value || 0);
		}
		if (effect.type === "nearbyExtraAttack") {
			var extraFoodText = Array.isArray(effect.filter && effect.filter.weaponTypes) && effect.filter.weaponTypes.length
				? effect.filter.weaponTypes.join("/") : "附近武器";
			return "范围内每配置" + (effect.every || 2) + "个" + extraFoodText + "，本武器攻击次数+" + (effect.value || 1) + "（多次伤害/联动，奥义只判一次）";
		}
		if (effect.type === "nearbyIntervalBonus") {
			var intervalFoodText = Array.isArray(effect.filter && effect.filter.weaponTypes) && effect.filter.weaponTypes.length
				? effect.filter.weaponTypes.join("/") : "附近武器";
			return "范围内每有" + (effect.every || 1) + "个" + intervalFoodText
				+ "，本武器使用间隔" + (Number(effect.value) < 0 ? "" : "+") + (effect.value || 0) + "回合";
		}
		if (effect.type === "ignoreBlockAlways") return "本武器攻击无视目标格挡";
		if (effect.type === "triggerWeaponEffects") {
			var dirText = Array.isArray(effect.directions) && effect.directions.length
				? effect.directions.join("/") : "周围";
			var filterTypes = effect.filter && effect.filter.weaponTypes;
			var filterText = Array.isArray(filterTypes) && filterTypes.length
				? filterTypes.join("/") + "类武器" : "匹配武器";
			return "立马发动" + dirText + "一格内" + filterText + "的效果";
		}
		return null;
	};

	/**
	 * 生成怪物手册详情中显示的 Buff/Debuff 能力文本。
	 * 覆盖简化字段（burn/ice/darkness/exhaustion/reflection/block/mark/highSpirit/
	 * excitation/regeneration/cleanse/dispel）和自定义 combatRules。
	 */
	var buildEnemyAbilityTexts = function (enemyId, x, y, floorId) {
		var source = core.material.enemys[enemyId];
		if (!source) return [];
		var lines = [];
		var readField = function (field) {
			var value = null;
			if (typeof core.getEnemyValue === "function") {
				value = core.getEnemyValue(source, field, x, y, floorId);
			}
			if (value == null && source) value = source[field];
			return value;
		};

		var debuffs = [];
		var buffs = [];
		var others = [];

		// 简化字段：命中后对勇士施加的减益
		var debuffFields = {
			burn: "burn", ice: "ice", darkness: "darkness", exhaustion: "exhaustion"
		};
		Object.keys(debuffFields).forEach(function (field) {
			var stacks = Number(readField(field));
			if (Number.isFinite(stacks) && stacks > 0) {
				debuffs.push(getStatusName(debuffFields[field]) + "×" + stacks);
			}
		});

		// 简化字段：命中后自身获得的增益
		var buffFields = {
			reflection: "reflection", block: "block", mark: "mark",
			highSpirit: "highSpirit", excitation: "excitation", regeneration: "regeneration"
		};
		Object.keys(buffFields).forEach(function (field) {
			var stacks = Number(readField(field));
			if (Number.isFinite(stacks) && stacks > 0) {
				buffs.push(getStatusName(buffFields[field]) + "×" + stacks);
			}
		});

		// 简化字段：净化与驱散
		var cleanse = readField("cleanse");
		if (cleanse === true || Number(cleanse) === 1) {
			others.push("净化自身所有减益各1层");
		}
		var dispel = Number(readField("dispel"));
		if (Number.isFinite(dispel) && dispel > 0) {
			others.push("驱散勇士" + (dispel > 1 ? dispel + "个" : "1个") + "增益");
		}

		// 自定义 combatRules：按效果类型归类显示
		var triggerNames = {
			afterHit: "命中后", battleStart: "战斗开始时", roundStart: "每回合结算后",
			beforeAttack: "攻击前", afterTakeDamage: "受到伤害后", battleEnd: "战斗结束时"
		};
		var customRules = readField("combatRules");
		if (Array.isArray(customRules)) {
			customRules.forEach(function (rule) {
				var prefix = triggerNames[rule.trigger] || (rule.trigger ? rule.trigger + "时" : "");
				(rule.effects || []).forEach(function (effect) {
					var desc = describeEnemyEffect(effect);
					if (!desc) return;
					var line = (prefix ? prefix + "：" : "") + desc;
					if (effect.type === "applyStatus" && effect.target !== "opponent") {
						buffs.push(line);
					} else if (effect.type === "applyStatus") {
						debuffs.push(line);
					} else {
						others.push(line);
					}
				});
			});
		}

		if (debuffs.length) {
			lines.push("\r[#FF7043]\\d减益施加（对勇士）：\\d\r[]");
			debuffs.forEach(function (text) {
				lines.push("\r[#FF7043]· " + text + "\r[]");
			});
		}
		if (buffs.length) {
			lines.push("\r[#63D16F]\\d增益获得（自身）：\\d\r[]");
			buffs.forEach(function (text) {
				lines.push("\r[#63D16F]· " + text + "\r[]");
			});
		}
		if (others.length) {
			lines.push("\r[#8D78C9]\\d其他能力：\\d\r[]");
			others.forEach(function (text) {
				lines.push("\r[#8D78C9]· " + text + "\r[]");
			});
		}
		return lines;
	};

	var getEnemyAttackSpeed = function (source, x, y, floorId) {
		var attackSpeed = null;
		if (typeof core.getEnemyValue === "function") {
			attackSpeed = core.getEnemyValue(source, "attackInterval", x, y, floorId);
		}
		if (attackSpeed == null && source) attackSpeed = source.attackInterval;
		attackSpeed = Number(attackSpeed);
		return Number.isFinite(attackSpeed) && attackSpeed > 0 ? attackSpeed : 1;
	};

	var getEnemySnapshot = function (enemyId, x, y, floorId) {
		floorId = floorId || core.status.floorId;
		var source = core.material.enemys[enemyId];
		if (!source) throw new Error("找不到怪物：" + enemyId);
		var hero = core.status.hero || {};
		var heroForEnemyInfo = {
			__skipBackpackAttack: true,
			hp: hero.hp,
			atk: hero.atk,
			def: hero.def,
			mdef: hero.mdef
		};
		var info = core.enemys.getEnemyInfo(source, heroForEnemyInfo, x, y, floorId);
		var attackSpeed = getEnemyAttackSpeed(source, x, y, floorId);
		var hitRate = Number(core.getEnemyValue(source, "hitRate", x, y, floorId));
		return {
			id: enemyId,
			name: info.name || source.name || enemyId,
			hp: Math.max(0, Number(info.hp) || 0),
			maxHp: Math.max(0, Number(info.hp) || 0),
			atk: Math.max(0, Number(info.atk) || 0),
			def: Math.max(0, Number(info.def) || 0),
			hitRate: Number.isFinite(hitRate) ? Math.max(0, Math.min(1, hitRate)) : 1,
			// 怪物 attackInterval 配置表示每秒出手次数；内部仍统一换算成攻击间隔 Tick。
			attackIntervalTicks: rules.getEnemyAttackIntervalTicks(attackSpeed),
			// 怪物奥义获取词条：怪物定义（enemys.js）里的 "ultimateGain" 字段，可被楼层属性动态覆盖。
			ultimateGain: Math.max(0, Number(core.getEnemyValue(source, "ultimateGain", x, y, floorId)) || 0),
			buffs: [],
			debuffs: [],
			special: clone(info.special || []),
			combatRules: buildEnemyCombatRules(source, x, y, floorId),
			runtimeCounters: {},
			runtimeModifiers: [],
			expectationAccumulator: 0
		};
	};

	var createBattleInput = function (enemyId, x, y, floorId, forEstimate) {
		floorId = floorId || core.status.floorId;
		var player = getHeroSnapshot();
		return {
			version: BATTLE_RULE_VERSION,
			player: player,
			enemy: getEnemySnapshot(enemyId, x, y, floorId),
			weapons: getPlacedWeaponSnapshots(),
			meta: forEstimate ? {} : {
				initialPlayerHp: player.hp,
				x: x,
				y: y,
				floorId: floorId
			}
		};
	};

	var refreshEstimateViews = function () {
		if (!core.status || !core.status.played || core.status.gameOver || runtime.isActive()) return;
		if (core.updateDamage) core.updateDamage();
		if (core.status.event && (core.status.event.id === "book" || core.status.event.id === "book-detail")
			&& core.ui && core.ui.drawBook) {
			var index = Number(core.status.event.data) || 0;
			core.ui.drawBook(index);
		}
	};

	var getBattleRandomSeed = function () {
		var seed = core.getFlag("__randBattle__", null);
		if (seed == null) seed = core.getFlag("__seed__", core.getFlag("__rand__", 0));
		seed = Math.floor(Number(seed));
		return Number.isFinite(seed) ? seed : 0;
	};

	var version = (typeof main !== "undefined" && main.version) ? main.version : "1";
	var estimate = createBackpackBattleEstimateCoordinator_f43e0d5b_629e_457c_9540_b3f0d0541ffc({
		workerUrl: "project/workers/backpackBattleEstimateWorker.js?v=" + encodeURIComponent(version),
		maximumCacheSize: 256,
		createInput: function (enemyId, x, y, floorId) {
			var randomSeed = getBattleRandomSeed();
			var input = createBattleInput(enemyId, x, y, floorId, true);
			input.randomSeed = randomSeed;
			return {
				battleRuleVersion: BATTLE_RULE_VERSION,
				weaponConfigVersion: WEAPON_CONFIG_VERSION,
				randomSeed: randomSeed,
				currentHp: input.player.hp,
				input: input
			};
		},
		onRefresh: refreshEstimateViews
	});

	var getLayoutSignature = function () {
		if (!plugin.getBackpackState) return "[]";
		var state = plugin.getBackpackState();
		return estimate.stableStringify((state.placed || []).map(function (entry) {
			return {
				instanceId: entry.instanceId,
				sourceItemId: entry.weapon.sourceItemId,
				col: entry.col,
				row: entry.row,
				rotation: entry.rotation,
				weapon: entry.weapon
			};
		}));
	};

	plugin.onBackpackBattleLayoutChanged = function () {
		if (!core.status || !core.status.hero) return;
		var signature = getLayoutSignature();
		if (signature === lastLayoutSignature) return;
		lastLayoutSignature = signature;
		estimate.bumpLayoutRevision();
	};

	var getEstimateCoordinates = function (enemy) {
		var location = enemy && Array.isArray(enemy.locs) && enemy.locs.length ? enemy.locs[0] : null;
		return {
			x: location ? location[0] : null,
			y: location ? location[1] : null,
			floorId: enemy && enemy.floorId ? enemy.floorId : core.status.floorId
		};
	};

	var formatNumber = function (value) {
		value = Math.round((Number(value) || 0) * 10) / 10;
		return core.formatBigNumber ? core.formatBigNumber(value, true) : String(value);
	};

	var formatEstimate = function (entry) {
		if (!entry || entry.status === "pending") return { text: "计算中", color: "#FFFFFF" };
		if (entry.status === "error") return { text: "计算失败", color: "#FF4444" };
		var result = entry.result;
		if (result.roundsExceeded) return { text: "???", color: "#FF2222" };
		var text = formatNumber(result.damage);
		var damage = Number(result.damage) || 0;
		var hp = Math.max(0, Number(core.status.hero.hp) || 0);
		var color;
		if (damage <= 0) color = "#11FF11";
		else if (!result.canWin || damage >= hp) color = "#FF2222";
		else if (damage < hp / 3) color = "#FFFFFF";
		else if (damage < hp * 2 / 3) color = "#FFFF00";
		else color = "#FF9933";
		return { text: text, color: color };
	};

	var requestEnemyEstimate = function (enemyId, x, y, floorId) {
		return estimate.request(enemyId, x, y, floorId);
	};

	var updateDamage = function (floorId, onMap) {
		core.status.damage.data = [];
		if (!core.flags.displayEnemyDamage) return;
		core.extractBlocks(floorId);
		core.status.maps[floorId].blocks.forEach(function (block) {
			var x = block.x;
			var y = block.y;
			if (onMap && core.bigmap.v2 && (x < core.bigmap.posX - core.bigmap.extend
				|| x > core.bigmap.posX + core._WIDTH_ + core.bigmap.extend
				|| y < core.bigmap.posY - core.bigmap.extend
				|| y > core.bigmap.posY + core._HEIGHT_ + core.bigmap.extend)) return;
			if (block.disable || block.event.cls.indexOf("enemy") !== 0 || block.event.displayDamage === false) return;
			var display = formatEstimate(requestEnemyEstimate(block.event.id, x, y, floorId));
			core.status.damage.data.push({
				text: display.text,
				px: 32 * x + 1,
				py: 32 * (y + 1) - 1,
				color: display.color
			});
		});
	};

	core.control._updateDamage_damage = updateDamage;
	core.flags.displayCritical = false;

	var estimateFromBookEnemy = function (enemy) {
		var coordinates = getEstimateCoordinates(enemy);
		return requestEnemyEstimate(enemy.id, coordinates.x, coordinates.y, coordinates.floorId);
	};

	var drawBookDamage = function (index, enemy, offset, position) {
		var display = formatEstimate(estimateFromBookEnemy(enemy));
		core.setTextAlign("ui", "center");
		core.fillText("ui", display.text, offset, position, display.color, this._buildFont(13, true));
	};
	core.ui._drawBook_drawDamage = drawBookDamage;
	if (typeof ui !== "undefined") ui.prototype._drawBook_drawDamage = drawBookDamage;

	var drawBookRow3 = function (index, enemy, top, left, width, position) {
		var entry = estimateFromBookEnemy(enemy);
		var result = entry.status === "ready" ? entry.result : null;
		var rounds = "—";
		if (entry.status === "pending") rounds = "计算中";
		else if (entry.status === "error") rounds = "失败";
		else if (result.roundsExceeded) rounds = "???";
		else rounds = formatNumber(result.rounds);
		var coordinates = getEstimateCoordinates(enemy);
		var attackSpeed = getEnemyAttackSpeed(core.material.enemys[enemy.id],
			coordinates.x, coordinates.y, coordinates.floorId);
		core.setTextAlign("ui", "left");
		var bold = this._buildFont(13, true);
		var normal = this._buildFont(13, false);
		var col1 = left;
		var col2 = left + width * 9 / 25;
		// 只保留"回合 / 间隔"两列（原第三列的"攻击"与第一行重复，已删除）。
		core.fillText("ui", "回合", col1, position, "#DDDDDD", normal);
		core.fillText("ui", rounds, col1 + 30, position, null, bold);
		core.fillText("ui", "攻速", col2, position, "#DDDDDD", normal);
		core.fillText("ui", formatNumber(attackSpeed), col2 + 30, position, null, bold);
	};
	core.ui._drawBook_drawRow3 = drawBookRow3;
	if (typeof ui !== "undefined") ui.prototype._drawBook_drawRow3 = drawBookRow3;

	// 覆盖怪物手册第一行：删除"防御"列，只保留"生命 / 攻击"两列。
	var drawBookRow1 = function (index, enemy, top, left, width, position) {
		core.setTextAlign("ui", "left");
		var bold = this._buildFont(13, true);
		var normal = this._buildFont(13, false);
		var col1 = left;
		var col2 = left + width * 9 / 25;
		core.fillText("ui", core.getStatusLabel("hp"), col1, position, "#DDDDDD", normal);
		core.fillText("ui", core.formatBigNumber(enemy.hp || 0), col1 + 30, position, null, bold);
		core.fillText("ui", core.getStatusLabel("atk"), col2, position, "#DDDDDD", normal);
		core.fillText("ui", core.formatBigNumber(enemy.atk || 0), col2 + 30, position, null, bold);
	};
	core.ui._drawBook_drawRow1 = drawBookRow1;
	if (typeof ui !== "undefined") ui.prototype._drawBook_drawRow1 = drawBookRow1;

	var drawBookDetailEstimate = function (enemy, floorId, texts) {
		var coordinates = getEstimateCoordinates(enemy);
		var entry = requestEnemyEstimate(enemy.id, coordinates.x, coordinates.y, floorId);
		var display = formatEstimate(entry);
		texts.push("预计受伤：" + display.text);
		if (entry.status === "ready" && !entry.result.roundsExceeded) {
			texts.push("预计回合：" + formatNumber(entry.result.rounds));
		}
		var attackSpeed = getEnemyAttackSpeed(core.material.enemys[enemy.id],
			coordinates.x, coordinates.y, floorId || coordinates.floorId);
		texts.push("攻速：" + formatNumber(attackSpeed) + " 次/秒");
		texts.push("攻击：" + formatNumber(enemy.atk || 0));
		var abilities = buildEnemyAbilityTexts(enemy.id, coordinates.x, coordinates.y, floorId);
		if (abilities.length) {
			texts.push("");
			abilities.forEach(function (line) { texts.push(line); });
		}
	};
	core.ui._drawBookDetail_turnAndCriticals = drawBookDetailEstimate;
	if (typeof ui !== "undefined") ui.prototype._drawBookDetail_turnAndCriticals = drawBookDetailEstimate;

	var noCriticals = function () { return []; };
	core.enemys.nextCriticals = noCriticals;
	core.enemys._nextCriticals_useBinarySearch = noCriticals;
	core.enemys.getDefDamage = function () { return 0; };
	if (typeof enemys !== "undefined") {
		enemys.prototype.nextCriticals = noCriticals;
		enemys.prototype._nextCriticals_useBinarySearch = noCriticals;
		enemys.prototype.getDefDamage = function () { return 0; };
	}

	core.enemys.getDamage = function (enemy, x, y, floorId) {
		var enemyId = typeof enemy === "string" ? enemy : enemy && enemy.id;
		if (!enemyId) return null;
		var entry = requestEnemyEstimate(enemyId, x, y, floorId);
		if (entry.status !== "ready" || entry.result.roundsExceeded) return null;
		return entry.result.damage;
	};
	core.enemys.getDamageString = function (enemy, x, y, floorId) {
		var enemyId = typeof enemy === "string" ? enemy : enemy && enemy.id;
		return formatEstimate(requestEnemyEstimate(enemyId, x, y, floorId));
	};
	core.enemys.canBattle = function (enemy) {
		var enemyId = typeof enemy === "string" ? enemy : enemy && enemy.id;
		return !!(enemyId && core.material.enemys[enemyId]);
	};

	var restoreEventState = function (savedEvent) {
		if (!core.status.event) return;
		["id", "data", "selection", "ui", "interval"].forEach(function (key) {
			core.status.event[key] = savedEvent[key];
		});
	};

	/**
	 * 战斗弹层会隔离 body 的 keyup；进入战斗前若正按着方向键，引擎的循环按键状态
	 * 将收不到释放事件。接管和归还控制权时都清空，令已排队的 pressKey 循环立即停止。
	 */
	var clearHeldMovementKeys = function () {
		if (!core.status) return;
		core.status.holdingKeys = [];
		core.status.heroStop = true;
	};

	var settleFinishedBattle = function (result) {
		var context = activeBattleContext;
		if (!context || context.settled || !result) return false;
		context.settled = true;
		activeBattleContext = null;
		battleUi.close();
		restoreEventState(context.savedEvent);
		clearHeldMovementKeys();
		if (!context.wasLocked) core.unlockControl();
		if (plugin.achievementSystem && typeof plugin.achievementSystem.recordBattleResult === "function") {
			try { plugin.achievementSystem.recordBattleResult(result); }
			catch (error) { console.error("成就战斗结算失败", error); }
		}
		if (result.outcome === "victory") {
			pendingSettlement = clone(result);
			core.events.afterBattle(context.id, context.x, context.y);
		} else if (result.outcome === "defeat") {
			core.status.hero.statistics.battleDamage += Math.max(0, Number(result.netDamage) || 0);
			core.status.hero.hp = 0;
			core.updateStatusBar(false, true);
			core.events.lose("战斗失败");
		}
		if (context.callback) {
			context.callback();
		} else if (core.isReplaying && core.isReplaying() && typeof core.replay === "function") {
			// 录像中战斗若由 doSystemEvent 直接触发（未经过事件流），结束后没有
			// 事件流回调来继续录像；这里手动调用 core.replay()，否则录像会停住。
			core.replay();
		}
		return true;
	};

	var unsubscribeSettlement = runtime.subscribe(function (snapshot) {
		if (snapshot && snapshot.active === false && snapshot.result) {
			settleFinishedBattle(snapshot.result);
		}
	});

	var startBattle = function (id, x, y, force, callback) {
		core.saveAndStopAutomaticRoute();
		id = id || core.getBlockId(x, y);
		var cls = core.getClsFromId(id);
		if (!id || !cls || (cls !== "enemys" && cls !== "enemy48")) {
			return core.clearContinueAutomaticRoute(callback);
		}
		if (runtime.isActive()) return false;
		if (!core.status.event.id) core.autosave(true);
		if (!core.events.beforeBattle(id, x, y)) return core.clearContinueAutomaticRoute(callback);

		var event = core.status.event || {};
		var savedEvent = {
			id: event.id,
			data: event.data,
			selection: event.selection,
			ui: event.ui,
			interval: event.interval
		};
		var wasLocked = !!core.status.lockControl;
		clearHeldMovementKeys();
		core.lockControl();
		core.status.event.id = EVENT_ID;
		core.status.event.data = { enemyId: id, x: x, y: y };
		activeBattleContext = {
			id: id,
			x: x,
			y: y,
			savedEvent: savedEvent,
			wasLocked: wasLocked,
			callback: callback,
			settled: false
		};

		var input;
		try { input = createBattleInput(id, x, y, core.status.floorId, false); }
		catch (error) {
			activeBattleContext = null;
			restoreEventState(savedEvent);
			if (!wasLocked) core.unlockControl();
			core.drawTip("战斗初始化失败：" + (error.message || error));
			return core.clearContinueAutomaticRoute(callback);
		}
		var hasActiveWeapon = input.weapons.some(function (weapon) {
			return Number(weapon.attributes.attackIntervalTicks) > 0
				&& Number(weapon.attributes.maxAttack) > 0;
		});
		if (!hasActiveWeapon) {
			activeBattleContext = null;
			restoreEventState(savedEvent);
			if (!wasLocked) core.unlockControl();
			core.drawTip("请先在背包中摆放至少一把可攻击武器", id);
			return core.clearContinueAutomaticRoute(callback);
		}

		var isGuideBattle = !!(core.getFlag && core.getFlag("inGuide"))
			&& !(core.isReplaying && core.isReplaying());
		var started = runtime.start(input, {
			// 教程必须展示完整战斗过程；显式指定 1 倍速也可屏蔽此前保存的“立即结算”偏好。
			speed: isGuideBattle ? 1 : undefined,
			fastForward: !isGuideBattle && core.isReplaying && core.isReplaying(),
			onFinish: function (result) {
				settleFinishedBattle(result);
			}
		});
		if (!started) {
			activeBattleContext = null;
			restoreEventState(savedEvent);
			if (!wasLocked) core.unlockControl();
			return core.clearContinueAutomaticRoute(callback);
		}
		// start() 只完成战斗初始化，尚未推进时间；在这里暂停可保证教程开始前不会发生攻击。
		if (isGuideBattle) runtime.pause();
		return true;
	};

	core.events.battle = startBattle;
	if (typeof events !== "undefined") events.prototype.battle = startBattle;

	plugin.consumeBackpackBattleSettlement = function (enemyId, x, y) {
		if (!pendingSettlement || pendingSettlement.enemyId !== enemyId) return null;
		if (pendingSettlement.x != null && x != null && pendingSettlement.x !== x) return null;
		if (pendingSettlement.y != null && y != null && pendingSettlement.y !== y) return null;
		var result = pendingSettlement;
		pendingSettlement = null;
		return clone(result);
	};

	var originalResetGame = core.events.resetGame;
	core.events.resetGame = function () {
		pendingSettlement = null;
		activeBattleContext = null;
		runtime.abort();
		battleUi.close();
		estimate.restartWorker();
		lastLayoutSignature = null;
		return originalResetGame.apply(this, arguments);
	};

	var getReplayDebugDetails = function (extra) {
		var replay = core.status && core.status.replay || {};
		var details = {
			battleRandomSequence: core.getFlag ? core.getFlag("__randBattle__", null) : null,
			replayIndex: replay.steps == null ? null : replay.steps,
			remainingActions: Array.isArray(replay.toReplay) ? replay.toReplay.length : null
		};
		Object.keys(extra || {}).forEach(function (key) { details[key] = extra[key]; });
		return details;
	};
	var originalStartReplay = core.control && core.control.startReplay;
	var originalStopReplay = core.control && core.control.stopReplay;
	var originalReplayFinished = core.control && core.control._replay_finished;
	var originalReplayError = core.control && core.control._replay_error;
	var wrappedStartReplay = null;
	var wrappedStopReplay = null;
	var wrappedReplayFinished = null;
	var wrappedReplayError = null;
	if (typeof originalStartReplay === "function") {
		wrappedStartReplay = function (list) {
			clearBackpackBattleDebugLog();
			recordBackpackBattleDebugLog("录像播放开始", getReplayDebugDetails({
				replayActionCount: Array.isArray(list) ? list.length : null
			}));
			return originalStartReplay.apply(this, arguments);
		};
		core.control.startReplay = wrappedStartReplay;
	}
	if (typeof originalStopReplay === "function") {
		wrappedStopReplay = function (force) {
			recordBackpackBattleDebugLog("录像播放停止", getReplayDebugDetails({ force: force === true }));
			return originalStopReplay.apply(this, arguments);
		};
		core.control.stopReplay = wrappedStopReplay;
	}
	if (typeof originalReplayFinished === "function") {
		wrappedReplayFinished = function () {
			recordBackpackBattleDebugLog("录像播放完成", getReplayDebugDetails());
			return originalReplayFinished.apply(this, arguments);
		};
		core.control._replay_finished = wrappedReplayFinished;
	}
	if (typeof originalReplayError === "function") {
		wrappedReplayError = function (action) {
			recordBackpackBattleDebugLog("录像播放失败", getReplayDebugDetails({ action: action }));
			return originalReplayError.apply(this, arguments);
		};
		core.control._replay_error = wrappedReplayError;
	}

	var cleanup = function () {
		pendingSettlement = null;
		activeBattleContext = null;
		if (unsubscribeSettlement) unsubscribeSettlement();
		battleUi.destroy();
		runtime.destroy();
		estimate.destroy();
		if (core.control) {
			if (core.control.startReplay === wrappedStartReplay) core.control.startReplay = originalStartReplay;
			if (core.control.stopReplay === wrappedStopReplay) core.control.stopReplay = originalStopReplay;
			if (core.control._replay_finished === wrappedReplayFinished) core.control._replay_finished = originalReplayFinished;
			if (core.control._replay_error === wrappedReplayError) core.control._replay_error = originalReplayError;
		}
	};
	window.addEventListener("beforeunload", cleanup, { once: true });

	plugin.backpackBattle = {
		start: function (enemyId, x, y, options) {
			options = options || {};
			return startBattle(enemyId, x, y, options.force === true, options.callback);
		},
		pause: runtime.pause,
		resume: runtime.resume,
		setSpeed: runtime.setSpeed,
		setPreferredSpeed: runtime.setPreferredSpeed,
		getPreferredSpeed: runtime.getPreferredSpeed,
		getSnapshot: runtime.getSnapshot,
		fastForward: runtime.fastForward,
		stop: runtime.stop,
		isActive: runtime.isActive,
		debugLog: {
			clear: clearBackpackBattleDebugLog,
			get: getBackpackBattleDebugLog,
			download: downloadBackpackBattleDebugLog
		},
		applyStatus: function (targetKey, statusId, stacks) {
			var snapshot = runtime.getSnapshot();
			if (!snapshot || !snapshot.active) return false;
			return false;
		},
		getStatusDefinitions: function () { return clone(backpackBattleStatusDefinitions_7d94f05e_2f6d_4b8e_9c23_5a317ccab120); }
	};
	plugin.backpackBattleEstimate = {
		request: estimate.request,
		peek: estimate.peek,
		clear: estimate.clear,
		bumpLayoutRevision: estimate.bumpLayoutRevision,
		getCacheSize: estimate.getCacheSize
	};
	plugin.gameRandom = runtime.gameRandom;

	lastLayoutSignature = getLayoutSignature();
	return plugin.backpackBattle;
};
