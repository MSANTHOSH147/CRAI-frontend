export default function EmptyState({icon:Icon,title,body,action}){
 return <div className="crai-empty">{Icon&&<div className="crai-empty-icon"><Icon size={22}/></div>}<h3>{title}</h3>{body&&<p>{body}</p>}{action}</div>
}
