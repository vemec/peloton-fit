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

  return Math.round(angleDegrees * 10) / 10 // Return with 1 decimal place
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

/**
 * Calculate the distance between two keypoints
 * @param pointA First point
 * @param pointB Second point
 * @returns Euclidean distance
 */
export function calculateDistance(pointA: Keypoint, pointB: Keypoint): number {
  const dx = pointA.x - pointB.x
  const dy = pointA.y - pointB.y
  return Math.sqrt(dx * dx + dy * dy)
}

/**
 * Normalize an angle to be within 0-360 degrees
 * @param angle Angle in degrees
 * @returns Normalized angle (0-360)
 */
export function normalizeAngle(angle: number): number {
  return ((angle % 360) + 360) % 360
}

/**
 * Check if an angle is within an acceptable range
 * @param angle The angle value to check
 * @param target The target angle
 * @param tolerance The acceptable deviation
 * @returns Whether the angle is within tolerance
 */
export function isAngleWithinTolerance(
  angle: number,
  target: number,
  tolerance = VALIDATION_THRESHOLDS.MAX_ANGLE_DEVIATION
): boolean {
  return Math.abs(angle - target) <= tolerance
}

/**
 * Create a proxy keypoint when original detection is insufficient
 * @param referencePoint A reference point to base the proxy on
 * @param direction Direction vector for proxy placement
 * @param distance Distance from reference point
 * @returns A proxy keypoint
 */
export function createKeypointProxy(
  referencePoint: Keypoint,
  direction: { x: number; y: number },
  distance: number
): Keypoint {
  const magnitude = Math.sqrt(direction.x ** 2 + direction.y ** 2)
  const normalizedDirection = magnitude > 0
    ? { x: direction.x / magnitude, y: direction.y / magnitude }
    : { x: 0, y: 0 }

  return {
    x: referencePoint.x + normalizedDirection.x * distance,
    y: referencePoint.y + normalizedDirection.y * distance,
    score: 0.8, // Proxy confidence
    name: `${referencePoint.name}_proxy`
  }
}

/**
 * Filter keypoints by minimum confidence/visibility
 * @param keypoints Array of keypoints to filter
 * @param threshold Minimum confidence threshold
 * @returns Filtered array of valid keypoints
 */
export function filterValidKeypoints(
  keypoints: Keypoint[],
  threshold = VALIDATION_THRESHOLDS.MIN_KEYPOINT_CONFIDENCE
): Keypoint[] {
  return keypoints.filter(kp => isKeypointValid(kp, threshold))
}

/**
 * Smooth keypoint coordinates using simple moving average
 * @param currentKeypoints Current frame keypoints
 * @param previousKeypoints Previous frame keypoints
 * @param smoothingFactor Factor for smoothing (0-1, higher = more smoothing)
 * @returns Smoothed keypoints
 */
export function smoothKeypoints(
  currentKeypoints: Keypoint[],
  previousKeypoints: Keypoint[],
  smoothingFactor = 0.7
): Keypoint[] {
  if (!previousKeypoints.length) return currentKeypoints

  return currentKeypoints.map((current, index) => {
    const previous = previousKeypoints[index]
    if (!previous) return current

    return {
      ...current,
      x: current.x * (1 - smoothingFactor) + previous.x * smoothingFactor,
      y: current.y * (1 - smoothingFactor) + previous.y * smoothingFactor,
    }
  })
}
