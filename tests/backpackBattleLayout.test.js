"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const source = fs.readFileSync(path.join(__dirname, "../project/backpackBattleUI.js"), "utf8");
const extract = name => source.match(new RegExp("\\tvar " + name + " = function \\([^]*?\\n\\t\\};"))[0];
const helpers = ["normalizeCells", "rotateCells", "getBattleGridLayout"].map(extract).join("\n");
const layoutFor = vm.runInNewContext(helpers + "\ngetBattleGridLayout;");
const rectangle = (x, y, width, height) => Array.from({ length: width * height }, (_, i) => [x + i % width, y + Math.floor(i / width)]);

test("战斗兵装只显示 7×6 已解锁区域，保留尚未放武器的空格", () => {
    const state = { config: { maxCols: 10, maxRows: 10 }, unlockedCells: rectangle(1, 2, 7, 6) };
    const before = JSON.stringify(state);
    const layout = layoutFor(state, [{ col: 2, row: 3, cells: [[0, 0]] }]);
    assert.deepEqual([layout.minCol, layout.minRow, layout.cols, layout.rows, layout.cells.length], [1, 2, 7, 6, 42]);
    assert.equal(layout.unlocked["7,7"], true);
    assert.equal(layout.unlocked["0,0"], undefined);
    assert.equal(JSON.stringify(state), before, "裁剪只影响显示，不能改写存档坐标");
});

test("单格向左扩容改变原点，但不补齐未解锁的角落", () => {
    const layout = layoutFor({ unlockedCells: rectangle(1, 2, 7, 6).concat([[0, 4]]) }, []);
    assert.deepEqual([layout.minCol, layout.minRow, layout.cols, layout.rows, layout.cells.length], [0, 2, 8, 6, 43]);
    assert.equal(layout.unlocked["0,4"], true);
    assert.equal(layout.unlocked["0,2"], undefined);
});

test("全部解锁及没有背包数据的旋转武器预览仍完整显示", () => {
    const full = layoutFor({ unlockedCells: rectangle(0, 0, 10, 10) }, []);
    assert.deepEqual([full.cols, full.rows, full.cells.length], [10, 10, 100]);
    const preview = layoutFor(null, [{ col: 4, row: 6, rotation: 90, cells: [[0, 0], [0, 1], [0, 2]] }]);
    assert.deepEqual([preview.minCol, preview.minRow, preview.cols, preview.rows, preview.cells.length], [4, 6, 3, 1, 3]);
    const empty = layoutFor(null, []);
    assert.deepEqual([empty.cols, empty.rows, empty.cells.length], [1, 1, 0]);
});

test("裁剪后的联动高亮与原坐标对应，不能高亮未解锁格", () => {
    const rendered = [];
    const context = {
        gridLayout: layoutFor({ unlockedCells: rectangle(2, 3, 3, 2) }, []),
        latestSnapshot: { weapons: [{ instanceId: "a", synergyCells: [{ col: 3, row: 4 }, { col: 1, row: 4 }] }] },
        weaponNodes: { a: { cellSize: 24 } },
        nodes: { synergyLayer: { appendChild(cell) { rendered.push(cell); } } },
        clearWeaponSynergy() {},
        document: { createElement() { return { style: {}, setAttribute() {}, appendChild() {} }; } }
    };
    vm.runInNewContext(extract("renderWeaponSynergy") + '\nrenderWeaponSynergy("a");', context);
    assert.equal(rendered.length, 1);
    assert.deepEqual(rendered[0].style, { left: "24px", top: "24px", width: "24px", height: "24px" });
});
