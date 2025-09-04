import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getAngleRanges, getAngleStatus, getIndicatorPosition } from '@/lib/angle-ranges'
import type { BikeType } from '@/types/bikefit'

interface AngleIndicatorProps {
  angleName: string
  value: number
  bikeType: BikeType
}

interface AngleTableProps {
  angles: Record<string, number | null>
  bikeType: BikeType
  className?: string
}

/**
 * Angle indicator component with modern design
 */
function AngleIndicator({ angleName, value, bikeType, isDisabled = false }: AngleIndicatorProps & { isDisabled?: boolean }) {
  const ranges = getAngleRanges(bikeType)
  const range = ranges[angleName]
  const position = getIndicatorPosition(bikeType, angleName, value || 0)
  const status = isDisabled ? 'extreme' : getAngleStatus(bikeType, angleName, value || 0)

  if (!range) return null

  return (
    <div className={`transition-all duration-300 ${isDisabled ? 'opacity-40' : ''}`}>
      {/* Header with value and status */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* Status dot */}
          <div className={`w-3 h-3 rounded-full ${
            isDisabled ? 'bg-gray-300' :
            status === 'optimal' ? 'bg-emerald-500 shadow-emerald-200 shadow-lg' :
            status === 'warning' ? 'bg-amber-500 shadow-amber-200 shadow-lg' :
            'bg-red-500 shadow-red-200 shadow-lg'
          }`} />

          {/* Angle value with modern typography */}
          <div className={`font-mono text-xl font-bold tracking-tight ${
            isDisabled ? 'text-gray-400' :
            status === 'optimal' ? 'text-emerald-700' :
            status === 'warning' ? 'text-amber-700' :
            'text-red-700'
          }`}>
            {isDisabled ? '--°' : `${value!.toFixed(0)}°`}
          </div>
        </div>

        {/* Range info */}
        <div className="text-right">
          <div className="text-xs font-medium text-gray-600">
            {range.optimal.min}° - {range.optimal.max}°
          </div>
          <div className="text-xs text-gray-400 uppercase tracking-wide">
            óptimo
          </div>
        </div>
      </div>

      {/* Modern progress bar */}
      <div className="relative">
        {/* Background track */}
        <div className="h-4 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full shadow-inner overflow-hidden border border-gray-200/50">
          {/* Gradient zones */}
          {(() => {
            const totalRange = range.max - range.min
            const extremeLeftWidth = ((range.optimal.min - range.min) / totalRange) * 100
            const optimalWidth = ((range.optimal.max - range.optimal.min) / totalRange) * 100
            const extremeRightWidth = ((range.max - range.optimal.max) / totalRange) * 100

            // Create smooth gradients for zones
            const warningZoneSize = 0.3
            const redLeftWidth = extremeLeftWidth * (1 - warningZoneSize)
            const yellowLeftWidth = extremeLeftWidth * warningZoneSize
            const yellowRightWidth = extremeRightWidth * warningZoneSize
            const redRightWidth = extremeRightWidth * (1 - warningZoneSize)

            return (
              <div className="flex h-full">
                {/* Extreme left (red to orange gradient) */}
                <div
                  className={isDisabled ? "bg-gray-300" : "bg-gradient-to-r from-red-500 to-red-400"}
                  style={{ width: `${redLeftWidth}%` }}
                />
                {/* Warning left (orange to yellow gradient) */}
                <div
                  className={isDisabled ? "bg-gray-350" : "bg-gradient-to-r from-red-400 to-amber-400"}
                  style={{ width: `${yellowLeftWidth}%` }}
                />
                {/* Optimal range (green gradient) */}
                <div
                  className={isDisabled ? "bg-gray-400" : "bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-400"}
                  style={{ width: `${optimalWidth}%` }}
                />
                {/* Warning right (yellow to orange gradient) */}
                <div
                  className={isDisabled ? "bg-gray-350" : "bg-gradient-to-r from-amber-400 to-red-400"}
                  style={{ width: `${yellowRightWidth}%` }}
                />
                {/* Extreme right (orange to red gradient) */}
                <div
                  className={isDisabled ? "bg-gray-300" : "bg-gradient-to-r from-red-400 to-red-500"}
                  style={{ width: `${redRightWidth}%` }}
                />
              </div>
            )
          })()}
        </div>

        {/* Modern indicator */}
        {!isDisabled && (
          <>
            {/* Glow effect */}
            <div
              className={`absolute top-1/2 w-1 h-8 rounded-full transform -translate-y-1/2 -translate-x-1/2 z-10 ${
                status === 'optimal' ? 'bg-emerald-400/30 blur-sm' :
                status === 'warning' ? 'bg-amber-400/30 blur-sm' :
                'bg-red-400/30 blur-sm'
              }`}
              style={{ left: `${position}%` }}
            />
            {/* Main indicator */}
            <div
              className={`absolute top-1/2 w-1 h-6 rounded-full transform -translate-y-1/2 -translate-x-1/2 z-20 shadow-lg border-2 border-white ${
                status === 'optimal' ? 'bg-emerald-600' :
                status === 'warning' ? 'bg-amber-600' :
                'bg-red-600'
              }`}
              style={{ left: `${position}%` }}
            />
          </>
        )}
      </div>
    </div>
  )
}

