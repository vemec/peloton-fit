import React from 'react'
import { Button } from '@/components/ui/button'
import { cn, getBaseButtonClasses } from '@/lib/utils'
import { Power, PowerOff } from 'lucide-react'

interface ToggleCanvasButtonProps {
  isCanvasActive: boolean
  onToggleCanvas: () => void
}

export function ToggleCanvasButton({ isCanvasActive, onToggleCanvas }: ToggleCanvasButtonProps) {
  return (
    <Button
      onClick={onToggleCanvas}
      size="icon"
      aria-label={isCanvasActive ? 'Disable Canvas' : 'Enable Canvas'}
      title={isCanvasActive ? 'Disable Canvas' : 'Enable Canvas'}
      className={getBaseButtonClasses()}
    >
      {isCanvasActive ? <PowerOff className={cn('!w-5 !h-5 transition-all duration-200')} /> : <Power className={cn('!w-5 !h-5 transition-all duration-200')} />}
    </Button>
  )
}
