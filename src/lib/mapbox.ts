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

export function hasMapboxToken(): boolean {
  return Boolean(MAPBOX_TOKEN && MAPBOX_TOKEN.startsWith('pk.'))
}
