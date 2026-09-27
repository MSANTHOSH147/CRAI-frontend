// ============================================================
// services/craiData.js
// Single source of truth for talking to the CRAI FastAPI
// backend and normalizing its responses into the frontend
// data contract every component in this app expects.
//
// IMPORTANT — INTEGRATION NOTE:
// The exact endpoint paths below (API_ROUTES) are best-guess
// placeholders based on the CRAI architecture description
// (events, risk, evidence, lifecycle, sensors, ask). This file
// was written without access to the real FastAPI route table.
// Before shipping, confirm each path against your actual
// backend (main.py / routers/*) and adjust API_ROUTES only —
// every component consumes the normalized shape below, so a
// path change here never touches UI code.
// ============================================================

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const API_ROUTES = {
  currentEvent: (farmId, zoneId) => `/api/events/current?farm_id=${farmId}&zone_id=${zoneId}`,
  fields: () => `/api/fields`,
  fieldDetail: (fieldId) => `/api/fields/${fieldId}`,
  alerts: () => `/api/alerts`,
  evidencePackage: (eventId) => `/api/events/${eventId}/evidence`,
  eventDetail: (eventId) => `/api/events/${eventId}`,
  systemStatus: () => `/api/system/status`,
  askCrai: () => `/api/assistant/ask`,
};

