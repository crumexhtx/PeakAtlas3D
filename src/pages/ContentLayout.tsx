import { Link, NavLink, Outlet } from 'react-router-dom'
import { useEffect } from 'react'
import { ContentDisclaimer } from '../components/ContentDisclaimer'
import { applyDocumentMeta, metaForAtlas } from '../lib/documentMeta'
import {
  prefetchAtlasShell,
  scheduleIdleAtlasPrefetch,
} from '../lib/prefetchAtlas'

export function ContentLayout() {
  useEffect(() => {
    // Pages set their own meta; fall back when leaving.
    return () => applyDocumentMeta(metaForAtlas(null))
  }, [])

  useEffect(() => scheduleIdleAtlasPrefetch(), [])

  return (
    <div className="content-shell">
      <div className="content-topo" aria-hidden="true" />
      <header className="content-header">
        <Link
          to="/"
          className="brand-block"
          onMouseEnter={prefetchAtlasShell}
          onFocus={prefetchAtlasShell}
        >
          <span className="brand-mark">PeakAtlas</span>
          <span className="brand-tag">3D</span>
        </Link>
        <nav className="site-nav" aria-label="Site">
          <NavLink
            to="/"
            end
            onMouseEnter={prefetchAtlasShell}
            onFocus={prefetchAtlasShell}
          >
            Atlas
          </NavLink>
          <NavLink to="/about">About</NavLink>
          <NavLink to="/peaks">Peaks</NavLink>
          <NavLink to="/compare">Compare</NavLink>
          <NavLink to="/contact">Contact</NavLink>
        </nav>
      </header>
      <main className="content-main">
        <Outlet />
      </main>
      <footer className="content-footer">
        <nav className="content-footer-nav" aria-label="Footer">
          <Link to="/compare">Peak comparisons</Link>
          <Link to="/peaks">All peaks</Link>
          <Link to="/">Atlas</Link>
        </nav>
        <ContentDisclaimer compact />
      </footer>
    </div>
  )
}
