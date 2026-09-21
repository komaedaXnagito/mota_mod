"use strict";
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, 'project', name), 'utf8');
const context = vm.createContext({ console });
vm.runInContext(read('weapons.js') + '\n' + read('backpackUiCommon.js'), context);
const definitions = context.weaponDefinitions_9f2e6f5b_4b2c_4f8c_9a3d_7e1b6c0d5a44;
const common = context.backpackUiCommon_2c986f67_7621_44eb_972d_24f1e2c6ce61;
const cellsOf = weapon => weapon.shape.flatMap((row,y) => row.flatMap((v,x) => v ? [[x,y]] : []));
const element = () => ({ style: {}, dataset: {}, children: [], appendChild(child) { this.children.push(child); } });
const battle = vm.createContext({ document: { createElement: element }, BATTLE_IMAGE_INSET_CELLS: .12,
    common: { getWeaponImageInset: common.getWeaponImageInset, setWeaponImageSource(img, src) { img.src = src; } } });
const extract = (source, name) => source.match(new RegExp('(?:var|const) ' + name + ' = function[^]*?\\n\\t\\};'))[0];
for (const name of ['normalizeCells', 'rotateCells', 'getBounds', 'createArt', 'getWeaponFlightScale']) vm.runInContext(extract(read('backpackBattleUI.js'), name), battle);

test('全部159项武器均有有效占格、存在的图片及真实尺寸内的裁剪框', () => {
    assert.equal(Object.keys(definitions).length, 159);
    for (const [id, weapon] of Object.entries(definitions)) {
        assert.ok(Array.isArray(weapon.shape) && cellsOf(weapon).length, id + '占格');
        const image = fs.readFileSync(path.join(root, weapon.image));
        const width = image.readUInt32BE(16), height = image.readUInt32BE(20);
        const [x, y, w, h, fullW, fullH] = weapon.imageCrop;
        assert.equal(fullW, width, id); assert.equal(fullH, height, id);
        assert.ok(x >= 0 && y >= 0 && w > 0 && h > 0 && x + w <= width && y + h <= height, id + '裁剪不得越界');
    }
});

test('三格香蕉缩小约17%，四格御守杖放大约21%，一格和完整方形武器保持原尺寸', () => {
    const scale = (weapon, inset) => {
        const cols = weapon.shape[0].length, rows = weapon.shape.length;
        return Math.min((cols - inset * 2) / weapon.imageCrop[2], (rows - inset * 2) / weapon.imageCrop[3]);
    };
    const banana = definitions.I597, staff = definitions.I532;
    const bananaRatio = scale(banana, common.getWeaponImageInset(banana)) / scale(banana, .12);
    const staffRatio = scale(staff, common.getWeaponImageInset(staff)) / scale(staff, .12);
    assert.ok(bananaRatio > .8 && bananaRatio < .85);
    assert.ok(staffRatio > 1.2 && staffRatio < 1.22);
    assert.equal(common.getWeaponImageInset({shape:[[1]]}), .12);
    assert.equal(common.getWeaponImageInset({shape:[[1,1],[1,1]]}), .12);
    assert.equal(common.getWeaponImageInset({shape:[[1,1,1,1]]}), common.getWeaponImageInset(staff));
    assert.equal(common.getWeaponImageInset({cells:[[0,0],[0,1],[1,1],[1,1]],synergyCells:[[1,0]]}), common.getWeaponImageInset(banana));
});

test('全部武器在横竖屏和四种旋转下等比完整显示，不改变占格和配置', () => {
    for (const [id, definition] of Object.entries(definitions)) {
        const cells = cellsOf(definition), original = JSON.stringify(definition);
        for (const cellSize of [16, 48]) for (const rotation of [0,90,180,270]) {
            const weapon = Object.assign({}, definition, { cells, rotation });
            const art = battle.createArt(weapon, cellSize, 'preview');
            assert.equal(art.bounds.cells.length, cells.length, id);
            const frame = art.element.children[0], image = frame.children[0], crop = definition.imageCrop;
            const sx = parseFloat(image.style.width) / crop[4], sy = parseFloat(image.style.height) / crop[5];
            assert.ok(Math.abs(sx - sy) < 1e-9, id + '不可拉伸图片');
            const left = parseFloat(image.style.left) + crop[0] * sx, top = parseFloat(image.style.top) + crop[1] * sy;
            const w = parseFloat(frame.style.width), h = parseFloat(frame.style.height);
            assert.ok(left >= -1e-6 && top >= -1e-6 && left + crop[2] * sx <= w + 1e-6 && top + crop[3] * sy <= h + 1e-6, id + '完整裁剪区在图片框内');
            const angle = rotation * Math.PI / 180, x = parseFloat(frame.style.left), y = parseFloat(frame.style.top);
            for (const [cx,cy] of [[0,0],[w,0],[0,h],[w,h]]) {
                const px = x + cx * Math.cos(angle) - cy * Math.sin(angle), py = y + cx * Math.sin(angle) + cy * Math.cos(angle);
                assert.ok(px >= -1e-6 && py >= -1e-6 && px <= art.bounds.cols * cellSize + 1e-6 && py <= art.bounds.rows * cellSize + 1e-6, id + '旋转后不越出占格外框');
            }
        }
        assert.equal(JSON.stringify(definition), original);
    }
});

