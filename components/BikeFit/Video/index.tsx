"use client"

import React, { useRef, useState, useEffect } from 'react'
import { toast } from 'sonner'
import VideoControls from './VideoControls'
import { useCameraDevices } from './hooks'
import { useVideoStream } from './useVideoStream'
import { useVideoRecording } from './useVideoRecording'
import { usePoseDetectionRealTime } from '../Analysis/usePoseDetectionRealTime'
import { usePoseVisualization } from './usePoseVisualization'
import { FIXED_FPS, generateScreenshotFilename } from './constants'
import { captureCanvasFrame, downloadFile } from './utils'
import type { BikeType, DetectedSide, VisualSettings } from '@/types/bikefit'

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

  // Pose visualization hook - use smoothed keypoints for better visual quality
  usePoseVisualization({
    canvas: canvasRef.current,
    video: videoRef.current,
    keypoints: smoothedKeypoints, // Use smoothed keypoints instead of raw
    detectedSide,
    visualSettings,
    isActive,
    isFlipped
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
      toast.success('✅ Cámara conectada correctamente', {
        description: 'Ya puedes comenzar a grabar o tomar fotos'
      })
    }
  }, [isActive])

  // Handle camera errors with notifications
  useEffect(() => {
    if (error) {
      toast.dismiss('camera-start')
      toast.error('❌ Error de conexión', {
        description: error || 'No se pudo acceder a la cámara. Verifica los permisos.'
      })
    }
  }, [error])

  const handleStartCamera = () => {
    if (selectedDeviceId) {
      toast.loading('🎥 Conectando con la cámara...', {
        id: 'camera-start'
      })
      startCamera(selectedDeviceId, selectedResolution)
    } else {
      toast.error('❌ Selecciona una cámara', {
        description: 'Elige un dispositivo de video antes de continuar'
      })
    }
  }

  const handleStartRecording = () => {
    if (canvasRef.current) {
      startRecording(canvasRef.current, FIXED_FPS)
      toast.success('🔴 Grabación iniciada', {
        description: 'El video incluirá todos los análisis de pose en tiempo real'
      })
    } else {
      toast.error('❌ No se puede grabar', {
        description: 'Asegúrate de que la cámara esté activa primero'
      })
    }
  }

  const handleStopCamera = () => {
    stopCamera()
    toast.info('📷 Cámara desconectada', {
      description: 'La sesión de análisis ha terminado'
    })
  }

  const handleStopRecording = () => {
    stopRecording()
    toast.success('⏹️ Grabación completada', {
      description: 'Tu video con análisis de pose ha sido guardado'
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
      // Show loading toast
      const loadingToast = toast.loading('📸 Capturando imagen con análisis de pose...')

      // Capture from canvas which includes pose overlay
      const blob = await captureCanvasFrame(canvasRef.current)
      if (blob) {
        downloadFile(blob, generateScreenshotFilename())

        // Dismiss loading and show success
        toast.dismiss(loadingToast)
        toast.success('✅ Imagen capturada exitosamente', {
          description: 'Tu foto incluye todos los puntos y ángulos de análisis'
        })
      } else {
        toast.dismiss(loadingToast)
        toast.error('❌ Error al generar imagen', {
          description: 'Inténtalo de nuevo en unos segundos'
        })
      }
    } catch (error) {
      toast.error('❌ Error inesperado', {
        description: 'No se pudo completar la captura de imagen'
      })
      console.error('Error capturing screenshot:', error)
    }
  }

  const handleFlipToggle = () => {
    setIsFlipped(prev => !prev)
  }

  const handleResolutionChange = (resolution: string) => {
    setSelectedResolution(resolution)
    if (isActive && selectedDeviceId) {
      toast.loading('🎥 Aplicando nueva resolución...', { id: 'resolution-change' })
      stopCamera()
      setTimeout(() => {
        startCamera(selectedDeviceId, resolution)
        toast.dismiss('resolution-change')
        toast.success('✅ Resolución actualizada', {
          description: `Calidad de video cambiada a ${resolution}`
        })
      }, 100)
    }
  }

  return (
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

            {/* Side detection indicator - Bottom left */}
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
                  {poseDetectedSide ? `Lado ${poseDetectedSide === 'left' ? 'Izquierdo' : 'Derecho'}` : 'Detectando...'}
                </span>
              </div>
            </div>
          </>
        )}

        {/* Video element */}
        <video
          ref={videoRef}
          className="w-full h-auto object-contain bg-slate-900/5"
          playsInline
          muted
          style={{
            opacity: isActive ? 1 : 0,
            transition: 'opacity 300ms',
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
            transition: 'opacity 300ms'
            // No transform here since we handle flipping internally in the drawing code
          }}
        />

        {/* Empty State */}
        {!isActive && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm text-slate-500">
            <div className="text-center space-y-6 p-8">
              <div className="text-8xl opacity-30">📹</div>
              <div className="space-y-3">
                <h3 className="text-xl font-medium text-slate-700">Cámara No Activa</h3>
                <p className="text-base text-slate-600 max-w-lg leading-relaxed">
                  Inicia tu cámara para comenzar el análisis de bike fit. Colócate de lado a la cámara en tu posición de ciclismo.
                </p>
              </div>
              <div className="flex flex-col gap-4 pt-8">
                <div className="flex items-center gap-3 text-sm text-slate-500">
                  <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                  <span>Selecciona tu cámara</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-500">
                  <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                  <span>Haz clic en &quot;Iniciar Cámara&quot;</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-500">
                  <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                  <span>Comienza a grabar cuando estés listo</span>
                </div>
              </div>
            </div>
          </div>
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
        visualSettings={visualSettings}
        onDeviceChange={setSelectedDeviceId}
        onResolutionChange={handleResolutionChange}
        onBikeTypeChange={onBikeTypeChange}
        onFlipToggle={handleFlipToggle}
        onVisualSettingsChange={onVisualSettingsChange}
        onStartCamera={handleStartCamera}
        onStopCamera={handleStopCamera}
        isRecording={isRecording}
        onStartRecording={handleStartRecording}
        onStopRecording={handleStopRecording}
        onCaptureScreenshot={handleCaptureScreenshot}
      />
    </div>
  )
}
