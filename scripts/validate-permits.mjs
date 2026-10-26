/**
 * Integrity check for src/data/permits.json.
 * Run: node scripts/validate-permits.mjs
 */
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const peaksPath = join(root, 'src', 'data', 'peaks.json')
const permitsPath = join(root, 'src', 'data', 'permits.json')

const PERMIT_TYPES = new Set([
  'lottery',
  'advance-reservation',
  'registration',
  'fee-only',
  'guide-required',
])
const STATUSES = new Set(['verified', 'unverified'])
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

function fail(message) {
  console.error(`permits invalid: ${message}`)
  process.exit(1)
}

function isNonEmptyString(v) {
  return typeof v === 'string' && v.trim().length > 0
}

function assertHttpUrl(url, label) {
  if (!isNonEmptyString(url)) fail(`${label} empty`)
  let parsed
  try {
    parsed = new URL(url)
  } catch {
    fail(`${label} not a URL: ${url}`)
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    fail(`${label} must be http(s): ${url}`)
  }
}

function parseDay(value, label) {
  if (!ISO_DATE.test(value)) fail(`${label} must be YYYY-MM-DD: ${value}`)
  const date = new Date(`${value}T00:00:00Z`)
  if (Number.isNaN(date.getTime())) fail(`${label} invalid date: ${value}`)
  return date
}

const peaks = JSON.parse(readFileSync(peaksPath, 'utf8'))
if (!Array.isArray(peaks)) fail('peaks.json must be an array')
const peakIds = new Set(
  peaks.map((p) => p.id).filter((id) => typeof id === 'string' && id.length),
)

const permits = JSON.parse(readFileSync(permitsPath, 'utf8'))
if (!Array.isArray(permits) || permits.length === 0) {
  fail('permits.json must be a non-empty array')
}

const seenIds = new Set()
const warnings = []
const today = new Date()
today.setUTCHours(0, 0, 0, 0)
const staleMs = 180 * 24 * 60 * 60 * 1000

for (const [index, entry] of permits.entries()) {
  const label = entry?.id ? `permits[${entry.id}]` : `permits[${index}]`
  if (!entry || typeof entry !== 'object') fail(`${label} not an object`)
  if (!isNonEmptyString(entry.id)) fail(`${label}.id`)
  if (seenIds.has(entry.id)) fail(`duplicate permit id ${entry.id}`)
  seenIds.add(entry.id)
  if (!isNonEmptyString(entry.name)) fail(`${label}.name`)
  if (!Array.isArray(entry.peakIds) || entry.peakIds.length === 0) {
    fail(`${label}.peakIds must be a non-empty array`)
  }
  for (const peakId of entry.peakIds) {
    if (typeof peakId !== 'string' || !peakIds.has(peakId)) {
      fail(`${label}.peakIds unknown peak "${peakId}"`)
    }
  }
  if (!isNonEmptyString(entry.agency)) fail(`${label}.agency`)
  if (!PERMIT_TYPES.has(entry.type)) fail(`${label}.type invalid: ${entry.type}`)
  assertHttpUrl(entry.bookingUrl, `${label}.bookingUrl`)
  assertHttpUrl(entry.sourceUrl, `${label}.sourceUrl`)
  if (!isNonEmptyString(entry.verifiedOn)) fail(`${label}.verifiedOn`)
  const verified = parseDay(entry.verifiedOn, `${label}.verifiedOn`)
  if (today.getTime() - verified.getTime() > staleMs) {
    warnings.push(
      `${label}: verifiedOn ${entry.verifiedOn} is more than 180 days old`,
    )
  }
  if (!isNonEmptyString(entry.season)) fail(`${label}.season`)
  if (!Array.isArray(entry.windows)) fail(`${label}.windows must be an array`)
  for (const [wIndex, window] of entry.windows.entries()) {
    const wLabel = `${label}.windows[${wIndex}]`
    if (!window || typeof window !== 'object') fail(`${wLabel} not an object`)
    if (!isNonEmptyString(window.label)) fail(`${wLabel}.label`)
    const opens = parseDay(window.opens, `${wLabel}.opens`)
    const closes = parseDay(window.closes, `${wLabel}.closes`)
    if (closes.getTime() < opens.getTime()) {
      fail(`${wLabel} closes (${window.closes}) before opens (${window.opens})`)
    }
    if (typeof window.approximate !== 'boolean') {
      fail(`${wLabel}.approximate must be boolean`)
    }
    if (closes.getTime() < today.getTime()) {
      warnings.push(
        `${label}: window "${window.label}" already closed on ${window.closes}`,
      )
    }
  }
  if (!isNonEmptyString(entry.summary)) fail(`${label}.summary`)
  if (entry.feesNote != null && !isNonEmptyString(entry.feesNote)) {
    fail(`${label}.feesNote empty`)
  }
  if (!STATUSES.has(entry.status)) fail(`${label}.status invalid: ${entry.status}`)
}

if (warnings.length) {
  console.warn(`permits warnings (${warnings.length}):`)
  for (const warning of warnings) console.warn(`- ${warning}`)
}

console.log(
  `permits ok: ${permits.length} systems, ${permits.reduce((n, e) => n + e.peakIds.length, 0)} peak links`,
)
