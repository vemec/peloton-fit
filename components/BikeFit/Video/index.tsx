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
import { useAngles, AngleTable } from '../Analysis'
import { FIXED_FPS, generateScreenshotFilename } from './constants'
import { captureCanvasFrame, downloadFile } from './utils'
import { SKELETON_MODES } from '../Drawing'
import type { BikeType, DetectedSide, VisualSettings, SkeletonMode } from '@/types/bikefit'

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
  const [selectedResolution, setSelectedResolution] = useState('1280x720')
  const [isFlipped, setIsFlipped] = useState(false)
  const [skeletonMode, setSkeletonMode] = useState<SkeletonMode>(SKELETON_MODES.SIDE_FULL)
  const [isVideoHidden, setIsVideoHidden] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Custom hooks
  const { devices, selectedDeviceId, setSelectedDeviceId, refreshDevices } = useCameraDevices()
  const { videoRef, isActive, error, startCamera, stopCamera } = useVideoStream()
  const { isRecording, startRecording, stopRecording } = useVideoRecording()

  // Pose detection hook - Real-time MediaPipe processing with adaptive FPS
  const { smoothedKeypoints, detectedSide: poseDetectedSide } = usePoseDetectionRealTime(
    videoRef.current,
    isActive,
    FIXED_FPS // Pass FPS for adaptive processing
  )

  // Angles calculation hook - Get real-time angles from keypoints
  const { angles } = useAngles(smoothedKeypoints, detectedSide)

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
  hideVideoBackground: isVideoHidden
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
        downloadFile(blob, generateScreenshotFilename())
        // Show success
        show.success('Imagen guardada', {
          description: 'La foto se ha guardado con los puntos y ángulos de análisis.'
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
    <div className="space-y-6">
      {/* Main content: Video and Angle Table */}
      <div className="space-y-6">
        {/* Video Display */}
        <div className="relative bg-slate-50/30 border border-slate-200/50 rounded-3xl overflow-hidden backdrop-blur-sm min-h-[691px]">
          {/* Status indicators - Top corners - Only show when video is active */}
          {isActive && (
            <>
              <div className="absolute top-6 left-6 z-10">
                {/* Video status indicator */}
                <div className="relative flex items-center gap-3 bg-black/90 backdrop-blur-md rounded-full px-4 py-2 border border-white/30 shadow-2xl">
                  <div className="relative">
                    <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-lg animate-pulse ring-2 ring-emerald-300/90 ring-offset-2 ring-offset-black/50"></div>
                    <div className="absolute inset-0 w-3 h-3 rounded-full bg-emerald-300 animate-ping opacity-75"></div>
                  </div>
                  <span className="text-emerald-100 text-sm font-medium">Cámara Activa</span>
                </div>
              </div>

              <div className="absolute top-6 right-6 z-10">
                {/* Recording status indicator */}
                <div className="relative flex items-center gap-3 bg-black/90 backdrop-blur-md rounded-full px-4 py-2 border border-white/30 shadow-2xl">
                  <div className="relative">
                    <div className={`w-3 h-3 rounded-full shadow-lg transition-all duration-300 ${
                      isRecording
                        ? 'bg-red-500 animate-pulse ring-2 ring-red-400/90 ring-offset-2 ring-offset-black/50'
                        : 'bg-gray-500 opacity-50'
                    }`}></div>
                    {isRecording && (
                      <div className="absolute inset-0 w-3 h-3 rounded-full bg-red-400 animate-ping opacity-75"></div>
                    )}
                  </div>
                  <span className={`text-sm font-medium transition-all duration-300 ${
                    isRecording ? 'text-red-100' : 'text-gray-400'
                  }`}>
                    {isRecording ? 'Grabando' : 'Sin Grabar'}
                  </span>
                </div>
              </div>

              {/* Side detection indicator - Bottom left - Only show in side mode */}
              {skeletonMode === SKELETON_MODES.SIDE_FULL && (
                <div className="absolute bottom-6 left-6 z-10">
                  <div className="relative flex items-center gap-3 bg-black/90 backdrop-blur-md rounded-full px-4 py-2 border border-white/30 shadow-2xl">
                    <div className="relative">
                      <div className={`w-3 h-3 rounded-full shadow-lg transition-all duration-300 ${
                        poseDetectedSide
                          ? 'bg-blue-400 animate-pulse ring-2 ring-blue-300/90 ring-offset-2 ring-offset-black/50'
                          : 'bg-gray-500 opacity-50'
                      }`}></div>
                      {poseDetectedSide && (
                        <div className="absolute inset-0 w-3 h-3 rounded-full bg-blue-300 animate-ping opacity-75"></div>
                      )}
                    </div>
                    <span className={`text-sm font-medium transition-all duration-300 ${
                      poseDetectedSide ? 'text-blue-100' : 'text-gray-400'
                    }`}>
                      {poseDetectedSide ? `Lado ${poseDetectedSide === 'left' ? 'Izquierdo' : 'Derecho'}` : 'Detectando perfil...'}
                    </span>
                  </div>
                </div>
              )}

              {/* Skeleton mode indicator - Bottom left when in full mode */}
              {skeletonMode === SKELETON_MODES.FULL && (
                <div className="absolute bottom-6 left-6 z-10">
                  <div className="relative flex items-center gap-3 bg-black/90 backdrop-blur-md rounded-full px-4 py-2 border border-white/30 shadow-2xl">
                    <div className="relative">
                      <div className="w-3 h-3 rounded-full bg-green-400 shadow-lg animate-pulse ring-2 ring-green-300/90 ring-offset-2 ring-offset-black/50"></div>
                      <div className="absolute inset-0 w-3 h-3 rounded-full bg-green-300 animate-ping opacity-75"></div>
                    </div>
                    <span className="text-green-100 text-sm font-medium">
                      Esqueleto Completo
                    </span>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Video element */}
          <video
            ref={videoRef}
            className="w-full h-auto object-contain bg-slate-900/5"
            playsInline
            muted
            style={{
              // If video feed is hidden, keep element invisible while canvas still renders skeleton
              opacity: isActive && !isVideoHidden ? 1 : 0,
              transition: 'opacity 500ms',
              aspectRatio: 'auto',
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
              // No transform here since we handle flipping internally in the drawing code
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
          onDeviceChange={setSelectedDeviceId}
          onResolutionChange={handleResolutionChange}
          onBikeTypeChange={onBikeTypeChange}
          onFlipToggle={handleFlipToggle}
          onToggleVideoBackground={handleToggleVideoBackground}
          onVisualSettingsChange={onVisualSettingsChange}
          onSkeletonModeChange={handleSkeletonModeChange}
          onStartCamera={handleStartCamera}
          onStopCamera={handleStopCamera}
          isRecording={isRecording}
          onStartRecording={handleStartRecording}
          onStopRecording={handleStopRecording}
          onCaptureScreenshot={handleCaptureScreenshot}
        />

        {/* Angle Table - Below the video */}
        <AngleTable
          angles={angles}
          bikeType={bikeType}
        />
      </div>
    </div>
  )
}
