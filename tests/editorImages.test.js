"use strict";
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { spawn } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const plain = value => JSON.parse(JSON.stringify(value));

function harness({ legacy = false } = {}) {
    const nodes = {}, requests = [], alerts = [];
    const files = ['hero.png', 'Profile.webp', 'a/hero.png', 'b/hero.png',
        'a/deep/portrait.webp', 'a/not-image.txt', '../outside.webp', 'bad name.png'];
    const node = id => nodes[id] ||= { style: {}, children: [], innerHTML: '', getContext() { return {}; } };
    const context = vm.createContext({ console, setTimeout, clearTimeout, clearInterval,
        alert: text => alerts.push(text), printe: text => alerts.push(text),
        document: {
            getElementById: node,
            createElement: () => ({style:{}}),
            body: {appendChild() {}},
            getElementsByClassName() {
                return [...node('uieventExtraBody').innerHTML.matchAll(/<input type="checkbox" key="([^"]+)" class="materialCheckbox" ([^>]*)\/>/g)]
                    .map(match => ({ checked: /checked/.test(match[2]), getAttribute: () => match[1] }));
            }
        },
        XMLHttpRequest: class {
            open(method, url) { this.url = url; }
            overrideMimeType() {}
            send(body) {
                requests.push([this.url, body]);
                // 反编译确认：旧 EXE 的路由按 StartsWith("listFile") 匹配。
                if (legacy && !this.url.startsWith('/listFile')) {
                    this.status = 404; this.response = '';
                } else {
                    this.status = 200;
                    const parent = body.slice(5).replace(/^\.\/project\/images\//, '');
                    const list = this.url === '/listDirectoryRecursive' && !legacy ? files : files
                        .filter(name => name.startsWith(parent) && !name.slice(parent.length).includes('/'))
                        .map(name => name.slice(parent.length));
                    this.response = JSON.stringify(list);
                }
                this.onload();
            }
        }
    });
    vm.runInContext(`window = globalThis;
        function Editor() {}
        editor = new Editor();
        data_a1e2fb4a_e986_4524_b0da_9b7ba7c0874d = {main:{floorIds:['MT0']}};
        core = editor.core = { material: { images: { images: {} } } };`, context);
    for (const file of ['_server/fs.js', '_server/editor_uievent.js', '_server/editor_table.js',
        '_server/editor_mode.js', '_server/table/data.comment.js']) vm.runInContext(read(file), context, {filename:file});
    vm.runInContext(`editor_uievent_wrapper(editor); editor_table_wrapper(editor);
        editor.mode = editor_mode(editor);
        imageConfig = data_comment_c456ea59_6018_45ef_8bcc_211a24c627dc._data.main._data.images;`, context);
    return { context, requests, alerts, nodes, run: code => vm.runInContext(code, context) };
}

test('图片选择、预览与确认保存保留多级路径，并区分不同目录的同名文件', () => {
    const h = harness();
    h.run(`input = {value: JSON.stringify(['hero.png', 'a/hero.png', 'b/hero.png', 'a/deep/portrait.webp']),
        onchange() { saved = JSON.parse(this.value); }};
        editor.table.selectMaterial(input, imageConfig);`);
    const html = h.nodes.uieventExtraBody.innerHTML;
    assert.match(html, /key="Profile.webp"/);
    assert.match(html, /<img key="\.\/project\/images\/a\/deep\/portrait.webp"/);
    assert.doesNotMatch(html, /not-image.txt|outside.webp|bad name.png/);
    assert.equal(h.requests[0][0], '/listDirectoryRecursive');
    h.run('editor.uievent.elements.yes.onclick()');
    assert.deepEqual(plain(h.context.saved).sort(), ['a/deep/portrait.webp', 'a/hero.png', 'b/hero.png', 'hero.png']);
    const img = {style:{}, getAttribute:()=> './project/images/a/deep/portrait.webp'};
    const br = {style:{display:'none'}, nextElementSibling:img};
    h.context.editor.uievent._previewMaterialImage({nextElementSibling:br});
    assert.equal(img.src, './project/images/a/deep/portrait.webp');
});

test('存在性校验按图片所在目录执行，不把子目录图片误报为缺失', () => {
    const h = harness();
    assert.equal(h.run(`editor.mode.checkImages(['hero', 'a/hero.png', 'a/deep/portrait.webp'], './project/images/')`), true);
    assert.deepEqual(h.alerts, []);
    assert.deepEqual(h.requests.map(r=>r[1]).sort(), ['name=./project/images/', 'name=./project/images/a/', 'name=./project/images/a/deep/']);
    h.run(`editor.mode.checkImages(['a/missing.webp'], './project/images/')`);
    assert.match(h.alerts[0], /a\/missing.webp.*不存在/);
});

test('绝对路径、上级目录、空段和非法字符不能进入图片配置', () => {
    const h = harness();
    for (const name of ['../hero.png','a/../hero.png','/hero.png','a//hero.png','a\\hero.png','C:/hero.png','中文.png',3]) {
        assert.equal(h.run(`editor.mode.checkImages([${JSON.stringify(name)}], './project/images/')`), false);
    }
    assert.equal(h.requests.length, 0);
    assert.equal(h.run(`editor.mode.checkImages(['a/hero.png'], './project/tilesets/')`), false);
});

test('旧启动服务回退根目录，并在确认时保留已经选中的子目录图片', () => {
    const h = harness({legacy:true});
    h.run(`input = {value:'["Profile.webp","a/deep/portrait.webp"]', onchange(){saved=JSON.parse(this.value)}};
        editor.table.selectMaterial(input, imageConfig); editor.uievent.elements.yes.onclick();`);
    assert.match(h.nodes.uieventExtraBody.innerHTML, /node server.js/);
    assert.deepEqual(plain(h.context.saved), ['Profile.webp','a/deep/portrait.webp']);
    assert.deepEqual(h.requests.map(r=>r[0]), ['/listDirectoryRecursive','/listFile']);
});

test('普通图片名精确匹配，音频选择器保持单层目录行为', () => {
    const h = harness();
    h.run(`editor.uievent.selectMaterial('["a/hero.png"]', '图片', './project/images/', function(name){return fs.isImageFile(name) ? name : null}, function(){});`);
    assert.match(h.nodes.uieventExtraBody.innerHTML, /key="hero.png" class="materialCheckbox"  /);
    h.run(`editor.uievent.selectMaterial([], '音频', './project/bgms/', function(name){return name}, function(){});`);
    assert.equal(h.requests.at(-1)[0], '/listFile');
});

test('原有游戏加载器保留子目录 WebP 的请求路径和资源键', () => {
    const context = vm.createContext({ main:{version:'test'}, console,
        Image:class {setAttribute(){} set src(value){this.url=value;this.onload();}} });
    vm.runInContext(read('libs/loader.js'), context);
    vm.runInContext(`loader.prototype.loadImage('images', 'a/deep/portrait.webp', function(key,img){result=[key,img.url];})`,context);
    assert.deepEqual(plain(context.result), ['a/deep/portrait.webp','project/images/a/deep/portrait.webp?v=test']);
});

test('Node 服务实际递归列目录、保留重复文件名并提供 WebP 文件', async t => {
    const temp = fs.mkdtempSync(path.join(root, 'tmp', 'editor-images-test-'));
    // 只删除本测试创建、且已确认位于工程 tmp 下的目录。
    assert.equal(path.dirname(temp), path.join(root,'tmp'));
    t.after(()=>fs.rmSync(temp,{recursive:true,force:true}));
    for (const name of ['hero.png','a/hero.png','b/hero.png','a/deep/portrait.webp']) {
        fs.mkdirSync(path.dirname(path.join(temp,name)),{recursive:true});
        fs.writeFileSync(path.join(temp,name),name);
    }
    const child = spawn(process.execPath,['server.js'],{cwd:root,windowsHide:true,stdio:['ignore','pipe','pipe']});
    t.after(()=>child.kill());
    const base = await new Promise((resolve,reject)=>{
        const timer=setTimeout(()=>reject(Error('Server startup timeout')),10000);
        child.once('error',error=>{clearTimeout(timer);reject(error);});
        child.stdout.on('data',chunk=>{
            const match=chunk.toString().match(/http:\/\/127\.0\.0\.1:\d+/);
            if(match){clearTimeout(timer);resolve(match[0]);}
        });
    });
    const relative = path.relative(root,temp).replaceAll('\\','/');
    const response = await fetch(base+'/listDirectoryRecursive',{method:'POST',body:'name='+relative});
    assert.deepEqual(await response.json(),['a/deep/portrait.webp','a/hero.png','b/hero.png','hero.png']);
    const flat = await fetch(base+'/listFile',{method:'POST',body:'name='+relative});
    assert.ok((await flat.json()).includes('hero.png'));
    const image = await fetch(base+'/'+relative+'/a/deep/portrait.webp');
    assert.equal(image.headers.get('content-type'), 'image/webp');
    assert.equal(await image.text(),'a/deep/portrait.webp');
    const denied = await fetch(base+'/listDirectoryRecursive',{method:'POST',body:'name=..'});
    assert.equal(denied.status,403);
});
