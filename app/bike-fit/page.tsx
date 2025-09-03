"use client"

import React, { useState } from 'react'
import VideoPlayer from '@/components/BikeFit/Video'
import type { BikeType, DetectedSide, VisualSettings } from '@/components/BikeFit/types'

export default function BikeFitPage() {
  const [bikeType, setBikeType] = useState<BikeType>('road')
  const [detectedSide, setDetectedSide] = useState<DetectedSide>(null)
  const [visualSettings, setVisualSettings] = useState<VisualSettings>({
    lineColor: '#8000FF',
    pointColor: '#FFD800',
    lineWidth: 4,
    pointRadius: 7,
    pointSize: 7 // same as pointRadius
  })

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-8 p-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            BikeFit AI
          </h1>
          <p className="text-muted-foreground">Real-time professional bike fitting analysis</p>
        </div>
      </div>

      {/* Video Section */}
      <VideoPlayer
        bikeType={bikeType}
        detectedSide={detectedSide}
        onDetectedSideChange={setDetectedSide}
        onBikeTypeChange={setBikeType}
        visualSettings={visualSettings}
        onVisualSettingsChange={setVisualSettings}
      />
    </div>
  )
}
