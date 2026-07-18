import { Link } from 'react-router-dom'
import { PeakDossier } from '../components/PeakDossier'
import { useAtlas } from '../context/AtlasContext'
import { atlasHref } from '../lib/routes'

export function PeakPage() {
  const { activePeak, selectedCountry } = useAtlas()
  const backHref = atlasHref(selectedCountry)

  if (!activePeak) {
    return (
      <div className="empty-state peak-overlay-panel">
        <h1>Peak not found</h1>
        <p>That summit isn’t in the atlas yet.</p>
        <Link to={backHref} className="text-link">
          Back to atlas
        </Link>
      </div>
    )
  }

  return (
    <div className="peak-overlay-panel">
      <PeakDossier peak={activePeak} />
    </div>
  )
}
