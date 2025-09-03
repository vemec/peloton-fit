import { calculateAngleBetweenPoints } from '@/lib/bikefit-utils'
import type { VisualSettings, Keypoint, DrawingContext } from '@/types/bikefit'

// MediaPipe pose connections for drawing skeleton - Simplified for bike fit analysis
export const POSE_CONNECTIONS = [
  // Core body connections for bike fit
  [11, 12], // shoulders
  [11, 13], [13, 15], // left arm
  [12, 14], [14, 16], // right arm
  [11, 23], [12, 24], // shoulders to hips
  [23, 24], // hips
  [23, 25], [25, 27], // left leg (hip-knee-ankle)
  [24, 26], [26, 28], // right leg (hip-knee-ankle)
  [27, 31], // left ankle to foot
  [28, 32], // right ankle to foot
]

// Key angles for bike fitting analysis
export const BIKE_FIT_ANGLES = {
  // Knee angle (hip-knee-ankle)
  knee: { points: [23, 25, 27] }, // left knee
  kneeRight: { points: [24, 26, 28] }, // right knee

  // Hip angle (shoulder-hip-knee)
  hip: { points: [11, 23, 25] }, // left hip
  hipRight: { points: [12, 24, 26] }, // right hip

  // Ankle angle (knee-ankle-foot)
  ankle: { points: [25, 27, 31] }, // left ankle
  ankleRight: { points: [26, 28, 32] }, // right ankle

  // Back angle (shoulder-hip-vertical)
  back: { points: [11, 23] }, // left side
  backRight: { points: [12, 24] }, // right side
}

export function setupCanvas(canvas: HTMLCanvasElement, video: HTMLVideoElement): DrawingContext | null {
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  // Get the video's actual display dimensions
  const videoRect = video.getBoundingClientRect()
  const displayWidth = videoRect.width
  const displayHeight = videoRect.height

  // Get video's native dimensions (for proper scaling)
  const videoWidth = video.videoWidth || displayWidth
  const videoHeight = video.videoHeight || displayHeight

  if (videoWidth === 0 || videoHeight === 0) {
    return null
  }

  // Set canvas internal resolution to match video native resolution
  canvas.width = videoWidth
  canvas.height = videoHeight

  // Set canvas display size to match video display size
  canvas.style.width = `${displayWidth}px`
  canvas.style.height = `${displayHeight}px`

  return { canvas, ctx, video }
}

export function clearCanvas(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.clearRect(0, 0, width, height)
}

export function drawKeypoint(
  ctx: CanvasRenderingContext2D,
  keypoint: Keypoint,
  settings: VisualSettings,
  canvasWidth: number,
  canvasHeight: number
) {
  if ((keypoint.score || keypoint.visibility || 0) < 0.5) return

  const x = keypoint.x * canvasWidth
  const y = keypoint.y * canvasHeight

  ctx.beginPath()
  ctx.arc(x, y, settings.pointRadius, 0, 2 * Math.PI)
  ctx.fillStyle = settings.pointColor
  ctx.fill()

  // Add outline for better visibility (similar to PoseViewer)
  ctx.beginPath()
  ctx.arc(x, y, settings.pointRadius, 0, 2 * Math.PI)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)'
  ctx.lineWidth = 1
  ctx.stroke()
}

export function drawConnection(
  ctx: CanvasRenderingContext2D,
  keypoint1: Keypoint,
  keypoint2: Keypoint,
  settings: VisualSettings,
  canvasWidth: number,
  canvasHeight: number
) {
  const vis1 = keypoint1.score || keypoint1.visibility || 0
  const vis2 = keypoint2.score || keypoint2.visibility || 0
  if (vis1 < 0.5 || vis2 < 0.5) return

  const x1 = keypoint1.x * canvasWidth
  const y1 = keypoint1.y * canvasHeight
  const x2 = keypoint2.x * canvasWidth
  const y2 = keypoint2.y * canvasHeight

  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(x2, y2)
  ctx.strokeStyle = settings.lineColor
  ctx.lineWidth = settings.lineWidth
  ctx.stroke()
}

