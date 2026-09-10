import { useEffect, useState, type ComponentType } from 'react'
import { scheduleGlobeInit } from '../lib/deferGlobe'
import { AtlasMapFallback } from './AtlasMapFallback'
import type { AtlasMapProps } from './AtlasMap'

/**
 * Keep MapLibre off the critical path: paint chrome + placeholder first,
 * then import the WebGL globe once the main thread is idle (or on input).
 */
export function DeferredAtlasMap({
  eager = false,
  ...props
}: AtlasMapProps & { eager?: boolean }) {
  const [MapView, setMapView] = useState<ComponentType<AtlasMapProps> | null>(
    null,
  )

  useEffect(() => {
    return scheduleGlobeInit(
      () => {
        void import('./AtlasMap').then((mod) => {
          setMapView(() => mod.AtlasMap)
        })
      },
      { eager },
    )
  }, [eager])

  if (!MapView) return <AtlasMapFallback />
  return <MapView {...props} />
}
