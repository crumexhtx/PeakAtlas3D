import peaksData from './peaks.json'
import type { Peak } from '../types/peak'

export const peaks = peaksData as Peak[]

export function getPeakById(id: string): Peak | undefined {
  return peaks.find((p) => p.id === id)
}
