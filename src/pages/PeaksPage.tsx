import { useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { peaksIndex } from '../data/catalog'
import { applyDocumentMeta } from '../lib/documentMeta'
import { formatElevation } from '../lib/geo'
import { useUnits } from '../context/UnitsContext'

/** Crawl hub — every peak as a real <a href> for Search Console indexing. */
export function PeaksPage() {
  const { units } = useUnits()

  useEffect(() => {
    applyDocumentMeta({
      title: 'All peaks — PeakAtlas3D',
      description:
        'Browse every summit in the PeakAtlas3D catalog — trip readiness, difficulty, season, and 3D terrain for each peak.',
      path: '/peaks',
    })
  }, [])

  const byCountry = useMemo(() => {
    const map = new Map<string, typeof peaksIndex>()
    const sorted = [...peaksIndex].sort((a, b) => a.name.localeCompare(b.name))
    for (const peak of sorted) {
      const country = peak.country || 'Other'
      const list = map.get(country)
      if (list) list.push(peak)
      else map.set(country, [peak])
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b))
  }, [])

  return (
    <article className="content-article peaks-directory-article">
      <p className="content-eyebrow">Catalog</p>
      <h1 className="content-title">All peaks</h1>
      <p className="content-lede">
        {peaksIndex.length} trip-ready summit guides — open any peak for
        difficulty, season, permits, and the 3D atlas view.
      </p>
      <p className="peaks-directory-atlas-link">
        <Link to="/">Open the 3D atlas</Link>
      </p>

      {byCountry.map(([country, peaks]) => (
        <section
          key={country}
          className="content-section peaks-directory-section"
          aria-label={country}
        >
          <h2>
            {country}{' '}
            <span className="peaks-directory-count">({peaks.length})</span>
          </h2>
          <ul className="peaks-directory-list">
            {peaks.map((peak) => (
              <li key={peak.id}>
                <Link to={`/peak/${peak.id}`} className="peaks-directory-link">
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
