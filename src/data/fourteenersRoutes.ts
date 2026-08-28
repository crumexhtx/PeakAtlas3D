/**
 * Colorado 14er route labels curated from public 14ers.com route pages.
 * Names, trailheads, difficulty, and outbound links only — no map geometry.
 */

export type FourteenersRoute = {
  name: string
  trailhead: string
  difficulty: string
  /** Typical round-trip miles from the usual start (14ers.com). */
  roundTripMiles: number
  /** Typical elevation gain in feet from the usual start. */
  elevationGainFt: number
  standard?: boolean
  note?: string
  sourceUrl: string
}

export const FOURTEENERS_ROUTES: Record<string, FourteenersRoute[]> = {
  elbert: [
    {
      name: 'Northeast Ridge',
      trailhead: 'Mt. Elbert (North)',
      difficulty: 'Class 1',
      roundTripMiles: 9.75,
      elevationGainFt: 4500,
      standard: true,
      sourceUrl: 'https://www.14ers.com/route.php?route=elbe1',
    },
    {
      name: 'East Ridge',
      trailhead: 'Mt. Elbert (South)',
      difficulty: 'Class 1',
      roundTripMiles: 11.25,
      elevationGainFt: 4200,
      sourceUrl: 'https://www.14ers.com/route.php?route=elbe2',
    },
  ],
  longs: [
    {
      name: 'Keyhole Route',
      trailhead: 'Longs Peak',
      difficulty: 'Class 3',
      roundTripMiles: 14.5,
      elevationGainFt: 5100,
      standard: true,
      sourceUrl: 'https://www.14ers.com/route.php?route=long1',
    },
    {
      name: 'Loft Route',
      trailhead: 'Longs Peak',
      difficulty: 'Class 3',
      roundTripMiles: 13,
      elevationGainFt: 5300,
      sourceUrl: 'https://www.14ers.com/route.php?route=long2',
    },
  ],
  pikes: [
    {
      name: 'East Slopes (Barr Trail)',
      trailhead: 'Barr Trail / Manitou Springs',
      difficulty: 'Class 1',
      roundTripMiles: 24,
      elevationGainFt: 7600,
      standard: true,
      sourceUrl: 'https://www.14ers.com/route.php?route=pikeeast',
    },
    {
      name: 'Northwest Slopes',
      trailhead: 'The Crags',
      difficulty: 'Class 2',
      roundTripMiles: 14,
      elevationGainFt: 4300,
      sourceUrl: 'https://www.14ers.com/route.php?route=pike1',
    },
  ],
  blanca: [
    {
      name: 'Northwest Ridge',
      trailhead: 'Lake Como (Blanca Pk)',
      difficulty: 'Difficult Class 2',
      roundTripMiles: 17,
      elevationGainFt: 6500,
      standard: true,
      sourceUrl: 'https://www.14ers.com/route.php?route=blan1',
    },
    {
      name: 'Ellingwood Point (South Face)',
      trailhead: 'Lake Como (Blanca Pk)',
      difficulty: 'Difficult Class 2',
      roundTripMiles: 17,
      elevationGainFt: 6200,
      sourceUrl: 'https://www.14ers.com/route.php?route=elli2',
    },
  ],
  crestone: [
    {
      name: 'South Face',
      trailhead: 'South Colony Lakes',
      difficulty: 'Class 3',
      roundTripMiles: 14,
      elevationGainFt: 5700,
      standard: true,
      sourceUrl: 'https://www.14ers.com/route.php?route=cpea2',
    },
  ],
  capitol: [
    {
      name: 'Northeast Ridge',
      trailhead: 'Capitol Creek',
      difficulty: 'Class 4',
      roundTripMiles: 17,
      elevationGainFt: 5300,
      standard: true,
      sourceUrl: 'https://www.14ers.com/route.php?route=capi1',
    },
  ],
  pyramid: [
    {
      name: 'Northeast Ridge',
      trailhead: 'Maroon Lake',
      difficulty: 'Class 4',
      roundTripMiles: 8.25,
      elevationGainFt: 4500,
      standard: true,
      sourceUrl: 'https://www.14ers.com/route.php?route=pyra1',
    },
  ],
  massive: [
    {
      name: 'East Slopes',
      trailhead: 'Mt. Massive / North Halfmoon Creek',
      difficulty: 'Class 2',
      roundTripMiles: 14.5,
      elevationGainFt: 4500,
      standard: true,
      sourceUrl: 'https://www.14ers.com/route.php?route=mass1',
    },
    {
      name: 'Southwest Slopes',
      trailhead: 'Mt. Massive Trailhead',
      difficulty: 'Class 2',
      roundTripMiles: 13.5,
      elevationGainFt: 4400,
      sourceUrl: 'https://www.14ers.com/route.php?route=mass2',
    },
  ],
  quandary: [
    {
      name: 'East Ridge',
      trailhead: 'Quandary (East Ridge)',
      difficulty: 'Class 1',
      roundTripMiles: 6.75,
      elevationGainFt: 3450,
      standard: true,
      sourceUrl: 'https://www.14ers.com/route.php?route=quan1',
    },
  ],
  grays: [
    {
      name: 'North Slopes',
      trailhead: 'Grays Peak',
      difficulty: 'Class 1',
      roundTripMiles: 7.5,
      elevationGainFt: 3000,
      standard: true,
      sourceUrl: 'https://www.14ers.com/route.php?route=gray1',
    },
    {
      name: 'Grays and Torreys Combo',
      trailhead: 'Grays Peak',
      difficulty: 'Class 2',
      roundTripMiles: 8.25,
      elevationGainFt: 3600,
      sourceUrl: 'https://www.14ers.com/route.php?route=gray1',
    },
  ],
  torreys: [
    {
      name: 'South Slopes (via Grays)',
      trailhead: 'Grays Peak',
      difficulty: 'Class 2',
      roundTripMiles: 8.25,
      elevationGainFt: 3600,
      standard: true,
      sourceUrl: 'https://www.14ers.com/route.php?route=torr1',
    },
  ],
  bierstadt: [
    {
      name: 'West Slopes',
      trailhead: 'Guanella Pass',
      difficulty: 'Class 2',
      roundTripMiles: 7,
      elevationGainFt: 2850,
      standard: true,
      sourceUrl: 'https://www.14ers.com/route.php?route=bier1',
    },
  ],
  maroon: [
    {
      name: 'South Ridge',
      trailhead: 'Maroon Lake',
      difficulty: 'Class 3',
      roundTripMiles: 11.5,
      elevationGainFt: 4800,
      standard: true,
      sourceUrl: 'https://www.14ers.com/route.php?route=maro1',
    },
  ],
  sneffels: [
    {
      name: 'South Slopes',
      trailhead: 'Yankee Boy Basin',
      difficulty: 'Difficult Class 2',
      roundTripMiles: 6,
      elevationGainFt: 2900,
      standard: true,
      sourceUrl: 'https://www.14ers.com/route.php?route=snef1',
    },
  ],
  uncompahgre: [
    {
      name: 'South Ridge',
      trailhead: 'Nellie Creek',
      difficulty: 'Class 2',
      roundTripMiles: 7.5,
      elevationGainFt: 3000,
      standard: true,
      sourceUrl: 'https://www.14ers.com/route.php?route=unco1',
    },
  ],
  harvard: [
    {
      name: 'South Slopes',
      trailhead: 'North Cottonwood / Horn Fork',
      difficulty: 'Class 2',
      roundTripMiles: 14,
      elevationGainFt: 4600,
      standard: true,
      sourceUrl: 'https://www.14ers.com/route.php?route=harv1',
    },
  ],
  sherman: [
    {
      name: 'Southwest Ridge',
      trailhead: 'Fourmile Creek',
      difficulty: 'Class 2',
      roundTripMiles: 5.25,
      elevationGainFt: 2100,
      standard: true,
      sourceUrl: 'https://www.14ers.com/route.php?route=sher1',
    },
  ],
  bluesky: [
    {
      name: 'West Ridge',
      trailhead: 'Summit Lake',
      difficulty: 'Class 2',
      roundTripMiles: 3.5,
      elevationGainFt: 1400,
      standard: true,
      note: 'Formerly Mt. Evans; summit highway seasonal.',
      sourceUrl: 'https://www.14ers.com/route.php?route=evan1',
    },
  ],
  princeton: [
    {
      name: 'East Slopes',
      trailhead: 'Mt. Princeton Road / radio towers',
      difficulty: 'Class 2',
      roundTripMiles: 6.5,
      elevationGainFt: 3200,
      standard: true,
      sourceUrl: 'https://www.14ers.com/route.php?route=prin1',
    },
  ],
  yale: [
    {
      name: 'Southwest Slopes',
      trailhead: 'Denny Creek',
      difficulty: 'Class 2',
      roundTripMiles: 9.5,
      elevationGainFt: 4300,
      standard: true,
      sourceUrl: 'https://www.14ers.com/route.php?route=yale1',
    },
  ],
  handies: [
    {
      name: 'Southwest Slopes',
      trailhead: 'American Basin',
      difficulty: 'Class 1',
      roundTripMiles: 5.75,
      elevationGainFt: 2500,
      standard: true,
      sourceUrl: 'https://www.14ers.com/route.php?route=hand1',
    },
  ],
  holycross: [
    {
      name: 'North Ridge',
      trailhead: 'Half Moon / Fall Creek',
      difficulty: 'Class 2',
      roundTripMiles: 11.5,
      elevationGainFt: 5600,
      standard: true,
      sourceUrl: 'https://www.14ers.com/route.php?route=holy1',
    },
  ],
}

export function fourteenersRoutesForPeak(peakId: string): FourteenersRoute[] {
  return FOURTEENERS_ROUTES[peakId] ?? []
}

export function peakHasFourteenersRoutes(peakId: string): boolean {
  return fourteenersRoutesForPeak(peakId).length > 0
}
