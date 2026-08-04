import featuredHomeRaw from './featuredHome.json'
import { peaksIndex } from './catalog'
import { buildCountrySummaries } from '../lib/countries'
import { countryHref } from '../lib/countryPages'
import type { PeakIndex } from '../types/peak'

type FeaturedHomeConfig = {
  featuredPeakIds: string[]
  featuredCountries: string[]
}

const config = featuredHomeRaw as FeaturedHomeConfig

/** Curated peak rows for homepage hierarchy (order preserved). */
export function getFeaturedPeaks(): PeakIndex[] {
  const byId = new Map(peaksIndex.map((p) => [p.id, p]))
  return config.featuredPeakIds
    .map((id) => byId.get(id))
    .filter((p): p is PeakIndex => Boolean(p))
}

export function getFeaturedCountries(): {
  name: string
  path: string
  peakCount: number
}[] {
  const summaries = buildCountrySummaries(peaksIndex)
  const byName = new Map(summaries.map((s) => [s.name, s]))
  return config.featuredCountries
    .map((name) => {
      const summary = byName.get(name)
      if (!summary) return null
      return {
        name: summary.name,
        path: countryHref(summary.name),
        peakCount: summary.peakCount,
      }
    })
    .filter((c): c is NonNullable<typeof c> => Boolean(c))
}

export function getAtlasStats() {
  const countries = buildCountrySummaries(peaksIndex).length
  return {
    peakCount: peaksIndex.length,
    countryCount: countries,
  }
}

export function atlasStatsLabel(): string {
  const { peakCount, countryCount } = getAtlasStats()
  return `${peakCount} peaks · ${countryCount}+ countries · 3D terrain for every summit`
}

export const FEATURED_PEAK_IDS = config.featuredPeakIds
export const FEATURED_COUNTRY_NAMES = config.featuredCountries
