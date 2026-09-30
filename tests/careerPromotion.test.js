"use strict";
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const read = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
const plain = value => JSON.parse(JSON.stringify(value));

function fixture(base, vertical = false, headless = false) {
    const nodes = {}, removed = [], timers = [], labels = [], dialogues = [];
    let document;
    const element = tag => {
        const el = {style:{},listeners:{},paused:true,readyState:3,attributes:{},
            addEventListener(type, fn) {(this.listeners[type] ||= []).push(fn);},
            emit(type, event) {(this.listeners[type] || []).forEach(fn => fn(event));},
            setAttribute(key, value) {this.attributes[key] = value;},
            appendChild(child) {nodes[child.id] = child;},
            insertAdjacentElement(where, child) {nodes[child.id] = child;},
            getBoundingClientRect() {return {left:0,top:0,width:vertical?416:676,height:vertical?676:416};},
            focus() {document.activeElement = this;},
            pause() {this.paused = true;}, play() {this.paused = false;return Promise.resolve();}
        };
        const gradient = () => ({addColorStop() {}});
        const ctx = new Proxy({canvas:el,createLinearGradient:gradient,createRadialGradient:gradient,
            measureText:text=>({width:String(text).length*12})}, {get:(obj,key)=>key in obj?obj[key]:()=>{}});
        el.getContext = () => ctx;
        return el;
    };
    document = Object.assign(element('document'), {hidden:false,createElement:element,getElementById:id=>nodes[id]});
    document.activeElement = element('button');
    const focusBefore = document.activeElement;
    const dom = {};
    for (const id of ['gameGroup','startPanel','startTop','startButtonGroup','startButtons','levelChooseButtons','startBackground','outerBackground','outerUI']) {
        dom[id] = nodes[id] = element('div');dom[id].style.display = 'block';
    }
    dom.outerBackgroundVideos = [element('video')];
    const flags = {kaiju:base,randomList:['existing']}, inventory = {};
    const core = {dom,domStyle:{isVertical:vertical},plugin:{},material:{images:{images:{}}},
        status:{floorId:'MT29',played:true,event:{},hero:{hp:100,image:'original.png'},route:[],replay:{speed:24,toReplay:[]},autoEvents:[]},
        control:{_showStartAnimate_finished() {},_replay_error(error) {throw Error(error);}},
        maps:{_setHDCanvasSize(ctx,w,h) {ctx.canvas.width=w;ctx.canvas.height=h;}},
        ui:{closePanel() {core.status.event={};},drawChoices() {}},
        isPlaying:()=>true,isReplaying:()=>!!core.replaying,
        getFlag:(id,fallback)=>flags[id] ?? fallback,setFlag:(id,value)=>flags[id]=value,hasFlag:id=>!!flags[id],
        itemCount:id=>inventory[id] || 0,getItem:(id,n)=>inventory[id]=(inventory[id] || 0)+n,
        setItem:(id,n)=>inventory[id]=n,removeBlock:(x,y,floor)=>removed.push([x,y,floor]),
        setHeroIcon:name=>core.status.hero.image=name,
        updateStatusBar() {},clearUI() {},clearRouteFolding() {},replay() {},registerResize() {},
        push:(a,b)=>a.push(...b),unshift:(a,b)=>a.unshift(...(Array.isArray(b)?b:[b])),
        replaceText:t=>t,doFunc:(fn,owner,...args)=>fn.apply(owner,args),
        encodeBase64:text=>Buffer.from(text).toString('base64'),showStartAnimate() {throw Error('转职返回不得重开标题');}
    };
    const main = {dom,version:'test',mode:'play',floors:{},replayChecking:headless};
    const theme = new Proxy({tokens:{},drawLabelOn(ctx,text) {labels.push(text);}}, {get:(o,k)=>k in o?o[k]:()=>{}});
    const context = vm.createContext({core,main,flags,document,console,dialogues,Image:function(){},
        setTimeout:fn=>timers.push(fn),clearTimeout() {},clearInterval() {},
        window:{addEventListener() {},setInterval:()=>1,clearInterval() {},requestAnimationFrame:()=>1,cancelAnimationFrame() {}},
        fantasyUI_6f31b8ea_7c4d_4b67_a215_03b247f8e903:theme});
    vm.runInContext(read('libs/events.js')+'\n'+read('project/items.js')+'\n'+read('project/floors/MT29.js'),context);
    vm.runInContext(`
        core.clone = value => value == null ? value : JSON.parse(JSON.stringify(value));
        core.calValue = value => {
            if (typeof value !== 'string') return value;
            if (value.startsWith('flag:')) return core.getFlag(value.slice(5), 0);
            if (value.startsWith('item:')) return core.itemCount(value.slice(5));
            return eval(value);
        };
        core.events = Object.create(events.prototype);
        core.events.actions = {};
        core.events.precompile = core.clone;
        core.events._action_text = data => {
            dialogues.push({text:data.text,image:core.status.hero.image});
            core.doAction();
        };
        core.doAction = () => core.events.doAction();
        core.insertAction = (...args) => core.events.insertAction(...args);
    `, context);
    core.material.items = context[Object.keys(context).find(key=>key.startsWith('items_'))];
    if (headless) {
        context.document = {};
        context.window = {};
        context.Image = function () {throw Error('Headless replay must not preload title images');};
    }
    vm.runInContext(read('project/careerSelect.js'),context);
    context.installCareerSelect_54c7b8d1_6f26_4c48_9f45_1d87a2bb4df0(core,core.plugin);
    const start = () => {core.events.setEvents(main.floors.MT29.events['1,9'],1,9);core.doAction();};
    const key = value => {const event={key:value,preventDefault(){this.prevented=true;},stopPropagation(){this.stopped=true;}};
        nodes.careerSelect.emit('keydown',event);document.emit('keyup',event);return event;};
    return {core,flags,inventory,removed,nodes,document,focusBefore,labels,dialogues,main,start,key,
        flush() {while(timers.length)timers.shift()();}};
}

