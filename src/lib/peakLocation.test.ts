import { describe, expect, it } from 'vitest'
import { peakLocationLabel } from './peakLocation'

describe('peakLocationLabel', () => {
  it('formats US state + country', () => {
    expect(
      peakLocationLabel({
        country: 'USA',
        nearestTown: {
          name: 'Aspen',
          region: 'Colorado',
          distanceMiles: 10,
        },
      }),
    ).toBe('Colorado, USA')
  })

  it('skips country-level region placeholders', () => {
    expect(
      peakLocationLabel({
        country: 'USA',
        nearestTown: { name: 'Town', region: 'USA', distanceMiles: 1 },
        nearbyPlaces: [{ region: 'Washington' }],
      }),
    ).toBe('Washington, USA')
  })

  it('falls back to country only', () => {
    expect(peakLocationLabel({ country: 'Nepal' })).toBe('Nepal')
  })
})
