"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { createSparseReplayChecker } = require("./helpers/sparseReplayChecker");

function assertNoErrors(h) {
    assert.equal(h.errors.length, 0, h.errors.join("\n"));
}

function initialized(options) {
    const h = createSparseReplayChecker(options);
    h.initPlugins();
    assertNoErrors(h);
    return h;
}

function resetGameplay(h) {
    // The remote checker source is not in this checkout. This local fixture
    // replaces only this explicitly excluded engine viewport-drawing boundary.
    // Project reset, cleanup, flags, maps and battle-reset wrappers stay real.
    h.core.resize = function () {};
    h.core.material.images.images[h.core.firstData.hero.image] = h.core.material.images.hero;
    h.run("core.resetGame(core.firstData.hero, '', null, core.maps._initMaps())");
}

test("sparse checker fixture does not supply the browser APIs from the reported crash", () => {
    const h = createSparseReplayChecker();
    assert.equal(h.main.replayChecking, true);
    assert.equal(h.document.querySelector, undefined);
    assert.equal(h.document.querySelectorAll, undefined);
    assert.equal(h.document.addEventListener, undefined);
    assert.equal(h.context.window.addEventListener, undefined);
    assert.equal(h.document.getElementById("gameGroup").getBoundingClientRect, undefined);
    const video = h.document.createElement("video");
    assert.equal(video.pause, undefined);
    assert.equal(video.play, undefined);
    assert.equal(video.addEventListener, undefined);
    assert.equal(h.context.self, undefined);
    assert.equal(h.context.Transition, undefined);
});

for (const newStatusBar of [false, true]) {
    test("all real plugin initializers and resource hooks tolerate sparse checker DOM, newStatusBar=" + newStatusBar, () => {
        const h = initialized({ newStatusBar });
        const plugins = h.context.plugins_bb40132b_638b_4a9f_b028_d3fe47acc8d1;
        const names = Object.keys(plugins).filter(name => typeof plugins[name] === "function");
        assert.ok(names.length >= 41, "must run the complete plugin registry, not selected installers");
        assert.deepEqual(h.attemptedPlugins, names);
        assert.equal(h.core.getLocalStorage("newStatusBar", false), newStatusBar);
        assert.equal(typeof h.core.plugin._afterLoadResources, "function");
        h.core.plugin._afterLoadResources();
        h.flushTimers();
        assert.equal(typeof h.core.plugin.backpackBattle.start, "function");
        assert.equal(typeof h.core.plugin.careerSelect.open, "function");
        assert.equal(typeof h.core.plugin.getBackpackState, "function");
        assert.equal(h.nodes.careerTitleVideo, undefined);
        assert.equal(h.nodes.outerBackgroundVideoLayer, undefined);
        assert.equal(h.nodes.animate2, undefined);
        assertNoErrors(h);
    });
}

test("the harness records initializer errors caught and hidden by core._init_plugins", () => {
    const h = createSparseReplayChecker();
    h.run("plugins_bb40132b_638b_4a9f_b028_d3fe47acc8d1.testMissingSelector = function () { document.querySelector('body'); }");
    h.initPlugins();
    assert.equal(h.errors.length, 2);
    assert.match(h.errors[0], /document.querySelector is not a function/);
    assert.match(h.errors[1], /testMissingSelector/);
});

test("real resetGame and replay startup preserve gameplay while headless UI cleanup stays safe", () => {
    const h = initialized();
    h.core.plugin._afterLoadResources();
    resetGameplay(h);
    assert.equal(h.core.status.played, true);
    assert.equal(h.core.status.hero.hp, h.core.firstData.hero.hp);
    assert.ok(h.core.status.maps.MT1);
    assert.equal(h.core.plugin.closeBackpack({ keepLocked: true }), true);
    h.core.plugin.updateBackpack();
    h.core.plugin.careerSelect.hideTitle();
    assertNoErrors(h);

    // Exercise real startGame + project/career wrapper and reset/seed setup.
    // Capture at event queue / replay kickoff: this is not an end-to-end route.
    let queued, replay;
    h.core.events.insertAction = function (actions) { queued = actions; };
    h.core.startReplay = function (actions) { replay = actions; };
    const route = ["input2:" + Buffer.from(Buffer.from("剑").toString("base64")).toString("base64"), "choices:1"];
    h.core.events.startGame("", 246813579, route);
    assert.equal(h.core.getFlag("__seed__"), 246813579);
    assert.equal(h.core.getFlag("__rand__"), 246813579);
    assert.equal(replay, route);
    assert.ok(queued.some(action => action.type === "input2") || queued.some(action => action.type === "if"));
    assert.equal(h.core.dom.startPanel.style.display, "none");
    assertNoErrors(h);
});

