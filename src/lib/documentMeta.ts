import type { Peak } from '../types/peak'
import {
  peakTrailRoutesForPeak,
  trailSourcesForPeak,
} from '../data/peakTrailRoutes'
import { peakLocationLabel } from './peakLocation'

/** Production origin for canonical / OG / JSON-LD URLs (never include query strings). */
export const SITE_ORIGIN = 'https://peakatlas3d.com'

const DEFAULT_TITLE = 'PeakAtlas3D — World Peak Atlas'
const DEFAULT_DESCRIPTION =
  "Explore the world's mountain peaks on a Mapbox globe, then open a 3D terrain profile for each summit."

const META_DESCRIPTION_MAX = 300

function upsertMeta(
  attr: 'name' | 'property',
  key: string,
  content: string,
) {
  const selector = `meta[${attr}="${key}"]`
  let el = document.head.querySelector(selector) as HTMLMetaElement | null
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function upsertCanonical(href: string) {
  let el = document.head.querySelector(
    'link[rel="canonical"]',
  ) as HTMLLinkElement | null
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', 'canonical')
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

/**
 * Self-referencing canonical: fixed production origin + pathname only.
 * Strips query strings (?country=, ?count=…) and hashes so Google does not
 * index URL variants of the same peak / page.
 */
export function toCanonicalHref(pathOrUrl: string): string {
  try {
    const raw = pathOrUrl.trim() || '/'
    const base =
      typeof window !== 'undefined' ? window.location.origin : SITE_ORIGIN
    const parsed = new URL(raw, base)
    const pathname = parsed.pathname.replace(/\/{2,}/g, '/') || '/'
    // Normalize trailing slash: keep "/" only for home; peaks stay /peak/:id
    const normalized =
      pathname !== '/' && pathname.endsWith('/')
        ? pathname.slice(0, -1)
        : pathname
    return new URL(normalized, SITE_ORIGIN).toString()
  } catch {
    return SITE_ORIGIN + '/'
  }
}

function peakImage(peak: Peak): string | undefined {
  return peak.photos?.[0]?.url || peak.photo?.url
}

function removeMeta(attr: 'name' | 'property', key: string) {
  document.head.querySelector(`meta[${attr}="${key}"]`)?.remove()
}

function clipDescription(text: string) {
  if (text.length <= META_DESCRIPTION_MAX) return text
  return `${text.slice(0, META_DESCRIPTION_MAX - 1).trimEnd()}…`
}

/** Peak meta description including popular trails + reference sources when curated. */
export function peakSeoDescription(peak: Peak): string {
  const location = peakLocationLabel(peak)
  const base =
    peak.whyNotable?.trim() ||
    peak.description?.trim() ||
    `${peak.name} in the ${peak.range}, ${location} — ${peak.elevationFt.toLocaleString('en-US')} ft.`

  const routes = peakTrailRoutesForPeak(peak.id)
  const sources = trailSourcesForPeak(peak.id)
  const catalogTrails = (peak.trails ?? [])
    .map((t) => t.name)
    .filter(Boolean)
    .slice(0, 2)

  const trailNames = routes.length
    ? routes.map((r) => r.name)
    : catalogTrails

  const parts = [base]
  if (!base.toLowerCase().includes(location.toLowerCase())) {
    parts.push(`Location: ${location}.`)
  }
  if (trailNames.length) {
    parts.push(`Popular trails: ${trailNames.join(', ')}.`)
  }
  if (sources.length) {
    parts.push(`References: ${sources.map((s) => s.label).join(', ')}.`)
  }

  return clipDescription(parts.join(' '))
}

export function applyDocumentMeta(input: {
  title: string
  description: string
  image?: string | null
  /** Path or URL; query/hash are stripped for canonical + og:url. */
  path?: string
  /** e.g. "noindex, nofollow" for soft-404 peak URLs */
  robots?: string | null
}) {
  document.title = input.title
  upsertMeta('name', 'description', input.description)
  upsertMeta('property', 'og:type', 'website')
  upsertMeta('property', 'og:site_name', 'PeakAtlas3D')
  upsertMeta('property', 'og:title', input.title)
  upsertMeta('property', 'og:description', input.description)
  upsertMeta('name', 'twitter:card', input.image ? 'summary_large_image' : 'summary')
  upsertMeta('name', 'twitter:title', input.title)
  upsertMeta('name', 'twitter:description', input.description)

  if (input.image) {
    upsertMeta('property', 'og:image', input.image)
    upsertMeta('name', 'twitter:image', input.image)
  } else {
    // Clear stale peak images when navigating to pages without one.
    removeMeta('property', 'og:image')
    removeMeta('name', 'twitter:image')
  }

  if (input.robots) {
    upsertMeta('name', 'robots', input.robots)
  } else {
    removeMeta('name', 'robots')
  }

  if (input.path != null) {
    const url = toCanonicalHref(input.path)
    upsertMeta('property', 'og:url', url)
    upsertCanonical(url)
  }
}

export function metaForAtlas(country: string | null) {
  if (country) {
    return {
      title: `${country} peaks · PeakAtlas3D`,
      description: `Browse mountain peaks in ${country} on the PeakAtlas3D globe.`,
      // Pathname-only canonical → https://peakatlas3d.com/ (query stripped).
      // Keep ?country= in the live URL for UX; do not put it in canonical.
      path: '/',
    }
  }
  return {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    path: '/',
  }
}

export function metaForPeak(peak: Peak, _country?: string | null) {
  // Prefer curated seoMetaDescription when present; otherwise build trails + refs.
  // Always /peak/:id — never ?country= or other query variants.
  const path = `/peak/${peak.id}`
  const location = peakLocationLabel(peak)
  const description =
    peak.seoMetaDescription?.trim() || peakSeoDescription(peak)
  const withLocation =
    description.toLowerCase().includes(location.toLowerCase())
      ? description
      : clipDescription(`${description} Location: ${location}.`)

  return {
    title: `${peak.name} 3D Map & Topography · ${location} | PeakAtlas3D`,
    description: withLocation,
    image: peakImage(peak),
    path,
  }
}

/** Client soft-404 for unknown /peak/:id (SPA still returns HTTP 200). */
export function metaForMissingPeak(peakId: string) {
  return {
    title: 'Peak not found · PeakAtlas3D',
    description:
      'That summit is not in the PeakAtlas3D catalog. Browse the globe for available peaks.',
    image: null as null,
    path: `/peak/${encodeURIComponent(peakId)}`,
    robots: 'noindex, nofollow',
  }
}
