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

  function dismiss() {
    setDismissed(true)
    try {
      localStorage.setItem(ATLAS_HINT_STORAGE_KEY, '1')
    } catch {
      // ignore quota / private mode
    }
  }

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

export function isAtlasHintPending(): boolean {
  try {
    return localStorage.getItem(ATLAS_HINT_STORAGE_KEY) !== '1'
  } catch {
    return false
  }
}
