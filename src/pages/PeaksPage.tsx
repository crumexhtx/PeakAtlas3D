import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { peaksIndex } from '../data/catalog'
import {
  MONTH_LABELS,
  MONTH_SLUGS,
  bestPeaksHref,
  monthNumberFromSlug,
  type MonthSlug,
} from '../lib/bestPeaks'
import { buildCountrySummaries } from '../lib/countries'
import { countryHref, peaksForCountry } from '../lib/countryPages'
import { applyDocumentMeta } from '../lib/documentMeta'
import { formatElevation } from '../lib/geo'
import { peakHref } from '../lib/routes'
import { resolvePeakSeason } from '../lib/seasonMonths'
import { useUnits } from '../context/UnitsContext'

/** Crawl hub — every peak as a real <a href> for Search Console indexing. */
export function PeaksPage() {
  const { units } = useUnits()
  const [monthFilter, setMonthFilter] = useState<MonthSlug | ''>('')

  useEffect(() => {
    applyDocumentMeta({
      title: 'All peaks — PeakAtlas3D',
      description:
        'Browse every summit in the PeakAtlas3D catalog — trip readiness, difficulty, season, and 3D terrain for each peak.',
      path: '/peaks',
    })
  }, [])

  const summaries = useMemo(() => buildCountrySummaries(peaksIndex), [])
  const monthNumber = monthFilter ? monthNumberFromSlug(monthFilter) : null

  const byCountry = useMemo(() => {
    return summaries
      .map((summary) => {
        const peaks = peaksForCountry(
          peaksIndex,
          summary.name,
          summaries,
        ).filter((peak) => {
          if (monthNumber == null) return true
          return resolvePeakSeason(peak).months.includes(monthNumber)
        })
        return { summary, peaks }
      })
      .filter((group) => group.peaks.length > 0)
  }, [summaries, monthNumber])

  return (
    <article className="content-article peaks-directory-article">
      <p className="content-eyebrow">Catalog</p>
      <h1 className="content-title">All peaks</h1>
      <p className="content-lede">
        {peaksIndex.length} trip-ready summit guides across {summaries.length}{' '}
        countries — open any peak for difficulty, season, permits, and the 3D
        atlas view.
      </p>
      <p className="peaks-directory-atlas-link">
        <Link to="/">Open the 3D atlas</Link>
        {' · '}
        <Link to={bestPeaksHref()}>Best peaks by month</Link>
      </p>

      <div className="peaks-directory-filters">
        <label className="peaks-month-filter">
          Month
          <select
            value={monthFilter}
            onChange={(e) =>
              setMonthFilter((e.target.value || '') as MonthSlug | '')
            }
          >
            <option value="">All months</option>
            {MONTH_SLUGS.map((slug) => (
              <option key={slug} value={slug}>
                {MONTH_LABELS[slug]}
              </option>
            ))}
          </select>
        </label>
        {monthFilter ? (
          <Link to={bestPeaksHref(monthFilter)} className="peaks-month-filter-link">
            See all peaks for {MONTH_LABELS[monthFilter]}
          </Link>
        ) : null}
      </div>

      {byCountry.map(({ summary, peaks }) => (
        <section
          key={summary.name}
          className="content-section peaks-directory-section"
          aria-label={summary.name}
        >
          <h2>
            <Link to={countryHref(summary)} className="peaks-directory-country">
              {summary.name}
            </Link>{' '}
            <span className="peaks-directory-count">({peaks.length})</span>
          </h2>
          <ul className="peaks-directory-list">
            {peaks.map((peak) => (
              <li key={peak.id}>
                <Link
                  to={peakHref(peak.id, summary.name)}
                  className="peaks-directory-link"
                >
                  <span className="peaks-directory-name">{peak.name}</span>
                  <span className="peaks-directory-meta">
                    {formatElevation(peak.elevationFt, units)} · {peak.range}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </article>
  )
}
