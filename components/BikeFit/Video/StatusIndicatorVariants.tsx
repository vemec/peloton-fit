"use client"

import React from 'react'
import StatusIndicator from './StatusIndicator'
import { SKELETON_MODES } from '../Drawing'
import type { DetectedSide, SkeletonMode } from '@/types/bikefit'

type WrapperProps = {
  wrapperClass?: string
}

export function CameraIndicator({ wrapperClass = 'absolute top-6 left-6 z-10' }: WrapperProps) {
  return (
    <StatusIndicator
      wrapperClass={wrapperClass}
      isActive={true}
      ariaLive={'polite'}
      ariaLabel={'Cámara activa'}
      dotActiveClasses={'bg-emerald-400 shadow-lg animate-pulse ring-2 ring-emerald-300/90 ring-offset-2 ring-offset-black/50'}
      pingClassName={'bg-emerald-300'}
      showPing={true}
      activeLabel={'Cámara Activa'}
      labelClassName={'text-emerald-100 text-sm font-medium'}
    />
  )
}

export function RecordingIndicator({ wrapperClass = 'absolute top-6 right-6 z-10', isRecording = false }: WrapperProps & { isRecording?: boolean }) {
  return (
    <StatusIndicator
      wrapperClass={wrapperClass}
      isActive={isRecording}
      ariaLive={isRecording ? 'assertive' : 'polite'}
      ariaLabel={isRecording ? 'Grabando' : 'Sin grabar'}
      dotActiveClasses={'bg-red-500 animate-pulse ring-2 ring-red-400/90 ring-offset-2 ring-offset-black/50'}
      dotInactiveClasses={'bg-gray-500 opacity-50'}
      pingClassName={'bg-red-400'}
      showPing={true}
      activeLabel={'Grabando'}
      inactiveLabel={'Sin Grabar'}
      labelClassName={isRecording ? 'text-red-100 text-sm font-medium' : 'text-gray-400 text-sm font-medium'}
    />
  )
}

// Unified bottom-left indicator: handles SIDE_FULL and FULL modes
export function SkeletonModeIndicator({ wrapperClass = 'absolute bottom-6 left-6 z-10', skeletonMode, poseDetectedSide }: WrapperProps & { skeletonMode: SkeletonMode, poseDetectedSide?: DetectedSide }) {
  if (skeletonMode === SKELETON_MODES.SIDE_FULL) {
    return (
      <StatusIndicator
        wrapperClass={wrapperClass}
        isActive={!!poseDetectedSide}
        ariaLive={'polite'}
        ariaLabel={poseDetectedSide ? `Lado ${poseDetectedSide}` : 'Detectando perfil'}
        dotActiveClasses={'bg-blue-400 animate-pulse ring-2 ring-blue-300/90 ring-offset-2 ring-offset-black/50'}
        dotInactiveClasses={'bg-gray-500 opacity-50'}
        pingClassName={'bg-blue-300'}
        showPing={true}
        activeLabel={poseDetectedSide ? `Lado ${poseDetectedSide === 'left' ? 'Izquierdo' : 'Derecho'}` : 'Detectando perfil...'}
        inactiveLabel={'Detectando perfil...'}
        labelClassName={poseDetectedSide ? 'text-blue-100 text-sm font-medium' : 'text-gray-400 text-sm font-medium'}
      />
    )
  }
  if (skeletonMode === SKELETON_MODES.FULL) {
    return (
      <StatusIndicator
        wrapperClass={wrapperClass}
        isActive={true}
        ariaLive={'polite'}
        ariaLabel={'Esqueleto completo'}
        dotActiveClasses={'bg-green-400 shadow-lg animate-pulse ring-2 ring-green-300/90 ring-offset-2 ring-offset-black/50'}
        pingClassName={'bg-green-300'}
        showPing={true}
        activeLabel={'Esqueleto Completo'}
        labelClassName={'text-green-100 text-sm font-medium'}
      />
    )
  }
  return null
}

// Default export with grouped components so callers can import a single default and use properties
const Indicators = {
  Camera: CameraIndicator,
  Recording: RecordingIndicator,
  SkeletonMode: SkeletonModeIndicator
}

export default Indicators
