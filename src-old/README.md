# CRAI 2.0 Frontend

Farmer-first React/Vite frontend for Crop Risk & Adaptive Intelligence.

Modes:
- Farmer
- Expert
- Demo

The frontend reads persisted `farm_events` and `risk_history` from Supabase and subscribes to Realtime updates. It does not calculate or override the CRAI backend risk decision.

Required environment variables:

VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_API_URL=http://127.0.0.1:8000
