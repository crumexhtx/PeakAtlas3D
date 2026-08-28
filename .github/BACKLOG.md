# PeakAtlas3D backlog

Ready-to-file issues for the live soft launch. Prefer small PRs.

Full post-launch runbook: [`docs/POST_LAUNCH.md`](../docs/POST_LAUNCH.md).

## Ops / SEO

- [x] Verify domain in Google Search Console and submit `https://peakatlas3d.com/sitemap.xml`
- [ ] Confirm MapTiler key URL allow-list (prod + localhost) and usage alerts when using `VITE_MAPTILER_KEY`
- [ ] After deploy: confirm `/sitemap.xml`, `/robots.txt`, and `/peak/rainier` HTML include peak title **and an `<h1>` outside noscript** in View Source
- [ ] Point `www.peakatlas3d.com` DNS at Vercel (CNAME) so the www→apex redirect in `vercel.json` can take effect — www currently parks on Namecheap
- [ ] In GSC: after deploy, Validate Fix on “Discovered – currently not indexed”; request indexing for `/peaks`, `/contact`, and flagship `/peak/*` URLs (see `docs/POST_LAUNCH.md`)
- [ ] “Page with redirect” / “Alternate page with proper canonical” are mostly expected (trailing slash → clean URL; `?country=` → canonical path) — ignore unless a wrong target URL appears
- [ ] Optional: set `VITE_PLAUSIBLE_DOMAIN=peakatlas3d.com` on Vercel for Plausible (Vercel Analytics already ships)

## Product / data

- [x] Curate trip copy + permits for 10 flagship peaks (`npm run enrich:flagship`)
- [x] Empty-state UX when lodging list is empty (stage-town guidance)
- [ ] Food section: OSM enrich **or** stronger “illustrative sample” treatment end-to-end
- [ ] Re-run lodging enrich for remote / Antarctica / Himalaya gaps as OSM improves

## Engineering

- [x] Lazy-load MapLibre / `AtlasMap` so About / Contact / Peaks skip the large GL chunk (`DeferredAtlasMap`)
- [x] Privacy-friendly analytics option (Plausible via `VITE_PLAUSIBLE_DOMAIN`; Vercel Analytics on by default)
- [x] Smoke e2e: world → country → peak → skip → back (Playwright)
- [ ] Retune globe disk metrics (`SpinFunFact`) after MapLibre + free-tile vs MapTiler visual QA
- [ ] Optionally drop transitive `mapbox-gl` peer pulled by `react-map-gl` (unused import path)

## Growth

- [ ] Add peaks in small batches; run `enrich:content`, `enrich:lodging`, `scrub:lodging`, `validate:photos:check`
- [ ] Update `CHANGELOG.md` whenever you ship a notable change
