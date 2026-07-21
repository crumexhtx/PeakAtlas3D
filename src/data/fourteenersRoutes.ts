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
}

export function fourteenersRoutesForPeak(peakId: string): FourteenersRoute[] {
  return FOURTEENERS_ROUTES[peakId] ?? []
}

export function peakHasFourteenersRoutes(peakId: string): boolean {
  return fourteenersRoutesForPeak(peakId).length > 0
}
