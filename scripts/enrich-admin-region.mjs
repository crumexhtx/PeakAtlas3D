/**
 * Fill peak.adminRegion from Nominatim reverse geocode of the summit.
 *
 * Run: node scripts/enrich-admin-region.mjs
 * Force overwrite: node scripts/enrich-admin-region.mjs --force
 * Limit: node scripts/enrich-admin-region.mjs --limit=5
 *
 * Respects Nominatim usage policy: ≤1 req/s, descriptive User-Agent, on-disk cache.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const peaksPath = join(root, 'src', 'data', 'peaks.json')
const cacheDir = join(root, 'scripts', '.cache')
const cachePath = join(cacheDir, 'nominatim-admin-region.json')
const UA =
  'PeakAtlas3D/0.3 (https://peakatlas3d.com; admin-region enrichment; hello@peakatlas3d.com)'
const force = process.argv.includes('--force')
const limitArg = process.argv.find((a) => a.startsWith('--limit='))
const limit = limitArg ? Number(limitArg.split('=')[1]) : Infinity

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

function cacheKey(lat, lon) {
  return `${Number(lat).toFixed(4)},${Number(lon).toFixed(4)}`
}

function loadCache() {
  try {
    return JSON.parse(readFileSync(cachePath, 'utf8'))
  } catch {
    return {}
  }
}

function saveCache(cache) {
  mkdirSync(cacheDir, { recursive: true })
  writeFileSync(cachePath, `${JSON.stringify(cache, null, 2)}\n`)
}

function adminFromNominatim(result) {
  const a = result?.address
  if (!a || typeof a !== 'object') return null
  const raw =
    a.state ||
    a.province ||
    a.region ||
    a.state_district ||
    a.county ||
    a.territory ||
    null
  if (typeof raw !== 'string' || !raw.trim()) return null
  return raw.trim()
}

async function reverseGeocode(lat, lon) {
  const url =
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2` +
    `&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}` +
    `&zoom=8&addressdetails=1`
  const res = await fetch(url, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
  })
  if (res.status === 429) {
    throw new Error('Nominatim rate-limited (429)')
  }
  if (!res.ok) throw new Error(`Nominatim ${res.status} ${res.statusText}`)
  return res.json()
}

const peaks = JSON.parse(readFileSync(peaksPath, 'utf8'))
const cache = loadCache()
let filled = 0
let skipped = 0
let queried = 0
let failed = 0

for (const peak of peaks) {
  if (!force && typeof peak.adminRegion === 'string' && peak.adminRegion.trim()) {
    skipped++
    continue
  }
  if (queried >= limit) continue

  const key = cacheKey(peak.lat, peak.lon)
  let admin = cache[key]?.adminRegion ?? null

  if (admin == null && !Object.prototype.hasOwnProperty.call(cache, key)) {
    try {
      await sleep(1100)
      const result = await reverseGeocode(peak.lat, peak.lon)
      admin = adminFromNominatim(result)
      cache[key] = {
        adminRegion: admin,
        displayName: result?.display_name ?? null,
        queriedAt: new Date().toISOString(),
      }
      queried++
      saveCache(cache)
    } catch (err) {
      failed++
      console.error(`${peak.id}: ${err.message ?? err}`)
      await sleep(2000)
      continue
    }
  }

  if (!admin) {
    console.warn(`${peak.id}: no admin region from Nominatim`)
    continue
  }
  peak.adminRegion = admin
  filled++
}

writeFileSync(peaksPath, `${JSON.stringify(peaks, null, 2)}\n`)
console.log(
  `adminRegion: filled=${filled} skipped=${skipped} queried=${queried} failed=${failed}`,
)
