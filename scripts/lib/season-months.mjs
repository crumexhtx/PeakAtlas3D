/**
 * Keep in sync with src/lib/seasonMonths.ts (validator / prerender).
 */

export const MONTH_SLUGS = [
  'january',
  'february',
  'march',
  'april',
  'may',
  'june',
  'july',
  'august',
  'september',
  'october',
  'november',
  'december',
]

export const MONTH_LABELS = {
  january: 'January',
  february: 'February',
  march: 'March',
  april: 'April',
  may: 'May',
  june: 'June',
  july: 'July',
  august: 'August',
  september: 'September',
  october: 'October',
  november: 'November',
  december: 'December',
}

export function monthSlugFromNumber(month) {
  return MONTH_SLUGS[month - 1] ?? null
}

export function monthNumberFromSlug(slug) {
  const index = MONTH_SLUGS.indexOf(String(slug).toLowerCase())
  return index >= 0 ? index + 1 : null
}

const MONTH_NAME_TO_NUM = {
  january: 1,
  jan: 1,
  february: 2,
  feb: 2,
  march: 3,
  mar: 3,
  april: 4,
  apr: 4,
  may: 5,
  june: 6,
  jun: 6,
  july: 7,
  jul: 7,
  august: 8,
  aug: 8,
  september: 9,
  sept: 9,
  sep: 9,
  october: 10,
  oct: 10,
  november: 11,
  nov: 11,
  december: 12,
  dec: 12,
}

const MONTH_TOKEN =
  '(?:january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sept|sep|oct|nov|dec)'
const QUALIFIER = '(?:early|late|mid)\\s+'
const MONTH_UNIT = `(?:${QUALIFIER})?${MONTH_TOKEN}`
const WINDOW_RE = new RegExp(
  `^(${MONTH_UNIT})(?:\\s*(?:[\\u2013\\u2014\\u2212-]|(?:\\bto\\b))\\s*(${MONTH_UNIT}))?$`,
  'i',
)

function uniqueSortedMonths(months) {
  return [...new Set(months.filter((n) => n >= 1 && n <= 12))].sort(
    (a, b) => a - b,
  )
}

function stripNoise(text) {
  let s = String(text).trim()
  let prev = ''
  while (s !== prev) {
    prev = s
    s = s.replace(/\([^()]*\)/g, ' ')
  }
  s = s.split(';')[0] ?? s
  return s.replace(/\s+/g, ' ').trim()
}

function parseMonthToken(token) {
  const trimmed = token.trim()
  const approx = /^(early|late|mid)\s+/i.test(trimmed)
  const name = trimmed.replace(/^(early|late|mid)\s+/i, '').trim().toLowerCase()
  const month = MONTH_NAME_TO_NUM[name]
  if (!month) return null
  return { month, approx }
}

function monthsInRange(start, end) {
  const out = []
  let current = start
  for (let i = 0; i < 12; i += 1) {
    out.push(current)
    if (current === end) break
    current = current === 12 ? 1 : current + 1
  }
  return out
}

function parseWindow(windowText) {
  const match = WINDOW_RE.exec(windowText.trim())
  if (!match) return null
  const start = parseMonthToken(match[1] ?? '')
  if (!start) return null
  if (!match[2]) {
    return { months: [start.month], approx: start.approx }
  }
  const end = parseMonthToken(match[2])
  if (!end) return null
  return {
    months: monthsInRange(start.month, end.month),
    approx: start.approx || end.approx,
  }
}

export function parseBestSeason(text) {
  const empty = {
    months: [],
    yearRound: false,
    confidence: 'unparsed',
  }
  if (typeof text !== 'string' || !text.trim()) return empty

  const cleaned = stripNoise(text)
  if (!cleaned) return empty

  if (/^year[\s-]*round\b/i.test(cleaned)) {
    return {
      months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      yearRound: true,
      confidence: 'exact',
    }
  }

  const windows = cleaned
    .split(/\s+or\s+|,\s*/i)
    .map((part) => part.trim())
    .filter(Boolean)
  if (!windows.length) return empty

  const months = []
  let approx = false
  for (const windowText of windows) {
    const parsed = parseWindow(windowText)
    if (!parsed) return empty
    months.push(...parsed.months)
    if (parsed.approx) approx = true
  }

  const unique = uniqueSortedMonths(months)
  if (!unique.length) return empty
  return {
    months: unique,
    yearRound: false,
    confidence: approx ? 'approx' : 'exact',
  }
}

export function resolvePeakSeason(peak) {
  if (Array.isArray(peak?.bestMonths) && peak.bestMonths.length > 0) {
    const months = uniqueSortedMonths(peak.bestMonths)
    if (!months.length) {
      return parseBestSeason(peak.bestSeason ?? '')
    }
    return {
      months,
      yearRound: months.length === 12,
      confidence: 'exact',
    }
  }
  return parseBestSeason(peak?.bestSeason ?? '')
}
