import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Amenity, Peak } from '../types/peak'
import {
  formatCoordinates,
  formatDistance,
  formatElevation,
} from '../lib/geo'
import { flagUrl } from '../lib/countries'
import { useUnits } from '../context/UnitsContext'
import { PeakPhotoGallery } from './PeakPhotoGallery'

type PeakDossierProps = {
  peak: Peak
  /** Skip mounting the photo gallery (e.g. during peak cinematic) to free decode/bandwidth. */
  deferMedia?: boolean
}

function peakPhotos(peak: Peak) {
  if (peak.photos?.length) return peak.photos
  if (peak.photo?.url) return [peak.photo]
  return []
}

function isOsmAmenity(item: Amenity) {
  return item.source === 'OpenStreetMap' && Boolean(item.sourceUrl)
}

function AmenityRow({ item }: { item: Amenity }) {
  const sourced = isOsmAmenity(item)

  return (
    <li className="amenity-row">
      <div className="amenity-row-top">
        {sourced ? (
          <a
            className="amenity-name amenity-name-link"
            href={item.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {item.name}
          </a>
        ) : (
          <span className="amenity-name">{item.name}</span>
        )}
      </div>
      {(item.category || item.note) && (
        <p className="amenity-meta">
          {item.category && <span className="amenity-category">{item.category}</span>}
          {item.category && item.note ? ' · ' : ''}
          {item.note}
        </p>
      )}
    </li>
  )
}

export function PeakDossier({ peak, deferMedia = false }: PeakDossierProps) {
  const { units } = useUnits()
  const [showNearby, setShowNearby] = useState(false)
  const flag = flagUrl(peak.country, 40)
  const photos = useMemo(() => peakPhotos(peak), [peak])
  const nearby = peak.nearbyPlaces?.length
    ? peak.nearbyPlaces
    : peak.nearestTown
      ? [peak.nearestTown]
      : []

  const lodging = peak.hotels ?? []
  const food = peak.food ?? []
  const lodgingFromOsm =
    lodging.length > 0 && lodging.every((h) => isOsmAmenity(h))
  const hasStaySection = lodging.length > 0 || food.length > 0

  return (
    <aside className="peak-dossier">
      <Link to="/" className="dossier-back-globe">
        ⬅️ Back to Global Globe
      </Link>

      <div className="dossier-top">
        {flag && (
          <img src={flag} alt="" className="dossier-flag" width={36} height={24} />
        )}
        <div>
          <p className="dossier-eyebrow">{peak.country}</p>
          <h1 className="dossier-title">{peak.name}</h1>
          <p className="dossier-subtitle">{peak.range}</p>
          {peak.aliases && peak.aliases.length > 0 && (
            <p className="dossier-aliases">
              Also known as {peak.aliases.join(' · ')}
            </p>
          )}
        </div>
      </div>

      {!deferMedia && <PeakPhotoGallery name={peak.name} photos={photos} />}

      {peak.whyNotable && (
        <p className="peak-why-notable">{peak.whyNotable}</p>
      )}

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
          {peak.bestSeason && (
            <div>
              <dt>Best season</dt>
              <dd>{peak.bestSeason}</dd>
            </div>
          )}
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

      {nearby.length > 0 && (
        <section className="info-block">
          <h2 className="info-heading">Closest places</h2>
          <ul className="nearby-places-list">
            {nearby.map((place) => (
              <li key={`${place.name}-${place.lat}`}>
                <span className="nearby-places-name">{place.name}</span>
                <span className="nearby-places-meta">
                  {place.region} · {formatDistance(place.distanceMiles, units)}
                  {place.route ? ` · ${place.route}` : ''}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

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

      {hasStaySection && (
        <section className="info-block nearby-block">
          <button
            type="button"
            className="nearby-toggle"
            aria-expanded={showNearby}
            onClick={() => setShowNearby((v) => !v)}
          >
            <span>Lodging & food</span>
            <span aria-hidden="true">{showNearby ? '−' : '+'}</span>
          </button>

          {showNearby && (
            <div className="nearby-panel">
              <p className="nearby-summary">
                Most trips stage through {peak.nearestTown.name},{' '}
                {peak.nearestTown.region}
                {peak.nearestTown.route ? ` via ${peak.nearestTown.route}` : ''}
                {' · '}
                {formatDistance(peak.nearestTown.distanceMiles, units)} from the summit
                area.
              </p>

              {lodging.length > 0 && (
                <>
                  <h3 className="sub-heading">Lodging</h3>
                  {lodgingFromOsm ? (
                    <p className="amenity-disclaimer">
                      Nearby lodging from{' '}
                      <a
                        href="https://www.openstreetmap.org/copyright"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        OpenStreetMap
                      </a>
                      . Coverage varies; always confirm availability before you travel.
                    </p>
                  ) : (
                    <p className="amenity-disclaimer">
                      Sample lodging suggestions — not verified listings or ratings.
                    </p>
                  )}
                  <ul className="amenity-list">
                    {lodging.map((h) => (
                      <AmenityRow key={`${h.name}-${h.sourceUrl ?? ''}`} item={h} />
                    ))}
                  </ul>
                </>
              )}

              {food.length > 0 && (
                <>
                  <h3 className="sub-heading">Sample food</h3>
                  <p className="amenity-disclaimer">
                    Sample food suggestions — not verified listings or ratings.
                  </p>
                  <ul className="amenity-list">
                    {food.map((f) => (
                      <AmenityRow key={f.name} item={f} />
                    ))}
                  </ul>
                </>
              )}
            </div>
          )}
        </section>
      )}
    </aside>
  )
}
