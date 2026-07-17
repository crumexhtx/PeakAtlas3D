export type Town = {
  name: string
  region: string
  distanceMiles: number
  route?: string
  lat: number
  lon: number
}

export type Amenity = {
  name: string
  rating?: number
}

export type Peak = {
  id: string
  name: string
  lat: number
  lon: number
  elevationFt: number
  /** Approximate topographic prominence in feet (MVP curated values). */
  prominenceFt: number
  range: string
  country: string
  /** Short atlas blurb for the selected-peak dossier. */
  description: string
  /** Year of first recorded ascent, or descriptive note when unknown. */
  firstAscent: string
  /** Plain-language difficulty for atlas browsing. */
  difficulty: string
  nearestTown: Town
  hotels: Amenity[]
  food: Amenity[]
  trails?: Amenity[]
}

export type UnitSystem = 'imperial' | 'metric'

export type PeakBrowseFilters = {
  country: string
  range: string
  /** Minimum elevation in feet; 0 means no minimum. */
  minElevationFt: number
}
