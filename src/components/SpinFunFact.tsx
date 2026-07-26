import { useEffect, useMemo, useRef, useState } from 'react'
import type { Map as MapLibreMap } from 'maplibre-gl'
import type { PeakIndex } from '../types/peak'
import type { CountrySummary } from '../types/country'
import { flagUrl } from '../lib/countries'
import { isOnFrontHemisphere } from '../lib/globeVisibility'
import { useUnits } from '../context/UnitsContext'
import { pickRandomFact } from '../lib/peakFacts'

type SpinFunFactProps = {
  map: MapLibreMap | null
  spinning: boolean
  /** When false (e.g. atlas hint visible), hide callouts. Parent owns this. */
  enabled?: boolean
  countries: CountrySummary[]
  peaks: PeakIndex[]
}

type FactContent = {
  countryName: string
  peakName: string
  fact: string
  flag: string | null
}

type Anchor = {
  peakId: string
  countryName: string
  lon: number
  lat: number
}

type Point = { x: number; y: number }

const CENTER_RADIUS_PX = 120
const EDGE_MARGIN_PX = 28
const HOLD_MS = 5_400
const CARD_W = 200
const CARD_H = 92
const FRONT_DOT = 0.32
const FRONT_DOT_NARROW = 0.28
const NARROW_OVERLAY_PX = 640

type LayoutMetrics = {
  cardW: number
  cardH: number
  centerR: number
  edge: number
  topChrome: number
  diskFill: number
  diskInset: number
  frontDot: number
}

/** Desktop metrics unchanged; phones get tighter geometry for portrait maps. */
function layoutMetrics(vw: number): LayoutMetrics {
  const narrow = vw <= NARROW_OVERLAY_PX
  if (!narrow) {
    return {
      cardW: CARD_W,
      cardH: CARD_H,
      centerR: CENTER_RADIUS_PX,
      edge: EDGE_MARGIN_PX,
      topChrome: 48,
      diskFill: 0.88,
      diskInset: 0.94,
      frontDot: FRONT_DOT,
    }
  }
  return {
    cardW: Math.min(168, Math.max(140, vw - 56)),
    cardH: 86,
    centerR: Math.min(100, vw * 0.32),
    edge: 16,
    topChrome: 36,
    // Slightly smaller fill + inset rejects void beside the limb on phones.
    diskFill: 0.82,
    diskInset: 0.9,
    frontDot: FRONT_DOT_NARROW,
  }
}

function placeCard(
  flagX: number,
  flagY: number,
  vw: number,
  vh: number,
  cardW: number,
  cardH: number,
) {
  const gap = vw <= NARROW_OVERLAY_PX ? 16 : 28
  const topMin = vw <= NARROW_OVERLAY_PX ? 48 : 64
  let cardX = flagX - cardW - gap
  let cardY = flagY - cardH * 0.45
  if (cardX < 12) cardX = flagX + gap + 4
  if (cardY < topMin) cardY = topMin
  if (cardY + cardH > vh - 20) cardY = vh - cardH - 20
  if (cardX + cardW > vw - 12) cardX = Math.max(12, vw - cardW - 12)
  return { cardX, cardY }
}

/** Pixel radius of the visible globe disk in the map container. */
function globeDiskRadiusPx(
  map: MapLibreMap,
  width: number,
  height: number,
  fill: number,
) {
  const minSide = Math.min(width, height)
  const zoom = map.getZoom()
  // Tuned for globe projection around world zoom (~1.5): disk fills most of the short side.
  const radius = (minSide / 2) * fill * Math.pow(2, zoom - 1.5)
  return Math.min(radius, minSide * 0.5)
}

/**
 * Project a lng/lat into overlay pixels, only if it lands on the visible
 * front of the globe disk (not the black void around Earth).
 */
