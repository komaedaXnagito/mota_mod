"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const source = fs.readFileSync(path.join(__dirname, "../project/backpackSystem.js"), "utf8");
const clone = value => value == null ? value : JSON.parse(JSON.stringify(value));
const saved = definitionId => ({ entries: [{ definitionId, x: 0, y: 0, rotation: 0 }] });

function fixture(initialSlots = [saved("first"), null, saved("third"), null, null]) {
    const document = { activeElement: null, listeners: {} };
    const observers = [], decorations = [], released = [], calls = [];
    let slots = clone(initialSlots), readFailure = false, actionFailure = false, applied = 0;
    function element(tag = "div") {
        const node = {
            tagName: tag.toUpperCase(), style: {}, dataset: {}, attributes: {}, children: [], parentNode: null,
            listeners: {}, className: "", clientWidth: 308, disabled: false, _text: "",
            addEventListener(type, callback, capture = false) {
                (this.listeners[type] ||= []).push({ callback, capture: !!capture });
            },
            removeEventListener(type, callback) {
                this.listeners[type] = (this.listeners[type] || []).filter(listener => listener.callback !== callback);
            },
            setAttribute(name, value) { this.attributes[name] = String(value); },
            getAttribute(name) { return this.attributes[name] ?? null; },
            hasAttribute(name) { return Object.hasOwn(this.attributes, name); },
            appendChild(child) {
                if (child.parentNode) child.parentNode.children.splice(child.parentNode.children.indexOf(child), 1);
                child.parentNode = this; this.children.push(child); return child;
            },
            contains(other) { return this === other || this.children.some(child => child.contains(other)); },
            matches(selector) {
                if (selector[0] === ".") return this.className.split(/\s+/).includes(selector.slice(1));
                if (selector[0] === "#") return this.id === selector.slice(1);
                const dataSlot = selector.match(/^\[data-slot=['"]([^'"]+)['"]\]$/);
                if (dataSlot) return this.dataset.slot === dataSlot[1];
                return this.tagName.toLowerCase() === selector.toLowerCase();
            },
            querySelectorAll(selector) {
                return this.children.flatMap(child => [...(child.matches(selector) ? [child] : []), ...child.querySelectorAll(selector)]);
            },
            querySelector(selector) { return this.querySelectorAll(selector)[0] || null; },
            focus() { if (this.isConnected) document.activeElement = this; },
            remove() {
                if (this.contains(document.activeElement)) document.activeElement = document.body;
                if (this.parentNode) this.parentNode.children.splice(this.parentNode.children.indexOf(this), 1);
                this.parentNode = null;
            },
            get firstElementChild() { return this.children[0] || null; },
            get isConnected() { return this === document.body || !!(this.parentNode && this.parentNode.isConnected); },
            get textContent() { return this._text + this.children.map(child => child.textContent).join(""); },
            set textContent(value) {
                if (this.children.some(child => child.contains(document.activeElement))) document.activeElement = document.body;
                this.children.forEach(child => { child.parentNode = null; });
                this.children = []; this._text = String(value);
            }
        };
        node.classList = {
            add(...classes) { node.className = [...new Set(node.className.split(/\s+/).filter(Boolean).concat(classes))].join(" "); },
            contains(name) { return node.className.split(/\s+/).includes(name); }
        };
        return node;
    }
    document.body = element("body"); document.activeElement = document.body;
    document.createElement = element;
    document.getElementById = id => document.body.querySelector("#" + id);
    document.addEventListener = function (type, callback, capture = false) {
        (this.listeners[type] ||= []).push({ callback, capture: !!capture });
    };
    document.removeEventListener = function (type, callback) {
        this.listeners[type] = (this.listeners[type] || []).filter(listener => listener.callback !== callback);
    };
    const backpack = element(); backpack.className = "backpack-parent";
    const opener = element("button"); opener.textContent = "保存布局";
    backpack.appendChild(opener); document.body.appendChild(backpack); opener.focus();
    const context = vm.createContext({ document, window: {}, core: { status: {} }, main: {}, console,
        ResizeObserver: class {
            constructor(callback) { this.callback = callback; this.targets = []; this.disconnected = false; observers.push(this); }
            observe(node) { this.targets.push(node); }
            disconnect() { this.disconnected = true; }
        }
    });
    // Use the production modal stack and Escape/focus handling; only decorative drawing is stubbed.
    vm.runInContext(fs.readFileSync(path.join(__dirname, "../project/backpackUiCommon.js"), "utf8"), context);
    const common = context.backpackUiCommon_2c986f67_7621_44eb_972d_24f1e2c6ce61;
    common.decorateWeaponSurface = (node, options) => decorations.push({ node, options });
    common.releaseWeaponUI = node => released.push(node);
    common.hideTooltip = () => {};
    Object.assign(context, {
        root: backpack, dragState: null, savedLayoutRoot: null, savedLayoutBody: null, savedLayoutMessage: null,
        savedLayoutPreviewObserver: null, savedLayoutMode: "apply", savedLayoutSelection: 0, savedLayoutConfirmation: null,
        uiCommon: common, isHeadlessReplay: () => false, clearWeaponSelection() {},
        readSavedLayouts() { if (readFailure) throw Error("Storage unavailable"); return clone(slots); },
        saveBackpackLayout(slot) {
            calls.push(["save", slot]);
            if (actionFailure) return { ok: false, message: "保存失败" };
            slots[slot] = saved("current"); return { ok: true, message: "已保存布局 " + (slot + 1) };
        },
        deleteBackpackLayout(slot) {
            calls.push(["delete", slot]);
            if (actionFailure) return { ok: false, message: "删除失败" };
            slots[slot] = null; return { ok: true, message: "已删除布局 " + (slot + 1) };
        },
        applyBackpackLayout(slot) {
            calls.push(["apply", slot]);
            if (actionFailure) return { ok: false, message: "应用失败" };
            applied++; return { ok: true, message: "已应用 1/1 件" };
        },
        previewBackpackLayout(slot) {
            if (!slots[slot]) return { ok: false, message: "空布局" };
            return { ok: true, message: "可应用 1/1 件；缺少装备 0 件；未解锁 0 格", entries: slots[slot].entries.map((item, index) => ({
                definitionId: item.definitionId, col: 2 + index, row: 2, rotation: item.rotation,
                status: "ready", cells: [[2 + index, 2]], instanceId: String(index + 1)
            })) };
        },
        getSavedLayoutWeapon: id => id === "unknown" ? null : ({ name: "武器 " + id, cells: [[0, 0]] }),
        createWeaponElement(weapon, rotation, cellSize, gap) {
            const node = element(); node.className = "backpack-weapon";
            node.rendered = { weapon: clone(weapon), rotation, cellSize, gap }; return node;
        },
        getGridConfig: () => ({ maxCols: 11, maxRows: 10 }),
        isCellUnlocked: (col, row) => col >= 2 && col <= 8 && row >= 2 && row <= 7,
        cellKey: (col, row) => col + "," + row,
        toLogicalCell: (col, row) => ({ x: col - 2, y: row - 2 }), px: number => Math.round(number) + "px"
    });
    const functions = ["createButton", "closeSavedLayoutPanel", "createSavedLayoutPreview", "renderSavedLayoutPanel", "openSavedLayoutPanel"];
    const declarations = functions.map(name => {
        const match = source.match(new RegExp("\\tconst " + name + " = function \\([^]*?\\n\\t};"));
        assert.ok(match, "Expected production function " + name); return match[0];
    }).join("\n");
    vm.runInContext(declarations + "\napi = {" + functions.join(",") + "};", context);
    function dispatch(target, type, fields = {}) {
        const event = { type, target, ...fields,
            preventDefault() { this.defaultPrevented = true; },
            stopPropagation() { this.stopped = true; },
            stopImmediatePropagation() { this.stopped = this.immediateStopped = true; }
        };
        const invoke = (node, capture) => {
            for (const listener of [...(node.listeners[type] || [])]) {
                if (listener.capture !== capture) continue;
                listener.callback(event); if (event.immediateStopped) break;
            }
        };
        invoke(document, true);
        if (!event.stopped) invoke(target, false);
        let node = target.parentNode;
        while (node && !event.stopped) { invoke(node, false); node = node.parentNode; }
        if (!event.stopped) invoke(document, false);
        return event;
    }
    function button(label) {
        const found = context.savedLayoutRoot && context.savedLayoutRoot.querySelectorAll("button").find(node => node.textContent === label);
        assert.ok(found, "Button not found: " + label); return found;
    }
    function click(nodeOrLabel) {
        const node = typeof nodeOrLabel === "string" ? button(nodeOrLabel) : nodeOrLabel;
        if (node.disabled) return false;
        node.focus(); dispatch(node, "click"); return true;
    }
    return {
        context, common, document, observers, decorations, released, calls, opener, backpack, button, click, dispatch,
        get panel() { return context.savedLayoutRoot; }, get body() { return context.savedLayoutBody; },
        get slots() { return clone(slots); }, get applied() { return applied; },
        open(mode = "apply") { return context.api.openSavedLayoutPanel(mode); },
        close() { context.api.closeSavedLayoutPanel(); },
        select(index) { click(context.savedLayoutBody.querySelector("[data-slot='" + index + "']")); },
        failRead(value) { readFailure = value; }, failAction(value) { actionFailure = value; },
        assertFocusInside() { assert.ok(context.savedLayoutRoot.contains(document.activeElement), "Focus must remain in the active modal after its body is rebuilt"); }
    };
}

