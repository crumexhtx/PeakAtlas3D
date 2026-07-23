/**
 * Validate that peak photos likely depict the named mountain, then replace
 * weak ones via geo-aware Commons search + curated overrides for ambiguous names.
 *
 * Run: node scripts/validate-fix-photos.mjs
 * Report only: node scripts/validate-fix-photos.mjs --check
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const path = join(root, 'src', 'data', 'peaks.json')
const checkOnly = process.argv.includes('--check')
const UA = 'PeakAtlas3D/0.1 (https://peakatlas3d.com; photo validator)'
const TARGET = 2

/** Commons file titles known to show the correct mountain (ambiguous / common names). */
const CURATED_FILES = {
  columbia: [
    'File:Mt. Columbia from Columbia Icefield bivy for the Twins et al.jpg',
    'File:Columbia Icefield viewed from the Columbia Icefield Discovery Centre.jpg',
  ],
  kings: [
    'File:Kings Peak, Uinta Mountains, Duchesne County, Utah, USA 01.jpg',
    'File:Kings Peak, Uinta Mountains, Duchesne County, Utah, USA 02.jpg',
  ],
  logan: [
    'File:Mount Logan.jpg',
    'File:Mount Logan Knife ridge, east ridge by Christian Stangl (flickr).jpg',
  ],
  cook: [
    'File:Mount Cook from Kea Point 03.jpg',
    'File:00 1286 New Zealand Alps - Mount Cook (Māori "Aoraki").jpg',
  ],
  washington: [
    'File:2016-09-03 16 29 17 View north from the northeast side of the summit of Mount Washington in Sargent\'s Purchase Township, Coos County, New Hampshire.jpg',
    'File:2016-09-03 16 29 19 View northeast from the northeast side of the summit of Mount Washington in Sargent\'s Purchase Township, Coos County, New Hampshire.jpg',
  ],
  capitol: [
    'File:Mt. Daly and Capitol Peak.jpg',
    'File:Capitol Peak CO arete.jpg',
  ],
  baker: [
    'File:Mount baker washington.jpg',
    'File:Mount Baker from Keep Kool Butte.jpeg',
  ],
  granitet: [
    'File:Granite Peak Montana.jpg',
    'File:Granite Peak Montana 2.jpg',
  ],
  // Commons only has one high-res still that clearly shows Gannett.
  gannett: [
    'File:Wind River Range Gannett Peak Green River Basin Wy PICT0033 19941023.jpg',
  ],
  longs: [
    'File:Longs Peak from the Dream Lake trail at sunrise, Rocky Mountain National Park, Colorado, USA.jpg',
    'File:Meeker, Longs, Lady Washington.jpg',
  ],
  guadalupe: [
    'File:Summit of the Guadalupe Peak DSC 5528 ad.JPG',
    'File:Guadalupe peak from top.jpg',
  ],
  robson: [
    'File:Mount Robson 08122005.jpg',
    'File:Mount Robson panorama.jpg',
  ],
  illimani: [
    'File:Illimani - Cordillera Real.jpg',
    'File:Illimani with the full moon rising overhead.jpg',
  ],
  annapurna: [
    'File:Annapurna Massif Panorama.jpg',
    'File:Sunrise Annapurna Pokhara Nepal Feb13 DSC 1583.jpg',
  ],
  ama: [
    'File:Ama Dablam, Nepal.jpg',
    'File:Ama Dablam and the Himalayas, Mountains of Nepal.jpg',
  ],
  tasman: [
    'File:Mount Tasman and Torres Peak.jpg',
    'File:Mount Aoraki (Mt. Cook) & Mount Tasman - Lake Matheson (New Zealand).jpg',
  ],
  musala: [
    'File:Musala peak.jpg',
    'File:Musala and Malka Musala.jpg',
  ],
  halti: [
    'File:Haltitunturi.jpg',
    'File:Suomen korkeimmat tunturit.jpg',
  ],
  sidley: [
    'File:Mount Sidley - Antarctica’s Tallest Volcano.jpg',
    'File:MountSidleyCaldera.jpg',
  ],
  grandteton: [
    'File:Adams The Tetons and the Snake River.jpg',
    'File:Willow Flats area and Teton Range in Grand Teton National Park.jpg',
  ],
}

