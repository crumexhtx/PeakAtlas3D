# PeakAtlas3D backlog

Ready-to-file issues for the live soft launch. Prefer small PRs.

## Ops / SEO

- [ ] Verify domain in Google Search Console and submit `https://peakatlas3d.com/sitemap.xml`
- [ ] Confirm MapTiler key URL allow-list (prod + localhost) and usage alerts when using `VITE_MAPTILER_KEY`
- [ ] After deploy: confirm `/sitemap.xml`, `/robots.txt`, and `/peak/rainier` HTML include peak title in raw source (View Source)

## Product / data

- [ ] Empty-state UX for peaks with no OSM lodging (remote / Antarctica / Himalaya)
- [ ] Food section: OSM enrich **or** stronger “illustrative sample” treatment end-to-end
- [ ] Hand-edit amenity notes for flagship peaks (Rainier, Denali, Everest, etc.)

## Engineering

- [ ] Lazy-load MapLibre / `AtlasMap` so About / Releases / Contact skip the large GL chunk
- [ ] Privacy-friendly analytics (Plausible or Umami)
- [ ] Smoke e2e: world → country → peak → skip → back (Playwright)
- [ ] Install GitHub CLI locally if you want these tracked as Issues (`gh issue create`)
- [ ] Retune globe disk metrics (`SpinFunFact`) after MapLibre + free-tile vs MapTiler visual QA
- [ ] Optionally drop transitive `mapbox-gl` peer pulled by `react-map-gl` (unused import path)

## Growth

- [ ] Add peaks in small batches; run `enrich:content`, `enrich:lodging`, `scrub:lodging`, `validate:photos:check`
- [ ] Update `src/data/releases.ts` whenever you ship a notable change
