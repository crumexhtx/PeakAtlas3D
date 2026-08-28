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
  nanga: [
    {
      label: 'Pakistan Alpine Club',
      note: 'National alpine body for Pakistan expedition context; Nanga Parbat permits run through licensed operators and government channels.',
      url: 'https://www.alpineclub.org.pk/',
      kind: 'federation',
    },
  ],
  gasherbrum1: [
    {
      label: 'Pakistan Alpine Club',
      note: 'Expedition coordination context for Gasherbrum peaks; permits via licensed operators and government channels.',
      url: 'https://www.alpineclub.org.pk/',
      kind: 'federation',
    },
  ],
  gasherbrum2: [
    {
      label: 'Pakistan Alpine Club',
      note: 'Expedition coordination context for Gasherbrum peaks; permits via licensed operators and government channels.',
      url: 'https://www.alpineclub.org.pk/',
      kind: 'federation',
    },
  ],
  broadpeak: [
    {
      label: 'Pakistan Alpine Club',
      note: 'Expedition coordination context for Broad Peak; permits via licensed operators and government channels.',
      url: 'https://www.alpineclub.org.pk/',
      kind: 'federation',
    },
  ],
  kangchen: [
    {
      label: 'Nepal Department of Tourism',
      note: 'Start here for Nepal-side expedition / climbing permit context; most Kangchenjunga teams book via a licensed operator.',
      url: 'https://www.tourism.gov.np/',
      kind: 'agency',
    },
  ],
  lhotse: [
    {
      label: 'Nepal Department of Tourism',
      note: 'Nepal-side climbing permit context for Lhotse; most teams book via a licensed operator.',
      url: 'https://www.tourism.gov.np/',
      kind: 'agency',
    },
  ],
  makalu: [
    {
      label: 'Nepal Department of Tourism',
      note: 'Nepal climbing permit context for Makalu; confirm current peak fees and park rules with a licensed operator.',
      url: 'https://www.tourism.gov.np/',
      kind: 'agency',
    },
  ],
  chooyu: [
    {
      label: 'Nepal Department of Tourism',
      note: 'Nepal-side permit context for Cho Oyu; Tibet-side climbs use Chinese agency channels.',
      url: 'https://www.tourism.gov.np/',
      kind: 'agency',
    },
  ],
  dhaula: [
    {
      label: 'Nepal Department of Tourism',
      note: 'Nepal climbing permit context for Dhaulagiri; conservation-area fees typically apply on the approach.',
      url: 'https://www.tourism.gov.np/',
      kind: 'agency',
    },
  ],
  manaslu: [
    {
      label: 'Nepal Department of Tourism',
      note: 'Nepal climbing / restricted-area permit context for Manaslu; most teams use a licensed operator.',
      url: 'https://www.tourism.gov.np/',
      kind: 'agency',
    },
  ],
  annapurna: [
    {
      label: 'Nepal Department of Tourism',
      note: 'Nepal climbing permit context for Annapurna I; ACAP fees apply on the approach.',
      url: 'https://www.tourism.gov.np/',
      kind: 'agency',
    },
  ],
  ama: [
    {
      label: 'Nepal Department of Tourism',
      note: 'Nepal climbing permit context for Ama Dablam; Sagarmatha / Khumbu fees apply.',
      url: 'https://www.tourism.gov.np/',
      kind: 'agency',
    },
  ],
  island: [
    {
      label: 'Nepal Department of Tourism',
      note: 'Nepal trekking-peak / climbing permit context for Island Peak (Imja Tse).',
      url: 'https://www.tourism.gov.np/',
      kind: 'agency',
    },
  ],
  fitzroy: [
    {
      label: 'Parque Nacional Los Glaciares (APN)',
      note: 'Official Argentine national parks guidance for El Chaltén / Fitz Roy area registration, trails, and climbing notice rules.',
      url: 'https://www.argentina.gob.ar/parquesnacionales/patagonia-austral/parque-nacional-los-glaciares',
      kind: 'park',
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
  teide: [
    {
      label: 'Tenerife ON — Teide summit permit',
      note: 'Official booking for Pico del Teide (PNT 10 Telesforo Bravo) above the cable-car top station.',
      url: 'https://www.tenerifeon.es/en/routes/hiking/pnt-10-telesforo-bravo',
      kind: 'permit',
    },
  ],
  cotopaxi: [
    {
      label: 'Cotopaxi National Park (Ecuador)',
      note: 'Park context for Cotopaxi access; glacier climbs are typically guided — confirm current volcanic status.',
      url: 'https://www.ambiente.gob.ec/',
      kind: 'park',
    },
  ],
  cook: [
    {
      label: 'DOC — Aoraki/Mount Cook National Park',
      note: 'New Zealand Department of Conservation park and alpine advice for Aoraki / Mount Cook.',
      url: 'https://www.doc.govt.nz/parks-and-recreation/places-to-go/canterbury/places/aoraki-mount-cook-national-park/',
      kind: 'park',
    },
  ],
  katahdin: [
    {
      label: 'Baxter State Park',
      note: 'Day-use parking reservations and park rules for Katahdin trailheads.',
      url: 'https://www.baxterstatepark.org/',
      kind: 'park',
    },
  ],
  grandteton: [
    {
      label: 'Grand Teton National Park — climbing',
      note: 'NPS climbing registration and backcountry guidance for the Teton Range.',
      url: 'https://www.nps.gov/grte/planyourvisit/climbing.htm',
      kind: 'permit',
    },
  ],
  haleakala: [
    {
      label: 'Haleakalā National Park',
      note: 'NPS park pages including sunrise reservation guidance for the summit district.',
      url: 'https://www.nps.gov/hale/',
      kind: 'park',
    },
  ],
  kenya: [
    {
      label: 'Kenya Wildlife Service',
      note: 'Park and climbing fee context for Mount Kenya National Park.',
      url: 'https://www.kws.go.ke/',
      kind: 'agency',
    },
  ],
  ararat: [
    {
      label: 'Republic of Türkiye tourism / permit channels',
      note: 'Ararat climbing permits are arranged through licensed Turkish agencies — confirm current provincial rules.',
      url: 'https://www.ktb.gov.tr/',
      kind: 'agency',
    },
  ],
  hallasan: [
    {
      label: 'Korea National Park Service',
      note: 'National park guidance and trail reservation context for Hallasan on Jeju.',
      url: 'https://www.knps.or.kr/eng/',
      kind: 'park',
    },
  ],
  orizaba: [
    {
      label: 'CONANP (Mexico protected areas)',
      note: 'Mexican protected-area context; Orizaba climbs are commonly arranged via licensed local operators.',
      url: 'https://www.gob.mx/conanp',
      kind: 'agency',
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
