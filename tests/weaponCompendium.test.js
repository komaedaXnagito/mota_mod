"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");

function makeHarness(options) {
	options = options || {};
	const context = {
		console,
		setTimeout,
		clearTimeout,
		document: {
			getElementById() { return null; },
			head: { appendChild() {} },
			body: { appendChild() {} },
			createElement() { return {}; },
			addEventListener() {},
			removeEventListener() {}
		}
	};
	vm.createContext(context);
	for (const file of [
		"project/weapons.js",
		"project/backpackWeaponSynergy.js",
		"project/backpackUiCommon.js",
		"project/weaponCardRenderer.js",
		"project/weaponCompendium.js"
	]) {
		vm.runInContext(fs.readFileSync(path.join(root, file), "utf8"), context, { filename: file });
	}
	if (options.rewards) {
		context.weaponCompendiumConfig_67d72d42_4e7b_4ad9_9fc1_72d6b8e78f31.rewards = options.rewards;
	}

	const flags = {};
	const storage = {};
	const clone = value => value == null ? value : JSON.parse(JSON.stringify(value));
	const core = {
		clone,
		material: { items: { I372: { backpackWeaponId: "I372" } } },
		getFlag(name, defaultValue) {
			return flags[name] == null ? defaultValue : flags[name];
		},
		setFlag(name, value) { flags[name] = clone(value); },
		getLocalStorage(name, defaultValue) {
			return storage[name] == null ? defaultValue : clone(storage[name]);
		},
		setLocalStorage(name, value) { storage[name] = clone(value); return true; },
		isPlaying() { return true; },
		isReplaying() { return false; },
		drawTip() {}
	};
	const plugin = {
		addBackpackWeapon() { return "weapon-instance"; },
		addBackpackItem() { return "item-instance"; },
		removeBackpackWeapon(instanceId) {
			const state = flags.__backpack_state__ || { placed: [], inventory: [] };
			state.placed = (state.placed || []).filter(entry => String(entry.instanceId) !== String(instanceId));
			state.inventory = (state.inventory || []).filter(entry => String(entry.instanceId) !== String(instanceId));
			flags.__backpack_state__ = state;
			return true;
		},
		syncBackpackItems() { return 0; }
	};
	const api = context.installWeaponCompendium_1a6d635c_008d_4bb5_a44a_e62e80ffad37(core, plugin);
	return { context, core, plugin, api, flags, storage };
}

test("新局外档案默认没有任何已解锁武器，锁定信息完全脱敏", () => {
	const harness = makeHarness();
	const profile = harness.api.getProfile();
	const entries = harness.api.getEntries();
	assert.equal(profile.unlockedWeaponIds.length, 0);
	assert.equal(profile.clearedWeaponIds.length, 0);
	assert.ok(entries.length > 100);
	assert.ok(entries.every(entry => entry.unlocked === false));
	assert.ok(entries.every(entry => entry.cleared === false));
	assert.ok(entries.every(entry => entry.name === "???"));
	assert.ok(entries.every(entry => entry.description === "???"));
	assert.ok(entries.every(entry => entry.weaponTypes.length === 1 && entry.weaponTypes[0] === "???"));
});

