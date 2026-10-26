/**
 * Crawlable HTML + meta for /permits and /permits/{id}.
 * Keep grouping in sync with src/lib/permitsCalendar.ts.
 */
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '../..')
export const permitSystems = JSON.parse(
  readFileSync(join(root, 'src', 'data', 'permits.json'), 'utf8'),
)

export const PERMIT_DISCLAIMER =
  'Permit dates, fees, and rules change every year. Always confirm on the official agency or booking site before you apply.'

const TYPE_LABEL = {
  lottery: 'Lottery',
  'advance-reservation': 'Advance reservation',
  registration: 'Registration',
  'fee-only': 'Fee only',
  'guide-required': 'Guide / operator required',
}

const MS_DAY = 24 * 60 * 60 * 1000

export function permitHref(id) {
  if (!id) return '/permits'
  return `/permits/${id}`
}

export function permitsForPeak(peakId) {
  return permitSystems.filter((entry) => entry.peakIds.includes(peakId))
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function escapeAttr(value) {
  return escapeHtml(value).replaceAll("'", '&#39;')
}

function parseIsoDate(value) {
  const [y, m, d] = String(value).split('-').map(Number)
  return new Date(y, (m ?? 1) - 1, d ?? 1)
}

function startOfDay(now) {
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

function formatPermitDate(iso) {
  return parseIsoDate(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function formatWindow(window) {
  const range =
    window.opens === window.closes
      ? formatPermitDate(window.opens)
      : `${formatPermitDate(window.opens)} – ${formatPermitDate(window.closes)}`
  return `${window.label}: ${range}${window.approximate ? ' (approx.)' : ''}`
}

function upcomingWindows(systems = permitSystems, now = new Date()) {
  const today = startOfDay(now).getTime()
  const rows = []
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

function isWindowOpenNow(window, now = new Date()) {
  const today = startOfDay(now).getTime()
  return (
    parseIsoDate(window.opens).getTime() <= today &&
    parseIsoDate(window.closes).getTime() >= today
  )
}

function openingSoonWindows(systems = permitSystems, now = new Date(), days = 60) {
  const today = startOfDay(now).getTime()
  const horizon = today + days * MS_DAY
  return upcomingWindows(systems, now).filter(({ window }) => {
    const opens = parseIsoDate(window.opens).getTime()
    return opens > today && opens <= horizon
  })
}

function openNowWindows(systems = permitSystems, now = new Date()) {
  return upcomingWindows(systems, now).filter(({ window }) =>
    isWindowOpenNow(window, now),
  )
}

export function windowsOpeningInMonth(
  month,
  systems = permitSystems,
  now = new Date(),
) {
  return upcomingWindows(systems, now).filter(({ window }) => {
    const opens = parseIsoDate(window.opens)
    return opens.getMonth() + 1 === month
  })
}

function groupWindowsByOpenMonth(rows) {
  const groups = new Map()
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

function groupPermitsByCountry(systems, peaks) {
  const byId = new Map(peaks.map((p) => [p.id, p]))
  const groups = new Map()
  for (const system of systems) {
    const peak = byId.get(system.peakIds[0] ?? '')
    const country = peak?.country || 'Other'
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

export function metaForPermitSystem(system) {
  return {
    title: `${system.name} — Permit Guide | PeakAtlas3D`,
    description: String(system.summary).slice(0, 300),
    path: permitHref(system.id),
  }
}

function peakLinksHtml(system, peaksById, siteUrl) {
  return system.peakIds
    .map((id) => peaksById.get(id))
    .filter(Boolean)
    .map(
      (peak, i) =>
        `${i > 0 ? ', ' : ''}<a href="${escapeAttr(siteUrl)}/peak/${escapeAttr(peak.id)}">${escapeHtml(peak.name)}</a>`,
    )
    .join('')
}

function systemItemHtml(system, siteUrl, peaksById, window) {
  const windowLine = window
    ? `<p>${escapeHtml(formatWindow(window))}</p>`
    : ''
  const peaks = peakLinksHtml(system, peaksById, siteUrl)
  return `<li>
      <p><a href="${escapeAttr(siteUrl)}${escapeAttr(permitHref(system.id))}">${escapeHtml(system.name)}</a></p>
      <p>${escapeHtml(TYPE_LABEL[system.type] || system.type)} · ${escapeHtml(system.agency)}</p>
      ${windowLine}
      <p>${peaks}</p>
      <p>
        <a href="${escapeAttr(system.bookingUrl)}" rel="noopener noreferrer" target="_blank">Official booking (external)</a>
        ·
        <a href="${escapeAttr(system.sourceUrl)}" rel="noopener noreferrer" target="_blank">Verified ${escapeHtml(system.verifiedOn)}</a>
      </p>
    </li>`
}

function listHtml(rows, siteUrl, peaksById) {
  if (rows.length === 0) return '<p>None on the current file.</p>'
  return `<ul>${rows
    .map(({ system, window }) =>
      systemItemHtml(system, siteUrl, peaksById, window),
    )
    .join('')}</ul>`
}

export function alsoThisMonthHtml(month, siteUrl, now = new Date()) {
  const seen = new Set()
  const items = []
  for (const { system } of windowsOpeningInMonth(month, permitSystems, now)) {
    if (seen.has(system.id)) continue
    seen.add(system.id)
    items.push(
      `<li><a href="${escapeAttr(siteUrl)}${escapeAttr(permitHref(system.id))}">Also this month: ${escapeHtml(system.name)} opens</a></li>`,
    )
  }
  if (items.length === 0) return ''
  return `<section aria-label="Permits this month">
        <h2>Permits</h2>
        <ul>${items.join('')}</ul>
      </section>`
}

export function permitsIndexHtml(peaks, siteUrl) {
  const peaksById = new Map(peaks.filter((p) => p?.id).map((p) => [p.id, p]))
  const soon = openingSoonWindows()
  const open = openNowWindows()
  const upcoming = upcomingWindows()
  const byMonth = groupWindowsByOpenMonth(upcoming)
  const byCountry = groupPermitsByCountry(permitSystems, peaks)

  const monthSections = byMonth
    .map(
      (group) => `<h3>${escapeHtml(group.label)}</h3>
        ${listHtml(group.windows, siteUrl, peaksById)}`,
    )
    .join('')

  const countrySections = byCountry
    .map(
      (group) => `<h3>${escapeHtml(group.country)}</h3>
        <ul>${group.systems
          .map((system) => systemItemHtml(system, siteUrl, peaksById))
          .join('')}</ul>`,
    )
    .join('')

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${siteUrl}/` },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Permits',
        item: `${siteUrl}/permits`,
      },
    ],
  }
  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Peak permit and lottery systems',
    numberOfItems: permitSystems.length,
    itemListElement: permitSystems.map((system, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `${siteUrl}${permitHref(system.id)}`,
      name: system.name,
    })),
  }

  const inner = `<main style="font-family: system-ui, sans-serif; max-width: 42rem; margin: 2rem auto; padding: 0 1rem;">
        <h1>Peak Permit &amp; Lottery Calendar 2026–27</h1>
        <p>Dated windows from official agency and booking pages for PeakAtlas3D summits. Fees and rules change — follow the source link before you apply.</p>
        <p>${escapeHtml(PERMIT_DISCLAIMER)}</p>
        <section aria-label="Opening soon">
          <h2>Opening soon</h2>
          ${listHtml(soon, siteUrl, peaksById)}
        </section>
        <section aria-label="Open now">
          <h2>Open now</h2>
          ${listHtml(open, siteUrl, peaksById)}
        </section>
        <section aria-label="Upcoming windows">
          <h2>Upcoming windows</h2>
          ${monthSections}
        </section>
        <section aria-label="All permit systems">
          <h2>All permit systems by country</h2>
          ${countrySections}
        </section>
        <p><a href="${escapeAttr(siteUrl)}/best-peaks">Best peaks by month</a> · <a href="${escapeAttr(siteUrl)}/peaks">All peaks</a> · <a href="${escapeAttr(siteUrl)}/">Open the 3D atlas</a></p>
      </main>`

  const extraHead = `<script type="application/ld+json">${JSON.stringify(breadcrumb)}</script>
<script type="application/ld+json">${JSON.stringify(itemList)}</script>`
  return { inner, extraHead }
}

export function permitPageHtml(system, peaks, siteUrl) {
  const peaksById = new Map(peaks.filter((p) => p?.id).map((p) => [p.id, p]))
  const peaksLine = peakLinksHtml(system, peaksById, siteUrl)
  const windowItems =
    system.windows.length === 0
      ? '<p>No dated application window is on file — check the official booking page for current availability.</p>'
      : `<ul>${system.windows
          .map((window) => `<li>${escapeHtml(formatWindow(window))}</li>`)
          .join('')}</ul>`
  const fees = system.feesNote
    ? `<p><strong>Fees (as stated by the source):</strong> ${escapeHtml(system.feesNote)}</p>`
    : ''

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${siteUrl}/` },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Permits',
        item: `${siteUrl}/permits`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: system.name,
        item: `${siteUrl}${permitHref(system.id)}`,
      },
    ],
  }

  const inner = `<main style="font-family: system-ui, sans-serif; max-width: 42rem; margin: 2rem auto; padding: 0 1rem;">
        <h1>${escapeHtml(system.name)}</h1>
        <p>${escapeHtml(system.summary)}</p>
        <p>${escapeHtml(PERMIT_DISCLAIMER)}</p>
        <section>
          <h2>What it covers</h2>
          <p>${escapeHtml(TYPE_LABEL[system.type] || system.type)} administered by ${escapeHtml(system.agency)} for the ${escapeHtml(system.season)} season.</p>
          <p>Linked PeakAtlas3D summits: ${peaksLine}.</p>
        </section>
        <section>
          <h2>Who needs it</h2>
          <p>${escapeHtml(system.summary)}</p>
        </section>
        <section>
          <h2>Windows</h2>
          ${windowItems}
        </section>
        <section>
          <h2>How to apply</h2>
          <p>Use the official booking link below. PeakAtlas3D does not sell permits. Read the source page for group size, ID, and payment rules before you start an application.</p>
          ${fees}
          <p><a href="${escapeAttr(system.bookingUrl)}" rel="noopener noreferrer" target="_blank">Official booking (external)</a></p>
        </section>
        <section>
          <h2>Source</h2>
          <p><a href="${escapeAttr(system.sourceUrl)}" rel="noopener noreferrer" target="_blank">Official source</a> · Verified ${escapeHtml(system.verifiedOn)}</p>
        </section>
        <p><a href="${escapeAttr(siteUrl)}/permits">All permit systems</a> · <a href="${escapeAttr(siteUrl)}/">Open the 3D atlas</a></p>
      </main>`

  const extraHead = `<script type="application/ld+json">${JSON.stringify(breadcrumb)}</script>`
  return { inner, extraHead }
}

export function peakPermitsHtml(peakId, siteUrl) {
  const systems = permitsForPeak(peakId)
  if (systems.length === 0) return ''
  const items = systems
    .map((system) => {
      const upcoming = upcomingWindows([system])[0]
      const next = upcoming
        ? ` Next window: ${escapeHtml(formatWindow(upcoming.window))}.`
        : ''
      return `<li><a href="${escapeAttr(siteUrl)}${escapeAttr(permitHref(system.id))}">${escapeHtml(system.name)}</a>${next}</li>`
    })
    .join('')
  return `<section aria-label="Permits">
          <h2>Permits</h2>
          <ul>${items}</ul>
        </section>`
}
