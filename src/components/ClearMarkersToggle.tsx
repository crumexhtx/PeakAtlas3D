type ClearMarkersToggleProps = {
  active: boolean
  onToggle: () => void
}

/** Peak-mode control to hide summit flags, trail signs, and place pins. */
export function ClearMarkersToggle({ active, onToggle }: ClearMarkersToggleProps) {
  return (
    <button
      type="button"
      className={`clear-markers-toggle${active ? ' is-active' : ''}`}
      aria-pressed={active}
      aria-label={
        active
          ? 'Show map markers and trail signs'
          : 'Hide map markers and trail signs'
      }
      title={active ? 'Show markers' : 'Hide markers'}
      onClick={onToggle}
    >
      <span className="clear-markers-toggle-icon" aria-hidden="true">
        {active ? '◆' : '◇'}
      </span>
      <span className="clear-markers-toggle-label">
        {active ? 'Show markers' : 'Clear markers'}
      </span>
    </button>
  )
}