test("共享武器卡片 lock 属性输出黑色轮廓样式和全量问号数据", () => {
	const harness = makeHarness();
	class FakeElement {
		constructor(tagName) {
			this.tagName = String(tagName || "").toUpperCase();
			this.children = [];
			this.dataset = {};
			this.style = {};
			this.attributes = {};
			this.className = "";
			this.textContent = "";
			this.innerHTML = "";
		}
		appendChild(child) { this.children.push(child); return child; }
		setAttribute(name, value) { this.attributes[name] = String(value); }
	}
	harness.context.document.createElement = tagName => new FakeElement(tagName);
	const definition = harness.context.weaponDefinitions_9f2e6f5b_4b2c_4f8c_9a3d_7e1b6c0d5a44.I372;
	const renderer = harness.context.installWeaponCardRenderer_5ca7b6bd_8f36_4e6a_aa12_f8468a8ccf1c(
		harness.core,
		{ weaponSystem: null }
	);
	const card = renderer.createCard(definition, { lock: true, showCraftHammer: false });
	const flatten = element => [element].concat(element.children.flatMap(flatten));
	const nodes = flatten(card);
	const visibleText = nodes.map(node => node.textContent).filter(Boolean);
	const image = nodes.find(node => node.tagName === "IMG");
	const meta = nodes.find(node => node.className === "weapon-card-meta");
	assert.match(card.className, /weapon-card is-locked/);
	assert.equal(card.dataset.locked, "true");
	assert.equal(card.attributes.lock, "");
	assert.equal(image.alt, "未解锁武器");
	assert.deepEqual(Array.from(meta.children, node => node.className), ["weapon-card-types", "weapon-card-rarity"]);
	assert.ok(visibleText.filter(text => text === "???").length >= 7);
	assert.equal(nodes.some(node => node.className === "weapon-card-synergy-cell"), false);
	const cssSource = fs.readFileSync(path.join(root, "project/backpack.css"), "utf8");
	assert.match(cssSource, /\.weapon-card\.is-locked \.weapon-card-preview-image-frame img\s*\{[^}]*filter:\s*brightness\(0\)/);
	assert.match(cssSource, /\.weapon-card-meta\s*\{[^}]*display:\s*flex[^}]*justify-content:\s*space-between/);
});

test("旧 Codex 命名产生的局外与单局数据会迁移到 Compendium", () => {
	const harness = makeHarness();
	harness.storage.weaponCodexProfileV1 = {
		unlockedWeaponIds: ["I372"],
		claimedRewardIds: [],
		values: {},
		stats: { victories: 1 }
	};
	harness.flags.__weapon_codex_run_obtained__ = ["I384"];
	assert.deepEqual(Array.from(harness.api.getProfile().unlockedWeaponIds), ["I372"]);
	assert.ok(harness.storage.weaponCompendiumProfileV1);
	assert.deepEqual(Array.from(harness.api.getRunObtainedWeaponIds()), ["I384"]);
});

test("游戏过程中获得武器立即永久解锁，出售后不会回锁也不会获得通关标记", () => {
	const harness = makeHarness();
	const definition = harness.context.weaponDefinitions_9f2e6f5b_4b2c_4f8c_9a3d_7e1b6c0d5a44.I372;
	assert.equal(harness.plugin.addBackpackWeapon(definition), "weapon-instance");
	assert.deepEqual(Array.from(harness.api.getRunObtainedWeaponIds()), ["I372"]);
	assert.deepEqual(Array.from(harness.api.getProfile().unlockedWeaponIds), ["I372"]);

	// 模拟武器已经卖出：永久解锁保留，但通关瞬间背包为空，因此不写通关标记。
	harness.flags.__backpack_state__ = {
		placed: [],
		inventory: [{ instanceId: "weapon-instance", weapon: JSON.parse(JSON.stringify(definition)) }]
	};
	harness.flags.__weapon_compendium_run_obtained__ = []; // 模拟接入图鉴前形成的旧存档实例。
	assert.equal(harness.plugin.removeBackpackWeapon("weapon-instance"), true);
	assert.equal(harness.flags.__backpack_state__.inventory.length, 0);
	assert.deepEqual(Array.from(harness.api.getRunObtainedWeaponIds()), ["I372"]);
	const report = harness.api.completeRun();
	assert.deepEqual(Array.from(report.clearedWeaponIds), []);
	assert.equal(harness.api.getProfile().unlockedWeaponIds.includes("I372"), true);
	assert.equal(harness.api.getProfile().clearedWeaponIds.includes("I372"), false);
	assert.equal(harness.api.completeRun().alreadyCommitted, true);
});

