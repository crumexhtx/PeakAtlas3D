import type { CountrySummary } from '../types/country'
import type { Peak } from '../types/peak'
import { flagUrl } from '../lib/countries'
import { formatElevation } from '../lib/geo'
import { useUnits } from '../context/UnitsContext'

type CountryPanelProps = {
  country: CountrySummary
  peaks: Peak[]
  onClose: () => void
  onOpenPeak: (peak: Peak) => void
}

export function CountryPanel({
  country,
  peaks,
  onClose,
  onOpenPeak,
}: CountryPanelProps) {
  const { units } = useUnits()
  const flag = flagUrl(country.name, 80)
  const ranked = [...peaks].sort((a, b) => b.elevationFt - a.elevationFt)

  return (
    <aside className="country-panel" aria-label={`${country.name} peak summary`}>
      <div className="country-panel-top">
        <div className="country-panel-heading">
          {flag && (
            <img src={flag} alt="" className="country-panel-flag" width={44} height={30} />
          )}
          <div>
            <p className="dossier-eyebrow">Country</p>
            <h2 className="country-panel-title">{country.name}</h2>
          </div>
        </div>
        <button type="button" className="icon-btn" onClick={onClose} aria-label="Back to world">
          ×
        </button>
      </div>

      <dl className="info-list country-stats">
        <div>
          <dt>Peaks</dt>
          <dd>{country.peakCount}</dd>
        </div>
        <div>
          <dt>Highest</dt>
          <dd>
            <button
              type="button"
              className="inline-peak-link"
              onClick={() => onOpenPeak(country.highestPeak)}
            >
              {country.highestPeak.name}
            </button>
            <span className="stat-meta">
              {formatElevation(country.highestPeak.elevationFt, units)}
            </span>
          </dd>
        </div>
        <div>
          <dt>Average elev.</dt>
          <dd>{formatElevation(Math.round(country.avgElevationFt), units)}</dd>
        </div>
        <div>
          <dt>Ranges</dt>
          <dd>{country.ranges.length}</dd>
        </div>
      </dl>

      {country.ranges.length > 0 && (
        <p className="country-ranges">{country.ranges.slice(0, 4).join(' · ')}</p>
      )}

      <h3 className="info-heading">Peaks in {country.name}</h3>
      <ul className="country-peak-list">
        {ranked.map((peak) => (
          <li key={peak.id}>
            <button type="button" className="country-peak-row" onClick={() => onOpenPeak(peak)}>
              <span className="result-name">{peak.name}</span>
              <span className="result-meta">
                {formatElevation(peak.elevationFt, units)} · {peak.range}
              </span>
            </button>
          </li>
        ))}
      </ul>

      <button type="button" className="back-world-btn" onClick={onClose}>
        ← Back to world
      </button>
    </aside>
  )
}
