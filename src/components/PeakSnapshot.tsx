import type { Peak } from '../types/peak'
import { buildPeakSnapshot } from '../lib/peakSnapshot'
import { comparisonsForPeak, comparisonHref } from '../lib/comparisons'
import { Link } from 'react-router-dom'

type PeakSnapshotBoxProps = {
  peak: Peak
}

/**
 * Dated proprietary planning snapshot — answer-first + catalog metrics.
 * Mirrored in prerender HTML for crawlability without JS.
 */
export function PeakSnapshotBox({ peak }: PeakSnapshotBoxProps) {
  const snapshot = buildPeakSnapshot(peak)
  const related = comparisonsForPeak(peak.id).slice(0, 3)

  return (
    <section
      className="info-block peak-snapshot"
      aria-label={`${peak.name} planning snapshot`}
    >
      <h2 className="info-heading">Planning snapshot</h2>
      <p className="peak-snapshot-answer">{snapshot.answer}</p>
      <dl className="peak-snapshot-grid">
        {snapshot.metrics.map((m) => (
          <div key={m.label}>
            <dt>{m.label}</dt>
            <dd>{m.value}</dd>
          </div>
        ))}
      </dl>
      <p className="peak-snapshot-meta">
        <span className="peak-snapshot-asof">As of {snapshot.asOf}</span>
        {' · '}
        <span className="peak-snapshot-method">{snapshot.methodology}</span>
      </p>
      {related.length > 0 && (
        <p className="peak-snapshot-compare">
          Compare:{' '}
          {related.map((c, i) => (
            <span key={c.slug}>
              {i > 0 ? ' · ' : ''}
              <Link to={comparisonHref(c.slug)}>{c.title}</Link>
            </span>
          ))}
        </p>
      )}
    </section>
  )
}
