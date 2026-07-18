import Map, {
  Marker,
  NavigationControl,
  Source,
  type MapRef,
} from 'react-map-gl/mapbox'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { Map as MapboxMap } from 'mapbox-gl'
import type { Peak } from '../types/peak'
import type { CountrySummary } from '../types/country'
import { FlagPeakMarker } from './FlagPeakMarker'
import { CountryFlagMarker } from './CountryFlagMarker'
import { NearbyPlaceMarker } from './NearbyPlaceMarker'
import { useUnits } from '../context/UnitsContext'
import { buildCountrySummaries, getCountryBounds, flagUrl } from '../lib/countries'
import {
  hasMapboxToken,
  HERO_TERRAIN_EXAGGERATION,
  MAP_STYLE_SATELLITE,
  MAPBOX_TOKEN,
  ORBIT_TERRAIN_EXAGGERATION,
  TERRAIN_SOURCE,
  TERRAIN_SOURCE_ID,
} from '../lib/mapbox'
import {
  applyPeakAtmosphere,
  easeToAsync,
  flyToAsync,
  IDLE_ROTATE_DELAY_MS,
  orbitAsync,
  peakFramePadding,
  peakFramingCenter,
  prefersReducedMotion,
  setMapInteractive,
  softenSatelliteRaster,
  startIdleSpin,
  waitForMapIdle,
} from '../lib/mapAnimations'
import 'mapbox-gl/dist/mapbox-gl.css'

type AtlasMapProps = {
  peaks: Peak[]
  selectedCountry: string | null
  activePeak: Peak | null
  onSelectCountry: (country: string) => void
  onSelectPeak: (peak: Peak) => void
  cinematic: boolean
  cinematicStatus: string
  onCinematicChange: (next: { active: boolean; status: string }) => void
  onSkipCinematic: () => void
  skipNonce: number
}

const WORLD_VIEW = {
  longitude: 20,
  latitude: 20,
  zoom: 1.55,
  pitch: 0,
  bearing: 0,
}

const ORBIT_ZOOM = 12.2
const ORBIT_PITCH = 54
const HERO_ZOOM = 12.55
const HERO_PITCH = 62
const HERO_BEARING = -28
const SPIN_DURATION_MS = 21_820

const ACTIVITY_EVENTS = [
  'mousedown',
  'touchstart',
  'wheel',
  'dragstart',
  'pitchstart',
  'zoomstart',
] as const

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2
}

