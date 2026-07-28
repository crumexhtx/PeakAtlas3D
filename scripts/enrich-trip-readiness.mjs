/**
 * Enrich peaks.json for the trip-readiness pivot:
 * - difficultyTier (normalized from free-text difficulty)
 * - permitRequired / permitStatus / permitNotes (curated where known; else unsourced)
 * - seoMetaDescription tweak to mention difficulty + best season when missing
 *
 * Run: node scripts/enrich-trip-readiness.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const peaksPath = join(root, 'src', 'data', 'peaks.json')

const DIFFICULTY_TO_TIER = {
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

function inferTier(difficulty) {
  if (DIFFICULTY_TO_TIER[difficulty]) return DIFFICULTY_TO_TIER[difficulty]
  const d = String(difficulty || '').toLowerCase()
  if (/expedition|trekking peak|high-altitude trek|polar|expedition backpack/.test(d)) {
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
  if (/scramble|class 3|class 4|class 2[–-]3/.test(d)) return 'scramble'
  if (/strenuous|class 2|overnight|high-altitude hike|restricted/.test(d)) {
    return 'strenuous-hike'
  }
  return 'day-hike'
}

/**
 * Curated permit notes for well-known peaks. Ids not listed stay unsourced
 * rather than silently implying “no permit needed.”
 */
const PERMIT_BY_ID = {
  whitney: {
    permitRequired: true,
    permitStatus: 'required',
    permitNotes:
      'Inyo National Forest wilderness permit + quota for overnight; day-hike Whitney Portal corridor also regulated in peak season.',
  },
  halfdome: {
    permitRequired: true,
    permitStatus: 'required',
    permitNotes:
      'Yosemite Half Dome cables permit (lottery / day-of) required when cables are up.',
  },
  rainier: {
    permitRequired: true,
    permitStatus: 'required',
    permitNotes:
      'Mount Rainier National Park climbing pass + wilderness camping permits for overnight climbs.',
  },
  denali: {
    permitRequired: true,
    permitStatus: 'required',
    permitNotes:
      'Denali National Park climbing registration and special use requirements for the West Buttress and other routes.',
  },
  everest: {
    permitRequired: true,
    permitStatus: 'required',
    permitNotes:
      'Nepal (or Tibet) climbing permit via licensed operator; multiple agency fees apply.',
  },
  k2: {
    permitRequired: true,
    permitStatus: 'required',
    permitNotes: 'Pakistan climbing permit and licensed expedition operator required.',
  },
  fuji: {
    permitRequired: true,
    permitStatus: 'required',
    permitNotes:
      'Seasonal climbing fee / reservation rules on the Yoshida trail and related approaches — check current prefecture guidance.',
  },
  oldrag: {
    permitRequired: true,
    permitStatus: 'required',
    permitNotes:
      'Shenandoah National Park Old Rag day-use ticket required in peak season.',
  },
  sthelens: {
    permitRequired: true,
    permitStatus: 'required',
    permitNotes:
      'Mount St. Helens climbing permit required above 4,800 ft (Monument climbing pass).',
  },
  elcapitan: {
    permitRequired: true,
    permitStatus: 'required',
    permitNotes:
      'Yosemite wilderness permit for overnight wall climbs; day climbing still subject to park regulations.',
  },
  shasta: {
    permitRequired: true,
    permitStatus: 'required',
    permitNotes:
      'Summit pass required for climbs above 10,000 ft on Mount Shasta (USFS).',
  },
  hood: {
    permitRequired: false,
    permitStatus: 'not_required',
    permitNotes:
      'No general climbing permit for standard south-side routes; wilderness rules and seasonal restrictions still apply.',
  },
  adams: {
    permitRequired: false,
    permitStatus: 'not_required',
    permitNotes:
      'No general climbing permit for standard Cascade routes; check wilderness regulations for overnight.',
  },
  baker: {
    permitRequired: false,
    permitStatus: 'not_required',
    permitNotes:
      'No general summit permit for standard routes; overnight wilderness rules may apply.',
  },
  monadnock: {
    permitRequired: false,
    permitStatus: 'not_required',
    permitNotes:
      'No climbing permit; paid parking / park day-use fees apply at common trailheads.',
  },
  blackelk: {
    permitRequired: false,
    permitStatus: 'not_required',
    permitNotes:
      'No summit permit; park entrance / recreation fees may apply in the Black Hills.',
  },
  boundary: {
    permitRequired: false,
    permitStatus: 'not_required',
    permitNotes:
      'No special summit permit on standard approaches; stay on public land and check seasonal road access.',
  },
  rogers: {
    permitRequired: false,
    permitStatus: 'not_required',
    permitNotes:
      'No summit permit; standard National Forest / AT use rules apply near Grayson Highlands.',
  },
  lafayette: {
    permitRequired: false,
    permitStatus: 'not_required',
    permitNotes:
      'No summit permit; White Mountain National Forest parking fees / recreation passes common at trailheads.',
  },
  madison: {
    permitRequired: false,
    permitStatus: 'not_required',
    permitNotes:
      'No summit permit; Presidential Range approaches often need recreation parking passes.',
  },
  adamsnh: {
    permitRequired: false,
    permitStatus: 'not_required',
    permitNotes:
      'No summit permit; Presidential Range trailheads typically require parking / recreation fees.',
  },
  princeton: {
    permitRequired: false,
    permitStatus: 'not_required',
    permitNotes:
      'No special 14er permit on standard routes; check seasonal road closures and Leave No Trace.',
  },
  elbert: {
    permitRequired: false,
    permitStatus: 'not_required',
    permitNotes:
      'No special summit permit on standard Mount Elbert trails. Check San Isabel National Forest road/trail status and practice Leave No Trace on this busy 14er.',
  },
  yale: {
    permitRequired: false,
    permitStatus: 'not_required',
    permitNotes:
      'No special 14er permit on standard routes; check seasonal road closures.',
  },
  handies: {
    permitRequired: false,
    permitStatus: 'not_required',
    permitNotes:
      'No special 14er permit on standard American Basin approaches; high-clearance road access varies.',
  },
  holycross: {
    permitRequired: false,
    permitStatus: 'not_required',
    permitNotes:
      'No special summit permit on standard routes; check Forest Service road and trail status.',
  },
  crestoneneedle: {
    permitRequired: false,
    permitStatus: 'not_required',
    permitNotes:
      'No special summit permit; Sangre de Cristo wilderness rules apply on overnight trips.',
  },
  longs: {
    permitRequired: true,
    permitStatus: 'required',
    permitNotes:
      'Rocky Mountain National Park timed-entry / trailhead permits may apply in peak season.',
  },
  matterhorn: {
    permitRequired: false,
    permitStatus: 'not_required',
    permitNotes:
      'No general government climbing permit for the Hörnli; hut bookings and guide requirements are the practical gate.',
  },
  montblanc: {
    permitRequired: false,
    permitStatus: 'not_required',
    permitNotes:
      'No single universal summit permit; hut reservations and local access rules are the main logistics constraint.',
  },
  kilimanjaro: {
    permitRequired: true,
    permitStatus: 'required',
    permitNotes:
      'Tanzanian park fees and a licensed operator / guide required for all standard routes.',
  },
  aconcagua: {
    permitRequired: true,
    permitStatus: 'required',
    permitNotes:
      'Aconcagua Provincial Park climbing permit required; medical check rules apply in season.',
  },
  rittenhouse: {
    permitRequired: true,
    permitStatus: 'required',
    permitNotes:
      'Antarctic logistics via authorized operator; IAATO / national program rules apply.',
  },
  elbrus: {
    permitRequired: true,
    permitStatus: 'required',
    permitNotes:
      'Border-zone / park permits typically required; use a current licensed operator for access rules.',
  },
}

