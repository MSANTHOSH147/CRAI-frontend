export default function RiskCard({ event }) {
  const score = Number(event?.risk_score ?? 0);
  const level = event?.risk_level ?? "UNKNOWN";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">
            CURRENT RISK
          </p>

          <h2 className="mt-2 text-5xl font-bold tracking-tight text-slate-900">
            {score.toFixed(2)}
          </h2>
        </div>

        <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
          {level}
        </div>
      </div>

      <div className="mt-6 h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-slate-900 transition-all duration-500"
          style={{
            width: `${Math.min(score, 100)}%`,
          }}
        />
      </div>

      <div className="mt-3 flex justify-between text-xs text-slate-400">
        <span>LOW</span>
        <span>MODERATE</span>
        <span>HIGH</span>
        <span>CRITICAL</span>
      </div>
    </div>
  );
}