"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");

function loadImageCacheHarness() {
	let imageConstructCount = 0;
	let canvasConstructCount = 0;
	class FakeImage {
		constructor() {
			imageConstructCount++;
			this.decoding = "";
			this.onload = null;
			this.onerror = null;
			this._src = "";
		}
		set src(value) {
			this._src = value;
			if (this.onload) queueMicrotask(() => this.onload());
		}
		get src() { return this._src; }
	}

	const context = {
		console,
		Promise,
		Image: FakeImage,
		main: { version: "2.10.96" },
		document: {
			createElement() {
				canvasConstructCount++;
				return {
					getContext() { return { drawImage() {} }; },
					toDataURL() { return "data:image/png;base64,cached"; }
				};
			}
		}
	};
	vm.createContext(context);
	for (const file of ["project/weapons.js", "project/backpackUiCommon.js"]) {
		vm.runInContext(fs.readFileSync(path.join(root, file), "utf8"), context, { filename: file });
	}
	return {
		common: context.backpackUiCommon_2c986f67_7621_44eb_972d_24f1e2c6ce61,
		definitions: context.weaponDefinitions_9f2e6f5b_4b2c_4f8c_9a3d_7e1b6c0d5a44,
		getImageConstructCount: () => imageConstructCount,
		getCanvasConstructCount: () => canvasConstructCount
	};
}

function getWeaponImageNames(definitions) {
	return [...new Set(Object.values(definitions)
		.map(definition => String(definition.image || "").replace(/\\/g, "/"))
		.filter(Boolean)
		.map(source => source.replace(/^.*project\/images\//, "")))];
}

test("所有武器图只注册一次并复用引擎预加载缓存", async () => {
	const harness = loadImageCacheHarness();
	const names = getWeaponImageNames(harness.definitions);
	const engineImages = {};
	for (const name of names) {
		engineImages[name] = { src: `http://localhost/project/images/${name}?v=2.10.96` };
	}
	const core = {
		images: [],
		material: { images: { images: engineImages } }
	};

	assert.equal(harness.common.registerWeaponImages(core, harness.definitions), names.length);
	assert.equal(core.images.length, names.length);
	assert.equal(new Set(core.images).size, names.length);
	assert.equal(harness.common.registerWeaponImages(core, harness.definitions), 0);

	await harness.common.preloadWeaponImages(core, harness.definitions);
	const stats = harness.common.getWeaponImageCacheStats();
	assert.equal(stats.count, names.length);
	assert.equal(stats.loaded, names.length);
	assert.equal(harness.getImageConstructCount(), 0, "引擎已有图片时不应再次 new Image");

	for (const definition of Object.values(harness.definitions)) {
		if (!definition.image) continue;
		const name = definition.image.replace(/^.*project\/images\//, "");
		const element = {};
		harness.common.setWeaponImageSource(element, definition.image);
		assert.equal(element.src, engineImages[name].src);
		assert.equal(element.decoding, "async");
	}
	assert.equal(harness.getImageConstructCount(), 0, "重复渲染只能复用缓存，不应创建资源加载器");
});

test("未进入引擎列表的图片也只创建一个预加载实例", async () => {
	const harness = loadImageCacheHarness();
	const core = { images: [], material: { images: { images: {} } } };
	await harness.common.preloadWeaponImages(core, {});

	const first = {};
	const second = {};
	harness.common.setWeaponImageSource(first, "project/images/futureWeapon.png");
	harness.common.setWeaponImageSource(second, "project/images/futureWeapon.png");

	assert.equal(first.src, "project/images/futureWeapon.png?v=2.10.96");
	assert.equal(second.src, first.src);
	assert.equal(harness.getImageConstructCount(), 1);
});

test("背包和战斗背景复用模板带版本的预加载地址", () => {
	const harness = loadImageCacheHarness();
	const image = { src: "http://localhost/project/images/backpack_background.png?v=2.10.96" };
	const core = { material: { images: { images: { "backpack_background.png": image } } } };
	const backpack = { style: {} }, battle = { style: {} };
	for (const element of [backpack, battle]) {
		harness.common.setPreloadedBackground(element, "project/images/backpack_background.png", core);
		assert.equal(element.style.backgroundImage, `url("${image.src}")`);
	}
	assert.equal(harness.getImageConstructCount(), 0);
	assert.equal(harness.getCanvasConstructCount(), 0);
});

test("压缩包背景的稳定地址只生成一次，替换引擎图片后重新生成", () => {
	const harness = loadImageCacheHarness();
	const images = { "backpack_background.png": { src: "blob:expired", naturalWidth: 1280, naturalHeight: 720 } };
	const core = { material: { images: { images } } };
	for (let i = 0; i < 3; i++) {
		const element = { style: {} };
		harness.common.setPreloadedBackground(element, "project/images/backpack_background.png", core);
		assert.equal(element.style.backgroundImage, 'url("data:image/png;base64,cached")');
	}
	assert.equal(harness.getCanvasConstructCount(), 1, "反复打开两个界面应复用同一稳定地址");
	images["backpack_background.png"] = { src: "blob:replacement", width: 1280, height: 720 };
	const element = { style: {} };
	harness.common.setPreloadedBackground(element, "project/images/backpack_background.png", core);
	assert.equal(harness.getCanvasConstructCount(), 2, "图片重新预加载后应更新缓存");
	assert.equal(harness.getImageConstructCount(), 0, "不应通过原文件重新加载压缩包图片");
});

test("背景预加载缺失时不绕过模板另发图片请求", () => {
	const harness = loadImageCacheHarness();
	const core = { material: { images: { images: {} } } };
	const element = { style: {} };
	harness.common.setPreloadedBackground(element, "project/images/backpack_background.png", core);
	assert.equal(element.style.backgroundImage, "none");
	assert.equal(harness.getImageConstructCount(), 0);
});
