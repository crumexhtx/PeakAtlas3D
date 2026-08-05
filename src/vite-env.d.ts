/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Optional MapTiler cloud key for satellite + terrain-rgb tiles. */
  readonly VITE_MAPTILER_KEY?: string
  /** Optional Plausible site domain (e.g. peakatlas3d.com). */
  readonly VITE_PLAUSIBLE_DOMAIN?: string
  /** Optional Plausible script URL (defaults to plausible.io). */
  readonly VITE_PLAUSIBLE_SCRIPT_SRC?: string
  /** @deprecated Removed — MapLibre migration; use VITE_MAPTILER_KEY. */
  readonly VITE_MAPBOX_TOKEN?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

interface Gtag {
  (...args: unknown[]): void
}

interface Window {
  dataLayer: unknown[]
  gtag: Gtag
}
