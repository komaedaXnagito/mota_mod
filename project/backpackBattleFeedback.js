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

var getBackpackWeaponAttackKind = function (weapon) {
	var types = [].concat(weapon.weaponTypes || [], (weapon.attributes || {}).weaponTypes || []);
	// 斧 / 吉他等复合类型优先演奏；长枪不属于铳。
	if (types.indexOf("吉他") >= 0 || types.indexOf("乐器") >= 0) return "music";
	if (types.indexOf("铳") >= 0) return "gun";
	if (types.indexOf("弓") >= 0) return "bow";
	if (types.indexOf("剑") >= 0) return "sword";
	return "flight";
};

/** 兵装蓄力读取真实冷却，出手后按真实时间演出；不参与伤害与随机数结算。 */
var createBackpackWeaponFlightFeedback = function (layer, getLayout, createSprite, createDamageNumber, createProjectiles) {
	"use strict";
	var latest = null, frameRequest = null, cursor = 0;
	var seen = Object.create(null), effects = [];
	var damageNumbers = [];
	var reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)");
	var PREPARE_TICKS = 50, FLIGHT_MS = 650, MAX_PREPARING = 10, MAX_FLYING = 10;
	var DAMAGE_MS = 1100, MAX_DAMAGE_NUMBERS = 24;
	var DAMAGE_SLOTS = [9, 10, 5, 6, 13, 14, 8, 11, 4, 7, 12, 15, 1, 2, 17, 18, 0, 3, 16, 19, 21, 22, 20, 23];

	var chooseAnchor = function (layout) {
		var free = layout.anchors.map(function (_, index) { return index; }).filter(function (index) {
			return !effects.some(function (effect) { return effect.phase === "preparing" && effect.anchorIndex === index; });
		});
		// 准备阶段独占点位，飞出后释放；未经过准备的即时攻击也只从这十处出现。
		if (!free.length) free = layout.anchors.map(function (_, index) { return index; });
		return free[Math.floor(Math.random() * free.length)];
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
		var anchor = layout.anchors[effect.anchorIndex];
		return { x: anchor.x + effect.offsetX * layout.jitter.x,
			y: anchor.y + effect.offsetY * layout.jitter.y + breath * layout.size };
	};

	var cancelFrame = function () {
		if (frameRequest != null) cancelAnimationFrame(frameRequest);
		frameRequest = null;
		effects.forEach(function (effect) { effect.timestamp = null; });
		damageNumbers.forEach(function (number) { number.timestamp = null; });
	};
	var removeEffect = function (effect) {
		effect.element.remove();
		effect.projectiles.forEach(function (element) { element.remove(); });
	};
	var clear = function () {
		cancelFrame();
		effects.forEach(removeEffect);
		damageNumbers.forEach(function (number) { number.element.remove(); });
		effects = [];
		damageNumbers = [];
	};
	var place = function (element, x, y, angle, scale, opacity, mirror) {
		element.style.opacity = String(Math.max(0, Math.min(1, opacity)));
		element.style.transform = "translate3d(" + x.toFixed(2) + "px," + y.toFixed(2)
			+ "px,0) translate(-50%,-50%) rotate(" + angle.toFixed(2) + "deg) scale("
			+ (mirror ? (-scale).toFixed(3) + "," : "") + scale.toFixed(3) + ")";
	};
	var paintRanged = function (effect, layout, origin, preparing, reduce) {
		var size = layout.weaponSize || layout.size, scale = size / effect.size;
		var time = preparing ? 0 : effect.elapsed;
		var dx = layout.end.x - origin.x, dy = layout.end.y - origin.y;
		var distance = Math.max(1, Math.hypot(dx, dy)), ux = dx / distance, uy = dy / distance;
		var aim = Math.atan2(dy, dx), degrees = 180 / Math.PI;
		var charge = preparing ? effect.preparation : effect.launchCharge;
		var opacity = preparing ? charge : 1 - Math.max(0, (time - 180) / 180);
		// 快速后坐、缓慢复位；与飞行物使用同一个可暂停的真实时间时钟。
		var kick = reduce || preparing ? 0 : (time < 40 ? time / 40 : Math.max(0, 1 - (time - 40) / 160));
		var recoil = kick * size * (effect.kind === "gun" ? .13 : .08);
		var x = origin.x - ux * recoil, y = origin.y - uy * recoil;
		if (effect.kind === "gun") {
			var muzzleX = Number(effect.element.dataset.muzzleX || 0) * scale;
			var muzzleY = Number(effect.element.dataset.muzzleY || -effect.size * .4) * scale;
			// 枪管素材朝上；补偿偏心枪口，使枪管轴线和激光都穿过怪物中心。
			var angle = aim + Math.PI / 2 - Math.asin(Math.max(-1, Math.min(1, muzzleX / (distance + recoil))));
			place(effect.element, x, y, angle * degrees, scale, opacity);
			var muzzle = { x: x + Math.cos(angle) * muzzleX - Math.sin(angle) * muzzleY,
				y: y + Math.sin(angle) * muzzleX + Math.cos(angle) * muzzleY };
			var beam = effect.projectiles[0];
			if (beam) {
				var beamX = layout.end.x - muzzle.x, beamY = layout.end.y - muzzle.y;
				beam.style.width = Math.hypot(beamX, beamY).toFixed(2) + "px";
				beam.style.opacity = String(preparing ? 0 : Math.max(0, 1 - Math.max(0, (time - 140) / 100)));
				beam.style.transform = "translate3d(" + muzzle.x.toFixed(2) + "px," + muzzle.y.toFixed(2)
					+ "px,0) translateY(-50%) rotate(" + (Math.atan2(beamY, beamX) * degrees).toFixed(2)
					+ "deg) scaleX(" + (reduce ? 1 : Math.min(1, time / 60)).toFixed(3) + ")";
			}
		} else if (effect.kind === "bow") {
			// 弓身原图向左开弓，水平翻转后朝向目标；箭是独立图层，弓不飞出。
			place(effect.element, x, y, aim * degrees, scale, opacity, true);
			var arrow = effect.projectiles[0];
			if (arrow) {
				var length = size * .86, start = size * (.08 - charge * .18);
				var travel = preparing ? 0 : reduce ? 1 : Math.pow(Math.min(1, time / FLIGHT_MS), 1.15);
				var startX = origin.x + ux * start, startY = origin.y + uy * start;
				arrow.style.width = length.toFixed(2) + "px";
				arrow.style.height = (size * .16).toFixed(2) + "px";
				place(arrow, startX + (layout.end.x - ux * length / 2 - startX) * travel,
					startY + (layout.end.y - uy * length / 2 - startY) * travel, aim * degrees, 1, preparing ? charge : 1);
			}
		} else {
			var playing = preparing || reduce ? 0 : Math.sin(time / 42) * 7 * Math.max(0, 1 - time / 360);
			place(effect.element, origin.x, origin.y, effect.angle + playing, scale, opacity);
			effect.projectiles.forEach(function (note, index) {
				var age = time - index * 60, progress = Math.max(0, Math.min(1, age / 470));
				var travel = reduce ? 1 : progress;
				var spread = (index - 1.5) * size * .42;
				var curve = reduce ? 0 : Math.sin(progress * Math.PI) * spread;
				var noteSize = Math.max(9, size * (.24 + index % 2 * .05));
				note.style.width = noteSize.toFixed(2) + "px";
				note.style.height = noteSize.toFixed(2) + "px";
				place(note, origin.x + dx * travel - uy * curve, origin.y + dy * travel + ux * curve,
					reduce ? 0 : Math.sin(progress * Math.PI * 2 + index) * 16, 1,
					preparing || age < 0 || progress >= 1 ? 0 : Math.min(1, age / 35));
			});
		}
	};
	var paintSword = function (effect, layout, origin, preparing, reduce) {
		var size = layout.weaponSize || layout.size;
		var target = layout.end;
		if (!preparing) {
			// 出手锁定两端，避免怪物呼吸 / 冲刺或勇士后仰把直线带弯；布局变化时重新对齐。
			var path = effect.swordPath;
			if (!path || path.width !== layout.width || path.height !== layout.height || path.size !== size) {
				path = effect.swordPath = { origin: origin, end: { x: target.x, y: target.y },
					width: layout.width, height: layout.height, size: size };
			}
			origin = path.origin;
			target = path.end;
		}
		var dx = target.x - origin.x, dy = target.y - origin.y;
		var travel = preparing ? 0 : reduce ? 1 : Math.pow(Math.min(1, effect.elapsed / FLIGHT_MS), 1.15);
		// 剑尖原图朝上；准备期间随浮动校正朝向，飞出后保持同一朝向、不再自转。
		var angle = Math.atan2(dy, dx) * 180 / Math.PI + 90;
		place(effect.element, origin.x + dx * travel, origin.y + dy * travel, angle,
			size / effect.size, preparing ? effect.preparation : 1);
	};
	var paint = function () {
		if (!effects.length && !damageNumbers.length) return;
		var layout = getLayout();
		if (!layout) return;
		effects.forEach(function (effect) {
			var reduce = reducedMotion && reducedMotion.matches;
			var preparing = effect.phase === "preparing";
			var origin = getOrigin(effect, layout, preparing ? getBreath(effect) : effect.launchBreath);
			if (effect.kind === "sword") { paintSword(effect, layout, origin, preparing, reduce); return; }
			if (effect.kind !== "flight") { paintRanged(effect, layout, origin, preparing, reduce); return; }
			var progress = preparing ? 0 : Math.min(1, effect.elapsed / FLIGHT_MS);
			var travel = Math.pow(progress, 1.15);
			var arcHeight = Math.max(0, Math.min(layout.size * .6, Math.min(origin.y, layout.end.y) - layout.size * .65));
			var arc = Math.sin(progress * Math.PI) * arcHeight;
			var x = reduce && !preparing ? layout.end.x : origin.x + (layout.end.x - origin.x) * travel;
			var y = reduce && !preparing ? layout.end.y : origin.y + (layout.end.y - origin.y) * travel - arc;
			var angle = reduce ? 0 : effect.angle + progress * 360;
			var scale = (layout.weaponSize || layout.size) / effect.size;
			effect.element.style.opacity = String(preparing ? effect.preparation : 1);
			effect.element.style.transform = "translate3d(" + x.toFixed(2) + "px," + y.toFixed(2)
				+ "px,0) translate(-50%,-50%) rotate(" + angle.toFixed(2) + "deg) scale(" + scale.toFixed(3) + ")";
		});
		damageNumbers.forEach(function (number) {
			var progress = Math.min(1, number.elapsed / DAMAGE_MS);
			var reduce = reducedMotion && reducedMotion.matches;
			var stepY = layout.size * .34;
			if (layout.height) stepY = Math.min(stepY, Math.max(0, layout.height - layout.size * 1.05) / 5);
			var baseY = layout.end.y - stepY * 2.5;
			if (layout.height) baseY = Math.max(layout.size * .85, Math.min(layout.height - layout.size * .2 - stepY * 5, baseY));
			var x = layout.end.x + (number.slot % 4 - 1.5) * layout.size * .58;
			var y = baseY + Math.floor(number.slot / 4) * stepY;
			if (!reduce) y -= progress * layout.size * .65;
			number.element.style.opacity = String(1 - Math.max(0, (progress - .35) / .65));
			var densityScale = Math.max(.8, 1 - Math.max(0, damageNumbers.length - 10) * .015);
			number.element.style.transform = "translate3d(" + x.toFixed(2) + "px," + y.toFixed(2)
				+ "px,0) translate(-50%,-50%) scale(" + densityScale.toFixed(3) + ")";
		});
	};
	var showDamage = function (effect, timestamp) {
		if (effect.damage == null || !createDamageNumber) return;
		if (damageNumbers.length >= MAX_DAMAGE_NUMBERS) damageNumbers.shift().element.remove();
		var slot = DAMAGE_SLOTS.find(function (candidate) {
			return !damageNumbers.some(function (number) { return number.slot === candidate; });
		});
		var element = createDamageNumber(effect.damage, effect.id);
		layer.appendChild(element);
		damageNumbers.push({ element: element, elapsed: 0, timestamp: timestamp, slot: slot });
	};
	var getAttackDamage = function (weapon) {
		var result = weapon.lastAttackResult;
		return result && result.sequence === weapon.attackSequence && result.hit
			&& Number.isFinite(result.damage) ? Math.max(0, result.damage) : null;
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
			if (effect.phase === "preparing") return true;
			if (!effect.damageShown && effect.elapsed >= (effect.kind === "gun" ? 60 : FLIGHT_MS)) {
				showDamage(effect, timestamp);
				effect.damageShown = true;
			}
			if (effect.elapsed < (effect.kind === "gun" ? 360 : FLIGHT_MS)) return true;
			removeEffect(effect);
			return false;
		});
		if (effects.length || damageNumbers.length) {
			paint();
			frameRequest = requestAnimationFrame(runFrame);
		}
	};
	var launch = function (effect, now, weapon) {
		effect.launchBreath = getBreath(effect);
		effect.launchCharge = effect.preparation == null ? 1 : effect.preparation;
		effect.phase = effect.element.dataset.phase = "flying";
		effect.elapsed = 0;
		effect.timestamp = now;
		// 锁定本次出手的数值；飞行期间发生的新攻击不能改写在途武器的伤害。
		effect.attackSequence = weapon.attackSequence;
		effect.damage = getAttackDamage(weapon);
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
			removeEffect(effect);
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
			var weaponSize = layout.weaponSize || layout.size;
			var kind = getBackpackWeaponAttackKind(weapon);
			var element = createSprite(weapon, weaponSize, kind);
			layer.appendChild(element);
			var projectiles = ["gun", "bow", "music"].indexOf(kind) >= 0 && createProjectiles ? createProjectiles(kind, weapon) : [];
			projectiles.forEach(function (projectile) { layer.appendChild(projectile); });
			var anchorIndex = chooseAnchor(layout);
			element.dataset.anchor = String(anchorIndex);
			element.dataset.attackKind = kind;
			// 仅使用表现层随机位置，不调用 core.randBattle，也不在每帧重新随机。
			var effect = { id: id, element: element, kind: kind, projectiles: projectiles, elapsed: 0, timestamp: now, size: weaponSize,
				anchorIndex: anchorIndex, offsetX: Math.random() * 2 - 1, offsetY: Math.random() * 2 - 1,
				angle: Math.random() * 28 - 14, breathPhase: Math.random() * Math.PI * 2,
				phase: "preparing", preparation: preparation };
			if (isAttack) { launch(effect, now, weapon); flying++; }
			else { element.dataset.phase = "preparing"; preparing++; }
			effects.push(effect);
			cursor = index + 1;
		}
		weapons.forEach(function (weapon) {
			if (!changed[weapon.instanceId]) return;
			// 有对应演出时仍在弹道命中时跳字；连击或超过动画上限时独立显示，不能一起吞掉。
			var hasFlight = effects.some(function (effect) {
				return effect.id === weapon.instanceId && effect.phase === "flying" && effect.attackSequence === weapon.attackSequence;
			});
			if (!hasFlight) showDamage({ id: weapon.instanceId, damage: getAttackDamage(weapon) }, now);
		});
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
