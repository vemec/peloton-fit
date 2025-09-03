import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import type { VisualSettings } from '../types'

interface VisualCustomizationProps {
  settings: VisualSettings
  onSettingsChange: (settings: VisualSettings) => void
}

export default function VisualCustomization({
  settings,
  onSettingsChange
}: VisualCustomizationProps) {

  const updateSetting = <K extends keyof VisualSettings>(
    key: K,
    value: VisualSettings[K]
  ) => {
    onSettingsChange({
      ...settings,
      [key]: value
    })
  }

  return (
    <Card className="bg-white/70 backdrop-blur-lg border border-purple-200/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-slate-700 text-base">
          🎨 Visual Customization
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Compact layout in a single row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-center">
          {/* Line Color */}
          <div className="flex items-center gap-2">
            <Label htmlFor="lineColor" className="text-xs font-medium text-slate-600">Lines</Label>
            <input
              id="lineColor"
              type="color"
              value={settings.lineColor}
              onChange={(e) => updateSetting('lineColor', e.target.value)}
              className="w-7 h-7 border border-purple-200/60 rounded-md cursor-pointer hover:border-purple-300 transition-colors"
            />
          </div>

          {/* Point Color */}
          <div className="flex items-center gap-2">
            <Label htmlFor="pointColor" className="text-xs font-medium text-slate-600">Points</Label>
            <input
              id="pointColor"
              type="color"
              value={settings.pointColor}
              onChange={(e) => updateSetting('pointColor', e.target.value)}
              className="w-7 h-7 border border-purple-200/60 rounded-md cursor-pointer hover:border-purple-300 transition-colors"
            />
          </div>

          {/* Line Width */}
          <div className="flex items-center gap-2">
            <Label htmlFor="lineWidth" className="text-xs font-medium text-slate-600 whitespace-nowrap">Width</Label>
            <Slider
              id="lineWidth"
              value={[settings.lineWidth]}
              min={1}
              max={12}
              step={1}
              onValueChange={(value) => updateSetting('lineWidth', value[0])}
              className="flex-1 min-w-[60px]"
            />
            <span className="text-xs text-slate-500 font-mono min-w-[25px]">{settings.lineWidth}</span>
          </div>

          {/* Point Size */}
          <div className="flex items-center gap-2">
            <Label htmlFor="pointRadius" className="text-xs font-medium text-slate-600 whitespace-nowrap">Size</Label>
            <Slider
              id="pointRadius"
              value={[settings.pointRadius]}
              min={1}
              max={20}
              step={1}
              onValueChange={(value) => updateSetting('pointRadius', value[0])}
              className="flex-1 min-w-[60px]"
            />
            <span className="text-xs text-slate-500 font-mono min-w-[25px]">{settings.pointRadius}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
