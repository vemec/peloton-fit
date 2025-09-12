"use client"

import React, { useEffect, useState } from 'react'
import CameraEmptyState from './CameraEmptyState'
import Indicators from './StatusIndicatorVariants'
import type { BikeType, DetectedSide, SkeletonMode } from '@/types/bikefit'

interface VideoDisplayProps {
  videoRef: React.RefObject<HTMLVideoElement | null>
  canvasRef: React.RefObject<HTMLCanvasElement | null>
  isActive: boolean
  isVideoHidden: boolean
  isFlipped: boolean
  aspectW: number
  aspectH: number
  isRecording: boolean
  poseDetectedSide: DetectedSide
  skeletonMode: SkeletonMode
  bikeType: BikeType
  handleStartCamera: () => void
  selectedDeviceId?: string | null
  error?: string | null
}

export default function VideoDisplay({
  videoRef,
  canvasRef,
  isActive,
  isVideoHidden,
  isFlipped,
  aspectW,
  aspectH,
  isRecording,
  poseDetectedSide,
  skeletonMode,
  bikeType,
  handleStartCamera,
  selectedDeviceId,
  error,
}: VideoDisplayProps) {
  const [isMobile, setIsMobile] = useState(false)
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait')

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth
      const h = window.innerHeight
      setIsMobile(w <= 768)
      setOrientation(h >= w ? 'portrait' : 'landscape')
    }

    update()
    window.addEventListener('resize', update)
    window.addEventListener('orientationchange', update)
    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('orientationchange', update)
    }
  }, [])
  return (
    <div
      className={
        isMobile
          ? "fixed inset-0 z-50 bg-black/95"
          : "z-10 relative mx-auto bg-slate-50/30 border border-slate-200/50 rounded-3xl overflow-hidden backdrop-blur-sm"
      }
      style={
        isMobile
          ? { width: '100vw', height: '100vh', maxWidth: '100%' }
          : { aspectRatio: `${aspectW} / ${aspectH}`, height: `min(80dvh, calc(100vw * ${aspectH} / ${aspectW}))`, maxWidth: '100%' }
      }
    >
      {/* Status indicators - Top corners - Only show when video is active */}
      {isActive && (
        <>
          <Indicators.Camera />
          <Indicators.Recording isRecording={isRecording} />
          <Indicators.SkeletonMode skeletonMode={skeletonMode} poseDetectedSide={poseDetectedSide} />
          <Indicators.BikeType bikeType={bikeType} />
        </>
      )}

      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-contain bg-slate-900/5"
        playsInline
        muted
        style={{
          opacity: isActive && !isVideoHidden ? 1 : 0,
          transition: 'opacity 500ms',
          transform: isFlipped ? 'scaleX(-1)' : 'scaleX(1)',
          objectFit: isMobile ? 'cover' : 'contain'
        }}
        preload="none"
      />

      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{
          opacity: isActive ? 1 : 0,
          transition: 'opacity 500ms',
          objectFit: isMobile ? 'cover' : 'contain'
        }}
      />

      {!isActive && (
        <CameraEmptyState
          onStartCamera={handleStartCamera}
          hasSelectedDevice={!!selectedDeviceId}
          error={error || ''}
        />
      )}
    </div>
  )
}
