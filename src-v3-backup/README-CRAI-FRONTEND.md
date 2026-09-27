# CRAI Production Frontend v3

This `src/` is a replacement for the previous CRAI frontend scaffold.

## What changed

- Farmer-first SaaS UI with light agricultural visual system.
- Functional navigation and field selector.
- Real CRAI event loading through the verified event endpoints.
- Real backend/Supabase status display.
- Realtime refresh for `farm_events` and `risk_history` when Supabase is configured.
- Evidence cards open detail drawers.
- Crop-check modal with local image preview and explicit backend-upload limitation.
- Alerts derived from active CRAI events.
- Ask CRAI has a production chat UI and uses the existing assistant contract if available.
- Field assessment explains risk, evidence fusion, sensors, lifecycle, decision trace and integrity.
- Expert console separates technical intelligence from the farmer UI.
- SIH Demo is a 7-step interactive story:
  OBSERVE → DETECT → REQUEST → FUSE → DECIDE → RECOVER → RESOLVE.
- Demo keyboard controls: Left/Right/R.
- Missing evidence remains UNKNOWN; production UI does not fabricate readings.

## Verified backend contracts used

The frontend uses the CRAI routes that were verified during the current project work:

- `GET /api/health`
- `GET /api/supabase/status`
- `GET /api/events/active`
- `GET /api/events?farm_id=1&zone_id=A1&limit=...`
- `GET /api/events/{event_id}`
- `GET /api/events/{event_id}/timeline`
- `GET /api/events/{event_id}/evidence`
- `POST /api/evidence/verify?event_id={event_id}`
- `POST /api/simulator/step` (SIH demo evidence-acquisition interaction)

`/api/assistant/ask` is retained as the assistant integration contract used by the previous frontend. If the backend does not expose it, the UI shows an explicit unavailable message instead of fabricating an answer.

## Install

Existing CRAI frontend:

```powershell
npm install react-router-dom lucide-react @supabase/supabase-js
npm run dev
```

No new UI framework is required. The UI is plain CSS.

## Environment

```text
VITE_API_BASE_URL=http://127.0.0.1:8000
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

## Routes

- `/` Farmer Home
- `/fields` My Fields
- `/field/:id` Field Assessment
- `/alerts` Alerts & Events
- `/ask-crai` Ask CRAI
- `/expert` Expert Console
- `/evidence/:id` Evidence Package
- `/demo` SIH Demo
- `/settings` Settings

## Important architecture rule

The frontend displays CRAI decisions; it does not calculate risk.

The deterministic intelligence layer remains in FastAPI.

Qwen/assistant functionality is explanation/advisory only.

Supabase is persistence/realtime infrastructure.

Demo data is isolated to `/demo` and explicitly labelled.
