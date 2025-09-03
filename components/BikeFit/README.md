# BikeFit Component Module

A comprehensive React component library for bike fitting analysis using pose detection technology.

## Overview

The BikeFit module provides real-time pose detection and analysis for bike fitting, helping cyclists optimize their position for performance, comfort, and injury prevention.

## Features

- **Real-time pose detection** using MediaPipe
- **Side detection** (left/right profile analysis)
- **Bike type optimization** (road bike vs triathlon/TT)
- **Visual customization** of pose overlays
- **Video recording** with pose analysis
- **Screenshot capture** with pose data
- **Angle measurements** for key bike fit metrics

## Architecture

```
components/BikeFit/
├── index.ts                    # Main module exports
├── types.ts                    # Type re-exports (legacy compatibility)
├── Analysis/                   # Pose detection and analysis
│   ├── index.tsx              # Analysis configuration UI
│   ├── useMediaPipeManager.ts # MediaPipe lifecycle management
│   ├── usePoseDetection.ts    # Legacy pose detection (deprecated)
│   └── usePoseDetectionRealTime.ts # Real-time pose detection
├── Drawing/                    # Canvas rendering utilities
│   └── canvasUtils.ts         # Drawing functions for pose visualization
├── Video/                      # Video capture and streaming
│   ├── index.tsx              # Main video player component
│   ├── VideoControls.tsx      # Video control UI
│   ├── constants.ts           # Video-specific constants
│   ├── hooks.ts               # Camera device management
│   ├── utils.ts               # Video utility functions
│   ├── useVideoStream.ts      # Video streaming logic
│   ├── useVideoRecording.ts   # Video recording functionality
│   └── usePoseVisualization.ts # Pose overlay rendering
└── VisualCustomization/        # Visual settings management
    └── index.tsx              # Visual customization UI
```

## Core Types

### BikeType
- `'road'` - Optimized for comfort and power delivery
- `'triathlon'` - Optimized for aerodynamics and speed

### DetectedSide
- `'left'` - Left side profile detected
- `'right'` - Right side profile detected
- `null` - No valid profile detected

### VisualSettings
Configuration for pose visualization appearance:
- `lineColor` - Color for skeleton connections
- `pointColor` - Color for joint markers
- `lineWidth` - Thickness of skeleton lines
- `pointRadius` - Size of joint markers

## Components

### BikeFitVideoPlayer
Main video component with pose detection and analysis.

**Props:**
- `bikeType: BikeType` - Current bike type
- `detectedSide: DetectedSide` - Currently detected side
- `onDetectedSideChange: (side: DetectedSide) => void` - Side change callback
- `onBikeTypeChange: (type: BikeType) => void` - Bike type change callback
- `visualSettings: VisualSettings` - Visual appearance settings
- `onVisualSettingsChange: (settings: VisualSettings) => void` - Settings change callback

### BikeFitAnalysisConfig
Configuration panel for analysis settings.

**Props:**
- `bikeType: BikeType` - Current bike type
- `detectedSide: DetectedSide` - Currently detected side
- `onBikeTypeChange: (bikeType: BikeType) => void` - Bike type change callback

### BikeFitVisualCustomization
Visual customization controls for pose overlay.

**Props:**
- `settings: VisualSettings` - Current visual settings
- `onSettingsChange: (settings: VisualSettings) => void` - Settings change callback

## Key Hooks

### usePoseDetectionRealTime
Real-time pose detection with MediaPipe.

**Parameters:**
- `video: HTMLVideoElement | null` - Video element to analyze
- `isActive: boolean` - Whether detection is active
- `fps: number` - Target FPS for processing (default: 60)

**Returns:**
- `keypoints: Keypoint[]` - Raw detected keypoints
- `smoothedKeypoints: Keypoint[]` - Smoothed keypoints for visualization
- `detectedSide: DetectedSide` - Detected side profile
- `isMediaPipeLoaded: boolean` - MediaPipe loading status
- `isProcessing: boolean` - Current processing status
- `confidence: number` - Detection confidence (0-1)

### useVideoStream
Video streaming and camera management.

**Returns:**
- `videoRef: RefObject<HTMLVideoElement>` - Video element ref
- `isActive: boolean` - Stream active status
- `error: string | null` - Current error message
- `startCamera: (deviceId: string, resolution: string) => void` - Start camera
- `stopCamera: () => void` - Stop camera

### useCameraDevices
Camera device enumeration and selection.

**Returns:**
- `devices: CameraDevice[]` - Available camera devices
- `selectedDeviceId: string | null` - Currently selected device
- `setSelectedDeviceId: (id: string) => void` - Select device
- `refreshDevices: () => void` - Refresh device list

## Usage Example

```tsx
import {
  BikeFitVideoPlayer,
  BikeFitAnalysisConfig,
  BikeFitVisualCustomization,
  DEFAULT_VISUAL_SETTINGS,
  type BikeType,
  type DetectedSide,
  type VisualSettings
} from '@/components/BikeFit'

function BikeFitAnalysisPage() {
  const [bikeType, setBikeType] = useState<BikeType>('road')
  const [detectedSide, setDetectedSide] = useState<DetectedSide>(null)
  const [visualSettings, setVisualSettings] = useState<VisualSettings>(DEFAULT_VISUAL_SETTINGS)

  return (
    <div className="space-y-6">
      <BikeFitAnalysisConfig
        bikeType={bikeType}
        detectedSide={detectedSide}
        onBikeTypeChange={setBikeType}
      />

      <BikeFitVideoPlayer
        bikeType={bikeType}
        detectedSide={detectedSide}
        onDetectedSideChange={setDetectedSide}
        onBikeTypeChange={setBikeType}
        visualSettings={visualSettings}
        onVisualSettingsChange={setVisualSettings}
      />

      <BikeFitVisualCustomization
        settings={visualSettings}
        onSettingsChange={setVisualSettings}
      />
    </div>
  )
}
```

## Configuration

### MediaPipe Settings
MediaPipe configuration is centralized in `@/lib/bikefit-constants`:

```typescript
export const MEDIAPIPE_CONFIG = {
  MODEL_COMPLEXITY: 1,
  SMOOTH_LANDMARKS: true,
  ENABLE_SEGMENTATION: false,
  MIN_DETECTION_CONFIDENCE: 0.7,
  MIN_TRACKING_CONFIDENCE: 0.5,
} as const
```

### Video Settings
Video capture settings:

```typescript
export const VIDEO_CONFIG = {
  FIXED_FPS: 60,
  DEFAULT_RESOLUTION: '1280x720',
} as const
```

## Error Handling

The module includes comprehensive error handling with user-friendly Spanish messages:

- Camera access errors
- MediaPipe loading errors
- Pose detection failures
- Device enumeration issues

All error messages are centralized in `ERROR_MESSAGES` constant.

## Performance Optimizations

1. **Singleton MediaPipe manager** - Prevents multiple MediaPipe initializations
2. **FPS-adaptive smoothing** - Adjusts smoothing based on processing FPS
3. **Frame skipping** - Prevents processing overlap
4. **Efficient canvas rendering** - Optimized drawing operations
5. **Memory management** - Proper cleanup of video streams and MediaPipe instances

## Browser Compatibility

- **Modern browsers** with MediaPipe support
- **WebRTC** support for camera access
- **Canvas 2D** rendering support
- **ES2020+** JavaScript features

## Dependencies

- React 18+
- MediaPipe Pose 0.5+
- Tailwind CSS (for styling)
- Lucide React (for icons)
- Sonner (for notifications)
