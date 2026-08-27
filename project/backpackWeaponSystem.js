/** 武器定义、旋转、占格与布局联动计算的独立安装器。 */
var installBackpackWeaponSystem_41d4dd44_8f7d_4bbc_b890_80db42f1ad76 = function (core, plugin) {
	"use strict";
	return (function () {
	// 武器系统只管理“武器是什么、如何旋转、如何计算属性与联动”。
	// 它不读取背包存档、不创建界面，也不决定武器能否放进某个背包格。

	/**
	 * 深拷贝武器配置，防止调用方修改返回值时污染原始道具表。
	 * @param {*} sourceData 需要复制的数据。
	 * @returns {*} 与输入内容相同、引用独立的副本。
	 */
	const cloneWeaponData = function (sourceData) {
		if (sourceData == null) return sourceData;
		if (core.clone) return core.clone(sourceData);
		return JSON.parse(JSON.stringify(sourceData));
	};

	// 所有武器配置统一维护在 project/weapons.js；此处只读取，不再保存属性副本。
	const WEAPON_DEFINITIONS = weaponDefinitions_9f2e6f5b_4b2c_4f8c_9a3d_7e1b6c0d5a44;
	const WEAPON_SYNERGY_RANGE = backpackWeaponSynergy_91f4c21e_7d37_4f12_9cc4_a9606ba62a83;

	/** 按中央定义 ID 读取完整武器定义，并把稳定 ID 带到运行时副本上。 */
	const getWeaponDefinition = function (definitionId) {
		definitionId = definitionId == null ? "" : String(definitionId);
		const sourceDefinition = WEAPON_DEFINITIONS[definitionId];
		if (!sourceDefinition) return null;
		const definition = cloneWeaponData(sourceDefinition);
		definition.definitionId = definitionId;
		return definition;
	};

	/** 地图道具 ID 允许通过 backpackWeaponId 指向另一条中央武器定义。 */
	const resolveDirectDefinitionId = function (candidateId) {
		if (candidateId == null || candidateId === "") return null;
		candidateId = String(candidateId);
		if (WEAPON_DEFINITIONS[candidateId]) return candidateId;
		const item = core.material && core.material.items && core.material.items[candidateId];
		const mappedId = item && item.backpackWeaponId;
		return mappedId && WEAPON_DEFINITIONS[mappedId] ? String(mappedId) : null;
	};

	/** 旧存档缺少 definitionId 时，只用 id/name/sourceName 等身份字段反查唯一中央定义。 */
	const findUniqueDefinitionIdByIdentity = function (propertyName, identityValue) {
		if (identityValue == null || identityValue === "") return null;
		identityValue = String(identityValue);
		let matchedId = null;
		const definitionIds = Object.keys(WEAPON_DEFINITIONS);
		for (let index = 0; index < definitionIds.length; index++) {
			const definitionId = definitionIds[index];
			const definition = WEAPON_DEFINITIONS[definitionId];
			if (!definition || String(definition[propertyName]) !== identityValue) continue;
			if (matchedId) return null;
			matchedId = definitionId;
		}
		return matchedId;
	};

	/**
	 * 将新存档 ID、地图物品 ID或旧版完整武器对象解析成中央定义 ID。
	 * 这里只读取身份字段，绝不比较或采用旧对象中的伤害、间隔、联动和战斗规则。
	 */
	const resolveWeaponDefinitionId = function (weaponOrId) {
		if (weaponOrId == null) return null;
		if (typeof weaponOrId === "string" || typeof weaponOrId === "number") {
			return resolveDirectDefinitionId(weaponOrId);
		}
		if (typeof weaponOrId !== "object") return null;
		const directCandidates = [
			weaponOrId.definitionId,
			weaponOrId.weaponDefinitionId,
			weaponOrId.backpackWeaponId,
			weaponOrId.itemId,
			weaponOrId.sourceItemId
		];
		for (let index = 0; index < directCandidates.length; index++) {
			const resolvedId = resolveDirectDefinitionId(directCandidates[index]);
			if (resolvedId) return resolvedId;
		}
		if (weaponOrId.weapon && typeof weaponOrId.weapon === "object") {
			const nestedId = resolveWeaponDefinitionId(weaponOrId.weapon);
			if (nestedId) return nestedId;
		}
		return findUniqueDefinitionIdByIdentity("id", weaponOrId.id)
			|| findUniqueDefinitionIdByIdentity("name", weaponOrId.name)
			|| findUniqueDefinitionIdByIdentity("sourceName", weaponOrId.sourceName);
	};

	/**
	 * 将中央定义挂到运行时道具对象上，兼容引擎既有的 backpackWeapon 判断。
	 * 这里只创建运行时副本；可编辑的源数据仍然只有 project/weapons.js 一份。
	 */
	const applyWeaponDefinitions = function () {
		Object.keys(core.material.items || {}).forEach(function (itemId) {
			const itemDefinition = core.material.items[itemId];
			if (!itemDefinition || !itemDefinition.backpackWeaponId) return;
			const weaponDefinition = getWeaponDefinition(itemDefinition.backpackWeaponId);
			if (!weaponDefinition) {
				console.error("找不到武器定义：" + itemDefinition.backpackWeaponId);
				return;
			}
			itemDefinition.backpackWeapon = weaponDefinition;
		});
	};

	/** 把任意角度吸附为 0/90/180/270 四种背包旋转角。 */
	const normalizeWeaponRotation = function (rotation) {
		rotation = Number(rotation) || 0;
		rotation = Math.round(rotation / 90) * 90;
		return ((rotation % 360) + 360) % 360;
	};

	/** 去重并平移格子坐标，让武器左上角始终从 [0,0] 开始。 */
	const normalizeWeaponCells = function (sourceCells) {
		if (!Array.isArray(sourceCells)) return [];
		const normalizedCells = [];
		const usedCellKeys = {};
		sourceCells.forEach(function (sourceCell) {
			if (!Array.isArray(sourceCell) || sourceCell.length < 2) return;
			const cellX = Math.floor(Number(sourceCell[0]));
			const cellY = Math.floor(Number(sourceCell[1]));
			if (!Number.isFinite(cellX) || !Number.isFinite(cellY)) return;
			const key = cellX + "," + cellY;
			if (usedCellKeys[key]) return;
			usedCellKeys[key] = true;
			normalizedCells.push([cellX, cellY]);
		});
		if (!normalizedCells.length) return [];
		const minimumX = Math.min.apply(null, normalizedCells.map(function (cell) { return cell[0]; }));
		const minimumY = Math.min.apply(null, normalizedCells.map(function (cell) { return cell[1]; }));
		return normalizedCells
			.map(function (cell) { return [cell[0] - minimumX, cell[1] - minimumY]; })
			.sort(function (leftCell, rightCell) {
				return leftCell[1] - rightCell[1] || leftCell[0] - rightCell[0];
			});
	};

	/** 把 items.js 中的二维 0/1 形状矩阵转换为坐标数组。 */
	const weaponMatrixToCells = function (shapeMatrix) {
		if (!Array.isArray(shapeMatrix)) return [];
		const occupiedCells = [];
		shapeMatrix.forEach(function (matrixRow, rowIndex) {
			if (!Array.isArray(matrixRow)) return;
			matrixRow.forEach(function (isOccupied, columnIndex) {
				if (isOccupied) occupiedCells.push([columnIndex, rowIndex]);
			});
		});
		return occupiedCells;
	};

	/** 校验并统一武器定义，供新实例、旧存档和外部 API 共用。 */
	const normalizeWeaponDefinition = function (sourceWeapon) {
		if (!sourceWeapon || typeof sourceWeapon !== "object") return null;
		const occupiedCells = normalizeWeaponCells(
			Array.isArray(sourceWeapon.cells)
				? sourceWeapon.cells
				: weaponMatrixToCells(sourceWeapon.shape || sourceWeapon.size)
		);
		if (!occupiedCells.length) return null;
		const normalizedWeapon = {
			id: sourceWeapon.id == null ? "weapon_" + Date.now().toString(36) : String(sourceWeapon.id),
			name: String(sourceWeapon.name || "未命名物品"),
			image: String(sourceWeapon.image || ""),
			cells: occupiedCells
		};
		[
			"rarity", "minAttack", "maxAttack", "hitRate", "attackInterval", "ultimateGain",
			"defense", "attackSpeed", "critRate",
			"description", "definitionId", "sourceItemId", "sourceName", "uniqueKey", "imageCrop",
			"weaponTypes", "synergyText", "synergyRules", "combatRules"
		].forEach(function (optionalPropertyName) {
			if (Object.prototype.hasOwnProperty.call(sourceWeapon, optionalPropertyName)) {
				normalizedWeapon[optionalPropertyName] = cloneWeaponData(sourceWeapon[optionalPropertyName]);
			}
		});
		// 兼容旧存档和外部脚本传入的单值 attack：迁移成上下限相同的伤害区间。
		if (!Object.prototype.hasOwnProperty.call(sourceWeapon, "minAttack")
			&& !Object.prototype.hasOwnProperty.call(sourceWeapon, "maxAttack")
			&& sourceWeapon.attack != null) {
			normalizedWeapon.minAttack = Number(sourceWeapon.attack);
			normalizedWeapon.maxAttack = Number(sourceWeapon.attack);
		}
		return normalizedWeapon;
	};

	/** 根据指定旋转角返回武器实际占用的相对格子。 */
	const getRotatedWeaponCells = function (weaponDefinition, rotation) {
		let rotatedCells = normalizeWeaponCells(weaponDefinition.cells);
		const clockwiseQuarterTurns = normalizeWeaponRotation(rotation) / 90;
		for (let turnIndex = 0; turnIndex < clockwiseQuarterTurns; turnIndex++) {
			const maximumY = Math.max.apply(null, rotatedCells.map(function (cell) { return cell[1]; }));
			rotatedCells = normalizeWeaponCells(rotatedCells.map(function (cell) {
				return [maximumY - cell[1], cell[0]];
			}));
		}
		return rotatedCells;
	};

	/** 返回旋转后武器的占用格、宽度和高度。 */
	const getWeaponBounds = function (weaponDefinition, rotation) {
		const occupiedCells = getRotatedWeaponCells(weaponDefinition, rotation);
		return {
			cells: occupiedCells,
			cols: Math.max.apply(null, occupiedCells.map(function (cell) { return cell[0]; })) + 1,
			rows: Math.max.apply(null, occupiedCells.map(function (cell) { return cell[1]; })) + 1
		};
	};

	/** 把实例的相对形状换算成背包中的绝对格子坐标。 */
	const getOccupiedWeaponCells = function (weaponEntry, column, row, rotation) {
		return getRotatedWeaponCells(
			weaponEntry.weapon,
			rotation == null ? weaponEntry.rotation : rotation
		).map(function (relativeCell) {
			return [
				(column == null ? weaponEntry.col : column) + relativeCell[0],
				(row == null ? weaponEntry.row : row) + relativeCell[1]
			];
		});
	};

	/** 返回某个已摆放武器按结构化联动规则可影响的绝对背包格。 */
	const getWeaponSynergyCells = function (weaponEntry) {
		if (!weaponEntry || !weaponEntry.weapon) return [];
		return WEAPON_SYNERGY_RANGE.getAffectedCells(
			weaponEntry.weapon,
			getOccupiedWeaponCells(weaponEntry),
			weaponEntry.rotation
		);
	};

	/** 返回实例的武器类型数组；缺失时返回空数组。 */
	const getWeaponTypes = function (weaponEntry) {
		return Array.isArray(weaponEntry.weapon.weaponTypes)
			? weaponEntry.weapon.weaponTypes.map(String)
			: [];
	};

	/** 读取武器伤害上下限；旧版单值 attack 会自动视为固定伤害。 */
	const getWeaponDamageRange = function (weaponDefinition) {
		weaponDefinition = weaponDefinition || {};
		let minimumAttack = weaponDefinition.minAttack == null ? NaN : Number(weaponDefinition.minAttack);
		let maximumAttack = weaponDefinition.maxAttack == null ? NaN : Number(weaponDefinition.maxAttack);
		if (!Number.isFinite(minimumAttack) && !Number.isFinite(maximumAttack)
			&& weaponDefinition.attack != null) {
			minimumAttack = maximumAttack = Number(weaponDefinition.attack);
		}
		if (!Number.isFinite(minimumAttack) && Number.isFinite(maximumAttack)) minimumAttack = maximumAttack;
		if (!Number.isFinite(maximumAttack) && Number.isFinite(minimumAttack)) maximumAttack = minimumAttack;
		if (!Number.isFinite(minimumAttack) || !Number.isFinite(maximumAttack)) {
			return { minAttack: null, maxAttack: null, averageAttack: 0 };
		}
		minimumAttack = Math.max(0, minimumAttack);
		maximumAttack = Math.max(0, maximumAttack);
		if (minimumAttack > maximumAttack) {
			const temporaryAttack = minimumAttack;
			minimumAttack = maximumAttack;
			maximumAttack = temporaryAttack;
		}
		return {
			minAttack: minimumAttack,
			maxAttack: maximumAttack,
			// 经典魔塔战斗仍使用确定值：保持原逻辑，取伤害区间平均值并向上取整。
			averageAttack: Math.ceil((minimumAttack + maximumAttack) / 2)
		};
	};

	/** 判断一个实例是否满足联动规则中的 ID、类型或攻击条件。 */
	const matchesWeaponFilter = function (weaponEntry, weaponFilter) {
		weaponFilter = weaponFilter || {};
		if (Array.isArray(weaponFilter.itemIds)
			&& weaponFilter.itemIds.indexOf(weaponEntry.weapon.sourceItemId) < 0) return false;
		if (Array.isArray(weaponFilter.weaponIds)
			&& weaponFilter.weaponIds.indexOf(weaponEntry.weapon.id) < 0) return false;
		if (Array.isArray(weaponFilter.weaponTypes)) {
			const entryWeaponTypes = getWeaponTypes(weaponEntry);
			if (!weaponFilter.weaponTypes.some(function (type) {
				return entryWeaponTypes.indexOf(type) >= 0;
			})) return false;
		}
		const hasAttack = Number(getWeaponDamageRange(weaponEntry.weapon).maxAttack) > 0;
		if (weaponFilter.hasAttack === true && !hasAttack) return false;
		if (weaponFilter.hasAttack === false && hasAttack) return false;
		return true;
	};

	/** 判断两个格子的位移是否落在指定方向和距离内。 */
	const matchesDirection = function (deltaX, deltaY, direction, maximumDistance) {
		if (direction === "left") return deltaY === 0 && deltaX < 0 && -deltaX <= maximumDistance;
		if (direction === "right") return deltaY === 0 && deltaX > 0 && deltaX <= maximumDistance;
		if (direction === "up") return deltaX === 0 && deltaY < 0 && -deltaY <= maximumDistance;
		if (direction === "down") return deltaX === 0 && deltaY > 0 && deltaY <= maximumDistance;
		return false;
	};

	/** 判断目标是否位于来源武器某一侧的矩形扫描区域内。 */
	const isTargetInSideBox = function (sourceEntry, targetEntry, condition) {
		const sourceCells = getOccupiedWeaponCells(sourceEntry);
		const targetCells = getOccupiedWeaponCells(targetEntry);
		const minimumX = Math.min.apply(null, sourceCells.map(function (cell) { return cell[0]; }));
		const maximumX = Math.max.apply(null, sourceCells.map(function (cell) { return cell[0]; }));
		const minimumY = Math.min.apply(null, sourceCells.map(function (cell) { return cell[1]; }));
		const maximumY = Math.max.apply(null, sourceCells.map(function (cell) { return cell[1]; }));
		const scanDistance = Math.max(1, Math.floor(Number(condition.distance) || 1));
		const scanSpan = Math.max(1, Math.floor(Number(condition.span) || scanDistance));
		const scanDirections = condition.directions || ["up", "down", "left", "right"];
		return targetCells.some(function (targetCell) {
			return scanDirections.some(function (direction) {
				if (direction === "left" || direction === "right") {
					const verticalCenter = (minimumY + maximumY) / 2;
					const firstRow = Math.floor(verticalCenter - (scanSpan - 1) / 2);
					const isInsideRows = targetCell[1] >= firstRow && targetCell[1] < firstRow + scanSpan;
					return isInsideRows && (direction === "left"
						? targetCell[0] < minimumX && targetCell[0] >= minimumX - scanDistance
						: targetCell[0] > maximumX && targetCell[0] <= maximumX + scanDistance);
				}
				const horizontalCenter = (minimumX + maximumX) / 2;
				const firstColumn = Math.floor(horizontalCenter - (scanSpan - 1) / 2);
				const isInsideColumns = targetCell[0] >= firstColumn && targetCell[0] < firstColumn + scanSpan;
				return isInsideColumns && (direction === "up"
					? targetCell[1] < minimumY && targetCell[1] >= minimumY - scanDistance
					: targetCell[1] > maximumY && targetCell[1] <= maximumY + scanDistance);
			});
		});
	};

	/** 判断两个武器是否满足 orthogonal 或 sideBox 空间关系。 */
	const matchesSpatialCondition = function (sourceEntry, targetEntry, condition) {
		const rotatedCondition = WEAPON_SYNERGY_RANGE.rotateSpatialCondition(condition, sourceEntry.rotation);
		if (rotatedCondition.relation === "sideBox") {
			return isTargetInSideBox(sourceEntry, targetEntry, rotatedCondition);
		}
		const maximumDistance = Math.max(1, Math.floor(Number(rotatedCondition.distance) || 1));
		const directions = rotatedCondition.directions;
		const sourceCells = getOccupiedWeaponCells(sourceEntry);
		const targetCells = getOccupiedWeaponCells(targetEntry);
		return sourceCells.some(function (sourceCell) {
			return targetCells.some(function (targetCell) {
				const deltaX = targetCell[0] - sourceCell[0];
				const deltaY = targetCell[1] - sourceCell[1];
				return directions.some(function (direction) {
					return matchesDirection(deltaX, deltaY, direction, maximumDistance);
				});
			});
		});
	};

	/** 按点号路径读取战斗上下文，例如 enemy.burn。 */
	const getWeaponContextValue = function (context, propertyPath) {
		return String(propertyPath || "").split(".").filter(Boolean).reduce(function (currentValue, propertyName) {
			return currentValue == null ? undefined : currentValue[propertyName];
		}, context);
	};

	/** 执行联动条件中的比较运算。 */
	const compareWeaponConditionValue = function (actualValue, operator, expectedValue) {
		if (operator === "gt") return actualValue > expectedValue;
		if (operator === "gte") return actualValue >= expectedValue;
		if (operator === "lt") return actualValue < expectedValue;
		if (operator === "lte") return actualValue <= expectedValue;
		if (operator === "neq") return actualValue !== expectedValue;
		if (operator === "in") return Array.isArray(expectedValue) && expectedValue.indexOf(actualValue) >= 0;
		return actualValue === expectedValue;
	};

	/** 计算单条联动条件，并返回是否通过及匹配到的武器。 */
	const evaluateWeaponCondition = function (sourceEntry, condition, placedEntries, context) {
		if (condition.kind === "context") {
			const actualValue = getWeaponContextValue(context, condition.path);
			return {
				passed: compareWeaponConditionValue(actualValue, condition.operator || "eq", condition.value),
				matches: [],
				value: actualValue
			};
		}
		const shouldIncludeSource = condition.includeSelf === true;
		const matchingEntries = placedEntries.filter(function (candidateEntry) {
			if (!shouldIncludeSource && candidateEntry.instanceId === sourceEntry.instanceId) return false;
			if (!matchesWeaponFilter(candidateEntry, condition.filter)) return false;
			if (condition.kind === "nearby") {
				return matchesSpatialCondition(sourceEntry, candidateEntry, condition);
			}
			return condition.kind === "count";
		});
		const minimumMatches = condition.min == null ? 1 : Number(condition.min);
		const maximumMatches = condition.max == null ? Infinity : Number(condition.max);
		return {
			passed: matchingEntries.length >= minimumMatches && matchingEntries.length <= maximumMatches,
			matches: matchingEntries,
			value: matchingEntries.length
		};
	};

	/** 根据匹配数量或战斗上下文计算一条效果应该叠加几次。 */
	const getWeaponEffectStacks = function (effect, conditionResults, context) {
		let stackCount = 1;
		if (effect.perMatch) {
			const matchingCondition = conditionResults[effect.conditionId];
			stackCount = matchingCondition ? matchingCondition.matches.length : 0;
		}
		if (effect.stacksFrom && effect.stacksFrom.kind === "matchCount") {
			const matchingCondition = conditionResults[effect.stacksFrom.conditionId || effect.conditionId];
			const matchingCount = matchingCondition ? matchingCondition.matches.length : 0;
			const matchDivisor = Math.max(1, Math.floor(Number(effect.stacksFrom.divisor) || 1));
			stackCount = Math.floor(matchingCount / matchDivisor);
		}
		if (effect.stacksFrom && effect.stacksFrom.kind === "contextFloor") {
			const contextNumber = Number(getWeaponContextValue(context, effect.stacksFrom.path)) || 0;
			const stackDivisor = Math.max(1, Number(effect.stacksFrom.divisor) || 1);
			stackCount = Math.floor(contextNumber / stackDivisor);
		}
		if (effect.maxStacks != null) stackCount = Math.min(stackCount, Number(effect.maxStacks));
		return Math.max(0, stackCount);
	};

	/** 把可空的表格数值标准化为 number 或 null。 */
	const normalizeOptionalWeaponNumber = function (value) {
		if (value == null || value === "") return null;
		const numericValue = Number(value);
		return Number.isFinite(numericValue) ? numericValue : null;
	};

	/** 将联动效果应用到计算属性；旧规则中的 attack 同时修改伤害上下限。 */
	const applyCalculatedWeaponEffect = function (attributes, stat, operation, effectValue, stackCount) {
		const targetStats = stat === "attack" ? ["minAttack", "maxAttack"] : [stat];
		targetStats.forEach(function (targetStat) {
			const valueBeforeEffect = Number(attributes[targetStat]) || 0;
			if (operation === "multiply") {
				attributes[targetStat] = valueBeforeEffect * Math.pow(effectValue, stackCount);
			} else if (operation === "set") {
				attributes[targetStat] = effectValue;
			} else {
				attributes[targetStat] = valueBeforeEffect + effectValue * stackCount;
			}
		});
		if (stat === "attack" || stat === "minAttack" || stat === "maxAttack") {
			attributes.attack = getWeaponDamageRange(attributes).averageAttack;
		}
	};

	/**
	 * 计算已摆放武器的最终属性。每条规则的 conditions 使用 AND；effects 可作用于
	 * 自身、条件匹配对象或全部武器。函数只读输入，不修改背包状态或勇士属性。
	 */
	const calculateWeaponAttributes = function (placedEntries, options) {
		options = options || {};
		const calculationContext = Object.assign({ trigger: "layout" }, options.context || {});
		const safePlacedEntries = Array.isArray(placedEntries) ? placedEntries.slice() : [];
		const attributesByInstanceId = {};
		safePlacedEntries.forEach(function (weaponEntry) {
			const baseDamageRange = getWeaponDamageRange(weaponEntry.weapon);
			attributesByInstanceId[weaponEntry.instanceId] = {
				instanceId: weaponEntry.instanceId,
				sourceItemId: weaponEntry.weapon.sourceItemId || null,
				name: weaponEntry.weapon.name,
				sourceName: weaponEntry.weapon.sourceName || weaponEntry.weapon.name,
				rarity: weaponEntry.weapon.rarity == null ? null : Number(weaponEntry.weapon.rarity),
				weaponTypes: getWeaponTypes(weaponEntry),
				baseMinAttack: baseDamageRange.minAttack,
				baseMaxAttack: baseDamageRange.maxAttack,
				minAttack: baseDamageRange.minAttack,
				maxAttack: baseDamageRange.maxAttack,
				// attack 保留为经典魔塔战斗兼容值，由上下限平均后向上取整得到。
				baseAttack: baseDamageRange.averageAttack,
				attack: baseDamageRange.averageAttack,
				baseHitRate: normalizeOptionalWeaponNumber(weaponEntry.weapon.hitRate),
				hitRate: normalizeOptionalWeaponNumber(weaponEntry.weapon.hitRate),
				baseAttackInterval: normalizeOptionalWeaponNumber(weaponEntry.weapon.attackInterval),
				attackInterval: normalizeOptionalWeaponNumber(weaponEntry.weapon.attackInterval),
				baseUltimateGain: normalizeOptionalWeaponNumber(weaponEntry.weapon.ultimateGain),
				ultimateGain: normalizeOptionalWeaponNumber(weaponEntry.weapon.ultimateGain),
				bonuses: []
			};
		});

		safePlacedEntries.forEach(function (sourceEntry) {
			const synergyRules = Array.isArray(sourceEntry.weapon.synergyRules)
				? sourceEntry.weapon.synergyRules
				: [];
			synergyRules.forEach(function (synergyRule) {
				if (synergyRule.trigger
					&& synergyRule.trigger !== "layout"
					&& synergyRule.trigger !== calculationContext.trigger) return;
				const conditionResults = {};
				const ruleConditions = Array.isArray(synergyRule.conditions) ? synergyRule.conditions : [];
				const allConditionsPassed = ruleConditions.every(function (condition, conditionIndex) {
					const conditionId = condition.id || "condition" + conditionIndex;
					conditionResults[conditionId] = evaluateWeaponCondition(
						sourceEntry,
						condition,
						safePlacedEntries,
						calculationContext
					);
					return conditionResults[conditionId].passed;
				});
				if (!allConditionsPassed) return;

				(synergyRule.effects || []).forEach(function (effect) {
					let recipientEntries = [];
					if (effect.target === "matches") {
						const matchingCondition = conditionResults[effect.conditionId];
						recipientEntries = matchingCondition ? matchingCondition.matches : [];
					} else if (effect.target === "all") {
						recipientEntries = safePlacedEntries.slice();
					} else {
						recipientEntries = [sourceEntry];
					}
					const stackCount = getWeaponEffectStacks(effect, conditionResults, calculationContext);
					const effectValue = Number(effect.value) || 0;
					recipientEntries.forEach(function (recipientEntry) {
						const recipientAttributes = attributesByInstanceId[recipientEntry.instanceId];
						if (!recipientAttributes || !effect.stat || stackCount <= 0) return;
						// 原始间隔为 0（含未配置）的物品不是主动攻击武器；布局加减间隔不能将其激活。
						if ((effect.stat === "attackInterval" || effect.stat === "attackIntervalTicks")
							&& !(Number(recipientAttributes.baseAttackInterval) > 0)) return;
						applyCalculatedWeaponEffect(
							recipientAttributes,
							effect.stat,
							effect.operation || "add",
							effectValue,
							stackCount
						);
						recipientAttributes.bonuses.push({
							sourceInstanceId: sourceEntry.instanceId,
							sourceName: sourceEntry.weapon.name,
							ruleId: synergyRule.id || "unnamedRule",
							stat: effect.stat,
							operation: effect.operation || "add",
							value: effectValue,
							stacks: stackCount
						});
					});
				});
			});
		});

		const calculatedEntries = safePlacedEntries.map(function (weaponEntry) {
			const attributes = attributesByInstanceId[weaponEntry.instanceId];
			// 主动武器的布局间隔最低为 0.1 回合（10 Tick）；原始 0 间隔永久锁定为 0。
			attributes.attackInterval = Number(attributes.baseAttackInterval) > 0
				? Math.max(0.1, Number(attributes.attackInterval) || 0)
				: 0;
			return attributes;
		});
		return {
			context: cloneWeaponData(calculationContext),
			entries: calculatedEntries,
			totalAttack: calculatedEntries.reduce(function (totalAttack, weaponAttributes) {
				return totalAttack + Math.max(0, Number(weaponAttributes.attack) || 0);
			}, 0),
			byInstanceId: attributesByInstanceId
		};
	};

	// 初始化时挂载运行时副本，保证后续背包插件和原有道具逻辑都能识别武器。
	applyWeaponDefinitions();

	// 对外只暴露武器领域 API；背包插件通过这个命名空间与武器系统对接。
	this.weaponSystem = {
		// 读取完整中央定义表或指定武器的安全副本。
		getDefinitions: function () { return cloneWeaponData(WEAPON_DEFINITIONS); },
		getDefinition: getWeaponDefinition,
		resolveDefinitionId: resolveWeaponDefinitionId,
		// 将中央定义重新挂载到 core.material.items。
		applyDefinitions: applyWeaponDefinitions,
		// 旧 API 保留为只读兼容别名，避免已有事件脚本失效。
		getMetadata: function () { return cloneWeaponData(WEAPON_DEFINITIONS); },
		applyMetadata: applyWeaponDefinitions,
		mergeMetadata: function (itemId, fallbackDefinition) {
			return getWeaponDefinition(itemId) || cloneWeaponData(fallbackDefinition || {});
		},
		// 标准化四向旋转角。
		normalizeRotation: normalizeWeaponRotation,
		// 标准化武器定义。
		normalizeWeapon: normalizeWeaponDefinition,
		// 读取旋转后的相对占格。
		getRotatedCells: getRotatedWeaponCells,
		// 读取旋转后的宽、高和占格。
		getBounds: getWeaponBounds,
		// 读取实例在背包中的绝对占格。
		getOccupiedCells: getOccupiedWeaponCells,
		// 读取结构化布局/战斗联动规则覆盖的绝对格子。
		getSynergyCells: getWeaponSynergyCells,
		// 读取实例类型数组。
		getWeaponTypes: getWeaponTypes,
		// 读取定义的伤害上下限和经典战斗兼容平均值。
		getDamageRange: getWeaponDamageRange,
		// 计算一组已摆放实例的最终属性与联动。
		calculateAttributes: calculateWeaponAttributes
	};
	}).call(plugin);
};
