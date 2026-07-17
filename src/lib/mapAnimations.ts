import type { Map as MapboxMap } from 'mapbox-gl'

export const IDLE_ROTATE_DELAY_MS = 10_000
export const IDLE_ROTATE_SPEED_DEG = 0.04

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

export function waitForMoveEnd(map: MapboxMap): Promise<void> {
  return new Promise((resolve) => {
    map.once('moveend', () => resolve())
  })
}

export async function flyToAsync(map: MapboxMap, options: CameraOptions) {
  map.flyTo(options)
  await waitForMoveEnd(map)
}

export async function easeToAsync(map: MapboxMap, options: CameraOptions) {
  map.easeTo(options)
  await waitForMoveEnd(map)
}

/** Slow continuous bearing spin. Call cancel() to stop. */
export function startIdleSpin(
  map: MapboxMap,
  speedDeg = IDLE_ROTATE_SPEED_DEG,
): { cancel: () => void } {
  let frame = 0
  let active = true

  const tick = () => {
    if (!active) return
    map.setBearing(map.getBearing() + speedDeg)
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
