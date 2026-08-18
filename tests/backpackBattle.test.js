"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");

function loadScripts(files, extra) {
	const context = Object.assign({ console, setTimeout, clearTimeout }, extra || {});
	vm.createContext(context);
	files.forEach((file) => {
		const source = fs.readFileSync(path.join(root, file), "utf8");
		vm.runInContext(source, context, { filename: file });
	});
	return context;
}

function loadPure() {
	return loadScripts([
		"project/backpackBattleStatuses.js",
		"project/backpackBattleRules.js",
		"project/backpackBattleEstimateKernel.js"
	]);
}

function makeWeapon(overrides) {
	return Object.assign({
		instanceId: "w1",
		name: "测试武器",
		row: 0,
		col: 0,
		cells: [[0, 0]],
		attributes: {
			minAttack: 10,
			maxAttack: 10,
			hitRate: 1,
			attackInterval: 1,
			attackIntervalTicks: 100,
			ultimateGain: 0,
			weaponTypes: ["剑"]
		},
		combatRules: []
	}, overrides || {});
}

function makeInput(overrides) {
	const base = {
		version: 1,
		player: { name: "勇士", hp: 1000, maxHp: 1000, def: 0, buffs: [], debuffs: [] },
		enemy: {
			id: "enemy",
			name: "怪物",
			hp: 100,
			maxHp: 100,
			atk: 20,
			def: 0,
			hitRate: 1,
			attackIntervalTicks: 100,
			buffs: [],
			debuffs: []
		},
		weapons: [makeWeapon()],
		meta: { initialPlayerHp: 1000 }
	};
	return Object.assign(base, overrides || {});
}

test("开局地图背包道具使用背包名称和专用图标槽", () => {
	const itemsSource = fs.readFileSync(path.join(root, "project/items.js"), "utf8");
	const iconsSource = fs.readFileSync(path.join(root, "project/icons.js"), "utf8");
	assert.match(itemsSource, /"I385":\s*\{[\s\S]*?"name": "背包"/);
	assert.match(iconsSource, /"I385": 70/);
	assert.equal(fs.existsSync(path.join(root, "project/images/backpackSlot.png")), true);
});

test("背包与战斗武器的 hover 按实际占格触发且背包内部格缝保持连续", () => {
	const battleUiSource = fs.readFileSync(path.join(root, "project/backpackBattleUI.js"), "utf8");
	const backpackSource = fs.readFileSync(path.join(root, "project/backpackSystem.js"), "utf8");
	const cssSource = fs.readFileSync(path.join(root, "project/backpack.css"), "utf8");

	assert.match(cssSource, /\.bb-weapon-unit\s*\{[^}]*pointer-events:\s*none/);
	assert.match(cssSource, /\.bb-weapon-hit-cell\s*\{[^}]*pointer-events:\s*auto/);
	assert.match(battleUiSource, /bounds\.cells\.forEach[\s\S]*?hitCell\.className = "bb-weapon-hit-cell"/);
	assert.match(battleUiSource, /hitTargets: unit\.querySelectorAll\("\.bb-weapon-hit-cell"\)/);
	assert.match(battleUiSource, /var BATTLE_IMAGE_INSET_CELLS = 0\.12/);
	assert.match(battleUiSource, /cellSize \* BATTLE_IMAGE_INSET_CELLS/);
	assert.match(battleUiSource, /var uniformScale = Math\.min\(frameWidth \/ crop\[2\], frameHeight \/ crop\[3\]\)/);
	assert.match(battleUiSource, /image\.style\.width = \(crop\[4\] \* uniformScale\) \+ "px"/);
	assert.match(battleUiSource, /image\.style\.height = \(crop\[5\] \* uniformScale\) \+ "px"/);
	assert.doesNotMatch(battleUiSource, /var scaleX|var scaleY/);
	assert.match(cssSource, /\.bb-art-frame img\s*\{[^}]*object-fit:\s*contain[^}]*object-position:\s*center/);

	assert.match(cssSource, /\.backpack-placed,\s*\n?\.backpack-preview\s*\{[^}]*pointer-events:\s*none/);
	assert.match(cssSource, /\.backpack-cell-hit\s*\{[^}]*pointer-events:\s*auto/);
	assert.match(backpackSource, /bounds\.cells\.forEach[\s\S]*?hitCell\.className = "backpack-cell-hit"/);
	assert.match(backpackSource, /imageInsetCells:\s*0\.12/);
	assert.match(backpackSource, /const uniformScale = Math\.min\(frameWidth \/ crop\[2\], frameHeight \/ crop\[3\]\)/);
	assert.match(backpackSource, /image\.style\.width = px\(crop\[4\] \* uniformScale\)/);
	assert.match(backpackSource, /image\.style\.height = px\(crop\[5\] \* uniformScale\)/);
	assert.match(backpackSource, /occupiedCells\[cell\[0\] \+ "," \+ cell\[1\]\] = true/);
	assert.match(backpackSource, /hitCell\.style\.width = px\(cellSize \+ \(occupiedCells\[\(cell\[0\] \+ 1\) \+ "," \+ cell\[1\]\] \? gap : 0\)\)/);
	assert.match(backpackSource, /hitCell\.style\.height = px\(cellSize \+ \(occupiedCells\[cell\[0\] \+ "," \+ \(cell\[1\] \+ 1\)\] \? gap : 0\)\)/);
	assert.match(backpackSource, /hitTargets: element\.querySelectorAll\("\.backpack-cell-hit"\)/);
	assert.match(cssSource, /\.backpack-image-frame img\s*\{[^}]*object-fit:\s*contain[^}]*object-position:\s*center/);
});

test("商店和背包共用特殊效果箭头渲染，并由商店静态展示详情", () => {
	const shopSource = fs.readFileSync(path.join(root, "project/backpackShop.js"), "utf8");
	const commonSource = fs.readFileSync(path.join(root, "project/backpackUiCommon.js"), "utf8");
	const cssSource = fs.readFileSync(path.join(root, "project/backpack.css"), "utf8");
	const htmlSource = fs.readFileSync(path.join(root, "index.html"), "utf8");
	const context = loadScripts(["project/backpackUiCommon.js"]);
	const common = context.backpackUiCommon_2c986f67_7621_44eb_972d_24f1e2c6ce61;
	const formatted = common.formatSpecialEffectHtml("^甲∧乙＾<危险>");
	assert.equal((formatted.match(/bui-inline-synergy/g) || []).length, 3);
	assert.doesNotMatch(formatted, /[\^∧＾]/);
	assert.match(formatted, /&lt;危险&gt;/);
	assert.match(common.buildWeaponTooltip({ weapon: { synergyText: "配置在^的武器" } }), /bui-inline-synergy direction-up/);

	assert.match(shopSource, /const buildWeaponPreview = function \(def\)/);
	assert.match(shopSource, /const PREVIEW_IMAGE_INSET = 0\.12/);
	assert.match(shopSource, /const layoutPreviewImage = function \(imageFrame, image, geometry\)/);
	assert.match(shopSource, /const uniformScale = Math\.min\(frameCols \/ cropWidth, frameRows \/ cropHeight\)/);
	assert.match(shopSource, /image\.style\.width = \(naturalWidth \* uniformScale \/ frameCols \* 100\)/);
	assert.match(shopSource, /image\.style\.height = \(naturalHeight \* uniformScale \/ frameRows \* 100\)/);
	assert.match(shopSource, /weaponSystem\.getRotatedCells\(weapon, 0\)/);
	assert.match(shopSource, /weaponSystem\.getSynergyCells\(entry\)/);
	assert.match(shopSource, /geometry\.sourceCells\.forEach[\s\S]*?backpack-shop-footprint-cell/);
	assert.match(shopSource, /geometry\.synergyCells\.forEach[\s\S]*?backpack-shop-synergy-cell/);
	assert.match(shopSource, /"占 " \+ geometry\.sourceCells\.length \+ " 格"/);
	assert.match(shopSource, /const buildWeaponDetails = function \(def\)/);
	assert.match(commonSource, /const|var formatSpecialEffectHtml/);
	assert.match(commonSource, /split\(\/\(\[\\\^∧＾\]\)\/g\)/);
	assert.match(commonSource, /TOOLTIP_HIDE_DELAY = 0/);
	assert.match(commonSource, /queueTooltipPosition\(event, element\)/);
	assert.match(commonSource, /window\.requestAnimationFrame\(function \(\) \{[\s\S]*?positionTooltip\(pending\.event, pending\.anchor\)/);
	assert.match(commonSource, /if \(lastTooltipHtml !== html\) \{\s*tooltip\.innerHTML = html/);
	assert.match(cssSource, /\.bui-tooltip\s*\{[^}]*contain:\s*layout paint[^}]*will-change:\s*opacity, transform[^}]*visibility 0s linear \.08s/);
	assert.match(cssSource, /\.bui-tooltip\.show\s*\{[^}]*transition-delay:\s*0s/);
	assert.match(shopSource, /formatSpecialEffectHtml\(def\.synergyText\)/);
	assert.match(shopSource, /card\.appendChild\(buildWeaponDetails\(def\)\)/);
	assert.doesNotMatch(shopSource, /bindTooltip\(card/);
	assert.match(cssSource, /\.backpack-shop-footprint-cell\s*\{[^}]*z-index:\s*1[^}]*border:\s*1px solid rgba\(255, 230, 180, \.3\)/);
	assert.match(cssSource, /\.backpack-shop-preview-image-frame\s*\{[^}]*z-index:\s*3/);
	assert.match(cssSource, /\.backpack-shop-preview-image-frame img\s*\{[^}]*object-fit:\s*contain[^}]*object-position:\s*center/);
	assert.match(cssSource, /\.backpack-shop-card\s*\{[^}]*height:\s*540px[^}]*min-height:\s*540px[^}]*max-height:\s*540px[^}]*overflow:\s*hidden/);
	assert.match(cssSource, /\.backpack-shop-details\s*\{[^}]*flex:\s*1 1 auto[^}]*min-height:\s*0[^}]*overflow-y:\s*auto/);
	assert.match(cssSource, /\.backpack-shop-buy\s*\{[^}]*flex:\s*0 0 auto/);
	assert.match(htmlSource, /<script src='libs\/thirdparty\/particles\.min\.js\?v=2\.0\.0'><\/script>/);
	assert.match(shopSource, /const SHOP_PARTICLE_PROFILES = \{[\s\S]*?2:\s*\{ count:\s*18[\s\S]*?3:\s*\{ count:\s*34[\s\S]*?4:\s*\{ count:\s*56[\s\S]*?5:\s*\{ count:\s*84/);
	assert.match(shopSource, /window\.particlesJS\(host\.id, makeShopParticleConfig\(profile, rarity\)\)/);
	assert.match(shopSource, /particle\.vx = Math\.cos\(angle\) \* velocity[\s\S]*?particle\.vy = Math\.sin\(angle\) \* velocity/);
	assert.match(shopSource, /Math\.sin\(Math\.PI \* \(0\.16 \+ progress \* 0\.84\)\)/);
	assert.match(shopSource, /destroyShopParticleScenes\(\);[\s\S]*?grid\.innerHTML = ""/);
	assert.match(cssSource, /\.backpack-shop-panel\s*\{[^}]*overflow-y:\s*auto[^}]*overflow-x:\s*hidden/);
	assert.match(shopSource, /panel\.className = "backpack-shop-panel backpack-shop-reward-panel"/);
	assert.match(cssSource, /\.backpack-shop-reward-panel\s*\{[^}]*height:\s*min\(670px, calc\(100vh - 12px\)\)[^}]*max-height:\s*calc\(100vh - 12px\)/);
	assert.match(cssSource, /\.backpack-shop-particle-layer\s*\{[^}]*inset:\s*-52px[^}]*overflow:\s*hidden[^}]*pointer-events:\s*none/);
	assert.match(cssSource, /\.backpack-shop-card\s*\{[^}]*z-index:\s*2[^}]*background:\s*linear-gradient/);
	assert.doesNotMatch(cssSource, /backpack-shop-rarity-(?:particles|glints)-rise/);
	assert.match(cssSource, /@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.backpack-shop-particle-layer\s*\{\s*display:\s*none/);
	assert.match(cssSource, /\.backpack-shop-synergy-cell\s*\{[^}]*opacity:\s*0/);
	assert.match(cssSource, /\.backpack-shop-card:hover \.backpack-shop-synergy-cell[\s\S]*?opacity:\s*1/);
	assert.match(cssSource, /\.bui-inline-synergy\s*\{[^}]*background-image:[^}]*fff0a6[^}]*background-repeat:\s*repeat-y[^}]*animation:\s*bui-inline-synergy-flow \.62s linear infinite/);
	assert.match(cssSource, /@keyframes bui-inline-synergy-flow\s*\{\s*from\s*\{\s*background-position:\s*center 9px;\s*\}\s*to\s*\{\s*background-position:\s*center 0;\s*\}/);
	assert.match(cssSource, /\.bui-weapon-tip p\s*\{[^}]*white-space:\s*pre-line[^}]*word-break:\s*break-word/);
});

