import { useState } from 'react'
import type { Peak } from '../types/peak'
import {
  formatCoordinates,
  formatDistance,
  formatElevation,
} from '../lib/geo'
import { flagUrl } from '../lib/countries'
import { useUnits } from '../context/UnitsContext'

type PeakDossierProps = {
  peak: Peak
}

export function PeakDossier({ peak }: PeakDossierProps) {
  const { units } = useUnits()
  const [showNearby, setShowNearby] = useState(false)
  const flag = flagUrl(peak.country, 40)

  return (
    <aside className="peak-dossier">
      <div className="dossier-top">
        {flag && (
          <img src={flag} alt="" className="dossier-flag" width={36} height={24} />
        )}
        <div>
          <p className="dossier-eyebrow">{peak.country}</p>
          <h1 className="dossier-title">{peak.name}</h1>
          <p className="dossier-subtitle">
            {peak.range}
          </p>
        </div>
      </div>

      <p className="peak-description">{peak.description}</p>

      <section className="info-block">
        <h2 className="info-heading">Peak info</h2>
        <dl className="info-list">
          <div>
            <dt>Elevation</dt>
            <dd>{formatElevation(peak.elevationFt, units)}</dd>
          </div>
          <div>
            <dt>Prominence</dt>
            <dd>{formatElevation(peak.prominenceFt, units)}</dd>
          </div>
          <div>
            <dt>Difficulty</dt>
            <dd>{peak.difficulty}</dd>
          </div>
          <div>
            <dt>First ascent</dt>
            <dd>{peak.firstAscent}</dd>
          </div>
          <div>
            <dt>Coordinates</dt>
            <dd>{formatCoordinates(peak.lat, peak.lon)}</dd>
          </div>
        </dl>
      </section>

      {peak.trails && peak.trails.length > 0 && (
        <section className="info-block">
          <h2 className="info-heading">Notable trails</h2>
          <ul className="plain-list">
            {peak.trails.map((t) => (
              <li key={t.name}>{t.name}</li>
            ))}
          </ul>
        </section>
      )}

      <section className="info-block nearby-block">
        <button
          type="button"
          className="nearby-toggle"
          aria-expanded={showNearby}
          onClick={() => setShowNearby((v) => !v)}
        >
          <span>Nearby context</span>
          <span aria-hidden="true">{showNearby ? '−' : '+'}</span>
        </button>

        {showNearby && (
          <div className="nearby-panel">
            <p className="nearby-summary">
              {peak.nearestTown.name}, {peak.nearestTown.region} ·{' '}
              {formatDistance(peak.nearestTown.distanceMiles, units)}
              {peak.nearestTown.route ? ` via ${peak.nearestTown.route}` : ''}
            </p>
            <h3 className="sub-heading">Sample lodging</h3>
            <ul className="plain-list">
              {peak.hotels.slice(0, 2).map((h) => (
                <li key={h.name}>{h.name}</li>
              ))}
            </ul>
            <h3 className="sub-heading">Sample food</h3>
            <ul className="plain-list">
              {peak.food.slice(0, 2).map((f) => (
                <li key={f.name}>{f.name}</li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </aside>
  )
}
