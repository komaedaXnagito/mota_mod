'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '../project/backpackSystem.js'), 'utf8');

function harness(kind = 'compact', scale = 1) {
  const functions = ['pointToLocal', 'clearPlacedDragGesture', 'clearInventoryDragGesture',
    'bindPlacedInteraction', 'bindCompactInventoryDrag', 'bindDesktopInventoryDrag',
    'collapseInventoryForDrag', 'startPointerDrag', 'releaseDragPointer', 'createDragElement',
    'updateDragElement', 'finishDrag', 'cancelDrag', 'onPointerMove', 'onPointerUp', 'onPointerCancel'];
  let captured = null, saves = 0, selections = 0, locked = false;
  const operations = [];
  const element = () => ({isConnected: true, style: {}, listeners: {}, classList: {add() {}},
    addEventListener(type, handler) { (this.listeners[type] ||= []).push(handler); },
    setAttribute() {}, focus() {}, querySelector() { return this; },
    getBoundingClientRect() { return {left: 120, top: 70, width: 40, height: 40}; },
    setPointerCapture(id) { captured = {element: this, id}; },
    releasePointerCapture(id) { if (captured?.id === id) captured = null; }
  });
  const root = element(), item = element();
  root.clientWidth = 400; root.clientHeight = 680; root.scrollLeft = root.scrollTop = 0;
  root.dataset = {};
  root.getBoundingClientRect = () => ({left: 100, top: 50, width: 400 * scale, height: 680 * scale});
  const entry = {instanceId: 'one', rotation: 0, weapon: {name: '测试武器'}};
  if (kind === 'placed') Object.assign(entry, {col: 2, row: 2});
  const state = {placed: kind === 'placed' ? [entry] : [], inventory: kind === 'placed' ? [] : [entry]};
  const h = {root, layout: {compact: kind !== 'desktop', cellSize: 20, gap: 2}, state,
    inventoryDragGesture: null, placedDragGesture: null, dragState: null, dragScrollFrame: null,
    suppressPlacedClickUntil: 0, suppressInventoryClickUntil: 0, expandedInventoryDetailsId: null,
    selectedInstanceId: null, detailPinned: false, dragLayer: {innerHTML: '', appendChild() {}}, sellZone: null,
    uiCommon: {hideTooltip() {}}, core: {drawTip() {}},
    findEntry: () => entry, getBounds: () => ({cols: 1, rows: 1}), createWeaponElement: element,
    px: n => n + 'px', clearWeaponSelection() {}, clearSynergyHighlights() {}, renderSynergyHighlights() {},
    selectWeapon() { selections++; }, setDragSelectionLocked(value) { locked = value; },
    // Starting a drag rebuilds the list/grid and detaches the pressed node, as on the real page.
    renderAll() { item.isConnected = false; root.dataset.dragging = String(!!h.dragState); },
    focusBackpackForDrag() {}, drawBag() {}, stopDragScroll() { h.dragScrollFrame = null; },
    clearDragAction() {}, updateDragAction() {}, getDragAction: () => null,
    requestAnimationFrame: () => 1, scrollDuringDrag() {}, getDragTarget: () => h.target,
    target: {valid: true, col: 3, row: 4}, isInSellZone: () => false, isPointInInventory: () => false,
    removeEntryFromLists(id) { state.inventory = state.inventory.filter(e => e.instanceId !== id); state.placed = state.placed.filter(e => e.instanceId !== id); },
    persistState() { saves++; }, recordWeaponMove() { operations.push('move'); },
    recordWeaponEnter() { operations.push('enter'); }, recordWeaponOut() { operations.push('out'); }
  };
  const declarations = functions.map(name => {
    const match = source.match(new RegExp('\\tconst ' + name + ' = function \\([^]*?\\n\\t};'));
    assert.ok(match, name + ' must exist');
    return match[0];
  }).join('\n');
  vm.runInNewContext(declarations + '\napi = {' + functions.join(',') + '};', h);
  if (kind === 'placed') h.api.bindPlacedInteraction(item, entry, () => '');
  else if (kind === 'desktop') h.api.bindDesktopInventoryDrag(item, entry, () => '');
  else h.api.bindCompactInventoryDrag(item, entry);
  const send = (type, x, y, id = 7) => {
    const target = captured?.element || item;
    // A detached capture target cannot bubble to document in affected mobile WebViews.
    if (!target.isConnected) return false;
    const event = {pointerType: kind === 'desktop' ? 'mouse' : 'touch', pointerId: id,
      isPrimary: id === 7, button: 0, clientX: x, clientY: y, target,
      preventDefault() {}, stopPropagation() { this.stopped = true; }, stopImmediatePropagation() { this.stopped = true; }};
    const global = {pointermove: 'onPointerMove', pointerup: 'onPointerUp', pointercancel: 'onPointerCancel'}[type];
    if (global) h.api[global](event);
    if (!event.stopped) (target.listeners[type] || []).forEach(fn => fn(event));
    return true;
  };
  return {h, root, item, entry, send, operations, get capture() { return captured; },
    get saves() { return saves; }, get locked() { return locked; }, get selections() { return selections; }};
}

