import { permitSystems, permitHref } from '../data/permits'
import type { PermitSystem, PermitWindow } from '../types/permit'
import type { PeakIndex } from '../types/peak'
import { primaryCountryName } from './countryPages'
import type { CountrySummary } from '../types/country'

export { permitHref }

const MS_DAY = 24 * 60 * 60 * 1000

export function parseIsoDate(value: string): Date {
  return new Date(`${value}T00:00:00`)
}

function startOfDay(now: Date): Date {
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

export function formatPermitDate(iso: string): string {
  const date = parseIsoDate(iso)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export type WindowWithSystem = {
  system: PermitSystem
  window: PermitWindow
}

export function upcomingWindows(
  systems: PermitSystem[] = permitSystems,
  now = new Date(),
): WindowWithSystem[] {
  const today = startOfDay(now).getTime()
  const rows: WindowWithSystem[] = []
  for (const system of systems) {
    for (const window of system.windows) {
      if (parseIsoDate(window.closes).getTime() >= today) {
        rows.push({ system, window })
      }
    }
  }
  return rows.sort(
    (a, b) =>
      parseIsoDate(a.window.opens).getTime() -
      parseIsoDate(b.window.opens).getTime(),
  )
}

export function isWindowOpenNow(window: PermitWindow, now = new Date()): boolean {
  const today = startOfDay(now).getTime()
  return (
    parseIsoDate(window.opens).getTime() <= today &&
    parseIsoDate(window.closes).getTime() >= today
  )
}

export function openingSoonWindows(
  systems: PermitSystem[] = permitSystems,
  now = new Date(),
  days = 60,
): WindowWithSystem[] {
  const today = startOfDay(now).getTime()
  const horizon = today + days * MS_DAY
  return upcomingWindows(systems, now).filter(({ window }) => {
    const opens = parseIsoDate(window.opens).getTime()
    return opens > today && opens <= horizon
  })
}

export function openNowWindows(
  systems: PermitSystem[] = permitSystems,
  now = new Date(),
): WindowWithSystem[] {
  return upcomingWindows(systems, now).filter(({ window }) =>
    isWindowOpenNow(window, now),
  )
}

export function nextWindow(
  system: PermitSystem,
  now = new Date(),
): PermitWindow | null {
  return upcomingWindows([system], now)[0]?.window ?? null
}

export function windowsOpeningInMonth(
  month: number,
  systems: PermitSystem[] = permitSystems,
  now = new Date(),
): WindowWithSystem[] {
  return upcomingWindows(systems, now).filter(({ window }) => {
    const opens = parseIsoDate(window.opens)
    return opens.getMonth() + 1 === month
  })
}

export function alsoThisMonthLinks(
  month: number,
  now = new Date(),
): { href: string; text: string }[] {
  const seen = new Set<string>()
  const out: { href: string; text: string }[] = []
  for (const { system } of windowsOpeningInMonth(month, permitSystems, now)) {
    if (seen.has(system.id)) continue
    seen.add(system.id)
    out.push({
      href: permitHref(system.id),
      text: `Also this month: ${system.name} opens`,
    })
  }
  return out
}

export function groupWindowsByOpenMonth(rows: WindowWithSystem[]) {
  const groups = new Map<string, WindowWithSystem[]>()
  for (const row of rows) {
    const opens = parseIsoDate(row.window.opens)
    const key = `${opens.getFullYear()}-${String(opens.getMonth() + 1).padStart(2, '0')}`
    const list = groups.get(key) ?? []
    list.push(row)
    groups.set(key, list)
  }
  return [...groups.entries()].map(([key, windows]) => {
    const [year, month] = key.split('-').map(Number)
    const label = new Date(year, (month ?? 1) - 1, 1).toLocaleDateString(
      'en-US',
      { month: 'long', year: 'numeric' },
    )
    return { key, label, windows }
  })
}

export function groupPermitsByCountry(
  systems: PermitSystem[],
  peaks: PeakIndex[],
  summaries: CountrySummary[],
): { country: string; systems: PermitSystem[] }[] {
  const byId = new Map(peaks.map((p) => [p.id, p]))
  const groups = new Map<string, PermitSystem[]>()
  for (const system of systems) {
    const peak = byId.get(system.peakIds[0] ?? '')
    const country = peak
      ? primaryCountryName(peak.country, summaries)
      : 'Other'
    const list = groups.get(country) ?? []
    list.push(system)
    groups.set(country, list)
  }
  return [...groups.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([country, list]) => ({ country, systems: list }))
}

export function metaForPermitsIndex() {
  return {
    title: 'Peak Permit & Lottery Calendar 2026–27 | PeakAtlas3D',
    description:
      'Official permit, lottery, and hut-booking windows for PeakAtlas3D summits — Whitney, Half Dome, Rainier, Denali, Fuji, Aconcagua, and more — with source links and verified dates.',
    path: '/permits',
  }
}

export function metaForPermitSystem(system: PermitSystem) {
  return {
    title: `${system.name} — Permit Guide | PeakAtlas3D`,
    description: system.summary.slice(0, 300),
    path: permitHref(system.id),
  }
}

export function permitsIndexJsonLd(origin: string) {
  return {
    breadcrumb: {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${origin}/` },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Permits',
          item: `${origin}/permits`,
        },
      ],
    },
    itemList: {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Peak permit and lottery systems',
      numberOfItems: permitSystems.length,
      itemListElement: permitSystems.map((system, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `${origin}${permitHref(system.id)}`,
        name: system.name,
      })),
    },
  }
}

export function permitPageJsonLd(system: PermitSystem, origin: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${origin}/` },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Permits',
        item: `${origin}/permits`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: system.name,
        item: `${origin}${permitHref(system.id)}`,
      },
    ],
  }
}

export const PERMIT_DISCLAIMER =
  'Permit dates, fees, and rules change every year. Always confirm on the official agency or booking site before you apply.'
