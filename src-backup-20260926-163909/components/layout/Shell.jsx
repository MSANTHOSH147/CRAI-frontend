import React from "react";
import {Icon,StatusDot} from "../common/UI";
const NAV=[
 ["overview","Overview","home"],["observe","Observe","camera"],["intelligence","Field Intelligence","shield"],["sensors","Sensors","chip"],["history","History","history"],["reports","Reports","report"],["settings","Settings","settings"]
];
const LABELS={overview:"Overview",observe:"Observe",intelligence:"Field Intelligence",sensors:"Sensors",history:"History",reports:"Reports",settings:"Settings"};
export function Shell({page,setPage,system,children,onRefresh,refreshing}){
 const [mobile,setMobile]=React.useState(false);
 React.useEffect(()=>setMobile(false),[page]);
 return <div className="app-shell">
   <aside className={`sidebar ${mobile?"open":""}`}>
    <div className="brand"><div className="brand-mark"><Icon name="leaf" size={27}/></div><div><strong>CRAAI</strong><span>Adaptive Edge Intelligence</span></div></div>
    <div className="nav-label">FIELD OPERATIONS</div>
    <nav>{NAV.map(([id,label,icon])=><button key={id} className={page===id?"active":""} onClick={()=>setPage(id)}><Icon name={icon}/><span>{label}</span>{page===id&&<i className="nav-active-dot"/>}</button>)}</nav>
    <div className="edge-card">
      <div className="edge-head"><StatusDot label="EDGE READY"/><span>OFFLINE-FIRST</span></div>
      <div className="edge-host"><Icon name="chip" size={17}/><span>Raspberry Pi / Laptop</span></div>
      <div className="edge-grid"><div><small>Vision AI</small><b className={system.ai?"on":""}>{system.ai?"READY":"LOCAL"}</b></div><div><small>Ollama</small><b>LOCAL</b></div><div><small>ESP32</small><b className={system.sensor?"on":"muted"}>{system.sensor?"ONLINE":"OFFLINE"}</b></div><div><small>Offline mode</small><b>ACTIVE</b></div></div>
    </div>
    <div className="sidebar-foot"><span>CRAAI</span><small>Decision system v1.5</small></div>
   </aside>
   {mobile&&<button className="mobile-overlay" onClick={()=>setMobile(false)} aria-label="Close navigation"/>}
   <div className="main">
    <header className="topbar"><button className="mobile-menu" onClick={()=>setMobile(true)}><span/><span/><span/></button><div className="crumb"><span>CRAAI</span><b>›</b><strong>{LABELS[page]}</strong></div><div className="top-actions"><StatusDot label={system.backend?"System operational":"Backend offline"} good={system.backend}/><button className="icon-btn" onClick={onRefresh} disabled={refreshing} title="Refresh evidence"><Icon name="refresh"/></button><button className="icon-btn" title="Notifications"><Icon name="bell"/></button><div className="avatar">F</div></div></header>
    <div className="page-scroll">{children}</div>
   </div>
 </div>
}
export {NAV};