function clipSeo(text, max = 155) {
  const t = text.replace(/\s+/g, ' ').trim()
  if (t.length <= max) return t
  return `${t.slice(0, max - 1).trimEnd()}…`
}

function ensureTripSeo(peak) {
  const existing = String(peak.seoMetaDescription || '').trim()
  const diff = String(peak.difficulty || '').trim()
  const season = String(peak.bestSeason || '').trim()
  const hay = existing.toLowerCase()
  const hasDiff =
    diff &&
    (hay.includes(diff.toLowerCase()) ||
      hay.includes('class ') ||
      hay.includes('hike') ||
      hay.includes('scramble') ||
      hay.includes('glacier') ||
      hay.includes('expedition') ||
      hay.includes('climb') ||
      hay.includes('difficulty'))
  const hasSeason =
    season &&
    (hay.includes(season.toLowerCase()) ||
      hay.includes('season') ||
      hay.includes('jul') ||
      hay.includes('jun') ||
      hay.includes('may') ||
      hay.includes('aug') ||
      hay.includes('sep') ||
      hay.includes('best '))

  if (existing && hasDiff && hasSeason) return existing

  const locationBits = [peak.range, peak.nearestTown?.region || peak.country]
    .filter(Boolean)
    .join(', ')
  const parts = [
    `Plan ${peak.name}: ${diff || 'check difficulty'}`,
    season ? `best ${season}` : null,
    locationBits ? `${locationBits}` : null,
    'trip notes and 3D terrain on PeakAtlas3D.',
  ].filter(Boolean)
  return clipSeo(parts.join(' — '))
}

const peaks = JSON.parse(readFileSync(peaksPath, 'utf8'))
if (!Array.isArray(peaks)) {
  console.error('peaks.json must be an array')
  process.exit(1)
}

const tierCounts = {}
const permitCounts = { required: 0, not_required: 0, unsourced: 0 }
const unknownDifficulty = []

for (const peak of peaks) {
  const tier = inferTier(peak.difficulty)
  peak.difficultyTier = tier
  tierCounts[tier] = (tierCounts[tier] || 0) + 1
  if (!DIFFICULTY_TO_TIER[peak.difficulty]) {
    unknownDifficulty.push(`${peak.id}: ${peak.difficulty}`)
  }

  const curated = PERMIT_BY_ID[peak.id]
  if (curated) {
    peak.permitRequired = curated.permitRequired
    peak.permitStatus = curated.permitStatus
    if (curated.permitNotes) peak.permitNotes = curated.permitNotes
  } else {
    peak.permitRequired = null
    peak.permitStatus = 'unsourced'
    // Keep any prior notes; otherwise leave undefined so UI can show “not yet verified.”
    if (!peak.permitNotes) delete peak.permitNotes
  }
  permitCounts[peak.permitStatus] = (permitCounts[peak.permitStatus] || 0) + 1

  if (!peak.bestSeason || !String(peak.bestSeason).trim()) {
    console.warn(`missing bestSeason: ${peak.id}`)
  }
  if (!peak.difficulty || !String(peak.difficulty).trim()) {
    console.warn(`missing difficulty: ${peak.id}`)
  }

  peak.seoMetaDescription = ensureTripSeo(peak)
}

writeFileSync(peaksPath, `${JSON.stringify(peaks, null, 2)}\n`)

console.log('tier counts:', tierCounts)
console.log('permit counts:', permitCounts)
console.log(
  `unknown difficulty strings (used keyword fallback): ${unknownDifficulty.length}`,
)
if (unknownDifficulty.length) {
  unknownDifficulty.slice(0, 20).forEach((l) => console.log('  ', l))
}
console.log(`Wrote ${peaks.length} peaks → ${peaksPath}`)
