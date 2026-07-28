import type { PeakIndex } from '../types/peak'
import type { CountrySummary } from '../types/country'
import {
  buildCountrySummaries,
  peakMatchesCountry,
} from './countries'

/**
 * URL slug for a country landing page (`/countries/[countrySlug]`).
 * Mirrors the static-param style used for peak ids — stable kebab-case from
 * the primary atlas country label (e.g. "New Zealand" → "new-zealand").
 */
export function countrySlug(name: string): string {
  return String(name)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Pathname-only country landing URL. */
export function countryHref(nameOrSummary: string | CountrySummary): string {
  const name =
    typeof nameOrSummary === 'string' ? nameOrSummary : nameOrSummary.name
  return `/countries/${countrySlug(name)}`
}

/**
 * Equivalent of Next.js `generateStaticParams` for country pages —
 * one entry per atlas country (ISO-merged), not every raw border label.
 */
export function generateCountryStaticParams(
  peaks: PeakIndex[],
): { countrySlug: string }[] {
  return buildCountrySummaries(peaks).map((summary) => ({
    countrySlug: countrySlug(summary.name),
  }))
}

export function findCountrySummaryBySlug(
  slug: string,
  summaries: CountrySummary[],
): CountrySummary | undefined {
  const normalized = countrySlug(slug)
  return summaries.find(
    (s) =>
      countrySlug(s.name) === normalized ||
      s.labels.some((label) => countrySlug(label) === normalized),
  )
}

/** Resolve the primary atlas country name for a peak's raw country label. */
export function primaryCountryName(
  peakCountry: string,
  summaries: CountrySummary[],
): string {
  const hit = summaries.find(
    (s) => s.name === peakCountry || s.labels.includes(peakCountry),
  )
  return hit?.name ?? peakCountry
}

/** Peaks belonging to a country — same filter as `?country=` on the globe. */
export function peaksForCountry(
  peaks: PeakIndex[],
  selected: string,
  summaries: CountrySummary[],
): PeakIndex[] {
  return peaks
    .filter((peak) => peakMatchesCountry(peak, selected, summaries))
    .sort((a, b) => {
      if (b.elevationFt !== a.elevationFt) return b.elevationFt - a.elevationFt
      return a.name.localeCompare(b.name)
    })
}