function projectToOverlay(
  map: MapLibreMap,
  overlay: HTMLElement,
  lon: number,
  lat: number,
  metrics: LayoutMetrics,
): Point | null {
  if (!isOnFrontHemisphere(map, lon, lat, metrics.frontDot)) return null

  const pt = map.project([lon, lat])
  if (!Number.isFinite(pt.x) || !Number.isFinite(pt.y)) return null

  const mapEl = map.getContainer()
  const mapRect = mapEl.getBoundingClientRect()
  const overlayRect = overlay.getBoundingClientRect()
  if (mapEl.clientWidth < 1 || mapEl.clientHeight < 1) return null
  if (overlayRect.width < 1 || overlayRect.height < 1) return null

  const x =
    pt.x * (mapRect.width / mapEl.clientWidth) + (mapRect.left - overlayRect.left)
  const y =
    pt.y * (mapRect.height / mapEl.clientHeight) + (mapRect.top - overlayRect.top)

  if (!Number.isFinite(x) || !Number.isFinite(y)) return null

  const vw = overlay.clientWidth
  const vh = overlay.clientHeight
  const cx = vw / 2
  const cy = vh / 2
  const diskR =
    globeDiskRadiusPx(map, vw, vh, metrics.diskFill) * metrics.diskInset

  // Reject points that sit in the empty space beside/above/below the globe.
  if (Math.hypot(x - cx, y - cy) > diskR) return null

  if (
    x < metrics.edge ||
    y < metrics.edge + metrics.topChrome ||
    x > vw - metrics.edge ||
    y > vh - metrics.edge
  ) {
    return null
  }

  return { x, y }
}

