/**
 * MapLibre basemap + terrain config.
 * Prefer MapTiler when `VITE_MAPTILER_KEY` is set; otherwise use free satellite
 * (EOX Sentinel-2) + Mapterhorn DEM so local/CI still boot without a paid key.
 */
import type {
  RasterDEMSourceSpecification,
  StyleSpecification,
} from 'maplibre-gl'

export const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY as
  | string
  | undefined

export const TERRAIN_SOURCE_ID = 'terrain-dem'

export const HERO_TERRAIN_EXAGGERATION = 1.45
export const ORBIT_TERRAIN_EXAGGERATION = 1.28

/** Desktop HiDPI cap — MapLibre accepts `pixelRatio` natively. */
const DESKTOP_PIXEL_RATIO_CAP = 1.25

export function hasMapTilerKey(): boolean {
  return Boolean(MAPTILER_KEY && MAPTILER_KEY.trim().length > 0)
}

/** True when the map can initialize (always — free fallback is available). */
export function hasMapProvider(): boolean {
  return true
}

export function mapStyleUrl(): string | StyleSpecification {
  if (hasMapTilerKey()) {
    return `https://api.maptiler.com/maps/hybrid/style.json?key=${MAPTILER_KEY}`
  }
  return FREE_SATELLITE_STYLE
}

export function outdoorsStyleUrl(): string | StyleSpecification {
  if (hasMapTilerKey()) {
    return `https://api.maptiler.com/maps/outdoor-v2/style.json?key=${MAPTILER_KEY}`
  }
  return FREE_SATELLITE_STYLE
}

/** @deprecated Prefer {@link mapStyleUrl} — kept for call-site clarity during migration. */
export const MAP_STYLE_SATELLITE = mapStyleUrl()
/** @deprecated Prefer {@link outdoorsStyleUrl} */
export const MAP_STYLE_OUTDOORS = outdoorsStyleUrl()

export function terrainSource(): RasterDEMSourceSpecification {
  if (hasMapTilerKey()) {
    return {
      type: 'raster-dem',
      url: `https://api.maptiler.com/tiles/terrain-rgb-v2/tiles.json?key=${MAPTILER_KEY}`,
      tileSize: 512,
    }
  }
  return {
    type: 'raster-dem',
    url: 'https://tiles.mapterhorn.com/tilejson.json',
    tileSize: 512,
  }
}

/** @deprecated Prefer {@link terrainSource} */
export const TERRAIN_SOURCE = terrainSource()

/**
 * Free Sentinel-2 cloudless mosaic for keyless globe/satellite viewing.
 * @see https://s2maps.eu/
 */
const FREE_SATELLITE_STYLE: StyleSpecification = {
  version: 8,
  name: 'PeakAtlas free satellite',
  sources: {
    satellite: {
      type: 'raster',
      tiles: [
        'https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2020_3857/default/g/{z}/{y}/{x}.jpg',
      ],
      tileSize: 256,
      attribution:
        '<a href="https://s2maps.eu/" target="_blank" rel="noopener">EOX Sentinel-2 Cloudless</a>',
      maxzoom: 14,
    },
  },
  layers: [
    {
      id: 'background',
      type: 'background',
      paint: { 'background-color': '#0b1220' },
    },
    {
      id: 'satellite',
      type: 'raster',
      source: 'satellite',
      paint: { 'raster-opacity': 1 },
    },
  ],
  sky: {
    'atmosphere-blend': [
      'interpolate',
      ['linear'],
      ['zoom'],
      0,
      1,
      2.5,
      0,
    ],
  },
}

/** Cap canvas fill-rate on large HiDPI desktops. */
export function desktopPixelRatio(): number | undefined {
  if (typeof window === 'undefined') return undefined
  const wide = window.matchMedia('(min-width: 900px)').matches
  if (!wide) return undefined
  const native = window.devicePixelRatio || 1
  const capped = Math.min(native, DESKTOP_PIXEL_RATIO_CAP)
  return capped < native - 0.01 ? capped : undefined
}

/**
 * @deprecated MapLibre supports `pixelRatio` / `setPixelRatio` — prefer
 * {@link desktopPixelRatio}. Kept as a no-op restore for old call sites.
 */
export function applyMapPixelRatioCap(): () => void {
  return () => {}
}