test("通关时只给当前背包中的武器添加永久通关标记", () => {
	const harness = makeHarness();
	const definitions = harness.context.weaponDefinitions_9f2e6f5b_4b2c_4f8c_9a3d_7e1b6c0d5a44;
	harness.plugin.addBackpackWeapon(definitions.I372);
	harness.plugin.addBackpackWeapon(definitions.I384);
	harness.flags.__backpack_state__ = {
		placed: [{ instanceId: "kept", weapon: JSON.parse(JSON.stringify(definitions.I372)) }],
		inventory: []
	};
	const report = harness.api.completeRun();
	assert.deepEqual(Array.from(report.clearedWeaponIds), ["I372"]);
	const profile = harness.api.getProfile();
	assert.deepEqual(Array.from(profile.unlockedWeaponIds), ["I372", "I384"]);
	assert.deepEqual(Array.from(profile.clearedWeaponIds), ["I372"]);
	const entries = harness.api.getEntries();
	assert.equal(entries.find(entry => entry.weaponId === "I372").cleared, true);
	assert.equal(entries.find(entry => entry.weaponId === "I384").cleared, false);
});

test("地图武器拾取入口也会记录本局获得历史", () => {
	const harness = makeHarness();
	assert.equal(harness.plugin.addBackpackItem("I372"), "item-instance");
	assert.deepEqual(Array.from(harness.api.getRunObtainedWeaponIds()), ["I372"]);
	assert.deepEqual(Array.from(harness.api.getProfile().unlockedWeaponIds), ["I372"]);
});

test("奖励条件与奖励内容都由数组配置，并且每项只领取一次", () => {
	const harness = makeHarness({
		rewards: [{
			id: "first_weapon",
			title: "初识兵器",
			condition: { type: "unlockedCount", operator: ">=", value: 1 },
			rewards: [{ type: "metaValue", key: "compendiumPoints", operator: "add", value: 3 }]
		}]
	});
	const first = harness.api.unlockWeapons(["I372"]);
	assert.deepEqual(Array.from(first.unlockedWeaponIds), ["I372"]);
	assert.deepEqual(Array.from(first.claimedRewards, item => item.id), ["first_weapon"]);
	assert.equal(harness.api.getProfile().values.compendiumPoints, 3);
	assert.deepEqual(Array.from(harness.api.evaluateRewards()), []);
	assert.equal(harness.api.getProfile().values.compendiumPoints, 3);
});

test("名称搜索只检索已解锁名称，类型筛选可作用于完整图鉴", () => {
	const harness = makeHarness();
	assert.equal(harness.api.getEntries({ search: "薛定谔" }).length, 0);
	harness.api.unlockWeapons(["I372"]);
	const searchResult = harness.api.getEntries({ search: "薛定谔" });
	assert.equal(searchResult.length, 1);
	assert.equal(searchResult[0].weaponId, "I372");
	assert.equal(searchResult[0].name, "薛定谔");
	const bladeEntries = harness.api.getEntries({ weaponType: "刀" });
	assert.ok(bladeEntries.some(entry => entry.weaponId === "I372"));
});

