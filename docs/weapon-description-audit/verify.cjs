"use strict";
// Read-only audit: isolated VM and battle snapshots; never touches browser saves.
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const assert = require('node:assert/strict'), crypto = require('node:crypto');
const root = path.resolve(__dirname, '../..');
const clone = x => JSON.parse(JSON.stringify(x));
const c = vm.createContext({console, setTimeout, clearTimeout});
for (const f of ['backpackBattleStatuses','backpackBattleRules','backpackBattleCore','backpackBattleEstimateKernel','weapons','backpackWeaponSynergy','backpackWeaponSystem'])
    vm.runInContext(fs.readFileSync(path.join(root,'project',f+'.js'),'utf8'),c,{filename:f});
const D = c.weaponDefinitions_9f2e6f5b_4b2c_4f8c_9a3d_7e1b6c0d5a44;
const R = c.backpackBattleRules_36e4a689_0f48_476f_92a7_1c12b3903e87;
const plugin = {};
c.installBackpackWeaponSystem_41d4dd44_8f7d_4bbc_b890_80db42f1ad76({clone, material:{items:{}}},plugin);
const W = plugin.weaponSystem;
function entry(id, col=0, row=0, instanceId=id) {
    const weapon=W.normalizeWeapon(D[id]);
    return {instanceId,weapon,col,row,rotation:0};
}
function weapons(entries) {
    const attrs=W.calculateAttributes(entries).byInstanceId;
    return entries.map(e=>({instanceId:e.instanceId,name:e.weapon.name,col:e.col,row:e.row,rotation:0,
        cells:W.getOccupiedCells(e), attributes:attrs[e.instanceId], combatRules:e.weapon.combatRules||[]}));
}
function base(ws, player={},enemy={}) {
    return {player:Object.assign({hp:1000,maxHp:1000,buffs:[],debuffs:[]},player),
        enemy:Object.assign({hp:1e30,maxHp:1e30,atk:0,attackIntervalTicks:100000,buffs:[],debuffs:[]},enemy),weapons:ws};
}
function runtime(data,ticks,seed=12345) {
    const rt=c.createBackpackBattleRuntime_2f8f7df2_bf4f_45ea_8ec4_628e0e25a0dc({
        randBattle(n){seed=seed*16807%2147483647; const x=seed/2147483647; return n==null?x:Math.floor(x*n);},
        registerAnimationFrame(){},unregisterAnimationFrame(){}
    });
    rt.start(clone(data)); const s=rt.stepTicks(ticks); rt.destroy(); return s;
}
function state(entries,player={}) {return R.createBattleState(base(weapons(entries),player));}
const H={rollProbability:()=>true};
function run(s,w,trigger,context={}) {if(context.sourceSide==null)context.sourceSide='player';R.runCombatRules(s,w,trigger,context,H);}
function all(s,trigger,context={}) {R.runAllWeaponRules(s,trigger,Object.assign({sourceSide:'player'},context),H);}
const results=[];
function record(key,ids,fixture,actual,expected,classification='confirmed') {
    results.push({key,ids,fixture,actual:clone(actual),expected,classification});
}
// Positive seed, guaranteed misses; test both own and linked attack wording.
for (const id of ['I396','I410','I407','I426','I592','I513','I425','I554','I574','I588','I517','I606','I607','I608']) {
    const linked=D[id].combatRules.some(r=>r.trigger==='afterLinkedWeaponHit');
    let ws=weapons([entry(id),entry('I500',1,0,'attacker')]);
    ws.forEach(w=>Object.assign(w.attributes,{attackInterval:0,attackIntervalTicks:0,ultimateGain:0}));
    const source=ws.find(w=>w.instanceId===(linked?'attacker':id));
    Object.assign(source.attributes,{attackInterval:1,attackIntervalTicks:100,hitRate:0});
    const s=runtime(base(ws),1000);
    const holder=s.weapons.find(w=>w.instanceId===id);
    assert.equal(source.instanceId===(linked?'attacker':id),true);
    assert.equal((s.weapons.find(w=>w.instanceId===source.instanceId).runtimeCounters.hits||0),0);
    record('attack-vs-hit',[id],'10 次出手全部未命中；奥义获取设为0',
        {holderCounters:holder.runtimeCounters,modifiers:holder.runtimeModifiers,buffs:s.player.buffs},
        '描述中的攻击时／每N次攻击效果仍应按出手触发；实际只注册在命中事件');
}
for (const id of ['I560','I577','I584']) {
    let ws=weapons([entry(id),entry('I500',1,0)]);
    Object.assign(ws[1].attributes,{hitRate:1,ultimateGain:id==='I560'?100:0,attackInterval:1,attackIntervalTicks:100});
    const player=id==='I584'?{buffs:[{id:'mp',stacks:20}]}:{};
    const enemy=id==='I577'?{atk:200,attackIntervalTicks:100}:{};
    const s=runtime(base(ws,player,enemy),100);
    assert.equal(R.getStatusStacks(s.player,id==='I560'?'wolfSkin':'blackCharm'),0);
    if(id==='I577')assert.equal(s.player.hp,800);
    record('passive-afterAttack',[id],'原始被动间隔不改动；分别满足奥义100／HP损失200／MP20',
        {hp:s.player.hp,ultimate:s.player.ultimate,buffs:s.player.buffs},
        id==='I560'?'奥义消耗并获得10秒狼皮':id==='I577'?'回复30HP至830':'获得黑之魅力');
}
{
    const s=state([entry('I412'),entry('I518',1,0)]); all(s,'battleStart');
    const w=s.weapons.find(w=>w.instanceId==='I412');
    const bonus=w.attributes.minAttack-D.I412.minAttack+R.getNearbyDamageBonus(s,w);
    assert.equal(bonus,6);
    record('duplicate-food-damage',['I412'],'右侧放1个食物；同时计算布局和战斗加成',bonus,'+3');
    const wide=state([entry('I412'),entry('I518',1,-1)],{buffs:[{id:'highSpirit',stacks:10}]});
    const source=wide.weapons.find(w=>w.instanceId==='I412'), food=wide.weapons.find(w=>w.instanceId==='I518');
    run(wide,source,'beforeAttack',{attackOrigin:'normal',minimumDamage:10,maximumDamage:13});
    assert.equal(food.extraAttackCount||0,0);
    record('food-range',['I412'],'食物在右侧4×4高亮范围上边缘；消耗10强化',food.extraAttackCount||0,'食物攻击次数+1');
}
for(const id of ['I540','I569','I578','I584']) {
    const s=state([entry(id),entry('I500',1,0)],{buffs:[{id:'blackCharm',stacks:1}]});
    const source=s.weapons.find(w=>w.instanceId===id), neighbor=s.weapons.find(w=>w.instanceId==='I500');
    neighbor.attributes.weaponTypes=['精灵'];
    const rule=D[id].combatRules.find(r=>r.effects.some(e=>e.type==='modifyWeaponStat'&&e.weaponTarget==='nearby'));
    run(s,source,rule.trigger,{hitWeapon:neighbor,attackOrigin:'normal'});
    assert.ok(source.runtimeModifiers.some(m=>m.stat==='attack'&&m.value===1),id);
    record('source-included-as-neighbor',[id],'邻接精灵/武器；黑魅等前置条件满足，派发相应事件',source.runtimeModifiers,
        '只给邻接目标加伤，来源物品不属于自己的邻接范围');
}
{
    const s=state([entry('I548')],{buffs:[{id:'wolfSkin',stacks:10}]}); all(s,'battleStart');
    const bonus=R.getStatusWeaponDamageBonus(s,s.weapons[0]); assert.equal(bonus,100);
    record('wolf-duration-as-damage',['I548'],'狼皮剩余10秒',bonus,'固定+10伤害');
}
{
    const ws=weapons([entry('I581')]); Object.assign(ws[0].attributes,{minAttack:10,maxAttack:10,hitRate:1,attackInterval:1,attackIntervalTicks:100,ultimateGain:100});
    const s=runtime(base(ws,{}, {debuffs:[{id:'ice',stacks:3}]}),100);
    assert.equal(s.enemy.damageTaken,20);
    record('ultimate-after-damage',['I581'],'基础伤害固定10；初始敌冰3；普通命中加至4后立刻奥义',s.enemy.damageTaken,
        '普通10 + 奥义(10+4×2) = 28');
}
{
    const s=state([entry('I568'),entry('I548',1,0)]); all(s,'battleStart');
    const w=s.weapons.find(w=>w.instanceId==='I548'); const bonus=R.getWeaponStat(w,'minAttack',0)-w.attributes.minAttack;
    assert.equal(bonus,0);
    record('wrong-stat',['I568'],'盾骑士证书+斧；开局登记stat=damage',bonus,'斧伤害+3');
}
{
    const attrs=W.calculateAttributes([entry('I566'),entry('I563',1,0)]).byInstanceId;
    const diff=R.fixed(attrs.I563.attackInterval-D.I563.attackInterval);
    assert.equal(diff,-.15);
    record('animal-interval-rechecked',['I566'],'相邻1个动物；重新检查conditionId',diff,'-0.15；先前疑点排除','matched');
}
{
    const ws=weapons([entry('I509')]);Object.assign(ws[0].attributes,{minAttack:10,maxAttack:10,hitRate:1,attackInterval:1,attackIntervalTicks:100,ultimateGain:0});
    let s,seed;for(seed=1;seed<20000;seed++){s=runtime(base(ws),100,seed);if(s.weapons[0].runtimeCounters.hits>2)break;}
    assert.ok(seed<20000);
    record('recursive-extra',['I509'],'固定10伤害，只有1次正常出手；正随机种子'+seed,
        {hits:s.weapons[0].runtimeCounters.hits,damage:s.enemy.damageTaken},'至多2段；追加攻击不应再次给自己追加');
}
for(const [id,field,trigger] of [['I389','weaponDamageBonuses','battleStart'],['I412','nearbyDamageBonuses','battleStart'],['I413','nearbyExtraAttacks','battleStart'],['I415','nearbyIntervalBonuses','beforeReceiveDamage'],['I423','sameNameDamageBonuses','battleStart'],['I524','buffGainCounters','battleStart'],['I542','nearbyIntervalBonuses','beforeReceiveDamage'],['I558','nearbyThresholdExtraAttacks','battleStart'],['I573','nearbyDamageBonuses','beforeReceiveDamage'],['I574','mpConsumeCounters','battleStart']]) {
    const s=state([entry(id,0,0,'a'),entry(id,10,0,'b')]);all(s,trigger,{damage:20});
    const registrations=(s[field]||[]).length;
    assert.equal(registrations,1,`${id} registrations`);
    record('registration-overwrite',[id],'同时摆2个独立实例，观察'+field,registrations,'2件各自登记；实际同id互相覆盖');
}
{
    const s=state([entry('I415'),entry('I542',10,0)]);all(s,'beforeReceiveDamage',{damage:20});
    assert.equal(s.nearbyIntervalBonuses.length,1);
    record('cross-weapon-id-collision',['I415','I542'],'亵渎魔弹和贝尼迪共同登记shieldInterval',s.nearbyIntervalBonuses,'两把不同武器均保留登记');
}
for(const id of ['I571','I614','I615','I616','I617','I605']) {
    const s=state([entry('I418'),entry(id,5,0)],{buffs:[{id:'blackCharm',stacks:1}]});
    run(s,s.weapons.find(w=>w.instanceId==='I418'),'afterAttack');
    if(id==='I605')s.player.totalHpLost=100;
    run(s,s.weapons.find(w=>w.instanceId===id),id==='I605'?'roundStart':'battleStart');
    assert.ok(s.player.invincibleUntilTick<500);
    record('invincibility-shortened',['I418',id],'先获得500tick无敌，再触发较短无敌',s.player.invincibleUntilTick,'结束时间至少保持500');
}
for(const id of ['I549','I602','I603','I604','I605']) {
    const threshold=D[id].combatRules.find(r=>r.conditions).conditions.find(x=>x.kind==='hpLost').value;
    const s=runtime(base(weapons([entry(id)]),{}, {atk:threshold,attackIntervalTicks:10}),10);
    assert.equal(s.player.hp,1000-threshold);
    record('heal-round-delay',[id],'敌方tick10造成达到阈值的HP损失',s.player.hp,'达到阈值当时触发；当前只等整秒roundStart');
}
for(const id of ['I391','I534','I519']) {
    let ws=weapons([entry(id),entry('I395',4,0)]);
    Object.assign(ws[1].attributes,{attackInterval:.1,attackIntervalTicks:10,hitRate:1,ultimateGain:0});
    const data=base(ws,id==='I519'?{hp:340,maxHp:1000}:{});
    const s=runtime(data,100);
    const counters=s.weapons.find(w=>w.instanceId===id).runtimeCounters;
    assert.ok(!Object.keys(counters).some(k=>k.startsWith('ruleOnce:')));
    record('self-damage-not-notified',[id],'另一个武器持续自伤（I395）；达到损失/低血条件；无敌方主动攻击',
        {hp:s.player.hp,totalHpLost:s.player.totalHpLost,counters},'自伤满足描述条件也应触发');
}
for(const id of ['I562','I585','I575']) {
    const s=state([entry(id)],{hp:500,maxHp:1000});
    const context={minimumDamage:10,maximumDamage:10,sourceSide:'player',attackOrigin:'normal'};
    run(s,s.weapons[0],'beforeAttack',context);
    // I575 also has an unconditional 50% chance rule; isolate HP-only rule.
    if(id==='I575')assert.equal(context.minimumDamage,30);else assert.ok(context.minimumDamage>10);
    record('strict-half-boundary',[id],'恰好50%HP；概率分支在此受控为成功',context.minimumDamage,
        id==='I575'?'只有概率+10，HP低于条件不触发（应20）':'高于50%条件不触发（应10）');
}
{
    const s=runtime(base(weapons([entry('I599')])),0);
    const n=s.enemy.debuffs.reduce((n,x)=>n+x.stacks,0);assert.equal(n,1);
    record('zero-neighbor-default-one',['I599'],'0个邻接武器，战斗开始',s.enemy.debuffs,'0层弱体');
}
for(const id of ['I559','I593']) {
    const ws=weapons([entry(id)]);
    Object.assign(ws[0].attributes,{attackInterval:10,attackIntervalTicks:1000,ultimateGain:0});
    const s=runtime(base(ws,{buffs:[{id:'blackCharm',stacks:1}]},{atk:200,attackIntervalTicks:10}),10);
    assert.equal(s.player.hp,800);assert.equal(s.player.ultimate,0);
    record('threshold-waits-own-attack',[id],'tick10损血达到200；自身冷却尚未结束；黑魅存在',
        {hp:s.player.hp,ultimate:s.player.ultimate},id==='I559'?'达到损血条件时奥义+100':'达到损血条件时回复200HP');
}
{
    const ws=weapons([entry('I511'),...Array.from({length:4},(_,i)=>entry('I518',1,i,'food'+i))]);
    ws.filter(w=>w.instanceId!=='I511').forEach(w=>Object.assign(w.attributes,{attackInterval:0,ultimateGain:0}));
    Object.assign(ws.find(w=>w.instanceId==='I511').attributes,{minAttack:10,maxAttack:10,hitRate:1,ultimateGain:0});
    const s=runtime(base(ws),180);
    assert.equal(s.enemy.damageTaken,10);assert.equal(s.player.totalHpLost,200);
    record('first-attack-before-threshold-bonus',['I511'],'开局4件邻接扣200HP；基础伤害固定10；第1次攻击',
        {damage:s.enemy.damageTaken,hits:s.weapons.find(w=>w.instanceId==='I511').runtimeCounters.hits},'条件已满足，应3段×30=90');
}
for(const id of ['I586','I568']) {
    const ws=weapons([entry(id),entry('I510',1,0)]);
    const s=runtime(base(ws,{hp:900,maxHp:1000,buffs:[{id:'block',stacks:100}],debuffs:[{id:'darkness',stacks:10}]},
        {atk:20,attackIntervalTicks:10}),10);
    assert.equal(s.player.hp,900);
    assert.equal(R.getStatusStacks(s.player,'highSpirit'),0);
    if(id==='I586')assert.equal(R.getStatusStacks(s.player,'darkness'),10);
    record('blocked-damage-event-missing',[id],'敌方命中但全部由格挡抵消；10层弱体/邻接盾条件满足',
        {hp:s.player.hp,buffs:s.player.buffs,debuffs:s.player.debuffs},
        id==='I586'?'10弱体达到条件后净化并回血，不依赖HP是否又减少':'被攻击时仍应获得高扬1和格挡2');
}
{
    const s=state([entry('I519',0,0,'a'),entry('I519',5,0,'b')],{hp:300,maxHp:900});
    run(s,s.weapons[0],'afterTakeDamage');
    assert.equal(s.player.hp,600);
    s.player.hp=900;run(s,s.weapons[1],'afterAttack');assert.equal(s.player.hp,900);
    record('third-hp-boundary',['I519'],'恰好1/3HP，派发受到伤害事件',600,'低于1/3才回血，恰好1/3不触发');
    record('shared-sacrifice-flag',['I519'],'第1件触发低血回复后，将HP置满，派发第2件攻击后事件',s.player.hp,
        '第2件尚未触发自己的回复，攻击仍应自伤20至880');
}
{
    const ws=weapons([entry('I596')]);Object.assign(ws[0].attributes,{minAttack:10,maxAttack:10,hitRate:1,ultimateGain:0});
    const s=runtime(base(ws,{buffs:[{id:'highSpirit',stacks:20}]}),240);
    assert.equal(s.enemy.damageTaken,10);
    record('buff-bonus-delayed',['I596'],'初始已有20层强化；基础伤害固定10；第1次命中',s.enemy.damageTaken,
        '已达到条件，第1次伤害应13；实际命中后才永久加3');
}
{
    const itemsContext=vm.createContext({});vm.runInContext(fs.readFileSync(path.join(root,'project/items.js'),'utf8'),itemsContext);
    const itemTable=Object.values(itemsContext).find(x=>x&&x.I540);
    assert.ok(itemTable);assert.equal(itemTable.I540.itemEffect,undefined);assert.equal(D.I540.itemEffect,undefined);
    record('acquisition-odds-missing',['I540'],'中央定义、道具表和全项目ID钩子检索；对照I523已配置addOdds',
        {centralItemEffect:D.I540.itemEffect||null,itemEffect:itemTable.I540.itemEffect||null},
        '获取后提高精灵概率：未找到对应执行入口');
}
// The following are wording questions, with concrete observations retained.
{
    const s=state([entry('I405')]);s.player.ultimate=50;s.enemy.ultimate=50;
    run(s,s.weapons[0],'beforeReceiveDamage',{damage:20});
    assert.equal(s.player.ultimate,60);assert.equal(s.enemy.ultimate,45);
    record('ultimate-percent-wording',['I405'],'双方初始奥义50，被攻击事件',
        {player:s.player.ultimate,enemy:s.enemy.ultimate},'同一句±10%分别实现为10点和当前值10%；需确定百分比口径','ambiguous');
}
record('unlock-wording',['I513','I516'],'阅读MT29职业事件、职业描述、拾取入口',
    '职业选择一次性加入随机池；持有/移走证明不重新检查',
    '持有可获得是职业提示还是必须一直持有，描述未明确','ambiguous');
