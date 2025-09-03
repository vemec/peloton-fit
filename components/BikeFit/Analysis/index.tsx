import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import type { BikeType, DetectedSide } from '@/types/bikefit'

interface BikeFitAnalysisConfigProps {
  bikeType: BikeType
  detectedSide: DetectedSide
  onBikeTypeChange: (bikeType: BikeType) => void
}

export default function BikeFitAnalysisConfig({
  bikeType,
  detectedSide,
  onBikeTypeChange
}: BikeFitAnalysisConfigProps) {
  return (
    <Card className="bg-white/70 backdrop-blur-lg border border-emerald-200/50">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-slate-700">
          🔬 Analysis Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Bike Type Selection */}
          <div className="space-y-3">
            <Label htmlFor="bikeType" className="text-slate-700 font-medium">Bike Type</Label>
            <Select value={bikeType} onValueChange={(value: BikeType) => onBikeTypeChange(value)}>
              <SelectTrigger id="bikeType" className="border-emerald-200/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="road">🚴 Road Bike</SelectItem>
                <SelectItem value="triathlon">🏊 Triathlon/TT</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-500">
              {bikeType === 'road'
                ? 'Optimized for comfort & power delivery'
                : 'Optimized for aerodynamics & speed'
              }
            </p>
          </div>

          {/* Detection Status */}
          <div className="space-y-3">
            <Label className="text-slate-700 font-medium">Pose Detection</Label>
            <div className="bg-emerald-50/50 border border-emerald-200/60 rounded-lg p-3">
              {detectedSide ? (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200">
                    ✅ Detecting
                  </Badge>
                  <span className="text-slate-700 font-medium">
                    {detectedSide === 'right' ? 'Right Side' : 'Left Side'} Profile
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-orange-600 border-orange-200 hover:bg-orange-50">
                    ⚠️ No Detection
                  </Badge>
                  <span className="text-slate-600">Position yourself in profile view</span>
                </div>
              )}
            </div>
            <p className="text-xs text-slate-500">
              Stand sideways to the camera in your cycling position
            </p>
          </div>
        </div>

        {/* Bike Type Information Card */}
        <div className="bg-white/70 backdrop-blur-lg border border-blue-200/50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-3xl">
                {bikeType === 'road' ? '🚴' : '🏊'}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-700">
                  {bikeType === 'road' ? 'Road Bike Fit Analysis' : 'Triathlon/TT Fit Analysis'}
                </h3>
                <p className="text-sm text-slate-600">
                  {bikeType === 'road'
                    ? 'Optimized for comfort, power delivery, and endurance riding'
                    : 'Optimized for aerodynamics, speed, and smooth run transition'
                  }
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="text-xs font-mono bg-blue-100 text-blue-700">
              {bikeType.toUpperCase()}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
