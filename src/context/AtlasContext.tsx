import { createContext, useContext, type ReactNode } from 'react'
import type { Peak } from '../types/peak'
import type { PeakBrowseFilters } from '../types/peak'

export type AtlasMode = 'world' | 'country' | 'peak'

export type AtlasContextValue = {
  mode: AtlasMode
  browse: PeakBrowseFilters
  selectedCountry: string | null
  activePeak: Peak | null
  mapPeaks: Peak[]
  cinematic: boolean
  cinematicStatus: string
  /** Hide chrome so only the globe and flags remain. */
  earthOnly: boolean
  setEarthOnly: (next: boolean) => void
  setBrowse: (next: PeakBrowseFilters) => void
  selectCountry: (country: string) => void
  clearCountry: () => void
  openPeak: (peak: Peak) => void
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
