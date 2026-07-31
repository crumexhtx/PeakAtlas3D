import { useMemo } from 'react'
import { BrowseBar } from '../components/BrowseBar'
import { CountryPanel } from '../components/CountryPanel'
import { ParkPanel } from '../components/ParkPanel'
import { useAtlas } from '../context/AtlasContext'
import { peaksIndex } from '../data/catalog'
import { useUnits } from '../context/UnitsContext'
import {
  buildCountrySummaries,
  peakMatchesCountry,
} from '../lib/countries'
import { uniqueSorted } from '../lib/geo'

export function HomePage() {
  const { units } = useUnits()
  const {
    browse,
    selectedCountry,
    mapPeaks,
    cinematic,
    earthOnly,
    selectedPark,
    clearPark,
    setBrowse,
    clearCountry,
  } = useAtlas()

  const allCountrySummaries = useMemo(() => buildCountrySummaries(peaksIndex), [])

  const countries = useMemo(
    () => allCountrySummaries.map((c) => c.name),
    [allCountrySummaries],
  )

  const ranges = useMemo(() => {
    const scoped = selectedCountry
      ? peaksIndex.filter((p) =>
          peakMatchesCountry(p, selectedCountry, allCountrySummaries),
        )
      : peaksIndex
    return uniqueSorted(scoped.map((p) => p.range))
  }, [selectedCountry, allCountrySummaries])

  const worldCountryCount = useMemo(
    () => buildCountrySummaries(mapPeaks).length,
    [mapPeaks],
  )

  const selectedSummary = useMemo(
    () =>
      selectedCountry
        ? (allCountrySummaries.find(
            (c) =>
              c.name === selectedCountry ||
              c.labels.includes(selectedCountry),
          ) ?? null)
        : null,
    [allCountrySummaries, selectedCountry],
  )

  const countryPeakList = useMemo(() => {
    if (!selectedCountry) return []
    return peaksIndex.filter((p) => {
      if (!peakMatchesCountry(p, selectedCountry, allCountrySummaries)) {
        return false
      }
      if (browse.range && p.range !== browse.range) return false
      if (browse.minElevationFt > 0 && p.elevationFt < browse.minElevationFt) {
        return false
      }
      return true
    })
  }, [browse, selectedCountry, allCountrySummaries])

  return (
    <>
      {selectedPark && !cinematic && !earthOnly && (
        <ParkPanel park={selectedPark} onClose={clearPark} />
      )}

      {selectedSummary && !cinematic && !earthOnly && !selectedPark && (
        <CountryPanel
          country={selectedSummary}
          peaks={countryPeakList}
          onClose={clearCountry}
        />
      )}

      {!cinematic && !earthOnly && !selectedPark && (
        <BrowseBar
          browse={browse}
          countries={countries}
          ranges={ranges}
          units={units}
          visibleCount={
            selectedCountry ? countryPeakList.length : worldCountryCount
          }
          totalCount={
            selectedCountry
              ? (selectedSummary?.peakCount ?? 0)
              : countries.length
          }
          countLabel={selectedCountry ? 'peaks' : 'countries'}
          onBrowseChange={setBrowse}
        />
      )}
    </>
  )
}
