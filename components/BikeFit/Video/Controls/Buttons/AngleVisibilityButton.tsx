import { ChevronUp, ChevronDown, Eye, EyeClosed } from 'lucide-react'
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Switch } from '@/components/ui/switch'
import type { OverlayVisibility } from '@/types/overlay'
import { cn, getBaseButtonClasses } from '@/lib/utils'

interface AngleVisibilityButtonProps {
  overlayVisibility: OverlayVisibility
  onOverlayVisibilityChange: (visibility: OverlayVisibility) => void
}

export default function AngleVisibilityButton({
  overlayVisibility,
  onOverlayVisibilityChange
}: AngleVisibilityButtonProps) {
  const [angleViewSelectorOpen, setAngleViewSelectorOpen] = useState(false)

  // Estado para controlar si todos los ángulos están visibles
  const allAnglesVisible = Object.values(overlayVisibility.angles).every(Boolean)

  // Función para alternar todos los ángulos
  const toggleAllAngles = () => {
    const newVisibility = allAnglesVisible ? false : true
    onOverlayVisibilityChange({
      ...overlayVisibility,
      angles: {
        elbow: newVisibility,
        shoulder: newVisibility,
        hip: newVisibility,
        knee: newVisibility,
        ankle: newVisibility,
      },
    })
  }

  return (
    <div className={cn('flex items-center bg-slate-700/50 hover:bg-slate-600/60 rounded-full p-0 gap-1 transition-all duration-300 shadow-lg')}>
      <Popover open={angleViewSelectorOpen} onOpenChange={setAngleViewSelectorOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            className={cn('w-10 h-10 rounded-full bg-transparent hover:bg-transparent text-slate-200 hover:text-white cursor-pointer transition-all duration-300 ease-in-out')}
            size="icon"
            aria-label="Angle visibility"
          >
            {angleViewSelectorOpen ? (
              <ChevronDown className={cn('!w-5 !h-5 text-slate-300')} />
            ) : (
              <ChevronUp className={cn('!w-5 !h-5 text-slate-300')} />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className={cn('w-40 p-3 bg-white rounded-xl shadow-xl border border-gray-200')}>
          <div className={cn('space-y-3')}>
            {(
              [
                ['Elbow', 'elbow'],
                ['Shoulder', 'shoulder'],
                ['Hip', 'hip'],
                ['Knee', 'knee'],
                ['Ankle', 'ankle'],
              ] as const
            ).map(([label, key]) => (
              <label key={key} className={cn('flex items-center justify-between text-sm text-gray-700')}
              >
                <span className={cn('capitalize')}>{label}</span>
                <Switch
                  checked={overlayVisibility.angles[key]}
                  onCheckedChange={(checked) => onOverlayVisibilityChange({
                    ...overlayVisibility,
                    angles: { ...overlayVisibility.angles, [key]: !!checked },
                  })}
                />
              </label>
            ))}
          </div>
        </PopoverContent>
      </Popover>
      <Button
        onClick={toggleAllAngles}
        variant="ghost"
        size="icon"
        className={cn(getBaseButtonClasses())}
        aria-label="Angle visibility"
        title="Show/Hide angles"
      >
        {allAnglesVisible ? (
          <Eye className={cn('!w-5 !h-5 transition-all duration-200')} />
        ) : (
          <EyeClosed className={cn('!w-5 !h-5 transition-all duration-200')} />
        )}
      </Button>
    </div>
  )
}
