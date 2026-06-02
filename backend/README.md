# Funnel Dashboard — Backend

Node.js + Express API that powers step-level funnel analytics for popup
campaigns. **All conversion and drop-off math lives here**, so the (future)
Vue frontend only has to render the numbers it receives.

## What it does

- Loads the static campaign dataset (`data/campaigns.json`).
- Computes, per step: conversion rate, drop-off (absolute and %), and
  cumulative funnel position.
- Computes overall campaign conversion and identifies the **worst step**
  (the step that loses the largest proportion of users).
- Generates 2–3 plain-language **insights / recommendations**.
- Documents and exposes everything through **Swagger UI**.

## Project structure

```
backend/
├── src/
│   ├── core/
│   │   ├── funnel.js        # pure funnel math (single source of truth)
│   │   └── insights.js      # rule-based recommendations
│   ├── services/
│   │   └── campaign.service.js  # loads data, orchestrates analysis
│   ├── api/
│   │   ├── openapi.js        # OpenAPI 3 spec (served as Swagger UI)
│   │   └── router.js         # HTTP routes (thin layer)
│   ├── config/
│   │   └── settings.js       # env-driven config
│   ├── app.js                # Express app factory
│   └── server.js             # entry point
├── tests/                    # Jest + Supertest
├── data/campaigns.json       # static dataset
├── Dockerfile
└── package.json              # dependencies (Node equivalent of requirements.txt)
```

## Prerequisites

- Node.js >= 20 (only needed if running without Docker)
- Docker + Docker Compose (for the containerized run)

## Run with Docker (recommended)

From the project root:

```bash
docker compose up --build
```

## Run locally without Docker

```bash
cd backend
npm install
npm start
```

Then open:

- API base: <http://localhost:3000/api/campaigns>
- **Swagger UI: <http://localhost:3000/api-docs>** (try the endpoints here)
- Raw OpenAPI spec: <http://localhost:3000/api-docs.json>
- Health: <http://localhost:3000/health>

## Run the tests

```bash
cd backend
npm install
npm test
```

Covers the funnel math, the insight rules, edge cases (zero views, empty /
single-step campaigns), and the HTTP endpoints.

## API summary

| Method | Path                  | Purpose                                    |
| ------ | --------------------- | ------------------------------------------ |
| GET    | `/api/campaigns`      | List campaigns with summary metrics        |
| GET    | `/api/campaigns/{id}` | Full funnel analysis + insights for one    |
| GET    | `/health`             | Health check                               |
| GET    | `/api-docs`           | Interactive Swagger UI                      |

### How the numbers are defined

- `views` — users who saw a step; `proceeds` — users who continued.
- **Step conversion rate** = `proceeds / views`.
- **Drop-off** = `views − proceeds` (absolute) and `1 − conversionRate` (%).
- **Overall conversion** = last step's `proceeds` / first step's `views`.
- **Worst step** = highest drop-off *rate*. Rate (not absolute count) is used
  because the top of the funnel always loses the most people in raw numbers;
  the proportion is the actionable signal.
