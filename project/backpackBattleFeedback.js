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
