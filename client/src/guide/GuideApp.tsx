import { Component, Fragment, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// space-sdk 在 GitHub Pages 新站不可用：顶部署名条由新站全局 Header 承担，此处 stub 为空，保持视觉一致。
function SafeAreaTopScrim(_props: { backgroundColor?: string }) { return null; }

/** 错误边界：子组件渲染崩溃时显示兜底，不让整页白屏、保证能返回 */
class SectionErrorBoundary extends Component<{children:ReactNode;label:string},{err:Error|null}>{
 state={err:null as Error|null};
 static getDerivedStateFromError(err:Error){return {err};}
 componentDidCatch(err:Error){console.error(`[${this.props.label}]`,err);}
 render(){
  if(this.state.err){
   return <section className="notice" role="alert"><h2>这部分内容暂时打不开</h2><p>技术细节：{String(this.state.err.message||this.state.err)}</p><p><button className="secondary" onClick={()=>this.setState({err:null})}>重试</button></p></section>;
  }
  return this.props.children;
 }
}
import { listRecords, saveRecord, deleteRecord, getResearchStatus, recordSyncMode, type GuideRecord } from './records';
import { supabase, supabaseConfigured } from '../lib/supabase';
import { fetchProfileMap } from '../lib/profiles';
import { attractions, cities, days, hotelCityChecks, hotels, restaurants, shopping, shoppingGuides, countryShoppingAdvice, legs, cityMobility, mallAnchorId, type Item, type MallDetail } from './data';
import { bookingPolicyBadge } from '../bookings/restaurantBookingStatus';
import { FLIGHT_LEGS, buildFullTripSegments, flightDateFromPlan, hotelStayFromPlan, refreshLegFromDb, type FlightLegInfo, type FlightOption, type PlanSegment } from '../bookings/bookingTimeline';
import { attractionGuides } from './attractionGuides';
import { getInfographics, getCrossCityInfographics, type Infographic } from './infographics';
import { getPhotoSpots, getPortraitSpots, photoSpotAttractionCount, photoSpotCount } from './attractionPhotoSpots';
import { getGuideFacts, getXhsAssessment, guideFactsCount, strictResearchLinkCount, secondaryEvidence, xhsEvidence } from './research';
import { getLiveHotelPrice, liveDisplayRate, type LiveRoomRate } from './hotelLivePrices';
import { getPlaceGallery, placeGalleryPhotoCount, placeGalleryPlaceCount, type PlacePhoto } from './placeGalleries';
import { bangkokOta } from './bangkokOta';
import { ResearchProgressPage } from './ResearchProgressPage';
import { Fold, usePaged } from './density';
import BookingDialog from '../bookings/BookingDialog';
import type { BookingPreset } from '../bookings/bookingTypes';
import { extractHotelEntries, findHotelChain, findHotelTier, hotelChainTone, hotelTierTone, orderHotelsByResearch, type ResearchHotelEntry } from './hotelChains';
import bangkokImg from './assets/cities/bangkok.jpg';
import chiangmaiImg from './assets/cities/chiangmai.jpg';
import phuketImg from './assets/cities/phuket.jpg';
import penangImg from './assets/cities/penang.jpg';
import klImg from './assets/cities/kuala-lumpur.jpg';
import hcmImg from './assets/cities/ho-chi-minh.jpg';
import phuquocImg from './assets/cities/phu-quoc.jpg';
import singaporeImg from './assets/cities/singapore.jpg';
import seoulImg from './assets/cities/seoul.jpg';
import { readPlannerCache, loadPlannerPlan, type LoadedPlan } from './plannerSchedule';

type Tab='航班'|'交通'|'酒店'|'餐厅'|'景点'|'实用信息'|'我的预订'|'游记'|'信息来源搜索状态'|'旅行研究';
export type GuideTab=Tab;
type RecordKind='booking'|'note'|'packing'|'journal';
type RecordRow=GuideRecord;

/** 行程规划里定好的城市分段：城市 → 起止日期（YYYY-MM-DD）→ 天数 */
export interface PlanCityScope { city: string; start: string; end: string; days: number; }
/** YYYY-MM-DD → M/D */
export function planDateShort(iso: string): string {
  const p = iso.split('-');
  return `${Number(p[1])}/${Number(p[2])}`;
}
/** 完整日期 + 星期，如 2026-12-31（周四）；空串返回空 */
const WEEKDAYS_ZH = ['周日','周一','周二','周三','周四','周五','周六'];
export function planDateFull(iso: string): string {
  if (!iso) return '';
  const p = iso.split('-').map(Number);
  const d = new Date(p[0]!, p[1]! - 1, p[2]!);
  return `${p[0]}-${String(p[1]).padStart(2,'0')}-${String(p[2]).padStart(2,'0')}（${WEEKDAYS_ZH[d.getDay()]}）`;
}
const CITY_COUNTRY: Record<string,string> = {
  '新加坡':'新加坡','曼谷':'泰国','清迈':'泰国','普吉':'泰国',
  '槟城':'马来西亚','吉隆坡':'马来西亚','胡志明市':'越南','富国岛':'越南',
};
export function countryOf(city: string): string { return CITY_COUNTRY[city] ?? ''; }

/**
 * 读取用户在「行程规划」里保存的规划，算出按顺序的城市分段。
 * 先读本机缓存立刻出结果，再异步拉云端最新。没保存过则 segments 为空。
 */
export function usePlanScope(): { segments: PlanCityScope[]; source: 'cloud'|'cache'|null } {
  const [loaded, setLoaded] = useState<LoadedPlan | null>(() => readPlannerCache());
  useEffect(() => {
    let live = true;
    loadPlannerPlan().then((p) => { if (live && p) setLoaded(p); }).catch(() => {});
    return () => { live = false; };
  }, []);
  const segments = useMemo(() => {
    const sched = loaded?.plan?.schedule;
    if (!sched) return [];
    const dates = Object.keys(sched).sort();
    const segs: PlanCityScope[] = [];
    for (const d of dates) {
      const c = sched[d]!.city;
      const last = segs[segs.length - 1];
      if (last && last.city === c) { last.end = d; last.days += 1; }
      else segs.push({ city: c, start: d, end: d, days: 1 });
    }
    return segs;
  }, [loaded]);
  return { segments, source: loaded?.source ?? null };
}

/**
 * 完整大行程时间线（2026-10-03 用户：改了大行程后航班日期要跟着变）。
 * 在 usePlanScope 的东南亚段基础上，把北京1/西安/北京3/首尔段链上，
 * 仅供航班日期推导使用；酒店/餐厅/景点城市范围仍用 usePlanScope（不含国内城市）。
 */
export function useFullTripSegments(): PlanSegment[] {
  const { segments } = usePlanScope();
  const [tripDays, setTripDays] = useState<Record<string, number> | null>(null);
  useEffect(() => {
    let live = true;
    const cached = readPlannerCache();
    if (cached?.plan?.trip) setTripDays(cached.plan.trip as Record<string, number>);
    loadPlannerPlan().then((p) => {
      if (live && p?.plan?.trip) setTripDays(p.plan.trip as Record<string, number>);
    }).catch(() => {});
    return () => { live = false; };
  }, []);
  return useMemo(() => {
    if (!tripDays) return segments as PlanSegment[];
    return buildFullTripSegments(segments as PlanSegment[], tripDays);
  }, [segments, tripDays]);
}

/** 署名：显示这条记录是谁添加的（家庭共享时区分），数据复用 sea_profiles。 */
let guideProfileMapPromise: Promise<Map<string,string>> | null = null;
function AuthorName({ userId }: { userId: string | null }) {
  const [name, setName] = useState<string | null>(null);
  useEffect(() => {
    if (!userId || !supabaseConfigured || !supabase) return;
    if (!guideProfileMapPromise) guideProfileMapPromise = fetchProfileMap(supabase);
    let alive = true;
    void guideProfileMapPromise.then(m => { if (alive) setName(m.get(userId) ?? null); });
    return () => { alive = false; };
  }, [userId]);
  if (!userId || !name) return null;
  return <small className="recordauthor">· {name} 添加</small>;
}

const tabs:Tab[]=['航班','交通','酒店','餐厅','实用信息','信息来源搜索状态','我的预订','游记'];
const accents:Record<string,string>={'曼谷':'#0c7890','清迈':'#a66c25','普吉':'#18877f','槟城':'#ad5833','吉隆坡':'#405d82','胡志明市':'#a0443d','富国岛':'#287a6d','新加坡':'#a83748'};
const cityImages:Record<string,string>={'曼谷':bangkokImg,'清迈':chiangmaiImg,'普吉':phuketImg,'槟城':penangImg,'吉隆坡':klImg,'胡志明市':hcmImg,'富国岛':phuquocImg,'新加坡':singaporeImg,'首尔':seoulImg};
const route:[string,string,string][]=[['曼谷','3天','12/12–14'],['清迈','2天','12/15–16'],['普吉','3天','12/17–19'],['槟城','2天','12/20–21'],['吉隆坡','2天','12/22–23'],['胡志明市','2天','12/24–25'],['富国岛','3天','12/26–28'],['新加坡','3天','12/29–31']];
/** 预订入口回调：各 tab 的卡片/详情弹窗点“预订”时打开 BookingDialog */
type OnBook=(p:BookingPreset)=>void;
/** 当前行程（13天4城）各城入住/退房日期：预订弹窗预填优先用这张表
 * 与云端规划一致（2026-12-06～12-18：新加坡 D1-5 → 普吉 D6-8 → 清迈 D9-10 → 曼谷 D11-13，
 * 入住=到达当天、退房=转场航班当天；"次日飞"口径已作废）。
 * 2026-10-03 修正：此前退房日按"下一段 start"多占一晚，与航班（12-10/12-13/12-15/12-18 转场）错位。 */
const currentStayRanges:Record<string,[string,string]>={
 '新加坡':['2026-12-06','2026-12-10'],
 '普吉':['2026-12-10','2026-12-13'],
 '清迈':['2026-12-13','2026-12-15'],
 '曼谷':['2026-12-15','2026-12-18'],
};
/** 行程城市住宿日期短标签（云端现行程优先，旧20天 route 表仅作非行程城市回退） */
const currentStayLabel=(city:string)=>{const r=currentStayRanges[city];if(!r)return undefined;const f=(s:string)=>s.slice(5).replace('-','/');return `${f(r[0])}–${f(r[1])}`;};
/** 按城市推算建议入住/退房日期，预填进酒店预订表单
 * 2026-10-03 用户：改了大行程后酒店日期要跟着变。优先用行程规划的段算出
 * （传 segments 或读本地 planner 缓存同步拿），拿不到才回退到写死表。 */
function cityStayRange(city:string, segments?: PlanSegment[]):{date?:string;dateEnd?:string}{
 let segs = segments;
 if (!segs || segs.length===0) {
   // 同步读 planner 本地缓存（usePlanScope 首屏也是用它），点击时拿最新值
   try {
     const cached = readPlannerCache();
     const sched = cached?.plan?.schedule;
     if (sched) {
       const dates = Object.keys(sched).sort();
       const built: PlanSegment[] = [];
       for (const d of dates) {
         const c = (sched as Record<string,{city:string}>)[d]!.city;
         const last = built[built.length-1];
         if (last && last.city===c) { last.end=d; last.days+=1; }
         else built.push({city:c,start:d,end:d,days:1});
       }
       segs = built;
     }
   } catch { /* 忽略，走兜底 */ }
 }
 if (segs && segs.length>0) {
   const stay = hotelStayFromPlan(city, segs);
   if (stay) return {date: stay[0], dateEnd: stay[1]};
 }
 const cur=currentStayRanges[city];
 if(cur)return {date:cur[0],dateEnd:cur[1]};
 const r=route.find(x=>x[0]===city)?.[2];
 const m=r?.match(/(\d+)\/(\d+)[–-](\d+)/);
 if(!m)return {};
 const p=(n:string|number)=>String(n).padStart(2,'0');
 const mo=p(m[1]);
 return {date:`2026-${mo}-${p(m[2])}`,dateEnd:`2026-${mo}-${p(Number(m[3])+1)}`};
}
const mapLink=(name:string,city:string)=>`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name}, ${city}`)}`;

const navPaths:Record<Tab,React.ReactNode>={
 '航班':<><path d="M22 2 9 15M15 4l5 5M4 9l5 1 5-5M3 21l4-4M14 14l1 6 5-5"/></>,
 '交通':<><rect x="6" y="3" width="12" height="17" rx="3"/><path d="M6 13h12M9 7h2M13 7h2M8 20v2M16 20v2M9 16h.01M15 16h.01"/></>,
 '酒店':<><path d="M4 21V6h8v15M12 10h8v11M2 21h20M7 9h2M7 13h2M7 17h2M15 13h2M15 17h2"/></>,
 '餐厅':<><path d="M7 2v8M4 2v5a3 3 0 0 0 6 0V2M7 10v12M16 2v20M16 2c3 2 4 5 4 9h-4"/></>,
 '景点':<><path d="M3 20 9 8l4 7 3-4 5 9z"/><circle cx="17" cy="5" r="2"/></>,
 '实用信息':<><circle cx="12" cy="12" r="9"/><path d="M12 10v6M12 7h.01"/></>,
 '信息来源搜索状态':<><path d="M4 19V9M10 19V5M16 19v-8M22 19V3"/><path d="M2 21h22M3 6l6-3 6 5 7-6"/></>,
 '我的预订':<><path d="M6 3h12v18l-6-4-6 4z"/><path d="m9 10 2 2 4-4"/></>,
 '游记':<><path d="M3 5a4 4 0 0 1 4-2h5v18H7a4 4 0 0 0-4 2zM21 5a4 4 0 0 0-4-2h-5v18h5a4 4 0 0 1 4 2z"/></>,
 '旅行研究':<><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5M8 11h6M11 8v6"/></>
};
function NavIcon({tab}:{tab:Tab}){return <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{navPaths[tab]}</svg>}

function Source({children}:{children:React.ReactNode}){return <p className="source">资料来源：{children}</p>}
function useHotelEntries(){const query=useQuery({queryKey:['research-status'],queryFn:()=>getResearchStatus(),staleTime:0,retry:1});return useMemo(()=>extractHotelEntries(query.data?.status),[query.data?.status])}
function HotelChainBadge({chain}:{chain?:string}){const label=chain?.trim();if(!label)return null;return <span className={`hotel-chain-badge ${hotelChainTone(label)}`}>{label}</span>}
function HotelTierBadge({tier}:{tier?:string}){const label=tier?.trim();if(!label)return null;return <span className={`hotel-tier-badge ${hotelTierTone(label)}`}>{label}</span>}
function HotelBadges({chain,tier,topPick}:{chain?:string;tier?:string;topPick?:string}){if(!chain&&!tier&&!topPick)return null;return <span className="hotel-badges"><HotelChainBadge chain={chain}/><HotelTierBadge tier={tier}/><TopPickBadge group={topPick}/></span>}
/** 顶级之选徽章：该城市的 Marriott / Hyatt 官方核验顶级选择（hotelCityChecks），放在按城市浏览的卡片上 */
function TopPickBadge({group}:{group?:string}){if(group!=='Marriott'&&group!=='Hyatt')return null;return <span className={`hotel-toppick-badge ${group.toLowerCase()}`} title="该城市的 Marriott / Hyatt 顶级选择">🏆 {group} 顶级</span>}
/** 查酒店是否为该城的官方核验顶级选择，返回 'Marriott' | 'Hyatt' | '' */
function topPickGroupOf(item:Item):'Marriott'|'Hyatt'|''{
 const norm=(s:string)=>s.toLocaleLowerCase().replace(/[（(].*?[）)]/g,'').replace(/[\s·・—–\-_,，.。&＆]/g,'');
 const row=hotelCityChecks.find(r=>r.city===item.city);
 if(!row)return '';
 const wanted=norm(item.name);
 for(const c of row.choices){
  if(c.status!=='verified'||!c.hotel)continue;
  const h=norm(c.hotel);
  if(h.includes(wanted)||wanted.includes(h))return c.group;
 }
 return '';
}
function PageHero({title,summary,image,eyebrow}:{title:string;summary:string;image:string;eyebrow?:string}){return <section className="pagehero"><img src={image} alt="" aria-hidden="true"/><div/><section>{eyebrow&&<span>{eyebrow}</span>}<h1>{title}</h1><p>{summary}</p></section></section>}

function ResearchStatus(){const strictItems=Object.keys(xhsEvidence).length;const maxSample=Math.max(0,...Object.values(xhsEvidence).map(x=>x.length));return <section className="research-status" aria-label="资料核验状态"><div><span>RESEARCH LOG · 2026-09-13</span><h2>逐项证据，不把缺口藏起来</h2><p>网站目录与候选图片覆盖和六来源研究工作集采用不同口径；六来源条目总数以“信息来源搜索状态”页的实时汇总为准。小红书严格样本目前覆盖 {strictItems} 项、单项最多 {maxSample} 篇，未满每地点 10 篇的项目不计算推荐率；图片精确地点匹配也仍在逐张核验。</p></div><strong>{guideFactsCount} 个结构化详情 · {strictResearchLinkCount} 个严格记录链接 · {placeGalleryPlaceCount} 个地点 / {placeGalleryPhotoCount} 张候选图片</strong></section>}

function XhsMini({item}:{item:Item}){const a=getXhsAssessment(item);const sample=(xhsEvidence[item.name]||[]).length;const cut=(s:string)=>s.length>120?s.slice(0,120)+'…':s;
 if(!a)return <div className="xhsmini pending"><span>小红书口碑</span><><b>待严格核验</b><small>暂无可追溯统计，不补写结论</small></></div>;
 return <div className="xhsmini ready"><span>小红书口碑</span><div><b>{a.verdict}</b> <small>{sample} 篇已核验 · 推荐 {a.recommend} · 谨慎 {a.caution} · 避雷 {a.avoid}</small></div><div className="miniwr"><p className="miniw"><i>✅</i><span><b>为什么推荐　</b>{cut(a.why)}</span></p><p className="minia"><i>⚠️</i><span><b>避雷　</b>{cut(a.avoidNote)}</span></p></div></div>}

function XhsPanel({item}:{item:Item}){const a=getXhsAssessment(item);const evidence=xhsEvidence[item.name]||[];const total=Math.max(1,a?a.recommend+a.caution+a.avoid:0);return <section className="xhsreview" aria-label={`${item.name}小红书口碑`}><header><div><span>XIAOHONGSHU REVIEW</span><h3>小红书口碑</h3></div><b className={a?a.verdict==='推荐'?'good':a.verdict==='不推荐'?'bad':'mixed':'pending'}>{a?.verdict||'待严格核验'}</b></header>{a?<><p className="sample-note">核验进度 {evidence.length}/10。基于下方已打开并阅读正文与评论区的帖子样本；是样本计数，不是平台总评分，未满 10 篇不写成已完成。</p><div className="sentiment" aria-label={`推荐${a.recommend}篇，谨慎${a.caution}篇，避雷${a.avoid}篇`}><article><div><span>推荐</span><b>{a.recommend}</b></div><i><em style={{width:`${a.recommend/total*100}%`}}/></i></article><article><div><span>谨慎</span><b>{a.caution}</b></div><i><em style={{width:`${a.caution/total*100}%`}}/></i></article><article><div><span>避雷</span><b>{a.avoid}</b></div><i><em style={{width:`${a.avoid/total*100}%`}}/></i></article></div><div className="xhswhy"><article><span>为什么推荐</span><p>{a.why}</p></article><article><span>应该避雷</span><p>{a.avoidNote}</p></article></div></>:<div className="xhspending"><strong>这项还没有完成小红书严格逐帖核验</strong><p>暂不显示推荐率、避雷率或虚构的帖子摘要。现有公开资料仍保留在其他详情区；严格核验完成后再补原帖与统计。</p></div>}</section>}

function OtaReviewPanel({item}:{item:Item}){const row=bangkokOta[item.name];if(!row)return null;return <section className="ota-panel" aria-label={`${item.name}多平台评分与口碑`}><header><div><span>MULTI-SOURCE REVIEW</span><h3>多平台评分与实读摘要</h3></div><b>核验于 {row.checked}</b></header><div className={`ota-scores ${row.google?'three':''}`}><a href={row.tripadvisor.url} target="_blank" rel="noreferrer"><span>TripAdvisor</span><strong>{row.tripadvisor.score}</strong><small>{row.tripadvisor.reviews} 条评价</small><em>{row.tripadvisor.title} ↗</em></a><article><span>{row.chinese.site}</span><strong>{row.chinese.score||'公开样本'}</strong><small>{row.chinese.reviews?`${row.chinese.reviews} 条评价`:'评分／数量未可靠取得'}</small>{row.chinese.url?<a href={row.chinese.url} target="_blank" rel="noreferrer">打开来源 ↗</a>:<em>原页面登录受限或报告未提供直链</em>}</article>{row.google&&<a href={row.google.url} target="_blank" rel="noreferrer"><span>Google Maps</span><strong>{row.google.score}</strong><small>{row.google.reviews} 条评价</small><em>打开地点 ↗</em></a>}</div><div className="ota-reading"><article><span>为什么推荐</span><p>{row.recommend}</p></article><article><span>应该避雷</span><p>{row.caution}</p></article></div><p className="ota-note">{row.chinese.note} {row.google?.note} 评分、数量与摘要只描述这次研究取得的页面及样本，不代表全网一致意见。</p></section>}

function SecondaryPanel({item}:{item:Item}){const rows=secondaryEvidence[item.name]||[];const groups=['Tripadvisor','Google Maps','中文旅游网站','官方与专业来源'] as const;return <section className="secondary-evidence"><header><span>MORE SOURCES</span><h3>其他交叉核验入口</h3><p>按来源分组，不与小红书或上方评分合并计算。</p></header><div className="sourcegroups">{groups.map(group=>{const links=rows.filter(x=>x.group===group);return <article key={group}><div><b>{group}</b><span>{links.length?`${links.length} 条已导入`:'待逐项直链'}</span></div>{links.length?links.map(x=><a key={x.url} href={x.url} target="_blank" rel="noreferrer"><strong>{x.title}</strong><small>{x.note}</small><em>↗</em></a>):<p>尚未导入可追溯的逐项来源，不补写评分或摘要。</p>}</article>})}</div></section>}

function PhotoViewer({photos,index,setIndex,onClose,name}:{photos:PlacePhoto[];index:number;setIndex:(i:number)=>void;onClose:()=>void;name:string}){const photo=photos[index]!;const touchX=useRef<number|null>(null);useEffect(()=>{const previous=document.body.style.overflow;document.body.style.overflow='hidden';const f=(e:KeyboardEvent)=>{if(e.key==='Escape')onClose();if(e.key==='ArrowLeft')setIndex((index-1+photos.length)%photos.length);if(e.key==='ArrowRight')setIndex((index+1)%photos.length)};window.addEventListener('keydown',f);return()=>{document.body.style.overflow=previous;window.removeEventListener('keydown',f)}},[index,onClose,photos.length,setIndex]);return <div className="photoviewer" role="dialog" aria-modal="true" aria-label={`${name}照片 ${index+1}/${photos.length}`}><header><div><strong>{name}</strong><span>{index+1} / {photos.length}</span></div><button aria-label="关闭照片查看器" onClick={onClose}>×</button></header><div className="photo-stage" onTouchStart={e=>{touchX.current=e.touches[0]?.clientX??null}} onTouchEnd={e=>{const x=touchX.current;touchX.current=null;if(x==null)return;const dx=(e.changedTouches[0]?.clientX??x)-x;if(Math.abs(dx)>40){if(dx<0)setIndex((index+1)%photos.length);else setIndex((index-1+photos.length)%photos.length)}}}><button aria-label="上一张照片" onClick={()=>setIndex((index-1+photos.length)%photos.length)}>‹</button><figure><img src={photo.src} alt={`${name}候选图片 ${index+1}`}/><figcaption>{photo.sourceUrl?<a href={photo.sourceUrl} target="_blank" rel="noreferrer">查看图片来源 ↗</a>:<span>图片来源待复核</span>}</figcaption></figure><button aria-label="下一张照片" onClick={()=>setIndex((index+1)%photos.length)}>›</button></div></div>}

function PlaceGallery({item,kind}:{item:Item;kind:'酒店'|'餐厅'|'景点'}){const photos=getPlaceGallery(kind,item);const [open,setOpen]=useState<number|null>(null);if(!photos.length)return null;return <><section className="placegallery" aria-label={`${item.name}候选图片，共${photos.length}张`}><header><div><span>PHOTO SOURCE SET</span><h3>{item.name}候选图片</h3></div><b>{photos.length} 张</b></header><div>{photos.map((photo,i)=><button key={photo.src} aria-label={`查看${item.name}第${i+1}张候选图片`} onClick={()=>setOpen(i)} className={i===0?'lead':''}><img src={photo.src} alt={`${item.name}候选图片 ${i+1}`} loading="eager"/><span>{String(i+1).padStart(2,'0')}</span></button>)}</div><p>点击图片全屏查看并打开来源页。图片来源已记录；精确地点匹配仍在逐张复核，完成前不把“已收录”写成“已验过”。</p></section>{open!==null&&<PhotoViewer photos={photos} index={open} setIndex={setOpen} onClose={()=>setOpen(null)} name={item.name}/>}</>}

/** 攻略信息图查看器：复用 photoviewer 样式，长图可在弹层内纵向滑动查看 */
function InfographicViewer({items,index,setIndex,onClose}:{items:Infographic[];index:number;setIndex:(i:number)=>void;onClose:()=>void}){const g=items[index]!;useEffect(()=>{const previous=document.body.style.overflow;document.body.style.overflow='hidden';const f=(e:KeyboardEvent)=>{if(e.key==='Escape')onClose();if(e.key==='ArrowLeft')setIndex((index-1+items.length)%items.length);if(e.key==='ArrowRight')setIndex((index+1)%items.length)};window.addEventListener('keydown',f);return()=>{document.body.style.overflow=previous;window.removeEventListener('keydown',f)}},[index,onClose,items.length,setIndex]);return <div className="photoviewer igviewer" role="dialog" aria-modal="true" aria-label={`${g.title} ${index+1}/${items.length}`}><header><div><strong>{g.title}</strong><span>{index+1} / {items.length}</span></div><button aria-label="关闭信息图查看器" onClick={onClose}>×</button></header><div className="photo-stage"><button aria-label="上一张信息图" onClick={()=>setIndex((index-1+items.length)%items.length)}>‹</button><figure><img src={g.file} alt={g.title}/><figcaption><span>图片来源：{g.source}</span>{g.postUrl&&<a href={g.postUrl} target="_blank" rel="noreferrer">查看原帖 ↗</a>}</figcaption></figure><button aria-label="下一张信息图" onClick={()=>setIndex((index+1)%items.length)}>›</button></div></div>}

/** 攻略信息图折叠缩略条：页面只留一行小图，点击打开查看器逐张浏览 */
function IgStrip({items,offset,setOpen}:{items:Infographic[];offset:number;setOpen:(i:number)=>void}){return <div className="igstrip"><button className="igstrip-open" onClick={()=>setOpen(offset)}>📸 攻略信息图（共 {items.length} 张）· 点击打开逐张浏览 →</button><div className="igstrip-thumbs" role="list">{items.map((g,i)=><button key={g.file} role="listitem" onClick={()=>setOpen(offset+i)} aria-label={`打开查看${g.title}`}><img src={g.file} alt={g.title} loading="lazy"/></button>)}</div></div>}

/** 攻略信息图板块：本城归档图 + 末尾"跨城参考"分组，默认折叠为缩略条 */
function InfographicPanel({city}:{city:string}){const cityItems=getInfographics(city);const crossItems=getCrossCityInfographics();const items=[...cityItems,...crossItems];const [open,setOpen]=useState<number|null>(null);if(!items.length)return null;return <><section className="sectionblock igsection" aria-label={`${city}攻略信息图`}><div className="sectiontitle"><span>XHS STRATEGY INFOGRAPHICS</span><h2>攻略信息图</h2><p>{cityItems.length?`${city}小红书攻略帖中的行程路线与实用信息图`:'跨城通用的行程参考信息图'}，点击打开逐张浏览。图中的门票、时间、交通信息仅供行前参考，出行前请向官方渠道复核。</p></div>{cityItems.length>0&&<IgStrip items={cityItems} offset={0} setOpen={setOpen}/>}<div className="iggroup"><h3>跨城参考</h3><p>新马泰多城通用的花费明细、住宿明细、常用 APP、路线交通图与行李清单。</p></div><IgStrip items={crossItems} offset={cityItems.length} setOpen={setOpen}/></section>{open!==null&&<InfographicViewer items={items} index={open} setIndex={setOpen} onClose={()=>setOpen(null)}/>}</>}

function PhotoCarousel({photos,name}:{photos:PlacePhoto[];name:string}){
 const [index,setIndex]=useState(0);const n=photos.length;const touchX=useRef<number|null>(null);
 if(!n)return null;
 const go=(d:number)=>setIndex(i=>(i+d+n)%n);const photo=photos[index]!;
 return <section className="photocarousel" aria-label={`${name}照片，共${n}张`}><div className="pc-stage" onTouchStart={e=>{touchX.current=e.touches[0]?.clientX??null}} onTouchEnd={e=>{const x=touchX.current;touchX.current=null;if(x==null)return;const dx=(e.changedTouches[0]?.clientX??x)-x;if(Math.abs(dx)>40)go(dx<0?1:-1)}}><img src={photo.src} alt={`${name}照片 ${index+1}`} loading="eager"/>{n>1&&<><button className="pc-arrow left" aria-label="上一张照片" onClick={()=>go(-1)}>‹</button><button className="pc-arrow right" aria-label="下一张照片" onClick={()=>go(1)}>›</button><span className="pc-count">{index+1} / {n}</span></>}</div><div className="pc-caption">{photo.sourceUrl?<a href={photo.sourceUrl} target="_blank" rel="noreferrer">查看图片来源 ↗</a>:<span>图片来源待复核</span>}<span className="pc-note">左右滑动或点箭头直接切换 · 精确地点匹配逐张复核中</span></div>{n>1&&<div className="pc-thumbs">{photos.map((p,i)=><button key={p.src} className={i===index?'active':''} aria-label={`${name}第${i+1}张照片`} onClick={()=>setIndex(i)}><img src={p.src} alt="" loading="lazy"/></button>)}</div>}</section>
}

function ItemMedia({item,kind,index}:{item:Item;kind:'酒店'|'餐厅'|'景点';index:number}){
 const gallery=getPlaceGallery(kind,item);
 const [imgIdx,setImgIdx]=useState(0);
 const touchX=useRef<number|null>(null);
 const image=gallery[imgIdx]?.src||gallery[0]?.src;
 const prev=(e:React.MouseEvent)=>{e.stopPropagation();setImgIdx(i=>(i-1+gallery.length)%gallery.length);};
 const next=(e:React.MouseEvent)=>{e.stopPropagation();setImgIdx(i=>(i+1)%gallery.length);};
 const go=(d:number)=>setImgIdx(i=>(i+d+gallery.length)%gallery.length);
 return <div className={`itemmedia ${image?'has-photo':'no-photo'}`}
  onTouchStart={e=>{touchX.current=e.touches[0]?.clientX??null}}
  onTouchEnd={e=>{const x=touchX.current;touchX.current=null;if(x==null)return;const dx=(e.changedTouches[0]?.clientX??x)-x;if(Math.abs(dx)>40){e.stopPropagation();go(dx<0?1:-1)}}}>{image?<img src={image} alt={`${item.name}候选图片`} loading="lazy"/>:<span aria-hidden="true">{item.name.slice(0,1)}</span>}<b style={{background:accents[item.city]}}>{String(index+1).padStart(2,'0')}</b>{gallery.length>1&&<><button type="button" className="imgnav prev" onClick={prev} aria-label="上一张">‹</button><button type="button" className="imgnav next" onClick={next} aria-label="下一张">›</button><em>{imgIdx+1}/{gallery.length}</em></>}</div>}

const operationalNotices:Record<string,{title:string;body:string}>={
 'PRU':{title:'营业状态异常',body:'Google Maps 在 2026-09-13 研究快照中显示“Temporarily closed”。不要按原计划直接前往；订位或出发前先向餐厅确认是否恢复营业。'},
 'Roti Taew Nam':{title:'营业状态异常',body:'Google Maps 在 2026-09-13 研究快照中显示“Temporarily closed”。不要按原计划直接前往；出发前先核对官方页面或电话确认。'}
};

/** 景点最佳机位：详细位置 + 拍摄建议 + 图库样片（只配视角对得上的）。 */
/** 人像机位小节：从已有研究机位里筛出文案自带人像拍法的条目，原样复用展示；无命中则显示待补充，不编造。 */
function PortraitSpots({item}:{item:Item}){
 const spots=getPortraitSpots(item.city,item.name);
 const gallery=getPlaceGallery('景点',item);
 return <div className="portraitspots"><h4>👩 人像机位</h4><p className="portraitspots-intro">给老婆/同行人拍照用的点位：人站在哪、面向哪。以下点位均出自上方机位的实地研究文案（文案里明确写了人像/合影拍法），原样复用、没有新编。</p>{spots?.length?<div className="photospotlist">{spots.map((s,i)=>{const photo=s.sampleIndex!=null?gallery[s.sampleIndex]:undefined;return <article key={i} className="photospot"><header><b>{String(i+1).padStart(2,'0')}</b><h4>{s.name}</h4><span className="portraitbadge">👩 人像</span></header><p className="spotwhere"><strong>📍 详细位置</strong><span>{s.where}</span></p><p className="spothow"><strong>📷 拍摄建议</strong><span>{s.how}</span></p>{photo?<figure><img src={photo.src} alt={s.sampleCaption||`${item.name} · ${s.name}样片`} loading="lazy"/><figcaption><span>{s.sampleCaption||'样片'}</span><a href={photo.sourceUrl} target="_blank" rel="noreferrer">来源：{photo.title} ↗</a></figcaption></figure>:<p className="spotnosample">该机位暂无视角对得上的样片，图库复核后补上。</p>}</article>})}</div>:<p className="photospots-pending">该景点的人像机位待补充（需结合小红书人像实拍帖再研究）。</p>}</div>;
}
function PhotoSpotPanel({item}:{item:Item}){
 const spots=getPhotoSpots(item.city,item.name);
 const gallery=getPlaceGallery('景点',item);
 return <section id="photospots" className="detailsection photospots"><span>PHOTO SPOTS</span><h3>📸 最佳机位</h3>{spots?.length?<><p className="photospots-intro">每个机位都写了站在哪、面向哪。给同行人拍人像：优先上午顺光、傍晚黄金时刻，背景尽量干净；小红书实拍验证过的人像机位正在逐条整理，整理好即补入。样片只用本站图库里视角对得上的照片，对不上的机位暂不配样片。</p><div className="photospotlist">{spots.map((s,i)=>{const photo=s.sampleIndex!=null?gallery[s.sampleIndex]:undefined;return <article key={i} className="photospot"><header><b>{String(i+1).padStart(2,'0')}</b><h4>{s.name}</h4></header><p className="spotwhere"><strong>📍 详细位置</strong><span>{s.where}</span></p><p className="spothow"><strong>📷 拍摄建议</strong><span>{s.how}</span></p>{photo?<figure><img src={photo.src} alt={s.sampleCaption||`${item.name} · ${s.name}样片`} loading="lazy"/><figcaption><span>{s.sampleCaption||'样片'}</span><a href={photo.sourceUrl} target="_blank" rel="noreferrer">来源：{photo.title} ↗</a></figcaption></figure>:<p className="spotnosample">该机位暂无视角对得上的样片，图库复核后补上。</p>}<a className="spotmap" href={mapLink(item.name,item.city)} target="_blank" rel="noreferrer">🗺 地图导航到{item.name}附近</a></article>})}</div><PortraitSpots item={item}/></>:<p className="photospots-pending">该景点机位整理中，稍后补上。</p>}</section>
}

// 非行程城市（槟城/吉隆坡/胡志明市/富国岛）酒店价格按旧8城口径查询：
// 数字真实、有参考价值，但"行程"指代旧口径。主agent裁决 2026-10-01 00:41 PDT：不隐藏、改文案。
const NON_ITINERARY_PRICE_CITIES=['槟城','吉隆坡','胡志明市','富国岛'];
const isNonItineraryPriceCity=(city:string)=>NON_ITINERARY_PRICE_CITIES.includes(city);
const shortDate=(iso:string)=>iso&&iso.length>=10?iso.slice(5).replace('-','/'):iso;
function LivePricePanel({name,city}:{name:string;city:string}){
 const p=getLiveHotelPrice(name);
 if(!p) return null;
 const refOnly=isNonItineraryPriceCity(city);
 const priceTitle=refOnly?`参考房价（查询日期${shortDate(p.checkIn)}–${shortDate(p.checkOut)}）`:'按行程日期实时房价';
 const row=(label:string,rate:LiveRoomRate|null,note?:string)=>(
  <div className="livepricerow"><b>{label}</b>{rate?<span><span className="livepriceroom">{rate.room}</span><span className="livepricevals">${rate.perNightUSD}/晚{rate.totalUSD!=null?` · 整段 $${rate.totalUSD}${rate.totalInclTax===true?'（含税）':rate.totalInclTax===false?'（税前）':'（税费情况页面未说明）'}`:''}</span>{rate.memberDeal&&<span className="livepricedeal">🏷️ {rate.memberDeal}</span>}<small>{rate.cancel}；{rate.breakfast}{rate.note?`；${rate.note}`:''}</small></span>:<span className="livepricenone">{note||'该日期未找到可订房型'}</span>}</div>);
 return <section className="detailsection livepriceblock" aria-label={priceTitle}><span>LIVE RATES · USD</span><h3>{priceTitle}</h3><p className="livepricedates">{p.checkIn} → {p.checkOut}（{p.nights} 晚）· 2 成人 1 间</p>{p.dateMismatch&&<p className="livepricedatewarn">⚠️ 行程日期有调整：此价格按上方日期查询，可能与你当前行程日期不一致，仅供参考</p>}{p.unavailable?<p className="livepricenone">{p.unavailable}</p>:<>{row('基础房',p.base,p.baseNote)}{row('套房',p.suite,p.suiteNote)}</>}<small className="livepricefoot">来源 {p.source} · 查询于 {p.checkedAt} · 房价实时波动，以下单时为准</small>{p.baselineUSD!=null&&<div className="baselineblock"><h4>📊 基准价对比</h4><div className="baselinerow"><span><b>Google Hotels</b> ${p.baselineUSD}/晚<small>（不含税）</small></span>{p.baselineUrl&&<a href={p.baselineUrl} target="_blank" rel="noreferrer">验证↗</a>}</div><p className="baselinenote">查询于 {p.baselineCheckedAt||'—'} · 仅为 Google 搜索页每晚参考价，用于横向对比各酒店价格水平</p><ul className="baselineunknown"><li>税费：不含税（总价需另加税费）</li><li>房型、早餐、退改政策：基准价未收录，以上方实查为准</li></ul><p className="baselinewarn">口径不同，不直接计算差价：上方 {p.source} 为实查完整报价（含税口径见各房型），基准价为不含税参考价。</p></div>}</section>;
}

type AvStatus='available'|'mixed'|'full'|'soldout'|'not_released'|'walkin'|'unverifiable';
interface AvRow{kind:string;name:string;city:string;party:string;dates:string;status:AvStatus;detail:string;channel:string;note:string;checked_at:string}
const AV_META:Record<AvStatus,{r:string;a:string;cls:string}>={
 available:{r:'有位',a:'有票',cls:'avok'},
 mixed:{r:'部分日期有位',a:'部分日期有票',cls:'avwarn'},
 full:{r:'已订满',a:'已订满',cls:'avbad'},
 soldout:{r:'售罄',a:'售罄',cls:'avbad'},
 not_released:{r:'尚未放位',a:'尚未开售',cls:'avmute'},
 walkin:{r:'现场排队',a:'随到随买',cls:'avinfo'},
 unverifiable:{r:'在线查不到',a:'在线查不到',cls:'avmute'},
};
function AvailabilityPanel({name,kind}:{name:string;kind:'餐厅'|'景点'}){
 const [row,setRow]=useState<AvRow|null>(null);
 useEffect(()=>{
  if(!supabaseConfigured||!supabase) return;
  let live=true;
  supabase.from('sea_availability').select('*').eq('kind',kind==='餐厅'?'restaurant':'attraction').eq('name',name).eq('trip_ref','dec2026').maybeSingle().then(({data})=>{if(live&&data) setRow(data as AvRow)});
  return ()=>{live=false};
 },[name,kind]);
 if(!row) return null;
 const meta=AV_META[row.status]||AV_META.unverifiable;
 const label=kind==='餐厅'?meta.r:meta.a;
 const when=row.checked_at?new Date(row.checked_at).toLocaleString('zh-CN',{timeZone:'Asia/Shanghai',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'}):'';
 return <section className="detailsection availblock" aria-label="按行程日期空位余票"><span>LIVE AVAILABILITY</span><h3>按行程日期{kind==='餐厅'?'订位空位':'门票余量'}</h3><p className="availsummary"><b className={meta.cls}>{label}</b><span>{row.dates}{row.party?` · ${row.party}`:''}</span></p><p className="availdetail">{row.detail}</p>{row.channel&&<p className="availchannel">查询渠道：{row.channel}</p>}{row.note&&<p className="availchannel">{row.note}</p>}<small className="livepricefoot">查询于 {when}（北京时间）· 空位余票实时变化，以下单时为准 · 数据由定时任务自动刷新</small></section>;
}

function DetailBody({item,kind,onClose,onBook,inline}:{item:Item;kind:'酒店'|'餐厅'|'景点';onClose:()=>void;onBook?:OnBook;inline:boolean}){
 const hotelEntries=useHotelEntries(); const chain=kind==='酒店'?findHotelChain(hotelEntries,item.name,item.city):''; const tier=kind==='酒店'?findHotelTier(hotelEntries,item.name,item.city):'';
 const facts=getGuideFacts(item,kind); const guide=kind==='景点'?(attractionGuides[item.city]||{})[item.name]:undefined; const evidence=xhsEvidence[item.name]||[]; const evPager=usePaged(evidence,6,'条链接'); const gallery=getPlaceGallery(kind,item); const image=gallery[0]?.src; const a=getXhsAssessment(item); const operationalNotice=operationalNotices[item.name];
 const checklist=kind==='酒店'?['确认具体房型、景观、加床与早餐条款','比较含税总价、取消政策与旺季预付要求','把机场或码头接送写入预订备注']:kind==='餐厅'?['确认套餐、税费、服务费与饮食限制','按官方放位规则订位，不把walk-in个例当常态','若评价两极，先看近期菜单再决定']:['复核当日开放、门票、着装与临时关闭','按天气准备室内替代，不把船班或户外项目排死','下载离线地图，提前确认最后一段交通'];
 return <>{/* 2026-10-05 用户：酒店从卡片展开时跳过头图+图库，与卡片重复；独立详情页保留 */!(inline&&kind==='酒店')&&<div className={`detailhero ${image?'with-photo':'editorial'}`} style={image?undefined:{background:accents[item.city]}}>{image&&<img src={image} alt={`${item.name}候选图片`}/>}<div/><section><p>{item.city} · {kind}完整攻略</p><h2>{item.name}</h2><span>{item.meta}</span></section></div>}{operationalNotice&&<aside className="operational-alert" role="status"><strong>{operationalNotice.title}</strong><p>{operationalNotice.body}</p></aside>}{kind==='酒店'&&<section className="hotelidentity"><HotelBadges chain={chain} tier={tier} topPick={topPickGroupOf(item)}/><div><strong>{item.brand||'独立或其他酒店集团'}</strong><span>{item.loyaltyProgram||'不适用'}</span></div>{item.officialUrl?<a href={item.officialUrl} target="_blank" rel="noreferrer">官方酒店页 ↗</a>:<small>当前候选卡未绑定集团官方页</small>}</section>}<div className="detailcontent">{(inline&&kind==='酒店')?null:(inline?<PhotoCarousel photos={gallery} name={item.name}/>:<PlaceGallery item={item} kind={kind}/>)}<nav className="detailjump" id="detailtop" aria-label="详情目录"><a href="#decision">结论</a>{guide&&<a href="#guide">导游词</a>}{kind==='景点'&&<a href="#photospots">最佳机位</a>}<a href="#facts">实用信息</a><a href="#xhs">小红书</a><a href="#sources">原帖</a></nav>{kind==='酒店'&&item.hotelAcclaim&&<section className="detailsection acclaimblock"><span>PUBLIC ACCLAIM</span><h3>🏆 公认口碑</h3><p>{item.hotelAcclaim}</p></section>}{kind==='餐厅'&&item.michelin&&<section className="detailsection michelinblock"><span>MICHELIN GUIDE</span><h3>⭐ 米其林指南</h3><p>{item.michelin}</p></section>}{kind!=='酒店'&&<AvailabilityPanel name={item.name} kind={kind as '餐厅'|'景点'}/>}{!(inline&&kind==='酒店')&&<section id="decision" className="detaillead"><span>EDITOR'S VERDICT</span><h3>{kind==='酒店'?'值不值得住':kind==='餐厅'?'值不值得订':'值不值得去'}</h3>{guide?<p className="guideverdict">{guide.verdict}</p>:<p>{facts.action}</p>}</section>}{guide&&<section id="guide" className="detailsection guideblock"><span>HIGHLIGHTS</span><h3>必看亮点</h3><ul>{guide.highlights.map(h=><li key={h.name}><b>{h.name}</b><span>{h.description}</span></li>)}</ul></section>}{guide&&<section className="detailsection guideblock"><span>HISTORY & CULTURE</span><h3>历史人文</h3>{guide.history.split("\n\n").map((pg,i)=><p key={i}>{pg}</p>)}</section>}{guide&&<section className="detailsection guideblock"><span>VISIT GUIDE</span><h3>游览建议</h3><div className="guidevisit"><p><b>建议时长</b><span>{guide.visit.duration}</span></p><p><b>最佳时间</b><span>{guide.visit.bestTime}</span></p><ul>{guide.visit.tips.map((t,i)=><li key={i}>{t}</li>)}</ul></div></section>}{kind==='景点'&&<PhotoSpotPanel item={item}/>}<div id="facts" className="detailfactgrid"><article><span>位置 / 地址</span><b>{facts.address}</b></article><article><span>营业 / 开放</span><b>{facts.hours}</b></article><article><span>价格 / 门票</span><b>{facts.price}</b></article><article><span>建议节奏</span><b>{facts.schedule}</b></article></div>{kind==='酒店'&&<LivePricePanel name={item.name} city={item.city}/>}{a?.why&&<section className="detailsection"><h3>推荐理由</h3><p>{a.why}</p></section>}<section className="detailsection warning"><h3>避雷与取舍</h3><p>{a?.avoidNote||facts.action}</p></section><section className="detailsection"><h3>怎么到 · 怎么串联</h3><p>{facts.transit}</p></section><section className="detailsection"><h3>{kind==='酒店'?'订房前确认':kind==='餐厅'?'订位与点单':'出发前确认'}</h3><ul>{checklist.map(x=><li key={x}>{x}</li>)}</ul></section><div id="xhs"><XhsPanel item={item}/></div><OtaReviewPanel item={item}/><SecondaryPanel item={item}/><details id="sources" className="evidence"><summary><div><span>SOURCE LEDGER</span><h3>小红书原帖与核验记录</h3></div><b className={evidence.length?'verified':'pending'}>{facts.verification}</b></summary>{evidence.length?<><div className="evidencelist">{evPager.visible.map((link,i)=><a key={link.url} href={link.url} target="_blank" rel="noreferrer"><em>{String(i+1).padStart(2,'0')}</em><span><strong>{link.title}</strong><small>{link.note}</small></span><i aria-hidden="true">↗</i></a>)}</div>{evPager.toggle}</>:<p className="evidenceempty">本条尚无可追溯的小红书逐帖链接。当前只呈现已完成的公开资料交叉核对，不补写帖子标题或链接。</p>}</details><a className="detailback" href="#detailtop">↑ 回到目录</a></div><div className="detailactions">{onBook&&<button className="primary" onClick={()=>onBook({bkind:kind==='酒店'?'hotel':kind==='餐厅'?'restaurant':'attraction',name:item.name,city:item.city,...cityStayRange(item.city)})}>{kind==='酒店'?'预订这家酒店':kind==='餐厅'?'预订 / 订位':'预订门票'}</button>}<a className={onBook?"secondary":"primary"} href={mapLink(item.name,item.city)} target="_blank" rel="noreferrer">在地图 App 中查看</a>{<FavButton name={item.name} city={item.city} type={kind==='酒店'?'hotel':kind==='餐厅'?'restaurant':'attraction'}/>}<button className="secondary" onClick={onClose}>{inline?'收起 ▲':'返回列表'}</button></div></>}


function InlineDetail({item,kind,onBook,onCollapse}:{item:Item;kind:'酒店'|'餐厅'|'景点';onBook?:OnBook;onCollapse:()=>void}){
 const ref=useRef<HTMLElement|null>(null);
 useEffect(()=>{ref.current?.scrollIntoView({behavior:'smooth',block:'start'})},[]);
 useEffect(()=>{const f=(e:KeyboardEvent)=>{if(e.key==='Escape')onCollapse()};window.addEventListener('keydown',f);return()=>window.removeEventListener('keydown',f)},[onCollapse]);
 return <section ref={ref} className="detail-inline" aria-label={`${item.name}完整攻略`}><DetailBody item={item} kind={kind} onClose={onCollapse} onBook={onBook} inline={true}/></section>
}

function CityTabs({city,setCity,label,list}:{city:string;setCity:(x:string)=>void;label:string;list?:string[]}){const tabs=list&&list.length?list:cities;return <div className="citytabs" aria-label={label}>{tabs.map(c=><button key={c} className={city===c?'active':''} onClick={()=>setCity(c)}>{c}</button>)}</div>}

export function HotelCatalog({onBook, scopeCities, stayDates, bare, onCityChange, onItemSelect, defaultListExpanded, initialCity, hideCityTabs}:{onBook?:OnBook;scopeCities?:string[];stayDates?:Record<string,string>;bare?:boolean;onCityChange?:(city:string)=>void;onItemSelect?:(key:string|null)=>void;defaultListExpanded?:boolean;initialCity?:string;hideCityTabs?:boolean}){
 const hotelEntries=useHotelEntries();const chainFor=(item:Item)=>findHotelChain(hotelEntries,item.name,item.city);const tierFor=(item:Item)=>findHotelTier(hotelEntries,item.name,item.city);
 /** 2026-10-02 用户：预订页只显示大行程里的城市，不去的城市不显示 */
 const list=useMemo(()=>{if(scopeCities&&scopeCities.length){return scopeCities.filter(c=>cities.includes(c));}return cities;},[scopeCities]);
 const [city,setCity]=useState(initialCity&&list.includes(initialCity)?initialCity:list[0]!);
 useEffect(()=>{ if(!list.includes(city)) setCity(list[0]!); },[list,city]);
 useEffect(()=>{ onCityChange?.(city); },[city]);
 const [expandedKey,setExpandedKey]=useState<string|null>(null);
const [selectedKey,setSelectedKey]=useState<string|null>(null);
 useEffect(()=>{ if(!onItemSelect) return; const skey=selectedKey??expandedKey; if(skey){ const it=hotels.find(x=>x.city+x.name===skey); onItemSelect(it?`hotel:${it.city}:${it.name}`:null); } else onItemSelect(null); },[selectedKey,expandedKey]);const [listExpanded,setListExpanded]=useState(!!defaultListExpanded);const [compare,setCompare]=useState<Item[]>([]);const shown=orderHotelsByResearch(hotels.filter(x=>x.city===city),hotelEntries,city);const dates=stayDates?.[city] ?? currentStayLabel(city) ?? route.find(x=>x[0]===city)?.[2];
 const toggle=(it:Item)=>setCompare(x=>x.some(y=>y.name===it.name)?x.filter(y=>y.name!==it.name):x.length<3?[...x,it]:x);
 const visibleHotels=listExpanded?shown:shown.slice(0,4);const listToggle=shown.length>4?<div className="showmore"><button type="button" className="secondary" onClick={()=>setListExpanded(v=>!v)} aria-expanded={listExpanded}>{listExpanded?'收起':'展开全部'} · {visibleHotels.length}/{shown.length} 家酒店</button></div>:null;const pickCity=(c:string)=>{setCity(c);setExpandedKey(null);setSelectedKey(null);/* 2026-10-04 用户：列表默认全显示，切城市不收起 */};const openHotelDetail=(it:Item)=>{const key=it.city+it.name;if(!visibleHotels.some(x=>x.city+x.name===key))setListExpanded(true);setExpandedKey(prev=>prev===key?null:key)};
 return <div className="page">{!bare&&<PageHero eyebrow="STAY COLLECTION" title="酒店推荐" summary={list.length!==cities.length?`按行程规划的${list.length}个城市比较位置、风格、硬件与明确短板；先看取舍，再决定住哪一家。`:`沿${cities.length}城路线比较位置、风格、硬件与明确短板；先看取舍，再决定住哪一家。`} image={singaporeImg}/>}<section className="sectionblock">{!hideCityTabs && <><div className="sectiontitle"><h2>按城市浏览</h2><p>{hotels.length} 家候选 · 最多选择 3 家并排比较 · 🏆 标记为该城 Marriott / Hyatt 顶级选择</p></div><CityTabs city={city} setCity={pickCity} label="酒店城市筛选" list={list}/></>}<div className="citycover"><img src={cityImages[city]} alt={`${city}城市实景`}/><div><span>建议住宿日期 {dates??"待定"}</span><h3>{city}</h3><p>{shown.length} 家酒店候选</p></div></div>{compare.length>0&&<section className="comparepanel"><header><h3>酒店对比 <span>{compare.length}/3</span></h3><button onClick={()=>setCompare([])}>清空</button></header><div>{compare.map(x=><article key={x.name}><HotelBadges chain={chainFor(x)} tier={tierFor(x)} topPick={topPickGroupOf(x)}/><b>{x.name}</b><span>{x.meta}</span><p>{x.best}</p><button onClick={()=>openHotelDetail(x)}>查看详情</button></article>)}</div></section>}<div className="catalog rich">{visibleHotels.map((it,i)=>{const hkey=it.city+it.name;const hopen=expandedKey===hkey;return <Fragment key={hkey}><article data-place-key={`hotel:${it.city}:${it.name}`} className={"itemcard"+(selectedKey===hkey||expandedKey===hkey?" ring-2 ring-teal-600":"")} onClick={(e)=>{ if((e.target as HTMLElement).closest("button,a")) return; setSelectedKey(prev=>prev===hkey?null:hkey); }}><ItemMedia item={it} kind="酒店" index={i}/><div><HotelBadges chain={chainFor(it)} tier={tierFor(it)} topPick={topPickGroupOf(it)}/><span className="citytag">{it.city} · 住宿</span><h3>{it.name}</h3><p className="meta">{it.meta}</p><p>{it.detail}</p><div className="decision"><b>怎么选</b><span>{it.best}</span></div>{(()=>{const p=getLiveHotelPrice(it.name);if(!p) return null;const rate=liveDisplayRate(p);
 if(p.unavailable) return <div className="decision"><b>💰 价格</b><span title={p.unavailable}>⚠️ 该日期暂无可订房</span></div>;
 if(!rate) return <div className="decision"><b>💰 价格</b><span>暂无实时价</span></div>;
 const tax=rate.totalInclTax===true?'含税':rate.totalInclTax===false?'不含税':'税费未明确';
 const dateStr=isNonItineraryPriceCity(it.city)?'参考房价':`${p.checkIn}→${p.checkOut}（${p.nights}晚）`;
 return <div className="decision"><b>💰 价格</b><span>${rate.perNightUSD}/晚起（{p.source}实查{rate.totalUSD!=null?` · 整段约 ${rate.totalUSD}（${tax}）`:''}）{p.baselineUSD!=null&&<> · 基准 ${p.baselineUSD}/晚（Google）</>} · Amex {p.amexUSD!=null?`$${p.amexUSD}/晚`:'未明确'} · Chase {p.chaseUSD!=null?`$${p.chaseUSD}/晚`:'未明确'}<small> · {dateStr} · {p.checkedAt} · 展开看房型明细</small></span></div>;
})()}<XhsMini item={it}/><div className="cardactions"><button className="solid" onClick={()=>{setSelectedKey(null);setExpandedKey(hopen?null:hkey);}}>{hopen?'收起 ▲':'展开完整攻略 ▾'}</button>{onBook&&<button onClick={()=>onBook({bkind:'hotel',name:it.name,city:it.city,...cityStayRange(it.city)})}>预订</button>}<FavButton name={it.name} city={it.city} type='hotel'/><button className={compare.some(x=>x.name===it.name)?'selected':''} disabled={!compare.some(x=>x.name===it.name)&&compare.length>=3} onClick={()=>toggle(it)}>{compare.some(x=>x.name===it.name)?'✓ 已加入对比':'＋ 加入对比'}</button></div></div></article>{hopen&&<InlineDetail item={it} kind="酒店" onBook={onBook} onCollapse={()=>setExpandedKey(null)} />}</Fragment>})}</div>{listToggle}</section><ResearchStatus/></div>
}

export function RestaurantCatalog({onBook, scopeCities, stayDates, bare, onCityChange, onItemSelect, defaultListExpanded, initialCity, hideCityTabs}:{onBook?:OnBook;scopeCities?:string[];stayDates?:Record<string,string>;bare?:boolean;onCityChange?:(city:string)=>void;onItemSelect?:(key:string|null)=>void;defaultListExpanded?:boolean;initialCity?:string;hideCityTabs?:boolean}){
 /** 2026-10-02 用户：预订页只显示大行程里的城市 */
 const list=useMemo(()=>{if(scopeCities&&scopeCities.length){return scopeCities.filter(c=>cities.includes(c));}return cities;},[scopeCities]);
 const [city,setCity]=useState(initialCity&&list.includes(initialCity)?initialCity:list[0]!);
 useEffect(()=>{ if(!list.includes(city)) setCity(list[0]!); },[list,city]);
 useEffect(()=>{ onCityChange?.(city); },[city]);
 const [expandedKey,setExpandedKey]=useState<string|null>(null);
const [selectedKey,setSelectedKey]=useState<string|null>(null);
 useEffect(()=>{ if(!onItemSelect) return; const skey=selectedKey??expandedKey; if(skey){ const it=restaurants.find(x=>x.city+x.name===skey); onItemSelect(it?`restaurant:${it.city}:${it.name}`:null); } else onItemSelect(null); },[selectedKey,expandedKey]);const shown=restaurants.filter(x=>x.city===city);const pickCity=(c:string)=>{setCity(c);setExpandedKey(null);setSelectedKey(null)};const cityDays=days.filter(d=>d.city===city);
 const restPager=usePaged(shown,6,'个餐饮选择',defaultListExpanded);
 return <div className="page">{!bare&&<PageHero eyebrow="DINING GUIDE" title="餐厅推荐" summary="按城市浏览星级餐厅、老店与街头小吃；先看取舍与订位要点，再决定订哪一家。" image={bangkokImg}/>}<section className="sectionblock">{!hideCityTabs && <><div className="sectiontitle"><h2>按城市浏览</h2><p>{restaurants.length} 个餐饮选择 · 星级餐厅、老店与街头小吃分开判断</p></div><CityTabs city={city} setCity={pickCity} label="餐厅城市筛选" list={list}/></>}<div className="bookingbrief"><strong>{city} · {cityDays.length}天</strong><p>{cityDays.map(d=>d.food).join(' ')}</p></div><div className="catalog rich restaurants">{restPager.visible.map((it,i)=>{const rkey=it.city+it.name;const ropen=expandedKey===rkey;return <Fragment key={rkey}><article data-place-key={`restaurant:${it.city}:${it.name}`} className={"itemcard"+(selectedKey===rkey||expandedKey===rkey?" ring-2 ring-teal-600":"")} onClick={(e)=>{ if((e.target as HTMLElement).closest("button,a")) return; setSelectedKey(prev=>prev===rkey?null:rkey); }}><ItemMedia item={it} kind="餐厅" index={i}/><div><span className="citytag">{it.city} · 餐饮</span><h3>{it.name}</h3><p className="meta">{it.meta}</p><p>{it.detail}</p><div className="decision"><b>订位 / 点单</b><span>{it.best}</span></div><div className="decision"><b>📅 预订政策</b>{(()=>{const b=bookingPolicyBadge(it.name);return <span><span title={b.title} className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full border ${b.cls}`}>{b.text}</span></span>})()}</div><XhsMini item={it}/><div className="cardactions"><button className="solid" onClick={()=>{setSelectedKey(null);setExpandedKey(ropen?null:rkey);}}>{ropen?'收起 ▲':'展开完整攻略 ▾'}</button>{onBook&&<button onClick={()=>onBook({bkind:'restaurant',name:it.name,city:it.city})}>预订 / 订位</button>}<FavButton name={it.name} city={it.city} type='restaurant'/><a href={mapLink(it.name,it.city)} target="_blank" rel="noreferrer">地图 App</a></div></div></article>{ropen&&<InlineDetail item={it} kind="餐厅" onBook={onBook} onCollapse={()=>setExpandedKey(null)} />}</Fragment>})}</div>{restPager.toggle}</section><ResearchStatus/></div>
}


