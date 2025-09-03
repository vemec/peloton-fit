import { Keypoint, VisualSettings } from '../types'

// MediaPipe pose connections for drawing skeleton
export const POSE_CONNECTIONS = [
  // Face connections
  [0, 1], [1, 2], [2, 3], [3, 7], // nose to mouth
  [0, 4], [4, 5], [5, 6], [6, 8], // nose to ears

  // Body connections
  [9, 10], // mouth to mouth
  [11, 12], // shoulders
  [11, 13], [13, 15], // left arm
  [12, 14], [14, 16], // right arm
  [11, 23], [12, 24], // shoulders to hips
  [23, 24], // hips
  [23, 25], [25, 27], [27, 29], [27, 31], // left leg
  [24, 26], [26, 28], [28, 30], [28, 32], // right leg
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

export interface DrawingContext {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  video: HTMLVideoElement
}

export function setupCanvas(canvas: HTMLCanvasElement, video: HTMLVideoElement): DrawingContext | null {
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  // Match canvas size to video dimensions
  const videoRect = video.getBoundingClientRect()
  canvas.width = video.videoWidth || videoRect.width
  canvas.height = video.videoHeight || videoRect.height

  // Set canvas display size to match video display size
  canvas.style.width = `${videoRect.width}px`
  canvas.style.height = `${videoRect.height}px`

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
  if ((keypoint.visibility || keypoint.score || 0) < 0.5) return

  const x = keypoint.x * canvasWidth
  const y = keypoint.y * canvasHeight

  ctx.beginPath()
  ctx.arc(x, y, settings.pointSize, 0, 2 * Math.PI)
  ctx.fillStyle = settings.pointColor
  ctx.fill()

  // Add outline for better visibility
  ctx.beginPath()
  ctx.arc(x, y, settings.pointSize, 0, 2 * Math.PI)
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
  const vis1 = keypoint1.visibility || keypoint1.score || 0
  const vis2 = keypoint2.visibility || keypoint2.score || 0
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

  // Draw keypoints on top
  keypoints.forEach(keypoint => {
    if (keypoint) {
      drawKeypoint(ctx, keypoint, settings, canvasWidth, canvasHeight)
    }
  })
}

export function calculateAndDrawAngle(
  ctx: CanvasRenderingContext2D,
  keypoints: Keypoint[],
  pointIndices: number[],
  label: string,
  settings: VisualSettings,
  canvasWidth: number,
  canvasHeight: number
): number | null {
  const [p1Idx, p2Idx, p3Idx] = pointIndices
  const p1 = keypoints[p1Idx]
  const p2 = keypoints[p2Idx]  // vertex point
  const p3 = keypoints[p3Idx]

  if (!p1 || !p2 || !p3) return null

  const vis1 = p1.visibility || p1.score || 0
  const vis2 = p2.visibility || p2.score || 0
  const vis3 = p3.visibility || p3.score || 0

  if (vis1 < 0.5 || vis2 < 0.5 || vis3 < 0.5) return null

  // Calculate angle
  const angle1 = Math.atan2(p1.y - p2.y, p1.x - p2.x)
  const angle2 = Math.atan2(p3.y - p2.y, p3.x - p2.x)
  let angle = Math.abs(angle1 - angle2)

  // Convert to degrees and ensure 0-180 range
  angle = angle * (180 / Math.PI)
  if (angle > 180) angle = 360 - angle

  // Draw angle label
  const x = p2.x * canvasWidth
  const y = p2.y * canvasHeight

  ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'
  ctx.fillRect(x - 30, y - 35, 60, 20)

  ctx.fillStyle = '#ffffff'
  ctx.font = '12px monospace'
  ctx.textAlign = 'center'
  ctx.fillText(`${label}: ${Math.round(angle)}°`, x, y - 20)

  return angle
}

export function drawBikeFitAngles(
  ctx: CanvasRenderingContext2D,
  keypoints: Keypoint[],
  detectedSide: 'left' | 'right' | 'unknown',
  settings: VisualSettings,
  canvasWidth: number,
  canvasHeight: number
): Record<string, number | null> {
  const angles: Record<string, number | null> = {}

  // Choose angles based on detected side
  const angleSet = detectedSide === 'right' ? {
    knee: BIKE_FIT_ANGLES.kneeRight,
    hip: BIKE_FIT_ANGLES.hipRight,
    ankle: BIKE_FIT_ANGLES.ankleRight,
  } : {
    knee: BIKE_FIT_ANGLES.knee,
    hip: BIKE_FIT_ANGLES.hip,
    ankle: BIKE_FIT_ANGLES.ankle,
  }

  // Calculate and draw each angle
  Object.entries(angleSet).forEach(([name, config]) => {
    const angle = calculateAndDrawAngle(
      ctx,
      keypoints,
      config.points,
      name.toUpperCase(),
      settings,
      canvasWidth,
      canvasHeight
    )
    angles[name] = angle
  })

  return angles
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
