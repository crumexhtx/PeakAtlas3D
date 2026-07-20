import type { Map as MapboxMap } from 'mapbox-gl'

export const IDLE_ROTATE_DELAY_MS = 6_000
/** Degrees of longitude advanced per animation frame on the world globe. */
export const IDLE_ROTATE_SPEED_LNG = 0.045

type CameraOptions = Parameters<MapboxMap['flyTo']>[0]

export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function setMapInteractive(map: MapboxMap, enabled: boolean) {
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
  map: MapboxMap,
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
  map: MapboxMap,
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

export async function flyToAsync(map: MapboxMap, options: CameraOptions) {
  const duration =
    typeof options?.duration === 'number' ? options.duration : 3_000
  map.flyTo(options)
  await waitForMoveEnd(map, duration + 2_000)
}

export async function easeToAsync(map: MapboxMap, options: CameraOptions) {
  const duration =
    typeof options?.duration === 'number' ? options.duration : 1_500
  map.easeTo(options)
  await waitForMoveEnd(map, duration + 2_000)
}

export function applyPeakAtmosphere(map: MapboxMap) {
  map.setFog({
    range: [1.0, 10],
    color: 'rgb(150, 172, 196)',
    'high-color': 'rgb(48, 78, 140)',
    'horizon-blend': 0.16,
    'space-color': 'rgb(11, 16, 32)',
    'star-intensity': 0.12,
  })
}

/** Soften blown-out snow / bright satellite whites without killing contrast. */
export function softenSatelliteRaster(map: MapboxMap) {
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
 * desktop, clear of the top-right card on mobile) and a bit lower than raw
 * geo-center, which reads high under steep pitch.
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
    // Top-right details card — bias framing down/left into open map.
    return {
      top: 88,
      bottom: 56,
      left: 28,
      right: 120,
    }
  }
  return { top: 110, bottom: 48, left: 36, right: 300 }
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

/** Nudge look-at toward the camera so pitched terrain sits nearer mid-frame. */
export function peakFramingCenter(
  lon: number,
  lat: number,
  bearingDeg: number,
  offsetMeters = 520,
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
 */
export function startIdleSpin(
  map: MapboxMap,
  speedLng = IDLE_ROTATE_SPEED_LNG,
): { cancel: () => void } {
  let frame = 0
  let active = true

  const tick = () => {
    if (!active) return
    const { lng, lat } = map.getCenter()
    map.jumpTo({ center: [lng + speedLng, lat] })
    frame = requestAnimationFrame(tick)
  }

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
 * Uses rAF + setBearing because easeTo(bearing + 360) is a no-op after Mapbox
 * normalizes bearing into [-180, 180].
 */
export function orbitAsync(
  map: MapboxMap,
  durationMs: number,
  shouldContinue: () => boolean = () => true,
): Promise<void> {
  return new Promise((resolve) => {
    const startBearing = map.getBearing()
    const startedAt = performance.now()
    let frame = 0

    const tick = (now: number) => {
      if (!shouldContinue()) {
        cancelAnimationFrame(frame)
        resolve()
        return
      }

      const progress = Math.min(1, (now - startedAt) / durationMs)
      map.setBearing(startBearing + progress * 360)

      if (progress < 1) {
        frame = requestAnimationFrame(tick)
      } else {
        resolve()
      }
    }

    frame = requestAnimationFrame(tick)
  })
}
