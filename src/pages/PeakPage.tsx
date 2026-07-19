import { Link } from 'react-router-dom'
import { DetailsSheet } from '../components/DetailsSheet'
import { PeakDossier } from '../components/PeakDossier'
import { useAtlas } from '../context/AtlasContext'
import { formatElevation } from '../lib/geo'
import { atlasHref } from '../lib/routes'
import { useUnits } from '../context/UnitsContext'

export function PeakPage() {
  const { activePeak, selectedCountry } = useAtlas()
  const { units } = useUnits()
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
      <DetailsSheet
        resetKey={activePeak.id}
        title={activePeak.name}
        subtitle={`${formatElevation(activePeak.elevationFt, units)} · ${activePeak.range}`}
      >
        <PeakDossier peak={activePeak} />
      </DetailsSheet>
    </div>
  )
}
