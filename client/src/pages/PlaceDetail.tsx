/**
 * 独立地点详情页（对标意大利站 /attraction/:id）。
 * 三个路由共用：/attraction/:slug /restaurant/:slug /hotel/:slug
 */
import { useParams, Link } from "react-router-dom";
import { useEffect } from "react";
import { getPlaceGallery } from "@/guide/placeGalleries";
import { attractionGuides } from "@/guide/attractionGuides";
import { getLiveHotelPrice } from "@/guide/hotelLivePrices";
import {
  findPlace,
  KIND_ZH,
  type PlaceKind,
} from "@/guide/placeDetail";
import { placesForCity } from "@/data/placeCoords";
import { CITY_ID_BY_ZH } from "@/data/cityCoords";

function NotFound({ kind }: { kind: PlaceKind }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">未找到该{KIND_ZH[kind]}</h2>
        <p className="text-gray-500 mb-6">链接可能已过期，或该地点已从行程中移除。</p>
        <Link to="/" className="text-teal-700 font-medium underline">
          返回首页
        </Link>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-8">
      <h2 className="text-xl font-bold text-teal-900 mb-3">{title}</h2>
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        {children}
      </div>
    </section>
  );
}

export default function PlaceDetailPage({ kind }: { kind: PlaceKind }) {
  const { slug } = useParams<{ slug: string }>();
  const item = slug ? findPlace(kind, slug) : undefined;
  const kindZh = KIND_ZH[kind];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!item) return <NotFound kind={kind} />;

  const photos = getPlaceGallery(kindZh, item);
  const hero = photos[0];
  const guide = kind === "attraction" ? attractionGuides[item.city]?.[item.name] : undefined;
  const livePrice = kind === "hotel" ? getLiveHotelPrice(item.name) : undefined;

  // 坐标（4 个云端城市有核验坐标）
  const cityId = CITY_ID_BY_ZH[item.city] || "";
  const { hotels, restaurants } = placesForCity(cityId);
  const coordList = kind === "hotel" ? hotels : kind === "restaurant" ? restaurants : [];
  const coord = coordList.find((p) => p.name === item.name || item.name.includes(p.name) || p.name.includes(item.name));

  return (
    <div className="bg-[#f7f4ee] min-h-screen">
      {/* Hero */}
      <div className="relative h-[42vh] min-h-[300px] overflow-hidden bg-teal-900">
        {hero ? (
          <img
            src={hero.src}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full grid place-items-center text-white/40 text-6xl">
            {kind === "attraction" ? "🏛️" : kind === "restaurant" ? "🍽️" : "🏨"}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-end">
          <div className="max-w-4xl mx-auto px-4 pb-8 w-full">
            <Link
              to="/"
              className="inline-flex items-center gap-1 text-white/90 hover:text-white text-sm mb-3"
            >
              ← 返回行程
            </Link>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold text-white bg-white/20 backdrop-blur-sm rounded-full px-2.5 py-1">
                {kindZh}
              </span>
              <span className="text-xs font-bold text-white bg-white/20 backdrop-blur-sm rounded-full px-2.5 py-1">
                📍 {item.city}
              </span>
              {item.michelin && (
                <span className="text-xs font-bold text-white bg-red-600/80 backdrop-blur-sm rounded-full px-2.5 py-1">
                  {item.michelin}
                </span>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">
              {item.name}
            </h1>
            {item.meta && (
              <p className="text-white/80 text-sm mt-2">{item.meta}</p>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 总评 / 详情 */}
        <Section title={guide ? "💡 一句话点评" : "📝 介绍"}>
          {guide ? (
            <p className="text-gray-800 leading-relaxed">{guide.verdict}</p>
          ) : (
            <p className="text-gray-800 leading-relaxed">{item.detail}</p>
          )}
          {item.source && (
            <p className="text-xs text-gray-400 mt-3">{item.source}</p>
          )}
        </Section>

        {/* 景点：亮点 */}
        {guide && guide.highlights.length > 0 && (
          <Section title="✨ 必看亮点">
            <ul className="space-y-4">
              {guide.highlights.map((h, i) => (
                <li key={i}>
                  <p className="font-bold text-gray-900">{h.name}</p>
                  <p className="text-sm text-gray-700 leading-relaxed mt-1">
                    {h.description}
                  </p>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* 景点：历史 */}
        {guide && guide.history && (
          <Section title="📜 历史人文">
            {guide.history.split("\n\n").map((para, i) => (
              <p key={i} className="text-sm text-gray-700 leading-relaxed mb-3 last:mb-0">
                {para}
              </p>
            ))}
          </Section>
        )}

        {/* 景点：游览建议 */}
        {guide && (
          <Section title="🧭 游览建议">
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-bold">建议时长：</span>
                {guide.visit.duration}
              </p>
              <p>
                <span className="font-bold">最佳时间：</span>
                {guide.visit.bestTime}
              </p>
              {guide.visit.tips.length > 0 && (
                <ul className="list-disc list-inside space-y-1 mt-2 text-gray-700">
                  {guide.visit.tips.map((t, i) => (
                    <li key={i}>{t}</li>
                  ))}
                </ul>
              )}
            </div>
          </Section>
        )}

        {/* 酒店：实时房价 */}
        {kind === "hotel" && livePrice && !livePrice.unavailable && (
          <Section title="💰 按行程日期实时房价（USD）">
            <p className="text-xs text-gray-500 mb-2">
              {livePrice.checkIn} → {livePrice.checkOut}（{livePrice.nights} 晚）
            </p>
            {livePrice.base && (
              <p className="text-sm mb-1">
                <span className="font-bold">基础房</span> ${livePrice.base.perNightUSD}
                /晚 · 整段 ${livePrice.base.totalUSD}
                {livePrice.base.totalInclTax ? "（含税）" : "（税前）"} ·{" "}
                {livePrice.base.cancel} · {livePrice.base.breakfast}
              </p>
            )}
            {livePrice.suite && (
              <p className="text-sm">
                <span className="font-bold">套房</span> ${livePrice.suite.perNightUSD}
                /晚 · 整段 ${livePrice.suite.totalUSD}
                {livePrice.suite.totalInclTax ? "（含税）" : "（税前）"} ·{" "}
                {livePrice.suite.cancel} · {livePrice.suite.breakfast}
              </p>
            )}
            <p className="text-xs text-gray-400 mt-2">
              来源 {livePrice.source} · 查询于 {livePrice.checkedAt} · 房价实时波动，以下单时为准
            </p>
          </Section>
        )}

        {/* 酒店：口碑 */}
        {kind === "hotel" && item.hotelAcclaim && (
          <Section title="🏆 公认口碑">
            <p className="text-sm text-gray-700 leading-relaxed">
              {item.hotelAcclaim}
            </p>
          </Section>
        )}

        {/* 餐厅/酒店：推荐理由 */}
        {item.best && (
          <Section title="💡 推荐理由">
            <p className="text-sm text-gray-700 leading-relaxed">{item.best}</p>
          </Section>
        )}

        {/* 位置 */}
        {coord && (
          <Section title="📍 位置">
            <p className="text-sm text-gray-700">
              {coord.note ? `${coord.note} · ` : ""}
              坐标 {coord.lat.toFixed(5)}, {coord.lng.toFixed(5)}
              <span className="text-gray-400">
                {" "}
               （{coord.precision === "exact" ? "精确到店面" : coord.precision === "building" ? "同建筑内" : coord.precision === "street" ? "街道级" : coord.precision === "area" ? "区域级" : "连锁代表店"}）
              </span>
            </p>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${coord.lat},${coord.lng}`}
              target="_blank"
              rel="noreferrer"
              className="inline-block mt-2 text-sm font-medium text-teal-700 underline"
            >
              在 Google 地图打开 →
            </a>
          </Section>
        )}

        {/* 照片 */}
        {photos.length > 1 && (
          <Section title={`📸 照片（${photos.length}）`}>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {photos.slice(1, 7).map((p, i) => (
                <img
                  key={i}
                  src={p.src}
                  alt={`${item.name} ${i + 2}`}
                  className="w-full h-36 object-cover rounded-lg"
                  loading="lazy"
                />
              ))}
            </div>
          </Section>
        )}

        {/* 官方链接 */}
        {item.officialUrl && (
          <div className="mb-8">
            <a
              href={item.officialUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-sm font-medium text-teal-700 underline"
            >
              官方页面 ↗
            </a>
            {item.officialCheck && (
              <p className="text-xs text-gray-400 mt-1">{item.officialCheck}</p>
            )}
          </div>
        )}

        <div className="flex gap-4 mb-8">
          <Link
            to="/"
            className="text-sm font-medium text-teal-700 underline"
          >
            ← 返回行程总览
          </Link>
          {kind === "hotel" && (
            <Link
              to="/hotels"
              className="text-sm font-medium text-teal-700 underline"
            >
              看全部酒店 →
            </Link>
          )}
          {kind === "restaurant" && (
            <Link
              to="/restaurants"
              className="text-sm font-medium text-teal-700 underline"
            >
              看全部餐厅 →
            </Link>
          )}
          {kind === "attraction" && (
            <Link
              to="/attractions"
              className="text-sm font-medium text-teal-700 underline"
            >
              看全部景点 →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

// 三个路由的薄包装（对标意大利站 AttractionDetail / HotelDetail / RestaurantDetail）
export function AttractionDetailPage() {
  return <PlaceDetailPage kind="attraction" />;
}
export function RestaurantDetailPage() {
  return <PlaceDetailPage kind="restaurant" />;
}
export function HotelDetailPage() {
  return <PlaceDetailPage kind="hotel" />;
}
