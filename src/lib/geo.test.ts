import { describe, expect, it } from 'vitest'
import { filterPeaks, formatElevation, searchPeaks } from './geo'
import { atlasHref, peakHref } from './routes'
import type { PeakIndex } from '../types/peak'

const sample: PeakIndex[] = [
  {
    id: 'rainier',
    name: 'Mt. Rainier',
    lat: 46.85,
    lon: -121.76,
    elevationFt: 14411,
    prominenceFt: 13210,
    range: 'Cascade Range',
    country: 'USA',
    aliases: ['Tahoma'],
  },
  {
    id: 'fuji',
    name: 'Mount Fuji',
    lat: 35.36,
    lon: 138.73,
    elevationFt: 12388,
    prominenceFt: 12388,
    range: 'Japanese Alps',
    country: 'Japan',
  },
]

describe('searchPeaks', () => {
  it('matches name, alias, range, and country', () => {
    expect(searchPeaks(sample, 'rain').map((p) => p.id)).toEqual(['rainier'])
    expect(searchPeaks(sample, 'tahoma').map((p) => p.id)).toEqual(['rainier'])
    expect(searchPeaks(sample, 'cascade').map((p) => p.id)).toEqual(['rainier'])
    expect(searchPeaks(sample, 'japan').map((p) => p.id)).toEqual(['fuji'])
  })

  it('returns empty for blank query', () => {
    expect(searchPeaks(sample, '   ')).toEqual([])
  })
})

describe('filterPeaks', () => {
  it('filters by country and elevation', () => {
    expect(
      filterPeaks(sample, {
        country: 'USA',
        range: '',
        minElevationFt: 14000,
      }).map((p) => p.id),
    ).toEqual(['rainier'])
  })
})

describe('formatElevation', () => {
  it('formats imperial and metric', () => {
    expect(formatElevation(14411, 'imperial')).toBe('14,411 ft')
    expect(formatElevation(14411, 'metric')).toMatch(/ m$/)
  })
})

describe('routes', () => {
  it('preserves country on peak and atlas hrefs', () => {
    expect(peakHref('rainier', 'USA')).toBe('/peak/rainier?country=USA')
    expect(atlasHref('USA')).toBe('/?country=USA')
    expect(atlasHref(null)).toBe('/')
  })
})
