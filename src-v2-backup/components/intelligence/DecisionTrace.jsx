const DEFAULT_STEPS = [
  "Observation received",
  "Visual evidence evaluated",
  "Environmental evidence checked",
  "Missing evidence detected",
  "Evidence request dispatched",
  "Sensor response received",
  "Fusion evaluated",
  "Risk decision established",
  "Advisory generated",
  "Event persisted",
];

export default function DecisionTrace({ steps, activeIndex = -1 }) {
  const list = steps && steps.length ? steps : DEFAULT_STEPS.map((title) => ({ title }));
  return (
    <div className="crai-trace">
      {list.map((step, i) => (
        <div key={i} className={`crai-trace-step${i <= activeIndex ? " active" : ""}`}>
          <div className="crai-flex-col crai-items-center">
            <div className="crai-trace-step__num">{String(i + 1).padStart(2, "0")}</div>
            {i < list.length - 1 && <div className="crai-trace-step__rail" />}
          </div>
          <div className="crai-trace-step__body">
            <div className="crai-trace-step__title">{step.title}</div>
            {step.meta && <div className="crai-trace-step__meta">{step.meta}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}