record('same-name-wording',['I423'],'阅读countGroupedWeapons与现有注释',
    '场上任意一组3把同名即可；不要求与此武器同名',
    '配置3个同名是否指本武器的3份，需确定','ambiguous');
record('random-twelve-wording',['I599'],'阅读随机弱体handler',
    '奥义随机选1种弱体，加12层',
    '12次各自抽取，还是1次抽取12层，需确定','ambiguous');
record('zero-damage-ultimate-wording',['I406','I516','I576'],'阅读resolveUltimate入队条件',
    '有冷却但0基础伤害的辅助物品不在奥义攻击队列',
    '奥义所有武器是否包含0伤害辅助物品，需确定','ambiguous');
fs.writeFileSync(path.join(__dirname,'evidence.json'),JSON.stringify({
    scope:'159件人工逐条对照，候选用下列隔离快照复现；基础属性被刻意控制的场景已说明。不是159件全部组合穷举。',
    hashes:Object.fromEntries(['weapons','backpackBattleRules','backpackBattleCore','backpackWeaponSystem'].map(f=>[f+'.js',crypto.createHash('sha256').update(fs.readFileSync(path.join(root,'project',f+'.js'))).digest('hex')])),
    results
},null,2)+'\n');
console.log(JSON.stringify({probes:results.length,confirmed:results.filter(x=>x.classification==='confirmed').length,matched:results.filter(x=>x.classification==='matched').length}));
