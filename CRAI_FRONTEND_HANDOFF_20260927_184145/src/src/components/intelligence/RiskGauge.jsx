export default function RiskGauge({score,level,decisionReady=false}){
 const known=decisionReady&&typeof score==="number";
 const pct=known?Math.max(0,Math.min(100,score)):0;
 const r=82, cx=100, cy=100, arc=Math.PI*r, dash=arc*(pct/100);
 const color={LOW:"#1f8a68",MODERATE:"#b7791f",HIGH:"#b75d30",CRITICAL:"#c64a45"}[String(level||"").toUpperCase()]||"#a2aaa5";
 return <div className="gauge-wrap">
   <div className="gauge-svg">
    <svg viewBox="0 0 200 115">
      <path d="M18 100 A82 82 0 0 1 182 100" fill="none" stroke="#e8eee9" strokeWidth="14" strokeLinecap="round"/>
      {known&&<path d="M18 100 A82 82 0 0 1 182 100" fill="none" stroke={color} strokeWidth="14" strokeLinecap="round" strokeDasharray={`${dash} ${arc}`} />}
    </svg>
    <div className="gauge-center"><b>{known?Math.round(score):"—"}</b><span>{known?level:"UNKNOWN"}</span></div>
   </div>
   <div className="gauge-labels"><span>LOW</span><span>MODERATE</span><span>HIGH</span><span>CRITICAL</span></div>
 </div>
}
