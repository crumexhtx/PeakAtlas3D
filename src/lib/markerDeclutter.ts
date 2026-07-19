import type { Map as MapboxMap } from 'mapbox-gl'
import type { CountrySummary } from '../types/country'
import { isOnFrontHemisphere } from './globeVisibility'

export type CountryMarkerLayout = {
  show: boolean
  showLabel: boolean
}

/** Stricter to appear; looser to disappear — cuts limb flicker while spinning. */
const ENTER_DOT = 0.14
const EXIT_DOT = 0.02
/** Phones: keep flags nearer screen-center so the small globe doesn’t look crowded. */
const ENTER_DOT_NARROW = 0.2
const EXIT_DOT_NARROW = 0.05
const MAX_SPIN_FLAGS_NARROW = 12
const NARROW_MAP_PX = 640

export function layoutsEqual(
  a: Map<string, CountryMarkerLayout>,
  b: Map<string, CountryMarkerLayout>,
): boolean {
  if (a.size !== b.size) return false
  for (const [key, value] of a) {
    const other = b.get(key)
    if (!other || other.show !== value.show || other.showLabel !== value.showLabel) {
      return false
    }
  }
  return true
}

function stickyFront(
  map: MapboxMap,
  lon: number,
  lat: number,
  wasShown: boolean,
  enterDot = ENTER_DOT,
  exitDot = EXIT_DOT,
): boolean {
  return isOnFrontHemisphere(map, lon, lat, wasShown ? exitDot : enterDot)
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
 * During idle spin: only front-hemisphere visibility with hysteresis.
 * Skips overlap packing so flags don't pop in/out every frame.
 * On narrow maps, also caps how many flags stay visible (desktop unchanged).
 */
export function spinCountryMarkerLayout(
  map: MapboxMap,
  countries: CountrySummary[],
  previous?: Map<string, CountryMarkerLayout>,
): Map<string, CountryMarkerLayout> {
  const narrow = map.getContainer().clientWidth <= NARROW_MAP_PX
  const enterDot = narrow ? ENTER_DOT_NARROW : ENTER_DOT
  const exitDot = narrow ? EXIT_DOT_NARROW : EXIT_DOT

  const layout = new Map<string, CountryMarkerLayout>()
  for (const country of countries) {
    const wasShown = previous?.get(country.name)?.show ?? false
    layout.set(country.name, {
      show: stickyFront(map, country.lon, country.lat, wasShown, enterDot, exitDot),
      showLabel: false,
    })
  }

  if (!narrow) return layout

  const visible = countries.filter((c) => layout.get(c.name)?.show)
  if (visible.length <= MAX_SPIN_FLAGS_NARROW) return layout

  const prevShown = new Set<string>()
  if (previous) {
    for (const [name, state] of previous) {
      if (state.show) prevShown.add(name)
    }
  }

  visible.sort((a, b) => {
    const aPrev = prevShown.has(a.name) ? 1 : 0
    const bPrev = prevShown.has(b.name) ? 1 : 0
    if (aPrev !== bPrev) return bPrev - aPrev
    const byPeaks = b.peakCount - a.peakCount
    if (byPeaks !== 0) return byPeaks
    return a.name.localeCompare(b.name)
  })

  const keep = new Set(
    visible.slice(0, MAX_SPIN_FLAGS_NARROW).map((c) => c.name),
  )
  for (const country of visible) {
    if (!keep.has(country.name)) {
      layout.set(country.name, { show: false, showLabel: false })
    }
  }

  return layout
}

/**
 * Pick which country markers to show (and whether to include the name label)
 * so dense regions like Europe don't stack on top of each other.
 */
export function declutterCountryMarkers(
  map: MapboxMap,
  countries: CountrySummary[],
  previous?: Map<string, CountryMarkerLayout>,
): Map<string, CountryMarkerLayout> {
  const zoom = map.getZoom()
  const allowLabels = zoom >= 2.15
  const flagW = zoom < 1.7 ? 28 : 36
  const flagH = zoom < 1.7 ? 36 : 44
  const labeledW = 96
  const labeledH = 70

  const candidates = countries
    .filter((c) =>
      stickyFront(map, c.lon, c.lat, previous?.get(c.name)?.show ?? false),
    )
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
    const prev = previous?.get(item.country.name)

    // Prefer keeping the previous label/flag choice when still valid.
    if (
      allowLabels &&
      prev?.showLabel &&
      !placed.some((b) => overlaps(labeledBox, b))
    ) {
      placed.push(labeledBox)
      layout.set(item.country.name, { show: true, showLabel: true })
      continue
    }

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
