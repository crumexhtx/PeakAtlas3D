import { Link, useParams } from 'react-router-dom'
import { DetailsSheet } from '../components/DetailsSheet'
import { PeakDossier } from '../components/PeakDossier'
import { useAtlas } from '../context/AtlasContext'
import { formatElevation } from '../lib/geo'
import { atlasHref } from '../lib/routes'
import { useUnits } from '../context/UnitsContext'

export function PeakPage() {
  const { peakId } = useParams()
  const { activePeak, selectedCountry, cinematic, earthOnly } = useAtlas()
  const { units } = useUnits()
  const backHref = atlasHref(selectedCountry)

  if (!activePeak) {
    return (
      <div className="empty-state peak-overlay-panel" role="alert">
        <h1>Peak not found</h1>
        <p>
          {peakId
            ? `“${peakId}” isn’t in the PeakAtlas3D catalog.`
            : 'That summit isn’t in the atlas yet.'}
        </p>
        <Link to={backHref} className="text-link">
          Back to atlas
        </Link>
      </div>
    )
  }

  const hideChrome = cinematic || earthOnly

  return (
    <div
      className={`peak-overlay-panel${hideChrome ? ' is-cinematic-hidden' : ''}`}
      aria-hidden={hideChrome || undefined}
    >
      <DetailsSheet
        resetKey={activePeak.id}
        title={activePeak.name}
        subtitle={`${formatElevation(activePeak.elevationFt, units)} · ${activePeak.range}`}
      >
        <PeakDossier peak={activePeak} deferMedia={cinematic || earthOnly} />
      </DetailsSheet>
    </div>
  )
}
