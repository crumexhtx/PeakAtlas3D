/**
 * One-shot enricher: adds peak-atlas fields to src/data/peaks.json.
 * Run: node scripts/enrich-peaks.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const path = join(root, 'src', 'data', 'peaks.json')

/** @type {Record<string, { prominenceFt: number, firstAscent: string, difficulty: string, description: string }>} */
const details = {
  rainier: {
    prominenceFt: 13210,
    firstAscent: '1870',
    difficulty: 'Glacier climb',
    description:
      'An ice-clad Cascade stratovolcano and the most glaciated peak in the contiguous United States, rising above Paradise and the Wonderland circuit.',
  },
  shasta: {
    prominenceFt: 9762,
    firstAscent: '1854',
    difficulty: 'Snow / glacier climb',
    description:
      'A solitary Cascade volcano in northern California, famous for its Avalanche Gulch route and sweeping views over the Shasta Valley.',
  },
  hood: {
    prominenceFt: 7706,
    firstAscent: '1857',
    difficulty: 'Snow climb',
    description:
      'Oregon’s signature Cascade volcano, a steep snow peak overlooking the Columbia River Gorge and Timberline Lodge.',
  },
  baker: {
    prominenceFt: 8842,
    firstAscent: '1868',
    difficulty: 'Glacier climb',
    description:
      'The northernmost Cascade volcano in the contiguous U.S., heavily glaciated and a classic Pacific Northwest ski-mountaineering objective.',
  },
  adams: {
    prominenceFt: 8116,
    firstAscent: '1854',
    difficulty: 'Snow climb',
    description:
      'Washington’s second-highest volcano, a massive Cascade summit with broad snow slopes and quieter approaches than Rainier.',
  },
  denali: {
    prominenceFt: 20146,
    firstAscent: '1913',
    difficulty: 'High-altitude expedition',
    description:
      'North America’s highest mountain, a vast Alaska Range massif known for extreme cold, altitude, and the West Buttress route.',
  },
  elbert: {
    prominenceFt: 9073,
    firstAscent: '1874',
    difficulty: 'Walk-up',
    description:
      'The highest peak in the Rocky Mountains, a non-technical Sawatch Range summit and Colorado’s state high point.',
  },
  whitney: {
    prominenceFt: 10078,
    firstAscent: '1873',
    difficulty: 'Class 1–2 hike',
    description:
      'The highest summit in the contiguous United States, anchoring the Sierra Nevada with the famous Mount Whitney Trail.',
  },
  longs: {
    prominenceFt: 2940,
    firstAscent: '1868',
    difficulty: 'Class 3 scramble',
    description:
      'A classic Front Range fourteener in Rocky Mountain National Park, topped by the exposed Keyhole Route.',
  },
  pikes: {
    prominenceFt: 5510,
    firstAscent: '1820',
    difficulty: 'Walk-up',
    description:
      'An iconic Front Range landmark above Colorado Springs, reachable by trail, cog railway, or the Pikes Peak Highway.',
  },
  gannett: {
    prominenceFt: 7076,
    firstAscent: '1922',
    difficulty: 'Glacier climb',
    description:
      'Wyoming’s high point in the remote Wind River Range, a glacier-guarded summit far from roads.',
  },
  granitet: {
    prominenceFt: 4759,
    firstAscent: '1893',
    difficulty: 'Class 3–4 scramble',
    description:
      'Montana’s high point in the Beartooth Mountains, a technical scramble on solid granite.',
  },
  kings: {
    prominenceFt: 6348,
    firstAscent: '1877',
    difficulty: 'Class 2 hike',
    description:
      'Utah’s high point in the Uinta Mountains, a long alpine hike to the roof of the Beehive State.',
  },
  humphreys: {
    prominenceFt: 6039,
    firstAscent: '1870s',
    difficulty: 'Class 1 hike',
    description:
      'Arizona’s high point on the San Francisco Peaks, a forested volcanic summit near Flagstaff.',
  },
  guadalupe: {
    prominenceFt: 3029,
    firstAscent: 'Prehistoric / early survey',
    difficulty: 'Class 1 hike',
    description:
      'Texas’s high point in Guadalupe Mountains National Park, rising abruptly above the Chihuahuan Desert.',
  },
  robson: {
    prominenceFt: 9255,
    firstAscent: '1913',
    difficulty: 'Alpine climb',
    description:
      'The highest peak in the Canadian Rockies, a steep ice-and-rock pyramid towering over Berg Lake.',
  },
  logan: {
    prominenceFt: 17215,
    firstAscent: '1925',
    difficulty: 'High-altitude expedition',
    description:
      'Canada’s highest mountain and the largest base circumference of any non-volcanic peak on Earth, in Kluane’s icefields.',
  },
  waddington: {
    prominenceFt: 10789,
    firstAscent: '1936',
    difficulty: 'Technical alpine',
    description:
      'The highest peak entirely in British Columbia, a remote Coast Mountains giant of ice and granite.',
  },
  columbia: {
    prominenceFt: 7749,
    firstAscent: '1902',
    difficulty: 'Glacier climb',
    description:
      'A major Canadian Rockies summit on the Continental Divide, approached across the Columbia Icefield.',
  },
  assini: {
    prominenceFt: 6821,
    firstAscent: '1901',
    difficulty: 'Alpine climb',
    description:
      'The “Matterhorn of the Rockies,” a striking pyramidal peak on the Alberta–British Columbia border.',
  },
  orizaba: {
    prominenceFt: 16148,
    firstAscent: '1848',
    difficulty: 'Snow / glacier climb',
    description:
      'Mexico’s highest peak and North America’s third-highest, a massive stratovolcano often climbed via the Jamapa Glacier.',
  },
  popo: {
    prominenceFt: 9908,
    firstAscent: 'Pre-Columbian / 1519',
    difficulty: 'Restricted / volcanic',
    description:
      'An active Mexican volcano near Mexico City, historically climbed but often closed due to eruptive activity.',
  },
  aconcagua: {
    prominenceFt: 22841,
    firstAscent: '1897',
    difficulty: 'High-altitude trek',
    description:
      'The highest mountain in the Western Hemisphere, a non-technical but punishing Andes giant in Argentina.',
  },
  huascaran: {
    prominenceFt: 9186,
    firstAscent: '1932',
    difficulty: 'Alpine glacier',
    description:
      'Peru’s high point in the Cordillera Blanca, a twin-summited ice giant and classic Andean expedition peak.',
  },
  illimani: {
    prominenceFt: 8041,
    firstAscent: '1898',
    difficulty: 'Alpine glacier',
    description:
      'The great ice massif overlooking La Paz, a signature Cordillera Real climb with sweeping Altiplano views.',
  },
  chimborazo: {
    prominenceFt: 13524,
    firstAscent: '1880',
    difficulty: 'Glacier climb',
    description:
      'Ecuador’s highest volcano and, due to Earth’s equatorial bulge, the farthest point from the planet’s center.',
  },
  cotopaxi: {
    prominenceFt: 7884,
    firstAscent: '1872',
    difficulty: 'Glacier climb',
    description:
      'One of the world’s highest active volcanoes, a near-perfect Ecuadorian cone and classic high-Andes climb.',
  },
  fitzroy: {
    prominenceFt: 6404,
    firstAscent: '1952',
    difficulty: 'Elite big-wall',
    description:
      'Patagonia’s granite spire icon, more often admired than climbed, rising above El Chaltén’s wind-scoured valleys.',
  },
  torres: {
    prominenceFt: 7339,
    firstAscent: '1963 (Central Tower)',
    difficulty: 'Technical rock',
    description:
      'The famous granite towers of Torres del Paine National Park, a Patagonian landmark of rock and weather.',
  },
  sajama: {
    prominenceFt: 8071,
    firstAscent: '1939',
    difficulty: 'Snow climb',
    description:
      'Bolivia’s highest peak, an isolated Andean volcano on the Altiplano near the Chilean border.',
  },
  ausangate: {
    prominenceFt: 6857,
    firstAscent: '1953',
    difficulty: 'Alpine climb',
    description:
      'A sacred Apu of the Cordillera Vilcanota, ringed by the classic Ausangate circuit near Cusco.',
  },
  montblanc: {
    prominenceFt: 15410,
    firstAscent: '1786',
    difficulty: 'Alpine glacier',
    description:
      'Western Europe’s highest summit and the birthplace of modern alpinism, rising above Chamonix and Courmayeur.',
  },
  matterhorn: {
    prominenceFt: 3431,
    firstAscent: '1865',
    difficulty: 'Alpine rock ridge',
    description:
      'The world’s most recognizable alpine pyramid, a steep rock ridge climb above Zermatt and Cervinia.',
  },
  jungfrau: {
    prominenceFt: 3622,
    firstAscent: '1811',
    difficulty: 'Alpine glacier',
    description:
      'A Bernese Oberland classic above the Aletsch Glacier, long celebrated as one of the Alps’ great ice peaks.',
  },
  eiger: {
    prominenceFt: 1168,
    firstAscent: '1858',
    difficulty: 'Technical alpine',
    description:
      'Bernese Alps legend defined by its North Face, a steep limestone wall that shaped twentieth-century climbing history.',
  },
  grossglockner: {
    prominenceFt: 7956,
    firstAscent: '1800',
    difficulty: 'Alpine glacier',
    description:
      'Austria’s highest mountain, a classic High Tauern ice climb above the Pasterze Glacier.',
  },
  triglav: {
    prominenceFt: 6729,
    firstAscent: '1778',
    difficulty: 'Via ferrata / scramble',
    description:
      'Slovenia’s national mountain in the Julian Alps, a limestone ridge climb and cultural landmark.',
  },
  ortles: {
    prominenceFt: 6404,
    firstAscent: '1804',
    difficulty: 'Alpine glacier',
    description:
      'The highest peak in the Eastern Alps of Italy, a glaciated Ortler Alps summit near South Tyrol.',
  },
  marmolada: {
    prominenceFt: 6237,
    firstAscent: '1864',
    difficulty: 'Alpine glacier',
    description:
      'The “Queen of the Dolomites,” a limestone massif with a remnant glacier and sweeping views over the Pale Mountains.',
  },
  barreuils: {
    prominenceFt: 6693,
    firstAscent: '1877',
    difficulty: 'Alpine glacier',
    description:
      'The highest peak in the Dauphiné Alps of France, a remote Écrins massif climb of rock and ice.',
  },
  elbrus: {
    prominenceFt: 15554,
    firstAscent: '1874',
    difficulty: 'High-altitude trek',
    description:
      'Europe’s conventional high point, a twin-summited Caucasus volcano usually climbed via snow slopes from the south.',
  },
  kazbek: {
    prominenceFt: 7740,
    firstAscent: '1868',
    difficulty: 'Glacier climb',
    description:
      'A sacred Caucasus volcano above Stepantsminda, combining glacier travel with Georgian mountain culture.',
  },
  damavand: {
    prominenceFt: 15271,
    firstAscent: 'Prehistoric / 1837',
    difficulty: 'High-altitude trek',
    description:
      'The highest volcano in Asia and Iran’s high point, a solitary Alborz cone rising above the Caspian hinterland.',
  },
  ararat: {
    prominenceFt: 11847,
    firstAscent: '1829',
    difficulty: 'Snow climb',
    description:
      'A massive dormant volcano in eastern Turkey, culturally iconic and a long snow climb to its twin summits.',
  },
  kilimanjaro: {
    prominenceFt: 19308,
    firstAscent: '1889',
    difficulty: 'High-altitude trek',
    description:
      'Africa’s highest mountain, a freestanding volcanic massif climbed by non-technical trekking routes to Uhuru Peak.',
  },
  kenya: {
    prominenceFt: 12549,
    firstAscent: '1899',
    difficulty: 'Technical rock / ice',
    description:
      'Africa’s second-highest peak, a rugged volcanic plug with technical summits above the equatorial moorlands.',
  },
  toubkal: {
    prominenceFt: 12320,
    firstAscent: '1923',
    difficulty: 'Class 2 hike',
    description:
      'North Africa’s high point in Morocco’s High Atlas, a popular scramble above the Imlil valley.',
  },
  rasdashen: {
    prominenceFt: 5220,
    firstAscent: '1841',
    difficulty: 'Class 2 hike',
    description:
      'Ethiopia’s high point in the Simien Mountains, a rocky plateau summit above dramatic escarpments.',
  },
  table: {
    prominenceFt: 3468,
    firstAscent: '1503',
    difficulty: 'Class 1 hike',
    description:
      'Cape Town’s flat-topped sandstone icon, more plateau than spire, and one of the world’s most recognizable city peaks.',
  },
  meru: {
    prominenceFt: 10400,
    firstAscent: '1904',
    difficulty: 'Trekking peak',
    description:
      'A steep volcanic neighbor of Kilimanjaro, often climbed as an acclimatization trek before Kibo.',
  },
  everest: {
    prominenceFt: 29029,
    firstAscent: '1953',
    difficulty: 'High-altitude expedition',
    description:
      'Earth’s highest mountain on the Nepal–China border, the defining high-altitude expedition of the Mahalangur Himal.',
  },
  k2: {
    prominenceFt: 13189,
    firstAscent: '1954',
    difficulty: 'Extreme expedition',
    description:
      'The savage mountain of the Karakoram — steeper, colder, and statistically more dangerous than Everest.',
  },
  kangchen: {
    prominenceFt: 12896,
    firstAscent: '1955',
    difficulty: 'High-altitude expedition',
    description:
      'The world’s third-highest mountain, a vast Himalayan massif sacred to communities of Sikkim and eastern Nepal.',
  },
  lhotse: {
    prominenceFt: 2003,
    firstAscent: '1956',
    difficulty: 'High-altitude expedition',
    description:
      'Everest’s towering southern neighbor, linked by the South Col and famous for the sheer Lhotse Face.',
  },
  makalu: {
    prominenceFt: 7812,
    firstAscent: '1955',
    difficulty: 'High-altitude expedition',
    description:
      'An isolated Mahalangur giant east of Everest, known for steep ridges and technical high-altitude climbing.',
  },
  chooyu: {
    prominenceFt: 7073,
    firstAscent: '1954',
    difficulty: 'High-altitude expedition',
    description:
      'The “Turquoise Goddess,” often considered the most attainable 8,000-meter peak via its northwest ridge.',
  },
  dhaula: {
    prominenceFt: 10978,
    firstAscent: '1960',
    difficulty: 'High-altitude expedition',
    description:
      'The White Mountain of west-central Nepal, an isolated 8,000er rising above the Kali Gandaki corridor.',
  },
  manaslu: {
    prominenceFt: 10101,
    firstAscent: '1956',
    difficulty: 'High-altitude expedition',
    description:
      'Nepal’s “Mountain of the Spirit,” an 8,000-meter Mansiri Himal peak with a classic northeast face route.',
  },
  nanga: {
    prominenceFt: 15060,
    firstAscent: '1953',
    difficulty: 'Extreme expedition',
    description:
      'The westernmost Himalayan giant, rising abruptly above the Indus with legendary Rupal and Diamir faces.',
  },
  annapurna: {
    prominenceFt: 9780,
    firstAscent: '1950',
    difficulty: 'Extreme expedition',
    description:
      'The first 8,000-meter peak ever climbed, still among the most dangerous high mountains on Earth.',
  },
  gasherbrum1: {
    prominenceFt: 7070,
    firstAscent: '1958',
    difficulty: 'High-altitude expedition',
    description:
      'Hidden Peak of the Karakoram, an 8,000-meter neighbor of Broad Peak in the Gasherbrum group.',
  },
  broadpeak: {
    prominenceFt: 5610,
    firstAscent: '1957',
    difficulty: 'High-altitude expedition',
    description:
      'A long Karakoram ridge peak beside K2, climbed via a classic snow-and-ice West Ridge style route.',
  },
  gasherbrum2: {
    prominenceFt: 5000,
    firstAscent: '1956',
    difficulty: 'High-altitude expedition',
    description:
      'Often the first Karakoram 8,000er for expedition climbers, a steep pyramid above the Baltoro Glacier.',
  },
  shishapangma: {
    prominenceFt: 9511,
    firstAscent: '1964',
    difficulty: 'High-altitude expedition',
    description:
      'The only 8,000-meter peak lying entirely in China/Tibet, long closed and later a popular Tibetan expedition.',
  },
  ama: {
    prominenceFt: 3350,
    firstAscent: '1961',
    difficulty: 'Technical alpine',
    description:
      'The “Matterhorn of the Himalaya,” a striking Khumbu spire more technical than many taller neighbors.',
  },
  island: {
    prominenceFt: 1565,
    firstAscent: '1953',
    difficulty: 'Trekking peak',
    description:
      'Imja Tse, a popular Khumbu trekking peak used as an introduction to Himalayan glacier and rope travel.',
  },
  stok: {
    prominenceFt: 4511,
    firstAscent: '1951',
    difficulty: 'Trekking peak',
    description:
      'A popular Ladakh trekking peak near Leh, combining high altitude with a relatively accessible summit day.',
  },
  nanda: {
    prominenceFt: 10291,
    firstAscent: '1939',
    difficulty: 'Technical expedition',
    description:
      'India’s second-highest peak, a sacred Garhwal sanctuary mountain long restricted after early expeditions.',
  },
  trisul: {
    prominenceFt: 5289,
    firstAscent: '1907',
    difficulty: 'Alpine climb',
    description:
      'A three-peaked Garhwal massif near Nanda Devi, historically significant in early Himalayan exploration.',
  },
  fuji: {
    prominenceFt: 12388,
    firstAscent: '663 (legendary) / historic',
    difficulty: 'Class 1 hike',
    description:
      'Japan’s sacred stratovolcano and cultural icon, climbed by busy summer trails to a crater-rim shrine circuit.',
  },
  yari: {
    prominenceFt: 4101,
    firstAscent: '1826',
    difficulty: 'Class 2–3 scramble',
    description:
      'The “Matterhorn of Japan” in the Northern Alps, a sharp ridgeline peak on classic hut-to-hut routes.',
  },
  hallasan: {
    prominenceFt: 6398,
    firstAscent: 'Historic',
    difficulty: 'Class 1 hike',
    description:
      'South Korea’s high point, a shield volcano forming Jeju Island with crater-lake trails to the summit.',
  },
  cook: {
    prominenceFt: 12218,
    firstAscent: '1894',
    difficulty: 'Alpine ice / rock',
    description:
      'Aoraki, the highest peak in New Zealand, a glaciated Southern Alps icon above the Hooker and Tasman valleys.',
  },
  aspiring: {
    prominenceFt: 8091,
    firstAscent: '1909',
    difficulty: 'Alpine climb',
    description:
      'Tititea, the “Matterhorn of the South,” a elegant Southern Alps pyramid in Mount Aspiring National Park.',
  },
  tasman: {
    prominenceFt: 5587,
    firstAscent: '1895',
    difficulty: 'Alpine ice',
    description:
      'New Zealand’s second-highest peak, a heavily glaciated neighbor of Aoraki on the Main Divide.',
  },
  kosciuszko: {
    prominenceFt: 7310,
    firstAscent: '1840',
    difficulty: 'Class 1 hike',
    description:
      'Australia’s high point in the Snowy Mountains, a gentle alpine walk above Thredbo and Charlotte Pass.',
  },
  townsend: {
    prominenceFt: 1893,
    firstAscent: '1840s',
    difficulty: 'Class 1 hike',
    description:
      'Australia’s second-highest summit, a short alpine ridge away from Kosciuszko on the Main Range.',
  },
  galdhopiggen: {
    prominenceFt: 7782,
    firstAscent: '1850',
    difficulty: 'Class 1–2 hike',
    description:
      'Northern Europe’s highest mountain, a popular Jotunheimen hike with glacier and non-glacier approaches.',
  },
  kebnekaise: {
    prominenceFt: 5709,
    firstAscent: '1883',
    difficulty: 'Class 2 hike',
    description:
      'Sweden’s high point in Lapland, a shifting glaciated summit above classic Arctic trail country.',
  },
  halti: {
    prominenceFt: 1683,
    firstAscent: 'Historic',
    difficulty: 'Class 1 hike',
    description:
      'Finland’s high point on the Norwegian border, a gentle fell summit on the edge of Scandinavian mountain terrain.',
  },
  musala: {
    prominenceFt: 8117,
    firstAscent: 'Historic',
    difficulty: 'Class 1 hike',
    description:
      'The Balkan Peninsula’s highest peak in Bulgaria’s Rila Mountains, reached by marked alpine trails.',
  },
  olympus: {
    prominenceFt: 7720,
    firstAscent: '1913',
    difficulty: 'Class 2–3 scramble',
    description:
      'Mythic home of the Greek gods, a rugged Olympus Massif climb to Mytikas above the Aegean foothills.',
  },
  mulhacen: {
    prominenceFt: 10780,
    firstAscent: 'Historic',
    difficulty: 'Class 1 hike',
    description:
      'The Iberian Peninsula’s high point in Spain’s Sierra Nevada, a long alpine walk above Granada.',
  },
  teide: {
    prominenceFt: 12198,
    firstAscent: 'Historic / 1582 recorded',
    difficulty: 'Class 1 hike',
    description:
      'Spain’s highest peak and a towering Canary Islands volcano above Tenerife’s caldera landscapes.',
  },
  citlaltepetl: {
    prominenceFt: 5020,
    firstAscent: '1889',
    difficulty: 'Snow / glacier climb',
    description:
      'Iztaccíhuatl, the “White Woman” volcano beside Popocatépetl, a long snow ridge above the Valley of Mexico.',
  },
  illampu: {
    prominenceFt: 6362,
    firstAscent: '1928',
    difficulty: 'Technical alpine',
    description:
      'A steep Cordillera Real ice peak near Sorata, regarded as one of Bolivia’s more difficult high summits.',
  },
  alpamayo: {
    prominenceFt: 2654,
    firstAscent: '1957',
    difficulty: 'Technical alpine',
    description:
      'Often called the world’s most beautiful mountain, a fluted Cordillera Blanca pyramid of steep snow and ice.',
  },
  huayna: {
    prominenceFt: 3894,
    firstAscent: '1919',
    difficulty: 'Glacier climb',
    description:
      'A popular Cordillera Real training peak near La Paz, offering high-altitude glacier travel with hut access.',
  },
  rittenhouse: {
    prominenceFt: 16050,
    firstAscent: '1966',
    difficulty: 'Polar expedition',
    description:
      'Mount Vinson, Antarctica’s high point in the Ellsworth Mountains, a remote polar expedition objective.',
  },
  sidley: {
    prominenceFt: 8373,
    firstAscent: '1990',
    difficulty: 'Polar expedition',
    description:
      'The highest volcano in Antarctica, a remote Executive Committee Range summit in Marie Byrd Land.',
  },
  mitchell: {
    prominenceFt: 6089,
    firstAscent: '1835 (recorded)',
    difficulty: 'Class 1 hike',
    description:
      'The highest peak east of the Mississippi, a forested Appalachian summit in North Carolina.',
  },
  katahdin: {
    prominenceFt: 4288,
    firstAscent: '1804',
    difficulty: 'Class 2–3 scramble',
    description:
      'Maine’s high point and the northern terminus of the Appalachian Trail, a rugged Baxter Peak above Knife Edge.',
  },
  marcy: {
    prominenceFt: 4914,
    firstAscent: '1837',
    difficulty: 'Class 1–2 hike',
    description:
      'New York’s high point in the Adirondacks, a long forest-and-alpine hike to the roof of the Empire State.',
  },
  washington: {
    prominenceFt: 6148,
    firstAscent: '1642',
    difficulty: 'Class 1–2 hike',
    description:
      'The Northeast’s weather-extreme peak in New Hampshire’s Presidential Range, famous for alpine conditions.',
  },
  timpanogos: {
    prominenceFt: 5269,
    firstAscent: '1870s',
    difficulty: 'Class 2 hike',
    description:
      'A Wasatch Range classic above Utah Valley, a long ridge hike with cirques, wildflowers, and summit views.',
  },
  lonepeak: {
    prominenceFt: 2719,
    firstAscent: 'Historic',
    difficulty: 'Class 3–4 scramble',
    description:
      'A sharp Wasatch granite summit above Salt Lake County, popular with scramblers and alpine climbers.',
  },
  grandteton: {
    prominenceFt: 6530,
    firstAscent: '1898',
    difficulty: 'Technical alpine',
    description:
      'The centerpiece of the Teton Range, a steep rock-and-snow climb above Jenny Lake and the Wyoming valley floor.',
  },
  moran: {
    prominenceFt: 2625,
    firstAscent: '1922',
    difficulty: 'Technical alpine',
    description:
      'A remote Teton massif known for long approaches and serious alpine rock routes above Jackson Lake.',
  },
  cloudpeak: {
    prominenceFt: 7067,
    firstAscent: '1897',
    difficulty: 'Class 3 scramble',
    description:
      'The high point of Wyoming’s Bighorn Mountains, a wilderness scramble above glacier-carved basins.',
  },
  blanca: {
    prominenceFt: 5326,
    firstAscent: '1874',
    difficulty: 'Class 2–3 scramble',
    description:
      'The monarch of the Sangre de Cristo, a high Colorado fourteener above the San Luis Valley.',
  },
  crestone: {
    prominenceFt: 4534,
    firstAscent: '1916',
    difficulty: 'Class 3 scramble',
    description:
      'A rugged Sangre de Cristo fourteener, often linked with Crestone Needle on classic Colorado ridge days.',
  },
  capitol: {
    prominenceFt: 1750,
    firstAscent: '1909',
    difficulty: 'Class 4 scramble',
    description:
      'An Elk Mountains knife-edge classic near Aspen, one of Colorado’s more committing fourteeners.',
  },
  pyramid: {
    prominenceFt: 1638,
    firstAscent: '1909',
    difficulty: 'Class 4 scramble',
    description:
      'A steep Elk Mountains fourteener above Maroon Creek, known for loose rock and exposed summit ridges.',
  },
}

const peaks = JSON.parse(readFileSync(path, 'utf8'))
const missing = []

for (const peak of peaks) {
  const d = details[peak.id]
  if (!d) {
    missing.push(peak.id)
    continue
  }
  peak.prominenceFt = d.prominenceFt
  peak.firstAscent = d.firstAscent
  peak.difficulty = d.difficulty
  peak.description = d.description
}

if (missing.length) {
  console.error('Missing enrichment for:', missing.join(', '))
  process.exit(1)
}

// Merge curated fields in place — never strip photos / nearbyPlaces / content.
writeFileSync(path, `${JSON.stringify(peaks, null, 2)}\n`)
console.log(`Enriched ${peaks.length} peaks (photos & extra fields preserved).`)
