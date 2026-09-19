/** 战斗立绘的短促出手、原生命中特效与音效；只消费快照，不参与战斗结算。 */
var createBackpackBattleFeedback_245cd186_8d73_4ad6_8e23_114d7eaf0d89 = function (core, canvas, onPose) {
	"use strict";
	var context = canvas.getContext("2d");
	var latest = null, seenAttack = null, seenHit = 0;
	var effect = null, frameRequest = null, lastTimestamp = null;
	var nextAllowedAt = 0, soundId = null, soundAudio = null;
	var reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)");

	var stopOwnSound = function () {
		// 不传空 id 给 stopSound，避免停止背景音乐以外的其他游戏音效。
		if (soundId != null && core.stopSound) core.stopSound(soundId);
		if (soundAudio && typeof soundAudio.pause === "function") soundAudio.pause();
		soundId = null;
		soundAudio = null;
	};
	var cancelFrame = function () {
		if (frameRequest != null) cancelAnimationFrame(frameRequest);
		frameRequest = null;
		lastTimestamp = null;
	};
	var clear = function () {
		cancelFrame();
		effect = null;
		context.clearRect(0, 0, canvas.width, canvas.height);
		canvas.hidden = true;
		onPose(-1, 0);
	};
	var drawFrame = function (index) {
		context.clearRect(0, 0, canvas.width, canvas.height);
		var animate = effect.animate;
		if (!animate || !animate.frames[index]) return;
		// 使用 loader 已解码的原始 .animate 图层，坐标独立于地图滚动位置。
		context.save();
		context.translate(canvas.width / 2, canvas.height * .46);
		context.scale(1.2, 1.2);
		animate.frames[index].forEach(function (layer) {
			var image = animate.images[layer.index];
			if (!image || !image.width || !image.height) return;
			var zoom = (animate.ratio || 1) * layer.zoom / 100;
			context.save();
			context.translate(layer.x, layer.y);
			context.rotate(-(layer.angle || 0) * Math.PI / 180);
			context.scale(layer.mirror ? -1 : 1, 1);
			context.globalAlpha = layer.opacity / 255;
			context.drawImage(image, -image.width * zoom / 2, -image.height * zoom / 2, image.width * zoom, image.height * zoom);
			context.restore();
		});
		context.restore();
	};
	var paint = function () {
		var reduce = reducedMotion && reducedMotion.matches;
		var elapsed = effect.elapsed;
		// 命中闪光和后坐在 30ms 内达到峰值，随后快速收回，避免缓慢漂移。
		var recoil = effect.hit && !reduce ? Math.max(0, 1 - elapsed / 95) : 0;
		onPose(reduce ? -1 : elapsed / 10, recoil);
		if (!effect.animate) return;
		var index = reduce ? Math.min(2, effect.animate.frames.length - 1)
			: Math.min(effect.animate.frames.length - 1, Math.floor(elapsed / effect.frameMs));
		if (index === effect.frame) return;
		effect.frame = index;
		drawFrame(index);
	};
	var runFrame = function (timestamp) {
		frameRequest = null;
		if (!effect || !latest || !latest.active) { clear(); return; }
		if (document.hidden || latest.fastForwarding) { clear(); stopOwnSound(); return; }
		if (latest.paused) { lastTimestamp = null; return; }
		if (lastTimestamp != null) effect.elapsed += Math.max(0, timestamp - lastTimestamp);
		lastTimestamp = timestamp;
		if (effect.elapsed >= effect.duration) { clear(); return; }
		paint();
		frameRequest = requestAnimationFrame(runFrame);
	};
	var playImpactSound = function (type, animate) {
		var se = animate && animate.se;
		var sound = typeof se === "string" ? se : se && se[1];
		var pitch = animate && animate.pitch && animate.pitch[1] || 100;
		var sounds = core.material && core.material.sounds || {};
		var mapped = sound && core.getMappedName ? core.getMappedName(sound) : sound;
		// thunder 原素材引用的雷声未随塔提供，复用现有法术音效。
		if (!sound || !sounds[mapped]) {
			sound = type === "sword" ? "Sword4.ogg" : type === "thunder" ? "zone.mp3" : "attack.mp3";
			mapped = core.getMappedName ? core.getMappedName(sound) : sound;
		}
		var audio = sounds[mapped];
		if (core.playSound) soundId = core.playSound(sound, pitch);
		soundAudio = soundId == null && audio && typeof audio.pause === "function" ? audio : null;
		return audio && Number.isFinite(audio.duration) ? audio.duration * 1000 / (pitch / 100) : 0;
	};
	var update = function (snapshot) {
		latest = snapshot;
		var attack = snapshot.enemy.attackSequence || 0, hit = snapshot.enemy.hitSequence || 0;
		var newAttack = seenAttack != null && attack > seenAttack;
		var newHit = hit > seenHit;
		// 每次都消费序号。被合并、暂停或结算期间的旧事件不会在稍后补播。
		seenAttack = attack;
		seenHit = hit;
		if (!snapshot.active || snapshot.fastForwarding || document.hidden) { clear(); stopOwnSound(); return; }
		if (snapshot.paused) { cancelFrame(); stopOwnSound(); return; }
		if (effect) {
			if (frameRequest == null) frameRequest = requestAnimationFrame(runFrame);
			return;
		}
		var now = performance.now();
		var soundPlaying = soundId != null && core.musicStatus && core.musicStatus.playingSounds
			&& core.musicStatus.playingSounds[soundId];
		if (!newAttack || now < nextAllowedAt || soundPlaying) return;
		var type = snapshot.enemy.battleAttackEffect;
		if (type !== "sword" && type !== "thunder") type = "hand";
		var animate = newHit && core.material && core.material.animates && core.material.animates[type];
		var frameMs = type === "sword" ? 35 : type === "thunder" ? 20 : 30;
		var duration = animate && animate.frames.length ? Math.max(160, animate.frames.length * frameMs) : 160;
		effect = { animate: animate || null, frame: -1, frameMs: frameMs, duration: duration, elapsed: 0, hit: newHit };
		canvas.hidden = !animate;
		var soundDuration = newHit ? playImpactSound(type, animate) : 0;
		// 按真实时间节流，10×战速和同 Tick 的奥义连击也只播放一份；不排队。
		nextAllowedAt = now + Math.max(360, duration + 80, soundDuration);
		paint();
		lastTimestamp = now;
		frameRequest = requestAnimationFrame(runFrame);
	};
	return {
		update: update,
		destroy: function () { clear(); stopOwnSound(); latest = null; seenAttack = null; seenHit = 0; }
	};
};