/** 历史航班研究：2026-09-14/15 Duffel 实测（2成人直飞当前库存）+ 每段航司选择建议。旧8城行程版本，仅供参考，非实时价。数据来源：git 历史（交通页已删的「跨城航班详解」）与 planner-logic.ts 的 DUFFEL_MEASURED。 */
/** 航司口碑速览（历史研究结论，来源：git 历史交通页已删内容）。 */
const AIRLINE_REPUTATION='亚航AirAsia：Skytrax连续16年全球最佳廉航，东南亚航线之王，班次密、价格低，行李额需另购。酷航Scoot：新航旗下，全球最佳长途廉航，新加坡进出首选。曼谷航空：精品航司，票价含20kg行李+餐食+贵宾室，体验接近全服务。越南航空：越南国家航司，全服务，准点率不错。越捷VietJet：便宜但准点率和服务口碑一般，适合不赶时间的短途。廉航通病：行李额、选座、餐食全另收费，订票时算总价别只看裸票价。';
/** 当前行程航司靠谱程度：只写历史研究覆盖的，无依据的不编，写「口碑待核验」。key 按 FLIGHT_LEGS 的 carrier 前缀匹配。 */
const CARRIER_REPUTATION:Record<string,string>={'Scoot':'新航旗下，全球最佳长途廉航，新加坡进出首选','Bangkok Airways':'精品航司，票价含20kg行李+餐食+贵宾室，体验接近全服务','Air China':'中国载旗航司，全服务，星空联盟成员','China Southern':'全服务航司，机队规模亚洲前列','Thai Airways':'泰国国家航司，全服务，星空联盟成员','Shenzhen Airlines':'全服务航司，星空联盟成员','Xiamen Airlines':'全服务航司，天合联盟成员，服务口碑好','China Eastern':'全服务航司，天合联盟成员'};

