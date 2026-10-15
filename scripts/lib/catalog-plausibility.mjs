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

const KM_PER_MILE = 1.609344

export function haversineKm(lat1, lon1, lat2, lon2) {
  return haversineMiles(lat1, lon1, lat2, lon2) * KM_PER_MILE
}

/** Sorted `idA|idB` pairs that are real neighbors (warn-band only). */
export const NEIGHBOR_ALLOWLIST = new Set([
  'grays|torreys',
  'crestone|crestoneneedle',
  'adamsnh|madison',
  'northpalisade|sill',
  'russell|whitney',
])

/** Outdated admin names that should not appear on summit/town regions. */
export const STALE_ADMIN_NAMES = {
  'province 1': 'Koshi Province',
}

const GENERIC_NAME_TOKENS = new Set([
  'mt',
  'mount',
  'mountain',
  'peak',
  'pico',
  'cerro',
  'nevado',
  'volcan',
  'the',
  'de',
  'del',
  'di',
  'du',
  'la',
  'el',
  'massif',
])

export function normalizePeakName(value) {
  return String(value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

const ROMAN_OR_SHORT = /^(i{1,3}|iv|vi{0,3}|ix|x|ii|iii)$/

export function nameTokens(value) {
  return normalizePeakName(value)
    .split(/\s+/)
    .filter((t) => t && !GENERIC_NAME_TOKENS.has(t))
    .filter((t) => t.length >= 3 || ROMAN_OR_SHORT.test(t))
}

function pairKey(idA, idB) {
  return [idA, idB].sort().join('|')
}

function compactName(value) {
  return normalizePeakName(value).replace(/ /g, '')
}

export function slugSharesNameToken(peak) {
  const slug = String(peak.id ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^a-z0-9]+/g, '')
  if (!slug) return false
  if (slug === compactName(peak.name)) return true
  if ((peak.aliases ?? []).some((a) => slug === compactName(a))) return true
  const tokens = [
    ...nameTokens(peak.name),
    ...(Array.isArray(peak.aliases) ? peak.aliases.flatMap(nameTokens) : []),
  ]
  return tokens.some((t) => slug.includes(t) || t.includes(slug))
}

function regionFields(peak) {
  const out = []
  if (peak.adminRegion) out.push(['adminRegion', peak.adminRegion])
  if (peak.nearestTown?.region) {
    out.push(['nearestTown.region', peak.nearestTown.region])
  }
  if (Array.isArray(peak.nearbyPlaces)) {
    peak.nearbyPlaces.forEach((place, i) => {
      if (place?.region) out.push([`nearbyPlaces[${i}].region`, place.region])
    })
  }
  return out
}

/**
 * Extra catalog integrity checks. Phase 1 reports these as warnings
 * (`--strict` promotes them to failures after the catalog is cleaned).
 */
export function collectCatalogIssues(peaks) {
  const warnings = []
  const errors = []

  const byNormName = new Map()

  for (const peak of peaks) {
    const norm = nameTokens(peak.name).join(' ')
    if (!norm) continue
    const prev = byNormName.get(norm)
    if (prev) {
      const km = haversineKm(prev.lat, prev.lon, peak.lat, peak.lon)
      const line = `name-duplicate: ${prev.id} ↔ ${peak.id} (normalized "${norm}", ${km.toFixed(1)} km)`
      if (km < 5) errors.push(line)
      else warnings.push(
        `name-homonym: ${prev.id} ↔ ${peak.id} (normalized "${norm}", ${km.toFixed(0)} km)`,
      )
    } else {
      byNormName.set(norm, peak)
    }
  }

  for (const peak of peaks) {
    for (const alias of peak.aliases ?? []) {
      const norm = nameTokens(alias).join(' ')
      if (!norm) continue
      const owner = byNormName.get(norm)
      if (owner && owner.id !== peak.id) {
        const km = haversineKm(owner.lat, owner.lon, peak.lat, peak.lon)
        const line = `alias-name-collision: ${peak.id} alias "${alias}" equals name of ${owner.id} (${km.toFixed(0)} km)`
        if (km < 250) errors.push(line)
        else warnings.push(
          `alias-homonym: ${peak.id} alias "${alias}" equals name of ${owner.id} (${km.toFixed(0)} km)`,
        )
      }
    }
  }

  for (let i = 0; i < peaks.length; i++) {
    const a = peaks[i]
    for (let j = i + 1; j < peaks.length; j++) {
      const b = peaks[j]
      const km = haversineKm(a.lat, a.lon, b.lat, b.lon)
      if (!Number.isFinite(km)) continue
      const key = pairKey(a.id, b.id)
      if (km < 0.2) {
        errors.push(
          `proximity-duplicate: ${a.id} ↔ ${b.id} (${km.toFixed(3)} km)`,
        )
      } else if (km <= 1.5 && !NEIGHBOR_ALLOWLIST.has(key)) {
        warnings.push(
          `proximity-neighbor: ${a.id} ↔ ${b.id} (${km.toFixed(2)} km) — allow-list if legitimate`,
        )
      }
    }
  }

  for (const peak of peaks) {
    if (!slugSharesNameToken(peak)) {
      warnings.push(
        `slug-sanity: ${peak.id} shares no token with name "${peak.name}" or aliases`,
      )
    }
    for (const [field, value] of regionFields(peak)) {
      const hint = STALE_ADMIN_NAMES[String(value).trim().toLowerCase()]
      if (hint) {
        errors.push(
          `stale-admin: ${peak.id} ${field}="${value}" (use "${hint}")`,
        )
      }
    }
    const townRegion = peak.nearestTown?.region?.trim()
    const admin = peak.adminRegion?.trim()
    if (admin && townRegion && admin.toLowerCase() !== townRegion.toLowerCase()) {
      warnings.push(
        `admin-vs-town: ${peak.id} adminRegion="${admin}" vs nearestTown.region="${townRegion}"`,
      )
    }
  }

  return { warnings, errors }
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
