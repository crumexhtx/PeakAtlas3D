import type { PeakIndex } from '../types/peak'

const COUNTRY_LEVEL_REGIONS = new Set([
  'usa',
  'united states',
  'united states of america',
  'u.s.',
  'u.s.a.',
])

/**
 * Subdivision / state / prefecture from nearest town (or first nearby place).
 * Skips country-level placeholders like "USA".
 */
export function peakRegion(
  peak: Pick<PeakIndex, 'nearestTown'> & {
    nearbyPlaces?: Array<{ region?: string }>
  },
): string | null {
  const candidates = [
    peak.nearestTown?.region,
    peak.nearbyPlaces?.[0]?.region,
  ]

  for (const raw of candidates) {
    const region = raw?.trim()
    if (!region) continue
    if (COUNTRY_LEVEL_REGIONS.has(region.toLowerCase())) continue
    return region
  }
  return null
}

/**
 * Human location for dossier + SEO, e.g. "Colorado, USA" or "Nepal".
 */
export function peakLocationLabel(
  peak: Pick<PeakIndex, 'country' | 'nearestTown'> & {
    nearbyPlaces?: Array<{ region?: string }>
  },
): string {
  const region = peakRegion(peak)
  const country = peak.country.trim()
  if (!region) return country

  const regionLower = region.toLowerCase()
  const countryLower = country.toLowerCase()
  if (regionLower === countryLower) return country
  if (countryLower.includes(regionLower)) return country

  return `${region}, ${country}`
}
