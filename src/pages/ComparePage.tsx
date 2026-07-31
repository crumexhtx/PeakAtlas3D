import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { loadFullCatalog } from '../data/catalog'
import { applyDocumentMeta } from '../lib/documentMeta'
import {
  comparisonHref,
  getComparisonBySlug,
  resolveComparison,
} from '../lib/comparisons'
import { peakHref } from '../lib/routes'
import type { Peak } from '../types/peak'

export function ComparePage() {
  const { compareSlug = '' } = useParams<{ compareSlug: string }>()
  const [peaks, setPeaks] = useState<Peak[] | null>(null)
  const def = getComparisonBySlug(compareSlug)

  useEffect(() => {
    let cancelled = false
    loadFullCatalog().then((all) => {
      if (!cancelled) setPeaks(all)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const resolved = useMemo(() => {
    if (!def || !peaks) return null
    const byId = new Map(peaks.map((p) => [p.id, p]))
    return resolveComparison(def, byId)
  }, [def, peaks])

  useEffect(() => {
    if (!def) {
      applyDocumentMeta({
        title: 'Comparison not found · PeakAtlas3D',
        description: 'That peak comparison is not in the PeakAtlas3D guide set.',
        path: `/compare/${encodeURIComponent(compareSlug)}`,
        robots: 'noindex, nofollow',
      })
      return
    }
    applyDocumentMeta({
      title: `${def.title} — Peak comparison | PeakAtlas3D`,
      description: def.summary.slice(0, 300),
      path: comparisonHref(def.slug),
    })
  }, [def, compareSlug])

  if (!def) {
    return (
      <article className="content-article">
        <p className="content-eyebrow">Compare</p>
        <h1 className="content-title">Comparison not found</h1>
        <p className="content-lede">
          That A vs B page is not in the PeakAtlas3D comparison set.
        </p>
        <p>
          <Link to="/compare">All comparisons</Link>
        </p>
      </article>
    )
  }

  if (!resolved) {
    return (
      <article className="content-article">
        <p className="content-eyebrow">Compare</p>
        <h1 className="content-title">{def.title}</h1>
        <p className="content-lede" role="status">
          Loading catalog metrics…
        </p>
      </article>
    )
  }

  const { a, b, metrics, asOf, methodology, summary, pickA, pickB, verdict, query } =
    resolved

  return (
    <article className="content-article compare-article">
      <p className="content-eyebrow">Compare</p>
      <h1 className="content-title">{def.title}</h1>
      <p className="content-lede compare-query">
        <strong>{query}</strong>
      </p>
      <p className="content-lede">{summary}</p>
      <p className="peak-snapshot-meta">
        <span className="peak-snapshot-asof">As of {asOf}</span>
        {' · '}
        <span className="peak-snapshot-method">{methodology}</span>
      </p>

      <section className="content-section" aria-label="Side-by-side metrics">
        <h2>How do the catalog numbers compare?</h2>
        <p>
          Same formulas as each peak’s planning snapshot — so the table stays
          consistent with the trip guides and 3D atlas.
        </p>
        <div className="compare-table-wrap">
          <table className="compare-table">
            <thead>
              <tr>
                <th scope="col">Metric</th>
                <th scope="col">{a.name}</th>
                <th scope="col">{b.name}</th>
              </tr>
            </thead>
            <tbody>
              {metrics.map((row) => (
                <tr key={row.label}>
                  <th scope="row">{row.label}</th>
                  <td>{row.a}</td>
                  <td>{row.b}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="content-section" aria-label="When to pick each">
        <h2>When should you pick each peak?</h2>
        <div className="compare-pick-grid">
          <div>
            <h3>Choose {a.name}</h3>
            <p>{pickA}</p>
          </div>
          <div>
            <h3>Choose {b.name}</h3>
            <p>{pickB}</p>
          </div>
        </div>
      </section>

      <section className="content-section" aria-label="Verdict">
        <h2>What’s the short verdict?</h2>
        <p className="compare-verdict">{verdict}</p>
      </section>

      <section className="content-section" aria-label="Open trip guides">
        <h2>Open the full guides &amp; 3D map</h2>
        <p className="content-cta-row">
          <Link className="content-cta" to={peakHref(a.id)}>
            {a.name} trip guide
          </Link>
          <Link className="content-cta" to={peakHref(b.id)}>
            {b.name} trip guide
          </Link>
          <Link className="content-cta" to="/compare">
            All comparisons
          </Link>
        </p>
      </section>
    </article>
  )
}
