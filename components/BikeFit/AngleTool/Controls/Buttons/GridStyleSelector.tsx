import React from 'react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { PaintBucket } from 'lucide-react'
import { getBaseButtonClasses } from '@/lib/utils'

interface GridStyleSelectorProps {
  color: string
  onColorChange: (color: string) => void
  lineType: 'solid' | 'dashed' | 'dotted'
  onLineTypeChange: (lineType: 'solid' | 'dashed' | 'dotted') => void
  disabled?: boolean
}

export function GridStyleSelector({
  color,
  onColorChange,
  lineType,
  onLineTypeChange,
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

          {/* Preview */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Preview</label>
            <div className="border border-gray-300 rounded-md p-3 bg-gray-50">
              <svg width="100%" height="40" className="w-full">
                <defs>
                  <pattern
                    id="preview-grid"
                    width="20"
                    height="20"
                    patternUnits="userSpaceOnUse"
                  >
                    <path
                      d={`M 20 0 L 0 0 0 20`}
                      fill="none"
                      stroke={color}
                      strokeWidth="1"
                      strokeDasharray={
                        lineType === 'dashed' ? '5,5' :
                        lineType === 'dotted' ? '2,4' : 'none'
                      }
                    />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#preview-grid)" />
              </svg>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
