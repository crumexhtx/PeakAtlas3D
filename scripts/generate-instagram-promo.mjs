#!/usr/bin/env node
/**
 * Generate an Instagram Reels–style (9:16) promotional video for a peak page.
 *
 * Uses peak photos from peaks.json, SVG text overlays (brand colors), and
 * ffmpeg Ken Burns zooms. Default peak is Matterhorn.
 *
 * Prerequisites: ffmpeg on PATH (with librsvg + libx264).
 *
 * Run:
 *   npm run promo:instagram
 *   npm run promo:instagram -- --peak matterhorn
 *   npm run promo:instagram -- --peak rainier --out output/rainier-reel.mp4
 *
 * Env:
 *   SITE_URL=https://peakatlas3d.com (optional)
 */
import { spawnSync } from 'node:child_process'
import {
  copyFileSync,
  createWriteStream,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { pipeline } from 'node:stream/promises'
import { Readable } from 'node:stream'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const peaksPath = join(root, 'src', 'data', 'peaks.json')
const siteUrl = (process.env.SITE_URL || 'https://peakatlas3d.com').replace(
  /\/$/,
  '',
)

const WIDTH = 1080
const HEIGHT = 1920
const FPS = 30

/** Brand tokens aligned with src/styles/app.css */
const COLORS = {
  bg: '#0b1220',
  text: '#f4f7fb',
  muted: '#9aa8b8',
  accent: '#4fc3f7',
}

const FONT_BOLD = '/usr/share/fonts/truetype/macos/Inter-Bold.ttf'
const FONT_MEDIUM = '/usr/share/fonts/truetype/macos/Inter-Medium.ttf'
const FONT_FALLBACK_BOLD = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
const FONT_FALLBACK = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'

function parseArgs(argv) {
  /** @type {{ peak: string, out: string | null, keepWork: boolean, help: boolean }} */
  const opts = {
    peak: 'matterhorn',
    out: null,
    keepWork: false,
    help: false,
  }
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    if (arg === '--help' || arg === '-h') opts.help = true
    else if (arg === '--peak' || arg === '-p') opts.peak = String(argv[++i] || '')
    else if (arg === '--out' || arg === '-o') opts.out = String(argv[++i] || '')
    else if (arg === '--keep-work') opts.keepWork = true
    else if (arg.startsWith('-')) {
      console.error(`Unknown flag: ${arg}`)
      opts.help = true
    }
  }
  return opts
}

function printHelp() {
  console.log(`Usage: node scripts/generate-instagram-promo.mjs [options]

Options:
  --peak, -p <id>   Peak id from peaks.json (default: matterhorn)
  --out, -o <path>  Output mp4 path (default: output/<id>-instagram-promo.mp4)
  --keep-work       Keep temp download/overlay files
  --help, -h        Show help
`)
}

function escapeXml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

function fontFamilyCss() {
  const bold = existsSync(FONT_BOLD) ? FONT_BOLD : FONT_FALLBACK_BOLD
  const medium = existsSync(FONT_MEDIUM) ? FONT_MEDIUM : FONT_FALLBACK
  return { bold, medium }
}

function formatElevationFt(ft) {
  return `${Number(ft).toLocaleString('en-US')} ft`
}

function formatElevationM(ft) {
  const meters = Math.round(Number(ft) * 0.3048)
  return `${meters.toLocaleString('en-US')} m`
}

function wrapLines(text, maxChars) {
  const words = String(text).trim().split(/\s+/).filter(Boolean)
  /** @type {string[]} */
  const lines = []
  let current = ''
  for (const word of words) {
    const next = current ? `${current} ${word}` : word
    if (next.length > maxChars && current) {
      lines.push(current)
      current = word
    } else {
      current = next
    }
  }
  if (current) lines.push(current)
  return lines
}

function requireFfmpeg() {
  const probe = spawnSync('ffmpeg', ['-version'], { encoding: 'utf8' })
  if (probe.status !== 0) {
    throw new Error(
      'ffmpeg is required but was not found on PATH. Install ffmpeg and retry.',
    )
  }
}

async function downloadFile(url, dest) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'PeakAtlas3D-promo-script/1.0 (educational; peakatlas3d.com)',
      Accept: 'image/*,*/*',
    },
    redirect: 'follow',
  })
  if (!res.ok || !res.body) {
    throw new Error(`Failed to download ${url} (${res.status} ${res.statusText})`)
  }
  await pipeline(Readable.fromWeb(res.body), createWriteStream(dest))
}

