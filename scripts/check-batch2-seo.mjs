import { existsSync, readFileSync } from 'node:fs'

const ids = [
  'glacierpeak',
  'shuksan',
  'jeffersonor',
  'brokentop',
  'lassen',
  'sanjacinto',
  'sangorgonio',
  'baldy',
  'tallac',
  'sneffels',
  'uncompahgre',
  'harvard',
  'sherman',
  'bluesky',
  'wheelernm',
  'sandia',
  'leconte',
  'oldrag',
  'mansfield',
  'cadillac',
]

const peaks = JSON.parse(readFileSync('src/data/peaks.json', 'utf8'))
const index = JSON.parse(readFileSync('src/data/peaks.index.json', 'utf8'))
const sitemap = readFileSync('public/sitemap.xml', 'utf8')

let ok = 0
for (const id of ids) {
  const peak = peaks.find((p) => p.id === id)
  const path = `dist/peak/${id}/index.html`
  const issues = []
  if (!peak) issues.push('missing peak')
  if (!index.some((p) => p.id === id)) issues.push('missing index')
  if (!sitemap.includes(`/peak/${id}<`)) issues.push('missing sitemap')
  if (!peak?.seoMetaDescription?.trim()) issues.push('no seoMetaDescription')
  if (!existsSync(path)) {
    issues.push('no prerender html (run build/prerender)')
  } else {
    const html = readFileSync(path, 'utf8')
    const titles = [...html.matchAll(/<title>([^<]*)<\/title>/gi)].map((m) => m[1])
    const descs = [
      ...html.matchAll(
        /<meta\s+name=["']description["']\s+content=["']([^"']*)["']/gi,
      ),
    ].map((m) => m[1])
    const ogDescs = [
      ...html.matchAll(
        /<meta\s+property=["']og:description["']\s+content=["']([^"']*)["']/gi,
      ),
    ].map((m) => m[1])
    const ogImgs = [
      ...html.matchAll(
        /<meta\s+property=["']og:image["']\s+content=["']([^"']*)["']/gi,
      ),
    ].map((m) => m[1])
    const canons = [
      ...html.matchAll(
        /<link\s+rel=["']canonical["']\s+href=["']([^"']*)["']/gi,
      ),
    ].map((m) => m[1])
    if (titles.length !== 1) issues.push(`title count ${titles.length}`)
    if (!titles[0]?.includes(peak.name.split(' ')[0])) {
      issues.push(`title mismatch: ${titles[0]}`)
    }
    if (descs.length !== 1) issues.push(`description count ${descs.length}`)
    if (ogDescs.length !== 1) issues.push(`og:description count ${ogDescs.length}`)
    if (!descs[0] || descs[0].includes('Mapbox globe')) {
      issues.push('generic description still present')
    }
    if (ogImgs.length !== 1 || !ogImgs[0]) issues.push('missing og:image')
    if (canons[0] !== `https://peakatlas3d.com/peak/${id}`) {
      issues.push(`canonical ${canons[0]}`)
    }
  }
  if (issues.length) {
    console.log(`FAIL ${id}: ${issues.join('; ')}`)
  } else {
    ok += 1
    console.log(`OK   ${id}`)
  }
}
console.log(`\nSEO/prerender: ${ok}/${ids.length} ok`)
