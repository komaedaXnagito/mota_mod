"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");

function loadCraft() {
	const context = { console };
	vm.createContext(context);
	["project/weapons.js", "project/weaponRecipes.js", "project/backpackCraft.js"].forEach((file) => {
		vm.runInContext(fs.readFileSync(path.join(root, file), "utf8"), context, { filename: file });
	});
	return context;
}

function makeHarness(entries) {
	const context = loadCraft();
	const flags = {
		__backpack_state__: { version: 5, placed: [], inventory: entries || [], unlockedCells: [] }
	};
	const core = {
		getFlag(name) { return flags[name]; },
		setFlag(name, value) { flags[name] = value; }
	};
	const plugin = {};
	context.installBackpackCraft_9c4e7b2a_6f1d_4a8c_9e3b_5d7f2c1a8e64(core, plugin);
	return { context, flags, plugin };
}

function makeEntry(context, key, instanceId) {
	const definitions = context.weaponDefinitions_9f2e6f5b_4b2c_4f8c_9a3d_7e1b6c0d5a44;
	return {
		instanceId,
		weapon: JSON.parse(JSON.stringify(definitions[key])),
		rotation: 0
	};
}

test("合成图鉴只按实际代码中的可执行配方分组", () => {
	const { plugin, context } = makeHarness([]);
	const catalog = plugin.getCraftRecipeCatalog();
	assert.equal(catalog.length, 41);
	assert.equal(plugin.getCraftState().catalogCount, 41);
	assert.equal(Object.hasOwn(context.weaponRecipes_7f2e9c4a_3b5d_4f8a_9c1e_6d4b8a2f9c31, "catalogOnly"), false);
	assert.equal(catalog.some((item) => item.result === "雅雅的炒饭" || item.result === "红色帝王蟹"), false);
});

test("只有一把同名材料时不可合成，两把时可合成且排在最前", () => {
	const first = makeHarness([]);
	first.flags.__backpack_state__.inventory = [makeEntry(first.context, "I510", "s1")];
	assert.equal(first.plugin.getCraftRecipeCatalog().find((item) => item.id === "result:I414").craftable, false);

	first.flags.__backpack_state__.inventory.push(makeEntry(first.context, "I510", "s2"));
	const catalog = first.plugin.getCraftRecipeCatalog();
	assert.equal(catalog[0].id, "result:I414");
	assert.equal(catalog[0].craftable, true);
});

test("选择可合成图鉴项会把两把不同实例直接填入合成位", () => {
	const harness = makeHarness([]);
	harness.flags.__backpack_state__.inventory = [
		makeEntry(harness.context, "I510", "s1"),
		makeEntry(harness.context, "I510", "s2")
	];
	assert.equal(harness.plugin.fillCraftRecipe("result:I414"), true);
	assert.deepEqual(Array.from(harness.plugin.getCraftState().slots), ["七星剑", "七星剑"]);
});

test("已选择武器参与的可合成方案优先于其他可合成方案", () => {
	const harness = makeHarness([]);
	harness.flags.__backpack_state__.inventory = [
		makeEntry(harness.context, "I510", "s1"),
		makeEntry(harness.context, "I510", "s2"),
		makeEntry(harness.context, "I414", "s3"),
		makeEntry(harness.context, "I576", "s4")
	];
	assert.equal(harness.plugin.fillCraftRecipe("result:I428"), true);
	const catalog = harness.plugin.getCraftRecipeCatalog();
	assert.equal(catalog[0].id, "result:I428");
	assert.equal(catalog[0].selectedMatch, true);
	assert.equal(catalog[1].craftable, true);
});

test("Excel 中漏接的两条双材料配方已经进入可执行配方源", () => {
	const { context } = makeHarness([]);
	const recipes = context.weaponRecipes_7f2e9c4a_3b5d_4f8a_9c1e_6d4b8a2f9c31.recipes;
	assert.ok(recipes.some((item) => item.a === "I587" && item.b === "I523" && item.result === "I403"));
	assert.ok(recipes.some((item) => item.a === "I426" && item.b === "I576" && item.result === "I407"));
	assert.ok(recipes.some((item) => item.a === "I501" && item.b === "I525" && item.result === "I423"));
});

test("合成弹窗包含同高右侧图鉴，并仅给可合成卡片绑定填入动作", () => {
	const craftSource = fs.readFileSync(path.join(root, "project/backpackCraft.js"), "utf8");
	const cssSource = fs.readFileSync(path.join(root, "project/backpack.css"), "utf8");
	assert.match(craftSource, /dialog\.appendChild\(panel\);\s*dialog\.appendChild\(recipes\)/);
	assert.match(craftSource, /const card = document\.createElement\("div"\)/);
	assert.match(craftSource, /card\.setAttribute\("role", "button"\)/);
	assert.match(craftSource, /event\.key !== "Enter" && event\.key !== " "/);
	assert.doesNotMatch(craftSource, /card\.setAttribute\("aria-disabled", "true"\)/);
	assert.match(craftSource, /item\.craftable \? "" : "，" \+ item\.reason/);
	assert.match(craftSource, /fillRecipeSlots\(item\.recipe\)/);
	assert.doesNotMatch(craftSource, /catalogOnly|catalog-only/);
	assert.match(craftSource, /uiCommon\.bindTooltip\(element/);
	assert.match(craftSource, /uiCommon\.buildWeaponTooltip/);
	assert.match(craftSource, /uiCommon\.renderWeaponName\(element, definition, \{ label: label \}\)/);
	assert.match(craftSource, /uiCommon\.bindTooltip\(resultBox/);
	assert.match(craftSource, /attributesOnly: true/);
	assert.match(craftSource, /renderWeaponName\(name, weapon, \{ showHammer: false \}\)/);
	assert.match(craftSource, /appendCraftHammer\(rarity, weapon\)/);
	assert.match(cssSource, /\.backpack-craft-dialog\s*\{[^}]*grid-template-columns:[^}]*760px[^}]*360px/s);
	assert.match(cssSource, /\.backpack-craft-recipes\s*\{[^}]*height:\s*100%/s);
	assert.match(cssSource, /\.backpack-craft-recipe-card\.is-craftable\s*\{[^}]*border-color:\s*#79a856/s);
	assert.match(cssSource, /\.backpack-craft-recipe-card\.is-locked\s*\{[^}]*opacity:\s*\.46/s);
	assert.match(cssSource, /\.backpack-craft-recipe-weapon\.has-tooltip\s*\{[^}]*cursor:\s*help/s);
	assert.match(cssSource, /\.backpack-craft-result\.has-result:hover[\s\S]*?box-shadow:/);
});
