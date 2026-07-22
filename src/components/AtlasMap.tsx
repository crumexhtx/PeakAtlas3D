import Map, {
  Marker,
  NavigationControl,
  Source,
  type MapRef,
} from 'react-map-gl/mapbox'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { Map as MapboxMap } from 'mapbox-gl'
import type { Peak, PeakIndex } from '../types/peak'
import { FlagPeakMarker } from './FlagPeakMarker'
import { CountryFlagsLayer } from './CountryFlagsLayer'
import { NearbyPlaceMarker } from './NearbyPlaceMarker'
import { SpinFunFact } from './SpinFunFact'
import { isUsPeak, TrailMarkers } from './TrailMarkers'
import { useUnits } from '../context/UnitsContext'
import {
  buildCountrySummaries,
  flagUrl,
  getCountryBounds,
  peakMatchesCountry,
} from '../lib/countries'
import {
  applyMapPixelRatioCap,
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
  countryFramePadding,
  easeToAsync,
  flyToAsync,
  IDLE_ROTATE_DELAY_MS,
  IDLE_ROTATE_RESUME_MS,
  orbitAsync,
  peakFramePadding,
  peakFramingCenter,
  prefersReducedMotion,
  setMapInteractive,
  softenSatelliteRaster,
  startIdleSpin,
  waitForMapIdle,
  worldFramePadding,
} from '../lib/mapAnimations'
import 'mapbox-gl/dist/mapbox-gl.css'

type AtlasMapProps = {
  peaks: PeakIndex[]
  selectedCountry: string | null
  activePeak: Peak | null
  onSelectCountry: (country: string) => void
  onSelectPeak: (peak: PeakIndex) => void
  cinematic: boolean
  cinematicStatus: string
  onCinematicChange: (next: { active: boolean; status: string }) => void
  onSkipCinematic: () => void
  skipNonce: number
  /** When false, hide spin fun-fact callouts (e.g. while onboarding hint is up). */
  funFactsEnabled?: boolean
  /** Immersive globe — hide map chrome (zoom controls, mode chip, nearby pins). */
  earthOnly?: boolean
}

/**
 * Desktop world framing — fills the stage without over-zooming (closer zoom
 * costs more satellite detail while the idle globe spins).
 */
/** ~20% closer than the original full-disk framing. */
const WORLD_ZOOM = 1.2
/**
 * World framing matched to the reference phone shot: full Earth disk
 * visible with clear margin (not clipped, not tiny).
 */
const WORLD_ZOOM_NARROW = 0.9
/**
 * iPhone SE (~375×667): map pane is shorter after header/browse chrome,
 * so ease out a touch vs taller phones while keeping the same look.
 */
const WORLD_ZOOM_SE = 0.84

/** Fresh random globe framing for each full page load / refresh. */
function createRandomWorldView() {
  const se =
    typeof window !== 'undefined' &&
    window.matchMedia('(max-width: 380px)').matches
  const narrow =
    typeof window !== 'undefined' &&
    window.matchMedia('(max-width: 640px)').matches
  return {
    longitude: Math.random() * 360 - 180,
    // Avoid framing mostly ocean at the poles.
    latitude: -32 + Math.random() * 64,
    zoom: se ? WORLD_ZOOM_SE : narrow ? WORLD_ZOOM_NARROW : WORLD_ZOOM,
    pitch: 0,
    bearing: 0,
  }
}

const ORBIT_ZOOM = 12.9
/** Lower pitch = more top-down; steep angles pull empty far-horizon tiles. */
const ORBIT_PITCH = 44
const HERO_ZOOM = 13.35
const HERO_PITCH = 50
const HERO_BEARING = -28
/**
 * Look-at nudge toward the camera (meters). Keep modest so the summit stays
 * near the visual center of the padded viewport under pitch.
 */
