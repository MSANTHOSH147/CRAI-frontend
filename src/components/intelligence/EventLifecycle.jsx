export default function EventLifecycle({stages=[]}){
 return <div className="lifecycle">{stages.map((s,i)=><div key={s.key} className={`life ${s.done?"done":""} ${s.current?"current":""}`}><div className="life-node">{i+1}</div><b>{s.label}</b>{i<stages.length-1&&<span className="life-line"/>}</div>)}</div>
}
