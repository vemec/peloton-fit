"use client"

import React from 'react'
import VideoPlayer from '@/components/BikeFit/Video'

export default function BikeFitPage() {
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
      <VideoPlayer />
    </div>
  )
}
