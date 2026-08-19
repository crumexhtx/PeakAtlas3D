import type { Map as MapLibreMap } from 'maplibre-gl'

/** Brief pause after world load before idle spin starts (lets tiles settle). */
export const IDLE_ROTATE_DELAY_MS = 2_200
/** Phones: keep jumpTo spin off the PageSpeed observation window. */
export const IDLE_ROTATE_DELAY_MOBILE_MS = 12_000
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

/** World idle-spin delay — longer on small viewports so first paint stays idle. */
export function idleSpinDelayMs(): number {
  if (typeof window === 'undefined') return IDLE_ROTATE_DELAY_MS
  return window.matchMedia('(max-width: 800px)').matches
    ? IDLE_ROTATE_DELAY_MOBILE_MS
    : IDLE_ROTATE_DELAY_MS
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
 * Brief paint settle before easeTo/flyTo. With a stable satellite style this
 * usually resolves immediately (isStyleLoaded); kept for rare style reloads
 * and to re-apply atmosphere/soften after any unexpected reload.
 */
export async function settleBasemap(
  map: MapLibreMap,
  timeoutMs = 1_200,
): Promise<void> {
  try {
    if (map.isStyleLoaded()) {
      applyPeakAtmosphere(map)
      softenSatelliteRaster(map)
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => resolve())
      })
      return
    }
  } catch {
    // Fall through to the full wait path.
  }

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
 * Padding that keeps the summit in the open map above the bottom dossier
 * and near visual center under steep pitch.
 */
/** Width of the right peak dossier panel — keep in sync with peakFramePadding(). */
export const PEAK_DOSSIER_PANEL_WIDTH = 360
/** Width of the left trip-planning panel — keep in sync with peakFramePadding(). */
export const PEAK_TRIP_PANEL_WIDTH = 320

/**
 * Reserve space for dual side panels so the summit centers in the open map.
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
    // Top cards on both sides — bias summit into the open map center.
    return {
      top: 100,
      bottom: 64,
      left: 96,
      right: 96,
    }
  }
  return {
    top: 110,
    bottom: 56,
    left: PEAK_TRIP_PANEL_WIDTH,
    right: PEAK_DOSSIER_PANEL_WIDTH,
  }
}

/**
 * Open (padding-cleared) viewport width the peak hero zoom is tuned against —
 * a representative desktop window with peakFramePadding()'s side reserves
 * (320 + 360) already removed.
 */
const HERO_ZOOM_REFERENCE_OPEN_WIDTH =
  1440 - PEAK_TRIP_PANEL_WIDTH - PEAK_DOSSIER_PANEL_WIDTH
/** Cap how far the viewport-size adjustment can zoom in/out either way. */
const HERO_ZOOM_ADJUST_CLAMP = 1.1

/**
 * Zoom is logarithmic — the same zoom level shows proportionally less ground
 * distance on a narrower viewport, so a fixed hero zoom leaves less room for
 * the summit + surrounding terrain to read as "framed" on small screens even
 * though peakFramePadding() already reserves proportionally similar padding
 * there. Zoom out for viewports narrower than the reference so a phone shows
 * roughly the same ground context a desktop does, instead of a more tightly
 * cropped cutout of it. Never zoom in beyond the tuned baseline — desktop
 * framing (at/above the reference width) is unaffected.
 */
export function heroZoomViewportAdjust(
  viewportWidth: number,
  padding: { left: number; right: number },
): number {
  const openWidth = Math.max(1, viewportWidth - padding.left - padding.right)
  const ratio = openWidth / HERO_ZOOM_REFERENCE_OPEN_WIDTH
  if (!(ratio > 0) || !Number.isFinite(ratio)) return 0
  const delta = Math.min(0, Math.log2(ratio))
  return Math.max(-HERO_ZOOM_ADJUST_CLAMP, delta)
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
      top: 88,
      bottom: 96,
      left: 28,
      right: 96,
    }
  }
  // Tighter than before so large countries (USA) fill more of the stage.
  return { top: 64, bottom: 100, left: 48, right: 48 }
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

/**
 * Drop cinematic padding after unlock so free pan/zoom does not snap when
 * MapLibre reconciles a padded viewport on moveend.
 *
 * `getCenter()` is the center of the *padded* open map. Clearing padding while
 * keeping that lat/lng recenters it in the *full* canvas — a visible jump left
 * under a wide right dossier pad. Instead, pick a new center so the point that
 * was at the padded viewport center stays on the same screen pixel after
 * padding goes to zero (summit stays framed beside the dossier, no mid-drag
 * jumpTo needed).
 */
export function clearCameraPadding(map: MapLibreMap): void {
  try {
    const canvas = map.getCanvas()
    const w = canvas.clientWidth
    const h = canvas.clientHeight
    const pad = map.getPadding()
    const left = pad.left ?? 0
    const right = pad.right ?? 0
    const top = pad.top ?? 0
    const bottom = pad.bottom ?? 0
    const openCx = left + (w - left - right) / 2
    const openCy = top + (h - top - bottom) / 2
    // Screen point that becomes the camera center once padding is zero, chosen
    // so today's open-map center stays at (openCx, openCy).
    const center = map.unproject([
      w / 2 - (openCx - w / 2),
      h / 2 - (openCy - h / 2),
    ])
    map.jumpTo({
      center,
      zoom: map.getZoom(),
      bearing: map.getBearing(),
      pitch: map.getPitch(),
      padding: worldFramePadding(),
    })
  } catch {
    // Map may already be removed.
  }
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
