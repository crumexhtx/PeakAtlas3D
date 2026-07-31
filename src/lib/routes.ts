/** Build home URL, optionally restoring a drilled-in country. */
export function atlasHref(country?: string | null): string {
  if (!country) return '/'
  return `/?country=${encodeURIComponent(country)}`
}

/** Peak detail URL, preserving country context for back navigation. */
export function peakHref(peakId: string, country?: string | null): string {
  if (!country) return `/peak/${peakId}`
  return `/peak/${peakId}?country=${encodeURIComponent(country)}`
}

export { countryHref } from './countryPages'
export { comparisonHref } from './comparisons'

/** Camera handoff from atlas → peak page for a continuous zoom-in. */
export type PeakEntryState = {
  fromCountry?: string | null
  entryZoom?: number
  entryPitch?: number
}

export function peakEntryState(country?: string | null): PeakEntryState {
  if (country) {
    return {
      fromCountry: country,
      // Matches typical country fitBounds framing on the atlas map.
      entryZoom: 6.35,
      entryPitch: 12,
    }
  }
  return {
    fromCountry: null,
    entryZoom: 5.8,
    entryPitch: 18,
  }
}
