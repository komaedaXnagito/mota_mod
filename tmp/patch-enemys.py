# -*- coding: utf-8 -*-
"""给所有已填攻防血数据的怪物补 attackInterval / ultimateGain（参照攻防血平衡）。"""
import io
import re
import json

p = 'project/enemys.js'
src = io.open(p, encoding='utf-8').read()
pat = re.compile(r'"([A-Za-z0-9_]+)":\s*\{')
out = []
pos = 0
changes = 0
skipped_no_data = 0


def calc_balance(atk, hp):
    """按攻击力阶梯 + 血量修正：攻越高间隔越大（攻击越慢）、奥义获取越高（爆发越强）。"""
    if atk < 60:
        interval, ult_gain = 1.0, 0
    elif atk < 120:
        interval, ult_gain = 1.2, 15
    elif atk < 250:
        interval, ult_gain = 1.4, 22
    elif atk < 450:
        interval, ult_gain = 1.6, 30
    elif atk < 800:
        interval, ult_gain = 1.9, 38
    else:
        interval, ult_gain = 2.3, 45
    if hp >= 2000:
        interval += 0.3  # 血牛：攻击更慢以平衡
    return interval, ult_gain


for m in pat.finditer(src):
    if m.start() < pos:
        continue  # 跳过已处理区域内的嵌套匹配（如 faceIds 对象）
    out.append(src[pos:m.end() - 1])  # 保留 "key": 前缀
    key = m.group(1)
    # 从 { 起栈匹配到配对的 }（支持跨行与嵌套，正确处理字符串内转义）
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
    try:
        obj = json.loads(obj_text)
    except Exception:
        out.append(obj_text)
        pos = j + 1
        continue
    atk = int(obj.get('atk') or 0)
    d = int(obj.get('def') or 0)
    hp = int(obj.get('hp') or 0)
    if atk <= 0 and d <= 0 and hp <= 0:
        skipped_no_data += 1
        out.append(obj_text)
        pos = j + 1
        continue
    interval, ult_gain = calc_balance(atk, hp)
    inserts = []
    if 'attackInterval' not in obj:
        inserts.append('"attackInterval":' + ('%g' % interval))
    if 'ultimateGain' not in obj and ult_gain > 0:
        inserts.append('"ultimateGain":' + str(ult_gain))
    if inserts:
        tail = obj_text[:-1].rstrip()
        out.append(tail + ',' + ','.join(inserts) + '}')
        changes += 1
    else:
        out.append(obj_text)
    pos = j + 1
out.append(src[pos:])
io.open(p, 'w', encoding='utf-8', newline='').write(''.join(out))
print('补配怪物数:', changes, '| 跳过(无攻防血数据):', skipped_no_data)
