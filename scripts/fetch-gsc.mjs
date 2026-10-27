#!/usr/bin/env node
/**
 * Weekly Google Search Console export for the PeakAtlas3D Cursor Automation.
 *
 * Writes:
 *   data/gsc/<endDate>.json   raw rows (current + previous 7 days)
 *   data/gsc/<endDate>.md     pre-computed summary the agent reads first
 *   data/gsc/latest.json / latest.md  copies of the newest pair
 *
 * Auth: a Google service account with *Restricted* (read-only) access to the
 * Search Console property. The key JSON comes ONLY from the env var
 * GSC_SERVICE_ACCOUNT_JSON (a GitHub Actions secret). Never commit the key.
 *
 * No npm dependencies — uses Node's built-in crypto + fetch (Node 20+).
 */
import { createSign } from 'node:crypto'
import { mkdirSync, writeFileSync, copyFileSync } from 'node:fs'
import { join } from 'node:path'

const SITE = process.env.GSC_SITE || 'sc-domain:peakatlas3d.com'
const OUT_DIR = process.env.GSC_OUT_DIR || 'data/gsc'
const LAG_DAYS = 3 // GSC "final" data trails ~2–3 days
const ROW_LIMIT = 5000

/** Searches that signal trip intent (the metric we track toward 15–20%). */
const TRIP_RE =
  /\b(hike|hiking|climb|climbing|trek|trekking|route|trail|summit|permit|lottery|guide|guided|difficult|difficulty|how long|days|season|best time|when to|weather|itinerary|cost|price|camp|base camp|acclimati)/i
const MAP_RE = /\b(map|maps|location|where is|coordinates|3d|térkép|karte|mapa|kort)\b/i

function b64url(input) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=+$/, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
}

async function accessToken() {
  const raw = process.env.GSC_SERVICE_ACCOUNT_JSON
  if (!raw) throw new Error('GSC_SERVICE_ACCOUNT_JSON is not set')
  const key = JSON.parse(raw)
  const now = Math.floor(Date.now() / 1000)
  const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  const claims = b64url(
    JSON.stringify({
      iss: key.client_email,
      scope: 'https://www.googleapis.com/auth/webmasters.readonly',
      aud: 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: now + 3600,
    }),
  )
  const signer = createSign('RSA-SHA256')
  signer.update(`${header}.${claims}`)
  const signature = signer
    .sign(key.private_key, 'base64')
    .replace(/=+$/, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: `${header}.${claims}.${signature}`,
    }),
  })
  if (!res.ok) throw new Error(`token request failed: ${res.status} ${await res.text()}`)
  return (await res.json()).access_token
}

async function query(token, startDate, endDate, dimensions) {
  const url = `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(
    SITE,
  )}/searchAnalytics/query`
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ startDate, endDate, dimensions, rowLimit: ROW_LIMIT, dataState: 'final' }),
  })
  if (!res.ok) throw new Error(`GSC query ${dimensions} failed: ${res.status} ${await res.text()}`)
  const json = await res.json()
  return (json.rows || []).map((r) => ({
    keys: r.keys,
    clicks: r.clicks,
    impressions: r.impressions,
    ctr: r.ctr,
    position: r.position,
  }))
}

const iso = (d) => d.toISOString().slice(0, 10)
const addDays = (d, n) => new Date(d.getTime() + n * 86_400_000)

function sum(rows) {
  const clicks = rows.reduce((a, r) => a + r.clicks, 0)
  const impressions = rows.reduce((a, r) => a + r.impressions, 0)
  const wpos = rows.reduce((a, r) => a + r.position * r.impressions, 0)
  return {
    clicks,
    impressions,
    ctr: impressions ? clicks / impressions : 0,
    position: impressions ? wpos / impressions : null,
  }
}

const pct = (x) => `${(x * 100).toFixed(1)}%`
const n1 = (x) => (x == null ? '—' : x.toFixed(1))
const delta = (a, b) => (b ? `${a - b >= 0 ? '+' : ''}${(((a - b) / b) * 100).toFixed(0)}%` : 'new')

/** Strip query strings / www so ?country= and www variants roll up to one page. */
function cleanPage(url) {
  try {
    const u = new URL(url)
    return `https://peakatlas3d.com${u.pathname.replace(/\/$/, '') || '/'}`
  } catch {
    return url
  }
}

function rollupPages(rows) {
  const m = new Map()
  for (const r of rows) {
    const k = cleanPage(r.keys[0])
    const cur = m.get(k) || { page: k, clicks: 0, impressions: 0, wpos: 0 }
    cur.clicks += r.clicks
    cur.impressions += r.impressions
    cur.wpos += r.position * r.impressions
    m.set(k, cur)
  }
  return [...m.values()].map((p) => ({
    page: p.page,
    clicks: p.clicks,
    impressions: p.impressions,
    ctr: p.impressions ? p.clicks / p.impressions : 0,
    position: p.impressions ? p.wpos / p.impressions : null,
  }))
}

function intentShare(queryRows) {
  const total = queryRows.reduce((a, r) => a + r.impressions, 0)
  const trip = queryRows.filter((r) => TRIP_RE.test(r.keys[0])).reduce((a, r) => a + r.impressions, 0)
  const map = queryRows.filter((r) => MAP_RE.test(r.keys[0])).reduce((a, r) => a + r.impressions, 0)
  return { total, trip, map, tripShare: total ? trip / total : 0, mapShare: total ? map / total : 0 }
}

