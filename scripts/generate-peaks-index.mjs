/**
 * Build src/data/peaks.index.json — lightweight map/search rows from peaks.json.
 * Run: node scripts/generate-peaks-index.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const peaksPath = join(root, 'src', 'data', 'peaks.json')
const outPath = join(root, 'src', 'data', 'peaks.index.json')

const peaks = JSON.parse(readFileSync(peaksPath, 'utf8'))
if (!Array.isArray(peaks)) {
  console.error('peaks.json must be an array')
  process.exit(1)
}

const index = peaks.map((peak) => {
  const row = {
    id: peak.id,
    name: peak.name,
    lat: peak.lat,
    lon: peak.lon,
    elevationFt: peak.elevationFt,
    prominenceFt: peak.prominenceFt,
    range: peak.range,
    country: peak.country,
  }
  if (Array.isArray(peak.aliases) && peak.aliases.length) {
    row.aliases = peak.aliases
  }
  if (peak.firstAscent) row.firstAscent = peak.firstAscent
  if (peak.difficulty) row.difficulty = peak.difficulty
  if (peak.difficultyTier) row.difficultyTier = peak.difficultyTier
  if (peak.bestSeason) row.bestSeason = peak.bestSeason
  if (peak.whyNotable) row.whyNotable = peak.whyNotable
  if (peak.description) row.description = peak.description
  if (peak.permitStatus) row.permitStatus = peak.permitStatus
  if (peak.permitRequired !== undefined) row.permitRequired = peak.permitRequired
  if (peak.nearestTown?.name) {
    row.nearestTown = {
      name: peak.nearestTown.name,
      region: peak.nearestTown.region ?? '',
      distanceMiles: peak.nearestTown.distanceMiles ?? 0,
    }
  }
  return row
})

writeFileSync(outPath, `${JSON.stringify(index, null, 2)}\n`)
console.log(`Wrote peaks.index.json (${index.length} peaks)`)
