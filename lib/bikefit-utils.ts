import type { Keypoint } from '../types/bikefit'

/**
 * Calculate angle between three points in degrees
 * @param pointA First point
 * @param pointB Vertex point (angle is calculated at this point)
 * @param pointC Third point
 * @returns Angle in degrees (0-180)
 */
export function calculateAngleBetweenPoints(
  pointA: Keypoint,
  pointB: Keypoint,
  pointC: Keypoint
): number {
  const vectorBA = { x: pointA.x - pointB.x, y: pointA.y - pointB.y }
  const vectorBC = { x: pointC.x - pointB.x, y: pointC.y - pointB.y }

  const dotProduct = vectorBA.x * vectorBC.x + vectorBA.y * vectorBC.y
  const magnitudeBA = Math.sqrt(vectorBA.x ** 2 + vectorBA.y ** 2)
  const magnitudeBC = Math.sqrt(vectorBC.x ** 2 + vectorBC.y ** 2)

  if (magnitudeBA === 0 || magnitudeBC === 0) return 0

  const cosAngle = dotProduct / (magnitudeBA * magnitudeBC)
  const clampedCosAngle = Math.max(-1, Math.min(1, cosAngle))
  const angleRadians = Math.acos(clampedCosAngle)
  const angleDegrees = (angleRadians * 180) / Math.PI

  return angleDegrees
}

/**
 * Convert hex color to rgba string
 * @param hex Hex color string (e.g., "#ff0000")
 * @param alpha Alpha value (0-1)
 * @returns RGBA color string
 */
export function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