test('商店图鉴和合成预览使用同一留白，全部武器与战斗图片框一致', () => {
    const card = vm.createContext({uiCommon: common, PREVIEW_IMAGE_INSET: .12});
    vm.runInContext(extract(read('weaponCardRenderer.js'), 'layoutPreviewImage'), card);
    const craft = vm.createContext({uiCommon: common, PREVIEW_IMAGE_INSET: .12});
    const craftFn = read('backpackCraft.js').match(/const layoutCraftPreviewImage = function[^]*?\n\t\t};/)[0];
    vm.runInContext(craftFn + '\nthis.layout = layoutCraftPreviewImage;', craft);
    for (const [id,weapon] of Object.entries(definitions)) {
        const cells = cellsOf(weapon), col = Math.min(...cells.map(c => c[0])), row = Math.min(...cells.map(c => c[1]));
        const cols = Math.max(...cells.map(c => c[0])) - col + 1, rows = Math.max(...cells.map(c => c[1])) - row + 1;
        const geometry = { weapon, sourceBounds: {col,row,cols,rows}, minCol:col-1,minRow:row-1,cols:cols+2,rows:rows+2 };
        const cf=element(),ci=element(),ff=element(),fi=element();
        card.layoutPreviewImage(cf,ci,geometry); craft.layout(ff,fi,geometry);
        assert.deepEqual(cf.style,ff.style,id); assert.deepEqual(ci.style,fi.style,id);
        assert.equal(Number(cf.dataset.insetCells),common.getWeaponImageInset(weapon),id);
        const battleFrame = battle.createArt(Object.assign({},weapon,{cells:cellsOf(weapon)}),48,'preview').element.children[0];
        assert.ok(Math.abs(parseFloat(cf.style.width) / 100 * geometry.cols * 48 - parseFloat(battleFrame.style.width)) < 1e-6,id);
    }
});

test('全部武器的蓄力及飞行图片在横竖屏等比显示，细长杖比香蕉保留更多长度', () => {
    const measure = (definition, size) => {
        const cells = cellsOf(definition), bounds = battle.getBounds(battle.normalizeCells(cells));
        const weapon = Object.assign({}, definition, {baseCells: cells, cells, rotation: 0});
        const factor = battle.getWeaponFlightScale(weapon);
        const cellSize = size * factor / Math.max(bounds.cols, bounds.rows);
        const art = battle.createArt(weapon, cellSize, 'bb-weapon-flight');
        const image = art.element.children[0].children[0], crop = definition.imageCrop;
        const sx = parseFloat(image.style.width) / crop[4], sy = parseFloat(image.style.height) / crop[5];
        return {weapon, factor, sx, sy, width: crop[2] * sx, height: crop[3] * sy};
    };
    for (const [id, weapon] of Object.entries(definitions)) for (const size of [30, 52, 84]) {
        const m = measure(weapon, size);
        assert.ok(m.factor >= .6 && m.factor <= 1.12, id + '动画大小有上下限');
        assert.ok(Math.abs(m.sx - m.sy) < 1e-9, id + '动画图像不拉伸');
        assert.ok(Math.max(m.width, m.height) <= size * 1.12 && Math.min(m.width, m.height) > 0, id);
        assert.equal(battle.getWeaponFlightScale(Object.assign({},m.weapon,{rotation:90})), m.factor, id + '背包旋转不影响出手大小');
    }
    const banana = measure(definitions.I597, 84), staff = measure(definitions.I532, 84);
    assert.ok(banana.height > 50 && banana.height < 56, '宽体香蕉控制在约54px');
    assert.ok(staff.height > 78 && staff.height < 86, '四格御守杖保留约82px长度');
    assert.ok(staff.height > banana.height * 1.4, '不能把细长武器缩得比食物更短');
});

test('四阶突破召唤石补齐本体外观，属性与技能各自保留', () => {
    for (const id of ['I614','I615','I616','I617']) {
        assert.equal(definitions[id].image,definitions.I571.image);
        assert.deepEqual(JSON.parse(JSON.stringify(definitions[id].shape)),JSON.parse(JSON.stringify(definitions.I571.shape)));
        assert.ok(definitions[id].combatRules.length);
    }
});
