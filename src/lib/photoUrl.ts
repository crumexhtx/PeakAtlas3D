/** Prefer sharp Commons thumbs for the dossier; fall back if a size is missing. */
export function photoCandidateUrls(url: string): string[] {
  if (!url) return []
  const out: string[] = []

  const push = (u: string) => {
    if (u && !out.includes(u)) out.push(u)
  }

  // Prefer larger thumbs first (dossier is ~360–720 CSS px; 1280 reads clean on retina).
  if (/\/\d+px-/.test(url)) {
    for (const width of [1280, 960, 800]) {
      push(url.replace(/\/\d+px-/, `/${width}px-`))
    }
  }

  // Multi-page / TIFF thumbs: …/lossy-page1-960px-File.tif.jpg
  if (/\/lossy-page\d+-\d+px-/i.test(url)) {
    for (const width of [1280, 960, 800]) {
      push(
        url.replace(
          /\/lossy-page(\d+)-\d+px-/i,
          `/lossy-page$1-${width}px-`,
        ),
      )
    }
  }

  push(url)

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
  push(original)

  return out
}
