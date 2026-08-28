import { Link } from 'react-router-dom'
import { useMemo } from 'react'
import { peaksIndex } from '../data/catalog'
import { formatDistance, formatElevation } from '../lib/geo'
import { nearbyPeaksFor } from '../lib/nearbyPeaks'
import { useUnits } from '../context/UnitsContext'
import type { Peak } from '../types/peak'

type NearbyPeaksProps = {
  peak: Peak
  country?: string | null
}

/** Internal links to 3–5 nearby summits for multi-peak trip planning + SEO. */
export function NearbyPeaks({ peak }: NearbyPeaksProps) {
  const { units } = useUnits()
  const nearby = useMemo(
    () => nearbyPeaksFor(peak, peaksIndex, 5),
    [peak],
  )
  if (nearby.length === 0) return null

  return (
    <section
      className="info-block nearby-peaks"
      aria-label={`Peaks near ${peak.name}`}
    >
      <h2 className="info-heading">Nearby peaks</h2>
      <p className="nearby-peaks-lede">
        Other atlas summits close by — useful for linking a multi-peak trip.
      </p>
      <ul className="nearby-peaks-list">
        {nearby.map((p) => (
          <li key={p.id}>
            <Link className="nearby-peaks-link" to={`/peak/${p.id}`}>
              <span className="nearby-peaks-name">{p.name}</span>
              <span className="nearby-peaks-meta">
                {formatElevation(p.elevationFt, units)}
                {' · '}
                {formatDistance(p.distanceMiles, units)}
                {p.difficulty ? ` · ${p.difficulty}` : ''}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
