import { calculateAngleBetweenPoints, hexToRgba } from '@/lib/bikefit-utils'
import type { Keypoint, VisualSettings } from '@/types/bikefit'
import {
  drawRoundedRect,
  normalizeAngleDelta,
  normalizedToCanvas,
  isKeypointVisible
} from './utils'
import { DRAWING_CONFIG, KEYPOINT_INDICES } from './constants'

/**
 * Creates a proxy foot point when foot detection is insufficient
 */
function createFootProxy(knee: Keypoint, ankle: Keypoint): Keypoint {
  const directionScale = 0.5
  return {
    x: ankle.x + (ankle.x - knee.x) * directionScale,
    y: ankle.y + (ankle.y - knee.y) * directionScale,
    score: 0.8,
    name: 'foot_proxy'
  }
}

/**
 * Validates that all required keypoints meet visibility threshold
 * Uses a more lenient threshold for angle detection
 */
function areKeypointsVisible(
  keypoints: (Keypoint | undefined)[],
  threshold = DRAWING_CONFIG.ANGLE_VISIBILITY_THRESHOLD
): keypoints is Keypoint[] {
  return keypoints.every(kp => kp && isKeypointVisible(kp, threshold))
}

/**
 * Calculates arc drawing parameters for angle visualization
 */
function calculateArcParameters(
  pointA: Keypoint,
  pointB: Keypoint,
  pointC: Keypoint,
  canvasWidth: number,
  canvasHeight: number
) {
  const a = normalizedToCanvas(pointA, canvasWidth, canvasHeight)
  const b = normalizedToCanvas(pointB, canvasWidth, canvasHeight)
  const c = normalizedToCanvas(pointC, canvasWidth, canvasHeight)

  const v1x = a.x - b.x
  const v1y = a.y - b.y
  const v2x = c.x - b.x
  const v2y = c.y - b.y

  const startAngle = Math.atan2(v1y, v1x)
  const endAngle = Math.atan2(v2y, v2x)
  const delta = normalizeAngleDelta(endAngle - startAngle)
  const smallEndAngle = startAngle + delta
  const anticlockwise = delta < 0

  return { a, b, c, startAngle, smallEndAngle, anticlockwise }
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
  // Validate keypoint visibility with more permissive threshold
  if (!areKeypointsVisible([pointA, pointB, pointC])) {
    return null
  }

  // Calculate angle
  const angleDeg = calculateAngleBetweenPoints(
    { x: pointA.x, y: pointA.y, score: pointA.score, name: pointA.name || 'a' },
    { x: pointB.x, y: pointB.y, score: pointB.score, name: pointB.name || 'b' },
    { x: pointC.x, y: pointC.y, score: pointC.score, name: pointC.name || 'c' }
  )

  // Skip invalid angles
  if (!isFinite(angleDeg) || angleDeg < 0 || angleDeg > 180) {
    return null
  }

  try {
    // Calculate arc parameters
    const { b, startAngle, smallEndAngle, anticlockwise } = calculateArcParameters(
      pointA, pointB, pointC, canvasWidth, canvasHeight
    )

    // Calculate dynamic radius based on canvas size
    const baseRadius = Math.min(canvasWidth, canvasHeight) * 0.08 // 8% of the smaller dimension
    const radius = Math.min(
      Math.max(baseRadius, DRAWING_CONFIG.ARC_RADIUS_MIN),
      DRAWING_CONFIG.ARC_RADIUS_MAX
    )

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
    drawArcOutline(ctx, b, radius, startAngle, smallEndAngle, anticlockwise, settings)

    // Draw label
    drawAngleLabel(ctx, b, label, angleDeg, canvasWidth, canvasHeight, isFlipped)

    return angleDeg
  } catch {
    return null
  }
}

/**
 * Draws the arc outline for angle visualization
 */
function drawArcOutline(
  ctx: CanvasRenderingContext2D,
  center: { x: number; y: number },
  radius: number,
  startAngle: number,
  endAngle: number,
  anticlockwise: boolean,
  settings: VisualSettings
): void {
  const arcLineWidth = Math.max(
    DRAWING_CONFIG.ARC_LINE_MIN_WIDTH,
    Math.round(settings.lineWidth * DRAWING_CONFIG.ARC_LINE_WIDTH_RATIO)
  )

  ctx.strokeStyle = settings.lineColor
  ctx.lineWidth = arcLineWidth
  ctx.beginPath()
  ctx.arc(center.x, center.y, radius, startAngle, endAngle, anticlockwise)
  ctx.stroke()
}

/**
 * Calculates label position with proper boundary clamping
 */