test("save chooses the first empty slot; apply chooses the first populated slot; repeated open is idempotent", () => {
    const f = fixture();
    assert.equal(f.open("save"), true);
    assert.equal(f.context.savedLayoutSelection, 1);
    assert.equal(f.panel.querySelector("h2").textContent, "保存布局");
    assert.equal(f.button("直接应用").disabled, true);
    assert.equal(f.button("删除").disabled, true);
    const panel = f.panel;
    assert.equal(f.open("apply"), true);
    assert.equal(f.panel, panel);
    assert.equal(f.document.body.querySelectorAll(".backpack-layout-root").length, 1);
    f.close(); assert.equal(f.open("apply"), true);
    assert.equal(f.context.savedLayoutSelection, 0);
    assert.equal(f.panel.querySelector("h2").textContent, "应用布局");
    assert.equal(f.button("直接应用").disabled, false);
});

test("empty slot save invokes its action once, shows feedback, and retains an accessible focus target", () => {
    const f = fixture(); f.open("save");
    f.click("保存到此槽位");
    assert.deepEqual(f.calls, [["save", 1]]);
    assert.equal(f.slots[1].entries[0].definitionId, "current");
    assert.equal(f.context.savedLayoutMessage.textContent, "已保存布局 2");
    assert.equal(f.document.activeElement, f.context.savedLayoutMessage);
    assert.ok(f.panel.querySelector(".backpack-layout-preview"));
});

