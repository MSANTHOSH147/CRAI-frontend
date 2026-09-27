import {NavLink} from "react-router-dom";
import {LayoutDashboard,MapPinned,Bell,MessageCircle,ShieldCheck,PlayCircle,Settings,Leaf} from "lucide-react";
const items=[
 ["/","Home",LayoutDashboard],["/fields","My Fields",MapPinned],["/alerts","Alerts",Bell],
 ["/ask-crai","Ask CRAI",MessageCircle],["/expert","Expert",ShieldCheck],["/demo","SIH Demo",PlayCircle]
];
export default function Sidebar(){
 return <aside className="sidebar">
  <div className="brand"><div className="brand-mark"><Leaf size={21}/></div><div><b>CRAI</b><span>Adaptive Field Intelligence</span></div></div>
  <nav className="side-nav">{items.map(([to,label,Icon])=><NavLink key={to} to={to} end={to==="/"}><Icon size={18}/><span>{label}</span></NavLink>)}</nav>
  <div className="sidebar-bottom"><NavLink to="/settings"><Settings size={18}/><span>Settings</span></NavLink><div className="system-mini"><i/>CRAI intelligence online</div></div>
 </aside>
}
