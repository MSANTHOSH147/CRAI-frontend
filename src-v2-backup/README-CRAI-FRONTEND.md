# CRAI Production-Grade Frontend v2

This `src/` is a visual/UI replacement for the CRAI frontend. It is designed around the provided farmer SaaS references: warm off-white surfaces, deep forest green, large calm cards, strong hierarchy, responsive farmer-first navigation, and an explicit UNKNOWN/evidence-needed state.

## What is included
- Farmer-first home dashboard with field context, risk, weather, evidence and next action.
- Expert/SIH intelligence workspace with risk, evidence fusion, lifecycle and decision trace.
- Cinematic `/demo` journey explaining OBSERVE → DETECT → REQUEST → FUSE → DECIDE → RECOVER → RESOLVE.
- Responsive mobile bottom navigation.
- CSS-only field/map visual treatment so the UI works without external image assets.
- Existing CRAI service layer is preserved; API contracts must be verified against the real backend before production.

## Important
This package does NOT change the CRAI backend and does NOT invent production evidence. If the API returns no evidence, the farmer UI shows UNKNOWN. `/demo` is the only place with explicit demonstration copy/data.

## Install
If your project already has React Router and lucide-react:

```powershell
npm run dev
```

If needed:

```powershell
npm install react-router-dom lucide-react @supabase/supabase-js
```

## Routes
- `/` Farmer Home
- `/fields` Fields
- `/field/:id` Field assessment
- `/alerts` Alerts
- `/ask-crai` Ask CRAI
- `/expert` Expert / SIH Console
- `/evidence/:id` Evidence package
- `/demo` SIH presentation mode
- `/settings` Settings

## Integration rule
Keep the existing working Supabase client and real CRAI API service if they already exist. Only adapt `src/services/craiData.js` route mappings to the actual FastAPI contracts. Do not replace backend logic with frontend mock logic.
