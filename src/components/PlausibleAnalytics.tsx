import { useEffect } from 'react'

const PLAUSIBLE_DOMAIN = import.meta.env.VITE_PLAUSIBLE_DOMAIN?.trim()
const PLAUSIBLE_SRC =
  import.meta.env.VITE_PLAUSIBLE_SCRIPT_SRC?.trim() ||
  'https://plausible.io/js/script.js'

/**
 * Optional Plausible analytics. Set `VITE_PLAUSIBLE_DOMAIN` (e.g. peakatlas3d.com)
 * in the Vercel env to enable. Works alongside Vercel Analytics.
 */
export function PlausibleAnalytics() {
  useEffect(() => {
    if (!PLAUSIBLE_DOMAIN || typeof document === 'undefined') return
    if (document.querySelector(`script[data-peakatlas-plausible]`)) return

    const script = document.createElement('script')
    script.defer = true
    script.dataset.domain = PLAUSIBLE_DOMAIN
    script.dataset.peakatlasPlausible = '1'
    script.src = PLAUSIBLE_SRC
    document.head.appendChild(script)

    return () => {
      script.remove()
    }
  }, [])

  return null
}
