import peaksIndexData from './peaks.index.json'
import type { Peak, PeakIndex } from '../types/peak'

/** Lightweight rows for globe, country panels, and search. */
export const peaksIndex = peaksIndexData as PeakIndex[]

/** @deprecated Prefer {@link peaksIndex} for map/search. Alias kept for gradual call-site updates. */
export const peaks = peaksIndex

let fullCatalog: Peak[] | null = null
let fullCatalogPromise: Promise<Peak[]> | null = null

/** Lazily load the full dossier catalog (photos, amenities, nearby places). */
export function loadFullCatalog(): Promise<Peak[]> {
  if (fullCatalog) return Promise.resolve(fullCatalog)
  fullCatalogPromise ??= import('./peaks.json')
    .then((mod) => {
      fullCatalog = mod.default as Peak[]
      return fullCatalog
    })
    .catch((err) => {
      // Allow a later navigation / refresh to retry the dynamic import.
      fullCatalogPromise = null
      throw err
    })
  return fullCatalogPromise
}

export async function getPeakById(id: string): Promise<Peak | undefined> {
  const all = await loadFullCatalog()
  return all.find((p) => p.id === id)
}

export function getPeakIndexById(id: string): PeakIndex | undefined {
  return peaksIndex.find((p) => p.id === id)
}
