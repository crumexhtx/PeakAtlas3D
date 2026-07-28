/**
 * Add five Catskill High Peaks with validated summit data and
 * Commons photos that show the mountain face / massif.
 *
 * Run: node scripts/add-catskills-peaks.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const peaksPath = join(root, 'src', 'data', 'peaks.json')
const UA = 'PeakAtlas3D/0.3 (https://peakatlas3d.com; catskills batch)'

/**
 * Elevations/coords from Wikipedia / Catskill 3500 Club listings.
 * Photo File: titles chosen to show forested mountain faces (not maps/diagrams).
 */
const NEW_PEAKS = [
  {
    id: 'slide',
    name: 'Slide Mountain',
    aliases: ['Slide Mtn'],
    lat: 41.9986,
    lon: -74.3864,
    elevationFt: 4180,
    prominenceFt: 3280,
    range: 'Catskills',
    country: 'USA',
    firstAscent: 'unknown',
    difficulty: 'Class 1–2 hike',
    difficultyTier: 'strenuous-hike',
    bestSeason: 'May–Oct',
    whyNotable:
      'Highest peak in the Catskills and the high point of Ulster County and the New York metro area.',
    description:
      'Slide Mountain anchors the Burroughs Range in Catskill Park. The Wittenberg–Cornell–Slide Trail is the classic approach—a long forest hike with ledge views near the top. The true summit is wooded; ledges and openings nearby give the best vistas. Expect mud, roots, and busy weekends in leaf season.',
    seoMetaDescription:
      'Slide Mountain trip guide: Catskills high point, strenuous hike, Phoenicia staging, 3D terrain on PeakAtlas3D.',
    permitRequired: false,
    permitStatus: 'not_required',
    permitNotes:
      'No summit permit. Catskill Forest Preserve rules apply (day-use, camping regs, Leave No Trace). Parking fills early at busy trailheads.',
    nearestTown: {
      name: 'Phoenicia',
      region: 'New York',
      distanceMiles: 12,
      route: 'NY-28 / Oliverea Rd to Slide trailheads',
      lat: 42.006,
      lon: -74.333,
    },
    trails: [
      { name: 'Wittenberg–Cornell–Slide Trail (Burroughs Range)' },
      { name: 'Phoenicia–East Branch / Curtis–Ormsbee approaches' },
    ],
    food: [
      {
        name: 'Brio’s Restaurant',
        category: 'Restaurant',
        note: 'Solid post-hike meal in Phoenicia.',
      },
      {
        name: 'Sweet Sue’s',
        category: 'Café',
        note: 'Breakfast before early Catskills starts.',
      },
      {
        name: 'Phoenicia Diner',
        category: 'Casual eats',
        note: 'Easy refuel on NY-28.',
      },
    ],
    photoFiles: [
      'File:2025-07-21 14 08 27 View west toward the summit of Slide Mountain from the Wittenberg-Cornell-Slide Trail (Burroughs Range Trail) just west of the summit of Cornell Mountain in Shandaken, Ulster County, New York.jpg',
      'File:2025-07-21 14 09 24 View west toward the summit of Slide Mountain from the Wittenberg-Cornell-Slide Trail (Burroughs Range Trail) just west of the summit of Cornell Mountain in Shandaken, Ulster County, New York.jpg',
    ],
  },
  {
    id: 'hunterny',
    name: 'Hunter Mountain',
    aliases: ['Hunter Mtn', 'Hunter Mountain (NY)'],
    lat: 42.1779,
    lon: -74.2304,
    elevationFt: 4040,
    prominenceFt: 2140,
    range: 'Catskills',
    country: 'USA',
    firstAscent: 'unknown',
    difficulty: 'Class 1–2 hike',
    difficultyTier: 'strenuous-hike',
    bestSeason: 'May–Oct',
    whyNotable:
      'Second-highest Catskill peak, topped by a restored fire tower with wide views over the range.',
    description:
      'Hunter Mountain rises above the village of Hunter in Greene County. Hikers reach the fire-tower summit via Becker Hollow, Spruceton, or ski-area connectors. Winter brings deep snow and wind on the open tower; summer weekends are busy. The ski resort occupies the north face—stay on designated hiking routes.',
    seoMetaDescription:
      'Hunter Mountain trip guide: Catskills fire tower, strenuous hike, Hunter NY staging, 3D terrain on PeakAtlas3D.',
    permitRequired: false,
    permitStatus: 'not_required',
    permitNotes:
      'No summit permit. Forest Preserve rules apply; respect ski-area closures and private land boundaries near the resort.',
    nearestTown: {
      name: 'Hunter',
      region: 'New York',
      distanceMiles: 3,
      route: 'NY-214 / Becker Hollow or Spruceton approaches',
      lat: 42.2106,
      lon: -74.2174,
    },
    trails: [
      { name: 'Becker Hollow Trail' },
      { name: 'Spruceton Trail / Hunter Mountain Trail' },
    ],
    food: [
      {
        name: 'Jägerberg Biergarten',
        category: 'Restaurant',
        note: 'Après-hike fare in Hunter village.',
      },
      {
        name: 'Prospect Restaurant',
        category: 'Restaurant',
        note: 'Sit-down meal after tower days.',
      },
      {
        name: 'Hunter Mountain Brewery',
        category: 'Pub / grill',
        note: 'Casual refuel near the ski area.',
      },
    ],
    photoFiles: [
      'File:NY 214 mountainous scene.JPG',
      'File:Southwest Hunter Mountain from Geiger Point, Hunter, NY.jpg',
    ],
  },
  {
    id: 'blackdome',
    name: 'Black Dome',
    aliases: ['Black Dome Mountain'],
    lat: 42.2701,
    lon: -74.1226,
    elevationFt: 3980,
    prominenceFt: 560,
    range: 'Catskills',
    country: 'USA',
    firstAscent: 'unknown',
    difficulty: 'Class 1–2 hike',
    difficultyTier: 'strenuous-hike',
    bestSeason: 'May–Oct',
    whyNotable:
      'Third-highest Catskill peak and the high point of the Blackhead Range above Big Hollow.',
    description:
      'Black Dome sits between Thomas Cole and Blackhead on the Blackhead Range. The Black Dome Range Trail links the trio; most hikers stage from Big Hollow Road. Expect steep forest climbs, muddy cols, and limited summit views through the trees—better vistas open on ledges along the ridge.',
    seoMetaDescription:
      'Black Dome trip guide: Blackhead Range, strenuous hike, Windham / Big Hollow staging, 3D terrain on PeakAtlas3D.',
    permitRequired: false,
    permitStatus: 'not_required',
    permitNotes:
      'No summit permit. Catskill Forest Preserve day-use and camping rules apply; trailhead parking is limited.',
    nearestTown: {
      name: 'Windham',
      region: 'New York',
      distanceMiles: 8,
      route: 'Big Hollow Rd trailheads',
      lat: 42.307,
      lon: -74.252,
    },
    trails: [
      { name: 'Black Dome Range Trail' },
      { name: 'Escarpment Trail connectors via Blackhead' },
    ],
    food: [
      {
        name: 'Windham Local',
        category: 'Restaurant',
        note: 'Solid meal base in Windham.',
      },
      {
        name: 'Cave Mountain Brewery',
        category: 'Pub / grill',
        note: 'Casual post-ridge refuel.',
      },
      {
        name: 'Coffee Pot Deli',
        category: 'Café',
        note: 'Breakfast before Big Hollow starts.',
      },
    ],
    photoFiles: [
      'File:Eastern side of Black Dome.jpg',
      'File:Blackhead Range.jpg',
    ],
  },
  {
    id: 'blackhead',
    name: 'Blackhead',
    aliases: ['Blackhead Mountain'],
    lat: 42.2679,
    lon: -74.1046,
    elevationFt: 3940,
    prominenceFt: 500,
    range: 'Catskills',
    country: 'USA',
    firstAscent: 'unknown',
    difficulty: 'Class 1–2 hike',
    difficultyTier: 'strenuous-hike',
    bestSeason: 'May–Oct',
    whyNotable:
      'Eastern pillar of the Blackhead Range and one of four Catskill 3500 Club required winter peaks.',
    description:
      'Blackhead anchors the east end of the Blackhead Range and sits on the Escarpment / Long Path corridor. Approaches from Big Hollow or the Escarpment are steep; the eastern pitch can hold ice well into spring. Summit views are limited, but lookouts along the ridge open toward the Hudson Valley.',
    seoMetaDescription:
      'Blackhead Mountain trip guide: Escarpment Trail, Catskill 3500 winter peak, Windham staging, 3D terrain on PeakAtlas3D.',
    permitRequired: false,
    permitStatus: 'not_required',
    permitNotes:
      'No summit permit. Forest Preserve rules apply; carry traction in shoulder seasons on the east face.',
    nearestTown: {
      name: 'Windham',
      region: 'New York',
      distanceMiles: 9,
      route: 'Big Hollow Rd / Escarpment Trail approaches',
      lat: 42.307,
      lon: -74.252,
    },
    trails: [
      { name: 'Blackhead Mountain Spur / Escarpment Trail' },
      { name: 'Black Dome Range Trail' },
    ],
    food: [
      {
        name: 'Windham Local',
        category: 'Restaurant',
        note: 'Post-hike meal in Windham.',
      },
      {
        name: 'Albergo Allegria Restaurant',
        category: 'Restaurant',
        note: 'Sit-down option after Escarpment days.',
      },
      {
        name: 'Cave Mountain Brewery',
        category: 'Pub / grill',
        note: 'Casual refuel after Blackhead Range days.',
      },
    ],
    photoFiles: [
      'File:Blackhead Mountain from Black Dome.jpg',
      'File:Blackhead Range from Buck Ridge Lookout in autumn.jpg',
    ],
  },
  {
    id: 'westkill',
    name: 'West Kill Mountain',
    aliases: ['Westkill Mountain', 'West Kill'],
    lat: 42.1679,
    lon: -74.2896,
    elevationFt: 3880,
    prominenceFt: 1220,
    range: 'Catskills',
    country: 'USA',
    firstAscent: 'unknown',
    difficulty: 'Class 1–2 hike',
    difficultyTier: 'strenuous-hike',
    bestSeason: 'May–Oct',
    whyNotable:
      'High point of the Devil’s Path west of Stony Clove—steep, rooty, and classic Catskills ridge hiking.',
    description:
      'West Kill Mountain is the western crown of the Devil’s Path above Spruceton Valley. The Diamond Notch / Devil’s Path approach is steep and often wet, with Buck Ridge Lookout as the signature viewpoint. Expect a full day, scarce water on the ridge, and quieter crowds than Slide or Hunter.',
    seoMetaDescription:
      'West Kill Mountain trip guide: Devil’s Path, strenuous hike, Spruceton staging, 3D terrain on PeakAtlas3D.',
    permitRequired: false,
    permitStatus: 'not_required',
    permitNotes:
      'No summit permit. Forest Preserve rules apply; Spruceton / Diamond Notch parking is limited on peak weekends.',
    nearestTown: {
      name: 'Lexington',
      region: 'New York',
      distanceMiles: 8,
      route: 'Spruceton Rd / Diamond Notch approaches',
      lat: 42.239,
      lon: -74.355,
    },
    trails: [
      { name: 'Devil’s Path (West Kill)' },
      { name: 'Diamond Notch Trail connectors' },
    ],
    food: [
      {
        name: 'Last Chance Cheese & Antiques',
        category: 'Casual eats',
        note: 'Snack stop in Tannersville / Phoenicia corridor.',
      },
      {
        name: 'Zadooria Restaurant',
        category: 'Restaurant',
        note: 'Meal option toward Hunter / Tannersville.',
      },
      {
        name: 'Maggie’s Krooked Café',
        category: 'Café',
        note: 'Breakfast before Spruceton starts.',
      },
    ],
    photoFiles: [
      'File:West Kill and Spruceton Road.jpg',
      'File:Steep, rocky section of Devil\'s Path on West Kill Mountain, Spruceton, NY.jpg',
    ],
  },
]

