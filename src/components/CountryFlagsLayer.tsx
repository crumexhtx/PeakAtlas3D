import { useEffect, useState } from 'react'
import { useMap } from 'react-map-gl/mapbox'
import type { CountrySummary } from '../types/country'
import {
  declutterCountryMarkers,
  type CountryMarkerLayout,
} from '../lib/markerDeclutter'
import { CountryFlagMarker } from './CountryFlagMarker'

type CountryFlagsLayerProps = {
  countries: CountrySummary[]
  onSelectCountry: (country: string) => void
}

export function CountryFlagsLayer({
  countries,
  onSelectCountry,
}: CountryFlagsLayerProps) {
  const { current } = useMap()
  const [layout, setLayout] = useState<Map<string, CountryMarkerLayout>>(
    () => new Map(),
  )

  useEffect(() => {
    const map = current?.getMap()
    if (!map) return

    let frame = 0
    const refresh = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        setLayout(declutterCountryMarkers(map, countries))
      })
    }

    refresh()
    map.on('move', refresh)
    map.on('zoom', refresh)
    map.on('pitch', refresh)
    map.on('rotate', refresh)
    map.on('resize', refresh)

    return () => {
      cancelAnimationFrame(frame)
      map.off('move', refresh)
      map.off('zoom', refresh)
      map.off('pitch', refresh)
      map.off('rotate', refresh)
      map.off('resize', refresh)
    }
  }, [current, countries])

  return (
    <>
      {countries.map((country) => {
        const state = layout.get(country.name)
        if (!state?.show) return null
        return (
          <CountryFlagMarker
            key={country.name}
            country={country}
            showLabel={state.showLabel}
            onClick={(c) => onSelectCountry(c.name)}
          />
        )
      })}
    </>
  )
}
