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

function flightFixture(count = 1) {
    let now = 0, serial = 0, randomIndex = 0;
    const callbacks = new Map(), sprites = [], numbers = [], liveNumbers = new Set(), live = new Set();
    const layout = { start: { x: 140, y: 100 }, end: { x: 400, y: 160 }, size: 84, width: 600, height: 300 };
    const motion = { matches: false };
    const visualMath = Object.create(Math);
    visualMath.random = () => (++randomIndex * .173) % 1;
    const context = vm.createContext({ Math: visualMath, window: { matchMedia: () => motion }, document: { hidden: false },
        performance: { now: () => now }, requestAnimationFrame(cb) { callbacks.set(++serial, cb); return serial; },
        cancelAnimationFrame(id) { callbacks.delete(id); } });
    vm.runInContext(fs.readFileSync(path.join(root, "project/backpackBattleFeedback.js"), "utf8"), context);
    const feedback = context.createBackpackWeaponFlightFeedback({ appendChild: el => (el.isDamage ? liveNumbers : live).add(el) }, () => layout, weapon => {
        const el = { id: weapon.instanceId, dataset: {}, style: {}, remove() { live.delete(el); } };
        sprites.push(el); return el;
    }, (damage, id) => {
        const el = { id, damage, isDamage: true, style: {}, remove() { liveNumbers.delete(el); } };
        numbers.push(el); return el;
    });
    const snapshot = { active: true, paused: false, speed: 1,
        weapons: Array.from({ length: count }, (_, i) => ({ instanceId: "weapon" + i, image: "weapon.png", attackSequence: 3,
            effectiveIntervalTicks: 200, cooldownProgress: 0 })) };
    feedback.update(snapshot);
    return { context, feedback, snapshot, callbacks, sprites, live, numbers, liveNumbers, layout, motion,
        attack(amount = 1) { snapshot.weapons.forEach(w => { w.attackSequence += amount; w.cooldownProgress = 0; }); feedback.update(snapshot); },
        prepare(ms) { snapshot.weapons.forEach(w => w.cooldownProgress = 1 - ms / 10 / w.effectiveIntervalTicks); feedback.update(snapshot); },
        advance(ms) { now += ms; const pending = [...callbacks.values()]; callbacks.clear(); pending.forEach(cb => cb(now)); } };
}

