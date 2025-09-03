import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Camera, Settings, Monitor, Smartphone, Tv, Check, Video } from 'lucide-react'
import type { CameraDevice } from './hooks'

interface VideoControlsProps {
  // Camera controls
  devices: CameraDevice[]
  selectedDeviceId: string | null
  selectedResolution: string
  isActive: boolean
  error: string | null
  onDeviceChange: (deviceId: string | null) => void
  onResolutionChange: (resolution: string) => void
  onStartCamera: () => void
  onStopCamera: () => void

  // Recording controls
  isRecording: boolean
  onStartRecording: () => void
  onStopRecording: () => void

  // Screenshot controls
  onCaptureScreenshot: () => void
}

export default function VideoControls({
  devices,
  selectedDeviceId,
  selectedResolution,
  isActive,
  error,
  onDeviceChange,
  onResolutionChange,
  onStartCamera,
  onStopCamera,
  isRecording,
  onStartRecording,
  onStopRecording,
  onCaptureScreenshot
}: VideoControlsProps) {
  const [recordingTime, setRecordingTime] = useState(0)
  const [cameraCapabilities, setCameraCapabilities] = useState<{
    resolutions: Array<{value: string, label: string, badge?: string}>,
    frameRates: Array<{value: number, label: string, badge?: string}>
  }>({
    resolutions: [
      { value: "640x480", label: "640×480", badge: "Basic" },
      { value: "1280x720", label: "1280×720", badge: "HD" },
      { value: "1920x1080", label: "1920×1080", badge: "Full HD" }
    ],
    frameRates: [
      { value: 15, label: "15 FPS", badge: "Basic" },
      { value: 24, label: "24 FPS", badge: "Cinema" },
      { value: 30, label: "30 FPS", badge: "Standard" },
      { value: 60, label: "60 FPS", badge: "⚡ Performance" }
    ]
  })

  // Detect camera capabilities when device changes
  useEffect(() => {
    const detectCapabilities = async () => {
      if (!selectedDeviceId) return

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { deviceId: selectedDeviceId }
        })

        const videoTrack = stream.getVideoTracks()[0]
        const capabilities = videoTrack.getCapabilities()

        // Stop the test stream
        stream.getTracks().forEach(track => track.stop())

        // Update available resolutions based on capabilities
        const supportedResolutions = []
        const testResolutions = [
          { value: "640x480", label: "640×480", badge: "Basic", width: 640, height: 480 },
          { value: "1280x720", label: "1280×720", badge: "HD", width: 1280, height: 720 },
          { value: "1920x1080", label: "1920×1080", badge: "Full HD", width: 1920, height: 1080 }
        ]

        for (const res of testResolutions) {
          if (capabilities.width && capabilities.height) {
            if (res.width <= (capabilities.width.max || 9999) &&
                res.height <= (capabilities.height.max || 9999)) {
              supportedResolutions.push(res)
            }
          } else {
            // If we can't detect capabilities, include all resolutions
            supportedResolutions.push(res)
          }
        }

        // Update available frame rates
        const supportedFrameRates = []
        const testFrameRates = [
          { value: 15, label: "15 FPS", badge: "Basic" },
          { value: 24, label: "24 FPS", badge: "Cinema" },
          { value: 30, label: "30 FPS", badge: "Standard" },
          { value: 60, label: "60 FPS", badge: "⚡ Performance" }
        ]

        for (const fps of testFrameRates) {
          if (capabilities.frameRate) {
            if (fps.value <= (capabilities.frameRate.max || 60)) {
              supportedFrameRates.push(fps)
            }
          } else {
            supportedFrameRates.push(fps)
          }
        }

        setCameraCapabilities({
          resolutions: supportedResolutions,
          frameRates: supportedFrameRates
        })

      } catch (error) {
        console.error('Error detecting camera capabilities:', error)
        // Keep default capabilities on error
      }
    }

    detectCapabilities()
  }, [selectedDeviceId])

  // Timer for recording
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    } else {
      setRecordingTime(0)
    }
    return () => clearInterval(interval)
  }, [isRecording])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Horizontal control bar */}
      <div className="bg-gray-800/90 backdrop-blur-sm rounded-full px-6 py-3 inline-flex items-center justify-center gap-4 shadow-lg mx-auto">

        {/* Camera selector */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="w-12 h-12 rounded-full bg-slate-700/50 hover:bg-slate-600/60 focus:bg-slate-500/70 text-slate-200 hover:text-white border-2 border-slate-600/40 hover:border-slate-500/60 focus:border-slate-400/70 cursor-pointer transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-slate-400/50 focus:ring-offset-2 focus:ring-offset-gray-800 shadow-lg hover:shadow-xl"
            >
              <Video className="w-5 h-5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-60 p-3 bg-white rounded-xl shadow-xl border border-gray-200">
            <div className="space-y-1">
              {devices.length === 0 ? (
                <div className="p-3 text-center">
                  <p className="text-sm text-gray-500">Sin cámaras</p>
                </div>
              ) : (
                devices.map(device => {
                  const cleanLabel = device.label
                    .replace(/\s*\([^)]*\)$/, '') // Remove ID in parentheses at the end
                    .replace(/\s+/g, ' ') // Clean multiple spaces
                    .trim()

                  const isSelected = selectedDeviceId === device.deviceId

                  return (
                    <button
                      key={device.deviceId}
                      onClick={() => onDeviceChange(device.deviceId)}
                      className={`w-full p-3 rounded-lg transition-all duration-200 text-left flex items-center gap-3 ${
                        isSelected
                          ? 'bg-blue-50 text-blue-900'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Camera className={`w-4 h-4 ${isSelected ? 'text-blue-600' : 'text-gray-400'}`} />
                      <span className="text-sm font-medium">
                        {cleanLabel || 'Cámara sin nombre'}
                      </span>
                      {isSelected && <Check className="w-4 h-4 text-blue-600 ml-auto" />}
                    </button>
                  )
                })
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* Recording button with integrated timer container */}
        <div className="flex items-center bg-slate-950/50 hover:bg-slate-600/60 rounded-full p-1 gap-1 transition-all duration-300 shadow-lg">
          {/* Round recording button */}
          <Button
            onClick={isRecording ? onStopRecording : onStartRecording}
            disabled={!isActive}
            size="icon"
            className={`w-12 h-12 rounded-full border-2 cursor-pointer transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 shadow-lg hover:shadow-xl ${
              isRecording
                ? 'bg-red-500 hover:bg-red-400 focus:bg-red-300 border-red-400 hover:border-red-300 focus:border-red-200 focus:ring-red-400'
                : 'bg-red-500 hover:bg-red-400 focus:bg-red-300 border-red-400 hover:border-red-300 focus:border-red-200 focus:ring-red-400'
            } text-white disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isRecording ? (
              <div className="w-4 h-4 bg-white rounded transition-all duration-200"></div>
            ) : (
              <div className="w-5 h-5 bg-white rounded-full transition-all duration-200"></div>
            )}
          </Button>

          {/* Timer display - separate from button but unified container */}
          <div className="px-4 py-2 font-mono text-sm min-w-[60px] text-center text-slate-200">
            {formatTime(recordingTime)}
          </div>
        </div>

        {/* Capture Screenshot button */}
        <Button
          onClick={onCaptureScreenshot}
          disabled={!isActive}
          size="icon"
          className="w-12 h-12 rounded-full bg-slate-700/50 hover:bg-slate-600/60 focus:bg-slate-500/70 text-slate-200 hover:text-white border-2 border-slate-600/40 hover:border-slate-500/60 focus:border-slate-400/70 cursor-pointer transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-slate-400/50 focus:ring-offset-2 focus:ring-offset-gray-800 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Camera className="w-5 h-5 transition-all duration-200" />
        </Button>

        {/* Play/Pause video button */}
        <Button
          onClick={isActive ? onStopCamera : onStartCamera}
          disabled={!selectedDeviceId}
          size="icon"
          className="w-12 h-12 rounded-full bg-slate-700/50 hover:bg-slate-600/60 focus:bg-slate-500/70 text-slate-200 hover:text-white border-2 border-slate-600/40 hover:border-slate-500/60 focus:border-slate-400/70 cursor-pointer transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-slate-400/50 focus:ring-offset-2 focus:ring-offset-gray-800 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isActive ? (
            <svg className="w-5 h-5 transition-all duration-200" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
            </svg>
          ) : (
            <svg className="w-5 h-5 transition-all duration-200" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          )}
        </Button>

        {/* Settings/Options */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="w-12 h-12 rounded-full bg-slate-700/50 hover:bg-slate-600/60 focus:bg-slate-500/70 text-slate-200 hover:text-white border-2 border-slate-600/40 hover:border-slate-500/60 focus:border-slate-400/70 cursor-pointer transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-slate-400/50 focus:ring-offset-2 focus:ring-offset-gray-800 shadow-lg hover:shadow-xl"
            >
              <Settings className="w-5 h-5 transition-all duration-200" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-60 p-3 bg-white rounded-xl shadow-xl border border-gray-200">
            <div className="space-y-1">
              {cameraCapabilities.resolutions.map(resolution => {
                const isSelected = selectedResolution === resolution.value

                // Different icons for different resolutions
                const getIcon = (label: string) => {
                  if (label.includes('1920')) {
                    return <Tv className="w-4 h-4" />
                  } else if (label.includes('1280')) {
                    return <Monitor className="w-4 h-4" />
                  } else {
                    return <Smartphone className="w-4 h-4" />
                  }
                }

                return (
                  <button
                    key={resolution.value}
                    onClick={() => onResolutionChange(resolution.value)}
                    className={`w-full p-3 rounded-lg transition-all duration-200 text-left flex items-center gap-3 ${
                      isSelected
                        ? 'bg-purple-50 text-purple-900'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className={`${isSelected ? 'text-purple-600' : 'text-gray-400'}`}>
                      {getIcon(resolution.label)}
                    </div>
                    <span className="text-sm font-medium">
                      {resolution.label}
                    </span>
                    {isSelected && <Check className="w-4 h-4 text-purple-600 ml-auto" />}
                  </button>
                )
              })}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium text-red-800">Error: {error}</span>
          </div>
        </div>
      )}
    </div>
  )
}