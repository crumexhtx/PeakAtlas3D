import { useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { peaksIndex } from '../data/catalog'
import { permitSystems, permitHref } from '../data/permits'
import { PermitDisclaimer } from '../components/PermitDisclaimer'
import { buildCountrySummaries } from '../lib/countries'
import { applyDocumentMeta, SITE_ORIGIN } from '../lib/documentMeta'
import { upsertJsonLd } from '../lib/jsonLd'
import { peakHref } from '../lib/routes'
import {
  formatPermitDate,
  groupPermitsByCountry,
  groupWindowsByOpenMonth,
  metaForPermitsIndex,
  openingSoonWindows,
  openNowWindows,
  permitsIndexJsonLd,
  upcomingWindows,
} from '../lib/permitsCalendar'
import type { PermitSystem, PermitWindow } from '../types/permit'

const BREADCRUMB_ID = 'permits-index-breadcrumb-jsonld'
const ITEMLIST_ID = 'permits-index-itemlist-jsonld'

const TYPE_LABEL: Record<PermitSystem['type'], string> = {
  lottery: 'Lottery',
  'advance-reservation': 'Advance reservation',
  registration: 'Registration',
  'fee-only': 'Fee only',
  'guide-required': 'Guide / operator required',
}

function WindowLine({ window }: { window: PermitWindow }) {
  const range =
    window.opens === window.closes
      ? formatPermitDate(window.opens)
      : `${formatPermitDate(window.opens)} – ${formatPermitDate(window.closes)}`
  return (
    <span>
      {window.label}: {range}
      {window.approximate ? ' (approx.)' : ''}
    </span>
  )
}

function SystemBlock({
  system,
  window,
}: {
  system: PermitSystem
  window?: PermitWindow
}) {
  const peaks = peaksIndex.filter((p) => system.peakIds.includes(p.id))
  return (
    <li className="permit-system-item">
      <Link to={permitHref(system.id)} className="permit-system-name">
        {system.name}
      </Link>
      <p className="permit-system-meta">
        {TYPE_LABEL[system.type]} · {system.agency}
      </p>
      {window ? (
        <p className="permit-system-window">
          <WindowLine window={window} />
        </p>
      ) : null}
      <p className="permit-system-peaks">
        {peaks.map((peak, i) => (
          <span key={peak.id}>
            {i > 0 ? ', ' : ''}
            <Link to={peakHref(peak.id)}>{peak.name}</Link>
          </span>
        ))}
      </p>
      <p className="permit-system-links">
        <a
          href={system.bookingUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Official booking (external)
        </a>
        {' · '}
        <a href={system.sourceUrl} target="_blank" rel="noopener noreferrer">
          Verified {system.verifiedOn}
        </a>
      </p>
    </li>
  )
}

export function PermitsIndexPage() {
  const soon = useMemo(() => openingSoonWindows(), [])
  const open = useMemo(() => openNowWindows(), [])
  const upcoming = useMemo(() => upcomingWindows(), [])
  const byMonth = useMemo(
    () => groupWindowsByOpenMonth(upcoming),
    [upcoming],
  )
  const byCountry = useMemo(() => {
    const summaries = buildCountrySummaries(peaksIndex)
    return groupPermitsByCountry(permitSystems, peaksIndex, summaries)
  }, [])

  useEffect(() => {
    applyDocumentMeta(metaForPermitsIndex())
  }, [])

  useEffect(() => {
    const ld = permitsIndexJsonLd(SITE_ORIGIN)
    upsertJsonLd(BREADCRUMB_ID, ld.breadcrumb)
    upsertJsonLd(ITEMLIST_ID, ld.itemList)
    return () => {
      upsertJsonLd(BREADCRUMB_ID, null)
      upsertJsonLd(ITEMLIST_ID, null)
    }
  }, [])

  return (
    <article className="content-article permit-article">
      <p className="content-eyebrow">Access calendar</p>
      <h1 className="content-title">Peak Permit &amp; Lottery Calendar 2026–27</h1>
      <p className="content-lede">
        Dated windows from official agency and booking pages for PeakAtlas3D
        summits. Fees and rules change — follow the source link before you
        apply.
      </p>
      <PermitDisclaimer />

      <section className="content-section" aria-label="Opening soon">
        <h2>Opening soon</h2>
        {soon.length === 0 ? (
          <p>No windows open in the next 60 days on the current file.</p>
        ) : (
          <ul className="permit-system-list">
            {soon.map(({ system, window }) => (
              <SystemBlock
                key={`${system.id}-${window.label}`}
                system={system}
                window={window}
              />
            ))}
          </ul>
        )}
      </section>

      <section className="content-section" aria-label="Open now">
        <h2>Open now</h2>
        {open.length === 0 ? (
          <p>No dated windows are open today.</p>
        ) : (
          <ul className="permit-system-list">
            {open.map(({ system, window }) => (
              <SystemBlock
                key={`${system.id}-${window.label}-open`}
                system={system}
                window={window}
              />
            ))}
          </ul>
        )}
      </section>

      <section className="content-section" aria-label="Upcoming by month">
        <h2>Upcoming windows</h2>
        {byMonth.map((group) => (
          <div key={group.key} className="permit-month-group">
            <h3>{group.label}</h3>
            <ul className="permit-system-list">
              {group.windows.map(({ system, window }) => (
                <SystemBlock
                  key={`${system.id}-${window.label}-m`}
                  system={system}
                  window={window}
                />
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section className="content-section" aria-label="All permit systems">
        <h2>All permit systems by country</h2>
        {byCountry.map(({ country, systems }) => (
          <div key={country} className="permit-month-group">
            <h3>{country}</h3>
            <ul className="permit-system-list">
              {systems.map((system) => (
                <SystemBlock key={system.id} system={system} />
              ))}
            </ul>
          </div>
        ))}
      </section>
    </article>
  )
}
