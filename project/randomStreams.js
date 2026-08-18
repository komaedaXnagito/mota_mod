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

	var createRandom = function (flagName) {
		return function (num) {
			var seed = core.getFlag(flagName, null);
			if (seed == null || !isFinite(Number(seed))) seed = getInitialSeed();
			seed = nextRand(Math.floor(Number(seed)));
			core.setFlag(flagName, seed);
			var value = seed / 2147483647;
			if (num && num > 0) return Math.floor(value * num);
			return value;
		};
	};

	core.randShop = createRandom("__randShop__");
	core.randBattle = createRandom("__randBattle__");
};
