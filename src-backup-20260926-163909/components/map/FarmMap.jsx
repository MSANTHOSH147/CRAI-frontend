import React,{useState} from "react";
import {Icon} from "../common/UI";
import {ZONES} from "../../utils/crai";

const zoneShapes={A1:"M118 126 Q205 96 310 126 L332 246 Q230 270 125 235Z",A2:"M315 125 Q445 92 580 128 L600 245 Q455 264 332 246Z",A3:"M128 242 Q235 268 332 246 Q455 264 600 245 L624 370 Q480 390 350 360 Q230 382 132 346Z",B1:"M132 346 Q230 382 350 360 L360 448 Q225 468 120 420Z"};

function zoneRisk(id,result,selected){
 const score=selected?result?.risk?.score:null;
 const level=selected?String(result?.risk?.level||"UNKNOWN").toUpperCase():"UNKNOWN";
 return {score,level};
}
export default function FarmMap({result,onZone,selectedZone="A1"}){
 const [hover,setHover]=useState(null); const active=result?.context?.zone_id||selectedZone;
 const [zoom,setZoom]=useState(1); const selectedRisk=result?.risk?.level||"UNKNOWN";
 return <div className="farm-map-wrap">
   <div className="farm-map farm-map-v8" style={{"--map-scale":zoom}}>
    <svg className="farm-art" viewBox="0 0 720 500" role="img" aria-label="CRAI operational farm visualization">
      <defs>
       <linearGradient id="land" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#edf4e8"/><stop offset="1" stopColor="#d7e7cf"/></linearGradient>
       <pattern id="cropRowsV8" width="22" height="22" patternUnits="userSpaceOnUse" patternTransform="rotate(8)"><path d="M2 0V22" stroke="#a9c99e" strokeWidth="3" opacity=".34"/></pattern>
       <filter id="soft"><feGaussianBlur stdDeviation="18"/></filter>
      </defs>
      <rect width="720" height="500" fill="#e9f0e5"/>
      <path d="M74 75 Q156 36 252 58 Q362 30 472 57 Q575 40 650 104 L662 208 Q641 294 658 392 Q578 452 474 431 Q366 469 274 442 Q160 464 84 404 Q101 321 67 244Z" fill="url(#land)" stroke="#9ebd94" strokeWidth="5"/>
      <path d="M74 75 Q156 36 252 58 Q362 30 472 57 Q575 40 650 104 L662 208 Q641 294 658 392 Q578 452 474 431 Q366 469 274 442 Q160 464 84 404 Q101 321 67 244Z" fill="url(#cropRowsV8)"/>
      <path d="M67 250 C190 214 310 236 418 258 S565 302 662 258" fill="none" stroke="#ffffff" strokeWidth="18" opacity=".9"/>
      <path d="M67 250 C190 214 310 236 418 258 S565 302 662 258" fill="none" stroke="#a2bb98" strokeWidth="3"/>
      <path d="M94 422 C178 398 235 409 300 430 S430 466 512 438 S604 410 649 424" fill="none" stroke="#c5aa78" strokeWidth="10" strokeLinecap="round"/>
      <path d="M95 421 C178 397 235 408 300 429 S430 465 512 437 S604 409 649 423" fill="none" stroke="#e8d8b7" strokeWidth="4" strokeLinecap="round"/>
      <path d="M514 78 C558 57 610 72 619 111 C625 140 598 160 560 157 C522 154 497 112 514 78Z" fill="#bfe0df" stroke="#8fc3c2" strokeWidth="5"/>
      <g fill="#79a66d" stroke="#5f8c58" strokeWidth="2"><circle cx="92" cy="102" r="17"/><circle cx="119" cy="79" r="12"/><circle cx="625" cy="382" r="19"/><circle cx="645" cy="355" r="12"/><circle cx="103" cy="397" r="18"/><circle cx="133" cy="420" r="11"/><circle cx="477" cy="420" r="15"/></g>
      <g opacity=".6" fill="#6e9a62"><circle cx="88" cy="98" r="7"/><circle cx="116" cy="76" r="5"/><circle cx="621" cy="377" r="7"/><circle cx="99" cy="392" r="7"/></g>
      {Object.entries(zoneShapes).map(([id,path])=>{
       const is=active===id; const has=is&&result?.risk?.score!=null; const lvl=is?selectedRisk:"UNKNOWN";
       return <g key={id} onMouseEnter={()=>setHover(id)} onMouseLeave={()=>setHover(null)} onClick={()=>onZone?.(id)} className={`map-zone ${is?"selected":""}`}>
        <path d={path} className={`zone-fill ${String(lvl).toLowerCase()}`} />
        <path d={path} className="zone-border"/>
        <text x={id==="A1"?205:id==="A2"?447:id==="A3"?380:225} y={id==="A1"?188:id==="A2"?185:id==="A3"?310:405} textAnchor="middle" className="zone-label">{id}</text>
        {has&&<text x={id==="A1"?205:id==="A2"?447:id==="A3"?380:225} y={id==="A1"?212:id==="A2"?209:id==="A3"?334:429} textAnchor="middle" className="zone-score">{Number(result.risk.score).toFixed(0)}</text>}
       </g>
      })}
      {result?.risk?.score!=null&&<g className="map-risk-pulse"><circle cx="205" cy="164" r="10"/><circle cx="205" cy="164" r="22"/></g>}
    </svg>
    <div className="map-toolbar"><button onClick={()=>setZoom(z=>Math.min(1.18,z+.06))} aria-label="Zoom in">+</button><button onClick={()=>setZoom(z=>Math.max(.92,z-.06))} aria-label="Zoom out">−</button><button onClick={()=>setZoom(1)} aria-label="Reset map"><Icon name="refresh" size={14}/></button></div>
    <div className="north"><b>N</b><span>↑</span></div>
    <div className="map-layer-chip"><Icon name="map" size={14}/> FIELD EVIDENCE</div>
    {hover&&<div className="map-hover"><b>{hover}</b><span>{hover===active&&result?.risk?.score!=null?`${Number(result.risk.score).toFixed(1)} · ${selectedRisk}`:"No completed assessment"}</span></div>}
    <div className="map-legend"><div><i className="low"/>Low</div><div><i className="moderate"/>Moderate</div><div><i className="high"/>High</div><div><i className="critical"/>Critical</div></div>
   </div>
   <div className="map-footer"><span><Icon name="map" size={15}/> Farm 01 · spatial evidence layer</span><span>Illustrative field geometry · replaceable with GPS</span></div>
 </div>
}