export function SpinFunFact({
  map,
  spinning,
  enabled = true,
  countries,
  peaks,
}: SpinFunFactProps) {
  const { units } = useUnits()
  const [content, setContent] = useState<FactContent | null>(null)
  const [viewBox, setViewBox] = useState({ w: 1, h: 1 })
  const cardRef = useRef<HTMLElement | null>(null)
  const lineRef = useRef<SVGLineElement | null>(null)
  const dotRef = useRef<SVGCircleElement | null>(null)
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const holdUntilRef = useRef(0)
  const activeRef = useRef<Anchor | null>(null)
  const lastPeakIdRef = useRef<string | null>(null)
  const lastFactRef = useRef<string | null>(null)

  const allowFunFacts = enabled

  const countryByLabel = useMemo(() => {
    const m = new Map<string, CountrySummary>()
    for (const country of countries) {
      m.set(country.name, country)
      for (const label of country.labels) m.set(label, country)
    }
    return m
  }, [countries])

  useEffect(() => {
    if (!spinning || !map || !allowFunFacts) {
      setContent(null)
      activeRef.current = null
      holdUntilRef.current = 0
      return
    }

    let frame = 0

    const applyGeometry = (
      flagX: number,
      flagY: number,
      vw: number,
      vh: number,
      metrics: LayoutMetrics,
    ) => {
      const { cardX, cardY } = placeCard(
        flagX,
        flagY,
        vw,
        vh,
        metrics.cardW,
        metrics.cardH,
      )
      if (cardRef.current) {
        cardRef.current.style.transform = `translate3d(${cardX}px, ${cardY}px, 0)`
        cardRef.current.style.width = `${metrics.cardW}px`
      }
      const tipX = cardX < flagX ? cardX + metrics.cardW : cardX
      const tipY = cardY + metrics.cardH * 0.55
      lineRef.current?.setAttribute('x1', String(tipX))
      lineRef.current?.setAttribute('y1', String(tipY))
      lineRef.current?.setAttribute('x2', String(flagX))
      lineRef.current?.setAttribute('y2', String(flagY))
      dotRef.current?.setAttribute('cx', String(flagX))
      dotRef.current?.setAttribute('cy', String(flagY))
      if (wrapRef.current) wrapRef.current.style.opacity = '1'
    }

    const clearCallout = () => {
      activeRef.current = null
      holdUntilRef.current = 0
      if (wrapRef.current) wrapRef.current.style.opacity = '0'
      setContent(null)
    }

    const showForPeak = (
      peak: PeakIndex,
      country: CountrySummary,
      point: Point,
      vw: number,
      vh: number,
      now: number,
      metrics: LayoutMetrics,
    ) => {
      const fact = pickRandomFact(peak, units, lastFactRef.current ?? undefined)
      lastPeakIdRef.current = peak.id
      lastFactRef.current = fact
      activeRef.current = {
        peakId: peak.id,
        countryName: country.name,
        lon: peak.lon,
        lat: peak.lat,
      }
      holdUntilRef.current = now + HOLD_MS
      setContent({
        countryName: country.name,
        peakName: peak.name,
        fact,
        flag: flagUrl(country.name, 40),
      })
      applyGeometry(point.x, point.y, vw, vh, metrics)
    }

    const nearestPeakInCenter = (
      overlay: HTMLElement,
      cx: number,
      cy: number,
      metrics: LayoutMetrics,
    ) => {
      let best:
        | {
            peak: PeakIndex
            country: CountrySummary
            dist: number
            point: Point
          }
        | null = null

      for (const peak of peaks) {
        if (peak.id === lastPeakIdRef.current) continue
        const country = countryByLabel.get(peak.country)
        if (!country) continue
        const point = projectToOverlay(map, overlay, peak.lon, peak.lat, metrics)
        if (!point) continue
        const dist = Math.hypot(point.x - cx, point.y - cy)
        if (dist > metrics.centerR) continue
        if (!best || dist < best.dist) {
          best = { peak, country, dist, point }
        }
      }
      return best
    }

    let skip = 0
    const tick = () => {
      // Match idle-spin paint rate (~30fps) so we don't outwork the globe.
      skip = (skip + 1) % 2
      if (skip !== 0) {
        frame = requestAnimationFrame(tick)
        return
      }

      const overlay = wrapRef.current
      if (!overlay) {
        frame = requestAnimationFrame(tick)
        return
      }

      const now = performance.now()
      const vw = overlay.clientWidth
      const vh = overlay.clientHeight
      if (vw > 0 && vh > 0) {
        setViewBox((prev) =>
          prev.w === vw && prev.h === vh ? prev : { w: vw, h: vh },
        )
      }
      const metrics = layoutMetrics(vw)
      const cx = vw / 2
      const cy = vh / 2
      const active = activeRef.current

      if (active) {
        const point = projectToOverlay(
          map,
          overlay,
          active.lon,
          active.lat,
          metrics,
        )
        if (!point) {
          clearCallout()
        } else {
          applyGeometry(point.x, point.y, vw, vh, metrics)
          const dist = Math.hypot(point.x - cx, point.y - cy)
          if (now >= holdUntilRef.current) {
            if (dist > metrics.centerR * 1.2) {
              clearCallout()
            } else {
              const peak = peaks.find((p) => p.id === active.peakId)
              const country = countryByLabel.get(active.countryName)
              if (peak && country) {
                showForPeak(peak, country, point, vw, vh, now, metrics)
              } else {
                clearCallout()
              }
            }
          }
        }
      } else {
        const best = nearestPeakInCenter(overlay, cx, cy, metrics)
        if (best) {
          showForPeak(best.peak, best.country, best.point, vw, vh, now, metrics)
        }
      }

      frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [spinning, map, allowFunFacts, peaks, countryByLabel, units])

  if (!spinning || !allowFunFacts) return null

  return (
    <div
      ref={wrapRef}
      className="spin-fun-fact"
      aria-live="polite"
      style={{ opacity: content ? undefined : 0 }}
    >
      <svg
        className="spin-fun-fact-line"
        aria-hidden="true"
        width={viewBox.w}
        height={viewBox.h}
        viewBox={`0 0 ${viewBox.w} ${viewBox.h}`}
        preserveAspectRatio="none"
      >
        <line ref={lineRef} x1="0" y1="0" x2="0" y2="0" />
        <circle ref={dotRef} cx="0" cy="0" r="4" />
      </svg>
      {content && (
        <article ref={cardRef} className="spin-fun-fact-card">
          <header className="spin-fun-fact-country">
            {content.flag ? (
              <img
                src={content.flag}
                alt=""
                className="spin-fun-fact-flag"
                width={22}
                height={16}
                referrerPolicy="no-referrer"
              />
            ) : (
              <span className="spin-fun-fact-flag-fallback" aria-hidden="true">
                {content.countryName.slice(0, 2).toUpperCase()}
              </span>
            )}
            <span>{content.countryName}</span>
          </header>
          <p className="spin-fun-fact-peak">{content.peakName}</p>
          <p className="spin-fun-fact-text">{content.fact}</p>
        </article>
      )}
    </div>
  )
}