test("overwrite cancellation preserves saved data; confirmation replaces only the selected slot once", () => {
    const f = fixture(); f.open();
    const original = f.slots;
    f.click("覆盖此布局");
    assert.deepEqual(f.calls, []);
    assert.ok(f.button("确认覆盖"));
    f.assertFocusInside();
    f.click("取消");
    assert.deepEqual(f.slots, original); assert.deepEqual(f.calls, []);
    f.assertFocusInside();
    f.click("覆盖此布局"); f.click("确认覆盖");
    assert.deepEqual(f.calls, [["save", 0]]);
    assert.equal(f.slots[0].entries[0].definitionId, "current");
    assert.deepEqual(f.slots[2], original[2]);
    assert.equal(f.context.savedLayoutConfirmation, null);
    f.assertFocusInside();
});

test("delete cancellation preserves a slot; confirmed delete resets preview and disables unavailable actions", () => {
    const f = fixture(); f.open();
    const original = f.slots;
    f.click("删除");
    assert.ok(f.button("确认删除")); f.assertFocusInside();
    f.click("取消");
    assert.deepEqual(f.slots, original); assert.deepEqual(f.calls, []); f.assertFocusInside();
    f.click("删除"); f.click("确认删除");
    assert.deepEqual(f.calls, [["delete", 0]]); assert.equal(f.slots[0], null);
    assert.equal(f.panel.querySelector(".backpack-layout-preview"), null);
    assert.equal(f.button("直接应用").disabled, true); assert.equal(f.button("删除").disabled, true);
    assert.equal(f.click("直接应用"), false); assert.deepEqual(f.calls, [["delete", 0]]);
    f.assertFocusInside();
});

