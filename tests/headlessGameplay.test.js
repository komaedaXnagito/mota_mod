"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const plain = value => value == null ? value : JSON.parse(JSON.stringify(value));
const read = name => fs.readFileSync(path.join(__dirname, "../project", name + ".js"), "utf8");

function fixture({ replaying = true } = {}) {
    const flags = { inGuide: true, __randBattle__: 123456789 };
    const timers = [], replayActions = {}, settlements = [], errors = [];
    let replayCount = 0, unlockCount = 0, randomCalls = 0;
    const core = {
        plugin: {}, flags: {}, ui: {},
        status: { floorId: "GUIDE", event: {}, route: [], played: true, lockControl: false,
            hero: { hp: 500, hpmax: 500, atk: 0, def: 0, money: 0, flags, statistics: { battleDamage: 0 } } },
        material: { items: {}, enemys: { slime: { id: "slime", name: "Slime", hp: 120, atk: 3, def: 0,
            hitRate: 1, attackInterval: 1, special: [], money: 7 } } },
        clone: plain, getFlag: (key, fallback) => flags[key] ?? fallback,
        setFlag: (key, value) => { flags[key] = value; },
        isPlaying: () => true, isReplaying: () => replaying,
        getEnemyValue: (enemy, key) => enemy[key],
        enemys: { getEnemyInfo: enemy => plain(enemy) },
        getClsFromId: () => "enemys", saveAndStopAutomaticRoute() {}, autosave() {},
        clearContinueAutomaticRoute(callback) { if (callback) callback(); },
        lockControl() { core.status.lockControl = true; },
        unlockControl() { unlockCount++; core.status.lockControl = false; },
        updateStatusBar() {}, drawTip(message) { throw Error(message); },
        registerAnimationFrame() {}, unregisterAnimationFrame() {},
        getLocalStorage: () => 1, setLocalStorage() {},
        replay() { replayCount++; },
        randBattle(n) {
            randomCalls++;
            flags.__randBattle__ = (flags.__randBattle__ * 16807) % 2147483647;
            const value = flags.__randBattle__ / 2147483647;
            return n == null ? value : Math.floor(value * n);
        },
        control: { registerReplayAction(name, handler) { replayActions[name] = handler; } },
        events: {
            beforeBattle: () => true,
            afterBattle(id, x, y) {
                const result = core.plugin.consumeBackpackBattleSettlement(id, x, y);
                assert.ok(result);
                settlements.push(plain(result));
                core.status.hero.hp = result.playerHp;
                core.status.hero.money += core.material.enemys[id].money;
                core.status.hero.statistics.battleDamage += result.netDamage;
            },
            lose(reason) { throw Error(reason); }, resetGame() { return "reset"; }
        }
    };
    const forbiddenDOM = new Proxy({}, { get(_, key) { throw Error("Unexpected DOM access: " + String(key)); } });
    const context = vm.createContext({ core, main: { replayChecking: true }, document: forbiddenDOM, window: forbiddenDOM,
        console: { log() {}, warn() {}, error(...args) { errors.push(args); } },
        setTimeout(callback, delay) { assert.equal(delay, 0, "Headless battles must not wait on UI timers"); timers.push(callback); return timers.length; },
        clearTimeout() {} });
    for (const name of ["backpackUiCommon", "backpackWeaponSynergy", "weapons", "backpackWeaponSystem", "backpackSystem",
        "backpackBattleStatuses", "backpackBattleRules", "backpackBattleCore", "backpackBattleEstimate", "backpackBattleUI", "backpackBattle"]) {
        vm.runInContext(read(name), context, { filename: name + ".js" });
    }
    context.installBackpackWeaponSystem_41d4dd44_8f7d_4bbc_b890_80db42f1ad76(core, core.plugin);
    context.installBackpackSystem_97b6d981_3a73_47b8_ba94_2315c62f5658(core, core.plugin);
    return { context, core, flags, timers, settlements, replayActions, errors,
        get replayCount() { return replayCount; }, get unlockCount() { return unlockCount; },
        get randomCalls() { return randomCalls; },
        flush() { let chunks = 0; while (timers.length) { assert.ok(++chunks < 1000); timers.shift()(); } }
    };
}

