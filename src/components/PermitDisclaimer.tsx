import { PERMIT_DISCLAIMER } from '../lib/permitsCalendar'

export function PermitDisclaimer() {
  return (
    <p className="permit-disclaimer" role="note">
      {PERMIT_DISCLAIMER}
    </p>
  )
}
