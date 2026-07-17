import { useTexture } from '@react-three/drei'
import { EARTH_RADIUS } from '../lib/geo'

export function Earth() {
  const [dayMap, normalMap, specularMap] = useTexture([
    '/textures/earth_day.jpg',
    '/textures/earth_normal.jpg',
    '/textures/earth_specular.jpg',
  ])

  return (
    <mesh receiveShadow>
      <sphereGeometry args={[EARTH_RADIUS, 64, 64]} />
      <meshPhongMaterial
        map={dayMap}
        normalMap={normalMap}
        specularMap={specularMap}
        specular={0x333322}
        shininess={12}
        bumpScale={0.05}
      />
    </mesh>
  )
}
