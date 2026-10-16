import { describe, expect, it, vi } from 'vitest'
import {
  clearCameraPadding,
  heroZoomViewportAdjust,
  idleSpinDelayMs,
  peakFramePaddingFromRects,
  PEAK_FRAME_PAD_NARROW,
  worldFramePadding,
} from './mapAnimations'

const DESKTOP_PADDING = { left: 320, right: 360 }
const NARROW_PADDING = { left: 24, right: 96 }

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

describe('idleSpinDelayMs', () => {
  it('waits longer on a phone-sized viewport', () => {
    vi.stubGlobal('window', {
      matchMedia: (query: string) => ({
        matches: query.includes('max-width: 900px'),
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }),
    })
    expect(idleSpinDelayMs()).toBe(12_000)
    vi.unstubAllGlobals()
  })
})

describe('peakFramePaddingFromRects', () => {
  it('grows padding to clear the left stack, name card, and trip tab', () => {
    const canvas = { top: 0, left: 0, right: 375, bottom: 812 }
    const pad = peakFramePaddingFromRects(canvas, {
      leftStack: { top: 10, left: 10, right: 54, bottom: 180 },
      nameCard: { top: 8, left: 200, right: 365, bottom: 72 },
      bottomSheet: { top: 720, left: 8, right: 367, bottom: 804 },
    })
    expect(pad.left).toBeGreaterThanOrEqual(54 + 8)
    expect(pad.top).toBeGreaterThanOrEqual(180 + 8)
    expect(pad.right).toBeGreaterThanOrEqual(375 - 200 + 8)
    expect(pad.bottom).toBeGreaterThanOrEqual(812 - 720 + 8)
  })

  it('keeps the narrow fallback when chrome rects are missing', () => {
    const canvas = { top: 0, left: 0, right: 375, bottom: 812 }
    expect(peakFramePaddingFromRects(canvas, {})).toEqual(PEAK_FRAME_PAD_NARROW)
  })
})

describe('clearCameraPadding', () => {
  it('re-centers so the padded open-map center stays on the same pixel', () => {
    const jumpTo = vi.fn()
    const unproject = vi.fn(([x, y]: [number, number]) => ({ lng: x, lat: y }))
    const map = {
      getCanvas: () => ({ clientWidth: 1000, clientHeight: 800 }),
      getPadding: () => ({ top: 100, bottom: 96, left: 80, right: 200 }),
      getZoom: () => 12,
      getBearing: () => 40,
      getPitch: () => 55,
      unproject,
      jumpTo,
    }
    clearCameraPadding(map as never)
    expect(unproject).toHaveBeenCalled()
    expect(jumpTo).toHaveBeenCalledWith(
      expect.objectContaining({
        padding: worldFramePadding(),
        zoom: 12,
        bearing: 40,
        pitch: 55,
      }),
    )
    const centerArg = jumpTo.mock.calls[0][0].center
    expect(centerArg).toEqual({ lng: 560, lat: 398 })
  })
})
