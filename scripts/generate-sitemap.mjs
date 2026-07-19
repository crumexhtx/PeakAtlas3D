#!/usr/bin/env node
/**
 * Writes public/sitemap.xml from static routes + peak pages.
 * Run via `npm run sitemap` (also hooked from `prebuild`).
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const SITE = 'https://peakatlas3d.com'

const peaks = JSON.parse(
  readFileSync(join(root, 'src/data/peaks.json'), 'utf8'),
)

const today = new Date().toISOString().slice(0, 10)

/** @type {{ loc: string, changefreq: string, priority: string }[]} */
const urls = [
  { loc: '/', changefreq: 'weekly', priority: '1.0' },
  { loc: '/about', changefreq: 'monthly', priority: '0.7' },
  { loc: '/releases', changefreq: 'weekly', priority: '0.6' },
  { loc: '/contact', changefreq: 'yearly', priority: '0.5' },
]

for (const peak of peaks) {
  if (!peak?.id) continue
  urls.push({
    loc: `/peak/${encodeURIComponent(peak.id)}`,
    changefreq: 'monthly',
    priority: '0.8',
  })
}

const body = urls
  .map(
    (u) => `  <url>
    <loc>${SITE}${u.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`,
  )
  .join('\n')

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`

const outDir = join(root, 'public')
mkdirSync(outDir, { recursive: true })
const outPath = join(outDir, 'sitemap.xml')
writeFileSync(outPath, xml)
console.log(`Wrote ${outPath} (${urls.length} URLs)`)
