import type { Item } from './data';

export type ResearchHotelEntry={name:string;city:string;chain:string;tier:string;order:number};

function isObject(value:unknown):value is Record<string,unknown>{
  return typeof value==='object'&&value!==null&&!Array.isArray(value);
}

function normalizeName(value:string){
  return value.toLocaleLowerCase().replace(/[（(].*?[）)]/g,'').replace(/[\s·・—–\-_,，.。&＆]/g,'');
}

export function hotelChainTone(chain:string){
  const value=chain.toLocaleLowerCase();
  if(/万豪|marriott|bonvoy|丽思|ritz|jw|luxury collection|edition/.test(value))return 'marriott';
  if(/凯悦|hyatt|柏悦|andaz|安达仕/.test(value))return 'hyatt';
  if(/洲际|ihg|intercontinental|regent|六善|kimpton/.test(value))return 'ihg';
  if(/雅高|accor|raffles|莱佛士|fairmont|sofitel/.test(value))return 'accor';
  if(/独立|independent/.test(value))return 'independent';
  return 'other';
}

export function hotelTierTone(tier:string){
  if(tier==='顶奢')return 'ultra';
  if(tier==='奢华')return 'luxury';
  if(tier==='高端')return 'premium';
  if(tier==='精品')return 'boutique';
  return 'other';
}

export function extractHotelEntries(status:unknown):ResearchHotelEntry[]{
  if(!isObject(status)||!isObject(status.cities))return [];
  const result:ResearchHotelEntry[]=[];
  Object.values(status.cities).forEach(cityValue=>{
    if(!isObject(cityValue)||!Array.isArray(cityValue.items))return;
    const city=typeof cityValue.name==='string'?cityValue.name:'';
    let order=0;
    cityValue.items.forEach(itemValue=>{
      if(!isObject(itemValue)||itemValue.type!=='酒店')return;
      const name=typeof itemValue.name==='string'?itemValue.name.trim():'';
      const chain=typeof itemValue.chain==='string'?itemValue.chain.trim():'';
      const tier=typeof itemValue.tier==='string'?itemValue.tier.trim():'';
      if(name)result.push({name,city,chain,tier,order});
      order+=1;
    });
  });
  return result;
}

function findHotelEntry(entries:ResearchHotelEntry[],name:string,city?:string){
  const wanted=normalizeName(name);
  if(!wanted)return undefined;
  const inCity=entries.filter(entry=>!city||entry.city===city);
  const candidates=inCity.length?inCity:entries;
  const exact=candidates.find(entry=>normalizeName(entry.name)===wanted);
  if(exact)return exact;
  return candidates.find(entry=>{
    const candidate=normalizeName(entry.name);
    return candidate.includes(wanted)||wanted.includes(candidate);
  });
}

export function findHotelChain(entries:ResearchHotelEntry[],name:string,city?:string){
  return findHotelEntry(entries,name,city)?.chain||'';
}

export function findHotelTier(entries:ResearchHotelEntry[],name:string,city?:string){
  return findHotelEntry(entries,name,city)?.tier||'';
}

export function orderHotelsByResearch(items:Item[],entries:ResearchHotelEntry[],city:string){
  const cityEntries=entries.filter(entry=>entry.city===city).sort((a,b)=>a.order-b.order);
  if(!cityEntries.length)return items;
  const matched=new Set<Item>();
  const ordered=cityEntries.map(entry=>{
    const known=items.find(item=>normalizeName(item.name)===normalizeName(entry.name))
      ||items.find(item=>{
        const itemName=normalizeName(item.name);const entryName=normalizeName(entry.name);
        return itemName.includes(entryName)||entryName.includes(itemName);
      });
    if(known){matched.add(known);return known}
    return {
      name:entry.name,
      city,
      meta:[entry.chain,entry.tier].filter(Boolean).join(' · ')||'酒店候选',
      detail:'已纳入本城酒店研究工作集；详细资料仍在整理中。',
      best:'先比较位置、房型、含税总价与取消政策，再决定是否预订。'
    } satisfies Item;
  });
  return [...ordered,...items.filter(item=>!matched.has(item))];
}
