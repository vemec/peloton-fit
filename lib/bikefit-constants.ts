// BikeFit application constants

// Video recording and streaming
export const VIDEO_CONFIG = {
  FIXED_FPS: 60,
  DEFAULT_RESOLUTION: '1280x720' as const,
} as const

// MediaPipe configuration
export const MEDIAPIPE_CONFIG = {
  MODEL_COMPLEXITY: 1,
  SMOOTH_LANDMARKS: true,
  ENABLE_SEGMENTATION: false,
  MIN_DETECTION_CONFIDENCE: 0.7,
  MIN_TRACKING_CONFIDENCE: 0.5,
  CDN_URL: 'https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5/pose.js' as const,
} as const

// Visual settings defaults
export const DEFAULT_VISUAL_SETTINGS = {
  lineColor: '#10b981', // Emerald green
  pointColor: '#f43f5e', // Rose red
  lineWidth: 2,
  pointRadius: 4,
  pointSize: 4, // alias for consistency
} as const

// File naming
export const FILE_NAMING = {
  generateScreenshotFilename: () =>
    `bike-fit-pose-analysis-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.png`,
  generateVideoFilename: () =>
    `bike-fit-analysis-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.webm`,
} as const

// Error messages
export const ERROR_MESSAGES = {
  CAMERA_ACCESS: 'No se pudo acceder a la cámara. Verifica los permisos.',
  CAMERA_SELECTION: 'Elige un dispositivo de video antes de continuar',
  MEDIAPIPE_LOAD: 'Error al cargar MediaPipe. Recarga la página.',
  POSE_DETECTION: 'Error en la detección de pose. Verifica la iluminación.',
} as const
