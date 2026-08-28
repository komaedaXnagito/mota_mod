/**
 * 武器合成配方表（背包乱斗合成系统的唯一配方源）。
 *
 * 使用方法：
 * 1. 打开本文件，在 recipes 数组中按下面的格式添加配方（JSON）。
 * 2. a / b：两把原料武器的 ID（即 project/weapons.js 中 weaponDefinitions 的键，如 "I372"）。
 *    顺序不敏感：a+b 与 b+a 视为同一配方，无需重复写两条。
 *    a 可以等于 b（表示"两把相同的武器合成"）。
 * 3. result：合成结果武器的 ID（同样必须是 weapons.js 中存在的键）。
 * 4. 合成不收取费用；合成后消耗两把原料，获得一把全新的结果武器（自动摆放入背包）。
 * 5. 如何查看武器 ID：打开 project/weapons.js，每条武器的键（如 "I372": {...}）就是它的 ID。
 *
 * 示例（可直接用于测试，均为真实存在的武器）：
 *   - 薛定谔(I372) + 远走高飞(I404) → 手甲(I500)
 *   - 薛定谔(I372) + 薛定谔(I372) → 钢制战斧(I501)
 * 将下面的示例替换/追加为你自己的配方即可。
 */
var weaponRecipes_7f2e9c4a_3b5d_4f8a_9c1e_6d4b8a2f9c31 = {
	"version": 2,
	"displayNames": {
		
	},
	"recipes": [
		{ "id": "r_example_1", "a": "I510", "b": "I510", "result": "I414" },
		{ "id": "r_example_2", "a": "I414", "b": "I576", "result": "I428" },
		{ "id": "r_example_3", "a": "I537", "b": "I548", "result": "I416" },
		{ "id": "r_example_4", "a": "I542", "b": "I573", "result": "I415" },
		{ "id": "r_example_5", "a": "I509", "b": "I598", "result": "I421" },
		{ "id": "r_example_6", "a": "I527", "b": "I372", "result": "I405" },
		{ "id": "r_example_7", "a": "I538", "b": "I576", "result": "I425" },
		{ "id": "r_example_8", "a": "I582", "b": "I419", "result": "I410" },
		{ "id": "r_example_9", "a": "I582", "b": "I387", "result": "I411" },
		{ "id": "r_example_10", "a": "I508", "b": "I593", "result": "I418" },
		{ "id": "r_example_11", "a": "I512", "b": "I556", "result": "I389" },
		{ "id": "r_example_12", "a": "I549", "b": "I514", "result": "I409" },
		{ "id": "r_example_13", "a": "I602", "b": "I514", "result": "I409" },
		{ "id": "r_example_14", "a": "I603", "b": "I514", "result": "I409" },
		{ "id": "r_example_15", "a": "I604", "b": "I514", "result": "I409" },
		{ "id": "r_example_16", "a": "I605", "b": "I514", "result": "I409" },
		{ "id": "r_example_17", "a": "I549", "b": "I544", "result": "I409" },
		{ "id": "r_example_18", "a": "I602", "b": "I544", "result": "I409" },
		{ "id": "r_example_19", "a": "I603", "b": "I544", "result": "I409" },
		{ "id": "r_example_20", "a": "I604", "b": "I544", "result": "I409" },
		{ "id": "r_example_21", "a": "I605", "b": "I544", "result": "I409" },
		{ "id": "r_example_22", "a": "I555", "b": "I544", "result": "I408" },
		{ "id": "r_example_23", "a": "I555", "b": "I514", "result": "I408" },
		{ "id": "r_example_24", "a": "I583", "b": "I523", "result": "I404" },
		{ "id": "r_example_25", "a": "I526", "b": "I523", "result": "I397" },
		{ "id": "r_example_26", "a": "I592", "b": "I565", "result": "I426" },
		{ "id": "r_example_27", "a": "I531", "b": "I531", "result": "I424" },
		{ "id": "r_example_28", "a": "I530", "b": "I530", "result": "I400" },
		{ "id": "r_example_29", "a": "I547", "b": "I576", "result": "I427" },
		{ "id": "r_example_30", "a": "I533", "b": "I533", "result": "I419" },
		{ "id": "r_example_31", "a": "I505", "b": "I595", "result": "I396" },
		{ "id": "r_example_32", "a": "I591", "b": "I565", "result": "I402" },
		{ "id": "r_example_33", "a": "I502", "b": "I502", "result": "I388" },
		{ "id": "r_example_34", "a": "I388", "b": "I557", "result": "I393" },
		{ "id": "r_example_35", "a": "I501", "b": "I555", "result": "I384" },
		{ "id": "r_example_36", "a": "I501", "b": "I550", "result": "I420" },
		{ "id": "r_example_37", "a": "I501", "b": "I525", "result": "I423" },
		{ "id": "r_example_38", "a": "I541", "b": "I581", "result": "I417" },
		{ "id": "r_example_39", "a": "I506", "b": "I506", "result": "I398" },
		{ "id": "r_example_40", "a": "I590", "b": "I515", "result": "I422" },
		{ "id": "r_example_41", "a": "I590", "b": "I545", "result": "I422" },
		{ "id": "r_example_42", "a": "I590", "b": "I550", "result": "I422" },
		{ "id": "r_example_43", "a": "I590", "b": "I555", "result": "I422" },
		{ "id": "r_example_44", "a": "I590", "b": "I525", "result": "I422" },
		{ "id": "r_example_45", "a": "I590", "b": "I595", "result": "I422" },
		{ "id": "r_example_46", "a": "I504", "b": "I545", "result": "I386" },
		{ "id": "r_example_47", "a": "I585", "b": "I511", "result": "I399" },
		{ "id": "r_example_48", "a": "I532", "b": "I565", "result": "I394" },
		{ "id": "r_example_49", "a": "I394", "b": "I576", "result": "I390" },
		{ "id": "r_example_50", "a": "I507", "b": "I507", "result": "I387" },
		{ "id": "r_example_51", "a": "I561", "b": "I575", "result": "I395" },
		{ "id": "r_example_52", "a": "I515", "b": "I500", "result": "I401" },
		{ "id": "r_example_53", "a": "I534", "b": "I534", "result": "I391" },
		{ "id": "r_example_54", "a": "I589", "b": "I589", "result": "I406" },
		{ "id": "r_example_55", "a": "I587", "b": "I523", "result": "I403" },
		{ "id": "r_example_56", "a": "I426", "b": "I576", "result": "I407" },
		{ "id": "r_example_57", "a": "I406", "b": "I517", "result": "I606" },
		{ "id": "r_example_58", "a": "I406", "b": "I606", "result": "I607" },
		{ "id": "r_example_59", "a": "I406", "b": "I607", "result": "I608" },
		{ "id": "r_example_60", "a": "I406", "b": "I608", "result": "I609" },
		{ "id": "r_example_61", "a": "I406", "b": "I549", "result": "I602" },
		{ "id": "r_example_62", "a": "I406", "b": "I602", "result": "I603" },
		{ "id": "r_example_63", "a": "I406", "b": "I603", "result": "I604" },
		{ "id": "r_example_64", "a": "I406", "b": "I604", "result": "I605" },
		{ "id": "r_example_65", "a": "I406", "b": "I553", "result": "I610" },
		{ "id": "r_example_66", "a": "I406", "b": "I610", "result": "I611" },
		{ "id": "r_example_67", "a": "I406", "b": "I611", "result": "I612" },
		{ "id": "r_example_68", "a": "I406", "b": "I612", "result": "I613" },
		{ "id": "r_example_68", "a": "I406", "b": "I571", "result": "I614" },
		{ "id": "r_example_68", "a": "I406", "b": "I614", "result": "I615" },
		{ "id": "r_example_68", "a": "I406", "b": "I615", "result": "I616" },
		{ "id": "r_example_68", "a": "I406", "b": "I616", "result": "I617" },
		{ "id": "r_example_69", "a": "I600", "b": "I601", "result": "I558" },
		{ "id": "r_example_70", "a": "I400", "b": "I564", "result": "I413" },
		{ "id": "r_example_71", "a": "I400", "b": "I578", "result": "I413" },
		{ "id": "r_example_72", "a": "I402", "b": "I518", "result": "I412" },
		{ "id": "r_example_73", "a": "I402", "b": "I520", "result": "I412" },
		{ "id": "r_example_74", "a": "I402", "b": "I557", "result": "I412" },
		{ "id": "r_example_75", "a": "I402", "b": "I564", "result": "I412" },
		{ "id": "r_example_76", "a": "I402", "b": "I578", "result": "I412" },
		{ "id": "r_example_77", "a": "I402", "b": "I597", "result": "I412" },
	]
};
