/**
 * Add popular US peaks shortlist with curated Commons summit photos.
 * Run: node scripts/add-popular-us-peaks.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const peaksPath = join(root, 'src', 'data', 'peaks.json')
const UA = 'PeakAtlas3D/0.2 (https://peakatlas3d.com; popular us peaks)'

/** Hand-picked Commons files verified to depict the named summit. */
const CURATED = {
  whitemountain: [
    'File:White Mountain Peak.jpg',
    'File:White Mountain Peak, California.jpg',
    'File:White Mountain Peak 2018 Open Gate Day.jpg',
  ],
  telescope: [
    'File:Telescope Peak from Badwater 2.jpg',
    'File:Telescope Peak - Death Valley NP California.jpg',
    'File:Telescope Peak Summit.jpg',
  ],
  crestoneneedle: [
    'File:Crestone needle and lower south colony lake 2008.JPG',
    'File:Broken Hand Peak and Crestone Needle.jpg',
    'File:Crestone Needle.jpg',
  ],
  holycross: [
    'File:Mount of the Holy Cross, 2009.jpg',
    'File:Mountain of the Holy Cross. Eagle County, Colorado - NARA - 517031.jpg',
    'File:Holy Cross Mountain.jpg',
  ],
  princeton: [
    'File:Mount Princeton, CO 2009-07.jpg',
    'File:Mount Princeton from Cottonwood Pass road, west of Buena Vista.jpg',
    'File:Mount Princeton, Collegiate Peaks, Sawatch Range, Colorado (9181505764).jpg',
  ],
  yale: [
    'File:Mount Yale from Denny Creek trailhead, Cottonwood Pass road.jpg',
    'File:Mount Yale from along U.S. 285 near the town of Nathrop.jpg',
    'File:Mount Yale.JPG',
  ],
  handies: [
    'File:Handies Peak Colorado.jpg',
    'File:Handies Peak WSA (9464673273).jpg',
    'File:Handies Peak WSA (9467518106).jpg',
  ],
  maunaloa: [
    'File:Mauna Loa.jpg',
    'File:Mauna loa from hilo bay.JPG',
    'File:Mauna Kea and Mauna Loa from Air.jpg',
  ],
  northsister: [
    'File:North Sister.JPG',
    'File:Oregon Three Sisters, 2008-12-09.jpg',
    'File:Three Sisters from Benson Lake.JPG',
  ],
  middlesister: [
    'File:Middle and South Sister, looking north.jpg',
    'File:Oregon Three Sisters, 2008-12-09.jpg',
    'File:North Middle Sisters Mirror Pond - Bend Oregon.jpg',
  ],
  stuart: [
    'File:Mount Stuart.jpg',
    'File:Mt Stuart 2.jpg',
    'File:Look east from the Dege Peak to view Mount Stuart, an impressive non-volcanic peak in the Cascade Range. (b2ec046a-8bfd-4e3d-b9da-78cda98ee894).JPG',
  ],
  elcapitan: [
    'File:El Capitan Yosemite.jpg',
    'File:El Capitan.jpg',
  ],
  monadnock: [
    'File:Mount Monadnock as seen from Bald Rock.jpg',
    'File:Mount Monadnock.JPG',
    'File:View from Mt. Monadnock.jpg',
  ],
  lafayette: [
    'File:Mt. Lafayette from Franconia Ridge.JPG',
    'File:Frosty Mount Lafayette Franconia Ridge White Mountains Grafton County New Hampshire.jpg',
    'File:Franconia Ridge.jpg',
  ],
  madison: [
    'File:Mt Madison NH.jpg',
    'File:Mt Madison from Mt Adams summit.jpg',
    'File:Jefferson, Adams and Madison from Mt. Moriah.JPG',
  ],
  adamsnh: [
    'File:Mount Adams NH from Madison.jpg',
    'File:Mt. Adams and Mt. Madison from Washington summit.jpg',
    'File:AT on Mt. Adams - panoramio.jpg',
  ],
  boundary: [
    'File:Boundary Peak Nevada.jpg',
    'File:Boundary Peak Nevada USA.jpg',
    'File:2013-09-19 14 23 44 View from US 6 of Boundary Peak and Montgomery Peak in the White Mountains of Nevada and California.JPG',
  ],
  blackelk: [
    'File:Harney Peak.JPG',
    'File:Harney Peak aka Black Elk Peak.jpg',
    'File:Black Elk Peak hike 11.jpg',
  ],
  rogers: [
    'File:Mount Rogers - Winter.jpg',
    'File:2017-05-16 09 27 42 View west-northwest towards Mount Rogers from the northern rocky outcrop along the Wilburn Ridge Trail within the Mount Rogers National Recreation Area in Grayson County, Virginia.jpg',
    'File:Mount Rogers National Recreation Area.jpg',
  ],
}

