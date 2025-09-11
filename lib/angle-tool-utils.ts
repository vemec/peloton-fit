/**
 * Utility functions for AngleTool functionality
 * Extracted and optimized for reusability
 */

import uuid4 from 'uuid4'
import type { AnglePoint } from '@/types/angle-tool'

/**
 * Snaps a point to a radial grid centered on a vertex
 * @param x Target x coordinate
 * @param y Target y coordinate
 * @param vertex Center point for the grid
 * @param gridStep Step size in degrees for snapping
 * @param isEnabled Whether grid snapping is enabled
 * @returns Snapped coordinates
 */
export function snapToRadialGrid(
  x: number,
  y: number,
  vertex: AnglePoint,
  gridStep: number,
  isEnabled: boolean
): { x: number; y: number } {
  if (!isEnabled) return { x, y }

  const dx = x - vertex.x
  const dy = y - vertex.y
  const angle = Math.atan2(dy, dx) * (180 / Math.PI)
  const snappedAngle = Math.round(angle / gridStep) * gridStep
  const radian = (snappedAngle * Math.PI) / 180
  const distance = Math.sqrt(dx ** 2 + dy ** 2)

  return {
    x: vertex.x + Math.cos(radian) * distance,
    y: vertex.y + Math.sin(radian) * distance,
  }
}

/**
 * Calculate distance between two points
 * @param point1 First point
 * @param point2 Second point
 * @returns Distance in pixels
 */
export function calculateDistance(
  point1: { x: number; y: number },
  point2: { x: number; y: number }
): number {
  return Math.sqrt((point1.x - point2.x) ** 2 + (point1.y - point2.y) ** 2)
}

/**
 * Check if a point is within a circular area
 * @param point Point to check
 * @param center Center of the circle
 * @param radius Radius of the circle
 * @param tolerance Additional tolerance for interaction
 * @returns Whether the point is within the area
 */
export function isPointInCircle(
  point: { x: number; y: number },
  center: { x: number; y: number },
  radius: number,
  tolerance = 0
): boolean {
  const distance = calculateDistance(point, center)
  return distance <= radius + tolerance
}

/**
 * Check if a point is near a circular arc
 * @param point Point to check
 * @param center Center of the arc
 * @param radius Radius of the arc
 * @param tolerance Tolerance for interaction
 * @returns Whether the point is near the arc
 */
export function isPointNearArc(
  point: { x: number; y: number },
  center: { x: number; y: number },
  radius: number,
  tolerance = 15
): boolean {
  const distance = calculateDistance(point, center)
  return distance >= radius - tolerance && distance <= radius + tolerance
}

/**
 * Check if a point is within the arc area (including inside the arc)
 * This provides a larger detection area for better UX when dragging angles
 * @param point Point to check
 * @param center Center of the arc
 * @param radius Radius of the arc
 * @param tolerance Additional tolerance for interaction
 * @returns Whether the point is within the arc area
 */
export function isPointInArcArea(
  point: { x: number; y: number },
  center: { x: number; y: number },
  radius: number,
  tolerance = 25
): boolean {
  const distance = calculateDistance(point, center)
  // Allow detection from center to radius + tolerance for easier arc dragging
  return distance <= radius + tolerance && distance >= Math.max(radius - tolerance, 0)
}

/**
 * Generate a unique ID for angle tool elements
 * @returns Unique ID string using UUID v4
 */
export function generateUniqueId(): string {
  return uuid4()
}
