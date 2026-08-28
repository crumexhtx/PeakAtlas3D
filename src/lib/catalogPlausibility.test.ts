import { describe, expect, it } from 'vitest'
import {
  checkProminencePlausible,
  checkTownDistancePlausible,
  haversineMiles,
} from '../../scripts/lib/catalog-plausibility.mjs'

describe('catalog plausibility', () => {
  it('rejects prominence above elevation (Aconcagua-class bug)', () => {
    expect(
      checkProminencePlausible({
        id: 'aconcagua',
        elevationFt: 22838,
        prominenceFt: 22841,
      }),
    ).toMatch(/exceeds elevation/i)
  })

  it('allows equal prominence and elevation for ultras', () => {
    expect(
      checkProminencePlausible({
        id: 'aconcagua',
        elevationFt: 22838,
        prominenceFt: 22838,
      }),
    ).toBeNull()
  })

  it('allows allowlisted tiny prominence (El Capitan)', () => {
    expect(
      checkProminencePlausible({
        id: 'elcapitan',
        elevationFt: 7569,
        prominenceFt: 9,
      }),
    ).toBeNull()
  })

  it('flags tiny prominence without an allowlist entry', () => {
    expect(
      checkProminencePlausible({
        id: 'fake',
        elevationFt: 7569,
        prominenceFt: 9,
      }),
    ).toMatch(/dropped digit/i)
  })

  it('rejects town distance that undercuts haversine badly', () => {
    const peak = { lat: 40.78, lon: -110.37 }
    // ~120 mi away, claiming 10 mi approach.
    const town = { lat: 39.5, lon: -111.9, distanceMiles: 10 }
    const miles = haversineMiles(peak.lat, peak.lon, town.lat, town.lon)
    expect(miles).toBeGreaterThan(80)
    expect(checkTownDistancePlausible(peak, town)).toMatch(/far below/i)
  })

  it('allows road miles longer than crow-flies', () => {
    const peak = { lat: 53.11, lon: -119.16 }
    const town = { lat: 53.05, lon: -119.3, distanceMiles: 55 }
    expect(checkTownDistancePlausible(peak, town)).toBeNull()
  })
})
