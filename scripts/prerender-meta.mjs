/**
 * After Vite build, write route HTML shells with correct title / description / OG
 * tags and crawlable body copy so Search Console can index without waiting on JS.
 *
 * SEO body is injected into `#root` as `#seo-prerender` (cleared when React mounts).
 * A matching `<noscript>` copy remains for no-JS clients.
 *
 * Run: node scripts/prerender-meta.mjs
 * Env: SITE_URL=https://peakatlas3d.com (optional)
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  buildCountrySummaries,
  countryMeta,
  countrySlug,
} from './lib/countries-static.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const distDir = join(root, 'dist')
const peaksPath = join(root, 'src', 'data', 'peaks.json')
const siteUrl = (process.env.SITE_URL || 'https://peakatlas3d.com').replace(
  /\/$/,
  '',
)

const DEFAULT_DESCRIPTION =
  'Research any peak — difficulty, best season, permits, and what you need to know before you go — then explore it in 3D.'

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

function peakLocationLabel(peak) {
  const countryLevel = new Set([
    'usa',
    'united states',
    'united states of america',
    'u.s.',
    'u.s.a.',
  ])
  const candidates = [
    peak.nearestTown?.region,
    peak.nearbyPlaces?.[0]?.region,
  ]
  let region = null
  for (const raw of candidates) {
    const value = typeof raw === 'string' ? raw.trim() : ''
    if (!value) continue
    if (countryLevel.has(value.toLowerCase())) continue
    region = value
    break
  }
  const country = String(peak.country || '').trim()
  if (!region) return country
  if (region.toLowerCase() === country.toLowerCase()) return country
  if (country.toLowerCase().includes(region.toLowerCase())) return country
  return `${region}, ${country}`
}

function peakRegion(peak) {
  const label = peakLocationLabel(peak)
  if (!label.includes(',')) return null
  return label.split(',')[0].trim()
}

function peakImage(peak) {
  return peak.photos?.[0]?.url || peak.photo?.url || ''
}

function peakDescription(peak) {
  const location = peakLocationLabel(peak)
  if (peak.seoMetaDescription?.trim()) {
    const curated = peak.seoMetaDescription.trim()
    if (curated.toLowerCase().includes(location.toLowerCase())) return curated
    const withLoc = `${curated} Location: ${location}.`
    return withLoc.length > 300 ? `${withLoc.slice(0, 297)}…` : withLoc
  }

  const base =
    peak.whyNotable?.trim() ||
    peak.description?.trim() ||
    `${peak.name} in the ${peak.range}, ${location}.`

  const trails = (peak.trails || [])
    .map((t) => t?.name)
    .filter(Boolean)
    .slice(0, 2)

  const coFourteeners = new Set([
    'elbert',
    'longs',
    'pikes',
    'blanca',
    'crestone',
    'capitol',
    'pyramid',
    'massive',
    'quandary',
    'grays',
    'torreys',
    'bierstadt',
    'maroon',
    'sneffels',
    'uncompahgre',
    'harvard',
    'sherman',
    'bluesky',
  ])

  const parts = [base]
  if (!base.toLowerCase().includes(location.toLowerCase())) {
    parts.push(`Location: ${location}.`)
  }
  if (trails.length) {
    parts.push(`Popular trails: ${trails.join(', ')}.`)
  }
  if (coFourteeners.has(peak.id)) {
    parts.push('References: 14ers.com.')
  } else if (peak.country === 'USA' && trails.length) {
    parts.push('References: NPS, USFS, or state park sources.')
  }

  const text = parts.join(' ')
  return text.length > 300 ? `${text.slice(0, 297)}…` : text
}

function formatFt(n) {
  return `${Number(n).toLocaleString('en-US')} ft`
}

/** Shared article markup — used in crawlable `#seo-prerender` and `<noscript>`. */
function peakArticleHtml(peak, url, countryLandingHref) {
  const location = peakLocationLabel(peak)
  const trails = (peak.trails || []).map((t) => t.name).filter(Boolean)
  const nearby = peak.nearbyPlaces?.length
    ? peak.nearbyPlaces
    : peak.nearestTown
      ? [peak.nearestTown]
      : []

  const trailList =
    trails.length > 0
      ? `<section aria-label="Notable trails">
          <h2>Notable trails &amp; routes</h2>
          <ul>${trails.map((n) => `<li>${escapeHtml(n)}</li>`).join('')}</ul>
        </section>`
      : ''

  const nearbyList =
    nearby.length > 0
      ? `<section aria-label="Closest places">
          <h2>Closest places</h2>
          <ul>${nearby
            .map(
              (p) =>
                `<li>${escapeHtml(p.name)} — ${escapeHtml(p.region)}${
                  p.route ? ` via ${escapeHtml(p.route)}` : ''
                }</li>`,
            )
            .join('')}</ul>
        </section>`
      : ''

  const locationHtml = countryLandingHref
    ? `<a href="${escapeAttr(countryLandingHref)}">${escapeHtml(location)}</a>`
    : escapeHtml(location)

  const countryNav = countryLandingHref
    ? `<a href="${escapeAttr(countryLandingHref)}">Country peaks</a> · `
    : ''

  return `<main style="font-family: system-ui, sans-serif; max-width: 40rem; margin: 2rem auto; padding: 0 1rem;">
        <article itemscope itemtype="https://schema.org/Mountain">
          <header>
            <p>${locationHtml}</p>
            <h1 itemprop="name">${escapeHtml(peak.name)}</h1>
            <p>Trip Guide &amp; 3D Map</p>
            <p>${escapeHtml(peak.range)} · Difficulty, season, and access — then explore the 3D terrain</p>
          </header>
          <section aria-label="Trip readiness">
            <h2>Trip readiness</h2>
            <dl>
              <div><dt>Difficulty</dt><dd>${escapeHtml(peak.difficulty || '')}</dd></div>
              <div><dt>Best season</dt><dd>${escapeHtml(peak.bestSeason || '')}</dd></div>
              <div><dt>Access / staging</dt><dd>${escapeHtml(
                peak.nearestTown?.name
                  ? `${peak.nearestTown.name}${peak.nearestTown.region ? `, ${peak.nearestTown.region}` : ''}`
                  : '',
              )}</dd></div>
            </dl>
          </section>
          <section aria-label="Peak stats">
            <h2>Peak stats</h2>
            <dl>
              <div><dt>Location</dt><dd>${locationHtml}</dd></div>
              <div><dt>Elevation</dt><dd>${escapeHtml(formatFt(peak.elevationFt))}</dd></div>
              <div><dt>Prominence</dt><dd>${escapeHtml(formatFt(peak.prominenceFt))}</dd></div>
              <div><dt>Mountain range</dt><dd>${escapeHtml(peak.range)}</dd></div>
              <div><dt>Difficulty</dt><dd>${escapeHtml(peak.difficulty || '')}</dd></div>
            </dl>
          </section>
          <section aria-label="Geography and climbing context">
            <h2>Geography &amp; climbing context</h2>
            ${
              peak.whyNotable
                ? `<p>${escapeHtml(peak.whyNotable)}</p>`
                : ''
            }
            <p itemprop="description">${escapeHtml(peak.description || '')}</p>
            <p>After you check trip readiness for ${escapeHtml(peak.name)}, explore the summit on PeakAtlas3D’s interactive 3D topographic map in the ${escapeHtml(peak.range)}, ${escapeHtml(location)}.</p>
          </section>
          ${nearbyList}
          ${trailList}
          <nav aria-label="Site">
            <p><a href="${escapeAttr(url)}">${escapeHtml(url)}</a></p>
            <p>${countryNav}<a href="${escapeAttr(siteUrl)}/peaks">All peaks</a> · <a href="${escapeAttr(siteUrl)}/">Atlas</a> · <a href="${escapeAttr(siteUrl)}/contact">Contact</a></p>
          </nav>
        </article>
      </main>`
}

