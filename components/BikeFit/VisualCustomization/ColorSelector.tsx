import React from 'react'
import { cn } from '@/lib/utils'
import { COLOR_PALETTE } from '@/lib/constants'

interface ColorSelectorProps {
  label: string
  icon: React.ReactNode
  selectedColor: string
  onColorChange: (color: string) => void
}

export default function ColorSelector({
  label,
  icon,
  selectedColor,
  onColorChange
}: ColorSelectorProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-xs text-gray-600">
        {icon}
        <span>{label}</span>
      </div>
      <div className="flex">
        {COLOR_PALETTE.map((color, index) => (
          <button
            key={color}
            onClick={() => onColorChange(color)}
            className={cn(
              "w-6 h-6 transition-all relative",
              index === 0 && "rounded-l",
              index === COLOR_PALETTE.length - 1 && "rounded-r",
              selectedColor === color
                ? "scale-150 rounded z-10 shadow-md"
                : "hover:scale-105"
            )}
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
    </div>
  )
}
