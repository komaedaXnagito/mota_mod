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
    const projectiles = [], liveProjectiles = new Set();
    const layout = { anchors: Array.from({ length: 10 }, (_, i) => ({ x: 100 + i % 3 * 45, y: 60 + Math.floor(i / 3) * 45 })),
        jitter: { x: 6, y: 5 }, end: { x: 400, y: 160 }, size: 84, width: 600, height: 300 };
    const motion = { matches: false };
    const visualMath = Object.create(Math);
    visualMath.random = () => (++randomIndex * .173) % 1;
    const context = vm.createContext({ Math: visualMath, window: { matchMedia: () => motion }, document: { hidden: false },
        performance: { now: () => now }, requestAnimationFrame(cb) { callbacks.set(++serial, cb); return serial; },
        cancelAnimationFrame(id) { callbacks.delete(id); } });
    vm.runInContext(fs.readFileSync(path.join(root, "project/backpackBattleFeedback.js"), "utf8"), context);
    const feedback = context.createBackpackWeaponFlightFeedback({ appendChild: el => (el.isDamage ? liveNumbers : el.isProjectile ? liveProjectiles : live).add(el) }, () => layout, weapon => {
        const el = { id: weapon.instanceId, dataset: { muzzleX: "4", muzzleY: "-32" }, style: {}, remove() { live.delete(el); } };
        sprites.push(el); return el;
    }, (damage, id) => {
        const el = { id, damage, isDamage: true, style: {}, remove() { liveNumbers.delete(el); } };
        numbers.push(el); return el;
    }, (kind, weapon) => {
        return Array.from({ length: kind === "music" ? 4 : 1 }, () => {
            const el = { id: weapon.instanceId, kind, isProjectile: true, style: {}, remove() { liveProjectiles.delete(el); } };
            projectiles.push(el); return el;
        });
    });
    const snapshot = { active: true, paused: false, speed: 1,
        weapons: Array.from({ length: count }, (_, i) => ({ instanceId: "weapon" + i, image: "weapon.png", attackSequence: 3,
            effectiveIntervalTicks: 200, cooldownProgress: 0 })) };
    feedback.update(snapshot);
    return { context, feedback, snapshot, callbacks, sprites, live, numbers, liveNumbers, projectiles, liveProjectiles, layout, motion,
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

test("十件武器各占一个标注点，小幅随机偏移且跨快照保持；重置冷却取消准备，零间隔不准备", () => {
    const f = flightFixture(10); f.prepare(500);
    const positions = f.sprites.map(s => s.style.transform);
    assert.equal(new Set(positions).size, 10);
    assert.equal(new Set(f.sprites.map(s => s.dataset.anchor)).size, 10, "准备时不能重复占用同一个点");
    f.sprites.forEach(sprite => {
        const [x, y] = sprite.style.transform.match(/translate3d\(([^p]+)px,([^p]+)/).slice(1).map(Number);
        const anchor = f.layout.anchors[Number(sprite.dataset.anchor)];
        assert.ok(Math.abs(x - anchor.x) <= 6.01);
        assert.ok(Math.abs(y - anchor.y) <= 5 + f.layout.size * .045 + .01, "纵向只允许小幅偏移和呼吸");
    });
    f.feedback.update(f.snapshot);
    assert.deepEqual(f.sprites.map(s => s.style.transform), positions);
    f.prepare(800);
    assert.equal(f.live.size, 0, "被减速或重置冷却时退出准备");
    f.prepare(500);
    assert.notDeepEqual(f.sprites.slice(10).map(s => s.style.transform), positions);
    f.snapshot.weapons.forEach(w => w.effectiveIntervalTicks = 0); f.feedback.update(f.snapshot);
    assert.equal(f.live.size, 0);
});

test("武器飞出释放点位，下一件只补空位，不挪动其他正在准备的武器", () => {
    const f = flightFixture(11); f.prepare(250);
    const first = f.sprites[0], occupied = f.sprites.slice(1).map(s => s.style.transform);
    f.snapshot.weapons[0].attackSequence++;
    f.snapshot.weapons[0].cooldownProgress = 0;
    f.feedback.update(f.snapshot);
    assert.equal(first.dataset.phase, "flying");
    assert.equal(f.sprites[10].dataset.anchor, first.dataset.anchor);
    assert.equal(f.sprites[10].dataset.phase, "preparing");
    assert.deepEqual(f.sprites.slice(1, 10).map(s => s.style.transform), occupied);
});

test("准备和飞行均随暂停冻结，缩放重新定位，退出清理动画帧和节点", () => {
    const f = flightFixture();
    f.prepare(500); f.advance(100); f.prepare(400);
    const sprite = f.sprites[0], pose = sprite.style.transform;
    f.snapshot.paused = true; f.feedback.update(f.snapshot);
    f.advance(2000);
    assert.equal(sprite.style.transform, pose);
    assert.equal(f.callbacks.size, 0);
    f.layout.anchors.forEach(p => p.x += 20); f.layout.end.x += 20; f.layout.size *= .5;
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
    assert.equal(normal.anchors.length, 10);
    assert.equal(normal.anchors[0].x, 222, "以object-fit后的可见立绘为准，不以容器空白为准");
    assert.equal(normal.anchors[1].y, -12, "头顶点在可见立绘上方");
    assert.equal(normal.anchors[9].y, 165, "最下方点位在左腰，不散落到腿部或倒计时上");
    assert.ok(normal.jitter.x <= 6 && normal.jitter.y <= 5);
    assert.equal(normal.end.x, 540);
    assert.ok(normal.end.y > 240 && normal.end.y < 245, "怪物在底部居中显示，不能瞄准空白的元素中部");
    scale = .5;
    assert.deepEqual(getLayout(), normal);
    context.root.dataset.mobile = "true";
    assert.equal(getLayout().size, 52);
    context.nodes.playerArt.getBoundingClientRect = rect(0, 0, 140, 100);
    assert.equal(getLayout().weaponSize, 30, "小竖屏随立绘收小特效，十点排布不能被大图标糊成一团");
    assert.equal(getLayout().size, 52, "缩小武器不改变伤害浮字的间距");
});

test("武器动画按形状校准：宽体收小，细长武器保留长度，联动格不参与", () => {
    const source = fs.readFileSync(path.join(root, "project/backpackBattleUI.js"), "utf8");
    const fn = source.match(/var getWeaponFlightScale = function[^]*?\n\t\};/)[0];
    const scale = vm.runInNewContext(fn + "\ngetWeaponFlightScale;", { normalizeCells: cells => cells });
    const weapon = count => ({ cells: Array.from({ length: count }, (_, i) => [0, i]) });
    assert.equal(scale(weapon(1)), 1);
    assert.equal(scale(weapon(2)), 1);
    const rectangle = (cols, rows) => ({cells: Array.from({length: cols * rows}, (_, i) => [i % cols, Math.floor(i / cols)])});
    assert.ok(scale(weapon(4)) > 1.09 && scale(weapon(4)) <= 1.12, "四格长杖不能按宽体体积过度缩小");
    assert.ok(scale(rectangle(2, 2)) > .8 && scale(rectangle(2, 2)) < .83);
    assert.ok(scale(rectangle(2, 3)) < scale(rectangle(2, 2)));
    assert.equal(scale(rectangle(10, 10)), .6, "大武器仍需清晰可见");
    assert.equal(scale(rectangle(4, 1)), scale(weapon(4)), "横向与纵向同形状使用同一缩放");
    assert.equal(scale({ cells: [[0, 0], [3, 3]], synergyCells: [[1, 0], [2, 0]] }), 1);
    assert.equal(scale({ cells: [[0, 0]], baseCells: weapon(6).cells, rotation: 90 }), scale(weapon(6)));
});

test("飞行抵达显示锁定伤害，动画期间的后续命中独立跳字；数字上浮并淡出", () => {
    const f = flightFixture();
    f.snapshot.weapons[0].lastAttackResult = { sequence: 4, hit: true, damage: 17.125 };
    f.attack(); f.advance(300);
    f.snapshot.weapons[0].lastAttackResult = { sequence: 5, hit: true, damage: 88 };
    f.attack(); f.advance(349);
    assert.equal(f.liveNumbers.size, 1);
    assert.equal(f.numbers[0].damage, 88, "动画正在飞行不能吞掉后续命中浮字");
    f.advance(1);
    assert.equal(f.live.size, 0);
    assert.equal(f.liveNumbers.size, 2);
    const number = f.numbers[1];
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
    assert.equal(f.numbers.length, 2, "重复快照及动画结束不能再显示同一次伤害");
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

test("十四件武器的伤害都显示；浮字暂停、缩放、恢复，高倍速最多二十四个且位置错开", () => {
    const f = flightFixture(14);
    f.snapshot.weapons.forEach(w => w.lastAttackResult = { sequence: 4, hit: true, damage: 12 });
    f.attack(); f.advance(650);
    assert.equal(f.liveNumbers.size, 14);
    assert.equal(new Set(f.numbers.map(n => n.style.transform)).size, 14);
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
    assert.equal(f.liveNumbers.size, 24, "保留更多命中；满额后替换最旧数字，不能无限堆积");
    assert.equal(f.numbers.length, 28, "两轮十四件武器的实际命中均产生浮字");
    f.feedback.destroy();
    assert.equal(f.liveNumbers.size, 0); assert.equal(f.callbacks.size, 0);
});

test("短间隔连续命中独立跳字，保留武器动画限流且同一序号不重复显示", () => {
    for (const types of [['剑'], ['铳'], ['弓'], ['吉他'], ['乐器']]) {
        const f = flightFixture();
        f.snapshot.weapons[0].weaponTypes = types;
        f.snapshot.speed = 10;
        for (let hit = 0; hit < 4; hit++) {
            f.snapshot.weapons[0].lastAttackResult = { sequence: 4 + hit, hit: true, damage: 11 + hit };
            f.attack(); f.feedback.update(f.snapshot); f.advance(50);
        }
        assert.equal(f.sprites.length, 1, types[0] + '不重启或叠加武器动画');
        assert.ok(f.numbers.length >= 3, types[0] + '连续命中不再等前一枚飞行物结束');
        f.advance(450);
        assert.equal(f.numbers.length, 4);
        assert.deepEqual(f.numbers.map(n => n.damage).sort((a, b) => a - b), [11, 12, 13, 14]);
        f.feedback.update(f.snapshot);
        assert.equal(f.numbers.length, 4, '动画到达及重绘不能重复跳字');
    }
});

test("更多浮字在竖屏仍有合法位置，无图武器照常反馈，后台和结算不补播", () => {
    const f = flightFixture(30);
    Object.assign(f.layout, { size: 52, height: 150, end: { x: 330, y: 76 } });
    f.snapshot.weapons.forEach((w, i) => {
        w.image = null;
        w.lastAttackResult = { sequence: 4, hit: i !== 0, damage: i };
    });
    f.attack();
    assert.equal(f.sprites.length, 0);
    assert.equal(f.numbers.length, 29, '未命中不显示，实际命中不依赖武器图片');
    assert.equal(f.liveNumbers.size, 24);
    assert.equal(new Set([...f.liveNumbers].map(n => n.style.transform)).size, 24);
    for (const n of f.liveNumbers) {
        const [x, y] = n.style.transform.match(/translate3d\(([^p]+)px,([^p]+)/).slice(1).map(Number);
        assert.ok(Number.isFinite(x) && Number.isFinite(y) && y > 0 && y < f.layout.height);
    }
    f.context.document.hidden = true; f.feedback.update(f.snapshot);
    assert.equal(f.liveNumbers.size, 0);
    f.snapshot.weapons.forEach(w => w.lastAttackResult.sequence++);
    f.attack(); f.context.document.hidden = false; f.feedback.update(f.snapshot);
    assert.equal(f.liveNumbers.size, 0, '后台攻击不补播');
    f.snapshot.fastForwarding = true;
    f.snapshot.weapons.forEach(w => w.lastAttackResult.sequence++);
    f.attack(); assert.equal(f.liveNumbers.size, 0); assert.equal(f.callbacks.size, 0);
});


function pose(element) {
    const transform = element.style.transform;
    const [x, y] = transform.match(/translate3d\(([^p]+)px,([^p]+)/).slice(1).map(Number);
    const angle = Number(transform.match(/rotate\(([^d]+)deg/)[1]) * Math.PI / 180;
    return { x, y, angle };
}
function rangedFixture(kind, count = 1) {
    const f = flightFixture(count);
    f.snapshot.weapons.forEach(w => {
        w.attributes = { weaponTypes: kind === 'music' ? ['斧', '吉他'] : [kind === 'gun' ? '铳' : '弓'] };
        w.lastAttackResult = { sequence: 4, hit: true, damage: 37 };
    });
    return f;
}

test('专属动画按真实武器类型分派，剑直线射出，复合吉他优先演奏，长枪仍旋转飞行', () => {
    const f = flightFixture(), classify = f.context.getBackpackWeaponAttackKind;
    assert.equal(classify({ weaponTypes: ['铳'] }), 'gun');
    assert.equal(classify({ weaponTypes: ['弓'] }), 'bow');
    assert.equal(classify({ weaponTypes: ['斧', '吉他'] }), 'music');
    assert.equal(classify({ weaponTypes: [], attributes: { weaponTypes: ['乐器'] } }), 'music');
    assert.equal(classify({ weaponTypes: ['剑'] }), 'sword');
    assert.equal(classify({ attributes: { weaponTypes: ['剑', '食物'] } }), 'sword');
    for (const type of ['枪', '短剑', '杖', '拳', '食物']) assert.equal(classify({ weaponTypes: [type] }), 'flight');
});

test('剑在0.5秒内渐显浮动并瞄准中心，出手保持朝向沿直线抵达，只显示一次伤害', () => {
    const f = flightFixture();
    f.snapshot.weapons[0].attributes = {weaponTypes:['剑']};
    f.snapshot.weapons[0].lastAttackResult = {sequence:4,hit:true,damage:37};
    f.prepare(600); assert.equal(f.live.size, 0);
    f.prepare(500);
    const sword = f.sprites[0], initial = pose(sword);
    assert.equal(sword.dataset.attackKind, 'sword');
    assert.equal(sword.style.opacity, '0');
    assert.equal(f.projectiles.length, 0, '剑本身飞出，不附带音符等子弹');
    const aimedAt = (p, end) => Math.abs(Math.atan2(end.y-p.y,end.x-p.x) - (p.angle-Math.PI/2)) < .001;
    assert.ok(aimedAt(initial,f.layout.end));
    f.advance(250); f.prepare(250);
    assert.equal(sword.style.opacity, '0.5');
    assert.notEqual(pose(sword).y, initial.y, '保留轻微浮动');
    assert.ok(aimedAt(pose(sword),f.layout.end), '浮动时仍朝向目标');
    f.advance(250); f.prepare(0);
    assert.equal(sword.style.opacity, '1');
    const prepared = sword.style.transform, start = pose(sword), target = {...f.layout.end};
    f.attack(); assert.equal(sword.style.transform, prepared, '准备与出手无跳位或改角');
    // 立绘的呼吸和出手位移不能使在途剑拐弯。
    f.layout.end.x += 15; f.layout.end.y -= 5; f.layout.anchors.forEach(a=>a.x -= 4);
    const dx = target.x-start.x, dy = target.y-start.y;
    for (const step of [100,200,200,149]) {
        f.advance(step);
        const p = pose(sword);
        assert.equal(p.angle,start.angle, '飞行期间不旋转');
        assert.ok(Math.abs((p.x-start.x)*dy - (p.y-start.y)*dx) / Math.hypot(dx,dy) < .02, '全程在发射直线上');
        assert.equal(sword.style.opacity,'1');
        assert.equal(f.numbers.length,0);
    }
    assert.ok(Math.hypot(pose(sword).x-target.x,pose(sword).y-target.y)<1, '抵达出手时的怪物中心');
    f.advance(1);
    assert.equal(f.live.size,0); assert.equal(f.liveProjectiles.size,0);
    assert.equal(f.numbers.length,1); assert.equal(f.numbers[0].damage,37);
    f.feedback.update(f.snapshot); assert.equal(f.numbers.length,1);
});

test('剑的准备和飞行支持暂停与横竖屏重排，高倍速仍只展示十件，退出清理', () => {
    const f = flightFixture(14);
    f.snapshot.weapons.forEach(w=>w.weaponTypes=['剑']); f.snapshot.speed=10;
    f.prepare(250); assert.equal(f.live.size,10); assert.equal(f.projectiles.length,0);
    f.snapshot.paused=true; f.feedback.update(f.snapshot);
    const prepared=f.sprites.map(s=>s.style.transform);
    f.advance(1000); assert.deepEqual(f.sprites.map(s=>s.style.transform),prepared);
    f.snapshot.paused=false; f.feedback.update(f.snapshot); f.attack(); f.advance(100);
    f.attack(10); assert.equal(f.sprites.length,10);
    f.snapshot.paused=true; f.feedback.update(f.snapshot);
    const flying=f.sprites.map(s=>s.style.transform);
    f.advance(1000); assert.deepEqual(f.sprites.map(s=>s.style.transform),flying);
    Object.assign(f.layout,{width:320,height:220,size:52,end:{x:280,y:100}});
    f.feedback.refresh(); assert.notDeepEqual(f.sprites.map(s=>s.style.transform),flying);
    f.feedback.destroy(); assert.equal(f.live.size,0); assert.equal(f.callbacks.size,0);
    const reduced=flightFixture(); reduced.snapshot.weapons[0].weaponTypes=['剑']; reduced.motion.matches=true;
    reduced.prepare(500); const still=reduced.sprites[0].style.transform;
    reduced.advance(250); reduced.prepare(250); assert.equal(reduced.sprites[0].style.transform,still);
    reduced.attack();
    assert.equal(pose(reduced.sprites[0]).x,reduced.layout.end.x);
    assert.equal(pose(reduced.sprites[0]).y,reduced.layout.end.y);
    reduced.advance(650); assert.equal(reduced.live.size,0);
});

test('铳的枪口、枪管方向与激光共线指向怪物中心，快速后坐后复位，激光命中只冒一次数值', () => {
    const f = rangedFixture('gun'); f.prepare(0);
    const gun = f.sprites[0], beam = f.projectiles[0], start = pose(gun);
    assert.equal(beam.style.opacity, '0', '蓄力不提前发射');
    f.attack(); f.advance(40);
    const recoil = pose(gun);
    const distance = p => Math.hypot(f.layout.end.x - p.x, f.layout.end.y - p.y);
    assert.ok(distance(recoil) > distance(start) + 10, '后坐沿射击反方向');
    assert.equal(f.numbers.length, 0, '激光尚未到达');
    f.advance(60);
    const fired = pose(gun), laser = pose(beam), length = parseFloat(beam.style.width);
    const muzzle = { x: fired.x + Math.cos(fired.angle) * 4 + Math.sin(fired.angle) * 32,
        y: fired.y + Math.sin(fired.angle) * 4 - Math.cos(fired.angle) * 32 };
    assert.ok(Math.hypot(muzzle.x - laser.x, muzzle.y - laser.y) < .02, '从可见枪口发光');
    assert.ok(Math.hypot(laser.x + Math.cos(laser.angle) * length - f.layout.end.x,
        laser.y + Math.sin(laser.angle) * length - f.layout.end.y) < .05, '激光终点是怪物中心');
    assert.ok(Math.abs(fired.angle - Math.PI / 2 - laser.angle) < .001, '不是枪侧面发射');
    assert.equal(f.numbers.length, 1); assert.equal(f.numbers[0].damage, 37);
    f.advance(120);
    assert.ok(Math.hypot(pose(gun).x - start.x, pose(gun).y - start.y) < .02, '后坐结束回到原处');
    f.advance(140);
    assert.equal(f.live.size, 0); assert.equal(f.liveProjectiles.size, 0); assert.equal(f.numbers.length, 1);
});

test('弓的箭矢在0.5秒蓄力中渐显并拉回，箭独立飞向中心，弓后坐后消失', () => {
    const f = rangedFixture('bow'); f.motion.matches = true; f.prepare(500);
    const bow = f.sprites[0], arrow = f.projectiles[0], startArrow = pose(arrow), startBow = pose(bow);
    assert.equal(arrow.style.opacity, '0');
    f.prepare(250); assert.equal(arrow.style.opacity, '0.5');
    f.prepare(0);
    const charged = pose(arrow);
    assert.ok(Math.hypot(charged.x - startArrow.x, charged.y - startArrow.y) > 14, '箭矢向弓后拉回');
    f.motion.matches = false;
    f.attack(); f.advance(40);
    assert.ok(Math.hypot(pose(bow).x - startBow.x, pose(bow).y - startBow.y) > 6, '弓有后坐');
    f.advance(320); assert.equal(bow.style.opacity, '0'); assert.equal(arrow.style.opacity, '1');
    assert.equal(f.numbers.length, 0);
    f.advance(289);
    const endArrow = pose(arrow), half = parseFloat(arrow.style.width) / 2;
    assert.ok(Math.hypot(endArrow.x + Math.cos(endArrow.angle) * half - f.layout.end.x,
        endArrow.y + Math.sin(endArrow.angle) * half - f.layout.end.y) < 1, '箭尖而非箭中心抵达目标');
    f.advance(1);
    assert.equal(f.numbers.length, 1); assert.equal(f.live.size, 0); assert.equal(f.liveProjectiles.size, 0);
});

test('吉他和乐器留在原地演奏四枚错开的音符，沿不同弧线汇向怪物，只显示本次总伤害', () => {
    const f = rangedFixture('music'); f.prepare(0);
    const instrument = f.sprites[0], start = pose(instrument);
    assert.equal(f.projectiles.length, 4);
    assert.ok(f.projectiles.every(n => n.style.opacity === '0'));
    f.attack(); f.advance(100);
    assert.equal(f.projectiles.filter(n => Number(n.style.opacity) > 0).length, 2, '音符错峰出现');
    f.advance(120);
    assert.equal(f.projectiles.filter(n => Number(n.style.opacity) > 0).length, 4);
    assert.equal(new Set(f.projectiles.map(n => n.style.transform)).size, 4);
    assert.equal(pose(instrument).x, start.x); assert.equal(pose(instrument).y, start.y);
    assert.notEqual(pose(instrument).angle, start.angle, '有轻微演奏摆动');
    f.advance(250);
    assert.equal(instrument.style.opacity, '0'); assert.equal(f.projectiles[0].style.opacity, '0');
    assert.equal(f.numbers.length, 0);
    f.advance(180);
    assert.equal(f.numbers.length, 1); assert.equal(f.liveProjectiles.size, 0);
});

test('专属飞行物和武器一起暂停、缩放，减少动态效果不后坐；取消准备及退出无残留', () => {
    for (const kind of ['gun', 'bow', 'music']) {
        const f = rangedFixture(kind); f.prepare(250); f.prepare(800);
        assert.equal(f.liveProjectiles.size, 0, kind + '取消蓄力清理');
        f.attack(); f.advance(100);
        f.snapshot.paused = true; f.feedback.update(f.snapshot);
        const active = [...f.live, ...f.liveProjectiles], poses = active.map(n => n.style.transform);
        f.advance(5000); assert.deepEqual(active.map(n => n.style.transform), poses);
        f.layout.end.x += 50; f.layout.size *= .75; f.feedback.refresh();
        assert.notDeepEqual(active.map(n => n.style.transform), poses);
        f.snapshot.paused = false; f.feedback.update(f.snapshot); f.advance(16);
        assert.equal(f.liveProjectiles.size, kind === 'music' ? 4 : 1, '暂停时间不累计到演出');
        f.feedback.destroy(); assert.equal(f.live.size, 0); assert.equal(f.liveProjectiles.size, 0); assert.equal(f.callbacks.size, 0);
        const reduced = rangedFixture(kind); reduced.motion.matches = true; reduced.attack();
        const before = reduced.sprites[0].style.transform; reduced.advance(100);
        assert.equal(reduced.sprites[0].style.transform, before, kind + '减少动态效果时武器位置和角度不变化');
    }
});

test('高倍速专属攻击限流且不补播，退到后台及立即结算清理所有子飞行物', () => {
    for (const kind of ['gun', 'bow', 'music']) {
        const f = rangedFixture(kind, 14); f.snapshot.speed = 10; f.prepare(0); f.attack();
        const count = kind === 'music' ? 40 : 10;
        assert.equal(f.live.size, 10); assert.equal(f.liveProjectiles.size, count);
        f.advance(100); f.attack(20);
        assert.equal(f.sprites.length, 10); assert.equal(f.projectiles.length, count);
        f.advance(550); f.feedback.update(f.snapshot);
        assert.equal(f.live.size, 0); assert.equal(f.liveProjectiles.size, 0);
        f.attack(); f.context.document.hidden = true; f.feedback.update(f.snapshot);
        assert.equal(f.liveProjectiles.size, 0);
        f.context.document.hidden = false; f.feedback.update(f.snapshot);
        assert.equal(f.liveProjectiles.size, 0, '回到前台不补播');
        f.attack(); f.snapshot.fastForwarding = true; f.feedback.update(f.snapshot);
        assert.equal(f.liveProjectiles.size, 0); assert.equal(f.callbacks.size, 0);
    }
});

test('枪口使用透明裁剪后的同一缩放，刺刀不能当枪口，未知素材按裁剪顶部回退', () => {
    const source = fs.readFileSync(path.join(root, 'project/backpackBattleUI.js'), 'utf8');
    const fn = source.match(/var getWeaponMuzzle = function[^]*?\n\t\};/)[0];
    const muzzle = vm.runInNewContext(fn + '\ngetWeaponMuzzle;');
    const rifle = { image: 'project/images/lakamuchong.png', imageCrop: [17, 7, 42, 223, 312, 312] };
    const result = muzzle(rifle, 40, 80), scale = 80 / 223;
    assert.ok(Math.abs(result.x - (37 - 17 - 21) * scale) < .001);
    assert.ok(Math.abs(result.y - (41 - 7 - 111.5) * scale) < .001);
    const next = muzzle({ image: 'future.png', imageCrop: [10, 20, 50, 100, 312, 312] }, 30, 50);
    assert.equal(next.x, 0); assert.equal(next.y, -25);
});