/** 单个航段的 Google Flights 实查选项：状态徽章 + 经济/商务舱位 tab + 时间轴列表；全站只看直飞。 */
function depMinutes(t?:string){const m=/^(\d{1,2}):(\d{2})/.exec(t||'');return m?(+m[1])*60+(+m[2]):0;}
function flightDur(o:FlightOption){const d=depMinutes(o.depart),a=depMinutes(o.arrive);let mins=a-d;if(o.arrivePlusDay||mins<0)mins+=24*60;if(mins<=0||mins>24*60)return '';const h=Math.floor(mins/60),m=mins%60;return m?`${h}h${String(m).padStart(2,'0')}m`:`${h}h`;}
function isRedEye(o:FlightOption){return depMinutes(o.depart)/60<6;}
function FlightLegOptions({leg}:{leg:FlightLegInfo}){
 const eco=leg.options??null;                 /* null/空 = 未查询；查过但无直飞用 queriedAt 区分 */
 const biz=leg.businessOptions??null;         /* null = 未查询；[] = 查过但无商务舱直飞 */
 const [cabin,setCabin]=useState<'eco'|'biz'>('eco');
 const ecoState=!eco||!eco.length?(leg.queriedAt?'none':'pending'):'ok';
 const bizState=!biz?'pending':(!biz.length?'none':'ok');
 const opts=(cabin==='eco'?eco:biz)??[];
 const sorted=[...opts].sort((a,b)=>depMinutes(a.depart)-depMinutes(b.depart));
 const minOf=(os:FlightOption[])=>os.length?Math.round(Math.min(...os.map(o=>o.price))):null;
 const ecoMin=eco&&eco.length?minOf(eco):null;
 const bizMin=biz&&biz.length?minOf(biz):null;
 const rec=sorted.find(o=>o.recommend);
 const seen:string[]=[];const reps:string[]=[];
 sorted.forEach(o=>{const k=Object.keys(CARRIER_REPUTATION).find(x=>o.carrier.indexOf(x)===0);if(k&&!seen.includes(k)){seen.push(k);reps.push(`${o.carrier}：${CARRIER_REPUTATION[k]}`);}});
 const unknown=[...new Set(sorted.map(o=>o.carrier))].filter(c=>!Object.keys(CARRIER_REPUTATION).some(k=>c.indexOf(k)===0));
 const curState=cabin==='eco'?ecoState:bizState;
 return <div className="flightoptions">
  <p className={`flightstatus ${ecoState}`}>{ecoState==='ok'?`🟢 当天 ${eco!.length} 班直飞`:(ecoState==='none'?'⚪ 当天暂无直飞':'⏳ 航班待查询')}{ecoMin!=null?` · 经济舱 $${ecoMin} 起`:''}{bizMin!=null?` · 商务舱 $${bizMin} 起`:''}</p>
  <div className="cabintabs" role="tablist" aria-label="舱位选择">
   <button type="button" role="tab" aria-selected={cabin==='eco'} className={cabin==='eco'?'active':''} onClick={()=>setCabin('eco')}>经济舱{ecoMin!=null?` · $${ecoMin}起`:ecoState==='none'?' · 无':' · 待查'}</button>
   <button type="button" role="tab" aria-selected={cabin==='biz'} className={cabin==='biz'?'active':''} onClick={()=>setCabin('biz')}>商务舱{bizMin!=null?` · $${bizMin}起`:bizState==='none'?' · 无':' · 待查'}</button>
  </div>
  {curState==='ok'?<ul className="flighttimeline">{sorted.map((o,oi)=>{const dur=flightDur(o);const flightName=`${o.carrier} ${o.flight} ${leg.route} ${o.depart}→${o.arrive}`;return <li key={oi} className={o.recommend?'rec':''}>
    <div className="ft-times"><b>{o.depart}</b><span className="ft-line" aria-hidden="true"><i/></span><b>{o.arrive}{o.arrivePlusDay?'+1':''}</b></div>
    <div className="ft-meta"><span className="ft-flight">{o.carrier} {o.flight}{(o.stops??0)>0&&o.via?` · 经${o.via}中转`:''}</span>{dur&&<span className="ft-dur">飞行 {dur}</span>}{isRedEye(o)&&<em className="ft-redeye">🌙 红眼</em>}{o.recommend&&<em className="fo-rec">推荐</em>}</div>
    <div className="ft-side"><b className="fo-price">${Math.round(o.price)}</b><span className="fo-fare">{o.refundable==='yes'?'可退':'不可退'}·{o.changeable==='yes'?'可改':'改签未知'}{o.bags?`·托运${o.bags}`:''}</span><FavButton name={flightName} city="" type="flight" extra={{flight:{carrier:o.carrier,flight:o.flight,depart:o.depart,arrive:o.arrive,arrivePlusDay:!!o.arrivePlusDay,price:Math.round(o.price),cabin,route:leg.route,date:leg.date,priceBasis:leg.priceBasis,queriedAt:leg.queriedAt}}}/></div>
   </li>;})}</ul>
  :<p className="flightempty">{curState==='none'?(cabin==='eco'?'Google Flights 实查确认：当天无直飞。':'Google Flights 实查确认：当天无商务舱直飞（多为廉航执飞，无商务舱）。'):'航班待查询：Google Flights 航班库正在逐日填充，当前日期暂无实查数据，不能据此推断当天无直飞。'}</p>}
  {cabin==='eco'&&rec&&rec.recommendReason&&<p className="forecwhy">👉 推荐 {rec.carrier} {rec.flight}（{rec.depart}→{rec.arrive}{rec.arrivePlusDay?'+1':''}）：{rec.recommendReason}</p>}
  <p className="flightreput"><b>航司靠谱程度</b><span>{reps.length?reps.join('；')+'。':''}{unknown.map(u=>`${u}：口碑待核验`).join('；')}</span></p>
  <p className="flightsrc">价格口径：{leg.priceBasis??'2成人总价'}（USD 整单） · Google Flights {leg.queriedAt?`实查于 ${leg.queriedAt}`:'待查询'}{leg.stale?' · ⚠️旧方案已停更，不再刷新':', 非实时价，出票前重查'}</p>
 </div>;
}

