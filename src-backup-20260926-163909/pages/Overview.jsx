import React from "react";
import {Button,Card,Eyebrow,Icon,RiskBadge,SectionHeader} from "../components/common/UI";
import FarmMap from "../components/map/FarmMap";
import {evidenceCount,fmtTime} from "../utils/crai";

function RiskDial({score,level}){
 const value=Number.isFinite(Number(score))?Number(score):null;
 const deg=value==null?0:Math.max(0,Math.min(100,value))*3.6;
 return <div className="risk-dial" style={{"--dial-deg":`${deg}deg`}}>
   <div className="risk-dial-inner"><span>{level||"WAITING"}</span><strong>{value==null?"—":value.toFixed(1)}</strong><small>/ 100</small></div>
 </div>
}

export default function Overview({result,readings,history,onObserve,onIntel,onZone,onRefresh}){
 const risk=result?.risk||{}; const level=String(risk.level||"UNKNOWN").toUpperCase();
 const score=risk.score==null?null:Number(risk.score); const decision=result?.decision?.action||"AWAITING_OBSERVATION";
 const count=evidenceCount(result); const latestSensor=readings?.slice?.().sort((a,b)=>new Date(b.timestamp)-new Date(a.timestamp))[0];
 const zone=result?.context?.zone_id||"A1"; const disease=result?.visual?.disease;
 const envReady=Boolean(result?.risk?.breakdown?.environmental!=null || latestSensor);
 return <main className="content overview-v8">
   <div className="page-head overview-head">
    <div><Eyebrow>FIELD COMMAND · 15 SEP 2026</Eyebrow><h1>Field intelligence overview</h1><p>See the field state, understand the evidence, and move directly to the next action.</p></div>
    <div className="page-actions"><Button variant="secondary" onClick={onRefresh} disabled={!onRefresh}><Icon name="refresh"/> Refresh evidence</Button><Button onClick={onObserve}><Icon name="camera"/> New observation</Button></div>
   </div>

   <Card className="command-hero">
    <div className="hero-copy"><div className="hero-kicker"><span className="pulse-dot"/> LIVE FIELD CONTEXT <span className="hero-divider"/> FARM 01 · {zone}</div>
      <h2>{disease||"No active disease signal"}</h2>
      <p>{result?`CRAAI has an evidence-backed assessment for ${zone}. The deterministic engine is the source of truth for the action below.`:"Start with a crop image. CRAAI will decide which additional evidence is actually needed."}</p>
      <div className="hero-actions"><Button onClick={result?onIntel:onObserve}>{result?"Open decision intelligence":"Start observation"} <span>→</span></Button>{result&&<span className="decision-chip"><Icon name="shield" size={14}/><b>{decision}</b><small>deterministic</small></span>}</div>
    </div>
    <div className="hero-risk"><RiskDial score={score} level={level}/><div className="hero-risk-copy"><Eyebrow>FUSED FIELD RISK</Eyebrow><b>{score==null?"Waiting for evidence":`${score.toFixed(1)} / 100`}</b><span>{result?<RiskBadge level={level}/>:"No completed assessment"}</span></div></div>
   </Card>

   <div className="kpi-grid kpi-grid-v8">
    <Card className="metric-card"><span className="metric-label"><Icon name="leaf"/> ACTIVE SIGNAL</span><strong>{disease||"—"}</strong><small>{result?`${Number(result.visual?.confidence||0).toFixed(1)}% model confidence`:'Upload an image to begin'}</small></Card>
    <Card className="metric-card"><span className="metric-label"><Icon name="chip"/> EVIDENCE</span><strong>{result?`${count} / 4`:`0 / 4`}</strong><small>{result?"Evidence evaluated":"Waiting for observation"}</small></Card>
    <Card className="metric-card"><span className="metric-label"><Icon name="shield"/> DECISION</span><strong>{result?(result.decision?.ready?"READY":"WAITING"):"WAITING"}</strong><small>{result?decision:"Deterministic assessment"}</small></Card>
    <Card className="metric-card"><span className="metric-label"><Icon name="wifi"/> ENVIRONMENT</span><strong>{envReady?"AVAILABLE":"WAITING"}</strong><small>{latestSensor?.source?`${latestSensor.source} · ${latestSensor.zone_id||zone}`:"No sensor evidence loaded"}</small></Card>
   </div>

   <div className="overview-grid overview-main-grid">
    <Card className="map-card map-card-v8"><SectionHeader eyebrow="SPATIAL FIELD VIEW" title="Farm 01 · operational map" action={<button className="link-btn" onClick={onIntel}>Open intelligence <b>→</b></button>}/><FarmMap result={result} selectedZone={zone} onZone={onZone}/></Card>
    <Card className="decision-brief">
      <div className="brief-top"><Eyebrow>CRAAI DECISION BRIEF</Eyebrow><span className="source-tag">FUSION V1.5</span></div>
      <div className="brief-status"><span className={`status-orb ${String(level).toLowerCase()}`}/><div><b>{decision.replaceAll("_"," ")}</b><small>{result?.decision?.reason||result?.decision?.rationale||"No completed deterministic decision yet."}</small></div></div>
      <div className="evidence-rail">
       {[["VISUAL",result?.risk?.breakdown?.visual,"35%"],["ENVIRONMENT",result?.risk?.breakdown?.environmental,"25%"],["SPATIAL",result?.risk?.breakdown?.spatial,"25%"],["TEMPORAL",result?.risk?.breakdown?.temporal,"15%"]].map(([name,val,w])=><div className="rail-row" key={name}><span>{name}</span><div><i style={{width:`${val==null?0:Math.max(4,Math.min(100,Number(val)))}%`}}/></div><b>{val==null?"—":Number(val).toFixed(0)}</b><small>{w}</small></div>)}
      </div>
      <div className="brief-footer"><div><small>ZONE</small><b>{zone}</b></div><div><small>CROP</small><b>{result?.context?.crop||"Tomato"}</b></div><div><small>ASSESSMENT</small><b>{risk.assessment_confidence||"—"}</b></div></div>
      <Button variant="secondary" className="full" onClick={result?onIntel:onObserve}>{result?"Inspect evidence chain":"Create first observation"} →</Button>
    </Card>
   </div>

   <Card className="activity-card activity-v8"><SectionHeader eyebrow="FIELD MEMORY" title="Recent observations" action={<button className="link-btn" onClick={()=>window.dispatchEvent(new CustomEvent("crai:navigate",{detail:"history"}))}>View history <b>→</b></button>}/>
    <div className="activity-table"><div className="activity-row head"><span>TIME</span><span>ZONE</span><span>OBSERVATION</span><span>RISK</span><span>ACTION</span></div>
      {history.slice(0,6).map((h,i)=><button className="activity-row" key={h.id||i} onClick={()=>onIntel(h)}><span>{fmtTime(h.timestamp||h.observed_at)}</span><span>{h.context?.zone_id||"A1"}</span><span><b>{h.visual?.disease||"—"}</b><small>{h.context?.crop||"Tomato"}</small></span><span><RiskBadge level={h.risk?.level||"UNKNOWN"}/> <em>{h.risk?.score==null?"—":Number(h.risk.score).toFixed(1)}</em></span><span>{h.decision?.action||"—"}</span></button>)}
      {!history.length&&<div className="activity-empty">No completed observations yet. CRAAI field memory will appear here after a successful assessment.</div>}
    </div>
   </Card>
 </main>
}
