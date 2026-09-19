"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const path = require("node:path");

function harness() {
  const listeners = new Map(), resizes = new Map(), observers = [];
  const rect = { left: 120, top: 40, width: 990, height: 660 };
  const groupRect = { left: 100, top: 20, width: 1030, height: 700 };
  const outer = { getBoundingClientRect: () => rect };
  const group = { getBoundingClientRect: () => groupRect };
  const observe = class {
    constructor(callback) { this.callback = callback; this.disconnected = false; observers.push(this); }
    observe() {}
    disconnect() { this.disconnected = true; }
  };
  const context = {
    core: { domStyle: { scale: 1.5, isVertical: false },
      registerResize: (name, fn) => resizes.set(name, fn), unregisterResize: name => resizes.delete(name) },
    document: { getElementById: id => id === "outerUI" ? outer : group,
      addEventListener() {}, removeEventListener() {}, activeElement: null },
    window: { innerWidth: 1600, innerHeight: 900,
      addEventListener: (name, fn) => listeners.set(fn, name), removeEventListener: (name, fn) => listeners.delete(fn) },
    ResizeObserver: observe, MutationObserver: observe
  };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(path.join(__dirname, "../project/backpackUiCommon.js"), "utf8"), context);
  const common = context.backpackUiCommon_2c986f67_7621_44eb_972d_24f1e2c6ce61;
  function root() {
    return { style: { setProperty(name, value) { this[name] = value; } }, dataset: {}, classList: { add() {} },
      addEventListener() {}, removeEventListener() {}, focus() {}, isConnected: true };
  }
  return { common, context, rect, groupRect, root, resizes, listeners, observers };
}

test("弹窗随游戏缩放，浏览器大小不决定其尺寸", () => {
  const h = harness(), root = h.root();
  const close = h.common.bindGameViewport(root);
  assert.equal(root.style.left, "120px");
  assert.equal(root.style.width, "990px");
  assert.equal(root.style.transform, "scale(1)");
  h.rect.width = 495; h.rect.height = 330; h.rect.left = 370;
  h.context.core.domStyle.scale = 0.75;
  h.resizes.forEach(fn => fn());
  assert.equal(root.style.width, "990px");
  assert.equal(root.style.height, "660px");
  assert.equal(root.style.transform, "scale(0.5)");
  assert.equal(root.style.left, "370px");
  close();
  assert.equal(h.listeners.size, 0);
  assert.equal(h.resizes.size, 0);
  assert.ok(h.observers.every(observer => observer.disconnected));
});

test("窗口打开时横竖屏切换也会更新布局尺寸", () => {
  const h = harness(), root = h.root();
  h.common.bindGameViewport(root);
  Object.assign(h.rect, { width: 206, height: 341, top: 100, left: 70 });
  h.context.core.domStyle = { scale: 0.5, isVertical: true };
  h.resizes.forEach(fn => fn());
  assert.equal(root.dataset.gameMobile, "true");
  assert.equal(root.style.width, "412px");
  assert.equal(root.style.height, "682px");
  assert.equal(root.style["--game-ui-height"], "682px");
});

test("多层弹窗独立清理，关闭顶层后底层仍跟随主界面", () => {
  const h = harness(), shop = h.root(), detail = h.root();
  h.common.registerModal(shop, () => {});
  h.common.registerModal(detail, () => {});
  assert.equal(h.resizes.size, 2);
  h.common.unregisterModal(detail);
  assert.equal(h.resizes.size, 1);
  h.rect.left = 200;
  h.resizes.forEach(fn => fn());
  assert.equal(shop.style.left, "200px");
  assert.equal(detail.style.left, "120px");
  h.common.unregisterModal(shop);
  assert.equal(h.resizes.size, 0);
});

test("战斗和背包已有定位时不重复施加缩放", () => {
  const h = harness(), root = h.root();
  root.style.transform = "scale(0.7)";
  h.common.registerModal(root, () => {}, { viewport: false });
  assert.equal(h.resizes.size, 0);
  assert.equal(root.style.transform, "scale(0.7)");
});

test("标题页隐藏 outerUI 时使用 gameGroup，不能退回整屏", () => {
  const h = harness();
  h.rect.width = h.rect.height = 0;
  const viewport = h.common.getGameViewport();
  assert.equal(viewport.left, h.groupRect.left);
  assert.equal(viewport.width, h.groupRect.width);
  assert.notEqual(viewport.width, h.context.window.innerWidth);
});
