/**
 * One-off link checker for curated trail URLs.
 * Run: node scripts/check-trail-links.mjs
 */
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const files = [
  join(root, 'src/data/usPeakRoutes.ts'),
  join(root, 'src/data/fourteenersRoutes.ts'),
]

const urls = new Set()
for (const file of files) {
  const text = readFileSync(file, 'utf8')
  for (const m of text.matchAll(/source(?:Url|Home):\s*'([^']+)'/g)) {
    urls.add(m[1])
  }
  for (const m of text.matchAll(/source(?:Url|Home):\s*\n\s*'([^']+)'/g)) {
    urls.add(m[1])
  }
}

async function check(url) {
  try {
    const res = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      headers: {
        'User-Agent': 'PeakAtlasLinkCheck/1.0',
        Accept: 'text/html,application/xhtml+xml',
      },
      signal: AbortSignal.timeout(25000),
    })
    const body = (await res.text()).slice(0, 12000).toLowerCase()
    const soft =
      body.includes('page not found') ||
      body.includes("we can't find that page") ||
      body.includes('404 - file or directory not found') ||
      body.includes('error 404') ||
      body.includes('this page isn’t available') ||
      body.includes("this page isn't available")
    const ok = res.status >= 200 && res.status < 400 && !soft
    return { url, status: res.status, final: res.url, ok, soft }
  } catch (e) {
    return { url, status: 0, final: '', ok: false, soft: false, err: String(e) }
  }
}

const list = [...urls]
const results = []
for (let i = 0; i < list.length; i += 3) {
  const batch = list.slice(i, i + 3)
  results.push(...(await Promise.all(batch.map(check))))
  process.stdout.write(`.`)
  await new Promise((r) => setTimeout(r, 400))
}
console.log('')

const bad = results.filter((r) => !r.ok)
const good = results.filter((r) => r.ok)
console.log(`OK ${good.length} / BAD ${bad.length} / TOTAL ${results.length}`)
for (const r of bad) {
  console.log(
    `BAD ${r.status}${r.soft ? ' soft404' : ''} ${r.url}${r.err ? ' :: ' + r.err : ''}`,
  )
  if (r.final && r.final !== r.url) console.log(`  final ${r.final}`)
}
