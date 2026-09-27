# CRAI Public Frontend

The public CRAI web interface is a modular React/Vite application for crop observation, field awareness, risk intelligence and agricultural advisory workflows.

## Product Modules

- **Overview** — field and crop intelligence at a glance
- **Observe** — crop observation and image-analysis workflow
- **Field Intelligence** — risk-oriented analysis and AI insights
- **Sensors** — field-sensor observations and device state
- **History** — previous observations and analysis
- **Reports** — structured review and reporting
- **Settings** — application configuration

## Frontend Architecture

```text
src/
├── App.jsx
├── components/
│   ├── common/
│   ├── layout/
│   └── map/
├── hooks/
├── pages/
├── services/
└── utils/