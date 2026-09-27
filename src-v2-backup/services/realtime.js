// ============================================================
// services/realtime.js
// Thin wrapper around Supabase realtime for live event/alert
// updates, with a graceful polling fallback when realtime or
// Supabase itself is unavailable. Never creates more than one
// interval per subscription and always cleans up on unsubscribe.
// ============================================================
import { getSupabase, isSupabaseConfigured } from "./supabase.js";

/**
 * Subscribe to changes on a table. Returns an unsubscribe function.
 * onChange(payload) is called on every insert/update/delete.
 * If Supabase isn't configured, falls back to calling
 * pollFallback() on the given interval (default 30s).
 */
export function subscribeToTable(table, { onChange, pollFallback, pollIntervalMs = 30000 } = {}) {
  const supabase = getSupabase();

  if (supabase && isSupabaseConfigured()) {
    const channel = supabase
      .channel(`crai-${table}-changes`)
      .on("postgres_changes", { event: "*", schema: "public", table }, (payload) => {
        onChange?.(payload);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  // Fallback: manual polling, cleaned up properly.
  if (typeof pollFallback === "function") {
    const id = setInterval(() => {
      pollFallback();
    }, pollIntervalMs);
    return () => clearInterval(id);
  }

  return () => {};
}
