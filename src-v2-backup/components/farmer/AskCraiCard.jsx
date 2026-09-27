import { Link } from "react-router-dom";
import { Sparkles, ChevronRight } from "lucide-react";

export default function AskCraiCard() {
  return (
    <Link to="/ask-crai" className="crai-ask-cta">
      <div className="crai-ask-cta__icon"><Sparkles size={20} /></div>
      <div style={{ flex: 1 }}>
        <div className="crai-title-md">Ask CRAI about your field</div>
        <div className="crai-muted">Get a plain-language explanation of what CRAI found</div>
      </div>
      <ChevronRight size={18} color="var(--crai-ink-muted)" />
    </Link>
  );
}
