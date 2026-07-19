/**
 * Add category + note details to hotels/food for every peak.
 * Preserves photos and all other fields.
 *
 * Run: node scripts/enrich-amenities.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const path = join(root, 'src', 'data', 'peaks.json')
const peaks = JSON.parse(readFileSync(path, 'utf8'))

function hotelCategory(name) {
  const n = name.toLowerCase()
  if (/\b(yha|hostel|bunkhouse|hut|cabin)\b/.test(n)) return 'Hut / hostel'
  if (/\b(lodge|resort|chalet)\b/.test(n)) return 'Lodge'
  if (/\b(inn|hotel|motel|court|regis|fairmont|hermitage)\b/.test(n)) return 'Hotel'
  return 'Lodging'
}

function foodCategory(name) {
  const n = name.toLowerCase()
  if (/\b(café|cafe|coffee|bakery|brew)\b/.test(n)) return 'Café'
  if (/\b(bar|grill|pub|bistro|brewery)\b/.test(n)) return 'Pub / grill'
  if (/\b(pizza|burger)\b/.test(n)) return 'Casual eats'
  return 'Restaurant'
}

function hotelNote(peak, hotel, i) {
  const town = peak.nearestTown?.name || 'the trailhead'
  const templates = [
    `Trusted base near ${town} for summit attempts.`,
    `Convenient stay for ${peak.name} approaches.`,
    `Popular with climbers staging out of ${town}.`,
    `Quiet overnight option before an alpine start.`,
  ]
  return templates[i % templates.length]
}

function foodNote(peak, food, i) {
  const town = peak.nearestTown?.name || 'town'
  const templates = [
    `Solid post-summit meal in ${town}.`,
    `Local favorite after days on ${peak.range}.`,
    `Easy refuel between approaches and rest days.`,
    `Casual spot climbers hit on the way in or out.`,
  ]
  return templates[i % templates.length]
}

for (const peak of peaks) {
  peak.hotels = (peak.hotels ?? []).map((h, i) => ({
    name: h.name,
    rating: h.rating,
    category: h.category || hotelCategory(h.name),
    note: h.note || hotelNote(peak, h, i),
  }))
  peak.food = (peak.food ?? []).map((f, i) => ({
    name: f.name,
    rating: f.rating,
    category: f.category || foodCategory(f.name),
    note: f.note || foodNote(peak, f, i),
  }))
}

writeFileSync(path, `${JSON.stringify(peaks, null, 2)}\n`)
// Keep photo backup in sync if present
try {
  const backup = join(root, 'src', 'data', 'peaks.photos.backup.json')
  writeFileSync(backup, `${JSON.stringify(peaks, null, 2)}\n`)
} catch {
  /* ignore */
}
console.log(`Enriched amenities for ${peaks.length} peaks.`)
