import type { Peak } from '../types/peak'
import type { CountrySummary } from '../types/country'

/** Map PeakAtlas country labels to ISO 3166-1 alpha-2 codes for flag CDN. */
const COUNTRY_ISO: Record<string, string> = {
  Antarctica: 'aq',
  Argentina: 'ar',
  Australia: 'au',
  Austria: 'at',
  Bolivia: 'bo',
  Bulgaria: 'bg',
  Canada: 'ca',
  Chile: 'cl',
  China: 'cn',
  Ecuador: 'ec',
  Ethiopia: 'et',
  'Finland/Norway': 'fi',
  France: 'fr',
  Georgia: 'ge',
  Greece: 'gr',
  India: 'in',
  Iran: 'ir',
  Italy: 'it',
  Japan: 'jp',
  Kenya: 'ke',
  Mexico: 'mx',
  Morocco: 'ma',
  Nepal: 'np',
  'Nepal/China': 'np',
  'Nepal/India': 'np',
  'New Zealand': 'nz',
  Norway: 'no',
  Pakistan: 'pk',
  'Pakistan/China': 'pk',
  Peru: 'pe',
  Russia: 'ru',
  Slovenia: 'si',
  'South Africa': 'za',
  'South Korea': 'kr',
  Spain: 'es',
  Sweden: 'se',
  Switzerland: 'ch',
  Tanzania: 'tz',
  Turkey: 'tr',
  USA: 'us',
}

/**
 * Approximate geographic centroids (lat, lon) for globe flag placement.
 * Prefer true country center-of-mass over the average of atlas peaks.
 */
const COUNTRY_CENTROID: Record<string, { lat: number; lon: number }> = {
  aq: { lat: -82.0, lon: 0.0 },
  ar: { lat: -38.4, lon: -63.6 },
  au: { lat: -25.3, lon: 133.8 },
  at: { lat: 47.5, lon: 14.6 },
  bo: { lat: -16.3, lon: -63.6 },
  bg: { lat: 42.7, lon: 25.5 },
  ca: { lat: 56.1, lon: -106.3 },
  cl: { lat: -35.7, lon: -71.5 },
  cn: { lat: 35.9, lon: 104.2 },
  ec: { lat: -1.8, lon: -78.2 },
  et: { lat: 9.1, lon: 40.5 },
  fi: { lat: 64.0, lon: 26.0 },
  fr: { lat: 46.2, lon: 2.2 },
  ge: { lat: 42.3, lon: 43.4 },
  gr: { lat: 39.1, lon: 21.8 },
  in: { lat: 22.4, lon: 79.0 },
  ir: { lat: 32.4, lon: 53.7 },
  it: { lat: 41.9, lon: 12.6 },
  jp: { lat: 36.2, lon: 138.3 },
  ke: { lat: 0.0, lon: 37.9 },
  mx: { lat: 23.6, lon: -102.6 },
  ma: { lat: 31.8, lon: -7.1 },
  np: { lat: 28.4, lon: 84.1 },
  nz: { lat: -41.5, lon: 172.8 },
  no: { lat: 60.5, lon: 8.5 },
  pk: { lat: 30.4, lon: 69.3 },
  pe: { lat: -9.2, lon: -75.0 },
  ru: { lat: 61.5, lon: 105.3 },
  si: { lat: 46.2, lon: 14.8 },
  za: { lat: -30.6, lon: 22.9 },
  kr: { lat: 36.5, lon: 127.9 },
  es: { lat: 40.0, lon: -3.7 },
  se: { lat: 62.2, lon: 17.5 },
  ch: { lat: 46.8, lon: 8.2 },
  tz: { lat: -6.4, lon: 34.9 },
  tr: { lat: 39.0, lon: 35.2 },
  us: { lat: 39.8, lon: -98.5 },
}

/** Prefer a clean primary label when merging border-shared peaks. */
const PRIMARY_LABEL: Record<string, string> = {
  np: 'Nepal',
  pk: 'Pakistan',
  fi: 'Finland/Norway',
  us: 'USA',
}

export function countryToIso(country: string): string | null {
  return COUNTRY_ISO[country] ?? null
}

export function flagUrl(country: string, size: 20 | 40 | 80 = 40): string | null {
  const iso = countryToIso(country)
  if (!iso) return null
  return `https://flagcdn.com/w${size}/${iso}.png`
}

