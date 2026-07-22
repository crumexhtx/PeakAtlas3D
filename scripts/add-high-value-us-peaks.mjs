/**
 * One-shot: add remaining high-value US peaks + Commons photos.
 * Run: node scripts/add-high-value-us-peaks.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const peaksPath = join(root, 'src', 'data', 'peaks.json')
const UA = 'PeakAtlas3D/0.2 (https://peakatlas3d.com; catalog enrich)'

/** Hand-picked Commons files known to depict the named summit. */
const CURATED = {
  massive: [
    'File:Mount Massive.jpg',
    'File:Mt. Massive from the north.jpg',
  ],
  quandary: [
    'File:Quandary Peak.jpg',
    'File:Quandary Peak CO.jpg',
  ],
  grays: [
    'File:Grays and Torreys Peaks.jpg',
    'File:Grays Peak Colorado.jpg',
  ],
  torreys: [
    'File:Torreys Peak.jpg',
    'File:Grays and Torreys Peaks.jpg',
  ],
  bierstadt: [
    'File:Mount Bierstadt.jpg',
    'File:Mt Bierstadt from Guanella Pass.jpg',
  ],
  maroon: [
    'File:Maroon Bells.jpg',
    'File:Maroon Peak.jpg',
  ],
  southsister: [
    'File:South Sister Oregon.jpg',
    'File:South Sister from Sparks Lake.jpg',
  ],
  olympus: [
    'File:Mount Olympus Washington.jpg',
    'File:Mt Olympus from Hurricane Ridge.jpg',
  ],
  borah: [
    'File:Borah Peak.jpg',
    'File:Mount Borah Idaho.jpg',
  ],
  wheeler: [
    'File:Wheeler Peak Nevada.jpg',
    'File:Wheeler Peak Great Basin NP.jpg',
  ],
  kuwohi: [
    'File:Clingmans Dome.jpg',
    'File:Clingmans Dome observation tower.jpg',
  ],
  haleakala: [
    'File:Haleakala crater.jpg',
    'File:Haleakalā.jpg',
  ],
}