export function drawSkeleton(
  ctx: CanvasRenderingContext2D,
  keypoints: Keypoint[],
  settings: VisualSettings,
  canvasWidth: number,
  canvasHeight: number
) {
  // Draw connections first (so they appear behind points)
  POSE_CONNECTIONS.forEach(([startIdx, endIdx]) => {
    if (keypoints[startIdx] && keypoints[endIdx]) {
      drawConnection(
        ctx,
        keypoints[startIdx],
        keypoints[endIdx],
        settings,
        canvasWidth,
        canvasHeight
      )
    }
  })

  // Draw only relevant keypoints for bike fit analysis
  const relevantKeypoints = [
    11, 12, // shoulders
    13, 14, // elbows
    15, 16, // wrists
    23, 24, // hips
    25, 26, // knees
    27, 28, // ankles
    31, 32  // feet
  ]

  relevantKeypoints.forEach(idx => {
    if (keypoints[idx]) {
      drawKeypoint(ctx, keypoints[idx], settings, canvasWidth, canvasHeight)
    }
  })
}

// Enhanced function to draw only the detected side for cleaner bike fit analysis
export function drawDetectedSideSkeleton(
  ctx: CanvasRenderingContext2D,
  keypoints: Keypoint[],
  detectedSide: 'left' | 'right',
  settings: VisualSettings,
  canvasWidth: number,
  canvasHeight: number
) {
  // Define connections for ONLY the detected side - no cross-connections
  const sideConnections = detectedSide === 'right' ? [
    [12, 14], [14, 16], // right arm (shoulder-elbow-wrist)
    [12, 24], // right shoulder to right hip
    [24, 26], [26, 28], // right leg (hip-knee-ankle)
    [28, 32], // right ankle to right foot
  ] : [
    [11, 13], [13, 15], // left arm (shoulder-elbow-wrist)
    [11, 23], // left shoulder to left hip
    [23, 25], [25, 27], // left leg (hip-knee-ankle)
    [27, 31], // left ankle to left foot
  ]

  // Draw connections for the detected side only
  sideConnections.forEach(([startIdx, endIdx]) => {
    if (keypoints[startIdx] && keypoints[endIdx]) {
      drawConnection(
        ctx,
        keypoints[startIdx],
        keypoints[endIdx],
        settings,
        canvasWidth,
        canvasHeight
      )
    }
  })

  // Draw keypoints for ONLY the detected side - no opposing points
  const sideKeypoints = detectedSide === 'right' ? [
    12, // right shoulder
    14, // right elbow
    16, // right wrist
    24, // right hip
    26, // right knee
    28, // right ankle
    32  // right foot
  ] : [
    11, // left shoulder
    13, // left elbow
    15, // left wrist
    23, // left hip
    25, // left knee
    27, // left ankle
    31  // left foot
  ]

  sideKeypoints.forEach(idx => {
    if (keypoints[idx]) {
      drawKeypoint(ctx, keypoints[idx], settings, canvasWidth, canvasHeight)
    }
  })
}

// Utility function to convert hex to rgba
function hexToRgba(hex: string, alpha = 1) {
  const h = hex.replace('#', '')
  const bigint = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16)
  const r = (bigint >> 16) & 255
  const g = (bigint >> 8) & 255
  const b = bigint & 255
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

// Rounded rectangle helper function
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  fillStyle: string
) {
  const radius = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.arcTo(x + w, y, x + w, y + h, radius)
  ctx.arcTo(x + w, y + h, x, y + h, radius)
  ctx.arcTo(x, y + h, x, y, radius)
  ctx.arcTo(x, y, x + w, y, radius)
  ctx.closePath()
  ctx.fillStyle = fillStyle
  ctx.fill()
}

