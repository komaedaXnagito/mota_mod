
/*
loader.js：负责对资源的加载

 */
"use strict";

function loader () {
    this._init();
}

loader.prototype._init = function () {

}

////// 设置加载进度条进度 //////
loader.prototype._setStartProgressVal = function (val) {
    core.dom.startTopProgress.style.width = val + '%';
}

////// 设置加载进度条提示文字 //////
loader.prototype._setStartLoadTipText = function (text) {
    core.dom.startTopLoadTips.innerText = text;
}

loader.prototype._load = function (callback) {
    if (main.useCompress) {
        this._load_async(callback);
    } else {
        this._load_sync(callback);
    }
}

loader.prototype._load_sync = function (callback) {
    this._loadAnimates_sync();
    this._loadMusic_sync();
    core.loader._loadMaterials_sync(function () {
        core.loader._loadExtraImages_sync(function () {
            core.loader._loadAutotiles_sync(function () {
                core.loader._loadTilesets_sync(callback);
            })
        })
    });
}

// 大体积魔塔分块加载优化：兼容鹿间裕贵插件及平台 splitChunkMap 协议。
// 所有类别先注册，再开始请求；类别的解码和后处理结束后才通知启动完成。
loader.prototype._load_async = function (callback) {
    core.loader._setStartLoadTipText('正在加载资源文件...');
    var categories = ['animates', 'sounds', 'materials', 'images', 'autotiles', 'tilesets'];
    var methods = ['_loadAnimates_async', '_loadMusic_async', '_loadMaterials_async',
        '_loadExtraImages_async', '_loadAutotiles_async', '_loadTilesets_async'];
    var all = {}, remaining = categories.length, finished = false;
    categories.forEach(function (name) {
        all[name] = { loaded: 0, total: 0, finished: false };
    });
    categories.forEach(function (name, index) {
        core.loader[methods[index]](function (loaded, total) {
            all[name].loaded = loaded;
            all[name].total = total;
            var allLoaded = 0, allTotal = 0;
            categories.forEach(function (category) {
                allLoaded += all[category].loaded;
                allTotal += all[category].total;
            });
            if (allTotal > 0) {
                core.loader._setStartLoadTipText(allLoaded == allTotal ?
                    '正在处理资源文件... 请稍候...' : '正在加载资源文件... ' +
                    core.formatSize(allLoaded) + ' / ' + core.formatSize(allTotal) +
                    ' (' + (allLoaded / allTotal * 100).toFixed(2) + '%)');
                core.loader._setStartProgressVal(allLoaded / allTotal * 100);
            }
        }, function () {
            if (all[name].finished) return;
            all[name].finished = true;
            remaining--;
            if (remaining == 0 && !finished) {
                finished = true;
                core.loader._setStartProgressVal(100);
                if (callback) callback();
            }
        });
    });
}

// 平台未拆分该类别时仍使用原压缩包；空数组代表没有资源，无需请求。
loader.prototype._getResourceChunks = function (category) {
    var chunks = main.splitChunkMap && main.splitChunkMap[category];
    if (Array.isArray(chunks)) return chunks;
    return ['project/' + category + '/' + category + '.h5data'];
}

// 每个包独立下载、解包并处理，避免先合并整个大目录；聚合进度与完成回调。
loader.prototype._loadArchives = function (urls, convertToText, onprogress, process, onfinished) {
    if (typeof urls == 'string') urls = [urls];
    var remaining = urls.length;
    if (!remaining) {
        if (onfinished) onfinished();
        return;
    }
    var progress = urls.map(function () { return { loaded: 0, total: 0 }; });
    urls.forEach(function (url, index) {
        var received = false, finished = false;
        var done = function () {
            if (finished) return;
            finished = true;
            remaining--;
            if (remaining == 0 && onfinished) onfinished();
        };
        var fail = function (error) {
            if (received) return;
            received = true;
            console.error('无法加载资源包 ' + url, error);
            done();
        };
        try {
            core.unzip(url + (url.indexOf('?') < 0 ? '?' : '&') + 'v=' + main.version,
                function (data) {
                    if (received) return;
                    received = true;
                    try { process(data, done); }
                    catch (error) {
                        console.error('无法处理资源包 ' + url, error);
                        done();
                    }
                }, fail, convertToText, function (loaded, total) {
                    progress[index] = { loaded: loaded, total: total };
                    var allLoaded = 0, allTotal = 0;
                    progress.forEach(function (item) {
                        allLoaded += item.loaded;
                        allTotal += item.total;
                    });
                    if (onprogress) onprogress(allLoaded, allTotal);
                });
        } catch (error) { fail(error); }
    });
}

