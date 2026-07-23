import { readFileSync, writeFileSync } from 'node:fs'

const peaks = JSON.parse(readFileSync('src/data/peaks.json', 'utf8'))
const UA = 'PeakAtlas3D/0.2'

async function search(query) {
  const api =
    `https://commons.wikimedia.org/w/api.php?action=query&format=json` +
    `&generator=search&gsrnamespace=6&gsrsearch=${encodeURIComponent(query)}` +
    `&gsrlimit=20&prop=imageinfo&iiprop=url|extmetadata|size|mime&iiurlwidth=1280`
  const data = await (
    await fetch(api, { headers: { 'User-Agent': UA } })
  ).json()
  const out = []
  for (const page of Object.values(data.query?.pages || {})) {
    const info = page.imageinfo?.[0]
    if (!info || page.missing != null) continue
    if (!String(info.mime || '').startsWith('image/') || /svg|djvu|tif/.test(info.mime))
      continue
    if ((info.width || 0) < 800 || (info.height || 0) < 500) continue
    const title = (page.title || '').toLowerCase()
    if (!title.includes('sherman')) continue
    if (/mine|hilltop|map|gps|highway|plaque|sign|memoir|djvu/.test(title)) continue
    const meta = info.extmetadata || {}
    out.push({
      url: info.thumburl || info.url,
      credit: String(meta.Artist?.value || 'Unknown')
        .replace(/<[^>]+>/g, '')
        .slice(0, 80),
      license: String(
        meta.LicenseShortName?.value || meta.License?.value || 'Unknown',
      ).replace(/<[^>]+>/g, ''),
      sourceUrl: info.descriptionurl || info.url,
      title: page.title,
    })
  }
  return out
}

const found = [
  ...(await search('Mount Sherman Colorado mountain')),
  ...(await search('Mt Sherman Colorado 14er')),
]
const uniq = []
for (const ph of found) {
  if (uniq.some((x) => x.url === ph.url)) continue
  uniq.push(ph)
  if (uniq.length >= 2) break
}
if (uniq.length < 2) {
  console.error(
    'need 2',
    found.map((p) => p.title),
  )
  process.exit(1)
}
const i = peaks.findIndex((p) => p.id === 'sherman')
peaks[i].photos = uniq.map(({ title: _t, ...rest }) => rest)
peaks[i].photo = peaks[i].photos[0]
writeFileSync('src/data/peaks.json', `${JSON.stringify(peaks, null, 2)}\n`)
console.log(
  'sherman',
  peaks[i].photos.map((p) => p.sourceUrl.split('/wiki/')[1]),
)
