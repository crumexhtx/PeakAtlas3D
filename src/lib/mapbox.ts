export const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string | undefined

export const MAP_STYLE_SATELLITE = 'mapbox://styles/mapbox/satellite-streets-v12'
export const MAP_STYLE_OUTDOORS = 'mapbox://styles/mapbox/outdoors-v12'

export const TERRAIN_SOURCE_ID = 'mapbox-dem'
export const TERRAIN_SOURCE = {
  type: 'raster-dem' as const,
  url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
  tileSize: 512,
  maxzoom: 14,
}

export const HERO_TERRAIN_EXAGGERATION = 1.45
export const ORBIT_TERRAIN_EXAGGERATION = 1.28

export function hasMapboxToken(): boolean {
  return Boolean(MAPBOX_TOKEN && MAPBOX_TOKEN.startsWith('pk.'))
}

/** Cap Mapbox canvas fill-rate on large HiDPI screens (GL JS v3 has no pixelRatio option). */
const DESKTOP_PIXEL_RATIO_CAP = 1.25

/**
 * Temporarily override window.devicePixelRatio while Mapbox resizes its canvas.
 * Returns a restore function for AtlasMap unmount.
 */
export function applyMapPixelRatioCap(): () => void {
  if (typeof window === 'undefined') return () => {}

  const wide = window.matchMedia('(min-width: 900px)').matches
  if (!wide) return () => {}

  const native = window.devicePixelRatio || 1
  const capped = Math.min(native, DESKTOP_PIXEL_RATIO_CAP)
  if (capped >= native - 0.01) return () => {}

  const previous = Object.getOwnPropertyDescriptor(window, 'devicePixelRatio')
  try {
    Object.defineProperty(window, 'devicePixelRatio', {
      configurable: true,
      enumerable: true,
      get: () => capped,
    })
  } catch {
    return () => {}
  }

  return () => {
    try {
      if (previous) Object.defineProperty(window, 'devicePixelRatio', previous)
      else delete (window as { devicePixelRatio?: number }).devicePixelRatio
    } catch {
      // Browser may lock the property after override.
    }
  }
}
