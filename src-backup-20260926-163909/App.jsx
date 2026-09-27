import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { getLatestEvents } from "./services/craiData";
import { useCraiRealtime } from "./hooks/useCraiRealtime";

import RiskCard from "./components/crai/RiskCard";
import EventTimeline from "./components/crai/EventTimeline";
import LiveEvents from "./components/crai/LiveEvents";
import SystemStatus from "./components/crai/SystemStatus";

export default function App() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] =
    useState(null);

  const [connected, setConnected] =
    useState(false);

  const loadEvents = useCallback(async () => {
    try {
      const data = await getLatestEvents(20);

      setEvents(data);

      setSelectedEvent((current) => {
        if (!current && data.length > 0) {
          return data[0];
        }

        return (
          data.find(
            (event) =>
              event.event_id ===
              current?.event_id
          ) || data[0]
        );
      });
    } catch (error) {
      console.error(
        "Failed to load CRAI events:",
        error
      );
    }
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  useCraiRealtime({
    onEventChange: () => {
      loadEvents();
    },

    onRiskChange: () => {
      loadEvents();
    },
  });

  useEffect(() => {
    setConnected(true);
  }, []);

  return (
    <main className="min-h-screen bg-[#f7f8f6] text-slate-900">
      <div className="mx-auto max-w-[1600px] px-6 py-8 lg:px-10">

        <header className="mb-8 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white">
                C
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  CRAI
                </h1>

                <p className="text-sm text-slate-500">
                  Crop Risk & Adaptive Intelligence
                </p>
              </div>
            </div>
          </div>

          <SystemStatus
            connected={connected}
          />
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <RiskCard
            event={selectedEvent}
          />

          <EventTimeline
            event={selectedEvent}
          />
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <LiveEvents
            events={events}
            selectedEvent={selectedEvent}
            onSelect={setSelectedEvent}
          />

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              EVIDENCE INTELLIGENCE
            </p>

            <h3 className="mt-1 text-xl font-semibold">
              Event evidence package
            </h3>

            {selectedEvent ? (
              <div className="mt-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs text-slate-500">
                      EVENT
                    </p>

                    <p className="mt-1 break-all text-sm font-semibold">
                      {selectedEvent.event_id}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs text-slate-500">
                      INTEGRITY
                    </p>

                    <p className="mt-1 text-sm font-semibold">
                      {selectedEvent.integrity_hash
                        ? "VERIFIED RECORD"
                        : "UNAVAILABLE"}
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-xs text-slate-500">
                    RISK STATE
                  </p>

                  <p className="mt-1 text-lg font-semibold">
                    {selectedEvent.risk_level}
                  </p>

                  <p className="text-sm text-slate-500">
                    Score:{" "}
                    {Number(
                      selectedEvent.risk_score ?? 0
                    ).toFixed(2)}
                  </p>
                </div>
              </div>
            ) : (
              <p className="mt-6 text-sm text-slate-500">
                Select an event to inspect its evidence.
              </p>
            )}
          </div>
        </section>

        <footer className="mt-10 border-t border-slate-200 pt-5 text-xs text-slate-400">
          CRAI Intelligence Layer • Supabase Persistence
          • Realtime Monitoring
        </footer>
      </div>
    </main>
  );
}