// ----- 加载资源文件 ------ //

loader.prototype._loadMaterials_sync = function (callback) {
    this._setStartLoadTipText("正在加载资源文件...");
    this.loadImages("materials", core.materials, core.material.images, function () {
        core.loader._loadMaterials_afterLoad();
        callback();
    });
}

loader.prototype._loadMaterials_async = function (onprogress, onfinished) {
    this.loadImagesFromZip(this._getResourceChunks('materials'), core.materials, core.material.images, onprogress, function () {
        core.loader._loadMaterials_afterLoad();
        onfinished();
    });
}

loader.prototype._loadMaterials_afterLoad = function () {
    if (!core.material.images['icons']) return;
    var images = core.splitImage(core.material.images['icons']);
    for (var key in core.statusBar.icons) {
        if (typeof core.statusBar.icons[key] == 'number') {
            core.statusBar.icons[key] = images[core.statusBar.icons[key]];
            if (core.statusBar.image[key] != null)
                core.statusBar.image[key].src = core.statusBar.icons[key].src;
        }
    }
}

// ------ 加载使用的图片 ------ //

loader.prototype._loadExtraImages_sync = function (callback) {
    core.material.images.images = {};
    this._setStartLoadTipText("正在加载图片文件...");
    core.loadImages("images", core.images, core.material.images.images, callback);
}

loader.prototype._loadExtraImages_async = function (onprogress, onfinished) {
    core.material.images.images = {};
    var images = core.images;

    // Check .gif
    var gifs = images.filter(function (name) {
        return name.toLowerCase().endsWith('.gif');
    });
    images = images.filter(function (name) {
        return !name.toLowerCase().endsWith('.gif');
    });

    this.loadImagesFromZip(this._getResourceChunks('images'), images, core.material.images.images, onprogress, onfinished);
    // gif没有被压缩在zip中，延迟加载...
    gifs.forEach(function (gif) {
        this.loadImage("images", gif, function (id, image) {
            if (image != null) {
                core.material.images.images[gif] = image;
            }
        });
    }, this);
}

// ------ 加载自动元件 ------ //

loader.prototype._loadAutotiles_sync = function (callback) {
    core.material.images.autotile = {};
    var keys = Object.keys(core.material.icons.autotile);
    var autotiles = {};

    this._setStartLoadTipText("正在加载自动元件...");
    this.loadImages("autotiles", keys, autotiles, function () {
        core.loader._loadAutotiles_afterLoad(keys, autotiles);
        callback();
    });
}

loader.prototype._loadAutotiles_async = function (onprogress, onfinished) {
    core.material.images.autotile = {};
    var keys = Object.keys(core.material.icons.autotile);
    var autotiles = {};

    this.loadImagesFromZip(this._getResourceChunks('autotiles'), keys, autotiles, onprogress, function () {
        core.loader._loadAutotiles_afterLoad(keys, autotiles, onfinished);
    });
}

loader.prototype._loadAutotiles_afterLoad = function (keys, autotiles, callback) {
    // autotile需要保证顺序
    keys.forEach(function (v) {
        if (autotiles[v]) core.material.images.autotile[v] = autotiles[v];
    });

    setTimeout(function () {
        core.maps._makeAutotileEdges();
        if (callback) callback();
    });

}

// ------ 加载额外素材 ------ //

loader.prototype._loadTilesets_sync = function (callback) {
    core.material.images.tilesets = {};
    this._setStartLoadTipText("正在加载额外素材...");
    this.loadImages("tilesets", core.tilesets, core.material.images.tilesets, function () {
        core.loader._loadTilesets_afterLoad();
        callback();
    });
}

loader.prototype._loadTilesets_async = function (onprogress, onfinished) {
    core.material.images.tilesets = {};
    this.loadImagesFromZip(this._getResourceChunks('tilesets'), core.tilesets, core.material.images.tilesets, onprogress, function () {
        core.loader._loadTilesets_afterLoad();
        onfinished();
    });
}

