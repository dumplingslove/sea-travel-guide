import { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createPortal } from 'react-dom';
// space-sdk 在 GitHub Pages 新站不可用：顶部署名条由新站全局 Header 承担，此处 stub 为空，保持视觉一致。
function SafeAreaTopScrim(_props: { backgroundColor?: string }) { return null; }
import { listRecords, saveRecord, deleteRecord, getResearchStatus, recordSyncMode, type GuideRecord } from './records';
import { attractions, cities, days, hotelCityChecks, hotels, restaurants, shopping, type HotelGroup, type Item } from './data';
import { dayMaps, overviewMap } from './maps';
import { getGuideFacts, getXhsAssessment, guideFactsCount, strictResearchLinkCount, secondaryEvidence, xhsEvidence } from './research';
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

type Tab='行程'|'航班'|'交通'|'酒店'|'餐厅'|'实用信息'|'打包清单'|'我的预订'|'游记'|'信息来源搜索状态';
export type GuideTab=Tab;
type RecordKind='booking'|'note'|'packing'|'journal';
type RecordRow=GuideRecord;

const tabs:Tab[]=['行程','航班','交通','酒店','餐厅','实用信息','信息来源搜索状态','打包清单','我的预订','游记'];
const accents:Record<string,string>={'曼谷':'#0c7890','清迈':'#a66c25','普吉':'#18877f','槟城':'#ad5833','吉隆坡':'#405d82','胡志明市':'#a0443d','富国岛':'#287a6d','新加坡':'#a83748'};
const cityImages:Record<string,string>={'曼谷':bangkokImg,'清迈':chiangmaiImg,'普吉':phuketImg,'槟城':penangImg,'吉隆坡':klImg,'胡志明市':hcmImg,'富国岛':phuquocImg,'新加坡':singaporeImg};
const route:[string,string,string][]=[['曼谷','3天','12/12–14'],['清迈','2天','12/15–16'],['普吉','3天','12/17–19'],['槟城','2天','12/20–21'],['吉隆坡','2天','12/22–23'],['胡志明市','2天','12/24–25'],['富国岛','3天','12/26–28'],['新加坡','3天','12/29–31']];
/** 预订入口回调：各 tab 的卡片/详情弹窗点“预订”时打开 BookingDialog */
type OnBook=(p:BookingPreset)=>void;
/** 按城市推算建议入住/退房日期（2026-12），预填进酒店预订表单 */
function cityStayRange(city:string):{date?:string;dateEnd?:string}{
 const r=route.find(x=>x[0]===city)?.[2];
 const m=r?.match(/(\d+)\/(\d+)[–-](\d+)/);
 if(!m)return {};
 const p=(n:string|number)=>String(n).padStart(2,'0');
 const mo=p(m[1]);
 return {date:`2026-${mo}-${p(m[2])}`,dateEnd:`2026-${mo}-${p(Number(m[3])+1)}`};
}
/** 9 个航段对应的建议出发日期与行程天数 */
const legDateDay:[string,number][]=[['2026-12-12',1],['2026-12-15',4],['2026-12-17',6],['2026-12-20',9],['2026-12-22',11],['2026-12-24',13],['2026-12-26',15],['2026-12-29',18],['2026-12-31',20]];
const mapLink=(name:string,city:string)=>`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name}, ${city}`)}`;

const navPaths:Record<Tab,React.ReactNode>={
 '行程':<><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M8 2v4M16 2v4M5 9h14M9 13h2M13 13h2M9 17h2"/></>,
 '航班':<><path d="M22 2 9 15M15 4l5 5M4 9l5 1 5-5M3 21l4-4M14 14l1 6 5-5"/></>,
 '交通':<><rect x="6" y="3" width="12" height="17" rx="3"/><path d="M6 13h12M9 7h2M13 7h2M8 20v2M16 20v2M9 16h.01M15 16h.01"/></>,
 '酒店':<><path d="M4 21V6h8v15M12 10h8v11M2 21h20M7 9h2M7 13h2M7 17h2M15 13h2M15 17h2"/></>,
 '餐厅':<><path d="M7 2v8M4 2v5a3 3 0 0 0 6 0V2M7 10v12M16 2v20M16 2c3 2 4 5 4 9h-4"/></>,
 '实用信息':<><circle cx="12" cy="12" r="9"/><path d="M12 10v6M12 7h.01"/></>,
 '信息来源搜索状态':<><path d="M4 19V9M10 19V5M16 19v-8M22 19V3"/><path d="M2 21h22M3 6l6-3 6 5 7-6"/></>,
 '打包清单':<><rect x="6" y="6" width="12" height="15" rx="2"/><path d="M9 6V4a3 3 0 0 1 6 0v2M6 11h12M4 9v8M20 9v8"/></>,
 '我的预订':<><path d="M6 3h12v18l-6-4-6 4z"/><path d="m9 10 2 2 4-4"/></>,
 '游记':<><path d="M3 5a4 4 0 0 1 4-2h5v18H7a4 4 0 0 0-4 2zM21 5a4 4 0 0 0-4-2h-5v18h5a4 4 0 0 1 4 2z"/></>
};
function NavIcon({tab}:{tab:Tab}){return <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{navPaths[tab]}</svg>}

function MapViewer({src,title,onClose}:{src:string;title:string;onClose:()=>void}){
 const [scale,setScale]=useState(1); const [pos,setPos]=useState({x:0,y:0}); const drag=useRef<{x:number;y:number;px:number;py:number}|null>(null); const pointers=useRef(new Map<number,{x:number;y:number}>()); const pinch=useRef(0);
 useEffect(()=>{const previous=document.body.style.overflow;document.body.style.overflow='hidden';const f=(e:KeyboardEvent)=>{if(e.key==='Escape')onClose();if(e.key==='+'||e.key==='=')setScale(v=>Math.min(5,v*1.25));if(e.key==='-')setScale(v=>Math.max(1,v/1.25));};window.addEventListener('keydown',f);return()=>{window.removeEventListener('keydown',f);document.body.style.overflow=previous}},[onClose]);
 const down=(e:React.PointerEvent)=>{e.currentTarget.setPointerCapture(e.pointerId);pointers.current.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pointers.current.size===1)drag.current={x:e.clientX,y:e.clientY,px:pos.x,py:pos.y};if(pointers.current.size===2){const p=[...pointers.current.values()];pinch.current=Math.hypot(p[0]!.x-p[1]!.x,p[0]!.y-p[1]!.y)}};
 const move=(e:React.PointerEvent)=>{if(!pointers.current.has(e.pointerId))return;pointers.current.set(e.pointerId,{x:e.clientX,y:e.clientY});const p=[...pointers.current.values()];if(p.length===2){const d=Math.hypot(p[0]!.x-p[1]!.x,p[0]!.y-p[1]!.y);if(pinch.current){setScale(v=>Math.min(5,Math.max(1,v*d/pinch.current)));pinch.current=d}}else if(drag.current&&scale>1)setPos({x:drag.current.px+e.clientX-drag.current.x,y:drag.current.py+e.clientY-drag.current.y})};
 const up=(e:React.PointerEvent)=>{pointers.current.delete(e.pointerId);drag.current=null;pinch.current=0};
 const zoom=(n:number)=>{setScale(v=>{const x=Math.min(5,Math.max(1,v*n));if(x===1)setPos({x:0,y:0});return x})};
 return <div className="viewer" role="dialog" aria-modal="true" aria-label={`${title} 全屏地图查看器`}><div className="viewerbar"><strong>{title}</strong><div><button aria-label="缩小地图" onClick={()=>zoom(.8)}>−</button><span>{Math.round(scale*100)}%</span><button aria-label="放大地图" onClick={()=>zoom(1.25)}>+</button><button aria-label="关闭全屏地图" onClick={onClose}>×</button></div></div><div className="viewport" onWheel={e=>{e.preventDefault();zoom(e.deltaY<0?1.12:.89)}} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onDoubleClick={()=>scale===1?setScale(2.5):(setScale(1),setPos({x:0,y:0}))}><img src={src} alt={title} draggable={false} style={{transform:`translate(${pos.x}px,${pos.y}px) scale(${scale})`}}/><p>双指、滚轮或按钮缩放 · 放大后拖动平移</p></div></div>;
}
type MapLoadState='queued'|'loading'|'retrying'|'ready'|'error';
type MapLoadJob={url:string;signal:AbortSignal;resolve:(blob:Blob)=>void;reject:(error:Error)=>void;started:boolean};
type MapRenderWait={url:string;timer:number;resolve:()=>void;reject:(error:Error)=>void};
const MAP_LOAD_TIMEOUT_MS=9000;
const MAP_LOAD_MAX_CONCURRENCY=2;
const MAP_LOAD_AUTO_RETRIES=2;
let mapLoadsActive=0;
const mapLoadQueue:MapLoadJob[]=[];

function mapAbortError(){return new DOMException('Map load cancelled','AbortError')}
async function fetchMapBlob(url:string,signal:AbortSignal){
 const request=new AbortController();let timedOut=false;
 const abort=()=>request.abort();
 const timer=window.setTimeout(()=>{timedOut=true;request.abort()},MAP_LOAD_TIMEOUT_MS);
 signal.addEventListener('abort',abort,{once:true});
 try{
  const response=await fetch(url,{cache:'no-store',signal:request.signal});
  if(!response.ok)throw new Error(`Map request failed (${response.status})`);
  const blob=await response.blob();
  if(blob.size<1)throw new Error('Map image is empty');
  return blob;
 }catch(error){
  if(signal.aborted)throw mapAbortError();
  if(timedOut)throw new Error('Map load timed out');
  throw error instanceof Error?error:new Error('Map request failed');
 }finally{
  clearTimeout(timer);signal.removeEventListener('abort',abort);
 }
}
function pumpMapLoadQueue(){
 while(mapLoadsActive<MAP_LOAD_MAX_CONCURRENCY&&mapLoadQueue.length){
  const job=mapLoadQueue.shift()!;
  if(job.signal.aborted){job.reject(mapAbortError());continue}
  job.started=true;mapLoadsActive+=1;
  fetchMapBlob(job.url,job.signal).then(job.resolve,job.reject).finally(()=>{mapLoadsActive-=1;pumpMapLoadQueue()});
 }
}
function enqueueMapLoad(url:string,signal:AbortSignal){
 return new Promise<Blob>((resolve,reject)=>{
  const job:MapLoadJob={url,signal,resolve,reject,started:false};
  const abortQueued=()=>{if(job.started)return;const index=mapLoadQueue.indexOf(job);if(index>=0)mapLoadQueue.splice(index,1);reject(mapAbortError())};
  signal.addEventListener('abort',abortQueued,{once:true});
  mapLoadQueue.push(job);pumpMapLoadQueue();
 });
}
function wait(ms:number,signal:AbortSignal){
 return new Promise<void>((resolve,reject)=>{
  const finish=(error?:Error)=>{clearTimeout(timer);signal.removeEventListener('abort',abort);error?reject(error):resolve()};
  const abort=()=>finish(mapAbortError());
  const timer=window.setTimeout(()=>finish(),ms);
  signal.addEventListener('abort',abort,{once:true});
 });
}

function MapCard({src,title,overview=false}:{src:string;title:string;overview?:boolean}){
 const [open,setOpen]=useState(false);const [state,setState]=useState<MapLoadState>('queued');const [cycle,setCycle]=useState(0);const [displayUrl,setDisplayUrl]=useState('');const objectUrl=useRef('');const renderWait=useRef<MapRenderWait|null>(null);
 useEffect(()=>{
  const controller=new AbortController();let live=true;
  const releaseObjectUrl=()=>{if(objectUrl.current){URL.revokeObjectURL(objectUrl.current);objectUrl.current=''}};
  const cancelRenderWait=(error:Error)=>{const pending=renderWait.current;if(!pending)return;renderWait.current=null;clearTimeout(pending.timer);pending.reject(error)};
  const waitForVisibleImage=(url:string)=>new Promise<void>((resolve,reject)=>{
   const finish=(error?:Error)=>{const pending=renderWait.current;if(!pending||pending.url!==url)return;renderWait.current=null;clearTimeout(pending.timer);error?reject(error):resolve()};
   const timer=window.setTimeout(()=>finish(new Error('Map render timed out')),MAP_LOAD_TIMEOUT_MS);
   renderWait.current={url,timer,resolve:()=>finish(),reject:error=>finish(error)};
   setDisplayUrl(url);
  });
  const run=async()=>{
   setDisplayUrl('');releaseObjectUrl();
   for(let attempt=0;attempt<=MAP_LOAD_AUTO_RETRIES;attempt+=1){
    if(!live)return;
    setState(attempt===0?'queued':'retrying');
    try{
     const blob=await enqueueMapLoad(src,controller.signal);
     if(!live)return;
     releaseObjectUrl();
     const url=URL.createObjectURL(blob);objectUrl.current=url;
     setState(attempt===0?'loading':'retrying');
     await waitForVisibleImage(url);
     if(!live)return;
     setState('ready');return;
    }catch{
     if(!live||controller.signal.aborted)return;
     releaseObjectUrl();setDisplayUrl('');
     if(attempt<MAP_LOAD_AUTO_RETRIES)await wait(500*(attempt+1),controller.signal);
    }
   }
   if(live)setState('error');
  };
  void run();
  return()=>{live=false;controller.abort();cancelRenderWait(mapAbortError());releaseObjectUrl()};
 },[cycle,src]);
 const finishVisibleImage=(error?:Error)=>{const pending=renderWait.current;if(!pending||pending.url!==displayUrl)return;error?pending.reject(error):pending.resolve()};
 const retry=()=>{setOpen(false);setCycle(value=>value+1)};
 const status=state==='ready'?'已载入':state==='error'?'载入失败':state==='retrying'?'正在重试':'载入中';
 const message=state==='error'?'地图未能载入':state==='retrying'?'正在自动重试本地地图…':'正在载入本地地图…';
 return <><section className={`mapcard ${overview?'overviewmap':''}`} data-map-title={title} data-map-state={state}><div className="maphead"><span className="mapicon" aria-hidden="true">⌖</span><div><h3>{title}</h3><p>{overview?'曼谷 → 清迈 → 普吉 → 槟城 → 吉隆坡 → 胡志明市 → 富国岛 → 新加坡':'按当天动线编号标注'}</p></div><strong className={`mapstatus ${state}`} role="status">{status}</strong></div><button className={`mapimage ${state}`} aria-label={state==='ready'?`全屏查看并缩放${title}`:`${title}${state==='error'?'载入失败':'正在载入'}`} onClick={()=>state==='ready'&&setOpen(true)} disabled={state!=='ready'}>{displayUrl&&<img key={displayUrl} src={displayUrl} alt={`${title}，标有行程顺序与中文图例`} decoding="async" onLoad={event=>{const image=event.currentTarget;finishVisibleImage(image.naturalWidth>0&&image.naturalHeight>0?undefined:new Error('Map image is empty'))}} onError={()=>finishVisibleImage(new Error('Map render failed'))}/>} {state!=='ready'&&<span className={`mapmessage ${state==='error'?'error':''}`}>{message}</span>}{state==='ready'&&<span>全屏查看</span>}</button>{state==='error'&&<div className="mapretry"><p>9 秒内未完成载入；已自动重试 2 次。</p><button onClick={retry}>重新载入</button></div>}<div className="mapfoot"><b>静态标注图</b><span>图片已打包在站内 · 支持缩放与拖动</span><a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">© OpenStreetMap contributors</a></div></section>{open&&state==='ready'&&createPortal(<MapViewer src={displayUrl} title={title} onClose={()=>setOpen(false)}/>,document.body)}</>
}
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

function ItemMedia({item,kind,index}:{item:Item;kind:'酒店'|'餐厅'|'景点';index:number}){const gallery=getPlaceGallery(kind,item);const image=gallery[0]?.src;return <div className={`itemmedia ${image?'has-photo':'no-photo'}`}>{image?<img src={image} alt={`${item.name}候选图片`} loading="lazy"/>:<span aria-hidden="true">{item.name.slice(0,1)}</span>}<b style={{background:accents[item.city]}}>{String(index+1).padStart(2,'0')}</b>{gallery.length>=5&&<em>{gallery.length} 张图片</em>}</div>}

const operationalNotices:Record<string,{title:string;body:string}>={
 'PRU':{title:'营业状态异常',body:'Google Maps 在 2026-09-13 研究快照中显示“Temporarily closed”。不要按原计划直接前往；订位或出发前先向餐厅确认是否恢复营业。'},
 'Roti Taew Nam':{title:'营业状态异常',body:'Google Maps 在 2026-09-13 研究快照中显示“Temporarily closed”。不要按原计划直接前往；出发前先核对官方页面或电话确认。'}
};

function Detail({item,kind,onClose,onBook}:{item:Item;kind:'酒店'|'餐厅'|'景点';onClose:()=>void;onBook?:OnBook}){
 const hotelEntries=useHotelEntries(); const chain=kind==='酒店'?findHotelChain(hotelEntries,item.name,item.city):''; const tier=kind==='酒店'?findHotelTier(hotelEntries,item.name,item.city):'';
 const facts=getGuideFacts(item,kind); const evidence=xhsEvidence[item.name]||[]; const evPager=usePaged(evidence,6,'条链接'); const gallery=getPlaceGallery(kind,item); const image=gallery[0]?.src; const a=getXhsAssessment(item); const operationalNotice=operationalNotices[item.name];
 const checklist=kind==='酒店'?['确认具体房型、景观、加床与早餐条款','比较含税总价、取消政策与旺季预付要求','把机场或码头接送写入预订备注']:kind==='餐厅'?['确认套餐、税费、服务费与饮食限制','按官方放位规则订位，不把walk-in个例当常态','若评价两极，先看近期菜单再决定']:['复核当日开放、门票、着装与临时关闭','按天气准备室内替代，不把船班或户外项目排死','下载离线地图，提前确认最后一段交通'];
 return <div className="modalback" onMouseDown={e=>{if(e.target===e.currentTarget)onClose()}}><article className="detail" role="dialog" aria-modal="true" aria-label={`${item.name}详情`}><button className="close" aria-label="关闭详情" onClick={onClose}>×</button><div className={`detailhero ${image?'with-photo':'editorial'}`} style={image?undefined:{background:accents[item.city]}}>{image&&<img src={image} alt={`${item.name}候选图片`}/>}<div/><section><p>{item.city} · {kind}完整攻略</p><h2>{item.name}</h2><span>{item.meta}</span></section></div>{operationalNotice&&<aside className="operational-alert" role="status"><strong>{operationalNotice.title}</strong><p>{operationalNotice.body}</p></aside>}{kind==='酒店'&&<section className="hotelidentity"><span className="hotel-badges"><HotelChainBadge chain={chain}/><HotelTierBadge tier={tier}/></span><div><strong>{item.brand||'独立或其他酒店集团'}</strong><span>{item.loyaltyProgram||'不适用'}</span></div>{item.officialUrl?<a href={item.officialUrl} target="_blank" rel="noreferrer">官方酒店页 ↗</a>:<small>当前候选卡未绑定集团官方页</small>}</section>}<div className="detailcontent"><PlaceGallery item={item} kind={kind}/><nav className="detailjump" id="detailtop" aria-label="详情目录"><a href="#decision">结论</a><a href="#facts">实用信息</a><a href="#xhs">小红书</a><a href="#sources">原帖</a></nav><section id="decision" className="detaillead"><span>EDITOR'S VERDICT</span><h3>{kind==='酒店'?'值不值得住':kind==='餐厅'?'值不值得订':'值不值得去'}</h3><p>{facts.action}</p></section><div id="facts" className="detailfactgrid"><article><span>位置 / 地址</span><b>{facts.address}</b></article><article><span>营业 / 开放</span><b>{facts.hours}</b></article><article><span>价格 / 门票</span><b>{facts.price}</b></article><article><span>建议节奏</span><b>{facts.schedule}</b></article></div><section className="detailsection detailmust"><h3>{kind==='酒店'?'入住重点':kind==='餐厅'?'必须点 / 用餐重点':'必看 / 必体验'}</h3><p>{item.detail} {item.best}</p></section><section className="detailsection"><h3>{kind==='酒店'?'住这里的核心理由':kind==='餐厅'?'体验重点与口碑判断':'亮点与游览方式'}</h3><p>{item.detail}</p></section><section className="detailsection"><h3>推荐理由</h3><p>{a?.why||item.best}</p></section><section className="detailsection warning"><h3>避雷与取舍</h3><p>{a?.avoidNote||facts.action}</p></section><section className="detailsection"><h3>怎么到 · 怎么串联</h3><p>{facts.transit}</p></section><section className="detailsection"><h3>{kind==='酒店'?'订房前确认':kind==='餐厅'?'订位与点单':'出发前确认'}</h3><ul>{checklist.map(x=><li key={x}>{x}</li>)}</ul></section><div id="xhs"><XhsPanel item={item}/></div><OtaReviewPanel item={item}/><SecondaryPanel item={item}/><section id="sources" className="evidence"><header><div><span>SOURCE LEDGER</span><h3>小红书原帖与核验记录</h3></div><b className={evidence.length?'verified':'pending'}>{facts.verification}</b></header>{evidence.length?<><div className="evidencelist">{evPager.visible.map((link,i)=><a key={link.url} href={link.url} target="_blank" rel="noreferrer"><em>{String(i+1).padStart(2,'0')}</em><span><strong>{link.title}</strong><small>{link.note}</small></span><i aria-hidden="true">↗</i></a>)}</div>{evPager.toggle}</>:<p className="evidenceempty">本条尚无可追溯的小红书逐帖链接。当前只呈现已完成的公开资料交叉核对，不补写帖子标题或链接。</p>}</section><a className="detailback" href="#detailtop">↑ 回到目录</a></div><div className="detailactions">{onBook&&<button className="primary" onClick={()=>onBook({bkind:kind==='酒店'?'hotel':kind==='餐厅'?'restaurant':'attraction',name:item.name,city:item.city,...cityStayRange(item.city)})}>{kind==='酒店'?'预订这家酒店':kind==='餐厅'?'预订 / 订位':'预订门票'}</button>}<a className={onBook?"secondary":"primary"} href={mapLink(item.name,item.city)} target="_blank" rel="noreferrer">在地图 App 中查看</a>{kind==='景点'&&<FavButton name={item.name} city={item.city}/>}<button className="secondary" onClick={onClose}>返回列表</button></div></article></div>
}

function CityTabs({city,setCity,label}:{city:string;setCity:(x:string)=>void;label:string}){return <div className="citytabs" aria-label={label}>{cities.map(c=><button key={c} className={city===c?'active':''} onClick={()=>setCity(c)}>{c}</button>)}</div>}

function HotelGroupBadge({group}:{group?:HotelGroup}){const label=group==='Marriott'?'Marriott · 万豪系':group==='Hyatt'?'Hyatt · 凯悦系':'其他集团';return <span className={`hotelgroup ${(group||'Other').toLowerCase()}`}>{label}</span>}

function HotelGroupMatrix(){return <section className="hotelmatrix" aria-label="八城万豪与凯悦最高端在营酒店核验"><header><div><span>OFFICIAL HOTEL CHECK · 2026-09-13</span><h2>每站 Marriott / Hyatt 顶级选择</h2><p>按官方在营状态与集团品牌层级筛选，不拿异地酒店补空缺；“未找到”不是永久不存在，入住前仍需复核。点击城市展开查看。</p></div><div className="matrixlegend"><HotelGroupBadge group="Marriott"/><HotelGroupBadge group="Hyatt"/></div></header><div className="matrixfolds">{hotelCityChecks.map((row,i)=><Fold key={row.city} className="matrixfold" eyebrow={`核验 ${row.checked}`} title={row.city} meta={`住宿 ${row.dates}`} defaultOpen={i===0}><div className="matrixchoices">{row.choices.map(choice=><section key={choice.group} className={`${choice.group.toLowerCase()} ${choice.status}`}><HotelGroupBadge group={choice.group}/>{choice.hotel?<><h3>{choice.hotel}</h3><b>{choice.brand} · {choice.loyaltyProgram}</b></>:<><h3>{choice.status==='coming-soon'?'没有在营选择':'截至核验日未找到'}</h3><b>{choice.brand||choice.loyaltyProgram}</b></>}<p>{choice.note}</p><a href={choice.officialUrl} target="_blank" rel="noreferrer">查看官方依据 ↗</a></section>)}</div></Fold>)}</div></section>}

function HotelCatalog({onBook}:{onBook?:OnBook}){
 const hotelEntries=useHotelEntries();const chainFor=(item:Item)=>findHotelChain(hotelEntries,item.name,item.city);const tierFor=(item:Item)=>findHotelTier(hotelEntries,item.name,item.city);
 const [city,setCity]=useState(cities[0]!);const [chosen,setChosen]=useState<Item|null>(null);const [compare,setCompare]=useState<Item[]>([]);const shown=orderHotelsByResearch(hotels.filter(x=>x.city===city),hotelEntries,city);const dates=route.find(x=>x[0]===city)?.[2];
 const toggle=(it:Item)=>setCompare(x=>x.some(y=>y.name===it.name)?x.filter(y=>y.name!==it.name):x.length<3?[...x,it]:x);
 const hotelPager=usePaged(shown,4,'家酒店');
 return <div className="page"><PageHero eyebrow="STAY COLLECTION" title="酒店推荐" summary="沿八城路线比较位置、风格、硬件与明确短板；先看取舍，再决定住哪一家。" image={singaporeImg}/><HotelGroupMatrix/><section className="sectionblock"><div className="sectiontitle"><h2>按城市浏览</h2><p>{hotels.length} 家候选 · 最多选择 3 家并排比较</p></div><CityTabs city={city} setCity={setCity} label="酒店城市筛选"/><div className="citycover"><img src={cityImages[city]} alt={`${city}城市实景`}/><div><span>建议住宿日期 {dates}</span><h3>{city}</h3><p>{shown.length} 家酒店候选</p></div></div>{compare.length>0&&<section className="comparepanel"><header><h3>酒店对比 <span>{compare.length}/3</span></h3><button onClick={()=>setCompare([])}>清空</button></header><div>{compare.map(x=><article key={x.name}><HotelBadges chain={chainFor(x)} tier={tierFor(x)}/><b>{x.name}</b><span>{x.meta}</span><p>{x.best}</p><button onClick={()=>setChosen(x)}>查看详情</button></article>)}</div></section>}<div className="catalog rich">{hotelPager.visible.map((it,i)=><article className="itemcard" key={it.name}><ItemMedia item={it} kind="酒店" index={i}/><div><HotelBadges chain={chainFor(it)} tier={tierFor(it)}/><span className="citytag">{it.city} · 住宿</span><h3>{it.name}</h3><p className="meta">{it.meta}</p><p>{it.detail}</p><div className="decision"><b>怎么选</b><span>{it.best}</span></div><XhsMini item={it}/><div className="cardactions"><button className="solid" onClick={()=>setChosen(it)}>查看完整攻略</button>{onBook&&<button onClick={()=>onBook({bkind:'hotel',name:it.name,city:it.city,...cityStayRange(it.city)})}>预订</button>}<button className={compare.some(x=>x.name===it.name)?'selected':''} disabled={!compare.some(x=>x.name===it.name)&&compare.length>=3} onClick={()=>toggle(it)}>{compare.some(x=>x.name===it.name)?'✓ 已加入对比':'＋ 加入对比'}</button></div></div></article>)}</div>{hotelPager.toggle}</section><ResearchStatus/>{chosen&&<Detail item={chosen} kind="酒店" onClose={()=>setChosen(null)} onBook={onBook}/>}</div>
}

function RestaurantCatalog({onBook}:{onBook?:OnBook}){
 const [view,setView]=useState<'每日用餐计划'|'按城市浏览'>('每日用餐计划');const [city,setCity]=useState(cities[0]!);const [chosen,setChosen]=useState<Item|null>(null);const shown=restaurants.filter(x=>x.city===city);const cityDays=days.filter(d=>d.city===city);
 const restPager=usePaged(shown,6,'个餐饮选择');
 return <div className="page"><PageHero eyebrow="DINING PLAN" title="餐厅预订决策指南" summary="把每日吃什么、必须提前订的餐桌、街头小吃与风险提醒放进同一套决策流程。" image={bangkokImg}/><div className="viewtoggle" role="tablist"><button className={view==='每日用餐计划'?'active':''} onClick={()=>setView('每日用餐计划')}>每日用餐计划</button><button className={view==='按城市浏览'?'active':''} onClick={()=>setView('按城市浏览')}>按城市浏览</button></div>{view==='每日用餐计划'?<section className="sectionblock mealplan"><div className="sectiontitle"><h2>20 天用餐路线</h2><p>按城市展开，查看每天的用餐组合与取舍</p></div>{route.map(([c],ci)=>{const cDays=days.filter(d=>d.city===c);return <Fold key={c} eyebrow={route.find(x=>x[0]===c)?.[2]} title={c} meta={`${cDays.length} 天用餐安排 · 点击展开`} image={cityImages[c]} defaultOpen={ci===0}><div className="mealdaylist">{cDays.map(d=><article key={d.day}><b>Day {d.day}</b><div><h4>{d.title}</h4><p>{d.food}</p></div><button onClick={()=>{setCity(c);setView('按城市浏览')}}>查看 {c} 餐厅</button></article>)}</div></Fold>})}</section>:<section className="sectionblock"><div className="sectiontitle"><h2>按城市浏览</h2><p>{restaurants.length} 个餐饮选择 · 星级餐厅、老店与街头小吃分开判断</p></div><CityTabs city={city} setCity={setCity} label="餐厅城市筛选"/><div className="bookingbrief"><strong>{city} · {cityDays.length}天</strong><p>{cityDays.map(d=>d.food).join(' ')}</p></div><div className="catalog rich">{restPager.visible.map((it,i)=><article className="itemcard" key={it.name}><ItemMedia item={it} kind="餐厅" index={i}/><div><span className="citytag">{it.city} · 餐饮</span><h3>{it.name}</h3><p className="meta">{it.meta}</p><p>{it.detail}</p><div className="decision"><b>订位 / 点单</b><span>{it.best}</span></div><XhsMini item={it}/><div className="cardactions"><button className="solid" onClick={()=>setChosen(it)}>查看完整攻略</button>{onBook&&<button onClick={()=>onBook({bkind:'restaurant',name:it.name,city:it.city})}>预订 / 订位</button>}<a href={mapLink(it.name,it.city)} target="_blank" rel="noreferrer">地图 App</a></div></div></article>)}</div>{restPager.toggle}</section>}<ResearchStatus/>{chosen&&<Detail item={chosen} kind="餐厅" onClose={()=>setChosen(null)} onBook={onBook}/>}</div>
}

type CatalogMatch={item:Item;kind:'酒店'|'餐厅'|'景点'};
const catalogEntries:CatalogMatch[]=[
 ...attractions.map(item=>({item,kind:'景点' as const})),
 ...restaurants.map(item=>({item,kind:'餐厅' as const})),
 ...hotels.map(item=>({item,kind:'酒店' as const}))
];
const stopAliases:Record<string,string>={
 '卧佛寺':'卧佛寺 Wat Pho',
 '大皇宫与玉佛寺':'大皇宫与玉佛寺',
 '郑王庙':'郑王庙 Wat Arun',
 '双龙寺':'双龙寺',
 '新加坡植物园':'新加坡植物园'
};
function normalizedPlaceName(value:string){return value.toLowerCase().replace(/\([^)]*\)|（[^）]*）/g,'').replace(/wat|temple|hotel|resort|restaurant|the|bangkok|singapore|chiang mai|kuala lumpur|phu quoc/gi,'').replace(/入住|退房|午餐|晚餐|早餐|抵达|前往|游览|散步|日落|夜景|自由活动|拍照|参观|探索/g,'').replace(/[^\p{L}\p{N}]/gu,'')}
function findCatalogMatch(stopName:string,city:string):CatalogMatch|null{
 const alias=Object.entries(stopAliases).find(([key])=>stopName.includes(key))?.[1];
 if(alias){const exact=catalogEntries.find(x=>x.item.city===city&&x.item.name===alias);if(exact)return exact}
 const stop=normalizedPlaceName(stopName);if(stop.length<2)return null;
 const candidates=catalogEntries.filter(x=>x.item.city===city).map(entry=>{const name=normalizedPlaceName(entry.item.name);const direct=stop.includes(name)||name.includes(stop);const score=direct?Math.min(stop.length,name.length):0;return {entry,score}}).filter(x=>x.score>=2).sort((a,b)=>b.score-a.score);
 return candidates[0]?.entry||null;
}

function ItineraryHotelList({city,entries,onOpen}:{city:string;entries:ResearchHotelEntry[];onOpen:(match:CatalogMatch)=>void}){
 const options=orderHotelsByResearch(hotels.filter(item=>item.city===city),entries,city);
 return <Fold className="stayfold" eyebrow="STAY OPTIONS" title="本城酒店参考" meta={`${options.length} 家候选 · 点击展开查看`}>
  <div className="stayoptions">{options.map(item=>{const chain=findHotelChain(entries,item.name,item.city);const tier=findHotelTier(entries,item.name,item.city);return <button key={item.name} onClick={()=>onOpen({item,kind:'酒店'})} aria-label={`查看${item.name}酒店攻略`}><span><b>{item.name}</b><small>{item.meta}</small></span><HotelBadges chain={chain} tier={tier}/></button>})}</div>
 </Fold>
}

function Itinerary({onBook}:{onBook?:OnBook}){
 const chainEntries=useHotelEntries();
 const [open,setOpen]=useState(1);const [chosen,setChosen]=useState<CatalogMatch|null>(null);
 const goDay=(day:number)=>{setOpen(day);setTimeout(()=>document.getElementById(`day-${day}`)?.scrollIntoView({behavior:'smooth',block:'start'}),0)};
 const currentDay=days.find(d=>d.day===open)||days[0]!;
 return <div className="itinerary"><div className="daystrip" aria-label="20天日期导航">{days.map(d=><button key={d.day} className={open===d.day?'active':''} onClick={()=>goDay(d.day)}><b>D{d.day}</b><span>{d.date.match(/12月(\d+)日/)?.[1]}</span></button>)}</div><div className="dayjump" aria-label="日期跳转"><button aria-label="上一天" disabled={open<=1} onClick={()=>goDay(Math.max(1,open-1))}>‹</button><label><span>日期跳转</span><select aria-label="选择行程日期" value={open} onChange={e=>goDay(Number(e.target.value))}>{days.map(d=><option value={d.day} key={d.day}>Day {d.day} · {d.date.replace('2026年','')} · {d.city}</option>)}</select><small>{currentDay.title}</small></label><button aria-label="下一天" disabled={open>=days.length} onClick={()=>goDay(Math.min(days.length,open+1))}>›</button></div><section className="hero"><img src={bangkokImg} alt="曼谷湄南河与城市天际线"/><div/><section><span className="heroeyebrow">4 COUNTRIES · 8 CITIES · 20 DAYS</span><h1>泰国 · 马来西亚<br/>越南 · 新加坡</h1><p>曼谷 · 清迈 · 普吉 · 槟城 · 吉隆坡 · 胡志明市 · 富国岛 · 新加坡</p><p className="herodate">2026年12月12日 — 12月31日</p><button onClick={()=>document.getElementById('route-overview')?.scrollIntoView({behavior:'smooth'})}>开始查看行程</button></section></section><section className="maincontent"><div id="route-overview"><MapCard src={overviewMap} title="20天路线总览" overview/></div><section className="routeband" aria-label="八城路线">{route.map((x,i)=><article key={x[0]}><span>{String(i+1).padStart(2,'0')}</span><b>{x[0]}</b><small>{x[1]} · {x[2]}</small></article>)}</section><section className="intro"><span>TRIP COMMAND CENTER</span><h2>四国八城，先把每天走顺</h2><p>每一天都按真实日期、城市动线、餐饮取舍和行前提醒组织。离线地图可点开放大；酒店、餐厅、打包、预订与游记各有独立工作区。串法已按 2026-09-15 小红书八城经典路线（每城 10 篇逐帖实读）的共识更新：住宿区、避坑点与高频必去项都写进了当天提醒。</p><div className="quickfacts"><article><b>20</b><span>天详细行程</span></article><article><b>8</b><span>座城市</span></article><article><b>{hotels.length}</b><span>家酒店</span></article><article><b>{restaurants.length}</b><span>个餐饮选择</span></article></div></section><section className="sectionblock"><div className="sectiontitle centered"><span>DAY BY DAY</span><h2>详细行程安排</h2><p>展开一天，查看城市图、时间线、用餐与关键提醒</p></div>{days.map(d=><article id={`day-${d.day}`} className={`day ${open===d.day?'open':''}`} key={d.day}><button className="daytitle" onClick={()=>setOpen(open===d.day?0:d.day)} aria-expanded={open===d.day}><div><span>Day {d.day}</span><b>{d.date}</b></div><h2>{d.city}</h2><p>{d.title}</p><strong>{open===d.day?'收起':'展开'}</strong></button>{open===d.day&&<div className="daybody"><div className="dayphoto"><img src={cityImages[d.city]} alt={`${d.city}城市氛围`}/><div><b>{d.city}</b><span>{d.date}</span></div></div><MapCard src={dayMaps[d.day-1]} title={`Day ${d.day} · ${d.city}路线图`}/><ItineraryHotelList city={d.city} entries={chainEntries} onOpen={setChosen}/><div className="timeline">{d.stops.map((s,i)=>{const next=d.stops[i+1];const hour=Number(s.time.split(':')[0]);const rhythm=hour<10?'早出避热 · 给交通留缓冲':hour<16?'正午补水 · 室内外穿插':hour<19?'黄金时段 · 提前确认入场': '晚间收尾 · 返程不再加点';const match=findCatalogMatch(s.name,d.city);const thumb=match?getPlaceGallery(match.kind,match.item)[0]?.src:undefined;return <div key={s.time+s.name}><time>{s.time}</time><i>{i+1}</i><section><h3>{s.name}</h3><p>{s.detail}</p><div className="stopmeta"><span>{rhythm}</span><span>{next?`下一站 ${next.time} · ${next.name}`:'当日最后一站 · 留出返程时间'}</span></div>{match&&<button className="stopdetail" onClick={()=>setChosen(match)} aria-label={`查看${match.item.name}完整攻略`}>{thumb?<img src={thumb} alt={`${match.item.name}候选图片缩略图`}/>:<span className="stopthumbfallback" aria-hidden="true">{match.item.name.slice(0,1)}</span>}<span>{match.kind==='酒店'&&<HotelBadges chain={findHotelChain(chainEntries,match.item.name,match.item.city)} tier={findHotelTier(chainEntries,match.item.name,match.item.city)}/>}<b>{match.item.name}</b><small>{match.kind}详情 · 地址、开放时间、价格、照片与口碑</small></span><strong>查看完整攻略</strong></button>}<a href={mapLink(s.name,d.city)} target="_blank" rel="noreferrer">在地图 App 中查看</a></section></div>})}</div><aside><section><span>DINING</span><h3>当天吃什么</h3><p>{d.food}</p></section><section><span>FIELD NOTE</span><h3>安排提醒</h3><p>{d.tip}</p></section></aside><Source>公开资料与旅行者反馈研究快照 · 2026-09-12</Source></div>}</article>)}</section><ResearchStatus/></section>{chosen&&<Detail item={chosen.item} kind={chosen.kind} onClose={()=>setChosen(null)} onBook={onBook}/>}</div>;
}

const legs=[['抵达曼谷','国际航班','抵达日仅排下午项目'],['曼谷 → 清迈','约1小时','建议上午直飞'],['清迈 → 普吉','约2小时','直飞，落地后只排海滩'],['普吉 → 槟城','经吉隆坡','避免过短中转'],['槟城 → 吉隆坡','约1小时','短途航班'],['吉隆坡 → 胡志明市','约2小时','越南需电子签'],['胡志明市 → 富国岛','约1小时','国内短途'],['富国岛 → 新加坡','经胡志明市','预留中转'],['新加坡 → 美国','长途航班','以实际航班为准']];
function Flights({onBook}:{onBook?:OnBook}){const legPager=usePaged(legs,5,'个航段');return <div className="page"><PageHero eyebrow="FLIGHT PLAN" title="航班信息" summary="九段移动按单向路线排布。未确认航班号、实时票价与库存不会被写成事实。" image={bangkokImg}/><section className="sectionblock"><div className="sectiontitle"><h2>航段总览</h2><p>出票后把航班号、时间与确认号存进“我的预订”</p></div><div className="flightsummary"><article><b>9</b><span>个航段</span></article><article><b>2</b><span>预计经停 / 中转</span></article><article><b>4</b><span>入境国家</span></article></div><div className="flightgrid">{legPager.visible.map(l=>{const i=legs.indexOf(l);const dd=legDateDay[i];return <article key={l[0]}><header><span>FLIGHT {String(i+1).padStart(2,'0')}</span><em>待预订</em></header><h3>{l[0]}</h3><strong>{l[1]}</strong><p>{l[2]}</p><dl><div><dt>出票前</dt><dd>核验日期与机场</dd></div><div><dt>出票后</dt><dd>保存航班号与确认号</dd></div></dl>{onBook&&<div className="cardactions"><button className="solid" onClick={()=>onBook({bkind:'transport',name:l[0],date:dd?.[0],day:dd?.[1]??null})}>记录预订</button></div>}</article>})}</div>{legPager.toggle}</section><section className="checklistband"><h2>每段都要核对</h2><div><span>航站楼</span><span>托运行李额</span><span>转机签证</span><span>最短衔接时间</span><span>末班接驳</span><span>取消与改签</span></div></section><Source>固定研究快照 · 2026-09-12；不含实时航班数据</Source></div>}

const cityMobility:Record<string,[string,string,string]>= {'曼谷':['BTS / MRT / 船','老城寺庙段用河船与步行衔接','高峰时段避开跨城打车'], '清迈':['步行 / Grab','古城寺庙步行，远郊项目单独包车','双龙寺山路预留往返'], '普吉':['接送车 / Grab','出海日以码头接送为主','跨海滩耗时比地图观感长'], '槟城':['步行 / Grab','乔治市核心区步行','升旗山与极乐寺打车串联'], '吉隆坡':['轨道 / Grab','KLCC与武吉免登轨道覆盖','雨天用商场连廊'], '胡志明市':['Grab / 步行','第一郡核心步行','过马路保持稳定速度'], '富国岛':['Grab / 酒店车','南北岛距离长，不频繁折返','出海日只排一条主线'], '新加坡':['MRT / 步行','主景点轨道覆盖','带娃时减少换乘']};
function Transport(){const [mcity,setMcity]=useState(cities[0]!);return <div className="page"><PageHero eyebrow="GROUND PLAN" title="交通指南" summary="跨城航段与八城落地方式分开看：先锁定主线，再为每个城市选择最低摩擦的移动组合。" image={klImg}/><section className="sectionblock"><div className="sectiontitle"><h2>跨城衔接</h2><p>所有时间均为行程规划参考，不代替出票信息</p></div><div className="transportlist">{legs.slice(1,-1).map((l,i)=><article key={l[0]}><span>{String(i+1).padStart(2,'0')}</span><div><h3>{l[0]}</h3><p>{l[1]}</p></div><b>{l[2]}</b></article>)}</div></section><section className="mobility"><div className="sectiontitle"><span>ON THE GROUND</span><h2>八城落地策略</h2><p>切换城市，一次只看一城的移动组合</p></div><CityTabs city={mcity} setCity={setMcity} label="交通城市切换"/><div className="mobilitysingle"><article key={mcity}><header style={{background:accents[mcity]}}><b>{mcity}</b><span>{cityMobility[mcity]?.[0]}</span></header><p>{cityMobility[mcity]?.[1]}</p><small>{cityMobility[mcity]?.[2]}</small></article></div></section><section className="darkpanel"><h2>交通底线</h2><div><article><h3>海岛出行</h3><p>船班受海况影响，贵重物品放防水袋，不把次日早班机排得过紧。</p></article><article><h3>机场衔接</h3><p>跨国航班与托运行李需要更长缓冲；出票后再固化当天时间线。</p></article><article><h3>网约车</h3><p>按 App 显示车牌核对，机场与码头上车点提前确认。</p></article><article><h3>步行日</h3><p>热带正午把室外长距离拆开，以室内馆、咖啡或酒店休息降温。</p></article></div></section></div>}

function Practical({onBook}:{onBook?:OnBook}){
 const [mode,setMode]=useState<'实用信息'|'景点指南'|'购物推荐'|'研究来源'>('实用信息');const [chosen,setChosen]=useState<Item|null>(null);const [city,setCity]=useState(cities[0]!);
 const info=[['签证','研究快照记录：中国护照赴泰国、马来西亚、新加坡免签；越南需提前办理电子签。政策可能变化，出发前向官方移民部门复核。'],['12月天气','泰国全境、马来西亚西海岸、越南南部多处于较干爽季节；新加坡12月多阵雨，准备轻薄雨衣与室内备选。'],['货币','THB / MYR / VND / SGD。信用卡为主、少量现金；参考汇率不等于实际成交价。'],['网络','落地前准备覆盖四国的eSIM，海岛出海日下载离线资料。'],['插头与电压','四国插座形态不完全相同，带一只带保险丝的全球转换插头与多口充电器。'],['健康','热带防晒、防蚊、补水；出海与长途飞行带常用药，处方药保留原包装。']];
 const shown=attractions.filter(x=>x.city===city);
 const attrPager=usePaged(shown,6,'个景点');
 return <div className="page"><PageHero eyebrow="FIELD GUIDE" title="实用信息" summary="签证、天气、货币、景点、购物与研究边界集中在一页，方便行前逐项收口。" image={hcmImg}/><div className="subtabs">{(['实用信息','景点指南','购物推荐','研究来源'] as const).map(x=><button key={x} className={mode===x?'active':''} onClick={()=>setMode(x)}>{x}</button>)}</div>{mode==='实用信息'&&<><section className="notice"><h2>出发前最后核验</h2><p>本攻略是 2026-09-12 的固定研究快照。开放时间、票价、签证、航班、天气停运、房态和预约规则请在出发前向官方渠道再次确认。</p></section><div className="infogrid">{info.map((x,i)=><article key={x[0]}><span>{String(i+1).padStart(2,'0')}</span><h2>{x[0]}</h2><p>{x[1]}</p></article>)}</div></>}{mode==='景点指南'&&<section className="sectionblock"><div className="sectiontitle"><h2>八城景点指南</h2><p>按城市筛选，打开详情查看游览重点与行前确认项</p></div><CityTabs city={city} setCity={setCity} label="景点城市筛选"/><div className="catalog rich">{attrPager.visible.map((it,i)=><article className="itemcard" key={it.city+it.name}><ItemMedia item={it} kind="景点" index={i}/><div><span className="citytag">{it.city} · 景点</span><h3>{it.name}</h3><p className="meta">{it.meta}</p><p>{it.detail}</p><div className="decision"><b>怎么安排</b><span>{it.best}</span></div><XhsMini item={it}/><button className="solid" onClick={()=>setChosen(it)}>查看完整攻略</button>{onBook&&<button className="solid" onClick={()=>onBook({bkind:'attraction',name:it.name,city:it.city})}>预订门票</button>}<FavButton name={it.name} city={it.city}/></div></article>)}</div>{attrPager.toggle}</section>}{mode==='购物推荐'&&<div className="shopfolds">{cities.map((c,i)=><Fold key={c} eyebrow={`第 ${i+1} 站`} title={c} image={cityImages[c]} defaultOpen={i===0}><p className="shoptext">{shopping[c as keyof typeof shopping]}</p></Fold>)}</div>}{mode==='研究来源'&&<><ResearchStatus/><section className="sourceguide"><h2>当前网站如何标注资料</h2><dl><div><dt>固定研究快照</dt><dd>表示内容截至 2026-09-12 整理，不代表出行时仍然有效。</dd></div><div><dt>行前复核</dt><dd>开放时间、价格、签证、航班、房态与天气相关项目都需要再次确认。</dd></div><div><dt>小红书链接</dt><dd>曼谷、清迈与普吉部分严格重做记录已导入详情页：只展示实际打开并阅读正文、可见滚动评论区的帖子。每项10篇的最终标准仍以页面显示的真实样本量为准。</dd></div></dl></section></>}{chosen&&<Detail item={chosen} kind="景点" onClose={()=>setChosen(null)} onBook={onBook}/>}</div>
}

/** 景点卡片一键收藏：写入 sea_guide_records（kind="favorite"），与顶级 /favorites 页同表互通。 */
function FavButton({name,city}:{name:string;city:string}){
  const [st,setSt]=useState<'idle'|'saving'|'done'>('idle');
  const onClick=async()=>{
    if(st!=='idle')return;setSt('saving');
    try{
      const {records}=await listRecords();
      if(!records.some(r=>r.kind==='favorite'&&r.title===name))
        await saveRecord({kind:'favorite',title:name,body:JSON.stringify({city,note:''}),day:null,done:false});
      setSt('done');
    }catch{setSt('idle');}
  };
  return <button className={st==='done'?'selected':''} onClick={onClick} disabled={st!=='idle'} aria-label={`收藏${name}`}>{st==='done'?'✓ 已收藏':st==='saving'?'保存中…':'＋ 收藏'}</button>;
}

function RecordsPage({kind,title,summary,image}:{kind:RecordKind;title:string;summary:string;image:string}){
 const qc=useQueryClient();const q=useQuery({queryKey:['records'],queryFn:()=>listRecords()});const save=useMutation({mutationFn:saveRecord,onSuccess:()=>qc.invalidateQueries({queryKey:['records']})});const del=useMutation({mutationFn:deleteRecord,onSuccess:()=>qc.invalidateQueries({queryKey:['records']})});const [editId,setEditId]=useState<number|undefined>();const [syncMode,setSyncMode]=useState<'cloud'|'local'|null>(null);useEffect(()=>{void recordSyncMode().then(setSyncMode)},[]);const [name,setName]=useState('');const [body,setBody]=useState('');const [day,setDay]=useState(1);const rows=(q.data?.records||[]).filter(r=>kind==='note'?r.kind==='note':r.kind===kind);const recordPager=usePaged(rows,8,'条记录');const reset=()=>{setEditId(undefined);setName('');setBody('');setDay(1)};const add=()=>{if(!name.trim())return;save.mutate({id:editId,kind,title:name.trim(),body,day:kind==='journal'||kind==='note'?day:null,done:editId?rows.find(r=>r.id===editId)?.done||false:false},{onSuccess:reset})};const toggle=(r:RecordRow)=>save.mutate({id:r.id,kind:r.kind,title:r.title,body:r.body,day:r.day,done:!r.done});const beginEdit=(r:RecordRow)=>{setEditId(r.id);setName(r.title);setBody(r.body);setDay(r.day||1);window.scrollTo({top:0,behavior:'smooth'})};
 return <div className="page"><PageHero title={title} summary={summary} image={image}/>{syncMode==='local'&&<p className="syncnote" role="status">⚠️ 未登录本地模式：所有改动只在本次打开期间有效；登录后可云端同步。</p>}{syncMode==='cloud'&&<p className="syncnote ok" role="status">✓ 已登录：记录云端同步（Supabase）。</p>}<section className="records-layout"><form className="recordform" onSubmit={e=>{e.preventDefault();add()}}><span className="formeyebrow">PERSONAL WORKSPACE</span><h2>{editId?'编辑记录':'新增记录'}</h2><label>标题<input aria-label={`${title}标题`} value={name} onChange={e=>setName(e.target.value)} placeholder={kind==='booking'?'例如：曼谷文华东方':kind==='packing'?'例如：护照与签证副本':'写下这段旅程'}/></label>{(kind==='note'||kind==='journal')&&<label>关联日期<select aria-label="关联行程日期" value={day} onChange={e=>setDay(Number(e.target.value))}>{days.map(d=><option value={d.day} key={d.day}>Day {d.day} · {d.city}</option>)}</select></label>}<label>详情<textarea aria-label={`${title}详情`} value={body} onChange={e=>setBody(e.target.value)} placeholder="确认号、时间、地址、想法或补充说明"/></label><div><button className="primary" type="submit" disabled={save.isPending}>{save.isPending?'保存中…':editId?'保存修改':'保存'}</button>{editId&&<button className="secondary" type="button" onClick={reset}>取消</button>}</div></form>{kind==='packing'&&<section className="suggestions"><h2>热带海岛清单建议</h2>{['护照与签证副本','轻薄雨衣','SPF50防晒','防蚊用品','海岛防水袋','全球转换插头','常用药与处方证明'].map(x=><button key={x} onClick={()=>save.mutate({kind:'packing',title:x,body:'建议清单',day:null,done:false})}>＋ {x}</button>)}</section>}<section className="records"><h2>{title}</h2>{q.isPending?<p>正在读取…</p>:rows.length===0?<p className="empty">还没有内容。先在上面添加一条。</p>:<>{recordPager.visible.map(r=><article key={r.id} className={r.done?'done':''}><button className="check" aria-label={`${r.done?'取消完成':'标记完成'}${r.title}`} onClick={()=>toggle(r)}>{r.done?'✓':'○'}</button><div><h3>{r.title}</h3>{r.day&&<span>Day {r.day}</span>}<p>{r.body||'—'}</p></div><span className="recordops"><button className="editrecord" aria-label={`编辑${r.title}`} onClick={()=>beginEdit(r)}>编辑</button><button className="delete" aria-label={`删除${r.title}`} onClick={()=>del.mutate({id:r.id})}>删除</button></span></article>)}{recordPager.toggle}</>}</section></section></div>
}

export function GuideApp({initialTab='行程',hideChrome=false}:{initialTab?:Tab;hideChrome?:boolean}){
 const [tab,setTab]=useState<Tab>(initialTab);
 const [bookingPreset,setBookingPreset]=useState<BookingPreset|null>(null);
 const onBook:OnBook=(p)=>setBookingPreset(p);
 const content=useMemo(()=>{if(tab==='行程')return <Itinerary onBook={onBook}/>;if(tab==='航班')return <Flights onBook={onBook}/>;if(tab==='交通')return <Transport/>;if(tab==='酒店')return <HotelCatalog onBook={onBook}/>;if(tab==='餐厅')return <RestaurantCatalog onBook={onBook}/>;if(tab==='实用信息')return <Practical onBook={onBook}/>;if(tab==='信息来源搜索状态')return <ResearchProgressPage/>;if(tab==='打包清单')return <RecordsPage kind="packing" title="打包清单" summary="按四国、海岛和长途飞行整理；勾选状态保存在私人数据库中。" image={phuketImg}/>;if(tab==='我的预订')return <RecordsPage kind="booking" title="我的预订" summary="集中保存酒店、餐厅、航班、门票与确认号。" image={singaporeImg}/>;return <RecordsPage kind="journal" title="旅行游记" summary="按 Day 1—20 写下当天见闻、餐桌和照片线索。" image={penangImg}/>},[tab]);
 const go=(t:Tab)=>{setTab(t);window.scrollTo({top:0,behavior:'auto'})};
 return <div className="app"><SafeAreaTopScrim backgroundColor="var(--surface)"/>{!hideChrome&&<div className="migration-notice" role="note">⚠️ 数据更新中：本页为旧版攻略站整体迁移（研究快照 2026-09-12）；小红书严格实读与 189 项详情重做完成后会替换更新。</div>}{!hideChrome&&<nav className="mainnav" aria-label="攻略章节">{tabs.map(t=><button key={t} className={tab===t?'active':''} aria-current={tab===t?'page':undefined} onClick={()=>go(t)}><NavIcon tab={t}/><span>{t}</span></button>)}</nav>}<main className={tab==='行程'?'itinerary-main':''}>{content}</main>{!hideChrome&&<footer><strong>20天 · 4国 · 8城</strong><p>固定研究快照：2026-09-12。开放时间、价格、签证、航班与房态请在出发前向官方渠道复核。</p></footer>}<BookingDialog open={!!bookingPreset} preset={bookingPreset} onClose={()=>setBookingPreset(null)}/></div>
}
