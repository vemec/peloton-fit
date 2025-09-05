import React from 'react'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { RotateCcw } from 'lucide-react'
import type { VisualSettings } from '@/types/bikefit'
import { VISUAL_RANGES } from '@/lib/constants'
import { useVisualCustomization } from './useVisualCustomization'
import ColorSelector from './ColorSelector'

interface BikeFitVisualCustomizationProps {
  settings: VisualSettings
  onSettingsChange: (settings: VisualSettings) => void
}

export default function BikeFitVisualCustomization({
  settings,
  onSettingsChange
}: BikeFitVisualCustomizationProps) {

  const {
    updateSetting,
    resetToDefaults,
    isDefaultSettings
  } = useVisualCustomization(settings, onSettingsChange)

  return (
    <div className="space-y-4">
      {/* Header with Reset Button */}
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium text-slate-700">Colors</Label>
        <Button
          onClick={resetToDefaults}
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-xs text-slate-500 hover:text-slate-700"
          disabled={isDefaultSettings}
        >
          <RotateCcw className="w-3 h-3" />
        </Button>
      </div>

      {/* Line Colors */}
      <ColorSelector
        label="Lines"
        icon={<div className="w-3 h-0.5 bg-gray-400 rounded"></div>}
        selectedColor={settings.lineColor}
        onColorChange={(color) => updateSetting('lineColor', color)}
      />

      {/* Point Colors */}
      <ColorSelector
        label="Points"
        icon={<div className="w-3 h-3 bg-gray-400 rounded-full"></div>}
        selectedColor={settings.pointColor}
        onColorChange={(color) => updateSetting('pointColor', color)}
      />

      {/* Dimensions */}
      <div className="space-y-3">
        <Label className="text-xs font-medium text-slate-600">Dimensions</Label>

        <div className="space-y-3">
          {/* Line Width */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-600">Line Width</span>
              <span className="text-xs text-slate-500 font-mono">
                {settings.lineWidth}px
              </span>
            </div>
            <Slider
              value={[settings.lineWidth]}
              min={VISUAL_RANGES.LINE_WIDTH.min}
              max={VISUAL_RANGES.LINE_WIDTH.max}
              step={VISUAL_RANGES.LINE_WIDTH.step}
              onValueChange={(value) => updateSetting('lineWidth', value[0])}
              className="w-full"
            />
          </div>

          {/* Point Size */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-600">Point Size</span>
              <span className="text-xs text-slate-500 font-mono">
                {settings.pointRadius}px
              </span>
            </div>
            <Slider
              value={[settings.pointRadius]}
              min={VISUAL_RANGES.POINT_RADIUS.min}
              max={VISUAL_RANGES.POINT_RADIUS.max}
              step={VISUAL_RANGES.POINT_RADIUS.step}
              onValueChange={(value) => updateSetting('pointRadius', value[0])}
              className="w-full"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
