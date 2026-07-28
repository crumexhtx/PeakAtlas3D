import type { Map as MapLibreMap } from 'maplibre-gl'
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
const MAX_SPIN_FLAGS = 16
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
  map: MapLibreMap,
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
 * Caps visible flags on all viewports (tighter on phones).
 */
export function spinCountryMarkerLayout(
  map: MapLibreMap,
  countries: CountrySummary[],
  previous?: Map<string, CountryMarkerLayout>,
): Map<string, CountryMarkerLayout> {
  const narrow = map.getContainer().clientWidth <= NARROW_MAP_PX
  const enterDot = narrow ? ENTER_DOT_NARROW : ENTER_DOT
  const exitDot = narrow ? EXIT_DOT_NARROW : EXIT_DOT
  const maxFlags = narrow ? MAX_SPIN_FLAGS_NARROW : MAX_SPIN_FLAGS

  const layout = new Map<string, CountryMarkerLayout>()
  for (const country of countries) {
    const wasShown = previous?.get(country.name)?.show ?? false
    layout.set(country.name, {
      show: stickyFront(map, country.lon, country.lat, wasShown, enterDot, exitDot),
      showLabel: false,
    })
  }

  const visible = countries.filter((c) => layout.get(c.name)?.show)
  if (visible.length <= maxFlags) return layout

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

  const keep = new Set(visible.slice(0, maxFlags).map((c) => c.name))
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
  map: MapLibreMap,
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

export type PeakMarkerLayout = {
  show: boolean
}

export function peakLayoutsEqual(
  a: Map<string, PeakMarkerLayout>,
  b: Map<string, PeakMarkerLayout>,
): boolean {
  if (a.size !== b.size) return false
  for (const [key, value] of a) {
    const other = b.get(key)
    if (!other || other.show !== value.show) return false
  }
  return true
}

const MAX_COUNTRY_PEAK_FLAGS = 28
const MAX_COUNTRY_PEAK_FLAGS_NARROW = 18
/** Keep edge peaks from popping when panning; still excludes far off-screen peaks. */
const VIEWPORT_PAD_PX = 48

function inViewport(
  x: number,
  y: number,
  width: number,
  height: number,
  pad = VIEWPORT_PAD_PX,
): boolean {
  return x >= -pad && x <= width + pad && y >= -pad && y <= height + pad
}

/**
 * Cap and de-overlap peak flags in country drill-in (USA can hit 80+).
 * Prefer peaks in the current viewport (so zooming into the East Coast
 * doesn't lose flags to off-screen Rockies/Alaska), then higher elevation.
 */
export function declutterPeakMarkers(
  map: MapLibreMap,
  peaks: Array<{
    id: string
    lat: number
    lon: number
    elevationFt: number
    name: string
  }>,
  previous?: Map<string, PeakMarkerLayout>,
): Map<string, PeakMarkerLayout> {
  const container = map.getContainer()
  const narrow = container.clientWidth <= NARROW_MAP_PX
  const maxFlags = narrow
    ? MAX_COUNTRY_PEAK_FLAGS_NARROW
    : MAX_COUNTRY_PEAK_FLAGS
  const flagW = 30
  const flagH = 38
  const viewW = container.clientWidth
  const viewH = container.clientHeight
  const cx = viewW / 2
  const cy = viewH / 2

  const candidates = peaks
    .filter((p) =>
      stickyFront(map, p.lon, p.lat, previous?.get(p.id)?.show ?? false),
    )
    .map((p) => {
      const point = map.project([p.lon, p.lat])
      return { peak: p, x: point.x, y: point.y }
    })
    .filter(
      (c) =>
        Number.isFinite(c.x) &&
        Number.isFinite(c.y) &&
        inViewport(c.x, c.y, viewW, viewH),
    )
    .sort((a, b) => {
      const byElev = b.peak.elevationFt - a.peak.elevationFt
      if (byElev !== 0) return byElev
      // Tie-break toward the view center so equally tall neighbors feel local.
      const da = (a.x - cx) ** 2 + (a.y - cy) ** 2
      const db = (b.x - cx) ** 2 + (b.y - cy) ** 2
      if (da !== db) return da - db
      return a.peak.name.localeCompare(b.peak.name)
    })

  const placed: Box[] = []
  const layout = new Map<string, PeakMarkerLayout>()
  let shown = 0

  for (const item of candidates) {
    if (shown >= maxFlags) {
      layout.set(item.peak.id, { show: false })
      continue
    }
    const flagBox = boxAround(item.x, item.y, flagW, flagH)
    if (placed.some((b) => overlaps(flagBox, b, 2))) {
      layout.set(item.peak.id, { show: false })
      continue
    }
    placed.push(flagBox)
    layout.set(item.peak.id, { show: true })
    shown += 1
  }

  for (const peak of peaks) {
    if (!layout.has(peak.id)) layout.set(peak.id, { show: false })
  }

  return layout
}
