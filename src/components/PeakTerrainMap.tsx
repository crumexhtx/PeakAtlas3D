import Map, {
  Marker,
  NavigationControl,
  Source,
  type MapRef,
} from 'react-map-gl/mapbox'
import { useEffect, useRef, useState } from 'react'
import type { Peak } from '../types/peak'
import { flagUrl } from '../lib/countries'
import {
  hasMapboxToken,
  MAP_STYLE_SATELLITE,
  MAPBOX_TOKEN,
  TERRAIN_SOURCE,
  TERRAIN_SOURCE_ID,
} from '../lib/mapbox'
import {
  easeToAsync,
  flyToAsync,
  prefersReducedMotion,
  setMapInteractive,
} from '../lib/mapAnimations'
import 'mapbox-gl/dist/mapbox-gl.css'

type PeakTerrainMapProps = {
  peak: Peak
}

const APPROACH_ZOOM = 12.4
const APPROACH_PITCH = 68
const SPIN_DURATION_MS = 12_000

const FINAL_VIEW = {
  zoom: APPROACH_ZOOM,
  pitch: APPROACH_PITCH,
  bearing: -20,
} as const

export function PeakTerrainMap({ peak }: PeakTerrainMapProps) {
  const mapRef = useRef<MapRef>(null)
  const runIdRef = useRef(0)
  const flag = flagUrl(peak.country, 40)
  const [cinematic, setCinematic] = useState(() => !prefersReducedMotion())
  const [status, setStatus] = useState('Approaching summit…')
  const [mapReady, setMapReady] = useState(false)

  function finishIntro() {
    const map = mapRef.current?.getMap()
    if (!map) return

    runIdRef.current += 1
    map.stop()
    map.jumpTo({
      center: [peak.lon, peak.lat],
      ...FINAL_VIEW,
    })
    setMapInteractive(map, true)
    setCinematic(false)
    setStatus('')
  }

  useEffect(() => {
    if (!mapReady) return
    const mapApi = mapRef.current
    if (!mapApi) return

    const map = mapApi.getMap()
    const runId = ++runIdRef.current
    let cancelled = false

    const stillActive = () => !cancelled && runIdRef.current === runId

    async function playIntro() {
      if (prefersReducedMotion()) {
        setCinematic(false)
        map.jumpTo({
          center: [peak.lon, peak.lat],
          ...FINAL_VIEW,
        })
        setMapInteractive(map, true)
        return
      }

      setCinematic(true)
      setStatus('Approaching summit…')
      setMapInteractive(map, false)

      map.jumpTo({
        center: [peak.lon, peak.lat],
        zoom: 4.2,
        pitch: 20,
        bearing: 0,
      })

      await flyToAsync(map, {
        center: [peak.lon, peak.lat],
        zoom: APPROACH_ZOOM,
        pitch: APPROACH_PITCH,
        bearing: 0,
        duration: 4200,
        essential: true,
      })
      if (!stillActive()) return

      setStatus('Orbiting peak…')
      const startBearing = map.getBearing()
      await easeToAsync(map, {
        bearing: startBearing + 360,
        duration: SPIN_DURATION_MS,
        easing: (t: number) => t,
        essential: true,
      })
      if (!stillActive()) return

      setMapInteractive(map, true)
      setCinematic(false)
      setStatus('')
    }

    void playIntro()

    return () => {
      cancelled = true
      map.stop()
      setMapInteractive(map, true)
    }
  }, [mapReady, peak.id, peak.lat, peak.lon])

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
    <div className={`peak-terrain-wrap ${cinematic ? 'is-cinematic' : ''}`}>
      <Map
        ref={mapRef}
        mapboxAccessToken={MAPBOX_TOKEN}
        initialViewState={{
          longitude: peak.lon,
          latitude: peak.lat,
          zoom: 4.2,
          pitch: 20,
          bearing: 0,
        }}
        mapStyle={MAP_STYLE_SATELLITE}
        terrain={{ source: TERRAIN_SOURCE_ID, exaggeration: 1.6 }}
        maxPitch={85}
        attributionControl
        style={{ width: '100%', height: '100%' }}
        onLoad={() => setMapReady(true)}
      >
        <Source id={TERRAIN_SOURCE_ID} {...TERRAIN_SOURCE} />
        {!cinematic && <NavigationControl position="bottom-right" visualizePitch />}
        <Marker longitude={peak.lon} latitude={peak.lat} anchor="bottom">
          <div className="peak-page-marker">
            {flag ? (
              <img src={flag} alt="" width={32} height={22} />
            ) : (
              <span aria-hidden="true">▲</span>
            )}
          </div>
        </Marker>
      </Map>

      {cinematic && (
        <div className="cinematic-overlay">
          <div className="cinematic-copy" aria-live="polite">
            <p className="cinematic-status">{status}</p>
            <p className="cinematic-hint">Controls unlock after the orbit</p>
          </div>
          <button type="button" className="cinematic-skip" onClick={finishIntro}>
            Skip
          </button>
        </div>
      )}
    </div>
  )
}
