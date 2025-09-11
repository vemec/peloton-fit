import { Video, VideoOff } from 'lucide-react'
import React from 'react'
import { Button } from '@/components/ui/button'
import { cn, getBaseButtonClasses } from '@/lib/utils'

interface VideoBackgroundToggleButtonProps {
  isVideoHidden: boolean
  onToggleVideoBackground: () => void
}

export default function VideoBackgroundToggleButton({
  isVideoHidden,
  onToggleVideoBackground
}: VideoBackgroundToggleButtonProps) {
  return (
    <Button
      onClick={onToggleVideoBackground}
      size="icon"
      className={cn(getBaseButtonClasses(), {'bg-red-500 hover:bg-red-600': isVideoHidden })}
      aria-label={isVideoHidden ? 'Mostrar video' : 'Ocultar video'}
      title={isVideoHidden ? 'Mostrar video' : 'Ocultar video'}
    >
      {isVideoHidden ? (
        <VideoOff className={cn('!w-5 !h-5 transition-all duration-200')} />
      ) : (
        <Video className={cn('!w-5 !h-5 transition-all duration-200')} />
      )}
    </Button>
  )
}
