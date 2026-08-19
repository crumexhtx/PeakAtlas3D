import { useMemo } from 'react'
import type { Peak } from '../types/peak'
import { useUnits } from '../context/UnitsContext'
import { PeakPhotoGallery } from './PeakPhotoGallery'
import { PeakSeoLayout } from './PeakSeoLayout'

type PeakDossierProps = {
  peak: Peak
  /** Skip mounting the photo gallery (e.g. during peak cinematic) to free decode/bandwidth. */
  deferMedia?: boolean
  /** Country context for nearby-peak links. */
  country?: string | null
}

function peakPhotos(peak: Peak) {
  if (peak.photos?.length) return peak.photos
  if (peak.photo?.url) return [peak.photo]
  return []
}

export function PeakDossier({
  peak,
  deferMedia = false,
  country = null,
}: PeakDossierProps) {
  const { units } = useUnits()
  const photos = useMemo(() => peakPhotos(peak), [peak])

  return (
    <PeakSeoLayout
      peak={peak}
      units={units}
      country={country}
      media={
        !deferMedia ? (
          <PeakPhotoGallery name={peak.name} photos={photos} />
        ) : undefined
      }
    />
  )
}
