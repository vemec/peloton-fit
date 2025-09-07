import { Camera, Proportions, Check, Video, VideoOff, Bike, Aperture, FlipHorizontal, Palette, ChevronUp, ChevronDown, Play, Square, Eye } from 'lucide-react'
import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { CameraDevice, BikeType, VisualSettings, SkeletonMode } from '@/types/bikefit'
import type { OverlayVisibility } from '@/types/overlay'
import { Switch } from '@/components/ui/switch'
import { RESOLUTIONS } from './constants'
import BikeFitVisualCustomization from '../VisualCustomization'
import SkeletonModeSelector from '../VisualCustomization/SkeletonModeSelector'
import { cn } from '@/lib/utils'

interface VideoControlsProps {
  devices: CameraDevice[]
  selectedDeviceId: string | null
  selectedResolution: string
  isActive: boolean
  error: string | null
  bikeType: BikeType
  isFlipped: boolean
  isVideoHidden: boolean
  visualSettings: VisualSettings
  skeletonMode: SkeletonMode
  overlayVisibility: OverlayVisibility
  onDeviceChange: (deviceId: string | null) => void
  onResolutionChange: (resolution: string) => void
  onBikeTypeChange: (type: BikeType) => void
  onFlipToggle: () => void
  onToggleVideoBackground: () => void
  onVisualSettingsChange: (settings: VisualSettings) => void
  onSkeletonModeChange: (mode: SkeletonMode) => void
  onOverlayVisibilityChange: (visibility: OverlayVisibility) => void
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
  isVideoHidden,
  visualSettings,
  skeletonMode,
  overlayVisibility,
  onDeviceChange,
  onResolutionChange,
  onBikeTypeChange,
  onFlipToggle,
  onToggleVideoBackground,
  onVisualSettingsChange,
  onSkeletonModeChange,
  onOverlayVisibilityChange,
  onStartCamera,
  onStopCamera,
  isRecording,
  onStartRecording,
  onStopRecording,
  onCaptureScreenshot
}: VideoControlsProps) {
  const [recordingTime, setRecordingTime] = useState(0)
  const [cameraSelectorOpen, setCameraSelectorOpen] = useState(false)

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
      <div className={cn('flex items-center bg-slate-400 rounded-full p-2 gap-2 mx-auto')}>
        {/* Camera control: left opens device selector, right toggles camera */}
        <div className={cn('flex items-center bg-slate-700/50 hover:bg-slate-800/60 rounded-full p-0 gap-0 transition-all duration-300 shadow-lg')}>
          <Popover open={cameraSelectorOpen} onOpenChange={setCameraSelectorOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                aria-label="Seleccionar cámara"
                className={cn('w-10 h-10 rounded-full bg-transparent hover:bg-transparent text-slate-200 hover:text-white cursor-pointer transition-all duration-300 ease-in-out')}
              >
                {cameraSelectorOpen ? (
                  <ChevronDown className={cn('!w-5 !h-5 text-slate-300')} />
                ) : (
                  <ChevronUp className={cn('!w-5 !h-5 text-slate-300')} />
                )}
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
                      .replace(/\s*\([^)]*\)$/,'')
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

          <Button
            onClick={isActive ? onStopCamera : onStartCamera}
            disabled={!selectedDeviceId}
            size="icon"
            aria-label={isActive ? 'Detener cámara' : 'Iniciar cámara'}
            className={cn('w-12 h-12 rounded-full bg-slate-700 hover:bg-slate-900 focus:bg-slate-800 text-slate-200 hover:text-white border-2 border-slate-700 hover:border-slate-900 focus:border-slate-100 cursor-pointer transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-slate-900 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed')}
          >
            {isActive ? (
              <Square size={20} className={cn('!w-5 !h-5 transition-transform duration-300')} />
            ) : (
              <Play size={20} className={cn('!w-5 !h-5 transition-transform duration-300')} />
            )}
          </Button>
        </div>

        {/* Hide/Show Video Background button */}
        <Button
          onClick={onToggleVideoBackground}
          size="icon"
          className={cn(
            'w-12 h-12 rounded-full bg-slate-700 hover:bg-slate-900 focus:bg-slate-800 text-slate-200 hover:text-white border-2 border-slate-700 hover:border-slate-900 focus:border-slate-100 cursor-pointer transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-slate-900 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed',
            isVideoHidden
              ? 'bg-red-500 hover:bg-red-400 focus:bg-red-300 border-red-400 hover:border-red-300 focus:border-red-200 text-white focus:ring-red-400'
              : 'w-12 h-12 rounded-full bg-slate-700 hover:bg-slate-900 focus:bg-slate-800 text-slate-200 hover:text-white border-2 border-slate-700 hover:border-slate-900 focus:border-slate-100 cursor-pointer transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-slate-900 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed'
          )}
          aria-label={isVideoHidden ? 'Mostrar video' : 'Ocultar video'}
          title={isVideoHidden ? 'Mostrar video' : 'Ocultar video'}
        >
          {isVideoHidden ? (
            <VideoOff className={cn('!w-5 !h-5 transition-all duration-200')} />
          ) : (
            <Video className={cn('!w-5 !h-5 transition-all duration-200')} />
          )}
        </Button>

        {/* Settings/Options */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn('w-12 h-12 rounded-full bg-slate-700 hover:bg-slate-900 focus:bg-slate-800 text-slate-200 hover:text-white border-2 border-slate-700 hover:border-slate-900 focus:border-slate-100 cursor-pointer transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-slate-900 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed')}
            >
              <Proportions className={cn('!w-5 !h-5 transition-all duration-200')} />
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

        {/* Recording button with integrated timer container */}
        <div className={cn('flex items-center bg-slate-700/50 hover:bg-slate-600/60 rounded-full p-0 gap-1 transition-all duration-300 shadow-lg')}>
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
          {/* Capture Screenshot button */}
          <Button
            onClick={onCaptureScreenshot}
            disabled={!isActive}
            size="icon"
            className={cn('w-12 h-12 rounded-full bg-slate-700 hover:bg-slate-900 focus:bg-slate-800 text-slate-200 hover:text-white border-2 border-slate-700 hover:border-slate-900 focus:border-slate-100 cursor-pointer transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-slate-900 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed')}
          >
            <Aperture className={cn('!w-5 !h-5 transition-all duration-200')} />
          </Button>
        </div>

        {/* Visual Customization button */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn('w-12 h-12 rounded-full bg-slate-700 hover:bg-slate-900 focus:bg-slate-800 text-slate-200 hover:text-white border-2 border-slate-700 hover:border-slate-900 focus:border-slate-100 cursor-pointer transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-slate-900 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed')}
            >
              <Palette className={cn('!w-5 !h-5 transition-all duration-200')} />
            </Button>
          </PopoverTrigger>
          <PopoverContent className={cn('w-60 p-3 bg-white rounded-xl shadow-xl border border-gray-200')}>
            <BikeFitVisualCustomization
              settings={visualSettings}
              onSettingsChange={onVisualSettingsChange}
            />
          </PopoverContent>
        </Popover>

        {/* Flip Horizontal button */}
        <Button
          onClick={onFlipToggle}
          size="icon"
          className={cn(
            'w-12 h-12 rounded-full bg-slate-700 hover:bg-slate-900 focus:bg-slate-800 text-slate-200 hover:text-white border-2 border-slate-700 hover:border-slate-900 focus:border-slate-100 cursor-pointer transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-slate-900 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed',
            isFlipped
              ? 'bg-blue-500 hover:bg-blue-400 focus:bg-blue-300 border-blue-400 hover:border-blue-300 focus:border-blue-200 text-white focus:ring-blue-400'
              : 'w-12 h-12 rounded-full bg-slate-700 hover:bg-slate-900 focus:bg-slate-800 text-slate-200 hover:text-white border-2 border-slate-700 hover:border-slate-900 focus:border-slate-100 cursor-pointer transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-slate-900 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          <FlipHorizontal className={cn('!w-5 !h-5 transition-all duration-200')} />
        </Button>

        {/* Skeleton Mode Toggle */}
        <SkeletonModeSelector
          selectedMode={skeletonMode}
          onModeChange={onSkeletonModeChange}
        />

        {/* Angle Visibility button */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn('w-12 h-12 rounded-full bg-slate-700 hover:bg-slate-900 focus:bg-slate-800 text-slate-200 hover:text-white border-2 border-slate-700 hover:border-slate-900 focus:border-slate-100 cursor-pointer transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-slate-900 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed')}
              aria-label="Visibilidad de ángulos"
              title="Mostrar/Ocultar ángulos"
            >
              <Eye className={cn('!w-5 !h-5 transition-all duration-200')} />
            </Button>
          </PopoverTrigger>
          <PopoverContent className={cn('w-40 p-3 bg-white rounded-xl shadow-xl border border-gray-200')}>
            <div className={cn('space-y-3')}>
              {(
                [
                  ['codo', 'elbow'],
                  ['hombro', 'shoulder'],
                  ['cadera', 'hip'],
                  ['rodilla', 'knee'],
                  ['tobillo', 'ankle'],
                ] as const
              ).map(([label, key]) => (
                <label key={key} className={cn('flex items-center justify-between text-sm text-gray-700')}
                >
                  <span className={cn('capitalize')}>{label}</span>
                  <Switch
                    checked={overlayVisibility.angles[key]}
                    onCheckedChange={(checked) => onOverlayVisibilityChange({
                      ...overlayVisibility,
                      angles: { ...overlayVisibility.angles, [key]: !!checked },
                    })}
                  />
                </label>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Bike type selector */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn('w-12 h-12 rounded-full bg-slate-700 hover:bg-slate-900 focus:bg-slate-800 text-slate-200 hover:text-white border-2 border-slate-700 hover:border-slate-900 focus:border-slate-100 cursor-pointer transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-slate-900 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed')}
            >
              <Bike className={cn('!w-5 !h-5')} />
            </Button>
          </PopoverTrigger>
          <PopoverContent className={cn('w-80 p-3 bg-white rounded-xl shadow-xl border border-gray-200')}>
            <div className={cn('space-y-1')}>
              {['road', 'triathlon', 'mountain'].map((type) => {
                const isSelected = bikeType === type
                const displayName = type === 'road' ? 'Bicicleta de Ruta' :
                                  type === 'triathlon' ? 'Bicicleta de Triatlón' :
                                  'Bicicleta de Montaña'

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