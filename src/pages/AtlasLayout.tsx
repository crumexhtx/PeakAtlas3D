import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import { Outlet, useMatch, useNavigate, useSearchParams } from 'react-router-dom'
import { AppHeader } from '../components/AppHeader'
import { AtlasHint } from '../components/AtlasHint'
import { EarthOnlyToggle } from '../components/EarthOnlyToggle'
import { WorldTagline } from '../components/WorldTagline'
import { AtlasProvider, type AtlasContextValue } from '../context/AtlasContext'
import { getPeakById, peaksIndex } from '../data/catalog'
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
import type { Peak, PeakBrowseFilters, PeakIndex } from '../types/peak'

const AtlasMap = lazy(() =>
  import('../components/AtlasMap').then((m) => ({ default: m.AtlasMap })),
)

function AtlasMapFallback() {
  return (
    <div
      className="atlas-map-wrap atlas-map-fallback"
      role="status"
      aria-live="polite"
      aria-label="Loading 3D map"
    >
      <p className="atlas-map-fallback-copy">Loading globe…</p>
    </div>
  )
}

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

    getPeakById(peakId).then((peak) => {
      if (cancelled) return
      setActivePeak(peak ?? null)
      setPeakMissing(!peak)
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

  const selectedCountry = browse.country || null
  const isWorldView = !peakId && !selectedCountry
  // Earth view is world-only — never stay on after drilling into a country/peak.
  const earthOnlyActive = earthOnly && isWorldView

  useEffect(() => {
    if (!isWorldView && earthOnly) setEarthOnly(false)
  }, [isWorldView, earthOnly])

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
  const onPeakRoute = Boolean(peakId)

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
      earthOnlyActive,
      mapPeaks,
      onPeakRoute,
      openPeak,
      peakLoading,
      selectCountry,
      selectedCountry,
      setBrowse,
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
          }${earthOnlyActive ? ' is-earth-only' : ''}`}
        >
          <Suspense fallback={<AtlasMapFallback />}>
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
              funFactsEnabled={!hintActive && !earthOnlyActive}
              earthOnly={earthOnlyActive}
            />
          </Suspense>
          <AtlasHint
            visible={isWorldView && !cinematic && !earthOnlyActive}
            onActiveChange={onHintActiveChange}
          />
          <WorldTagline
            visible={isWorldView && !cinematic && !earthOnlyActive && !hintActive}
          />
          {isWorldView && (
            <EarthOnlyToggle active={earthOnlyActive} onToggle={toggleEarthOnly} />
          )}
          <Outlet />
        </div>
      </div>
    </AtlasProvider>
  )
}
