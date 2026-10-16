import { describe, expect, it } from 'vitest'
import {
  PHOTO_ALLOWLIST,
  photoMatchesPeak,
  thumbUrl,
} from '../../scripts/lib/photo-match.mjs'

describe('photoMatchesPeak', () => {
  const peak = {
    id: 'kilimanjaro',
    name: 'Mt. Kilimanjaro',
    lat: -3.0758,
    lon: 37.3533,
  }

  it('rejects band/concert filenames', () => {
    const m = photoMatchesPeak(peak, {
      url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Mountain_Mocha_Kilimanjaro_band.jpg/960px-Mountain_Mocha_Kilimanjaro_band.jpg',
      sourceUrl:
        'https://commons.wikimedia.org/wiki/File:Mountain_Mocha_Kilimanjaro_band.jpg',
      title: 'File:Mountain Mocha Kilimanjaro band.jpg',
    })
    expect(m.ok).toBe(false)
    expect(m.reason).toMatch(/reject-pattern: band/)
  })

  it('rejects photos too far from the summit', () => {
    const m = photoMatchesPeak(peak, {
      url: 'https://example.com/street.jpg',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Langley_Mount.jpg',
      title: 'File:Langley Mount.jpg',
      lat: 51.5,
      lon: -0.12,
    })
    expect(m.ok).toBe(false)
    expect(m.reason).toMatch(/too-far:/)
  })

  it('does not pass on name match alone', () => {
    const m = photoMatchesPeak(peak, {
      url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/k/kili.jpg/960px-Kilimanjaro.jpg',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Kilimanjaro.jpg',
      title: 'File:Kilimanjaro.jpg',
    })
    expect(m.ok).toBe(false)
    expect(m.reason).toBe('no-coords')
  })

  it('does not treat Commons /960px-thumbnail.jpg thumbs as a reject hit', () => {
    const m = photoMatchesPeak(
      { id: 'slide', name: 'Slide Mountain', lat: 42.0, lon: -74.4 },
      {
        url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/View_west_toward_the_summit_of_Slide_Mountain.jpg/960px-thumbnail.jpg?utm_content=thumbnail',
        sourceUrl:
          'https://commons.wikimedia.org/wiki/File:View_west_toward_the_summit_of_Slide_Mountain.jpg',
        title: 'File:View west toward the summit of Slide Mountain.jpg',
        lat: 42.0,
        lon: -74.4,
        width: 1920,
        height: 1080,
      },
    )
    expect(m.ok).toBe(true)
  })

  it('allow-lists a curated viewpoint even when GPS is beyond 15 km', () => {
    const m = photoMatchesPeak(
      { ...peak, id: 'kilimanjaro' },
      {
        url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Amboseli_National_Park_and_Mt._Kilimanjaro.jpg/960px-Amboseli_National_Park_and_Mt._Kilimanjaro.jpg',
        sourceUrl:
          'https://commons.wikimedia.org/wiki/File:Amboseli_National_Park_and_Mt._Kilimanjaro.jpg',
        title: 'File:Amboseli National Park and Mt. Kilimanjaro.jpg',
        lat: -2.65,
        lon: 37.25,
        width: 1920,
        height: 1080,
      },
    )
    expect(m.ok).toBe(true)
    expect(m.reason).toBe('allow-list')
  })

  it('passes a geo-verified landscape still', () => {
    const m = photoMatchesPeak(peak, {
      url: 'https://example.com/kili.jpg',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Kilimanjaro.jpg',
      title: 'File:Kilimanjaro.jpg',
      lat: -3.07,
      lon: 37.35,
      width: 1920,
      height: 1080,
    })
    expect(m.ok).toBe(true)
    expect(m.reason).toBe('geo')
  })
})

describe('thumbUrl', () => {
  it('rewrites Commons thumbs to 960px and strips query strings', () => {
    const url =
      'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Foo.jpg/1280px-Foo.jpg?utm_source=commons.wikimedia.org'
    expect(thumbUrl(url)).toBe(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Foo.jpg/960px-Foo.jpg',
    )
  })

  it('builds a 960px thumb from a Commons original', () => {
    const url =
      'https://upload.wikimedia.org/wikipedia/commons/0/0e/Langley_Mount.jpg?utm_content=thumbnail_unscaled'
    expect(thumbUrl(url)).toBe(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Langley_Mount.jpg/960px-Langley_Mount.jpg',
    )
  })
})

describe('PHOTO_ALLOWLIST', () => {
  it('does not allow-list the Hunter NY 214 highway still', () => {
    const titles = PHOTO_ALLOWLIST.hunterny ?? []
    expect(titles.join(' ')).not.toMatch(/NY 214/i)
  })
})
