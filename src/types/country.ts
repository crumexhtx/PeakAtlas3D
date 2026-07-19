import type { Peak } from './peak'

export type CountrySummary = {
  /** Primary country label used for browse/filter (one flag on the globe). */
  name: string
  /** All peak.country labels rolled into this flag (e.g. Nepal + Nepal/China). */
  labels: string[]
  /** Geographic center-of-mass for the country marker. */
  lat: number
  lon: number
  peakCount: number
  highestPeak: Peak
  lowestPeak: Peak
  ranges: string[]
  avgElevationFt: number
}
