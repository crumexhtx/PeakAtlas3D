import { useEffect, useState } from 'react'
import { Marker } from 'react-map-gl/mapbox'
import type { CountrySummary } from '../types/country'
import { countryToIso, flagUrl } from '../lib/countries'

type CountryFlagMarkerProps = {
  country: CountrySummary
  onClick: (country: CountrySummary) => void
  /** When false, only the flag/pin is shown (used by declutter). */
  showLabel?: boolean
}

function flagCandidates(country: string): string[] {
  const primary = flagUrl(country, 40)
  const iso = countryToIso(country)
  const out: string[] = []
  if (primary) out.push(primary)
  if (iso) {
    const alt = `https://flagcdn.com/40x30/${iso}.png`
    if (!out.includes(alt)) out.push(alt)
  }
  return out
}

/**
 * Country flag pin. Visibility / declutter is owned by CountryFlagsLayer so
 * this marker stays mounted while on-screen (avoids limb flicker on spin).
 */
export function CountryFlagMarker({
  country,
  onClick,
  showLabel = true,
}: CountryFlagMarkerProps) {
  const candidates = flagCandidates(country.name)
  const [candidateIndex, setCandidateIndex] = useState(0)
  const [failed, setFailed] = useState(false)
  const flag = candidates[candidateIndex]

  useEffect(() => {
    setCandidateIndex(0)
    setFailed(false)
  }, [country.name])

  return (
    <Marker longitude={country.lon} latitude={country.lat} anchor="bottom">
      <button
        type="button"
        className={`country-flag-marker${showLabel ? '' : ' is-flag-only'}`}
        title={country.name}
        aria-label={`Explore peaks in ${country.name}`}
        onClick={(e) => {
          e.stopPropagation()
          onClick(country)
        }}
      >
        {flag && !failed ? (
          <img
            src={flag}
            alt=""
            className="country-flag-marker-img"
            width={showLabel ? 40 : 28}
            height={showLabel ? 28 : 20}
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
          <span className="country-flag-marker-fallback" aria-hidden="true">
            {country.name.slice(0, 2).toUpperCase()}
          </span>
        )}
        {showLabel && (
          <span className="country-flag-marker-label">
            <span className="country-flag-marker-name">{country.name}</span>
          </span>
        )}
        <span className="flag-marker-pin" aria-hidden="true" />
      </button>
    </Marker>
  )
}