export function Flights({onBook}:{onBook?:OnBook}){
 const segments = useFullTripSegments();
 /** 航段以 FLIGHT_LEGS 为唯一数据源（当前 18 段全量：去程西雅图→北京 1 段、亚洲段 8 段、回程三城三天 9 段）：
  * 每日航班刷新任务更新它的日期与直飞选项，这里自动同步；
  * 与「预订行动」时间线、页顶每日动态横幅同一来源。
  * 旧逻辑按行程规划的城市对推导航段，硬编码了旧 13 天行程的 6 段结构
  * （西安→新加坡出境 + 城市对城际 + 清迈→北京/西安回程、日期写死 last.end），
  * 丢了北京→新加坡与新加坡→西安（TR0134）两段家庭分流航段——这就是横幅写 8 段、列表只显示 6 段的原因。
  * 2026-09-29 用户裁决：回程改为北京→首尔（停留2天）→西雅图；回程 9 段（PEK/PVG/CKG-SEA
  * 三城三天旧候选）标记 stale，不再刷新、诚实标注，不计入"已实查"与最低价统计。 */
 const legs:{id:string;title:string;kind:string;desc:string;date:string;day:number;leg:FlightLegInfo}[]=useMemo(
   ()=>{
     /* 2026-10-03 用户：改了大行程后航班日期要跟着变。城际段日期按行程规划推导
      * （出发城市最后一天），并用该日期重查航班库拿价格；planner 没加载出来时用静态兜底。 */
     const segs: PlanSegment[] = segments.map(s=>({city:s.city,start:s.start,end:s.end,days:s.days,segId:(s as PlanSegment).segId}));
     const firstStart = segs[0]?.start;
     return FLIGHT_LEGS.map(f=>{
       let leg = f;
       let date = f.date;
       /* 2026-10-03 修：不只限 intercity——sin-xiy（新加坡→西安，intl）这类
        * 以 planner 城市为出发地的段也要跟行程走；出发地不在行程里的段
        * （如西雅图→北京）flightDateFromPlan 返回 null，自动保留静态日期。 */
       if (!f.stale && segs.length>0) {
         const planDate = flightDateFromPlan(f.route, segs);
         if (planDate && planDate!==f.date) {
           // 深拷贝一条再按正确日期重查库，不污染静态 FLIGHT_LEGS
           leg = JSON.parse(JSON.stringify(f)) as FlightLegInfo;
           refreshLegFromDb(leg, planDate);
           date = planDate;
         }
       }
       let day = f.day;
       if (firstStart && date) {
         const d = Math.round((new Date(date).getTime()-new Date(firstStart).getTime())/86400000)+1;
         if (d>=1) day = d;
       }
       return {id:f.id,title:f.route,kind:f.kind==='intl'?'国际航班':'城际直飞',desc:leg.note,date,day,leg};
     });
   },
   [segments]
 );
 const countries=useMemo(()=>{
   const s=[...new Set(segments.map(x=>countryOf(x.city)).filter(Boolean))];
   return s.length?s:['新加坡','泰国'];
 },[segments]);
 const midCount=legs.filter(l=>l.kind==='城际直飞').length;
 const countryLabel=countries.join('、');
 const legPager=usePaged(legs,5,'个航段');
 const sourceLine='航段与直飞选项由 Google Flights 每日实查维护（非实时价，出票前重查退改）；实时价格与推荐见「预订行动」时间线';
 const checkedCount=legs.filter(l=>{const f=l.leg;return !f.stale&&((f.options&&f.options.length)||f.queriedAt);}).length;
 const staleCount=legs.filter(l=>l.leg.stale).length;
 const activeCount=legs.length-staleCount;
 return <div className="page"><PageHero eyebrow="FLIGHT PLAN" title="航班信息" summary="各段移动按出发日期排布，与每日航班刷新同步。未确认航班号、实时票价与库存不会被写成事实。" image={bangkokImg}/><section className="sectionblock"><div className="sectiontitle"><h2>航段总览</h2><p>出票后把航班号、时间与确认号存进"我的预订" · 已实查 {checkedCount}/{activeCount} 段（Google Flights 持续更新中{staleCount>0?`；旧方案 ${staleCount} 段已停更，不计入`:""}）</p></div><div className="flightsummary"><article><b>{legs.length}</b><span>个航段</span></article><article><b>{midCount}</b><span>段城际直飞</span></article><article><b>{countries.length}</b><span>个入境国家（{countryLabel}）</span></article></div><div className="flightgrid">{legPager.visible.map(l=>{const i=legs.indexOf(l);return <article key={l.id}><header><span>FLIGHT {String(i+1).padStart(2,'0')}</span><em>{l.leg.stale?"⚠️ 旧方案已停更":"待预订"}</em></header><h3>{l.title}</h3>{l.date?<p className="flightdate">📅 {planDateFull(l.date)}</p>:<p className="flightdate">📅 日期待定</p>}<strong>{l.kind}</strong><p>{l.desc}</p>{l.leg.stale&&<p className="stalewhy">旧方案已停更：自 2026-09-29 起回程改为北京→首尔（停留2天）→西雅图，本候选价格不再刷新，仅供参考。</p>}<FlightLegOptions leg={l.leg}/><dl><div><dt>出票前</dt><dd>核验日期与机场</dd></div><div><dt>出票后</dt><dd>保存航班号与确认号</dd></div></dl>{onBook&&<div className="cardactions"><button className="solid" onClick={()=>onBook({bkind:'transport',name:l.title,date:l.date||undefined,day:l.day})}>记录预订</button>{/* 2026-10-03 用户：不再收藏整条航段，只收藏具体航班（每条航班选项上的收藏按钮保留） */}</div>}</article>})}</div>{legPager.toggle}</section><div className="notice"><h2>航司口碑速览</h2><p>{AIRLINE_REPUTATION}</p></div><section className="checklistband"><h2>每段都要核对</h2><div><span>航站楼</span><span>托运行李额</span><span>转机签证</span><span>最短衔接时间</span><span>末班接驳</span><span>取消与改签</span></div></section><Source>{sourceLine}</Source></div>}

