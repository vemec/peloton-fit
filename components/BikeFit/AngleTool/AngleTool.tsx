'use client'

import React, { useCallback, useState } from 'react'
import StatusIndicator from '@/components/BikeFit/Video/StatusIndicator'
import { AngleCanvas } from './AngleCanvas'
import { AngleControls } from './Controls'
import { useAngleTool } from './useAngleTool'
import { Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface AngleToolProps {
  canvasWidth?: number
  canvasHeight?: number
}

export function AngleTool({ canvasWidth = 1200, canvasHeight = 800 }: AngleToolProps) {
  const {
    angles,
    setAngles,
    settings,
    setSettings,
    isCanvasActive,
    toggleCanvas,
    isShiftPressed,
    backgroundImage,
    handleImageDrop,
    clearBackgroundImage
  } = useAngleTool()

  const [isDragOver, setIsDragOver] = useState(false)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length === 0) return

    const imageFile = files[0]
    try {
      await handleImageDrop(imageFile)
      toast.success('Image loaded successfully!')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load image')
    }
  }, [handleImageDrop])

  const handleFileInput = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const imageFile = files[0]
    try {
      await handleImageDrop(imageFile)
      toast.success('Image loaded successfully!')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load image')
    }
  }, [handleImageDrop])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="bg-white border-2 border-gray-300 rounded-lg shadow-lg p-4 mb-4">
        <div
          className={`relative border-2 border-dashed rounded-lg transition-colors ${
            isDragOver
              ? 'border-blue-500 bg-blue-50'
              : backgroundImage
                ? 'border-green-500 bg-green-50'
                : 'border-gray-300 hover:border-gray-400'
          }`}
          style={{ width: canvasWidth, height: canvasHeight }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {isCanvasActive && (
            <AngleCanvas
              angles={angles}
              onAnglesChange={setAngles}
              settings={settings}
              onSettingsChange={setSettings}
              isShiftPressed={isShiftPressed}
              canvasWidth={canvasWidth}
              canvasHeight={canvasHeight}
              backgroundImage={backgroundImage}
            />
          )}

          {!backgroundImage && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 pointer-events-none">
              <Upload className="w-12 h-12 mb-4" />
              <p className="text-lg font-medium mb-2">Drop an image here</p>
              <p className="text-sm">or click to browse</p>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileInput}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer pointer-events-auto"
              />
            </div>
          )}

          {backgroundImage && (
            <div className="absolute top-2 right-2 flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()}
                className="bg-white/90 hover:bg-white"
              >
                <Upload className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={clearBackgroundImage}
                className="bg-white/90 hover:bg-white"
              >
                <X className="w-4 h-4" />
              </Button>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileInput}
                className="hidden"
              />
            </div>
          )}

          <div className="absolute top-4 right-4">
            <StatusIndicator
              isActive={isCanvasActive}
              activeLabel="Canvas On"
              inactiveLabel="Canvas Off"
              showPing={isCanvasActive}
              labelClassName="text-white"
            />
          </div>
        </div>
      </div>
      <AngleControls
        angles={angles}
        onAnglesChange={setAngles}
        settings={settings}
        onSettingsChange={setSettings}
        isCanvasActive={isCanvasActive}
        onToggleCanvas={toggleCanvas}
      />
    </div>
  )
}
