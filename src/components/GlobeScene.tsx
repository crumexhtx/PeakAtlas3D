import { Canvas } from '@react-three/fiber'
import { CameraControls, Stars } from '@react-three/drei'
import { Suspense, useEffect, useRef } from 'react'
import type { Peak, FilterState } from '../types/peak'
import {
  DEFAULT_CAMERA_POSITION,
  FLY_TO_DISTANCE,
  MAX_CAMERA_DISTANCE,
  MIN_CAMERA_DISTANCE,
} from '../lib/constants'
import { cameraFocusForPeak } from '../lib/geo'
import { Earth } from './Earth'
import { PeakMarkers } from './PeakMarkers'

export type CameraCommand =
  | { type: 'flyTo'; peak: Peak; nonce: number }
  | { type: 'reset'; nonce: number }
  | { type: 'zoom'; direction: 1 | -1; nonce: number }
  | null

type GlobeSceneProps = {
  peaks: Peak[]
  selectedId: string | null
  filters: FilterState
  cameraCommand: CameraCommand
  onSelect: (peak: Peak) => void
}

function SceneContent({
  peaks,
  selectedId,
  filters,
  cameraCommand,
  onSelect,
}: GlobeSceneProps) {
  const controlsRef = useRef<CameraControls | null>(null)

  useEffect(() => {
    const controls = controlsRef.current
    if (!controls || !cameraCommand) return

    if (cameraCommand.type === 'flyTo') {
      const { position, target } = cameraFocusForPeak(
        cameraCommand.peak.lat,
        cameraCommand.peak.lon,
        FLY_TO_DISTANCE,
      )
      void controls.setLookAt(
        position[0],
        position[1],
        position[2],
        target[0],
        target[1],
        target[2],
        true,
      )
      return
    }

    if (cameraCommand.type === 'reset') {
      void controls.setLookAt(
        DEFAULT_CAMERA_POSITION[0],
        DEFAULT_CAMERA_POSITION[1],
        DEFAULT_CAMERA_POSITION[2],
        0,
        0,
        0,
        true,
      )
      return
    }

    if (cameraCommand.type === 'zoom') {
      void controls.dolly(cameraCommand.direction * 0.45, true)
    }
  }, [cameraCommand])

  return (
    <>
      <color attach="background" args={['#0b1218']} />
      <ambientLight intensity={0.45} color="#fff4e0" />
      <directionalLight
        position={[5, 3, 5]}
        intensity={1.35}
        color="#fff2d6"
        castShadow
      />
      <directionalLight
        position={[-4, -2, -3]}
        intensity={0.25}
        color="#a8c4d8"
      />
      <Stars
        radius={80}
        depth={40}
        count={2500}
        factor={3}
        saturation={0}
        fade
        speed={0.4}
      />
      <Earth />
      <PeakMarkers
        peaks={peaks}
        selectedId={selectedId}
        showPeaks={filters.peaks}
        showTowns={filters.towns}
        showTrails={filters.trails}
        onSelect={onSelect}
      />
      <CameraControls
        ref={controlsRef}
        makeDefault
        minDistance={MIN_CAMERA_DISTANCE}
        maxDistance={MAX_CAMERA_DISTANCE}
        dampingFactor={0.12}
        smoothTime={0.6}
        polarRotateSpeed={0.7}
        azimuthRotateSpeed={0.7}
      />
    </>
  )
}

export function GlobeScene(props: GlobeSceneProps) {
  return (
    <Canvas
      className="globe-canvas"
      camera={{ position: DEFAULT_CAMERA_POSITION, fov: 42, near: 0.1, far: 200 }}
      gl={{ antialias: true, alpha: false }}
      dpr={[1, 1.75]}
    >
      <Suspense fallback={null}>
        <SceneContent {...props} />
      </Suspense>
    </Canvas>
  )
}
