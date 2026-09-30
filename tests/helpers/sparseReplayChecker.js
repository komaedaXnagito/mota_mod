"use strict";

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const root = path.resolve(__dirname, "../..");

/*
 * Local checker-contract regression fixture, not a copy of the remote checker.
 * The reported checker provides skeletal elements, but no selectors, geometry,
 * media/event APIs, self, or Transition. Keep those APIs genuinely undefined:
 * do not use jsdom or permissive method-producing proxies here.
 * Uses real project sources, engine constructors and core._init_plugins.
 * It intentionally does not load media, third-party visual scripts or a browser.
 */
function createSparseReplayChecker(options = {}) {
    const errors = [], warnings = [], timers = [], intervals = [], attemptedPlugins = [];
    const nodes = Object.create(null);
    const canvasContext = canvas => ({ canvas, clearRect() {}, drawImage() {},
        fillRect() {}, save() {}, restore() {}, scale() {}, setTransform() {} });
    function element(tag = "div") {
        const node = {
            tagName: tag.toUpperCase(), style: {}, children: [], attributes: {},
            setAttribute(key, value) { this.attributes[key] = String(value); },
            getAttribute(key) { return this.attributes[key]; },
            appendChild(child) { this.children.push(child); child.parentNode = this; if (child.id) nodes[child.id] = child; return child; },
            removeChild(child) { this.children = this.children.filter(item => item !== child); child.parentNode = null; },
            insertAdjacentElement(position, child) { if (child.id) nodes[child.id] = child; return child; },
            getContext() { return this.context || (this.context = canvasContext(this)); }
        };
        return node;
    }
    // Real IDs declared by the game page. Missing selectors/methods remain missing.
    for (const match of fs.readFileSync(path.join(root, "index.html"), "utf8").matchAll(/\bid=["']([^"']+)["']/g)) {
        nodes[match[1]] = element(); nodes[match[1]].id = match[1];
    }
    const document = {
        body: element("body"), head: element("head"), documentElement: { style: {} },
        createElement: element,
        getElementById: id => nodes[id] || null,
        getElementsByClassName: () => [],
        getElementsByTagName: name => name === "head" ? [document.head] : []
    };
    const storage = new Map();
    const context = vm.createContext({ document,
        console: { log() {}, info() {}, warn: (...args) => warnings.push(args.map(String).join(" ")),
            error: (...args) => errors.push(args.map(value => value && value.stack || String(value)).join(" ")) },
        localStorage: { getItem: key => storage.has(key) ? storage.get(key) : null,
            setItem: (key, value) => storage.set(key, value), removeItem: key => storage.delete(key) },
        setTimeout: callback => timers.push(callback), clearTimeout() {},
        setInterval: callback => intervals.push(callback), clearInterval() {},
        devicePixelRatio: 1
    });
    context.window = context;
    const run = source => vm.runInContext(source, context);
    const load = file => vm.runInContext(fs.readFileSync(path.join(root, file), "utf8"), context, { filename: file });
    load("main.js");
    context.main.replayChecking = true;
    for (const file of context.main.pureData) load("project/" + file + ".js");
    run("Object.assign(main, data_a1e2fb4a_e986_4524_b0da_9b7ba7c0874d.main)");
    for (const file of context.main.loadList) load("libs/" + file + ".js");
    run("main.loadList.forEach(function(name) { if (name !== 'core') core[name] = new window[name](); }); core._forwardFuncs();");
    for (const key of ["dom", "statusBar", "canvas", "images", "tilesets", "materials", "animates", "bgms", "sounds", "floorIds", "floors", "floorPartitions"]) context.core[key] = context.main[key];
    for (const floorId of context.main.floorIds) load("project/floors/" + floorId + ".js");
    run("core._init_flags(); core.status = core.clone(core.initStatus); core.status.hero = core.clone(core.firstData.hero); core.material.images.images = {}; core.material.images.hero = { width: 128, height: 128 }; window.hero = core.status.hero; window.flags = core.status.hero.flags;");
    storage.set(context.core.firstData.name + "_newStatusBar", JSON.stringify(!!options.newStatusBar));
    // Wrap only to count attempts; invocation/catching/forwarding remain engine-owned.
    context.__recordPlugin = name => attemptedPlugins.push(name);
    run("Object.keys(plugins_bb40132b_638b_4a9f_b028_d3fe47acc8d1).forEach(function(name) { var original = plugins_bb40132b_638b_4a9f_b028_d3fe47acc8d1[name]; if (typeof original !== 'function') return; plugins_bb40132b_638b_4a9f_b028_d3fe47acc8d1[name] = function() { __recordPlugin(name); return original.apply(this, arguments); }; });");
    function initPlugins() { run("core._init_plugins()"); }
    function flushTimers(limit = 100) {
        let count = 0;
        while (timers.length) {
            if (++count > limit) throw new Error("Sparse checker timer queue did not quiesce");
            timers.shift()();
        }
        return count;
    }
    return { context, core: context.core, main: context.main, document, nodes, errors, warnings,
        timers, intervals, attemptedPlugins, initPlugins, flushTimers, run };
}

module.exports = { createSparseReplayChecker };
