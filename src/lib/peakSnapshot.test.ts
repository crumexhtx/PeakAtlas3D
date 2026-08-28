import { describe, expect, it } from 'vitest'
import {
  buildPeakAnswer,
  buildPeakSnapshot,
  comparisonMetricRows,
  CATALOG_AS_OF,
} from './peakSnapshot'
import {
  COMPARISON_PAIRS,
  comparisonsForPeak,
  getComparisonBySlug,
  resolveComparison,
} from './comparisons'
import { tripReadinessLead, peakStatsLead } from './peakSectionLeads'
import type { Peak } from '../types/peak'

const whitney = {
  id: 'whitney',
  name: 'Mt. Whitney',
  lat: 36.5785,
  lon: -118.2923,
  elevationFt: 14495,
  prominenceFt: 10079,
  range: 'Sierra Nevada',
  country: 'USA',
  description: 'Highest peak in the Contiguous United States.',
  firstAscent: '1873',
  difficulty: 'Class 1–2 hike',
  difficultyTier: 'day-hike',
  bestSeason: 'Jul–Sep',
  permitRequired: true,
  permitStatus: 'required',
  nearestTown: {
    name: 'Lone Pine',
    region: 'California',
    distanceMiles: 13,
    route: 'Whitney Portal Rd',
    lat: 36.6,
    lon: -118.06,
  },
  hotels: [
    { name: 'Dow Villa', category: 'Motel', note: 'test' },
    { name: 'Whitney Portal Hostel', category: 'Hostel', note: 'test' },
  ],
  trails: [{ name: 'Mount Whitney Trail' }],
} as Peak

const elbert = {
  ...whitney,
  id: 'elbert',
  name: 'Mt. Elbert',
  elevationFt: 14440,
  prominenceFt: 9073,
  range: 'Sawatch Range',
  permitRequired: false,
  permitStatus: 'not_required',
  nearestTown: {
    name: 'Leadville',
    region: 'Colorado',
    distanceMiles: 12,
    route: 'CO-82',
    lat: 39.25,
    lon: -106.29,
  },
  hotels: [{ name: 'Delaware Hotel', category: 'Hotel', note: 'test' }],
} as Peak

describe('peakSnapshot', () => {
  it('builds a dated answer and proprietary metrics', () => {
    const snap = buildPeakSnapshot(whitney)
    expect(snap.asOf).toBe(CATALOG_AS_OF)
    expect(snap.answer.split(/\s+/).length).toBeGreaterThanOrEqual(40)
    expect(snap.answer.split(/\s+/).length).toBeLessThanOrEqual(85)
    expect(snap.metrics.find((m) => m.label === 'Elevation')?.value).toContain(
      '14,495',
    )
    expect(snap.metrics.find((m) => m.label === 'Permits')?.value).toMatch(
      /Permit required/i,
    )
    expect(
      snap.metrics.find((m) => m.label === 'Mapped lodging')?.value,
    ).toContain('2')
  })

  it('counts curated 14ers.com routes when catalog trails are empty', () => {
    const snap = buildPeakSnapshot({ ...elbert, trails: [] })
    expect(snap.metrics.find((m) => m.label === 'Listed trails')?.value).toBe(
      '2',
    )
  })

  it('varies answer templates by peak id', () => {
    expect(buildPeakAnswer(whitney)).not.toEqual(buildPeakAnswer(elbert))
  })

  it('builds side-by-side comparison rows', () => {
    const rows = comparisonMetricRows(whitney, elbert)
    expect(rows.length).toBeGreaterThan(5)
    expect(rows[0]).toEqual({
      label: 'Elevation',
      a: expect.stringContaining('14,495'),
      b: expect.stringContaining('14,440'),
    })
  })
})

describe('comparisons', () => {
  it('includes 10 high-intent pairs with catalog ids', () => {
    expect(COMPARISON_PAIRS.length).toBe(10)
    expect(getComparisonBySlug('whitney-vs-elbert')?.aId).toBe('whitney')
    expect(comparisonsForPeak('whitney').length).toBeGreaterThan(0)
  })

  it('resolves a comparison against peak catalog rows', () => {
    const def = getComparisonBySlug('whitney-vs-elbert')!
    const resolved = resolveComparison(
      def,
      new Map([
        ['whitney', whitney],
        ['elbert', elbert],
      ]),
    )
    expect(resolved?.metrics[0].a).toContain('14,495')
    expect(resolved?.verdict.length).toBeGreaterThan(20)
  })
})

describe('peakSectionLeads', () => {
  it('uses question-style headings with answer-first copy', () => {
    const trip = tripReadinessLead(whitney)
    expect(trip.heading.endsWith('?')).toBe(true)
    expect(trip.answer.length).toBeGreaterThan(40)
    const stats = peakStatsLead(whitney)
    expect(stats.heading.includes('Whitney')).toBe(true)
  })
})
