import { createContext, useContext, type ReactNode } from 'react'
import type { NationalPark } from '../types/nationalPark'
import type { Peak, PeakIndex } from '../types/peak'
import type { PeakBrowseFilters } from '../types/peak'

export type AtlasMode = 'world' | 'country' | 'peak'

export type AtlasContextValue = {
  mode: AtlasMode
  browse: PeakBrowseFilters
  selectedCountry: string | null
  activePeak: Peak | null
  /** True while the full peak dossier catalog is loading for a peak route. */
  peakLoading: boolean
  mapPeaks: PeakIndex[]
  cinematic: boolean
  cinematicStatus: string
  /** Hide chrome so only the globe and flags remain. */
  earthOnly: boolean
  setEarthOnly: (next: boolean) => void
  /** Peak mode — hide summit/trail/nearby map markers. */
  hideMapMarkers: boolean
  setHideMapMarkers: (next: boolean) => void
  /** World view — show curated USA National Park markers. */
  showNationalParks: boolean
  setShowNationalParks: (next: boolean) => void
  selectedPark: NationalPark | null
  selectPark: (park: NationalPark) => void
  clearPark: () => void
  setBrowse: (next: PeakBrowseFilters) => void
  selectCountry: (country: string) => void
  clearCountry: () => void
  openPeak: (peak: PeakIndex) => void
  skipCinematic: () => void
}

const AtlasContext = createContext<AtlasContextValue | null>(null)

export function AtlasProvider({
  value,
  children,
}: {
  value: AtlasContextValue
  children: ReactNode
}) {
  return <AtlasContext.Provider value={value}>{children}</AtlasContext.Provider>
}

export function useAtlas() {
  const ctx = useContext(AtlasContext)
  if (!ctx) throw new Error('useAtlas must be used within AtlasProvider')
  return ctx
}
