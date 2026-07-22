import type { PeakBrowseFilters, PeakIndex, UnitSystem } from '../types/peak'

const FT_PER_M = 3.280839895
const MI_PER_KM = 0.621371192

export function ftToM(ft: number): number {
  return ft / FT_PER_M
}

export function miToKm(mi: number): number {
  return mi / MI_PER_KM
}

export function formatElevation(ft: number, units: UnitSystem = 'imperial'): string {
  if (units === 'metric') {
    return `${Math.round(ftToM(ft)).toLocaleString('en-US')} m`
  }
  return `${ft.toLocaleString('en-US')} ft`
}

export function formatDistance(miles: number, units: UnitSystem = 'imperial'): string {
  if (units === 'metric') {
    return `${miToKm(miles).toFixed(1)} km`
  }
  return `${miles.toFixed(1)} miles`
}

export function formatCoordinates(lat: number, lon: number): string {
  const latHem = lat >= 0 ? 'N' : 'S'
  const lonHem = lon >= 0 ? 'E' : 'W'
  return `${Math.abs(lat).toFixed(4)}° ${latHem}, ${Math.abs(lon).toFixed(4)}° ${lonHem}`
}

/** Search mountain peaks only (name / alias / range / country). */
export function searchPeaks(peaks: PeakIndex[], query: string): PeakIndex[] {
  const q = query.trim().toLowerCase()
  if (!q) return []
  return peaks.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.range.toLowerCase().includes(q) ||
      p.country.toLowerCase().includes(q) ||
      (p.aliases?.some((a) => a.toLowerCase().includes(q)) ?? false),
  )
}

export function filterPeaks(peaks: PeakIndex[], browse: PeakBrowseFilters): PeakIndex[] {
  return peaks.filter((p) => {
    if (browse.country && p.country !== browse.country) return false
    if (browse.range && p.range !== browse.range) return false
    if (browse.minElevationFt > 0 && p.elevationFt < browse.minElevationFt) return false
    return true
  })
}

export function uniqueSorted(values: string[]): string[] {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b))
}
