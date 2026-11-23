/**
 * 独立详情页的 slug 工具（对标意大利站 /attraction/:id）。
 * slug = {city-code}-{name-slug}，全站 262 个点位（107 景点 + 90 餐厅 + 65 酒店）零冲突（2026-10-13 复核：程序实算 placeSlug 全量去重，含首尔段加入后的新增点位）。
 */
import { attractions, restaurants, hotels, type Item } from "@/guide/data";

export type PlaceKind = "attraction" | "restaurant" | "hotel";

export const KIND_ZH: Record<PlaceKind, "景点" | "餐厅" | "酒店"> = {
  attraction: "景点",
  restaurant: "餐厅",
  hotel: "酒店",
};

const CITY_CODE: Record<string, string> = {
  曼谷: "bangkok",
  清迈: "chiangmai",
  普吉: "phuket",
  槟城: "penang",
  吉隆坡: "kualalumpur",
  胡志明市: "hochiminh",
  富国岛: "phuquoc",
  新加坡: "singapore",
  首尔: "seoul",
};

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(
      /[\s·・&,，、\/\(\)\[\]（）「」『』:：;；!！?？."“”‘’—\-–+＋_]+/g,
      "-",
    )
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/** 详情页 URL slug，如 bangkok-大皇宫-玉佛寺、singapore-小印度 */
export function placeSlug(city: string, name: string): string {
  const cityCode = CITY_CODE[city] || slugify(city);
  return `${cityCode}-${slugify(name)}`;
}

/** 按 kind + slug 找 Item */
export function findPlace(kind: PlaceKind, slug: string): Item | undefined {
  const list =
    kind === "attraction"
      ? attractions
      : kind === "restaurant"
        ? restaurants
        : hotels;
  return list.find((it) => placeSlug(it.city, it.name) === slug);
}

/** Item → 详情页路径 */
export function placeDetailPath(
  kind: PlaceKind,
  city: string,
  name: string,
): string {
  const seg =
    kind === "attraction"
      ? "attraction"
      : kind === "restaurant"
        ? "restaurant"
        : "hotel";
  return `/${seg}/${placeSlug(city, name)}`;
}

/** 中文 kind → PlaceKind */
export function kindFromZh(
  zh: "景点" | "餐厅" | "酒店",
): PlaceKind {
  return zh === "景点"
    ? "attraction"
    : zh === "餐厅"
      ? "restaurant"
      : "hotel";
}

/* ---------------- 餐厅菜系（2026-11-22 用户要求：详情页第一行亮菜系） ----------------
 * 来源优先级：① 下面的逐家定表（文案里没直写菜系、但 detail/证据里有实据的，
 * 如 Odette 的「现代法餐」见 research_notes singapore.md 与小红书审计帖、
 * Gaggan 的「印度香料重口」见其 detail 原文）；② meta/detail 文案里的菜系词
 * 按上表顺序提取（先 meta 后 detail，长的/具体的词在前，避免「现代泰餐」
 * 被截成「泰餐」这类误切）；③ 都没有 → 「菜系待核验」，绝不凭常识编。
 * 定表里的每一项都能在 data.ts 文案或已有证据文件里找到出处。 */
const CUISINE_BY_NAME: Record<string, string> = {
  Gaggan: "印度风味 · 表演式长菜单",
  "Jay Fai": "泰式街头小吃",
  Thipsamai: "泰式炒河粉",
  "Or Tor Kor Market": "生鲜市场 · 熟食",
  "Khao Soi Khun Yai": "泰北咖喱面",
  "Dash! Restaurant": "泰北家常菜",
  "Ginger Farm Kitchen": "泰餐",
  PRU: "农场到餐桌",
  "Blue Elephant": "泰式皇家菜",
  Suay: "泰法融合菜",
  "Roti Taew Nam": "泰式烤饼 · 玛莎曼咖喱",
  Odette: "现代法餐",
  Labyrinth: "新加坡食阁菜 · fine dining",
  "Lau Pa Sat": "熟食中心 · 沙爹街",
  "Ya Kun Kaya Toast": "咖椰吐司 · 新加坡早餐",
  "Tong Tem Toh": "兰纳菜",
  "Hill Street Tai Hwa": "粿条面",
};

/** 菜系关键词（按具体程度排序；meta 先于 detail 查） */
const CUISINE_KEYWORDS: [string, string][] = [
  ["泰南菜", "泰南菜"],
  ["现代泰餐", "现代泰餐"],
  ["泰中融合", "泰中融合"],
  ["泰华", "泰华菜"],
  ["兰纳菜", "兰纳菜"],
  ["泰北菜", "泰北菜"],
  ["现代德国菜", "现代德国菜"],
  ["地中海", "地中海料理"],
  ["意大利餐", "意大利菜"],
  ["娘惹菜", "娘惹菜"],
  ["娘惹", "娘惹菜"],
  ["海南鸡饭", "海南鸡饭"],
  ["肉骨茶", "肉骨茶"],
  ["叻沙", "叻沙"],
  ["粿条", "粿条"],
  ["船面", "船面"],
  ["猪脚饭", "猪脚饭"],
  ["参鸡汤", "参鸡汤"],
  ["刀削面", "刀削面"],
  ["蒸饺", "蒸饺"],
  ["一只鸡", "一只鸡"],
  ["雪浓汤", "雪浓汤"],
  ["韩式烤肉", "韩式烤肉"],
  ["韩式炸鸡", "韩式炸鸡"],
  ["柴火烧烤", "柴火烧烤"],
  ["农场到餐桌", "农场到餐桌"],
  ["柴火料理", "柴火料理"],
  ["熟食中心", "熟食中心"],
  ["小贩", "小贩美食"],
  ["夜市", "夜市小吃"],
  ["扫街", "街头小吃"],
  ["炭火烤鸡", "炭火烤鸡"],
  ["海鲜", "海鲜"],
  ["泰餐", "泰餐"],
  ["韩牛", "韩牛烤肉"],
];

/** 餐厅 → 菜系展示文案；文案与证据里都找不到时返回「菜系待核验」。 */
export function restaurantCuisine(item: Item): string {
  const fixed = CUISINE_BY_NAME[item.name];
  if (fixed) return fixed;
  for (const [kw, label] of CUISINE_KEYWORDS) {
    if (item.meta.includes(kw)) return label;
  }
  for (const [kw, label] of CUISINE_KEYWORDS) {
    if (item.detail.includes(kw)) return label;
  }
  return "菜系待核验";
}

/** 谷歌地图搜索链接：名字+城市拼出来，可生成，不算编造。 */
export function placeMapsUrl(item: Item): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${item.name} ${item.city}`,
  )}`;
}

