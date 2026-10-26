import { Link, NavLink } from 'react-router-dom'
import { useEffect, useId, useMemo, useRef, useState } from 'react'
import type { PeakIndex } from '../types/peak'
import { formatElevation, searchPeaks } from '../lib/geo'
import { peakHref } from '../lib/routes'
import { useUnits } from '../context/UnitsContext'

type AppHeaderProps = {
  peaks: PeakIndex[]
  onSelectPeak: (peak: PeakIndex) => void
  showBack?: boolean
  /** Where ← Atlas / brand should return (e.g. /?country=USA). */
  atlasHref?: string
  /** Peak route id so the field follows the summit instead of leftover text. */
  activePeakId?: string | null
}

export function AppHeader({
  peaks,
  onSelectPeak,
  showBack = false,
  atlasHref = '/',
  activePeakId = null,
}: AppHeaderProps) {
  const { units, setUnits } = useUnits()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const listId = useId()
  const statusId = useId()
  const wrapRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const committedNameRef = useRef<string | null>(null)
  const draftQueryRef = useRef<string | null>(null)
  const peaksRef = useRef(peaks)
  peaksRef.current = peaks
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
    if (!open) {
      setActiveIndex(-1)
      return
    }
    setActiveIndex(results.length ? 0 : -1)
  }, [query, results.length, open])

  useEffect(() => {
    if (draftQueryRef.current === query) {
      draftQueryRef.current = null
    }
  }, [query])

  useEffect(() => {
    if (!activePeakId) {
      if (committedNameRef.current) {
        setQuery('')
        committedNameRef.current = null
      }
      setOpen(false)
      setActiveIndex(-1)
      return
    }
    const peak = peaksRef.current.find((p) => p.id === activePeakId)
    if (!peak) return
    setQuery(peak.name)
    committedNameRef.current = peak.name
    setOpen(false)
    setActiveIndex(-1)
  }, [activePeakId])

  function selectCommittedInput(input: HTMLInputElement) {
    requestAnimationFrame(() => {
      if (
        committedNameRef.current &&
        input.value === committedNameRef.current
      ) {
        input.select()
      }
    })
  }

  function selectPeak(peak: PeakIndex) {
    onSelectPeak(peak)
    setQuery(peak.name)
    committedNameRef.current = peak.name
    setOpen(false)
    setActiveIndex(-1)
    const input = inputRef.current
    if (input) selectCommittedInput(input)
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
          ref={inputRef}
          className="search-input"
          type="search"
          placeholder="Search mountain peaks…"
          value={query}
          autoComplete="off"
          role="combobox"
          aria-expanded={listOpen}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={listOpen ? activeOptionId : undefined}
          aria-describedby={statusId}
          onChange={(e) => {
            const next = e.target.value
            setQuery(next)
            if (committedNameRef.current && next !== committedNameRef.current) {
              committedNameRef.current = null
            }
            setOpen(next.trim().length > 0)
          }}
          onFocus={(e) => {
            if (
              committedNameRef.current &&
              query === committedNameRef.current
            ) {
              selectCommittedInput(e.currentTarget)
              setOpen(false)
              return
            }
            if (query.trim()) setOpen(true)
          }}
          onClick={(e) => {
            if (
              committedNameRef.current &&
              query === committedNameRef.current
            ) {
              selectCommittedInput(e.currentTarget)
              setOpen(false)
            }
          }}
          onKeyDown={(e) => {
            const committed =
              Boolean(committedNameRef.current) &&
              query === committedNameRef.current
            const replacing = committed || draftQueryRef.current != null
            if (replacing) {
              if (e.key === 'Backspace' || e.key === 'Delete') {
                e.preventDefault()
                committedNameRef.current = null
                const next = (draftQueryRef.current ?? '').slice(0, -1)
                draftQueryRef.current = next || null
                setQuery(next)
                setOpen(next.trim().length > 0)
                setActiveIndex(-1)
                return
              }
              if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
                e.preventDefault()
                committedNameRef.current = null
                const next = `${draftQueryRef.current ?? ''}${e.key}`
                draftQueryRef.current = next
                setQuery(next)
                setOpen(true)
                return
              }
            }
            if (e.key === 'Escape') {
              if (listOpen) {
                setOpen(false)
                setActiveIndex(-1)
                return
              }
              if (query) {
                setQuery('')
                committedNameRef.current = null
              }
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
                  to={peakHref(peak.id)}
                  className={`search-result${index === activeIndex ? ' is-active' : ''}`}
                  tabIndex={-1}
                  onMouseDown={(e) => {
                    if (e.button !== 0) return
                    e.preventDefault()
                  }}
                  onClick={(e) => {
                    if (
                      e.metaKey ||
                      e.ctrlKey ||
                      e.shiftKey ||
                      e.altKey ||
                      e.button !== 0
                    ) {
                      setOpen(false)
                      return
                    }
                    e.preventDefault()
                    selectPeak(peak)
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
        {listOpen && results.length === 0 && (
          <div className="search-results search-empty" role="status">
            No peaks found
          </div>
        )}
      </div>

      <nav className="site-nav site-nav-compact" aria-label="Site">
        <NavLink to="/about">About</NavLink>
        <NavLink to="/peaks">Peaks</NavLink>
        <NavLink to="/best-peaks">By month</NavLink>
        <NavLink to="/compare">Compare</NavLink>
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
