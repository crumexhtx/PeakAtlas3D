/**
 * Shared country merge + slug helpers for sitemap / prerender (Node ESM).
 * Keep in sync with src/lib/countries.ts + src/lib/countryPages.ts.
 */

/** @type {Record<string, string>} */
export const COUNTRY_ISO = {
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
  Ireland: 'ie',
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
  Slovakia: 'sk',
  Slovenia: 'si',
  'South Africa': 'za',
  'South Korea': 'kr',
  Spain: 'es',
  Sweden: 'se',
  Switzerland: 'ch',
  Tanzania: 'tz',
  Turkey: 'tr',
  'United Kingdom': 'gb',
  USA: 'us',
}

/** @type {Record<string, string>} */
const PRIMARY_LABEL = {
  np: 'Nepal',
  pk: 'Pakistan',
  fi: 'Finland/Norway',
  us: 'USA',
}

export function countrySlug(name) {
  return String(name)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function pickPrimaryLabel(labels, iso) {
  if (iso && PRIMARY_LABEL[iso] && labels.includes(PRIMARY_LABEL[iso])) {
    return PRIMARY_LABEL[iso]
  }
  const clean = labels.filter((l) => !l.includes('/'))
  if (clean.length) {
    return [...clean].sort((a, b) => a.localeCompare(b))[0]
  }
  return [...labels].sort((a, b) => a.localeCompare(b))[0]
}

/**
 * One summary per ISO (or raw label), matching buildCountrySummaries().
 * @param {Array<{ id: string, name: string, country: string, elevationFt: number, range: string, lat: number, lon: number }>} peaks
 */
export function buildCountrySummaries(peaks) {
  /** @type {Map<string, typeof peaks>} */
  const byIso = new Map()
  /** @type {typeof peaks} */
  const unknown = []

  for (const peak of peaks) {
    const iso = COUNTRY_ISO[peak.country]
    if (!iso) {
      unknown.push(peak)
      continue
    }
    const list = byIso.get(iso)
    if (list) list.push(peak)
    else byIso.set(iso, [peak])
  }

  /** @type {Array<{ name: string, labels: string[], peakCount: number, highestPeak: (typeof peaks)[0], ranges: string[], peaks: typeof peaks }>} */
  const summaries = []

  for (const [iso, countryPeaks] of byIso) {
    const labels = [...new Set(countryPeaks.map((p) => p.country))].sort((a, b) =>
      a.localeCompare(b),
    )
    const name = pickPrimaryLabel(labels, iso)
    let highest = countryPeaks[0]
    const ranges = new Set()
    for (const peak of countryPeaks) {
      ranges.add(peak.range)
      if (peak.elevationFt > highest.elevationFt) highest = peak
    }
    summaries.push({
      name,
      labels,
      peakCount: countryPeaks.length,
      highestPeak: highest,
      ranges: [...ranges].sort((a, b) => a.localeCompare(b)),
      peaks: [...countryPeaks].sort((a, b) => {
        if (b.elevationFt !== a.elevationFt) return b.elevationFt - a.elevationFt
        return a.name.localeCompare(b.name)
      }),
    })
  }

  /** @type {Map<string, typeof peaks>} */
  const unknownByLabel = new Map()
  for (const peak of unknown) {
    const list = unknownByLabel.get(peak.country)
    if (list) list.push(peak)
    else unknownByLabel.set(peak.country, [peak])
  }

  for (const [label, countryPeaks] of unknownByLabel) {
    let highest = countryPeaks[0]
    const ranges = new Set()
    for (const peak of countryPeaks) {
      ranges.add(peak.range)
      if (peak.elevationFt > highest.elevationFt) highest = peak
    }
    summaries.push({
      name: label,
      labels: [label],
      peakCount: countryPeaks.length,
      highestPeak: highest,
      ranges: [...ranges].sort((a, b) => a.localeCompare(b)),
      peaks: [...countryPeaks].sort((a, b) => {
        if (b.elevationFt !== a.elevationFt) return b.elevationFt - a.elevationFt
        return a.name.localeCompare(b.name)
      }),
    })
  }

  return summaries.sort((a, b) => a.name.localeCompare(b.name))
}

/** @param {ReturnType<typeof buildCountrySummaries>} summaries */
export function generateCountryStaticParams(summaries) {
  return summaries.map((s) => ({ countrySlug: countrySlug(s.name) }))
}

export function countryMeta(summary) {
  const slug = countrySlug(summary.name)
  const rangeBit =
    summary.ranges.length > 0
      ? ` Ranges include ${summary.ranges.slice(0, 4).join(', ')}${
          summary.ranges.length > 4 ? ', and more' : ''
        }.`
      : ''
  let description = `Explore ${summary.peakCount} mountain peak${
    summary.peakCount === 1 ? '' : 's'
  } in ${summary.name} on PeakAtlas3D — trip guides, difficulty, season, and 3D terrain. Highest in the catalog: ${
    summary.highestPeak.name
  } (${Number(summary.highestPeak.elevationFt).toLocaleString('en-US')} ft).${rangeBit}`
  if (description.length > 300) {
    description = `${description.slice(0, 299).trimEnd()}…`
  }
  return {
    slug,
    path: `/countries/${slug}`,
    title: `${summary.name} Peaks — Trip Guides & 3D Maps | PeakAtlas3D`,
    description,
  }
}
