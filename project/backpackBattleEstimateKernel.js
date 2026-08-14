/**
 * 预计伤害的纯确定性计算内核。
 *
 * 输入只包含战斗快照；武器伤害固定取上下限平均值，命中固定取数学期望，驱散固定选择最后一个 Buff。
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

	var makeHandlers = function (state, attackWeapon) {
		return {
			dispelBuff: function (targetKey) {
				rules.dispelLastBuff(state, targetKey);
			},
			cleanseOneDebuff: function (targetKey) {
				// 预计固定净化第一个有效 Debuff（按注册表 order 顺序），不使用随机数。
				rules.cleanseOneDebuff(state, targetKey);
			},
			repeatAttack: function (weapon, count) {
				// 预计：该武器立即再攻击 count 次（期望伤害按次数叠加）。
				for (var repeatIndex = 0; repeatIndex < count; repeatIndex++) {
					if (state.enemy.hp <= 0 || state.player.hp <= 0) break;
					attackWeapon(weapon, { origin: "ultimate", ultimateMode: "costOnly", suppressLinkage: false });
				}
			},
			applyRandomDebuff: function (targetKey, weapon, effect, context, amount) {
				// 预计伤害固定选取池中第一个 Debuff（按注册表 order 顺序），不使用随机数。
				var pool = Array.isArray(effect.pool) && effect.pool.length
					? effect.pool : rules.getAllDebuffIds();
				if (!pool.length) return null;
				rules.applyStatus(state, targetKey, pool[0],
					Math.max(0, Math.floor(Number(amount) || 1)), context.sourceSide);
				return pool[0];
			},
			applyRandomBuff: function (targetKey, weapon, effect, context, amount) {
				// 预计固定轮流取池中第 i 个（i 为随机次数序号），接近均匀期望，不使用随机数。
				var pool = (Array.isArray(effect.pool) && effect.pool.length
					? effect.pool : rules.getAllBuffIds()).slice();
				if (!pool.length) return null;
				var count = Math.max(1, Math.floor(Number(effect.count) || 1));
				var stacks = Math.max(1, Math.floor(Number(amount) || 1));
				var selected = [];
				for (var buffIndex = 0; buffIndex < count; buffIndex++) {
					var picked = pool[buffIndex % pool.length];
					rules.applyStatus(state, targetKey, picked, stacks, context.sourceSide);
					selected.push(picked);
				}
				return selected;
			},
			rollChance: function (chance) {
				// 预计伤害固定按概率条件通过处理，不使用随机数（与确定性策略一致）。
				return true;
			},
			consumeBuffs: function (count, sourceSide) {
				// 预计固定按 buffs 顺序扣减 count 层，不使用随机数。
				var target = rules.getSide(state, sourceSide || "player");
				if (!target) return 0;
				var consumed = 0;
				for (var consumeIndex = 0; consumeIndex < count && consumed < count; consumeIndex++) {
					var status = null;
					for (var buffIndex = 0; buffIndex < target.buffs.length; buffIndex++) {
						if (target.buffs[buffIndex].stacks > 0) { status = target.buffs[buffIndex]; break; }
					}
					if (!status) break;
					status.stacks = Math.max(0, (Number(status.stacks) || 0) - 1);
					consumed++;
				}
				return consumed;
			},
			addExtraAttack: function (sourceWeapon, effect, context) {
				// 预计固定给附近匹配武器发动次数+1，不使用随机数。
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

		var runHitEffects = function (weapon, attackOptions) {
			var context = {
				sourceSide: "player",
				hitWeapon: weapon,
				attackOrigin: attackOptions.origin,
				suppressLinkage: attackOptions.suppressLinkage === true
			};
			rules.runCombatRules(state, weapon, "afterHit", context, handlers);
			if (!context.suppressLinkage) rules.runAllWeaponRules(state, "afterAllyHit", context, handlers);
			rules.runAllWeaponRules(state, "afterLinkedWeaponHit", context, handlers);
		};

		var attackWeapon = function (weapon, options) {
			if (state.enemy.hp <= 0) return { attacked: false };
			options = normalizeAttackOptions(options);
			var ultimateChange = rules.getUltimateGain(state.player, weapon.attributes.ultimateGain, state);
			if (!canPayWeaponUltimate(weapon, options)) return { attacked: false };
			if (ultimateChange < 0 && options.ultimateMode !== "none") {
				state.player.ultimate = rules.fixed(state.player.ultimate + ultimateChange);
			}
			var hitRate = rules.getEffectiveHitRate(state.player, weapon.attributes.hitRate);
			var minimumDamage = Math.max(0, rules.getWeaponStat(weapon, "minAttack", state.tick)
				+ rules.getStatusWeaponDamageBonus(state, weapon)
				+ rules.getSameNameDamageBonus(state, weapon)
				+ rules.getNearbyDamageBonus(state, weapon));
			var maximumDamage = Math.max(minimumDamage, rules.getWeaponStat(weapon, "maxAttack", state.tick)
				+ rules.getStatusWeaponDamageBonus(state, weapon)
				+ rules.getSameNameDamageBonus(state, weapon)
				+ rules.getNearbyDamageBonus(state, weapon));
			var attackContext = {
				sourceSide: "player",
				attackOrigin: options.origin,
				suppressLinkage: options.suppressLinkage,
				minimumDamage: minimumDamage,
				maximumDamage: maximumDamage
			};
			rules.runCombatRules(state, weapon, "beforeAttack", attackContext, handlers);
			if (attackContext.guaranteeHit === true) hitRate = 1;
			// 状态驱动的命中率修正（如"狼皮效果中：命中率+0.5"）在 beforeAttack 后叠加并夹在 0~1。
			hitRate = Math.max(0, Math.min(1, hitRate + (Number(attackContext.hitRateBonus) || 0)));
			var averageDamage = rules.fixed((attackContext.minimumDamage + attackContext.maximumDamage) / 2);
			// 发动次数：1 + 标记的额外发动次数 + 状态驱动 + 附近武器数量驱动，期望伤害按发动次数乘算（奥义获取只判定一次，位于此处之后）。
			var extraAttackCount = Math.max(0, Math.floor(Number(weapon.extraAttackCount) || 0))
				+ rules.getStatusExtraAttackCount(state, weapon)
				+ rules.getNearbyExtraAttackCount(state, weapon)
				+ rules.getNearbyThresholdExtraAttackCount(state, weapon);
			var damageResult = rules.applyDamage(state, "enemy", averageDamage * hitRate * (1 + extraAttackCount), {
				silent: true,
				ignoreBlock: attackContext.ignoreBlock === true || weapon.ignoreBlockAlways === true
			});
			weapon.runtimeCounters.attacks = (weapon.runtimeCounters.attacks || 0) + 1;
			weapon.runtimeCounters.expectedHits = rules.fixed((weapon.runtimeCounters.expectedHits || 0) + hitRate * (1 + extraAttackCount));
			weapon.expectationAccumulator = rules.fixed((weapon.expectationAccumulator || 0) + hitRate * (1 + extraAttackCount));
			while (weapon.expectationAccumulator >= 1) {
				weapon.expectationAccumulator = rules.fixed(weapon.expectationAccumulator - 1);
				weapon.runtimeCounters.hits = (weapon.runtimeCounters.hits || 0) + 1;
				runHitEffects(weapon, options);
			}
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
				hit: true,
				damage: damageResult.damage,
				attackOrigin: options.origin,
				suppressLinkage: options.suppressLinkage
			}, handlers);
			return { attacked: true };
		};

		var resolveUltimate = function () {
			if (ultimateResolving) return;
			ultimateResolving = true;
			var guard = 0;
			while (state.player.ultimate >= 100 && state.enemy.hp > 0 && guard++ < 1000) {
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

		handlers = makeHandlers(state, attackWeapon);
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
				state.shieldEffects = {};
				var enemyHitRate = rules.getEffectiveHitRate(state.enemy, state.enemy.hitRate);
				var receiveContext = { sourceSide: "player", damage: state.enemy.atk * enemyHitRate, attackOrigin: "normal" };
				rules.runAllWeaponRules(state, "beforeReceiveDamage", receiveContext, handlers);
				var enemyDamage = rules.applyDamage(state, "player", Math.max(0, receiveContext.damage), { silent: true });
				if (state.enemy.combatRules && state.enemy.combatRules.length) {
					state.enemy.expectationAccumulator = rules.fixed((state.enemy.expectationAccumulator || 0) + enemyHitRate);
					while (state.enemy.expectationAccumulator >= 1) {
						state.enemy.expectationAccumulator = rules.fixed(state.enemy.expectationAccumulator - 1);
						rules.runCombatRules(state, state.enemy, "afterHit", {
							sourceSide: "enemy",
							hitWeapon: state.enemy,
							damage: enemyDamage.damage,
							attackOrigin: "normal",
							suppressLinkage: true
						}, handlers);
					}
				}
				if (enemyDamage.damage > 0) {
					rules.runAllWeaponRules(state, "afterTakeDamage", {
						sourceSide: "player",
						damage: enemyDamage.damage
					}, handlers);
				}
				if (Object.keys(state.shieldEffects || {}).length) {
					rules.runAllWeaponRules(state, "afterShieldEffect", {
						sourceSide: "player",
						damage: enemyDamage.damage
					}, handlers);
				}
				// 怪物奥义获取与发动（预计）：有奥义词条时每次攻击累计期望奥义，
				// 每满 100 发动一次，视为额外 2 次攻击期望伤害（奥义攻击不再累计奥义）。
				if (state.enemy.ultimateGain > 0) {
					var enemyUChange = rules.getUltimateGain(state.enemy, state.enemy.ultimateGain, state) * enemyHitRate;
					if (enemyUChange > 0) {
						state.enemy.ultimate = rules.fixed((state.enemy.ultimate || 0) + enemyUChange);
						while (state.enemy.ultimate >= 100) {
							state.enemy.ultimate = rules.fixed(state.enemy.ultimate - 100);
							var ultContext = { sourceSide: "player", damage: state.enemy.atk * enemyHitRate, attackOrigin: "ultimate" };
							rules.runAllWeaponRules(state, "beforeReceiveDamage", ultContext, handlers);
							var ultDamage = Math.max(0, ultContext.damage);
							rules.applyDamage(state, "player", ultDamage, { silent: true });
							rules.applyDamage(state, "player", ultDamage, { silent: true });
						}
					}
				}
			}

			if (state.tick === MAX_TICKS && state.enemy.hp > 0) {
				return { damage: null, rounds: null, ticks: MAX_TICKS + 1, roundsExceeded: true };
			}
		}

		return {
			damage: rules.fixed(Math.max(0, ESTIMATE_HP - state.player.hp)),
			rounds: rules.fixed(state.tick / 100),
			ticks: state.tick,
			roundsExceeded: false
		};
	};

	return {
		MAX_TICKS: MAX_TICKS,
		simulate: simulate
	};
})();