/** Peaks allowed to ship with a single validated still (Commons scarcity). */
const ALLOW_SINGLE = new Set(['gannett'])

/** Short/common name tokens that must also match geo/context in the filename. */
const REQUIRE_CONTEXT = {
  columbia: ['icefield', 'alberta', 'canadian rockies', 'mt columbia', 'mount columbia'],
  cook: ['aoraki', 'new zealand', 'kea point', 'southern alps', 'hooker', 'tasman', 'canterbury'],
  washington: [
    'new hampshire',
    'presidential',
    'cog railway',
    'auto road',
    'coos',
    'sargent',
  ],
  capitol: ['colorado', 'elk', 'aspen', 'maroon', 'daly', 'snowmass'],
  baker: ['cascade', 'washington', 'volcano', 'kulshan', 'glacier', 'shannon', 'kool'],
  kings: ['utah', 'uinta', 'duchesne', 'kings peak'],
  logan: ['yukon', 'kluane', 'saint elias', 'st elias', 'knife ridge'],
  hood: ['oregon', 'cascade', 'portland', 'timberline', 'mount hood'],
  adams: ['cascade', 'washington', 'yakima', 'mount adams'],
  table: ['cape town', 'south africa', 'table mountain'],
  kenya: ['kenya', 'mount kenya', 'aberdares'],
  meru: ['tanzania', 'arusha', 'mount meru'],
  granitet: ['montana', 'beartooth', 'absaroka', 'granite peak'],
  orizaba: ['orizaba', 'citlaltepetl', 'citlaltepetl', 'mexico', 'puebla', 'veracruz'],
  grossglockner: ['glockner', 'grossglockner', 'groglockner', 'austria', 'tirol', 'carinthia'],
  kazbek: ['kazbek', 'kazbegi', 'georgia', 'caucasus'],
  elbrus: ['elbrus', 'caucasus', 'russia'],
  halti: ['finland', 'norway', 'tunturi', 'lapland', 'kilpis', 'scandinavia', 'halti'],
}

const REJECT_PATTERNS =
  /(?:^|[^a-z])(salmon|entrance|headstone|cemetery|kentucky|ireland|sligo|benbulbin|palo duro|texas panhandle|apollo|soyuz|helichrysum|stuhlmannii|logo|flag|diagram|chart|coat of arms|location map|topo map|gps track|gpsvisualizer|orthophoto|satellite image of|pdf|geology|plaque|statue|chapel|museum|time zone|thumbnail\.jpg|helicopter|map_mount|24000 geo|ski area|moose in grand|barns grand|halti beel|natore|rajshahi|boundary stone|wind farm)(?:[^a-z]|$)/i

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

function stripHtml(s) {
  return String(s ?? '')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .trim()
}

function decodeMaybe(s) {
  try {
    return decodeURIComponent(String(s ?? ''))
  } catch {
    return String(s ?? '')
  }
}

