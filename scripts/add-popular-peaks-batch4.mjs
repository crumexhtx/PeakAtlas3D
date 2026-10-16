/**
 * Add 20 gap-filling peaks (Seven Summits / trekking / new countries).
 * Stats from Peakbagger / Wikipedia / official park pages — do not invent.
 * Run: node scripts/add-popular-peaks-batch4.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  fetchMatchingPhotos,
  photoMatchesPeak,
  resolveFileTitles,
  slimPhoto,
} from './lib/photo-match.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const peaksPath = join(root, 'src', 'data', 'peaks.json')

const CURATED = {
  puncakjaya: ['File:Puncakjaya.jpg', 'File:Carstensz Pyramid.jpg'],
  ojosdelsalado: [
    'File:Ojos del Salado.jpg',
    'File:Nevado Ojos del Salado.jpg',
  ],
  rinjani: ['File:Mount Rinjani.jpg', 'File:Gunung Rinjani.jpg'],
  merapeak: ['File:Mera Peak.jpg', 'File:Mera Peak Nepal.jpg'],
  lenin: ['File:Lenin Peak.jpg', 'File:Pik Lenin.jpg'],
  muztaghata: ['File:Muztagh Ata.jpg', 'File:Muztagata.jpg'],
  zugspitze: ['File:Zugspitze.jpg', 'File:Zugspitze from Ehrwald.jpg'],
  breithorn: ['File:Breithorn.jpg', 'File:Breithorn from Klein Matterhorn.jpg'],
  monch: ['File:Mönch.jpg', 'File:Moench from Jungfraujoch.jpg'],
  aneto: ['File:Aneto.jpg', 'File:Pico de Aneto.jpg'],
  rysy: ['File:Rysy.jpg', 'File:Rysy from Czarny Staw.jpg'],
  hvannadalshnukur: [
    'File:Hvannadalshnúkur.jpg',
    'File:Öræfajökull.jpg',
  ],
  ruapehu: ['File:Mount Ruapehu.jpg', 'File:Ruapehu from Turoa.jpg'],
  taranaki: ['File:Mount Taranaki.jpg', 'File:Mount Taranaki Egmont.jpg'],
  cameroon: ['File:Mount Cameroon.jpg', 'File:Mount Cameroon from Buea.jpg'],
  margherita: [
    'File:Margherita Peak.jpg',
    'File:Mount Stanley Rwenzori.jpg',
  ],
  roraima: ['File:Mount Roraima.jpg', 'File:Monte Roraima.jpg'],
  villarrica: ['File:Villarrica.jpg', 'File:Volcán Villarrica.jpg'],
  acatenango: ['File:Acatenango.jpg', 'File:Volcán Acatenango.jpg'],
  temple: [
    'File:Mount Temple.jpg',
    'File:Mount Temple Banff.jpg',
    'File:Mt Temple from Lake Louise.jpg',
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

const NEW_PEAKS = [
  {
    id: 'puncakjaya',
    name: 'Puncak Jaya',
    lat: -4.078531,
    lon: 137.158077,
    elevationFt: 16024,
    prominenceFt: 16024,
    range: 'Sudirman Range',
    country: 'Indonesia',
    adminRegion: 'Central Papua',
    description:
      'Highest summit in Oceania (Messner Seven Summits) — a technical limestone pyramid in the Sudirman Range of New Guinea, climbed with licensed Indonesian operators.',
    firstAscent: '1962',
    difficulty: 'Technical expedition',
    difficultyTier: 'expedition',
    aliases: ['Carstensz Pyramid', 'Mount Carstensz', 'Carstensz'],
    bestSeason: 'Jun–Aug',
    whyNotable:
      'The missing Seven Summit on the Messner list — Oceania’s high point and the world’s highest island peak.',
    seoMetaDescription:
      'Puncak Jaya (Carstensz Pyramid) trip notes: technical expedition, Jun–Aug, Indonesian SIMAKSI permits, Timika staging, 3D terrain on PeakAtlas3D.',
    nearestTown: town(
      'Timika',
      'Central Papua',
      'Mine / expedition logistics',
      -4.546,
      136.888,
      -4.078531,
      137.158077,
    ),
    nearbyPlaces: [],
    permitRequired: true,
    permitStatus: 'required',
    permitNotes:
      'Indonesian conservation (SIMAKSI) and local access permits are required; commercial teams use licensed PB-PJWA operators. Independent access is not practical — confirm current Papua / Mimika rules.',
    afterId: 'apo',
  },
  {
    id: 'ojosdelsalado',
    name: 'Ojos del Salado',
    lat: -27.10972,
    lon: -68.54139,
    elevationFt: 22615,
    prominenceFt: 12100,
    range: 'Puna de Atacama',
    country: 'Chile/Argentina',
    adminRegion: 'Atacama',
    description:
      'Highest volcano on Earth and Chile’s high point — a high, arid Atacama massif usually approached as a non-technical high-altitude scramble from the Copiapó side.',
    firstAscent: '1937',
    difficulty: 'High-altitude hike',
    difficultyTier: 'strenuous-hike',
    aliases: ['Nevado Ojos del Salado'],
    bestSeason: 'Dec–Mar',
    whyNotable:
      'World’s highest volcano and a Volcanic Seven Summits objective on the Chile–Argentina border.',
    seoMetaDescription:
      'Ojos del Salado trip notes: high-altitude hike, Dec–Mar, CONAF / border permits, Copiapó staging, 3D terrain on PeakAtlas3D.',
    nearestTown: town(
      'Copiapó',
      'Atacama',
      'Ruta 31 / Laguna Verde',
      -27.3665,
      -70.3322,
      -27.10972,
      -68.54139,
    ),
    nearbyPlaces: [],
    permitRequired: true,
    permitStatus: 'required',
    permitNotes:
      'Chilean CONAF access to Nevado Tres Cruces and border/DIFROL authorization typically apply on the Copiapó approach. Confirm current Chile/Argentina park and border rules.',
    afterId: 'aconcagua',
  },
  {
    id: 'rinjani',
    name: 'Mount Rinjani',
    lat: -8.410094,
    lon: 116.457867,
    elevationFt: 12224,
    prominenceFt: 12224,
    range: 'Lombok',
    country: 'Indonesia',
    adminRegion: 'West Nusa Tenggara',
    description:
      'Lombok’s high point and one of Southeast Asia’s classic multi-day crater treks — summit push from the Segara Anak rim with licensed national-park operators.',
    firstAscent: '1847',
    difficulty: 'Strenuous day / overnight',
    difficultyTier: 'strenuous-hike',
    aliases: ['Gunung Rinjani', 'Rinjani'],
    bestSeason: 'May–Oct',
    whyNotable:
      'Lombok high point and a flagship Indonesian volcano trek above Segara Anak crater lake.',
    seoMetaDescription:
      'Mount Rinjani trip notes: strenuous overnight trek, May–Oct, TNGR trekking pass, Senaru / Sembalun staging, 3D terrain on PeakAtlas3D.',
    nearestTown: town(
      'Senaru',
      'West Nusa Tenggara',
      'Senaru trailhead',
      -8.305,
      116.41,
      -8.410094,
      116.457867,
    ),
    nearbyPlaces: [
      town(
        'Sembalun Lawang',
        'West Nusa Tenggara',
        'Sembalun trailhead',
        -8.366,
        116.533,
        -8.410094,
        116.457867,
      ),
    ],
    permitRequired: true,
    permitStatus: 'required',
    permitNotes:
      'Mount Rinjani National Park trekking passes are required and issued through licensed operators (e-SIMAKSI / TNGR). Independent trekking is not allowed.',
    afterId: 'puncakjaya',
  },
  {
    id: 'merapeak',
    name: 'Mera Peak',
    lat: 27.70916,
    lon: 86.868289,
    elevationFt: 21247,
    prominenceFt: 3488,
    range: 'Mahalangur Himal',
    country: 'Nepal',
    adminRegion: 'Koshi',
    description:
      'Nepal’s most-climbed trekking peak — a glaciated 6,000 m objective south of Everest, usually approached via Khare with NMA permits.',
    firstAscent: '1953',
    difficulty: 'Trekking peak',
    difficultyTier: 'expedition',
    aliases: ['Mera'],
    bestSeason: 'Apr–May, Oct–Nov',
    whyNotable:
      'The standard “first 6,000er” for trekkers in the Khumbu, and Nepal’s busiest trekking peak.',
    seoMetaDescription:
      'Mera Peak trip notes: trekking peak, Apr–May and Oct–Nov, NMA permit, Lukla / Khare staging, 3D terrain on PeakAtlas3D.',
    nearestTown: town(
      'Lukla',
      'Koshi',
      'Mera Peak trek',
      27.687,
      86.731,
      27.70916,
      86.868289,
    ),
    nearbyPlaces: [],
    permitRequired: true,
    permitStatus: 'required',
    permitNotes:
      'Nepal NMA trekking-peak permit plus TIMS / Khumbu rural municipality fees apply. Arrange through a licensed Nepal operator and confirm current NMA rules.',
    afterId: 'island',
  },
  {
    id: 'lenin',
    name: 'Lenin Peak',
    lat: 39.3425,
    lon: 72.8775,
    elevationFt: 23406,
    prominenceFt: 9360,
    range: 'Trans-Alay Range',
    country: 'Kyrgyzstan/Tajikistan',
    adminRegion: 'Osh',
    description:
      'The most-climbed 7,000 m peak — a glaciated Pamir expedition usually staged from Achik-Tash on the Kyrgyz side, with real altitude and avalanche hazard despite a “non-technical” reputation.',
    firstAscent: '1928',
    difficulty: 'High-altitude expedition',
    difficultyTier: 'expedition',
    aliases: ['Ibn Sina Peak', 'Pik Lenin', 'Kaufmann Peak'],
    bestSeason: 'Jul–Aug',
    whyNotable:
      'Classic first 7,000er: highest of the Trans-Alay and among the world’s most-ascended 7,000 m peaks.',
    seoMetaDescription:
      'Lenin Peak trip notes: high-altitude expedition, Jul–Aug, Kyrgyz border permits, Osh / Achik-Tash staging, 3D terrain on PeakAtlas3D.',
    nearestTown: town(
      'Osh',
      'Osh',
      'Achik-Tash road',
      40.5283,
      72.7985,
      39.3425,
      72.8775,
    ),
    nearbyPlaces: [],
    permitRequired: true,
    permitStatus: 'required',
    permitNotes:
      'Kyrgyzstan OVIR/border-zone and mountaineering permits are required for Achik-Tash / Lenin Peak. Confirm current Kyrgyz tourism and border rules.',
    afterId: 'k2',
  },
  {
    id: 'muztaghata',
    name: 'Muztagh Ata',
    lat: 38.27611,
    lon: 75.11594,
    elevationFt: 24757,
    prominenceFt: 8973,
    range: 'Kongur Shan',
    country: 'China',
    adminRegion: 'Xinjiang',
    description:
      'A broad 7,500 m ski-expedition peak above Karakul Lake — often called an “easy” 7,000er, still a full Chinese mountaineering-permit expedition from Kashgar.',
    firstAscent: '1956',
    difficulty: 'High-altitude expedition',
    difficultyTier: 'expedition',
    aliases: ['Muztagata', 'Mustagh Ata'],
    bestSeason: 'Jun–Aug',
    whyNotable:
      'Classic “easy” 7,000 m ski mountain of the Eastern Pamirs, with CMA / Xinjiang permit logistics.',
    seoMetaDescription:
      'Muztagh Ata trip notes: high-altitude expedition, Jun–Aug, CMA and Alien Travel permits, Kashgar staging, 3D terrain on PeakAtlas3D.',
    nearestTown: town(
      'Kashgar',
      'Xinjiang',
      'Karakoram Highway / Karakul',
      39.4704,
      75.9898,
      38.27611,
      75.11594,
    ),
    nearbyPlaces: [],
    permitRequired: true,
    permitStatus: 'required',
    permitNotes:
      'China mountaineering permits (CMA / Xinjiang association) plus an Alien Travel Permit for the Kashgar border area are required. Confirm current CXMA rules.',
    afterId: 'lenin',
  },
  {
    id: 'zugspitze',
    name: 'Zugspitze',
    lat: 47.42123,
    lon: 10.98632,
    elevationFt: 9717,
    prominenceFt: 5732,
    range: 'Wetterstein',
    country: 'Germany',
    adminRegion: 'Bavaria',
    description:
      'Germany’s high point on the Austrian border — reached by cog railway, cable car, or the Höllental / Reintal trails with via ferrata sections on the classic routes.',
    firstAscent: '1820',
    difficulty: 'Strenuous day hike',
    difficultyTier: 'strenuous-hike',
    aliases: [],
    bestSeason: 'Jun–Sep',
    whyNotable:
      'Highest mountain in Germany and a high-search Alpine day from Garmisch-Partenkirchen.',
    seoMetaDescription:
      'Zugspitze trip notes: strenuous day hike, Jun–Sep, no summit permit, Garmisch-Partenkirchen staging, 3D terrain on PeakAtlas3D.',
    nearestTown: town(
      'Garmisch-Partenkirchen',
      'Bavaria',
      'Bayerische Zugspitzbahn',
      47.492,
      11.095,
      47.42123,
      10.98632,
    ),
    nearbyPlaces: [],
    permitRequired: false,
    permitStatus: 'not_required',
    permitNotes:
      'No general summit climbing permit. Cable-car, cog railway, and trailhead rules apply; the Austrian border ridge is a walk-up / via ferrata mix.',
    afterId: 'eiger',
  },
  {
    id: 'breithorn',
    name: 'Breithorn',
    lat: 45.9409,
    lon: 7.74763,
    elevationFt: 13688,
    prominenceFt: 1463,
    range: 'Pennine Alps',
    country: 'Switzerland/Italy',
    adminRegion: 'Valais',
    description:
      'The most-climbed Alpine 4,000er from Zermatt — a short glacier climb from Klein Matterhorn / Matterhorn glacier paradise, typically with a UIAGM guide.',
    firstAscent: '1813',
    difficulty: 'Alpine glacier',
    difficultyTier: 'snow-glacier',
    aliases: ['Western Breithorn'],
    bestSeason: 'Jun–Sep',
    whyNotable:
      'Often called the easiest 4,000 m peak in the Alps — a guided glacier day above Zermatt.',
    seoMetaDescription:
      'Breithorn trip notes: alpine glacier climb, Jun–Sep, Klein Matterhorn access, Zermatt staging, 3D terrain on PeakAtlas3D.',
    nearestTown: town(
      'Zermatt',
      'Valais',
      'Matterhorn glacier paradise',
      46.0207,
      7.7491,
      45.9409,
      7.74763,
    ),
    nearbyPlaces: [],
    permitRequired: false,
    permitStatus: 'not_required',
    permitNotes:
      'No general climbing permit. Glacier travel from Klein Matterhorn is the constraint — hut/cable-car tickets and seasonal route conditions apply.',
    afterId: 'matterhorn',
  },
  {
    id: 'monch',
    name: 'Mönch',
    lat: 46.55849,
    lon: 7.99725,
    elevationFt: 13484,
    prominenceFt: 1938,
    range: 'Bernese Alps',
    country: 'Switzerland',
    adminRegion: 'Bern',
    description:
      'The middle summit of the Eiger–Mönch–Jungfrau trio — a guided snow arete from Jungfraujoch, popular as a first Bernese 4,000er.',
    firstAscent: '1857',
    difficulty: 'Alpine glacier',
    difficultyTier: 'snow-glacier',
    aliases: ['Moench', 'Monch'],
    bestSeason: 'Jun–Sep',
    whyNotable:
      'Classic guided 4,000er beside Eiger and Jungfrau, climbed from the Jungfraujoch railway.',
    seoMetaDescription:
      'Mönch trip notes: alpine glacier climb, Jun–Sep, Jungfraujoch start, Grindelwald staging, 3D terrain on PeakAtlas3D.',
    nearestTown: town(
      'Grindelwald',
      'Bern',
      'Jungfraujoch railway',
      46.6242,
      8.0414,
      46.55849,
      7.99725,
    ),
    nearbyPlaces: [],
    permitRequired: false,
    permitStatus: 'not_required',
    permitNotes:
      'No general climbing permit. Jungfraujoch access and glacier/route conditions are the practical gates — confirm with Grindelwald / Jungfrau guides.',
    afterId: 'jungfrau',
  },
  {
    id: 'aneto',
    name: 'Aneto',
    lat: 42.631078,
    lon: 0.656636,
    elevationFt: 11168,
    prominenceFt: 9222,
    range: 'Pyrenees',
    country: 'Spain',
    adminRegion: 'Aragon',
    description:
      'Highest peak in the Pyrenees — a glaciated normal route from Renclusa / Benasque that still needs an ice axe and crevasse awareness in season.',
    firstAscent: '1842',
    difficulty: 'Snow / glacier climb',
    difficultyTier: 'snow-glacier',
    aliases: ['Pico de Aneto'],
    bestSeason: 'Jun–Sep',
    whyNotable:
      'Pyrenees high point and Spain’s third-highest summit, with a classic glacier approach.',
    seoMetaDescription:
      'Aneto trip notes: snow/glacier climb, Jun–Sep, no summit permit, Benasque staging, 3D terrain on PeakAtlas3D.',
    nearestTown: town(
      'Benasque',
      'Aragon',
      'Renclusa / Posets-Maladeta',
      42.605,
      0.523,
      42.631078,
      0.656636,
    ),
    nearbyPlaces: [],
    permitRequired: false,
    permitStatus: 'not_required',
    permitNotes:
      'No general summit permit in Posets-Maladeta Natural Park. Glacier travel on the normal route still needs seasonal assessment — confirm park access rules.',
    afterId: 'mulhacen',
  },
  {
    id: 'rysy',
    name: 'Rysy',
    lat: 49.17934,
    lon: 20.08847,
    elevationFt: 8204,
    prominenceFt: 538,
    range: 'High Tatras',
    country: 'Poland/Slovakia',
    adminRegion: 'Lesser Poland',
    description:
      'Poland’s high point on the Slovak border — a very popular marked Tatra hike from Morskie Oko / Czarny Staw, with a slightly higher summit on the Slovak side.',
    firstAscent: 'Unknown',
    difficulty: 'Class 2–3 scramble',
    difficultyTier: 'scramble',
    aliases: [],
    bestSeason: 'Jun–Sep',
    whyNotable:
      'Poland’s high point and one of the busiest High Tatras summit days from Zakopane.',
    seoMetaDescription:
      'Rysy trip notes: Class 2–3 scramble, Jun–Sep, Tatra National Park tickets, Zakopane staging, 3D terrain on PeakAtlas3D.',
    nearestTown: town(
      'Zakopane',
      'Lesser Poland',
      'Morskie Oko road',
      49.2992,
      19.9496,
      49.17934,
      20.08847,
    ),
    nearbyPlaces: [],
    permitRequired: true,
    permitStatus: 'required',
    permitNotes:
      'Tatra National Park entry tickets are required on the Polish (TPN) and Slovak (TANAP) sides. Confirm current trail closures and ticket rules before you go.',
    afterId: 'gerlach',
  },
  {
    id: 'hvannadalshnukur',
    name: 'Hvannadalshnúkur',
    lat: 64.01424,
    lon: -16.67718,
    elevationFt: 6919,
    prominenceFt: 6919,
    range: 'Öræfajökull',
    country: 'Iceland',
    adminRegion: 'Austurland',
    description:
      'Iceland’s high point on the Öræfajökull ice cap — a guided glacier climb from the Skaftafell side of Vatnajökull National Park.',
    firstAscent: 'Unknown',
    difficulty: 'Glacier climb',
    difficultyTier: 'snow-glacier',
    aliases: ['Hvannadalshnjúkur'],
    bestSeason: 'May–Sep',
    whyNotable:
      'Highest summit in Iceland and a classic guided glacier day on Vatnajökull.',
    seoMetaDescription:
      'Hvannadalshnúkur trip notes: glacier climb, May–Sep, Vatnajökull National Park, Skaftafell staging, 3D terrain on PeakAtlas3D.',
    nearestTown: town(
      'Höfn',
      'Austurland',
      'Skaftafell / Route 1',
      64.2536,
      -15.2089,
      64.01424,
      -16.67718,
    ),
    nearbyPlaces: [],
    permitRequired: false,
    permitStatus: 'not_required',
    permitNotes:
      'No separate summit climbing permit. Vatnajökull National Park access and guided glacier travel are the normal constraints — confirm current park / operator rules.',
    afterId: 'bennevis',
  },
  {
    id: 'ruapehu',
    name: 'Mount Ruapehu',
    lat: -39.28945,
    lon: 175.56244,
    elevationFt: 9156,
    prominenceFt: 9156,
    range: 'Tongariro',
    country: 'New Zealand',
    adminRegion: 'Manawatū-Whanganui',
    description:
      'North Island high point — an active andesite volcano whose Tahurangi summit is reached from the Turoa or Whakapapa ski fields when volcanic alert levels allow.',
    firstAscent: '1879',
    difficulty: 'Snow / scramble',
    difficultyTier: 'scramble',
    aliases: ['Ruapehu', 'Tahurangi'],
    bestSeason: 'Dec–Apr',
    whyNotable:
      'Highest peak on New Zealand’s North Island and the high point of Tongariro National Park.',
    seoMetaDescription:
      'Mount Ruapehu trip notes: snow scramble, Dec–Apr, Tongariro NP / volcanic alerts, Whakapapa staging, 3D terrain on PeakAtlas3D.',
    nearestTown: town(
      'Whakapapa Village',
      'Manawatū-Whanganui',
      'Bruce Road',
      -39.202,
      175.54,
      -39.28945,
      175.56244,
    ),
    nearbyPlaces: [],
    permitRequired: false,
    permitStatus: 'not_required',
    permitNotes:
      'No general summit permit. Tongariro National Park entry and volcanic alert levels apply — check DOC and GNS Science before climbing Tahurangi.',
    afterId: 'cook',
  },
  {
    id: 'taranaki',
    name: 'Mount Taranaki',
    lat: -39.29607,
    lon: 174.06383,
    elevationFt: 8255,
    prominenceFt: 7576,
    range: 'Taranaki',
    country: 'New Zealand',
    adminRegion: 'Taranaki',
    description:
      'The isolated cone of Te Papakura o Taranaki — a popular summer summit day from North Egmont when alpine conditions are stable.',
    firstAscent: '1839',
    difficulty: 'Strenuous day hike',
    difficultyTier: 'strenuous-hike',
    aliases: ['Taranaki Maunga', 'Mount Egmont'],
    bestSeason: 'Dec–Mar',
    whyNotable:
      'Iconic North Island volcano and one of New Zealand’s most photographed summit days.',
    seoMetaDescription:
      'Mount Taranaki trip notes: strenuous day hike, Dec–Mar, no summit permit, New Plymouth staging, 3D terrain on PeakAtlas3D.',
    nearestTown: town(
      'New Plymouth',
      'Taranaki',
      'Egmont Road / North Egmont',
      -39.0556,
      174.0752,
      -39.29607,
      174.06383,
    ),
    nearbyPlaces: [],
    permitRequired: false,
    permitStatus: 'not_required',
    permitNotes:
      'No general summit permit. Te Papakura o Taranaki (Egmont NP) track and weather rules apply — confirm current DOC alpine conditions.',
    afterId: 'ruapehu',
  },
  {
    id: 'cameroon',
    name: 'Mount Cameroon',
    lat: 4.21667,
    lon: 9.1725,
    elevationFt: 13255,
    prominenceFt: 12799,
    range: 'Cameroon Line',
    country: 'Cameroon',
    adminRegion: 'Southwest',
    description:
      'West Africa’s highest mountain — an active stratovolcano above Buea, climbed as a long hut-to-summit trek through Mount Cameroon National Park.',
    firstAscent: '1840s',
    difficulty: 'Strenuous day / overnight',
    difficultyTier: 'strenuous-hike',
    aliases: ['Fako', 'Mongo ma Ndemi'],
    bestSeason: 'Nov–Feb',
    whyNotable:
      'Highest peak in West Africa and a classic Buea-based volcano trek.',
    seoMetaDescription:
      'Mount Cameroon trip notes: strenuous overnight trek, Nov–Feb, national park / guide rules, Buea staging, 3D terrain on PeakAtlas3D.',
    nearestTown: town(
      'Buea',
      'Southwest',
      'Park trailheads',
      4.155,
      9.232,
      4.21667,
      9.1725,
    ),
    nearbyPlaces: [],
    permitRequired: true,
    permitStatus: 'required',
    permitNotes:
      'Mount Cameroon National Park entry and locally arranged guides from Buea are typically required. Confirm current park office rules.',
    afterId: 'kilimanjaro',
  },
  {
    id: 'margherita',
    name: 'Margherita Peak',
    lat: 0.38583,
    lon: 29.87167,
    elevationFt: 16763,
    prominenceFt: 12874,
    range: 'Rwenzori',
    country: 'Uganda/DR Congo',
    adminRegion: 'Western Region',
    description:
      'Highest point of Mount Stanley and the third-highest mountain in Africa — a glaciated rock climb on the Uganda–DRC border in the Rwenzori.',
    firstAscent: '1906',
    difficulty: 'Technical alpine / glacier',
    difficultyTier: 'snow-glacier',
    aliases: ['Mount Stanley', 'Mount Ngaliema'],
    bestSeason: 'Dec–Feb, Jun–Aug',
    whyNotable:
      'Africa’s third-highest summit and the high point of both Uganda and the DRC, on the classic Rwenzori trek.',
    seoMetaDescription:
      'Margherita Peak trip notes: technical alpine/glacier, Dec–Feb, UWA permits, Kasese staging, 3D terrain on PeakAtlas3D.',
    nearestTown: town(
      'Kasese',
      'Western Region',
      'Nyakalengija / Rwenzori',
      0.1833,
      30.0833,
      0.38583,
      29.87167,
    ),
    nearbyPlaces: [],
    permitRequired: true,
    permitStatus: 'required',
    permitNotes:
      'Uganda Wildlife Authority (and ICCN on the DRC side) park and trekking permits are required for the Rwenzori / Margherita Peak route. Confirm current UWA / operator rules.',
    afterId: 'kilimanjaro',
  },
  {
    id: 'roraima',
    name: 'Mount Roraima',
    lat: 5.14333,
    lon: -60.7625,
    elevationFt: 9219,
    prominenceFt: 7671,
    range: 'Pacaraima',
    country: 'Venezuela/Brazil/Guyana',
    adminRegion: 'Bolívar',
    description:
      'The famous tepui on the Venezuela–Brazil–Guyana border — a multi-day plateau trek usually started from Paraitepuy with Inparques permits.',
    firstAscent: '1884',
    difficulty: 'Strenuous day / overnight',
    difficultyTier: 'strenuous-hike',
    aliases: ['Monte Roraima', 'Tepuy Roraima'],
    bestSeason: 'Dec–Mar',
    whyNotable:
      'The classic Guiana Shield tepui trek and a country high-point massif on a three-way border.',
    seoMetaDescription:
      'Mount Roraima trip notes: strenuous overnight trek, Dec–Mar, Inparques permits, Santa Elena staging, 3D terrain on PeakAtlas3D.',
    nearestTown: town(
      'Santa Elena de Uairén',
      'Bolívar',
      'Paraitepuy trailhead',
      4.602,
      -61.11,
      5.14333,
      -60.7625,
    ),
    nearbyPlaces: [],
    permitRequired: true,
    permitStatus: 'required',
    permitNotes:
      'Venezuela Inparques permits are required for the Roraima tepui trek (typically arranged from Santa Elena / Paraitepuy). Confirm current park and border rules.',
    afterId: 'ojosdelsalado',
  },
  {
    id: 'villarrica',
    name: 'Volcán Villarrica',
    lat: -39.420849,
    lon: -71.939371,
    elevationFt: 9383,
    prominenceFt: 5167,
    range: 'Southern Andes',
    country: 'Chile',
    adminRegion: 'Araucanía',
    description:
      'An active crater volcano above Pucón — Chile’s most popular guided snow climb, with a separate CONAF crater-ascent pass on top of park entry.',
    firstAscent: 'Unknown',
    difficulty: 'Snow climb',
    difficultyTier: 'snow-glacier',
    aliases: ['Villarrica', 'Rucapillán'],
    bestSeason: 'Nov–Mar',
    whyNotable:
      'One of South America’s most popular guided volcano climbs, with an open lava lake in the crater when conditions allow.',
    seoMetaDescription:
      'Volcán Villarrica trip notes: snow climb, Nov–Mar, CONAF crater pass, Pucón staging, 3D terrain on PeakAtlas3D.',
    nearestTown: town(
      'Pucón',
      'Araucanía',
      'Rucapillán ski area',
      -39.282,
      -71.954,
      -39.420849,
      -71.939371,
    ),
    nearbyPlaces: [],
    permitRequired: true,
    permitStatus: 'required',
    permitNotes:
      'CONAF requires a separate Villarrica crater-ascent pass (pasesparques.cl) in addition to park entry; most visitors must go with a licensed Pucón operator.',
    afterId: 'ojosdelsalado',
  },
  {
    id: 'acatenango',
    name: 'Volcán Acatenango',
    lat: 14.50163,
    lon: -90.87549,
    elevationFt: 13041,
    prominenceFt: 6020,
    range: 'Sierra Madre',
    country: 'Guatemala',
    adminRegion: 'Chimaltenango',
    description:
      'A popular overnight volcano hike from Antigua with tent camps facing active Volcán de Fuego — Pico Mayor is the high point of the Acatenango–Fuego complex.',
    firstAscent: 'Unknown',
    difficulty: 'Strenuous day / overnight',
    difficultyTier: 'strenuous-hike',
    aliases: ['Acatenango', 'Pico Mayor'],
    bestSeason: 'Nov–Apr',
    whyNotable:
      'Guatemala’s classic overnight volcano: camp opposite erupting Fuego, summit Acatenango at dawn.',
    seoMetaDescription:
      'Volcán Acatenango trip notes: strenuous overnight hike, Nov–Apr, agency/park access, Antigua staging, 3D terrain on PeakAtlas3D.',
    nearestTown: town(
      'Antigua Guatemala',
      'Sacatepéquez',
      'La Soledad trailhead',
      14.5586,
      -90.7332,
      14.50163,
      -90.87549,
    ),
    nearbyPlaces: [],
    permitRequired: true,
    permitStatus: 'required',
    permitNotes:
      'Overnight Acatenango hikes are arranged through licensed Antigua agencies with park / INSIVUMEH access. Confirm current Fuego-hazard and permit rules.',
    afterId: 'iztaccihuatl',
  },
  {
    id: 'temple',
    name: 'Mount Temple',
    lat: 51.35056,
    lon: -116.20667,
    elevationFt: 11627,
    prominenceFt: 5066,
    range: 'Bow Range',
    country: 'Canada',
    adminRegion: 'Alberta',
    description:
      'Highest peak in the Lake Louise group — Banff’s most popular big scramble via Sentinel Pass from Moraine Lake, with real rockfall and snow-slope hazard.',
    firstAscent: '1894',
    difficulty: 'Class 3 scramble',
    difficultyTier: 'scramble',
    aliases: ['Mt. Temple'],
    bestSeason: 'Jul–Sep',
    whyNotable:
      'Banff’s signature scramble: the high point above Lake Louise and Moraine Lake.',
    seoMetaDescription:
      'Mount Temple trip notes: Class 3 scramble, Jul–Sep, Parks Canada pass, Lake Louise / Moraine Lake staging, 3D terrain on PeakAtlas3D.',
    nearestTown: town(
      'Lake Louise',
      'Alberta',
      'Moraine Lake / Sentinel Pass',
      51.4254,
      -116.1773,
      51.35056,
      -116.20667,
    ),
    nearbyPlaces: [],
    permitRequired: false,
    permitStatus: 'not_required',
    permitNotes:
      'No scrambling permit. Parks Canada discovery pass / Banff entry and Moraine Lake access rules apply — confirm current Parks Canada conditions.',
    afterId: 'robson',
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
  if (out.length >= 2) return out.slice(0, 2)

  try {
    const fetched = await fetchMatchingPhotos(
      peak,
      2,
      new Set(out.map((p) => p.url.split('/').pop())),
    )
    for (const ph of fetched) {
      if (out.length >= 2) break
      if (out.some((x) => x.url === ph.url)) continue
      out.push(slimPhoto(ph))
    }
  } catch (err) {
    console.warn(`search failed ${peak.id}:`, err.message)
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
    nearbyPlaces:
      rest.nearbyPlaces?.length > 0
        ? rest.nearbyPlaces
        : [{ ...draft.nearestTown }],
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
