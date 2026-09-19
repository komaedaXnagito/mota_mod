"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const root = path.resolve(__dirname, "..");

function fixture() {
    let now = 0, serial = 0;
    const callbacks = new Map(), sounds = [], poses = [], draws = [], stopped = [];
    const animates = {};
    for (const name of ["hand", "sword", "thunder"]) {
        const raw = JSON.parse(fs.readFileSync(path.join(root, "project/animates/" + name + ".animate"), "utf8"));
        animates[name] = { ratio: raw.ratio, se: raw.se, images: raw.bitmaps.map((b, i) => b && ({ name: name + i, width: 96, height: 96 })),
            frames: raw.frames.map(frame => frame.map(a => ({ index: a[0], x: a[1], y: a[2], zoom: a[3], opacity: a[4], mirror: a[5], angle: a[6] }))) };
    }
    const ctx = { clearRect() {}, save() {}, restore() {}, translate() {}, scale() {}, rotate() {}, drawImage(image) { draws.push(image.name); } };
    const canvas = { width: 384, height: 384, hidden: true, getContext: () => ctx };
    const core = { material: { animates, sounds: { "attack.mp3": { duration: .12 }, "Sword4.ogg": { duration: .12 }, "zone.mp3": { duration: .12 } } },
        musicStatus: { playingSounds: {} }, playSound(name, pitch) {
            const id = ++serial; sounds.push({ name, pitch, time: now }); core.musicStatus.playingSounds[id] = true; return id;
        }, stopSound(id) { assert.notEqual(id, null); stopped.push(id); delete core.musicStatus.playingSounds[id]; } };
    const context = vm.createContext({ core, canvas, window: { matchMedia: () => ({ matches: false }) }, document: { hidden: false },
        performance: { now: () => now }, requestAnimationFrame(cb) { const id = ++serial; callbacks.set(id, cb); return id; },
        cancelAnimationFrame(id) { callbacks.delete(id); } });
    vm.runInContext(fs.readFileSync(path.join(root, "project/backpackBattleFeedback.js"), "utf8"), context);
    const feedback = context.createBackpackBattleFeedback_245cd186_8d73_4ad6_8e23_114d7eaf0d89(core, canvas, (age, recoil) => poses.push([age, recoil]));
    const snapshot = { active: true, paused: false, speed: 1, enemy: { attackSequence: 0, hitSequence: 0, battleAttackEffect: "hand" } };
    feedback.update(snapshot);
    return { core, context, canvas, feedback, snapshot, sounds, poses, draws, stopped, callbacks,
        advance(ms) { now += ms; const pending = [...callbacks.values()]; callbacks.clear(); pending.forEach(cb => cb(now)); },
        endSounds() { core.musicStatus.playingSounds = {}; },
        attack(hit = true) { snapshot.enemy.attackSequence++; if (hit) snapshot.enemy.hitSequence++; feedback.update(snapshot); } };
}

test("普通、持剑、法师分别使用 hand、sword、thunder；一段动画只播一次可用音效", () => {
    for (const type of ["hand", "sword", "thunder"]) {
        const f = fixture();
        f.snapshot.enemy.battleAttackEffect = type;
        f.attack();
        assert.equal(f.canvas.hidden, false);
        assert.equal(f.sounds[0].name, type === "sword" ? "Sword4.ogg" : type === "thunder" ? "zone.mp3" : "attack.mp3");
        assert.ok(f.draws[0].startsWith(type));
        f.feedback.update(f.snapshot);
        f.advance(35); f.advance(40); f.advance(45);
        assert.equal(f.sounds.length, 1);
        f.advance(200);
        assert.equal(f.canvas.hidden, true);
        assert.equal(f.callbacks.size, 0);
    }
});

for (const [type, duration] of [["hand", 240], ["sword", 175], ["thunder", 320]]) {
test(type + " 在 10× 和同一帧多次出手时合并，不重启、不叠音、不在结束后补播", () => {
    const f = fixture();
    f.snapshot.enemy.battleAttackEffect = type;
    f.snapshot.speed = 10;
    f.attack();
    const first = f.draws.length;
    f.snapshot.enemy.attackSequence += 3;
    f.snapshot.enemy.hitSequence += 3;
    f.feedback.update(f.snapshot);
    assert.equal(f.draws.length, first);
    assert.equal(f.sounds.length, 1);
    f.advance(duration);
    f.attack(); // 动画结束后仍处于真实时间节流窗。
    assert.equal(f.canvas.hidden, true);
    f.advance(420 - duration);
    f.endSounds();
    f.feedback.update(f.snapshot); // 被丢弃的攻击不会排队补播。
    assert.equal(f.sounds.length, 1);
    f.attack();
    assert.equal(f.sounds.length, 2);
});
}

