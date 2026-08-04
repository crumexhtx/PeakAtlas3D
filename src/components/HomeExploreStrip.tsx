import { Link } from 'react-router-dom'
import {
  atlasStatsLabel,
  getFeaturedCountries,
  getFeaturedPeaks,
} from '../data/featuredHome'
import { formatElevation } from '../lib/geo'
import { useUnits } from '../context/UnitsContext'
import type { PeakIndex } from '../types/peak'

type HomeExploreStripProps = {
  visible: boolean
  onSelectCountry: (country: string) => void
  onSelectPeak: (peak: PeakIndex) => void
}

/**
 * Lightweight world-view chrome: stats + country chips + featured peak links.
 * Keeps the globe as the hero — no photo cards over the map.
 */
export function HomeExploreStrip({
  visible,
  onSelectCountry,
  onSelectPeak,
}: HomeExploreStripProps) {
  const { units } = useUnits()
  const featuredPeaks = getFeaturedPeaks()
  const featuredCountries = getFeaturedCountries()

  if (!visible) return null

  return (
    <div className="home-explore" aria-label="Explore PeakAtlas3D">
      <p className="home-explore-stats">{atlasStatsLabel()}</p>

      <nav className="home-explore-countries" aria-label="Featured countries">
        {featuredCountries.map((c) => (
          <button
            key={c.name}
            type="button"
            className="home-explore-chip"
            onClick={() => onSelectCountry(c.name)}
          >
            {c.name}
          </button>
        ))}
        <Link to="/peaks" className="home-explore-chip home-explore-chip-link">
          All peaks
        </Link>
      </nav>

      <nav className="home-explore-featured" aria-label="Featured peaks">
        <span className="home-explore-featured-label">Featured</span>
        {featuredPeaks.map((peak) => (
          <button
            key={peak.id}
            type="button"
            className="home-explore-peak"
            title={`${peak.name} · ${formatElevation(peak.elevationFt, units)}`}
            onClick={() => onSelectPeak(peak)}
          >
            {peak.name}
          </button>
        ))}
      </nav>
    </div>
  )
}
