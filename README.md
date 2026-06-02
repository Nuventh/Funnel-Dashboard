# Funnel Dashboard

A small funnel analytics app for popup campaigns. It shows **step-level**
performance so a marketer can see exactly where a multi-step popup loses
visitors — not just the final conversion number.

- **Backend** (`/backend`) — Node.js + Express. Owns every calculation and
  serves it over a documented (Swagger) API.
- **Frontend** (`/frontend`) — Vue 3 + Vite. Visualizes the data; does no math.

See `WRITEUP.md` for the design rationale, scope decisions, and AI usage.

## Quick start (Docker)

From this folder:

```bash
docker compose up --build
```

- App: <http://localhost:8080>
- API + Swagger UI: <http://localhost:3000/api-docs>

## Run locally (without Docker)

Two terminals:

```bash
# 1) backend
cd backend
npm install
npm start          # http://localhost:3000

# 2) frontend
cd frontend
npm install
npm run dev        # http://localhost:5173 (proxies /api to the backend)
```

## Tests

```bash
cd backend
npm test           # 24 Jest + Supertest tests

cd ../frontend
npm test           # 12 Vitest tests (format helpers + components)
```

## What it does

- Lists campaigns with overall conversion rate.
- For a selected campaign, shows a funnel that narrows step by step, with
  **visitors per step** (`views → proceeds`), cumulative conversion per step,
  and the **biggest drop-off highlighted**.
- KPI tiles (visitors, conversions, lost visitors, biggest drop-off).
- Plain-language insights / recommendations.

## Structure

```
funnel-dashboard/
├── backend/            # Node.js + Express API (all calculations)
│   ├── src/
│   │   ├── core/       # pure funnel math + insight rules
│   │   ├── services/   # loads data, orchestrates analysis
│   │   ├── api/        # routes + OpenAPI/Swagger spec
│   │   └── config/
│   ├── tests/          # Jest + Supertest
│   └── data/campaigns.json
├── frontend/           # Vue 3 + Vite (visualization only)
│   └── src/
│       ├── components/ # CampaignList, MetricTiles, FunnelChart, InsightList
│       ├── services/   # API client
│       └── lib/        # display formatting
├── docker-compose.yml
└── WRITEUP.md
```

## How the numbers are defined

- `views` = users who saw a step; `proceeds` = users who continued.
- Step conversion = `proceeds / views`; drop-off = `1 − conversion`.
- Overall conversion = last step's `proceeds` / first step's `views`.
- Worst step = highest drop-off **rate** (proportion lost), which is the
  actionable signal rather than the raw count.
