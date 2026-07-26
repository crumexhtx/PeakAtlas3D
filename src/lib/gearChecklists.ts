import type { DifficultyTier } from './difficultyTiers'
import { DIFFICULTY_TIER_LABELS } from './difficultyTiers'

export type GearChecklist = {
  tier: DifficultyTier
  title: string
  summary: string
  items: string[]
}

/**
 * Standard prep checklists keyed to difficulty tiers — written once, reused
 * on every matching peak. General planning guidance only (not real-time safety).
 */
export const GEAR_CHECKLISTS: Record<DifficultyTier, GearChecklist> = {
  'day-hike': {
    tier: 'day-hike',
    title: 'Day-hike prep',
    summary:
      'Straightforward trail day — pack layers, water, and a simple exit plan.',
    items: [
      'Sturdy hiking shoes or boots with decent tread',
      'Weather layers (wind/rain shell + insulating mid-layer)',
      '2+ liters of water and calorie-dense snacks',
      'Navigation: offline map / GPS track + charged phone',
      'Sun protection (hat, sunscreen, sunglasses)',
      'Small first-aid kit and headlamp',
      'Check trailhead parking, hours, and any day-use fees',
    ],
  },
  'strenuous-hike': {
    tier: 'strenuous-hike',
    title: 'Strenuous-hike prep',
    summary:
      'Long mileage or big elevation — treat it like a full mountain day.',
    items: [
      'Broken-in boots and moisture-wicking socks (bring a spare pair)',
      'Trekking poles for steep descents',
      'Extra food for a longer-than-planned day',
      'Insulating layer even in summer (ridge wind and late finishes)',
      'Headlamp with spare batteries',
      'Blister care, electrolytes, and a basic repair kit',
      'Share your itinerary and turnaround time with someone off-trail',
    ],
  },
  scramble: {
    tier: 'scramble',
    title: 'Scramble prep',
    summary:
      'Hands-on rock above trail grade — prioritize footwear, helmets, and retreat options.',
    items: [
      'Approach shoes or boots with sticky rubber for rock',
      'Helmet for loose rock and short fall zones',
      'Light gloves for handholds and scree',
      'Route description / beta and a clear bail plan',
      'Layers that stay out of the way while climbing',
      'Extra water — scrambling burns time and focus',
      'Confirm permit or day-use rules before you leave (when required)',
    ],
  },
  'snow-glacier': {
    tier: 'snow-glacier',
    title: 'Snow & glacier prep',
    summary:
      'Snow travel and glacier hazards — skills and partners matter as much as gear.',
    items: [
      'Crampons that fit your boots, tested before the trip',
      'Ice axe and practice self-arrest on similar terrain',
      'Helmet, harness, and rope systems appropriate to the route',
      'Glacier travel / crevasse-rescue skills (or a guided option)',
      'Goggles, gloves, and sun protection for high-albedo snow',
      'Stove / melt plan if water sources are frozen',
      'Check seasonal snowpack, ranger advisories, and partner readiness',
    ],
  },
  'alpine-technical': {
    tier: 'alpine-technical',
    title: 'Alpine-technical prep',
    summary:
      'Rock, ice, or mixed alpine climbing — technical systems plus mountain weather buffers.',
    items: [
      'Rack / protection suited to the grade and rock quality',
      'Rope, belay device, helmet, and redundant anchors',
      'Climbing footwear plus approach shoes for the walk-in',
      'Lightweight alpine layers and a shell that packs small',
      'Emergency bivy / insulating kit for unexpected nights out',
      'Detailed topo or guidebook beta and escape routes',
      'Margin for weather windows — alpine forecasts change fast',
    ],
  },
  expedition: {
    tier: 'expedition',
    title: 'Expedition prep',
    summary:
      'Multi-day or high-altitude objectives — logistics, permits, and acclimatization drive success.',
    items: [
      'Expedition permit / visa / agency paperwork completed early',
      'Acclimatization plan and realistic turnaround elevations',
      'Altitude-appropriate tent, sleep system, and stove fuel budget',
      'Communications (satellite messenger) and evacuation insurance',
      'Medical kit including altitude-illness awareness meds (per your clinician)',
      'Food plan with contingency days and team roles',
      'Guided or highly experienced team for extreme / polar objectives',
    ],
  },
}

export function gearChecklistForTier(tier: DifficultyTier): GearChecklist {
  return GEAR_CHECKLISTS[tier]
}

export function gearChecklistTitle(tier: DifficultyTier): string {
  return `${DIFFICULTY_TIER_LABELS[tier]} checklist`
}