loader.prototype._loadTilesets_afterLoad = function () {
    // 检查宽高是32倍数，如果出错在控制台报错
    for (var imgName in core.material.images.tilesets) {
        var img = core.material.images.tilesets[imgName];
        if (img.width % 32 != 0 || img.height % 32 != 0) {
            console.warn("警告！" + imgName + "的宽或高不是32的倍数！");
        }
        if (img.width * img.height > 32 * 32 * 3000) {
            console.warn("警告！" + imgName + "上的图块素材个数大于3000！");
        }
    }
}

// ------ 实际加载一系列图片 ------ //

loader.prototype.loadImages = function (dir, names, toSave, callback) {
    if (!names || names.length == 0) {
        if (callback) callback();
        return;
    }
    var items = 0;
    for (var i = 0; i < names.length; i++) {
        this.loadImage(dir, names[i], function (id, image) {
            core.loader._setStartLoadTipText('正在加载图片 ' + id + "...");
            if (toSave[id] !== undefined) {
                if (image != null)
                    toSave[id] = image;
                return;
            }
            toSave[id] = image;
            items++;
            core.loader._setStartProgressVal(items * (100 / names.length));
            if (items == names.length) {
                if (callback) callback();
            }
        })
    }
}

loader.prototype.loadImage = function (dir, imgName, callback) {
    try {
        var name = imgName;
        if (name.substring(name.lastIndexOf('/') + 1).indexOf(".") < 0)
            name = name + ".png";
        var image = new Image();
        image.onload = function () {
            image.setAttribute('_width', image.width);
            image.setAttribute('_height', image.height);
            callback(imgName, image);
        }
        image.onerror = function () {
            callback(imgName, null);
        }
        image.src = 'project/' + dir + '/' + name + "?v=" + main.version;
        if (name.endsWith('.gif'))
            callback(imgName, null);
    }
    catch (e) {
        console.error(e);
        callback(imgName, null);
    }
}

// ------ 从zip中加载一系列图片 ------ //

loader.prototype.loadImagesFromZip = function (url, names, toSave, onprogress, onfinished) {
    if (!names || names.length == 0) {
        if (onfinished) onfinished();
        return;
    }
    var found = Object.create(null), loaded = Object.create(null), basenames = Object.create(null);
    var urls = typeof url == 'string' ? [url] : url;
    var directory = urls.length && /^project\/(images|materials|autotiles|tilesets)\//.exec(urls[0]);
    names.forEach(function (name) {
        var basename = name.substring(name.lastIndexOf('/') + 1);
        if (basename.indexOf('.') < 0) basename += '.png';
        if (!basenames[basename]) basenames[basename] = [];
        if (basenames[basename].indexOf(name) < 0) basenames[basename].push(name);
    });
    this._loadArchives(url, false, onprogress, function (data, done) {
        var pending = 1;
        var complete = function () { if (--pending == 0) done(); };
        names.forEach(function (name) {
            var imgName = name;
            if (imgName.substring(imgName.lastIndexOf('/') + 1).indexOf('.') < 0) imgName += '.png';
            if (found[name]) return;
            var archiveName = imgName;
            if (!Object.prototype.hasOwnProperty.call(data, archiveName)) {
                // 部分平台打包器只保存 basename；仅无同名冲突时兼容，绝不串图。
                var basename = imgName.substring(imgName.lastIndexOf('/') + 1);
                if (basenames[basename].length != 1 || !Object.prototype.hasOwnProperty.call(data, basename)) return;
                archiveName = basename;
            }
            found[name] = true;
            pending++;
            var img, objectUrl, settled = false;
            var finish = function (success) {
                if (settled) return;
                settled = true;
                if (objectUrl) URL.revokeObjectURL(objectUrl);
                if (success) {
                    img.setAttribute('_width', img.width);
                    img.setAttribute('_height', img.height);
                    toSave[name] = img;
                    loaded[name] = true;
                } else {
                    console.error('无法解码图片 ' + imgName);
                }
                complete();
            };
            try {
                img = new Image();
                objectUrl = URL.createObjectURL(data[archiveName]);
                img.onload = function () { finish(true); };
                img.onerror = function () { finish(false); };
                img.src = objectUrl;
            } catch (error) { finish(false); }
        });
        complete();
    }, function () {
        var pending = 1;
        var complete = function () { if (--pending == 0 && onfinished) onfinished(); };
        names.filter(function (name, index) { return names.indexOf(name) == index; }).forEach(function (name) {
            if (loaded[name]) return;
            console.error('资源包中缺少或损坏图片 ' + name);
            if (!directory) return;
            pending++;
            // 保留目录路径回退原文件；打包器保留原文件时可恢复，失败也必须结束等待。
            var finished = false;
            core.loader.loadImage(directory[1], name, function (id, image) {
                if (finished) return;
                finished = true;
                if (image) toSave[id] = image;
                else console.error('无法加载原始图片 ' + id);
                complete();
            });
        });
        complete();
    });
}

