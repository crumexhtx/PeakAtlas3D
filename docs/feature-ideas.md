# Feature ideas

The weekly agent adds new ideas under **Proposed**. The owner moves each one to **Approved**, **Rejected** (with a short reason, so the agent learns) or **Shipped**. The agent never re-proposes anything already on this page.

Format: `- **Name** (YYYY-MM-DD, goal: impressions/clicks/engagement, effort: S/M/L) — one-line pitch. Owner note: …`

## Proposed
<!-- agent adds new ideas here -->
Ranked by expected impact ÷ effort (2026-10-27 run).

1. **Compare picker + more prerendered "X vs Y" pairs** (2026-10-27, goal: impressions, effort: M) — let readers pick any two peaks for a side-by-side (with both 3D views), and prerender a small, gated set of extra pairs, because the only page ranking on page 1 in Search Console is a compare page. Owner note:
   - Why here: `/compare/fuji-vs-whitney` is the only page-1 URL this week (15 impressions, position 5.6; 18 impressions at position 5.2 last week) while average position is 43.1 and only 13 pairs exist. Source: GSC summary 2026-10-18 to 2026-10-24.
   - Trend: Google says AI Mode and AI Overviews now surface more direct links to sources ([Google, 6 May 2026](https://blog.google/products-and-platforms/products/search/explore-web-generative-ai-search)); a Google I/O 2026 recap says AI search is moving toward longer, comparison-style queries ([Coalition Technologies](https://coalitiontechnologies.com/blog/google-io-2026-seo)). The second source is a secondary summary, not Google itself.
   - Build: a picker on `src/pages/CompareIndexPage.tsx` that links to `/compare/{a}-vs-{b}` for allowed pairs; extra pairs added only to `src/data/comparisons.json` (prerender and sitemap already read it); pairs limited to same range/country or a clear trip-decision choice, max 10 per release, each with written pick-A/pick-B text, never auto-generated thin pages.
   - Risks: thin or duplicate content if pairs are not curated; keep every metric sourced from existing peak fields.
   - Measure: impressions and clicks for `/compare/*` in Search Console after 4–6 weeks; Vercel Analytics custom event `compare_pair_selected`.
2. **"Official status" card with last-verified date** (2026-10-27, goal: clicks, effort: M) — on each trip-ready peak page, show one link to the official park/agency page plus a "last verified" date, so trip searchers can see the guide is checked against the authority. Owner note:
   - Why here: trip searches are 12.2% of query impressions (18 of 147, up from 4.8%) against a 15–20% goal, and trip-intent queries in the data are practical ones ("mt timpanogos hike difficulty", "glacier peak climb", "mount assiniboine climb") where freshness and authority decide the click.
   - Trend: AllTrails now reports conditions and closures using data from more than 800 partner agencies and organisations ([TIME100 2026](https://time.com/collection/time100-most-influential-companies/2026/alltrails)).
   - Build: optional `officialUrl` and `lastVerified` (ISO date) fields in `src/data/peaks.json` and the `Peak` type, rendered in `src/components/TripReadiness.tsx` and the prerender (`scripts/prerender-meta.mjs`); start with the 20 most-viewed peaks, and add `dateModified` to the JSON-LD (`src/lib/jsonLd.ts`) only where the date is real. A validator rule that `officialUrl` is https and `lastVerified` is not in the future would need owner approval, since the agent may not edit validators.
   - Risks: stale dates are worse than none, so only show a date a human or the weekly agent actually re-checked; no personal data.
   - Measure: CTR on trip-intent queries after 4–6 weeks; outbound-click event `official_link_click` (Vercel Analytics) as an engagement signal.
3. **Shareable trip card** (2026-10-27, goal: engagement, effort: M) — pick a peak, a date and a group size, then get a URL-only card (season fit, permit link, gear checklist, nearest town) to send to friends, with no account or stored data. Owner note:
   - Why here: map-style searches are 30.6% of intent and they land on a 3D page with no next step. A card gives them something to keep and share, and a reason to come back. Mobile has 6.9% CTR (87 impressions, position 18.0) against desktop 2.2% (316 impressions, position 50.5), so a mobile-friendly share target matters.
   - Trend: AllTrails added "invite friends to hike" and live-share links ([AllTrails on Facebook](https://www.facebook.com/AllTrails/videos/eurosummer-2026-perhaps-a-little-late-nearby-hike-this-weekend-2026-right-on-tim/1727765788484037); [how-to video](https://www.youtube.com/watch?v=TD8GbL-DJc4&vl=en)).
   - Build: a client-rendered `/trip` route using `src/lib/seasonMonths.ts`, `src/lib/gearChecklists.ts`, `src/components/TripReadiness.tsx` data and the Web Share API; state lives in the query string only; the route is `noindex` so it adds no thin pages.
   - Risks: do not store or send dates or group sizes anywhere; no tracking parameters beyond the card state; keep gear lists to existing sourced checklists.
   - Measure: events `trip_card_created` and `trip_card_shared` (Vercel Analytics), and returning direct visits to `/trip` links, after 4 weeks.

Ranked by expected impact ÷ effort (2026-10-30 run).

1. **Large-image meta + terrain-render fallback image** (2026-10-30, goal: clicks, effort: M) — add `max-image-preview:large` and a 16:9 social image to every prerendered page, and use a still render of the 3D terrain when a peak has no usable photo. Owner note:
   - Why here: this week 7 researched peaks (Huron, Belford, Oxford, Missouri, Antero, Shavano, La Plata) could not be added because the catalog rule needs 2 geotagged Commons photos within 15 km. A terrain image would let those pages ship without photos, and it would give every page a distinctive search and share image. Mobile CTR is 6.9% vs desktop 2.2% (GSC summary 2026-10-18 to 2026-10-24), and mobile results are image-heavy. A grep of `index.html`, `src/` and `scripts/` finds no `max-image-preview` robots directive today.
   - Trend: Google's Discover guidance asks for large images at least 1200 px wide and `max-image-preview:large`, and its case study reports CTR gains from large images ([Google Search Central](https://developers.google.com/search/docs/appearance/google-discover)). PeakVisor keeps investing in 3D panoramas and destination pages ([PeakVisor app updates](https://peakvisor.com/en/news/app-updates.html)).
   - Build: add the robots meta directive in `scripts/prerender-meta.mjs` (the `og:image` code is near line 531); a build-time or one-off render script writes `public/og/{peakId}.jpg` (1200x675) from the existing terrain data; the prerender uses it when `photos` is empty. Peak pages must still say the image is a terrain render, not a photo. The photo validator would need owner approval to accept a no-photo peak, since the agent may not edit validators.
   - Risks: render cost and file size (cap at about 120 KB each); a render must not be mistaken for a photo; do not change URLs or slugs.
   - Measure: impressions and CTR for peak pages in Search Console after 4-6 weeks; Vercel Analytics event `og_image_variant_shown` is not possible server-side, so compare Search Console image and Discover rows instead.
2. **"Save for the trailhead" offline trip guide** (2026-10-30, goal: engagement, effort: M) — a button on each peak page that caches the trip summary (route, permits, season, nearest town, gear list) for offline use, so a reader has it with no signal. Owner note:
   - Why here: map-style searches are about 30% of intent and mobile CTR is already 3x desktop, so mobile readers are the audience that is most likely to be at a trailhead. Trip pages end with no next step today.
   - Trend: AllTrails added offline mode with automatic downloads in April 2026 ([AllTrails what's new](https://www.alltrails.com/whats-new)).
   - Build: a small service worker (new file, scoped to a cache name for trip pages only) and a button in `src/components/TripReadiness.tsx`; cache only the prerendered HTML and the JSON for that peak; no account and no stored personal data.
   - Risks: stale permit data offline, so show the "last updated" date and a "check the official page before you go" line; service workers need care with the existing deploy setup, and `vercel.json` must not be touched by the agent.
   - Measure: event `trip_saved_offline` (Vercel Analytics) per peak, and repeat visits to the saved pages over 4 weeks.
3. **Linked-summit day pages** (2026-10-30, goal: impressions, effort: M) — one guide for peaks climbed together (Shavano + Tabeguache, Kit Carson + Challenger Point, Belford + Oxford + Missouri) that links each peak page and shows a combined 3D view. Owner note:
   - Why here: this week's new peaks include Kit Carson and Challenger Point (0.37 km apart), and trip searches are only 12.2% of query impressions against a 15-20% goal. Searchers for these peaks ask for the combined day ("kit carson challenger point route"), which no page here answers.
   - Trend: PeakVisor's 28 Oct 2026 update added a heatmap of where people actually go ([PeakVisor app updates](https://peakvisor.com/en/news/app-updates.html)), which shows demand for route-level, not only peak-level, content.
   - Build: a curated `src/data/linkedSummits.json` and a page like `src/pages/CompareIndexPage.tsx` renders; prerender and sitemap read the new file the same way they read `comparisons.json`; start with 3 groups, each with written trip-day text from official sources.
   - Risks: thin pages if the text is not written by hand; keep every number from existing peak fields; avoid cannibalising the single-peak pages by linking both ways.
   - Measure: impressions and clicks for the new URLs in Search Console after 6 weeks; event `linked_summit_click` (Vercel Analytics) on peak pages.

Ranked by expected impact ÷ effort (2026-11-06 run).

1. **Licensable peak photos + entity links in the Mountain JSON-LD** (2026-11-06, goal: clicks, effort: S) — add `image` (with license, creator and credit text from the photo fields we already store), `sameAs` (Wikipedia/Wikidata URLs) and `hasMap` (a clean OpenStreetMap link built from the summit coordinates) to the Mountain structured data on every peak page, so Google Images can show a Licensable badge and the page is tied to the right mountain entity. Owner note:
   - Why here: 37.1% of query impressions this week are map/location searches (46 of 124; 29.0% last week), and the Positions 11–20 pages are exactly that kind (`olympus map`, `chimborazo location`, `marmolada glacier map`). Mobile CTR is 4.8% (4 clicks on 84 impressions) against desktop 1.7% (5 on 299), and mobile results are image-heavy. A grep of `scripts/prerender-meta.mjs` and `src/lib/jsonLd.ts` finds no `image`, `sameAs`, `hasMap` or `license` in the JSON-LD today; the photo is only used for `og:image`.
   - Trend: Google's guidance on AI features lists "supporting your textual content with high-quality images" and "making sure your structured data matches the visible text on the page" ([Google Search Central, AI features](https://developers.google.com/search/docs/appearance/ai-features)). Google Images shows a Licensable badge when image structured data includes a `license` URL ([Google Search Central, image metadata](https://developers.google.com/search/docs/appearance/structured-data/image-license-metadata)).
   - Build: extend `peakMountainJsonLd` in `scripts/prerender-meta.mjs` and the client copy in `src/components/PeakSeoLayout.tsx` to emit `image` as an `ImageObject` (`contentUrl`, `license` = the Creative Commons URL for the stored license string, `creditText`, `creator`, `acquireLicensePage` = the Commons `sourceUrl`) for the first photo; `sameAs` only where a Wikipedia or Wikidata id is already verified (start by storing the id in `src/data/peaks.json` as an optional `wikidataId` field); `hasMap` from `lat`/`lon`. Skip any photo whose license string has no known URL. No change to URLs or visible copy.
   - Risks: a wrong license URL is worse than none, so map only the licenses already in the catalog (CC BY, CC BY-SA versions, public domain) and drop the rest; the structured data must match the visible credit line; no personal data (creator names are already shown on the page).
   - Measure: Rich Results Test and Search Console enhancement reports within 1–2 weeks; Search Console Search Appearance and image-search impressions for `/peak/*` after 4–6 weeks; this needs no new analytics event.
2. **Name-variant coverage from real queries** (2026-11-06, goal: impressions, effort: S) — a small, reviewed list of alternate spellings and local names per peak (for example `Galdhøgpiggen`, `Halti tunturi`), shown in the existing "Also known as" line and in `alternateName`, so pages match the spellings people actually type. Owner note:
   - Why here: the query rows show variants the catalog does not carry: `galdhøgpiggen kart` (2 impressions) lands on `/peak/galdhopiggen`, whose only alias is `Galdhøpiggen`; `halti tunturi kartta`, `halti kartta` and `halti vuori` land on `/peak/halti`, whose only alias is `Haltitunturi`. All sit at positions 51–64 in the 2026-10-21 to 2026-10-27 data. Map searches are 37.1% of intent, and non-English map words (`kart`, `kartta`) are part of that share.
   - Trend: this is not a feature trend. Google says it tries to match the language of the searcher and warns against mixing languages on one page ([Google Search Central, multilingual sites](https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites)), so the scope is names and spellings only, never translated pages.
   - Build: add a `scripts/query-variants.mjs` report that lists Search Console queries on peak pages whose words are not in `name` or `aliases` (read from the `gsc-data` branch); the weekly agent proposes alias additions in the PR, a human approves, and the agent adds them to `aliases` in `src/data/peaks.json` (existing field, already shown on the page and in the JSON-LD). No new template, no new URLs.
   - Risks: wrong or invented local names; only add a variant that Wikipedia or an official source confirms, or that is a plain spelling variant of the existing name. Small numbers (1–3 impressions per query), so the gain is modest and slow.
   - Measure: impressions for the added variants in Search Console `queryPage28Days` after 4 weeks; only call a result with 30 or more impressions on the page.
3. **Sun and light planner on the 3D terrain** (2026-11-06, goal: engagement, effort: M) — a date and time slider on each peak's 3D view that shows where the sun rises or sets over the summit and when the light first hits it, computed in the browser. Owner note:
   - Why here: map-style searchers (37.1% of intent) land on a 3D view and have no reason to stay or return. A light planner is a use of the terrain that no static photo can match, and it fits sunrise treks like the one the backlog notes for Mount Batur. Mobile readers are the best fit: they have the better CTR (4.8% vs 1.7%) and are the ones planning a trip on the phone.
   - Trend: PeakVisor published a guide on planning a winter sunrise between the Tre Cime with its Panorama 3D tool (29 Sep 2026) and made Panorama 3D open about three times faster (30 Sep 2026) ([PeakVisor news](https://peakvisor.com/en/news.html)).
   - Build: a client-only component beside `src/components/PeakTripPanel.tsx`; sun position from the NOAA solar-position formula implemented in a new `src/lib/sunPosition.ts` with unit tests (no new dependency); the existing map code applies the light direction to the terrain shading; the date defaults to today and nothing is stored or sent. No new URLs, so no thin-page risk.
   - Risks: mobile performance when shading is recomputed on every slider move (throttle it, and skip it on low-power devices); accuracy near the poles and in deep valleys, so label it "approximate, ignores clouds and neighbouring terrain"; keep it off the critical rendering path so Core Web Vitals do not drop.
   - Measure: Vercel Analytics custom events `sun_planner_opened` and `sun_planner_date_changed` per peak, plus pages per visit and return visits for sessions that used it, after 4 weeks. Search Console cannot measure this.

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
