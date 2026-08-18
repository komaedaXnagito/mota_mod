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
	var randBattle = function (num) {
		if (typeof core.randBattle === "function") return core.randBattle(num);
		return core.rand(num);
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

	var gameRandom = {
		next: function () {
			if (state) state.rngCallCount++;
			return randBattle();
		},
		int: function (minimum, maximum) {
			minimum = Math.ceil(Number(minimum) || 0);
			maximum = Math.floor(Number(maximum) || 0);
			if (minimum > maximum) {
				var temporary = minimum;
				minimum = maximum;
				maximum = temporary;
			}
			if (state) state.rngCallCount++;
			return minimum + randBattle(maximum - minimum + 1);
		},
		pick: function (list) {
			if (!Array.isArray(list) || !list.length) return null;
			return list[gameRandom.int(0, list.length - 1)];
		}
	};

	var getHandlers = function () {
		return {
			dispelBuff: function (targetKey) {
				var target = rules.getSide(state, targetKey);
				// 专属 buff（刻印/MP/狼皮/黑之魅力）不可被驱散。
				var available = target.buffs.filter(function (status) {
					return status.stacks > 0 && !rules.isExclusiveBuff(status.id);
				});
				if (!available.length) return null;
				var selected = gameRandom.pick(available);
				rules.removeStatusStacks(target, selected.id, 1);
				rules.appendLog(state, target.name + "的"
					+ rules.getStatusDefinition(selected.id).name + "被驱散1层", "status");
				return selected.id;
			},
			cleanseOneDebuff: function (targetKey) {
				// 净化 1 个弱体状态：随机选取 1 个 stacks>0 的 Debuff 移除 1 层。
				var target = rules.getSide(state, targetKey);
				if (!target) return 0;
				var available = target.debuffs.filter(function (debuff) { return debuff.stacks > 0; });
				if (!available.length) return 0;
				var selected = gameRandom.pick(available);
				rules.removeStatusStacks(target, selected.id, 1);
				rules.appendLog(state, target.name + "净化了1层" + rules.getStatusDefinition(selected.id).name, "status");
				return 1;
			},
			repeatAttack: function (weapon, count) {
				// 触发该武器立即再攻击 count 次（origin=ultimate、不消耗奥义；用于"奥义发动时该武器攻击发动N次"）。
				for (var repeatIndex = 0; repeatIndex < count; repeatIndex++) {
					if (state.enemy.hp <= 0 || state.player.hp <= 0) break;
					attackWeapon(weapon, { origin: "ultimate", ultimateMode: "costOnly", suppressLinkage: false });
				}
			},
			applyRandomDebuff: function (targetKey, weapon, effect, context, amount) {
				var target = rules.getSide(state, targetKey);
				if (!target) return null;
				var pool = Array.isArray(effect.pool) && effect.pool.length
					? effect.pool
					: rules.getAllDebuffIds();
				if (!pool.length) return null;
				var selected = gameRandom.pick(pool);
				if (!selected) return null;
				rules.applyStatus(state, targetKey, selected, Math.max(0, Math.floor(Number(amount) || 1)), context.sourceSide);
				return selected;
			},
			applyRandomBuff: function (targetKey, weapon, effect, context, amount) {
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
					var picked = gameRandom.pick(pool);
					if (!picked) continue;
					rules.applyStatus(state, targetKey, picked, stacks, context.sourceSide);
					selected.push(picked);
				}
				return selected;
			},
			rollChance: function (chance) {
				// 概率条件：掷骰判定，计入随机调用次数，录像可重放。
				return gameRandom.next() < Math.max(0, Math.min(1, Number(chance) || 0));
			},
			consumeBuffs: function (count, sourceSide) {
				// 随机消耗自身强化效果 count 层：逐个从 stacks>0 的 buff 中随机选取扣减。
				var target = rules.getSide(state, sourceSide || "player");
				if (!target) return 0;
				var consumed = 0;
				for (var consumeIndex = 0; consumeIndex < count; consumeIndex++) {
					var available = target.buffs.filter(function (status) { return status.stacks > 0; });
					if (!available.length) break;
					var selected = gameRandom.pick(available);
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

	var runHitEffects = function (weapon, damage, attackOptions) {
		var handlers = getHandlers();
		var context = {
			sourceSide: "player",
			hitWeapon: weapon,
			damage: damage,
			attackOrigin: attackOptions.origin,
			suppressLinkage: attackOptions.suppressLinkage === true
		};
		rules.runCombatRules(state, weapon, "afterHit", context, handlers);
		if (!context.suppressLinkage) rules.runAllWeaponRules(state, "afterAllyHit", context, handlers);
		// 立即触发的攻击不会继续普通联动，但仍计入联动武器的每 N 次命中计数。
		rules.runAllWeaponRules(state, "afterLinkedWeaponHit", context, handlers);
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
		var guard = 0;
		while (state.player.ultimate >= 100 && state.enemy.hp > 0 && state.player.hp > 0 && guard++ < 1000) {
			state.player.ultimate = rules.fixed(state.player.ultimate - 100);
			rules.appendLog(state, "奥义发动：所有武器立即攻击", "ultimate");
			state.weapons.forEach(function (weapon) {
				if (state.enemy.hp <= 0 || state.player.hp <= 0) return;
				if (rules.getWeaponIntervalTicks(state, weapon) > 0
					&& rules.getWeaponStat(weapon, "maxAttack", state.tick) > 0) {
					attackWeapon(weapon, {
						origin: "ultimate",
						ultimateMode: "costOnly",
						suppressLinkage: false
					});
				}
			});
			rules.runAllWeaponRules(state, "afterUltimate", { sourceSide: "player" }, getHandlers());
		}
		ultimateResolving = false;
	};

	var attackWeapon = function (weapon, options) {
		if (!state || state.enemy.hp <= 0 || state.player.hp <= 0) return { attacked: false, hit: false };
		options = normalizeAttackOptions(options);
		var ultimateChange = rules.getUltimateGain(state.player, weapon.attributes.ultimateGain, state);
		if (!canPayWeaponUltimate(weapon, options)) return { attacked: false, hit: false };
		if (ultimateChange < 0 && options.ultimateMode !== "none") {
			state.player.ultimate = rules.fixed(state.player.ultimate + ultimateChange);
			rules.appendLog(state, weapon.name + "消耗" + Math.abs(ultimateChange) + "点奥义", "ultimate");
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
		rules.runCombatRules(state, weapon, "beforeAttack", attackContext, getHandlers());
		var minimumDamage = attackContext.minimumDamage;
		var maximumDamage = attackContext.maximumDamage;
		var hitRate = Math.max(0, Math.min(1, rules.getEffectiveHitRate(state.player, weapon.attributes.hitRate)
			+ (Number(attackContext.hitRateBonus) || 0)));
		var isHit = attackContext.guaranteeHit === true || gameRandom.next() < hitRate;
		weapon.runtimeCounters.attacks = (weapon.runtimeCounters.attacks || 0) + 1;

		if (isHit) {
			// 发动次数：1 + 标记的额外发动次数（addExtraAttack）+ 状态驱动（statusExtraAttack）+ 附近武器数量驱动（nearbyExtraAttack）。
			// 每次发动造成一次伤害并触发战斗联动，奥义获取只判定一次（位于循环外）。
			var extraAttackCount = Math.max(0, Math.floor(Number(weapon.extraAttackCount) || 0))
				+ rules.getStatusExtraAttackCount(state, weapon)
				+ rules.getNearbyExtraAttackCount(state, weapon)
				+ rules.getNearbyThresholdExtraAttackCount(state, weapon);
			for (var extraHitIndex = 0; extraHitIndex <= extraAttackCount; extraHitIndex++) {
				var rawDamage = gameRandom.int(minimumDamage, maximumDamage);
				var result = rules.applyDamage(state, "enemy", rawDamage, {
					silent: true,
					ignoreBlock: attackContext.ignoreBlock === true || weapon.ignoreBlockAlways === true
				});
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
						rules.runCombatRules(state, weapon, "afterDealDamage", damageContext, getHandlers());
					} else rules.runAllWeaponRules(state, "afterDealDamage", damageContext, getHandlers());
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
			resolveUltimate();
		}
		// 攻击后（无论命中与否都触发）：用于"攻击时获得随机 buff"等 Miss 也生效的效果。
		rules.runCombatRules(state, weapon, "afterAttack", {
			sourceSide: "player",
			hitWeapon: weapon,
			hit: isHit,
			damage: isHit && result && result.damage ? result.damage : 0,
			attackOrigin: options.origin,
			suppressLinkage: options.suppressLinkage
		}, getHandlers());
		return { attacked: true, hit: isHit };
	};

	var enemyUltimateResolving = false;
	/** 怪物奥义发动：奥义 ≥100 时立即发动 2 次攻击（奥义攻击不获取奥义，但正常触发 buff/debuff 与规则）。 */
	var resolveEnemyUltimate = function () {
		if (!state || enemyUltimateResolving || state.ultimateDisabled) return;
		enemyUltimateResolving = true;
		var guard = 0;
		while (state.enemy.ultimate >= 100 && state.enemy.hp > 0 && state.player.hp > 0 && guard++ < 1000) {
			state.enemy.ultimate = rules.fixed(state.enemy.ultimate - 100);
			rules.appendLog(state, state.enemy.name + "奥义发动：立即攻击 2 次", "ultimate");
			attackEnemy({ origin: "ultimate", gainUltimate: false });
			attackEnemy({ origin: "ultimate", gainUltimate: false });
			rules.runAllWeaponRules(state, "afterEnemyUltimate", { sourceSide: "enemy" }, getHandlers());
		}
		enemyUltimateResolving = false;
	};

	var attackEnemy = function (options) {
		options = options || {};
		var hitRate = rules.getEffectiveHitRate(state.enemy, state.enemy.hitRate);
		var isHit = gameRandom.next() < hitRate;
		if (!isHit) {
			rules.appendLog(state, state.enemy.name + "未命中", "miss");
			return;
		}
		state.shieldEffects = {};
		// 被攻击前：允许武器规则修改本次受到的伤害（如概率减伤）。
		var receiveContext = { sourceSide: "player", damage: state.enemy.atk, attackOrigin: options.origin || "normal" };
		rules.runAllWeaponRules(state, "beforeReceiveDamage", receiveContext, getHandlers());
		var result = rules.applyDamage(state, "player", Math.max(0, receiveContext.damage), { silent: true });
		rules.appendLog(state, state.enemy.name + "攻击，造成" + result.damage + "点伤害", "attack");
		if (state.enemy.combatRules && state.enemy.combatRules.length) {
			rules.runCombatRules(state, state.enemy, "afterHit", {
				sourceSide: "enemy",
				hitWeapon: state.enemy,
				damage: result.damage,
				attackOrigin: options.origin || "normal",
				suppressLinkage: true
			}, getHandlers());
		}
		if (result.damage > 0) {
			rules.runAllWeaponRules(state, "afterTakeDamage", {
				sourceSide: "player",
				damage: result.damage
			}, getHandlers());
		}
		// 被攻击效果联动：本次被攻击周期内有武器的被攻击效果发动过（如盾牌），触发 afterShieldEffect。
		if (Object.keys(state.shieldEffects || {}).length) {
			rules.runAllWeaponRules(state, "afterShieldEffect", {
				sourceSide: "player",
				damage: result.damage
			}, getHandlers());
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
		resolveEnemyUltimate();
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
			netDamage: rules.fixed(Math.max(0, initialHp - state.player.hp)),
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
		rules.runAllWeaponRules(state, "battleEnd", {
			sourceSide: "player",
			outcome: outcome
		}, getHandlers());
		state.result = buildResult(outcome, reason);
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
			rules.settlePeriodicStatuses(state, getHandlers());
			if (checkBattleEnd()) return false;
			rules.runAllWeaponRules(state, "roundStart", { sourceSide: "player" }, getHandlers());
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
		rules.appendLog(state, "战斗开始", "system");
		rules.runAllWeaponRules(state, "battleStart", { sourceSide: "player" }, getHandlers());
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
