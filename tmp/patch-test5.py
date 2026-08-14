# -*- coding: utf-8 -*-
import io
p = 'tests/backpackBattle.test.js'
s = io.open(p, encoding='utf-8').read()
old = "assert.match(indexSource, /href=['\"]project\\/backpack\\.css['\"]/);"
new = "assert.match(indexSource, /href=['\"]project\\/backpack\\.css(?:\\?v=\\d+)?['\"]/);"
assert s.count(old) == 1, '断言匹配异常: ' + repr(old)
s = s.replace(old, new)
io.open(p, 'w', encoding='utf-8', newline='').write(s)
print('test patched')
