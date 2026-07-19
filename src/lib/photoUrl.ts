/** Rewrite Wikimedia (or similar) thumb URLs to a target pixel width. */
export function photoThumb(url: string, width: number): string {
  if (!url) return url
  if (/\/\d+px-/.test(url)) return url.replace(/\/\d+px-/, `/${width}px-`)
  return url
}

export function photoSrcSet(url: string): string | undefined {
  if (!url || !/\/\d+px-/.test(url)) return undefined
  return [480, 640, 960].map((w) => `${photoThumb(url, w)} ${w}w`).join(', ')
}
