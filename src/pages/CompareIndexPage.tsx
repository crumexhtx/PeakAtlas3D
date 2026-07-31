import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { loadFullCatalog } from '../data/catalog'
import {
  applyDocumentMeta,
} from '../lib/documentMeta'
import {
  COMPARISON_PAIRS,
  comparisonHref,
  resolveAllComparisons,
} from '../lib/comparisons'
import { CATALOG_AS_OF, CATALOG_METHODOLOGY } from '../lib/peakSnapshot'
import type { Peak } from '../types/peak'

export function CompareIndexPage() {
  const [peaks, setPeaks] = useState<Peak[] | null>(null)

  useEffect(() => {
    applyDocumentMeta({
      title: 'Peak comparisons — PeakAtlas3D',
      description:
        'Side-by-side peak comparisons using PeakAtlas3D catalog metrics: elevation, difficulty tier, season, permits, staging, and mapped lodging.',
      path: '/compare',
    })
  }, [])

  useEffect(() => {
    let cancelled = false
    loadFullCatalog().then((all) => {
      if (!cancelled) setPeaks(all)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const resolved = useMemo(
    () => (peaks ? resolveAllComparisons(peaks) : []),
    [peaks],
  )

  return (
    <article className="content-article">
      <p className="content-eyebrow">Guides</p>
      <h1 className="content-title">Peak comparisons</h1>
      <p className="content-lede">
        High-intent A vs B pages built from the same PeakAtlas3D catalog numbers
        as each peak’s planning snapshot — elevation, difficulty tier, season,
        permits, staging distance, and mapped lodging. As of {CATALOG_AS_OF}.
      </p>
      <p className="content-lede peak-snapshot-method">{CATALOG_METHODOLOGY}</p>

      <section className="content-section" aria-label="Comparison list">
        <h2>Which peaks should you compare?</h2>
        <p>
          Each page opens with a direct answer, a side-by-side metrics table,
          when to pick each peak, a short verdict, and links into the full trip
          guides plus 3D map.
        </p>
        <ul className="compare-index-list">
          {(resolved.length ? resolved : COMPARISON_PAIRS).map((c) => (
            <li key={c.slug}>
              <Link to={comparisonHref(c.slug)}>{c.title}</Link>
              <span className="compare-index-query"> — {c.query}</span>
            </li>
          ))}
        </ul>
      </section>

      <p className="peaks-directory-atlas-link">
        <Link to="/peaks">All peaks</Link>
        {' · '}
        <Link to="/">Open the 3D atlas</Link>
      </p>
    </article>
  )
}