/** 地址本身拼谷歌地图搜索链接：地址文字就是链接，点一下直达谷歌地图。 */
export function mapsUrlForAddress(address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

/* ---------------- 官网地址（2026-11-22 追加 2：只认已核实的，不猜） ----------------
 * 来源：① Item 自带的 officialUrl（目前只有酒店 H() 会填）；② 下面这张表——
 * 每一项都是 research_notes/sea-guide-2026 里写明的官方地址原文：
 * 滨海湾花园 gardensbythebay.com.sg、新加坡动物园/夜间动物园 mandai.com 对应单页、
 * 大皇宫 royalgrandpalace.th/en/home。其余餐厅/景点在证据里没有写明官网地址，
 * 一律返回 null、调用方如实标「官网待核验」，绝不猜 URL。 */
const OFFICIAL_URL_BY_NAME: Record<string, string> = {
  "滨海湾花园": "https://www.gardensbythebay.com.sg/",
  "新加坡动物园与Bird Paradise":
    "https://www.mandai.com/en/tickets-and-passes/single-attractions/singapore-zoo.html",
  "夜间动物园":
    "https://www.mandai.com/en/tickets-and-passes/single-attractions/night-safari.html",
  "大皇宫 & 玉佛寺": "https://royalgrandpalace.th/en/home",
};

/** 地点官网：Item 自带优先，其次上表；都没有返回 null（调用方标「官网待核验」）。 */
export function placeOfficialUrl(item: Item): string | null {
  return item.officialUrl ?? OFFICIAL_URL_BY_NAME[item.name] ?? null;
}
