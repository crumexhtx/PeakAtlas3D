/**
 * Add curated Alps & Europe peaks with validated summit data and
 * Commons photos that show the mountain face (not maps/diagrams).
 *
 * Run: node scripts/add-alps-europe-peaks.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const peaksPath = join(root, 'src', 'data', 'peaks.json')
const UA = 'PeakAtlas3D/0.3 (https://peakatlas3d.com; alps-europe batch)'

const mToFt = (m) => Math.round(m * 3.28084)

/**
 * Curated batch — elevations/coords cross-checked against Wikipedia / Swisstopo /
 * Ordnance Survey / INGV-style published summit figures (meters → feet).
 * Photo File: titles chosen to show the mountain massif / face.
 */
const NEW_PEAKS = [
  {
    id: 'monterosa',
    name: 'Monte Rosa (Dufourspitze)',
    aliases: ['Dufourspitze', 'Punta Dufour', 'Monte Rosa'],
    lat: 45.9369,
    lon: 7.8667,
    elevationM: 4634,
    prominenceM: 2165,
    range: 'Pennine Alps',
    country: 'Switzerland',
    firstAscent: '1855',
    difficulty: 'Alpine glacier',
    difficultyTier: 'snow-glacier',
    bestSeason: 'Jul–Sep',
    whyNotable:
      'Highest summit in Switzerland and second-highest in the Alps after Mont Blanc.',
    description:
      'The Dufourspitze crowns the Monte Rosa massif on the Swiss–Italian border above Zermatt and Macugnaga. Standard approaches are long glacier climbs with crevasse hazard and high-camp logistics from the Monte Rosa Hut or Italian bivouacs. Treat it as a serious Pennine Alps expedition peak, not a day hike.',
    seoMetaDescription:
      'Monte Rosa (Dufourspitze) trip guide: alpine glacier climb, Jul–Sep, Zermatt staging, Switzerland’s high point, 3D terrain on PeakAtlas3D.',
    permitRequired: false,
    permitStatus: 'not_required',
    permitNotes:
      'No general government summit permit; hut bookings and glacier conditions are the practical gates. Confirm Swiss/Italian border-approach rules with current hut staff.',
    nearestTown: {
      name: 'Zermatt',
      region: 'Valais',
      distanceMiles: 10,
      route: 'Gornergrat / Monte Rosa Hut approaches',
      lat: 46.0207,
      lon: 7.7491,
    },
    trails: [{ name: 'Normal route via Monte Rosa Hut' }, { name: 'Italian east-wall approaches' }],
    food: [
      { name: 'Restaurant Matterhorn', category: 'Restaurant', note: 'Easy refuel in Zermatt between approaches.' },
      { name: 'Whymper Stube', category: 'Restaurant', note: 'Classic Valais meals after glacier days.' },
      { name: 'Cafe du Pont', category: 'Café', note: 'Simple breakfast before early starts.' },
    ],
    photoFiles: [
      'File:Dufourspitze (Monte Rosa) and Monte Rosa Glacier as seen from Gornergrat, Wallis, Switzerland, 2012 August.jpg',
      'File:Aerial image of the Monte Rosa east face (view from the east).jpg',
    ],
  },
  {
    id: 'weisshorn',
    name: 'Weisshorn',
    lat: 46.1014,
    lon: 7.7139,
    elevationM: 4506,
    prominenceM: 1235,
    range: 'Pennine Alps',
    country: 'Switzerland',
    firstAscent: '1861',
    difficulty: 'Alpine rock ridge',
    difficultyTier: 'alpine-technical',
    bestSeason: 'Jul–Sep',
    whyNotable:
      'One of the great isolated 4000ers of the Valais — a steep pyramid above Randa.',
    description:
      'The Weisshorn is a classic Valais 4000er: long approaches, mixed rock and snow ridges, and serious exposure on the standard East Ridge from the Weisshorn Hut. Most parties treat it as a guided or highly experienced alpine climb from Randa / Täsch.',
    seoMetaDescription:
      'Weisshorn trip guide: alpine rock ridge, Jul–Sep, Randa staging, Valais 4000er, 3D terrain on PeakAtlas3D.',
    permitRequired: false,
    permitStatus: 'not_required',
    permitNotes:
      'No general summit permit; Weisshorn Hut bookings and conditions are the main logistics constraint.',
    nearestTown: {
      name: 'Randa',
      region: 'Valais',
      distanceMiles: 5,
      route: 'Weisshorn Hut trail',
      lat: 46.1001,
      lon: 7.7816,
    },
    trails: [{ name: 'East Ridge (normal)' }, { name: 'Schali Ridge' }],
    food: [
      { name: 'Hotel Dom Restaurant', category: 'Restaurant', note: 'Solid meal base in Randa / Täsch.' },
      { name: 'Restaurant Walliserhof', category: 'Restaurant', note: 'Valais fare after ridge days.' },
      { name: 'Bahnhof Buffet Visp', category: 'Café', note: 'Transit refuel on the way in.' },
    ],
    photoFiles: ['File:Weisshorn from Rothorn.jpg', 'File:Weisshorn.jpg'],
  },
  {
    id: 'dom',
    name: 'Dom',
    aliases: ['Dom de Mischabel'],
    lat: 46.095,
    lon: 7.8589,
    elevationM: 4545,
    prominenceM: 1046,
    range: 'Pennine Alps',
    country: 'Switzerland',
    firstAscent: '1858',
    difficulty: 'Alpine glacier',
    difficultyTier: 'snow-glacier',
    bestSeason: 'Jul–Sep',
    whyNotable:
      'Highest mountain entirely in Switzerland — the Mischabel giant above Saas-Fee.',
    description:
      'The Dom is the highest peak lying wholly in Switzerland, rising from the Mischabel range above Saas-Fee. The Festigrat / normal route is a long glacier climb from the Dom Hut with sustained altitude and crevasse terrain. Stage in Saas-Fee and budget for an alpine start.',
    seoMetaDescription:
      'Dom trip guide: alpine glacier climb, Jul–Sep, Saas-Fee staging, highest peak wholly in Switzerland, 3D terrain on PeakAtlas3D.',
    permitRequired: false,
    permitStatus: 'not_required',
    permitNotes:
      'No general summit permit; Dom Hut reservations and glacier conditions govern the climb.',
    nearestTown: {
      name: 'Saas-Fee',
      region: 'Valais',
      distanceMiles: 5,
      route: 'Dom Hut approach',
      lat: 46.109,
      lon: 7.927,
    },
    trails: [{ name: 'Festigrat / Dom Hut normal' }, { name: 'North Face routes' }],
    food: [
      { name: 'Restaurant Allalin', category: 'Restaurant', note: 'Village meal after Dom Hut days.' },
      { name: 'Popcorn Restaurant', category: 'Restaurant', note: 'Casual Saas-Fee option.' },
      { name: 'Café Schneerauch', category: 'Café', note: 'Coffee before the hut hike.' },
    ],
    photoFiles: [
      'File:Dom (mountain).jpg',
      'File:Dom, Täschhorn and Alphubel (15089083580).jpg',
    ],
  },
  {
    id: 'dentblanche',
    name: 'Dent Blanche',
    lat: 46.0342,
    lon: 7.6119,
    elevationM: 4357,
    prominenceM: 915,
    range: 'Pennine Alps',
    country: 'Switzerland',
    firstAscent: '1862',
    difficulty: 'Alpine rock ridge',
    difficultyTier: 'alpine-technical',
    bestSeason: 'Jul–Sep',
    whyNotable:
      'Striking Valais rock pyramid guarding the approaches between Zinal and Zermatt.',
    description:
      'Dent Blanche is a sharp Pennine Alps pyramid climbed most often via the South Ridge (Wandfluegrat) from the Dent Blanche Hut. Expect sustained rock, snow patches, and route-finding in mixed terrain. Stage from Les Haudères / Evolène or Zermatt-side valleys.',
    seoMetaDescription:
      'Dent Blanche trip guide: alpine rock ridge, Jul–Sep, Dent Blanche Hut logistics, Valais, 3D terrain on PeakAtlas3D.',
    permitRequired: false,
    permitStatus: 'not_required',
    permitNotes:
      'No general summit permit; hut space and summer conditions are the practical limits.',
    nearestTown: {
      name: 'Les Haudères',
      region: 'Valais',
      distanceMiles: 8,
      route: 'Dent Blanche Hut approach',
      lat: 46.0806,
      lon: 7.5089,
    },
    trails: [{ name: 'South Ridge (Wandflue)' }, { name: 'West Ridge' }],
    food: [
      { name: 'Hotel Les Dents Blanches', category: 'Restaurant', note: 'Valley base meals near Evolène.' },
      { name: 'Restaurant La Place', category: 'Restaurant', note: 'Local Valais cooking.' },
      { name: 'Café de la Poste', category: 'Café', note: 'Simple start-of-day fuel.' },
    ],
    photoFiles: [
      'File:Dent Blanche.jpg',
      'File:Ober Gabelhorn, Zinalrothorn and Dent Blanche (15232269129).jpg',
    ],
  },
  {
    id: 'pizbernina',
    name: 'Piz Bernina',
    lat: 46.3823,
    lon: 9.9081,
    elevationM: 4049,
    prominenceM: 2236,
    range: 'Bernina Range',
    country: 'Switzerland',
    firstAscent: '1850',
    difficulty: 'Alpine glacier',
    difficultyTier: 'snow-glacier',
    bestSeason: 'Jul–Sep',
    whyNotable:
      'Easternmost 4000er of the Alps — the Bernina high point above Pontresina.',
    description:
      'Piz Bernina is the highest summit of the Eastern Alps and the easternmost Alpine 4000er. The normal Spallagrat / Biancograt approaches from Diavolezza or the Tschierva Hut combine glacier travel with an airy final ridge. Stage in Pontresina or St. Moritz.',
    seoMetaDescription:
      'Piz Bernina trip guide: alpine glacier climb, Jul–Sep, Pontresina / Diavolezza staging, easternmost 4000er, 3D terrain on PeakAtlas3D.',
    permitRequired: false,
    permitStatus: 'not_required',
    permitNotes:
      'No general summit permit; hut and cableway logistics plus seasonal ridge conditions apply.',
    nearestTown: {
      name: 'Pontresina',
      region: 'Graubünden',
      distanceMiles: 8,
      route: 'Diavolezza / Val Roseg',
      lat: 46.4917,
      lon: 9.9014,
    },
    trails: [{ name: 'Spallagrat normal' }, { name: 'Biancograt' }],
    food: [
      { name: 'Restaurant Steinbock', category: 'Restaurant', note: 'Pontresina classic after Bernina days.' },
      { name: 'Hofrestaurant', category: 'Restaurant', note: 'Hearty Engadin meals.' },
      { name: 'Café Cycle', category: 'Café', note: 'Light breakfast before Diavolezza.' },
    ],
    photoFiles: [
      'File:Piz Bernina.jpg',
      'File:Piz Bernina Aug 2008 close.jpg',
    ],
  },
  {
    id: 'granparadiso',
    name: 'Gran Paradiso',
    lat: 45.5183,
    lon: 7.2667,
    elevationM: 4061,
    prominenceM: 1879,
    range: 'Graian Alps',
    country: 'Italy',
    firstAscent: '1860',
    difficulty: 'Alpine glacier',
    difficultyTier: 'snow-glacier',
    bestSeason: 'Jun–Sep',
    whyNotable:
      'Highest peak entirely in Italy — the classic first 4000er of the Graian Alps.',
    description:
      'Gran Paradiso is Italy’s highest mountain wholly inside the country and a popular first 4000er. The normal route from Rifugio Vittorio Emanuele II is a glacier climb to a short final scramble on the Madonna summit block. Stage in Valsavarenche (Aosta Valley) inside Gran Paradiso National Park.',
    seoMetaDescription:
      'Gran Paradiso trip guide: alpine glacier climb, Jun–Sep, Valsavarenche staging, Italy’s high point, 3D terrain on PeakAtlas3D.',
    permitRequired: false,
    permitStatus: 'not_required',
    permitNotes:
      'No summit permit inside Gran Paradiso National Park for the normal route; park rules and hut bookings apply. Confirm current trail/glacier notices.',
    nearestTown: {
      name: 'Valsavarenche',
      region: 'Aosta Valley',
      distanceMiles: 6,
      route: 'Rifugio Vittorio Emanuele II',
      lat: 45.583,
      lon: 7.21,
    },
    trails: [{ name: 'Normal route via Rifugio Vittorio Emanuele' }, { name: 'Chabod approach' }],
    food: [
      { name: 'Ristorante Gran Paradiso', category: 'Restaurant', note: 'Valley meal after hut days.' },
      { name: 'Hotel Notre Maison', category: 'Restaurant', note: 'Aosta Valley cooking.' },
      { name: 'Bar Centrale', category: 'Café', note: 'Coffee before the approach hike.' },
    ],
    photoFiles: [
      'File:Gran Paradiso dalla Valsavarenche.JPG',
      'File:Gran Paradiso.jpg',
    ],
  },
  {
    id: 'cimaggrande',
    name: 'Cima Grande di Lavaredo',
    aliases: ['Tre Cime di Lavaredo', 'Drei Zinnen', 'Cima Grande'],
    lat: 46.6189,
    lon: 12.3025,
    elevationM: 2999,
    prominenceM: 540,
    range: 'Dolomites',
    country: 'Italy',
    firstAscent: '1869',
    difficulty: 'Technical rock',
    difficultyTier: 'alpine-technical',
    bestSeason: 'Jun–Sep',
    whyNotable:
      'The highest of the Tre Cime / Drei Zinnen — the postcard wall of the Dolomites.',
    description:
      'Cima Grande is the central and highest tower of the Tre Cime di Lavaredo. The normal route is a classic Dolomite rock climb with fixed gear in places; the north face holds historic hard routes. Most visitors hike the circuit around the towers from Rifugio Auronzo without summiting.',
    seoMetaDescription:
      'Cima Grande di Lavaredo trip guide: Dolomite rock climb, Jun–Sep, Tre Cime circuit, Auronzo staging, 3D terrain on PeakAtlas3D.',
    permitRequired: false,
    permitStatus: 'not_required',
    permitNotes:
      'No summit permit for the normal rock route; paid access roads / parking to Rifugio Auronzo apply in season. Climbing ethics and fixed-gear norms are local.',
    nearestTown: {
      name: 'Misurina',
      region: 'Veneto',
      distanceMiles: 4,
      route: 'Rifugio Auronzo road',
      lat: 46.582,
      lon: 12.253,
    },
    trails: [{ name: 'Normal route (SE face)' }, { name: 'Tre Cime circuit hike' }],
    food: [
      { name: 'Rifugio Auronzo', category: 'Alpine hut', note: 'Busy hut meals at the trailhead.' },
      { name: 'Ristorante Malga Rin Bianco', category: 'Restaurant', note: 'Valley option near Misurina.' },
      { name: 'Bar Toblin', category: 'Café', note: 'Quick coffee before the circuit.' },
    ],
    photoFiles: [
      'File:Drei Zinnen Tre Cime di Lavaredo Dolomites.jpg',
      'File:Drei Zinnen 1.jpg',
    ],
  },
  {
    id: 'bennevis',
    name: 'Ben Nevis',
    aliases: ['Beinn Nibheis'],
    lat: 56.7969,
    lon: -5.0036,
    elevationM: 1345,
    prominenceM: 1345,
    range: 'Grampian Mountains',
    country: 'United Kingdom',
    firstAscent: '1771',
    difficulty: 'Strenuous day hike',
    difficultyTier: 'strenuous-hike',
    bestSeason: 'May–Sep',
    whyNotable:
      'Highest mountain in the British Isles — Scotland’s classic summit walk.',
    description:
      'Ben Nevis is the highest peak in the UK. The Mountain Track (pony track) from Glen Nevis is a long, steep day hike in all weather; the North Face holds serious winter and rock climbs. Navigation errors in cloud are common—carry a map/compass and turn around if conditions collapse.',
    seoMetaDescription:
      'Ben Nevis trip guide: strenuous day hike, May–Sep, Fort William staging, UK high point, 3D terrain on PeakAtlas3D.',
    permitRequired: false,
    permitStatus: 'not_required',
    permitNotes:
      'No summit permit. Park responsibly in Glen Nevis; seasonal path and weather warnings from the Nevis Landscape Partnership / outdoor centers apply.',
    nearestTown: {
      name: 'Fort William',
      region: 'Highland',
      distanceMiles: 5,
      route: 'Glen Nevis',
      lat: 56.8198,
      lon: -5.1052,
    },
    trails: [{ name: 'Mountain Track (Pony Track)' }, { name: 'Carn Mòr Dearg Arête' }],
    food: [
      { name: 'The Crofter', category: 'Restaurant', note: 'Hearty Fort William meals.' },
      { name: 'Café Beag', category: 'Café', note: 'Pre-hike coffee in town.' },
      { name: 'Ben Nevis Inn', category: 'Restaurant', note: 'Near the Glen Nevis approach.' },
    ],
    photoFiles: [
      'File:North face of Ben Nevis.jpg',
      'File:North-east face of Ben Nevis - geograph.org.uk - 7870856.jpg',
    ],
  },
  {
    id: 'snowdon',
    name: 'Snowdon / Yr Wyddfa',
    aliases: ['Yr Wyddfa', 'Snowdon'],
    lat: 53.0685,
    lon: -4.0762,
    elevationM: 1085,
    prominenceM: 1038,
    range: 'Snowdonia',
    country: 'United Kingdom',
    firstAscent: '1639',
    difficulty: 'Class 1–2 hike',
    difficultyTier: 'day-hike',
    bestSeason: 'May–Oct',
    whyNotable:
      'Highest peak in Wales — busy ridge walks and a summit café above Llanberis.',
    description:
      'Yr Wyddfa (Snowdon) is Wales’s high point and one of Britain’s busiest mountains. Popular paths include Llanberis, Pyg, Miners, Watkin, and Rhyd Ddu; Crib Goch adds exposed scrambling. Trains on the Snowdon Mountain Railway also reach the summit complex in season.',
    seoMetaDescription:
      'Snowdon / Yr Wyddfa trip guide: Class 1–2 hike, May–Oct, Llanberis staging, Wales high point, 3D terrain on PeakAtlas3D.',
    permitRequired: false,
    permitStatus: 'not_required',
    permitNotes:
      'No summit permit. Parking fills early; Eryri/Snowdonia National Park path and railway rules apply. Check weather and path status before you go.',
    nearestTown: {
      name: 'Llanberis',
      region: 'Gwynedd',
      distanceMiles: 4,
      route: 'Llanberis Path',
      lat: 53.117,
      lon: -4.127,
    },
    trails: [{ name: 'Llanberis Path' }, { name: 'Pyg Track / Miner’s Track' }],
    food: [
      { name: 'Peak Restaurant', category: 'Restaurant', note: 'Summit complex meals in season.' },
      { name: 'Pete’s Eats', category: 'Café', note: 'Classic Llanberis climber café.' },
      { name: 'The Heights Hotel', category: 'Restaurant', note: 'Village base after the descent.' },
    ],
    photoFiles: [
      'File:Snowdon from Llyn Llydaw.jpg',
      'File:Yr Wyddfa (Snowdon) from Crib Goch, Parc Cenedlaethol Eryri National Park, Cymru (Wales) 03.jpg',
    ],
  },
  {
    id: 'scafellpike',
    name: 'Scafell Pike',
    lat: 54.4542,
    lon: -3.2115,
    elevationM: 978,
    prominenceM: 912,
    range: 'Lake District',
    country: 'United Kingdom',
    firstAscent: '1802',
    difficulty: 'Strenuous day hike',
    difficultyTier: 'strenuous-hike',
    bestSeason: 'May–Sep',
    whyNotable:
      'Highest mountain in England — the Lake District’s rocky high point.',
    description:
      'Scafell Pike is England’s highest summit. The Corridor Route from Wasdale or approaches from Seathwaite / Borrowdale are rocky, eroded day hikes with frequent cloud and navigation traps. Pair with Great Gable or Scafell only if daylight and skills allow.',
    seoMetaDescription:
      'Scafell Pike trip guide: strenuous day hike, May–Sep, Wasdale staging, England’s high point, 3D terrain on PeakAtlas3D.',
    permitRequired: false,
    permitStatus: 'not_required',
    permitNotes:
      'No summit permit. National Trust / Lake District parking and Leave No Trace rules apply; paths are heavily eroded—stay on marked routes.',
    nearestTown: {
      name: 'Wasdale Head',
      region: 'Cumbria',
      distanceMiles: 3,
      route: 'Corridor Route / Brown Tongue',
      lat: 54.466,
      lon: -3.26,
    },
    trails: [{ name: 'Brown Tongue / Wasdale' }, { name: 'Corridor Route' }],
    food: [
      { name: 'Wasdale Head Inn', category: 'Restaurant', note: 'Classic climbers’ inn meals.' },
      { name: 'Barn Door Shop Café', category: 'Café', note: 'Supplies and snacks in Wasdale.' },
      { name: 'The Boot Inn', category: 'Restaurant', note: 'Eskdale option after long days.' },
    ],
    photoFiles: [
      'File:Scafell Pike.jpg',
      'File:Great Gable and Scafell Pike - geograph.org.uk - 2518813.jpg',
    ],
  },
  {
    id: 'carrauntoohil',
    name: 'Carrauntoohil',
    aliases: ['Corrán Tuathail'],
    lat: 51.9994,
    lon: -9.7428,
    elevationM: 1039,
    prominenceM: 1039,
    range: "MacGillycuddy's Reeks",
    country: 'Ireland',
    firstAscent: '1840',
    difficulty: 'Strenuous scramble / non-technical',
    difficultyTier: 'scramble',
    bestSeason: 'May–Sep',
    whyNotable:
      'Highest mountain in Ireland — the Reeks horseshoe above the Hag’s Glen.',
    description:
      'Carrauntoohil is Ireland’s high point in MacGillycuddy’s Reeks, County Kerry. The Brother O’Shea’s Gully / Devil’s Ladder approaches from Cronin’s Yard involve steep loose ground and frequent cloud; the Reeks Ridge is a serious scramble outing. Stage near Killarney or Beaufort.',
    seoMetaDescription:
      'Carrauntoohil trip guide: strenuous scramble, May–Sep, Hag’s Glen / Cronin’s Yard, Ireland’s high point, 3D terrain on PeakAtlas3D.',
    permitRequired: false,
    permitStatus: 'not_required',
    permitNotes:
      'No summit permit. Parking fees at Cronin’s Yard / Lisleibane are common; stay on paths and respect private farmland access.',
    nearestTown: {
      name: 'Killarney',
      region: 'Kerry',
      distanceMiles: 12,
      route: "Cronin's Yard / Hag's Glen",
      lat: 52.059,
      lon: -9.508,
    },
    trails: [{ name: "Devil's Ladder" }, { name: "Brother O'Shea's Gully" }],
    food: [
      { name: "Cronin's Yard Café", category: 'Café', note: 'Trailhead tea and snacks.' },
      { name: 'The Laurels', category: 'Restaurant', note: 'Killarney meals after the Reeks.' },
      { name: 'Murphy’s Bar', category: 'Restaurant', note: 'Casual Kerry fare.' },
    ],
    photoFiles: [
      'File:Carrauntoohil Group from Cruach Mhor.jpg',
      'File:Carrauntoohil, Beenkeragh Ridge, Caher.jpg',
    ],
  },
  {
    id: 'gerlach',
    name: 'Gerlachovský štít',
    aliases: ['Gerlach', 'Gerlachovsky stit'],
    lat: 49.1642,
    lon: 20.1336,
    elevationM: 2655,
    prominenceM: 2355,
    range: 'High Tatras',
    country: 'Slovakia',
    firstAscent: '1834',
    difficulty: 'Alpine rock ridge',
    difficultyTier: 'alpine-technical',
    bestSeason: 'Jun–Sep',
    whyNotable:
      'Highest peak in the High Tatras and of Slovakia — guide-required for most visitors.',
    description:
      'Gerlachovský štít is the high point of the High Tatras and Slovakia. The normal routes are technical enough that unguided ascent is restricted for visitors without local alpine qualifications—most hire a UIMLA/IFMGA mountain guide from Starý Smokovec or Tatranská Lomnica.',
    seoMetaDescription:
      'Gerlachovský štít trip guide: alpine rock ridge, Jun–Sep, High Tatras guides, Slovakia high point, 3D terrain on PeakAtlas3D.',
    permitRequired: true,
    permitStatus: 'required',
    permitNotes:
      'Guided ascent required for most visitors (Tatra National Park rules). Book a certified mountain guide; unguided travel on the normal routes is restricted.',
    nearestTown: {
      name: 'Starý Smokovec',
      region: 'Prešov',
      distanceMiles: 6,
      route: 'Velická dolina approaches',
      lat: 49.138,
      lon: 20.22,
    },
    trails: [{ name: 'Velická próba (guided normal)' }, { name: 'Batizovská próba' }],
    food: [
      { name: 'Grandhotel Praha Restaurant', category: 'Restaurant', note: 'Smokovec dining after Tatras days.' },
      { name: 'Reštaurácia Humno', category: 'Restaurant', note: 'Hearty Slovak meals.' },
      { name: 'Café Remata', category: 'Café', note: 'Coffee before guide meetups.' },
    ],
    photoFiles: [
      'File:Gerlachovský štít od Veľkého Slavkova.jpg',
      'File:Gerlachovsky stit from Velicka dolina.jpg',
    ],
  },
  {
    id: 'etna',
    name: 'Mount Etna',
    aliases: ['Etna', 'Mongibello'],
    lat: 37.751,
    lon: 14.9934,
    elevationM: 3357,
    prominenceM: 3357,
    range: 'Sicily',
    country: 'Italy',
    firstAscent: 'Unknown (ancient)',
    difficulty: 'Strenuous day hike',
    difficultyTier: 'strenuous-hike',
    bestSeason: 'May–Oct',
    whyNotable:
      'Europe’s highest and most active volcano — Sicily’s restless summit.',
    description:
      'Mount Etna is Europe’s tallest active volcano. Summit elevation changes with eruptions; cableways and 4×4 tours from Rifugio Sapienza or Piano Provenzana shorten approaches, but crater-rim travel depends on volcanic alert levels. Always check INGV / park closures before going high.',
    seoMetaDescription:
      'Mount Etna trip guide: strenuous volcano hike, May–Oct, Catania staging, active crater rules, 3D terrain on PeakAtlas3D.',
    permitRequired: true,
    permitStatus: 'required',
    permitNotes:
      'Access above authorized zones often requires authorized guides when alert levels rise. Follow Etna Park / Civil Protection closures—summit travel can be banned during eruptions.',
    nearestTown: {
      name: 'Nicolosi',
      region: 'Sicily',
      distanceMiles: 12,
      route: 'Rifugio Sapienza',
      lat: 37.616,
      lon: 15.024,
    },
    trails: [{ name: 'South side (Sapienza)' }, { name: 'North side (Piano Provenzana)' }],
    food: [
      { name: 'Rifugio Sapienza', category: 'Restaurant', note: 'Busy hut meals on the south side.' },
      { name: 'Osteria Etna', category: 'Restaurant', note: 'Nicolosi Sicilian cooking.' },
      { name: 'Café del Parco', category: 'Café', note: 'Coffee before the cableway.' },
    ],
    photoFiles: [
      'File:View of Mount Etna from Reggio Calabria - Italy - 10 Feb. 2017 - (1).jpg',
      'File:Messina Canyon-Etna-Volcano-Sicily-Italy - Creative Commons by gnuckx (3493037353).jpg',
    ],
  },
  {
    id: 'vesuvius',
    name: 'Mount Vesuvius',
    aliases: ['Vesuvio'],
    lat: 40.8214,
    lon: 14.4261,
    elevationM: 1281,
    prominenceM: 1232,
    range: 'Campanian volcanic arc',
    country: 'Italy',
    firstAscent: 'Unknown (ancient)',
    difficulty: 'Class 1 hike',
    difficultyTier: 'day-hike',
    bestSeason: 'Apr–Jun or Sep–Oct',
    whyNotable:
      'The volcano that buried Pompeii — a short crater-rim walk above the Bay of Naples.',
    description:
      'Vesuvius is the iconic volcano overlooking Naples and the site of the 79 AD eruption that buried Pompeii and Herculaneum. Today a ticketed path reaches the crater rim on a short, steep walk. Check park opening hours and volcanic alert status; summer heat and crowds are intense.',
    seoMetaDescription:
      'Mount Vesuvius trip guide: Class 1 crater hike, Apr–Jun or Sep–Oct, Naples staging, Pompeii views, 3D terrain on PeakAtlas3D.',
    permitRequired: true,
    permitStatus: 'required',
    permitNotes:
      'Entry ticket required for Vesuvius National Park crater path. Hours and access change with weather and alert level—book or buy on-site per current park rules.',
    nearestTown: {
      name: 'Herculaneum',
      region: 'Campania',
      distanceMiles: 5,
      route: 'Vesuvius National Park road',
      lat: 40.806,
      lon: 14.35,
    },
    trails: [{ name: 'Crater rim path' }, { name: 'Nature trails on the lower flanks' }],
    food: [
      { name: 'Restaurant Kona', category: 'Restaurant', note: 'Near park approaches.' },
      { name: 'Trattoria da Gennaro', category: 'Restaurant', note: 'Campanian meals after the rim.' },
      { name: 'Café Vesuvio', category: 'Café', note: 'Quick stop by the ticket area.' },
    ],
    photoFiles: [
      'File:Vesuvius from Pompeii.jpg',
      'File:Mount Vesuvius.jpg',
    ],
  },
]

