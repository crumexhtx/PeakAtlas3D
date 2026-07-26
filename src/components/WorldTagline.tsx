type WorldTaglineProps = {
  visible: boolean
}

/** Soft always-on landing line so the site purpose stays clear after the hint. */
export function WorldTagline({ visible }: WorldTaglineProps) {
  if (!visible) return null

  return (
    <p className="world-tagline" role="doc-subtitle">
      Research any peak — then explore it in 3D
    </p>
  )
}
