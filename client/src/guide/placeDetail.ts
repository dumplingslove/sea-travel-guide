/**
 * 独立详情页的 slug 工具（对标意大利站 /attraction/:id）。
 * slug = {city-code}-{name-slug}，全站 222 个点位（91 景点 + 80 餐厅 + 51 酒店）零冲突（2026-09-26 核验）。
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
