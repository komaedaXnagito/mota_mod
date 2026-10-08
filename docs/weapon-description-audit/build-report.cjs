"use strict";
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..');
const source=fs.readFileSync(path.join(root,'project/weapons.js'),'utf8');
const c=vm.createContext({});vm.runInContext(source,c);
const defs=c.weaponDefinitions_9f2e6f5b_4b2c_4f8c_9a3d_7e1b6c0d5a44;
const notes=JSON.parse(fs.readFileSync(path.join(__dirname,'review-notes.json'),'utf8'));
const evidence=JSON.parse(fs.readFileSync(path.join(__dirname,'evidence.json'),'utf8'));
assert.equal(Object.keys(defs).length,159);assert.equal(Object.keys(notes).length,159);
for(const id of Object.keys(defs))assert.equal(typeof notes[id],'string',id);
notes.I566='动物立即攻击、每邻接动物自身冷却-0.15对应。复核发现匹配动物的conditionId实际存在；1个动物场景冷却确实-0.15，排除先前“完全无效”的疑点。多个动物时每个动物按数量叠加冷却减免，描述对这一点未明确。';
notes.I390='战后金币倍率+1对应100%；functions.afterBattle读取战斗结果倍率并结算。';
notes.I394='战后金币倍率+0.5对应50%；与其他金币加成按百分比加算，未发现明显不一致。';
notes.I405='自身奥义加10点，敌方按当前奥义减10%；初始各50实际变60/45。同句百分比口径不同，需要确认设计含义；多个邻盾同周期触发只给一次格挡1，次数口径也需确认。';
notes.I523='获取概率效果由items.I523.itemEffect调用addOdds(吉他,1)，shop按类型权重抽样，已追踪入口。';
notes.I596='初始20层强化时第一次命中仍无伤害+3，命中后才一次性永久加3。首次满足条件生效延迟已复现；强化减少后是否应撤销，描述未限定。';
notes.I609='已修复：beforeAllyAttack限定attackOrigin=ultimate，仅修改本次extraAttackCountBonus，不写入持久攻击次数；连续5次奥义、两份召唤石、实战与两类预估回归一致。';
// Global passive stacking is not specified; retain the actual overwrite behavior
// as a design question, unlike per-source bonuses where one source loses its own effect.
for(const result of evidence.results)if(result.key==='registration-overwrite'&&['I389','I524','I574'].includes(result.ids[0])) {
    result.classification='ambiguous';result.expected='每件登记目前互相覆盖；全局被动是否应多份叠加，描述未明确，需确认';
}
const questions={
    I405:'±10%的奥义是10个百分点还是当前值的10%；多个盾同周期是否各触发一次？',
    I406:'奥义是否应让0基础伤害辅助物品也立即发动效果？',
    I516:'动物获取是永久职业解锁还是必须持有证明；0伤害辅助物品是否参与奥义？',
    I513:'精灵获取是永久职业解锁还是必须持有证明？',
    I423:'3把同名是否要求与此武器同名？当前任意同名组即可。',
    I559:'奥义+100%是直接填满100还是在原有值上加100点？',
    I566:'多个动物时每个动物都减0.15×动物数，还是每个只减0.15？',
    I576:'奥义是否应让0基础伤害辅助物品也立即发动效果？',
    I596:'20强化条件不再满足时，已获得的伤害+3是否保留？',
    I599:'随机12弱体是独立抽12次还是抽1种加12层？'
};
const labels={'attack-vs-hit':'攻击被实现成命中','passive-afterAttack':'被动物品效果无法主动触发',
    'duplicate-food-damage':'布局和战斗加成重复','food-range':'高亮与执行范围不同',
    'source-included-as-neighbor':'邻接加成误包含来源','wolf-duration-as-damage':'剩余秒数误作伤害层数',
    'ultimate-after-damage':'本次奥义增伤结算过晚','wrong-stat':'伤害属性名错误',
    'animal-interval-rechecked':'动物冷却疑点已排除','recursive-extra':'追加攻击递归触发',
    'registration-overwrite':'不同实例注册互相覆盖','cross-weapon-id-collision':'不同武器注册ID冲突',
    'invincibility-shortened':'较短无敌覆盖较长无敌','heal-round-delay':'回血仅整秒检查',
    'self-damage-not-notified':'未监听其他武器自伤','strict-half-boundary':'高于/低于包含相等边界',
    'zero-neighbor-default-one':'0个邻接仍加弱体','threshold-waits-own-attack':'达到阈值仍等自身攻击',
    'first-attack-before-threshold-bonus':'满足条件的首击未获加成','blocked-damage-event-missing':'全格挡时条件不检查',
    'third-hp-boundary':'1/3边界误触发','shared-sacrifice-flag':'独立武器共享触发标记',
    'buff-bonus-delayed':'强化增伤推迟到首击之后','acquisition-odds-missing':'获取概率效果缺少入口',
    'ultimate-percent-wording':'百分比口径待确认','unlock-wording':'持有与职业解锁待确认',
    'same-name-wording':'同名组含义待确认','random-twelve-wording':'随机次数待确认',
    'zero-damage-ultimate-wording':'辅助物品奥义含义待确认'};
