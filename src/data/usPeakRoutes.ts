/**
 * Popular-route outbound links for US peaks outside the Colorado 14ers.com set.
 * URLs verified against live NPS / USFS / state pages (soft-404 aware).
 * Labels + links only — no geometry.
 */

export type UsPeakRoute = {
  name: string
  trailhead?: string
  difficulty?: string
  standard?: boolean
  note?: string
  sourceUrl: string
  /** Display name for bubble kicker + dossier credit. */
  sourceLabel: string
  /** Home page for the References section. */
  sourceHome: string
}

export const US_PEAK_ROUTES: Record<string, UsPeakRoute[]> = {
  rainier: [
    {
      name: 'Wonderland Trail',
      trailhead: 'Longmire / multiple',
      difficulty: 'Strenuous backpack',
      standard: true,
      sourceUrl: 'https://www.nps.gov/mora/planyourvisit/the-wonderland-trail.htm',
      sourceLabel: 'NPS',
      sourceHome: 'https://www.nps.gov/mora/',
    },
    {
      name: 'Skyline Trail',
      trailhead: 'Paradise',
      difficulty: 'Moderate day hike',
      sourceUrl: 'https://www.nps.gov/mora/planyourvisit/skyline-trail.htm',
      sourceLabel: 'NPS',
      sourceHome: 'https://www.nps.gov/mora/',
    },
  ],
  shasta: [
    {
      name: 'Avalanche Gulch',
      trailhead: 'Bunny Flat',
      difficulty: 'Snow climb / glacier',
      standard: true,
      sourceUrl:
        'https://www.fs.usda.gov/r05/shasta-trinity/recreation/mt-shasta-wilderness',
      sourceLabel: 'USFS',
      sourceHome: 'https://www.fs.usda.gov/r05/shasta-trinity',
    },
    {
      name: 'Clear Creek',
      trailhead: 'Clear Creek',
      difficulty: 'Snow climb',
      sourceUrl:
        'https://www.fs.usda.gov/r05/shasta-trinity/recreation/mt-shasta-wilderness',
      sourceLabel: 'USFS',
      sourceHome: 'https://www.fs.usda.gov/r05/shasta-trinity',
    },
  ],
  hood: [
    {
      name: 'Timberline Trail',
      trailhead: 'Timberline Lodge / multiple',
      difficulty: 'Strenuous backpack',
      standard: true,
      sourceUrl:
        'https://www.fs.usda.gov/r06/mthood/recreation/trails/timberline-trail-600',
      sourceLabel: 'USFS',
      sourceHome: 'https://www.fs.usda.gov/r06/mthood',
    },
    {
      name: 'Cooper Spur',
      trailhead: 'Cloud Cap / Tilly Jane',
      difficulty: 'Technical alpine',
      sourceUrl: 'https://www.fs.usda.gov/r06/mthood/recreation/cloud-cap-trailhead',
      sourceLabel: 'USFS',
      sourceHome: 'https://www.fs.usda.gov/r06/mthood',
    },
  ],
  baker: [
    {
      name: 'Heliotrope Ridge',
      trailhead: 'Heliotrope Ridge',
      difficulty: 'Moderate day hike',
      standard: true,
      sourceUrl:
        'https://www.fs.usda.gov/r06/mbs/recreation/trails/heliotrope-ridge-trail-677',
      sourceLabel: 'USFS',
      sourceHome: 'https://www.fs.usda.gov/r06/mbs',
    },
    {
      name: 'Artist Point',
      trailhead: 'Artist Point',
      difficulty: 'Easy / interpretive',
      sourceUrl:
        'https://www.fs.usda.gov/r06/mbs/recreation/mt-baker-ranger-district',
      sourceLabel: 'USFS',
      sourceHome: 'https://www.fs.usda.gov/r06/mbs',
    },
  ],
  adams: [
    {
      name: 'South Climb',
      trailhead: 'Cold Springs / South Climb',
      difficulty: 'Non-technical climb',
      standard: true,
      sourceUrl:
        'https://www.fs.usda.gov/r06/giffordpinchot/recreation/trails/trail-183-south-climb',
      sourceLabel: 'USFS',
      sourceHome: 'https://www.fs.usda.gov/r06/giffordpinchot',
    },
    {
      name: 'Round the Mountain',
      trailhead: 'Multiple',
      difficulty: 'Strenuous backpack',
      sourceUrl:
        'https://www.fs.usda.gov/r06/giffordpinchot/recreation/trails/trail-9-round-mountain',
      sourceLabel: 'USFS',
      sourceHome: 'https://www.fs.usda.gov/r06/giffordpinchot',
    },
  ],
  denali: [
    {
      name: 'West Buttress',
      trailhead: 'Kahiltna Glacier base camp',
      difficulty: 'Expedition mountaineering',
      standard: true,
      sourceUrl: 'https://www.nps.gov/dena/planyourvisit/mountaineering.htm',
      sourceLabel: 'NPS',
      sourceHome: 'https://www.nps.gov/dena/',
    },
    {
      name: 'Kahiltna Glacier',
      trailhead: 'Kahiltna Glacier',
      difficulty: 'Glacier approach',
      sourceUrl: 'https://www.nps.gov/dena/planyourvisit/mountaineering.htm',
      sourceLabel: 'NPS',
      sourceHome: 'https://www.nps.gov/dena/',
    },
  ],
  whitney: [
    {
      name: 'Whitney Trail',
      trailhead: 'Whitney Portal',
      difficulty: 'Strenuous day / overnight',
      standard: true,
      sourceUrl: 'https://www.fs.usda.gov/r05/inyo/recreation/trails/mt-whitney-trail',
      sourceLabel: 'USFS',
      sourceHome: 'https://www.fs.usda.gov/r05/inyo',
    },
    {
      name: "Mountaineer's Route",
      trailhead: 'Whitney Portal / East Face',
      difficulty: 'Class 3 scramble',
      sourceUrl: 'https://www.fs.usda.gov/r05/inyo/wilderness/mount-whitney',
      sourceLabel: 'USFS',
      sourceHome: 'https://www.fs.usda.gov/r05/inyo',
    },
  ],
  halfdome: [
    {
      name: 'Half Dome Cable Route',
      trailhead: 'Happy Isles',
      difficulty: 'Strenuous hike / cable scramble (permit)',
      standard: true,
      note: 'Cables typically late May–early October; day-hike permit required.',
      sourceUrl: 'https://www.nps.gov/yose/planyourvisit/halfdome.htm',
      sourceLabel: 'NPS',
      sourceHome: 'https://www.nps.gov/yose/',
    },
    {
      name: 'Mist Trail',
      trailhead: 'Happy Isles',
      difficulty: 'Strenuous day hike',
      note: 'Classic approach past Vernal and Nevada Falls toward Half Dome.',
      sourceUrl: 'https://www.nps.gov/yose/planyourvisit/vernalnevadatrail.htm',
      sourceLabel: 'NPS',
      sourceHome: 'https://www.nps.gov/yose/',
    },
  ],
  gannett: [
    {
      name: 'Glacier Trail',
      trailhead: 'Trail Lake / Glacier Trail',
      difficulty: 'Strenuous approach',
      standard: true,
      sourceUrl: 'https://www.fs.usda.gov/r02/shoshone',
      sourceLabel: 'USFS',
      sourceHome: 'https://www.fs.usda.gov/r02/shoshone',
    },
    {
      name: 'Titcomb Basin',
      trailhead: 'Elkhart Park',
      difficulty: 'Backpack approach',
      sourceUrl: 'https://www.fs.usda.gov/r04/bridger-teton',
      sourceLabel: 'USFS',
      sourceHome: 'https://www.fs.usda.gov/r04/bridger-teton',
    },
  ],
  granitet: [
    {
      name: 'Froze-to-Death Plateau',
      trailhead: 'West Rosebud / Mystic Lake',
      difficulty: 'Technical alpine',
      standard: true,
      sourceUrl:
        'https://www.fs.usda.gov/r01/custergallatin/recreation/beartooth-ranger-district',
      sourceLabel: 'USFS',
      sourceHome: 'https://www.fs.usda.gov/r01/custergallatin',
    },
    {
      name: 'East Ridge',
      trailhead: 'Phantom Creek / East Rosebud',
      difficulty: 'Technical alpine',
      sourceUrl:
        'https://www.fs.usda.gov/r01/custergallatin/recreation/beartooth-ranger-district',
      sourceLabel: 'USFS',
      sourceHome: 'https://www.fs.usda.gov/r01/custergallatin',
    },
  ],
  kings: [
    {
      name: 'Henrys Fork',
      trailhead: 'Henrys Fork',
      difficulty: 'Strenuous backpack',
      standard: true,
      sourceUrl: 'https://www.fs.usda.gov/r04/ashley',
      sourceLabel: 'USFS',
      sourceHome: 'https://www.fs.usda.gov/r04/ashley',
    },
    {
      name: 'Uinta Highline',
      trailhead: 'Multiple Uinta trailheads',
      difficulty: 'Long-distance backpack',
      sourceUrl: 'https://www.fs.usda.gov/r04/ashley',
      sourceLabel: 'USFS',
      sourceHome: 'https://www.fs.usda.gov/r04/ashley',
    },
  ],
  humphreys: [
    {
      name: 'Humphreys Trail',
      trailhead: 'Arizona Snowbowl',
      difficulty: 'Strenuous day hike',
      standard: true,
      sourceUrl:
        'https://www.fs.usda.gov/r03/coconino/recreation/trails/humphreys-trail-no-151',
      sourceLabel: 'USFS',
      sourceHome: 'https://www.fs.usda.gov/r03/coconino',
    },
    {
      name: 'Kachina Trail',
      trailhead: 'Snowbowl / Kachina',
      difficulty: 'Moderate day hike',
      sourceUrl:
        'https://www.fs.usda.gov/r03/coconino/recreation/groups/kachina-peaks-wilderness',
      sourceLabel: 'USFS',
      sourceHome: 'https://www.fs.usda.gov/r03/coconino',
    },
  ],
  guadalupe: [
    {
      name: 'Guadalupe Peak Trail',
      trailhead: 'Pine Springs',
      difficulty: 'Strenuous day hike',
      standard: true,
      sourceUrl: 'https://www.nps.gov/gumo/planyourvisit/hiking.htm',
      sourceLabel: 'NPS',
      sourceHome: 'https://www.nps.gov/gumo/',
    },
    {
      name: "Devil's Hall",
      trailhead: 'Pine Springs',
      difficulty: 'Moderate day hike',
      sourceUrl: 'https://www.nps.gov/gumo/planyourvisit/pinesprings_dayhikes.htm',
      sourceLabel: 'NPS',
      sourceHome: 'https://www.nps.gov/gumo/',
    },
  ],
  mitchell: [
    {
      name: 'Mount Mitchell Trail',
      trailhead: 'Black Mountain Campground',
      difficulty: 'Strenuous day hike',
      standard: true,
      sourceUrl: 'https://www.ncparks.gov/state-parks/mount-mitchell-state-park',
      sourceLabel: 'NC Parks',
      sourceHome: 'https://www.ncparks.gov/',
    },
    {
      name: 'Balsam Nature Trail',
      trailhead: 'Mount Mitchell summit area',
      difficulty: 'Easy nature walk',
      sourceUrl: 'https://www.ncparks.gov/state-parks/mount-mitchell-state-park',
      sourceLabel: 'NC Parks',
      sourceHome: 'https://www.ncparks.gov/',
    },
  ],
  katahdin: [
    {
      name: 'Hunt Trail',
      trailhead: 'Katahdin Stream',
      difficulty: 'Strenuous scramble',
      standard: true,
      sourceUrl: 'https://baxterstatepark.org/general-info/',
      sourceLabel: 'Baxter SP',
      sourceHome: 'https://baxterstatepark.org/',
    },
    {
      name: 'Knife Edge',
      trailhead: 'Chimney Pond / Pamola',
      difficulty: 'Exposed scramble',
      sourceUrl: 'https://baxterstatepark.org/general-info/',
      sourceLabel: 'Baxter SP',
      sourceHome: 'https://baxterstatepark.org/',
    },
  ],
  marcy: [
    {
      name: 'Van Hoevenberg Trail',
      trailhead: 'Adirondack Loj',
      difficulty: 'Strenuous day hike',
      standard: true,
      sourceUrl:
        'https://dec.ny.gov/things-to-do/hiking/adirondack-backcountry/backcountry-information-for-adirondack-park',
      sourceLabel: 'NYS DEC',
      sourceHome: 'https://dec.ny.gov/',
    },
    {
      name: 'Hopkins Trail',
      trailhead: 'Garden / Johns Brook',
      difficulty: 'Strenuous day hike',
      sourceUrl:
        'https://dec.ny.gov/things-to-do/hiking/adirondack-backcountry/backcountry-information-for-adirondack-park',
      sourceLabel: 'NYS DEC',
      sourceHome: 'https://dec.ny.gov/',
    },
  ],
  washington: [
    {
      name: 'Tuckerman Ravine',
      trailhead: 'Pinkham Notch',
      difficulty: 'Strenuous / alpine',
      standard: true,
      sourceUrl:
        'https://www.fs.usda.gov/r09/whitemountain/recreation/trails/tuckerman-ravine-trail',
      sourceLabel: 'USFS',
      sourceHome: 'https://www.fs.usda.gov/r09/whitemountain',
    },
    {
      name: 'Lion Head',
      trailhead: 'Pinkham Notch',
      difficulty: 'Strenuous alpine',
      sourceUrl:
        'https://www.fs.usda.gov/r09/whitemountain/recreation/trails/tuckerman-ravine-trail',
      sourceLabel: 'USFS',
      sourceHome: 'https://www.fs.usda.gov/r09/whitemountain',
    },
  ],
  timpanogos: [
    {
      name: 'Aspen Grove Trail',
      trailhead: 'Aspen Grove',
      difficulty: 'Strenuous day hike',
      standard: true,
      sourceUrl: 'https://www.fs.usda.gov/r04/uinta-wasatch-cache',
      sourceLabel: 'USFS',
      sourceHome: 'https://www.fs.usda.gov/r04/uinta-wasatch-cache',
    },
    {
      name: 'Timpooneke Trail',
      trailhead: 'Timpooneke',
      difficulty: 'Strenuous day hike',
      sourceUrl: 'https://www.fs.usda.gov/r04/uinta-wasatch-cache',
      sourceLabel: 'USFS',
      sourceHome: 'https://www.fs.usda.gov/r04/uinta-wasatch-cache',
    },
  ],
  lonepeak: [
    {
      name: "Jacob's Ladder",
      trailhead: 'Jacobs Ladder / Draper',
      difficulty: 'Strenuous scramble',
      standard: true,
      sourceUrl: 'https://www.fs.usda.gov/r04/uinta-wasatch-cache',
      sourceLabel: 'USFS',
      sourceHome: 'https://www.fs.usda.gov/r04/uinta-wasatch-cache',
    },
    {
      name: 'Cherry Canyon',
      trailhead: 'Cherry Canyon',
      difficulty: 'Strenuous hike / scramble',
      sourceUrl: 'https://www.fs.usda.gov/r04/uinta-wasatch-cache',
      sourceLabel: 'USFS',
      sourceHome: 'https://www.fs.usda.gov/r04/uinta-wasatch-cache',
    },
  ],
  grandteton: [
    {
      name: 'Owen-Spalding',
      trailhead: 'Lupine Meadows / Lower Saddle',
      difficulty: 'Class 5.4 technical',
      standard: true,
      sourceUrl: 'https://www.nps.gov/grte/planyourvisit/guided-activities.htm',
      sourceLabel: 'NPS',
      sourceHome: 'https://www.nps.gov/grte/',
    },
    {
      name: 'Exum Ridge',
      trailhead: 'Lupine Meadows / Lower Saddle',
      difficulty: 'Class 5.5 technical',
      sourceUrl: 'https://www.nps.gov/grte/planyourvisit/guided-activities.htm',
      sourceLabel: 'NPS',
      sourceHome: 'https://www.nps.gov/grte/',
    },
  ],
  moran: [
    {
      name: 'CMC Route',
      trailhead: 'String Lake / Leigh Canyon',
      difficulty: 'Technical alpine',
      standard: true,
      sourceUrl: 'https://www.nps.gov/grte/planyourvisit/guided-activities.htm',
      sourceLabel: 'NPS',
      sourceHome: 'https://www.nps.gov/grte/',
    },
    {
      name: 'Direct South Buttress',
      trailhead: 'String Lake / Leigh Canyon',
      difficulty: 'Technical rock',
      sourceUrl: 'https://www.nps.gov/grte/planyourvisit/guided-activities.htm',
      sourceLabel: 'NPS',
      sourceHome: 'https://www.nps.gov/grte/',
    },
  ],
  cloudpeak: [
    {
      name: 'West Tensleep Trail',
      trailhead: 'West Tensleep Lake',
      difficulty: 'Strenuous backpack',
      standard: true,
      sourceUrl: 'https://www.fs.usda.gov/r02/bighorn',
      sourceLabel: 'USFS',
      sourceHome: 'https://www.fs.usda.gov/r02/bighorn',
    },
    {
      name: 'Mistymoon Lake',
      trailhead: 'West Tensleep',
      difficulty: 'Backpack approach',
      sourceUrl: 'https://www.fs.usda.gov/r02/bighorn',
      sourceLabel: 'USFS',
      sourceHome: 'https://www.fs.usda.gov/r02/bighorn',
    },
  ],
  maunakea: [
    {
      name: 'Mauna Kea Summit Trail',
      trailhead: 'Visitor Information Station',
      difficulty: 'Strenuous high-altitude hike',
      standard: true,
      sourceUrl: 'https://dlnr.hawaii.gov/mk/',
      sourceLabel: 'Hawaii DLNR',
      sourceHome: 'https://dlnr.hawaii.gov/mk/',
    },
    {
      name: 'Humuhumuula Trail',
      trailhead: 'Mauna Kea Access Road area',
      difficulty: 'High-altitude hike',
      sourceUrl: 'https://dlnr.hawaii.gov/mk/',
      sourceLabel: 'Hawaii DLNR',
      sourceHome: 'https://dlnr.hawaii.gov/mk/',
    },
  ],
  sthelens: [
    {
      name: 'Monitor Ridge',
      trailhead: "Climber's Bivouac",
      difficulty: 'Permit climb / scramble',
      standard: true,
      sourceUrl:
        'https://www.fs.usda.gov/r06/giffordpinchot/recreation/trailhead-climbers-bivouac-summer-climbing-route',
      sourceLabel: 'USFS',
      sourceHome: 'https://www.fs.usda.gov/r06/giffordpinchot',
    },
    {
      name: 'Boundary Trail / Johnston Ridge',
      trailhead: 'Johnston Ridge Observatory',
      difficulty: 'Easy to moderate',
      sourceUrl:
        'https://www.fs.usda.gov/r06/giffordpinchot/recreation/johnston-ridge-observatory',
      sourceLabel: 'USFS',
      sourceHome: 'https://www.fs.usda.gov/r06/giffordpinchot',
    },
  ],
  southsister: [
    {
      name: 'South Sister Climber Trail',
      trailhead: 'Devils Lake / Climbers Trail',
      difficulty: 'Strenuous scramble',
      standard: true,
      sourceUrl:
        'https://www.fs.usda.gov/recarea/deschutes/recreation/recarea/?recid=38866',
      sourceLabel: 'USFS',
      sourceHome: 'https://www.fs.usda.gov/r06/deschutes',
    },
    {
      name: 'Green Lakes Trail',
      trailhead: 'Green Lakes / Cascade Lakes',
      difficulty: 'Strenuous backpack / approach',
      sourceUrl: 'https://www.fs.usda.gov/recarea/deschutes/recarea/?recid=38884',
      sourceLabel: 'USFS',
      sourceHome: 'https://www.fs.usda.gov/r06/deschutes',
    },
  ],
  olympuswa: [
    {
      name: 'Blue Glacier / West Peak',
      trailhead: 'Hoh River / Glacier Meadows',
      difficulty: 'Glacier climb / multi-day',
      standard: true,
      note: 'Olympic National Park wilderness; mountaineering experience required.',
      sourceUrl:
        'https://www.nps.gov/olym/planyourvisit/wilderness-trip-planner.htm',
      sourceLabel: 'NPS',
      sourceHome: 'https://www.nps.gov/olym/',
    },
    {
      name: 'Hoh River Trail',
      trailhead: 'Hoh Rain Forest',
      difficulty: 'Strenuous backpack approach',
      sourceUrl: 'https://www.nps.gov/olym/planyourvisit/hoh-river-trail.htm',
      sourceLabel: 'NPS',
      sourceHome: 'https://www.nps.gov/olym/',
    },
  ],
  borah: [
    {
      name: 'Chicken-Out Ridge',
      trailhead: 'Borah Peak / Birch Springs',
      difficulty: 'Class 3 scramble',
      standard: true,
      sourceUrl: 'https://www.fs.usda.gov/r04/salmon-challis/recreation',
      sourceLabel: 'USFS',
      sourceHome: 'https://www.fs.usda.gov/r04/salmon-challis',
    },
    {
      name: 'Southwest Ridge approach',
      trailhead: 'Birch Springs Road',
      difficulty: 'Strenuous approach hike',
      sourceUrl: 'https://www.fs.usda.gov/r04/salmon-challis',
      sourceLabel: 'USFS',
      sourceHome: 'https://www.fs.usda.gov/r04/salmon-challis',
    },
  ],
  wheeler: [
    {
      name: 'Wheeler Peak Summit Trail',
      trailhead: 'Summit Trailhead / Scenic Drive',
      difficulty: 'Strenuous day hike',
      standard: true,
      sourceUrl:
        'https://www.nps.gov/grba/planyourvisit/wheeler-peak-scenic-drive-trails.htm',
      sourceLabel: 'NPS',
      sourceHome: 'https://www.nps.gov/grba/',
    },
    {
      name: 'Alpine Lakes / Bristlecone',
      trailhead: 'Bristlecone / Alpine Lakes',
      difficulty: 'Moderate day hike',
      sourceUrl:
        'https://www.nps.gov/grba/planyourvisit/wheeler-peak-scenic-drive-trails.htm',
      sourceLabel: 'NPS',
      sourceHome: 'https://www.nps.gov/grba/',
    },
  ],
  kuwohi: [
    {
      name: 'Kuwohi Observation Tower Trail',
      trailhead: 'Kuwohi / Clingmans Dome parking',
      difficulty: 'Paved steep walk',
      standard: true,
      note: 'Formerly Clingmans Dome; short paved path to the tower.',
      sourceUrl: 'https://www.nps.gov/grsm/planyourvisit/kuwohi-nfg.htm',
      sourceLabel: 'NPS',
      sourceHome: 'https://www.nps.gov/grsm/',
    },
    {
      name: 'Appalachian Trail (Kuwohi area)',
      trailhead: 'Kuwohi parking / AT junctions',
      difficulty: 'Moderate',
      sourceUrl: 'https://www.nps.gov/grsm/planyourvisit/kuwohi-nfg.htm',
      sourceLabel: 'NPS',
      sourceHome: 'https://www.nps.gov/grsm/',
    },
  ],
  haleakala: [
    {
      name: "Keoneheʻeheʻe (Sliding Sands)",
      trailhead: 'Haleakalā Visitor Center',
      difficulty: 'Strenuous crater hike',
      standard: true,
      sourceUrl: 'https://www.nps.gov/hale/planyourvisit/hiking.htm',
      sourceLabel: 'NPS',
      sourceHome: 'https://www.nps.gov/hale/',
    },
    {
      name: "Halemauʻu Trail",
      trailhead: "Halemauʻu Trailhead",
      difficulty: 'Strenuous crater hike',
      sourceUrl: 'https://www.nps.gov/hale/planyourvisit/hiking.htm',
      sourceLabel: 'NPS',
      sourceHome: 'https://www.nps.gov/hale/',
    },
  ],
  glacierpeak: [
    {
      name: 'Sitkum Glacier / Cool Glacier approaches',
      trailhead: 'North Fork Sauk / Suiattle',
      difficulty: 'Glacier climb / multi-day',
      standard: true,
      note: 'Remote Cascade volcano; mountaineering experience required.',
      sourceUrl: 'https://www.fs.usda.gov/r06/okanogan-wenatchee',
      sourceLabel: 'USFS',
      sourceHome: 'https://www.fs.usda.gov/r06/okanogan-wenatchee',
    },
    {
      name: 'Pacific Crest Trail (Glacier Peak area)',
      trailhead: 'Multiple PCT / wilderness trailheads',
      difficulty: 'Long-distance backpack approach',
      sourceUrl: 'https://www.fs.usda.gov/r06/mbs/recreation',
      sourceLabel: 'USFS',
      sourceHome: 'https://www.fs.usda.gov/r06/mbs',
    },
  ],
  shuksan: [
    {
      name: 'Artist Point / Picture Lake viewpoints',
      trailhead: 'Artist Point',
      difficulty: 'Easy / interpretive',
      standard: true,
      sourceUrl: 'https://www.fs.usda.gov/r06/mbs/recreation',
      sourceLabel: 'USFS',
      sourceHome: 'https://www.fs.usda.gov/r06/mbs',
    },
    {
      name: 'Lake Ann / Fisher Chimneys approaches',
      trailhead: 'Lake Ann / Heather Meadows',
      difficulty: 'Technical alpine',
      note: 'Classic mountaineering routes; experience and permits as required.',
      sourceUrl: 'https://www.nps.gov/noca/planyourvisit/climbing.htm',
      sourceLabel: 'NPS',
      sourceHome: 'https://www.nps.gov/noca/',
    },
  ],
  jeffersonor: [
    {
      name: 'Jefferson Park / PCT approaches',
      trailhead: 'Whitewater / Jefferson Park',
      difficulty: 'Technical alpine / glacier',
      standard: true,
      sourceUrl: 'https://www.fs.usda.gov/r06/willamette',
      sourceLabel: 'USFS',
      sourceHome: 'https://www.fs.usda.gov/r06/willamette',
    },
    {
      name: 'Pamelia Lake Trail',
      trailhead: 'Pamelia Lake',
      difficulty: 'Moderate backpack approach',
      sourceUrl: 'https://www.fs.usda.gov/r06/willamette',
      sourceLabel: 'USFS',
      sourceHome: 'https://www.fs.usda.gov/r06/willamette',
    },
  ],
  brokentop: [
    {
      name: 'Green Lakes / Broken Top Climber Trail',
      trailhead: 'Green Lakes / Cascade Lakes',
      difficulty: 'Class 3 scramble',
      standard: true,
      sourceUrl: 'https://www.fs.usda.gov/recarea/deschutes/recarea/?recid=38884',
      sourceLabel: 'USFS',
      sourceHome: 'https://www.fs.usda.gov/r06/deschutes',
    },
    {
      name: 'Crater Ditch / Tam McArthur Rim area',
      trailhead: 'Three Sisters Wilderness trailheads',
      difficulty: 'Strenuous day hike / scramble',
      sourceUrl: 'https://www.fs.usda.gov/r06/deschutes',
      sourceLabel: 'USFS',
      sourceHome: 'https://www.fs.usda.gov/r06/deschutes',
    },
  ],
  lassen: [
    {
      name: 'Lassen Peak Trail',
      trailhead: 'Lassen Peak Trailhead / Lake Helen',
      difficulty: 'Strenuous day hike',
      standard: true,
      sourceUrl: 'https://www.nps.gov/lavo/planyourvisit/index.htm',
      sourceLabel: 'NPS',
      sourceHome: 'https://www.nps.gov/lavo/',
    },
    {
      name: 'Bumpass Hell / park day hikes',
      trailhead: 'Bumpass Hell',
      difficulty: 'Moderate day hike',
      sourceUrl: 'https://www.nps.gov/lavo/',
      sourceLabel: 'NPS',
      sourceHome: 'https://www.nps.gov/lavo/',
    },
  ],
  sanjacinto: [
    {
      name: 'Long Valley / Peak Trail (tram)',
      trailhead: 'Palm Springs Aerial Tram / Long Valley',
      difficulty: 'Strenuous day hike',
      standard: true,
      sourceUrl: 'https://www.parks.ca.gov/?page_id=636',
      sourceLabel: 'CA State Parks',
      sourceHome: 'https://www.parks.ca.gov/?page_id=636',
    },
    {
      name: 'Deer Springs Trail',
      trailhead: 'Deer Springs / Idyllwild',
      difficulty: 'Strenuous day / overnight',
      sourceUrl: 'https://www.fs.usda.gov/r05/sanbernardino',
      sourceLabel: 'USFS',
      sourceHome: 'https://www.fs.usda.gov/r05/sanbernardino',
    },
  ],
  sangorgonio: [
    {
      name: 'Vivian Creek Trail',
      trailhead: 'Vivian Creek',
      difficulty: 'Strenuous day / overnight',
      standard: true,
      sourceUrl: 'https://www.fs.usda.gov/r05/sanbernardino',
      sourceLabel: 'USFS',
      sourceHome: 'https://www.fs.usda.gov/r05/sanbernardino',
    },
    {
      name: 'South Fork Trail',
      trailhead: 'South Fork',
      difficulty: 'Strenuous backpack',
      sourceUrl: 'https://www.fs.usda.gov/r05/sanbernardino',
      sourceLabel: 'USFS',
      sourceHome: 'https://www.fs.usda.gov/r05/sanbernardino',
    },
  ],
  baldy: [
    {
      name: 'Baldy Bowl / Ski Hut Trail',
      trailhead: 'Manker Flat',
      difficulty: 'Strenuous day hike',
      standard: true,
      sourceUrl: 'https://www.fs.usda.gov/r05/angeles',
      sourceLabel: 'USFS',
      sourceHome: 'https://www.fs.usda.gov/r05/angeles',
    },
    {
      name: "Devil's Backbone",
      trailhead: 'Baldy Notch / ski area',
      difficulty: 'Strenuous ridge hike',
      sourceUrl: 'https://www.fs.usda.gov/r05/angeles',
      sourceLabel: 'USFS',
      sourceHome: 'https://www.fs.usda.gov/r05/angeles',
    },
  ],
  tallac: [
    {
      name: 'Mt. Tallac Trail',
      trailhead: 'Mt. Tallac Trailhead / Fallen Leaf',
      difficulty: 'Strenuous day hike',
      standard: true,
      sourceUrl: 'https://www.fs.usda.gov/recarea/ltbmu/recarea/?recid=11727',
      sourceLabel: 'USFS',
      sourceHome: 'https://www.fs.usda.gov/ltbmu',
    },
    {
      name: 'Floating Island / Cathedral Lake approaches',
      trailhead: 'Fallen Leaf / Desolation',
      difficulty: 'Moderate day hike',
      sourceUrl: 'https://www.fs.usda.gov/ltbmu',
      sourceLabel: 'USFS',
      sourceHome: 'https://www.fs.usda.gov/ltbmu',
    },
  ],
  wheelernm: [
    {
      name: 'Williams Lake / Wheeler Peak Trail',
      trailhead: 'Taos Ski Valley / Williams Lake',
      difficulty: 'Strenuous day hike',
      standard: true,
      sourceUrl: 'https://www.fs.usda.gov/r03/carson',
      sourceLabel: 'USFS',
      sourceHome: 'https://www.fs.usda.gov/r03/carson',
    },
    {
      name: 'Bull-of-the-Woods approach',
      trailhead: 'Taos Ski Valley',
      difficulty: 'Strenuous day hike',
      sourceUrl: 'https://www.fs.usda.gov/r03/carson',
      sourceLabel: 'USFS',
      sourceHome: 'https://www.fs.usda.gov/r03/carson',
    },
  ],
  sandia: [
    {
      name: 'La Luz Trail',
      trailhead: 'La Luz Trailhead / Tram',
      difficulty: 'Strenuous day hike',
      standard: true,
      sourceUrl: 'https://www.fs.usda.gov/r03/cibola',
      sourceLabel: 'USFS',
      sourceHome: 'https://www.fs.usda.gov/r03/cibola',
    },
    {
      name: 'Sandia Crest / crest road access',
      trailhead: 'Sandia Crest',
      difficulty: 'Drive / short walks',
      sourceUrl: 'https://www.fs.usda.gov/r03/cibola',
      sourceLabel: 'USFS',
      sourceHome: 'https://www.fs.usda.gov/r03/cibola',
    },
  ],
  leconte: [
    {
      name: 'Alum Cave Trail',
      trailhead: 'Alum Cave',
      difficulty: 'Strenuous day / overnight',
      standard: true,
      sourceUrl: 'https://www.nps.gov/grsm/planyourvisit/hiking.htm',
      sourceLabel: 'NPS',
      sourceHome: 'https://www.nps.gov/grsm/',
    },
    {
      name: 'Rainbow Falls Trail',
      trailhead: 'Rainbow Falls',
      difficulty: 'Strenuous day / overnight',
      sourceUrl: 'https://www.nps.gov/grsm/planyourvisit/things2do.htm',
      sourceLabel: 'NPS',
      sourceHome: 'https://www.nps.gov/grsm/',
    },
  ],
  oldrag: [
    {
      name: 'Old Rag Circuit',
      trailhead: 'Old Rag parking / Weakley Hollow',
      difficulty: 'Class 3 scramble (day-use ticket)',
      standard: true,
      note: 'Timed entry / day-use tickets required in peak season.',
      sourceUrl: 'https://www.nps.gov/shen/planyourvisit/hiking.htm',
      sourceLabel: 'NPS',
      sourceHome: 'https://www.nps.gov/shen/',
    },
    {
      name: 'Old Rag day-use / permits',
      trailhead: 'Old Rag area',
      difficulty: 'Permit info',
      sourceUrl:
        'https://www.nps.gov/shen/planyourvisit/permitsandreservations.htm',
      sourceLabel: 'NPS',
      sourceHome: 'https://www.nps.gov/shen/',
    },
  ],
  mansfield: [
    {
      name: 'Long Trail (Forehead to Chin)',
      trailhead: 'Underhill / Stowe Long Trail access',
      difficulty: 'Strenuous ridge hike',
      standard: true,
      sourceUrl: 'https://www.greenmountainclub.org/the-long-trail/',
      sourceLabel: 'Green Mountain Club',
      sourceHome: 'https://www.greenmountainclub.org/',
    },
    {
      name: 'Sunset Ridge / Laura Woodward trails',
      trailhead: 'Underhill State Park',
      difficulty: 'Strenuous day hike',
      sourceUrl: 'https://www.greenmountainclub.org/',
      sourceLabel: 'Green Mountain Club',
      sourceHome: 'https://www.greenmountainclub.org/',
    },
  ],
  cadillac: [
    {
      name: 'Cadillac North Ridge Trail',
      trailhead: 'Cadillac North Ridge',
      difficulty: 'Moderate day hike',
      standard: true,
      sourceUrl: 'https://www.nps.gov/acad/planyourvisit/cadillac-mountain.htm',
      sourceLabel: 'NPS',
      sourceHome: 'https://www.nps.gov/acad/',
    },
    {
      name: 'Cadillac Summit Road / South Ridge',
      trailhead: 'Cadillac Summit / Loop Road',
      difficulty: 'Drive / easy to moderate hike',
      sourceUrl: 'https://www.nps.gov/acad/planyourvisit/hiking.htm',
      sourceLabel: 'NPS',
      sourceHome: 'https://www.nps.gov/acad/',
    },
  ],
  maunaloa: [
    {
      name: 'Mauna Loa Observatory Trail',
      trailhead: 'Mauna Loa Observatory Road',
      difficulty: 'Strenuous day / overnight',
      standard: true,
      note: 'Check Hawaii Volcanoes NP for trail and road status after eruptions.',
      sourceUrl: 'https://www.nps.gov/havo/planyourvisit/hike_maunaloa.htm',
      sourceLabel: 'NPS',
      sourceHome: 'https://www.nps.gov/havo/',
    },
    {
      name: 'Mauna Loa Trail (from Red Hill / cabin approaches)',
      trailhead: 'Mauna Loa Road / Red Hill',
      difficulty: 'Multi-day backpack',
      sourceUrl: 'https://www.nps.gov/havo/planyourvisit/hiking.htm',
      sourceLabel: 'NPS',
      sourceHome: 'https://www.nps.gov/havo/',
    },
  ],
  telescope: [
    {
      name: 'Telescope Peak Trail',
      trailhead: 'Mahogany Flat',
      difficulty: 'Strenuous day hike',
      standard: true,
      sourceUrl: 'https://www.nps.gov/deva/planyourvisit/hiking.htm',
      sourceLabel: 'NPS',
      sourceHome: 'https://www.nps.gov/deva/',
    },
  ],
  northsister: [
    {
      name: 'Prouty Glacier / standard alpine routes',
      trailhead: 'Pole Creek / Green Lakes approaches',
      difficulty: 'Technical alpine / glacier',
      standard: true,
      note: 'Technical Three Sisters climb; mountaineering skills required.',
      sourceUrl: 'https://www.fs.usda.gov/r06/deschutes',
      sourceLabel: 'USFS',
      sourceHome: 'https://www.fs.usda.gov/r06/deschutes',
    },
  ],
  stuart: [
    {
      name: 'Cascadian Couloir',
      trailhead: 'Esmeralda Basin / Ingalls Creek',
      difficulty: 'Class 3 scramble / snow',
      standard: true,
      sourceUrl: 'https://www.fs.usda.gov/r06/okanogan-wenatchee',
      sourceLabel: 'USFS',
      sourceHome: 'https://www.fs.usda.gov/r06/okanogan-wenatchee',
    },
    {
      name: 'West Ridge',
      trailhead: 'Ingalls Lake / Longs Pass',
      difficulty: 'Technical rock',
      sourceUrl: 'https://www.fs.usda.gov/r06/okanogan-wenatchee',
      sourceLabel: 'USFS',
      sourceHome: 'https://www.fs.usda.gov/r06/okanogan-wenatchee',
    },
  ],
  lafayette: [
    {
      name: 'Franconia Ridge (via Falling Waters / Old Bridle Path)',
      trailhead: 'Lafayette Place / Franconia Notch',
      difficulty: 'Strenuous day hike',
      standard: true,
      sourceUrl: 'https://www.fs.usda.gov/r09/whitemountain',
      sourceLabel: 'USFS',
      sourceHome: 'https://www.fs.usda.gov/r09/whitemountain',
    },
  ],
  rogers: [
    {
      name: 'Appalachian Trail / Massie Gap approaches',
      trailhead: 'Massie Gap / Grayson Highlands',
      difficulty: 'Moderate day hike',
      standard: true,
      sourceUrl: 'https://www.dcr.virginia.gov/state-parks/grayson-highlands',
      sourceLabel: 'Virginia DCR',
      sourceHome: 'https://www.dcr.virginia.gov/state-parks/grayson-highlands',
    },
  ],
  madison: [
    {
      name: 'Valley Way / Osgood Trail',
      trailhead: 'Appalachia / Great Gulf',
      difficulty: 'Strenuous day hike',
      standard: true,
      sourceUrl: 'https://www.fs.usda.gov/r09/whitemountain',
      sourceLabel: 'USFS',
      sourceHome: 'https://www.fs.usda.gov/r09/whitemountain',
    },
  ],
  adamsnh: [
    {
      name: "Lowe's Path / Airline",
      trailhead: 'Appalachia',
      difficulty: 'Strenuous day hike',
      standard: true,
      sourceUrl: 'https://www.fs.usda.gov/r09/whitemountain',
      sourceLabel: 'USFS',
      sourceHome: 'https://www.fs.usda.gov/r09/whitemountain',
    },
  ],
  whitemountain: [
    {
      name: 'White Mountain Peak Trail (from locked gate)',
      trailhead: 'White Mountain Road',
      difficulty: 'Strenuous day hike / bike-hike',
      standard: true,
      note: 'High-elevation desert road; check Inyo NF road status and weather.',
      sourceUrl: 'https://www.fs.usda.gov/r05/inyo',
      sourceLabel: 'USFS',
      sourceHome: 'https://www.fs.usda.gov/r05/inyo',
    },
  ],
}

export function usPeakRoutesForPeak(peakId: string): UsPeakRoute[] {
  return US_PEAK_ROUTES[peakId] ?? []
}

export function peakHasUsPeakRoutes(peakId: string): boolean {
  return usPeakRoutesForPeak(peakId).length > 0
}
