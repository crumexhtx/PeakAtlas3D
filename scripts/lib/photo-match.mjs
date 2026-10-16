/**
 * Commons photo matching: geo distance first, curated allow-list second.
 * Name-only matches are never enough.
 */
import { haversineKm } from './catalog-plausibility.mjs'

export const PHOTO_TARGET = 2
export const GEO_MAX_KM = 15
export const GEOSEARCH_RADIUS_M = 10_000
export const LANDSCAPE_MIN_RATIO = 1.3
export const THUMB_WIDTH = 960

const UA = 'PeakAtlas3D/0.3 (https://peakatlas3d.com; photo validator)'

/** Commons file titles known to show the correct mountain. */
export const PHOTO_ALLOWLIST = {
  columbia: [
    'File:Mt. Columbia from Columbia Icefield bivy for the Twins et al.jpg',
    'File:Columbia Icefield viewed from the Columbia Icefield Discovery Centre.jpg',
  ],
  kings: [
    'File:Kings Peak, Uinta Mountains, Duchesne County, Utah, USA 01.jpg',
    'File:Kings Peak, Uinta Mountains, Duchesne County, Utah, USA 02.jpg',
  ],
  logan: [
    'File:Mount Logan.jpg',
    'File:Mount Logan Knife ridge, east ridge by Christian Stangl (flickr).jpg',
  ],
  cook: [
    'File:Mount Cook from Kea Point 03.jpg',
    'File:00 1286 New Zealand Alps - Mount Cook (Māori "Aoraki").jpg',
  ],
  washington: [
    'File:The Mount Washington and the Presidential Range, Bretton Woods, White Mts., N. H (63848).jpg',
    'File:Mount Washington Cog Railway October 2021 024.jpg',
  ],
  capitol: [
    'File:Mt. Daly and Capitol Peak.jpg',
    'File:Capitol Peak CO arete.jpg',
  ],
  baker: [
    'File:Mount baker washington.jpg',
    'File:Mount Baker from Keep Kool Butte.jpeg',
  ],
  granitet: [
    'File:Granite Peak Montana.jpg',
    'File:Granite Peak Montana 2.jpg',
  ],
  gannett: [
    'File:Wind River Range Gannett Peak Green River Basin Wy PICT0033 19941023.jpg',
  ],
  longs: [
    'File:Longs Peak from the Dream Lake trail at sunrise, Rocky Mountain National Park, Colorado, USA.jpg',
    'File:Meeker, Longs, Lady Washington.jpg',
  ],
  guadalupe: [
    'File:Guadalupe Mountains and El Capitan 2006.jpg',
    'File:Guadalupe Peak and El Capitan from ridge.JPG',
  ],
  robson: [
    'File:Mount Robson 08122005.jpg',
    'File:Mount Robson panorama.jpg',
  ],
  illimani: [
    'File:Illimani - Cordillera Real.jpg',
    'File:Illimani with the full moon rising overhead.jpg',
  ],
  annapurna: [
    'File:Annapurna Massif Panorama.jpg',
    'File:Sunrise Annapurna Pokhara Nepal Feb13 DSC 1583.jpg',
  ],
  ama: [
    'File:Ama Dablam, Nepal.jpg',
    'File:Ama Dablam and the Himalayas, Mountains of Nepal.jpg',
  ],
  tasman: [
    'File:Mount Tasman and Torres Peak.jpg',
    'File:Mount Aoraki (Mt. Cook) & Mount Tasman - Lake Matheson (New Zealand).jpg',
  ],
  musala: ['File:Musala peak.jpg', 'File:Musala and Malka Musala.jpg'],
  halti: ['File:Haltitunturi.jpg', 'File:Suomen korkeimmat tunturit.jpg'],
  sidley: [
    'File:Mount Sidley - Antarctica’s Tallest Volcano.jpg',
    'File:MountSidleyCaldera.jpg',
  ],
  grandteton: [
    'File:Adams The Tetons and the Snake River.jpg',
    'File:Willow Flats area and Teton Range in Grand Teton National Park.jpg',
  ],
  monterosa: [
    'File:Dufourspitze (Monte Rosa) and Monte Rosa Glacier as seen from Gornergrat, Wallis, Switzerland, 2012 August.jpg',
    'File:Aerial image of the Monte Rosa east face (view from the east).jpg',
  ],
  weisshorn: ['File:Weisshorn from Rothorn.jpg', 'File:Weisshorn.jpg'],
  dom: [
    'File:Dom (mountain).jpg',
    'File:Dom, Täschhorn and Alphubel (15089083580).jpg',
  ],
  dentblanche: [
    'File:Dent Blanche.jpg',
    'File:Ober Gabelhorn, Zinalrothorn and Dent Blanche (15232269129).jpg',
  ],
  pizbernina: ['File:Piz Bernina.jpg', 'File:Piz Bernina Aug 2008 close.jpg'],
  granparadiso: [
    'File:Gran Paradiso dalla Valsavarenche.JPG',
    'File:Gran Paradiso.jpg',
  ],
  cimaggrande: [
    'File:Drei Zinnen Tre Cime di Lavaredo Dolomites.jpg',
    'File:Drei Zinnen 1.jpg',
  ],
  bennevis: [
    'File:North face of Ben Nevis.jpg',
    'File:North-east face of Ben Nevis - geograph.org.uk - 7870856.jpg',
  ],
  snowdon: [
    'File:Yr Wyddfa (Snowdon) from Crib Goch, Parc Cenedlaethol Eryri National Park, Cymru (Wales) 03.jpg',
    'File:Snowdon from Llyn Llydaw.jpg',
  ],
  scafellpike: [
    'File:Scafell Pike.jpg',
    'File:Great Gable and Scafell Pike - geograph.org.uk - 2518813.jpg',
  ],
  carrauntoohil: [
    'File:Carrauntoohil Group from Cruach Mhor.jpg',
    'File:Carrauntoohil, Beenkeragh Ridge, Caher.jpg',
  ],
  gerlach: [
    'File:Gerlachovský štít od Veľkého Slavkova.jpg',
    'File:Gerlachovsky stit from Velicka dolina.jpg',
  ],
  etna: [
    'File:View of Mount Etna from Reggio Calabria - Italy - 10 Feb. 2017 - (1).jpg',
    'File:Messina Canyon-Etna-Volcano-Sicily-Italy - Creative Commons by gnuckx (3493037353).jpg',
  ],
  vesuvius: ['File:Vesuvius from Pompeii.jpg', 'File:Mount Vesuvius.jpg'],
  slide: [
    'File:2025-07-21 14 08 27 View west toward the summit of Slide Mountain from the Wittenberg-Cornell-Slide Trail (Burroughs Range Trail) just west of the summit of Cornell Mountain in Shandaken, Ulster County, New York.jpg',
    'File:2025-07-21 14 09 24 View west toward the summit of Slide Mountain from the Wittenberg-Cornell-Slide Trail (Burroughs Range Trail) just west of the summit of Cornell Mountain in Shandaken, Ulster County, New York.jpg',
  ],
  hunterny: [
    'File:Hunter Mountain - from tower.jpg',
    'File:Hunter Mountain Summit.jpg',
  ],
  blackdome: [
    'File:Eastern side of Black Dome.jpg',
    'File:Blackhead Range.jpg',
  ],
  blackhead: [
    'File:Blackhead Mountain from Black Dome.jpg',
    'File:Blackhead Range from Buck Ridge Lookout in autumn.jpg',
  ],
  westkill: [
    'File:West Kill and Spruceton Road.jpg',
    "File:Steep, rocky section of Devil's Path on West Kill Mountain, Spruceton, NY.jpg",
  ],
  kilimanjaro: [
    'File:Kilimanjaro from Amboseli.jpg',
    'File:Amboseli National Park and Mt. Kilimanjaro.jpg',
  ],
  langley: [
    'File:MountLangley.jpg',
    'File:Langley Cloud Kingdom (3854812689).jpg',
  ],
  aspiring: [
    'File:Mount Aspiring, Otago, New Zealand, 22 July 2005.jpg',
    'File:Mount Aspiring, New Zealand (Unsplash).jpg',
  ],
  gasherbrum2: [
    'File:Gasherbrum group.JPG',
    'File:Broad Peak and Gasherbrums from K2.jpg',
  ],
  vinson: [
    'File:Mount Vinson from NW at Vinson Plateau by Christian Stangl (flickr).jpg',
    'File:Vinson-Massif.jpg',
  ],
  mulhacen: [
    'File:El Mulhacén desde el Veleta.JPG',
    'File:Mulhacen north face.JPG',
  ],
  cadairidris: [
    'File:Llyn Cau and Cadair Idris - geograph.org.uk - 2391358.jpg',
    'File:Cadair Idris from Llyn Cau (geograph 3295810).jpg',
  ],
  sandia: [
    'File:Sandia Mountain Peak.jpg',
    'File:Sandia Crest, Albuquerque PP AB.JPG',
  ],
  gasherbrum1: [
    'File:Gasherbrum I.jpg',
    'File:Gasherbrum I SW.jpg',
  ],
  stok: [
    'File:Stok Kangri western flank.jpg',
    'File:StokKangri.jpg',
  ],
  galdhopiggen: [
    'File:Svellnosbrean and Galdhøpiggen in Jotunheimen.jpg',
    'File:Galdhopiggen 2004.jpg',
  ],
  olympus: [
    'File:Mount Olympus from Litochoro.jpg',
    'File:Mount Olympus, Greece.png',
  ],
  cloudpeak: [
    'File:Cloud Peak from near Tensleep WY2.jpg',
    'File:Cloud Peak from near Tensleep WY1.jpg',
  ],
  kosciuszko: [
    'File:Looking Towarwards Mt. Kosciuszko from Charlotte\'s Pass.jpg',
    'File:Mount Kosciuszko Summit walk, Kosciuszko National Park 02.jpg',
  ],
  kuwohi: [
    'File:Clingmans Dome Sevierville TN.jpg',
    "File:Clingman's Dome.JPG",
  ],
  hallasan: [
    'File:Mount Hallasan.jpg',
    'File:Hallasan Volcanic Crater.jpg',
  ],
  meru: [
    'File:View of Mount Meru Arusha.jpg',
    'File:Afternoon view of Mount Meru in Arusha.jpg',
  ],
  elbert: [
    'File:Mount Elbert and horses.jpg',
    'File:Mount Elbert and Surrounding Sawatch Range, Colorado (9179291029).jpg',
  ],
  leconte: [
    'File:Mount LeConte viewed from Carlos Campbell Overlook, May 2017.jpg',
    'File:Mount Le Conte (Great Smoky Mountains) 2012.jpg',
  ],
  teide: [
    'File:Teide from Iguegue.jpg',
    'File:Teide von Nordosten (Zuschnitt 1).jpg',
  ],
  popo: [
    'File:Mexico-Popocatepetl.jpg',
    'File:Popocatepetl Volcano - From Atlixco - Puebla - Mexico (52202390932).jpg',
  ],
  aconcagua: [
    'File:Aconcagua (Mendoza) 2022-11 (2).jpg',
    'File:Aconcagua (Mendoza) 2022-11 (1).jpg',
  ],
  charleston: [
    'File:Charleston Peak from Griffith Peak 1.jpg',
    'File:Mount Charleston in Spring Mountains.jpg',
  ],
  shishapangma: [
    'File:Shishapangma in clouds.jpg',
    'File:8,013m Shishapangma Tibet China 西藏 希夏邦马峰 - panoramio.jpg',
  ],
  rasdashen: [
    'File:Ras Dejen Summit.JPG',
    'File:Ras Dejen southward.JPG',
  ],
  montblanc: [
    'File:Mont Blanc from Les Arcs 1950.jpg',
    'File:Glacier du Mont Mallet (Glacier du Géant) & Mont Blanc, 2010 July.jpg',
  ],
  denali: [
    'File:Wonder Lake, Denali.jpg',
    'File:Denali National Park Wonder Lake 3264px.jpg',
  ],
  townsend: ['File:Kosciuszko Townsend.jpg'],
  grossglockner: [
    'File:Grossglockner and Pasterze glacier.jpg',
    'File:Heiligenblut am Großglockner.jpg',
  ],
  fitzroy: [
    'File:Los Glaciares - Fitz Roy 005.jpg',
    'File:Laguna de los Tres color.jpg',
  ],
  benmacdui: [
    'File:Ben Macdui from Derry Cairngorm.jpg',
    'File:Ben Macdui and Derry Cairngorm from flanks of Beinn Mheadhoin - geograph.org.uk - 6062196.jpg',
  ],
  crestoneneedle: [
    'File:Crestone Needle viewed from Humboldt Peak\'s West Ridge.jpg',
    'File:Humboldt Peak & the Crestones - panoramio.jpg',
  ],
  k2: [
    'File:K2 from Concordia.JPG',
    'File:K2 from Concordia - 3.jpg',
  ],
  lonepeak: [
    'File:Lone Peak from FrontRunner, Jul 16.jpg',
    'File:North at Lone Peak in Utah, Aug 17.jpg',
  ],
  bluesky: [
    'File:Road to the Mount Evans Summit. Overlook Echo Lake Park1.jpg',
    'File:Road to the Mount Evans Summit. Overlook Echo Lake Park4.jpg',
  ],
  russell: [
    'File:Mts. Russell and Carillon.jpg',
    'File:Mt Russel from Whitney summit.jpg',
  ],
  sill: [
    'File:Mount Sill, right.jpg',
    'File:Mts. Jepson and Sill.jpg',
  ],
  pfeifferhorn: [
    'File:PfeifferhornNearRidge.JPG',
    'File:Little Cottonwood Ridgeline.jpg',
  ],
  quandary: [
    'File:Quandary Peak, Colorado, USA (14382068790).jpg',
    'File:Mountain goat Quandary Peak.jpg',
  ],
  puncakjaya: [
    'File:Puncakjaya.jpg',
    'File:Carstensz Pyramid.jpg',
  ],
  muztaghata: [
    'File:Muztagh Ata.jpg',
    'File:Muztagh Ata Xinjiang China.jpg',
  ],
  zugspitze: [
    'File:Zugspitze.jpg',
    'File:Blindsee Zugspitze 1.jpg',
    'File:Zugspitze 2005.jpg',
  ],
  breithorn: [
    'File:Breithorn.jpg',
    'File:Breithorn north.jpg',
    'File:Breithorn mountain.jpg',
  ],
  monch: [
    'File:Eiger, Mönch und Jungfrau.jpg',
    'File:360 Jungfrau Mönch.jpg',
  ],
  aneto: ['File:Aneto.jpg', 'File:Aneto 01.jpg', 'File:Cima Pico Aneto.jpg'],
  rysy: ['File:Rysy.jpg', 'File:Rysy from Morskie Oko.jpg'],
  ruapehu: [
    'File:Mount Ruapehu.jpg',
    'File:Ruapehu Crater Panorama.jpg',
  ],
  cameroon: [
    'File:Landscape of Mount Cameroon.jpg',
    'File:Mount Cameroon.jpg',
  ],
  acatenango: [
    'File:Sunset over Fuego and Acatenango volcanoes from Antigua.jpg',
    'File:Erupcion_-_panoramio.jpg',
  ],
  temple: [
    'File:Mt Temple summit.jpg',
    'File:Valley of the Ten Peaks 2021.jpg',
  ],
  lenin: ['File:Lenin Peak.jpg', 'File:Lenini mäetipp.jpg'],
}

