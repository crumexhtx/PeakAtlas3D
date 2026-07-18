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

export function countryToIso(country: string): string | null {
  return COUNTRY_ISO[country] ?? null
}

export function flagUrl(country: string, size: 20 | 40 | 80 = 40): string | null {
  const iso = countryToIso(country)
  if (!iso) return null
  return `https://flagcdn.com/w${size}/${iso}.png`
}

/** Aggregate peaks into one atlas entry per country label. */
export function buildCountrySummaries(peaks: Peak[]): CountrySummary[] {
  const byCountry = new Map<string, Peak[]>()

  for (const peak of peaks) {
    const list = byCountry.get(peak.country)
    if (list) list.push(peak)
    else byCountry.set(peak.country, [peak])
  }

  const summaries: CountrySummary[] = []

  for (const [name, countryPeaks] of byCountry) {
    let latSum = 0
    let lonSum = 0
    let elevSum = 0
    let highest = countryPeaks[0]
    let lowest = countryPeaks[0]
    const ranges = new Set<string>()

    for (const peak of countryPeaks) {
      latSum += peak.lat
      lonSum += peak.lon
      elevSum += peak.elevationFt
      ranges.add(peak.range)
      if (peak.elevationFt > highest.elevationFt) highest = peak
      if (peak.elevationFt < lowest.elevationFt) lowest = peak
    }

    const n = countryPeaks.length
    summaries.push({
      name,
      lat: latSum / n,
      lon: lonSum / n,
      peakCount: n,
      highestPeak: highest,
      lowestPeak: lowest,
      ranges: [...ranges].sort((a, b) => a.localeCompare(b)),
      avgElevationFt: elevSum / n,
    })
  }

  return summaries.sort((a, b) => a.name.localeCompare(b.name))
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

  // Pad tiny single-peak countries so fitBounds still feels like a country zoom.
  const lonPad = Math.max((maxLon - minLon) * 0.35, 1.2)
  const latPad = Math.max((maxLat - minLat) * 0.35, 1.0)

  return [
    [minLon - lonPad, minLat - latPad],
    [maxLon + lonPad, maxLat + latPad],
  ]
}
