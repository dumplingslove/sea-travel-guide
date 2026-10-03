import { useEffect } from "react";
import { Link, LinkProps } from "react-router-dom";

/**
 * 通用详情返回位置（2026-10-03 用户要求：所有景点/酒店/餐厅/航班入口统一）
 * 
 * 用法：
 * 1. 在有详情链接的页面顶部调用 useDetailReturn("pageKey")
 * 2. 用 <DetailLink to={...} cardId={...}> 代替 <Link>
 * 
 * 跳详情前自动存 cardId + scrollY 到 sessionStorage；
 * 返回时自动滚回原卡片位置。
 */

const STORAGE_KEY = "detailReturnScroll";

interface ReturnState {
  pageKey: string;
  cardId: string;
  scrollY: number;
  at: number;
}

/** 在页面挂载时检查是否有待恢复的滚动位置 */
export function useDetailReturn(pageKey: string) {
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const state: ReturnState = JSON.parse(raw);
      // 只恢复同一页面的位置，且 5 分钟内有效
      if (state.pageKey !== pageKey) return;
      if (Date.now() - state.at > 5 * 60 * 1000) {
        sessionStorage.removeItem(STORAGE_KEY);
        return;
      }
      sessionStorage.removeItem(STORAGE_KEY);
      // 等 DOM 渲染完再滚
      requestAnimationFrame(() => {
        setTimeout(() => {
          // 先试 cardId 锚点
          if (state.cardId) {
            const el = document.getElementById(state.cardId) 
              || document.querySelector(`[data-card-id="${state.cardId}"]`);
            if (el) {
              el.scrollIntoView({ block: "center", behavior: "auto" });
              return;
            }
          }
          // 兜底：恢复 scrollY
          window.scrollTo(0, state.scrollY);
        }, 100);
      });
    } catch { /* ignore */ }
  }, [pageKey]);
}

/** 保存当前位置，跳详情前调用 */
export function saveDetailReturn(pageKey: string, cardId: string) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
      pageKey,
      cardId,
      scrollY: window.scrollY,
      at: Date.now(),
    } as ReturnState));
  } catch { /* ignore */ }
}

interface DetailLinkProps extends Omit<LinkProps, "to"> {
  to: string;
  /** 当前页面的唯一 key，如 "bookings", "home", "day-5" */
  pageKey: string;
  /** 卡片 ID，用于回来时定位 */
  cardId: string;
}

/** 自动保存返回位置的详情链接 */
export function DetailLink({ to, pageKey, cardId, onClick, ...rest }: DetailLinkProps) {
  return (
    <Link
      to={to}
      onClick={(e) => {
        saveDetailReturn(pageKey, cardId);
        onClick?.(e);
      }}
      {...rest}
    />
  );
}
