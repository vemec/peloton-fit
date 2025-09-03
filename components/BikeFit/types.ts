// Re-export types from the centralized types folder
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

// Re-export utility functions from lib
export { calculateAngleBetweenPoints, hexToRgba } from '@/lib/bikefit-utils'
