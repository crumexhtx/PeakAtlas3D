import { useEffect, useRef, useState } from 'react'
import { useMap } from 'react-map-gl/maplibre'
import type { PeakIndex } from '../types/peak'
import {
  declutterPeakMarkers,
  peakLayoutsEqual,
  type PeakMarkerLayout,
} from '../lib/markerDeclutter'
import { FlagPeakMarker } from './FlagPeakMarker'

type CountryPeaksLayerProps = {
  peaks: PeakIndex[]
  onSelectPeak: (peak: PeakIndex) => void
}

/** Country drill-in peak flags with overlap + count capping (smooth USA view). */
export function CountryPeaksLayer({
  peaks,
  onSelectPeak,
}: CountryPeaksLayerProps) {
  const { current } = useMap()
  const [layout, setLayout] = useState<Map<string, PeakMarkerLayout>>(
    () => new Map(),
  )
  const layoutRef = useRef(layout)
  layoutRef.current = layout

  useEffect(() => {
    const map = current?.getMap()
    if (!map) return

    let frame = 0
    const refresh = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const prev = layoutRef.current
        const next = declutterPeakMarkers(map, peaks, prev)
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
  }, [current, peaks])

  return (
    <>
      {peaks.map((peak) => {
        if (!layout.get(peak.id)?.show) return null
        return (
          <FlagPeakMarker key={peak.id} peak={peak} onClick={onSelectPeak} />
        )
      })}
    </>
  )
}
