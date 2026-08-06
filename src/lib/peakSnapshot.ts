import type { Peak } from '../types/peak'
import {
  DIFFICULTY_TIER_LABELS,
  resolveDifficultyTier,
} from './difficultyTiers'
import comparisonsData from '../data/comparisons.json'

/** Catalog snapshot date shown on peak + comparison pages. */
export const CATALOG_AS_OF = comparisonsData.asOf as string

export const CATALOG_METHODOLOGY = comparisonsData.methodology as string

export type PeakSnapshotMetric = {
  label: string
  value: string
}

export type PeakSnapshot = {
  asOf: string
  methodology: string
  answer: string
  metrics: PeakSnapshotMetric[]
}

type SnapshotPeak = Pick<
  Peak,
  | 'id'
  | 'name'
  | 'elevationFt'
  | 'prominenceFt'
  | 'difficulty'
  | 'difficultyTier'
  | 'bestSeason'
  | 'permitRequired'
  | 'permitStatus'
  | 'permitNotes'
  | 'nearestTown'
  | 'hotels'
  | 'trails'
  | 'range'
  | 'country'
  | 'whyNotable'
>

function formatFt(n: number): string {
  return `${Math.round(n).toLocaleString('en-US')} ft`
}

function permitShort(peak: SnapshotPeak): string {
  if (peak.permitStatus === 'required' || peak.permitRequired === true) {
    return 'Permit required'
  }
  if (peak.permitStatus === 'not_required' || peak.permitRequired === false) {
    return 'No special summit permit'
  }
  return 'Permit status unverified'
}

function stagingShort(peak: SnapshotPeak): string {
  const town = peak.nearestTown
  if (!town?.name) return 'Staging not listed'
  const miles =
    typeof town.distanceMiles === 'number'
      ? `${town.distanceMiles.toFixed(town.distanceMiles >= 10 ? 0 : 1)} mi`
      : null
  return [town.name, miles].filter(Boolean).join(' · ')
}

function hotelCount(peak: SnapshotPeak): number {
  return Array.isArray(peak.hotels) ? peak.hotels.length : 0
}

function trailCount(peak: SnapshotPeak): number {
  return Array.isArray(peak.trails) ? peak.trails.length : 0
}

/** Stable 0..n-1 bucket from peak id (for copy variation). */
export function peakCopyVariant(peakId: string, modulo: number): number {
  let h = 0
  for (let i = 0; i < peakId.length; i++) {
    h = (h * 31 + peakId.charCodeAt(i)) >>> 0
  }
  return modulo <= 0 ? 0 : h % modulo
}

/**
 * Direct 40–80 word answer for “How do I plan {peak}?” style queries.
 * Uses catalog fields AI Overviews cannot fully replace (tiers, permits, staging miles, OSM lodging counts).
 */
export function buildPeakAnswer(peak: SnapshotPeak): string {
  const tier = resolveDifficultyTier(peak.difficulty, peak.difficultyTier)
  const tierLabel = DIFFICULTY_TIER_LABELS[tier]
  const permit = permitShort(peak)
  const season = peak.bestSeason?.trim() || 'season varies'
  const town = peak.nearestTown
  const staging = town?.name
    ? `${town.name}${
        typeof town.distanceMiles === 'number'
          ? ` (${town.distanceMiles.toFixed(town.distanceMiles >= 10 ? 0 : 1)} mi)`
          : ''
      }`
    : 'a nearby staging town'
  const hotels = hotelCount(peak)
  const lodgingBit =
    hotels > 0
      ? ` PeakAtlas lists ${hotels} mapped lodging option${hotels === 1 ? '' : 's'} near the summit area from OpenStreetMap — see Lodging & food below.`
      : ' Mapped lodging near the summit is sparse — most parties book in the staging town.'

  const templates = [
    `${peak.name} is a ${formatFt(peak.elevationFt)} summit in the ${peak.range} (${peak.country}). PeakAtlas rates it ${tierLabel.toLowerCase()} (${peak.difficulty || 'difficulty varies'}); best season is ${season}. ${permit}. Typical staging is ${staging}.${lodgingBit} Use the 3D map and trip checklist before you go.`,
    `Planning ${peak.name}? Catalog elevation is ${formatFt(peak.elevationFt)} with ${formatFt(peak.prominenceFt)} prominence in the ${peak.range}. Difficulty tier: ${tierLabel} — ${peak.difficulty || 'see trip readiness'}. Aim for ${season}. ${permit}. Stage via ${staging}.${lodgingBit}`,
    `${peak.name} (${formatFt(peak.elevationFt)}, ${peak.range}) is tagged ${tierLabel.toLowerCase()} on PeakAtlas3D. Best season window: ${season}. Access note: ${permit.toLowerCase()}. Closest listed staging is ${staging}.${lodgingBit} Compare nearby peaks and open the 3D terrain for approach context.`,
  ]

  const text = templates[peakCopyVariant(peak.id, templates.length)]
  const words = text.split(/\s+/).filter(Boolean)
  if (words.length <= 80) return text
  return `${words.slice(0, 80).join(' ')}…`
}

/** Proprietary planning numbers for the peak snapshot box. */
export function buildPeakSnapshot(peak: SnapshotPeak): PeakSnapshot {
  const tier = resolveDifficultyTier(peak.difficulty, peak.difficultyTier)
  const hotels = hotelCount(peak)
  const trails = trailCount(peak)

  return {
    asOf: CATALOG_AS_OF,
    methodology: CATALOG_METHODOLOGY,
    answer: buildPeakAnswer(peak),
    metrics: [
      { label: 'Elevation', value: formatFt(peak.elevationFt) },
      { label: 'Prominence', value: formatFt(peak.prominenceFt) },
      { label: 'Difficulty tier', value: DIFFICULTY_TIER_LABELS[tier] },
      { label: 'Best season', value: peak.bestSeason?.trim() || '—' },
      { label: 'Permits', value: permitShort(peak) },
      { label: 'Staging', value: stagingShort(peak) },
      {
        label: 'Mapped lodging',
        value:
          hotels > 0
            ? `${hotels} OSM place${hotels === 1 ? '' : 's'}`
            : 'None mapped',
      },
      {
        label: 'Listed trails',
        value: trails > 0 ? `${trails}` : '—',
      },
    ],
  }
}

/** Side-by-side metric rows for comparison pages (same formulas as snapshot). */
export function comparisonMetricRows(
  a: SnapshotPeak,
  b: SnapshotPeak,
): Array<{ label: string; a: string; b: string }> {
  const sa = buildPeakSnapshot(a)
  const sb = buildPeakSnapshot(b)
  return sa.metrics.map((m, i) => ({
    label: m.label,
    a: m.value,
    b: sb.metrics[i]?.value ?? '—',
  }))
}