function stripHtml(s) {
  return String(s ?? '')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .trim()
}

async function resolvePhoto(fileTitle, attempt = 1) {
  const api =
    'https://commons.wikimedia.org/w/api.php?action=query&format=json&titles=' +
    encodeURIComponent(fileTitle) +
    '&prop=imageinfo&iiprop=url|extmetadata|size|mime&iiurlwidth=1280'
  const res = await fetch(api, { headers: { 'User-Agent': UA } })
  if (res.status === 429 && attempt < 5) {
    await new Promise((r) => setTimeout(r, 1500 * attempt))
    return resolvePhoto(fileTitle, attempt + 1)
  }
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  const data = await res.json()
  const page = Object.values(data.query.pages)[0]
  if (page.missing != null) throw new Error(`Missing ${fileTitle}`)
  const info = page.imageinfo?.[0]
  if (!info) throw new Error(`No imageinfo ${fileTitle}`)
  const mime = info.mime ?? ''
  if (!mime.startsWith('image/') || mime.includes('svg')) {
    throw new Error(`Bad mime for ${fileTitle}: ${mime}`)
  }
  if ((info.width ?? 0) < 480 || (info.height ?? 0) < 320) {
    throw new Error(`Too small: ${fileTitle} ${info.width}x${info.height}`)
  }
  const meta = info.extmetadata ?? {}
  const license = stripHtml(
    meta.LicenseShortName?.value || meta.License?.value || 'Unknown',
  )
  const artist = stripHtml(meta.Artist?.value || 'Unknown')
  const credit = artist.length > 80 ? `${artist.slice(0, 77)}…` : artist
  return {
    url: info.thumburl || info.url,
    credit,
    license,
    sourceUrl: info.descriptionurl || info.url,
  }
}

