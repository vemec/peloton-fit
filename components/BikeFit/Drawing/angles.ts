import { calculateAngleBetweenPoints, hexToRgba, isKeypointValid } from '@/lib/bikefit-utils'
import type { Keypoint, VisualSettings } from '@/types/bikefit'
import { drawRoundedRect } from './utils'
import { normalizedToCanvas } from './utils'
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
  return keypoints.every(kp => kp && isKeypointValid(kp, threshold))
}

/**
 * Calculates arc drawing parameters for angle visualization
 */
function calculateArcParameters(
  pointA: { x: number; y: number },
  pointB: { x: number; y: number },
  pointC: { x: number; y: number }
) {
  // Use pixel coordinates directly
  const a = { x: pointA.x, y: pointA.y }
  const b = { x: pointB.x, y: pointB.y }
  const c = { x: pointC.x, y: pointC.y }

  // Vectores BA y BC
  const v1x = a.x - b.x
  const v1y = a.y - b.y
  const v2x = c.x - b.x
  const v2y = c.y - b.y

  // Ángulos inicial y final
  const startAngle = Math.atan2(v1y, v1x)
  const endAngle = Math.atan2(v2y, v2x)

  // Diferencia de ángulos normalizada a [0, 2π)
  let delta = endAngle - startAngle
  if (delta < 0) delta += 2 * Math.PI

  // Determinar dirección del arco (horario/antihorario) usando cross product
  const cross = v1x * v2y - v1y * v2x
  const anticlockwise = cross < 0

  return {
    center: b,            // punto central (vértice B)
    startAngle,
    endAngle,
    delta,
    anticlockwise,
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
  isFlipped = false,
  side: 'left' | 'right',
  isHovered = false
): number | null {
  // Validate keypoint visibility with more permissive threshold
  if (!areKeypointsVisible([pointA, pointB, pointC])) {
    return null
  }

  // Convert normalized coordinates to canvas pixels first (only if needed)
  const needsConversion = pointA.x <= 1 && pointA.y <= 1 && pointB.x <= 1 && pointB.y <= 1 && pointC.x <= 1 && pointC.y <= 1
  const aPixel = needsConversion ? normalizedToCanvas(pointA, canvasWidth, canvasHeight) : { x: pointA.x, y: pointA.y }
  const bPixel = needsConversion ? normalizedToCanvas(pointB, canvasWidth, canvasHeight) : { x: pointB.x, y: pointB.y }
  const cPixel = needsConversion ? normalizedToCanvas(pointC, canvasWidth, canvasHeight) : { x: pointC.x, y: pointC.y }

  // Calculate angle between vectors using pixel coordinates
  const angleDeg = calculateAngleBetweenPoints(
    { x: aPixel.x, y: aPixel.y, score: pointA.score, name: pointA.name || 'a' },
    { x: bPixel.x, y: bPixel.y, score: pointB.score, name: pointB.name || 'b' },
    { x: cPixel.x, y: cPixel.y, score: pointC.score, name: pointC.name || 'c' }
  )

  // Skip invalid angles
  if (!isFinite(angleDeg) || angleDeg < 0 || angleDeg > 180) {
    return null
  }

  try {
    // Use converted pixel coordinates for drawing
    const a = aPixel
    const b = bPixel
    const c = cPixel

    // Calcular parámetros del arco
    const { center, startAngle, endAngle, anticlockwise } = calculateArcParameters(
      { x: a.x, y: a.y }, { x: b.x, y: b.y }, { x: c.x, y: c.y }
    )

    // Dibujar los dos rayos (líneas)
    ctx.save()
    ctx.strokeStyle = settings.lineColor
    ctx.lineWidth = settings.lineWidth
    ctx.beginPath()
    ctx.moveTo(b.x, b.y)
    ctx.lineTo(a.x, a.y)
    ctx.moveTo(b.x, b.y)
    ctx.lineTo(c.x, c.y)
    ctx.stroke()
    ctx.restore()

    // Calcular radio dinámico
    const baseRadius = Math.min(canvasWidth, canvasHeight) * 0.08
    const radius = Math.min(
      Math.max(baseRadius, DRAWING_CONFIG.ARC_RADIUS_MIN),
      DRAWING_CONFIG.ARC_RADIUS_MAX
    )

    // Dibujar sector relleno
    ctx.save()
    ctx.beginPath()
    ctx.moveTo(center.x, center.y)
    ctx.arc(center.x, center.y, radius, startAngle, endAngle, anticlockwise)
    ctx.closePath()
    ctx.fillStyle = hexToRgba(settings.lineColor, DRAWING_CONFIG.SECTOR_ALPHA)
    ctx.fill()
    ctx.restore()

    // Dibujar contorno del arco
    drawArcOutline(ctx, center, radius, startAngle, endAngle, anticlockwise, settings, isHovered)

    // Dibujar nodos A, B, C
    ctx.save()
    ctx.fillStyle = settings.pointColor
    ctx.strokeStyle = DRAWING_CONFIG.OUTLINE_COLOR
    ctx.lineWidth = DRAWING_CONFIG.OUTLINE_WIDTH
    const r = settings.pointRadius

    const drawNode = (p: { x: number; y: number }) => {
      ctx.beginPath()
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()
    }

    drawNode(a)
    drawNode(b)
    drawNode(c)
    ctx.restore()

    if (side === 'left') side = 'right'
    else if (side === 'right') side = 'left'

    // Dibujar etiqueta
    drawAngleLabel(ctx, b, label, angleDeg, canvasWidth, canvasHeight, isFlipped, side)

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
  settings: VisualSettings,
  isHovered = false
): void {
  const arcLineWidth = Math.max(
    DRAWING_CONFIG.ARC_LINE_MIN_WIDTH,
    Math.round(settings.lineWidth * DRAWING_CONFIG.ARC_LINE_WIDTH_RATIO)
  )

  // Use a different color when hovering
  ctx.strokeStyle = isHovered ? '#fbbf24' : settings.lineColor // Yellow color for hover
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
  canvasHeight: number,
  horizontal: 'left' | 'right'
): { x: number; y: number } {
  // place to the side of the vertex to reduce overlap between left/right
  let x = horizontal === 'right' ? center.x + 8 : center.x - boxWidth - 8
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
  isFlipped: boolean,
  side: 'left' | 'right'
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

  // Determine on-screen side (flipped mirrors horizontally)
  const screenSide: 'left' | 'right' = isFlipped ? (side === 'left' ? 'right' : 'left') : side
  // Calculate optimal position
  const { x, y } = calculateLabelPosition(center, boxWidth, boxHeight, canvasWidth, canvasHeight, screenSide)

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
        foot: KEYPOINT_INDICES.RIGHT_FOOT_INDEX
      }
    : {
        shoulder: KEYPOINT_INDICES.LEFT_SHOULDER,
        elbow: KEYPOINT_INDICES.LEFT_ELBOW,
        wrist: KEYPOINT_INDICES.LEFT_WRIST,
        hip: KEYPOINT_INDICES.LEFT_HIP,
        knee: KEYPOINT_INDICES.LEFT_KNEE,
        ankle: KEYPOINT_INDICES.LEFT_ANKLE,
        foot: KEYPOINT_INDICES.LEFT_FOOT_INDEX
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
  isFlipped: boolean,
  side: 'left' | 'right'
): number | null {
  if (!keypoint1 || !keypoint2 || !keypoint3) return null

  return drawAngleMarker(
    ctx, keypoint1, keypoint2, keypoint3, label,
    settings, canvasWidth, canvasHeight, isFlipped, side, false
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
  isFlipped = false,
  visibleAngles?: Partial<Record<'elbow' | 'shoulder' | 'hip' | 'knee' | 'ankle', boolean>>
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

  // Helper to check if an angle should be drawn (default true when undefined)
  const isVisible = (name: 'elbow' | 'shoulder' | 'hip' | 'knee' | 'ankle') =>
    visibleAngles?.[name] !== false

  // Draw all relevant angles with proper error handling
  if (isVisible('elbow')) {
    angles.elbow = drawAngleIfValid(
      ctx, shoulderKp, elbowKp, wristKp, 'Elbow',
      settings, canvasWidth, canvasHeight, isFlipped, detectedSide
    )
  } else {
    angles.elbow = null
  }

  if (isVisible('shoulder')) {
    angles.shoulder = drawAngleIfValid(
      ctx, hipKp, shoulderKp, elbowKp, 'Shoulder',
      settings, canvasWidth, canvasHeight, isFlipped, detectedSide
    )
  } else {
    angles.shoulder = null
  }

  if (isVisible('hip')) {
    angles.hip = drawAngleIfValid(
      ctx, shoulderKp, hipKp, kneeKp, 'Hip',
      settings, canvasWidth, canvasHeight, isFlipped, detectedSide
    )
  } else {
    angles.hip = null
  }

  if (isVisible('knee')) {
    angles.knee = drawAngleIfValid(
      ctx, hipKp, kneeKp, ankleKp, 'Knee',
      settings, canvasWidth, canvasHeight, isFlipped, detectedSide
    )
  } else {
    angles.knee = null
  }

  // Handle ankle angle with foot proxy if needed
  if (kneeKp && ankleKp) {
  if (isVisible('ankle')) {
      const footPoint = footKp || createFootProxy(kneeKp, ankleKp)
      angles.ankle = drawAngleIfValid(
    ctx, kneeKp, ankleKp, footPoint, 'Ankle',
    settings, canvasWidth, canvasHeight, isFlipped, detectedSide
      )
    } else {
      angles.ankle = null
    }
  }

  return angles
}
