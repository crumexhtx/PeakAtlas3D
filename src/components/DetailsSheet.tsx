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
  const bodyId = useId()

  useEffect(() => {
    setExpanded(false)
  }, [resetKey])

  return (
    <div
      className={`details-sheet${expanded ? ' is-expanded' : ' is-collapsed'}`}
    >
      <div className="details-sheet-chrome">
        <button
          type="button"
          className="details-sheet-tab"
          aria-expanded={expanded}
          aria-controls={bodyId}
          onClick={() => setExpanded((v) => !v)}
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
