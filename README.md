# PeakAtlas3D

3D peak atlas powered by Mapbox: browse flagged summits on a world globe, then open a terrain profile page for each mountain.

## Features

- Mapbox globe with one flag per country; click to zoom in and reveal peak flags
- Country panel: peak count, highest summit, ranges, and peak list
- Peak pages with Mapbox Terrain-DEM (pitched 3D relief)
- Peak dossier: description, elevation, prominence, difficulty, first ascent, coordinates
- Browse by country, range, and minimum elevation
- Imperial / metric unit toggle
- Collapsible nearby town context (for later expansion)

## Stack

- Vite + React + TypeScript
- Mapbox GL JS via `react-map-gl`
- React Router

## Setup

1. Create a public Mapbox token (`pk.…`) at [account.mapbox.com/access-tokens](https://account.mapbox.com/access-tokens/).
2. Copy env example and add your token:

```bash
cp .env.example .env
```

```env
VITE_MAPBOX_TOKEN=pk.your_public_token_here
```

Never put secret (`sk.…`) tokens in the frontend.

## Run locally

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Lint with oxlint |

## Data

Peak data lives in [`src/data/peaks.json`](src/data/peaks.json). Peak photos include Wikimedia Commons credit, license, and source links in the dossier. Lodging/food entries are sample suggestions only — not verified listings or ratings.

To regenerate enriched peak fields after editing the curated map:

```bash
node scripts/enrich-peaks.mjs
```
