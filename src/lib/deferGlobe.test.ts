import { afterEach, describe, expect, it, vi } from 'vitest'
import { isConstrainedGlobeDevice, scheduleGlobeInit } from './deferGlobe'

function matchMedia(narrow: boolean, coarse = false) {
  return (query: string) =>
    ({
      matches: query.includes('max-width: 800px')
        ? narrow
        : query.includes('pointer: coarse')
          ? coarse
          : false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList
}

function stubBrowser(narrow: boolean, coarse = false) {
  const listeners = new Map<string, Set<EventListener>>()
  const win = {
    matchMedia: matchMedia(narrow, coarse),
    addEventListener(type: string, fn: EventListener) {
      if (!listeners.has(type)) listeners.set(type, new Set())
      listeners.get(type)!.add(fn)
    },
    removeEventListener(type: string, fn: EventListener) {
      listeners.get(type)?.delete(fn)
    },
    dispatchEvent(event: Event) {
      listeners.get(event.type)?.forEach((fn) => fn(event))
      return true
    },
    requestIdleCallback: (cb: IdleRequestCallback) => {
      cb({ didTimeout: false, timeRemaining: () => 12 } as IdleDeadline)
      return 1
    },
    cancelIdleCallback: () => {},
    setTimeout,
    clearTimeout,
  }
  vi.stubGlobal('window', win)
  vi.stubGlobal('document', {
    readyState: 'complete',
  })
  vi.stubGlobal(
    'requestAnimationFrame',
    (cb: FrameRequestCallback) =>
      setTimeout(() => cb(Date.now()), 0) as unknown as number,
  )
  vi.stubGlobal('cancelAnimationFrame', (id: number) => clearTimeout(id))
  return win
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('isConstrainedGlobeDevice', () => {
  it('is true on a narrow viewport', () => {
    stubBrowser(true)
    expect(isConstrainedGlobeDevice()).toBe(true)
  })

  it('is false on a wide desktop', () => {
    stubBrowser(false, false)
    expect(isConstrainedGlobeDevice()).toBe(false)
  })
})

describe('scheduleGlobeInit', () => {
  it('runs after two animation frames plus idle on desktop', async () => {
    stubBrowser(false, false)
    const start = vi.fn()
    const cancel = scheduleGlobeInit(start)
    expect(start).not.toHaveBeenCalled()
    await new Promise((resolve) => setTimeout(resolve, 20))
    expect(start).toHaveBeenCalledTimes(1)
    cancel()
  })

  it('starts on first user input without waiting for idle', () => {
    const win = stubBrowser(true)
    const start = vi.fn()
    const cancel = scheduleGlobeInit(start)
    win.dispatchEvent({ type: 'pointerdown' } as Event)
    expect(start).toHaveBeenCalledTimes(1)
    win.dispatchEvent({ type: 'keydown' } as Event)
    expect(start).toHaveBeenCalledTimes(1)
    cancel()
  })

  it('does not auto-start immediately on a constrained viewport', async () => {
    stubBrowser(true)
    const start = vi.fn()
    const cancel = scheduleGlobeInit(start)
    await new Promise((resolve) => setTimeout(resolve, 20))
    expect(start).not.toHaveBeenCalled()
    cancel()
  })
})
