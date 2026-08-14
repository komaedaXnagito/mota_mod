// 验证怪物奥义：获取/受debuff影响/发动2次攻击/奥义攻击不获取
const fs = require("fs");
const vm = require("node:vm");
const c = { console };
vm.createContext(c);
["project/backpackBattleStatuses.js", "project/backpackBattleRules.js", "project/backpackBattleCore.js"].forEach((f) => vm.runInContext(fs.readFileSync(f, "utf8"), c));
const rules = c.backpackBattleRules_36e4a689_0f48_476f_92a7_1c12b3903e87;
const runtimeFactory = c.createBackpackBattleRuntime_2f8f7df2_bf4f_45ea_8ec4_628e0e25a0dc;
const mkCore = (seq) => {
	let i = 0;
	return {
		rand(num) { const r = seq[i++ % seq.length]; return num ? Math.floor(r * num) : r; },
		getLocalStorage() {}, setLocalStorage() {}, registerAnimationFrame() {}, unregisterAnimationFrame() {}
	};
};
const mkW = (id, name, col) => ({
	instanceId: id, name, row: 0, col, cells: [[col, 0]],
	attributes: { minAttack: 1, maxAttack: 1, hitRate: 1, attackInterval: 1, attackIntervalTicks: 100, ultimateGain: 0, weaponTypes: ["刀"] },
	combatRules: []
});
const baseInput = (enemyExtra) => ({
	version: 1,
	player: { name: "勇士", hp: 100000, maxHp: 100000, def: 0, buffs: [], debuffs: [] },
	enemy: Object.assign({
		id: "e", name: "魔王", hp: 50000, maxHp: 50000, atk: 50, def: 10,
		hitRate: 1, attackIntervalTicks: 100, buffs: [], debuffs: [],
		combatRules: []
	}, enemyExtra || {}),
	weapons: [mkW("X", "剑", 0)],
	meta: {}
});

// 场景1：enemy ultimateGain=30，普通攻击 → 每次 +30 奥义（无 debuff）
{
	const runtime = runtimeFactory(mkCore([0.1]));
	runtime.start(baseInput({ ultimateGain: 30 }));
	const s = runtime.stepTicks(300); // 3 次攻击
	runtime.destroy();
	const e = s.enemy;
	console.log("场景1：3次攻击后奥义:", e.ultimate, "(期望 90：3×30，未满100不发动)");
	console.log("场景1 通过:", e.ultimate === 90 ? "PASS" : "FAIL");
}
// 场景2：ultimateGain=40 → 3 次攻击到 120 → 发动1次（扣100剩20）+ 额外2次攻击
{
	const runtime = runtimeFactory(mkCore([0.1]));
	runtime.start(baseInput({ ultimateGain: 40 }));
	const s = runtime.stepTicks(300);
	runtime.destroy();
	const e = s.enemy;
	console.log("场景2：3次攻击后奥义:", e.ultimate, "(期望 20：120-100)");
	// 玩家受到的伤害：3次普通攻击(50×3) + 2次奥义攻击(50×2) = 250
	console.log("场景2 玩家承伤:", s.player.damageTaken, "(期望 250)");
	console.log("场景2 通过:", e.ultimate === 20 && s.player.damageTaken === 250 ? "PASS" : "FAIL");
}
// 场景3：受 debuff（虚脱 exhaustion）影响：ultimateGain=40 + 虚脱3层 → 每次 40-3×2=34
{
	const runtime = runtimeFactory(mkCore([0.1]));
	runtime.start(baseInput({ ultimateGain: 40, debuffs: [{ id: "exhaustion", stacks: 3, acquiredTick: 0 }] }));
	const s = runtime.stepTicks(300);
	runtime.destroy();
	const e = s.enemy;
	console.log("场景3：虚脱3层 3次攻击后奥义:", e.ultimate, "(期望 102：3×34，未满100？34×3=102 → 发动1次剩2)");
	// 102 → 发动1次(扣100剩2) + 2次奥义攻击
	console.log("场景3 玩家承伤:", s.player.damageTaken, "(期望 250：3×50+2×50)");
	console.log("场景3 通过:", e.ultimate === 2 && s.player.damageTaken === 250 ? "PASS" : "FAIL");
}
// 场景4：无 ultimateGain 词条 → 不获取奥义、不发动
{
	const runtime = runtimeFactory(mkCore([0.1]));
	runtime.start(baseInput({}));
	const s = runtime.stepTicks(300);
	runtime.destroy();
	console.log("场景4：无词条 奥义:", s.enemy.ultimate, "承伤:", s.player.damageTaken, "(期望 0 / 150)");
	console.log("场景4 通过:", s.enemy.ultimate === 0 && s.player.damageTaken === 150 ? "PASS" : "FAIL");
}
