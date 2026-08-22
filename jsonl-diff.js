(function (root, factory) {
  var core = factory();
  if (typeof module === "object" && module.exports) module.exports = core;
  root.JsonlDiffCore = core;
  if (typeof document !== "undefined") initApp(core);
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  var MISSING = { missing: true };
  var MAX_CHANGES = 250;

  function parseJsonl(text) {
    var cleanText = String(text || "").replace(/^\uFEFF/, "");
    var lines = cleanText.split(/\r?\n/);
    var records = [];
    var errors = [];

    lines.forEach(function (raw, index) {
      if (!raw.trim()) return;
      var record = { line: index + 1, raw: raw, valid: true, value: null, error: null };
      try {
        record.value = JSON.parse(raw);
      } catch (error) {
        record.valid = false;
        record.error = error && error.message ? error.message : "无法解析 JSON";
        errors.push({ line: record.line, message: record.error, raw: raw });
      }
      records.push(record);
    });

    return {
      records: records,
      errors: errors,
      lineCount: lines.length === 1 && !lines[0] ? 0 : lines.length,
      byteSize: new Blob([cleanText]).size
    };
  }

  function stableStringify(value) {
    if (value === null || typeof value !== "object") return JSON.stringify(value);
    if (Array.isArray(value)) {
      return "[" + value.map(stableStringify).join(",") + "]";
    }
    return "{" + Object.keys(value).sort().map(function (key) {
      return JSON.stringify(key) + ":" + stableStringify(value[key]);
    }).join(",") + "}";
  }

  function parsePath(path) {
    var normalized = String(path || "").trim()
      .replace(/\[\s*["']([^"']+)["']\s*\]/g, ".$1")
      .replace(/\[\s*(\d+)\s*\]/g, ".$1")
      .replace(/^\./, "");
    return normalized ? normalized.split(".").filter(Boolean) : [];
  }

  function getByPath(value, path) {
    var parts = parsePath(path);
    if (!parts.length) return { found: false, value: undefined };
    var current = value;
    for (var i = 0; i < parts.length; i += 1) {
      if (current === null || typeof current !== "object" || !Object.prototype.hasOwnProperty.call(current, parts[i])) {
        return { found: false, value: undefined };
      }
      current = current[parts[i]];
    }
    return { found: true, value: current };
  }

  function normalizeIgnorePaths(input) {
    var values = Array.isArray(input) ? input : String(input || "").split(/[,，;；\n\r]+/);
    var seen = new Set();
    return values.map(function (value) {
      var path = String(value || "").trim();
      if (path.indexOf("$.") === 0) path = path.slice(2);
      else if (path.charAt(0) === "$") path = path.slice(1);
      return path;
    }).filter(function (path) {
      if (!path || seen.has(path)) return false;
      seen.add(path);
      return true;
    });
  }

  function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function tokenizeIgnorePattern(pattern) {
    var tokens = [];
    var matcher = /([^.[\]]+)|\[\s*(\*|\d+|"[^"]+"|'[^']+')\s*\]/g;
    var match;
    while ((match = matcher.exec(pattern))) {
      if (match[1] !== undefined) {
        tokens.push({ type: "field", value: match[1].trim() });
      } else {
        var bracketValue = match[2];
        if ((bracketValue.charAt(0) === '"' && bracketValue.charAt(bracketValue.length - 1) === '"')
          || (bracketValue.charAt(0) === "'" && bracketValue.charAt(bracketValue.length - 1) === "'")) {
          tokens.push({ type: "field", value: bracketValue.slice(1, -1) });
        } else {
          tokens.push({ type: "index", value: bracketValue });
        }
      }
    }
    return tokens.filter(function (token) { return token.value; });
  }

  function compileIgnoreMatchers(paths) {
    return normalizeIgnorePaths(paths).map(function (path) {
      var tokens = tokenizeIgnorePattern(path);
      if (!tokens.length) return null;
      var source = "^\\$";
      tokens.forEach(function (token) {
        if (token.type === "index") {
          source += token.value === "*" ? "\\[\\d+\\]" : "\\[" + token.value + "\\]";
        } else if (token.value === "**") {
          source += "(?:\\.[^.\\[\\]]+|\\[\\d+\\])*";
        } else if (token.value === "*") {
          source += "\\.[^.\\[\\]]+";
        } else {
          source += "\\." + escapeRegExp(token.value);
        }
      });
      return { path: path, expression: new RegExp(source + "$") };
    }).filter(Boolean);
  }

  function isIgnoredPath(path, matchers) {
    return Boolean(matchers && matchers.some(function (matcher) { return matcher.expression.test(path); }));
  }

  function valueType(value) {
    if (value === MISSING) return "missing";
    if (value === null) return "null";
    if (Array.isArray(value)) return "array";
    return typeof value;
  }

  function appendPath(base, key, isArray) {
    if (isArray) return base + "[" + key + "]";
    return base === "$" ? "$." + key : base + "." + key;
  }

  function diffValues(before, after, path, changes, ignoreMatchers) {
    path = path || "$";
    changes = changes || [];
    if (changes.length >= MAX_CHANGES) return changes;
    if (isIgnoredPath(path, ignoreMatchers)) return changes;
    if (before === MISSING || after === MISSING) {
      changes.push({
        path: path,
        type: before === MISSING ? "added" : "removed",
        before: before,
        after: after
      });
      return changes;
    }
    if (stableStringify(before) === stableStringify(after)) return changes;

    var beforeType = valueType(before);
    var afterType = valueType(after);
    if (beforeType !== afterType || before === null || after === null || typeof before !== "object") {
      changes.push({
        path: path,
        type: before === MISSING ? "added" : after === MISSING ? "removed" : "changed",
        before: before,
        after: after
      });
      return changes;
    }

    if (Array.isArray(before) && Array.isArray(after)) {
      var arrayLength = Math.max(before.length, after.length);
      for (var ai = 0; ai < arrayLength && changes.length < MAX_CHANGES; ai += 1) {
        diffValues(ai < before.length ? before[ai] : MISSING, ai < after.length ? after[ai] : MISSING, appendPath(path, ai, true), changes, ignoreMatchers);
      }
      return changes;
    }

    var keys = Array.from(new Set(Object.keys(before).concat(Object.keys(after)))).sort();
    keys.forEach(function (key) {
      if (changes.length >= MAX_CHANGES) return;
      diffValues(
        Object.prototype.hasOwnProperty.call(before, key) ? before[key] : MISSING,
        Object.prototype.hasOwnProperty.call(after, key) ? after[key] : MISSING,
        appendPath(path, key, false),
        changes,
        ignoreMatchers
      );
    });
    return changes;
  }

  function printableKey(value) {
    if (typeof value === "string") return value;
    return stableStringify(value);
  }

  function buildKeyGroups(records, keyPath) {
    var groups = new Map();
    var special = [];
    var order = [];

    records.forEach(function (record) {
      if (!record.valid) {
        record.matchIssue = "invalid-json";
        special.push(record);
        return;
      }
      var match = getByPath(record.value, keyPath);
      if (!match.found) {
        record.matchIssue = "missing-key";
        special.push(record);
        return;
      }
      var token = valueType(match.value) + ":" + stableStringify(match.value);
      record.matchKey = token;
      record.keyLabel = printableKey(match.value);
      if (!groups.has(token)) {
        groups.set(token, []);
        order.push(token);
      }
      groups.get(token).push(record);
    });

    return { groups: groups, special: special, order: order };
  }

  function buildPairs(leftRecords, rightRecords, mode, keyPath) {
    var pairs = [];
    if (mode !== "key") {
      var length = Math.max(leftRecords.length, rightRecords.length);
      for (var i = 0; i < length; i += 1) {
        pairs.push({ left: leftRecords[i] || null, right: rightRecords[i] || null, keyLabel: "记录 " + (i + 1) });
      }
      return pairs;
    }

    var left = buildKeyGroups(leftRecords, keyPath);
    var right = buildKeyGroups(rightRecords, keyPath);
    var orderedTokens = left.order.concat(right.order.filter(function (token) { return !left.groups.has(token); }));

    orderedTokens.forEach(function (token) {
      var leftGroup = left.groups.get(token) || [];
      var rightGroup = right.groups.get(token) || [];
      var count = Math.max(leftGroup.length, rightGroup.length);
      for (var i = 0; i < count; i += 1) {
        var leftRecord = leftGroup[i] || null;
        var rightRecord = rightGroup[i] || null;
        pairs.push({
          left: leftRecord,
          right: rightRecord,
          keyLabel: leftRecord ? leftRecord.keyLabel : rightRecord.keyLabel,
          duplicateIndex: count > 1 ? i + 1 : null,
          duplicateCount: count > 1 ? count : null
        });
      }
    });

    left.special.forEach(function (record) { pairs.push({ left: record, right: null, keyLabel: "无法匹配" }); });
    right.special.forEach(function (record) { pairs.push({ left: null, right: record, keyLabel: "无法匹配" }); });
    return pairs;
  }

  function issueText(record, side, keyPath) {
    if (!record) return null;
    if (!record.valid) return side + " 第 " + record.line + " 行不是有效 JSON：" + record.error;
    if (record.matchIssue === "missing-key") return side + " 第 " + record.line + " 行缺少匹配字段 “" + keyPath + "”";
    return null;
  }

  function classifyPair(pair, mode, keyPath, index, ignoreMatchers) {
    var left = pair.left;
    var right = pair.right;
    var issues = [issueText(left, "A", keyPath), issueText(right, "B", keyPath)].filter(Boolean);
    var status;
    var changes = [];

    if ((left && !left.valid) || (right && !right.valid)) status = "error";
    else if (left && right) {
      changes = diffValues(left.value, right.value, "$", [], ignoreMatchers);
      status = changes.length ? "modified" : "same";
    }
    else if (left) status = "left-only";
    else status = "right-only";

    var keyText = mode === "key" ? String(pair.keyLabel) : "记录 " + (index + 1);
    if (pair.duplicateIndex) keyText += " · 重复项 " + pair.duplicateIndex + "/" + pair.duplicateCount;

    return {
      id: index + 1,
      status: status,
      left: left,
      right: right,
      keyLabel: keyText,
      changes: changes,
      issues: issues,
      hasError: issues.length > 0,
      truncated: changes.length >= MAX_CHANGES
    };
  }

  function compareJsonl(leftText, rightText, options) {
    options = options || {};
    var mode = options.mode === "key" ? "key" : "line";
    var keyPath = String(options.keyPath || "id").trim() || "id";
    var ignoreMatchers = compileIgnoreMatchers(options.ignorePaths);
    var ignorePaths = ignoreMatchers.map(function (matcher) { return matcher.path; });
    var left = parseJsonl(leftText);
    var right = parseJsonl(rightText);
    var pairs = buildPairs(left.records, right.records, mode, keyPath);
    var rows = pairs.map(function (pair, index) { return classifyPair(pair, mode, keyPath, index, ignoreMatchers); });
    var summary = { total: rows.length, same: 0, modified: 0, leftOnly: 0, rightOnly: 0, errors: 0 };

    rows.forEach(function (row) {
      if (row.status === "same") summary.same += 1;
      if (row.status === "modified") summary.modified += 1;
      if (row.status === "left-only") summary.leftOnly += 1;
      if (row.status === "right-only") summary.rightOnly += 1;
      if (row.hasError || row.status === "error") summary.errors += 1;
    });

    return { left: left, right: right, rows: rows, summary: summary, mode: mode, keyPath: keyPath, ignorePaths: ignorePaths };
  }

  return {
    parseJsonl: parseJsonl,
    stableStringify: stableStringify,
    getByPath: getByPath,
    normalizeIgnorePaths: normalizeIgnorePaths,
    compileIgnoreMatchers: compileIgnoreMatchers,
    isIgnoredPath: isIgnoredPath,
    diffValues: diffValues,
    compareJsonl: compareJsonl,
    MISSING: MISSING
  };
});

function initApp(core) {
  "use strict";

  var $ = function (selector) { return document.querySelector(selector); };
  var $$ = function (selector) { return Array.prototype.slice.call(document.querySelectorAll(selector)); };
  var state = {
    result: null,
    filter: "changed",
    search: "",
    page: 1,
    pageSize: 50,
    fileNames: { left: "", right: "" },
    toastTimer: null
  };

  var elements = {
    leftText: $("#leftText"),
    rightText: $("#rightText"),
    leftFile: $("#leftFile"),
    rightFile: $("#rightFile"),
    leftFileName: $("#leftFileName"),
    rightFileName: $("#rightFileName"),
    leftEditorMeta: $("#leftEditorMeta"),
    rightEditorMeta: $("#rightEditorMeta"),
    leftStatus: $("#leftStatus"),
    rightStatus: $("#rightStatus"),
    matchMode: $("#matchMode"),
    keyPath: $("#keyPath"),
    ignorePaths: $("#ignorePaths"),
    keyFieldWrap: $("#keyFieldWrap"),
    compareControls: $(".compare-controls"),
    modeHint: $("#modeHint"),
    compareButton: $("#compareButton"),
    resultList: $("#resultList"),
    resultsSection: $("#resultsSection"),
    timestamp: $("#comparisonTimestamp"),
    exportButton: $("#exportButton"),
    searchInput: $("#searchInput"),
    pagination: $("#pagination"),
    pageInfo: $("#pageInfo"),
    pageNumber: $("#pageNumber"),
    prevPage: $("#prevPage"),
    nextPage: $("#nextPage"),
    toast: $("#toast")
  };

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function formatBytes(bytes) {
    if (!bytes) return "0 B";
    var units = ["B", "KB", "MB", "GB"];
    var index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    var value = bytes / Math.pow(1024, index);
    return (value >= 10 || index === 0 ? value.toFixed(0) : value.toFixed(1)) + " " + units[index];
  }

  function showToast(message, isError) {
    clearTimeout(state.toastTimer);
    elements.toast.textContent = message;
    elements.toast.classList.toggle("is-error", Boolean(isError));
    elements.toast.classList.add("is-visible");
    state.toastTimer = setTimeout(function () { elements.toast.classList.remove("is-visible"); }, 2800);
  }

  function previewSource(side) {
    var text = elements[side + "Text"].value;
    var parsed = core.parseJsonl(text);
    var editorMeta = elements[side + "EditorMeta"];
    var status = elements[side + "Status"];
    editorMeta.textContent = parsed.records.length + " 条记录";

    var statusClass = !text.trim() ? "status-ready" : parsed.errors.length ? "status-error" : "status-valid";
    var statusText = !text.trim() ? "等待数据" : parsed.errors.length ? parsed.errors.length + " 行格式错误" : "JSONL 格式有效";
    status.innerHTML = '<span class="' + statusClass + '"><i></i>' + statusText + "</span><span>" + formatBytes(parsed.byteSize) + "</span>";
  }

  function setSource(side, text, fileName) {
    elements[side + "Text"].value = text;
    state.fileNames[side] = fileName || "";
    elements[side + "FileName"].textContent = fileName || "选择或拖入 JSONL";
    previewSource(side);
  }

  function readFile(side, file) {
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function () {
      setSource(side, String(reader.result || ""), file.name);
      showToast("已载入 " + file.name);
    };
    reader.onerror = function () { showToast("文件读取失败，请重试", true); };
    reader.readAsText(file, "utf-8");
  }

  function setupDrop(side) {
    var input = elements[side + "File"];
    var zone = $("#" + side + "DropZone");
    input.addEventListener("change", function () { readFile(side, input.files[0]); });
    ["dragenter", "dragover"].forEach(function (eventName) {
      zone.addEventListener(eventName, function (event) { event.preventDefault(); zone.classList.add("is-dragging"); });
    });
    ["dragleave", "drop"].forEach(function (eventName) {
      zone.addEventListener(eventName, function (event) { event.preventDefault(); zone.classList.remove("is-dragging"); });
    });
    zone.addEventListener("drop", function (event) { readFile(side, event.dataTransfer.files[0]); });
  }

  function debounce(fn, delay) {
    var timer;
    return function () {
      var args = arguments;
      clearTimeout(timer);
      timer = setTimeout(function () { fn.apply(null, args); }, delay);
    };
  }

  function updateModeUi() {
    var keyMode = elements.matchMode.value === "key";
    elements.keyFieldWrap.classList.toggle("is-hidden", !keyMode);
    elements.compareControls.classList.toggle("line-mode", !keyMode);
    elements.modeHint.textContent = keyMode
      ? "使用字段值配对；忽略规则支持 *、[*] 和 ** 通配符。"
      : "按记录顺序配对；忽略规则支持 *、[*] 和 ** 通配符。";
  }

  function statusLabel(status) {
    return {
      "modified": "已修改",
      "left-only": "仅 A 存在",
      "right-only": "仅 B 存在",
      "same": "完全一致",
      "error": "格式错误"
    }[status] || status;
  }

  function prettyValue(record) {
    if (!record) return "—";
    if (!record.valid) return record.raw;
    try { return JSON.stringify(record.value, null, 2); } catch (_) { return record.raw; }
  }

  function inlineValue(value) {
    if (value === core.MISSING) return "— 不存在 —";
    var text;
    try { text = JSON.stringify(value, null, 2); } catch (_) { text = String(value); }
    if (text === undefined) text = String(value);
    return text.length > 800 ? text.slice(0, 800) + "…" : text;
  }

  function rowSearchText(row) {
    var pieces = [row.status, row.keyLabel];
    if (row.left) pieces.push(row.left.raw, row.left.error || "");
    if (row.right) pieces.push(row.right.raw, row.right.error || "");
    row.changes.forEach(function (change) { pieces.push(change.path); });
    return pieces.join(" ").toLowerCase();
  }

  function filteredRows() {
    if (!state.result) return [];
    return state.result.rows.filter(function (row) {
      var matchesFilter = state.filter === "all"
        || (state.filter === "changed" && row.status !== "same")
        || (state.filter === "error" && (row.status === "error" || row.hasError))
        || row.status === state.filter;
      return matchesFilter && (!state.search || rowSearchText(row).includes(state.search));
    });
  }

  function renderChangeTable(row) {
    if (!row.changes.length) return "";
    var rows = row.changes.map(function (change) {
      return "<tr>" +
        '<td><code class="change-path">' + escapeHtml(change.path) + "</code></td>" +
        '<td class="value-removed"><code>' + escapeHtml(inlineValue(change.before)) + "</code></td>" +
        '<td class="value-added"><code>' + escapeHtml(inlineValue(change.after)) + "</code></td>" +
      "</tr>";
    }).join("");
    var truncated = row.truncated ? '<div class="issue-banner">字段差异过多，仅展示前 ' + row.changes.length + " 项。</div>" : "";
    return truncated + '<table class="change-table"><thead><tr><th>字段路径</th><th>基准值 / A</th><th>对比值 / B</th></tr></thead><tbody>' + rows + "</tbody></table>";
  }

  function renderRow(row) {
    var leftLine = row.left ? "第 " + row.left.line + " 行" : "—";
    var rightLine = row.right ? "第 " + row.right.line + " 行" : "—";
    var changeDescription = row.status === "modified" ? row.changes.length + " 个字段变化" : statusLabel(row.status);
    var issues = row.issues.map(function (issue) { return '<div class="issue-banner">' + escapeHtml(issue) + "</div>"; }).join("");
    return '<article class="diff-row" data-row-id="' + row.id + '">' +
      '<button class="diff-row-toggle" type="button" aria-expanded="false">' +
        '<span class="status-badge status-' + row.status + '">' + statusLabel(row.status) + "</span>" +
        '<span class="row-identity"><strong>' + escapeHtml(row.keyLabel) + "</strong><small>" + escapeHtml(changeDescription) + "</small></span>" +
        '<span class="line-ref">A · <b>' + leftLine + "</b></span>" +
        '<span class="line-ref">B · <b>' + rightLine + "</b></span>" +
        '<span class="row-chevron" aria-hidden="true">›</span>' +
      "</button>" +
      '<div class="diff-detail">' + issues + renderChangeTable(row) +
        '<div class="raw-grid">' +
          '<div class="raw-panel"><span>BASELINE / A · ' + leftLine + "</span><pre>" + escapeHtml(prettyValue(row.left)) + "</pre></div>" +
          '<div class="raw-panel"><span>CANDIDATE / B · ' + rightLine + "</span><pre>" + escapeHtml(prettyValue(row.right)) + "</pre></div>" +
        "</div>" +
      "</div>" +
    "</article>";
  }

  function renderResults() {
    var rows = filteredRows();
    var pages = Math.max(1, Math.ceil(rows.length / state.pageSize));
    state.page = Math.min(Math.max(1, state.page), pages);
    var start = (state.page - 1) * state.pageSize;
    var visible = rows.slice(start, start + state.pageSize);

    if (!state.result) {
      elements.resultList.innerHTML = '<div class="empty-state"><span class="empty-glyph" aria-hidden="true">{…}</span><h3>等待第一次对比</h3><p>准备好两侧数据后点击“开始对比”，差异会在这里逐条展开。</p></div>';
      elements.pagination.classList.add("is-hidden");
      return;
    }

    if (!rows.length) {
      elements.resultList.innerHTML = '<div class="empty-state"><span class="empty-glyph" aria-hidden="true">✓</span><h3>没有符合条件的结果</h3><p>尝试切换筛选条件或清除搜索关键词。</p></div>';
    } else {
      elements.resultList.innerHTML = visible.map(renderRow).join("");
    }

    elements.pagination.classList.toggle("is-hidden", rows.length <= state.pageSize);
    elements.pageInfo.textContent = rows.length ? "显示 " + (start + 1) + "–" + Math.min(start + state.pageSize, rows.length) + " / " + rows.length : "显示 0 / 0";
    elements.pageNumber.textContent = state.page + " / " + pages;
    elements.prevPage.disabled = state.page <= 1;
    elements.nextPage.disabled = state.page >= pages;
  }

  function updateSummary() {
    var summary = state.result.summary;
    $("#summaryTotal").textContent = summary.total;
    $("#summarySame").textContent = summary.same;
    $("#summaryModified").textContent = summary.modified;
    $("#summaryLeft").textContent = summary.leftOnly;
    $("#summaryRight").textContent = summary.rightOnly;
    $("#summaryErrors").textContent = summary.errors;

    var counts = {
      changed: state.result.rows.filter(function (row) { return row.status !== "same"; }).length,
      modified: summary.modified,
      "left-only": summary.leftOnly,
      "right-only": summary.rightOnly,
      error: summary.errors,
      same: summary.same,
      all: summary.total
    };
    $$("#filterTabs button").forEach(function (button) {
      button.querySelector("span").textContent = counts[button.dataset.filter];
    });
  }

  function runComparison(shouldScroll) {
    if (!elements.leftText.value.trim() && !elements.rightText.value.trim()) {
      showToast("请先在至少一侧载入 JSONL 数据", true);
      elements.leftText.focus();
      return;
    }
    if (elements.matchMode.value === "key" && !elements.keyPath.value.trim()) {
      showToast("按字段匹配时需要填写字段路径", true);
      elements.keyPath.focus();
      return;
    }

    elements.compareButton.disabled = true;
    elements.compareButton.querySelector("span").textContent = "正在分析…";
    window.setTimeout(function () {
      state.result = core.compareJsonl(elements.leftText.value, elements.rightText.value, {
        mode: elements.matchMode.value,
        keyPath: elements.keyPath.value,
        ignorePaths: elements.ignorePaths.value
      });
      state.page = 1;
      state.filter = "changed";
      state.search = "";
      elements.searchInput.value = "";
      $$("#filterTabs button").forEach(function (button) { button.classList.toggle("is-active", button.dataset.filter === "changed"); });
      updateSummary();
      renderResults();
      previewSource("left");
      previewSource("right");
      elements.exportButton.disabled = false;
      var ignoredLabel = state.result.ignorePaths.length ? " · 忽略 " + state.result.ignorePaths.length + " 条规则" : "";
      elements.timestamp.textContent = "完成于 " + new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) + ignoredLabel;
      elements.compareButton.disabled = false;
      elements.compareButton.querySelector("span").textContent = "开始对比";
      var differences = state.result.rows.filter(function (row) { return row.status !== "same"; }).length;
      showToast("对比完成：发现 " + differences + " 条差异" + ignoredLabel);
      if (shouldScroll) elements.resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 30);
  }

  function exportDifferences() {
    if (!state.result) return;
    var output = state.result.rows.filter(function (row) { return row.status !== "same"; }).map(function (row) {
      return JSON.stringify({
        status: row.status,
        match: row.keyLabel,
        leftLine: row.left ? row.left.line : null,
        rightLine: row.right ? row.right.line : null,
        ignoredFields: state.result.ignorePaths,
        before: row.left && row.left.valid ? row.left.value : row.left ? row.left.raw : null,
        after: row.right && row.right.valid ? row.right.value : row.right ? row.right.raw : null,
        changes: row.changes.map(function (change) {
          return {
            path: change.path,
            type: change.type,
            before: change.before === core.MISSING ? null : change.before,
            after: change.after === core.MISSING ? null : change.after
          };
        }),
        issues: row.issues
      });
    }).join("\n");
    var blob = new Blob([output], { type: "application/x-ndjson;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "jsonl-diff-" + new Date().toISOString().replace(/[:.]/g, "-") + ".jsonl";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    showToast("差异报告已导出");
  }

  function loadSample() {
    var left = [
      { id: "weapon_001", name: "青锋", stats: { atk: 12, speed: 1.1 }, tags: ["weapon", "rare"] },
      { id: "armor_002", name: "守卫之盾", stats: { def: 18 }, enabled: true },
      { id: "potion_003", name: "小型药剂", heal: 25 },
      { id: "material_004", name: "月光石", stack: 20 }
    ].map(JSON.stringify).join("\n");
    var right = [
      { tags: ["weapon", "rare"], stats: { speed: 1.1, atk: 12 }, name: "青锋", id: "weapon_001" },
      { id: "armor_002", name: "守卫之盾·改", stats: { def: 21, block: 0.08 }, enabled: false },
      { id: "material_004", name: "月光石", stack: 20 },
      { id: "bomb_005", name: "爆裂球", damage: 80 }
    ].map(JSON.stringify).join("\n");
    setSource("left", left, "baseline-demo.jsonl");
    setSource("right", right, "candidate-demo.jsonl");
    elements.matchMode.value = "key";
    elements.keyPath.value = "id";
    elements.ignorePaths.value = "";
    updateModeUi();
    runComparison(false);
  }

  function clearAll() {
    setSource("left", "", "");
    setSource("right", "", "");
    elements.leftFile.value = "";
    elements.rightFile.value = "";
    elements.ignorePaths.value = "";
    state.result = null;
    state.page = 1;
    state.filter = "changed";
    state.search = "";
    elements.searchInput.value = "";
    $$("#filterTabs button").forEach(function (button) { button.classList.toggle("is-active", button.dataset.filter === "changed"); });
    elements.timestamp.textContent = "尚未执行对比";
    elements.exportButton.disabled = true;
    ["summaryTotal", "summarySame", "summaryModified", "summaryLeft", "summaryRight", "summaryErrors"].forEach(function (id) { $("#" + id).textContent = "—"; });
    $$("#filterTabs button span").forEach(function (span) { span.textContent = "0"; });
    renderResults();
    showToast("已清空所有数据");
  }

  setupDrop("left");
  setupDrop("right");
  elements.leftText.addEventListener("input", debounce(function () { state.fileNames.left = ""; elements.leftFileName.textContent = "已粘贴文本"; previewSource("left"); }, 180));
  elements.rightText.addEventListener("input", debounce(function () { state.fileNames.right = ""; elements.rightFileName.textContent = "已粘贴文本"; previewSource("right"); }, 180));
  elements.matchMode.addEventListener("change", updateModeUi);
  elements.compareButton.addEventListener("click", function () { runComparison(true); });
  elements.exportButton.addEventListener("click", exportDifferences);
  $("#loadSampleButton").addEventListener("click", loadSample);
  $("#clearButton").addEventListener("click", clearAll);
  $("#backToTop").addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });
  $("#swapButton").addEventListener("click", function () {
    var leftText = elements.leftText.value;
    var leftName = state.fileNames.left;
    setSource("left", elements.rightText.value, state.fileNames.right);
    setSource("right", leftText, leftName);
    if (state.result) runComparison(false);
    showToast("已交换 A 与 B");
  });

  $("#filterTabs").addEventListener("click", function (event) {
    var button = event.target.closest("button[data-filter]");
    if (!button) return;
    state.filter = button.dataset.filter;
    state.page = 1;
    $$("#filterTabs button").forEach(function (item) { item.classList.toggle("is-active", item === button); });
    renderResults();
  });

  elements.searchInput.addEventListener("input", debounce(function () {
    state.search = elements.searchInput.value.trim().toLowerCase();
    state.page = 1;
    renderResults();
  }, 160));

  elements.resultList.addEventListener("click", function (event) {
    var toggle = event.target.closest(".diff-row-toggle");
    if (!toggle) return;
    var row = toggle.closest(".diff-row");
    var isOpen = row.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  elements.prevPage.addEventListener("click", function () { state.page -= 1; renderResults(); elements.resultsSection.scrollIntoView({ block: "start" }); });
  elements.nextPage.addEventListener("click", function () { state.page += 1; renderResults(); elements.resultsSection.scrollIntoView({ block: "start" }); });
  document.addEventListener("keydown", function (event) {
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
      event.preventDefault();
      runComparison(true);
    }
  });

  updateModeUi();
  previewSource("left");
  previewSource("right");
}
