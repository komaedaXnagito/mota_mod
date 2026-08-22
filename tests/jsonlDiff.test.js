"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const diff = require("../jsonl-diff.js");

test("解析 JSONL 时忽略空行并保留无效行位置", () => {
	const parsed = diff.parseJsonl('{"id":1}\nBAD\n\n{"id":2}');
	assert.equal(parsed.records.length, 3);
	assert.equal(parsed.errors.length, 1);
	assert.equal(parsed.errors[0].line, 2);
});

test("结构化比较忽略对象字段顺序", () => {
	assert.equal(
		diff.stableStringify({ b: 2, nested: { y: 2, x: 1 }, a: 1 }),
		diff.stableStringify({ a: 1, nested: { x: 1, y: 2 }, b: 2 })
	);
});

test("按记录顺序比较并输出深层字段路径", () => {
	const result = diff.compareJsonl(
		'{"a":1,"nested":{"x":1}}\n{"z":3}',
		'{"nested":{"x":2},"a":1}\n{"z":3}',
		{ mode: "line" }
	);
	assert.deepEqual(result.summary, {
		total: 2,
		same: 1,
		modified: 1,
		leftOnly: 0,
		rightOnly: 0,
		errors: 0
	});
	assert.equal(result.rows[0].changes[0].path, "$.nested.x");
});

test("按唯一字段匹配允许记录重排并识别增删", () => {
	const result = diff.compareJsonl(
		'{"id":1,"value":1}\n{"id":2,"value":2}\n{"id":3}',
		'{"id":2,"value":4}\n{"id":1,"value":1}\n{"id":4}',
		{ mode: "key", keyPath: "id" }
	);
	assert.deepEqual(result.summary, {
		total: 4,
		same: 1,
		modified: 1,
		leftOnly: 1,
		rightOnly: 1,
		errors: 0
	});
});

test("字段路径支持嵌套对象并精确比较数组项", () => {
	const result = diff.compareJsonl(
		'{"meta":{"uuid":"a"},"items":[1,2]}',
		'{"meta":{"uuid":"a"},"items":[1,3,4]}',
		{ mode: "key", keyPath: "meta.uuid" }
	);
	assert.deepEqual(result.rows[0].changes.map((change) => change.path), ["$.items[1]", "$.items[2]"]);
});

test("缺失值不会与形似内部标记的真实对象混淆", () => {
	const changes = diff.diffValues({}, { value: { missing: true } });
	assert.equal(changes.length, 1);
	assert.equal(changes[0].path, "$.value");
	assert.equal(changes[0].type, "added");
});

test("忽略字段支持多种分隔符、JSONPath 前缀和规则去重", () => {
	assert.deepEqual(
		diff.normalizeIgnorePaths("updatedAt, $.meta.traceId；updatedAt\nitems[*].debug"),
		["updatedAt", "meta.traceId", "items[*].debug"]
	);
});

test("自定义忽略字段不参与一致性判断和字段差异", () => {
	const result = diff.compareJsonl(
		'{"id":1,"updatedAt":"old","meta":{"traceId":"a"},"value":10}',
		'{"id":1,"updatedAt":"new","meta":{"traceId":"b"},"value":11}',
		{ mode: "key", keyPath: "id", ignorePaths: "updatedAt, meta.traceId" }
	);
	assert.equal(result.summary.modified, 1);
	assert.deepEqual(result.rows[0].changes.map((change) => change.path), ["$.value"]);
	assert.deepEqual(result.ignorePaths, ["updatedAt", "meta.traceId"]);
});

test("数组通配符和任意层级通配符可以忽略成组字段", () => {
	const result = diff.compareJsonl(
		'{"id":1,"updatedAt":1,"items":[{"name":"a","debug":1},{"name":"b","debug":2}],"nested":{"updatedAt":2}}',
		'{"id":1,"updatedAt":9,"items":[{"name":"a","debug":8},{"name":"b","debug":7}],"nested":{"updatedAt":6}}',
		{ mode: "line", ignorePaths: ["items[*].debug", "**.updatedAt"] }
	);
	assert.equal(result.summary.same, 1);
	assert.equal(result.rows[0].changes.length, 0);
});

test("忽略父级路径会跳过其整棵子树", () => {
	const result = diff.compareJsonl(
		'{"id":1,"stats":{"atk":1,"nested":{"x":1}}}',
		'{"id":1,"stats":{"atk":9,"nested":{"x":8}}}',
		{ mode: "line", ignorePaths: "stats" }
	);
	assert.equal(result.summary.same, 1);
});

test("无效的空路径规则不会忽略整条记录", () => {
	const result = diff.compareJsonl('{"value":1}', '{"value":2}', { mode: "line", ignorePaths: "." });
	assert.equal(result.summary.modified, 1);
	assert.deepEqual(result.ignorePaths, []);
});

test("缺少匹配字段和无效 JSON 会计入问题数", () => {
	const missing = diff.compareJsonl('{"name":"x"}', "", { mode: "key", keyPath: "id" });
	const invalid = diff.compareJsonl("BAD", "", { mode: "line" });
	assert.equal(missing.summary.errors, 1);
	assert.match(missing.rows[0].issues[0], /缺少匹配字段/);
	assert.equal(invalid.summary.errors, 1);
	assert.equal(invalid.rows[0].status, "error");
});
