import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Camera, Settings, Check, Video } from 'lucide-react'
import type { CameraDevice } from './hooks'
import { RESOLUTIONS } from './constants'

interface VideoControlsProps {
  devices: CameraDevice[]
  selectedDeviceId: string | null
  selectedResolution: string
  isActive: boolean
  error: string | null
  onDeviceChange: (deviceId: string | null) => void
  onResolutionChange: (resolution: string) => void
  onStartCamera: () => void
  onStopCamera: () => void
  isRecording: boolean
  onStartRecording: () => void
  onStopRecording: () => void
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

  // Timer for recording
  useEffect(() => {
    if (!isRecording) {
      setRecordingTime(0)
      return
    }

    const interval = setInterval(() => {
      setRecordingTime(prev => prev + 1)
    }, 1000)

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
                    .replace(/\s*\([^)]*\)$/, '')
                    .replace(/\s+/g, ' ')
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
        <div className="flex items-center bg-slate-700/50 hover:bg-slate-600/60 rounded-full p-1 gap-1 transition-all duration-300 shadow-lg">
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
              {RESOLUTIONS.map(resolution => {
                const isSelected = selectedResolution === resolution.value
                const IconComponent = resolution.icon

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
                    <IconComponent className={`w-4 h-4 ${isSelected ? 'text-purple-600' : 'text-gray-400'}`} />
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