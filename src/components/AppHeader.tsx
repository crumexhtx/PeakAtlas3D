import { Link } from 'react-router-dom'
import { useEffect, useId, useMemo, useRef, useState } from 'react'
import type { Peak } from '../types/peak'
import { formatElevation, searchPeaks } from '../lib/geo'
import { useUnits } from '../context/UnitsContext'

type AppHeaderProps = {
  peaks: Peak[]
  onSelectPeak: (peak: Peak) => void
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
  const listId = useId()
  const wrapRef = useRef<HTMLDivElement>(null)
  const results = useMemo(() => searchPeaks(peaks, query).slice(0, 8), [peaks, query])

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  return (
    <header className="app-header">
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
          aria-expanded={open && results.length > 0}
          aria-controls={listId}
          aria-autocomplete="list"
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && results[0]) {
              onSelectPeak(results[0])
              setQuery(results[0].name)
              setOpen(false)
            }
            if (e.key === 'Escape') setOpen(false)
          }}
        />
        {open && results.length > 0 && (
          <ul id={listId} className="search-results" role="listbox">
            {results.map((peak) => (
              <li key={peak.id} role="option">
                <button
                  type="button"
                  className="search-result"
                  onClick={() => {
                    onSelectPeak(peak)
                    setQuery(peak.name)
                    setOpen(false)
                  }}
                >
                  <span className="result-name">{peak.name}</span>
                  <span className="result-meta">
                    {formatElevation(peak.elevationFt, units)} · {peak.range} ·{' '}
                    {peak.country}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

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