function seo(text) {
  const t = text.trim()
  if (t.length < 120 || t.length > 150) {
    throw new Error(`seo length ${t.length}: ${t}`)
  }
  return t
}

const NEW_PEAKS = [
  {
    id: 'whitemountain',
    name: 'White Mountain Peak',
    lat: 37.6341,
    lon: -118.2557,
    elevationFt: 14252,
    prominenceFt: 7196,
    range: 'White Mountains',
    country: 'USA',
    description:
      'California’s third-highest summit and the high point of the White Mountains — a long high-desert ridge hike with expansive views toward the Sierra Nevada.',
    firstAscent: 'Unknown / Indigenous',
    difficulty: 'Class 1–2 hike',
    aliases: ['White Mountain'],
    bestSeason: 'Jun–Oct',
    whyNotable:
      'Third-highest peak in California; ultra-prominent White Mountains high point.',
    seoMetaDescription: seo(
      'Explore White Mountain Peak on a 3D map — California’s third-highest summit, White Mountains topography, elevation, and Bishop approaches.',
    ),
    nearestTown: {
      name: 'Bishop',
      region: 'California',
      distanceMiles: 22,
      route: 'US-6 / White Mountain Rd',
      lat: 37.3635,
      lon: -118.3951,
    },
    nearbyPlaces: [
      {
        name: 'Bishop',
        region: 'California',
        distanceMiles: 22,
        route: 'US-6 / White Mountain Rd',
        lat: 37.3635,
        lon: -118.3951,
      },
      {
        name: 'Big Pine',
        region: 'California',
        distanceMiles: 18,
        route: 'US-395',
        lat: 37.1649,
        lon: -118.2895,
      },
    ],
    afterId: 'whitney',
  },
  {
    id: 'telescope',
    name: 'Telescope Peak',
    lat: 36.1699,
    lon: -117.0892,
    elevationFt: 11043,
    prominenceFt: 6168,
    range: 'Panamint Range',
    country: 'USA',
    description:
      'Death Valley’s high point in the Panamint Range — a long desert ridge walk with views from Badwater Basin to Mount Whitney on clear days.',
    firstAscent: 'Unknown / Indigenous',
    difficulty: 'Class 1–2 hike',
    bestSeason: 'Apr–Jun, Sep–Nov',
    whyNotable:
      'Highest peak in Death Valley National Park; classic desert high-point hike.',
    seoMetaDescription: seo(
      'Explore Telescope Peak on a 3D map — Death Valley high point in the Panamints, desert ridge topography, elevation, and Furnace Creek staging.',
    ),
    nearestTown: {
      name: 'Furnace Creek',
      region: 'California',
      distanceMiles: 28,
      route: 'CA-190 / Emigrant Canyon',
      lat: 36.4577,
      lon: -116.8665,
    },
    nearbyPlaces: [
      {
        name: 'Furnace Creek',
        region: 'California',
        distanceMiles: 28,
        route: 'CA-190',
        lat: 36.4577,
        lon: -116.8665,
      },
      {
        name: 'Stovepipe Wells',
        region: 'California',
        distanceMiles: 32,
        route: 'CA-190',
        lat: 36.6066,
        lon: -117.1467,
      },
    ],
    afterId: 'guadalupe',
  },
  {
    id: 'crestoneneedle',
    name: 'Crestone Needle',
    lat: 37.9647,
    lon: -105.5767,
    elevationFt: 14197,
    prominenceFt: 457,
    range: 'Sangre de Cristo',
    country: 'USA',
    description:
      'A sharp Sangre de Cristo 14er beside Crestone Peak — classic Class 3 scrambling on solid rock via Ellingwood Arete or the standard South Face.',
    firstAscent: '1916',
    difficulty: 'Class 3 scramble',
    aliases: ['Crestone Needles'],
    bestSeason: 'Jul–Sep',
    whyNotable:
      'One of Colorado’s most striking 14ers; often linked with Crestone Peak.',
    seoMetaDescription: seo(
      'Explore Crestone Needle on a 3D map — sharp Sangre de Cristo 14er beside Crestone Peak, Class 3 scramble terrain, and South Colony approaches.',
    ),
    nearestTown: {
      name: 'Westcliffe',
      region: 'Colorado',
      distanceMiles: 18,
      route: 'CO-69 / South Colony Rd',
      lat: 38.1328,
      lon: -105.4658,
    },
    nearbyPlaces: [
      {
        name: 'Westcliffe',
        region: 'Colorado',
        distanceMiles: 18,
        route: 'South Colony Rd',
        lat: 38.1328,
        lon: -105.4658,
      },
      {
        name: 'Crestone',
        region: 'Colorado',
        distanceMiles: 14,
        route: 'CR-T',
        lat: 37.9964,
        lon: -105.6997,
      },
    ],
    trails: [{ name: 'South Colony Lakes Trail' }],
    afterId: 'crestone',
  },
  {
    id: 'holycross',
    name: 'Mt. of the Holy Cross',
    lat: 39.4668,
    lon: -106.4817,
    elevationFt: 14005,
    prominenceFt: 2113,
    range: 'Sawatch Range',
    country: 'USA',
    description:
      'A storied Sawatch 14er famous for the snow-filled cross couloir on its northeast face — a long Class 2 hike from Half Moon / Tigiwon approaches.',
    firstAscent: '1873',
    difficulty: 'Class 2 hike',
    aliases: ['Mount of the Holy Cross', 'Holy Cross'],
    bestSeason: 'Jul–Sep',
    whyNotable:
      'Iconic Colorado 14er named for the snow cross on its northeast face.',
    seoMetaDescription: seo(
      'Explore Mt. of the Holy Cross on a 3D map — legendary Sawatch 14er near Vail, snow-cross couloir topography, elevation, and Tigiwon approaches.',
    ),
    nearestTown: {
      name: 'Minturn',
      region: 'Colorado',
      distanceMiles: 12,
      route: 'Tigiwon Rd',
      lat: 39.5864,
      lon: -106.4309,
    },
    nearbyPlaces: [
      {
        name: 'Minturn',
        region: 'Colorado',
        distanceMiles: 12,
        route: 'Tigiwon Rd',
        lat: 39.5864,
        lon: -106.4309,
      },
      {
        name: 'Vail',
        region: 'Colorado',
        distanceMiles: 18,
        route: 'I-70',
        lat: 39.6403,
        lon: -106.3742,
      },
    ],
    afterId: 'elbert',
  },
  {
    id: 'princeton',
    name: 'Mt. Princeton',
    lat: 38.7492,
    lon: -106.2425,
    elevationFt: 14197,
    prominenceFt: 3017,
    range: 'Sawatch Range',
    country: 'USA',
    description:
      'A Collegiate Peaks 14er above Buena Vista — the popular East Slopes hike climbs from the radio towers road into alpine ridge terrain.',
    firstAscent: '1877',
    difficulty: 'Class 2 hike',
    aliases: ['Mount Princeton'],
    bestSeason: 'Jun–Sep',
    whyNotable:
      'Prominent Collegiate Peaks 14er and a classic Buena Vista day hike.',
    seoMetaDescription: seo(
      'Explore Mt. Princeton on a 3D map — Colorado Collegiate Peaks 14er above Buena Vista, East Slopes topography, elevation, and Chalk Creek approaches.',
    ),
    nearestTown: {
      name: 'Buena Vista',
      region: 'Colorado',
      distanceMiles: 10,
      route: 'CR-321 / Mt. Princeton Rd',
      lat: 38.8422,
      lon: -106.1311,
    },
    nearbyPlaces: [
      {
        name: 'Buena Vista',
        region: 'Colorado',
        distanceMiles: 10,
        route: 'CR-321',
        lat: 38.8422,
        lon: -106.1311,
      },
      {
        name: 'Salida',
        region: 'Colorado',
        distanceMiles: 28,
        route: 'US-285',
        lat: 38.5347,
        lon: -105.9989,
      },
    ],
    afterId: 'harvard',
  },
  {
    id: 'yale',
    name: 'Mt. Yale',
    lat: 38.8442,
    lon: -106.3139,
    elevationFt: 14196,
    prominenceFt: 1896,
    range: 'Sawatch Range',
    country: 'USA',
    description:
      'A Collegiate Peaks 14er climbed via the Denny Creek / Southwest Slopes route — forest, then alpine, then a rocky Class 2 summit ridge.',
    firstAscent: '1870s',
    difficulty: 'Class 2 hike',
    aliases: ['Mount Yale'],
    bestSeason: 'Jun–Sep',
    whyNotable:
      'Popular Collegiate Peaks 14er with a classic Denny Creek approach.',
    seoMetaDescription: seo(
      'Explore Mt. Yale on a 3D map — Colorado Collegiate Peaks 14er via Denny Creek, Sawatch topography, elevation stats, and Buena Vista staging.',
    ),
    nearestTown: {
      name: 'Buena Vista',
      region: 'Colorado',
      distanceMiles: 12,
      route: 'CR-306 / Denny Creek',
      lat: 38.8422,
      lon: -106.1311,
    },
    nearbyPlaces: [
      {
        name: 'Buena Vista',
        region: 'Colorado',
        distanceMiles: 12,
        route: 'Denny Creek',
        lat: 38.8422,
        lon: -106.1311,
      },
      {
        name: 'Nathrop',
        region: 'Colorado',
        distanceMiles: 16,
        route: 'US-285',
        lat: 38.7453,
        lon: -106.0764,
      },
    ],
    afterId: 'princeton',
  },
  {
    id: 'handies',
    name: 'Handies Peak',
    lat: 37.9131,
    lon: -107.5044,
    elevationFt: 14048,
    prominenceFt: 1908,
    range: 'San Juan Mountains',
    country: 'USA',
    description:
      'One of Colorado’s easier San Juan 14ers — a Class 1–2 hike from American Basin or Grizzly Gulch with broad alpine meadows and big views.',
    firstAscent: '1870s',
    difficulty: 'Class 1–2 hike',
    bestSeason: 'Jul–Sep',
    whyNotable:
      'Among the most accessible San Juan 14ers; classic American Basin day hike.',
    seoMetaDescription: seo(
      'Explore Handies Peak on a 3D map — accessible San Juan 14er via American Basin, alpine meadow topography, elevation, and Lake City approaches.',
    ),
    nearestTown: {
      name: 'Lake City',
      region: 'Colorado',
      distanceMiles: 20,
      route: 'CR-30 / Cinnamon Pass',
      lat: 38.03,
      lon: -107.3153,
    },
    nearbyPlaces: [
      {
        name: 'Lake City',
        region: 'Colorado',
        distanceMiles: 20,
        route: 'Cinnamon Pass',
        lat: 38.03,
        lon: -107.3153,
      },
      {
        name: 'Silverton',
        region: 'Colorado',
        distanceMiles: 28,
        route: 'US-550',
        lat: 37.8119,
        lon: -107.6645,
      },
    ],
    afterId: 'uncompahgre',
  },
  {
    id: 'maunaloa',
    name: 'Mauna Loa',
    lat: 19.4756,
    lon: -155.6081,
    elevationFt: 13679,
    prominenceFt: 7079,
    range: 'Hawaiian Islands',
    country: 'USA',
    description:
      'Earth’s largest shield volcano by volume — a vast, gently sloping Hawaiian giant beside Mauna Kea, with long alpine approaches above the rainforest.',
    firstAscent: 'Unknown / Indigenous',
    difficulty: 'High-altitude hike',
    bestSeason: 'Year-round (weather dependent)',
    whyNotable:
      'Largest volcano on Earth by volume; active Hawaiian shield beside Mauna Kea.',
    seoMetaDescription: seo(
      'Explore Mauna Loa on a 3D map — Earth’s largest shield volcano on Hawaiʻi Island, alpine shield topography, elevation, and Hilo approaches.',
    ),
    nearestTown: {
      name: 'Hilo',
      region: 'Hawaii',
      distanceMiles: 35,
      route: 'Saddle Rd / Mauna Loa Observatory Rd',
      lat: 19.7074,
      lon: -155.0902,
    },
    nearbyPlaces: [
      {
        name: 'Hilo',
        region: 'Hawaii',
        distanceMiles: 35,
        route: 'Saddle Rd',
        lat: 19.7074,
        lon: -155.0902,
      },
      {
        name: 'Kailua-Kona',
        region: 'Hawaii',
        distanceMiles: 45,
        route: 'HI-190',
        lat: 19.6399,
        lon: -155.9969,
      },
    ],
    afterId: 'maunakea',
  },
  {
    id: 'northsister',
    name: 'North Sister',
    lat: 44.1662,
    lon: -121.7725,
    elevationFt: 10085,
    prominenceFt: 2725,
    range: 'Cascade Range',
    country: 'USA',
    description:
      'The oldest and most eroded of Oregon’s Three Sisters — a technical Cascade climb of rotten volcanic rock, far harder than South Sister.',
    firstAscent: '1910',
    difficulty: 'Technical alpine',
    aliases: ['Faith'],
    bestSeason: 'Jul–Sep',
    whyNotable:
      'Hardest of the Three Sisters; classic Oregon Cascade technical summit.',
    seoMetaDescription: seo(
      'Explore North Sister on a 3D map — technical Oregon Cascade volcano in the Three Sisters, alpine topography, elevation, and Bend approaches.',
    ),
    nearestTown: {
      name: 'Bend',
      region: 'Oregon',
      distanceMiles: 28,
      route: 'OR-242 / Pole Creek',
      lat: 44.0582,
      lon: -121.3153,
    },
    nearbyPlaces: [
      {
        name: 'Bend',
        region: 'Oregon',
        distanceMiles: 28,
        route: 'Pole Creek',
        lat: 44.0582,
        lon: -121.3153,
      },
      {
        name: 'Sisters',
        region: 'Oregon',
        distanceMiles: 18,
        route: 'OR-242',
        lat: 44.2909,
        lon: -121.5493,
      },
    ],
    afterId: 'southsister',
  },
  {
    id: 'middlesister',
    name: 'Middle Sister',
    lat: 44.1481,
    lon: -121.7842,
    elevationFt: 10047,
    prominenceFt: 1187,
    range: 'Cascade Range',
    country: 'USA',
    description:
      'The middle peak of Oregon’s Three Sisters — a moderate snow and scree climb often done as a long day from the Pole Creek or Obsidian approaches.',
    firstAscent: '1910',
    difficulty: 'Snow / scramble',
    aliases: ['Hope'],
    bestSeason: 'Jul–Sep',
    whyNotable:
      'Central Three Sisters summit; popular Oregon Cascade alpine day climb.',
    seoMetaDescription: seo(
      'Explore Middle Sister on a 3D map — Oregon Three Sisters Cascade peak, snow-and-scree topography, elevation stats, and Sisters/Bend approaches.',
    ),
    nearestTown: {
      name: 'Bend',
      region: 'Oregon',
      distanceMiles: 28,
      route: 'OR-242 / Pole Creek',
      lat: 44.0582,
      lon: -121.3153,
    },
    nearbyPlaces: [
      {
        name: 'Bend',
        region: 'Oregon',
        distanceMiles: 28,
        route: 'Pole Creek',
        lat: 44.0582,
        lon: -121.3153,
      },
      {
        name: 'Sisters',
        region: 'Oregon',
        distanceMiles: 18,
        route: 'OR-242',
        lat: 44.2909,
        lon: -121.5493,
      },
    ],
    afterId: 'northsister',
  },
  {
    id: 'stuart',
    name: 'Mt. Stuart',
    lat: 47.4752,
    lon: -120.9015,
    elevationFt: 9415,
    prominenceFt: 5354,
    range: 'Cascade Range',
    country: 'USA',
    description:
      'The non-volcanic king of the central Washington Cascades — a massive granite massif with classic alpine rock routes above the Enchantments.',
    firstAscent: '1873',
    difficulty: 'Technical alpine',
    aliases: ['Mount Stuart'],
    bestSeason: 'Jul–Sep',
    whyNotable:
      'Highest non-volcanic peak in Washington; landmark of the Enchantments.',
    seoMetaDescription: seo(
      'Explore Mt. Stuart on a 3D map — granite Cascades giant above the Enchantments, alpine rock topography, elevation, and Leavenworth approaches.',
    ),
    nearestTown: {
      name: 'Leavenworth',
      region: 'Washington',
      distanceMiles: 22,
      route: 'Icicle Creek Rd',
      lat: 47.5962,
      lon: -120.6615,
    },
    nearbyPlaces: [
      {
        name: 'Leavenworth',
        region: 'Washington',
        distanceMiles: 22,
        route: 'Icicle Creek',
        lat: 47.5962,
        lon: -120.6615,
      },
      {
        name: 'Wenatchee',
        region: 'Washington',
        distanceMiles: 35,
        route: 'US-2',
        lat: 47.4235,
        lon: -120.3103,
      },
    ],
    afterId: 'glacierpeak',
  },
  {
    id: 'elcapitan',
    name: 'El Capitan',
    lat: 37.7342,
    lon: -119.6377,
    elevationFt: 7569,
    prominenceFt: 9,
    range: 'Sierra Nevada',
    country: 'USA',
    description:
      'Yosemite’s sheer granite monolith — one of the world’s most famous big walls, rising nearly 3,000 feet above the Valley floor.',
    firstAscent: '1958 (The Nose)',
    difficulty: 'Elite big-wall',
    aliases: ['El Cap'],
    bestSeason: 'Apr–Oct (climbers)',
    whyNotable:
      'World-famous Yosemite big wall; iconic American climbing landmark.',
    seoMetaDescription: seo(
      'Explore El Capitan on a 3D map — Yosemite’s legendary granite big wall, Valley topography, elevation context, and Yosemite Village staging.',
    ),
    nearestTown: {
      name: 'Yosemite Valley',
      region: 'California',
      distanceMiles: 3,
      route: 'Northside Dr',
      lat: 37.7459,
      lon: -119.5936,
    },
    nearbyPlaces: [
      {
        name: 'Yosemite Valley',
        region: 'California',
        distanceMiles: 3,
        route: 'Northside Dr',
        lat: 37.7459,
        lon: -119.5936,
      },
      {
        name: 'El Portal',
        region: 'California',
        distanceMiles: 14,
        route: 'CA-140',
        lat: 37.6746,
        lon: -119.7843,
      },
    ],
    afterId: 'halfdome',
  },
  {
    id: 'monadnock',
    name: 'Mt. Monadnock',
    lat: 42.8615,
    lon: -72.1081,
    elevationFt: 3165,
    prominenceFt: 2130,
    range: 'New England Upland',
    country: 'USA',
    description:
      'One of the world’s most climbed mountains — a bare New Hampshire summit of open ledge trails above Jaffrey and Dublin.',
    firstAscent: 'Unknown / Indigenous',
    difficulty: 'Class 1–2 hike',
    aliases: ['Grand Monadnock', 'Mount Monadnock'],
    bestSeason: 'May–Oct',
    whyNotable:
      'Among the most frequently hiked peaks on Earth; classic New England summit.',
    seoMetaDescription: seo(
      'Explore Mt. Monadnock on a 3D map — famously climbed New Hampshire summit, open ledge topography, elevation, and Jaffrey trailhead approaches.',
    ),
    nearestTown: {
      name: 'Jaffrey',
      region: 'New Hampshire',
      distanceMiles: 5,
      route: 'NH-124',
      lat: 42.814,
      lon: -72.0231,
    },
    nearbyPlaces: [
      {
        name: 'Jaffrey',
        region: 'New Hampshire',
        distanceMiles: 5,
        route: 'NH-124',
        lat: 42.814,
        lon: -72.0231,
      },
      {
        name: 'Dublin',
        region: 'New Hampshire',
        distanceMiles: 6,
        route: 'NH-101',
        lat: 42.9056,
        lon: -72.062,
      },
    ],
    afterId: 'mansfield',
  },
  {
    id: 'lafayette',
    name: 'Mt. Lafayette',
    lat: 44.1607,
    lon: -71.6444,
    elevationFt: 5249,
    prominenceFt: 3342,
    range: 'White Mountains',
    country: 'USA',
    description:
      'The high point of Franconia Ridge — a classic White Mountains alpine traverse linking Little Haystack, Lincoln, and Lafayette above Franconia Notch.',
    firstAscent: '1820s',
    difficulty: 'Class 1–2 hike',
    aliases: ['Mount Lafayette'],
    bestSeason: 'Jun–Oct',
    whyNotable:
      'Franconia Ridge high point; one of New England’s premier alpine day hikes.',
    seoMetaDescription: seo(
      'Explore Mt. Lafayette on a 3D map — Franconia Ridge high point in New Hampshire, alpine traverse topography, elevation, and Franconia approaches.',
    ),
    nearestTown: {
      name: 'Franconia',
      region: 'New Hampshire',
      distanceMiles: 8,
      route: 'I-93 / Franconia Notch',
      lat: 44.227,
      lon: -71.7479,
    },
    nearbyPlaces: [
      {
        name: 'Franconia',
        region: 'New Hampshire',
        distanceMiles: 8,
        route: 'Franconia Notch',
        lat: 44.227,
        lon: -71.7479,
      },
      {
        name: 'Lincoln',
        region: 'New Hampshire',
        distanceMiles: 12,
        route: 'I-93',
        lat: 44.0453,
        lon: -71.6701,
      },
    ],
    afterId: 'washington',
  },
  {
    id: 'madison',
    name: 'Mt. Madison',
    lat: 44.3284,
    lon: -71.277,
    elevationFt: 5367,
    prominenceFt: 466,
    range: 'Presidential Range',
    country: 'USA',
    description:
      'Northernmost Presidential 5000-footer — rocky alpine trails above Madison Spring Hut on the classic Presidential Traverse.',
    firstAscent: '1840s',
    difficulty: 'Class 2 hike',
    aliases: ['Mount Madison'],
    bestSeason: 'Jun–Oct',
    whyNotable:
      'Northern anchor of New Hampshire’s Presidential Range alpine crest.',
    seoMetaDescription: seo(
      'Explore Mt. Madison on a 3D map — northern Presidential Range summit in New Hampshire, alpine crest topography, and Appalachian Trail approaches.',
    ),
    nearestTown: {
      name: 'Gorham',
      region: 'New Hampshire',
      distanceMiles: 10,
      route: 'NH-16 / Dolly Copp',
      lat: 44.3878,
      lon: -71.1731,
    },
    nearbyPlaces: [
      {
        name: 'Gorham',
        region: 'New Hampshire',
        distanceMiles: 10,
        route: 'NH-16',
        lat: 44.3878,
        lon: -71.1731,
      },
      {
        name: 'Pinkham Notch',
        region: 'New Hampshire',
        distanceMiles: 8,
        route: 'NH-16',
        lat: 44.2573,
        lon: -71.2531,
      },
    ],
    afterId: 'lafayette',
  },
  {
    id: 'adamsnh',
    name: 'Mt. Adams (NH)',
    lat: 44.3206,
    lon: -71.2915,
    elevationFt: 5799,
    prominenceFt: 861,
    range: 'Presidential Range',
    country: 'USA',
    description:
      'Second-highest peak in New England — a rugged Presidential summit of alpine rock between Madison and Jefferson on the Presidential Traverse.',
    firstAscent: '1840s',
    difficulty: 'Class 2 hike',
    aliases: ['Mount Adams', 'Adams (Presidentials)'],
    bestSeason: 'Jun–Oct',
    whyNotable:
      'Second-highest peak in New England; key Presidential Range alpine summit.',
    seoMetaDescription: seo(
      'Explore Mt. Adams (NH) on a 3D map — second-highest New England peak, Presidential Range alpine topography, elevation, and Pinkham Notch staging.',
    ),
    nearestTown: {
      name: 'Gorham',
      region: 'New Hampshire',
      distanceMiles: 11,
      route: 'NH-16',
      lat: 44.3878,
      lon: -71.1731,
    },
    nearbyPlaces: [
      {
        name: 'Gorham',
        region: 'New Hampshire',
        distanceMiles: 11,
        route: 'NH-16',
        lat: 44.3878,
        lon: -71.1731,
      },
      {
        name: 'Pinkham Notch',
        region: 'New Hampshire',
        distanceMiles: 9,
        route: 'NH-16',
        lat: 44.2573,
        lon: -71.2531,
      },
    ],
    afterId: 'madison',
  },
  {
    id: 'boundary',
    name: 'Boundary Peak',
    lat: 37.8465,
    lon: -118.3513,
    elevationFt: 13140,
    prominenceFt: 253,
    range: 'White Mountains',
    country: 'USA',
    description:
      'Nevada’s state high point on the California border — a rocky Class 2 scramble often approached with neighboring Montgomery Peak.',
    firstAscent: 'Unknown / Indigenous',
    difficulty: 'Class 2 scramble',
    bestSeason: 'Jun–Oct',
    whyNotable:
      'Highest peak in Nevada; sits on the California–Nevada border crest.',
    seoMetaDescription: seo(
      'Explore Boundary Peak on a 3D map — Nevada’s state high point on the White Mountains crest, scramble topography, elevation, and Bishop approaches.',
    ),
    nearestTown: {
      name: 'Bishop',
      region: 'California',
      distanceMiles: 30,
      route: 'US-6',
      lat: 37.3635,
      lon: -118.3951,
    },
    nearbyPlaces: [
      {
        name: 'Bishop',
        region: 'California',
        distanceMiles: 30,
        route: 'US-6',
        lat: 37.3635,
        lon: -118.3951,
      },
      {
        name: 'Benton',
        region: 'California',
        distanceMiles: 18,
        route: 'US-6',
        lat: 37.8191,
        lon: -118.4765,
      },
    ],
    afterId: 'whitemountain',
  },
  {
    id: 'blackelk',
    name: 'Black Elk Peak',
    lat: 43.8661,
    lon: -103.5314,
    elevationFt: 7242,
    prominenceFt: 2911,
    range: 'Black Hills',
    country: 'USA',
    description:
      'South Dakota’s high point (formerly Harney Peak) — a popular Black Hills hike to a stone fire tower with views across the plains.',
    firstAscent: 'Unknown / Indigenous',
    difficulty: 'Class 1 hike',
    aliases: ['Harney Peak'],
    bestSeason: 'May–Oct',
    whyNotable:
      'Highest peak in South Dakota; classic Black Hills fire-tower summit.',
    seoMetaDescription: seo(
      'Explore Black Elk Peak on a 3D map — South Dakota high point in the Black Hills, fire-tower summit topography, elevation, and Custer approaches.',
    ),
    nearestTown: {
      name: 'Custer',
      region: 'South Dakota',
      distanceMiles: 10,
      route: 'SD-87 / Sylvan Lake',
      lat: 43.7666,
      lon: -103.5988,
    },
    nearbyPlaces: [
      {
        name: 'Custer',
        region: 'South Dakota',
        distanceMiles: 10,
        route: 'Sylvan Lake',
        lat: 43.7666,
        lon: -103.5988,
      },
      {
        name: 'Hill City',
        region: 'South Dakota',
        distanceMiles: 12,
        route: 'US-16',
        lat: 43.9325,
        lon: -103.5752,
      },
    ],
    afterId: 'guadalupe',
  },
  {
    id: 'rogers',
    name: 'Mt. Rogers',
    lat: 36.6598,
    lon: -81.5448,
    elevationFt: 5729,
    prominenceFt: 2449,
    range: 'Blue Ridge Mountains',
    country: 'USA',
    description:
      'Virginia’s high point in the Mount Rogers massif — a spruce-fir Appalachian summit reached via the Appalachian Trail from Elk Garden or Grayson Highlands.',
    firstAscent: 'Unknown / Indigenous',
    difficulty: 'Class 1 hike',
    aliases: ['Mount Rogers'],
    bestSeason: 'May–Oct',
    whyNotable:
      'Highest peak in Virginia; Appalachian Trail destination near Grayson Highlands.',
    seoMetaDescription: seo(
      'Explore Mt. Rogers on a 3D map — Virginia’s high point on the Appalachian Trail, Blue Ridge topography, elevation, and Grayson Highlands approaches.',
    ),
    nearestTown: {
      name: 'Damascus',
      region: 'Virginia',
      distanceMiles: 22,
      route: 'US-58 / Elk Garden',
      lat: 36.6337,
      lon: -81.7837,
    },
    nearbyPlaces: [
      {
        name: 'Damascus',
        region: 'Virginia',
        distanceMiles: 22,
        route: 'US-58',
        lat: 36.6337,
        lon: -81.7837,
      },
      {
        name: 'Marion',
        region: 'Virginia',
        distanceMiles: 25,
        route: 'VA-16',
        lat: 36.8346,
        lon: -81.5148,
      },
    ],
    afterId: 'oldrag',
  },
]

