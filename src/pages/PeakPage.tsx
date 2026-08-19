import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { DetailsSheet } from '../components/DetailsSheet'
import { PeakCanonicalLink } from '../components/PeakCanonicalLink'
import { PeakDossier } from '../components/PeakDossier'
import { PeakTripPanel } from '../components/PeakTripPanel'
import {
  peakMountainJsonLd,
  seoPeakHeading,
  seoPeakQualifier,
} from '../components/PeakSeoLayout'
import { useAtlas } from '../context/AtlasContext'
import { formatElevation } from '../lib/geo'
import { SITE_ORIGIN } from '../lib/documentMeta'
import { peakLocationLabel } from '../lib/peakLocation'
import { atlasHref } from '../lib/routes'
import { useUnits } from '../context/UnitsContext'

const JSON_LD_ID = 'peak-mountain-jsonld'

function upsertPeakJsonLd(peakId: string, data: object | null) {
  const existing = document.getElementById(JSON_LD_ID)
  if (!data) {
    existing?.remove()
    return
  }
  let el = existing as HTMLScriptElement | null
  if (!el) {
    el = document.createElement('script')
    el.type = 'application/ld+json'
    el.id = JSON_LD_ID
    document.head.appendChild(el)
  }
  el.text = JSON.stringify(data)
  el.dataset.peakId = peakId
}

export function PeakPage() {
  const { peakId } = useParams()
  const { activePeak, peakLoading, selectedCountry, cinematic, earthOnly } =
    useAtlas()
  const { units } = useUnits()
  const backHref = atlasHref(selectedCountry)

  useEffect(() => {
    if (!activePeak) {
      upsertPeakJsonLd(peakId ?? '', null)
      return
    }
    upsertPeakJsonLd(
      activePeak.id,
      peakMountainJsonLd(
        activePeak,
        `${SITE_ORIGIN}/peak/${activePeak.id}`,
      ),
    )
    return () => upsertPeakJsonLd(activePeak.id, null)
  }, [activePeak, peakId])

  const canonical = peakId ? <PeakCanonicalLink peakId={peakId} /> : null
  const hideChrome = cinematic || earthOnly
  const peakStale = Boolean(peakId && activePeak?.id !== peakId)
  const hiddenClass = hideChrome ? ' is-cinematic-hidden' : ''

  if (peakLoading || peakStale) {
    return (
      <div
        className={`empty-state peak-overlay-panel${hiddenClass}`}
        role="status"
        aria-live="polite"
        aria-hidden={hideChrome || undefined}
      >
        {canonical}
        <p>Loading peak…</p>
      </div>
    )
  }

  if (!activePeak) {
    return (
      <div className="empty-state peak-overlay-panel" role="alert">
        {canonical}
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

  return (
    <>
      <div
        className={`peak-trip-panel${hiddenClass}`}
        aria-hidden={hideChrome || undefined}
      >
        <aside
          className="peak-trip-main"
          aria-label={`${activePeak.name} staging, routes, and lodging`}
        >
          <DetailsSheet
            resetKey={activePeak.id}
            title="Trip planning"
            subtitle={`${activePeak.name} · access & routes`}
          >
            <PeakTripPanel peak={activePeak} />
          </DetailsSheet>
        </aside>
      </div>

      <div
        className={`peak-overlay-panel${hiddenClass}`}
        aria-hidden={hideChrome || undefined}
      >
        {canonical}
        <main
          className="peak-seo-main"
          aria-label={`${activePeak.name} peak details and 3D map context`}
        >
          <DetailsSheet
            resetKey={activePeak.id}
            title={activePeak.name}
            subtitle={`${formatElevation(activePeak.elevationFt, units)} · ${activePeak.range}`}
          >
            <PeakDossier
              peak={activePeak}
              deferMedia={cinematic || earthOnly}
              country={selectedCountry}
            />
          </DetailsSheet>
          <p className="sr-only">
            {seoPeakHeading(activePeak.name)}. {seoPeakQualifier()}. Interactive
            3D topographic map of {activePeak.name} in the {activePeak.range},{' '}
            {peakLocationLabel(activePeak)}.
          </p>
        </main>
      </div>
    </>
  )
}
