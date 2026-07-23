/**
 * Replace clearly wrong / non-summit US gallery photos.
 * Run: node scripts/fix-us-bad-photos.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs'

const peaksPath = 'src/data/peaks.json'
const UA = 'PeakAtlas3D/0.2 (https://peakatlas3d.com; us photo fix)'

/** Prefer classic summit / mountain-portrait Commons files. */
const CURATED = {
  pikes: [
    'File:Pikes Peak.jpg',
    'File:Pikes Peak Colorado.jpg',
    'File:Pikespeak.JPG',
    'File:Pikes Peak from Garden of the Gods.jpg',
    'File:Americas Mountain.jpg',
  ],
  mitchell: [
    'File:Mount Mitchell.jpg',
    'File:Mount Mitchell NC.jpg',
    'File:Mt Mitchell observation tower.jpg',
    'File:Mount Mitchell State Park.jpg',
  ],
  sandia: [
    'File:Sandia Mountains.jpg',
    'File:Sandia Crest New Mexico.jpg',
    'File:Sandia Peak.jpg',
    'File:Sandia Mountains from the west.jpg',
  ],
  grays: [
    'File:Grays and Torreys Peaks.jpg',
    'File:Grays Peak Colorado.jpg',
    'File:Grays Peak.jpg',
    'File:Grays and Torreys from Torreys.jpg',
  ],
  sherman: [
    'File:Mount Sherman and Mosquito Range.jpg',
    'File:Mount Sherman Colorado.jpg',
    'File:Mt Sherman Colorado 14er.jpg',
    'File:Mount Sherman from Fourmile.jpg',
  ],
  bierstadt: [
    'File:Hiking trail up Mt. Bierstadt.jpg',
    'File:Mount Bierstadt.jpg',
    'File:Mt Bierstadt from Guanella Pass.jpg',
    'File:Mount Bierstadt Colorado.jpg',
  ],
  borah: [
    'File:Borah Peak.jpg',
    'File:Mount Borah Idaho.jpg',
    'File:Borah Peak Idaho.jpg',
    'File:Mt Borah.jpg',
  ],
  timpanogos: [
    'File:Mount Timpanogos.jpg',
    'File:Mt Timpanogos Utah.jpg',
    'File:Mount Timpanogos from the south.jpg',
    'File:Timpanogos Peak.jpg',
  ],
  olympuswa: [
    'File:Mount Olympus Washington.jpg',
    'File:Mt Olympus from Hurricane Ridge.jpg',
    'File:Mount Olympus Olympic National Park.jpg',
    'File:Mount Olympus with lupine.jpg',
  ],
  pyramid: [
    'File:Pyramid Peak Colorado.jpg',
    'File:Pyramid Peak Elk Mountains.jpg',
    'File:Aspen Highlands Highlands Pyramid Peak.jpg',
    'File:Pyramid Peak Maroon Bells.jpg',
  ],
  maunakea: [
    'File:Mauna Kea.jpg',
    'File:Mauna Kea from Mauna Loa.jpg',
    'File:Mauna Kea Hawaii.jpg',
    'File:Snow on Mauna Kea.jpg',
  ],
}

const REJECT =
  /(?:^|[^a-z])(downtown|cityscape|skyline|street|highway|interstate|wind.?farm|parking|plaque|sign|gps.?track|topo.?map|diagram|colorado.?springs|albuquerque|denver|seattle|suburb|neighborhood|springs_from|from_pikes|city_from_|railroad|railway|tracks|windy.?point|nara|djvu|memoir|temple|google.?art|painting|albert.?bierstadt|rosalie|earthquake|artesian|fountain|fault.?scarp|athena|telescope|observatory.?dome)(?:[^a-z]|$)|from_dillon|highway_128|pp_ab|rio.?blanco/i

async function fetchJson(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
  })
  if (!res.ok) throw new Error(`${res.status} ${url}`)
  return res.json()
}

