import type { Map as MapLibreMap } from 'maplibre-gl'

/** Brief pause after world load before idle spin starts (lets tiles settle). */
export const IDLE_ROTATE_DELAY_MS = 2_200
/** Pause after user interaction before resuming world spin. */
export const IDLE_ROTATE_RESUME_MS = 3_200
/** Degrees of longitude advanced per animation frame on the world globe (~60fps baseline). */
export const IDLE_ROTATE_SPEED_LNG = 0.032
/** Auto-pause continuous spin until the next user interaction (GPU budget). */
export const IDLE_SPIN_MAX_MS = 45_000
/** Cap idle/orbit paints — half the WebGL cost for nearly the same motion. */
const SPIN_FRAME_MS = 1000 / 30

type CameraOptions = Parameters<MapLibreMap['flyTo']>[0]

export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function setMapInteractive(map: MapLibreMap, enabled: boolean) {
  const handlers = [
    map.boxZoom,
    map.scrollZoom,
    map.dragPan,
    map.dragRotate,
    map.keyboard,
    map.doubleClickZoom,
    map.touchZoomRotate,
  ] as const

  for (const handler of handlers) {
    if (enabled) handler.enable()
    else handler.disable()
  }
}

export function waitForMoveEnd(
  map: MapLibreMap,
  timeoutMs = 8_000,
): Promise<void> {
  return new Promise((resolve) => {
    let settled = false
    const finish = () => {
      if (settled) return
      settled = true
      window.clearTimeout(timer)
      map.off('moveend', onMoveEnd)
      map.off('remove', onRemove)
      resolve()
    }
    const onMoveEnd = () => finish()
    const onRemove = () => finish()
    // Resolve on remove so leave-during-cinematic does not hang forever.
    // Timeout so a missed moveend cannot freeze the map (interaction locked).
    const timer = window.setTimeout(finish, timeoutMs)
    map.once('moveend', onMoveEnd)
    map.once('remove', onRemove)
  })
}

/** Wait until the map goes idle (tiles settled), with a timeout fallback. */
export function waitForMapIdle(
  map: MapLibreMap,
  timeoutMs = 2800,
): Promise<void> {
  return new Promise((resolve) => {
    let settled = false

    const finish = () => {
      if (settled) return
      settled = true
      window.clearTimeout(timer)
      map.off('idle', finish)
      map.off('remove', finish)
      resolve()
    }

    const timer = window.setTimeout(finish, timeoutMs)
    map.once('idle', finish)
    map.once('remove', finish)

    // If tiles are already ready, settle quickly after a short paint beat.
    if (typeof map.areTilesLoaded === 'function' && map.areTilesLoaded()) {
      window.setTimeout(finish, 120)
    }
  })
}

/** Wait until the basemap style has finished loading (or timeout). */
export function waitForStyleReady(
  map: MapLibreMap,
  timeoutMs = 4_000,
): Promise<void> {
  return new Promise((resolve) => {
    let settled = false
    const finish = () => {
      if (settled) return
      settled = true
      window.clearTimeout(timer)
      map.off('style.load', onLoad)
      map.off('remove', onRemove)
      resolve()
    }
    const onLoad = () => finish()
    const onRemove = () => finish()
    const timer = window.setTimeout(finish, timeoutMs)
    try {
      if (map.isStyleLoaded()) {
        finish()
        return
      }
    } catch {
      finish()
      return
    }
    map.once('style.load', onLoad)
    map.once('remove', onRemove)
  })
}

/**
 * Let react-map-gl apply a pending mapStyle swap, wait for style.load, then
 * re-apply atmosphere. Call before easeTo/flyTo so world↔detail swaps don't
 * cancel mid-transition.
 */
export async function settleBasemap(
  map: MapLibreMap,
  timeoutMs = 4_000,
): Promise<void> {
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve())
    })
  })
  await waitForStyleReady(map, timeoutMs)
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => resolve())
  })
  applyPeakAtmosphere(map)
  softenSatelliteRaster(map)
}

export async function flyToAsync(map: MapLibreMap, options: CameraOptions) {
  const duration =
    typeof options?.duration === 'number' ? options.duration : 3_000
  map.flyTo(options)
  await waitForMoveEnd(map, duration + 2_000)
}

export async function easeToAsync(map: MapLibreMap, options: CameraOptions) {
  const duration =
    typeof options?.duration === 'number' ? options.duration : 1_500
  map.easeTo(options)
  await waitForMoveEnd(map, duration + 2_000)
}

/**
 * Atmosphere / sky for globe + pitched terrain.
 * MapLibre uses `setSky` (Mapbox’s `setFog` API is not available).
 */
export function applyPeakAtmosphere(map: MapLibreMap) {
  try {
    map.setSky({
      'sky-color': 'rgb(48, 78, 140)',
      'horizon-color': 'rgb(150, 172, 196)',
      'fog-color': 'rgb(11, 16, 32)',
      'sky-horizon-blend': 0.35,
      'horizon-fog-blend': 0.7,
      'fog-ground-blend': 0.35,
      'atmosphere-blend': [
        'interpolate',
        ['linear'],
        ['zoom'],
        0,
        1,
        3,
        0.35,
        6,
        0,
      ],
    })
  } catch {
    // Older styles may reject sky props; ignore.
  }
}

