#!/usr/bin/env python3
"""图库变量防串线检查（2026-10-02 鱼尾狮/清迈/吉姆汤普森串图事故后立规矩）。

placeGalleries.ts 里每个 import gN 变量在多个图库条目复用时，标题必须一致；
不一致 = 同一张图被贴了两个地方的标签，至少一处是错的（曾导致首尔乐天酒店
客房图出现在鱼尾狮公园"灯光秀"机位、鱼尾狮实拍出现在清迈周日步行街）。
用法：python3 scripts/check-gallery-vars.py（非零退出=有串线）
"""
import re
import sys
from collections import defaultdict
from pathlib import Path

p = Path(__file__).resolve().parent.parent / "client/src/guide/placeGalleries.ts"
s = p.read_text()
imp = dict(re.findall(r'import (g\d+) from "([^"]+)";', s))
use = defaultdict(list)
for m in re.finditer(r'"([^"|]+)\|([^"|]+)\|([^"]+)":\[(.*?)\],?\n', s, re.S):
    kind, city, name, body = m.groups()
    for em in re.finditer(r'\{src:(g\d+),sourceUrl:"(.*?)",title:"(.*?)"\}', body):
        var, url, title = em.groups()
        if var not in imp:
            print(f"BROKEN-IMPORT: {var} used in {city}|{name} but never imported")
            sys.exit(1)
        use[var].append((city, name, title[:50]))

bad = 0
for v in sorted(use, key=lambda x: int(x[1:])):
    ctx = {(c, n) for c, n, t in use[v]}
    titles = {t for _, _, t in use[v]}
    if len(ctx) > 1 and len(titles) > 1:
        bad += 1
        print(f"CROSS-WIRED: {v} ({imp[v]})")
        for c, n, t in use[v]:
            print(f"    {c} | {n} | {t}")
if bad:
    print(f"\nFAIL: {bad} cross-wired variables")
    sys.exit(1)
print(f"OK: {len(imp)} gallery variables, no cross-wiring")
