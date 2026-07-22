/**
 * Runtime integrity check for src/data/peaks.json (build / CI gate).
 * Run: node scripts/validate-catalog.mjs
 */
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const peaksPath = join(root, 'src', 'data', 'peaks.json')

function fail(message) {
  console.error(`catalog invalid: ${message}`)
  process.exit(1)
}

function isFiniteNumber(v) {
  return typeof v === 'number' && Number.isFinite(v)
}

function isNonEmptyString(v) {
  return typeof v === 'string' && v.trim().length > 0
}

function assertTown(town, label) {
  if (!town || typeof town !== 'object') fail(`${label} missing`)
  if (!isNonEmptyString(town.name)) fail(`${label}.name`)
  if (!isNonEmptyString(town.region)) fail(`${label}.region`)
  if (!isFiniteNumber(town.distanceMiles)) fail(`${label}.distanceMiles`)
  if (!isFiniteNumber(town.lat)) fail(`${label}.lat`)
  if (!isFiniteNumber(town.lon)) fail(`${label}.lon`)
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

function assertPhoto(photo, label) {
  if (!photo || typeof photo !== 'object') fail(`${label} missing`)
  assertHttpUrl(photo.url, `${label}.url`)
  assertHttpUrl(photo.sourceUrl, `${label}.sourceUrl`)
  if (!isNonEmptyString(photo.credit)) fail(`${label}.credit`)
  if (!isNonEmptyString(photo.license)) fail(`${label}.license`)
}

function assertAmenity(item, label) {
  if (!item || typeof item !== 'object') fail(`${label} missing`)
  if (!isNonEmptyString(item.name)) fail(`${label}.name`)
  if (item.sourceUrl != null) assertHttpUrl(item.sourceUrl, `${label}.sourceUrl`)
  if (item.lat != null && !isFiniteNumber(item.lat)) fail(`${label}.lat`)
  if (item.lon != null && !isFiniteNumber(item.lon)) fail(`${label}.lon`)
}

const raw = readFileSync(peaksPath, 'utf8')
let peaks
try {
  peaks = JSON.parse(raw)
} catch (err) {
  fail(`JSON parse error: ${err.message}`)
}

if (!Array.isArray(peaks) || peaks.length === 0) {
  fail('expected a non-empty array')
}

const ids = new Set()

for (let i = 0; i < peaks.length; i++) {
  const peak = peaks[i]
  const where = `peaks[${i}]${peak?.id ? ` (${peak.id})` : ''}`

  if (!peak || typeof peak !== 'object') fail(`${where} not an object`)
  if (!isNonEmptyString(peak.id)) fail(`${where}.id`)
  if (ids.has(peak.id)) fail(`duplicate id: ${peak.id}`)
  ids.add(peak.id)
  if (!isNonEmptyString(peak.name)) fail(`${where}.name`)
  if (!isFiniteNumber(peak.lat) || peak.lat < -90 || peak.lat > 90) {
    fail(`${where}.lat`)
  }
  if (!isFiniteNumber(peak.lon) || peak.lon < -180 || peak.lon > 180) {
    fail(`${where}.lon`)
  }
  if (!isFiniteNumber(peak.elevationFt) || peak.elevationFt <= 0) {
    fail(`${where}.elevationFt`)
  }
  if (!isFiniteNumber(peak.prominenceFt) || peak.prominenceFt < 0) {
    fail(`${where}.prominenceFt`)
  }
  if (!isNonEmptyString(peak.range)) fail(`${where}.range`)
  if (!isNonEmptyString(peak.country)) fail(`${where}.country`)
  if (!isNonEmptyString(peak.description)) fail(`${where}.description`)
  if (!isNonEmptyString(peak.firstAscent)) fail(`${where}.firstAscent`)
  if (!isNonEmptyString(peak.difficulty)) fail(`${where}.difficulty`)
  assertTown(peak.nearestTown, `${where}.nearestTown`)
  if (!Array.isArray(peak.nearbyPlaces) || peak.nearbyPlaces.length === 0) {
    fail(`${where}.nearbyPlaces`)
  }
  peak.nearbyPlaces.forEach((t, j) => assertTown(t, `${where}.nearbyPlaces[${j}]`))
  if (!Array.isArray(peak.hotels)) fail(`${where}.hotels`)
  peak.hotels.forEach((h, j) => assertAmenity(h, `${where}.hotels[${j}]`))
  if (!Array.isArray(peak.food)) fail(`${where}.food`)
  peak.food.forEach((f, j) => assertAmenity(f, `${where}.food[${j}]`))
  if (peak.photos != null) {
    if (!Array.isArray(peak.photos)) fail(`${where}.photos`)
    peak.photos.forEach((p, j) => assertPhoto(p, `${where}.photos[${j}]`))
  }
  if (peak.photo != null) assertPhoto(peak.photo, `${where}.photo`)
  if (peak.seoMetaDescription != null && !isNonEmptyString(peak.seoMetaDescription)) {
    fail(`${where}.seoMetaDescription`)
  }
}

console.log(`catalog ok: ${peaks.length} peaks, ${ids.size} unique ids`)
