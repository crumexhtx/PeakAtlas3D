import nationalParksData from './nationalParks.json'
import type { NationalPark } from '../types/nationalPark'

/** Curated USA National Parks for the atlas parks toggle. */
export const nationalParks = nationalParksData as NationalPark[]

export function getNationalParkById(id: string): NationalPark | undefined {
  return nationalParks.find((p) => p.id === id)
}
