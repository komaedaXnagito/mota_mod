/**
 * 预计伤害主线程协调器：负责 Worker、任务去重、LRU 缓存和异步刷新。
 * 完整模拟只在 Worker 内执行；主线程不提供同步回退。
 */
var createBackpackBattleEstimateCoordinator_f43e0d5b_629e_457c_9540_b3f0d0541ffc = function (options) {
	"use strict";

	options = options || {};
	var cache = new Map();
	var pendingByRequestId = new Map();
	var worker = null;
	var requestSequence = 0;
	var layoutRevision = 1;
	var refreshScheduled = false;
	var maximumCacheSize = Math.max(16, Math.floor(options.maximumCacheSize || 256));

	var stableStringify = function (value) {
		if (value == null || typeof value !== "object") return JSON.stringify(value);
		if (Array.isArray(value)) return "[" + value.map(stableStringify).join(",") + "]";
		return "{" + Object.keys(value).sort().map(function (key) {
			return JSON.stringify(key) + ":" + stableStringify(value[key]);
		}).join(",") + "}";
	};

	var makeCacheKey = function (requestData) {
		return stableStringify({
			battleRuleVersion: requestData.battleRuleVersion,
			weaponConfigVersion: requestData.weaponConfigVersion,
			layoutRevision: layoutRevision,
			input: requestData.input
		});
	};

	var scheduleRefresh = function () {
		if (refreshScheduled) return;
		refreshScheduled = true;
		setTimeout(function () {
			refreshScheduled = false;
			if (typeof options.onRefresh === "function") options.onRefresh();
		}, 0);
	};

	var trimCache = function () {
		if (cache.size <= maximumCacheSize) return;
		var keys = Array.from(cache.keys());
		for (var index = 0; index < keys.length && cache.size > maximumCacheSize; index++) {
			var entry = cache.get(keys[index]);
			if (entry && entry.status !== "pending") cache.delete(keys[index]);
		}
	};

	var touch = function (key, entry) {
		cache.delete(key);
		cache.set(key, entry);
		trimCache();
	};

	var markWorkerFailure = function (message) {
		pendingByRequestId.forEach(function (pending) {
			var entry = cache.get(pending.cacheKey);
			if (entry && entry.status === "pending") {
				entry.status = "error";
				entry.error = message || "Worker 运行失败";
				touch(pending.cacheKey, entry);
			}
		});
		pendingByRequestId.clear();
		if (worker) worker.terminate();
		worker = null;
		scheduleRefresh();
	};

	var ensureWorker = function () {
		if (worker) return worker;
		if (typeof Worker !== "function") return null;
		try {
			worker = new Worker(options.workerUrl || "project/workers/backpackBattleEstimateWorker.js");
			worker.onmessage = function (event) {
				var message = event.data || {};
				var pending = pendingByRequestId.get(message.requestId);
				if (!pending) return;
				pendingByRequestId.delete(message.requestId);
				if (message.cacheKey !== pending.cacheKey
					|| message.layoutRevision !== layoutRevision
					|| message.battleRuleVersion !== pending.battleRuleVersion) return;
				var entry = cache.get(message.cacheKey);
				if (!entry || entry.requestId !== message.requestId || entry.status !== "pending") return;
				if (message.error) {
					entry.status = "error";
					entry.error = String(message.error);
				} else {
					entry.status = "ready";
					entry.result = message.result;
					entry.error = null;
				}
				touch(message.cacheKey, entry);
				scheduleRefresh();
			};
			worker.onerror = function (event) {
				markWorkerFailure(event && event.message ? event.message : "Worker 运行失败");
			};
			return worker;
		} catch (error) {
			worker = null;
			return null;
		}
	};

	var decorateReadyResult = function (result, currentHp) {
		var copy = JSON.parse(JSON.stringify(result));
		copy.canWin = !copy.roundsExceeded && copy.damage < currentHp;
		return copy;
	};

	var createRequestData = function (enemyId, x, y, floorId) {
		if (typeof options.createInput !== "function") throw new Error("未配置预计伤害输入生成器");
		var requestData = options.createInput(enemyId, x, y, floorId) || {};
		requestData.battleRuleVersion = requestData.battleRuleVersion || 1;
		requestData.weaponConfigVersion = requestData.weaponConfigVersion || 1;
		requestData.currentHp = Math.max(0, Number(requestData.currentHp) || 0);
		requestData.cacheKey = makeCacheKey(requestData);
		return requestData;
	};

	var getPublicEntry = function (entry, requestData) {
		if (!entry) return { status: "error", error: "预计任务不存在", cacheKey: requestData.cacheKey };
		var result = {
			status: entry.status,
			cacheKey: requestData.cacheKey,
			error: entry.error || null
		};
		if (entry.status === "ready") result.result = decorateReadyResult(entry.result, requestData.currentHp);
		return result;
	};

	var request = function (enemyId, x, y, floorId) {
		var requestData;
		try { requestData = createRequestData(enemyId, x, y, floorId); }
		catch (error) { return { status: "error", error: error.message || String(error), cacheKey: null }; }
		var existing = cache.get(requestData.cacheKey);
		if (existing) {
			touch(requestData.cacheKey, existing);
			return getPublicEntry(existing, requestData);
		}

		var activeWorker = ensureWorker();
		if (!activeWorker) {
			var failed = { status: "error", error: "浏览器无法创建预计伤害 Worker" };
			touch(requestData.cacheKey, failed);
			return getPublicEntry(failed, requestData);
		}

		var requestId = "estimate_" + (++requestSequence);
		var entry = {
			status: "pending",
			requestId: requestId,
			error: null,
			result: null
		};
		touch(requestData.cacheKey, entry);
		pendingByRequestId.set(requestId, {
			cacheKey: requestData.cacheKey,
			battleRuleVersion: requestData.battleRuleVersion
		});
		activeWorker.postMessage({
			requestId: requestId,
			cacheKey: requestData.cacheKey,
			layoutRevision: layoutRevision,
			battleRuleVersion: requestData.battleRuleVersion,
			inputSnapshot: requestData.input
		});
		return getPublicEntry(entry, requestData);
	};

	var peek = function (enemyId, x, y, floorId) {
		var requestData;
		try { requestData = createRequestData(enemyId, x, y, floorId); }
		catch (error) { return { status: "error", error: error.message || String(error), cacheKey: null }; }
		return getPublicEntry(cache.get(requestData.cacheKey), requestData);
	};

	var clear = function () {
		cache.clear();
		pendingByRequestId.clear();
		layoutRevision++;
	};

	var bumpLayoutRevision = function () {
		clear();
		scheduleRefresh();
		return layoutRevision;
	};

	var destroy = function () {
		clear();
		if (worker) worker.terminate();
		worker = null;
	};

	var restartWorker = function () {
		clear();
		if (worker) worker.terminate();
		worker = null;
		scheduleRefresh();
	};

	return {
		request: request,
		peek: peek,
		clear: clear,
		bumpLayoutRevision: bumpLayoutRevision,
		getLayoutRevision: function () { return layoutRevision; },
		getCacheSize: function () { return cache.size; },
		restartWorker: restartWorker,
		destroy: destroy,
		stableStringify: stableStringify
	};
};
