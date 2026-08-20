/**
 * Curated outbound trip-planning links for peaks where OSM lodging/food is
 * thin or where official permit / park agencies are the real next step.
 *
 * Prefer government, park, or national federation pages — not commercial
 * tour operators — so PeakAtlas can cite a durable source.
 */

export type PeakPlanningResource = {
  label: string
  /** One-line traveler note (what this link is for). */
  note: string
  url: string
  kind: 'permit' | 'park' | 'federation' | 'agency'
}

const BY_PEAK: Record<string, PeakPlanningResource[]> = {
  damavand: [
    {
      label: 'I.R. Iran Mountaineering & Sport Climbing Federation',
      note: 'Official federation site for Damavand area access rules and climbing administration.',
      url: 'https://msfi.ir/',
      kind: 'federation',
    },
    {
      label: 'Federation peak-permit guidance (Damavand)',
      note: 'Official article: foreign climbers need a Damavand permit (commonly issued at Polour Camp 1; confirm current fee and guide rules).',
      url: 'https://msfi.ir/ArticleView/Index/36743',
      kind: 'permit',
    },
  ],
  aconcagua: [
    {
      label: 'Aconcagua Provincial Park (Mendoza)',
      note: 'Official park site for climbing / trekking permits, seasons, and park rules.',
      url: 'https://aconcagua.mendoza.gov.ar/',
      kind: 'park',
    },
  ],
  kilimanjaro: [
    {
      label: 'Tanzania National Parks (TANAPA)',
      note: 'National parks authority that sets Kilimanjaro fees; permits are arranged through a licensed Tanzanian operator.',
      url: 'https://www.tanapa.go.tz/',
      kind: 'agency',
    },
    {
      label: 'Kilimanjaro National Park FAQs',
      note: 'Park guidance on guides, permits, and regulations (independent climbing is not allowed).',
      url: 'https://kilimanjaropark.org/faqs/',
      kind: 'park',
    },
  ],
  everest: [
    {
      label: 'Nepal Department of Tourism',
      note: 'Start here for Nepal-side expedition / climbing permit context; most teams book via a licensed operator.',
      url: 'https://www.tourism.gov.np/',
      kind: 'agency',
    },
  ],
  fuji: [
    {
      label: 'Official Mt. Fuji climbing information',
      note: 'Prefecture climbing registration / fee guidance for major trails (Yoshida and others). Hut bookings are separate.',
      url: 'https://www.fujisan-climb.jp/en/',
      kind: 'permit',
    },
  ],
  k2: [
    {
      label: 'Pakistan Alpine Club',
      note: 'National alpine body often involved in expedition coordination; climbing permits run through licensed operators and government channels.',
      url: 'https://www.alpineclub.org.pk/',
      kind: 'federation',
    },
  ],
  elbrus: [
    {
      label: 'Elbrus National Park',
      note: 'Park information for Elbrus area access; confirm current permit and border-zone rules before travel.',
      url: 'https://elbruspark.com/',
      kind: 'park',
    },
  ],
  gerlach: [
    {
      label: 'TANAP — High Tatras National Park',
      note: 'Official park context for Gerlachovský štít; guided ascent rules apply for many visitors.',
      url: 'https://www.tanap.org/',
      kind: 'park',
    },
  ],
  logan: [
    {
      label: 'Parks Canada — Kluane National Park',
      note: 'Official park pages for icefield / Logan expedition planning and permits.',
      url: 'https://parks.canada.ca/pn-np/yt/kluane',
      kind: 'park',
    },
  ],
  torres: [
    {
      label: 'CONAF — Torres del Paine',
      note: 'Chilean park authority information for Torres del Paine access, bookings, and trail rules.',
      url: 'https://www.conaf.cl/parques/parque-nacional-torres-del-paine/',
      kind: 'park',
    },
  ],
}

export function planningResourcesForPeak(
  peakId: string,
): PeakPlanningResource[] {
  return BY_PEAK[peakId] ?? []
}

export function peakHasPlanningResources(peakId: string): boolean {
  return planningResourcesForPeak(peakId).length > 0
}
