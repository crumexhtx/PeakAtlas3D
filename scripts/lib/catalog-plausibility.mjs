/**
 * Catalog plausibility helpers shared by validate-catalog.mjs and unit tests.
 */
export function haversineMiles(lat1, lon1, lat2, lon2) {
  const toRad = (d) => (d * Math.PI) / 180
  const r = 3958.7613
  const φ1 = toRad(lat1)
  const φ2 = toRad(lat2)
  const Δφ = toRad(lat2 - lat1)
  const Δλ = toRad(lon2 - lon1)
  const a =
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2
  return 2 * r * Math.asin(Math.min(1, Math.sqrt(a)))
}

/** Landmark peaks where tiny clean prominence is legitimate. */
export const LOW_PROMINENCE_ALLOWLIST = new Set([
  'elcapitan', // Yosemite wall — Peakbagger clean prom ~9 ft
  'halti', // Finnish high point is a slope cairn — prom ~0
])

export function checkProminencePlausible(peak) {
  if (typeof peak.prominenceFt !== 'number' || !Number.isFinite(peak.prominenceFt)) {
    return 'prominenceFt must be a finite number'
  }
  if (peak.prominenceFt < 0) return 'prominenceFt must be >= 0'
  if (peak.prominenceFt > peak.elevationFt + 1) {
    return `prominenceFt (${peak.prominenceFt}) exceeds elevationFt (${peak.elevationFt})`
  }
  if (
    peak.prominenceFt > 0 &&
    peak.prominenceFt < 50 &&
    peak.elevationFt >= 1000 &&
    !LOW_PROMINENCE_ALLOWLIST.has(peak.id)
  ) {
    return `prominenceFt (${peak.prominenceFt}) looks like a dropped digit — allowlist if intentional`
  }
  return null
}

export function checkTownDistancePlausible(peak, town) {
  if (!town || typeof town.lat !== 'number' || typeof town.lon !== 'number') {
    return null
  }
  if (typeof town.distanceMiles !== 'number') return null
  const actual = haversineMiles(peak.lat, peak.lon, town.lat, town.lon)
  const claimed = town.distanceMiles
  // Road miles may exceed crow-flies; only fail impossible underestimates.
  if (claimed + 15 < actual * 0.55) {
    return `distanceMiles (${claimed}) is far below straight-line distance (~${actual.toFixed(1)} mi)`
  }
  return null
}
