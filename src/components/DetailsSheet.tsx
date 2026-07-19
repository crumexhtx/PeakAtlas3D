import { useEffect, useId, useState, type ReactNode } from 'react'

type DetailsSheetProps = {
  title: string
  subtitle?: string
  /** Reset collapse when this key changes (peak id / country). */
  resetKey: string
  children: ReactNode
  /** Optional close control shown on the collapsed tab (e.g. country back). */
  onClose?: () => void
  closeLabel?: string
}

function shouldNudgeTab() {
  if (typeof window === 'undefined') return false
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
  // Tab chrome only shows under the mobile details-sheet breakpoint.
  return window.matchMedia('(max-width: 900px)').matches
}

/**
 * Mobile: collapsed grab-tab by default; tap to expand to ~3/4 viewport.
 * Desktop: always shows the full body (side panel).
 */
export function DetailsSheet({
  title,
  subtitle,
  resetKey,
  children,
  onClose,
  closeLabel = 'Close',
}: DetailsSheetProps) {
  const [expanded, setExpanded] = useState(false)
  const [nudging, setNudging] = useState(false)
  const bodyId = useId()

  useEffect(() => {
    setExpanded(false)
    setNudging(false)
    if (!shouldNudgeTab()) return

    // Brief pause after the peak/country opens, then bounce the tab twice.
    const start = window.setTimeout(() => setNudging(true), 650)
    const stop = window.setTimeout(() => setNudging(false), 650 + 2000)
    return () => {
      window.clearTimeout(start)
      window.clearTimeout(stop)
    }
  }, [resetKey])

  return (
    <div
      className={`details-sheet${expanded ? ' is-expanded' : ' is-collapsed'}${
        nudging && !expanded ? ' is-nudging' : ''
      }`}
    >
      <div className="details-sheet-chrome">
        <button
          type="button"
          className="details-sheet-tab"
          aria-expanded={expanded}
          aria-controls={bodyId}
          onClick={() => {
            setNudging(false)
            setExpanded((v) => !v)
          }}
        >
          <span className="details-sheet-handle" aria-hidden="true" />
          <span className="details-sheet-tab-copy">
            <span className="details-sheet-tab-title">{title}</span>
            {subtitle && (
              <span className="details-sheet-tab-sub">{subtitle}</span>
            )}
          </span>
          <span className="details-sheet-chevron" aria-hidden="true">
            {expanded ? '▾' : '▴'}
          </span>
        </button>

        {onClose && (
          <button
            type="button"
            className="details-sheet-close"
            aria-label={closeLabel}
            onClick={onClose}
          >
            ×
          </button>
        )}
      </div>

      <div id={bodyId} className="details-sheet-body">
        {children}
      </div>
    </div>
  )
}
