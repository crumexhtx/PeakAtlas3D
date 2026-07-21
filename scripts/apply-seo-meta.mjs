/**
 * Apply seoMetaDescription to peaks.json in batches.
 * Usage: node scripts/apply-seo-meta.mjs [startIndex] [count]
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const peaksPath = join(root, 'src', 'data', 'peaks.json')

/** @type {Record<string, string>} */
const SEO = {
  rainier:
    'Explore Mt. Rainier on a 3D topographic map — Cascade glaciers, elevation, Wonderland trails, and nearby Paradise staging towns.',
  shasta:
    'Explore Mt. Shasta on a 3D map — Cascade volcano topography, Avalanche Gulch context, elevation stats, and northern California approaches.',
  hood:
    'Explore Mt. Hood on a 3D topographic map — Oregon Cascade snow routes, Timberline context, elevation, and Columbia Gorge staging towns.',
  baker:
    'Explore Mt. Baker on a 3D map — northern Cascade glaciers, ski-mountaineering terrain, elevation stats, and Pacific Northwest approaches.',
  adams:
    'Explore Mt. Adams on a 3D topographic map — Washington’s second-highest Cascade volcano, snow slopes, elevation, and quieter trailheads.',
  denali:
    'Explore Denali on a 3D topographic map — Alaska Range massif, West Buttress context, elevation, and North America’s highest summit terrain.',
  elbert:
    'Explore Mt. Elbert on a 3D map — Colorado’s Rocky Mountain high point, Sawatch Range topography, elevation stats, and walk-up approaches.',
  whitney:
    'Explore Mt. Whitney on a 3D topographic map — contiguous U.S. high point, Sierra Nevada trails, elevation, and Lone Pine staging towns.',
  longs:
    'Explore Longs Peak on a 3D map — Front Range fourteener topography, Keyhole Route context, elevation, and Rocky Mountain National Park.',
  pikes:
    'Explore Pikes Peak on a 3D topographic map — Colorado Springs landmark, Front Range views, elevation stats, and highway or trail approaches.',
  gannett:
    'Explore Gannett Peak on a 3D map — Wyoming’s high point in the Wind River Range, glacier approaches, elevation, and remote wilderness staging.',
  granitet:
    'Explore Granite Peak on a 3D topographic map — Montana’s Beartooth high point, technical scramble terrain, elevation, and alpine approaches.',
  kings:
    'Explore Kings Peak on a 3D map — Utah’s Uinta Mountains high point, long alpine hike context, elevation stats, and backcountry staging towns.',
  humphreys:
    'Explore Humphreys Peak on a 3D topographic map — Arizona’s San Francisco Peaks high point, forested volcano terrain, and Flagstaff approaches.',
  guadalupe:
    'Explore Guadalupe Peak on a 3D map — Texas high point above the Chihuahuan Desert, Guadalupe Mountains trails, elevation, and park approaches.',
  robson:
    'Explore Mt. Robson on a 3D topographic map — Canadian Rockies giant, Berg Lake approaches, elevation stats, and ice-and-rock summit terrain.',
  logan:
    'Explore Mt. Logan on a 3D map — Canada’s highest mountain in the Saint Elias icefields, expedition terrain, elevation, and Kluane approaches.',
  waddington:
    'Explore Mt. Waddington on a 3D topographic map — British Columbia’s Coast Mountains high point, remote alpine ice, elevation, and approach towns.',
  columbia:
    'Explore Mt. Columbia on a 3D map — Canadian Rockies icefield summit, Continental Divide terrain, elevation stats, and Columbia Icefield staging.',
  assini:
    'Explore Mt. Assiniboine on a 3D topographic map — the Matterhorn of the Rockies, pyramidal summit terrain, elevation, and Alberta–B.C. approaches.',
  orizaba:
    'Explore Pico de Orizaba on a 3D map — Mexico’s highest volcano, Jamapa Glacier context, elevation stats, and Trans-Mexican Volcanic Belt terrain.',
  popo:
    'Explore Popocatépetl on a 3D topographic map — Mexico’s active volcano above the Valley of Mexico, elevation, and historic approach context.',
  aconcagua:
    'Explore Aconcagua on a 3D map — Western Hemisphere high point in the Andes, high-altitude trek terrain, elevation, and Mendoza staging towns.',
  huascaran:
    'Explore Huascarán on a 3D topographic map — Peru’s Cordillera Blanca high point, twin ice summits, elevation, and classic Andean expedition terrain.',
  illimani:
    'Explore Illimani on a 3D map — Cordillera Real ice pyramid above La Paz, Altiplano views, elevation stats, and Bolivian alpine approaches.',
  chimborazo:
    'Explore Chimborazo on a 3D topographic map — Ecuador’s farthest-from-center summit, glacier routes, elevation, and high-Andes volcano terrain.',
  cotopaxi:
    'Explore Cotopaxi on a 3D map — one of the world’s highest active volcanoes, Ecuador cone topography, elevation, and classic high-Andes climbs.',
  fitzroy:
    'Explore Cerro Fitz Roy on a 3D topographic map — Patagonian granite spire above El Chaltén, elite alpine terrain, elevation, and wind-scoured valleys.',
  torres:
    'Explore Torres del Paine on a 3D map — Patagonia’s famous granite towers, park topography, elevation stats, and classic Chilean trek approaches.',
  sajama:
    'Explore Sajama on a 3D topographic map — Bolivia’s highest volcano on the Altiplano, snow routes, elevation, and remote Andean border approaches.',
  ausangate:
    'Explore Ausangate on a 3D map — sacred Cordillera Vilcanota apu near Cusco, circuit trek terrain, elevation stats, and high-Andean approaches.',
  montblanc:
    'Explore Mont Blanc on a 3D topographic map — Western Europe’s high point, Alps glacier routes, elevation, and Chamonix–Courmayeur staging towns.',
  matterhorn:
    'Explore the Matterhorn on a 3D map — iconic Alpine pyramid on the Swiss–Italian border, classic ridges, elevation, and Zermatt approach context.',
  jungfrau:
    'Explore the Jungfrau on a 3D topographic map — Bernese Oberland ice summit, Jungfraujoch context, elevation stats, and Swiss Alps staging towns.',
  eiger:
    'Explore the Eiger on a 3D map — legendary North Face terrain in the Bernese Alps, elevation, classic alpine routes, and Grindelwald approaches.',
  grossglockner:
    'Explore Grossglockner on a 3D topographic map — Austria’s high point, Hohe Tauern glaciers, elevation stats, and classic Eastern Alps approaches.',
  triglav:
    'Explore Triglav on a 3D map — Slovenia’s Julian Alps high point and national symbol, ridge terrain, elevation, and Trailer/Bohinj staging towns.',
  ortles:
    'Explore Ortler on a 3D topographic map — South Tyrol’s great ice peak, Ortler Alps terrain, elevation stats, and classic Dolomite-region approaches.',
  marmolada:
    'Explore Marmolada on a 3D map — the Queen of the Dolomites, glacier and rock terrain, elevation, and classic Italian Alps staging towns.',
  barreuils:
    'Explore Barre des Écrins on a 3D topographic map — Massif des Écrins high point, French Alps ice, elevation stats, and Dauphiné approach towns.',
  elbrus:
    'Explore Mt. Elbrus on a 3D map — Europe’s high point in the Caucasus, twin volcanic summits, elevation, and classic high-altitude trek terrain.',
  kazbek:
    'Explore Mt. Kazbek on a 3D topographic map — Caucasus glacier peak on the Georgia–Russia border, elevation, and classic Georgian alpine approaches.',
  damavand:
    'Explore Damavand on a 3D map — Iran’s highest volcano and Middle East high point, ash-and-snow terrain, elevation stats, and Tehran-region staging.',
  ararat:
    'Explore Mt. Ararat on a 3D topographic map — Turkey’s iconic twin-cone massif, high snow routes, elevation, and eastern Anatolian approach towns.',
  kilimanjaro:
    'Explore Kilimanjaro on a 3D map — Africa’s high point, Uhuru Peak topography, trek routes, elevation stats, and Tanzania staging towns near Moshi.',
  kenya:
    'Explore Mt. Kenya on a 3D topographic map — Africa’s second-highest massif, technical rock spires, elevation, and classic Kenyan alpine approaches.',
  toubkal:
    'Explore Toubkal on a 3D map — North Africa’s Atlas Mountains high point, trek terrain, elevation stats, and Marrakech-region staging towns.',
  rasdashen:
    'Explore Ras Dashen on a 3D topographic map — Ethiopia’s Simien Mountains high point, highland trek terrain, elevation, and northern approach towns.',
  table:
    'Explore Table Mountain on a 3D map — Cape Town’s iconic flat-top massif, trail topography, elevation stats, and South African coastal approaches.',
  meru:
    'Explore Mt. Meru on a 3D topographic map — Tanzania’s steep volcanic neighbor to Kilimanjaro, trek terrain, elevation, and Arusha staging towns.',
  everest:
    'Explore Mt. Everest on a 3D map — Earth’s highest summit, Khumbu topography, elevation stats, South Col context, and Nepal–Tibet staging towns.',
  k2:
    'Explore K2 on a 3D topographic map — Karakoram’s savage Abruzzi pyramid, expedition terrain, elevation, and Baltoro Glacier approach context.',
  kangchen:
    'Explore Kangchenjunga on a 3D map — the world’s third-highest peak, Sikkim–Nepal border terrain, elevation stats, and eastern Himalaya approaches.',
  lhotse:
    'Explore Lhotse on a 3D topographic map — Everest’s towering south neighbor, Khumbu ice, elevation, and classic Nepal Himalaya expedition staging.',
  makalu:
    'Explore Makalu on a 3D map — the world’s fifth-highest peak, isolated Makalu-Barun terrain, elevation stats, and eastern Nepal approaches.',
  chooyu:
    'Explore Cho Oyu on a 3D topographic map — the world’s sixth-highest summit, Tibet–Nepal border routes, elevation, and classic 8,000er staging.',
  dhaula:
    'Explore Dhaulagiri on a 3D map — Nepal’s white Himalayan giant, Kali Gandaki context, elevation stats, and classic western Nepal approaches.',
  manaslu:
    'Explore Manaslu on a 3D topographic map — the world’s eighth-highest peak, Manaslu Circuit terrain, elevation, and central Nepal staging towns.',
  nanga:
    'Explore Nanga Parbat on a 3D map — the western Himalaya’s killer mountain, Rupal and Diamir faces, elevation stats, and Pakistan approaches.',
  annapurna:
    'Explore Annapurna I on a 3D topographic map — infamous 8,000er above Nepal’s Annapurna Sanctuary, elevation, and classic trek-and-climb staging.',
  gasherbrum1:
    'Explore Gasherbrum I on a 3D map — Hidden Peak in the Karakoram, Baltoro approaches, elevation stats, and high Pakistan–China border terrain.',
  broadpeak:
    'Explore Broad Peak on a 3D topographic map — Karakoram 8,000er beside K2, glacier approaches, elevation, and classic Baltoro expedition staging.',
  gasherbrum2:
    'Explore Gasherbrum II on a 3D map — a classic Karakoram 8,000er, ice-ridge terrain, elevation stats, and Baltoro Glacier approach context.',
  shishapangma:
    'Explore Shishapangma on a 3D topographic map — Tibet’s 8,000er, relatively accessible Himalayan terrain, elevation, and Chinese-side staging towns.',
  ama:
    'Explore Ama Dablam on a 3D map — Khumbu’s iconic hanging-glacier spire, technical alpine terrain, elevation stats, and Everest-region approaches.',
  island:
    'Explore Island Peak on a 3D topographic map — Imja Tse training climb in the Khumbu, glacier skills terrain, elevation, and Chukhung staging.',
  stok:
    'Explore Stok Kangri on a 3D map — Ladakh’s popular high trek peak near Leh, Himalayan topography, elevation stats, and northern India approaches.',
  nanda:
    'Explore Nanda Devi on a 3D topographic map — India’s second-highest peak, sanctuary wilderness, elevation, and Garhwal Himalaya approach context.',
  trisul:
    'Explore Trisul on a 3D map — Garhwal’s classic triple-summit massif, alpine trek terrain, elevation stats, and Uttarakhand staging towns.',
  fuji:
    'Explore Mt. Fuji on a 3D topographic map — Japan’s iconic stratovolcano, summit trails, elevation, and classic Honshu approach towns and stations.',
  yari:
    'Explore Mt. Yari on a 3D map — the Matterhorn of Japan in the Northern Alps, ridgeline terrain, elevation stats, and Kamikochi approach context.',
  hallasan:
    'Explore Hallasan on a 3D topographic map — South Korea’s Jeju Island high point, crater-lake trails, elevation, and volcanic island approaches.',
  cook:
    'Explore Aoraki / Mt. Cook on a 3D map — New Zealand’s Southern Alps high point, glacier valleys, elevation stats, and Hooker–Tasman staging.',
  aspiring:
    'Explore Mt. Aspiring on a 3D topographic map — Tititea, the Matterhorn of the South, Southern Alps terrain, elevation, and Wanaka approaches.',
  tasman:
    'Explore Mt. Tasman on a 3D map — New Zealand’s second-highest peak beside Aoraki, glaciated Main Divide terrain, elevation, and alpine staging.',
  kosciuszko:
    'Explore Mt. Kosciuszko on a 3D topographic map — Australia’s Snowy Mountains high point, alpine walks, elevation stats, and Thredbo approaches.',
  townsend:
    'Explore Mt. Townsend on a 3D map — Australia’s second-highest summit near Kosciuszko, Main Range terrain, elevation, and Snowies trailheads.',
  galdhopiggen:
    'Explore Galdhøpiggen on a 3D topographic map — Northern Europe’s high point in Jotunheimen, hike routes, elevation, and Norwegian staging towns.',
  kebnekaise:
    'Explore Kebnekaise on a 3D map — Sweden’s Lapland high point, shifting glacial summit, elevation stats, and classic Arctic trail approaches.',
  halti:
    'Explore Halti on a 3D topographic map — Finland’s high point on the Norwegian border fells, gentle summit terrain, elevation, and Nordic approaches.',
  musala:
    'Explore Musala on a 3D map — the Balkans’ highest peak in Bulgaria’s Rila Mountains, marked alpine trails, elevation stats, and Sofia-region staging.',
  olympus:
    'Explore Mt. Olympus on a 3D topographic map — mythic Greek high point to Mytikas, rugged massif terrain, elevation, and Aegean foothill approaches.',
  mulhacen:
    'Explore Mulhacén on a 3D map — Iberia’s Sierra Nevada high point above Granada, long alpine walks, elevation stats, and Andalusian staging towns.',
  teide:
    'Explore Teide on a 3D topographic map — Spain’s Canary Islands high point, Tenerife caldera terrain, elevation, and Atlantic volcano approaches.',
  citlaltepetl:
    'Explore Iztaccíhuatl on a 3D map — Mexico’s White Woman volcano beside Popocatépetl, snow ridge terrain, elevation stats, and Valley approaches.',
  illampu:
    'Explore Illampu on a 3D topographic map — steep Cordillera Real ice near Sorata, difficult Bolivian alpine terrain, elevation, and Altiplano staging.',
  alpamayo:
    'Explore Alpamayo on a 3D map — the Cordillera Blanca’s fluted beauty peak, technical snow and ice, elevation stats, and classic Peru approaches.',
  huayna:
    'Explore Huayna Potosí on a 3D topographic map — La Paz’s classic 6,000er training climb, glacier travel, elevation, and Cordillera Real huts.',
  rittenhouse:
    'Explore Mt. Vinson on a 3D map — Antarctica’s Ellsworth Mountains high point, polar expedition terrain, elevation stats, and Seven Summits staging.',
  sidley:
    'Explore Mt. Sidley on a 3D topographic map — Antarctica’s highest volcano in Marie Byrd Land, remote polar terrain, elevation, and expedition context.',
  mitchell:
    'Explore Mt. Mitchell on a 3D map — highest U.S. peak east of the Mississippi, Appalachian topography, elevation stats, and North Carolina trails.',
  katahdin:
    'Explore Mt. Katahdin on a 3D topographic map — Maine’s high point and AT terminus, Knife Edge terrain, elevation, and Baxter State Park approaches.',
  marcy:
    'Explore Mt. Marcy on a 3D map — New York’s Adirondack high point, forest-to-alpine hike terrain, elevation stats, and classic High Peaks staging.',
  washington:
    'Explore Mt. Washington on a 3D topographic map — New Hampshire’s Presidential weather peak, alpine trails, elevation, and White Mountains approaches.',
  timpanogos:
    'Explore Mt. Timpanogos on a 3D map — Utah Valley’s Wasatch classic, ridge and cirque terrain, elevation stats, and Wasatch Front trailheads.',
  lonepeak:
    'Explore Lone Peak on a 3D topographic map — sharp Wasatch granite above Salt Lake, scramble terrain, elevation, and southern ridge approaches.',
  grandteton:
    'Explore Grand Teton on a 3D map — the Teton Range’s classic American alpine peak, rock-and-snow routes, elevation, and Jenny Lake staging.',
  moran:
    'Explore Mt. Moran on a 3D topographic map — remote Teton fortress above Jackson Lake, alpine approaches, elevation stats, and serious rock routes.',
  cloudpeak:
    'Explore Cloud Peak on a 3D map — Wyoming’s Bighorn Mountains high point, wilderness scramble terrain, elevation, and glacier-carved basin approaches.',
  blanca:
    'Explore Blanca Peak on a 3D topographic map — Sangre de Cristo monarch and Colorado fourteener, elevation stats, and San Luis Valley staging.',
  crestone:
    'Explore Crestone Peak on a 3D map — rugged Sangre de Cristo fourteener, Crestone Needle linkups, elevation, and classic Colorado scramble terrain.',
  capitol:
    'Explore Capitol Peak on a 3D topographic map — Aspen’s knife-edge Elk Mountains fourteener, committing Class 4 terrain, elevation, and trailheads.',
  pyramid:
    'Explore Pyramid Peak on a 3D map — steep Elk Mountains fourteener above Maroon Creek, exposed ridges, elevation stats, and Aspen-area approaches.',
  maunakea:
    'Explore Mauna Kea on a 3D topographic map — Hawaii’s astronomy summit and ocean-floor giant, alpine cinder cones, elevation, and Big Island staging.',
  sthelens:
    'Explore Mt. St. Helens on a 3D map — Cascade volcano remade in 1980, crater and lava-dome terrain, elevation stats, and Spirit Lake approaches.',
}

const start = Number(process.argv[2] ?? 0)
const count = Number(process.argv[3] ?? 20)

const peaks = JSON.parse(readFileSync(peaksPath, 'utf8'))
const end = Math.min(start + count, peaks.length)
const errors = []

for (let i = start; i < end; i++) {
  const peak = peaks[i]
  const text = SEO[peak.id]
  if (!text) {
    errors.push(`${peak.id}: missing SEO copy`)
    continue
  }
  const len = text.length
  if (len < 120 || len > 150) {
    errors.push(`${peak.id}: length ${len} (need 120–150): ${text}`)
    continue
  }
  peak.seoMetaDescription = text
}

if (errors.length) {
  console.error(errors.join('\n'))
  process.exit(1)
}

writeFileSync(peaksPath, `${JSON.stringify(peaks, null, 2)}\n`)
console.log(`Wrote seoMetaDescription for peaks[${start}..${end - 1}] (${end - start} peaks)`)

// Validate all filled so far
const filled = peaks.filter((p) => p.seoMetaDescription)
const bad = filled.filter((p) => {
  const n = p.seoMetaDescription.length
  return n < 120 || n > 150
})
console.log(`Filled so far: ${filled.length}/${peaks.length}; out-of-range: ${bad.length}`)
