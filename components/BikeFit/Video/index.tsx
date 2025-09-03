"use client"

import React, { useRef, useState, useEffect } from 'react'
import VideoControls from './VideoControls'
import { useCameraDevices } from './hooks'
import { useVideoStream } from './useVideoStream'
import { useVideoRecording } from './useVideoRecording'

export default function VideoPlayer() {
  const [selectedResolution, setSelectedResolution] = useState('1280x720')
  const selectedFps = 30 // Fixed FPS for simplicity
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Custom hooks
  const {
    devices,
    selectedDeviceId,
    setSelectedDeviceId,
    refreshDevices
  } = useCameraDevices()

  const {
    videoRef,
    isActive,
    error,
    startCamera,
    stopCamera
  } = useVideoStream()

  const {
    isRecording,
    startRecording,
    stopRecording
  } = useVideoRecording()

  // Load devices on mount
  useEffect(() => {
    refreshDevices()
  }, [refreshDevices])

  const handleStartCamera = () => {
    if (selectedDeviceId) {
      startCamera(selectedDeviceId, selectedResolution, selectedFps)
    }
  }

  const handleStartRecording = () => {
    if (canvasRef.current) {
      startRecording(canvasRef.current, selectedFps)
    }
  }

  // Capture screenshot from video
  const handleCaptureScreenshot = () => {
    if (!videoRef.current || !isActive) {
      console.warn('Video not active or ref not available')
      return
    }

    const video = videoRef.current
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      console.error('Could not get canvas context')
      return
    }

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Draw current video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Convert to blob and download
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `captura-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.png`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }
    }, 'image/png')
  }

  // Restart camera with new settings when resolution changes
  const handleResolutionChange = (resolution: string) => {
    setSelectedResolution(resolution)
    if (isActive && selectedDeviceId) {
      // Restart camera with new settings
      stopCamera()
      setTimeout(() => {
        startCamera(selectedDeviceId, resolution, selectedFps)
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
            aspectRatio: 'auto'
          }}
          preload="none"
        />

        {/* Canvas overlay for future pose visualization */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{
            opacity: isActive ? 1 : 0,
            transition: 'opacity 300ms'
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
        onDeviceChange={setSelectedDeviceId}
        onResolutionChange={handleResolutionChange}
        onStartCamera={handleStartCamera}
        onStopCamera={stopCamera}
        isRecording={isRecording}
        onStartRecording={handleStartRecording}
        onStopRecording={stopRecording}
        onCaptureScreenshot={handleCaptureScreenshot}
      />
    </div>
  )
}
