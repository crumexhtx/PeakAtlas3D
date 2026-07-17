import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppHeader } from '../components/AppHeader'
import { BrowseBar } from '../components/BrowseBar'
import { WorldMap } from '../components/WorldMap'
import { peaks } from '../data/catalog'
import { useUnits } from '../context/UnitsContext'
import { filterPeaks, uniqueSorted } from '../lib/geo'
import type { Peak, PeakBrowseFilters } from '../types/peak'

const initialBrowse: PeakBrowseFilters = {
  country: '',
  range: '',
  minElevationFt: 0,
}

export function HomePage() {
  const navigate = useNavigate()
  const { units } = useUnits()
  const [browse, setBrowse] = useState<PeakBrowseFilters>(initialBrowse)

  const countries = useMemo(() => uniqueSorted(peaks.map((p) => p.country)), [])
  const ranges = useMemo(() => {
    const scoped = browse.country
      ? peaks.filter((p) => p.country === browse.country)
      : peaks
    return uniqueSorted(scoped.map((p) => p.range))
  }, [browse.country])

  const visiblePeaks = useMemo(() => filterPeaks(peaks, browse), [browse])

  function openPeak(peak: Peak) {
    navigate(`/peak/${peak.id}`)
  }

  return (
    <div className="app-shell">
      <AppHeader peaks={visiblePeaks} onSelectPeak={openPeak} />

      <div className="map-stage">
        <WorldMap peaks={visiblePeaks} onSelectPeak={openPeak} />
        <BrowseBar
          browse={browse}
          countries={countries}
          ranges={ranges}
          units={units}
          visibleCount={visiblePeaks.length}
          totalCount={peaks.length}
          onBrowseChange={setBrowse}
        />
      </div>
    </div>
  )
}
