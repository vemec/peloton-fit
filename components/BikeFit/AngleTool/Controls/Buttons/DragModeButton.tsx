import React from 'react'
import { Button } from '@/components/ui/button'
import { cn, getBaseButtonClasses } from '@/lib/utils'
import { Hand, HandGrab } from 'lucide-react'

interface DragModeButtonProps {
  isDragGridMode: boolean
  onToggleDragMode: () => void
  disabled?: boolean
}

export function DragModeButton({ isDragGridMode, onToggleDragMode, disabled = false }: DragModeButtonProps) {
  return (
    <Button
      onClick={onToggleDragMode}
      disabled={disabled}
      aria-label={isDragGridMode ? 'Disable Drag Mode' : 'Enable Drag Mode'}
      title={isDragGridMode ? 'Disable Drag Mode' : 'Enable Drag Mode'}
      size="icon"
      className={cn(getBaseButtonClasses(), {'bg-green-500 hover:bg-green-600 text-white': isDragGridMode})}
    >
      {isDragGridMode ? <HandGrab className="!w-5 !h-5 transition-all duration-200" /> : <Hand className="!w-5 !h-5 transition-all duration-200" />}
    </Button>
  )
}