test("headless backpack cleanup remains idempotent and preserves event/control cleanup and bp gameplay", () => {
    const f = fixture(), plugin = f.core.plugin;
    const id = plugin.addBackpackWeapon("I510", { autoPlace: true, recordRoute: false });
    assert.ok(id);
    assert.equal(plugin.getBackpackState().placed.length, 1);
    f.core.status.event = { id: "backpack", data: { old: true }, selection: 1, ui: {}, interval: 1 };
    f.core.status.lockControl = true;
    assert.equal(plugin.closeBackpack(), true);
    assert.deepEqual(f.core.status.event, { id: null, data: null, selection: null, ui: null, interval: null });
    assert.equal(f.core.status.lockControl, false);
    assert.equal(f.unlockCount, 1);
    assert.equal(plugin.closeBackpack(), true);
    assert.equal(f.unlockCount, 1);
    assert.equal(plugin.openBackpack(), false);
    assert.equal(f.replayActions.bp("bp:" + id + ":o"), true);
    assert.equal(plugin.getBackpackState().inventory.length, 1);
    assert.equal(f.replayActions.bp("bp:" + id + ":s"), true);
    assert.equal(plugin.getBackpackState().inventory.length, 0);
    assert.equal(f.core.status.hero.money, 30);
    assert.deepEqual(f.core.status.route, ["bp:" + id + ":o", "bp:" + id + ":s"]);
    assert.equal(f.replayCount, 2);
    f.core.status.event = { id: "backpack" };
    f.core.status.lockControl = true;
    plugin.closeBackpack({ keepLocked: true });
    assert.equal(f.core.status.event.id, null);
    assert.equal(f.core.status.lockControl, true);
    assert.equal(f.unlockCount, 1);
});

for (const withCallback of [false, true]) {
    test("headless battle completes the real deterministic runtime with " + (withCallback ? "an event callback" : "replay continuation"), () => {
        // The checker marker is sufficient even before isReplaying becomes true.
        const f = fixture({ replaying: !withCallback });
        f.core.plugin.addBackpackWeapon("I510", { autoPlace: true, recordRoute: false });
        const originalFactory = f.context.createBackpackBattleRuntime_2f8f7df2_bf4f_45ea_8ec4_628e0e25a0dc;
        let battleInput;
        f.context.createBackpackBattleRuntime_2f8f7df2_bf4f_45ea_8ec4_628e0e25a0dc = core => {
            const runtime = originalFactory(core), start = runtime.start;
            runtime.start = (input, options) => { battleInput = plain(input); return start(input, options); };
            return runtime;
        };
        const battle = f.context.installBackpackBattleSystem_3a1b88da_43f6_4f51_89e7_be56dc57f84e(f.core, f.core.plugin);
        let callbacks = 0;
        const callback = withCallback ? () => callbacks++ : undefined;
        assert.equal(battle.start("slime", 2, 3, { callback }), true);
        assert.equal(battle.getSnapshot().fastForwarding, true);
        assert.equal(battle.getSnapshot().paused, false, "Guide replay must never pause for a visual tutorial");
        f.flush();
        assert.equal(battle.isActive(), false);
        assert.equal(f.settlements.length, 1);
        assert.equal(f.settlements[0].outcome, "victory");
        assert.equal(f.core.status.hero.money, 7);
        assert.equal(f.core.status.lockControl, false);
        assert.equal(f.core.status.event.id, undefined);
        assert.equal(callbacks, withCallback ? 1 : 0);
        assert.equal(f.replayCount, withCallback ? 0 : 1);
        assert.equal(f.errors.length, 0);

        const baseline = fixture({ replaying: false });
        const runtime = originalFactory(baseline.core);
        runtime.start(battleInput, { speed: 1 });
        const expected = runtime.stepTicks(100000);
        assert.equal(expected.active, false);
        assert.deepEqual(f.settlements[0], plain(expected.result));
        assert.equal(f.randomCalls, baseline.randomCalls);
        assert.equal(f.flags.__randBattle__, baseline.flags.__randBattle__);
        assert.equal(f.core.events.resetGame(), "reset");
        assert.equal(battle.getSnapshot(), null);
        runtime.destroy();
    });
}
