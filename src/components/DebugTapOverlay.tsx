import { useEffect, useRef, useState } from 'react'

type TapLog = {
  id: number
  kind: string
  targetDesc: string
  hitDesc: string
}

function describeElement(el: Element | null): string {
  if (!el) return '(none)'
  const tag = el.tagName.toLowerCase()
  const cls =
    typeof el.className === 'string' && el.className
      ? `.${el.className.trim().split(/\s+/).join('.')}`
      : ''
  return `${tag}${cls}`
}

/**
 * Temporary on-page diagnostic: shows which element every tap/click actually
 * hits, so a mobile bug report can be screenshotted without remote devtools.
 * Only mounts behind ?debug=1 — remove once the peak-card tap bug is found.
 */
export function DebugTapOverlay() {
  const [logs, setLogs] = useState<TapLog[]>([])
  const counter = useRef(0)

  useEffect(() => {
    function record(kind: string, x: number, y: number, target: EventTarget | null) {
      const hit = document.elementFromPoint(x, y)
      counter.current += 1
      setLogs((prev) =>
        [
          {
            id: counter.current,
            kind,
            targetDesc: describeElement(target as Element | null),
            hitDesc: describeElement(hit),
          },
          ...prev,
        ].slice(0, 8),
      )
    }

    function onPointerDown(e: PointerEvent) {
      record('pointerdown', e.clientX, e.clientY, e.target)
    }
    function onTouchStart(e: TouchEvent) {
      const t = e.touches[0]
      if (t) record('touchstart', t.clientX, t.clientY, e.target)
    }
    function onClick(e: MouseEvent) {
      record('click', e.clientX, e.clientY, e.target)
    }

    document.addEventListener('pointerdown', onPointerDown, true)
    document.addEventListener('touchstart', onTouchStart, true)
    document.addEventListener('click', onClick, true)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true)
      document.removeEventListener('touchstart', onTouchStart, true)
      document.removeEventListener('click', onClick, true)
    }
  }, [])

  return (
    <div
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 999999,
        maxHeight: '38vh',
        overflowY: 'auto',
        background: 'rgba(0, 0, 0, 0.88)',
        color: '#7CFC9A',
        font: '10px/1.4 ui-monospace, monospace',
        padding: '6px 8px',
        pointerEvents: 'none',
      }}
    >
      <div style={{ color: '#fff', marginBottom: 4 }}>
        tap debug — target = event.target, hit = elementFromPoint
      </div>
      {logs.length === 0 && <div>(waiting for a tap…)</div>}
      {logs.map((log) => (
        <div key={log.id}>
          [{log.kind}] target={log.targetDesc} hit={log.hitDesc}
        </div>
      ))}
    </div>
  )
}
