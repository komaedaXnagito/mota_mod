// 验证合成系统修复的核心逻辑：键匹配（getWeaponKey → recipeKey）
const fs = require("fs");
const vm = require("node:vm");
const c = { console };
vm.createContext(c);
vm.runInContext(fs.readFileSync("project/weapons.js", "utf8"), c);
vm.runInContext(fs.readFileSync("project/weaponRecipes.js", "utf8"), c);
const defs = c.weaponDefinitions_9f2e6f5b_4b2c_4f8c_9a3d_7e1b6c0d5a44;
const recipesData = c.weaponRecipes_7f2e9c4a_3b5d_4f8a_9c1e_6d4b8a2f9c31;

// 复现 backpackCraft.js 的匹配逻辑
const recipeKey = (a, b) => [a, b].sort().join("+");
const buildIndex = () => {
	const index = {};
	(Array.isArray(recipesData.recipes) ? recipesData.recipes : []).forEach((r) => {
		if (r && r.a && r.b && r.result && defs[r.result]) index[recipeKey(String(r.a), String(r.b))] = r;
	});
	return index;
};
const getWeaponKey = (weapon) => {
	if (!weapon || weapon.id == null) return null;
	for (const key in defs) {
		if (defs[key] && defs[key].id === weapon.id) return key;
	}
	return null;
};
const findRecipe = (wA, wB) => {
	if (!wA || !wB) return null;
	const ka = getWeaponKey(wA), kb = getWeaponKey(wB);
	if (!ka || !kb) return null;
	return buildIndex()[recipeKey(ka, kb)] || null;
};

// ① I372(薛定谔 xde) + I404(远走高飞 fireGuitar) → 应命中 r_example_1
const r1 = findRecipe(defs["I372"], defs["I404"]);
console.log("① I372+I404 匹配:", r1 ? "命中 " + r1.id + " → " + defs[r1.result].name : "未命中", "(期望 命中 r_example_1 → 手甲)");

// ② 两把 I372 → 应命中 r_example_2（两把相同武器合成）
const r2 = findRecipe(defs["I372"], defs["I372"]);
console.log("② I372+I372 匹配:", r2 ? "命中 " + r2.id + " → " + defs[r2.result].name : "未命中", "(期望 命中 r_example_2 → 钢制战斧)");

// ③ 顺序不敏感：I404 + I372 也应命中 r_example_1
const r3 = findRecipe(defs["I404"], defs["I372"]);
console.log("③ I404+I372 匹配:", r3 ? "命中 " + r3.id : "未命中", "(期望 命中 r_example_1，顺序不敏感)");

// ④ 不存在的武器（无配方）
const r4 = findRecipe(defs["I500"], defs["I501"]);
console.log("④ I500+I501 匹配:", r4 ? "命中" : "未命中(正确)", "(期望 未命中)");

console.log("验证:", r1 && r1.id === "r_example_1" && r2 && r2.id === "r_example_2" && r3 && r3.id === "r_example_1" && !r4 ? "PASS" : "FAIL");
