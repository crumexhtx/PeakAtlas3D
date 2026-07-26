import { Marker } from 'react-map-gl/maplibre'
import type { Town } from '../types/peak'
import { formatDistance } from '../lib/geo'
import type { UnitSystem } from '../types/peak'

type NearbyPlaceMarkerProps = {
  place: Town
  units: UnitSystem
}

export function NearbyPlaceMarker({ place, units }: NearbyPlaceMarkerProps) {
  return (
    <Marker longitude={place.lon} latitude={place.lat} anchor="bottom">
      <div
        className="nearby-place-marker"
        title={`${place.name} · ${formatDistance(place.distanceMiles, units)}`}
      >
        <span className="nearby-place-label">
          <span className="nearby-place-name">{place.name}</span>
          <span className="nearby-place-dist">
            {formatDistance(place.distanceMiles, units)}
          </span>
        </span>
        <span className="nearby-place-pin" aria-hidden="true" />
      </div>
    </Marker>
  )
}
