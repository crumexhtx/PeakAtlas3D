import type { Peak } from '../types/peak'
import { formatElevation } from '../lib/geo'

type DetailSidebarProps = {
  peak: Peak | null
  showTrails: boolean
  onClose: () => void
}

export function DetailSidebar({ peak, showTrails, onClose }: DetailSidebarProps) {
  return (
    <aside className={`detail-sidebar ${peak ? 'is-open' : ''}`} aria-live="polite">
      {!peak ? (
        <div className="sidebar-empty">
          <h2 className="sidebar-title">Select a peak</h2>
          <p className="sidebar-copy">
            Click a gold marker on the globe or search for a mountain, range, or
            nearby town.
          </p>
        </div>
      ) : (
        <div className="sidebar-content" key={peak.id}>
          <div className="sidebar-top">
            <div>
              <p className="sidebar-eyebrow">Selected Peak</p>
              <h2 className="sidebar-title">{peak.name}</h2>
            </div>
            <button type="button" className="icon-btn" onClick={onClose} aria-label="Close details">
              ×
            </button>
          </div>

          <section className="info-block">
            <h3 className="info-heading">Peak Info</h3>
            <dl className="info-list">
              <div>
                <dt>Name</dt>
                <dd>
                  {peak.name}, {peak.country}
                </dd>
              </div>
              <div>
                <dt>Elevation</dt>
                <dd>{formatElevation(peak.elevationFt)}</dd>
              </div>
              <div>
                <dt>Range</dt>
                <dd>{peak.range}</dd>
              </div>
            </dl>
          </section>

          <section className="info-block">
            <h3 className="info-heading">Nearest High Town</h3>
            <dl className="info-list">
              <div>
                <dt>Town</dt>
                <dd>
                  {peak.nearestTown.name}, {peak.nearestTown.region}
                </dd>
              </div>
              <div>
                <dt>Distance</dt>
                <dd>
                  {peak.nearestTown.distanceMiles} miles
                  {peak.nearestTown.route ? ` (${peak.nearestTown.route})` : ''}
                </dd>
              </div>
            </dl>
          </section>

          <section className="info-block">
            <h3 className="info-heading">Local Amenities</h3>
            <div className="amenity-tabs" role="presentation">
              <span className="amenity-chip">Hotels</span>
              <span className="amenity-chip">Food</span>
            </div>

            <h4 className="sub-heading">Top Rated Hotels / Beds</h4>
            <ol className="ranked-list">
              {peak.hotels.map((h) => (
                <li key={h.name}>
                  <span>{h.name}</span>
                  {h.rating != null && (
                    <span className="rating">{h.rating.toFixed(1)}</span>
                  )}
                </li>
              ))}
            </ol>

            <h4 className="sub-heading">Food Nearby</h4>
            <ol className="ranked-list">
              {peak.food.map((f) => (
                <li key={f.name}>
                  <span>{f.name}</span>
                  {f.rating != null && (
                    <span className="rating">{f.rating.toFixed(1)}</span>
                  )}
                </li>
              ))}
            </ol>
          </section>

          {showTrails && peak.trails && peak.trails.length > 0 && (
            <section className="info-block">
              <h3 className="info-heading">Trails</h3>
              <ul className="plain-list">
                {peak.trails.map((t) => (
                  <li key={t.name}>{t.name}</li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </aside>
  )
}
