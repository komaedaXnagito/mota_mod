// 验证：chance 条件不再产生联动范围；空间条件（nearbyCount/linkedWeapon）仍正常
const fs = require("fs");
const vm = require("node:vm");
const c = { console };
vm.createContext(c);
vm.runInContext(fs.readFileSync("project/backpackWeaponSynergy.js", "utf8"), c);
const synergy = c.backpackWeaponSynergy_91f4c21e_7d37_4f12_9cc4_a9606ba62a83;

// ① 只有 chance 条件的武器（用户案例 hit60Heal3）
const healWeapon = {
	id: "w1", name: "治疗剑",
	cells: [[0, 0]],
	combatRules: [{
		id: "hit60Heal3",
		trigger: "afterHit",
		conditions: [{ kind: "chance", base: 0.6 }],
		effects: [{ type: "heal", target: "self", value: 3 }]
	}]
};
const cells1 = synergy.getAffectedCells(healWeapon, [[0, 0]], 0);
console.log("① chance 规则 联动格子数:", cells1.length, "(期望 0)");
console.log("①", cells1.length === 0 ? "PASS" : "FAIL");

// ② 有 nearbyCount 空间条件的武器（如"附近每有2把武器伤害+X"）
const nearbyWeapon = {
	id: "w2", name: "联动刀",
	cells: [[0, 0], [1, 0]],
	combatRules: [{
		id: "nearbyAtk",
		trigger: "beforeAttack",
		conditions: [{ kind: "nearbyCount", relation: "orthogonal", distance: 1, count: 2 }],
		effects: [{ type: "attackBonus", value: 5 }]
	}]
};
const cells2 = synergy.getAffectedCells(nearbyWeapon, [[0, 0], [1, 0]], 0);
console.log("② nearbyCount 规则 联动格子数:", cells2.length, "(期望 >0)");
console.log("②", cells2.length > 0 ? "PASS" : "FAIL");

// ③ chance + nearbyCount 混合：只按空间条件算范围
const mixedWeapon = {
	id: "w3", name: "混合",
	cells: [[0, 0]],
	combatRules: [{
		id: "mix",
		trigger: "afterHit",
		conditions: [
			{ kind: "chance", base: 0.5 },
			{ kind: "nearbyCount", relation: "orthogonal", distance: 1, count: 1 }
		],
		effects: [{ type: "heal", target: "self", value: 2 }]
	}]
};
const cells3 = synergy.getAffectedCells(mixedWeapon, [[0, 0]], 0);
console.log("③ chance+nearbyCount 混合 联动格子数:", cells3.length, "(期望 >0 按空间条件)");
console.log("③", cells3.length > 0 ? "PASS" : "FAIL");
