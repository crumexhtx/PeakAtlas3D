import type { Map as MapboxMap } from 'mapbox-gl'

/**
 * True when a lng/lat is on the camera-facing side of the globe.
 * Mapbox `project()` still returns canvas coords for the far side, which
 * made fun-fact pointers attach to the wrong ocean.
 */
export function isOnFrontHemisphere(
  map: MapboxMap,
  lon: number,
  lat: number,
  /** Cosine threshold; 0 ≈ limb, higher = more toward screen center. */
  minDot = 0.12,
): boolean {
  const c = map.getCenter()
  const toRad = Math.PI / 180
  const φ1 = c.lat * toRad
  const λ1 = c.lng * toRad
  const φ2 = lat * toRad
  const λ2 = lon * toRad

  const x1 = Math.cos(φ1) * Math.cos(λ1)
  const y1 = Math.cos(φ1) * Math.sin(λ1)
  const z1 = Math.sin(φ1)

  const x2 = Math.cos(φ2) * Math.cos(λ2)
  const y2 = Math.cos(φ2) * Math.sin(λ2)
  const z2 = Math.sin(φ2)

  return x1 * x2 + y1 * y2 + z1 * z2 > minDot
}
