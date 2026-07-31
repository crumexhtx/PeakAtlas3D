import { useEffect, useMemo, useRef, useState } from 'react'
import { useMap } from 'react-map-gl/maplibre'
import type { NationalPark } from '../types/nationalPark'
import {
  declutterPeakMarkers,
  peakLayoutsEqual,
  type PeakMarkerLayout,
} from '../lib/markerDeclutter'
import { NationalParkMarker } from './NationalParkMarker'

type NationalParksLayerProps = {
  parks: NationalPark[]
  selectedParkId?: string | null
  onSelectPark: (park: NationalPark) => void
}

/** National park pins with the same viewport declutter as country peak flags. */
export function NationalParksLayer({
  parks,
  selectedParkId = null,
  onSelectPark,
}: NationalParksLayerProps) {
  const { current } = useMap()
  const [layout, setLayout] = useState<Map<string, PeakMarkerLayout>>(
    () => new Map(),
  )
  const layoutRef = useRef(layout)
  layoutRef.current = layout

  const declutterRows = useMemo(
    () =>
      parks.map((p) => ({
        id: p.id,
        lat: p.lat,
        lon: p.lon,
        // Prefer larger parks when markers compete for space.
        elevationFt: Math.round(p.areaSqMi),
        name: p.name,
      })),
    [parks],
  )

  useEffect(() => {
    const map = current?.getMap()
    if (!map) return

    let frame = 0
    const refresh = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const prev = layoutRef.current
        const next = declutterPeakMarkers(map, declutterRows, prev)
        if (peakLayoutsEqual(prev, next)) return
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
  }, [current, declutterRows])

  return (
    <>
      {parks.map((park) => {
        const selected = park.id === selectedParkId
        if (!selected && !layout.get(park.id)?.show) return null
        return (
          <NationalParkMarker
            key={park.id}
            park={park}
            selected={selected}
            onClick={onSelectPark}
          />
        )
      })}
    </>
  )
}
