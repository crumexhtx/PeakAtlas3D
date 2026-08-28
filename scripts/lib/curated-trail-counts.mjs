/**
 * Count curated trail routes per peak id by parsing the TS route tables.
 * Keeps prerender snapshot "Listed trails" in sync with the React app.
 */
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..')

function countRoutesInFile(relPath) {
  const text = readFileSync(join(root, relPath), 'utf8')
  const counts = new Map()
  let current = null
  for (const line of text.split(/\r?\n/)) {
    const key = line.match(/^  ([a-z0-9]+): \[$/)
    if (key) {
      current = key[1]
      counts.set(current, 0)
      continue
    }
    if (current && /^\s+name: '/.test(line)) {
      counts.set(current, (counts.get(current) || 0) + 1)
    }
    if (current && line === '  ],') {
      current = null
    }
  }
  return counts
}

let cache = null

export function curatedTrailCount(peakId) {
  if (!cache) {
    cache = new Map([
      ...countRoutesInFile('src/data/fourteenersRoutes.ts'),
      ...countRoutesInFile('src/data/usPeakRoutes.ts'),
    ])
  }
  return cache.get(peakId) || 0
}

export function listedTrailCount(peak) {
  const curated = curatedTrailCount(peak.id)
  if (curated > 0) return curated
  return Array.isArray(peak.trails) ? peak.trails.length : 0
}
