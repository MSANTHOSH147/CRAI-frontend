export default function SystemStatus({
  connected,
}) {
  return (
    <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm">
      <span
        className={[
          "h-2.5 w-2.5 rounded-full",
          connected
            ? "bg-emerald-500"
            : "bg-slate-300",
        ].join(" ")}
      />

      <span className="text-sm font-medium text-slate-600">
        {connected
          ? "CRAI SYSTEM ONLINE"
          : "CONNECTING"}
      </span>
    </div>
  );
}