function peakMountainJsonLd(peak, url) {
  const region = peakRegion(peak)
  return {
    '@context': 'https://schema.org',
    '@type': 'Mountain',
    name: peak.name,
    description: peakDescription(peak),
    url,
    geo: {
      '@type': 'GeoCoordinates',
      latitude: peak.lat,
      longitude: peak.lon,
      elevation: `${Math.round(peak.elevationFt * 0.3048)} m`,
    },
    containedInPlace: {
      '@type': 'MountainRange',
      name: peak.range,
    },
    address: {
      '@type': 'PostalAddress',
      addressCountry: peak.country,
      ...(region ? { addressRegion: region } : {}),
    },
    addressCountry: peak.country,
    ...(region ? { addressRegion: region } : {}),
  }
}

function wrapCrawlableBody(innerHtml, extraHead = '') {
  return `${extraHead}
    <div id="seo-prerender">${innerHtml}</div>
    <noscript id="seo-noscript">${innerHtml}</noscript>`
}

function peakCrawlableBody(peak, url, countryLandingHref) {
  const article = peakArticleHtml(peak, url, countryLandingHref)
  const jsonLd = `<script type="application/ld+json">${JSON.stringify(peakMountainJsonLd(peak, url))}</script>`
  return wrapCrawlableBody(article, jsonLd)
}

