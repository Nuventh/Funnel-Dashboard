# Funnel Dashboard — Frontend

A small Vue 3 app (built with Vite) that visualizes popup funnel analytics.
It does **no calculations** — every number comes from the backend API. The
frontend only fetches and renders.

## What it shows

- A list of campaigns with overall conversion rate.
- A selected campaign's **funnel chart** — a band that narrows step by step as
  visitors drop off, with cumulative % at each boundary.
- The **worst step** marked in red.
- Plain-language **insights** returned by the backend.

## Project structure

```
frontend/
├── index.html               # Vite entry HTML
├── vite.config.js           # Vite + Vue, /api dev proxy to the backend
├── src/
│   ├── main.js              # mounts the app
│   ├── App.vue              # state (fetch, select campaign) + layout
│   ├── style.css            # global styles (teal accent)
│   ├── services/
│   │   └── api.js           # the only file that calls the backend
│   ├── lib/
│   │   └── format.js        # percent / number display helpers
│   └── components/
│       ├── CampaignList.vue # campaign list (left)
│       ├── MetricTiles.vue  # KPI tiles
│       ├── FunnelChart.vue  # the narrowing SVG funnel
│       └── InsightList.vue  # recommendations
├── Dockerfile               # multi-stage: build with Node, serve with nginx
├── nginx.conf               # serves the app + proxies /api to the backend
└── package.json
```

## Prerequisites

- Node.js >= 20 (only for running without Docker)
- The backend running on port 3000

## Run locally (without Docker)

Start the backend first (see `../backend/README.md`), then:

```bash
cd frontend
npm install
npm run dev
```

Open the URL Vite prints (usually <http://localhost:5173>). In dev, calls to
`/api/...` are proxied to the backend on port 3000 (see `vite.config.js`).

## Run everything with Docker

From the project root:

```bash
docker compose up --build
```

- Frontend: <http://localhost:8080>
- Backend API / Swagger: <http://localhost:3000/api-docs>

In Docker, nginx serves the built files and proxies `/api` to the backend
container, so the browser only ever talks to one origin.

## Run the tests

```bash
cd frontend
npm install
npm test            # Vitest: format helpers + component rendering
```

## Notes

- Plain CSS, no UI framework — kept simple and easy to read.
- The funnel band height at each boundary is the cumulative conversion rate
  from the backend, so the shape reflects the real drop-off.
