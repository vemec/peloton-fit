import type { Keypoint, VisualSettings } from '@/types/bikefit'
import {
  isKeypointVisible,
  normalizedToCanvas
} from './utils'
import {
  DRAWING_CONFIG,
  POSE_CONNECTIONS,
  RELEVANT_KEYPOINTS,
  SIDE_CONNECTIONS,
  type PoseConnection
} from './constants'

/**
 * Draws a single keypoint with optimized styling
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
  const { pointRadius, pointColor } = settings
  const { OUTLINE_COLOR, OUTLINE_WIDTH } = DRAWING_CONFIG

  // Use a single path for better performance
  ctx.beginPath()
  ctx.arc(x, y, pointRadius, 0, 2 * Math.PI)

  // Fill the main point
  ctx.fillStyle = pointColor
  ctx.fill()

  // Add outline for better visibility
  ctx.strokeStyle = OUTLINE_COLOR
  ctx.lineWidth = OUTLINE_WIDTH
  ctx.stroke()
}

/**
 * Validates connection keypoints before drawing
 */
function validateConnectionKeypoints(
  keypoint1: Keypoint | undefined,
  keypoint2: Keypoint | undefined,
  threshold: number
): boolean {
  return !!(
    keypoint1 &&
    keypoint2 &&
    isKeypointVisible(keypoint1, threshold) &&
    isKeypointVisible(keypoint2, threshold)
  )
}

/**
 * Draws a connection line between two keypoints with validation
 */
export function drawConnection(
  ctx: CanvasRenderingContext2D,
  keypoint1: Keypoint,
  keypoint2: Keypoint,
  settings: VisualSettings,
  canvasWidth: number,
  canvasHeight: number
): void {
  if (!validateConnectionKeypoints(keypoint1, keypoint2, DRAWING_CONFIG.MIN_VISIBILITY_THRESHOLD)) {
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
 * Draws multiple connections efficiently using batch processing
 */
function drawConnections(
  ctx: CanvasRenderingContext2D,
  keypoints: Keypoint[],
  connections: readonly PoseConnection[],
  settings: VisualSettings,
  canvasWidth: number,
  canvasHeight: number
): void {
  // Set drawing style once for all connections
  ctx.strokeStyle = settings.lineColor
  ctx.lineWidth = settings.lineWidth

  ctx.beginPath()

  connections.forEach(([startIdx, endIdx]) => {
    const startPoint = keypoints[startIdx]
    const endPoint = keypoints[endIdx]

    if (validateConnectionKeypoints(startPoint, endPoint, DRAWING_CONFIG.MIN_VISIBILITY_THRESHOLD)) {
      const point1 = normalizedToCanvas(startPoint, canvasWidth, canvasHeight)
      const point2 = normalizedToCanvas(endPoint, canvasWidth, canvasHeight)

      ctx.moveTo(point1.x, point1.y)
      ctx.lineTo(point2.x, point2.y)
    }
  })

  ctx.stroke()
}

/**
 * Draws multiple keypoints efficiently using batch processing
 */
function drawKeypoints(
  ctx: CanvasRenderingContext2D,
  keypoints: Keypoint[],
  keypointIndices: readonly number[],
  settings: VisualSettings,
  canvasWidth: number,
  canvasHeight: number
): void {
  const { pointColor } = settings
  const { OUTLINE_COLOR, OUTLINE_WIDTH, MIN_VISIBILITY_THRESHOLD } = DRAWING_CONFIG

  // Batch draw all keypoints for better performance
  keypointIndices.forEach(idx => {
    const keypoint = keypoints[idx]
    if (keypoint && isKeypointVisible(keypoint, MIN_VISIBILITY_THRESHOLD)) {
      const { x, y } = normalizedToCanvas(keypoint, canvasWidth, canvasHeight)

      // Draw main point
      ctx.beginPath()
      ctx.arc(x, y, settings.pointRadius, 0, 2 * Math.PI)
      ctx.fillStyle = pointColor
      ctx.fill()

      // Draw outline
      ctx.strokeStyle = OUTLINE_COLOR
      ctx.lineWidth = OUTLINE_WIDTH
      ctx.stroke()
    }
  })
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
  drawConnections(ctx, keypoints, POSE_CONNECTIONS, settings, canvasWidth, canvasHeight)

  // Draw relevant keypoints for bike fit analysis
  drawKeypoints(ctx, keypoints, RELEVANT_KEYPOINTS.ALL, settings, canvasWidth, canvasHeight)
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
  drawConnections(ctx, keypoints, connections, settings, canvasWidth, canvasHeight)

  // Draw keypoints for the detected side only
  drawKeypoints(ctx, keypoints, sideKeypoints, settings, canvasWidth, canvasHeight)
}
