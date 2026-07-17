import { useMemo, useState } from 'react'
import peaksData from './data/peaks.json'
import { DetailSidebar } from './components/DetailSidebar'
import { GlobeScene, type CameraCommand } from './components/GlobeScene'
import { Header } from './components/Header'
import { MapControls } from './components/MapControls'
import type { FilterState, Peak, TerrainFilter } from './types/peak'
import './styles/app.css'

const peaks = peaksData as Peak[]

const initialFilters: FilterState = {
  peaks: true,
  towns: false,
  trails: false,
}

function App() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [filters, setFilters] = useState<FilterState>(initialFilters)
  const [cameraCommand, setCameraCommand] = useState<CameraCommand>(null)
  const [nonce, setNonce] = useState(0)

  const selectedPeak = useMemo(
    () => peaks.find((p) => p.id === selectedId) ?? null,
    [selectedId],
  )

  function nextNonce() {
    const n = nonce + 1
    setNonce(n)
    return n
  }

  function selectPeak(peak: Peak) {
    setSelectedId(peak.id)
    setCameraCommand({ type: 'flyTo', peak, nonce: nextNonce() })
  }

  function toggleFilter(key: TerrainFilter) {
    setFilters((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="app-shell">
      <Header peaks={peaks} onSelectPeak={selectPeak} />

      <div className="main-stage">
        <div className="globe-pane">
          <GlobeScene
            peaks={peaks}
            selectedId={selectedId}
            filters={filters}
            cameraCommand={cameraCommand}
            onSelect={selectPeak}
          />
          <MapControls
            filters={filters}
            onToggleFilter={toggleFilter}
            onZoom={(direction) =>
              setCameraCommand({ type: 'zoom', direction, nonce: nextNonce() })
            }
            onReset={() =>
              setCameraCommand({ type: 'reset', nonce: nextNonce() })
            }
          />
        </div>

        <DetailSidebar
          peak={selectedPeak}
          showTrails={filters.trails}
          onClose={() => setSelectedId(null)}
        />
      </div>
    </div>
  )
}

export default App