/**
 * Table component showing all detected angles in real-time
 */
export default function AngleTable({ angles, bikeType, className = '' }: AngleTableProps) {
  // Define all possible angles that we want to show
  const allAngles = ['knee', 'hip', 'ankle', 'shoulder', 'elbow']

  // Map to display names
  const displayNames = {
    knee: 'Rodilla',
    hip: 'Cadera',
    ankle: 'Tobillo',
    shoulder: 'Hombro',
    elbow: 'Codo'
  }

  // Count detected angles - using the same logic as in the render
  const detectedCount = allAngles.filter(angleName => {
    const value = angles[angleName]
    return value !== null && value !== undefined && typeof value === 'number' && value > 0
  }).length

  return (
    <Card className={`${className} bg-gradient-to-br from-white to-gray-50/50 border border-gray-200/60 shadow-xl backdrop-blur-sm`}>
      <CardHeader className="pb-6 border-b border-gray-100">
        <CardTitle className="text-xl font-bold flex items-center gap-3 text-gray-800">
          <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
          Análisis de Ángulos
          <Badge
            variant="secondary"
            className={`text-xs font-medium px-3 py-1 ${
              detectedCount === allAngles.length
                ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                : detectedCount > 0
                ? 'bg-amber-100 text-amber-800 border-amber-200'
                : 'bg-gray-100 text-gray-600 border-gray-200'
            }`}
          >
            {detectedCount} de {allAngles.length} detectados
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        {/* Grid layout for 2 columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {allAngles.map((angleName) => {
            const value = angles[angleName]
            const isDetected = value !== null && value !== undefined && typeof value === 'number' && value > 0
            const displayName = displayNames[angleName as keyof typeof displayNames] || angleName

            return (
              <div key={angleName} className={`p-4 rounded-xl transition-all duration-300 ${
                isDetected
                  ? 'bg-white border border-gray-200/80 shadow-sm hover:shadow-md'
                  : 'bg-gray-50 border border-gray-200/50'
              }`}>
                {/* Header with name and status */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-base font-semibold ${
                    !isDetected ? 'text-gray-500' : 'text-gray-800'
                  }`}>
                    {displayName}
                  </h3>

                  {isDetected ? (
                    <Badge
                      variant={(() => {
                        const status = getAngleStatus(bikeType, angleName, value!)
                        return status === 'optimal' ? 'default' : status === 'warning' ? 'secondary' : 'destructive'
                      })()}
                      className="text-xs font-medium px-2 py-1"
                    >
                      {(() => {
                        const status = getAngleStatus(bikeType, angleName, value!)
                        return status === 'optimal' ? '✓ Óptimo' : status === 'warning' ? '⚠ Advertencia' : '⚠ Extremo'
                      })()}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs text-gray-400 font-medium px-2 py-1">
                      · No detectado
                    </Badge>
                  )}
                </div>

                {/* Angle indicator */}
                <AngleIndicator
                  angleName={angleName}
                  value={isDetected ? value! : 0}
                  bikeType={bikeType}
                  isDisabled={!isDetected}
                />
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
