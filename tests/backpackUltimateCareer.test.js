"use strict";
const test = require('node:test'), assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const read = name => fs.readFileSync(path.join(__dirname,'../project',name+'.js'),'utf8');
const clone = x => JSON.parse(JSON.stringify(x));
function fixture() {
    const context=vm.createContext({console,setTimeout,clearTimeout});
    for(const name of ['backpackBattleStatuses','backpackBattleRules','backpackBattleCore','backpackBattleEstimateKernel','weapons'])
        vm.runInContext(read(name),context);
    return {context,rules:context.backpackBattleRules_36e4a689_0f48_476f_92a7_1c12b3903e87,
        definitions:context.weaponDefinitions_9f2e6f5b_4b2c_4f8c_9a3d_7e1b6c0d5a44,
        kernel:context.backpackBattleEstimateKernel_69e88a3f_71f9_4df3_82a6_c4695b166a71};
}
function weapon(id,types,damage=10,interval=1000,combatRules=[]) {
    return {instanceId:id,name:id,row:0,col:0,cells:[[0,0]],weaponTypes:types,
        attributes:{minAttack:damage,maxAttack:damage,attackInterval:interval/100,attackIntervalTicks:interval,
            hitRate:1,ultimateGain:0,weaponTypes:types},combatRules};
}
function input(career,promotion,weapons) {
    return {randomSeed:12345,player:{hp:1000,maxHp:1000,career,promotion,buffs:[],debuffs:[]},
        enemy:{hp:1e30,maxHp:1e30,atk:0,attackIntervalTicks:501,buffs:[],debuffs:[]},weapons};
}
function actual(f,data,ticks) {
    let seed=data.randomSeed;
    const rt=f.context.createBackpackBattleRuntime_2f8f7df2_bf4f_45ea_8ec4_628e0e25a0dc({
        randBattle(n){seed=seed*16807%2147483647;const x=seed/2147483647;return n==null?x:Math.floor(x*n);},
        registerAnimationFrame(){},unregisterAnimationFrame(){}
    });
    rt.start(clone(data));const snapshot=rt.stepTicks(ticks);rt.destroy();return {snapshot,seed};
}
test('三职业混装：奥义只攻击本职业，通用池异职业仍普通攻击；两类预估与实战一致',()=>{
    for(const [career,eligible] of [['剑','sword'],['杖','staff'],['琴','harp']]) {
        const f=fixture();
        const ws=[weapon('battery',['拳'],1,100),weapon('sword',['剑'],10,500),
            weapon('staff',['杖'],20,500),weapon('harp',['乐器'],30,500)];
        ws[0].attributes.ultimateGain=100;
        const data=input(career,null,ws),before=JSON.stringify(data);
        const predicted=f.kernel.simulateDps(data), {snapshot,seed}=actual(f,data,500);
        const damage={sword:10,staff:20,harp:30}[eligible];
        // 5次电池普通出手触发5次奥义；tick500另有3件武器的普通出手。
        assert.equal(snapshot.enemy.damageTaken,5+5*damage+60);
        for(const w of snapshot.weapons)assert.equal(w.runtimeCounters.hits,w.instanceId==='battery'?5:w.instanceId===eligible?6:1);
        assert.equal(predicted.totalDamage,snapshot.enemy.damageTaken);
        assert.equal(predicted.randomSeedEnd,seed);
        const target=clone(data);target.enemy.hp=target.enemy.maxHp=predicted.totalDamage;
        assert.equal(f.kernel.simulate(target).ticks,500);
        assert.equal(JSON.stringify(data),before,'不修改存档快照');
    }
});
test('按多类型判定、包含转职类型和本职业证明，异职业证明不被道具类型误放行',()=>{
    const f=fixture();
    const eligible=(career,promotion,id)=>f.rules.isCareerWeapon(
        f.rules.createBattleState(input(career,promotion,[])),
        {name:f.definitions[id].name,weaponTypes:f.definitions[id].weaponTypes});
    for(const [career,promotion,ids] of [
        ['剑',null,['I400','I405','I501']],['剑','魔剑士',['I599','I372']],
        ['剑','双剑士',['I522']],['剑','盾誓士',['I568']],['剑','狂战士',['I560','I548']],
        ['杖',null,['I503','I609']],['杖','黑猫道士',['I584','I574']],
        ['杖','使役者',['I513','I408','I540']],['琴',null,['I519','I393','I518','I391']],
        ['琴','兽王',['I516','I558']],['琴','摇滚巨星',['I539','I523','I397']],
        ['琴','极乐净土',['I524','I594','I403']]
    ]) for(const id of ids)assert.equal(eligible(career,promotion,id),true,`${career}/${promotion}/${id}`);
    for(const [career,promotion,id] of [['杖',null,'I408'],['杖',null,'I540'],['琴',null,'I558'],['琴',null,'I397'],
        ['杖','使役者','I599'],['剑','魔剑士','I584'],['琴','兽王','I539']])
        assert.equal(eligible(career,promotion,id),false,`${career}/${promotion}/${id}`);
});
test('异职业奥义专属效果不执行，普通命中联动继续执行，且预估同步',()=>{
    for(const career of ['剑','杖']) {
        const f=fixture(), battery=weapon('battery',['拳'],1,100);
        battery.attributes.ultimateGain=100;
        const staff=weapon('staff',['杖'],10,1000);
        const foreign=weapon('stone',['召唤石'],0,0,[
            {trigger:'beforeAllyAttack',conditions:[{kind:'attackOrigin',value:'ultimate'}],effects:[{type:'modifyCurrentAttackCount',value:1}]},
            {trigger:'afterUltimate',effects:[{type:'dealDamage',target:'enemy',direct:true,value:100}]},
            {trigger:'afterAllyHit',effects:[{type:'dealDamage',target:'enemy',direct:true,value:3}]}
        ]);
        const data=input(career,null,[battery,staff,foreign]), {snapshot}=actual(f,data,100);
        // 剑士：电池普通1+命中联动3；术士：另有杖的奥义2段(10+3)*2和召唤石奥义效果100。
        assert.equal(snapshot.enemy.damageTaken,career==='剑'?4:130);
        assert.equal(f.kernel.simulateDps(data).totalDamage,career==='剑'?20:650);
    }
});
test('本职业证明的奥义效果生效；其他职业的被动物品不借奥义触发',()=>{
    const f=fixture(),battery=weapon('battery',['拳'],1,100);
    battery.attributes.ultimateGain=100;
    const proof=weapon('proof',['道具'],0,0,[{trigger:'afterUltimate',effects:[{type:'applyStatus',target:'self',status:'mark',stacks:12}]}]);
    proof.name=f.definitions.I599.name;
    for(const [career,promotion,count]of [['剑','魔剑士',12],['杖','使役者',0]]){
        const {snapshot}=actual(f,input(career,promotion,[battery,proof]),100);
        assert.equal(f.rules.getStatusStacks(snapshot.player,'mark'),count);
    }
});
test('职业和转职从当前存档快照读取；转职后预估缓存键随之变化',()=>{
    const flags={kaiju:'琴',zhuanzhi:null};
    const core={status:{hero:{hp:1000,hpmax:1000,name:'勇士'}},getFlag:(k,d)=>flags[k]??d};
    const context=vm.createContext({core,Number,Math});
    const getHero=read('backpackBattle').match(/\tvar getHeroSnapshot = function \(\) \{[^]*?\n\t\};/)[0];
    vm.runInContext(getHero+'\nthis.snapshot=getHeroSnapshot;',context);
    const first=clone(context.snapshot());assert.equal(first.career,'琴');assert.equal(first.promotion,null);
    flags.zhuanzhi='兽王';const second=clone(context.snapshot());assert.equal(second.promotion,'兽王');
    const jobs=[];
    context.Worker=function(){this.postMessage=x=>jobs.push(x);this.terminate=()=>{};};
    context.setTimeout=()=>0;
    vm.runInContext(read('backpackBattleEstimate'),context);
    const coordinator=context.createBackpackBattleEstimateCoordinator_f43e0d5b_629e_457c_9540_b3f0d0541ffc({
        createInput:()=>({currentHp:1000,randomSeed:12345,input:{player:clone(context.snapshot()),weapons:[]}})
    });
    flags.zhuanzhi=null;coordinator.request('backpackDpsDummy');
    flags.zhuanzhi='兽王';coordinator.request('backpackDpsDummy');
    assert.equal(jobs.length,2);assert.notEqual(jobs[0].cacheKey,jobs[1].cacheKey);
    coordinator.destroy();
});
