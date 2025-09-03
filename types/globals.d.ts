// Global type declarations for third-party modules
declare module '@tensorflow/tfjs'
declare module '@tensorflow/tfjs-backend-webgl'
declare module '@tensorflow-models/pose-detection'

// MediaPipe global types (also defined in bikefit.ts for module scope)
declare global {
  interface Window {
    Pose?: new (config: { locateFile: (file: string) => string }) => import('./bikefit').MediaPipePose
  }
}

export {}