const rows=Object.entries(defs).map(([id,w],index)=>{
    const related=evidence.results.filter(r=>r.ids.includes(id));
    const confirmed=related.filter(r=>r.classification==='confirmed');
    const ambiguous=related.filter(r=>r.classification==='ambiguous');
    const line=source.slice(0,source.indexOf('\t"'+id+'": {')).split('\n').length;
    return {index:index+1,id,name:w.name,line,description:w.synergyText||w.description||'无特殊效果描述',
        status:id==='I609'?'已修复':confirmed.length?'确认问题':ambiguous.length||questions[id]?'描述待确认':'未发现明显不一致',
        notes:notes[id],question:questions[id]||null,
        issues:confirmed.map(r=>Object.assign({title:labels[r.key]},r)),
        ambiguities:ambiguous.map(r=>Object.assign({title:labels[r.key]},r)),
        layoutRules:w.synergyRules||[],combatRules:w.combatRules||[]};
});
const counts={total:rows.length};for(const row of rows)counts[row.status]=(counts[row.status]||0)+1;
const report={date:'2026-10-09',counts,scope:evidence.scope,hashes:evidence.hashes,
    verification:'node docs/weapon-description-audit/verify.cjs；71项复现场景/代码入口核对。人工对照覆盖159件；未穷举所有组合。',
    regression:'DPS与伤害专项15/15通过。完整backpackBattle套件116/123通过，7项失败与未修改I609的HEAD基线相同（前一轮已做基线对比）。',
    limitations:['数值复现场景中有意控制基础伤害、冷却、命中和奥义获取；各项已说明。',
        '本次只修复用户明确要求的I609。其余为审查发现，尚未修改。',
        '攻击时按出手解释，与已有“攻击命中时”描述作区别。全局多份叠加、随机抽取口径单列为待确认。',
        '无明显问题指静态逐条对照未发现矛盾，不代表所有战斗组合都通过动态测试。'],rows};
