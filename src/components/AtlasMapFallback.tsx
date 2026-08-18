/** Lightweight globe stand-in while MapLibre is still off the main thread. */
export function AtlasMapFallback() {
  return (
    <div
      className="atlas-map-wrap atlas-map-fallback"
      role="status"
      aria-live="polite"
      aria-label="Loading 3D map"
    >
      <span className="atlas-map-fallback-globe" aria-hidden="true" />
      <p className="atlas-map-fallback-copy">Loading globe…</p>
    </div>
  )
}
