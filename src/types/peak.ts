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
  range: string
  country: string
  nearestTown: Town
  hotels: Amenity[]
  food: Amenity[]
  trails?: Amenity[]
}

export type TerrainFilter = 'peaks' | 'towns' | 'trails'

export type FilterState = Record<TerrainFilter, boolean>
