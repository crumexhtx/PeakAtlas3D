/**
 * Drop hotels farther than MAX_SUMMIT_MILES from the summit, and reject
 * lookout/porch-style names left over from earlier enrich runs.
 *
 * Run: node scripts/scrub-lodging.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const path = join(root, 'src', 'data', 'peaks.json')
const MAX_SUMMIT_MILES = 50
const REJECT_NAME = /\b(lookout|porch|viewpoint|picnic|campground|campsite)\b/i

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

function milesFromNote(note) {
  const m = String(note || '').match(/([\d.]+)\s*mi\b/i)
  return m ? Number(m[1]) : null
}

const peaks = JSON.parse(readFileSync(path, 'utf8'))
let removed = 0
let peaksTouched = 0

for (const peak of peaks) {
  if (!Array.isArray(peak.hotels) || !peak.hotels.length) continue
  const before = peak.hotels.length
  peak.hotels = peak.hotels.filter((h) => {
    if (REJECT_NAME.test(h.name || '')) return false
    let miles = null
    if (
      typeof h.lat === 'number' &&
      typeof h.lon === 'number' &&
      Number.isFinite(h.lat) &&
      Number.isFinite(h.lon)
    ) {
      miles = haversineMiles(peak.lat, peak.lon, h.lat, h.lon)
    } else {
      miles = milesFromNote(h.note)
    }
    if (miles == null || !Number.isFinite(miles)) return true
    return miles <= MAX_SUMMIT_MILES
  })
  const dropped = before - peak.hotels.length
  if (dropped > 0) {
    removed += dropped
    peaksTouched += 1
    console.log(`${peak.id}: removed ${dropped} (now ${peak.hotels.length})`)
  }
}

writeFileSync(path, `${JSON.stringify(peaks, null, 2)}\n`)
console.log(`Done. removed=${removed} peaksTouched=${peaksTouched}`)
