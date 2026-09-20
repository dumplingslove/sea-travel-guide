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

export const photoSpotAttractionCount=Object.values(citySpots).reduce((n,c)=>n+Object.keys(c).length,0);
export const photoSpotCount=Object.values(citySpots).reduce((n,c)=>n+Object.values(c).reduce((m,s)=>m+s.length,0),0);
