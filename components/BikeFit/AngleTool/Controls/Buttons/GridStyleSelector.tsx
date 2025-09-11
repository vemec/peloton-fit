import React from 'react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Slider } from '@/components/ui/slider'
import { PaintBucket } from 'lucide-react'
import { getBaseButtonClasses } from '@/lib/utils'

interface GridStyleSelectorProps {
  color: string
  onColorChange: (color: string) => void
  lineType: 'solid' | 'dashed' | 'dotted'
  onLineTypeChange: (lineType: 'solid' | 'dashed' | 'dotted') => void
  lineWidth: number
  onLineWidthChange: (lineWidth: number) => void
  disabled?: boolean
}

export function GridStyleSelector({
  color,
  onColorChange,
  lineType,
  onLineTypeChange,
  lineWidth,
  onLineWidthChange,
  disabled = false
}: GridStyleSelectorProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          size="icon"
          className={getBaseButtonClasses()}
          disabled={disabled}
          aria-label="Grid Style Settings"
          title="Grid Style Settings"
        >
          <PaintBucket className="!w-5 !h-5 transition-all duration-200" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="start">
        <div className="space-y-4">
          <h4 className="font-semibold text-sm text-gray-900">Grid Appearance</h4>

          {/* Color Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Grid Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={color}
                onChange={(e) => onColorChange(e.target.value)}
                className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
              />
              <span className="text-sm text-gray-600">{color}</span>
            </div>
          </div>

          {/* Line Type Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Line Style</label>
            <div className="grid grid-cols-3 gap-2">
              {(['solid', 'dashed', 'dotted'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => onLineTypeChange(type)}
                  className={`p-2 border rounded-md text-sm font-medium transition-all duration-200 ${
                    lineType === type
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400 text-gray-600'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Line Width Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Line Width: {lineWidth}px</label>
            <Slider
              value={[lineWidth]}
              onValueChange={(value) => onLineWidthChange(value[0])}
              min={1}
              max={10}
              step={1}
              className="w-full"
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
