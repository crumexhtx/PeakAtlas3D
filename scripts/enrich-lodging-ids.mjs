/**
 * Lodging enrich for specific peak ids only (safe; does not rewrite whole catalog).
 * Run: node scripts/enrich-lodging-ids.mjs maunakea sthelens
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const path = join(root, 'src', 'data', 'peaks.json')
const ids = process.argv.slice(2)
if (!ids.length) {
  console.error('Usage: node scripts/enrich-lodging-ids.mjs <id> [id...]')
  process.exit(1)
}

const UA = 'PeakAtlas3D/0.1 (https://peakatlas3d.com; lodging enrichment)'
const OVERPASS_URLS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
]
const RADIUS_M = 25_000
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

function centerOf(el) {
  if (el.type === 'node') return { lat: el.lat, lon: el.lon }
  if (el.center) return { lat: el.center.lat, lon: el.center.lon }
  return null
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
        lastError = new Error(`Overpass ${res.status}`)
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
      sourceUrl: `https://www.openstreetmap.org/${el.type}/${el.id}`,
      _miles: miles,
    })
  }
  return mapped
    .sort((a, b) => a._miles - b._miles)
    .slice(0, MAX_PER_PEAK)
    .map(({ _miles, ...rest }) => rest)
}

const peaks = JSON.parse(readFileSync(path, 'utf8'))

for (const id of ids) {
  const peak = peaks.find((p) => p.id === id)
  if (!peak) {
    console.error(`Missing peak: ${id}`)
    continue
  }
  const originLat = peak.nearestTown?.lat ?? peak.lat
  const originLon = peak.nearestTown?.lon ?? peak.lon
  process.stdout.write(`Lodging ${id}… `)
  try {
    const data = await fetchLodging(originLat, originLon)
    let hotels = mapElements(data.elements, peak.lat, peak.lon)
    if (!hotels.length && (originLat !== peak.lat || originLon !== peak.lon)) {
      await sleep(1200)
      const summitData = await fetchLodging(peak.lat, peak.lon)
      hotels = mapElements(summitData.elements, peak.lat, peak.lon)
    }
    peak.hotels = hotels
    console.log(hotels.length ? `${hotels.length} places` : 'none nearby')
    writeFileSync(path, `${JSON.stringify(peaks, null, 2)}\n`)
  } catch (err) {
    console.log(`error: ${err.message}`)
  }
  await sleep(1500)
}

console.log('Done.')
