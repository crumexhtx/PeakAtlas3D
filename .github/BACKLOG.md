# PeakAtlas3D backlog

Ready-to-file issues for the live soft launch. Prefer small PRs.

## Ops / SEO

- [ ] Verify domain in Google Search Console and submit `https://peakatlas3d.com/sitemap.xml`
- [ ] Confirm Mapbox token URL allow-list (prod + localhost) and usage alerts
- [ ] After deploy: confirm `/sitemap.xml`, `/robots.txt`, and `/peak/rainier` HTML include peak title in raw source (View Source)

## Product / data

- [ ] Empty-state UX for peaks with no OSM lodging (remote / Antarctica / Himalaya)
- [ ] Food section: OSM enrich **or** stronger “illustrative sample” treatment end-to-end
- [ ] Hand-edit amenity notes for flagship peaks (Rainier, Denali, Everest, etc.)

## Engineering

- [ ] Lazy-load Mapbox / `AtlasMap` so About / Releases / Contact skip the ~1.8MB chunk
- [ ] Privacy-friendly analytics (Plausible or Umami)
- [ ] Smoke e2e: world → country → peak → skip → back (Playwright)
- [ ] Install GitHub CLI locally if you want these tracked as Issues (`gh issue create`)

## Growth

- [ ] Add peaks in small batches; run `enrich:content`, `enrich:lodging`, `scrub:lodging`, `validate:photos:check`
- [ ] Update `src/data/releases.ts` whenever you ship a notable change
