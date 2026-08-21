/** 商店与战斗使用的独立确定性随机数流。 */
var installGameRandomStreams_5f63c10e_25de_47de_99aa_4d0e300d7a3f = function (core) {
	"use strict";

	var nextRand = function (seed) {
		if (core.utils && typeof core.utils.__next_rand === "function") {
			return core.utils.__next_rand(seed);
		}
		seed = (seed % 127773) * 16807 - ~~(seed / 127773) * 2836;
		return seed + (seed < 0 ? 2147483647 : 0);
	};

	var getInitialSeed = function () {
		var seed = core.getFlag("__seed__", null);
		if (seed == null) seed = core.getFlag("__rand__", 0);
		seed = Math.floor(Number(seed));
		return isFinite(seed) ? seed : 0;
	};

	var recordBattleRandom = function (payload) {
		try {
			if (core.plugin && typeof core.plugin.recordBackpackBattleDebugLog === "function") {
				core.plugin.recordBackpackBattleDebugLog("battleRand获取", payload);
				return;
			}
			if (typeof console !== "undefined" && typeof console.log === "function") {
				console.log("[背包战斗调试][battleRand获取]", payload);
			}
		}
		catch (error) {
			if (typeof console !== "undefined" && typeof console.error === "function") {
				console.error("记录 battleRand 调试日志失败", error);
			}
		}
	};

	var createRandom = function (flagName) {
		return function (num, debugContext) {
			var seed = core.getFlag(flagName, null);
			if (seed == null || !isFinite(Number(seed))) seed = getInitialSeed();
			var sequenceBefore = Math.floor(Number(seed));
			seed = nextRand(sequenceBefore);
			core.setFlag(flagName, seed);
			var normalizedValue = seed / 2147483647;
			var result = num && num > 0 ? Math.floor(normalizedValue * num) : normalizedValue;
			if (flagName === "__randBattle__") {
				var context = debugContext && typeof debugContext === "object"
					? Object.assign({}, debugContext)
					: { source: debugContext || "core.randBattle" };
				context.argument = num == null ? null : Number(num);
				context.sequenceBefore = sequenceBefore;
				context.sequenceAfter = seed;
				context.normalizedValue = normalizedValue;
				context.result = result;
				recordBattleRandom(context);
			}
			return result;
		};
	};

	core.randShop = createRandom("__randShop__");
	core.randBattle = createRandom("__randBattle__");
};
