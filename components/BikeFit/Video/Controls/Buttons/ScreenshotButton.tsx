import { Aperture, ClockFading, Check } from 'lucide-react'
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn, getBaseButtonClasses } from '@/lib/utils'

interface ScreenshotButtonProps {
  isActive: boolean
  onCaptureScreenshot: () => void
}

export default function ScreenshotButton({
  isActive,
  onCaptureScreenshot
}: ScreenshotButtonProps) {
  const [delaySelectorOpen, setDelaySelectorOpen] = useState(false)
  const [screenshotDelay, setScreenshotDelay] = useState(0)
  const [countdown, setCountdown] = useState(0)

  const handleCaptureScreenshot = () => {
    if (screenshotDelay > 0) {
      let remaining = screenshotDelay
      setCountdown(remaining)

      const countdownTimer = () => {
        remaining -= 1
        setCountdown(remaining)

        if (remaining <= 0) {
          onCaptureScreenshot()
        } else {
          setTimeout(countdownTimer, 1000)
        }
      }

      setTimeout(countdownTimer, 1000)
    } else {
      onCaptureScreenshot()
    }
  }

  return (
    <div className={cn('flex items-center bg-slate-700/50 hover:bg-slate-600/60 rounded-full p-0 gap-1 transition-all duration-300 shadow-lg')}>
      <Button
        onClick={handleCaptureScreenshot}
        disabled={!isActive || countdown > 0}
        size="icon"
        className={cn(getBaseButtonClasses(), {'bg-red-500 disabled:opacity-100 font-mono': countdown > 0})}
      >
        {countdown > 0 ? (
          <span className={cn('text-lg font-bold')}>{countdown}</span>
        ) : (
          <Aperture className={cn('!w-5 !h-5 transition-all duration-200')} />
        )}
      </Button>
      <Popover open={delaySelectorOpen} onOpenChange={setDelaySelectorOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn(getBaseButtonClasses())}
          >
            <ClockFading className={cn('!w-5 !h-5 transition-all duration-200')} />
          </Button>
        </PopoverTrigger>
        <PopoverContent className={cn('w-40 p-3 bg-white rounded-xl shadow-xl border border-gray-200')}>
          <div className={cn('space-y-1')}>
            {[0, 3, 5, 10, 15].map(delay => {
              const isSelected = screenshotDelay === delay
              return (
                <button
                  key={delay}
                  onClick={() => setScreenshotDelay(delay)}
                  className={cn(
                    'w-full p-3 rounded-lg transition-all duration-200 text-left flex items-center gap-3',
                    isSelected ? 'bg-blue-50 text-blue-900' : 'text-gray-700 hover:bg-gray-50'
                  )}
                >
                  <span className={cn('text-sm font-medium')}>
                    {delay === 0 ? 'Sin delay' : `${delay}s`}
                  </span>
                  {isSelected && <Check className={cn('w-4 h-4 text-blue-600 ml-auto')} />}
                </button>
              )
            })}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
