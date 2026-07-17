# PeakAtlas3D

Hybrid Civilization-inspired 3D globe of ~100 prominent mountain peaks worldwide, with surrounding town and amenity details.

## Features

- Interactive Earth globe (real albedo + topographic normal maps)
- Gold peak markers with fly-to camera on click or search
- Detail sidebar: elevation, range, nearest town, hotels, food, trails
- Terrain filters: Peaks / Towns / Trails
- Zoom and Reset Camera controls
- Dark Civ-style HUD (gold accents, display typography)

## Stack

- Vite + React + TypeScript
- Three.js via `@react-three/fiber` and `@react-three/drei`

## Run locally

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

## Scripts

| Command        | Description              |
|----------------|--------------------------|
| `npm run dev`  | Start development server |
| `npm run build`| Production build         |
| `npm run preview` | Preview production build |
| `npm run lint` | Lint with oxlint         |

## Data

Peak data lives in [`src/data/peaks.json`](src/data/peaks.json) — curated static entries (no API keys). Hotels and food are illustrative lists for the MVP.
