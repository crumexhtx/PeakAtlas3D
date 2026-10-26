import { describe, expect, it } from 'vitest'
import { parseBestSeason } from '../../scripts/lib/season-months.mjs'
import peaks from '../data/peaks.json'
import {
  parseBestSeason as parseBestSeasonTs,
  resolvePeakSeason,
} from './seasonMonths'
import type { Peak } from '../types/peak'

const catalog = peaks as Peak[]

function m(...months: number[]) {
  return months
}

/** Expected parse for every distinct `bestSeason` currently in peaks.json. */
const FIXTURES: Record<
  string,
  { months: number[]; yearRound: boolean; confidence: 'exact' | 'approx' | 'unparsed' }
> = {
  'Jul–Sep': { months: m(7, 8, 9), yearRound: false, confidence: 'exact' },
  'Jun–Sep': { months: m(6, 7, 8, 9), yearRound: false, confidence: 'exact' },
  'May–Oct': { months: m(5, 6, 7, 8, 9, 10), yearRound: false, confidence: 'exact' },
  'Jun–Oct': { months: m(6, 7, 8, 9, 10), yearRound: false, confidence: 'exact' },
  'May–Sep': { months: m(5, 6, 7, 8, 9), yearRound: false, confidence: 'exact' },
  'Nov–Mar': { months: m(1, 2, 3, 11, 12), yearRound: false, confidence: 'exact' },
  'Apr–May or Sep–Oct': {
    months: m(4, 5, 9, 10),
    yearRound: false,
    confidence: 'exact',
  },
  'Jun–Aug': { months: m(6, 7, 8), yearRound: false, confidence: 'exact' },
  'Dec–Mar': { months: m(1, 2, 3, 12), yearRound: false, confidence: 'exact' },
  'Jul–Aug': { months: m(7, 8), yearRound: false, confidence: 'exact' },
  'May–Jul': { months: m(5, 6, 7), yearRound: false, confidence: 'exact' },
  'Apr–Oct': { months: m(4, 5, 6, 7, 8, 9, 10), yearRound: false, confidence: 'exact' },
  'Apr–May or Oct–Nov': {
    months: m(4, 5, 10, 11),
    yearRound: false,
    confidence: 'exact',
  },
  'Dec–Apr': { months: m(1, 2, 3, 4, 12), yearRound: false, confidence: 'exact' },
  'May–Jun or Sep–Oct': {
    months: m(5, 6, 9, 10),
    yearRound: false,
    confidence: 'exact',
  },
  'Nov–Jan': { months: m(1, 11, 12), yearRound: false, confidence: 'exact' },
  'Apr–Jun or Sep–Oct': {
    months: m(4, 5, 6, 9, 10),
    yearRound: false,
    confidence: 'exact',
  },
  'Apr–Jun, Sep–Nov': {
    months: m(4, 5, 6, 9, 10, 11),
    yearRound: false,
    confidence: 'exact',
  },
  'Apr–May, Oct–Nov': {
    months: m(4, 5, 10, 11),
    yearRound: false,
    confidence: 'exact',
  },
  'Apr–Nov': {
    months: m(4, 5, 6, 7, 8, 9, 10, 11),
    yearRound: false,
    confidence: 'exact',
  },
  'Apr–Nov (road season varies)': {
    months: m(4, 5, 6, 7, 8, 9, 10, 11),
    yearRound: false,
    confidence: 'exact',
  },
  'Apr–Oct (climbers)': {
    months: m(4, 5, 6, 7, 8, 9, 10),
    yearRound: false,
    confidence: 'exact',
  },
  'Dec–Feb': { months: m(1, 2, 12), yearRound: false, confidence: 'exact' },
  'Dec–Feb, Jun–Aug': {
    months: m(1, 2, 6, 7, 8, 12),
    yearRound: false,
    confidence: 'exact',
  },
  'Dec–Jan or Jun–Jul': {
    months: m(1, 6, 7, 12),
    yearRound: false,
    confidence: 'exact',
  },
  'Feb–Apr': { months: m(2, 3, 4), yearRound: false, confidence: 'exact' },
  'Jan–Feb or Aug–Sep': {
    months: m(1, 2, 8, 9),
    yearRound: false,
    confidence: 'exact',
  },
  'Jan–Mar or Jun–Oct': {
    months: m(1, 2, 3, 6, 7, 8, 9, 10),
    yearRound: false,
    confidence: 'exact',
  },
  'Jul–early Sep': { months: m(7, 8, 9), yearRound: false, confidence: 'approx' },
  'Jun–Feb': {
    months: m(1, 2, 6, 7, 8, 9, 10, 11, 12),
    yearRound: false,
    confidence: 'exact',
  },
  'Jun–Jul': { months: m(6, 7), yearRound: false, confidence: 'exact' },
  'Late May–early Oct (cables up)': {
    months: m(5, 6, 7, 8, 9, 10),
    yearRound: false,
    confidence: 'approx',
  },
  'Late spring–early fall for summit climbs': {
    months: [],
    yearRound: false,
    confidence: 'unparsed',
  },
  'Mar–May': { months: m(3, 4, 5), yearRound: false, confidence: 'exact' },
  'Mar–Nov': {
    months: m(3, 4, 5, 6, 7, 8, 9, 10, 11),
    yearRound: false,
    confidence: 'exact',
  },
  'Nov–Apr': {
    months: m(1, 2, 3, 4, 11, 12),
    yearRound: false,
    confidence: 'exact',
  },
  'Nov–Feb': { months: m(1, 2, 11, 12), yearRound: false, confidence: 'exact' },
  'Oct–Apr': {
    months: m(1, 2, 3, 4, 10, 11, 12),
    yearRound: false,
    confidence: 'exact',
  },
  'Oct–Mar': {
    months: m(1, 2, 3, 10, 11, 12),
    yearRound: false,
    confidence: 'exact',
  },
  'Year-round (summit is cold; storms year-round)': {
    months: m(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12),
    yearRound: true,
    confidence: 'exact',
  },
  'Year-round (weather dependent)': {
    months: m(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12),
    yearRound: true,
    confidence: 'exact',
  },
  'Year-round; summit can be cold or snowy in winter': {
    months: m(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12),
    yearRound: true,
    confidence: 'exact',
  },
}

