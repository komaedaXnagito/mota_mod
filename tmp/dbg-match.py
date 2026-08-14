# -*- coding: utf-8 -*-
import re
import json
src = open('project/enemys.js', encoding='utf-8').read()
pat = re.compile(r'"([A-Za-z0-9_]+)":\s*\{')
for m in pat.finditer(src):
    key = m.group(1)
    i = m.end() - 1
    depth = 0
    j = i
    in_str = False
    while j < len(src):
        ch = src[j]
        if in_str:
            if ch == '\\':
                j += 1
            elif ch == '"':
                in_str = False
        else:
            if ch == '"':
                in_str = True
            elif ch == '{':
                depth += 1
            elif ch == '}':
                depth -= 1
                if depth == 0:
                    break
        j += 1
    obj_text = src[i:j + 1]
    ok = True
    try:
        json.loads(obj_text)
    except Exception:
        ok = False
    print(key, '| 起始行:', src[:i].count('\n') + 1, '| 结束行:', src[:j].count('\n') + 1, '| JSON有效:', ok, '| 长度:', len(obj_text))
