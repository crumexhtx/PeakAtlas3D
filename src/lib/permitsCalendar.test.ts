import { describe, expect, it } from 'vitest'
import { permitSystems } from '../data/permits'
import {
  alsoThisMonthLinks,
  nextWindow,
  openingSoonWindows,
  openNowWindows,
  windowsOpeningInMonth,
} from './permitsCalendar'

const NOW = new Date(2026, 9, 26) // 26 Oct 2026

function byId(id: string) {
  const system = permitSystems.find((s) => s.id === id)
  if (!system) throw new Error(`missing ${id}`)
  return system
}

describe('permitsCalendar', () => {
  it('finds Whitney lottery as the next dated window after Oct 2026', () => {
    const next = nextWindow(byId('whitney-lottery'), NOW)
    expect(next?.label).toBe('Lottery application')
    expect(next?.opens).toBe('2027-02-01')
  })

  it('lists Aconcagua as opening soon (within 60 days of 26 Oct 2026)', () => {
    const ids = openingSoonWindows(permitSystems, NOW).map((r) => r.system.id)
    expect(ids).toContain('aconcagua-permit')
  })

  it('lists Kilimanjaro tariff year as open now on 26 Oct 2026', () => {
    const ids = openNowWindows(permitSystems, NOW).map((r) => r.system.id)
    expect(ids).toContain('kilimanjaro-tanapa')
  })

  it('lists Whitney lottery on the February month page', () => {
    const links = alsoThisMonthLinks(2, NOW)
    expect(links.some((l) => l.href === '/permits/whitney-lottery')).toBe(true)
    const feb = windowsOpeningInMonth(2, permitSystems, NOW)
    expect(feb.some((r) => r.system.id === 'whitney-lottery')).toBe(true)
  })
})
