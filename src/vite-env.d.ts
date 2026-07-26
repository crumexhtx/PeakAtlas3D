/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Optional MapTiler cloud key for hybrid satellite + terrain-rgb tiles. */
  readonly VITE_MAPTILER_KEY?: string
  /** @deprecated Removed — MapLibre migration; use VITE_MAPTILER_KEY. */
  readonly VITE_MAPBOX_TOKEN?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