// ------ 加载动画文件 ------ //

loader.prototype._loadAnimates_sync = function () {
    this._setStartLoadTipText("正在加载动画文件...");

    if (main.supportBunch) {
        if (core.animates.length > 0) {
            core.http('GET', '__all_animates__?v=' + main.version + '&id=' + core.animates.join(','), null, function (content) {
                var u = content.split('@@@~~~###~~~@@@');
                for (var i = 0; i < core.animates.length; ++i) {
                    if (u[i] != '') {
                        core.material.animates[core.animates[i]] = core.loader._loadAnimate(u[i]);
                    } else {
                        console.error('无法找到动画文件' + core.animates[i] + '！');
                    }
                }
            }, "text/plain; charset=x-user-defined");
        }
        return;
    }

    core.animates.forEach(function (t) {
        core.http('GET', 'project/animates/' + t + ".animate?v=" + main.version, null, function (content) {
            core.material.animates[t] = core.loader._loadAnimate(content);
        }, function (e) {
            console.error(e);
            core.material.animates[t] = null;
        }, "text/plain; charset=x-user-defined")
    });
}

loader.prototype._loadAnimates_async = function (onprogress, onfinished) {
    this._loadArchives(this._getResourceChunks('animates'), true, onprogress, function (animates, done) {
        var pending = 1;
        var complete = function () { if (--pending == 0) done(); };
        for (var name in animates) {
            if (name.endsWith('.animate')) {
                var t = name.substring(0, name.length - 8);
                if (core.animates.indexOf(t) >= 0) {
                    pending++;
                    core.material.animates[t] = core.loader._loadAnimate(animates[name], complete);
                }
            }
        }
        complete();
    }, onfinished);
}

loader.prototype._loadAnimate = function (content, callback) {
    var pending = 1, finished = false;
    var complete = function () {
        if (--pending == 0 && !finished) {
            finished = true;
            if (callback) callback();
        }
    };
    try {
        content = JSON.parse(content);
        var data = {};
        data.ratio = content.ratio;
        data.se = content.se;
        data.pitch = content.pitch;
        data.images = [];
        content.bitmaps.forEach(function (t2) {
            if (!t2) {
                data.images.push(null);
            }
            else {
                pending++;
                var settled = false;
                var onsettled = function () {
                    if (settled) return;
                    settled = true;
                    complete();
                };
                try {
                    var image = new Image();
                    image.onload = onsettled;
                    image.onerror = function () {
                        console.error('无法解码动画图片');
                        onsettled();
                    };
                    image.src = t2;
                    data.images.push(image);
                } catch (e) {
                    console.error(e);
                    data.images.push(null);
                    onsettled();
                }
            }
        })
        data.frame = content.frame_max;
        data.frames = [];
        content.frames.forEach(function (t2) {
            var info = [];
            t2.forEach(function (t3) {
                info.push({
                    'index': t3[0],
                    'x': t3[1],
                    'y': t3[2],
                    'zoom': t3[3],
                    'opacity': t3[4],
                    'mirror': t3[5] || 0,
                    'angle': t3[6] || 0,
                })
            })
            data.frames.push(info);
        });
        complete();
        return data;
    }
    catch (e) {
        console.error(e);
        if (!finished) {
            finished = true;
            if (callback) callback();
        }
        return null;
    }
}

