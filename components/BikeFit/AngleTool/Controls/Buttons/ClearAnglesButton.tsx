import React from 'react'
import { Button } from '@/components/ui/button'
import { cn, getBaseButtonClasses } from '@/lib/utils'
import { Eraser } from 'lucide-react'

interface ClearAnglesButtonProps {
  anglesCount: number
  onClearAngles: () => void
}

export function ClearAnglesButton({ anglesCount, onClearAngles }: ClearAnglesButtonProps) {
  return (
    <Button
      onClick={onClearAngles}
      size="icon"
      aria-label="Clear All Angles"
      title="Clear All Angles"
      className={getBaseButtonClasses()}
      disabled={anglesCount === 0}
    >
      <Eraser className={cn('!w-5 !h-5 transition-all duration-200')} />
    </Button>
  )
}
