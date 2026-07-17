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
