# Changelog

Product updates for [PeakAtlas3D](https://peakatlas3d.com). Newest first.

Update this file when shipping notable changes (do not maintain an in-app releases page).

## 0.3.7 — 2026-08-01 — Faster satellite tiles

One MapTiler satellite style for world and detail so country/peak/park entry no longer reloads the basemap and re-fetches a hybrid stack.

- Drop world↔hybrid style swaps (satellite-only throughout)
- Cap detail max zoom at 15 (enough for summit/park framing)
- Faster settleBasemap when the style is already loaded

## 0.3.6 — 2026-08-01 — Tighter country + park framing

Country drill-in (especially USA) frames the main landmass instead of every distant peak; national park fly-ins zoom ~20% closer. Release notes move off the site into this changelog.

- Country fitBounds drops far outliers (Alaska/Hawaii-style) from the frame
- Less padding so the country fills more of the map stage
- Park selection zoom raised from 8.4 → 10.1
- Removed in-app `/releases` page; changelog lives in `CHANGELOG.md` on GitHub

## 0.3.5 — 2026-07-31 — National Parks toggle

World view gains a Parks toggle with 25 curated USA National Parks — peak-style dossiers (season, fees, staging, trails, food) and map markers on the globe.

- Parks control under Earth view on the world globe
- 25 USA icons from Yellowstone to Mesa Verde
- Tap a park to fly in and open a dossier panel
- Separate nationalParks catalog (does not pollute peaks.json)

## 0.3.4 — 2026-07-31 — AI-search resilience: snapshots + comparisons

Peak pages lead with dated proprietary planning snapshots and answer-first section copy; ten high-intent A vs B comparison guides are prerendered and sitemapped.

- Planning snapshot on every peak (elevation, tier, season, permits, staging, OSM lodging)
- Question-style H2s with short standalone answers before detail lists
- 10 comparison routes under /compare (Whitney–Elbert, Rainier–Hood, Denali–Everest, …)
- Prerender + sitemap + nav/footer links for crawlable discovery

## 0.3.3 — 2026-07-28 — Catskill High Peaks

Five Catskill High Peaks join the catalog — Slide, Hunter, Black Dome, Blackhead, and West Kill — with forested mountain-face photos and OSM lodging.

- Slide Mountain (Catskills high point) + Hunter Mountain fire-tower peak
- Blackhead Range: Black Dome and Blackhead
- West Kill Mountain on the Devil’s Path
- Curated Commons face photos + Forest Preserve permit notes

## 0.3.2 — 2026-07-28 — Country peak flags stay visible when zooming in

Zooming into a region (like the US East Coast) no longer hides local peak flags behind off-screen western summits.

- Country-view declutter only counts peaks in the current viewport
- Off-screen Rockies/Alaska peaks no longer consume the USA flag cap

## 0.3.1 — 2026-07-28 — Alps & Europe peaks

Fourteen popular Alps and Europe summits join the catalog with validated elevations, mountain-face photos, OSM lodging, and trip notes.

- Pennine Alps: Monte Rosa, Weisshorn, Dom, Dent Blanche, Piz Bernina
- Italy / Dolomites: Gran Paradiso, Cima Grande, Etna, Vesuvius
- UK & Ireland: Ben Nevis, Snowdon, Scafell Pike, Carrauntoohil
- High Tatras: Gerlachovský štít (guide-required notes)
- Curated Commons face photos pinned in the photo validator

## 0.3.0 — 2026-07-28 — Post-launch: flagship peaks + analytics

Trip-ready copy for ten high-traffic summits, optional Plausible analytics, lodging empty-states, and a Search Console / DNS runbook for the live site.

- Curated trip notes + permits for Rainier, Denali, Everest, Whitney, Hood, Fuji, Matterhorn, Elbert, Half Dome, and Shasta
- Optional VITE_PLAUSIBLE_DOMAIN alongside Vercel Analytics
- Clearer lodging empty state when OSM has no nearby stays
- docs/POST_LAUNCH.md checklist for www DNS and GSC indexing requests

## 0.2.9 — 2026-07-28 — Zoom-only peak entry (no orbit)

Opening a peak now flies straight to the summit framing — the long orbit spin is gone — and style-swap races that could leave the peak page stuck are hardened.

- Removed peak orbit; single zoom-in to summit view
- Wait for basemap style reload before flying (fixes blank/stuck peak after search)
- Catalog load errors no longer hang on “Loading peak…” forever

## 0.2.8 — 2026-07-28 — Wider peak approach from search

Searching a mountain no longer dives into an ultra-close summit crop — orbit and hero framing pull back so the massif stays in view.

- Lower orbit/hero zoom and pitch for peak cinematic framing
- From the world globe (search), settle even a touch wider

## 0.2.7 — 2026-07-28 — Clear markers on peak maps

On any peak page, tap Clear markers to hide the summit flag, trail signs, and nearby place pins so the 3D terrain stands alone.

- New Clear markers control on peak pages (Esc restores icons)
- Hides summit flag, US trail bubbles, and nearby place markers

## 0.2.6 — 2026-07-28 — Search indexing: crawlable peaks

Peak and contact HTML now include real body copy and internal links for Google Search Console — plus a new /peaks directory hub.

- Prerender injects peak articles into HTML (not only `<noscript>`) for first-byte crawlability
- New /peaks catalog page with every summit as a real link; added to the sitemap
- Country lists, search results, and nearby peaks use `<a href>` / `<Link>` instead of buttons only
- www → apex redirect configured (point www DNS at Vercel to activate)

## 0.2.5 — 2026-07-26 — Smoother globe (spin + markers)

World idle spin and country drill-in are lighter on the GPU—especially on phones and dense catalogs like the U.S.

- Capped canvas pixel ratio on mobile and desktop
- Idle spin starts later, runs slower, and auto-pauses after a budget
- Lighter world basemap + lower max zoom while spinning; terrain deferred until after peak approach
- Country peak flags decluttered/capped (USA-friendly); drop-shadow off while spinning

## 0.2.4 — 2026-07-26 — MapLibre globe (MapTiler optional)

The atlas map now runs on MapLibre GL instead of Mapbox. Add a MapTiler key for hybrid satellite + terrain-rgb, or use the free Sentinel-2 / Mapterhorn fallback.

- Switched rendering to MapLibre GL via react-map-gl/maplibre
- Optional VITE_MAPTILER_KEY for MapTiler hybrid style + terrain-rgb DEM
- Keyless fallback: EOX Sentinel-2 satellite tiles + Mapterhorn DEM
- Atmosphere via MapLibre sky (replaces Mapbox fog)

## 0.2.3 — 2026-07-23 — Twenty more popular U.S. summits

Another wave of high-traffic American peaks joins the atlas—Cascades volcanoes, Southern California classics, Colorado 14ers, Southwest high points, and East Coast favorites—with official trail links.

- Added Glacier Peak, Shuksan, Jefferson (OR), Broken Top, Lassen, San Jacinto, San Gorgonio, Baldy, Tallac, Sneffels, Uncompahgre, Harvard, Sherman, Blue Sky, Wheeler (NM), Sandia Crest, LeConte, Old Rag, Mansfield, and Cadillac
- Trail bubbles wired to 14ers.com for new Colorado 14ers and NPS/USFS/state sources elsewhere

## 0.2.2 — 2026-07-22 — More US peaks and official trail links

The U.S. catalog grows with high-demand summits—popular Colorado 14ers, Half Dome, Olympic and Cascades classics, and more—each with curated trail bubbles that open 14ers.com, NPS, or USFS pages.

- Added high-value U.S. peaks including Massive, Quandary, Grays, Torreys, Bierstadt, Maroon, Half Dome, South Sister, Olympus (WA), Borah, Wheeler, Kuwohi, and Haleakalā
- Trail highlight bubbles for U.S. peaks with live links to 14ers.com (Colorado) and NPS/USFS sources elsewhere
- Clearer peak location labels (e.g. Colorado, USA) and peak-page SEO polish

## 0.2.1 — 2026-07-19 — Sitemap, crawlable peak meta, and CI

Search engines and link previews can now discover peak URLs via sitemap.xml, and each peak page ships with server-rendered title, description, and Open Graph tags at build time.

- Generated sitemap.xml and robots.txt for all peaks and content pages
- Build-time HTML meta prerender for /peak/:id, About, and Contact
- GitHub Actions CI runs lint and production build on every PR
- Random globe framing on refresh and steadier flags during idle spin

## 0.2.0 — 2026-07-18 — Honesty pass, mobile sheets, and globe polish

Lodging now comes from OpenStreetMap with clear sourcing, photos show Commons attribution, and the phone layout keeps the map visible behind a tap-to-expand details tab.

- OpenStreetMap lodging with distance notes and source links
- Sample food labeled as illustrative, not booked listings
- Photo credit overlays and Wikimedia thumb fallbacks
- Collapsed mobile details sheet so the terrain stays in view
- Country-flag declutter on the world globe
- Idle-spin fun facts that point at the peak on the globe
- Curated why-notable lines, seasons, and aliases on peak dossiers

## 0.1.0 — 2026-07-17 — Soft launch on peakatlas3d.com

First public atlas: Mapbox globe with one flag per country, country drill-in, cinematic peak pages, About and Contact, and a curated catalog of summits.

- World globe → country → peak cinematic flow
- Peak dossiers with elevation, difficulty, and nearby context
- Imperial / metric toggle and peak search
- About and Contact pages
- Deployed to Vercel with custom domain
