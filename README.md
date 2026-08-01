# PeakAtlas3D

3D peak atlas powered by MapLibre: browse flagged summits on a world globe, then open a terrain profile page for each mountain.

## Features

- MapLibre globe with one flag per country; click to zoom in and reveal peak flags
- Country panel: peak count, highest summit, ranges, and peak list
- Peak pages with pitched 3D relief (MapTiler terrain-rgb when keyed, else Mapterhorn DEM)
- Peak dossier: description, elevation, prominence, difficulty, first ascent, coordinates
- Browse by country, range, and minimum elevation
- Imperial / metric unit toggle
- Collapsible nearby town context (for later expansion)

## Routes

| Route | Description |
|-------|-------------|
| `/` | 3D globe. Accepts client-side filters such as `?country=USA` (query strings are not prerendered — the crawlable shell always lists every peak) |
| `/peaks` | Full peak directory, grouped by country |
| `/countries/:countrySlug` | Per-country landing page (e.g. `/countries/usa`) with that country's peaks only — this is the indexable, server-rendered equivalent of `?country=` |
| `/peak/:slug` | Peak dossier with 3D terrain |
| `/about`, `/contact` | Static pages |

## Stack

- Vite + React + TypeScript
- MapLibre GL JS via `react-map-gl` (main atlas)
- React Router

## Setup

1. (Optional but recommended) Create a MapTiler Cloud key at [cloud.maptiler.com/account/keys](https://cloud.maptiler.com/account/keys/).
2. Copy env example and add your key:

```bash
cp .env.example .env
```

```env
VITE_MAPTILER_KEY=your_maptiler_key_here
```

Without a key, the app uses free Sentinel-2 satellite tiles (EOX) and Mapterhorn terrain DEM so local development still works.

Optional Plausible analytics:

```env
VITE_PLAUSIBLE_DOMAIN=peakatlas3d.com
```

Never put secret server-only tokens in the frontend.

## Post-launch

If the site is live and in Google Search Console, follow **[`docs/POST_LAUNCH.md`](docs/POST_LAUNCH.md)** (DNS/www, GSC indexing requests, MapTiler allow-list, flagship content).

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
| `npm run sitemap` | Regenerate `public/sitemap.xml` + `robots.txt` |
| `npm run prerender` | Inject route meta into `dist/` (runs after Vite in `build`) |

## Data

Peak data lives in [`src/data/peaks.json`](src/data/peaks.json). Peak photos include Wikimedia Commons credit, license, and source links in the dossier. Lodging is pulled from OpenStreetMap (`npm run enrich:lodging`); food entries remain sample suggestions only. Product updates are tracked in [`CHANGELOG.md`](CHANGELOG.md); legal/context notes are on `/about#disclaimer`.

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
