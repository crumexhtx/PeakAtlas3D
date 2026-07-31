type NationalParksToggleProps = {
  active: boolean
  onToggle: () => void
}

/** World-view control to show curated USA National Park markers. */
export function NationalParksToggle({
  active,
  onToggle,
}: NationalParksToggleProps) {
  return (
    <button
      type="button"
      className={`national-parks-toggle${active ? ' is-active' : ''}`}
      aria-pressed={active}
      aria-label={
        active
          ? 'Hide national park markers'
          : 'Show national park markers'
      }
      title={active ? 'Hide parks' : 'National parks'}
      onClick={onToggle}
    >
      <span className="national-parks-toggle-icon" aria-hidden="true">
        ▣
      </span>
      <span className="national-parks-toggle-label">
        {active ? 'Hide parks' : 'Parks'}
      </span>
    </button>
  )
}
