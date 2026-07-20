type EarthOnlyToggleProps = {
  active: boolean
  onToggle: () => void
}

/** Floating control to hide atlas chrome and show only the globe + flags. */
export function EarthOnlyToggle({ active, onToggle }: EarthOnlyToggleProps) {
  return (
    <button
      type="button"
      className={`earth-only-toggle${active ? ' is-active' : ''}`}
      aria-pressed={active}
      aria-label={active ? 'Exit Earth view' : 'Earth view — globe and flags only'}
      title={active ? 'Exit Earth view' : 'Earth view'}
      onClick={onToggle}
    >
      <span className="earth-only-toggle-icon" aria-hidden="true">
        ○
      </span>
      <span className="earth-only-toggle-label">
        {active ? 'Exit view' : 'Earth view'}
      </span>
    </button>
  )
}