// Enhanced angle drawing with visual arc and tooltip (based on PoseViewer.tsx)
function drawAngleMarker(
  ctx: CanvasRenderingContext2D,
  aPt: Keypoint,
  bPt: Keypoint,
  cPt: Keypoint,
  label: string,
  settings: VisualSettings,
  canvasWidth: number,
  canvasHeight: number,
  isFlipped = false
): number | null {
  // Check visibility/confidence of all points first
  const aVisibility = aPt.score || 0
  const bVisibility = bPt.score || 0
  const cVisibility = cPt.score || 0

  // Only proceed if all points are sufficiently visible (confidence > 0.6)
  if (aVisibility < 0.6 || bVisibility < 0.6 || cVisibility < 0.6) {
    return null // Don't draw anything if any point is not visible enough
  }

  // Use the existing calculateAngleBetweenPoints function for consistency with PoseViewer.tsx
  // Create compatible keypoints for the angle calculation
  const angleDeg = calculateAngleBetweenPoints(
    { x: aPt.x, y: aPt.y, score: aPt.score, name: aPt.name || 'a' },
    { x: bPt.x, y: bPt.y, score: bPt.score, name: bPt.name || 'b' },
    { x: cPt.x, y: cPt.y, score: cPt.score, name: cPt.name || 'c' }
  )  // Convert normalized coordinates to pixel coordinates for drawing
  const bx = bPt.x * canvasWidth
  const by = bPt.y * canvasHeight
  const ax = aPt.x * canvasWidth
  const ay = aPt.y * canvasHeight
  const cx = cPt.x * canvasWidth
  const cy = cPt.y * canvasHeight

  const r = 30
  const v1x = ax - bx
  const v1y = ay - by
  const v2x = cx - bx
  const v2y = cy - by
  const start = Math.atan2(v1y, v1x)
  const end = Math.atan2(v2y, v2x)

  // Normalize delta to (-PI, PI] to get the interior (small) angle direction
  function normalizeDelta(d: number) {
    let x = d
    while (x <= -Math.PI) x += Math.PI * 2
    while (x > Math.PI) x -= Math.PI * 2
    return x
  }

  const delta = normalizeDelta(end - start)
  const smallEnd = start + delta
  const anticlockwise = delta < 0

  // Draw filled translucent sector using the small interior arc
  ctx.save()
  ctx.beginPath()
  ctx.moveTo(bx, by)
  ctx.arc(bx, by, r, start, smallEnd, anticlockwise)
  ctx.closePath()
  ctx.fillStyle = hexToRgba(settings.lineColor, 0.18)
  ctx.fill()
  ctx.restore()

  // Draw arc outline (follow same small arc)
  ctx.strokeStyle = settings.lineColor
  ctx.lineWidth = Math.max(1, settings.lineWidth)
  ctx.beginPath()
  ctx.arc(bx, by, r, start, smallEnd, anticlockwise)
  ctx.stroke()

  // Draw label background and text (label + bold angle number)
  const labelText = `${label}: `
  const numText = `${angleDeg.toFixed(1)}°`
  const padX = 8
  const padY = 6
  const labelFont = '16px sans-serif'
  const numFont = '16px sans-serif'

  ctx.font = labelFont
  const metricsLabel = ctx.measureText(labelText)
  ctx.font = `bold ${numFont}`
  const metricsNum = ctx.measureText(numText)

  const boxW = metricsLabel.width + metricsNum.width + padX * 3
  const boxH = 18 + padY * 2
  let tx = bx + 8
  let ty = by - 8 - boxH / 2

  // Clamp to canvas bounds
  const maxX = canvasWidth - boxW - 4
  const maxY = canvasHeight - boxH - 4
  tx = Math.max(4, Math.min(tx, maxX))
  ty = Math.max(4, Math.min(ty, maxY))

  ctx.save()

  // If the canvas is flipped, we need to flip the text back to be readable
  if (isFlipped) {
    // Move to the text position, flip horizontally, then draw
    ctx.translate(tx + boxW / 2, ty + boxH / 2)
    ctx.scale(-1, 1)
    ctx.translate(-boxW / 2, -boxH / 2)

    // Draw rounded rectangle background
    roundRect(ctx, 0, 0, boxW, boxH, 6, hexToRgba('#000000', 0.65))

    // Draw label text
    ctx.fillStyle = '#fff'
    ctx.font = labelFont
    ctx.fillText(labelText, padX, padY + 14)

    // Draw number in bold
    ctx.font = `bold ${numFont}`
    ctx.fillText(numText, padX + metricsLabel.width, padY + 14)
  } else {
    // Normal drawing when not flipped
    // Draw rounded rectangle background
    roundRect(ctx, tx, ty, boxW, boxH, 6, hexToRgba('#000000', 0.65))

    // Draw label text
    ctx.fillStyle = '#fff'
    ctx.font = labelFont
    ctx.fillText(labelText, tx + padX, ty + padY + 14)

    // Draw number in bold
    ctx.font = `bold ${numFont}`
    ctx.fillText(numText, tx + padX + metricsLabel.width, ty + padY + 14)
  }

  ctx.restore()

  return angleDeg
}

