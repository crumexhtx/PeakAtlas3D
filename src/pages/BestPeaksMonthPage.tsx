import { useEffect, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { peaksIndex } from '../data/catalog'
import { MonthSwitcher } from '../components/MonthSwitcher'
import { buildCountrySummaries } from '../lib/countries'
import { primaryCountryName } from '../lib/countryPages'
import {
  MONTH_LABELS,
  MONTH_SLUGS,
  bestPeaksHref,
  bestPeaksMonthJsonLd,
  countryHrefForPeak,
  groupMonthPeaksByTier,
  headlinePeakNames,
  metaForBestPeaksMonth,
  monthCounts,
  monthIntro,
  monthNumberFromSlug,
  peaksInMonth,
  type MonthSlug,
} from '../lib/bestPeaks'
import { applyDocumentMeta, SITE_ORIGIN } from '../lib/documentMeta'
import { formatElevation } from '../lib/geo'
import { upsertJsonLd } from '../lib/jsonLd'
import { peakHref } from '../lib/routes'
import { useUnits } from '../context/UnitsContext'

const BREADCRUMB_ID = 'best-peaks-month-breadcrumb-jsonld'
const ITEMLIST_ID = 'best-peaks-month-itemlist-jsonld'

function isMonthSlug(value: string): value is MonthSlug {
  return (MONTH_SLUGS as readonly string[]).includes(value)
}

export function BestPeaksMonthPage() {
  const { monthSlug: rawSlug = '' } = useParams<{ monthSlug: string }>()
  const slug = rawSlug.toLowerCase()
  const valid = isMonthSlug(slug)
  const { units } = useUnits()

  const month = valid ? monthNumberFromSlug(slug) : null
  const rows = useMemo(
    () => (month ? peaksInMonth(peaksIndex, month) : []),
    [month],
  )
  const groups = useMemo(() => groupMonthPeaksByTier(rows), [rows])
  const counts = useMemo(() => monthCounts(peaksIndex), [])
  const summaries = useMemo(() => buildCountrySummaries(peaksIndex), [])
  const intros = valid ? monthIntro(slug) : []
  const headlines = useMemo(() => headlinePeakNames(rows, 3), [rows])
  const countriesInSeason = useMemo(() => {
    const seen = new Map<string, string>()
    for (const { peak } of rows) {
      const name = primaryCountryName(peak.country, summaries)
      if (!seen.has(name)) seen.set(name, countryHrefForPeak(peak, summaries))
    }
    return [...seen.entries()].sort((a, b) => a[0].localeCompare(b[0]))
  }, [rows, summaries])

  useEffect(() => {
    if (!valid) {
      applyDocumentMeta({
        title: 'Month not found · PeakAtlas3D',
        description:
          'That month page is not in the PeakAtlas3D best-peaks calendar.',
        path: `/best-peaks/${encodeURIComponent(rawSlug)}`,
        robots: 'noindex, nofollow',
      })
      return
    }
    applyDocumentMeta(metaForBestPeaksMonth(slug, rows.length, headlines))
  }, [valid, slug, rawSlug, rows.length, headlines])

  useEffect(() => {
    if (!valid) {
      upsertJsonLd(BREADCRUMB_ID, null)
      upsertJsonLd(ITEMLIST_ID, null)
      return
    }
    const ld = bestPeaksMonthJsonLd(slug, rows, SITE_ORIGIN)
    upsertJsonLd(BREADCRUMB_ID, ld.breadcrumb)
    upsertJsonLd(ITEMLIST_ID, ld.itemList)
    return () => {
      upsertJsonLd(BREADCRUMB_ID, null)
      upsertJsonLd(ITEMLIST_ID, null)
    }
  }, [valid, slug, rows])

  if (!valid) {
    return (
      <article className="content-article">
        <p className="content-eyebrow">Season calendar</p>
        <h1 className="content-title">Month not found</h1>
        <p className="content-lede">
          Best-peaks pages run January through December.
        </p>
        <p>
          <Link to={bestPeaksHref()}>All months</Link>
        </p>
      </article>
    )
  }

  const label = MONTH_LABELS[slug]

  return (
    <article className="content-article best-peaks-article">
      <p className="content-eyebrow">
        <Link to={bestPeaksHref()}>Best peaks</Link>
        {' / '}
        {label}
      </p>
      <h1 className="content-title">Best Peaks to Climb in {label}</h1>
      <p className="content-lede">
        {rows.length} catalog summit{rows.length === 1 ? '' : 's'} list {label}{' '}
        in their published season window.
      </p>
      {intros.map((paragraph) => (
        <p key={paragraph.slice(0, 32)} className="best-peaks-intro">
          {paragraph}
        </p>
      ))}

      <MonthSwitcher current={slug} counts={counts} />

      {countriesInSeason.length > 0 && (
        <section className="content-section" aria-label="Countries in season">
          <h2>Countries in season</h2>
          <ul className="country-directory-list">
            {countriesInSeason.map(([name, href]) => (
              <li key={name}>
                <Link to={href}>{name}</Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {groups.map((group) => (
        <section
          key={group.tier}
          className="content-section best-peaks-tier"
          aria-label={group.label}
        >
          <h2>
            {group.label}{' '}
            <span className="peaks-directory-count">({group.peaks.length})</span>
          </h2>
          <ul className="best-peaks-list">
            {group.peaks.map(({ peak, shoulder }) => (
              <li key={peak.id} className="best-peaks-row">
                <Link to={peakHref(peak.id)} className="peaks-directory-link">
                  <span className="peaks-directory-name">{peak.name}</span>
                  <span className="peaks-directory-meta">
                    {formatElevation(peak.elevationFt, units)}
                    {peak.difficulty ? ` · ${peak.difficulty}` : ''}
                    {peak.bestSeason ? ` · ${peak.bestSeason}` : ''}
                    {shoulder ? (
                      <span className="best-peaks-shoulder">
                        {' '}
                        shoulder month
                      </span>
                    ) : null}
                  </span>
                </Link>
                <Link
                  to={countryHrefForPeak(peak, summaries)}
                  className="best-peaks-country"
                >
                  {peak.country}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <p className="peaks-directory-atlas-link">
        <Link to="/peaks">All peaks</Link>
        {' · '}
        <Link to={bestPeaksHref()}>All months</Link>
        {' · '}
        <Link to="/">Open the 3D atlas</Link>
      </p>
    </article>
  )
}