function buildPeak(def, photos) {
  const town = def.nearestTown
  return {
    id: def.id,
    name: def.name,
    ...(def.aliases ? { aliases: def.aliases } : {}),
    lat: def.lat,
    lon: def.lon,
    elevationFt: def.elevationFt,
    prominenceFt: def.prominenceFt,
    range: def.range,
    country: def.country,
    description: def.description,
    firstAscent: def.firstAscent,
    difficulty: def.difficulty,
    difficultyTier: def.difficultyTier,
    bestSeason: def.bestSeason,
    whyNotable: def.whyNotable,
    seoMetaDescription: def.seoMetaDescription,
    permitRequired: def.permitRequired,
    permitStatus: def.permitStatus,
    permitNotes: def.permitNotes,
    nearestTown: { ...town },
    nearbyPlaces: [{ ...town }],
    hotels: [],
    food: def.food,
    trails: def.trails,
    photo: photos[0],
    photos,
  }
}

const peaks = JSON.parse(readFileSync(peaksPath, 'utf8'))
if (!Array.isArray(peaks)) {
  console.error('peaks.json must be an array')
  process.exit(1)
}

const existing = new Set(peaks.map((p) => p.id))
const added = []

for (const def of NEW_PEAKS) {
  if (existing.has(def.id)) {
    console.log(`skip existing ${def.id}`)
    continue
  }
  const photos = []
  for (const file of def.photoFiles) {
    process.stdout.write(`  photo ${def.id} ← ${file.slice(0, 60)}… `)
    try {
      const photo = await resolvePhoto(file)
      photos.push(photo)
      console.log('ok')
    } catch (err) {
      console.log(`FAIL ${err.message}`)
      process.exit(1)
    }
    await new Promise((r) => setTimeout(r, 800))
  }
  peaks.push(buildPeak(def, photos))
  added.push(def.id)
  existing.add(def.id)
}

writeFileSync(peaksPath, `${JSON.stringify(peaks, null, 2)}\n`)
console.log(`Added ${added.length} peaks: ${added.join(', ')}`)
console.log(`Catalog size: ${peaks.length}`)