const NEW_PEAKS = [
  {
    id: 'massive',
    name: 'Mt. Massive',
    lat: 39.1875,
    lon: -106.4754,
    elevationFt: 14421,
    prominenceFt: 1961,
    range: 'Sawatch Range',
    country: 'USA',
    description:
      'Colorado’s second-highest summit and Elbert’s massive Sawatch neighbor — a long Class 2 ridge walk with broad alpine views above Leadville.',
    firstAscent: '1873',
    difficulty: 'Class 2 hike',
    aliases: ['Mount Massive'],
    bestSeason: 'Jun–Sep',
    whyNotable:
      'Second-highest peak in the Rocky Mountains; classic paired outing with Mt. Elbert.',
    seoMetaDescription:
      'Explore Mt. Massive on a 3D map — Colorado’s #2 Rockies summit, Sawatch ridge topography, elevation stats, and Leadville approaches.',
    nearestTown: {
      name: 'Leadville',
      region: 'Colorado',
      distanceMiles: 12,
      route: 'US-24 / Halfmoon Creek',
      lat: 39.2508,
      lon: -106.2925,
    },
    nearbyPlaces: [
      {
        name: 'Leadville',
        region: 'Colorado',
        distanceMiles: 12,
        route: 'US-24 / Halfmoon Creek',
        lat: 39.2508,
        lon: -106.2925,
      },
      {
        name: 'Twin Lakes',
        region: 'Colorado',
        distanceMiles: 14,
        route: 'CO-82',
        lat: 39.0828,
        lon: -106.3817,
      },
    ],
    afterId: 'elbert',
  },
  {
    id: 'quandary',
    name: 'Quandary Peak',
    lat: 39.3973,
    lon: -106.1065,
    elevationFt: 14265,
    prominenceFt: 1125,
    range: 'Tenmile Range',
    country: 'USA',
    description:
      'One of Colorado’s most climbed 14ers — a straightforward East Ridge hike from the Blue Lakes / Quandary trailhead near Breckenridge.',
    firstAscent: '1860s',
    difficulty: 'Class 1–2 hike',
    bestSeason: 'Jun–Sep',
    whyNotable:
      'Among the most frequently summited Colorado 14ers; a classic day-hike introduction.',
    seoMetaDescription:
      'Explore Quandary Peak on a 3D map — popular Colorado 14er near Breckenridge, East Ridge topography, elevation, and Tenmile approaches.',
    nearestTown: {
      name: 'Breckenridge',
      region: 'Colorado',
      distanceMiles: 8,
      route: 'CO-9',
      lat: 39.4817,
      lon: -106.0384,
    },
    nearbyPlaces: [
      {
        name: 'Breckenridge',
        region: 'Colorado',
        distanceMiles: 8,
        route: 'CO-9',
        lat: 39.4817,
        lon: -106.0384,
      },
      {
        name: 'Frisco',
        region: 'Colorado',
        distanceMiles: 12,
        route: 'I-70',
        lat: 39.5744,
        lon: -106.0975,
      },
    ],
    afterId: 'pikes',
  },
  {
    id: 'grays',
    name: 'Grays Peak',
    lat: 39.6339,
    lon: -105.8175,
    elevationFt: 14278,
    prominenceFt: 2779,
    range: 'Front Range',
    country: 'USA',
    description:
      'Highest peak on the Continental Divide in Colorado and a classic Front Range day outing, often paired with neighboring Torreys Peak.',
    firstAscent: '1861',
    difficulty: 'Class 1–2 hike',
    aliases: ['Gray’s Peak'],
    bestSeason: 'Jun–Sep',
    whyNotable:
      'Highest Continental Divide summit in Colorado; paired day hike with Torreys.',
    seoMetaDescription:
      'Explore Grays Peak on a 3D map — Colorado Continental Divide 14er, Front Range topography, elevation stats, and Bakerville approaches.',
    nearestTown: {
      name: 'Georgetown',
      region: 'Colorado',
      distanceMiles: 14,
      route: 'I-70 / Stevens Gulch',
      lat: 39.7061,
      lon: -105.6975,
    },
    nearbyPlaces: [
      {
        name: 'Georgetown',
        region: 'Colorado',
        distanceMiles: 14,
        route: 'I-70 / Stevens Gulch',
        lat: 39.7061,
        lon: -105.6975,
      },
      {
        name: 'Idaho Springs',
        region: 'Colorado',
        distanceMiles: 22,
        route: 'I-70',
        lat: 39.7425,
        lon: -105.5136,
      },
    ],
    afterId: 'longs',
  },
  {
    id: 'torreys',
    name: 'Torreys Peak',
    lat: 39.6426,
    lon: -105.8212,
    elevationFt: 14267,
    prominenceFt: 560,
    range: 'Front Range',
    country: 'USA',
    description:
      'Grays Peak’s twin on the Continental Divide — usually climbed together via the Grays/Torreys trail from Stevens Gulch.',
    firstAscent: '1861',
    difficulty: 'Class 2 hike',
    aliases: ["Torrey's Peak"],
    bestSeason: 'Jun–Sep',
    whyNotable:
      'Iconic paired 14er with Grays; one of Colorado’s most popular Front Range days.',
    seoMetaDescription:
      'Explore Torreys Peak on a 3D map — Colorado Front Range 14er beside Grays, Continental Divide topography, and Stevens Gulch approaches.',
    nearestTown: {
      name: 'Georgetown',
      region: 'Colorado',
      distanceMiles: 14,
      route: 'I-70 / Stevens Gulch',
      lat: 39.7061,
      lon: -105.6975,
    },
    nearbyPlaces: [
      {
        name: 'Georgetown',
        region: 'Colorado',
        distanceMiles: 14,
        route: 'I-70 / Stevens Gulch',
        lat: 39.7061,
        lon: -105.6975,
      },
      {
        name: 'Idaho Springs',
        region: 'Colorado',
        distanceMiles: 22,
        route: 'I-70',
        lat: 39.7425,
        lon: -105.5136,
      },
    ],
    afterId: 'grays',
  },
  {
    id: 'bierstadt',
    name: 'Mt. Bierstadt',
    lat: 39.5828,
    lon: -105.6686,
    elevationFt: 14060,
    prominenceFt: 720,
    range: 'Front Range',
    country: 'USA',
    description:
      'A popular beginner Colorado 14er above Guanella Pass — short approach, Class 2 West Slopes, and big views toward the Sawtooth and Mt. Evans.',
    firstAscent: '1863',
    difficulty: 'Class 2 hike',
    aliases: ['Mount Bierstadt'],
    bestSeason: 'Jun–Sep',
    whyNotable:
      'One of Colorado’s most accessible and heavily climbed beginner 14ers.',
    seoMetaDescription:
      'Explore Mt. Bierstadt on a 3D map — popular Colorado 14er from Guanella Pass, Front Range topography, elevation, and Georgetown staging.',
    nearestTown: {
      name: 'Georgetown',
      region: 'Colorado',
      distanceMiles: 11,
      route: 'Guanella Pass',
      lat: 39.7061,
      lon: -105.6975,
    },
    nearbyPlaces: [
      {
        name: 'Georgetown',
        region: 'Colorado',
        distanceMiles: 11,
        route: 'Guanella Pass',
        lat: 39.7061,
        lon: -105.6975,
      },
      {
        name: 'Idaho Springs',
        region: 'Colorado',
        distanceMiles: 18,
        route: 'I-70',
        lat: 39.7425,
        lon: -105.5136,
      },
    ],
    afterId: 'torreys',
  },
  {
    id: 'maroon',
    name: 'Maroon Peak',
    lat: 39.0708,
    lon: -106.989,
    elevationFt: 14156,
    prominenceFt: 2336,
    range: 'Elk Mountains',
    country: 'USA',
    description:
      'The higher Maroon Bell — a Class 3 South Ridge classic above Maroon Lake and one of Colorado’s most photographed mountain pairs.',
    firstAscent: '1890s',
    difficulty: 'Class 3 scramble',
    aliases: ['South Maroon', 'Maroon Bells'],
    bestSeason: 'Jul–Sep',
    whyNotable:
      'Postcard Maroon Bells summit; among Colorado’s most iconic Elk Mountain 14ers.',
    seoMetaDescription:
      'Explore Maroon Peak on a 3D map — Maroon Bells 14er above Aspen, Elk Mountains topography, elevation stats, and Maroon Lake approaches.',
    nearestTown: {
      name: 'Aspen',
      region: 'Colorado',
      distanceMiles: 12,
      route: 'CO-82 / Maroon Creek',
      lat: 39.1911,
      lon: -106.8175,
    },
    nearbyPlaces: [
      {
        name: 'Aspen',
        region: 'Colorado',
        distanceMiles: 12,
        route: 'CO-82 / Maroon Creek',
        lat: 39.1911,
        lon: -106.8175,
      },
      {
        name: 'Snowmass Village',
        region: 'Colorado',
        distanceMiles: 15,
        route: 'CO-82',
        lat: 39.213,
        lon: -106.9378,
      },
    ],
    afterId: 'pyramid',
  },
  {
    id: 'southsister',
    name: 'South Sister',
    lat: 44.1035,
    lon: -121.7692,
    elevationFt: 10358,
    prominenceFt: 5588,
    range: 'Cascade Range',
    country: 'USA',
    description:
      'Oregon’s highest Cascade volcano and the state’s most popular high summit hike — a long climber’s trail from the Devils Lake / Green Lakes area near Bend.',
    firstAscent: '1857',
    difficulty: 'Strenuous scramble / non-technical',
    aliases: ['Faith'],
    bestSeason: 'Jul–Sep',
    whyNotable:
      'Highest peak in Oregon’s Cascades and the most climbed Oregon volcano.',
    seoMetaDescription:
      'Explore South Sister on a 3D map — Oregon Cascade high point, climber-trail topography, elevation stats, and Bend / Devils Lake approaches.',
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
        distanceMiles: 26,
        route: 'US-20',
        lat: 44.2909,
        lon: -121.5493,
      },
    ],
    afterId: 'hood',
  },
  {
    id: 'olympus',
    name: 'Mt. Olympus',
    lat: 47.8014,
    lon: -123.7106,
    elevationFt: 7969,
    prominenceFt: 7838,
    range: 'Olympic Mountains',
    country: 'USA',
    description:
      'The glaciated high point of Olympic National Park — a multi-day wilderness approach to the Blue Glacier and West Peak, not a valley day hike.',
    firstAscent: '1907',
    difficulty: 'Glacier climb / expedition backpack',
    aliases: ['Mount Olympus'],
    bestSeason: 'Jul–Sep',
    whyNotable:
      'Signature summit of Olympic National Park and Washington’s wet-side alpine icon.',
    seoMetaDescription:
      'Explore Mt. Olympus on a 3D map — Olympic National Park high point, Blue Glacier topography, elevation, and Port Angeles wilderness approaches.',
    nearestTown: {
      name: 'Port Angeles',
      region: 'Washington',
      distanceMiles: 35,
      route: 'US-101 / Hoh / Blue Glacier approaches',
      lat: 48.1181,
      lon: -123.4307,
    },
    nearbyPlaces: [
      {
        name: 'Port Angeles',
        region: 'Washington',
        distanceMiles: 35,
        route: 'US-101',
        lat: 48.1181,
        lon: -123.4307,
      },
      {
        name: 'Forks',
        region: 'Washington',
        distanceMiles: 42,
        route: 'US-101 / Hoh River',
        lat: 47.9504,
        lon: -124.3854,
      },
    ],
    afterId: 'baker',
  },
  {
    id: 'borah',
    name: 'Borah Peak',
    lat: 44.1374,
    lon: -113.7811,
    elevationFt: 12662,
    prominenceFt: 5982,
    range: 'Lost River Range',
    country: 'USA',
    description:
      'Idaho’s high point — a steep Class 3 Chicken-Out Ridge scramble above Mackay with big Lost River Range exposure.',
    firstAscent: '1912',
    difficulty: 'Class 3 scramble',
    aliases: ['Mount Borah'],
    bestSeason: 'Jul–Sep',
    whyNotable:
      'Idaho state high point and a classic western Class 3 scramble.',
    seoMetaDescription:
      'Explore Borah Peak on a 3D map — Idaho high point, Chicken-Out Ridge topography, elevation stats, and Mackay approaches.',
    nearestTown: {
      name: 'Mackay',
      region: 'Idaho',
      distanceMiles: 22,
      route: 'US-93 / Birch Springs',
      lat: 43.9113,
      lon: -113.6134,
    },
    nearbyPlaces: [
      {
        name: 'Mackay',
        region: 'Idaho',
        distanceMiles: 22,
        route: 'US-93 / Birch Springs',
        lat: 43.9113,
        lon: -113.6134,
      },
      {
        name: 'Challis',
        region: 'Idaho',
        distanceMiles: 40,
        route: 'US-93',
        lat: 44.5046,
        lon: -114.2317,
      },
    ],
    afterId: 'granitet',
  },
  {
    id: 'wheeler',
    name: 'Wheeler Peak',
    lat: 38.9859,
    lon: -114.3139,
    elevationFt: 13063,
    prominenceFt: 7563,
    range: 'Snake Range',
    country: 'USA',
    description:
      'Great Basin National Park’s alpine high point — a long trail above bristlecone forests and Nevada’s scenic Snake Range crest.',
    firstAscent: 'Unknown',
    difficulty: 'Class 1–2 hike',
    bestSeason: 'Jun–Oct',
    whyNotable:
      'Nevada’s iconic Great Basin summit and one of the state’s highest peaks.',
    seoMetaDescription:
      'Explore Wheeler Peak on a 3D map — Great Basin National Park high point, Snake Range topography, elevation, and Baker NV approaches.',
    nearestTown: {
      name: 'Baker',
      region: 'Nevada',
      distanceMiles: 12,
      route: 'NV-487 / Wheeler Peak Scenic Drive',
      lat: 39.0127,
      lon: -114.1225,
    },
    nearbyPlaces: [
      {
        name: 'Baker',
        region: 'Nevada',
        distanceMiles: 12,
        route: 'NV-487',
        lat: 39.0127,
        lon: -114.1225,
      },
      {
        name: 'Ely',
        region: 'Nevada',
        distanceMiles: 68,
        route: 'US-50 / US-93',
        lat: 39.2474,
        lon: -114.8886,
      },
    ],
    afterId: 'timpanogos',
  },
  {
    id: 'kuwohi',
    name: 'Kuwohi',
    lat: 35.5628,
    lon: -83.4985,
    elevationFt: 6643,
    prominenceFt: 4503,
    range: 'Great Smoky Mountains',
    country: 'USA',
    description:
      'The highest point in Great Smoky Mountains National Park (formerly Clingmans Dome) — a short paved path to the famous observation tower on the Tennessee–North Carolina crest.',
    firstAscent: 'Unknown',
    difficulty: 'Class 1 paved walk',
    aliases: ['Clingmans Dome', "Clingman's Dome"],
    bestSeason: 'Apr–Nov (road season varies)',
    whyNotable:
      'Smokies high point and one of the most visited summits in the eastern United States.',
    seoMetaDescription:
      'Explore Kuwohi (Clingmans Dome) on a 3D map — Great Smoky Mountains high point, observation-tower topography, elevation, and Gatlinburg approaches.',
    nearestTown: {
      name: 'Gatlinburg',
      region: 'Tennessee',
      distanceMiles: 22,
      route: 'US-441 / Clingmans Dome Rd',
      lat: 35.7143,
      lon: -83.5102,
    },
    nearbyPlaces: [
      {
        name: 'Gatlinburg',
        region: 'Tennessee',
        distanceMiles: 22,
        route: 'US-441',
        lat: 35.7143,
        lon: -83.5102,
      },
      {
        name: 'Cherokee',
        region: 'North Carolina',
        distanceMiles: 20,
        route: 'US-441',
        lat: 35.4743,
        lon: -83.3157,
      },
    ],
    afterId: 'mitchell',
  },
  {
    id: 'haleakala',
    name: 'Haleakalā',
    lat: 20.7097,
    lon: -156.2533,
    elevationFt: 10023,
    prominenceFt: 10023,
    range: 'Hawaiian Islands',
    country: 'USA',
    description:
      'Maui’s shield-volcano high point and Haleakalā National Park’s summit — road-accessible crater rim with Sliding Sands and Halemauʻu wilderness trails into the crater.',
    firstAscent: 'Unknown',
    difficulty: 'Drive / Class 1–2 hike',
    aliases: ['Haleakala', 'East Maui Volcano'],
    bestSeason: 'Year-round (summit is cold; storms year-round)',
    whyNotable:
      'Maui’s iconic volcano and one of Hawaii’s most visited national-park summits.',
    seoMetaDescription:
      'Explore Haleakalā on a 3D map — Maui volcano high point, crater-rim topography, elevation stats, and Haleakalā National Park approaches.',
    nearestTown: {
      name: 'Kahului',
      region: 'Hawaii',
      distanceMiles: 28,
      route: 'HI-37 / Crater Rd',
      lat: 20.8893,
      lon: -156.4729,
    },
    nearbyPlaces: [
      {
        name: 'Kahului',
        region: 'Hawaii',
        distanceMiles: 28,
        route: 'HI-37 / Crater Rd',
        lat: 20.8893,
        lon: -156.4729,
      },
      {
        name: 'Pukalani',
        region: 'Hawaii',
        distanceMiles: 18,
        route: 'HI-37',
        lat: 20.8367,
        lon: -156.3367,
      },
    ],
    afterId: 'maunakea',
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

async function searchPhotos(query, limit = 6) {
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
  const hay = `${photo.url} ${photo.sourceUrl} ${photo.credit}`.toLowerCase()
  const tokens = [peak.name, peak.id, ...(peak.aliases || [])]
    .join(' ')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length >= 4)
  return tokens.some((t) => hay.includes(t))
}

async function photosFor(peak) {
  const curated = await resolveFileTitles(CURATED[peak.id] || [])
  const out = [...curated]
  if (out.length >= 2) return out.slice(0, 2)

  const queries = [
    `${peak.name} ${peak.nearestTown.region}`,
    `${peak.name} mountain`,
    ...(peak.aliases || []).map((a) => `${a} ${peak.nearestTown.region}`),
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