function norm(s) {
  return decodeMaybe(s)
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function searchName(peak) {
  return peak.name.replace(/^Mt\.\s+/i, 'Mount ').replace(/\s*\/\s*/g, ' ').trim()
}

function peakKeys(peak) {
  const keys = new Set()
  const add = (s) => {
    const n = norm(s)
    if (!n) return
    keys.add(n)
    for (const part of n.split(' ')) {
      if (part.length >= 4) keys.add(part)
    }
  }
  add(peak.name)
  add(searchName(peak))
  add(peak.id)
  for (const a of peak.aliases ?? []) add(a)
  for (const g of ['mount', 'mountain', 'peak', 'pico', 'cerro', 'nevado', 'volcan']) {
    keys.delete(g)
  }
  return [...keys]
}

function photoHay(photo) {
  return norm(
    `${photo.url} ${photo.sourceUrl ?? ''} ${photo.credit ?? ''} ${photo.title ?? ''}`,
  )
}

function photoMatchesPeak(peak, photo) {
  const hay = photoHay(photo)
  if (REJECT_PATTERNS.test(hay)) return { ok: false, reason: 'reject-pattern' }

  const ctx = REQUIRE_CONTEXT[peak.id]
  if (ctx?.length) {
    const hasCtx = ctx.some((c) => hay.includes(norm(c)))
    if (!hasCtx) return { ok: false, reason: 'missing-geo-context' }
  }

  const keys = peakKeys(peak)
  const ordered = [...keys].sort((a, b) => b.length - a.length)
  const hit = ordered.find((k) => {
    if (k.length < 5 && !peak.id.includes(k)) return false
    return hay.includes(k)
  })
  if (!hit) return { ok: false, reason: 'no-name-match' }
  return { ok: true, hit }
}

async function fetchJson(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
  })
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  return res.json()
}

async function searchCommons(query) {
  const api =
    `https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*` +
    `&generator=search&gsrnamespace=6&gsrsearch=${encodeURIComponent(query)}` +
    `&gsrlimit=16&prop=imageinfo&iiprop=url|extmetadata|size|mime&iiurlwidth=1280`
  const data = await fetchJson(api)
  return Object.values(data?.query?.pages ?? {})
}

async function resolveFileTitles(titles) {
  if (!titles.length) return []
  const api =
    `https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*` +
    `&titles=${titles.map(encodeURIComponent).join('|')}` +
    `&prop=imageinfo&iiprop=url|extmetadata|size|mime&iiurlwidth=1280`
  const data = await fetchJson(api)
  const byTitle = new Map()
  for (const page of Object.values(data?.query?.pages ?? {})) {
    const photo = pageToPhoto(page)
    if (photo) byTitle.set(norm(page.title || ''), photo)
  }
  // Preserve hand-curated order (API page order is not stable).
  return titles
    .map((t) => byTitle.get(norm(t)))
    .filter(Boolean)
}

function pageToPhoto(page) {
  if (page.missing != null || page.invalid != null) return null
  const info = page.imageinfo?.[0]
  if (!info) return null
  const mime = info.mime ?? ''
  if (!mime.startsWith('image/') || mime.includes('svg')) return null
  if ((info.width ?? 0) < 640 || (info.height ?? 0) < 400) return null
  const meta = info.extmetadata ?? {}
  const license = stripHtml(
    meta.LicenseShortName?.value || meta.License?.value || 'Unknown',
  )
  const artist = stripHtml(meta.Artist?.value || 'Unknown')
  return {
    url: info.thumburl || info.url,
    credit: artist.length > 80 ? `${artist.slice(0, 77)}…` : artist,
    license,
    sourceUrl: info.descriptionurl || info.url,
    title: page.title || '',
    width: info.width,
    height: info.height,
  }
}

function geoQueries(peak) {
  const name = searchName(peak)
  const region = peak.nearestTown?.region || ''
  const country = peak.country || ''
  const range = peak.range || ''
  return [
    `"${name}" ${region || country}`,
    `${name} ${range}`,
    `${name} mountain ${country}`,
    `"${name}"`,
    ...(peak.aliases ?? []).slice(0, 2).map((a) => `"${a}" ${country}`),
  ].filter((q, i, arr) => q.trim() && arr.indexOf(q) === i)
}

