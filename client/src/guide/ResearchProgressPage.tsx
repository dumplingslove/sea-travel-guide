import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getResearchStatus } from './records';
import { Fold } from './density';
import { initialResearchStatus } from './researchStatusInitial';
import { hotelChainTone, hotelTierTone } from './hotelChains';

type RawState='done'|'partial'|'pending'|'unavailable';
type SourceKey='tripadvisor'|'google_maps'|'chinese_sites'|'xiaohongshu'|'photos'|'details';
type SourceValue={status:RawState;posts?:number;verified?:number;target?:number;note?:string;storedStatus?:RawState};
type ResearchItem={name:string;type:'酒店'|'餐厅'|'景点'|string;note?:string;chain?:string;tier?:string;sources:Record<SourceKey,SourceValue>};
type CityStatus={name:string;total:number;complete:number;items:ResearchItem[]};
type ResearchStatusData={updated_at:string;targets:Record<string,unknown>;cities:Record<string,CityStatus>};
type FilterState='all'|RawState;

const sourceLabels:Record<SourceKey,string>={tripadvisor:'TripAdvisor',google_maps:'Google Maps',chinese_sites:'中文站',xiaohongshu:'小红书',photos:'照片',details:'详情'};
const sourceKeys=Object.keys(sourceLabels) as SourceKey[];
const fallback=initialResearchStatus as unknown as ResearchStatusData;
const stateLabels:Record<RawState,string>={done:'已完成',partial:'进行中',pending:'待开始',unavailable:'不可补齐'};

function isObject(value:unknown):value is Record<string,unknown>{return typeof value==='object'&&value!==null&&!Array.isArray(value)}
function safeNumber(value:unknown,defaultValue:number){return typeof value==='number'&&Number.isFinite(value)&&value>=0?value:defaultValue}
function safeState(value:unknown,defaultValue:RawState='pending'):RawState{return value==='done'||value==='partial'||value==='pending'||value==='unavailable'?value:defaultValue}
function cleanDateText(value:unknown){return typeof value==='string'?value.replace(/\s*UTC$/i,'').trim():''}
function safeDate(value:unknown,defaultValue:string){for(const candidate of [value,defaultValue]){const text=cleanDateText(candidate);if(text&&!Number.isNaN(Date.parse(text)))return text}return ''}
function safeSource(value:unknown,base:SourceValue,key:SourceKey):SourceValue{
 const row=isObject(value)?value:{};
 const next:SourceValue={...base,status:safeState(row.status,base.status)};
 if(typeof row.note==='string')next.note=row.note;
 if(key==='xiaohongshu'){
  next.posts=safeNumber(row.posts,base.posts||0);
  next.target=Math.max(1,safeNumber(row.target,base.target||10));
  next.storedStatus=safeState(row.status,base.storedStatus||base.status);
  next.status=(next.posts||0)>=(next.target||10)?'done':(next.posts||0)>0?'partial':next.status;
 }
 if(key==='photos'){
  next.verified=safeNumber(row.verified,base.verified||0);
  next.target=Math.max(1,safeNumber(row.target,base.target||5));
  next.status=(next.verified||0)>=(next.target||5)?'done':(next.verified||0)>0?'partial':next.status;
 }
 return next;
}
function safeItem(value:unknown,base:ResearchItem):ResearchItem{
 const row=isObject(value)?value:{};const rawSources=isObject(row.sources)?row.sources:{};
 return {
  name:typeof row.name==='string'&&row.name.trim()?row.name:base.name,
  type:typeof row.type==='string'&&row.type.trim()?row.type:base.type,
  note:typeof row.note==='string'?row.note:base.note,
  chain:typeof row.chain==='string'?row.chain:base.chain||'',
  tier:typeof row.tier==='string'?row.tier:base.tier||'',
  sources:Object.fromEntries(sourceKeys.map(key=>[key,safeSource(rawSources[key],base.sources[key],key)])) as Record<SourceKey,SourceValue>
 };
}
function normalizeStatus(input:unknown):ResearchStatusData{
 const root=isObject(input)?input:{};const rawCities=isObject(root.cities)?root.cities:{};
 const cityKeys=Array.from(new Set([...Object.keys(fallback.cities),...Object.keys(rawCities)]));
 const cities=Object.fromEntries(cityKeys.map(slug=>{
  const baseCity=fallback.cities[slug];
  const rawCity=isObject(rawCities[slug])?rawCities[slug]:{};
  const rawItems=Array.isArray(rawCity.items)?rawCity.items:[];
  const baseItems=baseCity?.items||[];
  const baseByName=new Map(baseItems.map(item=>[item.name,item]));
  const itemRows=rawItems.length>0?rawItems:baseItems;
  const items=itemRows.filter(isObject).map(row=>{
   const name=typeof row.name==='string'?row.name:'';
   const base=baseByName.get(name)||{
    name,
    type:typeof row.type==='string'?row.type:'',
    chain:'',
    tier:'',
    sources:Object.fromEntries(sourceKeys.map(key=>[key,{status:'pending' as RawState}])) as Record<SourceKey,SourceValue>
   };
   return safeItem(row,base);
  });
  const city:CityStatus={
   name:typeof rawCity.name==='string'&&rawCity.name.trim()?rawCity.name:baseCity?.name||slug,
   total:items.length,
   complete:0,
   items
  };
  city.complete=items.filter(item=>sourceKeys.every(key=>itemSourceState(item,key)==='done')).length;
  return [slug,city];
 })) as Record<string,CityStatus>;
 return {
  updated_at:safeDate(root.updated_at,fallback.updated_at),
  targets:isObject(root.targets)?{...fallback.targets,...root.targets}:fallback.targets,
  cities
 };
}
function itemSourceState(item:ResearchItem,key:SourceKey):RawState{
 const source=item.sources[key];
 if(key==='xiaohongshu')return (source.posts||0)>=(source.target||10)?'done':(source.posts||0)>0?'partial':safeState(source.status);
 if(key==='photos')return (source.verified||0)>=(source.target||5)?'done':(source.verified||0)>0?'partial':safeState(source.status);
 return safeState(source.status);
}
function overallState(item:ResearchItem):RawState{
 const states=sourceKeys.map(key=>itemSourceState(item,key));
 return states.every(x=>x==='done')?'done':states.some(x=>x!=='pending')?'partial':'pending';
}
function ProgressBar({value,total,label}:{value:number;total:number;label:string}){const pct=total?Math.min(100,Math.round(value/total*100)):0;return <div className="rp-progress" aria-label={`${label} ${value}/${total}`}><i><em style={{width:`${pct}%`}}/></i><span>{value}/{total}</span><b>{pct}%</b></div>}
function StatusBadge({item,source}:{item:ResearchItem;source:SourceKey}){
 const value=item.sources[source];const state=itemSourceState(item,source);const count=source==='xiaohongshu'?`${value.posts||0}/${value.target||10}`:source==='photos'?`${value.verified||0}/${value.target||5}`:stateLabels[state];
 return <div className={`rp-badge ${state}`} aria-label={`${sourceLabels[source]}：${count}`}><span>{sourceLabels[source]}</span><b>{count}</b></div>
}

