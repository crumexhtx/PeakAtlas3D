import type { Peak } from '../types/peak'

/** Production origin for canonical / OG / JSON-LD URLs. */
export const SITE_ORIGIN = 'https://peakatlas3d.com'

const DEFAULT_TITLE = 'PeakAtlas3D — World Peak Atlas'
const DEFAULT_DESCRIPTION =
  "Explore the world's mountain peaks on a Mapbox globe, then open a 3D terrain profile for each summit."

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

function absoluteUrl(path: string) {
  const origin =
    typeof window !== 'undefined' ? window.location.origin : 'https://peakatlas3d.com'
  return new URL(path, origin).toString()
}

function peakImage(peak: Peak): string | undefined {
  return peak.photos?.[0]?.url || peak.photo?.url
}

function removeMeta(attr: 'name' | 'property', key: string) {
  document.head.querySelector(`meta[${attr}="${key}"]`)?.remove()
}

export function applyDocumentMeta(input: {
  title: string
  description: string
  image?: string | null
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
    const url = absoluteUrl(input.path)
    upsertMeta('property', 'og:url', url)
    upsertCanonical(url)
  }
}

export function metaForAtlas(country: string | null) {
  if (country) {
    return {
      title: `${country} peaks · PeakAtlas3D`,
      description: `Browse mountain peaks in ${country} on the PeakAtlas3D globe.`,
      path: `/?country=${encodeURIComponent(country)}`,
    }
  }
  return {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    path: '/',
  }
}

export function metaForPeak(peak: Peak, _country?: string | null) {
  const elevation = `${peak.elevationFt.toLocaleString('en-US')} ft`
  const description =
    peak.description?.trim() ||
    `${peak.name} in the ${peak.range}, ${peak.country} — ${elevation}.`
  // Canonicalize without ?country= so Google doesn't treat nav variants as duplicates.
  const path = `/peak/${peak.id}`

  return {
    title: `${peak.name} 3D Interactive Map & Base Town Lodging | PeakAtlas3D`,
    description,
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
