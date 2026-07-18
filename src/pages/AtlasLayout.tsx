import { useCallback, useEffect, useMemo, useState } from 'react'
import { Outlet, useMatch, useNavigate, useSearchParams } from 'react-router-dom'
import { AppHeader } from '../components/AppHeader'
import { AtlasHint } from '../components/AtlasHint'
import { AtlasMap } from '../components/AtlasMap'
import { AtlasProvider, type AtlasContextValue } from '../context/AtlasContext'
import { getPeakById, peaks } from '../data/catalog'
import {
  applyDocumentMeta,
  metaForAtlas,
  metaForPeak,
} from '../lib/documentMeta'
import { filterPeaks } from '../lib/geo'
import { atlasHref, peakHref } from '../lib/routes'
import type { Peak, PeakBrowseFilters } from '../types/peak'

const initialBrowse: PeakBrowseFilters = {
  country: '',
  range: '',
  minElevationFt: 0,
}

export function AtlasLayout() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const peakMatch = useMatch('/peak/:peakId')
  const peakId = peakMatch?.params.peakId
  const activePeak = peakId ? (getPeakById(peakId) ?? null) : null

  const countryFromUrl = searchParams.get('country') ?? ''

  const [browse, setBrowseState] = useState<PeakBrowseFilters>(() => ({
    ...initialBrowse,
    country: countryFromUrl,
  }))
  const [cinematic, setCinematic] = useState(false)
  const [cinematicStatus, setCinematicStatus] = useState('')
  const [skipNonce, setSkipNonce] = useState(0)

  useEffect(() => {
    setBrowseState((prev) => {
      if (prev.country === countryFromUrl) return prev
      return {
        ...prev,
        country: countryFromUrl,
        range: countryFromUrl === prev.country ? prev.range : '',
      }
    })
  }, [countryFromUrl])

  const selectedCountry = browse.country || null

  useEffect(() => {
    if (activePeak) {
      applyDocumentMeta(metaForPeak(activePeak, selectedCountry))
      return
    }
    applyDocumentMeta(metaForAtlas(selectedCountry))
  }, [activePeak, selectedCountry])

  const mapPeaks = useMemo(() => {
    if (selectedCountry) return filterPeaks(peaks, browse)
    return filterPeaks(peaks, { ...browse, country: '' })
  }, [browse, selectedCountry])

  const syncCountryToUrl = useCallback(
    (country: string) => {
      if (country) setSearchParams({ country }, { replace: true })
      else setSearchParams({}, { replace: true })
    },
    [setSearchParams],
  )

  const setBrowse = useCallback(
    (next: PeakBrowseFilters) => {
      setBrowseState(next)
      if (next.country !== browse.country) {
        syncCountryToUrl(next.country)
      }
    },
    [browse.country, syncCountryToUrl],
  )

  const selectCountry = useCallback(
    (country: string) => {
      setBrowseState((prev) => ({
        ...prev,
        country,
        range: country === prev.country ? prev.range : '',
      }))
      syncCountryToUrl(country)
    },
    [syncCountryToUrl],
  )

  const clearCountry = useCallback(() => {
    setBrowseState((prev) => ({ ...prev, country: '', range: '' }))
    syncCountryToUrl('')
  }, [syncCountryToUrl])

  const openPeak = useCallback(
    (peak: Peak) => {
      navigate(peakHref(peak.id, selectedCountry))
    },
    [navigate, selectedCountry],
  )

  const onCinematicChange = useCallback(
    (next: { active: boolean; status: string }) => {
      setCinematic(next.active)
      setCinematicStatus(next.status)
    },
    [],
  )

  const skipCinematic = useCallback(() => {
    setSkipNonce((n) => n + 1)
  }, [])

  const backHref = atlasHref(selectedCountry || countryFromUrl || null)

  const atlasValue = useMemo<AtlasContextValue>(
    () => ({
      mode: activePeak ? 'peak' : selectedCountry ? 'country' : 'world',
      browse,
      selectedCountry,
      activePeak,
      mapPeaks,
      cinematic,
      cinematicStatus,
      setBrowse,
      selectCountry,
      clearCountry,
      openPeak,
      skipCinematic,
    }),
    [
      activePeak,
      browse,
      cinematic,
      cinematicStatus,
      clearCountry,
      mapPeaks,
      openPeak,
      selectCountry,
      selectedCountry,
      setBrowse,
      skipCinematic,
    ],
  )

  return (
    <AtlasProvider value={atlasValue}>
      <div className={`app-shell ${activePeak ? 'peak-page' : ''}`}>
        <AppHeader
          peaks={peaks}
          showBack={Boolean(activePeak)}
          atlasHref={activePeak ? backHref : '/'}
          onSelectPeak={openPeak}
        />

        <div className={`map-stage ${activePeak ? 'is-peak-mode' : ''}`}>
          <AtlasMap
            peaks={mapPeaks}
            selectedCountry={selectedCountry}
            activePeak={activePeak}
            onSelectCountry={selectCountry}
            onSelectPeak={openPeak}
            cinematic={cinematic}
            cinematicStatus={cinematicStatus}
            onCinematicChange={onCinematicChange}
            onSkipCinematic={skipCinematic}
            skipNonce={skipNonce}
          />
          <AtlasHint visible={!activePeak && !selectedCountry && !cinematic} />
          <Outlet />
        </div>
      </div>
    </AtlasProvider>
  )
}
