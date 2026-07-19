/** Prefer stored Commons thumb; offer sizes Safari/Wikimedia accept if the first fails. */
export function photoCandidateUrls(url: string): string[] {
  if (!url) return []
  const out: string[] = [url]

  // Standard thumbs: …/960px-File.jpg
  if (/\/\d+px-/.test(url)) {
    for (const width of [500, 1280, 960]) {
      const next = url.replace(/\/\d+px-/, `/${width}px-`)
      if (!out.includes(next)) out.push(next)
    }
  }

  // Multi-page / TIFF thumbs: …/lossy-page1-960px-File.tif.jpg
  if (/\/lossy-page\d+-\d+px-/i.test(url)) {
    for (const width of [500, 1280, 960]) {
      const next = url.replace(
        /\/lossy-page(\d+)-\d+px-/i,
        `/lossy-page$1-${width}px-`,
      )
      if (!out.includes(next)) out.push(next)
    }
  }

  // Original file (non-thumb) as last resort.
  const original = url
    .replace(
      /\/commons\/thumb\/([0-9a-f]\/[0-9a-f]{2}\/[^/]+)\/\d+px-[^/]+$/i,
      '/commons/$1',
    )
    .replace(
      /\/commons\/thumb\/([0-9a-f]\/[0-9a-f]{2}\/[^/]+)\/lossy-page\d+-\d+px-[^/]+$/i,
      '/commons/$1',
    )
  if (original !== url && !out.includes(original)) out.push(original)

  return out
}
