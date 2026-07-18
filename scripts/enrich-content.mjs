/**
 * Adds aliases, bestSeason, and whyNotable to peaks.json without stripping
 * photos / nearbyPlaces / other fields.
 *
 * Run: node scripts/enrich-content.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const path = join(root, 'src', 'data', 'peaks.json')

/** @type {Record<string, { aliases?: string[], bestSeason: string, whyNotable: string }>} */
const content = {
  rainier: {
    aliases: ['Tahoma'],
    bestSeason: 'Jul–Sep',
    whyNotable: 'Most glaciated peak in the contiguous United States.',
  },
  shasta: {
    aliases: ['Uytaahkoo'],
    bestSeason: 'May–Jul',
    whyNotable: 'A lone Cascade volcano that dominates northern California.',
  },
  hood: {
    aliases: ['Wy’east'],
    bestSeason: 'May–Jul',
    whyNotable: 'Oregon’s signature volcano and a classic Pacific Northwest climb.',
  },
  baker: {
    aliases: ['Koma Kulshan'],
    bestSeason: 'Jun–Sep',
    whyNotable: 'The northernmost Cascade volcano in the contiguous U.S.',
  },
  adams: {
    aliases: ['Pahto'],
    bestSeason: 'Jul–Sep',
    whyNotable: 'Washington’s second-highest volcano, quieter than Rainier.',
  },
  denali: {
    aliases: ['Mount McKinley'],
    bestSeason: 'May–Jul',
    whyNotable: 'North America’s highest mountain and a polar altitude test.',
  },
  elbert: {
    bestSeason: 'Jul–Sep',
    whyNotable: 'Highest summit in the Rocky Mountains and Colorado’s high point.',
  },
  whitney: {
    bestSeason: 'Jul–Sep',
    whyNotable: 'Highest peak in the contiguous United States.',
  },
  longs: {
    bestSeason: 'Jul–Sep',
    whyNotable: 'Front Range fourteener crowned by the famous Keyhole Route.',
  },
  pikes: {
    bestSeason: 'Jun–Oct',
    whyNotable: 'Colorado icon with a road, cog railway, and vast prairie views.',
  },
  gannett: {
    bestSeason: 'Jul–Sep',
    whyNotable: 'Wyoming’s high point, deep in the Wind River wilderness.',
  },
  granitet: {
    aliases: ['Granite Peak'],
    bestSeason: 'Jul–Sep',
    whyNotable: 'Montana’s technical state high point in the Beartooths.',
  },
  kings: {
    bestSeason: 'Jul–Sep',
    whyNotable: 'Utah’s high point, a long Uintas backpack to the summit ridge.',
  },
  humphreys: {
    bestSeason: 'Jun–Oct',
    whyNotable: 'Arizona’s high point on the San Francisco Peaks volcanic field.',
  },
  guadalupe: {
    bestSeason: 'Oct–Apr',
    whyNotable: 'Texas high point rising abruptly from the Chihuahuan Desert.',
  },
  robson: {
    bestSeason: 'Jul–Aug',
    whyNotable: 'Canadian Rockies giant with one of the range’s biggest faces.',
  },
  logan: {
    bestSeason: 'May–Jul',
    whyNotable: 'Canada’s highest mountain, a vast Yukon ice massif.',
  },
  waddington: {
    bestSeason: 'Jul–Aug',
    whyNotable: 'British Columbia’s highest peak, remote Coast Range alpine.',
  },
  columbia: {
    bestSeason: 'Jul–Aug',
    whyNotable: 'Alberta’s high point on the Columbia Icefield divide.',
  },
  assini: {
    aliases: ['Mount Assiniboine'],
    bestSeason: 'Jul–Sep',
    whyNotable: 'The “Matterhorn of the Rockies,” a perfect pyramidal summit.',
  },
  orizaba: {
    aliases: ['Citlaltépetl', 'Pico de Orizaba'],
    bestSeason: 'Nov–Mar',
    whyNotable: 'Mexico’s highest peak and the tallest volcano in North America.',
  },
  popo: {
    aliases: ['Popocatépetl', 'El Popo'],
    bestSeason: 'Nov–Mar',
    whyNotable: 'Mexico’s legendary smoking volcano above the Valley of Mexico.',
  },
  aconcagua: {
    bestSeason: 'Dec–Feb',
    whyNotable: 'Highest mountain outside Asia and the Andes’ great prize.',
  },
  huascaran: {
    aliases: ['Huascarán'],
    bestSeason: 'Jun–Aug',
    whyNotable: 'Peru’s high point and the crown of the Cordillera Blanca.',
  },
  illimani: {
    bestSeason: 'May–Sep',
    whyNotable: 'The great ice pyramid watching over La Paz.',
  },
  chimborazo: {
    bestSeason: 'Dec–Jan or Jun–Jul',
    whyNotable: 'The farthest point from Earth’s center due to equatorial bulge.',
  },
  cotopaxi: {
    bestSeason: 'Dec–Apr',
    whyNotable: 'One of the world’s highest active volcanoes, Ecuador’s icon.',
  },
  fitzroy: {
    aliases: ['Cerro Fitz Roy', 'Chaltén'],
    bestSeason: 'Nov–Mar',
    whyNotable: 'Patagonia’s granite spire and a world-class alpine objective.',
  },
  torres: {
    aliases: ['Torres del Paine'],
    bestSeason: 'Nov–Mar',
    whyNotable: 'The famous towers that define Patagonian trekking.',
  },
  sajama: {
    aliases: ['Nevado Sajama'],
    bestSeason: 'May–Sep',
    whyNotable: 'Bolivia’s highest peak, a lonely volcano on the Altiplano.',
  },
  ausangate: {
    aliases: ['Apu Ausangate'],
    bestSeason: 'May–Sep',
    whyNotable: 'Sacred Andean apu and the heart of Peru’s high circuit treks.',
  },
  montblanc: {
    aliases: ['Monte Bianco', 'Mont Blanc'],
    bestSeason: 'Jun–Sep',
    whyNotable: 'The roof of the Alps and Western Europe’s highest summit.',
  },
  matterhorn: {
    aliases: ['Cervino', 'Matterhorn'],
    bestSeason: 'Jul–Sep',
    whyNotable: 'The world’s most recognized mountain silhouette.',
  },
  jungfrau: {
    bestSeason: 'Jul–Sep',
    whyNotable: 'Bernese Oberland classic above the Jungfraujoch.',
  },
  eiger: {
    bestSeason: 'Jul–Sep',
    whyNotable: 'Infamous for its North Face, the Nordwand.',
  },
  grossglockner: {
    aliases: ['Großglockner'],
    bestSeason: 'Jul–Sep',
    whyNotable: 'Austria’s highest mountain and an Eastern Alps landmark.',
  },
  triglav: {
    bestSeason: 'Jul–Sep',
    whyNotable: 'Slovenia’s national mountain and a symbol of the Julian Alps.',
  },
  ortles: {
    aliases: ['Ortler'],
    bestSeason: 'Jun–Sep',
    whyNotable: 'Highest peak in the Eastern Alps outside the Bernina.',
  },
  marmolada: {
    bestSeason: 'Jun–Sep',
    whyNotable: 'Queen of the Dolomites, with a glacier and vast limestone walls.',
  },
  barreuils: {
    aliases: ['Barre des Écrins'],
    bestSeason: 'Jun–Sep',
    whyNotable: 'High point of the Écrins and the southern French Alps.',
  },
  elbrus: {
    bestSeason: 'Jun–Aug',
    whyNotable: 'Europe’s conventional high point on a twin-summited volcano.',
  },
  kazbek: {
    aliases: ['Mount Kazbek', 'Mkinvartsveri'],
    bestSeason: 'Jun–Sep',
    whyNotable: 'Georgia’s storied Caucasus giant above the Georgian Military Highway.',
  },
  damavand: {
    aliases: ['Mount Damavand'],
    bestSeason: 'Jun–Sep',
    whyNotable: 'Iran’s highest peak and the tallest volcano in Asia.',
  },
  ararat: {
    aliases: ['Ağrı Dağı', 'Mount Ararat'],
    bestSeason: 'Jul–Sep',
    whyNotable: 'Turkey’s iconic twin-peaked volcano of legend and national identity.',
  },
  kilimanjaro: {
    aliases: ['Uhuru Peak', 'Kibo'],
    bestSeason: 'Jan–Mar or Jun–Oct',
    whyNotable: 'Africa’s highest mountain — a non-technical trek to extreme altitude.',
  },
  kenya: {
    aliases: ['Mount Kenya', 'Kirinyaga'],
    bestSeason: 'Jan–Feb or Aug–Sep',
    whyNotable: 'Africa’s second-highest peak, technical rock above the treeline.',
  },
  toubkal: {
    aliases: ['Jebel Toubkal'],
    bestSeason: 'May–Oct',
    whyNotable: 'Highest peak in North Africa and the Atlas Mountains.',
  },
  rasdashen: {
    aliases: ['Ras Dejen', 'Ras Dashen'],
    bestSeason: 'Oct–Mar',
    whyNotable: 'Ethiopia’s high point in the Simien Mountains massif.',
  },
  table: {
    aliases: ['Table Mountain', 'Hoerikwaggo'],
    bestSeason: 'Nov–Mar',
    whyNotable: 'Cape Town’s flat-topped landmark and a World Heritage icon.',
  },
  meru: {
    aliases: ['Mount Meru'],
    bestSeason: 'Jun–Feb',
    whyNotable: 'Tanzania’s dramatic crater volcano and Kilimanjaro’s neighbor.',
  },
  everest: {
    aliases: ['Sagarmatha', 'Chomolungma', 'Qomolangma'],
    bestSeason: 'Apr–May or Sep–Oct',
    whyNotable: 'The highest point on Earth.',
  },
  k2: {
    aliases: ['Mount Godwin-Austen', 'Chogori'],
    bestSeason: 'Jun–Aug',
    whyNotable: 'The savage mountain — second highest, far more committing than Everest.',
  },
  kangchen: {
    aliases: ['Kangchenjunga'],
    bestSeason: 'Apr–May or Sep–Oct',
    whyNotable: 'The world’s third-highest peak, sacred and rarely summited for years.',
  },
  lhotse: {
    bestSeason: 'Apr–May or Sep–Oct',
    whyNotable: 'Everest’s neighbor and the world’s fourth-highest mountain.',
  },
  makalu: {
    bestSeason: 'Apr–May or Sep–Oct',
    whyNotable: 'A perfect pyramid and the world’s fifth-highest peak.',
  },
  chooyu: {
    aliases: ['Cho Oyu'],
    bestSeason: 'Apr–May or Sep–Oct',
    whyNotable: 'Often called the most “accessible” 8,000er — still extreme altitude.',
  },
  dhaula: {
    aliases: ['Dhaulagiri'],
    bestSeason: 'Apr–May or Sep–Oct',
    whyNotable: 'A vast white Himalayan wall and the world’s seventh-highest peak.',
  },
  manaslu: {
    bestSeason: 'Apr–May or Sep–Oct',
    whyNotable: 'The “mountain of the spirit,” Nepal’s classic 8,000er circuit peak.',
  },
  nanga: {
    aliases: ['Nanga Parbat', 'Diamir'],
    bestSeason: 'Jun–Jul',
    whyNotable: 'The western Himalaya’s killer mountain, famous for its Rupal Face.',
  },
  annapurna: {
    aliases: ['Annapurna I'],
    bestSeason: 'Apr–May or Sep–Oct',
    whyNotable: 'First 8,000er climbed — still among the most dangerous.',
  },
  gasherbrum1: {
    aliases: ['Gasherbrum I', 'Hidden Peak'],
    bestSeason: 'Jun–Aug',
    whyNotable: 'Karakoram 8,000er known as Hidden Peak.',
  },
  broadpeak: {
    aliases: ['Broad Peak', 'Faichan Kangri'],
    bestSeason: 'Jun–Aug',
    whyNotable: 'A long summit ridge opposite K2 in the Karakoram.',
  },
  gasherbrum2: {
    aliases: ['Gasherbrum II'],
    bestSeason: 'Jun–Aug',
    whyNotable: 'Often the “friendliest” Karakoram 8,000er — still serious.',
  },
  shishapangma: {
    aliases: ['Shishapangma', 'Gosainthan'],
    bestSeason: 'Apr–May or Sep–Oct',
    whyNotable: 'The only 8,000er entirely in Tibet / China.',
  },
  ama: {
    aliases: ['Ama Dablam'],
    bestSeason: 'Apr–May or Oct–Nov',
    whyNotable: 'Nepal’s “Matterhorn” — the most photographed Himalayan spire.',
  },
  island: {
    aliases: ['Island Peak', 'Imja Tse'],
    bestSeason: 'Apr–May or Oct–Nov',
    whyNotable: 'Classic Everest-region trekking peak and alpine intro.',
  },
  stok: {
    aliases: ['Stok Kangri'],
    bestSeason: 'Jul–Sep',
    whyNotable: 'Ladakh’s popular high trekking peak above the Indus Valley.',
  },
  nanda: {
    aliases: ['Nanda Devi'],
    bestSeason: 'May–Jun or Sep–Oct',
    whyNotable: 'India’s second-highest peak, once closed as a sacred sanctuary.',
  },
  trisul: {
    aliases: ['Trisul'],
    bestSeason: 'May–Jun or Sep–Oct',
    whyNotable: 'A striking Garhwal triple-summit massif near Nanda Devi.',
  },
  fuji: {
    aliases: ['Fujisan', '富士山'],
    bestSeason: 'Jul–early Sep',
    whyNotable: 'Japan’s sacred icon and the country’s most climbed mountain.',
  },
  yari: {
    aliases: ['Mount Yari', 'Yarigatake'],
    bestSeason: 'Jul–Sep',
    whyNotable: 'The “Matterhorn of Japan” on the North Alps ridgeline.',
  },
  hallasan: {
    aliases: ['Hallasan', '한라산'],
    bestSeason: 'Apr–Nov',
    whyNotable: 'South Korea’s high point, a shield volcano crowning Jeju Island.',
  },
  cook: {
    aliases: ['Aoraki', 'Aoraki / Mount Cook'],
    bestSeason: 'Nov–Mar',
    whyNotable: 'New Zealand’s highest peak and the heart of the Southern Alps.',
  },
  aspiring: {
    aliases: ['Mount Aspiring', 'Tititea'],
    bestSeason: 'Nov–Mar',
    whyNotable: 'The “Matterhorn of the South,” New Zealand’s classic alpine peak.',
  },
  tasman: {
    aliases: ['Mount Tasman'],
    bestSeason: 'Nov–Mar',
    whyNotable: 'New Zealand’s second-highest summit on the main divide.',
  },
  kosciuszko: {
    aliases: ['Mount Kosciuszko'],
    bestSeason: 'Dec–Mar',
    whyNotable: 'Australia’s high point — an accessible alpine walk in the Snowies.',
  },
  townsend: {
    aliases: ['Mount Townsend'],
    bestSeason: 'Dec–Mar',
    whyNotable: 'Often mistaken for Kosciuszko; Australia’s true runner-up summit.',
  },
  galdhopiggen: {
    aliases: ['Galdhøpiggen'],
    bestSeason: 'Jun–Sep',
    whyNotable: 'Northern Europe’s highest mountain, in Norway’s Jotunheimen.',
  },
  kebnekaise: {
    bestSeason: 'Jun–Sep',
    whyNotable: 'Sweden’s high point, with a shifting glacial summit.',
  },
  halti: {
    aliases: ['Haltitunturi'],
    bestSeason: 'Jun–Sep',
    whyNotable: 'Finland’s high point on the Norwegian border fells.',
  },
  musala: {
    bestSeason: 'Jun–Sep',
    whyNotable: 'The Balkans’ highest peak, in Bulgaria’s Rila Mountains.',
  },
  olympus: {
    aliases: ['Mount Olympus', 'Ólympos'],
    bestSeason: 'Jun–Sep',
    whyNotable: 'Mythic home of the gods and Greece’s highest mountain.',
  },
  mulhacen: {
    aliases: ['Mulhacén'],
    bestSeason: 'Jun–Oct',
    whyNotable: 'Iberia’s highest peak, rising above the Sierra Nevada.',
  },
  teide: {
    aliases: ['El Teide', 'Pico del Teide'],
    bestSeason: 'May–Oct',
    whyNotable: 'Spain’s highest mountain and a massive Atlantic volcano.',
  },
  citlaltepetl: {
    aliases: ['Pico de Orizaba', 'Citlaltépetl'],
    bestSeason: 'Nov–Mar',
    whyNotable: 'Alternate atlas entry for Mexico’s great ice volcano.',
  },
  illampu: {
    bestSeason: 'May–Sep',
    whyNotable: 'A sharp Cordillera Real giant north of Lake Titicaca.',
  },
  alpamayo: {
    bestSeason: 'Jun–Aug',
    whyNotable: 'Often called the world’s most beautiful mountain.',
  },
  huayna: {
    aliases: ['Huayna Potosí'],
    bestSeason: 'May–Sep',
    whyNotable: 'La Paz’s backyard 6,000er — a classic first big Andean climb.',
  },
  rittenhouse: {
    aliases: ['Mount Vinson'],
    bestSeason: 'Nov–Jan',
    whyNotable: 'Antarctica’s high point and a Seven Summits objective.',
  },
  sidley: {
    aliases: ['Mount Sidley'],
    bestSeason: 'Nov–Jan',
    whyNotable: 'Antarctica’s highest volcano, remote even by polar standards.',
  },
  mitchell: {
    bestSeason: 'May–Oct',
    whyNotable: 'Highest peak east of the Mississippi in the U.S.',
  },
  katahdin: {
    aliases: ['Katahdin'],
    bestSeason: 'Jul–Sep',
    whyNotable: 'Northern terminus of the Appalachian Trail in Maine.',
  },
  marcy: {
    aliases: ['Mount Marcy', 'Tahawus'],
    bestSeason: 'Jun–Oct',
    whyNotable: 'New York’s high point and the Adirondack crown.',
  },
  washington: {
    aliases: ['Mount Washington', 'Agiocochook'],
    bestSeason: 'Jun–Sep',
    whyNotable: 'Home to some of the world’s most extreme recorded weather.',
  },
  timpanogos: {
    aliases: ['Mount Timpanogos'],
    bestSeason: 'Jul–Sep',
    whyNotable: 'Utah’s beloved Wasatch giant above Utah Valley.',
  },
  lonepeak: {
    aliases: ['Lone Peak'],
    bestSeason: 'Jul–Sep',
    whyNotable: 'A sharp granite Wasatch summit above Salt Lake’s southern ridge.',
  },
  grandteton: {
    aliases: ['Grand Teton', 'The Grand'],
    bestSeason: 'Jul–Sep',
    whyNotable: 'The classic American alpine peak of the Teton Range.',
  },
  moran: {
    aliases: ['Mount Moran'],
    bestSeason: 'Jul–Sep',
    whyNotable: 'A broad Teton fortress above Jackson Lake.',
  },
  cloudpeak: {
    bestSeason: 'Jul–Sep',
    whyNotable: 'High point of Wyoming’s Bighorn Mountains wilderness.',
  },
  blanca: {
    aliases: ['Blanca Peak', 'Sisnaajiní'],
    bestSeason: 'Jul–Sep',
    whyNotable: 'Monarch of the Sangre de Cristo and a sacred Navajo peak.',
  },
  crestone: {
    aliases: ['Crestone Peak'],
    bestSeason: 'Jul–Sep',
    whyNotable: 'A rugged Colorado fourteener in the Crestone group.',
  },
  capitol: {
    aliases: ['Capitol Peak'],
    bestSeason: 'Jul–Sep',
    whyNotable: 'Colorado’s knife-edge fourteener near Aspen.',
  },
  pyramid: {
    aliases: ['Pyramid Peak'],
    bestSeason: 'Jul–Sep',
    whyNotable: 'A steep Elk Mountains fourteener above Maroon Creek.',
  },
}

