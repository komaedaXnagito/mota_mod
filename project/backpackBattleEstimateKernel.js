/**
 * 预计伤害的种子确定性计算内核。
 *
 * 输入只包含战斗快照和当前 core.rand 种子；内核复制同一套 Park-Miller 随机流，
 * 按实际战斗的调用顺序计算命中、伤害、净化、驱散、随机 Buff/Debuff 与概率条件。
 * 随机种子只在本次模拟的局部变量中推进，不会回写游戏的 __rand__ flag。
 * 该文件可直接被 Web Worker 加载。
 */
var backpackBattleEstimateKernel_69e88a3f_71f9_4df3_82a6_c4695b166a71 = (function () {
	"use strict";

	var rules = null;
	var MAX_TICKS = 1000000;
	var ESTIMATE_HP = 1000000000000;
	var getRules = function () {
		if (!rules) rules = backpackBattleRules_36e4a689_0f48_476f_92a7_1c12b3903e87;
		return rules;
	};

	/** 完整复刻 libs/utils.js 的 __next_rand/core.rand，但只修改闭包内的 seed。 */
	var createSeededRandom = function (initialSeed, state) {
		var seed = Math.floor(Number(initialSeed));
		if (!isFinite(seed)) seed = 0;
		var advance = function () {
			seed = (seed % 127773) * 16807 - ~~(seed / 127773) * 2836;
			seed += seed < 0 ? 2147483647 : 0;
			if (state) state.rngCallCount = (state.rngCallCount || 0) + 1;
			return seed;
		};
		var next = function () {
			return advance() / 2147483647;
		};
		var int = function (minimum, maximum) {
			minimum = Math.ceil(Number(minimum) || 0);
			maximum = Math.floor(Number(maximum) || 0);
			if (minimum > maximum) {
				var temporary = minimum;
				minimum = maximum;
				maximum = temporary;
			}
			return minimum + Math.floor(next() * (maximum - minimum + 1));
		};
		return {
			next: next,
			int: int,
			pick: function (list) {
				if (!Array.isArray(list) || !list.length) return null;
				return list[int(0, list.length - 1)];
			},
			getSeed: function () { return seed; }
		};
	};

	var makeHandlers = function (state, attackWeapon, random) {
		return {
			dispelBuff: function (targetKey) {
				var target = rules.getSide(state, targetKey);
				if (!target) return null;
				var available = target.buffs.filter(function (status) {
					return status.stacks > 0 && !rules.isExclusiveBuff(status.id);
				});
				if (!available.length) return null;
				var selected = random.pick(available);
				rules.removeStatusStacks(target, selected.id, 1);
				rules.appendLog(state, target.name + "的"
					+ rules.getStatusDefinition(selected.id).name + "被驱散1层", "status");
				return selected.id;
			},
			cleanseOneDebuff: function (targetKey) {
				var target = rules.getSide(state, targetKey);
				if (!target) return 0;
				var available = target.debuffs.filter(function (debuff) { return debuff.stacks > 0; });
				if (!available.length) return 0;
				var selected = random.pick(available);
				rules.removeStatusStacks(target, selected.id, 1);
				rules.appendLog(state, target.name + "净化了1层"
					+ rules.getStatusDefinition(selected.id).name, "status");
				return 1;
			},
			repeatAttack: function (weapon, count) {
				for (var repeatIndex = 0; repeatIndex < count; repeatIndex++) {
					if (state.enemy.hp <= 0 || state.player.hp <= 0) break;
					attackWeapon(weapon, { origin: "ultimate", ultimateMode: "costOnly", suppressLinkage: false });
				}
			},
			applyRandomDebuff: function (targetKey, weapon, effect, context, amount) {
				var target = rules.getSide(state, targetKey);
				if (!target) return null;
				var pool = Array.isArray(effect.pool) && effect.pool.length
					? effect.pool : rules.getAllDebuffIds();
				if (!pool.length) return null;
				var selected = random.pick(pool);
				if (!selected) return null;
				rules.applyStatus(state, targetKey, selected,
					Math.max(0, Math.floor(Number(amount) || 1)), context.sourceSide);
				return selected;
			},
			applyRandomBuff: function (targetKey, weapon, effect, context, amount) {
				var target = rules.getSide(state, targetKey);
				if (!target) return null;
				var pool = (Array.isArray(effect.pool) && effect.pool.length
					? effect.pool : rules.getAllBuffIds()).slice();
				if (!pool.length) return null;
				var count = Math.max(1, Math.floor(Number(effect.count) || 1));
				var stacks = Math.max(1, Math.floor(Number(amount) || 1));
				var selected = [];
				for (var buffIndex = 0; buffIndex < count; buffIndex++) {
					var picked = random.pick(pool);
					if (!picked) continue;
					rules.applyStatus(state, targetKey, picked, stacks, context.sourceSide);
					selected.push(picked);
				}
				return selected;
			},
			rollChance: function (chance) {
				return random.next() < Math.max(0, Math.min(1, Number(chance) || 0));
			},
			consumeBuffs: function (count, sourceSide) {
				var target = rules.getSide(state, sourceSide || "player");
				if (!target) return 0;
				var consumed = 0;
				for (var consumeIndex = 0; consumeIndex < count; consumeIndex++) {
					var available = target.buffs.filter(function (status) { return status.stacks > 0; });
					if (!available.length) break;
					var selected = random.pick(available);
					selected.stacks = Math.max(0, (Number(selected.stacks) || 0) - 1);
					consumed++;
				}
				if (consumed > 0) rules.appendLog(state, "随机消耗" + consumed + "层强化效果", "status");
				return consumed;
			},
			addExtraAttack: function (sourceWeapon, effect, context) {
				var targets = rules.findNearbyWeapons(state, sourceWeapon, effect);
				targets.forEach(function (target) {
					target.extraAttackCount = Math.max(0, Math.floor(Number(target.extraAttackCount) || 0)) + 1;
				});
				return targets.length;
			},
			triggerWeaponAttack: function (weapon, effect, sourceWeapon) {
				if (effect && effect.type === "triggerLinkedWeaponAttack") {
					return attackWeapon(weapon, {
						origin: "linked",
						ultimateMode: "full",
						suppressLinkage: true,
						sourceWeaponId: sourceWeapon && sourceWeapon.instanceId
					});
				}
				return attackWeapon(weapon, {
					origin: "legacyExtra",
					ultimateMode: "costOnly",
					suppressLinkage: false
				});
			}
		};
	};

	var getAverageDamage = function (state, weapon) {
		var minimum = Math.max(0, rules.getWeaponStat(weapon, "minAttack", state.tick));
		var maximum = Math.max(minimum, rules.getWeaponStat(weapon, "maxAttack", state.tick));
		return rules.fixed((minimum + maximum) / 2);
	};

	var canWeaponEverDealDamage = function (state, weapon) {
		if (getAverageDamage(state, weapon) > 0) return true;
		return (weapon.combatRules || []).some(function (rule) {
			return (rule.effects || []).some(function (effect) {
				return effect.type === "dealDamage"
					|| (effect.type === "modifyAttackDamage" && Number(effect.value) > 0)
					|| effect.type === "triggerLinkedWeaponAttack"
					|| effect.type === "triggerWeaponAttack"
					|| (effect.type === "applyStatus" && effect.status === "burn");
			});
		});
	};

	var simulate = function (input) {
		getRules();
		var simulationInput = rules.clone(input || {});
		simulationInput.player = simulationInput.player || {};
		simulationInput.player.hp = ESTIMATE_HP;
		simulationInput.player.maxHp = ESTIMATE_HP;
		var state = rules.createBattleState(simulationInput);
		state.rngCallCount = 0;
		var random = createSeededRandom(simulationInput.randomSeed, state);
		var ultimateResolving = false;
		var handlers;
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

		var runHitEffects = function (weapon, damage, attackOptions) {
			var context = {
				sourceSide: "player",
				hitWeapon: weapon,
				damage: damage,
				attackOrigin: attackOptions.origin,
				suppressLinkage: attackOptions.suppressLinkage === true
			};
			rules.runCombatRules(state, weapon, "afterHit", context, handlers);
			if (!context.suppressLinkage) rules.runAllWeaponRules(state, "afterAllyHit", context, handlers);
			rules.runAllWeaponRules(state, "afterLinkedWeaponHit", context, handlers);
		};

		var attackWeapon = function (weapon, options) {
			if (state.enemy.hp <= 0 || state.player.hp <= 0) return { attacked: false, hit: false };
			options = normalizeAttackOptions(options);
			var ultimateChange = rules.getUltimateGain(state.player, weapon.attributes.ultimateGain, state);
			if (!canPayWeaponUltimate(weapon, options)) return { attacked: false, hit: false };
			if (ultimateChange < 0 && options.ultimateMode !== "none") {
				state.player.ultimate = rules.fixed(state.player.ultimate + ultimateChange);
			}
			weapon.lastAttackTick = state.tick;
			weapon.attackSequence = (weapon.attackSequence || 0) + 1;
			var attackContext = {
				sourceSide: "player",
				attackOrigin: options.origin,
				suppressLinkage: options.suppressLinkage,
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
			rules.runCombatRules(state, weapon, "beforeAttack", attackContext, handlers);
			var minimumDamage = attackContext.minimumDamage;
			var maximumDamage = attackContext.maximumDamage;
			var hitRate = Math.max(0, Math.min(1, rules.getEffectiveHitRate(state.player, weapon.attributes.hitRate)
				+ (Number(attackContext.hitRateBonus) || 0)));
			var isHit = attackContext.guaranteeHit === true || random.next() < hitRate;
			weapon.runtimeCounters.attacks = (weapon.runtimeCounters.attacks || 0) + 1;
			var damageResult = null;
			if (isHit) {
				var extraAttackCount = Math.max(0, Math.floor(Number(weapon.extraAttackCount) || 0))
					+ rules.getStatusExtraAttackCount(state, weapon)
					+ rules.getNearbyExtraAttackCount(state, weapon)
					+ rules.getNearbyThresholdExtraAttackCount(state, weapon);
				for (var extraHitIndex = 0; extraHitIndex <= extraAttackCount; extraHitIndex++) {
					var rawDamage = random.int(minimumDamage, maximumDamage);
					damageResult = rules.applyDamage(state, "enemy", rawDamage, {
						silent: true,
						ignoreBlock: attackContext.ignoreBlock === true || weapon.ignoreBlockAlways === true
					});
					weapon.runtimeCounters.hits = (weapon.runtimeCounters.hits || 0) + 1;
					runHitEffects(weapon, damageResult.damage, options);
					if (damageResult.damage > 0) {
						var damageContext = {
							sourceSide: "player",
							hitWeapon: weapon,
							damage: damageResult.damage,
							attackOrigin: options.origin,
							suppressLinkage: options.suppressLinkage
						};
						if (options.suppressLinkage) {
							rules.runCombatRules(state, weapon, "afterDealDamage", damageContext, handlers);
						} else rules.runAllWeaponRules(state, "afterDealDamage", damageContext, handlers);
					}
				}
			}
			if (options.ultimateMode === "full" && ultimateChange > 0) {
				state.player.ultimate = rules.fixed(state.player.ultimate + ultimateChange);
			}
			if (options.ultimateMode === "full") {
				resolveUltimate();
			}
			// 攻击后（无论命中与否都触发）。
			rules.runCombatRules(state, weapon, "afterAttack", {
				sourceSide: "player",
				hitWeapon: weapon,
				hit: isHit,
				damage: isHit && damageResult && damageResult.damage ? damageResult.damage : 0,
				attackOrigin: options.origin,
				suppressLinkage: options.suppressLinkage
			}, handlers);
			return { attacked: true, hit: isHit };
		};

		var resolveUltimate = function () {
			if (ultimateResolving || state.ultimateDisabled) return;
			ultimateResolving = true;
			var guard = 0;
			while (state.player.ultimate >= 100 && state.enemy.hp > 0 && state.player.hp > 0 && guard++ < 1000) {
				state.player.ultimate = rules.fixed(state.player.ultimate - 100);
				state.weapons.forEach(function (weapon) {
					if (state.enemy.hp > 0 && rules.getWeaponIntervalTicks(state, weapon) > 0
						&& rules.getWeaponStat(weapon, "maxAttack", state.tick) > 0) {
						attackWeapon(weapon, {
							origin: "ultimate",
							ultimateMode: "costOnly",
							suppressLinkage: false
						});
					}
				});
				rules.runAllWeaponRules(state, "afterUltimate", { sourceSide: "player" }, handlers);
			}
			ultimateResolving = false;
		};

		handlers = makeHandlers(state, attackWeapon, random);

		var enemyUltimateResolving = false;
		var attackEnemy;
		var resolveEnemyUltimate = function () {
			if (enemyUltimateResolving || state.ultimateDisabled) return;
			enemyUltimateResolving = true;
			var guard = 0;
			while (state.enemy.ultimate >= 100 && state.enemy.hp > 0 && state.player.hp > 0 && guard++ < 1000) {
				state.enemy.ultimate = rules.fixed(state.enemy.ultimate - 100);
				attackEnemy({ origin: "ultimate", gainUltimate: false });
				attackEnemy({ origin: "ultimate", gainUltimate: false });
				rules.runAllWeaponRules(state, "afterEnemyUltimate", { sourceSide: "enemy" }, handlers);
			}
			enemyUltimateResolving = false;
		};

		attackEnemy = function (options) {
			options = options || {};
			var hitRate = rules.getEffectiveHitRate(state.enemy, state.enemy.hitRate);
			var isHit = random.next() < hitRate;
			if (!isHit) return;
			state.shieldEffects = {};
			var receiveContext = {
				sourceSide: "player",
				damage: state.enemy.atk,
				attackOrigin: options.origin || "normal"
			};
			rules.runAllWeaponRules(state, "beforeReceiveDamage", receiveContext, handlers);
			var result = rules.applyDamage(state, "player", Math.max(0, receiveContext.damage), { silent: true });
			if (state.enemy.combatRules && state.enemy.combatRules.length) {
				rules.runCombatRules(state, state.enemy, "afterHit", {
					sourceSide: "enemy",
					hitWeapon: state.enemy,
					damage: result.damage,
					attackOrigin: options.origin || "normal",
					suppressLinkage: true
				}, handlers);
			}
			if (result.damage > 0) {
				rules.runAllWeaponRules(state, "afterTakeDamage", {
					sourceSide: "player",
					damage: result.damage
				}, handlers);
			}
			if (Object.keys(state.shieldEffects || {}).length) {
				rules.runAllWeaponRules(state, "afterShieldEffect", {
					sourceSide: "player",
					damage: result.damage
				}, handlers);
			}
			if (options.gainUltimate !== false && state.enemy.ultimateGain > 0) {
				var enemyUChange = rules.getUltimateGain(state.enemy, state.enemy.ultimateGain, state);
				if (enemyUChange > 0) {
					state.enemy.ultimate = rules.fixed((state.enemy.ultimate || 0) + enemyUChange);
				}
			}
			resolveEnemyUltimate();
		};

		rules.runAllWeaponRules(state, "battleStart", { sourceSide: "player" }, handlers);

		var hasPotentialDamage = state.weapons.some(function (weapon) {
			return rules.getWeaponIntervalTicks(state, weapon) > 0 && canWeaponEverDealDamage(state, weapon);
		}) || rules.getStatusStacks(state.enemy, "burn") > 0;
		if (!hasPotentialDamage) {
			return { damage: null, rounds: null, ticks: MAX_TICKS + 1, roundsExceeded: true };
		}

		var advanceCooldowns = function (delta) {
			state.weapons.forEach(function (weapon) {
				if (rules.getWeaponIntervalTicks(state, weapon) > 0) weapon.cooldownTicks += delta;
			});
			state.enemy.cooldownTicks += delta;
		};

		var getNextDelta = function () {
			var remaining = 100 - state.tick % 100;
			state.weapons.forEach(function (weapon) {
				var interval = rules.getWeaponIntervalTicks(state, weapon);
				if (interval <= 0) return;
				remaining = Math.min(remaining, Math.max(0, interval - weapon.cooldownTicks));
			});
			remaining = Math.min(remaining, Math.max(0,
				rules.getEnemyIntervalTicks(state) - state.enemy.cooldownTicks));
			return Math.max(1, remaining);
		};

		while (state.enemy.hp > 0) {
			var delta = getNextDelta();
			if (state.tick + delta > MAX_TICKS) {
				return { damage: null, rounds: null, ticks: MAX_TICKS + 1, roundsExceeded: true };
			}
			state.tick += delta;
			state.round = Math.floor(state.tick / 100);
			advanceCooldowns(delta);

			if (state.tick % 100 === 0) {
				rules.settlePeriodicStatuses(state, handlers);
				if (state.enemy.hp <= 0) break;
				rules.runAllWeaponRules(state, "roundStart", { sourceSide: "player" }, handlers);
			}

			var processed = {};
			var foundReady = true;
			while (foundReady && state.enemy.hp > 0) {
				foundReady = false;
				for (var weaponIndex = 0; weaponIndex < state.weapons.length; weaponIndex++) {
					var weapon = state.weapons[weaponIndex];
					if (processed[weapon.instanceId]) continue;
					var interval = rules.getWeaponIntervalTicks(state, weapon);
					if (interval <= 0 || weapon.cooldownTicks < interval) continue;
					if (!canPayWeaponUltimate(weapon, { origin: "normal", ultimateMode: "full" })) continue;
					var attackResult = attackWeapon(weapon, {
						origin: "normal",
						ultimateMode: "full",
						suppressLinkage: false
					});
					if (!attackResult.attacked) continue;
					processed[weapon.instanceId] = true;
					foundReady = true;
					weapon.cooldownTicks = 0;
					if (state.enemy.hp <= 0) break;
				}
			}

			if (state.enemy.hp <= 0) break;
			var enemyInterval = rules.getEnemyIntervalTicks(state);
			if (state.enemy.cooldownTicks >= enemyInterval) {
				state.enemy.cooldownTicks = 0;
				attackEnemy();
			}

			if (state.tick === MAX_TICKS && state.enemy.hp > 0) {
				return { damage: null, rounds: null, ticks: MAX_TICKS + 1, roundsExceeded: true };
			}
		}

		return {
			damage: rules.fixed(Math.max(0, ESTIMATE_HP - state.player.hp)),
			rounds: rules.fixed(state.tick / 100),
			ticks: state.tick,
			rngCallCount: state.rngCallCount,
			randomSeedEnd: random.getSeed(),
			roundsExceeded: false
		};
	};

	return {
		MAX_TICKS: MAX_TICKS,
		simulate: simulate
	};
})();