/** Soften blown-out snow / bright satellite whites without killing contrast. */
export function softenSatelliteRaster(map: MapLibreMap) {
  const layers = map.getStyle()?.layers ?? []
  for (const layer of layers) {
    if (layer.type !== 'raster') continue
    try {
      map.setPaintProperty(layer.id, 'raster-brightness-max', 0.78)
      map.setPaintProperty(layer.id, 'raster-brightness-min', 0.04)
      map.setPaintProperty(layer.id, 'raster-contrast', -0.14)
      map.setPaintProperty(layer.id, 'raster-saturation', -0.1)
    } catch {
      // Layer may not support every paint prop in all styles.
    }
  }
}

/**
 * Padding that keeps the summit in the open map (left of the dossier on
 * desktop, clear of the top-right card on mobile) and near visual center
 * under steep pitch.
 */
export function peakFramePadding(): {
  top: number
  bottom: number
  left: number
  right: number
} {
  const narrow =
    typeof window !== 'undefined' &&
    window.matchMedia('(max-width: 800px)').matches
  if (narrow) {
    // Top-right details card — mild bias into the open map, not hard left.
    return {
      top: 76,
      bottom: 72,
      left: 36,
      right: 108,
    }
  }
  // Desktop dossier (~360px): reserve right space so summit centers in leftover map.
  return { top: 96, bottom: 72, left: 48, right: 280 }
}

/** Leave room for browse bar (bottom) and top-right country card on phones. */
export function countryFramePadding(): {
  top: number
  bottom: number
  left: number
  right: number
} {
  const narrow =
    typeof window !== 'undefined' &&
    window.matchMedia('(max-width: 800px)').matches
  if (narrow) {
    return {
      top: 96,
      bottom: 120,
      left: 36,
      right: 120,
    }
  }
  return { top: 80, bottom: 140, left: 60, right: 60 }
}

/** Centered globe — clear any peak/country padding left on the camera. */
export function worldFramePadding(): {
  top: number
  bottom: number
  left: number
  right: number
} {
  return { top: 0, bottom: 0, left: 0, right: 0 }
}

/** Nudge look-at toward the camera so pitched terrain sits nearer mid-frame. */
export function peakFramingCenter(
  lon: number,
  lat: number,
  bearingDeg: number,
  offsetMeters = 280,
): [number, number] {
  // Camera sits opposite bearing; shift center toward camera (behind the peak).
  const backBearing = ((bearingDeg + 180) * Math.PI) / 180
  const metersPerDegLat = 111_320
  const metersPerDegLon = 111_320 * Math.cos((lat * Math.PI) / 180)
  const dLat = (offsetMeters * Math.cos(backBearing)) / metersPerDegLat
  const dLon = (offsetMeters * Math.sin(backBearing)) / metersPerDegLon
  return [lon + dLon, lat + dLat]
}

/**
 * Continuous globe spin by shifting center longitude.
 * Prefer this over setBearing on a globe — bearing changes often look wrong
 * at low zoom and can fire rotatestart (which would cancel idle timers).
 * Throttled to ~30fps and paused while the tab is hidden.
 * Optional `maxMs` auto-stops the spin (caller can resume on interaction).
 */
export function startIdleSpin(
  map: MapLibreMap,
  speedLng = IDLE_ROTATE_SPEED_LNG,
  options?: { maxMs?: number; onAutoStop?: () => void },
): { cancel: () => void } {
  let frame = 0
  let active = true
  let lastPaint = 0
  const startedAt = performance.now()
  const maxMs = options?.maxMs
  // Keep perceived angular speed close to the old uncapped 60fps loop.
  const degPerMs = (speedLng * 60) / 1000

  const tick = (now: number) => {
    if (!active) return
    if (maxMs != null && now - startedAt >= maxMs) {
      active = false
      cancelAnimationFrame(frame)
      options?.onAutoStop?.()
      return
    }
    if (!document.hidden && now - lastPaint >= SPIN_FRAME_MS) {
      const dt = Math.min(now - lastPaint, SPIN_FRAME_MS * 2.5)
      lastPaint = now
      const { lng, lat } = map.getCenter()
      map.jumpTo({ center: [lng + degPerMs * dt, lat] })
    }
    frame = requestAnimationFrame(tick)
  }

  lastPaint = performance.now()
  frame = requestAnimationFrame(tick)

  return {
    cancel: () => {
      active = false
      cancelAnimationFrame(frame)
    },
  }
}

/**
 * Full 360° orbit around the current center.
 * Uses rAF + setBearing because easeTo(bearing + 360) is a no-op after
 * normalizing bearing into [-180, 180].
 */
export function orbitAsync(
  map: MapLibreMap,
  durationMs: number,
  shouldContinue: () => boolean = () => true,
): Promise<void> {
  return new Promise((resolve) => {
    const startBearing = map.getBearing()
    const startedAt = performance.now()
    let frame = 0
    let lastPaint = 0

    const tick = (now: number) => {
      if (!shouldContinue()) {
        cancelAnimationFrame(frame)
        resolve()
        return
      }

      const progress = Math.min(1, (now - startedAt) / durationMs)
      if (now - lastPaint >= SPIN_FRAME_MS || progress >= 1) {
        lastPaint = now
        map.setBearing(startBearing + progress * 360)
      }

      if (progress < 1) {
        frame = requestAnimationFrame(tick)
      } else {
        resolve()
      }
    }

    frame = requestAnimationFrame(tick)
  })
}
