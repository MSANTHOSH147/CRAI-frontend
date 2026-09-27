import { ArrowRight } from "lucide-react";
import Button from "../common/Button.jsx";

export default function NextActionCard({ recommendation }) {
  return (
    <div className="crai-action-card">
      <div>
        <div className="crai-action-card__title">
          {recommendation || "Collect fresh field evidence"}
        </div>
        <div className="crai-action-card__body">
          {recommendation
            ? "This is CRAI's current evidence-backed recommendation for your field."
            : "CRAI needs more recent evidence before it can recommend a specific action."}
        </div>
      </div>
      <Button variant="secondary" style={{ background: "rgba(255,255,255,0.16)", color: "#fff" }}>
        View details <ArrowRight size={15} />
      </Button>
    </div>
  );
}
