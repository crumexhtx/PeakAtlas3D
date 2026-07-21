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

function peakImage(peak) {
  return peak.photos?.[0]?.url || peak.photo?.url || ''
}

function peakDescription(peak) {
  const base =
    peak.whyNotable?.trim() ||
    peak.description?.trim() ||
    `${peak.name} in the ${peak.range}, ${peak.country}.`

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
  ])

  const parts = [base]
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

function injectMeta(html, { title, description, path, image }) {
  const url = `${siteUrl}${path}`
  let out = html

  out = out.replace(
    /<title>[^<]*<\/title>/i,
    `<title>${escapeHtml(title)}</title>`,
  )

  const replaceMeta = (attr, key, content) => {
    const re = new RegExp(
      `<meta\\s+${attr}=["']${key}["']\\s+content=["'][^"']*["']\\s*/?>`,
      'i',
    )
    const tag = `<meta ${attr}="${key}" content="${escapeAttr(content)}" />`
    if (re.test(out)) out = out.replace(re, tag)
    else out = out.replace(/<\/head>/i, `    ${tag}\n  </head>`)
  }

  replaceMeta('name', 'description', description)
  replaceMeta('property', 'og:type', 'website')
  replaceMeta('property', 'og:site_name', 'PeakAtlas3D')
  replaceMeta('property', 'og:title', title)
  replaceMeta('property', 'og:description', description)
  replaceMeta('property', 'og:url', url)
  replaceMeta('name', 'twitter:title', title)
  replaceMeta('name', 'twitter:description', description)
  replaceMeta(
    'name',
    'twitter:card',
    image ? 'summary_large_image' : 'summary',
  )

  if (image) {
    replaceMeta('property', 'og:image', image)
    replaceMeta('name', 'twitter:image', image)
  }

  // Canonical helps Search Console / social scrapers.
  if (!/<link\s+rel=["']canonical["']/i.test(out)) {
    out = out.replace(
      /<\/head>/i,
      `    <link rel="canonical" href="${escapeAttr(url)}" />\n  </head>`,
    )
  } else {
    out = out.replace(
      /<link\s+rel=["']canonical["']\s+href=["'][^"']*["']\s*\/?>/i,
      `<link rel="canonical" href="${escapeAttr(url)}" />`,
    )
  }

  const fallback = `
    <noscript>
      <main style="font-family: system-ui, sans-serif; max-width: 40rem; margin: 2rem auto; padding: 0 1rem;">
        <h1>${escapeHtml(title)}</h1>
        <p>${escapeHtml(description)}</p>
        <p><a href="${escapeAttr(url)}">${escapeHtml(url)}</a></p>
      </main>
    </noscript>`

  if (!out.includes('id="seo-noscript"')) {
    out = out.replace(
      /<div id="root"><\/div>/i,
      `<div id="root"></div>\n${fallback.replace('<noscript>', '<noscript id="seo-noscript">')}`,
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
  writeRoute(template, `/peak/${peak.id}`, {
    title: `${peak.name} 3D Interactive Map & Base Town Lodging | PeakAtlas3D`,
    description: peakDescription(peak),
    image: peakImage(peak),
  })
}

console.log(
  `Prerendered meta HTML for ${staticPages.length} pages + ${peaks.length} peaks → ${siteUrl}`,
)
