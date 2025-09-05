import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getAngleStatus } from '@/lib/angle-ranges'
import { AdvancedAngleIndicator } from './AdvancedAngleIndicator'
import type { BikeType } from '@/types/bikefit'

interface AngleTableProps {
  angles: Record<string, number | null>
  bikeType: BikeType
  className?: string
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
                <AdvancedAngleIndicator
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
