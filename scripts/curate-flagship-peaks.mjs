/**
 * Curate trip-facing copy for flagship peaks that are most likely to rank
 * and convert from Google search.
 *
 * Run: node scripts/curate-flagship-peaks.mjs
 * Then: npm run peaks:index && npm run validate:catalog
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const peaksPath = join(root, 'src', 'data', 'peaks.json')

/** @type {Record<string, Partial<{
 *  whyNotable: string
 *  description: string
 *  seoMetaDescription: string
 *  bestSeason: string
 *  permitRequired: boolean | null
 *  permitStatus: 'required' | 'not_required' | 'unsourced'
 *  permitNotes: string
 * }>>} */
const FLAGSHIP = {
  rainier: {
    whyNotable:
      'Most glaciated peak in the Lower 48 — a serious glacier climb, not a walk-up.',
    description:
      'Mount Rainier is the most glaciated peak in the contiguous United States. Standard routes (DC, Emmons) are glacier climbs with crevasse hazard, party travel, and overnight high camps. Stage from Ashford / Paradise, carry a climbing pass, and treat weather and seracs as trip-ending risks—not scenery.',
    seoMetaDescription:
      'Mt. Rainier trip guide: glacier climb, Jul–Sep season, Rainier NP climbing pass, Ashford staging, and 3D terrain on PeakAtlas3D.',
    permitNotes:
      'Mount Rainier National Park climbing pass required for travel above 10,000 ft / on glaciers; wilderness camping permits for overnight high camps. Confirm current NPS rules before you go.',
  },
  denali: {
    whyNotable:
      'North America’s highest peak — cold, altitude, and multi-week expedition logistics.',
    description:
      'Denali is a polar-altitude expedition, not a guided day climb. Most parties fly from Talkeetna to the Kahiltna and spend weeks on the West Buttress with sled hauling, cache management, and extreme cold. Register with Denali National Park, budget for weather delays, and treat acclimatization as the main objective.',
    seoMetaDescription:
      'Denali trip guide: West Buttress expedition, May–Jul season, park registration, Talkeetna staging, and 3D terrain on PeakAtlas3D.',
    permitNotes:
      'Denali National Park climbing registration and special-use rules apply for the West Buttress and other routes. Work with current NPS guidance and air-taxi operators out of Talkeetna.',
  },
  everest: {
    whyNotable:
      'Earth’s highest summit — permit-heavy, operator-driven, and season-critical.',
    description:
      'Everest is a commercialized high-altitude expedition on the Nepal or Tibet side. Success depends on permits, a licensed operator, weather windows, and prior 8000 m experience more than summit-day fitness alone. Stage through Namche / Base Camp on the south side; budget for multiple agency fees and long logistics chains.',
    seoMetaDescription:
      'Mt. Everest trip guide: high-altitude expedition, Apr–May or Sep–Oct, Nepal/Tibet permits, Namche staging, 3D terrain on PeakAtlas3D.',
    permitNotes:
      'Nepal or Tibet climbing permits via a licensed operator; Sagarmatha / Chinese agency fees and liaison requirements apply. Do not self-organize without current operator support.',
  },
  whitney: {
    whyNotable:
      'Highest peak in the contiguous U.S. — a long Class 1–2 trail with a hard permit quota.',
    description:
      'Mount Whitney is a very long day or short overnight on the Mount Whitney Trail from Whitney Portal. The hiking is non-technical in summer, but altitude, distance, and a competitive Inyo National Forest permit quota stop more people than the terrain. Stage in Lone Pine; start early and respect afternoon Sierra weather.',
    seoMetaDescription:
      'Mt. Whitney trip guide: Class 1–2 hike, Jul–Sep, Inyo wilderness permit quota, Lone Pine staging, 3D terrain on PeakAtlas3D.',
    permitNotes:
      'Inyo National Forest wilderness permit with quota for the Whitney Zone (overnight and many day approaches). Reserve early; day-use rules change by season—confirm recreation.gov before you go.',
  },
  hood: {
    whyNotable:
      'Oregon’s classic Cascade snow climb above Timberline — popular, crevassed, and weather-volatile.',
    description:
      'Mount Hood’s south-side routes from Timberline Lodge are the Pacific Northwest’s most popular snow climbs. Expect early alpine starts, steep snow, and bergschrund / rock-fall hazard near the Pearly Gates or Old Chute. No general climbing permit, but avalanche and spring weather end seasons fast. Stage in Government Camp.',
    seoMetaDescription:
      'Mt. Hood trip guide: snow climb, May–Jul season, Timberline / Government Camp staging, no general permit, 3D terrain on PeakAtlas3D.',
    permitNotes:
      'No general climbing permit for standard south-side routes. Wilderness regulations, seasonal closures, and Timberline ski-area rules still apply—check USFS and climb conditions before you go.',
  },
  fuji: {
    whyNotable:
      'Japan’s sacred icon and busiest summit trail — seasonal fees and hut logistics matter.',
    description:
      'Mount Fuji is a strenuous Class 1 volcano hike on crowded summer trails (Yoshida, Subashiri, Gotemba, Fujinomiya). Most climbers start from a 5th Station, overnight in a mountain hut, and aim for sunrise on the crater rim. Bring cash for huts/fees, expect cold wind at the rim, and avoid off-season attempts without winter skills.',
    seoMetaDescription:
      'Mt. Fuji trip guide: Class 1 hike, Jul–early Sep, seasonal climbing fee, Fujiyoshida staging, 3D terrain on PeakAtlas3D.',
    permitNotes:
      'Seasonal climbing fee / reservation rules apply on major trails (including Yoshida). Check current Yamanashi / Shizuoka prefecture guidance before you go; hut bookings are separate.',
  },
  matterhorn: {
    whyNotable:
      'The world’s most famous alpine silhouette — a guided rock ridge, not a hike.',
    description:
      'The Matterhorn’s Hörnli Ridge is a long alpine rock climb above Zermatt: fixed ropes, exposure, rockfall, and mandatory fitness for moving fast on a crowded route. Most parties hire a UIAGM guide and overnight at Hörnli Hut. No government summit permit—hut space and conditions are the real gates. Cervinia offers the Italian Lion Ridge approach.',
    seoMetaDescription:
      'Matterhorn trip guide: alpine rock ridge, Jul–Sep, Hörnli Hut logistics, Zermatt staging, 3D terrain on PeakAtlas3D.',
    permitNotes:
      'No general government climbing permit for the Hörnli. Hut bookings, guide requirements, and seasonal route conditions are the practical constraints—confirm with Zermatt guides / hut staff.',
  },
  elbert: {
    whyNotable:
      'Colorado’s high point and the highest summit in the Rockies — a long walk-up with altitude.',
    description:
      'Mount Elbert is a non-technical Sawatch Range walk-up and Colorado’s state high point. Standard North and South Mount Elbert trails are strenuous because of length and altitude, not scrambling. Stage from Leadville or Twin Lakes; start early for thunderstorms, and treat 14,000 ft as the main difficulty.',
    seoMetaDescription:
      'Mt. Elbert trip guide: walk-up 14er, Jul–Sep season, Leadville staging, no special summit permit, 3D terrain on PeakAtlas3D.',
    permitRequired: false,
    permitStatus: 'not_required',
    permitNotes:
      'No special summit permit on standard Mount Elbert trails. Check San Isabel National Forest road/trail status and practice Leave No Trace on this busy 14er.',
  },
  halfdome: {
    whyNotable:
      'Yosemite’s cable-route icon — permit lottery, huge vertical, and seasonal cables.',
    description:
      'Half Dome is a very strenuous Yosemite day (or overnight) via Mist Trail / John Muir Trail to the seasonal cable route. The cables turn the final slab into a secure scramble when up; without a cables permit you cannot proceed legally in season. Carry water, start early, and respect wet rock and afternoon storms.',
    seoMetaDescription:
      'Half Dome trip guide: cable scramble, late May–early Oct, Yosemite cables permit lottery, Valley staging, 3D terrain on PeakAtlas3D.',
    permitNotes:
      'Yosemite Half Dome cables permit (preseason lottery and day-before releases) required when cables are up. Wilderness permits needed for overnight approaches—confirm NPS for the current season.',
  },
  shasta: {
    whyNotable:
      'A lone Cascade volcano over northern California — Avalanche Gulch is the classic snow climb.',
    description:
      'Mount Shasta rises alone above the Shasta Valley. Avalanche Gulch from Bunny Flat is the standard snow/glacier route: early season snow travel, red-fir / Helen Lake camps, and a summit plateau with big weather. A USFS summit pass is required above 10,000 ft. Stage in the town of Mount Shasta and watch spring avalanche conditions.',
    seoMetaDescription:
      'Mt. Shasta trip guide: snow/glacier climb, May–Jul, USFS summit pass above 10,000 ft, Mount Shasta staging, 3D terrain on PeakAtlas3D.',
    permitNotes:
      'USFS summit pass required for travel above 10,000 ft on Mount Shasta. Wilderness and packing-out human-waste rules apply—buy the pass before you climb.',
  },
}

function clipSeo(text, max = 155) {
  const t = String(text).replace(/\s+/g, ' ').trim()
  if (t.length <= max) return t
  return `${t.slice(0, max - 1).trimEnd()}…`
}

const peaks = JSON.parse(readFileSync(peaksPath, 'utf8'))
if (!Array.isArray(peaks)) {
  console.error('peaks.json must be an array')
  process.exit(1)
}

let updated = 0
for (const peak of peaks) {
  const patch = FLAGSHIP[peak.id]
  if (!patch) continue
  for (const [key, value] of Object.entries(patch)) {
    if (key === 'seoMetaDescription') {
      peak[key] = clipSeo(value)
    } else {
      peak[key] = value
    }
  }
  updated += 1
}

writeFileSync(peaksPath, `${JSON.stringify(peaks, null, 2)}\n`)
console.log(`Curated ${updated} flagship peaks → ${peaksPath}`)
