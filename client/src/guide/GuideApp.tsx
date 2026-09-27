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
import { attractions, cities, days, hotelCityChecks, hotels, restaurants, shopping, shoppingGuides, countryShoppingAdvice, legs, cityMobility, type HotelGroup, type Item, type MallDetail } from './data';
import { attractionGuides } from './attractionGuides';
import { getInfographics, getCrossCityInfographics, type Infographic } from './infographics';
import { getPhotoSpots, photoSpotAttractionCount, photoSpotCount } from './attractionPhotoSpots';
import { getGuideFacts, getXhsAssessment, guideFactsCount, strictResearchLinkCount, secondaryEvidence, xhsEvidence } from './research';
import { getLiveHotelPrice, type LiveRoomRate } from './hotelLivePrices';
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

type Tab='航班'|'交通'|'酒店'|'餐厅'|'景点'|'实用信息'|'我的预订'|'游记'|'信息来源搜索状态';
export type GuideTab=Tab;
type RecordKind='booking'|'note'|'packing'|'journal';
type RecordRow=GuideRecord;

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
const cityImages:Record<string,string>={'曼谷':bangkokImg,'清迈':chiangmaiImg,'普吉':phuketImg,'槟城':penangImg,'吉隆坡':klImg,'胡志明市':hcmImg,'富国岛':phuquocImg,'新加坡':singaporeImg};
const route:[string,string,string][]=[['曼谷','3天','12/12–14'],['清迈','2天','12/15–16'],['普吉','3天','12/17–19'],['槟城','2天','12/20–21'],['吉隆坡','2天','12/22–23'],['胡志明市','2天','12/24–25'],['富国岛','3天','12/26–28'],['新加坡','3天','12/29–31']];
/** 预订入口回调：各 tab 的卡片/详情弹窗点“预订”时打开 BookingDialog */
type OnBook=(p:BookingPreset)=>void;
/** 当前行程（13天4城）各城入住/退房日期：预订弹窗预填优先用这张表 */
const currentStayRanges:Record<string,[string,string]>={
 '新加坡':['2026-12-12','2026-12-17'],
 '普吉':['2026-12-17','2026-12-20'],
 '曼谷':['2026-12-20','2026-12-23'],
 '清迈':['2026-12-23','2026-12-25'],
};
/** 按城市推算建议入住/退房日期，预填进酒店预订表单 */
function cityStayRange(city:string):{date?:string;dateEnd?:string}{
 const cur=currentStayRanges[city];
 if(cur)return {date:cur[0],dateEnd:cur[1]};
 const r=route.find(x=>x[0]===city)?.[2];
 const m=r?.match(/(\d+)\/(\d+)[–-](\d+)/);
 if(!m)return {};
 const p=(n:string|number)=>String(n).padStart(2,'0');
 const mo=p(m[1]);
 return {date:`2026-${mo}-${p(m[2])}`,dateEnd:`2026-${mo}-${p(Number(m[3])+1)}`};
}
/** 9 个航段对应的建议出发日期与行程天数 */
const legDateDay:[string,number][]=[['',1],['2026-12-17',6],['2026-12-20',9],['2026-12-23',12],['',13]];
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
 '游记':<><path d="M3 5a4 4 0 0 1 4-2h5v18H7a4 4 0 0 0-4 2zM21 5a4 4 0 0 0-4-2h-5v18h5a4 4 0 0 1 4 2z"/></>
};
function NavIcon({tab}:{tab:Tab}){return <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{navPaths[tab]}</svg>}

function Source({children}:{children:React.ReactNode}){return <p className="source">资料来源：{children}</p>}
function useHotelEntries(){const query=useQuery({queryKey:['research-status'],queryFn:()=>getResearchStatus(),staleTime:0,retry:1});return useMemo(()=>extractHotelEntries(query.data?.status),[query.data?.status])}
function HotelChainBadge({chain}:{chain?:string}){const label=chain?.trim();if(!label)return null;return <span className={`hotel-chain-badge ${hotelChainTone(label)}`}>{label}</span>}
function HotelTierBadge({tier}:{tier?:string}){const label=tier?.trim();if(!label)return null;return <span className={`hotel-tier-badge ${hotelTierTone(label)}`}>{label}</span>}
function HotelBadges({chain,tier}:{chain?:string;tier?:string}){if(!chain&&!tier)return null;return <span className="hotel-badges"><HotelChainBadge chain={chain}/><HotelTierBadge tier={tier}/></span>}
function PageHero({title,summary,image,eyebrow}:{title:string;summary:string;image:string;eyebrow?:string}){return <section className="pagehero"><img src={image} alt="" aria-hidden="true"/><div/><section>{eyebrow&&<span>{eyebrow}</span>}<h1>{title}</h1><p>{summary}</p></section></section>}

function ResearchStatus(){const strictItems=Object.keys(xhsEvidence).length;const maxSample=Math.max(0,...Object.values(xhsEvidence).map(x=>x.length));return <section className="research-status" aria-label="资料核验状态"><div><span>RESEARCH LOG · 2026-09-13</span><h2>逐项证据，不把缺口藏起来</h2><p>网站目录与候选图片覆盖和六来源研究工作集采用不同口径；六来源条目总数以“信息来源搜索状态”页的实时汇总为准。小红书严格样本目前覆盖 {strictItems} 项、单项最多 {maxSample} 篇，未满每地点 10 篇的项目不计算推荐率；图片精确地点匹配也仍在逐张核验。</p></div><strong>{guideFactsCount} 个结构化详情 · {strictResearchLinkCount} 个严格记录链接 · {placeGalleryPlaceCount} 个地点 / {placeGalleryPhotoCount} 张候选图片</strong></section>}

function XhsMini({item}:{item:Item}){const a=getXhsAssessment(item);const sample=(xhsEvidence[item.name]||[]).length;return <div className={`xhsmini ${a?'ready':'pending'}`}><span>小红书口碑</span>{a?<><b>{a.verdict}</b><small>{sample}/10 篇已核验 · 推荐 {a.recommend} · 谨慎 {a.caution} · 避雷 {a.avoid}</small></>:<><b>待严格核验</b><small>暂无可追溯统计，不补写结论</small></>}</div>}

function XhsPanel({item}:{item:Item}){const a=getXhsAssessment(item);const evidence=xhsEvidence[item.name]||[];const total=Math.max(1,a?a.recommend+a.caution+a.avoid:0);return <section className="xhsreview" aria-label={`${item.name}小红书口碑`}><header><div><span>XIAOHONGSHU REVIEW</span><h3>小红书口碑</h3></div><b className={a?a.verdict==='推荐'?'good':a.verdict==='不推荐'?'bad':'mixed':'pending'}>{a?.verdict||'待严格核验'}</b></header>{a?<><p className="sample-note">核验进度 {evidence.length}/10。基于下方已打开并阅读正文与评论区的帖子样本；是样本计数，不是平台总评分，未满 10 篇不写成已完成。</p><div className="sentiment" aria-label={`推荐${a.recommend}篇，谨慎${a.caution}篇，避雷${a.avoid}篇`}><article><div><span>推荐</span><b>{a.recommend}</b></div><i><em style={{width:`${a.recommend/total*100}%`}}/></i></article><article><div><span>谨慎</span><b>{a.caution}</b></div><i><em style={{width:`${a.caution/total*100}%`}}/></i></article><article><div><span>避雷</span><b>{a.avoid}</b></div><i><em style={{width:`${a.avoid/total*100}%`}}/></i></article></div><div className="xhswhy"><article><span>为什么推荐</span><p>{a.why}</p></article><article><span>应该避雷</span><p>{a.avoidNote}</p></article></div></>:<div className="xhspending"><strong>这项还没有完成小红书严格逐帖核验</strong><p>暂不显示推荐率、避雷率或虚构的帖子摘要。现有公开资料仍保留在其他详情区；严格核验完成后再补原帖与统计。</p></div>}</section>}

