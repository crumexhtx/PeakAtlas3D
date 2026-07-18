import type { PeakBrowseFilters, UnitSystem } from '../types/peak'

type BrowseBarProps = {
  browse: PeakBrowseFilters
  countries: string[]
  ranges: string[]
  units: UnitSystem
  visibleCount: number
  totalCount: number
  countLabel?: string
  onBrowseChange: (next: PeakBrowseFilters) => void
}

const ELEVATION_OPTIONS = [
  { value: 0, label: 'Any elevation' },
  { value: 10000, labelFt: '10,000+ ft', labelM: '3,000+ m' },
  { value: 14000, labelFt: '14,000+ ft', labelM: '4,250+ m' },
  { value: 20000, labelFt: '20,000+ ft', labelM: '6,100+ m' },
  { value: 26000, labelFt: '26,000+ ft', labelM: '8,000+ m' },
] as const

export function BrowseBar({
  browse,
  countries,
  ranges,
  units,
  visibleCount,
  totalCount,
  countLabel = 'peaks',
  onBrowseChange,
}: BrowseBarProps) {
  return (
    <div className="browse-bar" role="group" aria-label="Browse atlas">
      <label className="control-field">
        <span className="sr-only">Country</span>
        <select
          className="control-select"
          value={browse.country}
          onChange={(e) =>
            onBrowseChange({ ...browse, country: e.target.value, range: '' })
          }
        >
          <option value="">All countries</option>
          {countries.map((country) => (
            <option key={country} value={country}>
              {country}
            </option>
          ))}
        </select>
      </label>

      <label className="control-field">
        <span className="sr-only">Range</span>
        <select
          className="control-select"
          value={browse.range}
          onChange={(e) => onBrowseChange({ ...browse, range: e.target.value })}
          disabled={!browse.country}
        >
          <option value="">All ranges</option>
          {ranges.map((range) => (
            <option key={range} value={range}>
              {range}
            </option>
          ))}
        </select>
      </label>

      <label className="control-field">
        <span className="sr-only">Minimum elevation</span>
        <select
          className="control-select"
          value={browse.minElevationFt}
          onChange={(e) =>
            onBrowseChange({
              ...browse,
              minElevationFt: Number(e.target.value),
            })
          }
        >
          {ELEVATION_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {'label' in opt
                ? opt.label
                : units === 'metric'
                  ? opt.labelM
                  : opt.labelFt}
            </option>
          ))}
        </select>
      </label>

      <p className="result-count">
        {visibleCount === totalCount
          ? `${totalCount} ${countLabel}`
          : `${visibleCount} / ${totalCount} ${countLabel}`}
      </p>
    </div>
  )
}
