/**
 * Replace peak.hotels with OpenStreetMap lodging near the summit / staging town.
 *
 * Run: node scripts/enrich-lodging.mjs
 * Resume-safe: skips peaks that already have OSM-sourced hotels
 * Force: node scripts/enrich-lodging.mjs --force
 * Limit: node scripts/enrich-lodging.mjs --limit=5
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const path = join(root, 'src', 'data', 'peaks.json')
const force = process.argv.includes('--force')
const limitArg = process.argv.find((a) => a.startsWith('--limit='))
const limit = limitArg ? Number(limitArg.split('=')[1]) : Infinity

const UA = 'PeakAtlas3D/0.1 (https://peakatlas3d.com; lodging enrichment)'
const OVERPASS_URLS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
]
const RADIUS_M = 25_000
/** Drop results farther than this from the summit (avoids town→summit mismatches). */
const MAX_SUMMIT_MILES = 50
const MAX_PER_PEAK = 3
const REJECT_NAME = /\b(lookout|porch|viewpoint|picnic|campground|campsite)\b/i
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const TOURISM_CATEGORY = {
  hotel: 'Hotel',
  motel: 'Motel',
  hostel: 'Hostel',
  guest_house: 'Guest house',
  alpine_hut: 'Alpine hut',
  wilderness_hut: 'Wilderness hut',
  chalet: 'Chalet',
  apartment: 'Apartment',
}

function haversineMiles(lat1, lon1, lat2, lon2) {
  const R = 3958.7613
  const toRad = (d) => (d * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(a))
}

function hasOsmLodging(peak) {
  return (
    Array.isArray(peak.hotels) &&
    peak.hotels.length > 0 &&
    peak.hotels.every((h) => h.source === 'OpenStreetMap' && h.sourceUrl)
  )
}

function centerOf(el) {
  if (el.type === 'node') return { lat: el.lat, lon: el.lon }
  if (el.center) return { lat: el.center.lat, lon: el.center.lon }
  return null
}

function osmUrl(el) {
  return `https://www.openstreetmap.org/${el.type}/${el.id}`
}

async function fetchLodging(lat, lon) {
  const query = `
[out:json][timeout:60];
(
  node["tourism"~"^(hotel|motel|hostel|guest_house|alpine_hut|wilderness_hut|chalet)$"](around:${RADIUS_M},${lat},${lon});
  way["tourism"~"^(hotel|motel|hostel|guest_house|alpine_hut|wilderness_hut|chalet)$"](around:${RADIUS_M},${lat},${lon});
  relation["tourism"~"^(hotel|motel|hostel|guest_house|alpine_hut|wilderness_hut|chalet)$"](around:${RADIUS_M},${lat},${lon});
);
out center tags ${MAX_PER_PEAK * 8};
`.trim()

  let lastError = null
  for (const url of OVERPASS_URLS) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'User-Agent': UA,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `data=${encodeURIComponent(query)}`,
      })
      if (!res.ok) {
        lastError = new Error(`Overpass ${res.status} ${res.statusText}`)
        await sleep(800)
        continue
      }
      return res.json()
    } catch (err) {
      lastError = err
      await sleep(800)
    }
  }
  throw lastError ?? new Error('Overpass unavailable')
}

function mapElements(elements, peakLat, peakLon) {
  const seen = new Set()
  const mapped = []

  for (const el of elements ?? []) {
    const name = el.tags?.name?.trim()
    const tourism = el.tags?.tourism
    const center = centerOf(el)
    if (!name || !tourism || !center) continue
    if (REJECT_NAME.test(name)) continue

    const key = `${name.toLowerCase()}|${center.lat.toFixed(4)}|${center.lon.toFixed(4)}`
    if (seen.has(key)) continue
    seen.add(key)

    const miles = haversineMiles(peakLat, peakLon, center.lat, center.lon)
    if (miles > MAX_SUMMIT_MILES) continue

    mapped.push({
      name,
      category: TOURISM_CATEGORY[tourism] || 'Lodging',
      note: `${miles.toFixed(1)} mi from summit`,
      lat: Number(center.lat.toFixed(5)),
      lon: Number(center.lon.toFixed(5)),
      source: 'OpenStreetMap',
      sourceUrl: osmUrl(el),
      _miles: miles,
    })
  }

  return mapped
    .sort((a, b) => a._miles - b._miles)
    .slice(0, MAX_PER_PEAK)
    .map(({ _miles, ...rest }) => rest)
}

function save(peaks) {
  writeFileSync(path, `${JSON.stringify(peaks, null, 2)}\n`)
}

const peaks = JSON.parse(readFileSync(path, 'utf8'))
let updated = 0
let skipped = 0
let empty = 0
let processed = 0

for (const peak of peaks) {
  if (processed >= limit) break
  if (!force && hasOsmLodging(peak)) {
    skipped += 1
    continue
  }

  processed += 1
  const originLat = peak.nearestTown?.lat ?? peak.lat
  const originLon = peak.nearestTown?.lon ?? peak.lon

  process.stdout.write(`Lodging ${peak.id}… `)
  try {
    const data = await fetchLodging(originLat, originLon)
    let hotels = mapElements(data.elements, peak.lat, peak.lon)

    // Fallback: search around the summit if the staging town returned nothing.
    if (!hotels.length && (originLat !== peak.lat || originLon !== peak.lon)) {
      await sleep(1200)
      const summitData = await fetchLodging(peak.lat, peak.lon)
      hotels = mapElements(summitData.elements, peak.lat, peak.lon)
    }

    peak.hotels = hotels
    if (hotels.length) {
      updated += 1
      console.log(`${hotels.length} places`)
    } else {
      empty += 1
      console.log('none nearby')
    }
    save(peaks)
  } catch (err) {
    console.log(`error: ${err.message}`)
  }

  await sleep(2500)
}

console.log(
  `Done. updated=${updated} empty=${empty} skipped=${skipped} total=${peaks.length}`,
)