async function fetchJson(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
  })
  if (!res.ok) throw new Error(`${res.status} ${url}`)
  return res.json()
}

function pageToPhoto(page) {
  if (page.missing != null || page.invalid != null) return null
  const info = page.imageinfo?.[0]
  if (!info) return null
  const mime = info.mime ?? ''
  if (!mime.startsWith('image/') || /svg|djvu|tif/i.test(mime)) return null
  if ((info.width ?? 0) < 700 || (info.height ?? 0) < 400) return null
  const meta = info.extmetadata ?? {}
  return {
    url: info.thumburl || info.url,
    credit: String(meta.Artist?.value || 'Unknown')
      .replace(/<[^>]+>/g, '')
      .slice(0, 80),
    license: String(
      meta.LicenseShortName?.value || meta.License?.value || 'Unknown',
    ).replace(/<[^>]+>/g, ''),
    sourceUrl: info.descriptionurl || info.url,
    title: page.title || '',
    width: info.width,
    height: info.height,
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
}

function slimPhoto(photo) {
  return {
    url: photo.url,
    credit: photo.credit,
    license: photo.license,
    sourceUrl: photo.sourceUrl,
  }
}

function nameTokens(peak) {
  return [peak.name, peak.id, ...(peak.aliases || [])]
    .join(' ')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length >= 4 && !['mount', 'peak', 'mountain'].includes(t))
}

