import { Link } from 'react-router-dom'
import {
  MONTH_ABBREV,
  MONTH_SLUGS,
  bestPeaksHref,
  monthNumberFromSlug,
} from '../lib/bestPeaks'
import { resolvePeakSeason } from '../lib/seasonMonths'
import type { PeakIndex } from '../types/peak'

type BestMonthsStripProps = {
  peak: PeakIndex
}

/** 12 month pills; in-season months link to `/best-peaks/{month}`. */
export function BestMonthsStrip({ peak }: BestMonthsStripProps) {
  const season = resolvePeakSeason(peak)
  return (
    <nav className="best-months-strip" aria-label="Best months">
      <span className="best-months-strip-label">Best months</span>
      <ul className="best-months-strip-list">
        {MONTH_SLUGS.map((slug) => {
          const month = monthNumberFromSlug(slug)
          const inSeason = month != null && season.months.includes(month)
          if (inSeason) {
            return (
              <li key={slug}>
                <Link
                  to={bestPeaksHref(slug)}
                  className="best-months-pill is-in-season"
                >
                  {MONTH_ABBREV[slug]}
                </Link>
              </li>
            )
          }
          return (
            <li key={slug}>
              <span className="best-months-pill">{MONTH_ABBREV[slug]}</span>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