function OtaReviewPanel({item}:{item:Item}){const row=bangkokOta[item.name];if(!row)return null;return <section className="ota-panel" aria-label={`${item.name}多平台评分与口碑`}><header><div><span>MULTI-SOURCE REVIEW</span><h3>多平台评分与实读摘要</h3></div><b>核验于 {row.checked}</b></header><div className={`ota-scores ${row.google?'three':''}`}><a href={row.tripadvisor.url} target="_blank" rel="noreferrer"><span>TripAdvisor</span><strong>{row.tripadvisor.score}</strong><small>{row.tripadvisor.reviews} 条评价</small><em>{row.tripadvisor.title} ↗</em></a><article><span>{row.chinese.site}</span><strong>{row.chinese.score||'公开样本'}</strong><small>{row.chinese.reviews?`${row.chinese.reviews} 条评价`:'评分／数量未可靠取得'}</small>{row.chinese.url?<a href={row.chinese.url} target="_blank" rel="noreferrer">打开来源 ↗</a>:<em>原页面登录受限或报告未提供直链</em>}</article>{row.google&&<a href={row.google.url} target="_blank" rel="noreferrer"><span>Google Maps</span><strong>{row.google.score}</strong><small>{row.google.reviews} 条评价</small><em>打开地点 ↗</em></a>}</div><div className="ota-reading"><article><span>为什么推荐</span><p>{row.recommend}</p></article><article><span>应该避雷</span><p>{row.caution}</p></article></div><p className="ota-note">{row.chinese.note} {row.google?.note} 评分、数量与摘要只描述这次研究取得的页面及样本，不代表全网一致意见。</p></section>}

function SecondaryPanel({item}:{item:Item}){const rows=secondaryEvidence[item.name]||[];const groups=['Tripadvisor','中文旅游网站','官方与专业来源'] as const;return <section className="secondary-evidence"><header><span>MORE SOURCES</span><h3>其他交叉核验入口</h3><p>按来源分组，不与小红书或上方评分合并计算。</p></header><div className="sourcegroups">{groups.map(group=>{const links=rows.filter(x=>x.group===group);return <article key={group}><div><b>{group}</b><span>{links.length?`${links.length} 条已导入`:'待逐项直链'}</span></div>{links.length?links.map(x=><a key={x.url} href={x.url} target="_blank" rel="noreferrer"><strong>{x.title}</strong><small>{x.note}</small><em>↗</em></a>):<p>尚未导入可追溯的逐项来源，不补写评分或摘要。</p>}</article>})}</div></section>}

function PhotoViewer({photos,index,setIndex,onClose,name}:{photos:PlacePhoto[];index:number;setIndex:(i:number)=>void;onClose:()=>void;name:string}){const photo=photos[index]!;useEffect(()=>{const previous=document.body.style.overflow;document.body.style.overflow='hidden';const f=(e:KeyboardEvent)=>{if(e.key==='Escape')onClose();if(e.key==='ArrowLeft')setIndex((index-1+photos.length)%photos.length);if(e.key==='ArrowRight')setIndex((index+1)%photos.length)};window.addEventListener('keydown',f);return()=>{document.body.style.overflow=previous;window.removeEventListener('keydown',f)}},[index,onClose,photos.length,setIndex]);return <div className="photoviewer" role="dialog" aria-modal="true" aria-label={`${name}照片 ${index+1}/${photos.length}`}><header><div><strong>{name}</strong><span>{index+1} / {photos.length}</span></div><button aria-label="关闭照片查看器" onClick={onClose}>×</button></header><div className="photo-stage"><button aria-label="上一张照片" onClick={()=>setIndex((index-1+photos.length)%photos.length)}>‹</button><figure><img src={photo.src} alt={`${name}候选图片 ${index+1}`}/><figcaption>{photo.sourceUrl?<a href={photo.sourceUrl} target="_blank" rel="noreferrer">查看图片来源 ↗</a>:<span>图片来源待复核</span>}</figcaption></figure><button aria-label="下一张照片" onClick={()=>setIndex((index+1)%photos.length)}>›</button></div></div>}

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

function ItemMedia({item,kind,index}:{item:Item;kind:'酒店'|'餐厅'|'景点';index:number}){const gallery=getPlaceGallery(kind,item);const image=gallery[0]?.src;return <div className={`itemmedia ${image?'has-photo':'no-photo'}`}>{image?<img src={image} alt={`${item.name}候选图片`} loading="lazy"/>:<span aria-hidden="true">{item.name.slice(0,1)}</span>}<b style={{background:accents[item.city]}}>{String(index+1).padStart(2,'0')}</b>{gallery.length>=5&&<em>{gallery.length} 张图片</em>}</div>}

const operationalNotices:Record<string,{title:string;body:string}>={
 'PRU':{title:'营业状态异常',body:'Google Maps 在 2026-09-13 研究快照中显示“Temporarily closed”。不要按原计划直接前往；订位或出发前先向餐厅确认是否恢复营业。'},
 'Roti Taew Nam':{title:'营业状态异常',body:'Google Maps 在 2026-09-13 研究快照中显示“Temporarily closed”。不要按原计划直接前往；出发前先核对官方页面或电话确认。'}
};

/** 景点人像机位：详细位置 + 拍摄建议 + 图库样片（只配视角对得上的）。 */
function PhotoSpotPanel({item}:{item:Item}){
 const spots=getPhotoSpots(item.city,item.name);
 const gallery=getPlaceGallery('景点',item);
 return <section id="photospots" className="detailsection photospots"><span>PHOTO SPOTS</span><h3>📸 人像机位</h3>{spots?.length?<><p className="photospots-intro">人像机位：给同行人拍照用的点位，每个都写了人站在哪、面向哪。通用出片要点：上午顺光人脸干净、傍晚黄金时刻适合逆光剪影、背景尽量干净避开杂物；样片只用本站图库里视角对得上的照片，对不上的机位暂不配样片。</p><div className="photospotlist">{spots.map((s,i)=>{const photo=s.sampleIndex!=null?gallery[s.sampleIndex]:undefined;return <article key={i} className="photospot"><header><b>{String(i+1).padStart(2,'0')}</b><h4>{s.name}</h4></header><p className="spotwhere"><strong>📍 详细位置</strong><span>{s.where}</span></p><p className="spothow"><strong>📷 拍摄建议</strong><span>{s.how}</span></p>{photo?<figure><img src={photo.src} alt={s.sampleCaption||`${item.name} · ${s.name}样片`} loading="lazy"/><figcaption><span>{s.sampleCaption||'样片'}</span><a href={photo.sourceUrl} target="_blank" rel="noreferrer">来源：{photo.title} ↗</a></figcaption></figure>:<p className="spotnosample">该机位暂无视角对得上的样片，图库复核后补上。</p>}<a className="spotmap" href={mapLink(item.name,item.city)} target="_blank" rel="noreferrer">🗺 地图导航到{item.name}附近</a></article>})}</div></>:<p className="photospots-pending">该景点机位整理中，稍后补上。</p>}</section>
}

