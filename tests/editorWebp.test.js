"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

function parser() {
    const context = vm.createContext({ MotaActionFunctions: {}, core:{material:{items:{},enemys:{}}},
        MotaActionBlocks: new Proxy({}, {get: (_, type) => ({xmlText: args => JSON.stringify({type,args})})}) });
    vm.runInContext(fs.readFileSync(path.join(__dirname, "../_server/MotaActionParser.js"), "utf8"), context);
    vm.runInContext("MotaActionParser();", context);
    return context.MotaActionFunctions.actionParser;
}

test("事件编辑器导入 WebP 窗口皮肤和背景时保留图片名称", () => {
    for (const type of ["setText", "drawBackground"]) {
        for (const background of ["winskin.webp", "folder/window-skin.webp", "winskin.png"]) {
            const result = JSON.parse(parser().parseList({type,background}));
            assert.equal(result.type,type + "_s");
            assert.ok(result.args.includes(background),background + " 不应被当作颜色转换");
        }
    }
});

test("事件编辑器的纯色背景保持原有颜色转换", () => {
    for (const type of ["setText", "drawBackground"]) {
        const result = JSON.parse(parser().parseList({type,background:[12,34,56,0.8]}));
        assert.ok(result.args.includes("12,34,56,0.8"));
        assert.ok(result.args.includes("rgba(12,34,56,0.8)"));
    }
});
