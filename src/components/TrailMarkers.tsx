import { useMemo } from 'react'
import { Marker } from 'react-map-gl/maplibre'
import {
  peakTrailRoutesForPeak,
  routeDetailNote,
  type PeakTrailRoute,
} from '../data/peakTrailRoutes'
import type { Amenity, Peak } from '../types/peak'

const MAX_TRAILS = 2

/** US catalog rows use "USA" (and occasional variants). */
export function isUsPeak(peak: Peak | null | undefined): boolean {
  if (!peak?.country) return false
  return /^(USA|United States)\b/i.test(peak.country.trim())
}

export type TrailLabel = {
  name: string
  note?: string
  lat?: number
  lon?: number
  sourceUrl?: string
  sourceLabel?: string
}

function routeToLabel(route: PeakTrailRoute): TrailLabel {
  return {
    name: route.name,
    note: routeDetailNote(route),
    sourceUrl: route.sourceUrl,
    sourceLabel: route.sourceLabel,
  }
}

/** Prefer curated route links; otherwise catalog trail names. */
export function trailLabelsForPeak(peak: Peak): TrailLabel[] {
  const curated = peakTrailRoutesForPeak(peak.id).slice(0, MAX_TRAILS)
  if (curated.length) return curated.map(routeToLabel)

  return (peak.trails ?? [])
    .filter((t): t is Amenity & { name: string } => Boolean(t?.name))
    .slice(0, MAX_TRAILS)
    .map((t) => ({
      name: t.name,
      note: t.note,
      lat: t.lat,
      lon: t.lon,
    }))
}

/** Use real trail coords when present; otherwise fan labels near the summit. */
export function trailMarkerPosition(
  peak: Peak,
  trail: TrailLabel,
  index: number,
): [number, number] {
  if (
    typeof trail.lat === 'number' &&
    typeof trail.lon === 'number' &&
    Number.isFinite(trail.lat) &&
    Number.isFinite(trail.lon)
  ) {
    return [trail.lon, trail.lat]
  }

  // ~700m offsets so labels sit on the mountain, not on the summit pin.
  const bearingDeg = index === 0 ? -48 : 42
  const meters = 720
  const rad = (bearingDeg * Math.PI) / 180
  const metersPerDegLat = 111_320
  const metersPerDegLon = 111_320 * Math.cos((peak.lat * Math.PI) / 180)
  const dLat = (meters * Math.cos(rad)) / metersPerDegLat
  const dLon = (meters * Math.sin(rad)) / metersPerDegLon
  return [peak.lon + dLon, peak.lat + dLat]
}

type TrailMarkersProps = {
  peak: Peak
}

function TrailBubble({ trail }: { trail: TrailLabel }) {
  const title = trail.note ? `${trail.name} — ${trail.note}` : trail.name
  const source = trail.sourceLabel ?? 'Trail'
  const label = (
    <>
      <span className="trail-marker-label">
        <span className="trail-marker-kicker">{source}</span>
        <span className="trail-marker-name">{trail.name}</span>
      </span>
      <span className="trail-marker-pin" aria-hidden="true" />
    </>
  )

  if (trail.sourceUrl) {
    return (
      <a
        className="trail-marker trail-marker-link"
        href={trail.sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        title={`${title} · Open on ${source}`}
        aria-label={`${trail.name} on ${source}`}
        onClick={(e) => e.stopPropagation()}
      >
        {label}
      </a>
    )
  }

  return (
    <div className="trail-marker" title={title}>
      {label}
    </div>
  )
}

/** Bubble labels for popular trails — HTML markers only (no GeoJSON sources). */
export function TrailMarkers({ peak }: TrailMarkersProps) {
  const trails = useMemo(() => trailLabelsForPeak(peak), [peak])
  if (!trails.length) return null

  return (
    <>
      {trails.map((trail, index) => {
        const [lon, lat] = trailMarkerPosition(peak, trail, index)
        return (
          <Marker
            key={`${trail.name}-${index}`}
            longitude={lon}
            latitude={lat}
            anchor="bottom"
          >
            <TrailBubble trail={trail} />
          </Marker>
        )
      })}
    </>
  )
}
