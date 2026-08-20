import { peakCopyVariant } from './peakSnapshot'

type LeadPeak = {
  id: string
  name: string
  difficulty?: string
  bestSeason?: string
  range?: string
  nearestTown?: { name: string; distanceMiles?: number } | null
  hotels?: unknown[]
  food?: unknown[]
  trails?: unknown[]
}

function townBit(peak: LeadPeak): string {
  const t = peak.nearestTown
  if (!t?.name) return 'the closest listed staging town'
  if (typeof t.distanceMiles === 'number') {
    return `${t.name} (~${t.distanceMiles.toFixed(t.distanceMiles >= 10 ? 0 : 1)} mi)`
  }
  return t.name
}

/** Question-style H2 + short standalone answer before detail lists. */
export type SectionLead = {
  heading: string
  answer: string
}

export function tripReadinessLead(peak: LeadPeak): SectionLead {
  const season = peak.bestSeason?.trim() || 'the published season window'
  const variants = [
    {
      heading: `How hard is ${peak.name}, and what do you need before you go?`,
      answer: `${peak.name} is listed as ${peak.difficulty || 'a graded objective'} with a best season of ${season}. Use the difficulty tier, permit line, and staging distance below — then open the gear checklist for that tier before you commit to a date.`,
    },
    {
      heading: `Can you climb ${peak.name} this season?`,
      answer: `Start with PeakAtlas trip readiness: difficulty (${peak.difficulty || 'see catalog'}), season (${season}), permits, and access via ${townBit(peak)}. Expand the gear list for the matched tier; always re-check the land manager for live rules.`,
    },
    {
      heading: `What should you know before attempting ${peak.name}?`,
      answer: `The catalog tags ${peak.name} as ${peak.difficulty || 'difficulty varies'} and points to ${season} as the usual window. Permits and staging (${townBit(peak)}) sit in the grid below so you can decide fitness, season, and paperwork before looking at trails or lodging.`,
    },
  ]
  return variants[peakCopyVariant(peak.id, variants.length)]
}

export function peakStatsLead(peak: LeadPeak): SectionLead {
  const variants = [
    {
      heading: `How tall is ${peak.name}, and where is it?`,
      answer: `${peak.name} sits in the ${peak.range || 'listed range'}. The stats grid below is the PeakAtlas catalog record — elevation, prominence, difficulty string, season, first ascent, and coordinates used across the site and comparison pages.`,
    },
    {
      heading: `What are the key numbers for ${peak.name}?`,
      answer: `These are the proprietary catalog figures for ${peak.name}: elevation and prominence in feet, free-text difficulty, best season, and summit coordinates. They power the snapshot above and any A-vs-B comparisons that include this peak.`,
    },
  ]
  return variants[peakCopyVariant(peak.id, variants.length)]
}

export function geographyLead(peak: LeadPeak): SectionLead {
  const variants = [
    {
      heading: `What makes ${peak.name} notable?`,
      answer: `Read the why-notable hook and climbing context first, then use the 3D map for terrain. Approach roads and staging distances below are from the catalog’s nearest-town fields — useful when AI summaries omit local access details.`,
    },
    {
      heading: `Where is ${peak.name}, and how do people approach it?`,
      answer: `${peak.name} is framed here with geography, climbing context, and listed approach roads. Pair this section with the interactive globe for summit framing after you check season and permits.`,
    },
  ]
  return variants[peakCopyVariant(peak.id, variants.length)]
}

export function closestPlacesLead(peak: LeadPeak): SectionLead {
  const lodging = peak.hotels?.length ?? 0
  if (lodging === 0) {
    return {
      heading: `Where should you stage near ${peak.name}?`,
      answer: `OpenStreetMap has limited lodging mapped near ${peak.name}, so PeakAtlas lists closest staging towns by summit distance instead of a hotel directory. Most parties base in ${townBit(peak)} — confirm beds, road status, and permits before you travel.`,
    }
  }
  return {
    heading: `Where should you stage near ${peak.name}?`,
    answer: `Closest staging towns are ranked by distance from the summit — separate from the OSM lodging pins below, which can be sparse in remote regions. Most parties sleep in ${townBit(peak)} and day-trip or hut-hop from there — confirm beds and road status before you travel.`,
  }
}

export function trailsLead(peak: LeadPeak): SectionLead {
  const n = peak.trails?.length ?? 0
  const variants = [
    {
      heading: `What are the main routes on ${peak.name}?`,
      answer:
        n > 0
          ? `PeakAtlas lists ${n} popular trail or route name${n === 1 ? '' : 's'} for ${peak.name}. Treat these as planning labels with outbound references — verify conditions, GPX, and closures before you climb.`
          : `Route names for ${peak.name} appear when curated. Until then, use the difficulty tier and 3D terrain, then confirm approaches with the land manager or a trusted guidebook.`,
    },
    {
      heading: `Which trails lead toward ${peak.name}?`,
      answer:
        n > 0
          ? `Below are the catalog’s popular routes for ${peak.name}. Links (when present) go to 14ers.com or agency pages — PeakAtlas does not replace a current trip report.`
          : `No curated trail list yet for ${peak.name}. Use trip readiness and the map, then check official sources for the current approach.`,
    },
  ]
  return variants[peakCopyVariant(peak.id, variants.length)]
}

export function lodgingLead(peak: LeadPeak): SectionLead {
  const lodging = peak.hotels?.length ?? 0
  const dining = peak.food?.length ?? 0
  const heading = `Where can you stay and eat near ${peak.name}?`

  // Lodging comes from OpenStreetMap when present. Food entries are PeakAtlas
  // suggestions (not OSM) unless an entry carries source/sourceUrl — keep that
  // distinction honest, especially for remote regions with sparse OSM coverage.
  if (lodging === 0 && dining === 0) {
    return {
      heading,
      answer: `Limited lodging and dining data is mapped for this region near ${peak.name}. PeakAtlas does not invent hotel listings to match better-mapped peaks — stage in ${townBit(peak)} and use official permit / park links when shown below.`,
    }
  }
  if (lodging === 0) {
    return {
      heading,
      answer: `Limited lodging data is mapped from OpenStreetMap near ${peak.name} — common for remote approaches. Stage in ${townBit(peak)} and book early. Dining lines below are PeakAtlas suggestions, not OSM listings; always confirm hours and availability.`,
    }
  }
  if (dining > 0) {
    return {
      heading,
      answer: `PeakAtlas maps ${lodging} lodging place${lodging === 1 ? '' : 's'} from OpenStreetMap near ${peak.name} (coverage is often thinner outside well-mapped regions). Dining lines are PeakAtlas suggestions, not OSM — confirm everything before you travel.`,
    }
  }
  return {
    heading,
    answer: `PeakAtlas maps ${lodging} lodging place${lodging === 1 ? '' : 's'} from OpenStreetMap near ${peak.name}. Mapped dining is limited for this region — stage meals in ${townBit(peak)} and confirm options locally.`,
  }
}

export function planningResourcesLead(peak: LeadPeak): SectionLead {
  return {
    heading: `Where else should you check before ${peak.name}?`,
    answer: `When OpenStreetMap lodging is thin, PeakAtlas links official park, federation, or permit pages instead of inventing local businesses. Confirm fees, seasons, and operator rules on those sites before you travel.`,
  }
}
