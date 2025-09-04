import type { Keypoint, VisualSettings } from '@/types/bikefit'
import {
  isKeypointVisible,
  normalizedToCanvas
} from './utils'
import {
  DRAWING_CONFIG,
  POSE_CONNECTIONS,
  RELEVANT_KEYPOINTS,
  SIDE_CONNECTIONS
} from './constants'

/**
 * Draws a single keypoint with proper styling
 */
export function drawKeypoint(
  ctx: CanvasRenderingContext2D,
  keypoint: Keypoint,
  settings: VisualSettings,
  canvasWidth: number,
  canvasHeight: number
): void {
  if (!isKeypointVisible(keypoint, DRAWING_CONFIG.MIN_VISIBILITY_THRESHOLD)) {
    return
  }

  const { x, y } = normalizedToCanvas(keypoint, canvasWidth, canvasHeight)

  // Draw main point
  ctx.beginPath()
  ctx.arc(x, y, settings.pointRadius, 0, 2 * Math.PI)
  ctx.fillStyle = settings.pointColor
  ctx.fill()

  // Add outline for better visibility
  ctx.beginPath()
  ctx.arc(x, y, settings.pointRadius, 0, 2 * Math.PI)
  ctx.strokeStyle = DRAWING_CONFIG.OUTLINE_COLOR
  ctx.lineWidth = DRAWING_CONFIG.OUTLINE_WIDTH
  ctx.stroke()
}

/**
 * Draws a connection line between two keypoints
 */
export function drawConnection(
  ctx: CanvasRenderingContext2D,
  keypoint1: Keypoint,
  keypoint2: Keypoint,
  settings: VisualSettings,
  canvasWidth: number,
  canvasHeight: number
): void {
  const threshold = DRAWING_CONFIG.MIN_VISIBILITY_THRESHOLD

  if (!isKeypointVisible(keypoint1, threshold) || !isKeypointVisible(keypoint2, threshold)) {
    return
  }

  const point1 = normalizedToCanvas(keypoint1, canvasWidth, canvasHeight)
  const point2 = normalizedToCanvas(keypoint2, canvasWidth, canvasHeight)

  ctx.beginPath()
  ctx.moveTo(point1.x, point1.y)
  ctx.lineTo(point2.x, point2.y)
  ctx.strokeStyle = settings.lineColor
  ctx.lineWidth = settings.lineWidth
  ctx.stroke()
}

/**
 * Draws the complete skeleton for pose visualization
 */
export function drawSkeleton(
  ctx: CanvasRenderingContext2D,
  keypoints: Keypoint[],
  settings: VisualSettings,
  canvasWidth: number,
  canvasHeight: number
): void {
  // Draw connections first (so they appear behind points)
  POSE_CONNECTIONS.forEach(([startIdx, endIdx]) => {
    const startPoint = keypoints[startIdx]
    const endPoint = keypoints[endIdx]

    if (startPoint && endPoint) {
      drawConnection(ctx, startPoint, endPoint, settings, canvasWidth, canvasHeight)
    }
  })

  // Draw relevant keypoints for bike fit analysis
  RELEVANT_KEYPOINTS.ALL.forEach(idx => {
    const keypoint = keypoints[idx]
    if (keypoint) {
      drawKeypoint(ctx, keypoint, settings, canvasWidth, canvasHeight)
    }
  })
}

/**
 * Draws skeleton for only the detected side (cleaner visualization)
 */
export function drawDetectedSideSkeleton(
  ctx: CanvasRenderingContext2D,
  keypoints: Keypoint[],
  detectedSide: 'left' | 'right',
  settings: VisualSettings,
  canvasWidth: number,
  canvasHeight: number
): void {
  const connections = SIDE_CONNECTIONS[detectedSide]
  const sideKeypoints = RELEVANT_KEYPOINTS[detectedSide.toUpperCase() as 'LEFT' | 'RIGHT']

  // Draw connections for the detected side only
  connections.forEach(([startIdx, endIdx]) => {
    const startPoint = keypoints[startIdx]
    const endPoint = keypoints[endIdx]

    if (startPoint && endPoint) {
      drawConnection(ctx, startPoint, endPoint, settings, canvasWidth, canvasHeight)
    }
  })

  // Draw keypoints for the detected side only
  sideKeypoints.forEach(idx => {
    const keypoint = keypoints[idx]
    if (keypoint) {
      drawKeypoint(ctx, keypoint, settings, canvasWidth, canvasHeight)
    }
  })
}
