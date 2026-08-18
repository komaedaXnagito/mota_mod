/**
 * 武器联动范围的纯计算模块。
 *
 * 只根据武器的结构化 synergyRules/combatRules 和来源武器占格计算潜在联动格，
 * 不解析描述文本、不读取游戏状态，也不使用随机数。背包与战斗界面共用此结果。
 */
var backpackWeaponSynergy_91f4c21e_7d37_4f12_9cc4_a9606ba62a83 = (function () {
	"use strict";

	var ALL_DIRECTIONS = ["up", "down", "left", "right"];
	var CLOCKWISE_DIRECTIONS = ["up", "right", "down", "left"];
	var DIRECTION_VECTORS = {
		up: [0, -1],
		down: [0, 1],
		left: [-1, 0],
		right: [1, 0]
	};

	var normalizeDirections = function (directions) {
		if (!Array.isArray(directions) || !directions.length) return ALL_DIRECTIONS.slice();
		return directions.map(String).filter(function (direction, index, list) {
			return DIRECTION_VECTORS[direction] && list.indexOf(direction) === index;
		});
	};

	var normalizeRotation = function (rotation) {
		rotation = Math.round((Number(rotation) || 0) / 90) * 90;
		return ((rotation % 360) + 360) % 360;
	};

	/** 把武器 0 度本地方向旋转为当前背包中的世界方向。 */
	var rotateDirection = function (direction, rotation) {
		var directionIndex = CLOCKWISE_DIRECTIONS.indexOf(String(direction));
		if (directionIndex < 0) return null;
		var quarterTurns = normalizeRotation(rotation) / 90;
		return CLOCKWISE_DIRECTIONS[(directionIndex + quarterTurns) % 4];
	};

	var rotateDirections = function (directions, rotation) {
		return normalizeDirections(directions).map(function (direction) {
			return rotateDirection(direction, rotation);
		}).filter(function (direction, index, list) {
			return direction && list.indexOf(direction) === index;
		});
	};

	/** 返回带旋转后 directions 的条件副本，不修改 weapons.js 中的原始定义。 */
	var rotateSpatialCondition = function (condition, rotation) {
		condition = condition || {};
		var rotated = Object.assign({}, condition);
		rotated.directions = rotateDirections(condition.directions, rotation);
		return rotated;
	};

	var normalizeSourceCells = function (cells) {
		var used = {};
		return (Array.isArray(cells) ? cells : []).map(function (cell) {
			return [Math.floor(Number(cell[0])), Math.floor(Number(cell[1]))];
		}).filter(function (cell) {
			if (!Number.isFinite(cell[0]) || !Number.isFinite(cell[1])) return false;
			var key = cell[0] + "," + cell[1];
			if (used[key]) return false;
			used[key] = true;
			return true;
		});
	};

	var collectSpatialRules = function (weapon) {
		var result = [];
		(Array.isArray(weapon && weapon.synergyRules) ? weapon.synergyRules : []).forEach(function (rule, ruleIndex) {
			(Array.isArray(rule.conditions) ? rule.conditions : []).forEach(function (condition, conditionIndex) {
				if (condition && condition.kind === "nearby") {
					var conditionId = condition.id || "condition" + conditionIndex;
					result.push({
						kind: "layout",
						ruleId: rule.id || "synergyRule" + ruleIndex,
						conditionId: conditionId,
						condition: condition
					});
				}
			});
		});
		(Array.isArray(weapon && weapon.combatRules) ? weapon.combatRules : []).forEach(function (rule, ruleIndex) {
			(Array.isArray(rule.conditions) ? rule.conditions : []).forEach(function (condition, conditionIndex) {
				// 空间条件才产生联动范围：附近武器数量 / 联动武器 / 附近盾牌触发，以及带空间字段的概率条件
				// （chance + relation/span/distance/directions/nearbyBonus，表示"附近武器越多概率越高"）。
				// 纯 chance（只是概率修饰）不显示联动范围。
				const isSpatial = condition && (condition.kind === "nearbyCount"
					|| condition.kind === "linkedWeapon"
					|| condition.kind === "nearbyShieldTriggered"
					|| (condition.kind === "chance" && (condition.relation || condition.span
						|| condition.distance || condition.directions || condition.nearbyBonus != null)));
				if (isSpatial) {
					result.push({
						kind: "combat",
						ruleId: rule.id || "combatRule" + ruleIndex,
						conditionId: condition.id || "condition" + conditionIndex,
						condition: condition
					});
				}
			});
			(Array.isArray(rule.effects) ? rule.effects : []).forEach(function (effect, effectIndex) {
				var source = effect && effect.stacksFrom;
				if (source && source.kind === "nearbyCount") {
					result.push({
						kind: "combat",
						ruleId: rule.id || "combatRule" + ruleIndex,
						conditionId: "effect" + effectIndex,
						condition: source
					});
				}
				if (effect && effect.type === "triggerLinkedWeaponAttack") {
					result.push({
						kind: "combat",
						ruleId: rule.id || "combatRule" + ruleIndex,
						conditionId: "effect" + effectIndex,
						condition: effect.linkedWeapon || effect
					});
				}
				// 带 directions 的附近类效果（triggerWeaponEffects / nearbyExtraAttack / nearbyIntervalBonus /
				// nearbyIntervalPercentBonus / nearbyDamageBonus / nearbyRandomBuff）：纳入联动区域可视化，
				// 让该效果作用的方向格显示箭头（如"上方一格内的饮料效果"在游戏内也显示向上联动提示）。
				if (effect && Array.isArray(effect.directions) && effect.directions.length
					&& (effect.type === "triggerWeaponEffects"
						|| effect.type === "addExtraAttack"
						|| effect.type === "nearbyExtraAttack"
						|| effect.type === "nearbyIntervalBonus"
						|| effect.type === "nearbyIntervalPercentBonus"
						|| effect.type === "nearbyDamageBonus"
						|| effect.type === "nearbyRandomBuff"
						|| effect.type === "nearbyApplyStatus"
						|| effect.type === "nearbyMaxHpBonus"
						|| effect.type === "nearbyDamageSelf"
						|| (effect.type === "modifyWeaponStat" && effect.weaponTarget === "nearby")
						|| (effect.type === "statusDamageBonus" && effect.scope === "nearby"))) {
					result.push({
						kind: "combat",
						ruleId: rule.id || "combatRule" + ruleIndex,
						conditionId: "effect" + effectIndex,
						condition: effect
					});
				}
			});
		});
		return result;
	};

	var addAffectedCell = function (cellMap, sourceKeys, col, row, directions, descriptor) {
		col = Math.floor(Number(col));
		row = Math.floor(Number(row));
		var key = col + "," + row;
		if (!Number.isFinite(col) || !Number.isFinite(row) || sourceKeys[key]) return;
		if (!cellMap[key]) {
			cellMap[key] = {
				col: col,
				row: row,
				directions: [],
				arrowDirections: [],
				ruleIds: [],
				kinds: []
			};
		}
		directions.forEach(function (direction) {
			if (cellMap[key].directions.indexOf(direction) < 0) cellMap[key].directions.push(direction);
		});
		// 联动范围仍保留真实空间方向；视觉箭头统一朝正上方流动，
		// 仅用于提示“该格参与联动”，不表达流入/流出武器的语义。
		if (cellMap[key].arrowDirections.indexOf("up") < 0) cellMap[key].arrowDirections.push("up");
		if (cellMap[key].ruleIds.indexOf(descriptor.ruleId) < 0) cellMap[key].ruleIds.push(descriptor.ruleId);
		if (cellMap[key].kinds.indexOf(descriptor.kind) < 0) cellMap[key].kinds.push(descriptor.kind);
	};

	var addOrthogonalCells = function (cellMap, sourceKeys, sourceCells, descriptor) {
		var condition = descriptor.condition || {};
		var distance = Math.max(1, Math.floor(Number(condition.distance) || 1));
		var directions = normalizeDirections(condition.directions);
		sourceCells.forEach(function (sourceCell) {
			directions.forEach(function (direction) {
				var vector = DIRECTION_VECTORS[direction];
				for (var step = 1; step <= distance; step++) {
					addAffectedCell(
						cellMap,
						sourceKeys,
						sourceCell[0] + vector[0] * step,
						sourceCell[1] + vector[1] * step,
						[direction],
						descriptor
					);
				}
			});
		});
	};

	var addSideBoxCells = function (cellMap, sourceKeys, sourceCells, descriptor) {
		var condition = descriptor.condition || {};
		var distance = Math.max(1, Math.floor(Number(condition.distance) || 1));
		var span = Math.max(1, Math.floor(Number(condition.span) || distance));
		var directions = normalizeDirections(condition.directions);
		var minimumX = Math.min.apply(null, sourceCells.map(function (cell) { return cell[0]; }));
		var maximumX = Math.max.apply(null, sourceCells.map(function (cell) { return cell[0]; }));
		var minimumY = Math.min.apply(null, sourceCells.map(function (cell) { return cell[1]; }));
		var maximumY = Math.max.apply(null, sourceCells.map(function (cell) { return cell[1]; }));
		directions.forEach(function (direction) {
			if (direction === "left" || direction === "right") {
				var verticalCenter = (minimumY + maximumY) / 2;
				var firstRow = Math.floor(verticalCenter - (span - 1) / 2);
				for (var rowOffset = 0; rowOffset < span; rowOffset++) {
					for (var horizontalStep = 1; horizontalStep <= distance; horizontalStep++) {
						addAffectedCell(
							cellMap,
							sourceKeys,
							direction === "left" ? minimumX - horizontalStep : maximumX + horizontalStep,
							firstRow + rowOffset,
							[direction],
							descriptor
						);
					}
				}
				return;
			}
			var horizontalCenter = (minimumX + maximumX) / 2;
			var firstColumn = Math.floor(horizontalCenter - (span - 1) / 2);
			for (var columnOffset = 0; columnOffset < span; columnOffset++) {
				for (var verticalStep = 1; verticalStep <= distance; verticalStep++) {
					addAffectedCell(
						cellMap,
						sourceKeys,
						firstColumn + columnOffset,
						direction === "up" ? minimumY - verticalStep : maximumY + verticalStep,
						[direction],
						descriptor
					);
				}
			}
		});
	};

	/**
	 * 战斗触发规则与布局联动规则共用同一套严格位置判断：
	 * sideBox 走矩形区域，其余按严格同一行/列的正交判断，不再使用曼哈顿大致方向。
	 */
	var addCombatNearbyCells = function (cellMap, sourceKeys, sourceCells, descriptor) {
		var condition = descriptor.condition || {};
		if (condition.relation === "sideBox") {
			addSideBoxCells(cellMap, sourceKeys, sourceCells, descriptor);
		} else {
			addOrthogonalCells(cellMap, sourceKeys, sourceCells, descriptor);
		}
	};

	var getAffectedCells = function (weapon, occupiedSourceCells, rotation) {
		var sourceCells = normalizeSourceCells(occupiedSourceCells);
		if (!sourceCells.length) return [];
		var sourceKeys = {};
		sourceCells.forEach(function (cell) { sourceKeys[cell[0] + "," + cell[1]] = true; });
		var cellMap = {};
		collectSpatialRules(weapon || {}).forEach(function (descriptor) {
			descriptor = Object.assign({}, descriptor, {
				condition: rotateSpatialCondition(descriptor.condition, rotation)
			});
			if (descriptor.kind === "combat") {
				addCombatNearbyCells(cellMap, sourceKeys, sourceCells, descriptor);
			} else if (descriptor.condition && descriptor.condition.relation === "sideBox") {
				addSideBoxCells(cellMap, sourceKeys, sourceCells, descriptor);
			} else {
				addOrthogonalCells(cellMap, sourceKeys, sourceCells, descriptor);
			}
		});
		return Object.keys(cellMap).map(function (key) { return cellMap[key]; }).sort(function (left, right) {
			return left.row - right.row || left.col - right.col;
		});
	};

	return {
		getAffectedCells: getAffectedCells,
		collectSpatialRules: collectSpatialRules,
		normalizeRotation: normalizeRotation,
		rotateDirection: rotateDirection,
		rotateDirections: rotateDirections,
		rotateSpatialCondition: rotateSpatialCondition
	};
})();