test("switching slots cancels a pending confirmation and restores focus to the new slot button", () => {
    const f = fixture(); f.open(); f.click("删除"); f.select(2);
    assert.equal(f.context.savedLayoutConfirmation, null);
    assert.equal(f.context.savedLayoutSelection, 2);
    assert.deepEqual(f.calls, []);
    assert.equal(f.document.activeElement.dataset.slot, "2");
    assert.equal(f.document.activeElement.getAttribute("aria-pressed"), "true");
    assert.equal(f.panel.querySelectorAll("button").some(node => node.textContent === "确认删除"), false);
});

test("repeat apply has one live handler per click and does not duplicate the modal", () => {
    const f = fixture(); f.open();
    for (let index = 0; index < 4; index++) {
        f.click("直接应用");
        assert.equal(f.applied, index + 1);
        assert.equal(f.document.body.querySelectorAll(".backpack-layout-root").length, 1);
        assert.equal(f.context.savedLayoutMessage.textContent, "已应用 1/1 件");
        f.assertFocusInside();
    }
    assert.deepEqual(f.calls, Array.from({ length: 4 }, () => ["apply", 0]));
});

test("close and reopen clean modal stack, focus, confirmation state, and every preview observer", () => {
    const f = fixture(); f.open(); f.click("覆盖此布局");
    const oldPanel = f.panel;
    f.click("返回");
    assert.equal(f.panel, null); assert.equal(f.context.savedLayoutConfirmation, null);
    assert.equal(oldPanel.isConnected, false); assert.equal(f.document.activeElement, f.opener);
    assert.equal(f.common.isTopModal(oldPanel), false);
    assert.ok(f.observers.every(observer => observer.disconnected));
    assert.ok(f.released.includes(oldPanel));
    f.close(); assert.equal(f.panel, null);
    f.open(); assert.notEqual(f.panel, oldPanel); assert.equal(f.context.savedLayoutConfirmation, null);
    assert.equal(f.common.isTopModal(f.panel), true);
    assert.equal(f.document.activeElement.textContent, "返回");
    f.close(); assert.ok(f.observers.every(observer => observer.disconnected));
});

test("Escape closes only on keyup and consumes both events instead of leaking to the game", () => {
    const f = fixture(); f.open(); const target = f.document.activeElement;
    const down = f.dispatch(target, "keydown", { key: "Escape" });
    assert.ok(down.defaultPrevented && down.immediateStopped); assert.ok(f.panel);
    const up = f.dispatch(target, "keyup", { key: "Escape" });
    assert.ok(up.defaultPrevented && up.immediateStopped); assert.equal(f.panel, null);
    assert.equal(f.document.activeElement, f.opener);
    assert.equal((f.document.listeners.keydown || []).length, 0);
    assert.equal((f.document.listeners.keyup || []).length, 0);
});

test("backdrop dismisses the modal but pointer events inside the dialog do not", () => {
    const f = fixture(); f.open();
    f.dispatch(f.panel.querySelector("section"), "pointerdown"); assert.ok(f.panel);
    f.dispatch(f.panel, "pointerdown"); assert.equal(f.panel, null);
    assert.equal(f.document.activeElement, f.opener);
});

test("preview resize updates scale, releases replaced observers, and survives missing ResizeObserver support", () => {
    const f = fixture(); f.open();
    const first = f.observers.at(-1), preview = f.panel.querySelector(".backpack-layout-preview");
    assert.equal(preview.firstElementChild.style.transform, "scale(1)");
    preview.clientWidth = 154; first.callback();
    assert.equal(preview.firstElementChild.style.transform, "scale(0.5)");
    f.select(2); assert.equal(first.disconnected, true);
    assert.equal(f.observers.filter(observer => !observer.disconnected).length, 1);
    f.select(1); assert.ok(f.observers.every(observer => observer.disconnected));
    assert.equal(f.context.savedLayoutPreviewObserver, null);
    f.context.ResizeObserver = undefined;
    f.select(0); assert.ok(f.panel.querySelector(".backpack-layout-preview"));
    assert.equal(f.context.savedLayoutPreviewObserver, null);
});

