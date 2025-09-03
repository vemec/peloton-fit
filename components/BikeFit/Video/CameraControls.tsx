import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import type { CameraDevice, StreamSettings } from './hooks'

interface CameraControlsProps {
  devices: CameraDevice[]
  selectedDeviceId: string | null
  selectedResolution: string
  selectedFps: number
  isActive: boolean
  currentSettings: StreamSettings | null
  error: string | null
  onDeviceChange: (deviceId: string | null) => void
  onResolutionChange: (resolution: string) => void
  onFpsChange: (fps: number) => void
  onStartCamera: () => void
  onStopCamera: () => void
  onRefreshDevices: () => void
}

export default function CameraControls({
  devices,
  selectedDeviceId,
  selectedResolution,
  selectedFps,
  isActive,
  currentSettings,
  error,
  onDeviceChange,
  onResolutionChange,
  onFpsChange,
  onStartCamera,
  onStopCamera,
  onRefreshDevices
}: CameraControlsProps) {
  return (
    <Card className="border-0 shadow-md bg-white/60 backdrop-blur-sm">
      <CardHeader className="pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-50 border border-blue-100">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <CardTitle className="text-xl font-semibold text-gray-900">Camera Setup</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Configure your camera for optimal analysis</p>
            </div>
          </div>

          {/* Status Indicator */}
          <div className="flex items-center gap-2">
            {isActive ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 border border-green-200">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-700">Live</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 border border-gray-200">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <span className="text-sm font-medium text-gray-600">Offline</span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Configuration Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Camera Device */}
          <div className="space-y-3">
            <Label htmlFor="camera" className="text-sm font-medium text-gray-700">Camera Device</Label>
            <Select
              value={selectedDeviceId ?? 'no-camera'}
              onValueChange={(value) => onDeviceChange(value === 'no-camera' ? null : value)}
            >
              <SelectTrigger id="camera" className="h-11 border-gray-200 hover:border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                <SelectValue placeholder="Select camera" />
              </SelectTrigger>
              <SelectContent>
                {devices.length === 0 ? (
                  <SelectItem value="no-camera" disabled>No cameras available</SelectItem>
                ) : (
                  devices.map(device => (
                    <SelectItem key={device.deviceId} value={device.deviceId}>
                      {device.label}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Resolution */}
          <div className="space-y-3">
            <Label htmlFor="resolution" className="text-sm font-medium text-gray-700">Resolution</Label>
            <Select value={selectedResolution} onValueChange={onResolutionChange}>
              <SelectTrigger id="resolution" className="h-11 border-gray-200 hover:border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="640x480">
                  <div className="flex items-center justify-between w-full">
                    <span>640×480</span>
                    <Badge variant="outline" className="ml-2 text-xs">Basic</Badge>
                  </div>
                </SelectItem>
                <SelectItem value="1280x720">
                  <div className="flex items-center justify-between w-full">
                    <span>1280×720</span>
                    <Badge variant="outline" className="ml-2 text-xs bg-blue-50 text-blue-700">HD</Badge>
                  </div>
                </SelectItem>
                <SelectItem value="1920x1080">
                  <div className="flex items-center justify-between w-full">
                    <span>1920×1080</span>
                    <Badge variant="outline" className="ml-2 text-xs bg-purple-50 text-purple-700">Full HD</Badge>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Frame Rate */}
          <div className="space-y-3">
            <Label htmlFor="fps" className="text-sm font-medium text-gray-700">Frame Rate</Label>
            <Select value={String(selectedFps)} onValueChange={(value) => onFpsChange(Number(value))}>
              <SelectTrigger id="fps" className="h-11 border-gray-200 hover:border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">
                  <div className="flex items-center justify-between w-full">
                    <span>15 FPS</span>
                    <Badge variant="outline" className="ml-2 text-xs">Basic</Badge>
                  </div>
                </SelectItem>
                <SelectItem value="24">
                  <div className="flex items-center justify-between w-full">
                    <span>24 FPS</span>
                    <Badge variant="outline" className="ml-2 text-xs bg-orange-50 text-orange-700">Cinema</Badge>
                  </div>
                </SelectItem>
                <SelectItem value="30">
                  <div className="flex items-center justify-between w-full">
                    <span>30 FPS</span>
                    <Badge variant="outline" className="ml-2 text-xs bg-green-50 text-green-700">Standard</Badge>
                  </div>
                </SelectItem>
                <SelectItem value="60">
                  <div className="flex items-center justify-between w-full">
                    <span>60 FPS</span>
                    <Badge variant="outline" className="ml-2 text-xs bg-purple-50 text-purple-700">⚡ Performance</Badge>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-100">
          <Button
            variant="outline"
            onClick={onRefreshDevices}
            className="flex items-center gap-2 h-11 px-6 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh Devices
          </Button>

          <div className="flex gap-3 flex-1">
            <Button
              onClick={onStartCamera}
              disabled={!selectedDeviceId}
              className="flex items-center gap-2 h-11 px-6 bg-blue-600 hover:bg-blue-700 text-white flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m-9-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Start Camera
            </Button>

            <Button
              variant="destructive"
              onClick={onStopCamera}
              disabled={!isActive}
              className="flex items-center gap-2 h-11 px-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9l6 6m0-6l-6 6" />
              </svg>
              Stop
            </Button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium text-red-800">Error</span>
            </div>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        )}

        {/* Status Panel */}
        {isActive && currentSettings ? (
          <div className="bg-white/70 backdrop-blur-lg border border-emerald-200/50 rounded-xl p-5">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="font-medium text-slate-700">Camera Active</span>
                  </div>
                  <div className="text-slate-600 font-mono text-sm">
                    {currentSettings.width}×{currentSettings.height}
                  </div>
                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200">
                    {Math.round(currentSettings.frameRate)} FPS
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white/50 backdrop-blur-lg border border-slate-200/50 rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 bg-slate-400 rounded-full"></div>
              <span className="text-slate-600 font-medium">Camera Inactive</span>
              <span className="text-slate-500 text-sm">Click &quot;Start Camera&quot; to begin</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
