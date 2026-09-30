"use strict";
const assert = require("node:assert/strict");

module.exports = function webpSize(buffer) {
    assert.equal(buffer.toString("ascii", 0, 4), "RIFF");
    assert.equal(buffer.toString("ascii", 8, 12), "WEBP");
    for (let offset = 12; offset + 8 <= buffer.length;) {
        const type = buffer.toString("ascii", offset, offset + 4);
        const size = buffer.readUInt32LE(offset + 4), data = offset + 8;
        if (type === "VP8X") return [buffer.readUIntLE(data + 4, 3) + 1, buffer.readUIntLE(data + 7, 3) + 1];
        if (type === "VP8L") {
            const bits = buffer.readUInt32LE(data + 1);
            return [(bits & 0x3fff) + 1, ((bits >>> 14) & 0x3fff) + 1];
        }
        if (type === "VP8 ") return [buffer.readUInt16LE(data + 6) & 0x3fff, buffer.readUInt16LE(data + 8) & 0x3fff];
        offset = data + size + (size & 1);
    }
    throw Error("缺少 WebP 尺寸数据");
};
