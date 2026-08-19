import {
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
  type TouchEvent,
} from 'react'

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

const SHEET_MQ = '(max-width: 900px)'

function shouldNudgeTab() {
  if (typeof window === 'undefined') return false
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
  // Tab chrome only shows under the mobile details-sheet breakpoint.
  return window.matchMedia(SHEET_MQ).matches
}

/**
 * Mobile: collapsed bottom tab by default; tap to expand upward.
 * Desktop: always shows the full body (bottom panel).
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
  /** Collapsible sheet UI only below 900px — desktop ignores expand state. */
  const [mobileSheet, setMobileSheet] = useState(false)
  const bodyId = useId()
  /** iOS-over-WebGL: touch may fire pointer/touch without a following click. */
  const touchToggledRef = useRef(false)

  useEffect(() => {
    const mq = window.matchMedia(SHEET_MQ)
    const sync = () => setMobileSheet(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    setExpanded(false)
    setNudging(false)
    touchToggledRef.current = false
    if (!shouldNudgeTab()) return

    // Brief pause after the peak/country opens, then bounce the tab twice.
    const start = window.setTimeout(() => setNudging(true), 650)
    const stop = window.setTimeout(() => setNudging(false), 650 + 2000)
    return () => {
      window.clearTimeout(start)
      window.clearTimeout(stop)
    }
  }, [resetKey])

  function toggleExpanded() {
    setNudging(false)
    setExpanded((v) => !v)
  }

  function onTabClick() {
    if (touchToggledRef.current) {
      touchToggledRef.current = false
      return
    }
    toggleExpanded()
  }

  function onTabTouchEnd(e: TouchEvent<HTMLButtonElement>) {
    // Prevent the delayed synthetic click and toggle immediately — the map
    // canvas gesture recognizer on iOS often swallows the click for peak cards.
    e.preventDefault()
    touchToggledRef.current = true
    toggleExpanded()
  }

  // Only inert/hide when the mobile collapsible sheet is actually collapsed.
  // Desktop keeps expanded=false but still shows the body (no tab chrome).
  const bodyCollapsed = mobileSheet && !expanded

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
          onClick={onTabClick}
          onTouchEnd={onTabTouchEnd}
        >
          <span className="details-sheet-handle" aria-hidden="true" />
          <span className="details-sheet-tab-copy">
            <span className="details-sheet-tab-title">{title}</span>
            {subtitle && (
              <span className="details-sheet-tab-sub">{subtitle}</span>
            )}
          </span>
          <span className="details-sheet-chevron" aria-hidden="true">
            {expanded ? '▴' : '▾'}
          </span>
        </button>

        {onClose && (
          <button
            type="button"
            className="details-sheet-close"
            aria-label={closeLabel}
            onClick={onClose}
            onTouchEnd={(e) => {
              e.preventDefault()
              onClose()
            }}
          >
            ×
          </button>
        )}
      </div>

      <div
        id={bodyId}
        className="details-sheet-body"
        aria-hidden={bodyCollapsed || undefined}
        // React 19 supports boolean `inert` for focus/interaction lock.
        inert={bodyCollapsed || undefined}
      >
        <div className="details-sheet-body-inner">{children}</div>
      </div>
    </div>
  )
}