export const ALLOW_SINGLE = new Set(['gannett'])

/** Whole-word / substring reject terms (filename + title + source URL). */
const REJECT_TERMS = [
  'map',
  'diagram',
  'geolog',
  'geology',
  'chart',
  'painting',
  'drawing',
  'lithograph',
  'photochrom',
  'stamp',
  'scan',
  'logo',
  'poster',
  'concert',
  'band',
  'festival',
  'sample',
  'specimen',
  'ruler',
  'selfie',
  'summit-stone',
  'summit stone',
  'flag',
  'label',
  'beschriftet',
  'satellite',
  'from space',
  'view of earth',
  'salmon',
  'entrance',
  'headstone',
  'cemetery',
  'highway',
  'downtown',
  'cityscape',
  'thumbnail.jpg',
  'coat of arms',
  'location map',
  'topo map',
  'gps track',
  'orthophoto',
  'helicopter',
  'google art',
  'albert bierstadt',
  'plaque',
  'statue',
  'chapel',
  'museum',
  'inaturalist',
  'caldo',
  'gipfelkreuz',
  'arum',
]

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

export function decodeMaybe(s) {
  try {
    return decodeURIComponent(String(s ?? ''))
  } catch {
    return String(s ?? '')
  }
}

export function norm(s) {
  return decodeMaybe(s)
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function fileHay(photo) {
  // Long Commons filenames use a generic /960px-thumbnail.jpg thumb path;
  // do not treat that MediaWiki quirk as a reject-term hit.
  const url = String(photo.url ?? '')
    .split('?')[0]
    .replace(/\/\d+px-thumbnail\.[a-z0-9]+$/i, '')
  return norm(`${url} ${photo.sourceUrl ?? ''} ${photo.title ?? ''}`)
}

export function matchRejectTerm(photo) {
  const hay = fileHay(photo)
  for (const term of REJECT_TERMS) {
    const n = norm(term)
    if (!n) continue
    const escaped = n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/ /g, '\\s+')
    const re =
      n === 'geolog'
        ? /(?:^|[^a-z])geolog/i
        : new RegExp(`(?:^|[^a-z])${escaped}(?:[^a-z]|$)`, 'i')
    if (re.test(hay)) return term
  }
  return null
}

