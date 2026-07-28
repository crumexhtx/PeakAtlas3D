import { useEffect, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { peaksIndex } from '../data/catalog'
import { buildCountrySummaries, flagUrl } from '../lib/countries'
import {
  countryHref,
  countrySlug,
  findCountrySummaryBySlug,
  peaksForCountry,
} from '../lib/countryPages'
import {
  applyDocumentMeta,
  metaForCountry,
  metaForMissingCountry,
} from '../lib/documentMeta'
import { formatElevation } from '../lib/geo'
import { atlasHref, peakHref } from '../lib/routes'
import { useUnits } from '../context/UnitsContext'

/**
 * Static country landing page at `/countries/:countrySlug`.
 * Peak list uses the same ISO-merge filter as `?country=` on the globe.
 */
export function CountryPage() {
  const { countrySlug: rawSlug = '' } = useParams<{ countrySlug: string }>()
  const { units } = useUnits()

  const summaries = useMemo(() => buildCountrySummaries(peaksIndex), [])
  const summary = useMemo(
    () => findCountrySummaryBySlug(rawSlug, summaries),
    [rawSlug, summaries],
  )

  const countryPeaks = useMemo(() => {
    if (!summary) return []
    return peaksForCountry(peaksIndex, summary.name, summaries)
  }, [summary, summaries])

  const otherCountries = useMemo(() => {
    if (!summary) return summaries
    return summaries.filter((s) => s.name !== summary.name)
  }, [summaries, summary])

  useEffect(() => {
    if (!summary) {
      applyDocumentMeta(metaForMissingCountry(rawSlug || 'unknown'))
      return
    }
    applyDocumentMeta(
      metaForCountry({
        name: summary.name,
        slug: countrySlug(summary.name),
        peakCount: summary.peakCount,
        highestName: summary.highestPeak.name,
        highestElevationFt: summary.highestPeak.elevationFt,
        ranges: summary.ranges,
      }),
    )
  }, [summary, rawSlug])

  if (!summary) {
    return (
      <article className="content-article peaks-directory-article">
        <p className="content-eyebrow">Countries</p>
        <h1 className="content-title">Country not found</h1>
        <p className="content-lede">
          That country is not in the PeakAtlas3D catalog yet.
        </p>
        <p className="peaks-directory-atlas-link">
          <Link to="/peaks">Browse all peaks</Link>
          {' · '}
          <Link to="/">Open the 3D atlas</Link>
        </p>
        <section className="content-section" aria-label="Countries">
          <h2>All countries</h2>
          <ul className="country-directory-list">
            {summaries.map((s) => (
              <li key={s.name}>
                <Link to={countryHref(s)}>{s.name}</Link>
                <span className="peaks-directory-count"> ({s.peakCount})</span>
              </li>
            ))}
          </ul>
        </section>
      </article>
    )
  }

  const flag = flagUrl(summary.name, 40)

  return (
    <article className="content-article peaks-directory-article country-landing">
      <p className="content-eyebrow">Countries</p>
      <header className="country-landing-header">
        {flag && (
          <img
            src={flag}
            alt=""
            width={40}
            height={28}
            className="country-landing-flag"
            decoding="async"
          />
        )}
        <div>
          <h1 className="content-title">{summary.name} peaks</h1>
          <p className="content-lede">
            {summary.peakCount} trip-ready summit
            {summary.peakCount === 1 ? '' : 's'} in the PeakAtlas3D catalog
            {summary.ranges.length
              ? ` — including ${summary.ranges.slice(0, 3).join(', ')}${
                  summary.ranges.length > 3 ? ', and more' : ''
                }`
              : ''}
            . Highest: {summary.highestPeak.name} (
            {formatElevation(summary.highestPeak.elevationFt, units)}).
          </p>
        </div>
      </header>

      <p className="peaks-directory-atlas-link">
        <Link to={atlasHref(summary.name)}>Open {summary.name} on the 3D atlas</Link>
        {' · '}
        <Link to="/peaks">All peaks</Link>
      </p>

      <section
        className="content-section peaks-directory-section"
        aria-label={`${summary.name} peaks`}
      >
        <h2>
          Peaks in {summary.name}{' '}
          <span className="peaks-directory-count">({countryPeaks.length})</span>
        </h2>
        <ul className="peaks-directory-list">
          {countryPeaks.map((peak) => (
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

      <section
        className="content-section country-landing-others"
        aria-label="Other countries"
      >
        <h2>Other countries</h2>
        <ul className="country-directory-list">
          {otherCountries.map((s) => (
            <li key={s.name}>
              <Link to={countryHref(s)}>{s.name}</Link>
              <span className="peaks-directory-count"> ({s.peakCount})</span>
            </li>
          ))}
        </ul>
      </section>
    </article>
  )
}
