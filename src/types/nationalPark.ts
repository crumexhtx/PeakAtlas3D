import type { Amenity, PeakPhoto, Town } from './peak'

/**
 * USA National Park dossier row — peak-like trip fields without elevation/difficulty.
 * Kept separate from {@link Peak} so parks never pollute peak search/validators.
 */
export type NationalPark = {
  id: string
  name: string
  aliases?: string[]
  lat: number
  lon: number
  country: string
  state: string
  established: number
  areaSqMi: number
  bestSeason: string
  feeRequired: boolean
  feeNotes: string
  whyNotable: string
  description: string
  seoMetaDescription?: string
  nearestTown: Town
  nearbyPlaces: Town[]
  hotels: Amenity[]
  food: Amenity[]
  trails?: Amenity[]
  photos?: PeakPhoto[]
  photo?: PeakPhoto
}
