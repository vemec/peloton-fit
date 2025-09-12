"use client"

import React, { useRef, useState, useEffect } from 'react'
import { toast } from 'sonner'
import show from '@/lib/toast'
import VideoControls from './Controls'
import { useCameraDevices } from './hooks'
import { useVideoStream } from './useVideoStream'
import { useVideoRecording } from './useVideoRecording'
import { usePoseDetectionRealTime } from '../Analysis/usePoseDetectionRealTime'
import { usePoseVisualization } from './usePoseVisualization'
// CameraEmptyState and Indicators moved into VideoDisplay
import { useAngles, AngleTable } from '../Analysis'
import VideoDisplay from './VideoDisplay'
import { FIXED_FPS, generateScreenshotFilename } from './constants'
import { captureCanvasFrame } from './utils'
import { SKELETON_MODES } from '../Drawing'
import { MediaManager, useMedia, MediaBarContainer } from '../Media'
import type { BikeType, DetectedSide, VisualSettings, SkeletonMode } from '@/types/bikefit'
import type { OverlayVisibility } from '@/types/overlay'

interface BikeFitVideoPlayerProps {
  bikeType: BikeType
  detectedSide: DetectedSide
  onDetectedSideChange: (side: DetectedSide) => void
  onBikeTypeChange: (type: BikeType) => void
  visualSettings: VisualSettings
  onVisualSettingsChange: (settings: VisualSettings) => void
}

export default function BikeFitVideoPlayer({
  bikeType,
  detectedSide,
  onDetectedSideChange,
  onBikeTypeChange,
  visualSettings,
  onVisualSettingsChange
}: BikeFitVideoPlayerProps) {
  return (
    <MediaManager>
      <BikeFitVideoPlayerContent
        bikeType={bikeType}
        detectedSide={detectedSide}
        onDetectedSideChange={onDetectedSideChange}
        onBikeTypeChange={onBikeTypeChange}
        visualSettings={visualSettings}
        onVisualSettingsChange={onVisualSettingsChange}
      />
    </MediaManager>
  )
}

