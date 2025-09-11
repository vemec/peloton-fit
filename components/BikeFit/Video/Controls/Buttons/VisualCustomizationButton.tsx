import { Palette } from 'lucide-react'
import React from 'react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { VisualSettings } from '@/types/bikefit'
import BikeFitVisualCustomization from '../../../VisualCustomization'
import { cn, getBaseButtonClasses } from '@/lib/utils'

interface VisualCustomizationButtonProps {
  visualSettings: VisualSettings
  onVisualSettingsChange: (settings: VisualSettings) => void
}

export default function VisualCustomizationButton({
  visualSettings,
  onVisualSettingsChange
}: VisualCustomizationButtonProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(getBaseButtonClasses())}
        >
          <Palette className={cn('!w-5 !h-5 transition-all duration-200')} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className={cn('w-60 p-3 bg-white rounded-xl shadow-xl border border-gray-200')}>
        <BikeFitVisualCustomization
          settings={visualSettings}
          onSettingsChange={onVisualSettingsChange}
        />
      </PopoverContent>
    </Popover>
  )
}