function photoLooksLikePeak(peak, photo) {
  const hay = `${photo.title || ''} ${photo.url} ${photo.sourceUrl}`.toLowerCase()
  const tokens = nameTokens(peak)
  return tokens.some((t) => hay.includes(t))
}

async function assertImageLoads(url) {
  const res = await fetch(url, {
    method: 'GET',
    headers: { 'User-Agent': UA, Range: 'bytes=0-1023' },
    redirect: 'follow',
  })
  if (!res.ok && res.status !== 206) {
    throw new Error(`image HTTP ${res.status}`)
  }
  const ct = res.headers.get('content-type') || ''
  if (!ct.startsWith('image/')) {
    throw new Error(`not an image content-type: ${ct}`)
  }
}

async function photosFor(peak) {
  const curated = await resolveFileTitles(CURATED[peak.id] || [])
  const out = []
  for (const ph of curated) {
    if (out.length >= 2) break
    if (!photoLooksLikePeak(peak, ph)) {
      console.warn(`  skip curated (name mismatch): ${ph.title}`)
      continue
    }
    try {
      await assertImageLoads(ph.url)
    } catch (err) {
      console.warn(`  skip curated (load fail): ${ph.title} — ${err.message}`)
      continue
    }
    out.push(slimPhoto(ph))
    console.log(`  ok photo: ${ph.title} (${ph.width}×${ph.height})`)
  }
  return out
}

