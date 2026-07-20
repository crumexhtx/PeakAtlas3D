import { useEffect, useState } from 'react'

export const ATLAS_HINT_STORAGE_KEY = 'peakatlas.hint.world.v1'

type AtlasHintProps = {
  visible: boolean
  onActiveChange?: (active: boolean) => void
}

export function AtlasHint({ visible, onActiveChange }: AtlasHintProps) {
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem(ATLAS_HINT_STORAGE_KEY) === '1'
    } catch {
      return false
    }
  })
  const [autoHidden, setAutoHidden] = useState(false)

  const active = visible && !dismissed && !autoHidden

  useEffect(() => {
    if (!visible || dismissed) return
    setAutoHidden(false)
    const id = window.setTimeout(() => setAutoHidden(true), 12_000)
    return () => window.clearTimeout(id)
  }, [visible, dismissed])

  useEffect(() => {
    onActiveChange?.(active)
  }, [active, onActiveChange])

  function persistDismissed() {
    try {
      localStorage.setItem(ATLAS_HINT_STORAGE_KEY, '1')
    } catch {
      // ignore quota / private mode
    }
  }

  function dismiss() {
    setDismissed(true)
    persistDismissed()
  }

  // Auto-hide counts as dismissed in React state + storage so SPA return to world
  // does not resurrect the hint (storage alone is not enough).
  useEffect(() => {
    if (autoHidden && !dismissed) {
      setDismissed(true)
      persistDismissed()
    }
  }, [autoHidden, dismissed])

  if (!active) return null

  return (
    <div className="atlas-hint" role="status">
      <p className="atlas-hint-copy">
        Click a country flag to zoom in and explore its peaks.
      </p>
      <button type="button" className="atlas-hint-dismiss" onClick={dismiss}>
        Got it
      </button>
    </div>
  )
}
