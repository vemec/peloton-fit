import React from 'react'
import type { CameraDevice, BikeType, VisualSettings, SkeletonMode, DetectedSide } from '@/types/bikefit'
import type { OverlayVisibility } from '@/types/overlay'
import { cn } from '@/lib/utils'
import {
  CameraSelectorButton,
  VideoBackgroundToggleButton,
  ResolutionSelectorButton,
  RecordingButton,
  ScreenshotButton,
  VisualCustomizationButton,
  FlipHorizontalButton,
  SkeletonModeSelectorButton,
  AngleVisibilityButton,
  BikeTypeSelectorButton
} from './Buttons'

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
  detectedSide: DetectedSide
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
  return (
    <div className={cn('flex')}>
      <div
        className={cn(
          'flex items-center bg-slate-800/80 rounded-full p-2 gap-2 w-auto mt-0 lg:my-5 ',
          'overflow-x-auto max-w-[350px] sm:max-w-[480px] md:max-w-[600px] lg:max-w-none lg:overflow-visible lg:mx-auto',
          'absolute bottom-2 z-20 left-1/2 transform -translate-x-1/2 lg:left-auto lg:transform-none lg:translate-x-0 lg:static'
        )}
      >
        <CameraSelectorButton
          devices={devices}
          selectedDeviceId={selectedDeviceId}
          isActive={isActive}
          onDeviceChange={onDeviceChange}
          onStartCamera={onStartCamera}
          onStopCamera={onStopCamera}
        />

        <VideoBackgroundToggleButton
          isVideoHidden={isVideoHidden}
          onToggleVideoBackground={onToggleVideoBackground}
        />

        <ResolutionSelectorButton
          selectedResolution={selectedResolution}
          onResolutionChange={onResolutionChange}
        />

        <RecordingButton
          isActive={isActive}
          isRecording={isRecording}
          onStartRecording={onStartRecording}
          onStopRecording={onStopRecording}
        />

        <ScreenshotButton
          isActive={isActive}
          onCaptureScreenshot={onCaptureScreenshot}
        />

        <VisualCustomizationButton
          visualSettings={visualSettings}
          onVisualSettingsChange={onVisualSettingsChange}
        />

        <FlipHorizontalButton
          isFlipped={isFlipped}
          onFlipToggle={onFlipToggle}
        />

        <SkeletonModeSelectorButton
          selectedMode={skeletonMode}
          onModeChange={onSkeletonModeChange}
        />

        <AngleVisibilityButton
          overlayVisibility={overlayVisibility}
          onOverlayVisibilityChange={onOverlayVisibilityChange}
        />

        <BikeTypeSelectorButton
          bikeType={bikeType}
          onBikeTypeChange={onBikeTypeChange}
        />
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
