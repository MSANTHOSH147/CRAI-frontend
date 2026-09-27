import {X} from "lucide-react";
export default function Modal({open,onClose,title,children,wide=false}){
 if(!open)return null;
 return <div className="crai-overlay" onClick={onClose}><div className={`crai-modal ${wide?"wide":""}`} onClick={e=>e.stopPropagation()}>
  <div className="modal-head"><div><div className="eyebrow">CRAI</div><h2>{title}</h2></div><button className="icon-button" onClick={onClose} aria-label="Close"><X size={18}/></button></div>
  <div className="modal-body">{children}</div>
 </div></div>
}