export function commonsFilename(photo) {
  const fromTitle = String(photo.title ?? '')
  if (/^file:/i.test(fromTitle)) return fromTitle
  const source = decodeMaybe(photo.sourceUrl ?? '')
  const wiki = source.match(/wiki\/(File:[^#?]+)/i)
  if (wiki) return decodeMaybe(wiki[1]).replace(/_/g, ' ')
  const pop = decodeMaybe(String(photo.url ?? '').split('/').pop() ?? '')
  return pop.replace(/^\d+px-/, '')
}

export function isAllowlisted(peakId, photo) {
  const titles = PHOTO_ALLOWLIST[peakId]
  if (!titles?.length) return false
  const file = norm(commonsFilename(photo))
  if (!file) return false
  return titles.some((t) => {
    const n = norm(t.replace(/^file:/i, ''))
    return n && (file.includes(n) || n.includes(file))
  })
}

function parseCoord(value, westSouthNegative) {
  if (value == null || value === '') return null
  if (typeof value === 'number' && Number.isFinite(value)) return value
  const s = String(value).trim()
  const num = Number.parseFloat(s.replace(/,/g, ''))
  if (!Number.isFinite(num)) return null
  if (westSouthNegative && /[SWsw]\b/.test(s)) return -Math.abs(num)
  if (/[SWsw]\b/.test(s)) return -Math.abs(num)
  if (/[NEne]\b/.test(s) && !/[SWsw]\b/.test(s)) return Math.abs(num)
  return num
}

export function photoCoords(photo) {
  if (
    typeof photo.lat === 'number' &&
    Number.isFinite(photo.lat) &&
    typeof photo.lon === 'number' &&
    Number.isFinite(photo.lon)
  ) {
    return { lat: photo.lat, lon: photo.lon }
  }
  const meta = photo.extmetadata ?? {}
  const lat = parseCoord(meta.GPSLatitude?.value ?? meta.gpsLatitude?.value, true)
  const lon = parseCoord(
    meta.GPSLongitude?.value ?? meta.gpsLongitude?.value,
    true,
  )
  if (lat != null && lon != null) return { lat, lon }
  const c = Array.isArray(photo.coordinates) ? photo.coordinates[0] : photo.coordinates
  if (c && Number.isFinite(c.lat) && Number.isFinite(c.lon)) {
    return { lat: c.lat, lon: c.lon }
  }
  return null
}

export function aspectRatio(photo) {
  const w = Number(photo.width)
  const h = Number(photo.height)
  if (!(w > 0) || !(h > 0)) return null
  return w / h
}

export function isLandscape(photo) {
  const ar = aspectRatio(photo)
  return ar != null && ar >= LANDSCAPE_MIN_RATIO
}

export function isPortrait(photo) {
  const ar = aspectRatio(photo)
  return ar != null && ar < 1
}

/**
 * @param {object} peak
 * @param {object} photo
 * @param {{ slot?: number }} [opts] slot 0 = primary
 */
export function photoMatchesPeak(peak, photo, opts = {}) {
  const rejected = matchRejectTerm(photo)
  if (rejected) return { ok: false, reason: `reject-pattern: ${rejected}` }

  const coords = photoCoords(photo)
  const km =
    coords && Number.isFinite(peak.lat) && Number.isFinite(peak.lon)
      ? haversineKm(peak.lat, peak.lon, coords.lat, coords.lon)
      : undefined

  // Curated filenames bypass the 15 km cap (famous viewpoints are often farther).
  if (isAllowlisted(peak.id, photo)) {
    if (opts.slot === 0 && isPortrait(photo)) {
      return { ok: false, reason: 'portrait', km }
    }
    return { ok: true, reason: 'allow-list', km }
  }

  if (coords && Number.isFinite(peak.lat) && Number.isFinite(peak.lon)) {
    if (km > GEO_MAX_KM) {
      return { ok: false, reason: `too-far: ${km.toFixed(0)} km`, km }
    }
    if (opts.slot === 0 && isPortrait(photo)) {
      return { ok: false, reason: 'portrait', km }
    }
    return { ok: true, reason: 'geo', km }
  }

  return { ok: false, reason: 'no-coords' }
}

export function rankPhotos(peak, photos) {
  return [...photos].sort((a, b) => {
    const aLand = isLandscape(a) ? 0 : isPortrait(a) ? 2 : 1
    const bLand = isLandscape(b) ? 0 : isPortrait(b) ? 2 : 1
    if (aLand !== bLand) return aLand - bLand
    const aKm = photoCoords(a)
      ? haversineKm(peak.lat, peak.lon, photoCoords(a).lat, photoCoords(a).lon)
      : 99
    const bKm = photoCoords(b)
      ? haversineKm(peak.lat, peak.lon, photoCoords(b).lat, photoCoords(b).lon)
      : 99
    if (aKm !== bKm) return aKm - bKm
    const aPx = (a.width ?? 0) * (a.height ?? 0)
    const bPx = (b.width ?? 0) * (b.height ?? 0)
    return bPx - aPx
  })
}

export function slimPhoto(ph) {
  const url = thumbUrl(ph.url)
  const coords = photoCoords(ph)
  const out = {
    url,
    credit: ph.credit,
    license: ph.license,
    sourceUrl: ph.sourceUrl,
  }
  if (coords) {
    out.lat = coords.lat
    out.lon = coords.lon
  }
  if (Number.isFinite(ph.width)) out.width = ph.width
  if (Number.isFinite(ph.height)) out.height = ph.height
  return out
}

export function thumbUrl(url, width = THUMB_WIDTH) {
  if (typeof url !== 'string' || !url) return url
  try {
    const u = new URL(url)
    u.search = ''
    if (u.hostname === 'thumb.wikimedia.org') {
      u.hostname = 'upload.wikimedia.org'
    }
    let path = u.pathname
    path = path.replace(
      /(\/lossy-page\d+)-\d+px-([^/]+)$/i,
      `$1-${width}px-$2`,
    )
    path = path.replace(/\/\d+px-([^/]+)$/, `/${width}px-$1`)
    const original = path.match(
      /\/wikipedia\/commons\/([0-9a-f])\/([0-9a-f]{2})\/([^/]+)$/i,
    )
    if (original && !/\.(tif|tiff)$/i.test(original[3])) {
      const file = original[3]
      path = `/wikipedia/commons/thumb/${original[1]}/${original[2]}/${file}/${width}px-${file}`
    }
    u.pathname = path
    return u.toString()
  } catch {
    return url.split('?')[0]
  }
}

function stripHtml(s) {
  return String(s ?? '')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .trim()
}

export async function fetchJson(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
  })
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  return res.json()
}

export function pageToPhoto(page) {
  if (page.missing != null || page.invalid != null) return null
  const info = page.imageinfo?.[0]
  if (!info) return null
  const mime = info.mime ?? ''
  if (!mime.startsWith('image/') || mime.includes('svg')) return null
  if ((info.width ?? 0) < 640 || (info.height ?? 0) < 400) return null
  const meta = info.extmetadata ?? {}
  const license = stripHtml(
    meta.LicenseShortName?.value || meta.License?.value || 'Unknown',
  )
  const artist = stripHtml(meta.Artist?.value || 'Unknown')
  const photo = {
    url: info.thumburl || info.url,
    credit: artist.length > 80 ? `${artist.slice(0, 77)}…` : artist,
    license,
    sourceUrl: info.descriptionurl || info.url,
    title: page.title || '',
    width: info.width,
    height: info.height,
    extmetadata: meta,
    coordinates: page.coordinates,
  }
  const coords = photoCoords(photo)
  if (coords) {
    photo.lat = coords.lat
    photo.lon = coords.lon
  }
  return photo
}

const IMAGEINFO =
  `prop=imageinfo|coordinates&iiprop=url|extmetadata|size|mime` +
  `&iiurlwidth=${THUMB_WIDTH}&coprop=type|name|dim|globe`

export async function resolveFileTitles(titles) {
  if (!titles.length) return []
  const api =
    `https://commons.wikimedia.org/w/api.php?action=query&format=json` +
    `&titles=${titles.map(encodeURIComponent).join('|')}&${IMAGEINFO}`
  const data = await fetchJson(api)
  const byTitle = new Map()
  for (const page of Object.values(data?.query?.pages ?? {})) {
    const photo = pageToPhoto(page)
    if (photo) byTitle.set(norm(page.title || ''), photo)
  }
  return titles.map((t) => byTitle.get(norm(t))).filter(Boolean)
}

async function searchCommons(query) {
  const api =
    `https://commons.wikimedia.org/w/api.php?action=query&format=json` +
    `&generator=search&gsrnamespace=6&gsrsearch=${encodeURIComponent(query)}` +
    `&gsrlimit=16&${IMAGEINFO}`
  const data = await fetchJson(api)
  return Object.values(data?.query?.pages ?? {})
}

async function geosearchFiles(lat, lon) {
  const api =
    `https://commons.wikimedia.org/w/api.php?action=query&format=json` +
    `&list=geosearch&gsnamespace=6&gscoord=${encodeURIComponent(`${lat}|${lon}`)}` +
    `&gsradius=${GEOSEARCH_RADIUS_M}&gslimit=20`
  const data = await fetchJson(api)
  const titles = (data?.query?.geosearch ?? [])
    .map((hit) => hit.title)
    .filter(Boolean)
  if (!titles.length) return []
  return resolveFileTitles(titles)
}

function searchName(peak) {
  return peak.name.replace(/^Mt\.\s+/i, 'Mount ').replace(/\s*\/\s*/g, ' ').trim()
}

function geoQueries(peak) {
  const name = searchName(peak)
  const region = peak.adminRegion || peak.nearestTown?.region || ''
  const country = peak.country || ''
  const range = peak.range || ''
  return [
    `"${name}" ${region || country}`,
    `${name} ${range}`,
    `${name} mountain ${country}`,
    `"${name}"`,
    ...(peak.aliases ?? []).slice(0, 2).map((a) => `"${a}" ${country}`),
  ].filter((q, i, arr) => q.trim() && arr.indexOf(q) === i)
}

export async function fetchMatchingPhotos(peak, want = PHOTO_TARGET, excludeKeys = new Set()) {
  const seen = new Set(excludeKeys)
  const candidates = []

  try {
    await sleep(400)
    const geo = await geosearchFiles(peak.lat, peak.lon)
    candidates.push(...geo)
  } catch {
    // geosearch is best-effort
  }

  for (const q of geoQueries(peak)) {
    if (candidates.length >= want * 6) break
    await sleep(400)
    try {
      const pages = await searchCommons(q)
      candidates.push(...pages.map(pageToPhoto).filter(Boolean))
    } catch {
      continue
    }
  }

  const passed = []
  for (const c of rankPhotos(peak, candidates)) {
    const key = c.url.split('/').pop()
    if (seen.has(key)) continue
    const m = photoMatchesPeak(peak, c, { slot: passed.length })
    if (!m.ok) continue
    seen.add(key)
    passed.push(c)
    if (passed.length >= want) break
  }

  if (passed.length < want) {
    for (const c of rankPhotos(peak, candidates)) {
      const key = c.url.split('/').pop()
      if (seen.has(key)) continue
      const m = photoMatchesPeak(peak, c, { slot: 1 })
      if (!m.ok) continue
      seen.add(key)
      passed.push(c)
      if (passed.length >= want) break
    }
  }

  return passed
}

export function normalizePhotos(peak) {
  const fromArray = Array.isArray(peak.photos) ? peak.photos.filter((p) => p?.url) : []
  if (fromArray.length) return fromArray
  if (peak.photo?.url) return [peak.photo]
  return []
}
