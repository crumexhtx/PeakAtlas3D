import { useEffect, useState } from 'react'
import type { PeakPhoto } from '../types/peak'

const ROTATE_MS = 5_500

type PeakPhotoGalleryProps = {
  name: string
  photos: PeakPhoto[]
}

function PhotoCredit({ photo }: { photo: PeakPhoto }) {
  const credit = photo.credit?.trim()
  const license = photo.license?.trim()
  const sourceUrl = photo.sourceUrl?.trim()

  if (!credit && !license && !sourceUrl) return null

  return (
    <figcaption className="peak-photo-credit">
      <span className="peak-photo-credit-text">
        {credit ? `Photo: ${credit}` : 'Photo'}
        {license ? ` · ${license}` : ''}
      </span>
      {sourceUrl && (
        <a
          className="peak-photo-credit-link"
          href={sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Source
        </a>
      )}
    </figcaption>
  )
}

export function PeakPhotoGallery({ name: peakName, photos }: PeakPhotoGalleryProps) {
  const slides = photos.filter((p) => p?.url).slice(0, 2)
  const [index, setIndex] = useState(0)
  const multi = slides.length > 1
  const [paused, setPaused] = useState(false)
  const active = slides[index] ?? slides[0]

  useEffect(() => {
    setIndex(0)
  }, [peakName])

  useEffect(() => {
    if (!multi || paused) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % slides.length)
    }, ROTATE_MS)
    return () => window.clearInterval(id)
  }, [multi, slides.length, peakName, paused])

  if (!slides.length || !active) return null

  if (!multi) {
    return (
      <figure className="peak-photo">
        <div className="peak-photo-stage">
          <img
            src={active.url}
            alt={`${peakName} — summit view`}
            loading="eager"
            decoding="async"
            referrerPolicy="no-referrer"
          />
        </div>
        <PhotoCredit photo={active} />
      </figure>
    )
  }

  return (
    <figure
      className="peak-photo peak-photo-gallery"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="peak-photo-stage">
        {slides.map((photo, i) => (
          <img
            key={photo.url}
            src={photo.url}
            alt={`${peakName} — view ${i + 1}`}
            className={`peak-photo-slide ${i === index ? 'is-active' : ''}`}
            loading={i === 0 ? 'eager' : 'lazy'}
            decoding="async"
            referrerPolicy="no-referrer"
          />
        ))}

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
      </div>

      <PhotoCredit photo={active} />
    </figure>
  )
}