function pageToPhoto(page) {
  if (page.missing != null || page.invalid != null) return null
  const info = page.imageinfo?.[0]
  if (!info) return null
  const mime = info.mime ?? ''
  if (!mime.startsWith('image/') || /svg|djvu|tif/.test(mime)) return null
  if ((info.width ?? 0) < 800 || (info.height ?? 0) < 500) return null
  // Prefer landscape-ish mountain portraits over extreme panoramas or tall signs.
  const ratio = info.width / info.height
  if (ratio < 0.7 || ratio > 3.2) return null
  const meta = info.extmetadata ?? {}
  const title = page.title || ''
  const hay = `${title} ${info.url} ${info.descriptionurl || ''}`
  if (REJECT.test(hay)) return null
  return {
    url: info.thumburl || info.url,
    credit: String(meta.Artist?.value || 'Unknown')
      .replace(/<[^>]+>/g, '')
      .slice(0, 80),
    license: String(
      meta.LicenseShortName?.value || meta.License?.value || 'Unknown',
    ).replace(/<[^>]+>/g, ''),
    sourceUrl: info.descriptionurl || info.url,
    title,
  }
}

async function resolveTitles(titles) {
  if (!titles.length) return []
  const api =
    `https://commons.wikimedia.org/w/api.php?action=query&format=json` +
    `&titles=${titles.map(encodeURIComponent).join('|')}` +
    `&prop=imageinfo&iiprop=url|extmetadata|size|mime&iiurlwidth=1280`
  const data = await fetchJson(api)
  const byTitle = new Map()
  for (const page of Object.values(data?.query?.pages ?? {})) {
    const photo = pageToPhoto(page)
    if (photo) byTitle.set((page.title || '').toLowerCase(), photo)
  }
  return titles
    .map((t) => byTitle.get(t.toLowerCase()))
    .filter(Boolean)
}

async function searchPhotos(query) {
  const api =
    `https://commons.wikimedia.org/w/api.php?action=query&format=json` +
    `&generator=search&gsrnamespace=6&gsrsearch=${encodeURIComponent(query)}` +
    `&gsrlimit=14&prop=imageinfo&iiprop=url|extmetadata|size|mime&iiurlwidth=1280`
  const data = await fetchJson(api)
  return Object.values(data?.query?.pages ?? {})
    .map(pageToPhoto)
    .filter(Boolean)
}

function nameTokens(peak) {
  return [peak.name, peak.id, ...(peak.aliases || [])]
    .join(' ')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length >= 4 && !['mount', 'peak', 'mountain'].includes(t))
}

async function photosFor(peak, curatedTitles) {
  const out = []
  const curated = await resolveTitles(curatedTitles)
  for (const ph of curated) {
    if (out.length >= 2) break
    if (!out.some((x) => x.url === ph.url)) out.push(ph)
  }

  const queries = [
    `${peak.name} ${peak.nearestTown?.region || 'USA'} mountain`,
    `${peak.name} summit`,
    `"${peak.name}" Colorado mountain`,
  ]
  const tokens = nameTokens(peak)
  for (const q of queries) {
    if (out.length >= 2) break
    try {
      const found = await searchPhotos(q)
      for (const ph of found) {
        if (out.length >= 2) break
        const hay = `${ph.title} ${ph.url} ${ph.sourceUrl}`.toLowerCase()
        if (!tokens.some((t) => hay.includes(t))) continue
        if (!out.some((x) => x.url === ph.url)) out.push(ph)
      }
    } catch (err) {
      console.warn('search fail', peak.id, err.message)
    }
    await new Promise((r) => setTimeout(r, 450))
  }
  return out.slice(0, 2).map(({ title: _t, ...rest }) => rest)
}

const peaks = JSON.parse(readFileSync(peaksPath, 'utf8'))
const ids = Object.keys(CURATED)

for (const id of ids) {
  const i = peaks.findIndex((p) => p.id === id)
  if (i < 0) {
    console.warn('missing', id)
    continue
  }
  console.log('fix', id)
  const photos = await photosFor(peaks[i], CURATED[id])
  if (photos.length < 2) {
    console.error('  only', photos.length, photos.map((p) => p.sourceUrl))
    continue
  }
  peaks[i].photos = photos
  peaks[i].photo = photos[0]
  console.log(
    '  ->',
    photos.map((p) => p.sourceUrl.split('/wiki/')[1] || p.sourceUrl).join(' | '),
  )
  await new Promise((r) => setTimeout(r, 350))
}

writeFileSync(peaksPath, `${JSON.stringify(peaks, null, 2)}\n`)
console.log('done')
