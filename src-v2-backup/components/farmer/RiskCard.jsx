import RiskGauge from "../intelligence/RiskGauge.jsx";
import Card from "../common/Card.jsx";

export default function RiskCard({ score, level, decisionReady }) {
  const known = decisionReady && typeof score === "number";
  return (
    <Card>
      <div className="crai-eyebrow">Field risk</div>
      <RiskGauge score={score} level={level} decisionReady={decisionReady} />
      <p className="crai-body" style={{ textAlign: "center", marginTop: 6 }}>
        {known
          ? `CRAI's current confidence-backed assessment for this field.`
          : "Fresh evidence is needed before CRAI can make a risk decision."}
      </p>
    </Card>
  );
}
