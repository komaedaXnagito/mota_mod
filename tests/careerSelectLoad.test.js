"use strict";
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

function fixture({cached = false, vertical = false} = {}) {
    const nodes = {}, frames = new Map(), pendingReads = [], draws = [];
    let serial = 0, clock = 0, titleDraws = 0;
    const element = tag => {
        const el = {tagName:tag.toUpperCase(),style:{},listeners:{},children:[],paused:true,readyState:3,
            addEventListener(type, callback) { (this.listeners[type] ||= []).push(callback); },
            emit(type, event = {}) { (this.listeners[type] || []).forEach(cb=>cb(event)); },
            setAttribute() {}, appendChild(child) { this.children.push(child); nodes[child.id] = child; },
            insertAdjacentElement(where, child) { nodes[child.id] = child; },
            getBoundingClientRect() { return {left:0,top:0,width:vertical?416:676,height:vertical?676:416}; },
            focus() {}, play() { this.paused=false; return Promise.resolve(); }, pause() { this.paused=true; }
        };
        el.getContext = () => ({canvas:el,clearRect() {titleDraws++;},fillRect() {},save() {},restore() {},
            createLinearGradient() {return {addColorStop() {}};}});
        return el;
    };
    const dom = {};
    for (const id of ['gameGroup','startPanel','startTop','startButtonGroup','startButtons','levelChooseButtons','startBackground']) {
        dom[id] = nodes[id] = element('div'); dom[id].style.display='block';
    }
    const document = Object.assign(element('document'),{hidden:false,createElement:element,getElementById:id=>nodes[id] || null});
    const main = {dom,version:'test',mode:'play',savePages:30};
    const core = {dom,domStyle:{isVertical:vertical},plugin:{},status:{played:false,event:{}},
        saves:{saveIndex:1,autosave:{now:1}},control:{checkBgm() {},_loadFavoriteSaves() {},
            _showStartAnimate_finished() {dom.startPanel.style.display='block';core.status={played:false,event:{}};}},
        maps:{_setHDCanvasSize(ctx,w,h) {ctx.canvas.width=w;ctx.canvas.height=h;}},
        isPlaying:()=>core.status.played,isReplaying:()=>!!core.replaying,
        clearStatus() {core.status={played:false,event:{}};},clearMap() {},playSound() {},
        getSaves(ids, callback) { const finish=()=>callback(Object.fromEntries(ids.map((id,i)=>[i,null])));
            if(cached)finish();else pendingReads.push(finish); }
    };
    const context = vm.createContext({core,main,document,console,Image:function(){this.complete=false;},
        fantasyUI_6f31b8ea_7c4d_4b67_a215_03b247f8e903:{tokens:{},drawHexButtonOn() {}},
        window:{performance:{now:()=>clock},requestAnimationFrame(cb) {frames.set(++serial,cb);return serial;},
            cancelAnimationFrame(id) {frames.delete(id);},addEventListener() {}},
        getComputedStyle:el=>el.style});
    // 使用原引擎的入口和异步读档流程，避免只验证自定义菜单的代码形状。
    const eventsSource=read('libs/events.js'), uiSource=read('libs/ui.js');
    vm.runInContext('function events(){};function ui(){};'+eventsSource.match(/events.prototype.load = function[^]*?\n}/)[0]
        + '\n' + ['_drawSLPanel','_drawSLPanel_loadSave'].map(name=>uiSource.match(new RegExp('ui.prototype.'+name+' = function[^]*?\\n}'))[0]).join('\n'),context);
    core.events=new context.events(); core.events.startGame=()=>{};
    core.events._checkStatus=(id)=>{core.status.event={id,data:null};return true;};
    core.ui=new context.ui(); core.ui._drawSLPanel_draw=()=>draws.push(core.status.event.id);
    core.load=arg=>core.events.load(arg);
    vm.runInContext(read('project/careerSelect.js'),context);
    context.installCareerSelect_54c7b8d1_6f26_4c48_9f45_1d87a2bb4df0(core,core.plugin);
    const show=()=>core.control._showStartAnimate_finished(false);
    show();
    return {core,nodes,draws,frames,pendingReads,show,
        enter(key='Enter') {const menu=nodes.careerTitleCanvas;menu.emit('keydown',{key:'ArrowDown',preventDefault(){}});menu.emit('keydown',{key,preventDefault(){},stopPropagation(){}});},
        release(key='Enter') {const event={key,preventDefault(){this.prevented=true;},stopPropagation(){this.stopped=true;}};document.emit('keyup',event);return event;},
        flush() {while(pendingReads.length)pendingReads.shift()();},
        frame() {clock+=100;const callbacks=[...frames.values()];frames.clear();callbacks.forEach(cb=>cb(clock));},
        get titleDraws(){return titleDraws;}};
}

