"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const clone = value => value == null ? value : JSON.parse(JSON.stringify(value));
const storageKey = "backpack_saved_layouts";
const definitions = {
    testDot: { id: "test-dot", name: "单格测试武器", cells: [[0, 0]], minAttack: 2, maxAttack: 2 },
    testBar: { id: "test-bar", name: "双格测试武器", cells: [[0, 0], [1, 0]], minAttack: 3, maxAttack: 3 },
    testElbow: { id: "test-elbow", name: "转角测试武器", cells: [[0, 0], [0, 1], [1, 1]], minAttack: 4, maxAttack: 4 },
    testOther: { id: "test-other", name: "其他测试武器", cells: [[0, 0]], minAttack: 5, maxAttack: 5 }
};

function fixture({ storage = {}, flags = {}, replaying = false } = {}) {
    const replayActions = {};
    let writeFailure = null, readFailure = false, storageWrites = 0, replayCalls = 0, revisions = 0;
    const forbiddenRandom = () => { throw new Error("Saved layouts must never consume RNG"); };
    const core = {
        plugin: {}, material: { items: {} },
        status: { hero: { flags: clone(flags), money: 123 }, event: {}, route: [] },
        clone,
        getFlag(key, fallback) { return this.status.hero.flags[key] ?? fallback; },
        setFlag(key, value) { this.status.hero.flags[key] = clone(value); },
        getLocalStorage(key, fallback) {
            if (readFailure) throw new Error("Storage access denied");
            return Object.hasOwn(storage, key) ? clone(storage[key]) : fallback;
        },
        setLocalStorage(key, value) {
            storageWrites++;
            if (writeFailure === "throw") throw new Error("Storage quota exceeded");
            if (writeFailure === "false") return false;
            storage[key] = clone(value);
            return true;
        },
        isPlaying: () => true, isReplaying: () => replaying,
        itemCount: () => 0, updateStatusBar() {}, drawTip() {},
        rand: forbiddenRandom, rand2: forbiddenRandom, randShop: forbiddenRandom, randBattle: forbiddenRandom,
        replay() { replayCalls++; },
        control: { registerReplayAction(name, handler) { replayActions[name] = handler; } }
    };
    const forbiddenDOM = new Proxy({}, { get(_, key) { throw new Error("Unexpected DOM access: " + String(key)); } });
    const math = Object.create(Math);
    math.random = forbiddenRandom;
    const context = vm.createContext({ core, main: { replayChecking: true }, document: forbiddenDOM,
        window: forbiddenDOM, console, setTimeout, clearTimeout, Math: math });
    for (const name of ["backpackUiCommon", "backpackWeaponSynergy", "backpackWeaponSystem", "backpackSystem"]) {
        vm.runInContext(fs.readFileSync(path.join(root, "project", name + ".js"), "utf8"), context, { filename: name + ".js" });
    }
    context.weaponDefinitions_9f2e6f5b_4b2c_4f8c_9a3d_7e1b6c0d5a44 = clone(definitions);
    context.installBackpackWeaponSystem_41d4dd44_8f7d_4bbc_b890_80db42f1ad76(core, core.plugin);
    context.installBackpackSystem_97b6d981_3a73_47b8_ba94_2315c62f5658(core, core.plugin);
    core.plugin.onBackpackBattleLayoutChanged = () => { revisions++; };
    const initialCells = clone(core.plugin.getBackpackGridState().unlockedCells);
    return {
        core, plugin: core.plugin, storage, context, replayActions, initialCells,
        get flags() { return core.status.hero.flags; },
        get storageWrites() { return storageWrites; },
        get replayCalls() { return replayCalls; },
        get revisions() { return revisions; },
        failWrites(mode) { writeFailure = mode; }, failReads(value) { readFailure = value; },
        setReplaying(value) { replaying = value; },
        seed(placed, inventory = [], unlockedCells = initialCells) {
            core.status.hero.flags.__backpack_state__ = { version: 6,
                placed: clone(placed), inventory: clone(inventory), unlockedCells: clone(unlockedCells) };
            core.plugin.getBackpackState();
            core.status.route.length = 0;
        },
        snapshot() { return clone({ flags: core.status.hero.flags, money: core.status.hero.money,
            route: core.status.route, storage }); }
    };
}

