import type { Peak } from '../types/peak'

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

function peakImage(peak: Peak): string | undefined {
  return peak.photos?.[0]?.url || peak.photo?.url
}

export function applyDocumentMeta(input: {
  title: string
  description: string
  image?: string
  path?: string
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
  }

  if (typeof window !== 'undefined' && input.path != null) {
    const url = new URL(input.path, window.location.origin).toString()
    upsertMeta('property', 'og:url', url)
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

export function metaForPeak(peak: Peak, country?: string | null) {
  const elevation = `${peak.elevationFt.toLocaleString('en-US')} ft`
  const description =
    peak.description?.trim() ||
    `${peak.name} in the ${peak.range}, ${peak.country} — ${elevation}.`
  const path = country
    ? `/peak/${peak.id}?country=${encodeURIComponent(country)}`
    : `/peak/${peak.id}`

  return {
    title: `${peak.name} · PeakAtlas3D`,
    description,
    image: peakImage(peak),
    path,
  }
}
