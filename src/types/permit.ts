export type PermitType =
  | 'lottery'
  | 'advance-reservation'
  | 'registration'
  | 'fee-only'
  | 'guide-required'

export type PermitStatusFlag = 'verified' | 'unverified'

export type PermitWindow = {
  label: string
  opens: string
  closes: string
  approximate: boolean
}

export type PermitSystem = {
  id: string
  name: string
  peakIds: string[]
  agency: string
  type: PermitType
  bookingUrl: string
  sourceUrl: string
  verifiedOn: string
  season: string
  windows: PermitWindow[]
  summary: string
  feesNote?: string
  status: PermitStatusFlag
}
