# Funnel Dashboard — Write-up

## How I understood the problem

Merchants see only a campaign's final conversion rate (e.g. 5%) and can't tell
*where* inside a multi-step popup flow people drop off. The job is to make
step-level performance visible and to point clearly at the step that's hurting
conversion the most, in a way a non-technical marketer can read at a glance.

The dataset gives `views` (saw the step) and `proceeds` (continued) per step,
where one step's `proceeds` equals the next step's `views`. Everything else —
conversion, drop-off, the worst step — is derived from those two numbers.

## What I built as v1 (and what I left out)

v1 is a small two-part app:

- A **list of campaigns** with overall conversion rate.
- A **funnel view** for the selected campaign: visitors per step
  (`views → proceeds`), cumulative conversion per step, the worst step
  highlighted in red, KPI tiles (including the biggest drop-off), and
  plain-language insights.

I deliberately kept the worst-step logic based on **drop-off rate** rather than
absolute count, because the top of any funnel always loses the most people in
raw numbers — the proportion is the actionable signal.

Left out (conscious scope cuts): no database (static JSON is enough), no auth,
no date filters or multi-campaign comparison, and no editing of campaigns.
These would be v2 features, not v1 essentials.

## The solution (architecture)

**Backend — Node.js + Express.** All calculations live here so the frontend
only renders. The math is isolated in pure, unit-tested functions
(`core/funnel.js`, `core/insights.js`); a service layer loads the data; a thin
router exposes two endpoints (`GET /api/campaigns`, `GET /api/campaigns/:id`).
The API is documented with Swagger UI for easy manual testing. 24 Jest +
Supertest tests cover the math, the rules, edge cases, and the endpoints.

**Frontend — Vue 3 + Vite.** Plain CSS, no UI framework, to stay simple and
readable. Small single-file components: campaign list, KPI tiles, the SVG
funnel chart, and the insights list. A tiny API client is the only thing that
talks to the backend; the app does no math, just formatting.

**Delivery — Docker.** `docker compose up --build` runs both; in dev, Vite
proxies `/api` to the backend, and in production nginx does the same, so the
browser always sees one origin.

## How I used AI

I used an AI assistant as a pair-programmer: I directed the design decisions
and reviewed all output. I also had it cross-check the Node and Express APIs
against the official documentation so the code uses only documented, standard
patterns rather than invented ones. The result is meant to be easily
maintainable.

## What I'd improve in v2

- Show per-step *conversion* alongside drop-off, and add hover tooltips.
- Date-range filtering and comparison across campaigns/devices.
- Move the dataset behind a real database and add a small ingestion path.
- Richer insights (benchmarks per step type, trend over time).
- Persist the selected campaign in the URL so a view is shareable.
