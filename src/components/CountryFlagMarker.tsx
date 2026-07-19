import { useEffect, useState } from 'react'
import { Marker, useMap } from 'react-map-gl/mapbox'
import type { CountrySummary } from '../types/country'
import { flagUrl } from '../lib/countries'
import { isOnFrontHemisphere } from '../lib/globeVisibility'

type CountryFlagMarkerProps = {
  country: CountrySummary
  onClick: (country: CountrySummary) => void
}

export function CountryFlagMarker({ country, onClick }: CountryFlagMarkerProps) {
  const { current } = useMap()
  const [visible, setVisible] = useState(true)
  const flag = flagUrl(country.name, 80)

  useEffect(() => {
    const map = current?.getMap()
    if (!map) return

    const update = () => {
      setVisible(isOnFrontHemisphere(map, country.lon, country.lat, 0.08))
    }

    update()
    map.on('move', update)
    map.on('zoom', update)
    map.on('pitch', update)
    map.on('rotate', update)
    return () => {
      map.off('move', update)
      map.off('zoom', update)
      map.off('pitch', update)
      map.off('rotate', update)
    }
  }, [current, country.lon, country.lat])

  if (!visible) return null

  return (
    <Marker longitude={country.lon} latitude={country.lat} anchor="bottom">
      <button
        type="button"
        className="country-flag-marker"
        title={country.name}
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
        </span>
        <span className="flag-marker-pin" aria-hidden="true" />
      </button>
    </Marker>
  )
}
