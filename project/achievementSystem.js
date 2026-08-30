/**
 * 独立成就系统插件。
 *
 * 编辑成就时只需要修改本文件顶部的成就定义数组。每项必填字段：
 * - id：代码中使用的唯一标识；
 * - name：成就名称；
 * - unlock：解锁方式；
 * - description：成就描述；
 * - level：bronze / platinum / diamond（也可直接写青铜 / 白金 / 钻石）；
 * - hidden：是否为隐藏成就；
 * - icon：图标，可填写 emoji、单个字符或图片路径。
 * - largeIcon：可选高清图；仅在点击图标打开大图时加载，不加入游戏资源预加载。
 *
 * 事件脚本中解锁成就：
 * core.plugin.achievementSystem.unlock("secret_discovery");
 * 或：core.plugin.unlockAchievement("secret_discovery");
 */

var achievementDefinitions_f21a6f89_1840_47d9_9f6a_79d54a2f790e = [
	{
		id: "begin_journey",
		name: "冒险启程",
		unlock: "开始一场新的冒险",
		description: "从这里开始，写下属于你的登塔故事。",
		level: "bronze",
		hidden: false,
		icon: "project/images/achievements/begin-journey.png"
	},
	{
		id: "first_victory",
		name: "初战告捷",
		unlock: "首次击败怪物",
		description: "第一场胜利往往最值得铭记。",
		level: "bronze",
		hidden: false,
		icon: "project/images/achievements/first-victory.png"
	},
	{
		id: "reach_floor_10",
		name: "渐入佳境",
		unlock: "到达魔塔 10 层",
		description: "脚步已经越过塔底的阴影。",
		level: "platinum",
		hidden: false,
		icon: "project/images/achievements/reach-floor-10.png"
	},
	{
		id: "reach_floor_25",
		name: "半塔征途",
		unlock: "到达魔塔 25 层",
		description: "登塔过半，真正的挑战才刚刚开始。",
		level: "platinum",
		hidden: false,
		icon: "project/images/achievements/reach-floor-25.png"
	},
	{
		id: "reach_floor_50",
		name: "魔塔登顶",
		unlock: "到达魔塔 50 层",
		description: "你已站上高塔之巅，俯瞰来时的道路。",
		level: "diamond",
		hidden: false,
		icon: "project/images/achievements/reach-floor-50.png"
	},
	{
		id: "battle_100",
		name: "百战勇者",
		unlock: "累计击败 100 只怪物",
		description: "历经百战，锋芒依旧。",
		level: "diamond",
		hidden: false,
		icon: "project/images/achievements/battle-100.png"
	},
	{
		id: "curious_mind",
		name: "好奇之心",
		unlock: "在冒险途中打开成就预览",
		description: "真正的收藏家不会错过任何一页记录。",
		level: "bronze",
		hidden: true,
		icon: "project/images/achievements/curious-mind.png"
	},
	{
		id: "secret_discovery",
		name: "塔中的秘密",
		unlock: "发现一处隐藏事件",
		description: "墙壁不会说话，但它记得每一条秘密通道。",
		level: "platinum",
		hidden: true,
		icon: "project/images/achievements/secret-discovery.png"
	},
	{
		id: "weak_demon_king",
		name: "菜鸡魔王",
		unlock: "无伤或负伤击败真魔王",
		description: "弱哎，拜托你很弱哎",
		level: "platinum",
		hidden: false,
		icon: "project/images/achievements/weak-demon-king.png"
	},
	{
		id: "barely_started",
		name: "勉强开局",
		unlock: "首次到达2楼时仅剩<100血",
		description: "我去，这是什么牢塔吗？",
		level: "platinum",
		hidden: true,
		icon: "project/images/achievements/barely-started.png"
	},
	{
		id: "battle_rounds_100",
		name: "累死我了",
		unlock: "任意一次战斗回合数>=100",
		description: "呼哧呼哧，这塔……",
		level: "bronze",
		hidden: false,
		icon: "project/images/achievements/exhausted-100-rounds.png"
	},
	{
		id: "battle_healing",
		name: "疯狂加血",
		unlock: "任意一次战斗后生命大于战斗前生命",
		description: "原来这塔能回血",
		level: "bronze",
		hidden: false,
		icon: "project/images/achievements/battle-healing.png"
	},
	{
		id: "battle_rounds_300",
		name: "拼尽全力",
		unlock: "战斗回合数达到300",
		description: "尽力了……",
		level: "bronze",
		hidden: false,
		icon: "project/images/achievements/all-out-300-rounds.png"
	},
	{
		id: "junk_refresh_100",
		name: "什么烂货",
		unlock: "免费刷新100次",
		description: "这什么垃圾商店？",
		level: "bronze",
		hidden: false,
		icon: "project/images/achievements/junk-refresh.png"
	},
	{
		id: "boastful_knight_defeat",
		name: "实力差又爱吹牛",
		unlock: "在32楼与骑士队长的战斗中失败",
		description: "怎么有人比牢骑还菜啊？",
		level: "bronze",
		hidden: true,
		icon: "project/images/achievements/boastful-knight-defeat.png"
	},
	{
		id: "one_hp_demon_king",
		name: "险胜真君",
		unlock: "剩余1滴血的情况下击败真魔王",
		description: "看来是我比他稍微强了一点点",
		level: "diamond",
		hidden: true,
		icon: "project/images/achievements/one-hp-demon-king.png"
	}
];

var achievementSystemConfig_f7bc0a18_288b_4fb8_9ed8_e0323ea84b25 = {
	storageKey: "achievementProfileV1",
	eventId: "achievementPreview",
	toastDuration: 5200,
	// 成就解锁专用音效；同时注册在 project/data.js 的 sounds 与 nameMap 中。
	soundPath: "project/sounds/achivement.ogg",
	soundFile: "achivement.ogg",
	fallbackSound: "确定"
};

