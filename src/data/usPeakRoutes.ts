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
}

export function usPeakRoutesForPeak(peakId: string): UsPeakRoute[] {
  return US_PEAK_ROUTES[peakId] ?? []
}

export function peakHasUsPeakRoutes(peakId: string): boolean {
  return usPeakRoutesForPeak(peakId).length > 0
}