export function Transport({scopeCities}:{scopeCities?:string[]}){const {segments:planSegs}=usePlanScope();const planCities=useMemo(()=>{const s:string[]=[];planSegs.forEach(x=>{if(!s.includes(x.city))s.push(x.city)});return s;},[planSegs]);const tabList=useMemo(()=>{if(scopeCities&&scopeCities.length){const s=scopeCities.filter(c=>cities.includes(c));if(s.length)return s;}const rest=cities.filter(c=>!planCities.includes(c));return [...planCities,...rest];},[planCities,scopeCities]);const [mcity,setMcity]=useState(tabList[0]!);useEffect(()=>{if(!tabList.includes(mcity))setMcity(tabList[0]!);},[tabList,mcity]);

 const cityDetail:Record<string,{title:string;sections:{h:string;p:string}[]}>={
  '曼谷':{title:'BTS+MRT是命，船是彩蛋',sections:[
   {h:'🚇 市内交通（BTS/MRT首选）',p:'BTS空铁16-59泰铢，MRT地铁16-42泰铢，06:00-24:00，堵车时段唯一靠谱的选择。暹罗、奇隆、阿索克等商圈全覆盖，住暹罗Siam/Asok素坤逸BTS最方便、远离老城大堵车（小红书路线共识）。去卧佛寺坐MRT到Sanam Chai站1号口，步行约6-8分钟；吉姆·汤普森之家BTS National Stadium站1号出口步行约5分钟。老城寺庙段用河船与步行衔接，别想着打车穿越老城。'},
   {h:'💳 怎么付钱',p:'BTS/MRT用Rabbit卡、Token或银行卡感应直接刷，不用排队买票。昭披耶河船码头现金购票，记得备零钱。夜市、路边摊、嘟嘟车只收现金，落地机场先取少量泰铢；进寺庙门票多为50铢/人，现金备足。商场餐厅刷Visa/Master没问题。'},
   {h:'✈️ 机场进城',p:'BKK素万那普：机场快线ARL 45泰铢、30分钟到Phaya Thai转BTS，最划算；人多行李多就Grab约300-500泰铢。DMK廊曼：A1公交30泰铢到Mo Chit转BTS，或SRT红线。曼谷交通差，机场往返务必至少提前4小时（行程备注）。廉航多在DMK，提前查好航站楼别跑错。'},
   {h:'🚕 打车软件',p:'Grab英文界面、固定价、可刷卡，不用跟司机扯皮，是主力。Bolt车少但通常比Grab便宜10-20%，曼谷可用。出租车起步40泰铢，务必确认"by meter"打表，备好泰文地址给司机看。高峰期全城堵车，短途不如地铁。'},
   {h:'🧳 带娃/行李',p:'行李多直接Grab去酒店，别拖着箱子挤ARL再换乘BTS。带娃避开BTS/MRT早晚高峰，人贴人推车难受。去大城府、丹嫩沙多这类远郊一日游，包车往返约2500-2800泰铢（帖子样本），让司机直接开进市场里面，省得折腾。'},
   {h:'⚠️ 常见坑',p:'嘟嘟车体验一次就行，上车前必议价，司机会绕路去购物点拿回扣。出租车不打表专宰游客，上车先问by meter。丹嫩沙多别在外围码头买票，黑码头有4000铢宰客记录（小红书避雷帖），让司机直接开进市场里面。橘旗船09:15-15:00停运改黄旗，别卡着点去码头。'}]},
  '清迈':{title:'古城靠走，远郊包车',sections:[
   {h:'🚶 市内交通',p:'古城1.5km见方，塔佩门、契迪龙、帕辛寺步行串联最舒服。红色双条车招手即停，古城内30-50泰铢/人；去宁曼路跟司机说Nimman，约30-40泰铢/人。双龙寺红色双条车单程约40-60泰铢（拼车）；Baan Kang Wat打tuk-tuk样本价150-180泰铢。Grab覆盖全城，去瓦洛洛市场、宁曼路都方便。'},
   {h:'💳 怎么付钱',p:'双条车、tuk-tuk都是现金，上车前谈好价再坐。寺庙门票多为50铢/人，多备泰铢现金。Grab可绑卡支付，商场餐厅刷卡没问题。'},
   {h:'✈️ 机场进城',p:'清迈机场离市区很近，Grab约20分钟到古城一带（OTA样本：四季酒店距机场约21分钟），价格以App实时为准。行李不多也可坐机场正规排队出租车，明码不绕路。'},
   {h:'🚕 打车软件',p:'Grab是主力，覆盖全城。深夜从酒吧街、宁曼路回酒店提前叫Grab，半夜路边车少。双条车适合白天短途拼车，晚上认准Grab。'},
   {h:'🧳 带娃/行李',p:'双条车没安全带、招手即停，带2岁半小娃选Grab汽车更稳。远郊（双龙寺、清莱白庙）包车半天约1500-2500泰铢，酒店前台或Klook订；双龙寺山路18弯，包车比自驾省心。大象自然公园只能官网订，费用含清迈酒店往返接送，不接受自行前往。因他农国家公园报一日游含接送最省心，公共双条车换乘2.5小时以上不推荐。'},
   {h:'⚠️ 常见坑',p:'租摩托需国际驾照，清迈交警查得严，无证被罚不划算。双条车上车先问价，游客价和本地价差不少。古城酒吧街深夜回酒店提前叫车，别在路边等。'}]},
  '普吉':{title:'景点分散，包车为王',sections:[
   {h:'🚗 市内交通',p:'普吉景点跨度大（卡塔-芭东-攀牙湾），包车一天约2500-3500泰铢最省心。Grab在芭东、卡塔好叫，去偏远海滩车少。神仙半岛距芭东约20km、卡塔约10km，Grab/出租约400-800泰铢（evendo样本）。普吉老镇全程约1.8公里，半天步行逛完；终点Phuket Camera可坐公交回机场约1小时。查龙湾位置偏，Grab或包车去，Pelago套餐Rawai等地接送另加300泰铢。日落后偏远海滩返程车难找，提前约好返程或谈往返价。'},
   {h:'💳 怎么付钱',p:'Grab可刷卡或现金，包车多付现金或提前线上订好。皮皮岛等出海项目现场有现金另付的项目，带够现金。一日游多含酒店接送+码头集合，订时确认是否含接送。'},
   {h:'✈️ 机场进城',p:'机场在岛北，到各海滩都要留足车程：Trisara约11公里15分钟（Business Travel News），Amanpuri约23.8公里41分钟（Trip.com）。酒店机场接送约1,900泰铢单程（OTA样本）。转场日提前3小时到HKT，当天只有一班直飞可别误了。'},
   {h:'🚕 打车软件',p:'普吉打车比曼谷贵30-50%，认准Grab明码价，别坐路边议价车。小红书实测：普吉打车到处好叫但"死贵"，跨海滩串线包车更划算。芭东Bangla路深夜散场用Grab回程，别在路边等。'},
   {h:'🧳 带娃/行李',p:'出海日选大船不晕，快艇刺激但颠；皇帝岛、皮皮岛船程1-2小时，晕船药提前吃。攀牙湾明确限制60岁以上、孕妇及特定疾病人群，报名前核对健康条款。行李多直接包车或酒店接送，别指望海滩区随手打车。'},
   {h:'⚠️ 常见坑',p:'租摩托风险高，普吉车祸率不低，无国际驾照被查罚款。大佛让司机送上山可能被额外收车辆磨损费，山上猴子凶，别投喂别对视。芭东夜生活区晚上堵车，步行更快。'}]},
  '槟城':{title:'乔治市步行，远郊打车',sections:[
   {h:'🚶 市内交通',p:'世遗核心区约2.5平方公里，全程步行或三轮车最合适，壁画街、姓氏桥、蓝屋步行全搞定。Rapid Penang公交1.4-4马币，CAT免费巴士绕行乔治市。姓氏桥从Armenian Street步行10-15分钟，也有CAT免费巴士。升旗山Rapid巴士1/10/91/21或Grab；极乐寺与升旗山同在Air Itam，可拼一天，巴士班次疏建议打车。'},
   {h:'💳 怎么付钱',p:'公交备零钱现金，CAT免费巴士不用钱。Grab可刷卡或现金，市区打车多收现金。美食街路边摊收现金，备些小额林吉特。'},
   {h:'✈️ 机场进城',p:'槟城国际机场距乔治市约16km，Grab约30分钟，价格以App实时为准。酒店多无确定性接送，Seven Terraces的接机在Trip.com和携程说法矛盾，入住前二次确认。'},
   {h:'🚕 打车软件',p:'Grab便宜好叫，市区内一趟约8-15马币，是主力。升旗山、极乐寺、巴都丁宜海滩打车串联。槟城不大，别包车，Grab随叫随到。'},
   {h:'🧳 带娃/行李',p:'核心区全步行，推车友好，美食都在步行范围内边走边吃。远郊（升旗山、极乐寺）打车直达，别折腾公交转车。升旗山小火车排队久，早上去，人少也凉快。'},
   {h:'⚠️ 常见坑',p:'极乐寺巴士班次疏，别在站牌干等，直接Grab。壁画文创产品普通，不必购买。乔治市中午炎热，安排室内博物馆避暑。'}]},
  '吉隆坡':{title:'轨道+Grab，雨天走连廊',sections:[
   {h:'🚇 市内交通',p:'MRT/LRT/Monorail覆盖KLCC、武吉免登、中央市场。双子塔LRT/MRT到KLCC站，出站即Suria KLCC商场。武吉免登MRT Kajang线Bukit Bintang站，Monorail也有站。茨厂街MRT/LRT至Pasar Seni站步行3-5分钟。天后宫在山上，LRT到Bangsar或Mid Valley站后再打车。'},
   {h:'💳 怎么付钱',p:'轨道用Touch n Go卡或银行卡感应进站。Grab可刷卡或现金，路边打车多收现金。商场餐厅刷卡方便，茨厂街小摊备现金。'},
   {h:'✈️ 机场进城',p:'KLIA Ekspres机场快线28分钟到KL Sentral，55马币，最快最稳。Grab约65-80马币、1小时，人多行李多时划算。亚航多在KLIA2，提前查好航站楼别跑错。'},
   {h:'🚕 打车软件',p:'Grab是主力，市区内一趟10-20马币。去黑风洞、布城打车比轨道转车快。天后宫这类山上景点直接Grab，别折腾轨道+步行。'},
   {h:'🧳 带娃/行李',p:'行李多直接Grab，别拖着箱子倒快线再转LRT。雨天走商场连廊，武吉免登各商场连廊互通，KLCC到武吉免登室内可走。带娃行程多安排室内商场+水族馆，躲阵雨。'},
   {h:'⚠️ 常见坑',p:'KL雨说下就下，出门带伞或备好室内备选。廉价航站楼KLIA2和KLIA主楼别跑错，亚航基本在KLIA2。中央市场一带小巷夜里结伴走。'}]},
  '胡志明市':{title:'Grab摩托是灵魂',sections:[
   {h:'🛵 市内交通',p:'Grab Bike比汽车快一倍还便宜，第一郡内一趟约2-4万越南盾；怕晒选汽车，约4-8万盾。滨城市场、红教堂、中央邮局、范五老街全在步行圈。地铁1号线到歌剧院站，第一郡核心可达。公交1路从滨城市场约40分钟、票价5,000越南盾（帖子样本），时间多可体验。过马路别犹豫，保持匀速走，摩托会绕开你。'},
   {h:'💳 怎么付钱',p:'越南盾现金为主，路边摊、摩托车、公交都收现金。Grab可绑卡支付，商场餐厅刷卡没问题。落地先取些现金，越南金店汇率较好（实用信息）。'},
   {h:'✈️ 机场进城',p:'Grab最省心，价格以App实时为准。机场109路公交可到第一郡附近，穷游可试。离境日提前3-4小时到机场，平安夜、节假日市区堵车更凶。'},
   {h:'🚕 打车软件',p:'Grab是唯一选择，摩托和汽车都在一个App里。出租车只认Vinasun、Mai Linh两家正规公司，上车看打表。路边野鸡车宰客，别上。'},
   {h:'🧳 带娃/行李',p:'带小娃别坐Grab Bike，选汽车，多花几万盾买平安。古芝地道半日游报团最省心（第一郡酒店7:30接、约14:30返），自助公交转车单程2-3小时。行李多直接Grab汽车，别挤公交。'},
   {h:'⚠️ 常见坑',p:'路边野鸡出租车宰客，只坐Vinasun/Mai Linh。滨城市场游客价争议多，换钱砍价，不在此购物或随意吃喝也行。第一郡堵车凶，短途摩托、长途汽车，赶时间别坐汽车。'}]},
  '富国岛':{title:'南北距离长，别折返跑',sections:[
   {h:'🚗 市内交通',p:'富国岛南北40km，珍珠乐园在北、Sao Beach在南，行程按南北分区：北岛一天、南岛一天，别来回折腾。包车一天约100-150万越南盾，或靠酒店接驳车。Grab在杨东镇好叫，去偏远海滩车少。租摩托约15-20万盾/天，环岛骑行爽但注意防晒。跨海缆车在Sunset Town，南岛酒店距缆车站约4.4公里、打车约10分钟（Traveloka样本）。VinWonders持票免费搭VinBus电动班车（机场-大世界-VinWonders-Safari）。'},
   {h:'💳 怎么付钱',p:'越南盾现金为主，包车、租摩托、夜市都收现金。Grab可绑卡，度假村内刷卡没问题。珍珠、鱼露等大额购物要收据，买珍珠认准产地证明。'},
   {h:'✈️ 机场进城',p:'几种方式对比：Regent距机场约10-15分钟车程，酒店可安排接送车（住客样本）；洲际距机场约15分钟，提供机场接驳；JW Marriott距机场约17.4公里（Traveloka），官网明确不提供班车，需Grab/打车或酒店租车；打车到Khem Beach约25-35万盾。订酒店时先问清接送，别默认都有。'},
   {h:'🚕 打车软件',p:'Grab在杨东镇、长滩一带好叫，去偏远海滩和南岛车少，提前叫。Khem Beach打车：阳东镇约30-40万盾。晚上从夜市回度假村提前叫车，别在路边等。'},
   {h:'🧳 带娃/行李',p:'带娃住南岛或中部度假村，包车或酒店车点对点，别折腾公交。北岛Safari+VinWonders一天，南岛缆车+海滩一天，分区住或分区玩。日落看西海岸，Sao Beach看日出，别跑反。'},
   {h:'⚠️ 常见坑',p:'JW Marriott官网明确不提供班车，别指望到了有车接，提前约Grab或酒店租车。出海去小岛浮潜，酒店或旅行社订一日游含接送，12月干季海况好。夜市纪念品可从开价一半起议价。'}]},
  '新加坡':{title:'MRT无敌，带娃少换乘',sections:[
   {h:'🚇 市内交通（MRT首选）',p:'主景点全覆盖：滨海湾、乌节路、牛车水、小印度、圣淘沙。起步约0.9新币，06:00-24:00，准点到分钟。滨海湾花园MRT Bayfront站出站步行可达；鱼尾狮公园坐到莱佛士坊、H口出沿新加坡河散步过去。双层巴士当观光车坐，滨海湾一圈风景好，Google Maps查班次准。去动物园：地铁到Khatib站，出A站台经7-11旁M2公交站，刷卡2.5新、约20分钟到。'},
   {h:'💳 怎么付钱',p:'EZ-Link卡或银行卡/手机直接刷，一人一卡、不能两人共用一张卡。新加坡地铁不能用支付宝，提前准备好。新加坡河游船可刷卡（2025年7月实测：成人约28新币、儿童18新币）。Grab可绑卡，路边小额备些现金。'},
   {h:'✈️ 机场进城',p:'MRT东西线直达樟宜机场Changi Airport站（CG2），经T2/T3二层连廊直达Jewel，最省钱。打车到市区约20-30新币，行李多或带娃时用。离境日提前约3小时到，务必复核航站楼。离境当天把Jewel星耀樟宜放在安检前：40米雨漩涡免费看，全室内推车随便推，逛完直接值机。'},
   {h:'🚕 打车软件',p:'新加坡打车贵，起步4新币+，平时MRT够了，带娃/行李多时再打车。Grab和ComfortDelGro都行，Grab可提前看固定价。圣淘沙Capella一带无直达MRT，MRT到HarbourFront转Sentosa Express再转巴士/打车。'},
   {h:'🧳 带娃/行李',p:'MRT换乘对推车友好，都有电梯；带2岁半娃减少换乘次数，直达优先。樟宜机场有免费推车借，落地先借上。圣淘沙捷运Sentosa Express 4新币，岛上免费摆渡车；环球影城、S.E.A海洋馆都在岛上，安排一整天。夜间动物园晚上有shuttle回地铁站，不用硬打车。'},
   {h:'⚠️ 常见坑',p:'地铁不能用支付宝，别到闸机前才发现。圣淘沙首次上岛4新/人、回程不收，出发前在小红书找当天免费登岛二维码可省4新（2026-03实测）。动物园18:00关门，17:30前出门坐M2返，否则返程站回地铁站。Dempsey Hill、东海岸公园无直达MRT，提前叫车。'}]},
 };

 const rideApps=[
  {name:'Grab',desc:'东南亚第一打车软件，8城全覆盖。英文界面、固定价、可刷卡/现金。汽车+摩托+外卖全有，必装。'},
  {name:'Bolt',desc:'曼谷可用，车比Grab少但通常便宜10-20%。其他城市覆盖弱。'},
  {name:'inDrive',desc:'部分城市可用，可议价模式，适合想砍价的。'},
  {name:'本地出租',desc:'曼谷认"by meter"、胡志明市认Vinasun/Mai Linh、新加坡ComfortDelGro。短途可坐，长途用Grab。'},
 ];
 return <div className="page"><PageHero eyebrow="GROUND PLAN" title="交通指南" summary="每城怎么挪、打车用什么软件、机场怎么进城，全在这页。行程里的城市排在前面；跨城航班去「航班」页看。" image={klImg}/>
 
 <section className="mobility"><div className="sectiontitle"><span>ON THE GROUND</span><h2>各城落地交通详解</h2><p>切换城市，一次只看一城：怎么挪、用什么软件、多少钱、水上交通{scopeCities&&scopeCities.length?`（只显示行程规划中的${scopeCities.join("、")}）`:planCities.length?`（${planCities.join("、")}排在前面）`:""}</p></div><CityTabs city={mcity} setCity={setMcity} label="交通城市切换" list={tabList}/><div className="mobilitysingle"><article key={mcity}><header style={{background:accents[mcity]}}><b>{mcity}</b><span>{cityDetail[mcity]?.title}</span></header><div className="mobility-grid">{cityDetail[mcity]?.sections.map((s,si)=><div className="mobility-sec" key={si}><h4>{s.h}</h4><ul>{s.p.split('。').map(x=>x.trim()).filter(Boolean).map((t,ti)=><li key={ti}>{t}。</li>)}</ul></div>)}</div></article></div></section>
 <section className="sectionblock"><div className="sectiontitle"><span>RIDE HAILING</span><h2>打车软件怎么选</h2><p>到了当地现装也来得及，但提前装好更从容</p></div>
 <div className="transportlist">{rideApps.map((a,i)=><article key={a.name}><span>{String(i+1).padStart(2,'0')}</span><div><h3>{a.name}</h3><p>{a.desc}</p></div></article>)}</div></section>
 <section className="darkpanel"><h2>交通底线</h2><div><article><h3>海岛出行</h3><p>船班受海况影响，贵重物品放防水袋，不把次日早班机排得过紧。选船看人：大船稳、长尾船慢有味道、快艇快但颠；易晕船提前吃药选大船。</p></article><article><h3>机场衔接</h3><p>跨国航班与托运行李需要更长缓冲；出票后再固化当天时间线。廉航多在廉价航站楼（曼谷DMK、吉隆坡KLIA2），提前查好别跑错。</p></article><article><h3>网约车</h3><p>按 App 显示车牌核对，机场与码头上车点提前确认。深夜/偏远地点提前叫车，别现等。</p></article><article><h3>步行日</h3><p>热带正午把室外长距离拆开，以室内馆、咖啡或酒店休息降温。带娃时推车+电梯路线提前查。</p></article></div></section></div>}

