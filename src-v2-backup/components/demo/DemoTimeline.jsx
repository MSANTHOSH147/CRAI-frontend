export default function DemoTimeline({ steps, currentIndex, onSelect }) {
  return (
    <div className="crai-demo-rail">
      {steps.map((step, i) => (
        <button
          key={step.key}
          type="button"
          className={`crai-demo-rail__step${i < currentIndex ? " done" : ""}${i === currentIndex ? " current" : ""}`}
          onClick={() => onSelect?.(i)}
          title={step.title}
        >
          {i + 1}
        </button>
      ))}
    </div>
  );
}