fs.writeFileSync(path.join(__dirname,'report.json'),JSON.stringify(report,null,2)+'\n');
fs.writeFileSync(path.join(__dirname,'review-notes.json'),JSON.stringify(notes,null,2)+'\n');
const esc=x=>String(x).replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
function detail(r){return `<details><summary>${esc(r.title)}</summary><p>场景：${esc(r.fixture)}</p><p>按描述：${esc(r.expected)}</p><pre>实际：${esc(JSON.stringify(r.actual,null,2))}</pre></details>`;}
const html=`<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>159件武器描述与实现核对</title><style>
body{font:16px/1.7 system-ui,sans-serif;margin:0;background:#f4f6fa;color:#193047}main{max-width:1200px;margin:auto;padding:28px}h1{font-size:28px}p{margin:10px 0}.stats{display:flex;gap:12px;flex-wrap:wrap}.stats span{background:white;padding:10px 16px;border-radius:8px}input,select{padding:10px;font:inherit;margin:12px 8px 12px 0;border:1px solid #b5c4d4;border-radius:6px}table{width:100%;border-collapse:collapse;background:white}th,td{border-bottom:1px solid #dbe2eb;padding:14px;text-align:left;vertical-align:top}th{background:#e4ecf5;position:sticky;top:0}th:first-child{width:170px}th:nth-child(2){width:100px}td p{white-space:pre-line}small{color:#637286}pre{white-space:pre-wrap;overflow-wrap:anywhere;background:#f4f6fa;padding:10px;font-size:13px}details{border-top:1px solid #e6eaf0;padding:7px 0}summary{cursor:pointer;font-weight:600}.bad{color:#b83825}.fixed{color:#167450}.amb{color:#815c12}@media(max-width:700px){main{padding:12px}th,td{padding:8px}th:first-child{width:110px}table{font-size:14px}}
</style><main><h1>159 件武器：描述与实现逐件核对</h1><p>2026-10-09 · 当前工作区版本</p><div class="stats">${Object.entries(counts).map(([k,v])=>`<span>${esc(k==='total'?'已核对':k)} <b>${v}</b></span>`).join('')}</div><p>${esc(report.scope)}</p><p>格里姆尼尔（终突）已修复；其余发现尚未修改。展开问题可看复现场景及实际数值。</p><details><summary>核对方法和范围</summary>${report.limitations.map(x=>`<p>${esc(x)}</p>`).join('')}<p>${esc(report.verification)}</p><p>${esc(report.regression)}</p><pre>${esc(JSON.stringify(report.hashes,null,2))}</pre></details><input id="search" placeholder="搜索名称、ID、效果或问题" aria-label="搜索武器"><select id="status" aria-label="筛选结果"><option value="">全部结果</option>${Object.keys(counts).filter(x=>x!=='total').map(x=>`<option>${esc(x)}</option>`).join('')}</select><span id="shown"></span><table><thead><tr><th>武器</th><th>结果</th><th>描述、逐件核对及证据</th></tr></thead><tbody>${rows.map(r=>`<tr data-status="${esc(r.status)}" id="${r.id}"><td><b>${esc(r.name)}</b><br><small>${r.index} / 159 · ${r.id}<br>weapons.js:${r.line}</small></td><td class="${r.status==='确认问题'?'bad':r.status==='已修复'?'fixed':r.status==='描述待确认'?'amb':''}">${esc(r.status)}</td><td><details><summary>原始描述</summary><p>${esc(r.description)}</p></details><p>${esc(r.notes)}</p>${r.question?`<p class="amb">待确认：${esc(r.question)}</p>`:''}${r.issues.map(detail).join('')}${r.ambiguities.map(detail).join('')}<details><summary>布局和战斗规则</summary><pre>${esc(JSON.stringify({layout:r.layoutRules,combat:r.combatRules},null,2))}</pre></details></td></tr>`).join('')}</tbody></table></main><script>
const search=document.querySelector('#search'),status=document.querySelector('#status'),rows=[...document.querySelectorAll('tbody tr')];
function filter(){let n=0;const q=search.value.trim().toLowerCase();for(const row of rows){row.hidden=!!((status.value&&row.dataset.status!==status.value)||(q&&!row.textContent.toLowerCase().includes(q)));if(!row.hidden)n++;}document.querySelector('#shown').textContent=n+' / 159';}search.addEventListener('input',filter);status.addEventListener('change',filter);filter();
</script></html>`;
fs.writeFileSync(path.join(__dirname,'report.html'),html);
console.log(JSON.stringify(counts));
