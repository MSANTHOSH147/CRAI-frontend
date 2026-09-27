import React from "react";
import { supabase } from "../lib/supabase";

const API_URL = (import.meta.env.VITE_API_URL || "http://127.0.0.1:8000").replace(/\/$/, "");

export const translations = {
  en: { farm: "My Field", fieldStatus: "Field Status", attention: "Attention Needed" },
  ta: { farm: "என் வயல்", fieldStatus: "வயல் நிலை", attention: "கவனம் தேவை" }
};

export function useLanguage() {
  const [language, setLanguage] = React.useState(() => localStorage.getItem("crai-language") || "en");
  const update = (next) => { setLanguage(next); localStorage.setItem("crai-language", next); };
  return { language, setLanguage: update, t: (key) => translations[language]?.[key] || translations.en[key] || key };
}

export function riskLabel(score, fallback) {
  if (score == null || Number.isNaN(Number(score))) return fallback || "UNKNOWN";
  const n = Number(score);
  if (n < 30) return "LOW";
  if (n < 50) return "MODERATE";
  if (n < 70) return "HIGH";
  return "CRITICAL";
}
export function riskTone(level) {
  return String(level || "UNKNOWN").toLowerCase();
}

function normalizeEvent(row) {
  if (!row) return null;
  const score = row.risk_score ?? row.riskScore ?? null;
  return {
    eventId: row.event_id ?? row.id ?? null,
    status: row.status ?? row.event_status ?? "UNKNOWN",
    riskLevel: row.risk_level ?? null,
    riskScore: score == null ? null : Number(score),
    phase: row.phase ?? row.lifecycle_phase ?? null,
    integrityHash: row.integrity_hash ?? null,
    createdAt: row.created_at ?? null,
    updatedAt: row.updated_at ?? row.synced_at ?? null,
    crop: row.crop ?? null,
    growthStage: row.growth_stage ?? null,
    sensorStatus: row.sensor_status ?? null,
  };
}

export async function fetchEvents(limit = 20) {
  const { data, error } = await supabase.from("farm_events").select("*").order("synced_at", { ascending: false, nullsFirst: false }).limit(limit);
  if (error) throw error;
  return (data || []).map(normalizeEvent);
}

export async function fetchLatestEvent() {
  const events = await fetchEvents(1);
  return events[0] || null;
}

function deriveEvidence(event) {
  return {
    visual: { status: "NOT AVAILABLE", summary: "Visual evidence details are not present in the persisted event row." },
    environment: { status: event?.sensorStatus || "NOT AVAILABLE", summary: event?.sensorStatus ? "Sensor state is available from the event record." : "Fresh environmental evidence is not available." },
    temporal: { status: "NOT AVAILABLE", summary: "Temporal contribution details are not present in the current event record." },
    spatial: { status: "NOT AVAILABLE", summary: "Spatial context details are not present in the current event record." }
  };
}

function deriveRecommendation(event) {
  if (!event || !event.riskLevel || event.riskLevel === "UNKNOWN") return { ready: false, message: "CRAI needs more evidence before giving a protective recommendation." };
  if (event.status === "RECOVERING") return { ready: true, title: "Continue checking the field", message: "Conditions are improving. CRAI is continuing to monitor the recovery lifecycle.", steps: [{text:"Review the latest field observation",done:false},{text:"Continue monitoring the affected zone",done:false}] };
  if (event.riskLevel === "HIGH" || event.riskLevel === "CRITICAL") return { ready: true, title: "Inspect the affected zone", message: "CRAI has recorded an elevated field risk. Follow the field assessment and collect fresh evidence.", steps: [{text:"Inspect the affected crop area",done:false},{text:"Check current field conditions",done:false}] };
  return { ready: true, title: "Continue routine monitoring", message: "The current deterministic risk state is low. Continue normal field observation.", steps: [{text:"Keep observing the field",done:false}] };
}

export async function fetchDashboardData() {
  const events = await fetchEvents(20);
  const event = events[0] || null;
  return { event, events, evidence: deriveEvidence(event), recommendation: deriveRecommendation(event) };
}

export async function fetchEventAssessment(eventId) {
  if (!eventId) return { event: null, evidence: {}, trace: [], recommendation: null };
  const { data, error } = await supabase.from("farm_events").select("*").eq("event_id", eventId).maybeSingle();
  if (error) throw error;
  const event = normalizeEvent(data);
  let history = [];
  const h = await supabase.from("risk_history").select("*").eq("event_id", eventId).order("timestamp", { ascending: true });
  if (!h.error) history = h.data || [];
  const trace = history.map((r) => ({ title: `${r.event_status || "UNKNOWN"} · ${r.risk_level || "UNKNOWN"}`, description: `Risk snapshot ${r.risk_score == null ? "unavailable" : Number(r.risk_score).toFixed(2)} / 100`, timestamp: r.timestamp }));
  return { event, evidence: deriveEvidence(event), trace, recommendation: deriveRecommendation(event) };
}

export async function getSupabaseStatus() {
  try {
    const response = await fetch(`${API_URL}/api/supabase/status`);
    if (!response.ok) throw new Error("status request failed");
    return await response.json();
  } catch {
    const { error } = await supabase.from("farm_events").select("event_id").limit(1);
    return { status: error ? "UNAVAILABLE" : "READY", rows_visible: error ? null : 1 };
  }
}

export function subscribeToCraiEvents(onChange) {
  const channel = supabase.channel("crai-dashboard-events")
    .on("postgres_changes", { event: "*", schema: "public", table: "farm_events" }, onChange)
    .on("postgres_changes", { event: "*", schema: "public", table: "risk_history" }, onChange)
    .subscribe();
  return () => { supabase.removeChannel(channel); };
}