export function AtlasMap({
  peaks,
  selectedCountry,
  activePeak,
  onSelectCountry,
  onSelectPeak,
  cinematic,
  cinematicStatus,
  onCinematicChange,
  onSkipCinematic,
  skipNonce,
}: AtlasMapProps) {
  const mapRef = useRef<MapRef>(null)
  const idleTimerRef = useRef<number | null>(null)
  const spinRef = useRef<{ cancel: () => void } | null>(null)
  const prevCountryRef = useRef<string | null | undefined>(undefined)
  const prevPeakIdRef = useRef<string | null>(null)
  /** Set in peak-effect cleanup so the country effect can refit after back-nav. */
  const leavingPeakRef = useRef(false)
  const cinematicRunRef = useRef(0)
  const onCinematicChangeRef = useRef(onCinematicChange)
  const [mapReady, setMapReady] = useState(false)
  const { units } = useUnits()

  onCinematicChangeRef.current = onCinematicChange

  const countries = useMemo(() => buildCountrySummaries(peaks), [peaks])
  const countryPeaks = useMemo(() => {
    if (!selectedCountry) return []
    return peaks.filter((p) => p.country === selectedCountry)
  }, [peaks, selectedCountry])
  const selectedSummary = useMemo(
    () => countries.find((c) => c.name === selectedCountry) ?? null,
    [countries, selectedCountry],
  )
  const nearbyPlaces = useMemo(() => {
    if (!activePeak) return []
    if (activePeak.nearbyPlaces?.length) return activePeak.nearbyPlaces.slice(0, 3)
    return activePeak.nearestTown ? [activePeak.nearestTown] : []
  }, [activePeak])

  const mode = activePeak ? 'peak' : selectedCountry ? 'country' : 'world'
  const peakFlag = activePeak ? flagUrl(activePeak.country, 40) : null

  function getMap(): MapboxMap | null {
    return mapRef.current?.getMap() ?? null
  }

  function stopSpin() {
    spinRef.current?.cancel()
    spinRef.current = null
  }

  function clearIdleTimer() {
    if (idleTimerRef.current != null) {
      window.clearTimeout(idleTimerRef.current)
      idleTimerRef.current = null
    }
  }

  // Idle spin — world mode only.
  useEffect(() => {
    if (!mapReady || prefersReducedMotion() || mode !== 'world') {
      stopSpin()
      clearIdleTimer()
      return
    }

    const map = getMap()
    if (!map) return

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
  }, [mapReady, mode])

  // Country drill-in / back to world (only when not viewing a peak).
  useEffect(() => {
    if (!mapReady || activePeak) return
    const map = getMap()
    if (!map) return

    const prev = prevCountryRef.current
    const returningFromPeak = leavingPeakRef.current
    leavingPeakRef.current = false
    prevCountryRef.current = selectedCountry

    if (prev === undefined && !selectedCountry && !returningFromPeak) return

    stopSpin()
    map.setTerrain(null)
    map.stop()
    setMapInteractive(map, true)

    if (!selectedCountry) {
      if (prev || returningFromPeak) {
        map.easeTo({
          center: [WORLD_VIEW.longitude, WORLD_VIEW.latitude],
          zoom: WORLD_VIEW.zoom,
          pitch: WORLD_VIEW.pitch,
          bearing: WORLD_VIEW.bearing,
          duration: prefersReducedMotion() ? 0 : 1400,
          essential: true,
        })
      }
      return
    }

    const bounds = getCountryBounds(countryPeaks)
    if (!bounds) return

    map.fitBounds(bounds, {
      padding: { top: 80, bottom: 140, left: 60, right: 60 },
      maxZoom: countryPeaks.length === 1 ? 5.8 : 6.4,
      duration: prefersReducedMotion() ? 0 : 1600,
      essential: true,
      pitch: 0,
      bearing: 0,
    })
  }, [mapReady, selectedCountry, countryPeaks, activePeak])

  // Peak cinematic — continues from the live camera (same map instance).
  useEffect(() => {
    if (!mapReady) return
    const mapInstance = getMap()
    if (!mapInstance) return
    const map: MapboxMap = mapInstance

    const peakId = activePeak?.id ?? null
    const prevPeakId = prevPeakIdRef.current

    if (!activePeak) {
      if (prevPeakId) {
        // Camera handoff is owned by the country/world effect (via leavingPeakRef).
        // Do not map.stop() here — that was cancelling the country fitBounds.
        cinematicRunRef.current += 1
        setMapInteractive(map, true)
        map.setTerrain(null)
        onCinematicChangeRef.current({ active: false, status: '' })
      }
      prevPeakIdRef.current = null
      return
    }

    if (prevPeakId === peakId) return
    prevPeakIdRef.current = peakId

    const runId = ++cinematicRunRef.current
    let cancelled = false
    const summit: [number, number] = [activePeak.lon, activePeak.lat]
    const stillActive = () =>
      !cancelled &&
      cinematicRunRef.current === runId &&
      prevPeakIdRef.current === peakId

    async function playIntro() {
      stopSpin()
      clearIdleTimer()
      map.stop()
      applyPeakAtmosphere(map)

      const approachBearing = map.getBearing()
      const orbitCenter = peakFramingCenter(
        summit[0],
        summit[1],
        approachBearing,
        380,
      )
      const heroCenter = peakFramingCenter(
        summit[0],
        summit[1],
        HERO_BEARING,
        520,
      )

      if (prefersReducedMotion()) {
        map.setTerrain({
          source: TERRAIN_SOURCE_ID,
          exaggeration: HERO_TERRAIN_EXAGGERATION,
        })
        map.jumpTo({
          center: heroCenter,
          zoom: HERO_ZOOM,
          pitch: HERO_PITCH,
          bearing: HERO_BEARING,
          padding: peakFramePadding(),
        })
        setMapInteractive(map, true)
        onCinematicChangeRef.current({ active: false, status: '' })
        return
      }

      onCinematicChangeRef.current({
        active: true,
        status: 'Approaching summit…',
      })
      setMapInteractive(map, false)

      // Critical: do NOT remount or jump — fly from the live atlas camera.
      map.setTerrain({
        source: TERRAIN_SOURCE_ID,
        exaggeration: ORBIT_TERRAIN_EXAGGERATION,
      })

      const framePad = peakFramePadding()
      await flyToAsync(map, {
        center: orbitCenter,
        zoom: ORBIT_ZOOM,
        pitch: ORBIT_PITCH,
        bearing: approachBearing,
        padding: framePad,
        duration: 4200,
        curve: 1.2,
        easing: easeInOutCubic,
        essential: true,
      })
      if (!stillActive()) return

      await waitForMapIdle(map, 900)
      if (!stillActive()) return

      onCinematicChangeRef.current({ active: true, status: 'Orbiting peak…' })
      await orbitAsync(map, SPIN_DURATION_MS, stillActive)
      if (!stillActive()) return

      onCinematicChangeRef.current({
        active: true,
        status: 'Locking summit view…',
      })
      map.setTerrain({
        source: TERRAIN_SOURCE_ID,
        exaggeration: HERO_TERRAIN_EXAGGERATION,
      })
      await easeToAsync(map, {
        center: heroCenter,
        zoom: HERO_ZOOM,
        pitch: HERO_PITCH,
        bearing: HERO_BEARING,
        padding: peakFramePadding(),
        duration: 1400,
        easing: easeInOutCubic,
        essential: true,
      })
      if (!stillActive()) return

      setMapInteractive(map, true)
      onCinematicChangeRef.current({ active: false, status: '' })
    }

    void playIntro()

    return () => {
      cancelled = true
      cinematicRunRef.current += 1
      // Signal the country/world effect (runs after cleanups) to refit the camera.
      // Avoid map.stop() here so that upcoming fitBounds is not cancelled.
      leavingPeakRef.current = true
    }
  }, [mapReady, activePeak])

  // Skip cinematic from overlay button.
  useEffect(() => {
    if (!skipNonce || !activePeak) return
    const map = getMap()
    if (!map) return

    cinematicRunRef.current += 1
    map.stop()
    map.setTerrain({
      source: TERRAIN_SOURCE_ID,
      exaggeration: HERO_TERRAIN_EXAGGERATION,
    })
    map.jumpTo({
      center: peakFramingCenter(
        activePeak.lon,
        activePeak.lat,
        HERO_BEARING,
        520,
      ),
      zoom: HERO_ZOOM,
      pitch: HERO_PITCH,
      bearing: HERO_BEARING,
      padding: peakFramePadding(),
    })
    setMapInteractive(map, true)
    onCinematicChangeRef.current({ active: false, status: '' })
  }, [skipNonce, activePeak])

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
    <div className={`atlas-map-wrap ${cinematic ? 'is-cinematic' : ''}`}>
      <Map
        ref={mapRef}
        mapboxAccessToken={MAPBOX_TOKEN}
        initialViewState={WORLD_VIEW}
        mapStyle={MAP_STYLE_SATELLITE}
        projection="globe"
        maxPitch={85}
        attributionControl
        style={{ width: '100%', height: '100%' }}
        onLoad={() => {
          const map = getMap()
          if (map) {
            applyPeakAtmosphere(map)
            softenSatelliteRaster(map)
          }
          setMapReady(true)
        }}
      >
        <Source id={TERRAIN_SOURCE_ID} {...TERRAIN_SOURCE} />
        {!cinematic && <NavigationControl position="bottom-right" visualizePitch />}

        {mode === 'world' &&
          countries.map((country) => (
            <CountryFlagMarker
              key={country.name}
              country={country}
              onClick={(c: CountrySummary) => onSelectCountry(c.name)}
            />
          ))}

        {mode === 'country' &&
          countryPeaks.map((peak) => (
            <FlagPeakMarker key={peak.id} peak={peak} onClick={onSelectPeak} />
          ))}

        {mode === 'peak' && activePeak && (
          <>
            <Marker
              longitude={activePeak.lon}
              latitude={activePeak.lat}
              anchor="bottom"
            >
              <div className="peak-page-marker">
                {peakFlag ? (
                  <img src={peakFlag} alt="" width={32} height={22} />
                ) : (
                  <span aria-hidden="true">▲</span>
                )}
              </div>
            </Marker>
            {!cinematic &&
              nearbyPlaces.map((place) => (
                <NearbyPlaceMarker
                  key={`${place.name}-${place.lat}-${place.lon}`}
                  place={place}
                  units={units}
                />
              ))}
          </>
        )}
      </Map>

      {mode === 'country' && selectedSummary && (
        <div className="map-mode-chip" aria-hidden="true">
          {selectedSummary.name} · {selectedSummary.peakCount} peaks
        </div>
      )}

      {cinematic && (
        <div className="cinematic-overlay">
          <div className="cinematic-copy" aria-live="polite">
            <p className="cinematic-status">{cinematicStatus}</p>
            <p className="cinematic-hint">Controls unlock after the orbit</p>
          </div>
          <button type="button" className="cinematic-skip" onClick={onSkipCinematic}>
            Skip
          </button>
        </div>
      )}
    </div>
  )
}
