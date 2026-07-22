import { describe, expect, it } from 'vitest'
import { peakFunFacts } from './peakFacts'
import type { PeakIndex } from '../types/peak'

const rainier: PeakIndex = {
  id: 'rainier',
  name: 'Mt. Rainier',
  lat: 46.85,
  lon: -121.76,
  elevationFt: 14411,
  prominenceFt: 13210,
  range: 'Cascade Range',
  country: 'USA',
  firstAscent: '1870',
  difficulty: 'Glacier climb',
  whyNotable: 'Most glaciated peak in the contiguous US.',
  nearestTown: { name: 'Ashford', region: 'Washington', distanceMiles: 13.4 },
}

describe('peakFunFacts', () => {
  it('includes elevation, prominence, and notable hooks', () => {
    const facts = peakFunFacts(rainier, 'imperial')
    expect(facts.some((f) => f.includes('14,411 ft'))).toBe(true)
    expect(facts.some((f) => f.includes('prominence'))).toBe(true)
    expect(facts.some((f) => f.includes('glaciated'))).toBe(true)
    expect(facts.some((f) => f.includes('Ashford'))).toBe(true)
  })
})
