import React from 'react'
import { Button } from '@/components/ui/button'
import { PersonStanding } from 'lucide-react'
import { SKELETON_MODES } from '../../../Drawing'
import type { SkeletonMode } from '@/types/bikefit'
import { cn, getBaseButtonClasses } from '@/lib/utils'

interface SkeletonModeSelectorButtonProps {
  selectedMode: SkeletonMode
  onModeChange: (mode: SkeletonMode) => void
}

export default function SkeletonModeSelectorButton({
  selectedMode,
  onModeChange,
}: SkeletonModeSelectorButtonProps) {
  const isFullMode = selectedMode === SKELETON_MODES.FULL

  const handleToggle = () => {
    const newMode = isFullMode ? SKELETON_MODES.SIDE_FULL : SKELETON_MODES.FULL
    onModeChange(newMode)
  }

  return (
    <Button
      onClick={handleToggle}
      size="icon"
      className={cn(getBaseButtonClasses(), {'bg-green-500 hover:bg-green-600': isFullMode })}
      title={isFullMode ? 'Esqueleto Completo' : 'Esqueleto Lateral'}
    >
      <PersonStanding className={cn('!w-6 !h-6 transition-all duration-200')} />
    </Button>
  )
}
