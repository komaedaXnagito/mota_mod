"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");

function createEditorHarness() {
	const writes = [];
	const items = {
		I420: {
			id: "I420",
			cls: "items",
			name: "水龙伞",
			backpackWeaponId: "I420"
		}
	};
	const definitions = {
		I420: {
			id: "waterDragonUmbrella",
			name: "水龙伞",
			shape: [[1], [1]],
			rarity: 5,
			minAttack: 8,
			maxAttack: 12,
			hitRate: 0.9,
			attackInterval: 1.8,
			ultimateGain: 10,
			weaponTypes: ["枪"]
		}
	};
	const clone = value => value == null ? value : JSON.parse(JSON.stringify(value));
	const editor = {
		useCompress: false,
		core: { items: { items }, clone },
		util: {
			guid() { return "test_guid"; },
			encode64(value) { return value; }
		},
		file: null
	};
	const context = {
		console,
		setTimeout,
		clearTimeout,
		editor,
		core: { clone },
		items_296f5d02_12fd_4166_a7c1_b5e830c9ee3a: items,
		weaponDefinitions_9f2e6f5b_4b2c_4f8c_9a3d_7e1b6c0d5a44: definitions,
		functions_d6ad677b_427a_4623_b50f_a445a3b0ef8a: {},
		events_c12a15a8_c380_4b28_8144_256cba95f760: {},
		plugins_bb40132b_638b_4a9f_b028_d3fe47acc8d1: {},
		isset(value) { return value !== null && value !== undefined; },
		checkCallback(callback) {
			if (typeof callback !== "function") throw new Error("缺少回调");
		},
		fs: {
			writeFile(file, data, encoding, callback) {
				writes.push({ file, data, encoding });
				callback(null);
			},
			readdir(directory, callback) { callback(null, []); }
		},
		document: {
			createElement() { return {}; },
			body: { appendChild() {} },
			getElementById() { return { checked: false }; }
		},
		window: { location: { href: "http://127.0.0.1/editor.html" } }
	};
	vm.createContext(context);
	vm.runInContext(fs.readFileSync(path.join(root, "_server/table/comment.js"), "utf8"), context);
	vm.runInContext(fs.readFileSync(path.join(root, "_server/editor_file.js"), "utf8"), context);
	context.editor_file_wrapper(editor);
	context.editor_file(editor, function () {});
	editor.file.comment = context.comment_c456ea59_6018_45ef_8bcc_211a24c627dc;
	return { context, editor, items, definitions, writes };
}

test("编辑器把唯一武器定义虚拟合并到物品属性表", () => {
	const harness = createEditorHarness();
	let response;
	harness.editor.file.editItem("I420", [], value => { response = value; });
	assert.equal(response[2], null);
	assert.equal(response[0].backpackWeaponId, "I420");
	assert.deepEqual(JSON.parse(JSON.stringify(response[0].weapon)), harness.definitions.I420);
	assert.equal("weapon" in harness.items.I420, false);
});

test("物品属性表只对关联物品显示完整武器编辑分组", () => {
	const harness = createEditorHarness();
	const itemSchema = harness.editor.file.comment._data.items._data;
	const weaponSchema = itemSchema.weapon;
	assert.equal(weaponSchema._leaf, false);
	assert.equal(weaponSchema._hide({ vobj: null }), true);
	assert.equal(weaponSchema._hide({ vobj: {} }), false);
	for (const key of [
		"shape", "rarity", "minAttack", "maxAttack", "hitRate",
		"attackInterval", "ultimateGain", "weaponTypes", "synergyRules", "combatRules"
	]) {
		assert.ok(weaponSchema._data[key], `缺少武器编辑字段：${key}`);
	}
	assert.equal(itemSchema.rare, undefined);
	assert.equal(itemSchema.weaponType, undefined);
});

test("编辑器武器字段只写回 project/weapons.js", () => {
	const harness = createEditorHarness();
	let response;
	harness.editor.file.editItem("I420", [
		["change", "['weapon']['minAttack']", 15]
	], value => { response = value; });
	assert.equal(response.length, 1);
	assert.equal(response[0], null);
	assert.equal(harness.definitions.I420.minAttack, 15);
	assert.equal(harness.writes.length, 1);
	assert.equal(harness.writes[0].file, "project/weapons.js");
	assert.match(harness.writes[0].data, /"minAttack": 15/);
	assert.equal("minAttack" in harness.items.I420, false);
	assert.equal("weapon" in harness.items.I420, false);
});

test("编辑器普通物品字段仍只写回 project/items.js", () => {
	const harness = createEditorHarness();
	harness.editor.file.editItem("I420", [
		["change", "['name']", "新水龙伞"]
	], function () {});
	assert.equal(harness.items.I420.name, "新水龙伞");
	assert.equal(harness.writes.length, 1);
	assert.equal(harness.writes[0].file, "project/items.js");
	assert.equal(harness.definitions.I420.name, "水龙伞");
});
