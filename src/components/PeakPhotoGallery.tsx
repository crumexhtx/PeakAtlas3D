import { useEffect, useState } from 'react'
import type { PeakPhoto } from '../types/peak'

const ROTATE_MS = 5_500

type PeakPhotoGalleryProps = {
  name: string
  photos: PeakPhoto[]
}

function shortenCredit(credit: string, max = 42) {
  const trimmed = credit.trim()
  if (trimmed.length <= max) return trimmed
  return `${trimmed.slice(0, max - 1)}…`
}

function PhotoCredit({ photo }: { photo: PeakPhoto }) {
  const credit = photo.credit?.trim()
  const license = photo.license?.trim()
  const sourceUrl = photo.sourceUrl?.trim()

  if (!credit && !license && !sourceUrl) return null

  const label = [credit ? shortenCredit(credit) : null, license].filter(Boolean).join(' · ')

  return (
    <figcaption className="peak-photo-credit">
      {sourceUrl ? (
        <a
          className="peak-photo-credit-link"
          href={sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          title={credit ? `${credit}${license ? ` · ${license}` : ''}` : 'Photo source'}
        >
          {label || 'Source'}
        </a>
      ) : (
        <span className="peak-photo-credit-text" title={credit || undefined}>
          {label}
        </span>
      )}
    </figcaption>
  )
}

export function PeakPhotoGallery({ name: peakName, photos }: PeakPhotoGalleryProps) {
  const initial = photos.filter((p) => p?.url).slice(0, 2)
  const [slides, setSlides] = useState(initial)
  const [index, setIndex] = useState(0)
  const multi = slides.length > 1
  const [paused, setPaused] = useState(false)
  const active = slides[index] ?? slides[0]

  useEffect(() => {
    setSlides(photos.filter((p) => p?.url).slice(0, 2))
    setIndex(0)
  }, [peakName, photos])

  useEffect(() => {
    if (!multi || paused) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % slides.length)
    }, ROTATE_MS)
    return () => window.clearInterval(id)
  }, [multi, slides.length, peakName, paused])

  function dropSlide(url: string) {
    setSlides((prev) => {
      const next = prev.filter((p) => p.url !== url)
      setIndex((i) => (next.length ? Math.min(i, next.length - 1) : 0))
      return next
    })
  }

  if (!slides.length || !active) return null

  return (
    <figure
      className={`peak-photo${multi ? ' peak-photo-gallery' : ''}`}
      onMouseEnter={multi ? () => setPaused(true) : undefined}
      onMouseLeave={multi ? () => setPaused(false) : undefined}
    >
      <div className="peak-photo-stage">
        {multi ? (
          slides.map((photo, i) => (
            <img
              key={photo.url}
              src={photo.url}
              alt={`${peakName} — view ${i + 1}`}
              className={`peak-photo-slide ${i === index ? 'is-active' : ''}`}
              loading={i === 0 ? 'eager' : 'lazy'}
              decoding="async"
              referrerPolicy="no-referrer"
              onError={() => dropSlide(photo.url)}
            />
          ))
        ) : (
          <img
            src={active.url}
            alt={`${peakName} — summit view`}
            loading="eager"
            decoding="async"
            referrerPolicy="no-referrer"
            onError={() => dropSlide(active.url)}
          />
        )}

        {multi && (
          <div className="peak-photo-dots" role="group" aria-label="Choose photo">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                className={`peak-photo-dot ${i === index ? 'is-active' : ''}`}
                aria-label={`Show photo ${i + 1}`}
                aria-current={i === index ? 'true' : undefined}
                onClick={() => setIndex(i)}
              />
            ))}
          </div>
        )}

        <PhotoCredit photo={active} />
      </div>
    </figure>
  )
}
