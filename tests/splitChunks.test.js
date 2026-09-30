"use strict";
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function harness(options = {}) {
    const requests = [], errors = [], revoked = [], images = [], timers = [], decodes = [];
    let nextUrl = 0;
    const blobs = new Map();
    class FakeImage {
        constructor() { this.width = 32; this.height = 32; images.push(this); }
        setAttribute() {}
        set src(value) {
            this.url = value;
            if (options.syncImages) this.onload();
        }
    }
    const core = {
        dom: { startTopProgress: { style: {} }, startTopLoadTips: {} },
        materials: [], images: [], tilesets: [], animates: [], bgms: [], sounds: [],
        material: { images: {}, icons: { autotile: {} }, sounds: {}, bgms: {}, animates: {} },
        statusBar: { icons: {}, image: {} },
        maps: { _makeAutotileEdges() { core.edgesReady = true; } },
        musicStatus: { audioContext: { decodeAudioData(data, ok, fail) { decodes.push({ data, ok, fail }); } } },
        splitImage() { core.materialsReady = true; return []; },
        formatSize: String, playBgm() {},
        unzip(url, ok, fail, text, progress) { requests.push({ url, ok, fail, text, progress }); }
    };
    const main = { version: 'test', useCompress: true, splitChunkMap: options.map };
    const context = vm.createContext({ core, main, Image: FakeImage, Blob,
        Audio: class {}, console: { error: (...args) => errors.push(args), warn() {} },
        URL: { createObjectURL(blob) { const url = 'blob:' + (++nextUrl); blobs.set(url, blob); return url; },
            revokeObjectURL(url) { revoked.push(url); } },
        setTimeout: callback => timers.push(callback), zip: options.zip
    });
    vm.runInContext(fs.readFileSync(path.join(__dirname, '../libs/loader.js'), 'utf8'), context);
    core.loader = new context.loader();
    return { core, main, requests, errors, revoked, images, timers, decodes, blobs,
        flush() { while (timers.length) timers.shift()(); } };
}
const emptyMap = () => Object.fromEntries(['animates', 'sounds', 'materials', 'images', 'autotiles', 'tilesets'].map(x => [x, []]));

test('空分块类别只完成一次，并等待自动元件后处理', () => {
    const h = harness({ map: emptyMap() }); let count = 0;
    h.core.loader._load(() => { count++; assert.equal(h.core.edgesReady, true); });
    assert.equal(count, 0); h.flush();
    assert.equal(count, 1); assert.equal(h.requests.length, 0);
});

test('多类别乱序分块等待图片、音效解码与类别后处理，完成仅一次', () => {
    const map = emptyMap();
    map.images = ['project/images/images-0.h5data', 'project/images/images-1.h5data'];
    map.materials = ['project/materials/materials-0.h5data'];
    map.sounds = ['project/sounds/sounds-0.h5data'];
    const h = harness({ map });
    h.core.images = ['a/hero.png', 'b/hero.png']; h.core.materials = ['icons']; h.core.sounds = ['ok.wav'];
    let count = 0;
    h.core.loader._load(() => { count++; assert.equal(h.core.materialsReady, true); assert.equal(h.core.edgesReady, true); });
    const req = suffix => h.requests.find(r => r.url.includes(suffix));
    req('images-1').ok({ 'b/hero.png': 'B' });
    req('images-0').ok({ 'a/hero.png': 'A' });
    req('materials-0').ok({ 'icons.png': 'I' });
    req('sounds-0').ok({ 'ok.wav': new ArrayBuffer(1) });
    h.flush(); assert.equal(count, 0);
    h.images.forEach(img => { img.onload(); img.onload(); });
    assert.equal(count, 0); h.decodes[0].ok('decoded'); h.decodes[0].fail('late duplicate');
    assert.equal(count, 1); assert.equal(h.revoked.length, 3);
    assert.equal(h.blobs.get(h.core.material.images.images['a/hero.png'].url), 'A');
    assert.equal(h.blobs.get(h.core.material.images.images['b/hero.png'].url), 'B');
    req('images-0').ok({ 'a/hero.png': 'A' }); req('images-0').fail('late');
    assert.equal(count, 1);
});

test('图片解码失败、缺图、下载失败会报告错误且不会阻塞回调', () => {
    const h = harness(); let count = 0; const saved = {};
    h.core.loader.loadImagesFromZip(['one', 'two'], ['broken.png', 'missing.png'], saved, null, () => count++);
    h.requests[0].ok({ 'broken.png': 'broken' }); h.requests[1].fail('HTTP 404');
    assert.equal(count, 0); h.images[0].onerror(); h.images[0].onload();
    assert.equal(count, 1); assert.equal(h.revoked.length, 1); assert.equal(Object.keys(saved).length, 0);
    assert.equal(h.errors.length, 4);
});