function staticPageBody(title, description, path) {
  const url = absoluteCanonical(path)
  return wrapCrawlableBody(`<main style="font-family: system-ui, sans-serif; max-width: 40rem; margin: 2rem auto; padding: 0 1rem;">
        <h1>${escapeHtml(title)}</h1>
        <p>${escapeHtml(description)}</p>
        <nav aria-label="Site">
          <p><a href="${escapeAttr(url)}">${escapeHtml(url)}</a></p>
          <p><a href="${escapeAttr(siteUrl)}/">Atlas</a> · <a href="${escapeAttr(siteUrl)}/peaks">All peaks</a> · <a href="${escapeAttr(siteUrl)}/about">About</a> · <a href="${escapeAttr(siteUrl)}/contact">Contact</a></p>
        </nav>
      </main>`)
}

function homeCrawlableBody(peaks) {
  const sorted = [...peaks].sort((a, b) => a.name.localeCompare(b.name))
  const links = sorted
    .map(
      (p) =>
        `<li><a href="${escapeAttr(siteUrl)}/peak/${escapeAttr(p.id)}">${escapeHtml(p.name)}</a> — ${escapeHtml(peakLocationLabel(p))}</li>`,
    )
    .join('')

  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'PeakAtlas3D peak catalog',
    numberOfItems: sorted.length,
    itemListElement: sorted.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${siteUrl}/peak/${p.id}`,
      name: p.name,
    })),
  }

  const inner = `<main style="font-family: system-ui, sans-serif; max-width: 42rem; margin: 2rem auto; padding: 0 1rem;">
        <h1>PeakAtlas3D — Trip-Ready Peak Guides</h1>
        <p>${escapeHtml(DEFAULT_DESCRIPTION)}</p>
        <p><a href="${escapeAttr(siteUrl)}/peaks">Browse all ${sorted.length} peaks</a> · <a href="${escapeAttr(siteUrl)}/about">About</a> · <a href="${escapeAttr(siteUrl)}/contact">Contact</a></p>
        <section aria-label="Peak directory">
          <h2>Peak directory</h2>
          <ul>${links}</ul>
        </section>
      </main>`

  return wrapCrawlableBody(
    inner,
    `<script type="application/ld+json">${JSON.stringify(itemList)}</script>`,
  )
}

function peaksIndexBody(peaks, countrySummaries) {
  const sections = countrySummaries
    .map((summary) => {
      const list = summary.peaks
        .map(
          (p) =>
            `<li><a href="${escapeAttr(siteUrl)}/peak/${escapeAttr(p.id)}">${escapeHtml(p.name)}</a> <span>(${escapeHtml(formatFt(p.elevationFt))} · ${escapeHtml(p.range)})</span></li>`,
        )
        .join('')
      const href = `${siteUrl}/countries/${countrySlug(summary.name)}`
      return `<section aria-label="${escapeAttr(summary.name)}">
          <h2><a href="${escapeAttr(href)}">${escapeHtml(summary.name)}</a> (${summary.peakCount})</h2>
          <ul>${list}</ul>
        </section>`
    })
    .join('')

  return wrapCrawlableBody(`<main style="font-family: system-ui, sans-serif; max-width: 42rem; margin: 2rem auto; padding: 0 1rem;">
        <h1>All peaks — PeakAtlas3D</h1>
        <p>Trip-ready guides for ${peaks.length} summits across ${countrySummaries.length} countries — difficulty, season, permits, and 3D terrain.</p>
        <p><a href="${escapeAttr(siteUrl)}/">Open the 3D atlas</a> · <a href="${escapeAttr(siteUrl)}/contact">Contact</a></p>
        ${sections}
      </main>`)
}

function countryCrawlableBody(summary, allSummaries) {
  const meta = countryMeta(summary)
  const url = `${siteUrl}${meta.path}`
  const peakList = summary.peaks
    .map(
      (p) =>
        `<li><a href="${escapeAttr(siteUrl)}/peak/${escapeAttr(p.id)}">${escapeHtml(p.name)}</a> <span>(${escapeHtml(formatFt(p.elevationFt))} · ${escapeHtml(p.range)})</span></li>`,
    )
    .join('')
  const otherCountries = allSummaries
    .filter((s) => s.name !== summary.name)
    .map(
      (s) =>
        `<li><a href="${escapeAttr(siteUrl)}/countries/${escapeAttr(countrySlug(s.name))}">${escapeHtml(s.name)}</a> (${s.peakCount})</li>`,
    )
    .join('')

  return wrapCrawlableBody(`<main style="font-family: system-ui, sans-serif; max-width: 42rem; margin: 2rem auto; padding: 0 1rem;">
        <h1>${escapeHtml(summary.name)} peaks — PeakAtlas3D</h1>
        <p>${escapeHtml(meta.description)}</p>
        <p><a href="${escapeAttr(siteUrl)}/?country=${escapeAttr(encodeURIComponent(summary.name))}">Open ${escapeHtml(summary.name)} on the 3D atlas</a> · <a href="${escapeAttr(siteUrl)}/peaks">All peaks</a></p>
        <section aria-label="${escapeAttr(summary.name)} peaks">
          <h2>Peaks in ${escapeHtml(summary.name)} (${summary.peakCount})</h2>
          <ul>${peakList}</ul>
        </section>
        <section aria-label="Other countries">
          <h2>Other countries</h2>
          <ul>${otherCountries}</ul>
        </section>
        <nav aria-label="Site">
          <p><a href="${escapeAttr(url)}">${escapeHtml(url)}</a></p>
        </nav>
      </main>`)
}

/** Pathname-only absolute URL (strips query/hash) for canonical + og:url. */
function absoluteCanonical(pathOrUrl) {
  try {
    const parsed = new URL(pathOrUrl, `${siteUrl}/`)
    const pathname =
      parsed.pathname.replace(/\/{2,}/g, '/').replace(/\/$/, '') || '/'
    return `${siteUrl}${pathname === '/' ? '/' : pathname}`
  } catch {
    const pathOnly = String(pathOrUrl).split(/[?#]/)[0]
    const normalized =
      pathOnly !== '/' && pathOnly.endsWith('/')
        ? pathOnly.slice(0, -1)
        : pathOnly || '/'
    return `${siteUrl}${normalized.startsWith('/') ? '' : '/'}${normalized}`
  }
}

function injectMeta(html, { title, description, path, image, bodyHtml, keepWebsiteJsonLd }) {
  const url = absoluteCanonical(path)
  let out = html

  out = out.replace(
    /<title>[^<]*<\/title>/i,
    `<title>${escapeHtml(title)}</title>`,
  )

  const upsertMeta = (attr, key, content) => {
    // Strip every existing tag for this key (handles multiline + prior inject dupes).
    const strip = new RegExp(
      `\\s*<meta\\b[^>]*?\\b${attr}=["']${key}["'][^>]*?/?>`,
      'gi',
    )
    out = out.replace(strip, '')
    const tag = `    <meta ${attr}="${key}" content="${escapeAttr(content)}" />`
    out = out.replace(/<\/head>/i, `${tag}\n  </head>`)
  }

  upsertMeta('name', 'description', description)
  upsertMeta('property', 'og:type', 'website')
  upsertMeta('property', 'og:site_name', 'PeakAtlas3D')
  upsertMeta('property', 'og:title', title)
  upsertMeta('property', 'og:description', description)
  upsertMeta('property', 'og:url', url)
  upsertMeta('name', 'twitter:title', title)
  upsertMeta('name', 'twitter:description', description)
  upsertMeta(
    'name',
    'twitter:card',
    image ? 'summary_large_image' : 'summary',
  )

  if (image) {
    upsertMeta('property', 'og:image', image)
    upsertMeta('name', 'twitter:image', image)
  } else {
    // Drop stale image tags from a previous prerender of this shell.
    out = out.replace(
      /\s*<meta\b[^>]*?\b(?:property|name)=["'](?:og:image|twitter:image)["'][^>]*?\/?>/gi,
      '',
    )
  }

  // Canonical helps Search Console / social scrapers.
  out = out.replace(/\s*<link\s+rel=["']canonical["'][^>]*\/?>/gi, '')
  out = out.replace(
    /<\/head>/i,
    `    <link rel="canonical" href="${escapeAttr(url)}" />\n  </head>`,
  )

  // Peak/content shells should not keep the homepage WebSite JSON-LD.
  if (!keepWebsiteJsonLd) {
    out = out.replace(
      /\s*<script\b[^>]*\btype=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi,
      '',
    )
  }

  const fallback =
    bodyHtml ||
    staticPageBody(title, description, path)

  // Always replace #root contents so rebuilds stay clean.
  if (/<div id="root"[\s>]/.test(out)) {
    out = out.replace(
      /<div id="root"[^>]*>[\s\S]*?<\/div>/i,
      `<div id="root">${fallback}</div>`,
    )
  } else {
    out = out.replace(
      /<body([^>]*)>/i,
      `<body$1>\n<div id="root">${fallback}</div>`,
    )
  }

  return out
}

function writeRoute(template, routePath, meta) {
  const dir = join(distDir, ...routePath.split('/').filter(Boolean))
  mkdirSync(dir, { recursive: true })
  const html = injectMeta(template, { ...meta, path: routePath })
  writeFileSync(join(dir, 'index.html'), html)
}

const indexPath = join(distDir, 'index.html')
let template
try {
  template = readFileSync(indexPath, 'utf8')
} catch {
  console.error('dist/index.html missing — run vite build first')
  process.exit(1)
}

const peaks = JSON.parse(readFileSync(peaksPath, 'utf8'))
const countrySummaries = buildCountrySummaries(peaks)

/** @type {Map<string, string>} raw peak.country → primary summary name */
const primaryByLabel = new Map()
for (const summary of countrySummaries) {
  for (const label of summary.labels) {
    primaryByLabel.set(label, summary.name)
  }
}

function countryLandingHrefForPeak(peak) {
  const name = primaryByLabel.get(peak.country) || peak.country
  if (!name) return ''
  return `${siteUrl}/countries/${countrySlug(name)}`
}

const staticPages = [
  {
    path: '/',
    title: 'PeakAtlas3D — Trip-Ready Peak Guides',
    description: DEFAULT_DESCRIPTION,
    image: '',
    keepWebsiteJsonLd: true,
    bodyHtml: homeCrawlableBody(peaks),
  },
  {
    path: '/about',
    title: 'About — PeakAtlas3D',
    description:
      'Why PeakAtlas3D exists: trip-ready peak guides with difficulty, season, and access — then explore each summit in 3D.',
    image: '',
  },
  {
    path: '/releases',
    title: 'Releases — PeakAtlas3D',
    description:
      'What’s new on PeakAtlas3D — product updates, atlas improvements, and site notes.',
    image: '',
  },
  {
    path: '/contact',
    title: 'Contact — PeakAtlas3D',
    description:
      'Send feedback, corrections, or ideas for PeakAtlas3D — trip-ready peak guides with 3D terrain.',
    image: '',
  },
  {
    path: '/peaks',
    title: 'All peaks — PeakAtlas3D',
    description:
      'Browse every summit in the PeakAtlas3D catalog — trip readiness, difficulty, season, and 3D terrain for each peak.',
    image: '',
    bodyHtml: peaksIndexBody(peaks, countrySummaries),
  },
]

// Root index keeps home meta + crawlable peak directory.
writeFileSync(
  indexPath,
  injectMeta(template, {
    title: staticPages[0].title,
    description: staticPages[0].description,
    path: '/',
    image: '',
    keepWebsiteJsonLd: true,
    bodyHtml: staticPages[0].bodyHtml,
  }),
)

for (const page of staticPages.slice(1)) {
  writeRoute(template, page.path, page)
}

for (const summary of countrySummaries) {
  const meta = countryMeta(summary)
  writeRoute(template, meta.path, {
    title: meta.title,
    description: meta.description,
    image: '',
    bodyHtml: countryCrawlableBody(summary, countrySummaries),
  })
}

for (const peak of peaks) {
  if (!peak?.id) continue
  const path = `/peak/${peak.id}`
  const url = `${siteUrl}${path}`
  writeRoute(template, path, {
    title: `${peak.name} Trip Guide & 3D Map · ${peakLocationLabel(peak)} | PeakAtlas3D`,
    description: peakDescription(peak),
    image: peakImage(peak),
    bodyHtml: peakCrawlableBody(peak, url, countryLandingHrefForPeak(peak)),
  })
}

console.log(
  `Prerendered meta HTML for ${staticPages.length} pages + ${countrySummaries.length} countries + ${peaks.length} peaks → ${siteUrl}`,
)
