import { useEffect, useRef, useState } from 'react'
import { useMap } from 'react-map-gl/mapbox'
import type { CountrySummary } from '../types/country'
import {
  declutterCountryMarkers,
  layoutsEqual,
  spinCountryMarkerLayout,
  type CountryMarkerLayout,
} from '../lib/markerDeclutter'
import { CountryFlagMarker } from './CountryFlagMarker'

type CountryFlagsLayerProps = {
  countries: CountrySummary[]
  onSelectCountry: (country: string) => void
  /** When true, skip packing and only toggle limb visibility with hysteresis. */
  spinning?: boolean
}

export function CountryFlagsLayer({
  countries,
  onSelectCountry,
  spinning = false,
}: CountryFlagsLayerProps) {
  const { current } = useMap()
  const [layout, setLayout] = useState<Map<string, CountryMarkerLayout>>(
    () => new Map(),
  )
  const layoutRef = useRef(layout)
  layoutRef.current = layout
  const spinningRef = useRef(spinning)
  spinningRef.current = spinning

  useEffect(() => {
    const map = current?.getMap()
    if (!map) return

    let frame = 0
    let spinSkip = 0

    const refresh = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        // During continuous jumpTo spin, refresh a bit less often to cut React churn.
        if (spinningRef.current) {
          spinSkip = (spinSkip + 1) % 2
          if (spinSkip !== 0) return
        }

        const prev = layoutRef.current
        const next = spinningRef.current
          ? spinCountryMarkerLayout(map, countries, prev)
          : declutterCountryMarkers(map, countries, prev)

        if (layoutsEqual(prev, next)) return
        layoutRef.current = next
        setLayout(next)
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

  // Recompute immediately when spin mode toggles (packing ↔ limb-only).
  useEffect(() => {
    const map = current?.getMap()
    if (!map) return
    const prev = layoutRef.current
    const next = spinning
      ? spinCountryMarkerLayout(map, countries, prev)
      : declutterCountryMarkers(map, countries, prev)
    if (layoutsEqual(prev, next)) return
    layoutRef.current = next
    setLayout(next)
  }, [spinning, current, countries])

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
