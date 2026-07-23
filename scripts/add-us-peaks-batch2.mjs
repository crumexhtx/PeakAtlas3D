/**
 * One-shot: add 20 popular missing US peaks + Commons photos.
 * Run: node scripts/add-us-peaks-batch2.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const peaksPath = join(root, 'src', 'data', 'peaks.json')
const UA = 'PeakAtlas3D/0.2 (https://peakatlas3d.com; catalog enrich)'

const CURATED = {
  glacierpeak: [
    'File:Glacier Peak from Image Lake.jpg',
    'File:Glacier Peak Washington.jpg',
  ],
  shuksan: [
    'File:Mount Shuksan.jpg',
    'File:Mount Shuksan reflected in Picture Lake.jpg',
  ],
  jeffersonor: [
    'File:Mount Jefferson Oregon.jpg',
    'File:Mt Jefferson from Olallie Butte.jpg',
  ],
  brokentop: [
    'File:Broken Top Oregon.jpg',
    'File:Broken Top from Sparks Lake.jpg',
  ],
  lassen: [
    'File:Lassen Peak.jpg',
    'File:Lassen Peak from Lake Helen.jpg',
  ],
  sanjacinto: [
    'File:San Jacinto Peak.jpg',
    'File:Mount San Jacinto.jpg',
  ],
  sangorgonio: [
    'File:San Gorgonio Mountain.jpg',
    'File:San Gorgonio from Vivian Creek.jpg',
  ],
  baldy: [
    'File:Mount San Antonio.jpg',
    'File:Mt Baldy California.jpg',
  ],
  tallac: [
    'File:Mount Tallac.jpg',
    'File:Mt Tallac from Lake Tahoe.jpg',
  ],
  sneffels: [
    'File:Mount Sneffels.jpg',
    'File:Mt Sneffels Colorado.jpg',
  ],
  uncompahgre: [
    'File:Uncompahgre Peak.jpg',
    'File:Uncompahgre Peak Colorado.jpg',
  ],
  harvard: [
    'File:Mount Harvard Colorado.jpg',
    'File:Mt Harvard from Missouri Gulch.jpg',
  ],
  sherman: [
    'File:Mount Sherman.jpg',
    'File:Mt Sherman Colorado.jpg',
  ],
  bluesky: [
    'File:Mount Evans Colorado.jpg',
    'File:Mount Blue Sky.jpg',
  ],
  wheelernm: [
    'File:Wheeler Peak New Mexico.jpg',
    'File:Wheeler Peak from Williams Lake.jpg',
  ],
  sandia: [
    'File:Sandia Mountains.jpg',
    'File:Sandia Crest New Mexico.jpg',
  ],
  leconte: [
    'File:Mount LeConte.jpg',
    'File:Mt LeConte Great Smoky Mountains.jpg',
  ],
  oldrag: [
    'File:Old Rag Mountain.jpg',
    'File:Old Rag summit Virginia.jpg',
  ],
  mansfield: [
    'File:Mount Mansfield.jpg',
    'File:Mt Mansfield Vermont.jpg',
  ],
  cadillac: [
    'File:Cadillac Mountain.jpg',
    'File:Cadillac Mountain Acadia.jpg',
  ],
}

const NEW_PEAKS = [
  {
    id: 'glacierpeak',
    name: 'Glacier Peak',
    lat: 48.1122,
    lon: -121.1132,
    elevationFt: 10541,
    prominenceFt: 7498,
    range: 'Cascade Range',
    country: 'USA',
    description:
      'Washington’s remote Cascade volcano east of Darrington — a long wilderness approach to glaciers and a classic Pacific Northwest mountaineering objective.',
    firstAscent: '1898',
    difficulty: 'Glacier climb / multi-day',
    aliases: ['Dakobed'],
    bestSeason: 'Jul–Sep',
    whyNotable:
      'One of the major Cascade stratovolcanoes and Washington’s most remote high volcano.',
    seoMetaDescription:
      'Explore Glacier Peak on a 3D map — remote Cascade volcano topography, elevation stats, and North Cascades wilderness approaches.',
    nearestTown: {
      name: 'Darrington',
      region: 'Washington',
      distanceMiles: 28,
      route: 'Mountain Loop / Suiattle',
      lat: 48.2529,
      lon: -121.604,
    },
    nearbyPlaces: [
      {
        name: 'Darrington',
        region: 'Washington',
        distanceMiles: 28,
        route: 'Mountain Loop Hwy',
        lat: 48.2529,
        lon: -121.604,
      },
    ],
    afterId: 'baker',
  },
  {
    id: 'shuksan',
    name: 'Mt. Shuksan',
    lat: 48.8311,
    lon: -121.6031,
    elevationFt: 9131,
    prominenceFt: 4411,
    range: 'North Cascades',
    country: 'USA',
    description:
      'Iconic North Cascades pyramid above Artist Point and Picture Lake — a photogenic alpine peak and classic mountaineering objective near Mt. Baker.',
    firstAscent: '1906',
    difficulty: 'Technical alpine',
    aliases: ['Mount Shuksan'],
    bestSeason: 'Jul–Sep',
    whyNotable:
      'One of the most photographed mountains in the Cascades; classic alpine climbing above Baker Lake country.',
    seoMetaDescription:
      'Explore Mt. Shuksan on a 3D map — North Cascades alpine topography, Artist Point views, elevation stats, and Mt. Baker approaches.',
    nearestTown: {
      name: 'Glacier',
      region: 'Washington',
      distanceMiles: 22,
      route: 'SR-542',
      lat: 48.8884,
      lon: -121.9338,
    },
    nearbyPlaces: [
      {
        name: 'Glacier',
        region: 'Washington',
        distanceMiles: 22,
        route: 'SR-542',
        lat: 48.8884,
        lon: -121.9338,
      },
    ],
    afterId: 'glacierpeak',
  },
  {
    id: 'jeffersonor',
    name: 'Mt. Jefferson',
    lat: 44.6743,
    lon: -121.7996,
    elevationFt: 10497,
    prominenceFt: 5777,
    range: 'Cascade Range',
    country: 'USA',
    description:
      'Oregon’s second-highest Cascade volcano — a remote, technical summit north of Sisters with long approaches through Jefferson Wilderness.',
    firstAscent: '1888',
    difficulty: 'Technical alpine / glacier',
    aliases: ['Mount Jefferson'],
    bestSeason: 'Jul–Sep',
    whyNotable:
      'Oregon’s #2 Cascade summit and a committing wilderness climb north of the Three Sisters.',
    seoMetaDescription:
      'Explore Mt. Jefferson (Oregon) on a 3D map — Cascade volcano topography, elevation stats, and Jefferson Wilderness approaches.',
    nearestTown: {
      name: 'Sisters',
      region: 'Oregon',
      distanceMiles: 35,
      route: 'US-20 / FR roads',
      lat: 44.2909,
      lon: -121.5492,
    },
    nearbyPlaces: [
      {
        name: 'Sisters',
        region: 'Oregon',
        distanceMiles: 35,
        route: 'US-20',
        lat: 44.2909,
        lon: -121.5492,
      },
    ],
    afterId: 'southsister',
  },
  {
    id: 'brokentop',
    name: 'Broken Top',
    lat: 44.0829,
    lon: -121.6945,
    elevationFt: 9175,
    prominenceFt: 2175,
    range: 'Cascade Range',
    country: 'USA',
    description:
      'Jagged Cascade volcano beside the Three Sisters — popular Green Lakes and No Name Lake approaches with a scramble summit in Deschutes National Forest.',
    firstAscent: '1910',
    difficulty: 'Class 3 scramble',
    aliases: [],
    bestSeason: 'Jul–Sep',
    whyNotable:
      'Signature Central Oregon volcano and a favorite scramble above the Green Lakes basin.',
    seoMetaDescription:
      'Explore Broken Top on a 3D map — Central Oregon Cascades topography, Green Lakes approaches, and elevation stats near Sisters.',
    nearestTown: {
      name: 'Bend',
      region: 'Oregon',
      distanceMiles: 28,
      route: 'Cascade Lakes Hwy',
      lat: 44.0582,
      lon: -121.3153,
    },
    nearbyPlaces: [
      {
        name: 'Bend',
        region: 'Oregon',
        distanceMiles: 28,
        route: 'Cascade Lakes Hwy',
        lat: 44.0582,
        lon: -121.3153,
      },
      {
        name: 'Sisters',
        region: 'Oregon',
        distanceMiles: 30,
        route: 'US-20',
        lat: 44.2909,
        lon: -121.5492,
      },
    ],
    afterId: 'jeffersonor',
  },
  {
    id: 'lassen',
    name: 'Lassen Peak',
    lat: 40.4882,
    lon: -121.505,
    elevationFt: 10457,
    prominenceFt: 5229,
    range: 'Cascade Range',
    country: 'USA',
    description:
      'Southernmost Cascade volcano and the high point of Lassen Volcanic National Park — a popular summer trail to a cratered summit above Lake Helen.',
    firstAscent: '1851',
    difficulty: 'Strenuous day hike',
    aliases: ['Mount Lassen'],
    bestSeason: 'Jul–Sep',
    whyNotable:
      'California’s southern Cascade volcano and a classic national-park summit hike.',
    seoMetaDescription:
      'Explore Lassen Peak on a 3D map — Lassen Volcanic National Park topography, crater summit trail, elevation, and Mineral approaches.',
    nearestTown: {
      name: 'Mineral',
      region: 'California',
      distanceMiles: 18,
      route: 'CA-89',
      lat: 40.3482,
      lon: -121.595,
    },
    nearbyPlaces: [
      {
        name: 'Mineral',
        region: 'California',
        distanceMiles: 18,
        route: 'CA-89',
        lat: 40.3482,
        lon: -121.595,
      },
    ],
    afterId: 'shasta',
  },
  {
    id: 'sanjacinto',
    name: 'San Jacinto Peak',
    lat: 33.8147,
    lon: -116.6794,
    elevationFt: 10834,
    prominenceFt: 8319,
    range: 'San Jacinto Mountains',
    country: 'USA',
    description:
      'Southern California sky-island summit above Palm Springs — tram-accessible wilderness with steep trails from Long Valley to a granite high point.',
    firstAscent: '1874',
    difficulty: 'Strenuous day hike',
    aliases: ['Mount San Jacinto', 'Mt. San Jacinto'],
    bestSeason: 'May–Oct',
    whyNotable:
      'One of Southern California’s most prominent peaks and a classic Palm Springs tram-to-summit hike.',
    seoMetaDescription:
      'Explore San Jacinto Peak on a 3D map — Southern California sky-island topography, tram approaches, elevation stats, and Palm Springs staging.',
    nearestTown: {
      name: 'Palm Springs',
      region: 'California',
      distanceMiles: 12,
      route: 'Tramway Rd',
      lat: 33.8303,
      lon: -116.5453,
    },
    nearbyPlaces: [
      {
        name: 'Palm Springs',
        region: 'California',
        distanceMiles: 12,
        route: 'Tramway Rd',
        lat: 33.8303,
        lon: -116.5453,
      },
      {
        name: 'Idyllwild',
        region: 'California',
        distanceMiles: 14,
        route: 'CA-243',
        lat: 33.7403,
        lon: -116.712,
      },
    ],
    afterId: 'lassen',
  },
  {
    id: 'sangorgonio',
    name: 'San Gorgonio Mountain',
    lat: 34.0992,
    lon: -116.8247,
    elevationFt: 11503,
    prominenceFt: 8294,
    range: 'San Bernardino Mountains',
    country: 'USA',
    description:
      'Highest peak in Southern California — a long wilderness hike via Vivian Creek or other San Gorgonio Wilderness trails above Forest Falls.',
    firstAscent: '1872',
    difficulty: 'Strenuous day / overnight',
    aliases: ['Mt. San Gorgonio', 'Old Greyback'],
    bestSeason: 'Jun–Oct',
    whyNotable:
      'Southern California’s high point and a rite-of-passage San Bernardino wilderness hike.',
    seoMetaDescription:
      'Explore San Gorgonio Mountain on a 3D map — Southern California high point, wilderness topography, elevation stats, and Forest Falls approaches.',
    nearestTown: {
      name: 'Forest Falls',
      region: 'California',
      distanceMiles: 8,
      route: 'Valley of the Falls Dr',
      lat: 34.0878,
      lon: -116.925,
    },
    nearbyPlaces: [
      {
        name: 'Forest Falls',
        region: 'California',
        distanceMiles: 8,
        route: 'Valley of the Falls Dr',
        lat: 34.0878,
        lon: -116.925,
      },
    ],
    afterId: 'sanjacinto',
  },
  {
    id: 'baldy',
    name: 'Mt. San Antonio',
    lat: 34.2889,
    lon: -117.6463,
    elevationFt: 10064,
    prominenceFt: 6224,
    range: 'San Gabriel Mountains',
    country: 'USA',
    description:
      'Mt. Baldy — Los Angeles’s backyard 10,000-footer via Baldy Bowl, Ski Hut, or Devil’s Backbone routes in Angeles National Forest.',
    firstAscent: 'Unknown',
    difficulty: 'Strenuous day hike / scramble',
    aliases: ['Mt. Baldy', 'Mount Baldy', 'Baldy'],
    bestSeason: 'May–Oct',
    whyNotable:
      'The iconic San Gabriel high point and one of the most climbed peaks in Southern California.',
    seoMetaDescription:
      'Explore Mt. San Antonio (Mt. Baldy) on a 3D map — San Gabriel Mountains topography, Baldy Bowl routes, elevation, and Claremont approaches.',
    nearestTown: {
      name: 'Mt. Baldy Village',
      region: 'California',
      distanceMiles: 6,
      route: 'Mt Baldy Rd',
      lat: 34.2361,
      lon: -117.6578,
    },
    nearbyPlaces: [
      {
        name: 'Claremont',
        region: 'California',
        distanceMiles: 16,
        route: 'Mt Baldy Rd',
        lat: 34.0967,
        lon: -117.7198,
      },
    ],
    afterId: 'sangorgonio',
  },
  {
    id: 'tallac',
    name: 'Mt. Tallac',
    lat: 38.9063,
    lon: -120.158,
    elevationFt: 9735,
    prominenceFt: 695,
    range: 'Sierra Nevada',
    country: 'USA',
    description:
      'Tahoe’s signature day-hike summit above Fallen Leaf Lake — a steep trail to panoramic views over Lake Tahoe and Desolation Wilderness.',
    firstAscent: 'Unknown',
    difficulty: 'Strenuous day hike',
    aliases: ['Mount Tallac'],
    bestSeason: 'Jun–Oct',
    whyNotable:
      'One of Lake Tahoe’s most popular summit hikes with classic alpine-lake views.',
    seoMetaDescription:
      'Explore Mt. Tallac on a 3D map — Lake Tahoe summit topography, Desolation Wilderness approaches, elevation stats, and South Lake Tahoe staging.',
    nearestTown: {
      name: 'South Lake Tahoe',
      region: 'California',
      distanceMiles: 8,
      route: 'CA-89',
      lat: 38.9399,
      lon: -119.9772,
    },
    nearbyPlaces: [
      {
        name: 'South Lake Tahoe',
        region: 'California',
        distanceMiles: 8,
        route: 'CA-89',
        lat: 38.9399,
        lon: -119.9772,
      },
    ],
    afterId: 'halfdome',
  },
  {
    id: 'sneffels',
    name: 'Mt. Sneffels',
    lat: 38.0038,
    lon: -107.7923,
    elevationFt: 14150,
    prominenceFt: 3030,
    range: 'San Juan Mountains',
    country: 'USA',
    description:
      'Iconic San Juan 14er above Yankee Boy Basin — a steep Class 3 scramble with classic Colorado “Matterhorn” summit views near Ouray.',
    firstAscent: '1874',
    difficulty: 'Class 3 scramble',
    aliases: ['Mount Sneffels'],
    bestSeason: 'Jun–Sep',
    whyNotable:
      'One of Colorado’s most photographed 14ers and a classic Ouray / Ridgway objective.',
    seoMetaDescription:
      'Explore Mt. Sneffels on a 3D map — San Juan 14er topography, Yankee Boy Basin approaches, elevation stats, and Ouray staging.',
    nearestTown: {
      name: 'Ouray',
      region: 'Colorado',
      distanceMiles: 12,
      route: 'Camp Bird Rd',
      lat: 38.0228,
      lon: -107.6714,
    },
    nearbyPlaces: [
      {
        name: 'Ouray',
        region: 'Colorado',
        distanceMiles: 12,
        route: 'Camp Bird Rd',
        lat: 38.0228,
        lon: -107.6714,
      },
    ],
    afterId: 'maroon',
  },
  {
    id: 'uncompahgre',
    name: 'Uncompahgre Peak',
    lat: 38.0717,
    lon: -107.462,
    elevationFt: 14309,
    prominenceFt: 4277,
    range: 'San Juan Mountains',
    country: 'USA',
    description:
      'Highest peak in the San Juans — a broad Class 2 summit hike from Nellie Creek with huge views above Lake City.',
    firstAscent: '1874',
    difficulty: 'Class 2 hike',
    aliases: [],
    bestSeason: 'Jun–Sep',
    whyNotable:
      'San Juan Mountains high point and one of Colorado’s most prominent 14ers.',
    seoMetaDescription:
      'Explore Uncompahgre Peak on a 3D map — San Juan high point topography, Nellie Creek approaches, elevation stats, and Lake City staging.',
    nearestTown: {
      name: 'Lake City',
      region: 'Colorado',
      distanceMiles: 16,
      route: 'Nellie Creek Rd',
      lat: 38.0297,
      lon: -107.3153,
    },
    nearbyPlaces: [
      {
        name: 'Lake City',
        region: 'Colorado',
        distanceMiles: 16,
        route: 'Nellie Creek Rd',
        lat: 38.0297,
        lon: -107.3153,
      },
    ],
    afterId: 'sneffels',
  },
  {
    id: 'harvard',
    name: 'Mt. Harvard',
    lat: 38.9244,
    lon: -106.3207,
    elevationFt: 14420,
    prominenceFt: 2360,
    range: 'Sawatch Range',
    country: 'USA',
    description:
      'Third-highest peak in the Rockies — a long Class 2 hike from Horn Fork Basin near Buena Vista in the Collegiate Peaks.',
    firstAscent: '1869',
    difficulty: 'Class 2 hike',
    aliases: ['Mount Harvard'],
    bestSeason: 'Jun–Sep',
    whyNotable:
      'Colorado’s third-highest summit and namesake of the Collegiate Peaks.',
    seoMetaDescription:
      'Explore Mt. Harvard on a 3D map — Collegiate Peaks 14er topography, Horn Fork approaches, elevation stats, and Buena Vista staging.',
    nearestTown: {
      name: 'Buena Vista',
      region: 'Colorado',
      distanceMiles: 16,
      route: 'CR-365 / Horn Fork',
      lat: 38.8422,
      lon: -106.1311,
    },
    nearbyPlaces: [
      {
        name: 'Buena Vista',
        region: 'Colorado',
        distanceMiles: 16,
        route: 'CR-365',
        lat: 38.8422,
        lon: -106.1311,
      },
    ],
    afterId: 'massive',
  },
  {
    id: 'sherman',
    name: 'Mt. Sherman',
    lat: 39.225,
    lon: -106.1697,
    elevationFt: 14036,
    prominenceFt: 896,
    range: 'Mosquito Range',
    country: 'USA',
    description:
      'One of Colorado’s most accessible 14ers — a short Class 2 ridge hike from Fourmile Creek above Fairplay / Alma.',
    firstAscent: '1881',
    difficulty: 'Class 2 hike',
    aliases: ['Mount Sherman'],
    bestSeason: 'May–Oct',
    whyNotable:
      'A classic “first 14er” for many Colorado hikers thanks to a short approach and moderate ridge.',
    seoMetaDescription:
      'Explore Mt. Sherman on a 3D map — Mosquito Range 14er topography, Fourmile Creek approaches, elevation stats, and Fairplay staging.',
    nearestTown: {
      name: 'Fairplay',
      region: 'Colorado',
      distanceMiles: 14,
      route: 'Fourmile Creek Rd',
      lat: 39.2247,
      lon: -106.0019,
    },
    nearbyPlaces: [
      {
        name: 'Fairplay',
        region: 'Colorado',
        distanceMiles: 14,
        route: 'Fourmile Creek Rd',
        lat: 39.2247,
        lon: -106.0019,
      },
    ],
    afterId: 'quandary',
  },
  {
    id: 'bluesky',
    name: 'Mount Blue Sky',
    lat: 39.5883,
    lon: -105.6438,
    elevationFt: 14265,
    prominenceFt: 2749,
    range: 'Front Range',
    country: 'USA',
    description:
      'Formerly Mt. Evans — a Front Range 14er with a seasonal summit highway and classic West Ridge hike from Summit Lake near Idaho Springs.',
    firstAscent: '1874',
    difficulty: 'Drive / Class 2 hike',
    aliases: ['Mt. Evans', 'Mount Evans', 'Mt. Blue Sky'],
    bestSeason: 'Jun–Sep',
    whyNotable:
      'One of Colorado’s most visited high summits — road-accessible 14er above the Denver Front Range.',
    seoMetaDescription:
      'Explore Mount Blue Sky (Mt. Evans) on a 3D map — Front Range 14er topography, summit highway approaches, elevation, and Idaho Springs staging.',
    nearestTown: {
      name: 'Idaho Springs',
      region: 'Colorado',
      distanceMiles: 28,
      route: 'CO-103 / Mt Blue Sky Rd',
      lat: 39.7425,
      lon: -105.5136,
    },
    nearbyPlaces: [
      {
        name: 'Idaho Springs',
        region: 'Colorado',
        distanceMiles: 28,
        route: 'CO-103',
        lat: 39.7425,
        lon: -105.5136,
      },
    ],
    afterId: 'bierstadt',
  },
  {
    id: 'wheelernm',
    name: 'Wheeler Peak',
    lat: 36.5569,
    lon: -105.4169,
    elevationFt: 13161,
    prominenceFt: 3409,
    range: 'Sangre de Cristo Mountains',
    country: 'USA',
    description:
      'New Mexico’s high point above Taos Ski Valley — a popular Williams Lake trail to an alpine summit in Carson National Forest.',
    firstAscent: 'Unknown',
    difficulty: 'Strenuous day hike',
    aliases: ['Wheeler Peak NM'],
    bestSeason: 'Jun–Sep',
    whyNotable:
      'Highest point in New Mexico and a classic Taos alpine day hike.',
    seoMetaDescription:
      'Explore Wheeler Peak (New Mexico) on a 3D map — state high point topography, Williams Lake trail, elevation stats, and Taos approaches.',
    nearestTown: {
      name: 'Taos',
      region: 'New Mexico',
      distanceMiles: 22,
      route: 'NM-150 / Taos Ski Valley',
      lat: 36.4072,
      lon: -105.5733,
    },
    nearbyPlaces: [
      {
        name: 'Taos',
        region: 'New Mexico',
        distanceMiles: 22,
        route: 'NM-150',
        lat: 36.4072,
        lon: -105.5733,
      },
    ],
    afterId: 'wheeler',
  },
  {
    id: 'sandia',
    name: 'Sandia Crest',
    lat: 35.2114,
    lon: -106.4497,
    elevationFt: 10678,
    prominenceFt: 4098,
    range: 'Sandia Mountains',
    country: 'USA',
    description:
      'Albuquerque’s mountain skyline high point — road- and tram-accessible crest with La Luz and other Sandia Wilderness trails on the west face.',
    firstAscent: 'Unknown',
    difficulty: 'Drive / strenuous day hike',
    aliases: ['Sandia Peak', 'Sandia Mountains high point'],
    bestSeason: 'May–Oct',
    whyNotable:
      'The defining summit above Albuquerque and one of New Mexico’s most visited mountain destinations.',
    seoMetaDescription:
      'Explore Sandia Crest on a 3D map — Albuquerque skyline topography, La Luz Trail approaches, elevation stats, and tram / crest-road access.',
    nearestTown: {
      name: 'Albuquerque',
      region: 'New Mexico',
      distanceMiles: 16,
      route: 'I-40 / NM-536',
      lat: 35.0844,
      lon: -106.6504,
    },
    nearbyPlaces: [
      {
        name: 'Albuquerque',
        region: 'New Mexico',
        distanceMiles: 16,
        route: 'NM-536',
        lat: 35.0844,
        lon: -106.6504,
      },
    ],
    afterId: 'wheelernm',
  },
  {
    id: 'leconte',
    name: 'Mt. LeConte',
    lat: 35.6542,
    lon: -83.4372,
    elevationFt: 6593,
    prominenceFt: 1360,
    range: 'Great Smoky Mountains',
    country: 'USA',
    description:
      'One of the Smokies’ most popular overnight destinations — Alum Cave and Rainbow Falls trails climb to LeConte Lodge and a forested summit complex.',
    firstAscent: 'Unknown',
    difficulty: 'Strenuous day / overnight',
    aliases: ['Mount Le Conte', 'Mount LeConte'],
    bestSeason: 'Apr–Oct',
    whyNotable:
      'Among the most visited backcountry summits in the eastern U.S., with a historic summit lodge.',
    seoMetaDescription:
      'Explore Mt. LeConte on a 3D map — Great Smoky Mountains topography, Alum Cave approaches, elevation stats, and Gatlinburg staging.',
    nearestTown: {
      name: 'Gatlinburg',
      region: 'Tennessee',
      distanceMiles: 8,
      route: 'US-441 / Alum Cave',
      lat: 35.7143,
      lon: -83.5102,
    },
    nearbyPlaces: [
      {
        name: 'Gatlinburg',
        region: 'Tennessee',
        distanceMiles: 8,
        route: 'US-441',
        lat: 35.7143,
        lon: -83.5102,
      },
    ],
    afterId: 'kuwohi',
  },
  {
    id: 'oldrag',
    name: 'Old Rag Mountain',
    lat: 38.5518,
    lon: -78.3142,
    elevationFt: 3268,
    prominenceFt: 1368,
    range: 'Blue Ridge Mountains',
    country: 'USA',
    description:
      'Shenandoah’s legendary granite scramble — a permit-required circuit with rock slabs, chimneys, and huge Piedmont views near Sperryville.',
    firstAscent: 'Unknown',
    difficulty: 'Class 3 scramble (permit)',
    aliases: ['Old Rag'],
    bestSeason: 'Mar–Nov',
    whyNotable:
      'One of the Mid-Atlantic’s most famous day hikes — a technical granite scramble in Shenandoah National Park.',
    seoMetaDescription:
      'Explore Old Rag Mountain on a 3D map — Shenandoah scramble topography, circuit trail, elevation stats, and Sperryville approaches.',
    nearestTown: {
      name: 'Sperryville',
      region: 'Virginia',
      distanceMiles: 10,
      route: 'SR-231 / SR-600',
      lat: 38.6571,
      lon: -78.2261,
    },
    nearbyPlaces: [
      {
        name: 'Sperryville',
        region: 'Virginia',
        distanceMiles: 10,
        route: 'SR-600',
        lat: 38.6571,
        lon: -78.2261,
      },
    ],
    afterId: 'washington',
  },
  {
    id: 'mansfield',
    name: 'Mt. Mansfield',
    lat: 44.5438,
    lon: -72.8143,
    elevationFt: 4393,
    prominenceFt: 3633,
    range: 'Green Mountains',
    country: 'USA',
    description:
      'Vermont’s high point — a classic Long Trail / Forehead-to-Chin ridge hike above Stowe with alpine tundra and ski-area access.',
    firstAscent: 'Unknown',
    difficulty: 'Strenuous day hike',
    aliases: ['Mount Mansfield'],
    bestSeason: 'Jun–Oct',
    whyNotable:
      'Highest peak in Vermont and the signature summit of the Green Mountains.',
    seoMetaDescription:
      'Explore Mt. Mansfield on a 3D map — Vermont high point topography, Long Trail ridge, elevation stats, and Stowe approaches.',
    nearestTown: {
      name: 'Stowe',
      region: 'Vermont',
      distanceMiles: 10,
      route: 'VT-108',
      lat: 44.4654,
      lon: -72.6874,
    },
    nearbyPlaces: [
      {
        name: 'Stowe',
        region: 'Vermont',
        distanceMiles: 10,
        route: 'VT-108',
        lat: 44.4654,
        lon: -72.6874,
      },
    ],
    afterId: 'marcy',
  },
  {
    id: 'cadillac',
    name: 'Cadillac Mountain',
    lat: 44.3512,
    lon: -68.2265,
    elevationFt: 1529,
    prominenceFt: 1529,
    range: 'Acadia',
    country: 'USA',
    description:
      'Acadia National Park’s high point and one of the first places to see sunrise in the U.S. — road- and trail-accessible granite summit above Bar Harbor.',
    firstAscent: 'Unknown',
    difficulty: 'Drive / easy to moderate hike',
    aliases: [],
    bestSeason: 'May–Oct',
    whyNotable:
      'Acadia’s iconic summit and one of the most visited mountain viewpoints on the East Coast.',
    seoMetaDescription:
      'Explore Cadillac Mountain on a 3D map — Acadia National Park high point, granite summit topography, elevation, and Bar Harbor approaches.',
    nearestTown: {
      name: 'Bar Harbor',
      region: 'Maine',
      distanceMiles: 4,
      route: 'Cadillac Summit Rd',
      lat: 44.3876,
      lon: -68.2039,
    },
    nearbyPlaces: [
      {
        name: 'Bar Harbor',
        region: 'Maine',
        distanceMiles: 4,
        route: 'Cadillac Summit Rd',
        lat: 44.3876,
        lon: -68.2039,
      },
    ],
    afterId: 'katahdin',
  },
]

async function fetchJson(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
  })
  if (!res.ok) throw new Error(`${res.status} ${url}`)
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
    `&prop=imageinfo&iiprop=url|extmetadata|size|mime&iiurlwidth=960`
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

async function searchPhotos(query, limit = 8) {
  const api =
    `https://commons.wikimedia.org/w/api.php?action=query&format=json` +
    `&generator=search&gsrnamespace=6&gsrsearch=${encodeURIComponent(query)}` +
    `&gsrlimit=${limit}&prop=imageinfo&iiprop=url|extmetadata|size|mime&iiurlwidth=960`
  const data = await fetchJson(api)
  return Object.values(data?.query?.pages ?? {})
    .map(pageToPhoto)
    .filter(Boolean)
    .map(slimPhoto)
}

function matchesName(peak, photo) {
  const hay = `${photo.url} ${photo.sourceUrl} ${photo.title || ''} ${photo.credit}`.toLowerCase()
  const tokens = [peak.name, peak.id, ...(peak.aliases || [])]
    .join(' ')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length >= 4 && !['mount', 'peak', 'mountain'].includes(t))
  return tokens.some((t) => hay.includes(t))
}

async function photosFor(peak) {
  const curated = await resolveFileTitles(CURATED[peak.id] || [])
  const out = [...curated]
  if (out.length >= 2) return out.slice(0, 2)

  const queries = [
    `${peak.name} ${peak.nearestTown.region}`,
    `${peak.name} mountain`,
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
    await new Promise((r) => setTimeout(r, 250))
  }
  return out.slice(0, 2)
}

const peaks = JSON.parse(readFileSync(peaksPath, 'utf8'))
const added = []

for (const draft of NEW_PEAKS) {
  if (peaks.some((p) => p.id === draft.id)) {
    console.log(`skip existing ${draft.id}`)
    continue
  }
  console.log(`photos ${draft.id}…`)
  const photos = await photosFor(draft)
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
  if (!peak.photo) {
    console.error(`NO PHOTOS for ${draft.id} — aborting that peak`)
    continue
  }

  let idx = peaks.findIndex((p) => p.id === afterId)
  if (idx < 0) idx = peaks.length - 1
  peaks.splice(idx + 1, 0, peak)
  added.push(draft.id)
  console.log(`  + ${draft.id} (${photos.length} photos)`)
}

writeFileSync(peaksPath, `${JSON.stringify(peaks, null, 2)}\n`)
console.log(`\nDone. added=${added.length}: ${added.join(', ')} · total=${peaks.length}`)
