/**
 * Add 20 popular missing peaks + Commons photos (catalog quality match).
 * Run: node scripts/add-popular-peaks-batch3.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const peaksPath = join(root, 'src', 'data', 'peaks.json')
const UA = 'PeakAtlas3D/0.3 (https://peakatlas3d.com; popular-peaks batch3)'

const CURATED = {
  vinson: [
    'File:Mount Vinson.jpg',
    'File:Vinson Massif.jpg',
  ],
  kinabalu: [
    'File:Mount Kinabalu.jpg',
    'File:Gunung Kinabalu.jpg',
  ],
  dufourspitze: [
    'File:Dufourspitze.jpg',
    'File:Monte Rosa Dufourspitze.jpg',
  ],
  grandcombin: [
    'File:Grand Combin.jpg',
    'File:Grand Combin from Verbier.jpg',
  ],
  castor: [
    'File:Castor and Pollux Alps.jpg',
    'File:Castor mountain.jpg',
  ],
  split: [
    'File:Split Mountain Sierra.jpg',
    'File:Split Mountain California.jpg',
  ],
  charleston: [
    'File:Charleston Peak.jpg',
    'File:Mount Charleston Nevada.jpg',
  ],
  pfeifferhorn: [
    'File:Pfeifferhorn.jpg',
    'File:Pfeifferhorn Utah.jpg',
  ],
  nebo: [
    'File:Mount Nebo Utah.jpg',
    'File:Mt Nebo Utah.jpg',
  ],
  helvellyn: [
    'File:Helvellyn.jpg',
    'File:Striding Edge Helvellyn.jpg',
  ],
  tryfan: [
    'File:Tryfan.jpg',
    'File:Tryfan from Llyn Ogwen.jpg',
  ],
  cadairidris: [
    'File:Cadair Idris.jpg',
    'File:Cader Idris.jpg',
  ],
  benmacdui: [
    'File:Ben Macdui.jpg',
    'File:Ben Macdui Cairngorms.jpg',
  ],
  lugnaquilla: [
    'File:Lugnaquilla.jpg',
    'File:Lugnaquilla Wicklow.jpg',
  ],
  brandon: [
    'File:Mount Brandon.jpg',
    'File:Brandon Mountain Kerry.jpg',
  ],
  russell: [
    'File:Mount Russell Sierra.jpg',
    'File:Mt Russell California.jpg',
  ],
  langley: [
    'File:Mount Langley.jpg',
    'File:Mt Langley Sierra.jpg',
  ],
  northpalisade: [
    'File:North Palisade.jpg',
    'File:North Palisade Sierra Nevada.jpg',
  ],
  apo: [
    'File:Mount Apo.jpg',
    'File:Mt Apo Philippines.jpg',
  ],
  sill: [
    'File:Mount Sill.jpg',
    'File:Mt Sill Sierra.jpg',
  ],
}

const NEW_PEAKS = [
  {
    id: 'vinson',
    name: 'Vinson Massif',
    lat: -78.5254,
    lon: -85.6171,
    elevationFt: 16050,
    prominenceFt: 16050,
    range: 'Sentinel Range',
    country: 'Antarctica',
    description:
      'Highest mountain in Antarctica — a remote Sentinel Range massif climbed via polar expedition logistics from Union Glacier.',
    firstAscent: '1966',
    difficulty: 'Polar expedition',
    difficultyTier: 'expedition',
    aliases: ['Mount Vinson', 'Vinson'],
    bestSeason: 'Nov–Jan',
    whyNotable:
      'Continent high point of Antarctica and a Seven Summits objective.',
    seoMetaDescription:
      'Explore Vinson Massif on a 3D map — Antarctica’s highest summit, Sentinel Range topography, and polar expedition context.',
    nearestTown: {
      name: 'Union Glacier Camp',
      region: 'Ellsworth Land',
      distanceMiles: 75,
      route: 'Ski / flight logistics',
      lat: -79.76,
      lon: -82.85,
    },
    nearbyPlaces: [],
    permitRequired: true,
    permitStatus: 'required',
    permitNotes:
      'Antarctic expedition access requires national Antarctic program / IAATO-compliant operator logistics and permits. Independent travel is not practical.',
    afterId: 'sidley',
  },
  {
    id: 'kinabalu',
    name: 'Mount Kinabalu',
    lat: 6.075,
    lon: 116.558,
    elevationFt: 13435,
    prominenceFt: 13435,
    range: 'Crocker Range',
    country: 'Malaysia',
    description:
      'Highest peak in Malaysia and Borneo — a granite summit above Kinabalu Park with overnight hut approaches and a pre-dawn summit push.',
    firstAscent: '1851',
    difficulty: 'Strenuous day / overnight',
    difficultyTier: 'strenuous-hike',
    aliases: ['Gunung Kinabalu', 'Kinabalu'],
    bestSeason: 'Feb–Apr',
    whyNotable:
      'Borneo’s high point and one of Southeast Asia’s classic hut-to-summit climbs.',
    seoMetaDescription:
      'Explore Mount Kinabalu on a 3D map — Borneo’s highest summit, Kinabalu Park approaches, elevation stats, and Kota Kinabalu staging.',
    nearestTown: {
      name: 'Kota Kinabalu',
      region: 'Sabah',
      distanceMiles: 55,
      route: 'Jalan Ranau',
      lat: 5.9804,
      lon: 116.0735,
    },
    nearbyPlaces: [
      {
        name: 'Kundasang',
        region: 'Sabah',
        distanceMiles: 12,
        route: 'Park road',
        lat: 5.987,
        lon: 116.575,
      },
    ],
    permitRequired: true,
    permitStatus: 'required',
    permitNotes:
      'Kinabalu Park climbing permits and hut bookings are required; climbs are arranged through licensed park operators. Confirm current Sabah Parks rules.',
    afterId: 'yari',
  },
  {
    id: 'dufourspitze',
    name: 'Dufourspitze',
    lat: 45.9369,
    lon: 7.8668,
    elevationFt: 15203,
    prominenceFt: 7103,
    range: 'Pennine Alps',
    country: 'Switzerland/Italy',
    description:
      'Highest summit of Monte Rosa and Switzerland’s high point — a glaciated alpine climb above Zermatt and the Italian Macugnaga side.',
    firstAscent: '1855',
    difficulty: 'Alpine glacier',
    difficultyTier: 'snow-glacier',
    aliases: ['Monte Rosa', 'Monte Rosa Massif'],
    bestSeason: 'Jul–Sep',
    whyNotable:
      'Highest peak in Switzerland and the Monte Rosa massif’s crowning summit.',
    seoMetaDescription:
      'Explore Dufourspitze on a 3D map — Monte Rosa / Swiss high-point topography, glacier approaches, and Zermatt staging.',
    nearestTown: {
      name: 'Zermatt',
      region: 'Valais',
      distanceMiles: 12,
      route: 'Gornergrat / glacier approach',
      lat: 46.0207,
      lon: 7.7491,
    },
    nearbyPlaces: [
      {
        name: 'Macugnaga',
        region: 'Piedmont',
        distanceMiles: 14,
        route: 'East face approaches',
        lat: 45.968,
        lon: 7.967,
      },
    ],
    permitRequired: false,
    permitStatus: 'not_required',
    permitNotes:
      'No general government climbing permit. Hut bookings, glacier skills, and seasonal route conditions are the practical constraints.',
    afterId: 'matterhorn',
  },
  {
    id: 'grandcombin',
    name: 'Grand Combin',
    lat: 45.9375,
    lon: 7.2994,
    elevationFt: 14154,
    prominenceFt: 4964,
    range: 'Pennine Alps',
    country: 'Switzerland',
    description:
      'Major Valais 4000er west of the Grand Combin massif — glaciated alpine climbing above Bagnes / Verbier country.',
    firstAscent: '1859',
    difficulty: 'Alpine glacier',
    difficultyTier: 'snow-glacier',
    aliases: ['Combin de Grafeneire'],
    bestSeason: 'Jun–Sep',
    whyNotable:
      'One of the great Valais 4000-metre peaks and a classic Swiss glacier objective.',
    seoMetaDescription:
      'Explore Grand Combin on a 3D map — Valais Alps topography, glacier approaches, elevation stats, and Verbier / Bagnes staging.',
    nearestTown: {
      name: 'Verbier',
      region: 'Valais',
      distanceMiles: 14,
      route: 'Val de Bagnes',
      lat: 46.0969,
      lon: 7.2286,
    },
    nearbyPlaces: [],
    permitRequired: false,
    permitStatus: 'not_required',
    permitNotes:
      'No general climbing permit. Hut bookings and glacier travel skills apply on standard routes.',
    afterId: 'dufourspitze',
  },
  {
    id: 'castor',
    name: 'Castor',
    lat: 45.9222,
    lon: 7.7928,
    elevationFt: 13855,
    prominenceFt: 387,
    range: 'Pennine Alps',
    country: 'Switzerland/Italy',
    description:
      'Twin 4000er with Pollux on the Monte Rosa skyline — a popular glaciated traverse peak above Zermatt / Ayas.',
    firstAscent: '1861',
    difficulty: 'Alpine glacier',
    difficultyTier: 'snow-glacier',
    aliases: ['Castore'],
    bestSeason: 'Jul–Sep',
    whyNotable:
      'Classic Monte Rosa 4000er often climbed with neighboring Pollux.',
    seoMetaDescription:
      'Explore Castor on a 3D map — Pennine Alps / Monte Rosa topography, glacier approaches, and Zermatt staging.',
    nearestTown: {
      name: 'Zermatt',
      region: 'Valais',
      distanceMiles: 10,
      route: 'Klein Matterhorn / glacier',
      lat: 46.0207,
      lon: 7.7491,
    },
    nearbyPlaces: [],
    permitRequired: false,
    permitStatus: 'not_required',
    permitNotes:
      'No general climbing permit. Hut and lift logistics plus glacier skills apply.',
    afterId: 'grandcombin',
  },
  {
    id: 'split',
    name: 'Split Mountain',
    lat: 37.0208,
    lon: -118.4223,
    elevationFt: 14058,
    prominenceFt: 1525,
    range: 'Sierra Nevada',
    country: 'USA',
    description:
      'Eastern Sierra 14er with a distinctive cleft summit — approached from the Owens Valley via Red Lake or from the west side wilderness.',
    firstAscent: '1902',
    difficulty: 'Class 2–3 scramble',
    difficultyTier: 'scramble',
    aliases: ['South Palisade'],
    bestSeason: 'Jun–Oct',
    whyNotable:
      'Iconic Eastside 14er silhouette and a classic Sierra scramble above Bishop / Big Pine country.',
    seoMetaDescription:
      'Explore Split Mountain on a 3D map — Sierra Nevada 14er topography, Red Lake approaches, and Owens Valley staging.',
    nearestTown: {
      name: 'Big Pine',
      region: 'California',
      distanceMiles: 18,
      route: 'Glacier Lodge Rd / Red Lake',
      lat: 37.1649,
      lon: -118.2895,
    },
    nearbyPlaces: [
      {
        name: 'Bishop',
        region: 'California',
        distanceMiles: 30,
        route: 'US-395',
        lat: 37.3635,
        lon: -118.3951,
      },
    ],
    permitRequired: true,
    permitStatus: 'required',
    permitNotes:
      'Overnight trips need Inyo National Forest wilderness permits (quotas apply on popular trailheads). Day hikes may still need a wilderness permit depending on the entry zone — confirm current Inyo NF rules.',
    afterId: 'whitney',
  },
  {
    id: 'charleston',
    name: 'Charleston Peak',
    lat: 36.2716,
    lon: -115.6958,
    elevationFt: 11916,
    prominenceFt: 8241,
    range: 'Spring Mountains',
    country: 'USA',
    description:
      'Highest peak in southern Nevada — a sky-island limestone summit above Las Vegas with popular South Loop and North Loop trails in the Spring Mountains.',
    firstAscent: '1844',
    difficulty: 'Strenuous day hike',
    difficultyTier: 'strenuous-hike',
    aliases: ['Mount Charleston', 'Charleston'],
    bestSeason: 'May–Oct',
    whyNotable:
      'Southern Nevada’s high point and a classic Las Vegas day-hike skyline peak.',
    seoMetaDescription:
      'Explore Charleston Peak on a 3D map — Spring Mountains topography, South Loop trail context, elevation, and Las Vegas staging.',
    nearestTown: {
      name: 'Mount Charleston',
      region: 'Nevada',
      distanceMiles: 8,
      route: 'Kyle Canyon Rd',
      lat: 36.2639,
      lon: -115.6411,
    },
    nearbyPlaces: [
      {
        name: 'Las Vegas',
        region: 'Nevada',
        distanceMiles: 35,
        route: 'US-95 / Kyle Canyon',
        lat: 36.1699,
        lon: -115.1398,
      },
    ],
    permitRequired: false,
    permitStatus: 'not_required',
    permitNotes:
      'No special summit permit. Spring Mountains National Recreation Area trail and parking rules apply; overnight camping regulations may apply.',
    afterId: 'wheeler',
  },
  {
    id: 'pfeifferhorn',
    name: 'Pfeifferhorn',
    lat: 40.5336,
    lon: -111.7253,
    elevationFt: 11326,
    prominenceFt: 766,
    range: 'Wasatch Range',
    country: 'USA',
    description:
      'Classic Wasatch pyramid above Little Cottonwood Canyon — a popular scramble via Red Pine Lake with exposed Class 3 summit blocks.',
    firstAscent: 'Unknown',
    difficulty: 'Class 3 scramble',
    difficultyTier: 'scramble',
    aliases: ['Little Matterhorn'],
    bestSeason: 'Jun–Oct',
    whyNotable:
      'One of the Wasatch’s most recognizable alpine summits and a favorite Salt Lake scramble.',
    seoMetaDescription:
      'Explore Pfeifferhorn on a 3D map — Wasatch Range topography, Red Pine Lake approaches, and Little Cottonwood staging.',
    nearestTown: {
      name: 'Alta',
      region: 'Utah',
      distanceMiles: 6,
      route: 'Little Cottonwood Canyon',
      lat: 40.5886,
      lon: -111.6372,
    },
    nearbyPlaces: [
      {
        name: 'Salt Lake City',
        region: 'Utah',
        distanceMiles: 25,
        route: 'I-215 / SR-210',
        lat: 40.7608,
        lon: -111.891,
      },
    ],
    permitRequired: false,
    permitStatus: 'not_required',
    permitNotes:
      'No special summit permit. Uinta-Wasatch-Cache National Forest trailhead parking and wilderness rules apply.',
    afterId: 'timpanogos',
  },
  {
    id: 'nebo',
    name: 'Mount Nebo',
    lat: 39.8219,
    lon: -111.7603,
    elevationFt: 11928,
    prominenceFt: 5486,
    range: 'Wasatch Range',
    country: 'USA',
    description:
      'Highest peak in the Wasatch Range — a long Class 2 ridge hike above Nephi / Payson with broad Utah Valley views.',
    firstAscent: 'Unknown',
    difficulty: 'Class 2 hike',
    difficultyTier: 'strenuous-hike',
    aliases: ['Mt. Nebo'],
    bestSeason: 'Jun–Oct',
    whyNotable:
      'Wasatch Range high point and a classic central Utah prominence peak.',
    seoMetaDescription:
      'Explore Mount Nebo on a 3D map — Wasatch high-point topography, Nebo Bench approaches, and Nephi staging.',
    nearestTown: {
      name: 'Nephi',
      region: 'Utah',
      distanceMiles: 12,
      route: 'Nebo Scenic Loop',
      lat: 39.7102,
      lon: -111.836,
    },
    nearbyPlaces: [],
    permitRequired: false,
    permitStatus: 'not_required',
    permitNotes:
      'No special summit permit. Uinta-Wasatch-Cache National Forest road and trail status apply on the Nebo Scenic Loop approaches.',
    afterId: 'pfeifferhorn',
  },
  {
    id: 'helvellyn',
    name: 'Helvellyn',
    lat: 54.5269,
    lon: -3.0175,
    elevationFt: 3117,
    prominenceFt: 2339,
    range: 'Lake District',
    country: 'United Kingdom',
    description:
      'Third-highest mountain in England — famous for Striding Edge and Swirral Edge approaches above Glenridding and Thirlmere.',
    firstAscent: 'Unknown',
    difficulty: 'Class 2–3 scramble',
    difficultyTier: 'scramble',
    aliases: [],
    bestSeason: 'May–Sep',
    whyNotable:
      'Iconic Lake District ridge peak and one of England’s most popular mountain days.',
    seoMetaDescription:
      'Explore Helvellyn on a 3D map — Lake District topography, Striding Edge approaches, elevation stats, and Glenridding staging.',
    nearestTown: {
      name: 'Glenridding',
      region: 'Cumbria',
      distanceMiles: 3,
      route: 'Striding Edge / Greenside',
      lat: 54.545,
      lon: -2.95,
    },
    nearbyPlaces: [
      {
        name: 'Keswick',
        region: 'Cumbria',
        distanceMiles: 10,
        route: 'A66 / A591',
        lat: 54.601,
        lon: -3.137,
      },
    ],
    permitRequired: false,
    permitStatus: 'not_required',
    permitNotes:
      'No special summit permit. Lake District National Park access rules and Leave No Trace guidance apply; winter conditions can make Striding Edge serious.',
    afterId: 'scafellpike',
  },
  {
    id: 'tryfan',
    name: 'Tryfan',
    lat: 53.1147,
    lon: -4.0,
    elevationFt: 3010,
    prominenceFt: 1332,
    range: 'Snowdonia',
    country: 'United Kingdom',
    description:
      'Sharp Snowdonia ridge peak above Ogwen — famous for the North Ridge scramble and the Adam and Eve summit stones.',
    firstAscent: 'Unknown',
    difficulty: 'Class 3 scramble',
    difficultyTier: 'scramble',
    aliases: [],
    bestSeason: 'May–Sep',
    whyNotable:
      'One of Wales’s classic scrambles and a signature Ogwen Valley skyline peak.',
    seoMetaDescription:
      'Explore Tryfan on a 3D map — Snowdonia topography, North Ridge scramble context, and Ogwen staging.',
    nearestTown: {
      name: 'Bethesda',
      region: 'Gwynedd',
      distanceMiles: 6,
      route: 'A5 / Ogwen',
      lat: 53.179,
      lon: -4.06,
    },
    nearbyPlaces: [
      {
        name: 'Capel Curig',
        region: 'Conwy',
        distanceMiles: 5,
        route: 'A5',
        lat: 53.105,
        lon: -3.913,
      },
    ],
    permitRequired: false,
    permitStatus: 'not_required',
    permitNotes:
      'No special summit permit. Eryri / Snowdonia National Park access rules apply; the North Ridge is a real scramble in all seasons.',
    afterId: 'snowdon',
  },
  {
    id: 'cadairidris',
    name: 'Cadair Idris',
    lat: 52.6994,
    lon: -3.9086,
    elevationFt: 2930,
    prominenceFt: 1995,
    range: 'Snowdonia',
    country: 'United Kingdom',
    description:
      'Southern Snowdonia massif above Dolgellau — popular Minffordd and Pony Path routes to Penygadair with glacial cwms and big coastal views.',
    firstAscent: 'Unknown',
    difficulty: 'Strenuous day hike',
    difficultyTier: 'strenuous-hike',
    aliases: ['Cader Idris', 'Penygadair'],
    bestSeason: 'May–Sep',
    whyNotable:
      'Southern Snowdonia’s signature summit and one of Wales’s most popular mountain days outside Yr Wyddfa.',
    seoMetaDescription:
      'Explore Cadair Idris on a 3D map — Snowdonia topography, Minffordd Path approaches, and Dolgellau staging.',
    nearestTown: {
      name: 'Dolgellau',
      region: 'Gwynedd',
      distanceMiles: 4,
      route: 'Minffordd / Pony Path',
      lat: 52.742,
      lon: -3.886,
    },
    nearbyPlaces: [],
    permitRequired: false,
    permitStatus: 'not_required',
    permitNotes:
      'No special summit permit. Eryri / Snowdonia National Park parking and path rules apply on popular approaches.',
    afterId: 'tryfan',
  },
  {
    id: 'benmacdui',
    name: 'Ben Macdui',
    lat: 57.0704,
    lon: -3.6691,
    elevationFt: 4295,
    prominenceFt: 3117,
    range: 'Cairngorms',
    country: 'United Kingdom',
    description:
      'Second-highest mountain in the UK — a high Cairngorm plateau summit above Aviemore with long approaches and serious winter navigation.',
    firstAscent: 'Unknown',
    difficulty: 'Strenuous day hike',
    difficultyTier: 'strenuous-hike',
    aliases: ['Beinn Macduibh'],
    bestSeason: 'May–Sep',
    whyNotable:
      'Scotland’s #2 summit and the high point of the Cairngorm plateau.',
    seoMetaDescription:
      'Explore Ben Macdui on a 3D map — Cairngorms topography, plateau approaches, elevation stats, and Aviemore staging.',
    nearestTown: {
      name: 'Aviemore',
      region: 'Highland',
      distanceMiles: 12,
      route: 'Cairngorm Mountain / Lairig Ghru',
      lat: 57.194,
      lon: -3.828,
    },
    nearbyPlaces: [],
    permitRequired: false,
    permitStatus: 'not_required',
    permitNotes:
      'No special summit permit. Cairngorms National Park access rights apply; winter whiteouts make navigation committing.',
    afterId: 'bennevis',
  },
  {
    id: 'lugnaquilla',
    name: 'Lugnaquilla',
    lat: 52.9658,
    lon: -6.4631,
    elevationFt: 3035,
    prominenceFt: 2749,
    range: 'Wicklow Mountains',
    country: 'Ireland',
    description:
      'Highest peak in Wicklow and Leinster — a broad plateau summit approached from Glenmalure or the Baravore / Fenton’s side.',
    firstAscent: 'Unknown',
    difficulty: 'Strenuous day hike',
    difficultyTier: 'strenuous-hike',
    aliases: ['Log na Coille'],
    bestSeason: 'Apr–Oct',
    whyNotable:
      'Leinster high point and the classic Wicklow Mountains summit day from Dublin.',
    seoMetaDescription:
      'Explore Lugnaquilla on a 3D map — Wicklow Mountains topography, Glenmalure approaches, and elevation stats near Dublin.',
    nearestTown: {
      name: 'Glendalough',
      region: 'Wicklow',
      distanceMiles: 10,
      route: 'Glenmalure',
      lat: 53.011,
      lon: -6.327,
    },
    nearbyPlaces: [],
    permitRequired: false,
    permitStatus: 'not_required',
    permitNotes:
      'No special summit permit. Wicklow Mountains National Park / Coillte access and Leave No Trace guidance apply; some approaches cross military range land — check notices.',
    afterId: 'carrauntoohil',
  },
  {
    id: 'brandon',
    name: 'Mount Brandon',
    lat: 52.2353,
    lon: -10.2542,
    elevationFt: 3123,
    prominenceFt: 3123,
    range: 'Dingle Peninsula',
    country: 'Ireland',
    description:
      'Second-highest peak in Ireland — a coastal massif above the Dingle Peninsula with Pilgrim’s Path and Faha Ridge approaches.',
    firstAscent: 'Unknown',
    difficulty: 'Strenuous day hike',
    difficultyTier: 'strenuous-hike',
    aliases: ['Cnoc Bréanainn', 'Brandon Mountain'],
    bestSeason: 'Apr–Oct',
    whyNotable:
      'Ireland’s #2 summit and a dramatic Atlantic pilgrimage mountain on the Dingle Peninsula.',
    seoMetaDescription:
      'Explore Mount Brandon on a 3D map — Dingle Peninsula topography, Pilgrim’s Path approaches, and elevation stats in County Kerry.',
    nearestTown: {
      name: 'Dingle',
      region: 'Kerry',
      distanceMiles: 8,
      route: 'R559 / Cloghane',
      lat: 52.1409,
      lon: -10.268,
    },
    nearbyPlaces: [
      {
        name: 'Cloghane',
        region: 'Kerry',
        distanceMiles: 3,
        route: 'Pilgrim’s Route',
        lat: 52.229,
        lon: -10.168,
      },
    ],
    permitRequired: false,
    permitStatus: 'not_required',
    permitNotes:
      'No special summit permit. Respect private farmland access customs on the Dingle Peninsula and check weather — Atlantic conditions change fast.',
    afterId: 'lugnaquilla',
  },
  {
    id: 'russell',
    name: 'Mount Russell',
    lat: 36.5919,
    lon: -118.2928,
    elevationFt: 14088,
    prominenceFt: 1086,
    range: 'Sierra Nevada',
    country: 'USA',
    description:
      'Neighboring Whitney 14er with a classic East Ridge scramble — approached from Whitney Portal / the Mountaineer’s Route corridor.',
    firstAscent: '1926',
    difficulty: 'Class 3 scramble',
    difficultyTier: 'scramble',
    aliases: ['Mt. Russell'],
    bestSeason: 'Jun–Oct',
    whyNotable:
      'One of the Sierra’s finest Class 3 ridges and a classic companion peak to Mount Whitney.',
    seoMetaDescription:
      'Explore Mount Russell on a 3D map — Sierra Nevada 14er topography, East Ridge context, and Lone Pine / Whitney Portal staging.',
    nearestTown: {
      name: 'Lone Pine',
      region: 'California',
      distanceMiles: 13,
      route: 'Whitney Portal Rd',
      lat: 36.606,
      lon: -118.063,
    },
    nearbyPlaces: [],
    permitRequired: true,
    permitStatus: 'required',
    permitNotes:
      'Inyo National Forest wilderness permits with Whitney Zone quotas apply for overnight and many day entries via Whitney Portal. Confirm current Inyo NF / Recreation.gov rules.',
    afterId: 'split',
  },
  {
    id: 'langley',
    name: 'Mount Langley',
    lat: 36.5233,
    lon: -118.2392,
    elevationFt: 14026,
    prominenceFt: 1184,
    range: 'Sierra Nevada',
    country: 'USA',
    description:
      'Southernmost Sierra 14er — a Class 1–2 hike from Cottonwood Lakes / New Army Pass with big views of the Whitney Group.',
    firstAscent: '1871',
    difficulty: 'Class 1–2 hike',
    difficultyTier: 'day-hike',
    aliases: ['Mt. Langley'],
    bestSeason: 'Jun–Oct',
    whyNotable:
      'Often called the easiest Sierra 14er and the southern end of California’s fourteeners.',
    seoMetaDescription:
      'Explore Mount Langley on a 3D map — southern Sierra 14er topography, Cottonwood Lakes approaches, and Lone Pine staging.',
    nearestTown: {
      name: 'Lone Pine',
      region: 'California',
      distanceMiles: 18,
      route: 'Horseshoe Meadow / Cottonwood',
      lat: 36.606,
      lon: -118.063,
    },
    nearbyPlaces: [],
    permitRequired: true,
    permitStatus: 'required',
    permitNotes:
      'Overnight trips need Inyo National Forest wilderness permits (Cottonwood Lakes / Cottonwood Pass quotas). Confirm current Inyo NF day-use and overnight rules.',
    afterId: 'russell',
  },
  {
    id: 'northpalisade',
    name: 'North Palisade',
    lat: 37.0942,
    lon: -118.5144,
    elevationFt: 14242,
    prominenceFt: 2894,
    range: 'Sierra Nevada',
    country: 'USA',
    description:
      'Highest of the Palisades — a technical Sierra 14er above the Palisade Glacier with classic routes from Bishop and Big Pine.',
    firstAscent: '1903',
    difficulty: 'Technical rock',
    difficultyTier: 'alpine-technical',
    aliases: ['North Pal'],
    bestSeason: 'Jun–Sep',
    whyNotable:
      'Crown of the Palisades and one of the Sierra Nevada’s great technical 14ers.',
    seoMetaDescription:
      'Explore North Palisade on a 3D map — Sierra Palisades topography, glacier approaches, and Bishop / Big Pine staging.',
    nearestTown: {
      name: 'Big Pine',
      region: 'California',
      distanceMiles: 16,
      route: 'Glacier Lodge Rd',
      lat: 37.1649,
      lon: -118.2895,
    },
    nearbyPlaces: [
      {
        name: 'Bishop',
        region: 'California',
        distanceMiles: 25,
        route: 'US-395',
        lat: 37.3635,
        lon: -118.3951,
      },
    ],
    permitRequired: true,
    permitStatus: 'required',
    permitNotes:
      'Inyo National Forest wilderness permits are required for overnight approaches (quotas on Bishop Pass / South Lake and related trailheads). Confirm current Inyo NF rules.',
    afterId: 'langley',
  },
  {
    id: 'sill',
    name: 'Mount Sill',
    lat: 37.0961,
    lon: -118.5025,
    elevationFt: 14153,
    prominenceFt: 353,
    range: 'Sierra Nevada',
    country: 'USA',
    description:
      'Palisades 14er famous for the Swiss Arete — a classic alpine rock climb above the Palisade Glacier near North Palisade.',
    firstAscent: '1903',
    difficulty: 'Technical rock',
    difficultyTier: 'alpine-technical',
    aliases: ['Mt. Sill'],
    bestSeason: 'Jun–Sep',
    whyNotable:
      'Home of the Swiss Arete — one of the Sierra’s most celebrated alpine rock routes.',
    seoMetaDescription:
      'Explore Mount Sill on a 3D map — Sierra Palisades topography, Swiss Arete context, and Big Pine staging.',
    nearestTown: {
      name: 'Big Pine',
      region: 'California',
      distanceMiles: 16,
      route: 'Glacier Lodge Rd',
      lat: 37.1649,
      lon: -118.2895,
    },
    nearbyPlaces: [],
    permitRequired: true,
    permitStatus: 'required',
    permitNotes:
      'Inyo National Forest wilderness permits required for overnight Palisades approaches. Confirm current Inyo NF quota and trailhead rules.',
    afterId: 'northpalisade',
  },
  {
    id: 'apo',
    name: 'Mount Apo',
    lat: 6.9875,
    lon: 125.2717,
    elevationFt: 9692,
    prominenceFt: 9692,
    range: 'Apo–Talomo',
    country: 'Philippines',
    description:
      'Highest mountain in the Philippines — a forested volcanic massif above Davao / Cotabato with multi-day trek permits through Mount Apo Natural Park.',
    firstAscent: '1880',
    difficulty: 'Strenuous day / overnight',
    difficultyTier: 'strenuous-hike',
    aliases: ['Apo'],
    bestSeason: 'Mar–May',
    whyNotable:
      'Philippines high point and Mindanao’s iconic volcanic trek.',
    seoMetaDescription:
      'Explore Mount Apo on a 3D map — Philippines’ highest summit, Mount Apo Natural Park approaches, and Davao staging.',
    nearestTown: {
      name: 'Davao City',
      region: 'Davao del Sur',
      distanceMiles: 25,
      route: 'Park trek trailheads',
      lat: 7.1907,
      lon: 125.4553,
    },
    nearbyPlaces: [],
    permitRequired: true,
    permitStatus: 'required',
    permitNotes:
      'Mount Apo Natural Park climbing / trekking permits are required and typically arranged through accredited local operators or park offices. Confirm current DENR / park rules.',
    afterId: 'kinabalu',
  },
]

async function fetchJson(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
  })
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  return res.json()
}

function slimPhoto(ph) {
  return {
    url: ph.url,
    credit: ph.credit,
    license: ph.license,
    sourceUrl: ph.sourceUrl,
  }
}

function pageToPhoto(page) {
  if (page.missing != null || page.invalid != null) return null
  const info = page.imageinfo?.[0]
  if (!info) return null
  const mime = info.mime ?? ''
  if (!mime.startsWith('image/') || mime.includes('svg')) return null
  if ((info.width ?? 0) < 640 || (info.height ?? 0) < 400) return null
  const meta = info.extmetadata ?? {}
  const license = String(
    meta.LicenseShortName?.value || meta.License?.value || 'Unknown',
  ).replace(/<[^>]+>/g, '')
  const artist = String(meta.Artist?.value || 'Unknown').replace(/<[^>]+>/g, '')
  return {
    url: info.thumburl || info.url,
    credit: artist.length > 80 ? `${artist.slice(0, 77)}…` : artist,
    license,
    sourceUrl: info.descriptionurl || info.url,
    title: page.title || '',
  }
}

async function resolveFileTitles(titles) {
  if (!titles.length) return []
  const api =
    `https://commons.wikimedia.org/w/api.php?action=query&format=json` +
    `&titles=${titles.map(encodeURIComponent).join('|')}` +
    `&prop=imageinfo&iiprop=url|extmetadata|size|mime&iiurlwidth=1280`
  const data = await fetchJson(api)
  const byTitle = new Map()
  for (const page of Object.values(data?.query?.pages ?? {})) {
    const photo = pageToPhoto(page)
    if (photo) byTitle.set((page.title || '').toLowerCase(), photo)
  }
  return titles
    .map((t) => byTitle.get(t.toLowerCase()))
    .filter(Boolean)
    .map(slimPhoto)
}

async function searchPhotos(query, limit = 10) {
  const api =
    `https://commons.wikimedia.org/w/api.php?action=query&format=json` +
    `&generator=search&gsrnamespace=6&gsrsearch=${encodeURIComponent(query)}` +
    `&gsrlimit=${limit}&prop=imageinfo&iiprop=url|extmetadata|size|mime&iiurlwidth=1280`
  const data = await fetchJson(api)
  return Object.values(data?.query?.pages ?? {})
    .map(pageToPhoto)
    .filter(Boolean)
    .map(slimPhoto)
}

function matchesName(peak, photo) {
  const hay =
    `${photo.url} ${photo.sourceUrl} ${photo.title || ''} ${photo.credit}`.toLowerCase()
  const tokens = [peak.name, peak.id, ...(peak.aliases || [])]
    .join(' ')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(
      (t) =>
        t.length >= 4 &&
        !['mount', 'peak', 'mountain', 'massif'].includes(t),
    )
  return tokens.some((t) => hay.includes(t))
}

async function photosFor(peak) {
  const curated = await resolveFileTitles(CURATED[peak.id] || [])
  const out = [...curated]
  if (out.length >= 2) return out.slice(0, 2)

  const queries = [
    `${peak.name} mountain`,
    `${peak.name} ${peak.range}`,
    `${peak.name}`,
    ...(peak.aliases || []).map((a) => `${a} mountain`),
  ]
  for (const q of queries) {
    if (out.length >= 2) break
    try {
      const found = await searchPhotos(q)
      for (const ph of found) {
        if (out.length >= 2) break
        if (!matchesName(peak, ph)) continue
        if (out.some((x) => x.url === ph.url)) continue
        out.push(ph)
      }
    } catch (err) {
      console.warn(`search failed ${peak.id}:`, err.message)
    }
    await new Promise((r) => setTimeout(r, 300))
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
  if (photos.length < 1) {
    console.error(`NO PHOTOS for ${draft.id} — skipping`)
    failed.push(draft.id)
    continue
  }
  if (photos.length < 2) {
    console.warn(`  only ${photos.length} photo(s) for ${draft.id}`)
  }
  const { afterId, ...rest } = draft
  const peak = {
    ...rest,
    hotels: [],
    food: [
      {
        name: `${draft.nearestTown.name} cafés`,
        category: 'Restaurant',
        note: `Easy refuel in ${draft.nearestTown.name} after the summit.`,
      },
    ],
    trails: [],
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
