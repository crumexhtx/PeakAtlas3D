import { describe, expect, it } from 'vitest'
import { peakCanonicalHref } from '../components/PeakCanonicalLink'
import { toCanonicalHref } from './documentMeta'

describe('peak canonical', () => {
  it('formats production peak URL without query params', () => {
    expect(peakCanonicalHref('rainier')).toBe(
      'https://peakatlas3d.com/peak/rainier',
    )
  })

  it('strips ?country= from path-like inputs', () => {
    expect(toCanonicalHref('/peak/rainier?country=USA')).toBe(
      'https://peakatlas3d.com/peak/rainier',
    )
    expect(toCanonicalHref('https://peakatlas3d.com/peak/fuji?country=Japan')).toBe(
      'https://peakatlas3d.com/peak/fuji',
    )
  })
})
