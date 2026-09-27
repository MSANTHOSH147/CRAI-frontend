export default function EventLifecycle({ stages = [] }) {
  return (
    <div className="crai-lifecycle">
      {stages.map((s, i) => (
        <div key={s.key} className={`crai-lifecycle-step${s.done ? " done" : ""}${s.current ? " current" : ""}`}>
          <div className="crai-lifecycle-step__node">
            <div className="crai-lifecycle-step__dot">{i + 1}</div>
            <div className="crai-lifecycle-step__label">{s.label}</div>
            {s.at && <div className="crai-muted" style={{ fontSize: 10.5 }}>{s.at}</div>}
          </div>
          {i < stages.length - 1 && <div className="crai-lifecycle-step__connector" />}
        </div>
      ))}
    </div>
  );
}
