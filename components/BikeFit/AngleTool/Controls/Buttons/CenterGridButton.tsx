import React from 'react'
import { Button } from '@/components/ui/button'
import { cn, getBaseButtonClasses } from '@/lib/utils'
import { Shrink } from 'lucide-react'

interface CenterGridButtonProps {
  onCenterGrid: () => void
  disabled?: boolean
}

export function CenterGridButton({ onCenterGrid, disabled = false }: CenterGridButtonProps) {
  return (
    <Button
      onClick={onCenterGrid}
      disabled={disabled}
      aria-label="Center Grid"
      title="Center Grid"
      size="icon"
      className={cn(getBaseButtonClasses())}
    >
      <Shrink className="!w-5 !h-5 transition-all duration-200" />
    </Button>
  )
}
