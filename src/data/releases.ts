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
