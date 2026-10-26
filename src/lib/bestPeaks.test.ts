import { describe, expect, it } from 'vitest'
import peaks from '../data/peaks.json'
import copy from '../data/bestPeaksCopy.json'
import {
  MONTH_SLUGS,
  groupMonthPeaksByTier,
  metaForBestPeaksMonth,
  monthCounts,
  monthIntro,
  peaksInMonth,
} from './bestPeaks'
import type { Peak } from '../types/peak'

const catalog = peaks as Peak[]

function byId(id: string) {
  const peak = catalog.find((p) => p.id === id)
  if (!peak) throw new Error(`missing ${id}`)
  return peak
}

describe('bestPeaks', () => {
  it('has unique 2–3 sentence intros for every month', () => {
    const firstLines = MONTH_SLUGS.map((slug) => {
      const paragraphs = monthIntro(slug)
      expect(paragraphs.length).toBeGreaterThanOrEqual(2)
      expect(paragraphs.length).toBeLessThanOrEqual(3)
      return paragraphs[0]
    })
    expect(new Set(firstLines).size).toBe(12)
  })

  it('lists Aconcagua in January and Rainier in July, not the reverse', () => {
    const januaryIds = peaksInMonth(catalog, 1).map((row) => row.peak.id)
    const julyIds = peaksInMonth(catalog, 7).map((row) => row.peak.id)
    expect(januaryIds).toContain('aconcagua')
    expect(januaryIds).not.toContain('rainier')
    expect(julyIds).toContain('rainier')
    expect(julyIds).not.toContain('aconcagua')
  })

  it('marks Half Dome as a shoulder month across its approximate cables window', () => {
    const may = peaksInMonth(catalog, 5).find((row) => row.peak.id === 'halfdome')
    expect(may?.shoulder).toBe(true)
    expect(byId('halfdome').bestSeason).toMatch(/Late May/i)
  })

  it('groups in-season peaks by difficulty tier order', () => {
    const groups = groupMonthPeaksByTier(peaksInMonth(catalog, 7))
    expect(groups.length).toBeGreaterThan(0)
    const labels = groups.map((g) => g.tier)
    const sorted = [...labels].sort(
      (a, b) =>
        [
          'day-hike',
          'strenuous-hike',
          'scramble',
          'snow-glacier',
          'alpine-technical',
          'expedition',
        ].indexOf(a) -
        [
          'day-hike',
          'strenuous-hike',
          'scramble',
          'snow-glacier',
          'alpine-technical',
          'expedition',
        ].indexOf(b),
    )
    expect(labels).toEqual(sorted)
  })

  it('builds a unique title with the summit count', () => {
    const counts = monthCounts(catalog)
    const meta = metaForBestPeaksMonth('january', counts.january, [
      'Aconcagua',
      'Ojos del Salado',
    ])
    expect(meta.title).toBe(
      `Best Peaks to Climb in January (${counts.january} Summits) | PeakAtlas3D`,
    )
    expect(meta.path).toBe('/best-peaks/january')
    expect(meta.description).toContain('Aconcagua')
  })

  it('keeps copy JSON in lockstep with MONTH_SLUGS', () => {
    expect(Object.keys(copy).sort()).toEqual([...MONTH_SLUGS].sort())
  })
})
