/**
 * Consolidated constants for the BikeFit application
 * Centralized configuration to eliminate duplication and improve maintainability
 */

// === Video and MediaPipe Configuration ===
export const VIDEO_CONFIG = {
  FIXED_FPS: 60,
  DEFAULT_RESOLUTION: '1280x720' as const,
} as const

export const MEDIAPIPE_CONFIG = {
  MODEL_COMPLEXITY: 0,
  SMOOTH_LANDMARKS: true,
  ENABLE_SEGMENTATION: false,
  MIN_DETECTION_CONFIDENCE: 0.7,
  MIN_TRACKING_CONFIDENCE: 0.5,
  CDN_URL: 'https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5/pose.js' as const,
} as const

// === Visual Settings ===
export const DEFAULT_VISUAL_SETTINGS = {
  lineColor: '#10b981',
  pointColor: '#3b82f6',
  lineWidth: 4,
  pointRadius: 4,
  pointSize: 7,
} as const

export const VISUAL_RANGES = {
  LINE_WIDTH: {
    min: 1,
    max: 15,
    step: 1,
    default: 2,
  },
  POINT_RADIUS: {
    min: 1,
    max: 22,
    step: 1,
    default: 4,
  },
} as const

export const COLOR_PALETTE = [
  '#10b981', // Emerald
  '#3b82f6', // Blue
  '#f59e0b', // Amber
  '#8b5cf6', // Purple
  '#ef4444', // Red
  '#06b6d4', // Cyan
  '#f97316', // Orange
  '#ec4899', // Pink
  '#64748b', // Slate
  '#84cc16'  // Lime
] as const

// === File Naming ===
export const FILE_NAMING = {
  generateScreenshotFilename: () =>
    `bike-fit-pose-analysis-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.png`,
  generateVideoFilename: () =>
    `bike-fit-analysis-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.webm`,
} as const

// === Error Messages ===
export const ERROR_MESSAGES = {
  CAMERA_ACCESS: 'No se pudo acceder a la cámara. Verifica los permisos.',
  CAMERA_SELECTION: 'Elige un dispositivo de video antes de continuar',
  MEDIAPIPE_LOAD: 'Error al cargar MediaPipe. Recarga la página.',
  POSE_DETECTION: 'Error en la detección de pose. Verifica la iluminación.',
} as const

// === Validation Thresholds ===
export const VALIDATION_THRESHOLDS = {
  MIN_KEYPOINT_CONFIDENCE: 0.5,
  MIN_ANGLE_VISIBILITY: 0.4,
  MAX_ANGLE_DEVIATION: 5, // degrees
} as const
