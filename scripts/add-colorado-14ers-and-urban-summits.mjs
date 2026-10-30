/**
 * Add backlog peaks (Priority 2: Mount Tamalpais, Camelback Mountain;
 * Priority 3: Colorado 14ers with verifiable access info and geotagged photos).
 * La Plata, Huron, Belford, Oxford, Missouri, Antero and Shavano were
 * researched but skipped: no 2 geotagged Commons photos within 15 km.
 *
 * Sources (do not invent):
 * - Elevation, prominence, coordinates, first ascent, easiest route: English
 *   Wikipedia peak infoboxes (which cite NGS, Peakbagger and the 2024 NOAA
 *   Colorado re-survey) and Wikidata.
 * - Access, trails, permits: Pike-San Isabel National Forests pages on
 *   fs.usda.gov, California State Parks (parks.ca.gov), City of Phoenix
 *   (phoenix.gov).
 * - Colorado 14er season: Colorado Fourteeners Initiative FAQ (14ers.org/faq):
 *   trails are clear of snow mid-June through early October.
 * Run: node scripts/add-colorado-14ers-and-urban-summits.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  photoMatchesPeak,
  resolveFileTitles,
  slimPhoto,
} from './lib/photo-match.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const peaksPath = join(root, 'src', 'data', 'peaks.json')

const CURATED = {
  tamalpais: [
    "File:View of Mt. Tamalpais' East Peak. The Old Railroad Grade fire road is visible below Ridgecrest Blvd - Bolinas Ridge Road. - panoramio.jpg",
    'File:Tiburon and Mount Tamalpais in 2016.jpg',
  ],
  camelback: [
    'File:Camelback Mountain-1.jpg',
    'File:Phoenix AZ camel back - panoramio.jpg',
  ],
  tabeguache: [
    'File:Tabeguache Peak, Sawatch Range, Chaffee County, Colorado, USA 01.jpg',
    'File:Tabeguache Peak, Sawatch Range, Chaffee County, Colorado, USA 02.jpg',
  ],
  kitcarson: [
    'File:Kit Carson Peak.JPG',
    'File:Kit Carson Mountain - panoramio.jpg',
  ],
  challenger: [
    'File:Challenger Point from Kit Carson.JPG',
    'File:Challenger & Kit Carson.JPG',
  ],
  sanluis: [
    'File:San Luis Peak, San Juan Mountains, Saguache County, Colorado, USA 03.jpg',
    'File:San Luis Peak, San Juan Mountains, Saguache County, Colorado, USA 01.jpg',
  ],
}

function milesBetween(aLat, aLon, bLat, bLon) {
  const toRad = (d) => (d * Math.PI) / 180
  const dLat = toRad(bLat - aLat)
  const dLon = toRad(bLon - aLon)
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLon / 2) ** 2
  return Math.round(3958.8 * 2 * Math.asin(Math.min(1, Math.sqrt(s))))
}

function town(name, region, route, lat, lon, peakLat, peakLon) {
  return {
    name,
    region,
    distanceMiles: milesBetween(peakLat, peakLon, lat, lon),
    route,
    lat,
    lon,
  }
}

const COLORADO_SEASON = 'Jun–Sep'

const SDC_PERMIT_NOTES =
  'No individual summit permit is listed by the Forest Service, and Willow Creek Trailhead (Forest Road 949, near Crestone) has no listed day-use fee. Sangre de Cristo Wilderness rules apply under an order in effect through July 31, 2027: groups of no more than 15 people, no camping or campfires within 100 ft of streams or 300 ft of lakes unless a posted site allows it, and dogs leashed or under verbal control. From Crestone, 2WD vehicles can park about 1.5 miles up the gravel road; 4WD vehicles can go another 0.75 miles to the trailhead.'

const TAM = { lat: 37.9291, lon: -122.5778 }
const CB = { lat: 33.5145, lon: -111.9616 }
const TA = { lat: 38.6255, lon: -106.2509 }
const KC = { lat: 37.9797, lon: -105.6025 }
const CP = { lat: 37.9803, lon: -105.6067 }
const SL = { lat: 37.9868, lon: -106.9313 }

const SALIDA = { lat: 38.5311, lon: -106.0033 }
const PONCHA = { lat: 38.5094, lon: -106.1256 }
const CRESTONE = { lat: 37.9944, lon: -105.6961 }
const MOFFAT = { lat: 37.9989, lon: -105.9056 }
const CREEDE = { lat: 37.8456, lon: -106.9253 }
const GUNNISON = { lat: 38.548, lon: -106.9247 }

const NEW_PEAKS = [
  {
    id: 'tamalpais',
    name: 'Mount Tamalpais',
    lat: TAM.lat,
    lon: TAM.lon,
    elevationFt: 2579,
    prominenceFt: 2456,
    range: 'California Coast Ranges',
    country: 'USA',
    adminRegion: 'California',
    description:
      'Mount Tam, often considered the symbol of Marin County, north of San Francisco. Most of the mountain is protected, including Mount Tamalpais State Park. East Peak (2,571 ft) has a summit parking lot, a 0.75-mile paved loop (Verna Dunshee Trail) and a steep quarter-mile Plank Trail to Gardner Lookout; West Peak, where the radar dome stands, is reached on foot.',
    firstAscent: '1830s (first recorded ascent, Jacob P. Leese)',
    difficulty: 'Easy summit loop; longer trail hikes available',
    difficultyTier: 'day-hike',
    aliases: ['Mount Tam', 'Mt. Tam', 'Mt Tam', 'Mt. Tamalpais'],
    bestSeason: 'Year-round (weather dependent)',
    whyNotable:
      'The Bay Area’s signature peak, with more than 60 miles of trails in the state park and views over San Francisco Bay.',
    seoMetaDescription:
      'Mount Tamalpais trip guide: East Peak summit loop, 60+ miles of trails, year-round access, Mill Valley staging, 3D terrain on PeakAtlas3D.',
    nearestTown: town(
      'Mill Valley',
      'California',
      'Panoramic Hwy',
      37.9061,
      -122.545,
      TAM.lat,
      TAM.lon,
    ),
    nearbyPlaces: [
      town(
        'Stinson Beach',
        'California',
        'CA-1 / Panoramic Hwy',
        37.9006,
        -122.6444,
        TAM.lat,
        TAM.lon,
      ),
      town(
        'San Francisco',
        'California',
        'US-101',
        37.7775,
        -122.4164,
        TAM.lat,
        TAM.lon,
      ),
    ],
    trails: [
      { name: 'Verna Dunshee Trail' },
      { name: 'Plank Trail to Gardner Lookout' },
      { name: 'Railroad Grade fire trail' },
    ],
    permitRequired: false,
    permitStatus: 'not_required',
    permitNotes:
      'No summit permit and no park entrance fee. California State Parks lists day-use hours of 7 a.m. to sunset year-round, and the East Peak, Pantoll and Bootjack lots charge a parking fee (Friends of Mt. Tam lists $8 per vehicle; confirm at parks.ca.gov). Dogs are not allowed on trails or dirt roads in the state park.',
    afterId: 'shasta',
  },
  {
    id: 'camelback',
    name: 'Camelback Mountain',
    lat: CB.lat,
    lon: CB.lon,
    elevationFt: 2706,
    prominenceFt: 1334,
    range: 'Phoenix Mountains',
    country: 'USA',
    adminRegion: 'Arizona',
    description:
      'Phoenix’s landmark hump of Precambrian granite and red sandstone, the highest peak in the Phoenix metro area, with trails maintained by the City of Phoenix. Two summit trails climb about 1,280 feet: Echo Canyon (1.14 miles, with handrails) and Cholla (1.4 miles). The city rates both Extremely Difficult, fully exposed and steep.',
    firstAscent: 'Not recorded',
    difficulty: 'Short, steep, rocky trail hike (rated Extremely Difficult by the City of Phoenix)',
    difficultyTier: 'strenuous-hike',
    aliases: ['Echo Canyon Recreation Area'],
    bestSeason: 'Oct–Apr',
    whyNotable:
      'The highest peak in the Phoenix metro area, a Phoenix Point of Pride with two city-maintained summit trails.',
    seoMetaDescription:
      'Camelback Mountain trip guide: Echo Canyon and Cholla trails, Oct–Apr season, heat-warning closures, Phoenix staging, 3D terrain on PeakAtlas3D.',
    nearestTown: town(
      'Phoenix',
      'Arizona',
      'McDonald Dr / Tatum Blvd',
      33.4483,
      -112.0739,
      CB.lat,
      CB.lon,
    ),
    nearbyPlaces: [
      town(
        'Paradise Valley',
        'Arizona',
        'McDonald Dr',
        33.5311,
        -111.9428,
        CB.lat,
        CB.lon,
      ),
      town(
        'Scottsdale',
        'Arizona',
        'Invergordon Rd',
        33.4931,
        -111.9261,
        CB.lat,
        CB.lon,
      ),
    ],
    trails: [{ name: 'Echo Canyon Trail' }, { name: 'Cholla Trail' }],
    permitRequired: false,
    permitStatus: 'not_required',
    permitNotes:
      'No summit permit listed by the City of Phoenix. On days the National Weather Service issues an Extreme Heat Warning, the Echo Canyon and Cholla trails are restricted from 8 a.m. to 5 p.m. The Echo Canyon lot is typically full from late morning on weekdays and all day on weekends, with the gate closed at capacity; Cholla has limited designated street parking. Dogs are prohibited on all Camelback trails year-round. Trailheads are open sunrise to sunset.',
    afterId: 'emory',
  },
  {
    id: 'tabeguache',
    name: 'Tabeguache Peak',
    lat: TA.lat,
    lon: TA.lon,
    elevationFt: 14157,
    prominenceFt: 455,
    range: 'Sawatch Range',
    country: 'USA',
    adminRegion: 'Colorado',
    description:
      'A southern Sawatch fourteener northwest of Mount Shavano, in the Salida Ranger District. Wikipedia lists the easiest route as a Class 2 hike via Mount Shavano; the Forest Service says to follow the ridge northwest from Shavano’s summit, and warns hikers descending Tabeguache not to drop into McCoy Gulch, where lost hikers have needed rescues.',
    firstAscent: 'Not recorded',
    difficulty: 'Class 2 hike via Mount Shavano',
    difficultyTier: 'strenuous-hike',
    aliases: ['Tabeguache'],
    bestSeason: COLORADO_SEASON,
    whyNotable:
      'A short ridge add-on to Mount Shavano, with a Forest Service warning about the wrong descent into McCoy Gulch.',
    seoMetaDescription:
      'Tabeguache Peak trip guide: Class 2 fourteener via Mount Shavano, Jun–Sep season, McCoy Gulch warning, 3D terrain on PeakAtlas3D.',
    nearestTown: town(
      'Poncha Springs',
      'Colorado',
      'US-50 / CR 250',
      PONCHA.lat,
      PONCHA.lon,
      TA.lat,
      TA.lon,
    ),
    nearbyPlaces: [
      town(
        'Salida',
        'Colorado',
        'US-50',
        SALIDA.lat,
        SALIDA.lon,
        TA.lat,
        TA.lon,
      ),
    ],
    trails: [{ name: 'Via Mount Shavano' }],
    permitRequired: false,
    permitStatus: 'not_required',
    permitNotes:
      'No summit permit is listed by the Forest Service. Special use permits apply to commercial activities and groups of 75 or more. Use the Shavano/Tabeguache trailhead (CR 250 to Forest Road 252). Do not descend into McCoy Gulch from Tabeguache; many disoriented hikers have done so, with rescues, injuries and deaths (Forest Service).',
    afterId: 'princeton',
  },
  {
    id: 'kitcarson',
    name: 'Kit Carson Peak',
    lat: KC.lat,
    lon: KC.lon,
    elevationFt: 14165,
    prominenceFt: 1025,
    range: 'Sangre de Cristo Range',
    country: 'USA',
    adminRegion: 'Colorado',
    description:
      'The main summit of the Kit Carson Mountain massif in the Crestones, 5.2 miles east-southeast of the town of Crestone, in the Sangre de Cristo Wilderness of Rio Grande National Forest. The popular west-side route starts at Willow Creek Trailhead (8,900 ft), climbs Challenger Point first, then crosses the ledge known as Kit Carson Avenue: about 6,250 feet of gain over 14 miles round trip, and Wikipedia lists the easiest route as a Class 3 scramble. The complex terrain has misled climbers.',
    firstAscent: 'Not recorded',
    difficulty: 'Class 3 scramble via Challenger Point',
    difficultyTier: 'scramble',
    aliases: ['Kit Carson Mountain', 'Kit Carson'],
    bestSeason: COLORADO_SEASON,
    whyNotable:
      'One of the Crestones, a cluster of high Sangre de Cristo summits, and the peak behind the exposed ledge route called Kit Carson Avenue.',
    seoMetaDescription:
      'Kit Carson Peak trip guide: Class 3 fourteener via Challenger Point, Jun–Sep, Willow Creek trailhead, Crestone, 3D terrain on PeakAtlas3D.',
    nearestTown: town(
      'Crestone',
      'Colorado',
      'Galena St / FR 949',
      CRESTONE.lat,
      CRESTONE.lon,
      KC.lat,
      KC.lon,
    ),
    nearbyPlaces: [
      town(
        'Moffat',
        'Colorado',
        'CR T / CO-17',
        MOFFAT.lat,
        MOFFAT.lon,
        KC.lat,
        KC.lon,
      ),
    ],
    trails: [{ name: 'Willow Lake Trail #865' }, { name: 'Kit Carson Avenue' }],
    permitRequired: false,
    permitStatus: 'not_required',
    permitNotes: SDC_PERMIT_NOTES,
    afterId: 'crestoneneedle',
  },
  {
    id: 'challenger',
    name: 'Challenger Point',
    lat: CP.lat,
    lon: CP.lon,
    elevationFt: 14085,
    prominenceFt: 301,
    range: 'Sangre de Cristo Range',
    country: 'USA',
    adminRegion: 'Colorado',
    description:
      'A fourteener on the northwest shoulder of Kit Carson Mountain in the Crestones, a subpeak of Kit Carson. It was renamed in memory of the seven astronauts killed in the Space Shuttle Challenger accident on January 28, 1986, and a memorial plaque was placed on the summit in July 1987. Wikipedia lists the North Slope from Willow Creek Trailhead (8,900 ft) as a difficult Class 2 hike.',
    firstAscent: 'Not recorded',
    difficulty: 'Difficult Class 2 hike (North Slope)',
    difficultyTier: 'strenuous-hike',
    aliases: ['Challenger'],
    bestSeason: COLORADO_SEASON,
    whyNotable:
      'Named in memory of the crew of Space Shuttle Challenger, with a memorial plaque on the summit.',
    seoMetaDescription:
      'Challenger Point trip guide: Class 2 fourteener from Willow Creek, Jun–Sep season, Crestone staging, 3D terrain on PeakAtlas3D.',
    nearestTown: town(
      'Crestone',
      'Colorado',
      'Galena St / FR 949',
      CRESTONE.lat,
      CRESTONE.lon,
      CP.lat,
      CP.lon,
    ),
    nearbyPlaces: [
      town(
        'Moffat',
        'Colorado',
        'CR T / CO-17',
        MOFFAT.lat,
        MOFFAT.lon,
        CP.lat,
        CP.lon,
      ),
    ],
    trails: [{ name: 'Willow Lake Trail #865' }, { name: 'North Slope' }],
    permitRequired: false,
    permitStatus: 'not_required',
    permitNotes: SDC_PERMIT_NOTES,
    afterId: 'kitcarson',
  },
  {
    id: 'sanluis',
    name: 'San Luis Peak',
    lat: SL.lat,
    lon: SL.lon,
    elevationFt: 14020,
    prominenceFt: 3113,
    range: 'San Juan Mountains',
    country: 'USA',
    adminRegion: 'Colorado',
    description:
      'The only fourteener in the La Garita Wilderness, in the Gunnison National Forest portion about 10 miles north of Creede. It sits well east of the other San Juan fourteeners and has more of a wilderness setting. Wikipedia describes a relatively straightforward climb with two hiking routes: the Northeast Ridge from Stewart Creek Trailhead (13.5 miles round trip) and the South Ridge from West Willow Creek Trailhead (12.3 miles round trip, almost entirely above treeline).',
    firstAscent: 'Not recorded',
    difficulty: 'Long, straightforward hike',
    difficultyTier: 'strenuous-hike',
    aliases: [],
    bestSeason: COLORADO_SEASON,
    whyNotable:
      'The single fourteener of the La Garita Wilderness, with views over the upper Rio Grande valley and the San Luis Valley.',
    seoMetaDescription:
      'San Luis Peak trip guide: 12–14 mile fourteener hike, Jun–Sep season, La Garita Wilderness, Creede staging, 3D terrain on PeakAtlas3D.',
    nearestTown: town(
      'Creede',
      'Colorado',
      'CO-149',
      CREEDE.lat,
      CREEDE.lon,
      SL.lat,
      SL.lon,
    ),
    nearbyPlaces: [
      town(
        'Gunnison',
        'Colorado',
        'US-50 / CO-114',
        GUNNISON.lat,
        GUNNISON.lon,
        SL.lat,
        SL.lon,
      ),
    ],
    trails: [
      { name: 'Stewart Creek Trail #470' },
      { name: 'South Ridge from West Willow Creek' },
    ],
    permitRequired: false,
    permitStatus: 'not_required',
    permitNotes:
      'No individual summit permit is listed by the Forest Service. La Garita Wilderness rules apply under an order in effect May 14, 2026 through May 14, 2029: groups of no more than 15 people, no camping or campfires within 100 ft of trails and water, no campfires above tree line, and dogs leashed or under direct verbal control. The Stewart Creek trailhead is reached by a long Forest Service road (FSR 794) from the Gunnison side.',
    afterId: 'handies',
  },
]

async function photosFor(peak) {
  const curated = await resolveFileTitles(CURATED[peak.id] || [])
  const out = []
  for (const ph of curated) {
    const m = photoMatchesPeak(peak, ph, { slot: out.length })
    if (!m.ok) {
      console.warn(`  skip curated ${peak.id}: ${m.reason} (${ph.title || ph.url})`)
      continue
    }
    out.push(slimPhoto(ph))
  }
  return out.slice(0, 2)
}

const peaks = JSON.parse(readFileSync(peaksPath, 'utf8'))
const added = []
const failed = []

for (const draft of NEW_PEAKS) {
  if (peaks.some((p) => p.id === draft.id)) {
    console.log(`skip existing ${draft.id}`)
    continue
  }
  console.log(`photos ${draft.id}…`)
  const photos = await photosFor(draft)
  if (photos.length < 2) {
    console.error(`FEWER THAN 2 PHOTOS for ${draft.id} — skipping`)
    failed.push(draft.id)
    continue
  }
  const { afterId, ...rest } = draft
  const peak = {
    ...rest,
    hotels: [],
    food: [],
    trails: rest.trails ?? [],
    photo: photos[0],
    photos,
  }

  let idx = peaks.findIndex((p) => p.id === afterId)
  if (idx < 0) idx = peaks.length - 1
  peaks.splice(idx + 1, 0, peak)
  added.push(draft.id)
  console.log(`  + ${draft.id} (${photos.length} photos)`)
}

writeFileSync(peaksPath, `${JSON.stringify(peaks, null, 2)}\n`)
console.log(
  `\nDone. added=${added.length}: ${added.join(', ') || '(none)'} · failed=${failed.join(', ') || '(none)'} · total=${peaks.length}`,
)
