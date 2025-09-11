import { FlipHorizontal } from 'lucide-react'
import React from 'react'
import { Button } from '@/components/ui/button'
import { cn, getBaseButtonClasses } from '@/lib/utils'

interface FlipHorizontalButtonProps {
  isFlipped: boolean
  onFlipToggle: () => void
}

export default function FlipHorizontalButton({
  isFlipped,
  onFlipToggle
}: FlipHorizontalButtonProps) {
  return (
    <Button
      onClick={onFlipToggle}
      size="icon"
      className={cn(getBaseButtonClasses(), {'bg-blue-500 hover:bg-blue-600': isFlipped})}
    >
      <FlipHorizontal className={cn('!w-5 !h-5 transition-all duration-200')} />
    </Button>
  )
}
