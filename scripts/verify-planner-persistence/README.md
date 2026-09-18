# 规划器持久化链路验证

验证“规划器保存 → 刷新 → 全站加载”链路的代码级测试（2026-09-18 运行通过）。

## 跑法

```bash
cd ~/workspace/sea-migration/repo
# 纯函数验证：规划 JSON -> 全站行程 / 改序后详情映射
node --import ./scripts/verify-planner-persistence/loader.mjs \
  ./scripts/verify-planner-persistence/test.ts pure
# 保存 -> 刷新 -> 加载（本地缓存回退链路，跨进程）
node --import ./scripts/verify-planner-persistence/loader.mjs \
  ./scripts/verify-planner-persistence/test.ts save
node --import ./scripts/verify-planner-persistence/loader.mjs \
  ./scripts/verify-planner-persistence/test.ts load
# 服务端触发器验证（insert/update 审计字段；跑完自动清理测试行）
python3 ./scripts/verify-planner-persistence/trigger-test.py
```

`loader.mjs`/`hooks.mjs` 做三件事：把 `@/` 映射到 `client/src/`、
把 `@/lib/supabase` 替换为 stub（验证环境不连真实 Supabase）、
给 `.json` 加 import attribute。`supabase-stub.mjs` 让模块可导入。

## 覆盖项（全部通过）

- `planToItinerary`：20 天经典规划 → Day 数组（Day1 曼谷 12-12 周六、
  Day9 槟城 12-20 周日、Day20 新加坡 12-31 周四）、8 个城市段、
  曼谷段 `Day1-3 / 12-12 ~ 12-14`、`dateRangeLong = 2026-12-12 ～ 2026-12-31`、
  空 schedule 返回 null（静态回退）。
- `detailDayForPlanDay`：清迈/普吉对调后，Day6 取清迈第 1 天攻略
  （原 Day4，shifted=true）；城市未变不 shifted；无云端规划走原版。
- 缓存回退：`cachePlannerPlanLocally` → 新进程 `readPlannerCache`
  读回一致（刷新不丢），署名保留，`source=cache`。
- 触发器：insert 时 `created_by/updated_by = user_id`；
  darancai 覆盖保存后 `created_by` 保留为 nckuang123、
  `updated_by` 切为 darancai、`updated_at` 推进；测试行已删除。

## 已知边界（需真站验收）

- 真机双账号互改、刷新后云端恢复、390px、Console、HAR 尚未验收。
- 规划器在页面打开期间登录状态变化不会自动重载（打开时加载一次）。
