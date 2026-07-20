import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { DetailsSheet } from '../components/DetailsSheet'
import { PeakDossier } from '../components/PeakDossier'
import {
  peakMountainJsonLd,
  seoPeakHeading,
} from '../components/PeakSeoLayout'
import { useAtlas } from '../context/AtlasContext'
import { formatElevation } from '../lib/geo'
import { SITE_ORIGIN } from '../lib/documentMeta'
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
  const { activePeak, selectedCountry, cinematic, earthOnly } = useAtlas()
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
      {/*
        Semantic landmark for the peak dossier. The Mapbox WebGL canvas stays
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
          />
        </DetailsSheet>
        <p className="sr-only">
          {seoPeakHeading(activePeak.name)}. Interactive 3D topographic map of{' '}
          {activePeak.name} in the {activePeak.range}, {activePeak.country}.
        </p>
      </main>
    </div>
  )
}
