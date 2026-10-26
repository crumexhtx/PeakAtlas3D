/** Insert or replace a JSON-LD script tag in document.head. */
export function upsertJsonLd(id: string, data: object | null) {
  const existing = document.getElementById(id)
  if (!data) {
    existing?.remove()
    return
  }
  let el = existing as HTMLScriptElement | null
  if (!el) {
    el = document.createElement('script')
    el.type = 'application/ld+json'
    el.id = id
    document.head.appendChild(el)
  }
  el.text = JSON.stringify(data)
}
