import { calculateAngleBetweenPoints } from '@/lib/bikefit-utils'
import type { Keypoint, VisualSettings } from '@/types/bikefit'
import {
  hexToRgba,
  drawRoundedRect,
  normalizeAngleDelta,
  normalizedToCanvas,
  isKeypointVisible
} from './utils'
import { DRAWING_CONFIG } from './constants'

/**
 * Creates a proxy foot point when foot detection is insufficient
 */
function createFootProxy(knee: Keypoint, ankle: Keypoint): Keypoint {
  return {
    x: ankle.x + (ankle.x - knee.x) * 0.5,
    y: ankle.y + (ankle.y - knee.y) * 0.5,
    score: 0.8,
    name: 'foot_proxy'
  }
}

/**
 * Draws an angle marker with visual arc and label
 */
export function drawAngleMarker(
  ctx: CanvasRenderingContext2D,
  pointA: Keypoint,
  pointB: Keypoint, // vertex
  pointC: Keypoint,
  label: string,
  settings: VisualSettings,
  canvasWidth: number,
  canvasHeight: number,
  isFlipped = false
): number | null {
  // Check visibility/confidence of all points
  const threshold = DRAWING_CONFIG.HIGH_VISIBILITY_THRESHOLD

  if (!isKeypointVisible(pointA, threshold) ||
      !isKeypointVisible(pointB, threshold) ||
      !isKeypointVisible(pointC, threshold)) {
    return null
  }

  // Calculate angle using existing utility function
  const angleDeg = calculateAngleBetweenPoints(
    { x: pointA.x, y: pointA.y, score: pointA.score, name: pointA.name || 'a' },
    { x: pointB.x, y: pointB.y, score: pointB.score, name: pointB.name || 'b' },
    { x: pointC.x, y: pointC.y, score: pointC.score, name: pointC.name || 'c' }
  )

  // Convert to canvas coordinates
  const a = normalizedToCanvas(pointA, canvasWidth, canvasHeight)
  const b = normalizedToCanvas(pointB, canvasWidth, canvasHeight)
  const c = normalizedToCanvas(pointC, canvasWidth, canvasHeight)

  // Calculate arc parameters
  const radius = DRAWING_CONFIG.ARC_RADIUS
  const v1x = a.x - b.x
  const v1y = a.y - b.y
  const v2x = c.x - b.x
  const v2y = c.y - b.y

  const startAngle = Math.atan2(v1y, v1x)
  const endAngle = Math.atan2(v2y, v2x)
  const delta = normalizeAngleDelta(endAngle - startAngle)
  const smallEndAngle = startAngle + delta
  const anticlockwise = delta < 0

  // Draw filled sector
  ctx.save()
  ctx.beginPath()
  ctx.moveTo(b.x, b.y)
  ctx.arc(b.x, b.y, radius, startAngle, smallEndAngle, anticlockwise)
  ctx.closePath()
  ctx.fillStyle = hexToRgba(settings.lineColor, DRAWING_CONFIG.SECTOR_ALPHA)
  ctx.fill()
  ctx.restore()

  // Draw arc outline
  ctx.strokeStyle = settings.lineColor
  // Use centralized config for arc stroke width so it's adjustable from constants
  const arcLineWidth = Math.max(
    DRAWING_CONFIG.ARC_LINE_MIN_WIDTH,
    Math.round(settings.lineWidth * DRAWING_CONFIG.ARC_LINE_WIDTH_RATIO)
  )
  ctx.lineWidth = arcLineWidth
  ctx.beginPath()
  ctx.arc(b.x, b.y, radius, startAngle, smallEndAngle, anticlockwise)
  ctx.stroke()

  // Draw label
  drawAngleLabel(ctx, b, label, angleDeg, canvasWidth, canvasHeight, isFlipped)

  return angleDeg
}

/**
 * Draws the angle label with proper positioning and styling
 */
