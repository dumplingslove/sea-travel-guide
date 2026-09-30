/**
 * 餐厅预订政策（研究结论，供行程页/预订页展示）。
 *
 * 数据源：bookings/bookingGuideData.ts（2026-09-17 联网核实的 211 条预订分类）。
 * 键为 guide/data.ts 的餐厅名，值为指南分类：
 * - must_book / peak_recommended → 查过，需要/建议预定
 * - walkup_or_queue / free_no_booking → 查过，不需要预定（可当天前往/排队）
 * - 指南中没有的 → 没查过，如实标注「预定状态未查询」，不留空让人猜
 *
 * 有实时空位数据（sea_availability）时优先显示空位徽章，本模块只处理
 * “没有空位数据”的情况。
 */

export type BookingPolicy = 'must_book' | 'peak_recommended' | 'walkup_or_queue' | 'free_no_booking';

const POLICY: Record<string, { policy: BookingPolicy; reason: string }> = {
  '328 Katong Laksa': { policy: 'walkup_or_queue', reason: '叻沙名店，现场排队' },
  '888 Hokkien Mee（Three Road）': { policy: 'walkup_or_queue', reason: '街头小吃名店，现场排队' },
  'Acqua': { policy: 'peak_recommended', reason: '意大利 fine dining，建议订位' },
  'Air Itam Bisu Laksa': { policy: 'walkup_or_queue', reason: '街头小吃名店，现场排队' },
  'Anan Saigon': { policy: 'must_book', reason: '米其林一星越南菜，百盛/旧市场顶楼' },
  'Au Jardin': { policy: 'must_book', reason: '槟城 fine dining 代表，需提前订位' },
  'Banh Mi Huynh Hoa': { policy: 'walkup_or_queue', reason: '最贵法棍名店，现场排队' },
  'Beta KL': { policy: 'must_book', reason: '热门泰式 fine dining，需提前订位' },
  'Blue Elephant': { policy: 'peak_recommended', reason: '普吉老洋房泰餐，游客热门' },
  'Bun Quay Kien Xay': { policy: 'walkup_or_queue', reason: '富国岛特色粉，现场排队' },
  'Burnt Ends': { policy: 'must_book', reason: '米其林一星烧烤' },
  'Candlenut': { policy: 'peak_recommended', reason: '米其林一星娘惹菜，建议订位' },
  'CEKI Nyonya': { policy: 'peak_recommended', reason: '米其林入选娘惹菜；商家建议午/晚餐订位（Google Maps），电话 +60 11-1051 7976 可订；非高峰可 walk-in 小等' },
  'Chim by Chef Noom': { policy: 'must_book', reason: '热门泰式 fine dining，需提前订位' },
  'Com Tam Ba Ghien': { policy: 'walkup_or_queue', reason: '粉/碎饭名店，现场排队' },
  'Cong Caphe': { policy: 'walkup_or_queue', reason: '连锁越共风咖啡，现场点单' },
  'Crab House': { policy: 'walkup_or_queue', reason: '螃蟹主题餐厅，现场等位' },
  'Cuc Gach Quan': { policy: 'peak_recommended', reason: '老洋房越菜热门店，建议订位' },
  'Côte by Mauro Colagreco': { policy: 'must_book', reason: '米其林星级滨江法餐，热门时段需预订' },
  'DC by Darren Chin': { policy: 'must_book', reason: '米其林一星法餐' },
  'Dash! Restaurant': { policy: 'walkup_or_queue', reason: '泰北菜餐厅，现场等位' },
  'Dewakan': { policy: 'must_book', reason: '米其林二星现代马来菜，全马最难订' },
  'Dinh Cau Night Market': { policy: 'free_no_booking', reason: '夜市免费逛' },
  'Gaggan': { policy: 'must_book', reason: '名厨Gaggan Anand旗舰店， tasting menu一位难求' },
  'Ginger Farm Kitchen': { policy: 'walkup_or_queue', reason: '热门泰北菜，现场等位（Ginger Farm分店多可分流）' },
  'Green House Prawn Mee': { policy: 'walkup_or_queue', reason: '街头小吃名店，现场排队' },
  'Gulainya': { policy: 'walkup_or_queue', reason: '本地餐厅，现场等位' },
  'Ham Ninh 渔村': { policy: 'walkup_or_queue', reason: '渔村海鲜排档，现场点菜' },
  'Hameediyah': { policy: 'walkup_or_queue', reason: '街头小吃名店，现场排队' },
  'Hill Street Tai Hwa': { policy: 'walkup_or_queue', reason: '米其林一星小贩，不接受预订，现场排队' },
  'Huen Phen': { policy: 'walkup_or_queue', reason: '兰纳菜老字号，现场排队' },
  'Jalan Alor': { policy: 'free_no_booking', reason: '夜市美食街免费逛' },
  'Jampa': { policy: 'peak_recommended', reason: '米其林绿星，农场直供热门餐厅' },
  'Jay Fai': { policy: 'walkup_or_queue', reason: '不接受预订，现场排队取号是唯一方式' },
  'Jumbo Seafood': { policy: 'peak_recommended', reason: '辣椒螃蟹名店，12月旺季建议订位' },
  'Kan Eang@Pier': { policy: 'peak_recommended', reason: '查龙码头海鲜老店，日落位抢手' },
  'Khao Kha Moo Chang Phueak': { policy: 'walkup_or_queue', reason: '深夜猪脚饭名店，现场排队' },
  'Khao Soi Khun Yai': { policy: 'walkup_or_queue', reason: '咖喱面街边老店，现场排队' },
  'Kiti Panit': { policy: 'walkup_or_queue', reason: '本地泰餐馆，现场等位' },
  'Labyrinth': { policy: 'must_book', reason: '米其林一星新式新加坡菜' },
  'Lau Pa Sat': { policy: 'free_no_booking', reason: '熟食中心无需预订' },
  'Le Du': { policy: 'must_book', reason: '米其林一星现代泰菜，热门餐厅' },
  'Lot 10 Hutong': { policy: 'free_no_booking', reason: '商场美食广场无需预订' },
  'Maxwell Food Centre': { policy: 'free_no_booking', reason: '熟食中心无需预订' },
  'Nadodi': { policy: 'must_book', reason: '米其林一星南印 fine dining' },
  'Nahm': { policy: 'must_book', reason: '曼谷文华东方酒店内泰餐，酒店住客/游客热门' },
  'Nasi Kandar Line Clear': { policy: 'walkup_or_queue', reason: '街头小吃名店，现场排队' },
  'Nusara': { policy: 'must_book', reason: '名厨Ton的泰式fine dining，座位少' },
  'Ocean Club': { policy: 'peak_recommended', reason: '丽晶/洲际海滩餐厅，日落位建议预订' },
  'Odette': { policy: 'must_book', reason: '米其林三星+亚洲第一，新加坡最难订' },
  'Old Airport Road': { policy: 'free_no_booking', reason: '熟食中心无需预订' },
  'On the Rocks': { policy: 'peak_recommended', reason: '丽晶/洲际海滩餐厅，日落位建议预订' },
  'Or Tor Kor Market': { policy: 'free_no_booking', reason: '高档美食广场，无需预订' },
  'PRU': { policy: 'must_book', reason: '米其林一星，普吉唯一星级fine dining' },
  'Penang Road Teochew Chendul': { policy: 'walkup_or_queue', reason: '街头小吃名店，现场排队' },
  'Pho Hoa Pasteur': { policy: 'walkup_or_queue', reason: '粉/碎饭名店，现场排队' },
  'Pink Pearl': { policy: 'must_book', reason: 'JW万豪 Bill Bensley 设计餐厅，fine dining 需提前订位' },
  'Pot au Pho': { policy: 'walkup_or_queue', reason: '概念备选店，现场灵活安排' },
  'Potong': { policy: 'must_book', reason: '米其林一星，唐人街 heritage shophouse 餐厅' },
  'Raya': { policy: 'walkup_or_queue', reason: '米其林推荐老字号，现场排队' },
  'Roti Taew Nam': { policy: 'walkup_or_queue', reason: '普吉老街小吃，现场购买' },
  '鲁通船面 Ruathong Noodle': { policy: 'walkup_or_queue', reason: '胜利纪念碑船面老店，现场排队；中午11:00–12:00到，晚了要排队' },
  '通思密 Thong Smith': { policy: 'walkup_or_queue', reason: '商场精致船面，周末高峰拿号排队（曾排50分钟）' },
  'SP Chicken': { policy: 'walkup_or_queue', reason: '咖喱面街边老店，现场排队' },
  'Siam Road Char Kway Teow': { policy: 'walkup_or_queue', reason: '街头小吃名店，现场排队' },
  'Song Fa': { policy: 'walkup_or_queue', reason: '肉骨茶/咖椰吐司名店，现场排队' },
  'Sorn': { policy: 'must_book', reason: '米其林三星泰南菜，全球最难订餐厅之一' },
  'Suay': { policy: 'peak_recommended', reason: '热门创意泰餐，建议订位' },
  'Sühring': { policy: 'must_book', reason: '米其林二星现代德国菜，需提前订位' },
  'THIRTY8': { policy: 'peak_recommended', reason: 'Grand Hyatt 高空景观餐厅，建议订位' },
  'Tempus Fugit': { policy: 'must_book', reason: 'JW万豪 fine dining，需提前订位' },
  'The Deck Saigon': { policy: 'peak_recommended', reason: '西贡河畔热门餐厅，日落位抢手' },
  'The Workshop Coffee': { policy: 'walkup_or_queue', reason: '精品咖啡，现场等位' },
  'Thipsamai': { policy: 'walkup_or_queue', reason: '帕泰名店，现场排队' },
  'Tong Tem Toh': { policy: 'walkup_or_queue', reason: '热门泰北菜，现场等位（Ginger Farm分店多可分流）' },
  'Tu Kab Khao': { policy: 'walkup_or_queue', reason: '本地人餐厅，现场等位' },
  'Village Park': { policy: 'walkup_or_queue', reason: 'Nasi Lemak 名店，现场排队' },
  'Xin Chao Seafood': { policy: 'walkup_or_queue', reason: '海鲜餐厅，现场等位' },
  'Ya Kun Kaya Toast': { policy: 'walkup_or_queue', reason: '肉骨茶/咖椰吐司名店，现场排队' },
  '耀华力夜市 / T&K': { policy: 'walkup_or_queue', reason: '唐人街海鲜大排档，现场等位' },
};

