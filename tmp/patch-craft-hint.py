# -*- coding: utf-8 -*-
import io
p = 'project/backpack.css'
s = io.open(p, encoding='utf-8').read()
old = ".backpack-craft-norecipe { color: #e07a6a; font: 14px sans-serif; }"
new = ".backpack-craft-norecipe { color: #e07a6a; font: 14px sans-serif; }\n.backpack-craft-hint { color: #c4ae8d; font: 14px sans-serif; text-align: center; padding: 16px 12px; line-height: 1.6; }"
assert s.count(old) == 1, 'CSS hint 匹配异常'
s = s.replace(old, new)
io.open(p, 'w', encoding='utf-8', newline='').write(s)
print('css patched')
s2 = io.open('index.html', encoding='utf-8').read()
old2 = "href='project/backpack.css?v=5'"
assert s2.count(old2) == 1, 'css link 匹配异常'
s2 = s2.replace(old2, "href='project/backpack.css?v=6'")
io.open('index.html', 'w', encoding='utf-8', newline='').write(s2)
print('css ?v=6')
s3 = io.open('main.js', encoding='utf-8').read()
s3 = s3.replace("this.version = '2.10.15';", "this.version = '2.10.16';")
io.open('main.js', 'w', encoding='utf-8', newline='').write(s3)
print('version 2.10.16')