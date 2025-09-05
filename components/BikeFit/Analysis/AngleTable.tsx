import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import AngleCard from './AngleCard'
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
          {allAngles.map((angleName) => (
            <AngleCard
              key={angleName}
              angleName={angleName}
              value={angles[angleName]}
              bikeType={bikeType}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
