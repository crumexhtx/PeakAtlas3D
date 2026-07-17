import { Html } from '@react-three/drei'
import { useMemo } from 'react'
import type { Peak } from '../types/peak'
import { EARTH_RADIUS, latLonToVector3 } from '../lib/geo'

type PeakMarkersProps = {
  peaks: Peak[]
  selectedId: string | null
  showPeaks: boolean
  showTowns: boolean
  showTrails: boolean
  onSelect: (peak: Peak) => void
}

function PeakPin({
  peak,
  selected,
  onSelect,
}: {
  peak: Peak
  selected: boolean
  onSelect: (peak: Peak) => void
}) {
  const position = useMemo(
    () => latLonToVector3(peak.lat, peak.lon, EARTH_RADIUS * 1.015),
    [peak.lat, peak.lon],
  )

  return (
    <group position={position}>
      <mesh
        onClick={(e) => {
          e.stopPropagation()
          onSelect(peak)
        }}
        onPointerOver={(e) => {
          e.stopPropagation()
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto'
        }}
      >
        <sphereGeometry args={[selected ? 0.038 : 0.028, 16, 16]} />
        <meshStandardMaterial
          color={selected ? '#f0c14b' : '#d4a017'}
          emissive={selected ? '#c9a227' : '#5c4010'}
          emissiveIntensity={selected ? 0.85 : 0.35}
          metalness={0.4}
          roughness={0.35}
        />
      </mesh>
      {selected && (
        <Html distanceFactor={6} center style={{ pointerEvents: 'none' }}>
          <div className="peak-label">{peak.name}</div>
        </Html>
      )}
    </group>
  )
}

function TownPin({ peak }: { peak: Peak }) {
  const { nearestTown } = peak
  const position = useMemo(
    () =>
      latLonToVector3(nearestTown.lat, nearestTown.lon, EARTH_RADIUS * 1.012),
    [nearestTown.lat, nearestTown.lon],
  )

  return (
    <mesh position={position}>
      <boxGeometry args={[0.018, 0.018, 0.018]} />
      <meshStandardMaterial
        color="#8fb8a8"
        emissive="#2a4a40"
        emissiveIntensity={0.4}
        metalness={0.2}
        roughness={0.5}
      />
    </mesh>
  )
}

function TrailMarker({ peak }: { peak: Peak }) {
  const position = useMemo(
    () => latLonToVector3(peak.lat, peak.lon, EARTH_RADIUS * 1.028),
    [peak.lat, peak.lon],
  )

  if (!peak.trails?.length) return null

  return (
    <mesh position={position}>
      <octahedronGeometry args={[0.016, 0]} />
      <meshStandardMaterial
        color="#7ec8a3"
        emissive="#1f4d3a"
        emissiveIntensity={0.45}
        metalness={0.3}
        roughness={0.4}
      />
    </mesh>
  )
}

export function PeakMarkers({
  peaks,
  selectedId,
  showPeaks,
  showTowns,
  showTrails,
  onSelect,
}: PeakMarkersProps) {
  return (
    <group>
      {showPeaks &&
        peaks.map((peak) => (
          <PeakPin
            key={peak.id}
            peak={peak}
            selected={peak.id === selectedId}
            onSelect={onSelect}
          />
        ))}
      {showTowns &&
        peaks.map((peak) => <TownPin key={`town-${peak.id}`} peak={peak} />)}
      {showTrails &&
        peaks.map((peak) => (
          <TrailMarker key={`trail-${peak.id}`} peak={peak} />
        ))}
    </group>
  )
}
