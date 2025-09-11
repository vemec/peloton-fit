/**
 * Core utility functions for bike fit analysis
 * Consolidated from multiple files to eliminate duplication
 */

import type { Keypoint } from '@/types/bikefit'
import { VALIDATION_THRESHOLDS } from './constants'

/**
 * Calculate angle between three points in degrees
 * @param pointA First point
 * @param pointB Vertex point (angle is calculated at this point)
 * @param pointC Third point
 * @returns Angle in degrees (0-180) with 1 decimal precision
 */
export function calculateAngleBetweenPoints(
  pointA: Keypoint,
  pointB: Keypoint,
  pointC: Keypoint,
  options: { decimals?: number; signed?: boolean } = {}
): number {
  const { decimals = 2, signed = false } = options

  // Vectores BA y BC
  const vBA = { x: pointA.x - pointB.x, y: pointA.y - pointB.y }
  const vBC = { x: pointC.x - pointB.x, y: pointC.y - pointB.y }

  // Magnitudes
  const magBA = Math.hypot(vBA.x, vBA.y)
  const magBC = Math.hypot(vBC.x, vBC.y)

  if (magBA === 0 || magBC === 0) return NaN // mejor que devolver 0: marca ángulo indefinido

  // Producto punto y cruz
  const dot = vBA.x * vBC.x + vBA.y * vBC.y
  const cross = vBA.x * vBC.y - vBA.y * vBC.x

  let angleRad: number

  if (signed) {
    // Signed angle in [-π, π]
    angleRad = Math.atan2(cross, dot)
  } else {
    // Absolute angle in [0, π]
    const cos = dot / (magBA * magBC)
    const clampedCos = Math.min(1, Math.max(-1, cos)) // evita NaN por redondeo
    angleRad = Math.acos(clampedCos)
  }

  const angleDeg = (angleRad * 180) / Math.PI

  // Redondeo configurable
  const factor = Math.pow(10, decimals)
  return Math.round(angleDeg * factor) / factor
}

/**
 * Convert hex color to rgba string
 * @param hex Hex color string (e.g., "#ff0000")
 * @param alpha Alpha value (0-1)
 * @returns RGBA color string
 */
export function hexToRgba(hex: string, alpha: number): string {
  // Validate input
  if (!hex || typeof hex !== 'string' || !hex.startsWith('#')) {
    console.warn('Invalid hex color provided:', hex)
    return `rgba(0, 0, 0, ${alpha})`
  }

  // Handle 3-digit hex colors
  const normalizedHex = hex.length === 4
    ? `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`
    : hex

  const r = parseInt(normalizedHex.slice(1, 3), 16)
  const g = parseInt(normalizedHex.slice(3, 5), 16)
  const b = parseInt(normalizedHex.slice(5, 7), 16)

  // Validate parsed values
  if (isNaN(r) || isNaN(g) || isNaN(b)) {
    console.warn('Invalid hex color format:', hex)
    return `rgba(0, 0, 0, ${alpha})`
  }

  return `rgba(${r}, ${g}, ${b}, ${Math.max(0, Math.min(1, alpha))})`
}

/**
 * Validate if a keypoint has sufficient visibility/confidence
 * @param keypoint The keypoint to validate
 * @param threshold Minimum confidence threshold (0-1)
 * @returns Whether the keypoint is visible enough for analysis
 */
export function isKeypointValid(keypoint: Keypoint, threshold: number = VALIDATION_THRESHOLDS.MIN_KEYPOINT_CONFIDENCE): boolean {
  return (keypoint.score ?? keypoint.visibility ?? 0) >= threshold
}