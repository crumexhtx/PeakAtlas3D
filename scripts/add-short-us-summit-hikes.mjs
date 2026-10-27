/**
 * Add short, famous US summit hikes from docs/peak-backlog.md (Priority 2).
 * Facts come from Wikipedia/Wikidata/Peakbagger (elevation, prominence, coords)
 * and official park pages (DLNR, TPWD, NPS) for access rules — do not invent.
 * Run: node scripts/add-short-us-summit-hikes.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  fetchMatchingPhotos,
  photoMatchesPeak,
  resolveFileTitles,
  slimPhoto,
} from './lib/photo-match.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const peaksPath = join(root, 'src', 'data', 'peaks.json')

const CURATED = {
  diamondhead: [],
  enchantedrock: [],
  emory: [],
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

function town(name, region, route, lat, lon, peakLat, peakLon) {
  return {
    name,
    region,
    distanceMiles: milesBetween(peakLat, peakLon, lat, lon),
    route,
    lat,
    lon,
  }
}

const DH = { lat: 21.26194, lon: -157.80556 }
const ER = { lat: 30.5066, lon: -98.8189 }
const EP = { lat: 29.2459, lon: -103.3051 }

const NEW_PEAKS = [
  {
    id: 'diamondhead',
    name: 'Diamond Head',
    lat: DH.lat,
    lon: DH.lon,
    elevationFt: 762,
    prominenceFt: 596,
    range: 'Hawaiian Islands',
    country: 'USA',
    adminRegion: 'Hawaii',
    description:
      'Lēʻahi, the volcanic tuff cone above Waikīkī on Oʻahu. A 0.8-mile state-monument trail climbs about 560 feet from the crater floor, up steep stairs and a lit 225-foot tunnel, to a 1911 fire-control station at the summit.',
    firstAscent: 'Not recorded (summit trail built 1908)',
    difficulty: 'Short, steep trail hike',
    difficultyTier: 'day-hike',
    aliases: ['Lēʻahi', 'Leahi', 'Diamond Head Crater'],
    bestSeason: 'Year-round (weather dependent)',
    whyNotable:
      'Hawaiʻi’s most recognized landmark and a Waikīkī backdrop, with an easy-to-reach summit trail in a State Monument.',
    seoMetaDescription:
      'Diamond Head (Lēʻahi) trip guide: 0.8-mile summit trail, year-round access, non-resident entry reservations, Honolulu staging, 3D terrain on PeakAtlas3D.',
    nearestTown: town(
      'Honolulu',
      'Hawaii',
      'Diamond Head Rd / Monsarrat Ave',
      21.3,
      -157.85,
      DH.lat,
      DH.lon,
    ),
    nearbyPlaces: [
      town(
        'Waikīkī',
        'Hawaii',
        'Kalākaua Ave',
        21.2752,
        -157.8312,
        DH.lat,
        DH.lon,
      ),
    ],
    trails: [{ name: 'Diamond Head Summit Trail' }],
    permitRequired: true,
    permitStatus: 'required',
    permitNotes:
      'Hawaiʻi DLNR State Parks requires entry and parking reservations for non-residents; Hawaiʻi residents enter free with ID. Last entry 4:30 pm, gates close 6 pm, closed Christmas and New Year’s Day — confirm current rules at gostateparks.hawaii.gov.',
    afterId: 'maunaloa',
  },
  {
    id: 'enchantedrock',
    name: 'Enchanted Rock',
    lat: ER.lat,
    lon: ER.lon,
    elevationFt: 1825,
    prominenceFt: 427,
    range: 'Llano Uplift',
    country: 'USA',
    adminRegion: 'Texas',
    description:
      'A 425-foot pink granite dome in Enchanted Rock State Natural Area, about 17 miles north of Fredericksburg in the Texas Hill Country. The Summit Trail climbs the bare granite; the dome is the largest pink granite monadnock in the United States.',
    firstAscent: 'Not recorded (used by Native peoples for thousands of years)',
    difficulty: 'Short granite-dome hike',
    difficultyTier: 'day-hike',
    aliases: ['E-Rock', 'Enchanted Rock State Natural Area'],
    bestSeason: 'Oct–Apr',
    whyNotable:
      'Texas Hill Country’s signature granite dome and a National Natural Landmark inside an International Dark Sky Park.',
    seoMetaDescription:
      'Enchanted Rock trip guide: Summit Trail hike, Oct–Apr, day-pass entry, Fredericksburg staging, 3D terrain on PeakAtlas3D.',
    nearestTown: town(
      'Fredericksburg',
      'Texas',
      'Ranch Road 965',
      30.2639,
      -98.8747,
      ER.lat,
      ER.lon,
    ),
    nearbyPlaces: [
      town('Llano', 'Texas', 'Ranch Road 965 / TX-16', 30.7478, -98.6758, ER.lat, ER.lon),
    ],
    trails: [{ name: 'Summit Trail' }],
    permitRequired: false,
    permitStatus: 'not_required',
    permitNotes:
      'No summit permit. A daily entrance fee applies, and Texas Parks & Wildlife advises reserving a day pass online to guarantee entry (busy season is September through May; July average high is 95°F). The Summit Trail can close in wet weather; the backcountry area needs a permit from park headquarters.',
    afterId: 'guadalupe',
  },
  {
    id: 'emory',
    name: 'Emory Peak',
    lat: EP.lat,
    lon: EP.lon,
    elevationFt: 7825,
    prominenceFt: 4485,
    range: 'Chisos Mountains',
    country: 'USA',
    adminRegion: 'Texas',
    description:
      'Highest peak in the Chisos Mountains and in Big Bend National Park. The NPS rates the 10-mile round-trip hike from the Chisos Basin trailhead as strenuous: 3.5 miles up the Pinnacles Trail, then a 1.5-mile spur whose last 25 feet are a scramble up an exposed rock face.',
    firstAscent: 'Not recorded',
    difficulty: 'Strenuous hike with a short exposed scramble',
    difficultyTier: 'strenuous-hike',
    aliases: [],
    bestSeason: 'Nov–Apr',
    whyNotable:
      'Big Bend National Park’s high point and the most prominent peak in Texas.',
    seoMetaDescription:
      'Emory Peak trip guide: 10-mile strenuous hike with a short scramble, Nov–Apr busy season, Big Bend backcountry permits, 3D terrain on PeakAtlas3D.',
    nearestTown: town(
      'Terlingua',
      'Texas',
      'TX-118 / Basin Road',
      29.2992,
      -103.5794,
      EP.lat,
      EP.lon,
    ),
    nearbyPlaces: [
      town(
        'Study Butte',
        'Texas',
        'TX-118',
        29.335,
        -103.5422,
        EP.lat,
        EP.lon,
      ),
    ],
    trails: [{ name: 'Emory Peak Trail' }, { name: 'Pinnacles Trail' }],
    permitRequired: false,
    permitStatus: 'not_required',
    permitNotes:
      'No permit for the day hike. Big Bend National Park requires a backcountry permit for any overnight stay in the Chisos Mountains, plus the park entrance fee. Big Bend’s busy season is generally November through April.',
    afterId: 'guadalupe',
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
  if (out.length >= 2) return out.slice(0, 2)

  try {
    const fetched = await fetchMatchingPhotos(
      peak,
      2,
      new Set(out.map((p) => p.url.split('/').pop())),
    )
    for (const ph of fetched) {
      if (out.length >= 2) break
      if (out.some((x) => x.url === ph.url)) continue
      out.push(slimPhoto(ph))
    }
  } catch (err) {
    console.warn(`search failed ${peak.id}:`, err.message)
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
  if (photos.length < 1) {
    console.error(`NO PHOTOS for ${draft.id} — skipping`)
    failed.push(draft.id)
    continue
  }
  if (photos.length < 2) {
    console.warn(`  only ${photos.length} photo(s) for ${draft.id}`)
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
