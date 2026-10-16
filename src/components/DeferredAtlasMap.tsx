import { useCallback, useEffect, useState, type ComponentType } from 'react'
import { scheduleGlobeInit } from '../lib/deferGlobe'
import { isStaleChunkError, mapDebug } from '../lib/mapDebug'
import { AtlasMapFallback } from './AtlasMapFallback'
import type { AtlasMapProps } from './AtlasMap'

const MAP_READY_MS = 12_000
const IMPORT_RETRY_MS = 400

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
  const [failed, setFailed] = useState(false)
  const [staleChunk, setStaleChunk] = useState(false)
  const [interactive, setInteractive] = useState(false)
  const [loadGen, setLoadGen] = useState(0)

  const loadMap = useCallback(async () => {
    mapDebug('scheduled')
    const tryImport = () => import('./AtlasMap')
    try {
      const mod = await tryImport()
      mapDebug('import resolved')
      setMapView(() => mod.AtlasMap)
      setFailed(false)
      return
    } catch (err) {
      mapDebug('import failed', { stale: isStaleChunkError(err) })
      await new Promise((resolve) => setTimeout(resolve, IMPORT_RETRY_MS))
      try {
        const mod = await tryImport()
        mapDebug('import resolved')
        setMapView(() => mod.AtlasMap)
        setFailed(false)
      } catch (err2) {
        const stale = isStaleChunkError(err2)
        setStaleChunk(stale)
        setFailed(true)
        mapDebug('import failed', { stale, retry: true })
      }
    }
  }, [])

  useEffect(() => {
    setInteractive(false)
    setFailed(false)
    return scheduleGlobeInit(
      () => {
        void loadMap()
      },
      { eager },
    )
  }, [eager, loadMap, loadGen])

  useEffect(() => {
    if (!eager || interactive || failed) return
    const id = window.setTimeout(() => {
      mapDebug('ready-timeout')
      setFailed(true)
    }, MAP_READY_MS)
    return () => window.clearTimeout(id)
  }, [eager, interactive, failed, loadGen])

  function handleRetry() {
    if (staleChunk) {
      window.location.reload()
      return
    }
    setFailed(false)
    setInteractive(false)
    setMapView(null)
    setLoadGen((n) => n + 1)
  }

  function handleInteractive() {
    mapDebug('map load')
    setInteractive(true)
    setFailed(false)
    props.onMapInteractive?.()
  }

  const map =
    MapView != null ? (
      <MapView {...props} onMapInteractive={handleInteractive} />
    ) : null

  if (!map) {
    return (
      <AtlasMapFallback
        status={failed ? 'retry' : 'loading'}
        onRetry={failed ? handleRetry : undefined}
        staleChunk={staleChunk}
      />
    )
  }

  if (failed) {
    return (
      <div className="atlas-map-deferred">
        {map}
        <AtlasMapFallback
          status="retry"
          onRetry={handleRetry}
          staleChunk={staleChunk}
        />
      </div>
    )
  }

  return map
}
