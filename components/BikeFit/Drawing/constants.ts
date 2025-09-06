/**
 * Drawing constants for bike fit analysis
 * Centralized configuration for all drawing operations
 */

// Type definitions for better type safety
export type PoseConnection = readonly [number, number]
export type KeypointIndices = readonly number[]

// MediaPipe pose connections for drawing skeleton - Complete skeleton including hands and feet
export const POSE_CONNECTIONS: readonly PoseConnection[] = [
  // Core body connections
  [11, 12], // shoulders
  [11, 23], [12, 24], // shoulders to hips
  [23, 24], // hips

  // Left arm chain
  [11, 13], [13, 15], // shoulder-elbow-wrist
  [15, 17], [15, 19], [15, 21], // wrist to fingers
  [17, 19], // pinky to index

  // Right arm chain
  [12, 14], [14, 16], // shoulder-elbow-wrist
  [16, 18], [16, 20], [16, 22], // wrist to fingers
  [18, 20], // pinky to index

  // Left leg chain
  [23, 25], [25, 27], // hip-knee-ankle
  [27, 29], [29, 31], // ankle-heel-foot index

  // Right leg chain
  [24, 26], [26, 28], // hip-knee-ankle
  [28, 30], [30, 32], // ankle-heel-foot index
] as const

// Key angles for bike fitting analysis with better type safety
export const BIKE_FIT_ANGLES = {
  // Knee angle (hip-knee-ankle)
  knee: { points: [23, 25, 27] as const },
  kneeRight: { points: [24, 26, 28] as const },

  // Hip angle (shoulder-hip-knee)
  hip: { points: [11, 23, 25] as const },
  hipRight: { points: [12, 24, 26] as const },

  // Ankle angle (knee-ankle-heel)
  ankle: { points: [25, 27, 29] as const },
  ankleRight: { points: [26, 28, 30] as const },

  // Foot angle (ankle-heel-foot index)
  foot: { points: [27, 29, 31] as const },
  footRight: { points: [28, 30, 32] as const },

  // Elbow angle (shoulder-elbow-wrist)
  elbow: { points: [11, 13, 15] as const },
  elbowRight: { points: [12, 14, 16] as const },

  // Back angle (shoulder-hip-vertical)
  back: { points: [11, 23] as const },
  backRight: { points: [12, 24] as const },
} as const

// Relevant keypoints for bike fit analysis - Complete set including hands and feet
export const RELEVANT_KEYPOINTS = {
  LEFT: [11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31] as const,
  RIGHT: [12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32] as const,
  ALL: [11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32] as const,
} as const satisfies Record<string, KeypointIndices>// Side-specific connections - Complete skeleton
export const SIDE_CONNECTIONS = {
  left: [
    [11, 13], [13, 15], // left arm (shoulder-elbow-wrist)
    [15, 17], [15, 19], [15, 21], // wrist to fingers
    [17, 19], // pinky to index
    [11, 23], // left shoulder to left hip
    [23, 25], [25, 27], // left leg (hip-knee-ankle)
    [27, 29], [29, 31], // ankle-heel-foot index
  ] as const,
  right: [
    [12, 14], [14, 16], // right arm (shoulder-elbow-wrist)
    [16, 18], [16, 20], [16, 22], // wrist to fingers
    [18, 20], // pinky to index
    [12, 24], // right shoulder to right hip
    [24, 26], [26, 28], // right leg (hip-knee-ankle)
    [28, 30], [30, 32], // ankle-heel-foot index
  ] as const,
} as const satisfies Record<string, readonly PoseConnection[]>

// Drawing configuration with better organization and documentation
export const DRAWING_CONFIG = {
  // Angle visualization
  ARC_RADIUS: 65,
  ARC_RADIUS_MIN: 40, // Minimum arc radius for small screens
  ARC_RADIUS_MAX: 100, // Maximum arc radius for large screens
  ARC_LINE_WIDTH_RATIO: 0.3,
  ARC_LINE_MIN_WIDTH: 1,

  // Visibility thresholds
  MIN_VISIBILITY_THRESHOLD: 0.2,
  HIGH_VISIBILITY_THRESHOLD: 0.4, // Reduced from 0.6 to 0.4 for better angle detection
  ANGLE_VISIBILITY_THRESHOLD: 0.2, // Lower threshold for angle drawing per request

  // Text and label styling
  LABEL_PADDING: { x: 8, y: 8 } as const,
  LABEL_FONT: '18px Helvetica',

  // Colors and styling
  OUTLINE_COLOR: 'rgba(255, 255, 255, 1)',
  OUTLINE_WIDTH: 2,
  BACKGROUND_ALPHA: 0.55,
  SECTOR_ALPHA: 0.25,
} as const

// Keypoint indices mapping for easier reference - Complete MediaPipe Pose model
export const KEYPOINT_INDICES = {
  // Upper body
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,

  // Hand landmarks
  LEFT_PINKY: 17,
  RIGHT_PINKY: 18,
  LEFT_INDEX: 19,
  RIGHT_INDEX: 20,
  LEFT_THUMB: 21,
  RIGHT_THUMB: 22,

  // Lower body
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,

  // Foot landmarks
  LEFT_HEEL: 29,
  RIGHT_HEEL: 30,
  LEFT_FOOT_INDEX: 31,
  RIGHT_FOOT_INDEX: 32,
} as const

// Human-readable names for each keypoint
export const KEYPOINT_NAMES = {
  11: 'Left Shoulder',
  12: 'Right Shoulder',
  13: 'Left Elbow',
  14: 'Right Elbow',
  15: 'Left Wrist',
  16: 'Right Wrist',
  17: 'Left Pinky',
  18: 'Right Pinky',
  19: 'Left Index',
  20: 'Right Index',
  21: 'Left Thumb',
  22: 'Right Thumb',
  23: 'Left Hip',
  24: 'Right Hip',
  25: 'Left Knee',
  26: 'Right Knee',
  27: 'Left Ankle',
  28: 'Right Ankle',
  29: 'Left Heel',
  30: 'Right Heel',
  31: 'Left Foot Index',
  32: 'Right Foot Index',
} as const

// Skeleton visualization modes - Simplified to two modes
export const SKELETON_MODES = {
  FULL: 'full', // Complete skeleton with hands and feet
  SIDE_FULL: 'side_full', // Single side with full skeleton
} as const

export type SkeletonMode = typeof SKELETON_MODES[keyof typeof SKELETON_MODES]

// Connection groups for visualization
export const CONNECTION_GROUPS = {
  full: {
    connections: POSE_CONNECTIONS,
    keypoints: RELEVANT_KEYPOINTS.ALL,
  },
} as const
