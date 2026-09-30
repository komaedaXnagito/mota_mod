"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const pluginName = "plugins_bb40132b_638b_4a9f_b028_d3fe47acc8d1";
const source = fs.readFileSync(path.join(__dirname, "../project/plugins.js"), "utf8");

for (const name of ["data", "maps", "icons"]) {
    test(`${name}.js 的赋值对象是严格 JSON`, () => {
        const source = fs.readFileSync(path.join(__dirname, `../project/${name}.js`), "utf8");
        const match = source.match(/^var \w+ =\s*([\s\S]*?);?\s*$/);
        assert.ok(match);
        assert.doesNotThrow(() => JSON.parse(match[1]));
    });
}

function harness() {
    const elements = new Map();
    const document = {
        getElementById: id => elements.get(id) || null,
        createElement(tag) {
            return {
                tagName: tag, style: {}, children: [], readyState: 1, currentTime: 0,
                playCount: 0, pauseCount: 0,
                setAttribute() {},
                appendChild(child) { this.children.push(child); elements.set(child.id, child); },
                play() { this.playCount++; return Promise.resolve(); },
                pause() { this.pauseCount++; }
            };
        }
    };
    const anchor = {
        style: { display: "none" },
        insertAdjacentElement(position, element) {
            assert.equal(position, "afterend");
            elements.set(element.id, element);
        }
    };
    const core = { plugin: {}, status: { played: false }, domStyle: { scale: 1, isVertical: false } };
    const main = { dom: { startPanel: anchor } };
    const context = vm.createContext({ core, main, document });
    vm.runInContext(source, context);
    context[pluginName].gameBackgroundVideo.call(core.plugin);
    return { context, core, main, anchor, elements };
}

test("plugins.js 仅声明插件对象，背景辅助函数通过插件初始化注册", () => {
    const context = vm.createContext({});
    vm.runInContext(source, context);
    assert.deepEqual(Object.keys(context), [pluginName]);
    assert.equal(typeof context[pluginName].gameBackgroundVideo, "function");
    const h = harness();
    assert.equal(typeof h.core.plugin._ensureGameBackgroundVideo, "function");
    assert.equal(typeof h.core.plugin._resizeGameBackgroundVideos, "function");
    assert.equal(Object.keys(h.context[pluginName])[0], "gameBackgroundVideo");
});

test("背景视频创建、复用、播放状态和左右同步保持正常", () => {
    const h = harness(), plugin = h.core.plugin;
    const layer = plugin._ensureGameBackgroundVideo(h.anchor);
    const videos = h.main.dom.outerBackgroundVideos;
    assert.equal(videos.length, 2);
    assert.equal(h.main.dom.outerBackgroundVideo, videos[0]);
    assert.equal(videos[0].pauseCount, 1);
    assert.equal(videos[0].playCount, 0);
    assert.equal(videos[0].src, "project/video/background.mp4");
    h.core.status.played = true;
    videos[0].currentTime = 5;
    assert.equal(plugin._ensureGameBackgroundVideo(h.anchor), layer);
    assert.equal(layer.children.length, 2);
    assert.equal(videos[1].currentTime, 5);
    assert.equal(videos[0].playCount, 1);
    h.elements.set("careerSelect", { style: { display: "block" } });
    plugin._ensureGameBackgroundVideo(h.anchor);
    assert.equal(videos[0].pauseCount, 2);
    assert.equal(videos[0].playCount, 1);
});

test("背景视频按横竖屏画布位置缩放，尚无视频时安全返回", () => {
    const h = harness(), plugin = h.core.plugin;
    const geometry = { gameDrawBox: { left: 100, top: 50 }, canvasWidth: 300, totalWidth: 1000, totalHeight: 800 };
    plugin._resizeGameBackgroundVideos(geometry);
    plugin._ensureGameBackgroundVideo(h.anchor);
    h.core.domStyle.scale = 2;
    plugin._resizeGameBackgroundVideos(geometry);
    const [left, right] = h.main.dom.outerBackgroundVideos;
    assert.equal(left.style.width, "200px");
    assert.equal(right.style.left, "800px");
    assert.equal(right.style.width, "200px");
    h.core.domStyle.isVertical = true;
    plugin._resizeGameBackgroundVideos(geometry);
    assert.equal(left.style.height, "100px");
    assert.equal(right.style.top, "700px");
    assert.equal(right.style.height, "100px");
});

test("编辑器函数序列化往返后插件仍包含背景辅助函数", () => {
    const h = harness(), functions = {};
    const json = JSON.stringify(h.context[pluginName], (key, value) => {
        if (typeof value !== "function") return value;
        const id = `__function_${Object.keys(functions).length}__`;
        functions[id] = value.toString();
        return id;
    }, 4);
    let saved = json;
    for (const [id, body] of Object.entries(functions)) saved = saved.replace(JSON.stringify(id), () => body);
    const restored = vm.runInContext(`(${saved})`, h.context);
    assert.deepEqual(Object.keys(restored), Object.keys(h.context[pluginName]));
    h.core.plugin = {};
    restored.gameBackgroundVideo.call(h.core.plugin);
    h.core.plugin._ensureGameBackgroundVideo(h.anchor);
    assert.equal(h.main.dom.outerBackgroundVideos.length, 2);
});
