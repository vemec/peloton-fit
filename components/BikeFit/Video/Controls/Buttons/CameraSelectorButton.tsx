import { Camera, Check, ChevronUp, ChevronDown, Play, Square } from 'lucide-react'
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { CameraDevice } from '@/types/bikefit'
import { cn, getBaseButtonClasses } from '@/lib/utils'

interface CameraSelectorButtonProps {
  devices: CameraDevice[]
  selectedDeviceId: string | null
  isActive: boolean
  onDeviceChange: (deviceId: string | null) => void
  onStartCamera: () => void
  onStopCamera: () => void
}

export default function CameraSelectorButton({
  devices,
  selectedDeviceId,
  isActive,
  onDeviceChange,
  onStartCamera,
  onStopCamera
}: CameraSelectorButtonProps) {
  const [cameraSelectorOpen, setCameraSelectorOpen] = useState(false)

  return (
    <div className={cn('flex items-center bg-slate-700/50 hover:bg-slate-800/60 rounded-full p-0 gap-0 transition-all duration-300 shadow-lg')}>
      <Popover open={cameraSelectorOpen} onOpenChange={setCameraSelectorOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            aria-label="Seleccionar cámara"
            className={cn('w-10 h-10 rounded-full bg-transparent hover:bg-transparent text-slate-200 hover:text-white cursor-pointer transition-all duration-300 ease-in-out')}
          >
            {cameraSelectorOpen ? (
              <ChevronDown className={cn('!w-5 !h-5 text-slate-300')} />
            ) : (
              <ChevronUp className={cn('!w-5 !h-5 text-slate-300')} />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className={cn('w-60 p-3 bg-white rounded-xl shadow-xl border border-gray-200')}>
          <div className={cn('space-y-1')}>
            {devices.length === 0 ? (
              <div className={cn('p-3 text-center')}>
                <p className={cn('text-sm text-gray-500')}>Sin cámaras</p>
              </div>
            ) : (
              devices.map(device => {
                const cleanLabel = device.label
                  .replace(/\s*\([^)]*\)$/,'')
                  .replace(/\s+/g, ' ')
                  .trim()

                const isSelected = selectedDeviceId === device.deviceId

                return (
                  <button
                    key={device.deviceId}
                    onClick={() => onDeviceChange(device.deviceId)}
                    className={cn(
                      'w-full p-3 rounded-lg transition-all duration-200 text-left flex items-center gap-3',
                      isSelected ? 'bg-blue-50 text-blue-900' : 'text-gray-700 hover:bg-gray-50'
                    )}
                  >
                    <Camera className={cn('w-4 h-4', isSelected ? 'text-blue-600' : 'text-gray-400')} />
                    <span className={cn('text-sm font-medium')}>
                      {cleanLabel || 'Cámara sin nombre'}
                    </span>
                    {isSelected && <Check className={cn('w-4 h-4 text-blue-600 ml-auto')} />}
                  </button>
                )
              })
            )}
          </div>
        </PopoverContent>
      </Popover>

      <Button
        onClick={isActive ? onStopCamera : onStartCamera}
        disabled={!selectedDeviceId}
        size="icon"
        aria-label={isActive ? 'Detener cámara' : 'Iniciar cámara'}
        className={cn(getBaseButtonClasses())}
      >
        {isActive ? (
          <Square size={20} className={cn('!w-5 !h-5 transition-transform duration-300')} />
        ) : (
          <Play size={20} className={cn('!w-5 !h-5 transition-transform duration-300')} />
        )}
      </Button>
    </div>
  )
}
