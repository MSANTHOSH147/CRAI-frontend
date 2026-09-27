const tone=x=>({low:"good",moderate:"warn",high:"high",critical:"critical",resolved:"good",active:"high",recovering:"warn"}[String(x||"").toLowerCase()]||"neutral");
export default function Badge({level,children}){return <span className={`crai-badge crai-badge--${tone(level)}`}><span className="crai-badge__dot"/>{children||level||"Unknown"}</span>}