function LivePricePanel({name}:{name:string}){
 const p=getLiveHotelPrice(name);
 if(!p) return null;
 const row=(label:string,rate:LiveRoomRate|null,note?:string)=>(
  <div className="livepricerow"><b>{label}</b>{rate?<span><span className="livepriceroom">{rate.room}</span><span className="livepricevals">${rate.perNightUSD}/晚 · 整段 ${rate.totalUSD}{rate.totalInclTax?'（含税）':'（税前）'}</span><small>{rate.cancel}；{rate.breakfast}{rate.note?`；${rate.note}`:''}</small></span>:<span className="livepricenone">{note||'该日期未找到可订房型'}</span>}</div>);
 return <section className="detailsection livepriceblock" aria-label="按行程日期实时房价"><span>LIVE RATES · USD</span><h3>按行程日期实时房价</h3><p className="livepricedates">{p.checkIn} → {p.checkOut}（{p.nights} 晚）· 2 成人 1 间</p>{p.unavailable?<p className="livepricenone">{p.unavailable}</p>:<>{row('基础房',p.base,p.baseNote)}{row('套房',p.suite,p.suiteNote)}</>}<small className="livepricefoot">来源 {p.source} · 查询于 {p.checkedAt} · 房价实时波动，以下单时为准</small></section>;
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
 return <><div className={`detailhero ${image?'with-photo':'editorial'}`} style={image?undefined:{background:accents[item.city]}}>{image&&<img src={image} alt={`${item.name}候选图片`}/>}<div/><section><p>{item.city} · {kind}完整攻略</p><h2>{item.name}</h2><span>{item.meta}</span></section></div>{operationalNotice&&<aside className="operational-alert" role="status"><strong>{operationalNotice.title}</strong><p>{operationalNotice.body}</p></aside>}{kind==='酒店'&&<section className="hotelidentity"><span className="hotel-badges"><HotelChainBadge chain={chain}/><HotelTierBadge tier={tier}/></span><div><strong>{item.brand||'独立或其他酒店集团'}</strong><span>{item.loyaltyProgram||'不适用'}</span></div>{item.officialUrl?<a href={item.officialUrl} target="_blank" rel="noreferrer">官方酒店页 ↗</a>:<small>当前候选卡未绑定集团官方页</small>}</section>}<div className="detailcontent">{inline?<PhotoCarousel photos={gallery} name={item.name}/>:<PlaceGallery item={item} kind={kind}/>}<nav className="detailjump" id="detailtop" aria-label="详情目录"><a href="#decision">结论</a>{guide&&<a href="#guide">导游词</a>}{kind==='景点'&&<a href="#photospots">人像机位</a>}<a href="#facts">实用信息</a><a href="#xhs">小红书</a><a href="#sources">原帖</a></nav>{kind==='酒店'&&item.hotelAcclaim&&<section className="detailsection acclaimblock"><span>PUBLIC ACCLAIM</span><h3>🏆 公认口碑</h3><p>{item.hotelAcclaim}</p></section>}{kind==='餐厅'&&item.michelin&&<section className="detailsection michelinblock"><span>MICHELIN GUIDE</span><h3>⭐ 米其林指南</h3><p>{item.michelin}</p></section>}{kind!=='酒店'&&<AvailabilityPanel name={item.name} kind={kind as '餐厅'|'景点'}/>}<section id="decision" className="detaillead"><span>EDITOR'S VERDICT</span><h3>{kind==='酒店'?'值不值得住':kind==='餐厅'?'值不值得订':'值不值得去'}</h3>{guide?<p className="guideverdict">{guide.verdict}</p>:<p>{facts.action}</p>}</section>{guide&&<section id="guide" className="detailsection guideblock"><span>HIGHLIGHTS</span><h3>必看亮点</h3><ul>{guide.highlights.map(h=><li key={h.name}><b>{h.name}</b><span>{h.description}</span></li>)}</ul></section>}{guide&&<section className="detailsection guideblock"><span>HISTORY & CULTURE</span><h3>历史人文</h3>{guide.history.split("\n\n").map((pg,i)=><p key={i}>{pg}</p>)}</section>}{guide&&<section className="detailsection guideblock"><span>VISIT GUIDE</span><h3>游览建议</h3><div className="guidevisit"><p><b>建议时长</b><span>{guide.visit.duration}</span></p><p><b>最佳时间</b><span>{guide.visit.bestTime}</span></p><ul>{guide.visit.tips.map((t,i)=><li key={i}>{t}</li>)}</ul></div></section>}{kind==='景点'&&<PhotoSpotPanel item={item}/>}<div id="facts" className="detailfactgrid"><article><span>位置 / 地址</span><b>{facts.address}</b></article><article><span>营业 / 开放</span><b>{facts.hours}</b></article><article><span>价格 / 门票</span><b>{facts.price}</b></article><article><span>建议节奏</span><b>{facts.schedule}</b></article></div>{kind==='酒店'&&<LivePricePanel name={item.name}/>}{guide?null:<section className="detailsection detailmust"><h3>{kind==='酒店'?'入住重点':kind==='餐厅'?'必须点 / 用餐重点':'必看 / 必体验'}</h3><p>{item.detail} {item.best}</p></section>}{guide?null:<section className="detailsection"><h3>{kind==='酒店'?'住这里的核心理由':kind==='餐厅'?'体验重点与口碑判断':'亮点与游览方式'}</h3><p>{item.detail}</p></section>}<section className="detailsection"><h3>推荐理由</h3><p>{a?.why||item.best}</p></section><section className="detailsection warning"><h3>避雷与取舍</h3><p>{a?.avoidNote||facts.action}</p></section><section className="detailsection"><h3>怎么到 · 怎么串联</h3><p>{facts.transit}</p></section><section className="detailsection"><h3>{kind==='酒店'?'订房前确认':kind==='餐厅'?'订位与点单':'出发前确认'}</h3><ul>{checklist.map(x=><li key={x}>{x}</li>)}</ul></section><div id="xhs"><XhsPanel item={item}/></div><OtaReviewPanel item={item}/><SecondaryPanel item={item}/><section id="sources" className="evidence"><header><div><span>SOURCE LEDGER</span><h3>小红书原帖与核验记录</h3></div><b className={evidence.length?'verified':'pending'}>{facts.verification}</b></header>{evidence.length?<><div className="evidencelist">{evPager.visible.map((link,i)=><a key={link.url} href={link.url} target="_blank" rel="noreferrer"><em>{String(i+1).padStart(2,'0')}</em><span><strong>{link.title}</strong><small>{link.note}</small></span><i aria-hidden="true">↗</i></a>)}</div>{evPager.toggle}</>:<p className="evidenceempty">本条尚无可追溯的小红书逐帖链接。当前只呈现已完成的公开资料交叉核对，不补写帖子标题或链接。</p>}</section><a className="detailback" href="#detailtop">↑ 回到目录</a></div><div className="detailactions">{onBook&&<button className="primary" onClick={()=>onBook({bkind:kind==='酒店'?'hotel':kind==='餐厅'?'restaurant':'attraction',name:item.name,city:item.city,...cityStayRange(item.city)})}>{kind==='酒店'?'预订这家酒店':kind==='餐厅'?'预订 / 订位':'预订门票'}</button>}<a className={onBook?"secondary":"primary"} href={mapLink(item.name,item.city)} target="_blank" rel="noreferrer">在地图 App 中查看</a>{<FavButton name={item.name} city={item.city} type={kind==='酒店'?'hotel':kind==='餐厅'?'restaurant':'attraction'}/>}<button className="secondary" onClick={onClose}>{inline?'收起 ▲':'返回列表'}</button></div></>}


function InlineDetail({item,kind,onBook,onCollapse}:{item:Item;kind:'酒店'|'餐厅'|'景点';onBook?:OnBook;onCollapse:()=>void}){
 const ref=useRef<HTMLElement|null>(null);
 useEffect(()=>{ref.current?.scrollIntoView({behavior:'smooth',block:'start'})},[]);
 useEffect(()=>{const f=(e:KeyboardEvent)=>{if(e.key==='Escape')onCollapse()};window.addEventListener('keydown',f);return()=>window.removeEventListener('keydown',f)},[onCollapse]);
 return <section ref={ref} className="detail-inline" aria-label={`${item.name}完整攻略`}><DetailBody item={item} kind={kind} onClose={onCollapse} onBook={onBook} inline={true}/></section>
}

function CityTabs({city,setCity,label}:{city:string;setCity:(x:string)=>void;label:string}){return <div className="citytabs" aria-label={label}>{cities.map(c=><button key={c} className={city===c?'active':''} onClick={()=>setCity(c)}>{c}</button>)}</div>}

function HotelGroupBadge({group}:{group?:HotelGroup}){const label=group==='Marriott'?'Marriott · 万豪系':group==='Hyatt'?'Hyatt · 凯悦系':'其他集团';return <span className={`hotelgroup ${(group||'Other').toLowerCase()}`}>{label}</span>}

function HotelGroupMatrix(){return <section className="hotelmatrix" aria-label="八城万豪与凯悦最高端在营酒店核验"><header><div><span>OFFICIAL HOTEL CHECK · 2026-09-13</span><h2>每站 Marriott / Hyatt 顶级选择</h2><p>按官方在营状态与集团品牌层级筛选，不拿异地酒店补空缺；“未找到”不是永久不存在，入住前仍需复核。点击城市展开查看。</p></div><div className="matrixlegend"><HotelGroupBadge group="Marriott"/><HotelGroupBadge group="Hyatt"/></div></header><div className="matrixfolds">{hotelCityChecks.map((row,i)=><Fold key={row.city} className="matrixfold" eyebrow={`核验 ${row.checked}`} title={row.city} meta={`住宿 ${row.dates}`} defaultOpen={i===0}><div className="matrixchoices">{row.choices.map(choice=><section key={choice.group} className={`${choice.group.toLowerCase()} ${choice.status}`}><HotelGroupBadge group={choice.group}/>{choice.hotel?<><h3>{choice.hotel}</h3><b>{choice.brand} · {choice.loyaltyProgram}</b></>:<><h3>{choice.status==='coming-soon'?'没有在营选择':'截至核验日未找到'}</h3><b>{choice.brand||choice.loyaltyProgram}</b></>}<p>{choice.note}</p><a href={choice.officialUrl} target="_blank" rel="noreferrer">查看官方依据 ↗</a></section>)}</div></Fold>)}</div></section>}

export function HotelCatalog({onBook}:{onBook?:OnBook}){
 const hotelEntries=useHotelEntries();const chainFor=(item:Item)=>findHotelChain(hotelEntries,item.name,item.city);const tierFor=(item:Item)=>findHotelTier(hotelEntries,item.name,item.city);
 const [city,setCity]=useState(cities[0]!);const [expandedKey,setExpandedKey]=useState<string|null>(null);const [listExpanded,setListExpanded]=useState(false);const [compare,setCompare]=useState<Item[]>([]);const shown=orderHotelsByResearch(hotels.filter(x=>x.city===city),hotelEntries,city);const dates=route.find(x=>x[0]===city)?.[2];
 const toggle=(it:Item)=>setCompare(x=>x.some(y=>y.name===it.name)?x.filter(y=>y.name!==it.name):x.length<3?[...x,it]:x);
 const visibleHotels=listExpanded?shown:shown.slice(0,4);const listToggle=shown.length>4?<div className="showmore"><button type="button" className="secondary" onClick={()=>setListExpanded(v=>!v)} aria-expanded={listExpanded}>{listExpanded?'收起':'展开全部'} · {visibleHotels.length}/{shown.length} 家酒店</button></div>:null;const pickCity=(c:string)=>{setCity(c);setExpandedKey(null);setListExpanded(false)};const openHotelDetail=(it:Item)=>{const key=it.city+it.name;if(!visibleHotels.some(x=>x.city+x.name===key))setListExpanded(true);setExpandedKey(prev=>prev===key?null:key)};
 return <div className="page"><PageHero eyebrow="STAY COLLECTION" title="酒店推荐" summary="沿八城路线比较位置、风格、硬件与明确短板；先看取舍，再决定住哪一家。" image={singaporeImg}/><HotelGroupMatrix/><section className="sectionblock"><div className="sectiontitle"><h2>按城市浏览</h2><p>{hotels.length} 家候选 · 最多选择 3 家并排比较</p></div><CityTabs city={city} setCity={pickCity} label="酒店城市筛选"/><div className="citycover"><img src={cityImages[city]} alt={`${city}城市实景`}/><div><span>建议住宿日期 {dates}</span><h3>{city}</h3><p>{shown.length} 家酒店候选</p></div></div>{compare.length>0&&<section className="comparepanel"><header><h3>酒店对比 <span>{compare.length}/3</span></h3><button onClick={()=>setCompare([])}>清空</button></header><div>{compare.map(x=><article key={x.name}><HotelBadges chain={chainFor(x)} tier={tierFor(x)}/><b>{x.name}</b><span>{x.meta}</span><p>{x.best}</p><button onClick={()=>openHotelDetail(x)}>查看详情</button></article>)}</div></section>}<div className="catalog rich">{visibleHotels.map((it,i)=>{const hkey=it.city+it.name;const hopen=expandedKey===hkey;return <Fragment key={hkey}><article className="itemcard"><ItemMedia item={it} kind="酒店" index={i}/><div><HotelBadges chain={chainFor(it)} tier={tierFor(it)}/><span className="citytag">{it.city} · 住宿</span><h3>{it.name}</h3><p className="meta">{it.meta}</p><p>{it.detail}</p><div className="decision"><b>怎么选</b><span>{it.best}</span></div><XhsMini item={it}/><div className="cardactions"><button className="solid" onClick={()=>setExpandedKey(hopen?null:hkey)}>{hopen?'收起 ▲':'展开完整攻略 ▾'}</button>{onBook&&<button onClick={()=>onBook({bkind:'hotel',name:it.name,city:it.city,...cityStayRange(it.city)})}>预订</button>}<FavButton name={it.name} city={it.city} type='hotel'/><button className={compare.some(x=>x.name===it.name)?'selected':''} disabled={!compare.some(x=>x.name===it.name)&&compare.length>=3} onClick={()=>toggle(it)}>{compare.some(x=>x.name===it.name)?'✓ 已加入对比':'＋ 加入对比'}</button></div></div></article>{hopen&&<InlineDetail item={it} kind="酒店" onBook={onBook} onCollapse={()=>setExpandedKey(null)}/>}</Fragment>})}</div>{listToggle}</section><ResearchStatus/></div>
}

export function RestaurantCatalog({onBook}:{onBook?:OnBook}){
 const [view,setView]=useState<'每日用餐计划'|'按城市浏览'>('每日用餐计划');const [city,setCity]=useState(cities[0]!);const [expandedKey,setExpandedKey]=useState<string|null>(null);const shown=restaurants.filter(x=>x.city===city);const pickView=(v:'每日用餐计划'|'按城市浏览')=>{setView(v);setExpandedKey(null)};const pickCity=(c:string)=>{setCity(c);setExpandedKey(null)};const cityDays=days.filter(d=>d.city===city);
 const restPager=usePaged(shown,6,'个餐饮选择');
 return <div className="page"><PageHero eyebrow="DINING PLAN" title="餐厅预订决策指南" summary="把每日吃什么、必须提前订的餐桌、街头小吃与风险提醒放进同一套决策流程。" image={bangkokImg}/><div className="viewtoggle" role="tablist"><button className={view==='每日用餐计划'?'active':''} onClick={()=>pickView('每日用餐计划')}>每日用餐计划</button><button className={view==='按城市浏览'?'active':''} onClick={()=>pickView('按城市浏览')}>按城市浏览</button></div>{view==='每日用餐计划'?<section className="sectionblock mealplan"><div className="sectiontitle"><h2>20 天用餐路线</h2><p>按城市展开，查看每天的用餐组合与取舍</p></div>{route.map(([c],ci)=>{const cDays=days.filter(d=>d.city===c);return <Fold key={c} eyebrow={route.find(x=>x[0]===c)?.[2]} title={c} meta={`${cDays.length} 天用餐安排 · 点击展开`} image={cityImages[c]} defaultOpen={ci===0}><div className="mealdaylist">{cDays.map(d=><article key={d.day}><b>Day {d.day}</b><div><h4>{d.title}</h4><p>{d.food}</p></div><button onClick={()=>{setCity(c);pickView('按城市浏览')}}>查看 {c} 餐厅</button></article>)}</div></Fold>})}</section>:<section className="sectionblock"><div className="sectiontitle"><h2>按城市浏览</h2><p>{restaurants.length} 个餐饮选择 · 星级餐厅、老店与街头小吃分开判断</p></div><CityTabs city={city} setCity={pickCity} label="餐厅城市筛选"/><div className="bookingbrief"><strong>{city} · {cityDays.length}天</strong><p>{cityDays.map(d=>d.food).join(' ')}</p></div><div className="catalog rich">{restPager.visible.map((it,i)=>{const rkey=it.city+it.name;const ropen=expandedKey===rkey;return <Fragment key={rkey}><article className="itemcard"><ItemMedia item={it} kind="餐厅" index={i}/><div><span className="citytag">{it.city} · 餐饮</span><h3>{it.name}</h3><p className="meta">{it.meta}</p><p>{it.detail}</p><div className="decision"><b>订位 / 点单</b><span>{it.best}</span></div><XhsMini item={it}/><div className="cardactions"><button className="solid" onClick={()=>setExpandedKey(ropen?null:rkey)}>{ropen?'收起 ▲':'展开完整攻略 ▾'}</button>{onBook&&<button onClick={()=>onBook({bkind:'restaurant',name:it.name,city:it.city})}>预订 / 订位</button>}<FavButton name={it.name} city={it.city} type='restaurant'/><a href={mapLink(it.name,it.city)} target="_blank" rel="noreferrer">地图 App</a></div></div></article>{ropen&&<InlineDetail item={it} kind="餐厅" onBook={onBook} onCollapse={()=>setExpandedKey(null)}/>}</Fragment>})}</div>{restPager.toggle}</section>}<ResearchStatus/></div>
}


export function Flights({onBook}:{onBook?:OnBook}){const curLegs:[string,string,string][]=[['→ 新加坡','国际航班','去程国际段待定；Day 1（12-12）当天必须抵达新加坡'],['新加坡 → 普吉','城际直飞','D6转场（12-17）；实时价格见「预订行动」时间线'],['普吉 → 曼谷','城际直飞','D9转场（12-20）；实时价格见「预订行动」时间线'],['曼谷 → 清迈','城际直飞','D12转场（12-23）；实时价格见「预订行动」时间线'],['清迈 / 曼谷 →','国际航班','回程国际段待定；Day 13（12-24）在清迈结束']];const legPager=usePaged(curLegs,5,'个航段');return <div className="page"><PageHero eyebrow="FLIGHT PLAN" title="航班信息" summary="五段移动按单向路线排布。未确认航班号、实时票价与库存不会被写成事实。" image={bangkokImg}/><section className="sectionblock"><div className="sectiontitle"><h2>航段总览</h2><p>出票后把航班号、时间与确认号存进“我的预订”</p></div><div className="flightsummary"><article><b>5</b><span>个航段</span></article><article><b>3</b><span>段城际直飞</span></article><article><b>2</b><span>入境国家（新加坡、泰国）</span></article></div><div className="flightgrid">{legPager.visible.map(l=>{const i=curLegs.indexOf(l);const dd=legDateDay[i];return <article key={l[0]}><header><span>FLIGHT {String(i+1).padStart(2,'0')}</span><em>待预订</em></header><h3>{l[0]}</h3><strong>{l[1]}</strong><p>{l[2]}</p><dl><div><dt>出票前</dt><dd>核验日期与机场</dd></div><div><dt>出票后</dt><dd>保存航班号与确认号</dd></div></dl>{onBook&&<div className="cardactions"><button className="solid" onClick={()=>onBook({bkind:'transport',name:l[0],date:dd?.[0],day:dd?.[1]??null})}>记录预订</button></div>}</article>})}</div>{legPager.toggle}</section><section className="checklistband"><h2>每段都要核对</h2><div><span>航站楼</span><span>托运行李额</span><span>转机签证</span><span>最短衔接时间</span><span>末班接驳</span><span>取消与改签</span></div></section><Source>当前行程 2026-12-12～12-24（13天4城）；不含实时航班数据，实时价格见「预订行动」时间线</Source></div>}

export function Transport(){const [mcity,setMcity]=useState(cities[0]!);
 const flightLegs:{route:string;time:string;airlines:string;tip:string}[]=[
  {route:'曼谷 → 清迈',time:'直飞约1小时15分',airlines:'亚航(AirAsia)、曼谷航空、泰航微笑',tip:'亚航班次最多最便宜（Skytrax连续16年全球最佳廉航）；曼谷航空是精品航司，含免费行李+餐食，体验好。建议上午飞，下午游古城。'},
  {route:'清迈 → 普吉',time:'直飞约2小时',airlines:'亚航直飞',tip:'亚航有直飞，别选经停曼谷的。落地普吉后只排海滩/酒店，周转别太紧。'},
  {route:'普吉 → 槟城',time:'经吉隆坡中转约4-5小时',airlines:'亚航（普吉-吉隆坡-槟城）',tip:'无直飞，亚航经吉隆坡中转最顺。避免中转时间<2小时，行李直挂要确认。'},
  {route:'槟城 → 吉隆坡',time:'直飞约1小时',airlines:'亚航、马航、Firefly',tip:'三家都飞，亚航最便宜；Firefly用苏丹机场(SZB)离市区近。短途随便选，看时间。'},
  {route:'吉隆坡 → 胡志明市',time:'直飞约2小时',airlines:'亚航、越捷、越南航空',tip:'亚航班次密；越南航空是全服务含行李餐食。提前办好越南电子签，值机时查验。'},
  {route:'胡志明市 → 富国岛',time:'直飞约1小时',airlines:'越捷、越南航空、竹航',tip:'越捷最便宜但准点率一般；越南航空稳。富国岛机场小，落地后酒店多有接送。'},
  {route:'富国岛 → 新加坡',time:'经胡志明市中转约4-5小时',airlines:'越捷/越南航空（经SGN）',tip:'无直飞，经胡志明市中转。预留3小时+中转缓冲，国际转国际要重新安检。'},
 ];
 const cityDetail:Record<string,{title:string;sections:{h:string;p:string}[]}>={
  '曼谷':{title:'BTS+MRT是命，船是彩蛋',sections:[
   {h:'🚇 BTS/MRT（首选）',p:'BTS空铁16-59泰铢，MRT地铁16-42泰铢，06:00-24:00。Rabbit卡/Token/银行卡感应都行。暹罗、奇隆、阿索克等商圈全覆盖，堵车时段唯一靠谱选择。'},
   {h:'🚕 Grab/Bolt打车',p:'Grab英文界面、固定价、可刷卡，不用跟司机扯皮。Bolt车少但通常比Grab便宜10-20%。高峰期堵车严重，短途不如地铁。出租车起步40泰铢，务必确认"by meter"打表，备泰文地址。'},
   {h:'🚤 昭披耶河船（必体验）',p:'橘旗船16泰铢全程，大皇宫、卧佛寺、郑王庙、IconSiam一串全到，比打车快还便宜。蓝旗观光船45泰铢。09:15-15:00橘旗停运改黄旗。码头现金购票。'},
   {h:'✈️ 机场进城',p:'BKK素万那普：机场快线ARL 45泰铢30分钟到Phaya Thai转BTS，最划算；人多行李多就Grab约300-500泰铢。DMK廊曼：A1公交30泰铢到Mo Chit转BTS，或SRT红线。'},
   {h:'🛺 嘟嘟车',p:'体验一次就行，上车前必议价，司机会绕路去购物点拿回扣。短途代步可以，长途别坐，又晒又贵。'}]},
  '清迈':{title:'古城靠走，远郊包车',sections:[
   {h:'🚶 古城步行',p:'古城1.5km见方，寺庙全靠走。塔佩门、契迪龙、帕辛寺步行串联最舒服。'},
   {h:'🛺 双条车/ Grab',p:'双条车招手即停，古城内30-50泰铢/人，讲价。Grab覆盖全城，去宁曼路、瓦洛洛市场都方便。'},
   {h:'🚗 远郊包车',p:'双龙寺、清莱白庙、大象营都在郊外，包车半天约1500-2500泰铢，酒店前台或Klook订。双龙寺山路18弯，包车比自驾省心。'},
   {h:'💡 小贴士',p:'清迈打车不贵但车少，深夜从酒吧街回酒店提前叫Grab。租摩托需国际驾照，交警查得严。'}]},
  '普吉':{title:'景点分散，包车为王',sections:[
   {h:'🚗 包车/ Grab',p:'普吉景点跨度大（卡塔-芭东-攀牙湾），包车一天约2500-3500泰铢最省心。Grab在芭东、卡塔好叫，去偏远海滩车少。'},
   {h:'🚤 出海交通',p:'一日游多含酒店接送+码头集合。选大船不晕，快艇刺激但颠。皇帝岛、皮皮岛船程1-2小时，晕船药提前吃。'},
   {h:'🛵 租摩托',p:'月租便宜但风险高，普吉车祸率不低，无国际驾照被查罚款。短途可用，长途别骑。'},
   {h:'💡 小贴士',p:'普吉打车比曼谷贵30-50%，认准Grab明码价。芭东夜生活区晚上堵车，步行更快。'}]},
  '槟城':{title:'乔治市步行，远郊打车',sections:[
   {h:'🚶 乔治市步行',p:'世遗核心区不大，壁画街、姓氏桥、蓝屋步行全搞定。美食都在步行范围内，边走边吃。'},
   {h:'🚕 Grab',p:'槟城Grab便宜好叫，升旗山、极乐寺、巴都丁宜海滩打车串联。市区内一趟约8-15马币。'},
   {h:'🚌 公交',p:'Rapid Penang公交覆盖主要景点，1.4-4马币，CAT免费巴士绕行乔治市。时间充裕可体验。'},
   {h:'💡 小贴士',p:'槟城不大，别包车，Grab随叫随到。升旗山小火车排队久，早上去。'}]},
  '吉隆坡':{title:'轨道+Grab，雨天走连廊',sections:[
   {h:'🚇 轨道交通',p:'MRT/LRT/Monorail覆盖KLCC、武吉免登、中央市场。Touch n Go卡或银行卡感应。双子塔、独立广场、茨厂街轨道直达。'},
   {h:'🚕 Grab',p:'吉隆坡Grab是主力，市区内一趟10-20马币。去黑风洞、布城打车比轨道转车快。'},
   {h:'✈️ 机场进城',p:'KLIA Ekspres机场快线28分钟到KL Sentral，55马币。Grab约65-80马币/1小时。亚航多在KLIA2，提前查航站楼。'},
   {h:'🌧️ 雨天策略',p:'KL雨说下就下，武吉免登各商场有连廊互通，雨天 indoor 逛街不受影响。'}]},
  '胡志明市':{title:'Grab摩托是灵魂',sections:[
   {h:'🛵 Grab（汽车/摩托）',p:'胡志明市摩托大军，Grab Bike比汽车快一倍还便宜，第一郡内一趟约2-4万越南盾。怕晒选汽车，约4-8万盾。'},
   {h:'🚶 第一郡步行',p:'滨城市场、红教堂、中央邮局、范五老街全在步行圈。过马路别犹豫，保持匀速走，摩托会绕开你。'},
   {h:'🚕 出租车',p:'认准Vinasun、Mai Linh两家正规公司，打表。路边野鸡车宰客，小心。'},
   {h:'💡 小贴士',p:'胡志明市打车全东南亚最便宜，但堵车也凶。短途摩托，长途汽车。晚上范五老街回酒店走路都行。'}]},
  '富国岛':{title:'南北距离长，别折返跑',sections:[
   {h:'🚗 包车/酒店车',p:'富国岛南北40km，珍珠乐园在北、撒哈拉沙漠（Sao Beach）在南。包车一天约100-150万越南盾，或靠酒店接驳车。'},
   {h:'🛵 租摩托/ Grab',p:'Grab在杨东镇好叫，去偏远海滩车少。租摩托约15-20万盾/天，环岛骑行爽但注意防晒。'},
   {h:'🚤 出海',p:'富国岛出海去小岛浮潜，酒店或旅行社订一日游含接送。12月干季海况好。'},
   {h:'💡 小贴士',p:'行程按南北分区：北岛一天、南岛一天，别来回折腾。日落看西海岸，Sao Beach看日出。'}]},
  '新加坡':{title:'MRT无敌，带娃少换乘',sections:[
   {h:'🚇 MRT（首选）',p:'主景点全覆盖：滨海湾、乌节路、牛车水、小印度、圣淘沙。EZ-Link卡或银行卡/手机直接刷，起步约0.9新币。06:00-24:00，准点到分钟。'},
   {h:'🚌 公交',p:'双层巴士当观光车坐，滨海湾一圈风景好。Google Maps查班次准。'},
   {h:'🚕 Grab/出租车',p:'新加坡打车贵，起步4新币+，机场到市区约20-30新币。带娃/行李多时用，平时MRT够了。Grab和ComfortDelGro都行。'},
   {h:'🚶 圣淘沙',p:'圣淘沙捷运Sentosa Express 4新币，岛上免费摆渡车。环球影城、S.E.A海洋馆都在岛上，安排一整天。'},
   {h:'💡 带娃贴士',p:'MRT换乘对推车友好，都有电梯。带2岁半娃减少换乘次数，直达优先。樟宜机场有免费推车借。'}]},
 };
 const rideApps=[
  {name:'Grab',desc:'东南亚第一打车软件，8城全覆盖。英文界面、固定价、可刷卡/现金。汽车+摩托+外卖全有，必装。'},
  {name:'Bolt',desc:'曼谷可用，车比Grab少但通常便宜10-20%。其他城市覆盖弱。'},
  {name:'inDrive',desc:'部分城市可用，可议价模式，适合想砍价的。'},
  {name:'本地出租',desc:'曼谷认"by meter"、胡志明市认Vinasun/Mai Linh、新加坡ComfortDelGro。短途可坐，长途用Grab。'},
 ];
 return <div className="page"><PageHero eyebrow="GROUND PLAN" title="交通指南" summary="跨城航班怎么选、每城怎么挪、打车用什么软件，全在这页。先看跨城主线，再按城市查落地细节。" image={klImg}/>
 <section className="sectionblock"><div className="sectiontitle"><span>INTERCITY FLIGHTS</span><h2>跨城航班详解</h2><p>7段跨城航段：选哪家航司、注意什么。所有时间为参考，不代替出票信息</p></div>
 <div className="transportlist">{flightLegs.map((l,i)=><article key={l.route}><span>{String(i+1).padStart(2,'0')}</span><div><h3>{l.route} · {l.time}</h3><p><b>推荐航司：</b>{l.airlines}</p><p>{l.tip}</p></div></article>)}</div>
 <div className="notice" style={{marginTop:12}}><h2>航司口碑速览</h2><p>亚航AirAsia：Skytrax连续16年全球最佳廉航，东南亚航线之王，班次密、价格低，行李额需另购。酷航Scoot：新航旗下，全球最佳长途廉航，新加坡进出首选。曼谷航空：精品航司，票价含20kg行李+餐食+贵宾室，体验接近全服务。越南航空：越南国家航司，全服务，准点率不错。越捷VietJet：便宜但准点率和服务口碑一般，适合不赶时间的短途。廉航通病：行李额、选座、餐食全另收费，订票时算总价别只看裸票价。</p></div>
 </section>
 <section className="mobility"><div className="sectiontitle"><span>ON THE GROUND</span><h2>八城落地交通详解</h2><p>切换城市，一次只看一城：怎么挪、用什么软件、多少钱、水上交通</p></div><CityTabs city={mcity} setCity={setMcity} label="交通城市切换"/><div className="mobilitysingle"><article key={mcity}><header style={{background:accents[mcity]}}><b>{mcity}</b><span>{cityDetail[mcity]?.title}</span></header>{cityDetail[mcity]?.sections.map((s,si)=><div key={si} style={{marginTop:si?10:6}}><h4 style={{fontSize:14,margin:'0 0 4px'}}>{s.h}</h4><p style={{margin:0,fontSize:13,lineHeight:1.7}}>{s.p}</p></div>)}</article></div></section>
 <section className="sectionblock"><div className="sectiontitle"><span>RIDE HAILING</span><h2>打车软件怎么选</h2><p>到了当地现装也来得及，但提前装好更从容</p></div>
 <div className="transportlist">{rideApps.map((a,i)=><article key={a.name}><span>{String(i+1).padStart(2,'0')}</span><div><h3>{a.name}</h3><p>{a.desc}</p></div></article>)}</div></section>
 <section className="darkpanel"><h2>交通底线</h2><div><article><h3>海岛出行</h3><p>船班受海况影响，贵重物品放防水袋，不把次日早班机排得过紧。选船看人：大船稳、长尾船慢有味道、快艇快但颠；易晕船提前吃药选大船。</p></article><article><h3>机场衔接</h3><p>跨国航班与托运行李需要更长缓冲；出票后再固化当天时间线。廉航多在廉价航站楼（曼谷DMK、吉隆坡KLIA2），提前查好别跑错。</p></article><article><h3>网约车</h3><p>按 App 显示车牌核对，机场与码头上车点提前确认。深夜/偏远地点提前叫车，别现等。</p></article><article><h3>步行日</h3><p>热带正午把室外长距离拆开，以室内馆、咖啡或酒店休息降温。带娃时推车+电梯路线提前查。</p></article></div></section></div>}

function AttractionGuide({onBook,standalone}:{onBook?:OnBook;standalone?:boolean}){
 const [expanded,setExpanded]=useState<string|null>(null);const [city,setCity]=useState(cities[0]!);
 const shown=attractions.filter(x=>x.city===city);
 const attrPager=usePaged(shown,6,'个景点');
 return <div className="page">{standalone&&<PageHero eyebrow="ATTRACTION GUIDE" title="景点指南" summary="八城景点完整攻略：按城市筛选，点击卡片展开查看游览重点、实用信息与小红书实读口碑。" image={chiangmaiImg}/>}<section className="sectionblock"><div className="sectiontitle"><h2>八城景点指南</h2><p>按城市筛选，点击展开查看完整攻略</p></div><CityTabs city={city} setCity={setCity} label="景点城市筛选"/><InfographicPanel city={city}/><div className="catalog rich attractions">{attrPager.visible.map((it,i)=>{const akey=it.city+it.name;const aopen=expanded===akey;return <Fragment key={akey}><article className="itemcard"><ItemMedia item={it} kind="景点" index={i}/><div><span className="citytag">{it.city} · 景点</span><h3>{it.name}</h3><p className="meta">{it.meta}</p><p>{it.detail}</p><div className="decision"><b>怎么安排</b><span>{it.best}</span></div><XhsMini item={it}/><button className="solid" onClick={()=>setExpanded(aopen?null:akey)}>{aopen?'收起 ▲':'展开完整攻略 ▾'}</button>{onBook&&<button className="solid" onClick={()=>onBook({bkind:'attraction',name:it.name,city:it.city})}>预订门票</button>}<FavButton name={it.name} city={it.city} type='attraction'/></div></article>{aopen&&<InlineDetail item={it} kind="景点" onBook={onBook} onCollapse={()=>setExpanded(null)}/>}</Fragment>})}</div>{attrPager.toggle}</section></div>
}

function CountryAdvice(){
 return <div className="countryadvice">{Object.entries(countryShoppingAdvice).map(([k,c])=><div key={k} className="countrycard"><h5>{c.title}</h5>{c.lines.map((l,i)=><p key={i}>{l}</p>)}</div>)}</div>;
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
 const [mode,setMode]=useState<'实用信息'|'购物推荐'|'打包清单'>('实用信息');
 const info=[
 ['签证（分国家）','中国护照：泰国免签（停留不超60天）、新加坡免签（30天）、马来西亚免签（30天）；越南需提前办电子签（e-Visa，官网申请约3-5个工作日）。所有免签入境通常要求：护照有效期6个月以上、返程机票、酒店订单。政策可能变化，出发前务必向各国移民局官网复核。'],
 ['12月天气（分城市）','曼谷：28°C上下，干季，晴多，早晚舒适。清迈：15-28°C，早晚凉（需薄外套），干季少雨。普吉：26-31°C，干季，海况好，适合出海。新加坡：25-31°C，全年多雨，12月阵雨频繁，备雨衣+室内备选。吉隆坡/槟城：26-32°C，午后阵雨。胡志明市：22-32°C，干季开始。富国岛：25-30°C，干季，海况佳。'],
 ['货币与支付','泰国泰铢(THB)、新加坡新币(SGD)、马来西亚林吉特(MYR)、越南盾(VND)。商场/超市/餐厅刷卡方便（Visa/Master全覆盖）；夜市、路边摊、打车多收现金。落地机场先取少量现金；泰国Big C、越南金店汇率较好。参考汇率≠实际成交价，大额消费刷卡看实时汇率。'],
 ['网络与电话卡','提前买覆盖四国的eSIM最省事（淘宝/京东搜"东南亚eSIM"）；或落地机场买本地SIM：泰国AIS/TrueMove、马来西亚Digi、新加坡Singtel、越南Viettel。海岛出海日提前下载离线地图（Google Maps离线包）。酒店WiFi普遍可用，但速度不稳定，重要预订用流量操作。'],
 ['插头与电压','四国电压220-240V。泰国：A/B/C型（两孔扁/圆）；新加坡/马来西亚：G型（英标三方）；越南：A/C型。带一只全球转换插头+多口USB充电器全程通用。充电宝10000mAh以上随身，长途转场必备。'],
 ['市内交通','曼谷：BTS/MRT+打车（Grab），堵车严重时地铁优先。清迈：双条车+Grab。普吉：包车/ Grab，景点分散。新加坡：MRT+公交，EZ-Link卡或银行卡直接刷。吉隆坡：Grab为主，MRT覆盖主要商圈。胡志明市：Grab打车/摩托，便宜但注意安全。富国岛：包车/酒店接送。'],
 ['城际交通','曼谷↔清迈：飞机1.5h（推荐）或夜行火车。曼谷↔普吉：飞机1.5h。吉隆坡↔槟城：飞机1h或大巴4-5h。新加坡↔吉隆坡：大巴5-6h或飞机1h。胡志明市↔富国岛：飞机1h。提前订亚航/越捷等廉航，注意行李额另购。'],
 ['语言','旅游区英语基本通用（新加坡全英语）；泰国/越南小摊贩英语有限，备好翻译App（Google翻译拍照翻菜单）。学几句当地语：萨瓦迪卡（你好/泰）、Terima kasih（谢谢/马来）、Cảm ơn（谢谢/越南），微笑是通用语言。'],
 ['购物退税','新加坡：GST 9%，单店消费满100新币可退税，机场eTRS自助办理，退信用卡或现金。泰国：单日单店满2000泰铢可退，VAT 7%，机场退税处办理，需出示P.P.10表格+商品。马来西亚：无统一游客退税。越南：部分指定商店可退10% VAT，机场办理。退税商品需未使用+原包装，海关可能查验。'],
 ['健康与医疗','热带三件套：防晒、防蚊、补水。Soffell驱蚊液到泰国Big C买最便宜。肠胃药、过敏药、感冒药自备；处方药保留原包装+处方证明。东南亚私立医院水平不错（曼谷康民、新加坡莱佛士），买足旅行保险。生水别喝，路边摊选人多的，水果去皮吃。'],
 ['安全','四国治安总体良好。注意：① 财物分开放，护照放酒店保险箱；② 夜间偏僻小巷结伴；③ 摩托艇/水上项目选正规公司；④ 换汇去正规点，警惕"低价换汇"骗局；⑤ 泰国南部边境、马来西亚东部海岛暂不建议去。'],
 ['紧急电话','泰国：旅游警察1155、急救1669；新加坡：报警999、急救995；马来西亚：报警999；越南：报警113、急救115。中国驻外使领馆电话存手机里。旅行保险24小时救援电话打印一份放钱包。'],
 ['寺庙礼仪与着装','进寺庙/清真寺：脱鞋，着装遮肩过膝（备一条纱笼/薄长袖）。不要摸小孩头、不要用脚指人像。泰国王室话题慎言。参观大皇宫、双龙寺等有严格着装要求，不合规会被拦下租纱笼。'],
 ['小费文化','泰国：按摩/酒店行李给20-50泰铢小费是习惯；餐厅已收服务费可不另给。新加坡/马来西亚：一般不给小费（账单含服务费）。越南：高档餐厅可给5-10%。小费自愿，不强制，给了是对服务认可。']
 ];
 return <div className="page"><PageHero eyebrow="FIELD GUIDE" title="实用信息" summary="签证、天气、货币、打包、购物集中在一页，方便行前逐项收口。" image={hcmImg}/><div className="subtabs">{(['实用信息','购物推荐','打包清单'] as const).map(x=><button key={x} className={mode===x?'active':''} onClick={()=>setMode(x)}>{x}</button>)}</div>{mode==='实用信息'&&<><section className="notice"><h2>出发前最后核验</h2><p>本攻略是 2026-09-12 的固定研究快照。开放时间、票价、签证、航班、天气停运、房态和预约规则请在出发前向官方渠道再次确认。</p></section><div className="infogrid">{info.map((x,i)=><article key={x[0]}><span>{String(i+1).padStart(2,'0')}</span><h2>{x[0]}</h2><p>{x[1]}</p></article>)}</div><section className="sourceguide"><h2>当前网站如何标注资料</h2><dl><div><dt>固定研究快照</dt><dd>表示内容截至 2026-09-12 整理，不代表出行时仍然有效。</dd></div><div><dt>行前复核</dt><dd>开放时间、价格、签证、航班、房态与天气相关项目都需要再次确认。</dd></div><div><dt>小红书链接</dt><dd>曼谷、清迈与普吉部分严格重做记录已导入详情页：只展示实际打开并阅读正文、可见滚动评论区的帖子。每项10篇的最终标准仍以页面显示的真实样本量为准。</dd></div></dl></section></>}{mode==='购物推荐'&&<SectionErrorBoundary label="购物推荐"><CountryAdvice/><div className="shopfolds">{shopCities.map((c,i)=><Fold key={c} eyebrow={shopDayLabel[c]||'行程外参考'} title={c} image={cityImages[c]} defaultOpen={i===0}><ShopGuide city={c}/></Fold>)}</div></SectionErrorBoundary>}{mode==='打包清单'&&<SectionErrorBoundary label="打包清单"><PackingTab/></SectionErrorBoundary>}</div>
}

/** 购物推荐：行程内四城按实际行程顺序排前面，其余城市作参考。 */
const shopRouteOrder=['新加坡','普吉','曼谷','清迈'];
const shopDayLabel:Record<string,string>={'新加坡':'D1–D5 · 12-12～12-16','普吉':'D6–D8 · 12-17～12-19','曼谷':'D9–D11 · 12-20～12-22','清迈':'D12–D13 · 12-23～12-24'};
const shopCities=[...shopRouteOrder,...cities.filter(c=>!shopRouteOrder.includes(c))];
function MallCard({m}:{m:MallDetail}){
 const [open,setOpen]=useState(false);
 const [phIdx,setPhIdx]=useState(0);
 const photos=(m.photos&&m.photos.length>0)?m.photos:(m.photo?[{url:m.photo,source:m.photoSource||''}]:[]);
 const srcs=m.sources||[];
 return <article className="mallcard">
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

function ShopGuide({city}:{city:string}){
 const g=shoppingGuides[city];
 if(!g) return <p className="shoptext">{shopping[city as keyof typeof shopping]}</p>;
 return <div className="shopguide"><p className="shoptext">{g.lead}</p>
 <h4>值得逛（点击查看详细信息）</h4><div className="malllist">{g.malls.map(m=><MallCard key={m.name} m={m}/>)}</div>
 <h4>最值得买的伴手礼</h4><ul>{g.souvenirs.map(s=><li key={s.name}>{s.star?'★ ':''}<b>{s.name}</b>——{s.note}</li>)}</ul>
 {g.tips.length>0 && <div className="shoptips"><h4>购物贴士</h4><ul>{g.tips.map(t=><li key={t}>{t}</li>)}</ul></div>}</div>;
}
/** 一键收藏：写入 sea_guide_records（kind="favorite"），type区分景点/酒店/餐厅。
 * 景点收藏→行程优先排入；酒店/餐厅收藏→预订行动清单。 */
export function FavButton({name,city,type}:{name:string;city:string;type:'attraction'|'hotel'|'restaurant'}){
  const [st,setSt]=useState<'idle'|'saving'|'done'>('idle');
  const onClick=async()=>{
    if(st!=='idle')return;setSt('saving');
    try{
      const {records}=await listRecords();
      if(!records.some(r=>r.kind==='favorite'&&r.title===name))
        await saveRecord({kind:'favorite',title:name,body:JSON.stringify({city,note:'',type}),day:null,done:false});
      setSt('done');
    }catch{setSt('idle');}
  };
  return <button className={st==='done'?'selected':''} onClick={onClick} disabled={st!=='idle'} aria-label={`收藏${name}`}>{st==='done'?'✓ 已收藏':st==='saving'?'保存中…':'＋ 收藏'}</button>;
}

function RecordsPage({kind,title,summary,image}:{kind:RecordKind;title:string;summary:string;image:string}){
 const qc=useQueryClient();const q=useQuery({queryKey:['records'],queryFn:()=>listRecords()});const save=useMutation({mutationFn:saveRecord,onSuccess:()=>qc.invalidateQueries({queryKey:['records']})});const del=useMutation({mutationFn:deleteRecord,onSuccess:()=>qc.invalidateQueries({queryKey:['records']})});const [editId,setEditId]=useState<number|undefined>();const [syncMode,setSyncMode]=useState<'cloud'|'local'|null>(null);useEffect(()=>{void recordSyncMode().then(setSyncMode)},[]);const [name,setName]=useState('');const [body,setBody]=useState('');const [day,setDay]=useState(1);const rows=(q.data?.records||[]).filter(r=>kind==='note'?r.kind==='note':r.kind===kind);const recordPager=usePaged(rows,8,'条记录');const reset=()=>{setEditId(undefined);setName('');setBody('');setDay(1)};const add=()=>{if(!name.trim())return;save.mutate({id:editId,kind,title:name.trim(),body,day:kind==='journal'||kind==='note'?day:null,done:editId?rows.find(r=>r.id===editId)?.done||false:false},{onSuccess:reset})};const toggle=(r:RecordRow)=>save.mutate({id:r.id,kind:r.kind,title:r.title,body:r.body,day:r.day,done:!r.done});const beginEdit=(r:RecordRow)=>{setEditId(r.id);setName(r.title);setBody(r.body);setDay(r.day||1);window.scrollTo({top:0,behavior:'smooth'})};
 return <div className="page"><PageHero title={title} summary={summary} image={image}/>{syncMode==='local'&&<p className="syncnote" role="status">⚠️ 未登录本地模式：所有改动只在本次打开期间有效；登录后可云端同步。</p>}{syncMode==='cloud'&&<p className="syncnote ok" role="status">✓ 已登录：记录云端同步，两个账号共享同一份数据。</p>}<section className="records-layout"><form className="recordform" onSubmit={e=>{e.preventDefault();add()}}><span className="formeyebrow">PERSONAL WORKSPACE</span><h2>{editId?'编辑记录':'新增记录'}</h2><label>标题<input aria-label={`${title}标题`} value={name} onChange={e=>setName(e.target.value)} placeholder={kind==='booking'?'例如：曼谷文华东方':kind==='packing'?'例如：护照与签证副本':'写下这段旅程'}/></label>{(kind==='note'||kind==='journal')&&<label>关联日期<select aria-label="关联行程日期" value={day} onChange={e=>setDay(Number(e.target.value))}>{days.map(d=><option value={d.day} key={d.day}>Day {d.day} · {d.city}</option>)}</select></label>}<label>详情<textarea aria-label={`${title}详情`} value={body} onChange={e=>setBody(e.target.value)} placeholder="确认号、时间、地址、想法或补充说明"/></label><div><button className="primary" type="submit" disabled={save.isPending}>{save.isPending?'保存中…':editId?'保存修改':'保存'}</button>{editId&&<button className="secondary" type="button" onClick={reset}>取消</button>}</div></form>{kind==='packing'&&<section className="suggestions"><h2>热带海岛清单建议</h2>{['护照与签证副本','轻薄雨衣','SPF50防晒','防蚊用品','海岛防水袋','全球转换插头','常用药与处方证明'].map(x=><button key={x} onClick={()=>save.mutate({kind:'packing',title:x,body:'建议清单',day:null,done:false})}>＋ {x}</button>)}</section>}<section className="records"><h2>{title}</h2>{q.isPending?<p>正在读取…</p>:rows.length===0?<p className="empty">还没有内容。先在上面添加一条。</p>:<>{recordPager.visible.map(r=><article key={r.id} className={r.done?'done':''}><button className="check" aria-label={`${r.done?'取消完成':'标记完成'}${r.title}`} onClick={()=>toggle(r)}>{r.done?'✓':'○'}</button><div><h3>{r.title}</h3><AuthorName userId={r.userId}/>{r.day&&<span>Day {r.day}</span>}<p>{r.body||'—'}</p></div><span className="recordops"><button className="editrecord" aria-label={`编辑${r.title}`} onClick={()=>beginEdit(r)}>编辑</button><button className="delete" aria-label={`删除${r.title}`} onClick={()=>del.mutate({id:r.id})}>删除</button></span></article>)}{recordPager.toggle}</>}</section></section></div>
}

export function GuideApp({initialTab='酒店',hideChrome=false}:{initialTab?:Tab;hideChrome?:boolean}){
 const [tab,setTab]=useState<Tab>(initialTab);
 const [bookingPreset,setBookingPreset]=useState<BookingPreset|null>(null);
 const onBook:OnBook=(p)=>setBookingPreset(p);
 const content=useMemo(()=>{if(tab==='航班')return <Flights onBook={onBook}/>;if(tab==='交通')return <Transport/>;if(tab==='酒店')return <HotelCatalog onBook={onBook}/>;if(tab==='餐厅')return <RestaurantCatalog onBook={onBook}/>;if(tab==='景点')return <AttractionGuide standalone onBook={onBook}/>;if(tab==='实用信息')return <SectionErrorBoundary label="实用信息"><Practical onBook={onBook}/></SectionErrorBoundary>;if(tab==='信息来源搜索状态')return <ResearchProgressPage/>;if(tab==='我的预订')return <RecordsPage kind="booking" title="我的预订" summary="集中保存酒店、餐厅、航班、门票与确认号。" image={singaporeImg}/>;return <RecordsPage kind="journal" title="旅行游记" summary="按 Day 1—20 写下当天见闻、餐桌和照片线索。" image={penangImg}/>},[tab]);
 const go=(t:Tab)=>{setTab(t);window.scrollTo({top:0,behavior:'auto'})};
 return <div className="app"><SafeAreaTopScrim backgroundColor="var(--surface)"/>{!hideChrome&&<div className="migration-notice" role="note">⚠️ 数据更新中：本页为旧版攻略站整体迁移（研究快照 2026-09-12）；小红书严格实读与 189 项详情重做完成后会替换更新。</div>}{!hideChrome&&<nav className="mainnav" aria-label="攻略章节">{tabs.map(t=><button key={t} className={tab===t?'active':''} aria-current={tab===t?'page':undefined} onClick={()=>go(t)}><NavIcon tab={t}/><span>{t}</span></button>)}</nav>}<main>{content}</main>{!hideChrome&&<footer><strong>13天 · 2国 · 4城</strong><p>固定研究快照：2026-09-12。开放时间、价格、签证、航班与房态请在出发前向官方渠道复核。</p></footer>}<BookingDialog open={!!bookingPreset} preset={bookingPreset} onClose={()=>setBookingPreset(null)}/></div>
}
