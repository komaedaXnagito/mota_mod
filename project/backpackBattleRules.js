/**
 * 背包乱斗的纯确定性规则。
 *
 * 这里只实现公式、状态和数据驱动效果，不读取 core、DOM、Canvas，也不持有随机服务。
 * 实际战斗在外层提供已经确定的命中、伤害和驱散目标；预计模拟则提供数学期望结果。
 */
var backpackBattleRules_36e4a689_0f48_476f_92a7_1c12b3903e87 = (function () {
	"use strict";

	var FIXED_SCALE = 1000;
	var getStatusRegistry = function () {
		return backpackBattleStatusDefinitions_7d94f05e_2f6d_4b8e_9c23_5a317ccab120;
	};

	var toNumber = function (value, fallback) {
		var number = Number(value);
		return Number.isFinite(number) ? number : (fallback == null ? 0 : fallback);
	};

	var clamp = function (value, minimum, maximum) {
		return Math.max(minimum, Math.min(maximum, value));
	};

	var fixed = function (value) {
		return Math.round(toNumber(value, 0) * FIXED_SCALE) / FIXED_SCALE;
	};

	var clone = function (value) {
		return value == null ? value : JSON.parse(JSON.stringify(value));
	};

	var getStatusDefinition = function (statusId) {
		return getStatusRegistry().definitions[statusId] || null;
	};

	/** 全部减益状态 ID，用于“随机弱体效果”等随机施加效果；按注册表 order 顺序返回。 */
	var getAllDebuffIds = function () {
		var registry = getStatusRegistry();
		return (registry.order || []).filter(function (statusId) {
			var definition = registry.definitions[statusId];
			return !!(definition && definition.kind === "debuff");
		});
	};

	/** 全部增益状态 ID，用于“随机 buff”等随机施加效果；按注册表 order 顺序返回。专属 buff（exclusive: true）不参与随机。 */
	var getAllBuffIds = function () {
		var registry = getStatusRegistry();
		return (registry.order || []).filter(function (statusId) {
			var definition = registry.definitions[statusId];
			return !!(definition && definition.kind === "buff" && definition.exclusive !== true);
		});
	};

	/** 是否专属 buff（如刻印/MP/狼皮）：不可被驱散、不参与随机 buff 池。 */
	var isExclusiveBuff = function (statusId) {
		var definition = getStatusDefinition(statusId);
		return !!(definition && definition.kind === "buff" && definition.exclusive === true);
	};

	var getStatusList = function (side, statusId) {
		var definition = getStatusDefinition(statusId);
		if (!definition || !side) return null;
		return definition.kind === "buff" ? side.buffs : side.debuffs;
	};

	var findStatus = function (side, statusId) {
		var list = getStatusList(side, statusId);
		if (!list) return null;
		for (var index = 0; index < list.length; index++) {
			if (list[index].id === statusId) return list[index];
		}
		return null;
	};

	var getStatusStacks = function (side, statusId) {
		var status = findStatus(side, statusId);
		return status ? Math.max(0, toNumber(status.stacks, 0)) : 0;
	};

	var removeStatusStacks = function (side, statusId, stacks) {
		var list = getStatusList(side, statusId);
		if (!list) return 0;
		var wanted = Math.max(0, toNumber(stacks, 0));
		for (var index = 0; index < list.length; index++) {
			if (list[index].id !== statusId) continue;
			var removed = Math.min(wanted, Math.max(0, toNumber(list[index].stacks, 0)));
			list[index].stacks = fixed(list[index].stacks - removed);
			if (list[index].stacks <= 0) list.splice(index, 1);
			return removed;
		}
		return 0;
	};

	var appendLog = function (state, text, kind) {
		if (!state || !Array.isArray(state.battleLog) || !text) return;
		state.battleLog.push({
			tick: state.tick,
			kind: kind || "info",
			text: String(text)
		});
		if (state.battleLog.length > 240) state.battleLog.splice(0, state.battleLog.length - 240);
	};

	var getSide = function (state, sideKey) {
		return sideKey === "enemy" ? state.enemy : state.player;
	};

	var oppositeSide = function (sideKey) {
		return sideKey === "enemy" ? "player" : "enemy";
	};

	var applyStatus = function (state, targetKey, statusId, stacks, sourceKey, options) {
		options = options || {};
		var definition = getStatusDefinition(statusId);
		var target = getSide(state, targetKey);
		if (!definition || !target) return { applied: 0, reflected: 0 };
		var wanted = Math.max(0, Math.floor(toNumber(stacks, 0)));
		var applied = 0;
		var reflected = 0;
		// 狼皮：不可叠加（层数仅控制持续时间，每秒 -1）。已存在时不叠加层数，但按传入层数延长持续时间（取较大值）；
		// 首次施加时按传入层数作为持续时间秒数（如 stacks:10 = 10 秒狼皮）。
		if (statusId === "wolfSkin") {
			var existingWolf = findStatus(target, "wolfSkin");
			if (existingWolf) {
				existingWolf.stacks = Math.max(existingWolf.stacks, wanted);
				wanted = 0;
			} else {
				wanted = Math.max(1, wanted);
			}
		}
		for (var index = 0; index < wanted; index++) {
			if (definition.kind === "debuff" && !options.reflected && sourceKey && sourceKey !== targetKey
				&& getStatusStacks(target, "reflection") > 0) {
				removeStatusStacks(target, "reflection", 1);
				applyStatus(state, sourceKey, statusId, 1, targetKey, { reflected: true });
				reflected++;
				appendLog(state, target.name + "反射了1层" + definition.name, "status");
				continue;
			}
			// 狼皮存在时：所有弱体效果对自身无效（与层数无关，狼皮任意层数 ≥1 即生效）
			if (definition.kind === "debuff" && !options.reflected && sourceKey && sourceKey !== targetKey
				&& getStatusStacks(target, "wolfSkin") > 0) {
				appendLog(state, target.name + "的狼皮吸收了1层" + definition.name, "status");
				continue;
			}
			var list = getStatusList(target, statusId);
			var current = findStatus(target, statusId);
			if (current) current.stacks = fixed(current.stacks + 1);
			else list.push({ id: statusId, stacks: 1, acquiredTick: state.tick });
			applied++;
		}
		if (applied > 0) appendLog(state, target.name + "获得" + definition.name + " ×" + applied, "status");
		// 钩子：自身获得强化效果时，累计到"强化效果获得计数"（每满 every 层触发一次效果）。
		if (targetKey === "player" && definition.kind === "buff" && applied > 0) {
			accumulateBuffGains(state, applied);
		}
		return { applied: applied, reflected: reflected };
	};

	/** 强化效果获得计数：遍历 buffGainCounters，累计获得层数，每满 every 触发一次对敌伤害。 */
	var accumulateBuffGains = function (state, stacks) {
		var counters = Array.isArray(state.buffGainCounters) ? state.buffGainCounters : [];
		if (!counters.length || stacks <= 0) return;
		counters.forEach(function (counter) {
			counter.acc = (counter.acc || 0) + stacks;
			while (counter.acc >= counter.every) {
				counter.acc -= counter.every;
				applyDamage(state, "enemy", Math.max(0, toNumber(counter.damage, 0)), { direct: true });
				appendLog(state, "强化效果计数触发：对敌方造成 " + counter.damage + " 点伤害", "damage");
			}
		});
	};

	var cleanseAllDebuffs = function (state, sideKey) {
		var side = getSide(state, sideKey);
		if (!side) return 0;
		var removed = 0;
		for (var index = side.debuffs.length - 1; index >= 0; index--) {
			if (side.debuffs[index].stacks > 0) {
				side.debuffs[index].stacks = fixed(side.debuffs[index].stacks - 1);
				removed++;
			}
			if (side.debuffs[index].stacks <= 0) side.debuffs.splice(index, 1);
		}
		if (removed) appendLog(state, side.name + "净化了全部 Debuff 各1层", "status");
		return removed;
	};

	/** 净化 1 个弱体状态（随机选取 1 个 stacks>0 的 Debuff 移除 1 层）。实际战斗经 handlers 随机，预计固定第一个。 */
	var cleanseOneDebuff = function (state, sideKey) {
		var side = getSide(state, sideKey);
		if (!side) return 0;
		var available = side.debuffs.filter(function (debuff) { return debuff.stacks > 0; });
		if (!available.length) return 0;
		var selected = available[0];
		removeStatusStacks(side, selected.id, 1);
		appendLog(state, side.name + "净化了1层" + (getStatusDefinition(selected.id) || { name: selected.id }).name, "status");
		return 1;
	};

	/** 消耗 MP（专属指示物）并累计到本次战斗的 MP 消耗总量（用于"奥义发动时按累计消耗 MP 造成伤害"等）；同时累计到 MP 消耗计数（每消耗 every 点 MP 触发奥义加成）。 */
	var consumeMp = function (state, sideKey, amount) {
		var removed = removeStatusStacks(getSide(state, sideKey), "mp", amount);
		if (removed > 0) {
			state.mpConsumedTotal = fixed((state.mpConsumedTotal || 0) + removed);
			accumulateMpConsumption(state, removed);
		}
		return removed;
	};

	/** MP 消耗计数：遍历 mpConsumeCounters，累计消耗量，每满 every 点给自身奥义 +value（如"每消耗10点MP：自身奥义+5"）。 */
	var accumulateMpConsumption = function (state, consumed) {
		var counters = Array.isArray(state.mpConsumeCounters) ? state.mpConsumeCounters : [];
		if (!counters.length || consumed <= 0) return;
		counters.forEach(function (counter) {
			counter.acc = (counter.acc || 0) + consumed;
			while (counter.acc >= counter.every) {
				counter.acc -= counter.every;
				state.player.ultimate = fixed(toNumber(state.player.ultimate, 0) + counter.value);
				appendLog(state, "每消耗" + counter.every + "点MP：奥义+" + counter.value, "ultimate");
			}
		});
	};

	var dispelLastBuff = function (state, sideKey) {
		var side = getSide(state, sideKey);
		if (!side) return null;
		for (var index = side.buffs.length - 1; index >= 0; index--) {
			if (side.buffs[index].stacks <= 0) continue;
			var statusId = side.buffs[index].id;
			// 专属 buff（刻印/MP/狼皮）不可被驱散。
			if (isExclusiveBuff(statusId)) continue;
			removeStatusStacks(side, statusId, 1);
			appendLog(state, side.name + "的" + getStatusDefinition(statusId).name + "被驱散1层", "status");
			return statusId;
		}
		return null;
	};

	/** 每个 Buff 独立按当前层数的百分比向下取整驱散。专属 buff（刻印/MP/狼皮）不参与。 */
	var dispelBuffPercent = function (state, sideKey, percent) {
		var side = getSide(state, sideKey);
		if (!side) return { totalRemoved: 0, removedByStatus: {} };
		percent = Math.max(0, toNumber(percent, 0));
		if (percent > 1) percent /= 100;
		percent = clamp(percent, 0, 1);
		var totalRemoved = 0;
		var removedByStatus = {};
		side.buffs.slice().forEach(function (status) {
			if (isExclusiveBuff(status.id)) return;
			var removed = Math.floor(Math.max(0, toNumber(status.stacks, 0)) * percent);
			if (removed <= 0) return;
			removed = removeStatusStacks(side, status.id, removed);
			if (removed <= 0) return;
			removedByStatus[status.id] = removed;
			totalRemoved += removed;
			var definition = getStatusDefinition(status.id);
			appendLog(state, side.name + "的" + (definition ? definition.name : status.id)
				+ "被驱散" + removed + "层", "status");
		});
		return { totalRemoved: totalRemoved, removedByStatus: removedByStatus };
	};

	var applyDamage = function (state, targetKey, rawDamage, options) {
		options = options || {};
		var target = getSide(state, targetKey);
		if (!target) return { rawDamage: 0, blocked: 0, damage: 0 };
		var remainingRawDamage = Math.max(0, toNumber(rawDamage, 0));
		// 无敌：5 秒内受到的伤害降至 0（如"黑之魅力效果中：攻击时，5秒内受到的伤害降至0"）。格挡也不消耗。
		if (targetKey === "player" && target.invincibleUntilTick > state.tick) {
			return { rawDamage: fixed(rawDamage), blocked: 0, damage: 0 };
		}
		var blocked = 0;
		if (!options.direct && !options.ignoreBlock && remainingRawDamage > 0) {
			blocked = Math.min(getStatusStacks(target, "block"), remainingRawDamage);
			if (blocked > 0) removeStatusStacks(target, "block", blocked);
			remainingRawDamage = fixed(remainingRawDamage - blocked);
		}
		var damage = fixed(remainingRawDamage);
		target.hp = fixed(target.hp - damage);
		target.damageTaken = fixed((target.damageTaken || 0) + damage);
		if (damage > 0 && !options.silent) {
			appendLog(state, target.name + "受到" + damage + "点" + (options.direct ? "直接" : "") + "伤害", "damage");
		}
		return { rawDamage: fixed(rawDamage), blocked: fixed(blocked), damage: damage };
	};

	var heal = function (state, sideKey, amount, handlers) {
		var side = getSide(state, sideKey);
		if (!side) return 0;
		var before = side.hp;
		side.hp = fixed(Math.min(side.maxHp, side.hp + Math.max(0, toNumber(amount, 0))));
		var recovered = fixed(side.hp - before);
		if (recovered > 0) {
			appendLog(state, side.name + "恢复" + recovered + " HP", "heal");
			// 自身 HP 回复时触发器（afterHeal）：玩家回血后触发，handlers 供随机/联动类效果使用；
			// afterHealActive 防止规则内再次回血造成无限递归（一次回血至多触发一轮 afterHeal）。
			if (sideKey === "player" && !state.afterHealActive) {
				state.afterHealActive = true;
				try {
					runAllWeaponRules(state, "afterHeal", { sourceSide: "player", healAmount: recovered }, handlers);
				} finally {
					state.afterHealActive = false;
				}
			}
		}
		return recovered;
	};

	var getEffectiveHitRate = function (side, baseHitRate) {
		return clamp(toNumber(baseHitRate, 1) - getStatusStacks(side, "darkness") * 0.05, 0, 1);
	};

	var getUltimateGain = function (side, baseGain, combatState) {
		baseGain = toNumber(baseGain, 0);
		var modifiedGain = baseGain
			+ getStatusStacks(side, "highSpirit") * 2
			- getStatusStacks(side, "exhaustion") * 2
			+ toNumber(combatState && combatState.globalUltimateGainBonus, 0);
		// 兼容原规则：基础获取非负的武器最多被虚脱降到 0，不会因此反向变成消耗。
		return fixed(baseGain < 0 ? modifiedGain : Math.max(0, modifiedGain));
	};

	var getWeaponStat = function (weapon, stat, tick) {
		var value = toNumber(weapon.attributes && weapon.attributes[stat], 0);
		var modifiers = Array.isArray(weapon.runtimeModifiers) ? weapon.runtimeModifiers : [];
		modifiers.forEach(function (modifier) {
			if (modifier.expiresTick != null && modifier.expiresTick <= tick) return;
			if (modifier.stat !== stat && !(modifier.stat === "attack" && (stat === "minAttack" || stat === "maxAttack"))) return;
			if (modifier.operation === "multiply") value *= toNumber(modifier.value, 1);
			else if (modifier.operation === "set") value = toNumber(modifier.value, value);
			else value += toNumber(modifier.value, 0);
		});
		return fixed(value);
	};

	/** 按分组统计场上武器数量（含自身）：
	 * groupBy === "weaponTypes" 时统计与当前武器共享任意武器类型的武器数；
	 * 默认统计场上"任意同名武器组"的最大数量——即只要场上存在 N 把相同名称的武器（不要求
	 * 与当前武器同名、也不要求同类型）就计入，实现"一把a + 三把任意同名武器b 也触发a的效果"。 */
	var countGroupedWeapons = function (state, weapon, groupBy) {
		if (groupBy === "weaponTypes") {
			var types = (weapon && (weapon.attributes && weapon.attributes.weaponTypes)) || (weapon && weapon.weaponTypes) || [];
			return (state.weapons || []).filter(function (w) {
				var wt = (w && (w.attributes && w.attributes.weaponTypes)) || (w && w.weaponTypes) || [];
				return wt.some(function (type) { return types.indexOf(type) >= 0; });
			}).length;
		}
		var nameCounts = {};
		(state.weapons || []).forEach(function (w) {
			var n = w.name || w.instanceId;
			nameCounts[n] = (nameCounts[n] || 0) + 1;
		});
		var maxCount = 0;
		for (var n in nameCounts) maxCount = Math.max(maxCount, nameCounts[n]);
		return maxCount;
	};

	/** 同名武器数量驱动的伤害加成：本武器 name 相同的武器数（或 groupBy weaponTypes 时共享类型的武器数）
	 * ≥ threshold 时伤害 +value（满足条件即生效，与数量无关）。 */
	var getSameNameDamageBonus = function (state, weapon) {
		var bonuses = Array.isArray(state.sameNameDamageBonuses) ? state.sameNameDamageBonuses : [];
		if (!bonuses.length || !weapon) return 0;
		var weaponTypes = (weapon && (weapon.attributes && weapon.attributes.weaponTypes)) || (weapon && weapon.weaponTypes) || [];
		var total = 0;
		bonuses.forEach(function (bonus) {
			// 加成只属于注册该效果的武器（"填在 a 武器上的效果"只作用于 a）；其他武器不吃。
			if (bonus.sourceWeaponId && weapon.instanceId !== bonus.sourceWeaponId) return;
			var sameNameCount = countGroupedWeapons(state, weapon, bonus.groupBy);
			if (bonus.weaponTypes && !bonus.weaponTypes.some(function (type) { return weaponTypes.indexOf(type) >= 0; })) return;
			if (sameNameCount >= bonus.threshold) total += bonus.value;
		});
		return fixed(total);
	};

	/** 状态驱动的全局武器伤害加成：每次攻击时按目标阵营当前状态层数实时计算，天然可逆、不累积。
	 * 支持 nearby 模式：bonus 记录注册武器与范围，仅作用于注册武器附近（directions/distance）匹配的武器。 */
	var getStatusWeaponDamageBonus = function (state, weapon) {
		var bonuses = Array.isArray(state.weaponDamageBonuses) ? state.weaponDamageBonuses : [];
		var weaponTypes = (weapon && (weapon.attributes && weapon.attributes.weaponTypes)) || (weapon && weapon.weaponTypes) || [];
		var total = 0;
		bonuses.forEach(function (bonus) {
			if (bonus.nearby) {
				var sourceWeapon = null;
				for (var sourceIndex = 0; sourceIndex < state.weapons.length; sourceIndex++) {
					if (state.weapons[sourceIndex].instanceId === bonus.sourceWeaponId) {
						sourceWeapon = state.weapons[sourceIndex];
						break;
					}
				}
				if (!sourceWeapon) return;
				if (weapon.instanceId === sourceWeapon.instanceId) {
					if (!bonus.includeSelf) return;
				} else if (!areNearby(sourceWeapon, weapon, bonus)) return;
			} else if (bonus.weaponTypes && !bonus.weaponTypes.some(function (type) { return weaponTypes.indexOf(type) >= 0; })) {
				return;
			}
			var side = bonus.target === "enemy" ? state.enemy : state.player;
			// status 为 "allDebuffs" 时按目标阵营全部弱体状态（debuff）的层数合计计算（如"敌方每有5个debuff，本武器伤害+1"）。
			var stacks = bonus.status === "allDebuffs"
				? (side.debuffs || []).reduce(function (sum, debuff) {
					return sum + Math.max(0, toNumber(debuff.stacks, 0));
				}, 0)
				: getStatusStacks(side, bonus.status);
			total += Math.floor(stacks / bonus.every) * bonus.value;
		});
		return fixed(total);
	};

	/** 状态驱动的攻击间隔修正（回合单位，换算为 Tick）：如"敌方每有10层冰结，自身间隔-1.9回合"。天然可逆、不累积。 */
	var getStatusIntervalBonusTicks = function (state, weapon) {
		var bonuses = Array.isArray(state.weaponIntervalBonuses) ? state.weaponIntervalBonuses : [];
		var weaponTypes = (weapon && (weapon.attributes && weapon.attributes.weaponTypes)) || (weapon && weapon.weaponTypes) || [];
		var totalTicks = 0;
		bonuses.forEach(function (bonus) {
			if (bonus.weaponTypes && !bonus.weaponTypes.some(function (type) { return weaponTypes.indexOf(type) >= 0; })) return;
			var side = bonus.target === "enemy" ? state.enemy : state.player;
			var stacks = getStatusStacks(side, bonus.status);
			totalTicks += Math.floor(stacks / bonus.every) * bonus.value * 100;
		});
		return fixed(totalTicks);
	};

	/** 附近武器数量驱动的伤害加成：注册武器 directions/distance/filter 范围内每有一个匹配武器，其攻击伤害 +value。天然可逆、不累积。 */
	var getNearbyDamageBonus = function (state, weapon) {
		var bonuses = Array.isArray(state.nearbyDamageBonuses) ? state.nearbyDamageBonuses : [];
		var total = 0;
		bonuses.forEach(function (bonus) {
			if (weapon.instanceId !== bonus.sourceWeaponId) return;
			total += countNearbyWeapons(state, weapon, bonus) * bonus.value;
		});
		return fixed(total);
	};

	/** 状态驱动的额外攻击次数：目标阵营每有 every 层状态，本武器攻击次数 +value（如"敌方每有10层冰结，自身攻击次数+1"）。天然可逆、不累积。 */
	var getStatusExtraAttackCount = function (state, weapon) {
		var bonuses = Array.isArray(state.weaponExtraAttacks) ? state.weaponExtraAttacks : [];
		var weaponTypes = (weapon && (weapon.attributes && weapon.attributes.weaponTypes)) || (weapon && weapon.weaponTypes) || [];
		var total = 0;
		bonuses.forEach(function (bonus) {
			if (bonus.weaponTypes && !bonus.weaponTypes.some(function (type) { return weaponTypes.indexOf(type) >= 0; })) return;
			var side = bonus.target === "enemy" ? state.enemy : state.player;
			var stacks = getStatusStacks(side, bonus.status);
			total += Math.floor(stacks / bonus.every) * bonus.value;
		});
		return Math.max(0, Math.floor(total));
	};

	/** 附近武器数量驱动的额外攻击次数：注册武器 directions/distance/filter 范围内每有 every 个匹配武器，其攻击次数 +value（如"上下左右一格内每配置2个食物，本物品攻击次数+1"）。天然可逆、不累积。 */
	var getNearbyExtraAttackCount = function (state, weapon) {
		var bonuses = Array.isArray(state.nearbyExtraAttacks) ? state.nearbyExtraAttacks : [];
		var total = 0;
		bonuses.forEach(function (bonus) {
			if (weapon.instanceId !== bonus.sourceWeaponId) return;
			total += Math.floor(countNearbyWeapons(state, weapon, bonus) / bonus.every) * bonus.value;
		});
		return Math.max(0, Math.floor(total));
	};

	/** 附近武器数量阈值驱动的额外攻击次数：附近匹配武器数 ≥ threshold 时，本武器攻击次数 +value（二进制，与数量无关；如"上下左右一格内食物与动物总数达到5个以上时，本武器攻击回数+2"）。 */
	var getNearbyThresholdExtraAttackCount = function (state, weapon) {
		var bonuses = Array.isArray(state.nearbyThresholdExtraAttacks) ? state.nearbyThresholdExtraAttacks : [];
		var total = 0;
		bonuses.forEach(function (bonus) {
			if (weapon.instanceId !== bonus.sourceWeaponId) return;
			if (countNearbyWeapons(state, weapon, bonus) >= bonus.threshold) total += bonus.value;
		});
		return Math.max(0, Math.floor(total));
	};

	/** 附近武器数量驱动的攻击间隔修正（回合单位，换算为 Tick）：注册武器范围内每有 every 个匹配武器，其攻击间隔 +value 回合（如"上下左右一格内每有一个盾，本武器使用间隔-0.3"）。天然可逆、不累积。 */
	var getNearbyIntervalBonusTicks = function (state, weapon) {
		var bonuses = Array.isArray(state.nearbyIntervalBonuses) ? state.nearbyIntervalBonuses : [];
		var totalTicks = 0;
		bonuses.forEach(function (bonus) {
			if (weapon.instanceId !== bonus.sourceWeaponId) return;
			totalTicks += Math.floor(countNearbyWeapons(state, weapon, bonus) / bonus.every) * bonus.value * 100;
		});
		return fixed(totalTicks);
	};

	/** 附近武器数量驱动的攻击间隔百分比修正：注册武器范围内每有 every 个匹配武器，攻击间隔 × (1 - value)（如"上下左右一格内每有一只动物，使用间隔-10%"）。乘算累积，天然可逆、不累积。 */
	var getNearbyIntervalPercent = function (state, weapon) {
		var bonuses = Array.isArray(state.nearbyIntervalPercentBonuses) ? state.nearbyIntervalPercentBonuses : [];
		var total = 0;
		bonuses.forEach(function (bonus) {
			if (weapon.instanceId !== bonus.sourceWeaponId) return;
			total += Math.floor(countNearbyWeapons(state, weapon, bonus) / bonus.every) * bonus.value;
		});
		return Math.min(0.99, Math.max(0, total));
	};

	var getWeaponIntervalTicks = function (state, weapon) {
		var interval = getWeaponStat(weapon, "attackIntervalTicks", state.tick);
		if (interval <= 0) {
			var rounds = getWeaponStat(weapon, "attackInterval", state.tick);
			interval = Math.round(rounds * 100);
		} else {
			// attackIntervalTicks 存在时，把 attackInterval（回合单位）的修正换算为 ticks 叠加，
			// 支持"攻击间隔-0.1 回合"这类以回合为单位的写法。
			var baseRounds = weapon.attributes && weapon.attributes.attackInterval;
			if (baseRounds != null) {
				var modifiedRounds = getWeaponStat(weapon, "attackInterval", state.tick);
				interval += Math.round((modifiedRounds - toNumber(baseRounds, 0)) * 100);
			}
		}
		if (interval <= 0) return 0;
		interval += getStatusStacks(state.player, "ice");
		interval -= getStatusStacks(state.player, "excitation");
		interval += getStatusIntervalBonusTicks(state, weapon);
		interval += getNearbyIntervalBonusTicks(state, weapon);
		// 附近武器数量驱动的间隔百分比修正（乘算）：interval × (1 - 总百分比)。
		var nearbyPercent = getNearbyIntervalPercent(state, weapon);
		if (nearbyPercent > 0) interval = Math.max(1, Math.round(interval * (1 - nearbyPercent)));
		return Math.max(1, Math.round(interval));
	};

	var getEnemyIntervalTicks = function (state) {
		var interval = Math.max(1, Math.round(toNumber(state.enemy.attackIntervalTicks, 100)));
		interval += getStatusStacks(state.enemy, "ice");
		return Math.max(1, interval);
	};

	var getRoundRemainingTicks = function (tick) {
		var progress = tick % 100;
		return progress === 0 ? 100 : 100 - progress;
	};

	var settlePeriodicStatuses = function (state, handlers) {
		["player", "enemy"].forEach(function (sideKey) {
			var side = getSide(state, sideKey);
			var burnStacks = getStatusStacks(side, "burn");
			if (burnStacks > 0) applyDamage(state, sideKey, burnStacks * 10, { direct: true });
			var regenerationStacks = getStatusStacks(side, "regeneration");
			if (regenerationStacks > 0) {
				heal(state, sideKey, regenerationStacks * 10, handlers);
				removeStatusStacks(side, "regeneration", 1);
			}
			// 狼皮：每秒减 1 层（层数仅控制持续时间）
			if (getStatusStacks(side, "wolfSkin") > 0) {
				removeStatusStacks(side, "wolfSkin", 1);
			}
			// 黑之魅力：每秒反射+1/再生+1/格挡+1，每秒消耗 4 层 MP；MP 不足时解除该效果（专属 buff，不可被驱散/随机）。
			var blackCharmStacks = getStatusStacks(side, "blackCharm");
			if (blackCharmStacks > 0) {
				var sourceSide = sideKey;
				applyStatus(state, sourceSide, "reflection", 1, sourceSide);
				applyStatus(state, sourceSide, "regeneration", 1, sourceSide);
				applyStatus(state, sourceSide, "block", 1, sourceSide);
				var mpStacks = getStatusStacks(side, "mp");
				if (mpStacks < 4) {
					removeStatusStacks(side, "blackCharm", blackCharmStacks);
					appendLog(state, side.name + "的MP不足，黑之魅力解除", "status");
				} else {
					consumeMp(state, sideKey, 4);
				}
			}
		});
	};

	var matchesFilter = function (weapon, filter) {
		filter = filter || {};
		var attributes = weapon.attributes || {};
		var types = attributes.weaponTypes || weapon.weaponTypes || [];
		if (Array.isArray(filter.weaponTypes) && !filter.weaponTypes.some(function (type) { return types.indexOf(type) >= 0; })) return false;
		if (Array.isArray(filter.itemIds) && filter.itemIds.indexOf(weapon.sourceItemId) < 0) return false;
		if (Array.isArray(filter.weaponIds) && filter.weaponIds.indexOf(weapon.id || weapon.weaponId) < 0) return false;
		if (filter.hasAttack === true && getWeaponStat(weapon, "maxAttack", 0) <= 0) return false;
		if (filter.hasAttack === false && getWeaponStat(weapon, "maxAttack", 0) > 0) return false;
		return true;
	};

	var CLOCKWISE_DIRECTIONS = ["up", "right", "down", "left"];

	/** 战斗规则中的方向以武器 0 度为基准，运行时随来源武器顺时针旋转。 */
	var rotateCombatDirections = function (directions, rotation) {
		if (!Array.isArray(directions) || !directions.length) return [];
		var normalizedRotation = Math.round((toNumber(rotation, 0)) / 90) * 90;
		normalizedRotation = ((normalizedRotation % 360) + 360) % 360;
		var quarterTurns = normalizedRotation / 90;
		return directions.map(String).map(function (direction) {
			var index = CLOCKWISE_DIRECTIONS.indexOf(direction);
			return index < 0 ? null : CLOCKWISE_DIRECTIONS[(index + quarterTurns) % 4];
		}).filter(function (direction, index, list) {
			return direction && list.indexOf(direction) === index;
		});
	};

	var areNearby = function (leftWeapon, rightWeapon, options) {
		options = options || {};
		var distance = Math.max(1, Math.floor(toNumber(options.distance, 1)));
		var directions = rotateCombatDirections(options.directions, leftWeapon.rotation);
		if (!directions.length) directions = CLOCKWISE_DIRECTIONS.slice();
		var leftCells = leftWeapon.cells || [];
		var rightCells = rightWeapon.cells || [];
		if (!leftCells.length || !rightCells.length) return false;

		// sideBox：与布局 addSideBoxCells 一致，基于来源武器包围盒的矩形区域。
		if (options.relation === "sideBox") {
			var span = Math.max(1, Math.floor(toNumber(options.span, distance)));
			var minimumX = Math.min.apply(null, leftCells.map(function (cell) { return cell[0]; }));
			var maximumX = Math.max.apply(null, leftCells.map(function (cell) { return cell[0]; }));
			var minimumY = Math.min.apply(null, leftCells.map(function (cell) { return cell[1]; }));
			var maximumY = Math.max.apply(null, leftCells.map(function (cell) { return cell[1]; }));
			var firstRow = Math.floor((minimumY + maximumY) / 2 - (span - 1) / 2);
			var firstColumn = Math.floor((minimumX + maximumX) / 2 - (span - 1) / 2);
			return rightCells.some(function (rightCell) {
				return directions.some(function (direction) {
					if (direction === "left") {
						return rightCell[0] <= minimumX - 1 && rightCell[0] >= minimumX - distance
							&& rightCell[1] >= firstRow && rightCell[1] < firstRow + span;
					}
					if (direction === "right") {
						return rightCell[0] >= maximumX + 1 && rightCell[0] <= maximumX + distance
							&& rightCell[1] >= firstRow && rightCell[1] < firstRow + span;
					}
					if (direction === "up") {
						return rightCell[1] <= minimumY - 1 && rightCell[1] >= minimumY - distance
							&& rightCell[0] >= firstColumn && rightCell[0] < firstColumn + span;
					}
					if (direction === "down") {
						return rightCell[1] >= maximumY + 1 && rightCell[1] <= maximumY + distance
							&& rightCell[0] >= firstColumn && rightCell[0] < firstColumn + span;
					}
					return false;
				});
			});
		}

		// 严格正交：与布局 addOrthogonalCells 一致，目标格必须与来源格同一行或同一列。
		return leftCells.some(function (leftCell) {
			return rightCells.some(function (rightCell) {
				var dx = rightCell[0] - leftCell[0];
				var dy = rightCell[1] - leftCell[1];
				if (dy === 0 && dx !== 0) {
					if (dx < 0 && directions.indexOf("left") >= 0) return -dx <= distance;
					if (dx > 0 && directions.indexOf("right") >= 0) return dx <= distance;
					return false;
				}
				if (dx === 0 && dy !== 0) {
					if (dy < 0 && directions.indexOf("up") >= 0) return -dy <= distance;
					if (dy > 0 && directions.indexOf("down") >= 0) return dy <= distance;
					return false;
				}
				return false;
			});
		});
	};

	var countNearbyWeapons = function (state, sourceWeapon, options) {
		return findNearbyWeapons(state, sourceWeapon, options).length;
	};

	/** 按战斗快照的稳定武器顺序返回空间与筛选条件都匹配的武器。 */
	var findNearbyWeapons = function (state, sourceWeapon, options) {
		return state.weapons.filter(function (candidate) {
			return candidate.instanceId !== sourceWeapon.instanceId
				&& matchesFilter(candidate, options && options.filter)
				&& areNearby(sourceWeapon, candidate, options);
		});
	};

	var resolveSideKey = function (target, sourceSide) {
		if (target === "player" || target === "enemy") return target;
		if (target === "opponent") return oppositeSide(sourceSide);
		return sourceSide;
	};

	var compare = function (actual, operator, expected) {
		if (operator === "gt") return actual > expected;
		if (operator === "gte") return actual >= expected;
		if (operator === "lt") return actual < expected;
		if (operator === "lte") return actual <= expected;
		if (operator === "neq") return actual !== expected;
		return actual === expected;
	};

	var conditionsPass = function (state, weapon, rule, context, handlers) {
		return (rule.conditions || []).every(function (condition) {
			if (condition.kind === "status") {
				var side = getSide(state, resolveSideKey(condition.target, context.sourceSide));
				return compare(getStatusStacks(side, condition.status), condition.operator || "gte", toNumber(condition.value, 1));
			}
			if (condition.kind === "counter") {
				return compare(toNumber(weapon.runtimeCounters[condition.key], 0), condition.operator || "gte", toNumber(condition.value, 1));
			}
			if (condition.kind === "nearbyCount") {
				return compare(countNearbyWeapons(state, weapon, condition), condition.operator || "gte", toNumber(condition.value, 1));
			}
			if (condition.kind === "sameNameCount") {
				// 同名武器数量条件：统计与当前武器 name 相同的武器数（含自身），如"配置3个及以上同名武器"；
				// 配置 groupBy: "weaponTypes" 时改为统计共享武器类型的武器数（含自身）。
				return compare(countGroupedWeapons(state, weapon, condition.groupBy),
					condition.operator || "gte", toNumber(condition.value, 3));
			}
			if (condition.kind === "hpPercent") {
				// 生命值百分比条件：目标当前 HP 与本场战斗最大血量（进战斗时的血条满值）之比与 value 比较
				// （如"自身hp掉到1/3以下"：target self、operator lte、value 0.3333）。战斗中途 maxHp 变化不影响分母。
				var hpSide = getSide(state, resolveSideKey(condition.target, context.sourceSide));
				var hpDenominator = (state.battleMaxHp && state.battleMaxHp > 0) ? state.battleMaxHp
					: (hpSide && hpSide.maxHp > 0 ? hpSide.maxHp : 1);
				var hpRatio = hpSide ? fixed(hpSide.hp / hpDenominator) : 0;
				return compare(hpRatio, condition.operator || "lte", toNumber(condition.value, 1 / 3));
			}
			if (condition.kind === "combatFlag") {
				// 战斗标记条件：state.combatFlags[key] 为 true（negate: true 表示"未设置"），用于"某效果触发后关闭另一规则"。
				var flagSet = !!(state.combatFlags && state.combatFlags[condition.key]);
				return condition.negate === true ? !flagSet : flagSet;
			}
			if (condition.kind === "ultimatePercent") {
				// 奥义值条件：勇士当前奥义与 value 比较（默认 ≥100，即"自身奥义100%时"）。
				return compare(toNumber(state.player && state.player.ultimate, 0),
					condition.operator || "gte", toNumber(condition.value, 100));
			}
			if (condition.kind === "debuffStacks") {
				// 弱体层数条件：目标身上的全部 Debuff 总层数（各状态层数求和）与 value 比较
				// （如"自身弱体效果10个以上"：target self、operator gte、value 10）。
				var debuffSide = getSide(state, resolveSideKey(condition.target || "self", context.sourceSide));
				var totalDebuffStacks = (debuffSide && debuffSide.debuffs || []).reduce(function (sum, debuff) {
					return sum + Math.max(0, Number(debuff.stacks) || 0);
				}, 0);
				return compare(totalDebuffStacks, condition.operator || "gte", toNumber(condition.value, 10));
			}
			if (condition.kind === "chance") {
				// 概率条件：base + 附近匹配武器数 × nearbyBonus；实际战斗经 handlers.rollChance 掷骰（计入随机数），
				// 预计伤害固定按通过处理（与 dispelRandomBuff/applyRandomDebuff 的确定性策略一致）。
				if (!handlers || !handlers.rollChance) return true;
				var chance = toNumber(condition.base, 0)
					+ countNearbyWeapons(state, weapon, condition) * toNumber(condition.nearbyBonus, 0);
				return handlers.rollChance(clamp(chance, 0, 1));
			}
			if (condition.kind === "linkedWeapon") {
				var hitWeapon = context.hitWeapon;
				return !!(hitWeapon
					&& hitWeapon.instanceId !== weapon.instanceId
					&& matchesFilter(hitWeapon, condition.filter)
					&& areNearby(weapon, hitWeapon, condition));
			}
			if (condition.kind === "nearbyShieldTriggered") {
				// 附近是否存在"本次被攻击周期发动过被攻击效果"的武器（如盾牌），用于 afterShieldEffect 触发器。
				var shieldMap = state.shieldEffects || {};
				return findNearbyWeapons(state, weapon, condition).some(function (candidate) {
					return shieldMap[candidate.instanceId] === true;
				});
			}
			if (condition.kind === "buffStacks") {
				// 自身强化效果总层数（所有 buff 的 stacks 之和），用于"随机消耗10个强化效果"等前置条件。
				var buffTotal = (state.player.buffs || []).reduce(function (sum, buff) {
					return sum + Math.max(0, toNumber(buff.stacks, 0));
				}, 0);
				return compare(buffTotal, condition.operator || "gte", toNumber(condition.value, 1));
			}
			if (condition.kind === "attackOrigin") {
				return compare(context.attackOrigin, condition.operator || "eq", condition.value || "normal");
			}
			return true;
		});
	};

	/** 支持“条件每满足 N 次触发一次”，计数按武器和规则分别保存并保留余数。 */
	var frequencyPasses = function (weapon, rule, ruleIndex) {
		if (rule.every == null) return true;
		var every = Math.max(1, Math.floor(toNumber(rule.every, 1)));
		var counterKey = String(rule.counterKey || ("ruleEvery:" + (rule.id || ruleIndex)));
		var count = Math.max(0, Math.floor(toNumber(weapon.runtimeCounters[counterKey], 0))) + 1;
		weapon.runtimeCounters[counterKey] = count % every;
		return count >= every;
	};

	var resolveEffectAmount = function (state, weapon, effect, context) {
		var amount = toNumber(effect.stacks == null ? effect.value : effect.stacks, 1);
		var source = effect.stacksFrom;
		if (source && source.kind === "nearbyCount") {
			amount = countNearbyWeapons(state, weapon, source) * toNumber(source.multiplier, 1);
		}
		if (source && source.kind === "status") {
			var side = getSide(state, resolveSideKey(source.target, context.sourceSide));
			amount = getStatusStacks(side, source.status) * toNumber(source.multiplier, 1);
		}
		return Math.max(0, amount);
	};

	/** 执行一条规则的效果列表；可被 runCombatRules 调用，也可被 triggerWeaponEffects 用于立即发动其他武器的效果。 */
	var runRuleEffects = function (state, weapon, rule, context, handlers) {
		(rule.effects || []).forEach(function (effect) {
			var targetKey = resolveSideKey(effect.target || "opponent", context.sourceSide);
			var amount = resolveEffectAmount(state, weapon, effect, context);
			if (effect.type === "applyStatus") applyStatus(state, targetKey, effect.status, amount, context.sourceSide);
			else if (effect.type === "applyRandomDebuff" && handlers.applyRandomDebuff) {
				handlers.applyRandomDebuff(targetKey, weapon, effect, context, amount);
			}
			else if (effect.type === "applyRandomBuffs" && handlers.applyRandomBuff) {
				// 随机 buff：随机 count 次，每次从候选池（缺省为全部 buff）随机选取 1 个施加 stacks 层，可重复叠加。
				handlers.applyRandomBuff(targetKey, weapon, effect, context, amount);
			}
			else if (effect.type === "nearbyRandomBuff" && handlers.applyRandomBuff) {
				// 每有 every 个附近匹配武器（directions/distance/filter），随机获得 1 个强化 buff（battleStart 一次性结算）。
				// 如"每有1个配置在上下左右一格内的动物，自身随机获得1个强化效果"。
				var nearbyBuffCount = Math.floor(countNearbyWeapons(state, weapon, effect)
					/ Math.max(1, Math.floor(toNumber(effect.every, 1))));
				if (nearbyBuffCount > 0) {
					handlers.applyRandomBuff(targetKey, weapon,
						Object.assign({}, effect, { count: nearbyBuffCount }), context, amount);
				}
			}
			else if (effect.type === "nearbyCleanseDebuff") {
				// 每有 every 个附近匹配武器，净化 1 个弱体状态（如"每有1个配置在上下左右一格内的食物，
				// 自身随机获得1个buff，并净化1个debuff"）；净化次数按附近匹配数实时计算，重复随机净化。
				var nearbyCleanseCount = Math.floor(countNearbyWeapons(state, weapon, effect)
					/ Math.max(1, Math.floor(toNumber(effect.every, 1))));
				for (var cleanseIndex = 0; cleanseIndex < nearbyCleanseCount; cleanseIndex++) {
					cleanseOneDebuff(state, targetKey);
				}
			}
			else if (effect.type === "nearbyApplyStatus") {
				// 每有 every 个附近匹配武器，施加指定状态 stacks 层（如"被攻击时：上下左右一格内每配置一个盾牌，
				// 自身格挡+2/高扬+1"）；每次触发实时计算附近数并施加。
				var nearbyStatusCount = Math.floor(countNearbyWeapons(state, weapon, effect)
					/ Math.max(1, Math.floor(toNumber(effect.every, 1))));
				var nearbyStatusPer = Math.max(0, toNumber(effect.stacks == null ? effect.value : effect.stacks, 1));
				if (nearbyStatusCount > 0 && nearbyStatusPer > 0 && effect.status) {
					applyStatus(state, targetKey, String(effect.status),
						fixed(nearbyStatusCount * nearbyStatusPer), context.sourceSide);
				}
			}
			else if (effect.type === "removeStatus") removeStatusStacks(getSide(state, targetKey), effect.status, amount);
			else if (effect.type === "cleanseAllDebuffs") cleanseAllDebuffs(state, targetKey);
			else if (effect.type === "damageSelf") {
				// 自身扣除 HP（如"攻击时：自身hp-20"）；amount 为 effect.value/stacks 数值。
				var selfDamage = Math.max(0, Math.floor(toNumber(effect.value, 0) + toNumber(effect.stacks, 0)));
				if (selfDamage > 0) {
					state.player.hp = fixed(Math.max(0, state.player.hp - selfDamage));
					appendLog(state, "自身受到 " + selfDamage + " 点自伤", "damage");
				}
			}
			else if (effect.type === "healPercent") {
				// 按本场战斗最大血量百分比恢复（如"恢复1/3的hp"：value 0.3333 → 恢复进战斗时满血量的 1/3）。
				var healPercentRatio = clamp(toNumber(effect.value, 0), 0, 1);
				if (healPercentRatio > 0) {
					var healBase = (state.battleMaxHp && state.battleMaxHp > 0) ? state.battleMaxHp : (state.player.maxHp || 1);
					heal(state, "player", Math.max(0, Math.floor(healBase * healPercentRatio)), handlers);
				}
			}
			else if (effect.type === "setCombatFlag") {
				// 设置战斗标记：state.combatFlags[key] = true；配合 combatFlag 条件(negate)实现"触发后关闭其他规则"。
				state.combatFlags = state.combatFlags || {};
				state.combatFlags[String(effect.key)] = true;
			}
			else if (effect.type === "globalUltimateGainBonus") {
				// 所有武器奥义获得量加成：每次攻击基础奥义获得 +value（多规则累加，如两把武器各+20 → +40）。
				state.globalUltimateGainBonus = fixed(toNumber(state.globalUltimateGainBonus, 0)
					+ Math.max(0, toNumber(effect.value, 0)));
			}
			else if (effect.type === "disableUltimate") {
				// 禁用奥义发动：state.ultimateDisabled = true，奥义攒满也不会发动（配合"奥义满转狼皮"等自循环规则）。
				state.ultimateDisabled = true;
			}
			else if (effect.type === "buffGainCounter") {
				// 强化效果获得计数：自身每获得 every 层强化效果（buff），对敌方造成 damage 点伤害（直接伤害）。
				// 按 effect.id 幂等注册，累计计数跨规则跨来源（如"自身每获得10个强化效果时：对敌方造成10点伤害"）。
				var buffCounters = state.buffGainCounters || (state.buffGainCounters = []);
				var buffCounterId = String(effect.id || "default");
				for (var buffCounterIndex = 0; buffCounterIndex < buffCounters.length; buffCounterIndex++) {
					if (buffCounters[buffCounterIndex].id === buffCounterId) {
						buffCounters.splice(buffCounterIndex, 1);
						break;
					}
				}
				buffCounters.push({
					id: buffCounterId,
					every: Math.max(1, Math.floor(toNumber(effect.every, 10))),
					damage: Math.max(0, toNumber(effect.damage, 10)),
					acc: 0
				});
			}
			else if (effect.type === "mpConsumeCounter") {
				// MP 消耗计数：每消耗 every 点 MP，自身奥义 +value（如"每消耗10点MP：自身奥义+5"）。
				// 按 effect.id 幂等注册，跨规则跨来源累计（黑之魅力消耗/consumeStatus 消耗均计入）。
				var mpCounters = state.mpConsumeCounters || (state.mpConsumeCounters = []);
				var mpCounterId = String(effect.id || "default");
				for (var mpCounterIndex = 0; mpCounterIndex < mpCounters.length; mpCounterIndex++) {
					if (mpCounters[mpCounterIndex].id === mpCounterId) {
						mpCounters.splice(mpCounterIndex, 1);
						break;
					}
				}
				mpCounters.push({
					id: mpCounterId,
					every: Math.max(1, Math.floor(toNumber(effect.every, 10))),
					value: Math.max(0, Math.floor(toNumber(effect.value, 5))),
					acc: 0
				});
			}
			else if (effect.type === "cleanseOneDebuff") {
				// 净化 1 个弱体状态：随机选取 1 个 stacks>0 的 Debuff 移除 1 层（实际战斗经 handlers 随机、预计固定第一个）。
				if (handlers.cleanseOneDebuff) handlers.cleanseOneDebuff(targetKey);
				else cleanseOneDebuff(state, targetKey);
			}
			else if (effect.type === "dealMpConsumedDamage") {
				// 奥义发动时：额外造成 本次战斗中累计消耗 MP 值 × multiplier 的直接伤害（无视格挡）。
				applyDamage(state, "enemy", fixed((state.mpConsumedTotal || 0) * toNumber(effect.multiplier, 1)), { direct: true });
			}
			else if (effect.type === "setInvincible") {
				// 设置无敌：durationTicks 内（默认 5 秒 = 500 Tick）本武器受到的伤害降至 0（格挡也不消耗）。
				var invincibleDuration = Math.max(1, Math.floor(toNumber(effect.durationTicks, 500)));
				state.player.invincibleUntilTick = state.tick + invincibleDuration;
				appendLog(state, "获得无敌效果：" + invincibleDuration + " Tick 内受到的伤害降至0", "status");
			}
			else if (effect.type === "repeatAttack") {
				// 触发该武器立即再攻击 count 次（如"奥义发动时30%概率使该武器的攻击发动9次"）。
				// 实际战斗经 handlers.repeatAttack 循环 attackWeapon（origin=ultimate、不消耗奥义）；预计固定按 ×count 期望。
				if (handlers.repeatAttack) {
					handlers.repeatAttack(weapon, Math.max(1, Math.floor(toNumber(effect.count, 1))));
				}
			}
			else if ((effect.type === "dispelBuff" || effect.type === "dispelRandomBuff")
				&& handlers.dispelBuff) handlers.dispelBuff(targetKey, weapon, effect);
			else if (effect.type === "dispelBuffPercent") {
				dispelBuffPercent(state, targetKey, effect.percent == null ? effect.value : effect.percent);
			}
			else if (effect.type === "dealDamage") applyDamage(state, targetKey, amount, { direct: effect.direct === true });
			else if (effect.type === "heal") heal(state, targetKey, amount, handlers);
			else if (effect.type === "consumeStatus") {
				// 消耗状态层数（语义上用于消耗资源）；消耗 MP 走 consumeMp 以同步 MP 消耗总量与 MP 消耗计数。
				if (effect.status === "mp") consumeMp(state, targetKey, amount);
				else removeStatusStacks(getSide(state, targetKey), effect.status, amount);
			}
			else if (effect.type === "gainUltimate") state.player.ultimate = fixed(state.player.ultimate + amount);
			else if (effect.type === "statusHitRateBonus") {
				// 状态驱动的命中率修正（存在即生效，与层数无关）：目标方拥有 status（层数>=1）时本次攻击命中率 +value（如"狼皮效果中：命中率+0.5"）。
				// 应配合 beforeAttack 使用；实际命中率最终被夹在 0~1 之间。
				var hitRateBonusSide = effect.target === "enemy" || effect.target === "opponent"
					? state.enemy : state.player;
				if (getStatusStacks(hitRateBonusSide, String(effect.status || "wolfSkin")) > 0) {
					context.hitRateBonus = toNumber(context.hitRateBonus, 0) + toNumber(effect.value, 0);
				}
			}
			else if (effect.type === "modifyUltimate") {
				// 修改指定阵营的奥义值：operation 支持 add/percent/set，value 为 0.1 表示 +10%。
				var ultimateTarget = effect.target === "enemy" || effect.target === "opponent"
					? state.enemy : state.player;
				var ultimateBase = Math.max(0, toNumber(ultimateTarget.ultimate, 0));
				var ultimateModifier = toNumber(effect.value, 0);
				if (effect.operation === "percent") {
					ultimateTarget.ultimate = fixed(Math.max(0, ultimateBase + ultimateBase * ultimateModifier));
				} else if (effect.operation === "set") {
					ultimateTarget.ultimate = fixed(Math.max(0, ultimateModifier));
				} else {
					ultimateTarget.ultimate = fixed(Math.max(0, ultimateBase + ultimateModifier));
				}
			}
			else if (effect.type === "modifyReceivedDamage" && context.damage != null) {
				// 修改本次受到的伤害（应配合 beforeReceiveDamage 使用）：operation 支持 add/multiply/set。
				var receivedValue = toNumber(effect.value, 0);
				if (effect.operation === "multiply") {
					context.damage = fixed(context.damage * receivedValue);
				} else if (effect.operation === "set") {
					context.damage = fixed(receivedValue);
				} else {
					context.damage = fixed(context.damage + receivedValue);
				}
				context.damage = Math.max(0, context.damage);
			}
			else if (effect.type === "guaranteeHit") {
				// 本次攻击必定命中（无视黑暗等命中率修正）；应配合 beforeAttack 使用。
				context.guaranteeHit = true;
			}
			else if (effect.type === "ignoreBlock") {
				// 本次攻击无视目标格挡（block）抵扣；应配合 beforeAttack 使用。
				context.ignoreBlock = true;
			}
			else if (effect.type === "triggerWeaponAttack" && handlers.triggerWeaponAttack && !context.suppressLinkage) {
				handlers.triggerWeaponAttack(weapon, effect, weapon);
			}
			else if (effect.type === "triggerExtraAttacks" && handlers.triggerWeaponAttack && !context.suppressLinkage) {
				// 按目标阵营状态层数触发额外攻击：额外攻击次数 = floor(层数 / every)。
				// 例如"敌方每有10层冰结，攻击次数+1"：target opponent、status ice、every 10。
				// 仅在普通/奥义发起的攻击中触发，额外攻击（legacyExtra/linked）不再连锁，防止递归失控。
				if (context.attackOrigin === "legacyExtra" || context.attackOrigin === "linked") return;
				var extraSide = effect.target === "enemy" || effect.target === "opponent"
					? state.enemy : state.player;
				var extraEvery = Math.max(1, Math.floor(toNumber(effect.every, 10)));
				var extraCount = Math.floor(getStatusStacks(extraSide, effect.status || "ice") / extraEvery);
				for (var extraIndex = 0; extraIndex < extraCount; extraIndex++) {
					handlers.triggerWeaponAttack(weapon, effect, weapon);
				}
			}
			else if (effect.type === "triggerLinkedWeaponAttack" && handlers.triggerWeaponAttack && !context.suppressLinkage) {
				var linkedOptions = effect.linkedWeapon || effect;
				findNearbyWeapons(state, weapon, linkedOptions).forEach(function (linkedWeapon) {
					handlers.triggerWeaponAttack(linkedWeapon, effect, weapon);
				});
			}
			else if (effect.type === "triggerWeaponEffects" && !context.suppressLinkage) {
				// 立即发动附近匹配武器的全部效果：忽略目标武器的 trigger/conditions/once 限制，
				// 不重置其 CD（本效果只执行效果不发起攻击）；suppressLinkage 防止链式递归。
				findNearbyWeapons(state, weapon, effect).forEach(function (targetWeapon) {
					(targetWeapon.combatRules || []).forEach(function (targetRule) {
						runRuleEffects(state, targetWeapon, targetRule,
							Object.assign({}, context, { suppressLinkage: true, trigger: null }), handlers);
					});
				});
			}
			else if (effect.type === "sameNameDamageBonus") {
				// 同名武器数量驱动的伤害加成：本武器 name 相同的武器数（或 groupBy weaponTypes 时共享类型的武器数）
				// ≥ threshold（默认3）时伤害 +value（与数量无关，满足条件即生效）。
				// 按 effect.id 幂等注册，攻击时实时计算；weaponTypes 限定适用武器类型。
				var sameNameBonuses = state.sameNameDamageBonuses || (state.sameNameDamageBonuses = []);
				var sameNameBonusId = String(effect.id || "default");
				for (var sameNameBonusIndex = 0; sameNameBonusIndex < sameNameBonuses.length; sameNameBonusIndex++) {
					if (sameNameBonuses[sameNameBonusIndex].id === sameNameBonusId) {
						sameNameBonuses.splice(sameNameBonusIndex, 1);
						break;
					}
				}
				sameNameBonuses.push({
					id: sameNameBonusId,
					sourceWeaponId: weapon && weapon.instanceId,
					threshold: Math.max(1, Math.floor(toNumber(effect.threshold, 3))),
					value: Math.max(0, toNumber(effect.value, 0)),
					groupBy: effect.groupBy === "weaponTypes" ? "weaponTypes" : null,
					weaponTypes: Array.isArray(effect.weaponTypes) ? effect.weaponTypes.slice() : null
				});
			}
			else if (effect.type === "modifyAttackDamage" && context.minimumDamage != null) {
				var modifierValue = toNumber(effect.value, 0);
				if (effect.operation === "multiply") {
					context.minimumDamage = fixed(context.minimumDamage * modifierValue);
					context.maximumDamage = fixed(context.maximumDamage * modifierValue);
				} else if (effect.operation === "set") {
					context.minimumDamage = context.maximumDamage = fixed(modifierValue);
				} else {
					context.minimumDamage = fixed(context.minimumDamage + modifierValue);
					context.maximumDamage = fixed(context.maximumDamage + modifierValue);
				}
				context.minimumDamage = Math.max(0, context.minimumDamage);
				context.maximumDamage = Math.max(context.minimumDamage, context.maximumDamage);
			}
			else if (effect.type === "modifyWeaponStat") {
				var recipients;
				if (effect.weaponTarget === "all") {
					recipients = state.weapons;
				} else if (effect.weaponTarget === "nearby") {
					// 本武器 + 附近匹配武器（directions/distance/filter 从 effect 读取，严格正交）。
					recipients = [weapon].concat(findNearbyWeapons(state, weapon, effect));
				} else {
					recipients = [weapon];
				}
				recipients.forEach(function (recipient) {
					recipient.runtimeModifiers.push({
						stat: effect.stat,
						operation: effect.operation || "add",
						value: toNumber(effect.value, 0),
						expiresTick: effect.durationTicks == null ? null : state.tick + Math.max(1, Math.floor(effect.durationTicks))
					});
				});
			}
			else if (effect.type === "statusDamageBonus") {
				// 状态驱动的全局武器伤害加成：按 effect.id 幂等注册，攻击时按当前状态层数实时计算，不会累积。
				// target 为 "enemy"/"opponent" 时读取敌方状态（如"敌方每有2层火伤，本武器伤害+1"），否则读取勇士状态。
				// scope 为 "nearby" 时，加成只作用于注册武器附近（directions/distance）匹配的武器（如"敌方每有5层火伤，上下格内武器伤害+1"）。
				var bonuses = state.weaponDamageBonuses || (state.weaponDamageBonuses = []);
				var bonusId = String(effect.id || "default");
				for (var bonusIndex = 0; bonusIndex < bonuses.length; bonusIndex++) {
					if (bonuses[bonusIndex].id === bonusId) {
						bonuses.splice(bonusIndex, 1);
						break;
					}
				}
				var nearbyBonus = effect.scope === "nearby";
				bonuses.push({
					id: bonusId,
					status: String(effect.status || "mark"),
					every: Math.max(1, Math.floor(toNumber(effect.every, 10))),
					value: toNumber(effect.value, 0),
					target: effect.target === "enemy" || effect.target === "opponent" ? "enemy" : "player",
					weaponTypes: Array.isArray(effect.weaponTypes) ? effect.weaponTypes.slice() : null,
					nearby: nearbyBonus || null,
					sourceWeaponId: nearbyBonus ? weapon.instanceId : null,
					includeSelf: nearbyBonus ? effect.includeSelf === true : null,
					directions: nearbyBonus ? (Array.isArray(effect.directions) ? effect.directions.slice() : null) : null,
					distance: nearbyBonus ? Math.max(1, Math.floor(toNumber(effect.distance, 1))) : null
				});
			}
			else if (effect.type === "statusIntervalBonus") {				// 状态驱动的攻击间隔修正：按 effect.id 幂等注册，每次攻击间隔计算时按目标阵营当前状态层数实时计算（回合单位）。
				// target 为 "enemy"/"opponent" 时读取敌方状态（如"敌方每有10层冰结，自身间隔-1.9"），否则读取勇士状态。
				var intervalBonuses = state.weaponIntervalBonuses || (state.weaponIntervalBonuses = []);
				var intervalBonusId = String(effect.id || "default");
				for (var intervalBonusIndex = 0; intervalBonusIndex < intervalBonuses.length; intervalBonusIndex++) {
					if (intervalBonuses[intervalBonusIndex].id === intervalBonusId) {
						intervalBonuses.splice(intervalBonusIndex, 1);
						break;
					}
				}
				intervalBonuses.push({
					id: intervalBonusId,
					status: String(effect.status || "ice"),
					every: Math.max(1, Math.floor(toNumber(effect.every, 10))),
					value: toNumber(effect.value, 0),
					target: effect.target === "enemy" || effect.target === "opponent" ? "enemy" : "player",
					weaponTypes: Array.isArray(effect.weaponTypes) ? effect.weaponTypes.slice() : null
				});
			}
			else if (effect.type === "statusExtraAttack") {
				// 状态驱动的额外攻击次数：按 effect.id 幂等注册，攻击时按目标阵营当前状态层数实时计算。
				// target 为 "enemy"/"opponent" 时读取敌方状态（如"敌方每有10层冰结，自身攻击次数+1"），否则读取勇士状态。
				var extraAttacks = state.weaponExtraAttacks || (state.weaponExtraAttacks = []);
				var extraAttackId = String(effect.id || "default");
				for (var extraAttackIndex = 0; extraAttackIndex < extraAttacks.length; extraAttackIndex++) {
					if (extraAttacks[extraAttackIndex].id === extraAttackId) {
						extraAttacks.splice(extraAttackIndex, 1);
						break;
					}
				}
				extraAttacks.push({
					id: extraAttackId,
					status: String(effect.status || "ice"),
					every: Math.max(1, Math.floor(toNumber(effect.every, 10))),
					value: Math.max(0, Math.floor(toNumber(effect.value, 1))),
					target: effect.target === "enemy" || effect.target === "opponent" ? "enemy" : "player",
					weaponTypes: Array.isArray(effect.weaponTypes) ? effect.weaponTypes.slice() : null
				});
			}
			else if (effect.type === "nearbyExtraAttack") {
				// 附近武器数量驱动的额外攻击次数：按 effect.id 幂等注册，攻击时按注册武器范围内匹配武器数实时计算。
				// 如"上下左右一格内每配置2个食物，本物品攻击次数+1"（每次攻击多次伤害、多次联动，奥义获取只判一次）。
				var nearbyExtraAttacks = state.nearbyExtraAttacks || (state.nearbyExtraAttacks = []);
				var nearbyExtraAttackId = String(effect.id || "default");
				for (var nearbyExtraIndex = 0; nearbyExtraIndex < nearbyExtraAttacks.length; nearbyExtraIndex++) {
					if (nearbyExtraAttacks[nearbyExtraIndex].id === nearbyExtraAttackId) {
						nearbyExtraAttacks.splice(nearbyExtraIndex, 1);
						break;
					}
				}
				nearbyExtraAttacks.push({
					id: nearbyExtraAttackId,
					every: Math.max(1, Math.floor(toNumber(effect.every, 2))),
					value: Math.max(0, Math.floor(toNumber(effect.value, 1))),
					sourceWeaponId: weapon.instanceId,
					directions: Array.isArray(effect.directions) ? effect.directions.slice() : null,
					distance: Math.max(1, Math.floor(toNumber(effect.distance, 1))),
					relation: effect.relation === "sideBox" ? "sideBox" : null,
					span: Math.max(1, Math.floor(toNumber(effect.span, Math.floor(toNumber(effect.distance, 1)) || 1))),
					filter: effect.filter ? clone(effect.filter) : null
				});
			}
			else if (effect.type === "nearbyThresholdExtraAttack") {
				// 附近武器数量阈值驱动的额外攻击次数：附近匹配武器数 ≥ threshold 时攻击次数 +value（二进制，与数量无关）。
				// 如"上下左右一格内食物与动物的总数达到5个以上时，本武器攻击回数+2"。按 effect.id 幂等注册，实时计算。
				var nearbyThresholdAttacks = state.nearbyThresholdExtraAttacks || (state.nearbyThresholdExtraAttacks = []);
				var nearbyThresholdId = String(effect.id || "default");
				for (var nearbyThresholdIndex = 0; nearbyThresholdIndex < nearbyThresholdAttacks.length; nearbyThresholdIndex++) {
					if (nearbyThresholdAttacks[nearbyThresholdIndex].id === nearbyThresholdId) {
						nearbyThresholdAttacks.splice(nearbyThresholdIndex, 1);
						break;
					}
				}
				nearbyThresholdAttacks.push({
					id: nearbyThresholdId,
					threshold: Math.max(1, Math.floor(toNumber(effect.threshold, 1))),
					value: Math.max(0, Math.floor(toNumber(effect.value, 1))),
					sourceWeaponId: weapon.instanceId,
					directions: Array.isArray(effect.directions) ? effect.directions.slice() : null,
					distance: Math.max(1, Math.floor(toNumber(effect.distance, 1))),
					relation: effect.relation === "sideBox" ? "sideBox" : null,
					span: Math.max(1, Math.floor(toNumber(effect.span, Math.floor(toNumber(effect.distance, 1)) || 1))),
					filter: effect.filter ? clone(effect.filter) : null
				});
			}
			else if (effect.type === "nearbyIntervalBonus") {
				// 附近武器数量驱动的攻击间隔修正：按 effect.id 幂等注册，间隔计算时按注册武器范围内匹配武器数实时计算（回合单位）。
				// 如"上下左右一格内每有一个盾，本武器使用间隔-0.3"。
				var nearbyIntervalBonuses = state.nearbyIntervalBonuses || (state.nearbyIntervalBonuses = []);
				var nearbyIntervalId = String(effect.id || "default");
				for (var nearbyIntervalIndex = 0; nearbyIntervalIndex < nearbyIntervalBonuses.length; nearbyIntervalIndex++) {
					if (nearbyIntervalBonuses[nearbyIntervalIndex].id === nearbyIntervalId) {
						nearbyIntervalBonuses.splice(nearbyIntervalIndex, 1);
						break;
					}
				}
				nearbyIntervalBonuses.push({
					id: nearbyIntervalId,
					every: Math.max(1, Math.floor(toNumber(effect.every, 1))),
					value: toNumber(effect.value, 0),
					sourceWeaponId: weapon.instanceId,
					directions: Array.isArray(effect.directions) ? effect.directions.slice() : null,
					distance: Math.max(1, Math.floor(toNumber(effect.distance, 1))),
					relation: effect.relation === "sideBox" ? "sideBox" : null,
					span: Math.max(1, Math.floor(toNumber(effect.span, Math.floor(toNumber(effect.distance, 1)) || 1))),
					filter: effect.filter ? clone(effect.filter) : null
				});
			}
			else if (effect.type === "nearbyIntervalPercentBonus") {
				// 附近武器数量驱动的攻击间隔百分比修正：按 effect.id 幂等注册，间隔计算时按注册武器范围内匹配武器数实时计算。
				// 每有 every 个匹配武器，攻击间隔 × (1 - value)；value 为小数（如 0.1 = 每只附近动物使用间隔 -10%）。
				var nearbyIntervalPercents = state.nearbyIntervalPercentBonuses || (state.nearbyIntervalPercentBonuses = []);
				var nearbyIntervalPercentId = String(effect.id || "default");
				for (var nearbyPercentIndex = 0; nearbyPercentIndex < nearbyIntervalPercents.length; nearbyPercentIndex++) {
					if (nearbyIntervalPercents[nearbyPercentIndex].id === nearbyIntervalPercentId) {
						nearbyIntervalPercents.splice(nearbyPercentIndex, 1);
						break;
					}
				}
				nearbyIntervalPercents.push({
					id: nearbyIntervalPercentId,
					every: Math.max(1, Math.floor(toNumber(effect.every, 1))),
					value: Math.max(0, toNumber(effect.value, 0)),
					sourceWeaponId: weapon.instanceId,
					directions: Array.isArray(effect.directions) ? effect.directions.slice() : null,
					distance: Math.max(1, Math.floor(toNumber(effect.distance, 1))),
					relation: effect.relation === "sideBox" ? "sideBox" : null,
					span: Math.max(1, Math.floor(toNumber(effect.span, Math.floor(toNumber(effect.distance, 1)) || 1))),
					filter: effect.filter ? clone(effect.filter) : null
				});
			}
			else if (effect.type === "ignoreBlockAlways") {
				// 本武器常驻无视目标格挡（block）抵扣（无需每次 beforeAttack 设置）。
				weapon.ignoreBlockAlways = true;
			}
			else if (effect.type === "goldMultiplier") {
				// 击败敌人获得的金币增幅：多条规则按 value 累加（value:1 表示金币增加一倍，即 ×2）。
				// 两把"增加一倍"的武器叠加为 ×3（1 + 1 + 1），而非累乘的 ×4。
				state.goldMultiplier = fixed(Math.max(0, toNumber(state.goldMultiplier, 1))
					+ Math.max(0, toNumber(effect.value, 0)));
			}
			else if (effect.type === "goldBonus") {
				// 战后获得金币固定增加：多条规则按 value 累加，经战斗结果带出、在经典结算处应用。
				state.goldBonus = fixed((state.goldBonus || 0) + Math.max(0, toNumber(effect.value, 0)));
			}
			else if (effect.type === "consumeBuffs") {
				// 随机消耗自身强化效果层数：逐个随机选取 1 层扣减（实际战斗消耗随机数，预计固定按 buffs 顺序扣减）。
				var consumeCount = Math.max(0, Math.floor(toNumber(effect.count, toNumber(effect.value, 1))));
				if (consumeCount > 0 && handlers.consumeBuffs) handlers.consumeBuffs(consumeCount, context.sourceSide);
			}
			else if (effect.type === "addExtraAttack") {
				// 使 directions/distance/filter 匹配的附近武器"发动次数+1"（每次攻击造成多次伤害、触发多次联动，奥义获取只判定一次）。
				if (handlers.addExtraAttack) handlers.addExtraAttack(weapon, effect, context);
			}
			else if (effect.type === "nearbyDamageBonus") {
				// 附近武器数量驱动的伤害加成：注册武器 directions/distance/filter 范围内每有一个匹配武器，其攻击伤害 +value。
				var nearbyBonuses = state.nearbyDamageBonuses || (state.nearbyDamageBonuses = []);
				var nearbyBonusId = String(effect.id || "default");
				for (var nearbyBonusIndex = 0; nearbyBonusIndex < nearbyBonuses.length; nearbyBonusIndex++) {
					if (nearbyBonuses[nearbyBonusIndex].id === nearbyBonusId) {
						nearbyBonuses.splice(nearbyBonusIndex, 1);
						break;
					}
				}
				nearbyBonuses.push({
					id: nearbyBonusId,
					value: toNumber(effect.value, 0),
					sourceWeaponId: weapon.instanceId,
					directions: Array.isArray(effect.directions) ? effect.directions.slice() : null,
					distance: Math.max(1, Math.floor(toNumber(effect.distance, 1))),
					relation: effect.relation === "sideBox" ? "sideBox" : null,
					span: Math.max(1, Math.floor(toNumber(effect.span, Math.floor(toNumber(effect.distance, 1)) || 1))),
					filter: effect.filter ? clone(effect.filter) : null
				});
			}
		});
	};

	var runCombatRules = function (state, weapon, trigger, context, handlers) {
		context = context || {};
		if (context.sourceSide == null) context.sourceSide = "player";
		context.trigger = trigger;
		handlers = handlers || {};
		var rules = Array.isArray(weapon.combatRules) ? weapon.combatRules : [];
		rules.forEach(function (rule, ruleIndex) {
			if (rule.trigger !== trigger || !conditionsPass(state, weapon, rule, context, handlers)) return;
			if (!frequencyPasses(weapon, rule, ruleIndex)) return;
			// 规则级 once：一场战斗仅触发一次（记录在所属武器的 runtimeCounters 上）。
			if (rule.once) {
				var onceKey = String(rule.onceKey || ("ruleOnce:" + (rule.id || ruleIndex)));
				if (weapon.runtimeCounters[onceKey]) return;
				weapon.runtimeCounters[onceKey] = 1;
			}
			// 被攻击类规则发动标记：本被攻击周期内该武器的被攻击效果已发动，供 afterShieldEffect 联动判定。
			if (trigger === "beforeReceiveDamage" || trigger === "afterTakeDamage") {
				var shieldEffects = state.shieldEffects || (state.shieldEffects = {});
				shieldEffects[weapon.instanceId] = true;
			}
			runRuleEffects(state, weapon, rule, context, handlers);
		});
	};

	var runAllWeaponRules = function (state, trigger, context, handlers) {
		state.weapons.forEach(function (weapon) {
			runCombatRules(state, weapon, trigger, context, handlers);
		});
	};

	var createSide = function (source, defaultName) {
		source = source || {};
		var hp = Math.max(0, toNumber(source.hp, 0));
		return {
			id: source.id || null,
			name: String(source.name || defaultName),
			hp: fixed(hp),
			maxHp: fixed(Math.max(hp, toNumber(source.maxHp, hp))),
			atk: fixed(Math.max(0, toNumber(source.atk, 0))),
			def: fixed(Math.max(0, toNumber(source.def, 0))),
			hitRate: clamp(toNumber(source.hitRate, 1), 0, 1),
			attackIntervalTicks: Math.max(1, Math.round(toNumber(source.attackIntervalTicks, 100))),
			cooldownTicks: 0,
			ultimate: fixed(Math.max(0, toNumber(source.ultimate, 0))),
			// 奥义获取词条：每次攻击获取的奥义值（受高扬/虚脱状态影响，见 getUltimateGain）。
			ultimateGain: Math.max(0, toNumber(source.ultimateGain, 0)),
			buffs: clone(source.buffs || []),
			debuffs: clone(source.debuffs || []),
			damageTaken: 0,
			runtimeCounters: clone(source.runtimeCounters || {}),
			runtimeModifiers: clone(source.runtimeModifiers || []),
			combatRules: clone(source.combatRules || []),
			expectationAccumulator: 0
		};
	};

	var createBattleState = function (input) {
		input = input || {};
		var weapons = clone(input.weapons || []).map(function (weapon, index) {
			weapon.instanceId = String(weapon.instanceId || ("weapon_" + index));
			weapon.attributes = weapon.attributes || {};
			weapon.runtimeCounters = weapon.runtimeCounters || {};
			weapon.runtimeModifiers = weapon.runtimeModifiers || [];
			weapon.cooldownTicks = Math.max(0, Math.floor(toNumber(weapon.cooldownTicks, 0)));
			weapon.lastAttackTick = -1;
			weapon.attackSequence = 0;
			weapon.expectationAccumulator = 0;
			return weapon;
		});
		weapons.sort(function (left, right) {
			return toNumber(left.row, 0) - toNumber(right.row, 0)
				|| toNumber(left.col, 0) - toNumber(right.col, 0)
				|| left.instanceId.localeCompare(right.instanceId);
		});
		return {
			version: input.version || 1,
			tick: 0,
			round: 0,
			speed: 1,
			paused: false,
			active: true,
			result: null,
			player: createSide(input.player, "勇士"),
			enemy: createSide(input.enemy, "怪物"),
			// 本场战斗的最大血量：进战斗时玩家的 maxHp 快照（血条满值），作为 hpPercent 条件与 healPercent 的固定分母，
			// 战斗中途 maxHp 变化不影响"1/3 血量"的判定基准。
			battleMaxHp: fixed(Math.max(1, toNumber(createSide(input.player, "勇士").maxHp, 1))),
			weapons: weapons,
			battleLog: [],
			meta: clone(input.meta || {}),
			weaponDamageBonuses: [],
			weaponIntervalBonuses: [],
			weaponExtraAttacks: [],
			nearbyExtraAttacks: [],
			nearbyIntervalBonuses: [],
			nearbyThresholdExtraAttacks: [],
			goldMultiplier: 1,
			mpConsumedTotal: 0,
			mpConsumeCounters: [],
			globalUltimateGainBonus: 0,
			buffGainCounters: [],
			combatFlags: {},
			shieldEffects: {}
		};
	};

	return {
		FIXED_SCALE: FIXED_SCALE,
		toNumber: toNumber,
		clamp: clamp,
		fixed: fixed,
		clone: clone,
		getStatusDefinition: getStatusDefinition,
		getAllDebuffIds: getAllDebuffIds,
		getAllBuffIds: getAllBuffIds,
		isExclusiveBuff: isExclusiveBuff,
		findStatus: findStatus,
		getStatusStacks: getStatusStacks,
		removeStatusStacks: removeStatusStacks,
		applyStatus: applyStatus,
		cleanseAllDebuffs: cleanseAllDebuffs,
		cleanseOneDebuff: cleanseOneDebuff,
		consumeMp: consumeMp,
		dispelLastBuff: dispelLastBuff,
		dispelBuffPercent: dispelBuffPercent,
		appendLog: appendLog,
		getSide: getSide,
		oppositeSide: oppositeSide,
		applyDamage: applyDamage,
		heal: heal,
		getEffectiveHitRate: getEffectiveHitRate,
		getUltimateGain: getUltimateGain,
		getWeaponStat: getWeaponStat,
		getStatusWeaponDamageBonus: getStatusWeaponDamageBonus,
		getSameNameDamageBonus: getSameNameDamageBonus,
		getNearbyDamageBonus: getNearbyDamageBonus,
		getStatusExtraAttackCount: getStatusExtraAttackCount,
		getNearbyExtraAttackCount: getNearbyExtraAttackCount,
		getNearbyThresholdExtraAttackCount: getNearbyThresholdExtraAttackCount,
		getNearbyIntervalBonusTicks: getNearbyIntervalBonusTicks,
		getNearbyIntervalPercent: getNearbyIntervalPercent,
		getWeaponIntervalTicks: getWeaponIntervalTicks,
		getEnemyIntervalTicks: getEnemyIntervalTicks,
		getRoundRemainingTicks: getRoundRemainingTicks,
		settlePeriodicStatuses: settlePeriodicStatuses,
		rotateCombatDirections: rotateCombatDirections,
		findNearbyWeapons: findNearbyWeapons,
		countNearbyWeapons: countNearbyWeapons,
		runCombatRules: runCombatRules,
		runAllWeaponRules: runAllWeaponRules,
		createBattleState: createBattleState
	};
})();
