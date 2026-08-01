/**
 * MapLibre basemap + terrain config.
 * Prefer MapTiler when `VITE_MAPTILER_KEY` is set; otherwise use free satellite
 * (EOX Sentinel-2) + Mapterhorn DEM so local/CI still boot without a paid key.
 *
 * One satellite style for world + detail — avoiding world↔hybrid swaps so the
 * basemap does not reload (and re-fetch tiles) on every country/peak/park entry.
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

/** Cap canvas fill-rate — MapLibre accepts `pixelRatio` natively. */
const DESKTOP_PIXEL_RATIO_CAP = 1.25
const MOBILE_PIXEL_RATIO_CAP = 1.5

/** World globe: stop requesting deep satellite tiles while spinning. */
export const WORLD_MAX_ZOOM = 3.5
/**
 * Peak/park detail ceiling — enough for summit framing (~12) without requesting
 * ultra-deep satellite tiles the UI never needs.
 */
export const DETAIL_MAX_ZOOM = 15

export function hasMapTilerKey(): boolean {
  return Boolean(MAPTILER_KEY && MAPTILER_KEY.trim().length > 0)
}

/** True when the map can initialize (always — free fallback is available). */
export function hasMapProvider(): boolean {
  return true
}

function freeSatelliteStyle(maxzoom: number, name: string): StyleSpecification {
  return {
    version: 8,
    name,
    sources: {
      satellite: {
        type: 'raster',
        tiles: [
          'https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2020_3857/default/g/{z}/{y}/{x}.jpg',
        ],
        tileSize: 256,
        attribution:
          '<a href="https://s2maps.eu/" target="_blank" rel="noopener">EOX Sentinel-2 Cloudless</a>',
        maxzoom,
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
}

/**
 * Shared free Sentinel-2 style for world + detail (stable object identity so
 * react-map-gl does not treat mode changes as a style reload).
 * @see https://s2maps.eu/
 */
const FREE_SATELLITE_STYLE = freeSatelliteStyle(
  14,
  'PeakAtlas free satellite',
)

/** Stable MapTiler satellite style URL (same for world and detail). */
function mapTilerSatelliteStyle(): string {
  return `https://api.maptiler.com/maps/satellite/style.json?key=${MAPTILER_KEY}`
}

/**
 * Atlas basemap — satellite only for both world and detail.
 * Mode is kept for call-site compatibility; it does not change the style.
 */
export function mapStyleForMode(
  _mode: 'world' | 'detail' = 'detail',
): string | StyleSpecification {
  if (hasMapTilerKey()) return mapTilerSatelliteStyle()
  return FREE_SATELLITE_STYLE
}

/** Stable style reference for the atlas map (avoids accidental remounts). */
export function atlasMapStyle(): string | StyleSpecification {
  return mapStyleForMode('detail')
}

/** @deprecated Prefer {@link mapStyleForMode}('detail') */
export function mapStyleUrl(): string | StyleSpecification {
  return mapStyleForMode('detail')
}

export function outdoorsStyleUrl(): string | StyleSpecification {
  if (hasMapTilerKey()) {
    return `https://api.maptiler.com/maps/outdoor-v2/style.json?key=${MAPTILER_KEY}`
  }
  return FREE_SATELLITE_STYLE
}

/** @deprecated Prefer {@link mapStyleForMode} */
export const MAP_STYLE_SATELLITE = mapStyleForMode('detail')
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
 * Cap canvas fill-rate on HiDPI screens (desktop + mobile).
 * Returns undefined when native DPR is already at/under the cap.
 */
export function cappedPixelRatio(): number | undefined {
  if (typeof window === 'undefined') return undefined
  const wide = window.matchMedia('(min-width: 900px)').matches
  const cap = wide ? DESKTOP_PIXEL_RATIO_CAP : MOBILE_PIXEL_RATIO_CAP
  const native = window.devicePixelRatio || 1
  const capped = Math.min(native, cap)
  return capped < native - 0.01 ? capped : undefined
}

/** @deprecated Prefer {@link cappedPixelRatio} */
export function desktopPixelRatio(): number | undefined {
  return cappedPixelRatio()
}

/**
 * @deprecated MapLibre supports `pixelRatio` / `setPixelRatio` — prefer
 * {@link cappedPixelRatio}. Kept as a no-op restore for old call sites.
 */
export function applyMapPixelRatioCap(): () => void {
  return () => {}
}
