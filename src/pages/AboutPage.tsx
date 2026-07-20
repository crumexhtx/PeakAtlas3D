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
        'Why PeakAtlas3D exists: celebrating the world’s mountain peaks and sharing the places that surround them.',
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
        PeakAtlas3D is a living atlas of the world’s great summits — a place to wander
        the globe, drop into a peak, and feel how extraordinary these mountains are.
      </p>

      <section className="content-section">
        <h2>Our goal</h2>
        <p>
          Mountains shape climates, cultures, and the way people move through a
          landscape. We want PeakAtlas3D to celebrate that — not as a dry list of
          elevations, but as a visual, explorable atlas that makes each peak feel
          present and worth knowing.
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
          small restaurants are part of how climbers and travelers experience a peak.
          PeakAtlas3D gathers that surrounding context — lodging and food near the
          approaches, nearby places on the map — so the atlas feels useful as well as
          beautiful.
        </p>
        <p>
          The aim is simple: share that information with the world, and with anyone
          who feels drawn to high places.
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
