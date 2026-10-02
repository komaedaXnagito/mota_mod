"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const read = name => fs.readFileSync(path.join(__dirname, "../project", name + ".js"), "utf8");
const clone = data => JSON.parse(JSON.stringify(data));

function fixture() {
    const context = vm.createContext({ console, setTimeout, clearTimeout });
    for (const name of ["backpackBattleStatuses", "backpackBattleRules", "backpackBattleCore", "backpackBattleEstimateKernel"])
        vm.runInContext(read(name), context);
    return { context, kernel: context.backpackBattleEstimateKernel_69e88a3f_71f9_4df3_82a6_c4695b166a71 };
}

function weapon(id = "sword", damage = 10, interval = 100, combatRules = []) {
    return { instanceId: id, name: id, row: 0, col: 0, cells: [[0, 0]],
        attributes: { minAttack: damage, maxAttack: damage, hitRate: 1,
            attackInterval: interval / 100, attackIntervalTicks: interval, ultimateGain: 0 }, combatRules };
}
function input(weapons = [weapon()]) {
    return { player: { hp: 1000, maxHp: 1000, buffs: [], debuffs: [] },
        // The estimate must ignore any actual enemy attributes supplied by a caller.
        enemy: { hp: 1, maxHp: 1, atk: 9999, buffs: [{ id: "block", stacks: 999 }] },
        weapons, randomSeed: 12345 };
}

test("500 tick DPS 包含第 500 tick，长冷却与空背包都得到零", () => {
    const { kernel } = fixture();
    const result = kernel.simulateDps(input());
    assert.equal(result.ticks, 500);
    assert.equal(result.totalDamage, 50);
    assert.equal(result.dps, 10);
    for (const weapons of [[], [weapon("slow", 10, 501)], [weapon("passive", 10, 0)]]) {
        const zero = kernel.simulateDps(input(weapons));
        assert.equal(zero.ticks, 500);
        assert.equal(zero.totalDamage, 0);
        assert.equal(zero.dps, 0);
    }
});

test("500 tick 计入开局伤害、直接效果和灼烧", () => {
    const { kernel } = fixture();
    const w = weapon("burn", 10, 100, [
        { trigger: "battleStart", effects: [{ type: "dealDamage", target: "enemy", direct: true, value: 7 }] },
        { trigger: "afterHit", effects: [
            { type: "dealDamage", target: "enemy", direct: true, value: 3 },
            { type: "applyStatus", target: "opponent", status: "burn", stacks: 1 }
        ] }
    ]);
    const result = kernel.simulateDps(input([w]));
    // Five hits (65), opening damage (7), burns at ticks 200/300/400/500 (10+20+30+40).
    assert.equal(result.totalDamage, 172);
    assert.equal(result.dps, 34.4);
});

test("没有主动攻击的辅助装备仍可在开局造成伤害", () => {
    const { kernel } = fixture();
    const passive = weapon("passive", 0, 0, [{ trigger: "battleStart",
        effects: [{ type: "dealDamage", target: "enemy", direct: true, value: 25 }] }]);
    assert.equal(kernel.simulateDps(input([passive])).dps, 5);
});

test("500 tick 模拟与实战的多段、奥义和临时冷却修正一致且不修改输入", () => {
    const { context, kernel } = fixture();
    const w = weapon("burst", 10, 120, [
        { trigger: "battleStart", effects: [{ type: "modifyWeaponStat", target: "self",
            stat: "attackIntervalTicks", value: -30, durationTicks: 50 }] }
    ]);
    w.attributes.extraAttackCount = 1;
    w.attributes.ultimateGain = 25;
    w.attributes.minAttack = 3;
    w.attributes.maxAttack = 17;
    w.attributes.hitRate = .7;
    const data = input([w]);
    const before = JSON.stringify(data);
    const predicted = kernel.simulateDps(data);
    assert.equal(JSON.stringify(data), before);
    assert.deepEqual(clone(kernel.simulateDps(data)), clone(predicted), "重复计算保持一致");
    let seed = data.randomSeed;
    const runtime = context.createBackpackBattleRuntime_2f8f7df2_bf4f_45ea_8ec4_628e0e25a0dc({
        randBattle(n) {
            seed = seed * 16807 % 2147483647;
            const value = seed / 2147483647;
            return n == null ? value : Math.floor(value * n);
        }, registerAnimationFrame() {}, unregisterAnimationFrame() {}
    });
    const actualInput = clone(data);
    actualInput.enemy = { hp: 1e30, maxHp: 1e30, atk: 0, attackIntervalTicks: 501, buffs: [], debuffs: [] };
    runtime.start(actualInput);
    const actual = runtime.stepTicks(500);
    assert.equal(predicted.totalDamage, actual.enemy.damageTaken);
    assert.equal(predicted.randomSeedEnd, seed);
    runtime.destroy();
});

