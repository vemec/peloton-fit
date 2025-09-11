import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface RecordingButtonProps {
  isActive: boolean
  isRecording: boolean
  onStartRecording: () => void
  onStopRecording: () => void
}

export default function RecordingButton({
  isActive,
  isRecording,
  onStartRecording,
  onStopRecording
}: RecordingButtonProps) {
  const [recordingTime, setRecordingTime] = useState(0)

  // Timer for recording
  useEffect(() => {
    if (!isRecording) {
      setRecordingTime(0)
      return
    }

    const interval = setInterval(() => {
      setRecordingTime(prev => prev + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [isRecording])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className={cn('flex items-center bg-slate-700/50 hover:bg-slate-600/60 rounded-full p-0 gap-1 transition-all duration-300 shadow-lg')}>
      <Button
        onClick={isRecording ? onStopRecording : onStartRecording}
        disabled={!isActive}
        size="icon"
        className={cn(
          'w-12 h-12 bg-white rounded-full border-2 cursor-pointer transition-all duration-300 ease-in-out hover:bg-white',
          'text-white disabled:opacity-50 disabled:cursor-not-allowed'
        )}
      >
        <div
          className={cn(
            'w-6 h-6 rounded bg-red-500 hover:bg-red-400 focus:bg-red-300 border-red-400 hover:border-red-300 focus:border-red-200 focus:ring-red-400 transition-all duration-200',
            !isRecording && 'w-10 h-10 rounded-full'
          )}
        />
      </Button>
      <div className={cn('px-4 py-2 font-mono text-sm min-w-[60px] text-center text-slate-200')}>
        {formatTime(recordingTime)}
      </div>
    </div>
  )
}
