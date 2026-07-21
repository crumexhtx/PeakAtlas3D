/**
 * Unified popular-trail references for US peaks.
 * Colorado 14ers → 14ers.com; other US peaks → NPS / USFS / state pages.
 */

import {
  fourteenersRoutesForPeak,
  type FourteenersRoute,
} from './fourteenersRoutes'
import { usPeakRoutesForPeak, type UsPeakRoute } from './usPeakRoutes'

export type PeakTrailRoute = {
  name: string
  trailhead?: string
  difficulty?: string
  roundTripMiles?: number
  elevationGainFt?: number
  standard?: boolean
  note?: string
  sourceUrl: string
  sourceLabel: string
  sourceHome: string
}

const FOURTEENERS_HOME = 'https://www.14ers.com/'

function fromFourteeners(route: FourteenersRoute): PeakTrailRoute {
  return {
    name: route.name,
    trailhead: route.trailhead,
    difficulty: route.difficulty,
    roundTripMiles: route.roundTripMiles,
    elevationGainFt: route.elevationGainFt,
    standard: route.standard,
    sourceUrl: route.sourceUrl,
    sourceLabel: '14ers.com',
    sourceHome: FOURTEENERS_HOME,
  }
}

function fromUsRoute(route: UsPeakRoute): PeakTrailRoute {
  return {
    name: route.name,
    trailhead: route.trailhead,
    difficulty: route.difficulty,
    standard: route.standard,
    note: route.note,
    sourceUrl: route.sourceUrl,
    sourceLabel: route.sourceLabel,
    sourceHome: route.sourceHome,
  }
}

export function peakTrailRoutesForPeak(peakId: string): PeakTrailRoute[] {
  const curated = fourteenersRoutesForPeak(peakId)
  if (curated.length) return curated.map(fromFourteeners)
  return usPeakRoutesForPeak(peakId).map(fromUsRoute)
}

export function peakHasTrailRoutes(peakId: string): boolean {
  return peakTrailRoutesForPeak(peakId).length > 0
}

/** Unique outbound sources for the References section. */
export function trailSourcesForPeak(
  peakId: string,
): { label: string; home: string }[] {
  const seen = new Set<string>()
  const out: { label: string; home: string }[] = []
  for (const route of peakTrailRoutesForPeak(peakId)) {
    const key = `${route.sourceLabel}|${route.sourceHome}`
    if (seen.has(key)) continue
    seen.add(key)
    out.push({ label: route.sourceLabel, home: route.sourceHome })
  }
  return out
}

export function routeDetailNote(route: PeakTrailRoute): string {
  if (route.note) return route.note
  const bits = [
    route.standard ? 'Standard' : null,
    route.trailhead ? `TH: ${route.trailhead}` : null,
    route.difficulty,
    route.roundTripMiles != null ? `~${route.roundTripMiles} mi RT` : null,
    route.elevationGainFt != null
      ? `~${route.elevationGainFt.toLocaleString()} ft gain`
      : null,
  ].filter(Boolean)
  return bits.join(' · ')
}

export { FOURTEENERS_HOME }
