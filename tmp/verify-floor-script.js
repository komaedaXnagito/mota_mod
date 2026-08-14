// 验证：通过 map 数值 → maps.js 图块定义 收集怪物（模拟运行时 block.event）
const fs = require("fs");
const vm = require("node:vm");
const c = { console };
vm.createContext(c);
vm.runInContext(fs.readFileSync("project/enemys.js", "utf8"), c);
vm.runInContext(fs.readFileSync("project/maps.js", "utf8"), c);
const enemys = c.enemys_fcae963b_31c9_42b4_b48c_bb48d09f3f80;
const blockDefs = c.maps_90f36752_8815_4be8_b32b_d7fad1d0542e;

// 加载楼层
const floors = {};
for (let fn = 1; fn <= 50; fn++) {
  const file = "project/floors/MT" + fn + ".js";
  if (!fs.existsSync(file)) continue;
  const ctx = { console, main: { floors: {} } };
  vm.createContext(ctx);
  try {
    vm.runInContext(fs.readFileSync(file, "utf8"), ctx);
    const fid = "MT" + fn;
    if (ctx.main.floors[fid]) floors[fid] = ctx.main.floors[fid];
  } catch (e) { /* 忽略 */ }
}

// 通过 map 数值收集怪物：map 值是图块 ID（字符串），查 blockDefs[id].cls
const firstSeen = {};
const clsCount = {};
Object.keys(floors).forEach(function (fid) {
  const fn = Number(fid.replace(/\D/g, ""));
  const map = floors[fid].map;
  if (!Array.isArray(map)) return;
  map.forEach(function (row) {
    if (!Array.isArray(row)) return;
    row.forEach(function (cell) {
      if (cell == null || cell === 0 || cell === "") return;
      const id = String(cell);
      const def = blockDefs[id];
      if (!def) return;
      const cls = typeof def.cls === "string" ? def.cls : "";
      if (cls.indexOf("enemy") === 0) {
        clsCount[cls] = (clsCount[cls] || 0) + 1;
        const enemyId = def.id;
        if (enemyId && enemys[enemyId] && !(enemyId in firstSeen)) firstSeen[enemyId] = fn;
      }
    });
  });
});
console.log("怪物图块 cls 分布:", JSON.stringify(clsCount));
console.log("首次出现怪物数:", Object.keys(firstSeen).length);
const sample = Object.keys(firstSeen).slice(0, 10).map((id) => id + "@MT" + firstSeen[id]);
console.log("样例(首现楼层):", sample.join(", "));
