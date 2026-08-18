"use strict";

var versionSuffix = self.location.search || "";
importScripts(
	"../backpackBattleStatuses.js" + versionSuffix,
	"../backpackBattleRules.js" + versionSuffix,
	"../backpackBattleEstimateKernel.js" + versionSuffix
);

self.onmessage = function (event) {
	var message = event.data || {};
	var response = {
		requestId: message.requestId,
		cacheKey: message.cacheKey,
		layoutRevision: message.layoutRevision,
		battleRuleVersion: message.battleRuleVersion,
		randomSeed: message.randomSeed
	};
	try {
		var inputSnapshot = message.inputSnapshot || {};
		inputSnapshot.randomSeed = message.randomSeed;
		response.result = backpackBattleEstimateKernel_69e88a3f_71f9_4df3_82a6_c4695b166a71
			.simulate(inputSnapshot);
	} catch (error) {
		response.error = error && error.message ? error.message : String(error);
	}
	self.postMessage(response);
};
