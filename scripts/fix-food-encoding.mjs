/**
 * Fix mojibake in food place names (e.g. Caf?? → Café) and strip synthetic ratings.
 *
 * Run: node scripts/fix-food-encoding.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const path = join(root, 'src', 'data', 'peaks.json')

const peaks = JSON.parse(readFileSync(path, 'utf8'))
let namesFixed = 0
let ratingsCleared = 0

for (const peak of peaks) {
  if (!Array.isArray(peak.food)) continue
  for (const place of peak.food) {
    if (typeof place.name === 'string' && place.name.includes('??')) {
      const next = place.name
        .replace(/Caf\?\?/g, 'Café')
        .replace(/\?\?/g, 'é')
      if (next !== place.name) {
        place.name = next
        namesFixed += 1
      }
    }
    if (place.rating != null) {
      delete place.rating
      ratingsCleared += 1
    }
  }
}

writeFileSync(path, `${JSON.stringify(peaks, null, 2)}\n`)
console.log(`Done. namesFixed=${namesFixed} ratingsCleared=${ratingsCleared}`)
