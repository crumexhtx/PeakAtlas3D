import { Link, NavLink } from 'react-router-dom'
import { useEffect, useId, useMemo, useRef, useState } from 'react'
import type { PeakIndex } from '../types/peak'
import { formatElevation, searchPeaks } from '../lib/geo'
import { useUnits } from '../context/UnitsContext'

type AppHeaderProps = {
  peaks: PeakIndex[]
  onSelectPeak: (peak: PeakIndex) => void
  showBack?: boolean
  /** Where ← Atlas / brand should return (e.g. /?country=USA). */
  atlasHref?: string
}

export function AppHeader({
  peaks,
  onSelectPeak,
  showBack = false,
  atlasHref = '/',
}: AppHeaderProps) {
  const { units, setUnits } = useUnits()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const listId = useId()
  const statusId = useId()
  const wrapRef = useRef<HTMLDivElement>(null)
  const results = useMemo(() => searchPeaks(peaks, query).slice(0, 8), [peaks, query])
  const listOpen = open && query.trim().length > 0
  const activePeak = activeIndex >= 0 ? results[activeIndex] : undefined
  const activeOptionId = activePeak ? `${listId}-opt-${activePeak.id}` : undefined

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  useEffect(() => {
    setActiveIndex(results.length ? 0 : -1)
  }, [query, results.length])

  function selectPeak(peak: PeakIndex) {
    onSelectPeak(peak)
    setQuery(peak.name)
    setOpen(false)
    setActiveIndex(-1)
  }

  const statusMessage = !listOpen
    ? ''
    : results.length === 0
      ? 'No peaks found'
      : `${results.length} peak${results.length === 1 ? '' : 's'} available`

  return (
    <header className={`app-header${showBack ? ' is-peak' : ''}`}>
      <div className="brand-row">
        {showBack && (
          <Link to={atlasHref} className="back-link">
            ← Atlas
          </Link>
        )}
        <Link to={atlasHref} className="brand-block">
          <span className="brand-mark">PeakAtlas</span>
          <span className="brand-tag">3D</span>
        </Link>
      </div>

      <div className="search-wrap" ref={wrapRef}>
        <label className="sr-only" htmlFor="peak-search">
          Search peaks
        </label>
        <input
          id="peak-search"
          className="search-input"
          type="search"
          placeholder="Search mountain peaks…"
          value={query}
          autoComplete="off"
          role="combobox"
          aria-expanded={listOpen}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={activeOptionId}
          aria-describedby={statusId}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setOpen(false)
              setActiveIndex(-1)
              return
            }
            if (!listOpen) return

            if (e.key === 'ArrowDown') {
              e.preventDefault()
              if (!results.length) return
              setActiveIndex((i) => (i + 1) % results.length)
              return
            }
            if (e.key === 'ArrowUp') {
              e.preventDefault()
              if (!results.length) return
              setActiveIndex((i) => (i <= 0 ? results.length - 1 : i - 1))
              return
            }
            if (e.key === 'Home') {
              e.preventDefault()
              if (results.length) setActiveIndex(0)
              return
            }
            if (e.key === 'End') {
              e.preventDefault()
              if (results.length) setActiveIndex(results.length - 1)
              return
            }
            if (e.key === 'Enter') {
              const peak = activePeak ?? results[0]
              if (peak) {
                e.preventDefault()
                selectPeak(peak)
              }
            }
          }}
        />
        <div id={statusId} className="sr-only" role="status" aria-live="polite">
          {statusMessage}
        </div>
        {listOpen && results.length > 0 && (
          <ul id={listId} className="search-results" role="listbox">
            {results.map((peak, index) => (
              <li
                key={peak.id}
                id={`${listId}-opt-${peak.id}`}
                role="option"
                aria-selected={index === activeIndex}
              >
                <Link
                  to={`/peak/${peak.id}`}
                  className={`search-result${index === activeIndex ? ' is-active' : ''}`}
                  tabIndex={-1}
                  onClick={() => {
                    setQuery(peak.name)
                    setOpen(false)
                    setActiveIndex(-1)
                  }}
                  onMouseEnter={() => setActiveIndex(index)}
                >
                  <span className="result-name">{peak.name}</span>
                  <span className="result-meta">
                    {formatElevation(peak.elevationFt, units)} · {peak.range} ·{' '}
                    {peak.country}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <nav className="site-nav site-nav-compact" aria-label="Site">
        <NavLink to="/about">About</NavLink>
        <NavLink to="/peaks">Peaks</NavLink>
        <NavLink to="/releases">Releases</NavLink>
        <NavLink to="/contact">Contact</NavLink>
      </nav>

      <div className="unit-toggle" role="group" aria-label="Units">
        <button
          type="button"
          className={units === 'imperial' ? 'is-active' : ''}
          aria-pressed={units === 'imperial'}
          onClick={() => setUnits('imperial')}
        >
          ft
        </button>
        <button
          type="button"
          className={units === 'metric' ? 'is-active' : ''}
          aria-pressed={units === 'metric'}
          onClick={() => setUnits('metric')}
        >
          m
        </button>
      </div>
    </header>
  )
}
