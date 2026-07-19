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
  /** @deprecated Synthetic MVP ratings; omitted for OSM-sourced lodging. */
  rating?: number
  /** Lodge, Inn, Restaurant, Café, etc. */
  category?: string
  /** Short traveler-facing detail line. */
  note?: string
  lat?: number
  lon?: number
  /** Data provider label, e.g. OpenStreetMap. */
  source?: string
  /** Canonical source page (OSM object, etc.). */
  sourceUrl?: string
}

/** Curated Commons (or similar) still used in the peak dossier. */
export type PeakPhoto = {
  url: string
  credit: string
  license: string
  sourceUrl: string
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
  /** Alternate / local names used in search and the dossier. */
  aliases?: string[]
  /** Typical climbing or visiting window (plain language). */
  bestSeason?: string
  /** One-line hook for why the peak matters in the atlas. */
  whyNotable?: string
  /** Up to two summit / approach stills with attribution (dossier rotates them). */
  photos?: PeakPhoto[]
  /** @deprecated Prefer `photos[0]`; kept for older enriched rows. */
  photo?: PeakPhoto
  /**
   * Closest towns/cities for map pins + dossier context (2–3, nearest first).
   * `nearestTown` mirrors the first entry for older sample amenity copy.
   */
  nearbyPlaces: Town[]
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
