import { describe, expect, it, vi } from 'vitest'
import { declutterPeakMarkers } from './markerDeclutter'

type FakePeak = {
  id: string
  lat: number
  lon: number
  elevationFt: number
  name: string
  screenX: number
  screenY: number
}

function fakeMap(peaks: FakePeak[], width = 800, height = 600) {
  const byId = new Map(peaks.map((p) => [p.id, p]))
  return {
    getContainer: () => ({ clientWidth: width, clientHeight: height }),
    getCenter: () => ({ lat: 35, lng: -80 }),
    project: ([lon, lat]: [number, number]) => {
      const hit = peaks.find((p) => p.lon === lon && p.lat === lat)
      if (!hit) return { x: Number.NaN, y: Number.NaN }
      return { x: hit.screenX, y: hit.screenY }
    },
    // stickyFront → isOnFrontHemisphere uses getCenter; keep all "front"
    // by placing center near the east coast and peaks on that hemisphere.
    __byId: byId,
  } as unknown as Parameters<typeof declutterPeakMarkers>[0]
}

// Spy hemisphere check so the unit test isolates viewport packing.
vi.mock('./globeVisibility', () => ({
  isOnFrontHemisphere: () => true,
}))

describe('declutterPeakMarkers', () => {
  it('shows east-coast peaks when western giants are off-screen', () => {
    const peaks: FakePeak[] = [
      // Off-screen west — would previously consume the entire flag cap.
      ...Array.from({ length: 30 }, (_, i) => ({
        id: `west-${i}`,
        name: `West Peak ${i}`,
        lat: 40,
        lon: -120 - i * 0.01,
        elevationFt: 14000 - i,
        screenX: -400 - i * 40,
        screenY: 300,
      })),
      // On-screen east coast.
      {
        id: 'mitchell',
        name: 'Mt. Mitchell',
        lat: 35.76,
        lon: -82.27,
        elevationFt: 6684,
        screenX: 420,
        screenY: 280,
      },
      {
        id: 'washington',
        name: 'Mt. Washington',
        lat: 44.27,
        lon: -71.3,
        elevationFt: 6288,
        screenX: 520,
        screenY: 180,
      },
    ]

    const layout = declutterPeakMarkers(fakeMap(peaks), peaks)

    expect(layout.get('mitchell')?.show).toBe(true)
    expect(layout.get('washington')?.show).toBe(true)
    expect(layout.get('west-0')?.show).toBe(false)
  })

  it('still caps dense on-screen peaks', () => {
    const peaks: FakePeak[] = Array.from({ length: 40 }, (_, i) => ({
      id: `p-${i}`,
      name: `Peak ${String(i).padStart(2, '0')}`,
      lat: 39,
      lon: -105 - i * 0.05,
      elevationFt: 14000 - i,
      screenX: 100 + (i % 8) * 80,
      screenY: 100 + Math.floor(i / 8) * 90,
    }))

    const layout = declutterPeakMarkers(fakeMap(peaks), peaks)
    const shown = [...layout.values()].filter((v) => v.show).length
    expect(shown).toBeLessThanOrEqual(28)
    expect(shown).toBeGreaterThan(0)
    // Highest still wins among on-screen candidates.
    expect(layout.get('p-0')?.show).toBe(true)
  })
})
