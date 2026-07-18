/**
 * Fetch up to 2 Wikimedia Commons stills per peak → peak.photos
 * Also mirrors photos[0] onto peak.photo for compatibility.
 *
 * Run: node scripts/enrich-photos.mjs
 * Force refetch: node scripts/enrich-photos.mjs --force
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const path = join(root, 'src', 'data', 'peaks.json')
const force = process.argv.includes('--force')
const UA = 'PeakAtlas3D/0.1 (https://peakatlas3d.com; atlas photo enricher)'
const TARGET = 2

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

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

function normalizePhotos(peak) {
  const fromArray = Array.isArray(peak.photos) ? peak.photos.filter((p) => p?.url) : []
  if (fromArray.length) return fromArray
  if (peak.photo?.url) return [peak.photo]
  return []
}

async function fetchJson(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
  })
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  return res.json()
}

async function fetchPhotos(peak, want = TARGET) {
  const queries = [
    `${searchName(peak)} mountain`,
    `${searchName(peak)}`,
    `${searchName(peak)} peak`,
  ]

  const seen = new Set()
  const out = []

  for (const q of queries) {
    if (out.length >= want) break
    await sleep(350)
    const api =
      `https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*` +
      `&generator=search&gsrnamespace=6&gsrsearch=${encodeURIComponent(q)}` +
      `&gsrlimit=12&prop=imageinfo&iiprop=url|extmetadata|size|mime&iiurlwidth=960`

    let data
    try {
      data = await fetchJson(api)
    } catch {
      continue
    }

    const pages = Object.values(data?.query?.pages ?? {})
    const candidates = pages
      .map((page) => {
        const info = page.imageinfo?.[0]
        if (!info) return null
        const mime = info.mime ?? ''
        if (!mime.startsWith('image/') || mime.includes('svg')) return null
        if ((info.width ?? 0) < 640 || (info.height ?? 0) < 400) return null
        // Prefer landscape-ish frames for the dossier carousel.
        if (info.width < info.height * 0.9) return null
        const meta = info.extmetadata ?? {}
        const license = stripHtml(
          meta.LicenseShortName?.value || meta.License?.value || 'Unknown',
        )
        const artist = stripHtml(meta.Artist?.value || 'Unknown')
        const credit = artist.length > 80 ? `${artist.slice(0, 77)}…` : artist
        const url = info.thumburl || info.url
        return {
          url,
          credit,
          license,
          sourceUrl: info.descriptionurl || info.url,
          width: info.width,
          height: info.height,
          key: url.split('/').pop(),
        }
      })
      .filter(Boolean)
      .sort((a, b) => b.width * b.height - a.width * a.height)

    for (const c of candidates) {
      if (seen.has(c.key)) continue
      seen.add(c.key)
      out.push({
        url: c.url,
        credit: c.credit,
        license: c.license,
        sourceUrl: c.sourceUrl,
      })
      if (out.length >= want) break
    }
  }

  return out
}

function save(peaks) {
  writeFileSync(path, `${JSON.stringify(peaks, null, 2)}\n`)
}

const peaks = JSON.parse(readFileSync(path, 'utf8'))
let updated = 0
let filled = 0

for (let i = 0; i < peaks.length; i++) {
  const peak = peaks[i]
  const label = `[${i + 1}/${peaks.length}] ${peak.id}`
  const existing = normalizePhotos(peak)

  if (!force && existing.length >= TARGET) {
    peak.photos = existing.slice(0, TARGET)
    peak.photo = peak.photos[0]
    console.log(`${label} skip (${peak.photos.length})`)
    continue
  }

  try {
    await sleep(200)
    const fetched = await fetchPhotos(peak, TARGET)
    // Keep any good existing URLs first, then fill from fetch.
    const merged = []
    const seen = new Set()
    for (const p of [...existing, ...fetched]) {
      const key = p.url.split('/').pop()
      if (seen.has(key)) continue
      seen.add(key)
      merged.push({
        url: p.url,
        credit: p.credit,
        license: p.license,
        sourceUrl: p.sourceUrl,
      })
      if (merged.length >= TARGET) break
    }

    peak.photos = merged
    if (merged[0]) peak.photo = merged[0]
    else delete peak.photo

    updated++
    if (merged.length >= TARGET) filled++
    console.log(`${label} photos=${merged.length}`)

    if (updated % 5 === 0) {
      save(peaks)
      console.log('  checkpoint')
    }
  } catch (err) {
    console.error(`${label} FAILED:`, err.message ?? err)
    save(peaks)
    await sleep(1500)
  }
}

save(peaks)
const with2 = peaks.filter((p) => (p.photos?.length ?? 0) >= 2).length
const with1 = peaks.filter((p) => (p.photos?.length ?? 0) === 1).length
const with0 = peaks.filter((p) => !p.photos?.length).length
console.log(`\nDone. updated=${updated} with2=${with2} with1=${with1} with0=${with0}`)
