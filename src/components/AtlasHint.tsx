import { useEffect, useState } from 'react'

const STORAGE_KEY = 'peakatlas.hint.world.v1'

type AtlasHintProps = {
  visible: boolean
}

export function AtlasHint({ visible }: AtlasHintProps) {
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === '1'
    } catch {
      return false
    }
  })
  const [autoHidden, setAutoHidden] = useState(false)

  useEffect(() => {
    if (!visible || dismissed) return
    setAutoHidden(false)
    const id = window.setTimeout(() => setAutoHidden(true), 12_000)
    return () => window.clearTimeout(id)
  }, [visible, dismissed])

  function dismiss() {
    setDismissed(true)
    try {
      localStorage.setItem(STORAGE_KEY, '1')
    } catch {
      // ignore quota / private mode
    }
  }

  if (!visible || dismissed || autoHidden) return null

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
