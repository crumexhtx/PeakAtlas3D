/**
 * Validate that peak photos likely depict the named mountain, then replace
 * weak ones via geo-aware Commons search + curated allow-list.
 *
 * Geo (≤15 km) is required unless the filename is on PHOTO_ALLOWLIST.
 * Name-only matches never pass.
 *
 * Run: node scripts/validate-fix-photos.mjs
 * Report only (offline, warnings): node scripts/validate-fix-photos.mjs --check
 * Fail on issues: node scripts/validate-fix-photos.mjs --check --strict
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  ALLOW_SINGLE,
  PHOTO_ALLOWLIST,
  PHOTO_TARGET,
  decodeMaybe,
  fetchMatchingPhotos,
  isPortrait,
  normalizePhotos,
  photoMatchesPeak,
  resolveFileTitles,
  slimPhoto,
} from './lib/photo-match.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const path = join(root, 'src', 'data', 'peaks.json')
const checkOnly = process.argv.includes('--check')
const strict = process.argv.includes('--strict')
const TARGET = PHOTO_TARGET

function save(peaks) {
  const body = `${JSON.stringify(peaks, null, 2)}\n`
  writeFileSync(path, body)
  writeFileSync(join(root, 'src', 'data', 'peaks.photos.backup.json'), body)
}

const peaks = JSON.parse(readFileSync(path, 'utf8'))
const report = []

for (const peak of peaks) {
  const photos = normalizePhotos(peak)
  const need = ALLOW_SINGLE.has(peak.id) ? 1 : TARGET
  const judged = photos.map((ph, i) => {
    const m = photoMatchesPeak(peak, ph, { slot: i })
    return {
      i,
      ok: m.ok,
      reason: m.reason,
      km: m.km,
      url: ph.url,
      portrait: isPortrait(ph),
    }
  })
  const bad = judged.filter((j) => !j.ok)
  if (bad.length || photos.length < need) {
    report.push({
      id: peak.id,
      name: peak.name,
      bad: bad.map((b) => ({
        i: b.i,
        reason: b.reason,
        file: decodeMaybe(String(b.url.split('/').pop() ?? '')),
      })),
      goodCount: judged.filter((j) => j.ok).length,
      total: photos.length,
    })
  }
}

console.log(`Checked ${peaks.length} peaks · ${report.length} need attention`)
for (const row of report) {
  const badBits = row.bad.map((b) => `${b.i}:${b.reason}`).join(' | ') || 'short'
  console.log(`- ${row.id}: ${row.goodCount}/${row.total} good · ${badBits}`)
}

if (checkOnly) {
  if (!report.length) process.exit(0)
  if (strict) {
    console.error(`photo check failed: ${report.length} peak(s) (strict)`)
    process.exit(2)
  }
  console.log(
    'photo issues are warnings until --strict (promote after photo fixes)',
  )
  process.exit(0)
}

let fixed = 0
const curatedCache = new Map()

for (let i = 0; i < peaks.length; i++) {
  const peak = peaks[i]
  const label = `[${i + 1}/${peaks.length}] ${peak.id}`
  let current = normalizePhotos(peak).filter(
    (ph, slot) => photoMatchesPeak(peak, ph, { slot }).ok,
  )

  if (PHOTO_ALLOWLIST[peak.id]) {
    if (!curatedCache.has(peak.id)) {
      try {
        const resolved = await resolveFileTitles(PHOTO_ALLOWLIST[peak.id])
        curatedCache.set(
          peak.id,
          resolved.filter((ph, slot) => photoMatchesPeak(peak, ph, { slot }).ok),
        )
      } catch (err) {
        console.error(`${label} curated resolve failed:`, err.message ?? err)
        curatedCache.set(peak.id, [])
      }
    }
    const curated = (curatedCache.get(peak.id) ?? []).map(slimPhoto)
    const need = ALLOW_SINGLE.has(peak.id) ? 1 : TARGET
    if (curated.length >= need) {
      peak.photos = curated.slice(0, TARGET)
      peak.photo = peak.photos[0]
      continue
    }
    current = curated
  }

  if (current.length >= TARGET) {
    peak.photos = current.slice(0, TARGET).map(slimPhoto)
    peak.photo = peak.photos[0]
    continue
  }

  try {
    console.log(`${label} fetching better matches (have ${current.length})…`)
    const fetched = await fetchMatchingPhotos(
      peak,
      TARGET,
      new Set(current.map((p) => p.url.split('/').pop())),
    )
    const merged = []
    const seen = new Set()
    for (const ph of [...current, ...fetched]) {
      const key = ph.url.split('/').pop()
      if (seen.has(key)) continue
      seen.add(key)
      merged.push(slimPhoto(ph))
      if (merged.length >= TARGET) break
    }
    peak.photos = merged
    if (merged[0]) peak.photo = merged[0]
    fixed++
    console.log(`${label} -> ${merged.length} validated photo(s)`)
    if (fixed % 4 === 0) save(peaks)
  } catch (err) {
    console.error(`${label} FAILED:`, err.message ?? err)
    peak.photos = current.map(slimPhoto)
    if (current[0]) peak.photo = current[0]
    save(peaks)
  }
}

save(peaks)

let stillWeak = 0
let with2 = 0
for (const peak of peaks) {
  const photos = peak.photos ?? []
  const need = ALLOW_SINGLE.has(peak.id) ? 1 : TARGET
  const ok = photos.filter((ph, slot) => photoMatchesPeak(peak, ph, { slot }).ok)
  if (ok.length >= 2) with2++
  if (ok.length < need) {
    stillWeak++
    console.log(`STILL WEAK ${peak.id}: ${ok.length}/${need}`)
  }
}
console.log(`\nDone. fixed=${fixed} validatedPair=${with2} stillWeak=${stillWeak}`)
process.exit(stillWeak ? 2 : 0)
