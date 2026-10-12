import type { Day} from "./data";

/**
* 云端行程（2026-11-28～2027-01-01：北京 D1-8 / 新加坡 D9-13 / 普吉 D14-16 / 清迈 D17-18 / 曼谷 D19-21 / 西安 D22-24 / 北京 D25-33 / 首尔 D34-35）
* 对静态内容库的逐日修正。
*
* 静态库按旧20天路线写，直接映射会有三类过期：
* 1. 航段残留：新加坡首日"富国岛飞新加坡"（实际是北京直飞抵达）、新加坡末日"返程"标题＋"办理离境"
* （实际次日一早飞普吉，不是当天离境）；
* 2. 开门日冲突：曼谷某日映射到静态 D2《周末市集》，但恰图恰仅周六日开放；
* 3. 文案过期：曼谷首日（从清迈短途飞来）映射到静态 D1 的"跨洲飞行后的缓冲"。
*
* 只在云端规划生效时应用（Home.tsx），静态20天回退不受影响。
* 按城市+城内序号匹配，不依赖绝对天号（2026-10-03 修：35天行程里新加坡是 D9-13 不是 D1-5）。
*/
export function applyCloudDayOverride(
  cityZh: string,
  ordinalInCity: number, // 0-indexed，0=该城市第一天
  totalInCity: number,   // 该城市共几天
  base: Day | undefined,
): Day | undefined {
  if (!base) return base;

  // 新加坡首日：国际直飞抵达（旧文案是富国岛飞新加坡）
  if (cityZh === "新加坡" && ordinalInCity === 0) {
    return {
      ...base,
      title: "抵达新加坡 · 滨海湾",
      stops: base.stops.map((s) =>
        s.name === "富国岛飞新加坡"
          ? {
              ...s,
              name: "抵达樟宜机场",
              detail:
                "国际航班一早抵达樟宜（以实际出票时刻为准）；一家五口行李多，提前约好接机或打大车，直奔酒店寄存行李。",
            }
          : s,
      ),
    };
  }

  // 新加坡第2天（12/8）：Candlenut 盯放号提醒
  if (cityZh === "新加坡" && ordinalInCity === 1) {
    return {
      ...base,
      food:
        "🍽️ 晚餐备选：Candlenut（米其林一星娘惹菜，全球唯一）12 月尚未放号，盯 SevenRooms 放位（当前只开到 11 月 10 日左右）。" +
        (base.food ? "另：" + base.food : ""),
    };
  }

  // 新加坡第3天（12/9）：Jumbo Seafood 已订位
  if (cityZh === "新加坡" && ordinalInCity === 2) {
    return {
      ...base,
      food:
        "✅ 晚餐已订：Jumbo Seafood（珍宝海鲜 Dempsey Hill 店）19:30，5 人（4 大 1 小，幼儿 2 岁），确认号 TW7NH3，无押金、无需信用卡。" +
        "Indoor 已满、按无偏好预订（已备注希望室内）；17:30–20:00 的桌可能被要求提前让位，桌位只保留 15 分钟，别迟到。" +
        (base.food ? "另：" + base.food : ""),
    };
  }

  // 新加坡末日：转场前日（次日一早飞普吉），不是"返程"当天离境
  if (cityZh === "新加坡" && ordinalInCity === totalInCity - 1 && totalInCity > 1) {
    const stops = base.stops.map((s) => {
      if (s.name === "回酒店收行李")
        return {
          ...s,
          detail:
            "回酒店整理行李（明晨退房赶早班机飞普吉）；小印度/乌节路采购段整体砍掉——转场前日不赶场。",
        };
      if (s.name === "Jewel 星耀樟宜")
        return {
          ...s,
          detail:
            "40米雨漩涡与室内花园（7/10 篇）：全室内、推车友好；明晨赶早班机，今天先逛透，机场人多，留足时间。",
        };
      if (s.name === "办理离境")
        return {
          ...s,
          name: "回酒店早休息",
          detail:
            "明晨早班机飞普吉：提前在线值机、复核航站楼与起飞时间，今晚早睡。",
        };
      return s;
    });
    return {
      ...base,
      title: "多元街区 · 星耀樟宜 · 转场",
      stops,
      food: "Ya Kun 早餐（路线共识：亚坤早餐是新加坡高频早餐选择）；明晨赶早班机，今晚在酒店附近吃好睡好。",
      tip: "转场前日只保留牛车水一圈＋Jewel，砍掉小印度/乌节路赶场。明晨飞普吉，今晚早休息。物价贵，餐厅另加约 19% 税费服务费。",
    };
  }

  // 普吉首日（12/12）：PRU 晚餐计划（待信用卡押金确认）
  if (cityZh === "普吉" && ordinalInCity === 0) {
    return {
      ...base,
      food:
        "🍽️ 晚餐计划：PRU（普吉唯一米其林星，农场直供）12/12 周六晚有位（17:45 吧台 / 18:45 / 19:00 正餐区）；" +
        "需信用卡付每人 5,000 铢不可退押金（2 人共 10,000 铢，抵餐费），tasting menu 约 7,500++ 铢/人——等信用卡确认后下单。" +
        (base.food ? "另：" + base.food : ""),
    };
  }

  // 普吉：研究建议攀牙湾与皮皮岛二选一（仅当普吉有3天时，第三天提示）
  if (cityZh === "普吉" && ordinalInCity === 2 && totalInCity >= 3) {
    return {
      ...base,
      tip:
        base.tip +
        "研究建议攀牙湾与皮皮岛二选一即可：连排两天跳岛强度大（今日 06:30 出海），体力不够可把今天换成普吉老镇深度＋海滩休息。",
    };
  }

  // 曼谷首日：从清迈短途飞来，不是跨洲飞行；Le Du 晚餐盯放号
  if (cityZh === "曼谷" && ordinalInCity === 0) {
    return {
      ...base,
      stops: base.stops.map((s) =>
        s.name === "入住酒店"
          ? { ...s, detail: s.detail.replace("跨洲飞行", "短途飞行") }
          : s,
      ),
      food:
        "🍽️ 晚餐计划：Le Du（一星现代泰餐）12/19 周六尚未放号（12 月只开了 1–11 号），盯 CoverManager 放位；" +
        "72 小时内取消按每人 5,000 铢收费。备选 Nahm（一星泰餐）/ Nusara（仅 10 座，极难订）；" +
        "午餐 Jay Fai 现场排队（周六 9:00–19:30，只收现金，队长早去）。" +
        (base.food ? "另：" + base.food : ""),
    };
  }

  return base;
}

/** 兼容旧调用（绝对天号 1-13）：已废弃，仅保留避免编译错误 */
export function applyCloudDayOverrideLegacy(
  dayNum: number,
  base: Day | undefined,
): Day | undefined {
  return base;
}
