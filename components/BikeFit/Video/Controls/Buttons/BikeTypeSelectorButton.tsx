import { Bike, Check } from 'lucide-react'
import React from 'react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { BikeType } from '@/types/bikefit'
import { cn, getBaseButtonClasses } from '@/lib/utils'

interface BikeTypeSelectorButtonProps {
  bikeType: BikeType
  onBikeTypeChange: (type: BikeType) => void
}

export default function BikeTypeSelectorButton({
  bikeType,
  onBikeTypeChange
}: BikeTypeSelectorButtonProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(getBaseButtonClasses())}
        >
          <Bike className={cn('!w-5 !h-5')} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className={cn('w-80 p-3 bg-white rounded-xl shadow-xl border border-gray-200')}>
        <div className={cn('space-y-1')}>
          {['road', 'triathlon', 'mountain'].map((type) => {
            const isSelected = bikeType === type
            const displayName = type === 'road' ? 'Bicicleta de Ruta' : type === 'triathlon' ? 'Bicicleta de Triatlón' : 'Bicicleta de Montaña'
            return (
              <button
                key={type}
                onClick={() => onBikeTypeChange(type as BikeType)}
                className={cn(
                  'w-full p-3 rounded-lg transition-all duration-200 text-left flex items-center gap-3',
                  isSelected ? 'bg-blue-50 text-blue-900' : 'text-gray-700 hover:bg-gray-50'
                )}
              >
                <Bike className={cn('w-4 h-4', isSelected ? 'text-blue-600' : 'text-gray-400')} />
                <span className={cn('text-sm font-medium')}>
                  {displayName}
                </span>
                {isSelected && <Check className={cn('w-4 h-4 text-blue-600 ml-auto')} />}
              </button>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}
