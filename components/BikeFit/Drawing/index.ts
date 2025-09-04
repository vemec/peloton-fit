/**
 * Main drawing utilities - exports all drawing functionality
 *
 * This module consolidates all drawing-related functions for bike fit analysis,
 * providing a clean API for pose visualization and angle measurements.
 */

// Core canvas utilities
export {
  setupCanvas,
  clearCanvas,
  hexToRgba,
  drawRoundedRect,
  normalizeAngleDelta,
  isKeypointVisible,
  normalizedToCanvas,
  type DrawingContext,
} from './utils'

// Skeleton and pose drawing
export {
  drawKeypoint,
  drawConnection,
  drawSkeleton,
  drawDetectedSideSkeleton,
  drawPoseDetectionInfo,
} from './skeleton'

// Angle measurement and visualization
export {
  drawAngleMarker,
  drawBikeFitAngles,
} from './angles'

// Constants
export {
  POSE_CONNECTIONS,
  BIKE_FIT_ANGLES,
  RELEVANT_KEYPOINTS,
  SIDE_CONNECTIONS,
  DRAWING_CONFIG,
} from './constants'

// Legacy compatibility - re-export main functions that were in canvasUtils
export { setupCanvas as setupCanvasContext } from './utils'
export { drawSkeleton as drawPoseSkeleton } from './skeleton'
