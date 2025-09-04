/**
 * Drawing constants for bike fit analysis
 */

// MediaPipe pose connections for drawing skeleton - Simplified for bike fit analysis
export const POSE_CONNECTIONS = [
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

// Key angles for bike fitting analysis
export const BIKE_FIT_ANGLES = {
  // Knee angle (hip-knee-ankle)
  knee: { points: [23, 25, 27] },
  kneeRight: { points: [24, 26, 28] },

  // Hip angle (shoulder-hip-knee)
  hip: { points: [11, 23, 25] },
  hipRight: { points: [12, 24, 26] },

  // Ankle angle (knee-ankle-foot)
  ankle: { points: [25, 27, 31] },
  ankleRight: { points: [26, 28, 32] },

  // Back angle (shoulder-hip-vertical)
  back: { points: [11, 23] },
  backRight: { points: [12, 24] },
} as const

// Relevant keypoints for bike fit analysis
export const RELEVANT_KEYPOINTS = {
  LEFT: [11, 13, 15, 23, 25, 27, 31] as const,
  RIGHT: [12, 14, 16, 24, 26, 28, 32] as const,
  ALL: [11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28, 31, 32] as const,
} as const

// Side-specific connections
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
} as const

// Drawing configuration
export const DRAWING_CONFIG = {
  ARC_RADIUS: 60,
  MIN_VISIBILITY_THRESHOLD: 0.2,
  HIGH_VISIBILITY_THRESHOLD: 0.6,
  LABEL_PADDING: { x: 8, y: 8 },
  LABEL_FONT: '18px Helvetica',
  OUTLINE_COLOR: 'rgba(255, 255, 255, 1)',
  OUTLINE_WIDTH: 2,
  BACKGROUND_ALPHA: 0.55,
  SECTOR_ALPHA: 0.25,
} as const
