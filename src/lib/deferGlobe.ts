type NetworkInformation = {
  saveData?: boolean
  effectiveType?: string
}

const INTERACT_EVENTS = [
  'pointerdown',
  'keydown',
  'touchstart',
  'wheel',
] as const

/** Auto-start delay after paint on phones so MapLibre misses the TBT window. */
export const CONSTRAINED_GLOBE_DELAY_MS = 5_500

/**
 * True on phones / low-end / Save-Data — delay WebGL until after `load` so
 * header/nav can paint without competing with MapLibre parse + globe init.
 */
export function isConstrainedGlobeDevice(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false
  }
  const conn = (navigator as Navigator & { connection?: NetworkInformation })
    .connection
  if (conn?.saveData) return true
  const type = conn?.effectiveType
  if (type === 'slow-2g' || type === '2g') return true
  if (window.matchMedia('(max-width: 800px)').matches) return true
  if (window.matchMedia('(pointer: coarse)').matches) return true
  return false
}

function whenIdle(fn: () => void, timeoutMs: number): () => void {
  if (typeof window.requestIdleCallback === 'function') {
    const id = window.requestIdleCallback(fn, { timeout: timeoutMs })
    return () => window.cancelIdleCallback(id)
  }
  const id = window.setTimeout(fn, 1)
  return () => window.clearTimeout(id)
}

/**
 * Run `start` after first paint (two rAFs) once the main thread is idle.
 * First user input starts immediately so real interaction is never gated.
 * Constrained devices wait a few seconds after load so MapLibre is not on
 * the critical path for LCP / TBT.
 */
export function scheduleGlobeInit(start: () => void): () => void {
  let cancelled = false
  let started = false
  let raf1 = 0
  let raf2 = 0
  let cancelIdle: (() => void) | null = null
  let delayId = 0
  let loadFallbackId = 0
  let onLoad: (() => void) | null = null

  const run = () => {
    if (cancelled || started) return
    started = true
    cleanupListeners()
    start()
  }

  const onInteract = () => run()

  const cleanupListeners = () => {
    for (const event of INTERACT_EVENTS) {
      window.removeEventListener(event, onInteract)
    }
    if (raf1) cancelAnimationFrame(raf1)
    if (raf2) cancelAnimationFrame(raf2)
    cancelIdle?.()
    cancelIdle = null
    if (delayId) window.clearTimeout(delayId)
    if (loadFallbackId) window.clearTimeout(loadFallbackId)
    if (onLoad) window.removeEventListener('load', onLoad)
  }

  const startConstrainedDelay = () => {
    if (cancelled || started || delayId) return
    if (loadFallbackId) {
      window.clearTimeout(loadFallbackId)
      loadFallbackId = 0
    }
    delayId = window.setTimeout(run, CONSTRAINED_GLOBE_DELAY_MS)
  }

  for (const event of INTERACT_EVENTS) {
    window.addEventListener(event, onInteract, { once: true, passive: true })
  }

  raf1 = requestAnimationFrame(() => {
    raf2 = requestAnimationFrame(() => {
      if (cancelled || started) return
      // Do not use requestIdleCallback on phones — it fires as soon as React
      // paints, which still puts MapLibre parse/WebGL on the TBT trace.
      if (isConstrainedGlobeDevice()) {
        if (document.readyState !== 'complete') {
          onLoad = startConstrainedDelay
          window.addEventListener('load', onLoad, { once: true })
          loadFallbackId = window.setTimeout(startConstrainedDelay, 4_000)
          return
        }
        startConstrainedDelay()
        return
      }
      cancelIdle = whenIdle(run, 1_200)
    })
  })

  return () => {
    cancelled = true
    cleanupListeners()
  }
}
