import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Camera, Proportions, Check, Video, Bike, Aperture, Play, Pause, FlipHorizontal, Palette } from 'lucide-react'
import type { CameraDevice, BikeType, VisualSettings } from '@/types/bikefit'
import { RESOLUTIONS } from './constants'
import BikeFitVisualCustomization from '../VisualCustomization'
import { cn } from '@/lib/utils'

interface VideoControlsProps {
  devices: CameraDevice[]
  selectedDeviceId: string | null
  selectedResolution: string
  isActive: boolean
  error: string | null
  bikeType: BikeType
  isFlipped: boolean
  visualSettings: VisualSettings
  onDeviceChange: (deviceId: string | null) => void
  onResolutionChange: (resolution: string) => void
  onBikeTypeChange: (type: BikeType) => void
  onFlipToggle: () => void
  onVisualSettingsChange: (settings: VisualSettings) => void
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
  bikeType,
  isFlipped,
  visualSettings,
  onDeviceChange,
  onResolutionChange,
  onBikeTypeChange,
  onFlipToggle,
  onVisualSettingsChange,
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
    <div className={cn('flex flex-col gap-4')}>
      {/* Horizontal control bar */}
      <div className={cn('bg-gray-900 backdrop-blur-sm rounded-full px-4 py-3 inline-flex items-center justify-center gap-4 shadow-lg mx-auto')}>
        {/* Camera selector */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              aria-label="Seleccionar cámara"
              className={cn('w-12 h-12 rounded-full bg-slate-700/50 hover:bg-slate-600/60 focus:bg-slate-500/70 text-slate-200 hover:text-white border-2 border-slate-600/40 hover:border-slate-500/60 focus:border-slate-400/70 cursor-pointer transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-slate-400/50 focus:ring-offset-2 focus:ring-offset-gray-800 shadow-lg hover:shadow-xl')}
            >
              <Video size={20} className={cn('transition-transform duration-300 group-hover:scale-105')} />
            </Button>
          </PopoverTrigger>
          <PopoverContent className={cn('w-60 p-3 bg-white rounded-xl shadow-xl border border-gray-200')}>
            <div className={cn('space-y-1')}>
              {devices.length === 0 ? (
                <div className={cn('p-3 text-center')}>
                  <p className={cn('text-sm text-gray-500')}>Sin cámaras</p>
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
                      className={cn(
                        'w-full p-3 rounded-lg transition-all duration-200 text-left flex items-center gap-3',
                        isSelected ? 'bg-blue-50 text-blue-900' : 'text-gray-700 hover:bg-gray-50'
                      )}
                    >
                      <Camera className={cn('w-4 h-4', isSelected ? 'text-blue-600' : 'text-gray-400')} />
                      <span className={cn('text-sm font-medium')}>
                        {cleanLabel || 'Cámara sin nombre'}
                      </span>
                      {isSelected && <Check className={cn('w-4 h-4 text-blue-600 ml-auto')} />}
                    </button>
                  )
                })
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* Bike type selector */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn('w-12 h-12 rounded-full bg-slate-700/50 hover:bg-slate-600/60 focus:bg-slate-500/70 text-slate-200 hover:text-white border-2 border-slate-600/40 hover:border-slate-500/60 focus:border-slate-400/70 cursor-pointer transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-slate-400/50 focus:ring-offset-2 focus:ring-offset-gray-800 shadow-lg hover:shadow-xl')}
            >
              <Bike className={cn('w-6 h-6')} />
            </Button>
          </PopoverTrigger>
          <PopoverContent className={cn('w-60 p-3 bg-white rounded-xl shadow-xl border border-gray-200')}>
            <div className={cn('space-y-1')}>
              {['road', 'triathlon'].map((type) => {
                const isSelected = bikeType === type
                const displayName = type === 'road' ? 'Bicicleta de Ruta' : 'Bicicleta de Triatlón'

                return (
                  <button
                    key={type}
                    onClick={() => onBikeTypeChange(type as BikeType)}
                    className={cn(
                      'w-full p-3 rounded-lg transition-all duration-200 text-left flex items-center gap-3',
                      isSelected ? 'bg-blue-50 text-blue-900' : 'text-gray-700 hover:bg-gray-50'
                    )}
                  >
                    <Bike className={cn('w-4 h-4', isSelected ? 'text-blue-600' : 'text-gray-400')} />
                    <span className={cn('text-sm font-medium')}>
                      {displayName}
                    </span>
                    {isSelected && <Check className={cn('w-4 h-4 text-blue-600 ml-auto')} />}
                  </button>
                )
              })}
            </div>
          </PopoverContent>
        </Popover>

        {/* Recording button with integrated timer container */}
    <div className={cn('flex items-center bg-slate-700/50 hover:bg-slate-600/60 rounded-full p-1 gap-1 transition-all duration-300 shadow-lg')}>
          <Button
            onClick={isRecording ? onStopRecording : onStartRecording}
            disabled={!isActive}
            size="icon"
            className={cn(
              'w-12 h-12 bg-white rounded-full border-2 cursor-pointer transition-all duration-300 ease-in-out hover:bg-white',
              'text-white disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            <div
              className={cn(
                'w-6 h-6 rounded bg-red-500 hover:bg-red-400 focus:bg-red-300 border-red-400 hover:border-red-300 focus:border-red-200 focus:ring-red-400 transition-all duration-200',
                !isRecording && 'w-10 h-10 rounded-full'
              )}
            />
          </Button>
      <div className={cn('px-4 py-2 font-mono text-sm min-w-[60px] text-center text-slate-200')}>
              {formatTime(recordingTime)}
            </div>
        </div>

        {/* Capture Screenshot button */}
        <Button
          onClick={onCaptureScreenshot}
          disabled={!isActive}
          size="icon"
          className={cn('w-12 h-12 rounded-full bg-slate-700/50 hover:bg-slate-600/60 focus:bg-slate-500/70 text-slate-200 hover:text-white border-2 border-slate-600/40 hover:border-slate-500/60 focus:border-slate-400/70 cursor-pointer transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-slate-400/50 focus:ring-offset-2 focus:ring-offset-gray-800 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed')}
        >
          <Aperture className={cn('w-6 h-6 transition-all duration-200')} />
        </Button>

        {/* Flip Horizontal button */}
        <Button
          onClick={onFlipToggle}
          size="icon"
          className={cn(
            'w-12 h-12 rounded-full border-2 cursor-pointer transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 shadow-lg hover:shadow-xl',
            isFlipped
              ? 'bg-blue-500 hover:bg-blue-400 focus:bg-blue-300 border-blue-400 hover:border-blue-300 focus:border-blue-200 text-white focus:ring-blue-400'
              : 'bg-slate-700/50 hover:bg-slate-600/60 focus:bg-slate-500/70 text-slate-200 hover:text-white border-slate-600/40 hover:border-slate-500/60 focus:border-slate-400/70 focus:ring-slate-400/50'
          )}
        >
          <FlipHorizontal className={cn('w-6 h-6 transition-all duration-200')} />
        </Button>

        {/* Visual Customization button */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn('w-12 h-12 rounded-full bg-slate-700/50 hover:bg-slate-600/60 focus:bg-slate-500/70 text-slate-200 hover:text-white border-2 border-slate-600/40 hover:border-slate-500/60 focus:border-slate-400/70 cursor-pointer transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-slate-400/50 focus:ring-offset-2 focus:ring-offset-gray-800 shadow-lg hover:shadow-xl')}
            >
              <Palette className={cn('w-6 h-6 transition-all duration-200')} />
            </Button>
          </PopoverTrigger>
          <PopoverContent className={cn('w-60 p-3 bg-white rounded-xl shadow-xl border border-gray-200')}>
            <BikeFitVisualCustomization
              settings={visualSettings}
              onSettingsChange={onVisualSettingsChange}
            />
          </PopoverContent>
        </Popover>

        {/* Play/Pause video button */}
        <Button
          onClick={isActive ? onStopCamera : onStartCamera}
          disabled={!selectedDeviceId}
          size="icon"
          className={cn('w-12 h-12 rounded-full bg-slate-700/50 hover:bg-slate-600/60 focus:bg-slate-500/70 text-slate-200 hover:text-white border-2 border-slate-600/40 hover:border-slate-500/60 focus:border-slate-400/70 cursor-pointer transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-slate-400/50 focus:ring-offset-2 focus:ring-offset-gray-800 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed')}
        >
          {isActive ? (
            <Pause className={cn('w-6 h-6 transition-all duration-200')} />
          ) : (
            <Play className={cn('w-6 h-6 transition-all duration-200')} />
          )}
        </Button>

        {/* Settings/Options */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn('w-12 h-12 rounded-full bg-slate-700/50 hover:bg-slate-600/60 focus:bg-slate-500/70 text-slate-200 hover:text-white border-2 border-slate-600/40 hover:border-slate-500/60 focus:border-slate-400/70 cursor-pointer transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-slate-400/50 focus:ring-offset-2 focus:ring-offset-gray-800 shadow-lg hover:shadow-xl')}
            >
              <Proportions className={cn('w-6 h-6 transition-all duration-200')} />
            </Button>
          </PopoverTrigger>
          <PopoverContent className={cn('w-60 p-3 bg-white rounded-xl shadow-xl border border-gray-200')}>
            <div className={cn('space-y-1')}>
              {RESOLUTIONS.map(resolution => {
                const isSelected = selectedResolution === resolution.value
                const IconComponent = resolution.icon

                return (
                  <button
                    key={resolution.value}
                    onClick={() => onResolutionChange(resolution.value)}
                    className={cn(
                      'w-full p-3 rounded-lg transition-all duration-200 text-left flex items-center gap-3',
                      isSelected ? 'bg-purple-50 text-purple-900' : 'text-gray-700 hover:bg-gray-50'
                    )}
                  >
                    <IconComponent className={cn('w-4 h-4', isSelected ? 'text-purple-600' : 'text-gray-400')} />
                    <span className={cn('text-sm font-medium')}>
                      {resolution.label}
                    </span>
                    {isSelected && <Check className={cn('w-4 h-4 text-purple-600 ml-auto')} />}
                  </button>
                )
              })}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Error Display */}
      {error && (
        <div className={cn('bg-red-50 border border-red-200 rounded-lg p-3')}>
          <div className={cn('flex items-center gap-2')}>
            <svg className={cn('w-4 h-4 text-red-600')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className={cn('text-sm font-medium text-red-800')}>Error: {error}</span>
          </div>
        </div>
      )}
    </div>
  )
}