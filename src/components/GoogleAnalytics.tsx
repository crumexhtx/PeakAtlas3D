import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const GA_MEASUREMENT_ID = 'G-MK6DR8EQ96'

/**
 * Sends a GA4 page_view on client-side route changes (SPA).
 * The base gtag snippet in index.html covers the first load.
 */
export function GoogleAnalytics() {
  const location = useLocation()

  useEffect(() => {
    if (typeof window.gtag !== 'function') return
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: `${location.pathname}${location.search}${location.hash}`,
    })
  }, [location.pathname, location.search, location.hash])

  return null
}
