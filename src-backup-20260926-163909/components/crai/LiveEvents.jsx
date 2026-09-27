export default function LiveEvents({
  events = [],
  selectedEvent,
  onSelect,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 p-6">
        <p className="text-sm font-medium text-slate-500">
          FARM EVENTS
        </p>

        <h3 className="mt-1 text-xl font-semibold text-slate-900">
          Live event stream
        </h3>
      </div>

      <div className="divide-y divide-slate-100">
        {events.length === 0 ? (
          <div className="p-6 text-sm text-slate-500">
            No events available.
          </div>
        ) : (
          events.map((event) => (
            <button
              key={event.event_id}
              onClick={() => onSelect?.(event)}
              className={[
                "w-full p-5 text-left transition",
                selectedEvent?.event_id === event.event_id
                  ? "bg-slate-50"
                  : "hover:bg-slate-50",
              ].join(" ")}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900">
                  {event.event_id}
                </span>

                <span className="text-xs font-semibold text-slate-500">
                  {event.status}
                </span>
              </div>

              <div className="mt-2 flex items-center justify-between">
                <span className="text-sm text-slate-500">
                  {event.risk_level}
                </span>

                <span className="text-sm font-semibold text-slate-900">
                  {Number(event.risk_score ?? 0).toFixed(2)}
                </span>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}