// ------ 加载音乐和音效 ------ //

loader.prototype._loadMusic_sync = function () {
    this._setStartLoadTipText("正在加载音效文件...");
    core.bgms.forEach(function (t) {
        core.loader.loadOneMusic(t);
    });
    core.sounds.forEach(function (t) {
        core.loader.loadOneSound(t);
    });
    // 直接开始播放
    core.playBgm(main.startBgm);
}

loader.prototype._loadMusic_async = function (onprogress, onfinished) {
    core.bgms.forEach(function (t) {
        core.loader.loadOneMusic(t);
    });
    this._loadArchives(this._getResourceChunks('sounds'), false, onprogress, function (data, done) {
        var pending = 1;
        var complete = function () { if (--pending == 0) done(); };
        for (var name in data) {
            if (core.sounds.indexOf(name) >= 0) {
                pending++;
                core.loader._loadOneSound_decodeData(name, data[name], complete);
            }
        }
        complete();
    }, onfinished);
    core.playBgm(main.startBgm);
}

loader.prototype.loadOneMusic = function (name) {
    var music = new Audio();
    music.preload = 'none';
    if (main.bgmRemote) music.src = main.bgmRemoteRoot + core.firstData.name + '/' + name;
    else music.src = 'project/bgms/' + name;
    music.loop = 'loop';
    core.material.bgms[name] = music;
}

loader.prototype.loadOneSound = function (name) {
    core.http('GET', 'project/sounds/' + name + "?v=" + main.version, null, function (data) {
        core.loader._loadOneSound_decodeData(name, data);
    }, function (e) {
        console.error(e);
        core.material.sounds[name] = null;
    }, null, 'arraybuffer');
}

loader.prototype._loadOneSound_decodeData = function (name, data, callback) {
    var finished = false;
    var done = function (buffer, error) {
        if (finished) return;
        finished = true;
        if (error) console.error(error);
        core.material.sounds[name] = buffer;
        if (callback) callback();
    };
    try {
        if (data instanceof Blob) {
            var blobReader = new zip.BlobReader(data);
            var fail = function (error) { done(null, error); };
            blobReader.init(function () {
                blobReader.readUint8Array(0, blobReader.size, function (uint8) {
                    core.loader._loadOneSound_decodeData(name, uint8.buffer, function () {
                        done(core.material.sounds[name]);
                    });
                }, fail);
            }, fail);
            return;
        }
        core.musicStatus.audioContext.decodeAudioData(data, function (buffer) {
            done(buffer);
        }, function (error) { done(null, error); });
    } catch (error) { done(null, error); }
}

loader.prototype.loadBgm = function (name) {
    name = core.getMappedName(name);
    if (!core.material.bgms[name]) return;
    // 如果没开启音乐，则不预加载
    if (!core.musicStatus.bgmStatus) return;
    // 是否已经预加载过
    var index = core.musicStatus.cachedBgms.indexOf(name);
    if (index >= 0) {
        core.musicStatus.cachedBgms.splice(index, 1);
    }
    else {
        // 预加载BGM
        this._preloadBgm(core.material.bgms[name]);
        // core.material.bgms[name].load();
        // 清理尾巴
        if (core.musicStatus.cachedBgms.length == core.musicStatus.cachedBgmCount) {
            this.freeBgm(core.musicStatus.cachedBgms.pop());
        }
    }
    // 移动到缓存最前方
    core.musicStatus.cachedBgms.unshift(name);
}

loader.prototype._preloadBgm = function (bgm) {
    bgm.volume = 0;
    bgm.play();
}

loader.prototype.freeBgm = function (name) {
    name = core.getMappedName(name);
    if (!core.material.bgms[name]) return;
    // 从cachedBgms中删除
    core.musicStatus.cachedBgms = core.musicStatus.cachedBgms.filter(function (t) {
        return t != name;
    });
    // 清掉缓存
    core.material.bgms[name].removeAttribute("src");
    core.material.bgms[name].load();
    core.material.bgms[name] = null;
    if (name == core.musicStatus.playingBgm) {
        core.musicStatus.playingBgm = null;
    }
    // 三秒后重新加载
    setTimeout(function () {
        core.loader.loadOneMusic(name);
    }, 3000);
}