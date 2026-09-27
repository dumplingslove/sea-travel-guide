import L from "leaflet";

/**
 * 高德中文底图 + WGS-84 → GCJ-02 坐标校正（2026-09-27 用户要求：行程地图用中文地图）。
 *
 * 高德瓦片按 GCJ-02 坐标系渲染，站内核实坐标是 WGS-84（Google Maps 来源）。
 * 在东南亚直接叠加会有约 100–400 米偏移，街道级放大后肉眼可见，
 * 因此所有 marker / polyline / bounds / setView / flyTo 入口统一走 LL() 转换。
 * 纯数学函数（经典 eviltransform），不依赖任何外部 API。
 */

const PI = Math.PI;
const A = 6378245.0;
const EE = 0.00669342162296594323;

function transformLat(x: number, y: number): number {
  let ret =
    -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));
  ret += ((20.0 * Math.sin(6.0 * x * PI) + 20.0 * Math.sin(2.0 * x * PI)) * 2.0) / 3.0;
  ret += ((20.0 * Math.sin(y * PI) + 40.0 * Math.sin((y / 3.0) * PI)) * 2.0) / 3.0;
  ret +=
    ((160.0 * Math.sin((y / 12.0) * PI) + 320 * Math.sin((y * PI) / 30.0)) * 2.0) / 3.0;
  return ret;
}

function transformLng(x: number, y: number): number {
  let ret =
    300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
  ret += ((20.0 * Math.sin(6.0 * x * PI) + 20.0 * Math.sin(2.0 * x * PI)) * 2.0) / 3.0;
  ret += ((20.0 * Math.sin(x * PI) + 40.0 * Math.sin((x / 3.0) * PI)) * 2.0) / 3.0;
  ret +=
    ((150.0 * Math.sin((x / 12.0) * PI) + 300.0 * Math.sin((x / 30.0) * PI)) * 2.0) / 3.0;
  return ret;
}

/**
 * WGS-84 → GCJ-02，返回 [lat, lng]。
 * 注意：经典实现里有 outOfChina 短路，但高德全球瓦片统一按 GCJ-02 渲染，
 * 海外同样存在偏移，因此不对中国境外做豁免，全部转换。
 */
export function wgs84ToGcj02(lat: number, lng: number): [number, number] {
  const dLat = transformLat(lng - 105.0, lat - 35.0);
  const dLng = transformLng(lng - 105.0, lat - 35.0);
  const radLat = (lat / 180.0) * PI;
  let magic = Math.sin(radLat);
  magic = 1 - EE * magic * magic;
  const sqrtMagic = Math.sqrt(magic);
  const adjLat = (dLat * 180.0) / (((A * (1 - EE)) / (magic * sqrtMagic)) * PI);
  const adjLng = (dLng * 180.0) / ((A / sqrtMagic) * Math.cos(radLat) * PI);
  return [lat + adjLat, lng + adjLng];
}

/** WGS-84 经纬度 → Leaflet LatLng。当前底图为 Esri（WGS-84），直接透传不做 GCJ-02 转换。 */
export function LL(lat: number, lng: number): L.LatLng {
  return L.latLng(lat, lng);
}

/** 地图底图：Google Maps 中文标注（hl=zh-CN）。2026-09-27 用户要求中文地图；高德 appmaptile 反爬返回空白图已废弃，Esri 为英文标注。Google 用 WGS-84，无需坐标转换。 */
export function addAmapTiles(map: L.Map): L.TileLayer {
  return new RetryTileLayer(
    "https://mt{s}.google.com/vt/lyrs=m&hl=zh-CN&x={x}&y={y}&z={z}",
    {
      subdomains: "0123",
      attribution: "&copy; Google Maps",
      maxZoom: 19,
    },
  ).addTo(map);
}

/**
 * 带失败重试的瓦片层（2026-09-27 全屏空白根因修复）。
 *
 * 根因（curl 实测，非推测）：Google mt*.google.com/vt 在突发高并发下会大面积杀连接
 * ——120 并发请求 86 个连接直接失败（curl 000），40 并发则 40/40 成功。
 * 全屏切换时 refit() 的 fitBounds 在更大的容器里算出更高 zoom，一次性请求上百张
 * 新瓦片 → 大量连接被杀。而 Leaflet 1.9 的 GridLayer 对失败瓦片永不重试
 * （_update 只看 _tiles 里有没有 key，有就直接复用），失败的瓦片永久留白；
 * 退出全屏时 zoom 跳变再次突发 + 坏瓦片被 _retainChildren 留住盖住好瓦片，
 * 所以退出后也不恢复。标记/路线不走网络故不受影响——与两次真机实测现象完全吻合。
 * 之前 a00853f 的 invalidateSize 之所以无效，是因为问题根本不在尺寸刷新，
 * 而在瓦片请求被服务端杀掉且永不重试。
 *
 * 修法：tileerror 后退避重试（最多 3 次，约 0.9s/1.8s/2.7s），错开突发窗口；
 * 成功后走原 _tileOnLoad → _tileReady 流程淡入，无需动 _tiles bookkeeping。
 */
class RetryTileLayer extends L.TileLayer {
  private retryTimers: number[] = [];

  onAdd(map: L.Map): this {
    super.onAdd(map);
    this.on("tileerror", this.retryTile, this);
    return this;
  }

  onRemove(map: L.Map): this {
    this.off("tileerror", this.retryTile, this);
    for (const t of this.retryTimers) window.clearTimeout(t);
    this.retryTimers = [];
    super.onRemove(map);
    return this;
  }

  private retryTile(e: L.TileErrorEvent): void {
    const tile = e.tile as HTMLImageElement & { _retryCount?: number };
    const used = tile._retryCount ?? 0;
    if (used >= 3) return;
    tile._retryCount = used + 1;
    const timer = window.setTimeout(
      () => {
        // 瓦片仍在 DOM 里才重发；img 上的 load/error 监听还在，
        // 成功会走正常 _tileReady 淡入流程
        if (tile.isConnected) {
          // 根因修复（2026-09-27 全屏缩放无细节 bug）：getTileUrl() 拼 z 时用的是
          // 当前 this._tileZoom 而不是失败瓦片自己的 e.coords.z。用户在退避窗口
          // （0.9s/1.8s/2.7s）内继续缩放是常态，此时重试会用旧 x/y 配新 z，
          // 请求到完全错位的瓦片：既浪费了重试，又把错位图钉进格子标记为 loaded，
          // 该格子就再也拿不到正确的细节瓦片——放大后只剩拉伸的低层级父瓦片。
          // 这里把 _tileZoom 临时钉在失败瓦片自己的层级上再拼 URL（同步执行，
          // 无重入问题），用完立即恢复。
          const cur = this._tileZoom;
          this._tileZoom = e.coords.z;
          tile.src = this.getTileUrl(e.coords);
          this._tileZoom = cur;
        }
      },
      900 * (used + 1),
    );
    this.retryTimers.push(timer);
  }
}
