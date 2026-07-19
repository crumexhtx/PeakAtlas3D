import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { releases } from '../data/releases'
import { applyDocumentMeta } from '../lib/documentMeta'

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(`${iso}T12:00:00`))
  } catch {
    return iso
  }
}

export function ReleasesPage() {
  useEffect(() => {
    applyDocumentMeta({
      title: 'Releases — PeakAtlas3D',
      description:
        'What’s new on PeakAtlas3D — product updates, atlas improvements, and site notes.',
      path: '/releases',
    })
  }, [])

  return (
    <article className="content-article releases-article">
      <p className="content-eyebrow">Releases</p>
      <h1 className="content-title">What’s new on the atlas</h1>
      <p className="content-lede">
        Product updates for PeakAtlas3D — improvements to the globe, peak pages,
        data sources, and the surrounding mountain context we share.
      </p>

      <ol className="release-list">
        {releases.map((release) => (
          <li key={release.version} className="release-card">
            <header className="release-card-head">
              <span className="release-version">v{release.version}</span>
              <time className="release-date" dateTime={release.date}>
                {formatDate(release.date)}
              </time>
            </header>
            <h2 className="release-title">{release.title}</h2>
            <p className="release-summary">{release.summary}</p>
            <ul className="release-highlights">
              {release.highlights.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </li>
        ))}
      </ol>

      <p className="content-cta-row">
        <Link to="/" className="content-cta">
          Open the atlas
        </Link>
        <Link to="/about#disclaimer" className="content-cta content-cta-secondary">
          Read disclaimers
        </Link>
      </p>
    </article>
  )
}