describe('parseBestSeason', () => {
  it('covers every distinct catalog bestSeason string', () => {
    const unique = [...new Set(catalog.map((p) => p.bestSeason))]
    expect(unique.sort()).toEqual(Object.keys(FIXTURES).sort())
  })

  it('parses each catalog bestSeason the same in TS and the validator copy', () => {
    for (const [text, expected] of Object.entries(FIXTURES)) {
      expect(parseBestSeasonTs(text), text).toEqual(expected)
      expect(parseBestSeason(text), `mjs: ${text}`).toEqual(expected)
    }
  })

  it('handles hyphen, en dash, and "to" ranges plus year wrap', () => {
    expect(parseBestSeasonTs('Jul-Sep').months).toEqual([7, 8, 9])
    expect(parseBestSeasonTs('July to September').months).toEqual([7, 8, 9])
    expect(parseBestSeasonTs('Nov–Mar').months).toEqual([1, 2, 3, 11, 12])
  })

  it('does not guess spring/fall wording', () => {
    expect(parseBestSeasonTs('Late spring–early fall for summit climbs')).toEqual({
      months: [],
      yearRound: false,
      confidence: 'unparsed',
    })
  })
})

describe('resolvePeakSeason', () => {
  it('uses curated bestMonths when parse is unparsed', () => {
    const unparsed = catalog.filter(
      (p) => parseBestSeasonTs(p.bestSeason).confidence === 'unparsed',
    )
    expect(unparsed.map((p) => p.id)).toEqual(['sthelens'])
    expect(resolvePeakSeason(unparsed[0]!)).toEqual({
      months: [4, 5, 6, 7, 8, 9, 10],
      yearRound: false,
      confidence: 'exact',
    })
  })
})