export function ResearchProgressPage(){
 const query=useQuery({queryKey:['research-status'],queryFn:()=>getResearchStatus(),staleTime:0,retry:1});
 const response=query.data;
 const data=useMemo(()=>normalizeStatus(response?.status),[response?.status]);
 const [cityFilter,setCityFilter]=useState('all');const [sourceFilter,setSourceFilter]=useState<'all'|SourceKey>('all');const [statusFilter,setStatusFilter]=useState<FilterState>('all');
 const cities=useMemo(()=>Object.entries(data.cities),[data.cities]);const allItems=useMemo(()=>cities.flatMap(([,city])=>city.items),[cities]);const total=allItems.length;
 const complete=allItems.filter(item=>overallState(item)==='done').length;
 const sourceStats=sourceKeys.map(key=>({key,done:allItems.filter(item=>itemSourceState(item,key)==='done').length,unavail:allItems.filter(item=>itemSourceState(item,key)==='unavailable').length}));
 const xhsStrict=allItems.filter(item=>item.sources.xiaohongshu.storedStatus==='done').length;
 const xhsCovered=allItems.filter(item=>(item.sources.xiaohongshu.posts||0)>0).length;
 const shownCities=useMemo(()=>cities.filter(([slug])=>cityFilter==='all'||slug===cityFilter).map(([slug,city])=>({slug,city,items:city.items.filter(item=>{if(statusFilter==='all')return true;const state=sourceFilter==='all'?overallState(item):itemSourceState(item,sourceFilter);return state===statusFilter})})).filter(group=>group.items.length>0),[cities,cityFilter,sourceFilter,statusFilter]);
 const updated=safeDate(response?.updated_at,data.updated_at);const updateText=updated?new Date(updated).toLocaleString('zh-CN',{year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'}):'—';
 const [refreshNote,setRefreshNote]=useState<string|null>(null);
 const doRefresh=async()=>{
  if(refreshNote==='同步中…')return;
  setRefreshNote('同步中…');
  const started=Date.now();
  let failed=false;
  try{const result=await query.refetch();failed=result.isError}catch{failed=true}
  await new Promise(resolve=>setTimeout(resolve,Math.max(0,700-(Date.now()-started))));
  setRefreshNote(failed?'读取失败，显示快照':'✓ 已是最新快照');
  setTimeout(()=>setRefreshNote(current=>current==='同步中…'?current:null),2600);
 };
 return <div className="page research-page">
  <section className="rp-hero"><div><span>RESEARCH OPERATIONS</span><h1>信息来源搜索状态</h1><p>逐地点记录六类资料的核验进度。页面会先显示稳定快照，再合并数据库中的最新进展；部分同步也不会让整页消失。</p></div><aside><span>最近同步</span><strong>{updateText}</strong><small>{response?.source==='database'?'数据库最新状态':'构建时初始快照'}</small><button onClick={doRefresh} disabled={refreshNote==='同步中…'}>{refreshNote||'重新读取'}</button></aside></section>
  {query.isError&&<p className="rp-error" role="status">数据库状态暂时无法读取，当前显示构建时初始快照。你可以稍后重新读取。</p>}
  <section className="rp-overview" aria-label="研究进度总览"><article className="rp-total"><span>六来源研究工作集</span><strong>{total}</strong><p>{cities.map(([,city])=>`${city.name}${city.total}`).join(' · ')}</p></article><article className="rp-complete"><span>全部来源已完成</span><strong>{complete}</strong><ProgressBar value={complete} total={total} label="全部来源完成进度"/></article></section>
  <p className="rp-scope-note"><strong>口径说明：</strong>本页按数据库中 {total} 个地点的实际条目实时汇总六类来源进度；图片精确地点匹配与全部小红书逐帖核验尚未完成。</p>
  <section className="rp-source-summary" aria-label="六个信息来源完成进度">{sourceStats.map(({key,done,unavail})=>{const isXhs=key==='xiaohongshu';const showDone=isXhs?xhsCovered:done;return <article key={key}><header><span>{sourceLabels[key]}</span><b>{showDone}/{total}</b></header><ProgressBar value={showDone} total={total} label={`${sourceLabels[key]}完成进度`}/>{isXhs&&<p className="rp-unavail-note">严格口径：{xhsStrict}/{total} 达标（正文+评论实读、图片逐张审核）</p>}{unavail>0&&<p className="rp-unavail-note">另有 {unavail} 项经核实不可补齐，不计入待办</p>}<p>{key==='xiaohongshu'?'有帖子覆盖即计成功；目标每项≥10篇2024–2026帖子':key==='photos'?'每项至少5张真实准确照片':key==='details'?'地址、营业时间、价格、交通等完整信息':'完成逐地点核验'}</p></article>})}</section>
  <section className="rp-controls" aria-label="研究进度筛选"><label>城市<select value={cityFilter} onChange={e=>setCityFilter(e.target.value)}><option value="all">全部8城</option>{cities.map(([slug,city])=><option value={slug} key={slug}>{city.name} · {city.total}项</option>)}</select></label><label>来源<select value={sourceFilter} onChange={e=>setSourceFilter(e.target.value as 'all'|SourceKey)}><option value="all">全部来源综合状态</option>{sourceKeys.map(key=><option value={key} key={key}>{sourceLabels[key]}</option>)}</select></label><label>状态<select value={statusFilter} onChange={e=>setStatusFilter(e.target.value as FilterState)}><option value="all">全部状态</option><option value="done">已完成</option><option value="partial">进行中</option><option value="pending">待开始</option><option value="unavailable">不可补齐</option></select></label><p>显示 {shownCities.reduce((sum,group)=>sum+group.items.length,0)} / {total} 项</p></section>
  <section className="rp-city-list">{shownCities.map(({slug,city,items},idx)=>{const cityComplete=city.items.filter(item=>overallState(item)==='done').length;const num=String(cities.findIndex(([key])=>key===slug)+1).padStart(2,'0');return <Fold key={slug} className="rpfold" eyebrow={`RESEARCH · ${num}`} title={city.name} meta={`${cityComplete}/${city.total} 项全部来源完成 · 点击展开逐项来源`} defaultOpen={idx===0} extra={<ProgressBar value={cityComplete} total={city.total} label={`${city.name}完成进度`}/>}>
  <div className="rp-table-head"><span>地点</span>{sourceKeys.map(key=><span key={key}>{sourceLabels[key]}</span>)}</div><div className="rp-items">{items.map(item=><article key={`${slug}-${item.name}`}><div className="rp-place"><span>{item.type}</span><h3>{item.name}</h3>{(item.chain||item.tier)&&<div className="hotel-badges">{item.chain&&<small className={`hotel-chain-badge ${hotelChainTone(item.chain)}`}>{item.chain}</small>}{item.tier&&<small className={`hotel-tier-badge ${hotelTierTone(item.tier)}`}>{item.tier}</small>}</div>}{item.note&&<p>{item.note}</p>}</div><div className="rp-sources">{sourceKeys.map(key=><StatusBadge key={key} item={item} source={key}/>)}</div></article>)}</div>
 </Fold>})}{shownCities.length===0&&<div className="rp-empty"><h2>当前筛选下没有地点</h2><p>换一个城市、来源或状态即可继续查看。</p></div>}</section>
 </div>
}
