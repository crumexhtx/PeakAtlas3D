import type { Peak } from '../types/peak'
import { formatElevation } from './geo'
import type { UnitSystem } from '../types/peak'

/** Build a shuffled pool of short fun facts for idle-spin callouts. */
export function peakFunFacts(peak: Peak, units: UnitSystem = 'imperial'): string[] {
  const facts: string[] = []

  if (peak.whyNotable?.trim()) facts.push(peak.whyNotable.trim())

  facts.push(
    `${peak.name} stands ${formatElevation(peak.elevationFt, units)} in the ${peak.range}.`,
  )

  if (peak.prominenceFt >= 5000) {
    facts.push(
      `${peak.name} has ${formatElevation(peak.prominenceFt, units)} of prominence — a true standout summit.`,
    )
  }

  if (peak.firstAscent && peak.firstAscent !== 'Unknown') {
    facts.push(`First recorded ascent: ${peak.firstAscent}.`)
  }

  if (peak.difficulty) {
    facts.push(`Typical challenge: ${peak.difficulty}.`)
  }

  if (peak.bestSeason) {
    facts.push(`Best season to visit: ${peak.bestSeason}.`)
  }

  if (peak.nearestTown?.name) {
    facts.push(
      `Common gate town: ${peak.nearestTown.name}${peak.nearestTown.region ? `, ${peak.nearestTown.region}` : ''}.`,
    )
  }

  const blurb = peak.description?.trim()
  if (blurb) {
    const sentence = blurb.split(/(?<=[.!?])\s+/)[0]
    if (sentence && sentence.length > 28 && sentence.length < 160) {
      facts.push(sentence)
    }
  }

  // Dedupe
  return [...new Set(facts)]
}

export function pickRandomFact(peak: Peak, units: UnitSystem, avoid?: string): string {
  const pool = peakFunFacts(peak, units)
  if (!pool.length) return `${peak.name} — a highlight of ${peak.country}.`
  const filtered = avoid ? pool.filter((f) => f !== avoid) : pool
  const list = filtered.length ? filtered : pool
  return list[Math.floor(Math.random() * list.length)]!
}

export function pickRandomPeak(peaks: Peak[], avoidId?: string): Peak | null {
  if (!peaks.length) return null
  const filtered = avoidId ? peaks.filter((p) => p.id !== avoidId) : peaks
  const list = filtered.length ? filtered : peaks
  return list[Math.floor(Math.random() * list.length)] ?? null
}
