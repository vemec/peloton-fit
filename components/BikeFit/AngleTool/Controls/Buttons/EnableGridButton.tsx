import React from 'react'
import { Button } from '@/components/ui/button'
import { Grid2x2, Grid2x2X } from 'lucide-react'
import { getBaseButtonClasses } from '@/lib/utils'

interface EnableGridButtonProps {
  enabled: boolean
  onToggle: () => void
}

export function EnableGridButton({ enabled, onToggle }: EnableGridButtonProps) {
  return (
    <Button
      onClick={onToggle}
      aria-label={enabled ? 'Disable Grid' : 'Enable Grid'}
      title={enabled ? 'Disable Grid' : 'Enable Grid'}
      size="icon"
      className={getBaseButtonClasses()}
    >
      {enabled ? <Grid2x2X className="!w-5 !h-5 transition-all duration-200" /> : <Grid2x2 className="!w-5 !h-5 transition-all duration-200" />}
    </Button>
  )
}
