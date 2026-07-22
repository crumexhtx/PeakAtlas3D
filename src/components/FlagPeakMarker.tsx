import { useState } from 'react'
import { Marker } from 'react-map-gl/mapbox'
import type { PeakIndex } from '../types/peak'
import { countryToIso, flagUrl } from '../lib/countries'

type FlagPeakMarkerProps = {
  peak: PeakIndex
  onClick: (peak: PeakIndex) => void
}

export function FlagPeakMarker({ peak, onClick }: FlagPeakMarkerProps) {
  const primary = flagUrl(peak.country, 40)
  const iso = countryToIso(peak.country)
  const candidates = [
    primary,
    iso ? `https://flagcdn.com/40x30/${iso}.png` : null,
  ].filter(Boolean) as string[]
  const [candidateIndex, setCandidateIndex] = useState(0)
  const [failed, setFailed] = useState(false)
  const flag = candidates[candidateIndex]

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
        {flag && !failed ? (
          <img
            src={flag}
            alt=""
            className="flag-marker-img"
            width={28}
            height={20}
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            onError={() => {
              if (candidateIndex + 1 < candidates.length) {
                setCandidateIndex((i) => i + 1)
                return
              }
              setFailed(true)
            }}
          />
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
