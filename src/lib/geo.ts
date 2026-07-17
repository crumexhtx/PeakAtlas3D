import type { Peak } from '../types/peak'

export const EARTH_RADIUS = 2

/** Convert geographic lat/lon (degrees) to a point on a sphere. */
export function latLonToVector3(
  lat: number,
  lon: number,
  radius = EARTH_RADIUS,
): [number, number, number] {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lon + 180) * (Math.PI / 180)
  const x = -(radius * Math.sin(phi) * Math.cos(theta))
  const z = radius * Math.sin(phi) * Math.sin(theta)
  const y = radius * Math.cos(phi)
  return [x, y, z]
}

/** Camera position slightly outside the peak, looking toward Earth center. */
export function cameraFocusForPeak(
  lat: number,
  lon: number,
  distance = EARTH_RADIUS * 1.55,
): {
  position: [number, number, number]
  target: [number, number, number]
} {
  const position = latLonToVector3(lat, lon, distance)
  return { position, target: [0, 0, 0] }
}

export function formatElevation(ft: number): string {
  return `${ft.toLocaleString('en-US')} ft`
}

export function searchPeaks(peaks: Peak[], query: string): Peak[] {
  const q = query.trim().toLowerCase()
  if (!q) return []
  return peaks.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.range.toLowerCase().includes(q) ||
      p.country.toLowerCase().includes(q) ||
      p.nearestTown.name.toLowerCase().includes(q) ||
      p.nearestTown.region.toLowerCase().includes(q),
  )
}
