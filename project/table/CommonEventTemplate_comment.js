var CommonEventTemplate_comment = {
	"_type": "object",
	"_data": {
		"CommonEventTemplate": {
			"_type": "object",
			"_data": function (key) {
				var obj = {
					"检测音乐如果没有开启则系统提示开启": {
						"_leaf": true,
						"_type": "event",
						"_event": "commonEvent",
						"_data": "检测音乐如果没有开启则系统提示开启"
					},
					"仿新新魔塔一次性商人": {
						"_leaf": true,
						"_type": "event",
						"_event": "commonEvent",
						"_data": "仿新新魔塔一次性商人"
					},
					"全地图选中一个点": {
						"_leaf": true,
						"_type": "event",
						"_event": "commonEvent",
						"_data": "全地图选中一个点"
					},
					"多阶段Boss战斗": {
						"_leaf": true,
						"_type": "event",
						"_event": "commonEvent",
						"_data": "多阶段Boss战斗"
					},
					"阿狸的音乐盒": {
						"_leaf": true,
						"_type": "event",
						"_event": "commonEvent",
						"_data": "阿狸的音乐盒"
					},
				}
				if (obj[key]) return obj[key];
				return {
					"_leaf": true,
					"_type": "event",
					"_event": "commonEvent",
					"_data": "常見事件模板"
				}
			}
		}
	}
}