/** 查餐厅的预订政策研究结论；指南没覆盖的返回 null（= 没查过）。 */
export function getRestaurantBookingPolicy(name: string): { policy: BookingPolicy; reason: string } | null {
  return POLICY[name] ?? null;
}

/** 徽章文案与颜色：必须明确区分「没查」和「查过但不需要预订」。 */
export function bookingPolicyBadge(name: string): { text: string; cls: string; title: string } {
  const hit = getRestaurantBookingPolicy(name);
  if (!hit) {
    return {
      text: "预定状态未查询",
      cls: "bg-gray-100 text-gray-500 border-gray-200",
      title: "这家餐厅的预订政策还没查过，不是“不需要预订”的意思",
    };
  }
  switch (hit.policy) {
    case "must_book":
      return { text: "需要预定", cls: "bg-rose-100 text-rose-700 border-rose-200", title: `已研究：${hit.reason}` };
    case "peak_recommended":
      return { text: "建议预定", cls: "bg-amber-100 text-amber-700 border-amber-200", title: `已研究：${hit.reason}` };
    case "walkup_or_queue":
      return { text: "无需预定·可排队", cls: "bg-sky-100 text-sky-700 border-sky-200", title: `已研究：${hit.reason}。可当天前往或现场排队` };
    case "free_no_booking":
      return { text: "无需预定", cls: "bg-emerald-100 text-emerald-700 border-emerald-200", title: `已研究：${hit.reason}` };
  }
}
