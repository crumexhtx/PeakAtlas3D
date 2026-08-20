import { describe, expect, it } from 'vitest'
import {
  closestPlacesLead,
  lodgingLead,
  planningResourcesLead,
} from './peakSectionLeads'
import { planningResourcesForPeak } from '../data/peakPlanningResources'

describe('lodgingLead', () => {
  it('states limited OSM lodging honestly when hotels are empty', () => {
    const lead = lodgingLead({
      id: 'aconcagua',
      name: 'Aconcagua',
      nearestTown: { name: 'Mendoza', distanceMiles: 110 },
      hotels: [],
      food: [{ name: 'Cafe' }],
    })
    expect(lead.answer).toMatch(/limited lodging data/i)
    expect(lead.answer).toMatch(/OpenStreetMap/i)
    expect(lead.answer).not.toMatch(/maps \d+ lodging/i)
  })

  it('does not imply OSM dining when food is curated-only', () => {
    const lead = lodgingLead({
      id: 'damavand',
      name: 'Damavand',
      nearestTown: { name: 'Polur', distanceMiles: 20 },
      hotels: [{ name: 'Hut' }],
      food: [{ name: 'Kitchen' }],
    })
    expect(lead.answer).toMatch(/OpenStreetMap/)
    expect(lead.answer).toMatch(/PeakAtlas suggestions/i)
  })
})

describe('closestPlacesLead', () => {
  it('avoids implying a lodging directory when hotels are empty', () => {
    const lead = closestPlacesLead({
      id: 'logan',
      name: 'Mount Logan',
      nearestTown: { name: 'Haines Junction', distanceMiles: 40 },
      hotels: [],
    })
    expect(lead.answer).toMatch(/limited lodging/i)
    expect(lead.answer).not.toMatch(/lodging options listed separately/i)
  })
})

describe('peakPlanningResources', () => {
  it('ships sourced Damavand federation links', () => {
    const resources = planningResourcesForPeak('damavand')
    expect(resources.length).toBeGreaterThanOrEqual(2)
    expect(resources.every((r) => r.url.startsWith('https://'))).toBe(true)
    expect(resources.some((r) => r.url.includes('msfi.ir'))).toBe(true)
    expect(planningResourcesLead({ id: 'damavand', name: 'Damavand' }).heading)
      .toMatch(/check before/i)
  })
})
