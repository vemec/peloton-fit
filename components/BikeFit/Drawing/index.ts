/**
 * Drawing Module - Main exports for bike fit visualization
 *
 * This module provides a comprehensive set of utilities for drawing pose detection
 * and bike fit analysis overlays on canvas elements. All functions are optimized
 * for performance and follow TypeScript best practices.
 *
 * Note: Import utilities from @/lib/bikefit-utils directly rather than through re-exports
 *
 * @module Drawing
 */

// === Core Canvas Utilities ===
export {
  setupCanvas,
  clearCanvas,
  drawRoundedRect,
  normalizeAngleDelta,
  normalizedToCanvas,
  type DrawingContext,
} from './utils'

// === Skeleton and Pose Drawing ===
export {
  drawKeypoint,
  drawConnection,
  drawSkeleton,
  drawDetectedSideSkeleton,
  drawSkeletonWithMode,
} from './skeleton'

// === Angle Measurement and Visualization ===
export {
  drawAngleMarker,
  drawBikeFitAngles,
} from './angles'

// === Performance Optimization ===
export {
  setCanvasStyle,
  clearCanvasStateCache,
  batchDrawKeypoints,
  batchDrawConnections,
  fpsCounter,
  measureDrawingPerformance,
  optimizedCanvasResize,
  type DrawingMetrics,
} from './performance'

// === Constants and Configuration ===
export {
  POSE_CONNECTIONS,
  BIKE_FIT_ANGLES,
  RELEVANT_KEYPOINTS,
  SIDE_CONNECTIONS,
  DRAWING_CONFIG,
  KEYPOINT_INDICES,
  KEYPOINT_NAMES,
  SKELETON_MODES,
  CONNECTION_GROUPS,
  type PoseConnection,
  type KeypointIndices,
  type SkeletonMode,
} from './constants'

// === Legacy Compatibility ===
// Maintained for backward compatibility with existing code
export { setupCanvas as setupCanvasContext } from './utils'
export { drawSkeleton as drawPoseSkeleton } from './skeleton'