function drawAngleLabel(
  ctx: CanvasRenderingContext2D,
  center: { x: number; y: number },
  label: string,
  angle: number,
  canvasWidth: number,
  canvasHeight: number,
  isFlipped: boolean
): void {
  const labelText = `${label}: `
  const angleText = `${angle.toFixed(1)}°`
  const { x: padX, y: padY } = DRAWING_CONFIG.LABEL_PADDING

  // Measure text dimensions
  ctx.font = DRAWING_CONFIG.LABEL_FONT
  const labelMetrics = ctx.measureText(labelText)
  ctx.font = `bold ${DRAWING_CONFIG.LABEL_FONT}`
  const angleMetrics = ctx.measureText(angleText)

  const boxWidth = labelMetrics.width + angleMetrics.width + padX * 3
  const boxHeight = 18 + padY * 2

  // Calculate position
  let x = center.x + 8
  let y = center.y - 8 - boxHeight / 2

  // Clamp to canvas bounds
  const maxX = canvasWidth - boxWidth - 4
  const maxY = canvasHeight - boxHeight - 4
  x = Math.max(4, Math.min(x, maxX))
  y = Math.max(4, Math.min(y, maxY))

  ctx.save()
  // Unified drawing origin - use local origin (ox, oy)
  let ox = x
  let oy = y

  if (isFlipped) {
    // When flipped, apply a horizontal mirror transform and draw relative to (0,0)
    ctx.translate(x + boxWidth / 2, y + boxHeight / 2)
    ctx.scale(-1, 1)
    ctx.translate(-boxWidth / 2, -boxHeight / 2)
    ox = 0
    oy = 0
  }

  // Draw background and text using the unified origin
  drawRoundedRect(ctx, ox, oy, boxWidth, boxHeight, 6,
    hexToRgba('#000000', DRAWING_CONFIG.BACKGROUND_ALPHA))

  ctx.fillStyle = '#fff'
  ctx.font = DRAWING_CONFIG.LABEL_FONT
  ctx.fillText(labelText, ox + padX, oy + padY + 14)

  ctx.font = `bold ${DRAWING_CONFIG.LABEL_FONT}`
  ctx.fillText(angleText, ox + padX + labelMetrics.width, oy + padY + 14)

  ctx.restore()
}

/**
 * Main function to draw all bike fit angles based on detected side
 */
export function drawBikeFitAngles(
  ctx: CanvasRenderingContext2D,
  keypoints: Keypoint[],
  detectedSide: 'left' | 'right' | 'unknown',
  settings: VisualSettings,
  canvasWidth: number,
  canvasHeight: number,
  isFlipped = false
): Record<string, number | null> {
  const angles: Record<string, number | null> = {}

  if (detectedSide === 'unknown') {
    return angles
  }

  // Get keypoint indices based on detected side
  const indices = detectedSide === 'right'
    ? { shoulder: 12, elbow: 14, wrist: 16, hip: 24, knee: 26, ankle: 28, foot: 32 }
    : { shoulder: 11, elbow: 13, wrist: 15, hip: 23, knee: 25, ankle: 27, foot: 31 }

  const {
    shoulder: shoulderKp,
    elbow: elbowKp,
    wrist: wristKp,
    hip: hipKp,
    knee: kneeKp,
    ankle: ankleKp,
    foot: footKp
  } = {
    shoulder: keypoints[indices.shoulder],
    elbow: keypoints[indices.elbow],
    wrist: keypoints[indices.wrist],
    hip: keypoints[indices.hip],
    knee: keypoints[indices.knee],
    ankle: keypoints[indices.ankle],
    foot: keypoints[indices.foot]
  }

  // Draw angles with proper error handling
  if (shoulderKp && elbowKp && wristKp) {
    angles.elbow = drawAngleMarker(
      ctx, shoulderKp, elbowKp, wristKp, 'Elbow',
      settings, canvasWidth, canvasHeight, isFlipped
    )
  }

  if (hipKp && shoulderKp && elbowKp) {
    angles.shoulder = drawAngleMarker(
      ctx, hipKp, shoulderKp, elbowKp, 'Shoulder',
      settings, canvasWidth, canvasHeight, isFlipped
    )
  }

  if (shoulderKp && hipKp && kneeKp) {
    angles.hip = drawAngleMarker(
      ctx, shoulderKp, hipKp, kneeKp, 'Hip',
      settings, canvasWidth, canvasHeight, isFlipped
    )
  }

  if (hipKp && kneeKp && ankleKp) {
    angles.knee = drawAngleMarker(
      ctx, hipKp, kneeKp, ankleKp, 'Knee',
      settings, canvasWidth, canvasHeight, isFlipped
    )
  }

  // Handle ankle angle with foot proxy if needed
  if (kneeKp && ankleKp) {
    const footPoint = footKp || createFootProxy(kneeKp, ankleKp)
    angles.ankle = drawAngleMarker(
      ctx, kneeKp, ankleKp, footPoint, 'Ankle',
      settings, canvasWidth, canvasHeight, isFlipped
    )
  }

  return angles
}
