import { describe, expect, it } from 'vitest'
import { COUNTRY_ISO as STATIC_ISO } from '../../scripts/lib/countries-static.mjs'
import { findCountrySummaryBySlug } from './countryPages'
import {
  COUNTRY_ISO,
  buildCountrySummaries,
  countryToIso,
  getCountryBounds,
  peaksForCountryFraming,
} from './countries'
import type { PeakIndex } from '../types/peak'

function peak(
  id: string,
  lon: number,
  lat: number,
  elevationFt = 10000,
): PeakIndex {
  return {
    id,
    name: id,
    lon,
    lat,
    elevationFt,
    prominenceFt: 1000,
    range: 'Test',
    country: 'USA',
  }
}

describe('peaksForCountryFraming', () => {
  it('drops Alaska/Hawaii-style outliers so framing stays continental', () => {
    const continental = [
      peak('rainier', -121.76, 46.85),
      peak('whitney', -118.29, 36.58),
      peak('elbert', -106.45, 39.12),
      peak('mitchell', -82.27, 35.76),
      peak('katahdin', -68.92, 45.9),
      peak('hood', -121.7, 45.37),
      peak('shasta', -122.19, 41.41),
      peak('pikes', -105.04, 38.84),
      peak('marcy', -73.92, 44.11),
      peak('washington', -71.3, 44.27),
    ]
    const withOutliers = [
      ...continental,
      peak('denali', -151.01, 63.07),
      peak('maunakea', -155.47, 19.82),
      peak('haleakala', -156.25, 20.71),
    ]

    const framed = peaksForCountryFraming(withOutliers)
    const ids = new Set(framed.map((p) => p.id))

    expect(ids.has('denali')).toBe(false)
    expect(ids.has('maunakea')).toBe(false)
    expect(ids.has('haleakala')).toBe(false)
    expect(ids.has('rainier')).toBe(true)
    expect(ids.has('katahdin')).toBe(true)
  })
})

describe('getCountryBounds', () => {
  it('frames tighter than the full Alaska-to-Hawaii bbox', () => {
    const peaks = [
      peak('rainier', -121.76, 46.85),
      peak('whitney', -118.29, 36.58),
      peak('elbert', -106.45, 39.12),
      peak('mitchell', -82.27, 35.76),
      peak('katahdin', -68.92, 45.9),
      peak('hood', -121.7, 45.37),
      peak('shasta', -122.19, 41.41),
      peak('pikes', -105.04, 38.84),
      peak('marcy', -73.92, 44.11),
      peak('washington', -71.3, 44.27),
      peak('denali', -151.01, 63.07),
      peak('maunakea', -155.47, 19.82),
    ]

    const bounds = getCountryBounds(peaks)
    expect(bounds).not.toBeNull()
    const [[minLon, minLat], [maxLon, maxLat]] = bounds!

    // Contiguous US focus — not pulled out to Hawaii / Denali.
    expect(minLon).toBeGreaterThan(-128)
    expect(maxLon).toBeLessThan(-64)
    expect(minLat).toBeGreaterThan(32)
    expect(maxLat).toBeLessThan(50)

    const fullSpanLon = 155.47 - 68.92
    const framedSpanLon = maxLon - minLon
    expect(framedSpanLon).toBeLessThan(fullSpanLon * 0.7)
  })
})

describe('country ISO maps', () => {
  it('keeps src and sitemap ISO tables in sync', () => {
    expect(COUNTRY_ISO).toEqual(STATIC_ISO)
  })

  it('maps Philippines, Malaysia, and Switzerland/Italy', () => {
    expect(countryToIso('Philippines')).toBe('ph')
    expect(countryToIso('Malaysia')).toBe('my')
    expect(countryToIso('Switzerland/Italy')).toBe('ch')
  })

  it('maps Phase 6 border and new-country labels to a primary ISO', () => {
    expect(countryToIso('Indonesia')).toBe('id')
    expect(countryToIso('Germany')).toBe('de')
    expect(countryToIso('Iceland')).toBe('is')
    expect(countryToIso('Cameroon')).toBe('cm')
    expect(countryToIso('Guatemala')).toBe('gt')
    expect(countryToIso('Chile/Argentina')).toBe('cl')
    expect(countryToIso('Kyrgyzstan/Tajikistan')).toBe('kg')
    expect(countryToIso('Poland/Slovakia')).toBe('pl')
    expect(countryToIso('Uganda/DR Congo')).toBe('ug')
    expect(countryToIso('Venezuela/Brazil/Guyana')).toBe('ve')
  })

  it('merges Switzerland/Italy into the Switzerland country page', () => {
    const summaries = buildCountrySummaries([
      {
        ...peak('matterhorn', 7.66, 45.98),
        country: 'Switzerland',
      },
      {
        ...peak('monterosa', 7.87, 45.94),
        country: 'Switzerland/Italy',
      },
      {
        ...peak('etna', 15.0, 37.75),
        country: 'Italy',
      },
    ])
    const names = summaries.map((s) => s.name)
    expect(names).toContain('Switzerland')
    expect(names).toContain('Italy')
    expect(names).not.toContain('Switzerland/Italy')

    const switzerland = summaries.find((s) => s.name === 'Switzerland')
    expect(switzerland?.peakCount).toBe(2)
    expect(switzerland?.labels).toEqual(
      expect.arrayContaining(['Switzerland', 'Switzerland/Italy']),
    )
    expect(findCountrySummaryBySlug('switzerland-italy', summaries)?.name).toBe(
      'Switzerland',
    )
    expect(findCountrySummaryBySlug('philippines', summaries)).toBeUndefined()
  })
})
