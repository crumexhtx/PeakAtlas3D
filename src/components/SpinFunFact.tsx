import { useEffect, useMemo, useRef, useState } from 'react'
import type { Map as MapboxMap } from 'mapbox-gl'
import type { Peak } from '../types/peak'
import type { CountrySummary } from '../types/country'
import { flagUrl } from '../lib/countries'
import { isOnFrontHemisphere } from '../lib/globeVisibility'
import { useUnits } from '../context/UnitsContext'
import { pickRandomFact, pickRandomPeak } from '../lib/peakFacts'

type SpinFunFactProps = {
  map: MapboxMap | null
  spinning: boolean
  countries: CountrySummary[]
  peaks: Peak[]
}

type FactContent = {
  countryName: string
  peakName: string
  fact: string
  flag: string | null
}

const CENTER_RADIUS_PX = 150
const HOLD_MS = 5_400
const CARD_W = 272
const CARD_H = 118

function placeCard(flagX: number, flagY: number, vw: number, vh: number) {
  let cardX = flagX - CARD_W - 36
  let cardY = flagY - CARD_H * 0.45
  if (cardX < 12) cardX = flagX + 40
  if (cardY < 64) cardY = 64
  if (cardY + CARD_H > vh - 20) cardY = vh - CARD_H - 20
  if (cardX + CARD_W > vw - 12) cardX = Math.max(12, vw - CARD_W - 12)
  return { cardX, cardY }
}

export function SpinFunFact({ map, spinning, countries, peaks }: SpinFunFactProps) {
  const { units } = useUnits()
  const [content, setContent] = useState<FactContent | null>(null)
  const cardRef = useRef<HTMLElement | null>(null)
  const lineRef = useRef<SVGLineElement | null>(null)
  const dotRef = useRef<SVGCircleElement | null>(null)
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const holdUntilRef = useRef(0)
  const activeCountryRef = useRef<string | null>(null)
  const lastPeakIdRef = useRef<string | null>(null)
  const lastFactRef = useRef<string | null>(null)

  const peaksByCountry = useMemo(() => {
    const m = new Map<string, Peak[]>()
    for (const country of countries) {
      m.set(
        country.name,
        peaks.filter((p) => country.labels.includes(p.country)),
      )
    }
    return m
  }, [peaks, countries])

  const countryByName = useMemo(() => {
    const m = new Map<string, CountrySummary>()
    for (const c of countries) m.set(c.name, c)
    return m
  }, [countries])

  useEffect(() => {
    if (!spinning || !map) {
      setContent(null)
      activeCountryRef.current = null
      holdUntilRef.current = 0
      return
    }

    let frame = 0
    const canvas = map.getCanvas()

    const applyGeometry = (flagX: number, flagY: number, vw: number, vh: number) => {
      const { cardX, cardY } = placeCard(flagX, flagY, vw, vh)
      if (cardRef.current) {
        cardRef.current.style.transform = `translate3d(${cardX}px, ${cardY}px, 0)`
      }
      const tipX = cardX < flagX ? cardX + CARD_W : cardX
      const tipY = cardY + CARD_H * 0.55
      lineRef.current?.setAttribute('x1', String(tipX))
      lineRef.current?.setAttribute('y1', String(tipY))
      lineRef.current?.setAttribute('x2', String(flagX))
      lineRef.current?.setAttribute('y2', String(flagY))
      dotRef.current?.setAttribute('cx', String(flagX))
      dotRef.current?.setAttribute('cy', String(flagY))
      if (wrapRef.current) wrapRef.current.style.opacity = '1'
    }

    const clearCallout = () => {
      activeCountryRef.current = null
      holdUntilRef.current = 0
      if (wrapRef.current) wrapRef.current.style.opacity = '0'
      setContent(null)
    }

    const showForCountry = (
      country: CountrySummary,
      x: number,
      y: number,
      vw: number,
      vh: number,
      now: number,
    ) => {
      const countryPeaks = peaksByCountry.get(country.name) ?? []
      const peak = pickRandomPeak(countryPeaks, lastPeakIdRef.current ?? undefined)
      if (!peak) return
      const fact = pickRandomFact(peak, units, lastFactRef.current ?? undefined)
      lastPeakIdRef.current = peak.id
      lastFactRef.current = fact
      activeCountryRef.current = country.name
      holdUntilRef.current = now + HOLD_MS
      setContent({
        countryName: country.name,
        peakName: peak.name,
        fact,
        flag: flagUrl(country.name, 40),
      })
      applyGeometry(x, y, vw, vh)
    }

    const projectVisible = (country: CountrySummary) => {
      if (!isOnFrontHemisphere(map, country.lon, country.lat)) return null
      const pt = map.project([country.lon, country.lat])
      return pt
    }

    const nearestInCenter = (vw: number, vh: number, cx: number, cy: number) => {
      let best: { country: CountrySummary; dist: number; x: number; y: number } | null =
        null
      for (const country of countries) {
        const pt = projectVisible(country)
        if (!pt) continue
        if (pt.x < 0 || pt.y < 0 || pt.x > vw || pt.y > vh) continue
        const dist = Math.hypot(pt.x - cx, pt.y - cy)
        if (dist > CENTER_RADIUS_PX) continue
        if (!best || dist < best.dist) best = { country, dist, x: pt.x, y: pt.y }
      }
      return best
    }

    const tick = () => {
      const now = performance.now()
      const vw = canvas.clientWidth
      const vh = canvas.clientHeight
      const cx = vw / 2
      const cy = vh / 2
      const activeName = activeCountryRef.current

      if (activeName) {
        const active = countryByName.get(activeName)
        if (!active) {
          clearCallout()
        } else {
          const pt = projectVisible(active)
          if (!pt) {
            // Rotated onto the far side of the globe — drop immediately.
            clearCallout()
          } else {
            applyGeometry(pt.x, pt.y, vw, vh)
            const dist = Math.hypot(pt.x - cx, pt.y - cy)
            if (now >= holdUntilRef.current) {
              if (dist > CENTER_RADIUS_PX * 1.25) {
                clearCallout()
              } else {
                showForCountry(active, pt.x, pt.y, vw, vh, now)
              }
            }
          }
        }
      } else {
        const best = nearestInCenter(vw, vh, cx, cy)
        if (best) showForCountry(best.country, best.x, best.y, vw, vh, now)
      }

      frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [spinning, map, countries, peaksByCountry, countryByName, units])

  if (!spinning || !content) return null

  return (
    <div ref={wrapRef} className="spin-fun-fact" aria-live="polite">
      <svg className="spin-fun-fact-line" aria-hidden="true">
        <line ref={lineRef} x1="0" y1="0" x2="0" y2="0" />
        <circle ref={dotRef} cx="0" cy="0" r="5" />
      </svg>
      <article ref={cardRef} className="spin-fun-fact-card">
        <header className="spin-fun-fact-country">
          {content.flag ? (
            <img
              src={content.flag}
              alt=""
              className="spin-fun-fact-flag"
              width={28}
              height={20}
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
    </div>
  )
}
