import type { Amenity, PeakPhoto } from '../types/peak'
import type { NationalPark } from '../types/nationalPark'
import { formatDistance } from '../lib/geo'
import { useUnits } from '../context/UnitsContext'
import { DetailsSheet } from './DetailsSheet'
import { PeakPhotoGallery } from './PeakPhotoGallery'

type ParkPanelProps = {
  park: NationalPark
  onClose: () => void
}

function parkPhotos(park: NationalPark): PeakPhoto[] {
  if (park.photos?.length) return park.photos
  if (park.photo?.url) return [park.photo]
  return []
}

function AmenityRow({ item }: { item: Amenity }) {
  return (
    <li className="amenity-row">
      <div className="amenity-row-top">
        <span className="amenity-name">{item.name}</span>
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

export function ParkPanel({ park, onClose }: ParkPanelProps) {
  const { units } = useUnits()
  const photos = parkPhotos(park)
  const trails = park.trails ?? []
  const food = park.food ?? []
  const town = park.nearestTown

  return (
    <div className="country-panel-shell park-panel-shell">
      <DetailsSheet
        resetKey={park.id}
        title={park.name}
        subtitle={`${park.state} · est. ${park.established}`}
        onClose={onClose}
        closeLabel="Back to parks"
      >
        <aside className="country-panel park-panel" aria-label={`${park.name} guide`}>
          <div className="country-panel-top">
            <div className="country-panel-heading">
              <span className="park-panel-badge" aria-hidden="true">
                NP
              </span>
              <div>
                <p className="dossier-eyebrow">National Park</p>
                <h2 className="country-panel-title">{park.name}</h2>
              </div>
            </div>
            <button
              type="button"
              className="icon-btn country-panel-desktop-close"
              onClick={onClose}
              aria-label="Back to parks"
            >
              ×
            </button>
          </div>

          {photos.length > 0 && (
            <PeakPhotoGallery name={park.name} photos={photos} />
          )}

          <dl className="info-list country-stats">
            <div>
              <dt>State</dt>
              <dd>{park.state}</dd>
            </div>
            <div>
              <dt>Established</dt>
              <dd>{park.established}</dd>
            </div>
            <div>
              <dt>Area</dt>
              <dd>{park.areaSqMi.toLocaleString()} sq mi</dd>
            </div>
            <div>
              <dt>Best season</dt>
              <dd>{park.bestSeason}</dd>
            </div>
            <div>
              <dt>Entrance fee</dt>
              <dd>{park.feeRequired ? 'Yes' : 'No fee'}</dd>
            </div>
            <div>
              <dt>Staging</dt>
              <dd>
                {town.name}
                <span className="stat-meta">
                  {formatDistance(town.distanceMiles, units)}
                  {town.route ? ` · ${town.route}` : ''}
                </span>
              </dd>
            </div>
          </dl>

          {park.feeNotes && <p className="park-fee-notes">{park.feeNotes}</p>}

          {park.whyNotable && (
            <p className="park-why-notable">{park.whyNotable}</p>
          )}

          {park.description && (
            <p className="park-description">{park.description}</p>
          )}

          {trails.length > 0 && (
            <>
              <h3 className="info-heading">Trails & overlooks</h3>
              <ul className="amenity-list">
                {trails.map((t) => (
                  <AmenityRow key={t.name} item={t} />
                ))}
              </ul>
            </>
          )}

          {food.length > 0 && (
            <>
              <h3 className="info-heading">Food nearby</h3>
              <ul className="amenity-list">
                {food.map((f) => (
                  <AmenityRow key={f.name} item={f} />
                ))}
              </ul>
            </>
          )}

          <button type="button" className="back-world-btn" onClick={onClose}>
            ← Back to parks
          </button>
        </aside>
      </DetailsSheet>
    </div>
  )
}
