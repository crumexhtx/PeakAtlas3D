import Map, {
  Marker,
  NavigationControl,
  Source,
  type MapRef,
} from 'react-map-gl/maplibre'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { Map as MapLibreMap } from 'maplibre-gl'
import type { Peak, PeakIndex } from '../types/peak'
import type { NationalPark } from '../types/nationalPark'
import { CountryFlagsLayer } from './CountryFlagsLayer'
import { CountryPeaksLayer } from './CountryPeaksLayer'
import { NationalParksLayer } from './NationalParksLayer'
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
  cappedPixelRatio,
  atlasMapStyle,
  DETAIL_MAX_ZOOM,
  HERO_TERRAIN_EXAGGERATION,
  terrainSource,
  TERRAIN_SOURCE_ID,
  WORLD_MAX_ZOOM,
} from '../lib/maptiler'
import {
  applyPeakAtmosphere,
  clearCameraPadding,
  countryFramePadding,
  flyToAsync,
  heroZoomViewportAdjust,
  IDLE_ROTATE_RESUME_MS,
  IDLE_SPIN_MAX_MS,
  idleSpinDelayMs,
  orbitAsync,
  peakFramePadding,
  peakFramingCenter,
  prefersReducedMotion,
  setMapInteractive,
  settleBasemap,
  softenSatelliteRaster,
  startIdleSpin,
  waitForMapIdle,
  worldFramePadding,
} from '../lib/mapAnimations'
import 'maplibre-gl/dist/maplibre-gl.css'

export type AtlasMapProps = {
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
  /** Peak mode — hide summit flag, trail signs, and nearby place pins. */
  hideMapMarkers?: boolean
  /** World view — show curated USA National Park markers. */
  showNationalParks?: boolean
  nationalParks?: NationalPark[]
  selectedPark?: NationalPark | null
  onSelectPark?: (park: NationalPark) => void
}

/**
 * Desktop world framing — continent-scale hemisphere (matches the reference
 * shot where a region like South America fills most of the visible disk).
 * Closer zoom costs more satellite detail while the idle globe spins.
 */
const WORLD_ZOOM = 2.05
/**
 * World framing on phone: still a clear Earth disk with a bit more margin
 * than desktop so chrome does not clip the sphere.
 */
const WORLD_ZOOM_NARROW = 1.54
/**
 * iPhone SE (~375×667): map pane is shorter after header/browse chrome,
 * so ease out a touch vs taller phones while keeping the same look.
 */
const WORLD_ZOOM_SE = 1.43

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

const HERO_ZOOM = 11.55
const HERO_PITCH = 40
const HERO_BEARING = -28
/** National park overview frame — wider than a summit hero; +20% vs prior 8.4. */
const PARK_ZOOM = 10.1
const PARK_PITCH = 42
const PARK_BEARING = -18
const PARK_FLY_MS = 4_200
/** Contiguous-US framing while the parks overlay is on (no park selected). */
const PARKS_OVERVIEW = {
  center: [-108.5, 39.5] as [number, number],
  zoom: 3.2,
  pitch: 0,
  bearing: 0,
}
/**
 * Look-at nudge toward the camera (meters). Small so the summit sits near
 * mid-frame under pitch instead of riding the top of the viewport.
 */
const HERO_FRAME_OFFSET_M = 120
/** Manual 360° orbit — paced slow for a calm spin. */
const SPIN_DURATION_MS = 26_400
/**
 * Peak approach fly-in. Slower than country leave so the summit reveal
 * reads as a deliberate zoom rather than a snap.
 */
const PEAK_APPROACH_MS = 8_800
/** Shared duration for overview camera moves (country / world / parks). */
/** World ↔ country / parks framing — snappy enough to feel responsive on click. */
const OVERVIEW_TRANSITION_MS = 1_400
/** Don't stall country/parks clicks for a long hung style.load. */
/** Short settle — style is stable; only need a paint beat before camera moves. */
const OVERVIEW_SETTLE_MS = 400

