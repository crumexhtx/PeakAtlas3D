import { Link } from 'react-router-dom'
import { permitHref } from '../data/permits'
import {
  formatPermitDate,
  nextWindow,
} from '../lib/permitsCalendar'
import type { PermitSystem } from '../types/permit'

type PermitCardProps = {
  system: PermitSystem
}

export function PermitCard({ system }: PermitCardProps) {
  const next = nextWindow(system)
  return (
    <div className="permit-card">
      <p className="permit-card-kicker">Permits</p>
      <p className="permit-card-name">
        <Link to={permitHref(system.id)}>{system.name}</Link>
      </p>
      {next ? (
        <p className="permit-card-window">
          Next: {next.label} — {formatPermitDate(next.opens)}
          {next.opens !== next.closes ? `–${formatPermitDate(next.closes)}` : ''}
          {next.approximate ? ' (approx.)' : ''}
        </p>
      ) : (
        <p className="permit-card-window">No upcoming dated window on file.</p>
      )}
      <p className="permit-card-link">
        <Link to={permitHref(system.id)}>Permit details</Link>
      </p>
    </div>
  )
}
