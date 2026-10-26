import permitsRaw from './permits.json'
import type { PermitSystem } from '../types/permit'

export const permitSystems = permitsRaw as PermitSystem[]

export function permitsForPeak(peakId: string): PermitSystem[] {
  return permitSystems.filter((entry) => entry.peakIds.includes(peakId))
}

export function getPermitById(id: string): PermitSystem | undefined {
  return permitSystems.find((entry) => entry.id === id)
}

export function permitHref(id?: string | null): string {
  if (!id) return '/permits'
  return `/permits/${id}`
}
