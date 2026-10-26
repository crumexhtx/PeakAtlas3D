import { useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { peaksIndex } from '../data/catalog'
import { MonthSwitcher } from '../components/MonthSwitcher'
import {
  MONTH_LABELS,
  MONTH_SLUGS,
  bestPeaksHref,
  bestPeaksIndexJsonLd,
  currentMonthSlug,
  metaForBestPeaksIndex,
  monthCounts,
  monthIntro,
} from '../lib/bestPeaks'
import { applyDocumentMeta, SITE_ORIGIN } from '../lib/documentMeta'
import { upsertJsonLd } from '../lib/jsonLd'

const BREADCRUMB_ID = 'best-peaks-index-breadcrumb-jsonld'
const ITEMLIST_ID = 'best-peaks-index-itemlist-jsonld'

export function BestPeaksIndexPage() {
  const counts = useMemo(() => monthCounts(peaksIndex), [])
  const nowSlug = currentMonthSlug()
  const nowIntro = monthIntro(nowSlug)
  const nowCount = counts[nowSlug]

  useEffect(() => {
    applyDocumentMeta(metaForBestPeaksIndex())
  }, [])

  useEffect(() => {
    const ld = bestPeaksIndexJsonLd(SITE_ORIGIN)
    upsertJsonLd(BREADCRUMB_ID, ld.breadcrumb)
    upsertJsonLd(ITEMLIST_ID, ld.itemList)
    return () => {
      upsertJsonLd(BREADCRUMB_ID, null)
      upsertJsonLd(ITEMLIST_ID, null)
    }
  }, [])

  return (
    <article className="content-article best-peaks-article">
      <p className="content-eyebrow">Season calendar</p>
      <h1 className="content-title">Best peaks to climb by month</h1>
      <p className="content-lede">
        Twelve planning pages built from each summit’s published best season in
        the PeakAtlas3D catalog — not a generic hemisphere guess. Open a month
        for difficulty groups, country links, and the 3D trip guides.
      </p>

      <section
        className="content-section best-peaks-now"
        aria-label="In season now"
      >
        <h2>In season now — {MONTH_LABELS[nowSlug]}</h2>
        <p>
          {nowCount} catalog summit{nowCount === 1 ? '' : 's'} list{' '}
          {MONTH_LABELS[nowSlug]} in their season window.
        </p>
        {nowIntro.slice(0, 1).map((paragraph) => (
          <p key={paragraph.slice(0, 24)}>{paragraph}</p>
        ))}
        <p>
          <Link to={bestPeaksHref(nowSlug)}>
            Best peaks to climb in {MONTH_LABELS[nowSlug]}
          </Link>
        </p>
      </section>

      <section className="content-section" aria-label="All months">
        <h2>All months</h2>
        <ul className="best-peaks-month-index">
          {MONTH_SLUGS.map((slug) => (
            <li
              key={slug}
              className={
                slug === nowSlug ? 'best-peaks-month-card is-now' : 'best-peaks-month-card'
              }
            >
              <Link to={bestPeaksHref(slug)}>
                <span className="best-peaks-month-name">
                  {MONTH_LABELS[slug]}
                </span>
                <span className="peaks-directory-count">
                  {counts[slug]} peak{counts[slug] === 1 ? '' : 's'}
                  {slug === nowSlug ? ' · in season now' : ''}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <MonthSwitcher counts={counts} />

      <p className="peaks-directory-atlas-link">
        <Link to="/peaks">All peaks</Link>
        {' · '}
        <Link to="/">Open the 3D atlas</Link>
      </p>
    </article>
  )
}
