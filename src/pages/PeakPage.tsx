import { Link, useNavigate, useParams } from 'react-router-dom'
import { AppHeader } from '../components/AppHeader'
import { PeakDossier } from '../components/PeakDossier'
import { PeakTerrainMap } from '../components/PeakTerrainMap'
import { getPeakById, peaks } from '../data/catalog'

export function PeakPage() {
  const { peakId } = useParams()
  const navigate = useNavigate()
  const peak = peakId ? getPeakById(peakId) : undefined

  if (!peak) {
    return (
      <div className="app-shell">
        <AppHeader peaks={peaks} onSelectPeak={(p) => navigate(`/peak/${p.id}`)} showBack />
        <div className="empty-state">
          <h1>Peak not found</h1>
          <p>That summit isn’t in the atlas yet.</p>
          <Link to="/" className="text-link">
            Back to world map
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="app-shell">
      <AppHeader
        peaks={peaks}
        showBack
        onSelectPeak={(p) => navigate(`/peak/${p.id}`)}
      />
      <div className="peak-stage">
        <div className="peak-map-pane">
          <PeakTerrainMap key={peak.id} peak={peak} />
        </div>
        <PeakDossier peak={peak} />
      </div>
    </div>
  )
}
