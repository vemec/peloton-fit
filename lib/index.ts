/**
 * Lib Module - Core utilities and constants for BikeFit application
 *
 * This module provides centralized access to all utility functions,
 * constants, and type definitions used throughout the application.
 *
 * @example
 * ```typescript
 * // Import specific utilities
 * import { calculateAngleBetweenPoints, hexToRgba } from '@/lib'
 *
 * // Import all utilities
 * import * as BikeFitUtils from '@/lib'
 * ```
 */

// === Utility Functions ===
export {
  calculateAngleBetweenPoints,
  hexToRgba,
  isKeypointValid,
  calculateDistance,
  normalizeAngle,
  isAngleWithinTolerance,
  createKeypointProxy,
  filterValidKeypoints,
  smoothKeypoints
} from './bikefit-utils'

// === Angle Analysis ===
export {
  PHYSIOLOGICAL_RANGES,
  BIKE_SPECIFIC_RANGES,
  getAngleRanges,
  getBikeSpecificRanges,
  getPhysiologicalRanges,
  getAngleStatus,
  getIndicatorPosition,
  type AngleRange,
  type BikeSpecificRange,
  type PhysiologicalRange
} from './angle-ranges'

// === Constants ===
export {
  VIDEO_CONFIG,
  MEDIAPIPE_CONFIG,
  DEFAULT_VISUAL_SETTINGS,
  VISUAL_RANGES,
  COLOR_PALETTE,
  FILE_NAMING,
  ERROR_MESSAGES,
  VALIDATION_THRESHOLDS
} from './constants'

// === Core Utilities ===
export { cn } from './utils'
export { default as toast, show } from './toast'
