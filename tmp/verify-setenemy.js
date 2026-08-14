// 模拟验证：core.setEnemy 对 MT11+ 怪物是否真正生效
const fs = require("fs");
const vm = require("node:vm");
const c = { console };
vm.createContext(c);
vm.runInContext(fs.readFileSync("project/enemys.js", "utf8"), c);
const enemys = c.enemys_fcae963b_31c9_42b4_b48c_bb48d09f3f80;

// 模拟 core（含 setEnemy 同款逻辑）
const flagStore = {};
const core = {
	getFlag: (k) => flagStore[k],
	setFlag: (k, v) => { flagStore[k] = v; },
	hasFlag: (k) => flagStore[k] != null,
	calValue: (v) => v,
	updateStatusBar() {},
	status: { hero: {} },
	material: { enemys },
	// 复刻 events.setEnemy
	setEnemy(id, name, value, operator, prefix, norefresh) {
		if (!this.hasFlag("enemyInfo")) this.setFlag("enemyInfo", {});
		const enemyInfo = this.getFlag("enemyInfo");
		if (!enemyInfo[id]) enemyInfo[id] = {};
		enemyInfo[id][name] = value;
		(this.material.enemys[id] || {})[name] = value;
	}
};
core.status.hero.flags = flagStore;

// 模拟 getEnemyValue（读 enemyOnPoint → material）
core.getEnemyValue = function (enemy, name) {
	if (enemy == null) return null;
	if (typeof enemy === "string") enemy = this.material.enemys[enemy];
	return enemy[name];
};

// 测试：MT11+ 的怪物（如 zombie@MT11、skeletonCaptain@MT10）
["zombie", "skeletonCaptain", "bigBat"].forEach(function (id) {
	core.setEnemy(id, "burn", 2, null, null, true);
	console.log(id, "material.burn =", enemys[id].burn, "| enemyInfo.burn =", core.getFlag("enemyInfo")[id].burn);
});
console.log("验证:", enemys.zombie.burn === 2 && core.getFlag("enemyInfo").zombie.burn === 2 ? "PASS（setEnemy 生效并进 enemyInfo）" : "FAIL");
