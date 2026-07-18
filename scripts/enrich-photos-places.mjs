/**
 * Enrich peaks.json with:
 *  - photo (Wikimedia Commons still + credit/license)
 *  - nearbyPlaces (2–3 towns/cities via Nominatim, seeded with nearestTown)
 *
 * Run: node scripts/enrich-photos-places.mjs
 * Resume-safe: skips peaks that already have photo + nearbyPlaces.length >= 2
 * Force: node scripts/enrich-photos-places.mjs --force
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const path = join(root, 'src', 'data', 'peaks.json')
const force = process.argv.includes('--force')
const UA = 'PeakAtlas3D/0.1 (https://peakatlas3d.com; atlas enrichment script)'

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

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

function stripHtml(s) {
  return String(s ?? '')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .trim()
}

function searchName(peak) {
  return peak.name.replace(/^Mt\.\s+/i, 'Mount ').trim()
}

async function fetchJson(url) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': UA,
      Accept: 'application/json',
    },
  })
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`)
  return res.json()
}

async function fetchPhoto(peak) {
  const q = encodeURIComponent(`${searchName(peak)} mountain`)
  const api =
    `https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*` +
    `&generator=search&gsrnamespace=6&gsrsearch=${q}&gsrlimit=8` +
    `&prop=imageinfo&iiprop=url|extmetadata|size|mime&iiurlwidth=960`

  const data = await fetchJson(api)
  const pages = Object.values(data?.query?.pages ?? {})
  const candidates = pages
    .map((page) => {
      const info = page.imageinfo?.[0]
      if (!info) return null
      const mime = info.mime ?? ''
      if (!mime.startsWith('image/') || mime.includes('svg')) return null
      if ((info.width ?? 0) < 640 || (info.height ?? 0) < 400) return null
      const meta = info.extmetadata ?? {}
      const license = stripHtml(meta.LicenseShortName?.value || meta.License?.value || 'Unknown')
      const artist = stripHtml(meta.Artist?.value || 'Unknown')
      const credit = artist.length > 80 ? `${artist.slice(0, 77)}…` : artist
      return {
        url: info.thumburl || info.url,
        credit,
        license,
        sourceUrl: info.descriptionurl || info.url,
        width: info.width,
        height: info.height,
      }
    })
    .filter(Boolean)
    .sort((a, b) => b.width * b.height - a.width * a.height)

  if (!candidates.length) return null
  const best = candidates[0]
  return {
    url: best.url,
    credit: best.credit,
    license: best.license,
    sourceUrl: best.sourceUrl,
  }
}

/** Degrees for ~radiusMiles at mid-latitudes (good enough for viewbox). */
function viewboxAround(lat, lon, radiusMiles) {
  const latDelta = radiusMiles / 69
  const lonDelta = radiusMiles / (Math.cos((lat * Math.PI) / 180) * 69.172)
  // Nominatim viewbox: left, top, right, bottom
  return [
    lon - lonDelta,
    lat + latDelta,
    lon + lonDelta,
    lat - latDelta,
  ]
    .map((n) => n.toFixed(5))
    .join(',')
}

async function searchPlacesInViewbox(peak, query) {
  const viewbox = viewboxAround(peak.lat, peak.lon, 95)
  const url =
    `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1` +
    `&limit=16&bounded=1&viewbox=${viewbox}` +
    `&q=${encodeURIComponent(query)}`
  return fetchJson(url)
}

