import {Link} from "react-router-dom";
import {Sparkles,ArrowRight} from "lucide-react";
export default function AskCraiCard(){return <Link to="/ask-crai" className="ask-card"><div className="ask-icon"><Sparkles size={20}/></div><div><div className="eyebrow">CRAI ASSISTANT</div><h3>Understand your field in simple language</h3><p>Ask why CRAI needs evidence, what changed, or how to read an assessment.</p></div><ArrowRight size={18}/></Link>}