export function drawPoseDetectionInfo(
  ctx: CanvasRenderingContext2D,
  detectedSide: 'left' | 'right' | 'unknown',
  confidence: number
) {
  // Draw side detection info
  const infoY = 30

  ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'
  ctx.fillRect(10, 10, 200, 40)

  ctx.fillStyle = '#ffffff'
  ctx.font = '14px monospace'
  ctx.textAlign = 'left'
  ctx.fillText(`Lado: ${detectedSide.toUpperCase()}`, 20, infoY)
  ctx.fillText(`Confianza: ${Math.round(confidence * 100)}%`, 20, infoY + 20)
}

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

  // Choose angles based on detected side - use enhanced angle markers
  if (detectedSide === 'right') {
    // Right side angles with enhanced visual markers
    const shoulder = keypoints[12]
    const elbow = keypoints[14]
    const wrist = keypoints[16]
    const hip = keypoints[24]
    const knee = keypoints[26]
    const ankle = keypoints[28]
    const foot = keypoints[32]

    // Draw elbow angle
    if (shoulder && elbow && wrist) {
      angles.elbow = drawAngleMarker(ctx, shoulder, elbow, wrist, 'Elbow', settings, canvasWidth, canvasHeight, isFlipped)
    }

    // Draw shoulder angle
    if (hip && shoulder && elbow) {
      angles.shoulder = drawAngleMarker(ctx, hip, shoulder, elbow, 'Shoulder', settings, canvasWidth, canvasHeight, isFlipped)
    }

    // Draw hip angle
    if (shoulder && hip && knee) {
      angles.hip = drawAngleMarker(ctx, shoulder, hip, knee, 'Hip', settings, canvasWidth, canvasHeight, isFlipped)
    }

    // Draw knee angle
    if (hip && knee && ankle) {
      angles.knee = drawAngleMarker(ctx, hip, knee, ankle, 'Knee', settings, canvasWidth, canvasHeight, isFlipped)
    }

    // Draw ankle angle
    if (knee && ankle && foot) {
      angles.ankle = drawAngleMarker(ctx, knee, ankle, foot, 'Ankle', settings, canvasWidth, canvasHeight, isFlipped)
    } else if (knee && ankle) {
      // Create proxy foot point if foot is not detected
      const footProxy = {
        x: ankle.x + (ankle.x - knee.x) * 0.5,
        y: ankle.y + (ankle.y - knee.y) * 0.5,
        score: 0.8,
        name: 'foot_proxy'
      }
      angles.ankle = drawAngleMarker(ctx, knee, ankle, footProxy, 'Ankle', settings, canvasWidth, canvasHeight, isFlipped)
    }

  } else if (detectedSide === 'left') {
    // Left side angles with enhanced visual markers
    const shoulder = keypoints[11]
    const elbow = keypoints[13]
    const wrist = keypoints[15]
    const hip = keypoints[23]
    const knee = keypoints[25]
    const ankle = keypoints[27]
    const foot = keypoints[31]

    // Draw elbow angle
    if (shoulder && elbow && wrist) {
      angles.elbow = drawAngleMarker(ctx, shoulder, elbow, wrist, 'Elbow', settings, canvasWidth, canvasHeight, isFlipped)
    }

    // Draw shoulder angle
    if (hip && shoulder && elbow) {
      angles.shoulder = drawAngleMarker(ctx, hip, shoulder, elbow, 'Shoulder', settings, canvasWidth, canvasHeight, isFlipped)
    }

    // Draw hip angle
    if (shoulder && hip && knee) {
      angles.hip = drawAngleMarker(ctx, shoulder, hip, knee, 'Hip', settings, canvasWidth, canvasHeight, isFlipped)
    }

    // Draw knee angle
    if (hip && knee && ankle) {
      angles.knee = drawAngleMarker(ctx, hip, knee, ankle, 'Knee', settings, canvasWidth, canvasHeight, isFlipped)
    }

    // Draw ankle angle
    if (knee && ankle && foot) {
      angles.ankle = drawAngleMarker(ctx, knee, ankle, foot, 'Ankle', settings, canvasWidth, canvasHeight, isFlipped)
    } else if (knee && ankle) {
      // Create proxy foot point if foot is not detected
      const footProxy = {
        x: ankle.x + (ankle.x - knee.x) * 0.5,
        y: ankle.y + (ankle.y - knee.y) * 0.5,
        score: 0.8,
        name: 'foot_proxy'
      }
      angles.ankle = drawAngleMarker(ctx, knee, ankle, footProxy, 'Ankle', settings, canvasWidth, canvasHeight, isFlipped)
    }
  }

  return angles
}
