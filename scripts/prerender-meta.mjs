/**
 * After Vite build, write route HTML shells with correct title / description / OG
 * tags so crawlers and link previews see peak-specific meta without waiting on JS.
 *
 * Run: node scripts/prerender-meta.mjs
 * Env: SITE_URL=https://peakatlas3d.com (optional)
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const distDir = join(root, 'dist')
const peaksPath = join(root, 'src', 'data', 'peaks.json')
const siteUrl = (process.env.SITE_URL || 'https://peakatlas3d.com').replace(
  /\/$/,
  '',
)

const DEFAULT_DESCRIPTION =
  "Explore the world's mountain peaks on a Mapbox globe, then open a 3D terrain profile for each summit."

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

function peakNoscriptBody(peak, url) {
  const location = peakLocationLabel(peak)
  const region = peakRegion(peak)
  const heading = peak.name
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

  const jsonLd = {
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

  return `
    <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
    <noscript id="seo-noscript">
      <main style="font-family: system-ui, sans-serif; max-width: 40rem; margin: 2rem auto; padding: 0 1rem;">
        <article itemscope itemtype="https://schema.org/Mountain">
          <header>
            <p>${escapeHtml(location)}</p>
            <h1 itemprop="name">${escapeHtml(heading)}</h1>
            <p>3D Map &amp; Topography</p>
            <p>${escapeHtml(peak.range)} · Interactive 3D globe view</p>
          </header>
          <section aria-label="Peak stats">
            <h2>Peak stats</h2>
            <dl>
              <div><dt>Location</dt><dd>${escapeHtml(location)}</dd></div>
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
            <p>Explore ${escapeHtml(peak.name)} on PeakAtlas3D’s interactive 3D topographic map — satellite terrain and summit framing in the ${escapeHtml(peak.range)}, ${escapeHtml(location)}.</p>
          </section>
          ${nearbyList}
          ${trailList}
          <p><a href="${escapeAttr(url)}">${escapeHtml(url)}</a></p>
        </article>
      </main>
    </noscript>`
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

function injectMeta(html, { title, description, path, image, noscriptBody }) {
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

  const fallback =
    noscriptBody ||
    `
    <noscript id="seo-noscript">
      <main style="font-family: system-ui, sans-serif; max-width: 40rem; margin: 2rem auto; padding: 0 1rem;">
        <h1>${escapeHtml(title)}</h1>
        <p>${escapeHtml(description)}</p>
        <p><a href="${escapeAttr(url)}">${escapeHtml(url)}</a></p>
      </main>
    </noscript>`

  if (/id=["']seo-noscript["']/.test(out)) {
    out = out.replace(
      /<noscript\b[^>]*\bid=["']seo-noscript["'][^>]*>[\s\S]*?<\/noscript>/i,
      fallback.trim(),
    )
  } else {
    out = out.replace(
      /<div id="root"><\/div>/i,
      `<div id="root"></div>\n${fallback}`,
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

const staticPages = [
  {
    path: '/',
    title: 'PeakAtlas3D — World Peak Atlas',
    description: DEFAULT_DESCRIPTION,
    image: '',
  },
  {
    path: '/about',
    title: 'About — PeakAtlas3D',
    description:
      'Why PeakAtlas3D exists: celebrating the world’s mountain peaks and sharing the places that surround them.',
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
      'Send feedback, corrections, or ideas for PeakAtlas3D — the world peak atlas.',
    image: '',
  },
]

// Root index keeps home meta (already mostly correct); refresh OG url/canonical.
writeFileSync(
  indexPath,
  injectMeta(template, {
    title: staticPages[0].title,
    description: staticPages[0].description,
    path: '/',
    image: '',
  }),
)

for (const page of staticPages.slice(1)) {
  writeRoute(template, page.path, page)
}

for (const peak of peaks) {
  if (!peak?.id) continue
  const path = `/peak/${peak.id}`
  const url = `${siteUrl}${path}`
  writeRoute(template, path, {
    title: `${peak.name} 3D Map & Topography · ${peakLocationLabel(peak)} | PeakAtlas3D`,
    description: peakDescription(peak),
    image: peakImage(peak),
    noscriptBody: peakNoscriptBody(peak, url),
  })
}

console.log(
  `Prerendered meta HTML for ${staticPages.length} pages + ${peaks.length} peaks → ${siteUrl}`,
)
