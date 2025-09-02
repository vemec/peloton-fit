export type Keypoint = {
  x: number
  y: number
  score?: number
  name: string
}

export function calculateAngleBetweenPoints(a: Keypoint, b: Keypoint, c: Keypoint) {
  // angle at point b between a->b and c->b in degrees
  const abx = a.x - b.x
  const aby = a.y - b.y
  const cbx = c.x - b.x
  const cby = c.y - b.y

  const dot = abx * cbx + aby * cby
  const magAB = Math.hypot(abx, aby)
  const magCB = Math.hypot(cbx, cby)
  if (magAB === 0 || magCB === 0) return 0
  let cos = dot / (magAB * magCB)
  cos = Math.max(-1, Math.min(1, cos))
  const angleRad = Math.acos(cos)
  const angleDegrees = (angleRad * 180) / Math.PI
  return Math.round(angleDegrees * 10) / 10 // Return with 1 decimal place
}
