// Core BikeFit types and interfaces

export type BikeType = 'road' | 'triathlon' | 'mountain'
export type DetectedSide = 'right' | 'left' | null
export type SkeletonMode = 'full' | 'side_full'

export interface VisualSettings {
  lineColor: string
  pointColor: string
  lineWidth: number
  pointRadius: number
}

export interface Keypoint {
  x: number
  y: number
  score?: number
  visibility?: number // MediaPipe visibility score (0-1)
  name?: string // Make name optional for compatibility
}

export interface PoseDetectionResult {
  poseLandmarks?: Keypoint[]
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

export interface MediaPipeOptions {
  modelComplexity: number
  smoothLandmarks: boolean
  enableSegmentation: boolean
  minDetectionConfidence: number
  minTrackingConfidence: number
}

export interface MediaPipePose {
  setOptions: (options: MediaPipeOptions) => void
  onResults: (callback: (results: MediaPipeResults) => void) => void
  send: (data: { image: HTMLVideoElement }) => Promise<void>
  close: () => void
}

// Camera and video related types
export interface CameraDevice {
  deviceId: string
  label: string
}

// Drawing and canvas types
export interface DrawingContext {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  video: HTMLVideoElement
}

// Global window types for MediaPipe
declare global {
  interface Window {
    Pose?: new (config: { locateFile: (file: string) => string }) => MediaPipePose
  }
}
