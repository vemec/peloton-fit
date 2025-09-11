'use client'

import React, { useState, useEffect } from 'react'
import { AngleCanvas } from './AngleCanvas'
import { AngleControls } from './AngleControls'
import type { Angle, AngleToolSettings } from '@/types/angle-tool'
import { DEFAULT_VISUAL_SETTINGS } from '@/lib/constants'

interface AngleToolProps {
  canvasWidth?: number
  canvasHeight?: number
}

const DEFAULT_SETTINGS: AngleToolSettings = {
  lineColor: DEFAULT_VISUAL_SETTINGS.lineColor,
  pointColor: DEFAULT_VISUAL_SETTINGS.pointColor,
  lineWidth: DEFAULT_VISUAL_SETTINGS.lineWidth,
  pointRadius: DEFAULT_VISUAL_SETTINGS.pointRadius,
  gridStep: 5,
  canvasGrid: {
    enabled: false,
    color: '#cccccc',
    lineType: 'solid',
    size: 10,
    position: { x: -400, y: -300 }, // Center the larger grid (assuming 800x600 canvas)
    angle: 0
  },
  isDragGridMode: false
}

export function AngleTool({ canvasWidth = 800, canvasHeight = 600 }: AngleToolProps) {
  const [angles, setAngles] = useState<Angle[]>([])
  const [settings, setSettings] = useState<AngleToolSettings>(DEFAULT_SETTINGS)
  const [isCanvasActive, setIsCanvasActive] = useState(true)
  const [isShiftPressed, setIsShiftPressed] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        setIsShiftPressed(true)
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        setIsShiftPressed(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  const handleToggleCanvas = () => {
    setIsCanvasActive(!isCanvasActive)
  }

  return (
    <div className="flex gap-4 p-4">
      <div className="flex-1">
        {isCanvasActive ? (
          <AngleCanvas
            angles={angles}
            onAnglesChange={setAngles}
            settings={settings}
            onSettingsChange={setSettings}
            isShiftPressed={isShiftPressed}
            canvasWidth={canvasWidth}
            canvasHeight={canvasHeight}
          />
        ) : (
          <div
            className="border border-gray-300 rounded flex items-center justify-center text-gray-500"
            style={{ width: canvasWidth, height: canvasHeight }}
          >
            Canvas Disabled
          </div>
        )}
      </div>

      <AngleControls
        angles={angles}
        onAnglesChange={setAngles}
        settings={settings}
        onSettingsChange={setSettings}
        isCanvasActive={isCanvasActive}
        onToggleCanvas={handleToggleCanvas}
      />
    </div>
  )
}
