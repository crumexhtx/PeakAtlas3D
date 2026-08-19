import { useMemo } from 'react'
import type { Amenity, Peak } from '../types/peak'
import { formatDistance } from '../lib/geo'
import { useUnits } from '../context/UnitsContext'
import {
  peakHasTrailRoutes,
  peakTrailRoutesForPeak,
  routeDetailNote,
  trailSourcesForPeak,
} from '../data/peakTrailRoutes'
import {
  closestPlacesLead,
  lodgingLead,
  trailsLead,
} from '../lib/peakSectionLeads'
import { trailLabelsForPeak } from './TrailMarkers'

type PeakTripPanelProps = {
  peak: Peak
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

/**
 * Left-side trip panel: staging towns, routes, and stay/eat — shared by every peak.
 */
export function PeakTripPanel({ peak }: PeakTripPanelProps) {
  const { units } = useUnits()
  const curatedRoutes = useMemo(
    () => peakTrailRoutesForPeak(peak.id),
    [peak.id],
  )
  const trailLabels = useMemo(() => trailLabelsForPeak(peak), [peak])
  const trailSources = useMemo(
    () => trailSourcesForPeak(peak.id),
    [peak.id],
  )

  const lodging = peak.hotels ?? []
  const food = peak.food ?? []
  const lodgingFromOsm =
    lodging.length > 0 && lodging.every((h) => isOsmAmenity(h))
  const foodFromOsm = food.length > 0 && food.every((f) => isOsmAmenity(f))
  const hasCuratedRoutes = peakHasTrailRoutes(peak.id)
  const hasPopularTrails = trailLabels.length > 0
  const primarySource = trailSources[0]
  const showReferences =
    trailSources.length > 0 || lodgingFromOsm || foodFromOsm

  const placesLead = closestPlacesLead(peak)
  const trailsSection = trailsLead(peak)
  const lodgingSection = lodgingLead(peak)

  const nearby = peak.nearbyPlaces?.length
    ? peak.nearbyPlaces
    : peak.nearestTown
      ? [peak.nearestTown]
      : []

  return (
    <article
      className="peak-dossier peak-trip-dossier"
      aria-label={`Trip planning for ${peak.name}`}
    >
      {nearby.length > 0 && (
        <section
          className="info-block"
          aria-label={`Staging towns near ${peak.name}`}
        >
          <h2 className="info-heading">{placesLead.heading}</h2>
          <p className="section-answer-lead">{placesLead.answer}</p>
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

      <section
        className="info-block"
        aria-label={`Routes on ${peak.name}`}
      >
        <h2 className="info-heading">{trailsSection.heading}</h2>
        <p className="section-answer-lead">{trailsSection.answer}</p>
        {hasPopularTrails ? (
          hasCuratedRoutes && primarySource ? (
            <>
              <p className="trail-source-credit">
                Route details from{' '}
                <a
                  className="trail-dossier-link"
                  href={primarySource.home}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {primarySource.label}
                </a>
                . Tap a route for the full page.
              </p>
              <ul className="plain-list trail-label-list">
                {curatedRoutes.map((route) => (
                  <li key={`${route.name}-${route.sourceUrl}`}>
                    <a
                      className="trail-bubble-label trail-bubble-label-link"
                      href={route.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {route.name}
                    </a>
                    <span className="trail-dossier-note">
                      {' '}
                      — {routeDetailNote(route)} ·{' '}
                      <a
                        className="trail-dossier-link"
                        href={route.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {route.sourceLabel}
                      </a>
                    </span>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <ul className="plain-list trail-label-list">
              {trailLabels.map((t) => (
                <li key={t.name}>
                  <span className="trail-bubble-label">{t.name}</span>
                  {t.note ? (
                    <span className="trail-dossier-note"> — {t.note}</span>
                  ) : null}
                </li>
              ))}
            </ul>
          )
        ) : (
          <p className="amenity-empty">
            No catalogued route names for {peak.name} yet. Check agency pages,
            local guides, and recent trip reports before you commit to an
            approach.
          </p>
        )}
      </section>

      <section
        className="info-block nearby-block"
        aria-label={`Lodging and dining near ${peak.name}`}
      >
        <h2 className="info-heading">{lodgingSection.heading}</h2>
        <p className="section-answer-lead">{lodgingSection.answer}</p>
        <p className="nearby-summary">
          Most trips stage through {peak.nearestTown.name},{' '}
          {peak.nearestTown.region}
          {peak.nearestTown.route ? ` via ${peak.nearestTown.route}` : ''}
          {' · '}
          {formatDistance(peak.nearestTown.distanceMiles, units)} from the
          summit area.
        </p>

        {lodging.length > 0 ? (
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
                Sample lodging suggestions — not verified listings or ratings.
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
        ) : (
          <>
            <h3 className="sub-heading">Lodging</h3>
            <p className="amenity-empty">
              No mapped lodging near this summit yet. Most parties stage in{' '}
              {peak.nearestTown.name}
              {peak.nearestTown.region ? `, ${peak.nearestTown.region}` : ''}{' '}
              and confirm beds before travel — remote and high-alpine approaches
              often have none at the trailhead.
            </p>
          </>
        )}

        {food.length > 0 && (
          <>
            <h3 className="sub-heading">Food & dining</h3>
            {foodFromOsm ? (
              <p className="amenity-disclaimer">
                Nearby dining from{' '}
                <a
                  href="https://www.openstreetmap.org/copyright"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  OpenStreetMap
                </a>
                . Listings may be outdated — always confirm hours and
                availability before you travel.
              </p>
            ) : (
              <p className="amenity-disclaimer">
                Curated dining suggestions — always confirm hours and
                availability before you travel.
              </p>
            )}
            <ul className="amenity-list">
              {food.map((f) => (
                <AmenityRow key={f.name} item={f} />
              ))}
            </ul>
          </>
        )}
      </section>

      {showReferences && (
        <section className="info-block">
          <h2 className="info-heading">References</h2>
          <ul className="plain-list reference-list">
            {trailSources.map((source) => (
              <li key={`${source.label}-${source.home}`}>
                <a
                  className="trail-dossier-link"
                  href={source.home}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {source.label}
                </a>
                <span className="trail-dossier-note">
                  {source.label === '14ers.com'
                    ? ' — Colorado route descriptions, trailheads, and GPX (account required for downloads). PeakAtlas lists popular route names only; always verify conditions before you climb.'
                    : ' — Official or agency route information for popular approaches. PeakAtlas lists trail names and outbound links only; always verify conditions, permits, and current status before you climb.'}
                </span>
              </li>
            ))}
            {(lodgingFromOsm || foodFromOsm) && (
              <li>
                <a
                  className="trail-dossier-link"
                  href="https://www.openstreetmap.org/copyright"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  OpenStreetMap
                </a>
                <span className="trail-dossier-note">
                  {' '}
                  — nearby{' '}
                  {lodgingFromOsm && foodFromOsm
                    ? 'lodging and dining'
                    : lodgingFromOsm
                      ? 'lodging'
                      : 'dining'}{' '}
                  points. Coverage varies; confirm availability before you
                  travel.
                </span>
              </li>
            )}
          </ul>
        </section>
      )}
    </article>
  )
}
