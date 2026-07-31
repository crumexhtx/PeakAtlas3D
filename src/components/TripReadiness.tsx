import { useMemo, useState } from 'react'
import type { Peak } from '../types/peak'
import { formatDistance } from '../lib/geo'
import {
  DIFFICULTY_TIER_LABELS,
  resolveDifficultyTier,
} from '../lib/difficultyTiers'
import { gearChecklistForTier } from '../lib/gearChecklists'
import { tripReadinessLead } from '../lib/peakSectionLeads'
import { useUnits } from '../context/UnitsContext'

type TripReadinessProps = {
  peak: Peak
}

function permitLabel(peak: Peak): { title: string; detail: string; tone: string } {
  if (peak.permitStatus === 'required' || peak.permitRequired === true) {
    return {
      title: 'Permit required',
      detail:
        peak.permitNotes?.trim() ||
        'A permit or reservation is required — confirm current agency rules before you go.',
      tone: 'is-required',
    }
  }
  if (peak.permitStatus === 'not_required' || peak.permitRequired === false) {
    return {
      title: 'No special summit permit',
      detail:
        peak.permitNotes?.trim() ||
        'No dedicated summit permit on typical routes; trailhead fees or local rules may still apply.',
      tone: 'is-clear',
    }
  }
  return {
    title: 'Permit status unverified',
    detail:
      peak.permitNotes?.trim() ||
      'We have not yet confirmed agency permit rules for this peak — check the land manager before you go.',
    tone: 'is-unsourced',
  }
}

/**
 * Scannable trip-planning block: difficulty, season, access, gear tier.
 * Lives at the top of the peak dossier (map stays the supporting 3D backdrop).
 */
export function TripReadiness({ peak }: TripReadinessProps) {
  const { units } = useUnits()
  const [gearOpen, setGearOpen] = useState(false)
  const tier = resolveDifficultyTier(peak.difficulty, peak.difficultyTier)
  const gear = gearChecklistForTier(tier)
  const permit = permitLabel(peak)
  const town = peak.nearestTown

  const accessLine = useMemo(() => {
    if (!town?.name) return 'Staging town not listed yet.'
    const dist =
      typeof town.distanceMiles === 'number'
        ? formatDistance(town.distanceMiles, units)
        : null
    const route = town.route?.trim()
    return [town.name, town.region, dist, route ? `via ${route}` : null]
      .filter(Boolean)
      .join(' · ')
  }, [town, units])
  const lead = tripReadinessLead(peak)

  return (
    <section
      className="info-block trip-readiness"
      aria-label={`Trip readiness for ${peak.name}`}
    >
      <h2 className="info-heading">{lead.heading}</h2>
      <p className="trip-readiness-lede section-answer-lead">{lead.answer}</p>

      <dl className="trip-readiness-grid">
        <div>
          <dt>Difficulty</dt>
          <dd>
            <span className="trip-readiness-value">{peak.difficulty}</span>
            <span className="trip-readiness-tier">
              {DIFFICULTY_TIER_LABELS[tier]}
            </span>
          </dd>
        </div>
        <div>
          <dt>Best season</dt>
          <dd>{peak.bestSeason}</dd>
        </div>
        <div>
          <dt>Access / staging</dt>
          <dd>{accessLine}</dd>
        </div>
        <div className={`trip-readiness-permit ${permit.tone}`}>
          <dt>Permits</dt>
          <dd>
            <span className="trip-readiness-value">{permit.title}</span>
            <span className="trip-readiness-note">{permit.detail}</span>
          </dd>
        </div>
      </dl>

      <div className="trip-readiness-gear">
        <button
          type="button"
          className="trip-readiness-gear-toggle"
          aria-expanded={gearOpen}
          onClick={() => setGearOpen((v) => !v)}
        >
          <span>{gear.title}</span>
          <span aria-hidden="true">{gearOpen ? '▴' : '▾'}</span>
        </button>
        {gearOpen && (
          <div className="trip-readiness-gear-body">
            <p className="trip-readiness-gear-summary">{gear.summary}</p>
            <ul className="trip-readiness-gear-list">
              {gear.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="trip-readiness-disclaimer">
              General planning checklist only — not real-time conditions or a
              safety guarantee. Verify current rules with the land manager.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