function BikeFitVideoPlayerContent({
  bikeType,
  detectedSide,
  onDetectedSideChange,
  onBikeTypeChange,
  visualSettings,
  onVisualSettingsChange
}: BikeFitVideoPlayerProps) {
  const [selectedResolution, setSelectedResolution] = useState('1280x720')
  const [isFlipped, setIsFlipped] = useState(false)
  const [skeletonMode, setSkeletonMode] = useState<SkeletonMode>(SKELETON_MODES.SIDE_FULL)
  const [isVideoHidden, setIsVideoHidden] = useState(false)
  const [overlayVisibility, setOverlayVisibility] = useState<OverlayVisibility>({
    angles: { elbow: true, shoulder: true, hip: true, knee: true, ankle: true },
  })
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Media management
  const { addMedia } = useMedia()

  // Derive container aspect ratio from selected resolution (fallback 16/9)
  const [aspectW, aspectH] = React.useMemo(() => {
    const [wStr, hStr] = (selectedResolution || '').split('x')
    const w = Number(wStr)
    const h = Number(hStr)
    if (!w || !h) return [16, 9]
    return [w, h]
  }, [selectedResolution])

  // Video recording callback
  const handleVideoRecordingComplete = React.useCallback((blob: Blob, filename: string) => {
    addMedia(blob, filename, 'video')
    // Show success notification
    show.success('Video recorded', {
      description: 'The video has been added to the gallery with analysis points and angles.'
    })
  }, [addMedia])

  // Custom hooks
  const { devices, selectedDeviceId, setSelectedDeviceId, refreshDevices } = useCameraDevices()
  const { videoRef, isActive, error, startCamera, stopCamera } = useVideoStream()
  const { isRecording, startRecording, stopRecording } = useVideoRecording({
    onRecordingComplete: handleVideoRecordingComplete
  })

  // Pose detection hook - Real-time MediaPipe processing with adaptive FPS
  const { smoothedKeypoints, detectedSide: poseDetectedSide } = usePoseDetectionRealTime(
    videoRef.current,
    isActive,
    FIXED_FPS // Pass FPS for adaptive processing
  )

  // Angles calculation hook - Get real-time angles from keypoints
  const { angles } = useAngles({
    keypoints: smoothedKeypoints,
    detectedSide,
    videoWidth: aspectW,
    videoHeight: aspectH
  })

  // Pose visualization hook - use smoothed keypoints for better visual quality
  usePoseVisualization({
    canvas: canvasRef.current,
    video: videoRef.current,
    keypoints: smoothedKeypoints, // Use smoothed keypoints instead of raw
    detectedSide,
    visualSettings,
    isActive,
    isFlipped,
    skeletonMode,
    hideVideoBackground: isVideoHidden,
    overlayVisibility,
  })

  // Update detected side when pose detection changes
  useEffect(() => {
    if (poseDetectedSide !== detectedSide) {
      onDetectedSideChange(poseDetectedSide)
    }
  }, [poseDetectedSide, detectedSide, onDetectedSideChange])

  // Load devices on mount
  useEffect(() => {
    refreshDevices()
  }, [refreshDevices])

  // Handle camera state changes with notifications
  useEffect(() => {
    if (isActive) {
      toast.dismiss('camera-start')
      toast.success('Camera connected', {
        description: 'The camera is active. You can record or take photos.'
      })
    }
  }, [isActive])

  // Handle camera errors with notifications
  useEffect(() => {
    if (error) {
      toast.dismiss('camera-start')
      toast.error('Error connecting camera', {
        description: (error as string) || 'Could not access camera. Check permissions and device.'
      })
    }
  }, [error])

  const handleStartCamera = () => {
    if (selectedDeviceId) {
      show.loading('Connecting camera...', { id: 'camera-start' })
      startCamera(selectedDeviceId, selectedResolution)
    } else {
      show.error('Select a camera', {
        description: 'Choose a video device before continuing.'
      })
    }
  }

  const handleStartRecording = () => {
    if (canvasRef.current) {
      startRecording(canvasRef.current, FIXED_FPS)
      show.success('Recording started', {
        description: 'The video will include real-time posture analysis.'
      })
    } else {
      show.error('Cannot record', {
        description: 'Activate the camera before starting recording.'
      })
    }
  }

  const handleStopCamera = () => {
    stopCamera()
    show.info('Camera disconnected', {
      description: 'The analysis session has ended.'
    })
  }

  const handleStopRecording = () => {
    stopRecording()
  }

    const handleCaptureScreenshot = async () => {
    if (!isActive || !canvasRef.current) {
      toast.error('Cannot capture image', {
        description: 'Make sure the camera is active before taking a photo'
      })
      return
    }

    try {
      // Capture from canvas which includes pose overlay
      const blob = await captureCanvasFrame(canvasRef.current)
      if (blob) {
        // Add photo to the manager instead of downloading directly
        const filename = generateScreenshotFilename()
        addMedia(blob, filename, 'photo')

        // Show success
        show.success('Photo captured', {
          description: 'The image has been added to the gallery with analysis points and angles.'
        })
      } else {
        show.error('Error generating image', {
          description: 'Could not generate the image. Try again.'
        })
      }
    } catch (err) {
      show.error('Unexpected error', {
        description: 'Could not complete image capture.'
      })
      console.error('Error capturing screenshot:', err)
    }
  }

  const handleFlipToggle = () => {
    setIsFlipped(prev => !prev)
  }

  const handleSkeletonModeChange = (mode: SkeletonMode) => {
    setSkeletonMode(mode)
    const modeDescriptions = {
      [SKELETON_MODES.FULL]: 'Full body skeleton (both sides)',
      [SKELETON_MODES.SIDE_FULL]: 'Single side skeleton (detected side only)'
    }
    show.success('Skeleton mode changed', {
      description: modeDescriptions[mode] || `Now showing: ${mode}`
    })
  }

  const handleToggleVideoBackground = () => {
    setIsVideoHidden((prev) => !prev)
  }

  const handleResolutionChange = (resolution: string) => {
    setSelectedResolution(resolution)
    if (isActive && selectedDeviceId) {
      stopCamera()
      setTimeout(() => {
        startCamera(selectedDeviceId, resolution)
        show.success('Resolution updated', {
          description: `Video quality: ${resolution}`
        })
      }, 100)
    }
  }

  // When the user changes the selected camera device while the camera is active,
  // restart the stream automatically so the new device takes effect.
  useEffect(() => {
    // If there's no device selected, stop the camera
    if (!selectedDeviceId) {
      if (isActive) {
        stopCamera()
        show.info('Camera disconnected', { description: 'No camera selected.' })
      }
      return
    }

    // If the camera is active, swap to the newly selected device
    if (isActive) {
      // Provide quick feedback
      show.loading('Switching camera...', { id: 'camera-switch' })

      // Stop then restart with a small delay to ensure tracks are released
      stopCamera()
      const t = window.setTimeout(() => {
        startCamera(selectedDeviceId, selectedResolution)
        show.success('Camera updated', { description: 'Now using the selected camera.' })
        toast.dismiss('camera-switch')
      }, 100)

      return () => {
        clearTimeout(t)
      }
    }
    // If not active, do nothing (user can press play to start the selected device)
  }, [selectedDeviceId, isActive, selectedResolution, startCamera, stopCamera])


  return (
    <>
      {/* Video Display */}
      <VideoDisplay
        videoRef={videoRef}
        canvasRef={canvasRef}
        isActive={isActive}
        isVideoHidden={isVideoHidden}
        isFlipped={isFlipped}
        aspectW={aspectW}
        aspectH={aspectH}
        isRecording={isRecording}
        poseDetectedSide={poseDetectedSide}
        skeletonMode={skeletonMode}
        bikeType={bikeType}
        handleStartCamera={handleStartCamera}
        selectedDeviceId={selectedDeviceId}
        error={error as string}
      />

      {/* Media Bar */}
      <MediaBarContainer />

      {/* Video Controls - Below video */}
      {
        isActive && (
          <VideoControls
            devices={devices}
            selectedDeviceId={selectedDeviceId}
            selectedResolution={selectedResolution}
            isActive={isActive}
            error={error}
            bikeType={bikeType}
            isFlipped={isFlipped}
            isVideoHidden={isVideoHidden}
            visualSettings={visualSettings}
            skeletonMode={skeletonMode}
            detectedSide={detectedSide}
            overlayVisibility={overlayVisibility}
            onDeviceChange={setSelectedDeviceId}
            onResolutionChange={handleResolutionChange}
            onBikeTypeChange={onBikeTypeChange}
            onFlipToggle={handleFlipToggle}
            onToggleVideoBackground={handleToggleVideoBackground}
            onVisualSettingsChange={onVisualSettingsChange}
            onSkeletonModeChange={handleSkeletonModeChange}
            onOverlayVisibilityChange={setOverlayVisibility}
            onStartCamera={handleStartCamera}
            onStopCamera={handleStopCamera}
            isRecording={isRecording}
            onStartRecording={handleStartRecording}
            onStopRecording={handleStopRecording}
            onCaptureScreenshot={handleCaptureScreenshot}
          />
        )
      }

      {
      isActive && (
          <AngleTable angles={angles} bikeType={bikeType} />
        )
      }
    </>
  )
}
