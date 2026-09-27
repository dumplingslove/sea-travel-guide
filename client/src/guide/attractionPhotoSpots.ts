import {spots as bangkok} from './photoSpots/bangkok';
import {spots as chiangmai} from './photoSpots/chiangmai';
import {spots as phuket} from './photoSpots/phuket';
import {spots as penang} from './photoSpots/penang';
import {spots as kualalumpur} from './photoSpots/kualalumpur';
import {spots as hochiminh} from './photoSpots/hochiminh';
import {spots as phuquoc} from './photoSpots/phuquoc';
import {spots as singapore} from './photoSpots/singapore';

export interface PhotoSpot{
  /** 机位名称 */
  name:string;
  /** 详细位置：怎么走到、站在哪、面向哪 */
  where:string;
  /** 拍摄建议：最佳时间、手机技巧、构图 */
  how:string;
  /** 样片下标：getPlaceGallery('景点',{city,name}) 数组下标；只有视角对得上的才填 */
  sampleIndex?:number;
  /** 样片说明 */
  sampleCaption?:string;
}

const citySpots:Record<string,Record<string,PhotoSpot[]>>={
  '曼谷':bangkok,
  '清迈':chiangmai,
  '普吉':phuket,
  '槟城':penang,
  '吉隆坡':kualalumpur,
  '胡志明市':hochiminh,
  '富国岛':phuquoc,
  '新加坡':singapore,
};

/** 取某景点的机位列表；没有数据时返回 undefined（UI 显示"整理中"）。 */
export function getPhotoSpots(city:string,name:string):PhotoSpot[]|undefined{
  return citySpots[city]?.[name];
}

/** 人像关键词：只认机位自身研究文案里明确写了的人像/合影类拍法 */
const PORTRAIT_RE=/人像|合影|摆拍|借位|写真/;
/**
 * 人像机位：从已有研究机位中筛出文案自带人像拍法的条目，原样复用（不改写、不编造）。
 * 没有命中时返回 undefined，UI 显示"待补充"。
 */
export function getPortraitSpots(city:string,name:string):PhotoSpot[]|undefined{
  const spots=getPhotoSpots(city,name);
  if(!spots?.length)return undefined;
  const matched=spots.filter((s)=>PORTRAIT_RE.test(`${s.name} ${s.where} ${s.how}`));
  return matched.length?matched:undefined;
}

export const photoSpotAttractionCount=Object.values(citySpots).reduce((n,c)=>n+Object.keys(c).length,0);
export const photoSpotCount=Object.values(citySpots).reduce((n,c)=>n+Object.values(c).reduce((m,s)=>m+s.length,0),0);
