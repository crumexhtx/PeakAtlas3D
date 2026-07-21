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
| `npm run enrich:content` | Add whyNotable / seasons / aliases |
| `npm run enrich:lodging` | Refresh OSM lodging near peaks |
| `npm run scrub:lodging` | Drop lodging farther than 50 mi from summit |
| `npm run validate:photos:check` | Fail if peak photos look mismatched |
| `npm run promo:instagram` | Build a 9:16 Instagram Reels promo for a peak (default: Matterhorn; needs `ffmpeg`) |
| `npm run sitemap` | Regenerate `public/sitemap.xml` + `robots.txt` |
| `npm run prerender` | Inject route meta into `dist/` (runs after Vite in `build`) |

## Data

Peak data lives in [`src/data/peaks.json`](src/data/peaks.json). Peak photos include Wikimedia Commons credit, license, and source links in the dossier. Lodging is pulled from OpenStreetMap (`npm run enrich:lodging`); food entries remain sample suggestions only. Site updates are listed on `/releases`; legal/context notes are on `/about#disclaimer`.

`npm run build` regenerates the sitemap, builds the SPA, then writes per-route HTML shells under `dist/` with correct titles / Open Graph tags for crawlers. Override the origin with `SITE_URL` if needed.

Ongoing soft-launch tasks live in [`.github/BACKLOG.md`](.github/BACKLOG.md).

To refresh OSM lodging:

```bash
npm run enrich:lodging
npm run scrub:lodging
```

To regenerate curated dossier fields:

```bash
npm run enrich:content
```

To generate an Instagram Reels–style (1080×1920) promo video for the Matterhorn page (or another peak):

```bash
npm run promo:instagram
npm run promo:instagram -- --peak matterhorn --out output/matterhorn-instagram-promo.mp4
```

Requires `ffmpeg` with libx264 and librsvg. Output lands in `output/` (gitignored). Photo credits from Wikimedia Commons are burned into each frame.