test("dialog and preview expose names, slot selection, status feedback, and non-submitting controls", () => {
    const f = fixture(); f.open(); const dialog = f.panel.querySelector("section");
    assert.equal(dialog.getAttribute("role"), "dialog");
    assert.equal(dialog.getAttribute("aria-modal"), "true");
    assert.equal(dialog.getAttribute("aria-labelledby"), f.panel.querySelector("h2").id);
    assert.equal(f.button("返回").getAttribute("aria-label"), "关闭布局面板");
    assert.equal(f.context.savedLayoutMessage.getAttribute("role"), "status");
    assert.equal(f.context.savedLayoutMessage.tabIndex, -1);
    const tabs = f.panel.querySelectorAll(".backpack-layout-slot");
    assert.equal(tabs.length, 5);
    assert.deepEqual(tabs.map(node => node.getAttribute("aria-pressed")), ["true", "false", "false", "false", "false"]);
    assert.equal(f.panel.querySelectorAll("button").every(node => node.type === "button"), true);
    const preview = f.panel.querySelector(".backpack-layout-preview");
    assert.equal(preview.getAttribute("role"), "img");
    assert.match(preview.getAttribute("aria-label"), /预览/);
    assert.equal(preview.querySelectorAll(".backpack-layout-preview-cell").length, 110);
});

test("preview marks ready, missing, locked and invalid weapons without making a gameplay call", () => {
    const f = fixture();
    const plan = { entries: [
        { definitionId: "first", col: 2, row: 2, rotation: 90, status: "ready", cells: [[2, 2]] },
        { definitionId: "third", col: 3, row: 2, rotation: 0, status: "missing", cells: [[3, 2]] },
        { definitionId: "fourth", col: 1, row: 2, rotation: 0, status: "locked", cells: [[1, 2]] },
        { definitionId: "fifth", col: 4, row: 2, rotation: 0, status: "invalid", cells: [[4, 2]] },
        { definitionId: "unknown", col: 5, row: 2, rotation: 0, status: "missing", cells: [] }
    ] };
    const preview = f.context.api.createSavedLayoutPreview(plan);
    const weapons = preview.querySelectorAll(".backpack-layout-preview-weapon");
    assert.equal(weapons.length, 4);
    assert.deepEqual(weapons.map(node => node.className.split(" ").at(-1)), ["is-ready", "is-missing", "is-locked", "is-invalid"]);
    assert.equal(weapons[0].rendered.rotation, 90);
    assert.equal(weapons[0].style.left, "56px"); assert.equal(weapons[0].style.top, "56px");
    assert.equal(preview.querySelectorAll(".is-needed").length, 1);
    assert.deepEqual(f.calls, []);
});

test("storage/action errors remain visible and allow closing and retrying without corrupting slots", () => {
    const f = fixture(); const initial = f.slots;
    f.failRead(true); assert.equal(f.open(), true);
    assert.match(f.context.savedLayoutMessage.textContent, /读取布局失败/);
    f.click("返回"); assert.equal(f.panel, null);
    f.failRead(false); f.open(); f.failAction(true);
    f.click("直接应用"); assert.equal(f.context.savedLayoutMessage.textContent, "应用失败");
    assert.deepEqual(f.slots, initial); f.assertFocusInside();
    f.failAction(false); f.click("直接应用"); assert.equal(f.applied, 1);
});

test("saved-layout modal cannot open during dragging, without a backpack, or in headless replay", () => {
    const f = fixture();
    f.context.dragState = {}; assert.equal(f.open(), false);
    f.context.dragState = null; f.context.root = null; assert.equal(f.open(), false);
    f.context.root = f.backpack; f.context.isHeadlessReplay = () => true; assert.equal(f.open(), false);
    assert.equal(f.document.body.querySelectorAll(".backpack-layout-root").length, 0);
});
