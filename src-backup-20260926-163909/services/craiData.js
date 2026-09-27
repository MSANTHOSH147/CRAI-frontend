import { supabase } from "../lib/supabase";

export async function getLatestEvents(limit = 20) {
  const { data, error } = await supabase
    .from("farm_events")
    .select("*")
    .order("updated_at", {
      ascending: false,
    })
    .limit(limit);

  if (error) {
    throw error;
  }

  return data || [];
}

export async function getRiskHistory(
  eventId,
  limit = 50
) {
  const { data, error } = await supabase
    .from("risk_history")
    .select("*")
    .eq("event_id", eventId)
    .order("timestamp", {
      ascending: true,
    })
    .limit(limit);

  if (error) {
    throw error;
  }

  return data || [];
}