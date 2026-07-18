import { useMemo } from 'react'
import { BrowseBar } from '../components/BrowseBar'
import { CountryPanel } from '../components/CountryPanel'
import { useAtlas } from '../context/AtlasContext'
import { peaks } from '../data/catalog'
import { useUnits } from '../context/UnitsContext'
import { buildCountrySummaries } from '../lib/countries'
import { filterPeaks, uniqueSorted } from '../lib/geo'

export function HomePage() {
  const { units } = useUnits()
  const {
    browse,
    selectedCountry,
    mapPeaks,
    setBrowse,
    clearCountry,
    openPeak,
  } = useAtlas()

  const countries = useMemo(() => uniqueSorted(peaks.map((p) => p.country)), [])

  const ranges = useMemo(() => {
    const scoped = selectedCountry
      ? peaks.filter((p) => p.country === selectedCountry)
      : peaks
    return uniqueSorted(scoped.map((p) => p.range))
  }, [selectedCountry])

  const allCountrySummaries = useMemo(() => buildCountrySummaries(peaks), [])

  const worldCountryCount = useMemo(
    () => buildCountrySummaries(mapPeaks).length,
    [mapPeaks],
  )

  const selectedSummary = useMemo(
    () =>
      selectedCountry
        ? (allCountrySummaries.find((c) => c.name === selectedCountry) ?? null)
        : null,
    [allCountrySummaries, selectedCountry],
  )

  const countryPeakList = useMemo(() => {
    if (!selectedCountry) return []
    return filterPeaks(peaks, browse)
  }, [browse, selectedCountry])

  return (
    <>
      {selectedSummary && (
        <CountryPanel
          country={selectedSummary}
          peaks={countryPeakList}
          onClose={clearCountry}
          onOpenPeak={openPeak}
        />
      )}

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
    </>
  )
}
