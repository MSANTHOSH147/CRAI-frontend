import {X} from "lucide-react";
export default function Drawer({open,onClose,title,children}){
 if(!open)return null;
 return <div className="crai-overlay" onClick={onClose}><aside className="crai-drawer" onClick={e=>e.stopPropagation()}>
  <div className="drawer-head"><div><div className="eyebrow">CRAI</div><h2>{title}</h2></div><button className="icon-button" onClick={onClose} aria-label="Close"><X size={18}/></button></div>
  <div className="drawer-body">{children}</div>
 </aside></div>
}
