import Map, {
  Layer,
  NavigationControl,
  Source,
  type MapMouseEvent,
  type MapRef,
} from 'react-map-gl/mapbox'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { GeoJSONSource } from 'mapbox-gl'
import type { Peak } from '../types/peak'
import { FlagPeakMarker } from './FlagPeakMarker'
import {
  hasMapboxToken,
  MAP_STYLE_SATELLITE,
  MAPBOX_TOKEN,
} from '../lib/mapbox'
import {
  IDLE_ROTATE_DELAY_MS,
  prefersReducedMotion,
  startIdleSpin,
} from '../lib/mapAnimations'
import 'mapbox-gl/dist/mapbox-gl.css'

type WorldMapProps = {
  peaks: Peak[]
  onSelectPeak: (peak: Peak) => void
}

const INITIAL = {
  longitude: 20,
  latitude: 20,
  zoom: 1.6,
  pitch: 0,
  bearing: 0,
}

/** Show individual flag markers at/above this zoom; clusters below. */
const FLAG_ZOOM = 3.25

const PEAKS_SOURCE_ID = 'peaks'
const CLUSTER_LAYER_ID = 'peak-clusters'
const CLUSTER_COUNT_LAYER_ID = 'peak-cluster-count'
const UNCLUSTERED_LAYER_ID = 'peak-unclustered'

const ACTIVITY_EVENTS = [
  'mousedown',
  'touchstart',
  'wheel',
  'dragstart',
  'pitchstart',
  'rotatestart',
  'zoomstart',
] as const

export function WorldMap({ peaks, onSelectPeak }: WorldMapProps) {
  const mapRef = useRef<MapRef>(null)
  const idleTimerRef = useRef<number | null>(null)
  const spinRef = useRef<{ cancel: () => void } | null>(null)
  const [mapReady, setMapReady] = useState(false)
  const [zoom, setZoom] = useState(INITIAL.zoom)

  const showFlags = zoom >= FLAG_ZOOM

  const peaksById = useMemo(() => {
    const byId = new globalThis.Map<string, Peak>()
    for (const peak of peaks) byId.set(peak.id, peak)
    return byId
  }, [peaks])

  const peaksGeoJson = useMemo(
    () => ({
      type: 'FeatureCollection' as const,
      features: peaks.map((peak) => ({
        type: 'Feature' as const,
        properties: { id: peak.id, name: peak.name },
        geometry: {
          type: 'Point' as const,
          coordinates: [peak.lon, peak.lat],
        },
      })),
    }),
    [peaks],
  )

  useEffect(() => {
    if (!mapReady || prefersReducedMotion()) return
    const map = mapRef.current?.getMap()
    if (!map) return

    const stopSpin = () => {
      spinRef.current?.cancel()
      spinRef.current = null
    }

    const clearIdleTimer = () => {
      if (idleTimerRef.current != null) {
        window.clearTimeout(idleTimerRef.current)
        idleTimerRef.current = null
      }
    }

    const scheduleIdleSpin = () => {
      clearIdleTimer()
      stopSpin()
      idleTimerRef.current = window.setTimeout(() => {
        stopSpin()
        spinRef.current = startIdleSpin(map)
      }, IDLE_ROTATE_DELAY_MS)
    }

    const onUserActivity = () => {
      stopSpin()
      scheduleIdleSpin()
    }

    for (const event of ACTIVITY_EVENTS) {
      map.on(event, onUserActivity)
    }

    scheduleIdleSpin()

    return () => {
      clearIdleTimer()
      stopSpin()
      for (const event of ACTIVITY_EVENTS) {
        map.off(event, onUserActivity)
      }
    }
  }, [mapReady])

  function handleMapClick(event: MapMouseEvent) {
    const feature = event.features?.[0]
    if (!feature) return
    const map = mapRef.current?.getMap()
    if (!map) return

    if (feature.layer?.id === CLUSTER_LAYER_ID) {
      const clusterId = feature.properties?.cluster_id as number | undefined
      const geometry = feature.geometry
      if (clusterId == null || geometry.type !== 'Point') return

      const source = map.getSource(PEAKS_SOURCE_ID) as GeoJSONSource | undefined
      if (!source) return

      source.getClusterExpansionZoom(clusterId, (err, expansionZoom) => {
        if (err || expansionZoom == null) return
        map.easeTo({
          center: geometry.coordinates as [number, number],
          zoom: expansionZoom,
          duration: 500,
        })
      })
      return
    }

    if (feature.layer?.id === UNCLUSTERED_LAYER_ID) {
      const id = feature.properties?.id as string | undefined
      const peak = id ? peaksById.get(id) : undefined
      if (peak) onSelectPeak(peak)
    }
  }

  function handleMouseMove(event: MapMouseEvent) {
    const map = mapRef.current?.getMap()
    if (!map) return
    map.getCanvas().style.cursor = event.features?.length ? 'pointer' : ''
  }

  if (!hasMapboxToken()) {
    return (
      <div className="map-missing-token">
        <p>
          Add a public Mapbox token to <code>.env</code> as{' '}
          <code>VITE_MAPBOX_TOKEN=pk.…</code>, then restart the dev server.
        </p>
      </div>
    )
  }

  return (
    <Map
      ref={mapRef}
      mapboxAccessToken={MAPBOX_TOKEN}
      initialViewState={INITIAL}
      mapStyle={MAP_STYLE_SATELLITE}
      projection="globe"
      attributionControl
      interactiveLayerIds={
        showFlags ? undefined : [CLUSTER_LAYER_ID, UNCLUSTERED_LAYER_ID]
      }
      style={{ width: '100%', height: '100%' }}
      onLoad={() => setMapReady(true)}
      onMove={(e) => setZoom(e.viewState.zoom)}
      onClick={handleMapClick}
      onMouseMove={handleMouseMove}
    >
      <NavigationControl position="bottom-right" visualizePitch />

      {!showFlags && (
        <Source
          id={PEAKS_SOURCE_ID}
          type="geojson"
          data={peaksGeoJson}
          cluster
          clusterMaxZoom={FLAG_ZOOM}
          clusterRadius={52}
        >
          <Layer
            id={CLUSTER_LAYER_ID}
            type="circle"
            filter={['has', 'point_count']}
            paint={{
              'circle-color': [
                'step',
                ['get', 'point_count'],
                '#4fc3f7',
                8,
                '#38bdf8',
                20,
                '#0ea5e9',
              ],
              'circle-radius': ['step', ['get', 'point_count'], 16, 8, 20, 20, 26],
              'circle-stroke-width': 2,
              'circle-stroke-color': 'rgba(255,255,255,0.55)',
            }}
          />
          <Layer
            id={CLUSTER_COUNT_LAYER_ID}
            type="symbol"
            filter={['has', 'point_count']}
            layout={{
              'text-field': ['get', 'point_count_abbreviated'],
              'text-size': 12,
              'text-font': ['DIN Pro Medium', 'Arial Unicode MS Bold'],
            }}
            paint={{
              'text-color': '#061018',
            }}
          />
          <Layer
            id={UNCLUSTERED_LAYER_ID}
            type="circle"
            filter={['!', ['has', 'point_count']]}
            paint={{
              'circle-color': '#4fc3f7',
              'circle-radius': 6,
              'circle-stroke-width': 2,
              'circle-stroke-color': 'rgba(255,255,255,0.7)',
            }}
          />
        </Source>
      )}

      {showFlags &&
        peaks.map((peak) => (
          <FlagPeakMarker key={peak.id} peak={peak} onClick={onSelectPeak} />
        ))}
    </Map>
  )
}