function sphericalMean(peaks: Peak[]): { lat: number; lon: number } {
  let x = 0
  let y = 0
  let z = 0
  for (const peak of peaks) {
    const lat = (peak.lat * Math.PI) / 180
    const lon = (peak.lon * Math.PI) / 180
    x += Math.cos(lat) * Math.cos(lon)
    y += Math.cos(lat) * Math.sin(lon)
    z += Math.sin(lat)
  }
  const n = peaks.length || 1
  x /= n
  y /= n
  z /= n
  const hyp = Math.hypot(x, y)
  return {
    lat: (Math.atan2(z, hyp) * 180) / Math.PI,
    lon: (Math.atan2(y, x) * 180) / Math.PI,
  }
}

function pickPrimaryLabel(labels: string[], iso: string | null): string {
  if (iso && PRIMARY_LABEL[iso] && labels.includes(PRIMARY_LABEL[iso])) {
    return PRIMARY_LABEL[iso]
  }
  // Prefer labels without a slash (single-country names).
  const clean = labels.filter((l) => !l.includes('/'))
  if (clean.length) {
    return [...clean].sort((a, b) => a.localeCompare(b))[0]!
  }
  return [...labels].sort((a, b) => a.localeCompare(b))[0]!
}

/**
 * One atlas entry per country (ISO), for a single world-globe flag
 * placed at the country’s geographic center of mass.
 */
export function buildCountrySummaries(peaks: Peak[]): CountrySummary[] {
  const byIso = new Map<string, Peak[]>()
  const unknown: Peak[] = []

  for (const peak of peaks) {
    const iso = countryToIso(peak.country)
    if (!iso) {
      unknown.push(peak)
      continue
    }
    const list = byIso.get(iso)
    if (list) list.push(peak)
    else byIso.set(iso, [peak])
  }

  const summaries: CountrySummary[] = []

  for (const [iso, countryPeaks] of byIso) {
    const labels = [...new Set(countryPeaks.map((p) => p.country))].sort((a, b) =>
      a.localeCompare(b),
    )
    const name = pickPrimaryLabel(labels, iso)
    const centroid = COUNTRY_CENTROID[iso] ?? sphericalMean(countryPeaks)

    let elevSum = 0
    let highest = countryPeaks[0]!
    let lowest = countryPeaks[0]!
    const ranges = new Set<string>()

    for (const peak of countryPeaks) {
      elevSum += peak.elevationFt
      ranges.add(peak.range)
      if (peak.elevationFt > highest.elevationFt) highest = peak
      if (peak.elevationFt < lowest.elevationFt) lowest = peak
    }

    summaries.push({
      name,
      labels,
      lat: centroid.lat,
      lon: centroid.lon,
      peakCount: countryPeaks.length,
      highestPeak: highest,
      lowestPeak: lowest,
      ranges: [...ranges].sort((a, b) => a.localeCompare(b)),
      avgElevationFt: elevSum / countryPeaks.length,
    })
  }

  // Rare fallback: labels without an ISO still get their own marker.
  for (const peak of unknown) {
    summaries.push({
      name: peak.country,
      labels: [peak.country],
      lat: peak.lat,
      lon: peak.lon,
      peakCount: 1,
      highestPeak: peak,
      lowestPeak: peak,
      ranges: [peak.range],
      avgElevationFt: peak.elevationFt,
    })
  }

  return summaries.sort((a, b) => a.name.localeCompare(b.name))
}

/** Resolve which peak.country labels belong to a selected atlas country. */
export function labelsForCountry(
  selected: string,
  summaries: CountrySummary[],
): string[] {
  const hit = summaries.find(
    (s) => s.name === selected || s.labels.includes(selected),
  )
  return hit?.labels ?? [selected]
}

export function peakMatchesCountry(
  peak: Peak,
  selected: string,
  summaries: CountrySummary[],
): boolean {
  return labelsForCountry(selected, summaries).includes(peak.country)
}

export function getCountryBounds(peaks: Peak[]): [[number, number], [number, number]] | null {
  if (peaks.length === 0) return null

  let minLon = peaks[0].lon
  let maxLon = peaks[0].lon
  let minLat = peaks[0].lat
  let maxLat = peaks[0].lat

  for (const peak of peaks) {
    minLon = Math.min(minLon, peak.lon)
    maxLon = Math.max(maxLon, peak.lon)
    minLat = Math.min(minLat, peak.lat)
    maxLat = Math.max(maxLat, peak.lat)
  }

  const lonPad = Math.max((maxLon - minLon) * 0.35, 1.2)
  const latPad = Math.max((maxLat - minLat) * 0.35, 1.0)

  return [
    [minLon - lonPad, minLat - latPad],
    [maxLon + lonPad, maxLat + latPad],
  ]
}
