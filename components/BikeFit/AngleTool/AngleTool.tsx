'use client'

import React from 'react'
import StatusIndicator from '@/components/BikeFit/Video/StatusIndicator'
import { AngleCanvas } from './AngleCanvas'
import { AngleControls } from './Controls'
import { useAngleTool } from './useAngleTool'

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
    isShiftPressed
  } = useAngleTool()

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="bg-white border-2 border-gray-300 rounded-lg shadow-lg p-4 mb-4">
        <div className="relative" style={{ width: canvasWidth, height: canvasHeight }}>
          {isCanvasActive && (
            <AngleCanvas
              angles={angles}
              onAnglesChange={setAngles}
              settings={settings}
              onSettingsChange={setSettings}
              isShiftPressed={isShiftPressed}
              canvasWidth={canvasWidth}
              canvasHeight={canvasHeight}
            />
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