test("Worker 将 DPS 与怪物损血预估分开派发", () => {
    const calls = [], responses = [];
    const context = vm.createContext({ self: { location: { search: "" }, postMessage: data => responses.push(data) },
        importScripts() {}, backpackBattleEstimateKernel_69e88a3f_71f9_4df3_82a6_c4695b166a71: {
            simulate(data) { calls.push(["battle", data]); return { damage: 1 }; },
            simulateDps(data) { calls.push(["dps", data]); return { dps: 12 }; }
        } });
    vm.runInContext(read("workers/backpackBattleEstimateWorker"), context);
    context.self.onmessage({ data: { requestId: "a", randomSeed: 10, inputSnapshot: { simulationMode: "backpackDps" } } });
    context.self.onmessage({ data: { requestId: "b", randomSeed: 20, inputSnapshot: {} } });
    assert.deepEqual(calls.map(call => call[0]), ["dps", "battle"]);
    assert.equal(calls[0][1].randomSeed, 10);
    assert.equal(responses[0].result.dps, 12);
    assert.equal(responses[1].result.damage, 1);
});

test("DPS 标签从计算中刷新为数值，失败或关闭后不显示旧值", () => {
    const source = read("backpackSystem");
    const render = source.match(/\tconst renderDps = function \(\) \{[^]*?\n\t\};/)[0];
    let entry = { status: "pending" }, requests = 0;
    const value = {}, label = { querySelector: () => value };
    const context = vm.createContext({ root: {}, dpsLabel: label,
        core: { plugin: { backpackBattleEstimate: { requestDps() { requests++; return entry; } } } } });
    vm.runInContext(render + "\nthis.renderDps = renderDps;", context);
    context.renderDps();
    assert.equal(value.textContent, "计算中");
    entry = { status: "ready", result: { dps: 12.34, totalDamage: 61.7 } };
    context.renderDps();
    assert.equal(value.textContent, "12.3");
    assert.match(label.title, /500 tick（5 秒）.*61.7/);
    entry = { status: "error", error: "Worker unavailable" };
    context.renderDps();
    assert.equal(value.textContent, "—");
    context.dpsLabel = null;
    context.renderDps();
    assert.equal(requests, 3);
});

test("桌面返回按钮对齐右上角，竖屏保留背包标题栏位置", () => {
    const source = read("backpackSystem");
    const compute = source.match(/\tconst computeLayout = function \(\) \{[^]*?\n\t\};/)[0];
    for (const [width, height, compact] of [[1320, 820, false], [960, 600, false], [416, 680, true], [308, 560, true]]) {
        const button = { style: {} };
        const context = vm.createContext({ root: { clientWidth: width, clientHeight: height, dataset: { compact: String(compact) } },
            getGridConfig: () => ({ maxCols: 3, maxRows: 3 }), isCellUnlocked: () => true, isExpansionCell: () => false,
            getComputedStyle: () => ({}), CONFIG: { maxCellSize: 30 }, px: value => value + "px", dragState: null,
            boardPanel: null, detailPanel: null, toolbarElement: null, boardControls: null, returnButton: button,
            bagCanvas: { style: {} }, layout: null });
        vm.runInContext(compute + "\ncomputeLayout();", context);
        const board = context.layout.board;
        assert.equal(parseFloat(button.style.left), compact ? board.left + board.width - 94 : width - board.left - 76);
        assert.equal(parseFloat(button.style.top), compact ? board.top + 10 : 18);
    }
});
