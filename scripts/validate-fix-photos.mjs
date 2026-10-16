/**
 * Validate that peak photos likely depict the named mountain, then replace
 * weak ones via geo-aware Commons search + curated allow-list.
 *
 * Geo (≤15 km) is required unless the filename is on PHOTO_ALLOWLIST.
 * Name-only matches never pass.
 *
 * Run: node scripts/validate-fix-photos.mjs
 * One peak set: node scripts/validate-fix-photos.mjs --ids kilimanjaro,vinson --force --audit
 * Report only (offline, warnings): node scripts/validate-fix-photos.mjs --check
 * Fail on issues: node scripts/validate-fix-photos.mjs --check --strict
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { haversineKm } from './lib/catalog-plausibility.mjs'
import {
  ALLOW_SINGLE,
  PHOTO_ALLOWLIST,
  PHOTO_TARGET,
  commonsFilename,
  decodeMaybe,
  fetchMatchingPhotos,
  isPortrait,
  normalizePhotos,
  photoCoords,
  photoMatchesPeak,
  rankPhotos,
  resolveFileTitles,
  slimPhoto,
  thumbUrl,
} from './lib/photo-match.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const path = join(root, 'src', 'data', 'peaks.json')
const checkOnly = process.argv.includes('--check')
const strict = process.argv.includes('--strict')
const force = process.argv.includes('--force')
const writeAudit = process.argv.includes('--audit')
const TARGET = PHOTO_TARGET

function parseListArg(name) {
  const prefix = `--${name}=`
  const eq = process.argv.find((a) => a.startsWith(prefix))
  if (eq) return eq.slice(prefix.length)
  const i = process.argv.indexOf(`--${name}`)
  if (i >= 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('-')) {
    return process.argv[i + 1]
  }
  return null
}

const idsRaw = parseListArg('ids')
const idFilter = idsRaw
  ? new Set(
      idsRaw
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    )
  : null

function save(peaks) {
  const body = `${JSON.stringify(peaks, null, 2)}\n`
  writeFileSync(path, body)
  writeFileSync(join(root, 'src', 'data', 'peaks.photos.backup.json'), body)
}

function fileLabel(photo) {
  if (!photo) return '—'
  const named = commonsFilename(photo)
  if (named) return decodeMaybe(named).replace(/^file:/i, 'File:')
  return decodeMaybe(String(photo.url ?? '').split('/').pop() ?? '') || '—'
}

function kmFromSummit(peak, photo) {
  const coords = photoCoords(photo)
  if (
    !coords ||
    !Number.isFinite(peak.lat) ||
    !Number.isFinite(peak.lon)
  ) {
    return null
  }
  return haversineKm(peak.lat, peak.lon, coords.lat, coords.lon)
}

function needCount(peak) {
  return ALLOW_SINGLE.has(peak.id) ? 1 : TARGET
}

function goodPhotos(peak, photos = normalizePhotos(peak)) {
  return photos.filter((ph, slot) => photoMatchesPeak(peak, ph, { slot }).ok)
}

function normalizeStoredPhoto(ph) {
  if (!ph?.url) return ph
  return { ...ph, url: thumbUrl(ph.url) }
}

function photosChanged(before, after) {
  const a = before.map((p) => fileLabel(p)).join('|')
  const b = after.map((p) => fileLabel(p)).join('|')
  return a !== b
}

const peaks = JSON.parse(readFileSync(path, 'utf8'))
if (idFilter) {
  const known = new Set(peaks.map((p) => p.id))
  const unknown = [...idFilter].filter((id) => !known.has(id))
  if (unknown.length) {
    console.warn(`unknown --ids: ${unknown.join(', ')}`)
  }
}

const workPeaks = idFilter
  ? peaks.filter((p) => idFilter.has(p.id))
  : peaks

const report = []

for (const peak of workPeaks) {
  const photos = normalizePhotos(peak)
  const need = needCount(peak)
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

console.log(`Checked ${workPeaks.length} peaks · ${report.length} need attention`)
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
const auditRows = []

for (let i = 0; i < workPeaks.length; i++) {
  const peak = workPeaks[i]
  const label = `[${i + 1}/${workPeaks.length}] ${peak.id}`
  const before = normalizePhotos(peak).map((ph) => ({ ...ph }))
  const need = needCount(peak)
  let current = force ? [] : goodPhotos(peak)

  if (PHOTO_ALLOWLIST[peak.id]) {
    if (!curatedCache.has(peak.id)) {
      try {
        const resolved = await resolveFileTitles(PHOTO_ALLOWLIST[peak.id])
        const curated = []
        for (const ph of rankPhotos(peak, resolved)) {
          if (photoMatchesPeak(peak, ph, { slot: curated.length }).ok) {
            curated.push(ph)
          }
        }
        curatedCache.set(peak.id, curated)
      } catch (err) {
        console.error(`${label} curated resolve failed:`, err.message ?? err)
        curatedCache.set(peak.id, [])
      }
    }
    const curated = curatedCache.get(peak.id) ?? []
    if (force || current.length < need) {
      current = curated
      console.log(`${label} curated ${current.length}/${need}`)
    }
  }

  if (current.length >= need && !force) {
    peak.photos = current.slice(0, TARGET).map(slimPhoto)
    peak.photo = peak.photos[0]
  } else if (current.length >= need && PHOTO_ALLOWLIST[peak.id]) {
    peak.photos = current.slice(0, TARGET).map(slimPhoto)
    peak.photo = peak.photos[0]
    if (photosChanged(before, peak.photos)) fixed++
  } else {
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
      if (photosChanged(before, peak.photos)) fixed++
      console.log(`${label} -> ${merged.length} validated photo(s)`)
      if (fixed % 4 === 0) save(peaks)
    } catch (err) {
      console.error(`${label} FAILED:`, err.message ?? err)
      peak.photos = current.map(slimPhoto)
      if (current[0]) peak.photo = current[0]
      save(peaks)
    }
  }

  const after = normalizePhotos(peak)
  if (writeAudit && photosChanged(before, after)) {
    const slots = Math.max(before.length, after.length)
    for (let slot = 0; slot < slots; slot++) {
      const neu = after[slot]
      if (!neu && !before[slot]) continue
      if (fileLabel(before[slot]) === fileLabel(neu)) continue
      const match = neu
        ? photoMatchesPeak(peak, neu, { slot })
        : { reason: 'removed' }
      const km = neu ? kmFromSummit(peak, neu) : null
      auditRows.push({
        id: peak.id,
        name: peak.name,
        slot,
        oldFile: fileLabel(before[slot]),
        newFile: fileLabel(neu),
        km: km == null ? '—' : km.toFixed(1),
        license: neu?.license ?? '—',
        match: match.reason ?? '—',
      })
    }
  }
}

for (const peak of peaks) {
  if (Array.isArray(peak.photos)) {
    peak.photos = peak.photos.map(normalizeStoredPhoto)
  }
  if (peak.photo?.url) peak.photo = normalizeStoredPhoto(peak.photo)
}

save(peaks)

if (writeAudit) {
  const docsDir = join(root, 'docs')
  mkdirSync(docsDir, { recursive: true })
  const lines = [
    '# Photo audit',
    '',
    'Commons stills replaced in Phase 3. Distance is summit-to-photo GPS when Commons exposes coordinates; allow-listed files without GPS show —.',
    '',
    '| Peak | Slot | Old file | New file | Distance (km) | License | Match |',
    '| --- | --- | --- | --- | --- | --- | --- |',
    ...auditRows.map((row) =>
      `| ${row.id} (${row.name}) | ${row.slot} | ${row.oldFile.replace(/\|/g, '\\|')} | ${row.newFile.replace(/\|/g, '\\|')} | ${row.km} | ${row.license} | ${row.match} |`,
    ),
    '',
  ]
  writeFileSync(join(docsDir, 'photo-audit.md'), `${lines.join('\n')}\n`)
  console.log(`Wrote docs/photo-audit.md (${auditRows.length} row(s))`)
}

let stillWeak = 0
let with2 = 0
for (const peak of workPeaks) {
  const photos = peak.photos ?? []
  const need = needCount(peak)
  const ok = photos.filter((ph, slot) => photoMatchesPeak(peak, ph, { slot }).ok)
  if (ok.length >= 2) with2++
  if (ok.length < need) {
    stillWeak++
    console.log(`STILL WEAK ${peak.id}: ${ok.length}/${need}`)
  }
}
console.log(`\nDone. fixed=${fixed} validatedPair=${with2} stillWeak=${stillWeak}`)
process.exit(stillWeak ? 2 : 0)
