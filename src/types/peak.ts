import type { DifficultyTier } from '../lib/difficultyTiers'
import type { PermitStatus } from './tripReadiness'

export type { DifficultyTier, PermitStatus }

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

/**
 * Lightweight peak row for map markers, country summaries, and search.
 * Heavy dossier fields (photos, amenities) live only on {@link Peak}.
 */
export type PeakIndex = {
  id: string
  name: string
  lat: number
  lon: number
  elevationFt: number
  /** Approximate topographic prominence in feet (MVP curated values). */
  prominenceFt: number
  range: string
  country: string
  /** Alternate / local names used in search. */
  aliases?: string[]
  /** Year of first recorded ascent, or descriptive note when unknown. */
  firstAscent?: string
  /** Plain-language difficulty for atlas browsing. */
  difficulty?: string
  /**
   * Normalized difficulty tier for gear checklists (maps free-text difficulty).
   * One of: day-hike | strenuous-hike | scramble | snow-glacier | alpine-technical | expedition
   */
  difficultyTier?: DifficultyTier
  /** Typical climbing or visiting window (plain language). */
  bestSeason?: string
  /** One-line hook for why the peak matters in the atlas. */
  whyNotable?: string
  /** Short atlas blurb (optional on the index; required on full Peak). */
  description?: string
  /** Gate-town name for spin fun-facts without shipping full town geometry. */
  nearestTown?: Pick<Town, 'name' | 'region' | 'distanceMiles'>
  /**
   * Whether a permit/reservation is required when known.
   * `null` means unsourced — do not treat as “no permit.”
   */
  permitRequired?: boolean | null
  /** Explicit permit sourcing status (required | not_required | unsourced). */
  permitStatus?: PermitStatus
  /** Short access note (lottery, wilderness quota, climbing pass, etc.). */
  permitNotes?: string
}

export type Peak = PeakIndex & {
  /** Short atlas blurb for the selected-peak dossier. */
  description: string
  /**
   * Search / OG meta description (120–150 characters) for peak page SEO.
   * Prefer this over truncating `description` in document meta.
   */
  seoMetaDescription?: string
  /** Year of first recorded ascent, or descriptive note when unknown. */
  firstAscent: string
  /** Plain-language difficulty for atlas browsing. */
  difficulty: string
  /** Normalized tier for gear checklist mapping (required on full Peak). */
  difficultyTier: DifficultyTier
  /** Typical climbing or visiting window (required for trip-readiness). */
  bestSeason: string
  /**
   * Whether a permit/reservation is required when known.
   * `null` means unsourced — do not treat as “no permit.”
   */
  permitRequired: boolean | null
  permitStatus: PermitStatus
  permitNotes?: string
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