/** 景点目录（2026-10-02 用户：预订页加景点 tab）：AttractionGuide 的预订页包装，按行程城市筛选 */
/** 需要提前订票的景点清单（2026-10-02 用户：预订页景点 tab 只放需要订票的）
 * double-check 口径：数据里明确写了"官网预订/每天仅接待/必须预约/按场次/热门场次售罄"的，
 * 加上出海一日游这类需要提前报团的。不包括现场买票就行的大皇宫、寺庙、夜市等。 */
export const MUST_BOOK_ATTRACTIONS: string[] = [
  "大象自然公园",           // 清迈：官网预订，旺季提前订
  "Phuket Elephant Sanctuary", // 普吉：每天仅200名，预约提前规划
  "Siam Niramit",           // 普吉：演出票，建议提前订
  "夜间动物园",             // 新加坡：热门场次售罄，Klook买完还要预约时段
  "环球影城",               // 新加坡：建议提前买票
  "Singapore Oceanarium",   // 新加坡：建议提前买票
  "滨海湾花园",             // 新加坡：双温室票建议官网提前买
  "双子塔",                 // 吉隆坡：需提前预订，限流
  "吉姆·汤普森之家",       // 曼谷：按导览场次
  "攀牙湾",                 // 普吉：一日游建议提前报团
  "皮皮岛",                 // 普吉：一日游建议提前报团
  "因他农国家公园",         // 清迈：一日团建议提前报
  "VinWonders",             // 富国岛：主题乐园建议提前买票
  "Vinpearl Safari",        // 富国岛：建议提前买票
];

/** 需提前订票景点 → 原因（行动安排页展示用） */
export const MUST_BOOK_ATTRACTION_REASONS: Record<string, string> = {
  "大象自然公园": "官网预订，旺季提前订",
  "Phuket Elephant Sanctuary": "每天仅接待200名，预约提前规划",
  "Siam Niramit": "演出票，建议提前订",
  "夜间动物园": "热门场次售罄，买票后还要预约时段",
  "环球影城": "建议提前买票",
  "Singapore Oceanarium": "建议提前买票",
  "滨海湾花园": "双温室票建议官网提前买",
  "双子塔": "需提前预订，限流",
  "吉姆·汤普森之家": "按导览场次参观",
  "攀牙湾": "一日游建议提前报团",
  "皮皮岛": "一日游建议提前报团",
  "因他农国家公园": "一日团建议提前报",
  "VinWonders": "主题乐园建议提前买票",
  "Vinpearl Safari": "建议提前买票",
};

export function AttractionCatalog({onBook, scopeCities, bookingOnly, onCityChange, onItemSelect, defaultListExpanded, initialCity:propInitialCity, hideCityTabs}:{onBook?:OnBook;scopeCities?:string[];bookingOnly?:boolean;onCityChange?:(city:string)=>void;onItemSelect?:(key:string|null)=>void;defaultListExpanded?:boolean;initialCity?:string;hideCityTabs?:boolean}){
  /* 2026-10-03 修：初始城市必须取过滤后的首个行程城市，不能直接取 scopeCities[0]
   *（曾取到"北京"绕过 cities 过滤，tab 初次打开是空列表） */
  const list = scopeCities && scopeCities.length ? scopeCities.filter(c=>cities.includes(c)) : undefined;
  const initialCity = propInitialCity && list && list.includes(propInitialCity) ? propInitialCity : (list && list.length ? list[0] : undefined);
  return <AttractionGuide onBook={onBook} standalone={false} initialCity={initialCity} bookingOnly={bookingOnly} scopeCities={scopeCities} onCityChange={onCityChange} onItemSelect={onItemSelect} defaultListExpanded={defaultListExpanded} hideCityTabs={hideCityTabs} />;
}

function AttractionGuide({onBook,standalone,initialCity,initialSpot,bookingOnly,scopeCities,onCityChange,onItemSelect,defaultListExpanded,hideCityTabs}:{onBook?:OnBook;standalone?:boolean;initialCity?:string;initialSpot?:string;bookingOnly?:boolean;scopeCities?:string[];onCityChange?:(city:string)=>void;onItemSelect?:(key:string|null)=>void;defaultListExpanded?:boolean;hideCityTabs?:boolean}){
 const [expanded,setExpanded]=useState<string|null>(()=>initialSpot?initialSpot:null);
 const [selectedKey,setSelectedKey]=useState<string|null>(null);
 const [city,setCity]=useState(initialCity||cities[0]!);
 useEffect(()=>{ onCityChange?.(city); },[city]);
 useEffect(()=>{ if(!onItemSelect) return; const skey=selectedKey??expanded; if(skey){ const it=attractions.find(a=>a.city+a.name===skey); onItemSelect(it?`attraction:${it.city}:${it.name}`:null); } else onItemSelect(null); },[selectedKey,expanded]);
 /* 从 planner 跳过来的 spot 参数：自动定位到该景点并展开 */
 useEffect(()=>{
   if(initialSpot){
     const spot = attractions.find(a=>a.name===initialSpot);
     if(spot){
       setCity(spot.city);
       setExpanded(spot.city+spot.name);
       /* 滚动到该景点卡片 */
       setTimeout(()=>{
         const el = document.querySelector(`[data-spot="${CSS.escape(initialSpot)}"]`);
         el?.scrollIntoView({behavior:"smooth", block:"center"});
       }, 300);
     }
   }
 },[initialSpot]);
 const shown=useMemo(()=>{
   const base=attractions.filter(x=>x.city===city);
   // 2026-10-02 用户：预订页景点 tab 只放需要提前订票的
   if(bookingOnly) return base.filter(x=>MUST_BOOK_ATTRACTIONS.includes(x.name));
   return base;
 },[city,bookingOnly]);
 const attrPager=usePaged(shown,6,'个景点',defaultListExpanded);
 return <div className="page">{standalone&&<PageHero eyebrow="ATTRACTION GUIDE" title="景点指南" summary={`${cities.length}城景点完整攻略：按城市筛选，点击卡片展开查看游览重点、实用信息与小红书实读口碑。`} image={chiangmaiImg}/>}<section className="sectionblock"><div className="sectiontitle"><h2>{bookingOnly?"需要提前订票的景点":""+cities.length+"城景点指南"}</h2><p>{bookingOnly?"只显示需要提前预订门票/报团的景点，现场买票的寺庙、夜市、公园不在这里":"按城市筛选，点击展开查看完整攻略"}</p></div>{!hideCityTabs && <CityTabs city={city} setCity={(c:string)=>{setCity(c);setSelectedKey(null);}} label="景点城市筛选" list={scopeCities&&scopeCities.length?scopeCities.filter(c=>cities.includes(c)):undefined}/>}<InfographicPanel city={city}/><div className="catalog rich attractions">{attrPager.visible.map((it,i)=>{const akey=it.city+it.name;const aopen=expanded===akey;return <Fragment key={akey}><article data-place-key={`attraction:${it.city}:${it.name}`} className={"itemcard"+(selectedKey===akey||expanded===akey?" ring-2 ring-teal-600":"")} data-spot={it.name} onClick={(e)=>{ if((e.target as HTMLElement).closest("button,a")) return; setSelectedKey(prev=>prev===akey?null:akey); }}><ItemMedia item={it} kind="景点" index={i}/><div><span className="citytag">{it.city} · 景点</span><h3>{it.name}</h3><p className="meta">{it.meta}</p><p>{it.detail}</p><div className="decision"><b>怎么安排</b><span>{it.best}</span></div><XhsMini item={it}/><button className="solid" onClick={()=>{setSelectedKey(null);setExpanded(aopen?null:akey);}}>{aopen?'收起 ▲':'展开完整攻略 ▾'}</button>{onBook&&<button className="solid" onClick={()=>onBook({bkind:'attraction',name:it.name,city:it.city})}>预订门票</button>}<FavButton name={it.name} city={it.city} type='attraction'/></div></article>{aopen&&<InlineDetail item={it} kind="景点" onBook={onBook} onCollapse={()=>setExpanded(null)} />}</Fragment>})}</div>{attrPager.toggle}</section></div>
}

