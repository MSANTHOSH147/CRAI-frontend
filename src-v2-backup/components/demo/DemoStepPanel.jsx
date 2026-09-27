export default function DemoStepPanel({ step, children }) {
  return (
    <div className="crai-demo-stage">
      <div className="crai-demo-stage__label">Step {step.number} · {step.key}</div>
      <h2 className="crai-demo-stage__title">{step.title}</h2>
      <p className="crai-demo-stage__body">{step.body}</p>
      <div className="crai-mt-16">{children}</div>
    </div>
  );
}
