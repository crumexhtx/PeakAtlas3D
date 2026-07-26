/**
 * Normalized difficulty tiers for trip-readiness gear checklists.
 * Free-text `difficulty` labels stay human-facing; `difficultyTier` is the stable key.
 */
export const DIFFICULTY_TIERS = [
  'day-hike',
  'strenuous-hike',
  'scramble',
  'snow-glacier',
  'alpine-technical',
  'expedition',
] as const

export type DifficultyTier = (typeof DIFFICULTY_TIERS)[number]

export const DIFFICULTY_TIER_LABELS: Record<DifficultyTier, string> = {
  'day-hike': 'Day hike',
  'strenuous-hike': 'Strenuous hike',
  scramble: 'Scramble',
  'snow-glacier': 'Snow / glacier',
  'alpine-technical': 'Alpine technical',
  expedition: 'Expedition',
}

/** Explicit map for every known catalog difficulty string (keep in sync via enrich script). */
export const DIFFICULTY_TO_TIER: Record<string, DifficultyTier> = {
  'Class 1 hike': 'day-hike',
  'Class 1–2 hike': 'day-hike',
  'Class 1 paved walk': 'day-hike',
  'Walk-up': 'day-hike',
  'Drive / easy to moderate hike': 'day-hike',
  'Drive / Class 1–2 hike': 'day-hike',
  'High-altitude drive / hike': 'day-hike',
  'Class 2 hike': 'strenuous-hike',
  'Drive / Class 2 hike': 'strenuous-hike',
  'Strenuous day hike': 'strenuous-hike',
  'Strenuous day / overnight': 'strenuous-hike',
  'Drive / strenuous day hike': 'strenuous-hike',
  'High-altitude hike': 'strenuous-hike',
  'Restricted / volcanic': 'strenuous-hike',
  'Class 2 scramble': 'scramble',
  'Class 2–3 scramble': 'scramble',
  'Class 3 scramble': 'scramble',
  'Class 3 scramble (permit)': 'scramble',
  'Class 3–4 scramble': 'scramble',
  'Class 4 scramble': 'scramble',
  'Class 2–3 scramble / permit climb': 'scramble',
  'Strenuous day hike / scramble': 'scramble',
  'Strenuous scramble / non-technical': 'scramble',
  'Snow / scramble': 'scramble',
  'Strenuous hike / cable scramble (permit)': 'scramble',
  'Via ferrata / scramble': 'alpine-technical',
  'Technical rock': 'alpine-technical',
  'Alpine rock ridge': 'alpine-technical',
  'Elite big-wall': 'alpine-technical',
  'Technical rock / ice': 'alpine-technical',
  'Alpine ice / rock': 'alpine-technical',
  'Alpine ice': 'alpine-technical',
  'Technical alpine': 'alpine-technical',
  'Alpine climb': 'alpine-technical',
  'Technical alpine / glacier': 'snow-glacier',
  'Glacier climb': 'snow-glacier',
  'Alpine glacier': 'snow-glacier',
  'Snow climb': 'snow-glacier',
  'Snow / glacier climb': 'snow-glacier',
  'Glacier climb / multi-day': 'snow-glacier',
  'Glacier climb / expedition backpack': 'expedition',
  'High-altitude expedition': 'expedition',
  'Extreme expedition': 'expedition',
  'Polar expedition': 'expedition',
  'Technical expedition': 'expedition',
  'High-altitude trek': 'expedition',
  'Trekking peak': 'expedition',
}

/** Keyword fallback for new peaks not yet in DIFFICULTY_TO_TIER. */
export function inferDifficultyTier(difficulty: string): DifficultyTier {
  const mapped = DIFFICULTY_TO_TIER[difficulty]
  if (mapped) return mapped

  const d = difficulty.toLowerCase()
  if (
    /expedition|trekking peak|high-altitude trek|polar|expedition backpack/.test(
      d,
    )
  ) {
    return 'expedition'
  }
  if (/glacier|snow climb|snow \/|alpine glacier|\/ glacier/.test(d)) {
    return 'snow-glacier'
  }
  if (
    /technical alpine|alpine climb|alpine ice|alpine rock|technical rock|big-wall|via ferrata|technical expedition/.test(
      d,
    )
  ) {
    return 'alpine-technical'
  }
  if (/scramble|class 3|class 4|class 2[–-]3/.test(d)) {
    return 'scramble'
  }
  if (
    /strenuous|class 2|overnight|high-altitude hike|restricted/.test(d)
  ) {
    return 'strenuous-hike'
  }
  return 'day-hike'
}

export function isDifficultyTier(value: unknown): value is DifficultyTier {
  return (
    typeof value === 'string' &&
    (DIFFICULTY_TIERS as readonly string[]).includes(value)
  )
}

export function resolveDifficultyTier(
  difficulty: string,
  stored?: string | null,
): DifficultyTier {
  if (isDifficultyTier(stored)) return stored
  return inferDifficultyTier(difficulty)
}