test("长音效未结束时保持门控，暂停冻结特效，恢复不重播声音", () => {
    const f = fixture();
    f.core.material.sounds["attack.mp3"].duration = .8;
    f.attack(); f.advance(60);
    f.snapshot.paused = true;
    f.feedback.update(f.snapshot);
    const drawCount = f.draws.length, poseCount = f.poses.length;
    f.advance(1000);
    assert.equal(f.draws.length, drawCount);
    assert.equal(f.poses.length, poseCount);
    assert.equal(f.callbacks.size, 0);
    assert.equal(f.stopped.length, 1);
    f.snapshot.paused = false;
    f.feedback.update(f.snapshot); f.advance(16); f.advance(35);
    assert.equal(f.sounds.length, 1);
    assert.ok(f.draws.length > drawCount);
    f.feedback.destroy();
    assert.equal(f.canvas.hidden, true);
    assert.equal(f.callbacks.size, 0);
    assert.deepEqual(f.poses.at(-1), [-1, 0]);

    const g = fixture();
    g.core.material.sounds["attack.mp3"].duration = .8;
    g.attack(); g.advance(500); g.attack();
    assert.equal(g.sounds.length, 1);
    g.advance(400); g.attack(); // 引擎仍报告音效正在播放。
    assert.equal(g.sounds.length, 1);
    g.endSounds(); g.attack();
    assert.equal(g.sounds.length, 2);
});

test("未命中只出手；后台、立即结算及首次打开不会播放历史命中特效", () => {
    const f = fixture();
    f.attack(false);
    assert.equal(f.sounds.length, 0);
    assert.equal(f.canvas.hidden, true);
    assert.equal(f.poses.at(-1)[0], 0);
    f.snapshot.fastForwarding = true;
    f.attack();
    f.snapshot.fastForwarding = false;
    f.advance(400);
    f.feedback.update(f.snapshot);
    assert.equal(f.sounds.length, 0);
    f.context.document.hidden = true; f.attack();
    f.context.document.hidden = false; f.feedback.update(f.snapshot);
    assert.equal(f.sounds.length, 0);
    f.attack();
    assert.equal(f.sounds.length, 1);
    f.feedback.destroy();
    assert.equal(f.callbacks.size, 0);
});

test("出手在 30ms 达到前探峰值，150ms 收回；配置通过战斗快照保留", () => {
    const source = fs.readFileSync(path.join(root, "project/backpackBattleUI.js"), "utf8");
    const transform = source.match(/var getEnemyPortraitTransform = function[^]*?\n\t\};/)[0];
    const getTransform = vm.runInNewContext(transform + "\ngetEnemyPortraitTransform;");
    assert.match(getTransform(100, null, 3), /\* -1\.0000/);
    assert.match(getTransform(100, null, 15), /\* 0\.0000/);
    const context = vm.createContext({});
    for (const name of ["backpackBattleStatuses", "backpackBattleRules", "enemys", "data"]) {
        vm.runInContext(fs.readFileSync(path.join(root, "project", name + ".js"), "utf8"), context);
    }
    const rules = context.backpackBattleRules_36e4a689_0f48_476f_92a7_1c12b3903e87;
    const enemies = context.enemys_fcae963b_31c9_42b4_b48c_bb48d09f3f80;
    assert.equal(rules.createBattleState({ enemy: enemies.swordsman }).enemy.battleAttackEffect, "sword");
    assert.equal(rules.createBattleState({ enemy: enemies.greenSlime }).enemy.battleAttackEffect, "hand");
    for (const id of ["bluePriest", "grayPriest", "redPriest", "blackMagician", "brownWizard", "redWizard",
        "blackKing", "skeletonPriest", "skeletonWizard", "demonPriest"]) {
        assert.equal(rules.createBattleState({ enemy: enemies[id] }).enemy.battleAttackEffect, "thunder", id);
    }
    const data = Object.entries(context).find(([key]) => key.startsWith("data_"))[1];
    assert.ok(data.main.animates.includes("thunder"), "雷电必须加入真实游戏资源加载清单");
    assert.ok(data.main.sounds.includes("zone.mp3"), "回退音效必须可加载");
    assert.equal(rules.createBattleState({ enemy: { battleAttackEffect: "unknown" } }).enemy.battleAttackEffect, "hand");
});
