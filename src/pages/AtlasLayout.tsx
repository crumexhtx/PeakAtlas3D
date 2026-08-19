import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { Outlet, useMatch, useNavigate, useSearchParams } from 'react-router-dom'
import { AppHeader } from '../components/AppHeader'
import { AtlasHint } from '../components/AtlasHint'
import { ClearMarkersToggle } from '../components/ClearMarkersToggle'
import { DeferredAtlasMap } from '../components/DeferredAtlasMap'
import { EarthOnlyToggle } from '../components/EarthOnlyToggle'
import { HomeExploreStrip } from '../components/HomeExploreStrip'
import { NationalParksToggle } from '../components/NationalParksToggle'
import { AtlasProvider, type AtlasContextValue } from '../context/AtlasContext'
import { getPeakById, peaksIndex } from '../data/catalog'
import { nationalParks } from '../data/nationalParks'
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
import { prefersReducedMotion } from '../lib/mapAnimations'
import type { NationalPark } from '../types/nationalPark'
import type { Peak, PeakBrowseFilters, PeakIndex } from '../types/peak'

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

  const [activePeak, setActivePeak] = useState<Peak | null>(null)
  const [peakLoading, setPeakLoading] = useState(() => Boolean(peakId))
  const [peakMissing, setPeakMissing] = useState(false)

  const countryFromUrl = searchParams.get('country') ?? ''

  const [browse, setBrowseState] = useState<PeakBrowseFilters>(() => ({
    ...initialBrowse,
    country: countryFromUrl,
  }))
  const [cinematic, setCinematic] = useState(false)
  const [cinematicStatus, setCinematicStatus] = useState('')
  const [skipNonce, setSkipNonce] = useState(0)
  const [hintActive, setHintActive] = useState(false)
  const [earthOnly, setEarthOnly] = useState(false)
  const [hideMapMarkers, setHideMapMarkers] = useState(false)
  const [showNationalParks, setShowNationalParks] = useState(false)
  const [selectedPark, setSelectedPark] = useState<NationalPark | null>(null)

  // Full dossier catalog is ~470KB parsed JS — only fetch it when a peak
  // route actually needs it (getPeakById). Prefetching on the globe homepage
  // competes with LCP / TBT on mobile.

  // Hide the peak dossier until the fly-in finishes — useLayoutEffect so the
  // panel never paints for a frame before cinematic mode engages.
  useLayoutEffect(() => {
    if (!peakId) {
      setCinematic(false)
      setCinematicStatus('')
      return
    }
    if (!prefersReducedMotion()) {
      setCinematic(true)
      setCinematicStatus('Approaching summit…')
    }
  }, [peakId])

  useEffect(() => {
    if (!peakId) {
      setActivePeak(null)
      setPeakLoading(false)
      setPeakMissing(false)
      return
    }

    let cancelled = false
    setPeakLoading(true)
    setPeakMissing(false)
    setActivePeak(null)

    getPeakById(peakId)
      .then((peak) => {
        if (cancelled) return
        setActivePeak(peak ?? null)
        setPeakMissing(!peak)
        setPeakLoading(false)
      })
      .catch(() => {
        if (cancelled) return
        setActivePeak(null)
        setPeakMissing(true)
        setPeakLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [peakId])

  const onHintActiveChange = useCallback((active: boolean) => {
    setHintActive(active)
  }, [])

  const toggleEarthOnly = useCallback(() => {
    setEarthOnly((v) => !v)
  }, [])

  const toggleHideMapMarkers = useCallback(() => {
    setHideMapMarkers((v) => !v)
  }, [])

  const toggleNationalParks = useCallback(() => {
    setShowNationalParks((v) => {
      if (v) setSelectedPark(null)
      return !v
    })
  }, [])

  const selectPark = useCallback((park: NationalPark) => {
    setSelectedPark(park)
  }, [])

  const clearPark = useCallback(() => {
    setSelectedPark(null)
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

  // Esc exits Earth view.
  useEffect(() => {
    if (!earthOnly) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setEarthOnly(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [earthOnly])

  // Esc restores peak map markers.
  useEffect(() => {
    if (!hideMapMarkers) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setHideMapMarkers(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [hideMapMarkers])

  // Esc closes selected park, then turns parks overlay off.
  useEffect(() => {
    if (!showNationalParks && !selectedPark) return
    function onKey(e: KeyboardEvent) {
      if (e.key !== 'Escape') return
      if (selectedPark) {
        setSelectedPark(null)
        return
      }
      setShowNationalParks(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [showNationalParks, selectedPark])

  const selectedCountry = browse.country || null
  const isWorldView = !peakId && !selectedCountry
  const onPeakRoute = Boolean(peakId)
  // Earth view is world-only — never stay on after drilling into a country/peak.
  const earthOnlyActive = earthOnly && isWorldView
  // Clear-markers is peak-only — drop it when leaving a summit.
  const hideMapMarkersActive = hideMapMarkers && onPeakRoute
  // Parks overlay is world-only (same surface as Earth view).
  const showNationalParksActive = showNationalParks && isWorldView && !earthOnlyActive

  useEffect(() => {
    if (!isWorldView && earthOnly) setEarthOnly(false)
  }, [isWorldView, earthOnly])

  useEffect(() => {
    if (!onPeakRoute && hideMapMarkers) setHideMapMarkers(false)
  }, [onPeakRoute, hideMapMarkers])

  useEffect(() => {
    if (!isWorldView && showNationalParks) {
      setShowNationalParks(false)
      setSelectedPark(null)
    }
  }, [isWorldView, showNationalParks])

  useEffect(() => {
    if (earthOnlyActive && selectedPark) setSelectedPark(null)
  }, [earthOnlyActive, selectedPark])

  useEffect(() => {
    if (peakId && peakLoading) return
    if (peakId && peakMissing) {
      applyDocumentMeta(metaForMissingPeak(peakId))
      return
    }
    if (activePeak) {
      applyDocumentMeta(metaForPeak(activePeak, selectedCountry))
      return
    }
    applyDocumentMeta(metaForAtlas(selectedCountry))
  }, [activePeak, peakId, peakLoading, peakMissing, selectedCountry])

  const countrySummaries = useMemo(() => buildCountrySummaries(peaksIndex), [])

  const mapPeaks = useMemo(() => {
    return peaksIndex.filter((p) => {
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
      setSelectedPark(null)
      setShowNationalParks(false)
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
    (peak: PeakIndex) => {
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
      mode: onPeakRoute ? 'peak' : selectedCountry ? 'country' : 'world',
      browse,
      selectedCountry,
      activePeak,
      peakLoading,
      mapPeaks,
      cinematic,
      cinematicStatus,
      earthOnly: earthOnlyActive,
      setEarthOnly,
      hideMapMarkers: hideMapMarkersActive,
      setHideMapMarkers,
      showNationalParks: showNationalParksActive,
      setShowNationalParks,
      selectedPark: showNationalParksActive ? selectedPark : null,
      selectPark,
      clearPark,
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
      clearPark,
      earthOnlyActive,
      hideMapMarkersActive,
      mapPeaks,
      onPeakRoute,
      openPeak,
      peakLoading,
      selectCountry,
      selectPark,
      selectedCountry,
      selectedPark,
      setBrowse,
      showNationalParksActive,
      skipCinematic,
    ],
  )

  return (
    <AtlasProvider value={atlasValue}>
      <div
        className={`app-shell${onPeakRoute ? ' peak-page' : ''}${
          earthOnlyActive ? ' is-earth-only' : ''
        }`}
      >
        <AppHeader
          peaks={peaksIndex}
          showBack={onPeakRoute}
          atlasHref={onPeakRoute ? backHref : '/'}
          onSelectPeak={openPeak}
        />

        <div
          className={`map-stage${onPeakRoute ? ' is-peak-mode' : ''}${
            cinematic ? ' is-cinematic' : ''
          }${earthOnlyActive ? ' is-earth-only' : ''}${
            hideMapMarkersActive ? ' is-clear-markers' : ''
          }`}
        >
          <DeferredAtlasMap
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
            funFactsEnabled={!hintActive && !earthOnlyActive}
            earthOnly={earthOnlyActive}
            hideMapMarkers={hideMapMarkersActive}
            showNationalParks={showNationalParksActive}
            nationalParks={nationalParks}
            selectedPark={showNationalParksActive ? selectedPark : null}
            onSelectPark={selectPark}
          />
          <AtlasHint
            visible={isWorldView && !cinematic && !earthOnlyActive}
            onActiveChange={onHintActiveChange}
          />
          <HomeExploreStrip
            visible={
              isWorldView &&
              !cinematic &&
              !earthOnlyActive &&
              !hintActive &&
              !showNationalParksActive
            }
            onSelectCountry={selectCountry}
            onSelectPeak={openPeak}
          />
          {isWorldView && (
            <>
              <EarthOnlyToggle active={earthOnlyActive} onToggle={toggleEarthOnly} />
              {!earthOnlyActive && (
                <>
                  <NationalParksToggle
                    active={showNationalParksActive}
                    onToggle={toggleNationalParks}
                  />
                </>
              )}
            </>
          )}
          {onPeakRoute && !cinematic && (
            <ClearMarkersToggle
              active={hideMapMarkersActive}
              onToggle={toggleHideMapMarkers}
            />
          )}
          <Outlet />
        </div>
      </div>
    </AtlasProvider>
  )
}