/**
 * When jumping in from the spinning globe (search / world flags), ease in with
 * a slightly wider final frame so the massif stays readable. Also zoom out on
 * narrower viewports (see heroZoomViewportAdjust) so the summit reads as
 * "framed" on small screens instead of a more tightly cropped cutout of the
 * desktop view.
 */
function peakHeroZoom(
  startZoom: number,
  viewportWidth: number,
  padding: { left: number; right: number },
): number {
  const base = startZoom < 4 ? HERO_ZOOM - 0.35 : HERO_ZOOM
  return base + heroZoomViewportAdjust(viewportWidth, padding)
}

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
  hideMapMarkers = false,
  showNationalParks = false,
  nationalParks = [],
  selectedPark = null,
  onSelectPark,
}: AtlasMapProps) {
  const mapRef = useRef<MapRef>(null)
  const idleTimerRef = useRef<number | null>(null)
  const spinRef = useRef<{ cancel: () => void } | null>(null)
  const prevCountryRef = useRef<string | null | undefined>(undefined)
  const prevPeakIdRef = useRef<string | null>(null)
  const prevParkIdRef = useRef<string | null>(null)
  /** Set in peak-effect cleanup so the country effect can refit after back-nav. */
  const leavingPeakRef = useRef(false)
  /** Latest peak id from render — cleanup compares against it to skip StrictMode remounts. */
  const latestPeakIdRef = useRef<string | null>(null)
  const cinematicRunRef = useRef(0)
  const orbitRunRef = useRef(0)
  const onCinematicChangeRef = useRef(onCinematicChange)
  /** Stable for this page session; randomized again on full refresh. */
  const [worldView] = useState(createRandomWorldView)
  const [mapReady, setMapReady] = useState(false)
  const [mapInstance, setMapInstance] = useState<MapLibreMap | null>(null)
  const [spinning, setSpinning] = useState(false)
  const [orbiting, setOrbiting] = useState(false)
  const { units } = useUnits()

  onCinematicChangeRef.current = onCinematicChange
  latestPeakIdRef.current = activePeak?.id ?? null

  // Cap HiDPI canvas fill-rate on desktop + mobile via MapLibre pixelRatio.
  const pixelRatio = useMemo(() => cappedPixelRatio(), [])

  useEffect(() => {
    const map = mapRef.current?.getMap()
    if (!map || pixelRatio == null) return
    try {
      map.setPixelRatio?.(pixelRatio)
      map.resize()
    } catch {
      // Map may not be ready yet; onLoad resize also picks up the capped DPR.
    }
  }, [pixelRatio])

  // Abort in-flight camera work when the map shell unmounts (About/Contact/etc).
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

  function getMap(): MapLibreMap | null {
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

  function stopPeakOrbit() {
    orbitRunRef.current += 1
    setOrbiting(false)
    const map = getMap()
    if (map) setMapInteractive(map, true)
  }

  async function startPeakOrbit() {
    const map = getMap()
    if (!map || !activePeak || cinematic || prefersReducedMotion()) return

    const runId = ++orbitRunRef.current
    setOrbiting(true)
    setMapInteractive(map, false)

    try {
      await orbitAsync(
        map,
        SPIN_DURATION_MS,
        () =>
          orbitRunRef.current === runId &&
          latestPeakIdRef.current === activePeak.id,
      )
    } finally {
      if (orbitRunRef.current === runId) {
        setOrbiting(false)
        setMapInteractive(map, true)
      }
    }
  }

  // Idle spin — world mode only (paused while a park dossier is open).
  useEffect(() => {
    if (
      !mapReady ||
      prefersReducedMotion() ||
      mode !== 'world' ||
      selectedPark
    ) {
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
        spinRef.current = startIdleSpin(map, undefined, {
          maxMs: IDLE_SPIN_MAX_MS,
          onAutoStop: () => {
            spinRef.current = null
            setSpinning(false)
          },
        })
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
    scheduleIdleSpin(idleSpinDelayMs())

    return () => {
      clearIdleTimer()
      stopSpin()
      for (const event of ACTIVITY_EVENTS) {
        map.off(event, onUserActivity)
      }
    }
  }, [mapReady, mode, selectedPark])

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
    clearIdleTimer()
    try {
      map.setTerrain(null)
    } catch {
      // Style may be mid-swap after leaving a peak.
    }
    setMapInteractive(map, true)

    let cancelled = false
    const frame = requestAnimationFrame(() => {
      void (async () => {
        try {
          map.stop()
        } catch {
          // Map may already be removed.
        }
        // World↔country and peak→world both swap or reload style; settle first.
        await settleBasemap(map, OVERVIEW_SETTLE_MS)
        if (cancelled) return

        const duration = prefersReducedMotion() ? 0 : OVERVIEW_TRANSITION_MS

        try {
          if (!selectedCountry) {
            if (prev || returningFromPeak) {
              map.easeTo({
                center: [worldView.longitude, worldView.latitude],
                zoom: worldView.zoom,
                pitch: worldView.pitch,
                bearing: worldView.bearing,
                padding: worldFramePadding(),
                duration,
                easing: easeInOutCubic,
                essential: true,
              })
            }
            return
          }

          const bounds = getCountryBounds(countryPeaks)
          if (!bounds) return

          map.fitBounds(bounds, {
            padding: countryFramePadding(),
            // Allow a closer landmass frame now that bounds exclude far outliers.
            maxZoom: countryPeaks.length === 1 ? 5.8 : 7.2,
            duration,
            easing: easeInOutCubic,
            essential: true,
            pitch: 0,
            bearing: 0,
          })
        } catch {
          setMapInteractive(map, true)
        }
      })()
    })

    return () => {
      cancelled = true
      cancelAnimationFrame(frame)
    }
  }, [mapReady, selectedCountry, countryPeaks, activePeak, worldView])

  // National park selection — fly to park, or return to US parks overview.
  useEffect(() => {
    if (!mapReady || activePeak || selectedCountry) return
    const map = getMap()
    if (!map) return

    const parkId = selectedPark?.id ?? null
    const prevParkId = prevParkIdRef.current
    if (parkId === prevParkId) return
    prevParkIdRef.current = parkId

    // Deselected while parks overlay still on → back to country/US overview.
    if (!selectedPark) {
      if (!prevParkId || !showNationalParks) return
      stopSpin()
      clearIdleTimer()
      setMapInteractive(map, true)

      let cancelled = false
      const frame = requestAnimationFrame(() => {
        void (async () => {
          try {
            map.stop()
          } catch {
            // ignore
          }
          await settleBasemap(map, OVERVIEW_SETTLE_MS)
          if (cancelled) return
          try {
            map.easeTo({
              center: PARKS_OVERVIEW.center,
              zoom: PARKS_OVERVIEW.zoom,
              pitch: PARKS_OVERVIEW.pitch,
              bearing: PARKS_OVERVIEW.bearing,
              padding: worldFramePadding(),
              duration: prefersReducedMotion() ? 0 : OVERVIEW_TRANSITION_MS,
              easing: easeInOutCubic,
              essential: true,
            })
          } catch {
            setMapInteractive(map, true)
          }
        })()
      })
      return () => {
        cancelled = true
        cancelAnimationFrame(frame)
      }
    }

    stopSpin()
    clearIdleTimer()
    setMapInteractive(map, true)

    const cancelled = { current: false }
    const frame = requestAnimationFrame(() => {
      void (async () => {
        await settleBasemap(map, OVERVIEW_SETTLE_MS)
        if (cancelled.current) return
        void flyToAsync(map, {
          center: [selectedPark.lon, selectedPark.lat],
          zoom: PARK_ZOOM,
          pitch: PARK_PITCH,
          bearing: PARK_BEARING,
          duration: prefersReducedMotion() ? 0 : PARK_FLY_MS,
          curve: 1.25,
          easing: easeInOutCubic,
          essential: true,
        }).catch(() => {
          // Camera move aborted — ignore.
        })
      })()
    })

    return () => {
      cancelled.current = true
      cancelAnimationFrame(frame)
    }
  }, [mapReady, selectedPark, activePeak, selectedCountry, showNationalParks])

  // Parks overlay: frame contiguous US on, return to world globe on off.
  const prevShowParksRef = useRef(false)
  useEffect(() => {
    if (!mapReady || activePeak || selectedCountry) {
      prevShowParksRef.current = showNationalParks
      return
    }
    const map = getMap()
    const wasOn = prevShowParksRef.current
    const turningOn = showNationalParks && !wasOn
    const turningOff = !showNationalParks && wasOn
    prevShowParksRef.current = showNationalParks
    if (!map || (!turningOn && !turningOff)) return
    if (turningOn && selectedPark) return

    stopSpin()
    clearIdleTimer()
    setMapInteractive(map, true)

    let cancelled = false
    const frame = requestAnimationFrame(() => {
      void (async () => {
        try {
          map.stop()
        } catch {
          // ignore
        }
        // Parks toggles world↔detail style — always settle before camera move.
        await settleBasemap(map, OVERVIEW_SETTLE_MS)
        if (cancelled) return

        const duration = prefersReducedMotion() ? 0 : OVERVIEW_TRANSITION_MS
        try {
          if (turningOn) {
            map.easeTo({
              center: PARKS_OVERVIEW.center,
              zoom: PARKS_OVERVIEW.zoom,
              pitch: PARKS_OVERVIEW.pitch,
              bearing: PARKS_OVERVIEW.bearing,
              padding: worldFramePadding(),
              duration,
              easing: easeInOutCubic,
              essential: true,
            })
          } else {
            map.easeTo({
              center: [worldView.longitude, worldView.latitude],
              zoom: worldView.zoom,
              pitch: worldView.pitch,
              bearing: worldView.bearing,
              padding: worldFramePadding(),
              duration,
              easing: easeInOutCubic,
              essential: true,
            })
          }
        } catch {
          setMapInteractive(map, true)
        }
      })()
    })

    return () => {
      cancelled = true
      cancelAnimationFrame(frame)
    }
  }, [mapReady, showNationalParks, selectedPark, activePeak, selectedCountry, worldView])

  // Peak cinematic — continues from the live camera (same map instance).
  useEffect(() => {
    if (!mapReady) return
    const mapInstance = getMap()
    if (!mapInstance) return
    const map: MapLibreMap = mapInstance

    const peakId = activePeak?.id ?? null
    const prevPeakId = prevPeakIdRef.current

    if (!activePeak) {
      // Clear cinematic UI when leaving peak mode. Do NOT map.stop() here —
      // the country/world effect (declared above) starts fitBounds/easeTo in
      // the same commit; a stop() after that cancels the zoom-out and leaves
      // the camera stuck at summit framing (common with single-peak countries).
      cinematicRunRef.current += 1
      orbitRunRef.current += 1
      setOrbiting(false)
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
    orbitRunRef.current += 1
    setOrbiting(false)

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

      // Paint settle before fly (style stays satellite — no basemap reload).
      await settleBasemap(map)
      if (!stillActive()) return

      // Enable terrain before the approach so DEM settle does not pop the
      // camera after flyTo finishes (felt like an extra jump on unlock).
      try {
        map.setTerrain({
          source: TERRAIN_SOURCE_ID,
          exaggeration: HERO_TERRAIN_EXAGGERATION,
        })
      } catch {
        // Source may still be attaching — fly without terrain.
      }
      await waitForMapIdle(map, 700)
      if (!stillActive()) return

      const framePad = peakFramePadding()
      const heroZoom = peakHeroZoom(
        map.getZoom(),
        map.getContainer().clientWidth,
        framePad,
      )
      const heroCenter = peakFramingCenter(
        summit[0],
        summit[1],
        HERO_BEARING,
        HERO_FRAME_OFFSET_M,
      )

      if (prefersReducedMotion()) {
        map.jumpTo({
          center: heroCenter,
          zoom: heroZoom,
          pitch: HERO_PITCH,
          bearing: HERO_BEARING,
          padding: framePad,
        })
        clearCameraPadding(map)
        setMapInteractive(map, true)
        onCinematicChangeRef.current({ active: false, status: '' })
        return
      }

      onCinematicChangeRef.current({
        active: true,
        status: 'Zooming to summit…',
      })
      setMapInteractive(map, false)

      // Hard unlock if anything hangs (style race, tile stall).
      const safety = window.setTimeout(() => {
        if (!stillActive()) return
        clearCameraPadding(map)
        setMapInteractive(map, true)
        onCinematicChangeRef.current({ active: false, status: '' })
      }, 12_000)

      try {
        await flyToAsync(map, {
          center: heroCenter,
          zoom: heroZoom,
          pitch: HERO_PITCH,
          bearing: HERO_BEARING,
          padding: framePad,
          duration: PEAK_APPROACH_MS,
          curve: 1.35,
          easing: easeInOutCubic,
          essential: true,
        })
        if (!stillActive()) return

        // Brief tile settle, then drop cinematic padding without shifting the
        // summit on screen (see clearCameraPadding). Free pan/zoom stays stable.
        await waitForMapIdle(map, 500)
        if (!stillActive()) return
        clearCameraPadding(map)

        setMapInteractive(map, true)
        onCinematicChangeRef.current({ active: false, status: '' })
      } catch {
        // Camera errors must not leave the map frozen / dossier hidden.
        if (stillActive()) {
          clearCameraPadding(map)
          setMapInteractive(map, true)
          onCinematicChangeRef.current({ active: false, status: '' })
        }
      } finally {
        window.clearTimeout(safety)
      }
    }

    void playIntro()

    return () => {
      cancelled = true
      cinematicRunRef.current += 1
      orbitRunRef.current += 1
      setOrbiting(false)
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

  // Skip approach from overlay button.
  useEffect(() => {
    if (!skipNonce || !activePeak) return
    const map = getMap()
    if (!map) return

    cinematicRunRef.current += 1
    orbitRunRef.current += 1
    setOrbiting(false)
    map.stop()
    map.setTerrain({
      source: TERRAIN_SOURCE_ID,
      exaggeration: HERO_TERRAIN_EXAGGERATION,
    })
    const skipFramePad = peakFramePadding()
    map.jumpTo({
      center: peakFramingCenter(
        activePeak.lon,
        activePeak.lat,
        HERO_BEARING,
        HERO_FRAME_OFFSET_M,
      ),
      zoom: peakHeroZoom(
        map.getZoom(),
        map.getContainer().clientWidth,
        skipFramePad,
      ),
      pitch: HERO_PITCH,
      bearing: HERO_BEARING,
      padding: skipFramePad,
    })
    clearCameraPadding(map)
    setMapInteractive(map, true)
    onCinematicChangeRef.current({ active: false, status: '' })
  }, [skipNonce, activePeak])

  const mapAriaLabel = activePeak
    ? `${activePeak.name} interactive 3D topographic globe map`
    : 'Interactive 3D world peak atlas globe map'

  // One satellite style for the whole atlas — no world↔hybrid reload on drill-in.
  const style = useMemo(() => atlasMapStyle(), [])
  const dem = useMemo(() => terrainSource(), [])
  const wantsWorldZoomCap = mode === 'world' && !showNationalParks
  // Never clamp maxZoom while the camera is still at summit/country zoom —
  // dropping to WORLD_MAX_ZOOM mid-transition hard-constrains the map and
  // breaks "Back to Global Globe".
  const [worldZoomCapOn, setWorldZoomCapOn] = useState(wantsWorldZoomCap)

  useEffect(() => {
    if (!wantsWorldZoomCap) {
      setWorldZoomCapOn(false)
      return
    }
    if (!mapReady) {
      setWorldZoomCapOn(true)
      return
    }
    const map = getMap()
    if (!map) {
      setWorldZoomCapOn(true)
      return
    }
    const applyIfReady = () => {
      try {
        if (map.getZoom() <= WORLD_MAX_ZOOM + 0.05) {
          setWorldZoomCapOn(true)
          return true
        }
      } catch {
        setWorldZoomCapOn(true)
        return true
      }
      return false
    }
    if (applyIfReady()) return
    setWorldZoomCapOn(false)
    const onMove = () => {
      if (applyIfReady()) {
        map.off('zoom', onMove)
        map.off('moveend', onMove)
      }
    }
    map.on('zoom', onMove)
    map.on('moveend', onMove)
    return () => {
      map.off('zoom', onMove)
      map.off('moveend', onMove)
    }
  }, [wantsWorldZoomCap, mapReady])

  const maxZoom = worldZoomCapOn ? WORLD_MAX_ZOOM : DETAIL_MAX_ZOOM

  // Atmosphere / satellite soften once the stable style loads (and on rare reloads).
  useEffect(() => {
    if (!mapReady) return
    const map = getMap()
    if (!map) return
    const onStyle = () => {
      applyPeakAtmosphere(map)
      softenSatelliteRaster(map)
    }
    map.on('style.load', onStyle)
    try {
      onStyle()
    } catch {
      // ignore
    }
    return () => {
      map.off('style.load', onStyle)
    }
  }, [mapReady])

  return (
    <div
      className={`atlas-map-wrap${cinematic ? ' is-cinematic' : ''}${
        spinning ? ' is-spinning' : ''
      }`}
      role="application"
      aria-label={mapAriaLabel}
    >
      <Map
        ref={mapRef}
        initialViewState={worldView}
        mapStyle={style}
        projection="globe"
        maxPitch={85}
        maxZoom={maxZoom}
        attributionControl={{ compact: true }}
        {...(pixelRatio != null ? { pixelRatio } : {})}
        style={{ width: '100%', height: '100%' }}
        onLoad={() => {
          const map = getMap()
          if (map) {
            // Pick up desktop DPR cap applied on mount.
            try {
              if (pixelRatio != null) map.setPixelRatio?.(pixelRatio)
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
        <Source id={TERRAIN_SOURCE_ID} {...dem} />
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

        {mode === 'world' && showNationalParks && onSelectPark && (
          <NationalParksLayer
            parks={nationalParks}
            selectedParkId={selectedPark?.id ?? null}
            onSelectPark={onSelectPark}
          />
        )}

        {mode === 'country' && (
          <CountryPeaksLayer peaks={countryPeaks} onSelectPeak={onSelectPeak} />
        )}

        {mode === 'peak' && activePeak && !hideMapMarkers && (
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

      {mode === 'world' && showNationalParks && !earthOnly && (
        <div className="map-mode-chip" aria-hidden="true">
          {selectedPark
            ? selectedPark.name
            : `${nationalParks.length} national parks`}
        </div>
      )}

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

      {mode === 'peak' &&
        activePeak &&
        !cinematic &&
        !earthOnly &&
        !prefersReducedMotion() && (
          <button
            type="button"
            className={`peak-orbit-btn${orbiting ? ' is-orbiting' : ''}`}
            aria-pressed={orbiting}
            aria-label={orbiting ? 'Stop peak orbit' : 'Orbit around peak'}
            onClick={() => {
              if (orbiting) stopPeakOrbit()
              else void startPeakOrbit()
            }}
          >
            {orbiting ? 'Stop orbit' : 'Orbit 360°'}
          </button>
        )}

      {cinematic && (
        <div className="cinematic-overlay">
          <div className="cinematic-copy" aria-live="polite">
            <p className="cinematic-status">{cinematicStatus}</p>
            <p className="cinematic-hint">Controls unlock after the zoom</p>
          </div>
          <button type="button" className="cinematic-skip" onClick={onSkipCinematic}>
            Skip
          </button>
        </div>
      )}
    </div>
  )
}
