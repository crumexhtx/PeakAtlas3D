import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { Peak, UnitSystem } from '../types/peak'
import {
  formatCoordinates,
  formatDistance,
  formatElevation,
} from '../lib/geo'
import { flagUrl } from '../lib/countries'

export function seoPeakHeading(peakName: string): string {
  return `${peakName} 3D Map & Topography`
}

/** schema.org Mountain JSON-LD for peak pages (crawlable structured data). */
export function peakMountainJsonLd(peak: Peak, pageUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Mountain',
    name: peak.name,
    alternateName: peak.aliases?.length ? peak.aliases : undefined,
    description:
      peak.whyNotable?.trim() ||
      peak.description?.trim() ||
      `${peak.name} in the ${peak.range}, ${peak.country}.`,
    url: pageUrl,
    geo: {
      '@type': 'GeoCoordinates',
      latitude: peak.lat,
      longitude: peak.lon,
      elevation: `${Math.round(peak.elevationFt * 0.3048)} m`,
    },
    containedInPlace: {
      '@type': 'MountainRange',
      name: peak.range,
    },
    addressCountry: peak.country,
  }
}

type PeakSeoLayoutProps = {
  peak: Peak
  units: UnitSystem
  /** Photo gallery or other media (deferred during cinematic). */
  media?: ReactNode
  /** Trails, lodging, and other interactive sections below the SEO core. */
  children?: ReactNode
}

/**
 * Semantic peak article: crawlable hierarchy + stats for long-tail SEO,
 * while living inside the existing sticky/side dossier (map stays full-bleed).
 */
export function PeakSeoLayout({
  peak,
  units,
  media,
  children,
}: PeakSeoLayoutProps) {
  const flag = flagUrl(peak.country, 40)
  const nearby = peak.nearbyPlaces?.length
    ? peak.nearbyPlaces
    : peak.nearestTown
      ? [peak.nearestTown]
      : []

  const approachRoutes = nearby
    .map((p) => p.route)
    .filter((r): r is string => Boolean(r?.trim()))

  return (
    <article
      className="peak-dossier peak-seo-layout"
      itemScope
      itemType="https://schema.org/Mountain"
      aria-labelledby="peak-seo-title"
    >
      <Link to="/" className="dossier-back-globe">
        ← Back to Global Globe
      </Link>

      <header className="dossier-top peak-seo-header">
        {flag && (
          <img
            src={flag}
            alt={`${peak.country} flag`}
            className="dossier-flag"
            width={36}
            height={24}
            decoding="async"
          />
        )}
        <div>
          <p className="dossier-eyebrow">
            <span itemProp="addressCountry">{peak.country}</span>
          </p>
          <h1 id="peak-seo-title" className="dossier-title">
            <span itemProp="name">{peak.name}</span>{' '}
            <span className="peak-seo-qualifier">3D Map & Topography</span>
          </h1>
          <p className="dossier-subtitle">
            <span itemProp="containedInPlace" itemScope itemType="https://schema.org/MountainRange">
              <span itemProp="name">{peak.range}</span>
            </span>
            {' · '}
            Interactive 3D globe view
          </p>
          {peak.aliases && peak.aliases.length > 0 && (
            <p className="dossier-aliases">
              Also known as{' '}
              <span itemProp="alternateName">{peak.aliases.join(' · ')}</span>
            </p>
          )}
        </div>
      </header>

      {media}

      <section
        className="info-block peak-seo-stats"
        aria-label={`${peak.name} mountain statistics`}
      >
        <h2 className="info-heading">Peak stats</h2>
        <dl className="info-list">
          <div>
            <dt>Elevation</dt>
            <dd itemProp="elevation">
              {formatElevation(peak.elevationFt, units)}
            </dd>
          </div>
          <div>
            <dt>Prominence</dt>
            <dd>{formatElevation(peak.prominenceFt, units)}</dd>
          </div>
          <div>
            <dt>Mountain range</dt>
            <dd>{peak.range}</dd>
          </div>
          <div>
            <dt>Difficulty</dt>
            <dd>{peak.difficulty}</dd>
          </div>
          {peak.bestSeason && (
            <div>
              <dt>Best season</dt>
              <dd>{peak.bestSeason}</dd>
            </div>
          )}
          <div>
            <dt>First ascent</dt>
            <dd>{peak.firstAscent}</dd>
          </div>
          <div>
            <dt>Coordinates</dt>
            <dd
              itemProp="geo"
              itemScope
              itemType="https://schema.org/GeoCoordinates"
            >
              <meta itemProp="latitude" content={String(peak.lat)} />
              <meta itemProp="longitude" content={String(peak.lon)} />
              {formatCoordinates(peak.lat, peak.lon)}
            </dd>
          </div>
        </dl>
      </section>

      <section
        className="info-block peak-seo-about"
        aria-label={`About ${peak.name} topography and climbing context`}
      >
        <h2 className="info-heading">Geography & climbing context</h2>
        {peak.whyNotable && (
          <p className="peak-why-notable">{peak.whyNotable}</p>
        )}
        <p className="peak-description" itemProp="description">
          {peak.description}
        </p>
        <p className="peak-seo-map-blurb">
          Explore {peak.name} on PeakAtlas3D’s interactive 3D topographic map —
          satellite terrain, summit framing, and nearby staging towns for
          planning approaches in the {peak.range}.
        </p>
        {approachRoutes.length > 0 && (
          <p className="peak-seo-routes">
            Common approach roads near the summit area:{' '}
            {approachRoutes.join(', ')}.
          </p>
        )}
        {nearby.length > 0 && (
          <p className="peak-seo-staging">
            Closest staging:{' '}
            {nearby
              .slice(0, 3)
              .map(
                (p) =>
                  `${p.name} (${formatDistance(p.distanceMiles, units)}${
                    p.route ? ` via ${p.route}` : ''
                  })`,
              )
              .join('; ')}
            .
          </p>
        )}
      </section>

      {nearby.length > 0 && (
        <section
          className="info-block"
          aria-label={`Places near ${peak.name}`}
        >
          <h2 className="info-heading">Closest places</h2>
          <ul className="nearby-places-list">
            {nearby.map((place) => (
              <li key={`${place.name}-${place.lat}`}>
                <span className="nearby-places-name">{place.name}</span>
                <span className="nearby-places-meta">
                  {place.region} · {formatDistance(place.distanceMiles, units)}
                  {place.route ? ` · ${place.route}` : ''}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {children}
    </article>
  )
}