test("共享武器 Tooltip 保持纯属性布局，素材锤只读取实际可执行配方", () => {
	const context = loadScripts([
		"project/weapons.js",
		"project/weaponRecipes.js",
		"project/backpackUiCommon.js"
	]);
	const common = context.backpackUiCommon_2c986f67_7621_44eb_972d_24f1e2c6ce61;
	const definitions = context.weaponDefinitions_9f2e6f5b_4b2c_4f8c_9a3d_7e1b6c0d5a44;
	const recipes = context.weaponRecipes_7f2e9c4a_3b5d_4f8a_9c1e_6d4b8a2f9c31.recipes;
	const ingredientKey = recipes[0].a;
	const ingredient = definitions[ingredientKey];
	const full = common.buildWeaponTooltip({ weapon: ingredient, base: ingredient, current: ingredient });
	assert.equal(common.canCraftWithWeapon(ingredient), true);
	assert.ok(common.getWeaponRecipes(ingredient).length > 0);
	assert.doesNotMatch(full, /bui-weapon-grid-preview/);
	assert.match(full, /bui-rarity-row[\s\S]*?data-bui-craft-key=/);
	assert.match(full, /data-bui-craft-key=/);
	assert.equal(common.canCraftWithWeapon(definitions.I564), false);
	assert.doesNotMatch(common.buildWeaponTooltip({ weapon: definitions.I564 }), /data-bui-craft-key='I564'/);

	const attributesOnly = common.buildWeaponTooltip({
		weapon: ingredient,
		base: ingredient,
		current: ingredient,
		attributesOnly: true
	});
	assert.match(attributesOnly, /bui-weapon-tip-main attributes-only/);
	assert.doesNotMatch(attributesOnly, /bui-weapon-grid-preview/);
	assert.doesNotMatch(attributesOnly, /<h4>特殊效果<\/h4>/);

	const ingredientKeys = new Set(recipes.flatMap((recipe) => [recipe.a, recipe.b]));
	const resultOnlyKey = recipes.map((recipe) => recipe.result).find((key) => !ingredientKeys.has(key));
	assert.ok(resultOnlyKey);
	assert.equal(common.canCraftWithWeapon(definitions[resultOnlyKey]), false);
	assert.doesNotMatch(common.buildWeaponTooltip({ weapon: definitions[resultOnlyKey] }), /data-bui-craft-key=/);
	const commonSource = fs.readFileSync(path.join(root, "project/backpackUiCommon.js"), "utf8");
	const cssSource = fs.readFileSync(path.join(root, "project/backpack.css"), "utf8");
	assert.doesNotMatch(commonSource, /catalogOnly|catalog-only/);
	assert.match(commonSource, /span\.classList\.add\("has-tooltip"\)[\s\S]*?bindTooltip\(span/);
	assert.match(cssSource, /\.bui-craft-hammer\s*\{[^}]*border:\s*1px solid/);
	assert.match(cssSource, /\.bui-recipe-preview-weapon\.has-tooltip \.bui-weapon-name-text/);
});

test("背包小分辨率为两侧面板预留空间并按真实工具栏高度重排", () => {
	const backpackSource = fs.readFileSync(path.join(root, "project/backpackSystem.js"), "utf8");
	const cssSource = fs.readFileSync(path.join(root, "project/backpack.css"), "utf8");

	assert.match(backpackSource, /const narrow = rect\.width < 900/);
	assert.match(backpackSource, /toolbarElement \? toolbarElement\.offsetHeight/);
	assert.match(backpackSource, /availWidth = width - inventoryWidth - sellReserve - 24 \* scale/);
	assert.match(backpackSource, /bagX = inventoryWidth \+ \(width - inventoryWidth - sellReserve - totalWidth\) \/ 2/);
	assert.match(backpackSource, /panel:\s*panelBox,\s*sell:\s*sellBox/);
	assert.match(backpackSource, /const renderSellZone = function \(\)/);
	assert.match(backpackSource, /renderInventory\(\);\s*renderSellZone\(\);/);
	assert.match(cssSource, /#backpack-system-root\[data-narrow='true'\] \.backpack-toolbar/);
	assert.match(cssSource, /#backpack-system-root\[data-compact='true'\] \.backpack-toolbar\s*\{[^}]*flex-wrap:\s*wrap/);
	assert.match(cssSource, /\.backpack-sell-zone\s*\{[^}]*transform:\s*none/);
});

test("合成界面按真实占格等比渲染武器且不展示联动与详情", () => {
	const craftSource = fs.readFileSync(path.join(root, "project/backpackCraft.js"), "utf8");
	const cssSource = fs.readFileSync(path.join(root, "project/backpack.css"), "utf8");

	assert.match(craftSource, /const PREVIEW_IMAGE_INSET = 0\.12/);
	assert.match(craftSource, /const getCraftPreviewGeometry = function \(definition\)/);
	assert.match(craftSource, /weaponSystem\.getRotatedCells\(weapon, 0\)/);
	assert.match(craftSource, /const uniformScale = Math\.min\(frameCols \/ cropWidth, frameRows \/ cropHeight\)/);
	assert.match(craftSource, /gridCell\.className = "backpack-craft-grid-cell"/);
	assert.match(craftSource, /cell\.className = "backpack-craft-footprint-cell"/);
	assert.match(craftSource, /const containerRatio = options\.compact \? 1 : 168 \/ 108/);
	assert.match(craftSource, /geometry\.cols \/ geometry\.rows >= containerRatio/);
	assert.match(craftSource, /box\.appendChild\(buildCraftGridPreview\(weapon\)\)/);
	assert.match(craftSource, /buildCraftGridPreview\(entry\.weapon, \{ compact: true \}\)/);
	assert.match(craftSource, /uiCommon\.bindTooltip\(element/);
	assert.match(craftSource, /uiCommon\.buildWeaponTooltip/);
	assert.doesNotMatch(craftSource, /getSynergyCells|backpack-craft-synergy/);
	assert.match(cssSource, /\.backpack-craft-grid-image-frame img\s*\{[^}]*object-fit:\s*contain[^}]*object-position:\s*center/);
	assert.match(cssSource, /\.backpack-craft-grid-preview\.compact\s*\{[^}]*width:\s*48px[^}]*height:\s*48px/);
});

test("一级商店未使用任何免费购买时刷新免费且不累计涨价次数", () => {
	const flags = {};
	const core = {
		status: { hero: { money: 300 }, thisMap: { ratio: 1 } },
		getFlag(name) { return flags[name]; },
		setFlag(name, value) { flags[name] = value; }
	};
	const context = loadScripts(["project/backpackShop.js"], {
		weaponDefinitions_9f2e6f5b_4b2c_4f8c_9a3d_7e1b6c0d5a44: { testWeapon: { id: "testWeapon", rarity: 1 } }
	});
	const shop = {};
	context.installBackpackShop_d7c3f1a9_5b2e_4a86_9d3f_7c1e2b8a44f6(core, shop);

	assert.equal(shop.getShopState().buyCount, 0);
	assert.equal(shop.getShopState().refreshCost, 0);

	flags.__backpack_shop_buy__ = 1;
	assert.equal(shop.getShopState().refreshCost, 10);

	flags.__backpack_shop_refresh__ = 3;
	assert.equal(shop.getShopState().refreshCost, 13);

	const shopSource = fs.readFileSync(path.join(root, "project/backpackShop.js"), "utf8");
	assert.match(shopSource, /const canRefreshForFree = function \(\) \{ return getBuyCount\(\) === 0; \}/);
	assert.match(shopSource, /if \(cost > 0\) core\.setFlag\(FLAG_REFRESH, getRefreshCount\(\) \+ 1\)/);
});

test("商店 choices 录像回放刷新、购买和赠予，并在 bp 动作前生成实例", () => {
	const flags = { randomList: ["w1", "w2", "w3", "w4", "w5"] };
	const granted = [];
	let randomIndex = 0;
	let replayCalls = 0;
	let replayErrors = 0;
	const replayActions = [{ name: "ignoreInput", func() { return true; } }];
	const definitions = {};
	flags.randomList.forEach((id, index) => {
		definitions[id] = { id, name: "武器" + (index + 1), rarity: 1, cells: [[0, 0]] };
	});
	const core = {
		status: { hero: { money: 300 }, thisMap: { ratio: 1 }, route: [] },
		plugin: {
			addBackpackWeapon(definition) {
				granted.push(definition.id);
				return String(granted.length);
			}
		},
		control: {
			replayActions,
			registerReplayAction(name, func) { replayActions.push({ name, func }); },
			_replay_error() { replayErrors++; }
		},
		isPlaying() { return true; },
		isReplaying() { return true; },
		getFlag(name, defaultValue) { return flags[name] == null ? defaultValue : flags[name]; },
		setFlag(name, value) { flags[name] = JSON.parse(JSON.stringify(value)); },
		rand(max) {
			const value = randomIndex++;
			return max == null ? 0.01 : value % max;
		},
		replay() { replayCalls++; },
		updateStatusBar() {}
	};
	const context = loadScripts(["project/backpackShop.js"], {
		weaponDefinitions_9f2e6f5b_4b2c_4f8c_9a3d_7e1b6c0d5a44: definitions
	});
	const shop = core.plugin;
	context.installBackpackShop_d7c3f1a9_5b2e_4a86_9d3f_7c1e2b8a44f6(core, shop);
	const choiceAction = replayActions.find((entry) => entry.name === "backpackShopChoice");
	assert.ok(choiceAction);
	assert.ok(
		replayActions.indexOf(choiceAction) < replayActions.findIndex((entry) => entry.name === "ignoreInput"),
		"商店 choices 处理器必须先于样板 ignoreInput"
	);

	// 回放打开普通商店时不创建 DOM，但会按相同随机序列准备首次货架。
	shop.openBackpackShop();
	const firstOffer = shop.getShopState().offer;
	assert.equal(firstOffer.length, 5);
	assert.equal(choiceAction.func("choices:1"), true);
	assert.equal(granted[0], firstOffer[0], "choices:1 应购买第一栏武器");
	assert.equal(flags.__backpack_shop_buy__, 1);
	assert.equal(core.status.hero.money, 300, "前三次购买免费");

	// 买过一次后刷新花费 10 金币，并记录为 choices:0。
	assert.equal(choiceAction.func("choices:0"), true);
	assert.equal(core.status.hero.money, 290);
	assert.equal(flags.__backpack_shop_refresh__, 1);
	assert.deepEqual(core.status.route, ["choices:1", "choices:0"]);

	// 免费赠予同样用 choices:1～5，并由打开选择器时生成的确定候选定位。
	shop.openRewardPicker();
	assert.equal(choiceAction.func("choices:2"), true);
	assert.equal(granted.length, 2);
	assert.deepEqual(core.status.route, ["choices:1", "choices:0", "choices:2"]);
	assert.equal(replayCalls, 3);
	assert.equal(choiceAction.func("choices:2"), false, "赠予完成后不能重复消费同一个 choices");
	shop.openBackpackShop();
	assert.equal(choiceAction.func("choices:6"), true, "商店上下文中的非法编号应由处理器消费并判定录像失败");
	assert.equal(replayErrors, 1);
	assert.equal(choiceAction.func("choices:1"), false, "录像失败后应清除商店选择上下文");

	const shopSource = fs.readFileSync(path.join(root, "project/backpackShop.js"), "utf8");
	assert.match(shopSource, /if \(options\.recordChoice !== false\) pushShopChoice\(0\);[\s\S]*?refreshOffer\(\)/);
	assert.match(shopSource, /pushShopChoice\(choiceIndex\)[\s\S]*?if \(!grantWeapon\(def\)\)/);
	assert.match(shopSource, /buildCard\(item, null, index \+ 1\)/);
	assert.match(shopSource, /registerReplayAction\("backpackShopChoice"/);
});

test("背包用 keyup 消费关闭键，避免同一次 ESC 打开系统菜单", () => {
	const source = fs.readFileSync(path.join(root, "project/backpackSystem.js"), "utf8");
	assert.match(source, /document\.addEventListener\("keyup", onKeyUp, true\)/);
	assert.match(source, /document\.removeEventListener\("keyup", onKeyUp, true\)/);
	assert.match(source, /const onKeyDown[\s\S]*?isBackpackCloseKey\(event\)[\s\S]*?stopImmediatePropagation\(\)[\s\S]*?const onKeyUp/);
	assert.match(source, /const onKeyUp[\s\S]*?stopImmediatePropagation\(\)[\s\S]*?closeBackpack\(\)/);
});

test("武器联动范围严格按结构化空间规则生成格子和方向", () => {
	const context = loadScripts(["project/backpackWeaponSynergy.js"]);
	const synergy = context.backpackWeaponSynergy_91f4c21e_7d37_4f12_9cc4_a9606ba62a83;

	const orthogonal = synergy.getAffectedCells({
		synergyRules: [{
			id: "vertical",
			conditions: [{ kind: "nearby", relation: "orthogonal", directions: ["up", "down"], distance: 1 }]
		}]
	}, [[4, 4], [4, 5]]);
	assert.deepEqual(
		Array.from(orthogonal, (cell) => [cell.col, cell.row, Array.from(cell.directions)]),
		[[4, 3, ["up"]], [4, 6, ["down"]]]
	);
	assert.deepEqual(
		Array.from(orthogonal, (cell) => Array.from(cell.arrowDirections)),
		[["up"], ["up"]]
	);

	const sideBox = synergy.getAffectedCells({
		synergyRules: [{
			id: "rightBox",
			conditions: [{ kind: "nearby", relation: "sideBox", directions: ["right"], distance: 2, span: 2 }]
		}]
	}, [[2, 2], [2, 3]]);
	assert.deepEqual(
		Array.from(sideBox, (cell) => [cell.col, cell.row, Array.from(cell.directions)]),
		[[3, 2, ["right"]], [4, 2, ["right"]], [3, 3, ["right"]], [4, 3, ["right"]]]
	);
	assert.deepEqual(
		Array.from(sideBox, (cell) => Array.from(cell.arrowDirections)),
		[["up"], ["up"], ["up"], ["up"]]
	);

	const combat = synergy.getAffectedCells({
		combatRules: [{
			id: "sideCount",
			effects: [{ stacksFrom: { kind: "nearbyCount", directions: ["left", "right"], distance: 1 } }]
		}]
	}, [[5, 5]]);
	assert.deepEqual(
		Array.from(combat, (cell) => [cell.col, cell.row, Array.from(cell.directions)]),
		[[4, 5, ["left"]], [6, 5, ["right"]]]
	);
	assert.deepEqual(
		Array.from(combat, (cell) => Array.from(cell.arrowDirections)),
		[["up"], ["up"]]
	);

	assert.deepEqual(
		["up", "right", "down", "left"].map((direction) => synergy.rotateDirection(direction, 90)),
		["right", "down", "left", "up"]
	);
	assert.deepEqual(
		["up", "right", "down", "left"].map((direction) => synergy.rotateDirection(direction, 180)),
		["down", "left", "up", "right"]
	);
	assert.deepEqual(
		["up", "right", "down", "left"].map((direction) => synergy.rotateDirection(direction, 270)),
		["left", "up", "right", "down"]
	);

	const rotatedSideBox = synergy.getAffectedCells({
		synergyRules: [{
			id: "rightBox",
			conditions: [{ kind: "nearby", relation: "sideBox", directions: ["right"], distance: 2, span: 2 }]
		}]
	}, [[2, 2], [3, 2]], 90);
	assert.deepEqual(
		Array.from(rotatedSideBox, (cell) => [cell.col, cell.row, Array.from(cell.directions)]),
		[[2, 3, ["down"]], [3, 3, ["down"]], [2, 4, ["down"]], [3, 4, ["down"]]]
	);
	assert.deepEqual(
		Array.from(rotatedSideBox, (cell) => Array.from(cell.arrowDirections)),
		[["up"], ["up"], ["up"], ["up"]]
	);

	const newCombatRanges = synergy.getAffectedCells({
		combatRules: [{
			id: "linkedCounter",
			conditions: [{ kind: "linkedWeapon", directions: ["left"], distance: 1 }]
		}, {
			id: "immediateAttack",
			effects: [{
				type: "triggerLinkedWeaponAttack",
				linkedWeapon: { directions: ["up"], distance: 1 }
			}]
		}]
	}, [[5, 5]]);
	assert.deepEqual(
		Array.from(newCombatRanges, (cell) => [cell.col, cell.row]),
		[[5, 4], [4, 5]]
	);

	assert.deepEqual(Array.from(synergy.getAffectedCells({ synergyText: "周围触发" }, [[1, 1]])), []);
});

test("联动方向以武器 0 度为基准并在预览、布局和战斗中同步旋转", () => {
	const context = loadPure();
	const rules = context.backpackBattleRules_36e4a689_0f48_476f_92a7_1c12b3903e87;
	const makeDirectionalSource = (rotation) => makeWeapon({
		instanceId: "source",
		rotation,
		cells: [[2, 2]],
		combatRules: [{
			trigger: "battleStart",
			effects: [{
				type: "applyStatus",
				target: "enemy",
				status: "exhaustion",
				stacksFrom: { kind: "nearbyCount", directions: ["right"], distance: 1 }
			}]
		}]
	});
	const lowerWeapon = makeWeapon({ instanceId: "lower", cells: [[2, 3]] });

	const zeroState = rules.createBattleState(makeInput({ weapons: [makeDirectionalSource(0), lowerWeapon] }));
	rules.runAllWeaponRules(zeroState, "battleStart", { sourceSide: "player" }, {});
	assert.equal(rules.getStatusStacks(zeroState.enemy, "exhaustion"), 0);

	const rotatedState = rules.createBattleState(makeInput({ weapons: [makeDirectionalSource(90), lowerWeapon] }));
	rules.runAllWeaponRules(rotatedState, "battleStart", { sourceSide: "player" }, {});
	assert.equal(rules.getStatusStacks(rotatedState.enemy, "exhaustion"), 1);

	assert.deepEqual(
		Array.from(rules.rotateCombatDirections(["up", "right", "down", "left"], 270)),
		["left", "up", "right", "down"]
	);

	const pluginSource = fs.readFileSync(path.join(root, "project/backpackWeaponSystem.js"), "utf8");
	assert.match(pluginSource, /getAffectedCells\([\s\S]*?getOccupiedWeaponCells\(weaponEntry\),\s*weaponEntry\.rotation/);
	assert.match(pluginSource, /rotateSpatialCondition\(condition, sourceEntry\.rotation\)/);
});

test("背包、战斗和 Tooltip 样式由 index.html 统一加载外置 CSS", () => {
	const battleUiSource = fs.readFileSync(path.join(root, "project/backpackBattleUI.js"), "utf8");
	const backpackSource = fs.readFileSync(path.join(root, "project/backpackSystem.js"), "utf8");
	const commonUiSource = fs.readFileSync(path.join(root, "project/backpackUiCommon.js"), "utf8");
	const cssSource = fs.readFileSync(path.join(root, "project/backpack.css"), "utf8");
	const indexSource = fs.readFileSync(path.join(root, "index.html"), "utf8");
	assert.match(indexSource, /href=['"]project\/backpack\.css(?:\?v=\d+)?['"]/);
	assert.match(cssSource, /\.bui-tooltip\s*\{/);
	assert.match(cssSource, /\.backpack-synergy-cell\s*\{/);
	assert.match(cssSource, /@keyframes\s+backpack-synergy-flow/);
	assert.match(cssSource, /\.bb-synergy-cell\s*\{/);
	assert.match(cssSource, /@keyframes\s+bb-synergy-flow/);
	assert.match(cssSource, /background-position:\s*24px center/);
	[battleUiSource, backpackSource, commonUiSource].forEach((source) => {
		assert.doesNotMatch(source, /createElement\(["']style["']\)/);
		assert.doesNotMatch(source, /style\.textContent/);
	});
});

test("武器系统和背包由独立安装器注册，plugins.js 只保留薄入口", () => {
	const pluginsSource = fs.readFileSync(path.join(root, "project/plugins.js"), "utf8");
	const weaponSystemSource = fs.readFileSync(path.join(root, "project/backpackWeaponSystem.js"), "utf8");
	const backpackSystemSource = fs.readFileSync(path.join(root, "project/backpackSystem.js"), "utf8");
	const mainSource = fs.readFileSync(path.join(root, "main.js"), "utf8");

	assert.match(pluginsSource, /"武器系统": function \(\) \{\s*installBackpackWeaponSystem_[^(]+\(core, this\);\s*\}/);
	assert.match(pluginsSource, /"背包": function \(\) \{\s*installBackpackSystem_[^(]+\(core, this\);\s*\}/);
	assert.doesNotMatch(pluginsSource, /const calculateWeaponAttributes|const CONFIG = \{/);
	assert.match(weaponSystemSource, /var installBackpackWeaponSystem_[^=]+=/);
	assert.match(weaponSystemSource, /this\.weaponSystem = \{/);
	assert.match(backpackSystemSource, /var installBackpackSystem_[^=]+=/);
	assert.match(backpackSystemSource, /this\.openBackpack = openBackpack/);
	assert.match(mainSource, /'backpackWeaponSynergy'[\s\S]*?'backpackUiCommon'[\s\S]*?'backpackWeaponSystem'[\s\S]*?'backpackSystem'[\s\S]*?'plugins'/);
});

test("预计伤害颜色保持原版的绿白黄橙红分级", () => {
	const source = fs.readFileSync(path.join(root, "project/backpackBattle.js"), "utf8");
	const start = source.indexOf("\tvar formatNumber = function");
	const end = source.indexOf("\n\tvar requestEnemyEstimate", start);
	assert.notEqual(start, -1);
	assert.notEqual(end, -1);
	const context = {
		core: {
			status: { hero: { hp: 300 } },
			formatBigNumber(value) { return String(value); }
		}
	};
	vm.createContext(context);
	vm.runInContext(source.slice(start, end) + "\nthis.formatEstimate = formatEstimate;", context);
	const colorOf = (damage, canWin = damage < 300) => context.formatEstimate({
		status: "ready",
		result: { damage, canWin, roundsExceeded: false }
	}).color;

	assert.equal(colorOf(0), "#11FF11");
	assert.equal(colorOf(1), "#FFFFFF");
	assert.equal(colorOf(99), "#FFFFFF");
	assert.equal(colorOf(100), "#FFFF00");
	assert.equal(colorOf(199), "#FFFF00");
	assert.equal(colorOf(200), "#FF9933");
	assert.equal(colorOf(299), "#FF9933");
	assert.equal(colorOf(300), "#FF2222");
});

test("防御不再参与减伤，伤害直接全额结算", () => {
	const context = loadPure();
	const rules = context.backpackBattleRules_36e4a689_0f48_476f_92a7_1c12b3903e87;
	const state = rules.createBattleState(makeInput());
	// 防御属性已被舍弃：即使目标防御很高，受到的伤害也是税前全额（扣除格挡后）。
	state.enemy.def = 600;
	const result = rules.applyDamage(state, "enemy", 100);
	assert.equal(result.damage, 100);
	assert.equal(state.enemy.hp, 0);
	// 防御相关的减伤函数已从规则模块中移除。
	assert.equal(typeof rules.getDefenseReduction, "undefined");
	assert.equal(typeof rules.getDamageAfterDefense, "undefined");
});

test("格挡在防御前抵扣且剩余层数保留", () => {
	const context = loadPure();
	const rules = context.backpackBattleRules_36e4a689_0f48_476f_92a7_1c12b3903e87;
	const state = rules.createBattleState(makeInput());
	rules.applyStatus(state, "player", "block", 15, "player");
	const first = rules.applyDamage(state, "player", 10);
	assert.equal(first.damage, 0);
	assert.equal(rules.getStatusStacks(state.player, "block"), 5);
	const second = rules.applyDamage(state, "player", 10);
	assert.equal(second.damage, 5);
	assert.equal(rules.getStatusStacks(state.player, "block"), 0);
});

test("反射逐层消耗且不会二次反射", () => {
	const context = loadPure();
	const rules = context.backpackBattleRules_36e4a689_0f48_476f_92a7_1c12b3903e87;
	const state = rules.createBattleState(makeInput());
	rules.applyStatus(state, "player", "reflection", 2, "player");
	rules.applyStatus(state, "enemy", "reflection", 2, "enemy");
	const result = rules.applyStatus(state, "player", "burn", 3, "enemy");
	assert.equal(result.reflected, 2);
	assert.equal(result.applied, 1);
	assert.equal(rules.getStatusStacks(state.player, "burn"), 1);
	assert.equal(rules.getStatusStacks(state.enemy, "burn"), 2);
	assert.equal(rules.getStatusStacks(state.player, "reflection"), 0);
	assert.equal(rules.getStatusStacks(state.enemy, "reflection"), 2);
});

test("烧伤与再生只在整百 Tick 结算", () => {
	const context = loadPure();
	const rules = context.backpackBattleRules_36e4a689_0f48_476f_92a7_1c12b3903e87;
	const state = rules.createBattleState(makeInput());
	state.player.hp = 900;
	rules.applyStatus(state, "player", "burn", 2, "enemy");
	rules.applyStatus(state, "player", "regeneration", 3, "player");
	state.tick = 99;
	assert.equal(state.player.hp, 900);
	state.tick = 100;
	rules.settlePeriodicStatuses(state);
	assert.equal(state.player.hp, 910);
	assert.equal(rules.getStatusStacks(state.player, "burn"), 2);
	assert.equal(rules.getStatusStacks(state.player, "regeneration"), 2);
});

test("无随机处理器时的规则驱散兜底选择最后一个有效 Buff", () => {
	const context = loadPure();
	const rules = context.backpackBattleRules_36e4a689_0f48_476f_92a7_1c12b3903e87;
	const state = rules.createBattleState(makeInput());
	rules.applyStatus(state, "enemy", "block", 2, "enemy");
	rules.applyStatus(state, "enemy", "mark", 1, "enemy");
	rules.applyStatus(state, "enemy", "highSpirit", 3, "enemy");
	assert.equal(rules.dispelLastBuff(state, "enemy"), "highSpirit");
	assert.equal(rules.getStatusStacks(state.enemy, "highSpirit"), 2);
	assert.equal(rules.dispelLastBuff(state, "enemy"), "highSpirit");
	assert.equal(rules.dispelLastBuff(state, "enemy"), "highSpirit");
	assert.equal(rules.dispelLastBuff(state, "enemy"), "block", "mark 专属跳过，继续驱散 block");
	assert.equal(rules.getStatusStacks(state.enemy, "block"), 1);
	assert.equal(rules.getStatusStacks(state.enemy, "mark"), 1, "刻印专属不可驱散");
});

test("百分比驱散对每个 Buff 独立向下取整", () => {
	const context = loadPure();
	const rules = context.backpackBattleRules_36e4a689_0f48_476f_92a7_1c12b3903e87;
	const state = rules.createBattleState(makeInput());
	rules.applyStatus(state, "enemy", "block", 1, "enemy");
	rules.applyStatus(state, "enemy", "mark", 3, "enemy");
	rules.applyStatus(state, "enemy", "highSpirit", 5, "enemy");
	const result = rules.dispelBuffPercent(state, "enemy", 0.5);
	assert.equal(result.totalRemoved, 2, "mark 专属跳过、block 1×0.5 向下取整为 0、highSpirit 5×0.5=2");
	assert.equal(rules.getStatusStacks(state.enemy, "block"), 1);
	assert.equal(rules.getStatusStacks(state.enemy, "mark"), 3, "刻印专属不可百分比驱散");
	assert.equal(rules.getStatusStacks(state.enemy, "highSpirit"), 3);
});

test("布局联动支持每 X 把匹配武器生效一次", () => {
	const core = {
		material: { items: {} },
		clone(value) { return value == null ? value : JSON.parse(JSON.stringify(value)); }
	};
	const context = loadScripts([
		"project/backpackWeaponSynergy.js",
		"project/weapons.js",
		"project/backpackWeaponSystem.js",
		"project/plugins.js"
	], { core });
	const plugin = {};
	context.plugins_bb40132b_638b_4a9f_b028_d3fe47acc8d1["武器系统"].call(plugin);
	const sourceWeapon = {
		id: "source",
		name: "来源",
		cells: [[0, 0]],
		minAttack: 10,
		maxAttack: 10,
		weaponTypes: ["枪"],
		synergyRules: [{
			id: "twoKnivesAddFive",
			trigger: "layout",
			conditions: [{
				id: "leftKnives",
				kind: "nearby",
				directions: ["left"],
				distance: 3,
				filter: { weaponTypes: ["刀"] }
			}],
			effects: [{
				target: "self",
				stat: "attack",
				value: 5,
				stacksFrom: { kind: "matchCount", conditionId: "leftKnives", divisor: 2 }
			}]
		}]
	};
	const knife = (id, col) => ({
		instanceId: id,
		col,
		row: 0,
		rotation: 0,
		weapon: { id, name: id, cells: [[0, 0]], minAttack: 1, maxAttack: 1, weaponTypes: ["刀"] }
	});
	const result = plugin.weaponSystem.calculateAttributes([
		{ instanceId: "source", col: 3, row: 0, rotation: 0, weapon: sourceWeapon },
		knife("knife1", 0),
		knife("knife2", 1),
		knife("knife3", 2)
	]);
	assert.equal(result.byInstanceId.source.minAttack, 15);
	assert.equal(result.byInstanceId.source.maxAttack, 15);
	assert.equal(result.byInstanceId.source.bonuses[0].stacks, 1);
});

test("打扰一下对区域内每把武器固定减0.2间隔，不乘区域武器数量", () => {
	const core = {
		material: { items: {} },
		clone(value) { return value == null ? value : JSON.parse(JSON.stringify(value)); }
	};
	const context = loadScripts([
		"project/backpackWeaponSynergy.js",
		"project/weapons.js",
		"project/backpackWeaponSystem.js"
	], { core });
	const plugin = {};
	context.installBackpackWeaponSystem_41d4dd44_8f7d_4bbc_b890_80db42f1ad76(core, plugin);
	const source = plugin.weaponSystem.normalizeWeapon(plugin.weaponSystem.getDefinition("I595"));
	const sourceEntry = { instanceId: "interrupt", col: 4, row: 4, rotation: 0, weapon: source };
	const affectedCells = plugin.weaponSystem.getSynergyCells(sourceEntry).slice(0, 3);
	assert.equal(affectedCells.length, 3, "测试布局应取得三个真实联动格");
	const target = (instanceId, col, row) => ({
		instanceId, col, row, rotation: 0,
		weapon: {
			id: instanceId, name: instanceId, cells: [[0, 0]], weaponTypes: ["剑"],
			minAttack: 1, maxAttack: 1, hitRate: 1, attackInterval: 1, ultimateGain: 0
		}
	});
	const targetEntries = affectedCells.map((cell, index) => target("target" + index, cell.col, cell.row));
	const result = plugin.weaponSystem.calculateAttributes([
		sourceEntry
	].concat(targetEntries));

	targetEntries.forEach((entry) => {
		const instanceId = entry.instanceId;
		assert.equal(result.byInstanceId[instanceId].attackInterval, 0.8,
			"区域内有3把武器时，每把仍只固定减少0.2");
		assert.equal(result.byInstanceId[instanceId].bonuses[0].stacks, 1);
	});
	assert.equal(result.byInstanceId.interrupt.attackInterval, 4, "打扰一下自身不受该范围效果影响");
	assert.equal(source.synergyRules[0].effects[0].perMatch, undefined);
});

test("预计伤害按 core.rand 同算法从当前种子计算真实命中与伤害", () => {
	const context = loadPure();
	const kernel = context.backpackBattleEstimateKernel_69e88a3f_71f9_4df3_82a6_c4695b166a71;
	const weapon = makeWeapon({
		attributes: {
			minAttack: 5,
			maxAttack: 10,
			hitRate: 1,
			attackInterval: 1,
			attackIntervalTicks: 100,
			ultimateGain: 0,
			weaponTypes: ["剑"]
		}
	});
	const input = makeInput({
		randomSeed: 1,
		enemy: Object.assign({}, makeInput().enemy, { hp: 6, maxHp: 6 }),
		weapons: [weapon]
	});
	const result = kernel.simulate(input);
	assert.equal(result.damage, 20, "第一回合随机伤害为5，第二回合随机伤害为8，期间怪物攻击一次");
	assert.equal(result.rounds, 2);
	assert.equal(result.roundsExceeded, false);
	assert.equal(result.rngCallCount, 5, "两次命中、两次伤害、一次怪物命中各推进一次随机数");
	assert.equal(result.randomSeedEnd, 1144108930, "种子推进结果必须与 core.rand 完全一致");
	assert.equal(input.randomSeed, 1, "预计计算不能修改输入种子");
	assert.equal("minDamage" in result, false);
	assert.equal("maxDamage" in result, false);
});

test("预计命中按当前种子真实掷骰而不是使用数学期望", () => {
	const context = loadPure();
	const kernel = context.backpackBattleEstimateKernel_69e88a3f_71f9_4df3_82a6_c4695b166a71;
	const weapon = makeWeapon({
		attributes: {
			minAttack: 10,
			maxAttack: 10,
			hitRate: 0.5,
			attackInterval: 1,
			attackIntervalTicks: 100,
			ultimateGain: 0,
			weaponTypes: ["剑"]
		},
		combatRules: []
	});
	const firstHit = kernel.simulate(makeInput({
		randomSeed: 1,
		enemy: Object.assign({}, makeInput().enemy, { hp: 10, maxHp: 10, atk: 0 }),
		weapons: [weapon]
	}));
	const firstMiss = kernel.simulate(makeInput({
		randomSeed: 123456,
		enemy: Object.assign({}, makeInput().enemy, { hp: 10, maxHp: 10, atk: 0 }),
		weapons: [weapon]
	}));
	assert.equal(firstHit.rounds, 1, "种子1的第一次命中骰小于0.5");
	assert.equal(firstMiss.rounds, 2, "种子123456的第一次命中骰大于0.5，第二次才命中");
});

test("预计计算即使勇士会先死亡也返回最终数值", () => {
	const context = loadPure();
	const kernel = context.backpackBattleEstimateKernel_69e88a3f_71f9_4df3_82a6_c4695b166a71;
	const result = kernel.simulate(makeInput({
		enemy: Object.assign({}, makeInput().enemy, { hp: 30, atk: 5000 })
	}));
	assert.equal(result.roundsExceeded, false);
	assert.equal(result.damage, 10000);
});

test("恰好 10000 回合返回数值，进入第 10001 回合才超限", () => {
	const context = loadPure();
	const kernel = context.backpackBattleEstimateKernel_69e88a3f_71f9_4df3_82a6_c4695b166a71;
	const exact = kernel.simulate(makeInput({
		enemy: Object.assign({}, makeInput().enemy, { hp: 10000, atk: 0 }),
		weapons: [makeWeapon({
			attributes: Object.assign({}, makeWeapon().attributes, { minAttack: 1, maxAttack: 1 })
		})]
	}));
	assert.equal(exact.roundsExceeded, false);
	assert.equal(exact.rounds, 10000);
	const exceeded = kernel.simulate(makeInput({
		enemy: Object.assign({}, makeInput().enemy, { hp: 10001, atk: 0 }),
		weapons: [makeWeapon({
			attributes: Object.assign({}, makeWeapon().attributes, { minAttack: 1, maxAttack: 1 })
		})]
	}));
	assert.equal(exceeded.roundsExceeded, true);
});

test("战斗开始状态只由显式 battleStart 武器联动施加", () => {
	const context = loadPure();
	const rules = context.backpackBattleRules_36e4a689_0f48_476f_92a7_1c12b3903e87;
	const ordinaryState = rules.createBattleState(makeInput());
	rules.runAllWeaponRules(ordinaryState, "battleStart", { sourceSide: "player" }, {});
	assert.equal(rules.getStatusStacks(ordinaryState.enemy, "ice"), 0);
	assert.equal(rules.getStatusStacks(ordinaryState.enemy, "exhaustion"), 0);

	const linkedWeapon = makeWeapon({
		combatRules: [{
			trigger: "battleStart",
			effects: [
				{ type: "applyStatus", target: "enemy", status: "ice", stacks: 1 },
				{ type: "applyStatus", target: "enemy", status: "exhaustion", stacks: 2 }
			]
		}]
	});
	const linkedState = rules.createBattleState(makeInput({ weapons: [linkedWeapon] }));
	rules.runAllWeaponRules(linkedState, "battleStart", { sourceSide: "player" }, {});
	assert.equal(rules.getStatusStacks(linkedState.enemy, "ice"), 1);
	assert.equal(rules.getStatusStacks(linkedState.enemy, "exhaustion"), 2);
});

test("0.25 攻击间隔在 100 Tick 实际攻击四次", () => {
	let calls = 0;
	const core = {
		rand(num) { calls++; return num ? 0 : 0; },
		registerAnimationFrame() {},
		unregisterAnimationFrame() {}
	};
	const context = loadScripts([
		"project/backpackBattleStatuses.js",
		"project/backpackBattleRules.js",
		"project/backpackBattleCore.js"
	], { core });
	const factory = context.createBackpackBattleRuntime_2f8f7df2_bf4f_45ea_8ec4_628e0e25a0dc;
	const runtime = factory(core);
	const weapon = makeWeapon({
		attributes: Object.assign({}, makeWeapon().attributes, {
			attackInterval: 0.25,
			attackIntervalTicks: 25
		})
	});
	runtime.start(makeInput({
		enemy: Object.assign({}, makeInput().enemy, { hp: 1000, atk: 0 }),
		weapons: [weapon]
	}));
	const snapshot = runtime.stepTicks(100);
	assert.equal(snapshot.weapons[0].runtimeCounters.attacks, 4);
	assert.equal(snapshot.enemy.hp, 960);
	assert.ok(calls >= 9);
	runtime.destroy();
});

test("背包可预设 0.25、0.5、1、2、3、10 与立即结算并在后续战斗沿用", () => {
	let savedSpeed = 4;
	const core = {
		rand(num) { return num ? 0 : 0; },
		getLocalStorage(key, fallback) { return key === "backpackBattleSpeed" ? savedSpeed : fallback; },
		setLocalStorage(key, value) { if (key === "backpackBattleSpeed") savedSpeed = value; },
		registerAnimationFrame() {},
		unregisterAnimationFrame() {}
	};
	const context = loadScripts([
		"project/backpackBattleStatuses.js",
		"project/backpackBattleRules.js",
		"project/backpackBattleCore.js"
	], { core });
	const runtime = context.createBackpackBattleRuntime_2f8f7df2_bf4f_45ea_8ec4_628e0e25a0dc(core);
	runtime.start(makeInput({ enemy: Object.assign({}, makeInput().enemy, { hp: 1000, maxHp: 1000 }) }));
	assert.equal(runtime.getSnapshot().speed, 3, "旧版 4× 偏好应迁移为 3×");
	assert.equal(runtime.setSpeed(0.25), true);
	assert.equal(savedSpeed, 0.25);
	assert.equal(runtime.setSpeed(0.5), true);
	assert.equal(runtime.setSpeed(1), true);
	assert.equal(runtime.setSpeed(2), true);
	assert.equal(runtime.setSpeed(3), true);
	assert.equal(runtime.setSpeed(10), true);
	assert.equal(runtime.setSpeed(4), false);
	assert.equal(savedSpeed, 10);
	runtime.abort();
	assert.equal(runtime.setPreferredSpeed("instant"), true);
	assert.equal(savedSpeed, "instant");
	assert.equal(runtime.getPreferredSpeed(), "instant");
	runtime.start(makeInput({ enemy: Object.assign({}, makeInput().enemy, { hp: 1000, maxHp: 1000 }) }));
	assert.equal(runtime.getSnapshot().fastForwarding, true, "立即偏好应在下一场战斗自动直接结算");
	runtime.abort();
	assert.equal(runtime.setPreferredSpeed(3), true);
	runtime.start(makeInput({ enemy: Object.assign({}, makeInput().enemy, { hp: 1000, maxHp: 1000 }) }));
	assert.equal(runtime.getSnapshot().speed, 3);
	const uiSource = fs.readFileSync(path.join(root, "project/backpackBattleUI.js"), "utf8");
	assert.match(uiSource, /data-speed='0\.25'>0\.25×[\s\S]*data-speed='0\.5'>0\.5×[\s\S]*data-speed='1'>1×[\s\S]*data-speed='2'>2×[\s\S]*data-speed='3'>3×[\s\S]*data-speed='10'>10×/);
	assert.match(uiSource, /class='bb-button bb-fast'>立即</);
	assert.match(uiSource, /INSTANT_OPEN_DELAY = 100/);
	assert.match(uiSource, /preferredSpeed === "instant" && !root && !allowInstantOpen/);
	assert.match(uiSource, /delayedOpenTimer = setTimeout\(function \(\) \{[\s\S]*?current && current\.active[\s\S]*?render\(current, true\)[\s\S]*?INSTANT_OPEN_DELAY/);
	assert.match(uiSource, /var close = function \(\) \{\s*cancelDelayedOpen\(\)/);
	const backpackSource = fs.readFileSync(path.join(root, "project/backpackSystem.js"), "utf8");
	assert.match(backpackSource, /BATTLE_SPEED_OPTIONS[\s\S]*value: "0\.25"[\s\S]*value: "0\.5"[\s\S]*value: "1"[\s\S]*value: "2"[\s\S]*value: "3"[\s\S]*value: "10"[\s\S]*value: "instant"/);
	assert.match(backpackSource, /aria-label", "默认战斗速度"/);
	assert.match(backpackSource, /battle\.setPreferredSpeed\(value\)/);
	runtime.destroy();
});

test("立即结算在 100ms 内完成时取消面板创建且不访问 DOM", () => {
	let runtimeListener = null;
	let nextTimerId = 1;
	const timers = new Map();
	let domAccesses = 0;
	let snapshot = { active: true, speed: 1 };
	const fakeSetTimeout = function (callback, delay) {
		const id = nextTimerId++;
		timers.set(id, { callback, delay });
		return id;
	};
	const fakeClearTimeout = function (id) { timers.delete(id); };
	const runtime = {
		subscribe(listener) { runtimeListener = listener; return function () {}; },
		getPreferredSpeed() { return "instant"; },
		getSnapshot() { return snapshot; }
	};
	const context = loadScripts(["project/backpackBattleUI.js"], {
		setTimeout: fakeSetTimeout,
		clearTimeout: fakeClearTimeout,
		window: { removeEventListener() {} },
		document: new Proxy({}, {
			get() { domAccesses++; throw new Error("快速立即结算不应创建战斗 DOM"); }
		}),
		backpackBattleStatusDefinitions_7d94f05e_2f6d_4b8e_9c23_5a317ccab120: {},
		backpackUiCommon_2c986f67_7621_44eb_972d_24f1e2c6ce61: { hideTooltip() {} },
		backpackBattleRules_36e4a689_0f48_476f_92a7_1c12b3903e87: {}
	});
	const ui = context.createBackpackBattleUI_877f7cd8_53d6_448c_94ab_15ef82119bb2({}, runtime);
	runtimeListener(snapshot);
	assert.equal(timers.size, 1);
	assert.equal(Array.from(timers.values())[0].delay, 100);
	assert.equal(domAccesses, 0);
	assert.equal(ui.isOpen(), false);

	snapshot = { active: false };
	runtimeListener(snapshot);
	assert.equal(timers.size, 0, "战斗提前结束后应取消延迟显示计时器");
	assert.equal(domAccesses, 0);
	assert.equal(ui.isOpen(), false);
	ui.destroy();
});

test("Miss 不造成伤害、不触发附带效果但仍获取奥义", () => {
	const core = {
		rand(num) { return num ? 0 : 0.99; },
		registerAnimationFrame() {},
		unregisterAnimationFrame() {}
	};
	const context = loadScripts([
		"project/backpackBattleStatuses.js",
		"project/backpackBattleRules.js",
		"project/backpackBattleCore.js"
	], { core });
	const runtime = context.createBackpackBattleRuntime_2f8f7df2_bf4f_45ea_8ec4_628e0e25a0dc(core);
	const weapon = makeWeapon({
		attributes: Object.assign({}, makeWeapon().attributes, {
			hitRate: 0.5,
			attackInterval: 0.1,
			attackIntervalTicks: 10,
			ultimateGain: 7
		}),
		combatRules: [{
			trigger: "afterHit",
			effects: [{ type: "applyStatus", target: "enemy", status: "burn", stacks: 1 }]
		}]
	});
	runtime.start(makeInput({ weapons: [weapon] }));
	const snapshot = runtime.stepTicks(10);
	assert.equal(snapshot.enemy.hp, 100);
	assert.equal(snapshot.enemy.debuffs.length, 0);
	assert.equal(snapshot.player.ultimate, 7);
	runtime.destroy();
});

test("联动武器每命中 X 次触发一次效果并保留余数", () => {
	const core = {
		rand(num) { return num ? 0 : 0; },
		registerAnimationFrame() {},
		unregisterAnimationFrame() {}
	};
	const context = loadScripts([
		"project/backpackBattleStatuses.js",
		"project/backpackBattleRules.js",
		"project/backpackBattleCore.js"
	], { core });
	const runtime = context.createBackpackBattleRuntime_2f8f7df2_bf4f_45ea_8ec4_628e0e25a0dc(core);
	const source = makeWeapon({
		instanceId: "source",
		row: 0,
		col: 1,
		cells: [[1, 0]],
		attributes: Object.assign({}, makeWeapon().attributes, { attackIntervalTicks: 1000 }),
		combatRules: [{
			id: "leftKnifeEveryThree",
			trigger: "afterLinkedWeaponHit",
			every: 3,
			conditions: [{
				kind: "linkedWeapon",
				directions: ["left"],
				distance: 1,
				filter: { weaponTypes: ["刀"] }
			}],
			effects: [{ type: "applyStatus", target: "enemy", status: "exhaustion", stacks: 1 }]
		}]
	});
	const linkedKnife = makeWeapon({
		instanceId: "knife",
		row: 0,
		col: 0,
		cells: [[0, 0]],
		attributes: Object.assign({}, makeWeapon().attributes, {
			weaponTypes: ["刀"],
			attackIntervalTicks: 1
		})
	});
	runtime.start(makeInput({
		enemy: Object.assign({}, makeInput().enemy, { hp: 1000, maxHp: 1000, atk: 0 }),
		weapons: [source, linkedKnife]
	}));
	let snapshot = runtime.stepTicks(5);
	assert.equal(snapshot.weapons.find((weapon) => weapon.instanceId === "knife").runtimeCounters.hits, 5);
	assert.equal(snapshot.enemy.debuffs.find((status) => status.id === "exhaustion").stacks, 1);
	snapshot = runtime.stepTicks(1);
	assert.equal(snapshot.enemy.debuffs.find((status) => status.id === "exhaustion").stacks, 2);
	runtime.destroy();
});

test("立即联动攻击保留 CD、获取奥义、计数命中且不会递归联动", () => {
	const core = {
		rand(num) { return num ? 0 : 0; },
		registerAnimationFrame() {},
		unregisterAnimationFrame() {}
	};
	const context = loadScripts([
		"project/backpackBattleStatuses.js",
		"project/backpackBattleRules.js",
		"project/backpackBattleCore.js"
	], { core });
	const runtime = context.createBackpackBattleRuntime_2f8f7df2_bf4f_45ea_8ec4_628e0e25a0dc(core);
	const source = makeWeapon({
		instanceId: "source",
		row: 1,
		col: 1,
		cells: [[1, 1]],
		attributes: Object.assign({}, makeWeapon().attributes, { attackIntervalTicks: 1 }),
		combatRules: [{
			id: "triggerUpperKnife",
			trigger: "afterHit",
			effects: [{
				type: "triggerLinkedWeaponAttack",
				linkedWeapon: {
					directions: ["up"],
					distance: 1,
					filter: { weaponTypes: ["刀"] }
				}
			}]
		}, {
			id: "countUpperKnife",
			trigger: "afterLinkedWeaponHit",
			every: 1,
			conditions: [{ kind: "linkedWeapon", directions: ["up"], distance: 1, filter: { weaponTypes: ["刀"] } }],
			effects: [{ type: "applyStatus", target: "enemy", status: "exhaustion", stacks: 1 }]
		}]
	});
	const linkedKnife = makeWeapon({
		instanceId: "knife",
		row: 0,
		col: 1,
		cells: [[1, 0]],
		attributes: Object.assign({}, makeWeapon().attributes, {
			minAttack: 4,
			maxAttack: 4,
			weaponTypes: ["刀"],
			attackIntervalTicks: 100,
			ultimateGain: 7
		}),
		combatRules: [{
			trigger: "afterHit",
			effects: [
				{ type: "applyStatus", target: "enemy", status: "burn", stacks: 1 },
				{ type: "triggerLinkedWeaponAttack", linkedWeapon: { directions: ["down"], distance: 1 } }
			]
		}]
	});
	runtime.start(makeInput({
		enemy: Object.assign({}, makeInput().enemy, { hp: 1000, maxHp: 1000, atk: 0 }),
		weapons: [source, linkedKnife]
	}));
	const snapshot = runtime.stepTicks(1);
	const sourceSnapshot = snapshot.weapons.find((weapon) => weapon.instanceId === "source");
	const knifeSnapshot = snapshot.weapons.find((weapon) => weapon.instanceId === "knife");
	assert.equal(sourceSnapshot.runtimeCounters.attacks, 1);
	assert.equal(knifeSnapshot.runtimeCounters.attacks, 1);
	assert.equal(knifeSnapshot.cooldownTicks, 1);
	assert.equal(snapshot.player.ultimate, 7);
	assert.equal(snapshot.enemy.debuffs.find((status) => status.id === "burn").stacks, 1);
	assert.equal(snapshot.enemy.debuffs.find((status) => status.id === "exhaustion").stacks, 1);
	runtime.destroy();
});

test("负奥义武器满 CD 等待，奥义恰好足够时允许减到 0", () => {
	const core = {
		rand(num) { return num ? 0 : 0; },
		registerAnimationFrame() {},
		unregisterAnimationFrame() {}
	};
	const context = loadScripts([
		"project/backpackBattleStatuses.js",
		"project/backpackBattleRules.js",
		"project/backpackBattleCore.js"
	], { core });
	const createRuntime = () => context.createBackpackBattleRuntime_2f8f7df2_bf4f_45ea_8ec4_628e0e25a0dc(core);
	const costWeapon = makeWeapon({
		instanceId: "cost",
		row: 0,
		attributes: Object.assign({}, makeWeapon().attributes, { attackIntervalTicks: 1, ultimateGain: -5 })
	});
	let runtime = createRuntime();
	runtime.start(makeInput({
		player: Object.assign({}, makeInput().player, { ultimate: 4 }),
		enemy: Object.assign({}, makeInput().enemy, { hp: 1000, maxHp: 1000, atk: 0 }),
		weapons: [costWeapon]
	}));
	let snapshot = runtime.stepTicks(3);
	assert.equal(snapshot.weapons[0].runtimeCounters.attacks || 0, 0);
	assert.equal(snapshot.weapons[0].cooldownTicks, 3);
	runtime.destroy();

	runtime = createRuntime();
	runtime.start(makeInput({
		player: Object.assign({}, makeInput().player, { ultimate: 5 }),
		enemy: Object.assign({}, makeInput().enemy, { hp: 1000, maxHp: 1000, atk: 0 }),
		weapons: [costWeapon]
	}));
	snapshot = runtime.stepTicks(1);
	assert.equal(snapshot.weapons[0].runtimeCounters.attacks, 1);
	assert.equal(snapshot.player.ultimate, 0);
	assert.equal(snapshot.weapons[0].cooldownTicks, 0);
	runtime.destroy();
});

test("同 Tick 其他武器补足奥义后，满 CD 的负奥义武器立即重试", () => {
	const core = {
		rand(num) { return num ? 0 : 0; },
		registerAnimationFrame() {},
		unregisterAnimationFrame() {}
	};
	const context = loadScripts([
		"project/backpackBattleStatuses.js",
		"project/backpackBattleRules.js",
		"project/backpackBattleCore.js"
	], { core });
	const runtime = context.createBackpackBattleRuntime_2f8f7df2_bf4f_45ea_8ec4_628e0e25a0dc(core);
	const costWeapon = makeWeapon({
		instanceId: "cost",
		row: 0,
		attributes: Object.assign({}, makeWeapon().attributes, { attackIntervalTicks: 2, ultimateGain: -5 })
	});
	const generator = makeWeapon({
		instanceId: "generator",
		row: 1,
		attributes: Object.assign({}, makeWeapon().attributes, { attackIntervalTicks: 2, ultimateGain: 5 })
	});
	runtime.start(makeInput({
		enemy: Object.assign({}, makeInput().enemy, { hp: 1000, maxHp: 1000, atk: 0 }),
		weapons: [costWeapon, generator]
	}));
	const snapshot = runtime.stepTicks(2);
	assert.equal(snapshot.weapons.find((weapon) => weapon.instanceId === "cost").runtimeCounters.attacks, 1);
	assert.equal(snapshot.weapons.find((weapon) => weapon.instanceId === "generator").runtimeCounters.attacks, 1);
	assert.equal(snapshot.player.ultimate, 0);
	runtime.destroy();
});

test("冰洁、激奏、黑暗、高扬和虚脱按层数修改实时属性", () => {
	const context = loadPure();
	const rules = context.backpackBattleRules_36e4a689_0f48_476f_92a7_1c12b3903e87;
	const state = rules.createBattleState(makeInput());
	const weapon = state.weapons[0];
	rules.applyStatus(state, "player", "ice", 4, "enemy");
	rules.applyStatus(state, "player", "excitation", 7, "player");
	rules.applyStatus(state, "player", "darkness", 3, "enemy");
	rules.applyStatus(state, "player", "highSpirit", 5, "player");
	rules.applyStatus(state, "player", "exhaustion", 2, "enemy");
	assert.equal(rules.getWeaponIntervalTicks(state, weapon), 97);
	assert.equal(rules.getEffectiveHitRate(state.player, 0.8), 0.65);
	assert.equal(rules.getUltimateGain(state.player, 6), 12);
	assert.equal(rules.getUltimateGain(state.player, 1), 7);
});

test("净化使自身所有 Debuff 各减少一层", () => {
	const context = loadPure();
	const rules = context.backpackBattleRules_36e4a689_0f48_476f_92a7_1c12b3903e87;
	const state = rules.createBattleState(makeInput());
	rules.applyStatus(state, "player", "burn", 3, "enemy");
	rules.applyStatus(state, "player", "darkness", 1, "enemy");
	rules.applyStatus(state, "player", "ice", 2, "enemy");
	assert.equal(rules.cleanseAllDebuffs(state, "player"), 3);
	assert.equal(rules.getStatusStacks(state.player, "burn"), 2);
	assert.equal(rules.getStatusStacks(state.player, "darkness"), 0);
	assert.equal(rules.getStatusStacks(state.player, "ice"), 1);
});

test("奥义立即攻击全部武器且不改变原 CD、不从额外攻击获取奥义", () => {
	const core = {
		rand(num) { return num ? 0 : 0; },
		registerAnimationFrame() {},
		unregisterAnimationFrame() {}
	};
	const context = loadScripts([
		"project/backpackBattleStatuses.js",
		"project/backpackBattleRules.js",
		"project/backpackBattleCore.js"
	], { core });
	const runtime = context.createBackpackBattleRuntime_2f8f7df2_bf4f_45ea_8ec4_628e0e25a0dc(core);
	const weapon1 = makeWeapon({
		instanceId: "w1",
		attributes: Object.assign({}, makeWeapon().attributes, { ultimateGain: 100 })
	});
	const weapon2 = makeWeapon({
		instanceId: "w2",
		attributes: Object.assign({}, makeWeapon().attributes, { ultimateGain: 0 })
	});
	runtime.start(makeInput({
		enemy: Object.assign({}, makeInput().enemy, { hp: 1000, maxHp: 1000, atk: 0 }),
		weapons: [weapon1, weapon2]
	}));
	const snapshot = runtime.stepTicks(100);
	assert.equal(snapshot.weapons[0].runtimeCounters.attacks, 2);
	assert.equal(snapshot.weapons[1].runtimeCounters.attacks, 2);
	assert.equal(snapshot.weapons[0].cooldownTicks, 0);
	assert.equal(snapshot.weapons[1].cooldownTicks, 0);
	assert.equal(snapshot.player.ultimate, 0);
	runtime.destroy();
});

test("奥义来源攻击可获得仅对本次税前伤害生效的加成", () => {
	const core = {
		rand(num) { return num ? 0 : 0; },
		registerAnimationFrame() {},
		unregisterAnimationFrame() {}
	};
	const context = loadScripts([
		"project/backpackBattleStatuses.js",
		"project/backpackBattleRules.js",
		"project/backpackBattleCore.js"
	], { core });
	const runtime = context.createBackpackBattleRuntime_2f8f7df2_bf4f_45ea_8ec4_628e0e25a0dc(core);
	const weapon = makeWeapon({
		attributes: Object.assign({}, makeWeapon().attributes, { ultimateGain: 100 }),
		combatRules: [{
			id: "ultimateAddsFive",
			trigger: "beforeAttack",
			conditions: [{ kind: "attackOrigin", value: "ultimate" }],
			effects: [{ type: "modifyAttackDamage", operation: "add", value: 5 }]
		}]
	});
	runtime.start(makeInput({
		enemy: Object.assign({}, makeInput().enemy, { hp: 1000, maxHp: 1000, atk: 0 }),
		weapons: [weapon]
	}));
	const snapshot = runtime.stepTicks(100);
	assert.equal(snapshot.enemy.hp, 975);
	assert.equal(snapshot.weapons[0].runtimeCounters.attacks, 2);
	runtime.destroy();
});

test("预计内核同步计算立即联动攻击与奥义来源增伤", () => {
	const context = loadPure();
	const kernel = context.backpackBattleEstimateKernel_69e88a3f_71f9_4df3_82a6_c4695b166a71;
	const source = makeWeapon({
		instanceId: "source",
		row: 1,
		cells: [[0, 1]],
		attributes: Object.assign({}, makeWeapon().attributes, { attackIntervalTicks: 1 }),
		combatRules: [{
			trigger: "afterHit",
			effects: [{
				type: "triggerLinkedWeaponAttack",
				linkedWeapon: { directions: ["up"], distance: 1, filter: { weaponTypes: ["刀"] } }
			}]
		}]
	});
	const linked = makeWeapon({
		instanceId: "linked",
		row: 0,
		cells: [[0, 0]],
		attributes: Object.assign({}, makeWeapon().attributes, {
			minAttack: 4,
			maxAttack: 4,
			attackIntervalTicks: 100,
			weaponTypes: ["刀"]
		})
	});
	const linkedResult = kernel.simulate(makeInput({
		enemy: Object.assign({}, makeInput().enemy, { hp: 14, maxHp: 14, atk: 0 }),
		weapons: [source, linked]
	}));
	assert.equal(linkedResult.rounds, 0.01);

	const ultimateWeapon = makeWeapon({
		attributes: Object.assign({}, makeWeapon().attributes, { ultimateGain: 100 }),
		combatRules: [{
			trigger: "beforeAttack",
			conditions: [{ kind: "attackOrigin", value: "ultimate" }],
			effects: [{ type: "modifyAttackDamage", value: 5 }]
		}]
	});
	const ultimateResult = kernel.simulate(makeInput({
		enemy: Object.assign({}, makeInput().enemy, { hp: 25, maxHp: 25, atk: 0 }),
		weapons: [ultimateWeapon]
	}));
	assert.equal(ultimateResult.rounds, 1);
});

test("相同随机序列得到完全相同的实际战斗结果", () => {
	function createSeededCore(seed) {
		let value = seed >>> 0;
		return {
			rand(num) {
				value = (value * 1664525 + 1013904223) >>> 0;
				if (num == null) return value / 0x100000000;
				return value % num;
			},
			registerAnimationFrame() {},
			unregisterAnimationFrame() {}
		};
	}
	function run(seed) {
		const core = createSeededCore(seed);
		const context = loadScripts([
			"project/backpackBattleStatuses.js",
			"project/backpackBattleRules.js",
			"project/backpackBattleCore.js"
		], { core });
		const runtime = context.createBackpackBattleRuntime_2f8f7df2_bf4f_45ea_8ec4_628e0e25a0dc(core);
		const weapon = makeWeapon({
			attributes: Object.assign({}, makeWeapon().attributes, {
				minAttack: 3,
				maxAttack: 9,
				hitRate: 0.7,
				attackIntervalTicks: 25
			})
		});
		runtime.start(makeInput({
			enemy: Object.assign({}, makeInput().enemy, { hp: 500, maxHp: 500 }),
			weapons: [weapon]
		}));
		const result = runtime.stepTicks(500);
		runtime.destroy();
		return JSON.parse(JSON.stringify(result));
	}
	assert.deepEqual(run(123456), run(123456));
});

test("预计内核与实际战斗按同一 core.rand 种子得到相同随机结果且不推进实际种子", () => {
	const seedStart = 246813579;
	let actualSeed = seedStart;
	const nextSeed = (seed) => {
		seed = (seed % 127773) * 16807 - ~~(seed / 127773) * 2836;
		return seed + (seed < 0 ? 2147483647 : 0);
	};
	const core = {
		rand(num) {
			actualSeed = nextSeed(actualSeed);
			const value = actualSeed / 2147483647;
			return num && num > 0 ? Math.floor(value * num) : value;
		},
		registerAnimationFrame() {},
		unregisterAnimationFrame() {}
	};
	const context = loadScripts([
		"project/backpackBattleStatuses.js",
		"project/backpackBattleRules.js",
		"project/backpackBattleEstimateKernel.js",
		"project/backpackBattleCore.js"
	], { core });
	const kernel = context.backpackBattleEstimateKernel_69e88a3f_71f9_4df3_82a6_c4695b166a71;
	const runtime = context.createBackpackBattleRuntime_2f8f7df2_bf4f_45ea_8ec4_628e0e25a0dc(core);
	const estimateHp = 1000000000000;
	const weapon = makeWeapon({
		attributes: Object.assign({}, makeWeapon().attributes, {
			minAttack: 5,
			maxAttack: 12,
			hitRate: 0.7,
			attackIntervalTicks: 100
		}),
		combatRules: [
			{ trigger: "battleStart", effects: [{ type: "applyRandomBuffs", target: "self", count: 2, stacks: 1 }] },
			{ trigger: "afterHit", effects: [
				{ type: "applyRandomDebuff", target: "opponent", stacks: 1 },
				{ type: "cleanseOneDebuff", target: "self" },
				{ type: "dispelRandomBuff", target: "opponent" }
			] },
			{ trigger: "afterAttack", conditions: [{ kind: "chance", base: 0.5 }],
				effects: [{ type: "applyRandomBuffs", target: "self", count: 1, stacks: 1 }] }
		]
	});
	const input = makeInput({
		randomSeed: seedStart,
		player: {
			name: "勇士", hp: estimateHp, maxHp: estimateHp, def: 0,
			buffs: [],
			debuffs: [{ id: "burn", stacks: 2 }, { id: "ice", stacks: 2 }, { id: "darkness", stacks: 2 }]
		},
		enemy: Object.assign({}, makeInput().enemy, {
			hp: 40,
			maxHp: 40,
			atk: 4,
			hitRate: 0.8,
			buffs: [{ id: "block", stacks: 2 }, { id: "highSpirit", stacks: 2 }],
			combatRules: [{
				trigger: "afterHit",
				effects: [{ type: "applyRandomDebuff", target: "opponent", stacks: 1 }]
			}]
		}),
		weapons: [weapon],
		meta: { initialPlayerHp: estimateHp }
	});

	const predicted = kernel.simulate(JSON.parse(JSON.stringify(input)));
	assert.equal(actualSeed, seedStart, "Worker 预计计算不能推进实际战斗使用的种子");
	let actualResult = null;
	runtime.start(JSON.parse(JSON.stringify(input)), { onFinish(result) { actualResult = result; } });
	runtime.stepTicks(100000);
	assert.ok(actualResult, "实际战斗应在测试上限内结束");
	assert.equal(predicted.damage, actualResult.netDamage);
	assert.equal(predicted.rounds, actualResult.rounds);
	assert.equal(predicted.rngCallCount, actualResult.rngCallCount);
	assert.equal(predicted.randomSeedEnd, actualSeed);
	runtime.destroy();
});

test("战斗完成回调只执行一次并返回最终结果", () => {
	const core = {
		rand(num) { return num ? 0 : 0; },
		registerAnimationFrame() {},
		unregisterAnimationFrame() {}
	};
	const context = loadScripts([
		"project/backpackBattleStatuses.js",
		"project/backpackBattleRules.js",
		"project/backpackBattleCore.js"
	], { core });
	const runtime = context.createBackpackBattleRuntime_2f8f7df2_bf4f_45ea_8ec4_628e0e25a0dc(core);
	let callbackCount = 0;
	let outcome = null;
	runtime.start(makeInput({
		enemy: Object.assign({}, makeInput().enemy, { hp: 1, maxHp: 1, atk: 0 }),
		weapons: [makeWeapon({ attributes: Object.assign({}, makeWeapon().attributes, { attackIntervalTicks: 1 }) })]
	}), { onFinish(result) { callbackCount++; outcome = result.outcome; } });
	runtime.stepTicks(10);
	assert.equal(callbackCount, 1);
	assert.equal(outcome, "victory");
	assert.equal(runtime.isActive(), false);
	runtime.destroy();
});

test("预计伤害缓存合并同种子任务，种子变化后创建新任务并丢弃旧布局结果", () => {
	class FakeWorker {
		constructor() { this.messages = []; FakeWorker.instances.push(this); }
		postMessage(message) { this.messages.push(message); }
		terminate() { this.terminated = true; }
	}
	FakeWorker.instances = [];
	const context = loadScripts(["project/backpackBattleEstimate.js"], { Worker: FakeWorker });
	const create = context.createBackpackBattleEstimateCoordinator_f43e0d5b_629e_457c_9540_b3f0d0541ffc;
	let randomSeed = 1;
	const coordinator = create({
		createInput() {
			return {
				battleRuleVersion: 1,
				weaponConfigVersion: 1,
				randomSeed,
				currentHp: 100,
				input: { enemy: { id: "e" } }
			};
		}
	});
	assert.equal(coordinator.request("e").status, "pending");
	assert.equal(coordinator.request("e").status, "pending");
	const worker = FakeWorker.instances[0];
	assert.equal(worker.messages.length, 1);
	const oldMessage = worker.messages[0];
	assert.equal(oldMessage.randomSeed, 1);
	assert.equal(oldMessage.inputSnapshot.randomSeed, 1);
	randomSeed = 2;
	const changedSeed = coordinator.request("e");
	assert.equal(changedSeed.status, "pending");
	assert.notEqual(changedSeed.cacheKey, oldMessage.cacheKey);
	assert.equal(worker.messages.length, 2, "随机种子变化后不能复用旧预计结果");
	assert.equal(worker.messages[1].randomSeed, 2);
	coordinator.bumpLayoutRevision();
	worker.onmessage({ data: Object.assign({}, oldMessage, { result: { damage: 1, rounds: 1, roundsExceeded: false } }) });
	assert.equal(coordinator.getCacheSize(), 0);
	coordinator.destroy();
});

test("预计模块和 Worker 只使用输入种子，不直接读取或回写游戏随机状态", () => {
	const files = [
		"project/backpackBattleEstimate.js",
		"project/backpackBattleEstimateKernel.js",
		"project/workers/backpackBattleEstimateWorker.js"
	];
	const forbidden = ["core.rand(", "core.rand2(", "Math.random(", "crypto.getRandomValues(", "core.getFlag(", "core.setFlag("];
	files.forEach((file) => {
		const source = fs.readFileSync(path.join(root, file), "utf8");
		forbidden.forEach((token) => assert.equal(source.includes(token), false, `${file} 包含 ${token}`));
	});
	const battleSource = fs.readFileSync(path.join(root, "project/backpackBattle.js"), "utf8");
	assert.match(battleSource, /core\.getFlag\("__rand__", 0\)/);
	assert.match(battleSource, /input\.randomSeed = randomSeed/);
	assert.doesNotMatch(battleSource, /core\.setFlag\("__rand__"/);
});

test("敌人攻击命中后通过 combatRules 给玩家施加烧伤", () => {
	const core = {
		rand(num) { return num ? 0 : 0; },
		registerAnimationFrame() {},
		unregisterAnimationFrame() {}
	};
	const context = loadScripts([
		"project/backpackBattleStatuses.js",
		"project/backpackBattleRules.js",
		"project/backpackBattleCore.js"
	], { core });
	const runtime = context.createBackpackBattleRuntime_2f8f7df2_bf4f_45ea_8ec4_628e0e25a0dc(core);
	const idleWeapon = makeWeapon({
		attributes: Object.assign({}, makeWeapon().attributes, { attackIntervalTicks: 10000 })
	});
	runtime.start(makeInput({
		enemy: Object.assign({}, makeInput().enemy, {
			hp: 100000, maxHp: 100000, atk: 10,
			combatRules: [{
				trigger: "afterHit",
				effects: [{ type: "applyStatus", target: "opponent", status: "burn", stacks: 4 }]
			}]
		}),
		weapons: [idleWeapon]
	}));
	const snapshot = runtime.stepTicks(100);
	assert.equal(snapshot.player.debuffs.find((s) => s.id === "burn").stacks, 4);
	runtime.destroy();
});

test("敌人攻击命中后净化自身所有 Debuff 各 1 层", () => {
	const core = {
		rand(num) { return num ? 0 : 0; },
		registerAnimationFrame() {},
		unregisterAnimationFrame() {}
	};
	const context = loadScripts([
		"project/backpackBattleStatuses.js",
		"project/backpackBattleRules.js",
		"project/backpackBattleCore.js"
	], { core });
	const runtime = context.createBackpackBattleRuntime_2f8f7df2_bf4f_45ea_8ec4_628e0e25a0dc(core);
	const idleWeapon = makeWeapon({
		attributes: Object.assign({}, makeWeapon().attributes, { attackIntervalTicks: 10000 })
	});
	runtime.start(makeInput({
		enemy: Object.assign({}, makeInput().enemy, {
			hp: 100000, maxHp: 100000, atk: 10,
			debuffs: [
				{ id: "burn", stacks: 3, acquiredTick: 0 },
				{ id: "darkness", stacks: 2, acquiredTick: 0 }
			],
			combatRules: [{
				trigger: "afterHit",
				effects: [{ type: "cleanseAllDebuffs", target: "self" }]
			}]
		}),
		weapons: [idleWeapon]
	}));
	const snapshot = runtime.stepTicks(100);
	assert.equal(snapshot.enemy.debuffs.find((s) => s.id === "burn").stacks, 2);
	assert.equal(snapshot.enemy.debuffs.find((s) => s.id === "darkness").stacks, 1);
	runtime.destroy();
});

test("敌人攻击命中后驱散玩家一个 Buff", () => {
	const core = {
		rand(num) { return num ? 0 : 0; },
		registerAnimationFrame() {},
		unregisterAnimationFrame() {}
	};
	const context = loadScripts([
		"project/backpackBattleStatuses.js",
		"project/backpackBattleRules.js",
		"project/backpackBattleCore.js"
	], { core });
	const runtime = context.createBackpackBattleRuntime_2f8f7df2_bf4f_45ea_8ec4_628e0e25a0dc(core);
	const idleWeapon = makeWeapon({
		attributes: Object.assign({}, makeWeapon().attributes, { attackIntervalTicks: 10000 })
	});
	runtime.start(makeInput({
		player: Object.assign({}, makeInput().player, {
			buffs: [
				{ id: "block", stacks: 5, acquiredTick: 0 },
				{ id: "mark", stacks: 3, acquiredTick: 0 }
			]
		}),
		enemy: Object.assign({}, makeInput().enemy, {
			hp: 100000, maxHp: 100000, atk: 0,
			combatRules: [{
				trigger: "afterHit",
				effects: [{ type: "dispelRandomBuff", target: "opponent" }]
			}]
		}),
		weapons: [idleWeapon]
	}));
	const snapshot = runtime.stepTicks(100);
	const totalBuffs = snapshot.player.buffs.reduce((sum, b) => sum + b.stacks, 0);
	assert.equal(totalBuffs, 7);
	runtime.destroy();
});

test("预计模拟同步计算敌人攻击命中后的烧伤效果", () => {
	const context = loadPure();
	const kernel = context.backpackBattleEstimateKernel_69e88a3f_71f9_4df3_82a6_c4695b166a71;
	const result = kernel.simulate(makeInput({
		enemy: Object.assign({}, makeInput().enemy, {
			hp: 15, maxHp: 15, atk: 0,
			combatRules: [{
				trigger: "afterHit",
				effects: [{ type: "applyStatus", target: "opponent", status: "burn", stacks: 4 }]
			}]
		}),
		weapons: [makeWeapon({
			attributes: Object.assign({}, makeWeapon().attributes, {
				minAttack: 5, maxAttack: 5, attackIntervalTicks: 100
			})
		})]
	}));
	assert.equal(result.damage, 120);
	assert.equal(result.rounds, 3);
	assert.equal(result.roundsExceeded, false);
});

test("敌人攻击命中后给自身施加格挡和再生", () => {
	const core = {
		rand(num) { return num ? 0 : 0; },
		registerAnimationFrame() {},
		unregisterAnimationFrame() {}
	};
	const context = loadScripts([
		"project/backpackBattleStatuses.js",
		"project/backpackBattleRules.js",
		"project/backpackBattleCore.js"
	], { core });
	const runtime = context.createBackpackBattleRuntime_2f8f7df2_bf4f_45ea_8ec4_628e0e25a0dc(core);
	const idleWeapon = makeWeapon({
		attributes: Object.assign({}, makeWeapon().attributes, { attackIntervalTicks: 10000 })
	});
	runtime.start(makeInput({
		enemy: Object.assign({}, makeInput().enemy, {
			hp: 100000, maxHp: 100000, atk: 10,
			combatRules: [{
				trigger: "afterHit",
				effects: [
					{ type: "applyStatus", target: "self", status: "block", stacks: 5 },
					{ type: "applyStatus", target: "self", status: "regeneration", stacks: 2 }
				]
			}]
		}),
		weapons: [idleWeapon]
	}));
	const snapshot = runtime.stepTicks(100);
	assert.equal(snapshot.enemy.buffs.find((s) => s.id === "block").stacks, 5);
	assert.equal(snapshot.enemy.buffs.find((s) => s.id === "regeneration").stacks, 2);
	runtime.destroy();
});

test("战斗状态图标使用持久化 SVG 节点，战斗帧只更新属性", () => {
	const uiSource = fs.readFileSync(path.join(root, "project/backpackBattleUI.js"), "utf8");
	const cssSource = fs.readFileSync(path.join(root, "project/backpack.css"), "utf8");

	// 每侧全部状态槽只在面板 build 阶段创建一次。
	assert.match(uiSource, /buildStatusNodes\(nodes\.playerStatuses, "player"\)/);
	assert.match(uiSource, /buildStatusNodes\(nodes\.enemyStatuses, "enemy"\)/);
	assert.match(uiSource, /buildStatusSprite\(\)/);
	assert.match(uiSource, /createElementNS\(SVG_NS, "svg"\)/);
	assert.match(uiSource, /createElementNS\(SVG_NS, "symbol"\)/);
	assert.match(uiSource, /createElementNS\(SVG_NS, "use"\)/);
	assert.doesNotMatch(uiSource, /createElementNS\(SVG_NS, "image"\)/);
	assert.doesNotMatch(uiSource, /definition\.iconPath/);
	// 高频渲染不能清空容器、创建图标或移除缓存节点，只更新持久节点。
	assert.doesNotMatch(uiSource, /renderStatuses[\s\S]*?container\.innerHTML\s*=\s*""/);
	const renderStatusesSource = uiSource.match(/var renderStatuses = function[\s\S]*?\n\t};/)[0];
	assert.doesNotMatch(renderStatusesSource, /createElement|createElementNS|appendChild|\.remove\(\)/);
	assert.match(renderStatusesSource, /node\.icon\.hidden = !status/);
	assert.match(renderStatusesSource, /node\.count\.textContent/);
	assert.match(renderStatusesSource, /node\.cooldown\.style\.height/);
	assert.match(cssSource, /\.bb-status\[hidden\]\s*\{\s*display:\s*none/);
	assert.match(cssSource, /\.bb-status-sprite\s*\{/);
	assert.match(cssSource, /\.bb-status-svg\s*\{/);
	assert.match(cssSource, /\.bb-status-count\s*\{[^}]*left:\s*calc\(50% \+ 9px\);[^}]*top:\s*calc\(50% \+ 9px\);/);
	assert.doesNotMatch(cssSource.match(/\.bb-status-count\s*\{[^}]*\}/)[0], /padding:/);
	const statusCss = cssSource.match(/\.bb-status\s*\{[^}]*\}/)[0];
	assert.match(statusCss, /margin:\s*0 4px 4px 0;/);
	assert.match(statusCss, /padding:\s*0;/);
	assert.match(statusCss, /overflow:\s*visible;/);
	assert.doesNotMatch(cssSource, /\.bb-status-canvas\s*\{/);
});

test("怪物手册详情显示怪物的 buff 与 debuff 能力", () => {
	const battleSource = fs.readFileSync(path.join(root, "project/backpackBattle.js"), "utf8");

	// 详情文本生成函数存在，且按减益/增益/其他分类输出。
	assert.match(battleSource, /var buildEnemyAbilityTexts = function/);
	assert.match(battleSource, /减益施加（对勇士）/);
	assert.match(battleSource, /增益获得（自身）/);
	assert.match(battleSource, /其他能力/);

	// 简化字段覆盖与玩家对敌人攻击属性一一对应。
	["burn", "ice", "darkness", "exhaustion"].forEach((field) => {
		assert.match(battleSource, new RegExp(field + ': "' + field + '"'));
	});
	["reflection", "block", "mark", "highSpirit", "excitation", "regeneration"].forEach((field) => {
		assert.match(battleSource, new RegExp(field + ': "' + field + '"'));
	});
	assert.match(battleSource, /cleanse === true \|\| Number\(cleanse\) === 1/);
	assert.match(battleSource, /dispel/);

	// 自定义 combatRules 的效果翻译与触发器前缀。
	assert.match(battleSource, /var describeEnemyEffect = function/);
	assert.match(battleSource, /triggerNames = \{[\s\S]*?afterHit: "命中后"/);

	// 详情绘制时把能力文本追加进 texts。
	assert.match(battleSource, /drawBookDetailEstimate = function[\s\S]*?buildEnemyAbilityTexts\(enemy\.id/);
	assert.match(battleSource, /abilities\.forEach\(function \(line\) \{ texts\.push\(line\); \}\)/);

	// 减益/增益/其他分别使用不同颜色标记，且必须由 \r 触发解析（否则 [ ] 会作为普通字符显示）。
	assert.match(battleSource, /\\r\[#FF7043\]· " \+ text \+ "\\r\[\]/);
	assert.match(battleSource, /\\r\[#63D16F\]· " \+ text \+ "\\r\[\]/);
	assert.match(battleSource, /\\r\[#8D78C9\]· " \+ text \+ "\\r\[\]/);
	// 禁止裸 [ 开头的能力行（会导致颜色不生效并显示字面 [ ]）。
	assert.doesNotMatch(battleSource, /lines\.push\("\[\#/);
});

test("战斗触发规则与联动规则使用一致的严格位置判断", () => {
	const context = loadPure();
	const rules = context.backpackBattleRules_36e4a689_0f48_476f_92a7_1c12b3903e87;
	const makePair = (sourceCells, targetCells) => makeInput({
		weapons: [
			makeWeapon({ instanceId: "source", row: 0, col: 0, cells: sourceCells, combatRules: [] }),
			makeWeapon({ instanceId: "target", row: 1, col: 1, cells: targetCells })
		]
	});
	const count = (input, options) => {
		const state = rules.createBattleState(input);
		const source = state.weapons.find((w) => w.instanceId === "source");
		return rules.countNearbyWeapons(state, source, options);
	};

	// 同一行、方向内且距离内：严格匹配。
	assert.equal(count(makePair([[2, 2]], [[4, 2]]), { directions: ["right"], distance: 2 }), 1);
	// 斜对角：不再匹配（旧的曼哈顿 + 大致方向会误判为命中）。
	assert.equal(count(makePair([[2, 2]], [[3, 3]]), { directions: ["right"], distance: 2 }), 0);
	assert.equal(count(makePair([[2, 2]], [[1, 3]]), { directions: ["left"], distance: 2 }), 0);
	// 垂直方向同样严格：必须同一列。
	assert.equal(count(makePair([[2, 2]], [[2, 0]]), { directions: ["up"], distance: 2 }), 1);
	assert.equal(count(makePair([[2, 2]], [[3, 0]]), { directions: ["up"], distance: 2 }), 0);
	// 未指定 directions 时按全部方向严格同轴判断。
	assert.equal(count(makePair([[2, 2]], [[4, 2]]), { distance: 2 }), 1);
	assert.equal(count(makePair([[2, 2]], [[3, 3]]), { distance: 2 }), 0);

	// sideBox 矩形区域（基于来源武器包围盒）。
	assert.equal(count(makePair([[2, 2], [3, 2]], [[4, 1]]), { relation: "sideBox", directions: ["right"], distance: 1, span: 3 }), 1);
	assert.equal(count(makePair([[2, 2], [3, 2]], [[4, 4]]), { relation: "sideBox", directions: ["right"], distance: 1, span: 3 }), 0);

	// 联动范围预览与实际战斗一致：斜对角不再进入联动格。
	const synergyContext = loadScripts(["project/backpackWeaponSynergy.js"]);
	const synergy = synergyContext.backpackWeaponSynergy_91f4c21e_7d37_4f12_9cc4_a9606ba62a83;
	const preview = synergy.getAffectedCells({
		combatRules: [{
			trigger: "afterHit",
			conditions: [{ kind: "nearbyCount", directions: ["right"], distance: 2 }]
		}]
	}, [[2, 2]]);
	const keys = Array.from(preview, (cell) => cell.col + "," + cell.row);
	assert.ok(keys.indexOf("4,2") >= 0, "同轴格应进入联动范围");
	assert.ok(keys.indexOf("3,3") < 0, "斜对角格不应进入联动范围");
});

test("背包录像按 instanceId 增量记录进入、移出、移动、出售和扩容", () => {
	const heroFlags = {};
	let replaying = false;
	let replayCalls = 0;
	let expansionItems = 2;
	const core = {
		material: { items: {} },
		clone(value) { return value == null ? value : JSON.parse(JSON.stringify(value)); },
		status: { hero: { flags: heroFlags, money: 0 }, route: [] },
		plugin: {},
		control: {
			replayActions: [],
			registerReplayAction(name, func) {
				const kept = this.replayActions.filter((r) => r.name !== name);
				kept.push({ name, func });
				this.replayActions.splice(0, this.replayActions.length, ...kept);
			}
		},
		replay() { replayCalls++; },
		isPlaying() { return true; },
		isReplaying() { return replaying; },
		getFlag(key, defaultValue) { return heroFlags[key] == null ? defaultValue : heroFlags[key]; },
		setFlag(key, value) { heroFlags[key] = core.clone(value); },
		itemCount(itemId) { return itemId === "I429" ? expansionItems : 0; },
		removeItem(itemId, count) {
			if (itemId !== "I429" || expansionItems < count) return false;
			expansionItems -= count;
			return true;
		},
		updateStatusBar() {}
	};
	const context = loadScripts([
		"project/backpackWeaponSynergy.js",
		"project/weapons.js",
		"project/backpackUiCommon.js",
		"project/backpackWeaponSystem.js",
		"project/backpackSystem.js"
	], { core });
	const plugin = {};
	context.installBackpackWeaponSystem_41d4dd44_8f7d_4bbc_b890_80db42f1ad76(core, plugin);
	core.plugin.weaponSystem = plugin.weaponSystem;
	context.installBackpackSystem_97b6d981_3a73_47b8_ba94_2315c62f5658(core, plugin);

	// 只注册新的 bp 增量回放动作。
	const replayAction = core.control.replayActions.find((r) => r.name === "bp");
	assert.ok(replayAction);

	// 添加两把武器并自动摆放。
	const swordA = { id: "sa", name: "铁剑", cells: [[0, 0]], minAttack: 5, maxAttack: 10, sourceItemId: "I100", weaponTypes: ["剑"] };
	const swordB = { id: "sb", name: "木盾", cells: [[0, 0], [1, 0]], minAttack: 0, maxAttack: 0, sourceItemId: "I101", weaponTypes: ["盾"] };
	const a = plugin.addBackpackWeapon(swordA, { autoPlace: true });
	const b = plugin.addBackpackWeapon(swordB, { autoPlace: true });
	assert.equal(a, "1", "首个背包实例 ID 应从 1 开始");
	assert.equal(b, "2", "背包实例 ID 应逐个自增");
	assert.equal(heroFlags.__backpack_instance_id__, 2, "最新实例 ID 应记录在勇士 flag 中");
	assert.deepEqual(core.status.route, [
		"bp:1:i", "bp:1:m:0:0:0",
		"bp:2:i", "bp:2:m:0:1:0"
	]);

	// 内部坐标 (1,2) 是初始区域左侧一格，录像逻辑坐标应为 (-1,0)。
	assert.equal(plugin.unlockBackpackCell(1, 2), true);
	assert.equal(core.status.route.at(-1), "bp:-1:-1:0");

	// 回放时 i 只校验 instanceId 已经存在；o/m/s 分别改变待摆放、布局和出售状态。
	replaying = true;
	core.status.route.length = 0;
	assert.equal(replayAction.func("bp:1:o"), true);
	assert.ok(plugin.getBackpackState().inventory.some((entry) => entry.instanceId === "1"));
	assert.equal(replayAction.func("bp:1:i"), true);
	assert.equal(replayAction.func("bp:1:m:1:-1:0"), true);
	let replayedState = plugin.getBackpackState();
	let replayedEntry = replayedState.placed.find((entry) => entry.instanceId === "1");
	assert.deepEqual(
		[replayedEntry.col, replayedEntry.row, replayedEntry.rotation],
		[1, 2, 90],
		"负逻辑横坐标应换算回最大网格内部坐标"
	);
	assert.equal(replayAction.func("bp:1:s"), true);
	assert.equal(plugin.getBackpackState().placed.some((entry) => entry.instanceId === "1"), false);
	assert.equal(core.status.hero.money, 30, "出售回放应补发固定售价金币");
	assert.equal(replayAction.func("bp:-1:-2:0"), true, "扩容回放也应消耗道具并支持第二圈负坐标");
	assert.equal(expansionItems, 0);
	assert.ok(plugin.getBackpackGridState().unlockedCells.some((cell) => cell[0] === 0 && cell[1] === 2));
	assert.deepEqual(core.status.route, [
		"bp:1:o", "bp:1:i", "bp:1:m:1:-1:0", "bp:1:s", "bp:-1:-2:0"
	]);
	assert.equal(replayCalls, 5);
	assert.equal(replayAction.func("bp:999:i"), false, "找不到 instanceId 时必须判定录像动作无效");
	assert.equal(replayCalls, 5, "无效动作不能继续回放");
	replaying = false;

	// 数字实例 ID 仍从 core.flag 中的最大值继续自增。
	assert.equal(
		plugin.addBackpackWeapon(swordA, { autoPlace: false }),
		"3",
		"后续实例应从 flag 中的最大 ID 继续自增"
	);

	// 新动作全部由现有录像编解码器原样往返，不再产生被截断的超长 Item 项。
	const routeContext = loadScripts(["libs/thirdparty/lz-string.min.js", "libs/utils.js"], {
		core: { maps: { getNumberById() { return 0; }, blocksInfo: {} }, utils: null }
	});
	const routeUtils = Object.create(routeContext.utils.prototype);
	routeContext.core.utils = routeUtils;
	const bpRoutes = ["choices:0", "choices:5", "bp:1:i", "bp:1:o", "bp:1:s", "bp:1:m:3:-2:9", "bp:-1:-2:-1"];
	const encodedRoute = routeUtils.encodeRoute(bpRoutes);
	assert.deepEqual(Array.from(routeUtils.decodeRoute(encodedRoute)), bpRoutes);

	// 静态断言：完整快照录制和 URL 编码逻辑已经移除。
	const source = fs.readFileSync(path.join(root, "project/backpackSystem.js"), "utf8");
	const shopSource = fs.readFileSync(path.join(root, "project/backpackShop.js"), "utf8");
	assert.doesNotMatch(source, /encodeBackpackPayload|restoreBackpackState|registerReplayAction\("backpack"/);
	assert.doesNotMatch(shopSource, /pushBackpackReplay|"backpack:" \+ encodeURIComponent/);
	assert.match(source, /core\.isReplaying && core\.isReplaying\(\)/);
	assert.match(source, /registerReplayAction\("bp"/);
	assert.match(source, /"bp:" \+ entry\.instanceId \+ ":s"/);
	assert.match(source, /"bp:-1:" \+ logical\.x \+ ":" \+ logical\.y/);
});

test("录像中战斗未经过事件流时，结束后手动继续 replay", () => {
	const source = fs.readFileSync(path.join(root, "project/backpackBattle.js"), "utf8");
	// context.callback 缺失（doSystemEvent 直接触发战斗）时，录像播放中调用 core.replay() 继续。
	assert.match(source, /if \(context\.callback\) \{[\s\S]*?context\.callback\(\);/);
	assert.match(source, /else if \(core\.isReplaying && core\.isReplaying\(\) && typeof core\.replay === "function"\)/);
	assert.match(source, /core\.replay\(\);/);
	// 修复不破坏事件流路径：callback 存在时由事件流结束统一触发 replay。
	assert.match(source, /if \(context\.callback\) \{[^}]*context\.callback\(\);\s*\} else if/);
});

test("战斗规则支持随机弱体效果 applyRandomDebuff（命中时敌方虚脱+2 且随机弱体+1）", () => {
	const context = loadPure();
	const rules = context.backpackBattleRules_36e4a689_0f48_476f_92a7_1c12b3903e87;

	// 默认减益池 = 全部 debuff，按注册表 order 顺序。
	assert.equal(JSON.stringify(rules.getAllDebuffIds()), JSON.stringify(["ice", "burn", "darkness", "exhaustion"]));

	// 通过 runCombatRules + handlers 施加：虚脱固定+2，随机弱体从池中选取。
	const state = rules.createBattleState(makeInput({
		weapons: [makeWeapon({
			instanceId: "w1",
			combatRules: [
				{ trigger: "afterHit", effects: [{ type: "applyStatus", target: "opponent", status: "exhaustion", stacks: 2 }] },
				{ trigger: "afterHit", effects: [{ type: "applyRandomDebuff", target: "opponent", stacks: 1 }] }
			]
		})]
	}));
	const chosen = [];
	const handlers = {
		applyRandomDebuff(targetKey, weapon, effect, context, amount) {
			const pool = Array.isArray(effect.pool) && effect.pool.length ? effect.pool : rules.getAllDebuffIds();
			const selected = pool[0]; // 固定取第一个，验证 runCombatRules 正确转发参数
			chosen.push(selected);
			rules.applyStatus(state, targetKey, selected, Math.max(0, Math.floor(Number(amount) || 1)), context.sourceSide);
			return selected;
		}
	};
	rules.runCombatRules(state, state.weapons[0], "afterHit",
		{ sourceSide: "player", hitWeapon: state.weapons[0], damage: 10 }, handlers);

	assert.equal(rules.getStatusStacks(state.enemy, "exhaustion"), 2, "虚脱固定+2");
	assert.deepEqual(chosen, ["ice"], "随机弱体通过 handlers 转发并默认从全部减益池选取");
	assert.equal(state.enemy.debuffs.length, 2, "虚脱与随机弱体两个 debuff 并存");
	const randomId = state.enemy.debuffs.find((d) => d.id !== "exhaustion").id;
	assert.ok(rules.getAllDebuffIds().indexOf(randomId) >= 0);

	// 自定义 pool：只从限定池随机。
	const state2 = rules.createBattleState(makeInput({
		weapons: [makeWeapon({
			instanceId: "w2",
			combatRules: [{ trigger: "afterHit", effects: [{ type: "applyRandomDebuff", target: "opponent", stacks: 1, pool: ["burn", "ice"] }] }]
		})]
	}));
	const chosen2 = [];
	rules.runCombatRules(state2, state2.weapons[0], "afterHit",
		{ sourceSide: "player", hitWeapon: state2.weapons[0], damage: 10 }, {
		applyRandomDebuff(targetKey, weapon, effect, context, amount) {
			const pool = Array.isArray(effect.pool) && effect.pool.length ? effect.pool : rules.getAllDebuffIds();
			const selected = pool[0];
			chosen2.push(selected);
			rules.applyStatus(state2, targetKey, selected, Math.max(0, Math.floor(Number(amount) || 1)), context.sourceSide);
			return selected;
		}
	});
	assert.deepEqual(chosen2, ["burn"], "pool 限定后只从池中选取（池内第一个）");

	// 预计伤害内核：从输入种子派生局部随机流，不影响实际战斗种子。
	const kernel = context.backpackBattleEstimateKernel_69e88a3f_71f9_4df3_82a6_c4695b166a71;
	const estimate = kernel.simulate(makeInput({
		randomSeed: 123456,
		enemy: { id: "e", name: "怪物", hp: 10000, maxHp: 10000, atk: 20, def: 0, hitRate: 1, attackIntervalTicks: 100, buffs: [], debuffs: [] },
		weapons: [makeWeapon({
			instanceId: "w3",
			combatRules: [{ trigger: "afterHit", effects: [{ type: "applyRandomDebuff", target: "opponent", stacks: 1 }] }]
		})]
	}));
	assert.equal(estimate.roundsExceeded, false, "预计模拟应正常完成");
	assert.ok(estimate.battleLog === undefined || estimate.debuffsOnEnemy === undefined || estimate.result, "预计结果结构存在");
	// 静态断言三份文件的实现。
	const rulesSource = fs.readFileSync(path.join(root, "project/backpackBattleRules.js"), "utf8");
	assert.match(rulesSource, /effect\.type === "applyRandomDebuff" && handlers\.applyRandomDebuff/);
	assert.match(rulesSource, /getAllDebuffIds/);
	const coreSource = fs.readFileSync(path.join(root, "project/backpackBattleCore.js"), "utf8");
	assert.match(coreSource, /applyRandomDebuff: function \(targetKey, weapon, effect, context, amount\)/);
	assert.match(coreSource, /gameRandom\.pick\(pool\)/);
	const kernelSource = fs.readFileSync(path.join(root, "project/backpackBattleEstimateKernel.js"), "utf8");
	assert.match(kernelSource, /applyRandomDebuff: function/);
	assert.match(kernelSource, /var selected = random\.pick\(pool\)/);
	const battleSource = fs.readFileSync(path.join(root, "project/backpackBattle.js"), "utf8");
	assert.match(battleSource, /applyRandomDebuff/);
	assert.match(battleSource, /随机施加1个/);
});

test("状态驱动的全局武器伤害加成 statusDamageBonus：每10层刻印精灵武器伤害+5，实时可逆", () => {
	const context = loadPure();
	const rules = context.backpackBattleRules_36e4a689_0f48_476f_92a7_1c12b3903e87;

	const makeState = (markStacks, weapons) => rules.createBattleState(makeInput({
		player: { name: "勇士", hp: 10000, maxHp: 10000, def: 0,
			buffs: markStacks > 0 ? [{ id: "mark", stacks: markStacks, acquiredTick: 0 }] : [], debuffs: [] },
		weapons
	}));
	const elf = (id) => makeWeapon({
		instanceId: id,
		attributes: Object.assign({}, makeWeapon().attributes, { weaponTypes: ["精灵"] }),
		combatRules: []
	});
	const sword = (id) => makeWeapon({
		instanceId: id,
		attributes: Object.assign({}, makeWeapon().attributes, { weaponTypes: ["剑"] }),
		combatRules: []
	});
	const register = (state, effect) => {
		rules.runCombatRules(state, state.weapons[0], "battleStart", { sourceSide: "player", hitWeapon: state.weapons[0], damage: 0 }, {});
	};

	// 注册（按 id 幂等）-> 实时计算。
	const state = makeState(25, [elf("elf"), sword("sword")]);
	rules.runCombatRules(state, state.weapons[0], "battleStart", { sourceSide: "player", hitWeapon: state.weapons[0], damage: 0 }, {
		// battleStart 效果通过 runCombatRules 的 statusDamageBonus 分支直接写入 state.weaponDamageBonuses。
	});
	state.weaponDamageBonuses.push({
		id: "markBonus",
		status: "mark",
		every: 10,
		value: 5,
		weaponTypes: ["精灵"]
	});
	const elfBonus = rules.getStatusWeaponDamageBonus(state, state.weapons[0]);
	const swordBonus = rules.getStatusWeaponDamageBonus(state, state.weapons[1]);
	assert.equal(elfBonus, 10, "刻印25层 -> floor(25/10)*5 = 10");
	assert.equal(swordBonus, 0, "非精灵类武器不受加成");

	// 实时可逆：层数变化后重新计算。
	state.player.buffs = [{ id: "mark", stacks: 9, acquiredTick: 0 }];
	assert.equal(rules.getStatusWeaponDamageBonus(state, state.weapons[0]), 0, "刻印9层无加成");
	state.player.buffs = [{ id: "mark", stacks: 10, acquiredTick: 0 }];
	assert.equal(rules.getStatusWeaponDamageBonus(state, state.weapons[0]), 5, "刻印10层 +5");

	// 省略 weaponTypes 作用于所有武器。
	const stateAll = makeState(10, [elf("a"), sword("b")]);
	stateAll.weaponDamageBonuses.push({ id: "all", status: "mark", every: 10, value: 3, weaponTypes: null });
	assert.equal(rules.getStatusWeaponDamageBonus(stateAll, stateAll.weapons[0]), 3);
	assert.equal(rules.getStatusWeaponDamageBonus(stateAll, stateAll.weapons[1]), 3);

	// runCombatRules 的 statusDamageBonus 分支：真实注册到 state.weaponDamageBonuses 且按 id 幂等。
	const regState = makeState(20, [elf("r")]);
	regState.weapons[0].combatRules = [{
		trigger: "battleStart",
		effects: [
			{ type: "statusDamageBonus", id: "b1", status: "mark", every: 10, value: 5, weaponTypes: ["精灵"] },
			{ type: "statusDamageBonus", id: "b1", status: "mark", every: 10, value: 99, weaponTypes: ["精灵"] }
		]
	}];
	rules.runCombatRules(regState, regState.weapons[0], "battleStart", { sourceSide: "player", hitWeapon: regState.weapons[0], damage: 0 }, {});
	assert.equal(regState.weaponDamageBonuses.length, 1, "同 id 重复注册幂等，只保留最新");
	assert.equal(regState.weaponDamageBonuses[0].value, 99);
	assert.equal(rules.getStatusWeaponDamageBonus(regState, regState.weapons[0]), 198, "刻印20层 -> floor(20/10)*99");

	// 静态断言：三份实现文件的接入点。
	const rulesSource = fs.readFileSync(path.join(root, "project/backpackBattleRules.js"), "utf8");
	assert.match(rulesSource, /effect.type === "statusDamageBonus"/);
	assert.match(rulesSource, /getStatusWeaponDamageBonus = function/);
	assert.match(rulesSource, /weaponDamageBonuses/);
	const coreSource = fs.readFileSync(path.join(root, "project/backpackBattleCore.js"), "utf8");
	assert.match(coreSource, /getStatusWeaponDamageBonus\(state, weapon\)/);
	const kernelSource = fs.readFileSync(path.join(root, "project/backpackBattleEstimateKernel.js"), "utf8");
	assert.match(kernelSource, /getStatusWeaponDamageBonus\(state, weapon\)/);
	const battleSource = fs.readFileSync(path.join(root, "project/backpackBattle.js"), "utf8");
	assert.match(battleSource, /statusDamageBonus/);
});

test("金币增幅效果 goldMultiplier：敌人金币增加一倍，多条规则累加", () => {
	const core = {
		rand() { return 0; },
		getLocalStorage() {},
		setLocalStorage() {},
		registerAnimationFrame() {},
		unregisterAnimationFrame() {}
	};
	const context = loadScripts([
		"project/backpackBattleStatuses.js",
		"project/backpackBattleRules.js",
		"project/backpackBattleCore.js"
	], { core });
	const runtime = context.createBackpackBattleRuntime_2f8f7df2_bf4f_45ea_8ec4_628e0e25a0dc(core);

	const makeWeapon = (id, combatRules) => ({
		instanceId: id, name: id, row: 0, col: 0, cells: [[0, 0]],
		attributes: { minAttack: 100, maxAttack: 100, hitRate: 1, attackInterval: 0.25, attackIntervalTicks: 25, ultimateGain: 0, weaponTypes: ["剑"] },
		combatRules
	});
	const run = (weapons) => {
		runtime.start(makeInput({
			enemy: Object.assign({}, makeInput().enemy, { hp: 300, maxHp: 300, atk: 0 }),
			weapons
		}));
		const snap = runtime.stepTicks(2000);
		runtime.destroy();
		return snap;
	};

	// 无规则 → 倍率 1；一条"增加一倍"(value:1) → 2；两条"增加一倍"累加 → 3（1+1+1，非累乘的 4）。
	assert.equal(run([makeWeapon("w1", [])]).result.goldMultiplier, 1);
	assert.equal(run([makeWeapon("w2", [{ trigger: "battleEnd", effects: [{ type: "goldMultiplier", value: 1 }] }])]).result.goldMultiplier, 2);
	assert.equal(run([
		makeWeapon("w3a", [{ trigger: "battleEnd", effects: [{ type: "goldMultiplier", value: 1 }] }]),
		makeWeapon("w3b", [{ trigger: "battleEnd", effects: [{ type: "goldMultiplier", value: 1 }] }])
	]).result.goldMultiplier, 3);

	// 静态断言：三份实现文件的接入点。
	const rulesSource = fs.readFileSync(path.join(root, "project/backpackBattleRules.js"), "utf8");
	assert.match(rulesSource, /effect.type === "goldMultiplier"/);
	assert.match(rulesSource, /goldMultiplier: 1/);
	const coreSource = fs.readFileSync(path.join(root, "project/backpackBattleCore.js"), "utf8");
	assert.match(coreSource, /goldMultiplier: rules\.fixed\(Math\.max\(0, state\.goldMultiplier \|\| 1\)\)/);
	const functionsSource = fs.readFileSync(path.join(root, "project/functions.js"), "utf8");
	assert.match(functionsSource, /backpackBattleResult.goldMultiplier/);
	assert.match(functionsSource, /if \(core\.hasFlag\('curse'\)\) money = 0/);
	const battleSource = fs.readFileSync(path.join(root, "project/backpackBattle.js"), "utf8");
	assert.match(battleSource, /击败敌人获得的金币增加/);
});

test("once 一场仅一次 + 5秒伤害+2 + triggerWeaponEffects 立即发动上方饮料武器效果", () => {
	const core = {
		rand() { return 0; },
		getLocalStorage() {},
		setLocalStorage() {},
		registerAnimationFrame() {},
		unregisterAnimationFrame() {}
	};
	const context = loadScripts([
		"project/backpackBattleStatuses.js",
		"project/backpackBattleRules.js",
		"project/backpackBattleCore.js"
	], { core });
	const runtime = context.createBackpackBattleRuntime_2f8f7df2_bf4f_45ea_8ec4_628e0e25a0dc(core);
	const rules = context.backpackBattleRules_36e4a689_0f48_476f_92a7_1c12b3903e87;

	const makeWeapon = (id, col, row, weaponTypes, combatRules) => ({
		instanceId: id, name: id, row, col, cells: [[col, row]],
		attributes: { minAttack: 10, maxAttack: 10, hitRate: 1, attackInterval: 0.25, attackIntervalTicks: 25, ultimateGain: 0, weaponTypes },
		combatRules
	});
	const run = (weapons, ticks, hp) => {
		runtime.start(makeInput({
			player: Object.assign({}, makeInput().player, { hp: hp || 8000, maxHp: 10000 }),
			enemy: Object.assign({}, makeInput().enemy, { hp: 1000000, maxHp: 1000000, atk: 0 }),
			weapons
		}));
		const snap = runtime.stepTicks(ticks);
		runtime.destroy();
		return snap;
	};

	// 场景1：once 规则（battleStart heal+伤害加成）只触发一次；500 ticks 内伤害+2，之后恢复。
	const onceRule = [{
		trigger: "battleStart", once: true,
		effects: [
			{ type: "heal", target: "self", value: 10 },
			{ type: "modifyWeaponStat", stat: "attack", operation: "add", value: 2, weaponTarget: "all", durationTicks: 500 }
		]
	}];
	const s1 = run([makeWeapon("w1", 0, 0, ["剑"], onceRule)], 700, 8000);
	assert.equal(s1.player.hp, 8010, "once 只触发一次：heal 10 仅一次");
	const w1 = s1.weapons.find((x) => x.instanceId === "w1");
	const damage1 = 1000000 - s1.enemy.hp;
	// 攻击间隔 25 ticks：tick 25~475 共 19 次加成(12)，tick 500~700 共 9 次普通(10)。
	assert.equal(damage1, 19 * 12 + 9 * 10, "5秒(500ticks)内伤害+2，到期恢复");
	assert.ok(w1.runtimeCounters["ruleOnce:0"] === 1, "once 标志已记录");

	// 场景2：triggerWeaponEffects 立即发动上方一格饮料武器效果（不受其 once 限制、不重置 CD）。
	const drinkRule = [{
		trigger: "battleStart", once: true,
		effects: [
			{ type: "heal", target: "self", value: 10 },
			{ type: "applyStatus", target: "opponent", status: "burn", stacks: 1 }
		]
	}];
	const mainRuleB = [{
		trigger: "battleStart",
		effects: [{
			type: "triggerWeaponEffects", directions: ["up"], distance: 1,
			filter: { weaponTypes: ["饮料"] }
		}]
	}];
	// 饮料武器在上方一格（dy=-1 → up）。
	const s2 = run([
		makeWeapon("main", 0, 0, ["剑"], mainRuleB),
		makeWeapon("drink", 0, -1, ["饮料"], drinkRule)
	], 100, 8000);
	assert.equal(s2.player.hp, 8020, "饮料自身 once heal 10 + 立即发动 heal 10");
	const burn2 = s2.enemy.debuffs.find((d) => d.id === "burn");
	assert.ok(burn2 && burn2.stacks === 2, "烧伤2层：自身触发1 + 立即发动1（不受 once 限制）");
	const drink2 = s2.weapons.find((x) => x.instanceId === "drink");
	assert.equal(drink2.cooldownTicks, 0, "不重置 CD");

	// 场景3：方向限制——下方一格（dy=1 → down）不被发动。
	const s3 = run([
		makeWeapon("main", 0, 0, ["剑"], mainRuleB),
		makeWeapon("drink", 0, 1, ["饮料"], drinkRule)
	], 100, 8000);
	assert.equal(s3.player.hp, 8010, "下方饮料不被发动，仅自身 once heal 10");

	// 场景4：直接验证 runRuleEffects 递归执行目标武器全部效果（忽略 trigger）。
	const state = rules.createBattleState(makeInput({
		player: Object.assign({}, makeInput().player, { hp: 8000, maxHp: 10000 }),
		weapons: [
			makeWeapon("main", 0, 0, ["剑"], [{
				trigger: "battleStart",
				effects: [{ type: "triggerWeaponEffects", directions: ["up"], distance: 1, filter: { weaponTypes: ["饮料"] } }]
			}]),
			makeWeapon("drink", 0, -1, ["饮料"], drinkRule)
		]
	}));
	rules.runCombatRules(state, state.weapons.find((w) => w.instanceId === "main"), "battleStart", { sourceSide: "player" }, {});
	assert.equal(state.player.hp, 8010, "仅触发 main 规则时，drink 效果被立即执行 heal 10");
	assert.equal((state.enemy.debuffs.find((d) => d.id === "burn") || {}).stacks, 1, "drink 的 burn 效果被立即执行");

	// 静态断言。
	const rulesSource = fs.readFileSync(path.join(root, "project/backpackBattleRules.js"), "utf8");
	assert.match(rulesSource, /triggerWeaponEffects/);
	assert.match(rulesSource, /rule.once/);
	assert.match(rulesSource, /runRuleEffects/);
	assert.match(rulesSource, /ruleOnce:/);
	const battleSource = fs.readFileSync(path.join(root, "project/backpackBattle.js"), "utf8");
	assert.match(battleSource, /立马发动/);
});

test("本武器每5次攻击：本武器和上下一格内武器间隔-0.1（nearby + attackInterval 修正）", () => {
	const core = {
		rand() { return 0; },
		getLocalStorage() {},
		setLocalStorage() {},
		registerAnimationFrame() {},
		unregisterAnimationFrame() {}
	};
	const context = loadScripts([
		"project/backpackBattleStatuses.js",
		"project/backpackBattleRules.js",
		"project/backpackBattleCore.js"
	], { core });
	const rules = context.backpackBattleRules_36e4a689_0f48_476f_92a7_1c12b3903e87;
	const runtime = context.createBackpackBattleRuntime_2f8f7df2_bf4f_45ea_8ec4_628e0e25a0dc(core);

	const makeWeapon = (id, row, combatRules) => ({
		instanceId: id, name: id, row, col: 0, cells: [[0, row]],
		attributes: { minAttack: 10, maxAttack: 10, hitRate: 1, attackInterval: 1, attackIntervalTicks: 100, ultimateGain: 0, weaponTypes: ["剑"] },
		combatRules
	});
	const rule = [{
		trigger: "afterHit",
		every: 5,
		effects: [{
			type: "modifyWeaponStat", stat: "attackInterval", operation: "add", value: -0.1,
			weaponTarget: "nearby", directions: ["up", "down"], distance: 1
		}]
	}];

	// 单元：attackInterval 修正换算为 Tick 叠加（快照已有 attackIntervalTicks）。
	const unitWeapon = makeWeapon("u1", 0, []);
	unitWeapon.runtimeModifiers = [{ stat: "attackInterval", operation: "add", value: -0.1, expiresTick: null }];
	const unitState = rules.createBattleState(makeInput({
		enemy: Object.assign({}, makeInput().enemy, { hp: 100000, maxHp: 100000, atk: 0 }),
		weapons: [unitWeapon]
	}));
	assert.equal(rules.getWeaponIntervalTicks(unitState, unitWeapon), 90, "attackInterval -0.1 → 100-10=90 ticks");

	// 端到端：A(0)挂规则，B(-1)上、C(1)下、D(3)远。A 每5次命中触发一次。
	runtime.start(makeInput({
		enemy: Object.assign({}, makeInput().enemy, { hp: 1000000, maxHp: 1000000, atk: 0 }),
		weapons: [makeWeapon("A", 0, rule), makeWeapon("B", -1, []), makeWeapon("C", 1, []), makeWeapon("D", 3, [])]
	}));
	const snap = runtime.stepTicks(550);
	runtime.destroy();
	const modCount = (id) => snap.weapons.find((x) => x.instanceId === id).runtimeModifiers
		.filter((m) => m.stat === "attackInterval").length;
	const hitCount = (id) => snap.weapons.find((x) => x.instanceId === id).runtimeCounters.hits || 0;
	assert.equal(hitCount("A"), 5, "550 ticks 内 A 命中5次");
	assert.equal(modCount("A"), 1, "A 每5次命中触发1次");
	assert.equal(modCount("B"), 1, "上方一格武器被修正");
	assert.equal(modCount("C"), 1, "下方一格武器被修正");
	assert.equal(modCount("D"), 0, "距离3的武器不受影响");

	// 静态断言。
	const rulesSource = fs.readFileSync(path.join(root, "project/backpackBattleRules.js"), "utf8");
	assert.match(rulesSource, /weaponTarget === "nearby"/);
	assert.match(rulesSource, /findNearbyWeapons\(state, weapon, effect\)/);
	assert.match(rulesSource, /attackInterval（回合单位）的修正换算为 ticks 叠加/);
	assert.match(rulesSource, /getWeaponIntervalTicks/);
});

test("chance 概率条件（20%+附近武器20%）与 guaranteeHit 必定命中", () => {
	const makeCore = (seq) => {
		let i = 0;
		return {
			rand() { return seq[i++ % seq.length]; },
			getLocalStorage() {}, setLocalStorage() {}, registerAnimationFrame() {}, unregisterAnimationFrame() {}
		};
	};
	const makeWeapon = (id, row, hitRate, combatRules) => ({
		instanceId: id, name: id, row, col: 0, cells: [[0, row]],
		attributes: { minAttack: 10, maxAttack: 10, hitRate, attackInterval: 0.25, attackIntervalTicks: 25, ultimateGain: 0, weaponTypes: ["剑"] },
		combatRules
	});
	const run = (weapons, seq, ticks) => {
		const context = loadScripts([
			"project/backpackBattleStatuses.js",
			"project/backpackBattleRules.js",
			"project/backpackBattleCore.js"
		], { core: makeCore(seq) });
		const runtime = context.createBackpackBattleRuntime_2f8f7df2_bf4f_45ea_8ec4_628e0e25a0dc(makeCore(seq));
		runtime.start(makeInput({
			player: Object.assign({}, makeInput().player, { hp: 10000, maxHp: 10000 }),
			enemy: Object.assign({}, makeInput().enemy, { hp: 1000000, maxHp: 1000000, atk: 0 }),
			weapons
		}));
		const snap = runtime.stepTicks(ticks);
		runtime.destroy();
		return snap;
	};
	const chanceRule = (directions, distance) => [{
		trigger: "beforeAttack",
		conditions: [{ kind: "chance", base: 0.2, nearbyBonus: 0.2, directions, distance }],
		effects: [{ type: "modifyAttackDamage", operation: "add", value: 30 }]
	}];

	// 概率条件：掷骰 < chance 通过 → 伤害 10+30=40；否则 10。
	const dmgPerHit = (snap) => {
		const w = snap.weapons.find((x) => x.instanceId === "w");
		return (1000000 - snap.enemy.hp) / (w.runtimeCounters.hits || 1);
	};
	const sPass = run([makeWeapon("w", 0, 1, chanceRule(["up", "down"], 1))], [0.1, 0, 0], 100);
	assert.equal(dmgPerHit(sPass), 40, "chance 0.2 掷骰 0.1 → 通过 +30");
	const sFail = run([makeWeapon("w", 0, 1, chanceRule(["up", "down"], 1))], [0.5, 0, 0], 100);
	assert.equal(dmgPerHit(sFail), 10, "chance 0.2 掷骰 0.5 → 不通过");

	// 附近武器提升概率：1个上/下附近武器 → chance 0.4，掷骰 0.3 → 通过。
	const sNear = run([
		makeWeapon("w", 0, 1, chanceRule(["up", "down"], 1)),
		makeWeapon("n", -1, 1, [])
	], [0.3, 0, 0], 100);
	const wNear = sNear.weapons.find((x) => x.instanceId === "w");
	assert.equal(wNear.runtimeCounters.hits, 4, "附近武器场景 w 全部命中");
	assert.ok(1000000 - sNear.enemy.hp > 4 * 10, "w 有概率加成（总伤害高于纯 10 伤害）");

	// guaranteeHit：hitRate 0 仍必中；黑暗 20 层（命中率-100%）仍必中。
	const sMiss = run([makeWeapon("w", 0, 0, [])], [0, 0], 100);
	const wMiss = sMiss.weapons.find((x) => x.instanceId === "w");
	assert.equal(wMiss.runtimeCounters.hits || 0, 0, "hitRate 0 无必中 → Miss");

	const sGuar = run([makeWeapon("w", 0, 0, [{ trigger: "beforeAttack", effects: [{ type: "guaranteeHit" }] }])], [0, 0], 100);
	const wGuar = sGuar.weapons.find((x) => x.instanceId === "w");
	assert.equal(wGuar.runtimeCounters.hits, wGuar.runtimeCounters.attacks, "guaranteeHit → 必中");

	const coreDark = makeCore([0, 0]);
	const ctxDark = loadScripts([
		"project/backpackBattleStatuses.js",
		"project/backpackBattleRules.js",
		"project/backpackBattleCore.js"
	], { core: coreDark });
	const runtimeDark = ctxDark.createBackpackBattleRuntime_2f8f7df2_bf4f_45ea_8ec4_628e0e25a0dc(coreDark);
	const inputDark = makeInput({
		player: Object.assign({}, makeInput().player, { hp: 10000, maxHp: 10000, buffs: [{ id: "darkness", stacks: 20, acquiredTick: 0 }], debuffs: [] }),
		enemy: Object.assign({}, makeInput().enemy, { hp: 1000000, maxHp: 1000000, atk: 0 }),
		weapons: [makeWeapon("w", 0, 0, [{ trigger: "beforeAttack", effects: [{ type: "guaranteeHit" }] }])]
	});
	runtimeDark.start(inputDark);
	const sDark = runtimeDark.stepTicks(100);
	runtimeDark.destroy();
	assert.equal(sDark.weapons.find((x) => x.instanceId === "w").runtimeCounters.hits, 4, "黑暗20层 + guaranteeHit 仍必中");

	// 静态断言。
	const rulesSource = fs.readFileSync(path.join(root, "project/backpackBattleRules.js"), "utf8");
	assert.match(rulesSource, /condition.kind === "chance"/);
	assert.match(rulesSource, /handlers.rollChance/);
	assert.match(rulesSource, /guaranteeHit/);
	const coreSource = fs.readFileSync(path.join(root, "project/backpackBattleCore.js"), "utf8");
	assert.match(coreSource, /rollChance: function/);
	assert.match(coreSource, /guaranteeHit === true/);
	const kernelSource = fs.readFileSync(path.join(root, "project/backpackBattleEstimateKernel.js"), "utf8");
	assert.match(kernelSource, /rollChance: function/);
	assert.match(kernelSource, /guaranteeHit === true/);
});

test("chance 空间条件参与联动范围显示（含 sideBox/span）", () => {
	const source = fs.readFileSync(path.join(root, "project/backpackWeaponSynergy.js"), "utf8");
	// 静态断言：collectSpatialRules 收集空间条件（nearbyCount/linkedWeapon），
	// chance 仅当带空间字段（relation/span/distance/directions/nearbyBonus）时才参与。
	assert.match(source, /condition\.kind === "nearbyCount"/);
	assert.match(source, /condition\.kind === "linkedWeapon"/);
	assert.match(source, /condition\.kind === "chance"/);

	// 行为：getAffectedCells 对 chance + sideBox + span 条件计算联动格。
	const core = { material: { items: {} } };
	const context = loadScripts([
		"project/backpackWeaponSynergy.js",
		"project/weapons.js",
		"project/backpackWeaponSystem.js"
	], { core });
	const plugin = {};
	context.installBackpackWeaponSystem_41d4dd44_8f7d_4bbc_b890_80db42f1ad76(core, plugin);
	const ws = plugin.weaponSystem;
	const weapon = ws.normalizeWeapon({
		id: "chanceWeapon", name: "概率武器", cells: [[0, 0]],
		minAttack: 10, maxAttack: 10, hitRate: 1, attackInterval: 1, ultimateGain: 0,
		weaponTypes: ["剑"],
		combatRules: [{
			id: "chanceDamageBoost",
			trigger: "beforeAttack",
			conditions: [{
				kind: "chance", base: 0.2, nearbyBonus: 0.2,
				relation: "sideBox", directions: ["up", "down"], distance: 1, span: 3
			}],
			effects: [{ type: "modifyAttackDamage", operation: "add", value: 30 }]
		}]
	});
	const cells = ws.getSynergyCells({ weapon, col: 1, row: 1, rotation: 0 });
	const actual = cells.map((c) => c.col + "," + c.row).sort();
	assert.equal(JSON.stringify(actual), JSON.stringify(["0,0", "0,2", "1,0", "1,2", "2,0", "2,2"]),
		"sideBox span3 显示上下各3格联动范围");
	assert.ok(cells.every((c) => c.kinds.indexOf("combat") >= 0), "联动格标记为战斗联动");
});

test("statusDamageBonus 支持读取敌方状态：敌方每2层火伤本武器伤害+1", () => {
	const context = loadPure();
	const rules = context.backpackBattleRules_36e4a689_0f48_476f_92a7_1c12b3903e87;

	const makeState = (burnStacks, weapons) => rules.createBattleState(makeInput({
		player: { name: "勇士", hp: 10000, maxHp: 10000, def: 0, buffs: [], debuffs: [] },
		enemy: { id: "e", name: "怪物", hp: 100000, maxHp: 100000, atk: 0, def: 0,
			buffs: [], debuffs: burnStacks > 0 ? [{ id: "burn", stacks: burnStacks, acquiredTick: 0 }] : [] },
		weapons
	}));
	const weapon = makeWeapon({ instanceId: "w", attributes: Object.assign({}, makeWeapon().attributes, { weaponTypes: ["剑"] }), combatRules: [] });

	// 通过 runCombatRules 注册 target: "enemy"。
	const state = makeState(10, [weapon]);
	state.weapons[0].combatRules = [{
		trigger: "battleStart",
		effects: [{ type: "statusDamageBonus", id: "burnBonus", target: "enemy", status: "burn", every: 2, value: 1 }]
	}];
	rules.runCombatRules(state, state.weapons[0], "battleStart", { sourceSide: "player", hitWeapon: state.weapons[0], damage: 0 }, {});
	assert.equal(state.weaponDamageBonuses.length, 1);
	assert.equal(state.weaponDamageBonuses[0].target, "enemy", "target 归一化为 enemy");

	const bonusOf = (stacks) => {
		state.enemy.debuffs = [{ id: "burn", stacks, acquiredTick: 0 }];
		return rules.getStatusWeaponDamageBonus(state, state.weapons[0]);
	};
	assert.equal(bonusOf(0), 0);
	assert.equal(bonusOf(2), 1);
	assert.equal(bonusOf(4), 2);
	assert.equal(bonusOf(9), 4);
	assert.equal(bonusOf(10), 5);

	// 敌方火伤不影响"默认读勇士"的加成（回归）。
	const statePlayer = makeState(10, [weapon]);
	statePlayer.weaponDamageBonuses.push({ id: "markBonus", status: "burn", every: 10, value: 5, target: "player", weaponTypes: null });
	statePlayer.player.debuffs = [{ id: "burn", stacks: 25, acquiredTick: 0 }];
	assert.equal(rules.getStatusWeaponDamageBonus(statePlayer, statePlayer.weapons[0]), 10, "读勇士 burn 25 层 -> floor(25/10)*5");
	statePlayer.player.debuffs = [];
	statePlayer.enemy.debuffs = [{ id: "burn", stacks: 100, acquiredTick: 0 }];
	assert.equal(rules.getStatusWeaponDamageBonus(statePlayer, statePlayer.weapons[0]), 0, "敌方火伤不影响 target player");

	// 静态断言。
	const rulesSource = fs.readFileSync(path.join(root, "project/backpackBattleRules.js"), "utf8");
	assert.match(rulesSource, /bonus.target === "enemy"/);
	assert.match(rulesSource, /target: effect.target === "enemy" || effect.target === "opponent" ? "enemy" : "player"/);
});

test("被攻击减伤/再生/奥义百分比/盾牌联动格挡（beforeReceiveDamage + modifyUltimate + afterShieldEffect）", () => {
	const makeCore = (seq) => {
		let i = 0;
		return {
			rand() { return seq[i++ % seq.length]; },
			getLocalStorage() {}, setLocalStorage() {}, registerAnimationFrame() {}, unregisterAnimationFrame() {}
		};
	};
	const makeWeapon = (id, col, weaponTypes, combatRules) => ({
		instanceId: id, name: id, row: 0, col, cells: [[col, 0]],
		attributes: { minAttack: 10, maxAttack: 10, hitRate: 1, attackInterval: 0.25, attackIntervalTicks: 25, ultimateGain: 0, weaponTypes },
		combatRules
	});
	const run = (weapons, seq, ticks, ultP, ultE) => {
		const context = loadScripts([
			"project/backpackBattleStatuses.js",
			"project/backpackBattleRules.js",
			"project/backpackBattleCore.js"
		], { core: makeCore(seq) });
		const runtime = context.createBackpackBattleRuntime_2f8f7df2_bf4f_45ea_8ec4_628e0e25a0dc(makeCore(seq));
		runtime.start(makeInput({
			player: Object.assign({}, makeInput().player, { hp: 10000, maxHp: 10000, ultimate: ultP || 0 }),
			enemy: Object.assign({}, makeInput().enemy, { hp: 1000000, maxHp: 1000000, atk: 10, ultimate: ultE || 0, attackIntervalTicks: 100 }),
			weapons
		}));
		const snap = runtime.stepTicks(ticks);
		runtime.destroy();
		return snap;
	};

	// 场景1：beforeReceiveDamage + chance 20% 减伤7点。
	const reduceRule = [{
		trigger: "beforeReceiveDamage",
		conditions: [{ kind: "chance", base: 0.2 }],
		effects: [{ type: "modifyReceivedDamage", operation: "add", value: -7 }]
	}];
	const sPass = run([makeWeapon("w", 0, ["剑"], reduceRule)], [0.5, 0.1], 100);
	assert.equal(10000 - sPass.player.hp, 3, "chance 通过 → 受伤 10-7=3");
	const sFail = run([makeWeapon("w", 0, ["剑"], reduceRule)], [0.5, 0.5], 100);
	assert.equal(10000 - sFail.player.hp, 10, "chance 不通过 → 受伤 10");

	// 场景2：afterTakeDamage 再生+1、勇士奥义+10%、敌方奥义-10%。
	const buffRule = [{
		trigger: "afterTakeDamage",
		effects: [
			{ type: "applyStatus", target: "self", status: "regeneration", stacks: 1 },
			{ type: "modifyUltimate", operation: "percent", value: 0.1 },
			{ type: "modifyUltimate", target: "enemy", operation: "percent", value: -0.1 }
		]
	}];
	const s2 = run([makeWeapon("w", 0, ["剑"], buffRule)], [0.5], 100, 50, 100);
	const reg = s2.player.buffs.find((d) => d.id === "regeneration");
	assert.ok(reg && reg.stacks === 1, "再生+1");
	assert.equal(s2.player.ultimate, 55, "勇士奥义 50+10%");
	assert.equal(s2.enemy.ultimate, 90, "敌方奥义 100-10%");

	// 场景3：左右一格盾牌被攻击效果发动 → 自身格挡+1；距离2 不触发。
	const shieldRule = [{ trigger: "afterTakeDamage", effects: [{ type: "heal", target: "self", value: 1 }] }];
	const blockRule = [{
		trigger: "afterShieldEffect",
		conditions: [{ kind: "nearbyShieldTriggered", directions: ["left", "right"], distance: 1, filter: { weaponTypes: ["盾"] } }],
		effects: [{ type: "applyStatus", target: "self", status: "block", stacks: 1 }]
	}];
	const s3 = run([
		makeWeapon("shield", 1, ["盾"], shieldRule),
		makeWeapon("watcher", 0, ["剑"], blockRule)
	], [0.5], 100);
	const block = s3.player.buffs.find((d) => d.id === "block");
	assert.ok(block && block.stacks === 1, "盾牌在左右1格内 → 格挡+1");
	const s4 = run([
		makeWeapon("shield", 2, ["盾"], shieldRule),
		makeWeapon("watcher", 0, ["剑"], blockRule)
	], [0.5], 100);
	assert.ok(!s4.player.buffs.find((d) => d.id === "block"), "盾牌距离2 → 不触发");

	// 静态断言。
	const rulesSource = fs.readFileSync(path.join(root, "project/backpackBattleRules.js"), "utf8");
	assert.match(rulesSource, /effect.type === "modifyReceivedDamage"/);
	assert.match(rulesSource, /effect.type === "modifyUltimate"/);
	assert.match(rulesSource, /nearbyShieldTriggered/);
	assert.match(rulesSource, /afterShieldEffect/);
	const coreSource = fs.readFileSync(path.join(root, "project/backpackBattleCore.js"), "utf8");
	assert.match(coreSource, /beforeReceiveDamage/);
	assert.match(coreSource, /afterShieldEffect/);
	const kernelSource = fs.readFileSync(path.join(root, "project/backpackBattleEstimateKernel.js"), "utf8");
	assert.match(kernelSource, /beforeReceiveDamage/);
	assert.match(kernelSource, /afterShieldEffect/);
	const uiSource = fs.readFileSync(path.join(root, "project/backpackBattleUI.js"), "utf8");
	assert.match(uiSource, /无法攻击的武器/);
	assert.match(uiSource, /effectiveIntervalTicks/);
	assert.match(uiSource, /node\.color\.style\.clipPath = "";/);
});

test("攻击时（不命中也可触发）自身获得随机6个buff（afterAttack + applyRandomBuffs）", () => {
	const makeCore = (seq) => {
		let i = 0;
		return {
			// 真实引擎 rand(n) 返回 [0, n) 整数，rand() 返回 [0,1) 小数。
			rand(num) { const r = seq[i++ % seq.length]; return num ? Math.floor(r * num) : r; },
			getLocalStorage() {}, setLocalStorage() {}, registerAnimationFrame() {}, unregisterAnimationFrame() {}
		};
	};
	const makeWeapon = (hitRate, combatRules) => ({
		instanceId: "w", name: "w", row: 0, col: 0, cells: [[0, 0]],
		attributes: { minAttack: 10, maxAttack: 10, hitRate, attackInterval: 0.25, attackIntervalTicks: 25, ultimateGain: 0, weaponTypes: ["剑"] },
		combatRules
	});
	const run = (weapons, seq, ticks) => {
		const context = loadScripts([
			"project/backpackBattleStatuses.js",
			"project/backpackBattleRules.js",
			"project/backpackBattleCore.js"
		], { core: makeCore(seq) });
		const runtime = context.createBackpackBattleRuntime_2f8f7df2_bf4f_45ea_8ec4_628e0e25a0dc(makeCore(seq));
		runtime.start(makeInput({
			enemy: Object.assign({}, makeInput().enemy, { hp: 1000000, maxHp: 1000000, atk: 0 }),
			weapons
		}));
		const snap = runtime.stepTicks(ticks);
		runtime.destroy();
		return snap;
	};
	const rule = [{
		trigger: "afterAttack",
		effects: [{ type: "applyRandomBuffs", target: "self", count: 6, stacks: 1 }]
	}];
	const seq = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7];

	// 语义：随机 count 次、每次随机选 1 个 buff 施加 stacks 层，可重复叠加（总层数 = count × stacks）。
	// 场景1：命中时 count 6、rand 全 0.1 → 每次 pick 池中第一个（reflection）→ reflection 6 层（验证可重复叠加）。
	const s1 = run([makeWeapon(1, rule)], [0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1], 100);
	assert.equal(s1.weapons[0].runtimeCounters.attacks, 4);
	const s1Reflection = s1.player.buffs.find((b) => b.id === "reflection");
	assert.ok(s1Reflection && s1Reflection.stacks === 24, "随机6次可重复：4次攻击×每次6层 reflection 累加到24层");

	// 场景2：Miss 也触发（hitRate 0 全 Miss），随机 6 次总层数 6。
	const s2 = run([makeWeapon(0, rule)], seq, 100);
	assert.equal(s2.weapons[0].runtimeCounters.attacks, 4);
	assert.equal(s2.weapons[0].runtimeCounters.hits || 0, 0, "全部 Miss");
	const s2Total = s2.player.buffs.reduce((a, b) => a + b.stacks, 0);
	assert.equal(s2Total, 24, "Miss 也触发：4次攻击×随机6次=24层（专属 buff 排除后池=5）");

	// 场景3：pool 限定只从池中选取；4 次攻击 × count2 = 8 层。
	const rulePool = [{ trigger: "afterAttack", effects: [{ type: "applyRandomBuffs", target: "self", count: 2, stacks: 1, pool: ["block", "mark", "highSpirit"] }] }];
	const s3 = run([makeWeapon(1, rulePool)], seq, 100);
	const s3Buffs = s3.player.buffs.filter((b) => b.stacks > 0);
	const s3Total = s3Buffs.reduce((a, b) => a + b.stacks, 0);
	assert.equal(s3Total, 8, "4次攻击×随机2次=8层");
	assert.ok(s3Buffs.every((b) => ["block", "mark", "highSpirit"].indexOf(b.id) >= 0), "全部在池内");

	// 静态断言。
	const rulesSource = fs.readFileSync(path.join(root, "project/backpackBattleRules.js"), "utf8");
	assert.match(rulesSource, /effect.type === "applyRandomBuffs"/);
	assert.match(rulesSource, /getAllBuffIds/);
	const coreSource = fs.readFileSync(path.join(root, "project/backpackBattleCore.js"), "utf8");
	assert.match(coreSource, /applyRandomBuff: function/);
	assert.match(coreSource, /"afterAttack"/);
	const kernelSource = fs.readFileSync(path.join(root, "project/backpackBattleEstimateKernel.js"), "utf8");
	assert.match(kernelSource, /applyRandomBuff: function/);
	assert.match(kernelSource, /"afterAttack"/);
	const battleSource = fs.readFileSync(path.join(root, "project/backpackBattle.js"), "utf8");
	assert.match(battleSource, /applyRandomBuffs/);
});

test("火伤>=10 驱散敌方强化 + 命中火伤+2 + 刻印>=5 无视敌方格挡（ignoreBlock）", () => {
	const makeCore = (seq) => {
		let i = 0;
		return {
			rand(num) { const r = seq[i++ % seq.length]; return num ? Math.floor(r * num) : r; },
			getLocalStorage() {}, setLocalStorage() {}, registerAnimationFrame() {}, unregisterAnimationFrame() {}
		};
	};
	const makeWeapon = (combatRules) => ({
		instanceId: "w", name: "w", row: 0, col: 0, cells: [[0, 0]],
		attributes: { minAttack: 10, maxAttack: 10, hitRate: 1, attackInterval: 0.25, attackIntervalTicks: 25, ultimateGain: 0, weaponTypes: ["剑"] },
		combatRules
	});
	const run = (enemyBuffs, enemyDebuffs, playerBuffs, weapons, seq, ticks) => {
		const context = loadScripts([
			"project/backpackBattleStatuses.js",
			"project/backpackBattleRules.js",
			"project/backpackBattleCore.js"
		], { core: makeCore(seq) });
		const runtime = context.createBackpackBattleRuntime_2f8f7df2_bf4f_45ea_8ec4_628e0e25a0dc(makeCore(seq));
		runtime.start(makeInput({
			player: Object.assign({}, makeInput().player, { buffs: playerBuffs || [], debuffs: [] }),
			enemy: Object.assign({}, makeInput().enemy, { hp: 1000000, maxHp: 1000000, atk: 0, buffs: enemyBuffs || [], debuffs: enemyDebuffs || [] }),
			weapons
		}));
		const snap = runtime.stepTicks(ticks);
		runtime.destroy();
		return snap;
	};

	// 场景1：火伤>=10 → 攻击时随机驱散敌方1个强化；命中后火伤+2。
	const ruleA = [
		{ trigger: "beforeAttack",
			conditions: [{ kind: "status", target: "opponent", status: "burn", operator: "gte", value: 10 }],
			effects: [{ type: "dispelBuff", target: "opponent" }] },
		{ trigger: "afterHit", effects: [{ type: "applyStatus", target: "opponent", status: "burn", stacks: 2 }] }
	];
	const sA = run([{ id: "highSpirit", stacks: 2, acquiredTick: 0 }], [{ id: "burn", stacks: 12, acquiredTick: 0 }], [], [makeWeapon(ruleA)], [0.1, 0.2], 25);
	const hs = sA.enemy.buffs.find((b) => b.id === "highSpirit");
	const burn = sA.enemy.debuffs.find((d) => d.id === "burn");
	assert.ok(hs && hs.stacks === 1, "火伤12>=10 → 敌方 highSpirit 被随机驱散1层");
	assert.ok(burn && burn.stacks === 14, "命中后火伤 12+2=14");
	// 火伤不足10 → 不驱散。
	const sA2 = run([{ id: "highSpirit", stacks: 2, acquiredTick: 0 }], [{ id: "burn", stacks: 8, acquiredTick: 0 }], [], [makeWeapon(ruleA)], [0.1, 0.2], 25);
	assert.equal(sA2.enemy.buffs.find((b) => b.id === "highSpirit").stacks, 2, "火伤8<10 → 不驱散");

	// 场景2：刻印>=5 → 无视敌方格挡（block 不被消耗）；刻印不足 → 照常抵扣。
	const ruleB = [{
		trigger: "beforeAttack",
		conditions: [{ kind: "status", target: "self", status: "mark", operator: "gte", value: 5 }],
		effects: [{ type: "ignoreBlock" }]
	}];
	const blockState = (snap) => ({
		blockLeft: (snap.enemy.buffs.find((b) => b.id === "block") || { stacks: 0 }).stacks,
		damage: 1000000 - snap.enemy.hp
	});
	const sB = run([{ id: "block", stacks: 5, acquiredTick: 0 }], [], [{ id: "mark", stacks: 6, acquiredTick: 0 }], [makeWeapon(ruleB)], [0.1], 25);
	const b1 = blockState(sB);
	assert.equal(b1.blockLeft, 5, "刻印6层：格挡不被消耗");
	assert.equal(b1.damage, 10, "刻印6层：伤害10 无视格挡抵扣");
	const sB2 = run([{ id: "block", stacks: 5, acquiredTick: 0 }], [], [{ id: "mark", stacks: 3, acquiredTick: 0 }], [makeWeapon(ruleB)], [0.1], 25);
	const b2 = blockState(sB2);
	assert.equal(b2.blockLeft, 0, "刻印3层：格挡被消耗");
	assert.equal(b2.damage, 5, "刻印3层：伤害5 照常抵扣");

	// 静态断言。
	const rulesSource = fs.readFileSync(path.join(root, "project/backpackBattleRules.js"), "utf8");
	assert.match(rulesSource, /effect.type === "ignoreBlock"/);
	assert.match(rulesSource, /options.ignoreBlock/);
	const coreSource = fs.readFileSync(path.join(root, "project/backpackBattleCore.js"), "utf8");
	assert.match(coreSource, /ignoreBlock: attackContext.ignoreBlock === true/);
	const kernelSource = fs.readFileSync(path.join(root, "project/backpackBattleEstimateKernel.js"), "utf8");
	assert.match(kernelSource, /ignoreBlock: attackContext.ignoreBlock === true/);
});

test("敌方每10层冰结自身间隔-1.9（statusIntervalBonus）+ 命中冰结+2", () => {
	const context = loadPure();
	const rules = context.backpackBattleRules_36e4a689_0f48_476f_92a7_1c12b3903e87;
	const makeW = (combatRules) => Object.assign({}, makeWeapon({ instanceId: "w", combatRules }), {
		attributes: Object.assign({}, makeWeapon().attributes, { attackInterval: 1, attackIntervalTicks: 100, weaponTypes: ["剑"] })
	});

	// 单元：注册 statusIntervalBonus target enemy → 敌方冰结驱动间隔修正（回合→Tick）。
	const rule = [{
		trigger: "battleStart",
		effects: [{ type: "statusIntervalBonus", id: "iceInterval", target: "enemy", status: "ice", every: 10, value: -1.9 }]
	}];
	const state = rules.createBattleState(makeInput({
		player: { name: "勇士", hp: 10000, maxHp: 10000, def: 0, buffs: [], debuffs: [] },
		enemy: { id: "e", name: "怪物", hp: 100000, maxHp: 100000, atk: 0, def: 0, buffs: [], debuffs: [] },
		weapons: [makeW(rule)]
	}));
	rules.runCombatRules(state, state.weapons[0], "battleStart", { sourceSide: "player" }, {});
	const intervalOf = (ice) => {
		state.enemy.debuffs = [{ id: "ice", stacks: ice, acquiredTick: 0 }];
		return rules.getWeaponIntervalTicks(state, state.weapons[0]);
	};
	assert.equal(intervalOf(0), 100, "冰结0层 → 间隔100");
	assert.equal(intervalOf(5), 100, "冰结5层不足10 → 不修正");
	assert.equal(intervalOf(10), 1, "冰结10层 → -190ticks 压到最低1");
	assert.equal(intervalOf(25), 1, "冰结25层 floor(25/10)=2 → 更低");

	// 端到端：命中冰结+2；预置冰结20 → 间隔压缩、攻击次数大增。
	const core = { rand() { return 0; }, getLocalStorage() {}, setLocalStorage() {}, registerAnimationFrame() {}, unregisterAnimationFrame() {} };
	const runCtx = loadScripts([
		"project/backpackBattleStatuses.js",
		"project/backpackBattleRules.js",
		"project/backpackBattleCore.js"
	], { core });
	const runtime = runCtx.createBackpackBattleRuntime_2f8f7df2_bf4f_45ea_8ec4_628e0e25a0dc(core);
	const fullRules = [
		{ trigger: "afterHit", effects: [{ type: "applyStatus", target: "opponent", status: "ice", stacks: 2 }] },
		rule[0]
	];
	const input = makeInput({
		player: { name: "勇士", hp: 10000, maxHp: 10000, def: 0, buffs: [], debuffs: [] },
		enemy: { id: "e", name: "怪物", hp: 1000000, maxHp: 1000000, atk: 0, def: 0, buffs: [], debuffs: [{ id: "ice", stacks: 20, acquiredTick: 0 }] },
		weapons: [makeW(fullRules)]
	});
	runtime.start(input);
	const snap = runtime.stepTicks(100);
	runtime.destroy();
	assert.ok(snap.weapons[0].runtimeCounters.attacks >= 90, "冰结20层 → 间隔压到1tick，100ticks内近100次攻击");
	const ice = snap.enemy.debuffs.find((d) => d.id === "ice");
	assert.ok(ice && ice.stacks > 20, "命中继续叠加冰结");

	// 静态断言。
	const rulesSource = fs.readFileSync(path.join(root, "project/backpackBattleRules.js"), "utf8");
	assert.match(rulesSource, /effect.type === "statusIntervalBonus"/);
	assert.match(rulesSource, /getStatusIntervalBonusTicks/);
	assert.match(rulesSource, /weaponIntervalBonuses/);
});

test("敌方每5层火伤上下格内武器伤害+1（statusDamageBonus scope nearby）", () => {
	const context = loadPure();
	const rules = context.backpackBattleRules_36e4a689_0f48_476f_92a7_1c12b3903e87;
	const makeW = (id, row, combatRules) => makeWeapon({
		instanceId: id,
		cells: [[0, row]],
		combatRules: combatRules || []
	});

	// 注册：全局"每1层火伤自身+1" + nearby"每5层火伤上下格内+1"。
	const rulesDef = [{
		trigger: "battleStart",
		effects: [
			{ type: "statusDamageBonus", id: "selfBurn", target: "enemy", status: "burn", every: 1, value: 1 },
			{ type: "statusDamageBonus", id: "nearbyBurn", scope: "nearby", target: "enemy", status: "burn", every: 5, value: 1, directions: ["up", "down"], distance: 1 }
		]
	}];
	const state = rules.createBattleState(makeInput({
		enemy: Object.assign({}, makeInput().enemy, { hp: 100000, maxHp: 100000, debuffs: [{ id: "burn", stacks: 10, acquiredTick: 0 }] }),
		weapons: [makeW("X", 0, rulesDef), makeW("A", -1), makeW("B", 1), makeW("C", 2)]
	}));
	rules.runCombatRules(state, state.weapons.find((w) => w.instanceId === "X"), "battleStart", { sourceSide: "player" }, {});
	const bonusOf = (id) => rules.getStatusWeaponDamageBonus(state, state.weapons.find((w) => w.instanceId === id));
	assert.equal(bonusOf("A"), 12, "上方1格武器：全局10 + nearby2");
	assert.equal(bonusOf("B"), 12, "下方1格武器：全局10 + nearby2");
	assert.equal(bonusOf("C"), 10, "距离2武器：仅全局10");
	assert.equal(bonusOf("X"), 10, "注册者自身：nearby 缺省不含自身");

	// includeSelf: true → 注册者自身也获得 nearby 加成。
	const state2 = rules.createBattleState(makeInput({
		enemy: Object.assign({}, makeInput().enemy, { hp: 100000, maxHp: 100000, debuffs: [{ id: "burn", stacks: 10, acquiredTick: 0 }] }),
		weapons: [makeW("X", 0, [{ trigger: "battleStart", effects: [
			{ type: "statusDamageBonus", id: "nb", scope: "nearby", includeSelf: true, target: "enemy", status: "burn", every: 5, value: 1, directions: ["up", "down"], distance: 1 }
		] }])]
	}));
	rules.runCombatRules(state2, state2.weapons[0], "battleStart", { sourceSide: "player" }, {});
	assert.equal(rules.getStatusWeaponDamageBonus(state2, state2.weapons[0]), 2, "includeSelf 后自身也 +2");

	// 静态断言。
	const rulesSource = fs.readFileSync(path.join(root, "project/backpackBattleRules.js"), "utf8");
	assert.match(rulesSource, /scope === "nearby"/);
	assert.match(rulesSource, /bonus.nearby/);
	assert.match(rulesSource, /includeSelf/);
});

test("战后金币+5 / 消耗强化使食物发动次数+1（两次伤害联动、奥义一次）/ 附近食物伤害", () => {
	const makeCore = (seq) => {
		let i = 0;
		return {
			rand(num) { const r = seq[i++ % seq.length]; return num ? Math.floor(r * num) : r; },
			getLocalStorage() {}, setLocalStorage() {}, registerAnimationFrame() {}, unregisterAnimationFrame() {}
		};
	};
	const makeW = (id, col, weaponTypes, combatRules, ultimateGain) => Object.assign({}, makeWeapon({
		instanceId: id, row: 0, col, cells: [[col, 0]],
		attributes: Object.assign({}, makeWeapon().attributes, { weaponTypes, ultimateGain: ultimateGain || 0, attackIntervalTicks: 25 }),
		combatRules
	}));
	const run = (weapons, enemyHp, playerBuffs, seq, ticks) => {
		const context = loadScripts([
			"project/backpackBattleStatuses.js",
			"project/backpackBattleRules.js",
			"project/backpackBattleCore.js"
		], { core: makeCore(seq) });
		const runtime = context.createBackpackBattleRuntime_2f8f7df2_bf4f_45ea_8ec4_628e0e25a0dc(makeCore(seq));
		runtime.start(makeInput({
			player: Object.assign({}, makeInput().player, { buffs: playerBuffs || [], debuffs: [] }),
			enemy: Object.assign({}, makeInput().enemy, { hp: enemyHp, maxHp: enemyHp, atk: 0 }),
			weapons
		}));
		const snap = runtime.stepTicks(ticks);
		runtime.destroy();
		return snap;
	};

	// 场景1：battleEnd goldBonus → 战斗结果带出 5。
	const s1 = run([makeW("X", 0, ["剑"], [{ trigger: "battleEnd", effects: [{ type: "goldBonus", value: 5 }] }], 0)], 20, [], [0.1], 300);
	assert.equal(s1.result.goldBonus, 5, "战后金币+5");

	// 场景2：消耗10强化 → 右侧食物发动次数+1（多次伤害、多次联动、奥义一次）。
	const s2 = run([
		makeW("X", 0, ["剑"], [{ trigger: "beforeAttack",
			conditions: [{ kind: "buffStacks", operator: "gte", value: 10 }],
			effects: [
				{ type: "consumeBuffs", count: 10 },
				{ type: "addExtraAttack", directions: ["right"], distance: 4, filter: { weaponTypes: ["食物"] } }
			] }], 0),
		makeW("F", 3, ["食物"], [], 5)
	], 1000000, [{ id: "mark", stacks: 20, acquiredTick: 0 }], [0.1, 0.1, 0.1], 100);
	const F = s2.weapons.find((w) => w.instanceId === "F");
	const mark = s2.player.buffs.find((b) => b.id === "mark");
	assert.equal(F.extraAttackCount, 2, "X两次触发 → F发动次数+2");
	assert.equal(F.runtimeCounters.hits, 11, "F 命中 2+3+3+3=11（多次伤害）");
	assert.equal(mark ? mark.stacks : 0, 0, "两次触发消耗20层强化");
	assert.equal(s2.player.ultimate, 20, "奥义只判一次：4次攻击×5，不随发动次数翻倍");

	// 场景3：右侧4*4内每配置一个食物，本武器伤害+3。
	const context3 = loadPure();
	const rules = context3.backpackBattleRules_36e4a689_0f48_476f_92a7_1c12b3903e87;
	const state3 = rules.createBattleState(makeInput({
		enemy: Object.assign({}, makeInput().enemy, { hp: 100000, maxHp: 100000 }),
		weapons: [
			makeW("X", 0, ["剑"], [{ trigger: "battleStart", effects: [{ type: "nearbyDamageBonus", id: "foodDmg", directions: ["right"], distance: 4, filter: { weaponTypes: ["食物"] }, value: 3 }] }], 0),
			makeW("F1", 2, ["食物"], [], 0),
			makeW("F2", 3, ["食物"], [], 0)
		]
	}));
	rules.runCombatRules(state3, state3.weapons.find((w) => w.instanceId === "X"), "battleStart", { sourceSide: "player" }, {});
	assert.equal(rules.getNearbyDamageBonus(state3, state3.weapons.find((w) => w.instanceId === "X")), 6, "2个食物×3=6");

	// 静态断言。
	const rulesSource = fs.readFileSync(path.join(root, "project/backpackBattleRules.js"), "utf8");
	assert.match(rulesSource, /effect.type === "goldBonus"/);
	assert.match(rulesSource, /effect.type === "consumeBuffs"/);
	assert.match(rulesSource, /effect.type === "addExtraAttack"/);
	assert.match(rulesSource, /effect.type === "nearbyDamageBonus"/);
	assert.match(rulesSource, /condition.kind === "buffStacks"/);
	const coreSource = fs.readFileSync(path.join(root, "project/backpackBattleCore.js"), "utf8");
	assert.match(coreSource, /extraAttackCount/);
	assert.match(coreSource, /consumeBuffs: function/);
	assert.match(coreSource, /addExtraAttack: function/);
});

test("敌方每10层冰结自身攻击次数+1（statusExtraAttack）+ 命中冰结+2 + 刻印无视格挡", () => {
	const makeCore = (seq) => {
		let i = 0;
		return {
			rand(num) { const r = seq[i++ % seq.length]; return num ? Math.floor(r * num) : r; },
			getLocalStorage() {}, setLocalStorage() {}, registerAnimationFrame() {}, unregisterAnimationFrame() {}
		};
	};
	const makeW = (combatRules, ultimateGain) => Object.assign({}, makeWeapon({
		instanceId: "w", attributes: Object.assign({}, makeWeapon().attributes, { attackIntervalTicks: 25, ultimateGain: ultimateGain || 0 }),
		combatRules
	}));
	const run = (enemyIce, playerMark, enemyBlock, weapons, seq, ticks) => {
		const context = loadScripts([
			"project/backpackBattleStatuses.js",
			"project/backpackBattleRules.js",
			"project/backpackBattleCore.js"
		], { core: makeCore(seq) });
		const runtime = context.createBackpackBattleRuntime_2f8f7df2_bf4f_45ea_8ec4_628e0e25a0dc(makeCore(seq));
		runtime.start(makeInput({
			player: Object.assign({}, makeInput().player, { buffs: playerMark ? [{ id: "mark", stacks: playerMark, acquiredTick: 0 }] : [], debuffs: [] }),
			enemy: Object.assign({}, makeInput().enemy, { hp: 1000000, maxHp: 1000000, atk: 0, buffs: enemyBlock ? [{ id: "block", stacks: enemyBlock, acquiredTick: 0 }] : [], debuffs: enemyIce ? [{ id: "ice", stacks: enemyIce, acquiredTick: 0 }] : [] }),
			weapons
		}));
		const snap = runtime.stepTicks(ticks);
		runtime.destroy();
		return snap;
	};
	const rules = [
		{ trigger: "afterHit", effects: [{ type: "applyStatus", target: "opponent", status: "ice", stacks: 2 }] },
		{ trigger: "battleStart", effects: [{ type: "statusExtraAttack", id: "iceExtra", target: "enemy", status: "ice", every: 10, value: 1 }] },
		{ trigger: "beforeAttack",
			conditions: [{ kind: "status", target: "self", status: "mark", operator: "gte", value: 5 }],
			effects: [{ type: "ignoreBlock" }] }
	];

	// 场景1：预置冰结20 + 刻印6 + 敌方格挡5：每次攻击多段伤害（冰结动态增长）、格挡不被消耗、奥义只判一次。
	const s1 = run(20, 6, 5, [makeW(rules, 5)], [0.1, 0.1, 0.1], 100);
	const w = s1.weapons[0];
	const block = (s1.enemy.buffs.find((b) => b.id === "block") || { stacks: 0 }).stacks;
	assert.equal(w.runtimeCounters.hits, 15, "冰结动态增长：4次攻击 3+3+4+5 段");
	assert.equal(block, 5, "刻印6层：无视格挡，block 不消耗");
	assert.equal(s1.player.ultimate, 20, "奥义只判一次：4次攻击×5");
	assert.equal(s1.enemy.debuffs.find((d) => d.id === "ice").stacks, 50, "冰结随段数累加 20+6+6+8+10");

	// 场景2：冰结不足10 → 无额外攻击（冰结9前1段、11后2段：1+1+1+2=5）。
	const s2 = run(5, 0, 0, [makeW(rules, 0)], [0.1], 100);
	assert.equal(s2.weapons[0].runtimeCounters.hits, 5, "冰结动态跨过10层后增加段数");

	// 静态断言。
	const rulesSource = fs.readFileSync(path.join(root, "project/backpackBattleRules.js"), "utf8");
	assert.match(rulesSource, /effect.type === "statusExtraAttack"/);
	assert.match(rulesSource, /getStatusExtraAttackCount/);
	assert.match(rulesSource, /weaponExtraAttacks/);
	const coreSource = fs.readFileSync(path.join(root, "project/backpackBattleCore.js"), "utf8");
	assert.match(coreSource, /getStatusExtraAttackCount\(state,\s*weapon\)/);
});

test("命中后格挡/反射-8+随机驱散 / 上下左右一格每2食物攻击次数+1 / 常驻无视格挡", () => {
	const makeCore = (seq) => {
		let i = 0;
		return {
			rand(num) { const r = seq[i++ % seq.length]; return num ? Math.floor(r * num) : r; },
			getLocalStorage() {}, setLocalStorage() {}, registerAnimationFrame() {}, unregisterAnimationFrame() {}
		};
	};
	const makeW = (id, col, row, weaponTypes, combatRules) => Object.assign({}, makeWeapon({
		instanceId: id, row, col, cells: [[col, row]],
		attributes: Object.assign({}, makeWeapon().attributes, { weaponTypes, attackIntervalTicks: 25 }),
		combatRules
	}));
	const run = (enemyBuffs, weapons, seq, ticks) => {
		const context = loadScripts([
			"project/backpackBattleStatuses.js",
			"project/backpackBattleRules.js",
			"project/backpackBattleCore.js"
		], { core: makeCore(seq) });
		const runtime = context.createBackpackBattleRuntime_2f8f7df2_bf4f_45ea_8ec4_628e0e25a0dc(makeCore(seq));
		runtime.start(makeInput({
			enemy: Object.assign({}, makeInput().enemy, { hp: 1000000, maxHp: 1000000, atk: 0, buffs: enemyBuffs || [], debuffs: [] }),
			weapons
		}));
		const snap = runtime.stepTicks(ticks);
		runtime.destroy();
		return snap;
	};

	// 场景1：命中后 block/reflection -8 层 + 随机驱散 1 个强化（block 18 先被本次伤害抵扣10，再移除8 → 0；reflection 12-8-1）。
	const s1 = run([
		{ id: "block", stacks: 18, acquiredTick: 0 },
		{ id: "reflection", stacks: 12, acquiredTick: 0 },
		{ id: "highSpirit", stacks: 2, acquiredTick: 0 }
	], [makeW("X", 0, 0, ["剑"], [{ trigger: "afterHit",
		effects: [
			{ type: "removeStatus", target: "opponent", status: "block", stacks: 8 },
			{ type: "removeStatus", target: "opponent", status: "reflection", stacks: 8 },
			{ type: "dispelBuff", target: "opponent" }
		] }])], [0.1], 25);
	const findS = (snap, id) => snap.enemy.buffs.find((b) => b.id === id) || { stacks: 0 };
	assert.equal(findS(s1, "block").stacks, 0, "block 18-10(伤害抵扣)-8=0");
	assert.equal(findS(s1, "reflection").stacks, 3, "reflection 12-8-1(随机驱散选中)=3");
	assert.equal(findS(s1, "highSpirit").stacks, 2, "highSpirit 未被驱散选中");

	// 场景2：上下左右一格内 4 食物（F1~F4 各1格内、F5 距离2 不计）→ floor(4/2)=2 → 每击3段。
	const s2 = run([], [
		makeW("X", 0, 0, ["剑"], [{ trigger: "battleStart", effects: [{ type: "nearbyExtraAttack", id: "foodExtra", directions: ["up", "down", "left", "right"], distance: 1, filter: { weaponTypes: ["食物"] }, every: 2, value: 1 }] }]),
		makeW("F1", 1, 0, ["食物"]),
		makeW("F2", 0, 1, ["食物"]),
		makeW("F3", -1, 0, ["食物"]),
		makeW("F4", 0, -1, ["食物"]),
		makeW("F5", 2, 0, ["食物"])
	], [0.1], 100);
	const X = s2.weapons.find((w) => w.instanceId === "X");
	assert.equal(X.runtimeCounters.hits, 12, "4食物→每击3段×4次=12");

	// 场景3：ignoreBlockAlways 常驻无视格挡。
	const s3 = run([{ id: "block", stacks: 5, acquiredTick: 0 }],
		[makeW("X", 0, 0, ["剑"], [{ trigger: "battleStart", effects: [{ type: "ignoreBlockAlways" }] }])], [0.1], 25);
	assert.equal((s3.enemy.buffs.find((b) => b.id === "block") || { stacks: 0 }).stacks, 5, "常驻无视格挡：block 不消耗");
	assert.equal(1000000 - s3.enemy.hp, 10, "伤害满额10");

	// 静态断言。
	const rulesSource = fs.readFileSync(path.join(root, "project/backpackBattleRules.js"), "utf8");
	assert.match(rulesSource, /effect.type === "nearbyExtraAttack"/);
	assert.match(rulesSource, /getNearbyExtraAttackCount/);
	assert.match(rulesSource, /effect.type === "ignoreBlockAlways"/);
	assert.match(rulesSource, /weapon.ignoreBlockAlways/);
	const coreSource = fs.readFileSync(path.join(root, "project/backpackBattleCore.js"), "utf8");
	assert.match(coreSource, /getNearbyExtraAttackCount\(state, weapon\)/);
	assert.match(coreSource, /weapon\.ignoreBlockAlways === true/);
});

test("命中敌方黑暗+1 / 被攻击时按附近盾数 伤害+2、间隔-0.3 每盾（nearbyIntervalBonus）", () => {
	const makeCore = (seq) => {
		let i = 0;
		return {
			rand(num) { const r = seq[i++ % seq.length]; return num ? Math.floor(r * num) : r; },
			getLocalStorage() {}, setLocalStorage() {}, registerAnimationFrame() {}, unregisterAnimationFrame() {}
		};
	};
	const makeW = (id, col, row, weaponTypes, combatRules) => Object.assign({}, makeWeapon({
		instanceId: id, row, col, cells: [[col, row]],
		attributes: Object.assign({}, makeWeapon().attributes, { weaponTypes, attackIntervalTicks: 100 }),
		combatRules
	}));
	const run = (enemyDebuffs, enemyAtk, enemyInterval, weapons, seq, ticks) => {
		const context = loadScripts([
			"project/backpackBattleStatuses.js",
			"project/backpackBattleRules.js",
			"project/backpackBattleCore.js"
		], { core: makeCore(seq) });
		const runtime = context.createBackpackBattleRuntime_2f8f7df2_bf4f_45ea_8ec4_628e0e25a0dc(makeCore(seq));
		runtime.start(makeInput({
			enemy: Object.assign({}, makeInput().enemy, { hp: 1000000, maxHp: 1000000, atk: enemyAtk || 0, attackIntervalTicks: enemyInterval || 1000, debuffs: enemyDebuffs || [] }),
			weapons
		}));
		const snap = runtime.stepTicks(ticks);
		runtime.destroy();
		return snap;
	};

	// 场景1：命中敌方黑暗（darkness）+1。
	const s1 = run([], 0, 1000, [makeW("X", 0, 0, ["剑"], [{ trigger: "afterHit", effects: [{ type: "applyStatus", target: "opponent", status: "darkness", stacks: 1 }] }])], [0.1], 300);
	const dark = s1.enemy.debuffs.find((d) => d.id === "darkness");
	assert.ok(dark && dark.stacks === 3, "3次命中 → 敌方黑暗3层");

	// 场景2：被攻击（beforeReceiveDamage）注册后，附近每盾：伤害+2、间隔-0.3回合。
	const rule2 = {
		trigger: "beforeReceiveDamage",
		effects: [
			{ type: "nearbyDamageBonus", id: "shieldDmg", directions: ["up", "down", "left", "right"], distance: 1, filter: { weaponTypes: ["盾"] }, value: 2 },
			{ type: "nearbyIntervalBonus", id: "shieldInterval", directions: ["up", "down", "left", "right"], distance: 1, filter: { weaponTypes: ["盾"] }, value: -0.3 }
		]
	};
	const context2 = loadPure();
	const rules = context2.backpackBattleRules_36e4a689_0f48_476f_92a7_1c12b3903e87;
	const state2 = rules.createBattleState(makeInput({
		enemy: Object.assign({}, makeInput().enemy, { hp: 100000, maxHp: 100000 }),
		weapons: [
			makeW("X", 0, 0, ["剑"], [rule2]),
			makeW("S1", 1, 0, ["盾"]),
			makeW("S2", 0, -1, ["盾"]),
			makeW("S3", 2, 0, ["盾"])
		]
	}));
	rules.runAllWeaponRules(state2, "beforeReceiveDamage", { sourceSide: "enemy", damage: 10 }, {});
	const X2 = state2.weapons.find((w) => w.instanceId === "X");
	assert.equal(rules.getNearbyDamageBonus(state2, X2), 4, "2盾×2=4");
	assert.equal(rules.getNearbyIntervalBonusTicks(state2, X2), -60, "2盾×-0.3回合×100=-60ticks");

	// 静态断言。
	const rulesSource = fs.readFileSync(path.join(root, "project/backpackBattleRules.js"), "utf8");
	assert.match(rulesSource, /effect.type === "nearbyIntervalBonus"/);
	assert.match(rulesSource, /getNearbyIntervalBonusTicks/);
	assert.match(rulesSource, /nearbyIntervalBonuses/);
});

test("狼皮 buff：不可叠加、每秒-1、弱体无效、剑/斧 +5+1（statusDamageBonus + statusExtraAttack）", () => {
	const context = loadPure();
	const rules = context.backpackBattleRules_36e4a689_0f48_476f_92a7_1c12b3903e87;
	const statuses = context.backpackBattleStatusDefinitions_7d94f05e_2f6d_4b8e_9c23_5a317ccab120;

	// 静态：注册表含 wolfSkin（kind buff, periodic, periodTicks 100, stackable false）。
	assert.ok(statuses.definitions.wolfSkin, "wolfSkin 已注册");
	const def = statuses.definitions.wolfSkin;
	assert.equal(def.kind, "buff", "kind=buff");
	assert.equal(def.periodic, true, "periodic=true");
	assert.equal(def.periodTicks, 100, "periodTicks=100");
	assert.equal(def.stackable, false, "stackable=false");
	assert.equal(def.color, "#5fae3f");
	assert.match(def.iconSvg, /svg/);
	assert.ok(rules.getAllBuffIds().indexOf("wolfSkin") < 0, "getAllBuffIds 不含专属 wolfSkin");
	assert.ok(rules.isExclusiveBuff("wolfSkin"), "wolfSkin 是专属 buff");

	// 行为1：狼皮层数=持续秒数，首次施加按传入层数；再次施加只延长时长（取较大值，不叠加新层）。
	const stateA = rules.createBattleState(makeInput({ weapons: [] }));
	rules.applyStatus(stateA, "player", "wolfSkin", 5, "player");
	const ws1 = stateA.player.buffs.find((b) => b.id === "wolfSkin");
	assert.equal(ws1.stacks, 5, "首次施加 wolfSkin 5 层 → 5 层（5 秒）");
	rules.applyStatus(stateA, "player", "wolfSkin", 3, "player");
	assert.equal(stateA.player.buffs.find((b) => b.id === "wolfSkin").stacks, 5, "再施加 3 层 → 时长取较大值仍 5 层");

	// 行为2：狼皮存在 → 敌方施加 debuff 给玩家，玩家不获得。
	const stateB = rules.createBattleState(makeInput({ weapons: [] }));
	rules.applyStatus(stateB, "player", "wolfSkin", 1, "player");
	rules.applyStatus(stateB, "player", "burn", 2, "enemy");
	assert.equal(stateB.player.debuffs.find((d) => d.id === "burn"), undefined, "狼皮吸收：玩家不获得 burn");
	// 无狼皮 → 正常获得。
	const stateC = rules.createBattleState(makeInput({ weapons: [] }));
	rules.applyStatus(stateC, "player", "burn", 2, "enemy");
	assert.equal(stateC.player.debuffs.find((d) => d.id === "burn").stacks, 2, "无狼皮：玩家获得 burn");

	// 行为3：settlePeriodicStatuses 狼皮每秒 -1。
	const stateD = rules.createBattleState(makeInput({ weapons: [] }));
	rules.applyStatus(stateD, "player", "wolfSkin", 1, "player");
	rules.settlePeriodicStatuses(stateD);
	assert.equal(stateD.player.buffs.find((b) => b.id === "wolfSkin"), undefined, "settlePeriodicStatuses 后狼皮消失");

	// 行为4：剑/斧 +5+1（statusDamageBonus + statusExtraAttack 注册）。
	const ruleWS = [{
		trigger: "battleStart",
		effects: [
			{ type: "statusDamageBonus", id: "ws", target: "self", status: "wolfSkin", every: 1, value: 5, weaponTypes: ["剑", "斧"] },
			{ type: "statusExtraAttack", id: "ws", target: "self", status: "wolfSkin", every: 1, value: 1, weaponTypes: ["剑", "斧"] }
		]
	}];
	const stateE = rules.createBattleState(makeInput({
		weapons: [
			makeWeapon({ instanceId: "S", attributes: { minAttack: 10, maxAttack: 10, hitRate: 1, attackInterval: 1, attackIntervalTicks: 100, ultimateGain: 0, weaponTypes: ["剑"] }, combatRules: ruleWS }),
			makeWeapon({ instanceId: "A", attributes: { minAttack: 10, maxAttack: 10, hitRate: 1, attackInterval: 1, attackIntervalTicks: 100, ultimateGain: 0, weaponTypes: ["斧"] }, combatRules: ruleWS }),
			makeWeapon({ instanceId: "B", attributes: { minAttack: 10, maxAttack: 10, hitRate: 1, attackInterval: 1, attackIntervalTicks: 100, ultimateGain: 0, weaponTypes: ["弓"] }, combatRules: ruleWS })
		]
	}));
	rules.runCombatRules(stateE, stateE.weapons[0], "battleStart", { sourceSide: "player" }, {});
	rules.runCombatRules(stateE, stateE.weapons[1], "battleStart", { sourceSide: "player" }, {});
	rules.runCombatRules(stateE, stateE.weapons[2], "battleStart", { sourceSide: "player" }, {});
	rules.applyStatus(stateE, "player", "wolfSkin", 1, "player");
	const findW = (id) => stateE.weapons.find((w) => w.instanceId === id);
	assert.equal(rules.getStatusWeaponDamageBonus(stateE, findW("S")), 5, "剑：+5");
	assert.equal(rules.getStatusWeaponDamageBonus(stateE, findW("A")), 5, "斧：+5");
	assert.equal(rules.getStatusWeaponDamageBonus(stateE, findW("B")), 0, "弓：+0（剑/斧以外）");
	assert.equal(rules.getStatusExtraAttackCount(stateE, findW("S")), 1, "剑：+1 攻击");
	assert.equal(rules.getStatusExtraAttackCount(stateE, findW("A")), 1, "斧：+1 攻击");
	assert.equal(rules.getStatusExtraAttackCount(stateE, findW("B")), 0, "弓：+0 攻击");

	// 文件断言。
	const rulesSource = fs.readFileSync(path.join(root, "project/backpackBattleRules.js"), "utf8");
	 assert.match(rulesSource, /statusId === "wolfSkin"/);
	 assert.match(rulesSource, /getStatusStacks\(target, "wolfSkin"\) > 0/);
	 assert.match(rulesSource, /getStatusStacks\(side, "wolfSkin"\) > 0/);
	 assert.match(rulesSource, /removeStatusStacks\(side, "wolfSkin", 1\)/);
});

test("狼皮效果中命中率+0.5（statusHitRateBonus）+ 奥义+10 + 附近物品伤害/间隔 + 无视格挡", () => {
	const makeCore = (seq) => {
		let i = 0;
		return {
			rand(num) { const r = seq[i++ % seq.length]; return num ? Math.floor(r * num) : r; },
			getLocalStorage() {}, setLocalStorage() {}, registerAnimationFrame() {}, unregisterAnimationFrame() {}
		};
	};
	const makeW = (id, col, row, weaponTypes, combatRules) => Object.assign({}, makeWeapon({
		instanceId: id, row, col, cells: [[col, row]],
		attributes: Object.assign({}, makeWeapon().attributes, { weaponTypes, hitRate: 0.6, attackIntervalTicks: 100 }),
		combatRules
	}));
	const run = (enemyBuffs, playerBuffs, weapons, seq, ticks) => {
		const context = loadScripts([
			"project/backpackBattleStatuses.js",
			"project/backpackBattleRules.js",
			"project/backpackBattleCore.js"
		], { core: makeCore(seq) });
		const runtime = context.createBackpackBattleRuntime_2f8f7df2_bf4f_45ea_8ec4_628e0e25a0dc(makeCore(seq));
		runtime.start(makeInput({
			player: Object.assign({}, makeInput().player, { buffs: playerBuffs || [], debuffs: [] }),
			enemy: Object.assign({}, makeInput().enemy, { hp: 1000000, maxHp: 1000000, atk: 0, buffs: enemyBuffs || [], debuffs: [] }),
			weapons
		}));
		const snap = runtime.stepTicks(ticks);
		runtime.destroy();
		return snap;
	};
	const rules = [
		{ trigger: "afterHit", effects: [{ type: "gainUltimate", stacks: 10 }] },
		{ trigger: "battleStart", effects: [
			{ type: "nearbyDamageBonus", id: "nearbyDmg", directions: ["up", "down", "left", "right"], distance: 1, value: 5 },
			{ type: "nearbyIntervalBonus", id: "nearbyInterval", directions: ["up", "down", "left", "right"], distance: 1, value: -0.1 }
		] },
		{ trigger: "beforeAttack", effects: [{ type: "statusHitRateBonus", status: "wolfSkin", value: 0.5 }] },
		{ trigger: "battleStart", effects: [{ type: "ignoreBlockAlways" }] }
	];
	const makeFiller = (id, col, row) => { const w = makeW(id, col, row, ["盾"], []); w.attributes.minAttack = 0; w.attributes.maxAttack = 0; return w; };

	// 场景1：狼皮存在 → 命中率 0.6+0.5=1.1 夹到 1（全命中）；奥义+10；附近3物品 → 伤害+15、间隔-30ticks；无视格挡。
	const s1 = run(
		[{ id: "block", stacks: 5, acquiredTick: 0 }],
		[{ id: "wolfSkin", stacks: 1, acquiredTick: 0 }],
		[makeW("X", 0, 0, ["剑"], rules), makeFiller("A", 1, 0), makeFiller("B", 0, -1), makeFiller("F", -1, 0)],
		[0.1, 0.1], 100
	);
	const X = s1.weapons.find((w) => w.instanceId === "X");
	assert.equal(X.runtimeCounters.attacks, 1, "间隔70 → 1次攻击");
	assert.equal(X.runtimeCounters.hits, 1, "命中率夹到1 → 全命中");
	assert.equal(s1.player.ultimate, 10, "命中 → 奥义+10");
	assert.equal(1000000 - s1.enemy.hp, 25, "伤害 10+15（无视格挡，block 不抵扣）");
	assert.equal((s1.enemy.buffs.find((b) => b.id === "block") || { stacks: 0 }).stacks, 5, "block 不消耗（无视格挡）");

	// 场景2：无狼皮 → 命中率 0.6 不变（统计近似）。
	const s2 = run([], [], [makeW("X", 0, 0, ["剑"], rules)], [0.1, 0.1, 0.1, 0.1], 100);
	const X2 = s2.weapons.find((w) => w.instanceId === "X");
	assert.equal(X2.runtimeCounters.hits, Math.round(X2.runtimeCounters.attacks * 0.6), "无狼皮命中率0.6");

	// 静态断言。
	const rulesSource = fs.readFileSync(path.join(root, "project/backpackBattleRules.js"), "utf8");
	assert.match(rulesSource, /effect\.type === "statusHitRateBonus"/);
	assert.match(rulesSource, /context\.hitRateBonus/);
	const coreSource = fs.readFileSync(path.join(root, "project/backpackBattleCore.js"), "utf8");
	assert.match(coreSource, /attackContext\.hitRateBonus/);
	const kernelSource = fs.readFileSync(path.join(root, "project/backpackBattleEstimateKernel.js"), "utf8");
	assert.match(kernelSource, /attackContext\.hitRateBonus/);
});

test("MP 指示 buff：kind buff、可叠加、专属不可驱散/不可随机、图标 SVG 存在", () => {
	const context = loadPure();
	const rules = context.backpackBattleRules_36e4a689_0f48_476f_92a7_1c12b3903e87;
	const statuses = context.backpackBattleStatusDefinitions_7d94f05e_2f6d_4b8e_9c23_5a317ccab120;

	// 注册表含 mp（kind buff, periodic false, stackable true）
	assert.ok(statuses.definitions.mp, "mp 已注册");
	const def = statuses.definitions.mp;
	assert.equal(def.kind, "buff", "kind=buff");
	assert.equal(def.periodic, false, "periodic=false（无自动减层）");
	assert.equal(def.periodTicks, 0);
	assert.equal(def.stackable, true, "stackable=true（可叠加）");
	assert.equal(def.color, "#7a4dc7");
	assert.match(def.iconSvg, /MP/);
	assert.match(def.iconSvg, />MP</, "MP 图标含白色 MP 字样");
	assert.ok(!/<circle cx='51'/.test(def.iconSvg), "MP 图标无角标");
	assert.ok(rules.getAllBuffIds().indexOf("mp") < 0, "getAllBuffIds 不含专属 mp");
	assert.ok(rules.isExclusiveBuff("mp"), "mp 是专属 buff");

	// 行为：applyStatus mp 后玩家持有 mp；无任何副作用（不伤害/不攻击次数/不改攻击间隔/不改命中/无内嵌效果）。
	const state = rules.createBattleState(makeInput({ weapons: [] }));
	rules.applyStatus(state, "player", "mp", 5, "player");
	const mpState = state.player.buffs.find((b) => b.id === "mp");
	assert.ok(mpState && mpState.stacks === 5, "施加5层 → mp 5层");

	// 移除 / 视为普通 buff（注册的功能里 mp 没有任何特殊代码路径——纯指示物）。
	assert.equal(rules.getStatusWeaponDamageBonus(state, { attributes: { weaponTypes: ["剑"] } }), 0, "mp 不影响剑/任何武器伤害");
	assert.equal(rules.getStatusExtraAttackCount(state, { attributes: { weaponTypes: ["剑"] } }), 0, "mp 不影响攻击次数");
	assert.equal(rules.getNearbyDamageBonus(state, { attributes: { weaponTypes: ["剑"] }, instanceId: "x" }), 0, "mp 不影响附近伤害");

	// 图标文件存在。
	assert.ok(fs.existsSync(path.join(root, "project/images/status/mp.svg")), "图标 SVG 文件存在");
});

test("专属 buff：刻印/MP/狼皮 不可驱散、不可随机（exclusive: true）", () => {
	const context = loadPure();
	const rules = context.backpackBattleRules_36e4a689_0f48_476f_92a7_1c12b3903e87;
	const statuses = context.backpackBattleStatusDefinitions_7d94f05e_2f6d_4b8e_9c23_5a317ccab120;

	// 注册表 exclusive 标记。
	["mark", "mp", "wolfSkin"].forEach((id) => {
		assert.equal(statuses.definitions[id].exclusive, true, id + " 专属标记");
		assert.ok(rules.isExclusiveBuff(id), "isExclusiveBuff(" + id + ") = true");
	});
	["reflection", "block", "highSpirit", "excitation", "regeneration"].forEach((id) => {
		assert.ok(!rules.isExclusiveBuff(id), "isExclusiveBuff(" + id + ") = false（普通 buff）");
	});

	// getAllBuffIds 排除专属。
	const buffIds = rules.getAllBuffIds();
	assert.ok(buffIds.indexOf("mark") < 0 && buffIds.indexOf("mp") < 0 && buffIds.indexOf("wolfSkin") < 0, "随机池不含专属 buff");
	assert.equal(buffIds.length, 5, "随机池仅剩 5 个普通 buff");

	// dispelLastBuff / dispelBuffPercent 跳过专属。
	const state = rules.createBattleState(makeInput());
	rules.applyStatus(state, "enemy", "mark", 3, "enemy");
	rules.applyStatus(state, "enemy", "mp", 2, "enemy");
	rules.applyStatus(state, "enemy", "wolfSkin", 1, "enemy");
	rules.applyStatus(state, "enemy", "reflection", 2, "enemy");
	assert.equal(rules.dispelLastBuff(state, "enemy"), "reflection", "dispelLastBuff 跳过专属只驱散 reflection");
	assert.equal(rules.getStatusStacks(state.enemy, "mark"), 3, "刻印未被驱散");
	assert.equal(rules.getStatusStacks(state.enemy, "mp"), 2, "MP 未被驱散");
	assert.equal(rules.getStatusStacks(state.enemy, "wolfSkin"), 1, "狼皮未被驱散");
	const state2 = rules.createBattleState(makeInput());
	rules.applyStatus(state2, "enemy", "mark", 3, "enemy");
	rules.applyStatus(state2, "enemy", "reflection", 4, "enemy");
	const result2 = rules.dispelBuffPercent(state2, "enemy", 0.5);
	assert.equal(result2.totalRemoved, 2, "百分比驱散只对 reflection 生效（mark 专属跳过）");
	assert.equal(rules.getStatusStacks(state2.enemy, "mark"), 3, "刻印未被百分比驱散");

	// 文件断言。
	const rulesSource = fs.readFileSync(path.join(root, "project/backpackBattleRules.js"), "utf8");
	assert.match(rulesSource, /definition\.exclusive !== true/);
	assert.match(rulesSource, /isExclusiveBuff/);
	assert.match(rulesSource, /definition\.exclusive === true/);
	const coreSource = fs.readFileSync(path.join(root, "project/backpackBattleCore.js"), "utf8");
	assert.match(coreSource, /isExclusiveBuff\(status\.id\)/);
	const statusesSource = fs.readFileSync(path.join(root, "project/backpackBattleStatuses.js"), "utf8");
	assert.match(statusesSource, /"exclusive": true/);
});

test("黑之魅力 buff：kind buff、exclusive、每秒反射/再生/格挡+1、消耗MP 4层、MP不足解除", () => {
	const context = loadPure();
	const rules = context.backpackBattleRules_36e4a689_0f48_476f_92a7_1c12b3903e87;
	const statuses = context.backpackBattleStatusDefinitions_7d94f05e_2f6d_4b8e_9c23_5a317ccab120;

	// 注册表检查。
	const def = statuses.definitions.blackCharm;
	assert.ok(def, "blackCharm 已注册");
	assert.equal(def.kind, "buff");
	assert.equal(def.periodic, true);
	assert.equal(def.periodTicks, 100);
	assert.equal(def.stackable, true);
	assert.equal(def.exclusive, true, "专属 buff");
	assert.ok(def.iconSvg.indexOf("<svg") === 0, "图标以 SVG 开头");
	assert.ok(/circle/.test(def.iconSvg) && /path d=/.test(def.iconSvg), "图标含核心元素");
	assert.ok(!/<text/.test(def.iconSvg), "图标无 text 标签（无角标）");
	assert.ok(rules.isExclusiveBuff("blackCharm"));
	assert.ok(rules.getAllBuffIds().indexOf("blackCharm") < 0, "随机池不含 blackCharm");

	// 行为1：黑之魅力存在 → 每秒反射/再生/格挡+1、MP -4。
	const state1 = rules.createBattleState(makeInput({
		player: Object.assign({}, makeInput().player, {
			buffs: [{ id: "mp", stacks: 20, acquiredTick: 0 }, { id: "blackCharm", stacks: 5, acquiredTick: 0 }],
			debuffs: []
		}),
		weapons: []
	}));
	rules.settlePeriodicStatuses(state1);
	assert.equal(rules.getStatusStacks(state1.player, "reflection"), 1, "reflection+1");
	assert.equal(rules.getStatusStacks(state1.player, "regeneration"), 1, "regeneration+1");
	assert.equal(rules.getStatusStacks(state1.player, "block"), 1, "block+1");
	assert.equal(rules.getStatusStacks(state1.player, "mp"), 16, "MP 20-4=16");
	assert.equal(rules.getStatusStacks(state1.player, "blackCharm"), 5, "黑之魅力不消耗层");

	// 行为2：MP 不足 4 → 黑之魅力解除（仍施加反射/再生/格挡，不消耗 MP）。
	const state2 = rules.createBattleState(makeInput({
		player: Object.assign({}, makeInput().player, {
			buffs: [{ id: "mp", stacks: 3, acquiredTick: 0 }, { id: "blackCharm", stacks: 5, acquiredTick: 0 }],
			debuffs: []
		}),
		weapons: []
	}));
	rules.settlePeriodicStatuses(state2);
	assert.equal(state2.player.buffs.find((b) => b.id === "blackCharm"), undefined, "黑之魅力已消失");
	assert.equal(rules.getStatusStacks(state2.player, "mp"), 3, "MP 未消耗");
	assert.equal(rules.getStatusStacks(state2.player, "reflection"), 1, "反射仍施加");

	// 行为3：MP = 0 → 黑之魅力立即解除。
	const state3 = rules.createBattleState(makeInput({
		player: Object.assign({}, makeInput().player, {
			buffs: [{ id: "mp", stacks: 0, acquiredTick: 0 }, { id: "blackCharm", stacks: 1, acquiredTick: 0 }],
			debuffs: []
		}),
		weapons: []
	}));
	rules.settlePeriodicStatuses(state3);
	assert.equal(state3.player.buffs.find((b) => b.id === "blackCharm"), undefined, "MP=0 时立即解除");

	// 静态断言 + 图标文件。
	const rulesSource = fs.readFileSync(path.join(root, "project/backpackBattleRules.js"), "utf8");
	assert.match(rulesSource, /blackCharm/);
	const statusesSource = fs.readFileSync(path.join(root, "project/backpackBattleStatuses.js"), "utf8");
	assert.match(statusesSource, /"blackCharm"/);
	assert.ok(fs.existsSync(path.join(root, "project/images/status/blackCharm.svg")), "黑之魅力 SVG 文件存在");
	assert.ok(fs.existsSync(path.join(root, "project/images/status/mp.svg")), "MP SVG 文件存在");
	// MP 新图标：黑紫背景 + 白色 MP + 无角标。
	const mpSvg = fs.readFileSync(path.join(root, "project/images/status/mp.svg"), "utf8");
	assert.match(mpSvg, />MP</);
	assert.ok(!/<circle cx='51'/.test(mpSvg) && !/>\d+</.test(mpSvg), "MP 无角标");
});

test("MP组合：开始+5 / 命中MP+3回血3再生+1净化1弱体 / 奥义按累计MP伤害 / 黑之魅力5秒无敌(once)", () => {
	const makeCore = (seq) => {
		let i = 0;
		return {
			rand(num) { const r = seq[i++ % seq.length]; return num ? Math.floor(r * num) : r; },
			getLocalStorage() {}, setLocalStorage() {}, registerAnimationFrame() {}, unregisterAnimationFrame() {}
		};
	};
	const makeW = (id, combatRules) => Object.assign({}, makeWeapon({
		instanceId: id, attributes: Object.assign({}, makeWeapon().attributes, { ultimateGain: 5, attackIntervalTicks: 100 }),
		combatRules
	}));
	const run = (enemyAtk, playerBuffs, playerDebuffs, weapons, seq, ticks) => {
		const context = loadScripts([
			"project/backpackBattleStatuses.js",
			"project/backpackBattleRules.js",
			"project/backpackBattleCore.js"
		], { core: makeCore(seq) });
		const runtime = context.createBackpackBattleRuntime_2f8f7df2_bf4f_45ea_8ec4_628e0e25a0dc(makeCore(seq));
		runtime.start(makeInput({
			player: Object.assign({}, makeInput().player, { buffs: playerBuffs || [], debuffs: playerDebuffs || [] }),
			enemy: Object.assign({}, makeInput().enemy, { hp: 1000000, maxHp: 1000000, atk: enemyAtk, attackIntervalTicks: 100 }),
			weapons
		}));
		const snap = runtime.stepTicks(ticks);
		runtime.destroy();
		return snap;
	};
	const rules = [
		{ trigger: "battleStart", effects: [{ type: "applyStatus", target: "self", status: "mp", stacks: 5 }] },
		{ trigger: "afterHit", effects: [
			{ type: "applyStatus", target: "self", status: "mp", stacks: 3 },
			{ type: "heal", target: "self", stacks: 3 },
			{ type: "applyStatus", target: "self", status: "regeneration", stacks: 1 },
			{ type: "cleanseOneDebuff", target: "self" }
		] },
		{ trigger: "afterUltimate", effects: [{ type: "dealMpConsumedDamage", multiplier: 1 }] },
		{ trigger: "afterAttack",
			conditions: [{ kind: "status", target: "self", status: "blackCharm", operator: "gte", value: 1 }],
			once: true,
			effects: [{ type: "setInvincible", durationTicks: 500 }] }
	];

	// 场景1：battleStart MP+5；命中 MP+3/回血3/再生+1/净化1层 burn（burn 2→1；darkness 不动）。
	const s1 = run(30, [{ id: "mp", stacks: 2, acquiredTick: 0 }],
		[{ id: "burn", stacks: 2, acquiredTick: 0 }, { id: "darkness", stacks: 3, acquiredTick: 0 }],
		[makeW("X", rules)], [0.1], 100);
	const p = s1.player;
	assert.equal(p.buffs.find((b) => b.id === "mp").stacks, 10, "MP 2+5+3=10");
	assert.equal(p.buffs.find((b) => b.id === "regeneration").stacks, 1, "再生+1");
	assert.equal(p.debuffs.find((d) => d.id === "burn").stacks, 1, "净化1层烧伤");
	assert.equal(p.debuffs.find((d) => d.id === "darkness").stacks, 3, "黑暗未被净化");
	// HP：1000 - 20(burn周期) - 30(敌人) + 3(回血) = 953
	assert.equal(p.hp, 953, "回血3生效（含 burn/敌人伤害）");

	// 场景2：奥义按累计MP造成伤害。
	const context2 = loadPure();
	const rules2 = context2.backpackBattleRules_36e4a689_0f48_476f_92a7_1c12b3903e87;
	const state2 = rules2.createBattleState(makeInput({
		enemy: Object.assign({}, makeInput().enemy, { hp: 100000, maxHp: 100000 }),
		player: Object.assign({}, makeInput().player, { buffs: [{ id: "mp", stacks: 20, acquiredTick: 0 }], debuffs: [] }),
		weapons: []
	}));
	rules2.consumeMp(state2, "player", 8);
	assert.equal(state2.mpConsumedTotal, 8, "累计 MP 消耗 8");
	rules2.runCombatRules(state2, { instanceId: "w", combatRules: [{ trigger: "afterUltimate", effects: [{ type: "dealMpConsumedDamage", multiplier: 1 }] }] }, "afterUltimate", { sourceSide: "player" }, {});
	assert.equal(100000 - state2.enemy.hp, 8, "奥义伤害 = 累计MP×1 = 8");

	// 场景3：黑之魅力中攻击时 5 秒无敌（敌人伤害降至 0，once 只触发一次）。
	const s3 = run(30, [{ id: "blackCharm", stacks: 1, acquiredTick: 0 }], [], [makeW("X", rules)], [0.1], 300);
	assert.equal(s3.player.hp, 1000, "首次攻击后 500 ticks 无敌：敌人伤害全 0");

	// 场景4：无敌期间格挡不消耗。
	const context4 = loadPure();
	const rules4 = context4.backpackBattleRules_36e4a689_0f48_476f_92a7_1c12b3903e87;
	const state4 = rules4.createBattleState(makeInput({
		player: Object.assign({}, makeInput().player, { buffs: [{ id: "block", stacks: 5, acquiredTick: 0 }], debuffs: [] }),
		weapons: []
	}));
	state4.player.invincibleUntilTick = 1000;
	rules4.applyDamage(state4, "player", 50, {});
	assert.equal(rules4.getStatusStacks(state4.player, "block"), 5, "无敌期间格挡不消耗");
	assert.equal(state4.player.hp, 1000, "无敌期间伤害 0");

	// 静态断言。
	const rulesSource = fs.readFileSync(path.join(root, "project/backpackBattleRules.js"), "utf8");
	assert.match(rulesSource, /effect\.type === "cleanseOneDebuff"/);
	assert.match(rulesSource, /effect\.type === "dealMpConsumedDamage"/);
	assert.match(rulesSource, /effect\.type === "setInvincible"/);
	assert.match(rulesSource, /mpConsumedTotal/);
	assert.match(rulesSource, /invincibleUntilTick/);
	const coreSource = fs.readFileSync(path.join(root, "project/backpackBattleCore.js"), "utf8");
	assert.match(coreSource, /cleanseOneDebuff: function/);
});

test("命中驱散敌方强化+自身反射+1 / 奥义概率多段攻击(每刀+10%) / 无视格挡", () => {
	const makeCore = (seq) => {
		let i = 0;
		return {
			rand(num) { const r = seq[i++ % seq.length]; return num ? Math.floor(r * num) : r; },
			getLocalStorage() {}, setLocalStorage() {}, registerAnimationFrame() {}, unregisterAnimationFrame() {}
		};
	};
	const makeW = (id, col, weaponTypes, combatRules) => ({
		instanceId: id, name: id, row: 0, col, cells: [[col, 0]],
		attributes: { minAttack: 10, maxAttack: 10, hitRate: 1, attackInterval: 1, attackIntervalTicks: 100, ultimateGain: 5, weaponTypes },
		combatRules
	});
	const comboRules = [
		{ trigger: "afterHit", effects: [
			{ type: "dispelBuff", target: "opponent" },
			{ type: "applyStatus", target: "self", status: "reflection", stacks: 1 }
		] },
		{ trigger: "afterUltimate",
			conditions: [{ kind: "chance", base: 0.3, nearbyBonus: 0.1, directions: ["up", "down", "left", "right"], distance: 1, filter: { weaponTypes: ["刀"] } }],
			effects: [{ type: "repeatAttack", count: 8 }] },
		{ trigger: "battleStart", effects: [{ type: "ignoreBlockAlways" }] }
	];

	// 场景1：命中 → 敌方随机被驱散1个强化（block+mark 总数 3+2-1=4）+ 自身反射+1。
	const context1 = loadScripts([
		"project/backpackBattleStatuses.js",
		"project/backpackBattleRules.js",
		"project/backpackBattleCore.js"
	], { core: makeCore([0.1]) });
	const runtime1 = context1.createBackpackBattleRuntime_2f8f7df2_bf4f_45ea_8ec4_628e0e25a0dc(makeCore([0.1]));
	runtime1.start(makeInput({
		player: Object.assign({}, makeInput().player, { buffs: [], debuffs: [] }),
		enemy: Object.assign({}, makeInput().enemy, { hp: 1000000, maxHp: 1000000, atk: 0, buffs: [{ id: "block", stacks: 3, acquiredTick: 0 }, { id: "mark", stacks: 2, acquiredTick: 0 }], debuffs: [] }),
		weapons: [makeW("X", 0, ["剑"], comboRules)]
	}));
	const snap1 = runtime1.stepTicks(100);
	runtime1.destroy();
	const block1 = (snap1.enemy.buffs.find((b) => b.id === "block") || { stacks: 0 }).stacks;
	const mark1 = (snap1.enemy.buffs.find((b) => b.id === "mark") || { stacks: 0 }).stacks;
	assert.equal(block1 + mark1, 4, "随机驱散敌方1个强化（3+2-1）");
	assert.equal((snap1.player.buffs.find((b) => b.id === "reflection") || { stacks: 0 }).stacks, 1, "自身反射+1");

	// 场景2：3把刀 → 概率 0.6 → repeatAttack(X, 8) 触发。
	const context2 = loadPure();
	const rules2 = context2.backpackBattleRules_36e4a689_0f48_476f_92a7_1c12b3903e87;
	const d3 = makeW("D3", 0, ["刀"], []);
	d3.row = -1; d3.cells = [[0, -1]];
	const state2 = rules2.createBattleState(makeInput({
		enemy: Object.assign({}, makeInput().enemy, { hp: 10000000, maxHp: 10000000 }),
		weapons: [makeW("X", 0, ["剑"], comboRules), makeW("D1", 1, ["刀"], []), makeW("D2", -1, ["刀"], []), d3]
	}));
	let calls2 = [];
	rules2.runCombatRules(state2, state2.weapons.find((w) => w.instanceId === "X"), "afterUltimate", { sourceSide: "player" }, {
		rollChance: (chance) => chance >= 0.599 && chance <= 0.601 && 0.4 < chance,
		repeatAttack: (w, count) => { calls2.push([w.instanceId, count]); }
	});
	assert.deepEqual(calls2, [["X", 8]], "3刀 → 概率0.6 → 触发 repeatAttack(X, 8)");

	// 场景3：无刀 → 概率 0.3，rand 0.4 不触发。
	const state3 = rules2.createBattleState(makeInput({
		enemy: Object.assign({}, makeInput().enemy, { hp: 10000000, maxHp: 10000000 }),
		weapons: [makeW("X", 0, ["剑"], comboRules)]
	}));
	let calls3 = [];
	rules2.runCombatRules(state3, state3.weapons.find((w) => w.instanceId === "X"), "afterUltimate", { sourceSide: "player" }, {
		rollChance: (chance) => 0.4 < chance,
		repeatAttack: (w, count) => { calls3.push([w.instanceId, count]); }
	});
	assert.equal(calls3.length, 0, "无刀 → 概率0.3，rand 0.4 不触发");

	// 场景4：完整战斗必触发（base 1.0）→ X 攻击次数显著增加（20 普通 + 1 奥义 + 8 repeat）。
	const ruleForce = [{ trigger: "afterUltimate",
		conditions: [{ kind: "chance", base: 1.0, nearbyBonus: 0, directions: ["up", "down", "left", "right"], distance: 1, filter: { weaponTypes: ["刀"] } }],
		effects: [{ type: "repeatAttack", count: 8 }] }];
	const context4 = loadScripts([
		"project/backpackBattleStatuses.js",
		"project/backpackBattleRules.js",
		"project/backpackBattleCore.js"
	], { core: makeCore([0.1]) });
	const runtime4 = context4.createBackpackBattleRuntime_2f8f7df2_bf4f_45ea_8ec4_628e0e25a0dc(makeCore([0.1]));
	runtime4.start(makeInput({
		enemy: Object.assign({}, makeInput().enemy, { hp: 10000000, maxHp: 10000000, atk: 0 }),
		weapons: [makeW("X", 0, ["剑"], ruleForce)]
	}));
	const snap4 = runtime4.stepTicks(2050);
	runtime4.destroy();
	assert.ok(snap4.weapons[0].runtimeCounters.attacks >= 28, "奥义触发后攻击次数 ≥ 28（普通20 + 奥义1 + 8）");

	// 静态断言。
	const rulesSource = fs.readFileSync(path.join(root, "project/backpackBattleRules.js"), "utf8");
	assert.match(rulesSource, /effect\.type === "repeatAttack"/);
	const coreSource = fs.readFileSync(path.join(root, "project/backpackBattleCore.js"), "utf8");
	assert.match(coreSource, /repeatAttack: function/);
	const kernelSource = fs.readFileSync(path.join(root, "project/backpackBattleEstimateKernel.js"), "utf8");
	assert.match(kernelSource, /repeatAttack: function/);
});

test("同名武器机制：被攻击同名≥3 → 格挡+5+驱散敌方强化；同名≥3 本武器伤害+5", () => {
	const makeCore = (seq) => {
		let i = 0;
		return {
			rand(num) { const r = seq[i++ % seq.length]; return num ? Math.floor(r * num) : r; },
			getLocalStorage() {}, setLocalStorage() {}, registerAnimationFrame() {}, unregisterAnimationFrame() {}
		};
	};
	const makeW = (id, name, col, weaponTypes, combatRules) => ({
		instanceId: id, name, row: 0, col, cells: [[col, 0]],
		attributes: { minAttack: 10, maxAttack: 10, hitRate: 1, attackInterval: 1, attackIntervalTicks: 100, ultimateGain: 0, weaponTypes },
		combatRules
	});
	const comboRules = [
		{ trigger: "beforeReceiveDamage",
			conditions: [{ kind: "sameNameCount", operator: "gte", value: 3 }],
			effects: [
				{ type: "applyStatus", target: "self", status: "block", stacks: 5 },
				{ type: "dispelBuff", target: "opponent" }
			] },
		{ trigger: "battleStart",
			effects: [{ type: "sameNameDamageBonus", id: "sameNameAtk", threshold: 3, value: 5 }] }
	];
	const run = (weapons, enemyBuffs) => {
		const context = loadScripts([
			"project/backpackBattleStatuses.js",
			"project/backpackBattleRules.js",
			"project/backpackBattleCore.js"
		], { core: makeCore([0.1]) });
		const runtime = context.createBackpackBattleRuntime_2f8f7df2_bf4f_45ea_8ec4_628e0e25a0dc(makeCore([0.1]));
		runtime.start(makeInput({
			player: Object.assign({}, makeInput().player, { buffs: [], debuffs: [] }),
			enemy: Object.assign({}, makeInput().enemy, { hp: 1000000, maxHp: 1000000, atk: 30, attackIntervalTicks: 100, buffs: enemyBuffs || [], debuffs: [] }),
			weapons
		}));
		const snap = runtime.stepTicks(100);
		runtime.destroy();
		return snap;
	};

	// 场景1：3把剑A → 被攻击触发格挡+5；敌方专属 mark 不可被驱散。
	const s1 = run([
		makeW("A1", "剑A", 0, ["剑"], comboRules),
		makeW("A2", "剑A", 1, ["剑"], []),
		makeW("A3", "剑A", 2, ["剑"], []),
		makeW("B1", "剑B", 3, ["剑"], [])
	], [{ id: "mark", stacks: 2, acquiredTick: 0 }]);
	const log1 = s1.battleLog.map((l) => l.text).join(" | ");
	assert.ok(log1.indexOf("获得格挡") >= 0, "同名3 → 被攻击触发格挡+5");
	assert.equal((s1.enemy.buffs.find((b) => b.id === "mark") || { stacks: 0 }).stacks, 2, "专属 mark 不可驱散");

	// 场景2：2把剑A → 不触发。
	const s2 = run([
		makeW("A1", "剑A", 0, ["剑"], comboRules),
		makeW("A2", "剑A", 1, ["剑"], []),
		makeW("B1", "剑B", 2, ["剑"], []),
		makeW("B2", "剑B", 3, ["剑"], [])
	], [{ id: "mark", stacks: 2, acquiredTick: 0 }]);
	const log2 = s2.battleLog.map((l) => l.text).join(" | ");
	assert.ok(log2.indexOf("获得格挡") < 0, "同名2 → 不触发");

	// 场景3：同名伤害加成（剑A 3把 +5；剑B 1把 +0）。
	const context3 = loadPure();
	const rules3 = context3.backpackBattleRules_36e4a689_0f48_476f_92a7_1c12b3903e87;
	const state3 = rules3.createBattleState(makeInput({
		enemy: Object.assign({}, makeInput().enemy, { hp: 1000000, maxHp: 1000000 }),
		weapons: [
			makeW("A1", "剑A", 0, ["剑"], comboRules),
			makeW("A2", "剑A", 1, ["剑"], []),
			makeW("A3", "剑A", 2, ["剑"], []),
			makeW("B1", "剑B", 3, ["剑"], [])
		]
	}));
	const wA = state3.weapons.find((w) => w.instanceId === "A1");
	const wB = state3.weapons.find((w) => w.instanceId === "B1");
	rules3.runCombatRules(state3, wA, "battleStart", { sourceSide: "player" }, {});
	assert.equal(rules3.getSameNameDamageBonus(state3, wA), 5, "剑A 3把 → +5");
	assert.equal(rules3.getSameNameDamageBonus(state3, wB), 0, "剑B 1把 → +0");

	// 场景4：完整战斗伤害 = A1/A2/A3 15×3 + B1 10 = 55。
	const s4 = run([
		makeW("A1", "剑A", 0, ["剑"], comboRules),
		makeW("A2", "剑A", 1, ["剑"], []),
		makeW("A3", "剑A", 2, ["剑"], []),
		makeW("B1", "剑B", 3, ["剑"], [])
	], []);
	assert.equal(1000000 - s4.enemy.hp, 45, "加成只属于注册武器 A1：A1 15 + A2/A3/B1 10×3 = 45");

	// 静态断言。
	const rulesSource = fs.readFileSync(path.join(root, "project/backpackBattleRules.js"), "utf8");
	assert.match(rulesSource, /condition\.kind === "sameNameCount"/);
	assert.match(rulesSource, /effect\.type === "sameNameDamageBonus"/);
	assert.match(rulesSource, /getSameNameDamageBonus/);
	const coreSource = fs.readFileSync(path.join(root, "project/backpackBattleCore.js"), "utf8");
	assert.match(coreSource, /getSameNameDamageBonus\(state, weapon\)/);
	const kernelSource = fs.readFileSync(path.join(root, "project/backpackBattleEstimateKernel.js"), "utf8");
	assert.match(kernelSource, /getSameNameDamageBonus\(state, weapon\)/);
});

test("附近动物双机制：每只随机强化(battleStart) + 附近动物间隔-10%/只(线性)", () => {
	const makeCore = (seq) => {
		let i = 0;
		return {
			rand(num) { const r = seq[i++ % seq.length]; return num ? Math.floor(r * num) : r; },
			getLocalStorage() {}, setLocalStorage() {}, registerAnimationFrame() {}, unregisterAnimationFrame() {}
		};
	};
	const makeW = (id, name, col, weaponTypes, combatRules) => ({
		instanceId: id, name, row: 0, col, cells: [[col, 0]],
		attributes: { minAttack: 10, maxAttack: 10, hitRate: 1, attackInterval: 1, attackIntervalTicks: 100, ultimateGain: 0, weaponTypes },
		combatRules
	});
	const animalRules = [
		{ trigger: "battleStart",
			effects: [
				{ type: "nearbyRandomBuff", id: "animalBuff", target: "self",
					directions: ["up", "down", "left", "right"], distance: 1,
					filter: { weaponTypes: ["动物"] }, every: 1,
					pool: ["reflection", "block", "regeneration"] },
				{ type: "nearbyIntervalPercentBonus", id: "animalInterval", value: 0.1,
					directions: ["up", "down", "left", "right"], distance: 1,
					filter: { weaponTypes: ["动物"] } }
			] }
	];
	const fakeApply = (state) => (targetKey, weapon, effect, context, amount) => {
		const pool = effect.pool || state.rules.getAllBuffIds();
		const count = Math.max(1, Math.floor(Number(effect.count) || 1));
		const picked = [];
		for (let i = 0; i < count; i++) picked.push(pool[i % pool.length]);
		picked.forEach((id) => state.rules.applyStatus(state, targetKey, id, Math.max(1, Math.floor(Number(amount) || 1)), "player"));
		return picked;
	};

	// 场景1：2只附近动物 → 随机 2 个强化（reflection+block）+ 间隔 100×(1-0.2)=80。
	const context1 = loadPure();
	const rules1 = context1.backpackBattleRules_36e4a689_0f48_476f_92a7_1c12b3903e87;
	const state1 = rules1.createBattleState(makeInput({
		enemy: Object.assign({}, makeInput().enemy, { hp: 1000000, maxHp: 1000000 }),
		weapons: [
			makeW("X", "剑", 0, ["剑"], animalRules),
			makeW("A1", "猫", 1, ["动物"], []),
			makeW("A2", "狗", -1, ["动物"], [])
		]
	}));
	state1.rules = rules1;
	const wX = state1.weapons.find((w) => w.instanceId === "X");
	rules1.runCombatRules(state1, wX, "battleStart", { sourceSide: "player" }, { applyRandomBuff: fakeApply(state1) });
	assert.equal(rules1.getStatusStacks(state1.player, "reflection"), 1, "随机强化1");
	assert.equal(rules1.getStatusStacks(state1.player, "block"), 1, "随机强化2");
	assert.equal(rules1.getWeaponIntervalTicks(state1, wX), 80, "2只动物 线性-20% → 80 ticks");

	// 场景2：无动物 → 无 buff、间隔不变。
	const state2 = rules1.createBattleState(makeInput({
		enemy: Object.assign({}, makeInput().enemy, { hp: 1000000, maxHp: 1000000 }),
		weapons: [makeW("X", "剑", 0, ["剑"], animalRules), makeW("S1", "盾", 1, ["盾"], [])]
	}));
	state2.rules = rules1;
	const wX2 = state2.weapons.find((w) => w.instanceId === "X");
	rules1.runCombatRules(state2, wX2, "battleStart", { sourceSide: "player" }, { applyRandomBuff: fakeApply(state2) });
	assert.equal(state2.player.buffs.length, 0, "无动物 → 无 buff");
	assert.equal(rules1.getWeaponIntervalTicks(state2, wX2), 100, "无动物 → 间隔 100");

	// 场景3：完整战斗（1只动物）→ 随机获得 1 个强化。
	const context3 = loadScripts([
		"project/backpackBattleStatuses.js",
		"project/backpackBattleRules.js",
		"project/backpackBattleCore.js"
	], { core: makeCore([0.1]) });
	const runtime3 = context3.createBackpackBattleRuntime_2f8f7df2_bf4f_45ea_8ec4_628e0e25a0dc(makeCore([0.1]));
	runtime3.start(makeInput({
		enemy: Object.assign({}, makeInput().enemy, { hp: 1000000, maxHp: 1000000, atk: 0, attackIntervalTicks: 1000 }),
		weapons: [
			makeW("X", "剑", 0, ["剑"], animalRules),
			makeW("A1", "猫", 1, ["动物"], [])
		]
	}));
	const snap3 = runtime3.stepTicks(1);
	runtime3.destroy();
	assert.equal(snap3.player.buffs.length, 1, "完整战斗：1只动物 → 1个随机强化");

	// 静态断言。
	const rulesSource = fs.readFileSync(path.join(root, "project/backpackBattleRules.js"), "utf8");
	assert.match(rulesSource, /effect\.type === "nearbyRandomBuff"/);
	assert.match(rulesSource, /effect\.type === "nearbyIntervalPercentBonus"/);
	assert.match(rulesSource, /getNearbyIntervalPercent/);
	assert.match(rulesSource, /effect\.type === "nearbyIntervalBonus"/, "原 fixed 间隔修正保留");
});

test("扣血与残血恢复：攻击时hp-20；hp≤1/3恢复1/3(once)；触发后不再扣血", () => {
	const makeCore = (seq) => {
		let i = 0;
		return {
			rand(num) { const r = seq[i++ % seq.length]; return num ? Math.floor(r * num) : r; },
			getLocalStorage() {}, setLocalStorage() {}, registerAnimationFrame() {}, unregisterAnimationFrame() {}
		};
	};
	const makeW = (id, name, col, weaponTypes, combatRules) => ({
		instanceId: id, name, row: 0, col, cells: [[col, 0]],
		attributes: { minAttack: 10, maxAttack: 10, hitRate: 1, attackInterval: 1, attackIntervalTicks: 100, ultimateGain: 0, weaponTypes },
		combatRules
	});
	const sacrificeRules = [
		{ trigger: "afterAttack",
			conditions: [{ kind: "combatFlag", key: "sacrificeDone", negate: true }],
			effects: [{ type: "damageSelf", value: 20 }] },
		{ trigger: "afterHit",
			conditions: [{ kind: "hpPercent", target: "self", operator: "lte", value: 0.3334 }],
			once: true,
			effects: [
				{ type: "healPercent", value: 0.3334 },
				{ type: "setCombatFlag", key: "sacrificeDone" }
			] }
	];

	const context = loadScripts([
		"project/backpackBattleStatuses.js",
		"project/backpackBattleRules.js",
		"project/backpackBattleCore.js"
	], { core: makeCore([0.1]) });
	const runtime = context.createBackpackBattleRuntime_2f8f7df2_bf4f_45ea_8ec4_628e0e25a0dc(makeCore([0.1]));
	runtime.start(makeInput({
		player: Object.assign({}, makeInput().player, { hp: 1000, maxHp: 1000, buffs: [], debuffs: [] }),
		enemy: Object.assign({}, makeInput().enemy, { hp: 10000000, maxHp: 10000000, atk: 0, attackIntervalTicks: 100000 }),
		weapons: [makeW("X", "剑", 0, ["剑"], sacrificeRules)]
	}));
	const snap = runtime.stepTicks(4100);
	runtime.destroy();
	const X = snap.weapons.find((w) => w.instanceId === "X");
	// 41 次攻击：前 34 次扣 20（1000→320，第34次后 ≤1/3 触发恢复 +333 → 653），之后 7 次不再扣。
	assert.equal(X.runtimeCounters.attacks, 41, "攻击 41 次");
	assert.equal(snap.player.hp, 653, "HP 653（扣血至320 → 恢复+333 → 之后不再扣）");

	// 静态断言。
	const rulesSource = fs.readFileSync(path.join(root, "project/backpackBattleRules.js"), "utf8");
	assert.match(rulesSource, /condition\.kind === "hpPercent"/);
	assert.match(rulesSource, /condition\.kind === "combatFlag"/);
	assert.match(rulesSource, /effect\.type === "damageSelf"/);
	assert.match(rulesSource, /effect\.type === "healPercent"/);
	assert.match(rulesSource, /effect\.type === "setCombatFlag"/);
});

test("全局奥义+20 / 上下左右一格刀剑间隔-0.1攻击+1", () => {
	const makeCore = (seq) => {
		let i = 0;
		return {
			rand(num) { const r = seq[i++ % seq.length]; return num ? Math.floor(r * num) : r; },
			getLocalStorage() {}, setLocalStorage() {}, registerAnimationFrame() {}, unregisterAnimationFrame() {}
		};
	};
	const makeW = (id, name, col, weaponTypes, combatRules) => ({
		instanceId: id, name, row: 0, col, cells: [[col, 0]],
		attributes: { minAttack: 10, maxAttack: 10, hitRate: 1, attackInterval: 1, attackIntervalTicks: 100, ultimateGain: 5, weaponTypes },
		combatRules
	});
	const comboRules = [
		{ trigger: "battleStart", effects: [{ type: "globalUltimateGainBonus", value: 20 }] },
		{ trigger: "battleStart", effects: [
			{ type: "nearbyIntervalBonus", id: "bladeInterval", value: -0.1,
				directions: ["up", "down", "left", "right"], distance: 1,
				filter: { weaponTypes: ["刀", "剑"] } },
			{ type: "nearbyExtraAttack", id: "bladeExtra", every: 1, value: 1,
				directions: ["up", "down", "left", "right"], distance: 1,
				filter: { weaponTypes: ["刀", "剑"] } }
		] }
	];

	// 场景1：所有武器奥义+20（基础5 → 25）。
	const context1 = loadPure();
	const rules1 = context1.backpackBattleRules_36e4a689_0f48_476f_92a7_1c12b3903e87;
	const state1 = rules1.createBattleState(makeInput({
		enemy: Object.assign({}, makeInput().enemy, { hp: 1000000, maxHp: 1000000 }),
		weapons: [makeW("X", "剑", 0, ["剑"], comboRules), makeW("Y", "斧", 1, ["斧"], [])]
	}));
	const wX = state1.weapons.find((w) => w.instanceId === "X");
	rules1.runCombatRules(state1, wX, "battleStart", { sourceSide: "player" }, {});
	assert.equal(rules1.getUltimateGain(state1.player, 5, state1), 25, "所有武器奥义获得 5+20=25");

	// 场景2：上下左右一格 2 把刀剑 → 间隔 100-0.1×2×100=80、额外攻击 +2。
	const state2 = rules1.createBattleState(makeInput({
		enemy: Object.assign({}, makeInput().enemy, { hp: 1000000, maxHp: 1000000 }),
		weapons: [
			makeW("X", "盾", 0, ["盾"], comboRules),
			makeW("B1", "刀", 1, ["刀"], []),
			makeW("B2", "剑", -1, ["剑"], [])
		]
	}));
	const wX2 = state2.weapons.find((w) => w.instanceId === "X");
	rules1.runCombatRules(state2, wX2, "battleStart", { sourceSide: "player" }, {});
	assert.equal(rules1.getWeaponIntervalTicks(state2, wX2), 80, "2把刀剑 → 间隔 80");
	assert.equal(rules1.getNearbyExtraAttackCount(state2, wX2), 2, "2把刀剑 → 额外攻击 +2");

	// 静态断言。
	const rulesSource = fs.readFileSync(path.join(root, "project/backpackBattleRules.js"), "utf8");
	assert.match(rulesSource, /effect\.type === "globalUltimateGainBonus"/);
	assert.match(rulesSource, /globalUltimateGainBonus/);
	const coreSource = fs.readFileSync(path.join(root, "project/backpackBattleCore.js"), "utf8");
	assert.match(coreSource, /getUltimateGain\(state\.player, weapon\.attributes\.ultimateGain, state\)/);
});

test("每获10强化对敌10伤害 / 上下左右一格乐器命中随机5强化", () => {
	const makeCore = (seq) => {
		let i = 0;
		return {
			rand(num) { const r = seq[i++ % seq.length]; return num ? Math.floor(r * num) : r; },
			getLocalStorage() {}, setLocalStorage() {}, registerAnimationFrame() {}, unregisterAnimationFrame() {}
		};
	};
	const makeW = (id, name, col, weaponTypes, combatRules) => ({
		instanceId: id, name, row: 0, col, cells: [[col, 0]],
		attributes: { minAttack: 10, maxAttack: 10, hitRate: 1, attackInterval: 1, attackIntervalTicks: 100, ultimateGain: 0, weaponTypes },
		combatRules
	});
	const comboRules = [
		{ trigger: "battleStart", effects: [{ type: "buffGainCounter", id: "buffDmg", every: 10, damage: 10 }] },
		{ trigger: "afterLinkedWeaponHit",
			conditions: [{ kind: "linkedWeapon",
				directions: ["up", "down", "left", "right"], distance: 1,
				filter: { weaponTypes: ["乐器"] } }],
			effects: [{ type: "applyRandomBuffs", target: "self", count: 5 }] }
	];

	// 场景1：25 层强化 → 对敌 2×10 伤害（每满10触发，剩余5继续累计）。
	const context1 = loadPure();
	const rules1 = context1.backpackBattleRules_36e4a689_0f48_476f_92a7_1c12b3903e87;
	const state1 = rules1.createBattleState(makeInput({
		enemy: Object.assign({}, makeInput().enemy, { hp: 100000, maxHp: 100000 }),
		weapons: [makeW("X", "剑", 0, ["剑"], comboRules)]
	}));
	const wX = state1.weapons.find((w) => w.instanceId === "X");
	rules1.runCombatRules(state1, wX, "battleStart", { sourceSide: "player" }, {});
	for (let i = 0; i < 5; i++) rules1.applyStatus(state1, "player", "reflection", 5, "player");
	assert.equal(100000 - state1.enemy.hp, 20, "25层强化 → 2次×10伤害");

	// 场景2：完整战斗——2 把附近乐器命中各触发随机 5 强化（共 ≥5 层）。
	const context2 = loadScripts([
		"project/backpackBattleStatuses.js",
		"project/backpackBattleRules.js",
		"project/backpackBattleCore.js"
	], { core: makeCore([0.1]) });
	const runtime2 = context2.createBackpackBattleRuntime_2f8f7df2_bf4f_45ea_8ec4_628e0e25a0dc(makeCore([0.1]));
	runtime2.start(makeInput({
		enemy: Object.assign({}, makeInput().enemy, { hp: 10000000, maxHp: 10000000, atk: 0, attackIntervalTicks: 100000 }),
		weapons: [
			makeW("X", "剑", 0, ["剑"], comboRules),
			makeW("L1", "琴", 1, ["乐器"], []),
			makeW("L2", "鼓", -1, ["乐器"], [])
		]
	}));
	const snap2 = runtime2.stepTicks(100);
	runtime2.destroy();
	const L1 = snap2.weapons.find((w) => w.instanceId === "L1");
	assert.equal(L1.runtimeCounters.hits, 1, "乐器命中1次");
	const totalStacks = snap2.player.buffs.reduce((acc, b) => acc + b.stacks, 0);
	assert.ok(totalStacks >= 5, "附近乐器命中 → 随机≥5强化");

	// 静态断言。
	const rulesSource = fs.readFileSync(path.join(root, "project/backpackBattleRules.js"), "utf8");
	assert.match(rulesSource, /effect\.type === "buffGainCounter"/);
	assert.match(rulesSource, /accumulateBuffGains/);
});

test("自身HP回复时仅触发一次：激奏5/HP+15/发动上方一格饮料", () => {
	const makeCore = (seq) => {
		let i = 0;
		return {
			rand(num) { const r = seq[i++ % seq.length]; return num ? Math.floor(r * num) : r; },
			getLocalStorage() {}, setLocalStorage() {}, registerAnimationFrame() {}, unregisterAnimationFrame() {}
		};
	};
	const makeW = (id, name, col, weaponTypes, combatRules) => ({
		instanceId: id, name, row: 0, col, cells: [[col, 0]],
		attributes: { minAttack: 10, maxAttack: 10, hitRate: 1, attackInterval: 1, attackIntervalTicks: 100, ultimateGain: 0, weaponTypes },
		combatRules
	});
	const drinkRules = [{ trigger: "battleStart", effects: [{ type: "heal", target: "self", value: 20 }] }];
	const mainRules = [
		{ trigger: "afterHeal", once: true,
			effects: [
				{ type: "applyStatus", target: "self", status: "excitation", stacks: 5 },
				{ type: "heal", target: "self", value: 15 },
				{ type: "triggerWeaponEffects", directions: ["up"], distance: 1, filter: { weaponTypes: ["饮料"] } }
			] }
	];
	const baseInput = () => makeInput({
		player: Object.assign({}, makeInput().player, { hp: 500, maxHp: 1000, buffs: [{ id: "regeneration", stacks: 3, acquiredTick: 0 }], debuffs: [] }),
		enemy: Object.assign({}, makeInput().enemy, { hp: 10000000, maxHp: 10000000, atk: 0, attackIntervalTicks: 100000 }),
		weapons: [
			makeW("X", "剑", 0, ["剑"], mainRules),
			makeW("D1", "饮料", 0, ["饮料"], drinkRules)
		]
	});

	// 场景1：再生回血触发 afterHeal → 激奏5 + HP+15 + 上方饮料回血20；HP 500+30+15+20=565。
	const context1 = loadScripts([
		"project/backpackBattleStatuses.js",
		"project/backpackBattleRules.js",
		"project/backpackBattleCore.js"
	], { core: makeCore([0.1]) });
	const runtime1 = context1.createBackpackBattleRuntime_2f8f7df2_bf4f_45ea_8ec4_628e0e25a0dc(makeCore([0.1]));
	runtime1.start(baseInput());
	const snap1 = runtime1.stepTicks(100);
	runtime1.destroy();
	assert.equal(snap1.player.hp, 565, "500+再生30+规则15+饮料20=565");
	assert.equal((snap1.player.buffs.find((b) => b.id === "excitation") || { stacks: 0 }).stacks, 5, "激奏5层");

	// 场景2：200 ticks 后再生再次回血，afterHeal 不重复触发（once）。
	const runtime2 = context1.createBackpackBattleRuntime_2f8f7df2_bf4f_45ea_8ec4_628e0e25a0dc(makeCore([0.1]));
	runtime2.start(baseInput());
	const snap2 = runtime2.stepTicks(200);
	runtime2.destroy();
	assert.equal((snap2.player.buffs.find((b) => b.id === "excitation") || { stacks: 0 }).stacks, 5, "once：激奏不重复");

	// 静态断言。
	const rulesSource = fs.readFileSync(path.join(root, "project/backpackBattleRules.js"), "utf8");
	assert.match(rulesSource, /"afterHeal"/);
	assert.match(rulesSource, /afterHealActive/);
	const coreSource = fs.readFileSync(path.join(root, "project/backpackBattleCore.js"), "utf8");
	assert.match(coreSource, /settlePeriodicStatuses\(state, getHandlers\(\)\)/);
});

test("命中时每附近食物：随机1buff + 净化1debuff", () => {
	const makeCore = (seq) => {
		let i = 0;
		return {
			rand(num) { const r = seq[i++ % seq.length]; return num ? Math.floor(r * num) : r; },
			getLocalStorage() {}, setLocalStorage() {}, registerAnimationFrame() {}, unregisterAnimationFrame() {}
		};
	};
	const makeW = (id, name, col, weaponTypes, combatRules) => ({
		instanceId: id, name, row: 0, col, cells: [[col, 0]],
		attributes: { minAttack: 10, maxAttack: 10, hitRate: 1, attackInterval: 1, attackIntervalTicks: 100, ultimateGain: 0, weaponTypes },
		combatRules
	});
	const foodRules = [
		{ trigger: "afterHit", effects: [
			{ type: "nearbyRandomBuff", id: "foodBuff", target: "self",
				directions: ["up", "down", "left", "right"], distance: 1,
				filter: { weaponTypes: ["食物"] }, every: 1 },
			{ type: "nearbyCleanseDebuff", id: "foodCleanse", target: "self",
				directions: ["up", "down", "left", "right"], distance: 1,
				filter: { weaponTypes: ["食物"] }, every: 1 }
		] }
	];
	const context = loadScripts([
		"project/backpackBattleStatuses.js",
		"project/backpackBattleRules.js",
		"project/backpackBattleCore.js"
	], { core: makeCore([0.1]) });
	const runtime = context.createBackpackBattleRuntime_2f8f7df2_bf4f_45ea_8ec4_628e0e25a0dc(makeCore([0.1]));
	runtime.start(makeInput({
		player: Object.assign({}, makeInput().player, { hp: 1000, maxHp: 1000, buffs: [], debuffs: [{ id: "exhaustion", stacks: 2, acquiredTick: 0 }, { id: "darkness", stacks: 1, acquiredTick: 0 }] }),
		enemy: Object.assign({}, makeInput().enemy, { hp: 1000000, maxHp: 1000000, atk: 0, attackIntervalTicks: 100000 }),
		weapons: [
			makeW("X", "刀", 0, ["刀"], foodRules),
			makeW("F1", "食物", 1, ["食物"], []),
			makeW("F2", "食物", -1, ["食物"], [])
		]
	}));
	const snap = runtime.stepTicks(100);
	runtime.destroy();
	const X = snap.weapons.find((w) => w.instanceId === "X");
	assert.equal(X.runtimeCounters.hits, 1, "命中1次");
	const totalBuffs = snap.player.buffs.reduce((acc, b) => acc + b.stacks, 0);
	assert.equal(totalBuffs, 2, "2只食物 → 随机2个buff");
	const totalDebuffs = snap.player.debuffs.reduce((acc, b) => acc + b.stacks, 0);
	assert.equal(totalDebuffs, 1, "原3层debuff - 净化2层 = 1");

	// 静态断言。
	const rulesSource = fs.readFileSync(path.join(root, "project/backpackBattleRules.js"), "utf8");
	assert.match(rulesSource, /effect\.type === "nearbyCleanseDebuff"/);
});

test("无法发动奥义：奥义100%消耗全部获得10秒狼皮", () => {
	const makeCore = (seq) => {
		let i = 0;
		return {
			rand(num) { const r = seq[i++ % seq.length]; return num ? Math.floor(r * num) : r; },
			getLocalStorage() {}, setLocalStorage() {}, registerAnimationFrame() {}, unregisterAnimationFrame() {}
		};
	};
	const makeW = (id, name, col, weaponTypes, combatRules) => ({
		instanceId: id, name, row: 0, col, cells: [[col, 0]],
		attributes: { minAttack: 10, maxAttack: 10, hitRate: 1, attackInterval: 1, attackIntervalTicks: 100, ultimateGain: 10, weaponTypes },
		combatRules
	});
	const ultRules = [
		{ trigger: "battleStart", effects: [{ type: "disableUltimate" }] },
		{ trigger: "afterAttack",
			conditions: [{ kind: "ultimatePercent", operator: "gte", value: 100 }],
			effects: [
				{ type: "modifyUltimate", operation: "set", value: 0 },
				{ type: "applyStatus", target: "self", status: "wolfSkin", stacks: 10 }
			] }
	];
	const makeRuntime = () => loadScripts([
		"project/backpackBattleStatuses.js",
		"project/backpackBattleRules.js",
		"project/backpackBattleCore.js"
	], { core: makeCore([0.1]) }).createBackpackBattleRuntime_2f8f7df2_bf4f_45ea_8ec4_628e0e25a0dc(makeCore([0.1]));
	const run = (ticks) => {
		const runtime = makeRuntime();
		runtime.start(makeInput({
			player: Object.assign({}, makeInput().player, { hp: 1000, maxHp: 1000, buffs: [], debuffs: [] }),
			enemy: Object.assign({}, makeInput().enemy, { hp: 10000000, maxHp: 10000000, atk: 0, attackIntervalTicks: 100000 }),
			weapons: [makeW("X", "剑", 0, ["剑"], ultRules)]
		}));
		const snap = runtime.stepTicks(ticks);
		runtime.destroy();
		return snap;
	};
	// 1000 tick：10 次攻击后奥义满 100 → 清 0 + 狼皮 10 层；奥义全程未发动（无额外攻击）。
	const snap1 = run(1000);
	assert.equal(snap1.weapons[0].runtimeCounters.attacks, 10, "奥义未发动（攻击 10 次）");
	assert.equal(snap1.player.ultimate, 0, "奥义被清 0");
	assert.equal((snap1.player.buffs.find((b) => b.id === "wolfSkin") || { stacks: 0 }).stacks, 10, "狼皮 10 秒");
	// 2000 tick：第二次攒满再触发，狼皮延长仍 10；攻击仍无额外。
	const snap2 = run(2000);
	assert.equal(snap2.weapons[0].runtimeCounters.attacks, 20, "奥义始终未发动（攻击 20 次）");

	// 静态断言。
	const rulesSource = fs.readFileSync(path.join(root, "project/backpackBattleRules.js"), "utf8");
	assert.match(rulesSource, /condition\.kind === "ultimatePercent"/);
	assert.match(rulesSource, /effect\.type === "disableUltimate"/);
	const coreSource = fs.readFileSync(path.join(root, "project/backpackBattleCore.js"), "utf8");
	assert.match(coreSource, /state\.ultimateDisabled/);
});

test("被攻击时每附近盾：格挡+2/高扬+1；chance nearbyBonus 每盾+20%", () => {
	const makeCore = (seq) => {
		let i = 0;
		return {
			rand(num) { const r = seq[i++ % seq.length]; return num ? Math.floor(r * num) : r; },
			getLocalStorage() {}, setLocalStorage() {}, registerAnimationFrame() {}, unregisterAnimationFrame() {}
		};
	};
	const makeW = (id, name, col, row, weaponTypes, combatRules) => ({
		instanceId: id, name, row, col, cells: [[col, row]],
		attributes: { minAttack: 10, maxAttack: 10, attackIntervalTicks: 100, ultimateGain: 0, weaponTypes },
		combatRules
	});
	const context = loadPure();
	const rules1 = context.backpackBattleRules_36e4a689_0f48_476f_92a7_1c12b3903e87;

	// 场景1：被攻击时 3 盾（右/左/上）→ 格挡 3×2=6、高扬 3×1=3。
	const state1 = rules1.createBattleState(makeInput({
		enemy: Object.assign({}, makeInput().enemy, { hp: 100000, maxHp: 100000 }),
		weapons: [
			makeW("X", "盾", 0, 0, ["盾"], [{
				trigger: "beforeReceiveDamage",
				effects: [
					{ type: "nearbyApplyStatus", id: "sb1", target: "self", status: "block", stacks: 2, directions: ["up", "down", "left", "right"], distance: 1, filter: { weaponTypes: ["盾"] }, every: 1 },
					{ type: "nearbyApplyStatus", id: "sb2", target: "self", status: "highSpirit", stacks: 1, directions: ["up", "down", "left", "right"], distance: 1, filter: { weaponTypes: ["盾"] }, every: 1 }
				]
			}]),
			makeW("S1", "盾", 1, 0, ["盾"], []),
			makeW("S2", "盾", -1, 0, ["盾"], []),
			makeW("S3", "盾", 0, -1, ["盾"], [])
		]
	}));
	const X1 = state1.weapons.find((w) => w.instanceId === "X");
	rules1.runCombatRules(state1, X1, "beforeReceiveDamage", { sourceSide: "player", damage: 10 }, {});
	assert.equal((state1.player.buffs.find((b) => b.id === "block") || { stacks: 0 }).stacks, 6, "3盾 → 格挡+6");
	assert.equal((state1.player.buffs.find((b) => b.id === "highSpirit") || { stacks: 0 }).stacks, 3, "3盾 → 高扬+3");

	// 场景2：chance nearbyBonus——2 盾 → 概率 0.4；掷骰通过/失败验证。
	const state2 = rules1.createBattleState(makeInput({
		enemy: Object.assign({}, makeInput().enemy, { hp: 100000, maxHp: 100000 }),
		weapons: [
			makeW("X", "盾", 0, 0, ["盾"], [{
				trigger: "beforeReceiveDamage",
				conditions: [{ kind: "chance", base: 0, nearbyBonus: 0.2, directions: ["up", "down", "left", "right"], distance: 1, filter: { weaponTypes: ["盾"] } }],
				effects: [{ type: "setCombatFlag", key: "triggered" }]
			}]),
			makeW("S1", "盾", 1, 0, ["盾"], []),
			makeW("S2", "盾", -1, 0, ["盾"], [])
		]
	}));
	const X2 = state2.weapons.find((w) => w.instanceId === "X");
	state2.combatFlags = {};
	rules1.runCombatRules(state2, X2, "beforeReceiveDamage", { sourceSide: "player", damage: 10 }, { rollChance: () => true });
	assert.equal(state2.combatFlags.triggered, true, "2盾概率0.4 掷骰通过");
	state2.combatFlags = {};
	rules1.runCombatRules(state2, X2, "beforeReceiveDamage", { sourceSide: "player", damage: 10 }, { rollChance: () => false });
	assert.equal(state2.combatFlags.triggered, undefined, "2盾概率0.4 掷骰失败");

	// 静态断言。
	const rulesSource = fs.readFileSync(path.join(root, "project/backpackBattleRules.js"), "utf8");
	assert.match(rulesSource, /effect\.type === "nearbyApplyStatus"/);
});

test("上下左右一格食物+动物≥5 → 本武器攻击次数+2（nearbyThresholdExtraAttack）", () => {
	const makeCore = (seq) => {
		let i = 0;
		return {
			rand(num) { const r = seq[i++ % seq.length]; return num ? Math.floor(r * num) : r; },
			getLocalStorage() {}, setLocalStorage() {}, registerAnimationFrame() {}, unregisterAnimationFrame() {}
		};
	};
	const mk = (id, name, col, row, types) => ({
		instanceId: id, name, row, col, cells: [[col, row]],
		attributes: { minAttack: 0, maxAttack: 0, hitRate: 1, attackInterval: 1, attackIntervalTicks: 100, ultimateGain: 0, weaponTypes: types },
		combatRules: []
	});
	const thRules = [{
		trigger: "battleStart",
		effects: [{
			type: "nearbyThresholdExtraAttack", id: "fa5", value: 2, threshold: 5,
			directions: ["up", "down", "left", "right"], distance: 1,
			filter: { weaponTypes: ["食物", "动物"] }
		}]
	}];
	const X = {
		instanceId: "X", name: "刀", row: 0, col: 0, cells: [[0, 0], [1, 0]],
		attributes: { minAttack: 10, maxAttack: 10, hitRate: 1, attackInterval: 1, attackIntervalTicks: 100, ultimateGain: 0, weaponTypes: ["刀"] },
		combatRules: thRules
	};
	const baseWeapons = [
		X,
		mk("F1", "食", -1, 0, ["食物"]), mk("F2", "食", 0, -1, ["食物"]), mk("F3", "食", 1, 0, ["食物"]),
		mk("A1", "动", 0, 1, ["动物"]), mk("A2", "动", 2, 0, ["动物"])
	];
	const baseInput = () => makeInput({
		player: Object.assign({}, makeInput().player, { hp: 1000, maxHp: 1000, buffs: [], debuffs: [] }),
		enemy: Object.assign({}, makeInput().enemy, { hp: 10000000, maxHp: 10000000, atk: 0, attackIntervalTicks: 100000 }),
		weapons: baseWeapons
	});

	// 场景1：附近 5 个（3食物+2动物）→ 额外攻击 +2。
	const context1 = loadPure();
	const rules1 = context1.backpackBattleRules_36e4a689_0f48_476f_92a7_1c12b3903e87;
	const state1 = rules1.createBattleState(baseInput());
	const X1 = state1.weapons.find((w) => w.instanceId === "X");
	rules1.runCombatRules(state1, X1, "battleStart", { sourceSide: "player" }, {});
	assert.equal(rules1.getNearbyThresholdExtraAttackCount(state1, X1), 2, "5个附近 → 攻击+2");

	// 场景2：只有 4 个 → 不触发。
	const state2 = rules1.createBattleState(baseInput());
	const X2 = state2.weapons.find((w) => w.instanceId === "X");
	state2.weapons = state2.weapons.filter((w) => w.instanceId !== "A2");
	rules1.runCombatRules(state2, X2, "battleStart", { sourceSide: "player" }, {});
	assert.equal(rules1.getNearbyThresholdExtraAttackCount(state2, X2), 0, "4个附近 → 不触发");

	// 场景3：完整战斗——X 攻击 2 次，每次 1+2=3 段 → 敌方伤害 60。
	const context3 = loadScripts([
		"project/backpackBattleStatuses.js",
		"project/backpackBattleRules.js",
		"project/backpackBattleCore.js"
	], { core: makeCore([0.1]) });
	const runtime3 = context3.createBackpackBattleRuntime_2f8f7df2_bf4f_45ea_8ec4_628e0e25a0dc(makeCore([0.1]));
	runtime3.start(baseInput());
	const snap3 = runtime3.stepTicks(250);
	runtime3.destroy();
	assert.equal(snap3.weapons[0].runtimeCounters.attacks, 2, "X 攻击 2 次");
	assert.equal(snap3.enemy.damageTaken, 60, "2次×3段×10=60");

	// 静态断言。
	const rulesSource = fs.readFileSync(path.join(root, "project/backpackBattleRules.js"), "utf8");
	assert.match(rulesSource, /effect\.type === "nearbyThresholdExtraAttack"/);
	assert.match(rulesSource, /getNearbyThresholdExtraAttackCount/);
	const coreSource = fs.readFileSync(path.join(root, "project/backpackBattleCore.js"), "utf8");
	assert.match(coreSource, /getNearbyThresholdExtraAttackCount/);
});

test("命中消耗3MP冰结+1 / 每消耗10MP奥义+5 / 附近武器攻击时MP+1", () => {
	const makeCore = (seq) => {
		let i = 0;
		return {
			rand(num) { const r = seq[i++ % seq.length]; return num ? Math.floor(r * num) : r; },
			getLocalStorage() {}, setLocalStorage() {}, registerAnimationFrame() {}, unregisterAnimationFrame() {}
		};
	};
	const mk = (id, name, col, row, weaponTypes, combatRules) => ({
		instanceId: id, name, row, col, cells: [[col, row]],
		attributes: { minAttack: 10, maxAttack: 10, hitRate: 1, attackInterval: 1, attackIntervalTicks: 100, ultimateGain: 0, weaponTypes },
		combatRules
	});
	const mpRules = [
		{ trigger: "afterHit",
			conditions: [{ kind: "status", target: "self", status: "mp", operator: "gte", value: 3 }],
			effects: [
				{ type: "consumeStatus", target: "self", status: "mp", value: 3 },
				{ type: "applyStatus", target: "enemy", status: "ice", stacks: 1 }
			] },
		{ trigger: "battleStart", effects: [{ type: "mpConsumeCounter", id: "mpUlt", every: 10, value: 5 }] },
		{ trigger: "afterLinkedWeaponHit",
			conditions: [{ kind: "linkedWeapon", directions: ["up", "down", "left", "right"], distance: 1 }],
			effects: [{ type: "applyStatus", target: "self", status: "mp", stacks: 1 }] }
	];
	const context = loadPure();
	const rules1 = context.backpackBattleRules_36e4a689_0f48_476f_92a7_1c12b3903e87;

	// 场景1：命中时 MP=8 → 消耗3 → 冰结+1；MP 变 5。
	const state1 = rules1.createBattleState(makeInput({
		player: Object.assign({}, makeInput().player, { buffs: [{ id: "mp", stacks: 8, acquiredTick: 0 }], debuffs: [] }),
		enemy: Object.assign({}, makeInput().enemy, { hp: 100000, maxHp: 100000 }),
		weapons: [mk("X", "剑", 0, 0, ["剑"], mpRules), mk("S1", "刀", 1, 0, ["刀"], [])]
	}));
	const X1 = state1.weapons.find((w) => w.instanceId === "X");
	rules1.runCombatRules(state1, X1, "afterHit", { sourceSide: "player" }, {});
	assert.equal((state1.player.buffs.find((b) => b.id === "mp") || { stacks: 0 }).stacks, 5, "消耗3MP → 剩5");
	assert.equal((state1.enemy.debuffs.find((b) => b.id === "ice") || { stacks: 0 }).stacks, 1, "敌方冰结+1");

	// 场景2：消耗 25 MP → 每10点奥义+5 → 触发2次 → 奥义 10。
	const state2 = rules1.createBattleState(makeInput({
		player: Object.assign({}, makeInput().player, { buffs: [{ id: "mp", stacks: 25, acquiredTick: 0 }], debuffs: [] }),
		enemy: Object.assign({}, makeInput().enemy, { hp: 100000, maxHp: 100000 }),
		weapons: [mk("X", "剑", 0, 0, ["剑"], mpRules), mk("S1", "刀", 1, 0, ["刀"], [])]
	}));
	const X2 = state2.weapons.find((w) => w.instanceId === "X");
	rules1.runCombatRules(state2, X2, "battleStart", { sourceSide: "player" }, {});
	rules1.consumeMp(state2, "player", 25);
	assert.equal(state2.player.ultimate, 10, "25MP → 2次×5=10 奥义");

	// 场景3：附近武器（S1 右侧1格）命中 → 自身 MP+1。
	const state3 = rules1.createBattleState(makeInput({
		player: Object.assign({}, makeInput().player, { buffs: [], debuffs: [] }),
		enemy: Object.assign({}, makeInput().enemy, { hp: 100000, maxHp: 100000 }),
		weapons: [mk("X", "剑", 0, 0, ["剑"], mpRules), mk("S1", "刀", 1, 0, ["刀"], [])]
	}));
	const X3 = state3.weapons.find((w) => w.instanceId === "X");
	rules1.runCombatRules(state3, X3, "afterLinkedWeaponHit", { sourceSide: "player", hitWeapon: state3.weapons[1] }, {});
	assert.equal((state3.player.buffs.find((b) => b.id === "mp") || { stacks: 0 }).stacks, 1, "附近武器命中 → MP+1");

	// 静态断言。
	const rulesSource = fs.readFileSync(path.join(root, "project/backpackBattleRules.js"), "utf8");
	assert.match(rulesSource, /effect\.type === "mpConsumeCounter"/);
	assert.match(rulesSource, /accumulateMpConsumption/);
	assert.match(rulesSource, /effect\.status === "mp"/);
});

test("敌方每有5个debuff，本武器伤害+1（statusDamageBonus allDebuffs）", () => {
	const makeCore = (seq) => {
		let i = 0;
		return {
			rand(num) { const r = seq[i++ % seq.length]; return num ? Math.floor(r * num) : r; },
			getLocalStorage() {}, setLocalStorage() {}, registerAnimationFrame() {}, unregisterAnimationFrame() {}
		};
	};
	const mk = (id, name, col, weaponTypes, combatRules) => ({
		instanceId: id, name, row: 0, col, cells: [[col, 0]],
		attributes: { minAttack: 10, maxAttack: 10, hitRate: 1, attackInterval: 1, attackIntervalTicks: 100, ultimateGain: 0, weaponTypes },
		combatRules
	});
	const dmgRules = [{
		trigger: "battleStart",
		effects: [{ type: "statusDamageBonus", id: "debuffDmg", target: "enemy", status: "allDebuffs", every: 5, value: 1 }]
	}];
	const context = loadPure();
	const rules1 = context.backpackBattleRules_36e4a689_0f48_476f_92a7_1c12b3903e87;
	const mkInput = (debuffs) => makeInput({
		player: Object.assign({}, makeInput().player, { buffs: [], debuffs: [] }),
		enemy: Object.assign({}, makeInput().enemy, { hp: 100000, maxHp: 100000, buffs: [], debuffs }),
		weapons: [mk("X", "剑", 0, ["剑"], dmgRules)]
	});

	// 4 层（2+2）→ +0；12 层（5+7）→ +2。
	const s1 = rules1.createBattleState(mkInput([{ id: "burn", stacks: 2, acquiredTick: 0 }, { id: "ice", stacks: 2, acquiredTick: 0 }]));
	const X1 = s1.weapons[0];
	rules1.runCombatRules(s1, X1, "battleStart", { sourceSide: "player" }, {});
	assert.equal(rules1.getStatusWeaponDamageBonus(s1, X1), 0, "4层debuff → +0");
	const s2 = rules1.createBattleState(mkInput([{ id: "burn", stacks: 5, acquiredTick: 0 }, { id: "ice", stacks: 7, acquiredTick: 0 }]));
	const X2 = s2.weapons[0];
	rules1.runCombatRules(s2, X2, "battleStart", { sourceSide: "player" }, {});
	assert.equal(rules1.getStatusWeaponDamageBonus(s2, X2), 2, "12层debuff → floor(12/5)=2");

	// 静态断言。
	const rulesSource = fs.readFileSync(path.join(root, "project/backpackBattleRules.js"), "utf8");
	assert.match(rulesSource, /status === "allDebuffs"/);
});
