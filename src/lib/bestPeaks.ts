import copy from '../data/bestPeaksCopy.json'
import {
  DIFFICULTY_TIER_LABELS,
  DIFFICULTY_TIERS,
  resolveDifficultyTier,
  type DifficultyTier,
} from './difficultyTiers'
import {
  MONTH_LABELS,
  MONTH_SLUGS,
  monthNumberFromSlug,
  monthSlugFromNumber,
  parseBestSeason,
  resolvePeakSeason,
  type MonthSlug,
} from './seasonMonths'
import { countryHref, primaryCountryName } from './countryPages'
import type { CountrySummary } from '../types/country'
import type { PeakIndex } from '../types/peak'

export type { MonthSlug }

const MONTH_COPY = copy as Record<
  MonthSlug,
  { paragraphs: string[] }
>

export type MonthPeakRow = {
  peak: PeakIndex
  shoulder: boolean
}

export function bestPeaksHref(month?: MonthSlug | null): string {
  if (!month) return '/best-peaks'
  return `/best-peaks/${month}`
}

export function monthLabel(month: number | MonthSlug): string {
  if (typeof month === 'string') return MONTH_LABELS[month]
  const slug = monthSlugFromNumber(month)
  return slug ? MONTH_LABELS[slug] : ''
}

export function peaksInMonth(
  peaks: PeakIndex[],
  month: number,
): MonthPeakRow[] {
  return peaks
    .map((peak) => {
      const season = resolvePeakSeason(peak)
      if (!season.months.includes(month)) return null
      const parsed = parseBestSeason(peak.bestSeason ?? '')
      return {
        peak,
        shoulder: parsed.confidence === 'approx',
      }
    })
    .filter((row): row is MonthPeakRow => row != null)
    .sort((a, b) => b.peak.elevationFt - a.peak.elevationFt)
}

export function groupMonthPeaksByTier(rows: MonthPeakRow[]) {
  return DIFFICULTY_TIERS.map((tier) => ({
    tier,
    label: DIFFICULTY_TIER_LABELS[tier],
    peaks: rows.filter(
      (row) =>
        resolveDifficultyTier(
          row.peak.difficulty ?? '',
          row.peak.difficultyTier,
        ) === tier,
    ),
  })).filter((group) => group.peaks.length > 0)
}

export function monthCounts(peaks: PeakIndex[]): Record<MonthSlug, number> {
  const counts = Object.fromEntries(
    MONTH_SLUGS.map((slug) => [slug, 0]),
  ) as Record<MonthSlug, number>
  for (const peak of peaks) {
    const season = resolvePeakSeason(peak)
    for (const month of season.months) {
      const slug = monthSlugFromNumber(month)
      if (slug) counts[slug] += 1
    }
  }
  return counts
}

export function monthIntro(slug: MonthSlug): string[] {
  return MONTH_COPY[slug]?.paragraphs ?? []
}

export function headlinePeakNames(rows: MonthPeakRow[], limit = 3): string[] {
  return rows.slice(0, limit).map((row) => row.peak.name)
}

export function metaForBestPeaksMonth(
  slug: MonthSlug,
  count: number,
  headlines: string[],
) {
  const label = MONTH_LABELS[slug]
  const named =
    headlines.length > 0
      ? ` including ${headlines.join(', ')}`
      : ''
  return {
    title: `Best Peaks to Climb in ${label} (${count} Summits) | PeakAtlas3D`,
    description: `Best peaks to climb in ${label}: ${count} PeakAtlas3D catalog summit${count === 1 ? '' : 's'}${named}. Difficulty, season windows, and links to each 3D trip guide.`,
    path: bestPeaksHref(slug),
  }
}

export function metaForBestPeaksIndex() {
  return {
    title: 'Best Peaks to Climb by Month | PeakAtlas3D',
    description:
      'Best peaks to climb each month from the PeakAtlas3D catalog — January through December, grouped by difficulty, with season windows from each summit’s published best season.',
    path: '/best-peaks',
  }
}

export function countryHrefForPeak(
  peak: PeakIndex,
  summaries: CountrySummary[],
): string {
  return countryHref(primaryCountryName(peak.country, summaries))
}

export function currentMonthSlug(now = new Date()): MonthSlug {
  return MONTH_SLUGS[now.getMonth()] ?? 'january'
}

export const MONTH_ABBREV: Record<MonthSlug, string> = {
  january: 'Jan',
  february: 'Feb',
  march: 'Mar',
  april: 'Apr',
  may: 'May',
  june: 'Jun',
  july: 'Jul',
  august: 'Aug',
  september: 'Sep',
  october: 'Oct',
  november: 'Nov',
  december: 'Dec',
}

export function bestPeaksMonthJsonLd(
  slug: MonthSlug,
  rows: MonthPeakRow[],
  origin: string,
) {
  const label = MONTH_LABELS[slug]
  const pageUrl = `${origin}${bestPeaksHref(slug)}`
  return {
    breadcrumb: {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: `${origin}/`,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Best peaks',
          item: `${origin}/best-peaks`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: label,
          item: pageUrl,
        },
      ],
    },
    itemList: {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: `Best peaks to climb in ${label}`,
      numberOfItems: rows.length,
      itemListElement: rows.map((row, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `${origin}/peak/${row.peak.id}`,
        name: row.peak.name,
      })),
    },
  }
}

export function bestPeaksIndexJsonLd(origin: string) {
  return {
    breadcrumb: {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: `${origin}/`,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Best peaks',
          item: `${origin}/best-peaks`,
        },
      ],
    },
    itemList: {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Best peaks to climb by month',
      numberOfItems: MONTH_SLUGS.length,
      itemListElement: MONTH_SLUGS.map((slug, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `${origin}${bestPeaksHref(slug)}`,
        name: `Best peaks to climb in ${MONTH_LABELS[slug]}`,
      })),
    },
  }
}

export { MONTH_SLUGS, MONTH_LABELS, monthNumberFromSlug, monthSlugFromNumber }

export type DifficultyGroup = {
  tier: DifficultyTier
  label: string
  peaks: MonthPeakRow[]
}
