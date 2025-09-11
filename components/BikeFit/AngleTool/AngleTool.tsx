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

export function AngleTool({ canvasWidth = 800, canvasHeight = 600 }: AngleToolProps) {
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
    <div className="grid gap-4 absolute top-0">
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
