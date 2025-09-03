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
    pointSize: 7
  })

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-8 p-6">
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