function entry(instanceId, definitionId = "testDot", col, row, rotation = 0, extra = {}) {
    return { instanceId: String(instanceId), definitionId, rotation,
        ...(col == null ? {} : { col, row }), ...extra };
}
function savedFixture(placed, options = {}) {
    const f = fixture(options);
    f.seed(placed);
    assert.equal(f.plugin.saveBackpackLayout(0).ok, true);
    return f;
}
function ids(state) {
    return state.placed.concat(state.inventory).map(item => item.instanceId).sort();
}

// All behavior tests install the real backpack/weapon plugins. DOM and RNG are forbidden.
test("saved layouts expose five fixed independent slots and reject out-of-range slots", () => {
    const f = fixture();
    assert.deepEqual(clone(f.plugin.getSavedBackpackLayouts()), [null, null, null, null, null]);
    f.seed([entry(1, "testDot", 2, 2)]);
    for (let slot = 0; slot < 5; slot++) assert.equal(f.plugin.saveBackpackLayout(slot).ok, true);
    assert.equal(f.plugin.getSavedBackpackLayouts().filter(Boolean).length, 5);
    const before = f.snapshot();
    for (const slot of [-1, 5, 999, 0.5, NaN]) {
        assert.equal(f.plugin.saveBackpackLayout(slot).ok, false);
        assert.equal(f.plugin.deleteBackpackLayout(slot).ok, false);
        assert.equal(f.plugin.applyBackpackLayout(slot).ok, false);
    }
    assert.deepEqual(f.snapshot(), before);
});

test("layouts persist between fresh games using compact definitions and logical coordinates", () => {
    const f = savedFixture([entry(7, "testBar", 3, 4, 90)]);
    const stored = JSON.stringify(f.storage[storageKey]);
    assert.ok(stored.includes("testBar"));
    assert.equal(stored.includes("minAttack"), false, "Preferences must not retain runtime weapon definitions");
    assert.equal(stored.includes("instanceId"), false, "Instances belong to a run, not a reusable layout");
    const fresh = fixture({ storage: f.storage });
    fresh.seed([], [entry(42, "testBar")]);
    const preview = fresh.plugin.previewBackpackLayout(0);
    assert.equal(preview.appliedCount, 1);
    assert.equal(preview.entries[0].instanceId, "42");
    assert.deepEqual([preview.entries[0].col, preview.entries[0].row, preview.entries[0].rotation], [3, 4, 90]);
    assert.equal(fresh.flags.__backpack_instance_id__, 42);
    const exposed = fresh.plugin.getSavedBackpackLayouts();
    exposed[0] = null;
    assert.ok(fresh.plugin.getSavedBackpackLayouts()[0], "Returned slots must not share mutable references");
});

test("saving an empty board fails without overwriting an existing layout", () => {
    const f = savedFixture([entry(1, "testDot", 2, 2)]);
    f.seed([], [entry(1)]);
    const before = f.snapshot();
    assert.equal(f.plugin.saveBackpackLayout(0).ok, false);
    assert.equal(f.plugin.saveBackpackLayout(1).ok, false);
    assert.deepEqual(f.snapshot(), before);
});

test("delete clears only the chosen slot and leaves current equipment unchanged", () => {
    const f = savedFixture([entry(1, "testDot", 2, 2)]);
    assert.equal(f.plugin.saveBackpackLayout(4).ok, true);
    const before = clone(f.flags);
    assert.equal(f.plugin.deleteBackpackLayout(0).ok, true);
    assert.equal(f.plugin.getSavedBackpackLayouts()[0], null);
    assert.ok(f.plugin.getSavedBackpackLayouts()[4]);
    assert.deepEqual(f.flags, before);
    assert.equal(f.plugin.applyBackpackLayout(0).ok, false);
});