for (const kind of ['compact', 'placed', 'desktop']) {
  test(kind + ': 重建源节点后同一指针继续移动，并在松手时只提交一次', () => {
    const t = harness(kind, 1.5);
    t.send('pointerdown', 140, 90);
    t.send('pointermove', 140, 110);
    assert.equal(t.item.isConnected, false);
    assert.equal(t.capture.element, t.root, '捕获必须移交给不会重建的根节点');
    assert.equal(t.h.dragState.pointerId, 7);
    assert.equal(t.send('pointermove', 250, 350), true);
    assert.equal(t.h.dragState.point.x, 100);
    assert.equal(t.h.dragState.point.y, 200);
    assert.equal(t.h.dragState.element.style.left, '90px');
    assert.equal(t.h.dragState.element.style.top, '190px');
    t.send('pointerup', 250, 350);
    assert.equal(t.h.dragState, null); assert.equal(t.capture, null); assert.equal(t.locked, false);
    assert.equal(t.saves, 1); assert.equal(t.h.state.placed[0], t.entry);
    assert.equal(t.entry.col, 3); assert.equal(t.entry.row, 4);
    assert.deepEqual(t.operations, kind === 'placed' ? ['move'] : ['enter', 'move']);
  });
}

test('第二根手指的移动、松开与取消不能抢走或结束当前拖拽', () => {
  const t = harness();
  t.send('pointerdown', 140, 90); t.send('pointermove', 140, 110);
  const before = {...t.h.dragState.point};
  for (const type of ['pointermove', 'pointerup', 'pointercancel']) t.send(type, 350, 450, 8);
  assert.deepEqual({...t.h.dragState.point}, before); assert.equal(t.saves, 0);
  assert.equal(t.capture.id, 7);
  t.send('pointerup', 200, 300); assert.equal(t.saves, 1);
});

test('取消拖拽会释放捕获和视觉副本，保留原武器位置', () => {
  const t = harness('placed');
  t.send('pointerdown', 140, 90); t.send('pointermove', 140, 110);
  t.send('pointercancel', 200, 300);
  assert.equal(t.h.dragState, null); assert.equal(t.capture, null); assert.equal(t.locked, false);
  assert.equal(t.h.dragLayer.innerHTML, ''); assert.equal(t.h.root.dataset.dragging, 'false');
  assert.equal(t.saves, 0); assert.equal(t.entry.col, 2); assert.equal(t.entry.row, 2);
});

test('无效落点不丢失库存武器，退出拖拽状态', () => {
  const t = harness(); t.h.target.valid = false;
  t.send('pointerdown', 140, 90); t.send('pointermove', 140, 110); t.send('pointerup', 250, 350);
  assert.equal(t.h.state.inventory[0], t.entry); assert.equal(t.h.state.placed.length, 0);
  assert.equal(t.h.dragState, null); assert.equal(t.capture, null); assert.equal(t.saves, 0);
});

test('小幅移动仍按轻点查看详情，不误进入拖拽', () => {
  const t = harness('placed');
  t.send('pointerdown', 140, 90); t.send('pointermove', 142, 92); t.send('pointerup', 142, 92);
  assert.equal(t.h.dragState, null); assert.equal(t.item.isConnected, true);
  assert.equal(t.selections, 1); assert.equal(t.saves, 0);
});

test('等待移动阈值时，第二根手指松开不能清除第一根手指的手势', () => {
  const t = harness();
  t.send('pointerdown', 140, 90);
  t.send('pointerdown', 141, 91, 8);
  t.send('pointerup', 141, 91, 8);
  t.send('pointermove', 140, 110);
  assert.equal(t.h.dragState.pointerId, 7);
  assert.equal(t.capture.element, t.root);
  t.send('pointerup', 250, 350);
  assert.equal(t.saves, 1);
});
