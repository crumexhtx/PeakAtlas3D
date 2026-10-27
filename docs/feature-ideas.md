# Feature ideas

The weekly agent adds new ideas under **Proposed**. The owner moves each one to **Approved**, **Rejected** (with a short reason, so the agent learns) or **Shipped**. The agent never re-proposes anything already on this page.

Format: `- **Name** (YYYY-MM-DD, goal: impressions/clicks/engagement, effort: S/M/L) — one-line pitch. Owner note: …`

## Proposed
<!-- agent adds new ideas here -->

## Approved / planned
- **Best peaks by month pages + month filter** — `/best-peaks/{month}` from `bestSeason` data. (CURSOR_PROMPT_2)
- **Permit & lottery calendar + email reminders** — `/permits`, per-permit pages, double opt-in signup. (CURSOR_PROMPT_2)
- **Collection pages** — Seven Summits, US state high points, Colorado 14ers, beginner peaks, first 6,000 m peaks.
- **Summit weather forecast** — 7-day summit-elevation forecast, prerendered daily. Needs a paid weather API plan once the site has ads.
- **"Where is [peak]?" section** — country, region, nearest town, coordinates (decimal + DMS), static location map.
- **FAQ answers + FAQPage / BreadcrumbList structured data** on peak pages.
- **Clean internal URLs** — drop `?country=` from internal links (`src/lib/routes.ts`).
- **Vertical 3D flyover video export** for Instagram/Reels/Shorts.

## Later / maybe
- **Progression paths** — "did X, try Y next" (e.g. Kilimanjaro → Aconcagua → Denali).
- **Trip cost per peak, linked to Plansti.**
- **Personal peak list** — climbed / want to climb, in the browser first, accounts later.
- **Standard route line + elevation profile on the 3D map** (piloted with the Habanero course).
- **Guided-trip and gear affiliate links.**

## Rejected
<!-- owner moves ideas here with a short reason -->

## Shipped
<!-- owner moves ideas here with the ship date -->
