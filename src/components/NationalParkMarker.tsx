import { Marker } from 'react-map-gl/maplibre'
import type { NationalPark } from '../types/nationalPark'

type NationalParkMarkerProps = {
  park: NationalPark
  selected?: boolean
  onClick: (park: NationalPark) => void
}

export function NationalParkMarker({
  park,
  selected = false,
  onClick,
}: NationalParkMarkerProps) {
  return (
    <Marker longitude={park.lon} latitude={park.lat} anchor="bottom">
      <button
        type="button"
        className={`park-marker${selected ? ' is-selected' : ''}`}
        title={`${park.name} · ${park.state}`}
        aria-label={`Open ${park.name}`}
        aria-pressed={selected}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          onClick(park)
        }}
      >
        <span className="park-marker-badge" aria-hidden="true">
          NP
        </span>
        <span className="park-marker-pin" aria-hidden="true" />
      </button>
    </Marker>
  )
}