// ---------- low-level fetch helper ----------
async function apiGet(path, { signal } = {}) {
  const res = await fetch(`${API_BASE}${path}`, { signal });
  if (!res.ok) {
    const err = new Error(`CRAI API ${path} failed with ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

async function apiPost(path, body, { signal } = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });
  if (!res.ok) {
    const err = new Error(`CRAI API ${path} failed with ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

// ============================================================
// Normalization — the frontend data contract.
// Every consumer of backend data goes through this shape:
//
// {
//   eventId, farmId, zoneId, fieldName, zoneName, crop,
//   status, riskLevel, riskScore, decisionReady,
//   evidence: { visual, environmental, temporal, spatial },
//     each -> { available, freshness, confidence, summary }
//   lifecycle: { stage, stages: [{key,label,done,current,at}] },
//   action: { recommendation, message },
//   sensors: { available, temperature, humidity, soilMoisture, rain, updatedAt },
//   createdAt, updatedAt,
//   integrity: { hash, verified }
// }
//
// Any field the backend doesn't provide is left `null` /
// `available: false` rather than defaulted to a "safe-looking"
// value — this is what lets the UI render UNKNOWN /
// evidence-needed states instead of manufacturing certainty.
// ============================================================

const LIFECYCLE_STAGES = ["BEFORE", "DURING", "RECOVERY", "AFTER", "RESOLVED"];

function normalizeEvidenceSource(raw) {
  if (!raw) return { available: false, freshness: null, confidence: null, summary: null };
  return {
    available: Boolean(raw.available ?? raw.hasData ?? false),
    freshness: raw.freshness ?? raw.freshness_minutes ?? null,
    confidence: typeof raw.confidence === "number" ? raw.confidence : null,
    summary: raw.summary ?? raw.finding ?? null,
  };
}

function normalizeLifecycle(raw) {
  const currentStage = raw?.stage ?? raw?.current_stage ?? null;
  const idx = LIFECYCLE_STAGES.indexOf(currentStage);
  return {
    stage: currentStage,
    stages: LIFECYCLE_STAGES.map((key, i) => ({
      key,
      label: key,
      done: idx >= 0 && i < idx,
      current: idx >= 0 && i === idx,
      at: raw?.timestamps?.[key] ?? null,
    })),
  };
}

export function normalizeEvent(raw) {
  if (!raw) return null;
  const evidence = raw.evidence || {};
  return {
    eventId: raw.event_id ?? raw.id ?? null,
    farmId: raw.farm_id ?? null,
    zoneId: raw.zone_id ?? null,
    fieldName: raw.field_name ?? raw.farm_name ?? null,
    zoneName: raw.zone_name ?? null,
    crop: raw.crop ?? null,
    status: raw.status ?? null,
    riskLevel: raw.risk_level ?? null,
    riskScore: typeof raw.risk_score === "number" ? raw.risk_score : null,
    decisionReady: Boolean(raw.decision_ready),
    evidence: {
      visual: normalizeEvidenceSource(evidence.visual),
      environmental: normalizeEvidenceSource(evidence.environmental),
      temporal: normalizeEvidenceSource(evidence.temporal),
      spatial: normalizeEvidenceSource(evidence.spatial),
    },
    lifecycle: normalizeLifecycle(raw.lifecycle),
    action: {
      recommendation: raw.action?.recommendation ?? raw.recommendation ?? null,
      message: raw.action?.message ?? null,
    },
    sensors: raw.sensors
      ? {
          available: Boolean(raw.sensors.available ?? true),
          temperature: raw.sensors.temperature ?? null,
          humidity: raw.sensors.humidity ?? null,
          soilMoisture: raw.sensors.soil_moisture ?? null,
          rain: raw.sensors.rain ?? null,
          updatedAt: raw.sensors.updated_at ?? null,
        }
      : { available: false, temperature: null, humidity: null, soilMoisture: null, rain: null, updatedAt: null },
    createdAt: raw.created_at ?? null,
    updatedAt: raw.updated_at ?? null,
    integrity: {
      hash: raw.integrity?.hash ?? null,
      verified: Boolean(raw.integrity?.verified),
    },
  };
}

function normalizeField(raw) {
  return {
    fieldId: raw.field_id ?? raw.id,
    name: raw.name ?? raw.field_name,
    zone: raw.zone ?? raw.zone_name ?? null,
    crop: raw.crop ?? null,
    plantingDate: raw.planting_date ?? null,
    riskLevel: raw.risk_level ?? null,
    imageUrl: raw.image_url ?? null,
  };
}

function normalizeAlert(raw) {
  return {
    id: raw.id ?? raw.alert_id,
    severity: raw.severity ?? raw.risk_level ?? "info",
    title: raw.title ?? raw.headline ?? "Field alert",
    body: raw.body ?? raw.message ?? null,
    fieldName: raw.field_name ?? null,
    createdAt: raw.created_at ?? null,
    eventId: raw.event_id ?? null,
  };
}

// ---------- public API ----------

export async function fetchCurrentEvent(farmId, zoneId, opts) {
  const raw = await apiGet(API_ROUTES.currentEvent(farmId, zoneId), opts);
  return normalizeEvent(raw);
}

export async function fetchEventDetail(eventId, opts) {
  const raw = await apiGet(API_ROUTES.eventDetail(eventId), opts);
  return normalizeEvent(raw);
}

export async function fetchFields(opts) {
  const raw = await apiGet(API_ROUTES.fields(), opts);
  const list = Array.isArray(raw) ? raw : raw.fields || [];
  return list.map(normalizeField);
}

export async function fetchFieldDetail(fieldId, opts) {
  const raw = await apiGet(API_ROUTES.fieldDetail(fieldId), opts);
  return normalizeField(raw);
}

export async function fetchAlerts(opts) {
  const raw = await apiGet(API_ROUTES.alerts(), opts);
  const list = Array.isArray(raw) ? raw : raw.alerts || [];
  return list.map(normalizeAlert);
}

export async function fetchEvidencePackage(eventId, opts) {
  const raw = await apiGet(API_ROUTES.evidencePackage(eventId), opts);
  return raw; // shown via structured tabs in EvidencePage — kept close to backend shape intentionally
}

export async function fetchSystemStatus(opts) {
  try {
    return await apiGet(API_ROUTES.systemStatus(), opts);
  } catch (e) {
    return { backend: "unavailable" };
  }
}

// Ask CRAI — routed to the backend's LLM assistant endpoint.
// The assistant explains evidence/risk; it never computes the
// deterministic risk score itself.
export async function askCrai(message, context, opts) {
  return apiPost(API_ROUTES.askCrai(), { message, context }, opts);
}

export { API_BASE };
