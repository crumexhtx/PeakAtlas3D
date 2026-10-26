/**
 * Crawlable HTML + meta for /best-peaks and /best-peaks/{month}.
 * Keep grouping in sync with src/lib/bestPeaks.ts.
 */
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { countrySlug } from './countries-static.mjs'
import {
  MONTH_LABELS,
  MONTH_SLUGS,
  monthNumberFromSlug,
  monthSlugFromNumber,
  parseBestSeason,
  resolvePeakSeason,
} from './season-months.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '../..')
const copy = JSON.parse(
  readFileSync(join(root, 'src', 'data', 'bestPeaksCopy.json'), 'utf8'),
)

const DIFFICULTY_TIERS = [
  'day-hike',
  'strenuous-hike',
  'scramble',
  'snow-glacier',
  'alpine-technical',
  'expedition',
]

const DIFFICULTY_TIER_LABELS = {
  'day-hike': 'Day hike',
  'strenuous-hike': 'Strenuous hike',
  scramble: 'Scramble',
  'snow-glacier': 'Snow / glacier',
  'alpine-technical': 'Alpine technical',
  expedition: 'Expedition',
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function escapeAttr(value) {
  return escapeHtml(value).replaceAll("'", '&#39;')
}

function formatFt(n) {
  const num = Number(n)
  if (!Number.isFinite(num)) return ''
  return `${Math.round(num).toLocaleString('en-US')} ft`
}

function peaksInMonth(peaks, month) {
  return peaks
    .map((peak) => {
      const season = resolvePeakSeason(peak)
      if (!season.months.includes(month)) return null
      const parsed = parseBestSeason(peak.bestSeason ?? '')
      return { peak, shoulder: parsed.confidence === 'approx' }
    })
    .filter(Boolean)
    .sort((a, b) => b.peak.elevationFt - a.peak.elevationFt)
}

function monthCounts(peaks) {
  const counts = Object.fromEntries(MONTH_SLUGS.map((slug) => [slug, 0]))
  for (const peak of peaks) {
    const season = resolvePeakSeason(peak)
    for (const month of season.months) {
      const slug = monthSlugFromNumber(month)
      if (slug) counts[slug] += 1
    }
  }
  return counts
}

function peakTier(peak) {
  if (DIFFICULTY_TIERS.includes(peak.difficultyTier)) return peak.difficultyTier
  return 'strenuous-hike'
}

function groupByTier(rows) {
  return DIFFICULTY_TIERS.map((tier) => ({
    tier,
    label: DIFFICULTY_TIER_LABELS[tier],
    peaks: rows.filter((row) => peakTier(row.peak) === tier),
  })).filter((group) => group.peaks.length > 0)
}

function headlineNames(rows, limit = 3) {
  return rows.slice(0, limit).map((row) => row.peak.name)
}

function countryHref(peak, primaryByLabel, siteUrl) {
  const name = primaryByLabel.get(peak.country) || peak.country
  return `${siteUrl}/countries/${countrySlug(name)}`
}

function monthSwitcherHtml(siteUrl, currentSlug, counts) {
  const items = MONTH_SLUGS.map((slug) => {
    const href = `${siteUrl}/best-peaks/${slug}`
    const count = counts[slug]
    const current = slug === currentSlug ? ' aria-current="page"' : ''
    return `<li><a href="${escapeAttr(href)}"${current}>${escapeHtml(MONTH_LABELS[slug])} (${count})</a></li>`
  }).join('')
  return `<nav aria-label="Months"><ul>${items}</ul></nav>`
}

export function metaForBestPeaksIndex() {
  return {
    title: 'Best Peaks to Climb by Month | PeakAtlas3D',
    description:
      'Best peaks to climb each month from the PeakAtlas3D catalog — January through December, grouped by difficulty, with season windows from each summit’s published best season.',
    path: '/best-peaks',
  }
}

export function metaForBestPeaksMonth(peaks, slug) {
  const month = monthNumberFromSlug(slug)
  const rows = month ? peaksInMonth(peaks, month) : []
  const label = MONTH_LABELS[slug]
  const headlines = headlineNames(rows, 3)
  const named = headlines.length ? ` including ${headlines.join(', ')}` : ''
  return {
    title: `Best Peaks to Climb in ${label} (${rows.length} Summits) | PeakAtlas3D`,
    description: `Best peaks to climb in ${label}: ${rows.length} PeakAtlas3D catalog summit${rows.length === 1 ? '' : 's'}${named}. Difficulty, season windows, and links to each 3D trip guide.`,
    path: `/best-peaks/${slug}`,
  }
}

export function bestPeaksIndexHtml(peaks, siteUrl) {
  const counts = monthCounts(peaks)
  const monthCards = MONTH_SLUGS.map((slug) => {
    const href = `${siteUrl}/best-peaks/${slug}`
    return `<li><a href="${escapeAttr(href)}">${escapeHtml(MONTH_LABELS[slug])}</a> <span>(${counts[slug]} peaks)</span></li>`
  }).join('')

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${siteUrl}/` },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Best peaks',
        item: `${siteUrl}/best-peaks`,
      },
    ],
  }
  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Best peaks to climb by month',
    numberOfItems: MONTH_SLUGS.length,
    itemListElement: MONTH_SLUGS.map((slug, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `${siteUrl}/best-peaks/${slug}`,
      name: `Best peaks to climb in ${MONTH_LABELS[slug]}`,
    })),
  }

  const inner = `<main style="font-family: system-ui, sans-serif; max-width: 42rem; margin: 2rem auto; padding: 0 1rem;">
        <h1>Best peaks to climb by month</h1>
        <p>Twelve planning pages built from each summit’s published best season in the PeakAtlas3D catalog — not a generic hemisphere guess. Open a month for difficulty groups, country links, and the 3D trip guides.</p>
        <section aria-label="All months">
          <h2>All months</h2>
          <ul>${monthCards}</ul>
        </section>
        ${monthSwitcherHtml(siteUrl, null, counts)}
        <p><a href="${escapeAttr(siteUrl)}/peaks">All peaks</a> · <a href="${escapeAttr(siteUrl)}/">Open the 3D atlas</a></p>
      </main>`

  const extraHead = `<script type="application/ld+json">${JSON.stringify(breadcrumb)}</script>
<script type="application/ld+json">${JSON.stringify(itemList)}</script>`
  return { inner, extraHead }
}

export function bestPeaksMonthHtml(peaks, slug, siteUrl, primaryByLabel) {
  const month = monthNumberFromSlug(slug)
  const rows = month ? peaksInMonth(peaks, month) : []
  const groups = groupByTier(rows)
  const counts = monthCounts(peaks)
  const label = MONTH_LABELS[slug]
  const intros = (copy[slug]?.paragraphs ?? [])
    .map((p) => `<p>${escapeHtml(p)}</p>`)
    .join('')

  const countrySeen = new Map()
  for (const { peak } of rows) {
    const name = primaryByLabel.get(peak.country) || peak.country
    if (!countrySeen.has(name)) {
      countrySeen.set(name, countryHref(peak, primaryByLabel, siteUrl))
    }
  }
  const countryList = [...countrySeen.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(
      ([name, href]) =>
        `<li><a href="${escapeAttr(href)}">${escapeHtml(name)}</a></li>`,
    )
    .join('')

  const sections = groups
    .map((group) => {
      const items = group.peaks
        .map(({ peak, shoulder }) => {
          const countryUrl = countryHref(peak, primaryByLabel, siteUrl)
          const shoulderLabel = shoulder
            ? ' <span>shoulder month</span>'
            : ''
          return `<li>
            <a href="${escapeAttr(siteUrl)}/peak/${escapeAttr(peak.id)}">${escapeHtml(peak.name)}</a>
            — <a href="${escapeAttr(countryUrl)}">${escapeHtml(peak.country)}</a>
            · ${escapeHtml(formatFt(peak.elevationFt))}
            ${peak.difficulty ? ` · ${escapeHtml(peak.difficulty)}` : ''}
            ${peak.bestSeason ? ` · ${escapeHtml(peak.bestSeason)}` : ''}
            ${shoulderLabel}
          </li>`
        })
        .join('')
      return `<section aria-label="${escapeAttr(group.label)}">
          <h2>${escapeHtml(group.label)} (${group.peaks.length})</h2>
          <ul>${items}</ul>
        </section>`
    })
    .join('')

  const pageUrl = `${siteUrl}/best-peaks/${slug}`
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${siteUrl}/` },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Best peaks',
        item: `${siteUrl}/best-peaks`,
      },
      { '@type': 'ListItem', position: 3, name: label, item: pageUrl },
    ],
  }
  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Best peaks to climb in ${label}`,
    numberOfItems: rows.length,
    itemListElement: rows.map((row, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `${siteUrl}/peak/${row.peak.id}`,
      name: row.peak.name,
    })),
  }

  const inner = `<main style="font-family: system-ui, sans-serif; max-width: 42rem; margin: 2rem auto; padding: 0 1rem;">
        <h1>Best Peaks to Climb in ${escapeHtml(label)}</h1>
        <p>${rows.length} catalog summit${rows.length === 1 ? '' : 's'} list ${escapeHtml(label)} in their published season window.</p>
        ${intros}
        ${monthSwitcherHtml(siteUrl, slug, counts)}
        <section aria-label="Countries in season">
          <h2>Countries in season</h2>
          <ul>${countryList}</ul>
        </section>
        ${sections}
        <p><a href="${escapeAttr(siteUrl)}/peaks">All peaks</a> · <a href="${escapeAttr(siteUrl)}/best-peaks">All months</a> · <a href="${escapeAttr(siteUrl)}/">Open the 3D atlas</a></p>
      </main>`

  const extraHead = `<script type="application/ld+json">${JSON.stringify(breadcrumb)}</script>
<script type="application/ld+json">${JSON.stringify(itemList)}</script>`
  return { inner, extraHead }
}

export { MONTH_SLUGS, MONTH_LABELS, monthCounts }
