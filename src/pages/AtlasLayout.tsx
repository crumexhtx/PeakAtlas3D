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
  metaForMissingPeak,
  metaForPeak,
} from '../lib/documentMeta'
import {
  buildCountrySummaries,
  peakMatchesCountry,
} from '../lib/countries'
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
  const [hintActive, setHintActive] = useState(false)

  const onHintActiveChange = useCallback((active: boolean) => {
    setHintActive(active)
  }, [])

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
    if (peakId && !activePeak) {
      applyDocumentMeta(metaForMissingPeak(peakId))
      return
    }
    if (activePeak) {
      applyDocumentMeta(metaForPeak(activePeak, selectedCountry))
      return
    }
    applyDocumentMeta(metaForAtlas(selectedCountry))
  }, [activePeak, peakId, selectedCountry])

  const countrySummaries = useMemo(() => buildCountrySummaries(peaks), [])

  const mapPeaks = useMemo(() => {
    return peaks.filter((p) => {
      if (
        selectedCountry &&
        !peakMatchesCountry(p, selectedCountry, countrySummaries)
      ) {
        return false
      }
      if (browse.range && p.range !== browse.range) return false
      if (browse.minElevationFt > 0 && p.elevationFt < browse.minElevationFt) {
        return false
      }
      return true
    })
  }, [browse, selectedCountry, countrySummaries])

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

        <div
          className={`map-stage${activePeak ? ' is-peak-mode' : ''}${
            cinematic ? ' is-cinematic' : ''
          }`}
        >
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
            funFactsEnabled={!hintActive}
          />
          <AtlasHint
            visible={!peakId && !selectedCountry && !cinematic}
            onActiveChange={onHintActiveChange}
          />
          <Outlet />
        </div>
      </div>
    </AtlasProvider>
  )
}