/** 旅行研究：纯参考资料库。酒店/美食/景点三个子分类，复用完整目录（含城市筛选），不带预订入口。
 * 2026-09-28 支持 URL 参数：?kind=景点|美食|酒店 &city=城市名（从行程规划跳过来时预选）。 */
function TravelResearch(){
 const params=new URLSearchParams(typeof window!=="undefined"?window.location.search:"");
 const initKind=(params.get("kind")==="美食"||params.get("kind")==="酒店")?params.get("kind") as '美食'|'酒店':'景点';
 const initCity=cities.includes(params.get("city")||"")?params.get("city")!:cities[0]!;
 const initSpot=params.get("spot")||undefined;
 const [kind,setKind]=useState<'景点'|'美食'|'酒店'>(initKind);
 const kinds:{key:'景点'|'美食'|'酒店';label:string}[]=[{key:'景点',label:'🏛️ 景点'},{key:'美食',label:'🍽️ 美食'},{key:'酒店',label:'🏨 酒店'}];
 return <div className="page"><PageHero eyebrow="TRAVEL RESEARCH" title="旅行研究" summary={`出行前的参考资料库：${cities.length}城酒店、美食、景点完整研究，按城市筛选、点击展开看完整攻略。这里只做参考——定好城市和日期后，去「预订」下单。`} image={chiangmaiImg}/><div className="viewtoggle" role="tablist" aria-label="研究分类">{kinds.map(k=><button key={k.key} className={kind===k.key?'active':''} aria-selected={kind===k.key} onClick={()=>setKind(k.key)}>{k.label}</button>)}</div>{kind==='酒店'?<HotelCatalog bare/>:kind==='美食'?<RestaurantCatalog bare/>:<AttractionGuide initialCity={initCity} initialSpot={initSpot}/>}<ResearchStatus/></div>;
}

function CountryAdvice(){ return <div className="countryadvice">{Object.entries(countryShoppingAdvice).map(([k,c])=><div key={k} className="countrycard"><h5>{c.title}</h5>{c.lines.map((l,i)=><p key={i}>{l}</p>)}</div>)}</div>;
}

function PackingTab(){
 const categories:{title:string;items:string[]}[]=[
  {title:'📄 证件与重要文件',items:['护照（有效期6个月以上）','越南电子签打印件','往返机票行程单','酒店确认单','旅行保险保单','证件复印件（与原件分开放）','2寸证件照2张备用']},
  {title:'👕 衣物（速干透气为主）',items:['速干T恤 3-4件','薄长袖1-2件（寺庙遮肩+防晒）','速干短裤2-3条','轻薄长裤1-2条（寺庙+飞机上）','泳衣/泳裤','轻薄外套1件（商场空调+清迈早晚凉）','速干内衣裤4-5套','短袜2-3双','睡衣1套']},
  {title:'👟 鞋类（别超2双+拖鞋）',items:['好走的凉鞋/洞洞鞋1双','人字拖1双（酒店+海滩）','轻便运动鞋1双（暴走日）']},
  {title:'🌧️ 雨季防护（12月新加坡多阵雨）',items:['轻便可折叠雨衣','防水手机袋','防水背包罩或干湿分离袋','速干毛巾1条','密封袋若干（装湿衣物/电子产品）']},
  {title:'💊 健康与药品',items:['SPF50+防晒霜','驱蚊液（含DEET或派卡瑞丁）','晒后修复/芦荟胶','常用药（感冒/肠胃/过敏）','处方药+原包装+处方证明','创可贴+消毒湿巾','电解质冲剂','清凉油/风油精']},
  {title:'👶 带娃专项（2岁半·新加坡段）',items:['轻便可折叠推车','儿童SPF50+物理防晒霜','宽檐遮阳帽','安抚玩具/绘本','飞机起降零食（缓解耳压）','尿不湿（按每天8片×天数）','湿巾大包','换洗衣物3套（含长袖长裤防空调）','保温水壶','便携餐具']},
  {title:'🔌 电子与充电',items:['全球转换插头（含英标G型）','多口USB充电器','充电宝10000mAh+','短数据线2根','耳机（飞机上用）']},
  {title:'🛍️ 购物专项（买买买必备）',items:['折叠购物袋2-3个','可封口防漏袋（装液体/药膏）','易碎品缓冲材料（气泡膜/衣服）','退税单据收纳袋','小额现金分装袋','便携行李秤','预留半箱行李空间']},
  {title:'🎒 日用与收纳',items:['分装瓶（洗护100ml内）','折叠衣架2-3个','洗衣片/便携皂','眼罩+耳塞','U型枕','纸巾/湿巾随身包']},
 ];
 const [rows,setRows]=useState<GuideRecord[]>([]);
 const [custom,setCustom]=useState('');
 const [openCat,setOpenCat]=useState<string|null>(categories[0]!.title);
 const refresh=()=>{listRecords().then(({records})=>setRows(records.filter(r=>r.kind==='packing'))).catch(()=>{});};
 useEffect(refresh,[]);
 const titles=rows.map(r=>r.title);
 const norm=(s:string)=>s.replace(/\s+/g,'');
 const normTitles=titles.map(norm);
 const add=async(x:string)=>{
  const t=x.trim();
  if(!t||normTitles.includes(norm(t)))return;
  try{await saveRecord({kind:'packing',title:t,body:'打包清单添加',day:null,done:false});setCustom('');refresh();}catch{/* ignore */}
 };
 const toggle=async(r:GuideRecord)=>{
  try{await saveRecord({id:r.id,kind:r.kind,title:r.title,body:r.body,day:r.day,done:!r.done});refresh();}catch{/* ignore */}
 };
 const del=async(id:number)=>{
  try{await deleteRecord({id});refresh();}catch{/* ignore */}
 };
 const doneCount=rows.filter(r=>r.done).length;
 return <div className="page"><PageHero eyebrow="PACKING LIST" title="打包清单" summary="按分类逐项准备：点＋加入你的清单，可勾选、删除、自己加。建议提前一周开始收，分批装箱。" image={hcmImg}/>
 <section className="packbox"><h4>🧳 我的打包进度 {rows.length>0&&`（${doneCount}/${rows.length}）`}</h4>
 <div className="packadd"><input value={custom} onChange={e=>setCustom(e.target.value)} placeholder="自己加一项，例如：折叠购物袋" aria-label="自定义打包项"/><button onClick={()=>add(custom)} disabled={!custom.trim()}>加入</button></div>
 {rows.length>0&&<ul className="packlist">{rows.map(r=><li key={r.id} className={r.done?'done':''}><button className="check" aria-label={`${r.done?'取消完成':'标记完成'}${r.title}`} onClick={()=>toggle(r)}>{r.done?'✓':'○'}</button><span>{r.title}</span><button className="packdel" aria-label={`删除${r.title}`} onClick={()=>r.id!==undefined&&del(r.id)}>删除</button></li>)}</ul>}
 </section>
 <section className="packcats"><h4>📋 分类推荐：点＋加入清单</h4>
 {categories.map(c=>{const open=openCat===c.title;return <div key={c.title} className="packcat"><button className="packcathead" onClick={()=>setOpenCat(open?null:c.title)}>{c.title} <span>{open?'▲':'▼'}</span></button>{open&&<div className="packchips">{c.items.map(x=>{const added=normTitles.includes(norm(x));return <button key={x} className={added?'added':''} onClick={()=>add(x)} disabled={added}>{added?'✓ ':'＋ '}{x}</button>;})}</div>}</div>;})}
 </section>
 <section className="notice"><h2>打包小贴士</h2><p>① 别带牛仔裤：湿了又重又难干。② 雨伞不如雨衣：东南亚阵雨来得急，雨衣更实用。③ 液体分装100ml内随身，超量托运。④ 鱼露、药膏等有气味液体务必密封+托运。⑤ 退税单据单独收纳，离境时海关要查验。</p></section>
 </div>;
}

function PackingStrip(){
 const items=['护照与签证副本','轻薄雨衣','SPF50防晒','防蚊用品','海岛防水袋','全球转换插头','常用药与处方证明'];
 const [rows,setRows]=useState<GuideRecord[]>([]);
 const [custom,setCustom]=useState('');
 const refresh=()=>{listRecords().then(({records})=>setRows(records.filter(r=>r.kind==='packing'))).catch(()=>{});};
 useEffect(refresh,[]);
 const titles=rows.map(r=>r.title);
 const add=async(x:string)=>{
  if(!x.trim()||titles.includes(x.trim()))return;
  try{await saveRecord({kind:'packing',title:x.trim(),body:'购物页添加',day:null,done:false});setCustom('');refresh();}catch{/* ignore */}
 };
 const toggle=async(r:GuideRecord)=>{
  try{await saveRecord({id:r.id,kind:r.kind,title:r.title,body:r.body,day:r.day,done:!r.done});refresh();}catch{/* ignore */}
 };
 const del=async(id:number)=>{
  try{await deleteRecord({id});refresh();}catch{/* ignore */}
 };
 return <section className="packbox"><h4>🧳 行前打包清单</h4>
 <p className="shoptext">先把行李收好再买买买：点一下把建议加入清单，可勾选、删除，也可自己加。下面就是你的完整打包清单。</p>
 <div className="packchips">{items.map(x=>{const done=titles.includes(x);return <button key={x} className={done?'added':''} onClick={()=>add(x)} disabled={done}>{done?'✓ ':'＋ '}{x}</button>;})}</div>
 <div className="packadd"><input value={custom} onChange={e=>setCustom(e.target.value)} placeholder="自己加一项，例如：折叠购物袋" aria-label="自定义打包项"/><button onClick={()=>add(custom)} disabled={!custom.trim()}>加入</button></div>
 {rows.length>0&&<ul className="packlist">{rows.map(r=><li key={r.id} className={r.done?'done':''}><button className="check" aria-label={`${r.done?'取消完成':'标记完成'}${r.title}`} onClick={()=>toggle(r)}>{r.done?'✓':'○'}</button><span>{r.title}</span><button className="packdel" aria-label={`删除${r.title}`} onClick={()=>r.id!==undefined&&del(r.id)}>删除</button></li>)}</ul>}
 </section>;
}

function Practical({onBook}:{onBook?:OnBook}){
 /** 地图商场标记深链：/practical?shop=<城市中文>#mall-<encodeURIComponent(商场名)>；交通直达：/practical?mode=交通 */
 const deep=useMemo(()=>{
  const q=new URLSearchParams(window.location.search);
  const shop=q.get('shop')||'';
  const mode0=q.get('mode')||'';
  const hash=window.location.hash||'';
  const mall=hash.startsWith('#mall-')?decodeURIComponent(hash.slice(6)):'';
  return {shop,mall,mode0};
 },[]);
 const [mode,setMode]=useState<'实用信息'|'购物推荐'|'打包清单'|'交通'>(deep.shop?'购物推荐':(deep.mode0==='交通'?'交通':'实用信息'));
 useEffect(()=>{
  if(mode!=='购物推荐'||!deep.mall) return;
  const t=window.setTimeout(()=>{
   document.getElementById(mallAnchorId(deep.mall))?.scrollIntoView({behavior:'smooth',block:'start'});
  },450);
  return ()=>window.clearTimeout(t);
 },[mode,deep]);
 const info=[
 ['签证（分国家）','中国护照：泰国免签（停留不超60天）、新加坡免签（30天）、马来西亚免签（30天）；越南需提前办电子签（e-Visa，官网申请约3-5个工作日）。韩国需提前办签证（以韩国驻华使领馆最新政策为准，中转/过境免签政策时有调整，出发前务必复核）。所有免签入境通常要求：护照有效期6个月以上、返程机票、酒店订单。政策可能变化，出发前务必向各国移民局官网复核。'],
 ['12月天气（分城市）','曼谷：28°C上下，干季，晴多，早晚舒适。清迈：15-28°C，早晚凉（需薄外套），干季少雨。普吉：26-31°C，干季，海况好，适合出海。新加坡：25-31°C，全年多雨，12月阵雨频繁，备雨衣+室内备选。吉隆坡/槟城：26-32°C，午后阵雨。胡志明市：22-32°C，干季开始。富国岛：25-30°C，干季，海况佳。首尔：回程经停在12月底-1月初，正值冬季，严寒干燥、日均温多在零下，羽绒服+防滑鞋必备。'],
 ['货币与支付','泰国泰铢(THB)、新加坡新币(SGD)、马来西亚林吉特(MYR)、越南盾(VND)、韩国韩元(KRW)。商场/超市/餐厅刷卡方便（Visa/Master全覆盖）；夜市、路边摊、打车多收现金。落地机场先取少量现金；泰国Big C、越南金店汇率较好，明洞/弘大的换钱所汇率常优于银行。参考汇率≠实际成交价，大额消费刷卡看实时汇率。'],
 ['网络与电话卡','提前买覆盖多国的eSIM最省事（淘宝/京东搜"东南亚eSIM"）；或落地机场买本地SIM：泰国AIS/TrueMove、马来西亚Digi、新加坡Singtel、越南Viettel、韩国KT/SK。海岛出海日提前下载离线地图（Google Maps离线包）。酒店WiFi普遍可用，但速度不稳定，重要预订用流量操作。'],
 ['插头与电压','五国电压220-240V。泰国：A/B/C型（两孔扁/圆）；新加坡/马来西亚：G型（英标三方）；越南：A/C型；韩国：C/F型（德标圆孔）。带一只全球转换插头+多口USB充电器全程通用。充电宝10000mAh以上随身，长途转场必备。'],
 ['市内交通','曼谷：BTS/MRT+打车（Grab），堵车严重时地铁优先。清迈：双条车+Grab。普吉：包车/ Grab，景点分散。新加坡：MRT+公交，EZ-Link卡或银行卡直接刷。吉隆坡：Grab为主，MRT覆盖主要商圈。胡志明市：Grab打车/摩托，便宜但注意安全。富国岛：包车/酒店接送。首尔：地铁四通八达，T-money卡刷地铁公交都方便；明洞/弘大/江南打车用Kakao T。'],
 ['城际交通','曼谷↔清迈：飞机1.5h（推荐）或夜行火车。曼谷↔普吉：飞机1.5h。吉隆坡↔槟城：飞机1h或大巴4-5h。新加坡↔吉隆坡：大巴5-6h或飞机1h。胡志明市↔富国岛：飞机1h。提前订亚航/越捷等廉航，注意行李额另购。'],
 ['语言','旅游区英语基本通用（新加坡全英语）；泰国/越南小摊贩英语有限，备好翻译App（Google翻译拍照翻菜单）。学几句当地语：萨瓦迪卡（你好/泰）、Terima kasih（谢谢/马来）、Cảm ơn（谢谢/越南），微笑是通用语言。'],
 ['购物退税','新加坡：GST 9%，单店消费满100新币可退税，机场eTRS自助办理，退信用卡或现金。泰国：单日单店满2000泰铢可退，VAT 7%，机场退税处办理，需出示P.P.10表格+商品。马来西亚：无统一游客退税。越南：部分指定商店可退10% VAT，机场办理。韩国：VAT 10%，单笔满3万韩元可退，认Tax Free标识（详见购物推荐·韩国篇）。退税商品需未使用+原包装，海关可能查验。'],
 ['健康与医疗','热带三件套：防晒、防蚊、补水。Soffell驱蚊液到泰国Big C买最便宜。肠胃药、过敏药、感冒药自备；处方药保留原包装+处方证明。东南亚私立医院水平不错（曼谷康民、新加坡莱佛士），买足旅行保险。生水别喝，路边摊选人多的，水果去皮吃。'],
 ['安全','四国治安总体良好。注意：① 财物分开放，护照放酒店保险箱；② 夜间偏僻小巷结伴；③ 摩托艇/水上项目选正规公司；④ 换汇去正规点，警惕"低价换汇"骗局；⑤ 泰国南部边境、马来西亚东部海岛暂不建议去。'],
 ['紧急电话','泰国：旅游警察1155、急救1669；新加坡：报警999、急救995；马来西亚：报警999；越南：报警113、急救115。中国驻外使领馆电话存手机里。旅行保险24小时救援电话打印一份放钱包。'],
 ['寺庙礼仪与着装','进寺庙/清真寺：脱鞋，着装遮肩过膝（备一条纱笼/薄长袖）。不要摸小孩头、不要用脚指人像。泰国王室话题慎言。参观大皇宫、双龙寺等有严格着装要求，不合规会被拦下租纱笼。'],
 ['小费文化','泰国：按摩/酒店行李给20-50泰铢小费是习惯；餐厅已收服务费可不另给。新加坡/马来西亚：一般不给小费（账单含服务费）。越南：高档餐厅可给5-10%。小费自愿，不强制，给了是对服务认可。']
 ];
 return <div className="page"><PageHero eyebrow="FIELD GUIDE" title="实用信息" summary="签证、天气、货币、打包、购物集中在一页，方便行前逐项收口。" image={hcmImg}/><div className="subtabs">{(['实用信息','购物推荐','打包清单','交通'] as const).map(x=><button key={x} className={mode===x?'active':''} onClick={()=>setMode(x)}>{x}</button>)}</div>{mode==='实用信息'&&<><section className="notice"><h2>出发前最后核验</h2><p>本攻略是 2026-09-12 的固定研究快照。开放时间、票价、签证、航班、天气停运、房态和预约规则请在出发前向官方渠道再次确认。</p></section><div className="infogrid visual">{info.map((x,i)=>{
 const icons=['🛂','🌤️','💳','📱','🔌','🚇','✈️','🗣️','🧾','🏥','🛡️','📞','🛕','💰'];
 const icon=icons[i]||'📌';
 return <article key={x[0]} className="infocard"><div className="infoicon">{icon}</div><div><h2>{x[0]}</h2><p>{x[1]}</p></div></article>
})}</div><section className="sourceguide"><h2>当前网站如何标注资料</h2><dl><div><dt>固定研究快照</dt><dd>表示内容截至 2026-09-12 整理，不代表出行时仍然有效。</dd></div><div><dt>行前复核</dt><dd>开放时间、价格、签证、航班、房态与天气相关项目都需要再次确认。</dd></div><div><dt>小红书链接</dt><dd>曼谷、清迈与普吉部分严格重做记录已导入详情页：只展示实际打开并阅读正文、可见滚动评论区的帖子。每项10篇的最终标准仍以页面显示的真实样本量为准。</dd></div></dl></section></>}{mode==='购物推荐'&&<SectionErrorBoundary label="购物推荐"><CountryAdvice/><div className="shopfolds">{shopCities.map((c,i)=><Fold key={c} eyebrow={shopDayLabel[c]||'行程外参考'} title={c} image={cityImages[c]} defaultOpen={i===0||c===deep.shop}><ShopGuide city={c} openMall={c===deep.shop?deep.mall:undefined}/></Fold>)}</div></SectionErrorBoundary>}{mode==='打包清单'&&<SectionErrorBoundary label="打包清单"><PackingTab/></SectionErrorBoundary>}{mode==='交通'&&<Transport/>}</div>
}

