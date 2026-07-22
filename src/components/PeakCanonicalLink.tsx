import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { SITE_ORIGIN, toCanonicalHref } from '../lib/documentMeta'

/**
 * Injects a self-referencing canonical for /peak/:id pages.
 * Always https://peakatlas3d.com/peak/{id} — never includes ?country= or other query params.
 */
export function PeakCanonicalLink({ peakId: peakIdProp }: { peakId?: string }) {
  const params = useParams()
  const peakId = peakIdProp ?? params.peakId

  useEffect(() => {
    if (!peakId) return

    const href = toCanonicalHref(`/peak/${encodeURIComponent(peakId)}`)
    // Guarantees production origin + pathname only (no search/hash).
    // Example: https://peakatlas3d.com/peak/rainier
    let el = document.head.querySelector(
      'link[rel="canonical"]',
    ) as HTMLLinkElement | null
    if (!el) {
      el = document.createElement('link')
      el.setAttribute('rel', 'canonical')
      document.head.appendChild(el)
    }
    el.setAttribute('href', href)
    // Keep og:url aligned with the same query-free URL.
    let og = document.head.querySelector(
      'meta[property="og:url"]',
    ) as HTMLMetaElement | null
    if (!og) {
      og = document.createElement('meta')
      og.setAttribute('property', 'og:url')
      document.head.appendChild(og)
    }
    og.setAttribute('content', href)
  }, [peakId])

  return null
}

/** Pure helper for tests / prerender parity. */
export function peakCanonicalHref(peakId: string): string {
  return `${SITE_ORIGIN}/peak/${encodeURIComponent(peakId)}`
}
