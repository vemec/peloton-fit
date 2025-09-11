"use client"

import React from 'react'
import StatusIndicator from './StatusIndicator'
import { SKELETON_MODES } from '../Drawing'
import type { DetectedSide, SkeletonMode, BikeType } from '@/types/bikefit'

type WrapperProps = {
  wrapperClass?: string
}

export function CameraIndicator({ wrapperClass = 'absolute top-6 left-6 z-10' }: WrapperProps) {
  return (
    <StatusIndicator
      wrapperClass={wrapperClass}
      isActive={true}
      ariaLive={'polite'}
      ariaLabel={'Camera active'}
      dotActiveClasses={'bg-emerald-400 shadow-lg animate-pulse ring-2 ring-emerald-300/90 ring-offset-2 ring-offset-black/50'}
      pingClassName={'bg-emerald-300'}
      showPing={true}
      activeLabel={'Camera Active'}
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
      ariaLabel={isRecording ? 'Recording' : 'Not recording'}
      dotActiveClasses={'bg-red-500 animate-pulse ring-2 ring-red-400/90 ring-offset-2 ring-offset-black/50'}
      dotInactiveClasses={'bg-gray-500 opacity-50'}
      pingClassName={'bg-red-400'}
      showPing={true}
      activeLabel={'Recording'}
      inactiveLabel={'Not Recording'}
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
        ariaLabel={poseDetectedSide ? `Side ${poseDetectedSide}` : 'Detecting profile'}
        dotActiveClasses={'bg-blue-400 animate-pulse ring-2 ring-blue-300/90 ring-offset-2 ring-offset-black/50'}
        dotInactiveClasses={'bg-gray-500 opacity-50'}
        pingClassName={'bg-blue-300'}
        showPing={true}
        activeLabel={poseDetectedSide ? `Side ${poseDetectedSide === 'left' ? 'Left' : 'Right'}` : 'Detecting profile...'}
        inactiveLabel={'Detecting profile...'}
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
        ariaLabel={'Full skeleton'}
        dotActiveClasses={'bg-green-400 shadow-lg animate-pulse ring-2 ring-green-300/90 ring-offset-2 ring-offset-black/50'}
        pingClassName={'bg-green-300'}
        showPing={true}
        activeLabel={'Full Skeleton'}
        labelClassName={'text-green-100 text-sm font-medium'}
      />
    )
  }
  return null
}

// Bottom-right indicator: shows selected bike type (road/triathlon/mountain)
export function BikeTypeIndicator({ wrapperClass = 'absolute bottom-6 right-6 z-10', bikeType }: WrapperProps & { bikeType: BikeType }) {
  const labelMap: Record<BikeType, string> = {
    road: 'Bike: Road',
    triathlon: 'Bike: Triathlon',
    mountain: 'Bike: Mountain'
  }

  const colorMap: Record<BikeType, { dot: string; ping: string; text: string }> = {
    road: {
      dot: 'bg-indigo-400 shadow-lg animate-pulse ring-2 ring-indigo-300/90 ring-offset-2 ring-offset-black/50',
      ping: 'bg-indigo-300',
      text: 'text-indigo-100 text-sm font-medium'
    },
    triathlon: {
      dot: 'bg-fuchsia-400 shadow-lg animate-pulse ring-2 ring-fuchsia-300/90 ring-offset-2 ring-offset-black/50',
      ping: 'bg-fuchsia-300',
      text: 'text-fuchsia-100 text-sm font-medium'
    },
    mountain: {
      dot: 'bg-amber-400 shadow-lg animate-pulse ring-2 ring-amber-300/90 ring-offset-2 ring-offset-black/50',
      ping: 'bg-amber-300',
      text: 'text-amber-100 text-sm font-medium'
    }
  }

  const label = labelMap[bikeType]
  const colors = colorMap[bikeType]

  return (
    <StatusIndicator
      wrapperClass={wrapperClass}
      isActive={true}
      ariaLive={'polite'}
      ariaLabel={label}
      dotActiveClasses={colors.dot}
      pingClassName={colors.ping}
      showPing={true}
      activeLabel={label}
      labelClassName={colors.text}
    />
  )
}

// Default export with grouped components so callers can import a single default and use properties
const Indicators = {
  Camera: CameraIndicator,
  Recording: RecordingIndicator,
  SkeletonMode: SkeletonModeIndicator,
  BikeType: BikeTypeIndicator
}

export default Indicators
