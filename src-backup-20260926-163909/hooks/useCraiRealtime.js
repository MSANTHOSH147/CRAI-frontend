import { useEffect } from "react";
import { supabase } from "../lib/supabase";

export function useCraiRealtime({
  onEventChange,
  onRiskChange,
}) {
  useEffect(() => {
    const channel = supabase
      .channel("crai-live-monitoring")

      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "farm_events",
        },
        (payload) => {
          onEventChange?.(payload);
        }
      )

      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "risk_history",
        },
        (payload) => {
          onRiskChange?.(payload);
        }
      )

      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [onEventChange, onRiskChange]);
}