async function main() {
  const end = addDays(new Date(), -LAG_DAYS)
  const cur = { start: iso(addDays(end, -6)), end: iso(end) }
  const prev = { start: iso(addDays(end, -13)), end: iso(addDays(end, -7)) }

  const token = await accessToken()
  const [curDate, prevDate, curQuery, prevQuery, curPage, prevPage, curQP, curDevice] =
    await Promise.all([
      query(token, cur.start, cur.end, ['date']),
      query(token, prev.start, prev.end, ['date']),
      query(token, cur.start, cur.end, ['query']),
      query(token, prev.start, prev.end, ['query']),
      query(token, cur.start, cur.end, ['page']),
      query(token, prev.start, prev.end, ['page']),
      query(token, cur.start, cur.end, ['query', 'page']),
      query(token, cur.start, cur.end, ['device']),
    ])

  const totals = { current: sum(curDate), previous: sum(prevDate) }
  const intent = { current: intentShare(curQuery), previous: intentShare(prevQuery) }
  const pagesCur = rollupPages(curPage)
  const pagesPrev = new Map(rollupPages(prevPage).map((p) => [p.page, p]))

  // Page 1 but barely clicked → title/description rewrite candidates.
  const ctrCandidates = pagesCur
    .filter((p) => p.position != null && p.position <= 10 && p.impressions >= 15 && p.ctr < 0.03)
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 10)
    .map((p) => ({
      ...p,
      topQueries: curQP
        .filter((r) => cleanPage(r.keys[1]) === p.page)
        .sort((a, b) => b.impressions - a.impressions)
        .slice(0, 5)
        .map((r) => `${r.keys[0]} (${r.impressions} impr, pos ${n1(r.position)})`),
    }))

  // Positions 11–20 with real impressions → "nearly page 1" content-improvement candidates.
  const nearPage1 = pagesCur
    .filter((p) => p.position != null && p.position > 10 && p.position <= 20 && p.impressions >= 10)
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 10)

  const movers = pagesCur
    .map((p) => ({ ...p, prevImpr: pagesPrev.get(p.page)?.impressions || 0 }))
    .sort((a, b) => b.impressions - b.prevImpr - (a.impressions - a.prevImpr))
  const gainers = movers.filter((p) => p.impressions > p.prevImpr).slice(0, 10)
  const losers = [...movers].reverse().filter((p) => p.impressions < p.prevImpr).slice(0, 5)

  const raw = {
    generatedAt: new Date().toISOString(),
    site: SITE,
    ranges: { current: cur, previous: prev },
    totals,
    intent,
    ctrCandidates,
    nearPage1,
    gainers,
    losers,
    rows: {
      currentQueries: curQuery,
      previousQueries: prevQuery,
      currentPages: curPage,
      previousPages: prevPage,
      currentQueryPage: curQP,
      currentDevice: curDevice,
    },
  }

  const t = totals
  const md = [
    `# Search Console summary — ${cur.start} to ${cur.end}`,
    `Compared with ${prev.start} to ${prev.end}. Generated ${raw.generatedAt}.`,
    '',
    '## Totals',
    '| Metric | This week | Last week | Change |',
    '|---|---|---|---|',
    `| Clicks | ${t.current.clicks} | ${t.previous.clicks} | ${delta(t.current.clicks, t.previous.clicks)} |`,
    `| Impressions | ${t.current.impressions} | ${t.previous.impressions} | ${delta(t.current.impressions, t.previous.impressions)} |`,
    `| CTR | ${pct(t.current.ctr)} | ${pct(t.previous.ctr)} | |`,
    `| Avg position | ${n1(t.current.position)} | ${n1(t.previous.position)} | |`,
    '',
    '## Search intent (share of query impressions)',
    `- Trip searches (climb/hike/permit/best time…): **${pct(intent.current.tripShare)}** (last week ${pct(intent.previous.tripShare)}) — goal 15–20% by mid-2027`,
    `- Map/location searches: ${pct(intent.current.mapShare)} (last week ${pct(intent.previous.mapShare)})`,
    '',
    '## Page 1, low click rate — title/description rewrite candidates',
    ...(ctrCandidates.length
      ? ctrCandidates.map(
          (p) =>
            `- ${p.page} — ${p.impressions} impr, pos ${n1(p.position)}, CTR ${pct(p.ctr)}\n  - top queries: ${p.topQueries.join('; ') || 'n/a'}`,
        )
      : ['- none this week']),
    '',
    '## Positions 11–20 — content-improvement candidates',
    ...(nearPage1.length
      ? nearPage1.map((p) => `- ${p.page} — ${p.impressions} impr, pos ${n1(p.position)}`)
      : ['- none this week']),
    '',
    '## Biggest gainers (impressions vs last week)',
    ...(gainers.length ? gainers.map((p) => `- ${p.page} — ${p.prevImpr} → ${p.impressions}`) : ['- none']),
    '',
    '## Biggest losers',
    ...(losers.length ? losers.map((p) => `- ${p.page} — ${p.prevImpr} → ${p.impressions}`) : ['- none']),
    '',
  ].join('\n')

  mkdirSync(OUT_DIR, { recursive: true })
  const base = join(OUT_DIR, cur.end)
  writeFileSync(`${base}.json`, JSON.stringify(raw, null, 2))
  writeFileSync(`${base}.md`, md)
  copyFileSync(`${base}.json`, join(OUT_DIR, 'latest.json'))
  copyFileSync(`${base}.md`, join(OUT_DIR, 'latest.md'))
  console.log(`Wrote ${base}.json and ${base}.md`)
}

main().catch((err) => {
  console.error(err.message)
  process.exit(1)
})
