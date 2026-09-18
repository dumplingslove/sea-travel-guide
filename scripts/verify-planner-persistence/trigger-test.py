#!/usr/bin/env python3
"""触发器验证：insert/update 走服务端审计字段，完事清理。"""
import json
import sys
import urllib.request

sys.path.insert(0, "/home/hatch/workspace/skills/supabase/bin")
import importlib.util
from importlib.machinery import SourceFileLoader

sbapi = SourceFileLoader(
    "sbapi", "/home/hatch/workspace/skills/supabase/bin/sb-api"
).load_module()

REF = "pacqyctbalsplqrrhozh"
U1 = "84e12f88-0049-495a-9387-89c996ef5983"  # nckuang123
U2 = "ea5bae05-1659-4cdc-9f63-e79c6a4f1393"  # darancai


def q(sql):
    req = sbapi.api_request(
        "POST", f"/v1/projects/{REF}/database/query", {"query": sql}
    )
    resp = urllib.request.urlopen(req, timeout=120)
    return json.loads(resp.read().decode())


print("== insert as nckuang123:")
rows = q(
    "insert into public.sea_planner_schedules (slot, user_id, plan) "
    "values ('family', '%s', '{\"version\":1,\"probe\":\"insert\"}') "
    "returning slot, user_id, created_by, updated_by, plan->>'probe' as probe;" % U1
)
print(json.dumps(rows, ensure_ascii=False))
r = rows[0]
assert r["created_by"] == U1 and r["updated_by"] == U1, "insert 审计字段错误"
print("  ✓ insert: created_by/updated_by = user_id")

print("== update as darancai（模拟家庭成员覆盖保存）:")
rows = q(
    "update public.sea_planner_schedules set user_id='%s', "
    "plan='{\"version\":1,\"probe\":\"update\"}' where slot='family' "
    "returning slot, user_id, created_by, updated_by, plan->>'probe' as probe, "
    "created_at < updated_at as bumped;" % U2
)
print(json.dumps(rows, ensure_ascii=False))
r = rows[0]
assert r["created_by"] == U1, "update 不应改 created_by"
assert r["updated_by"] == U2, "update 应改 updated_by"
assert r["probe"] == "update", "plan 未更新"
print("  ✓ update: created_by 保留，updated_by 切换为 darancai")

print("== cleanup:")
rows = q("delete from public.sea_planner_schedules where slot='family' returning slot;")
print(json.dumps(rows))
rows = q("select count(*) as rows_left from public.sea_planner_schedules;")
assert rows[0]["rows_left"] == 0
print("  ✓ 已清理，表为空")
print("\n触发器验证全部通过")
