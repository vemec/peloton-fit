import { Proportions, Check } from 'lucide-react'
import React from 'react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { RESOLUTIONS } from '../../constants'
import { cn, getBaseButtonClasses } from '@/lib/utils'

interface ResolutionSelectorButtonProps {
  selectedResolution: string
  onResolutionChange: (resolution: string) => void
}

export default function ResolutionSelectorButton({
  selectedResolution,
  onResolutionChange
}: ResolutionSelectorButtonProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(getBaseButtonClasses())}
        >
          <Proportions className={cn('!w-5 !h-5 transition-all duration-200')} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className={cn('w-60 p-3 bg-white rounded-xl shadow-xl border border-gray-200')}>
        <div className={cn('space-y-1')}>
          {RESOLUTIONS.map(resolution => {
            const isSelected = selectedResolution === resolution.value
            const IconComponent = resolution.icon

            return (
              <button
                key={resolution.value}
                onClick={() => onResolutionChange(resolution.value)}
                className={cn(
                  'w-full p-3 rounded-lg transition-all duration-200 text-left flex items-center gap-3',
                  isSelected ? 'bg-purple-50 text-purple-900' : 'text-gray-700 hover:bg-gray-50'
                )}
              >
                <IconComponent className={cn('w-4 h-4', isSelected ? 'text-purple-600' : 'text-gray-400')} />
                <span className={cn('text-sm font-medium')}>
                  {resolution.label}
                </span>
                {isSelected && <Check className={cn('w-4 h-4 text-purple-600 ml-auto')} />}
              </button>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}
