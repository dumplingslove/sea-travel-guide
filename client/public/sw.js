/* 东南亚旅行指南 PWA service worker：network-first + 缓存兜底。
 * 只缓存同站 GET 请求；在线时永远拿最新构建，不会把旧包钉死在用户手机上。
 * 存在 fetch 处理器是 Chrome 判定"可安装"的必要条件之一。 */
const CACHE = "sea-guide-v1";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith(
    fetch(request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((cache) => cache.put(request, copy));
        return res;
      })
      .catch(() =>
        caches.match(request).then(
          (cached) => cached || caches.match("/sea-travel-guide/index.html"),
        ),
      ),
  );
});