function defaultSeason(peak) {
  const { lat, country, elevationFt } = peak
  const himalaya = ['Nepal', 'Pakistan', 'China', 'India', 'Bhutan', 'Tibet']
  if (himalaya.includes(country) && elevationFt >= 20000) {
    return 'Apr–May or Sep–Oct'
  }
  if (country === 'Antarctica') return 'Nov–Jan'
  if (lat < -20) return 'Dec–Mar'
  if (lat > 60) return 'Jul–Aug'
  if (Math.abs(lat) < 15) return 'Dry season (local timing varies)'
  if (lat > 40) return 'Jul–Sep'
  if (lat > 25) return 'May–Oct'
  return 'Jun–Sep'
}

function defaultWhy(peak) {
  const first = (peak.description || '').split(/[.!?]/)[0]?.trim()
  if (first && first.length > 20 && first.length < 140) return `${first}.`
  return `${peak.name} in the ${peak.range}, ${peak.country}.`
}

const peaks = JSON.parse(readFileSync(path, 'utf8'))
const missing = []

for (const peak of peaks) {
  const row = content[peak.id]
  if (!row) {
    missing.push(peak.id)
    peak.bestSeason = peak.bestSeason || defaultSeason(peak)
    peak.whyNotable = peak.whyNotable || defaultWhy(peak)
    continue
  }
  if (row.aliases?.length) peak.aliases = row.aliases
  peak.bestSeason = row.bestSeason
  peak.whyNotable = row.whyNotable
}

writeFileSync(path, `${JSON.stringify(peaks, null, 2)}\n`)

if (missing.length) {
  console.warn('No curated row (used defaults):', missing.join(', '))
}
console.log(
  `Content enriched: ${peaks.length} peaks · with aliases=${peaks.filter((p) => p.aliases?.length).length}`,
)
