import {NavLink} from "react-router-dom";
import {useFieldSelection} from "../../app/FieldContext.jsx";
import {t} from "../../app/i18n.js";
import {LayoutDashboard,MapPinned,Bell,MessageCircle,ShieldCheck,PlayCircle,Settings,Leaf} from "lucide-react";
const items=[["/","home",LayoutDashboard],["/fields","fields",MapPinned],["/alerts","alerts",Bell],["/ask-crai","ask",MessageCircle],["/expert","expert",ShieldCheck],["/demo","demo",PlayCircle]];
export default function Sidebar(){
 const {language}=useFieldSelection();
 return <aside className="sidebar">
  <div className="brand"><div className="brand-mark"><Leaf size={21}/></div><div><b>CRAI</b><span>Adaptive Field Intelligence</span></div></div>
  <nav className="side-nav">{items.map(([to,key,Icon])=><NavLink key={to} to={to} end={to==="/"}><Icon size={18}/><span>{t(language,key)}</span></NavLink>)}</nav>
  <div className="sidebar-bottom"><NavLink to="/settings"><Settings size={18}/><span>{t(language,"settings")}</span></NavLink><div className="system-mini"><i/>CRAI intelligence online</div></div>
 </aside>
}
