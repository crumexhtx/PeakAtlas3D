/**
 * Add backlog peak (Priority 1): Licancabur (Chile/Bolivia).
 *
 * Other Priority 1 and Priority 3 entries were researched but skipped; the
 * reasons are listed in the weekly PR (missing prominence, season or permit
 * source, or fewer than 2 geotagged landscape Commons photos within 15 km).
 *
 * Sources (do not invent):
 * - Elevation (5,916 m), coordinates, first ascents, "can be ascended year
 *   round, although caution is needed during winter", "ascents take six hours",
 *   Bolivian-side approach, Antofagasta Region / Potosí Department: English
 *   Wikipedia "Licancabur".
 * - Prominence (1,426 m): Wikidata Q422713 (property P2660), also the
 *   commented-out value in the English Wikipedia infobox.
 * - San Pedro de Atacama coordinates: Wikidata Q187893.
 * - Permits: no official Bolivian (SERNAP) or Chilean (CONAF/DIFROL) page that
 *   states a rule for Licancabur could be found, so permitStatus is
 *   "unsourced" and the notes say so.
 * Run: node scripts/add-licancabur.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  photoMatchesPeak,
  resolveFileTitles,
  slimPhoto,
} from './lib/photo-match.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const peaksPath = join(root, 'src', 'data', 'peaks.json')

const CURATED = {
  licancabur: [
    'File:Licancabur LagunaVerde.jpg',
    'File:Licancabur and Laguna Verde (9466138491).jpg',
  ],
}

function milesBetween(aLat, aLon, bLat, bLon) {
  const toRad = (d) => (d * Math.PI) / 180
  const dLat = toRad(bLat - aLat)
  const dLon = toRad(bLon - aLon)
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLon / 2) ** 2
  return Math.round(3958.8 * 2 * Math.asin(Math.min(1, Math.sqrt(s))))
}

function town(name, region, lat, lon, peakLat, peakLon) {
  return {
    name,
    region,
    distanceMiles: milesBetween(peakLat, peakLon, lat, lon),
    lat,
    lon,
  }
}

const LIC = { lat: -22.8339, lon: -67.8836 }
const SPA = { lat: -22.9108, lon: -68.2001 }

const NEW_PEAKS = [
  {
    id: 'licancabur',
    name: 'Licancabur',
    lat: LIC.lat,
    lon: LIC.lon,
    elevationFt: 19409,
    prominenceFt: 4678,
    range: 'Andes',
    country: 'Chile/Bolivia',
    adminRegion: 'Antofagasta/Potosí',
    description:
      'A symmetrical stratovolcano on the Bolivia–Chile border, capped by a 400–500 m wide crater that holds one of the highest lakes in the world. Wikipedia says it can be seen from San Pedro de Atacama and that climbers typically approach from the Bolivian side. Ascents take about six hours up and about half that down, and weather can turn quickly on the unstable upper cone. Inca ceremonial structures survive on the summit and at its northeastern foot.',
    firstAscent:
      'Inca or Atacameño people; first documented ascent by Severo Titichoca, November 1884',
    difficulty: 'Non-technical high-altitude hike (about 6 hours up)',
    difficultyTier: 'strenuous-hike',
    aliases: ['Volcán Licancabur', 'Licancáguar', 'Tata Likanku'],
    bestSeason: 'Year-round (weather dependent)',
    whyNotable:
      'A cone-shaped border volcano above Laguna Verde, with Inca ruins and a crater lake near the summit.',
    seoMetaDescription:
      'Licancabur trip guide: 19,409 ft Chile–Bolivia border volcano, non-technical climb, year-round with winter caution, San Pedro de Atacama, 3D terrain on PeakAtlas3D.',
    nearestTown: town(
      'San Pedro de Atacama',
      'Antofagasta Region',
      SPA.lat,
      SPA.lon,
      LIC.lat,
      LIC.lon,
    ),
    nearbyPlaces: [
      town(
        'San Pedro de Atacama',
        'Antofagasta Region',
        SPA.lat,
        SPA.lon,
        LIC.lat,
        LIC.lon,
      ),
    ],
    trails: [{ name: 'Bolivian-side route to the summit crater' }],
    permitRequired: null,
    permitStatus: 'unsourced',
    permitNotes:
      'Permit and access rules were not verified from an official source. The summit sits on the Chile–Bolivia border, and Wikipedia says climbers typically approach from the Bolivian side. Check current entry, guide and border-zone rules with the Bolivian protected-area service (SERNAP), Chilean authorities (CONAF and DIFROL for border areas) and a local operator before you go.',
    afterId: 'ojosdelsalado',
  },
]

async function photosFor(peak) {
  const curated = await resolveFileTitles(CURATED[peak.id] || [])
  const out = []
  for (const ph of curated) {
    const m = photoMatchesPeak(peak, ph, { slot: out.length })
    if (!m.ok) {
      console.warn(`  skip curated ${peak.id}: ${m.reason} (${ph.title || ph.url})`)
      continue
    }
    out.push(slimPhoto(ph))
  }
  return out.slice(0, 2)
}

const peaks = JSON.parse(readFileSync(peaksPath, 'utf8'))
const added = []
const failed = []

for (const draft of NEW_PEAKS) {
  if (peaks.some((p) => p.id === draft.id)) {
    console.log(`skip existing ${draft.id}`)
    continue
  }
  console.log(`photos ${draft.id}…`)
  const photos = await photosFor(draft)
  if (photos.length < 2) {
    console.error(`FEWER THAN 2 PHOTOS for ${draft.id} — skipping`)
    failed.push(draft.id)
    continue
  }
  const { afterId, ...rest } = draft
  const peak = {
    ...rest,
    hotels: [],
    food: [],
    trails: rest.trails ?? [],
    photo: photos[0],
    photos,
  }
  let idx = peaks.findIndex((p) => p.id === afterId)
  if (idx < 0) idx = peaks.length - 1
  peaks.splice(idx + 1, 0, peak)
  added.push(draft.id)
  console.log(`  + ${draft.id} (${photos.length} photos)`)
}

writeFileSync(peaksPath, `${JSON.stringify(peaks, null, 2)}\n`)
console.log(
  `\nDone. added=${added.length}: ${added.join(', ') || '(none)'} · failed=${failed.join(', ') || '(none)'} · total=${peaks.length}`,
)
