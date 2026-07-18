import { useEffect, useState } from 'react'
import type { PeakPhoto } from '../types/peak'

const ROTATE_MS = 5_500

type PeakPhotoGalleryProps = {
  name: string
  photos: PeakPhoto[]
}

export function PeakPhotoGallery({ name, photos }: PeakPhotoGalleryProps) {
  const slides = photos.filter((p) => p?.url).slice(0, 2)
  const [index, setIndex] = useState(0)
  const multi = slides.length > 1

  useEffect(() => {
    setIndex(0)
  }, [name])

  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (!multi || paused) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % slides.length)
    }, ROTATE_MS)
    return () => window.clearInterval(id)
  }, [multi, slides.length, name, paused])

  if (!slides.length) return null

  const active = slides[Math.min(index, slides.length - 1)] ?? slides[0]

  // Single still: skip the fade stack (avoids opacity:0 edge cases).
  if (!multi) {
    return (
      <figure className="peak-photo">
        <img
          src={active.url}
          alt={`${name} — summit view`}
          loading="eager"
          decoding="async"
          referrerPolicy="no-referrer"
        />
        <figcaption className="peak-photo-credit">
          <a href={active.sourceUrl} target="_blank" rel="noreferrer">
            {active.credit}
          </a>
          {active.license ? ` · ${active.license}` : ''}
        </figcaption>
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
            alt={`${name} — view ${i + 1}`}
            className={`peak-photo-slide ${i === index ? 'is-active' : ''}`}
            loading={i === 0 ? 'eager' : 'lazy'}
            decoding="async"
            referrerPolicy="no-referrer"
          />
        ))}
      </div>

      <figcaption className="peak-photo-credit">
        <a href={active.sourceUrl} target="_blank" rel="noreferrer">
          {active.credit}
        </a>
        {active.license ? ` · ${active.license}` : ''}
        {multi && (
          <span className="peak-photo-dots" aria-hidden="true">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                className={`peak-photo-dot ${i === index ? 'is-active' : ''}`}
                aria-label={`Show photo ${i + 1}`}
                onClick={() => setIndex(i)}
              />
            ))}
          </span>
        )}
      </figcaption>
    </figure>
  )
}