test("headless custom animations retain saved data and complete synchronous/asynchronous events exactly once", () => {
    const h = initialized();
    h.core.plugin._afterLoadResources();
    const images = ["frame.png"], sounds = ["sample.wav"];
    h.core.setanimate("fixture", 10, 20, 32, 48, 3, images, sounds);
    assert.deepEqual(JSON.parse(JSON.stringify(h.core.getFlag("animate_fixture"))), {
        px: 10, py: 20, width: 32, height: 48, allFarme: 3, imageList: images, soundList: sounds
    });
    h.core.deleteanimate("fixture");
    assert.equal(h.core.hasFlag("animate_fixture"), false);
    let callbacks = 0;
    assert.equal(h.core.maps.drawResizeAnimate("unused", 1, 0, 0, false, false, false, () => callbacks++), -1);
    assert.equal(callbacks, 1);
    assert.equal(h.core.plugin.playanimate("unused"), -1);
    assert.equal(h.core.plugin.playing.size, 0);

    // Use the actual engine __action_doAsyncFunc. Only its terminal continuation
    // is a spy; a no-op event handler would fail this assertion.
    for (const async of [false, true]) {
        let continued = 0;
        h.core.doAction = function () { continued++; };
        h.core.events._action_animateResize({ name: "unused", id: 1, centerX: 0, centerY: 0, async });
        assert.equal(continued, 1, "async=" + async);
        h.flushTimers();
        assert.equal(continued, 1, "must not schedule a second completion");
    }
    assertNoErrors(h);
});

test("ordinary browser replay is not mistaken for checker mode, and missing geometry returns null", () => {
    const h = createSparseReplayChecker();
    const common = h.context.backpackUiCommon_2c986f67_7621_44eb_972d_24f1e2c6ce61;
    assert.equal(common.isHeadlessReplay(), true);
    assert.equal(common.canUseDOM(), false);
    assert.equal(common.getGameViewport(h.core), null);
    h.main.replayChecking = false;
    h.core.status.replay.replaying = true;
    assert.equal(common.isHeadlessReplay(), false, "browser replay keeps presentation");
    assert.equal(common.getGameViewport(h.core), null, "sparse geometry must not be called");
});

test("headless status-bar presentation still runs real environmental-damage updates", () => {
    const h = initialized();
    h.core.plugin._afterLoadResources();
    resetGameplay(h);
    // An already-parsed lava tile avoids loading sprite sheets, while exercising
    // the real map lookup and project damage rules after the visual status stub.
    h.run("core.status.floorId = 'MT1'; core.status.thisMap = core.status.maps.MT1; core.status.thisMap.blocks = [{ x: 2, y: 3, event: { id: 'lavaNet', cls: 'terrains', name: '血网' } }];");
    let damageUpdates = 0;
    const originalUpdateDamage = h.core.updateDamage;
    h.core.updateDamage = function () { damageUpdates++; return originalUpdateDamage.apply(h.core, arguments); };
    h.core.updateStatusBar(true, true);
    assert.equal(h.core.status.checkBlock.damage["2,3"], h.core.values.lavaDamage);
    assert.equal(h.core.status.checkBlock.type["2,3"]["血网伤害"], true);
    assert.equal(damageUpdates, 1, "the visual guard must not skip downstream updateDamage");
    assertNoErrors(h);
});

test("checker marker prevents damage-estimate workers even when a Worker constructor exists", () => {
    const h = createSparseReplayChecker();
    let workers = 0, messages = 0;
    h.context.Worker = function () {
        workers++;
        this.postMessage = function () { messages++; };
        this.terminate = function () {};
    };
    const create = h.context.createBackpackBattleEstimateCoordinator_f43e0d5b_629e_457c_9540_b3f0d0541ffc;
    const options = { createInput() { return { input: {}, randomSeed: 123, currentHp: 100 }; } };
    const checker = create(options);
    assert.equal(checker.request("fixture", 0, 0, "MT1").status, "error");
    assert.equal(workers, 0, "checker must not construct presentation-only Worker");
    assert.equal(messages, 0);

    h.main.replayChecking = false;
    h.core.status.replay.replaying = true;
    const browser = create(options);
    assert.equal(browser.request("fixture", 0, 0, "MT1").status, "pending");
    assert.equal(workers, 1, "ordinary browser replay still uses damage estimates");
    assert.equal(messages, 1);
    checker.destroy(); browser.destroy();
    assertNoErrors(h);
});

test("checker achievement notifications do not create DOM or change real-play achievements", () => {
    const h = initialized();
    resetGameplay(h);
    h.flushTimers();
    const api = h.core.plugin.achievementSystem;
    const before = JSON.stringify(api.getProfile());
    let creations = 0;
    h.document.createElement = function () { creations++; throw new Error("Headless achievement created DOM"); };
    assert.equal(api.showUnlockToast("begin_journey"), true);
    api.recordBattleResult({ outcome: "victory", enemyId: "greenSlime", floorId: "MT1" });
    h.flushTimers();
    assert.equal(creations, 0);
    assert.equal(JSON.stringify(api.getProfile()), before);
    assertNoErrors(h);
});
