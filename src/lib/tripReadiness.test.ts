import { describe, expect, it } from 'vitest'
import {
  DIFFICULTY_TO_TIER,
  inferDifficultyTier,
  resolveDifficultyTier,
} from './difficultyTiers'
import { gearChecklistForTier, GEAR_CHECKLISTS } from './gearChecklists'
import { haversineMiles, nearbyPeaksFor } from './nearbyPeaks'
import type { PeakIndex } from '../types/peak'

describe('difficulty tiers', () => {
  it('maps every known catalog difficulty string', () => {
    for (const [label, tier] of Object.entries(DIFFICULTY_TO_TIER)) {
      expect(inferDifficultyTier(label)).toBe(tier)
    }
  })

  it('prefers stored tier when valid', () => {
    expect(resolveDifficultyTier('Class 1 hike', 'expedition')).toBe(
      'expedition',
    )
    expect(resolveDifficultyTier('Class 1 hike', 'nope')).toBe('day-hike')
  })

  it('has a gear checklist for every tier', () => {
    for (const tier of Object.keys(GEAR_CHECKLISTS)) {
      const gear = gearChecklistForTier(tier as keyof typeof GEAR_CHECKLISTS)
      expect(gear.items.length).toBeGreaterThan(3)
      expect(gear.title).toBeTruthy()
    }
  })
})

describe('nearby peaks', () => {
  const catalog: PeakIndex[] = [
    {
      id: 'a',
      name: 'A',
      lat: 40,
      lon: -105,
      elevationFt: 14000,
      prominenceFt: 1000,
      range: 'Front Range',
      country: 'USA',
    },
    {
      id: 'b',
      name: 'B',
      lat: 40.1,
      lon: -105.1,
      elevationFt: 13000,
      prominenceFt: 900,
      range: 'Front Range',
      country: 'USA',
    },
    {
      id: 'c',
      name: 'C',
      lat: 40.2,
      lon: -105.2,
      elevationFt: 12000,
      prominenceFt: 800,
      range: 'Sawatch',
      country: 'USA',
    },
    {
      id: 'd',
      name: 'D',
      lat: 46,
      lon: 7,
      elevationFt: 14000,
      prominenceFt: 2000,
      range: 'Alps',
      country: 'Switzerland',
    },
  ]

  it('computes haversine distance', () => {
    expect(haversineMiles(40, -105, 40, -105)).toBe(0)
    expect(haversineMiles(40, -105, 40.1, -105.1)).toBeGreaterThan(5)
  })

  it('prefers same range then returns 3–5 neighbors', () => {
    const nearby = nearbyPeaksFor(catalog[0], catalog, 5)
    expect(nearby[0].id).toBe('b')
    expect(nearby.length).toBeGreaterThanOrEqual(3)
    expect(nearby.every((p) => p.id !== 'a')).toBe(true)
  })
})
