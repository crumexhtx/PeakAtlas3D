/**
 * Warm AtlasLayout + AtlasMap (and thus maplibre-gl) before the user opens /.
 * Safe to call repeatedly — runs at most once per page lifetime.
 */

type NetworkInformation = {
  saveData?: boolean
  effectiveType?: string
}

let prefetchStarted = false

export function shouldPrefetchAtlas(): boolean {
  if (typeof navigator === 'undefined') return false
  const conn = (navigator as Navigator & { connection?: NetworkInformation })
    .connection
  if (conn?.saveData) return false
  const type = conn?.effectiveType
  if (type === 'slow-2g' || type === '2g') return false
  return true
}

/** Kick off chunk downloads for the globe shell. */
export function prefetchAtlasShell(): void {
  if (prefetchStarted || !shouldPrefetchAtlas()) return
  prefetchStarted = true
  void import('../pages/AtlasLayout')
  void import('../components/AtlasMap')
}

/** Prefetch when the main thread is idle (content pages). */
export function scheduleIdleAtlasPrefetch(): () => void {
  if (typeof window === 'undefined' || !shouldPrefetchAtlas()) {
    return () => {}
  }

  let idleId = 0
  let timeoutId = 0

  const run = () => prefetchAtlasShell()

  if (typeof window.requestIdleCallback === 'function') {
    idleId = window.requestIdleCallback(run, { timeout: 4000 })
  } else {
    timeoutId = window.setTimeout(run, 2000)
  }

  return () => {
    if (idleId && typeof window.cancelIdleCallback === 'function') {
      window.cancelIdleCallback(idleId)
    }
    if (timeoutId) window.clearTimeout(timeoutId)
  }
}
