/**
 * Heuristic audit of US peak gallery photos for non-summit / city views.
 * Run: node scripts/audit-us-photos.mjs
 */
import { readFileSync } from 'node:fs'

const peaks = JSON.parse(readFileSync('src/data/peaks.json', 'utf8'))
const us = peaks.filter((p) => /usa|united states/i.test(p.country || ''))

/** Filename/url patterns that often mean "not a mountain portrait". */
const SUSPECT =
  /(?:^|[^a-z])(from_|_from_|downtown|cityscape|skyline|street|highway|interstate|wind.?farm|parking|lodge interior|museum|plaque|sign|gps.?track|topo.?map|diagram|map\.|aerial.?of.?[a-z]+.?springs|colorado.?springs|denver|seattle|portland|albuquerque|palm.?springs.?city|village|suburb|neighborhood|train station|railroad station|cog.?railway.?car|tram.?car)(?:[^a-z]|$)|springs_from|from_pikes|from_the_summit_looking|looking_down|view_of_.*city|city_from_/i

const WEAK =
  /(?:windy.?point|cog.?railway|railroad|railway.?track|tracks|tramway|parking.?lot|visitor.?center|gift.?shop|summit.?house interior)/i

const rows = []
for (const peak of us) {
  const photos = peak.photos?.length ? peak.photos : peak.photo ? [peak.photo] : []
  photos.forEach((ph, i) => {
    // File/url only — credits often include photographer home towns.
    const hay = `${ph.url} ${ph.sourceUrl}`
    const suspect = SUSPECT.test(hay)
    const weak = WEAK.test(hay)
    if (suspect || weak) {
      rows.push({
        id: peak.id,
        name: peak.name,
        i,
        severity: suspect ? 'BAD' : 'WEAK',
        file: (ph.sourceUrl || '').split('/wiki/')[1] || ph.url,
      })
    }
  })
}

rows.sort((a, b) => a.severity.localeCompare(b.severity) || a.id.localeCompare(b.id))
console.log(`US peaks=${us.length} · flagged=${rows.length}`)
for (const r of rows) {
  console.log(`${r.severity}\t${r.id}\tp${r.i}\t${r.file}`)
}
