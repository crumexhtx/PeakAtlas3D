import type { PeakIndex } from '../types/peak'

const EARTH_RADIUS_MI = 3958.8

/** Great-circle distance in miles (spherical Earth). */
export function haversineMiles(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  return 2 * EARTH_RADIUS_MI * Math.asin(Math.min(1, Math.sqrt(a)))
}

export type NearbyPeakLink = PeakIndex & {
  distanceMiles: number
}

/**
 * 3–5 nearby peaks for multi-summit planning + internal linking.
 * Prefers same range, then same country, then global nearest.
 */
export function nearbyPeaksFor(
  peak: Pick<PeakIndex, 'id' | 'lat' | 'lon' | 'range' | 'country'>,
  catalog: PeakIndex[],
  limit = 5,
): NearbyPeakLink[] {
  const scored = catalog
    .filter((p) => p.id !== peak.id)
    .map((p) => ({
      ...p,
      distanceMiles: haversineMiles(peak.lat, peak.lon, p.lat, p.lon),
      sameRange: p.range === peak.range,
      sameCountry: p.country === peak.country,
    }))

  scored.sort((a, b) => {
    if (a.sameRange !== b.sameRange) return a.sameRange ? -1 : 1
    if (a.sameCountry !== b.sameCountry) return a.sameCountry ? -1 : 1
    return a.distanceMiles - b.distanceMiles
  })

  return scored.slice(0, Math.max(3, Math.min(limit, 5))).map((p) => ({
    id: p.id,
    name: p.name,
    lat: p.lat,
    lon: p.lon,
    elevationFt: p.elevationFt,
    prominenceFt: p.prominenceFt,
    range: p.range,
    country: p.country,
    aliases: p.aliases,
    difficulty: p.difficulty,
    bestSeason: p.bestSeason,
    distanceMiles: p.distanceMiles,
  }))
}
