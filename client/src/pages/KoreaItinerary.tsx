import { ItineraryTab } from "./Home";

/**
 * 韩国行程页（/korea）：首尔段逐日行程卡 + 推荐第二城「水原」当日往返模块。
 *
 * 为什么是水原：韩国段只有 2 天、2 大 1 小（娃约 2 岁半）、1 月出行——
 * 釜山/全州都要 KTX 1.5～2.5 小时单程、至少住一晚，2 天行程里转场成本太高；
 * 水原离首尔 30～40 分钟，当日往返、不用换酒店，是时间上最合适的第二城。
 */
function SuwonDayTrip() {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
      <h3 className="font-bold text-gray-900 mb-1">
        🏯 推荐第二城：水原 Suwon（首尔出发当日往返，不换酒店）
      </h3>
      <p className="text-xs text-gray-500 mb-3">
        2 天韩国行程里塞不下过夜的第二城；水原 30～40 分钟即达，半天到一天刚好，带娃无压力
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

export default function KoreaItinerary() {
  return (
    <div className="max-w-5xl mx-auto px-4 pb-8">
      <SuwonDayTrip />
      <ItineraryTab koreaOnly />
    </div>
  );
}