test("preview is read-only and matches duplicate weapons to different available instances", () => {
    const f = savedFixture([entry(1, "testDot", 2, 2), entry(2, "testDot", 4, 3), entry(3, "testBar", 6, 3, 90)]);
    f.seed([entry(33, "testOther", 2, 2)], [entry(10), entry(11), entry(12, "testBar")]);
    const before = f.snapshot(), writes = f.storageWrites;
    const preview = f.plugin.previewBackpackLayout(0);
    assert.equal(preview.totalCount, 3);
    assert.equal(preview.appliedCount, 3);
    assert.deepEqual(clone(preview.entries.map(item => item.status)), ["ready", "ready", "ready"]);
    assert.equal(new Set(preview.entries.map(item => item.instanceId)).size, 3);
    assert.deepEqual(clone(preview.entries[2].cells), [[6, 3], [6, 4]]);
    assert.equal(preview.entries[2].rotation, 90);
    assert.deepEqual(f.snapshot(), before);
    assert.equal(f.storageWrites, writes);
});

test("apply restores exact rotations and positions while preserving every current instance", () => {
    const f = savedFixture([entry(1, "testDot", 3, 2), entry(2, "testBar", 5, 4, 90)]);
    f.seed([entry(30, "testOther", 3, 2)], [entry(10), entry(11, "testBar", null, null, 270), entry(12)]);
    const before = clone(f.plugin.getBackpackState()), counter = f.flags.__backpack_instance_id__, money = f.core.status.hero.money;
    const result = f.plugin.applyBackpackLayout(0), state = clone(f.plugin.getBackpackState());
    assert.equal(result.ok, true);
    assert.equal(result.appliedCount, 2);
    assert.deepEqual(ids(state), ids(before));
    assert.deepEqual(state.placed.map(item => [item.definitionId, item.col, item.row, item.rotation]),
        [["testDot", 3, 2, 0], ["testBar", 5, 4, 90]]);
    assert.deepEqual(state.unlockedCells, before.unlockedCells);
    assert.equal(state.inventory.every(item => item.col == null && item.row == null), true);
    assert.equal(f.flags.__backpack_instance_id__, counter);
    assert.equal(f.core.status.hero.money, money);
    assert.ok(f.revisions > 0, "Applying equipment must invalidate battle estimates");
});

test("missing duplicate copies are skipped without creating weapons or blocking the rest", () => {
    const f = savedFixture([entry(1, "testDot", 2, 2), entry(2, "testDot", 3, 2), entry(3, "testBar", 4, 2)]);
    f.seed([], [entry(10), entry(11, "testOther")]);
    const counter = f.flags.__backpack_instance_id__;
    const result = f.plugin.applyBackpackLayout(0), state = f.plugin.getBackpackState();
    assert.equal(result.ok, true);
    assert.equal(result.totalCount, 3);
    assert.equal(result.appliedCount, 1);
    assert.equal(result.missingCount, 2);
    assert.equal(result.entries.filter(item => item.status === "missing").every(item => !item.instanceId), true);
    assert.deepEqual(ids(state), ["10", "11"]);
    assert.equal(f.flags.__backpack_instance_id__, counter);
    assert.equal(state.inventory[0].definitionId, "testOther");
});

test("locked cells are checked over the complete rotated footprint and remain locked", () => {
    const f = fixture();
    f.seed([entry(1, "testBar", 1, 2), entry(2, "testDot", 4, 4)], [], f.initialCells.concat([[1, 2]]));
    assert.equal(f.plugin.saveBackpackLayout(0).ok, true);
    const current = fixture({ storage: f.storage });
    current.seed([], [entry(10, "testBar"), entry(11)]);
    const unlocked = clone(current.plugin.getBackpackGridState().unlockedCells);
    const preview = current.plugin.previewBackpackLayout(0);
    assert.equal(preview.lockedCount, 1);
    assert.equal(preview.lockedCellCount, 1);
    assert.equal(preview.appliedCount, 1);
    assert.equal(preview.entries[0].status, "locked");
    assert.equal(preview.entries[0].instanceId, undefined);
    assert.deepEqual(clone(preview.entries[0].cells), [[1, 2], [2, 2]]);
    const result = current.plugin.applyBackpackLayout(0);
    assert.equal(result.ok, true);
    assert.equal(result.appliedCount, 1);
    assert.deepEqual(clone(current.plugin.getBackpackGridState().unlockedCells), unlocked);
    assert.deepEqual(clone(current.plugin.getBackpackState().inventory.map(item => item.instanceId)), ["10"]);
});