const peaks = JSON.parse(readFileSync(peaksPath, 'utf8'))
const added = []
const failed = []

for (const draft of NEW_PEAKS) {
  if (peaks.some((p) => p.id === draft.id)) {
    console.log(`skip existing ${draft.id}`)
    continue
  }
  console.log(`\nphotos ${draft.id}…`)
  const photos = await photosFor(draft)
  if (photos.length < 1) {
    console.error(`NO VALID PHOTOS for ${draft.id}`)
    failed.push(draft.id)
    continue
  }
  if (photos.length < 2) {
    console.warn(`  only ${photos.length} validated photo for ${draft.id}`)
  }

  const { afterId, trails, ...rest } = draft
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
    trails: trails || [],
    photo: photos[0],
    photos,
  }

  let idx = peaks.findIndex((p) => p.id === afterId)
  if (idx < 0) idx = peaks.length - 1
  peaks.splice(idx + 1, 0, peak)
  added.push(draft.id)
  await new Promise((r) => setTimeout(r, 300))
}

writeFileSync(peaksPath, `${JSON.stringify(peaks, null, 2)}\n`)
console.log(
  `\nDone. added=${added.length}: ${added.join(', ') || '(none)'} · failed=${failed.join(', ') || '(none)'} · total=${peaks.length}`,
)
if (failed.length) process.exitCode = 1
