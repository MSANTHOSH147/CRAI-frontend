const phases = [
  "BEFORE",
  "DURING",
  "RECOVERY",
  "AFTER",
];

export default function EventTimeline({ event }) {
  const currentPhase = event?.after_phase
    ? "AFTER"
    : event?.during_phase || "BEFORE";

  const currentIndex =
    phases.indexOf(currentPhase);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <p className="text-sm font-medium text-slate-500">
          EVENT LIFECYCLE
        </p>

        <h3 className="mt-1 text-xl font-semibold text-slate-900">
          Evidence progression
        </h3>
      </div>

      <div className="flex items-center gap-2">
        {phases.map((phase, index) => {
          const completed =
            index <= currentIndex;

          return (
            <div
              key={phase}
              className="flex flex-1 items-center"
            >
              <div
                className={[
                  "flex h-10 w-full items-center justify-center rounded-xl text-xs font-semibold transition-all",
                  completed
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-400",
                ].join(" ")}
              >
                {phase}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 flex items-center justify-between text-sm">
        <span className="text-slate-500">
          Status
        </span>

        <span className="font-semibold text-slate-900">
          {event?.status || "UNKNOWN"}
        </span>
      </div>
    </div>
  );
}