function stripHtml(s) {
  return String(s ?? '')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .trim()
}

async function fetchJson(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
  })
  if (!res.ok) throw new Error(`${res.status} ${url}`)
  return res.json()
}

async function resolvePhoto(fileTitle) {
  const api =
    'https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*' +
    `&titles=${encodeURIComponent(fileTitle)}` +
    '&prop=imageinfo&iiprop=url|extmetadata|size|mime&iiurlwidth=960'
  const data = await fetchJson(api)
  const page = Object.values(data.query?.pages || {})[0]
  if (!page || page.missing !== undefined) {
    throw new Error(`Commons missing: ${fileTitle}`)
  }
  const info = page.imageinfo?.[0]
  if (!info) throw new Error(`No imageinfo: ${fileTitle}`)
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
  const elevationFt = mToFt(def.elevationM)
  const prominenceFt = mToFt(def.prominenceM)
  const town = def.nearestTown
  return {
    id: def.id,
    name: def.name,
    ...(def.aliases ? { aliases: def.aliases } : {}),
    lat: def.lat,
    lon: def.lon,
    elevationFt,
    prominenceFt,
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
    await new Promise((r) => setTimeout(r, 250))
  }
  if (photos.length < 1) {
    console.error(`No photos for ${def.id}`)
    process.exit(1)
  }
  peaks.push(buildPeak(def, photos))
  added.push(def.id)
  existing.add(def.id)
}

writeFileSync(peaksPath, `${JSON.stringify(peaks, null, 2)}\n`)
console.log(`Added ${added.length} peaks: ${added.join(', ')}`)
console.log(`Catalog size: ${peaks.length}`)
