"use client"

import React, { useRef, useState, useEffect } from 'react'
import { toast } from 'sonner'
import show from '@/lib/toast'
import VideoControls from './VideoControls'
import CameraEmptyState from './CameraEmptyState'
import { useCameraDevices } from './hooks'
import { useVideoStream } from './useVideoStream'
import { useVideoRecording } from './useVideoRecording'
import { usePoseDetectionRealTime } from '../Analysis/usePoseDetectionRealTime'
import { usePoseVisualization } from './usePoseVisualization'
import Indicators from './StatusIndicatorVariants'
import { useAngles, AngleTable } from '../Analysis'
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
    show.success('Video grabado', {
      description: 'El video se ha agregado a la galería con los puntos y ángulos de análisis.'
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
      toast.success('Cámara conectada', {
        description: 'La cámara está activa. Puedes grabar o tomar fotos.'
      })
    }
  }, [isActive])

  // Handle camera errors with notifications
  useEffect(() => {
    if (error) {
      toast.dismiss('camera-start')
      toast.error('Error al conectar la cámara', {
        description: (error as string) || 'No se pudo acceder a la cámara. Verifica permisos y dispositivo.'
      })
    }
  }, [error])

  const handleStartCamera = () => {
    if (selectedDeviceId) {
      show.loading('Conectando cámara...', { id: 'camera-start' })
      startCamera(selectedDeviceId, selectedResolution)
    } else {
      show.error('Selecciona una cámara', {
        description: 'Elige un dispositivo de video antes de continuar.'
      })
    }
  }

  const handleStartRecording = () => {
    if (canvasRef.current) {
      startRecording(canvasRef.current, FIXED_FPS)
      show.success('Grabación iniciada', {
        description: 'El video incluirá el análisis de postura en tiempo real.'
      })
    } else {
      show.error('No se puede grabar', {
        description: 'Activa la cámara antes de iniciar la grabación.'
      })
    }
  }

  const handleStopCamera = () => {
    stopCamera()
    show.info('Cámara desconectada', {
      description: 'La sesión de análisis ha finalizado.'
    })
  }

  const handleStopRecording = () => {
    stopRecording()
    show.success('Grabación completada', {
      description: 'El video con el análisis de postura se ha guardado.'
    })
  }

    const handleCaptureScreenshot = async () => {
    if (!isActive || !canvasRef.current) {
      toast.error('No se puede capturar imagen', {
        description: 'Asegúrate de que la cámara esté activa antes de tomar una foto'
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
        show.success('Foto capturada', {
          description: 'La imagen se ha agregado a la galería con los puntos y ángulos de análisis.'
        })
      } else {
        show.error('Error al generar imagen', {
          description: 'No se pudo generar la imagen. Intenta nuevamente.'
        })
      }
    } catch (err) {
      show.error('Error inesperado', {
        description: 'No se pudo completar la captura de imagen.'
      })
      console.error('Error capturing screenshot:', err)
    }
  }

  const handleFlipToggle = () => {
    setIsFlipped(prev => !prev)
  }

  const handleSkeletonModeChange = (mode: SkeletonMode) => {
    setSkeletonMode(mode)
    show.success('Modo de esqueleto cambiado', {
      description: `Ahora mostrando: ${mode}`
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
        show.success('Resolución actualizada', {
          description: `Calidad de video: ${resolution}`
        })
      }, 100)
    }
  }

  return (
    <>
      {/* Main content: Video and Angle Table */}
      <div className="grid gap-5">
        {/* Video Display */}
        <div
          className="z-10 relative mx-auto bg-slate-50/30 border border-slate-200/50 rounded-3xl overflow-hidden backdrop-blur-sm"
          style={{aspectRatio: `${aspectW} / ${aspectH}`, height: `min(80dvh, calc(100vw * ${aspectH} / ${aspectW}))`, maxWidth: '100%'}}
        >
          {/* Status indicators - Top corners - Only show when video is active */}
          {isActive && (
            <>
              {/* Camera active - top left */}
              <Indicators.Camera />

              {/* Recording status - top right */}
              <Indicators.Recording isRecording={isRecording} />

              {/* Bottom-left indicator: side detection or full skeleton */}
              <Indicators.SkeletonMode skeletonMode={skeletonMode} poseDetectedSide={poseDetectedSide} />

              {/* Bottom-right indicator: selected bike type */}
              <Indicators.BikeType bikeType={bikeType} />
            </>
          )}

          {/* Video element */}
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-contain bg-slate-900/5"
            playsInline
            muted
            style={{
              // If video feed is hidden, keep element invisible while canvas still renders skeleton
              opacity: isActive && !isVideoHidden ? 1 : 0,
              transition: 'opacity 500ms',
              transform: isFlipped ? 'scaleX(-1)' : 'scaleX(1)'
            }}
            preload="none"
          />

          {/* Canvas overlay for pose visualization */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{
              opacity: isActive ? 1 : 0,
              transition: 'opacity 500ms'
            }}
          />

          {/* Empty State */}
          {!isActive && (
            <CameraEmptyState
              onStartCamera={handleStartCamera}
              hasSelectedDevice={!!selectedDeviceId}
              error={error as string}
            />
          )}
        </div>

        {/* Media Bar */}
        <MediaBarContainer />

        {/* Video Controls - Below video */}
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

        {/* Angle Table - Below everything */}
        <AngleTable
          angles={angles}
          bikeType={bikeType}
        />
      </div>
    </>
  )
}
