// 验证：打开商店不自动刷新（货架持久化）
const fs = require("fs");
const vm = require("node:vm");
const c = { console };
vm.createContext(c);
vm.runInContext(fs.readFileSync("project/weapons.js", "utf8"), c);
const flagStore = {};
const mkEl = () => ({
	className: "", style: {}, dataset: {}, textContent: "",
	children: [],
	appendChild(el) { this.children.push(el); return el; },
	addEventListener() {}, setAttribute() {}, querySelector() { return mkEl(); }
});
const core = {
	status: { hero: { money: 100000 }, thisMap: { ratio: 3 } },
	getFlag: (k) => flagStore[k],
	setFlag: (k, v) => { flagStore[k] = v; },
	drawTip() {}, playSound() {}, updateStatusBar() {}, insertAction() {},
	plugin: {}
};
core.plugin["背包"] = { addBackpackWeapon() { return "i"; } };
c.core = core;
c.document = { createElement: () => mkEl(), body: { appendChild() {} } };
c.backpackUiCommon_2c986f67_7621_44eb_972d_24f1e2c6ce61 = { bindTooltip() {}, buildWeaponTooltip() { return ""; } };
vm.runInContext(fs.readFileSync("project/backpackShop.js", "utf8"), c);
const fn = c.installBackpackShop_d7c3f1a9_5b2e_4a86_9d3f_7c1e2b8a44f6;
const shop = {};
fn(core, shop);

// 首次打开 → 生成货架并保存
shop.openBackpackShop();
const first = shop.getShopState().offer.slice();
console.log("首次货架:", first.join(","));
console.log("货架已存 flag:", !!flagStore["__backpack_shop_offer__"]);

// 关闭再打开 → 货架应保持不变（不自动刷新）
shop.closeBackpackShop();
shop.openBackpackShop();
const second = shop.getShopState().offer.slice();
console.log("重开后货架相同:", JSON.stringify(first) === JSON.stringify(second) ? "PASS（未自动刷新）" : "FAIL");
console.log("刷新次数 flag:", flagStore["__backpack_shop_refresh__"] || 0, "(期望 0：未花钱刷新)");

// 手动刷新 → 货架变化且刷新次数+1
shop.closeBackpackShop();
core.status.hero.money = 1000;
// 直接调用刷新（通过 UI 按钮不可行，用状态模拟：doRefresh 未导出，检查 getShopState）
console.log("DONE");
