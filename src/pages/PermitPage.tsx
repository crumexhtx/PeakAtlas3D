import { useEffect, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { peaksIndex } from '../data/catalog'
import { getPermitById, permitHref } from '../data/permits'
import { PermitDisclaimer } from '../components/PermitDisclaimer'
import { applyDocumentMeta, SITE_ORIGIN } from '../lib/documentMeta'
import { upsertJsonLd } from '../lib/jsonLd'
import { peakHref } from '../lib/routes'
import {
  formatPermitDate,
  metaForPermitSystem,
  permitPageJsonLd,
} from '../lib/permitsCalendar'

const BREADCRUMB_ID = 'permit-page-breadcrumb-jsonld'

const TYPE_LABEL = {
  lottery: 'Lottery',
  'advance-reservation': 'Advance reservation',
  registration: 'Registration',
  'fee-only': 'Fee only',
  'guide-required': 'Guide / operator required',
} as const

export function PermitPage() {
  const { permitId = '' } = useParams<{ permitId: string }>()
  const system = getPermitById(permitId)
  const peaks = useMemo(
    () =>
      system
        ? peaksIndex.filter((p) => system.peakIds.includes(p.id))
        : [],
    [system],
  )

  useEffect(() => {
    if (!system) {
      applyDocumentMeta({
        title: 'Permit not found · PeakAtlas3D',
        description: 'That permit system is not in the PeakAtlas3D calendar.',
        path: `/permits/${encodeURIComponent(permitId)}`,
        robots: 'noindex, nofollow',
      })
      return
    }
    applyDocumentMeta(metaForPermitSystem(system))
  }, [system, permitId])

  useEffect(() => {
    if (!system) {
      upsertJsonLd(BREADCRUMB_ID, null)
      return
    }
    upsertJsonLd(BREADCRUMB_ID, permitPageJsonLd(system, SITE_ORIGIN))
    return () => upsertJsonLd(BREADCRUMB_ID, null)
  }, [system])

  if (!system) {
    return (
      <article className="content-article">
        <p className="content-eyebrow">Permits</p>
        <h1 className="content-title">Permit not found</h1>
        <p>
          <Link to={permitHref()}>All permit systems</Link>
        </p>
      </article>
    )
  }

  return (
    <article className="content-article permit-article">
      <p className="content-eyebrow">
        <Link to={permitHref()}>Permits</Link>
        {' / '}
        {system.name}
      </p>
      <h1 className="content-title">{system.name}</h1>
      <p className="content-lede">{system.summary}</p>
      <PermitDisclaimer />

      <section className="content-section">
        <h2>What it covers</h2>
        <p>
          {TYPE_LABEL[system.type]} administered by {system.agency} for the{' '}
          {system.season} season.
        </p>
        <p>
          Linked PeakAtlas3D summits:{' '}
          {peaks.map((peak, i) => (
            <span key={peak.id}>
              {i > 0 ? ', ' : ''}
              <Link to={peakHref(peak.id)}>{peak.name}</Link>
            </span>
          ))}
          .
        </p>
      </section>

      <section className="content-section">
        <h2>Who needs it</h2>
        <p>{system.summary}</p>
      </section>

      <section className="content-section">
        <h2>Windows</h2>
        {system.windows.length === 0 ? (
          <p>
            No dated application window is on file — check the official booking
            page for current availability.
          </p>
        ) : (
          <ul>
            {system.windows.map((window) => (
              <li key={window.label}>
                <strong>{window.label}:</strong>{' '}
                {window.opens === window.closes
                  ? formatPermitDate(window.opens)
                  : `${formatPermitDate(window.opens)} – ${formatPermitDate(window.closes)}`}
                {window.approximate ? ' (approx.)' : ''}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="content-section">
        <h2>How to apply</h2>
        <p>
          Use the official booking link below. PeakAtlas3D does not sell
          permits. Read the source page for group size, ID, and payment rules
          before you start an application.
        </p>
        {system.feesNote ? (
          <p>
            <strong>Fees (as stated by the source):</strong> {system.feesNote}
          </p>
        ) : null}
        <p>
          <a
            href={system.bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Official booking (external)
          </a>
        </p>
      </section>

      <section className="content-section">
        <h2>Source</h2>
        <p>
          <a href={system.sourceUrl} target="_blank" rel="noopener noreferrer">
            Official source
          </a>
          {' · '}
          Verified {system.verifiedOn}
          {system.status === 'unverified' ? ' · marked unverified' : ''}
        </p>
      </section>
    </article>
  )
}