test("剩余0.5秒才开始准备，按实际冷却凝实、轻微浮动，出手时沿原位置转入650ms飞行", () => {
    const f = flightFixture();
    assert.equal(f.live.size, 0, "首次快照不得播放历史攻击");
    f.prepare(600); assert.equal(f.live.size, 0);
    f.prepare(500);
    const sprite = f.sprites[0];
    assert.equal(sprite.dataset.phase, "preparing");
    assert.equal(sprite.style.opacity, "0");
    const first = sprite.style.transform;
    f.advance(250); f.prepare(250);
    assert.equal(sprite.style.opacity, "0.5");
    assert.notEqual(sprite.style.transform, first, "凝实时有上下浮动");
    assert.equal(sprite.style.transform.match(/rotate\([^)]+/)[0], first.match(/rotate\([^)]+/)[0], "准备期间不提前旋转飞行");
    f.advance(250); f.prepare(0);
    assert.equal(sprite.style.opacity, "1");
    const prepared = sprite.style.transform;
    f.attack();
    assert.equal(f.sprites.length, 1, "同一个图标无缝衔接两个阶段");
    assert.equal(sprite.dataset.phase, "flying");
    assert.equal(sprite.style.transform, prepared, "出手位置沿用准备阶段，不重新随机或跳位");
    f.advance(325);
    assert.equal(f.live.size, 1); assert.equal(sprite.style.opacity, "1");
    assert.notEqual(sprite.style.transform.match(/rotate\([^)]+/)[0], prepared.match(/rotate\([^)]+/)[0]);
    f.advance(324);
    const nearImpactX = Number(sprite.style.transform.match(/translate3d\(([^p]+)/)[1]);
    assert.ok(nearImpactX > 398 && nearImpactX < 400);
    f.advance(1);
    assert.equal(f.live.size, 0);
    assert.equal(f.callbacks.size, 0);
});

test("超过10件只准备10件，已准备的10件都能飞出；10倍速连击不重启、不补播", () => {
    const f = flightFixture(14);
    f.snapshot.speed = 10;
    f.prepare(500);
    assert.equal([...f.live].filter(s => s.dataset.phase === "preparing").length, 10);
    f.prepare(250);
    assert.equal(f.sprites.length, 10, "相同冷却周期不能不断替换可见武器");
    f.attack();
    assert.equal(f.live.size, 10);
    assert.ok([...f.live].every(s => s.dataset.phase === "flying"));
    const sprite = f.sprites[0];
    f.advance(100);
    const pose = sprite.style.transform;
    f.attack(10);
    assert.equal(f.sprites.length, 10);
    assert.equal(sprite.style.transform, pose);
    f.advance(550);
    f.feedback.update(f.snapshot);
    assert.equal(f.live.size, 0, "被跳过的攻击不能排队补播");
    f.prepare(500);
    assert.deepEqual(f.sprites.slice(10).map(s => s.id), ["weapon10", "weapon11", "weapon12", "weapon13", "weapon0", "weapon1", "weapon2", "weapon3", "weapon4", "weapon5"]);
});

test("每轮准备随机分布在角色附近，位置跨快照保持；重置冷却取消准备，零间隔不准备", () => {
    const f = flightFixture(10); f.prepare(500);
    const positions = f.sprites.map(s => s.style.transform);
    assert.equal(new Set(positions).size, 10);
    f.feedback.update(f.snapshot);
    assert.deepEqual(f.sprites.map(s => s.style.transform), positions);
    f.prepare(800);
    assert.equal(f.live.size, 0, "被减速或重置冷却时退出准备");
    f.prepare(500);
    assert.notDeepEqual(f.sprites.slice(10).map(s => s.style.transform), positions);
    f.snapshot.weapons.forEach(w => w.effectiveIntervalTicks = 0); f.feedback.update(f.snapshot);
    assert.equal(f.live.size, 0);
});

test("准备和飞行均随暂停冻结，缩放重新定位，退出清理动画帧和节点", () => {
    const f = flightFixture();
    f.prepare(500); f.advance(100); f.prepare(400);
    const sprite = f.sprites[0], pose = sprite.style.transform;
    f.snapshot.paused = true; f.feedback.update(f.snapshot);
    f.advance(2000);
    assert.equal(sprite.style.transform, pose);
    assert.equal(f.callbacks.size, 0);
    f.layout.start.x += 20; f.layout.end.x += 20; f.layout.size *= .5;
    f.feedback.refresh();
    assert.notEqual(sprite.style.transform, pose);
    assert.match(sprite.style.transform, /scale\(0\.500\)/);
    const resized = sprite.style.transform;
    f.snapshot.paused = false; f.feedback.update(f.snapshot); f.advance(16);
    assert.equal(sprite.style.transform, resized, "暂停时间不能累计进飞行时长");
    f.advance(100); assert.notEqual(sprite.style.transform, resized);
    f.attack(); f.advance(100);
    f.snapshot.paused = true; f.feedback.update(f.snapshot);
    const flightPose = sprite.style.transform;
    f.advance(2000); assert.equal(sprite.style.transform, flightPose);
    f.feedback.destroy();
    assert.equal(f.live.size, 0); assert.equal(f.callbacks.size, 0);
});

test("后台与立即结算清空特效且不补播；减少动态效果保留凝实但不呼吸旋转", () => {
    for (const blocked of ["hidden", "fastForwarding", "active"]) {
        const f = flightFixture(); f.attack();
        if (blocked === "hidden") f.context.document.hidden = true;
        else f.snapshot[blocked] = blocked !== "active";
        f.attack();
        assert.equal(f.live.size, 0); assert.equal(f.callbacks.size, 0);
        f.context.document.hidden = false; f.snapshot.fastForwarding = false; f.snapshot.active = true;
        f.advance(500); f.feedback.update(f.snapshot);
        assert.equal(f.live.size, 0);
    }
    const f = flightFixture(); f.motion.matches = true; f.prepare(500);
    const first = f.sprites[0].style.transform;
    f.advance(250); f.prepare(250);
    assert.equal(f.sprites[0].style.transform, first);
    assert.equal(f.sprites[0].style.opacity, "0.5");
    f.attack(); f.advance(100);
    assert.match(f.sprites[0].style.transform, /translate3d\(400.00px,160.00px,0\).*rotate\(0.00deg\)/);
    assert.equal(f.sprites[0].style.opacity, "1");
});

test("冷却就绪但尚未实际出手时停留在角色处；提前奥义出手也可直接飞行", () => {
    const f = flightFixture(); f.prepare(0); f.advance(1500);
    assert.equal(f.sprites[0].dataset.phase, "preparing");
    assert.equal(f.sprites[0].style.opacity, "1");
    f.attack(); assert.equal(f.sprites[0].dataset.phase, "flying");
    const g = flightFixture(); g.attack();
    assert.equal(g.live.size, 1); assert.equal(g.sprites[0].dataset.phase, "flying");
});

test("武器轨迹以可见立绘为落点，游戏缩放不改变逻辑坐标", () => {
    const source = fs.readFileSync(path.join(root, "project/backpackBattleUI.js"), "utf8");
    const fn = source.match(/var getWeaponFlightLayout = function[^]*?\n\t\};/)[0];
    let scale = 1;
    const rect = (x, y, width, height) => () => ({ left: 30 + x * scale, top: 40 + y * scale,
        width: width * scale, height: height * scale, bottom: 40 + (y + height) * scale });
    const context = { nodes: {
        weaponFlightLayer: { clientWidth: 800, clientHeight: 300, getBoundingClientRect: rect(0, 0, 800, 300) },
        playerArt: { hidden: false, naturalWidth: 200, naturalHeight: 300, getBoundingClientRect: rect(140, 0, 280, 300) },
        enemyPortrait: { getBoundingClientRect: rect(480, 0, 120, 300) }
    }, core: {}, getEnemyPortraitFrame: () => null, root: { dataset: { mobile: "false" } } };
    const getLayout = vm.runInNewContext(fn + "\ngetWeaponFlightLayout;", context);
    const normal = getLayout();
    assert.equal(normal.start.x, 280);
    assert.ok(normal.spread.x > 120 && normal.spread.y > 100, "扩大横纵随机出现范围");
    assert.equal(normal.end.x, 540);
    assert.ok(normal.end.y > 240 && normal.end.y < 245, "怪物在底部居中显示，不能瞄准空白的元素中部");
    scale = .5;
    assert.deepEqual(getLayout(), normal);
    context.root.dataset.mobile = "true";
    assert.equal(getLayout().size, 52);
});

