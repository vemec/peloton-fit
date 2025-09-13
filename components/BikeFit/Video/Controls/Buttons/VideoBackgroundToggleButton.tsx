import { Video, VideoOff } from 'lucide-react'
import React from 'react'
import { Button } from '@/components/ui/button'
import { cn, getBaseButtonClasses } from '@/lib/utils'
import { show } from '@/lib/toast'

interface VideoBackgroundToggleButtonProps {
  isVideoHidden: boolean
  onToggleVideoBackground: () => void
}

export default function VideoBackgroundToggleButton({
  isVideoHidden,
  onToggleVideoBackground
}: VideoBackgroundToggleButtonProps) {
  const handleClick = () => {
    // Toggle the background visibility
    onToggleVideoBackground()

    // If the video was visible and now will be hidden, inform the user
    // Note: `isVideoHidden` is the current state before toggling
    if (!isVideoHidden) {
      show.info('Image hidden. The video keeps running to analyze movement.')
    } else {
      show.info('Image shown. The video is visible for analysis.')
    }
  }

  return (
    <Button
      onClick={handleClick}
      size="icon"
      className={cn(getBaseButtonClasses(), {'bg-red-500 hover:bg-red-600': isVideoHidden })}
      aria-label={isVideoHidden ? 'Show video' : 'Hide video'}
      title={isVideoHidden ? 'Show video' : 'Hide video'}
    >
      {isVideoHidden ? (
        <VideoOff className={cn('!w-5 !h-5 transition-all duration-200')} />
      ) : (
        <Video className={cn('!w-5 !h-5 transition-all duration-200')} />
      )}
    </Button>
  )
}