test('无分块表和缺失类别保持旧压缩包路径，空图片列表不请求', () => {
    const h = harness({ map: { images: ['split'] } });
    assert.deepEqual(Array.from(h.core.loader._getResourceChunks('sounds')), ['project/sounds/sounds.h5data']);
    h.main.splitChunkMap = undefined;
    h.core.images = ['nested/pic.webp']; let count = 0;
    h.core.loader._loadExtraImages_async(null, () => count++);
    assert.equal(h.requests[0].url, 'project/images/images.h5data?v=test');
    h.requests[0].ok({ 'nested/pic.webp': 'pic' }); h.images[0].onload();
    assert.equal(count, 1);
    h.core.loader.loadImagesFromZip('unused', [], {}, null, () => count++);
    assert.equal(count, 2); assert.equal(h.requests.length, 1);
});

test('同步解码与重复素材不会提前结束多个分块', () => {
    const h = harness({ syncImages: true }); const saved = {}; let count = 0;
    h.core.loader.loadImagesFromZip(['a', 'b'], ['folder.v1/icon', 'folder.v1/icon'], saved, null, () => count++);
    h.requests[0].ok({ 'folder.v1/icon.png': 'a' }); assert.equal(count, 0);
    h.requests[1].ok({ 'folder.v1/icon.png': 'duplicate' });
    assert.equal(count, 1); assert.equal(h.images.length, 1);
});

test('压缩包进度按字节合并，音效解码异常仍完成一次', () => {
    const h = harness(); const progress = []; let count = 0;
    h.core.loader._loadArchives(['a', 'b'], false, (l,t) => progress.push([l,t]), (data, done) => { done(); done(); }, () => count++);
    h.requests[0].progress(2, 10); h.requests[1].progress(5, 20);
    assert.deepEqual(progress.at(-1), [7, 30]);
    h.requests.forEach(r => r.ok({})); assert.equal(count, 1);
    h.core.musicStatus.audioContext = null;
    h.core.loader._loadOneSound_decodeData('bad', new ArrayBuffer(1), () => count++);
    assert.equal(count, 2); assert.equal(h.core.material.sounds.bad, null);
});

test('未压缩源码保持原始资源加载路径及嵌套图片名', () => {
    const h = harness({ map: emptyMap() }); h.main.useCompress = false;
    let called = '';
    h.core.loader._load_sync = () => { called = 'sync'; };
    h.core.loader._load_async = () => { called = 'async'; };
    h.core.loader._load(() => {}); assert.equal(called, 'sync');
    h.core.loader.loadImage('images', 'sub/pic.webp', () => {});
    assert.equal(h.images[0].url, 'project/images/sub/pic.webp?v=test');
});

test('兼容平台唯一 basename 压缩条目，有同名冲突时按原路径回退', () => {
    const h = harness(); const saved = {}; let count = 0;
    h.core.loader.loadImagesFromZip(['project/images/images-0.h5data'],
        ['unique/icon.webp', 'a/hero.png', 'b/hero.png'], saved, null, () => count++);
    h.requests[0].ok({ 'icon.webp': 'unique', 'hero.png': 'ambiguous' });
    assert.equal(h.images.length, 1); h.images[0].onload();
    assert.equal(h.images.length, 3); assert.equal(count, 0);
    assert.equal(h.images[1].url, 'project/images/a/hero.png?v=test');
    assert.equal(h.images[2].url, 'project/images/b/hero.png?v=test');
    h.images[1].onload(); h.images[2].onerror();
    assert.equal(count, 1); assert.equal(saved['a/hero.png'], h.images[1]);
    assert.equal(saved['b/hero.png'], undefined);
});

test('动画分块等待内嵌位图，异常动画及坏位图只结算一次', () => {
    const h = harness({ map: { animates: ['project/animates/animates-0.h5data'] } });
    h.core.animates = ['a', 'b']; let count = 0;
    h.core.loader._loadAnimates_async(null, () => count++);
    h.requests[0].ok({ 'a.animate': JSON.stringify({ bitmaps: ['data:image/png;base64,x'], frames: [] }), 'b.animate': 'bad JSON' });
    assert.equal(count, 0); h.images[0].onerror(); h.images[0].onload();
    assert.equal(count, 1); assert.equal(h.core.material.animates.b, null);
});

test('完整旧压缩启动等待动画和音效，分块缺省不改变归档协议', () => {
    const h = harness(); let count = 0;
    h.core.loader._load(() => count++);
    assert.deepEqual(h.requests.map(r => r.url), ['project/animates/animates.h5data?v=test', 'project/sounds/sounds.h5data?v=test']);
    h.flush(); assert.equal(count, 0);
    h.requests[0].ok({}); assert.equal(count, 0);
    h.requests[1].ok({}); assert.equal(count, 1);
});

test('Blob音效读取及解码错误均可结束，不重复回调', () => {
    let readOk, readFail;
    const h = harness({ zip: { BlobReader: class {
        constructor() { this.size = 1; }
        init(ok) { ok(); }
        readUint8Array(start, size, ok, fail) { readOk = ok; readFail = fail; }
    } } });
    let count = 0;
    h.core.loader._loadOneSound_decodeData('blob.wav', new Blob(['x']), () => count++);
    readOk(new Uint8Array([1])); assert.equal(count, 0);
    h.decodes[0].fail('invalid audio'); readFail('late failure');
    assert.equal(count, 1); assert.equal(h.core.material.sounds['blob.wav'], null);
});
