import { useState } from 'react';

/**
 * 任务B · 降密度：全站统一的折叠（accordion）与懒加载展开组件。
 * 10 个 tab 共用，保证视觉与交互一致；文案内容一律不由这里改动。
 */

export function Fold({eyebrow,title,meta,image,defaultOpen,extra,className,children}:{
 eyebrow?:string;title:string;meta?:string;image?:string;defaultOpen?:boolean;
 extra?:React.ReactNode;className?:string;children:React.ReactNode
}){
 return <details className={className?`fold ${className}`:'fold'} open={defaultOpen}>
  <summary>
   {image&&<img className="foldthumb" src={image} alt="" aria-hidden="true"/>}
   <span className="foldhead">{eyebrow&&<em>{eyebrow}</em>}<b>{title}</b>{meta&&<small>{meta}</small>}</span>
   {extra&&<span className="foldextra">{extra}</span>}
   <span className="foldchev" aria-hidden="true">＋</span>
  </summary>
  <div className="foldbody">{children}</div>
 </details>;
}

/** 长列表分页：先显示 pageSize 条，按钮展开全部 / 收起。 */
export function usePaged<T>(items:T[],pageSize:number,unit:string){
 const [expanded,setExpanded]=useState(false);
 const paged=items.length>pageSize;
 const visible=expanded?items:items.slice(0,pageSize);
 const toggle=paged?<div className="showmore">
  <button type="button" className="secondary" onClick={()=>setExpanded(v=>!v)} aria-expanded={expanded}>
   {expanded?'收起':'展开全部'} · {visible.length}/{items.length} {unit}
  </button>
 </div>:null;
 return {visible,toggle};
}
