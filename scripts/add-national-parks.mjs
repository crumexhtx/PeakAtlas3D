/**
 * Build / refresh the National Parks catalog (25 USA icons) with Commons photos.
 * Run: node scripts/add-national-parks.mjs
 */
import { writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outPath = join(root, 'src', 'data', 'nationalParks.json')
const UA = 'PeakAtlas3D/0.3 (https://peakatlas3d.com; national-parks)'

/** Curated USA National Parks — visitor-center / iconic coords + trip-style fields. */
const PARKS = [
  {
    id: 'yellowstone',
    name: 'Yellowstone National Park',
    aliases: ['Yellowstone'],
    lat: 44.6,
    lon: -110.5,
    state: 'Wyoming',
    established: 1872,
    areaSqMi: 3471,
    bestSeason: 'May–Sep',
    feeRequired: true,
    feeNotes: 'Entrance fee or America the Beautiful pass; some roads close in winter.',
    whyNotable: 'World’s first national park — geysers, wildlife, and the Yellowstone Caldera.',
    description:
      'Yellowstone spans Wyoming, Montana, and Idaho with hydrothermal wonders, bison herds, and alpine lakes. Summer is peak visitation; winter opens a quieter snow-coach season. Stage in West Yellowstone, Gardiner, or Cody and book lodging early.',
    seoMetaDescription:
      'Yellowstone National Park guide: best season, fees, staging towns, and 3D terrain on PeakAtlas3D.',
    nearestTown: {
      name: 'West Yellowstone',
      region: 'Montana',
      distanceMiles: 28,
      route: 'US-20 / West Entrance',
      lat: 44.662,
      lon: -111.104,
    },
    trails: [
      { name: 'Grand Prismatic Overlook' },
      { name: 'Uncle Tom’s Trail / Canyon area' },
    ],
    food: [
      { name: 'Old Faithful Inn Dining Room', category: 'Restaurant', note: 'Historic lodge dining in season.' },
      { name: 'Running Bear Pancake House', category: 'Casual eats', note: 'Breakfast in West Yellowstone.' },
    ],
    photoFiles: [
      'File:Grand Prismatic Spring and Midway Geyser Basin from above.jpg',
      'File:Castle Geyser and Crested Pool Yellowstone.jpg',
    ],
  },
  {
    id: 'yosemite',
    name: 'Yosemite National Park',
    aliases: ['Yosemite'],
    lat: 37.8651,
    lon: -119.5383,
    state: 'California',
    established: 1890,
    areaSqMi: 1169,
    bestSeason: 'May–Oct',
    feeRequired: true,
    feeNotes: 'Entrance fee; peak-season reservations may be required for vehicles.',
    whyNotable: 'Iconic Sierra granite — Half Dome, El Capitan, and Yosemite Falls.',
    description:
      'Yosemite Valley concentrates waterfalls, big walls, and crowded viewpoints. High country opens later; winter brings quieter valley days and icy trails. Stage in Mariposa, Oakhurst, or Yosemite West and expect timed entry in peak months.',
    seoMetaDescription:
      'Yosemite National Park guide: fees, season, valley staging, and 3D terrain on PeakAtlas3D.',
    nearestTown: {
      name: 'Mariposa',
      region: 'California',
      distanceMiles: 35,
      route: 'CA-140',
      lat: 37.485,
      lon: -119.966,
    },
    trails: [{ name: 'Mist Trail' }, { name: 'Valley Loop / Mirror Lake' }],
    food: [
      { name: 'Degnan’s Kitchen', category: 'Casual eats', note: 'Valley grab-and-go.' },
      { name: 'Base Camp Cafe', category: 'Café', note: 'Meals in Mariposa.' },
    ],
    photoFiles: [
      'File:Yosemite Valley from Tunnel View November 2023 panorama.jpg',
      'File:El Capitan Yosemite.jpg',
    ],
  },
  {
    id: 'grandcanyon',
    name: 'Grand Canyon National Park',
    aliases: ['Grand Canyon'],
    lat: 36.0544,
    lon: -112.1401,
    state: 'Arizona',
    established: 1919,
    areaSqMi: 1902,
    bestSeason: 'Mar–May or Sep–Nov',
    feeRequired: true,
    feeNotes: 'Entrance fee; North Rim has a shorter open season.',
    whyNotable: 'One of Earth’s most famous canyon landscapes — South Rim viewpoints and rim-to-river hikes.',
    description:
      'Most visitors use the South Rim near Grand Canyon Village. Summer heat is extreme below the rim; monsoon storms arrive mid-summer. Stage in Tusayan or Williams and start rim walks early.',
    seoMetaDescription:
      'Grand Canyon National Park guide: South Rim season, fees, staging, 3D terrain on PeakAtlas3D.',
    nearestTown: {
      name: 'Tusayan',
      region: 'Arizona',
      distanceMiles: 7,
      route: 'AZ-64',
      lat: 35.973,
      lon: -112.127,
    },
    trails: [{ name: 'South Kaibab Trail' }, { name: 'Bright Angel Trail' }],
    food: [
      { name: 'El Tovar Dining Room', category: 'Restaurant', note: 'Historic rim dining.' },
      { name: 'We Cook Pizza & Pasta', category: 'Casual eats', note: 'Tusayan after rim days.' },
    ],
    photoFiles: [
      'File:Grand Canyon National Park Mather Point 2018 16 12 01 9099.jpg',
      'File:Grand Canyon Hopi Point with rainbow 2018 11 16 2662.jpg',
    ],
  },
  {
    id: 'zion',
    name: 'Zion National Park',
    aliases: ['Zion'],
    lat: 37.2982,
    lon: -113.0263,
    state: 'Utah',
    established: 1919,
    areaSqMi: 229,
    bestSeason: 'Mar–May or Sep–Nov',
    feeRequired: true,
    feeNotes: 'Entrance fee; seasonal shuttle required in Zion Canyon.',
    whyNotable: 'Towering Navajo sandstone walls, The Narrows, and Angels Landing (permit).',
    description:
      'Zion Canyon is compact and busy. Summer is hot; spring runoff affects The Narrows. Stage in Springdale and use the shuttle in season. Angels Landing needs a permit lottery.',
    seoMetaDescription:
      'Zion National Park guide: shuttle season, fees, Springdale staging, 3D terrain on PeakAtlas3D.',
    nearestTown: {
      name: 'Springdale',
      region: 'Utah',
      distanceMiles: 2,
      route: 'UT-9',
      lat: 37.189,
      lon: -112.999,
    },
    trails: [{ name: 'Angels Landing' }, { name: 'The Narrows' }],
    food: [
      { name: 'Oscar’s Café', category: 'Restaurant', note: 'Springdale classic.' },
      { name: 'Deep Creek Coffee', category: 'Café', note: 'Early canyon starts.' },
    ],
    photoFiles: [
      'File:Zion Angels Landing.jpg',
      'File:The Watchman, Zion National Park.jpg',
    ],
  },
  {
    id: 'rockymountain',
    name: 'Rocky Mountain National Park',
    aliases: ['Rocky Mountain', 'RMNP'],
    lat: 40.3428,
    lon: -105.6836,
    state: 'Colorado',
    established: 1915,
    areaSqMi: 415,
    bestSeason: 'Jun–Sep',
    feeRequired: true,
    feeNotes: 'Entrance fee; timed-entry reservations common in peak season.',
    whyNotable: 'High alpine lakes, Trail Ridge Road, and Longs Peak on the Continental Divide.',
    description:
      'RMNP mixes easy lakeshore walks with serious 14er approaches. Trail Ridge Road usually opens by Memorial Day weekend. Stage in Estes Park or Grand Lake and reserve timed entry when required.',
    seoMetaDescription:
      'Rocky Mountain National Park guide: timed entry, season, Estes Park staging, 3D terrain on PeakAtlas3D.',
    nearestTown: {
      name: 'Estes Park',
      region: 'Colorado',
      distanceMiles: 6,
      route: 'US-36',
      lat: 40.377,
      lon: -105.522,
    },
    trails: [{ name: 'Emerald Lake Trail' }, { name: 'Alberta Falls' }],
    food: [
      { name: 'The Nest', category: 'Restaurant', note: 'Estes Park meals.' },
      { name: 'Kind Coffee', category: 'Café', note: 'Before Bear Lake corridor.' },
    ],
    photoFiles: [
      'File:Dream Lake and Hallett Peak Rocky Mountain National Park.jpg',
      'File:Rocky Mountain National Park in September 2011 - Trail Ridge Road scenic overlook.jpg',
    ],
  },
  {
    id: 'grandtetonnp',
    name: 'Grand Teton National Park',
    aliases: ['Grand Teton NP', 'Tetons'],
    lat: 43.7904,
    lon: -110.6818,
    state: 'Wyoming',
    established: 1929,
    areaSqMi: 485,
    bestSeason: 'Jun–Sep',
    feeRequired: true,
    feeNotes: 'Entrance fee or America the Beautiful pass.',
    whyNotable: 'Sharp Teton skyline above Jenny Lake and Jackson Hole.',
    description:
      'Grand Teton pairs roadside viewpoints with serious alpine climbing. Summer is short; snow lingers in the high country. Stage in Jackson or Teton Village and expect busy Jenny Lake boats and trails.',
    seoMetaDescription:
      'Grand Teton National Park guide: season, fees, Jackson staging, 3D terrain on PeakAtlas3D.',
    nearestTown: {
      name: 'Jackson',
      region: 'Wyoming',
      distanceMiles: 12,
      route: 'US-191 / Teton Park Rd',
      lat: 43.48,
      lon: -110.762,
    },
    trails: [{ name: 'Cascade Canyon' }, { name: 'Taggart Lake' }],
    food: [
      { name: 'Dornan’s Chuckwagon', category: 'Casual eats', note: 'Moose area classic.' },
      { name: 'Persephone Bakery', category: 'Café', note: 'Jackson breakfast.' },
    ],
    photoFiles: [
      'File:Grand Teton from Schwabacher Landing.jpg',
      'File:Snake River Overlook Grand Teton.jpg',
    ],
  },
  {
    id: 'glacier',
    name: 'Glacier National Park',
    aliases: ['Glacier NP'],
    lat: 48.7596,
    lon: -113.787,
    state: 'Montana',
    established: 1910,
    areaSqMi: 1583,
    bestSeason: 'Jul–Sep',
    feeRequired: true,
    feeNotes: 'Entrance fee; Going-to-the-Sun Road vehicle reservations in peak season.',
    whyNotable: 'Going-to-the-Sun Road, alpine lakes, and remaining glaciers on the Continental Divide.',
    description:
      'Glacier’s high season is brief. Snow can close Going-to-the-Sun into July. Stage in West Glacier, St. Mary, or Whitefish and plan for wildlife, steep trails, and sudden weather.',
    seoMetaDescription:
      'Glacier National Park guide: Going-to-the-Sun season, fees, staging, 3D terrain on PeakAtlas3D.',
    nearestTown: {
      name: 'West Glacier',
      region: 'Montana',
      distanceMiles: 4,
      route: 'Going-to-the-Sun Rd',
      lat: 48.496,
      lon: -113.978,
    },
    trails: [{ name: 'Highline Trail' }, { name: 'Avalanche Lake' }],
    food: [
      { name: 'Glacier Highland Restaurant', category: 'Restaurant', note: 'West Glacier meals.' },
      { name: 'Two Medicine Grill', category: 'Casual eats', note: 'East-side option.' },
    ],
    photoFiles: [
      'File:St. Mary Lake Glacier National Park.jpg',
      'File:Going-to-the-Sun Road Glacier National Park.jpg',
    ],
  },
  {
    id: 'acadia',
    name: 'Acadia National Park',
    aliases: ['Acadia'],
    lat: 44.35,
    lon: -68.21,
    state: 'Maine',
    established: 1916,
    areaSqMi: 76,
    bestSeason: 'May–Oct',
    feeRequired: true,
    feeNotes: 'Entrance fee; Cadillac Summit Road may need timed reservations.',
    whyNotable: 'Atlantic coastline, carriage roads, and Cadillac Mountain sunrise.',
    description:
      'Acadia wraps around Mount Desert Island with ocean cliffs and forested summits. Summer and fall foliage are busiest. Stage in Bar Harbor and combine Park Loop Road overlooks with shorter ridge walks.',
    seoMetaDescription:
      'Acadia National Park guide: Cadillac season, fees, Bar Harbor staging, 3D terrain on PeakAtlas3D.',
    nearestTown: {
      name: 'Bar Harbor',
      region: 'Maine',
      distanceMiles: 3,
      route: 'Park Loop Rd',
      lat: 44.387,
      lon: -68.204,
    },
    trails: [{ name: 'Ocean Path' }, { name: 'Beehive Trail' }],
    food: [
      { name: 'Jordan Pond House', category: 'Restaurant', note: 'Popovers in season.' },
      { name: '2 Cats Restaurant', category: 'Café', note: 'Bar Harbor breakfast.' },
    ],
    photoFiles: [
      'File:Jordan Pond and the Bubbles Acadia National Park.jpg',
      'File:Cadillac Mountain Acadia National Park.jpg',
    ],
  },
  {
    id: 'gsmnp',
    name: 'Great Smoky Mountains National Park',
    aliases: ['Great Smoky Mountains', 'Smokies'],
    lat: 35.6118,
    lon: -83.5496,
    state: 'Tennessee',
    established: 1934,
    areaSqMi: 816,
    bestSeason: 'Apr–Jun or Sep–Oct',
    feeRequired: true,
    feeNotes: 'Parking tag required for vehicles; no traditional entrance fee booths on many approaches.',
    whyNotable: 'America’s most-visited national park — Appalachian forests, Clingmans Dome, and Cades Cove.',
    description:
      'The Smokies straddle Tennessee and North Carolina with misty ridges and historic settlements. Fall color and summer weekends are packed. Stage in Gatlinburg, Cherokee, or Townsend.',
    seoMetaDescription:
      'Great Smoky Mountains National Park guide: parking tags, season, Gatlinburg staging, 3D terrain on PeakAtlas3D.',
    nearestTown: {
      name: 'Gatlinburg',
      region: 'Tennessee',
      distanceMiles: 8,
      route: 'US-441',
      lat: 35.714,
      lon: -83.51,
    },
    trails: [{ name: 'Alum Cave Trail' }, { name: 'Laurel Falls' }],
    food: [
      { name: 'Pancake Pantry', category: 'Casual eats', note: 'Gatlinburg breakfast lines.' },
      { name: 'The Peddler', category: 'Restaurant', note: 'Steakhouse after park days.' },
    ],
    photoFiles: [
      'File:Clingmans Dome observation tower.jpg',
      'File:Cades Cove Great Smoky Mountains.jpg',
    ],
  },
  {
    id: 'olympic',
    name: 'Olympic National Park',
    aliases: ['Olympic'],
    lat: 47.8021,
    lon: -123.6044,
    state: 'Washington',
    established: 1938,
    areaSqMi: 1442,
    bestSeason: 'Jun–Sep',
    feeRequired: true,
    feeNotes: 'Entrance fee; coastal and mountain weather can diverge sharply.',
    whyNotable: 'Rainforest, Pacific beaches, and glacier-clad Olympic peaks in one park.',
    description:
      'Olympic packs temperate rainforest, wilderness coast, and alpine meadows. Hurricane Ridge and Hoh Rain Forest are classic day destinations. Stage in Port Angeles or Forks.',
    seoMetaDescription:
      'Olympic National Park guide: season, fees, Port Angeles staging, 3D terrain on PeakAtlas3D.',
    nearestTown: {
      name: 'Port Angeles',
      region: 'Washington',
      distanceMiles: 17,
      route: 'Hurricane Ridge Rd',
      lat: 48.118,
      lon: -123.431,
    },
    trails: [{ name: 'Hurricane Hill' }, { name: 'Hoh River Trail' }],
    food: [
      { name: 'New Day Fisheries Café', category: 'Casual eats', note: 'Port Angeles waterfront.' },
      { name: 'Next Door Gastropub', category: 'Restaurant', note: 'Post-ridge meals.' },
    ],
    photoFiles: [
      'File:Hurricane Ridge Olympic National Park.jpg',
      'File:Hoh Rain Forest Olympic National Park.jpg',
    ],
  },
  {
    id: 'rainiernp',
    name: 'Mount Rainier National Park',
    aliases: ['Mount Rainier NP', 'Rainier NP'],
    lat: 46.88,
    lon: -121.727,
    state: 'Washington',
    established: 1899,
    areaSqMi: 369,
    bestSeason: 'Jul–Sep',
    feeRequired: true,
    feeNotes: 'Entrance fee; Paradise / Sunrise timed entry may apply in peak season.',
    whyNotable: 'Cascade icon — Paradise wildflowers, glaciers, and the Rainier climbing routes.',
    description:
      'Mount Rainier National Park centers on the volcano’s paradise meadows and Nisqually approaches. Snow lingers late; summer weekends need early parking. Stage in Ashford or Packwood.',
    seoMetaDescription:
      'Mount Rainier National Park guide: Paradise season, fees, Ashford staging, 3D terrain on PeakAtlas3D.',
    nearestTown: {
      name: 'Ashford',
      region: 'Washington',
      distanceMiles: 12,
      route: 'WA-706 / Paradise Rd',
      lat: 46.753,
      lon: -122.0,
    },
    trails: [{ name: 'Skyline Trail' }, { name: 'Nisqually Vista' }],
    food: [
      { name: 'Copper Creek Inn', category: 'Restaurant', note: 'Ashford classic.' },
      { name: 'Whittaker’s Bunkhouse Café', category: 'Café', note: 'Climbing-town energy.' },
    ],
    photoFiles: [
      'File:Mount Rainier from Paradise.jpg',
      'File:Reflection Lakes Mount Rainier.jpg',
    ],
  },
  {
    id: 'denalinp',
    name: 'Denali National Park',
    aliases: ['Denali NP'],
    lat: 63.1148,
    lon: -151.1926,
    state: 'Alaska',
    established: 1917,
    areaSqMi: 7471,
    bestSeason: 'Jun–Aug',
    feeRequired: true,
    feeNotes: 'Entrance fee; park road access is mostly by bus beyond Savage River.',
    whyNotable: 'North America’s high point massif, tundra wildlife, and a single long park road.',
    description:
      'Denali is vast. Most visitors ride park buses for wildlife viewing; climbing Denali itself is a separate expedition. Stage near Denali Park / Healy and book buses early.',
    seoMetaDescription:
      'Denali National Park guide: bus season, fees, Healy staging, 3D terrain on PeakAtlas3D.',
    nearestTown: {
      name: 'Healy',
      region: 'Alaska',
      distanceMiles: 12,
      route: 'George Parks Hwy',
      lat: 63.857,
      lon: -148.966,
    },
    trails: [{ name: 'Horseshoe Lake' }, { name: 'Savage Alpine Trail' }],
    food: [
      { name: 'The Perch Restaurant', category: 'Restaurant', note: 'Near park entrance.' },
      { name: '49th State Brewing', category: 'Pub / grill', note: 'Healy after bus days.' },
    ],
    photoFiles: [
      'File:Denali and Wonder Lake.jpg',
      'File:Denali National Park mountains.jpg',
    ],
  },
  {
    id: 'sequoia',
    name: 'Sequoia National Park',
    aliases: ['Sequoia'],
    lat: 36.4864,
    lon: -118.5658,
    state: 'California',
    established: 1890,
    areaSqMi: 631,
    bestSeason: 'May–Oct',
    feeRequired: true,
    feeNotes: 'Entrance fee shared with Kings Canyon approaches.',
    whyNotable: 'Giant sequoia groves including the General Sherman Tree.',
    description:
      'Sequoia protects the world’s largest trees and high Sierra approaches. Generals Highway can close with snow. Stage in Three Rivers or Visalia.',
    seoMetaDescription:
      'Sequoia National Park guide: giant trees, fees, Three Rivers staging, 3D terrain on PeakAtlas3D.',
    nearestTown: {
      name: 'Three Rivers',
      region: 'California',
      distanceMiles: 16,
      route: 'CA-198 / Generals Hwy',
      lat: 36.439,
      lon: -118.904,
    },
    trails: [{ name: 'Congress Trail' }, { name: 'Moro Rock Trail' }],
    food: [
      { name: 'Gateway Restaurant', category: 'Restaurant', note: 'Three Rivers meals.' },
      { name: 'We Three Bakery', category: 'Café', note: 'Before the climb to the grove.' },
    ],
    photoFiles: [
      'File:General Sherman Tree Sequoia National Park.jpg',
      'File:Moro Rock Sequoia National Park.jpg',
    ],
  },
  {
    id: 'joshuatree',
    name: 'Joshua Tree National Park',
    aliases: ['Joshua Tree'],
    lat: 33.8734,
    lon: -115.901,
    state: 'California',
    established: 1994,
    areaSqMi: 1235,
    bestSeason: 'Oct–Apr',
    feeRequired: true,
    feeNotes: 'Entrance fee; summer heat is extreme.',
    whyNotable: 'Mojave / Colorado Desert meeting point — Joshua trees and granite climbing.',
    description:
      'Joshua Tree is a winter favorite for camping and rock climbing. Summers routinely exceed safe hiking temperatures. Stage in the town of Joshua Tree or Twentynine Palms.',
    seoMetaDescription:
      'Joshua Tree National Park guide: cool-season visits, fees, staging, 3D terrain on PeakAtlas3D.',
    nearestTown: {
      name: 'Joshua Tree',
      region: 'California',
      distanceMiles: 5,
      route: 'Park Blvd',
      lat: 34.135,
      lon: -116.313,
    },
    trails: [{ name: 'Arch Rock Trail' }, { name: 'Hidden Valley' }],
    food: [
      { name: 'Crossroads Cafe', category: 'Café', note: 'Joshua Tree village.' },
      { name: 'The Palms Restaurant', category: 'Restaurant', note: 'Twentynine Palms option.' },
    ],
    photoFiles: [
      'File:Joshua Tree National Park sunset.jpg',
      'File:Jumbo Rocks Joshua Tree.jpg',
    ],
  },
  {
    id: 'deathvalley',
    name: 'Death Valley National Park',
    aliases: ['Death Valley'],
    lat: 36.5054,
    lon: -117.0794,
    state: 'California',
    established: 1994,
    areaSqMi: 5270,
    bestSeason: 'Nov–Mar',
    feeRequired: true,
    feeNotes: 'Entrance fee; summer heat can be life-threatening at lower elevations.',
    whyNotable: 'Hottest, driest, and lowest national park landscapes in North America.',
    description:
      'Death Valley combines Badwater Basin salt flats with high desert mountains. Visit in the cool season; carry more water than you think. Stage in Furnace Creek or Beatty.',
    seoMetaDescription:
      'Death Valley National Park guide: cool season, fees, Furnace Creek staging, 3D terrain on PeakAtlas3D.',
    nearestTown: {
      name: 'Furnace Creek',
      region: 'California',
      distanceMiles: 2,
      route: 'CA-190',
      lat: 36.458,
      lon: -116.867,
    },
    trails: [{ name: 'Badwater Basin' }, { name: 'Mesquite Flat Sand Dunes' }],
    food: [
      { name: 'Inn at Death Valley Dining Room', category: 'Restaurant', note: 'Resort dining.' },
      { name: 'Ranch 1890 General Store', category: 'Casual eats', note: 'Furnace Creek basics.' },
    ],
    photoFiles: [
      'File:Badwater Basin Death Valley.jpg',
      'File:Zabriskie Point Death Valley.jpg',
    ],
  },
  {
    id: 'arches',
    name: 'Arches National Park',
    aliases: ['Arches'],
    lat: 38.7331,
    lon: -109.5925,
    state: 'Utah',
    established: 1971,
    areaSqMi: 120,
    bestSeason: 'Mar–May or Sep–Nov',
    feeRequired: true,
    feeNotes: 'Entrance fee; timed-entry reservations often required in peak months.',
    whyNotable: 'Dense concentration of natural sandstone arches including Delicate Arch.',
    description:
      'Arches is compact and photogenic. Summer is hot; timed entry is common spring through fall. Stage in Moab and start early for Delicate Arch.',
    seoMetaDescription:
      'Arches National Park guide: timed entry, fees, Moab staging, 3D terrain on PeakAtlas3D.',
    nearestTown: {
      name: 'Moab',
      region: 'Utah',
      distanceMiles: 5,
      route: 'US-191',
      lat: 38.573,
      lon: -109.55,
    },
    trails: [{ name: 'Delicate Arch Trail' }, { name: 'Windows Loop' }],
    food: [
      { name: 'Pasta Jay’s', category: 'Restaurant', note: 'Moab after sunset shots.' },
      { name: 'Love Muffin Café', category: 'Café', note: 'Early entry breakfast.' },
    ],
    photoFiles: [
      'File:Delicate Arch La Sal Mountains.jpg',
      'File:Double Arch Arches National Park.jpg',
    ],
  },
  {
    id: 'bryce',
    name: 'Bryce Canyon National Park',
    aliases: ['Bryce Canyon'],
    lat: 37.593,
    lon: -112.1871,
    state: 'Utah',
    established: 1928,
    areaSqMi: 56,
    bestSeason: 'May–Oct',
    feeRequired: true,
    feeNotes: 'Entrance fee; winter brings snow on hoodoos and quieter rim walks.',
    whyNotable: 'Amphitheaters of hoodoos along the Paunsaugunt Plateau.',
    description:
      'Bryce’s rim sits near 8,000 ft with short but steep descends into the hoodoos. Cool mornings and clear air make sunrise popular. Stage in Bryce Canyon City or Tropic.',
    seoMetaDescription:
      'Bryce Canyon National Park guide: hoodoo season, fees, staging, 3D terrain on PeakAtlas3D.',
    nearestTown: {
      name: 'Bryce Canyon City',
      region: 'Utah',
      distanceMiles: 3,
      route: 'UT-63',
      lat: 37.673,
      lon: -112.156,
    },
    trails: [{ name: 'Navajo Loop' }, { name: 'Queens Garden' }],
    food: [
      { name: 'Valhalla Pizzeria', category: 'Casual eats', note: 'Near the lodge.' },
      { name: 'Cowboy’s Buffet & Steakroom', category: 'Restaurant', note: 'Ruby’s Inn complex.' },
    ],
    photoFiles: [
      'File:Bryce Canyon Amphitheater from Inspiration Point.jpg',
      'File:Thor\'s Hammer Bryce Canyon.jpg',
    ],
  },
  {
    id: 'canyonlands',
    name: 'Canyonlands National Park',
    aliases: ['Canyonlands'],
    lat: 38.3269,
    lon: -109.8783,
    state: 'Utah',
    established: 1964,
    areaSqMi: 527,
    bestSeason: 'Mar–May or Sep–Nov',
    feeRequired: true,
    feeNotes: 'Entrance fee; Island in the Sky is the most accessible district.',
    whyNotable: 'Broad Colorado Plateau canyons at the Green–Colorado confluence.',
    description:
      'Canyonlands splits into Island in the Sky, The Needles, and The Maze. Most first-timers use Island in the Sky near Moab for overlooks and short walks.',
    seoMetaDescription:
      'Canyonlands National Park guide: Island in the Sky, fees, Moab staging, 3D terrain on PeakAtlas3D.',
    nearestTown: {
      name: 'Moab',
      region: 'Utah',
      distanceMiles: 32,
      route: 'US-191 / UT-313',
      lat: 38.573,
      lon: -109.55,
    },
    trails: [{ name: 'Mesa Arch' }, { name: 'Grand View Point' }],
    food: [
      { name: 'Desert Bistro', category: 'Restaurant', note: 'Moab dinner.' },
      { name: 'Moab Coffee Roasters', category: 'Café', note: 'Before UT-313.' },
    ],
    photoFiles: [
      'File:Mesa Arch Canyonlands sunrise.jpg',
      'File:Green River Overlook Canyonlands.jpg',
    ],
  },
  {
    id: 'badlands',
    name: 'Badlands National Park',
    aliases: ['Badlands'],
    lat: 43.75,
    lon: -101.93,
    state: 'South Dakota',
    established: 1978,
    areaSqMi: 379,
    bestSeason: 'May–Oct',
    feeRequired: true,
    feeNotes: 'Entrance fee; summer storms and heat are common.',
    whyNotable: 'Banded mixed-grass prairie and eroded buttes on the Great Plains.',
    description:
      'Badlands Loop Road delivers big geology in a compact drive. Pair fossil exhibits with short boardwalks. Stage in Interior or Wall.',
    seoMetaDescription:
      'Badlands National Park guide: Loop Road, fees, Wall staging, 3D terrain on PeakAtlas3D.',
    nearestTown: {
      name: 'Wall',
      region: 'South Dakota',
      distanceMiles: 8,
      route: 'SD-240 Badlands Loop',
      lat: 43.992,
      lon: -102.241,
    },
    trails: [{ name: 'Door Trail' }, { name: 'Notch Trail' }],
    food: [
      { name: 'Wall Drug Cafe', category: 'Casual eats', note: 'Tourist-classic stop.' },
      { name: 'Badlands Inn Restaurant', category: 'Restaurant', note: 'Near Interior.' },
    ],
    photoFiles: [
      'File:Badlands National Park landscape.jpg',
      'File:Badlands Loop Road overlook.jpg',
    ],
  },
  {
    id: 'everglades',
    name: 'Everglades National Park',
    aliases: ['Everglades'],
    lat: 25.2866,
    lon: -80.8987,
    state: 'Florida',
    established: 1947,
    areaSqMi: 2357,
    bestSeason: 'Dec–Apr',
    feeRequired: true,
    feeNotes: 'Entrance fee; wet season means more water, mosquitoes, and fewer crowds.',
    whyNotable: 'Unique subtropical wetland ecosystem — sawgrass, mangroves, and wildlife.',
    description:
      'Everglades is best in the dry winter season for wildlife viewing and fewer insects. Explore via Anhinga Trail, Shark Valley, or Flamingo. Stage in Homestead or Florida City.',
    seoMetaDescription:
      'Everglades National Park guide: dry season, fees, Homestead staging, 3D terrain on PeakAtlas3D.',
    nearestTown: {
      name: 'Homestead',
      region: 'Florida',
      distanceMiles: 12,
      route: 'FL-9336',
      lat: 25.468,
      lon: -80.477,
    },
    trails: [{ name: 'Anhinga Trail' }, { name: 'Shark Valley Tram Road' }],
    food: [
      { name: 'Robert Is Here', category: 'Casual eats', note: 'Fruit stand classic en route.' },
      { name: 'Casita Tejas', category: 'Restaurant', note: 'Homestead meals.' },
    ],
    photoFiles: [
      'File:Anhinga Trail Everglades.jpg',
      'File:Everglades National Park sawgrass.jpg',
    ],
  },
  {
    id: 'hawaiivolcanoes',
    name: 'Hawaiʻi Volcanoes National Park',
    aliases: ['Hawaii Volcanoes', 'Hawaiʻi Volcanoes'],
    lat: 19.4194,
    lon: -155.2885,
    state: 'Hawaii',
    established: 1916,
    areaSqMi: 505,
    bestSeason: 'Year-round',
    feeRequired: true,
    feeNotes: 'Entrance fee; eruption and closure status change — check NPS alerts.',
    whyNotable: 'Active Kīlauea and Mauna Loa landscapes on Hawaiʻi Island.',
    description:
      'Hawaiʻi Volcanoes protects living volcanoes, lava fields, and rainforest. Conditions shift with volcanic activity. Stage in Volcano Village or Hilo and verify current crater access.',
    seoMetaDescription:
      'Hawaiʻi Volcanoes National Park guide: fees, alerts, Volcano Village staging, 3D terrain on PeakAtlas3D.',
    nearestTown: {
      name: 'Volcano',
      region: 'Hawaii',
      distanceMiles: 2,
      route: 'HI-11',
      lat: 19.43,
      lon: -155.238,
    },
    trails: [{ name: 'Kīlauea Iki Trail' }, { name: 'Crater Rim Trail' }],
    food: [
      { name: 'Café Ono', category: 'Café', note: 'Volcano Village.' },
      { name: 'Thai Thai Restaurant', category: 'Restaurant', note: 'Post-hike in Volcano.' },
    ],
    photoFiles: [
      'File:Kilauea Caldera from Jaggar Museum overlook.jpg',
      'File:Hawaii Volcanoes National Park steam vents.jpg',
    ],
  },
  {
    id: 'haleakala',
    name: 'Haleakalā National Park',
    aliases: ['Haleakala', 'Haleakalā'],
    lat: 20.7097,
    lon: -156.2533,
    state: 'Hawaii',
    established: 1961,
    areaSqMi: 52,
    bestSeason: 'Year-round',
    feeRequired: true,
    feeNotes: 'Entrance fee; sunrise reservations required for summit viewing.',
    whyNotable: 'Massive Maui shield volcano — summit crater sunrise and coastal Kīpahulu district.',
    description:
      'Haleakalā’s summit is cold and windy even in summer; sunrise slots book out. The Kīpahulu coast adds waterfalls and rainforest. Stage in Kahului or Upcountry Maui.',
    seoMetaDescription:
      'Haleakalā National Park guide: sunrise reservations, fees, Maui staging, 3D terrain on PeakAtlas3D.',
    nearestTown: {
      name: 'Kula',
      region: 'Hawaii',
      distanceMiles: 18,
      route: 'HI-378',
      lat: 20.791,
      lon: -156.327,
    },
    trails: [{ name: 'Sliding Sands Trail' }, { name: 'Pipiwai Trail' }],
    food: [
      { name: 'Kula Bistro', category: 'Restaurant', note: 'Upcountry meals.' },
      { name: 'La Provence', category: 'Café', note: 'Before the summit drive.' },
    ],
    photoFiles: [
      'File:Haleakala crater sunrise.jpg',
      'File:Haleakala National Park summit.jpg',
    ],
  },
  {
    id: 'shenandoah',
    name: 'Shenandoah National Park',
    aliases: ['Shenandoah'],
    lat: 38.4925,
    lon: -78.4697,
    state: 'Virginia',
    established: 1935,
    areaSqMi: 311,
    bestSeason: 'Apr–Jun or Sep–Oct',
    feeRequired: true,
    feeNotes: 'Entrance fee; Skyline Drive is the spine of the park.',
    whyNotable: 'Skyline Drive overlooks and Appalachian Trail sections in Virginia’s Blue Ridge.',
    description:
      'Shenandoah is an easy overnight from D.C. with waterfall hikes and fall color. Fog and leaf-season traffic are common. Stage in Luray, Front Royal, or Waynesboro.',
    seoMetaDescription:
      'Shenandoah National Park guide: Skyline Drive, fees, Luray staging, 3D terrain on PeakAtlas3D.',
    nearestTown: {
      name: 'Luray',
      region: 'Virginia',
      distanceMiles: 10,
      route: 'US-211',
      lat: 38.665,
      lon: -78.459,
    },
    trails: [{ name: 'Dark Hollow Falls' }, { name: 'Old Rag approaches (nearby)' }],
    food: [
      { name: 'Gathering Grounds', category: 'Café', note: 'Luray coffee.' },
      { name: 'The Apartment', category: 'Restaurant', note: 'Downtown Luray dinner.' },
    ],
    photoFiles: [
      'File:Skyline Drive Shenandoah National Park.jpg',
      'File:Shenandoah National Park overlook.jpg',
    ],
  },
  {
    id: 'craterlake',
    name: 'Crater Lake National Park',
    aliases: ['Crater Lake'],
    lat: 42.8684,
    lon: -122.1685,
    state: 'Oregon',
    established: 1902,
    areaSqMi: 286,
    bestSeason: 'Jul–Sep',
    feeRequired: true,
    feeNotes: 'Entrance fee; Rim Drive fully opens after snowmelt.',
    whyNotable: 'Deepest lake in the United States — caldera views and Wizard Island.',
    description:
      'Crater Lake’s rim sits high; snow can block Rim Drive into July. Summer brings clear water views and busy overlooks. Stage in Fort Klamath or Medford.',
    seoMetaDescription:
      'Crater Lake National Park guide: Rim Drive season, fees, staging, 3D terrain on PeakAtlas3D.',
    nearestTown: {
      name: 'Fort Klamath',
      region: 'Oregon',
      distanceMiles: 20,
      route: 'OR-62',
      lat: 42.705,
      lon: -121.995,
    },
    trails: [{ name: 'Discovery Point' }, { name: 'Watchman Peak Trail' }],
    food: [
      { name: 'Annie Creek Restaurant', category: 'Restaurant', note: 'Mazama Village in season.' },
      { name: 'Beckie\'s Cafe', category: 'Casual eats', note: 'Prospect area classic.' },
    ],
    photoFiles: [
      'File:Crater Lake Oregon.jpg',
      'File:Wizard Island Crater Lake.jpg',
    ],
  },
  {
    id: 'mesaverde',
    name: 'Mesa Verde National Park',
    aliases: ['Mesa Verde'],
    lat: 37.2309,
    lon: -108.4618,
    state: 'Colorado',
    established: 1906,
    areaSqMi: 81,
    bestSeason: 'May–Oct',
    feeRequired: true,
    feeNotes: 'Entrance fee; cliff-dwelling tours often need advance tickets.',
    whyNotable: 'Ancestral Puebloan cliff dwellings preserved on the Colorado Plateau.',
    description:
      'Mesa Verde is as much archaeology as scenery. Tour tickets for Cliff Palace and Balcony House sell out. Stage in Cortez or Mancos and allow a full day for mesa-top drives.',
    seoMetaDescription:
      'Mesa Verde National Park guide: cliff dwelling tours, fees, Cortez staging, 3D terrain on PeakAtlas3D.',
    nearestTown: {
      name: 'Cortez',
      region: 'Colorado',
      distanceMiles: 10,
      route: 'US-160',
      lat: 37.349,
      lon: -108.586,
    },
    trails: [{ name: 'Petroglyph Point Trail' }, { name: 'Spruce Tree House overlook' }],
    food: [
      { name: 'Absolute Bakery', category: 'Café', note: 'Cortez breakfast.' },
      { name: 'The Farm Bistro', category: 'Restaurant', note: 'Cortez dinner.' },
    ],
    photoFiles: [
      'File:Cliff Palace Mesa Verde.jpg',
      'File:Balcony House Mesa Verde National Park.jpg',
    ],
  },
]

function stripHtml(s) {
  return String(s ?? '')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .trim()
}

async function resolvePhoto(fileTitle, attempt = 1) {
  const api =
    'https://commons.wikimedia.org/w/api.php?action=query&format=json&titles=' +
    encodeURIComponent(fileTitle) +
    '&prop=imageinfo&iiprop=url|extmetadata|size|mime&iiurlwidth=1280'
  const res = await fetch(api, { headers: { 'User-Agent': UA } })
  if (res.status === 429 && attempt < 6) {
    await new Promise((r) => setTimeout(r, 2000 * attempt))
    return resolvePhoto(fileTitle, attempt + 1)
  }
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  const data = await res.json()
  const page = Object.values(data.query.pages)[0]
  if (page.missing != null) throw new Error(`Missing ${fileTitle}`)
  const info = page.imageinfo?.[0]
  if (!info) throw new Error(`No imageinfo ${fileTitle}`)
  const mime = info.mime ?? ''
  if (!mime.startsWith('image/') || mime.includes('svg')) {
    throw new Error(`Bad mime ${fileTitle}`)
  }
  const meta = info.extmetadata ?? {}
  const license = stripHtml(
    meta.LicenseShortName?.value || meta.License?.value || 'Unknown',
  )
  const artist = stripHtml(meta.Artist?.value || 'Unknown')
  return {
    url: info.thumburl || info.url,
    credit: artist.length > 80 ? `${artist.slice(0, 77)}…` : artist,
    license,
    sourceUrl: info.descriptionurl || info.url,
  }
}

async function searchFallback(query) {
  const api =
    `https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search&gsrnamespace=6&gsrsearch=` +
    encodeURIComponent(query) +
    `&gsrlimit=8&prop=imageinfo&iiprop=url|extmetadata|size|mime&iiurlwidth=1280`
  const data = await (
    await fetch(api, { headers: { 'User-Agent': UA } })
  ).json()
  const pages = Object.values(data.query?.pages || {})
  for (const page of pages) {
    const info = page.imageinfo?.[0]
    if (!info) continue
    const mime = info.mime ?? ''
    if (!mime.startsWith('image/') || mime.includes('svg')) continue
    if ((info.width ?? 0) < 800) continue
    const title = String(page.title || '').toLowerCase()
    if (/map|logo|diagram|icon|svg|poster/.test(title)) continue
    const meta = info.extmetadata ?? {}
    const license = stripHtml(
      meta.LicenseShortName?.value || meta.License?.value || 'Unknown',
    )
    const artist = stripHtml(meta.Artist?.value || 'Unknown')
    return {
      url: info.thumburl || info.url,
      credit: artist.length > 80 ? `${artist.slice(0, 77)}…` : artist,
      license,
      sourceUrl: info.descriptionurl || info.url,
    }
  }
  return null
}

const parks = []
for (const def of PARKS) {
  const photos = []
  for (const file of def.photoFiles) {
    process.stdout.write(`  photo ${def.id} ← ${file.slice(0, 55)}… `)
    try {
      photos.push(await resolvePhoto(file))
      console.log('ok')
    } catch (err) {
      console.log(`fail (${err.message})`)
      const fb = await searchFallback(`${def.name} National Park`)
      if (fb) {
        photos.push(fb)
        console.log(`    fallback ok`)
      }
    }
    await new Promise((r) => setTimeout(r, 450))
    if (photos.length >= 2) break
  }
  if (photos.length < 1) {
    const fb = await searchFallback(def.name)
    if (fb) photos.push(fb)
  }

  const town = def.nearestTown
  parks.push({
    id: def.id,
    name: def.name,
    ...(def.aliases ? { aliases: def.aliases } : {}),
    lat: def.lat,
    lon: def.lon,
    country: 'USA',
    state: def.state,
    established: def.established,
    areaSqMi: def.areaSqMi,
    bestSeason: def.bestSeason,
    feeRequired: def.feeRequired,
    feeNotes: def.feeNotes,
    whyNotable: def.whyNotable,
    description: def.description,
    seoMetaDescription: def.seoMetaDescription,
    nearestTown: { ...town },
    nearbyPlaces: [{ ...town }],
    hotels: [],
    food: def.food,
    trails: def.trails,
    ...(photos[0]
      ? { photo: photos[0], photos: photos.slice(0, 2) }
      : { hotels: [], photos: [] }),
  })
}

if (parks.length !== 25) {
  console.error(`Expected 25 parks, got ${parks.length}`)
  process.exit(1)
}

writeFileSync(outPath, `${JSON.stringify(parks, null, 2)}\n`)
console.log(`Wrote ${parks.length} national parks → ${outPath}`)