test('续关立即关闭独立标题视频和标题绘制，慢速读档完成后面板不被遮挡', () => {
    for(const vertical of [false,true]) {
        const f=fixture({vertical});
        assert.equal(f.nodes.careerTitleVideo.paused,false);
        f.enter();
        assert.equal(f.core.status.event.id,'load');
        assert.equal(f.nodes.startPanel.style.display,'none');
        assert.equal(f.nodes.careerTitleCanvas.style.display,'none');
        assert.equal(f.nodes.careerTitleVideo.style.display,'none');
        assert.equal(f.nodes.careerTitleVideo.paused,true);
        assert.equal(f.draws.length,0,'可以等待异步存档，但不能继续覆盖读档画布');
        const count=f.titleDraws;f.frame();f.frame();
        assert.equal(f.titleDraws,count);assert.equal(f.frames.size,0);
        f.flush();assert.deepEqual(f.draws,['load']);
    }
});

test('缓存立即返回、取消后重开及两种读档入口均同步标题层，媒体晚到不会重新遮挡', () => {
    const f=fixture({cached:true});
    for(const load of [()=>f.core.load(),()=>f.core.events.load(),()=>f.enter()]) {
        load();
        assert.equal(f.nodes.careerTitleVideo.style.display,'none');
        for(const event of ['loadeddata','canplay','playing'])f.nodes.careerTitleVideo.emit(event);
        assert.equal(f.nodes.careerTitleVideo.style.display,'none');
        assert.equal(f.nodes.careerTitleCanvas.style.display,'none');
        f.show();
        assert.equal(f.nodes.careerTitleCanvas.style.display,'block');
        assert.equal(f.nodes.careerTitleVideo.style.display,'block');
        assert.equal(f.nodes.careerTitleVideo.paused,false);
    }
    assert.deepEqual(f.draws,['load','load','load']);
});

test('引擎忽略读档时保留标题菜单，游戏内读档沿用引擎行为', () => {
    const f=fixture();f.core.replaying=true;f.core.load();
    assert.equal(f.nodes.startPanel.style.display,'block');
    assert.equal(f.nodes.careerTitleCanvas.style.display,'block');
    assert.equal(f.nodes.careerTitleVideo.paused,false);assert.equal(f.pendingReads.length,0);
    f.core.replaying=false;f.core.plugin.careerSelect.hideTitle();
    f.nodes.startPanel.style.display='none';f.core.status.played=true;
    f.core.load(true);assert.equal(f.core.status.played,true);assert.equal(f.core.status.event.id,'load');
    f.flush();assert.deepEqual(f.draws,['load']);assert.equal(f.nodes.careerTitleVideo.style.display,'none');
});

test('标题确认的回车或空格只打开读档，抬键不落到新面板误选存档', () => {
    for(const key of ['Enter',' ']) {
        const f=fixture();f.enter(key);assert.equal(f.core.status.event.id,'load');
        const released=f.release(key);assert.ok(released.prevented && released.stopped);
        assert.equal(f.release(key).stopped,undefined,'后续按键仍由读档面板正常处理');
        assert.equal(f.release('Escape').stopped,undefined,'不拦截返回键');
    }
});