/** 购物推荐：行程内四城按实际行程顺序排前面，其余城市作参考。 */
const shopRouteOrder=['新加坡','普吉','清迈','曼谷'];
const shopDayLabel:Record<string,string>={'新加坡':'D1–D5 · 12-06～12-10','普吉':'D6–D8 · 12-11～12-13','清迈':'D9–D10 · 12-14～12-15','曼谷':'D11–D13 · 12-16～12-18'};
const shopCities=[...shopRouteOrder,...cities.filter(c=>!shopRouteOrder.includes(c))];
function MallCard({m,defaultOpen}:{m:MallDetail;defaultOpen?:boolean}){
 const [open,setOpen]=useState(!!defaultOpen);
 const [phIdx,setPhIdx]=useState(0);
 const photos=(m.photos&&m.photos.length>0)?m.photos:(m.photo?[{url:m.photo,source:m.photoSource||''}]:[]);
 const srcs=m.sources||[];
 return <article className="mallcard" id={mallAnchorId(m.name)}>
  <button className="mallhead" onClick={()=>setOpen(o=>!o)} aria-expanded={open}>
   {photos.length>0?<img src={photos[0].url} alt={m.name} loading="lazy"/>:<span className="mallph">🛍️</span>}
   <span className="malltitle"><b>{m.name}</b>{m.area&&<i>{m.area}</i>}<span className="mallpos">{m.positioning}</span></span>
   <span className="malltoggle">{open?'收起 ▲':'查看详细信息 ▾'}</span>
  </button>
  {open&&<div className="mallbody">
   {photos.length>1&&<div className="mallgallery">{photos.map((p,i)=><button key={i} className={i===phIdx?'active':''} onClick={()=>setPhIdx(i)}><img src={p.url} alt={`${m.name} ${i+1}`} loading="lazy"/></button>)}</div>}
   {photos.length>0&&<img className="mallbig" src={photos[phIdx]?photos[phIdx].url:photos[0].url} alt={m.name} loading="lazy"/>}
   <dl>
    {m.address&&<div><dt>📍 位置</dt><dd>{m.address}</dd></div>}
    {m.transport&&<div><dt>🚇 交通</dt><dd>{m.transport}</dd></div>}
    {m.hours&&<div><dt>🕙 营业时间</dt><dd>{m.hours}</dd></div>}
    {m.highlights.length>0&&<div><dt>✨ 值得逛</dt><dd><ul>{m.highlights.map((h,i)=><li key={i}>{h}</li>)}</ul></dd></div>}
    {m.review&&<div><dt>💬 详细评价</dt><dd>{m.review}</dd></div>}
    {m.tips&&<div><dt>📌 实用贴士</dt><dd>{m.tips}</dd></div>}
   </dl>
   <div className="malllinks">
    {m.mapUrl&&<a href={m.mapUrl} target="_blank" rel="noreferrer">🗺️ 地图导航</a>}
    {m.officialUrl&&<a href={m.officialUrl} target="_blank" rel="noreferrer">🌐 官网</a>}
   </div>
   {(m.updatedAt||srcs.length>0)&&<p className="mallsrc">{m.updatedAt&&<>资料查询于 {m.updatedAt}；</>}营业时间等易变信息以官方最新公布为准{srcs.length>0&&<> · 来源：{srcs.map((s,i)=><a key={i} href={s} target="_blank" rel="noreferrer">{i+1}</a>)}</>}</p>}
   {photos[phIdx]&&photos[phIdx].source&&<p className="mallcredit">图片来源：<a href={photos[phIdx].source} target="_blank" rel="noreferrer">来源页</a></p>}
  </div>}
 </article>;
}

function ShopGuide({city,openMall}:{city:string;openMall?:string}){
 const g=shoppingGuides[city];
 if(!g) return <p className="shoptext">{shopping[city as keyof typeof shopping]}</p>;
 return <div className="shopguide"><p className="shoptext">{g.lead}</p>
 <h4>值得逛（点击查看详细信息）</h4><div className="malllist">{g.malls.map(m=><MallCard key={m.name} m={m} defaultOpen={openMall!==undefined&&openMall===m.name}/>)}</div>
 <h4>最值得买的伴手礼</h4><ul>{g.souvenirs.map(s=><li key={s.name}>{s.star?'★ ':''}<b>{s.name}</b>——{s.note}</li>)}</ul>
 {g.tips.length>0 && <div className="shoptips"><h4>购物贴士</h4><ul>{g.tips.map(t=><li key={t}>{t}</li>)}</ul></div>}</div>;
}
/** 一键收藏：写入 sea_guide_records（kind="favorite"），type区分景点/酒店/餐厅/航班。
 * 景点收藏→行程优先排入；酒店/餐厅/航班收藏→预订行动清单。
 * 2026-10-02 用户：浏览航班时也要有收藏按钮 */
export function FavButton({name,city,type,extra}:{name:string;city:string;type:'attraction'|'hotel'|'restaurant'|'flight';extra?:Record<string,any>}){
  const [saving,setSaving]=useState(false);
  const [errMsg,setErrMsg]=useState<string|null>(null);
  const qc=useQueryClient();
  /* 2026-10-03 修：订阅 records 缓存，页面加载时自动显示已收藏状态（之前只在点击时查一次，刷新后按钮变回"＋ 收藏"） */
  const { data } = useQuery({ queryKey: ["records"], queryFn: listRecords });
  const done = (data?.records ?? []).some(r=>r.kind==='favorite'&&r.title===name);
  const onClick=async()=>{
    if(saving||done)return;setSaving(true);setErrMsg(null);
    try{
      await saveRecord({kind:'favorite',title:name,body:JSON.stringify({city,note:'',type,...(extra||{})}),day:null,done:false});
      /* 2026-10-02 修：收藏后立即刷新 records 缓存，否则行动安排页看不到新收藏 */
      qc.invalidateQueries({queryKey:["records"]});
    }catch(e){setErrMsg(e instanceof Error?e.message:'保存失败，请重试');}finally{setSaving(false);}
  };
  return <span style={{display:'inline-flex',flexDirection:'column',gap:4}}><button className={done?'selected':''} onClick={onClick} disabled={saving||done} aria-label={`收藏${name}`}>{done?'✓ 已收藏':saving?'保存中…':'＋ 收藏'}</button>{errMsg&&<span style={{fontSize:12,color:'#b91c1c'}}>{errMsg}</span>}</span>;
}

function RecordsPage({kind,title,summary,image}:{kind:RecordKind;title:string;summary:string;image:string}){
 const qc=useQueryClient();const q=useQuery({queryKey:['records'],queryFn:()=>listRecords()});const save=useMutation({mutationFn:saveRecord,onSuccess:()=>qc.invalidateQueries({queryKey:['records']})});const del=useMutation({mutationFn:deleteRecord,onSuccess:()=>qc.invalidateQueries({queryKey:['records']})});const [editId,setEditId]=useState<number|undefined>();const [syncMode,setSyncMode]=useState<'cloud'|'local'|null>(null);useEffect(()=>{void recordSyncMode().then(setSyncMode)},[]);const [name,setName]=useState('');const [body,setBody]=useState('');const [day,setDay]=useState(1);const rows=(q.data?.records||[]).filter(r=>kind==='note'?r.kind==='note':r.kind===kind);const recordPager=usePaged(rows,8,'条记录');const reset=()=>{setEditId(undefined);setName('');setBody('');setDay(1)};const add=()=>{if(!name.trim())return;save.mutate({id:editId,kind,title:name.trim(),body,day:kind==='journal'||kind==='note'?day:null,done:editId?rows.find(r=>r.id===editId)?.done||false:false},{onSuccess:reset})};const toggle=(r:RecordRow)=>save.mutate({id:r.id,kind:r.kind,title:r.title,body:r.body,day:r.day,done:!r.done});const beginEdit=(r:RecordRow)=>{setEditId(r.id);setName(r.title);setBody(r.body);setDay(r.day||1);window.scrollTo({top:0,behavior:'smooth'})};
 return <div className="page"><PageHero title={title} summary={summary} image={image}/>{syncMode==='local'&&<p className="syncnote" role="status">⚠️ 未登录本地模式：改动只保存在这台设备的浏览器里（刷新不丢）；登录后可云端同步。</p>}{syncMode==='cloud'&&<p className="syncnote ok" role="status">✓ 已登录：记录云端同步，两个账号共享同一份数据。</p>}<section className="records-layout"><form className="recordform" onSubmit={e=>{e.preventDefault();add()}}><span className="formeyebrow">PERSONAL WORKSPACE</span><h2>{editId?'编辑记录':'新增记录'}</h2><label>标题<input aria-label={`${title}标题`} value={name} onChange={e=>setName(e.target.value)} placeholder={kind==='booking'?'例如：曼谷文华东方':kind==='packing'?'例如：护照与签证副本':'写下这段旅程'}/></label>{(kind==='note'||kind==='journal')&&<label>关联日期<select aria-label="关联行程日期" value={day} onChange={e=>setDay(Number(e.target.value))}>{days.map(d=><option value={d.day} key={d.day}>Day {d.day} · {d.city}</option>)}</select></label>}<label>详情<textarea aria-label={`${title}详情`} value={body} onChange={e=>setBody(e.target.value)} placeholder="确认号、时间、地址、想法或补充说明"/></label><div><button className="primary" type="submit" disabled={save.isPending}>{save.isPending?'保存中…':editId?'保存修改':'保存'}</button>{editId&&<button className="secondary" type="button" onClick={reset}>取消</button>}</div></form>{kind==='packing'&&<section className="suggestions"><h2>热带海岛清单建议</h2>{['护照与签证副本','轻薄雨衣','SPF50防晒','防蚊用品','海岛防水袋','全球转换插头','常用药与处方证明'].map(x=><button key={x} onClick={()=>save.mutate({kind:'packing',title:x,body:'建议清单',day:null,done:false})}>＋ {x}</button>)}</section>}<section className="records"><h2>{title}</h2>{q.isPending?<p>正在读取…</p>:rows.length===0?<p className="empty">还没有内容。先在上面添加一条。</p>:<>{recordPager.visible.map(r=><article key={r.id} className={r.done?'done':''}><button className="check" aria-label={`${r.done?'取消完成':'标记完成'}${r.title}`} onClick={()=>toggle(r)}>{r.done?'✓':'○'}</button><div><h3>{r.title}</h3><AuthorName userId={r.userId}/>{r.day&&<span>Day {r.day}</span>}<p>{r.body||'—'}</p></div><span className="recordops"><button className="editrecord" aria-label={`编辑${r.title}`} onClick={()=>beginEdit(r)}>编辑</button><button className="delete" aria-label={`删除${r.title}`} onClick={()=>del.mutate({id:r.id})}>删除</button></span></article>)}{recordPager.toggle}</>}</section></section></div>
}

export function GuideApp({initialTab='酒店',hideChrome=false}:{initialTab?:Tab;hideChrome?:boolean}){
 const [tab,setTab]=useState<Tab>(initialTab);
 const [bookingPreset,setBookingPreset]=useState<BookingPreset|null>(null);
 // 2026-10-04 用户要求城市 tab 吸顶：设置 --citytabs-top 为全局顶栏高度，吸顶位置才对
 useEffect(()=>{
   const sync=()=>{
     const header=document.querySelector("header.sticky");
     const h=header?Math.round(header.getBoundingClientRect().height):0;
     document.documentElement.style.setProperty("--citytabs-top",`${h}px`);
   };
   sync();
   window.addEventListener("resize",sync);
   return ()=>window.removeEventListener("resize",sync);
 },[]);
 const onBook:OnBook=(p)=>setBookingPreset(p);
 const content=useMemo(()=>{if(tab==='航班')return <Flights onBook={onBook}/>;if(tab==='交通')return <Transport/>;if(tab==='酒店')return <HotelCatalog onBook={onBook}/>;if(tab==='餐厅')return <RestaurantCatalog onBook={onBook}/>;if(tab==='景点')return <AttractionGuide standalone onBook={onBook}/>;if(tab==='实用信息')return <SectionErrorBoundary label="实用信息"><Practical onBook={onBook}/></SectionErrorBoundary>;if(tab==='信息来源搜索状态')return <ResearchProgressPage/>;if(tab==='旅行研究')return <TravelResearch/>;if(tab==='我的预订')return <RecordsPage kind="booking" title="我的预订" summary="集中保存酒店、餐厅、航班、门票与确认号。" image={singaporeImg}/>;return <RecordsPage kind="journal" title="旅行游记" summary="按 Day 1—20 写下当天见闻、餐桌和照片线索。" image={penangImg}/>},[tab]);
 const go=(t:Tab)=>{setTab(t);window.scrollTo({top:0,behavior:'auto'})};
 return <div className="app"><SafeAreaTopScrim backgroundColor="var(--surface)"/>{!hideChrome&&<div className="migration-notice" role="note">⚠️ 数据更新中：本页为旧版攻略站整体迁移（研究快照 2026-09-12）；小红书严格实读与 189 项详情重做完成后会替换更新。</div>}{!hideChrome&&<nav className="mainnav" aria-label="攻略章节">{tabs.map(t=><button key={t} className={tab===t?'active':''} aria-current={tab===t?'page':undefined} onClick={()=>go(t)}><NavIcon tab={t}/><span>{t}</span></button>)}</nav>}<main>{content}</main>{!hideChrome&&<footer><strong>13天 · 2国 · 4城</strong><p>固定研究快照：2026-09-12。开放时间、价格、签证、航班与房态请在出发前向官方渠道复核。</p></footer>}<BookingDialog open={!!bookingPreset} preset={bookingPreset} onClose={()=>setBookingPreset(null)}/></div>
}
