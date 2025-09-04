# Analysis Module

This module handles bike fit analysis configuration and real-time pose detection for the BikeFit AI application.

## 📁 File Structure

```
Analysis/
├── index.ts                     # Module exports
├── useMediaPipeManager.ts       # MediaPipe loading manager
├── usePoseDetectionRealTime.ts  # Real-time pose detection
└── README.md                    # This documentation
```

## 🎣 Hooks

### useMediaPipeManager
Centralizes MediaPipe loading and state management.

**Features:**
- Singleton pattern to prevent multiple loads
- Global state management
- Error handling and recovery

**Usage:**
```ts
import { useMediaPipeManager } from '@/components/BikeFit/Analysis'

const { isLoaded, isLoading, error, loadMediaPipe } = useMediaPipeManager()
```

### usePoseDetectionRealTime
Real-time pose detection with FPS-adaptive smoothing.

**Features:**
- Real-time MediaPipe pose detection
- FPS-adaptive smoothing for optimal performance
- Automatic side detection (left/right cyclist profile)
- Confidence scoring
- Error recovery and re-initialization

**Usage:**
```ts
import { usePoseDetectionRealTime } from '@/components/BikeFit/Analysis'

const {
  keypoints,
  smoothedKeypoints,
  detectedSide,
  confidence,
  isProcessing
} = usePoseDetectionRealTime(videoElement, isActive, 60)
```

## 🔧 Configuration

The module uses configuration from:
- `@/lib/bikefit-constants` - MediaPipe and performance settings
- `@/types/bikefit` - TypeScript type definitions

## 🎯 Key Features

1. **Performance Optimized**: FPS-adaptive processing and smoothing
2. **Error Resilient**: Automatic recovery from MediaPipe errors
3. **Type Safe**: Full TypeScript coverage
4. **Modular**: Clean separation of concerns
5. **Documented**: Comprehensive JSDoc documentation

## 🚀 Recent Improvements

- ✅ Removed deprecated `usePoseDetection.ts`
- ✅ Removed unused `BikeFitAnalysisConfig.tsx` component
- ✅ Added comprehensive JSDoc documentation
- ✅ Created clean module exports in `index.ts`
- ✅ Improved TypeScript interface documentation
