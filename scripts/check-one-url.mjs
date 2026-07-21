const u = process.argv[2]
const r = await fetch(u, {
  redirect: 'follow',
  headers: { 'User-Agent': 'PeakAtlasLinkCheck/1.0' },
})
const t = (await r.text()).slice(0, 8000).toLowerCase()
const soft =
  t.includes('page not found') ||
  t.includes("can't find that page") ||
  t.includes('error 404')
console.log(JSON.stringify({ status: r.status, final: r.url, soft, ok: r.status < 400 && !soft }))