test("layout application records replay-safe removals first and reproduces complete inventory order", () => {
    const f = savedFixture([entry(1, "testDot", 2, 2), entry(2, "testBar", 4, 2, 90)]);
    // The saved target is occupied by another weapon; two unassigned items test inventory ordering.
    f.seed([entry(30, "testOther", 2, 2), entry(31, "testDot", 4, 2)],
        [entry(20, "testOther"), entry(21, "testBar"), entry(22, "testDot")]);
    const initial = clone(f.flags);
    assert.equal(f.plugin.applyBackpackLayout(0).ok, true);
    const expected = clone(f.flags.__backpack_state__), route = clone(f.core.status.route);
    assert.deepEqual(route.slice(0, 2), ["bp:30:o", "bp:31:o"]);
    assert.equal(route.every(action => /^bp:/.test(action)), true);
    const replay = fixture({ flags: initial, replaying: true });
    for (const action of route) assert.equal(replay.replayActions.bp(action), true, action);
    assert.deepEqual(clone(replay.flags.__backpack_state__), expected);
    assert.deepEqual(clone(replay.core.status.route), route);
    assert.equal(replay.replayCalls, route.length);
    assert.equal(replay.flags.__backpack_instance_id__, f.flags.__backpack_instance_id__);
    assert.deepEqual(clone(replay.flags.__backpack_attack__), clone(f.flags.__backpack_attack__));
});

test("storage write exceptions and rejected writes report failure without changing prior preferences", () => {
    const f = savedFixture([entry(1, "testDot", 2, 2)]);
    for (const failure of ["throw", "false"]) {
        f.failWrites(failure);
        const before = f.snapshot();
        assert.equal(f.plugin.saveBackpackLayout(1).ok, false);
        assert.equal(f.plugin.deleteBackpackLayout(0).ok, false);
        assert.deepEqual(f.snapshot(), before);
    }
    f.failWrites(null);
    assert.equal(f.plugin.saveBackpackLayout(1).ok, true);
});

test("storage read failures do not crash the backpack or erase saved layouts", () => {
    const f = savedFixture([entry(1, "testDot", 2, 2)]);
    const before = f.snapshot();
    f.failReads(true);
    assert.doesNotThrow(() => f.plugin.getSavedBackpackLayouts());
    assert.doesNotThrow(() => f.plugin.previewBackpackLayout(0));
    assert.equal(f.plugin.saveBackpackLayout(1).ok, false, "A failed read must not overwrite unknown existing slots");
    assert.equal(f.plugin.deleteBackpackLayout(0).ok, false);
    assert.deepEqual(f.snapshot(), before);
    f.failReads(false);
    assert.ok(f.plugin.getSavedBackpackLayouts()[0]);
});

function storedLayouts(slots) {
    return { [storageKey]: { version: 1, slots } };
}
function layoutSlot(entries) { return { entries }; }
function position(definitionId, x, y, rotation = 0, extra = {}) {
    return { definitionId, x, y, rotation, ...extra };
}

test("real shape-matrix weapon definitions normalize before rotated footprint preview", () => {
    const f = fixture();
    const real = vm.createContext({});
    vm.runInContext(fs.readFileSync(path.join(root, "project/weapons.js"), "utf8"), real);
    const definition = clone(real.weaponDefinitions_9f2e6f5b_4b2c_4f8c_9a3d_7e1b6c0d5a44.I372);
    assert.ok(definition.shape);
    assert.equal(definition.cells, undefined);
    f.context.weaponDefinitions_9f2e6f5b_4b2c_4f8c_9a3d_7e1b6c0d5a44.I372 = definition;
    f.seed([entry(1, "I372", 2, 2, 90)]);
    assert.equal(f.plugin.saveBackpackLayout(0).ok, true);
    const preview = f.plugin.previewBackpackLayout(0);
    assert.equal(preview.appliedCount, 1);
    assert.equal(preview.invalidCount, 0);
    assert.deepEqual(clone(preview.entries[0].cells), [[2, 2], [3, 2], [4, 2], [5, 2]]);
});