test("图鉴支持按类型或稀有度分组、组内排序和独立收集进度", () => {
	const harness = makeHarness();
	const definitions = harness.context.weaponDefinitions_9f2e6f5b_4b2c_4f8c_9a3d_7e1b6c0d5a44;
	harness.api.unlockWeapons(["I372", "I384"]);
	harness.flags.__backpack_state__ = {
		placed: [{ instanceId: "cleared-blade", weapon: JSON.parse(JSON.stringify(definitions.I372)) }],
		inventory: []
	};
	harness.api.completeRun();

	const typeGroups = harness.api.getGroupedEntries({ groupMode: "type", sortMode: "rarityDesc" });
	const bladeGroup = typeGroups.find(group => group.title === "刀");
	const axeGroup = typeGroups.find(group => group.title === "斧");
	assert.ok(bladeGroup && axeGroup);
	assert.equal(bladeGroup.unlockedCount, 1);
	assert.equal(bladeGroup.clearedCount, 1);
	assert.equal(axeGroup.unlockedCount, 1);
	assert.equal(axeGroup.clearedCount, 0);
	typeGroups.forEach(group => {
		const rarities = group.entries.map(entry => Number(
			harness.context.weaponDefinitions_9f2e6f5b_4b2c_4f8c_9a3d_7e1b6c0d5a44[entry.weaponId].rarity
		) || 0);
		for (let index = 1; index < rarities.length; index++) assert.ok(rarities[index - 1] >= rarities[index]);
	});

	const rarityGroups = harness.api.getGroupedEntries({ groupMode: "rarity" });
	assert.equal(rarityGroups[0].title, "5 星");
	const fourStarGroup = rarityGroups.find(group => group.title === "4 星");
	assert.ok(fourStarGroup);
	assert.equal(fourStarGroup.unlockedCount, 2);
	assert.equal(fourStarGroup.clearedCount, 1);
	assert.ok(fourStarGroup.totalCount >= 2);

	const filteredGroups = harness.api.getGroupedEntries({ groupMode: "type", weaponType: "刀" });
	assert.equal(filteredGroups.length, 1);
	assert.equal(filteredGroups[0].title, "刀");
	const searchedGroups = harness.api.getGroupedEntries({ groupMode: "type", search: "薛定谔" });
	const searchedBladeGroup = searchedGroups.find(group => group.title === "刀");
	assert.equal(searchedBladeGroup.entries.length, 1);
	assert.equal(searchedBladeGroup.totalCount, bladeGroup.totalCount);
	assert.equal(searchedBladeGroup.clearedCount, bladeGroup.clearedCount);
});

test("主加载表、插件安装器与 50 层战后事件均已接入图鉴", () => {
	const mainSource = fs.readFileSync(path.join(root, "main.js"), "utf8");
	const pluginSource = fs.readFileSync(path.join(root, "project/plugins.js"), "utf8");
	const floorSource = fs.readFileSync(path.join(root, "project/floors/MT50.js"), "utf8");
	const compendiumSource = fs.readFileSync(path.join(root, "project/weaponCompendium.js"), "utf8");
	assert.match(mainSource, /['"]weaponCompendium['"]/);
	assert.match(pluginSource, /installWeaponCompendium_1a6d635c_008d_4bb5_a44a_e62e80ffad37/);
	assert.match(floorSource, /weaponCompendium\.completeRun\(\)/);
	assert.match(compendiumSource, /weapon-compendium-group-grid\{min-width:0;display:grid;grid-template-columns:repeat\(auto-fill,minmax\(min\(150px,100%\),1fr\)\)/);
	assert.match(compendiumSource, /weapon-compendium-grid\{[^}]*overflow-x:hidden;overflow-y:auto/);
	assert.match(compendiumSource, /@media\(max-width:700px\)[\s\S]*?weapon-compendium-group-header\{flex-wrap:wrap\}[\s\S]*?weapon-compendium-group-progress\{white-space:normal\}/);
	assert.match(compendiumSource, /\["type", "按类型分组"\]/);
	assert.match(compendiumSource, /\["rarity", "按稀有度分组"\]/);
	assert.match(compendiumSource, /groupProgress\.innerHTML = "已收集 <b>" \+ group\.unlockedCount \+ "<\/b> \/ " \+ group\.totalCount[\s\S]*?"　已通关 <b>" \+ group\.clearedCount \+ "<\/b> \/ " \+ group\.totalCount/);
	assert.match(compendiumSource, /summary\.textContent = "已收集 " \+ profile\.unlockedWeaponIds\.length/);
	assert.match(compendiumSource, /"　已通关 " \+ profile\.clearedWeaponIds\.length \+ " \/ " \+ definitionKeys\.length/);
	assert.match(compendiumSource, /has-cleared-run/);
	const cssSource = fs.readFileSync(path.join(root, "project/backpack.css"), "utf8");
	assert.match(cssSource, /\.weapon-card\.has-cleared-run,[\s\S]*?box-shadow:[\s\S]*?rgba\(55, 211, 181, \.56\)/);
});
