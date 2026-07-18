import { Marker } from 'react-map-gl/mapbox'
import type { CountrySummary } from '../types/country'
import { flagUrl } from '../lib/countries'

type CountryFlagMarkerProps = {
  country: CountrySummary
  onClick: (country: CountrySummary) => void
}

export function CountryFlagMarker({ country, onClick }: CountryFlagMarkerProps) {
  const flag = flagUrl(country.name, 80)

  return (
    <Marker longitude={country.lon} latitude={country.lat} anchor="bottom">
      <button
        type="button"
        className="country-flag-marker"
        title={`${country.name} · ${country.peakCount} peaks`}
        aria-label={`Explore peaks in ${country.name}`}
        onClick={(e) => {
          e.stopPropagation()
          onClick(country)
        }}
      >
        {flag ? (
          <img
            src={flag}
            alt=""
            className="country-flag-marker-img"
            width={40}
            height={28}
          />
        ) : (
          <span className="country-flag-marker-fallback" aria-hidden="true">
            {country.name.slice(0, 2).toUpperCase()}
          </span>
        )}
        <span className="country-flag-marker-label">
          <span className="country-flag-marker-name">{country.name}</span>
          <span className="country-flag-marker-count">{country.peakCount}</span>
        </span>
        <span className="flag-marker-pin" aria-hidden="true" />
      </button>
    </Marker>
  )
}