const ORBIT_FRAME_OFFSET_M = 220
const HERO_FRAME_OFFSET_M = 280
/** Full 360° orbit — paced slower for a calmer spin. */
const SPIN_DURATION_MS = 26_400
/** Shared duration for peak approach and leave (country/world) camera moves. */
const PEAK_TRANSITION_MS = 5_040

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
  funFactsEnabled = true,
  earthOnly = false,
}: AtlasMapProps) {
  const mapRef = useRef<MapRef>(null)
  const idleTimerRef = useRef<number | null>(null)
  const spinRef = useRef<{ cancel: () => void } | null>(null)
  const prevCountryRef = useRef<string | null | undefined>(undefined)
  const prevPeakIdRef = useRef<string | null>(null)
  /** Set in peak-effect cleanup so the country effect can refit after back-nav. */
  const leavingPeakRef = useRef(false)
  /** Latest peak id from render — cleanup compares against it to skip StrictMode remounts. */
  const latestPeakIdRef = useRef<string | null>(null)
  const cinematicRunRef = useRef(0)
  const onCinematicChangeRef = useRef(onCinematicChange)
  /** Stable for this page session; randomized again on full refresh. */
  const [worldView] = useState(createRandomWorldView)
  const [mapReady, setMapReady] = useState(false)
  const [mapInstance, setMapInstance] = useState<MapboxMap | null>(null)
  const [spinning, setSpinning] = useState(false)
  const { units } = useUnits()

  onCinematicChangeRef.current = onCinematicChange
  latestPeakIdRef.current = activePeak?.id ?? null

  // Cap HiDPI canvas fill-rate on desktop (Mapbox GL v3 has no pixelRatio option).
  useEffect(() => {
    const restore = applyMapPixelRatioCap()
    const map = mapRef.current?.getMap()
    try {
      map?.resize()
    } catch {
      // Map may not be ready yet; onLoad resize also picks up the capped DPR.
    }
    return restore
  }, [])

  // Abort in-flight camera work when the map shell unmounts (About/Releases/etc).
  useEffect(() => {
    return () => {
      const map = mapRef.current?.getMap()
      cinematicRunRef.current += 1
      try {
        map?.stop()
      } catch {
        // Map may already be removed.
      }
      spinRef.current?.cancel()
      spinRef.current = null
      if (idleTimerRef.current != null) {
        window.clearTimeout(idleTimerRef.current)
        idleTimerRef.current = null
      }
    }
  }, [])

  const countries = useMemo(() => buildCountrySummaries(peaks), [peaks])
  const selectedSummary = useMemo(
    () =>
      countries.find(
        (c) =>
          c.name === selectedCountry ||
          (selectedCountry != null && c.labels.includes(selectedCountry)),
      ) ?? null,
    [countries, selectedCountry],
  )
  const countryPeaks = useMemo(() => {
    if (!selectedCountry) return []
    return peaks.filter((p) => peakMatchesCountry(p, selectedCountry, countries))
  }, [peaks, selectedCountry, countries])
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
    setSpinning(false)
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

    const scheduleIdleSpin = (delayMs: number) => {
      clearIdleTimer()
      stopSpin()
      idleTimerRef.current = window.setTimeout(() => {
        stopSpin()
        spinRef.current = startIdleSpin(map)
        setSpinning(true)
      }, delayMs)
    }

    const onUserActivity = () => {
      stopSpin()
      scheduleIdleSpin(IDLE_ROTATE_RESUME_MS)
    }

    for (const event of ACTIVITY_EVENTS) {
      map.on(event, onUserActivity)
    }
    // Start rotating as soon as the world globe is ready.
    scheduleIdleSpin(IDLE_ROTATE_DELAY_MS)

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
    setMapInteractive(map, true)

    // Defer camera move to the next frame so it wins over the peak-leave
    // effect in the same commit (that effect must not cancel this animation).
    const frame = requestAnimationFrame(() => {
      try {
        map.stop()
      } catch {
        // Map may already be removed.
      }

      if (!selectedCountry) {
        if (prev || returningFromPeak) {
          map.easeTo({
            center: [worldView.longitude, worldView.latitude],
            zoom: worldView.zoom,
            pitch: worldView.pitch,
            bearing: worldView.bearing,
            // Peak/country views leave asymmetric padding that shifts the globe
            // off-center — always clear it when returning to world.
            padding: worldFramePadding(),
            duration: prefersReducedMotion() ? 0 : PEAK_TRANSITION_MS,
            essential: true,
          })
        }
        return
      }

      const bounds = getCountryBounds(countryPeaks)
      if (!bounds) return

      map.fitBounds(bounds, {
        padding: countryFramePadding(),
        maxZoom: countryPeaks.length === 1 ? 5.8 : 6.4,
        duration: prefersReducedMotion() ? 0 : PEAK_TRANSITION_MS,
        essential: true,
        pitch: 0,
        bearing: 0,
      })
    })

    return () => cancelAnimationFrame(frame)
  }, [mapReady, selectedCountry, countryPeaks, activePeak, worldView])

  // Peak cinematic — continues from the live camera (same map instance).
  useEffect(() => {
    if (!mapReady) return
    const mapInstance = getMap()
    if (!mapInstance) return
    const map: MapboxMap = mapInstance

    const peakId = activePeak?.id ?? null
    const prevPeakId = prevPeakIdRef.current

    if (!activePeak) {
      // Clear cinematic UI when leaving peak mode. Do NOT map.stop() here —
      // the country/world effect (declared above) starts fitBounds/easeTo in
      // the same commit; a stop() after that cancels the zoom-out and leaves
      // the camera stuck at summit framing (common with single-peak countries).
      cinematicRunRef.current += 1
      setMapInteractive(map, true)
      map.setTerrain(null)
      onCinematicChangeRef.current({ active: false, status: '' })
      prevPeakIdRef.current = null
      return
    }

    if (prevPeakId === peakId) {
      return
    }
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
      try {
        map.stop()
      } catch {
        // ignore
      }
      applyPeakAtmosphere(map)

      const approachBearing = map.getBearing()
      const orbitCenter = peakFramingCenter(
        summit[0],
        summit[1],
        approachBearing,
        ORBIT_FRAME_OFFSET_M,
      )
      const heroCenter = peakFramingCenter(
        summit[0],
        summit[1],
        HERO_BEARING,
        HERO_FRAME_OFFSET_M,
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

      try {
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
          duration: PEAK_TRANSITION_MS,
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
      } catch {
        // Terrain/camera errors must not leave the map frozen.
        if (stillActive()) {
          setMapInteractive(map, true)
          onCinematicChangeRef.current({ active: false, status: '' })
        }
      }
    }

    void playIntro()

    return () => {
      cancelled = true
      cinematicRunRef.current += 1
      try {
        map.stop()
      } catch {
        // ignore
      }
      // Always unlock — peak→peak switches were leaving interaction disabled
      // when the previous intro was cancelled mid-flight.
      setMapInteractive(map, true)
      // StrictMode remounts effects in dev: clear the "already played" marker so
      // the second mount can schedule playIntro for the same peak.
      if (prevPeakIdRef.current === peakId) {
        prevPeakIdRef.current = null
      }
      // Only signal leave when the latest render is no longer this peak
      // (StrictMode remount keeps the same peak id — skip the flag).
      if (latestPeakIdRef.current !== peakId) {
        onCinematicChangeRef.current({ active: false, status: '' })
        // Signal the country/world effect (runs after cleanups) to refit the camera.
        leavingPeakRef.current = true
      }
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
        HERO_FRAME_OFFSET_M,
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

  const mapAriaLabel = activePeak
    ? `${activePeak.name} interactive 3D topographic globe map`
    : 'Interactive 3D world peak atlas globe map'

  return (
    <div
      className={`atlas-map-wrap ${cinematic ? 'is-cinematic' : ''}`}
      role="application"
      aria-label={mapAriaLabel}
    >
      <Map
        ref={mapRef}
        mapboxAccessToken={MAPBOX_TOKEN}
        initialViewState={worldView}
        mapStyle={MAP_STYLE_SATELLITE}
        projection="globe"
        maxPitch={85}
        attributionControl
        style={{ width: '100%', height: '100%' }}
        onLoad={() => {
          const map = getMap()
          if (map) {
            // Pick up desktop DPR cap applied on mount.
            try {
              map.resize()
            } catch {
              // Ignore resize failures during early load.
            }
            applyPeakAtmosphere(map)
            softenSatelliteRaster(map)
            setMapInstance(map)
          }
          setMapReady(true)
        }}
      >
        <Source id={TERRAIN_SOURCE_ID} {...TERRAIN_SOURCE} />
        {!cinematic && !earthOnly && (
          <NavigationControl position="top-left" visualizePitch />
        )}

        {mode === 'world' && (
          <CountryFlagsLayer
            countries={countries}
            onSelectCountry={onSelectCountry}
            spinning={spinning}
          />
        )}

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
              !earthOnly &&
              nearbyPlaces.map((place) => (
                <NearbyPlaceMarker
                  key={`${place.name}-${place.lat}-${place.lon}`}
                  place={place}
                  units={units}
                />
              ))}
            {!cinematic && !earthOnly && isUsPeak(activePeak) && (
              <TrailMarkers peak={activePeak} />
            )}
          </>
        )}
      </Map>

      {mode === 'country' && selectedSummary && !earthOnly && (
        <div className="map-mode-chip" aria-hidden="true">
          {selectedSummary.name} · {selectedSummary.peakCount} peaks
        </div>
      )}

      {mode === 'world' && (
        <SpinFunFact
          map={mapInstance}
          spinning={spinning}
          enabled={funFactsEnabled}
          countries={countries}
          peaks={peaks}
        />
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
