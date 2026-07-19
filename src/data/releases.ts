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
