import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { DetailsSheet } from '../components/DetailsSheet'
import { PeakCanonicalLink } from '../components/PeakCanonicalLink'
import { PeakDossier } from '../components/PeakDossier'
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

  // Self-referencing canonical for this peak route (strips ?country=).
  const canonical = peakId ? <PeakCanonicalLink peakId={peakId} /> : null

  if (peakLoading) {
    return (
      <div className="empty-state peak-overlay-panel" role="status" aria-live="polite">
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

  const hideChrome = cinematic || earthOnly

  return (
    <div
      className={`peak-overlay-panel${hideChrome ? ' is-cinematic-hidden' : ''}`}
      aria-hidden={hideChrome || undefined}
    >
      {canonical}
      {/*
        Semantic landmark for the peak dossier. The MapLibre WebGL canvas stays
        full-bleed in .map-stage (sibling); this panel is pointer-events: none
        except on the sheet so mobile users can pan/swipe the globe freely.
      */}
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
  )
}
