// BikeFit module exports - centralized exports for the entire BikeFit system

// Main components
export { default as BikeFitVideoPlayer } from './Video'
export { default as BikeFitVisualCustomization } from './VisualCustomization'

// Types (re-exported from centralized location)
export type {
  BikeType,
  DetectedSide,
  VisualSettings,
  Keypoint,
  PoseDetectionResult,
  MediaPipeLandmark,
  MediaPipeResults,
  MediaPipeOptions,
  MediaPipePose,
  CameraDevice,
  DrawingContext
} from '@/types/bikefit'

// Utilities (re-exported from lib)
export {
  calculateAngleBetweenPoints,
  hexToRgba
} from '@/lib/bikefit-utils'

// Constants (re-exported from lib)
export {
  VIDEO_CONFIG,
  MEDIAPIPE_CONFIG,
  DEFAULT_VISUAL_SETTINGS,
  FILE_NAMING,
  ERROR_MESSAGES
} from '@/lib/bikefit-constants'

export {
  VISUAL_RANGES,
  COLOR_PALETTE
} from '@/lib/visual-customization-constants'

// Hooks
export { useCameraDevices } from './Video/hooks'
export { useVideoStream } from './Video/useVideoStream'
export { useVideoRecording } from './Video/useVideoRecording'
export { useMediaPipeManager, usePoseDetectionRealTime } from './Analysis'
export { usePoseVisualization } from './Video/usePoseVisualization'
export { useVisualCustomization } from './VisualCustomization/useVisualCustomization'

// Drawing utilities
export {
  POSE_CONNECTIONS,
  BIKE_FIT_ANGLES,
  setupCanvas,
  clearCanvas,
  drawSkeleton,
  drawKeypoint,
  drawConnection,
  drawDetectedSideSkeleton,
  drawBikeFitAngles
} from './Drawing'

// Video utilities
export {
  downloadFile,
  captureVideoFrame,
  captureCanvasFrame,
  stopMediaStream
} from './Video/utils'

// Video constants and configurations
export {
  FIXED_FPS,
  RESOLUTIONS,
  generateScreenshotFilename,
  generateVideoFilename
} from './Video/constants'
