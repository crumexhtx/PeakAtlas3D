export type ReleaseItem = {
  version: string
  date: string
  title: string
  summary: string
  highlights: string[]
}

/** Newest first — update this file when shipping notable site changes. */
export const releases: ReleaseItem[] = [
  {
    version: '0.3.0',
    date: '2026-07-28',
    title: 'Post-launch: flagship peaks + analytics',
    summary:
      'Trip-ready copy for ten high-traffic summits, optional Plausible analytics, lodging empty-states, and a Search Console / DNS runbook for the live site.',
    highlights: [
      'Curated trip notes + permits for Rainier, Denali, Everest, Whitney, Hood, Fuji, Matterhorn, Elbert, Half Dome, and Shasta',
      'Optional VITE_PLAUSIBLE_DOMAIN alongside Vercel Analytics',
      'Clearer lodging empty state when OSM has no nearby stays',
      'docs/POST_LAUNCH.md checklist for www DNS and GSC indexing requests',
    ],
  },
  {
    version: '0.2.9',
    date: '2026-07-28',
    title: 'Zoom-only peak entry (no orbit)',
    summary:
      'Opening a peak now flies straight to the summit framing — the long orbit spin is gone — and style-swap races that could leave the peak page stuck are hardened.',
    highlights: [
      'Removed peak orbit; single zoom-in to summit view',
      'Wait for basemap style reload before flying (fixes blank/stuck peak after search)',
      'Catalog load errors no longer hang on “Loading peak…” forever',
    ],
  },
  {
    version: '0.2.8',
    date: '2026-07-28',
    title: 'Wider peak approach from search',
    summary:
      'Searching a mountain no longer dives into an ultra-close summit crop — orbit and hero framing pull back so the massif stays in view.',
    highlights: [
      'Lower orbit/hero zoom and pitch for peak cinematic framing',
      'From the world globe (search), settle even a touch wider',
    ],
  },
  {
    version: '0.2.7',
    date: '2026-07-28',
    title: 'Clear markers on peak maps',
    summary:
      'On any peak page, tap Clear markers to hide the summit flag, trail signs, and nearby place pins so the 3D terrain stands alone.',
    highlights: [
      'New Clear markers control on peak pages (Esc restores icons)',
      'Hides summit flag, US trail bubbles, and nearby place markers',
    ],
  },
  {
    version: '0.2.6',
    date: '2026-07-28',
    title: 'Search indexing: crawlable peaks',
    summary:
      'Peak and contact HTML now include real body copy and internal links for Google Search Console — plus a new /peaks directory hub.',
    highlights: [
      'Prerender injects peak articles into HTML (not only <noscript>) for first-byte crawlability',
      'New /peaks catalog page with every summit as a real link; added to the sitemap',
      'Country lists, search results, and nearby peaks use <a href> / <Link> instead of buttons only',
      'www → apex redirect configured (point www DNS at Vercel to activate)',
    ],
  },
  {
    version: '0.2.5',
    date: '2026-07-26',
    title: 'Smoother globe (spin + markers)',
    summary:
      'World idle spin and country drill-in are lighter on the GPU—especially on phones and dense catalogs like the U.S.',
    highlights: [
      'Capped canvas pixel ratio on mobile and desktop',
      'Idle spin starts later, runs slower, and auto-pauses after a budget',
      'Lighter world basemap + lower max zoom while spinning; terrain deferred until after peak approach',
      'Country peak flags decluttered/capped (USA-friendly); drop-shadow off while spinning',
    ],
  },
  {
    version: '0.2.4',
    date: '2026-07-26',
    title: 'MapLibre globe (MapTiler optional)',
    summary:
      'The atlas map now runs on MapLibre GL instead of Mapbox. Add a MapTiler key for hybrid satellite + terrain-rgb, or use the free Sentinel-2 / Mapterhorn fallback.',
    highlights: [
      'Switched rendering to MapLibre GL via react-map-gl/maplibre',
      'Optional VITE_MAPTILER_KEY for MapTiler hybrid style + terrain-rgb DEM',
      'Keyless fallback: EOX Sentinel-2 satellite tiles + Mapterhorn DEM',
      'Atmosphere via MapLibre sky (replaces Mapbox fog)',
    ],
  },
  {
    version: '0.2.3',
    date: '2026-07-23',
    title: 'Twenty more popular U.S. summits',
    summary:
      'Another wave of high-traffic American peaks joins the atlas—Cascades volcanoes, Southern California classics, Colorado 14ers, Southwest high points, and East Coast favorites—with official trail links.',
    highlights: [
      'Added Glacier Peak, Shuksan, Jefferson (OR), Broken Top, Lassen, San Jacinto, San Gorgonio, Baldy, Tallac, Sneffels, Uncompahgre, Harvard, Sherman, Blue Sky, Wheeler (NM), Sandia Crest, LeConte, Old Rag, Mansfield, and Cadillac',
      'Trail bubbles wired to 14ers.com for new Colorado 14ers and NPS/USFS/state sources elsewhere',
    ],
  },
  {
    version: '0.2.2',
    date: '2026-07-22',
    title: 'More US peaks and official trail links',
    summary:
      'The U.S. catalog grows with high-demand summits—popular Colorado 14ers, Half Dome, Olympic and Cascades classics, and more—each with curated trail bubbles that open 14ers.com, NPS, or USFS pages.',
    highlights: [
      'Added high-value U.S. peaks including Massive, Quandary, Grays, Torreys, Bierstadt, Maroon, Half Dome, South Sister, Olympus (WA), Borah, Wheeler, Kuwohi, and Haleakalā',
      'Trail highlight bubbles for U.S. peaks with live links to 14ers.com (Colorado) and NPS/USFS sources elsewhere',
      'Clearer peak location labels (e.g. Colorado, USA) and peak-page SEO polish',
    ],
  },
  {
    version: '0.2.1',
    date: '2026-07-19',
    title: 'Sitemap, crawlable peak meta, and CI',
    summary:
      'Search engines and link previews can now discover peak URLs via sitemap.xml, and each peak page ships with server-rendered title, description, and Open Graph tags at build time.',
    highlights: [
      'Generated sitemap.xml and robots.txt for all peaks and content pages',
      'Build-time HTML meta prerender for /peak/:id, About, Releases, and Contact',
      'GitHub Actions CI runs lint and production build on every PR',
      'Random globe framing on refresh and steadier flags during idle spin',
    ],
  },
  {
    version: '0.2.0',
    date: '2026-07-18',
    title: 'Honesty pass, mobile sheets, and globe polish',
    summary:
      'Lodging now comes from OpenStreetMap with clear sourcing, photos show Commons attribution, and the phone layout keeps the map visible behind a tap-to-expand details tab.',
    highlights: [
      'OpenStreetMap lodging with distance notes and source links',
      'Sample food labeled as illustrative, not booked listings',
      'Photo credit overlays and Wikimedia thumb fallbacks',
      'Collapsed mobile details sheet so the terrain stays in view',
      'Country-flag declutter on the world globe',
      'Idle-spin fun facts that point at the peak on the globe',
      'Curated why-notable lines, seasons, and aliases on peak dossiers',
      'New Releases page for product updates',
    ],
  },
  {
    version: '0.1.0',
    date: '2026-07-17',
    title: 'Soft launch on peakatlas3d.com',
    summary:
      'First public atlas: Mapbox globe with one flag per country, country drill-in, cinematic peak pages, About and Contact, and a curated catalog of summits.',
    highlights: [
      'World globe → country → peak cinematic flow',
      'Peak dossiers with elevation, difficulty, and nearby context',
      'Imperial / metric toggle and peak search',
      'About and Contact pages',
      'Deployed to Vercel with custom domain',
    ],
  },
]
