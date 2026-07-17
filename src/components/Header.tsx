import { useEffect, useId, useMemo, useRef, useState } from 'react'
import type { Peak } from '../types/peak'
import { searchPeaks } from '../lib/geo'

type HeaderProps = {
  peaks: Peak[]
  onSelectPeak: (peak: Peak) => void
}

export function Header({ peaks, onSelectPeak }: HeaderProps) {
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
      <div className="brand-block">
        <p className="brand-mark">PeakAtlas</p>
        <p className="brand-tag">World Peaks · Hybrid Globe</p>
      </div>

      <div className="search-wrap" ref={wrapRef}>
        <label className="sr-only" htmlFor="peak-search">
          Search peaks, ranges, or towns
        </label>
        <input
          id="peak-search"
          className="search-input"
          type="search"
          placeholder="Search peaks, ranges, or towns…"
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
                    {peak.range} · {peak.nearestTown.name}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </header>
  )
}
