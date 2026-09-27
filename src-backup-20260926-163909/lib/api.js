const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000";

async function request(path, options = {}) {
  const response = await fetch(
    `${API_URL}${path}`,
    {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      ...options,
    }
  );

  if (!response.ok) {
    const text = await response.text();

    throw new Error(
      `CRAI API ${response.status}: ${text}`
    );
  }

  return response.json();
}

export const craiApi = {
  supabaseStatus() {
    return request("/api/supabase/status");
  },

  syncEvent(eventId) {
    return request(
      `/api/supabase/sync/event/${eventId}`,
      {
        method: "POST",
      }
    );
  },

  evidenceUrl(eventId) {
    return request(
      `/api/supabase/storage/event/${eventId}/url`
    );
  },
};