function runFfmpeg(args, label) {
  console.log(`  ffmpeg: ${label}`)
  const result = spawnSync('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', ...args], {
    encoding: 'utf8',
  })
  if (result.status !== 0) {
    const detail = [result.stderr, result.stdout].filter(Boolean).join('\n').trim()
    throw new Error(`ffmpeg failed (${label})${detail ? `:\n${detail}` : ''}`)
  }
}

/**
 * @param {{
 *   titleLines?: string[],
 *   subtitle?: string,
 *   bodyLines?: string[],
 *   footer?: string,
 *   credit?: string,
 *   brand?: boolean,
 *   cta?: boolean,
 * }} opts
 */
function buildOverlaySvg(opts) {
  const { bold, medium } = fontFamilyCss()
  const titleLines = opts.titleLines ?? []
  const bodyLines = opts.bodyLines ?? []
  const titleStartY = opts.cta ? 1180 : 1280
  const titleStep = 108
  const bodyStartY =
    titleStartY + titleLines.length * titleStep + (opts.subtitle ? 70 : 24)
  const bodyStep = 58

  const titleXml = titleLines
    .map(
      (line, i) =>
        `<text x="540" y="${titleStartY + i * titleStep}" text-anchor="middle" font-family="Inter, DejaVu Sans, sans-serif" font-size="92" font-weight="700" fill="${COLORS.text}" letter-spacing="-1">${escapeXml(line)}</text>`,
    )
    .join('\n  ')

  const subtitleXml = opts.subtitle
    ? `<text x="540" y="${titleStartY + titleLines.length * titleStep - 20}" text-anchor="middle" font-family="Inter, DejaVu Sans, sans-serif" font-size="36" font-weight="600" fill="${COLORS.accent}">${escapeXml(opts.subtitle)}</text>`
    : ''

  const bodyXml = bodyLines
    .map(
      (line, i) =>
        `<text x="540" y="${bodyStartY + i * bodyStep}" text-anchor="middle" font-family="Inter, DejaVu Sans, sans-serif" font-size="40" font-weight="500" fill="${COLORS.text}">${escapeXml(line)}</text>`,
    )
    .join('\n  ')

  const brandXml = opts.brand
    ? `<g>
    <text x="72" y="110" font-family="Inter, DejaVu Sans, sans-serif" font-size="34" font-weight="700" fill="${COLORS.text}">PeakAtlas</text>
    <text x="278" y="110" font-family="Inter, DejaVu Sans, sans-serif" font-size="34" font-weight="700" fill="${COLORS.accent}">3D</text>
  </g>`
    : ''

  const ctaXml = opts.cta
    ? `<g>
    <rect x="240" y="1520" rx="14" ry="14" width="600" height="88" fill="${COLORS.accent}"/>
    <text x="540" y="1576" text-anchor="middle" font-family="Inter, DejaVu Sans, sans-serif" font-size="36" font-weight="700" fill="${COLORS.bg}">Explore the 3D map</text>
  </g>`
    : ''

  const footerXml = opts.footer
    ? `<text x="540" y="${opts.cta ? 1680 : 1760}" text-anchor="middle" font-family="Inter, DejaVu Sans, sans-serif" font-size="30" font-weight="500" fill="${COLORS.muted}">${escapeXml(opts.footer)}</text>`
    : ''

  const creditXml = opts.credit
    ? `<text x="540" y="1860" text-anchor="middle" font-family="Inter, DejaVu Sans, sans-serif" font-size="22" font-weight="500" fill="${COLORS.muted}" opacity="0.85">${escapeXml(opts.credit)}</text>`
    : ''

  // font-face hints help librsvg when system fonts differ
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <defs>
    <linearGradient id="veil" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${COLORS.bg}" stop-opacity="0.42"/>
      <stop offset="42%" stop-color="${COLORS.bg}" stop-opacity="0.12"/>
      <stop offset="100%" stop-color="${COLORS.bg}" stop-opacity="0.82"/>
    </linearGradient>
    <style type="text/css"><![CDATA[
      @font-face { font-family: 'Inter'; src: url('file://${bold}'); font-weight: 700; }
      @font-face { font-family: 'Inter'; src: url('file://${medium}'); font-weight: 500; }
    ]]></style>
  </defs>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#veil)"/>
  ${brandXml}
  ${titleXml}
  ${subtitleXml}
  ${bodyXml}
  ${ctaXml}
  ${footerXml}
  ${creditXml}
</svg>
`
}

/**
 * Build one Ken Burns scene from a still + SVG overlay.
 * @param {{ imagePath: string, overlayPath: string, outPath: string, durationSec: number, zoomIn: boolean }} scene
 */
function renderScene(scene) {
  const frames = Math.round(scene.durationSec * FPS)
  // zoompan: start slightly zoomed, drift in or out
  const zExpr = scene.zoomIn
    ? `'min(zoom+0.00055,1.18)'`
    : `'if(eq(on,1),1.18,max(zoom-0.00055,1.0))'`
  const xExpr = `'iw/2-(iw/zoom/2)'`
  const yExpr = `'ih/2-(ih/zoom/2)'`

  runFfmpeg(
    [
      '-loop',
      '1',
      '-i',
      scene.imagePath,
      '-i',
      scene.overlayPath,
      '-filter_complex',
      [
        `[0:v]scale=${WIDTH * 2}:${HEIGHT * 2}:force_original_aspect_ratio=increase,`,
        `crop=${WIDTH * 2}:${HEIGHT * 2},`,
        `zoompan=z=${zExpr}:x=${xExpr}:y=${yExpr}:d=${frames}:s=${WIDTH}x${HEIGHT}:fps=${FPS},`,
        `setsar=1[bg]`,
        `;[1:v]format=rgba,scale=${WIDTH}:${HEIGHT}[ov]`,
        `;[bg][ov]overlay=0:0:format=auto,format=yuv420p[v]`,
      ].join(''),
      '-map',
      '[v]',
      '-t',
      String(scene.durationSec),
      '-r',
      String(FPS),
      '-an',
      '-c:v',
      'libx264',
      '-preset',
      'medium',
      '-crf',
      '18',
      '-pix_fmt',
      'yuv420p',
      scene.outPath,
    ],
    `scene → ${scene.outPath}`,
  )
}

function concatScenes(scenePaths, outPath) {
  const listPath = join(dirname(outPath), 'concat.txt')
  writeFileSync(
    listPath,
    scenePaths.map((p) => `file '${p.replaceAll("'", "'\\''")}'`).join('\n') + '\n',
  )
  runFfmpeg(
    [
      '-f',
      'concat',
      '-safe',
      '0',
      '-i',
      listPath,
      '-c:v',
      'libx264',
      '-preset',
      'medium',
      '-crf',
      '18',
      '-pix_fmt',
      'yuv420p',
      '-movflags',
      '+faststart',
      '-an',
      outPath,
    ],
    `concat → ${outPath}`,
  )
}

/**
 * @param {any} photo
 */
function sanitizeCredit(photo) {
  if (!photo) return 'Photo: Wikimedia Commons'
  let credit = String(photo.credit || '').replace(/\s+/g, ' ').trim()
  // Wikimedia sometimes stores caption/notes in the credit field.
  if (!credit || /^NOTE:/i.test(credit) || credit.length > 60) {
    credit = 'Wikimedia Commons'
  } else {
    credit = credit.slice(0, 42)
  }
  const license = photo.license ? ` · ${photo.license}` : ''
  return `Photo: ${credit}${license}`
}

/**
 * @param {any} peak
 * @param {any[]} photos
 */
function buildStoryboard(peak, photos) {
  const elev = `${formatElevationFt(peak.elevationFt)} / ${formatElevationM(peak.elevationFt)}`
  const prominence = peak.prominenceFt
    ? `Prominence ${formatElevationFt(peak.prominenceFt)}`
    : null
  const location = [peak.range, peak.country].filter(Boolean).join(' · ')
  const why = peak.whyNotable || peak.description || ''
  const pageUrl = `${siteUrl.replace(/^https?:\/\//, '')}/peak/${peak.id}`
  const creditAt = (i) => sanitizeCredit(photos[i % photos.length])

  return [
    {
      id: 'hero',
      durationSec: 4.2,
      zoomIn: true,
      overlay: {
        brand: true,
        titleLines: wrapLines(peak.name, 16).slice(0, 2),
        subtitle: location || undefined,
        bodyLines: [elev],
        credit: creditAt(0),
      },
    },
    {
      id: 'story',
      durationSec: 4.5,
      zoomIn: false,
      overlay: {
        brand: true,
        titleLines: ['Why it stands out'],
        bodyLines: wrapLines(why, 28).slice(0, 4),
        credit: creditAt(1),
      },
    },
    {
      id: 'facts',
      durationSec: 4.5,
      zoomIn: true,
      overlay: {
        brand: true,
        titleLines: ['On the atlas'],
        bodyLines: [
          elev,
          prominence,
          peak.difficulty ? `Route: ${peak.difficulty}` : null,
          peak.firstAscent ? `First ascent ${peak.firstAscent}` : null,
          peak.bestSeason ? `Best season ${peak.bestSeason}` : null,
          peak.nearestTown?.name
            ? `Nearest town ${peak.nearestTown.name}`
            : null,
        ].filter(Boolean),
        credit: creditAt(2),
      },
    },
    {
      id: 'cta',
      durationSec: 4.8,
      zoomIn: false,
      overlay: {
        brand: true,
        titleLines: wrapLines(peak.name, 16).slice(0, 2),
        bodyLines: ['Wander the ridges on a 3D map'],
        cta: true,
        footer: pageUrl,
        credit: creditAt(3),
      },
    },
  ]
}

async function main() {
  const opts = parseArgs(process.argv.slice(2))
  if (opts.help) {
    printHelp()
    process.exit(0)
  }

  requireFfmpeg()

  const peaks = JSON.parse(readFileSync(peaksPath, 'utf8'))
  const peak = peaks.find((p) => p.id === opts.peak)
  if (!peak) {
    throw new Error(
      `Peak "${opts.peak}" not found in src/data/peaks.json. Example: --peak matterhorn`,
    )
  }

  /** @type {any[]} */
  const photos = []
  if (Array.isArray(peak.photos)) {
    for (const p of peak.photos) {
      if (p?.url) photos.push(p)
    }
  }
  if (peak.photo?.url && !photos.some((p) => p.url === peak.photo.url)) {
    photos.unshift(peak.photo)
  }
  if (photos.length === 0) {
    throw new Error(`Peak "${peak.id}" has no photos to build a promo from.`)
  }

  const outPath = resolve(
    opts.out || join(root, 'output', `${peak.id}-instagram-promo.mp4`),
  )
  mkdirSync(dirname(outPath), { recursive: true })

  const workDir = mkdtempSync(join(tmpdir(), `peakatlas-promo-${peak.id}-`))
  console.log(`Generating Instagram promo for ${peak.name} (${peak.id})`)
  console.log(`  work: ${workDir}`)
  console.log(`  out:  ${outPath}`)

  try {
    /** @type {string[]} */
    const localPhotos = []
    for (let i = 0; i < photos.length; i += 1) {
      const dest = join(workDir, `photo-${i}.jpg`)
      console.log(`  download photo ${i + 1}/${photos.length}`)
      await downloadFile(photos[i].url, dest)
      localPhotos.push(dest)
    }

    const storyboard = buildStoryboard(peak, photos)
    /** @type {string[]} */
    const scenePaths = []

    for (let i = 0; i < storyboard.length; i += 1) {
      const scene = storyboard[i]
      const photo = localPhotos[i % localPhotos.length]
      const overlayPath = join(workDir, `overlay-${scene.id}.svg`)
      const scenePath = join(workDir, `scene-${String(i).padStart(2, '0')}-${scene.id}.mp4`)
      writeFileSync(overlayPath, buildOverlaySvg(scene.overlay))
      renderScene({
        imagePath: photo,
        overlayPath,
        outPath: scenePath,
        durationSec: scene.durationSec,
        zoomIn: scene.zoomIn,
      })
      scenePaths.push(scenePath)
    }

    const assembled = join(workDir, 'assembled.mp4')
    concatScenes(scenePaths, assembled)
    copyFileSync(assembled, outPath)

    const totalSec = storyboard.reduce((sum, s) => sum + s.durationSec, 0)
    console.log(
      `Done. ${WIDTH}×${HEIGHT} @ ${FPS}fps, ~${totalSec.toFixed(1)}s → ${outPath}`,
    )
    console.log(`Share on Instagram Reels / Stories. Peak page: ${siteUrl}/peak/${peak.id}`)
  } finally {
    if (opts.keepWork) {
      console.log(`Kept work dir: ${workDir}`)
    } else {
      rmSync(workDir, { recursive: true, force: true })
    }
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})
