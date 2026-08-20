/**
 * Peak planning snapshot + comparison HTML for prerender shells.
 * Mirrors src/lib/peakSnapshot.ts formulas so crawlable HTML stays in sync.
 */
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const comparisons = JSON.parse(
  readFileSync(join(root, 'src', 'data', 'comparisons.json'), 'utf8'),
)

export const CATALOG_AS_OF = comparisons.asOf
export const CATALOG_METHODOLOGY = comparisons.methodology
export const COMPARISON_PAIRS = comparisons.pairs

const TIER_LABELS = {
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

function formatFt(n) {
  return `${Number(n).toLocaleString('en-US')} ft`
}

function resolveTier(difficulty, explicit) {
  if (explicit && TIER_LABELS[explicit]) return explicit
  const d = String(difficulty || '').toLowerCase()
  if (/expedition|8000|trekking peak|high-altitude trek/.test(d)) return 'expedition'
  if (/glacier|snow climb|snow \/ glacier/.test(d)) return 'snow-glacier'
  if (/alpine|technical rock|via ferrata/.test(d)) return 'alpine-technical'
  if (/scramble|class 3|class 4/.test(d)) return 'scramble'
  if (/class 2|strenuous/.test(d)) return 'strenuous-hike'
  return 'day-hike'
}

function permitShort(peak) {
  if (peak.permitStatus === 'required' || peak.permitRequired === true) {
    return 'Permit required'
  }
  if (peak.permitStatus === 'not_required' || peak.permitRequired === false) {
    return 'No special summit permit'
  }
  return 'Permit status unverified'
}

function stagingShort(peak) {
  const town = peak.nearestTown
  if (!town?.name) return 'Staging not listed'
  const miles =
    typeof town.distanceMiles === 'number'
      ? `${town.distanceMiles.toFixed(town.distanceMiles >= 10 ? 0 : 1)} mi`
      : null
  return [town.name, miles].filter(Boolean).join(' · ')
}

function metricsFor(peak) {
  const tier = resolveTier(peak.difficulty, peak.difficultyTier)
  const hotels = Array.isArray(peak.hotels) ? peak.hotels.length : 0
  const trails = Array.isArray(peak.trails) ? peak.trails.length : 0
  return [
    { label: 'Elevation', value: formatFt(peak.elevationFt) },
    { label: 'Prominence', value: formatFt(peak.prominenceFt) },
    { label: 'Difficulty tier', value: TIER_LABELS[tier] },
    { label: 'Best season', value: peak.bestSeason?.trim() || '—' },
    { label: 'Permits', value: permitShort(peak) },
    { label: 'Staging', value: stagingShort(peak) },
    {
      label: 'Mapped lodging',
      value: hotels > 0 ? `${hotels} OSM place${hotels === 1 ? '' : 's'}` : 'Limited / none mapped',
    },
    { label: 'Listed trails', value: trails > 0 ? `${trails}` : '—' },
  ]
}

function peakAnswer(peak) {
  const tier = resolveTier(peak.difficulty, peak.difficultyTier)
  const tierLabel = TIER_LABELS[tier]
  const season = peak.bestSeason?.trim() || 'season varies'
  const town = peak.nearestTown
  const staging = town?.name
    ? `${town.name}${
        typeof town.distanceMiles === 'number'
          ? ` (${town.distanceMiles.toFixed(town.distanceMiles >= 10 ? 0 : 1)} mi)`
          : ''
      }`
    : 'a nearby staging town'
  const hotels = Array.isArray(peak.hotels) ? peak.hotels.length : 0
  const lodgingBit =
    hotels > 0
      ? ` PeakAtlas lists ${hotels} OpenStreetMap lodging pin${hotels === 1 ? '' : 's'} near the summit — coverage is often thinner outside well-mapped regions.`
      : ' Limited lodging data is mapped from OpenStreetMap for this region — stage in the listed town rather than expecting a full hotel directory.'
  return `${peak.name} is a ${formatFt(peak.elevationFt)} summit in the ${peak.range} (${peak.country}). PeakAtlas rates it ${tierLabel.toLowerCase()} (${peak.difficulty || 'difficulty varies'}); best season is ${season}. ${permitShort(peak)}. Typical staging is ${staging}.${lodgingBit} Use the 3D map and trip checklist before you go.`
}

export function peakSnapshotHtml(peak) {
  const metrics = metricsFor(peak)
  const answer = peakAnswer(peak)
  const related = COMPARISON_PAIRS.filter(
    (p) => p.aId === peak.id || p.bId === peak.id,
  ).slice(0, 3)
  const compareLinks = related.length
    ? `<p>Compare: ${related
        .map(
          (c) =>
            `<a href="/compare/${escapeHtml(c.slug)}">${escapeHtml(c.title)}</a>`,
        )
        .join(' · ')}</p>`
    : ''

  return `<section aria-label="Planning snapshot">
    <h2>Planning snapshot</h2>
    <p>${escapeHtml(answer)}</p>
    <dl>${metrics
      .map(
        (m) =>
          `<div><dt>${escapeHtml(m.label)}</dt><dd>${escapeHtml(m.value)}</dd></div>`,
      )
      .join('')}</dl>
    <p><strong>As of ${escapeHtml(CATALOG_AS_OF)}</strong> · ${escapeHtml(CATALOG_METHODOLOGY)}</p>
    ${compareLinks}
  </section>`
}

export function compareIndexHtml(siteUrl) {
  const list = COMPARISON_PAIRS.map(
    (c) =>
      `<li><a href="${escapeHtml(siteUrl)}/compare/${escapeHtml(c.slug)}">${escapeHtml(c.title)}</a> — ${escapeHtml(c.query)}</li>`,
  ).join('')
  return `<main style="font-family: system-ui, sans-serif; max-width: 42rem; margin: 2rem auto; padding: 0 1rem;">
    <article>
      <p>Guides</p>
      <h1>Peak comparisons</h1>
      <p>High-intent A vs B pages built from PeakAtlas3D catalog metrics. As of ${escapeHtml(CATALOG_AS_OF)}.</p>
      <p>${escapeHtml(CATALOG_METHODOLOGY)}</p>
      <section>
        <h2>Which peaks should you compare?</h2>
        <ul>${list}</ul>
      </section>
      <nav><p><a href="${escapeHtml(siteUrl)}/peaks">All peaks</a> · <a href="${escapeHtml(siteUrl)}/">Atlas</a></p></nav>
    </article>
  </main>`
}

export function comparePageHtml(pair, a, b, siteUrl) {
  const ma = metricsFor(a)
  const mb = metricsFor(b)
  const rows = ma
    .map(
      (row, i) =>
        `<tr><th scope="row">${escapeHtml(row.label)}</th><td>${escapeHtml(row.value)}</td><td>${escapeHtml(mb[i]?.value || '—')}</td></tr>`,
    )
    .join('')
  return `<main style="font-family: system-ui, sans-serif; max-width: 42rem; margin: 2rem auto; padding: 0 1rem;">
    <article>
      <p>Compare</p>
      <h1>${escapeHtml(pair.title)}</h1>
      <p><strong>${escapeHtml(pair.query)}</strong></p>
      <p>${escapeHtml(pair.summary)}</p>
      <p><strong>As of ${escapeHtml(CATALOG_AS_OF)}</strong> · ${escapeHtml(CATALOG_METHODOLOGY)}</p>
      <section>
        <h2>How do the catalog numbers compare?</h2>
        <table>
          <thead><tr><th>Metric</th><th>${escapeHtml(a.name)}</th><th>${escapeHtml(b.name)}</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </section>
      <section>
        <h2>When should you pick each peak?</h2>
        <h3>Choose ${escapeHtml(a.name)}</h3>
        <p>${escapeHtml(pair.pickA)}</p>
        <h3>Choose ${escapeHtml(b.name)}</h3>
        <p>${escapeHtml(pair.pickB)}</p>
      </section>
      <section>
        <h2>What’s the short verdict?</h2>
        <p>${escapeHtml(pair.verdict)}</p>
      </section>
      <nav>
        <p>
          <a href="${escapeHtml(siteUrl)}/peak/${escapeHtml(a.id)}">${escapeHtml(a.name)} trip guide</a> ·
          <a href="${escapeHtml(siteUrl)}/peak/${escapeHtml(b.id)}">${escapeHtml(b.name)} trip guide</a> ·
          <a href="${escapeHtml(siteUrl)}/compare">All comparisons</a>
        </p>
      </nav>
    </article>
  </main>`
}
