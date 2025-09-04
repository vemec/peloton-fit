/**
 * Performance optimization utilities for canvas drawing operations
 * Provides optimized drawing functions and performance monitoring
 */

import type { Keypoint, VisualSettings } from '@/types/bikefit'
import { DRAWING_CONFIG } from './constants'

/**
 * Performance metrics for monitoring drawing operations
 */
export interface DrawingMetrics {
  totalDrawTime: number
  keyPointsDrawn: number
  connectionsDrawn: number
  anglesDrawn: number
  fps: number
}

/**
 * Canvas drawing state cache for performance optimization
 */
interface CanvasState {
  lastLineColor?: string
  lastLineWidth?: number
  lastFillStyle?: string
  lastStrokeStyle?: string
}

const canvasStateCache = new WeakMap<CanvasRenderingContext2D, CanvasState>()

/**
 * Optimized canvas state management to reduce redundant style changes
 */
export function setCanvasStyle(
  ctx: CanvasRenderingContext2D,
  style: Partial<CanvasState>
): void {
  let cache = canvasStateCache.get(ctx)
  if (!cache) {
    cache = {}
    canvasStateCache.set(ctx, cache)
  }

  // Only update styles that have changed
  if (style.lastLineColor && style.lastLineColor !== cache.lastLineColor) {
    ctx.strokeStyle = style.lastLineColor
    cache.lastLineColor = style.lastLineColor
  }

  if (style.lastLineWidth && style.lastLineWidth !== cache.lastLineWidth) {
    ctx.lineWidth = style.lastLineWidth
    cache.lastLineWidth = style.lastLineWidth
  }

  if (style.lastFillStyle && style.lastFillStyle !== cache.lastFillStyle) {
    ctx.fillStyle = style.lastFillStyle
    cache.lastFillStyle = style.lastFillStyle
  }

  if (style.lastStrokeStyle && style.lastStrokeStyle !== cache.lastStrokeStyle) {
    ctx.strokeStyle = style.lastStrokeStyle
    cache.lastStrokeStyle = style.lastStrokeStyle
  }
}

/**
 * Clear canvas state cache (call when context is reset)
 */
export function clearCanvasStateCache(ctx: CanvasRenderingContext2D): void {
  canvasStateCache.delete(ctx)
}

/**
 * Performance-optimized batch drawing for multiple keypoints
 */
export function batchDrawKeypoints(
  ctx: CanvasRenderingContext2D,
  keypoints: Keypoint[],
  indices: readonly number[],
  settings: VisualSettings,
  canvasWidth: number,
  canvasHeight: number,
  visibilityThreshold = DRAWING_CONFIG.MIN_VISIBILITY_THRESHOLD
): number {
  let drawnCount = 0
  const { pointRadius, pointColor } = settings
  const { OUTLINE_COLOR, OUTLINE_WIDTH } = DRAWING_CONFIG

  // Set styles once for batch operation
  setCanvasStyle(ctx, {
    lastFillStyle: pointColor,
    lastStrokeStyle: OUTLINE_COLOR,
    lastLineWidth: OUTLINE_WIDTH
  })

  // Process all keypoints in a single batch
  indices.forEach(idx => {
    const keypoint = keypoints[idx]
    if (!keypoint) return

    const visibility = keypoint.score || keypoint.visibility || 0
    if (visibility < visibilityThreshold) return

    const x = keypoint.x * canvasWidth
    const y = keypoint.y * canvasHeight

    // Draw filled circle
    ctx.beginPath()
    ctx.arc(x, y, pointRadius, 0, 2 * Math.PI)
    ctx.fill()

    // Draw outline
    ctx.stroke()
    drawnCount++
  })

  return drawnCount
}

/**
 * Performance-optimized batch drawing for connections
 */
export function batchDrawConnections(
  ctx: CanvasRenderingContext2D,
  keypoints: Keypoint[],
  connections: readonly [number, number][],
  settings: VisualSettings,
  canvasWidth: number,
  canvasHeight: number,
  visibilityThreshold = DRAWING_CONFIG.MIN_VISIBILITY_THRESHOLD
): number {
  let drawnCount = 0

  // Set style once for all connections
  setCanvasStyle(ctx, {
    lastStrokeStyle: settings.lineColor,
    lastLineWidth: settings.lineWidth
  })

  ctx.beginPath()

  connections.forEach(([startIdx, endIdx]) => {
    const startPoint = keypoints[startIdx]
    const endPoint = keypoints[endIdx]

    if (!startPoint || !endPoint) return

    const startVisible = (startPoint.score || startPoint.visibility || 0) >= visibilityThreshold
    const endVisible = (endPoint.score || endPoint.visibility || 0) >= visibilityThreshold

    if (!startVisible || !endVisible) return

    const x1 = startPoint.x * canvasWidth
    const y1 = startPoint.y * canvasHeight
    const x2 = endPoint.x * canvasWidth
    const y2 = endPoint.y * canvasHeight

    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    drawnCount++
  })

  ctx.stroke()
  return drawnCount
}

/**
 * Simple FPS counter for performance monitoring
 */
class FPSCounter {
  private frames: number[] = []
  private readonly maxSamples = 60

  update(): number {
    const now = performance.now()
    this.frames.push(now)

    // Keep only recent frames
    if (this.frames.length > this.maxSamples) {
      this.frames.shift()
    }

    if (this.frames.length < 2) return 0

    const duration = this.frames[this.frames.length - 1] - this.frames[0]
    return Math.round((this.frames.length - 1) * 1000 / duration)
  }

  reset(): void {
    this.frames = []
  }
}

export const fpsCounter = new FPSCounter()

/**
 * Performance monitoring wrapper for drawing operations
 */
export function measureDrawingPerformance<T>(
  operation: () => T,
  label?: string
): { result: T; duration: number } {
  const start = performance.now()
  const result = operation()
  const duration = performance.now() - start

  if (label && duration > 16) { // Log slow operations (>16ms)
    console.warn(`Slow drawing operation: ${label} took ${duration.toFixed(2)}ms`)
  }

  return { result, duration }
}

/**
 * Optimized canvas resize with proper scaling
 */
export function optimizedCanvasResize(
  canvas: HTMLCanvasElement,
  width: number,
  height: number,
  pixelRatio = window.devicePixelRatio || 1
): void {
  // Set actual size in memory (scaled up for retina displays)
  canvas.width = width * pixelRatio
  canvas.height = height * pixelRatio

  // Set display size (CSS pixels)
  canvas.style.width = `${width}px`
  canvas.style.height = `${height}px`

  // Scale context for retina displays
  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.scale(pixelRatio, pixelRatio)
    clearCanvasStateCache(ctx) // Reset cached state after scaling
  }
}
