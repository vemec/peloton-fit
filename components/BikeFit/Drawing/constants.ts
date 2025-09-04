/**
 * Drawing constants for bike fit analysis
 * Centralized configuration for all drawing operations
 */

// Type definitions for better type safety
export type PoseConnection = readonly [number, number]
export type KeypointIndices = readonly number[]

// MediaPipe pose connections for drawing skeleton - Simplified for bike fit analysis
export const POSE_CONNECTIONS: readonly PoseConnection[] = [
  // Core body connections for bike fit
  [11, 12], // shoulders
  [11, 13], [13, 15], // left arm
  [12, 14], [14, 16], // right arm
  [11, 23], [12, 24], // shoulders to hips
  [23, 24], // hips
  [23, 25], [25, 27], // left leg (hip-knee-ankle)
  [24, 26], [26, 28], // right leg (hip-knee-ankle)
  [27, 31], // left ankle to foot
  [28, 32], // right ankle to foot
] as const

// Key angles for bike fitting analysis with better type safety
export const BIKE_FIT_ANGLES = {
  // Knee angle (hip-knee-ankle)
  knee: { points: [23, 25, 27] as const },
  kneeRight: { points: [24, 26, 28] as const },

  // Hip angle (shoulder-hip-knee)
  hip: { points: [11, 23, 25] as const },
  hipRight: { points: [12, 24, 26] as const },

  // Ankle angle (knee-ankle-foot)
  ankle: { points: [25, 27, 31] as const },
  ankleRight: { points: [26, 28, 32] as const },

  // Back angle (shoulder-hip-vertical)
  back: { points: [11, 23] as const },
  backRight: { points: [12, 24] as const },
} as const

// Relevant keypoints for bike fit analysis
export const RELEVANT_KEYPOINTS = {
  LEFT: [11, 13, 15, 23, 25, 27, 31] as const,
  RIGHT: [12, 14, 16, 24, 26, 28, 32] as const,
  ALL: [11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28, 31, 32] as const,
} as const satisfies Record<string, KeypointIndices>

// Side-specific connections with improved type safety
export const SIDE_CONNECTIONS = {
  left: [
    [11, 13], [13, 15], // left arm (shoulder-elbow-wrist)
    [11, 23], // left shoulder to left hip
    [23, 25], [25, 27], // left leg (hip-knee-ankle)
    [27, 31], // left ankle to left foot
  ] as const,
  right: [
    [12, 14], [14, 16], // right arm (shoulder-elbow-wrist)
    [12, 24], // right shoulder to right hip
    [24, 26], [26, 28], // right leg (hip-knee-ankle)
    [28, 32], // right ankle to right foot
  ] as const,
} as const satisfies Record<'left' | 'right', readonly PoseConnection[]>

// Drawing configuration with better organization and documentation
export const DRAWING_CONFIG = {
  // Angle visualization
  ARC_RADIUS: 65,
  ARC_LINE_WIDTH_RATIO: 0.3,
  ARC_LINE_MIN_WIDTH: 1,

  // Visibility thresholds
  MIN_VISIBILITY_THRESHOLD: 0.2,
  HIGH_VISIBILITY_THRESHOLD: 0.6,

  // Text and label styling
  LABEL_PADDING: { x: 8, y: 8 } as const,
  LABEL_FONT: '18px Helvetica',

  // Colors and styling
  OUTLINE_COLOR: 'rgba(255, 255, 255, 1)',
  OUTLINE_WIDTH: 2,
  BACKGROUND_ALPHA: 0.55,
  SECTOR_ALPHA: 0.25,
} as const

// Keypoint indices mapping for easier reference
export const KEYPOINT_INDICES = {
  // Upper body
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,

  // Lower body
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
  LEFT_FOOT: 31,
  RIGHT_FOOT: 32,
} as const
