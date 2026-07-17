import Map, { NavigationControl, type MapRef } from 'react-map-gl/mapbox'
import { useEffect, useRef, useState } from 'react'
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
      style={{ width: '100%', height: '100%' }}
      onLoad={() => setMapReady(true)}
    >
      <NavigationControl position="bottom-right" visualizePitch />
      {peaks.map((peak) => (
        <FlagPeakMarker key={peak.id} peak={peak} onClick={onSelectPeak} />
      ))}
    </Map>
  )
}