/** 安装独立成就系统。 */
var installAchievementSystem_d38bb038_c4fa_43be_927c_168680046baa = function (core, plugin) {
	"use strict";
	if (plugin.achievementSystem && plugin.achievementSystem.__installed) return plugin.achievementSystem;

	var CONFIG = achievementSystemConfig_f7bc0a18_288b_4fb8_9ed8_e0323ea84b25;
	var LEVELS = {
		bronze: { name: "青铜", color: "#c98b52", glow: "rgba(201,139,82,.35)" },
		platinum: { name: "白金", color: "#eee7d2", glow: "rgba(238,231,210,.34)" },
		diamond: { name: "钻石", color: "#70e1f5", glow: "rgba(112,225,245,.34)" }
	};
	var LEVEL_ALIASES = {
		bronze: "bronze", "青铜": "bronze",
		platinum: "platinum", "白金": "platinum",
		// 兼容旧成就定义；旧的白银难度统一迁移为白金。
		silver: "platinum", "白银": "platinum",
		diamond: "diamond", "钻石": "diamond"
	};
	var definitions = [];
	var definitionMap = {};
	var volatileProfile = null;
	var root = null;
	var listRoot = null;
	var statsRoot = null;
	var iconViewer = null;
	var iconViewerTrigger = null;
	var openedWhilePlaying = false;
	var modalKeyDown = null;
	var modalKeyUp = null;
	var toastQueue = [];
	var toastActive = false;
	var customSoundUnavailable = false;
	var unlockListeners = [];
	var skipNextBackpackAfterBattle = null;

	var cloneData = function (value) {
		if (value == null) return value;
		if (core.clone) return core.clone(value);
		return JSON.parse(JSON.stringify(value));
	};

	var normalizeLevel = function (level) {
		return LEVEL_ALIASES[String(level || "").toLowerCase()] || LEVEL_ALIASES[String(level || "")] || "bronze";
	};

	var normalizeDefinitions = function (source) {
		var used = {};
		return (Array.isArray(source) ? source : []).map(function (item, index) {
			item = item && typeof item === "object" ? item : {};
			var id = String(item.id || "achievement_" + (index + 1));
			if (used[id]) throw new Error("成就 id 重复：" + id);
			used[id] = true;
			var icon = item.icon == null ? "★" : String(item.icon);
			var largeIcon = item.largeIcon == null
				? icon.replace(/^project\/images\/achievements\/(?!large\/)/, "project/images/achievements/large/")
				: String(item.largeIcon);
			return {
				id: id,
				name: String(item.name || "未命名成就"),
				unlock: String(item.unlock || "未填写解锁方式"),
				description: String(item.description || ""),
				level: normalizeLevel(item.level),
				hidden: item.hidden === true,
				icon: icon,
				largeIcon: largeIcon
			};
		});
	};

	definitions = normalizeDefinitions(achievementDefinitions_f21a6f89_1840_47d9_9f6a_79d54a2f790e);
	definitions.forEach(function (definition) { definitionMap[definition.id] = definition; });

	var defaultProfile = function () {
		return {
			version: 1,
			unlocked: {},
			stats: {
				battles: 0,
				highestFloor: 0,
				freeRefreshes: 0,
				lastUnlockedAt: null
			}
		};
	};

	var normalizeProfile = function (source) {
		source = source && typeof source === "object" ? source : {};
		var profile = defaultProfile();
		var sourceUnlocked = source.unlocked && typeof source.unlocked === "object" ? source.unlocked : {};
		definitions.forEach(function (definition) {
			var value = sourceUnlocked[definition.id];
			if (!value) return;
			profile.unlocked[definition.id] = {
				unlockedAt: String(value.unlockedAt || value.at || new Date(0).toISOString())
			};
		});
		var stats = source.stats && typeof source.stats === "object" ? source.stats : {};
		profile.stats.battles = Math.max(0, Math.floor(Number(stats.battles) || 0));
		profile.stats.highestFloor = Math.max(0, Math.floor(Number(stats.highestFloor) || 0));
		profile.stats.freeRefreshes = Math.max(0, Math.floor(Number(stats.freeRefreshes) || 0));
		profile.stats.lastUnlockedAt = stats.lastUnlockedAt == null ? null : String(stats.lastUnlockedAt);
		return profile;
	};

	var readProfile = function () {
		var source = core.getLocalStorage ? core.getLocalStorage(CONFIG.storageKey, null) : null;
		if (source == null && volatileProfile != null) source = volatileProfile;
		return normalizeProfile(source);
	};

	var writeProfile = function (profile) {
		var normalized = normalizeProfile(profile);
		volatileProfile = cloneData(normalized);
		if (!core.setLocalStorage) return false;
		return core.setLocalStorage(CONFIG.storageKey, normalized) !== false;
	};

	var isUnlockedIn = function (profile, id) {
		return !!(profile && profile.unlocked && profile.unlocked[id]);
	};

	var isRealPlay = function () {
		if (typeof main !== "undefined" && main.mode !== "play") return false;
		return !(core.isReplaying && core.isReplaying());
	};

	var formatUnlockDate = function (value) {
		var date = new Date(value);
		if (!value || isNaN(date.getTime())) return null;
		var pad = function (number) { return number < 10 ? "0" + number : String(number); };
		return "于" + date.getFullYear() + "年" + pad(date.getMonth() + 1) + "月" + pad(date.getDate()) + "日解锁";
	};

	var getEntries = function () {
		var profile = readProfile();
		return definitions.map(function (definition) {
			var unlocked = isUnlockedIn(profile, definition.id);
			return {
				id: definition.id,
				name: definition.name,
				unlock: definition.hidden && !unlocked ? "???" : definition.unlock,
				description: unlocked ? definition.description : null,
				level: definition.level,
				levelName: LEVELS[definition.level].name,
				hidden: definition.hidden,
				icon: definition.icon,
				unlocked: unlocked,
				unlockedAt: unlocked ? profile.unlocked[definition.id].unlockedAt : null,
				unlockedDateText: unlocked ? formatUnlockDate(profile.unlocked[definition.id].unlockedAt) : null
			};
		});
	};

	var getStatistics = function () {
		var entries = getEntries();
		var stats = {
			total: entries.length,
			unlocked: 0,
			levels: {
				bronze: { total: 0, unlocked: 0 },
				platinum: { total: 0, unlocked: 0 },
				diamond: { total: 0, unlocked: 0 }
			}
		};
		entries.forEach(function (entry) {
			stats.levels[entry.level].total++;
			if (entry.unlocked) {
				stats.unlocked++;
				stats.levels[entry.level].unlocked++;
			}
		});
		return stats;
	};

	var playFallbackSound = function () {
		if (core.playSound && CONFIG.fallbackSound) core.playSound(CONFIG.fallbackSound);
	};

	var playUnlockSound = function () {
		if (core.musicStatus && core.musicStatus.soundStatus === false) return;
		if (core.material && core.material.sounds && core.material.sounds[CONFIG.soundFile] && core.playSound) {
			core.playSound(CONFIG.soundFile);
			return;
		}
		if (!CONFIG.soundPath || customSoundUnavailable || typeof Audio !== "function") {
			playFallbackSound();
			return;
		}
		var audio = new Audio(CONFIG.soundPath);
		audio.preload = "auto";
		if (core.musicStatus) audio.volume = Math.max(0, Math.min(1, Number(core.musicStatus.userVolume) || 0.1));
		var fellBack = false;
		var fallbackOnce = function () {
			if (fellBack) return;
			fellBack = true;
			customSoundUnavailable = true;
			playFallbackSound();
		};
		audio.onerror = fallbackOnce;
		try {
			var promise = audio.play();
			if (promise && promise.catch) promise.catch(fallbackOnce);
		} catch (error) {
			fallbackOnce();
		}
	};

	var createIcon = function (definition, className, interactive, imageAlt, source) {
		var holder = document.createElement(interactive ? "button" : "div");
		holder.className = className || "achievement-icon";
		if (interactive) holder.type = "button";
		var icon = String(source || definition.icon || "★");
		if (/^(?:https?:\/\/|project\/|\.\.?\/|\/).+\.(?:png|jpe?g|gif|webp|svg)(?:[?#].*)?$/i.test(icon)) {
			var image = document.createElement("img");
			image.src = icon;
			image.alt = imageAlt || "";
			image.onerror = function () {
				image.remove();
				holder.textContent = "★";
			};
			holder.appendChild(image);
		} else holder.textContent = icon;
		return holder;
	};

	var closeIconViewer = function (restoreFocus) {
		if (!iconViewer) return false;
		var trigger = iconViewerTrigger;
		iconViewer.remove();
		iconViewer = null;
		iconViewerTrigger = null;
		if (restoreFocus !== false && trigger && trigger.focus) {
			setTimeout(function () { trigger.focus(); }, 0);
		}
		return true;
	};

	var openIconViewer = function (definition, trigger) {
		if (!root || !definition) return false;
		closeIconViewer(false);
		iconViewerTrigger = trigger || null;
		iconViewer = document.createElement("div");
		iconViewer.id = "achievement-icon-viewer";
		iconViewer.setAttribute("role", "dialog");
		iconViewer.setAttribute("aria-modal", "true");
		iconViewer.setAttribute("aria-label", definition.name + "成就图标大图");

		var card = document.createElement("section");
		card.className = "achievement-icon-viewer-card level-" + definition.level;
		card.style.setProperty("--achievement-level-color", LEVELS[definition.level].color);
		card.style.setProperty("--achievement-level-glow", LEVELS[definition.level].glow);
		var close = document.createElement("button");
		close.type = "button";
		close.className = "achievement-icon-viewer-close";
		close.setAttribute("aria-label", "关闭成就图标大图");
		close.title = "关闭大图";
		close.textContent = "×";
		// 高清图节点只在用户点击后才创建，因此不会随成就列表一起加载。
		var largeIcon = createIcon(definition, "achievement-icon-viewer-image", false,
			definition.name + "成就图标大图", definition.largeIcon || definition.icon);
		var caption = document.createElement("div");
		caption.className = "achievement-icon-viewer-caption";
		var captionName = document.createElement("strong");
		captionName.textContent = definition.name;
		var captionLevel = document.createElement("span");
		captionLevel.textContent = LEVELS[definition.level].name + "成就";
		caption.appendChild(captionName);
		caption.appendChild(captionLevel);
		card.appendChild(close);
		card.appendChild(largeIcon);
		card.appendChild(caption);
		iconViewer.appendChild(card);
		root.appendChild(iconViewer);

		close.addEventListener("click", function (event) {
			if (event) event.stopPropagation();
			closeIconViewer();
		});
		iconViewer.addEventListener("pointerdown", function (event) { event.stopPropagation(); });
		iconViewer.addEventListener("click", function (event) {
			event.stopPropagation();
			if (event.target === iconViewer) closeIconViewer();
		});
		setTimeout(function () { if (iconViewer) close.focus(); }, 0);
		return true;
	};

	var ensureToastHost = function () {
		var host = document.getElementById("achievement-toast-host");
		if (host) return host;
		host = document.createElement("div");
		host.id = "achievement-toast-host";
		host.setAttribute("aria-live", "polite");
		host.setAttribute("aria-atomic", "true");
		document.body.appendChild(host);
		return host;
	};

	var showNextToast = function () {
		if (toastActive || !toastQueue.length) return;
		toastActive = true;
		var definition = toastQueue.shift();
		var level = LEVELS[definition.level];
		var host = ensureToastHost();
		var toast = document.createElement("div");
		toast.className = "achievement-toast level-" + definition.level;
		toast.style.setProperty("--achievement-level-color", level.color);
		toast.style.setProperty("--achievement-level-glow", level.glow);
		var icon = createIcon(definition, "achievement-toast-icon");
		var copy = document.createElement("div");
		copy.className = "achievement-toast-copy";
		var kicker = document.createElement("div");
		kicker.className = "achievement-toast-kicker";
		kicker.textContent = "成就已解锁";
		var title = document.createElement("strong");
		title.textContent = definition.name;
		var badge = document.createElement("span");
		badge.className = "achievement-toast-level";
		badge.textContent = level.name;
		copy.appendChild(kicker);
		copy.appendChild(title);
		copy.appendChild(badge);
		toast.appendChild(icon);
		toast.appendChild(copy);
		host.appendChild(toast);
		playUnlockSound();
		window.requestAnimationFrame(function () {
			window.requestAnimationFrame(function () { toast.classList.add("show"); });
		});
		setTimeout(function () {
			toast.classList.remove("show");
			toast.classList.add("leave");
			setTimeout(function () {
				toast.remove();
				toastActive = false;
				showNextToast();
			}, 520);
		}, Math.max(1400, Number(CONFIG.toastDuration) || 5200));
	};

	var enqueueToast = function (definition) {
		toastQueue.push(definition);
		showNextToast();
	};

	var emitUnlock = function (definition, record) {
		unlockListeners.slice().forEach(function (listener) {
			try { listener(cloneData(definition), cloneData(record)); }
			catch (error) { console.error(error); }
		});
		try {
			if (typeof CustomEvent === "function") {
				document.dispatchEvent(new CustomEvent("achievementUnlocked", {
					detail: { achievement: cloneData(definition), record: cloneData(record) }
				}));
			}
		} catch (error) { console.error(error); }
	};

	var renderPreview = function () {
		if (!root || !listRoot || !statsRoot) return;
		var stats = getStatistics();
		statsRoot.innerHTML = "";

		var appendStat = function (title, unlocked, total, levelKey) {
			var card = document.createElement("div");
			card.className = "achievement-stat" + (levelKey ? " level-" + levelKey : " achievement-stat-total");
			if (levelKey) card.style.setProperty("--achievement-level-color", LEVELS[levelKey].color);
			var label = document.createElement("span");
			label.textContent = title;
			var value = document.createElement("strong");
			value.textContent = unlocked + " / " + total;
			var progress = document.createElement("i");
			progress.style.width = (total ? Math.round(unlocked / total * 100) : 0) + "%";
			card.appendChild(label);
			card.appendChild(value);
			card.appendChild(progress);
			statsRoot.appendChild(card);
		};

		appendStat("全部成就", stats.unlocked, stats.total, null);
		appendStat("青铜成就", stats.levels.bronze.unlocked, stats.levels.bronze.total, "bronze");
		appendStat("白金成就", stats.levels.platinum.unlocked, stats.levels.platinum.total, "platinum");
		appendStat("钻石成就", stats.levels.diamond.unlocked, stats.levels.diamond.total, "diamond");

		listRoot.innerHTML = "";
		getEntries().forEach(function (entry) {
			var definition = definitionMap[entry.id];
			var level = LEVELS[entry.level];
			var row = document.createElement("article");
			row.className = "achievement-row level-" + entry.level + (entry.unlocked ? " unlocked" : " locked");
			row.style.setProperty("--achievement-level-color", level.color);
			row.style.setProperty("--achievement-level-glow", level.glow);
			row.dataset.achievementId = entry.id;

			var icon = createIcon(definition, "achievement-icon achievement-icon-button", true);
			icon.dataset.achievementId = entry.id;
			icon.title = "查看“" + entry.name + "”成就图标大图";
			icon.setAttribute("aria-label", icon.title);
			icon.addEventListener("click", function (event) {
				if (event) event.stopPropagation();
				openIconViewer(definition, icon);
			});
			var body = document.createElement("div");
			body.className = "achievement-body";
			var heading = document.createElement("div");
			heading.className = "achievement-heading";
			var name = document.createElement("h2");
			name.textContent = entry.name;
			var badge = document.createElement("span");
			badge.className = "achievement-level";
			badge.textContent = entry.levelName;
			var state = document.createElement("div");
			state.className = "achievement-state";
			var stateLabel = document.createElement("span");
			stateLabel.textContent = entry.unlocked ? "已解锁" : "未解锁";
			state.appendChild(stateLabel);
			if (entry.unlocked && entry.unlockedDateText) {
				var unlockedTime = document.createElement("time");
				unlockedTime.dateTime = entry.unlockedAt;
				unlockedTime.textContent = entry.unlockedDateText;
				state.appendChild(unlockedTime);
			}
			heading.appendChild(name);
			heading.appendChild(badge);
			heading.appendChild(state);

			var details = document.createElement("div");
			details.className = "achievement-details";
			var unlock = document.createElement("div");
			unlock.className = "achievement-unlock";
			var unlockLabel = document.createElement("b");
			unlockLabel.textContent = "解锁方式";
			var unlockText = document.createElement("span");
			unlockText.textContent = entry.unlock;
			unlock.appendChild(unlockLabel);
			unlock.appendChild(unlockText);
			details.appendChild(unlock);
			if (entry.description) {
				var description = document.createElement("p");
				description.textContent = entry.description;
				details.appendChild(description);
			}

			body.appendChild(heading);
			body.appendChild(details);
			row.appendChild(icon);
			row.appendChild(body);
			listRoot.appendChild(row);
		});
	};

	var unlock = function (id, options) {
		id = String(id || "");
		var definition = definitionMap[id];
		if (!definition) {
			console.warn("未知成就：" + id);
			return false;
		}
		var profile = readProfile();
		if (isUnlockedIn(profile, id)) return false;
		var now = new Date().toISOString();
		var record = { unlockedAt: now };
		profile.unlocked[id] = record;
		profile.stats.lastUnlockedAt = now;
		writeProfile(profile);
		if (!(options && options.silent)) enqueueToast(definition);
		renderPreview();
		emitUnlock(definition, record);
		return true;
	};

	var unlockMany = function (ids, options) {
		return (Array.isArray(ids) ? ids : [ids]).filter(function (id) {
			return unlock(id, options);
		});
	};

	var recordBattle = function (result) {
		// 旧版 afterBattle 没有结果对象，能进入 afterBattle 即视为胜利。
		if (result && result.outcome && result.outcome !== "victory") return readProfile().stats.battles;
		var profile = readProfile();
		profile.stats.battles++;
		writeProfile(profile);
		if (profile.stats.battles === 1) unlock("first_victory");
		if (profile.stats.battles >= 100) unlock("battle_100");
		return profile.stats.battles;
	};

	var parseFloorNumber = function (floorId) {
		var value = String(floorId || "");
		var match = value.match(/(?:^|[^0-9])(\d+)(?!.*\d)/);
		if (!match && core.floors && core.floors[floorId]) {
			value = String(core.floors[floorId].name || core.floors[floorId].title || "");
			match = value.match(/(?:^|[^0-9])(\d+)(?!.*\d)/);
		}
		return match ? Math.max(0, Math.floor(Number(match[1]) || 0)) : null;
	};

	var isGuideFloor = function (floorId) {
		return /^GUIDE/i.test(String(floorId || "").trim());
	};

	var isTrueDemonKingBattle = function (result) {
		return !!result && result.enemyId === "redKing" && parseFloorNumber(result.floorId) === 50;
	};

	var recordBattleResult = function (result) {
		if (!isRealPlay() || !result || !result.outcome) return false;
		if (result.outcome === "victory") {
			recordBattle(result);
			// 背包战斗胜利后马上还会进入引擎 afterBattle，避免重复累计。
			skipNextBackpackAfterBattle = {
				enemyId: result.enemyId,
				x: result.x,
				y: result.y,
				floorId: result.floorId
			};
		}

		var rounds = Math.max(0, Number(result.rounds) || 0);
		var netDamage = Number(result.netDamage);
		if (rounds >= 100) unlock("battle_rounds_100");
		if (rounds >= 300) unlock("battle_rounds_300");
		if (result.outcome === "victory" && isFinite(netDamage) && netDamage < 0) unlock("battle_healing");

		if (result.outcome === "victory" && isTrueDemonKingBattle(result)) {
			if (isFinite(netDamage) && netDamage <= 0) unlock("weak_demon_king");
			if (Number(result.playerHp) === 1) unlock("one_hp_demon_king");
		}
		if (result.outcome === "defeat" && result.enemyId === "yellowKnight" && parseFloorNumber(result.floorId) === 32) {
			unlock("boastful_knight_defeat");
		}
		return true;
	};

	var recordFreeShopRefresh = function () {
		if (!isRealPlay()) return readProfile().stats.freeRefreshes;
		var profile = readProfile();
		profile.stats.freeRefreshes++;
		writeProfile(profile);
		if (profile.stats.freeRefreshes >= 100) unlock("junk_refresh_100");
		return profile.stats.freeRefreshes;
	};

	var recordFloor = function (floorId, options) {
		if (isGuideFloor(floorId)) return null;
		var floor = parseFloorNumber(floorId);
		if (floor == null) return null;
		var profile = readProfile();
		if (floor > profile.stats.highestFloor) {
			profile.stats.highestFloor = floor;
			writeProfile(profile);
		}
		if (floor >= 10) unlock("reach_floor_10");
		if (floor >= 25) unlock("reach_floor_25");
		if (floor >= 50) unlock("reach_floor_50");
		if (floor === 2 && options && options.firstVisit && core.status && core.status.hero && Number(core.status.hero.hp) < 100) {
			unlock("barely_started");
		}
		return floor;
	};

	var closePreview = function () {
		if (!root) return false;
		closeIconViewer(false);
		document.removeEventListener("keydown", modalKeyDown, true);
		document.removeEventListener("keyup", modalKeyUp, true);
		root.remove();
		root = null;
		listRoot = null;
		statsRoot = null;
		document.documentElement.classList.remove("achievement-preview-open");
		if (openedWhilePlaying && core.status && core.status.event && core.status.event.id === CONFIG.eventId) {
			core.status.event.id = null;
			core.status.event.data = null;
			core.status.event.selection = null;
			if (core.unlockControl) core.unlockControl();
			if (core.updateStatusBar) core.updateStatusBar(true);
		}
		openedWhilePlaying = false;
		return true;
	};

	var openPreview = function () {
		if (root) return true;
		openedWhilePlaying = !!(core.isPlaying && core.isPlaying());
		if (openedWhilePlaying) {
			if (core.status && core.status.event && core.status.event.id && core.status.event.id !== CONFIG.eventId
				&& core.ui && core.ui.closePanel) core.ui.closePanel();
			if (core.lockControl) core.lockControl();
			core.status.event.id = CONFIG.eventId;
			core.status.event.data = null;
		}

		root = document.createElement("div");
		root.id = "achievement-system-root";
		root.setAttribute("role", "dialog");
		root.setAttribute("aria-modal", "true");
		root.setAttribute("aria-label", "成就预览");
		var panel = document.createElement("section");
		panel.className = "achievement-panel";
		var header = document.createElement("header");
		header.className = "achievement-header";
		var titleGroup = document.createElement("div");
		var eyebrow = document.createElement("span");
		eyebrow.textContent = "ACHIEVEMENTS";
		var title = document.createElement("h1");
		title.textContent = "成就预览";
		var subtitle = document.createElement("p");
		subtitle.textContent = "记录每一次探索、战斗与登顶";
		titleGroup.appendChild(eyebrow);
		titleGroup.appendChild(title);
		titleGroup.appendChild(subtitle);
		var close = document.createElement("button");
		close.type = "button";
		close.className = "achievement-close";
		close.title = "关闭";
		close.setAttribute("aria-label", "关闭成就预览");
		close.textContent = "×";
		header.appendChild(titleGroup);
		header.appendChild(close);
		statsRoot = document.createElement("div");
		statsRoot.className = "achievement-stats";
		listRoot = document.createElement("div");
		listRoot.className = "achievement-list";
		panel.appendChild(header);
		panel.appendChild(statsRoot);
		panel.appendChild(listRoot);
		root.appendChild(panel);
		document.body.appendChild(root);
		document.documentElement.classList.add("achievement-preview-open");

		close.addEventListener("click", closePreview);
		root.addEventListener("pointerdown", function (event) { event.stopPropagation(); });
		root.addEventListener("click", function (event) {
			event.stopPropagation();
			if (event.target === root) closePreview();
		});
		modalKeyDown = function (event) {
			if (!root) return;
			event.stopImmediatePropagation();
			if (event.key === "Escape" || event.keyCode === 27) event.preventDefault();
		};
		modalKeyUp = function (event) {
			if (!root) return;
			event.stopImmediatePropagation();
			if (event.key === "Escape" || event.keyCode === 27) {
				event.preventDefault();
				if (iconViewer) closeIconViewer();
				else closePreview();
			}
		};
		document.addEventListener("keydown", modalKeyDown, true);
		document.addEventListener("keyup", modalKeyUp, true);
		if (openedWhilePlaying && isRealPlay()) unlock("curious_mind");
		renderPreview();
		setTimeout(function () { if (root) close.focus(); }, 0);
		return true;
	};

	var installStyles = function () {
		if (document.getElementById("achievement-system-style")) return;
		var style = document.createElement("style");
		style.id = "achievement-system-style";
		style.textContent = [
			"html.achievement-preview-open,html.achievement-preview-open body{overflow:hidden!important}",
			"#achievement-system-root{position:fixed;z-index:12000;inset:0;display:flex;align-items:center;justify-content:center;box-sizing:border-box;padding:clamp(10px,2.5vw,28px);background:radial-gradient(circle at 72% 16%,rgba(49,92,140,.22),transparent 38%),rgba(2,7,13,.9);backdrop-filter:blur(7px);font-family:'Microsoft YaHei',sans-serif;color:#eaf3fb}",
			".achievement-panel{width:min(960px,100%);height:min(850px,94vh);display:grid;grid-template-rows:auto auto minmax(0,1fr);overflow:hidden;border:1px solid rgba(116,166,204,.38);border-radius:14px;background:linear-gradient(160deg,rgba(20,34,48,.98),rgba(7,14,23,.98) 58%,rgba(11,24,36,.98));box-shadow:0 24px 80px rgba(0,0,0,.72),inset 0 1px rgba(255,255,255,.05)}",
			".achievement-header{display:flex;align-items:flex-start;justify-content:space-between;gap:20px;padding:22px 24px 17px;border-bottom:1px solid rgba(147,184,214,.17);background:linear-gradient(90deg,rgba(69,117,154,.12),transparent)}",
			".achievement-header span{display:block;color:#79b9df;font-size:10px;font-weight:700;letter-spacing:.24em}",
			".achievement-header h1{margin:3px 0 0;font-size:clamp(24px,4vw,34px);line-height:1.1;letter-spacing:.06em}",
			".achievement-header p{margin:7px 0 0;color:#8295a7;font-size:12px}",
			".achievement-close{flex:none;width:42px;height:42px;padding:0;border:1px solid rgba(154,190,219,.32);border-radius:50%;background:rgba(9,19,29,.72);color:#dceaf5;font:300 30px/38px Arial;cursor:pointer;transition:.18s ease}",
			".achievement-close:hover,.achievement-close:focus-visible{outline:none;border-color:#79c6ef;background:#173148;color:#fff;transform:rotate(8deg)}",
			".achievement-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;padding:14px 18px;border-bottom:1px solid rgba(147,184,214,.14);background:rgba(3,9,15,.3)}",
			".achievement-stat{position:relative;overflow:hidden;min-height:58px;box-sizing:border-box;padding:10px 12px 13px;border:1px solid rgba(142,174,199,.16);border-radius:8px;background:rgba(21,36,49,.64)}",
			".achievement-stat span{display:block;color:#8194a6;font-size:10px}.achievement-stat strong{display:block;margin-top:3px;color:var(--achievement-level-color,#f3f7fa);font-size:19px;line-height:1.15}.achievement-stat i{position:absolute;left:0;bottom:0;height:3px;background:var(--achievement-level-color,#6db7df);box-shadow:0 0 12px var(--achievement-level-color,#6db7df);transition:width .25s ease}",
			".achievement-stat-total{--achievement-level-color:#72bce5}",
			".achievement-list{overflow:auto;overscroll-behavior:contain;padding:12px 18px 22px;scrollbar-color:#38566d #0a1118;scrollbar-width:thin}",
			".achievement-row{--achievement-level-color:#c98b52;--achievement-level-glow:rgba(201,139,82,.3);position:relative;display:grid;grid-template-columns:70px minmax(0,1fr);gap:15px;align-items:center;min-height:94px;box-sizing:border-box;margin:0 0 10px;padding:13px 16px 13px 13px;border:1px solid rgba(142,174,199,.16);border-left:3px solid var(--achievement-level-color);border-radius:9px;background:linear-gradient(100deg,var(--achievement-level-glow),rgba(13,25,36,.8) 25%,rgba(9,18,27,.88));box-shadow:0 7px 22px rgba(0,0,0,.22);transition:border-color .18s ease,transform .18s ease}",
			".achievement-row:hover{border-color:color-mix(in srgb,var(--achievement-level-color) 62%,transparent);transform:translateY(-1px)}",
			".achievement-row.locked{filter:saturate(.42);opacity:.7;background:linear-gradient(100deg,rgba(91,105,117,.12),rgba(10,18,26,.85) 30%)}",
			".achievement-icon,.achievement-toast-icon{display:flex;align-items:center;justify-content:center;overflow:hidden;border:1px solid var(--achievement-level-color);color:var(--achievement-level-color);background:radial-gradient(circle at 35% 28%,rgba(255,255,255,.13),transparent 35%),rgba(3,10,16,.72);box-shadow:inset 0 0 15px var(--achievement-level-glow),0 0 14px var(--achievement-level-glow);font-weight:800;text-align:center}",
			".achievement-icon{width:58px;height:58px;border-radius:10px;font-size:23px}.achievement-icon img,.achievement-toast-icon img{width:100%;height:100%;object-fit:cover}",
			".achievement-icon-button{appearance:none;padding:0;font:inherit;cursor:zoom-in;transition:transform .18s ease,filter .18s ease}.achievement-icon-button:hover,.achievement-icon-button:focus-visible{outline:2px solid var(--achievement-level-color);outline-offset:3px;filter:brightness(1.12);transform:scale(1.06)}",
			".achievement-body{min-width:0}.achievement-heading{display:flex;align-items:center;gap:9px;min-width:0}.achievement-heading h2{min-width:0;margin:0;color:#f5f9fc;font-size:17px;line-height:1.3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
			".achievement-level{flex:none;padding:2px 7px;border:1px solid var(--achievement-level-color);border-radius:10px;color:var(--achievement-level-color);background:rgba(1,7,12,.5);font-size:10px;font-weight:700}",
			".achievement-state{flex:none;display:flex;flex-direction:column;align-items:flex-end;margin-left:auto;color:#8294a3;font-size:11px;line-height:1.25;text-align:right}.achievement-state span{font-weight:700}.achievement-state time{display:block;margin-top:3px;color:#71899a;font-size:10px;font-style:normal;white-space:nowrap}.achievement-row.unlocked .achievement-state span{color:#83d4a3}.achievement-row.unlocked .achievement-state time{color:#8ba8ba}",
			".achievement-details{margin-top:7px;color:#9cafbe;font-size:12px;line-height:1.55}.achievement-unlock{display:flex;gap:9px;align-items:baseline}.achievement-unlock b{flex:none;color:#6f8da3;font-size:10px;font-weight:600}.achievement-unlock span{color:#bac8d2}.achievement-details p{margin:3px 0 0;color:#7f91a0}.achievement-row.unlocked .achievement-details p{color:#a8b8c5}",
			"#achievement-icon-viewer{position:fixed;z-index:13000;inset:0;display:flex;align-items:center;justify-content:center;padding:20px;box-sizing:border-box;background:rgba(0,4,9,.88);backdrop-filter:blur(9px);cursor:zoom-out}",
			".achievement-icon-viewer-card{--achievement-level-color:#c98b52;--achievement-level-glow:rgba(201,139,82,.35);position:relative;display:flex;flex-direction:column;align-items:center;max-width:calc(100vw - 40px);padding:18px 18px 14px;border:1px solid var(--achievement-level-color);border-radius:15px;background:linear-gradient(160deg,rgba(24,41,57,.98),rgba(5,12,20,.99));box-shadow:0 28px 90px rgba(0,0,0,.82),0 0 35px var(--achievement-level-glow);cursor:default}",
			".achievement-icon-viewer-image{display:flex;align-items:center;justify-content:center;overflow:hidden;width:70vmin;max-width:560px;max-height:70vh;aspect-ratio:1/1;border:1px solid var(--achievement-level-color);border-radius:10px;background:#07111b;box-shadow:0 0 28px var(--achievement-level-glow)}.achievement-icon-viewer-image img{display:block;width:100%;height:100%;object-fit:contain}",
			".achievement-icon-viewer-caption{display:flex;align-items:baseline;justify-content:center;gap:10px;margin-top:13px}.achievement-icon-viewer-caption strong{color:#f4f8fb;font-size:20px}.achievement-icon-viewer-caption span{color:var(--achievement-level-color);font-size:11px;font-weight:700}",
			".achievement-icon-viewer-close{position:absolute;z-index:1;top:9px;right:9px;width:38px;height:38px;padding:0;border:1px solid rgba(255,255,255,.45);border-radius:50%;background:rgba(3,9,15,.78);color:#fff;font:300 28px/35px Arial;cursor:pointer}.achievement-icon-viewer-close:hover,.achievement-icon-viewer-close:focus-visible{outline:none;border-color:#fff;background:rgba(27,55,76,.94);transform:rotate(8deg)}",
			"#achievement-toast-host{position:fixed;z-index:15000;right:max(16px,env(safe-area-inset-right));bottom:max(18px,env(safe-area-inset-bottom));display:flex;flex-direction:column;align-items:flex-end;gap:10px;pointer-events:none;font-family:'Microsoft YaHei',sans-serif}",
			".achievement-toast{--achievement-level-color:#c98b52;--achievement-level-glow:rgba(201,139,82,.35);position:relative;width:min(360px,calc(100vw - 24px));min-height:90px;display:grid;grid-template-columns:64px minmax(0,1fr);gap:13px;align-items:center;box-sizing:border-box;padding:13px 15px;border:1px solid rgba(142,190,222,.38);border-left:4px solid var(--achievement-level-color);border-radius:6px;background:linear-gradient(115deg,#182c3d,#0b1722 62%,#0b2230);box-shadow:0 15px 38px rgba(0,0,0,.62),inset 0 1px rgba(255,255,255,.06);opacity:0;transform:translateX(calc(100% + 34px));transition:opacity .38s ease,transform .5s cubic-bezier(.2,.8,.2,1);overflow:hidden}",
			".achievement-toast:after{content:'';position:absolute;left:-25%;bottom:0;width:24%;height:2px;background:linear-gradient(90deg,transparent,var(--achievement-level-color),transparent);animation:achievement-toast-shine 2.2s linear infinite}",
			".achievement-toast.show{opacity:1;transform:none}.achievement-toast.leave{opacity:0;transform:translateY(18px) scale(.98)}",
			".achievement-toast-icon{width:58px;height:58px;border-radius:5px;font-size:22px}.achievement-toast-copy{min-width:0}.achievement-toast-kicker{margin-bottom:5px;color:#78bfe8;font-size:10px;font-weight:800;letter-spacing:.18em}.achievement-toast-copy strong{display:inline-block;max-width:calc(100% - 58px);color:#fff;font-size:16px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;vertical-align:middle}.achievement-toast-level{display:inline-block;margin-left:8px;padding:2px 6px;border:1px solid var(--achievement-level-color);border-radius:9px;color:var(--achievement-level-color);font-size:9px;font-weight:700;vertical-align:middle}",
			"@keyframes achievement-toast-shine{from{left:-25%}to{left:110%}}",
			"@media(max-width:680px){#achievement-system-root{padding:8px}.achievement-panel{height:calc(100vh - 16px);border-radius:10px}.achievement-header{padding:16px}.achievement-header p{display:none}.achievement-stats{grid-template-columns:repeat(2,minmax(0,1fr));padding:10px;gap:7px}.achievement-stat{min-height:52px;padding:8px 10px 11px}.achievement-list{padding:9px 10px 18px}.achievement-row{grid-template-columns:54px minmax(0,1fr);gap:10px;min-height:86px;padding:11px 10px}.achievement-icon{width:48px;height:48px;font-size:18px}.achievement-heading{flex-wrap:wrap;gap:5px}.achievement-heading h2{flex:1 1 calc(100% - 100px);font-size:15px}.achievement-state{align-items:flex-start;margin-left:0;text-align:left}.achievement-unlock{display:block}.achievement-unlock b{display:block}.achievement-icon-viewer-card{padding:12px 12px 11px}.achievement-icon-viewer-image{width:82vmin}.achievement-icon-viewer-caption strong{font-size:17px}.achievement-toast{grid-template-columns:54px minmax(0,1fr);min-height:78px;padding:10px}.achievement-toast-icon{width:48px;height:48px}}",
			"@media(prefers-reduced-motion:reduce){.achievement-toast,.achievement-row,.achievement-close{transition:none!important}.achievement-toast:after{animation:none}}"
		].join("");
		document.head.appendChild(style);
	};

	var installStartButton = function () {
		var startButtons = document.getElementById("startButtons");
		if (!startButtons || document.getElementById("achievementPreviewButton")) return;
		var button = document.createElement("span");
		button.className = "startButton";
		button.id = "achievementPreviewButton";
		button.textContent = "成就预览";
		button.onclick = function (event) {
			if (event) event.stopPropagation();
			openPreview();
		};
		startButtons.appendChild(button);
	};

	var wrapEvent = function (name, after, before) {
		var original = core.events && core.events[name];
		if (typeof original !== "function" || original.__achievementSystemWrapped) return;
		var wrapped = function () {
			var args = Array.prototype.slice.call(arguments);
			var beforeValue;
			try { if (before) beforeValue = before(args); }
			catch (error) { console.error(error); }
			var result = original.apply(this, args);
			try { after(args, result, beforeValue); }
			catch (error) { console.error(error); }
			return result;
		};
		wrapped.__achievementSystemWrapped = true;
		wrapped.__achievementSystemOriginal = original;
		core.events[name] = wrapped;
	};

	var installAutomaticTriggers = function () {
		wrapEvent("startGame", function (args) {
			// 第三个参数为录像路线；回放不会写入局外成就。
			if (args[2] == null && isRealPlay()) unlock("begin_journey");
		});
		wrapEvent("afterBattle", function (args) {
			if (!isRealPlay()) return;
			var skipped = skipNextBackpackAfterBattle;
			if (skipped && skipped.enemyId === args[0] && skipped.x === args[1] && skipped.y === args[2]) {
				skipNextBackpackAfterBattle = null;
				return;
			}
			recordBattle({ outcome: "victory", enemyId: args[0], x: args[1], y: args[2], floorId: core.status.floorId });
		});
		wrapEvent("afterChangeFloor", function (args, result, firstVisit) {
			if (isRealPlay()) recordFloor(args[0], { firstVisit: firstVisit });
		}, function (args) {
			return !core.hasFlag("__fromLoad__") && !core.hasVisitedFloor(args[0]);
		});
	};

	var api = {
		__installed: true,
		unlock: unlock,
		unlockMany: unlockMany,
		isUnlocked: function (id) { return isUnlockedIn(readProfile(), String(id || "")); },
		getDefinition: function (id) { return cloneData(definitionMap[String(id || "")] || null); },
		getDefinitions: function () { return cloneData(definitions); },
		getEntries: function () { return cloneData(getEntries()); },
		getStatistics: function () { return cloneData(getStatistics()); },
		getProfile: function () { return cloneData(readProfile()); },
		open: openPreview,
		close: closePreview,
		isOpen: function () { return !!root; },
		showUnlockToast: function (id) {
			var definition = definitionMap[String(id || "")];
			if (!definition) return false;
			enqueueToast(definition);
			return true;
		},
		onUnlock: function (listener) {
			if (typeof listener !== "function" || unlockListeners.indexOf(listener) >= 0) return false;
			unlockListeners.push(listener);
			return true;
		},
		offUnlock: function (listener) {
			var index = unlockListeners.indexOf(listener);
			if (index < 0) return false;
			unlockListeners.splice(index, 1);
			return true;
		},
		recordBattle: recordBattle,
		recordBattleResult: recordBattleResult,
		recordFreeShopRefresh: recordFreeShopRefresh,
		recordFloor: recordFloor
	};

	plugin.achievementSystem = api;
	plugin.unlockAchievement = unlock;
	plugin.openAchievementPreview = openPreview;
	plugin.closeAchievementPreview = closePreview;
	installStyles();
	installStartButton();
	installAutomaticTriggers();
	return api;
};
