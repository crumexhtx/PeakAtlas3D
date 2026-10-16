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
  vinson: {
    permitRequired: true,
    permitStatus: 'required',
    permitNotes:
      'Antarctic expedition access requires national Antarctic program / IAATO-compliant operator logistics and permits. Independent travel is not practical.',
  },
  elbrus: {
    permitRequired: true,
    permitStatus: 'required',
    permitNotes:
      'Border-zone / park permits typically required; use a current licensed operator for access rules.',
  },
  monterosa: {
    permitRequired: false,
    permitStatus: 'not_required',
    permitNotes:
      'No general government summit permit; hut bookings and glacier conditions are the practical gates. Confirm Swiss/Italian border-approach rules with current hut staff.',
  },
  weisshorn: {
    permitRequired: false,
    permitStatus: 'not_required',
    permitNotes:
      'No general summit permit; Weisshorn Hut bookings and conditions are the main logistics constraint.',
  },
  dom: {
    permitRequired: false,
    permitStatus: 'not_required',
    permitNotes:
      'No general summit permit; Dom Hut reservations and glacier conditions govern the climb.',
  },
  dentblanche: {
    permitRequired: false,
    permitStatus: 'not_required',
    permitNotes:
      'No general summit permit; hut space and summer conditions are the practical limits.',
  },
  pizbernina: {
    permitRequired: false,
    permitStatus: 'not_required',
    permitNotes:
      'No general summit permit; hut and cableway logistics plus seasonal ridge conditions apply.',
  },
  granparadiso: {
    permitRequired: false,
    permitStatus: 'not_required',
    permitNotes:
      'No summit permit inside Gran Paradiso National Park for the normal route; park rules and hut bookings apply. Confirm current trail/glacier notices.',
  },
  cimaggrande: {
    permitRequired: false,
    permitStatus: 'not_required',
    permitNotes:
      'No summit permit for the normal rock route; paid access roads / parking to Rifugio Auronzo apply in season. Climbing ethics and fixed-gear norms are local.',
  },
  bennevis: {
    permitRequired: false,
    permitStatus: 'not_required',
    permitNotes:
      'No summit permit. Park responsibly in Glen Nevis; seasonal path and weather warnings from the Nevis Landscape Partnership / outdoor centers apply.',
  },
  snowdon: {
    permitRequired: false,
    permitStatus: 'not_required',
    permitNotes:
      'No summit permit. Parking fills early; Eryri/Snowdonia National Park path and railway rules apply. Check weather and path status before you go.',
  },
  scafellpike: {
    permitRequired: false,
    permitStatus: 'not_required',
    permitNotes:
      'No summit permit. National Trust / Lake District parking and Leave No Trace rules apply; paths are heavily eroded—stay on marked routes.',
  },
  carrauntoohil: {
    permitRequired: false,
    permitStatus: 'not_required',
    permitNotes:
      'No summit permit. Parking fees at Cronin’s Yard / Lisleibane are common; stay on paths and respect private farmland access.',
  },
  gerlach: {
    permitRequired: true,
    permitStatus: 'required',
    permitNotes:
      'Guided ascent required for most visitors (Tatra National Park rules). Book a certified mountain guide; unguided travel on the normal routes is restricted.',
  },
  etna: {
    permitRequired: true,
    permitStatus: 'required',
    permitNotes:
      'Access above authorized zones often requires authorized guides when alert levels rise. Follow Etna Park / Civil Protection closures—summit travel can be banned during eruptions.',
  },
  vesuvius: {
    permitRequired: true,
    permitStatus: 'required',
    permitNotes:
      'Entry ticket required for Vesuvius National Park crater path. Hours and access change with weather and alert level—book or buy on-site per current park rules.',
  },
  slide: {
    permitRequired: false,
    permitStatus: 'not_required',
    permitNotes:
      'No summit permit. Catskill Forest Preserve rules apply (day-use, camping regs, Leave No Trace). Parking fills early at busy trailheads.',
  },
  hunterny: {
    permitRequired: false,
    permitStatus: 'not_required',
    permitNotes:
      'No summit permit. Forest Preserve rules apply; respect ski-area closures and private land boundaries near the resort.',
  },
  blackdome: {
    permitRequired: false,
    permitStatus: 'not_required',
    permitNotes:
      'No summit permit. Catskill Forest Preserve day-use and camping rules apply; trailhead parking is limited.',
  },
  blackhead: {
    permitRequired: false,
    permitStatus: 'not_required',
    permitNotes:
      'No summit permit. Forest Preserve rules apply; carry traction in shoulder seasons on the east face.',
  },
  westkill: {
    permitRequired: false,
    permitStatus: 'not_required',
    permitNotes:
      'No summit permit. Forest Preserve rules apply; Spruceton / Diamond Notch parking is limited on peak weekends.',
  },
  puncakjaya: {
    permitRequired: true,
    permitStatus: 'required',
    permitNotes:
      'Indonesian conservation (SIMAKSI) and local access permits are required; commercial teams use licensed PB-PJWA operators. Independent access is not practical — confirm current Papua / Mimika rules.',
  },
  ojosdelsalado: {
    permitRequired: true,
    permitStatus: 'required',
    permitNotes:
      'Chilean CONAF access to Nevado Tres Cruces and border/DIFROL authorization typically apply on the Copiapó approach. Confirm current Chile/Argentina park and border rules.',
  },
  rinjani: {
    permitRequired: true,
    permitStatus: 'required',
    permitNotes:
      'Mount Rinjani National Park trekking passes are required and issued through licensed operators (e-SIMAKSI / TNGR). Independent trekking is not allowed.',
  },
  merapeak: {
    permitRequired: true,
    permitStatus: 'required',
    permitNotes:
      'Nepal NMA trekking-peak permit plus TIMS / Khumbu rural municipality fees apply. Arrange through a licensed Nepal operator and confirm current NMA rules.',
  },
  lenin: {
    permitRequired: true,
    permitStatus: 'required',
    permitNotes:
      'Kyrgyzstan OVIR/border-zone and mountaineering permits are required for Achik-Tash / Lenin Peak. Confirm current Kyrgyz tourism and border rules.',
  },
  muztaghata: {
    permitRequired: true,
    permitStatus: 'required',
    permitNotes:
      'China mountaineering permits (CMA / Xinjiang association) plus an Alien Travel Permit for the Kashgar border area are required. Confirm current CXMA rules.',
  },
  zugspitze: {
    permitRequired: false,
    permitStatus: 'not_required',
    permitNotes:
      'No general summit climbing permit. Cable-car, cog railway, and trailhead rules apply; the Austrian border ridge is a walk-up / via ferrata mix.',
  },
  breithorn: {
    permitRequired: false,
    permitStatus: 'not_required',
    permitNotes:
      'No general climbing permit. Glacier travel from Klein Matterhorn is the constraint — hut/cable-car tickets and seasonal route conditions apply.',
  },
  monch: {
    permitRequired: false,
    permitStatus: 'not_required',
    permitNotes:
      'No general climbing permit. Jungfraujoch access and glacier/route conditions are the practical gates — confirm with Grindelwald / Jungfrau guides.',
  },
  aneto: {
    permitRequired: false,
    permitStatus: 'not_required',
    permitNotes:
      'No general summit permit in Posets-Maladeta Natural Park. Glacier travel on the normal route still needs seasonal assessment — confirm park access rules.',
  },
  rysy: {
    permitRequired: true,
    permitStatus: 'required',
    permitNotes:
      'Tatra National Park entry tickets are required on the Polish (TPN) and Slovak (TANAP) sides. Confirm current trail closures and ticket rules before you go.',
  },
  hvannadalshnukur: {
    permitRequired: false,
    permitStatus: 'not_required',
    permitNotes:
      'No separate summit climbing permit. Vatnajökull National Park access and guided glacier travel are the normal constraints — confirm current park / operator rules.',
  },
  ruapehu: {
    permitRequired: false,
    permitStatus: 'not_required',
    permitNotes:
      'No general summit permit. Tongariro National Park entry and volcanic alert levels apply — check DOC and GNS Science before climbing Tahurangi.',
  },
  taranaki: {
    permitRequired: false,
    permitStatus: 'not_required',
    permitNotes:
      'No general summit permit. Te Papakura o Taranaki (Egmont NP) track and weather rules apply — confirm current DOC alpine conditions.',
  },
  cameroon: {
    permitRequired: true,
    permitStatus: 'required',
    permitNotes:
      'Mount Cameroon National Park entry and locally arranged guides from Buea are typically required. Confirm current park office rules.',
  },
  margherita: {
    permitRequired: true,
    permitStatus: 'required',
    permitNotes:
      'Uganda Wildlife Authority (and ICCN on the DRC side) park and trekking permits are required for the Rwenzori / Margherita Peak route. Confirm current UWA / operator rules.',
  },
  roraima: {
    permitRequired: true,
    permitStatus: 'required',
    permitNotes:
      'Venezuela Inparques permits are required for the Roraima tepui trek (typically arranged from Santa Elena / Paraitepuy). Confirm current park and border rules.',
  },
  villarrica: {
    permitRequired: true,
    permitStatus: 'required',
    permitNotes:
      'CONAF requires a separate Villarrica crater-ascent pass (pasesparques.cl) in addition to park entry; most visitors must go with a licensed Pucón operator.',
  },
  acatenango: {
    permitRequired: true,
    permitStatus: 'required',
    permitNotes:
      'Overnight Acatenango hikes are arranged through licensed Antigua agencies with park / INSIVUMEH access. Confirm current Fuego-hazard and permit rules.',
  },
  temple: {
    permitRequired: false,
    permitStatus: 'not_required',
    permitNotes:
      'No scrambling permit. Parks Canada discovery pass / Banff entry and Moraine Lake access rules apply — confirm current Parks Canada conditions.',
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
  } else if (
    peak.permitStatus === 'required' ||
    peak.permitStatus === 'not_required'
  ) {
    // Later batches already curated these — do not wipe them to unsourced.
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