test("unknown definitions are reported missing while known entries continue to apply", () => {
    const f = fixture({ storage: storedLayouts([layoutSlot([
        position("no-longer-defined", 0, 0), position("testDot", 1, 1)
    ])]) });
    f.seed([entry(1, "testOther", 3, 3)], [entry(2)]);
    const result = f.plugin.applyBackpackLayout(0);
    assert.equal(result.ok, true);
    assert.equal(result.totalCount, 2);
    assert.equal(result.missingCount, 1);
    assert.equal(result.appliedCount, 1);
    assert.deepEqual(clone(result.entries[0].cells), []);
    assert.equal(result.entries[0].status, "missing");
    assert.equal(f.plugin.getBackpackState().placed[0].instanceId, "2");
});

test("inherited object-property names are safely rejected as unknown definitions", () => {
    const f = fixture({ storage: storedLayouts([layoutSlot([
        position("__proto__", 0, 0), position("constructor", 1, 0), position("toString", 2, 0),
        position("testDot", 3, 0)
    ])]) });
    f.seed([], [entry(1)]);
    const result = f.plugin.previewBackpackLayout(0);
    assert.equal(result.ok, true);
    assert.equal(result.missingCount, 3);
    assert.equal(result.appliedCount, 1);
});

test("invalid stored payloads and malformed slots cannot partially apply or mutate a game", () => {
    for (const payload of [null, "broken", [], 123, { version: 2, slots: [] }, { version: 1, slots: {} }]) {
        const f = fixture({ storage: { [storageKey]: payload } });
        f.seed([entry(1, "testDot", 2, 2)]);
        const before = f.snapshot();
        assert.deepEqual(clone(f.plugin.getSavedBackpackLayouts()), [null, null, null, null, null]);
        assert.equal(f.plugin.applyBackpackLayout(0).ok, false);
        assert.deepEqual(f.snapshot(), before);
    }
    const malformed = [
        null, {}, { entries: [] }, { entries: "broken" },
        layoutSlot([position("testDot", 0, 0), null]),
        layoutSlot([position("testDot", 0.5, 0)]),
        layoutSlot([position("testDot", "0", 0)]),
        layoutSlot([position("testDot", 0, 0, "90")]),
        layoutSlot([position("", 0, 0)]),
        layoutSlot([position("testDot", null, 0)]),
        layoutSlot([position("testDot", 0, 0, null)])
    ];
    for (const invalid of malformed) {
        const valid = layoutSlot([position("testDot", 1, 1)]);
        const f = fixture({ storage: storedLayouts([invalid, valid]) });
        f.seed([entry(1, "testDot", 2, 2)]);
        const before = f.snapshot();
        assert.equal(f.plugin.getSavedBackpackLayouts()[0], null);
        assert.ok(f.plugin.getSavedBackpackLayouts()[1], "Malformed data must not discard another valid slot");
        assert.equal(f.plugin.applyBackpackLayout(0).ok, false);
        assert.deepEqual(f.snapshot(), before);
    }
});

test("storage normalizes extra slots, rotations and surplus fields without leaking mutable references", () => {
    const slots = Array.from({ length: 9 }, (_, index) => layoutSlot([
        position("testDot", index, 0, -90, { unwanted: { a: 1 }, weapon: { minAttack: 999 }, instanceId: "stale" })
    ]));
    const f = fixture({ storage: storedLayouts(slots) });
    const layouts = f.plugin.getSavedBackpackLayouts();
    assert.equal(layouts.length, 5);
    assert.deepEqual(clone(layouts[0].entries[0]), position("testDot", 0, 0, 270));
    layouts[0].entries[0].x = 999;
    assert.equal(f.plugin.getSavedBackpackLayouts()[0].entries[0].x, 0);
});