async function fetchNearbyFromNominatim(peak) {
  // Two light queries (city, then town) — more reliable than a vague combined q.
  const cityRows = await searchPlacesInViewbox(peak, 'city')
  await sleep(1100)
  const townRows = await searchPlacesInViewbox(peak, 'town')
  const rows = [...(cityRows ?? []), ...(townRows ?? [])]

  const peakKey = peak.name.toLowerCase()
  const seen = new Set()
  const places = []

  for (const row of rows) {
    const name = row.name || row.display_name?.split(',')[0]
    const lat = Number(row.lat)
    const lon = Number(row.lon)
    if (!name || !Number.isFinite(lat) || !Number.isFinite(lon)) continue

    const type = row.type || row.addresstype || ''
    if (!['city', 'town', 'village', 'municipality'].includes(type) && row.class !== 'place') {
      continue
    }

    const key = name.toLowerCase()
    if (seen.has(key)) continue
    if (key.includes(peakKey) || peakKey.includes(key)) continue

    const distanceMiles = haversineMiles(peak.lat, peak.lon, lat, lon)
    if (distanceMiles < 1.5 || distanceMiles > 110) continue

    const addr = row.address ?? {}
    const region =
      addr.state ||
      addr.province ||
      addr.region ||
      addr.county ||
      addr.country ||
      peak.country

    seen.add(key)
    places.push({
      name,
      region,
      distanceMiles: Math.round(distanceMiles * 10) / 10,
      lat,
      lon,
    })
  }

  places.sort((a, b) => a.distanceMiles - b.distanceMiles)
  return places
}

function mergeNearby(peak, fetched) {
  const seed = peak.nearestTown
    ? [
        {
          name: peak.nearestTown.name,
          region: peak.nearestTown.region,
          distanceMiles: peak.nearestTown.distanceMiles,
          route: peak.nearestTown.route,
          lat: peak.nearestTown.lat,
          lon: peak.nearestTown.lon,
        },
      ]
    : []

  const seen = new Set(seed.map((p) => p.name.toLowerCase()))
  const merged = [...seed]

  for (const place of fetched) {
    if (seen.has(place.name.toLowerCase())) continue
    seen.add(place.name.toLowerCase())
    merged.push(place)
    if (merged.length >= 3) break
  }

  return merged.slice(0, 3)
}

function alreadyDone(peak) {
  return Boolean(peak.photo?.url) && Array.isArray(peak.nearbyPlaces) && peak.nearbyPlaces.length >= 2
}

function save(peaks) {
  writeFileSync(path, `${JSON.stringify(peaks, null, 2)}\n`)
}

const peaks = JSON.parse(readFileSync(path, 'utf8'))
let updated = 0
let photos = 0
let placeSets = 0

for (let i = 0; i < peaks.length; i++) {
  const peak = peaks[i]
  const label = `[${i + 1}/${peaks.length}] ${peak.id}`

  if (!force && alreadyDone(peak)) {
    console.log(`${label} skip`)
    continue
  }

  try {
    if (force || !peak.photo?.url) {
      await sleep(400)
      const photo = await fetchPhoto(peak)
      if (photo) {
        peak.photo = photo
        photos++
        console.log(`${label} photo ok`)
      } else {
        console.log(`${label} photo miss`)
      }
    }

    if (force || !peak.nearbyPlaces || peak.nearbyPlaces.length < 2) {
      // Nominatim usage policy: max ~1 req/sec
      await sleep(1100)
      const fetched = await fetchNearbyFromNominatim(peak)
      peak.nearbyPlaces = mergeNearby(peak, fetched)
      if (peak.nearbyPlaces[0]) peak.nearestTown = peak.nearbyPlaces[0]
      placeSets++
      console.log(
        `${label} places (${peak.nearbyPlaces.length}): ${peak.nearbyPlaces.map((p) => p.name).join(', ')}`,
      )
    }

    updated++
    if (updated % 3 === 0) {
      save(peaks)
      console.log('  checkpoint saved')
    }
  } catch (err) {
    console.error(`${label} FAILED:`, err.message ?? err)
    save(peaks)
    await sleep(2500)
  }
}

for (const peak of peaks) {
  if (!peak.nearbyPlaces?.length && peak.nearestTown) {
    peak.nearbyPlaces = [
      {
        name: peak.nearestTown.name,
        region: peak.nearestTown.region,
        distanceMiles: peak.nearestTown.distanceMiles,
        route: peak.nearestTown.route,
        lat: peak.nearestTown.lat,
        lon: peak.nearestTown.lon,
      },
    ]
  }
}

save(peaks)
console.log(`\nDone. photos=${photos} place-sets=${placeSets} touched=${updated}`)
