import { useMemo, useState } from 'react'
import type { Amenity, Peak } from '../types/peak'
import { formatDistance } from '../lib/geo'
import { useUnits } from '../context/UnitsContext'
import { PeakPhotoGallery } from './PeakPhotoGallery'
import { PeakSeoLayout } from './PeakSeoLayout'

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
  const photos = useMemo(() => peakPhotos(peak), [peak])

  const lodging = peak.hotels ?? []
  const food = peak.food ?? []
  const lodgingFromOsm =
    lodging.length > 0 && lodging.every((h) => isOsmAmenity(h))
  const hasStaySection = lodging.length > 0 || food.length > 0

  return (
    <PeakSeoLayout
      peak={peak}
      units={units}
      media={
        !deferMedia ? (
          <PeakPhotoGallery name={peak.name} photos={photos} />
        ) : undefined
      }
    >
      {peak.trails && peak.trails.length > 0 && (
        <section
          className="info-block"
          aria-label={`Notable trails near ${peak.name}`}
        >
          <h2 className="info-heading">Notable trails & routes</h2>
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
            aria-controls={`lodging-food-${peak.id}`}
            onClick={() => setShowNearby((v) => !v)}
          >
            <span>Lodging & food</span>
            <span aria-hidden="true">{showNearby ? '−' : '+'}</span>
          </button>

          {showNearby && (
            <div className="nearby-panel" id={`lodging-food-${peak.id}`}>
              <p className="nearby-summary">
                Most trips stage through {peak.nearestTown.name},{' '}
                {peak.nearestTown.region}
                {peak.nearestTown.route ? ` via ${peak.nearestTown.route}` : ''}
                {' · '}
                {formatDistance(peak.nearestTown.distanceMiles, units)} from the
                summit area.
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
                      . Coverage varies; always confirm availability before you
                      travel.
                    </p>
                  ) : (
                    <p className="amenity-disclaimer">
                      Sample lodging suggestions — not verified listings or
                      ratings.
                    </p>
                  )}
                  <ul className="amenity-list">
                    {lodging.map((h) => (
                      <AmenityRow
                        key={`${h.name}-${h.sourceUrl ?? ''}`}
                        item={h}
                      />
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
    </PeakSeoLayout>
  )
}
