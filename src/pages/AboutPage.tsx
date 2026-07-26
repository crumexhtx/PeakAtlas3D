import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ContentDisclaimer } from '../components/ContentDisclaimer'
import { applyDocumentMeta } from '../lib/documentMeta'
import { prefetchAtlasShell } from '../lib/prefetchAtlas'

export function AboutPage() {
  const { hash } = useLocation()

  useEffect(() => {
    applyDocumentMeta({
      title: 'About — PeakAtlas3D',
      description:
        'Why PeakAtlas3D exists: trip-ready peak guides with difficulty, season, and access — then explore each summit in 3D.',
      path: '/about',
    })
  }, [])

  useEffect(() => {
    if (hash !== '#disclaimer') return
    const el = document.getElementById('disclaimer')
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [hash])

  return (
    <article className="content-article about-article">
      <p className="content-eyebrow">About</p>
      <h1 className="content-title">Built for people who love mountains</h1>
      <p className="content-lede">
        PeakAtlas3D helps you answer a practical question — can I climb this,
        and what do I need to know before I go? — then explore the summit in 3D
        so the trip notes feel real.
      </p>

      <section className="content-section">
        <h2>Our goal</h2>
        <p>
          We want PeakAtlas3D to answer a trip question first — difficulty, best
          season, permits, and prep — then make that answer compelling with 3D
          terrain, not the other way around.
        </p>
        <p>
          From rain-soaked Cascades volcanoes to knife-edge fourteeners and Himalayan
          giants, every summit here is a story of rock, ice, weather, and the people
          who approach it.
        </p>
      </section>

      <section className="content-section">
        <h2>Peaks, places, and the journey around them</h2>
        <p>
          A mountain is never just a coordinate. Gate towns, lodges, trailheads, and
          nearby summits are part of how climbers and travelers plan a peak.
          PeakAtlas3D gathers that surrounding context — access notes, lodging and
          food near the approaches, nearby peaks for multi-summit trips — so the
          atlas feels useful as well as beautiful.
        </p>
        <p>
          The aim is simple: share that information with the world, and with anyone
          who feels drawn to high places — without claiming real-time route safety
          or conditions.
        </p>
      </section>

      <section className="content-section">
        <h2>For fellow mountain people</h2>
        <p>
          Whether you climb, trek, photograph, or simply dream about ridgelines from
          home, this atlas is meant to be shared. Browse a country, open a peak, pass
          a link to a friend who “gets” mountains — the same way summit registers and
          trailhead conversations have always worked.
        </p>
        <p>
          For product updates, see the{' '}
          <Link to="/releases">Releases</Link> page.
        </p>
      </section>

      <ContentDisclaimer />

      <p className="content-cta-row">
        <Link
          to="/"
          className="content-cta"
          onMouseEnter={prefetchAtlasShell}
          onFocus={prefetchAtlasShell}
        >
          Open the atlas
        </Link>
        <Link to="/contact" className="content-cta content-cta-secondary">
          Send feedback
        </Link>
      </p>
    </article>
  )
}
