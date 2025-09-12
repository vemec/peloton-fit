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
  const [mediaStyle, setMediaStyle] = useState<React.CSSProperties>({ width: '100%', height: '100%' })

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

  // Update video/canvas sizing to avoid cropping -- choose fit by width or height
  useEffect(() => {
    const updateMediaSizing = () => {
      const videoEl = videoRef?.current
      const cw = window.innerWidth
      const ch = window.innerHeight

      const vw = videoEl?.videoWidth || aspectW
      const vh = videoEl?.videoHeight || aspectH
      const videoAspect = (vw && vh) ? (vw / vh) : (aspectW / aspectH)
      const containerAspect = cw / ch

      // If video is wider than container, fit width; otherwise fit height
      if (videoAspect > containerAspect) {
        setMediaStyle({ width: '100%', height: 'auto' })
      } else {
        setMediaStyle({ width: 'auto', height: '100%' })
      }
    }

    updateMediaSizing()
    // Listen for metadata load (which gives videoWidth/videoHeight) and resize/orientation
    const videoEl = videoRef?.current
    videoEl?.addEventListener('loadedmetadata', updateMediaSizing)
    window.addEventListener('resize', updateMediaSizing)
    window.addEventListener('orientationchange', updateMediaSizing)

    return () => {
      videoEl?.removeEventListener('loadedmetadata', updateMediaSizing)
      window.removeEventListener('resize', updateMediaSizing)
      window.removeEventListener('orientationchange', updateMediaSizing)
    }
  }, [videoRef, aspectW, aspectH, isMobile, orientation, isActive])
  return (
    <div
      className={
        isMobile
          ? "fixed inset-0 z-10 bg-black/95"
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
          ...mediaStyle,
          opacity: isActive && !isVideoHidden ? 1 : 0,
          transition: 'opacity 500ms',
          transform: isFlipped ? 'scaleX(-1)' : 'scaleX(1)'
        }}
        preload="none"
      />

      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{
          ...mediaStyle,
          opacity: isActive ? 1 : 0,
          transition: 'opacity 500ms'
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
