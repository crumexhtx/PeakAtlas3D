import { useEffect, useState } from 'react'
import type { PeakPhoto } from '../types/peak'
import { photoCandidateUrls } from '../lib/photoUrl'

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

function PeakPhotoSlide({
  photo,
  peakName,
  index,
  active,
  eager,
  onReady,
}: {
  photo: PeakPhoto
  peakName: string
  index: number
  active: boolean
  eager: boolean
  onReady?: () => void
}) {
  const candidates = photoCandidateUrls(photo.url)
  const [candidateIndex, setCandidateIndex] = useState(0)
  const [failed, setFailed] = useState(false)
  const src = candidates[candidateIndex]

  useEffect(() => {
    setCandidateIndex(0)
    setFailed(false)
  }, [photo.url])

  if (failed || !src) {
    return (
      <div
        className={`peak-photo-slide peak-photo-fallback ${active ? 'is-active' : ''}`}
        role="img"
        aria-label={`${peakName} — photo unavailable`}
      >
        <p>Photo unavailable</p>
        {photo.sourceUrl && (
          <a href={photo.sourceUrl} target="_blank" rel="noopener noreferrer">
            View on Commons
          </a>
        )}
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={`${peakName} — view ${index + 1}`}
      className={`peak-photo-slide ${active ? 'is-active' : ''}`}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      referrerPolicy="no-referrer"
      onLoad={() => onReady?.()}
      onError={() => {
        if (candidateIndex + 1 < candidates.length) {
          setCandidateIndex((i) => i + 1)
          return
        }
        setFailed(true)
        // Reveal fallback UI rather than leaving an empty hole forever.
        onReady?.()
      }}
    />
  )
}

export function PeakPhotoGallery({ name: peakName, photos }: PeakPhotoGalleryProps) {
  const slides = photos.filter((p) => p?.url).slice(0, 2)
  const [index, setIndex] = useState(0)
  const multi = slides.length > 1
  const [paused, setPaused] = useState(false)
  const [visible, setVisible] = useState(false)
  const active = slides[index] ?? slides[0]

  useEffect(() => {
    setIndex(0)
    setVisible(false)
  }, [peakName])

  useEffect(() => {
    if (!multi || paused || !visible) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % slides.length)
    }, ROTATE_MS)
    return () => window.clearInterval(id)
  }, [multi, slides.length, peakName, paused, visible])

  if (!slides.length || !active) return null

  return (
    <figure
      className={`peak-photo${multi ? ' peak-photo-gallery' : ''}${visible ? ' is-ready' : ' is-pending'}`}
      hidden={!visible}
      onMouseEnter={multi ? () => setPaused(true) : undefined}
      onMouseLeave={multi ? () => setPaused(false) : undefined}
    >
      <div className="peak-photo-stage">
        {slides.map((photo, i) => (
          <PeakPhotoSlide
            key={photo.url}
            photo={photo}
            peakName={peakName}
            index={i}
            active={i === index}
            eager={i === 0}
            onReady={i === 0 ? () => setVisible(true) : undefined}
          />
        ))}

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
