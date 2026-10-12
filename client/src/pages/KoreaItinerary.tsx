import { ItineraryTab } from "./Home";
import { RestaurantCatalog, AttractionCatalog } from "../guide/GuideApp";

/**
 * 韩国行程页（/korea）：首尔段逐日行程卡 + 推荐第二城「水原」当日往返模块。
 *
 * 为什么是水原：韩国段只有 2 天、2 大 1 小（娃约 2 岁半）、1 月出行——
 * 釜山/全州都要 KTX 1.5～2.5 小时单程、至少住一晚，2 天行程里转场成本太高；
 * 水原离首尔 30～40 分钟，当日往返、不用换酒店，是时间上最合适的第二城。
 */
function SuwonDayTrip({ embedded = false }: { embedded?: boolean }) {
  return (
    <div
      className={`bg-amber-50 border border-amber-200 rounded-xl p-4 ${embedded ? "" : "mb-6"}`}
    >
      <h3 className="font-bold text-gray-900 mb-1">
        {embedded
          ? "🏯 本日备选：水原一日游（当日往返，不换酒店）"
          : "🏯 推荐第二城：水原 Suwon（首尔出发当日往返，不换酒店）"}
      </h3>
      <p className="text-xs text-gray-500 mb-3">
        {embedded
          ? "2 天里只有今天能抽出一整天；水原 30～40 分钟即达，半天到一天刚好，带娃无压力"
          : "2 天韩国行程里塞不下过夜的第二城；水原 30～40 分钟即达，半天到一天刚好，带娃无压力"}
      </p>
      <div className="text-sm text-gray-700 space-y-2">
        <p>
          <b>怎么去：</b>首尔站 KTX/SRT 到水原站约 30 分钟；或地铁 1 号线直达约 1
          小时；江南高速巴士约 40～50 分钟。水原站出来打车 10 分钟到水原华城。
        </p>
        <p>
          <b>玩什么：</b>水原华城（UNESCO 世界遗产，5.7 公里城墙，大段平坦好走）→
          华城行宫 → 八达门传统市场 → 水原通鸡街（炸鸡一条街）。带娃推荐坐「华城御车」
          环城小火车，不用全程暴走。
        </p>
        <p>
          <b>带娃 & 1 月防寒：</b>城墙段风大，推车选华城行宫一带平地区域；冷了就躲进
          水原华城博物馆、行宫室内展馆。八达门市场有热食，娃的加餐好解决。
        </p>
        <p>
          <b>时间安排建议：</b>占首尔 2 天中的一整天（约 6～7 小时含往返），当天回首尔住，
          不影响第二天去仁川机场飞西雅图。
        </p>
        <p className="text-xs text-gray-500">
          备选：如果以后韩国段能加到 3～4 天，第二城再考虑全州（KTX 1.5
          小时，韩屋村+美食，需住一晚）。
        </p>
      </div>
    </div>
  );
}

/** 首尔餐厅推荐：复用餐厅目录，仅显示首尔（6家均已做小红书实测） */
function SeoulRestaurants() {
  return (
    <section className="mb-6">
      <h2 className="text-lg font-bold text-gray-900 mb-1">🍽️ 首尔餐厅推荐</h2>
      <p className="text-xs text-gray-500 mb-3">
        6家小红书已实测：明洞饺子、土俗村参鸡汤、陈玉华一只鸡、神仙雪浓汤、王妃家烤肉、桥村炸鸡
      </p>
      <RestaurantCatalog scopeCities={["首尔"]} hideCityTabs bare />
    </section>
  );
}

/** 首尔景点推荐：复用景点目录，仅显示首尔（15个均已做小红书实测） */
function SeoulAttractions() {
  return (
    <section className="mb-6">
      <h2 className="text-lg font-bold text-gray-900 mb-1">📍 首尔景点推荐</h2>
      <p className="text-xs text-gray-500 mb-3">
        15个小红书已实测：景福宫、北村韩屋村、明洞、南山首尔塔、圣水洞、星空图书馆、广藏市场等
      </p>
      <AttractionCatalog scopeCities={["首尔"]} hideCityTabs />
    </section>
  );
}

export default function KoreaItinerary() {
  return (
    <div className="max-w-5xl mx-auto px-4 pb-8">
      {/* 2026-10-12 用户：水原一日游不要页顶单独写，容进 D34（韩国首日）行程卡后面作备选 */}
      <ItineraryTab
        koreaOnly
        renderDayExtra={(_day, i) => (i === 0 ? <SuwonDayTrip embedded /> : null)}
      />
      <SeoulRestaurants />
      <SeoulAttractions />
    </div>
  );
}