test("overlapping and out-of-grid placements skip safely without consuming available duplicates", () => {
    const f = fixture({ storage: storedLayouts([layoutSlot([
        position("testDot", 0, 0), position("testDot", 0, 0),
        position("testDot", 1000, 1000), position("testDot", 1, 0)
    ])]) });
    f.seed([], [entry(1), entry(2)]);
    const result = f.plugin.applyBackpackLayout(0);
    assert.equal(result.appliedCount, 2);
    assert.equal(result.invalidCount, 2);
    assert.equal(result.missingCount, 0);
    assert.deepEqual(clone(result.entries.map(item => item.status)), ["ready", "invalid", "invalid", "ready"]);
    assert.deepEqual(ids(f.plugin.getBackpackState()), ["1", "2"]);
});

test("locked copies do not reserve a duplicate needed by a later ready position", () => {
    const f = fixture({ storage: storedLayouts([layoutSlot([
        position("testDot", -1, 0), position("testDot", 1, 0), position("testDot", -1, 0)
    ])]) });
    f.seed([], [entry(1)]);
    const result = f.plugin.applyBackpackLayout(0);
    assert.equal(result.appliedCount, 1);
    assert.equal(result.lockedCount, 2);
    assert.equal(result.lockedCellCount, 1, "Overlapping locked footprints count distinct locked cells only");
    assert.equal(result.missingCount, 0);
    assert.equal(f.plugin.getBackpackState().placed[0].instanceId, "1");
});

test("unique-key layouts only equip the matching owned special instance", () => {
    const f = savedFixture([entry(1, "testDot", 2, 2, 0, { uniqueKey: "special-A" })]);
    f.seed([], [entry(10), entry(11, "testDot", null, null, 0, { uniqueKey: "special-B" }),
        entry(12, "testDot", null, null, 0, { uniqueKey: "special-A" })]);
    assert.equal(f.plugin.previewBackpackLayout(0).entries[0].instanceId, "12");
    const result = f.plugin.applyBackpackLayout(0);
    assert.equal(result.appliedCount, 1);
    assert.equal(f.plugin.getBackpackState().placed[0].uniqueKey, "special-A");
    f.seed([], [entry(10)]);
    const missing = f.plugin.previewBackpackLayout(0);
    assert.equal(missing.appliedCount, 0);
    assert.equal(missing.missingCount, 1);
});

test("saved logical coordinates remain anchored to initial equipment area after grid reconfiguration", () => {
    const f = savedFixture([entry(1, "testDot", 3, 3, 270)]);
    f.plugin.configureBackpackGrid({ maxCols: 15, maxRows: 14 });
    const preview = f.plugin.previewBackpackLayout(0);
    assert.equal(preview.appliedCount, 1);
    assert.deepEqual([preview.entries[0].col, preview.entries[0].row, preview.entries[0].rotation], [5, 5, 270]);
});

test("layout writes and application are blocked during replay and disabled-backpack events", () => {
    const f = savedFixture([entry(1, "testDot", 2, 2)]);
    for (const mode of ["replay", "disabled"]) {
        f.setReplaying(mode === "replay");
        f.core.setFlag("disableOpenBackpack", mode === "disabled");
        const before = f.snapshot();
        assert.equal(f.plugin.saveBackpackLayout(0).ok, false);
        assert.equal(f.plugin.deleteBackpackLayout(0).ok, false);
        assert.equal(f.plugin.applyBackpackLayout(0).ok, false);
        assert.deepEqual(f.snapshot(), before);
    }
});

