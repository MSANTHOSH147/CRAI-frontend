# CRAI Production Frontend v4

V4 keeps the farmer-first SaaS UI but restores the intelligence pieces that were missing from the previous frontend.

## Added/fixed
- Fixed Topbar field-menu runtime crash (`MapPin` import).
- Added `/fields/:id` alias alongside `/field/:id` so both navigation forms work.
- Added Qwen3 1.7B advisory status through verified `/api/advisory/status`. Qwen is displayed as explanation/advisory only.
- Ask CRAI passes the selected UI language as `advisory_language` context.
- Added English/Tamil UI translations across navigation and major farmer/expert surfaces.
- Added Qwen advisory card to Farmer Home and Expert Console.
- Kept deterministic risk ownership in FastAPI; frontend never calculates or overrides risk.
- Integrated SIH Demo visually with the CRAI SaaS system while retaining a presentation-mode layout.
- Preserved explicit UNKNOWN/evidence-gated states.

## Backend contracts used
- GET `/api/health`
- GET `/api/advisory/status`
- GET `/api/supabase/status`
- GET `/api/events/active`
- GET `/api/events?farm_id=...&zone_id=...`
- GET `/api/events/{event_id}`
- GET `/api/events/{event_id}/timeline`
- GET `/api/events/{event_id}/evidence`
- POST `/api/evidence/verify?event_id=...`
- POST `/api/simulator/step`
- POST `/api/assistant/ask` (assistant integration)

## Language
English and Tamil are available in the frontend. The selected language is also passed into the advisory/assistant context; the backend remains authoritative for advisory generation.
