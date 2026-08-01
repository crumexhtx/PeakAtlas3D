import { Link } from 'react-router-dom'

/** Shared disclaimer block for About (full) and content-page footers (compact). */
export function ContentDisclaimer({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <p className="content-footer-disclaimer">
        PeakAtlas3D is for exploration and inspiration — not a climbing guide or
        booking service.{' '}
        <Link to="/about#disclaimer">Full disclaimers</Link>
      </p>
    )
  }

  return (
    <section id="disclaimer" className="content-section disclaimer-section">
      <h2>Disclaimers</h2>
      <p>
        PeakAtlas3D is an educational atlas for exploring mountains. It is{' '}
        <strong>not</strong> a climbing guide, trip planner, or booking platform.
        Conditions change quickly in the mountains — always verify routes,
        weather, permits, and local advice with current, authoritative sources
        before you travel.
      </p>
      <p>
        <strong>Lodging</strong> entries are sourced from{' '}
        <a
          href="https://www.openstreetmap.org/copyright"
          target="_blank"
          rel="noreferrer"
        >
          OpenStreetMap
        </a>{' '}
        contributors when available. They may be incomplete, outdated, or
        incorrectly tagged. Distance notes are approximate from the summit and
        are not recommendations.
      </p>
      <p>
        <strong>Food</strong> listings are illustrative sample places near gate
        towns — not live menus, ratings, or endorsements. Confirm hours and
        availability locally.
      </p>
      <p>
        <strong>Photos</strong> come primarily from Wikimedia Commons. Credits and
        licenses appear on peak galleries when available; follow each work’s
        license if you reuse an image.
      </p>
      <p>
        Elevations, prominence, difficulty grades, first-ascent notes, and
        coordinates are compiled for browsing and may contain errors. Spot a
        mistake?{' '}
        <Link to="/contact">Send a correction</Link>.
      </p>
    </section>
  )
}