test("partial application with only missing or locked targets replays every unequipped instance", () => {
    const f = fixture({ storage: storedLayouts([layoutSlot([
        position("testDot", -1, 0), position("testBar", 1, 0)
    ])]) });
    f.seed([entry(1, "testOther", 2, 2), entry(2, "testDot", 3, 2)], [entry(3, "testOther")]);
    const initial = clone(f.flags), result = f.plugin.applyBackpackLayout(0);
    assert.equal(result.ok, true);
    assert.equal(result.appliedCount, 0);
    assert.equal(result.missingCount, 1);
    assert.equal(result.lockedCount, 1);
    const expected = clone(f.flags.__backpack_state__), route = clone(f.core.status.route);
    assert.deepEqual(route, ["bp:1:o", "bp:2:o"]);
    assert.deepEqual(expected.inventory.map(item => item.instanceId), ["3", "1", "2"]);
    const replay = fixture({ flags: initial, replaying: true });
    for (const action of route) assert.equal(replay.replayActions.bp(action), true);
    assert.deepEqual(clone(replay.flags.__backpack_state__), expected);
});

test("duplicate matching and replay stay deterministic across assorted initial equipment orders", () => {
    const targets = [position("testDot", 0, 0), position("testBar", 2, 0, 90),
        position("testDot", 4, 0), position("testOther", 5, 1), position("testDot", -1, 0)];
    for (let iteration = 0; iteration < 12; iteration++) {
        const ordered = [entry(1), entry(2, "testOther"), entry(3), entry(4, "testBar"), entry(5, "testOther")];
        for (let shift = 0; shift < iteration % ordered.length; shift++) ordered.push(ordered.shift());
        if (iteration % 2) ordered.reverse();
        const equipped = ordered.slice(0, iteration % 4 + 1).map((item, index) => ({ ...item, col: 2 + index, row: 5 }));
        const inventory = ordered.slice(equipped.length);
        const f = fixture({ storage: storedLayouts([layoutSlot(targets)]) });
        f.seed(equipped, inventory);
        const initial = clone(f.flags);
        const expectedPreview = clone(f.plugin.previewBackpackLayout(0));
        assert.deepEqual(clone(f.plugin.previewBackpackLayout(0)), expectedPreview);
        assert.equal(f.plugin.applyBackpackLayout(0).ok, true);
        const expected = clone(f.flags.__backpack_state__), route = clone(f.core.status.route);
        const replay = fixture({ flags: initial, replaying: true });
        for (const action of route) assert.equal(replay.replayActions.bp(action), true, "iteration " + iteration + ": " + action);
        assert.deepEqual(clone(replay.flags.__backpack_state__), expected, "iteration " + iteration);
        assert.deepEqual(ids(f.plugin.getBackpackState()), ["1", "2", "3", "4", "5"]);
    }
});

test("generic duplicate slots preserve special instances needed by later unique-key positions", () => {
    for (const otherKey of [undefined, "special-B"]) {
        const f = fixture({ storage: storedLayouts([layoutSlot([
            position("testDot", 0, 0), position("testDot", 1, 0, 0, { uniqueKey: "special-A" })
        ])]) });
        f.seed([entry(1, "testDot", 5, 5, 0, { uniqueKey: "special-A" })],
            [entry(2, "testDot", null, null, 0, otherKey ? { uniqueKey: otherKey } : {})]);
        const preview = f.plugin.previewBackpackLayout(0);
        assert.equal(preview.appliedCount, 2);
        assert.equal(preview.missingCount, 0);
        assert.deepEqual(clone(preview.entries.map(item => item.instanceId)), ["2", "1"]);
        assert.equal(f.plugin.applyBackpackLayout(0).appliedCount, 2);
    }
});

test("an unusable unique-key target cannot prevent a generic slot using the only owned copy", () => {
    const f = fixture({ storage: storedLayouts([layoutSlot([
        position("testDot", 0, 0), position("testDot", -1, 0, 0, { uniqueKey: "special-A" })
    ])]) });
    f.seed([], [entry(1, "testDot", null, null, 0, { uniqueKey: "special-A" })]);
    const result = f.plugin.applyBackpackLayout(0);
    assert.equal(result.appliedCount, 1);
    assert.equal(result.lockedCount, 1);
    assert.equal(result.missingCount, 0);
    assert.equal(result.entries[0].instanceId, "1");
});
