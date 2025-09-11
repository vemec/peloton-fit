import React from 'react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { RulerDimensionLine } from 'lucide-react'
import { getBaseButtonClasses } from '@/lib/utils'

interface GridDimensionsSelectorProps {
  size: number
  onSizeChange: (size: number) => void
  angle: number
  onAngleChange: (angle: number) => void
  disabled?: boolean
}

export function GridDimensionsSelector({
  size,
  onSizeChange,
  angle,
  onAngleChange,
  disabled = false
}: GridDimensionsSelectorProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          size="icon"
          className={getBaseButtonClasses()}
          disabled={disabled}
          aria-label="Grid Dimensions Settings"
          title="Grid Dimensions Settings"
        >
          <RulerDimensionLine className="!w-5 !h-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="start">
        <div className="space-y-4">
          <h4 className="font-semibold text-sm text-gray-900">Grid Dimensions</h4>

          {/* Size Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Grid Size (NxN): {size}
            </label>
            <div className="space-y-2">
              <input
                type="range"
                min="5"
                max="50"
                value={size}
                onChange={(e) => onSizeChange(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>5</span>
                <span>50</span>
              </div>
            </div>
          </div>

          {/* Angle Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Grid Angle: {angle.toFixed(1)}°
            </label>
            <div className="space-y-2">
              <input
                type="range"
                min="-180"
                max="180"
                step="1"
                value={angle}
                onChange={(e) => onAngleChange(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>-180°</span>
                <span>0°</span>
                <span>180°</span>
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
