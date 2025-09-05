/**
 * Canvas setup and utility functions
 */

export interface DrawingContext {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  video: HTMLVideoElement
}

/**
 * Sets up canvas with proper dimensions and scaling
 */
export function setupCanvas(
  canvas: HTMLCanvasElement,
  video: HTMLVideoElement
): DrawingContext | null {
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

/**
 * Clears the entire canvas
 */
export function clearCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): void {
  ctx.clearRect(0, 0, width, height)
}

/**
 * Draws a rounded rectangle
 */
export function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  fillStyle: string
): void {
  const r = Math.min(radius, width / 2, height / 2)

  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + width, y, x + width, y + height, r)
  ctx.arcTo(x + width, y + height, x, y + height, r)
  ctx.arcTo(x, y + height, x, y, r)
  ctx.arcTo(x, y, x + width, y, r)
  ctx.closePath()

  ctx.fillStyle = fillStyle
  ctx.fill()
}

/**
 * Normalizes angle delta to (-PI, PI] range
 */
export function normalizeAngleDelta(delta: number): number {
  let normalized = delta
  while (normalized <= -Math.PI) normalized += Math.PI * 2
  while (normalized > Math.PI) normalized -= Math.PI * 2
  return normalized
}

/**
 * Converts normalized coordinates to canvas coordinates
 */
export function normalizedToCanvas(
  point: { x: number; y: number },
  canvasWidth: number,
  canvasHeight: number
): { x: number; y: number } {
  return {
    x: point.x * canvasWidth,
    y: point.y * canvasHeight,
  }
}
