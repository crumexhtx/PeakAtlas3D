import type { Peak } from './peak'

export type CountrySummary = {
  /** Exact country label from peak data (browse/filter key). */
  name: string
  lat: number
  lon: number
  peakCount: number
  highestPeak: Peak
  lowestPeak: Peak
  ranges: string[]
  avgElevationFt: number
}
