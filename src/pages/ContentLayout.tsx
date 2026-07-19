import { Link, NavLink, Outlet } from 'react-router-dom'
import { useEffect } from 'react'
import { applyDocumentMeta, metaForAtlas } from '../lib/documentMeta'

export function ContentLayout() {
  useEffect(() => {
    // Pages set their own meta; fall back when leaving.
    return () => applyDocumentMeta(metaForAtlas(null))
  }, [])

  return (
    <div className="content-shell">
      <div className="content-topo" aria-hidden="true" />
      <header className="content-header">
        <Link to="/" className="brand-block">
          <span className="brand-mark">PeakAtlas</span>
          <span className="brand-tag">3D</span>
        </Link>
        <nav className="site-nav" aria-label="Site">
          <NavLink to="/" end>
            Atlas
          </NavLink>
          <NavLink to="/about">About</NavLink>
          <NavLink to="/contact">Contact</NavLink>
        </nav>
      </header>
      <main className="content-main">
        <Outlet />
      </main>
    </div>
  )
}
