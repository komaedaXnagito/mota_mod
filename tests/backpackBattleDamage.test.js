"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const root = path.resolve(__dirname, "..");

function setup() {
	const context = vm.createContext({ console, setTimeout, clearTimeout });
	["backpackBattleStatuses", "backpackBattleRules", "backpackBattleCore"].forEach(name => {
		vm.runInContext(fs.readFileSync(path.join(root, "project", name + ".js"), "utf8"), context);
	});
	const rules = context.backpackBattleRules_36e4a689_0f48_476f_92a7_1c12b3903e87;
	const runtime = context.createBackpackBattleRuntime_2f8f7df2_bf4f_45ea_8ec4_628e0e25a0dc({
		randBattle() { return 0; }, registerAnimationFrame() {}, unregisterAnimationFrame() {}
	});
	const source = fs.readFileSync(path.join(root, "project/backpackBattleUI.js"), "utf8");
	const summarySource = source.match(/var getDamageSummary = function \(snapshot\) \{[\s\S]*?\n\t\};/)[0];
	const summary = vm.runInNewContext(summarySource + "\ngetDamageSummary", { rules });
	return { rules, runtime, summary };
}

function weapon(id, damage) {
	return {
		instanceId: id, name: "同名剑", row: 0, col: id === "a" ? 0 : 1, cells: [[0, 0]],
		attributes: { minAttack: damage, maxAttack: damage, hitRate: 1, attackInterval: 1,
			attackIntervalTicks: 100, ultimateGain: 0, weaponTypes: ["剑"] }, combatRules: []
	};
}

function input(weapons) {
	return {
		player: { hp: 1000, maxHp: 1000, atk: 0, buffs: [], debuffs: [] },
		enemy: { id: "enemy", hp: 1000, maxHp: 1000, atk: 0, attackIntervalTicks: 99999, buffs: [], debuffs: [] },
		weapons: weapons || [weapon("a", 10)], meta: { initialPlayerHp: 1000 }
	};
}

test("伤害统计计入格挡后伤害，玩家受伤与治疗不会增加兵装伤害", () => {
	const { rules } = setup();
	const state = rules.createBattleState(input());
	const sourceWeapon = state.weapons[0];
	rules.applyStatus(state, "enemy", "block", 2);
	assert.equal(rules.applyDamage(state, "enemy", 10, { sourceWeapon }).damage, 4);
	assert.equal(sourceWeapon.damageDealt, 4);
	rules.applyDamage(state, "enemy", 5, { direct: true, sourceWeapon });
	rules.applyDamage(state, "player", 7, { sourceWeapon });
	rules.heal(state, "enemy", 9);
	assert.equal(sourceWeapon.damageDealt, 9);
	assert.equal(state.enemy.damageTaken, 9);
	assert.equal(state.enemy.hp, 1000, "治疗不应倒扣已经造成的伤害");
});

test("实际战斗按实例统计普通攻击、直接效果和持续伤害", () => {
	const { runtime, summary } = setup();
	const first = weapon("a", 10), second = weapon("b", 20);
	second.combatRules = [{ trigger: "afterHit", effects: [{ type: "dealDamage", target: "enemy", direct: true, value: 3 }] }];
	const data = input([first, second]);
	data.enemy.buffs = [{ id: "block", stacks: 2 }];
	data.enemy.debuffs = [{ id: "burn", stacks: 1 }];
	runtime.start(data);
	const snapshot = runtime.stepTicks(100);
	const totals = summary(snapshot);
	assert.equal(snapshot.tick, 100);
	assert.equal(snapshot.weapons[0].damageDealt, 4);
	assert.equal(snapshot.weapons[1].damageDealt, 23);
	assert.equal(totals.total, 37);
	assert.equal(totals.dps, 37);
	assert.equal(totals.rows.find(row => row.id === "__other__").damage, 10);
	assert.equal(totals.rows.filter(row => row.name === "同名剑").length, 2);
	assert.ok(Math.abs(totals.rows.reduce((sum, row) => sum + row.share, 0) - 100) < 0.00001);
	runtime.destroy();
});

test("效果在开局造成的伤害不会产生 Infinity，重新战斗会清零统计", () => {
	const { runtime, rules, summary } = setup();
	const w = weapon("a", 10);
	w.damageDealt = 999;
	w.combatRules = [{ trigger: "battleStart", effects: [{ type: "dealDamage", target: "enemy", direct: true, value: 12 }] }];
	runtime.start(input([w]));
	const snapshot = runtime.getSnapshot();
	assert.equal(snapshot.weapons[0].damageDealt, 12);
	assert.equal(summary(snapshot).total, 12);
	assert.equal(summary(snapshot).dps, 0);
	const next = rules.createBattleState(snapshot);
	assert.equal(next.weapons[0].damageDealt, 0);
	assert.equal(next.enemy.damageTaken, 0);
	assert.equal(w.damageDealt, 999, "统计不能回写背包输入");
	runtime.destroy();
});

test("DPS 使用战斗时间，排行保持稳定并覆盖零伤害和空兵装", () => {
	const { summary } = setup();
	const snapshot = { tick: 250, speed: 10, enemy: { damageTaken: 100 }, weapons: [
		{ instanceId: "a", name: "同名剑", damageDealt: 40 },
		{ instanceId: "b", name: "同名剑", damageDealt: 40 },
		{ instanceId: "c", name: "辅助", damageDealt: 0 }
	] };
	let result = summary(snapshot);
	assert.equal(result.dps, 40);
	assert.equal(result.rows.map(row => row.id).join(","), "a,b,__other__,c");
	snapshot.speed = .25;
	assert.equal(summary(snapshot).dps, 40, "战斗速度不直接乘到 DPS 上");
	result = summary({ tick: 0, enemy: { damageTaken: 0 }, weapons: [] });
	assert.equal(result.total, 0);
	assert.equal(result.dps, 0);
	assert.equal(result.rows.length, 0);
});

test("奥义消耗 MP 的额外伤害归属触发武器", () => {
	const { rules } = setup();
	const state = rules.createBattleState(input());
	const w = state.weapons[0];
	w.combatRules = [{ trigger: "ultimate", effects: [{ type: "dealMpConsumedDamage", multiplier: 2 }] }];
	state.mpConsumedTotal = 15;
	rules.runCombatRules(state, w, "ultimate", { sourceSide: "player" }, {});
	assert.equal(w.damageDealt, 30);
	assert.equal(state.enemy.damageTaken, 30);
});
