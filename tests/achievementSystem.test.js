"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");

function makeElement(tagName = "div") {
	const element = {
		tagName: String(tagName).toUpperCase(),
		children: [],
		dataset: {},
		attributes: {},
		listeners: {},
		style: { setProperty() {} },
		classList: { add() {}, remove() {} },
		appendChild(child) { child.parentNode = this; this.children.push(child); return child; },
		setAttribute(name, value) { this.attributes[name] = String(value); },
		addEventListener(type, listener) {
			(this.listeners[type] || (this.listeners[type] = [])).push(listener);
		},
		remove() {
			if (!this.parentNode) return;
			this.parentNode.children = this.parentNode.children.filter((child) => child !== this);
			this.parentNode = null;
		},
		focus() {}
	};
	return element;
}

function findElement(element, predicate) {
	if (predicate(element)) return element;
	for (const child of element.children || []) {
		const match = findElement(child, predicate);
		if (match) return match;
	}
	return null;
}

function readPngSize(file) {
	const data = fs.readFileSync(file);
	assert.equal(data.toString("ascii", 1, 4), "PNG", file);
	return { width: data.readUInt32BE(16), height: data.readUInt32BE(20) };
}

function createHarness() {
	const storage = {};
	const visited = {};
	const document = {
		head: makeElement(),
		body: makeElement(),
		documentElement: makeElement(),
		createElement(tagName) { return makeElement(tagName); },
		getElementById(id) {
			return findElement(this.head, (element) => element.id === id)
				|| findElement(this.body, (element) => element.id === id);
		},
		addEventListener() {},
		removeEventListener() {},
		dispatchEvent() {}
	};
	const core = {
		clone(value) { return JSON.parse(JSON.stringify(value)); },
		getLocalStorage(key, fallback) { return key in storage ? storage[key] : fallback; },
		setLocalStorage(key, value) { storage[key] = JSON.parse(JSON.stringify(value)); return true; },
		isReplaying() { return false; },
		hasFlag() { return false; },
		hasVisitedFloor(floorId) { return !!visited[floorId]; },
		musicStatus: { soundStatus: false },
		status: { floorId: "MT1", hero: { hp: 1000 }, event: {} },
		events: {
			startGame() {},
			afterBattle() {},
			afterChangeFloor(floorId) { visited[floorId] = true; }
		}
	};
	const context = {
		console,
		core,
		document,
		main: { mode: "play" },
		window: { requestAnimationFrame(callback) { callback(); } },
		CustomEvent: function CustomEvent() {},
		setTimeout() { return 0; },
		clearTimeout() {}
	};
	vm.createContext(context);
	vm.runInContext(
		fs.readFileSync(path.join(root, "project/achievementSystem.js"), "utf8"),
		context,
		{ filename: "project/achievementSystem.js" }
	);
	const plugin = {};
	context.installAchievementSystem_d38bb038_c4fa_43be_927c_168680046baa(core, plugin);
	return { api: plugin.achievementSystem, core, document };
}

test("成就难度仅包含青铜、白金、钻石", () => {
	const { api } = createHarness();
	const levels = Array.from(new Set(api.getDefinitions().map((entry) => entry.level))).sort();
	assert.deepEqual(levels, ["bronze", "diamond", "platinum"]);
	api.getDefinitions().forEach((entry) => {
		assert.match(entry.icon, /^project\/images\/achievements\/.+\.png$/, entry.id);
		assert.match(entry.largeIcon, /^project\/images\/achievements\/large\/.+\.png$/, entry.id);
		const largeFile = path.join(root, entry.largeIcon);
		assert.equal(fs.existsSync(largeFile), true, entry.largeIcon);
		const size = readPngSize(largeFile);
		assert.ok(size.width >= 1024 && size.height >= 1024, `${entry.id}: ${size.width}x${size.height}`);
	});
	const statistics = api.getStatistics();
	assert.equal(statistics.total, 16);
	assert.equal(statistics.levels.bronze.total, 8);
	assert.equal(statistics.levels.platinum.total, 5);
	assert.equal(statistics.levels.diamond.total, 3);
});

test("隐藏成就解锁前遮蔽条件和描述，解锁后恢复", () => {
	const { api, core } = createHarness();
	let entry = api.getEntries().find((item) => item.id === "barely_started");
	assert.equal(entry.unlock, "???");
	assert.equal(entry.description, null);
	core.status.hero.hp = 99;
	api.recordFloor("MT2", { firstVisit: true });
	entry = api.getEntries().find((item) => item.id === "barely_started");
	assert.equal(entry.unlocked, true);
	assert.equal(entry.unlock, "首次到达2楼时仅剩<100血");
	assert.equal(entry.description, "我去，这是什么牢塔吗？");
	assert.match(entry.unlockedDateText, /^于\d{4}年\d{2}月\d{2}日解锁$/);
});

test("点击成就图标可以打开并关闭大图", () => {
	const { api, document } = createHarness();
	assert.equal(api.open(), true);
	const iconButton = findElement(document.body, (element) =>
		String(element.className || "").includes("achievement-icon-button")
	);
	assert.ok(iconButton);
	assert.equal(iconButton.tagName, "BUTTON");
	assert.match(iconButton.attributes["aria-label"], /成就图标大图$/);
	assert.equal(findElement(document.body, (element) =>
		element.tagName === "IMG" && /\/achievements\/large\//.test(element.src || "")
	), null, "打开大图前不应加载高清图片");
	iconButton.listeners.click[0]({ stopPropagation() {} });

	const viewer = document.getElementById("achievement-icon-viewer");
	assert.ok(viewer);
	assert.equal(viewer.attributes.role, "dialog");
	const largeImage = findElement(viewer, (element) => element.tagName === "IMG");
	assert.ok(largeImage);
	assert.match(largeImage.src, /^project\/images\/achievements\/large\/.+\.png$/);

	const closeButton = findElement(viewer, (element) =>
		String(element.className || "") === "achievement-icon-viewer-close"
	);
	closeButton.listeners.click[0]({ stopPropagation() {} });
	assert.equal(document.getElementById("achievement-icon-viewer"), null);
});

test("背包战斗结果解锁回合、回血和真魔王成就且不重复累计", () => {
	const { api, core } = createHarness();
	const result = {
		outcome: "victory",
		rounds: 300,
		netDamage: -1,
		playerHp: 1,
		enemyId: "redKing",
		x: 6,
		y: 5,
		floorId: "MT50"
	};
	api.recordBattleResult(result);
	core.status.floorId = "MT50";
	core.events.afterBattle("redKing", 6, 5);
	[
		"battle_rounds_100",
		"battle_rounds_300",
		"battle_healing",
		"weak_demon_king",
		"one_hp_demon_king"
	].forEach((id) => assert.equal(api.isUnlocked(id), true, id));
	assert.equal(api.getProfile().stats.battles, 1);
});

test("32楼骑士队长战败与免费刷新100次按实际结果解锁", () => {
	const { api } = createHarness();
	api.recordBattleResult({
		outcome: "defeat",
		rounds: 2,
		netDamage: 100,
		playerHp: 0,
		enemyId: "yellowKnight",
		x: 6,
		y: 6,
		floorId: "MT32"
	});
	assert.equal(api.isUnlocked("boastful_knight_defeat"), true);
	assert.equal(api.isUnlocked("first_victory"), false);
	for (let index = 0; index < 99; index++) api.recordFreeShopRefresh();
	assert.equal(api.isUnlocked("junk_refresh_100"), false);
	assert.equal(api.recordFreeShopRefresh(), 100);
	assert.equal(api.isUnlocked("junk_refresh_100"), true);
});