test("飞行抵达才显示该次命中伤害，新攻击不能改写在途数值；数字上浮并淡出", () => {
    const f = flightFixture();
    f.snapshot.weapons[0].lastAttackResult = { sequence: 4, hit: true, damage: 17.125 };
    f.attack(); f.advance(300);
    f.snapshot.weapons[0].lastAttackResult = { sequence: 5, hit: true, damage: 88 };
    f.attack(); f.advance(349);
    assert.equal(f.liveNumbers.size, 0);
    f.advance(1);
    assert.equal(f.live.size, 0);
    assert.equal(f.liveNumbers.size, 1);
    const number = f.numbers[0];
    assert.equal(number.damage, 17.125);
    assert.equal(number.style.opacity, "1");
    const y = s => Number(s.match(/translate3d\([^,]+,([^p]+)/)[1]);
    const firstY = y(number.style.transform);
    f.advance(550);
    assert.ok(y(number.style.transform) < firstY);
    assert.ok(Number(number.style.opacity) > 0 && Number(number.style.opacity) < 1);
    f.advance(550);
    assert.equal(f.liveNumbers.size, 0); assert.equal(f.callbacks.size, 0);
    f.feedback.update(f.snapshot);
    assert.equal(f.numbers.length, 1, "节流丢弃的后续攻击不会补播伤害数字");
});

test("未命中及旧攻击结果不冒伤害数字，全格挡的实际命中显示0", () => {
    for (const [result, count] of [
        [{ sequence: 4, hit: false, damage: 0 }, 0],
        [{ sequence: 3, hit: true, damage: 20 }, 0],
        [{ sequence: 4, hit: true, damage: 0 }, 1]
    ]) {
        const f = flightFixture(); f.snapshot.weapons[0].lastAttackResult = result;
        f.attack(); f.advance(650);
        assert.equal(f.liveNumbers.size, count);
        if (count) assert.equal(f.numbers[0].damage, 0);
    }
});

test("伤害数字暂停、缩放、恢复与退出；高倍速同时最多十个且位置错开", () => {
    const f = flightFixture(14);
    f.snapshot.weapons.forEach(w => w.lastAttackResult = { sequence: 4, hit: true, damage: 12 });
    f.attack(); f.advance(650);
    assert.equal(f.liveNumbers.size, 10);
    assert.equal(new Set(f.numbers.map(n => n.style.transform)).size, 10);
    f.snapshot.paused = true; f.feedback.update(f.snapshot);
    const number = f.numbers[0], pose = number.style.transform;
    f.advance(2000); assert.equal(number.style.transform, pose);
    f.layout.end.x += 20; f.feedback.refresh();
    assert.notEqual(number.style.transform, pose);
    const resized = number.style.transform;
    f.snapshot.paused = false; f.feedback.update(f.snapshot); f.advance(16);
    assert.equal(number.style.transform, resized);
    f.snapshot.weapons.forEach(w => w.lastAttackResult = { sequence: 5, hit: true, damage: 15 });
    f.attack(); f.advance(650);
    assert.equal(f.liveNumbers.size, 10, "新一波命中替换最旧数字，不能无限堆积");
    f.feedback.destroy();
    assert.equal(f.liveNumbers.size, 0); assert.equal(f.callbacks.size, 0);
});
