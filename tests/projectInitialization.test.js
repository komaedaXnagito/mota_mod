"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.join(__dirname, "..");
const names = ["backpackWeaponSynergy", "backpackUiCommon", "backpackBattleRules", "backpackBattleEstimateKernel", "fantasyUI"];
const sources = Object.fromEntries(names.map(name => [name, fs.readFileSync(path.join(root, "project", name + ".js"), "utf8")]));
const exportsByName = Object.fromEntries(names.map(name => [name, sources[name].match(/var (\w+);/)[1]]));
function read(name) {
    return fs.readFileSync(path.join(root, "project", name + ".js"), "utf8");
}
function permutations(values) {
    if (!values.length) return [[]];
    return values.flatMap((value, index) => permutations(values.filter((_, i) => i !== index)).map(rest => [value, ...rest]));
}
function forbidHostAccess(context) {
    for (const name of ["core", "window", "document", "control"]) {
        Object.defineProperty(context, name, { configurable: true, get() { throw new Error("Premature access: " + name); } });
    }
}

for (const name of names) {
    test(name + " uses a static export and keeps helpers private without touching the host", () => {
        const context = vm.createContext({});
        forbidHostAccess(context);
        assert.doesNotMatch(sources[name], /=\s*\(function\s*\(/);
        assert.match(sources[name], new RegExp(exportsByName[name] + " = \\{"));
        vm.runInContext(sources[name], context);
        assert.deepEqual(Object.keys(context), [exportsByName[name]]);
        assert.equal(typeof context[exportsByName[name]], "object");
        // Re-loading a script must not cause global lexical redeclaration errors.
        vm.runInContext(sources[name], context);
    });
}

test("all five definitions tolerate every independent script loading order", () => {
    for (const order of permutations(names)) {
        const context = vm.createContext({});
        forbidHostAccess(context);
        for (const name of order) vm.runInContext(sources[name], context);
        assert.equal(context[exportsByName.backpackWeaponSynergy].rotateDirection("up", 90), "right");
        assert.equal(context[exportsByName.backpackBattleRules].fixed(1.23456), 1.235);
        assert.equal(context[exportsByName.backpackUiCommon].escapeHtml("<x>"), "&lt;x&gt;");
        assert.equal(typeof context[exportsByName.fantasyUI].drawArcFrameOn, "function");
    }
});

test("browser project order and offline concatenated project load without core or DOM", () => {
    const main = fs.readFileSync(path.join(root, "main.js"), "utf8");
    const files = Array.from(main.match(/this\.pureData = \[([\s\S]*?)\];/)[1].matchAll(/'([^']+)'/g), match => match[1]);
    for (const combined of [false, true]) {
        const context = vm.createContext({});
        forbidHostAccess(context);
        if (combined) vm.runInContext(files.map(read).join("\n;\n"), context);
        else files.forEach(name => vm.runInContext(read(name), context, { filename: name + ".js" }));
        const rules = context[exportsByName.backpackBattleRules];
        assert.ok(rules.getStatusDefinition("ice"));
        assert.equal(typeof context[exportsByName.backpackBattleEstimateKernel].simulate, "function");
    }
});

test("fantasy resize listener is installed once at first decoration and repaints live decorations", () => {
    const context = vm.createContext({});
    vm.runInContext(sources.fantasyUI, context);
    const theme = context[exportsByName.fantasyUI];
    const listeners = [];
    const canvasContext = new Proxy({}, { get(_, key) {
        if (key === "createLinearGradient") return () => ({ addColorStop() {} });
        return () => {};
    } });
    const canvases = [];
    let paints = 0;
    context.window = { devicePixelRatio: 1, addEventListener(name, callback) { listeners.push({ name, callback }); } };
    context.document = {
        getElementById() { return {}; },
        createElement() {
            const canvas = { style: {}, setAttribute() {}, remove() {}, getContext() { paints++; return canvasContext; } };
            canvases.push(canvas);
            return canvas;
        }
    };
    function element() {
        return { clientWidth: 100, clientHeight: 80, classList: { add() {} }, insertBefore() {}, removeEventListener() {}, contains() { return false; } };
    }
    assert.equal(listeners.length, 0);
    const first = element(), second = element();
    theme.decorate(first);
    theme.decorate(second);
    assert.equal(listeners.length, 1);
    assert.equal(listeners[0].name, "resize");
    assert.equal(paints, 2);
    listeners[0].callback();
    assert.equal(paints, 4);
    theme.releaseTree(first);
    listeners[0].callback();
    assert.equal(paints, 5);
    theme.releaseTree(second);
    listeners[0].callback();
    assert.equal(paints, 5);
});
