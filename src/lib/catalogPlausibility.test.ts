import { describe, expect, it } from 'vitest'
import {
  checkProminencePlausible,
  checkTownDistancePlausible,
  collectCatalogIssues,
  haversineKm,
  haversineMiles,
  slugSharesNameToken,
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

describe('catalog issue scan', () => {
  it('flags coincident summits as proximity duplicates', () => {
    const { errors } = collectCatalogIssues([
      {
        id: 'vinson',
        name: 'Vinson Massif',
        lat: -78.5254,
        lon: -85.6171,
        aliases: ['Mount Vinson'],
      },
      {
        id: 'rittenhouse',
        name: 'Mt. Vinson',
        lat: -78.5254,
        lon: -85.6171,
        aliases: ['Mount Vinson'],
      },
    ])
    expect(errors.some((e) => e.includes('proximity-duplicate'))).toBe(true)
    expect(errors.some((e) => e.includes('alias-name-collision'))).toBe(true)
  })

  it('warns on close neighbors unless allow-listed (Grays/Torreys)', () => {
    const { warnings } = collectCatalogIssues([
      {
        id: 'aaa',
        name: 'Peak A',
        lat: 39.6338,
        lon: -105.8175,
      },
      {
        id: 'bbb',
        name: 'Peak B',
        lat: 39.6425,
        lon: -105.8212,
      },
    ])
    expect(warnings.some((w) => w.includes('proximity-neighbor'))).toBe(true)
  })

  it('flags Province 1 as a stale admin name', () => {
    const { errors } = collectCatalogIssues([
      {
        id: 'makalu',
        name: 'Makalu',
        lat: 27.8897,
        lon: 87.0883,
        nearestTown: { name: 'Tumlingtar', region: 'Province 1', distanceMiles: 40 },
      },
    ])
    expect(errors.some((e) => e.includes('stale-admin'))).toBe(true)
  })

  it('slug sanity catches citlaltepetl vs Iztaccíhuatl', () => {
    expect(
      slugSharesNameToken({
        id: 'citlaltepetl',
        name: 'Iztaccíhuatl',
        aliases: [],
      }),
    ).toBe(false)
    expect(
      slugSharesNameToken({
        id: 'iztaccihuatl',
        name: 'Iztaccíhuatl',
        aliases: ['Iztaccihuatl'],
      }),
    ).toBe(true)
  })

  it('haversineKm matches 0.2 km threshold scale', () => {
    const km = haversineKm(45.9369, 7.8667, 45.9369, 7.8668)
    expect(km).toBeLessThan(0.2)
    expect(km).toBeGreaterThan(0)
  })

  it('keeps Gasherbrum I vs II as distinct names', () => {
    const { errors, warnings } = collectCatalogIssues([
      {
        id: 'gasherbrum1',
        name: 'Gasherbrum I',
        lat: 35.7247,
        lon: 76.6964,
      },
      {
        id: 'gasherbrum2',
        name: 'Gasherbrum II',
        lat: 35.7583,
        lon: 76.6533,
      },
    ])
    expect(errors.some((e) => e.includes('name-duplicate'))).toBe(false)
    expect(warnings.some((w) => w.includes('name-homonym'))).toBe(false)
  })

  it('treats K2 as a slug that matches its name', () => {
    expect(slugSharesNameToken({ id: 'k2', name: 'K2', aliases: [] })).toBe(true)
  })
})
