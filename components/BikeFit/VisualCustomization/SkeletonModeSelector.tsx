import React from 'react'
import { Button } from '@/components/ui/button'
import { PersonStanding } from 'lucide-react'
import { SKELETON_MODES } from '../Drawing'
import type { SkeletonMode } from '@/types/bikefit'
import { cn } from '@/lib/utils'

interface SkeletonModeSelectorProps {
  selectedMode: SkeletonMode
  onModeChange: (mode: SkeletonMode) => void
}

export default function SkeletonModeSelector({
  selectedMode,
  onModeChange,
}: SkeletonModeSelectorProps) {
  const isFullMode = selectedMode === SKELETON_MODES.FULL

  const handleToggle = () => {
    const newMode = isFullMode ? SKELETON_MODES.SIDE_FULL : SKELETON_MODES.FULL
    onModeChange(newMode)
  }

  return (
    <Button
      onClick={handleToggle}
      size="icon"
      className={cn(
        'w-12 h-12 rounded-full border-2 cursor-pointer transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 shadow-lg hover:shadow-xl',
        isFullMode
          ? 'bg-green-500 hover:bg-green-400 focus:bg-green-300 border-green-400 hover:border-green-300 focus:border-green-200 text-white focus:ring-green-400'
          : 'bg-slate-700/50 hover:bg-slate-600/60 focus:bg-slate-500/70 text-slate-200 hover:text-white border-slate-600/40 hover:border-slate-500/60 focus:border-slate-400/70 focus:ring-slate-400/50'
      )}
      title={isFullMode ? 'Esqueleto Completo' : 'Esqueleto Lateral'}
    >
      <PersonStanding className={cn('!w-5 !h-5 transition-all duration-200')} />
    </Button>
  )
}
