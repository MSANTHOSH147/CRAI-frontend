const API_BASE =
  import.meta.env.VITE_API_URL ||
  `${window.location.protocol}//${window.location.hostname}:8000`;


async function request(path, options = {}) {
  const headers = new Headers(
    options.headers || {}
  );

  if (
    !(options.body instanceof FormData) &&
    !headers.has("Content-Type")
  ) {
    headers.set(
      "Content-Type",
      "application/json"
    );
  }

  let response;

  try {
    response = await fetch(
      `${API_BASE}${path}`,
      {
        ...options,
        headers,
      }
    );
  } catch {
    throw new Error(
      `CRAI backend is unreachable at ${API_BASE}. ` +
      `Start FastAPI on port 8000.`
    );
  }

  const text = await response.text();

  let data = null;

  try {
    data = text
      ? JSON.parse(text)
      : null;
  } catch {
    data = text;
  }

  if (!response.ok) {
    const detail =
      typeof data === "object" &&
      data?.detail
        ? data.detail
        : null;

    throw new Error(
      typeof detail === "string"
        ? detail
        : detail
          ? JSON.stringify(detail)
          : `Request failed (${response.status})`
    );
  }

  return data;
}


export const api = {

  baseUrl: API_BASE,


  // ---------------------------------------------------------
  // SYSTEM
  // ---------------------------------------------------------

  health: () =>
    request("/api/health"),

  aiStatus: () =>
    request("/api/ai/status"),


  // ---------------------------------------------------------
  // LIVE PHONE -> LAPTOP
  // ---------------------------------------------------------

  liveLatest: () =>
    request("/api/live/latest"),

  liveImageUrl: () =>
    `${API_BASE}/api/live/image`,


  // ---------------------------------------------------------
  // OBSERVATIONS
  // ---------------------------------------------------------

  observations: async ({
    farmId = 1,
    zoneId = "",
    limit = 40
  } = {}) => {

    const q =
      new URLSearchParams();

    if (farmId != null) {
      q.set(
        "farm_id",
        String(farmId)
      );
    }

    if (zoneId) {
      q.set(
        "zone_id",
        zoneId
      );
    }

    q.set(
      "limit",
      String(limit)
    );

    return request(
      `/api/observations?${q.toString()}`
    );
  },


  // ---------------------------------------------------------
  // SENSOR READINGS
  // ---------------------------------------------------------

  readings: async () => {

    const d =
      await request(
        "/api/field-sensors/readings"
      );

    return Array.isArray(d)
      ? d
      : (
          d?.value ||
          d?.items ||
          d?.readings ||
          d?.data ||
          []
        );
  },


  pendingRequests: () =>
    request(
      "/api/field-sensors/requests/pending"
    ),


  createSensorRequest: (
    payload
  ) =>
    request(
      "/api/field-sensors/requests",
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    ),


  postSensorReading: (
    payload
  ) =>
    request(
      "/api/field-sensors/readings",
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    ),


  // ---------------------------------------------------------
  // CRAI IMAGE ANALYSIS
  // ---------------------------------------------------------

  analyzeImage: ({
    file,
    zoneId = "A1",
    farmId = 1,
    crop = "Tomato",
    growthStage = "Vegetative",
    advisoryLanguage = "English"
  }) => {

    const form =
      new FormData();

    form.append(
      "file",
      file
    );

    form.append(
      "zone_id",
      zoneId
    );

    form.append(
      "farm_id",
      String(farmId)
    );

    form.append(
      "crop",
      crop
    );

    form.append(
      "growth_stage",
      growthStage
    );

    form.append(
      "advisory_language",
      advisoryLanguage
    );

    return request(
      "/api/analysis/image",
      {
        method: "POST",
        body: form,
      }
    );
  },

};