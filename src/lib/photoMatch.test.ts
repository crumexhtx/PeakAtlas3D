import { describe, expect, it } from 'vitest'
import { photoMatchesPeak } from '../../scripts/lib/photo-match.mjs'

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
