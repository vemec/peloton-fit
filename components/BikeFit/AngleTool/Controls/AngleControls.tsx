import React from 'react'
import type { Angle, AngleToolSettings } from '@/types/angle-tool'
import { AnglesList } from './AnglesList'
import {
  ToggleCanvasButton,
  ClearAnglesButton,
  EnableGridButton,
  DragModeButton,
  CenterGridButton,
  GridStyleSelector,
  GridDimensionsSelector
} from './Buttons'
import { cn } from '@/lib/utils'

interface AngleControlsProps {
  angles: Angle[]
  onAnglesChange: (angles: Angle[]) => void
  settings: AngleToolSettings
  onSettingsChange: (settings: AngleToolSettings) => void
  isCanvasActive: boolean
  onToggleCanvas: () => void
}

export function AngleControls({
  angles,
  onAnglesChange,
  settings,
  onSettingsChange,
  isCanvasActive,
  onToggleCanvas
}: AngleControlsProps) {
  const handleClearAngles = () => {
    onAnglesChange([])
  }

  const handleDeleteAngle = (angleId: string) => {
    onAnglesChange(angles.filter(a => a.id !== angleId))
  }

  const handleToggleGrid = () => {
    onSettingsChange({
      ...settings,
      canvasGrid: { ...settings.canvasGrid, enabled: !settings.canvasGrid.enabled }
    })
  }

  const handleToggleDragMode = () => {
    onSettingsChange({
      ...settings,
      isDragGridMode: !settings.isDragGridMode
    })
  }

  const handleCenterGrid = () => {
    onSettingsChange({
      ...settings,
      canvasGrid: {
        ...settings.canvasGrid,
        position: { x: -400, y: -300 } // Reset to center
      }
    })
  }

  const handleColorChange = (color: string) => {
    onSettingsChange({
      ...settings,
      canvasGrid: { ...settings.canvasGrid, color }
    })
  }

  const handleLineTypeChange = (lineType: 'solid' | 'dashed' | 'dotted') => {
    onSettingsChange({
      ...settings,
      canvasGrid: { ...settings.canvasGrid, lineType }
    })
  }

  const handleSizeChange = (size: number) => {
    onSettingsChange({
      ...settings,
      canvasGrid: { ...settings.canvasGrid, size }
    })
  }

  const handleAngleChange = (angle: number) => {
    onSettingsChange({
      ...settings,
      canvasGrid: { ...settings.canvasGrid, angle }
    })
  }

  return (
    <div className={cn('flex flex-col gap-4')}>
      <div className={cn('flex items-center bg-slate-400 rounded-full p-2 gap-2 mx-auto')}>
        <ToggleCanvasButton
          isCanvasActive={isCanvasActive}
          onToggleCanvas={onToggleCanvas}
        />
        <ClearAnglesButton
          anglesCount={angles.length}
          onClearAngles={handleClearAngles}
        />
        <div className={cn('flex items-center bg-slate-700/50 hover:bg-slate-600/60 rounded-full p-0 gap-1 transition-all duration-300 shadow-lg')}>
          <EnableGridButton
            enabled={settings.canvasGrid.enabled}
            onToggle={handleToggleGrid}
          />
          <DragModeButton
            isDragGridMode={settings.isDragGridMode}
            onToggleDragMode={handleToggleDragMode}
            disabled={!settings.canvasGrid.enabled}
          />
          <CenterGridButton
            onCenterGrid={handleCenterGrid}
            disabled={!settings.canvasGrid.enabled}
          />
          <GridStyleSelector
            color={settings.canvasGrid.color}
            onColorChange={handleColorChange}
            lineType={settings.canvasGrid.lineType}
            onLineTypeChange={handleLineTypeChange}
            disabled={!settings.canvasGrid.enabled}
          />
          <GridDimensionsSelector
            size={settings.canvasGrid.size}
            onSizeChange={handleSizeChange}
            angle={settings.canvasGrid.angle}
            onAngleChange={handleAngleChange}
            disabled={!settings.canvasGrid.enabled}
          />
        </div>
      </div>
      <AnglesList
        angles={angles}
        onDeleteAngle={handleDeleteAngle}
      />
    </div>
  )
}
