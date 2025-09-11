import React from 'react'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import AngleCard from './AngleCard'
import type { BikeType } from '@/types/bikefit'

interface AngleTableProps {
  angles: Record<string, number | null>
  bikeType: BikeType
}

/**
 * Table component showing all detected angles in real-time
 */
export default function AngleTable({ angles, bikeType }: AngleTableProps) {
  // Define all possible angles that we want to show
  const allAngles = ['knee', 'hip', 'ankle', 'shoulder', 'elbow']

  // Count detected angles - using the same logic as in the render
  const detectedCount = allAngles.filter(angleName => {
    const value = angles[angleName]
    return value !== null && value !== undefined && typeof value === 'number' && value > 0
  }).length

  return (
    <div className='w-full max-w-7xl mx-auto grid gap-3'>
      <div className="text-xl font-bold flex items-center gap-3 text-gray-800">
        <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
        Angle Analysis
        <Badge
          variant="secondary"
          className={cn(
            "text-xs font-medium px-3 py-1",
            detectedCount === allAngles.length
              ? "bg-emerald-100 text-emerald-800 border-emerald-200"
              : detectedCount > 0
              ? "bg-amber-100 text-amber-800 border-amber-200"
              : "bg-gray-100 text-gray-600 border-gray-200"
          )}
        >
          {detectedCount} of {allAngles.length} detected
        </Badge>
      </div>
      {/* Grid layout for 2 columns */}
      <div className="grid grid-cols-2 gap-2">
        {allAngles.map((angleName) => (
          <AngleCard
            key={angleName}
            angleName={angleName}
            value={angles[angleName]}
            bikeType={bikeType}
          />
        ))}
      </div>
    </div>
  )
}