async function fetchMatchingPhotos(peak, want = TARGET, excludeKeys = new Set()) {
  const seen = new Set(excludeKeys)
  const out = []

  for (const q of geoQueries(peak)) {
    if (out.length >= want) break
    await sleep(400)
    let pages = []
    try {
      pages = await searchCommons(q)
    } catch {
      continue
    }
    const candidates = pages
      .map(pageToPhoto)
      .filter(Boolean)
      .sort((a, b) => b.width * b.height - a.width * a.height)

    for (const c of candidates) {
      const key = c.url.split('/').pop()
      if (seen.has(key)) continue
      const probe = {
        url: c.url,
        sourceUrl: c.sourceUrl,
        credit: `${c.credit} ${c.title}`,
        title: c.title,
      }
      if (!photoMatchesPeak(peak, probe).ok) continue
      seen.add(key)
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

function normalizePhotos(peak) {
  const fromArray = Array.isArray(peak.photos) ? peak.photos.filter((p) => p?.url) : []
  if (fromArray.length) return fromArray
  if (peak.photo?.url) return [peak.photo]
  return []
}

function slimPhoto(ph) {
  return {
    url: ph.url,
    credit: ph.credit,
    license: ph.license,
    sourceUrl: ph.sourceUrl,
  }
}

function save(peaks) {
  const body = `${JSON.stringify(peaks, null, 2)}\n`
  writeFileSync(path, body)
  // Sidecar backup — peaks.json has been wiped of photos arrays before.
  writeFileSync(join(root, 'src', 'data', 'peaks.photos.backup.json'), body)
}

const peaks = JSON.parse(readFileSync(path, 'utf8'))
const report = []

for (const peak of peaks) {
  const photos = normalizePhotos(peak)
  const need = ALLOW_SINGLE.has(peak.id) ? 1 : TARGET
  // Curated peaks are always rewritten in the fix loop; skip --check noise when they already have slots.
  if (CURATED_FILES[peak.id] && photos.length >= need) continue
  const judged = photos.map((ph, i) => {
    const m = photoMatchesPeak(peak, ph)
    return { i, ok: m.ok, reason: m.reason, hit: m.hit, url: ph.url }
  })
  const bad = judged.filter((j) => !j.ok)
  if (bad.length || photos.length < need) {
    report.push({
      id: peak.id,
      name: peak.name,
      bad: bad.map((b) => ({
        i: b.i,
        reason: b.reason,
        file: decodeMaybe(b.url.split('/').pop()),
      })),
      goodCount: judged.filter((j) => j.ok).length,
      total: photos.length,
    })
  }
}

console.log(`Checked ${peaks.length} peaks · ${report.length} need attention`)
for (const row of report.slice(0, 80)) {
  const badBits = row.bad.map((b) => `${b.i}:${b.reason}`).join(' | ') || 'short'
  console.log(`- ${row.id}: ${row.goodCount}/${row.total} good · ${badBits}`)
}
if (report.length > 80) console.log(`… +${report.length - 80} more`)

if (checkOnly) {
  process.exit(report.length ? 2 : 0)
}

let fixed = 0
const curatedCache = new Map()

for (let i = 0; i < peaks.length; i++) {
  const peak = peaks[i]
  const label = `[${i + 1}/${peaks.length}] ${peak.id}`
  let current = normalizePhotos(peak).filter((ph) => photoMatchesPeak(peak, ph).ok)

  // Curated peaks: replace entirely with hand-picked Commons files.
  if (CURATED_FILES[peak.id]) {
    if (!curatedCache.has(peak.id)) {
      await sleep(300)
      try {
        curatedCache.set(peak.id, await resolveFileTitles(CURATED_FILES[peak.id]))
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
    await sleep(1500)
  }
}

save(peaks)

let stillWeak = 0
let with2 = 0
for (const peak of peaks) {
  const photos = peak.photos ?? []
  const need = ALLOW_SINGLE.has(peak.id) ? 1 : TARGET
  // Curated peaks count as OK even if matcher is strict.
  const ok =
    CURATED_FILES[peak.id] && photos.length >= need
      ? photos
      : photos.filter((ph) => photoMatchesPeak(peak, ph).ok)
  if (ok.length >= 2) with2++
  if (ok.length < need) {
    stillWeak++
    console.log(`STILL WEAK ${peak.id}: ${ok.length}/${need}`)
  }
}
console.log(`\nDone. fixed=${fixed} validatedPair=${with2} stillWeak=${stillWeak}`)
process.exit(stillWeak ? 2 : 0)