function calculateLabelPosition(
  center: { x: number; y: number },
  boxWidth: number,
  boxHeight: number,
  canvasWidth: number,
  canvasHeight: number
): { x: number; y: number } {
  let x = center.x + 8
  let y = center.y - 8 - boxHeight / 2

  // Clamp to canvas bounds with proper margins
  const margin = 4
  const maxX = canvasWidth - boxWidth - margin
  const maxY = canvasHeight - boxHeight - margin

  x = Math.max(margin, Math.min(x, maxX))
  y = Math.max(margin, Math.min(y, maxY))

  return { x, y }
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

  // Calculate optimal position
  const { x, y } = calculateLabelPosition(center, boxWidth, boxHeight, canvasWidth, canvasHeight)

  ctx.save()

  // Handle flipped drawing with unified origin
  let originX = x
  let originY = y

  if (isFlipped) {
    ctx.translate(x + boxWidth / 2, y + boxHeight / 2)
    ctx.scale(-1, 1)
    ctx.translate(-boxWidth / 2, -boxHeight / 2)
    originX = 0
    originY = 0
  }

  // Draw background with rounded corners
  drawRoundedRect(
    ctx,
    originX,
    originY,
    boxWidth,
    boxHeight,
    6,
    hexToRgba('#000000', DRAWING_CONFIG.BACKGROUND_ALPHA)
  )

  // Draw text with proper styling
  ctx.fillStyle = '#fff'
  ctx.font = DRAWING_CONFIG.LABEL_FONT
  ctx.fillText(labelText, originX + padX, originY + padY + 14)

  ctx.font = `bold ${DRAWING_CONFIG.LABEL_FONT}`
  ctx.fillText(angleText, originX + padX + labelMetrics.width, originY + padY + 14)

  ctx.restore()
}

/**
 * Gets keypoint indices based on detected side
 */
function getKeypointIndices(detectedSide: 'left' | 'right') {
  return detectedSide === 'right'
    ? {
        shoulder: KEYPOINT_INDICES.RIGHT_SHOULDER,
        elbow: KEYPOINT_INDICES.RIGHT_ELBOW,
        wrist: KEYPOINT_INDICES.RIGHT_WRIST,
        hip: KEYPOINT_INDICES.RIGHT_HIP,
        knee: KEYPOINT_INDICES.RIGHT_KNEE,
        ankle: KEYPOINT_INDICES.RIGHT_ANKLE,
        foot: KEYPOINT_INDICES.RIGHT_FOOT
      }
    : {
        shoulder: KEYPOINT_INDICES.LEFT_SHOULDER,
        elbow: KEYPOINT_INDICES.LEFT_ELBOW,
        wrist: KEYPOINT_INDICES.LEFT_WRIST,
        hip: KEYPOINT_INDICES.LEFT_HIP,
        knee: KEYPOINT_INDICES.LEFT_KNEE,
        ankle: KEYPOINT_INDICES.LEFT_ANKLE,
        foot: KEYPOINT_INDICES.LEFT_FOOT
      }
}

/**
 * Draws a specific angle measurement if all required keypoints are available
 */
function drawAngleIfValid(
  ctx: CanvasRenderingContext2D,
  keypoint1: Keypoint | undefined,
  keypoint2: Keypoint | undefined,
  keypoint3: Keypoint | undefined,
  label: string,
  settings: VisualSettings,
  canvasWidth: number,
  canvasHeight: number,
  isFlipped: boolean
): number | null {
  if (!keypoint1 || !keypoint2 || !keypoint3) return null

  return drawAngleMarker(
    ctx, keypoint1, keypoint2, keypoint3, label,
    settings, canvasWidth, canvasHeight, isFlipped
  )
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

  // Get keypoint indices for the detected side
  const indices = getKeypointIndices(detectedSide)

  // Extract keypoints using indices
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

  // Draw all relevant angles with proper error handling
  angles.elbow = drawAngleIfValid(
    ctx, shoulderKp, elbowKp, wristKp, 'Elbow',
    settings, canvasWidth, canvasHeight, isFlipped
  )

  angles.shoulder = drawAngleIfValid(
    ctx, hipKp, shoulderKp, elbowKp, 'Shoulder',
    settings, canvasWidth, canvasHeight, isFlipped
  )

  angles.hip = drawAngleIfValid(
    ctx, shoulderKp, hipKp, kneeKp, 'Hip',
    settings, canvasWidth, canvasHeight, isFlipped
  )

  angles.knee = drawAngleIfValid(
    ctx, hipKp, kneeKp, ankleKp, 'Knee',
    settings, canvasWidth, canvasHeight, isFlipped
  )

  // Handle ankle angle with foot proxy if needed
  if (kneeKp && ankleKp) {
    const footPoint = footKp || createFootProxy(kneeKp, ankleKp)
    angles.ankle = drawAngleIfValid(
      ctx, kneeKp, ankleKp, footPoint, 'Ankle',
      settings, canvasWidth, canvasHeight, isFlipped
    )
  }

  return angles
}
