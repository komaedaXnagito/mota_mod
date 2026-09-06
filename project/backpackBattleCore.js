/**
 * 背包乱斗实际战斗运行时。
 *
 * 该文件只在安装时接收 core；所有战斗随机行为统一经 core.randBattle()，逻辑 Tick 与渲染帧分离。
 */
var createBackpackBattleRuntime_2f8f7df2_bf4f_45ea_8ec4_628e0e25a0dc = function (core) {
	"use strict";

	var rules = backpackBattleRules_36e4a689_0f48_476f_92a7_1c12b3903e87;
	var state = null;
	var finishCallback = null;
	var listeners = [];
	var lastTimestamp = null;
	var accumulatedMilliseconds = 0;
	var fastForwardToken = 0;
	var frameName = "backpackBattleTick";
	var speedStorageKey = "backpackBattleSpeed";
	var instantSpeedValue = "instant";
	var validSpeeds = [0.25, 0.5, 1, 2, 3, 10];
	var randBattle = function (num, debugContext) {
		if (typeof core.randBattle === "function") return core.randBattle(num, debugContext);
		return core.rand(num);
	};
	var getBattleRandomSequence = function () {
		if (!core || typeof core.getFlag !== "function") return null;
		var sequence = core.getFlag("__randBattle__", null);
		if (sequence == null) sequence = core.getFlag("__seed__", core.getFlag("__rand__", 0));
		sequence = Math.floor(Number(sequence));
		return Number.isFinite(sequence) ? sequence : null;
	};
	var logBattlePhase = function (phase, details) {
		// 调试日志只读取随机流标志，不调用 randBattle，避免日志本身改变录像结果。
		if (!core || typeof core.getFlag !== "function") return;
		var payload = {
			phase: phase,
			tick: state ? state.tick : 0,
			round: state ? state.round : 0,
			playerHp: state && state.player ? state.player.hp : null,
			enemyHp: state && state.enemy ? state.enemy.hp : null,
			enemyId: state && state.enemy ? state.enemy.id : null,
			rngCallCount: state ? state.rngCallCount : 0,
			randomSequence: getBattleRandomSequence()
		};
		Object.keys(details || {}).forEach(function (key) { payload[key] = details[key]; });
		if (core.plugin && typeof core.plugin.recordBackpackBattleDebugLog === "function") {
			try {
				core.plugin.recordBackpackBattleDebugLog(phase, payload);
				return;
			}
			catch (error) {
				if (typeof console !== "undefined" && typeof console.error === "function") {
					console.error("记录背包战斗调试日志失败", error);
				}
			}
		}
		if (typeof console !== "undefined" && typeof console.log === "function") {
			console.log("[背包战斗调试][" + phase + "]", payload);
		}
	};
	var getWeaponPhaseDetails = function (weapon, options, details) {
		var result = {
			weaponInstanceId: weapon && weapon.instanceId,
			weaponName: weapon && weapon.name,
			attackOrigin: options && options.origin || null
		};
		Object.keys(details || {}).forEach(function (key) { result[key] = details[key]; });
		return result;
	};

	var normalizeSpeed = function (speed, fallback) {
		speed = Number(speed);
		return validSpeeds.indexOf(speed) >= 0 ? speed : fallback;
	};

	var getSavedPreference = function () {
		if (!core || typeof core.getLocalStorage !== "function") return 1;
		var saved = core.getLocalStorage(speedStorageKey, 1);
		if (saved === instantSpeedValue) return instantSpeedValue;
		// 旧版本曾提供 4×；升级后平滑迁移到新的 3× 档位。
		if (Number(saved) === 4) return 3;
		return normalizeSpeed(saved, 1);
	};

	var saveSpeedPreference = function (preference) {
		if (!core || typeof core.setLocalStorage !== "function") return;
		core.setLocalStorage(speedStorageKey, preference);
	};

	var notify = function () {
		var snapshot = getSnapshot();
		listeners.slice().forEach(function (listener) {
			try { listener(snapshot); }
			catch (error) { console.error(error); }
		});
	};

	var getBattleRandomDebugContext = function (source, details) {
		var context = {
			source: source,
			tick: state ? state.tick : 0,
			round: state ? state.round : 0,
			enemyId: state && state.enemy ? state.enemy.id : null,
			playerHp: state && state.player ? state.player.hp : null,
			enemyHp: state && state.enemy ? state.enemy.hp : null,
			rngCallCount: state ? state.rngCallCount : 0
		};
		Object.keys(details || {}).forEach(function (key) { context[key] = details[key]; });
		return context;
	};
	var gameRandom = {
		next: function (debugDetails) {
			if (state) state.rngCallCount++;
			return randBattle(undefined,
				getBattleRandomDebugContext("backpackBattle.gameRandom.next", debugDetails));
		},
		int: function (minimum, maximum, debugDetails) {
			minimum = Math.ceil(Number(minimum) || 0);
			maximum = Math.floor(Number(maximum) || 0);
			if (minimum > maximum) {
				var temporary = minimum;
				minimum = maximum;
				maximum = temporary;
			}
			if (state) state.rngCallCount++;
			return minimum + randBattle(maximum - minimum + 1,
				getBattleRandomDebugContext("backpackBattle.gameRandom.int", Object.assign({
				minimum: minimum,
				maximum: maximum
			}, debugDetails || {})));
		},
		pick: function (list, debugDetails) {
			if (!Array.isArray(list) || !list.length) return null;
			return list[gameRandom.int(0, list.length - 1, debugDetails)];
		}
	};

	var getHandlers = function () {
		return {
			dispelBuff: function (targetKey) {
				logBattlePhase("随机驱散开始", { target: targetKey });
				var target = rules.getSide(state, targetKey);
				// 专属 buff（刻印/MP/狼皮/黑之魅力）不可被驱散。
				var available = target.buffs.filter(function (status) {
					return status.stacks > 0 && !rules.isExclusiveBuff(status.id);
				});
				if (!available.length) return null;
				var selected = gameRandom.pick(available, {
					randomPurpose: "dispelBuff",
					target: targetKey
				});
				rules.removeStatusStacks(target, selected.id, 1);
				rules.appendLog(state, target.name + "的"
					+ rules.getStatusDefinition(selected.id).name + "被驱散1层", "status");
				logBattlePhase("随机驱散结束", { target: targetKey, status: selected.id });
				return selected.id;
			},
			cleanseOneDebuff: function (targetKey) {
				logBattlePhase("随机净化开始", { target: targetKey });
				// 净化 1 个弱体状态：随机选取 1 个 stacks>0 的 Debuff 移除 1 层。
				var target = rules.getSide(state, targetKey);
				if (!target) return 0;
				var available = target.debuffs.filter(function (debuff) { return debuff.stacks > 0; });
				if (!available.length) return 0;
				var selected = gameRandom.pick(available, {
					randomPurpose: "cleanseOneDebuff",
					target: targetKey
				});
				rules.removeStatusStacks(target, selected.id, 1);
				rules.appendLog(state, target.name + "净化了1层" + rules.getStatusDefinition(selected.id).name, "status");
				logBattlePhase("随机净化结束", { target: targetKey, status: selected.id });
				return 1;
			},
			repeatAttack: function (weapon, count) {
				// 触发该武器立即再攻击 count 次（origin=ultimate、不消耗奥义；用于"奥义发动时该武器攻击发动N次"）。
				for (var repeatIndex = 0; repeatIndex < count; repeatIndex++) {
					if (state.enemy.hp <= 0 || state.player.hp <= 0) break;
					logBattlePhase("武器重复攻击触发", getWeaponPhaseDetails(weapon,
						{ origin: "ultimate" }, { repeatIndex: repeatIndex + 1, repeatCount: count }));
					attackWeapon(weapon, { origin: "ultimate", ultimateMode: "costOnly", suppressLinkage: false });
				}
			},
			applyRandomDebuff: function (targetKey, weapon, effect, context, amount) {
				logBattlePhase("随机弱体开始", getWeaponPhaseDetails(weapon,
					{ origin: context && context.attackOrigin }, { target: targetKey, stacks: amount }));
				var target = rules.getSide(state, targetKey);
				if (!target) return null;
				var pool = Array.isArray(effect.pool) && effect.pool.length
					? effect.pool
					: rules.getAllDebuffIds();
				if (!pool.length) return null;
				var selected = gameRandom.pick(pool, {
					randomPurpose: "applyRandomDebuff",
					target: targetKey,
					weaponInstanceId: weapon && weapon.instanceId
				});
				if (!selected) return null;
				rules.applyStatus(state, targetKey, selected, Math.max(0, Math.floor(Number(amount) || 1)), context.sourceSide);
				logBattlePhase("随机弱体结束", getWeaponPhaseDetails(weapon,
					{ origin: context && context.attackOrigin }, { target: targetKey, status: selected, stacks: amount }));
				return selected;
			},
			applyRandomBuff: function (targetKey, weapon, effect, context, amount) {
				logBattlePhase("随机强化开始", getWeaponPhaseDetails(weapon,
					{ origin: context && context.attackOrigin }, { target: targetKey, stacks: amount }));
				// 随机 buff：随机 count 次，每次从候选池（缺省为全部 buff）随机选取 1 个施加 stacks 层；
				// 可重复（同一 buff 多次出现时层数累加）。
				var target = rules.getSide(state, targetKey);
				if (!target) return null;
				var pool = (Array.isArray(effect.pool) && effect.pool.length
					? effect.pool
					: rules.getAllBuffIds()).slice();
				if (!pool.length) return null;
				var count = Math.max(1, Math.floor(Number(effect.count) || 1));
				var stacks = Math.max(1, Math.floor(Number(amount) || 1));
				var selected = [];
				for (var buffIndex = 0; buffIndex < count; buffIndex++) {
					var picked = gameRandom.pick(pool, {
						randomPurpose: "applyRandomBuff",
						target: targetKey,
						weaponInstanceId: weapon && weapon.instanceId,
						randomIndex: buffIndex + 1,
						randomCount: count
					});
					if (!picked) continue;
					rules.applyStatus(state, targetKey, picked, stacks, context.sourceSide);
					selected.push(picked);
				}
				logBattlePhase("随机强化结束", getWeaponPhaseDetails(weapon,
					{ origin: context && context.attackOrigin }, { target: targetKey, statuses: selected.slice(), stacks: amount }));
				return selected;
			},
			rollChance: function (chance) {
				// 概率条件：掷骰判定，计入随机调用次数，录像可重放。
				chance = Math.max(0, Math.min(1, Number(chance) || 0));
				return gameRandom.next({ randomPurpose: "rollChance", chance: chance }) < chance;
			},
			consumeBuffs: function (count, sourceSide) {
				// 随机消耗自身强化效果 count 层：逐个从 stacks>0 的 buff 中随机选取扣减。
				var target = rules.getSide(state, sourceSide || "player");
				if (!target) return 0;
				var consumed = 0;
				for (var consumeIndex = 0; consumeIndex < count; consumeIndex++) {
					var available = target.buffs.filter(function (status) { return status.stacks > 0; });
					if (!available.length) break;
					var selected = gameRandom.pick(available, {
						randomPurpose: "consumeBuffs",
						target: sourceSide || "player",
						randomIndex: consumeIndex + 1,
						randomCount: count
					});
					selected.stacks = Math.max(0, (Number(selected.stacks) || 0) - 1);
					consumed++;
				}
				if (consumed > 0) rules.appendLog(state, "随机消耗" + consumed + "层强化效果", "status");
				return consumed;
			},
			addExtraAttack: function (sourceWeapon, effect, context) {
				// 使 directions/distance/filter 匹配的附近武器"发动次数+1"（每次攻击造成多次伤害、触发多次联动，奥义获取只判定一次）。
				var targets = rules.findNearbyWeapons(state, sourceWeapon, effect);
				targets.forEach(function (target) {
					target.extraAttackCount = Math.max(0, Math.floor(Number(target.extraAttackCount) || 0)) + 1;
				});
				if (targets.length) {
					rules.appendLog(state, targets.length + "件武器发动次数+1", "status");
				}
				return targets.length;
			},
			triggerWeaponAttack: function (weapon, effect, sourceWeapon) {
				if (effect && effect.type === "triggerLinkedWeaponAttack") {
					logBattlePhase("联动攻击触发", {
						sourceWeaponInstanceId: sourceWeapon && sourceWeapon.instanceId,
						targetWeaponInstanceId: weapon && weapon.instanceId
					});
					return attackWeapon(weapon, {
						origin: "linked",
						ultimateMode: "full",
						suppressLinkage: true,
						sourceWeaponId: sourceWeapon && sourceWeapon.instanceId
					});
				}
				logBattlePhase("额外攻击触发", {
					sourceWeaponInstanceId: sourceWeapon && sourceWeapon.instanceId,
					targetWeaponInstanceId: weapon && weapon.instanceId
				});
				return attackWeapon(weapon, {
					origin: "legacyExtra",
					ultimateMode: "costOnly",
					suppressLinkage: false
				});
			}
		};
	};

	var runHitEffects = function (weapon, damage, attackOptions) {
		var handlers = getHandlers();
		var context = {
			sourceSide: "player",
			hitWeapon: weapon,
			damage: damage,
			attackOrigin: attackOptions.origin,
			suppressLinkage: attackOptions.suppressLinkage === true
		};
		logBattlePhase("武器 afterHit 开始", getWeaponPhaseDetails(weapon, attackOptions, { damage: damage }));
		rules.runCombatRules(state, weapon, "afterHit", context, handlers);
		logBattlePhase("武器 afterHit 结束", getWeaponPhaseDetails(weapon, attackOptions, { damage: damage }));
		if (!context.suppressLinkage) {
			logBattlePhase("全武器 afterAllyHit 开始", getWeaponPhaseDetails(weapon, attackOptions, { damage: damage }));
			rules.runAllWeaponRules(state, "afterAllyHit", context, handlers);
			logBattlePhase("全武器 afterAllyHit 结束", getWeaponPhaseDetails(weapon, attackOptions, { damage: damage }));
		}
		// 立即触发的攻击不会继续普通联动，但仍计入联动武器的每 N 次命中计数。
		logBattlePhase("全武器 afterLinkedWeaponHit 开始", getWeaponPhaseDetails(weapon, attackOptions, { damage: damage }));
		rules.runAllWeaponRules(state, "afterLinkedWeaponHit", context, handlers);
		logBattlePhase("全武器 afterLinkedWeaponHit 结束", getWeaponPhaseDetails(weapon, attackOptions, { damage: damage }));
	};

	var normalizeAttackOptions = function (options) {
		if (options === true) options = { origin: "legacyExtra", ultimateMode: "costOnly" };
		options = options || {};
		return {
			origin: options.origin || "normal",
			ultimateMode: options.ultimateMode || "full",
			suppressLinkage: options.suppressLinkage === true,
			sourceWeaponId: options.sourceWeaponId || null
		};
	};

	var canPayWeaponUltimate = function (weapon, options) {
		options = normalizeAttackOptions(options);
		var change = rules.getUltimateGain(state.player, weapon.attributes.ultimateGain, state);
		if (change >= 0 || options.ultimateMode === "none") return true;
		return state.player.ultimate >= Math.abs(change);
	};

	var ultimateResolving = false;
	var resolveUltimate = function () {
		if (!state || ultimateResolving || state.ultimateDisabled) return;
		ultimateResolving = true;
		if (state.player.ultimate >= 100 && state.enemy.hp > 0 && state.player.hp > 0) {
			logBattlePhase("玩家奥义开始", { ultimateBefore: state.player.ultimate });
			state.player.ultimate = rules.fixed(state.player.ultimate - 100);
			rules.appendLog(state, "奥义发动：所有武器立即攻击", "ultimate");
			state.weapons.forEach(function (weapon) {
				if (state.enemy.hp <= 0 || state.player.hp <= 0) return;
				if (rules.getWeaponIntervalTicks(state, weapon) > 0
					&& rules.getWeaponStat(weapon, "maxAttack", state.tick) > 0) {
					logBattlePhase("玩家奥义武器入队", getWeaponPhaseDetails(weapon, { origin: "ultimate" }));
					attackWeapon(weapon, {
						origin: "ultimate",
						ultimateMode: "costOnly",
						suppressLinkage: false
					});
				}
			});
			logBattlePhase("全武器 afterUltimate 开始", { ultimateAfterCost: state.player.ultimate });
			rules.runAllWeaponRules(state, "afterUltimate", { sourceSide: "player" }, getHandlers());
			logBattlePhase("全武器 afterUltimate 结束", { ultimateAfterEffects: state.player.ultimate });
			// 一次奥义结算完成后丢弃全部溢出值及结算期间新增的奥义，禁止连续触发。
			state.player.ultimate = 0;
			logBattlePhase("玩家奥义结束", { ultimateAfter: state.player.ultimate });
		}
		ultimateResolving = false;
	};

	var attackWeapon = function (weapon, options) {
		if (!state || state.enemy.hp <= 0 || state.player.hp <= 0) return { attacked: false, hit: false };
		options = normalizeAttackOptions(options);
		logBattlePhase("武器攻击开始", getWeaponPhaseDetails(weapon, options, {
			cooldownTicks: weapon.cooldownTicks
		}));
		var ultimateChange = rules.getUltimateGain(state.player, weapon.attributes.ultimateGain, state);
		if (!canPayWeaponUltimate(weapon, options)) {
			logBattlePhase("武器攻击跳过", getWeaponPhaseDetails(weapon, options, {
				reason: "ultimate不足",
				ultimate: state.player.ultimate,
				ultimateCost: Math.abs(ultimateChange)
			}));
			return { attacked: false, hit: false };
		}
		if (ultimateChange < 0 && options.ultimateMode !== "none") {
			state.player.ultimate = rules.fixed(state.player.ultimate + ultimateChange);
			rules.appendLog(state, weapon.name + "消耗" + Math.abs(ultimateChange) + "点奥义", "ultimate");
		}
		weapon.lastAttackTick = state.tick;
		weapon.attackSequence = (weapon.attackSequence || 0) + 1;
		var attackContext = {
			sourceSide: "player",
			hitWeapon: weapon,
			attackOrigin: options.origin,
			suppressLinkage: options.suppressLinkage,
			extraAttackCountBonus: 0,
			minimumDamage: Math.max(0, rules.getWeaponStat(weapon, "minAttack", state.tick)
				+ rules.getStatusWeaponDamageBonus(state, weapon)
				+ rules.getSameNameDamageBonus(state, weapon)
				+ rules.getNearbyDamageBonus(state, weapon)),
			maximumDamage: Math.max(0, rules.getWeaponStat(weapon, "maxAttack", state.tick)
				+ rules.getStatusWeaponDamageBonus(state, weapon)
				+ rules.getSameNameDamageBonus(state, weapon)
				+ rules.getNearbyDamageBonus(state, weapon))
		};
		attackContext.maximumDamage = Math.max(attackContext.minimumDamage, attackContext.maximumDamage);
		logBattlePhase("全武器 beforeAllyAttack 开始", getWeaponPhaseDetails(weapon, options));
		rules.runAllWeaponRules(state, "beforeAllyAttack", attackContext, getHandlers());
		logBattlePhase("全武器 beforeAllyAttack 结束", getWeaponPhaseDetails(weapon, options, {
			extraAttackCountBonus: attackContext.extraAttackCountBonus
		}));
		logBattlePhase("武器 beforeAttack 开始", getWeaponPhaseDetails(weapon, options, {
			minimumDamage: attackContext.minimumDamage,
			maximumDamage: attackContext.maximumDamage
		}));
		rules.runCombatRules(state, weapon, "beforeAttack", attackContext, getHandlers());
		logBattlePhase("武器 beforeAttack 结束", getWeaponPhaseDetails(weapon, options, {
			minimumDamage: attackContext.minimumDamage,
			maximumDamage: attackContext.maximumDamage,
			hitRateBonus: Number(attackContext.hitRateBonus) || 0,
			guaranteeHit: attackContext.guaranteeHit === true
		}));
		var minimumDamage = attackContext.minimumDamage;
		var maximumDamage = attackContext.maximumDamage;
		var hitRate = Math.max(0, Math.min(1, rules.getEffectiveHitRate(state.player, weapon.attributes.hitRate)
			+ (Number(attackContext.hitRateBonus) || 0)));
		var isHit = attackContext.guaranteeHit === true || gameRandom.next({
			randomPurpose: "weaponHit",
			weaponInstanceId: weapon.instanceId,
			weaponName: weapon.name,
			attackOrigin: options.origin,
			hitRate: hitRate
		}) < hitRate;
		logBattlePhase("武器命中判定", getWeaponPhaseDetails(weapon, options, {
			hitRate: hitRate,
			hit: isHit
		}));
		weapon.runtimeCounters.attacks = (weapon.runtimeCounters.attacks || 0) + 1;

		if (isHit) {
			// 发动次数：1 + 固定属性修正 + 标记的额外发动次数（addExtraAttack）+ 状态/附近武器驱动的额外次数。
			// 每次发动造成一次伤害并触发战斗联动，奥义获取只判定一次（位于循环外）。
			var extraAttackCount = Math.max(0, Math.floor(Number(weapon.extraAttackCount) || 0))
				+ Math.max(0, Math.floor(rules.getWeaponStat(weapon, "extraAttackCount", state.tick)))
				+ Math.max(0, Math.floor(Number(attackContext.extraAttackCountBonus) || 0))
				+ rules.getStatusExtraAttackCount(state, weapon)
				+ rules.getNearbyExtraAttackCount(state, weapon)
				+ rules.getNearbyThresholdExtraAttackCount(state, weapon);
			for (var extraHitIndex = 0; extraHitIndex <= extraAttackCount; extraHitIndex++) {
				var rawDamage = gameRandom.int(minimumDamage, maximumDamage, {
					randomPurpose: "weaponDamage",
					weaponInstanceId: weapon.instanceId,
					weaponName: weapon.name,
					attackOrigin: options.origin,
					hitIndex: extraHitIndex + 1,
					hitCount: extraAttackCount + 1
				});
				var result = rules.applyDamage(state, "enemy", rawDamage, {
					silent: true,
					sourceWeapon: weapon,
					ignoreBlock: attackContext.ignoreBlock === true || weapon.ignoreBlockAlways === true
				});
				logBattlePhase("武器伤害结算", getWeaponPhaseDetails(weapon, options, {
					hitIndex: extraHitIndex + 1,
					hitCount: extraAttackCount + 1,
					rawDamage: rawDamage,
					blocked: result.blocked,
					damage: result.damage
				}));
				weapon.runtimeCounters.hits = (weapon.runtimeCounters.hits || 0) + 1;
				rules.appendLog(state, weapon.name + "命中，造成" + result.damage + "点伤害", "attack");
				runHitEffects(weapon, result.damage, options);
				if (result.damage > 0) {
					var damageContext = {
						sourceSide: "player",
						hitWeapon: weapon,
						damage: result.damage,
						attackOrigin: options.origin,
						suppressLinkage: options.suppressLinkage
					};
					if (options.suppressLinkage) {
						logBattlePhase("武器 afterDealDamage 开始", getWeaponPhaseDetails(weapon, options, { damage: result.damage }));
						rules.runCombatRules(state, weapon, "afterDealDamage", damageContext, getHandlers());
						logBattlePhase("武器 afterDealDamage 结束", getWeaponPhaseDetails(weapon, options, { damage: result.damage }));
					} else {
						logBattlePhase("全武器 afterDealDamage 开始", getWeaponPhaseDetails(weapon, options, { damage: result.damage }));
						rules.runAllWeaponRules(state, "afterDealDamage", damageContext, getHandlers());
						logBattlePhase("全武器 afterDealDamage 结束", getWeaponPhaseDetails(weapon, options, { damage: result.damage }));
					}
				}
			}
		} else {
			rules.appendLog(state, weapon.name + "未命中", "miss");
		}

		if (options.ultimateMode === "full" && ultimateChange > 0) {
			state.player.ultimate = rules.fixed(state.player.ultimate + ultimateChange);
			rules.appendLog(state, weapon.name + "获得" + ultimateChange + "点奥义", "ultimate");
		}
		if (options.ultimateMode === "full") {
			logBattlePhase("玩家奥义检查", getWeaponPhaseDetails(weapon, options, { ultimate: state.player.ultimate }));
			resolveUltimate();
		}
		// 攻击后（无论命中与否都触发）：用于"攻击时获得随机 buff"等 Miss 也生效的效果。
		logBattlePhase("武器 afterAttack 开始", getWeaponPhaseDetails(weapon, options, {
			hit: isHit,
			damage: isHit && result && result.damage ? result.damage : 0
		}));
		rules.runCombatRules(state, weapon, "afterAttack", {
			sourceSide: "player",
			hitWeapon: weapon,
			hit: isHit,
			damage: isHit && result && result.damage ? result.damage : 0,
			attackOrigin: options.origin,
			suppressLinkage: options.suppressLinkage
		}, getHandlers());
		logBattlePhase("武器 afterAttack 结束", getWeaponPhaseDetails(weapon, options, {
			hit: isHit,
			damage: isHit && result && result.damage ? result.damage : 0
		}));
		logBattlePhase("武器攻击结束", getWeaponPhaseDetails(weapon, options, {
			hit: isHit,
			damage: isHit && result && result.damage ? result.damage : 0
		}));
		return { attacked: true, hit: isHit };
	};

	var enemyUltimateResolving = false;
	/** 怪物奥义发动：奥义 ≥100 时立即发动 2 次攻击（奥义攻击不获取奥义，但正常触发 buff/debuff 与规则）。 */
	var resolveEnemyUltimate = function () {
		if (!state || enemyUltimateResolving || state.ultimateDisabled) return;
		enemyUltimateResolving = true;
		if (state.enemy.ultimate >= 100 && state.enemy.hp > 0 && state.player.hp > 0) {
			logBattlePhase("怪物奥义开始", { ultimateBefore: state.enemy.ultimate });
			state.enemy.ultimate = rules.fixed(state.enemy.ultimate - 100);
			rules.appendLog(state, state.enemy.name + "奥义发动：立即攻击 2 次", "ultimate");
			logBattlePhase("怪物奥义攻击入队", { attackIndex: 1, attackCount: 2 });
			attackEnemy({ origin: "ultimate", gainUltimate: false });
			logBattlePhase("怪物奥义攻击入队", { attackIndex: 2, attackCount: 2 });
			attackEnemy({ origin: "ultimate", gainUltimate: false });
			logBattlePhase("全武器 afterEnemyUltimate 开始", { ultimateAfterCost: state.enemy.ultimate });
			rules.runAllWeaponRules(state, "afterEnemyUltimate", { sourceSide: "enemy" }, getHandlers());
			logBattlePhase("全武器 afterEnemyUltimate 结束", { ultimateAfterEffects: state.enemy.ultimate });
			// 怪物奥义同样在本次结算结束后清空，不保留任何溢出值。
			state.enemy.ultimate = 0;
			logBattlePhase("怪物奥义结束", { ultimateAfter: state.enemy.ultimate });
		}
		enemyUltimateResolving = false;
	};

	var attackEnemy = function (options) {
		options = options || {};
		logBattlePhase("怪物攻击开始", {
			attackOrigin: options.origin || "normal",
			cooldownTicks: state.enemy.cooldownTicks
		});
		var hitRate = rules.getEffectiveHitRate(state.enemy, state.enemy.hitRate);
		var isHit = gameRandom.next({
			randomPurpose: "enemyHit",
			attackOrigin: options.origin || "normal",
			hitRate: hitRate
		}) < hitRate;
		logBattlePhase("怪物命中判定", {
			attackOrigin: options.origin || "normal",
			hitRate: hitRate,
			hit: isHit
		});
		if (!isHit) {
			rules.appendLog(state, state.enemy.name + "未命中", "miss");
			logBattlePhase("怪物攻击结束", { attackOrigin: options.origin || "normal", hit: false, damage: 0 });
			return;
		}
		state.shieldEffects = {};
		// 被攻击前：允许武器规则修改本次受到的伤害（如概率减伤）。
		var receiveContext = { sourceSide: "player", damage: state.enemy.atk, attackOrigin: options.origin || "normal" };
		logBattlePhase("全武器 beforeReceiveDamage 开始", {
			attackOrigin: options.origin || "normal",
			damage: receiveContext.damage
		});
		rules.runAllWeaponRules(state, "beforeReceiveDamage", receiveContext, getHandlers());
		logBattlePhase("全武器 beforeReceiveDamage 结束", {
			attackOrigin: options.origin || "normal",
			damage: receiveContext.damage
		});
		var result = rules.applyDamage(state, "player", Math.max(0, receiveContext.damage), { silent: true });
		logBattlePhase("怪物伤害结算", {
			attackOrigin: options.origin || "normal",
			rawDamage: receiveContext.damage,
			blocked: result.blocked,
			damage: result.damage
		});
		rules.appendLog(state, state.enemy.name + "攻击，造成" + result.damage + "点伤害", "attack");
		if (state.enemy.combatRules && state.enemy.combatRules.length) {
			logBattlePhase("怪物 afterHit 开始", { attackOrigin: options.origin || "normal", damage: result.damage });
			rules.runCombatRules(state, state.enemy, "afterHit", {
				sourceSide: "enemy",
				hitWeapon: state.enemy,
				damage: result.damage,
				attackOrigin: options.origin || "normal",
				suppressLinkage: true
			}, getHandlers());
			logBattlePhase("怪物 afterHit 结束", { attackOrigin: options.origin || "normal", damage: result.damage });
		}
		if (result.damage > 0) {
			logBattlePhase("全武器 afterTakeDamage 开始", { damage: result.damage });
			rules.runAllWeaponRules(state, "afterTakeDamage", {
				sourceSide: "player",
				damage: result.damage
			}, getHandlers());
			logBattlePhase("全武器 afterTakeDamage 结束", { damage: result.damage });
		}
		// 被攻击效果联动：本次被攻击周期内有武器的被攻击效果发动过（如盾牌），触发 afterShieldEffect。
		if (Object.keys(state.shieldEffects || {}).length) {
			logBattlePhase("全武器 afterShieldEffect 开始", {
				damage: result.damage,
				triggeredWeaponInstanceIds: Object.keys(state.shieldEffects || {})
			});
			rules.runAllWeaponRules(state, "afterShieldEffect", {
				sourceSide: "player",
				damage: result.damage
			}, getHandlers());
			logBattlePhase("全武器 afterShieldEffect 结束", {
				damage: result.damage,
				triggeredWeaponInstanceIds: Object.keys(state.shieldEffects || {})
			});
		}
		// 怪物奥义获取：普通攻击（gainUltimate 默认 true）且配置了 ultimateGain 词条时才获取；
		// getUltimateGain 读取怪物自身状态（高扬 +2/层、虚脱 -2/层），因此怪物的奥义获取同样受 debuff 影响。
		if (options.gainUltimate !== false && state.enemy.ultimateGain > 0) {
			var enemyUChange = rules.getUltimateGain(state.enemy, state.enemy.ultimateGain, state);
			if (enemyUChange > 0) {
				state.enemy.ultimate = rules.fixed((state.enemy.ultimate || 0) + enemyUChange);
				rules.appendLog(state, state.enemy.name + "获得" + enemyUChange + "点奥义", "ultimate");
			}
		}
		logBattlePhase("怪物奥义检查", {
			attackOrigin: options.origin || "normal",
			ultimate: state.enemy.ultimate
		});
		resolveEnemyUltimate();
		logBattlePhase("怪物攻击结束", {
			attackOrigin: options.origin || "normal",
			hit: true,
			damage: result.damage
		});
	};

	var buildResult = function (outcome, reason) {
		var initialHp = rules.toNumber(state.meta.initialPlayerHp, state.player.maxHp);
		return {
			outcome: outcome,
			reason: reason || null,
			tick: state.tick,
			rounds: rules.fixed(state.tick / 100),
			playerHp: rules.fixed(Math.max(0, state.player.hp)),
			enemyHp: rules.fixed(Math.max(0, state.enemy.hp)),
			// 净伤害允许为负：战后生命高于战前时，负值表示本场战斗净回复的生命。
			netDamage: rules.fixed(initialHp - state.player.hp),
			grossDamage: rules.fixed(state.player.damageTaken || 0),
			goldMultiplier: rules.fixed(Math.max(0, state.goldMultiplier || 1)),
			goldBonus: rules.fixed(Math.max(0, state.goldBonus || 0)),
			rngCallCount: state.rngCallCount,
			enemyId: state.enemy.id,
			x: state.meta.x,
			y: state.meta.y,
			floorId: state.meta.floorId
		};
	};

	var finish = function (outcome, reason) {
		if (!state || !state.active) return;
		state.active = false;
		logBattlePhase("全武器 battleEnd 开始", { outcome: outcome, reason: reason || null });
		rules.runAllWeaponRules(state, "battleEnd", {
			sourceSide: "player",
			outcome: outcome
		}, getHandlers());
		logBattlePhase("全武器 battleEnd 结束", { outcome: outcome, reason: reason || null });
		state.result = buildResult(outcome, reason);
		logBattlePhase("战斗结束", {
			outcome: outcome,
			reason: reason || null,
			netDamage: state.result.netDamage,
			grossDamage: state.result.grossDamage
		});
		fastForwardToken++;
		lastTimestamp = null;
		accumulatedMilliseconds = 0;
		notify();
		var callback = finishCallback;
		finishCallback = null;
		if (callback) {
			try { callback(rules.clone(state.result)); }
			catch (error) { console.error("背包乱斗结束回调失败", error); }
		}
	};

	var checkBattleEnd = function () {
		if (!state || !state.active) return true;
		if (state.enemy.hp <= 0) {
			finish("victory");
			return true;
		}
		if (state.player.hp <= 0) {
			finish("defeat");
			return true;
		}
		return false;
	};

	var stepOneTick = function () {
		if (!state || !state.active) return false;
		if (checkBattleEnd()) return false;
		state.tick++;
		state.round = Math.floor(state.tick / 100);
		state.weapons.forEach(function (weapon) {
			if (rules.getWeaponIntervalTicks(state, weapon) > 0) weapon.cooldownTicks++;
		});
		state.enemy.cooldownTicks++;

		if (state.tick % 100 === 0) {
			logBattlePhase("周期状态结算开始", {});
			rules.settlePeriodicStatuses(state, getHandlers());
			logBattlePhase("周期状态结算结束", {});
			if (checkBattleEnd()) return false;
			logBattlePhase("全武器 roundStart 开始", {});
			rules.runAllWeaponRules(state, "roundStart", { sourceSide: "player" }, getHandlers());
			logBattlePhase("全武器 roundStart 结束", {});
			if (checkBattleEnd()) return false;
		}

		var processed = {};
		var foundReady = true;
		while (foundReady && state.active) {
			foundReady = false;
			for (var weaponIndex = 0; weaponIndex < state.weapons.length; weaponIndex++) {
				var weapon = state.weapons[weaponIndex];
				if (processed[weapon.instanceId]) continue;
				var interval = rules.getWeaponIntervalTicks(state, weapon);
				if (interval <= 0 || weapon.cooldownTicks < interval) continue;
				if (!canPayWeaponUltimate(weapon, { origin: "normal", ultimateMode: "full" })) continue;
				logBattlePhase("武器正常攻击入队", getWeaponPhaseDetails(weapon, { origin: "normal" }, {
					cooldownTicks: weapon.cooldownTicks,
					intervalTicks: interval
				}));
				var attackResult = attackWeapon(weapon, {
					origin: "normal",
					ultimateMode: "full",
					suppressLinkage: false
				});
				if (!attackResult.attacked) continue;
				processed[weapon.instanceId] = true;
				foundReady = true;
				weapon.cooldownTicks = 0;
				if (checkBattleEnd()) return false;
			}
		}

		var enemyInterval = rules.getEnemyIntervalTicks(state);
		if (state.enemy.cooldownTicks >= enemyInterval) {
			logBattlePhase("怪物正常攻击入队", {
				cooldownTicks: state.enemy.cooldownTicks,
				intervalTicks: enemyInterval
			});
			state.enemy.cooldownTicks = 0;
			attackEnemy();
		}
		checkBattleEnd();
		return !!(state && state.active);
	};

	var onFrame = function (timestamp) {
		if (!state || !state.active || state.paused || state.fastForwarding) {
			lastTimestamp = timestamp;
			return;
		}
		if (lastTimestamp == null) {
			lastTimestamp = timestamp;
			return;
		}
		var elapsed = Math.max(0, Math.min(1000, timestamp - lastTimestamp));
		lastTimestamp = timestamp;
		accumulatedMilliseconds += elapsed * state.speed;
		var ticks = Math.min(1000, Math.floor(accumulatedMilliseconds / 10));
		if (ticks <= 0) return;
		accumulatedMilliseconds -= ticks * 10;
		for (var index = 0; index < ticks && state && state.active; index++) stepOneTick();
		notify();
	};

	var runFastForward = function (options) {
		options = options || {};
		if (!state || !state.active || state.fastForwarding) return false;
		state.fastForwarding = true;
		state.paused = false;
		var token = ++fastForwardToken;
		var chunkTicks = Math.max(100, Math.floor(options.chunkTicks || 5000));
		var tickLimit = Math.max(chunkTicks, Math.floor(options.tickLimit || 2000000));
		var processed = 0;
		var runChunk = function () {
			if (!state || !state.active || token !== fastForwardToken) return;
			var end = Math.min(tickLimit, processed + chunkTicks);
			while (processed < end && state.active) {
				stepOneTick();
				processed++;
			}
			notify();
			if (!state || !state.active || token !== fastForwardToken) return;
			if (processed >= tickLimit) {
				state.fastForwarding = false;
				rules.appendLog(state, "快速推进已达到安全上限", "warning");
				notify();
				return;
			}
			setTimeout(runChunk, 0);
		};
		setTimeout(runChunk, 0);
		return true;
	};

	var start = function (input, options) {
		options = options || {};
		if (state && state.active) return false;
		var savedPreference = getSavedPreference();
		state = rules.createBattleState(input);
		state.rngCallCount = 0;
		state.speed = normalizeSpeed(options.speed, savedPreference === instantSpeedValue ? 1 : savedPreference);
		state.paused = false;
		state.fastForwarding = false;
		finishCallback = options.onFinish || null;
		lastTimestamp = null;
		accumulatedMilliseconds = 0;
		ultimateResolving = false;
		logBattlePhase("战斗开始", {
			enemyId: state.enemy.id,
			enemyName: state.enemy.name,
			floorId: state.meta && state.meta.floorId,
			x: state.meta && state.meta.x,
			y: state.meta && state.meta.y,
			replaying: typeof core.isReplaying === "function" ? core.isReplaying() : false,
			weaponOrder: state.weapons.map(function (weapon) { return weapon.instanceId; }),
			initialRandomSequence: getBattleRandomSequence()
		});
		rules.appendLog(state, "战斗开始", "system");
		logBattlePhase("全武器 battleStart 开始", {});
		rules.runAllWeaponRules(state, "battleStart", { sourceSide: "player" }, getHandlers());
		logBattlePhase("全武器 battleStart 结束", {});
		notify();
		if (checkBattleEnd()) return true;
		if (options.fastForward || (options.speed == null && savedPreference === instantSpeedValue)) {
			runFastForward(options.fastForwardOptions);
		}
		return true;
	};

	var stop = function (reason) {
		if (!state || !state.active) return false;
		finish("stopped", reason || "cancelled");
		return true;
	};

	var setSpeed = function (speed) {
		if (!state || validSpeeds.indexOf(Number(speed)) < 0) return false;
		state.speed = Number(speed);
		saveSpeedPreference(state.speed);
		notify();
		return true;
	};

	/** 背包和战斗界面共用的速度偏好；允许尚未进入战斗时提前设置。 */
	var setPreferredSpeed = function (preference) {
		if (preference === instantSpeedValue) {
			saveSpeedPreference(instantSpeedValue);
			if (state && state.active) return state.fastForwarding || runFastForward();
			return true;
		}
		var speed = Number(preference);
		if (validSpeeds.indexOf(speed) < 0) return false;
		saveSpeedPreference(speed);
		if (!state || !state.active) return true;
		if (state.fastForwarding) {
			fastForwardToken++;
			state.fastForwarding = false;
		}
		state.speed = speed;
		lastTimestamp = null;
		notify();
		return true;
	};

	var pause = function () {
		if (!state || !state.active) return false;
		state.paused = true;
		notify();
		return true;
	};

	var resume = function () {
		if (!state || !state.active) return false;
		state.paused = false;
		lastTimestamp = null;
		notify();
		return true;
	};

	function getSnapshot() {
		if (!state) return null;
		var snapshot = rules.clone(state);
		snapshot.weapons.forEach(function (weapon, index) {
			var source = state.weapons[index];
			weapon.effectiveIntervalTicks = rules.getWeaponIntervalTicks(state, source);
			weapon.cooldownProgress = weapon.effectiveIntervalTicks > 0
				? rules.clamp(source.cooldownTicks / weapon.effectiveIntervalTicks, 0, 1)
				: 0;
		});
		snapshot.enemy.effectiveIntervalTicks = rules.getEnemyIntervalTicks(state);
		snapshot.enemy.cooldownProgress = rules.clamp(
			state.enemy.cooldownTicks / snapshot.enemy.effectiveIntervalTicks,
			0,
			1
		);
		return snapshot;
	}

	var subscribe = function (listener) {
		if (typeof listener !== "function") return function () {};
		listeners.push(listener);
		return function () {
			listeners = listeners.filter(function (candidate) { return candidate !== listener; });
		};
	};

	var destroy = function () {
		fastForwardToken++;
		finishCallback = null;
		state = null;
		listeners = [];
		core.unregisterAnimationFrame(frameName);
	};

	var abort = function () {
		fastForwardToken++;
		finishCallback = null;
		if (state) state.active = false;
		state = null;
		lastTimestamp = null;
		accumulatedMilliseconds = 0;
		notify();
	};

	core.registerAnimationFrame(frameName, true, onFrame);

	return {
		start: start,
		stop: stop,
		pause: pause,
		resume: resume,
		setSpeed: setSpeed,
		setPreferredSpeed: setPreferredSpeed,
		getPreferredSpeed: getSavedPreference,
		fastForward: runFastForward,
		stepTicks: function (ticks) {
			for (var index = 0; index < ticks && state && state.active; index++) stepOneTick();
			notify();
			return getSnapshot();
		},
		isActive: function () { return !!(state && state.active); },
		getSnapshot: getSnapshot,
		subscribe: subscribe,
		abort: abort,
		destroy: destroy,
		gameRandom: gameRandom
	};
};
