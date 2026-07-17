import { Marker } from 'react-map-gl/mapbox'
import type { Peak } from '../types/peak'
import { flagUrl } from '../lib/countries'

type FlagPeakMarkerProps = {
  peak: Peak
  onClick: (peak: Peak) => void
}

export function FlagPeakMarker({ peak, onClick }: FlagPeakMarkerProps) {
  const flag = flagUrl(peak.country, 40)

  return (
    <Marker longitude={peak.lon} latitude={peak.lat} anchor="bottom">
      <button
        type="button"
        className="flag-marker"
        title={`${peak.name} · ${peak.country}`}
        aria-label={`Open ${peak.name}`}
        onClick={(e) => {
          e.stopPropagation()
          onClick(peak)
        }}
      >
        {flag ? (
          <img src={flag} alt="" className="flag-marker-img" width={28} height={20} />
        ) : (
          <span className="flag-marker-fallback" aria-hidden="true">
            ▲
          </span>
        )}
        <span className="flag-marker-pin" aria-hidden="true" />
      </button>
    </Marker>
  )
}
