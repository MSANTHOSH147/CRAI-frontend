import {NavLink} from "react-router-dom";
import {Home,MapPinned,Bell,MessageCircle,MoreHorizontal} from "lucide-react";
const items=[["/","Home",Home],["/fields","Fields",MapPinned],["/alerts","Alerts",Bell],["/ask-crai","Ask",MessageCircle],["/settings","More",MoreHorizontal]];
export default function MobileBottomNav(){return <nav className="mobile-nav">{items.map(([to,label,Icon])=><NavLink key={to} to={to} end={to==="/"}><Icon size={19}/><span>{label}</span></NavLink>)}</nav>}
