// ============================================================
// services/supabase.js
// Centralized Supabase client. This is the ONLY place a
// Supabase client should be constructed in the app.
//
// ASSUMPTION: the existing project already installs
// @supabase/supabase-js and exposes VITE_SUPABASE_URL /
// VITE_SUPABASE_ANON_KEY via Vite env vars. If your existing
// project already has a services/supabase.js with a working
// client, prefer keeping that file and only adopting the
// `getSupabase()` accessor pattern below so the rest of this
// UI keeps working unmodified.
// ============================================================
import { createClient } from "@supabase/supabase-js";

let client = null;
let warned = false;

export function getSupabase() {
  if (client) return client;

  const url = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    if (!warned) {
      console.warn(
        "[CRAI] Supabase env vars missing (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY). " +
        "Persistence + realtime features will report as unavailable."
      );
      warned = true;
    }
    return null;
  }

  client = createClient(url, anonKey, {
    realtime: { params: { eventsPerSecond: 5 } },
  });
  return client;
}

export function isSupabaseConfigured() {
  return Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
}
