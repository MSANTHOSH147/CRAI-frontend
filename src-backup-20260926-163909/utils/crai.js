export const ZONES=[
 {id:"A1",x:28,y:36,shape:"northwest"},{id:"A2",x:69,y:32,shape:"northeast"},{id:"A3",x:52,y:61,shape:"center"},{id:"B1",x:19,y:72,shape:"southwest"}
];
export const RISK_META={LOW:{label:"Low",tone:"low"},MODERATE:{label:"Moderate",tone:"moderate"},HIGH:{label:"High",tone:"high"},CRITICAL:{label:"Critical",tone:"critical"},UNKNOWN:{label:"Waiting",tone:"unknown"}};
export function parseTimestamp(value){if(!value)return null;const s=String(value);return /Z$|[+-]\d{2}:\d{2}$/.test(s)?new Date(s):new Date(`${s}Z`)}
export function ageMinutes(value){const d=parseTimestamp(value);if(!d||Number.isNaN(d.getTime()))return Infinity;return Math.max(0,(Date.now()-d.getTime())/60000)}
export function freshness(value){const a=ageMinutes(value);if(a<=15)return"FRESH";if(a<=60)return"RECENT";if(a<=360)return"STALE";return"VERY_STALE"}
export function fmtTime(value){const d=parseTimestamp(value);return d&&!Number.isNaN(d.getTime())?d.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}):"—"}
export function fmtDate(value){const d=parseTimestamp(value);return d&&!Number.isNaN(d.getTime())?d.toLocaleDateString([],{day:"2-digit",month:"short",year:"numeric"}):"—"}

function firstObject(...values){return values.find(v=>v&&typeof v==="object"&&!Array.isArray(v))||{}}

export function extractAdvisoryText(value){
 if(!value)return "";
 if(typeof value === "string")return value.trim();
 if(typeof value !== "object")return String(value);
 const candidates=[value.advisory,value.text,value.message,value.content,value.response];
 for(const item of candidates){
   if(typeof item === "string" && item.trim())return item.trim();
 }
 return "";
}

/** Normalize all known CRAI API response envelopes into one frontend contract. */
export function normalizeResult(raw){
 if(!raw)return null;
 // /api/analysis/image wraps the real analysis under `analysis` and the model output under `disease_ai`.
 const analysis=raw?.analysis&&typeof raw.analysis==="object"?raw.analysis:raw;
 const riskRaw=analysis?.risk||raw?.risk||{};
 const decisionRaw=analysis?.decision||raw?.decision||{};
 const diseaseRaw=analysis?.disease||raw?.disease||raw?.disease_ai||raw?.visual||{};
 const adaptive=analysis?.adaptive_evidence||raw?.adaptive_evidence||raw?.adaptive||{};
 const fieldContext=raw?.field_context||analysis?.field_context||{};
 const context=firstObject(analysis?.context,raw?.context);
 const mergedContext={...fieldContext,...context};
 const visual={
   disease:diseaseRaw?.prediction||diseaseRaw?.disease||diseaseRaw?.label||"Unknown",
   confidence:Number(diseaseRaw?.confidence??diseaseRaw?.model_confidence??0)
 };
 const scoreValue=riskRaw?.risk_score??riskRaw?.score??riskRaw?.fused_risk;
 const score=scoreValue==null?null:Number(scoreValue);
 const level=String(riskRaw?.risk_level||riskRaw?.level||(score==null?"UNKNOWN":riskLevel(score))).toUpperCase();
 const decision={
   ...decisionRaw,
   ready:decisionRaw?.ready===true,
   action:decisionRaw?.action||decisionRaw?.recommendation||"COLLECT ADDITIONAL EVIDENCE",
   rationale:decisionRaw?.rationale||decisionRaw?.reason||decisionRaw?.message||""
 };
 return {
   ...raw,
   ...analysis,
   analysis,
   status:raw?.status||analysis?.status,
   risk:{...riskRaw,score,level,assessment_confidence:riskRaw?.assessment_confidence??riskRaw?.confidence},
   decision,
   visual,
   disease:diseaseRaw,
   adaptive,
   context:mergedContext,
   field_context:fieldContext,
   judge_intelligence:analysis?.judge_intelligence||raw?.judge_intelligence||null,
   advisory:analysis?.advisory??raw?.advisory??null,
   advisory_text:extractAdvisoryText(analysis?.advisory??raw?.advisory??null),
   evidence:analysis?.evidence||raw?.evidence||{}
 };
}
export function evidenceCount(result){if(!result)return 0;const e=result.evidence||{};if(Number.isFinite(e.evidence_count))return e.evidence_count;return ["visual","environmental","spatial","temporal"].filter(k=>e[k]!=null||result?.risk?.breakdown?.[k]!=null).length}
export function riskLevel(score){if(score>=70)return"CRITICAL";if(score>=50)return"HIGH";if(score>=30)return"MODERATE";return"LOW"}

export function normalizeObservation(item){
 if(!item)return null;
 const score=item.risk_score??item.risk?.risk_score??item.risk?.score;
 const level=String(item.risk_level??item.risk?.risk_level??item.risk?.level??(score!=null?riskLevel(Number(score)):"UNKNOWN")).toUpperCase();
 const confidence=item.disease_confidence??item.disease?.confidence??item.visual?.confidence;
 return {
   id:item.observation_id||item.id||item.timestamp||item.observed_at,
   observation_id:item.observation_id,
   timestamp:item.observed_at||item.timestamp,
   context:{zone_id:item.zone_id||item.context?.zone_id||"A1",crop:item.crop||item.context?.crop,growth_stage:item.growth_stage||item.context?.growth_stage},
   visual:{disease:item.prediction||item.disease?.prediction||item.visual?.disease||"Unknown",confidence:confidence==null?0:Number(confidence)},
   disease_confidence:confidence==null?null:Number(confidence),
   risk:{score:score==null?null:Number(score),level,assessment_confidence:item.assessment_confidence??item.risk?.assessment_confidence},
   decision:{action:item.decision||item.decision_action||item.decision?.action||null},
   soil_moisture:item.soil_moisture??null,temperature:item.temperature??null,humidity:item.humidity??null,
   evidence_breakdown:item.evidence_breakdown??null,evidence_summary:item.evidence_summary??null,source:item.source??null
 };
}
export function getHistory(){try{const x=JSON.parse(localStorage.getItem("crai.history.v4")||"[]");return Array.isArray(x)?x:[]}catch{return[]}}
export function saveHistory(item){const next=[item,...getHistory().filter(x=>x.id!==item.id)].slice(0,40);localStorage.setItem("crai.history.v4",JSON.stringify(next));return next}
