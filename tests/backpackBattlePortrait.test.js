"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const root = path.resolve(__dirname, "..");
const uiSource = fs.readFileSync(path.join(root, "project/backpackBattleUI.js"), "utf8");
const extract = name => uiSource.match(new RegExp("\\tvar " + name + " = function \\([^]*?\\n\\t\\};"))[0];

function portraitContext(reducedMotion = false) {
    const draws = { player: [], enemy: [] };
    const canvas = side => ({
        style: {}, getContext() { return { canvas: { width: 384, height: 384 }, clearRect() {},
            drawImage(...args) { draws[side].push(args); } }; }
    });
    const info = { image: { src: "enemies.png", width: 64, height: 320 }, animate: 2, height: 32, posY: 2 };
    const core = { values: { animateSpeed: 300 }, material: { images: {
        hero: { src: "hero.png", width: 128, height: 192 }, icons: {} } }, getBlockInfo() { return info; } };
    const context = vm.createContext({ core, window: { matchMedia: () => ({ matches: reducedMotion }) },
        nodes: { playerPortrait: canvas("player"), enemyPortrait: canvas("enemy") },
        playerPortraitSignature: "", enemyPortraitSignature: "", portraitAttackAge: -1 });
    vm.runInContext(["drawContain", "getEnemyPortraitFrame", "getEnemyPortraitTransform", "drawPortraits"].map(extract).join("\n"), context);
    return { context, core, info, draws };
}

test("怪物按素材帧数播放，32/48 像素素材不切换纵向怪物或越界", () => {
    const { context, info } = portraitContext();
    const frame = tick => context.getEnemyPortraitFrame(info, tick);
    assert.deepEqual([frame(0).sx, frame(30).sx, frame(60).sx], [0, 32, 0]);
    assert.equal(frame(30).sy, 64);
    Object.assign(info, { height: 48, animate: 4, image: { width: 128, height: 480 } });
    assert.deepEqual([frame(90).sx, frame(90).sy, frame(90).sh, frame(120).sx], [96, 96, 48, 0]);
    info.image.width = 64;
    assert.equal(frame(90).sx, 32, "配置帧数多于图片列数时不得读到图外");
    Object.assign(info, { cls: "tileset", posX: 1 });
    assert.equal(frame(60).sx, 32, "静态图块保留原始列号");
});

test("大怪物使用引擎裁剪，1×4 与四方向图集均只播放当前朝向", () => {
    const { context, core } = portraitContext();
    const mapsSource = fs.readFileSync(path.join(root, "libs/maps.js"), "utf8");
    const engineFrame = mapsSource.match(/maps\.prototype\._getBigImageInfo = (function[^]*?\n})/)[1];
    core.material.icons = { hero: { down: { loc: 0 }, left: { loc: 1 }, right: { loc: 2 }, up: { loc: 3 } } };
    core.maps = { _getBigImageInfo: vm.runInContext("(" + engineFrame + ")", context) };
    const info = { bigImage: { width: 320, height: 512 }, animate: 4, face: "up" };
    const frame = context.getEnemyPortraitFrame(info, 90);
    assert.deepEqual([frame.sx, frame.sy, frame.sw, frame.sh], [240, 384, 80, 128]);
    info.bigImage.height = 80;
    const strip = context.getEnemyPortraitFrame(info, 30);
    assert.deepEqual([strip.sx, strip.sy, strip.sw, strip.sh], [80, 0, 80, 80]);
});

test("怪物换帧独立重绘；暂停冻结帧与动作，恢复后继续，支持晚加载图片", () => {
    const { context, info, draws } = portraitContext();
    const snapshot = { tick: 0, enemy: { id: "slime", lastAttackTick: -1 } };
    context.drawPortraits(snapshot);
    snapshot.tick = 30;
    context.drawPortraits(snapshot);
    assert.equal(draws.player.length, 1);
    assert.equal(draws.enemy.length, 2);
    const pose = context.nodes.enemyPortrait.style.transform;
    snapshot.paused = true;
    context.drawPortraits(snapshot);
    assert.equal(draws.enemy.length, 2);
    assert.equal(context.nodes.enemyPortrait.style.transform, pose);
    snapshot.paused = false;
    snapshot.tick = 60;
    context.drawPortraits(snapshot);
    assert.equal(draws.enemy.length, 3);
    info.image.width = 0;
    context.drawPortraits(snapshot);
    info.image.width = 64;
    context.drawPortraits(snapshot);
    assert.equal(draws.enemy.length, 4);
    assert.notEqual(context.getEnemyPortraitTransform(103, 100), context.getEnemyPortraitTransform(103, -1));
});

test("减少动态效果及立即结算时保持静态立绘", () => {
    for (const reduced of [false, true]) {
        const { context, draws } = portraitContext(reduced);
        const snapshot = { tick: 30, fastForwarding: !reduced, enemy: { id: "slime", lastAttackTick: 20 } };
        context.drawPortraits(snapshot);
        snapshot.tick = 60;
        context.drawPortraits(snapshot);
        assert.equal(draws.enemy.length, 1);
        assert.equal(draws.enemy[0][1], 0);
        assert.equal(context.nodes.enemyPortrait.style.transform, "none");
    }
});

test("出手标记覆盖命中、未命中和奥义；暂停不推进、不增加随机调用", () => {
    for (const [hitRate, ultimateGain, expectedHits] of [[1, 0, 1], [0, 0, 1], [1, 100, 3]]) {
        let rngCalls = 0, onFrame;
        const context = vm.createContext({ console: { log() {}, error: console.error }, setTimeout, clearTimeout });
        for (const name of ["backpackBattleStatuses", "backpackBattleRules", "backpackBattleCore"]) {
            vm.runInContext(fs.readFileSync(path.join(root, "project", name + ".js"), "utf8"), context);
        }
        const runtime = context.createBackpackBattleRuntime_2f8f7df2_bf4f_45ea_8ec4_628e0e25a0dc({
            randBattle() { rngCalls++; return .5; }, registerAnimationFrame(name, playing, callback) { onFrame = callback; },
            unregisterAnimationFrame() {}
        });
        runtime.start({ player: { hp: 1000, maxHp: 1000 }, enemy: { id: "slime", hp: 1000, atk: 10,
            attackIntervalTicks: 100, hitRate, ultimateGain }, weapons: [] });
        assert.equal(runtime.getSnapshot().enemy.lastAttackTick, -1);
        runtime.stepTicks(115);
        const snapshot = runtime.getSnapshot();
        assert.equal(snapshot.enemy.lastAttackTick, 100);
        assert.equal(snapshot.enemy.attackSequence, expectedHits);
        assert.equal(snapshot.enemy.hitSequence, hitRate ? expectedHits : 0);
        assert.equal(rngCalls, expectedHits);
        assert.equal(snapshot.player.hp, hitRate ? 1000 - expectedHits * 10 : 1000);
        runtime.pause();
        onFrame(1000); onFrame(2000);
        assert.equal(runtime.getSnapshot().tick, 115);
        runtime.resume();
        onFrame(3000); onFrame(3150);
        assert.equal(runtime.getSnapshot().tick, 130);
        runtime.abort();
        runtime.start({ player: { hp: 1000 }, enemy: { hp: 1000 }, weapons: [] });
        assert.equal(runtime.getSnapshot().enemy.lastAttackTick, -1);
        runtime.destroy();
    }
});