/** 兵装蓄力读取真实冷却，出手后按真实时间飞行；不参与伤害与随机数结算。 */
var createBackpackWeaponFlightFeedback = function (layer, getLayout, createSprite, createDamageNumber) {
	"use strict";
	var latest = null, frameRequest = null, cursor = 0;
	var seen = Object.create(null), effects = [];
	var damageNumbers = [];
	var reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)");
	var PREPARE_TICKS = 50, FLIGHT_MS = 650, MAX_PREPARING = 10, MAX_FLYING = 10;
	var DAMAGE_MS = 1100, MAX_DAMAGE_NUMBERS = 10;

	var chooseOffset = function () {
		var preparing = effects.filter(function (effect) { return effect.phase === "preparing"; });
		var best = null, bestDistance = -1;
		// 在扩大后的范围内随机挑选较空的位置，避免十件武器碰巧挤到同一小块。
		for (var attempt = 0; attempt < 8; attempt++) {
			var candidate = { x: Math.random() * 2 - 1, y: Math.random() * 2 - 1 };
			var distance = preparing.reduce(function (nearest, effect) {
				return Math.min(nearest, Math.pow(candidate.x - effect.offsetX, 2) + Math.pow(candidate.y - effect.offsetY, 2));
			}, Infinity);
			if (distance > bestDistance) { best = candidate; bestDistance = distance; }
			if (!preparing.length) break;
		}
		return best;
	};

	var getPreparation = function (weapon) {
		var interval = Number(weapon.effectiveIntervalTicks);
		if (!(interval > 0)) return null;
		var remaining = interval * (1 - Math.max(0, Math.min(1, Number(weapon.cooldownProgress) || 0)));
		if (remaining > PREPARE_TICKS + .001) return null;
		// 极短间隔武器从本轮冷却开始凝实，0 间隔的被动武器不生成准备动画。
		return Math.max(0, Math.min(1, 1 - remaining / Math.min(PREPARE_TICKS, interval)));
	};
	var countPhase = function (phase) {
		return effects.filter(function (effect) { return effect.phase === phase; }).length;
	};
	var getBreath = function (effect) {
		if (reducedMotion && reducedMotion.matches) return 0;
		return Math.sin(effect.elapsed / 1000 * Math.PI * 2 + effect.breathPhase) * .045;
	};
	var getOrigin = function (effect, layout, breath) {
		var spread = layout.spread || { x: layout.size * .6, y: layout.size * .5 };
		var margin = layout.size * .65;
		var minX = layout.start.x - spread.x, maxX = layout.start.x + spread.x;
		var minY = layout.start.y - spread.y, maxY = layout.start.y + spread.y;
		if (layout.spawnBounds) {
			minX = Math.max(minX, layout.spawnBounds.minX);
			maxY = Math.min(maxY, layout.spawnBounds.maxY);
		}
		if (layout.width) { minX = Math.max(margin, minX); maxX = Math.max(minX, Math.min(layout.width - margin, maxX)); }
		if (layout.height) { minY = Math.max(margin, minY); maxY = Math.max(minY, Math.min(layout.height - margin, maxY)); }
		// 先裁定可用范围再映射随机数，不把越界随机点挤在同一条边缘上。
		var x = minX + (effect.offsetX + 1) / 2 * (maxX - minX);
		var y = minY + (effect.offsetY + 1) / 2 * (maxY - minY) + breath * layout.size;
		return { x: x, y: y };
	};

	var cancelFrame = function () {
		if (frameRequest != null) cancelAnimationFrame(frameRequest);
		frameRequest = null;
		effects.forEach(function (effect) { effect.timestamp = null; });
		damageNumbers.forEach(function (number) { number.timestamp = null; });
	};
	var clear = function () {
		cancelFrame();
		effects.forEach(function (effect) { effect.element.remove(); });
		damageNumbers.forEach(function (number) { number.element.remove(); });
		effects = [];
		damageNumbers = [];
	};
	var paint = function () {
		if (!effects.length && !damageNumbers.length) return;
		var layout = getLayout();
		if (!layout) return;
		effects.forEach(function (effect) {
			var reduce = reducedMotion && reducedMotion.matches;
			var preparing = effect.phase === "preparing";
			var origin = getOrigin(effect, layout, preparing ? getBreath(effect) : effect.launchBreath);
			var progress = preparing ? 0 : Math.min(1, effect.elapsed / FLIGHT_MS);
			var travel = Math.pow(progress, 1.15);
			var arcHeight = Math.max(0, Math.min(layout.size * .6, Math.min(origin.y, layout.end.y) - layout.size * .65));
			var arc = Math.sin(progress * Math.PI) * arcHeight;
			var x = reduce && !preparing ? layout.end.x : origin.x + (layout.end.x - origin.x) * travel;
			var y = reduce && !preparing ? layout.end.y : origin.y + (layout.end.y - origin.y) * travel - arc;
			var angle = reduce ? 0 : effect.angle + progress * 360;
			var scale = layout.size / effect.size;
			effect.element.style.opacity = String(preparing ? effect.preparation : 1);
			effect.element.style.transform = "translate3d(" + x.toFixed(2) + "px," + y.toFixed(2)
				+ "px,0) translate(-50%,-50%) rotate(" + angle.toFixed(2) + "deg) scale(" + scale.toFixed(3) + ")";
		});
		damageNumbers.forEach(function (number) {
			var progress = Math.min(1, number.elapsed / DAMAGE_MS);
			var reduce = reducedMotion && reducedMotion.matches;
			var stepY = layout.size * .4;
			var baseY = layout.end.y - stepY * 1.5;
			if (layout.height) baseY = Math.max(layout.size * .2, Math.min(layout.height - layout.size * .2 - stepY * 3, baseY));
			var x = layout.end.x + (number.slot % 3 - 1) * layout.size * .75;
			var y = baseY + Math.floor(number.slot / 3) * stepY;
			if (!reduce) y -= progress * layout.size * .65;
			number.element.style.opacity = String(1 - Math.max(0, (progress - .35) / .65));
			number.element.style.transform = "translate3d(" + x.toFixed(2) + "px," + y.toFixed(2) + "px,0) translate(-50%,-50%)";
		});
	};
	var showDamage = function (effect, timestamp) {
		if (effect.damage == null || !createDamageNumber) return;
		if (damageNumbers.length >= MAX_DAMAGE_NUMBERS) damageNumbers.shift().element.remove();
		var slot = [4, 3, 5, 7, 6, 8, 1, 0, 2, 10].find(function (candidate) {
			return !damageNumbers.some(function (number) { return number.slot === candidate; });
		});
		var element = createDamageNumber(effect.damage, effect.id);
		layer.appendChild(element);
		damageNumbers.push({ element: element, elapsed: 0, timestamp: timestamp, slot: slot });
	};
	var runFrame = function (timestamp) {
		frameRequest = null;
		if (!latest || !latest.active || latest.fastForwarding || document.hidden) { clear(); return; }
		if (latest.paused) { cancelFrame(); return; }
		damageNumbers = damageNumbers.filter(function (number) {
			if (number.timestamp != null) number.elapsed += Math.max(0, timestamp - number.timestamp);
			number.timestamp = timestamp;
			if (number.elapsed < DAMAGE_MS) return true;
			number.element.remove();
			return false;
		});
		effects = effects.filter(function (effect) {
			if (effect.timestamp != null) effect.elapsed += Math.max(0, timestamp - effect.timestamp);
			effect.timestamp = timestamp;
			if (effect.phase === "preparing" || effect.elapsed < FLIGHT_MS) return true;
			showDamage(effect, timestamp);
			effect.element.remove();
			return false;
		});
		if (effects.length || damageNumbers.length) {
			paint();
			frameRequest = requestAnimationFrame(runFrame);
		}
	};
	var launch = function (effect, now, weapon) {
		effect.launchBreath = getBreath(effect);
		effect.phase = effect.element.dataset.phase = "flying";
		effect.elapsed = 0;
		effect.timestamp = now;
		var result = weapon.lastAttackResult;
		// 锁定本次出手的数值；飞行期间发生的新攻击不能改写在途武器的伤害。
		effect.damage = result && result.sequence === weapon.attackSequence && result.hit
			&& Number.isFinite(result.damage) ? Math.max(0, result.damage) : null;
	};
	var update = function (snapshot) {
		latest = snapshot;
		var weapons = snapshot.weapons || [], changed = Object.create(null), current = Object.create(null), byId = Object.create(null);
		weapons.forEach(function (weapon) {
			var id = weapon.instanceId, sequence = weapon.attackSequence || 0;
			changed[id] = seen[id] != null && sequence > seen[id];
			current[id] = sequence;
			byId[id] = weapon;
		});
		// 含被节流、暂停和立即结算跳过的出手，全部消费，不排队补播。
		seen = current;
		if (!snapshot.active || snapshot.fastForwarding || document.hidden) { clear(); return; }
		if (snapshot.paused) { cancelFrame(); return; }
		var now = performance.now(), layout = null;
		var flying = countPhase("flying");
		effects = effects.filter(function (effect) {
			var weapon = byId[effect.id];
			if (weapon && effect.phase === "flying") return true; // 连击也不重启正在飞行的同一件武器。
			if (weapon && changed[effect.id] && flying < MAX_FLYING) {
				launch(effect, now, weapon);
				flying++;
				return true;
			}
			var preparation = weapon && !changed[effect.id] ? getPreparation(weapon) : null;
			if (preparation != null) { effect.preparation = preparation; return true; }
			effect.element.remove();
			return false;
		});
		var preparing = countPhase("preparing");
		var start = cursor % Math.max(1, weapons.length);
		for (var offset = 0; offset < weapons.length; offset++) {
			var index = (start + offset) % weapons.length, weapon = weapons[index], id = weapon.instanceId;
			if (!weapon.image || effects.some(function (effect) { return effect.id === id; })) continue;
			var preparation = getPreparation(weapon), isAttack = changed[id];
			if (isAttack ? flying >= MAX_FLYING : preparation == null || preparing >= MAX_PREPARING) continue;
			layout = layout || getLayout();
			if (!layout) break;
			var element = createSprite(weapon, layout.size);
			layer.appendChild(element);
			var offsetPosition = chooseOffset();
			// 仅使用表现层随机位置，不调用 core.randBattle，也不在每帧重新随机。
			var effect = { id: id, element: element, elapsed: 0, timestamp: now, size: layout.size,
				offsetX: offsetPosition.x, offsetY: offsetPosition.y,
				angle: Math.random() * 28 - 14, breathPhase: Math.random() * Math.PI * 2,
				phase: "preparing", preparation: preparation };
			if (isAttack) { launch(effect, now, weapon); flying++; }
			else { element.dataset.phase = "preparing"; preparing++; }
			effects.push(effect);
			cursor = index + 1;
		}
		if (effects.length || damageNumbers.length) {
			paint();
			if (frameRequest == null) frameRequest = requestAnimationFrame(runFrame);
		}
	};
	return {
		update: update,
		refresh: paint,
		destroy: function () { clear(); latest = null; seen = Object.create(null); }
	};
};
