// Tipos para el análisis de bike fit
export type BikeType = 'road' | 'triathlon'
export type DetectedSide = 'right' | 'left' | null

export interface VisualSettings {
  lineColor: string
  pointColor: string
  lineWidth: number
  pointRadius: number
  pointSize: number // alias for pointRadius for consistency
}

export interface Keypoint {
  x: number
  y: number
  score?: number
  visibility?: number // MediaPipe visibility score (0-1)
}

export interface PoseDetectionResult {
  poseLandmarks?: Keypoint[]
}

// Helper function to calculate angle between three points
export function calculateAngleBetweenPoints(
  pointA: Keypoint,
  pointB: Keypoint,
  pointC: Keypoint
): number {
  const vectorBA = { x: pointA.x - pointB.x, y: pointA.y - pointB.y }
  const vectorBC = { x: pointC.x - pointB.x, y: pointC.y - pointB.y }

  const dotProduct = vectorBA.x * vectorBC.x + vectorBA.y * vectorBC.y
  const magnitudeBA = Math.sqrt(vectorBA.x ** 2 + vectorBA.y ** 2)
  const magnitudeBC = Math.sqrt(vectorBC.x ** 2 + vectorBC.y ** 2)

  if (magnitudeBA === 0 || magnitudeBC === 0) return 0

  const cosAngle = dotProduct / (magnitudeBA * magnitudeBC)
  const clampedCosAngle = Math.max(-1, Math.min(1, cosAngle))
  const angleRadians = Math.acos(clampedCosAngle)
  const angleDegrees = (angleRadians * 180) / Math.PI

  return angleDegrees
}

// Helper function to convert hex color to rgba
export function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

// MediaPipe types
export interface MediaPipeLandmark {
  x: number
  y: number
  z?: number
  visibility?: number
}

export interface MediaPipeResults {
  poseLandmarks?: MediaPipeLandmark[]
}

export interface MediaPipePose {
  setOptions: (options: MediaPipeOptions) => void
  onResults: (callback: (results: MediaPipeResults) => void) => void
  send: (data: { image: HTMLVideoElement }) => Promise<void>
  close: () => void
}

export interface MediaPipeOptions {
  modelComplexity: number
  smoothLandmarks: boolean
  enableSegmentation: boolean
  minDetectionConfidence: number
  minTrackingConfidence: number
}

declare global {
  interface Window {
    Pose?: new (config: { locateFile: (file: string) => string }) => MediaPipePose
  }
}
