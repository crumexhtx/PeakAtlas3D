import type { Map as MapboxMap } from 'mapbox-gl'
import type { CountrySummary } from '../types/country'
import { isOnFrontHemisphere } from './globeVisibility'

export type CountryMarkerLayout = {
  show: boolean
  showLabel: boolean
}

type Box = { left: number; top: number; right: number; bottom: number }

function overlaps(a: Box, b: Box, pad = 4): boolean {
  return !(
    a.right + pad < b.left ||
    a.left - pad > b.right ||
    a.bottom + pad < b.top ||
    a.top - pad > b.bottom
  )
}

function boxAround(
  x: number,
  y: number,
  width: number,
  height: number,
  /** Anchor at bottom-center of the marker stack. */
  anchorBottom = true,
): Box {
  const left = x - width / 2
  const right = left + width
  const bottom = anchorBottom ? y : y + height / 2
  const top = bottom - height
  return { left, top, right, bottom }
}

/**
 * Pick which country markers to show (and whether to include the name label)
 * so dense regions like Europe don't stack on top of each other.
 */
export function declutterCountryMarkers(
  map: MapboxMap,
  countries: CountrySummary[],
): Map<string, CountryMarkerLayout> {
  const zoom = map.getZoom()
  const allowLabels = zoom >= 2.15
  const flagW = zoom < 1.7 ? 28 : 36
  const flagH = zoom < 1.7 ? 36 : 44
  const labeledW = 96
  const labeledH = 70

  const candidates = countries
    .filter((c) => isOnFrontHemisphere(map, c.lon, c.lat, 0.08))
    .map((c) => {
      const point = map.project([c.lon, c.lat])
      return { country: c, x: point.x, y: point.y }
    })
    .filter((c) => Number.isFinite(c.x) && Number.isFinite(c.y))
    .sort((a, b) => {
      const byPeaks = b.country.peakCount - a.country.peakCount
      if (byPeaks !== 0) return byPeaks
      return a.country.name.localeCompare(b.country.name)
    })

  const placed: Box[] = []
  const layout = new Map<string, CountryMarkerLayout>()

  for (const item of candidates) {
    const labeledBox = boxAround(item.x, item.y, labeledW, labeledH)
    const flagBox = boxAround(item.x, item.y, flagW, flagH)

    if (allowLabels && !placed.some((b) => overlaps(labeledBox, b))) {
      placed.push(labeledBox)
      layout.set(item.country.name, { show: true, showLabel: true })
      continue
    }

    if (!placed.some((b) => overlaps(flagBox, b))) {
      placed.push(flagBox)
      layout.set(item.country.name, { show: true, showLabel: false })
      continue
    }

    layout.set(item.country.name, { show: false, showLabel: false })
  }

  for (const country of countries) {
    if (!layout.has(country.name)) {
      layout.set(country.name, { show: false, showLabel: false })
    }
  }

  return layout
}
