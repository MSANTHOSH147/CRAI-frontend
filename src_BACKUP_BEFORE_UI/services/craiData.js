const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

async function request(path,{method="GET",body,signal}={}){
  const res = await fetch(`${API_BASE}${path}`,{
    method,
    signal,
    headers: body ? {"Content-Type":"application/json"} : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if(!res.ok){
    const error = new Error(`CRAI API ${res.status}: ${path}`);
    error.status=res.status;
    throw error;
  }
  return res.json();
}

function listFrom(raw,key){
  if(Array.isArray(raw)) return raw;
  if(Array.isArray(raw?.[key])) return raw[key];
  return [];
}

function normalizeEvent(raw){
  if(!raw) return null;
  const evidence = raw.evidence || {};
  const sources = raw.evidence_sources;
  const sensorRefs = raw.sensor_references;
  const hasSensors = Boolean(raw.sensors || (Array.isArray(sensorRefs) && sensorRefs.length));
  const sourceNames = Array.isArray(sources) ? sources.map(x=>String(x).toLowerCase()) : [];
  const ev = (key,names)=>{
    const value = evidence[key];
    if(value) return {
      available:Boolean(value.available ?? value.has_data ?? true),
      confidence:typeof value.confidence==="number"?value.confidence:null,
      freshness:value.freshness ?? value.freshness_minutes ?? null,
      summary:value.summary ?? value.finding ?? null,
    };
    const found=sourceNames.some(x=>names.some(n=>x.includes(n)));
    return {available:found,confidence:null,freshness:null,summary:found?"Evidence recorded":"No current evidence"};
  };
  const status=raw.status ?? null;
  let stage=raw.lifecycle?.stage ?? raw.current_stage ?? null;
  if(!stage){
    if(status==="RESOLVED") stage="RESOLVED";
    else if(status==="RECOVERING") stage="RECOVERY";
    else if(status==="ACTIVE" || status==="CONFIRMED" || status==="DETECTED") stage="DURING";
    else stage="BEFORE";
  }
  const stages=["BEFORE","DURING","RECOVERY","AFTER","RESOLVED"];
  const idx=stages.indexOf(stage);
  const riskScore=typeof raw.risk_score==="number"?raw.risk_score:null;

  // Backend event records store environmental readings in
  // sensor_references[]. Use the newest available reading.
  const latestSensor =
    raw.sensors ||
    (Array.isArray(sensorRefs) && sensorRefs.length
      ? sensorRefs[sensorRefs.length - 1]
      : null);

  return {
    eventId:raw.event_id ?? raw.id ?? null,
    farmId:raw.farm_id ?? null,
    zoneId:raw.zone_id ?? null,
    fieldName:raw.field_name ?? raw.farm_name ?? "My Field",
    zoneName:raw.zone_name ?? (raw.zone_id?`Zone ${raw.zone_id}`:null),
    crop:raw.crop ?? null,
    cropStage:raw.crop_stage ?? null,
    status,
    riskLevel:raw.risk_level ?? null,
    riskScore,
    decisionReady:Boolean(raw.decision_ready ?? riskScore!==null),
    decision:raw.decision ?? null,
    action:typeof (raw.action ?? raw.recommendation) === "string" ? (raw.action ?? raw.recommendation) : ((raw.action?.recommendation ?? raw.action?.message) || null),
    evidence:{
      visual:ev("visual",["visual","image","crop"]),
      environmental:ev("environmental",["sensor","environment","dht","soil","weather"]),
      temporal:ev("temporal",["temporal","history","trend"]),
      spatial:ev("spatial",["spatial","location","zone","gps"]),
    },
    sensors:latestSensor ? {
      available:true,
      source:latestSensor.source ?? null,
      deviceId:latestSensor.device_id ?? null,
      readingId:latestSensor.reading_id ?? null,
      temperature:latestSensor.temperature ?? latestSensor.temp ?? null,
      humidity:latestSensor.humidity ?? null,
      soilMoisture:latestSensor.soil_moisture ?? latestSensor.soilMoisture ?? null,
      rain:latestSensor.rain ?? latestSensor.rainfall ?? null,
      soilTemperature:latestSensor.soil_temperature ?? null,
      soilPh:latestSensor.soil_ph ?? null,
      soilEc:latestSensor.soil_ec ?? null,
      leafWetness:latestSensor.leaf_wetness ?? null,
      battery:latestSensor.battery ?? null,
      latitude:latestSensor.latitude ?? null,
      longitude:latestSensor.longitude ?? null,
      updatedAt:latestSensor.timestamp ?? latestSensor.updated_at ?? null,
      freshness:latestSensor.freshness ?? null,
      ageMinutes:latestSensor.age_minutes ?? null,
      usable:latestSensor.usable ?? true,
    } : {
      available:false,
      source:null,
      deviceId:null,
      readingId:null,
      temperature:null,
      humidity:null,
      soilMoisture:null,
      rain:null,
      updatedAt:null,
      freshness:null,
      ageMinutes:null,
      usable:false,
    },
    lifecycle:{
      stage,
      stages:stages.map((key,i)=>({key,label:key,done:idx>=0 && i<idx,current:i===idx,at:raw.lifecycle?.timestamps?.[key]??null}))
    },
    beforeState:raw.before_state ?? null,
    duringState:raw.during_state ?? null,
    afterState:raw.after_state ?? null,
    integrity:{
      hash:raw.integrity_hash ?? raw.integrity?.hash ?? null,
      verified:Boolean(raw.integrity?.verified),
    },
    createdAt:raw.created_at ?? raw.started_at ?? null,
    updatedAt:raw.updated_at ?? null,
    advisory:raw.advisory ?? raw.analysis?.advisory ?? null,
    raw,
  };
}

export async function fetchActiveEvents(opts={}){
  const raw=await request("/api/events/active",opts);
  return listFrom(raw,"events").map(normalizeEvent);
}

export async function fetchEvents(farmId=1,zoneId="A1",limit=10,opts={}){
  const q=new URLSearchParams({farm_id:String(farmId),zone_id:String(zoneId),limit:String(limit)});
  const raw=await request(`/api/events?${q}`,opts);
  return listFrom(raw,"events").map(normalizeEvent);
}

export async function fetchCurrentEvent(farmId=1,zoneId="A1",opts={}){
  const active=await fetchActiveEvents(opts);
  const match=active.find(e=>String(e.farmId)===String(farmId)&&String(e.zoneId)===String(zoneId));
  if(match) return match;
  const history=await fetchEvents(farmId,zoneId,1,opts);
  return history[0] ?? null;
}

export async function fetchEventDetail(eventId,opts={}){
  const raw=await request(`/api/events/${encodeURIComponent(eventId)}`,opts);
  return normalizeEvent(raw);
}

export async function fetchEventTimeline(eventId,opts={}){
  return request(`/api/events/${encodeURIComponent(eventId)}/timeline`,opts);
}

export async function fetchEvidencePackage(eventId,opts={}){
  return request(`/api/events/${encodeURIComponent(eventId)}/evidence`,opts);
}

export async function verifyEvidence(eventId,opts={}){
  return request(`/api/evidence/verify?event_id=${encodeURIComponent(eventId)}`,{...opts,method:"POST"});
}

export async function fetchSystemStatus(opts={}){
  const [health,supabase]=await Promise.allSettled([
    request("/api/health",opts),
    request("/api/supabase/status",opts),
  ]);
  return {
    backend:health.status==="fulfilled" ? "online" : "unavailable",
    supabase:supabase.status==="fulfilled" ? supabase.value : null,
  };
}

export async function fetchAlerts(opts={}){
  const active=await fetchActiveEvents(opts);
  return active.map(e=>({
    id:e.eventId,severity:(e.riskLevel||"info").toLowerCase(),
    title:e.riskLevel ? `${e.riskLevel} field risk` : "Field event",
    body:e.action || e.duringState || "CRAI recorded an event from field evidence.",
    fieldName:e.fieldName,zoneName:e.zoneName,eventId:e.eventId,
    createdAt:e.createdAt,status:e.status,riskScore:e.riskScore
  }));
}

export async function fetchAdvisoryStatus(opts={}){
  return request("/api/advisory/status",opts);
}


export async function analyzeFieldImage({
  file,
  farmId = 1,
  zoneId = "A1",
  crop = "Tomato",
  growthStage = "Vegetative",
  advisoryLanguage = "English",
  signal,
} = {}) {
  if (!file) {
    throw new Error("No crop image selected.");
  }

  const form = new FormData();
  form.append("file", file);
  form.append("farm_id", String(farmId));
  form.append("zone_id", String(zoneId));
  form.append("crop", crop);
  form.append("growth_stage", growthStage);
  form.append("advisory_language", advisoryLanguage);

  const response = await fetch(
    `${API_BASE}/api/analysis/image`,
    {
      method: "POST",
      body: form,
      signal,
    }
  );

  const raw = await response.text();

  let data = null;
  try {
    data = raw ? JSON.parse(raw) : null;
  } catch {
    throw new Error(
      `CRAI returned an invalid response (${response.status}).`
    );
  }

  if (!response.ok) {
    throw new Error(
      data?.detail ||
      data?.message ||
      `Field image analysis failed (${response.status}).`
    );
  }

  return data;
}

export async function askCrai(
  message,
  {
    farmId = 1,
    zoneId = "A1",
    crop = "Tomato",
    growthStage = "Vegetative",
    language = "en",
    context = {},
  } = {}
) {
  const baseUrl =
    import.meta.env.VITE_API_BASE_URL ||
    "http://127.0.0.1:8000";

  const response = await fetch(
    `${baseUrl}/api/advisory/ask`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message:
          message ||
          "Explain my current crop condition.",

        language,

        farm_id: farmId,
        zone_id: zoneId,
        crop,
        growth_stage: growthStage,

        context,
      }),
    }
  );

  const data =
    await response.json().catch(
      () => ({})
    );

  if (!response.ok) {
    throw new Error(
      `CRAI advisory request failed (${response.status}): ${
        data?.detail ||
        "Unknown backend error"
      }`
    );
  }

  return {
    ...data,

    answer:
      data?.answer ||
      data?.advisory ||
      data?.message ||
      null,
  };
}

export async function runSimulatorStep({deviceId="CRAI-SIM-001",farmId=1,zoneId="A1",steps=1,scenario}={},opts={}){
  return request("/api/simulator/step",{...opts,method:"POST",body:{
    device_id:deviceId,farm_id:farmId,zone_id:zoneId,steps,
    ...(scenario?{scenario}:{}),
  }});
}

export async function evaluateSimulator(payload,opts={}){
  return request("/api/simulator/evaluate",{...opts,method:"POST",body:payload});
}

export {API_BASE, normalizeEvent};




/*
 * Backward-compatible alias used by EvidencePackage.jsx.
 * The backend verification endpoint is already implemented
 * by verifyEvidence().
 */
export async function verifyEvidencePackage(eventId, opts = {}) {
  return verifyEvidence(eventId, opts);
}
