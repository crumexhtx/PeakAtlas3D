type AtlasMapFallbackProps = {
  status?: 'loading' | 'retry'
  onRetry?: () => void
  staleChunk?: boolean
}

/** Lightweight globe stand-in while MapLibre is still off the main thread. */
export function AtlasMapFallback({
  status = 'loading',
  onRetry,
  staleChunk = false,
}: AtlasMapFallbackProps) {
  const retry = status === 'retry'
  return (
    <div
      className={`atlas-map-wrap atlas-map-fallback${retry ? ' is-retry' : ''}`}
      role="status"
      aria-live="polite"
      aria-label={retry ? 'Map failed to load' : 'Loading 3D map'}
    >
      <span className="atlas-map-fallback-globe" aria-hidden="true" />
      {retry ? (
        <button type="button" className="atlas-map-fallback-retry" onClick={onRetry}>
          {staleChunk ? 'Reload to load the map' : 'Tap to load the map'}
        </button>
      ) : (
        <p className="atlas-map-fallback-copy">Loading globe…</p>
      )}
    </div>
  )
}
