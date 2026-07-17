import type { FilterState, TerrainFilter } from '../types/peak'

type MapControlsProps = {
  filters: FilterState
  onToggleFilter: (key: TerrainFilter) => void
  onZoom: (direction: 1 | -1) => void
  onReset: () => void
}

const FILTER_LABELS: { key: TerrainFilter; label: string }[] = [
  { key: 'peaks', label: 'Peaks' },
  { key: 'towns', label: 'Towns' },
  { key: 'trails', label: 'Trails' },
]

export function MapControls({
  filters,
  onToggleFilter,
  onZoom,
  onReset,
}: MapControlsProps) {
  return (
    <div className="map-controls">
      <div className="filter-row" role="group" aria-label="Filter terrain">
        <span className="control-label">Filter Terrain</span>
        {FILTER_LABELS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            className={`filter-btn ${filters[key] ? 'is-active' : ''}`}
            aria-pressed={filters[key]}
            onClick={() => onToggleFilter(key)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="nav-row" role="group" aria-label="Camera controls">
        <button type="button" className="nav-btn" onClick={() => onZoom(1)} aria-label="Zoom in">
          +
        </button>
        <button type="button" className="nav-btn" onClick={() => onZoom(-1)} aria-label="Zoom out">
          −
        </button>
        <button type="button" className="reset-btn" onClick={onReset}>
          Reset Camera
        </button>
      </div>
    </div>
  )
}