const cases = [
    ['剑',0,'狂战士',['I560'],['I559','I416','I537','I548','I372','I421','I509','I598']],
    ['剑',1,'双剑士',['I522'],['I372','I421','I509','I598']],
    ['剑',2,'盾誓士',['I568'],['I372','I421','I509','I598']],
    ['剑',3,'魔剑士',['I599'],['I372','I421','I509','I598']],
    ['杖',0,'黑猫道士',['I584'],['I554','I574','I418','I508','I593','I567']],
    ['杖',1,'使役者',['I513'],['I514','I544','I409','I408','I389','I551','I556','I540']],
    ['琴',0,'兽王',['I516'],['I588','I600','I601','I558','I572','I566']],
    ['琴',1,'摇滚巨星',['I539','I523'],['I397','I403','I404','I523','I594']],
    ['琴',2,'极乐净土',['I524'],['I397','I403','I404','I594']]
];

test('九种转职共用开局界面，横竖屏确认后只发放原奖励，结束事件并恢复游戏', () => {
    for (const vertical of [false,true]) for (const [base,index,name,items,pool] of cases) {
        const f=fixture(base,vertical);f.start();
        assert.equal(f.nodes.careerSelect.style.display,'block');
        assert.equal(f.nodes.careerTitleVideo.paused,false);
        for(let i=0;i<index;i++)f.key('ArrowRight');
        assert.ok(f.nodes.careerSelect.attributes['aria-label'].includes(name));
        assert.ok(f.labels.includes('职业：'+name));
        const confirmed=f.key('Enter');
        assert.ok(confirmed.stopped && confirmed.prevented);
        assert.equal(f.flags.kaiju,base);assert.equal(f.flags.zhuanzhi,name);
        const appearances = {
            '狂战士':['wolf_walk.webp','wolf_character.webp'],
            '双剑士':['double_sword.webp','double_sword_character.webp'],
            '盾誓士':['shield_walk.webp','shield_character.webp'],
            '魔剑士':['magicsword_walk.webp','magicsword_character.webp']
        };
        assert.equal(f.core.status.hero.image,appearances[name]?.[0] || 'original.png');
        if(appearances[name]) assert.equal(f.core.plugin.careerSelect.getCurrentAppearance().portrait,appearances[name][1]);
        assert.ok(f.dialogues.length > 1,'开场及转职说明均正常出现');
        assert.ok(f.dialogues.every(dialogue=>dialogue.text.startsWith('\t[艾露达,N447]')),'转职对话的头像和标题统一为艾露达');
        assert.ok(f.dialogues.slice(1).every(dialogue=>dialogue.image === (appearances[name]?.[0] || 'original.png')),'先切换行走图，再显示任何转职后的对话');
        assert.deepEqual(f.inventory,Object.fromEntries(items.map(id=>[id,1])));
        assert.deepEqual(plain(f.flags.randomList),['existing',...pool]);
        assert.deepEqual(f.removed,[[1,9,'MT29']]);
        assert.equal(f.core.status.event.id,undefined);
        assert.deepEqual(plain(f.core.status.route),['choices:'+index]);
        assert.equal(f.nodes.careerSelect.style.display,'none');
        assert.equal(f.nodes.outerUI.style.display,'block');
        assert.equal(f.nodes.careerTitleVideo.paused,true);
        assert.equal(f.document.activeElement,f.focusBefore);
        f.start();assert.deepEqual(f.inventory,Object.fromEntries(items.map(id=>[id,1])),'再次触发不重复奖励');
    }
});

