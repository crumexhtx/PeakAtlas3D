import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import type { UnitSystem } from '../types/peak'

type UnitsContextValue = {
  units: UnitSystem
  setUnits: (units: UnitSystem) => void
}

const UnitsContext = createContext<UnitsContextValue | null>(null)

export function UnitsProvider({ children }: { children: ReactNode }) {
  const [units, setUnits] = useState<UnitSystem>('imperial')
  const value = useMemo(() => ({ units, setUnits }), [units])
  return <UnitsContext.Provider value={value}>{children}</UnitsContext.Provider>
}

export function useUnits() {
  const ctx = useContext(UnitsContext)
  if (!ctx) throw new Error('useUnits must be used within UnitsProvider')
  return ctx
}
