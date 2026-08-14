// 扫描 enemys.js：怪物行格式与数据分布
const fs = require("fs");
const src = fs.readFileSync("project/enemys.js", "utf8");
const re = /"([A-Za-z0-9_]+)":\s*(\{[^}]*\})/g;
let m, count = 0, hasData = 0, hasInterval = 0, hasUltGain = 0, multiLine = 0;
const atkList = [], hpList = [];
while ((m = re.exec(src))) {
	count++;
	let obj;
	try { obj = JSON.parse(m[2]); } catch (e) { multiLine++; continue; }
	const a = Number(obj.atk) || 0, d = Number(obj.def) || 0, h = Number(obj.hp) || 0;
	if (a > 0 || d > 0 || h > 0) hasData++;
	if (obj.attackInterval != null) hasInterval++;
	if (obj.ultimateGain != null) hasUltGain++;
	if (a > 0) atkList.push(a);
	if (h > 0) hpList.push(h);
}
atkList.sort((a, b) => a - b); hpList.sort((a, b) => a - b);
const pct = (arr, p) => arr.length ? arr[Math.min(arr.length - 1, Math.floor(arr.length * p))] : "-";
console.log("匹配到怪物行:", count, "| 解析失败(跨行):", multiLine);
console.log("有攻防血数据:", hasData, "| 已有attackInterval:", hasInterval, "| 已有ultimateGain:", hasUltGain);
console.log("atk 分位(25/50/75/90/100):", pct(atkList, .25), pct(atkList, .5), pct(atkList, .75), pct(atkList, .9), pct(atkList, 1));
console.log("hp 分位(25/50/75/90/100):", pct(hpList, .25), pct(hpList, .5), pct(hpList, .75), pct(hpList, .9), pct(hpList, 1));
console.log("atk 最大值:", atkList.length ? atkList[atkList.length - 1] : "-", "| hp 最大值:", hpList.length ? hpList[hpList.length - 1] : "-");