test('取消转职保留 NPC、武器池与职业，可重新进入；取消及确认录像都能重放', () => {
    for(const [base,count] of [['剑',4],['杖',2],['琴',3]]) {
        const f=fixture(base);f.start();f.key('Escape');
        assert.deepEqual(f.inventory,{});assert.deepEqual(f.removed,[]);
        assert.deepEqual(f.flags.randomList,['existing']);assert.equal(f.flags.zhuanzhi,undefined);
        assert.equal(f.core.status.hero.image,'original.png','取消时不更换行走图');
        assert.deepEqual(plain(f.core.status.route),['choices:'+count]);
        f.start();f.key('ArrowRight');f.key(' ');
        const replay=fixture(base);replay.core.replaying=true;
        replay.core.status.replay.toReplay=plain(f.core.status.route);
        replay.start();replay.flush();
        assert.equal(replay.flags.zhuanzhi,undefined);assert.deepEqual(replay.removed,[]);
        replay.start();replay.flush();
        assert.equal(replay.flags.zhuanzhi,f.flags.zhuanzhi);
        assert.equal(replay.core.status.hero.image,f.core.status.hero.image,'录像同样应用转职行走图');
        assert.deepEqual(replay.inventory,f.inventory);
        assert.deepEqual(plain(replay.flags.randomList),plain(f.flags.randomList));
        assert.equal(replay.nodes.careerSelect,undefined,'录像不等待界面输入');
    }
});

test('小偷仍在 (6,2) 打通暗道；其他选项与开局选职保持原行为', () => {
    const f=fixture('剑');
    assert.equal(f.main.floors.MT29.map[9][1],447);
    const thief=f.main.floors.MT29.events['6,2'];
    assert.ok(thief[0].includes('小偷'));
    assert.deepEqual(plain(thief.find(e=>e.type==='move').loc),[6,2]);
    assert.equal(thief.some(e=>e.type==='switch'),false);
    let nativeChoices=0;f.core.ui.drawChoices=()=>nativeChoices++;
    f.core.events._action_choices({choices:[{text:'普通选择'}]},6,2,'MT29@6@2');
    assert.equal(nativeChoices,1);assert.equal(f.nodes.careerSelect,undefined);
    f.core.doAction=()=>{};
    f.core.plugin.careerSelect.open();f.key('ArrowRight');f.key('Enter');
    assert.equal(f.flags.kaiju,'琴');assert.equal(f.flags.zhuanzhi,undefined);
    assert.ok(f.core.status.route[0].startsWith('input2:'));
});

test('无界面验算保留九种转职的录像选择、奖励、外观与取消路线', () => {
    for (const [base,index,name,items,pool] of cases) {
        const f=fixture(base,false,true);f.core.replaying=true;
        f.core.status.replay.toReplay=['choices:'+index];
        f.start();f.flush();
        assert.equal(f.flags.zhuanzhi,name);
        assert.deepEqual(f.inventory,Object.fromEntries(items.map(id=>[id,1])));
        assert.deepEqual(plain(f.flags.randomList),['existing',...pool]);
        assert.deepEqual(f.removed,[[1,9,'MT29']]);
        assert.deepEqual(plain(f.core.status.route),['choices:'+index]);
        assert.equal(f.nodes.careerTitleVideo,undefined);
        assert.equal(f.nodes.careerTitleCanvas,undefined);
        assert.equal(f.nodes.careerSelect,undefined);
    }
    for (const [base,count] of [['剑',4],['杖',2],['琴',3]]) {
        const f=fixture(base,false,true);f.core.replaying=true;
        f.core.status.replay.toReplay=['choices:'+count];
        f.start();f.flush();
        assert.equal(f.flags.zhuanzhi,undefined);
        assert.deepEqual(f.inventory,{});
        assert.deepEqual(f.removed,[]);
        assert.deepEqual(plain(f.core.status.route),['choices:'+count]);
        assert.equal(f.core.plugin.careerSelect.open(),false);
    }
});
