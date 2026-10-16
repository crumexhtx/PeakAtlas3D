/** True when the atlas is opened with `?debug=map`. */
export function isMapDebug(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return new URLSearchParams(window.location.search).get('debug') === 'map'
  } catch {
    return false
  }
}

export function mapDebug(stage: string, extra?: Record<string, unknown>) {
  if (!isMapDebug()) return
  if (extra) console.debug(`[map] ${stage}`, extra)
  else console.debug(`[map] ${stage}`)
}

export function isStaleChunkError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err ?? '')
  return /failed to fetch dynamically imported module|importing a module script failed|error loading dynamically imported module|loading chunk .* failed/i.test(
    msg,
  )
}
