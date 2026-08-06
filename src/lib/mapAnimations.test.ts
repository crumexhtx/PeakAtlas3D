import { describe, expect, it } from 'vitest'
import { heroZoomViewportAdjust } from './mapAnimations'

const DESKTOP_PADDING = { left: 48, right: 280 }
const NARROW_PADDING = { left: 36, right: 108 }

describe('heroZoomViewportAdjust', () => {
  it('is zero at the reference desktop width', () => {
    expect(heroZoomViewportAdjust(1440, DESKTOP_PADDING)).toBeCloseTo(0, 5)
  })

  it('never zooms in past the tuned baseline on wider screens', () => {
    expect(heroZoomViewportAdjust(1920, DESKTOP_PADDING)).toBe(0)
    expect(heroZoomViewportAdjust(2560, DESKTOP_PADDING)).toBe(0)
  })

  it('zooms out for narrower phone viewports', () => {
    const se = heroZoomViewportAdjust(375, NARROW_PADDING)
    const tablet = heroZoomViewportAdjust(768, NARROW_PADDING)
    expect(se).toBeLessThan(0)
    expect(tablet).toBeLessThan(0)
    // A smaller phone should zoom out at least as much as a tablet.
    expect(se).toBeLessThanOrEqual(tablet)
  })

  it('clamps the adjustment so very small viewports do not zoom out indefinitely', () => {
    const adjust = heroZoomViewportAdjust(200, NARROW_PADDING)
    expect(adjust).toBeGreaterThanOrEqual(-1.1)
  })

  it('handles padding that consumes the whole viewport without throwing', () => {
    expect(() => heroZoomViewportAdjust(50, NARROW_PADDING)).not.toThrow()
    expect(Number.isFinite(heroZoomViewportAdjust(50, NARROW_PADDING))).toBe(
      true,
    )
  })
})
