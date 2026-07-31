import comparisonsData from '../data/comparisons.json'
import type { Peak } from '../types/peak'
import { comparisonMetricRows, CATALOG_AS_OF, CATALOG_METHODOLOGY } from './peakSnapshot'

export type ComparisonPairDef = {
  slug: string
  aId: string
  bId: string
  title: string
  query: string
  summary: string
  pickA: string
  pickB: string
  verdict: string
}

export const COMPARISON_PAIRS = comparisonsData.pairs as ComparisonPairDef[]

export function comparisonHref(slug: string): string {
  return `/compare/${slug}`
}

export function getComparisonBySlug(slug: string): ComparisonPairDef | undefined {
  return COMPARISON_PAIRS.find((p) => p.slug === slug)
}

/** Comparisons that mention either peak (for related links on peak pages). */
export function comparisonsForPeak(peakId: string): ComparisonPairDef[] {
  return COMPARISON_PAIRS.filter((p) => p.aId === peakId || p.bId === peakId)
}

export type ResolvedComparison = ComparisonPairDef & {
  a: Peak
  b: Peak
  metrics: Array<{ label: string; a: string; b: string }>
  asOf: string
  methodology: string
}

export function resolveComparison(
  def: ComparisonPairDef,
  byId: Map<string, Peak>,
): ResolvedComparison | null {
  const a = byId.get(def.aId)
  const b = byId.get(def.bId)
  if (!a || !b) return null
  return {
    ...def,
    a,
    b,
    metrics: comparisonMetricRows(a, b),
    asOf: CATALOG_AS_OF,
    methodology: CATALOG_METHODOLOGY,
  }
}

export function resolveAllComparisons(peaks: Peak[]): ResolvedComparison[] {
  const byId = new Map(peaks.map((p) => [p.id, p]))
  return COMPARISON_PAIRS.map((def) => resolveComparison(def, byId)).filter(
    (x): x is ResolvedComparison => Boolean(x),
  )
}
