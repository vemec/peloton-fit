import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface RecordingControlsProps {
  isActive: boolean
  isRecording: boolean
  onStartRecording: () => void
  onStopRecording: () => void
}

export default function RecordingControls({
  isActive,
  isRecording,
  onStartRecording,
  onStopRecording
}: RecordingControlsProps) {
  if (!isActive) return null

  return (
    <Card className="border-0 shadow-md bg-white/60 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-slate-700">
          <div className="p-1.5 rounded-lg bg-red-50 border border-red-100">
            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          Video Recording
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex gap-3">
          {!isRecording ? (
            <Button
              onClick={onStartRecording}
              className="flex items-center gap-2 h-11 px-6 bg-red-600 hover:bg-red-700 text-white flex-1"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="8"/>
              </svg>
              Start Recording
            </Button>
          ) : (
            <Button
              onClick={onStopRecording}
              className="flex items-center gap-2 h-11 px-6 bg-red-600 hover:bg-red-700 text-white flex-1"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="6" width="12" height="12" rx="2"/>
              </svg>
              Stop Recording
            </Button>
          )}

          {isRecording && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 border border-red-200">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-red-700">Recording</span>
            </div>
          )}
        </div>

        {/* Recording status */}
        <div className={`rounded-lg p-4 border ${
          isRecording
            ? 'bg-red-50 border-red-200'
            : 'bg-gray-50 border-gray-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-2.5 h-2.5 rounded-full ${
              isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-400'
            }`}></div>
            <span className={`font-medium ${
              isRecording ? 'text-red-800' : 'text-gray-600'
            }`}>
              {isRecording ? 'Recording in progress...' : 'Ready to record'}
            </span>
          </div>
          <p className={`text-sm mt-1 ${
            isRecording ? 'text-red-600' : 'text-gray-500'
          }`}>
            {isRecording
              ? 'Video will be saved automatically when stopped'
              : 'Click Start Recording to capture your bike fit session'
            }
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
