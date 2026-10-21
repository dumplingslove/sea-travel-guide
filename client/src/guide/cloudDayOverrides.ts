import type { Day} from "./data";

/**
* 云端行程（2026-11-28～2027-01-01：北京→新加坡→夫妻东南亚（普吉/清迈/曼谷）→分开行动（北京‖西安并列）→首尔；
* 各段天数与逐日天号以云端保存行程为准——旧 35 天串联口径（曼谷 3 天、西安→北京3 串联）已随 2026-10-13 改版废除）
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
      tip:
        base.tip +
        "雨天室内备选再加一个：亚洲文明博物馆敦煌特展（四座复制洞窟，展期 2026-09-25 至 2027-03-07，正覆盖这几天），就在滨海湾一带。（2026-10-17 发现轮换）",
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

  // 新加坡 12/8（ordinal 2）：Candlenut 盯放号提醒
  // （2026-10-17 主 agent 修正：旧版按新加坡 12-07 起算写的 ordinal 1/2，与现行 schedule
  //  12-06 起算差一天，Candlenut/Jumbo 两条注记此前都落在提前一天的页面上）
  if (cityZh === "新加坡" && ordinalInCity === 2) {
    return {
      ...base,
      food:
        "🍽️ 晚餐备选：Candlenut（米其林一星娘惹菜，全球唯一）12 月尚未放号，盯 SevenRooms 放位（当前只开到 11 月 10 日左右）。" +
        (base.food ? "另：" + base.food : ""),
    };
  }

  // 新加坡 12/9（ordinal 3）：Jumbo Seafood 已订位
  if (cityZh === "新加坡" && ordinalInCity === 3) {
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

  // 普吉 12/12（ordinal 1）：PRU 晚餐已订
  // （2026-10-17 修正：旧版 ordinal 0 按普吉 12-12 起算，与现行 schedule 12-11 起算差一天）
  if (cityZh === "普吉" && ordinalInCity === 1) {
    return {
      ...base,
      food:
        "✅ 晚餐已订：PRU（Trisara 度假村内，普吉唯一米其林星）12/12 周六 17:45，Kitchen Counter，2 位成人，确认号 484R2B3A8U2A。" +
        "押金 THB 10,000 已付（不可退，抵扣最终账单）；tasting menu 约 THB 7,500++/人；1–4 人修改/减员至少提前 48 小时；迟到超 30 分钟可能被取消。" +
        (base.food ? "另：" + base.food : ""),
    };
  }

  // 普吉：研究建议攀牙湾与皮皮岛二选一（仅当普吉有3天时，第三天提示）
  if (cityZh === "普吉" && ordinalInCity === 2 && totalInCity >= 3) {
    return {
      ...base,
      tip:
        base.tip +
        "研究建议攀牙湾与皮皮岛二选一即可：连排两天跳岛强度大（今日 06:30 出海），体力不够可把今天换成普吉老镇深度＋海滩休息。" +
        "另：今天是周日，普吉镇老街有周日夜市（2026 年初新铺了步行街面）；同在镇上还有 2026 年 5 月重装开业的 NAKA 周末夜市（周六、周日 16:00–22:00，新盖大棚、号称泰南最大街头美食中心），两个市场相距约 10 分钟车程可连逛；NAKA 只推荐小吃摊，坐下点海鲜的大排档有调包避雷实帖、别进。但今晚入住岛北 Mai Khao 的 JW 万豪，往返车程远，不顺路就别专程跑。（2026-10-17 发现轮换及第二轮补充）",
    };
  }

  // 首尔 12/30（ordinal 0）：抵达晚先抢 The Hyundai Seoul 圣诞村次日预约
  // （2026-10-19 发现轮换第三轮 round 348 实读：圣诞村 2026-11-08 至 12-31、马戏主题、预约秒空）
  if (cityZh === "首尔" && ordinalInCity === 0) {
    return {
      ...base,
      tip:
        base.tip +
        "【今晚先抢预约】The Hyundai Seoul 圣诞村（汝矣岛，室内）2026 年档期 11-08 至 12-31，明天 12-31 是最后一天：马戏主题「THEATRE ACROBATIQUE」，入场靠提前预约、名额秒空——落地安顿后先把 12-31 的场次抢了，抢不到再按原计划走光化门线，别明天到现场才发现进不去。（2026-10-19 发现轮换第三轮）",
    };
  }

  // 首尔 12/31（ordinal 1）：冬季庆典清溪川灯节（2026-10-17 发现轮换 round 332 实读）
  if (cityZh === "首尔" && ordinalInCity === 1) {
    const stops = [...base.stops];
    const idx = stops.findIndex((s) => s.name.includes("北村"));
    const lantern = {
      time: "15:45",
      name: "清溪川 · 首尔灯节",
      detail:
        "首尔冬季庆典（2026-12-04 至 2027-01-31）的主场之一：清溪川沿岸整段灯饰与灯光作品，户外免费、路面平坦可推车，傍晚早场人最少，正好接在光化门/北村动线后面。灯节确切场次以官方临行公告为准。",
    };
    if (idx >= 0) stops.splice(idx + 1, 0, lantern);
    else stops.push(lantern);
    // Jdot 圣诞树森林紧接灯节插入（同在光化门一带，2026-10-19 第三轮发现）
    const jdot = {
      time: "17:15",
      name: "Jdot Tree 圣诞树森林（史努比 × 哈利波特）",
      detail:
        "钟路区 사직로2길 12，离光化门很近，接在清溪川灯节后面顺路。史努比 × 哈利波特联名的圣诞树森林，2026-10-24 至 12-31 正式运营，今天是最后一天；平日（周二至周五）17:00–21:30、周一休，正价票 3,000 韩元/人、学龄前免费（需监护人陪同），走 Naver 预约。场地不大、娃能看能拍，逛完再决定去不去南山——和南山缆车排队二选一即可，别都硬塞。（2026-10-19 发现轮换第三轮）",
    };
    const lanternIdx = stops.findIndex((s) => s.name.includes("清溪川"));
    if (lanternIdx >= 0) stops.splice(lanternIdx + 1, 0, jdot);
    else stops.push(jdot);
    return {
      ...base,
      stops,
      tip:
        base.tip +
        "【冬季庆典】12-31 晚普信阁有跨年敲钟，人极密又严寒，带娃别去挤；看灯走清溪川傍晚场即可。清溪川旁边的光化门广场还有光化门圣诞集市（2026-12-04 至 12-31，主题『时间停止的圣诞村』，欧风市集村+大型圣诞树+100 多个摊位），今天正好是最后一天，可与灯节连着逛；户外严寒，给娃穿够、逛一小圈就进室内取暖。官方称档期为预定方案、可能调整，临行再确认。若不想上南山排队，备选石村湖灯光庆典（蚕室，10 月至次年 2 月整季，湖边平坦好推车，紧邻乐天世界塔可进室内取暖）。（2026-10-17 发现轮换；圣诞集市为 2026-10-18 第二轮补充）" +
        "【圣诞村最后一天】The Hyundai Seoul 圣诞村（汝矣岛 The Hyundai Seoul，室内）2026 年档期 11-08 至 12-31，今天最后一天，马戏主题「THEATRE ACROBATIQUE」；入场靠提前预约、名额秒空，昨晚没抢到的先查当天候补/放号，抢到就用它替换明洞逛街段（全室内、娃不用挨冻），抢不到按原线走，不必专程跑汝矣岛扑空。（2026-10-19 发现轮换第三轮）",
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
