#!/usr/bin/env node
/**
 * Write public/sitemap.xml and public/robots.txt from peaks.json + content routes.
 *
 * Run: npm run sitemap (also hooked from prebuild)
 * Env: SITE_URL=https://peakatlas3d.com (optional)
 */
import { mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  buildCountrySummaries,
  countryMeta,
} from './lib/countries-static.mjs'
import { COMPARISON_PAIRS } from './lib/peak-snapshot.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const peaksPath = join(root, 'src', 'data', 'peaks.json')
const publicDir = join(root, 'public')
const siteUrl = (process.env.SITE_URL || 'https://peakatlas3d.com').replace(
  /\/$/,
  '',
)

const peaks = JSON.parse(readFileSync(peaksPath, 'utf8'))
const peakIds = peaks
  .map((p) => p.id)
  .filter((id) => typeof id === 'string' && id.length > 0)
  .sort((a, b) => a.localeCompare(b))

const countrySummaries = buildCountrySummaries(peaks)
const countryPaths = countrySummaries.map((s) => countryMeta(s).path)

const peaksMtime = statSync(peaksPath).mtime.toISOString().slice(0, 10)
const today = new Date().toISOString().slice(0, 10)

/** @type {{ path: string, changefreq: string, priority: string, lastmod: string }[]} */
const staticRoutes = [
  { path: '/', changefreq: 'weekly', priority: '1.0', lastmod: today },
  { path: '/peaks', changefreq: 'weekly', priority: '0.9', lastmod: today },
  { path: '/compare', changefreq: 'weekly', priority: '0.85', lastmod: today },
  { path: '/about', changefreq: 'monthly', priority: '0.6', lastmod: today },
  { path: '/contact', changefreq: 'yearly', priority: '0.4', lastmod: today },
]

function escapeXml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

function urlEntry(loc, lastmod, changefreq, priority) {
  return `  <url>
    <loc>${escapeXml(loc)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
}

const urls = [
  ...staticRoutes.map((route) =>
    urlEntry(
      `${siteUrl}${route.path === '/' ? '/' : route.path}`,
      route.lastmod,
      route.changefreq,
      route.priority,
    ),
  ),
  ...countryPaths.map((path) =>
    urlEntry(`${siteUrl}${path}`, peaksMtime, 'weekly', '0.85'),
  ),
  ...COMPARISON_PAIRS.map((pair) =>
    urlEntry(
      `${siteUrl}/compare/${encodeURIComponent(pair.slug)}`,
      today,
      'monthly',
      '0.75',
    ),
  ),
  ...peakIds.map((id) =>
    urlEntry(
      `${siteUrl}/peak/${encodeURIComponent(id)}`,
      peaksMtime,
      'monthly',
      '0.8',
    ),
  ),
]

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`

const robots = `# PeakAtlas3D — allow full crawl.
User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
`

mkdirSync(publicDir, { recursive: true })
writeFileSync(join(publicDir, 'sitemap.xml'), `${sitemap}\n`)
writeFileSync(join(publicDir, 'robots.txt'), `${robots}\n`)

console.log(
  `Wrote sitemap (${staticRoutes.length + countryPaths.length + COMPARISON_PAIRS.length + peakIds.length} URLs: ${countryPaths.length} countries, ${COMPARISON_PAIRS.length} comparisons, ${peakIds.length} peaks) → ${siteUrl}`,
)
