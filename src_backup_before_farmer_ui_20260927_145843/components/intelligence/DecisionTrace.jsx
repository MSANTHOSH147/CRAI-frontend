const steps=[
 ["01","Observe","Crop observation enters the evidence pipeline."],
 ["02","Detect","Available visual/environmental evidence is checked."],
 ["03","Acquire","CRAI requests missing or stale evidence."],
 ["04","Fuse","Evidence vectors are combined."],
 ["05","Decide","Deterministic risk and action gate are evaluated."],
 ["06","Record","Lifecycle and evidence package are persisted."]
];
export default function DecisionTrace({active=5}){
 return <div className="trace-list">{steps.map(([n,t,b],i)=><div className={`trace-row ${i<active?"done":""}`} key={n}><span>{n}</span><div><b>{t}</b><p>{b}</p></div></div>)}</div>
}
