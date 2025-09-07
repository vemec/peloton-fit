"use client"

import React, { useState } from 'react'
import VideoPlayer from '@/components/BikeFit/Video'
import type { BikeType, DetectedSide, VisualSettings } from '@/types/bikefit'
import { DEFAULT_VISUAL_SETTINGS } from '@/lib/constants'

export default function BikeFitPage() {
  const [bikeType, setBikeType] = useState<BikeType>('triathlon')
  const [detectedSide, setDetectedSide] = useState<DetectedSide>(null)
  // Inicializa usando los valores centralizados para evitar duplicación
  const [visualSettings, setVisualSettings] = useState<VisualSettings>({
    ...DEFAULT_VISUAL_SETTINGS,
  })

  return (
    <div className="w-full mx-auto flex flex-col gap-8 p-6">
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